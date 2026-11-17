/**
 * ECHOBOUND - Anaconda Guardian & Ancient Canopy Tree
 * Combines illustrated procedural art with interactive enemy attack AI,
 * lunge strike mechanics, venom spit projectiles, and Echo Pulse stun vulnerability.
 */

import Phaser from "phaser";
import { audioManager } from "../audio/SoundEffects";

export class AnacondaGuardian {
  constructor(scene, x, y) {
    this.scene = scene;
    this.x = x;
    this.y = y;

    this.state = "IDLE"; // IDLE, ALERT, LUNGING, RETRACTING, STUNNED
    this.stunDuration = 4000;
    this.attackCooldown = false;
    this.attackRange = 360;
    this.strikeRange = 190;
    this.isStunned = false;

    this.venomProjectiles = this.scene.physics.add.group();

    this.buildAncientTree();
    this.buildAnaconda();
    this.setupColliders();
  }

  // Draw ancient jungle banyan tree with gnarled roots and mossy branches
  buildAncientTree() {
    this.treeContainer = this.scene.add.container(this.x, this.y).setDepth(4);

    const treeGraphics = this.scene.add.graphics();

    // Massive Trunk
    treeGraphics.fillStyle(0x3a2518, 1);
    treeGraphics.beginPath();
    treeGraphics.moveTo(-50, 200);
    treeGraphics.lineTo(-70, 0);
    treeGraphics.lineTo(-20, -140);
    treeGraphics.lineTo(30, -140);
    treeGraphics.lineTo(60, 0);
    treeGraphics.lineTo(80, 200);
    treeGraphics.closePath();
    treeGraphics.fillPath();

    // Trunk bark texture lines
    treeGraphics.lineStyle(5, 0x24150d, 0.85);
    treeGraphics.lineBetween(-40, 180, -55, 10);
    treeGraphics.lineBetween(-15, 160, -25, -50);
    treeGraphics.lineBetween(20, 170, 15, -40);
    treeGraphics.lineBetween(50, 180, 45, 10);

    // Sprawling ancient branch where the Anaconda rests
    treeGraphics.fillStyle(0x422c1b, 1);
    treeGraphics.fillRoundedRect(-140, -42, 340, 36, 14);
    treeGraphics.lineStyle(4, 0x26170d, 1);
    treeGraphics.strokeRoundedRect(-140, -42, 340, 36, 14);

    // Moss and creeping vines on branch
    treeGraphics.fillStyle(0x608b38, 1);
    treeGraphics.fillRoundedRect(-135, -46, 110, 12, 5);
    treeGraphics.fillRoundedRect(10, -46, 130, 11, 5);

    // Hanging ivy vines from branch
    treeGraphics.lineStyle(4, 0x3d702d, 0.95);
    treeGraphics.beginPath();
    treeGraphics.moveTo(-100, -10);
    treeGraphics.lineTo(-105, 55);
    treeGraphics.lineTo(-98, 95);

    treeGraphics.moveTo(80, -10);
    treeGraphics.lineTo(75, 65);
    treeGraphics.lineTo(84, 110);
    treeGraphics.strokePath();

    // Canopy foliage clumps
    const leafColors = [0x144d2b, 0x1f6b3d, 0x328b4c, 0x5fa845];
    for (let i = 0; i < 9; i++) {
      treeGraphics.fillStyle(leafColors[i % leafColors.length], 0.92);
      treeGraphics.fillEllipse(
        -120 + i * 36,
        -130 + (i % 3) * 14,
        95,
        52
      );
    }

    this.treeContainer.add(treeGraphics);

    // Branch solid platform so hero can climb if desired
    this.branchPlatform = this.scene.add.rectangle(
      this.x + 30,
      this.y - 30,
      280,
      20,
      0x000000,
      0
    );
    this.scene.physics.add.existing(this.branchPlatform, true);
    this.scene.physics.add.collider(this.scene.player, this.branchPlatform);
  }

