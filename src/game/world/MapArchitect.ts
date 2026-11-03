import Phaser from 'phaser';
import type { MissionConfig } from '../../types/mission';
import { EnemySoldier } from '../entities/EnemySoldier';
import { InteractiveObject } from '../entities/InteractiveObject';
import { TacticalVehicle } from '../entities/TacticalVehicle';

export class MapArchitect {
  public static buildWorld(
    scene: Phaser.Scene,
    config: MissionConfig,
    obstacles: Phaser.Physics.Arcade.StaticGroup,
    enemies: EnemySoldier[],
    interactives: InteractiveObject[],
    vehicles: TacticalVehicle[]
  ): { extractionLZ: InteractiveObject } {
    const { mapWidth, mapHeight, environment } = config;

    // 1. Draw Ground Base & Textured Tactical Road Network
    const ground = scene.add.graphics();
    const groundColor =
      environment === 'forest'
        ? 0x142215
        : environment === 'base'
          ? 0x161c24
          : environment === 'desert'
            ? 0x382c1b
            : 0x11161d;

    ground.fillStyle(groundColor, 1);
    ground.fillRect(0, 0, mapWidth, mapHeight);

    // Tactical Road Network (Guides player clearly from spawn to checkpoint & bunker)
    const roadColor = environment === 'desert' ? 0x4a3c28 : 0x241d16;
    const roadBorderColor = environment === 'desert' ? 0x2b2214 : 0x382f24;

    // Road Segment 1: Spawn -> Checkpoint (x: 250 to 1400 at y: 1600)
    ground.fillStyle(roadBorderColor, 0.9);
    ground.fillRect(250, 1520, 1150, 160);
    ground.fillStyle(roadColor, 1);
    ground.fillRect(250, 1530, 1150, 140);

    // Road Segment 2: Checkpoint -> Bunker (x: 1300 to 2250, y: 1600 to 2150)
    ground.fillStyle(roadBorderColor, 0.9);
    ground.fillRect(1250, 1530, 150, 620);
    ground.fillRect(1250, 2080, 1000, 150);
    ground.fillStyle(roadColor, 1);
    ground.fillRect(1260, 1530, 130, 620);
    ground.fillRect(1260, 2090, 1000, 130);

    // Tire tracks on the road
    ground.lineStyle(2, 0x15100b, 0.45);
    ground.lineBetween(250, 1570, 1400, 1570);
    ground.lineBetween(250, 1630, 1400, 1630);
    ground.lineBetween(1280, 1600, 1280, 2150);
    ground.lineBetween(1360, 1600, 1360, 2150);
    ground.lineBetween(1360, 2125, 2250, 2125);
    ground.lineBetween(1360, 2175, 2250, 2175);

    // Ground details & tactical grid markers (provides visual parallax when moving)
    ground.lineStyle(1, 0xffffff, 0.03);
    for (let x = 0; x < mapWidth; x += 128) {
      ground.lineBetween(x, 0, x, mapHeight);
    }
    for (let y = 0; y < mapHeight; y += 128) {
      ground.lineBetween(0, y, mapWidth, y);
    }

    // Natural grass patches, pebbles, and gravel details
    for (let px = 200; px < mapWidth - 200; px += 180) {
      for (let py = 200; py < mapHeight - 200; py += 180) {
        const hash = Math.sin(px * 12.9898 + py * 78.233) * 43758.5453;
        const rand = hash - Math.floor(hash);
        if (rand > 0.4) {
          const gx = px + (rand * 60 - 30);
          const gy = py + (rand * 60 - 30);
          ground.fillStyle(environment === 'forest' ? 0x223d24 : 0x2d3a4b, 0.4);
          ground.fillCircle(gx, gy, 4 + rand * 6);
          // Small grass tuft strokes
          ground.lineStyle(1, 0x3d6b41, 0.5);
          ground.lineBetween(gx - 3, gy + 3, gx - 5, gy - 4);
          ground.lineBetween(gx, gy + 3, gx, gy - 6);
          ground.lineBetween(gx + 3, gy + 3, gx + 5, gy - 4);
        }
      }
    }

    // 2. Outer Perimeter Border Walls
    const wallThickness = 64;
    // Top & Bottom
    for (let x = 0; x < mapWidth; x += 64) {
      obstacles.create(x + 32, 32, 'obstacle_wall');
      obstacles.create(x + 32, mapHeight - 32, 'obstacle_wall');
    }
    // Left & Right
    for (let y = 64; y < mapHeight - 64; y += 64) {
      obstacles.create(32, y + 32, 'obstacle_wall');
      obstacles.create(mapWidth - 32, y + 32, 'obstacle_wall');
    }

    // 3. Environmental Structures based on mission
    if (environment === 'forest') {
      this.buildForestOutpost(obstacles, interactives, enemies, mapWidth, mapHeight);
    } else if (environment === 'base') {
      this.buildMilitaryAirbase(obstacles, interactives, enemies, mapWidth, mapHeight);
    } else if (environment === 'desert') {
      this.buildDesertRefinery(obstacles, interactives, enemies, mapWidth, mapHeight);
    } else {
      this.buildUrbanWarzone(obstacles, interactives, enemies, mapWidth, mapHeight);
    }

    // 4. Extraction Helipad Landing Zone
    const extObj = new InteractiveObject(
      scene,
      config.extractionPoint.x,
      config.extractionPoint.y,
      'extraction'
    );
    interactives.push(extObj);

    // 5. Tactical Supply Pickups scattered in compounds
    const supplyCoords = [
      { x: config.playerSpawn.x + 300, y: config.playerSpawn.y - 150 },
      { x: 1600, y: 1400 },
      { x: 2100, y: 1900 },
      { x: 2700, y: 1000 },
    ];
    supplyCoords.forEach((coord, idx) => {
      interactives.push(new InteractiveObject(scene, coord.x, coord.y, idx % 2 === 0 ? 'medkit' : 'ammo'));
    });

    // 6. Tactical Armored Combat Vehicles (GTA Style Humvee / Jeep parked on roads)
    // Primary Jeep parked right ahead on the paved road near spawn
    const primaryJeepX = config.playerSpawn.x + 220;
    const primaryJeepY = config.playerSpawn.y;
    vehicles.push(new TacticalVehicle(scene, primaryJeepX, primaryJeepY, 0));

    // Secondary Jeep parked near forward compound/checkpoint
    const secondaryJeepX = config.playerSpawn.x + 1250;
    const secondaryJeepY = config.playerSpawn.y + 150;
    vehicles.push(new TacticalVehicle(scene, secondaryJeepX, secondaryJeepY, 0));

    return { extractionLZ: extObj };
  }

