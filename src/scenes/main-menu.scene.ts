import { GameObjects, Scene } from "phaser";
import { SceneTag } from "../tags";

export class MainMenu extends Scene {
  background: GameObjects.Image;
  logo: GameObjects.Image;
  title: GameObjects.Text;

  constructor() {
    super(SceneTag.MAIN_MENU);
  }

  create() {
    this.background = this.add.image(512, 384, "background");

    this.logo = this.add.image(512, 300, "logo");

    this.title = this.add
      .text(512, 460, "Main Menu", {
        fontFamily: "Arial Black",
        fontSize: 38,
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 8,
        align: "center",
      })
      .setOrigin(0.5);

    this.input.once("pointerdown", () => {
      this.scene.start("Game");
    });
  }
}
