import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { localDate, localTime } from "./dates";
import { SEED_INVENTORY, SEED_MEALS, SEED_PREP, SEED_RECIPES, INGREDIENT_PREP_IDEAS, SEED_STARTER_INVENTORY, SEED_STARTER_MEALS } from "./food-seed";
import { SCHEMA_VERSION, STORAGE_KEY, BACKUP_KEY, BACKUP_KEY_V3, migratePersisted } from "./migrate";
import { ingredientKey, prepIngredients, upgradeFoodWorkspace } from "./kitchen";
import { exerciseById } from "./exercises";
import { lastSet, newId, prescribedDefaults } from "./logic";
import { activePlan, dayTemplate, seedPlan } from "./plan";
import type {
  JointLog,
  ExtraLog,
  ActivityLog,
  AdjustmentTrial,
  AppView,
  AppliedChange,
  BodyMode,
  ThemeChoice,
  WasteEntry,
  DrinkSize,
  FoodLog,
  Goal,
  InventoryItem,
  InventoryStatus,
  Observation,
  ObservationContext,
  ObservationTag,
  Overlay,
  PlanVersion,
  PreparedPortion,
  PrepTask,
  Prescription,
  SavedMeal,
  SetLog,
  ShoppingItem,
  Side,
  TrainingTab,
  UndoRecord,
  WorkoutSession,
} from "./types";
import { STARTER_PURPOSE } from "./types";
import { deleteImage } from "./noteImages";

type Drafts = {
  food: string;
  foodProtein: string;
  foodEstimate: boolean;
  drinkName: string;
  drinkOz: string;
  saveDrinkSize: boolean;
  reps: string;
  load: string;
  assist: string;
  distance: string;
  side: Side;
  seconds: string;
  purpose: string;
  goalName: string;
  goalImprovement: string;
  goalCheck: string;
  trialChange: string;
  trialHelpful: string;
  trialDate: string;
  trialKind: AdjustmentTrial["kind"];
  activityName: string;
  activityMinutes: string;
  activityDistance: string;
  activityEffort: string;
  activityNote: string;
  slotName: string;
  slotSets: string;
  slotReps: string;
  slotPerSide: boolean;
  planDate: string;
  planReason: string;
  applyPrepId: string;
  applyTitle: string;
};

const emptyDrafts = (): Drafts => ({
  food: "",
  foodProtein: "",
  foodEstimate: false,
  drinkName: "Water",
  drinkOz: "",
  saveDrinkSize: false,
  reps: "",
  load: "",
  assist: "",
  distance: "",
  side: "na",
  seconds: "",
  purpose: STARTER_PURPOSE,
  goalName: "",
  goalImprovement: "",
  goalCheck: "",
  trialChange: "",
  trialHelpful: "",
  trialDate: "",
  trialKind: "reminder",
  activityName: "",
  activityMinutes: "",
  activityDistance: "",
  activityEffort: "",
  activityNote: "",
  slotName: "",
  slotSets: "3",
  slotReps: "8–12",
  slotPerSide: false,
  planDate: localDate(),
  planReason: "",
  applyPrepId: "",
  applyTitle: "",
});

type Data = {
  purpose: string;
  purposeIsProposal: boolean;
  units: "lb" | "kg";
  drinkSizes: DrinkSize[];
  planVersions: PlanVersion[];
  planDraft: PlanVersion | null;
  sessions: WorkoutSession[];
  activeSessionId: string | null;
  activities: ActivityLog[];
  observations: Observation[];
  trials: AdjustmentTrial[];
  appliedChanges: AppliedChange[];
  goals: Goal[];
  ptNotes: Record<string, string>;
  inventory: InventoryItem[];
  recipes: typeof SEED_RECIPES;
  shopping: ShoppingItem[];
  shoppingArchive: ShoppingItem[];
  foodWorkspaceVersion: number;
  prep: typeof SEED_PREP;
  savedMeals: SavedMeal[];
  prepared: PreparedPortion[];
  foodLogs: FoodLog[];
  fluidLogs: { id: string; localDate: string; time: string; beverage: string; amountOz: number; sizeId: string | null }[];
  proteinGoal: number;
  view: AppView;
  trainingTab: TrainingTab;
  bodyView: "front" | "back";
  bodyMode: BodyMode;
  heatWindow: 7 | 14 | 30;
  selectedMuscleId: string | null;
  /** Body map detail: Standard = ~17 named muscles, Advanced = all sub-parts. */
  bodyDetail: "standard" | "advanced";
  /** Body map surface: the flat front + back chart, or the turnable 6'4" figure. */
  bodyStyle: "map" | "turn";
  bodyWorkspace: "journal" | "training" | "joints";
  jointLogs: JointLog[];
  schemaVersion: number;
  theme: ThemeChoice;
  /** Fluid ounces per day. Yours to set. */
  waterGoal: number;
  /** Optional separate protein number for recovery days. null = use proteinGoal. */
  proteinGoalRest: number | null;
  /** Weekly weighted sets you would like each area to reach. Yours to set. */
  weeklyTarget: number;
  /** Free text appended to the plan-builder digest (constraints, equipment, goals). */
  planContext: string;
  /** weekday "0".."6" -> saved meal ids planned for that day. */
  mealPlan: Record<string, string[]>;
  waste: WasteEntry[];
  /** Day the session screen is showing (0-6). Not persisted across launches. */
  trainDay: number;
  openSlotId: string | null;
  openExerciseId: string | null;
  /** Open the Train tab straight into gym mode for today. Persisted. */
  gymDefault: boolean;
  /** Full-screen gym mode for this weekday. Not persisted. */
  gymMode: { weekday: number } | null;
  /** Set after leaving gym mode so the Train tab shows the overview instead of re-opening it. Not persisted. */
  gymAutoSkip: boolean;
  rest: { endsAt: number; total: number } | null;
  restDefault: number;
  toast: { id: number; text: string } | null;
  foodSections: { inventory: boolean; recipes: boolean; shopping: boolean; prep: boolean };
  foodNoCook: boolean;
  showAllMeals: boolean;
  overlay: Overlay;
  drafts: Drafts;
  timerSlotId: string | null;
  timerStartedAt: string | null;
  timerAccumulated: number;
  undo: UndoRecord;
  saveStatus: string;
  openLessonId: string | null;
  editorWeekday: number;
  allowExtraTrial: boolean;
};

type NoteInput = {
  text: string;
  tags?: ObservationTag[];
  forNextPlan?: boolean;
  kind?: Observation["kind"];
  context?: Partial<ObservationContext>;
  imageIds?: string[];
};

type LogSetInput = {
  reps?: number | null;
  load?: number | null;
  assist?: number | null;
  seconds?: number | null;
  distance?: string | null;
  side?: Side;
};

