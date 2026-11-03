import React, { useState } from 'react';
import { Play, RotateCcw, Volume2, VolumeX, X } from 'lucide-react';
import { tacticalAudio } from '../audio/TacticalAudio';
import { CampaignStorage, type TacticalSettings } from '../storage/CampaignStorage';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onAbortToMenu: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onAbortToMenu,
}) => {
  const [settings, setSettings] = useState<TacticalSettings>(CampaignStorage.getSettings());

  const handleSfxChange = (val: number) => {
    const updated = { ...settings, sfxVolume: val };
    setSettings(updated);
    CampaignStorage.saveSettings(updated);
    tacticalAudio.setVolumes(updated.sfxVolume, updated.musicVolume);
    tacticalAudio.playHit(true);
  };

  const handleMusicChange = (val: number) => {
    const updated = { ...settings, musicVolume: val };
    setSettings(updated);
    CampaignStorage.saveSettings(updated);
    tacticalAudio.setVolumes(updated.sfxVolume, updated.musicVolume);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-window pause-modal">
        <div className="modal-header">
          <h2>TACTICAL SUSPENSION // OPERATIONS PAUSED</h2>
        </div>

        <div className="modal-body">
          <div className="settings-group">
            <h3>AUDIO & COMMS CONFIGURATION</h3>

            <div className="setting-row">
              <label>FIREARMS & SFX VOLUME</label>
              <div className="slider-control">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.sfxVolume}
                  onChange={(e) => handleSfxChange(parseFloat(e.target.value))}
                />
                <span className="slider-val">{Math.round(settings.sfxVolume * 100)}%</span>
              </div>
            </div>

            <div className="setting-row">
              <label>TACTICAL AMBIENCE & RADIO</label>
              <div className="slider-control">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.musicVolume}
                  onChange={(e) => handleMusicChange(parseFloat(e.target.value))}
                />
                <span className="slider-val">{Math.round(settings.musicVolume * 100)}%</span>
              </div>
            </div>
          </div>

          <div className="pause-actions-stack">
            <button className="cyber-btn primary-deploy" onClick={onResume}>
              <Play size={18} />
              <span>RESUME OPERATION</span>
            </button>

            <button className="cyber-btn secondary" onClick={onRestart}>
              <RotateCcw size={18} />
              <span>RESTART OPERATION</span>
            </button>

            <button className="cyber-btn danger" onClick={onAbortToMenu}>
              <X size={18} />
              <span>ABORT TO OPERATIONS HEADQUARTERS</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
