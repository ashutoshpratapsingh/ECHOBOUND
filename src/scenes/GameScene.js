import Phaser from "phaser";
import { audioManager } from "../audio/SoundEffects";
import { AnacondaGuardian } from "../entities/AnacondaGuardian";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  getUnlockedLevel() {
    try {
      const val = parseInt(localStorage.getItem("echobound_unlocked_level"), 10);
      if (isNaN(val) || val < 1) return 1;
      return Math.min(val, 3);
    } catch (e) {
      return 1;
    }
  }

  init(data) {
    const requested = (data && data.level) || 1;
    const unlocked = this.getUnlockedLevel();
    this.currentLevel = requested > unlocked ? unlocked : requested;
    this.checkpointX = (data && data.checkpointX) || 100;
    this.checkpointActivated = !!(data && data.checkpointActivated);
    this.savedCrystals = (data && data.crystalsCollected) || 0;
  }

  preload() {
    this.load.image("jungleBackground", "/assets/backgrounds/jungle-world.png");
    this.load.image("jungleTile", "/assets/backgrounds/jungle-tile.png");

    this.load.spritesheet("jungleBoy", "/assets/characters/jungle-boy.png", {
      frameWidth: 420,
      frameHeight: 560
    });
  }

  create() {
    // Distinct Level Visual Themes & Palettes
    const levelConfigs = {
      1: {
        name: "THE WHISPERING CANOPY",
        width: 2800,
        portalX: 2650,
        hasBoss: false,
        skyColor: 0x0a2b22,
        bgTint: 0x98ffcd,
        groundSoil: 0x3e2c22,
        groundGrass: 0x6da438,
        groundMoss: 0x9ecf4a,
        sporeColor: 0xfff3a8,
        ambientFog: 0xd4f5e8,
        vineColor: 0x2e4f2b,
        leafLight: 0x367f44,
        leafDark: 0x185633
      },
      2: {
        name: "THE ANCIENT CHASM",
        width: 3600,
        portalX: 3450,
        hasBoss: false,
        skyColor: 0x100d29,
        bgTint: 0x7b6be8,
        groundSoil: 0x201c33,
        groundGrass: 0x4d5b85,
        groundMoss: 0x7688c2,
        sporeColor: 0xb388ff,
        ambientFog: 0xc8b8ff,
        vineColor: 0x28234a,
        leafLight: 0x463f73,
        leafDark: 0x211c40
      },
      3: {
        name: "THE GUARDIAN'S SANCTUM",
        width: 4000,
        portalX: 3850,
        hasBoss: true,
        skyColor: 0x2b080a,
        bgTint: 0xff5555,
        groundSoil: 0x240e0c,
        groundGrass: 0x872618,
        groundMoss: 0xc9492e,
        sporeColor: 0xff7043,
        ambientFog: 0xffb4a2,
        vineColor: 0x4a1815,
        leafLight: 0x78281f,
        leafDark: 0x3d120d
      }
    };

    this.cfg = levelConfigs[this.currentLevel] || levelConfigs[1];
    this.levelName = this.cfg.name;
    this.worldWidth = this.cfg.width;
    this.worldHeight = 540;
    this.portalX = this.cfg.portalX;
    this.hasBoss = this.cfg.hasBoss;

    this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);
    this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);

    this.health = 3;
    this.maxHealth = 3;
    this.crystalsCollected = this.savedCrystals;
    this.totalCrystals = 3;
    this.damageCooldown = false;
    this.levelComplete = false;
    this.echoActive = false;
    this.echoDuration = 3200;
    this.stepTimer = 0;
    this.swingingHazards = [];
    this.anaconda = null;

    this.createBackground();
    this.createDecorations();
    this.createGround();
    this.createHero();
    this.buildLevelContent();
    this.createExitPortal();

    this.createHUD();
    this.setupInput();
    this.createMobileControls();

    this.showMessage(`LEVEL ${this.currentLevel}: ${this.levelName}`, 2800);
  }

  createBackground() {
    this.add
      .rectangle(this.worldWidth / 2, 270, this.worldWidth, 540, this.cfg.skyColor)
      .setDepth(-30);

    const panoramaWidth = 1500;
    const panoramaHeight = 845;
    for (let x = 0; x < this.worldWidth + panoramaWidth; x += panoramaWidth - 6) {
      const panorama = this.add
        .image(x, -145, "jungleBackground")
        .setOrigin(0, 0)
        .setDisplaySize(panoramaWidth, panoramaHeight)
        .setScrollFactor(0.2)
        .setDepth(-20)
        .setTint(this.cfg.bgTint);

      if (Math.floor(x / (panoramaWidth - 6)) % 2 === 1) {
        panorama.setFlipX(true);
      }
    }

    if (this.currentLevel === 1) {
      const sunbeams = this.add.graphics().setDepth(-10).setScrollFactor(0.1);
      sunbeams.fillStyle(0xfff7c2, 0.05);
      sunbeams.fillTriangle(200, -50, 450, 540, 60, 540);
      sunbeams.fillTriangle(800, -50, 1100, 540, 650, 540);
      sunbeams.fillTriangle(1500, -50, 1850, 540, 1350, 540);
    } else if (this.currentLevel === 2) {
      const ruins = this.add.graphics().setDepth(-12).setScrollFactor(0.3);
      ruins.fillStyle(0x191638, 0.85);
      for (let rx = 150; rx < this.worldWidth; rx += 480) {
        ruins.fillRect(rx, 80, 70, 420);
        ruins.fillRect(rx - 15, 70, 100, 20);
      }
    } else if (this.currentLevel === 3) {
      const moon = this.add.circle(800, 140, 95, 0xff3b30, 0.45).setScrollFactor(0.05).setDepth(-25);
      const moonCore = this.add.circle(800, 140, 70, 0xff7b68, 0.75).setScrollFactor(0.05).setDepth(-24);
      this.tweens.add({ targets: [moon, moonCore], alpha: 0.3, duration: 2500, yoyo: true, repeat: -1 });
    }

    for (let i = 0; i < 40; i++) {
      const spore = this.add.circle(
        Phaser.Math.Between(0, this.worldWidth),
        Phaser.Math.Between(60, 450),
        Phaser.Math.Between(2, 5),
        this.cfg.sporeColor,
        0.8
      );
      spore.setDepth(6);
      const floatY = this.currentLevel === 3 ? -Phaser.Math.Between(30, 80) : Phaser.Math.Between(-25, 25);
      this.tweens.add({
        targets: spore,
        y: spore.y + floatY,
        x: spore.x + Phaser.Math.Between(-40, 40),
        alpha: 0.15,
        scale: 1.5,
        duration: Phaser.Math.Between(1800, 3500),
        yoyo: true,
        repeat: -1
      });
    }

    this.add
      .rectangle(this.worldWidth / 2, 488, this.worldWidth, 18, this.cfg.vineColor, 0.85)
      .setDepth(-2);
  }

  createDecorations() {
    const spacing = 420;
    for (let x = 180; x < this.worldWidth; x += spacing) {
      const vines = this.add.graphics();
      vines.lineStyle(6, this.cfg.vineColor, 0.95);
      vines.beginPath();
      vines.moveTo(x, 0);
      vines.lineTo(x + 28, 80);
      vines.lineTo(x + 12, 165);
      vines.strokePath();
      vines.setDepth(-1);

      const leaves = this.add.graphics();
      for (let i = 0; i < 5; i++) {
        leaves.fillStyle(i % 2 === 0 ? this.cfg.leafDark : this.cfg.leafLight, 0.95);
        leaves.fillEllipse(x + i * 14 - 24, 385 + (i % 2) * 16, 75, 24);
      }
      leaves.setDepth(3);
    }
  }

  createGround() {
    this.ground = this.add.rectangle(
      this.worldWidth / 2,
      512,
      this.worldWidth,
      56,
      this.cfg.groundSoil
    );
    this.physics.add.existing(this.ground, true);

    const grass = this.add.rectangle(
      this.worldWidth / 2,
      482,
      this.worldWidth,
      14,
      this.cfg.groundGrass
    );
    grass.setDepth(2);

    const mossEdge = this.add.graphics();
    for (let x = 0; x < this.worldWidth; x += 38) {
      mossEdge.fillStyle(this.cfg.groundMoss, 1);
      mossEdge.fillRoundedRect(x, 474 + (x % 3) * 2, 28, 8, 3);
      mossEdge.fillStyle(this.cfg.groundSoil, 1);
      mossEdge.fillCircle(x + 7, 487, 3);
    }
    mossEdge.setDepth(3);
  }

  createHero() {
    this.player = this.physics.add.sprite(this.checkpointX, 470, "jungleBoy");
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

  buildLevelContent() {
    this.echoPlatforms = [];
    this.crystals = [];
    this.swingingHazards = [];

    if (this.currentLevel === 1) {
      this.createSpikes([700, 1600]);
      this.createEchoPlatformGroup([
        { x: 950, y: 395, width: 120 },
        { x: 1100, y: 330, width: 120 },
        { x: 2050, y: 395, width: 120 },
        { x: 2200, y: 330, width: 120 }
      ]);
      this.createCrystalsGroup([
        { x: 520, y: 430, id: 0 },
        { x: 1450, y: 430, id: 1 },
        { x: 2250, y: 280, id: 2 }
      ]);
      this.createCheckpointTotem(1750);
    } else if (this.currentLevel === 2) {
      this.createSpikes([550, 1150, 1750, 2450]);
      this.createMovingPlatform(700, 395, 1000);
      this.createSwingingPendulum(1300, 75, 240, -36, 36, 1700);
      this.createSwingingPendulum(1550, 75, 240, 36, -36, 1700);
      this.createRollingLog(1850, 450, 1750, 2050, 2200);
      this.createRollingLog(2200, 450, 2100, 2400, 1900);
      this.createCheckpointTotem(2400);
      this.createFallingBoulder(2650, 190, 700);
      this.createFallingBoulder(2900, 190, 1300);
      this.createEchoPlatformGroup([
        { x: 2980, y: 395, width: 110 },
        { x: 3120, y: 330, width: 110 },
        { x: 3260, y: 265, width: 110 }
      ]);
      this.createCrystalsGroup([
        { x: 850, y: 340, id: 0 },
        { x: 2000, y: 430, id: 1 },
        { x: 3260, y: 215, id: 2 }
      ]);
    } else if (this.currentLevel === 3) {
      this.createSpikes([450, 1100, 1600, 2200]);
      this.createMovingPlatform(650, 395, 950);
      this.createSwingingPendulum(1250, 75, 245, -40, 40, 1600);
      this.createRollingLog(1450, 450, 1350, 1600, 1800);
      this.createFallingBoulder(1850, 190, 800);
      this.createFallingBoulder(2100, 190, 1400);
      this.createCheckpointTotem(2300);
      this.createSpikes([2950, 3100, 3250]);
      this.createEchoPlatformGroup([
        { x: 2880, y: 390, width: 105 },
        { x: 3040, y: 320, width: 110 },
        { x: 3200, y: 250, width: 115 },
        { x: 3360, y: 190, width: 110 }
      ]);
      this.createCrystalsGroup([
        { x: 800, y: 340, id: 0 },
        { x: 1950, y: 430, id: 1 },
        { x: 3200, y: 190, id: 2 }
      ]);
      this.anaconda = new AnacondaGuardian(this, 3100, 310);
    }
  }

  createSpikes(positions) {
    positions.forEach((x) => {
      const g = this.add.graphics();
      g.fillStyle(this.currentLevel === 3 ? 0xe64a19 : 0xd5ddd2, 1);
      for (let i = 0; i < 5; i++) {
        g.fillTriangle(
          x - 48 + i * 20, 480,
          x - 38 + i * 20, 444,
          x - 28 + i * 20, 480
        );
      }
      g.setDepth(4);

      const hitbox = this.add.rectangle(x, 468, 100, 24, 0xff0000, 0);
      this.physics.add.existing(hitbox, true);
      this.physics.add.overlap(this.player, hitbox, () => this.damagePlayer(1));
    });
  }

  createEchoPlatformGroup(positions) {
    positions.forEach((p) => {
      const barColor = this.currentLevel === 3 ? 0xff7043 : (this.currentLevel === 2 ? 0x82b1ff : 0x47e8da);
      const bar = this.add.rectangle(p.x, p.y, p.width, 18, barColor);
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

  createCrystalsGroup(positions) {
    positions.forEach((p) => {
      if (this.savedCrystals > p.id) return;

      const container = this.add.container(p.x, p.y).setDepth(8);
      const glowColor = this.currentLevel === 3 ? 0xff5722 : (this.currentLevel === 2 ? 0x448aff : 0x42f5d4);
      const gemColor = this.currentLevel === 3 ? 0xff8a65 : (this.currentLevel === 2 ? 0x82b1ff : 0x67ffef);

      const glow = this.add.circle(0, 0, 26, glowColor, 0.35);
      const crystal = this.add.polygon(
        0, 0,
        [0, -18, 13, -6, 10, 13, 0, 20, -10, 13, -13, -6],
        gemColor
      );
      crystal.setStrokeStyle(2, 0xffffff);
      const core = this.add.polygon(
        0, 0,
        [0, -11, 7, -4, 6, 8, 0, 12, -6, 8, -7, -4],
        0xffffff
      );

      container.add([glow, crystal, core]);

      const sensor = this.add.circle(p.x, p.y, 26, 0xffffff, 0);
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

  createCheckpointTotem(x) {
    this.checkpoint = this.add.container(x, 420).setDepth(5);
    const pole = this.add.rectangle(0, 0, 12, 125, 0x8a6e4d);
    pole.setStrokeStyle(2, 0x48351f);

    const flagColor = this.checkpointActivated ? 0xffd54f : 0x5a6369;
    this.checkpointFlag = this.add.triangle(26, -42, 0, 0, 0, 36, 48, 18, flagColor);

    const lightColor = this.checkpointActivated ? 0xffea00 : 0xffffff;
    const lightAlpha = this.checkpointActivated ? 0.9 : 0.2;
    this.checkpointLight = this.add.circle(0, -62, 14, lightColor, lightAlpha);

    this.checkpoint.add([pole, this.checkpointFlag, this.checkpointLight]);
    this.checkpointTargetX = x;
  }

  createMovingPlatform(x, y, targetX) {
    const platColor = this.currentLevel === 3 ? 0x5c2b20 : (this.currentLevel === 2 ? 0x3d4157 : 0x7a5232);
    this.movingPlatform = this.add.rectangle(x, y, 135, 22, platColor);
    this.physics.add.existing(this.movingPlatform, true);
    this.physics.add.collider(this.player, this.movingPlatform);

    const moss = this.add.graphics();
    moss.fillStyle(this.cfg.groundMoss, 1);
    moss.fillRoundedRect(-67, -11, 134, 7, 3);
    const container = this.add.container(x, y).setDepth(3);
    container.add(moss);

    this.tweens.add({
      targets: [this.movingPlatform, container],
      x: targetX,
      duration: 2500,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
      onUpdate: () => this.movingPlatform.body.updateFromGameObject()
    });
  }

  createSwingingPendulum(pivotX, pivotY, length, fromAngle = -38, toAngle = 38, duration = 1800) {
    const rope = this.add.container(pivotX, pivotY).setDepth(8);
    const ropeLine = this.add.graphics();
    ropeLine.lineStyle(9, 0x483222, 1);
    ropeLine.lineBetween(0, 0, 0, length - 10);
    rope.add(ropeLine);

    const thornBall = this.add.graphics();
    thornBall.fillStyle(this.currentLevel === 3 ? 0x5c1b18 : 0x654329, 1);
    thornBall.fillCircle(0, length, 28);
    thornBall.fillStyle(this.cfg.groundMoss, 1);
    thornBall.fillTriangle(-20, length - 8, -44, length - 22, -18, length + 2);
    thornBall.fillTriangle(20, length - 8, 44, length - 22, 18, length + 2);
    rope.add(thornBall);

    const tip = this.add.circle(pivotX, pivotY + length, 30, 0xffffff, 0);
    this.physics.add.existing(tip);
    tip.body.setAllowGravity(false);
    tip.body.setImmovable(true);
    this.physics.add.overlap(this.player, tip, () => this.damagePlayer(1));

    const hazard = { rope, tip, pivotX, pivotY, length };
    this.swingingHazards.push(hazard);

    this.tweens.add({
      targets: rope,
      angle: { from: fromAngle, to: toAngle },
      duration: duration,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });
  }

  createRollingLog(x, y, minX, maxX, duration = 2500) {
    const log = this.add.container(x, y).setDepth(9);
    const logArt = this.add.graphics();
    logArt.fillStyle(this.currentLevel === 3 ? 0x4a1815 : 0x6e4325, 1);
    logArt.fillRoundedRect(-70, -22, 140, 44, 16);
    logArt.lineStyle(4, 0x24100e, 1);
    logArt.strokeRoundedRect(-70, -22, 140, 44, 16);
    log.add(logArt);

    const sensor = this.add.rectangle(x, y, 125, 40, 0xffffff, 0);
    this.physics.add.existing(sensor);
    sensor.body.setAllowGravity(false);
    sensor.body.setImmovable(true);
    this.physics.add.overlap(this.player, sensor, () => this.damagePlayer(1));

    this.tweens.add({
      targets: [log, sensor],
      x: { from: minX, to: maxX },
      duration: duration,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
      onUpdate: () => sensor.body.updateFromGameObject()
    });
    this.tweens.add({ targets: log, angle: 360, duration: 1000, repeat: -1 });
  }

  createFallingBoulder(x, y, delay = 800) {
    const rock = this.add.container(x, y).setDepth(8);
    const rockArt = this.add.graphics();
    rockArt.fillStyle(this.currentLevel === 3 ? 0x421b18 : 0x5a6860, 1);

    const pts = [
      { x: -36, y: -16 },
      { x: -16, y: -38 },
      { x: 18, y: -32 },
      { x: 40, y: -4 },
      { x: 26, y: 30 },
      { x: -18, y: 32 },
      { x: -40, y: 6 }
    ];
    rockArt.fillPoints(pts, true);
    rockArt.lineStyle(4, 0x24100e, 1);
    rockArt.strokePoints(pts, true);
    rock.add(rockArt);

    const sensor = this.add.rectangle(x, y, 65, 65, 0xffffff, 0);
    this.physics.add.existing(sensor);
    sensor.body.setAllowGravity(false);
    sensor.body.setImmovable(true);
    this.physics.add.overlap(this.player, sensor, () => this.damagePlayer(1));

    this.tweens.add({
      targets: [rock, sensor],
      y: 425,
      duration: 800,
      delay: delay,
      yoyo: true,
      repeat: -1,
      repeatDelay: 1500,
      ease: "Quad.easeIn",
      onUpdate: () => sensor.body.updateFromGameObject()
    });
  }

  createExitPortal() {
    this.portal = this.add.container(this.portalX, 420).setDepth(7);

    const outerColor = this.currentLevel === 3 ? 0x5c1815 : (this.currentLevel === 2 ? 0x221a4f : 0x14473e);
    const ringColor = this.currentLevel === 3 ? 0xff7043 : (this.currentLevel === 2 ? 0x7c4dff : 0x3ae7c6);

    this.portalOuter = this.add.ellipse(0, 0, 105, 120, outerColor, 0.85);
    this.portalOuter.setStrokeStyle(4, ringColor);

    this.portalInner = this.add.ellipse(0, 0, 70, 92, outerColor, 0.6);
    this.portalCore = this.add.ellipse(0, 0, 32, 58, 0xffffff, 0.7);

    this.portalRunes = this.add
      .text(0, 0, "✦   ✧   ✦   ✧", { fontSize: "14px", color: "#ffffff" })
      .setOrigin(0.5);

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

    this.portalTrigger = this.add.rectangle(this.portalX, 420, 110, 130, 0xffffff, 0);
    this.physics.add.existing(this.portalTrigger, true);
    this.physics.add.overlap(this.player, this.portalTrigger, () => this.enterPortal());
  }

  createHUD() {
    this.hudBar = this.add
      .rectangle(480, 24, 960, 48, 0x071513, 0.85)
      .setScrollFactor(0)
      .setDepth(100);

    this.healthText = this.add
      .text(20, 24, "HEALTH: ♥ ♥ ♥", {
        fontFamily: "Arial, sans-serif",
        fontSize: "17px",
        color: "#ff5252",
        fontStyle: "bold"
      })
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(101);

    this.crystalText = this.add
      .text(175, 24, `CRYSTALS: ${this.crystalsCollected} / 3`, {
        fontFamily: "Arial, sans-serif",
        fontSize: "15px",
        color: "#5cffe8",
        fontStyle: "bold"
      })
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(101);

    // QUICK LEVEL PROGRESSION BUTTONS (Locked levels require completing previous ones)
    const warpX = 330;
    const unlockedLevel = this.getUnlockedLevel();
    [1, 2, 3].forEach((lvl, i) => {
      const isCur = lvl === this.currentLevel;
      const isUnlocked = lvl <= unlockedLevel;
      const label = isUnlocked ? `L${lvl}` : `🔒L${lvl}`;
      const btn = this.add
        .text(warpX + i * 54, 24, label, {
          fontFamily: "Arial, sans-serif",
          fontSize: isUnlocked ? "12px" : "11px",
          fontStyle: "bold",
          color: isCur ? "#051814" : (isUnlocked ? "#c5ede2" : "#80928d"),
          backgroundColor: isCur ? "#48edd4" : (isUnlocked ? "#143f34" : "#1a2220"),
          padding: { x: isUnlocked ? 7 : 5, y: 4 }
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(101)
        .setInteractive({ useHandCursor: isUnlocked });

      btn.on("pointerdown", () => {
        if (!isUnlocked) {
          audioManager.playHurt();
          this.showMessage(`🔒 LEVEL ${lvl} LOCKED! Complete Level ${lvl - 1} first.`, 2200);
          this.tweens.add({
            targets: btn,
            x: btn.x + 4,
            duration: 50,
            yoyo: true,
            repeat: 3
          });
          return;
        }
        audioManager.playJump();
        this.scene.restart({ level: lvl });
      });
    });

    this.progressBarBg = this.add
      .rectangle(570, 24, 130, 10, 0x193831)
      .setScrollFactor(0)
      .setDepth(101);
    this.progressBarFill = this.add
      .rectangle(505, 24, 0, 10, 0x48edd4)
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(101);
    this.progressMarker = this.add
      .text(505, 24, "🏃", { fontSize: "12px" })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(102);

    this.echoGaugeBg = this.add
      .rectangle(705, 24, 75, 12, 0x15312b)
      .setScrollFactor(0)
      .setDepth(101);
    this.echoGaugeFill = this.add
      .rectangle(667, 24, 75, 12, 0x49f5df)
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(101);
    this.echoLabel = this.add
      .text(705, 24, "ECHO [E]", {
        fontFamily: "Arial, sans-serif",
        fontSize: "10px",
        color: "#08261e",
        fontStyle: "bold"
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(102);

    this.muteBtn = this.add
      .text(805, 24, "🔊 SFX", {
        fontFamily: "Arial, sans-serif",
        fontSize: "12px",
        color: "#e2fffa",
        backgroundColor: "#164539",
        padding: { x: 7, y: 4 },
        fontStyle: "bold"
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(101)
      .setInteractive({ useHandCursor: true });

    this.muteBtn.on("pointerdown", () => {
      const isMuted = audioManager.toggleMute();
      this.muteBtn.setText(isMuted ? "🔇 SFX" : "🔊 SFX");
      this.muteBtn.setStyle({ backgroundColor: isMuted ? "#451616" : "#164539" });
    });

    this.portalMessage = this.add
      .text(480, 95, "", {
        fontFamily: "Arial, sans-serif",
        fontSize: "17px",
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

  setupInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }

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
      .setInteractive({ useHandCursor: true });

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

  update(time, delta) {
    if (!this.player || !this.player.active || this.levelComplete) return;

    if (this.anaconda) {
      this.anaconda.update();
    }

    const left = this.cursors.left.isDown || this.keyA.isDown || this.mobileLeft;
    const right = this.cursors.right.isDown || this.keyD.isDown || this.mobileRight;
    const jumpPressed =
      Phaser.Input.Keyboard.JustDown(this.keySpace) ||
      Phaser.Input.Keyboard.JustDown(this.cursors.space) ||
      Phaser.Input.Keyboard.JustDown(this.keyW) ||
      Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
      this.mobileJump;

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

    if (jumpPressed && grounded) {
      this.player.body.setVelocityY(-470);
      audioManager.playJump();
      this.createDustPuff(this.player.x, this.player.y);
    }
    this.mobileJump = false;

    if (grounded && (left || right)) {
      this.stepTimer += delta;
      if (this.stepTimer > 280) {
        audioManager.playFootstep();
        this.stepTimer = 0;
      }
    }

    if (!grounded) {
      this.player.play("hero-jump", true);
    } else if (left || right) {
      this.player.play("hero-run", true);
    } else {
      this.player.play("hero-idle", true);
    }

    if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
      this.activateEcho();
    }

    if (this.swingingHazards && this.swingingHazards.length > 0) {
      this.swingingHazards.forEach((h) => {
        const rot = h.rope.rotation;
        const tipX = h.pivotX + Math.sin(rot) * h.length;
        const tipY = h.pivotY + Math.cos(rot) * h.length;
        h.tip.setPosition(tipX, tipY);
        h.tip.body.updateFromGameObject();
      });
    }

    if (
      this.checkpointTargetX &&
      !this.checkpointActivated &&
      this.player.x >= this.checkpointTargetX
    ) {
      this.activateCheckpoint();
    }

    const progress = Phaser.Math.Clamp(this.player.x / this.portalX, 0, 1);
    this.progressBarFill.width = 130 * progress;
    this.progressMarker.x = 505 + 130 * progress;

    if (this.player.y > 560) {
      this.respawnPlayer();
      this.damagePlayer(1);
    }
  }

  activateEcho() {
    if (this.echoActive || this.levelComplete) return;

    this.echoActive = true;
    audioManager.playEchoPulse();

    this.createEchoWave(this.player.x, this.player.y);

    if (
      this.anaconda &&
      Phaser.Math.Distance.Between(this.player.x, this.player.y, this.anaconda.x, this.anaconda.y) < 680
    ) {
      this.anaconda.stun();
    }

    this.echoPlatforms.forEach((p) => {
      p.bar.body.enable = true;
      this.tweens.add({
        targets: [p.bar, p.runeText],
        alpha: 1,
        duration: 250
      });
    });

    this.showMessage("ECHO PULSE RESONATES! PATHWAYS REVEALED", 1600);
    this.echoLabel.setText("ACTIVE");

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
      this.echoLabel.setText("RECHARGE");

      this.tweens.add({
        targets: this.echoGaugeFill,
        width: 75,
        duration: 1400,
        ease: "Linear",
        onComplete: () => {
          this.echoLabel.setText("ECHO [E]");
        }
      });
    });
  }

  createEchoWave(x, y) {
    const waveColor = this.currentLevel === 3 ? 0xff7043 : (this.currentLevel === 2 ? 0x82b1ff : 0x48edd4);
    for (let r = 0; r < 3; r++) {
      this.time.delayedCall(r * 90, () => {
        const ring = this.add.circle(x, y - 40, 20, waveColor, 0);
        ring.setStrokeStyle(3, waveColor, 0.9);
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
        this.cfg.groundMoss,
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

  collectCrystal(container, sensor, index) {
    if (!sensor.active) return;

    sensor.destroy();
    audioManager.playCrystal();

    const burstColor = this.currentLevel === 3 ? 0xff7043 : (this.currentLevel === 2 ? 0x82b1ff : 0x5affea);

    for (let i = 0; i < 16; i++) {
      const spark = this.add.circle(
        container.x,
        container.y,
        Phaser.Math.Between(2, 5),
        burstColor,
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
      this.showMessage("ALL CRYSTALS RESTORED! THE PORTAL IS OPEN!", 3000);
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

  activateCheckpoint() {
    this.checkpointActivated = true;
    this.checkpointX = this.checkpointTargetX;
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
          level: this.currentLevel,
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

    // Save level progression unlock
    const curUnlocked = this.getUnlockedLevel();
    if (this.currentLevel === 1 && curUnlocked < 2) {
      try {
        localStorage.setItem("echobound_unlocked_level", "2");
      } catch (e) {}
    } else if (this.currentLevel === 2 && curUnlocked < 3) {
      try {
        localStorage.setItem("echobound_unlocked_level", "3");
      } catch (e) {}
    }

    const isLast = this.currentLevel >= 3;
    const nextLvl = this.currentLevel + 1;

    // Victory Screen overlay
    const overlay = this.add.rectangle(480, 270, 960, 540, 0x051a14, 0.94).setScrollFactor(0).setDepth(500);
    const glow = this.add.circle(480, 180, 140, 0x48edd4, 0.16).setScrollFactor(0).setDepth(501);

    const title = this.add.text(480, 140, isLast ? "SANCTUM CLEARED!" : `LEVEL ${this.currentLevel} COMPLETE!`, {
      fontFamily: "Georgia, serif",
      fontSize: "46px",
      fontStyle: "bold",
      color: "#ffdf6d",
      stroke: "#194a36",
      strokeThickness: 8
    }).setOrigin(0.5).setScrollFactor(0).setDepth(502);

    const sub = this.add.text(480, 205, isLast ? "THE LOST LIGHT OF VERIDIA IS FULLY RESTORED" : "PATHWAY TO NEXT REALM UNLOCKED", {
      fontFamily: "Arial, sans-serif",
      fontSize: "15px",
      fontStyle: "bold",
      color: "#99f3de",
      letterSpacing: 2
    }).setOrigin(0.5).setScrollFactor(0).setDepth(502);

    const stars = this.add.text(480, 260, "★  ★  ★", {
      fontFamily: "Georgia, serif",
      fontSize: "36px",
      color: "#ffdf6d"
    }).setOrigin(0.5).setScrollFactor(0).setDepth(502);

    const nextBtn = this.add.text(480, 360, isLast ? "🏆 REPLAY FULL ADVENTURE (LEVEL 1)" : `NEXT: LEVEL ${nextLvl} ➔`, {
      fontFamily: "Arial, sans-serif",
      fontSize: "17px",
      fontStyle: "bold",
      color: "#051814",
      backgroundColor: isLast ? "#ffdf6d" : "#48edd4",
      padding: { x: 26, y: 13 }
    }).setOrigin(0.5).setScrollFactor(0).setDepth(502).setInteractive({ useHandCursor: true });

    nextBtn.on("pointerdown", () => {
      this.scene.restart({ level: isLast ? 1 : nextLvl });
    });
  }

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
