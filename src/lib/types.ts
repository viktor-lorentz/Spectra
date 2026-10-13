/** How a value should be rendered on the reveal. */
export type ValueFormat = "number" | "integer" | "year";

/** One thing to be placed on the day's hidden gradient. */
export interface Item {
  /** Display name, e.g. "Cheddar cheese". */
  name: string;
  /** The true value on the axis. Used only for ordering + the reveal. */
  value: number;
  /** A small emoji shown on the card. Optional. */
  emoji?: string;
  /** A short, fun piece of context shown after the reveal. Optional. */
  note?: string;
}

/** A single day's puzzle content: one axis, exactly eight items. */
export interface PuzzleSet {
  /** Stable slug, e.g. "food-calories". Used to schedule + dedupe. */
  id: string;
  /** The axis name shown to the player, e.g. "Caloric density". */
  axis: string;
  /** A one-line prompt, e.g. "Order these foods from fewest to most calories." */
  prompt: string;
  /** Unit label appended to revealed values, e.g. "kcal / 100g". "" for none. */
  unit: string;
  /** Label for the low end of the scale, e.g. "Fewest". */
  lowLabel: string;
  /** Label for the high end of the scale, e.g. "Most". */
  highLabel: string;
  /** Broad category tag, used to space similar axes apart in the schedule. */
  category: string;
  /** How revealed values are formatted. Defaults to "number". */
  format?: ValueFormat;
  /** Decimal places for "number" format. Defaults to 0. */
  decimals?: number;
  /** Exactly eight items, in any (canonical) order. */
  items: Item[];
}

/** A day's puzzle, resolved and ready to play. */
export interface DailyPuzzle {
  /** 1-based puzzle number (day index + 1). */
  id: number;
  /** yyyy-mm-dd in UTC, for display. */
  dateISO: string;
  set: PuzzleSet;
}

/** Per-item outcome, listed in the player's submitted order. */
export interface ItemResult {
  item: Item;
  /** 0-based slot the player placed the item in (0 = low end). */
  guessPos: number;
  /** 0-based slot the item truly belongs in. */
  truePos: number;
  /** |guessPos - truePos|. 0 means a perfect placement. */
  delta: number;
}

/** The scored outcome of a full round. */
export interface RoundResult {
  /** 1-based puzzle number. */
  puzzleId: number;
  dateISO: string;
  setId: string;
  /** Kendall-tau score, 0..1000. */
  score: number;
  /** How many items landed in exactly the right slot. */
  exacts: number;
  /** Player's submitted order as indices into the (canonical) set.items. */
  order: number[];
  /** Per-item results, in the player's submitted order. */
  results: ItemResult[];
  isArchive: boolean;
  completedAt: number;
  /** Time spent solving, in ms. */
  durationMs?: number;
}

/** Persisted lifetime statistics (daily games only). */
export interface StatsState {
  gamesPlayed: number;
  /** Rounds scoring at or above par (see scoring.WIN_THRESHOLD). */
  wins: number;
  currentStreak: number;
  maxStreak: number;
  /** Puzzle index of the most recent daily game completed. */
  lastDailyIndex: number | null;
  /** Every daily score, oldest first. Powers the distribution + average. */
  scores: number[];
  /** Solve time (ms) for each daily game, for best/average time. */
  times: number[];
}

/** Today's aggregate ranking, from the backend or the offline estimate. */
export interface Ranking {
  /** Percentage of players you scored strictly better than, 0..100. */
  percentile: number;
  /** Histogram counts across the score range. */
  buckets: number[];
  /** Total number of players counted today. */
  total: number;
  /** Mean score today, 0..1000. */
  mean: number;
  /** True when this is the built-in offline estimate rather than live data. */
  estimated: boolean;
}