  // --- Mission 1: Forest & Outpost ---
  private static buildForestOutpost(
    obstacles: Phaser.Physics.Arcade.StaticGroup,
    interactives: InteractiveObject[],
    enemies: EnemySoldier[],
    w: number,
    h: number
  ): void {
    const scene = obstacles.scene;

    // Scattered Pine Trees for Cover
    const treePositions = [
      [500, 600], [750, 450], [900, 750], [600, 1200], [800, 1500],
      [1100, 1100], [1400, 700], [1650, 500], [1850, 850],
      [700, 2200], [1000, 2400], [1400, 2600], [1650, 2200],
      [2400, 1200], [2600, 1500], [2500, 600], [2800, 1100],
    ];
    treePositions.forEach(([x, y]) => {
      obstacles.create(x, y, 'obstacle_tree');
    });

    // Checkpoint 1 (at x=1300, y=1600)
    obstacles.create(1300, 1500, 'obstacle_sandbag');
    obstacles.create(1300, 1700, 'obstacle_sandbag');
    obstacles.create(1250, 1600, 'obstacle_crate');

    // Research Outpost Bunker Compound (at x=2200, y=2150)
    // Floor threshold for bunker
    const bunkerFloor = scene.add.graphics();
    bunkerFloor.fillStyle(0x1a242c, 0.95);
    bunkerFloor.fillRect(2050, 2000, 300, 300);
    // Yellow hazard warning stripes at entrance threshold
    bunkerFloor.fillStyle(0xffaa00, 0.4);
    bunkerFloor.fillRect(2140, 2280, 120, 20);
    bunkerFloor.fillRect(2330, 2100, 20, 100);

    // Top Wall (Solid)
    for (let x = 2050; x <= 2350; x += 64) {
      obstacles.create(x, 2000, 'obstacle_wall');
    }

    // Bottom Wall (Wide 120px open doorway in the center between x=2140 and x=2260)
    for (let x = 2050; x <= 2350; x += 64) {
      if (x < 2140 || x > 2260) {
        obstacles.create(x, 2300, 'obstacle_wall');
      }
    }

    // Left Wall (Solid)
    for (let y = 2064; y <= 2236; y += 64) {
      obstacles.create(2050, y, 'obstacle_wall');
    }

    // Right Wall (Wide open doorway between y=2100 and y=2200 right where the player approaches)
    for (let y = 2064; y <= 2236; y += 64) {
      if (y < 2100 || y > 2200) {
        obstacles.create(2350, y, 'obstacle_wall');
      }
    }

    // Hostage Scientist in Bunker
    interactives.push(new InteractiveObject(scene, 2200, 2150, 'hostage'));

    // Enemy Patrol Squads
    // Squad 0: Forward Perimeter Scouts (Encountered ~350px - 600px ahead of spawn on the path)
    enemies.push(
      new EnemySoldier(scene, 750, 1600, 'patrol', [
        { x: 750, y: 1530 },
        { x: 750, y: 1670 },
      ])
    );
    enemies.push(
      new EnemySoldier(scene, 1020, 1560, 'patrol', [
        { x: 1020, y: 1490 },
        { x: 1020, y: 1630 },
      ])
    );

    // Squad 1: Checkpoint guards (at Sandbags)
    enemies.push(
      new EnemySoldier(scene, 1350, 1550, 'patrol', [
        { x: 1350, y: 1500 },
        { x: 1350, y: 1700 },
      ])
    );
    enemies.push(
      new EnemySoldier(scene, 1400, 1650, 'patrol', [
        { x: 1400, y: 1750 },
        { x: 1550, y: 1600 },
      ])
    );

    // Squad 2: Forest flankers
    enemies.push(
      new EnemySoldier(scene, 1750, 1300, 'patrol', [
        { x: 1750, y: 1200 },
        { x: 1950, y: 1400 },
      ])
    );
    enemies.push(
      new EnemySoldier(scene, 1650, 2000, 'guard', [
        { x: 1650, y: 2000 },
        { x: 1850, y: 2200 },
      ])
    );

    // Squad 3: Bunker Sentries
    enemies.push(
      new EnemySoldier(scene, 2000, 2100, 'guard', [
        { x: 2000, y: 2050 },
        { x: 2000, y: 2250 },
      ])
    );
    enemies.push(
      new EnemySoldier(scene, 2450, 2150, 'heavy', [
        { x: 2400, y: 2150 },
        { x: 2550, y: 2150 },
      ])
    );
  }

