import React, { useState } from 'react';
import { BookOpen, Crosshair, HelpCircle, Shield, Terminal, X } from 'lucide-react';

interface TacticalManualModalProps {
  onClose: () => void;
}

export const TacticalManualModal: React.FC<TacticalManualModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'controls' | 'weapons' | 'ai' | 'tactics'>('controls');

  return (
    <div className="modal-backdrop">
      <div className="modal-window instructions-modal">
        <div className="modal-header">
          <div className="modal-title-group">
            <Terminal size={20} className="title-icon" />
            <h2>FIELD OPERATOR MANUAL // SHADOW HUNTER</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-tabs">
          <button
            className={`tab-btn ${activeTab === 'controls' ? 'active' : ''}`}
            onClick={() => setActiveTab('controls')}
          >
            CONTROLS
          </button>
          <button
            className={`tab-btn ${activeTab === 'weapons' ? 'active' : ''}`}
            onClick={() => setActiveTab('weapons')}
          >
            WEAPONS
          </button>
          <button
            className={`tab-btn ${activeTab === 'ai' ? 'active' : ''}`}
            onClick={() => setActiveTab('ai')}
          >
            ENEMY INTEL
          </button>
          <button
            className={`tab-btn ${activeTab === 'tactics' ? 'active' : ''}`}
            onClick={() => setActiveTab('tactics')}
          >
            FIELD TACTICS
          </button>
        </div>

        <div className="modal-body">
          {activeTab === 'controls' && (
            <div className="tab-pane controls-pane">
              <div className="control-column">
                <h3>DESKTOP & LAPTOP CONTROLS</h3>
                <div className="control-row">
                  <span className="key-cap">W A S D</span>
                  <span className="control-desc">Directional Movement</span>
                </div>
                <div className="control-row">
                  <span className="key-cap">SHIFT</span>
                  <span className="control-desc">Hold to Tactical Sprint</span>
                </div>
                <div className="control-row">
                  <span className="key-cap">MOUSE</span>
                  <span className="control-desc">360° Precision Aiming</span>
                </div>
                <div className="control-row">
                  <span className="key-cap">LEFT CLICK</span>
                  <span className="control-desc">Fire Weapon (Hold for Automatic)</span>
                </div>
                <div className="control-row">
                  <span className="key-cap">R</span>
                  <span className="control-desc">Reload Magazine</span>
                </div>
                <div className="control-row">
                  <span className="key-cap">1 2 3 4</span>
                  <span className="control-desc">Switch Weapon (Pistol / Rifle / Shotgun / Sniper)</span>
                </div>
                <div className="control-row">
                  <span className="key-cap">E / F</span>
                  <span className="control-desc">Enter / Exit Combat Jeep (GTA Style Drive & Ram Enemies)</span>
                </div>
                <div className="control-row">
                  <span className="key-cap">SPACE / H</span>
                  <span className="control-desc">Handbrake Drift / Vehicle Horn</span>
                </div>
                <div className="control-row">
                  <span className="key-cap">M</span>
                  <span className="control-desc">Toggle Full-Screen Tactical Sector Map</span>
                </div>
              </div>

              <div className="control-column">
                <h3>MOBILE & TABLET TOUCH</h3>
                <div className="control-row">
                  <span className="key-cap">LEFT STICK</span>
                  <span className="control-desc">Virtual Joystick for Movement</span>
                </div>
                <div className="control-row">
                  <span className="key-cap">RIGHT ZONE</span>
                  <span className="control-desc">Touch Aiming & Automatic Firing</span>
                </div>
                <div className="control-row">
                  <span className="key-cap">RELOAD BTN</span>
                  <span className="control-desc">Dedicated Reload Touch Button</span>
                </div>
                <div className="control-row">
                  <span className="key-cap">INTERACT BTN</span>
                  <span className="control-desc">Appears automatically near objectives</span>
                </div>
                <div className="control-row">
                  <span className="key-cap">MAP BTN</span>
                  <span className="control-desc">Tap radar or map icon to inspect full layout</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'weapons' && (
            <div className="tab-pane weapons-pane">
              <div className="weapon-card">
                <div className="weapon-card-header pistol">
                  <h4>GHOST 9MM [KEY 1]</h4>
                  <span className="badge">SILENCED SIDEARM</span>
                </div>
                <p>Silenced tactical pistol. Ultra-quiet report allows stealth kills without alerting distant base guards.</p>
                <div className="weapon-stats-grid">
                  <span>MAG: 15 / 60</span>
                  <span>DAMAGE: 32</span>
                  <span>NOISE: 180px (Stealth)</span>
                </div>
              </div>

              <div className="weapon-card">
                <div className="weapon-card-header rifle">
                  <h4>M4A1 CARBINE [KEY 2]</h4>
                  <span className="badge">ASSAULT RIFLE</span>
                </div>
                <p>High-cadence tactical assault rifle. Balanced recoil, medium noise signature, and rapid sustained fire.</p>
                <div className="weapon-stats-grid">
                  <span>MAG: 30 / 120</span>
                  <span>DAMAGE: 26</span>
                  <span>FIRE RATE: 9.0/s</span>
                </div>
              </div>

              <div className="weapon-card">
                <div className="weapon-card-header shotgun">
                  <h4>BREACHER-12 [KEY 3]</h4>
                  <span className="badge">CQC SHOTGUN</span>
                </div>
                <p>Pump-action heavy kinetic shotgun. 6 high-density pellets per blast; decimates armored guards at point-blank range.</p>
                <div className="weapon-stats-grid">
                  <span>MAG: 8 / 32</span>
                  <span>DAMAGE: 18 x 6</span>
                  <span>SPREAD: 22° Cone</span>
                </div>
              </div>

              <div className="weapon-card">
                <div className="weapon-card-header sniper">
                  <h4>SHADOW .338 [KEY 4]</h4>
                  <span className="badge">PRECISION SNIPER</span>
                </div>
                <p>Bolt-action high-caliber rifle. Pierces through hostiles at extreme range with supersonic bullet velocity.</p>
                <div className="weapon-stats-grid">
                  <span>MAG: 5 / 20</span>
                  <span>DAMAGE: 140</span>
                  <span>RANGE: 1600px</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="tab-pane enemies-pane">
              <div className="enemy-card">
                <div className="enemy-icon-dot scout" />
                <div className="enemy-info">
                  <h4>PATROL SCOUT</h4>
                  <p>Walks patrol routes. Vision cone of 80°. Alerts comrades upon spotting player or hearing gunfire.</p>
                </div>
              </div>

              <div className="enemy-card">
                <div className="enemy-icon-dot guard" />
                <div className="enemy-info">
                  <h4>BUNKER GUARD</h4>
                  <p>Stationed behind sandbags and defense chokepoints. High accuracy with automatic weapons.</p>
                </div>
              </div>

              <div className="enemy-card">
                <div className="enemy-icon-dot sniper" />
                <div className="enemy-info">
                  <h4>TOWER SNIPER</h4>
                  <p>Extreme vision range (650px). Fires high-damage armor-piercing rounds from elevated sightlines.</p>
                </div>
              </div>

              <div className="enemy-card">
                <div className="enemy-icon-dot heavy" />
                <div className="enemy-info">
                  <h4>HEAVY JUGGERNAUT</h4>
                  <p>Massive body armor plates (220 HP). Requires sustained rifle bursts or shotgun blasts to neutralize.</p>
                </div>
              </div>

              <div className="enemy-card boss">
                <div className="enemy-icon-dot boss" />
                <div className="enemy-info">
                  <h4>COMMANDER / GENERAL VORONIN (BOSS)</h4>
                  <p>High tactical HP (900 HP), rapid fire, calls reinforcements, and commands the field.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tactics' && (
            <div className="tab-pane tactics-pane">
              <ul className="tactics-list">
                <li>
                  <strong>Acoustic Awareness:</strong> Firing the unsuppressed M4 Carbine or Shotgun makes loud noise that draws all guards within 550-750px. Use the silenced Ghost 9mm for undetected kills.
                </li>
                <li>
                  <strong>Environmental Cover:</strong> Sandbags, concrete walls, and crates block enemy bullets. Break line of sight to force enemies into investigating your last known position.
                </li>
                <li>
                  <strong>Tactical Reloads:</strong> Never enter an enemy bunker with an empty magazine. Press [R] behind cover before breaching doorways.
                </li>
                <li>
                  <strong>Hostage Extraction Protocol:</strong> After rescuing hostages, they will follow your movement. Protect them until you reach the Helipad LZ.
                </li>
                <li>
                  <strong>Extraction Rush:</strong> Once all directives are completed, enter the extraction circle and hold the perimeter for 5 seconds until the evacuation helicopter lands!
                </li>
              </ul>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="cyber-btn secondary" onClick={onClose}>
            CONFIRM & RETURN
          </button>
        </div>
      </div>
    </div>
  );
};
