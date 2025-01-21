import { Scene } from "phaser";
import { depthsConfig } from "../configs";
import { GameHelper } from "../helpers/game.helper";
import { ArcadeBody, ArcadeSprite, Sprite } from "../phaser-aliases";
import { AnimationTag, ImageTag, SfxTag, SpritesheetTag } from "../tags";

export class Hero extends Sprite {
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

  constructor(scene: Scene) {
    super(scene, 0, 0, SpritesheetTag.HERO);

    this.setScale(0.5).setDepth(depthsConfig.hero);

    if (!this.scene.input.keyboard) {
      throw Error("Keyboard plugin is not available");
    }

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
  }

  public update(time: number, _: number): void {
    this.handleMovements(time);
    this.handleProjectiles();
  }

  private handleMovements(time: number): void {
    const isGrounded = this.body.touching.down;

    if (isGrounded) {
      if (this.isMovingLeft || this.isMovingRight) {
        GameHelper.animate(this, AnimationTag.WALK, {
          exceptIf: [AnimationTag.JUMP, AnimationTag.SHOOT],
        });
      } //
      else {
        GameHelper.animate(this, AnimationTag.IDLE, {
          exceptIf: [AnimationTag.JUMP, AnimationTag.SHOOT],
        });

        this.body.setVelocityX(0);
      }

      // for some reason, this "isGrounded" is sometimes true, right after jumping
      const stupidHack = time - this._lastJumpTime > 100;
      //~ Is landing
      if (this._isJumping && stupidHack) {
        this._isJumping = false;
        this.scene.sound.play(SfxTag.LAND);
        this._noOfJump = this._maxNoOfJump;
      }
    }

    if (this.isMovingRight) {
      this.body.setVelocityX(this._speed);
      this.setFlipX(false);
      this.body.setOffset(this._offset.x, this._offset.y);
    }

    if (this.isMovingLeft) {
      this.body.setVelocityX(-this._speed);
      this.setFlipX(true);
      this.body.setOffset(this._offset.x + 6, this._offset.y);
    }

    if (Phaser.Input.Keyboard.JustDown(this._cursors.up)) {
      this._lastJumpTime = time;
      this.jump();
    }

    if (Phaser.Input.Keyboard.JustDown(this._shootKey)) {
      this.shoot();
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

  private jump(): void {
    if (this._noOfJump <= 0) {
      return;
    }

    this._noOfJump--;
    this._isJumping = true;

    this.body.setVelocityY(-this._jumpSpeed);
    this.scene.sound.play(SfxTag.JUMP);
    GameHelper.animate(this, AnimationTag.JUMP);
  }

  private createAnimations(): void {
    this.anims.create({
      key: AnimationTag.IDLE,
      frames: this.anims.generateFrameNumbers(SpritesheetTag.HERO, {
        start: 0,
        end: 3,
      }),
      frameRate: 5,
      repeat: -1,
    });

    this.anims.create({
      key: AnimationTag.WALK,
      frames: this.anims.generateFrameNumbers(SpritesheetTag.HERO, {
        start: 5,
        end: 8,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: AnimationTag.JUMP,
      frames: this.anims.generateFrameNumbers(SpritesheetTag.HERO, {
        start: 20,
        end: 22,
      }),
      frameRate: 7,
    });

    this.anims.create({
      key: AnimationTag.SHOOT,
      frames: this.anims.generateFrameNumbers(SpritesheetTag.HERO, {
        start: 15,
        end: 19,
      }),
      frameRate: 15,
    });
  }

  private shoot(): void {
    this.scene.sound.play(SfxTag.ARROW_SHOOT);

    GameHelper.animate(this, AnimationTag.SHOOT, {
      ignoreIfPlaying: false,
    });
    const velocity = this.flipX ? -600 : 600;

    const projectile: ArcadeSprite = this.projectiles.create(this.x, this.y, ImageTag.PROJECTILE_ARROW);
    projectile.setFlipX(this.flipX);
    projectile.setVelocityX(velocity);
  }
}
