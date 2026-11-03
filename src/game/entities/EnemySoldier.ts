import Phaser from 'phaser';
import { tacticalAudio } from '../../audio/TacticalAudio';
import type { AIState, EnemyType } from '../../types/soldier';
import type { BulletConfig } from '../../types/weapons';

export class EnemySoldier extends Phaser.Physics.Arcade.Sprite {
  public enemyType: EnemyType;
  public aiState: AIState = 'PATROL';
  public health: number;
  public maxHealth: number;
  public speed: number;
  public damage: number;
  public attackCooldown = 0;
  public attackRate = 1.0;
  public visionDistance = 420;
  public visionFov = Phaser.Math.DegToRad(80);
  public isAlive = true;

  // Patrol
  public waypoints: Array<{ x: number; y: number }> = [];
  public currentWaypointIndex = 0;
  public idleTimer = 0;

  // Suspicious investigation
  public suspiciousTarget: { x: number; y: number } | null = null;
  public investigateTimer = 0;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    type: EnemyType = 'patrol',
    waypoints: Array<{ x: number; y: number }> = []
  ) {
    const textureKey = `enemy_${type}`;
    super(scene, x, y, textureKey);

    this.enemyType = type;
    this.waypoints = waypoints;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Setup attributes based on archetype
    if (type === 'patrol') {
      this.maxHealth = 60;
      this.speed = 130;
      this.damage = 12;
      this.attackRate = 1.2;
      this.setCircle(18, 6, 6);
    } else if (type === 'guard') {
      this.maxHealth = 85;
      this.speed = 90;
      this.damage = 18;
      this.attackRate = 0.9;
      this.setCircle(18, 6, 6);
    } else if (type === 'sniper') {
      this.maxHealth = 50;
      this.speed = 100;
      this.damage = 38;
      this.attackRate = 2.4;
      this.visionDistance = 650;
      this.setCircle(18, 6, 6);
    } else if (type === 'heavy') {
      this.maxHealth = 220;
      this.speed = 65;
      this.damage = 22;
      this.attackRate = 1.4;
      this.setCircle(22, 6, 6);
    } else {
      // Boss
      this.maxHealth = 900;
      this.speed = 85;
      this.damage = 30;
      this.attackRate = 0.8;
      this.visionDistance = 550;
      this.setCircle(26, 6, 6);
    }

    this.health = this.maxHealth;
    this.setCollideWorldBounds(true);
    this.setDrag(1000, 1000);
  }

  public takeDamage(amount: number): boolean {
    if (!this.isAlive) return false;

    this.health = Math.max(0, this.health - amount);
    this.aiState = 'CHASE'; // Instantly alert when shot

    this.setTint(0xff0033);
    this.scene.time.delayedCall(80, () => {
      if (this.active) this.clearTint();
    });

    if (this.health <= 0) {
      this.isAlive = false;
      this.setVelocity(0, 0);
      this.setTint(0x333333);
      this.disableBody(true, false); // disable collision
      tacticalAudio.playHit(false);
      return true; // Neutralized
    }
    return false;
  }

  // React to gunshot sounds
  public onHeardGunshot(noiseX: number, noiseY: number, noiseRadius: number): void {
    if (!this.isAlive || this.aiState === 'CHASE' || this.aiState === 'ATTACK') return;

    const dist = Phaser.Math.Distance.Between(this.x, this.y, noiseX, noiseY);
    if (dist <= noiseRadius) {
      this.aiState = 'SUSPICIOUS';
      this.suspiciousTarget = { x: noiseX, y: noiseY };
      this.investigateTimer = 4.5; // investigate for 4.5s
    }
  }

  public updateAI(
    playerX: number,
    playerY: number,
    dt: number,
    isLineOfSightClear: (x1: number, y1: number, x2: number, y2: number) => boolean,
    onEnemyShoot: (bullet: BulletConfig) => void
  ): void {
    if (!this.isAlive) return;

    if (this.attackCooldown > 0) {
      this.attackCooldown -= dt;
    }

    const distToPlayer = Phaser.Math.Distance.Between(this.x, this.y, playerX, playerY);
    const angleToPlayer = Phaser.Math.Angle.Between(this.x, this.y, playerX, playerY);

    // 1. Vision Cone Detection
    const angleDiff = Math.abs(Phaser.Math.Angle.Wrap(angleToPlayer - this.rotation));
    const isPlayerInFov = distToPlayer < this.visionDistance && angleDiff < this.visionFov;
    const canSeePlayer = isPlayerInFov && isLineOfSightClear(this.x, this.y, playerX, playerY);

    if (canSeePlayer) {
      this.aiState = distToPlayer < 380 ? 'ATTACK' : 'CHASE';
    } else if (this.aiState === 'CHASE' && distToPlayer > this.visionDistance * 1.4) {
      // Lost sight
      this.aiState = 'PATROL';
    }

    // 2. State Actions
    switch (this.aiState) {
      case 'PATROL':
        this.handlePatrol(dt);
        break;

      case 'SUSPICIOUS':
        this.handleSuspicious(dt);
        break;

      case 'CHASE':
        this.rotation = angleToPlayer;
        this.scene.physics.velocityFromRotation(this.rotation, this.speed, this.body!.velocity);
        break;

      case 'ATTACK':
        this.rotation = angleToPlayer;
        // Keep shooting distance
        if (distToPlayer < 200 && this.enemyType !== 'heavy') {
          // Back up slightly
          this.scene.physics.velocityFromRotation(this.rotation, -this.speed * 0.5, this.body!.velocity);
        } else {
          this.setVelocity(0, 0);
        }

        // Fire Projectiles
        if (this.attackCooldown <= 0) {
          this.attackCooldown = this.attackRate;
          tacticalAudio.playGunshot('rifle', true);

          onEnemyShoot({
            x: this.x + Math.cos(this.rotation) * 22,
            y: this.y + Math.sin(this.rotation) * 22,
            angle: this.rotation + (Math.random() - 0.5) * 0.1,
            speed: 650,
            damage: this.damage,
            range: 650,
            color: '#ff003c',
            isEnemy: true,
          });
        }
        break;
    }
  }

  private handlePatrol(dt: number): void {
    if (this.waypoints.length === 0) {
      this.setVelocity(0, 0);
      return;
    }

    const wp = this.waypoints[this.currentWaypointIndex];
    const distToWp = Phaser.Math.Distance.Between(this.x, this.y, wp.x, wp.y);

    if (distToWp < 25) {
      this.setVelocity(0, 0);
      this.idleTimer += dt;
      if (this.idleTimer > 2.0) {
        this.idleTimer = 0;
        this.currentWaypointIndex = (this.currentWaypointIndex + 1) % this.waypoints.length;
      }
    } else {
      const angle = Phaser.Math.Angle.Between(this.x, this.y, wp.x, wp.y);
      this.rotation = Phaser.Math.Angle.RotateTo(this.rotation, angle, 0.08);
      this.scene.physics.velocityFromRotation(this.rotation, this.speed * 0.7, this.body!.velocity);
    }
  }

  private handleSuspicious(dt: number): void {
    if (!this.suspiciousTarget) {
      this.aiState = 'PATROL';
      return;
    }

    const dist = Phaser.Math.Distance.Between(this.x, this.y, this.suspiciousTarget.x, this.suspiciousTarget.y);
    if (dist > 30) {
      const angle = Phaser.Math.Angle.Between(this.x, this.y, this.suspiciousTarget.x, this.suspiciousTarget.y);
      this.rotation = Phaser.Math.Angle.RotateTo(this.rotation, angle, 0.08);
      this.scene.physics.velocityFromRotation(this.rotation, this.speed * 0.9, this.body!.velocity);
    } else {
      this.setVelocity(0, 0);
    }

    this.investigateTimer -= dt;
    if (this.investigateTimer <= 0) {
      this.suspiciousTarget = null;
      this.aiState = 'PATROL';
    }
  }
}
