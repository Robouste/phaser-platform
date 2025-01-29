import { AnimatedTilesInterface } from "phaser-animated-tiles/dist/AnimatedTiles.js";
import PhaserRaycaster from "phaser-raycaster";

export class CustomScene extends Phaser.Scene {
  raycasterPlugin!: PhaserRaycaster;
  animatedTiles!: AnimatedTilesInterface;
}
