import { Sprite, SpriteWithDynamicBody, Tween } from "@phaser-aliases";
import { AnimationTag } from "@tags";
import { Scene } from "phaser";

export class GameHelper {
  public static get isDev(): boolean {
    return window.location.hostname === "localhost";
  }

  public static get audioIsEnabled(): boolean {
    return this.isDev ? false : true;
  }

  public static animate(
    sprite: Sprite,
    animation: AnimationTag,
    params?: {
      exceptIf?: AnimationTag | AnimationTag[];
      ignoreIfPlaying?: boolean;
    }
  ): void {
    const currentAnimation = sprite.anims.getName() as AnimationTag;
    const currentAnimationIsPlaying = sprite.anims.isPlaying;

    const exceptIf: AnimationTag[] = [];

    if (params?.exceptIf) {
      if (Array.isArray(params.exceptIf)) {
        exceptIf.push(...params.exceptIf);
      } else {
        exceptIf.push(params.exceptIf);
      }
    }

    if (exceptIf.includes(currentAnimation) && currentAnimationIsPlaying) {
      return;
    }

    const ignoreIfPlaying = params?.ignoreIfPlaying === false ? false : true;

    sprite.anims.play(animation, ignoreIfPlaying);
  }

  public static isCloseEnough(value1: number, value2: number, epsilon: number = 1): boolean {
    return Math.abs(value1 - value2) <= epsilon;
  }

  public static getAnimationRepetition(duration: number, frameCount: number, frameRate: number): number {
    return ((duration / 1000) * frameRate) / frameCount;
  }

  // TODO: make it works
  public static getEdgeToEdgeDistance(sprite1: Sprite, sprite2: Sprite): number {
    const distance = Phaser.Math.Distance.BetweenPoints(sprite1.getBounds(), sprite2.getBounds());

    return distance;
  }

  public static flashSprite(scene: Scene, sprite: Sprite): Tween {
    return scene.tweens.add({
      targets: sprite,
      alpha: { from: 1, to: 0 },
      ease: "Linear",
      duration: 100,
      repeat: -1,
      yoyo: true,
    });
  }

  public static isObstacleAhead(
    object: SpriteWithDynamicBody,
    scene: Scene,
    params?: {
      debug: boolean;
      debugColor?: number;
    }
  ): boolean {
    // body origin is top left. we check the center of the sprite
    const posY = object.body.y + object.body.height / 2;
    return GameHelper.isColliderAtY(object, scene, posY, params);
  }

  public static isLedgeAhead(
    object: SpriteWithDynamicBody,
    scene: Scene,
    params?: {
      debug: boolean;
      debugColor?: number;
    }
  ): boolean {
    // body origin is top left. we check the bottom of the sprite + arbitrary offset of 10px
    const posY = object.body.y + object.body.height + 10;
    return !GameHelper.isColliderAtY(object, scene, posY, params);
  }

  private static isColliderAtY(
    object: SpriteWithDynamicBody,
    scene: Scene,
    yPos: number,
    params?: {
      debug: boolean;
      debugColor?: number;
    }
  ): boolean {
    const direction = object.flipX ? "LEFT" : "RIGHT";
    const baseOffset = object.body.width / 2;
    // body origin is top left, so we add the width of the sprite if looking right.
    const offsetX = direction === "RIGHT" ? baseOffset + object.body.width : -baseOffset;
    const checkX = object.body.x + offsetX;
    const checkY = yPos;

    // Create a test groundCheckRect at the given position
    const groundCheckRect = new Phaser.Geom.Rectangle(checkX, checkY, 2, 2);
    const { x, y, width, height } = groundCheckRect;
    // Check if any physical object is overlapping with our test groundCheckRect
    const overlappingObjects = scene.physics.overlapRect(x, y, width, height, true, true);

    if (params?.debug) {
      const debugGraphics = scene.add.graphics();
      debugGraphics.clear();
      debugGraphics.setDepth(1000000);
      debugGraphics.lineStyle(2, params.debugColor ?? 0xff0000);
      debugGraphics.strokeRect(checkX, checkY, 2, 2);

      scene.time.addEvent({
        delay: 1000,
        callback: () => debugGraphics.destroy(),
        callbackScope: this,
        loop: false,
      });
    }

    // TODO: check for static objects only
    return overlappingObjects.filter((obj) => obj instanceof Phaser.Physics.Arcade.StaticBody).length > 0;
  }
}
