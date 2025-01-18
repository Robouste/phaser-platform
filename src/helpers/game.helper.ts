import { Sprite } from "../phaser-aliases";
import { AnimationTag } from "../tags";

export class GameHelper {
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
