/**
 * ECHOBOUND - Title & Level Select Scene
 * Allows direct access to all levels (Level 1, Level 2, Level 3) or sequential play.
 */

class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create() {
    const width = 960;
    const height = 540;

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
    const aura = this.add.circle(width / 2, 170, 180, 0x48edd4, 0.12);
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
      .text(width / 2, 90, "ECHOBOUND", {
        fontFamily: "Georgia, serif",
        fontSize: "56px",
        fontStyle: "bold",
        color: "#ffffff",
        stroke: "#144837",
        strokeThickness: 8
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, 142, "REALMS OF ECHO  •  THE LOST LIGHT", {
        fontFamily: "Arial, sans-serif",
        fontSize: "14px",
        color: "#67ffef",
        letterSpacing: 6,
        fontStyle: "bold"
      })
      .setOrigin(0.5);

    this.add
      .text(
        width / 2,
        185,
        "Explore 3 progressive levels. Project the Echo Pulse [E] to solidify ethereal pathways\nand stun the Anaconda Guardian. Collect all 3 Lumina Crystals to restore the ancient portal.",
        {
          fontFamily: "Arial, sans-serif",
          fontSize: "13px",
          color: "#bde8dc",
          align: "center",
          lineSpacing: 4
        }
      )
      .setOrigin(0.5);

    // ==========================================
    // LEVEL SELECTION CARDS
    // ==========================================
    const levels = [
      {
        num: 1,
        title: "LEVEL 1: THE CANOPY",
        desc: "Whispering Woods • Echo Platforms • Spike Pits",
        color: "#1c5c49",
        border: "#48edd4",
        x: 210,
        y: 295
      },
      {
        num: 2,
        title: "LEVEL 2: THE CHASM",
        desc: "Swinging Pendulums • Rolling Logs • Boulders",
        color: "#275069",
        border: "#67c4ff",
        x: 480,
        y: 295
      },
      {
        num: 3,
        title: "LEVEL 3: GUARDIAN'S LAIR",
        desc: "Banyan Tree • Anaconda Boss • Great Sun Portal",
        color: "#4e2960",
        border: "#df75ff",
        x: 750,
        y: 295
      }
    ];

    levels.forEach(lvl => {
      this.createLevelCard(lvl);
    });

    // "PLAY FROM BEGINNING" BUTTON
    const playAllBtn = this.add
      .text(width / 2, 420, "▶ START FULL ADVENTURE (LEVEL 1-3)", {
        fontFamily: "Arial, sans-serif",
        fontSize: "17px",
        fontStyle: "bold",
        color: "#051814",
        backgroundColor: "#48edd4",
        padding: { x: 26, y: 13 }
      })
      .setOrigin(0.5)
      .setInteractive();

    this.tweens.add({
      targets: playAllBtn,
      scale: 1.05,
      duration: 900,
      yoyo: true,
      repeat: -1
    });

    playAllBtn.on("pointerdown", () => {
      this.startLevel(1);
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

    // Spacebar start shortcut
    this.input.keyboard.once("keydown-SPACE", () => {
      this.startLevel(1);
    });
  }

  createLevelCard(lvl) {
    const cardBg = this.add
      .rectangle(lvl.x, lvl.y, 240, 115, Phaser.Display.Color.HexStringToColor(lvl.color).color, 0.9)
      .setStrokeStyle(3, Phaser.Display.Color.HexStringToColor(lvl.border).color)
      .setInteractive();

    const titleText = this.add
      .text(lvl.x, lvl.y - 28, lvl.title, {
        fontFamily: "Arial, sans-serif",
        fontSize: "14px",
        fontStyle: "bold",
        color: "#ffffff"
      })
      .setOrigin(0.5);

    const descText = this.add
      .text(lvl.x, lvl.y, lvl.desc, {
        fontFamily: "Arial, sans-serif",
        fontSize: "11px",
        color: "#d4ece5",
        align: "center",
        wordWrap: { width: 220 }
      })
      .setOrigin(0.5);

    const playBadge = this.add
      .text(lvl.x, lvl.y + 32, "PLAY LEVEL ➔", {
        fontFamily: "Arial, sans-serif",
        fontSize: "12px",
        fontStyle: "bold",
        color: lvl.border,
        backgroundColor: "#061814",
        padding: { x: 10, y: 4 }
      })
      .setOrigin(0.5);

    cardBg.on("pointerover", () => {
      cardBg.setScale(1.04);
      titleText.setScale(1.04);
      descText.setScale(1.04);
      playBadge.setScale(1.04);
    });

    cardBg.on("pointerout", () => {
      cardBg.setScale(1);
      titleText.setScale(1);
      descText.setScale(1);
      playBadge.setScale(1);
    });

    cardBg.on("pointerdown", () => {
      this.startLevel(lvl.num);
    });
  }

  startLevel(levelNumber) {
    window.SoundManager.ensureContext();
    window.SoundManager.playLevelStart();
    this.cameras.main.fade(300, 6, 20, 19);
    this.time.delayedCall(300, () => {
      this.scene.start("GameScene", { level: levelNumber });
    });
  }
}

window.MenuScene = MenuScene;
