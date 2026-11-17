# Gameplay Demonstration Video & Screen Capture Guide

This guide provides everything needed to record, review, or evaluate a short (60–90 second) gameplay demonstration video for **ECHOBOUND: The Lost Light**.

---

## 1. Quick Capture Instructions

### Option A: Windows Built-in Xbox Game Bar (Recommended, Zero Installs)
1. Launch the local dev server: `npm run dev` (or open the hosted link).
2. Press `Win + Alt + R` on Windows to start recording immediately.
3. Play through the demonstration sequence outlined below (approx. 60–75 seconds).
4. Press `Win + Alt + R` again to stop recording.
5. The MP4 video file will be saved directly to `Videos\Captures`.

### Option B: OBS Studio or Chrome Tab Recorder
1. In OBS, select **Window Capture** or **Browser Source** at 1920x1080 @ 60 FPS.
2. Ensure system desktop audio is captured to record the synthesized Web Audio SFX (Echo ping, jump whoosh, crystal chimes, snake hisses).

---

## 2. Timed 60-Second Walkthrough Script

| Timestamp | Game Action | Audio & Visual Highlights | Evaluation Focus |
| :---: | :--- | :--- | :--- |
| **00:00 - 00:08** | **Title Screen & Initiation** | Click "PRESS SPACE OR CLICK TO BEGIN". Resonant Echo Pulse chime sounds, mist particles and fireflies drift across the hand-painted jungle panorama. | *Art Direction & Atmosphere* |
| **00:08 - 00:20** | **Fluid Movement & Crystal #1** | Run right using `D` or `Arrow Right`. Note dust puffs and footstep sounds. Jump across the first spike trap at x=700 and collect **Lumina Crystal #1** (dual-tone chime, 16-point star explosion). | *Controls & Physics Responsiveness* |
| **00:20 - 00:34** | **Echo Pulse & Chasm Traversal** | Approach the wide chasm at x=850. Press `E` to cast **Echo Pulse**. Concentric cyan sonar waves flash across the screen; translucent rune platforms solidify. Leap across the platforms and duck beneath the swinging thorn vine pendulum at x=1080. | *Core Innovation: Echo Pulse* |
| **00:34 - 00:46** | **Moving Platform & Checkpoint** | Ride the moving moss platform across the spike gap (x=1480-1720). Time a leap over the rolling thorn log (x=1860). Collect **Crystal #2** at x=2060. Pass the checkpoint totem at x=2450 (flag turns gold, chime plays). | *Level Pacing & Obstacles* |
| **00:46 - 00:58** | **The Anaconda Guardian Encounter** | Arrive at the ancient Banyan tree at x=3300. The giant Emerald Anaconda alerts (`!`), hisses, and lunges downward! Press `E` (Echo Pulse): the sonar wave stuns the snake with spinning stars for 4s. Leap onto the revealed upper canopy platforms to collect **Crystal #3**! | *Creativity, AI Enemy & Climax* |
| **00:58 - 01:10** | **Portal Awakening & Victory** | All 3 crystals light up the HUD! The mystical Exit Portal at x=4050 activates with radiant energy flares. Enter the portal: triumphant victory fanfare plays, celebration overlay displays stats, and prompt invites replay. | *Polish & Game Feel* |

---

## 3. Key Moments to Highlight in Evaluation
1. **Sonar Visual Feedback**: Notice the concentric wave animation expanding from the player and the HUD gauge draining during the 3.2s active window.
2. **Anaconda Reaction**: Watch the Anaconda’s head recoil backwards into a dazed state with spinning cyan stars when hit by the Echo Pulse.
3. **Foot-aligned Ground Contact**: Observe that Kael runs squarely on top of the grass rather than sinking through the floor tiles.
4. **Responsive Mobile Controls**: Testable on touchscreens or with mouse clicks on the on-screen D-pad and action buttons.
