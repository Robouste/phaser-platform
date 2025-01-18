import { Scene } from "phaser";
import { AssetsConfig } from "../configs/assets.config";
import { SceneTag } from "../tags";

export class Preloader extends Scene {
  constructor() {
    super(SceneTag.PRELOADER);
  }

  public init(): void {}

  public preload(): void {
    this.load.setPath("assets");

    AssetsConfig.images.forEach((config) =>
      this.load.image(config.tag, config.url)
    );

    AssetsConfig.spritesheets.forEach((config) =>
      this.load.spritesheet(config.tag, config.url, config.config)
    );

    AssetsConfig.tilemaps.forEach((config) =>
      this.load.tilemapTiledJSON(config.tag, config.url)
    );

    AssetsConfig.sfx.forEach((config) =>
      this.load.audio(config.tag, config.url)
    );

    AssetsConfig.bgs.forEach((config) =>
      this.load.audio(config.tag, config.url)
    );
  }

  public create(): void {
    this.scene.start(SceneTag.GAME);
  }
}
