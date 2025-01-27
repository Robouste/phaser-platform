import { CustomScene } from "@game-types";
import { depthsConfig } from "../configs";
import { GameHelper } from "../helpers";
import { ANIMATION, ArcadeBody, ArcadeSprite } from "../phaser-aliases";
import { AnimationTag, EnnemyTag, SfxTag } from "../tags";
import { Hero } from "./hero.game-object";

export interface EnnemyConfig {
  scene: CustomScene;
  x: number;
  y: number;
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

  public get speed(): number {
    return this._config.speed;
  }

  public get direction(): number {
    return this._direction;
  }
  protected debugGraphics: Phaser.GameObjects.Graphics;

  protected set direction(value: number) {
    this._direction = value;
    this.setFlipX(value < 0);
  }

  private _player: Hero;
  private _config: EnnemyConfig;
  private _isAttacking = false;
  private _canAttack = true;
  private _defaultWidth: number;
  private _attackHitbox: Phaser.GameObjects.Rectangle & {
    body: ArcadeBody;
  };

  private _direction = 1;
  private _isPatrolling = false;
  private get _physics(): Phaser.Physics.Arcade.ArcadePhysics {
    return this.scene.physics;
  }

  private _raycaster: Raycaster;
  private _ray: Raycaster.Ray;

  constructor(config: EnnemyConfig, player: Hero) {
    super(config.scene, config.x, config.y, config.sprite);
    this.debugGraphics = this.scene.add.graphics();

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

    this.direction = Phaser.Math.Distance.Between(this.x, this.y, this._player.x, this._player.y) > 0 ? 1 : -1;

    this.startPatrol();
    const plugin: PhaserRaycaster = this._config.scene.raycasterPlugin;

    this._raycaster = plugin.createRaycaster({
      debug: false,
    });
    this.scene.physics.world.staticBodies.entries.forEach((body) => this._raycaster.mapGameObjects(body.gameObject));
    this._raycaster.mapGameObjects(this._player, true);

    this._ray = this._raycaster.createRay();
    this._ray.setRayRange(this._config.chaseDistance);
    // this._ray.setRayRange(1000);
  }

  public update(_: number, __: number): void {
    if (this._config.hp <= 0 || this._isAttacking) {
      return;
    }

    const distanceToPlayer = GameHelper.getEdgeToEdgeDistance(this, this._player);

    if (distanceToPlayer <= this._config.range) {
      this.stopPatrol();
      this.attack();
    } //
    else if (this.heroIsInSight()) {
      this.stopPatrol();
      this.chasePlayer();
    } //
    else if (!this._isPatrolling) {
      this.startPatrol();
    }

    if (this._isPatrolling) {
      this.updatePatrol();
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

  public knockback(strength: number, direction: number): void {
    this.body.setVelocityX((strength / this.body.mass) * direction);

    this.scene.time.delayedCall(400, () => {
      // ennemy is dead
      if (!this.body) {
        return;
      }
      const speed = this._isPatrolling ? this._config.patrolSpeed : this._config.speed;
      this.body.setVelocityX(speed * this.direction);
    });
  }

  private startPatrol(): void {
    this._isPatrolling = true;

    GameHelper.animate(this, AnimationTag.ENNEMY_MOVING);

    this.body.setVelocityX(this._config.patrolSpeed * this.direction);
  }

  private stopPatrol(): void {
    this._isPatrolling = false;
  }

  private updatePatrol(): void {
    if (GameHelper.isObstacleAhead(this, this.scene) || GameHelper.isLedgeAhead(this, this.scene)) {
      this.direction *= -1;
      this.body.setVelocityX(this._config.patrolSpeed * this.direction);
    }
  }

  private attack(): void {
    if (this._isAttacking || !this._canAttack) {
      return;
    }

    this.scene.sound.play(SfxTag.PIXIE_ATTACK);

    const hitboxPosition = {
      x: this.x + this.direction * this._attackHitbox.width,
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

  private heroIsInSight(): boolean {
    this._ray.setOrigin(this.x, this.y);
    this._ray.setAngleDeg(this._direction === 1 ? 0 : 180);
    this._ray.setConeDeg(this._isPatrolling ? 30 : 90);
    const result = this._ray.castCone();

    return result.some((line) => {
      if ("object" in line) {
        return line.object instanceof Hero;
      }
    });
  }

  private chasePlayer(): void {
    this.direction = Math.sign(this._player.x - this.x);
    this.body.setVelocityX(this.direction * this._config.speed);
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
