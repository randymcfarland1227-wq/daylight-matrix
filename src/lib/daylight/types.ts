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
  /** General education only. Never treated as a PDF cue or a clinical instruction. */
  eduCue?: string;
  eduSource?: string;
  eduReviewed?: string;
};

export type SlotSection = "activation" | "main" | "cardio" | "mobility" | "pt";

export type Alternative = {
  id: string;
  exerciseId: string;
};

export type Prescription = {
  id: string;
  exerciseId: string;
  alternatives: Alternative[];
  sets: number | null;
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

export type ObservationTag =
  | "Felt good"
  | "Felt difficult"
  | "Food took too much effort"
  | "Remember next time";

export type ObservationContext = {
  date: string;
  time: string;
  regionId?: string;
  exerciseId?: string;
  mealId?: string;
  sessionId?: string;
};

export type Observation = {
  id: string;
  text: string;
  createdAt: string;
  updatedAt: string;
  context: ObservationContext;
  tags: ObservationTag[];
  status: "open" | "kept" | "reviewed" | "trial";
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

export type MuscleMapping = {
  exerciseId: string;
  regionId: string;
  role: MuscleRole;
  lateral: boolean;
  source: string;
  status: "reviewed" | "pending";
};

export type AppView =
  | "today"
  | "training"
  | "food"
  | "body"
  | "learn"
  | "review"
  | "history"
  | "goals";

export type TrainingTab = "week" | "runner" | "pt" | "library" | "editor" | "import";

export type BodyLayer = "planned" | "completed" | "felt";

export type Overlay =
  | { type: "log-food" }
  | { type: "log-drink" }
  | { type: "repeat-meal"; mealId: string }
  | { type: "choose-meal" }
  | { type: "how" }
  | { type: "why" }
  | { type: "session-note" }
  | { type: "exercise-list" }
  | { type: "change-exercise" }
  | { type: "choose-session" }
  | { type: "trial"; observationId: string }
  | { type: "apply"; trialId: string }
  | { type: "finish" }
  | { type: "activity" }
  | { type: "purpose" }
  | { type: "add-slot"; weekday: number }
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

export const STARTER_PURPOSE =
  "Eat with less effort. Move with more ease. Learn what works for me.";
