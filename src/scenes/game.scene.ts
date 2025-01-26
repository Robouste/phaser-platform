import { GameHelper } from "@helpers";
import { ANIMATION, Sprite } from "@phaser-aliases";
import { Scene } from "phaser";
import { AssetsConfig } from "../configs";
import { Hero } from "../game-objects";
import { ForestLevel } from "../levels";
import { AnimationTag, HeroEventTag, ImageTag, SceneTag, SpritesheetTag } from "../tags";

export class Game extends Scene {
  private _hero: Hero | undefined;
  private _keyboard: Phaser.Input.Keyboard.KeyboardPlugin | undefined;
  private _toggleDebugKey: Phaser.Input.Keyboard.Key | undefined;
  private _currentLevel: ForestLevel | undefined;
  private _hearts: Sprite[] = [];
  private _heartsBackgrounds: Sprite[] = [];
  private _heartsBorder: Sprite[] = [];
  private _heartSize = 0;

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
      if (!this._hero || GameHelper.isDev) {
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

    this.events.on(HeroEventTag.HURT, () => {
      if (!this._hero) {
        return;
      }

      const affectedHeart = this._hearts[this._hero.hp];
      affectedHeart.play(AnimationTag.HEART_CHANGE);
      affectedHeart.setDisplaySize(this._heartSize, this._heartSize);
      const tweenFash = GameHelper.flashSprite(this, affectedHeart);
      affectedHeart.once(ANIMATION.COMPLETE, () => {
        affectedHeart.setAlpha(1);
        tweenFash.stop();
        tweenFash.destroy();
      });
    });

    this._currentLevel = new ForestLevel(this._hero, this);

    this.createHearts();
    this.createHeartsAnimation();
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

    if (pointer.isDown && !GameHelper.isDev) {
      this.handlePointer(pointer);
    }

    this._hero?.update(time, delta);
    this._currentLevel?.update(time, delta);
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

  private createHearts(): void {
    const maxHearts = this._hero?.maximumHp ?? 0;

    for (let i = 0; i < maxHearts; i++) {
      this._heartsBackgrounds.push(this.createSingleHeart(ImageTag.HEART_BACKGROUND, i));
      this._heartsBorder.push(this.createSingleHeart(ImageTag.HEART_BORDER, i));
      this._hearts.push(this.createSingleHeart(ImageTag.HEART, i));
    }
  }

  private createSingleHeart(sprite: string, index: number): Sprite {
    const heart = this.add.sprite(16 + 18 * index, 16, sprite);
    heart.setOrigin(0, 0);
    heart.setScrollFactor(0);

    this._heartSize = heart.width;

    return heart;
  }

  private createHeartsAnimation(): void {
    this.anims.create({
      key: AnimationTag.HEART_CHANGE,
      frames: this.anims.generateFrameNumbers(SpritesheetTag.HEART, {
        start: 0,
        end: 4,
      }),
      frameRate: 10,
    });
  }
}
