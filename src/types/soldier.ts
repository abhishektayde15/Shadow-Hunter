import type { Objective } from './mission';
import type { WeaponStats } from './weapons';

export type EnemyType = 'patrol' | 'guard' | 'sniper' | 'heavy' | 'boss';

export type AIState = 'IDLE' | 'PATROL' | 'SUSPICIOUS' | 'CHASE' | 'ATTACK' | 'COVER' | 'DEAD';

export interface PlayerTelemetry {
  health: number;
  maxHealth: number;
  armor: number;
  maxArmor: number;
  activeWeapon: WeaponStats;
  weapons: WeaponStats[];
  isReloading: boolean;
  reloadProgress: number; // 0 to 1
  kills: number;
  objectives: Objective[];
  missionTime: number; // seconds
  isAtExtraction: boolean;
  extractionProgress: number; // 0 to 100%
  extractionRequired: boolean;
  worldPosition: { x: number; y: number };
  aimAngle: number;
  interactPrompt: string | null;
  detectedEnemies: Array<{ x: number; y: number; alert: boolean }>;
  isInVehicle?: boolean;
}
