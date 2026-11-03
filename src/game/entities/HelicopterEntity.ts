import Phaser from 'phaser';
import { tacticalAudio } from '../../audio/TacticalAudio';
import type { PlayerSoldier } from './PlayerSoldier';
import type { InteractiveObject } from './InteractiveObject';

export type HeliState = 'INACTIVE' | 'INCOMING' | 'LANDED' | 'BOARDING' | 'TAKEOFF' | 'COMPLETED';

export class HelicopterEntity extends Phaser.GameObjects.Container {
  public heliState: HeliState = 'INACTIVE';
  private targetX: number;
  private targetY: number;

  // Sprites
  private shadowSprite: Phaser.GameObjects.Sprite;
  private fuselageSprite: Phaser.GameObjects.Sprite;
  private rotorSprite: Phaser.GameObjects.Sprite;
  private tailRotorSprite: Phaser.GameObjects.Sprite;
  private downwashRing: Phaser.GameObjects.Graphics;

  // Animation values
  private rotorAngle = 0;
  private altitude = 2.0; // 1.0 = landed on ground, >1.0 = in sky
  private flightSpeed = 360;
  private stateTimer = 0;
  private onCompleteCallback?: () => void;

  constructor(scene: Phaser.Scene, targetX: number, targetY: number) {
    // Spawn 750px away off-screen at top-left
    const spawnX = targetX - 600;
    const spawnY = targetY - 600;

    super(scene, spawnX, spawnY);
    this.targetX = targetX;
    this.targetY = targetY;

    scene.add.existing(this);
    this.setDepth(20);

    // 1. Dynamic Ground Shadow (Separate ground object under container)
    this.shadowSprite = scene.add.sprite(spawnX + 30, spawnY + 50, 'helicopter_fuselage');
    this.shadowSprite.setTint(0x000000);
    this.shadowSprite.setAlpha(0.35);
    this.shadowSprite.setDepth(3);

    // 2. Downwash Dust / Wind Ring on ground
    this.downwashRing = scene.add.graphics();
    this.downwashRing.setDepth(4);

    // 3. Fuselage Body
    this.fuselageSprite = scene.add.sprite(0, 0, 'helicopter_fuselage');
    this.add(this.fuselageSprite);

    // 4. Main Spinning Rotor (Centered over cabin)
    this.rotorSprite = scene.add.sprite(-4, 0, 'helicopter_rotor');
    this.add(this.rotorSprite);

    // 5. Tail Rotor (At rear of tail boom)
    this.tailRotorSprite = scene.add.sprite(-58, -6, 'helicopter_tail_rotor');
    this.add(this.tailRotorSprite);

    // Start with container invisible until extraction is triggered
    this.setVisible(false);
    this.shadowSprite.setVisible(false);
  }

  public callRescueHelicopter(onComplete: () => void): void {
    if (this.heliState !== 'INACTIVE') return;

    this.onCompleteCallback = onComplete;
    this.heliState = 'INCOMING';
    this.altitude = 1.9;
    this.stateTimer = 0;

    this.setVisible(true);
    this.shadowSprite.setVisible(true);

    // Orient towards Helipad landing zone
    const heading = Phaser.Math.Angle.Between(this.x, this.y, this.targetX, this.targetY);
    this.rotation = heading;
    this.shadowSprite.rotation = heading;

    tacticalAudio.playHelicopterRotor();
  }

