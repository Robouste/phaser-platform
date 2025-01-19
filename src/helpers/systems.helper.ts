import { Tilemap } from "../phaser-aliases";

interface AnimatedTiles {
  init: (map: Tilemap) => void;
  setRate: (rate: number) => void;
  resetRates: () => void;
  resume: () => void;
  pause: () => void;
  postUpdate: (time: number, delta: number) => void;
  shutdown: () => void;
}

export class Systems extends Phaser.Scenes.Systems {
  public animatedTiles: AnimatedTiles | undefined;
}
