import Phaser from 'phaser';
import { tacticalAudio } from '../../audio/TacticalAudio';
import type { BulletConfig } from '../../types/weapons';
import type { EnemySoldier } from './EnemySoldier';
import type { PlayerSoldier } from './PlayerSoldier';

export class TacticalVehicle extends Phaser.Physics.Arcade.Sprite {
  public isOccupied = false;
  public driver: PlayerSoldier | null = null;

  // Vehicle Stats & Handling (GTA style physics)
  public health = 400;
  public maxHealth = 400;
  public currentSpeed = 0;
  public maxSpeed = 480; // Over 2x faster than infantry sprint!
  public maxReverseSpeed = -180;
  public acceleration = 420;
  public braking = 650;
  public friction = 240;
  public turnSpeed = 2.9;

  // Roof Mounted Turret
  public turretAngle = 0;
  public fireCooldown = 0;
  public fireRate = 0.12; // High rate of fire
  public hornTimer = 0;

  // Visuals & Effects
  private headlightsGraphics: Phaser.GameObjects.Graphics;
  private skidGraphics: Phaser.GameObjects.Graphics;
  private skidTimer = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, angle = 0) {
    super(scene, x, y, 'tactical_jeep');

    this.rotation = angle;
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Physics Hitbox (Jeep dimensions ~52x90)
    this.setSize(52, 90);
    this.setCollideWorldBounds(true);
    this.setDrag(400, 400);
    this.setAngularDrag(600);
    this.setDepth(11);

    // Headlights Beam Graphics
    this.headlightsGraphics = scene.add.graphics();
    this.headlightsGraphics.setDepth(10);

    // Skid Marks Graphics
    this.skidGraphics = scene.add.graphics();
    this.skidGraphics.setDepth(2);
  }

  public enter(player: PlayerSoldier): void {
    this.driver = player;
    this.isOccupied = true;

    // Attach player to vehicle and disable foot collision
    player.setVisible(false);
    if (player.body) {
      player.body.enable = false;
    }
    player.setPosition(this.x, this.y);

    tacticalAudio.playVehicleEnter();
  }

  public exit(): { x: number; y: number } | null {
    if (!this.driver) return null;

    const player = this.driver;
    this.driver = null;
    this.isOccupied = false;

    // Exit slightly to the left door of the Jeep
    const exitAngle = this.rotation - Math.PI / 2;
    const exitX = this.x + Math.cos(exitAngle) * 44;
    const exitY = this.y + Math.sin(exitAngle) * 44;

    player.setPosition(exitX, exitY);
    player.setVisible(true);
    if (player.body) {
      player.body.enable = true;
      player.setVelocity(0, 0);
    }

    // Stop vehicle gradually
    this.currentSpeed = this.currentSpeed * 0.4;
    tacticalAudio.playVehicleEnter();

    return { x: exitX, y: exitY };
  }

  public updateVehicle(
    dt: number,
    inputs: { moveX: number; moveY: number; isHandbrake: boolean },
    aimTarget: { x: number; y: number },
    isFiring: boolean,
    onShootTurretBullet: (bullet: BulletConfig) => void
  ): void {
    // 1. Throttle / Acceleration / Reversing
    const throttle = -inputs.moveY; // W / UP = 1, S / DOWN = -1
    const steer = inputs.moveX; // A / LEFT = -1, D / RIGHT = 1

    if (throttle > 0) {
      // Accelerating Forward
      if (this.currentSpeed < 0) {
        this.currentSpeed += this.braking * dt;
      } else {
        this.currentSpeed = Math.min(this.maxSpeed, this.currentSpeed + this.acceleration * dt);
      }
    } else if (throttle < 0) {
      // Braking / Reversing
      if (this.currentSpeed > 0) {
        this.currentSpeed = Math.max(0, this.currentSpeed - this.braking * dt);
      } else {
        this.currentSpeed = Math.max(this.maxReverseSpeed, this.currentSpeed - this.acceleration * 0.65 * dt);
      }
    } else {
      // Passive rolling friction
      if (this.currentSpeed > 0) {
        this.currentSpeed = Math.max(0, this.currentSpeed - this.friction * dt);
      } else if (this.currentSpeed < 0) {
        this.currentSpeed = Math.min(0, this.currentSpeed + this.friction * dt);
      }
    }

    // Handbrake drift
    if (inputs.isHandbrake) {
      this.currentSpeed = Math.sign(this.currentSpeed) * Math.max(0, Math.abs(this.currentSpeed) - this.braking * 1.5 * dt);
    }

    // 2. Turning Physics (Turns proportionally when moving)
    if (Math.abs(this.currentSpeed) > 10 && steer !== 0) {
      const speedFactor = Math.min(1.0, Math.abs(this.currentSpeed) / 220);
      const reverseMultiplier = this.currentSpeed < 0 ? -1 : 1;
      this.rotation += steer * this.turnSpeed * speedFactor * reverseMultiplier * dt;

      // Tire skid marks when turning at high speed
      if (Math.abs(this.currentSpeed) > 280) {
        this.skidTimer += dt;
        if (this.skidTimer > 0.05) {
          this.skidTimer = 0;
          this.drawTireSkid();
        }
      }
    }

    // 3. Apply Velocity along Jeep's heading
    this.scene.physics.velocityFromRotation(this.rotation, this.currentSpeed, this.body!.velocity);

    // Sync driver's position so objectives and radar follow smoothly
    if (this.driver) {
      this.driver.setPosition(this.x, this.y);
      this.driver.aimAngle = this.turretAngle;
    }

    // 4. Headlights Cone Rendering
    this.drawHeadlights();

    // 5. Roof Turret Aim & Shooting
    this.turretAngle = Phaser.Math.Angle.Between(this.x, this.y, aimTarget.x, aimTarget.y);

    if (this.fireCooldown > 0) {
      this.fireCooldown -= dt;
    }

    if (isFiring && this.fireCooldown <= 0) {
      this.fireCooldown = this.fireRate;
      this.shootTurret(onShootTurretBullet);
    }

    // Sound engine modulation
    if (this.isOccupied && Math.abs(this.currentSpeed) > 20) {
      tacticalAudio.playVehicleEngine(Math.abs(this.currentSpeed) / this.maxSpeed);
    }
  }

  private shootTurret(onShootTurretBullet: (bullet: BulletConfig) => void): void {
    const muzzleOffset = 38;
    const muzzleX = this.x + Math.cos(this.turretAngle) * muzzleOffset;
    const muzzleY = this.y + Math.sin(this.turretAngle) * muzzleOffset;

    // Dual Heavy Machine Gun Bullet
    onShootTurretBullet({
      x: muzzleX,
      y: muzzleY,
      angle: this.turretAngle + (Math.random() - 0.5) * 0.06,
      speed: 1300,
      damage: 45, // Heavy stopping power
      range: 850,
      color: 0xffea00,
      isEnemy: false,
    });

    tacticalAudio.playGunshot('rifle', false);
    this.scene.cameras.main.shake(50, 0.003);
  }

  // GTA Style Roadkill Crush / Ramming Enemies
  public checkRoadkill(enemy: EnemySoldier): boolean {
    if (!enemy.isAlive) return false;

    const speed = Math.abs(this.currentSpeed);
    if (speed < 90) return false;

    // Crush damage proportional to vehicle speed!
    const ramDamage = Math.round(speed * 0.55); // 90 to 260 damage
    const killed = enemy.takeDamage(ramDamage);

    tacticalAudio.playVehicleCrash();
    this.scene.cameras.main.shake(160, 0.015);

    // Slight speed loss on impact
    this.currentSpeed *= 0.85;

    return killed;
  }

  public takeVehicleDamage(amount: number): boolean {
    this.health = Math.max(0, this.health - amount);
    tacticalAudio.playHit(false);

    if (this.health <= 0) {
      // Vehicle destroyed! Force eject driver
      this.exit();
      this.destroyVehicle();
      return true;
    }
    return false;
  }

  private destroyVehicle(): void {
    tacticalAudio.playExplosion();
    this.scene.cameras.main.shake(350, 0.03);
    this.headlightsGraphics.destroy();
    this.skidGraphics.destroy();
    this.destroy();
  }

  private drawHeadlights(): void {
    this.headlightsGraphics.clear();
    if (!this.active) return;

    const frontOffset = 42;
    const beamLength = 260;
    const beamAngleSpread = 0.38;

    // Left and Right headlights positions
    const leftHeadlightX = this.x + Math.cos(this.rotation) * frontOffset + Math.cos(this.rotation - Math.PI / 2) * 16;
    const leftHeadlightY = this.y + Math.sin(this.rotation) * frontOffset + Math.sin(this.rotation - Math.PI / 2) * 16;

    const rightHeadlightX = this.x + Math.cos(this.rotation) * frontOffset + Math.cos(this.rotation + Math.PI / 2) * 16;
    const rightHeadlightY = this.y + Math.sin(this.rotation) * frontOffset + Math.sin(this.rotation + Math.PI / 2) * 16;

    // Light Beam Cones
    const alpha = this.isOccupied ? 0.22 : 0.08;
    this.headlightsGraphics.fillStyle(0xfff7c2, alpha);

    // Left Beam
    this.headlightsGraphics.beginPath();
    this.headlightsGraphics.moveTo(leftHeadlightX, leftHeadlightY);
    this.headlightsGraphics.lineTo(
      leftHeadlightX + Math.cos(this.rotation - beamAngleSpread) * beamLength,
      leftHeadlightY + Math.sin(this.rotation - beamAngleSpread) * beamLength
    );
    this.headlightsGraphics.lineTo(
      leftHeadlightX + Math.cos(this.rotation + beamAngleSpread * 0.4) * beamLength,
      leftHeadlightY + Math.sin(this.rotation + beamAngleSpread * 0.4) * beamLength
    );
    this.headlightsGraphics.closePath();
    this.headlightsGraphics.fill();

    // Right Beam
    this.headlightsGraphics.beginPath();
    this.headlightsGraphics.moveTo(rightHeadlightX, rightHeadlightY);
    this.headlightsGraphics.lineTo(
      rightHeadlightX + Math.cos(this.rotation - beamAngleSpread * 0.4) * beamLength,
      rightHeadlightY + Math.sin(this.rotation - beamAngleSpread * 0.4) * beamLength
    );
    this.headlightsGraphics.lineTo(
      rightHeadlightX + Math.cos(this.rotation + beamAngleSpread) * beamLength,
      rightHeadlightY + Math.sin(this.rotation + beamAngleSpread) * beamLength
    );
    this.headlightsGraphics.closePath();
    this.headlightsGraphics.fill();
  }

  private drawTireSkid(): void {
    const rearOffset = -38;
    const lx = this.x + Math.cos(this.rotation) * rearOffset + Math.cos(this.rotation - Math.PI / 2) * 18;
    const ly = this.y + Math.sin(this.rotation) * rearOffset + Math.sin(this.rotation - Math.PI / 2) * 18;
    const rx = this.x + Math.cos(this.rotation) * rearOffset + Math.cos(this.rotation + Math.PI / 2) * 18;
    const ry = this.y + Math.sin(this.rotation) * rearOffset + Math.sin(this.rotation + Math.PI / 2) * 18;

    this.skidGraphics.fillStyle(0x0a0a0a, 0.35);
    this.skidGraphics.fillCircle(lx, ly, 3);
    this.skidGraphics.fillCircle(rx, ry, 3);
  }

  public destroy(fromScene?: boolean): void {
    if (this.headlightsGraphics) this.headlightsGraphics.destroy();
    if (this.skidGraphics) this.skidGraphics.destroy();
    super.destroy(fromScene);
  }
}

