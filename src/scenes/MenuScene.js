import Phaser from "phaser";

class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
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

  setUnlockedLevel(level) {
    try {
      localStorage.setItem("echobound_unlocked_level", String(level));
    } catch (e) {}
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
      console.warn("Asset preload in MenuScene handled cleanly", e);
    }
  }

  create() {
    const width = 960;
    const height = 540;
    const unlockedLevel = this.getUnlockedLevel();

    // Dark lush jungle backdrop
    this.add.rectangle(width / 2, height / 2, width, height, 0x061413);

    // Decorative background foliage
    const bgArt = this.add.graphics();
    bgArt.fillStyle(0x0e2e28, 0.7);
    bgArt.fillCircle(100, 100, 260);
    bgArt.fillCircle(860, 440, 300);
    bgArt.fillCircle(480, 560, 420);

    // Floating fireflies
    for (let i = 0; i < 28; i++) {
      const fly = this.add.circle(
        Phaser.Math.Between(40, width - 40),
        Phaser.Math.Between(50, height - 50),
        Phaser.Math.Between(2, 4),
        0xebff82,
        0.8
      );
      this.tweens.add({
        targets: fly,
        y: fly.y - Phaser.Math.Between(20, 50),
        alpha: 0.2,
        scale: 1.5,
        duration: Phaser.Math.Between(1500, 3000),
        yoyo: true,
        repeat: -1
      });
    }

    // Glowing cyan ambient aura
    const aura = this.add.circle(width / 2, 150, 180, 0x48edd4, 0.12);
    this.tweens.add({
      targets: aura,
      scale: 1.3,
      alpha: 0.22,
      duration: 2000,
      yoyo: true,
      repeat: -1
    });

    // Main Game Title
    this.add
      .text(width / 2, 75, "ECHOBOUND", {
        fontFamily: "Georgia, serif",
        fontSize: "52px",
        fontStyle: "bold",
        color: "#ffffff",
        stroke: "#144837",
        strokeThickness: 8
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, 122, "REALMS OF ECHO  •  THE LOST LIGHT", {
        fontFamily: "Arial, sans-serif",
        fontSize: "14px",
        color: "#67ffef",
        letterSpacing: 6,
        fontStyle: "bold"
      })
      .setOrigin(0.5);

    // Progression subtitle
    const statusText =
      unlockedLevel === 1
        ? "PROGRESSION: LEVEL 1 UNLOCKED (CONQUER LEVEL 1 TO REACH THE CHASM)"
        : unlockedLevel === 2
        ? "PROGRESSION: LEVEL 2 UNLOCKED (CONQUER LEVEL 2 TO REACH THE SANCTUM)"
        : "PROGRESSION: ALL REALMS UNLOCKED • MASTER OF ECHO";

    this.add
      .text(width / 2, 155, statusText, {
        fontFamily: "Arial, sans-serif",
        fontSize: "12px",
        color: unlockedLevel >= 3 ? "#ffdf6d" : (unlockedLevel >= 2 ? "#67c4ff" : "#98d6c8"),
        fontStyle: "bold",
        letterSpacing: 1
      })
      .setOrigin(0.5);

    // ==========================================
    // LEVEL SELECTION CARDS (Levels 1, 2, 3)
    // ==========================================
    const levels = [
      {
        num: 1,
        title: "LEVEL 1: THE CANOPY",
        badge: "PLAY LEVEL 1 ➔",
        desc: "Sunlit Rainforest • Echo Platforms • Spike Pits • 3 Sun Crystals",
        color: "#1c5c49",
        border: "#48edd4",
        unlocked: true,
        x: 210,
        y: 285
      },
      {
        num: 2,
        title: "LEVEL 2: THE CHASM",
        badge: unlockedLevel >= 2 ? "PLAY LEVEL 2 ➔" : "🔒 LOCKED (BEAT LEVEL 1)",
        desc: "Twilight Indigo • Pendulums • Rolling Logs • Twin Boulders",
        color: unlockedLevel >= 2 ? "#275069" : "#131b22",
        border: unlockedLevel >= 2 ? "#67c4ff" : "#324350",
        unlocked: unlockedLevel >= 2,
        x: 480,
        y: 285
      },
      {
        num: 3,
        title: "LEVEL 3: GUARDIAN'S LAIR",
        badge:
          unlockedLevel >= 3
            ? "PLAY LEVEL 3 ➔"
            : (unlockedLevel < 2 ? "🔒 LOCKED (BEAT LVL 1 & 2)" : "🔒 LOCKED (BEAT LEVEL 2)"),
        desc: "Blood Moon Sanctum • Anaconda Boss • Venom Barrage • Great Portal",
        color: unlockedLevel >= 3 ? "#4e2960" : "#1a121c",
        border: unlockedLevel >= 3 ? "#df75ff" : "#452d43",
        unlocked: unlockedLevel >= 3,
        x: 750,
        y: 285
      }
    ];

    levels.forEach(lvl => {
      this.createLevelCard(lvl);
    });

    // Alert toast notification container (for locked warnings)
    this.toastContainer = this.add.container(width / 2, 380).setDepth(200).setAlpha(0);
    this.toastBg = this.add.rectangle(0, 0, 520, 36, 0x1f0b0c, 0.95).setStrokeStyle(2, 0xff5252);
    this.toastText = this.add
      .text(0, 0, "", {
        fontFamily: "Arial, sans-serif",
        fontSize: "13px",
        fontStyle: "bold",
        color: "#ffcdd2"
      })
      .setOrigin(0.5);
    this.toastContainer.add([this.toastBg, this.toastText]);

    // "PLAY FROM LEVEL 1" BUTTON
    const playAllBtn = this.add
      .text(width / 2 - 110, 428, "▶ START FROM LEVEL 1", {
        fontFamily: "Arial, sans-serif",
        fontSize: "16px",
        fontStyle: "bold",
        color: "#051814",
        backgroundColor: "#48edd4",
        padding: { x: 22, y: 11 }
      })
      .setOrigin(0.5)
      .setDepth(10)
      .setInteractive({ useHandCursor: true });

    this.tweens.add({
      targets: playAllBtn,
      scale: 1.04,
      duration: 900,
      yoyo: true,
      repeat: -1
    });

    playAllBtn.on("pointerdown", () => {
      this.startLevel(1);
    });

    // "RESET PROGRESS" BUTTON (Allows re-locking levels 2 & 3 anytime for testing!)
    const resetBtn = this.add
      .text(width / 2 + 130, 428, "🔒 RESET PROGRESS (RELOCK)", {
        fontFamily: "Arial, sans-serif",
        fontSize: "14px",
        fontStyle: "bold",
        color: "#ffcdd2",
        backgroundColor: "#2c1719",
        padding: { x: 16, y: 11 }
      })
      .setOrigin(0.5)
      .setDepth(10)
      .setInteractive({ useHandCursor: true });

    resetBtn.on("pointerdown", () => {
      this.resetLocks();
    });
    resetBtn.on("pointerover", () => {
      resetBtn.setStyle({ backgroundColor: "#4a1c20" });
    });
    resetBtn.on("pointerout", () => {
      resetBtn.setStyle({ backgroundColor: "#2c1719" });
    });

    // Footer Control Tips
    this.add
      .text(
        width / 2,
        485,
        "CONTROLS:  A/D or Arrows: Move  |  Space/W: Jump  |  E: Echo Pulse  |  Touch Buttons on Mobile",
        {
          fontFamily: "Arial, sans-serif",
          fontSize: "12px",
          color: "#83baad"
        }
      )
      .setOrigin(0.5);

    this.add
      .text(
        width / 2,
        510,
        "Level 2 unlocks after clearing Level 1 • Level 3 unlocks after clearing Level 2",
        {
          fontFamily: "Arial, sans-serif",
          fontSize: "11px",
          color: "#5fa393"
        }
      )
      .setOrigin(0.5);

    // Spacebar start shortcut
    this.input.keyboard.once("keydown-SPACE", () => {
      this.startLevel(1);
    });
  }

  createLevelCard(lvl) {
    const isUnlocked = lvl.unlocked;

    const cardBg = this.add
      .rectangle(
        lvl.x,
        lvl.y,
        240,
        130,
        Phaser.Display.Color.HexStringToColor(lvl.color).color,
        isUnlocked ? 0.95 : 0.65
      )
      .setStrokeStyle(3, Phaser.Display.Color.HexStringToColor(lvl.border).color)
      .setInteractive({ useHandCursor: true });

    const titleColor = isUnlocked ? "#ffffff" : "#8a969e";
    const titleText = this.add
      .text(lvl.x, lvl.y - 34, lvl.title, {
        fontFamily: "Arial, sans-serif",
        fontSize: "14px",
        fontStyle: "bold",
        color: titleColor
      })
      .setOrigin(0.5)

    const descColor = isUnlocked ? "#d4ece5" : "#60727c";
    const descText = this.add
      .text(lvl.x, lvl.y - 4, lvl.desc, {
        fontFamily: "Arial, sans-serif",
        fontSize: "11px",
        color: descColor,
        align: "center",
        wordWrap: { width: 220 }
      })
      .setOrigin(0.5)

    const badgeColor = isUnlocked ? lvl.border : "#e57373";
    const badgeBg = isUnlocked ? "#061814" : "#241014";
    const playBadge = this.add
      .text(lvl.x, lvl.y + 36, lvl.badge, {
        fontFamily: "Arial, sans-serif",
        fontSize: isUnlocked ? "12px" : "11px",
        fontStyle: "bold",
        color: badgeColor,
        backgroundColor: badgeBg,
        padding: { x: 10, y: 5 }
      })
      .setOrigin(0.5)

    if (!isUnlocked) {
      this.add
        .text(lvl.x + 95, lvl.y - 45, "🔒", {
          fontSize: "18px"
        })
        .setOrigin(0.5);
    }

    

const onCardClick = () => {
  if (!isUnlocked) {
    this.showLockedAlert(lvl);
  } else {
    this.startLevel(lvl.num);
  }
};

// Use the card background as the only interactive object
cardBg.setInteractive({ useHandCursor: true });

cardBg.on("pointerdown", onCardClick);

cardBg.on("pointerover", () => {
  if (isUnlocked) {
    cardBg.setScale(1.03);
  } else {
    cardBg.setStrokeStyle(3, 0xff5252);
  }
});

cardBg.on("pointerout", () => {
  cardBg.setScale(1);
  cardBg.setStrokeStyle(
    3,
    Phaser.Display.Color.HexStringToColor(lvl.border).color
  );
});

    lvl.cardBg = cardBg;
  }

  showLockedAlert(lvl) {
    if (window.SoundManager && window.SoundManager.playLock) {
      window.SoundManager.playLock();
    }

    const reqMsg =
      lvl.num === 2
        ? "🔒 LEVEL 2 IS LOCKED! Complete Level 1 to enter The Chasm."
        : "🔒 LEVEL 3 IS LOCKED! Complete Level 1 & Level 2 to enter Guardian's Lair.";

    this.toastText.setText(reqMsg);
    this.toastBg.setFillStyle(0x1f0b0c, 0.95).setStrokeStyle(2, 0xff5252);
    this.toastText.setColor("#ffcdd2");
    this.toastContainer.setAlpha(1);

    // Shake the clicked card
    if (lvl.cardBg) {
      this.tweens.add({
        targets: lvl.cardBg,
        x: lvl.x + 6,
        duration: 50,
        yoyo: true,
        repeat: 3
      });
    }

    // Auto-fade toast
    if (this.toastTimer) this.toastTimer.remove();
    this.toastTimer = this.time.delayedCall(2200, () => {
      this.tweens.add({
        targets: this.toastContainer,
        alpha: 0,
        duration: 350
      });
    });
  }

  resetLocks() {
    this.setUnlockedLevel(1);
    if (window.SoundManager && window.SoundManager.playLock) {
      window.SoundManager.playLock();
    }

    this.toastText.setText("🔄 PROGRESS RESET: Levels 2 & 3 are now LOCKED!");
    this.toastBg.setFillStyle(0x10251d, 0.95).setStrokeStyle(2, 0x48edd4);
    this.toastText.setColor("#b8f3e5");
    this.toastContainer.setAlpha(1);

    this.time.delayedCall(700, () => {
      this.scene.restart();
    });
  }

  startLevel(levelNumber) {
    const unlockedLevel = this.getUnlockedLevel();
    if (levelNumber > unlockedLevel) {
      this.showLockedAlert({ num: levelNumber });
      return;
    }

    window.SoundManager.ensureContext();
    window.SoundManager.playLevelStart();
    this.cameras.main.fade(250, 6, 20, 19);
    this.time.delayedCall(250, () => {
      this.scene.start("GameScene", { level: levelNumber });
    });
  }
}

export default MenuScene;