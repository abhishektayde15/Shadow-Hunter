import Phaser from 'phaser';
import { tacticalAudio } from '../../audio/TacticalAudio';
import type { MissionConfig } from '../../types/mission';
import type { PlayerTelemetry } from '../../types/soldier';
import type { BulletConfig, WeaponId, WeaponStats } from '../../types/weapons';
import { EnemySoldier } from '../entities/EnemySoldier';
import { InteractiveObject } from '../entities/InteractiveObject';
import { PlayerSoldier } from '../entities/PlayerSoldier';
import { TacticalVehicle } from '../entities/TacticalVehicle';
import { HelicopterEntity } from '../entities/HelicopterEntity';
import { MapArchitect } from '../world/MapArchitect';

export class MissionScene extends Phaser.Scene {
  public player!: PlayerSoldier;
  public missionConfig!: MissionConfig;
  public obstacles!: Phaser.Physics.Arcade.StaticGroup;
  public enemies: EnemySoldier[] = [];
  public interactives: InteractiveObject[] = [];
  public vehicles: TacticalVehicle[] = [];
  public activeVehicle: TacticalVehicle | null = null;
  public bullets!: Phaser.Physics.Arcade.Group;
  public extractionLZ!: InteractiveObject;
  public rescueHelicopter!: HelicopterEntity;

  // Input
  public cursors!: {
    w: Phaser.Input.Keyboard.Key;
    a: Phaser.Input.Keyboard.Key;
    s: Phaser.Input.Keyboard.Key;
    d: Phaser.Input.Keyboard.Key;
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
    shift: Phaser.Input.Keyboard.Key;
    r: Phaser.Input.Keyboard.Key;
    e: Phaser.Input.Keyboard.Key;
    f: Phaser.Input.Keyboard.Key;
    space: Phaser.Input.Keyboard.Key;
    h: Phaser.Input.Keyboard.Key;
    m: Phaser.Input.Keyboard.Key;
    one: Phaser.Input.Keyboard.Key;
    two: Phaser.Input.Keyboard.Key;
    three: Phaser.Input.Keyboard.Key;
    four: Phaser.Input.Keyboard.Key;
  };

  // Holographic Navigation Indicator
  public navArrowGraphics!: Phaser.GameObjects.Graphics;
  public navPulseTimer = 0;

  // Virtual Mobile Inputs
  public virtualMove = { x: 0, y: 0 };
  public virtualAim: { x: number; y: number } | null = null;
  public virtualFiring = false;

  // Combat & Stats
  public killsCount = 0;
  public missionTimer = 0;
  public extractionTimer = 0;
  public extractionDuration = 5.0; // 5 seconds extraction hold
  public isMissionOver = false;

  // Callbacks
  private onTelemetry?: (telemetry: PlayerTelemetry) => void;
  private onMissionSuccess?: (timeSecs: number, kills: number) => void;
  private onMissionFail?: (reason: string) => void;
  private onToggleMap?: () => void;
  private telemetryTimer = 0;

  constructor() {
    super('MissionScene');
  }

  public init(data?: {
    mission: MissionConfig;
    onTelemetry?: (telemetry: PlayerTelemetry) => void;
    onMissionSuccess?: (timeSecs: number, kills: number) => void;
    onMissionFail?: (reason: string) => void;
    onToggleMap?: () => void;
  }): void {
    const initData = data || this.game.registry.get('missionInitData');
    if (!initData) return;

    this.missionConfig = initData.mission;
    this.onTelemetry = initData.onTelemetry;
    this.onMissionSuccess = initData.onMissionSuccess;
    this.onMissionFail = initData.onMissionFail;
    this.onToggleMap = initData.onToggleMap;

    this.killsCount = 0;
    this.missionTimer = 0;
    this.extractionTimer = 0;
    this.isMissionOver = false;
    this.enemies = [];
    this.interactives = [];
    this.vehicles = [];
    this.activeVehicle = null;
  }