export type BulkAdjust = { sets?: number; reps?: number | null; load?: number | null; assist?: number | null; seconds?: number | null; distance?: string | null };
export type ExtraInput = {
  slotId: string | null;
  kind: "swap" | "other";
  name: string;
  exerciseId?: string;
  sets?: number | null;
  reps?: string | null;
  load?: number | null;
  minutes?: number | null;
  note?: string;
  muscles?: string[];
};

type Actions = {
  setView: (view: AppView) => void;
  setTrainingTab: (tab: TrainingTab) => void;
  setOverlay: (overlay: Overlay) => void;
  patchDraft: (patch: Partial<Drafts>) => void;
  adoptPurpose: (text: string) => void;
  setUnits: (units: "lb" | "kg") => void;
  // sessions
  setTrainDay: (weekday: number) => void;
  setOpenSlot: (id: string | null, exerciseId?: string | null) => void;
  startSession: (weekday: number, chosen: boolean) => void;
  finishSession: (note: string, weekday?: number) => void;
  logSet: (weekday: number, slotId: string, input: LogSetInput) => string | null;
  skipSlot: (weekday: number, slotId: string) => void;
  removeLog: (logId: string) => void;
  undoLast: () => void;
  chooseVariant: (weekday: number, prescriptionId: string, exerciseId: string) => void;
  setGymMode: (weekday: number | null) => void;
  setGymDefault: (value: boolean) => void;
  bulkComplete: (weekday: number, slotIds: string[], adjust?: BulkAdjust) => number;
  addExtra: (weekday: number, input: ExtraInput) => string | null;
  removeExtra: (id: string) => void;
  startRest: (seconds?: number) => void;
  clearRest: () => void;
  setRestDefault: (seconds: number) => void;
  showToast: (text: string) => void;
  // notes
  addObservation: (text: string, context: ObservationContext, tags?: ObservationTag[]) => string | null;
  addNote: (input: NoteInput) => string | null;
  updateNote: (id: string, patch: Partial<Pick<Observation, "text" | "tags" | "forNextPlan" | "kind" | "imageIds">> & { context?: Partial<ObservationContext> }) => void;
  deleteNote: (id: string) => void;
  addJointLog: (input: Omit<JointLog, "id" | "time"> & { time?: string }) => void;
  deleteJointLog: (id: string) => void;
  importNotesJson: (raw: string) => string;
  exportNotesJson: () => string;
  updateObservation: (id: string, text: string, tags?: ObservationTag[]) => void;
  setObservationStatus: (id: string, status: Observation["status"]) => void;
  createTrial: (observationId: string) => string | null;
  resolveTrial: (id: string, action: "keep" | "revise" | "end" | "later", note: string) => void;
  applyPrepChange: () => string | null;
  linkPlanVersionToTrial: (trialId: string, beforeName: string, afterName: string, versionId: string) => void;
  revertChange: (id: string) => void;
  // food
  logFood: (input: { food: string; mealId: string | null; protein: number | null; estimate: boolean; preparedId?: string | null; slot?: FoodLog["slot"] }) => void;
  logDrink: () => void;
  addWater: (oz: number) => void;
  setProteinGoal: (goal: number) => void;
  setProteinGoalRest: (goal: number | null) => void;
  setWaterGoal: (oz: number) => void;
  setMealProtein: (mealId: string, grams: number | null) => void;
  planMeal: (weekday: number, mealId: string) => void;
  setMealPlanAll: (plan: Record<string, string[]>) => void;
  unplanMeal: (weekday: number, mealId: string) => void;
  addSavedMeal: (meal: { name: string; ingredientNames: string[]; proteinGrams: number | null; minutes: number | null; noCook: boolean }) => void;
  togglePin: (mealId: string) => void;
  updateInventory: (id: string, patch: Partial<InventoryItem>) => void;
  addInventory: (name: string, details?: Partial<InventoryItem>) => void;
  resolveUseSoon: (id: string, outcome: "used" | "tossed") => void;
  addShopping: (name: string, quantity: string, source: string) => void;
  removeShopping: (id: string) => void;
  toggleShopping: (id: string) => void;
  addShoppingToInventory: (id: string) => void;
  addMissingToShopping: (names: string[]) => number;
  setPrepStatus: (id: string, status: "planned" | "done") => void;
  addPrepTask: (title: string, detail: string, ingredients?: string[]) => void;
  updatePrep: (id: string, patch: Partial<PrepTask>) => void;
  archiveShopping: (ids: string[]) => void;
  restoreShopping: (id: string) => void;
  setPreparedAvailable: (id: string, available: boolean) => void;
  addPreparedFromPrep: (id: string) => void;
  logActivity: () => void;
  // plan editing
  ensureDraft: () => void;
  moveSlot: (weekday: number, index: number, direction: -1 | 1) => void;
  removeSlot: (weekday: number, index: number) => void;
  addSlot: (weekday: number) => void;
  addExerciseToDraft: (weekday: number, exerciseId: string, sets: number, reps: string) => void;
  savePlanVersion: (trialId?: string | null) => void;
  discardDraft: () => void;
  addGoal: () => void;
  setPtNote: (id: string, note: string) => void;
  // body / ui
  setBody: (patch: Partial<Pick<Data, "bodyView" | "bodyMode" | "heatWindow" | "selectedMuscleId" | "bodyDetail" | "bodyStyle" | "bodyWorkspace">>) => void;
  setTheme: (theme: ThemeChoice) => void;
  setWeeklyTarget: (n: number) => void;
  setPlanContext: (text: string) => void;
  toggleFoodSection: (key: keyof Data["foodSections"]) => void;
  setFoodNoCook: (value: boolean) => void;
  setShowAllMeals: (value: boolean) => void;
  setOpenLesson: (id: string | null) => void;
  setEditorWeekday: (weekday: number) => void;
  setAllowExtraTrial: (value: boolean) => void;
  exportJson: () => string;
  importJson: (raw: string) => string;
};

