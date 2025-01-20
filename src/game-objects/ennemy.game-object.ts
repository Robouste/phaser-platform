import { Scene } from "phaser";
import { depthsConfig } from "../configs";
import { GameHelper } from "../helpers";
import { ArcadeBody, Sprite } from "../phaser-aliases";
import { AnimationTag, EnnemyTag } from "../tags";
import { Hero } from "./hero.game-object";

export interface EnnemyConfig {
  scene: Scene;
  x: number;
  y: number;
  patrolDistance: number;
  chaseDistance: number;
  speed: number;
  sprite: EnnemyTag;
}

export class Ennemy extends Sprite {
  public declare body: ArcadeBody;

  private _patrolDistance: number;
  private _chaseDistance: number;
  private _player: Hero;
  private _startingX: number;
  private _spriteTag: EnnemyTag;
  private _patrolDirection = 1;
  private _speed = 60;
  private _patrolTween: Phaser.Tweens.Tween | null = null;

  private get _isPatrolling(): boolean {
    return this._patrolTween !== null;
  }

  constructor(config: EnnemyConfig, player: Hero) {
    super(config.scene, config.x, config.y, config.sprite);
    this._startingX = config.x;
    this._patrolDistance = config.patrolDistance;
    this._chaseDistance = config.chaseDistance;
    this._speed = config.speed;
    this._spriteTag = config.sprite;

    this._player = player;

    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);

    this.flipX = true;

    this.setDepth(depthsConfig.ennemies);

    this.createAnimations();
    this.startPatrol();
    this.play(AnimationTag.ENNEMY_MOVING);
  }

  public update(): void {
    this.updateFlipX();

    const distanceToPlayer = Phaser.Math.Distance.Between(this.x, this.y, this._player.x, this._player.y);

    if (distanceToPlayer <= this._chaseDistance) {
      this.stopPatrol();
      this.chasePlayer();
    } //
    else if (distanceToPlayer > this._chaseDistance && this._patrolTween === null) {
      this.returnToStart();
    }
  }

  private startPatrol(): void {
    if (this._patrolTween !== null) {
      return;
    }

    this._patrolDirection = Math.sign(this._patrolDistance);

    this._patrolTween = this.scene.tweens.add({
      targets: this,
      x: this._startingX + this._patrolDistance,
      duration: Math.abs(this._patrolDistance) * 10,
      yoyo: true,
      repeat: -1,
      onYoyo: () => (this._patrolDirection *= -1),
      onRepeat: () => (this._patrolDirection *= -1),
    });
  }

  private stopPatrol(): void {
    if (this._patrolTween !== null) {
      this._patrolTween.stop();
      this._patrolTween = null;
    }
  }

  private chasePlayer(): void {
    const direction = Math.sign(this._player.x - this.x);
    this.body.setVelocityX(direction * this._speed);
  }

  private returnToStart(): void {
    if (!GameHelper.isCloseEnough(this.x, this._startingX)) {
      const direction = Math.sign(this._startingX - this.x);
      this.body.setVelocityX(direction * this._speed);
    } else {
      console.log("reached start");
      this.body.setVelocityX(0);
      this.startPatrol();
    }
  }

  private updateFlipX(): void {
    // Patrol is using a tween, which updates X position instead of velocity
    if (this._isPatrolling) {
      this.setFlipX(this._patrolDirection < 0);
    } else {
      this.setFlipX(this.body.velocity.x < 0);
    }
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
