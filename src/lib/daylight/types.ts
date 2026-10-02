import type { MuscleId } from "./muscles";

export type BackFlag = "friendly" | "neutral" | "caution";

/** primary = 1, secondary = 0.5, minor/stabiliser = 0.25. Editorial mapping, not EMG data. */
export type MuscleWeights = Partial<Record<MuscleId, number>>;

export type ExerciseKind =
  | "strength"
  | "activation"
  | "timed"
  | "cardio"
  | "mobility"
  | "distance";

export type Side = "na" | "left" | "right" | "both";

export type ExerciseDef = {
  id: string;
  name: string;
  kind: ExerciseKind;
  unilateral: boolean;
  usesAssistance?: boolean;
  /** Muscle weights used for the body map and weekly-volume maths. */
  muscles?: MuscleWeights;
  /** How much a logged set counts toward volume. Default: 1 strength, 0.5 activation, 0 mobility/cardio. */
  volumeFactor?: number;
  /** Low-back friendliness flag. General characteristic of the movement (support / spinal loading), not medical advice. */
  back?: BackFlag;
  backNote?: string;
  equipment?: string;
  /** True for catalog suggestions that are not part of the PDF plan. */
  extra?: boolean;
  /** Randy's own words from page 2 of the PDF, verbatim. */
  pdfNote?: string;
  /** Dose written on the page 2 board, verbatim. */
  page2Dose?: string;
  /** General education only. Never treated as a PDF cue or a clinical instruction. */
  eduCue?: string;
  eduSource?: string;
  eduReviewed?: string;
};

export type SlotSection = "activation" | "main" | "finisher" | "cardio" | "mobility" | "pt";

export type Alternative = {
  id: string;
  exerciseId: string;
};

export type Prescription = {
  id: string;
  exerciseId: string;
  alternatives: Alternative[];
  sets: number | null;
  /** Upper end of a range such as 2-3 sets. `sets` stays the lower end. */
  setsMax?: number;
  repLabel: string;
  perSide: boolean;
  optional: boolean;
  section: SlotSection;
  durationLabel?: string;
  /** Cue copied from the source PDF. Null when the written handoff did not include one. */
  sourceCue: string | null;
  why: string;
  whySource: string;
  openNote?: string;
};

export type DayTemplate = {
  weekday: number;
  name: string;
  scheduled: boolean;
  why: string;
  whySource: string;
  reminders: string[];
  slots: Prescription[];
  /** Day PSA, copied from the PDF. */
  psa?: string;
  /** Inline PSAs printed inside a section cell of the PDF. */
  sectionPsa?: Partial<Record<SlotSection, string>>;
  /** Text printed in a section instead of exercises, e.g. "No hard finisher". */
  sectionNote?: Partial<Record<SlotSection, string>>;
};

export type PlanVersion = {
  id: string;
  name: string;
  version: number;
  effectiveDate: string;
  reason: string;
  sourceLabel: string;
  days: DayTemplate[];
  createdAt: string;
};

export type SetStatus = "done" | "skipped" | "pending";

export type SetLog = {
  id: string;
  prescriptionId: string;
  setIndex: number;
  side: Side;
  status: Exclude<SetStatus, "pending">;
  reps: number | null;
  load: number | null;
  loadUnit: "lb" | "kg";
  assistance: number | null;
  assistanceUnit: "lb" | "kg";
  seconds: number | null;
  distance: string | null;
  at: string;
};

/** Something done instead of (or in addition to) a prescribed move: a swapped-in custom move, a different flow, cardio, abs... */
export type ExtraLog = {
  id: string;
  /** Prescription this replaced, if any. */
  slotId: string | null;
  kind: "swap" | "other";
  name: string;
  /** Catalog move this resembles, if picked. Its muscle weights are used when no muscles are chosen. */
  exerciseId?: string;
  sets: number | null;
  reps: string | null;
  load: number | null;
  minutes: number | null;
  note: string;
  /** Sub-part or group ids Randy says this hit (primary weight). Empty = infer from exerciseId or count nothing. */
  muscles: string[];
  at: string;
};

export type WorkoutSession = {
  id: string;
  planVersionId: string;
  weekday: number;
  localDate: string;
  name: string;
  why: string;
  chosen: boolean;
  startedAt: string;
  finishedAt: string | null;
  status: "active" | "finished";
  snapshot: Prescription[];
  chosenExercise: Record<string, string>;
  logs: SetLog[];
  /** Off-plan work done in this session. Counted in the heat map when muscles are known. */
  extras?: ExtraLog[];
  /** Slot index the runner is showing. Does not advance by itself at the end of an exercise. */
  focusSlot: number;
  note: string;
};

export type ActivityLog = {
  id: string;
  name: string;
  localDate: string;
  time: string;
  minutes: number | null;
  distance: string | null;
  effort: string | null;
  note: string;
};

export type ObservationTag = string;

export type ObservationContext = {
  date: string;
  time: string;
  /** Old 24-region body map id, kept so old notes still resolve. */
  regionId?: string;
  muscleId?: string;
  exerciseId?: string;
  mealId?: string;
  sessionId?: string;
  /** 0-6, Sunday = 0. */
  weekday?: number;
};

