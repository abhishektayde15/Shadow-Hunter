export type MissionId = 'mission_1' | 'mission_2' | 'mission_3' | 'mission_4';

export interface Objective {
  id: string;
  description: string;
  completed: boolean;
  required: boolean;
  targetX?: number;
  targetY?: number;
  type: 'reach_location' | 'eliminate_target' | 'rescue_hostage' | 'hack_terminal' | 'destroy_object' | 'extract';
}

export interface MissionConfig {
  id: MissionId;
  title: string;
  codename: string;
  environment: 'forest' | 'base' | 'desert' | 'urban';
  briefing: string;
  difficulty: 'STANDARD' | 'HARD' | 'EXTREME';
  mapWidth: number;
  mapHeight: number;
  playerSpawn: { x: number; y: number };
  extractionPoint: { x: number; y: number; radius: number };
  objectives: Objective[];
  rewards: {
    xp: number;
    credits: number;
  };
}

export interface MissionProgress {
  unlockedMissions: MissionId[];
  completedMissions: Record<MissionId, {
    stars: number;
    bestTime: number; // in seconds
    kills: number;
  }>;
}

export type GameScreen = 'MENU' | 'BRIEFING' | 'PLAYING' | 'PAUSED' | 'MAP' | 'DEBRIEFING';