  // Draw the giant emerald anaconda with coiled body and animated head
  buildAnaconda() {
    this.snakeContainer = this.scene.add.container(this.x + 40, this.y - 42).setDepth(6);

    const bodyArt = this.scene.add.graphics();

    // Coiled body rings around the branch
    const coils = [
      { x: -75, y: -8, r: 24 },
      { x: -35, y: -12, r: 27 },
      { x: 5, y: -10, r: 25 },
      { x: 45, y: -6, r: 23 }
    ];

    coils.forEach(c => {
      // Dark scales
      bodyArt.fillStyle(0x134611, 1);
      bodyArt.fillCircle(c.x, c.y, c.r);
      // Emerald sheen
      bodyArt.fillStyle(0x2d8a27, 1);
      bodyArt.fillCircle(c.x - 4, c.y - 4, c.r * 0.75);
      // Yellow-gold ventral scale spots
      bodyArt.fillStyle(0xd4ac0d, 0.9);
      bodyArt.fillEllipse(c.x + 2, c.y + 6, c.r * 0.5, c.r * 0.28);
      // Scale outline
      bodyArt.lineStyle(3, 0x0a2609, 0.9);
      bodyArt.strokeCircle(c.x, c.y, c.r);
    });

    this.snakeContainer.add(bodyArt);

    // Dynamic Sinuous Neck and Head Container (animates during strike)
    this.headContainer = this.scene.add.container(70, -18).setDepth(7);

    const headArt = this.scene.add.graphics();

    // Thick muscular S-curve neck
    headArt.fillStyle(0x1e6819, 1);
    headArt.fillRoundedRect(-24, -12, 48, 26, 11);
    headArt.lineStyle(3, 0x0c3109, 1);
    headArt.strokeRoundedRect(-24, -12, 48, 26, 11);

    // Flared viper/anaconda snout
    headArt.fillStyle(0x278021, 1);
    headArt.beginPath();
    headArt.moveTo(10, -16);
    headArt.lineTo(44, -5);
    headArt.lineTo(48, 5);
    headArt.lineTo(12, 16);
    headArt.closePath();
    headArt.fillPath();
    headArt.lineStyle(3, 0x0c3109, 1);
    headArt.strokePath();

    // Golden belly under jaw
    headArt.fillStyle(0xebd144, 1);
    headArt.beginPath();
    headArt.moveTo(16, 5);
    headArt.lineTo(42, 5);
    headArt.lineTo(24, 14);
    headArt.closePath();
    headArt.fillPath();

    // Sharp fangs
    headArt.fillStyle(0xffffff, 1);
    headArt.fillTriangle(34, 4, 38, 4, 36, 15);
    headArt.fillTriangle(26, 4, 30, 4, 28, 13);

    // Glowing menacing slit eye
    headArt.fillStyle(0xff1e1e, 1);
    headArt.fillCircle(25, -8, 6);
    headArt.fillStyle(0x1a0000, 1);
    headArt.fillEllipse(25, -8, 2, 7); // Slit pupil

    // Flickering forked tongue
    this.tongue = this.scene.add.graphics();
    this.tongue.lineStyle(2.5, 0xd91438, 1);
    this.tongue.beginPath();
    this.tongue.moveTo(48, 2);
    this.tongue.lineTo(62, 2);
    this.tongue.lineTo(70, -4);
    this.tongue.moveTo(62, 2);
    this.tongue.lineTo(70, 8);
    this.tongue.strokePath();

    this.headContainer.add(headArt);
    this.headContainer.add(this.tongue);
    this.snakeContainer.add(this.headContainer);

    // Stunned indicator container (stars that rotate when dazed)
    this.stunStars = this.scene.add.container(70, -60).setAlpha(0);
    for (let i = 0; i < 4; i++) {
      const star = this.scene.add.text(
        Math.cos((i * Math.PI) / 2) * 22,
        Math.sin((i * Math.PI) / 2) * 14,
        "★",
        { fontSize: "19px", color: "#6df5e7" }
      ).setOrigin(0.5);
      this.stunStars.add(star);
    }
    this.snakeContainer.add(this.stunStars);

    // Alert indicator exclamation
    this.alertIcon = this.scene.add.text(
      70, -55, "!",
      {
        fontSize: "28px",
        fontStyle: "bold",
        color: "#ff3b30",
        stroke: "#ffffff",
        strokeThickness: 3
      }
    ).setOrigin(0.5).setAlpha(0);
    this.snakeContainer.add(this.alertIcon);

    // Damage Hitbox for snake head
    this.headHitbox = this.scene.add.circle(this.x + 110, this.y - 50, 32, 0xff0000, 0);
    this.scene.physics.add.existing(this.headHitbox);
    this.headHitbox.body.setAllowGravity(false);
    this.headHitbox.body.setImmovable(true);

    // Idle sway tween
    this.idleTween = this.scene.tweens.add({
      targets: this.headContainer,
      y: { from: -18, to: -28 },
      angle: { from: -4, to: 6 },
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });

    // Tongue flick interval
    this.scene.time.addEvent({
      delay: 2400,
      callback: () => {
        if (!this.isStunned) {
          this.scene.tweens.add({
            targets: this.tongue,
            scaleX: { from: 0.1, to: 1.2 },
            duration: 180,
            yoyo: true,
            repeat: 2
          });
        }
      },
      loop: true
    });
  }

  setupColliders() {
    // Touching the head damages player
    this.scene.physics.add.overlap(this.scene.player, this.headHitbox, () => {
      if (!this.isStunned) {
        this.scene.damagePlayer(1);
      }
    });

    // Venom collision with player
    this.scene.physics.add.overlap(this.scene.player, this.venomProjectiles, (player, venom) => {
      if (!this.isStunned) {
        venom.destroy();
        this.scene.damagePlayer(1);
      }
    });
  }

