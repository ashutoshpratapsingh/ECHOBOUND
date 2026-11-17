import Phaser from "phaser";

class AnacondaBoss {
  constructor(scene, x, y) {
    this.scene = scene;
    this.x = x;
    this.y = y;

    // Boss Combat Stats
    this.maxHp = 3;
    this.hp = 3;
    this.alive = true;
    this.isStunned = false;
    this.stunDuration = 3800;
    this.attackCooldown = false;

    // Phase 1 Ranges
    this.attackRange = 460;
    this.strikeRange = 250;
    this.state = "IDLE"; // IDLE, ALERT, LUNGING, RETRACTING, STUNNED
    this.introShown = false;

    // Sinuous Patrol Movement along the Banyan Branch (Guarding Crystal 3)
    this.currentX = x + 30;
    this.patrolMinX = 2990;
    this.patrolMaxX = 3250;
    this.facing = 1; // 1 = right, -1 = left
    this.isPaused = false;

    this.venomProjectiles = this.scene.physics.add.group();

    this.buildAncientTree();
    this.buildGiantAnaconda();
    this.setupBossHUD();
    this.setupColliders();
  }

  buildAncientTree() {
    this.treeContainer = this.scene.add.container(this.x, this.y).setDepth(4);
    this.treeContainer.setScale(1.25); // Enlarged tree to support giant Anaconda

    const treeArt = this.scene.add.graphics();

    // Massive Trunk
    treeArt.fillStyle(0x382215, 1);
    treeArt.beginPath();
    treeArt.moveTo(-60, 200);
    treeArt.lineTo(-80, 0);
    treeArt.lineTo(-25, -150);
    treeArt.lineTo(35, -150);
    treeArt.lineTo(70, 0);
    treeArt.lineTo(95, 200);
    treeArt.closePath();
    treeArt.fillPath();

    // Bark striations
    treeArt.lineStyle(5, 0x22130b, 0.85);
    treeArt.lineBetween(-45, 180, -65, 10);
    treeArt.lineBetween(-18, 160, -30, -50);
    treeArt.lineBetween(25, 170, 20, -40);
    treeArt.lineBetween(60, 180, 55, 10);

    // Giant horizontal branch
    treeArt.fillStyle(0x422c1b, 1);
    treeArt.fillRoundedRect(-160, -42, 380, 42, 16);
    treeArt.lineStyle(4, 0x24150d, 1);
    treeArt.strokeRoundedRect(-160, -42, 380, 42, 16);

    // Moss on branch
    treeArt.fillStyle(0x608b38, 1);
    treeArt.fillRoundedRect(-155, -46, 130, 13, 5);
    treeArt.fillRoundedRect(10, -46, 150, 12, 5);

    // Hanging ivy vines
    treeArt.lineStyle(4, 0x3d702d, 0.95);
    treeArt.beginPath();
    treeArt.moveTo(-110, -10);
    treeArt.lineTo(-118, 65);
    treeArt.lineTo(-110, 115);
    treeArt.moveTo(90, -10);
    treeArt.lineTo(85, 75);
    treeArt.lineTo(96, 125);
    treeArt.strokePath();

    // Dense canopy foliage
    const leafColors = [0x144d2b, 0x1f6b3d, 0x328b4c, 0x5fa845];
    for (let i = 0; i < 11; i++) {
      treeArt.fillStyle(leafColors[i % leafColors.length], 0.92);
      treeArt.fillEllipse(-140 + i * 36, -140 + (i % 3) * 14, 105, 58);
    }

    this.treeContainer.add(treeArt);

    // Solid branch platform for the player to leap onto
    if (this.scene.branchPlatform) {
      this.branchPlatform = this.scene.branchPlatform;
    } else {
      this.branchPlatform = this.scene.add.rectangle(
        this.x + 35,
        this.y - 35,
        360,
        22,
        0x000000,
        0
      );
      this.scene.physics.add.existing(this.branchPlatform, true);
      this.scene.physics.add.collider(this.scene.player, this.branchPlatform);
    }
  }

