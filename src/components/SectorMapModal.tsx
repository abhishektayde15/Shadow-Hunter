import React, { useEffect, useRef } from 'react';
import { CheckCircle2, Circle, MapPin, X } from 'lucide-react';
import type { MissionConfig } from '../types/mission';
import type { PlayerTelemetry } from '../types/soldier';

interface SectorMapModalProps {
  mission: MissionConfig;
  telemetry: PlayerTelemetry;
  onClose: () => void;
}

export const SectorMapModal: React.FC<SectorMapModalProps> = ({
  mission,
  telemetry,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const scaleX = w / mission.mapWidth;
    const scaleY = h / mission.mapHeight;

    // Background
    ctx.fillStyle = '#0a1017';
    ctx.fillRect(0, 0, w, h);

    // Tactical Sector Grid
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.15)';
    ctx.lineWidth = 1;
    const step = w / 4;
    for (let x = 0; x <= w; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y <= h; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Sector Labels (A1, A2, B1, etc.)
    ctx.font = '10px Orbitron, sans-serif';
    ctx.fillStyle = 'rgba(0, 255, 136, 0.4)';
    const cols = ['A', 'B', 'C', 'D'];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        ctx.fillText(`${cols[c]}${r + 1}`, c * step + 8, r * step + 16);
      }
    }

    // Outer border
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 2;
    ctx.strokeRect(2, 2, w - 4, h - 4);

    // Extraction Point
    const ex = mission.extractionPoint.x * scaleX;
    const ey = mission.extractionPoint.y * scaleY;
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(ex, ey, 14, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#00ff88';
    ctx.font = 'bold 10px Orbitron, sans-serif';
    ctx.fillText('LZ', ex - 7, ey + 4);

    // Objectives
    mission.objectives.forEach((obj, idx) => {
      if (obj.targetX && obj.targetY) {
        const ox = obj.targetX * scaleX;
        const oy = obj.targetY * scaleY;

        ctx.fillStyle = obj.completed ? '#00ff88' : '#ffd700';
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(ox, oy, 7, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px Orbitron, sans-serif';
        ctx.fillText(`OBJ ${idx + 1}`, ox + 10, oy + 4);
      }
    });

    // Player Operator Position
    const px = telemetry.worldPosition.x * scaleX;
    const py = telemetry.worldPosition.y * scaleY;

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(telemetry.aimAngle);
    ctx.fillStyle = '#00f3ff';
    ctx.shadowColor = '#00f3ff';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(10, 0);
    ctx.lineTo(-7, -6);
    ctx.lineTo(-3, 0);
    ctx.lineTo(-7, 6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }, [mission, telemetry]);

  return (
    <div className="modal-backdrop">
      <div className="modal-window sector-map-modal">
        <div className="modal-header">
          <h2>TACTICAL SECTOR RECON // SATELLITE FEED</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body sector-map-body">
          <div className="sector-canvas-wrapper">
            <canvas ref={canvasRef} width={460} height={460} className="sector-canvas" />
          </div>

          <div className="sector-sidebar">
            <h3>MISSION OBJECTIVES</h3>
            <div className="sector-objectives-list">
              {mission.objectives.map((obj, idx) => (
                <div key={obj.id} className={`sector-obj-row ${obj.completed ? 'done' : ''}`}>
                  {obj.completed ? (
                    <CheckCircle2 size={16} className="obj-icon done" />
                  ) : (
                    <Circle size={16} className="obj-icon pending" />
                  )}
                  <span className="obj-desc">
                    {idx + 1}. {obj.description}
                  </span>
                </div>
              ))}
            </div>

            <div className="sector-telemetry-box">
              <div className="telemetry-item">
                <span className="label">OPERATOR GRID:</span>
                <span className="val">
                  X:{Math.round(telemetry.worldPosition.x)} Y:{Math.round(telemetry.worldPosition.y)}
                </span>
              </div>
              <div className="telemetry-item">
                <span className="label">ACTIVE FIREARM:</span>
                <span className="val highlight">{telemetry.activeWeapon.name}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="cyber-btn secondary" onClick={onClose}>
            RETURN TO OPERATIONAL VIEW [M]
          </button>
        </div>
      </div>
    </div>
  );
};
