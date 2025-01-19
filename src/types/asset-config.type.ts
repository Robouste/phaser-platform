import { ImageFrameConfig } from "../phaser-aliases";
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

interface AssetConfig<Tag extends string> {
  tag: Tag;
  url: string;
}

export interface ImageConfig extends AssetConfig<ImageTag> {}

export interface TilesetConfig extends AssetConfig<TilesetTag> {}

export interface SpritesheetConfig extends AssetConfig<SpritesheetTag | EnnemyTag> {
  config: ImageFrameConfig;
}

export interface TileMapConfig extends AssetConfig<TilemapTag> {}

export interface SfxConfig extends AssetConfig<SfxTag> {}

export interface BgsConfig extends AssetConfig<BackgroundSound> {}

export interface PluginConfig extends AssetConfig<PluginTag> {
  systemKey: string;
  sceneKey: string;
}
