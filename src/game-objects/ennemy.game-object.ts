import { Scene } from "phaser";
import { depthsConfig } from "../configs";
import { ArcadeBody, Sprite } from "../phaser-aliases";
import { AnimationTag, EnnemyTag } from "../tags";

export class Ennemy extends Sprite {
  public declare body: ArcadeBody;

  constructor(scene: Scene, private _spriteTag: EnnemyTag) {
    super(scene, 0, 0, _spriteTag);

    this.setDepth(depthsConfig.ennemies);

    this.createAnimations();
  }

  public spawn(x: number, y: number): void {
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);

    this.play(AnimationTag.ENNEMY_IDLE);

    this.flipX = true;
    this.x = x;
    this.y = y;
  }

  private createAnimations(): void {
    this.anims.create({
      key: AnimationTag.ENNEMY_IDLE,
      frames: this.anims.generateFrameNumbers(this._spriteTag, {
        start: 0,
        end: 3,
      }),
      frameRate: 5,
      repeat: -1,
    });

    this.anims.create({
      key: AnimationTag.ENNEMY_MOVING,
      frames: this.anims.generateFrameNumbers(this._spriteTag, {
        start: 5,
        end: 8,
      }),
      frameRate: 10,
      repeat: -1,
    });
  }
}
