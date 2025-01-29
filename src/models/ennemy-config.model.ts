import { EnnemyTag } from "@tags";
import { CustomScene } from "./custom-scene.type";

export interface EnnemyConfig {
  scene: CustomScene;
  x: number;
  y: number;
  chaseDistance: number;
  speed: number;
  patrolSpeed: number;
  sprite: EnnemyTag;
  attackSprite: EnnemyTag;
  hp: number;
  range: number;
  atkCooldown: number;
  damage: number;
  id: number;
}
