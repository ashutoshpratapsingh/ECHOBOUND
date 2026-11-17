# ECHOBOUND: Realms of Echo – Game Concept & Mechanics Document

## 1. High Concept & Creative Premise
**ECHOBOUND: Realms of Echo** is an original 2D atmospheric jungle adventure platformer designed for Web and Mobile platforms using Phaser.js. 

The player controls **Kael**, a courageous youth exploring the forgotten rainforest canopy of *Veridia*. Veridia's life energy is powered by the **Lumina Sun Gateways**, which have fallen silent. Armed with an ancient bio-acoustic resonance amulet, Kael can project the **Echo Pulse**—an acoustic sonar wave that reveals invisible ancient ruins, dazes apex predators, and allows traversal of treacherous chasms.

---

## 2. Core Innovation: The "Echo Pulse" Mechanic
While traditional platformers rely solely on running and jumping, ECHOBOUND introduces acoustic sonar resonance as a central dual-function mechanic:

1. **Acoustic Bridge Solidification**:
   - The ancient canopy contains forgotten ethereal structures (`Echo Platforms`).
   - Triggering the Echo Pulse (`E` on desktop, `ECHO` touch button on mobile) radiates concentric sonar shockwaves from the hero.
   - For **3.2 seconds**, ethereal cyan platforms solidify with glowing runes, allowing the player to cross chasms, ascend vertical walls, and reach secret high-canopy crystals.
   - A dynamic HUD gauge drains during the active window and smoothly recharges.
2. **Predator Sensory Stun**:
   - The forest's apex predator—the colossal **Anaconda Guardian**—relies on sensitive heat and kinetic vibration tracking.
   - Projecting an Echo Pulse overloads the serpent's sensory organs, inducing a **4.0-second stun state** where it recoils backward with dizzy spinning stars overhead, halting all lunge strikes and acidic venom projectiles.

---

## 3. The 3-Level Progression Structure

```
[MENU / LEVEL SELECT] 
       │
       ├──► LEVEL 1: The Whispering Canopy (2,800px)
       │    • Pacing: Tutorial & introduction to Echo Pulse.
       │    • Obstacles: Ground thorn spikes, floating stepping stones.
       │    • Collectibles: 3 Sun Crystals to awaken the Gateway.
       │    • Checkpoint: Golden Sun Totem at x=1750.
       │
       ├──► LEVEL 2: The Ancient Chasm (3,400px)
       │    • Pacing: Precision timing & dynamic organic physics hazards.
       │    • Obstacles: Moving mossy platforms, swinging thorn morningstar pendulum,
       │      rolling spiked logs, falling canopy boulder traps.
       │    • Collectibles: 3 Moon Crystals.
       │    • Checkpoint: Totem at x=2200.
       │
       └──► LEVEL 3: The Anaconda Guardian's Sanctum (3,800px)
            • Pacing: Climax & multi-phase boss encounter!
            • Boss AI: Coiled Anaconda on ancient Banyan tree with alert cues,
              downward lunge attacks, and venom spit projectiles.
            • Counter-play: Echo Pulse stuns the boss and reveals high canopy
              platforms to collect the final Lumina Heart Crystal.
            • Grand Finale: Entering the awakened Great Sun Portal.
```

---

## 4. Systems Architecture
| System | Implementation | Player Feedback |
| :--- | :--- | :--- |
| **Hero Agility** | Arcade Physics with custom foot-anchored hitbox | Running dust puffs, synthesized footsteps, responsive jump glide |
| **Echo Pulse** | Concentric circle tweens, delayed physics activation, stun radius broadcast | Concentric cyan shockwaves, screen flash, audio ping, HUD cooldown gauge |
| **Boss AI** | 5-state machine (`IDLE` -> `ALERT` -> `LUNGE` / `VENOM` -> `STUNNED`) | Warning hiss, red eye flare, alert badge (`!`), dazed spinning stars |
| **Hazard Physics** | Trigonometric pendulum kinematics, linear patrolling, drop-pause-retract cycles | Motion telegraphs, collision impact sounds, screen shake |
| **Procedural Audio**| Real-time Web Audio API synthesis (0 external asset files) | Zero latency, zero 404s, interactive HUD mute toggle |
| **Dual Controls** | Keyboard (`WASD`/`Space`/`E`) + Mobile Touch (`◀`, `▶`, `JUMP`, `ECHO`) | `touch-action: none` viewport lock, high contrast buttons |
