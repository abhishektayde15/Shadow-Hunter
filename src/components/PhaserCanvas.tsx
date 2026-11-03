import React, { useEffect, useRef } from 'react';
import { PhaserGameBridge } from '../game/PhaserGame';
import type { MissionConfig } from '../types/mission';
import type { PlayerTelemetry } from '../types/soldier';

interface PhaserCanvasProps {
  mission: MissionConfig;
  onTelemetry: (telemetry: PlayerTelemetry) => void;
  onMissionSuccess: (timeSecs: number, kills: number) => void;
  onMissionFail: (reason: string) => void;
  onToggleMap: () => void;
  bridgeRef: React.MutableRefObject<PhaserGameBridge | null>;
}

export const PhaserCanvas: React.FC<PhaserCanvasProps> = ({
  mission,
  onTelemetry,
  onMissionSuccess,
  onMissionFail,
  onToggleMap,
  bridgeRef,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const bridge = new PhaserGameBridge({
      parent: containerRef.current,
      mission,
      onTelemetry,
      onMissionSuccess,
      onMissionFail,
      onToggleMap,
    });
    bridgeRef.current = bridge;

    return () => {
      bridge.destroy();
      bridgeRef.current = null;
    };
  }, [mission]);

  return (
    <div
      ref={containerRef}
      id="phaser-game-container"
      className="canvas-container"
      onContextMenu={(e) => e.preventDefault()}
    />
  );
};
