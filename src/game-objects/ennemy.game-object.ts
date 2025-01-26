import { Scene } from "phaser";
import { depthsConfig } from "../configs";
import { GameHelper } from "../helpers";
import { ANIMATION, ArcadeBody, ArcadeSprite } from "../phaser-aliases";
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
  attackSprite: EnnemyTag;
  hp: number;
  range: number;
  atkCooldown: number;
  damage: number;
  id: number;
}

export class Ennemy extends ArcadeSprite {
  public declare body: ArcadeBody;

  private _player: Hero;
  private _startingX: number;
  private _patrolDirection = 1;
  private _patrolTween: Phaser.Tweens.Tween | null = null;
  private _config: EnnemyConfig;
  private _isAttacking = false;
  private _canAttack = true;
  private _defaultWidth: number;
  private _attackHitbox: Phaser.GameObjects.Rectangle & {
    body: ArcadeBody;
  };

  private get _isPatrolling(): boolean {
    return this._patrolTween !== null;
  }
  private get _physics(): Phaser.Physics.Arcade.ArcadePhysics {
    return this.scene.physics;
  }

  constructor(config: EnnemyConfig, player: Hero) {
    super(config.scene, config.x, config.y, config.sprite);
    this._startingX = config.x;
    this._config = config;

    this._player = player;
    this._defaultWidth = this.width;

    this.scene.add.existing(this);
    this._physics.add.existing(this);

    this.flipX = true;

    this.setDepth(depthsConfig.ennemies);
    this.setbodySize({
      isAttacking: false,
    });

    const attackHitbox = this.scene.add.rectangle(0, 0, this._config.range, 32, 0xffffff, 0);

    this._attackHitbox = this._physics.add.existing(attackHitbox) as Phaser.GameObjects.Rectangle & {
      body: ArcadeBody;
    };

    this._attackHitbox.body.setAllowGravity(false);
    this._attackHitbox.body.setEnable(false);
    this._physics.world.remove(this._attackHitbox.body);

    this._physics.add.overlap(
      this._attackHitbox,
      this._player,
      () => {
        this._player.hurt(this._config.damage);
      },
      undefined,
      this
    );

    this.startPatrol();
  }

  public update(): void {
    if (this._config.hp <= 0 || this._isAttacking) {
      return;
    }

    this.updateFlipX();

    const distanceToPlayer = GameHelper.getEdgeToEdgeDistance(this, this._player);

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
      this.on(ANIMATION.COMPLETE_KEY + AnimationTag.ENNEMY_DEATH, () => this.destroy());
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
    if (this._isAttacking || !this._canAttack) {
      return;
    }

    this.scene.sound.play(SfxTag.PIXIE_ATTACK);
    const direction = this.flipX ? -1 : 1;
    const hitboxPosition = {
      x: this.x + direction * this._attackHitbox.width,
      y: this.y,
    };

    this._attackHitbox.setPosition(hitboxPosition.x, hitboxPosition.y).setVisible(true);
    this._attackHitbox.body.setEnable(true);
    this._physics.world.add(this._attackHitbox.body);

    this._isAttacking = true;
    this._canAttack = false;
    this.body.setVelocityX(0);
    GameHelper.animate(this, AnimationTag.ENNEMY_ATTACK);

    this.setbodySize({
      isAttacking: true,
    });

    this.once(ANIMATION.COMPLETE_KEY + AnimationTag.ENNEMY_ATTACK, () => {
      this._attackHitbox.body.setEnable(false);
      this._physics.world.remove(this._attackHitbox.body);

      this.anims.play(AnimationTag.ENNEMY_IDLE);
      this._isAttacking = false;
      this.setbodySize({
        isAttacking: false,
      });
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

  private setbodySize(params: { isAttacking: boolean }): void {
    if (params.isAttacking) {
      this.body.setSize(this._defaultWidth, this.body.height, true);
      // this.setOrigin(0.5);
    } else {
      const hitboxHeight = this.height * 0.8;
      this.body.setSize(this._defaultWidth, hitboxHeight);
    }
  }
}