export type Observation = {
  id: string;
  text: string;
  createdAt: string;
  updatedAt: string;
  context: ObservationContext;
  tags: ObservationTag[];
  status: "open" | "kept" | "reviewed" | "trial";
  /** Flagged to be handed to whoever builds the next plan. */
  forNextPlan?: boolean;
  kind?: "gym" | "food" | "general";
};

export type TrialStatus = "active" | "ready" | "kept" | "revised" | "ended";

export type AdjustmentTrial = {
  id: string;
  observationId: string;
  change: string;
  helpful: string;
  reviewDate: string | null;
  status: TrialStatus;
  kind: "reminder" | "prep" | "plan";
  createdAt: string;
  historyNote: string;
  parentTrialId: string | null;
};

export type AppliedChange = {
  id: string;
  trialId: string;
  summary: string;
  beforeValue: string;
  afterValue: string;
  affectedId: string;
  effectiveDate: string;
  createdAt: string;
  revertedAt: string | null;
};

export type PtReference = {
  id: string;
  exerciseId: string;
  page: "Page 2 reference";
  parameters: string;
  discrepancy?: string;
  provider: string;
  userNote: string;
  /** Randy’s own words from the page 2 board. */
  pdfNote?: string;
};

export type InventoryStatus =
  | "fine"
  | "use_soon"
  | "use_first"
  | "low"
  | "out"
  | "check_amount";

export type InventoryItem = {
  id: string;
  name: string;
  quantity: string;
  category: string;
  cadence: string;
  storageLocation: string;
  status: InventoryStatus;
  notes: string;
  /** Optional date (YYYY-MM-DD) to use it by. Drives the use-soon list. */
  useBy?: string;
};

export type Recipe = {
  id: string;
  name: string;
  minutes: number | null;
  noCook: boolean;
  uses: string[];
  note: string;
  steps: string[];
};

export type SavedMeal = {
  id: string;
  name: string;
  recipeId: string | null;
  minutes: number | null;
  noCook: boolean;
  ingredientNames: string[];
  pinned: boolean;
  /** Your own protein number for one serving. Overrides the rough estimate. */
  proteinGrams?: number | null;
};

export type PreparedPortion = {
  id: string;
  name: string;
  detail: string;
  available: boolean;
  fromPrepId: string | null;
};

export type ShoppingItem = {
  id: string;
  name: string;
  quantity: string;
  checked: boolean;
  source: string;
};

export type PrepTask = {
  id: string;
  title: string;
  detail: string;
  status: "planned" | "done";
};

export type FoodLog = {
  id: string;
  localDate: string;
  time: string;
  food: string;
  mealId: string | null;
  proteinGrams: number | null;
  proteinIsEstimate: boolean;
  energyBefore: number | null;
  energyAfter: number | null;
  slot?: "breakfast" | "lunch" | "dinner" | "snack";
};

export type FluidLog = {
  id: string;
  localDate: string;
  time: string;
  beverage: string;
  amountOz: number;
  sizeId: string | null;
};

export type DrinkSize = {
  id: string;
  name: string;
  ounces: number;
};

export type Goal = {
  id: string;
  name: string;
  improvement: string;
  check: string;
};

export type MuscleRole = "primary" | "secondary";

export type AppView =
  | "today"
  | "training"
  | "food"
  | "body"
  | "notes"
  | "learn"
  | "review"
  | "history"
  | "goals"
  | "settings";

export type TrainingTab = "session" | "week" | "moves" | "pt" | "plan";

export type BodyMode = "plan" | "heat" | "grow";

export type BodyLayer = "planned" | "completed" | "felt";

export type Overlay =
  | { type: "note"; exerciseId?: string; muscleId?: string; weekday?: number; forNextPlan?: boolean; kind?: "gym" | "food" | "general"; mealId?: string }
  | { type: "log-food"; slot?: "breakfast" | "lunch" | "dinner" | "snack" }
  | { type: "log-drink" }
  | { type: "repeat-meal"; mealId: string }
  | { type: "finish"; weekday: number }
  | { type: "swap-move"; weekday: number; slotId: string }
  | { type: "did-else"; weekday: number; slotId: string | null }
  | { type: "form"; exerciseId: string; muscle?: string }
  | { type: "move"; exerciseId: string }
  | { type: "trial"; observationId: string }
  | { type: "apply"; trialId: string }
  | { type: "activity" }
  | { type: "purpose" }
  | { type: "goal" }
  | null;

export type UndoRecord =
  | { kind: "set"; sessionId: string; logs: SetLog[]; focusSlot: number; label: string }
  | { kind: "food"; id: string; label: string }
  | { kind: "fluid"; id: string; label: string }
  | null;

export const OBSERVATION_TAGS: ObservationTag[] = [
  "Felt good",
  "Felt difficult",
  "Food took too much effort",
  "Remember next time",
];

/** One-tap tags for the gym note sheet. */
export const GYM_TAGS: ObservationTag[] = [
  "Felt good",
  "Felt difficult",
  "Too heavy",
  "Too light",
  "Go up next time",
  "Pinch / discomfort",
  "Swap this",
  "Add volume",
  "Good cue",
  "Machine setup",
  "Remember next time",
];

export type WasteEntry = { id: string; name: string; date: string; outcome: "used" | "tossed" };

export type ThemeChoice = "auto" | "light" | "dark";

export const STARTER_PURPOSE =
  "Eat with less effort. Move with more ease. Learn what works for me.";
