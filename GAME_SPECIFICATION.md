# SHADOW HUNTER — Master Project Specification

> Saved on: 2026-11-02  
> Project Scope: 2D Top-Down Tactical Action-Adventure Shooting Game  
> Architecture: Phaser 3 + TypeScript Engine with React UI / HUD / Menus, Vite, Web Audio API  
> Category: Multimedia Systems Lab Project & Indie Tactical Shooter

---

## 1. Core Game Concept
- **Mission-Based Tactical Shooter**, NOT a wave-based arcade arena.
- Single-player action-adventure with tactical exploration, cover combat, real gun mechanics, objective-based missions, and extraction.
- Diverse biomes & environments: Dense Forests, Infiltrated Military Bases, Urban Warzones, Desert Compounds.
- The player explores large, non-linear maps with buildings, obstacles, enemy patrols, checkpoints, loot/ammo caches, objective markers, and extraction zones.

---

## 2. Camera & World Viewport
- True 2D top-down tactical perspective with smooth following camera, camera bounds, world scrolling, and tactical zooming.
- Large explorable maps (e.g. 3200x3200 to 4800x4800 world units) with physical collision (walls, sandbags, containers, guard towers, fences, rocks, vegetation).

---

## 3. Mission Campaign Roster
- **Mission 1: Forest Rescue** (Navigate dense forest patrol lines, neutralize hostile scouts, locate captive scientist in outpost, escort/reach helicopter extraction zone).
- **Mission 2: Base Infiltration** (Infiltrate fortified military base, bypass/eliminate guard towers and patrols, hack security console, steal classified intelligence, extract safely).
- **Mission 3: Desert Strike** (Traverse arid canyon compound, assault hostile munitions factory, plant C4 charges to destroy weapons cache, reach extraction vehicle under time pressure).
- **Mission 4: Final Extraction / Urban Siege** (Enter ruined city ruins, confront heavy mechanized troops and elite boss commander, recover flight recorder, exfiltrate via rooftop helipad).

---

## 4. Map, Navigation & Tactical Minimap System
- **Real-Time Minimap & Full-Screen Tactical Map Overlay [M]:**
  - Player GPS ping and directional compass cone.
  - Primary & secondary mission objective waypoints with dynamic distance counters.
  - Extraction landing zone markers.
  - Visual Fog of War / exploration shroud (reveals as player scouts territory).
  - Detected enemy markers (when within line-of-sight or radar range).
  - Roads, terrain barriers, and landmarks.
- **On-Screen World Compass & Directional Waypoint Markers:**
  - Screen-edge chevrons pointing toward active objectives so the player always knows where to navigate without feeling lost.

---

## 5. Player Character & Animation System
- Tactical Special Forces Operator visible from top-down perspective.
- Full animation states:
  - Idle (tactical breathing, weapon held ready)
  - Walking & Tactical Sprint (foot cadence, directional stride)
  - Weapon-specific stances (Pistol, Assault Rifle, Shotgun, Sniper Rifle)
  - 360° Cursor/Joystick Aiming with smooth weapon pivot
  - Firing & Recoil kickback with muzzle flash
  - Magazine Reload animation with tactical delay
  - Hit flinch reaction & Death sequence

---

## 6. Weapon Arsenal & Ballistic Shooting Mechanics
- **Pistol (Silenced Tactical Sidearm):** Fast draw, accurate, stealthy audio signature, moderate magazine size.
- **Assault Rifle (M4/Spec-Ops Carbine):** Versatile automatic fire, medium recoil, balanced damage & range.
- **Shotgun (Tactical Pump Breacher):** Heavy spread blast, devastating close-quarters stopping power, individual shell loading.
- **Sniper Rifle (High-Caliber Bolt Action):** Long-range piercing bullet, extended camera look-ahead, extreme damage, deliberate bolt cycle.
- **Ballistics & Combat Mechanics:**
  - True projectile physics (velocity, travel time, penetration through light cover).
  - Magazine capacity, reserve ammo pools, active reloading ([R] / mobile touch button).
  - Visual recoil, casing ejection, dynamic muzzle flash, wall ricochets, blood & concrete dust impacts.

---

## 7. Enemy AI & Tactical Behavior System
- Finite State Machine (FSM): `IDLE` -> `PATROL` -> `SUSPICIOUS` (hears gunfire or steps) -> `ALERT/CHASE` -> `COMBAT/FIRE` -> `TAKE_COVER` -> `DEAD`.
- Vision cone & Line-of-Sight (LOS) detection via raycasting.
- Audio detection: unsuppressed gunshots alert nearby enemies in an audible radius.
- Enemy Archetypes:
  1. **Patrol Soldier:** Standard routes, alerts comrades when discovering player.
  2. **Bunker / Guard Sentry:** Entrenched with sandbags/turrets, suppresses player cover.
  3. **Ranged Sniper:** Long sightline laser sights, attempts to flank from distance.
  4. **Heavy Juggernaut:** Body armor, ballistic shield, suppressive LMG, requires flanking or high-caliber fire.
  5. **Commander Boss:** Tactical abilities (calls reinforcements, deploys smoke/grenades, phased health bars).

---

## 8. Environments, Level Design & Fog of War
- Dense foliage, destructible crates, interactive terminals, security gates requiring keycards.
- Dynamic tactical lighting and raycast Field of View (FOV) / Fog of War.

---

## 9. Inventory, Health & Tactical Supplies
- Player HP & Armor vest durability.
- Medical kits (restores health over brief application).
- Ammo crates (Pistol, Rifle, Shotgun, Sniper rounds).
- Weapon drops from neutralized hostiles.
- Mission quest items (encrypted drives, keycards, explosives).

---

## 10. Technology Stack
- **Engine:** Phaser 3 (`phaser` npm package)
- **Language:** TypeScript (Strict typing)
- **UI & Menus:** React 19 (Main Menu, Mission Briefing, Tactical HUD, Full Map Overlay, Debriefing)
- **Build Tool:** Vite
- **Sound:** Web Audio API procedural synthesis & local audio engine
- **Persistence:** LocalStorage for campaign progression, stars, settings, unlocked missions.
- **Platform Support:** Seamless dual PC (WASD + Mouse) & Mobile (Dual Virtual Joysticks) controls.
