import { Scene } from "phaser";
import { depthsConfig } from "../configs";
import { HeroState } from "../helpers";
import { GameHelper } from "../helpers/game.helper";
import { ArcadeBody, ArcadeSprite } from "../phaser-aliases";
import { AnimationTag, ImageTag, SfxTag, SpritesheetTag } from "../tags";

export class Hero extends ArcadeSprite {
  public declare body: ArcadeBody;
  public projectiles: Phaser.Physics.Arcade.Group;

  public get isMovingLeft(): boolean {
    return this._cursors.left.isDown;
  }
  public get isMovingRight(): boolean {
    return this._cursors.right.isDown;
  }
  public get speed(): number {
    return this._speed;
  }
  public get damage(): number {
    return this._damage;
  }
  public get offset(): { x: number; y: number } {
    return this._offset;
  }
  public get heroState(): HeroState {
    return this._state;
  }
  public get hp(): number {
    return this._hp;
  }

  private _invincibilityWindow = 1000;
  private _isInvincible = false;
  private _hp = 4;
  private _maximumHp = 4;
  private _speed = 160;
  private _jumpSpeed = 360;
  private _noOfJump = 2;
  private _maxNoOfJump = 2;
  private _lastJumpTime = 0;
  private _damage = 17;
  private _cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private _keyboard: Phaser.Input.Keyboard.KeyboardPlugin;
  private _shootKey: Phaser.Input.Keyboard.Key;
  private _isJumping = false;

  // That's SHIT. I need to understand better how it works and make it more dynamic
  private _offset = {
    x: 8,
    y: 14,
  };
  private _state: HeroState;

  constructor(scene: Scene) {
    super(scene, 0, 0, SpritesheetTag.HERO);

    this.setScale(0.5).setDepth(depthsConfig.hero);

    if (!this.scene.input.keyboard) {
      throw Error("Keyboard plugin is not available");
    }

    this._state = new HeroState(this);

    this._keyboard = this.scene.input.keyboard;
    this._cursors = this._keyboard.createCursorKeys();
    this._shootKey = this._keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.projectiles = this.scene.physics.add.group({
      allowGravity: false,
    });

    this.createAnimations();
  }

  public spawn(x: number, y: number): void {
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);

    this.x = x;
    this.y = y;

    const hitboxWidth = this.width * 0.7;
    const hitboxHeight = this.height * 0.8;
    this.body.setSize(hitboxWidth, hitboxHeight);
    this.body.setOffset(this._offset.x, this._offset.y);

    this._state.set({ action: "IDLE" });
  }

  public update(time: number, _: number): void {
    if (this._hp <= 0) {
      return;
    }
    this.handleMovements(time);
    this.handleProjectiles();
  }

  public shoot(): void {
    this.scene.sound.play(SfxTag.ARROW_SHOOT);

    GameHelper.animate(this, AnimationTag.HERO_SHOOT, {
      ignoreIfPlaying: false,
    });
    const velocity = this.flipX ? -600 : 600;

    const projectile: ArcadeSprite = this.projectiles.create(this.x, this.y, ImageTag.PROJECTILE_ARROW);
    projectile.setFlipX(this.flipX);
    projectile.setVelocityX(velocity);
  }

  public jump(): void {
    if (this._noOfJump <= 0) {
      return;
    }

    this._noOfJump--;
    this._isJumping = true;

    this.body.setVelocityY(-this._jumpSpeed);
    this.scene.sound.play(SfxTag.JUMP);
    GameHelper.animate(this, AnimationTag.HERO_JUMP);
  }

  public hurt(damage: number): void {
    if (this._isInvincible) {
      return;
    }

    this._isInvincible = true;
    this.scene.time.delayedCall(this._invincibilityWindow, () => {
      this._isInvincible = false;
    });

    this._hp -= damage;
    console.log("aie");

    if (this._hp <= 0) {
      this.scene.sound.play(SfxTag.HERO_DIE);
      GameHelper.animate(this, AnimationTag.HERO_DIE);
      this.on(GameHelper.animCompleteEvent(AnimationTag.HERO_DIE), () => {
        this.destroy();
      });
    } else {
      this.scene.sound.play(SfxTag.HERO_HURT);
      GameHelper.animate(this, AnimationTag.HERO_HURT);
    }
  }

  public heal(amount: number): void {
    this._hp = Math.min(this._hp + amount, this._maximumHp);
  }

  private handleMovements(time: number): void {
    if (this.body.touching.down) {
      // for some reason, touching.down is sometimes true, right after jumping
      const stupidHack = time - this._lastJumpTime > 100;

      //~ Is landing
      if (this._isJumping && stupidHack) {
        this._isJumping = false;
        this.scene.sound.play(SfxTag.LAND);
        this._noOfJump = this._maxNoOfJump;
      }
    }

    if (this.isMovingRight) {
      this._state.set({ action: "MOVING-RIGHT" });
    } else if (this.isMovingLeft) {
      this._state.set({ action: "MOVING-LEFT" });
    } else if (!this.scene.input.activePointer.isDown) {
      this.body.setVelocityX(0);
    }

    if (Phaser.Input.Keyboard.JustDown(this._cursors.up)) {
      this._lastJumpTime = time;
      this._state.set({ action: "JUMPING" });
    }

    if (Phaser.Input.Keyboard.JustDown(this._shootKey)) {
      this._state.set({ action: "SHOOTING" });
    }

    if (this.body.velocity.x === 0 && this.body.velocity.y === 0) {
      this._state.set({ action: "IDLE" });
    }
  }

  private handleProjectiles(): void {
    this.projectiles?.children.iterate((projectile) => {
      if (!(projectile instanceof Phaser.Physics.Arcade.Sprite)) {
        return true;
      }

      const sceneWidth = this.scene.cameras.main.getBounds().width;

      if (projectile.x > sceneWidth || projectile.x < 0 || projectile.y > sceneWidth || projectile.y < 0) {
        projectile.destroy();
      }

      return true;
    }, this);
  }

  private createAnimations(): void {
    this.anims.create({
      key: AnimationTag.HERO_IDLE,
      frames: this.anims.generateFrameNumbers(SpritesheetTag.HERO, {
        start: 0,
        end: 3,
      }),
      frameRate: 5,
      repeat: -1,
    });

    this.anims.create({
      key: AnimationTag.HERO_WALK,
      frames: this.anims.generateFrameNumbers(SpritesheetTag.HERO, {
        start: 5,
        end: 8,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: AnimationTag.HERO_JUMP,
      frames: this.anims.generateFrameNumbers(SpritesheetTag.HERO, {
        start: 20,
        end: 22,
      }),
      frameRate: 7,
    });

    this.anims.create({
      key: AnimationTag.HERO_SHOOT,
      frames: this.anims.generateFrameNumbers(SpritesheetTag.HERO, {
        start: 15,
        end: 19,
      }),
      frameRate: 15,
    });

    this.anims.create({
      key: AnimationTag.HERO_HURT,
      frames: this.anims.generateFrameNumbers(SpritesheetTag.HERO, {
        start: 9,
        end: 10,
      }),
      frameRate: 10,
    });

    this.anims.create({
      key: AnimationTag.HERO_DIE,
      frames: this.anims.generateFrameNumbers(SpritesheetTag.HERO, {
        start: 11,
        end: 12,
      }),
      frameRate: 10,
    });
  }
}
