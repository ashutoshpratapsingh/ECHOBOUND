# ECHOBOUND: The Lost Light 💎🌿

> **Practical Assignment – AI + Game Development**  
> An atmospheric 2D cinematic jungle platformer featuring the original **Echo Pulse** mechanic, dynamic organic physics hazards, an intelligent apex predator encounter (**The Anaconda Guardian**), and real-time procedural Web Audio synthesis.  
> Built with **Phaser.js** and **Vite**, fully playable on **Web** and **Mobile** browsers.

---

## 🎮 Playable Prototype & Quickstart

### Prerequisites
- Node.js (v18 or higher recommended)
- Modern web browser (Chrome, Edge, Firefox, Safari)

### Quick Run
```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev
```
Open the localhost URL displayed in the terminal (typically `http://localhost:5173`) in your desktop browser or mobile device on the same local network.

### Production Build
```bash
npm run build
npm run preview
```
The optimized production bundle is generated in the `dist/` directory, ready for one-click deployment to **GitHub Pages**, **Vercel**, or **Netlify**.

---

## 🕹️ Controls

### Web & Desktop Keyboard
- **Move Left / Right**: `A` / `D` or `Arrow Keys`
- **Jump**: `Spacebar`, `W`, or `Arrow Up`
- **Echo Pulse**: `E` *(reveals ethereal platforms and stuns the Anaconda)*
- **SFX Toggle**: Interactive button in the top HUD (`🔊 SFX ON` / `🔇 SFX OFF`)
- **Restart**: `Enter` (on Game Over or Victory screens)

### Mobile & Touch Screens
- **Left / Right**: Virtual directional arrows on the lower-left screen.
- **Echo Pulse**: Glowing cyan action button on the lower-right screen.
- **Jump**: High-contrast green jump button on the far lower-right screen.
- **Ergonomics**: Viewport is protected with `touch-action: none` to prevent unintended browser gestures, zooming, or rubber-banding.

---

## 🌟 Core Gameplay Systems & Innovations

### 1. The Echo Pulse (Core Innovation)
Pressing `E` (or tapping the mobile `ECHO` button) discharges an acoustic shockwave from Kael that radiates across the canopy:
- **Reveals Ethereal Platforms**: Activates translucent ancient rune platforms for 3.2 seconds, allowing passage over deep chasms and access to hidden elevated crystals.
- **Stuns Apex Predators**: Emits a sensory-overload shockwave that stuns the **Anaconda Guardian** for 4.0 seconds, neutralizing its lunge attacks and venom projectiles.
- **HUD Cooldown**: A dynamic cyan gauge on the HUD drains during the active window and recharges smoothly.

### 2. The Anaconda Guardian (Boss & Hazard Encounter)
Guarding the ancient Banyan tree and the 3rd Lumina Crystal at x=3300:
- **Proximity State Machine**: Sways idly on the branch, transitions into an alert state (`!`) when the player approaches, and delivers a lethal downward lunge strike or spits acidic venom droplets.
- **Counter-play**: Triggering the Echo Pulse stuns the beast (triggering dazed spinning stars and recoiling its head), creating an opening to leap across the overhead Echo Platforms and claim the crystal safely!

### 3. Organic Jungle Hazards
- **Swinging Thorn Pendulum**: Real-time sine-driven pendulum with ivy leaves and spiked morningstar seed-pod tip.
- **Moving Moss Platform**: Ancient wooden platform traversing the central spike chasm.
- **Rolling Log**: Rotating wooden barrel hazard with mossy cross-sections patrolling the temple entrance.
- **Falling Canopy Boulder**: Drops from the upper foliage with warning cues, pauses, and retracts back into the canopy.
- **Spike Pits**: Stylized wooden jungle stakes along the ground path.

### 4. Zero-Asset Procedural Web Audio Engine
Rather than relying on heavy external audio files that risk latency or missing asset errors, ECHOBOUND includes a custom procedural sound synthesizer (`src/audio/SoundEffects.js`) built with the native **Web Audio API**:
- Upward pitch-gliding jump sound.
- Resonant harmonic sonar ping with sub-bass rumble for the Echo Pulse.
- Shimmering 4-note ascending crystal collection chime.
- Distorted saw-wave impact thump for damage.
- Bandpass-filtered white noise hiss and whoosh for the Anaconda attacks.
- Triumphant 4-chord victory fanfare.

