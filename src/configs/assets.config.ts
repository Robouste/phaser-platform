import {
  BackgroundSound,
  ImageTag,
  SfxTag,
  SpritesheetTag,
  TilemapTag,
  TilesetTag,
} from "../tags";
import {
  BgsConfig,
  ImageConfig,
  SfxConfig,
  SpritesheetConfig,
  TileMapConfig,
  TilesetConfig,
} from "../types";

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
        url: "tilemaps/tilesets/animations/water.png",
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
}
