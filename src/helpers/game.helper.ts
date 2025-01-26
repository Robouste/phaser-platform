import { Sprite, Tween } from "@phaser-aliases";
import { AnimationTag } from "@tags";
import { Scene } from "phaser";

export class GameHelper {
  public static get isDev(): boolean {
    return window.location.hostname === "localhost";
  }

  public static get audioIsEnabled(): boolean {
    return this.isDev ? false : true;
  }

  public static animate(
    sprite: Sprite,
    animation: AnimationTag,
    params?: {
      exceptIf?: AnimationTag | AnimationTag[];
      ignoreIfPlaying?: boolean;
    }
  ): void {
    const currentAnimation = sprite.anims.getName() as AnimationTag;
    const currentAnimationIsPlaying = sprite.anims.isPlaying;

    const exceptIf: AnimationTag[] = [];

    if (params?.exceptIf) {
      if (Array.isArray(params.exceptIf)) {
        exceptIf.push(...params.exceptIf);
      } else {
        exceptIf.push(params.exceptIf);
      }
    }

    if (exceptIf.includes(currentAnimation) && currentAnimationIsPlaying) {
      return;
    }

    const ignoreIfPlaying = params?.ignoreIfPlaying === false ? false : true;

    sprite.anims.play(animation, ignoreIfPlaying);
  }

  public static isCloseEnough(value1: number, value2: number, epsilon: number = 1): boolean {
    return Math.abs(value1 - value2) <= epsilon;
  }

  public static getAnimationRepetition(duration: number, frameCount: number, frameRate: number): number {
    return ((duration / 1000) * frameRate) / frameCount;
  }

  // TODO: make it works
  public static getEdgeToEdgeDistance(sprite1: Sprite, sprite2: Sprite): number {
    const distance = Phaser.Math.Distance.BetweenPoints(sprite1.getBounds(), sprite2.getBounds());

    return distance;
  }

  public static flashSprite(scene: Scene, sprite: Sprite): Tween {
    return scene.tweens.add({
      targets: sprite,
      alpha: { from: 1, to: 0 },
      ease: "Linear",
      duration: 100,
      repeat: -1,
      yoyo: true,
    });
  }
}
