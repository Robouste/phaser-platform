import { Scene } from "phaser";
import { depthsConfig } from "../configs";
import { GameHelper } from "../helpers";
import { ArcadeBody, Sprite } from "../phaser-aliases";
import { AnimationTag, EnnemyTag, SfxTag } from "../tags";
import { Hero } from "./hero.game-object";

export interface EnnemyConfig {
  scene: Scene;
  x: number;
  y: number;
  patrolDistance: number;
  chaseDistance: number;
  speed: number;
  patrolSpeed: number;
  sprite: EnnemyTag;
  hp: number;
}

export class Ennemy extends Sprite {
  public declare body: ArcadeBody;

  private _player: Hero;
  private _startingX: number;
  private _patrolDirection = 1;
  private _patrolTween: Phaser.Tweens.Tween | null = null;
  private _config: EnnemyConfig;

  private get _isPatrolling(): boolean {
    return this._patrolTween !== null;
  }

  constructor(config: EnnemyConfig, player: Hero) {
    super(config.scene, config.x, config.y, config.sprite);
    this._startingX = config.x;
    this._config = config;

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
    if (this._config.hp <= 0) {
      return;
    }

    this.updateFlipX();

    const distanceToPlayer = Phaser.Math.Distance.Between(this.x, this.y, this._player.x, this._player.y);

    if (distanceToPlayer <= this._config.chaseDistance) {
      this.stopPatrol();
      this.chasePlayer();
    } //
    else if (distanceToPlayer > this._config.chaseDistance && this._patrolTween === null) {
      this.returnToStart();
    }

    GameHelper.animate(this, AnimationTag.ENNEMY_MOVING, {
      exceptIf: [AnimationTag.ENNEMY_DEATH, AnimationTag.ENNEMY_HURT],
    });
  }

  public hurt(damage: number): void {
    this._config.hp -= damage;

    if (this._config.hp <= 0) {
      this.anims.play(AnimationTag.ENNEMY_DEATH);
      this.body.setVelocityX(0);
      this.on("animationcomplete", () => this.destroy());
      this.scene.sound.play(SfxTag.PIXIE_DEAD);
    } else {
      this.anims.play(AnimationTag.ENNEMY_HURT);
      this.scene.sound.play(SfxTag.PIXIE_HURT);
    }
  }

  private startPatrol(): void {
    if (this._patrolTween !== null) {
      return;
    }

    this._patrolDirection = Math.sign(this._config.patrolDistance);

    this._patrolTween = this.scene.tweens.add({
      targets: this,
      x: this._startingX + this._config.patrolDistance,
      duration: (Math.abs(this._config.patrolDistance) / this._config.patrolSpeed) * 1000,
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
    this.body.setVelocityX(direction * this._config.speed);
  }

  private returnToStart(): void {
    if (!GameHelper.isCloseEnough(this.x, this._startingX)) {
      const direction = Math.sign(this._startingX - this.x);
      this.body.setVelocityX(direction * this._config.patrolSpeed);
    } else {
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
      frames: this.anims.generateFrameNumbers(this._config.sprite, {
        start: 0,
        end: 3,
      }),
      frameRate: 5,
      repeat: -1,
    });

    this.anims.create({
      key: AnimationTag.ENNEMY_MOVING,
      frames: this.anims.generateFrameNumbers(this._config.sprite, {
        start: 4,
        end: 7,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: AnimationTag.ENNEMY_HURT,
      frames: this.anims.generateFrameNumbers(this._config.sprite, {
        start: 8,
        end: 9,
      }),
      frameRate: 20,
      repeat: 3,
    });

    this.anims.create({
      key: AnimationTag.ENNEMY_DEATH,
      frames: this.anims.generateFrameNumbers(this._config.sprite, {
        start: 10,
        end: 11,
      }),
      frameRate: 20,
      repeat: 3,
    });
  }
}
