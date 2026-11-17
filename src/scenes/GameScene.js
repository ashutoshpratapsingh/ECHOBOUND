import Phaser from "phaser";
import { audioManager } from "../audio/SoundEffects";
import { AnacondaGuardian } from "../entities/AnacondaGuardian";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  // ==========================================
  // SCENE INITIALIZATION & DATA RETRIEVAL
  // ==========================================
  init(data) {
    if (data && data.checkpointX) {
      this.savedCheckpointX = data.checkpointX;
      this.savedCheckpointActivated = !!data.checkpointActivated;
      this.savedCrystals = data.crystalsCollected || 0;
    } else {
      this.savedCheckpointX = 100;
      this.savedCheckpointActivated = false;
      this.savedCrystals = 0;
    }
  }

  // ==========================================
  // PRELOAD ASSETS
  // ==========================================
  preload() {
    this.load.image("jungleBackground", "/assets/backgrounds/jungle-world.png");
    this.load.image("jungleTile", "/assets/backgrounds/jungle-tile.png");

    this.load.spritesheet("jungleBoy", "/assets/characters/jungle-boy.png", {
      frameWidth: 420,
      frameHeight: 560
    });
  }

  // ==========================================
  // CREATE GAME WORLD
  // ==========================================
  create() {
    this.worldWidth = 4200;
    this.worldHeight = 540;

    this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);
    this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);

    // Gameplay State
    this.health = 3;
    this.maxHealth = 3;
    this.crystalsCollected = this.savedCrystals;
    this.totalCrystals = 3;
    this.checkpointX = this.savedCheckpointX;
    this.checkpointActivated = this.savedCheckpointActivated;
    this.damageCooldown = false;
    this.levelComplete = false;
    this.gameStarted = this.savedCheckpointActivated; // If restarting from checkpoint, skip title screen
    this.echoActive = false;
    this.echoCooldown = false;
    this.echoDuration = 3200; // 3.2s echo duration
    this.stepTimer = 0;

    // Build World Layers
    this.createBackground();
    this.createDecorations();
    this.createGround();
    this.createHero();
    this.createSpikeTraps();
    this.createMovingJungleObstacles();
    this.createEchoPlatforms();
    this.createCrystals();
    this.createCheckpoint();
    this.createExitPortal();

    // Spawn Anaconda Guardian
    this.anaconda = new AnacondaGuardian(this, 3300, 310);

    // Setup HUD and Controls
    this.createHUD();
    this.setupInput();
    this.createMobileControls();

    if (!this.gameStarted) {
      this.createStartScreen();
    }

    // Initial hint message
    const welcomeMsg = this.checkpointActivated
      ? "RESPAWNED AT CHECKPOINT! CONTINUE FORWARD"
      : "WELCOME TO ECHOBOUND! FIND 3 ENERGY CRYSTALS";
    this.showMessage(welcomeMsg, 3200);
  }

  // ==========================================
  // 1. PARALLAX JUNGLE BACKGROUND
  // ==========================================
  createBackground() {
    this.add
      .rectangle(this.worldWidth / 2, 270, this.worldWidth, 540, 0x091b1a)
      .setDepth(-30);

    const panoramaWidth = 1500;
    const panoramaHeight = 845;
    for (let x = 0; x < this.worldWidth + panoramaWidth; x += panoramaWidth - 6) {
      const panorama = this.add
        .image(x, -145, "jungleBackground")
        .setOrigin(0, 0)
        .setDisplaySize(panoramaWidth, panoramaHeight)
        .setScrollFactor(0.2)
        .setDepth(-20);

      if (Math.floor(x / (panoramaWidth - 6)) % 2 === 1) {
        panorama.setFlipX(true);
      }
    }

    for (let i = 0; i < 40; i++) {
      const mist = this.add.circle(
        Phaser.Math.Between(0, this.worldWidth),
        Phaser.Math.Between(80, 440),
        Phaser.Math.Between(4, 12),
        0xd4f5e8,
        0.13
      );
      mist.setDepth(-4);

      this.tweens.add({
        targets: mist,
        x: mist.x + Phaser.Math.Between(40, 110),
        alpha: 0.02,
        duration: Phaser.Math.Between(3200, 7000),
        yoyo: true,
        repeat: -1
      });
    }

    this.add
      .rectangle(this.worldWidth / 2, 488, this.worldWidth, 18, 0x143521, 0.85)
      .setDepth(-2);
  }

  // ==========================================
  // 2. JUNGLE DECORATIONS & FIREFLIES
  // ==========================================
  createDecorations() {
    const vinePositions = [280, 680, 1150, 1620, 2180, 2700, 3050, 3650, 3950];

    vinePositions.forEach((x) => {
      const vines = this.add.graphics();
      vines.lineStyle(6, 0x2e4f2b, 0.95);
      vines.beginPath();
      vines.moveTo(x, 0);
      vines.lineTo(x + 28, 75);
      vines.lineTo(x + 12, 165);
      vines.strokePath();
      vines.setDepth(-1);

      const leaves = this.add.graphics();
      for (let i = 0; i < 6; i++) {
        leaves.fillStyle(i % 2 === 0 ? 0x185633 : 0x367f44, 0.95);
        leaves.fillEllipse(x + i * 14 - 24, 385 + (i % 2) * 16, 75, 24);
      }
      leaves.setDepth(3);
    });

    this.fireflies = [];
    for (let i = 0; i < 35; i++) {
      const fly = this.add.circle(
        Phaser.Math.Between(80, this.worldWidth - 80),
        Phaser.Math.Between(90, 440),
        Phaser.Math.Between(2, 4),
        0xebff82,
        0.85
      );
      fly.setDepth(6);

      this.tweens.add({
        targets: fly,
        y: fly.y - Phaser.Math.Between(15, 30),
        alpha: 0.2,
        scale: 1.6,
        duration: Phaser.Math.Between(1200, 2600),
        yoyo: true,
        repeat: -1
      });
      this.fireflies.push(fly);
    }
  }

  // ==========================================
  // 3. GROUND PLATFORMS & MOSS
  // ==========================================
  createGround() {
    this.ground = this.add.rectangle(
      this.worldWidth / 2,
      512,
      this.worldWidth,
      56,
      0x3e2c22
    );
    this.physics.add.existing(this.ground, true);

    const grass = this.add.rectangle(
      this.worldWidth / 2,
      482,
      this.worldWidth,
      14,
      0x6b9338
    );
    grass.setDepth(2);

    const mossEdge = this.add.graphics();
    for (let x = 0; x < this.worldWidth; x += 38) {
      mossEdge.fillStyle(0x9fc84e, 1);
      mossEdge.fillRoundedRect(x, 474 + (x % 3) * 2, 28, 8, 3);
      mossEdge.fillStyle(0x4d752c, 1);
      mossEdge.fillCircle(x + 7, 487, 3);
      mossEdge.fillCircle(x + 22, 485, 2.5);
    }
    mossEdge.setDepth(3);

    const groundDetails = this.add.graphics();
    for (let x = 0; x < this.worldWidth; x += 55) {
      groundDetails.lineStyle(2, 0x644630, 0.65);
      groundDetails.lineBetween(x, 492, x + 18, 516);
      groundDetails.lineBetween(x + 25, 496, x + 40, 526);
    }
    groundDetails.setDepth(1);
  }

  // ==========================================
  // 4. HERO CHARACTER & ANIMATIONS
  // ==========================================
  createHero() {
    const spawnX = this.checkpointX;
    this.player = this.physics.add.sprite(spawnX, 470, "jungleBoy");
    this.player.setOrigin(0.5, 1);
    this.player.setCollideWorldBounds(true);
    this.player.setMaxVelocity(280, 850);
    this.player.setDepth(10);
    this.player.setScale(0.22);

    this.player.body.setSize(150, 210);
    this.player.body.setOffset(135, 350);

    this.createHeroAnimations();
    this.player.play("hero-idle");

    this.physics.add.collider(this.player, this.ground);

    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setDeadzone(200, 90);
  }

  createHeroAnimations() {
    if (this.anims.exists("hero-idle")) return;

    this.anims.create({
      key: "hero-idle",
      frames: [{ key: "jungleBoy", frame: 0 }],
      frameRate: 1,
      repeat: -1
    });

    this.anims.create({
      key: "hero-run",
      frames: [
        { key: "jungleBoy", frame: 1 },
        { key: "jungleBoy", frame: 0 }
      ],
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: "hero-jump",
      frames: [{ key: "jungleBoy", frame: 2 }],
      frameRate: 1,
      repeat: -1
    });

    this.anims.create({
      key: "hero-land",
      frames: [{ key: "jungleBoy", frame: 3 }],
      frameRate: 1,
      repeat: 0
    });
  }

  // ==========================================
  // 5. SPIKE HAZARDS
  // ==========================================
  createSpikeTraps() {
    const spikePositions = [700, 1300, 2200, 2850, 3650];

    spikePositions.forEach((x) => {
      const graphics = this.add.graphics();
      graphics.fillStyle(0xd5ddd2, 1);

      for (let i = 0; i < 5; i++) {
        graphics.fillTriangle(
          x - 48 + i * 20, 480,
          x - 38 + i * 20, 444,
          x - 28 + i * 20, 480
        );
      }
      graphics.lineStyle(2, 0x3d4b3b, 0.9);
      for (let i = 0; i < 5; i++) {
        graphics.strokeTriangle(
          x - 48 + i * 20, 480,
          x - 38 + i * 20, 444,
          x - 28 + i * 20, 480
        );
      }
      graphics.setDepth(4);

      const hitbox = this.add.rectangle(x, 468, 100, 24, 0xff0000, 0);
      this.physics.add.existing(hitbox, true);

      this.physics.add.overlap(this.player, hitbox, () => {
        this.damagePlayer(1);
      });
    });
  }

  // ==========================================
  // 6. MOVING JUNGLE OBSTACLES
  // ==========================================
  createMovingJungleObstacles() {
    // 1) Swinging Thorn Vine Pendulum
    const pivotX = 1080;
    const pivotY = 75;
    const length = 245;

    const rope = this.add.container(pivotX, pivotY).setDepth(8);
    const ropeLine = this.add.graphics();
    ropeLine.lineStyle(9, 0x483222, 1);
    ropeLine.lineBetween(0, 0, 0, length - 10);
    ropeLine.lineStyle(3, 0x88a346, 0.9);
    ropeLine.lineBetween(-2, 10, -2, length - 20);
    ropeLine.fillStyle(0x327542, 1);
    ropeLine.fillEllipse(-15, 68, 26, 12);
    ropeLine.fillEllipse(14, 118, 28, 13);
    ropeLine.fillEllipse(-12, 168, 25, 11);
    rope.add(ropeLine);

    const thornBall = this.add.graphics();
    thornBall.fillStyle(0x654329, 1);
    thornBall.fillCircle(0, length, 28);
    thornBall.lineStyle(4, 0x2a1e17, 1);
    thornBall.strokeCircle(0, length, 28);
    thornBall.fillStyle(0xa4c64b, 1);
    thornBall.fillTriangle(-20, length - 8, -44, length - 22, -18, length + 2);
    thornBall.fillTriangle(20, length - 8, 44, length - 22, 18, length + 2);
    thornBall.fillTriangle(-8, length - 24, -16, length - 46, 0, length - 26);
    thornBall.fillTriangle(8, length - 24, 16, length - 46, 0, length - 26);
    rope.add(thornBall);

    const tip = this.add.circle(pivotX, pivotY + length, 30, 0xffffff, 0);
    this.physics.add.existing(tip);
    tip.body.setAllowGravity(false);
    tip.body.setCircle(26, 4, 4);
    tip.body.setImmovable(true);
    this.physics.add.overlap(this.player, tip, () => this.damagePlayer(1));

    this.swingingHazard = { rope, tip, pivotX, pivotY, length };
    this.tweens.add({
      targets: rope,
      angle: { from: -38, to: 38 },
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });

    // 2) Moving Vine Platform across chasm
    this.movingPlatform = this.add.rectangle(1480, 395, 135, 22, 0x7a5232);
    this.physics.add.existing(this.movingPlatform, true);
    this.physics.add.collider(this.player, this.movingPlatform);

    const platformMoss = this.add.graphics();
    platformMoss.fillStyle(0x7fb33f, 1);
    platformMoss.fillRoundedRect(-67, -11, 134, 7, 3);
    const platformContainer = this.add.container(1480, 395).setDepth(3);
    platformContainer.add(platformMoss);

    this.tweens.add({
      targets: [this.movingPlatform, platformContainer],
      x: 1720,
      duration: 2600,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
      onUpdate: () => {
        this.movingPlatform.body.updateFromGameObject();
      }
    });

    // 3) Rolling Log Hazard
    const logX = 1860;
    const logY = 450;
    const log = this.add.container(logX, logY).setDepth(9);
    const logArt = this.add.graphics();
    logArt.fillStyle(0x6e4325, 1);
    logArt.fillRoundedRect(-70, -22, 140, 44, 16);
    logArt.lineStyle(4, 0x362316, 1);
    logArt.strokeRoundedRect(-70, -22, 140, 44, 16);
    logArt.lineStyle(3, 0x9f6a38, 1);
    logArt.lineBetween(-38, -14, -16, 14);
    logArt.lineBetween(10, -14, 30, 14);
    log.add(logArt);

    const logSensor = this.add.rectangle(logX, logY, 125, 40, 0xffffff, 0);
    this.physics.add.existing(logSensor);
    logSensor.body.setAllowGravity(false);
    logSensor.body.setImmovable(true);
    this.physics.add.overlap(this.player, logSensor, () => this.damagePlayer(1));

    this.tweens.add({
      targets: [log, logSensor],
      x: { from: 1760, to: 2020 },
      duration: 2500,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
      onUpdate: () => logSensor.body.updateFromGameObject()
    });
    this.tweens.add({ targets: log, angle: 360, duration: 1100, repeat: -1 });

    // 4) Falling Ancient Boulder
    const rockX = 2780;
    const rock = this.add.container(rockX, 190).setDepth(8);
    const rockArt = this.add.graphics();
    rockArt.fillStyle(0x5a6860, 1);
    const rockPts = [
      { x: -36, y: -16 },
      { x: -16, y: -38 },
      { x: 18, y: -32 },
      { x: 40, y: -4 },
      { x: 26, y: 30 },
      { x: -18, y: 32 },
      { x: -40, y: 6 }
    ];
    rockArt.fillPoints(rockPts, true);
    rockArt.lineStyle(4, 0x2b3832, 1);
    rockArt.strokePoints(rockPts, true);
    rock.add(rockArt);

    const rockSensor = this.add.rectangle(rockX, 190, 65, 65, 0xffffff, 0);
    this.physics.add.existing(rockSensor);
    rockSensor.body.setAllowGravity(false);
    rockSensor.body.setImmovable(true);
    this.physics.add.overlap(this.player, rockSensor, () => this.damagePlayer(1));

    this.tweens.add({
      targets: [rock, rockSensor],
      y: 425,
      duration: 800,
      delay: 800,
      yoyo: true,
      repeat: -1,
      repeatDelay: 1600,
      ease: "Quad.easeIn",
      onUpdate: () => rockSensor.body.updateFromGameObject()
    });
  }

  // ==========================================
  // 7. ECHO PULSE PLATFORMS
  // ==========================================
  createEchoPlatforms() {
    this.echoPlatforms = [];

    const echoPositions = [
      { x: 860, y: 395, width: 120 },
      { x: 980, y: 325, width: 120 },
      { x: 2360, y: 395, width: 130 },
      { x: 2510, y: 325, width: 120 },
      // Anaconda overhead bypass & secret crystal path:
      { x: 3120, y: 390, width: 110 },
      { x: 3260, y: 320, width: 120 },
      { x: 3410, y: 250, width: 120 }
    ];

    echoPositions.forEach((p) => {
      // Solid physics bar at world coordinates
      const bar = this.add.rectangle(p.x, p.y, p.width, 18, 0x47e8da);
      bar.setStrokeStyle(2, 0xffffff);
      bar.setDepth(7);
      bar.setAlpha(0);

      const runeText = this.add
        .text(p.x, p.y, "◆ ◆ ◆", {
          fontSize: "12px",
          color: "#ffffff",
          fontStyle: "bold"
        })
        .setOrigin(0.5)
        .setDepth(8)
        .setAlpha(0);

      this.physics.add.existing(bar, true);
      bar.body.enable = false;
      this.physics.add.collider(this.player, bar);

      this.echoPlatforms.push({ bar, runeText });
    });
  }

  // ==========================================
  // 8. ENERGY CRYSTALS
  // ==========================================
  createCrystals() {
    this.crystals = [];

    const crystalPositions = [
      { x: 550, y: 430, id: 0 },
      { x: 2060, y: 430, id: 1 },
      { x: 3410, y: 205, id: 2 }
    ];

    crystalPositions.forEach((p) => {
      // If already collected prior to checkpoint reload, skip
      if (this.savedCrystals > p.id) {
        return;
      }

      const container = this.add.container(p.x, p.y).setDepth(8);

      const glow = this.add.circle(0, 0, 26, 0x42f5d4, 0.28);

      const crystal = this.add.polygon(
        0, 0,
        [0, -18, 13, -6, 10, 13, 0, 20, -10, 13, -13, -6],
        0x67ffef
      );
      crystal.setStrokeStyle(2, 0xffffff);

      const core = this.add.polygon(
        0, 0,
        [0, -11, 7, -4, 6, 8, 0, 12, -6, 8, -7, -4],
        0xffffff
      );

      container.add([glow, crystal, core]);

      // Standalone sensor at world coordinates
      const sensor = this.add.circle(p.x, p.y, 25, 0xffffff, 0);
      this.physics.add.existing(sensor, true);

      this.physics.add.overlap(this.player, sensor, () => {
        this.collectCrystal(container, sensor, p.id);
      });

      this.tweens.add({
        targets: [crystal, core],
        angle: 360,
        duration: 2200,
        repeat: -1
      });

      this.tweens.add({
        targets: container,
        y: p.y - 10,
        duration: 1200,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut"
      });

      this.tweens.add({
        targets: glow,
        scale: 1.5,
        alpha: 0.5,
        duration: 900,
        yoyo: true,
        repeat: -1
      });

      this.crystals.push({ container, sensor });
    });
  }

  // ==========================================
  // 9. CHECKPOINT TOTEM
  // ==========================================
  createCheckpoint() {
    this.checkpoint = this.add.container(2450, 420).setDepth(5);

    const pole = this.add.rectangle(0, 0, 12, 125, 0x8a6e4d);
    pole.setStrokeStyle(2, 0x48351f);

    const flagColor = this.checkpointActivated ? 0xffd54f : 0x5a6369;
    this.checkpointFlag = this.add.triangle(
      26, -42,
      0, 0,
      0, 36,
      48, 18,
      flagColor
    );

    const lightColor = this.checkpointActivated ? 0xffea00 : 0xffffff;
    const lightAlpha = this.checkpointActivated ? 0.9 : 0.2;
    this.checkpointLight = this.add.circle(0, -62, 14, lightColor, lightAlpha);

    this.checkpoint.add([pole, this.checkpointFlag, this.checkpointLight]);
  }

  // ==========================================
  // 10. MYSTICAL EXIT PORTAL
  // ==========================================
  createExitPortal() {
    this.portal = this.add.container(4050, 420).setDepth(7);

    this.portalOuter = this.add.ellipse(0, 0, 105, 120, 0x14473e, 0.85);
    this.portalOuter.setStrokeStyle(4, 0x3ae7c6);

    this.portalInner = this.add.ellipse(0, 0, 70, 92, 0x228b78, 0.6);
    this.portalCore = this.add.ellipse(0, 0, 32, 58, 0xaefff3, 0.7);

    this.portalRunes = this.add.text(0, 0, "✦   ✧   ✦   ✧", {
      fontSize: "14px",
      color: "#67ffef"
    }).setOrigin(0.5);

    this.portal.add([
      this.portalOuter,
      this.portalInner,
      this.portalCore,
      this.portalRunes
    ]);

    this.tweens.add({
      targets: this.portal,
      scale: 1.08,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });

    this.tweens.add({
      targets: this.portalRunes,
      angle: 360,
      duration: 6000,
      repeat: -1
    });

    this.portalOpen = this.crystalsCollected >= this.totalCrystals;

    // Standalone world-space portal trigger
    this.portalTrigger = this.add.rectangle(4050, 420, 110, 130, 0xffffff, 0);
    this.physics.add.existing(this.portalTrigger, true);

    this.physics.add.overlap(this.player, this.portalTrigger, () => {
      this.enterPortal();
    });
  }

  // ==========================================
  // 11. HUD & INTERFACE
  // ==========================================
  createHUD() {
    this.hudBar = this.add
      .rectangle(480, 24, 960, 48, 0x071513, 0.75)
      .setScrollFactor(0)
      .setDepth(100);

    this.healthText = this.add
      .text(25, 24, "HEALTH: ♥ ♥ ♥", {
        fontFamily: "Arial, sans-serif",
        fontSize: "19px",
        color: "#ff5252",
        fontStyle: "bold"
      })
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(101);

    this.crystalText = this.add
      .text(220, 24, `CRYSTALS: ${this.crystalsCollected} / 3`, {
        fontFamily: "Arial, sans-serif",
        fontSize: "17px",
        color: "#5cffe8",
        fontStyle: "bold"
      })
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(101);

    this.progressBarBg = this.add
      .rectangle(480, 24, 180, 10, 0x193831)
      .setScrollFactor(0)
      .setDepth(101);
    this.progressBarFill = this.add
      .rectangle(390, 24, 0, 10, 0x48edd4)
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(101);
    this.progressMarker = this.add
      .text(390, 24, "🏃", { fontSize: "14px" })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(102);

    this.echoGaugeBg = this.add
      .rectangle(680, 24, 90, 12, 0x15312b)
      .setScrollFactor(0)
      .setDepth(101);
    this.echoGaugeFill = this.add
      .rectangle(635, 24, 90, 12, 0x49f5df)
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(101);
    this.echoLabel = this.add
      .text(680, 24, "ECHO READY [E]", {
        fontFamily: "Arial, sans-serif",
        fontSize: "10px",
        color: "#08261e",
        fontStyle: "bold"
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(102);

    this.muteBtn = this.add
      .text(820, 24, "🔊 SFX ON", {
        fontFamily: "Arial, sans-serif",
        fontSize: "13px",
        color: "#e2fffa",
        backgroundColor: "#164539",
        padding: { x: 8, y: 5 },
        fontStyle: "bold"
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(101)
      .setInteractive();

    this.muteBtn.on("pointerdown", () => {
      const isMuted = audioManager.toggleMute();
      this.muteBtn.setText(isMuted ? "🔇 SFX OFF" : "🔊 SFX ON");
      this.muteBtn.setStyle({ backgroundColor: isMuted ? "#451616" : "#164539" });
    });

    this.controlsHint = this.add
      .text(945, 24, "A/D: MOVE  SPACE: JUMP", {
        fontFamily: "Arial, sans-serif",
        fontSize: "11px",
        color: "#9ad4c8"
      })
      .setOrigin(1, 0.5)
      .setScrollFactor(0)
      .setDepth(101);

    this.portalMessage = this.add
      .text(480, 95, "", {
        fontFamily: "Arial, sans-serif",
        fontSize: "18px",
        fontStyle: "bold",
        color: "#ffffff",
        backgroundColor: "#123b30",
        padding: { x: 16, y: 9 },
        stroke: "#0a1f1a",
        strokeThickness: 3,
        align: "center"
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(150);
  }

  // ==========================================
  // 12. INPUT HANDLING
  // ==========================================
  setupInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }

  // ==========================================
  // 13. MOBILE ON-SCREEN CONTROLS
  // ==========================================
  createMobileControls() {
    this.mobileLeft = false;
    this.mobileRight = false;
    this.mobileJump = false;

    this.createTouchButton(70, 465, "◀", () => (this.mobileLeft = true), () => (this.mobileLeft = false));
    this.createTouchButton(170, 465, "▶", () => (this.mobileRight = true), () => (this.mobileRight = false));
    this.createTouchButton(720, 465, "ECHO", () => this.activateEcho(), () => {}, "#166154", "#48f0d8");
    this.createTouchButton(835, 465, "JUMP", () => (this.mobileJump = true), () => (this.mobileJump = false), "#1a6e42", "#52f58b");

    this.input.on("pointerup", () => {
      this.mobileLeft = false;
      this.mobileRight = false;
      this.mobileJump = false;
    });
  }

  createTouchButton(x, y, label, down, up, bg = "#1b4435", border = "#42b892") {
    const btn = this.add
      .text(x, y, label, {
        fontFamily: "Arial, sans-serif",
        fontSize: "18px",
        color: "#ffffff",
        backgroundColor: bg,
        padding: { x: 16, y: 14 },
        fontStyle: "bold"
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(200)
      .setInteractive();

    btn.setStyle({ stroke: border, strokeThickness: 2 });

    btn.on("pointerdown", () => {
      btn.setScale(0.92);
      audioManager.ensureContext();
      down();
    });

    btn.on("pointerup", () => {
      btn.setScale(1);
      up();
    });

    btn.on("pointerout", () => {
      btn.setScale(1);
      up();
    });

    return btn;
  }

  // ==========================================
  // 14. START OVERLAY (Audio & Game Ignition)
  // ==========================================
  createStartScreen() {
    this.startOverlay = this.add
      .rectangle(480, 270, 960, 540, 0x040f0d, 0.88)
      .setScrollFactor(0)
      .setDepth(300);

    this.titleText = this.add
      .text(480, 190, "ECHOBOUND", {
        fontFamily: "Georgia, serif",
        fontSize: "52px",
        fontStyle: "bold",
        color: "#ffffff",
        stroke: "#1c543f",
        strokeThickness: 8
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(301);

    this.subTitleText = this.add
      .text(480, 250, "THE LOST LIGHT", {
        fontFamily: "Arial, sans-serif",
        fontSize: "16px",
        color: "#7ef5d8",
        letterSpacing: 8,
        fontStyle: "bold"
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(301);

    this.descText = this.add
      .text(
        480,
        310,
        "Explore the ancient forgotten canopy. Harness the Echo Pulse to reveal hidden\nethereal pathways and stun ancient predators. Collect all 3 Crystals to unlock the exit.",
        {
          fontFamily: "Arial, sans-serif",
          fontSize: "15px",
          color: "#d2ece4",
          align: "center",
          lineSpacing: 5
        }
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(301);

    this.startButton = this.add
      .text(480, 390, "PRESS SPACE OR CLICK TO BEGIN", {
        fontFamily: "Arial, sans-serif",
        fontSize: "18px",
        fontStyle: "bold",
        color: "#051813",
        backgroundColor: "#48edd4",
        padding: { x: 24, y: 14 }
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(301)
      .setInteractive();

    this.tweens.add({
      targets: this.startButton,
      scale: 1.06,
      duration: 800,
      yoyo: true,
      repeat: -1
    });

    const startGame = () => {
      if (this.gameStarted) return;
      this.gameStarted = true;
      audioManager.ensureContext();
      audioManager.playEchoPulse();

      this.tweens.add({
        targets: [
          this.startOverlay,
          this.titleText,
          this.subTitleText,
          this.descText,
          this.startButton
        ],
        alpha: 0,
        duration: 500,
        onComplete: () => {
          this.startOverlay.destroy();
          this.titleText.destroy();
          this.subTitleText.destroy();
          this.descText.destroy();
          this.startButton.destroy();
        }
      });
    };

    this.startButton.on("pointerdown", startGame);
    this.input.keyboard.once("keydown-SPACE", startGame);
    this.input.keyboard.once("keydown-ENTER", startGame);
  }

  // ==========================================
  // 15. MAIN GAME LOOP
  // ==========================================
  update(time, delta) {
    if (!this.player || !this.player.active || this.levelComplete) return;

    // Update Anaconda Guardian AI
    if (this.anaconda) {
      this.anaconda.update();
    }

    // Input checks
    const left = this.cursors.left.isDown || this.keyA.isDown || this.mobileLeft;
    const right = this.cursors.right.isDown || this.keyD.isDown || this.mobileRight;
    const jumpPressed =
      Phaser.Input.Keyboard.JustDown(this.keySpace) ||
      Phaser.Input.Keyboard.JustDown(this.cursors.space) ||
      Phaser.Input.Keyboard.JustDown(this.keyW) ||
      Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
      this.mobileJump;

    // Movement
    if (left && !right) {
      this.player.body.setVelocityX(-260);
      this.player.setFlipX(true);
    } else if (right && !left) {
      this.player.body.setVelocityX(260);
      this.player.setFlipX(false);
    } else {
      this.player.body.setVelocityX(0);
    }

    const grounded = this.player.body.blocked.down || this.player.body.touching.down;

    // Jump execution
    if (jumpPressed && grounded) {
      this.player.body.setVelocityY(-470);
      audioManager.playJump();
      this.createDustPuff(this.player.x, this.player.y);
    }
    this.mobileJump = false;

    // Running footsteps
    if (grounded && (left || right)) {
      this.stepTimer += delta;
      if (this.stepTimer > 280) {
        audioManager.playFootstep();
        this.stepTimer = 0;
      }
    }

    // Animation state machine
    if (!grounded) {
      this.player.play("hero-jump", true);
    } else if (left || right) {
      this.player.play("hero-run", true);
    } else {
      this.player.play("hero-idle", true);
    }

    // Echo Pulse trigger
    if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
      this.activateEcho();
    }

    // Swinging pendulum hitbox sync
    if (this.swingingHazard) {
      const rot = this.swingingHazard.rope.rotation;
      const tipX = this.swingingHazard.pivotX + Math.sin(rot) * this.swingingHazard.length;
      const tipY = this.swingingHazard.pivotY + Math.cos(rot) * this.swingingHazard.length;
      this.swingingHazard.tip.setPosition(tipX, tipY);
      this.swingingHazard.tip.body.updateFromGameObject();
    }

    // Checkpoint Trigger
    if (!this.checkpointActivated && this.player.x >= 2450) {
      this.activateCheckpoint();
    }

    // Update mini progress bar
    const progress = Phaser.Math.Clamp(this.player.x / 4050, 0, 1);
    this.progressBarFill.width = 180 * progress;
    this.progressMarker.x = 390 + 180 * progress;

    // Fall boundary respawn
    if (this.player.y > 560) {
      this.respawnPlayer();
      this.damagePlayer(1);
    }
  }

  // ==========================================
  // 16. ECHO PULSE ABILITY
  // ==========================================
  activateEcho() {
    if (this.echoActive || this.levelComplete) return;

    this.echoActive = true;
    audioManager.playEchoPulse();

    this.createEchoWave(this.player.x, this.player.y);

    // Stun Anaconda if within proximity
    if (
      this.anaconda &&
      Phaser.Math.Distance.Between(this.player.x, this.player.y, this.anaconda.x, this.anaconda.y) < 650
    ) {
      this.anaconda.stun();
    }

    // Reveal ethereal platforms
    this.echoPlatforms.forEach((p) => {
      p.bar.body.enable = true;
      this.tweens.add({
        targets: [p.bar, p.runeText],
        alpha: 1,
        duration: 250
      });
    });

    this.showMessage("ECHO PULSE RESONATES! PATHWAYS REVEALED", 1600);

    this.echoLabel.setText("ECHO ACTIVE");
    this.tweens.add({
      targets: this.echoGaugeFill,
      width: 0,
      duration: this.echoDuration,
      ease: "Linear"
    });

    this.time.delayedCall(this.echoDuration, () => {
      this.echoPlatforms.forEach((p) => {
        this.tweens.add({
          targets: [p.bar, p.runeText],
          alpha: 0,
          duration: 350,
          onComplete: () => {
            p.bar.body.enable = false;
          }
        });
      });

      this.echoActive = false;
      this.echoLabel.setText("ECHO RECHARGING");

      this.tweens.add({
        targets: this.echoGaugeFill,
        width: 90,
        duration: 1500,
        ease: "Linear",
        onComplete: () => {
          this.echoLabel.setText("ECHO READY [E]");
        }
      });
    });
  }

  createEchoWave(x, y) {
    for (let r = 0; r < 3; r++) {
      this.time.delayedCall(r * 90, () => {
        const ring = this.add.circle(x, y - 40, 20, 0x48edd4, 0);
        ring.setStrokeStyle(3, 0x5affea, 0.9);
        ring.setDepth(20);

        this.tweens.add({
          targets: ring,
          radius: 380,
          alpha: 0,
          duration: 750,
          ease: "Quad.easeOut",
          onComplete: () => ring.destroy()
        });
      });
    }

    this.cameras.main.flash(140, 50, 230, 210);
  }

  createDustPuff(x, y) {
    for (let i = 0; i < 6; i++) {
      const dust = this.add.circle(
        x + Phaser.Math.Between(-15, 15),
        y - 4,
        Phaser.Math.Between(3, 6),
        0x90b56b,
        0.7
      );
      dust.setDepth(12);

      this.tweens.add({
        targets: dust,
        y: dust.y - Phaser.Math.Between(8, 20),
        alpha: 0,
        scale: 0.2,
        duration: 350,
        onComplete: () => dust.destroy()
      });
    }
  }

  // ==========================================
  // 17. CRYSTAL COLLECTION
  // ==========================================
  collectCrystal(container, sensor, index) {
    if (!sensor.active) return;

    sensor.destroy();
    audioManager.playCrystal();

    for (let i = 0; i < 16; i++) {
      const spark = this.add.circle(
        container.x,
        container.y,
        Phaser.Math.Between(2, 5),
        0x5affea,
        1
      );
      spark.setDepth(25);

      const angle = (i / 16) * Math.PI * 2;
      const dist = Phaser.Math.Between(35, 75);

      this.tweens.add({
        targets: spark,
        x: container.x + Math.cos(angle) * dist,
        y: container.y + Math.sin(angle) * dist,
        alpha: 0,
        scale: 0.1,
        duration: 550,
        ease: "Quad.easeOut",
        onComplete: () => spark.destroy()
      });
    }

    container.destroy();
    this.crystalsCollected++;
    this.crystalText.setText(`CRYSTALS: ${this.crystalsCollected} / 3`);

    this.showMessage(`CRYSTAL ${this.crystalsCollected}/3 RESTORED!`, 1500);

    if (this.crystalsCollected >= this.totalCrystals) {
      this.portalOpen = true;
      this.showMessage("ALL CRYSTALS RESTORED! THE PORTAL IS AWAKENED!", 3000);

      this.tweens.add({
        targets: this.portal,
        scale: 1.35,
        duration: 400,
        yoyo: true,
        repeat: 5
      });

      this.tweens.add({
        targets: this.portalInner,
        alpha: 1,
        duration: 600
      });
    }
  }

  // ==========================================
  // 18. CHECKPOINT SYSTEM
  // ==========================================
  activateCheckpoint() {
    this.checkpointActivated = true;
    this.checkpointX = 2450;
    audioManager.playCheckpoint();

    this.checkpointFlag.setFillStyle(0xffd54f);
    this.checkpointLight.setFillStyle(0xffea00, 0.9);

    this.tweens.add({
      targets: this.checkpointLight,
      scale: 1.8,
      duration: 500,
      yoyo: true,
      repeat: 3
    });

    this.showMessage("CHECKPOINT SAVED!", 2000);
  }

  // ==========================================
  // 19. DAMAGE, HEALTH & RESPAWN
  // ==========================================
  damagePlayer(amount) {
    if (this.damageCooldown || this.levelComplete) return;

    this.damageCooldown = true;
    this.health = Math.max(0, this.health - amount);
    audioManager.playHurt();

    this.healthText.setText("HEALTH: " + "♥ ".repeat(this.health));

    this.cameras.main.shake(200, 0.012);
    this.player.setTint(0xff4444);

    this.time.delayedCall(800, () => {
      if (this.player.active) {
        this.player.clearTint();
      }
      this.damageCooldown = false;
    });

    if (this.health <= 0) {
      this.levelComplete = true;
      const respawnMsg = this.checkpointActivated
        ? "ENERGY DEPLETED! RESPAWNING AT CHECKPOINT..."
        : "ENERGY DEPLETED! RESTARTING LEVEL...";
      this.showMessage(respawnMsg, 1600);

      this.time.delayedCall(1600, () => {
        this.scene.restart({
          checkpointX: this.checkpointX,
          checkpointActivated: this.checkpointActivated,
          crystalsCollected: this.checkpointActivated ? Math.max(this.crystalsCollected, 2) : 0
        });
      });
    }
  }

  respawnPlayer() {
    this.player.setPosition(this.checkpointX, 420);
    this.player.setVelocity(0, 0);
  }

  // ==========================================
  // 20. PORTAL & LEVEL COMPLETION
  // ==========================================
  enterPortal() {
    if (this.levelComplete) return;

    if (this.crystalsCollected < this.totalCrystals) {
      this.showMessage("COLLECT ALL 3 CRYSTALS TO OPEN THE PORTAL!", 1600);
      return;
    }

    this.levelComplete = true;
    audioManager.playVictory();
    this.physics.pause();
    this.player.setVelocity(0, 0);

    const overlay = this.add
      .rectangle(480, 270, 960, 540, 0x051a14, 0.94)
      .setScrollFactor(0)
      .setDepth(500)
      .setAlpha(0);

    const glow = this.add
      .circle(480, 180, 140, 0x48edd4, 0.15)
      .setScrollFactor(0)
      .setDepth(501)
      .setAlpha(0);

    const title = this.add
      .text(480, 150, "ECHOBOUND", {
        fontFamily: "Georgia, serif",
        fontSize: "36px",
        fontStyle: "bold",
        color: "#ffffff"
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(502)
      .setAlpha(0);

    const triumph = this.add
      .text(480, 215, "LEVEL COMPLETE!", {
        fontFamily: "Georgia, serif",
        fontSize: "56px",
        fontStyle: "bold",
        color: "#ffdf6d",
        stroke: "#1f4a38",
        strokeThickness: 8
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(502)
      .setScale(0.5)
      .setAlpha(0);

    const sub = this.add
      .text(480, 285, "THE LOST LIGHT OF THE CANOPY HAS BEEN RESTORED", {
        fontFamily: "Arial, sans-serif",
        fontSize: "17px",
        fontStyle: "bold",
        color: "#99f3de",
        letterSpacing: 2
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(502)
      .setAlpha(0);

    const stats = this.add
      .text(
        480,
        340,
        "✦ CRYSTALS RESTORED: 3 / 3  ✦  ANACONDA GUARDIAN: STUNNED  ✦  RATING: ★ ★ ★",
        {
          fontFamily: "Arial, sans-serif",
          fontSize: "15px",
          color: "#ffffff"
        }
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(502)
      .setAlpha(0);

    const restartBtn = this.add
      .text(480, 420, "PRESS ENTER OR CLICK TO PLAY AGAIN", {
        fontFamily: "Arial, sans-serif",
        fontSize: "17px",
        fontStyle: "bold",
        color: "#051813",
        backgroundColor: "#ffdf6d",
        padding: { x: 22, y: 13 }
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(502)
      .setAlpha(0)
      .setInteractive();

    this.tweens.add({ targets: overlay, alpha: 1, duration: 700 });
    this.tweens.add({ targets: glow, alpha: 0.8, scale: 1.4, duration: 1200, yoyo: true, repeat: -1 });
    this.tweens.add({ targets: [title, sub, stats, restartBtn], alpha: 1, duration: 800, delay: 200 });
    this.tweens.add({ targets: triumph, alpha: 1, scale: 1, duration: 850, ease: "Back.easeOut" });

    restartBtn.on("pointerdown", () => this.scene.restart());
    this.input.keyboard.once("keydown-ENTER", () => this.scene.restart());
  }

  // ==========================================
  // 21. HELPER: TEMPORARY MESSAGE
  // ==========================================
  showMessage(message, duration = 1600) {
    if (!this.portalMessage) return;

    this.portalMessage.setText(message);
    if (this.messageTimer) this.messageTimer.remove();

    this.messageTimer = this.time.delayedCall(duration, () => {
      if (!this.levelComplete) {
        this.portalMessage.setText("");
      }
    });
  }
}
