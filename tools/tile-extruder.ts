import { readdirSync } from "fs";
import { extrudeTilesetToImage } from "tile-extruder";

async function main() {
  const basePath = "public/assets/tilemaps/tilesets";
  const tilesets = readdirSync(basePath).filter((file) => file.endsWith(".png"));

  for (const tileset of tilesets) {
    await extrudeTilesetToImage(32, 32, `${basePath}/${tileset}`, `${basePath}/extruded/${tileset}`);
  }

  console.log("Tilesets found: ", tilesets);

  // await extrudeTilesetToImage(32, 32, "", "");
}

main();
