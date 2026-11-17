import Phaser from "phaser";
import "../audio/SoundManager.js";
import "../entities/PathSnake.js";
import "../entities/AnacondaBoss.js";

class GameScene extends Phaser.Scene {
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
    const requestedLevel = (data && data.level) || 1;
    const unlockedLevel = this.getUnlockedLevel();

    // Enforce sequential level locking: cannot jump past locked levels
    if (requestedLevel > unlockedLevel) {
      this.currentLevel = unlockedLevel;
    } else {
      this.currentLevel = requestedLevel;
    }
    this.checkpointX = (data && data.checkpointX) || 100;
    this.checkpointActivated = !!(data && data.checkpointActivated);
    this.savedCrystals = (data && data.crystalsCollected) || 0;
  }

  preload() {
    try {
      this.load.image("jungleBackground", "./assets/backgrounds/jungle-world.png");
      this.load.image("level2Background", "./assets/backgrounds/level2-chasm.jpg");
      this.load.spritesheet("jungleBoy", "./assets/characters/jungle-boy.png", {
        frameWidth: 420,
        frameHeight: 560
      });
    } catch (e) {
      console.warn("Asset preload handled by fallback generator", e);
    }
  }

  create() {
    this.ensureFallbackTextures();

    // Level-specific world configurations
    const levelConfigs = {
      1: { name: "THE WHISPERING CANOPY", width: 2800, portalX: 2650, portalY: 420, hasBoss: false },
      2: { name: "THE ANCIENT CHASM", width: 3400, portalX: 3250, portalY: 420, hasBoss: false },
      3: { name: "THE GUARDIAN'S SANCTUM", width: 3800, portalX: 3580, portalY: 250, hasBoss: true }
    };

    const cfg = levelConfigs[this.currentLevel] || levelConfigs[1];
    this.levelName = cfg.name;
    this.worldWidth = cfg.width;
    this.worldHeight = 540;
    this.portalX = cfg.portalX;
    this.portalY = cfg.portalY || 420;
    this.hasBoss = cfg.hasBoss;

    this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);
    this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);

    // State Variables
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

    // Build Lush Jungle World Elements
    this.createBackground();
    this.createDecorations();
    this.createGround();
    this.createHero();
    this.buildLevelContent();
    this.createExitPortal();

    // Setup HUD and Controls
    this.createHUD();
    this.createReflectionBanner();
    this.setupInput();
    this.createMobileControls();

    // Level start announcement toast
    this.showMessage(`LEVEL ${this.currentLevel}: ${this.levelName}`, 2800);
  }

  ensureFallbackTextures() {
    if (!this.textures.exists("jungleBoy")) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      const frameW = 420;
      const frameH = 560;

      for (let i = 0; i < 4; i++) {
        const ox = i * frameW;
        const legOffset = i === 1 ? 25 : (i === 2 ? -20 : (i === 3 ? 10 : 0));

        // Tanned Athletic Torso (Tarzan)
        g.fillStyle(0xd69b6a, 1);
        g.fillRoundedRect(ox + 165, 210, 90, 140, 20);

        // Chest & abs definition
        g.fillStyle(0xb87d4e, 0.7);
        g.fillRect(ox + 175, 235, 30, 22);
        g.fillRect(ox + 215, 235, 30, 22);
        g.fillRect(ox + 190, 270, 40, 16);

        // Tarzan Head
        g.fillStyle(0xd69b6a, 1);
        g.fillCircle(ox + 210, 150, 44);

        // Wild Tarzan Brown Hair (spiky jungle mane)
        g.fillStyle(0x382010, 1);
        g.fillCircle(ox + 210, 125, 48);
        g.fillTriangle(ox + 160, 130, ox + 185, 95, ox + 195, 140);
        g.fillTriangle(ox + 190, 110, ox + 210, 85, ox + 225, 125);
        g.fillTriangle(ox + 220, 120, ox + 245, 95, ox + 260, 145);
        g.fillTriangle(ox + 155, 160, ox + 170, 135, ox + 175, 180);

        // Vine Headband
        g.fillStyle(0x2d6832, 1);
        g.fillRect(ox + 172, 135, 76, 10);
        g.fillStyle(0x56b05e, 1);
        g.fillCircle(ox + 210, 140, 6);

        // Face: Eyes & Smile
        g.fillStyle(0xffffff, 1);
        g.fillCircle(ox + 198, 155, 6);
        g.fillCircle(ox + 222, 155, 6);
        g.fillStyle(0x1a120c, 1);
        g.fillCircle(ox + 199, 155, 3);
        g.fillCircle(ox + 223, 155, 3);
        g.lineStyle(3, 0x8a4a2a, 1);
        g.beginPath();
        g.moveTo(ox + 200, 172);
        g.lineTo(ox + 220, 172);
        g.strokePath();

        // Athletic Arms
        g.fillStyle(0xd69b6a, 1);
        g.fillRoundedRect(ox + 140, 215, 25, 110, 12);
        g.fillRoundedRect(ox + 255, 215, 25, 110, 12);
        // Armband
        g.fillStyle(0x2d6832, 1);
        g.fillRect(ox + 255, 240, 25, 8);

        // Jungle Leaf Loincloth (Tarzan wrap)
        g.fillStyle(0x327536, 1);
        g.fillRoundedRect(ox + 160, 335, 100, 48, 12);
        g.fillStyle(0xc98f28, 1);
        g.fillTriangle(ox + 170, 375, ox + 210, 410, ox + 250, 375);

        // Running Legs
        g.fillStyle(0xd69b6a, 1);
        g.fillRoundedRect(ox + 175, 375, 28, 95 + legOffset, 12);
        g.fillRoundedRect(ox + 217, 375, 28, 95 - legOffset, 12);

        // Bare Feet
        g.fillStyle(0xb87d4e, 1);
        g.fillRoundedRect(ox + 170, 465 + legOffset, 34, 16, 6);
        g.fillRoundedRect(ox + 217, 465 - legOffset, 34, 16, 6);
      }
      g.generateTexture("jungleBoy", frameW * 4, frameH);
    }
  }

  createBackground() {
    // LEVEL 2: Custom night waterfall jungle background (Anaconda removed!)
    if (this.currentLevel === 2 && this.textures.exists("level2Background")) {
      this.add
        .rectangle(this.worldWidth / 2, 270, this.worldWidth, 540, 0x051326)
        .setDepth(-30);

      const panoramaWidth = 1500;
      const panoramaHeight = 845;

      for (let x = 0; x < this.worldWidth + panoramaWidth; x += panoramaWidth - 6) {
        const panorama = this.add
          .image(x, -145, "level2Background")
          .setOrigin(0, 0)
          .setDisplaySize(panoramaWidth, panoramaHeight)
          .setScrollFactor(0.22)
          .setDepth(-20);

        if (Math.floor(x / (panoramaWidth - 6)) % 2 === 1) {
          panorama.setFlipX(true);
        }
      }

      // Floating night waterfall mist particles
      for (let i = 0; i < 40; i++) {
        const mist = this.add.circle(
          Phaser.Math.Between(0, this.worldWidth),
          Phaser.Math.Between(80, 460),
          Phaser.Math.Between(3, 10),
          0x9be8ff,
          0.16
        );
        mist.setDepth(-4);

        this.tweens.add({
          targets: mist,
          x: mist.x + Phaser.Math.Between(30, 80),
          alpha: 0.03,
          duration: Phaser.Math.Between(2500, 5000),
          yoyo: true,
          repeat: -1
        });
      }

      this.add
        .rectangle(this.worldWidth / 2, 488, this.worldWidth, 18, 0x0d2838, 0.85)
        .setDepth(-2);
      return;
    }

    // LEVEL 1 & LEVEL 3: Pure, clean lush emerald rainforest
    this.add
      .rectangle(this.worldWidth / 2, 270, this.worldWidth, 540, 0x071b19)
      .setDepth(-30);

    const panoramaWidth = 1500;
    const panoramaHeight = 845;

    // Pure, clean, untinted lush jungle panorama
    for (let x = 0; x < this.worldWidth + panoramaWidth; x += panoramaWidth - 6) {
      if (this.textures.exists("jungleBackground")) {
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
    }

    // Floating atmospheric mist particles
    for (let i = 0; i < 35; i++) {
      const mist = this.add.circle(
        Phaser.Math.Between(0, this.worldWidth),
        Phaser.Math.Between(90, 440),
        Phaser.Math.Between(4, 12),
        0xd4f5e8,
        0.12
      );
      mist.setDepth(-4);

      this.tweens.add({
        targets: mist,
        x: mist.x + Phaser.Math.Between(40, 100),
        alpha: 0.02,
        duration: Phaser.Math.Between(3000, 6500),
        yoyo: true,
        repeat: -1
      });
    }

    this.add
      .rectangle(this.worldWidth / 2, 488, this.worldWidth, 18, 0x143521, 0.85)
      .setDepth(-2);
  }

  createDecorations() {
    const spacing = 450;
    for (let x = 200; x < this.worldWidth; x += spacing) {
      const vines = this.add.graphics();
      vines.lineStyle(6, 0x2e4f2b, 0.95);
      vines.beginPath();
      vines.moveTo(x, 0);
      vines.lineTo(x + 28, 75);
      vines.lineTo(x + 12, 160);
      vines.strokePath();
      vines.setDepth(-1);

      const leaves = this.add.graphics();
      for (let i = 0; i < 5; i++) {
        leaves.fillStyle(i % 2 === 0 ? 0x185633 : 0x367f44, 0.95);
        leaves.fillEllipse(x + i * 14 - 24, 385 + (i % 2) * 16, 75, 24);
      }
      leaves.setDepth(3);
    }

    // Glowing jungle fireflies
    for (let i = 0; i < 30; i++) {
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
    }
  }

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

  // ==========================================
  // LEVEL CONTENT BUILDER (PROGRESSIVE CHALLENGES)
  // ==========================================
  buildLevelContent() {
    this.echoPlatforms = [];
    this.crystals = [];
    this.swingingHazards = [];
    this.pathSnakes = [];

    if (this.currentLevel === 1) {
      // LEVEL 1: THE CANOPY (Echo Platforms, Spikes, 3 Crystals)
      this.createSpikes([700, 1600]);

      this.createEchoPlatform(950, 370, 150, 22);
      this.createEchoPlatform(1250, 310, 160, 22);
      this.createEchoPlatform(1950, 360, 160, 22);
      this.createEchoPlatform(2250, 300, 160, 22);

      const crystalCoords = [
        { x: 950, y: 310, id: 0 },
        { x: 1750, y: 430, id: 1 },
        { x: 2250, y: 240, id: 2 }
      ];
      crystalCoords.forEach((c) => this.createSunCrystal(c.x, c.y, c.id));

      this.createCheckpointTotem(1450);
    } else if (this.currentLevel === 2) {
      // LEVEL 2: THE ANCIENT CHASM (Moving Platforms, Dual Pendulums, Rolling Logs, Falling Boulders)
      this.createMovingPlatform(620, 370, 880);
      this.createMovingPlatform(2150, 330, 2400);

      this.createSwingingHazard(1250, 70, 170, -45, 45, 2000);
      this.createSwingingHazard(2050, 60, 180, 50, -50, 1800);

      this.createRollingLog(1600, 462, 1600, 1850);
      this.createRollingLog(2550, 462, 2550, 2800);

      this.createFallingBoulder(1850, 40);
      this.createFallingBoulder(2650, 40);

      this.createSpikes([1100, 1750, 2350]);

      this.createEchoPlatform(1050, 340, 150, 22);
      this.createEchoPlatform(1400, 280, 160, 22);
      this.createEchoPlatform(2700, 320, 160, 22);

      const crystalCoords = [
        { x: 800, y: 310, id: 0 },
        { x: 1950, y: 430, id: 1 },
        { x: 2700, y: 260, id: 2 }
      ];
      crystalCoords.forEach((c) => this.createSunCrystal(c.x, c.y, c.id));

      this.createCheckpointTotem(1750);
    } else if (this.currentLevel === 3) {
      // LEVEL 3: THE GUARDIAN'S SANCTUM (HARD CLIMAX - INTENSE HAZARDS + GIANT ANACONDA BOSS)
      this.createMovingPlatform(550, 370, 820);
      this.createMovingPlatform(1750, 340, 2050);

      // Dual Swinging Hazards with tight timing
      this.createSwingingHazard(1100, 60, 180, -50, 50, 1700);
      this.createSwingingHazard(1550, 65, 175, 45, -45, 1600);

      // Rolling Spiked Logs
      this.createRollingLog(1300, 462, 1300, 1550);
      this.createRollingLog(2250, 462, 2250, 2550);

      // Falling Boulders
      this.createFallingBoulder(1200, 30);
      this.createFallingBoulder(2400, 30);

      // Multiple Spike Pits guarding the path + impassable floor under tree
      this.createSpikes([850, 1400, 1950, 2750, 2960, 3100, 3240, 3380, 3500]);

      // Strategic Echo Platforms required to bridge the chasms & arena
      this.createEchoPlatform(850, 340, 140, 22);
      this.createEchoPlatform(1400, 290, 150, 22);
      this.createEchoPlatform(1950, 320, 150, 22);
      this.createEchoPlatform(2500, 280, 150, 22);

      // Impassable Briar Root Barricade completely sealing off the ground under the tree
      this.createRootBarricade(3460, 425, 45, 120);

      // === ARENA PLATFORMS & CANOPY PATH TO 3RD CRYSTAL & EXIT ===
      // Ascent on the left to the Anaconda Banyan branch
      this.createSolidPlatform(2880, 395, 130, 22);       // Lower solid mossy rock shelf
      this.createEchoPlatform(2980, 335, 130, 22);        // Echo platform ascending to branch
      this.createBouncyMushroom(3010, 482);               // Spring mushroom assisting jump up to branch
      this.branchPlatform = this.createSolidPlatform(3100, 275, 260, 24); // Banyan branch solid platform beneath Crystal 3 & Anaconda

      // Impassable Ancient Guardian Barrier across branch (cannot cross without defeating Anaconda)
      this.createGuardianBarrier(3230, 240);

      // Elevated canopy bridge to the Ancient Temple Dais & Lumina Portal
      this.createEchoPlatform(3380, 275, 140, 22);        // Canopy Echo bridge to the Dais
      this.createSolidPlatform(3580, 295, 200, 26);       // Elevated stone dais holding the Lumina Portal at (3580, 250)

      // 3 High-Skill Sun Crystals
      const crystalCoords = [
        { x: 850, y: 280, id: 0 },
        { x: 1950, y: 260, id: 1 },
        { x: 3100, y: 220, id: 2 } // High on the banyan branch above the Giant Anaconda!
      ];
      crystalCoords.forEach((c) => this.createSunCrystal(c.x, c.y, c.id));

      this.createCheckpointTotem(1950);

      // 3 Dangerous Patrol Snakes on the path leading to the Sanctum
      this.createPathSnakes();

      // Spawn the Giant Anaconda Boss (50% larger, multi-phase attacks, 3 HP)
      this.anaconda = new AnacondaBoss(this, 3100, 310);
    }
  }

  createPathSnakes() {
    this.pathSnakes = [];
    const SnakeClass = typeof PathSnake !== "undefined" ? PathSnake : (window.PathSnake || null);
    if (!SnakeClass) return;

    // Snake 1: Emerald Tree Viper (Ground patrol between Spikes & Boulder)
    const viper1 = new SnakeClass(this, 1040, 470, {
      minX: 960,
      maxX: 1120,
      speed: 48,
      variant: "emerald",
      name: "Emerald Tree Viper"
    });
    this.pathSnakes.push(viper1);

    // Snake 2: Golden Bushmaster (Midway platforming patrol between Pendulum & Moving Platform)
    const viper2 = new SnakeClass(this, 1670, 470, {
      minX: 1610,
      maxX: 1730,
      speed: 52,
      variant: "golden",
      name: "Golden Bushmaster"
    });
    this.pathSnakes.push(viper2);

    // Snake 3: Crimson-Fanged Shadow Viper (Guarding the final approach before the Giant Anaconda Arena)
    const viper3 = new SnakeClass(this, 2660, 470, {
      minX: 2590,
      maxX: 2730,
      speed: 58,
      variant: "crimson",
      name: "Crimson Shadow Viper"
    });
    this.pathSnakes.push(viper3);
  }

  createEchoPlatform(x, y, width, height) {
    const plat = this.add.rectangle(x, y, width, height, 0x1f5c49, 0.18);
    plat.setStrokeStyle(2, 0x48edd4, 0.4);
    plat.setDepth(4);

    this.physics.add.existing(plat, true);
    plat.body.checkCollision.none = true;

    this.echoPlatforms.push(plat);
  }

  createSunCrystal(x, y, index) {
    if (this.checkpointActivated && index < this.savedCrystals) {
      return;
    }

    const container = this.add.container(x, y).setDepth(6);

    const glow = this.add.circle(0, 0, 28, 0x5affea, 0.25);
    const crystal = this.add.polygon(
      0,
      0,
      [0, -22, 14, -6, 14, 12, 0, 24, -14, 12, -14, -6],
      0x48edd4
    );
    crystal.setStrokeStyle(2, 0xffffff);

    const innerShine = this.add.polygon(
      0,
      -3,
      [0, -12, 6, -3, 6, 6, 0, 12, -6, 6, -6, -3],
      0xffffff,
      0.8
    );

    container.add([glow, crystal, innerShine]);

    this.tweens.add({
      targets: container,
      y: y - 12,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });

    this.tweens.add({
      targets: glow,
      scale: 1.4,
      alpha: 0.4,
      duration: 800,
      yoyo: true,
      repeat: -1
    });

    const sensor = this.add.circle(x, y, 26, 0xffffff, 0);
    this.physics.add.existing(sensor, true);
    this.physics.add.overlap(this.player, sensor, () =>
      this.collectCrystal(container, sensor, index)
    );

    this.crystals.push({ container, sensor, index });
  }

  createSpikes(xPositions) {
    xPositions.forEach((x) => {
      const spikeW = 90;
      const spikeG = this.add.graphics();
      spikeG.fillStyle(0x732219, 1);
      spikeG.lineStyle(2, 0xff5c4d, 0.8);

      for (let i = 0; i < 4; i++) {
        const sx = x - spikeW / 2 + i * 22;
        spikeG.beginPath();
        spikeG.moveTo(sx, 484);
        spikeG.lineTo(sx + 11, 452);
        spikeG.lineTo(sx + 22, 484);
        spikeG.closePath();
        spikeG.fillPath();
        spikeG.strokePath();
      }
      spikeG.setDepth(5);

      const hitArea = this.add.rectangle(x, 468, spikeW - 10, 24, 0xff0000, 0);
      this.physics.add.existing(hitArea, true);
      this.physics.add.overlap(this.player, hitArea, () => this.damagePlayer(1));
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
    this.movingPlatform = this.add.rectangle(x, y, 135, 22, 0x7a5232);
    this.physics.add.existing(this.movingPlatform, true);
    this.physics.add.collider(this.player, this.movingPlatform);

    const moss = this.add.graphics();
    moss.fillStyle(0x9fc84e, 1);
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
      onUpdate: () => {
        if (this.movingPlatform.body && typeof this.movingPlatform.body.updateFromGameObject === "function") {
          this.movingPlatform.body.updateFromGameObject();
        }
      }
    });
  }

  createSwingingHazard(pivotX, pivotY, length, fromAngle, toAngle, duration) {
    const rope = this.add.container(pivotX, pivotY).setDepth(5);
    const line = this.add.graphics();
    line.lineStyle(4, 0x3d271d);
    line.lineBetween(0, 0, 0, length);
    rope.add(line);

    const thornBall = this.add.graphics();
    thornBall.fillStyle(0x654329, 1);
    thornBall.fillCircle(0, length, 28);
    thornBall.fillStyle(0x9fc84e, 1);
    thornBall.fillTriangle(-20, length - 8, -44, length - 22, -18, length + 2);
    thornBall.fillTriangle(20, length - 8, 44, length - 22, 18, length + 2);
    rope.add(thornBall);

    // Static body for clean overlap detection
    const tip = this.add.circle(pivotX, pivotY + length, 30, 0xffffff, 0);
    this.physics.add.existing(tip, true);
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

  createRollingLog(startX, startY, leftLimit, rightLimit) {
    const log = this.add.container(startX, startY).setDepth(5);
    const bodyRect = this.add.graphics();
    bodyRect.fillStyle(0x5c3a21, 1);
    bodyRect.fillRoundedRect(-32, -16, 64, 32, 8);
    bodyRect.fillStyle(0x9fc84e, 1);
    bodyRect.fillCircle(0, 0, 10);
    log.add(bodyRect);

    const sensor = this.add.rectangle(startX, startY, 54, 28, 0xffffff, 0);
    this.physics.add.existing(sensor, true);
    this.physics.add.overlap(this.player, sensor, () => this.damagePlayer(1));

    this.tweens.add({
      targets: [log, sensor],
      x: rightLimit,
      duration: 2200,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
      onUpdate: () => {
        if (sensor.body && typeof sensor.body.updateFromGameObject === "function") {
          sensor.body.updateFromGameObject();
        }
      }
    });

    this.tweens.add({
      targets: log,
      angle: 360,
      duration: 1000,
      repeat: -1
    });
  }

  createFallingBoulder(x, startY) {
    const boulder = this.add.graphics();
    boulder.fillStyle(0x616a6b, 1);
    boulder.fillCircle(x, startY, 26);
    boulder.fillStyle(0x485152, 1);
    boulder.fillCircle(x - 6, startY - 6, 12);
    boulder.setDepth(6);

    const sensor = this.add.circle(x, startY, 24, 0xffffff, 0);
    this.physics.add.existing(sensor, true);
    this.physics.add.overlap(this.player, sensor, () => this.damagePlayer(1));

    this.tweens.add({
      targets: [boulder, sensor],
      y: 470,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      repeatDelay: 1500,
      ease: "Quad.easeIn",
      onUpdate: () => {
        if (sensor.body && typeof sensor.body.updateFromGameObject === "function") {
          sensor.body.updateFromGameObject();
        }
      }
    });
  }

  createSolidPlatform(x, y, width = 140, height = 22) {
    const plat = this.add.rectangle(x, y, width, height, 0x482d1c);
    plat.setStrokeStyle(2, 0x27160c);
    plat.setDepth(4);
    this.physics.add.existing(plat, true);
    this.physics.add.collider(this.player, plat);

    const moss = this.add.graphics().setDepth(5);
    moss.fillStyle(0x76a035, 1);
    moss.fillRoundedRect(x - width / 2, y - height / 2 - 3, width, 8, 3);
    moss.fillStyle(0x9fc84e, 1);
    for (let i = 0; i < width - 15; i += 24) {
      moss.fillRoundedRect(x - width / 2 + i + 4, y - height / 2 - 4, 16, 5, 2);
    }

    return plat;
  }

  createBouncyMushroom(x, y) {
    const shroom = this.add.container(x, y).setDepth(5);

    // Stem
    const stem = this.add.graphics();
    stem.fillStyle(0xd5e8d4, 1);
    stem.fillRoundedRect(-10, -20, 20, 26, 6);

    // Bioluminescent purple/cyan cap (matches game art)
    const cap = this.add.graphics();
    cap.fillStyle(0x7b1fa2, 1);
    cap.fillEllipse(0, -22, 56, 28);
    cap.fillStyle(0xba68c8, 1);
    cap.fillEllipse(0, -26, 44, 18);
    cap.fillStyle(0x48edd4, 0.95);
    cap.fillCircle(-12, -26, 4);
    cap.fillCircle(12, -24, 5);
    cap.fillCircle(0, -30, 3);

    // Pulsing aura glow
    const aura = this.add.circle(0, -24, 32, 0xba68c8, 0.3);
    this.tweens.add({
      targets: aura,
      scale: 1.35,
      alpha: 0.1,
      duration: 900,
      yoyo: true,
      repeat: -1
    });

    shroom.add([aura, stem, cap]);

    // Spring trigger hitbox
    const sensor = this.add.rectangle(x, y - 24, 48, 18, 0xff00ff, 0);
    this.physics.add.existing(sensor, true);

    this.physics.add.overlap(this.player, sensor, () => {
      if (this.player.body.velocity.y >= -80) {
        this.player.body.setVelocityY(-720);
        this.player.play("hero-jump", true);
        if (window.SoundManager && window.SoundManager.playJump) {
          window.SoundManager.playJump();
        }
        this.createDustPuff(x, y - 20);

        // Squash & stretch spring animation
        this.tweens.add({
          targets: shroom,
          scaleY: 0.45,
          scaleX: 1.35,
          duration: 85,
          yoyo: true,
          ease: "Quad.easeOut"
        });
      }
    });

    return shroom;
  }

  createRootBarricade(x, y, width, height) {
    const barricade = this.add.container(x, y).setDepth(6);

    const art = this.add.graphics();
    // Ancient tangled briar root trunks
    art.fillStyle(0x2d1a0e, 1);
    art.fillRoundedRect(-width / 2, -height / 2, width, height, 10);
    art.lineStyle(3, 0x1a0f08, 1);
    art.strokeRoundedRect(-width / 2, -height / 2, width, height, 10);

    // Twisted roots and sharp thorns
    art.fillStyle(0x422815, 1);
    art.fillRoundedRect(-width / 2 + 6, -height / 2 + 10, width - 12, height - 20, 6);
    art.lineStyle(3, 0x5a391e, 0.9);
    art.lineBetween(-width / 2 + 5, -height / 2 + 15, width / 2 - 5, height / 2 - 15);
    art.lineBetween(width / 2 - 5, -height / 2 + 25, -width / 2 + 5, height / 2 - 25);

    // Bioluminescent moss & thorns
    art.fillStyle(0x76a035, 1);
    art.fillCircle(-width / 4, -height / 3, 6);
    art.fillCircle(width / 4, height / 4, 8);

    barricade.add(art);

    // Solid physical collision body
    const wall = this.add.rectangle(x, y, width, height, 0x000000, 0);
    this.physics.add.existing(wall, true);
    this.physics.add.collider(this.player, wall);

    return wall;
  }

  createGuardianBarrier(x, y) {
    this.guardianBarrierActive = true;
    this.guardianBarrier = this.add.container(x, y).setDepth(9);

    // Clean subtle barrier energy field (no runes, symbols, or strange letters)
    const field = this.add.graphics();
    field.fillStyle(0x3ae7c6, 0.15);
    field.fillRoundedRect(-6, -100, 12, 200, 6);
    field.lineStyle(2, 0x48edd4, 0.4);
    field.strokeRoundedRect(-6, -100, 12, 200, 6);
    this.guardianBarrier.add(field);

    this.tweens.add({
      targets: this.guardianBarrier,
      alpha: { from: 0.25, to: 0.6 },
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });

    // Solid physics blocker
    this.barrierWall = this.add.rectangle(x, y, 28, 220, 0x000000, 0);
    this.physics.add.existing(this.barrierWall, true);
    this.barrierCollider = this.physics.add.collider(this.player, this.barrierWall, () => {
      if (this.anaconda && this.anaconda.alive && this.anaconda.hp > 0) {
        if (!this.barrierMessageCooldown) {
          this.barrierMessageCooldown = true;
          this.showMessage("Kill Giant Anaconda to cross!", 2000);
          this.cameras.main.shake(150, 0.008);
          this.time.delayedCall(2000, () => {
            this.barrierMessageCooldown = false;
          });
        }
      }
    });
  }

  createReflectionBanner() {
    if (this.currentLevel !== 3) return;

    // Top screen reflection prompt in clear English
    this.reflectionBanner = this.add.container(480, 96).setScrollFactor(0).setDepth(150).setAlpha(0);

    const bg = this.add.graphics();
    bg.fillStyle(0x051d18, 0.94);
    bg.fillRoundedRect(-190, -18, 380, 36, 10);
    bg.lineStyle(2, 0x48edd4, 0.95);
    bg.strokeRoundedRect(-190, -18, 380, 36, 10);

    const txt = this.add
      .text(0, 0, "⚡ Press Echo [E] to kill Giant Anaconda", {
        fontFamily: "Arial, sans-serif",
        fontSize: "15px",
        fontStyle: "bold",
        color: "#ffffff"
      })
      .setOrigin(0.5);

    this.reflectionBanner.add([bg, txt]);

    // Subtle breathing reflection glow
    this.tweens.add({
      targets: this.reflectionBanner,
      scaleX: { from: 0.98, to: 1.02 },
      scaleY: { from: 0.98, to: 1.02 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });
  }

  onAnacondaDefeated() {
    this.guardianBarrierActive = false;

    // Permanently destroy the reflection message
    if (this.reflectionBanner) {
      if (this.tweens && typeof this.tweens.killTweensOf === "function") {
        this.tweens.killTweensOf(this.reflectionBanner);
      }
      this.reflectionBanner.destroy();
      this.reflectionBanner = null;
    }

    // Shatter the ancient barrier with magical particle explosion
    if (this.guardianBarrier) {
      const bx = this.guardianBarrier.x;
      const by = this.guardianBarrier.y;

      for (let i = 0; i < 28; i++) {
        const shard = this.add
          .circle(
            bx,
            by + Phaser.Math.Between(-90, 90),
            Phaser.Math.Between(3, 7),
            0x5affea,
            1
          )
          .setDepth(20);

        const angle = Phaser.Math.Between(-180, 180) * (Math.PI / 180);
        const speed = Phaser.Math.Between(80, 260);

        this.tweens.add({
          targets: shard,
          x: shard.x + Math.cos(angle) * speed,
          y: shard.y + Math.sin(angle) * speed,
          alpha: 0,
          scale: 0.1,
          duration: Phaser.Math.Between(500, 900),
          ease: "Quad.easeOut",
          onComplete: () => shard.destroy()
        });
      }

      this.cameras.main.flash(350, 90, 255, 230);
      this.guardianBarrier.destroy();
      this.guardianBarrier = null;
    }

    if (this.barrierCollider) {
      this.barrierCollider.destroy();
      this.barrierCollider = null;
    }

    if (this.barrierWall) {
      this.barrierWall.destroy();
      this.barrierWall = null;
    }
  }

  createExitPortal() {
    this.portal = this.add.container(this.portalX, this.portalY).setDepth(7);

    this.portalOuter = this.add.ellipse(0, 0, 105, 120, 0x14473e, 0.85);
    this.portalOuter.setStrokeStyle(4, 0x3ae7c6);

    this.portalInner = this.add.ellipse(0, 0, 70, 92, 0x14473e, 0.6);
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
      repeat: -1
    });

    this.tweens.add({
      targets: this.portalRunes,
      angle: 360,
      duration: 6000,
      repeat: -1
    });

    this.portalTrigger = this.add.rectangle(this.portalX, this.portalY, 110, 130, 0xffffff, 0);
    this.physics.add.existing(this.portalTrigger, true);
    this.physics.add.overlap(this.player, this.portalTrigger, () => this.enterPortal());
  }

  // ==========================================
  // HUD & CONTROLS
  // ==========================================
  createHUD() {
    this.hudBar = this.add
      .rectangle(480, 24, 960, 48, 0x071513, 0.85)
      .setScrollFactor(0)
      .setDepth(100);

    this.healthText = this.add
      .text(20, 24, "HEALTH: ♥ ♥ ♥", {
        fontFamily: "Arial, sans-serif",
        fontSize: "14px",
        color: "#ff6b81",
        fontStyle: "bold"
      })
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(101);

    this.crystalText = this.add
      .text(175, 24, `CRYSTALS: ${this.crystalsCollected} / 3`, {
        fontFamily: "Arial, sans-serif",
        fontSize: "13px",
        color: "#48edd4",
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
          if (window.SoundManager && window.SoundManager.playLock) {
            window.SoundManager.playLock();
          }
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
        window.SoundManager.playLevelStart();
        this.scene.start("GameScene", { level: lvl });
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
      const isMuted = window.SoundManager.toggleMute();
      this.muteBtn.setText(isMuted ? "🔇 MUTED" : "🔊 SFX");
    });

    this.menuBtn = this.add
      .text(900, 24, "☰ MENU", {
        fontFamily: "Arial, sans-serif",
        fontSize: "12px",
        color: "#ffffff",
        backgroundColor: "#143f34",
        padding: { x: 8, y: 4 },
        fontStyle: "bold"
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(101)
      .setInteractive({ useHandCursor: true });

    this.menuBtn.on("pointerdown", () => {
      this.scene.start("MenuScene");
    });

    this.portalMessage = this.add
      .text(480, 95, "", {
        fontFamily: "Arial, sans-serif",
        fontSize: "17px",
        fontStyle: "bold",
        color: "#48edd4",
        backgroundColor: "#051d19",
        padding: { x: 18, y: 8 }
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
  this.input.on("pointerup", () => {
  this.mobileLeft = false;
  this.mobileRight = false;
  this.mobileJump = false;
});

this.input.on("gameout", () => {
  this.mobileLeft = false;
  this.mobileRight = false;
  this.mobileJump = false;
});

    this.createTouchButton(70, 465, "◀", () => (this.mobileLeft = true), () => (this.mobileLeft = false));
    this.createTouchButton(170, 465, "▶", () => (this.mobileRight = true), () => (this.mobileRight = false));
    this.createTouchButton(720, 465, "ECHO", () => this.activateEcho(), () => {}, "#166154", "#48f0d8");
    this.createTouchButton(835, 465, "JUMP", () => (this.mobileJump = true), () => (this.mobileJump = false), "#1a6e42", "#52f58b");

    this.input.on("pointerup", () => {
      this.mobileLeft = false;
      this.mobileRight = false;
    });
  }

createTouchButton(
  x,
  y,
  label,
  onDown,
  onUp = () => {},
  bgColor = "#124036",
  strokeColor = "#3ae7c6"
) {
  const btn = this.add
    .circle(
      x,
      y,
      38,
      Phaser.Display.Color.HexStringToColor(bgColor).color,
      0.85
    )
    .setStrokeStyle(
      3,
      Phaser.Display.Color.HexStringToColor(strokeColor).color
    )
    .setScrollFactor(0)
    .setDepth(200)
    .setInteractive(
      new Phaser.Geom.Circle(0, 0, 48),
      Phaser.Geom.Circle.Contains
    );

  this.add
    .text(x, y, label, {
      fontFamily: "Arial, sans-serif",
      fontSize: label.length > 2 ? "13px" : "24px",
      fontStyle: "bold",
      color: "#ffffff"
    })
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(201);

  btn.on("pointerdown", (pointer) => {
    btn.setScale(0.92);
    onDown();
  });

  const release = () => {
    btn.setScale(1);
    onUp();
  };

  btn.on("pointerup", release);
  btn.on("pointerout", release);
  btn.on("pointerupoutside", release);

  return btn;
}

  // ==========================================
  // UPDATE LOOP & MECHANICS
  // ==========================================
  update(time, delta) {
    if (this.levelComplete) return;

    if (this.anaconda) {
      this.anaconda.update(time, delta);
    }

    if (this.pathSnakes && this.pathSnakes.length > 0) {
      this.pathSnakes.forEach((snake) => snake.update(time, delta));
    }

    const onGround = this.player.body.touching.down || this.player.body.blocked.down;

    const moveLeft = this.cursors.left.isDown || this.keyA.isDown || this.mobileLeft;
    const moveRight = this.cursors.right.isDown || this.keyD.isDown || this.mobileRight;
    const jump =
      Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
      Phaser.Input.Keyboard.JustDown(this.keyW) ||
      Phaser.Input.Keyboard.JustDown(this.keySpace) ||
      this.mobileJump;

    if (this.mobileJump) {
      this.mobileJump = false;
    }

    if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
      this.activateEcho();
    }

    if (moveLeft) {
      this.player.body.setVelocityX(-250);
      this.player.setFlipX(true);
      if (onGround) {
        this.player.play("hero-run", true);
        this.stepTimer += delta;
        if (this.stepTimer > 280) {
          window.SoundManager.playFootstep();
          this.createDustPuff(this.player.x + 8, this.player.y);
          this.stepTimer = 0;
        }
      }
    } else if (moveRight) {
      this.player.body.setVelocityX(250);
      this.player.setFlipX(false);
      if (onGround) {
        this.player.play("hero-run", true);
        this.stepTimer += delta;
        if (this.stepTimer > 280) {
          window.SoundManager.playFootstep();
          this.createDustPuff(this.player.x - 8, this.player.y);
          this.stepTimer = 0;
        }
      }
    } else {
      this.player.body.setVelocityX(0);
      if (onGround) {
        this.player.play("hero-idle", true);
      }
    }

    if (jump && onGround) {
      this.player.body.setVelocityY(-570);
      window.SoundManager.playJump();
      this.player.play("hero-jump", true);
      this.createDustPuff(this.player.x, this.player.y);
    }

    if (!onGround && this.player.body.velocity.y > 0) {
      this.player.play("hero-land", true);
    }

    // Update swinging pendulums with safe position sync
    if (this.swingingHazards && this.swingingHazards.length > 0) {
      this.swingingHazards.forEach((h) => {
        const rot = h.rope.rotation;
        const tipX = h.pivotX + Math.sin(rot) * h.length;
        const tipY = h.pivotY + Math.cos(rot) * h.length;
        h.tip.setPosition(tipX, tipY);
        if (h.tip.body) {
          if (typeof h.tip.body.updateFromGameObject === "function") {
            h.tip.body.updateFromGameObject();
          } else if (typeof h.tip.body.reset === "function") {
            h.tip.body.reset(tipX, tipY);
          }
        }
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

    // Reflection Message handling in Level 3:
    // Visible only when visiting near the Giant Anaconda, and permanently destroyed when Anaconda is died
    if (this.currentLevel === 3 && this.reflectionBanner) {
      if (this.anaconda && this.anaconda.alive && this.anaconda.hp > 0) {
        const nearAnaconda = this.player.x >= 2820 && this.player.x <= 3450;
        const targetAlpha = nearAnaconda ? 1 : 0;
        if (Math.abs(this.reflectionBanner.alpha - targetAlpha) > 0.05) {
          this.reflectionBanner.alpha += (targetAlpha - this.reflectionBanner.alpha) * 0.12;
        } else {
          this.reflectionBanner.alpha = targetAlpha;
        }
      } else {
        this.reflectionBanner.destroy();
        this.reflectionBanner = null;
      }
    }

    if (this.player.y > 560) {
      this.respawnPlayer();
    }
  }

  activateEcho() {
    if (this.echoActive) return;

    this.echoActive = true;
    window.SoundManager.playEchoPulse();
    this.createEchoWave(this.player.x, this.player.y);

    // Solidify hidden echo platforms
    this.echoPlatforms.forEach((plat) => {
      plat.setAlpha(1);
      plat.setFillStyle(0x3ae7c6, 0.9);
      plat.body.checkCollision.none = false;

      this.tweens.add({
        targets: plat,
        alpha: 0.18,
        duration: this.echoDuration,
        ease: "Quad.easeIn",
        onComplete: () => {
          plat.setFillStyle(0x1f5c49, 0.18);
          plat.body.checkCollision.none = true;
        }
      });
    });

    // Stun any Path Snakes within pulse range
    if (this.pathSnakes && this.pathSnakes.length > 0) {
      let stunnedCount = 0;
      this.pathSnakes.forEach((snake) => {
        if (!snake.alive) return;
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, snake.x, snake.y);
        if (dist < 420) {
          snake.stun(3500);
          stunnedCount++;
        }
      });
      if (stunnedCount > 0) {
        this.showMessage(`⚡ ${stunnedCount} VIPER${stunnedCount > 1 ? "S" : ""} STUNNED WITH ECHO PULSE!`, 1800);
      }
    }

    // Stun the Anaconda Boss if within pulse range
    if (this.anaconda && this.anaconda.alive) {
      const dist = Math.abs(this.player.x - this.anaconda.x);
      if (dist < 520) {
        this.anaconda.stun(3200);
        this.showMessage("ANACONDA GUARDIAN STUNNED!", 1800);
      }
    }

    this.tweens.add({
      targets: this.echoGaugeFill,
      width: 0,
      duration: 300,
      onComplete: () => {
        this.time.delayedCall(this.echoDuration, () => {
          this.tweens.add({
            targets: this.echoGaugeFill,
            width: 75,
            duration: 600,
            onComplete: () => {
              this.echoActive = false;
            }
          });
        });
      }
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

  collectCrystal(container, sensor, index) {
    if (!sensor.active) return;

    sensor.destroy();
    window.SoundManager.playCrystal();

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
    window.SoundManager.playCheckpoint();

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
    window.SoundManager.playHurt();

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

    // Level 3 Boss Gate: The Giant Anaconda must be subdued
    if (this.currentLevel === 3 && this.anaconda && this.anaconda.alive && this.anaconda.hp > 0) {
      this.showMessage("⚡ DEFEAT ANACONDA GUARDIAN WITH ECHO PULSE [E] TO UNLOCK PORTAL!", 2800);
      return;
    }

    this.levelComplete = true;
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

    this.cameras.main.fade(500, 5, 26, 20);
    this.time.delayedCall(500, () => {
      this.scene.start("VictoryScene", {
        level: this.currentLevel,
        crystals: this.crystalsCollected,
        maxCrystals: this.totalCrystals
      });
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

export default GameScene;