  // --- Mission 2: Military Base Infiltration ---
  private static buildMilitaryAirbase(
    obstacles: Phaser.Physics.Arcade.StaticGroup,
    interactives: InteractiveObject[],
    enemies: EnemySoldier[],
    w: number,
    h: number
  ): void {
    const scene = obstacles.scene;

    // Security Radar Station (at x=1900, y=1050)
    interactives.push(new InteractiveObject(scene, 1900, 1050, 'cache'));
    obstacles.create(1850, 1000, 'obstacle_sandbag');
    obstacles.create(1950, 1000, 'obstacle_sandbag');

    // Server Vault Terminal (at x=2650, y=2450)
    for (let x = 2500; x <= 2800; x += 64) {
      obstacles.create(x, 2350, 'obstacle_wall');
      obstacles.create(x, 2550, 'obstacle_wall');
    }
    obstacles.create(2500, 2450, 'obstacle_wall');
    interactives.push(new InteractiveObject(scene, 2650, 2450, 'terminal'));

    // Base Guards & Snipers
    enemies.push(new EnemySoldier(scene, 1800, 1100, 'sniper', [{ x: 1750, y: 1100 }, { x: 1950, y: 1100 }]));
    enemies.push(new EnemySoldier(scene, 2100, 1800, 'guard', [{ x: 2100, y: 1700 }, { x: 2100, y: 1900 }]));
    enemies.push(new EnemySoldier(scene, 2400, 2350, 'heavy', [{ x: 2400, y: 2350 }, { x: 2600, y: 2350 }]));
    enemies.push(new EnemySoldier(scene, 1200, 1500, 'patrol', [{ x: 1200, y: 1400 }, { x: 1400, y: 1600 }]));
  }