  create(): void {
    if (!this.missionConfig) {
      const initData = this.game.registry.get('missionInitData');
      if (initData) {
        this.init(initData);
      }
    }
    const { mapWidth, mapHeight, playerSpawn } = this.missionConfig;

    // 1. World Bounds & Physics Setup
    this.physics.world.setBounds(0, 0, mapWidth, mapHeight);

    // 2. Static Obstacles Group
    this.obstacles = this.physics.add.staticGroup();

    // 3. Build Level via MapArchitect
    const { extractionLZ } = MapArchitect.buildWorld(
      this,
      this.missionConfig,
      this.obstacles,
      this.enemies,
      this.interactives,
      this.vehicles
    );
    this.extractionLZ = extractionLZ;

    // Rescue Helicopter Entity at Helipad
    this.rescueHelicopter = new HelicopterEntity(
      this,
      this.missionConfig.extractionPoint.x,
      this.missionConfig.extractionPoint.y
    );

    // 4. Create Player
    this.player = new PlayerSoldier(this, playerSpawn.x, playerSpawn.y);

    // 5. Projectiles Group
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet_player',
      maxSize: 150,
    });

    // 6. Camera Setup
    this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

    // 7. Physics Colliders
    this.physics.add.collider(this.player, this.obstacles);
    this.physics.add.collider(this.vehicles, this.obstacles);
    this.physics.add.collider(this.player, this.vehicles);

    this.enemies.forEach((e) => {
      this.physics.add.collider(e, this.obstacles);
      this.physics.add.collider(e, this.player);
      this.physics.add.collider(e, this.vehicles);
    });

    // Bullets vs Vehicles (Armor absorbs hostile gunfire)
    this.physics.add.overlap(this.bullets, this.vehicles, (vehObj, bulletObj) => {
      const b = bulletObj as Phaser.Physics.Arcade.Sprite & { isEnemy?: boolean; damage?: number };
      const v = vehObj as TacticalVehicle;
      if (b.isEnemy && v.active) {
        b.destroy();
        v.takeVehicleDamage(b.damage || 15);
      }
    });

    // Bullets vs Obstacles
    this.physics.add.collider(this.bullets, this.obstacles, (bulletObj) => {
      bulletObj.destroy();
    });

    // Bullets vs Enemies / Player
    this.physics.add.overlap(this.bullets, this.player, (playerObj, bulletObj) => {
      const b = bulletObj as Phaser.Physics.Arcade.Sprite & { isEnemy?: boolean; damage?: number };
      if (b.isEnemy) {
        b.destroy();
        this.cameras.main.shake(150, 0.015);
        const died = this.player.takeDamage(b.damage || 15);
        if (died) this.handlePlayerKIA();
      }
    });

    this.enemies.forEach((enemy) => {
      this.physics.add.overlap(this.bullets, enemy, (enemyObj, bulletObj) => {
        const b = bulletObj as Phaser.Physics.Arcade.Sprite & { isEnemy?: boolean; damage?: number };
        const e = enemyObj as EnemySoldier;
        if (!b.isEnemy && e.isAlive) {
          b.destroy();
          const killed = e.takeDamage(b.damage || 25);
          if (killed) {
            this.killsCount++;
            // Check objectives
            this.checkObjectiveProgress('eliminate_target');
          }
        }
      });
    });

    // Interactives Overlap
    this.physics.add.overlap(this.player, this.interactives, (playerObj, itemObj) => {
      const item = itemObj as InteractiveObject;
      if (item.objectType === 'medkit' && item.active) {
        this.player.addHealth(35);
        item.destroy();
      } else if (item.objectType === 'ammo' && item.active) {
        this.player.addAmmo(30);
        item.destroy();
      }
    });

    // 8. Keyboard Controls Setup
    this.setupKeyboardInputs();

    // 9. Holographic Navigation Indicator Graphics
    this.navArrowGraphics = this.add.graphics();
    this.navArrowGraphics.setDepth(25);

    // 10. Mouse Aim, Click-To-Move & Shoot Listeners
    this.input.mouse?.disableContextMenu();

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);

      if (pointer.rightButtonDown()) {
        // Right-Click to move anywhere
        this.player.setMoveTarget(worldPoint.x, worldPoint.y);
        this.showMoveTargetPing(worldPoint.x, worldPoint.y);
      } else if (pointer.leftButtonDown()) {
        const distToPlayer = Phaser.Math.Distance.Between(
          this.player.x,
          this.player.y,
          worldPoint.x,
          worldPoint.y
        );

        // If player clicked directly on themselves, treat as walk forward
        if (distToPlayer < 45) {
          const fx = this.player.x + Math.cos(this.player.aimAngle) * 140;
          const fy = this.player.y + Math.sin(this.player.aimAngle) * 140;
          this.player.setMoveTarget(fx, fy);
          this.showMoveTargetPing(fx, fy);
        } else {
          this.shootPlayerWeapon();
        }
      }
    });

    // Start background ambience
    tacticalAudio.startTacticalAmbience();

    // Emit initial telemetry immediately so HUD renders right away
    this.emitTelemetry();
  }

  private setupKeyboardInputs(): void {
    if (!this.input.keyboard) return;
    this.cursors = {
      w: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      a: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      s: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      d: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
      shift: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT),
      r: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R),
      e: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
      f: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F),
      space: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      h: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.H),
      m: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M),
      one: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
      two: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
      three: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE),
      four: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR),
    };

    // Hotkey bindings
    this.cursors.r.on('down', () => this.player.startReload());
    this.cursors.one.on('down', () => this.player.switchWeapon(0));
    this.cursors.two.on('down', () => this.player.switchWeapon(1));
    this.cursors.three.on('down', () => this.player.switchWeapon(2));
    this.cursors.four.on('down', () => this.player.switchWeapon(3));
    this.cursors.m.on('down', () => {
      if (this.onToggleMap) this.onToggleMap();
    });
    this.cursors.e.on('down', () => this.handleInteract());
    this.cursors.f.on('down', () => this.handleInteract());
    this.cursors.h.on('down', () => {
      if (this.activeVehicle) tacticalAudio.playVehicleHorn();
    });
  }

  update(time: number, delta: number): void {
    if (this.isMissionOver) return;
    const dt = delta / 1000;
    this.missionTimer += dt;

    // 1. Process Movement Inputs (WASD + Arrow Keys)
    let moveX = 0;
    let moveY = 0;
    let sprint = false;

    if (this.cursors) {
      if (this.cursors.w.isDown || this.cursors.up.isDown) moveY -= 1;
      if (this.cursors.s.isDown || this.cursors.down.isDown) moveY += 1;
      if (this.cursors.a.isDown || this.cursors.left.isDown) moveX -= 1;
      if (this.cursors.d.isDown || this.cursors.right.isDown) moveX += 1;
      sprint = this.cursors.shift.isDown;
    }

    // Continuous steer while holding right mouse button
    if (this.input.activePointer.rightButtonDown()) {
      const worldPoint = this.cameras.main.getWorldPoint(this.input.x, this.input.y);
      this.player.setMoveTarget(worldPoint.x, worldPoint.y);
    }

    // Mobile Virtual Joystick Override
    if (Math.hypot(this.virtualMove.x, this.virtualMove.y) > 0.1) {
      moveX = this.virtualMove.x;
      moveY = this.virtualMove.y;
    }

    // 2. Mouse / Touch Aim World Target
    let aimTarget = { x: 0, y: 0 };
    const curEntity = this.activeVehicle || this.player;
    if (this.virtualAim) {
      aimTarget = {
        x: curEntity.x + this.virtualAim.x * 200,
        y: curEntity.y + this.virtualAim.y * 200,
      };
    } else {
      const worldPoint = this.cameras.main.getWorldPoint(this.input.x, this.input.y);
      aimTarget = { x: worldPoint.x, y: worldPoint.y };
    }

    const isFiring =
      (this.input.activePointer.isDown || this.virtualFiring) &&
      !this.input.activePointer.rightButtonDown();

    const isHandbrake = !!(this.cursors?.space?.isDown);

    if (this.activeVehicle) {
      // VEHICLE DRIVING MODE (GTA Vice City Style!)
      this.activeVehicle.updateVehicle(
        dt,
        { moveX, moveY, isHandbrake },
        aimTarget,
        isFiring,
        (bullet) => this.spawnBullet(bullet)
      );

      // Check Roadkill / Ramming against all living enemies
      for (const enemy of this.enemies) {
        if (enemy.isAlive) {
          const dist = Phaser.Math.Distance.Between(this.activeVehicle.x, this.activeVehicle.y, enemy.x, enemy.y);
          if (dist < 55) {
            const killed = this.activeVehicle.checkRoadkill(enemy);
            if (killed) {
              this.killsCount++;
              this.checkObjectiveProgress('eliminate_target');
            }
          }
        }
      }
    } else {
      // FOOT SOLDIER MODE
      this.player.updateSoldier({ x: moveX, y: moveY }, aimTarget, dt, sprint);

      // Continuous Fire for Automatic Weapons (M4 Carbine)
      if (isFiring && this.player.activeWeapon.id === 'rifle') {
        this.shootPlayerWeapon();
      }
    }

    // 3. Update Enemies AI
    for (let i = 0; i < this.enemies.length; i++) {
      const e = this.enemies[i];
      e.updateAI(
        curEntity.x,
        curEntity.y,
        dt,
        (x1, y1, x2, y2) => this.isLineOfSightClear(x1, y1, x2, y2),
        (bullet) => this.spawnBullet(bullet)
      );
    }

    // 4. Update Rescued Hostages & Proximity Auto-Rescue
    for (const item of this.interactives) {
      if (item.isFollowing) {
        item.followTarget(curEntity.x, curEntity.y, dt);
      } else if (!item.isCompleted && item.active) {
        const dist = Phaser.Math.Distance.Between(curEntity.x, curEntity.y, item.x, item.y);
        if (dist < 60) {
          this.handleInteract();
        }
      }
    }

    // 5. Objective Checks
    this.checkReachLocationObjectives();

    // 6. Extraction Zone Check
    this.updateExtraction(dt);

    // Update Rescue Helicopter Animation & Boarding
    this.rescueHelicopter.updateHelicopter(dt, this.player, this.interactives);

    // 7. Update Dynamic Holographic Navigation Pointer
    this.updateNavIndicator(dt);

    // 8. Telemetry updates to React (throttled to 15 FPS)
    this.telemetryTimer += dt;
    if (this.telemetryTimer >= 0.066) {
      this.telemetryTimer = 0;
      this.emitTelemetry();
    }
  }

  public showMoveTargetPing(x: number, y: number): void {
    const ping = this.add.graphics();
    ping.setDepth(15);
    let radius = 6;
    let alpha = 0.95;

    const timer = this.time.addEvent({
      delay: 20,
      repeat: 14,
      callback: () => {
        ping.clear();
        ping.lineStyle(2, 0x00ff88, alpha);
        ping.strokeCircle(x, y, radius);
        ping.lineBetween(x - radius - 4, y, x - radius + 4, y);
        ping.lineBetween(x + radius - 4, y, x + radius + 4, y);
        ping.lineBetween(x, y - radius - 4, x, y - radius + 4);
        ping.lineBetween(x, y + radius - 4, x, y + radius + 4);

        radius += 1.8;
        alpha -= 0.065;

        if (alpha <= 0) {
          ping.destroy();
          timer.remove();
        }
      },
    });
  }

  private updateNavIndicator(dt: number): void {
    if (!this.navArrowGraphics || !this.player || !this.player.isAlive) {
      this.navArrowGraphics?.clear();
      return;
    }

    this.navPulseTimer += dt * 3.5;
    this.navArrowGraphics.clear();

    const activeObj = this.missionConfig.objectives.find((o) => !o.completed);
    if (!activeObj || activeObj.targetX === undefined || activeObj.targetY === undefined) {
      return;
    }

    const tx = activeObj.targetX;
    const ty = activeObj.targetY;
    const curX = this.activeVehicle ? this.activeVehicle.x : this.player.x;
    const curY = this.activeVehicle ? this.activeVehicle.y : this.player.y;
    const angle = Phaser.Math.Angle.Between(curX, curY, tx, ty);

    // Floating direction chevron orbiting around player/vehicle
    const arrowDist = this.activeVehicle ? 68 : 54;
    const ax = curX + Math.cos(angle) * arrowDist;
    const ay = curY + Math.sin(angle) * arrowDist;

    const pulse = 0.75 + Math.sin(this.navPulseTimer) * 0.25;

    // Outer Chevron (Cyan)
    this.navArrowGraphics.lineStyle(3, 0x00f3ff, pulse);
    const arrowSize = 12;
    const leftWing = angle + Math.PI * 0.8;
    const rightWing = angle - Math.PI * 0.8;

    this.navArrowGraphics.beginPath();
    this.navArrowGraphics.moveTo(ax + Math.cos(leftWing) * arrowSize, ay + Math.sin(leftWing) * arrowSize);
    this.navArrowGraphics.lineTo(ax, ay);
    this.navArrowGraphics.lineTo(ax + Math.cos(rightWing) * arrowSize, ay + Math.sin(rightWing) * arrowSize);
    this.navArrowGraphics.strokePath();

    // Inner follower Chevron (Green)
    const backAx = ax - Math.cos(angle) * 7;
    const backAy = ay - Math.sin(angle) * 7;
    this.navArrowGraphics.lineStyle(2, 0x00ff88, pulse * 0.8);
    this.navArrowGraphics.beginPath();
    this.navArrowGraphics.moveTo(backAx + Math.cos(leftWing) * 8, backAy + Math.sin(leftWing) * 8);
    this.navArrowGraphics.lineTo(backAx, backAy);
    this.navArrowGraphics.lineTo(backAx + Math.cos(rightWing) * 8, backAy + Math.sin(rightWing) * 8);
    this.navArrowGraphics.strokePath();

    // Pulsing beacon ground circle at destination
    const beaconRadius = 32 + Math.sin(this.navPulseTimer) * 8;
    this.navArrowGraphics.lineStyle(2, 0x00ff88, 0.7);
    this.navArrowGraphics.strokeCircle(tx, ty, beaconRadius);
    this.navArrowGraphics.fillStyle(0x00ff88, 0.12);
    this.navArrowGraphics.fillCircle(tx, ty, beaconRadius);

    // Glowing diamond at destination center
    this.navArrowGraphics.fillStyle(0x00f3ff, 0.95);
    this.navArrowGraphics.beginPath();
    this.navArrowGraphics.moveTo(tx, ty - 8);
    this.navArrowGraphics.lineTo(tx + 8, ty);
    this.navArrowGraphics.lineTo(tx, ty + 8);
    this.navArrowGraphics.lineTo(tx - 8, ty);
    this.navArrowGraphics.closePath();
    this.navArrowGraphics.fill();
  }

  public shootPlayerWeapon(): void {
    this.player.fire((weapon, angle) => {
      const muzzleX = this.player.x + Math.cos(angle) * 24;
      const muzzleY = this.player.y + Math.sin(angle) * 24;

      this.spawnBullet({
        x: muzzleX,
        y: muzzleY,
        angle,
        speed: weapon.bulletSpeed,
        damage: weapon.damage,
        range: weapon.range,
        color: weapon.color,
        isEnemy: false,
      });

      // Acoustic noise alerts nearby enemies
      for (const e of this.enemies) {
        e.onHeardGunshot(this.player.x, this.player.y, weapon.noiseRadius);
      }

      // Camera recoil kick
      this.cameras.main.shake(60, weapon.recoil * 0.0008);
    });
  }

  private spawnBullet(config: BulletConfig): void {
    const bullet = this.bullets.create(
      config.x,
      config.y,
      config.isEnemy ? 'bullet_enemy' : 'bullet_player'
    ) as Phaser.Physics.Arcade.Sprite & {
      isEnemy?: boolean;
      damage?: number;
      rangeRemaining?: number;
    };

    if (!bullet) return;

    bullet.rotation = config.angle;
    bullet.isEnemy = config.isEnemy;
    bullet.damage = config.damage;
    bullet.rangeRemaining = config.range;

    this.physics.velocityFromRotation(config.angle, config.speed, bullet.body!.velocity);

    // Auto-destroy after range/time
    this.time.delayedCall((config.range / config.speed) * 1000, () => {
      if (bullet.active) bullet.destroy();
    });
  }

  private isLineOfSightClear(x1: number, y1: number, x2: number, y2: number): boolean {
    const line = new Phaser.Geom.Line(x1, y1, x2, y2);
    const obstaclesList = this.obstacles.getChildren();

    for (let i = 0; i < obstaclesList.length; i++) {
      const obs = obstaclesList[i] as Phaser.Physics.Arcade.Sprite;
      const bounds = obs.getBounds();
      if (Phaser.Geom.Intersects.LineToRectangle(line, bounds)) {
        return false; // Line of sight blocked by wall/tree
      }
    }
    return true;
  }

  private checkReachLocationObjectives(): void {
    for (const obj of this.missionConfig.objectives) {
      if (!obj.completed && obj.type === 'reach_location' && obj.targetX && obj.targetY) {
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, obj.targetX, obj.targetY);
        if (dist < 140) {
          obj.completed = true;
          tacticalAudio.playObjectiveCompleted();
        }
      }
    }
  }

  private checkObjectiveProgress(type: string): void {
    for (const obj of this.missionConfig.objectives) {
      if (!obj.completed && obj.type === type) {
        if (type === 'eliminate_target') {
          // Check if key target is dead or required kills met
          const aliveHostiles = this.enemies.filter((e) => e.isAlive).length;
          if (aliveHostiles <= 1) {
            obj.completed = true;
            tacticalAudio.playObjectiveCompleted();
          }
        }
      }
    }
  }

  private handleInteract(): void {
    // 1. If player is currently driving a vehicle, EXIT the vehicle!
    if (this.activeVehicle) {
      const exitPos = this.activeVehicle.exit();
      this.activeVehicle = null;
      if (exitPos) {
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
      }
      return;
    }

    // 2. Check if player is near any vehicle to ENTER it!
    for (const veh of this.vehicles) {
      if (veh.active && !veh.isOccupied) {
        const distToVeh = Phaser.Math.Distance.Between(this.player.x, this.player.y, veh.x, veh.y);
        if (distToVeh < 95) {
          veh.enter(this.player);
          this.activeVehicle = veh;
          this.cameras.main.startFollow(this.activeVehicle, true, 0.08, 0.08);
          return;
        }
      }
    }

    // 3. Check nearby interactives within 90px (hostage, terminal, cache)
    for (const item of this.interactives) {
      if (!item.isCompleted && item.active) {
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, item.x, item.y);
        if (dist < 90) {
          if (item.objectType === 'hostage') {
            item.isCompleted = true;
            item.isFollowing = true;
            tacticalAudio.playObjectiveCompleted();
            // Complete hostage objective
            const obj = this.missionConfig.objectives.find((o) => o.type === 'rescue_hostage');
            if (obj) obj.completed = true;
          } else if (item.objectType === 'terminal') {
            item.isCompleted = true;
            tacticalAudio.playObjectiveCompleted();
            const obj = this.missionConfig.objectives.find((o) => o.type === 'hack_terminal');
            if (obj) obj.completed = true;
          } else if (item.objectType === 'cache') {
            item.isCompleted = true;
            tacticalAudio.playExplosion();
            this.cameras.main.shake(300, 0.02);
            item.destroy();
            const obj = this.missionConfig.objectives.find((o) => o.type === 'destroy_object');
            if (obj) obj.completed = true;
          }
          break;
        }
      }
    }
  }

  private updateExtraction(dt: number): void {
    const allPreRequisitesDone = this.missionConfig.objectives
      .filter((o) => o.type !== 'extract')
      .every((o) => o.completed);

    const checkX = this.activeVehicle ? this.activeVehicle.x : this.player.x;
    const checkY = this.activeVehicle ? this.activeVehicle.y : this.player.y;

    const distToLZ = Phaser.Math.Distance.Between(
      checkX,
      checkY,
      this.missionConfig.extractionPoint.x,
      this.missionConfig.extractionPoint.y
    );

    const isInsideLZ = distToLZ <= this.missionConfig.extractionPoint.radius;

    if (isInsideLZ && allPreRequisitesDone) {
      this.extractionTimer = Math.min(this.extractionDuration, this.extractionTimer + dt);
      tacticalAudio.playHelicopterRotor();

      // Trigger Rescue Helicopter arrival!
      if (this.rescueHelicopter.heliState === 'INACTIVE') {
        this.rescueHelicopter.callRescueHelicopter(() => {
          // Extraction successful!
          this.isMissionOver = true;
          const extractObj = this.missionConfig.objectives.find((o) => o.type === 'extract');
          if (extractObj) extractObj.completed = true;
          tacticalAudio.playObjectiveCompleted();

          if (this.onMissionSuccess) {
            this.onMissionSuccess(Math.round(this.missionTimer), this.killsCount);
          }
        });
      }
    } else {
      if (this.rescueHelicopter.heliState === 'INACTIVE') {
        this.extractionTimer = Math.max(0, this.extractionTimer - dt * 2);
      }
    }
  }

  private handlePlayerKIA(): void {
    this.isMissionOver = true;
    tacticalAudio.stopAmbience();
    if (this.onMissionFail) {
      this.onMissionFail('OPERATOR KILLED IN ACTION');
    }
  }

  private emitTelemetry(): void {
    if (!this.onTelemetry) return;

    // Check if player is driving or near any vehicle or interactive
    let interactPrompt: string | null = null;

    if (this.rescueHelicopter.heliState === 'INCOMING') {
      interactPrompt = '🚁 RESCUE HELICOPTER INBOUND — STAND ON [H] HELIPAD!';
    } else if (this.rescueHelicopter.heliState === 'LANDED' || this.rescueHelicopter.heliState === 'BOARDING') {
      interactPrompt = '🚁 BOARDING HELICOPTER... PREPARING FOR LIFTOFF!';
    } else if (this.rescueHelicopter.heliState === 'TAKEOFF') {
      interactPrompt = '🚁 AIR EXTRACTION COMPLETE! RETURNING TO HQ!';
    } else if (this.activeVehicle) {
      interactPrompt = 'DRIVING JEEP [RAM ENEMIES!] — PRESS [E] OR [F] TO EXIT';
    } else {
      for (const veh of this.vehicles) {
        if (veh.active && !veh.isOccupied) {
          const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, veh.x, veh.y);
          if (d < 95) {
            interactPrompt = 'PRESS [E] OR [F] TO DRIVE COMBAT JEEP';
            break;
          }
        }
      }

      if (!interactPrompt) {
        for (const item of this.interactives) {
          if (!item.isCompleted && item.active) {
            const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, item.x, item.y);
            if (d < 90) {
              if (item.objectType === 'hostage') interactPrompt = 'PRESS [E] TO RESCUE SCIENTIST';
              else if (item.objectType === 'terminal') interactPrompt = 'PRESS [E] TO HACK SECURITY TERMINAL';
              else if (item.objectType === 'cache') interactPrompt = 'PRESS [E] TO PLANT C4 CHARGE';
              break;
            }
          }
        }
      }
    }

    const curPos = this.activeVehicle
      ? { x: this.activeVehicle.x, y: this.activeVehicle.y }
      : { x: this.player.x, y: this.player.y };

    const distToLZ = Phaser.Math.Distance.Between(
      curPos.x,
      curPos.y,
      this.missionConfig.extractionPoint.x,
      this.missionConfig.extractionPoint.y
    );
    const isAtLZ = distToLZ <= this.missionConfig.extractionPoint.radius;

    const detectedEnemies = this.enemies
      .filter((e) => e.isAlive)
      .map((e) => ({
        x: e.x,
        y: e.y,
        alert: e.aiState === 'CHASE' || e.aiState === 'ATTACK',
      }));

    this.onTelemetry({
      health: this.player.health,
      maxHealth: this.player.maxHealth,
      armor: this.player.armor,
      maxArmor: this.player.maxArmor,
      activeWeapon: this.player.activeWeapon,
      weapons: this.player.weapons,
      isReloading: this.player.isReloading,
      reloadProgress: this.player.isReloading
        ? 1.0 - this.player.reloadTimer / this.player.reloadDuration
        : 0,
      kills: this.killsCount,
      objectives: this.missionConfig.objectives,
      missionTime: Math.round(this.missionTimer),
      isAtExtraction: isAtLZ,
      extractionProgress: (this.extractionTimer / this.extractionDuration) * 100,
      extractionRequired: this.missionConfig.objectives
        .filter((o) => o.type !== 'extract')
        .every((o) => o.completed),
      worldPosition: curPos,
      aimAngle: this.activeVehicle ? this.activeVehicle.turretAngle : this.player.rotation,
      interactPrompt,
      detectedEnemies,
      isInVehicle: !!this.activeVehicle,
    });
  }
}