  buildGiantAnaconda() {
    // 50% LARGER imposing scale for true boss climax
    this.snakeContainer = this.scene.add.container(this.currentX, this.y - 48).setDepth(6);
    this.snakeContainer.setScale(1.5 * this.facing, 1.5);

    const bodyArt = this.scene.add.graphics();
    this.bodyArt = bodyArt;

    // Massive coils wrapping the branch
    const coils = [
      { x: -80, y: -8, r: 28 },
      { x: -38, y: -14, r: 32 },
      { x: 8, y: -12, r: 30 },
      { x: 52, y: -6, r: 27 }
    ];

    coils.forEach((c) => {
      // Emerald scaled body
      bodyArt.fillStyle(0x0e3a0c, 1);
      bodyArt.fillCircle(c.x, c.y, c.r);
      bodyArt.fillStyle(0x278021, 1);
      bodyArt.fillCircle(c.x - 4, c.y - 4, c.r * 0.78);
      // Golden yellow diamond dorsal patterns
      bodyArt.fillStyle(0xd4ac0d, 0.95);
      bodyArt.fillEllipse(c.x + 3, c.y + 7, c.r * 0.52, c.r * 0.3);
      bodyArt.lineStyle(3, 0x071e06, 0.9);
      bodyArt.strokeCircle(c.x, c.y, c.r);
    });

    this.snakeContainer.add(bodyArt);

    // Massive muscular neck & menacing head
    this.headContainer = this.scene.add.container(80, -20).setDepth(7);
    const headArt = this.scene.add.graphics();

    // Muscular neck
    headArt.fillStyle(0x195e14, 1);
    headArt.fillRoundedRect(-28, -14, 56, 30, 13);
    headArt.lineStyle(3, 0x0a2b08, 1);
    headArt.strokeRoundedRect(-28, -14, 56, 30, 13);

    // Giant predatory snout
    headArt.fillStyle(0x23821d, 1);
    headArt.beginPath();
    headArt.moveTo(12, -20);
    headArt.lineTo(54, -7);
    headArt.lineTo(58, 6);
    headArt.lineTo(14, 20);
    headArt.closePath();
    headArt.fillPath();
    headArt.lineStyle(3.5, 0x082506, 1);
    headArt.strokePath();

    // Golden lower jaw
    headArt.fillStyle(0xf0d543, 1);
    headArt.beginPath();
    headArt.moveTo(18, 6);
    headArt.lineTo(50, 6);
    headArt.lineTo(28, 17);
    headArt.closePath();
    headArt.fillPath();

    // Massive white razor fangs
    headArt.fillStyle(0xffffff, 1);
    headArt.fillTriangle(42, 5, 47, 5, 44, 20);
    headArt.fillTriangle(30, 5, 35, 5, 32, 17);

    // Glowing menacing predatory eyes
    this.eyeGlow = this.scene.add.graphics();
    this.eyeGlow.fillStyle(0xff1744, 1);
    this.eyeGlow.fillCircle(28, -10, 7);
    this.eyeGlow.fillStyle(0x260000, 1);
    this.eyeGlow.fillEllipse(28, -10, 2.5, 8);
    headArt.add ? null : null; // safety

    // Long forked flickering ruby tongue
    this.tongue = this.scene.add.graphics();
    this.tongue.lineStyle(3, 0xd91438, 1);
    this.tongue.beginPath();
    this.tongue.moveTo(58, 2);
    this.tongue.lineTo(76, 2);
    this.tongue.lineTo(86, -6);
    this.tongue.moveTo(76, 2);
    this.tongue.lineTo(86, 10);
    this.tongue.strokePath();

    this.headContainer.add([headArt, this.eyeGlow, this.tongue]);
    this.snakeContainer.add(this.headContainer);

    // Stunned spinning stars
    this.stunStars = this.scene.add.container(80, -70).setAlpha(0);
    for (let i = 0; i < 5; i++) {
      const star = this.scene.add
        .text(
          Math.cos((i * Math.PI * 2) / 5) * 26,
          Math.sin((i * Math.PI * 2) / 5) * 16,
          "★",
          { fontSize: "22px", color: "#6df5e7" }
        )
        .setOrigin(0.5);
      this.stunStars.add(star);
    }
    this.snakeContainer.add(this.stunStars);

    // Alert indicator
    this.alertIcon = this.scene.add
      .text(80, -65, "!", {
        fontSize: "32px",
        fontStyle: "bold",
        color: "#ff1744",
        stroke: "#ffffff",
        strokeThickness: 4
      })
      .setOrigin(0.5)
      .setAlpha(0);
    this.snakeContainer.add(this.alertIcon);

    // Enlarged head physical hitbox (scaled to match giant head)
    this.headHitbox = this.scene.add.circle(this.x + 130, this.y - 50, 52, 0xff0000, 0);
    this.scene.physics.add.existing(this.headHitbox);
    this.headHitbox.body.setAllowGravity(false);
    this.headHitbox.body.setImmovable(true);

    // Massive moving body coils physical hitbox (protects the branch and 3rd crystal)
    this.bodyHitbox = this.scene.add.rectangle(this.currentX, this.y - 42, 180, 80, 0xff0000, 0);
    this.scene.physics.add.existing(this.bodyHitbox, true);

    // Idle breathing sway tween
    this.idleTween = this.scene.tweens.add({
      targets: this.headContainer,
      y: { from: -20, to: -32 },
      angle: { from: -5, to: 7 },
      duration: 1700,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });

    // Periodic tongue flick
    this.scene.time.addEvent({
      delay: 2000,
      callback: () => {
        if (!this.isStunned && this.alive) {
          this.scene.tweens.add({
            targets: this.tongue,
            scaleX: { from: 0.1, to: 1.3 },
            duration: 160,
            yoyo: true,
            repeat: 2
          });
        }
      },
      loop: true
    });
  }

