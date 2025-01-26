import { Scene } from "phaser";

export abstract class AnimationsManager<Tag extends string> {
  private _registeredAnimations: Partial<Record<Tag, boolean>> = {};

  constructor(protected scene: Scene) {}

  public register(sprite: Tag, attackSprite: Tag): void {
    if (this._registeredAnimations[sprite]) {
      return;
    }

    this._registeredAnimations[sprite] = true;

    this.createAnimations(sprite, attackSprite);
  }

  protected abstract createAnimations(sprite: Tag, attackSprite?: Tag): void;
}
