import { depthsConfig } from "@configs";
import { Ennemy, EnnemyConfig, Hero } from "@game-objects";
import { GameHelper, isEnumValue } from "@helpers";
import { Sprite, Tilemap } from "@phaser-aliases";
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
} from "@tags";
import { Scene } from "phaser";
import { ForestAnimations } from "./forest.animations";

type ValueOf<T> = T[keyof T];

type NonEmptyArray<T> = [T, ...T[]];

type MustInclude<T, U extends T[]> = [T] extends [ValueOf<U>] ? U : never;

export const unionTypeToArray = <T>() => {
  return <U extends NonEmptyArray<T>>(...elements: MustInclude<T, U>) => elements;
};

type TilesetName =
  | "base-tiles"
  | "decorative-tiles"
  | "water-animation"
  | "tree_bright3"
  | "tree_bright4"
  | "grass1"
  | "grass2"
  | "grass3"
  | "plant1"
  | "plant2"
  | "plant3";

type LayerConfig = {
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
      depth: depthsConfig.background,
    },
    [TilemapLayerTag.MAP]: {
      depth: depthsConfig.background,
    },
    [TilemapLayerTag.DECORATIONS]: {
      depth: depthsConfig.background,
    },
    [TilemapLayerTag.FOREGROUND]: {
      depth: depthsConfig.foreground,
    },
  };

  private _tilesets: { name: TilesetName; tag: TilesetTag }[] = [
    { name: "base-tiles", tag: TilesetTag.FOREST_BASE },
    { name: "decorative-tiles", tag: TilesetTag.FOREST_DECORATIVE },
    { name: "water-animation", tag: TilesetTag.FOREST_WATER_ANIMATION },
    { name: "tree_bright3", tag: TilesetTag.FOREST_TREE_BRIGHT_3_ANIMATION },
    { name: "tree_bright4", tag: TilesetTag.FOREST_TREE_BRIGHT_4_ANIMATION },
    { name: "grass1", tag: TilesetTag.FOREST_GRASS_1_ANIMATION },
    { name: "grass2", tag: TilesetTag.FOREST_GRASS_2_ANIMATION },
    { name: "grass3", tag: TilesetTag.FOREST_GRASS_3_ANIMATION },
    { name: "plant1", tag: TilesetTag.FOREST_PLANT_1_ANIMATION },
    { name: "plant2", tag: TilesetTag.FOREST_PLANT_2_ANIMATION },
    { name: "plant3", tag: TilesetTag.FOREST_PLANT_3_ANIMATION },
  ];

  private _animationsManager: ForestAnimations;

  constructor(public hero: Hero, private _scene: Scene) {
    this._scene.sound.play(BackgroundSound.RIVER_FLOWING_INSECTS, {
      loop: true,
      volume: GameHelper.audioIsEnabled ? 1 : 0,
    });

    this._animationsManager = new ForestAnimations(_scene);

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

  public update(): void {
    this._ennemies.getChildren().forEach((ennemy) => {
      ennemy.update();
    });
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
    this._tilesets.forEach((tileset) => {
      this._map.addTilesetImage(tileset.name, tileset.tag, 32, 32, 1, 2);
    });

    Object.keys(this._layersConfig)
      .filter((key): key is TilemapLayerTag => key in this._layersConfig)
      .forEach((tag) => {
        const layer = this._map.createLayer(
          tag,
          this._tilesets.map((tileset) => tileset.name)
        );
        layer?.setDepth(this._layersConfig[tag].depth);
      });

    this._scene.sys.animatedTiles.init(this._map);
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
    const positions = this._map.objects.find(
      (objectLayer) => objectLayer.name === TilemapObjectsTag.POSITIONS
    )?.objects;

    if (!positions) {
      throw Error("Positions layer not found");
    }

    const patrols = positions.filter((position) => position.type === "ennemy_patrol");

    patrols.forEach((patrol, index) => {
      if (!patrol.x || !patrol.y || !patrol.polyline || patrol.polyline.length < 2) {
        throw Error("Invalid patrol object");
      }

      const { x, y, polyline } = patrol;
      const ennemyTag = patrol.name;

      if (!isEnumValue(EnnemyTag, ennemyTag)) {
        throw Error("Invalid ennemy tag");
      }

      const ennemyConfig: EnnemyConfig = {
        x,
        y,
        chaseDistance: 200,
        patrolDistance: polyline[1].x,
        speed: this.hero.speed - 80,
        patrolSpeed: 40,
        sprite: ennemyTag,
        attackSprite: EnnemyTag.PIXIE_ATTACK,
        scene: this._scene,
        hp: 30,
        range: 30,
        atkCooldown: 1000,
        damage: 1,
        id: index,
      };

      this._animationsManager.register(ennemyConfig.sprite, ennemyConfig.attackSprite);

      const ennemyObject = new Ennemy(ennemyConfig, this.hero);

      this._ennemies.add(ennemyObject);
    });
  }

  private setCollisions(): void {
    this._physics.add.collider(this.hero, this._colliderGroup);
    this._physics.add.collider(this._ennemies, this._colliderGroup);

    this._physics.add.collider(this.hero.projectiles, this._colliderGroup, (projectile) => {
      this._scene.time.addEvent({
        delay: 4000,
        callback: () => {
          projectile.destroy();
        },
      });
      this._scene.sound.play(SfxTag.ARROW_WALL_IMPACT);
    });

    this._physics.add.collider(this.hero.projectiles, this._ennemies, (projectile, ennemy) => {
      if (!(ennemy instanceof Ennemy)) {
        throw Error("ennemy is not a sprite");
      }

      ennemy.hurt(this.hero.damage);
      projectile.destroy();
    });
  }
}
