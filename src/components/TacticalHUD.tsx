import React, { useState } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  CheckCircle2,
  Circle,
  Clock,
  Compass,
  Crosshair,
  HelpCircle,
  MapPin,
  MousePointer,
  Pause,
  RotateCcw,
  Shield,
  User,
} from 'lucide-react';
import type { MissionConfig } from '../types/mission';
import type { PlayerTelemetry } from '../types/soldier';
import type { WeaponId } from '../types/weapons';
import { Minimap } from './Minimap';

interface TacticalHUDProps {
  telemetry: PlayerTelemetry;
  mission: MissionConfig;
  onSwitchWeapon: (idx: number) => void;
  onReload: () => void;
  onPause: () => void;
  onOpenFullMap: () => void;
  onVirtualMove?: (x: number, y: number) => void;
}

export const TacticalHUD: React.FC<TacticalHUDProps> = ({
  telemetry,
  mission,
  onSwitchWeapon,
  onReload,
  onPause,
  onOpenFullMap,
  onVirtualMove,
}) => {
  const [showControlsHint, setShowControlsHint] = useState(true);
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const hpPercent = Math.max(0, (telemetry.health / telemetry.maxHealth) * 100);
  const armorPercent = Math.max(0, (telemetry.armor / telemetry.maxArmor) * 100);

  // Active Objective calculation
  const activeObj = mission.objectives.find((o) => !o.completed);
  let distanceToObj = 0;
  if (activeObj && activeObj.targetX && activeObj.targetY) {
    distanceToObj = Math.round(
      Math.hypot(
        activeObj.targetX - telemetry.worldPosition.x,
        activeObj.targetY - telemetry.worldPosition.y
      ) * 0.1
    );
  }

  return (
    <div className="tactical-hud-overlay">
      {/* --- TOP BAR --- */}
      <div className="hud-top-bar">
        {/* Left: Vitals (Health & Body Armor) */}
        <div className="operator-vitals">
          {/* Health */}
          <div className="vital-row">
            <div className="vital-icon-badge hp">
              <User size={14} />
            </div>
            <div className="vital-track">
              <div className="vital-fill hp" style={{ width: `${hpPercent}%` }} />
              <span className="vital-text">
                HEALTH {Math.round(telemetry.health)} / {telemetry.maxHealth}
              </span>
            </div>
          </div>

          {/* Armor */}
          <div className="vital-row">
            <div className="vital-icon-badge armor">
              <Shield size={14} />
            </div>
            <div className="vital-track">
              <div className="vital-fill armor" style={{ width: `${armorPercent}%` }} />
              <span className="vital-text">
                ARMOR {Math.round(telemetry.armor)} / {telemetry.maxArmor}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Directional Waypoint Chevron */}
        {activeObj && distanceToObj > 0 && (
          <div className="waypoint-indicator-badge">
            <MapPin size={16} className="waypoint-icon" />
            <span className="waypoint-desc">{activeObj.description}</span>
            <span className="waypoint-dist">{distanceToObj}m</span>
          </div>
        )}

        {/* Right: GPS Radar Minimap & Timer */}
        <div className="hud-top-right">
          <div className="mission-time-badge">
            <Clock size={14} />
            <span>{formatTime(telemetry.missionTime)}</span>
          </div>

          <button className="hud-pause-btn" onClick={onPause} title="Pause Operations [ESC]">
            <Pause size={18} />
          </button>

          <Minimap telemetry={telemetry} mission={mission} onOpenFullMap={onOpenFullMap} />
        </div>
      </div>

      {/* --- EXTRACTION ZONE COUNTDOWN OVERLAY --- */}
      {telemetry.isAtExtraction && telemetry.extractionRequired && (
        <div className="extraction-in-progress-banner">
          <div className="extraction-title">EXTRACTION PROTOCOL ACTIVE</div>
          <div className="extraction-progress-bar">
            <div
              className="extraction-progress-fill"
              style={{ width: `${telemetry.extractionProgress}%` }}
            />
          </div>
          <div className="extraction-sub">HOLDING PERIMETER...</div>
        </div>
      )}

      {/* --- CONTEXTUAL ACTION PROMPT (e.g. PRESS [E]) --- */}
      {telemetry.interactPrompt && (
        <div className="interact-prompt-banner">
          <span className="interact-key">[E]</span>
          <span className="interact-text">{telemetry.interactPrompt}</span>
        </div>
      )}

      {/* --- BOTTOM BAR --- */}
      <div className="hud-bottom-bar">
        {/* Left Side: Objectives Checklist + On-Screen Tactical D-Pad */}
        <div className="hud-bottom-left-group">
          {/* Objectives Checklist Card */}
          <div className="objectives-hud-card">
            <div className="card-header-tag">ACTIVE OBJECTIVES</div>
            <div className="objectives-items">
              {mission.objectives.map((obj) => (
                <div key={obj.id} className={`obj-item-row ${obj.completed ? 'completed' : ''}`}>
                  {obj.completed ? (
                    <CheckCircle2 size={13} className="obj-status-icon done" />
                  ) : (
                    <Circle size={13} className="obj-status-icon pending" />
                  )}
                  <span>{obj.description}</span>
                </div>
              ))}
            </div>
          </div>

          {/* On-Screen Tactical Movement D-Pad */}
          <div className="tactical-dpad-container">
            <button
              className="dpad-btn up"
              onMouseDown={() => onVirtualMove?.(0, -1)}
              onMouseUp={() => onVirtualMove?.(0, 0)}
              onTouchStart={() => onVirtualMove?.(0, -1)}
              onTouchEnd={() => onVirtualMove?.(0, 0)}
              title="Move Up [W or ↑]"
            >
              <ArrowUp size={15} />
              <span className="dpad-sub">W</span>
            </button>
            <div className="dpad-middle-row">
              <button
                className="dpad-btn left"
                onMouseDown={() => onVirtualMove?.(-1, 0)}
                onMouseUp={() => onVirtualMove?.(0, 0)}
                onTouchStart={() => onVirtualMove?.(-1, 0)}
                onTouchEnd={() => onVirtualMove?.(0, 0)}
                title="Move Left [A or ←]"
              >
                <ArrowLeft size={15} />
                <span className="dpad-sub">A</span>
              </button>
              <div className="dpad-center-hub" title="Hold D-Pad buttons or press WASD / Arrow Keys to walk">
                <Compass size={16} className="dpad-hub-icon" />
              </div>
              <button
                className="dpad-btn right"
                onMouseDown={() => onVirtualMove?.(1, 0)}
                onMouseUp={() => onVirtualMove?.(0, 0)}
                onTouchStart={() => onVirtualMove?.(1, 0)}
                onTouchEnd={() => onVirtualMove?.(0, 0)}
                title="Move Right [D or →]"
              >
                <ArrowRight size={15} />
                <span className="dpad-sub">D</span>
              </button>
            </div>
            <button
              className="dpad-btn down"
              onMouseDown={() => onVirtualMove?.(0, 1)}
              onMouseUp={() => onVirtualMove?.(0, 0)}
              onTouchStart={() => onVirtualMove?.(0, 1)}
              onTouchEnd={() => onVirtualMove?.(0, 0)}
              title="Move Down [S or ↓]"
            >
              <ArrowDown size={15} />
              <span className="dpad-sub">S</span>
            </button>
          </div>
        </div>

        {/* Center: Controls Guide Banner */}
        {showControlsHint && (
          <div className="hud-controls-banner">
            <div className="banner-tag walk">MOVE</div>
            <span className="banner-text">
              Press <strong>W A S D</strong> or <strong>Arrow Keys</strong> or <strong>Right-Click Ground</strong>
            </span>
            <span className="banner-sep">•</span>
            <div className="banner-tag shoot">SHOOT</div>
            <span className="banner-text">
              Aim with Mouse &amp; <strong>Left-Click</strong>
            </span>
            <span className="banner-sep">•</span>
            <div className="banner-tag drive">JEEP</div>
            <span className="banner-text">
              <strong>[E] / [F]</strong> to Enter/Exit Car
            </span>
            <span className="banner-sep">•</span>
            <span className="banner-highlight">
              Follow Cyan Arrow <strong>➔</strong>
            </span>
            <button
              className="banner-close-btn"
              onClick={() => setShowControlsHint(false)}
              title="Hide instructions banner"
            >
              ×
            </button>
          </div>
        )}

        {/* Weapons & Ballistics Dock */}
        <div className="weapon-telemetry-dock">
          {/* Active Weapon Card */}
          <div className="active-weapon-display">
            <div className="weapon-meta">
              <span className="weapon-class">{telemetry.activeWeapon.category}</span>
              <span className="weapon-model">{telemetry.activeWeapon.name}</span>
            </div>

            <div className="ammo-readout">
              <span className="current-mag">{telemetry.activeWeapon.currentMag}</span>
              <span className="ammo-slash">/</span>
              <span className="reserve-ammo">{telemetry.activeWeapon.reserveAmmo}</span>
            </div>

            {/* Reloading Bar */}
            {telemetry.isReloading ? (
              <div className="reload-progress-container">
                <div
                  className="reload-progress-fill"
                  style={{ width: `${telemetry.reloadProgress * 100}%` }}
                />
                <span className="reload-label">RELOADING...</span>
              </div>
            ) : (
              <button
                className="quick-reload-btn"
                onClick={onReload}
                disabled={telemetry.activeWeapon.currentMag >= telemetry.activeWeapon.magSize}
                title="Reload Magazine [R]"
              >
                <RotateCcw size={12} />
                <span>RELOAD [R]</span>
              </button>
            )}
          </div>

          {/* Weapon Selector Slots [1, 2, 3, 4] */}
          <div className="weapon-selector-strip">
            {telemetry.weapons.map((w, idx) => (
              <button
                key={w.id}
                className={`weapon-select-btn ${telemetry.activeWeapon.id === w.id ? 'active' : ''}`}
                onClick={() => onSwitchWeapon(idx)}
              >
                <span className="slot-key">{idx + 1}</span>
                <span className="slot-name">{w.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
