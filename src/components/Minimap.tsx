import React, { useEffect, useRef } from 'react';
import { Compass, Maximize2 } from 'lucide-react';
import type { MissionConfig } from '../types/mission';
import type { PlayerTelemetry } from '../types/soldier';

interface MinimapProps {
  telemetry: PlayerTelemetry;
  mission: MissionConfig;
  onOpenFullMap: () => void;
}

export const Minimap: React.FC<MinimapProps> = ({
  telemetry,
  mission,
  onOpenFullMap,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const radarRadius = 80;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;

    // Clear
    ctx.clearRect(0, 0, width, height);

    // 1. Radar Circular Scope Base
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radarRadius, 0, Math.PI * 2);
    ctx.clip();

    ctx.fillStyle = 'rgba(10, 16, 24, 0.9)';
    ctx.fillRect(0, 0, width, height);

    // Radar Concentric Distance Rings
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.2)';
    ctx.lineWidth = 1;
    [radarRadius * 0.33, radarRadius * 0.66, radarRadius * 0.98].forEach((r) => {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Crosshairs
    ctx.beginPath();
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, height);
    ctx.moveTo(0, cy);
    ctx.lineTo(width, cy);
    ctx.stroke();

    // Scale conversion: 1 radar pixel = ~12 world pixels
    const worldScale = radarRadius / 750;

    // 2. Draw Objectives on Radar
    mission.objectives.forEach((obj) => {
      if (!obj.completed && obj.targetX && obj.targetY) {
        const dx = (obj.targetX - telemetry.worldPosition.x) * worldScale;
        const dy = (obj.targetY - telemetry.worldPosition.y) * worldScale;
        const dist = Math.hypot(dx, dy);

        // Clamp to radar perimeter if off radar
        const clampedDist = Math.min(radarRadius - 8, dist);
        const angle = Math.atan2(dy, dx);
        const ox = cx + Math.cos(angle) * clampedDist;
        const oy = cy + Math.sin(angle) * clampedDist;

        ctx.fillStyle = '#ffd700';
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(ox, oy, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // 3. Draw Extraction Point
    if (telemetry.extractionRequired) {
      const edx = (mission.extractionPoint.x - telemetry.worldPosition.x) * worldScale;
      const edy = (mission.extractionPoint.y - telemetry.worldPosition.y) * worldScale;
      const edist = Math.hypot(edx, edy);
      const clampedEdist = Math.min(radarRadius - 8, edist);
      const eAngle = Math.atan2(edy, edx);
      const ex = cx + Math.cos(eAngle) * clampedEdist;
      const ey = cy + Math.sin(eAngle) * clampedEdist;

      ctx.fillStyle = '#00ff88';
      ctx.shadowColor = '#00ff88';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(ex, ey, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // 4. Detected Enemies
    ctx.shadowBlur = 4;
    telemetry.detectedEnemies.forEach((e) => {
      const edx = (e.x - telemetry.worldPosition.x) * worldScale;
      const edy = (e.y - telemetry.worldPosition.y) * worldScale;
      if (Math.hypot(edx, edy) < radarRadius - 4) {
        ctx.fillStyle = e.alert ? '#ff003c' : '#ff9900';
        ctx.shadowColor = ctx.fillStyle;
        ctx.beginPath();
        ctx.arc(cx + edx, cy + edy, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // 5. Player Arrow at Center
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(telemetry.aimAngle);
    ctx.fillStyle = '#00f3ff';
    ctx.shadowColor = '#00f3ff';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(7, 0);
    ctx.lineTo(-5, -5);
    ctx.lineTo(-2, 0);
    ctx.lineTo(-5, 5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.restore();

    // Radar Outer Border Ring
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#00ff88';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(cx, cy, radarRadius, 0, Math.PI * 2);
    ctx.stroke();
  }, [telemetry, mission]);

  return (
    <div className="minimap-container" onClick={onOpenFullMap} title="Click to open Full Tactical Sector Map [M]">
      <canvas ref={canvasRef} width={180} height={180} className="minimap-canvas" />
      <div className="minimap-header">
        <div className="gps-lock">
          <Compass size={12} className="gps-icon" />
          <span>GPS RADAR</span>
        </div>
        <button className="expand-map-btn" title="Expand Full Map [M]">
          <Maximize2 size={12} />
        </button>
      </div>
    </div>
  );
};