  // --- Mission 3: Desert Refinery ---
  private static buildDesertRefinery(
    obstacles: Phaser.Physics.Arcade.StaticGroup,
    interactives: InteractiveObject[],
    enemies: EnemySoldier[],
    w: number,
    h: number
  ): void {
    const scene = obstacles.scene;

    // Primary Munitions Cache (at x=1800, y=1200)
    interactives.push(new InteractiveObject(scene, 1800, 1200, 'cache'));

    // Commander Ironclad (Mini-Boss)
    enemies.push(new EnemySoldier(scene, 2750, 2500, 'boss', [{ x: 2700, y: 2500 }, { x: 2850, y: 2500 }]));

    // Desert Guards
    enemies.push(new EnemySoldier(scene, 1400, 1800, 'guard', [{ x: 1350, y: 1800 }, { x: 1450, y: 1800 }]));
    enemies.push(new EnemySoldier(scene, 1900, 1300, 'heavy', [{ x: 1850, y: 1300 }, { x: 1950, y: 1300 }]));
    enemies.push(new EnemySoldier(scene, 2400, 2100, 'sniper', [{ x: 2350, y: 2050 }, { x: 2450, y: 2150 }]));
  }

  // --- Mission 4: Urban Warzone ---
  private static buildUrbanWarzone(
    obstacles: Phaser.Physics.Arcade.StaticGroup,
    interactives: InteractiveObject[],
    enemies: EnemySoldier[],
    w: number,
    h: number
  ): void {
    const scene = obstacles.scene;

    // City Barricades (at x=1550, y=1900)
    for (let y = 1750; y <= 2050; y += 48) {
      obstacles.create(1550, y, 'obstacle_sandbag');
    }

    // General Voronin (Final Boss)
    enemies.push(new EnemySoldier(scene, 2900, 2750, 'boss', [{ x: 2850, y: 2750 }, { x: 2950, y: 2750 }]));

    // Elite Bodyguards
    enemies.push(new EnemySoldier(scene, 2750, 2650, 'heavy', [{ x: 2700, y: 2650 }, { x: 2800, y: 2650 }]));
    enemies.push(new EnemySoldier(scene, 2800, 2850, 'heavy', [{ x: 2750, y: 2850 }, { x: 2850, y: 2850 }]));
    enemies.push(new EnemySoldier(scene, 2100, 1900, 'sniper', [{ x: 2050, y: 1900 }, { x: 2150, y: 1900 }]));
    enemies.push(new EnemySoldier(scene, 1800, 1600, 'patrol', [{ x: 1750, y: 1550 }, { x: 1900, y: 1650 }]));
  }
}
