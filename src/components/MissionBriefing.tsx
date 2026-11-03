import React from 'react';
import { CheckCircle2, ChevronRight, Play, X } from 'lucide-react';
import { tacticalAudio } from '../audio/TacticalAudio';
import type { MissionConfig } from '../types/mission';

interface MissionBriefingProps {
  mission: MissionConfig;
  onDeploy: () => void;
  onBack: () => void;
}

export const MissionBriefing: React.FC<MissionBriefingProps> = ({
  mission,
  onDeploy,
  onBack,
}) => {
  const handleDeploy = () => {
    tacticalAudio.init();
    tacticalAudio.playReload();
    onDeploy();
  };

  return (
    <div className="briefing-backdrop">
      <div className="briefing-scanline" />

      <div className="briefing-card simple-briefing">
        {/* Header */}
        <div className="briefing-header">
          <span className="env-badge">{mission.environment.toUpperCase()} MAP</span>
          <h1 className="briefing-title">{mission.title}</h1>
          <p className="briefing-simple-desc">{mission.briefing}</p>
        </div>

        {/* Body */}
        <div className="briefing-body">
          {/* Simple Step-by-Step Directives */}
          <div className="objectives-section">
            <h3>WHAT YOU NEED TO DO IN THIS MISSION:</h3>
            <div className="simple-task-list">
              {mission.objectives.map((obj, idx) => (
                <div key={obj.id} className="simple-task-card">
                  <span className="task-step">STEP {idx + 1}</span>
                  <div className="task-details">
                    <span className="task-title">{obj.description}</span>
                    <span className="task-hint">
                      {obj.type === 'rescue_hostage' && 'Walk close to the scientist in the bunker and press [E]'}
                      {obj.type === 'hack_terminal' && 'Walk close to the terminal and press [E]'}
                      {obj.type === 'destroy_object' && 'Shoot the objective or press [E]'}
                      {obj.type === 'extract' && 'Step inside the green circle and wait 5 seconds'}
                      {obj.type === 'reach_location' && 'Follow the top-right radar minimap'}
                      {obj.type === 'eliminate_target' && 'Use your guns to neutralize hostiles'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Controls Cheat Sheet */}
          <div className="quick-controls-box">
            <h4>QUICK CONTROLS:</h4>
            <div className="quick-keys-grid">
              <span><strong>W, A, S, D</strong> = Move</span>
              <span><strong>Mouse</strong> = Aim</span>
              <span><strong>Left Click</strong> = Shoot</span>
              <span><strong>R</strong> = Reload Gun</span>
              <span><strong>E</strong> = Action / Rescue</span>
              <span><strong>1, 2, 3, 4</strong> = Change Weapons</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="briefing-footer simple-footer">
          <button className="cyber-btn secondary" onClick={onBack}>
            <X size={18} />
            <span>BACK TO MENU</span>
          </button>

          <button className="cyber-btn primary-deploy big-start-btn" onClick={handleDeploy}>
            <Play size={22} />
            <span>START GAME NOW</span>
            <ChevronRight size={22} />
          </button>
        </div>
      </div>
    </div>
  );
};
