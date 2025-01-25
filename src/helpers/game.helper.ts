import { Sprite } from "../phaser-aliases";
import { AnimationTag } from "../tags";

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
}
