export type HeroAction =
  | "IDLE"
  | "MOVING-LEFT"
  | "MOVING-RIGHT"
  | "JUMPING"
  | "FALLING"
  | "SHOOTING"
  | "HURT"
  | "DYING";

type BaseStateParams<TAction extends HeroAction, TData = undefined> = {
  action: TAction;
} & (TData extends undefined ? {} : { data: TData });

export type IdleStateParams = BaseStateParams<"IDLE">;
export type MovingLeftStateParams = BaseStateParams<"MOVING-LEFT">;
export type MovingRightStateParams = BaseStateParams<"MOVING-RIGHT">;
export type JumpingStateParams = BaseStateParams<"JUMPING">;
export type FallingStateParams = BaseStateParams<"FALLING">;
export type ShootingStateParams = BaseStateParams<"SHOOTING">;
export type HurtStateParams = BaseStateParams<
  "HURT",
  {
    damage: number;
  }
>;
export type DyingStateParams = BaseStateParams<"DYING">;

export type HeroStateParams =
  | IdleStateParams
  | MovingLeftStateParams
  | MovingRightStateParams
  | JumpingStateParams
  | FallingStateParams
  | ShootingStateParams
  | HurtStateParams
  | DyingStateParams;
