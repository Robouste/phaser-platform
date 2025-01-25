import { Observable, Subject } from "rxjs";
import { Hero } from "../game-objects";
import { AnimationTag } from "../tags";
import { HeroStateParams } from "../types";
import { GameHelper } from "./game.helper";

export class HeroState {
  public readonly state$: Observable<HeroStateParams>;

  private _state$$ = new Subject<HeroStateParams>();

  constructor(private _hero: Hero) {
    this.state$ = this._state$$.asObservable();

    const subscription = this.state$
      // .pipe(distinctUntilChanged((prev, next) => prev.action === next.action))
      .subscribe((state) => this.handle(state));

    this._hero.on("destroy", () => subscription.unsubscribe());
  }

  public set(state: HeroStateParams): void {
    this._state$$.next(state);
  }

  private handle(state: HeroStateParams): void {
    const isGrounded = this._hero.body.touching.down;

    switch (state.action) {
      case "IDLE":
        GameHelper.animate(this._hero, AnimationTag.HERO_IDLE, {
          exceptIf: [AnimationTag.HERO_JUMP, AnimationTag.HERO_SHOOT, AnimationTag.HERO_HURT, AnimationTag.HERO_DIE],
        });

        this._hero.body.setVelocityX(0);
        break;
      case "MOVING-LEFT":
      case "MOVING-RIGHT":
        const direction = state.action === "MOVING-LEFT" ? -1 : 1;
        const extraXOffset = state.action === "MOVING-LEFT" ? 6 : 0;

        this._hero.body.setVelocityX(direction * this._hero.speed);
        this._hero.setFlipX(state.action === "MOVING-LEFT");
        this._hero.body.setOffset(this._hero.offset.x + extraXOffset, this._hero.offset.y);

        if (isGrounded) {
          GameHelper.animate(this._hero, AnimationTag.HERO_WALK, {
            exceptIf: [AnimationTag.HERO_SHOOT],
          });
        }
        break;
      case "JUMPING":
        this._hero.jump();
        break;
      case "SHOOTING":
        this._hero.shoot();
        break;
      case "HURT":
        // GameHelper.animate(this._hero, AnimationTag.HERO_HURT);

        // this._hero.body.setVelocityX(0);

        break;
      case "DYING":
        this._hero.play(AnimationTag.HERO_DIE);
    }
  }
}
