import React from 'react';
import { Award, CheckCircle2, ChevronRight, Clock, RotateCcw, Skull, Star, Trophy, X } from 'lucide-react';
import { tacticalAudio } from '../audio/TacticalAudio';
import type { MissionConfig } from '../types/mission';

interface DebriefingModalProps {
  mission: MissionConfig;
  isSuccess: boolean;
  timeSecs: number;
  kills: number;
  failureReason?: string;
  onRestart: () => void;
  onNextMission?: () => void;
  onReturnToMenu: () => void;
}

export const DebriefingModal: React.FC<DebriefingModalProps> = ({
  mission,
  isSuccess,
  timeSecs,
  kills,
  failureReason,
  onRestart,
  onNextMission,
  onReturnToMenu,
}) => {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  // Calculate Star Rating
  let stars = 1;
  if (isSuccess) {
    if (timeSecs < 180) stars++;
    if (kills >= 4) stars++;
  }

  const handleNext = () => {
    tacticalAudio.init();
    tacticalAudio.playReload();
    if (onNextMission) onNextMission();
  };

  return (
    <div className="modal-backdrop">
      <div className={`modal-window debriefing-modal ${isSuccess ? 'success' : 'failure'}`}>
        {/* Banner */}
        <div className="debrief-banner">
          {isSuccess ? (
            <>
              <Trophy size={42} className="debrief-icon success" />
              <h2 className="debrief-title success">OPERATION COMPLETE</h2>
              <span className="debrief-subtitle">OBJECTIVES EXECUTED // EXTRACTION CONFIRMED</span>
            </>
          ) : (
            <>
              <Skull size={42} className="debrief-icon failure" />
              <h2 className="debrief-title failure">MISSION FAILED</h2>
              <span className="debrief-subtitle">{failureReason || 'OPERATOR NEUTRALIZED'}</span>
            </>
          )}
        </div>

        {/* Stars Rating for Success */}
        {isSuccess && (
          <div className="stars-rating-container">
            {[1, 2, 3].map((starIdx) => (
              <Star
                key={starIdx}
                size={28}
                className={`star-icon ${starIdx <= stars ? 'awarded' : 'empty'}`}
                fill={starIdx <= stars ? '#ffd700' : 'none'}
              />
            ))}
          </div>
        )}

        {/* Stats Grid */}
        <div className="debrief-stats-grid">
          <div className="debrief-stat-card">
            <span className="stat-label">OPERATIONAL TIME</span>
            <span className="stat-val">{formatTime(timeSecs)}</span>
          </div>

          <div className="debrief-stat-card">
            <span className="stat-label">HOSTILES ELIMINATED</span>
            <span className="stat-val highlight">{kills}</span>
          </div>

          <div className="debrief-stat-card">
            <span className="stat-label">CREDITS ACQUIRED</span>
            <span className="stat-val gold">
              {isSuccess ? `+${mission.rewards.credits} CR` : '0 CR'}
            </span>
          </div>

          <div className="debrief-stat-card">
            <span className="stat-label">SECTOR DIFFICULTY</span>
            <span className="stat-val">{mission.difficulty}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="debrief-actions">
          {isSuccess && onNextMission ? (
            <button className="cyber-btn primary-deploy" onClick={handleNext}>
              <span>NEXT MISSION</span>
              <ChevronRight size={18} />
            </button>
          ) : (
            <button className="cyber-btn primary-deploy" onClick={onRestart}>
              <RotateCcw size={18} />
              <span>REDEPLOY OPERATION</span>
            </button>
          )}

          <button className="cyber-btn secondary" onClick={onReturnToMenu}>
            <X size={18} />
            <span>RETURN TO OPERATIONS BASE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
