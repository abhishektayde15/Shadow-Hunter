import Phaser from 'phaser';
import { tacticalAudio } from '../audio/TacticalAudio';
import type { MissionConfig } from '../types/mission';
import type { PlayerTelemetry } from '../types/soldier';
import { BootScene } from './scenes/BootScene';
import { MissionScene } from './scenes/MissionScene';

export interface PhaserGameOptions {
  parent: HTMLElement;
  mission: MissionConfig;
  onTelemetry: (telemetry: PlayerTelemetry) => void;
  onMissionSuccess: (timeSecs: number, kills: number) => void;
  onMissionFail: (reason: string) => void;
  onToggleMap: () => void;
}

export class PhaserGameBridge {
  private game: Phaser.Game | null = null;
  public missionScene: MissionScene | null = null;

  constructor(options: PhaserGameOptions) {
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: options.parent,
      width: options.parent.clientWidth || window.innerWidth,
      height: options.parent.clientHeight || window.innerHeight,
      backgroundColor: '#0c1017',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false,
        },
      },
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      scene: [BootScene, MissionScene],
    };

    this.game = new Phaser.Game(config);

    // Store options in global registry so scenes can access them reliably
    this.game.registry.set('missionInitData', options);

    // Grab scene reference once created
    const checkScene = () => {
      const scene = this.game?.scene.getScene('MissionScene') as MissionScene | undefined;
      if (scene && scene.scene.isActive()) {
        this.missionScene = scene;
      } else if (this.game) {
        setTimeout(checkScene, 50);
      }
    };
    setTimeout(checkScene, 100);
  }

  public switchWeapon(index: number): void {
    if (this.missionScene?.player) {
      this.missionScene.player.switchWeapon(index);
    }
  }

  public reloadWeapon(): void {
    if (this.missionScene?.player) {
      this.missionScene.player.startReload();
    }
  }

  public setVirtualMove(x: number, y: number): void {
    if (this.missionScene) {
      this.missionScene.virtualMove = { x, y };
    }
  }

  public setVirtualAim(aim: { x: number; y: number } | null, isFiring: boolean): void {
    if (this.missionScene) {
      this.missionScene.virtualAim = aim;
      this.missionScene.virtualFiring = isFiring;
    }
  }

  public triggerInteract(): void {
    if (this.missionScene) {
      (this.missionScene as unknown as { handleInteract: () => void }).handleInteract();
    }
  }

  public triggerHorn(): void {
    if (this.missionScene?.activeVehicle) {
      tacticalAudio.playVehicleHorn();
    }
  }

  public destroy(): void {
    if (this.game) {
      this.game.destroy(true);
      this.game = null;
      this.missionScene = null;
    }
  }
}
