export type WeaponId = 'pistol' | 'rifle' | 'shotgun' | 'sniper';

export interface WeaponStats {
  id: WeaponId;
  name: string;
  category: 'SIDEARM' | 'ASSAULT' | 'CQC' | 'PRECISION';
  fireRate: number; // shots per second
  magSize: number;
  currentMag: number;
  reserveAmmo: number;
  maxReserve: number;
  damage: number;
  pellets: number;
  spread: number; // radians
  bulletSpeed: number;
  range: number;
  recoil: number;
  noiseRadius: number; // in pixels, alerts enemies within this distance
  reloadTime: number; // in seconds
  isSilenced: boolean;
  color: string;
  description: string;
}

export interface BulletConfig {
  x: number;
  y: number;
  angle: number;
  speed: number;
  damage: number;
  range: number;
  color: string;
  isEnemy: boolean;
  penetrationCount?: number;
}
