import { Scene } from "phaser";
import { depthsConfig } from "../configs";
import { ArcadeBody, Sprite } from "../phaser-aliases";
import { AnimationTag, EnnemyTag } from "../tags";

export class Ennemy extends Sprite {
  public declare body: ArcadeBody;

  private _speed = 60;
  private _startingPoint = { x: 0, y: 0 };
  private _endingPoint = { x: 0, y: 0 };
  private _isMovingToEnd = true;

  constructor(private _scene: Scene, private _spriteTag: EnnemyTag) {
    super(_scene, 0, 0, _spriteTag);

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

    this._startingPoint = { x, y };
  }

  public patrol(endingPoint: { x: number; y: number }): void {
    this._endingPoint = endingPoint;
    this.play(AnimationTag.ENNEMY_MOVING);

    this._scene.events.on("update", () => {
      if (this._isMovingToEnd) {
        this.goToTarget(this._endingPoint.x, this._endingPoint.y);

        const distance = Phaser.Math.Distance.Between(this.x, this.y, this._endingPoint.x, this._endingPoint.y);

        if (distance < 10) {
          this._isMovingToEnd = false;
        }
      } else {
        this.goToTarget(this._startingPoint.x, this._startingPoint.y);

        const distance = Phaser.Math.Distance.Between(this.x, this.y, this._startingPoint.x, this._startingPoint.y);

        if (distance < 10) {
          this._isMovingToEnd = true;
        }
      }

      this.flipX = this.body.velocity.x < 0;
    });
  }

  public goToTarget(targetX: number, targetY: number): void {
    this.scene.physics.moveTo(this, targetX, targetY, this._speed);
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
        start: 4,
        end: 7,
      }),
      frameRate: 10,
      repeat: -1,
    });
  }
}
