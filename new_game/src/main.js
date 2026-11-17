/**
 * ECHOBOUND - Main Game Initialization
 * Boots the game with MenuScene, GameScene, and VictoryScene.
 */

const config = {
  type: Phaser.AUTO,
  width: 960,
  height: 540,
  parent: "game-container",
  backgroundColor: "#050f0e",

  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },

  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 900 },
      debug: false
    }
  },

  scene: [window.MenuScene, window.GameScene, window.VictoryScene]
};

window.onload = () => {
  window.game = new Phaser.Game(config);
};
