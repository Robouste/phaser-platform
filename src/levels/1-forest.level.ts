import { Scene } from "phaser";
import { Hero } from "../game-objects";
import { GameHelper } from "../helpers";
import { Sprite, Tilemap, Tileset } from "../phaser-aliases";
import {
  BackgroundSound,
  ImageTag,
  SfxTag,
  TilemapLayerTag,
  TilemapObjectsTag,
  TilemapObjectsType,
  TilemapTag,
  TilesetTag,
} from "../tags";

const tilesetNames = ["base-tiles", "decorative-tiles", "water-animation", "tree_bright3", "tree_bright4"];
type TilesetName = (typeof tilesetNames)[number];

export class ForestLevel {
  private get _physics(): Phaser.Physics.Arcade.ArcadePhysics {
    return this._scene.physics;
  }
  private get _mainCam(): Phaser.Cameras.Scene2D.Camera {
    return this._scene.cameras.main;
  }
  private _colliderGroup: Phaser.Physics.Arcade.StaticGroup;
  private _sceneWidth = 3200;
  private _map: Tilemap;
  private _layersConfig: Record<TilemapLayerTag, TilesetName[]> = {
    [TilemapLayerTag.BACKGROUND]: ["base-tiles"],
    [TilemapLayerTag.FOREGROUND]: ["base-tiles", "water-animation"],
    [TilemapLayerTag.DECORATIONS]: ["base-tiles", "decorative-tiles", "tree_bright3", "tree_bright4"],
  };
  private _tilesetsConfig: Record<TilesetName, TilesetTag> = {
    "base-tiles": TilesetTag.FOREST_BASE,
    "decorative-tiles": TilesetTag.FOREST_DECORATIVE,
    "water-animation": TilesetTag.FOREST_WATER_ANIMATION,
    tree_bright3: TilesetTag.FOREST_TREE_BRIGHT_3_ANIMATION,
    tree_bright4: TilesetTag.FOREST_TREE_BRIGHT_4_ANIMATION,
  };

  constructor(public hero: Hero, private _scene: Scene) {
    this._scene.sound.play(BackgroundSound.RIVER_FLOWING_INSECTS, {
      loop: true,
      volume: GameHelper.audioIsEnabled ? 1 : 0,
    });

    this._mainCam.setBounds(0, 0, this._sceneWidth, this._scene.scale.height);

    this.addBackgrounds();

    this._map = this._scene.make.tilemap({ key: TilemapTag.FOREST });

    this.generateMap();

    this._colliderGroup = this._physics.add.staticGroup();

    this.addColliders();
    this.addHero();
    this.setCollisions();
  }

  private addBackgrounds(): void {
    const backgrounds = [
      ImageTag.FOREST_BACKGROUND_DAY_1,
      ImageTag.FOREST_BACKGROUND_DAY_2,
      ImageTag.FOREST_BACKGROUND_DAY_3,
      ImageTag.FOREST_BACKGROUND_DAY_4,
    ];

    backgrounds.forEach((background) => {
      this._scene.add
        .tileSprite(0, 0, this._sceneWidth, this._scene.scale.height, background)
        .setOrigin(0)
        .setScale(1.1, 1.1);
    });
  }

  private generateMap(): void {
    // assign each tileset to its name.
    const tilesetsMap: Record<TilesetName, Tileset> = tilesetNames.reduce<Record<TilesetName, Tileset>>(
      (acc, tilesetName) => {
        const tileset = this._map.addTilesetImage(tilesetName, this._tilesetsConfig[tilesetName], 32, 32, 1, 2);

        if (!tileset) {
          throw Error("Tileset not found");
        }
        acc[tilesetName] = tileset;
        return acc;
      },
      {}
    );

    this._map.createLayer(TilemapLayerTag.BACKGROUND, this.getTilesetForLayer(TilemapLayerTag.BACKGROUND, tilesetsMap));
    this._map.createLayer(TilemapLayerTag.FOREGROUND, this.getTilesetForLayer(TilemapLayerTag.FOREGROUND, tilesetsMap));
    this._map.createLayer(
      TilemapLayerTag.DECORATIONS,
      this.getTilesetForLayer(TilemapLayerTag.DECORATIONS, tilesetsMap)
    );

    this._scene.sys.animatedTiles.init(this._map);
  }

  private getTilesetForLayer(layer: TilemapLayerTag, tilesetsMap: Record<TilesetName, Tileset>): Tileset[] {
    return this._layersConfig[layer].map((tilesetName) => tilesetsMap[tilesetName]);
  }

  private addColliders(): void {
    const colliders = this._map.createFromObjects(TilemapObjectsTag.COLLIDERS, {
      type: TilemapObjectsType.COLLIDER,
      classType: Sprite,
    });

    this._colliderGroup.addMultiple(colliders);

    colliders
      .filter((collider): collider is Sprite => collider instanceof Sprite)
      .forEach((collider) => {
        collider.alpha = 0;
      });
  }

  private addHero(): void {
    const heroPosition = this._map
      .createFromObjects(TilemapObjectsTag.POSITIONS, {
        name: "hero",
        classType: Sprite,
      })
      .at(0);

    if (!(heroPosition instanceof Sprite)) {
      throw Error("Hero position is not a sprite");
    }

    heroPosition.alpha = 0;

    this.hero.spawn(heroPosition.x, heroPosition.y);

    this._mainCam.startFollow(this.hero);
  }

  private setCollisions(): void {
    this._physics.add.collider(this.hero, this._colliderGroup);

    this._physics.add.collider(this.hero.projectiles, this._colliderGroup, (projectile) => {
      console.log("collided");
      this._scene.time.addEvent({
        delay: 4000,
        callback: () => {
          projectile.destroy();
        },
      });
      this._scene.sound.play(SfxTag.ARROW_WALL_IMPACT);
    });
  }
}
