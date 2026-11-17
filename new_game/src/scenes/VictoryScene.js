/**
 * ECHOBOUND - Victory & Level Progression Scene
 */

class VictoryScene extends Phaser.Scene {
  constructor() {
    super("VictoryScene");
  }

  init(data) {
    this.completedLevel = data.level || 1;
    this.crystals = data.crystals || 3;
    this.maxCrystals = data.maxCrystals || 3;
  }

  create() {
    const width = 960;
    const height = 540;

    window.SoundManager.playVictory();

    // Dark emerald triumph overlay
    this.add.rectangle(width / 2, height / 2, width, height, 0x051a14);

    // Radiant victory glow
    const glow = this.add.circle(width / 2, 170, 150, 0x48edd4, 0.16);
    this.tweens.add({
      targets: glow,
      scale: 1.4,
      alpha: 0.28,
      duration: 1200,
      yoyo: true,
      repeat: -1
    });

    // Particle confetti
    for (let i = 0; i < 40; i++) {
      const spark = this.add.circle(
        Phaser.Math.Between(50, width - 50),
        Phaser.Math.Between(-50, 0),
        Phaser.Math.Between(3, 6),
        Phaser.Utils.Array.GetRandom([0x48edd4, 0xffdf6d, 0x67ffef, 0xffffff]),
        0.9
      );
      this.tweens.add({
        targets: spark,
        y: height + 50,
        x: spark.x + Phaser.Math.Between(-80, 80),
        duration: Phaser.Math.Between(2000, 4000),
        repeat: -1,
        delay: Phaser.Math.Between(0, 2000)
      });
    }

    // Title
    const isFinalLevel = this.completedLevel >= 3;
    const headerText = isFinalLevel ? "SANCTUM CLEARED!" : `LEVEL ${this.completedLevel} COMPLETE!`;

    this.add
      .text(width / 2, 130, headerText, {
        fontFamily: "Georgia, serif",
        fontSize: "46px",
        fontStyle: "bold",
        color: "#ffdf6d",
        stroke: "#194a36",
        strokeThickness: 8
      })
      .setOrigin(0.5);

    const subText = isFinalLevel
      ? "THE ANACONDA GUARDIAN IS SUBDUED • THE LOST LIGHT OF VERIDIA IS RESTORED"
      : "LUMINA GATEWAY AWAKENED • PATHWAY UNLOCKED";

    this.add
      .text(width / 2, 190, subText, {
        fontFamily: "Arial, sans-serif",
        fontSize: "14px",
        fontStyle: "bold",
        color: "#9af3de",
        letterSpacing: 2
      })
      .setOrigin(0.5);

    // Stars
    this.add
      .text(width / 2, 240, "★  ★  ★", {
        fontFamily: "Georgia, serif",
        fontSize: "36px",
        color: "#ffdf6d"
      })
      .setOrigin(0.5);

    // Stats Box
    const statsBox = this.add
      .rectangle(width / 2, 310, 480, 70, 0x092b23, 0.85)
      .setStrokeStyle(2, 0x48edd4);

    this.add
      .text(
        width / 2,
        310,
        `💎 CRYSTALS COLLECTED: ${this.crystals} / ${this.maxCrystals}   |   ECHO PULSE: MASTERED\nSTATUS: ALL OBSTACLES CONQUERED`,
        {
          fontFamily: "Arial, sans-serif",
          fontSize: "14px",
          color: "#ffffff",
          align: "center",
          lineSpacing: 5
        }
      )
      .setOrigin(0.5);

    // Action Buttons
    const btnY = 415;

    if (!isFinalLevel) {
      // NEXT LEVEL BUTTON
      const nextBtn = this.add
        .text(width / 2 - 120, btnY, `NEXT: LEVEL ${this.completedLevel + 1} ➔`, {
          fontFamily: "Arial, sans-serif",
          fontSize: "16px",
          fontStyle: "bold",
          color: "#051814",
          backgroundColor: "#48edd4",
          padding: { x: 20, y: 12 }
        })
        .setOrigin(0.5)
        .setInteractive();

      nextBtn.on("pointerdown", () => {
        window.SoundManager.playLevelStart();
        this.scene.start("GameScene", { level: this.completedLevel + 1 });
      });

      // MENU BUTTON
      const menuBtn = this.add
        .text(width / 2 + 130, btnY, "LEVEL SELECT", {
          fontFamily: "Arial, sans-serif",
          fontSize: "16px",
          fontStyle: "bold",
          color: "#ffffff",
          backgroundColor: "#164539",
          padding: { x: 20, y: 12 }
        })
        .setOrigin(0.5)
        .setInteractive();

      menuBtn.on("pointerdown", () => {
        this.scene.start("MenuScene");
      });
    } else {
      // BEAT THE ENTIRE GAME!
      const menuBtn = this.add
        .text(width / 2, btnY, "🏆 RETURN TO LEVEL SELECT", {
          fontFamily: "Arial, sans-serif",
          fontSize: "18px",
          fontStyle: "bold",
          color: "#051814",
          backgroundColor: "#ffdf6d",
          padding: { x: 28, y: 14 }
        })
        .setOrigin(0.5)
        .setInteractive();

      menuBtn.on("pointerdown", () => {
        this.scene.start("MenuScene");
      });
    }
  }
}

window.VictoryScene = VictoryScene;
