import { SceneTag } from "@tags";
import { Scene } from "phaser";

export class Boot extends Scene {
  constructor() {
    super(SceneTag.BOOT);
  }

  public preload(): void {
    //  The Boot Scene is typically used to load in any assets you require for your Preloader, such as a game logo or background.
    //  The smaller the file size of the assets, the better, as the Boot Scene itself has no preloader.
  }

  public create(): void {
    this.scene.start(SceneTag.PRELOADER);
  }
}
