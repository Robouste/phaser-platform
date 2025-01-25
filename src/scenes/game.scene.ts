import { Scene } from "phaser";
import { AssetsConfig } from "../configs";
import { Hero } from "../game-objects";
import { ForestLevel } from "../levels";
import { SceneTag } from "../tags";

export class Game extends Scene {
  private _hero: Hero | undefined;
  private _keyboard: Phaser.Input.Keyboard.KeyboardPlugin | undefined;
  private _toggleDebugKey: Phaser.Input.Keyboard.Key | undefined;
  private _currentLevel: ForestLevel | undefined;

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

    this.input.on(Phaser.Input.Events.POINTER_DOWN, (pointer: Phaser.Input.Pointer) => {
      if (!this._hero) {
        return;
      }

      const xIsLeft = pointer.x < this.cameras.main.width / 2;
      const yIsTop = pointer.y < this.cameras.main.height / 2;

      if (xIsLeft && yIsTop) {
        this._hero.heroState.set({ action: "JUMPING" });
      }
      if (!xIsLeft && yIsTop) {
        this._hero.heroState.set({ action: "SHOOTING" });
      }
    });

    this._hero = new Hero(this);
    this._hero.on("destroy", () => this.scene.start(SceneTag.GAME_OVER));
    this._currentLevel = new ForestLevel(this._hero, this);
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

    const pointer = this.input.activePointer;

    if (pointer.isDown) {
      this.handlePointer(pointer);
    }

    this._hero?.update(time, delta);
    this._currentLevel?.update();
  }

  private createDebug(): void {
    this._toggleDebugKey = this._keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.D);
  }

  private handlePointer(pointer: Phaser.Input.Pointer) {
    if (!this._hero) {
      return;
    }

    const xIsLeft = pointer.x < this.cameras.main.width / 2;
    const yIsTop = pointer.y < this.cameras.main.height / 2;

    if (xIsLeft && !yIsTop) {
      this._hero.heroState.set({ action: "MOVING-LEFT" });
    }
    if (!xIsLeft && !yIsTop) {
      this._hero.heroState.set({ action: "MOVING-RIGHT" });
    }
  }
}
