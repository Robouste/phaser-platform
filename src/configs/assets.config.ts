import AnimatedTiles from "phaser-animated-tiles/dist/AnimatedTiles.js";
import {
  BackgroundSound,
  EnnemyTag,
  ImageTag,
  PluginTag,
  SfxTag,
  SpritesheetTag,
  TilemapTag,
  TilesetTag,
} from "../tags";
import {
  BgsConfig,
  ImageConfig,
  PluginConfig,
  SfxConfig,
  SpritesheetConfig,
  TileMapConfig,
  TilesetConfig,
} from "../types";

type FuckYou = any;

export class AssetsConfig {
  public static get images(): ImageConfig[] {
    return [
      {
        tag: ImageTag.FOREST_BACKGROUND_DAY_1,
        url: "sprites/backgrounds/forest-background-day-1.webp",
      },
      {
        tag: ImageTag.FOREST_BACKGROUND_DAY_2,
        url: "sprites/backgrounds/forest-background-day-2.webp",
      },
      {
        tag: ImageTag.FOREST_BACKGROUND_DAY_3,
        url: "sprites/backgrounds/forest-background-day-3.webp",
      },
      {
        tag: ImageTag.FOREST_BACKGROUND_DAY_4,
        url: "sprites/backgrounds/forest-background-day-4.webp",
      },
      {
        tag: ImageTag.PROJECTILE_ARROW,
        url: "sprites/projectiles/arrow.webp",
      },
      {
        tag: ImageTag.HEART,
        url: "sprites/ui/heart.webp",
      },
      {
        tag: ImageTag.HEART_BORDER,
        url: "sprites/ui/heart-border.webp",
      },
      {
        tag: ImageTag.HEART_BACKGROUND,
        url: "sprites/ui/heart-background.webp",
      },
    ];
  }

  public static get tilesets(): TilesetConfig[] {
    return [
      {
        tag: TilesetTag.FOREST_BASE,
        url: "tilemaps/tilesets/extruded/main-tiles.png",
      },
      {
        tag: TilesetTag.FOREST_DECORATIVE,
        url: "tilemaps/tilesets/extruded/decorative-tiles.png",
      },
      {
        tag: TilesetTag.FOREST_WATER_ANIMATION,
        url: "tilemaps/tilesets/animations/extruded/water.png",
      },
      {
        tag: TilesetTag.FOREST_TREE_BRIGHT_3_ANIMATION,
        url: "tilemaps/tilesets/animations/extruded/tree_bright3.png",
      },
      {
        tag: TilesetTag.FOREST_TREE_BRIGHT_4_ANIMATION,
        url: "tilemaps/tilesets/animations/extruded/tree_bright4.png",
      },
      {
        tag: TilesetTag.FOREST_GRASS_1_ANIMATION,
        url: "tilemaps/tilesets/animations/extruded/grass1.png",
      },
      {
        tag: TilesetTag.FOREST_GRASS_2_ANIMATION,
        url: "tilemaps/tilesets/animations/extruded/grass2.png",
      },
      {
        tag: TilesetTag.FOREST_GRASS_3_ANIMATION,
        url: "tilemaps/tilesets/animations/extruded/grass3.png",
      },
      {
        tag: TilesetTag.FOREST_PLANT_1_ANIMATION,
        url: "tilemaps/tilesets/animations/extruded/plant1.png",
      },
      {
        tag: TilesetTag.FOREST_PLANT_2_ANIMATION,
        url: "tilemaps/tilesets/animations/extruded/plant2.png",
      },
      {
        tag: TilesetTag.FOREST_PLANT_3_ANIMATION,
        url: "tilemaps/tilesets/animations/extruded/plant3.png",
      },
    ];
  }

  public static get spritesheets(): SpritesheetConfig[] {
    return [
      {
        tag: SpritesheetTag.HERO,
        url: "spritesheets/hero-spritesheet.webp",
        config: {
          frameWidth: 72,
          frameHeight: 70,
        },
      },
      {
        tag: EnnemyTag.PIXIE,
        url: "spritesheets/ennemies/pixie-spritesheet-32x46.webp",
        config: {
          frameWidth: 32,
          frameHeight: 46,
        },
      },
      {
        tag: SpritesheetTag.PIXIE_HITBOX,
        url: "spritesheets/ennemies/pixie-hitbox-spritesheet.webp",
        config: {
          frameWidth: 32,
          frameHeight: 32,
        },
      },
      {
        tag: SpritesheetTag.HEART,
        url: "spritesheets/heart-spritesheet-36.webp",
        config: {
          frameWidth: 36,
          frameHeight: 36,
        },
      },
      {
        tag: EnnemyTag.PIXIE_ATTACK,
        url: "spritesheets/ennemies/pixie-attack-96x46.webp",
        config: {
          frameWidth: 96,
          frameHeight: 46,
        },
      },
    ];
  }

  public static get tilemaps(): TileMapConfig[] {
    return [
      {
        tag: TilemapTag.FOREST,
        url: "tilemaps/forest-map.json",
      },
    ];
  }

  public static get sfx(): SfxConfig[] {
    return [
      {
        tag: SfxTag.JUMP,
        url: "audio/sfx/jump.ogg",
      },
      {
        tag: SfxTag.LAND,
        url: "audio/sfx/land.ogg",
      },
      {
        tag: SfxTag.ARROW_SHOOT,
        url: "audio/sfx/arrow-shoot.ogg",
      },
      {
        tag: SfxTag.ARROW_WALL_IMPACT,
        url: "audio/sfx/arrow-wall-impact.ogg",
      },
      {
        tag: SfxTag.PIXIE_HURT,
        url: "audio/sfx/pixie-hurt.ogg",
      },
      {
        tag: SfxTag.PIXIE_DEAD,
        url: "audio/sfx/pixie-dead.ogg",
      },
      {
        tag: SfxTag.PIXIE_ATTACK,
        url: "audio/sfx/pixie-attack.ogg",
      },
      {
        tag: SfxTag.HERO_HURT,
        url: "audio/sfx/hero-hurt.ogg",
      },
      {
        tag: SfxTag.HERO_DIE,
        url: "audio/sfx/hero-die.ogg",
      },
    ];
  }

  public static get bgs(): BgsConfig[] {
    return [
      {
        tag: BackgroundSound.RIVER_FLOWING_INSECTS,
        url: "audio/bgs/river-flowing-insects.ogg",
      },
    ];
  }

  public static get plugins(): PluginConfig[] {
    return [
      {
        tag: PluginTag.ANIMATED_TILES,
        url: AnimatedTiles as FuckYou,
        systemKey: "animatedTiles",
        sceneKey: "animatedTiles",
      },
    ];
  }
}