function numOrNull(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

function clonePlan(plan: PlanVersion): PlanVersion {
  return JSON.parse(JSON.stringify(plan)) as PlanVersion;
}

function sessionFromDay(plan: PlanVersion, weekday: number, chosen: boolean): WorkoutSession {
  const day = dayTemplate(plan, weekday);
  const today = localDate();
  return {
    id: newId(),
    planVersionId: plan.id,
    weekday,
    localDate: today,
    name: day.scheduled ? day.name : day.name,
    why: day.why,
    chosen,
    startedAt: new Date().toISOString(),
    finishedAt: null,
    status: "active",
    snapshot: JSON.parse(JSON.stringify(day.slots)) as Prescription[],
    chosenExercise: {},
    logs: [],
    focusSlot: 0,
    note: "",
  };
}

const seed = (): Data => ({
  purpose: STARTER_PURPOSE,
  purposeIsProposal: true,
  units: "lb",
  drinkSizes: [],
  planVersions: [seedPlan()],
  planDraft: null,
  sessions: [],
  activeSessionId: null,
  activities: [],
  observations: [],
  trials: [],
  appliedChanges: [],
  goals: [],
  ptNotes: {},
  inventory: [...SEED_INVENTORY, ...SEED_STARTER_INVENTORY],
  recipes: SEED_RECIPES,
  shopping: [],
  shoppingArchive: [],
  foodWorkspaceVersion: 1,
  prep: [...SEED_PREP, ...INGREDIENT_PREP_IDEAS],
  savedMeals: [...SEED_MEALS, ...SEED_STARTER_MEALS],
  prepared: [],
  foodLogs: [],
  fluidLogs: [],
  proteinGoal: 130,
  view: "today",
  trainingTab: "session",
  bodyView: "front",
  bodyMode: "plan",
  heatWindow: 14,
  selectedMuscleId: null,
  bodyDetail: "standard",
  bodyStyle: "map",
  bodyWorkspace: "journal",
  jointLogs: [],
  schemaVersion: SCHEMA_VERSION,
  theme: "light",
  waterGoal: 96,
  proteinGoalRest: null,
  weeklyTarget: 10,
  planContext:
    "Low-back sensitivity and pelvic tilt: PT activation comes first each day; prefer back-friendly options. Gym with cables, machines, dumbbells, barbell and a landmine.",
  mealPlan: {},
  waste: [],
  trainDay: new Date().getDay(),
  openSlotId: null,
  openExerciseId: null,
  gymMode: null,
  gymAutoSkip: false,
  gymDefault: true,
  rest: null,
  restDefault: 90,
  toast: null,
  foodSections: { inventory: false, recipes: false, shopping: false, prep: false },
  foodNoCook: false,
  showAllMeals: false,
  overlay: null,
  drafts: emptyDrafts(),
  timerSlotId: null,
  timerStartedAt: null,
  timerAccumulated: 0,
  undo: null,
  saveStatus: "Saved on this device",
  openLessonId: null,
  editorWeekday: new Date().getDay(),
  allowExtraTrial: false,
});

function saved<T extends Partial<Data>>(patch: T): T & { saveStatus: string } {
  return { ...patch, saveStatus: "Saved on this device" };
}

export const useDaylight = create<Data & Actions>()(
  persist(
    (set, get) => ({
      ...seed(),
      setView: (view) => set({ view, gymAutoSkip: view === "training" ? get().gymAutoSkip : false }),
      setTrainingTab: (trainingTab) => set({ trainingTab, view: "training", gymAutoSkip: true }),
      setOverlay: (overlay) => set({ overlay }),
      patchDraft: (patch) => set({ drafts: { ...get().drafts, ...patch } }),
      adoptPurpose: (text) => {
        const purpose = text.trim();
        if (!purpose) return;
        set(saved({ purpose, purposeIsProposal: false, overlay: null }));
      },
      setUnits: (units) => set(saved({ units })),
      setTrainDay: (trainDay) => set({ trainDay, openSlotId: null }),
      setOpenSlot: (openSlotId, openExerciseId = null) => set({ openSlotId, openExerciseId }),
      startSession: (weekday, chosen) => {
        const state = get();
        const today = localDate();
        const existing = state.sessions.find((s) => s.localDate === today && s.weekday === weekday);
        if (existing) {
          set(saved({ activeSessionId: existing.status === "active" ? existing.id : state.activeSessionId, view: "training", trainingTab: "session", trainDay: weekday, overlay: null }));
          return;
        }
        const plan = activePlan(state.planVersions, today);
        const session = sessionFromDay(plan, weekday, chosen);
        set(
          saved({
            sessions: [...state.sessions, session],
            activeSessionId: state.activeSessionId ?? session.id,
            view: "training",
            trainingTab: "session",
            trainDay: weekday,
            overlay: null,
          }),
        );
      },
      finishSession: (note, weekday) => {
        const state = get();
        const today = localDate();
        const byDay = weekday != null ? state.sessions.find((s) => s.localDate === today && s.weekday === weekday) : undefined;
        const id = byDay?.id ?? state.activeSessionId;
        if (!id) return;
        set(
          saved({
            sessions: state.sessions.map((session) =>
              session.id === id ? { ...session, status: "finished", finishedAt: new Date().toISOString(), note: note.trim() || session.note } : session,
            ),
            activeSessionId: state.activeSessionId === id ? null : state.activeSessionId,
            overlay: null,
            rest: null,
            gymMode: null,
            gymAutoSkip: true,
          }),
        );
      },
      logSet: (weekday, slotId, input) => {
        let state = get();
        const today = localDate();
        let session = state.sessions.find((s) => s.localDate === today && s.weekday === weekday);
        if (!session) {
          get().startSession(weekday, weekday !== new Date().getDay());
          state = get();
          session = state.sessions.find((s) => s.localDate === today && s.weekday === weekday);
        }
        if (!session) return null;
        const slot = session.snapshot.find((item) => item.id === slotId);
        if (!slot) return null;
        const side: Side = slot.perSide ? (input.side ?? "both") : "na";
        const done = session.logs.filter((l) => l.prescriptionId === slotId && l.status === "done");
        let setIndex = new Set(done.map((l) => l.setIndex)).size;
        if (slot.perSide && (side === "left" || side === "right")) {
          const taken = (idx: number) => done.some((l) => l.setIndex === idx && (l.side === side || l.side === "both"));
          let idx = 0;
          while (taken(idx)) idx += 1;
          setIndex = idx;
        }
        const log: SetLog = {
          id: newId(),
          prescriptionId: slotId,
          setIndex,
          side,
          status: "done",
          reps: input.reps ?? null,
          load: input.load ?? null,
          loadUnit: state.units,
          assistance: input.assist ?? null,
          assistanceUnit: state.units,
          seconds: input.seconds ?? null,
          distance: input.distance?.trim() || null,
          at: new Date().toISOString(),
        };
        const reopened = session.status === "finished";
        const sid = session.id;
        set(
          saved({
            sessions: state.sessions.map((item) =>
              item.id === sid ? { ...item, logs: [...item.logs, log], status: "active", finishedAt: reopened ? null : item.finishedAt } : item,
            ),
            activeSessionId: state.activeSessionId && state.activeSessionId !== sid && !reopened ? state.activeSessionId : sid,
            undo: { kind: "set", sessionId: sid, logs: session.logs, focusSlot: session.focusSlot, label: "Set logged" },
          }),
        );
        return log.id;
      },
      skipSlot: (weekday, slotId) => {
        const state = get();
        const today = localDate();
        let session = state.sessions.find((s) => s.localDate === today && s.weekday === weekday);
        if (!session) {
          get().startSession(weekday, weekday !== new Date().getDay());
          session = get().sessions.find((s) => s.localDate === today && s.weekday === weekday);
        }
        if (!session) return;
        const sid = session.id;
        const log: SetLog = {
          id: newId(),
          prescriptionId: slotId,
          setIndex: -1,
          side: "na",
          status: "skipped",
          reps: null,
          load: null,
          loadUnit: get().units,
          assistance: null,
          assistanceUnit: get().units,
          seconds: null,
          distance: null,
          at: new Date().toISOString(),
        };
        set(saved({ sessions: get().sessions.map((item) => (item.id === sid ? { ...item, logs: [...item.logs, log] } : item)) }));
      },
      removeLog: (logId) => {
        set(saved({ sessions: get().sessions.map((s) => (s.logs.some((l) => l.id === logId) ? { ...s, logs: s.logs.filter((l) => l.id !== logId) } : s)) }));
      },
      undoLast: () => {
        const state = get();
        const undo = state.undo;
        if (!undo) return;
        if (undo.kind === "set") {
          set(
            saved({
              undo: null,
              sessions: state.sessions.map((session) =>
                session.id === undo.sessionId ? { ...session, logs: undo.logs, focusSlot: undo.focusSlot } : session,
              ),
            }),
          );
        } else if (undo.kind === "food") {
          set(saved({ undo: null, foodLogs: state.foodLogs.filter((log) => log.id !== undo.id) }));
        } else if (undo.kind === "fluid") {
          set(saved({ undo: null, fluidLogs: state.fluidLogs.filter((log) => log.id !== undo.id) }));
        }
      },
      chooseVariant: (weekday, prescriptionId, exerciseId) => {
        const today = localDate();
        let session = get().sessions.find((s) => s.localDate === today && s.weekday === weekday);
        if (!session) {
          get().startSession(weekday, weekday !== new Date().getDay());
          session = get().sessions.find((s) => s.localDate === today && s.weekday === weekday);
        }
        if (!session) return;
        const sid = session.id;
        set(
          saved({
            sessions: get().sessions.map((item) =>
              item.id === sid ? { ...item, chosenExercise: { ...item.chosenExercise, [prescriptionId]: exerciseId } } : item,
            ),
          }),
        );
      },
      setGymDefault: (gymDefault) => set(saved({ gymDefault })),
      setGymMode: (weekday) => {
        if (weekday == null) {
          set({ gymMode: null, rest: null, gymAutoSkip: true });
          return;
        }
        set({ gymMode: { weekday }, gymAutoSkip: false, trainDay: weekday, view: "training", trainingTab: "session", overlay: null });
      },
      bulkComplete: (weekday, slotIds, adjust) => {
        const today = localDate();
        let session = get().sessions.find((x) => x.localDate === today && x.weekday === weekday);
        if (!session) {
          get().startSession(weekday, weekday !== new Date().getDay());
          session = get().sessions.find((x) => x.localDate === today && x.weekday === weekday);
        }
        if (!session) return 0;
        const sid = session.id;
        const units = get().units;
        const before = session.logs;
        const added: SetLog[] = [];
        for (const slotId of slotIds) {
          const slot = session.snapshot.find((item) => item.id === slotId);
          if (!slot) continue;
          const exerciseId = session.chosenExercise[slotId] ?? slot.exerciseId;
          const def = prescribedDefaults(slot, exerciseById(exerciseId)?.kind ?? "strength");
          const prev = lastSet(get().sessions, exerciseId, sid)?.set;
          const planned = adjust?.sets ?? slot.sets ?? 1;
          const have = new Set(session.logs.filter((l) => l.prescriptionId === slotId && l.status === "done").map((l) => l.setIndex));
          for (let i = 0; i < planned; i += 1) {
            if (have.has(i)) continue;
            const base = {
              prescriptionId: slotId,
              setIndex: i,
              status: "done" as const,
              reps: adjust && "reps" in adjust ? adjust.reps ?? null : def.reps,
              load: adjust && "load" in adjust ? adjust.load ?? null : prev?.load ?? null,
              loadUnit: units,
              assistance: adjust && "assist" in adjust ? adjust.assist ?? null : prev?.assistance ?? null,
              assistanceUnit: units,
              seconds: adjust && "seconds" in adjust ? adjust.seconds ?? null : def.seconds,
              distance: adjust && "distance" in adjust ? adjust.distance ?? null : def.distance,
              at: new Date().toISOString(),
            };
            if (slot.perSide) {
              added.push({ id: newId(), side: "left", ...base }, { id: newId(), side: "right", ...base });
            } else {
              added.push({ id: newId(), side: "na", ...base });
            }
          }
        }
        if (!added.length) return 0;
        const reopened = session.status === "finished";
        set(
          saved({
            sessions: get().sessions.map((item) => (item.id === sid ? { ...item, logs: [...item.logs, ...added], status: "active", finishedAt: reopened ? null : item.finishedAt } : item)),
            activeSessionId: get().activeSessionId && get().activeSessionId !== sid && !reopened ? get().activeSessionId : sid,
            undo: { kind: "set", sessionId: sid, logs: before, focusSlot: session.focusSlot, label: "Sets logged" },
          }),
        );
        return new Set(added.map((l) => `${l.prescriptionId}:${l.setIndex}`)).size;
      },
      addExtra: (weekday, input) => {
        const today = localDate();
        let session = get().sessions.find((x) => x.localDate === today && x.weekday === weekday);
        if (!session) {
          get().startSession(weekday, weekday !== new Date().getDay());
          session = get().sessions.find((x) => x.localDate === today && x.weekday === weekday);
        }
        if (!session) return null;
        const name = input.name.trim();
        if (!name && !input.exerciseId) return null;
        const extra: ExtraLog = {
          id: newId(),
          slotId: input.slotId,
          kind: input.kind,
          name: name || (input.exerciseId ? exerciseById(input.exerciseId)?.name ?? "Something else" : "Something else"),
          exerciseId: input.exerciseId,
          sets: input.sets ?? null,
          reps: input.reps?.trim() || null,
          load: input.load ?? null,
          minutes: input.minutes ?? null,
          note: (input.note ?? "").trim(),
          muscles: input.muscles ?? [],
          at: new Date().toISOString(),
        };
        const sid = session.id;
        const reopened = session.status === "finished";
        set(
          saved({
            sessions: get().sessions.map((item) =>
              item.id === sid ? { ...item, extras: [...(item.extras ?? []), extra], status: "active", finishedAt: reopened ? null : item.finishedAt } : item,
            ),
            activeSessionId: get().activeSessionId ?? sid,
            overlay: null,
          }),
        );
        return extra.id;
      },
      removeExtra: (id) => {
        set(saved({ sessions: get().sessions.map((s) => ((s.extras ?? []).some((e) => e.id === id) ? { ...s, extras: (s.extras ?? []).filter((e) => e.id !== id) } : s)) }));
      },
      startRest: (seconds) => {
        const total = seconds ?? get().restDefault;
        set({ rest: { endsAt: Date.now() + total * 1000, total } });
      },
      clearRest: () => set({ rest: null }),
      setRestDefault: (restDefault) => set(saved({ restDefault })),
      showToast: (text) => {
        const id = Date.now();
        set({ toast: { id, text } });
        setTimeout(() => {
          if (get().toast?.id === id) set({ toast: null });
        }, 2600);
      },
      addObservation: (text, context, tags = []) => {
        const trimmed = text.trim();
        if (!trimmed) return null;
        const now = new Date().toISOString();
        const observation: Observation = {
          id: newId(),
          text: trimmed,
          createdAt: now,
          updatedAt: now,
          context,
          tags,
          status: "open",
        };
        set(saved({ observations: [observation, ...get().observations] }));
        return observation.id;
      },
      addNote: (input) => {
        const text = input.text.trim();
        const tags = input.tags ?? [];
        const imageIds = input.imageIds ?? [];
        if (!text && tags.length === 0 && imageIds.length === 0) return null;
        const now = new Date();
        const ctx = input.context ?? {};
        const observation: Observation = {
          id: newId(),
          text: text || tags.join(", ") || "Photo",
          ...(imageIds.length ? { imageIds } : {}),
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
          context: { ...ctx, date: ctx.date ?? localDate(now), time: ctx.time ?? localTime(now), weekday: ctx.weekday ?? now.getDay() },
          tags,
          status: "open",
          forNextPlan: Boolean(input.forNextPlan),
          kind: input.kind ?? (ctx.mealId ? "food" : "gym"),
        };
        set(saved({ observations: [observation, ...get().observations] }));
        return observation.id;
      },
      updateNote: (id, patch) => {
        set(
          saved({
            observations: get().observations.map((o) =>
              o.id === id
                ? {
                    ...o,
                    ...("text" in patch && patch.text !== undefined ? { text: patch.text } : {}),
                    ...("tags" in patch && patch.tags !== undefined ? { tags: patch.tags } : {}),
                    ...("forNextPlan" in patch ? { forNextPlan: patch.forNextPlan } : {}),
                    ...("kind" in patch && patch.kind ? { kind: patch.kind } : {}),
                    ...("imageIds" in patch ? { imageIds: patch.imageIds } : {}),
                    context: { ...o.context, ...(patch.context ?? {}) },
                    updatedAt: new Date().toISOString(),
                  }
                : o,
            ),
          }),
        );
      },
      deleteNote: (id) => {
        const gone = get().observations.find((o) => o.id === id);
        set(saved({ observations: get().observations.filter((o) => o.id !== id) }));
        for (const img of gone?.imageIds ?? []) void deleteImage(img).catch(() => undefined);
      },
      addJointLog: (input) => {
        const now = new Date();
        const log: JointLog = { id: newId(), time: input.time ?? localTime(now), ...input, level: Math.max(0, Math.min(10, Math.round(input.level))) };
        set(saved({ jointLogs: [log, ...(get().jointLogs ?? [])] }));
      },
      deleteJointLog: (id) => set(saved({ jointLogs: (get().jointLogs ?? []).filter((l) => l.id !== id) })),
      exportNotesJson: () => JSON.stringify({ daylightNotes: 1, exportedAt: new Date().toISOString(), observations: get().observations }, null, 2),
      importNotesJson: (raw) => {
        try {
          const parsed = JSON.parse(raw) as { daylightNotes?: number; observations?: Observation[]; data?: { observations?: Observation[] } };
          const incoming = parsed.observations ?? parsed.data?.observations;
          if (!Array.isArray(incoming)) return "That file has no notes in it.";
          const have = new Set(get().observations.map((o) => o.id));
          const fresh = incoming.filter((o) => o && typeof o.id === "string" && typeof o.text === "string" && !have.has(o.id));
          const normalised = migratePersisted({ observations: fresh, planVersions: [{ id: "x", version: 1, days: [] }] }).observations as Observation[];
          set(saved({ observations: [...get().observations, ...normalised].sort((a, b) => b.createdAt.localeCompare(a.createdAt)) }));
          return `Added ${fresh.length} note${fresh.length === 1 ? "" : "s"}. ${incoming.length - fresh.length} were already here.`;
        } catch {
          return "Couldn’t read that file. Your notes are untouched.";
        }
      },
      updateObservation: (id, text, tags) => {
        const trimmed = text.trim();
        set(
          saved({
            observations: get().observations.flatMap((item) => {
              if (item.id !== id) return [item];
              if (!trimmed) return [];
              return [{ ...item, text: trimmed, tags: tags ?? item.tags, updatedAt: new Date().toISOString() }];
            }),
          }),
        );
      },
      setObservationStatus: (id, status) => {
        set(
          saved({
            observations: get().observations.map((item) => (item.id === id ? { ...item, status } : item)),
          }),
        );
      },
      createTrial: (observationId) => {
        const state = get();
        const change = state.drafts.trialChange.trim();
        const helpful = state.drafts.trialHelpful.trim();
        if (!change || !helpful) return null;
        const active = state.trials.filter((trial) => trial.status === "active");
        if (active.length >= 1 && !state.allowExtraTrial) return null;
        const trial: AdjustmentTrial = {
          id: newId(),
          observationId,
          change,
          helpful,
          reviewDate: state.drafts.trialDate || null,
          status: "active",
          kind: state.drafts.trialKind,
          createdAt: new Date().toISOString(),
          historyNote: "",
          parentTrialId: null,
        };
        set(
          saved({
            trials: [trial, ...state.trials],
            observations: state.observations.map((item) => (item.id === observationId ? { ...item, status: "trial" } : item)),
            overlay: null,
            allowExtraTrial: false,
            drafts: { ...state.drafts, trialChange: "", trialHelpful: "", trialDate: "", trialKind: "reminder" },
          }),
        );
        return trial.id;
      },
      resolveTrial: (id, action, note) => {
        const state = get();
        const trial = state.trials.find((item) => item.id === id);
        if (!trial) return;
        if (action === "later") {
          set(
            saved({
              trials: state.trials.map((item) =>
                item.id === id ? { ...item, status: "active", reviewDate: null, historyNote: note.trim() || item.historyNote } : item,
              ),
            }),
          );
          return;
        }
        if (action === "revise") {
          const revision: AdjustmentTrial = {
            ...trial,
            id: newId(),
            status: "active",
            parentTrialId: trial.id,
            createdAt: new Date().toISOString(),
            historyNote: note.trim(),
            reviewDate: null,
          };
          set(
            saved({
              trials: [{ ...trial, status: "revised", historyNote: note.trim() || trial.historyNote }, revision, ...state.trials.filter((item) => item.id !== id)],
              overlay: { type: "trial", observationId: trial.observationId } as Overlay,
              drafts: { ...state.drafts, trialChange: trial.change, trialHelpful: trial.helpful, trialKind: trial.kind, trialDate: "" },
            }),
          );
          return;
        }
        const status = action === "keep" ? "kept" : "ended";
        set(
          saved({
            trials: state.trials.map((item) => (item.id === id ? { ...item, status, historyNote: note.trim() || item.historyNote } : item)),
          }),
        );
      },
      applyPrepChange: () => {
        const state = get();
        const overlay = state.overlay;
        if (!overlay || overlay.type !== "apply") return null;
        const trial = state.trials.find((item) => item.id === overlay.trialId);
        const task = state.prep.find((item) => item.id === state.drafts.applyPrepId);
        const after = state.drafts.applyTitle.trim();
        if (!trial || !task || !after || after === task.title) return null;
        const change: AppliedChange = {
          id: newId(),
          trialId: trial.id,
          summary: "Meal prep task",
          beforeValue: task.title,
          afterValue: after,
          affectedId: task.id,
          effectiveDate: localDate(),
          createdAt: new Date().toISOString(),
          revertedAt: null,
        };
        set(
          saved({
            prep: state.prep.map((item) => (item.id === task.id ? { ...item, title: after } : item)),
            appliedChanges: [change, ...state.appliedChanges],
            overlay: null,
          }),
        );
        return change.id;
      },
      linkPlanVersionToTrial: (trialId, beforeName, afterName, versionId) => {
        const change: AppliedChange = {
          id: newId(),
          trialId,
          summary: "Plan version",
          beforeValue: beforeName,
          afterValue: afterName,
          affectedId: versionId,
          effectiveDate: localDate(),
          createdAt: new Date().toISOString(),
          revertedAt: null,
        };
        set(saved({ appliedChanges: [change, ...get().appliedChanges] }));
      },
      revertChange: (id) => {
        const state = get();
        const change = state.appliedChanges.find((item) => item.id === id);
        if (!change || change.revertedAt) return;
        if (change.summary === "Meal prep task") {
          set(
            saved({
              prep: state.prep.map((item) => (item.id === change.affectedId ? { ...item, title: change.beforeValue } : item)),
              appliedChanges: state.appliedChanges.map((item) =>
                item.id === id ? { ...item, revertedAt: new Date().toISOString() } : item,
              ),
            }),
          );
        }
      },
      logFood: ({ food, mealId, protein, estimate, preparedId, slot }) => {
        const trimmed = food.trim();
        if (!trimmed) return;
        const entry: FoodLog = {
          id: newId(),
          localDate: localDate(),
          time: localTime(),
          food: trimmed,
          mealId,
          proteinGrams: protein,
          proteinIsEstimate: estimate && protein != null,
          energyBefore: null,
          energyAfter: null,
          slot,
        };
        const state = get();
        set(
          saved({
            foodLogs: [...state.foodLogs, entry],
            prepared: preparedId ? state.prepared.map((item) => (item.id === preparedId ? { ...item, available: false } : item)) : state.prepared,
            undo: { kind: "food", id: entry.id, label: "Meal logged" },
            overlay: null,
            drafts: { ...state.drafts, food: "", foodProtein: "", foodEstimate: false },
          }),
        );
      },
      logDrink: () => {
        const state = get();
        const ounces = numOrNull(state.drafts.drinkOz);
        const beverage = state.drafts.drinkName.trim();
        if (!beverage || ounces == null || ounces <= 0) return;
        let sizeId: string | null = null;
        let drinkSizes = state.drinkSizes;
        if (state.drafts.saveDrinkSize) {
          const existing = drinkSizes.find((size) => size.name.toLowerCase() === beverage.toLowerCase() && size.ounces === ounces);
          if (existing) sizeId = existing.id;
          else {
            const created = { id: newId(), name: beverage, ounces };
            drinkSizes = [...drinkSizes, created];
            sizeId = created.id;
          }
        }
        const entry = { id: newId(), localDate: localDate(), time: localTime(), beverage, amountOz: ounces, sizeId };
        set(
          saved({
            drinkSizes,
            fluidLogs: [...state.fluidLogs, entry],
            undo: { kind: "fluid", id: entry.id, label: "Drink logged" },
            overlay: null,
            drafts: { ...state.drafts, drinkOz: "", saveDrinkSize: false },
          }),
        );
      },
      addWater: (oz) => {
        if (!(oz > 0)) return;
        const entry = { id: newId(), localDate: localDate(), time: localTime(), beverage: "Water", amountOz: oz, sizeId: null };
        set(saved({ fluidLogs: [...get().fluidLogs, entry], undo: { kind: "fluid", id: entry.id, label: `${oz} oz water logged` } }));
      },
      setProteinGoal: (proteinGoal) => set(saved({ proteinGoal })),
      setProteinGoalRest: (proteinGoalRest) => set(saved({ proteinGoalRest })),
      setWaterGoal: (waterGoal) => set(saved({ waterGoal })),
      setMealProtein: (mealId, grams) =>
        set(saved({ savedMeals: get().savedMeals.map((m) => (m.id === mealId ? { ...m, proteinGrams: grams } : m)) })),
      planMeal: (weekday, mealId) => {
        const key = String(weekday);
        const cur = get().mealPlan[key] ?? [];
        if (cur.includes(mealId)) return;
        set(saved({ mealPlan: { ...get().mealPlan, [key]: [...cur, mealId] } }));
      },
      setMealPlanAll: (mealPlan) => set(saved({ mealPlan })),
      unplanMeal: (weekday, mealId) => {
        const key = String(weekday);
        set(saved({ mealPlan: { ...get().mealPlan, [key]: (get().mealPlan[key] ?? []).filter((id) => id !== mealId) } }));
      },
      addSavedMeal: (meal) => {
        const name = meal.name.trim();
        if (!name) return;
        set(
          saved({
            savedMeals: [
              ...get().savedMeals,
              { id: newId(), name, recipeId: null, minutes: meal.minutes, noCook: meal.noCook, ingredientNames: meal.ingredientNames, pinned: false, proteinGrams: meal.proteinGrams },
            ],
          }),
        );
      },
      resolveUseSoon: (id, outcome) => {
        const state = get();
        const item = state.inventory.find((i) => i.id === id);
        if (!item) return;
        set(
          saved({
            waste: [...state.waste, { id: newId(), name: item.name, date: localDate(), outcome }],
            inventory: state.inventory.map((i) => (i.id === id ? { ...i, status: outcome === "used" ? "fine" : "out", useBy: undefined } : i)),
            shopping: outcome === "tossed" ? state.shopping : state.shopping,
          }),
        );
      },
      removeShopping: (id) => set(saved({ shopping: get().shopping.filter((i) => i.id !== id) })),
      updatePrep: (id, patch) => set(saved({ prep: get().prep.map((t) => t.id === id ? { ...t, ...patch, id: t.id } : t) })),
      setPreparedAvailable: (id, available) => set(saved({ prepared: get().prepared.map((p) => p.id === id ? { ...p, available } : p) })),
      archiveShopping: (ids) => set(saved({ shopping: get().shopping.filter((i) => !ids.includes(i.id)), shoppingArchive: [...get().shoppingArchive, ...get().shopping.filter((i) => ids.includes(i.id))] })),
      restoreShopping: (id) => {
        const item = get().shoppingArchive.find((i) => i.id === id);
        if (!item) return;
        get().addShopping(item.name, item.quantity, item.source);
      },
      addPrepTask: (title, detail, ingredients = []) => {
        const t = title.trim();
        if (!t) return;
        set(saved({ prep: [...get().prep, { id: newId(), title: t, detail, status: "planned", ingredientNames: ingredients, selected: true }] }));
      },
      addExerciseToDraft: (weekday, exerciseId, sets, reps) => {
        get().ensureDraft();
        const draft = get().planDraft;
        if (!draft) return;
        const next = clonePlan(draft);
        const day = next.days.find((item) => item.weekday === weekday);
        if (!day) return;
        day.scheduled = true;
        day.slots.push({
          id: newId(),
          exerciseId,
          alternatives: [],
          sets,
          repLabel: reps,
          perSide: false,
          optional: false,
          section: "main",
          sourceCue: null,
          why: "Added by you from the library.",
          whySource: "Your plan edit.",
        });
        set(saved({ planDraft: next }));
      },
      togglePin: (mealId) => {
        const meals = get().savedMeals.map((meal) => (meal.id === mealId ? { ...meal, pinned: !meal.pinned } : meal));
        const pinned = meals.filter((meal) => meal.pinned);
        if (pinned.length > 3) return;
        set(saved({ savedMeals: meals }));
      },
      updateInventory: (id, patch) => {
        set(saved({ inventory: get().inventory.map((item) => (item.id === id ? { ...item, ...patch } : item)) }));
      },
      addInventory: (name, details = {}) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        const row: InventoryItem = {
          ...details,
          id: newId(),
          name: trimmed,
          quantity: details.quantity ?? "",
          category: details.category ?? "Snacks & other",
          cadence: details.cadence ?? "weekly",
          storageLocation: details.storageLocation ?? "Pantry",
          status: details.status ?? (details.quantity?.trim() ? "fine" : "check_amount"),
          notes: details.notes ?? "",
        };
        set(saved({ inventory: [row, ...get().inventory] }));
      },
      addShopping: (name, quantity, source) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        const exists = get().shopping.some((item) => ingredientKey(item.name) === ingredientKey(trimmed) && !item.checked);
        if (exists) return;
        set(
          saved({
            shopping: [...get().shopping, { id: newId(), name: trimmed, quantity, checked: false, source }],
          }),
        );
      },
      toggleShopping: (id) => {
        set(saved({ shopping: get().shopping.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)) }));
      },
      addShoppingToInventory: (id) => {
        const item = get().shopping.find((row) => row.id === id);
        if (!item) return;
        const match = get().inventory.find((row) => ingredientKey(row.name) === ingredientKey(item.name));
        if (match) {
          get().updateInventory(match.id, {
            quantity: item.quantity || match.quantity,
            status: item.quantity ? "fine" : "check_amount",
          });
          return;
        }
        const row: InventoryItem = {
          id: newId(),
          name: item.name,
          quantity: item.quantity,
          category: "Pantry",
          cadence: "weekly",
          storageLocation: "Cabinet",
          status: item.quantity ? "fine" : "check_amount",
          notes: item.source,
        };
        set(saved({ inventory: [row, ...get().inventory] }));
      },
      addMissingToShopping: (names) => {
        let added = 0;
        for (const name of names) {
          const before = get().shopping.length;
          get().addShopping(name, "", "Missing from a recipe");
          if (get().shopping.length > before) added += 1;
        }
        return added;
      },
      setPrepStatus: (id, status) => {
        set(saved({ prep: get().prep.map((item) => (item.id === id ? { ...item, status } : item)) }));
      },
      addPreparedFromPrep: (id) => {
        const task = get().prep.find((item) => item.id === id);
        if (!task || task.status === "done") return;
        const portion: PreparedPortion = {
          id: newId(),
          name: task.title,
          detail: task.detail,
          available: true,
          fromPrepId: task.id,
          ingredientNames: prepIngredients(task),
          quantity: task.quantity ?? "",
          preparedAt: localDate(),
          storageLocation: task.storageLocation ?? "Fridge",
        };
        set(saved({ prepared: [portion, ...get().prepared], prep: get().prep.map((item) => (item.id === id ? { ...item, status: "done" } : item)) }));
      },
      logActivity: () => {
        const state = get();
        const name = state.drafts.activityName.trim();
        if (!name) return;
        const activity: ActivityLog = {
          id: newId(),
          name,
          localDate: localDate(),
          time: localTime(),
          minutes: numOrNull(state.drafts.activityMinutes),
          distance: state.drafts.activityDistance.trim() || null,
          effort: state.drafts.activityEffort.trim() || null,
          note: state.drafts.activityNote.trim(),
        };
        set(
          saved({
            activities: [activity, ...state.activities],
            overlay: null,
            drafts: { ...state.drafts, activityName: "", activityMinutes: "", activityDistance: "", activityEffort: "", activityNote: "" },
          }),
        );
      },
      ensureDraft: () => {
        if (get().planDraft) return;
        const latest = get().planVersions.reduce((best, plan) => (plan.version > best.version ? plan : best));
        const draft = clonePlan(latest);
        draft.id = "draft";
        set({ planDraft: draft });
      },
      moveSlot: (weekday, index, direction) => {
        get().ensureDraft();
        const draft = get().planDraft;
        if (!draft) return;
        const next = clonePlan(draft);
        const day = next.days.find((item) => item.weekday === weekday);
        if (!day) return;
        const target = index + direction;
        if (target < 0 || target >= day.slots.length) return;
        const [row] = day.slots.splice(index, 1);
        if (!row) return;
        day.slots.splice(target, 0, row);
        set(saved({ planDraft: next }));
      },
      removeSlot: (weekday, index) => {
        get().ensureDraft();
        const draft = get().planDraft;
        if (!draft) return;
        const next = clonePlan(draft);
        const day = next.days.find((item) => item.weekday === weekday);
        if (!day) return;
        day.slots.splice(index, 1);
        set(saved({ planDraft: next }));
      },
      addSlot: (weekday) => {
        const state = get();
        const name = state.drafts.slotName.trim();
        if (!name) return;
        get().ensureDraft();
        const draft = get().planDraft;
        if (!draft) return;
        const exerciseId = `custom-${newId()}`;
        const next = clonePlan(draft);
        const day = next.days.find((item) => item.weekday === weekday);
        if (!day) return;
        if (!day.scheduled) {
          day.scheduled = true;
        }
        const sets = numOrNull(state.drafts.slotSets);
        day.slots.push({
          id: newId(),
          exerciseId,
          alternatives: [],
          sets,
          repLabel: state.drafts.slotReps.trim(),
          perSide: state.drafts.slotPerSide,
          optional: false,
          section: "main",
          sourceCue: null,
          why: "Added by you. Not part of the original imported page.",
          whySource: "Your plan edit.",
          openNote: undefined,
        });
        set(
          saved({
            planDraft: next,
            overlay: null,
            drafts: { ...state.drafts, slotName: "" },
          }),
        );
        const customNames = get().planDraft ? undefined : undefined;
        void customNames;
        const names = loadCustomNames();
        names[exerciseId] = name;
        saveCustomNames(names);
      },
      savePlanVersion: (trialId) => {
        const state = get();
        state.ensureDraft();
        const draft = get().planDraft;
        if (!draft) return;
        const date = state.drafts.planDate || localDate();
        const version = Math.max(...state.planVersions.map((plan) => plan.version)) + 1;
        const before = activePlan(state.planVersions, date);
        const savedPlan: PlanVersion = {
          ...clonePlan(draft),
          id: newId(),
          version,
          effectiveDate: date,
          reason: state.drafts.planReason.trim() || "Saved from the plan editor.",
          name: `${before.name.replace(/ — version \d+$/, "")} — version ${version}`,
          createdAt: new Date().toISOString(),
        };
        set(
          saved({
            planVersions: [...state.planVersions, savedPlan],
            planDraft: null,
            drafts: { ...state.drafts, planReason: "" },
          }),
        );
        if (trialId) get().linkPlanVersionToTrial(trialId, `${before.name} v${before.version}`, savedPlan.name, savedPlan.id);
      },
      discardDraft: () => set(saved({ planDraft: null })),
      addGoal: () => {
        const state = get();
        const name = state.drafts.goalName.trim();
        if (!name) return;
        const goal: Goal = {
          id: newId(),
          name,
          improvement: state.drafts.goalImprovement.trim(),
          check: state.drafts.goalCheck.trim(),
        };
        set(saved({ goals: [...state.goals, goal], overlay: null, drafts: { ...state.drafts, goalName: "", goalImprovement: "", goalCheck: "" } }));
      },
      setPtNote: (id, note) => set(saved({ ptNotes: { ...get().ptNotes, [id]: note } })),
      setBody: (patch) => set(patch),
      setTheme: (theme) => set(saved({ theme })),
      setWeeklyTarget: (weeklyTarget) => set(saved({ weeklyTarget })),
      setPlanContext: (planContext) => set(saved({ planContext })),
      toggleFoodSection: (key) => set({ foodSections: { ...get().foodSections, [key]: !get().foodSections[key] } }),
      setFoodNoCook: (foodNoCook) => set({ foodNoCook }),
      setShowAllMeals: (showAllMeals) => set({ showAllMeals }),
      setOpenLesson: (openLessonId) => set({ openLessonId, view: "learn" }),
      setEditorWeekday: (editorWeekday) => set({ editorWeekday }),
      setAllowExtraTrial: (allowExtraTrial) => set({ allowExtraTrial }),
      exportJson: () => {
        const data = persistable(get());
        return JSON.stringify({ daylight: SCHEMA_VERSION, exportedAt: new Date().toISOString(), customNames: loadCustomNames(), data }, null, 2);
      },
      importJson: (raw) => {
        try {
          const parsed = JSON.parse(raw) as { daylight?: number; customNames?: Record<string, string>; data?: Record<string, unknown> };
          if (!parsed.daylight || !parsed.data || !Array.isArray(parsed.data.planVersions) || !parsed.data.planVersions.length) {
            return "That file is not a Daylight backup.";
          }
          // Old (daylight: 1) backups have no schemaVersion, so they run through the same migration as old localStorage.
          const data = upgradeFoodWorkspace(migratePersisted(parsed.daylight >= 2 ? { schemaVersion: parsed.daylight, ...parsed.data } : parsed.data));
          if (parsed.customNames) saveCustomNames(parsed.customNames);
          const { view: _view, trainingTab: _tab, ...restored } = data as Partial<Data>;
          set(saved({ ...restored, overlay: null, undo: null, rest: null }));
          return "Backup restored on this device.";
        } catch {
          return "Couldn’t read that file. Your current records are still here.";
        }
      },
    }),
    {
      name: STORAGE_KEY,
      version: SCHEMA_VERSION,
      skipHydration: true,
      storage: createJSONStorage(() => localStorage),
      migrate: (persisted) => {
        // A one-time copy of whatever the old build had stored, in case anything ever needs recovering.
        try {
          if (!localStorage.getItem(BACKUP_KEY)) {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) localStorage.setItem(BACKUP_KEY, raw);
          }
          // A second raw copy taken just before the round-2 (v3) migration, once.
          if (!localStorage.getItem(BACKUP_KEY_V3)) {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) localStorage.setItem(BACKUP_KEY_V3, raw);
          }
        } catch {
          /* storage full or blocked: the migration itself does not depend on it */
        }
        return migratePersisted(persisted) as unknown as Data & Actions;
      },
      merge: (persisted, current) => ({ ...current, ...upgradeFoodWorkspace((persisted ?? {}) as Record<string, unknown>) }) as Data & Actions,
      partialize: (state) => persistable(state) as unknown as Data & Actions,
    },
  ),
);