  setupBossHUD() {
    // Boss Health Bar UI Container at top of screen
    this.hudContainer = this.scene.add.container(480, 68).setScrollFactor(0).setDepth(110);

    const barBg = this.scene.add
      .rectangle(0, 0, 360, 28, 0x06140e, 0.92)
      .setStrokeStyle(2, 0x48edd4);

    this.bossTitle = this.scene.add
      .text(-165, 0, "🐍 ANACONDA GUARDIAN", {
        fontFamily: "Arial, sans-serif",
        fontSize: "12px",
        fontStyle: "bold",
        color: "#72f7dd"
      })
      .setOrigin(0, 0.5);

    this.hpIcons = this.scene.add
      .text(165, 0, "♥ ♥ ♥", {
        fontFamily: "Arial, sans-serif",
        fontSize: "15px",
        color: "#ff3d00"
      })
      .setOrigin(1, 0.5);

    this.hudContainer.add([barBg, this.bossTitle, this.hpIcons]);
  }

  updateBossHUD() {
    if (!this.hpIcons) return;

    if (this.hp <= 0) {
      this.hpIcons.setText("DEFEATED 🏆").setColor("#ffdf6d");
    } else if (this.hp === 1) {
      this.hpIcons.setText("♥ ♡ ♡ (FRENZY!)").setColor("#ff1744");
      this.bossTitle.setText("🐍 ANACONDA [FRENZY]").setColor("#ff5252");
    } else if (this.hp === 2) {
      this.hpIcons.setText("♥ ♥ ♡ (ENRAGED)").setColor("#ff9100");
      this.bossTitle.setText("🐍 ANACONDA [ENRAGED]").setColor("#ffab40");
    } else {
      this.hpIcons.setText("♥ ♥ ♥").setColor("#ff3d00");
    }
  }

  setupColliders() {
    this.scene.physics.add.overlap(this.scene.player, this.headHitbox, () => {
      if (!this.isStunned && this.alive) {
        this.applyAnacondaAttackEffect();
      }
    });

    this.scene.physics.add.overlap(this.scene.player, this.bodyHitbox, () => {
      if (!this.isStunned && this.alive) {
        this.applyAnacondaAttackEffect();
      }
    });

    this.scene.physics.add.overlap(this.scene.player, this.venomProjectiles, (player, venom) => {
      if (!this.isStunned && this.alive) {
        venom.destroy();
        this.scene.damagePlayer(1);
      }
    });
  }

