import { Scene } from "phaser";
import { depthsConfig } from "../configs";
import { GameHelper } from "../helpers";
import { ArcadeBody, Sprite } from "../phaser-aliases";
import { AnimationTag, EnnemyTag, SfxTag, SpritesheetTag } from "../tags";
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
  range: number;
  atkCooldown: number;
  damage: number;
}

export class Ennemy extends Sprite {
  public declare body: ArcadeBody;

  private _player: Hero;
  private _atkHitbox: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private _startingX: number;
  private _patrolDirection = 1;
  private _patrolTween: Phaser.Tweens.Tween | null = null;
  private _config: EnnemyConfig;
  private _attacking = false;
  private _canAttack = true;

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

    const hitbox = this.scene.add
      .sprite(this.x, this.y, SpritesheetTag.PIXIE_HITBOX)
      .setVisible(false)
      .setDepth(depthsConfig.atkHitbox);

    this._atkHitbox = this.scene.physics.add.existing(hitbox) as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    this.scene.add.existing(this._atkHitbox);

    this._atkHitbox.body.setAllowGravity(false);
    this._atkHitbox.body.setEnable(false);
    this.scene.physics.world.remove(this._atkHitbox.body);

    this.flipX = true;

    this.setDepth(depthsConfig.ennemies);

    this.scene.physics.add.collider(this._atkHitbox, this._player, () => {
      this._player.hurt(this._config.damage);
    });

    this.createAnimations();
    this.startPatrol();
  }

  public update(): void {
    if (this._config.hp <= 0) {
      return;
    }

    this.updateFlipX();

    const distanceToPlayer = Phaser.Math.Distance.Between(this.x, this.y, this._player.x, this._player.y);

    if (distanceToPlayer <= this._config.range) {
      this.attack();
    } //
    else if (distanceToPlayer <= this._config.chaseDistance) {
      this.stopPatrol();
      this.chasePlayer();
    } //
    else if (distanceToPlayer > this._config.chaseDistance && !this._isPatrolling) {
      this.returnToStart();
    }

    GameHelper.animate(this, AnimationTag.ENNEMY_MOVING, {
      exceptIf: [AnimationTag.ENNEMY_DEATH, AnimationTag.ENNEMY_HURT, AnimationTag.ENNEMY_ATTACK],
    });
  }

  public hurt(damage: number): void {
    this._config.hp -= damage;

    if (this._config.hp <= 0) {
      this.anims.play(AnimationTag.ENNEMY_DEATH);
      this.body.setVelocityX(0);
      this.body.setEnable(false);
      this.on(GameHelper.animCompleteEvent(AnimationTag.ENNEMY_DEATH), () => this.destroy());
      this.scene.sound.play(SfxTag.PIXIE_DEAD);
    } //
    else {
      this.anims.play(AnimationTag.ENNEMY_HURT);
      this.scene.sound.play(SfxTag.PIXIE_HURT);
    }
  }

  private startPatrol(): void {
    if (this._patrolTween !== null) {
      return;
    }

    GameHelper.animate(this, AnimationTag.ENNEMY_MOVING);
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

  private attack(): void {
    if (this._attacking || !this._canAttack) {
      return;
    }

    this.scene.sound.play(SfxTag.PIXIE_ATTACK);
    const direction = this.flipX ? -1 : 1;
    this._atkHitbox.setPosition(this.x + direction * this._atkHitbox.width, this.y).setVisible(true);
    this._atkHitbox.setFlipX(this.flipX);
    this._atkHitbox.body.setEnable(true);
    this.scene.physics.world.add(this._atkHitbox.body);
    this._atkHitbox.anims.play(AnimationTag.ENNEMY_ATTACK_HITBOX);
    this._atkHitbox.once(GameHelper.animCompleteEvent(AnimationTag.ENNEMY_ATTACK_HITBOX), () => {
      this._atkHitbox.setVisible(false);
      this._atkHitbox.body.setEnable(false);
      this.scene.physics.world.remove(this._atkHitbox.body);
    });

    this._attacking = true;
    this._canAttack = false;
    this.body.setVelocityX(0);
    GameHelper.animate(this, AnimationTag.ENNEMY_ATTACK);

    this.once(GameHelper.animCompleteEvent(AnimationTag.ENNEMY_ATTACK), () => {
      this._attacking = false;
      this.scene.time.delayedCall(this._config.atkCooldown, () => (this._canAttack = true));
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
    if (GameHelper.isCloseEnough(this.x, this._startingX)) {
      this.body.setVelocityX(0);
      this.startPatrol();
    } else {
      const direction = Math.sign(this._startingX - this.x);
      this.body.setVelocityX(direction * this._config.patrolSpeed);
    }
  }

  private updateFlipX(): void {
    // Patrol is using a tween, which updates X position instead of velocity
    if (this._isPatrolling) {
      this.setFlipX(this._patrolDirection < 0);
    } //
    else {
      const distanceToPlayer = Phaser.Math.Distance.Between(this.x, this.y, this._player.x, this._player.y);

      if (distanceToPlayer <= this._config.chaseDistance) {
        const playerDirection = Math.sign(this._player.x - this.x);
        this.setFlipX(playerDirection < 0);
      } //
      else {
        this.setFlipX(this.body.velocity.x < 0);
      }
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
        start: 5,
        end: 8,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: AnimationTag.ENNEMY_HURT,
      frames: this.anims.generateFrameNumbers(this._config.sprite, {
        start: 10,
        end: 11,
      }),
      frameRate: 20,
      repeat: 3,
    });

    this.anims.create({
      key: AnimationTag.ENNEMY_DEATH,
      frames: this.anims.generateFrameNumbers(this._config.sprite, {
        start: 12,
        end: 13,
      }),
      frameRate: 20,
      repeat: 3,
    });

    this.anims.create({
      key: AnimationTag.ENNEMY_ATTACK,
      frames: this.anims.generateFrameNumbers(this._config.sprite, {
        start: 15,
        end: 19,
      }),
      frameRate: 10,
    });

    this._atkHitbox.anims.create({
      key: AnimationTag.ENNEMY_ATTACK_HITBOX,
      frames: this.anims.generateFrameNumbers(SpritesheetTag.PIXIE_HITBOX, {
        start: 0,
        end: 4,
      }),
      frameRate: 10,
    });
  }
}
