import { create } from "zustand";
import { persist } from "zustand/middleware";
import { localDate, localTime } from "./dates";
import { SEED_INVENTORY, SEED_MEALS, SEED_PREP, SEED_RECIPES, SEED_SHOPPING } from "./food-seed";
import { newId } from "./logic";
import { activePlan, dayTemplate, PLAN_V1 } from "./plan";
import type {
  ActivityLog,
  AdjustmentTrial,
  AppView,
  AppliedChange,
  BodyLayer,
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
  prep: typeof SEED_PREP;
  savedMeals: SavedMeal[];
  prepared: PreparedPortion[];
  foodLogs: FoodLog[];
  fluidLogs: { id: string; localDate: string; time: string; beverage: string; amountOz: number; sizeId: string | null }[];
  proteinGoal: number;
  view: AppView;
  trainingTab: TrainingTab;
  bodyView: "front" | "back";
  bodyLayer: BodyLayer;
  bodyWindow: "today" | "7" | "30";
  selectedRegionId: string | null;
  highlightedExerciseId: string | null;
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

type Actions = {
  setView: (view: AppView) => void;
  setTrainingTab: (tab: TrainingTab) => void;
  setOverlay: (overlay: Overlay) => void;
  patchDraft: (patch: Partial<Drafts>) => void;
  adoptPurpose: (text: string) => void;
  setUnits: (units: "lb" | "kg") => void;
  startSession: (weekday: number, chosen: boolean) => void;
  finishSession: (note: string) => void;
  setFocusSlot: (index: number) => void;
  nextExercise: () => void;
  markSetDone: () => void;
  skipExercise: () => void;
  undoLast: () => void;
  chooseVariant: (prescriptionId: string, exerciseId: string, savePlan: boolean) => void;
  startTimer: () => void;
  stopTimer: () => number | null;
  addObservation: (text: string, context: ObservationContext, tags?: ObservationTag[]) => string | null;
  updateObservation: (id: string, text: string, tags?: ObservationTag[]) => void;
  setObservationStatus: (id: string, status: Observation["status"]) => void;
  createTrial: (observationId: string) => string | null;
  resolveTrial: (id: string, action: "keep" | "revise" | "end" | "later", note: string) => void;
  applyPrepChange: () => string | null;
  linkPlanVersionToTrial: (trialId: string, beforeName: string, afterName: string, versionId: string) => void;
  revertChange: (id: string) => void;
  logFood: (input: { food: string; mealId: string | null; protein: number | null; estimate: boolean; preparedId?: string | null }) => void;
  logDrink: () => void;
  setProteinGoal: (goal: number) => void;
  togglePin: (mealId: string) => void;
  updateInventory: (id: string, patch: Partial<InventoryItem>) => void;
  addInventory: (name: string) => void;
  addShopping: (name: string, quantity: string, source: string) => void;
  toggleShopping: (id: string) => void;
  addShoppingToInventory: (id: string) => void;
  addMissingToShopping: (names: string[]) => number;
  setPrepStatus: (id: string, status: "planned" | "done") => void;
  addPreparedFromPrep: (id: string) => void;
  logActivity: () => void;
  ensureDraft: () => void;
  moveSlot: (weekday: number, index: number, direction: -1 | 1) => void;
  removeSlot: (weekday: number, index: number) => void;
  addSlot: (weekday: number) => void;
  savePlanVersion: (trialId?: string | null) => void;
  discardDraft: () => void;
  addGoal: () => void;
  setPtNote: (id: string, note: string) => void;
  setBody: (patch: Partial<Pick<Data, "bodyView" | "bodyLayer" | "bodyWindow" | "selectedRegionId" | "highlightedExerciseId">>) => void;
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
  planVersions: [PLAN_V1],
  planDraft: null,
  sessions: [],
  activeSessionId: null,
  activities: [],
  observations: [],
  trials: [],
  appliedChanges: [],
  goals: [],
  ptNotes: {},
  inventory: SEED_INVENTORY,
  recipes: SEED_RECIPES,
  shopping: SEED_SHOPPING,
  prep: SEED_PREP,
  savedMeals: SEED_MEALS,
  prepared: [],
  foodLogs: [],
  fluidLogs: [],
  proteinGoal: 130,
  view: "today",
  trainingTab: "week",
  bodyView: "front",
  bodyLayer: "planned",
  bodyWindow: "7",
  selectedRegionId: null,
  highlightedExerciseId: null,
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
      setView: (view) => set({ view }),
      setTrainingTab: (trainingTab) => set({ trainingTab, view: "training" }),
      setOverlay: (overlay) => set({ overlay }),
      patchDraft: (patch) => set({ drafts: { ...get().drafts, ...patch } }),
      adoptPurpose: (text) => {
        const purpose = text.trim();
        if (!purpose) return;
        set(saved({ purpose, purposeIsProposal: false, overlay: null }));
      },
      setUnits: (units) => set(saved({ units })),
      startSession: (weekday, chosen) => {
        const state = get();
        if (state.activeSessionId) return;
        const plan = activePlan(state.planVersions, localDate());
        const session = sessionFromDay(plan, weekday, chosen);
        const day = dayTemplate(plan, weekday);
        if (!day.scheduled && !chosen) return;
        set(
          saved({
            sessions: [...state.sessions, session],
            activeSessionId: session.id,
            view: "training",
            trainingTab: "runner",
            overlay: null,
            drafts: { ...state.drafts, side: day.slots[0]?.perSide ? "both" : "na", reps: "", load: "", assist: "", seconds: "", distance: "" },
          }),
        );
      },
      finishSession: (note) => {
        const state = get();
        if (!state.activeSessionId) return;
        set(
          saved({
            sessions: state.sessions.map((session) =>
              session.id === state.activeSessionId
                ? { ...session, status: "finished", finishedAt: new Date().toISOString(), note: note.trim() || session.note }
                : session,
            ),
            activeSessionId: null,
            overlay: null,
            trainingTab: "week",
            timerStartedAt: null,
          }),
        );
      },
      setFocusSlot: (index) => {
        const state = get();
        const session = state.sessions.find((item) => item.id === state.activeSessionId);
        if (!session) return;
        const slot = session.snapshot[index];
        set({
          sessions: state.sessions.map((item) => (item.id === session.id ? { ...item, focusSlot: index } : item)),
          timerSlotId: null,
          timerStartedAt: null,
          timerAccumulated: 0,
          drafts: {
            ...state.drafts,
            reps: "",
            load: "",
            assist: "",
            seconds: "",
            distance: "",
            side: slot?.perSide ? "both" : "na",
          },
        });
      },
      nextExercise: () => {
        const state = get();
        const session = state.sessions.find((item) => item.id === state.activeSessionId);
        if (!session) return;
        const next = Math.min(session.focusSlot + 1, Math.max(session.snapshot.length - 1, 0));
        get().setFocusSlot(next);
      },
      markSetDone: () => {
        const state = get();
        const session = state.sessions.find((item) => item.id === state.activeSessionId);
        if (!session || session.status !== "active") return;
        const slot = session.snapshot[session.focusSlot];
        if (!slot) return;
        const setIndex = slot.sets ? doneCount(session, slot.id) : 0;
        if (slot.sets && setIndex >= slot.sets) return;
        const log: SetLog = {
          id: newId(),
          prescriptionId: slot.id,
          setIndex: slot.sets ? setIndex : 0,
          side: slot.perSide ? state.drafts.side : "na",
          status: "done",
          reps: numOrNull(state.drafts.reps),
          load: numOrNull(state.drafts.load),
          loadUnit: state.units,
          assistance: numOrNull(state.drafts.assist),
          assistanceUnit: state.units,
          seconds: numOrNull(state.drafts.seconds),
          distance: state.drafts.distance.trim() || null,
          at: new Date().toISOString(),
        };
        const undo: UndoRecord = { kind: "set", sessionId: session.id, logs: session.logs, focusSlot: session.focusSlot, label: "Set marked done" };
        set(
          saved({
            undo,
            sessions: state.sessions.map((item) => (item.id === session.id ? { ...item, logs: [...item.logs, log] } : item)),
            drafts: { ...state.drafts, reps: "", load: "", assist: "", seconds: "", distance: "" },
          }),
        );
      },
      skipExercise: () => {
        const state = get();
        const session = state.sessions.find((item) => item.id === state.activeSessionId);
        if (!session) return;
        const slot = session.snapshot[session.focusSlot];
        if (!slot) return;
        const log: SetLog = {
          id: newId(),
          prescriptionId: slot.id,
          setIndex: -1,
          side: "na",
          status: "skipped",
          reps: null,
          load: null,
          loadUnit: state.units,
          assistance: null,
          assistanceUnit: state.units,
          seconds: null,
          distance: null,
          at: new Date().toISOString(),
        };
        set(
          saved({
            undo: { kind: "set", sessionId: session.id, logs: session.logs, focusSlot: session.focusSlot, label: "Exercise skipped" },
            sessions: state.sessions.map((item) => (item.id === session.id ? { ...item, logs: [...item.logs, log] } : item)),
          }),
        );
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
      chooseVariant: (prescriptionId, exerciseId, savePlan) => {
        const state = get();
        const session = state.sessions.find((item) => item.id === state.activeSessionId);
        if (!session) return;
        set(
          saved({
            sessions: state.sessions.map((item) =>
              item.id === session.id ? { ...item, chosenExercise: { ...item.chosenExercise, [prescriptionId]: exerciseId } } : item,
            ),
            overlay: null,
          }),
        );
        if (!savePlan) return;
        get().ensureDraft();
        const draft = get().planDraft;
        if (!draft) return;
        const next = clonePlan(draft);
        for (const day of next.days) {
          day.slots = day.slots.map((slot) => (slot.id === prescriptionId ? { ...slot, exerciseId } : slot));
        }
        set({ planDraft: next });
      },
      startTimer: () => {
        const state = get();
        const session = state.sessions.find((item) => item.id === state.activeSessionId);
        const slot = session?.snapshot[session.focusSlot];
        if (!slot) return;
        if (state.timerStartedAt && state.timerSlotId === slot.id) return;
        set({ timerSlotId: slot.id, timerStartedAt: new Date().toISOString(), timerAccumulated: state.timerSlotId === slot.id ? state.timerAccumulated : 0 });
      },
      stopTimer: () => {
        const state = get();
        if (!state.timerStartedAt) return null;
        const extra = Date.now() - new Date(state.timerStartedAt).getTime();
        const total = state.timerAccumulated + Math.max(0, extra);
        const seconds = Math.round(total / 1000);
        set({
          timerStartedAt: null,
          timerAccumulated: total,
          drafts: { ...state.drafts, seconds: String(seconds) },
        });
        return seconds;
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
              overlay: { type: "trial", observationId: trial.observationId },
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
      logFood: ({ food, mealId, protein, estimate, preparedId }) => {
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
      setProteinGoal: (proteinGoal) => set(saved({ proteinGoal })),
      togglePin: (mealId) => {
        const meals = get().savedMeals.map((meal) => (meal.id === mealId ? { ...meal, pinned: !meal.pinned } : meal));
        const pinned = meals.filter((meal) => meal.pinned);
        if (pinned.length > 3) return;
        set(saved({ savedMeals: meals }));
      },
      updateInventory: (id, patch) => {
        set(saved({ inventory: get().inventory.map((item) => (item.id === id ? { ...item, ...patch } : item)) }));
      },
      addInventory: (name) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        const row: InventoryItem = {
          id: newId(),
          name: trimmed,
          quantity: "",
          category: "Pantry",
          cadence: "weekly",
          storageLocation: "Cabinet",
          status: "check_amount",
          notes: "",
        };
        set(saved({ inventory: [row, ...get().inventory] }));
      },
      addShopping: (name, quantity, source) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        const exists = get().shopping.some((item) => item.name.toLowerCase() === trimmed.toLowerCase() && !item.checked);
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
        const match = get().inventory.find((row) => row.name.toLowerCase() === item.name.toLowerCase());
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
        if (!task) return;
        const portion: PreparedPortion = {
          id: newId(),
          name: task.title,
          detail: task.detail,
          available: true,
          fromPrepId: task.id,
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
      toggleFoodSection: (key) => set({ foodSections: { ...get().foodSections, [key]: !get().foodSections[key] } }),
      setFoodNoCook: (foodNoCook) => set({ foodNoCook }),
      setShowAllMeals: (showAllMeals) => set({ showAllMeals }),
      setOpenLesson: (openLessonId) => set({ openLessonId, view: "learn" }),
      setEditorWeekday: (editorWeekday) => set({ editorWeekday }),
      setAllowExtraTrial: (allowExtraTrial) => set({ allowExtraTrial }),
      exportJson: () => {
        const state = get();
        const data: Data = {
          purpose: state.purpose,
          purposeIsProposal: state.purposeIsProposal,
          units: state.units,
          drinkSizes: state.drinkSizes,
          planVersions: state.planVersions,
          planDraft: state.planDraft,
          sessions: state.sessions,
          activeSessionId: state.activeSessionId,
          activities: state.activities,
          observations: state.observations,
          trials: state.trials,
          appliedChanges: state.appliedChanges,
          goals: state.goals,
          ptNotes: state.ptNotes,
          inventory: state.inventory,
          recipes: state.recipes,
          shopping: state.shopping,
          prep: state.prep,
          savedMeals: state.savedMeals,
          prepared: state.prepared,
          foodLogs: state.foodLogs,
          fluidLogs: state.fluidLogs,
          proteinGoal: state.proteinGoal,
          view: state.view,
          trainingTab: state.trainingTab,
          bodyView: state.bodyView,
          bodyLayer: state.bodyLayer,
          bodyWindow: state.bodyWindow,
          selectedRegionId: state.selectedRegionId,
          highlightedExerciseId: state.highlightedExerciseId,
          foodSections: state.foodSections,
          foodNoCook: state.foodNoCook,
          showAllMeals: state.showAllMeals,
          overlay: null,
          drafts: state.drafts,
          timerSlotId: state.timerSlotId,
          timerStartedAt: state.timerStartedAt,
          timerAccumulated: state.timerAccumulated,
          undo: null,
          saveStatus: state.saveStatus,
          openLessonId: state.openLessonId,
          editorWeekday: state.editorWeekday,
          allowExtraTrial: state.allowExtraTrial,
        };
        return JSON.stringify({ daylight: 1, customNames: loadCustomNames(), data }, null, 2);
      },
      importJson: (raw) => {
        try {
          const parsed = JSON.parse(raw) as { daylight?: number; customNames?: Record<string, string>; data?: Data };
          if (parsed.daylight !== 1 || !parsed.data?.planVersions?.length) return "That file is not a Daylight backup.";
          if (parsed.customNames) saveCustomNames(parsed.customNames);
          set(saved({ ...parsed.data, overlay: null, undo: null }));
          return "Backup restored on this device.";
        } catch {
          return "Couldn’t read that file. Your current records are still here.";
        }
      },
    }),
    {
      name: "daylight-matrix-v1",
      skipHydration: true,
      partialize: (state) => {
        const {
          setView: _a,
          setTrainingTab: _b,
          setOverlay: _c,
          patchDraft: _d,
          adoptPurpose: _e,
          setUnits: _f,
          startSession: _g,
          finishSession: _h,
          setFocusSlot: _i,
          nextExercise: _j,
          markSetDone: _k,
          skipExercise: _l,
          undoLast: _m,
          chooseVariant: _n,
          startTimer: _o,
          stopTimer: _p,
          addObservation: _q,
          updateObservation: _r,
          setObservationStatus: _s,
          createTrial: _t,
          resolveTrial: _u,
          applyPrepChange: _v,
          linkPlanVersionToTrial: _w,
          revertChange: _x,
          logFood: _y,
          logDrink: _z,
          setProteinGoal: _aa,
          togglePin: _ab,
          updateInventory: _ac,
          addInventory: _ad,
          addShopping: _ae,
          toggleShopping: _af,
          addShoppingToInventory: _ag,
          addMissingToShopping: _ah,
          setPrepStatus: _ai,
          addPreparedFromPrep: _aj,
          logActivity: _ak,
          ensureDraft: _al,
          moveSlot: _am,
          removeSlot: _an,
          addSlot: _ao,
          savePlanVersion: _ap,
          discardDraft: _aq,
          addGoal: _ar,
          setPtNote: _as,
          setBody: _at,
          toggleFoodSection: _au,
          setFoodNoCook: _av,
          setShowAllMeals: _aw,
          setOpenLesson: _ax,
          setEditorWeekday: _ay,
          setAllowExtraTrial: _az,
          exportJson: _ba,
          importJson: _bb,
          ...data
        } = state;
        return data;
      },
    },
  ),
);

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