  applyAnacondaAttackEffect() {
    this.scene.damagePlayer(1);
    if (this.scene.player && this.scene.player.body) {
      const repelDir = this.scene.player.x < this.snakeContainer.x ? -280 : 280;
      this.scene.player.body.setVelocityX(repelDir);
      this.scene.player.body.setVelocityY(-200);
    }
  }

  update(time, delta) {
    if (!this.alive || !this.scene.player || !this.scene.player.active) return;

    // Sinuous active patrol along the banyan branch (guards the 3rd crystal)
    if (!this.isStunned && !this.isPaused && this.alive) {
      const currentSpeed = this.hp === 1 ? 115 : (this.hp === 2 ? 80 : 55);
      const dt = delta / 1000;
      this.currentX += currentSpeed * dt * this.facing;

      if (this.facing > 0 && this.currentX >= this.patrolMaxX) {
        this.currentX = this.patrolMaxX;
        this.turnAround(-1);
      } else if (this.facing < 0 && this.currentX <= this.patrolMinX) {
        this.currentX = this.patrolMinX;
        this.turnAround(1);
      }

      this.snakeContainer.x = this.currentX;

      // Sinuous body wave undulation while slithering
      const wave = Math.sin(time * 0.006) * 3.5;
      if (this.bodyArt) this.bodyArt.y = wave;
      if (this.state === "IDLE" || this.state === "ALERT") {
        this.headContainer.y = -20 + wave * 0.7;
      }
    }

    // Keep physical head hitbox aligned with animated visual head
    const worldHeadX = this.snakeContainer.x + this.headContainer.x * 1.5 * this.facing;
    const worldHeadY = this.snakeContainer.y + this.headContainer.y * 1.5;
    this.headHitbox.setPosition(worldHeadX, worldHeadY);
    if (this.headHitbox.body) {
      if (typeof this.headHitbox.body.reset === "function") {
        this.headHitbox.body.reset(worldHeadX, worldHeadY);
      } else if (typeof this.headHitbox.body.updateFromGameObject === "function") {
        this.headHitbox.body.updateFromGameObject();
      }
    }

    if (this.bodyHitbox) {
      this.bodyHitbox.setPosition(this.snakeContainer.x, this.snakeContainer.y + 6);
      if (this.bodyHitbox.body) {
        if (typeof this.bodyHitbox.body.reset === "function") {
          this.bodyHitbox.body.reset(this.snakeContainer.x, this.snakeContainer.y + 6);
        } else if (typeof this.bodyHitbox.body.updateFromGameObject === "function") {
          this.bodyHitbox.body.updateFromGameObject();
        }
      }
    }

    if (this.isStunned) return;

    // First-time arena entry battle sound & camera rumble
    if (!this.introShown && this.scene.player.x >= 2820) {
      this.introShown = true;
      if (window.SoundManager && window.SoundManager.playSnakeHiss) {
        window.SoundManager.playSnakeHiss();
      }
      this.scene.cameras.main.shake(250, 0.007);
    }

    const dist = Phaser.Math.Distance.Between(
      this.scene.player.x,
      this.scene.player.y,
      worldHeadX,
      worldHeadY
    );

    // Dynamic phase-based attack speed and range
    const speedFactor = this.hp === 1 ? 0.03 : this.hp === 2 ? 0.022 : 0.015;

    if (dist < this.strikeRange && !this.attackCooldown) {
      this.executeLungeStrike();
    } else if (dist < this.attackRange) {
      if (this.state !== "ALERT") {
        this.enterAlertState();
      }
      if (!this.attackCooldown && Math.random() < speedFactor) {
        this.spitVenom();
      }
    } else if (this.state === "ALERT") {
      this.enterIdleState();
    }
  }

  turnAround(newFacing) {
    this.isPaused = true;
    if (window.SoundManager && window.SoundManager.playSnakeHiss) {
      window.SoundManager.playSnakeHiss();
    }
    this.scene.time.delayedCall(380, () => {
      if (!this.alive || this.isStunned) return;
      this.facing = newFacing;
      this.snakeContainer.setScale(1.5 * this.facing, 1.5);
      this.isPaused = false;
    });
  }

