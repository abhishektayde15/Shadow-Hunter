import React, { useState } from 'react';
import { BookOpen, ChevronRight, Play, Settings, Shield, Star, Volume2 } from 'lucide-react';
import { tacticalAudio } from '../audio/TacticalAudio';
import { MISSIONS } from '../game/missions/MissionData';
import { CampaignStorage } from '../storage/CampaignStorage';
import type { MissionConfig, MissionId } from '../types/mission';

interface MainMenuProps {
  onSelectMission: (mission: MissionConfig) => void;
  onOpenManual: () => void;
  onOpenSettings: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onSelectMission,
  onOpenManual,
  onOpenSettings,
}) => {
  const [showMissionSelect, setShowMissionSelect] = useState(false);
  const campaign = CampaignStorage.getCampaign();

  const handleStartMission = (missionId: MissionId) => {
    const mission = MISSIONS[missionId];
    tacticalAudio.init();
    tacticalAudio.playReload();
    onSelectMission(mission);
  };

  return (
    <div className="main-menu-backdrop">
      <div className="cyber-grid-overlay" />
      <div className="cyber-scanlines" />

      <div className="main-menu-content simple-menu">
        {/* Game Title */}
        <div className="title-container">
          <div className="title-subhead">
            <Shield size={16} className="neon-pulse" />
            <span>2D TOP-DOWN TACTICAL SHOOTER</span>
            <Shield size={16} className="neon-pulse" />
          </div>
          <h1 className="game-title">SHADOW HUNTER</h1>
          <p className="simple-tagline">Infiltrate • Complete Objectives • Rescue • Extract</p>
        </div>

        {/* Primary Action Buttons - Simple, Clear & Readable */}
        {!showMissionSelect ? (
          <div className="simple-button-stack">
            {/* 1. Main Play Button */}
            <button
              className="simple-main-btn play-btn"
              onClick={() => handleStartMission('mission_1')}
            >
              <Play size={24} />
              <div className="btn-text-group">
                <span className="btn-main-title">PLAY MISSION 1</span>
                <span className="btn-sub-title">Forest Rescue — Start First Mission</span>
              </div>
              <ChevronRight size={22} className="arrow-icon" />
            </button>

            {/* 2. Select Different Mission */}
            <button
              className="simple-main-btn"
              onClick={() => setShowMissionSelect(true)}
            >
              <div className="btn-text-group">
                <span className="btn-main-title">SELECT MISSION (1 - 4)</span>
                <span className="btn-sub-title">Forest, Military Base, Desert, Urban City</span>
              </div>
              <ChevronRight size={18} />
            </button>

            {/* 3. How to play / Controls */}
            <button className="simple-main-btn" onClick={onOpenManual}>
              <BookOpen size={20} />
              <div className="btn-text-group">
                <span className="btn-main-title">HOW TO PLAY & CONTROLS</span>
                <span className="btn-sub-title">Keys for movement, shooting & reloading</span>
              </div>
            </button>

            {/* 4. Sound Settings */}
            <button className="simple-main-btn" onClick={onOpenSettings}>
              <Volume2 size={20} />
              <div className="btn-text-group">
                <span className="btn-main-title">SOUND SETTINGS</span>
                <span className="btn-sub-title">Adjust gun sound and music volume</span>
              </div>
            </button>
          </div>
        ) : (
          /* Mission Select Sub-List */
          <div className="simple-mission-list">
            <h3 className="section-title">CHOOSE YOUR MISSION:</h3>
            <div className="mission-rows">
              {(Object.keys(MISSIONS) as MissionId[]).map((mId, idx) => {
                const m = MISSIONS[mId];
                const isUnlocked = campaign.unlockedMissions.includes(mId);
                const comp = campaign.completedMissions[mId];

                return (
                  <button
                    key={mId}
                    className={`mission-select-row ${!isUnlocked ? 'locked' : ''}`}
                    onClick={() => isUnlocked && handleStartMission(mId)}
                    disabled={!isUnlocked}
                  >
                    <span className="row-number">0{idx + 1}</span>
                    <div className="row-info">
                      <span className="row-title">{m.title}</span>
                      <span className="row-env">{m.environment.toUpperCase()} ENVIRONMENT</span>
                    </div>
                    {comp ? (
                      <div className="row-stars">
                        {[1, 2, 3].map((s) => (
                          <Star
                            key={s}
                            size={14}
                            fill={s <= comp.stars ? '#ffd700' : 'none'}
                            color={s <= comp.stars ? '#ffd700' : '#555'}
                          />
                        ))}
                      </div>
                    ) : isUnlocked ? (
                      <span className="row-status ready">START</span>
                    ) : (
                      <span className="row-status locked">LOCKED</span>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              className="cyber-btn secondary back-btn"
              onClick={() => setShowMissionSelect(false)}
            >
              ← BACK TO MAIN MENU
            </button>
          </div>
        )}

        <div className="menu-footer">
          <span>Multimedia Systems Lab Project • Production Ready Release</span>
        </div>
      </div>
    </div>
  );
};
