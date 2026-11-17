# ECHOBOUND: The Lost Light – Game Concept & Design Document

## 1. Executive Summary
**ECHOBOUND: The Lost Light** is an atmospheric 2D cinematic platformer developed for Web and Mobile platforms using Phaser.js. Set within the bioluminescent canopy of an ancient rainforest, the game pairs fluid platforming navigation with an original core mechanic: the **Echo Pulse**. 

Players control **Kael**, a nimble jungle youth armed with an ancestral bio-acoustic resonance talisman. By projecting acoustic pulses into his surroundings, Kael can reveal forgotten ethereal pathways, disorient apex predators such as the colossal **Anaconda Guardian**, and restore the three sacred **Lumina Crystals** required to reopen the ancient light portal.

---

## 2. Core Premise & Narrative
The deep forest of *Veridia* was once kept in balance by the three Sun-Forged Lumina Crystals resting within the Great Canopy Portal. A shadowy blight shattered the portal, scattering the crystals across dangerous ruins and causing the wild creatures to grow hyper-aggressive.

Armed only with his agility and the sacred Echo Talisman, Kael ventures into the dense lower jungle. To survive the treacherous obstacles, swinging thorn vines, tumbling logs, falling boulders, and territorial apex predators, he must learn to read the environment through sound.

---

## 3. The Core Innovation: "Echo Pulse"
While traditional platformers rely purely on jumping and dodging, ECHOBOUND integrates **acoustic perception** as a dual puzzle-solving and combat-survival mechanic:

### Mechanic Specifications:
1. **Sonar Wave Expansion**:
   - Pressing `E` (or tapping the mobile `ECHO` button) triggers concentric sonar shockwaves radiating from Kael.
   - Accompanying audio: Synthesized sub-bass resonance transitioning into a high-frequency shimmering ping.
2. **Ethereal Platform Solidification**:
   - The forest contains ancient ruins invisible to the naked eye.
   - When struck by the Echo Pulse, these translucent cyan stepping stones illuminate and solidify for **3.2 seconds**, providing temporary bridges across hazardous pits and elevated shortcuts.
   - A real-time HUD gauge drains during the active window and recharges smoothly.
3. **Predator Stun & Repulsion**:
   - Apex predators like the **Anaconda Guardian** rely on thermal and kinetic senses. The high-frequency acoustic shockwave overloads their sensory organs.
   - Striking the Anaconda with an Echo Pulse induces a **4.0-second stun state**, recoiling the beast, displaying dizzy stars, disabling its venom spit and lunge strikes, and opening a window for safe traversal.

---

## 4. Gameplay Progression & Level 1 Architecture
Level 1 is crafted as a continuous, progressively challenging 4,200-pixel scrolling world divided into four distinct gameplay beats:

```
[Start: x=100] ──> [Section 1: The Outskirts & Crystal #1] (x=100-800)
                 └── Introduces movement, jump, first spike pit, and Crystal #1.
                 
[Section 2: Resonant Chasm] (x=800-1800)
                 └── Echo platform tutorial, swinging thorn pendulum, moving mossy platform.
                 
[Section 3: Temple Ruins & Checkpoint] (x=1800-2800)
                 └── Rolling thorn log, Crystal #2 on altar, golden checkpoint totem, falling boulder.
                 
[Section 4: Anaconda's Lair & Crystal #3] (x=2800-3650)
                 └── Ancient Banyan tree, territorial Anaconda Guardian (lunge + venom attacks).
                 └── Solution: Echo Pulse stuns snake and reveals high canopy platforms to Crystal #3!
                 
[Section 5: The Lost Light Portal] (x=3650-4200)
                 └── Final leap over spike chasm to the radiant 3-crystal awakened exit portal.
```

---

## 5. Gameplay Systems Overview
| System | Implementation | Player Feedback |
| :--- | :--- | :--- |
| **Movement & Physics** | Arcade Physics with precise acceleration, deceleration, and custom foot hitbox | Running dust puffs, footstep audio, responsive air control |
| **Echo Pulse** | Dynamic circle tweens, delayed platform physics activation, stun radius broadcast | Concentric cyan shockwaves, screen flash, audio ping, HUD cooldown bar |
| **Anaconda AI** | Proximity state machine: `IDLE` -> `ALERT` -> `LUNGE` / `VENOM SPIT` -> `STUNNED` | Alert exclamation mark, venom particle projectile, dazed stars, hiss SFX |
| **Health & Damage** | 3 Hearts, invulnerability frames (800ms), camera shake, red damage flash | Heart UI depletion, hurt knockback audio, checkpoint respawn |
| **Checkpoints** | Interactive totem at x=2450 that remembers coordinates upon player passage | Flag color change from gray to gold, glowing light pulse, chime audio |
| **Crystal Restoration**| 3 faceted collectibles required to awaken the exit portal | Shimmering particle burst, dual-chime audio, portal unlock animation |

---

## 6. Controls & Platform Ergonomics

### Web / Desktop:
- **Left / Right Movement**: `A` / `D` or `Arrow Left` / `Arrow Right`
- **Jump**: `Spacebar`, `W`, or `Arrow Up`
- **Echo Pulse**: `E`
- **Audio Toggle**: Interactive HUD Button (`🔊 SFX ON` / `🔇 SFX OFF`)
- **Restart**: `Enter` on Game Over / Victory screen

### Mobile / Touch Devices:
- **Left / Right**: Ergonomic virtual directional buttons on lower-left screen.
- **Jump**: Dedicated high-contrast green action button on lower-right screen.
- **Echo Pulse**: Dedicated cyan resonant ability button adjacent to Jump.
- **Viewport Scaling**: Fully responsive Phaser FIT mode scaling smoothly to 16:9, portrait, or landscape tablet screens with `touch-action: none` to eliminate browser swipe conflicts.
