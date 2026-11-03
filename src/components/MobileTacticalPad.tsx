import React, { useEffect, useRef, useState } from 'react';
import { Crosshair, Move, Radio, RotateCcw, Volume2, Zap } from 'lucide-react';
import type { PhaserGameBridge } from '../game/PhaserGame';
import type { PlayerTelemetry } from '../types/soldier';

interface MobileTacticalPadProps {
  bridgeRef: React.MutableRefObject<PhaserGameBridge | null>;
  telemetry: PlayerTelemetry | null;
  onReload: () => void;
  onInteract: () => void;
  onHorn?: () => void;
  onSwitchWeapon?: (idx: number) => void;
}

export const MobileTacticalPad: React.FC<MobileTacticalPadProps> = ({
  bridgeRef,
  telemetry,
  onReload,
  onInteract,
  onHorn,
  onSwitchWeapon,
}) => {
  // Left Joystick (Movement) State
  const [leftState, setLeftState] = useState<{
    pointerId: number;
    startX: number;
    startY: number;
    curX: number;
    curY: number;
  } | null>(null);

  // Right Joystick (Aim & Fire) State
  const [rightState, setRightState] = useState<{
    pointerId: number;
    startX: number;
    startY: number;
    curX: number;
    curY: number;
  } | null>(null);

  const leftZoneRef = useRef<HTMLDivElement>(null);
  const rightZoneRef = useRef<HTMLDivElement>(null);

  // --- Pointer Handlers for Left (Movement) Joystick ---
  const handleLeftDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only capture primary touch/click
    if (leftState !== null) return;
    e.preventDefault();
    e.stopPropagation();

    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;

    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

    setLeftState({
      pointerId: e.pointerId,
      startX: clientX,
      startY: clientY,
      curX: clientX,
      curY: clientY,
    });
  };

  const handleLeftMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!leftState || leftState.pointerId !== e.pointerId) return;
    e.preventDefault();
    e.stopPropagation();

    const dx = e.clientX - leftState.startX;
    const dy = e.clientY - leftState.startY;
    const maxRadius = 50;
    const dist = Math.hypot(dx, dy);
    const factor = dist > maxRadius ? maxRadius / dist : 1;
    const clampedX = dx * factor;
    const clampedY = dy * factor;

    const nx = clampedX / maxRadius;
    const ny = clampedY / maxRadius;

    if (bridgeRef.current) {
      bridgeRef.current.setVirtualMove(nx, ny);
    }

    setLeftState((prev) =>
      prev
        ? {
            ...prev,
            curX: prev.startX + clampedX,
            curY: prev.startY + clampedY,
          }
        : null
    );
  };

  const handleLeftUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!leftState || leftState.pointerId !== e.pointerId) return;
    e.preventDefault();
    e.stopPropagation();

    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    setLeftState(null);
    if (bridgeRef.current) {
      bridgeRef.current.setVirtualMove(0, 0);
    }
  };

  // --- Pointer Handlers for Right (Aim & Fire) Joystick ---
  const handleRightDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (rightState !== null) return;
    e.preventDefault();
    e.stopPropagation();

    const clientX = e.clientX;
    const clientY = e.clientY;

    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

    setRightState({
      pointerId: e.pointerId,
      startX: clientX,
      startY: clientY,
      curX: clientX,
      curY: clientY,
    });

    if (bridgeRef.current) {
      bridgeRef.current.setVirtualAim({ x: 0, y: 0 }, true);
    }
  };

  const handleRightMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!rightState || rightState.pointerId !== e.pointerId) return;
    e.preventDefault();
    e.stopPropagation();

    const dx = e.clientX - rightState.startX;
    const dy = e.clientY - rightState.startY;
    const maxRadius = 50;
    const dist = Math.hypot(dx, dy);
    const factor = dist > maxRadius ? maxRadius / dist : 1;
    const clampedX = dx * factor;
    const clampedY = dy * factor;

    if (bridgeRef.current && dist > 4) {
      bridgeRef.current.setVirtualAim({ x: clampedX, y: clampedY }, true);
    }

    setRightState((prev) =>
      prev
        ? {
            ...prev,
            curX: prev.startX + clampedX,
            curY: prev.startY + clampedY,
          }
        : null
    );
  };

  const handleRightUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!rightState || rightState.pointerId !== e.pointerId) return;
    e.preventDefault();
    e.stopPropagation();

    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    setRightState(null);
    if (bridgeRef.current) {
      bridgeRef.current.setVirtualAim(null, false);
    }
  };

  // Contextual action button text
  const getActionLabel = () => {
    if (!telemetry) return 'ACTION [E]';
    if (telemetry.isInVehicle) return 'EXIT CAR [E]';
    if (telemetry.interactPrompt) {
      if (telemetry.interactPrompt.includes('JEEP')) return 'DRIVE CAR [E]';
      if (telemetry.interactPrompt.includes('SCIENTIST')) return 'RESCUE [E]';
      if (telemetry.interactPrompt.includes('TERMINAL')) return 'HACK [E]';
      if (telemetry.interactPrompt.includes('C4')) return 'PLANT C4 [E]';
      return 'INTERACT [E]';
    }
    return 'ACTION [E]';
  };

  // Next weapon cycling
  const handleCycleWeapon = () => {
    if (!telemetry || !onSwitchWeapon) return;
    const currentIdx = telemetry.weapons.findIndex((w) => w.id === telemetry.activeWeapon.id);
    const nextIdx = (currentIdx + 1) % telemetry.weapons.length;
    onSwitchWeapon(nextIdx);
  };

  return (
    <div className="mobile-tactical-pad">
      {/* 1. Left Movement Joystick Zone (Bottom-Left Quadrant) */}
      <div
        ref={leftZoneRef}
        className="joystick-touch-zone left-zone"
        onPointerDown={handleLeftDown}
        onPointerMove={handleLeftMove}
        onPointerUp={handleLeftUp}
        onPointerCancel={handleLeftUp}
      >
        {/* Dynamic Drag Base or Default Anchor Base */}
        <div
          className={`joystick-anchor-base left ${leftState ? 'active' : 'idle'}`}
          style={
            leftState
              ? {
                  position: 'fixed',
                  left: leftState.startX,
                  top: leftState.startY,
                }
              : undefined
          }
        >
          {/* Outer ring accents */}
          <div className="joystick-ring-accent" />
          <div
            className="joystick-thumb left"
            style={
              leftState
                ? {
                    transform: `translate(${leftState.curX - leftState.startX}px, ${leftState.curY - leftState.startY}px)`,
                  }
                : undefined
            }
          >
            <Move size={18} className="thumb-icon" />
          </div>
          <span className="joystick-label">MOVE</span>
        </div>
      </div>

      {/* 2. Right Aim & Fire Joystick Zone (Bottom-Right Quadrant) */}
      <div
        ref={rightZoneRef}
        className="joystick-touch-zone right-zone"
        onPointerDown={handleRightDown}
        onPointerMove={handleRightMove}
        onPointerUp={handleRightUp}
        onPointerCancel={handleRightUp}
      >
        <div
          className={`joystick-anchor-base right ${rightState ? 'active' : 'idle'}`}
          style={
            rightState
              ? {
                  position: 'fixed',
                  left: rightState.startX,
                  top: rightState.startY,
                }
              : undefined
          }
        >
          <div className="joystick-ring-accent aim" />
          <div
            className="joystick-thumb aim"
            style={
              rightState
                ? {
                    transform: `translate(${rightState.curX - rightState.startX}px, ${rightState.curY - rightState.startY}px)`,
                  }
                : undefined
            }
          >
            <Crosshair size={20} className="thumb-icon" />
          </div>
          <span className="joystick-label aim">AIM &amp; FIRE</span>
        </div>
      </div>

      {/* 3. Floating Mobile Action Buttons Dock (Above Right Stick) */}
      <div className="mobile-action-dock">
        {/* Weapon Quick Cycle Button */}
        {telemetry && (
          <button
            className="mobile-tactical-btn weapon-cycle"
            onPointerDown={(e) => {
              e.stopPropagation();
              handleCycleWeapon();
            }}
            title="Cycle Weapon (Pistol/Rifle/Shotgun/Sniper)"
          >
            <Zap size={18} className="btn-icon" />
            <span className="btn-main-txt">{telemetry.activeWeapon.name.split(' ')[0]}</span>
            <span className="btn-sub-txt">SWITCH</span>
          </button>
        )}

        {/* Reload Button */}
        <button
          className={`mobile-tactical-btn reload ${telemetry?.isReloading ? 'reloading' : ''}`}
          onPointerDown={(e) => {
            e.stopPropagation();
            onReload();
          }}
          disabled={
            telemetry
              ? telemetry.isReloading ||
                telemetry.activeWeapon.currentMag >= telemetry.activeWeapon.magSize
              : false
          }
          title="Reload Magazine"
        >
          <RotateCcw size={18} className={`btn-icon ${telemetry?.isReloading ? 'spin-anim' : ''}`} />
          <span className="btn-main-txt">
            {telemetry
              ? `${telemetry.activeWeapon.currentMag}/${telemetry.activeWeapon.reserveAmmo}`
              : 'RELOAD'}
          </span>
          <span className="btn-sub-txt">RELOAD</span>
        </button>

        {/* Vehicle Horn Button (GTA Vice City Style!) */}
        {telemetry?.isInVehicle && (
          <button
            className="mobile-tactical-btn horn"
            onPointerDown={(e) => {
              e.stopPropagation();
              onHorn?.();
            }}
            title="Honk Armored Jeep Horn [H]"
          >
            <Volume2 size={20} className="btn-icon neon" />
            <span className="btn-main-txt">HORN</span>
            <span className="btn-sub-txt">[H]</span>
          </button>
        )}

        {/* Contextual Action Button (Enter/Exit Car, Rescue Scientist, Hack Terminal) */}
        {(telemetry?.interactPrompt || telemetry?.isInVehicle) && (
          <button
            className={`mobile-tactical-btn action-prominent ${telemetry?.isInVehicle ? 'exit-car' : 'interact'}`}
            onPointerDown={(e) => {
              e.stopPropagation();
              onInteract();
            }}
            title="Execute Tactical Action [E]"
          >
            <Radio size={20} className="btn-icon pulse" />
            <span className="btn-main-txt">{getActionLabel()}</span>
          </button>
        )}
      </div>
    </div>
  );
};