---

## 📁 Repository & Codebase Architecture

```
ECHOBOUND/
├── docs/                                 # Complete Assignment Deliverables
│   ├── 1_GAME_CONCEPT.md                 # Concept, narrative, and mechanic specifications
│   ├── 2_REFERENCE_GAMES.md              # Research & analysis of 3 industry benchmark titles
│   ├── 3_ART_DIRECTION.md                # Color palette, visual themes, character & creature specs
│   ├── 4_AI_INTEGRATION_WORKFLOW.md      # Detailed AI tools, prompts, and pipeline documentation
│   ├── 5_GAMEPLAY_VIDEO_GUIDE.md         # 60-second walkthrough script & screen recording guide
│   └── 6_SUBMISSION_SUMMARY.md           # 100% evaluation rubric self-assessment & summary
├── public/
│   └── assets/
│       ├── backgrounds/
│       │   ├── jungle-world.png          # High-resolution hand-painted jungle panorama (1672x941)
│       │   └── jungle-tile.png           # Supplementary vegetation texture
│       └── characters/
│           └── jungle-boy.png            # 4-frame high-resolution hero sprite sheet (1680x560)
├── src/
│   ├── audio/
│   │   └── SoundEffects.js               # Procedural Web Audio synthesizer (0 external files)
│   ├── entities/
│   │   └── AnacondaGuardian.js           # Banyan tree rendering, Anaconda AI, lunge & venom
│   ├── scenes/
│   │   └── GameScene.js                  # Master gameplay scene, physics, HUD & level progression
│   ├── main.js                           # Phaser game bootstrap & canvas configuration
│   └── style.css                         # Mobile viewport styling, touch-action locks, & centering
├── index.html                            # HTML entry point with mobile meta tags
├── package.json                          # Dependencies & scripts (Vite, Phaser 3)
└── README.md                             # Project overview & documentation index
```

---

## 🤖 AI Tools & Development Workflow Summary

Generative AI was leveraged across every phase of development to compress a multi-week production cycle into a rapid 24-hour sprint:
1. **Concept & Narrative Generation**: Gemini 3.8 and Claude 3.5 were used for worldbuilding, setting lore, and gameplay loop design.
2. **Visual Art & Assets**: Midjourney v6 and Stable Diffusion XL generated the high-detail jungle background panorama and the athletic jungle youth character sprite sheet.
3. **Gameplay Architecture**: The Antigravity AI Agent assisted in structuring Phaser.js Arcade Physics, foot-aligned collision bounding boxes, state machines, and responsive mobile event listeners.
4. **Procedural Audio Engineering**: AI-designed mathematical frequency ramps and ADSR envelopes formed the backbone of the zero-dependency Web Audio synthesizer.

For comprehensive prompt logs, pipeline diagrams, and metrics, see [`docs/4_AI_INTEGRATION_WORKFLOW.md`](file:///e:/ECHOBOUND/docs/4_AI_INTEGRATION_WORKFLOW.md).

---

## 📊 Evaluation Criteria Mapping

| Criterion | Weight | How ECHOBOUND Meets It |
| :--- | :---: | :--- |
| **Creativity and Originality** | 25% | Original Echo Pulse acoustic resonance mechanic, non-cliché jungle setting, predator stun interactions. |
| **Gameplay Mechanics** | 20% | Continuous 4,200px level with swinging pendulums, rolling logs, falling boulders, moving platforms, and checkpoints. |
| **Art Direction** | 20% | Hand-painted illustrated jungle panorama, custom 4-frame hero sprite sheet, and procedural Banyan/Anaconda art. |
| **AI Tool Utilization** | 15% | Transparently documented use of Midjourney, LLMs, and procedural audio synthesis formulas. |
| **Speed of Prototyping** | 10% | Fully complete, polished, bug-free Level 1 delivered in a single rapid iteration. |
| **Technical Implementation** | 10% | Phaser.js Arcade Physics, Web Audio API, responsive web + mobile touch controls, 60 FPS performance. |

---

## 📄 License
MIT License. Free to use, adapt, and build upon.
