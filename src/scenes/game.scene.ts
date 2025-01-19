import { Scene } from "phaser";
import { AssetsConfig } from "../configs";
import { Hero } from "../game-objects";
import { ForestLevel } from "../levels";
import { SceneTag } from "../tags";

export class Game extends Scene {
  private _hero: Hero | undefined;
  private _keyboard: Phaser.Input.Keyboard.KeyboardPlugin | undefined;
  private _toggleDebugKey: Phaser.Input.Keyboard.Key | undefined;

  constructor() {
    super(SceneTag.GAME);
  }

  public preload(): void {
    AssetsConfig.plugins.forEach((config) =>
      this.load.scenePlugin(config.tag, config.url, config.systemKey, config.sceneKey)
    );
  }

  public create(): void {
    if (!this.input.keyboard) {
      throw Error("Keyboard plugin is not available");
    }

    this._keyboard = this.input.keyboard;
    this.createDebug();

    this._hero = new Hero(this, 0, 0);
    new ForestLevel(this._hero, this);
  }

  /**
   *
   * @param time time
   * @param delta delta
   */
  public update(time: number, delta: number): void {
    if (this._toggleDebugKey && Phaser.Input.Keyboard.JustDown(this._toggleDebugKey)) {
      if (this.physics.world.drawDebug) {
        this.physics.world.drawDebug = false;
        this.physics.world.debugGraphic.clear();
      } else {
        this.physics.world.drawDebug = true;
      }
    }

    this._hero?.update(time, delta);
  }

  private createDebug(): void {
    this._toggleDebugKey = this._keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.D);
  }
}
