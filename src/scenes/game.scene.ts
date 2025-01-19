import { Scene } from "phaser";
import { AssetsConfig } from "../configs";
import { Hero } from "../game-objects";
import { Sprite } from "../phaser-aliases";
import {
  BackgroundSound,
  ImageTag,
  SceneTag,
  SfxTag,
  TilemapTag,
  TilesetTag,
} from "../tags";

export class Game extends Scene {
  protected get hero(): Hero {
    if (!this._hero) {
      throw Error("Hero is not available");
    }

    return this._hero;
  }
  protected set hero(value: Hero) {
    this._hero = value;
  }
  private _hero: Hero | undefined;
  private _keyboard: Phaser.Input.Keyboard.KeyboardPlugin | undefined;
  private _toggleDebugKey: Phaser.Input.Keyboard.Key | undefined;
  private _sceneWidth = 3200;
  private _colliderGroup: Phaser.Physics.Arcade.StaticGroup | undefined;

  constructor() {
    super(SceneTag.GAME);
  }

  public preload(): void {
    AssetsConfig.plugins.forEach((config) =>
      this.load.scenePlugin(
        config.tag,
        config.url,
        config.systemKey,
        config.sceneKey
      )
    );
  }

  public create(): void {
    if (!this.input.keyboard) {
      throw Error("Keyboard plugin is not available");
    }

    console.log("sys", this.sys);

    this.sound.play(BackgroundSound.RIVER_FLOWING_INSECTS, {
      loop: true,
    });

    this._keyboard = this.input.keyboard;
    this.createDebug();

    this.addBackgrounds();

    this.generateMap();
  }

  /**
   *
   * @param time time
   * @param delta delta
   */
  public update(time: number, delta: number): void {
    if (
      this._toggleDebugKey &&
      Phaser.Input.Keyboard.JustDown(this._toggleDebugKey)
    ) {
      if (this.physics.world.drawDebug) {
        this.physics.world.drawDebug = false;
        this.physics.world.debugGraphic.clear();
      } else {
        this.physics.world.drawDebug = true;
      }
    }

    this.hero.update(time, delta);
  }

  private createDebug(): void {
    this._toggleDebugKey = this._keyboard?.addKey(
      Phaser.Input.Keyboard.KeyCodes.D
    );
  }

  private addBackgrounds(): void {
    const backgrounds = [
      ImageTag.FOREST_BACKGROUND_DAY_1,
      ImageTag.FOREST_BACKGROUND_DAY_2,
      ImageTag.FOREST_BACKGROUND_DAY_3,
      ImageTag.FOREST_BACKGROUND_DAY_4,
    ];

    backgrounds.forEach((background) => {
      this.add
        .tileSprite(0, 0, this._sceneWidth, this.scale.height, background)
        .setOrigin(0)
        .setScale(1.1, 1.1);
    });
  }

  private generateMap(): void {
    const tilemap = this.make.tilemap({ key: TilemapTag.FOREST });

    const baseTileset = tilemap.addTilesetImage(
      "base-tiles",
      TilesetTag.FOREST_BASE,
      32,
      32,
      1,
      2
    );
    const decorativeTileset = tilemap.addTilesetImage(
      "decorative-tiles",
      TilesetTag.FOREST_DECORATIVE,
      32,
      32,
      1,
      2
    );
    const waterAnimationTileset = tilemap.addTilesetImage(
      "water-animation",
      TilesetTag.FOREST_WATER_ANIMATION,
      32,
      32,
      1,
      2
    );

    const treeBright3AnimationTileset = tilemap.addTilesetImage(
      "tree_bright3",
      TilesetTag.FOREST_TREE_BRIGHT_3_ANIMATION,
      32,
      32,
      1,
      2
    );

    const treeBright4AnimationTileset = tilemap.addTilesetImage(
      "tree_bright4",
      TilesetTag.FOREST_TREE_BRIGHT_4_ANIMATION,
      32,
      32,
      1,
      2
    );

    this._colliderGroup = this.physics.add.staticGroup();
    const colliders = tilemap.createFromObjects("Colliders", {
      type: "collider",
      classType: Sprite,
    });

    this._colliderGroup.addMultiple(colliders);

    colliders
      .filter((collider): collider is Sprite => collider instanceof Sprite)
      .forEach((collider) => {
        collider.alpha = 0;
      });

    const positions = tilemap.createFromObjects("Positions", {
      name: "hero",
    });

    const heroPosition = positions.at(-1);

    if (!(heroPosition instanceof Phaser.GameObjects.Sprite)) {
      throw Error("Hero position is not a sprite");
    }

    heroPosition.alpha = 0;

    this.createPlayer(heroPosition.x, heroPosition.y);

    this.physics.add.collider(this.hero, this._colliderGroup);

    this.physics.add.collider(
      this.hero.projectiles,
      this._colliderGroup,
      (projectile) => {
        console.log("collided");
        this.time.addEvent({
          delay: 4000,
          callback: () => {
            projectile.destroy();
          },
        });
        this.sound.play(SfxTag.ARROW_WALL_IMPACT, {});
      }
    );

    if (
      !baseTileset ||
      !decorativeTileset ||
      !waterAnimationTileset ||
      !treeBright3AnimationTileset ||
      !treeBright4AnimationTileset
    ) {
      throw Error("Tileset not found");
    }

    tilemap.createLayer("background", baseTileset);
    tilemap.createLayer("foreground", [baseTileset, waterAnimationTileset]);
    tilemap.createLayer("decorations", [
      baseTileset,
      decorativeTileset,
      treeBright3AnimationTileset,
      treeBright4AnimationTileset,
    ]);

    this.sys.animatedTiles.init(tilemap);
  }

  private createPlayer(x: number, y: number): void {
    this._hero = new Hero(this, x, y);

    this.cameras.main.startFollow(this._hero);
    this.cameras.main.setBounds(0, 0, this._sceneWidth, this.scale.height);
  }
}
