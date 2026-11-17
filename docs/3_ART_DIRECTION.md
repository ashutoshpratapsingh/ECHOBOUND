# ECHOBOUND: Art Direction & Visual Reference Guide

## 1. Aesthetic Vision & World Theme
**ECHOBOUND** is built on a visual philosophy termed **"Bioluminescent Rainforest Antiquity."** The art blends the organic warmth of lush tropical vegetation with the ethereal mystery of ancient crystalline technology. 

Rather than relying on repetitive 32x32 pixel tiles that break immersion, ECHOBOUND utilizes an **illustrated panoramic world canvas** combined with high-detail procedural vector assets. This provides the game with cinematic depth, atmospheric perspective, and high readability across both 4K desktop displays and compact mobile screens.

```
       [ Canopy Layer: Hanging Vines, Falling Boulders, Mist Particles ]
                                     │
    [ High Path: Ethereal Echo Platforms (Glowing Cyan Runes: #48edd4) ]
                                     │
   [ Midground: Ancient Banyan Tree & Giant Coiled Anaconda Guardian ]
                                     │
    [ Low Path: Mossy Ground, Rolling Log, Spike Traps, Lumina Crystals ]
                                     │
 [ Background: Multilayered Illustrated Jungle Panorama (Parallax 0.20) ]
```

---

## 2. Definitive Color Palette

| Swatch | Hex Code | Color Name | Application in Game |
| :---: | :---: | :--- | :--- |
| ![#040d0c](https://via.placeholder.com/15/040d0c/000000?text=+) | `#040d0c` | Deep Canopy Void | Canvas backdrop, vignette framing, and shadow ambient depth |
| ![#102c30](https://via.placeholder.com/15/102c30/000000?text=+) | `#102c30` | Rainforest Twilight | Far distant mountain silhouettes and mist fill |
| ![#2e4f2b](https://via.placeholder.com/15/2e4f2b/000000?text=+) | `#2e4f2b` | Verdant Moss | Hanging jungle vines, banyan foliage clumps, and grass roots |
| ![#6b9338](https://via.placeholder.com/15/6b9338/000000?text=+) | `#6b9338` | Sunlit Fern | Ground grass trim, platform moss caps, and leaf highlights |
| ![#48edd4](https://via.placeholder.com/15/48edd4/000000?text=+) | `#48edd4` | Lumina Cyan | Echo Pulse sonar waves, ethereal platforms, and crystal glows |
| ![#ffdf6d](https://via.placeholder.com/15/ffdf6d/000000?text=+) | `#ffdf6d` | Solar Amber | Activated checkpoint flag, victory banner, and crystal cores |
| ![#ff3b30](https://via.placeholder.com/15/ff3b30/000000?text=+) | `#ff3b30` | Hazard Red | Spike tips, Anaconda threat eyes, hazard alert icons (`!`) |
| ![#134611](https://via.placeholder.com/15/134611/000000?text=+) | `#134611` | Emerald Scale | Anaconda body coils, back scales, and predatory shading |

---

## 3. Character Design: Kael the Jungle Seeker
- **Concept**: An athletic, nimble jungle youth dressed in lightweight earthen adventure garb.
- **Visual Scale**: Rendered at a high native resolution (1680x560 sprite sheet) and scaled gracefully in-engine to preserve crisp lines.
- **Physics Alignment**: The physics bounding body is strictly anchored to the hero's feet (150x210 box with offset 135, 350) ensuring that the artwork sits cleanly on the grassy surface without sinking or floating.
- **Animation States**:
  1. `hero-idle` (Frame 0): Natural standing pose with subtle breathing rhythm.
  2. `hero-run` (Frames 0 & 1): Energetic forward sprint with footstep dust puff effects.
  3. `hero-jump` (Frame 2): Acrobatic tuck with dynamic vertical leap posture.
  4. `hero-land` (Frame 3): Absorbing impact crouch upon platform contact.

---

## 4. Boss & Creature Design: The Anaconda Guardian
- **Anatomy & Rendering**:
  - Rendered as an imposing apex predator coiled around the massive horizontal branch of an ancient Banyan tree at x=3300.
  - Sinuous muscular body with four distinct coil rings, dual-tone emerald back scales, and golden ventral underbelly plates.
  - Angular viper head featuring flared jaw nostrils, glowing red slit eyes, dual ivory fangs, and an animated red forked tongue.
- **Animation & States**:
  - **Idle Sway**: Sine wave easing of the head and neck mimicking a patient coiled serpent.
  - **Tongue Flick**: Periodic scaling tween of the forked tongue every 2.4s.
  - **Lunge Strike**: Swift downward snap toward the floor with fangs bared, leaving a lethal contact zone before smoothly recoiling.
  - **Venom Spit**: Arcing acidic green droplet projectile with particle trail.
  - **Stunned State**: Induced by the Echo Pulse; head recoils backwards, amber slit eyes lose focus, and 4 cyan spinning stars rotate overhead for 4.0 seconds.

---

## 5. Environmental Props & Traps
1. **The Ancient Banyan Tree**:
   - Massive weathered trunk with root spurs, bark texture striations, hanging ivy creepers, and overlapping leaf ellipses providing natural canopy cover.
2. **Swinging Thorn Pendulum**:
   - Realistic wooden vine rope with alternating ivy leaves terminating in a spiked seed-pod morningstar that swings with trigonometric accuracy.
3. **Rolling Log**:
   - Chiseled tree trunk with bark cross-sections and moss patches, rolling horizontally across the player's path.
4. **Lumina Crystals**:
   - Hexagonal faceted cyan gems enclosed in pulsating atmospheric light halos, floating and rotating 360° continuously.
5. **Awakened Exit Portal**:
   - Multilayered dimensional gateway with an outer verdigris ring, inner emerald mist, radiant white-cyan singularity core, and rotating astral glyphs.

---

## 6. Visual Effects (VFX) Pipeline
- **Parallax Scrolling**: Background panorama scrolls at 0.20x speed, establishing immense atmospheric scale.
- **Canopy Mist**: 40 drifting translucent mist spheres with random durations and alpha oscillations.
- **Bioluminescent Fireflies**: 35 floating yellow-green particles with gentle vertical oscillation and scaling.
- **Echo Sonar Shockwave**: Concentric cyan rings expanding outward to radius 380px accompanied by screen flashes.
- **Dust Puffs**: Dynamic green-tinted ground dust bursts created whenever Kael jumps or lands.
- **Crystal Collection Flare**: 16-point radial starburst particle explosion upon collecting a crystal.