  public updateHelicopter(
    dt: number,
    player: PlayerSoldier,
    hostages: InteractiveObject[]
  ): void {
    if (this.heliState === 'INACTIVE' || this.heliState === 'COMPLETED') return;

    this.stateTimer += dt;

    // 1. Rotor blades spin at high speed continuously
    this.rotorAngle += dt * 42;
    this.rotorSprite.rotation = this.rotorAngle;
    this.tailRotorSprite.rotation = this.rotorAngle * 2.5;

    // Periodic rotor sound thump
    if (Math.random() < 0.28) {
      tacticalAudio.playHelicopterRotor();
    }

    // 2. State Machine Transitions
    switch (this.heliState) {
      case 'INCOMING': {
        // Fly towards LZ
        const dist = Phaser.Math.Distance.Between(this.x, this.y, this.targetX, this.targetY);
        const heading = Phaser.Math.Angle.Between(this.x, this.y, this.targetX, this.targetY);

        if (dist > 12) {
          const moveDist = Math.min(dist, this.flightSpeed * dt);
          this.x += Math.cos(heading) * moveDist;
          this.y += Math.sin(heading) * moveDist;

          // Smoothly descend altitude from 1.9 down to 1.0 (touchdown)
          const totalDist = 850;
          const ratio = Math.max(0, Math.min(1, dist / totalDist));
          this.altitude = 1.0 + ratio * 0.9;
        } else {
          // Touchdown on the 'H' Helipad!
          this.x = this.targetX;
          this.y = this.targetY;
          this.altitude = 1.0;
          this.heliState = 'LANDED';
          this.stateTimer = 0;
          this.scene.cameras.main.shake(120, 0.008);
        }
        break;
      }

      case 'LANDED': {
        // Helicopter is on the ground with spinning rotors waiting for boarding
        if (this.stateTimer > 0.8) {
          this.heliState = 'BOARDING';
          this.stateTimer = 0;

          // Boarding: Hide player and any rescued hostages
          player.setVisible(false);
          if (player.body) player.body.enable = false;

          hostages.forEach((h) => {
            if (h.isFollowing) {
              h.setVisible(false);
              if (h.body) h.body.enable = false;
            }
          });

          tacticalAudio.playObjectiveCompleted();
        }
        break;
      }

      case 'BOARDING': {
        // Doors close, prepare for lift-off
        if (this.stateTimer > 0.9) {
          this.heliState = 'TAKEOFF';
          this.stateTimer = 0;
          // Set flight direction towards top-right
          this.rotation = -Math.PI / 4;
        }
        break;
      }

      case 'TAKEOFF': {
        // Accelerate up and away into the sky!
        const climbSpeed = 420;
        this.x += Math.cos(this.rotation) * climbSpeed * dt;
        this.y += Math.sin(this.rotation) * climbSpeed * dt;

        // Ascend altitude
        this.altitude += dt * 0.95;

        // Once far away off-screen, complete mission!
        if (this.stateTimer > 2.6) {
          this.heliState = 'COMPLETED';
          this.downwashRing.clear();
          if (this.onCompleteCallback) {
            this.onCompleteCallback();
          }
        }
        break;
      }
    }

    // 3. Update Scale based on Altitude (giving true 3D depth perception!)
    this.setScale(this.altitude);

    // 4. Update Ground Shadow (Shadow stays on ground, offsets based on altitude!)
    const shadowOffsetX = 20 * this.altitude;
    const shadowOffsetY = 35 * this.altitude;
    this.shadowSprite.setPosition(this.x + shadowOffsetX, this.y + shadowOffsetY);
    this.shadowSprite.setScale(1.0 / this.altitude);
    this.shadowSprite.rotation = this.rotation;
    this.shadowSprite.setAlpha(Math.max(0.1, 0.45 / this.altitude));

    // 5. Downwash Wind Ring effect on ground
    this.drawDownwash();
  }

  private drawDownwash(): void {
    this.downwashRing.clear();
    if (this.altitude > 1.8) return;

    const intensity = Math.max(0, 1.8 - this.altitude) / 0.8;
    const radius = 64 + Math.sin(this.rotorAngle * 0.8) * 6;

    this.downwashRing.lineStyle(2, 0xffffff, intensity * 0.35);
    this.downwashRing.strokeCircle(this.targetX, this.targetY, radius);

    this.downwashRing.lineStyle(1.5, 0x00ff88, intensity * 0.2);
    this.downwashRing.strokeCircle(this.targetX, this.targetY, radius * 1.35);
  }

  public destroy(fromScene?: boolean): void {
    if (this.shadowSprite) this.shadowSprite.destroy();
    if (this.downwashRing) this.downwashRing.destroy();
    super.destroy(fromScene);
  }
}

