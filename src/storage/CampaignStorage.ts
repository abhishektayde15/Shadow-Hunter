import type { MissionId, MissionProgress } from '../types/mission';

const CAMPAIGN_KEY = 'shadow_hunter_campaign';
const SETTINGS_KEY = 'shadow_hunter_settings';

export interface TacticalSettings {
  sfxVolume: number;
  musicVolume: number;
  autoAimTouch: boolean;
  screenShake: boolean;
}

const DEFAULT_CAMPAIGN: MissionProgress = {
  unlockedMissions: ['mission_1'],
  completedMissions: {},
};

const DEFAULT_SETTINGS: TacticalSettings = {
  sfxVolume: 0.8,
  musicVolume: 0.5,
  autoAimTouch: true,
  screenShake: true,
};

export const CampaignStorage = {
  getCampaign(): MissionProgress {
    try {
      const data = localStorage.getItem(CAMPAIGN_KEY);
      if (!data) return DEFAULT_CAMPAIGN;
      return { ...DEFAULT_CAMPAIGN, ...JSON.parse(data) };
    } catch {
      return DEFAULT_CAMPAIGN;
    }
  },

  saveCampaign(progress: MissionProgress): void {
    try {
      localStorage.setItem(CAMPAIGN_KEY, JSON.stringify(progress));
    } catch (e) {
      console.warn('Failed to save campaign:', e);
    }
  },

  completeMission(missionId: MissionId, stars: number, timeSecs: number, kills: number): MissionProgress {
    const campaign = this.getCampaign();
    const existing = campaign.completedMissions[missionId];

    campaign.completedMissions[missionId] = {
      stars: Math.max(stars, existing?.stars || 0),
      bestTime: existing ? Math.min(timeSecs, existing.bestTime) : timeSecs,
      kills: Math.max(kills, existing?.kills || 0),
    };

    // Unlock subsequent mission
    const sequence: MissionId[] = ['mission_1', 'mission_2', 'mission_3', 'mission_4'];
    const curIdx = sequence.indexOf(missionId);
    if (curIdx >= 0 && curIdx < sequence.length - 1) {
      const nextId = sequence[curIdx + 1];
      if (!campaign.unlockedMissions.includes(nextId)) {
        campaign.unlockedMissions.push(nextId);
      }
    }

    this.saveCampaign(campaign);
    return campaign;
  },

  getSettings(): TacticalSettings {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      if (!data) return DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: TacticalSettings): void {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings:', e);
    }
  },
};
