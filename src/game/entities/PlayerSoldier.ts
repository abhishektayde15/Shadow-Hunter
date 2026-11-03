import Phaser from 'phaser';
import { tacticalAudio } from '../../audio/TacticalAudio';
import type { WeaponId, WeaponStats } from '../../types/weapons';
import { createDefaultWeapons } from '../weapons/WeaponArsenal';

export class PlayerSoldier extends Phaser.Physics.Arcade.Sprite {
  // Attributes
  public health = 100;
  public maxHealth = 100;
  public armor = 100;
  public maxArmor = 100;
  public baseSpeed = 220;
  public sprintMultiplier = 1.45;
  public isSprinting = false;
  public isAlive = true;

  // Weapons & Inventory
  public weapons: WeaponStats[];
  public activeIndex = 0;
  public fireCooldown = 0;
  public isReloading = false;
  public reloadTimer = 0;
  public reloadDuration = 1.0;
  public recoilOffset = 0;

  // Aiming
  public aimAngle = 0;

  // Click / Right-Click to Move Destination
  public moveToPoint: { x: number; y: number } | null = null;

  // Dynamic Walk Animation & Footsteps
  public walkTimer = 0;
  public footstepTimer = 0;
  public dustTimer = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player_soldier');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Physics body circular configuration
    this.setCircle(18, 6, 6);
    this.setCollideWorldBounds(true);
    this.setDrag(1200, 1200);