  enterAlertState() {
    this.state = "ALERT";
    window.SoundManager.playSnakeHiss();
    this.scene.tweens.add({
      targets: this.alertIcon,
      alpha: 1,
      scale: { from: 0.6, to: 1.4 },
      duration: 250,
      yoyo: true,
      repeat: 1
    });
  }

  enterIdleState() {
    this.state = "IDLE";
    this.alertIcon.setAlpha(0);
  }

  executeLungeStrike() {
    this.attackCooldown = true;
    this.state = "LUNGING";
    window.SoundManager.playSnakeStrike();

    // Speed increases as HP decreases
    const lungeSpeed = this.hp === 1 ? 200 : this.hp === 2 ? 250 : 310;
    const targetY = 120;

    this.scene.tweens.add({
      targets: this.headContainer,
      x: 125,
      y: targetY,
      angle: 48,
      duration: lungeSpeed,
      ease: "Quad.easeIn",
      onComplete: () => {
        this.scene.time.delayedCall(140, () => {
          this.state = "RETRACTING";
          this.scene.tweens.add({
            targets: this.headContainer,
            x: 80,
            y: -20,
            angle: 0,
            duration: 600,
            ease: "Sine.easeOut",
            onComplete: () => {
              this.state = "IDLE";
              const cd = this.hp === 1 ? 700 : this.hp === 2 ? 1000 : 1400;
              this.scene.time.delayedCall(cd, () => {
                this.attackCooldown = false;
              });
            }
          });
        });
      }
    });
  }

  spitVenom() {
    this.attackCooldown = true;
    window.SoundManager.playSnakeHiss();

    const startX = this.snakeContainer.x + this.headContainer.x * 1.5 + 40;
    const startY = this.snakeContainer.y + this.headContainer.y * 1.5;

    // Multi-phase venom spit:
    // Phase 1 (HP 3): Dual venom
    // Phase 2 (HP 2): Triple venom spread
    // Phase 3 (HP 1): Quad venom wide barrage
    const spreads =
      this.hp === 1
        ? [-1.5, -0.5, 0.5, 1.5]
        : this.hp === 2
        ? [-1, 0, 1]
        : [-0.8, 0.8];

    spreads.forEach((spread, idx) => {
      this.scene.time.delayedCall(idx * 130, () => {
        if (this.isStunned || !this.alive || !this.scene.player) return;

        const venom = this.scene.add.circle(startX, startY, 11, 0x44ff3b, 0.95);
        venom.setStrokeStyle(2, 0xffffff);
        venom.setDepth(15);

        this.scene.physics.add.existing(venom);
        this.venomProjectiles.add(venom);

        const targetX = this.scene.player.x + spread * 55;
        const dx = targetX - startX;
        const vx = Phaser.Math.Clamp(dx * 1.45, -360, 360);

        venom.body.setVelocity(vx, -220);
        venom.body.setGravityY(540);

        this.scene.tweens.add({
          targets: venom,
          scale: 1.35,
          duration: 150,
          yoyo: true,
          repeat: -1
        });

        this.scene.time.delayedCall(2500, () => {
          if (venom.active) venom.destroy();
        });
      });
    });

    const cooldown = this.hp === 1 ? 950 : this.hp === 2 ? 1300 : 1800;
    this.scene.time.delayedCall(cooldown, () => {
      this.attackCooldown = false;
    });
  }

