import { AnimationsManager } from "@helpers";
import { AnimationTag, EnnemyTag } from "@tags";

export class ForestAnimations extends AnimationsManager<EnnemyTag> {
  protected createAnimations(sprite: EnnemyTag, attackSprite?: EnnemyTag): void {
    this.scene.anims.create({
      key: AnimationTag.ENNEMY_IDLE,
      frames: this.scene.anims.generateFrameNumbers(sprite, {
        start: 0,
        end: 3,
      }),
      frameRate: 5,
      repeat: -1,
    });

    this.scene.anims.create({
      key: AnimationTag.ENNEMY_MOVING,
      frames: this.scene.anims.generateFrameNumbers(sprite, {
        start: 4,
        end: 7,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.scene.anims.create({
      key: AnimationTag.ENNEMY_HURT,
      frames: this.scene.anims.generateFrameNumbers(sprite, {
        start: 8,
        end: 9,
      }),
      frameRate: 20,
      repeat: 3,
    });

    this.scene.anims.create({
      key: AnimationTag.ENNEMY_DEATH,
      frames: this.scene.anims.generateFrameNumbers(sprite, {
        start: 10,
        end: 11,
      }),
      frameRate: 20,
      repeat: 3,
    });

    if (attackSprite) {
      this.scene.anims.create({
        key: AnimationTag.ENNEMY_ATTACK,
        frames: this.scene.anims.generateFrameNumbers(attackSprite, {
          start: 0,
          end: 4,
        }),
        frameRate: 10,
      });
    }
  }
}
