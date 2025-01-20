import { Scene } from "phaser";
import { depthsConfig } from "../configs";
import { Ennemy, Hero } from "../game-objects";
import { GameHelper } from "../helpers";
import { Sprite, Tilemap, Tileset } from "../phaser-aliases";
import {
  BackgroundSound,
  EnnemyTag,
  ImageTag,
  SfxTag,
  TilemapLayerTag,
  TilemapObjectsTag,
  TilemapObjectsType,
  TilemapTag,
  TilesetTag,
} from "../tags";

type ValueOf<T> = T[keyof T];

type NonEmptyArray<T> = [T, ...T[]];

type MustInclude<T, U extends T[]> = [T] extends [ValueOf<U>] ? U : never;

export const unionTypeToArray = <T>() => {
  return <U extends NonEmptyArray<T>>(...elements: MustInclude<T, U>) => elements;
};

const tilesetNames = [
  "base-tiles",
  "decorative-tiles",
  "water-animation",
  "tree_bright3",
  "tree_bright4",
  "grass1",
  "grass2",
  "grass3",
  "plant1",
  "plant2",
  "plant3",
] as const;
type TilesetName = (typeof tilesetNames)[number];

type LayerConfig = {
  tilesets: TilesetName[];
  depth: number;
};

export class ForestLevel {
  private get _physics(): Phaser.Physics.Arcade.ArcadePhysics {
    return this._scene.physics;
  }
  private get _mainCam(): Phaser.Cameras.Scene2D.Camera {
    return this._scene.cameras.main;
  }
  private _colliderGroup: Phaser.Physics.Arcade.StaticGroup;
  private _ennemies: Phaser.Physics.Arcade.Group;
  private _sceneWidth = 3200;
  private _map: Tilemap;
  private _layersConfig: Record<TilemapLayerTag, LayerConfig> = {
    [TilemapLayerTag.BACKGROUND]: {
      tilesets: ["base-tiles"],
      depth: depthsConfig.background,
    },
    [TilemapLayerTag.MAP]: {
      tilesets: ["base-tiles", "water-animation"],
      depth: depthsConfig.background,
    },
    [TilemapLayerTag.DECORATIONS]: {
      tilesets: [
        "base-tiles",
        "decorative-tiles",
        "tree_bright3",
        "tree_bright4",
        "grass1",
        "grass2",
        "grass3",
        "plant1",
        "plant2",
        "plant3",
      ],
      depth: depthsConfig.background,
    },
    [TilemapLayerTag.FOREGROUND]: {
      tilesets: ["base-tiles", "decorative-tiles"],
      depth: depthsConfig.foreground,
    },
  };
  private _tilesetsConfig: Record<TilesetName, TilesetTag> = {
    "base-tiles": TilesetTag.FOREST_BASE,
    "decorative-tiles": TilesetTag.FOREST_DECORATIVE,
    "water-animation": TilesetTag.FOREST_WATER_ANIMATION,
    tree_bright3: TilesetTag.FOREST_TREE_BRIGHT_3_ANIMATION,
    tree_bright4: TilesetTag.FOREST_TREE_BRIGHT_4_ANIMATION,
    grass1: TilesetTag.FOREST_GRASS_1_ANIMATION,
    grass2: TilesetTag.FOREST_GRASS_2_ANIMATION,
    grass3: TilesetTag.FOREST_GRASS_3_ANIMATION,
    plant1: TilesetTag.FOREST_PLANT_1_ANIMATION,
    plant2: TilesetTag.FOREST_PLANT_2_ANIMATION,
    plant3: TilesetTag.FOREST_PLANT_3_ANIMATION,
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
    this._ennemies = this._physics.add.group();

    this.addColliders();
    this.addHero();
    this.addEnnemies();
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
    const tilesetsMap = tilesetNames.reduce((acc, tilesetName) => {
      const tileset = this._map.addTilesetImage(tilesetName, this._tilesetsConfig[tilesetName], 32, 32, 1, 2);

      if (!tileset) {
        throw Error("Tileset not found");
      }

      acc[tilesetName] = tileset;
      return acc;
    }, {} as Record<TilesetName, Tileset>);

    Object.keys(this._layersConfig)
      .filter((key): key is TilemapLayerTag => key in this._layersConfig)
      .forEach((tag) => {
        const layer = this._map.createLayer(tag, this.getTilesetNamesForLayer(tag, tilesetsMap));
        layer?.setDepth(this._layersConfig[tag].depth);
      });

    this._scene.sys.animatedTiles.init(this._map);
  }

  private getTilesetNamesForLayer(layer: TilemapLayerTag, tilesetsMap: Record<TilesetName, Tileset>): Tileset[] {
    return this._layersConfig[layer].tilesets.map((tilesetName) => tilesetsMap[tilesetName]);
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

  private addEnnemies(): void {
    const ennemies = this._map
      .createFromObjects(TilemapObjectsTag.POSITIONS, {
        type: "ennemy",
        classType: Sprite,
      })
      .filter((ennemy): ennemy is Sprite => ennemy instanceof Sprite);

    const positions = this._map.objects.find(
      (objectLayer) => objectLayer.name === TilemapObjectsTag.POSITIONS
    )?.objects;

    if (!positions) {
      throw Error("Positions layer not found");
    }

    const patrols = positions.filter((position) => position.type === "ennemy_patrol");

    patrols.forEach((patrol) => {
      if (!patrol.x || !patrol.y || !patrol.polyline || patrol.polyline.length < 2) {
        throw Error("Invalid patrol object");
      }
      console.log("patrol", patrol);

      const { x, y, polyline } = patrol;

      const ennemyObject = new Ennemy(this._scene, patrol.name as EnnemyTag);
      ennemyObject.spawn(x, y);

      const endingPoint = {
        x: polyline[1].x + x,
        y: polyline[1].y + y,
      };

      ennemyObject.patrol(endingPoint);

      this._ennemies.add(ennemyObject);
    });
  }

  private setCollisions(): void {
    this._physics.add.collider(this.hero, this._colliderGroup);
    this._physics.add.collider(this._ennemies, this._colliderGroup);

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