  stun(duration = 3800) {
    if (this.isStunned || !this.alive) return;

    this.isStunned = true;
    this.state = "STUNNED";
    this.hp = Math.max(0, this.hp - 1);
    this.updateBossHUD();

    window.SoundManager.playSnakeStun();
    this.scene.cameras.main.flash(200, 100, 245, 235);
    this.scene.cameras.main.shake(250, 0.015);
    this.alertIcon.setAlpha(0);

    // Disable collision during stun so player has a clear window to pass/collect crystal
    if (this.headHitbox && this.headHitbox.body) this.headHitbox.body.checkCollision.none = true;
    if (this.bodyHitbox && this.bodyHitbox.body) this.bodyHitbox.body.checkCollision.none = true;

    // Floating damage text in world space
    const worldHeadX = this.snakeContainer.x + this.headContainer.x * 1.5;
    const worldHeadY = this.snakeContainer.y + this.headContainer.y * 1.5;
    const dmgTxt = this.scene.add
      .text(worldHeadX, worldHeadY - 35, "-1 HP! STUNNED!", {
        fontFamily: "Arial, sans-serif",
        fontSize: "20px",
        fontStyle: "bold",
        color: "#ffd700",
        stroke: "#000000",
        strokeThickness: 4
      })
      .setOrigin(0.5)
      .setDepth(60);

    this.scene.tweens.add({
      targets: dmgTxt,
      y: dmgTxt.y - 45,
      alpha: 0,
      duration: 1100,
      ease: "Quad.easeOut",
      onComplete: () => dmgTxt.destroy()
    });

    // Damage flash tint on snake
    this.scene.tweens.killTweensOf(this.headContainer);
    this.scene.tweens.add({
      targets: this.headContainer,
      x: 40,
      y: -42,
      angle: -30,
      duration: 400,
      ease: "Back.easeOut"
    });

    if (this.hp <= 0) {
      // DEFEATED!
      this.defeat();
      return;
    }

    this.stunStars.setAlpha(1);
    const starTween = this.scene.tweens.add({
      targets: this.stunStars,
      angle: 360,
      duration: 1100,
      repeat: -1
    });

    const hitMsg =
      this.hp === 1
        ? "💥 DIRECT HIT! ANACONDA ENTERS FRENZY! (1 HP LEFT)"
        : "💥 DIRECT HIT! ANACONDA IS ENRAGED! (2 HP LEFT)";
    this.scene.showMessage(hitMsg, 2400);

    this.scene.time.delayedCall(duration, () => {
      if (!this.alive) return;

      this.isStunned = false;
      this.state = "IDLE";
      starTween.stop();
      this.stunStars.setAlpha(0);

      // Re-enable hitboxes upon recovery
      if (this.headHitbox && this.headHitbox.body) this.headHitbox.body.checkCollision.none = false;
      if (this.bodyHitbox && this.bodyHitbox.body) this.bodyHitbox.body.checkCollision.none = false;

      // Phase-based speed / range adjustments
      if (this.hp === 2) {
        this.attackRange = 520;
        this.strikeRange = 290;
      } else if (this.hp === 1) {
        this.attackRange = 600;
        this.strikeRange = 330;
      }

      this.scene.tweens.add({
        targets: this.headContainer,
        x: 80,
        y: -20,
        angle: 0,
        duration: 700,
        ease: "Sine.easeInOut",
        onComplete: () => {
          this.idleTween = this.scene.tweens.add({
            targets: this.headContainer,
            y: { from: -20, to: -32 },
            angle: { from: -5, to: 7 },
            duration: this.hp === 1 ? 1100 : 1500,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut"
          });
        }
      });
    });
  }

  defeat() {
    this.alive = false;
    this.isStunned = true;
    if (this.headHitbox) this.headHitbox.destroy();
    if (this.bodyHitbox) this.bodyHitbox.destroy();

    window.SoundManager.playVictory();
    this.scene.cameras.main.flash(400, 255, 235, 120);

    // Defeat retreat animation: slides up into the canopy
    this.scene.tweens.add({
      targets: [this.headContainer, this.snakeContainer],
      y: "-=220",
      alpha: 0,
      duration: 1800,
      ease: "Quad.easeIn"
    });

    this.scene.showMessage("🏆 ANACONDA GUARDIAN CONQUERED! LUMINA PORTAL READY!", 3500);

    // Notify scene to shatter guardian barrier and dismiss reflection banner
    if (typeof this.scene.onAnacondaDefeated === "function") {
      this.scene.onAnacondaDefeated();
    }

    // Auto-open Lumina portal
    if (this.scene.portal) {
      this.scene.tweens.add({
        targets: this.scene.portal,
        scale: 1.45,
        duration: 400,
        yoyo: true,
        repeat: 6
      });
      if (this.scene.portalInner) {
        this.scene.portalInner.setAlpha(1);
      }
    }
  }
}

window.AnacondaBoss = AnacondaBoss;