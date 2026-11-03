# 🎖️ SHADOW HUNTER // Tactical 2D Top-Down Shooter

![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Phaser](https://img.shields.io/badge/Phaser-3-E03C11?logo=phaser&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)
![Platform](https://img.shields.io/badge/Platform-Web%20%7C%20Mobile%20%7C%20Desktop-00ff88)
![Deployment](https://img.shields.io/badge/Deploy-Vercel%20Ready-000000?logo=vercel&logoColor=white)

> **Infiltrate. Neutralize. Rescue. Extract.**  
> **SHADOW HUNTER** is a fast-paced 2D top-down tactical action-adventure game built with **Phaser 3, React 19, and TypeScript**. Take command of an elite operative, command armored tactical vehicles, eliminate hostile forces, rescue captured scientists, and extract via military helicopter.

---

## 🎮 What is the Game About?

You play as an elite operative dropped behind enemy lines. Each mission drops you into a hostile compound with specific tactical objectives:

1. **Infiltrate the Compound**: Navigate through checkpoints, security gates, and enemy defensive lines.
2. **Complete the Mission Objectives**:
   - **Rescue Captive Scientists**: Find the hostage, walk close, and press `[E]` to escort them safely.
   - **Hack Security Terminals**: Bypass encrypted mainframes to retrieve classified intel.
   - **Plant C4 Explosives**: Sabotage enemy ammunition caches and weapon depots.
   - **Neutralize Enemy Threats**: Eliminate hostile guards, snipers, and patrols.
3. **Reach the Helipad `[H]` & Extract**: Once all primary objectives are accomplished, reach the **Helipad Landing Zone (LZ)** marked with an **`H`**. An armed rescue helicopter will fly in from the sky, land on the helipad, board your squad, and fly away to complete the mission!

---

## ⚡ Key Highlights & Features

### 🚙 1. Driveable Tactical Jeep (GTA Vice City Style)
- **Hop In & Drive**: Approach any parked military jeep on the road and press **`[E]`** or **`[F]`** to enter.
- **360° Roof-Mounted Turret**: Fire your heavy turret gun in all directions while steering the vehicle.
- **Realistic Driving Physics**: High acceleration, brake friction, handbrake drifting with tire skid marks, and night headlight beams.
- **Roadkill Ramming**: Run directly over enemy soldiers at high speed to crush them!
- **Loud Tactical Horn**: Press **`[H]`** (or tap the on-screen Horn button) to blast the loud military horn!

### 🚁 2. Cinematic Helicopter Extraction
- Landing Zone marked by a large tactical **`H`** Helipad on the tarmac.
- When objectives are clear, a **Blackhawk extraction helicopter** descends from the clouds with dynamic altitude scaling, spinning main and tail rotors, and ground downwash dust rings.
- Touches down, automatically boards your squad, and takes off into the sky before debriefing.

### 📱 3. 100% Mobile & Touch Optimized
- **Dual Virtual Analog Joysticks**:
  - **Left Joystick (Green)**: Smooth 360° soldier walking and vehicle steering/acceleration.
  - **Right Joystick (Cyan)**: 360° aiming and automatic firing.
  - Built with modern **Pointer Capture API** so thumbs never slide off or freeze the joysticks.
- **Dedicated Mobile Action Dock**:
  - **`ACTION [E]` Button**: Automatically adapts to context (`DRIVE CAR`, `EXIT CAR`, `RESCUE`, `HACK`, `PLANT C4`).
  - **`RELOAD [R]` Button**: Quick magazine reload with live ammo readout.
  - **`HORN [H]` Button**: Appears when driving the Jeep for authentic honking.
  - **`WEAPON SWITCH` Button**: Single tap to cycle between all available firearms.
- **Adaptive HUD**: GPS Minimap and vitals automatically scale down for mobile screens to keep the gameplay field clean.

### 🔫 4. Four-Weapon Tactical Arsenal
1. **Silenced Tactical Pistol (9mm)**: Stealthy sidearm with high accuracy.
2. **Combat Assault Rifle (5.56mm)**: High-rate-of-fire rifle for medium range skirmishes.
3. **Tactical Combat Shotgun (12-Gauge)**: Fires deadly 6-pellet buckshot spread for lethal close quarters.
4. **High-Velocity Sniper Rifle (.50 Cal)**: Extreme range, armor-piercing heavy sniper rifle with wall-penetration capability.

### 🧠 5. Smart Hostile AI
- Vision cones with line-of-sight raycasting.
- Dynamic AI behavior states: **Patrol**, **Suspicious**, **Chase**, **Attack**, and **Cover**.
- Enemies alert nearby squads when gunshots are heard.

---

## 🕹️ Controls Guide

### 💻 Desktop / Laptop Controls

| Key / Input | Action |
| :--- | :--- |
| **`W, A, S, D`** or **`Arrow Keys`** | Walk / Run / Steer Vehicle |
| **`Mouse Cursor`** | 360° Precision Aiming |
| **`Left Mouse Click`** | Fire Active Firearm / Turret Gun |
| **`Right Mouse Click`** | Hold to Walk toward Cursor |
| **`R`** | Reload Current Magazine |
| **`E`** or **`F`** | Interact / Enter or Exit Jeep / Rescue Hostage |
| **`1, 2, 3, 4`** | Switch Weapon (Pistol, Rifle, Shotgun, Sniper) |
| **`H`** | Honk Tactical Jeep Horn |
| **`Spacebar`** | Handbrake Drift (while in vehicle) |
| **`M`** | Toggle Full Satellite Sector Map |
| **`ESC`** | Pause Operations & Sound Settings |

### 📱 Mobile & Tablet Controls

| Touch Control | Action |
| :--- | :--- |
| **Left Virtual Joystick** | Move Soldier or Drive/Steer Tactical Jeep |
| **Right Virtual Joystick** | Aim in 360° and Fire Weapon Continuously |
| **Floating `ACTION [E]` Button** | Drive Jeep, Exit Jeep, Rescue Scientist, Hack Terminal |
| **Floating `RELOAD` Button** | Reload Weapon with ammo count display |
| **Floating `HORN` Button** | Honk Jeep Horn (appears while driving) |
| **Floating `SWITCH` Button** | Cycle to the next firearm in your arsenal |
| **Tap Radar Minimap** | Open Full Satellite Recon Map |

---

## 🗺️ Campaign Missions

- **Mission 1: Forest Infiltration** — Penetrate enemy perimeter in the dense jungle, rescue the captured scientist, and extract.
- **Mission 2: Military Base Infiltration** — Infiltrate high-security military barracks, breach the comms bunker, and hack the security terminal.
- **Mission 3: Desert Outpost Demolition** — Infiltrate the desert fortress and plant C4 explosives on the ammunition caches.
- **Mission 4: Urban Citadel Assault** — Urban warfare in city ruins to neutralize hostile elite commanders and extract.

---

## 🚀 Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (Version 18 or higher recommended)
- `npm` or `pnpm`

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/abhishektayde15/Shadow-Hunter.git
   cd Shadow-Hunter
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   Navigate to `http://localhost:5173` to play!

---

## 🌐 Deploy to Vercel (1-Click Deployment)

This repository includes a pre-configured `vercel.json` file designed for single-page application routing with Vite.

### Steps to Deploy:
1. Go to [Vercel](https://vercel.com/) and sign in with your GitHub account.
2. Click **"Add New..."** ➔ **"Project"**.
3. Import the **`Shadow-Hunter`** repository.
4. Vercel will automatically detect:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click **"Deploy"**! In less than 60 seconds, your game will be live globally.

---

## 🛠️ Technology Stack

- **Game Engine**: [Phaser 3](https://phaser.io/) (Arcade Physics, Camera Tracking, Dynamic Lighting & Particles)
- **UI & Modals**: [React 19](https://react.dev/) + TypeScript
- **Bundler & Tooling**: [Vite 8](https://vite.dev/)
- **Audio System**: Web Audio API (Synthesized dynamic gunshots, engine frequencies, sirens & alerts)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 📄 License

This project is created for educational, tactical gaming, and portfolio purposes. Feel free to explore, play, and expand!
