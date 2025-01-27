import { PluginTag } from "@tags";
import { Game, Types } from "phaser";
import AnimatedTiles from "phaser-animated-tiles/dist/AnimatedTiles.js";
import PhaserRaycaster from "phaser-raycaster";
import { GameHelper } from "./helpers";
import { Boot, GameOver, Game as MainGame, MainMenu, Preloader } from "./scenes";

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/latest/Phaser.Types.Core.GameConfig
const config: Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 910,
  height: 512,
  parent: "game-container",
  backgroundColor: "#028af8",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 800 },
      debug: GameHelper.isDev,
    },
  },
  input: {
    keyboard: true,
  },
  plugins: {
    scene: [
      {
        key: PluginTag.RAYCASTER,
        plugin: PhaserRaycaster,
        mapping: PluginTag.RAYCASTER,
      },
      {
        key: PluginTag.ANIMATED_TILES,
        plugin: AnimatedTiles,
        mapping: PluginTag.ANIMATED_TILES,
      },
    ],
  },
  scene: [Boot, Preloader, MainMenu, MainGame, GameOver],
};

export default new Game(config);
