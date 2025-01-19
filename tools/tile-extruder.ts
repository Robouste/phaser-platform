import { readdirSync } from "fs";
import { extrudeTilesetToImage } from "tile-extruder";

const basePath = "public/assets/tilemaps/tilesets";

async function main() {
  await extrude(`${basePath}`);
  await extrude(`${basePath}/animations`);
}

async function extrude(input: string) {
  const tilesets = readdirSync(input).filter((file) => file.endsWith(".png"));

  for (const tileset of tilesets) {
    await extrudeTilesetToImage(32, 32, `${input}/${tileset}`, `${input}/extruded/${tileset}`);
  }
}

main();