    this.weapons = createDefaultWeapons();
  }

  public setMoveTarget(x: number, y: number): void {
    this.moveToPoint = { x, y };
  }

  public clearMoveTarget(): void {
    this.moveToPoint = null;
  }

  public get activeWeapon(): WeaponStats {
    return this.weapons[this.activeIndex];
  }

  public switchWeapon(idx: number): void {
    if (idx >= 0 && idx < this.weapons.length && idx !== this.activeIndex) {
      if (this.isReloading) {
        this.isReloading = false;
        this.reloadTimer = 0;
      }
      this.activeIndex = idx;
      tacticalAudio.playDryFire();
    }
  }

  public switchWeaponById(id: WeaponId): void {
    const idx = this.weapons.findIndex((w) => w.id === id);
    if (idx !== -1) this.switchWeapon(idx);
  }

  public startReload(): boolean {
    const weapon = this.activeWeapon;
    if (this.isReloading) return false;
    if (weapon.currentMag >= weapon.magSize) return false; // Already full
    if (weapon.reserveAmmo <= 0) {
      tacticalAudio.playDryFire();
      return false; // Out of reserve ammo
    }

    this.isReloading = true;
    this.reloadDuration = weapon.reloadTime;
    this.reloadTimer = weapon.reloadTime;
    tacticalAudio.playReload();
    return true;
  }

  public fire(onShootBullet: (weapon: WeaponStats, angle: number) => void): boolean {
    if (!this.isAlive || this.isReloading) return false;

    const weapon = this.activeWeapon;
    if (this.fireCooldown > 0) return false;

    // Check Ammo
    if (weapon.currentMag <= 0) {
      this.startReload();
      return false;
    }

    // Consume Ammo
    weapon.currentMag--;
    this.fireCooldown = 1.0 / weapon.fireRate;
    this.recoilOffset = weapon.recoil;

    // Trigger Gunfire Sound
    tacticalAudio.playGunshot(weapon.id, false);

    // Spawn Projectile(s)
    for (let i = 0; i < weapon.pellets; i++) {
      const spreadOffset = (Math.random() - 0.5) * weapon.spread;
      const shotAngle = this.aimAngle + spreadOffset;
      onShootBullet(weapon, shotAngle);
    }

    return true;
  }

  public takeDamage(amount: number): boolean {
    if (!this.isAlive) return false;

    let remaining = amount;
    // Body armor absorbs 70% of damage
    if (this.armor > 0) {
      const absorb = remaining * 0.7;
      if (this.armor >= absorb) {
        this.armor -= absorb;
        remaining -= absorb;
      } else {
        remaining -= this.armor;
        this.armor = 0;
      }
      tacticalAudio.playHit(true);
    } else {
      tacticalAudio.playHit(false);
    }

    this.health = Math.max(0, this.health - remaining);
    this.setTint(0xff0033);
    this.scene.time.delayedCall(80, () => {
      if (this.active) this.clearTint();
    });

    if (this.health <= 0) {
      this.isAlive = false;
      this.setVelocity(0, 0);
      this.setTint(0x444444);
      return true; // KIA
    }
    return false;
  }

  public addHealth(amount: number): void {
    this.health = Math.min(this.maxHealth, this.health + amount);
    tacticalAudio.playHit(true);
  }

  public addAmmo(amount: number): void {
    for (const w of this.weapons) {
      w.reserveAmmo = Math.min(w.maxReserve, w.reserveAmmo + Math.round(amount * (w.magSize / 15)));
    }
    tacticalAudio.playReload();
  }

  public updateSoldier(
    moveVec: { x: number; y: number },
    targetAim: { x: number; y: number },
    dt: number,
    sprintPressed: boolean
  ): void {
    if (!this.isAlive) return;

    // 1. Aim Tracking
    this.aimAngle = Phaser.Math.Angle.Between(this.x, this.y, targetAim.x, targetAim.y);

    // 2. Movement Logic (Keyboard, Joystick, or Click-to-Move)
    const manualLen = Math.hypot(moveVec.x, moveVec.y);
    let finalMoveVec = { ...moveVec };
    let isSprinting = sprintPressed;

    if (manualLen > 0.05) {
      // Manual input cancels click-to-move
      this.clearMoveTarget();
    } else if (this.moveToPoint) {
      const dx = this.moveToPoint.x - this.x;
      const dy = this.moveToPoint.y - this.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 18) {
        finalMoveVec = { x: dx / dist, y: dy / dist };
        if (dist > 220) isSprinting = true; // Auto-sprint to distant waypoint
      } else {
        this.clearMoveTarget();
        finalMoveVec = { x: 0, y: 0 };
      }
    }

    const len = Math.hypot(finalMoveVec.x, finalMoveVec.y);
    this.isSprinting = isSprinting && len > 0.05;
    const speed = this.baseSpeed * (this.isSprinting ? this.sprintMultiplier : 1.0);

    if (len > 0.05) {
      this.setVelocity((finalMoveVec.x / len) * speed, (finalMoveVec.y / len) * speed);

      // Walk cycle wobble & animation
      this.walkTimer += dt * (this.isSprinting ? 1.4 : 1.0);
      this.footstepTimer += dt;
      this.dustTimer += dt;

      // Realistic tactical shoulder & torso bob
      const wobble = Math.sin(this.walkTimer * 14) * 0.08;
      this.rotation = this.aimAngle + wobble;

      // Scale bounce gives walking compression feel
      const bounce = Math.sin(this.walkTimer * 20) * 0.04;
      this.setScale(1 + bounce, 1 - bounce);

      // Soft boot steps on ground
      const stepInterval = this.isSprinting ? 0.22 : 0.32;
      if (this.footstepTimer >= stepInterval) {
        this.footstepTimer = 0;
        tacticalAudio.playFootstep();
      }

      // Boot dust puff particles
      if (this.dustTimer >= 0.16) {
        this.dustTimer = 0;
        this.spawnBootDust();
      }
    } else {
      this.setVelocity(0, 0);
      this.rotation = this.aimAngle;
      this.setScale(1, 1);
    }

    // 3. Firing Cooldown
    if (this.fireCooldown > 0) {
      this.fireCooldown -= dt;
    }

    // 4. Reload Progress
    if (this.isReloading) {
      this.reloadTimer -= dt;
      if (this.reloadTimer <= 0) {
        // Complete Reload
        const weapon = this.activeWeapon;
        const needed = weapon.magSize - weapon.currentMag;
        const toLoad = Math.min(needed, weapon.reserveAmmo);
        weapon.currentMag += toLoad;
        weapon.reserveAmmo -= toLoad;
        this.isReloading = false;
      }
    }
  }

  private spawnBootDust(): void {
    if (!this.scene) return;
    const backAngle = this.rotation + Math.PI;
    const px = this.x + Math.cos(backAngle) * 12 + (Math.random() - 0.5) * 8;
    const py = this.y + Math.sin(backAngle) * 12 + (Math.random() - 0.5) * 8;

    const dust = this.scene.add.circle(px, py, 3.5, 0x4a5a40, 0.45);
    this.scene.tweens.add({
      targets: dust,
      radius: 7,
      alpha: 0,
      duration: 260,
      ease: 'Power1',
      onComplete: () => dust.destroy(),
    });
  }
}
