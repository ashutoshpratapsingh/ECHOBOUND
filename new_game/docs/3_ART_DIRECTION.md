# ECHOBOUND: Art Direction & Visual Reference Guide

## 1. Aesthetic Vision: "Bioluminescent Rainforest Antiquity"
The visual identity of **ECHOBOUND** unites the untamed grandeur of tropical virgin rainforests with the mystical glow of ancient crystalline energy. 

Rather than relying on low-resolution repeating tiles that break visual immersion, the game employs:
1. An **illustrated panoramic jungle backdrop** (`1672x941`) moving with subtle 0.20x parallax.
2. High-resolution athletic hero keyframes (`1680x560` 4-frame sprite sheet).
3. Detailed procedural canvas vector art for the Ancient Banyan Tree, the Anaconda Guardian, moving mossy platforms, swinging thorn pendulums, and rotating faceted crystals.
4. Programmatic fallback rendering ensuring that the game looks clean under any browser environment.

---

## 2. Color Palette & Application

| Color Swatch | Hex Code | Visual Application in ECHOBOUND |
| :---: | :---: | :--- |
| ![#050f0e](https://via.placeholder.com/15/050f0e/000000?text=+) | `#050f0e` | Deep Canopy Shadow: Background fills, canvas frame, vignette boundaries |
| ![#0e2e28](https://via.placeholder.com/15/0e2e28/000000?text=+) | `#0e2e28` | Rainforest Twilight: Far foliage silhouettes, mountain backdrops |
| ![#2e4f2b](https://via.placeholder.com/15/2e4f2b/000000?text=+) | `#2e4f2b` | Verdant Moss: Hanging lianas, banyan trunk moss, creeping ground ivy |
| ![#6b9338](https://via.placeholder.com/15/6b9338/000000?text=+) | `#6b9338` | Sunlit Fern: Top ground turf, platform caps, foreground vegetation |
| ![#48edd4](https://via.placeholder.com/15/48edd4/000000?text=+) | `#48edd4` | Lumina Cyan: Echo Pulse sonar waves, ethereal platforms, crystal glow halos |
| ![#ffdf6d](https://via.placeholder.com/15/ffdf6d/000000?text=+) | `#ffdf6d` | Solar Amber: Activated checkpoint banner, victory confetti, crystal cores |
| ![#ff3b30](https://via.placeholder.com/15/ff3b30/000000?text=+) | `#ff3b30` | Threat Red: Ground spike tips, Anaconda eyes, hazard alert icons (`!`) |
| ![#134611](https://via.placeholder.com/15/134611/000000?text=+) | `#134611` | Emerald Scale: Anaconda body coils, back scales, serpent shading |

---

## 3. Character Design: Kael the Jungle Seeker
- **Concept**: Agile jungle youth wearing earthen adventure attire and the sacred Echo Amulet.
- **Physics Geometry**: Foot-anchored bounding box (`150x210` with offset `135, 350`) ensures natural foot placement atop ground platforms.
- **Animation States**:
  - `hero-idle` (Frame 0): Relaxed standing stance with subtle breathing.
  - `hero-run` (Frames 0 & 1): Fast forward sprint with ground dust puffs.
  - `hero-jump` (Frame 2): Acrobatic vertical leap with knees tucked.
  - `hero-land` (Frame 3): Impact absorption crouch upon landing.

---

## 4. Boss & Creature Design: The Anaconda Guardian
- **Anatomy**:
  - Coiled along a massive weathered horizontal Banyan branch at x=3150 in Level 3.
  - Muscular body comprised of concentric green and gold scales (`0x134611` / `0x2d8a27` / `0xd4ac0d`).
  - Sinuous head container featuring flared nostrils, glowing red slit eyes (`0xff1e1e`), razor fangs, and an animated flickering red forked tongue.
- **Animation States**:
  - `IDLE`: Sine-eased gentle breathing and periodic tongue flick.
  - `ALERT`: Coils tense, eyes glow crimson, alert icon (`!`) pops, warning hiss audio triggers.
  - `LUNGE STRIKE`: Snaps downward 110px toward ground level with open jaws before recoiling.
  - `VENOM SPIT`: Fires an arcing acidic green droplet projectile toward the player.
  - `STUNNED`: When hit with the Echo Pulse, the head recoils backward (-25°), amber slit eyes lose focus, and 4 cyan spinning stars rotate overhead for 4.0 seconds.

---

## 5. Visual Effects Pipeline
- **Parallax Background**: Smooth 0.20x scroll factor providing infinite horizontal landscape depth.
- **Canopy Mist**: 35 drifting translucent mist spheres with random durations and alpha oscillations.
- **Bioluminescent Fireflies**: 30 floating glowing particles with gentle vertical oscillation.
- **Echo Sonar Shockwave**: 3 concentric cyan rings expanding outward to 380px accompanied by screen flashes.
- **Dust Puffs**: Dynamic green-tinted ground dust bursts created whenever Kael jumps or lands.
- **Crystal Flare**: 16-point radial starburst particle explosion upon collecting a crystal.
