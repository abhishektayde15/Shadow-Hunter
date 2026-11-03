import React, { useRef, useState } from 'react';
import { DebriefingModal } from './components/DebriefingModal';
import { MainMenu } from './components/MainMenu';
import { MissionBriefing } from './components/MissionBriefing';
import { MobileTacticalPad } from './components/MobileTacticalPad';
import { PauseModal } from './components/PauseModal';
import { PhaserCanvas } from './components/PhaserCanvas';
import { SectorMapModal } from './components/SectorMapModal';
import { TacticalHUD } from './components/TacticalHUD';
import { TacticalManualModal } from './components/TacticalManualModal';
import { MISSIONS } from './game/missions/MissionData';
import type { PhaserGameBridge } from './game/PhaserGame';
import { CampaignStorage } from './storage/CampaignStorage';
import type { GameScreen, MissionConfig, MissionId } from './types/mission';
import type { PlayerTelemetry } from './types/soldier';
import './App.css';

export const App: React.FC = () => {
  const [screen, setScreen] = useState<GameScreen>('MENU');
  const [selectedMission, setSelectedMission] = useState<MissionConfig>(MISSIONS.mission_1);
  const [telemetry, setTelemetry] = useState<PlayerTelemetry | null>(null);

  // Modals & Overlays
  const [showManual, setShowManual] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSectorMap, setShowSectorMap] = useState(false);

  // Debriefing State
  const [debriefData, setDebriefData] = useState<{
    isSuccess: boolean;
    time: number;
    kills: number;
    reason?: string;
  } | null>(null);

  const bridgeRef = useRef<PhaserGameBridge | null>(null);
  const [isMobileMode, setIsMobileMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      window.innerWidth <= 1024
    );
  });

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobileMode(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.innerWidth <= 1024
      );
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- Handlers ---
  const handleSelectMissionFromMenu = (mission: MissionConfig) => {
    setSelectedMission(mission);
    setScreen('BRIEFING');
  };

  const handleDeployMission = () => {
    setScreen('PLAYING');
  };

  const handlePause = () => {
    if (screen === 'PLAYING') {
      setScreen('PAUSED');
    }
  };

  const handleResume = () => {
    if (screen === 'PAUSED') {
      setScreen('PLAYING');
    }
  };

  const handleRestartMission = () => {
    setScreen('PLAYING');
    setDebriefData(null);
  };

  const handleAbortToMenu = () => {
    setScreen('MENU');
    setDebriefData(null);
    setShowSectorMap(false);
  };

  const handleMissionSuccess = (timeSecs: number, kills: number) => {
    // Save campaign progression
    CampaignStorage.completeMission(selectedMission.id, 3, timeSecs, kills);

    setDebriefData({
      isSuccess: true,
      time: timeSecs,
      kills,
    });
    setScreen('DEBRIEFING');
  };

  const handleMissionFail = (reason: string) => {
    setDebriefData({
      isSuccess: false,
      time: telemetry?.missionTime || 0,
      kills: telemetry?.kills || 0,
      reason,
    });
    setScreen('DEBRIEFING');
  };

  const handleNextMission = () => {
    const sequence: MissionId[] = ['mission_1', 'mission_2', 'mission_3', 'mission_4'];
    const curIdx = sequence.indexOf(selectedMission.id);
    if (curIdx >= 0 && curIdx < sequence.length - 1) {
      const nextMission = MISSIONS[sequence[curIdx + 1]];
      setSelectedMission(nextMission);
      setDebriefData(null);
      setScreen('BRIEFING');
    } else {
      handleAbortToMenu();
    }
  };

  return (
    <div className="game-app-root">
      {/* 1. Main Menu */}
      {screen === 'MENU' && (
        <MainMenu
          onSelectMission={handleSelectMissionFromMenu}
          onOpenManual={() => setShowManual(true)}
          onOpenSettings={() => setShowSettings(true)}
        />
      )}

      {/* 2. Mission Briefing */}
      {screen === 'BRIEFING' && (
        <MissionBriefing
          mission={selectedMission}
          onDeploy={handleDeployMission}
          onBack={() => setScreen('MENU')}
        />
      )}

      {/* 3. Active Gameplay Simulation (Phaser 3 Canvas) */}
      {(screen === 'PLAYING' || screen === 'PAUSED' || screen === 'MAP') && (
        <>
          <PhaserCanvas
            mission={selectedMission}
            onTelemetry={setTelemetry}
            onMissionSuccess={handleMissionSuccess}
            onMissionFail={handleMissionFail}
            onToggleMap={() => setShowSectorMap((prev) => !prev)}
            bridgeRef={bridgeRef}
          />

          {telemetry && (
            <TacticalHUD
              telemetry={telemetry}
              mission={selectedMission}
              onSwitchWeapon={(idx) => bridgeRef.current?.switchWeapon(idx)}
              onReload={() => bridgeRef.current?.reloadWeapon()}
              onPause={handlePause}
              onOpenFullMap={() => setShowSectorMap(true)}
              onVirtualMove={(x, y) => bridgeRef.current?.setVirtualMove(x, y)}
            />
          )}

          {/* Mobile On-Screen Tactical Pad */}
          {isMobileMode && screen === 'PLAYING' && (
            <MobileTacticalPad
              bridgeRef={bridgeRef}
              telemetry={telemetry}
              onReload={() => bridgeRef.current?.reloadWeapon()}
              onInteract={() => bridgeRef.current?.triggerInteract()}
              onHorn={() => bridgeRef.current?.triggerHorn()}
              onSwitchWeapon={(idx) => bridgeRef.current?.switchWeapon(idx)}
            />
          )}
        </>
      )}

      {/* 4. Full Tactical Sector Map [M] */}
      {showSectorMap && telemetry && (
        <SectorMapModal
          mission={selectedMission}
          telemetry={telemetry}
          onClose={() => setShowSectorMap(false)}
        />
      )}

      {/* 5. Pause Modal */}
      {screen === 'PAUSED' && (
        <PauseModal
          onResume={handleResume}
          onRestart={handleRestartMission}
          onAbortToMenu={handleAbortToMenu}
        />
      )}

      {/* 6. Mission Debriefing Modal (Success or KIA) */}
      {screen === 'DEBRIEFING' && debriefData && (
        <DebriefingModal
          mission={selectedMission}
          isSuccess={debriefData.isSuccess}
          timeSecs={debriefData.time}
          kills={debriefData.kills}
          failureReason={debriefData.reason}
          onRestart={handleRestartMission}
          onNextMission={handleNextMission}
          onReturnToMenu={handleAbortToMenu}
        />
      )}

      {/* 7. Tactical Manual Modal */}
      {showManual && <TacticalManualModal onClose={() => setShowManual(false)} />}

      {/* 8. Settings Modal */}
      {showSettings && (
        <PauseModal
          onResume={() => setShowSettings(false)}
          onRestart={() => setShowSettings(false)}
          onAbortToMenu={() => setShowSettings(false)}
        />
      )}
    </div>
  );
};
export default App;