const EPHEMERAL = new Set(["bodyWorkspace", "selectedMuscleId", "gymMode", "gymAutoSkip", "overlay", "undo", "toast", "rest", "openSlotId", "openExerciseId", "trainDay", "saveStatus"]);

function persistable(state: Data & Actions): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(state)) {
    if (typeof value === "function" || EPHEMERAL.has(key)) continue;
    out[key] = value;
  }
  return out;
}

function doneCount(session: WorkoutSession, prescriptionId: string): number {
  return new Set(session.logs.filter((log) => log.prescriptionId === prescriptionId && log.status === "done").map((log) => log.setIndex)).size;
}

const CUSTOM_KEY = "daylight-custom-exercises";

export function loadCustomNames(): Record<string, string> {
  if (typeof localStorage === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(CUSTOM_KEY) || "{}") as Record<string, string>;
  } catch {
    return {};
  }
}

export function saveCustomNames(names: Record<string, string>) {
  localStorage.setItem(CUSTOM_KEY, JSON.stringify(names));
}

export function exerciseName(id: string): string {
  const custom = loadCustomNames()[id];
  if (custom) return custom;
  return id;
}

export function useActiveSession(): WorkoutSession | null {
  return useDaylight((state) => state.sessions.find((session) => session.id === state.activeSessionId) ?? null);
}

export function statusLabel(status: InventoryStatus): string {
  switch (status) {
    case "fine":
      return "Amount recorded";
    case "use_soon":
      return "Use soon";
    case "use_first":
      return "Use first";
    case "low":
      return "Low";
    case "out":
      return "Out";
    case "check_amount":
      return "Check amount";
  }
}
