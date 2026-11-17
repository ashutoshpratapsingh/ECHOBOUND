import Phaser from "phaser";

class PathSnake {
  constructor(scene, x, y, options = {}) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.startX = x;
    this.patrolDistance = options.patrolDistance || 75;
    this.patrolMinX = options.minX || (x - this.patrolDistance);
    this.patrolMaxX = options.maxX || (x + this.patrolDistance);
    this.speed = options.speed || 52;
    this.variant = options.variant || "emerald"; // "emerald", "golden", "crimson"
    this.name = options.name || "Jungle Viper";

    this.facing = options.initialFacing || 1; // 1 = right, -1 = left
    this.isStunned = false;
    this.isPaused = false;
    this.strikeCooldown = false;
    this.hissCooldown = false;
    this.alive = true;

    this.setupPalette();
    this.buildArt();
    this.setupHitbox();
  }

  setupPalette() {
    if (this.variant === "golden") {
      this.palette = {
        primary: 0xd4ac0d,
        secondary: 0xf39c12,
        underbelly: 0xfef9e7,
        spots: 0x196f3d,
        outline: 0x564104,
        eye: 0xff4500,
        eyeGlow: 0xff8c00,
        tongue: 0xd63031,
        label: "Golden Bushmaster"
      };
    } else if (this.variant === "crimson") {
      this.palette = {
        primary: 0x8a2318,
        secondary: 0xb03a2e,
        underbelly: 0xedbb99,
        spots: 0x212f3d,
        outline: 0x49120b,
        eye: 0x3ae7c6,
        eyeGlow: 0x5affea,
        tongue: 0xc0392b,
        label: "Crimson-Fanged Viper"
      };
    } else {
      // Emerald Viper (Default)
      this.palette = {
        primary: 0x1e824c,
        secondary: 0x27ae60,
        underbelly: 0xd4efdf,
        spots: 0xf39c12,
        outline: 0x0e4726,
        eye: 0xff2222,
        eyeGlow: 0xff6666,
        tongue: 0xe74c3c,
        label: "Emerald Tree Viper"
      };
    }
  }

  buildArt() {
    this.container = this.scene.add.container(this.x, this.y).setDepth(6);
    this.container.setScale(this.facing, 1);

    // Ground shadow
    this.shadow = this.scene.add.ellipse(0, 10, 56, 12, 0x000000, 0.35);
    this.container.add(this.shadow);

    // Body container for sinuous undulation
    this.bodyContainer = this.scene.add.container(0, 0);

    // Illustrated sinuous body
    this.bodyArt = this.scene.add.graphics();
    const p = this.palette;

    // Coils / Segments (S-curve from tail to neck)
    const segments = [
      { x: -30, y: 2, r: 7 },
      { x: -20, y: -4, r: 9 },
      { x: -9, y: 4, r: 10 },
      { x: 3, y: -2, r: 11 },
      { x: 15, y: 2, r: 10 }
    ];

    // 1. Draw outer body outline & underbelly
    segments.forEach((seg, i) => {
      // Dark outline
      this.bodyArt.fillStyle(p.outline, 1);
      this.bodyArt.fillCircle(seg.x, seg.y, seg.r + 2);

      // Primary scales
      this.bodyArt.fillStyle(p.primary, 1);
      this.bodyArt.fillCircle(seg.x, seg.y, seg.r);

      // Highlight sheen
      this.bodyArt.fillStyle(p.secondary, 0.85);
      this.bodyArt.fillCircle(seg.x - 2, seg.y - 2, seg.r * 0.7);

      // Pale underbelly plates along bottom
      this.bodyArt.fillStyle(p.underbelly, 0.9);
      this.bodyArt.fillEllipse(seg.x, seg.y + seg.r * 0.55, seg.r * 1.1, seg.r * 0.45);

      // Dorsal diamond spots along the spine
      if (i > 0 && i < segments.length - 1) {
        this.bodyArt.fillStyle(p.spots, 0.95);
        this.bodyArt.fillTriangle(
          seg.x, seg.y - seg.r * 0.7,
          seg.x - 4, seg.y - seg.r * 0.1,
          seg.x + 4, seg.y - seg.r * 0.1
        );
      }
    });

    // Sinuous connecting curves between segments
    this.bodyArt.lineStyle(8, p.primary, 1);
    this.bodyArt.beginPath();
    this.bodyArt.moveTo(segments[0].x, segments[0].y);
    for (let i = 1; i < segments.length; i++) {
      this.bodyArt.lineTo(segments[i].x, segments[i].y);
    }
    this.bodyArt.strokePath();

    // Tail tip curl
    this.bodyArt.lineStyle(3, p.primary, 1);
    this.bodyArt.beginPath();
    this.bodyArt.moveTo(-30, 2);
    this.bodyArt.lineTo(-37, 6);
    this.bodyArt.lineTo(-40, 2);
    this.bodyArt.strokePath();

    this.bodyContainer.add(this.bodyArt);

    // 2. Head Container (Predatory triangular viper snout)
    this.headContainer = this.scene.add.container(20, -1);
    this.headArt = this.scene.add.graphics();

    // Head base outline
    this.headArt.fillStyle(p.outline, 1);
    this.headArt.beginPath();
    this.headArt.moveTo(-8, -12);
    this.headArt.lineTo(18, -1);
    this.headArt.lineTo(-8, 10);
    this.headArt.closePath();
    this.headArt.fillPath();

    // Head scales
    this.headArt.fillStyle(p.primary, 1);
    this.headArt.beginPath();
    this.headArt.moveTo(-7, -10);
    this.headArt.lineTo(16, -1);
    this.headArt.lineTo(-7, 8);
    this.headArt.closePath();
    this.headArt.fillPath();

    // Head brow highlight
    this.headArt.fillStyle(p.secondary, 0.9);
    this.headArt.fillTriangle(-5, -8, 12, -2, -5, 0);

    // Sharp white needle fangs
    this.headArt.fillStyle(0xffffff, 1);
    this.headArt.fillTriangle(8, 2, 11, 2, 9, 7);
    this.headArt.fillTriangle(4, 2, 7, 2, 5, 6);

    // Glowing menacing predatory eye
    this.headArt.fillStyle(p.eyeGlow, 0.4);
    this.headArt.fillCircle(1, -4, 5);
    this.headArt.fillStyle(p.eye, 1);
    this.headArt.fillCircle(1, -4, 3);
    // Black vertical slit pupil
    this.headArt.fillStyle(0x000000, 1);
    this.headArt.fillRect(0, -6, 2, 4);

    this.headContainer.add(this.headArt);

    // 3. Flickering forked tongue
    this.tongue = this.scene.add.graphics();
    this.tongue.lineStyle(2, p.tongue, 1);
    this.tongue.beginPath();
    this.tongue.moveTo(16, 1);
    this.tongue.lineTo(26, 1);
    this.tongue.lineTo(30, -2);
    this.tongue.moveTo(26, 1);
    this.tongue.lineTo(30, 4);
    this.tongue.strokePath();
    this.headContainer.add(this.tongue);

    this.bodyContainer.add(this.headContainer);
    this.container.add(this.bodyContainer);

    // 4. Stun VFX Container (Stars & Swirl)
    this.stunContainer = this.scene.add.container(18, -26).setDepth(8);
    this.stunContainer.setVisible(false);

    const star1 = this.scene.add.text(-12, 0, "✦", { fontSize: "14px", color: "#5affea" }).setOrigin(0.5);
    const star2 = this.scene.add.text(0, -8, "✧", { fontSize: "16px", color: "#ffd700" }).setOrigin(0.5);
    const star3 = this.scene.add.text(12, 0, "✦", { fontSize: "14px", color: "#5affea" }).setOrigin(0.5);
    this.stunContainer.add([star1, star2, star3]);

    this.container.add(this.stunContainer);

    // Start tongue flicker cycle
    this.startTongueFlicker();
  }

  setupHitbox() {
    // Physical hitbox on ground (60px wide, 24px tall)
    this.hitbox = this.scene.add.rectangle(this.x, this.y + 2, 58, 22, 0xff0000, 0);
    this.scene.physics.add.existing(this.hitbox, true);

    this.scene.physics.add.overlap(this.scene.player, this.hitbox, () => {
      this.onPlayerTouch();
    });
  }

  startTongueFlicker() {
    if (!this.tongue || !this.scene) return;

    this.tongueTimer = this.scene.time.addEvent({
      delay: Phaser.Math.Between(1800, 3200),
      loop: true,
      callback: () => {
        if (this.isStunned || !this.alive) return;
        this.scene.tweens.add({
          targets: this.tongue,
          x: 4,
          duration: 90,
          yoyo: true,
          repeat: 2,
          ease: "Sine.easeInOut"
        });
      }
    });
  }

  update(time, delta) {
    if (!this.alive) return;

    // Synchronize stun animation if active
    if (this.isStunned) {
      if (this.stunContainer && this.stunContainer.visible) {
        this.stunContainer.rotation += 0.05;
      }
      return;
    }

    // Sinuous undulating body motion (breathing & crawling wave)
    const wave = Math.sin(time * 0.007 + this.startX * 0.05) * 2.5;
    this.bodyArt.y = wave;
    this.headContainer.y = -1 + wave * 0.6;

    // Proximity Hiss Check
    if (!this.hissCooldown && this.scene.player) {
      const dist = Phaser.Math.Distance.Between(this.x, this.y, this.scene.player.x, this.scene.player.y);
      if (dist < 150) {
        this.triggerProximityHiss();
      }
    }

    // Pause at patrol edges
    if (this.isPaused) return;

    // Patrol locomotion
    const dt = delta / 1000;
    this.x += this.speed * dt * this.facing;

    // Check bounds
    if (this.facing > 0 && this.x >= this.patrolMaxX) {
      this.x = this.patrolMaxX;
      this.turnAround(-1);
    } else if (this.facing < 0 && this.x <= this.patrolMinX) {
      this.x = this.patrolMinX;
      this.turnAround(1);
    }

    // Update positions
    this.container.x = this.x;
    this.hitbox.x = this.x;
    if (this.hitbox.body) {
      if (typeof this.hitbox.body.reset === "function") {
        this.hitbox.body.reset(this.x, this.y + 2);
      } else if (typeof this.hitbox.body.updateFromGameObject === "function") {
        this.hitbox.body.updateFromGameObject();
      }
    }
  }

  turnAround(newFacing) {
    this.isPaused = true;
    this.scene.time.delayedCall(450, () => {
      if (!this.alive || this.isStunned) return;
      this.facing = newFacing;
      this.container.setScale(this.facing, 1);
      this.isPaused = false;
    });
  }

  triggerProximityHiss() {
    this.hissCooldown = true;
    if (window.SoundManager && window.SoundManager.playSnakeHiss) {
      window.SoundManager.playSnakeHiss();
    }

    // Head flare animation
    this.scene.tweens.add({
      targets: this.headContainer,
      scaleX: 1.25,
      scaleY: 1.25,
      duration: 150,
      yoyo: true,
      repeat: 1
    });

    this.scene.time.delayedCall(3000, () => {
      this.hissCooldown = false;
    });
  }

  onPlayerTouch() {
    if (this.isStunned || this.strikeCooldown || !this.alive) return;

    this.strikeCooldown = true;

    // Lunge strike sound & visual
    if (window.SoundManager && window.SoundManager.playSnakeStrike) {
      window.SoundManager.playSnakeStrike();
    }

    // Strike lunge tween
    this.scene.tweens.add({
      targets: this.container,
      x: this.x + this.facing * 18,
      duration: 100,
      yoyo: true,
      ease: "Quad.easeOut"
    });

    // Deal damage
    this.scene.damagePlayer(1);

    this.scene.time.delayedCall(1000, () => {
      this.strikeCooldown = false;
    });
  }

  /**
   * Stun the snake using Echo Pulse [E]
   * @param {number} duration Duration in ms (default: 3500)
   */
  stun(duration = 3500) {
    if (this.isStunned || !this.alive) return;

    this.isStunned = true;

    if (window.SoundManager && window.SoundManager.playSnakeStun) {
      window.SoundManager.playSnakeStun();
    }

    // Disable hitbox during stun
    if (this.hitbox && this.hitbox.body) {
      this.hitbox.body.checkCollision.none = true;
    }

    // Visual stun effects
    this.stunContainer.setVisible(true);
    this.bodyArt.alpha = 0.55;
    this.bodyContainer.y = 5; // Slump onto ground

    // Tint flash cyan
    this.scene.tweens.add({
      targets: [this.bodyArt, this.headArt],
      alpha: 0.5,
      duration: 200,
      yoyo: true,
      repeat: 3
    });

    // Shake awake upon recovery
    this.scene.time.delayedCall(duration, () => {
      if (!this.alive) return;

      // Recovery wobble
      this.scene.tweens.add({
        targets: this.bodyContainer,
        x: 4,
        duration: 60,
        yoyo: true,
        repeat: 4,
        onComplete: () => {
          this.bodyContainer.x = 0;
          this.bodyContainer.y = 0;
          this.bodyArt.alpha = 1;
          this.stunContainer.setVisible(false);
          this.isStunned = false;

          // Re-enable hitbox
          if (this.hitbox && this.hitbox.body) {
            this.hitbox.body.checkCollision.none = false;
          }
        }
      });
    });
  }

  destroy() {
    this.alive = false;
    if (this.tongueTimer) this.tongueTimer.remove();
    if (this.hitbox) this.hitbox.destroy();
    if (this.container) this.container.destroy();
  }
}

if (typeof window !== "undefined") {
  window.PathSnake = PathSnake;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = PathSnake;
}
