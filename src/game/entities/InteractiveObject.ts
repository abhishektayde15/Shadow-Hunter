import Phaser from 'phaser';

export type InteractiveType = 'terminal' | 'hostage' | 'cache' | 'medkit' | 'ammo' | 'extraction';

export class InteractiveObject extends Phaser.Physics.Arcade.Sprite {
  public objectType: InteractiveType;
  public isCompleted = false;
  public isFollowing = false; // For rescued hostages

  constructor(scene: Phaser.Scene, x: number, y: number, type: InteractiveType) {
    let texture = 'item_medkit';
    if (type === 'terminal') texture = 'target_terminal';
    else if (type === 'hostage') texture = 'hostage_scientist';
    else if (type === 'cache') texture = 'target_cache';
    else if (type === 'ammo') texture = 'item_ammo';
    else if (type === 'extraction') texture = 'extraction_pad';

    super(scene, x, y, texture);
    this.objectType = type;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    if (type === 'extraction') {
      this.setCircle(80, 10, 10);
      this.setImmovable(true);
    } else if (type === 'terminal' || type === 'cache') {
      this.setImmovable(true);
    } else {
      this.setCircle(14, 0, 0);
    }
  }

  public followTarget(targetX: number, targetY: number, dt: number): void {
    if (!this.isFollowing) return;
    const dist = Phaser.Math.Distance.Between(this.x, this.y, targetX, targetY);
    if (dist > 50) {
      const angle = Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY);
      this.rotation = angle;
      this.scene.physics.velocityFromRotation(angle, 190, this.body!.velocity);
    } else {
      this.setVelocity(0, 0);
    }
  }
}
