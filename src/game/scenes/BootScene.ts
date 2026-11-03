import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create(): void {
    this.generateProceduralTacticalTextures();
    const initData = this.game.registry.get('missionInitData');
    this.scene.start('MissionScene', initData);
  }

  private generateProceduralTacticalTextures(): void {
    // 1. Player Soldier (Top-down Spec-Ops Operator)
    this.generatePlayerTexture();

    // 2. Enemy Soldier Archetypes
    this.generateEnemyTextures();

    // 3. Captive Scientist (Hostage)
    this.generateHostageTexture();

    // 4. Projectiles & Ballistics
    this.generateBulletTextures();

    // 5. Environmental & Structure Tiles
    this.generateEnvironmentTextures();

    // 6. Interactive Objectives & Extraction Helipad
    this.generateObjectiveTextures();

    // 7. Tactical Armored Combat Vehicle (GTA Style Jeep)
    this.generateVehicleTexture();

    // 8. Extraction Rescue Helicopter (Blackhawk Spec-Ops)
    this.generateHelicopterTextures();
  }

  private generatePlayerTexture(): void {
    const size = 48;
    const canvas = this.textures.createCanvas('player_soldier', size, size);
    if (!canvas) return;
    const ctx = canvas.getContext();

    ctx.save();
    ctx.translate(size / 2, size / 2);

    // Boots / Feet
    ctx.fillStyle = '#1c2128';
    ctx.fillRect(-8, -14, 10, 5);
    ctx.fillRect(-8, 9, 10, 5);

    // Tactical Vest & Torso (Camo Olive / Navy)
    ctx.fillStyle = '#22382e';
    ctx.strokeStyle = '#3d5c4b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(-10, -12, 16, 24, 3);
    ctx.fill();
    ctx.stroke();

    // Shoulder Pauldrons
    ctx.fillStyle = '#182b22';
    ctx.beginPath();
    ctx.arc(-2, -13, 5, 0, Math.PI * 2);
    ctx.arc(-2, 13, 5, 0, Math.PI * 2);
    ctx.fill();

    // Helmet & NVG Mount
    ctx.fillStyle = '#131e17';
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Goggles / Glowing Visor
    ctx.fillStyle = '#00f3ff';
    ctx.shadowColor = '#00f3ff';
    ctx.shadowBlur = 6;
    ctx.fillRect(4, -4, 3, 8);

    // Tactical Weapon Barrel & Hands
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(8, 2, 16, 4); // Weapon barrel
    ctx.fillStyle = '#2a3b30'; // Hand grip
    ctx.beginPath();
    ctx.arc(8, 4, 3, 0, Math.PI * 2);
    ctx.arc(14, 3, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    canvas.refresh();
  }

  private generateEnemyTextures(): void {
    const archetypes: Array<{ key: string; vestColor: string; helmetColor: string; eyeColor: string; size: number }> = [
      { key: 'enemy_patrol', vestColor: '#3d1f24', helmetColor: '#2b1418', eyeColor: '#ff3344', size: 48 },
      { key: 'enemy_guard', vestColor: '#382e1f', helmetColor: '#261e13', eyeColor: '#ffaa00', size: 48 },
      { key: 'enemy_sniper', vestColor: '#1f2e3d', helmetColor: '#141e2b', eyeColor: '#00ccff', size: 48 },
      { key: 'enemy_heavy', vestColor: '#222222', helmetColor: '#141414', eyeColor: '#ff0055', size: 56 },
      { key: 'enemy_boss', vestColor: '#400e18', helmetColor: '#26060c', eyeColor: '#ff0033', size: 64 },
    ];

    archetypes.forEach((arch) => {
      const s = arch.size;
      const canvas = this.textures.createCanvas(arch.key, s, s);
      if (!canvas) return;
      const ctx = canvas.getContext();

      ctx.save();
      ctx.translate(s / 2, s / 2);

      // Torso Vest
      ctx.fillStyle = arch.vestColor;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(-10, -12, 16, 24, 3);
      ctx.fill();
      ctx.stroke();

      // Helmet
      ctx.fillStyle = arch.helmetColor;
      ctx.beginPath();
      ctx.arc(0, 0, 8.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Threat Eye / Visor
      ctx.fillStyle = arch.eyeColor;
      ctx.shadowColor = arch.eyeColor;
      ctx.shadowBlur = 6;
      ctx.fillRect(4, -3, 3, 6);

      // Gun
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#111';
      ctx.fillRect(8, 2, s > 50 ? 20 : 14, 4);

      ctx.restore();
      canvas.refresh();
    });
  }

  private generateHostageTexture(): void {
    const size = 44;
    const canvas = this.textures.createCanvas('hostage_scientist', size, size);
    if (!canvas) return;
    const ctx = canvas.getContext();

    ctx.save();
    ctx.translate(size / 2, size / 2);

    // White Lab Coat
    ctx.fillStyle = '#e8ecf2';
    ctx.strokeStyle = '#b0b8c4';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(-8, -10, 14, 20, 3);
    ctx.fill();
    ctx.stroke();

    // Head with glasses
    ctx.fillStyle = '#d4aa7d';
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.fill();

    // Glasses
    ctx.strokeStyle = '#00bbff';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(2, -3, 3, 6);

    ctx.restore();
    canvas.refresh();
  }

  private generateBulletTextures(): void {
    // Player Bullet (Cyan Tracer)
    const bPlayer = this.textures.createCanvas('bullet_player', 16, 6);
    if (bPlayer) {
      const ctx = bPlayer.getContext();
      ctx.fillStyle = '#00f3ff';
      ctx.shadowColor = '#00f3ff';
      ctx.shadowBlur = 8;
      ctx.fillRect(0, 1, 16, 4);
      bPlayer.refresh();
    }

    // Enemy Bullet (Crimson Tracer)
    const bEnemy = this.textures.createCanvas('bullet_enemy', 14, 6);
    if (bEnemy) {
      const ctx = bEnemy.getContext();
      ctx.fillStyle = '#ff003c';
      ctx.shadowColor = '#ff003c';
      ctx.shadowBlur = 8;
      ctx.fillRect(0, 1, 14, 4);
      bEnemy.refresh();
    }
  }

  private generateEnvironmentTextures(): void {
    // Concrete Wall
    const wall = this.textures.createCanvas('obstacle_wall', 64, 64);
    if (wall) {
      const ctx = wall.getContext();
      ctx.fillStyle = '#222831';
      ctx.fillRect(0, 0, 64, 64);
      ctx.strokeStyle = '#393e46';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, 62, 62);
      ctx.fillStyle = '#4f5664';
      ctx.fillRect(8, 8, 48, 48);
      wall.refresh();
    }

    // Sandbags Barricade
    const sandbag = this.textures.createCanvas('obstacle_sandbag', 64, 32);
    if (sandbag) {
      const ctx = sandbag.getContext();
      ctx.fillStyle = '#826a45';
      ctx.fillRect(0, 0, 64, 32);
      ctx.strokeStyle = '#57462c';
      ctx.lineWidth = 2;
      // Stitched segments
      for (let x = 0; x < 64; x += 16) {
        ctx.strokeRect(x, 0, 16, 16);
        ctx.strokeRect(x + 8, 16, 16, 16);
      }
      sandbag.refresh();
    }

    // Pine Tree Top-down Canopy
    const tree = this.textures.createCanvas('obstacle_tree', 96, 96);
    if (tree) {
      const ctx = tree.getContext();
      const center = 48;
      // Outer shadow ring
      ctx.fillStyle = 'rgba(10, 15, 12, 0.4)';
      ctx.beginPath();
      ctx.arc(center, center, 44, 0, Math.PI * 2);
      ctx.fill();
      // Outer pine leaves
      ctx.fillStyle = '#1e3822';
      ctx.beginPath();
      ctx.arc(center, center, 40, 0, Math.PI * 2);
      ctx.fill();
      // Mid pine ring
      ctx.fillStyle = '#2b5232';
      ctx.beginPath();
      ctx.arc(center, center, 28, 0, Math.PI * 2);
      ctx.fill();
      // Top crown
      ctx.fillStyle = '#3c7546';
      ctx.beginPath();
      ctx.arc(center, center, 14, 0, Math.PI * 2);
      ctx.fill();
      tree.refresh();
    }

    // Military Crate
    const crate = this.textures.createCanvas('obstacle_crate', 44, 44);
    if (crate) {
      const ctx = crate.getContext();
      ctx.fillStyle = '#4a5742';
      ctx.fillRect(0, 0, 44, 44);
      ctx.strokeStyle = '#2d3826';
      ctx.lineWidth = 2;
      ctx.strokeRect(2, 2, 40, 40);
      // Stencil cross
      ctx.beginPath();
      ctx.moveTo(4, 4);
      ctx.lineTo(40, 40);
      ctx.moveTo(40, 4);
      ctx.lineTo(4, 40);
      ctx.stroke();
      crate.refresh();
    }

    // Medkit Pickup
    const medkit = this.textures.createCanvas('item_medkit', 28, 24);
    if (medkit) {
      const ctx = medkit.getContext();
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, 28, 24);
      ctx.strokeStyle = '#cc0000';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, 26, 22);
      // Red Cross
      ctx.fillStyle = '#ff0033';
      ctx.fillRect(11, 4, 6, 16);
      ctx.fillRect(6, 9, 16, 6);
      medkit.refresh();
    }

    // Ammo Can Pickup
    const ammo = this.textures.createCanvas('item_ammo', 28, 20);
    if (ammo) {
      const ctx = ammo.getContext();
      ctx.fillStyle = '#3f4c34';
      ctx.fillRect(0, 0, 28, 20);
      ctx.strokeStyle = '#ffaa00';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(1, 1, 26, 18);
      ctx.fillStyle = '#ffaa00';
      ctx.fillRect(6, 6, 16, 8);
      ammo.refresh();
    }
  }

  private generateObjectiveTextures(): void {
    // Computer Terminal
    const term = this.textures.createCanvas('target_terminal', 48, 48);
    if (term) {
      const ctx = term.getContext();
      ctx.fillStyle = '#1a222d';
      ctx.fillRect(0, 0, 48, 48);
      ctx.strokeStyle = '#00ff88';
      ctx.lineWidth = 2;
      ctx.strokeRect(2, 2, 44, 44);
      // Screen glow
      ctx.fillStyle = '#00ff88';
      ctx.shadowColor = '#00ff88';
      ctx.shadowBlur = 8;
      ctx.fillRect(8, 8, 32, 22);
      term.refresh();
    }

    // Munitions Cache Tank (Fuel/Explosives)
    const tank = this.textures.createCanvas('target_cache', 56, 56);
    if (tank) {
      const ctx = tank.getContext();
      ctx.fillStyle = '#5c1922';
      ctx.beginPath();
      ctx.arc(28, 28, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ff9900';
      ctx.lineWidth = 3;
      ctx.stroke();
      // Hazard icon
      ctx.fillStyle = '#ff9900';
      ctx.font = 'bold 20px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⚠', 28, 28);
      tank.refresh();
    }

    // Extraction Helipad (180x180)
    const lz = this.textures.createCanvas('extraction_pad', 180, 180);
    if (lz) {
      const ctx = lz.getContext();
      const center = 90;
      // Outer landing circle
      ctx.fillStyle = 'rgba(20, 30, 25, 0.7)';
      ctx.beginPath();
      ctx.arc(center, center, 84, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#00ff88';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#00ff88';
      ctx.shadowBlur = 12;
      ctx.stroke();

      // Bold 'H' Marking
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 68px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('H', center, center);

      // Strobe lights at 4 corners
      ctx.fillStyle = '#00ff88';
      [
        [20, 20],
        [160, 20],
        [20, 160],
        [160, 160],
      ].forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();
      });
      lz.refresh();
    }
  }

  private generateVehicleTexture(): void {
    const w = 96;
    const h = 56;
    const canvas = this.textures.createCanvas('tactical_jeep', w, h);
    if (!canvas) return;
    const ctx = canvas.getContext();

    ctx.save();
    ctx.translate(w / 2, h / 2);

    // 4 Off-road Mud Tires (Black rubber with tread ridges)
    ctx.fillStyle = '#111315';
    // Front Tires
    ctx.fillRect(18, -26, 20, 8);
    ctx.fillRect(18, 18, 20, 8);
    // Rear Tires
    ctx.fillRect(-38, -26, 20, 8);
    ctx.fillRect(-38, 18, 20, 8);

    // Tire tread marks
    ctx.fillStyle = '#2a2e33';
    [-34, -28, 22, 28].forEach((tx) => {
      ctx.fillRect(tx, -26, 2, 8);
      ctx.fillRect(tx, 18, 2, 8);
    });

    // Armored Military Chassis (Camo Olive Drab)
    ctx.fillStyle = '#2c3a2e';
    ctx.strokeStyle = '#18241a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-42, -20, 84, 40, 6);
    ctx.fill();
    ctx.stroke();

    // Steel Reinforcement Plates
    ctx.fillStyle = '#223024';
    ctx.fillRect(-38, -17, 76, 34);

    // Front Hood & Bullbar / Winch
    ctx.fillStyle = '#151c16';
    ctx.fillRect(38, -16, 8, 32); // Heavy front bumper
    ctx.fillStyle = '#ffd700'; // Winch hook
    ctx.fillRect(44, -3, 3, 6);

    // Armored Windshield Glass (Cyan tint with reflection)
    ctx.fillStyle = '#06282e';
    ctx.fillRect(4, -14, 12, 28);
    ctx.fillStyle = '#00f3ff';
    ctx.globalAlpha = 0.45;
    ctx.fillRect(6, -12, 4, 24);
    ctx.globalAlpha = 1.0;

    // Side Windows
    ctx.fillStyle = '#0a1d24';
    ctx.fillRect(-18, -17, 16, 4);
    ctx.fillRect(-18, 13, 16, 4);

    // Rear Cargo Bed & Jerry Can / Spare Tire
    ctx.fillStyle = '#1c241e';
    ctx.fillRect(-38, -14, 16, 28);
    ctx.fillStyle = '#8b0000'; // Red fuel jerry can
    ctx.fillRect(-34, -12, 8, 8);

    // Roof Mounted Heavy Gun Turret Hub
    ctx.fillStyle = '#121614';
    ctx.beginPath();
    ctx.arc(0, 0, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Dual Heavy Machine Gun Barrels (pointing forward)
    ctx.fillStyle = '#0a0d0b';
    ctx.fillRect(8, -4, 22, 3);
    ctx.fillRect(8, 1, 22, 3);

    // Headlights (Dual yellow front LEDs)
    ctx.fillStyle = '#ffea00';
    ctx.shadowColor = '#ffea00';
    ctx.shadowBlur = 6;
    ctx.fillRect(40, -14, 3, 5);
    ctx.fillRect(40, 9, 3, 5);

    // Taillights (Dual red rear LEDs)
    ctx.fillStyle = '#ff2222';
    ctx.shadowColor = '#ff2222';
    ctx.shadowBlur = 4;
    ctx.fillRect(-43, -14, 2, 5);
    ctx.fillRect(-43, 9, 2, 5);

    ctx.restore();
    canvas.refresh();
  }

  private generateHelicopterTextures(): void {
    // 1. Helicopter Fuselage (130 x 46)
    const fw = 130;
    const fh = 46;
    const fuseCanvas = this.textures.createCanvas('helicopter_fuselage', fw, fh);
    if (fuseCanvas) {
      const ctx = fuseCanvas.getContext();
      ctx.save();
      ctx.translate(fw / 2, fh / 2);

      // Landing Tubular Skids (Top and Bottom)
      ctx.fillStyle = '#4a5568';
      ctx.fillRect(-28, -21, 62, 3);
      ctx.fillRect(-28, 18, 62, 3);
      // Skid Struts
      ctx.fillRect(-15, -20, 3, 40);
      ctx.fillRect(18, -20, 3, 40);

      // Tail Boom (Tapering to rear at -X)
      ctx.fillStyle = '#1e2630';
      ctx.strokeStyle = '#0f141a';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-18, -8);
      ctx.lineTo(-58, -3);
      ctx.lineTo(-58, 3);
      ctx.lineTo(-18, 8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Horizontal Stabilizer Fin at Tail
      ctx.fillStyle = '#2d3748';
      ctx.fillRect(-56, -14, 6, 28);

      // Main Cabin Fuselage (Charcoal / Gunmetal military)
      ctx.fillStyle = '#1a222c';
      ctx.beginPath();
      ctx.roundRect(-22, -16, 54, 32, 6);
      ctx.fill();
      ctx.stroke();

      // Streamlined Cockpit Nose (at +X)
      ctx.fillStyle = '#1e2834';
      ctx.beginPath();
      ctx.moveTo(32, -15);
      ctx.quadraticCurveTo(58, 0, 32, 15);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Cockpit Windshield (Tinted glass with glowing HUD outline)
      ctx.fillStyle = '#06282e';
      ctx.beginPath();
      ctx.moveTo(28, -11);
      ctx.quadraticCurveTo(50, 0, 28, 11);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#00f3ff';
      ctx.lineWidth = 1;
      ctx.shadowColor = '#00f3ff';
      ctx.shadowBlur = 4;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Open Cargo Sliding Doors (Dark interior)
      ctx.fillStyle = '#080c10';
      ctx.fillRect(-12, -12, 22, 24);

      // Navigation Strobe Lights
      ctx.fillStyle = '#00ff88'; // Starboard green
      ctx.fillRect(4, 16, 3, 3);
      ctx.fillStyle = '#ff2222'; // Port red
      ctx.fillRect(4, -19, 3, 3);
      ctx.fillStyle = '#ffffff'; // Tail white
      ctx.fillRect(-59, -1, 3, 2);

      ctx.restore();
      fuseCanvas.refresh();
    }

    // 2. Main Rotor (130 x 130)
    const rw = 130;
    const rotorCanvas = this.textures.createCanvas('helicopter_rotor', rw, rw);
    if (rotorCanvas) {
      const ctx = rotorCanvas.getContext();
      ctx.save();
      ctx.translate(rw / 2, rw / 2);

      // 4 Aerodynamic Blades
      const bladeLen = 58;
      const bladeW = 5;
      for (let b = 0; b < 4; b++) {
        ctx.save();
        ctx.rotate((b * Math.PI) / 2);

        // Blade Body (Carbon fiber dark slate)
        ctx.fillStyle = 'rgba(26, 34, 44, 0.85)';
        ctx.fillRect(8, -bladeW / 2, bladeLen, bladeW);

        // Yellow Warning Tip
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(bladeLen - 4, -bladeW / 2, 12, bladeW);

        ctx.restore();
      }

      // Center Rotor Hub & Swashplate
      ctx.fillStyle = '#374151';
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.restore();
      rotorCanvas.refresh();
    }

    // 3. Tail Rotor (32 x 32)
    const trCanvas = this.textures.createCanvas('helicopter_tail_rotor', 32, 32);
    if (trCanvas) {
      const ctx = trCanvas.getContext();
      ctx.save();
      ctx.translate(16, 16);

      ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
      ctx.fillRect(-2, -14, 4, 28);
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(-2, -14, 4, 4);
      ctx.fillRect(-2, 10, 4, 4);

      ctx.fillStyle = '#111827';
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
      trCanvas.refresh();
    }
  }
}
