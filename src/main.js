import Phaser from "phaser";

import "./audio/SoundManager.js";
import "./entities/PathSnake.js";
import "./entities/AnacondaBoss.js";

import MenuScene from "./scenes/MenuScene.js";
import GameScene from "./scenes/GameScene.js";
import VictoryScene from "./scenes/VictoryScene.js";

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

  scene: [MenuScene, GameScene, VictoryScene]
};

window.game = new Phaser.Game(config);