  update() {
    if (!this.scene.player || !this.scene.player.active) return;

    // Synchronize hitbox position with headContainer
    const worldHeadX = this.snakeContainer.x + this.headContainer.x;
    const worldHeadY = this.snakeContainer.y + this.headContainer.y;
    this.headHitbox.setPosition(worldHeadX, worldHeadY);
    this.headHitbox.body.updateFromGameObject();

    if (this.isStunned) return;

    const dist = Phaser.Math.Distance.Between(
      this.scene.player.x,
      this.scene.player.y,
      worldHeadX,
      worldHeadY
    );

    // State behavior
    if (dist < this.strikeRange && !this.attackCooldown) {
      this.executeLungeStrike();
    } else if (dist < this.attackRange) {
      if (this.state !== "ALERT") {
        this.enterAlertState();
      }
      // Spits venom periodically
      if (!this.attackCooldown && Math.random() < 0.015) {
        this.spitVenom();
      }
    } else if (this.state === "ALERT") {
      this.enterIdleState();
    }
  }

  enterAlertState() {
    this.state = "ALERT";
    audioManager.playSnakeHiss();
    this.scene.tweens.add({
      targets: this.alertIcon,
      alpha: 1,
      scale: { from: 0.5, to: 1.3 },
      duration: 300,
      yoyo: true,
      repeat: 1
    });
  }

  enterIdleState() {
    this.state = "IDLE";
    this.alertIcon.setAlpha(0);
  }

  // Lethal downward strike towards player position
  executeLungeStrike() {
    this.attackCooldown = true;
    this.state = "LUNGING";
    audioManager.playSnakeStrike();

    const targetY = 110; // lunge down towards ground level

    this.scene.tweens.add({
      targets: this.headContainer,
      x: 100,
      y: targetY,
      angle: 45,
      duration: 320,
      ease: "Quad.easeIn",
      onComplete: () => {
        // Quick pause at strike apex
        this.scene.time.delayedCall(160, () => {
          this.state = "RETRACTING";
          this.scene.tweens.add({
            targets: this.headContainer,
            x: 70,
            y: -18,
            angle: 0,
            duration: 650,
            ease: "Sine.easeOut",
            onComplete: () => {
              this.state = "IDLE";
              // Reset attack cooldown
              this.scene.time.delayedCall(1200, () => {
                this.attackCooldown = false;
              });
            }
          });
        });
      }
    });
  }

  // Spits venom acid droplet towards player
  spitVenom() {
    this.attackCooldown = true;
    audioManager.playSnakeHiss();

    const startX = this.snakeContainer.x + this.headContainer.x + 35;
    const startY = this.snakeContainer.y + this.headContainer.y;

    const venom = this.scene.add.circle(startX, startY, 9, 0x44ff3b, 0.95);
    venom.setStrokeStyle(2, 0xffffff);
    this.venomProjectiles.add(venom);

    // Particle trail
    const venomTrail = this.scene.add.particles(0, 0, null, {
      x: startX,
      y: startY,
      follow: venom,
      scale: { start: 0.6, end: 0 },
      alpha: { start: 0.8, end: 0 },
      tint: 0x63ff54,
      lifespan: 300,
      frequency: 45
    });

    const targetX = this.scene.player.x;
    const dx = targetX - startX;
    const vx = Phaser.Math.Clamp(dx * 1.4, -280, 280);

    venom.body.setVelocity(vx, -180);
    venom.body.setGravityY(520);

    // Cleanup after 2.5 seconds or on floor hit
    this.scene.time.delayedCall(2500, () => {
      if (venom.active) {
        venomTrail.destroy();
        venom.destroy();
      }
    });

    this.scene.time.delayedCall(2200, () => {
      this.attackCooldown = false;
    });
  }

  // Triggered when Player casts Echo Pulse
  stun() {
    if (this.isStunned) return;

    this.isStunned = true;
    this.state = "STUNNED";
    audioManager.playSnakeStun();

    // Flash cyan tint
    this.scene.cameras.main.flash(180, 100, 245, 235);
    this.alertIcon.setAlpha(0);

    // Recoil head backwards
    this.scene.tweens.killTweensOf(this.headContainer);
    this.scene.tweens.add({
      targets: this.headContainer,
      x: 35,
      y: -38,
      angle: -25,
      duration: 400,
      ease: "Back.easeOut"
    });

    // Show dizzy spinning stars
    this.stunStars.setAlpha(1);
    const starTween = this.scene.tweens.add({
      targets: this.stunStars,
      angle: 360,
      duration: 1200,
      repeat: -1
    });

    this.scene.showMessage("ANACONDA STUNNED BY ECHO PULSE!", 2200);

    // Wake up after stunDuration
    this.scene.time.delayedCall(this.stunDuration, () => {
      this.isStunned = false;
      this.state = "IDLE";
      starTween.stop();
      this.stunStars.setAlpha(0);

      // Return head to normal idle
      this.scene.tweens.add({
        targets: this.headContainer,
        x: 70,
        y: -18,
        angle: 0,
        duration: 800,
        ease: "Sine.easeInOut",
        onComplete: () => {
          this.idleTween = this.scene.tweens.add({
            targets: this.headContainer,
            y: { from: -18, to: -28 },
            angle: { from: -4, to: 6 },
            duration: 1800,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut"
          });
        }
      });
    });
  }
}
