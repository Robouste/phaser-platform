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
}
