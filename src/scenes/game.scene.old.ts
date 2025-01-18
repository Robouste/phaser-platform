//@ts-nocheck

import { Scene } from "phaser";
import {
  ArcadeBody,
  ArcadeSprite,
  GameObject,
  GameObjectWithBody,
  TileMapsTile,
} from "../phaser-aliases";
import { AnimationTag, ImageTag, SceneTag, SpritesheetTag } from "../tags";

export class Game extends Scene {
  private _platforms: Phaser.Physics.Arcade.StaticGroup;
  private _player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private _cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private _stars: Phaser.Physics.Arcade.Group;
  private _bombs: Phaser.Physics.Arcade.Group;
  private _scoreText: Phaser.GameObjects.Text;
  private _score = 0;

  constructor() {
    super(SceneTag.GAME);
  }

  public create(): void {
    if (!this.input.keyboard) {
      throw Error("Keyboard plugin is not available");
    }

    this._cursors = this.input.keyboard.createCursorKeys();

    this.addBackground();
    this.addPlayer();
    this.addPlatforms();
    this.addStars();
    this.addBombs();
    this.addScore();
  }

  /**
   *
   * @param _ time
   * @param __ delta
   */
  public update(_: number, __: number): void {
    this.handleInputs();
  }

  private addBackground(): void {
    this.add
      .image(0, 0, ImageTag.SKY)
      .setOrigin(0, 0)
      .setDisplaySize(this.scale.width, this.scale.height);
  }

  private addPlatforms(): void {
    this._platforms = this.physics.add.staticGroup();

    this._platforms.create(400, 568, ImageTag.GROUND).setScale(2).refreshBody();

    this._platforms.create(600, 400, ImageTag.GROUND);
    this._platforms.create(50, 250, ImageTag.GROUND);
    this._platforms.create(750, 220, ImageTag.GROUND);

    this.physics.add.collider(this._player, this._platforms);
  }

  private addPlayer(): void {
    this._player = this.physics.add.sprite(100, 450, SpritesheetTag.DUDE);

    this._player.setBounce(0.2);
    this._player.setCollideWorldBounds(true);

    this.anims.create({
      key: AnimationTag.LEFT,
      frames: this.anims.generateFrameNumbers(SpritesheetTag.DUDE, {
        start: 0,
        end: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: AnimationTag.TURN,
      frames: [{ key: SpritesheetTag.DUDE, frame: 4 }],
      frameRate: 20,
    });

    this.anims.create({
      key: AnimationTag.RIGHT,
      frames: this.anims.generateFrameNumbers(SpritesheetTag.DUDE, {
        start: 5,
        end: 8,
      }),
      frameRate: 10,
      repeat: -1,
    });
  }

  private addStars(): void {
    this._stars = this.physics.add.group({
      key: ImageTag.STAR,
      repeat: 11,
      setXY: { x: 12, y: 0, stepX: 70 },
    });

    this._stars.children.iterate((child) => {
      if (!this.isStar(child)) {
        throw Error("Child is not an instance of Phaser.Physics.Arcade.Sprite");
      }

      child.setBounceY(Phaser.Math.FloatBetween(0.2, 0.5));

      return true;
    });

    this.physics.add.collider(this._stars, this._platforms);

    this.physics.add.overlap(this._player, this._stars, (a, b) =>
      this.collectStars(a, b)
    );
  }

  private addBombs(): void {
    this._bombs = this.physics.add.group();

    this.physics.add.collider(this._bombs, this._platforms);

    this.physics.add.collider(this._player, this._bombs, () => {
      this.physics.pause();
      this._player.setTint(0xff0000);
      this._player.anims.play(AnimationTag.TURN);
      this.scene.start(SceneTag.GAME_OVER);
    });
  }

  private addScore(): void {
    this._scoreText = this.add.text(16, 16, "Score: 0", {
      fontSize: "32px",
      color: "#000",
    });
  }

  private collectStars(
    _: GameObjectWithBody | ArcadeBody | TileMapsTile,
    star: GameObjectWithBody | ArcadeBody | TileMapsTile
  ): void {
    if (!(star instanceof Phaser.Physics.Arcade.Sprite)) {
      throw Error("Star is not an instance of Phaser.Physics.Arcade.Sprite");
    }

    star.disableBody(true, true);

    this._score += 10;
    this._scoreText.setText(`Score: ${this._score}`);

    if (this._stars.countActive(true) === 0) {
      this._stars.children.iterate((child) => {
        if (!this.isStar(child)) {
          throw Error(
            "Child is not an instance of Phaser.Physics.Arcade.Sprite"
          );
        }

        child.enableBody(true, child.x, 0, true, true);
        return true;
      });

      const x =
        this._player.x < 400
          ? Phaser.Math.Between(400, 800)
          : Phaser.Math.Between(0, 400);

      const bomb: ArcadeSprite = this._bombs.create(x, 16, ImageTag.BOMB);
      bomb.setBounce(1);
      bomb.setCollideWorldBounds(true);
      bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    }
  }

  private handleInputs(): void {
    if (this._cursors.left.isDown) {
      this._player.setVelocityX(-160);
      this._player.anims.play(AnimationTag.LEFT, true);
    } //
    else if (this._cursors.right.isDown) {
      this._player.setVelocityX(160);
      this._player.anims.play(AnimationTag.RIGHT, true);
    } //
    else {
      this._player.setVelocityX(0);
      this._player.anims.play(AnimationTag.TURN);
    }

    if (this._cursors.up.isDown && this._player.body.touching.down) {
      this._player.setVelocityY(-330);
    }
  }

  private isStar(star: GameObject): star is ArcadeSprite {
    return star instanceof Phaser.Physics.Arcade.Sprite;
  }
}
