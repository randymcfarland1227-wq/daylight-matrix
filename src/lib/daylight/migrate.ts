import { localDate } from "./dates";
import { SEED_INVENTORY, SEED_MEALS, SEED_STARTER_INVENTORY, SEED_STARTER_MEALS } from "./food-seed";
import { OLD_REGION_TO_MUSCLE } from "./muscles";
import { buildPdfPlan } from "./plan";
import { FS3_ID_PREFIX, buildFs3Days, buildFs3Plan } from "./fs3";
import type { Observation, PlanVersion } from "./types";

/**
 * Persisted-state schema.
 *  1 (zustand version 0): the first public build. No `schemaVersion` field.
 *  2: overhaul. Adds the full PDF plan version, notes flags, muscle ids, water/meal-plan/waste data, theme.
 *  3: round 2. Two-level muscle model (groups + sub-parts), session `extras` (swaps / off-plan work), dark default theme.
 *     Stored muscle ids from v2 are NOT rewritten; `resolveMuscle` understands them.
 *  4: round 19. The PDF's "this or that" options: saved plan slots gain any missing PDF alternatives (matched by weekday +
 *     listed move; additive, nothing removed or reordered), plus an empty `variantPrefs` map for remembered picks.
 *
 * Rules: never remove or retype an existing field. Only add. Old plan versions, sessions, logs, notes,
 * trials, food and inventory stay exactly as stored. Idempotent: running it twice changes nothing.
 */
export const SCHEMA_VERSION = 6;
export const STORAGE_KEY = "daylight-matrix-v1";
export const BACKUP_KEY = "daylight-matrix-v1.pre-v2-backup";
export const BACKUP_KEY_V3 = "daylight-matrix-v1.pre-v3-backup";
export const NOTES_MIRROR_KEY = "daylight-notes-mirror";

type AnyRec = Record<string, unknown>;

const isObj = (v: unknown): v is AnyRec => typeof v === "object" && v !== null && !Array.isArray(v);

const OLD_TAB: Record<string, string> = {
  runner: "session",
  week: "week",
  pt: "pt",
  library: "moves",
  editor: "plan",
  import: "plan",
};

export function migratePersisted(input: unknown, now = localDate()): AnyRec {
  if (!isObj(input)) return {};
  const state: AnyRec = { ...input };
  const from = typeof state.schemaVersion === "number" ? state.schemaVersion : 1;
  if (from >= SCHEMA_VERSION) return state;
  if (from < 2) migrateToV2(state, now);
  if (from < 3) migrateToV3(state);
  if (from < 4) migrateToV4(state, now);
  if (from < 5) migrateToV5(state);
  migrateToV6(state);
  state.schemaVersion = SCHEMA_VERSION;
  return state;
}

/** v3 -> v4. Additive only: PDF either/or alternatives onto saved slots that list the same move on the same day. */
export function addPdfAlternatives(plans: PlanVersion[], now = localDate()): PlanVersion[] {
  const pdf = buildPdfPlan(1, now);
  return plans.map((plan) => ({
    ...plan,
    days: (plan.days ?? []).map((day) => {
      const ref = pdf.days.find((d) => d.weekday === day.weekday);
      if (!ref) return day;
      return {
        ...day,
        slots: (day.slots ?? []).map((slot) => {
          const src = ref.slots.find((r) => r.exerciseId === slot.exerciseId && r.alternatives.length);
          if (!src) return slot;
          const have = new Set([slot.exerciseId, ...(slot.alternatives ?? []).map((a) => a.exerciseId)]);
          const add = src.alternatives.filter((a) => !have.has(a.exerciseId)).map((a, i) => ({ id: `${slot.id}-pdfalt-${i}-${a.exerciseId}`, exerciseId: a.exerciseId }));
          return add.length ? { ...slot, alternatives: [...(slot.alternatives ?? []), ...add] } : slot;
        }),
      };
    }),
  }));
}

/** v4 -> v5. Additive only: Fine Shyte 3 becomes the newest plan version; every earlier version stays in history. */
export function addFs3Plan(plans: PlanVersion[]): PlanVersion[] {
  if (plans.some((p) => typeof p.id === "string" && p.id.startsWith(FS3_ID_PREFIX))) return plans;
  const maxVersion = plans.reduce((m, p) => Math.max(m, typeof p.version === "number" ? p.version : 0), 0);
  return [...plans, buildFs3Plan(maxVersion + 1)];
}

/** v5 -> v6. The gym has kettlebells and a landmine: the generated Fine Shyte 3 version gets the corrected days. Saved edits (new ids) are untouched. */
export function refreshFs3Days(plans: PlanVersion[]): PlanVersion[] {
  return plans.map((p) => (typeof p.id === "string" && p.id === `${FS3_ID_PREFIX}-v${p.version}` ? { ...p, days: buildFs3Days() } : p));
}

function migrateToV6(state: AnyRec) {
  if (Array.isArray(state.planVersions)) state.planVersions = refreshFs3Days(state.planVersions as PlanVersion[]);
}

function migrateToV5(state: AnyRec) {
  if (Array.isArray(state.planVersions)) state.planVersions = addFs3Plan(state.planVersions as PlanVersion[]);
}

function migrateToV4(state: AnyRec, now: string) {
  if (Array.isArray(state.planVersions)) state.planVersions = addPdfAlternatives(state.planVersions as PlanVersion[], now);
  if (!isObj(state.variantPrefs)) state.variantPrefs = {};
}

/** v2 -> v3. Additive only. */
function migrateToV3(state: AnyRec) {
  // Round 2 made the look dark by default. "auto" was only ever the untouched default, so move it to "dark";
  // an explicit "light" or "dark" choice is kept.
  if (state.theme === undefined || state.theme === "auto") state.theme = "dark";
  // Sessions get an (empty) extras list so the new UI never has to guess.
  if (Array.isArray(state.sessions)) {
    state.sessions = (state.sessions as AnyRec[]).map((sess) => (Array.isArray(sess.extras) ? sess : { ...sess, extras: [] }));
  }
  // Stored note muscle ids (old 24-region ids, v2 flat ids) are kept as they are; resolveMuscle() maps them at read time.
}

/** 1 -> 2: first overhaul. */
function migrateToV2(state: AnyRec, now: string) {

  // ---- plan versions: keep every old version, append the complete PDF plan as the newest ----
  const old = Array.isArray(state.planVersions) ? (state.planVersions as PlanVersion[]) : [];
  const maxVersion = old.reduce((m, p) => Math.max(m, typeof p.version === "number" ? p.version : 0), 0);
  const hasPdf = old.some((p) => typeof p.id === "string" && p.id.startsWith("fine-shyte-pdf"));
  if (!hasPdf) {
    const latest = old.slice().sort((a, b) => b.version - a.version)[0];
    const next = buildPdfPlan(maxVersion + 1, now, {
      id: `fine-shyte-pdf-v${maxVersion + 1}`,
      reason: old.length
        ? "Complete import of the Fine Shyte Plan PDF (earlier versions are kept in history). Exercises you added yourself were carried over."
        : "Complete import of the Fine Shyte Plan PDF.",
    });
    if (latest) {
      for (const day of latest.days ?? []) {
        const custom = (day.slots ?? []).filter((slot) => typeof slot.exerciseId === "string" && slot.exerciseId.startsWith("custom-"));
        if (!custom.length) continue;
        const target = next.days.find((d) => d.weekday === day.weekday);
        if (target) {
          target.scheduled = true;
          target.slots.push(...custom.map((slot) => ({ ...slot, section: "main" as const })));
        }
      }
    }
    state.planVersions = [...old, next];
  }

  // ---- notes: add flags, map the old region id to a muscle id ----
  if (Array.isArray(state.observations)) {
    state.observations = (state.observations as Observation[]).map((o) => {
      const ctx = { ...(o.context ?? {}) } as Observation["context"];
      if (ctx.regionId && !ctx.muscleId) ctx.muscleId = OLD_REGION_TO_MUSCLE[ctx.regionId];
      return { ...o, context: ctx, forNextPlan: o.forNextPlan ?? false, kind: o.kind ?? (ctx.mealId ? "food" : ctx.exerciseId ? "gym" : "general") };
    });
  }

  // ---- food: add seed items the user does not have yet (by id and by name), never touch existing rows ----
  if (Array.isArray(state.inventory)) {
    const have = new Set((state.inventory as { name: string; id: string }[]).flatMap((i) => [i.id, i.name.toLowerCase()]));
    const add = SEED_STARTER_INVENTORY.filter((i) => !have.has(i.id) && !have.has(i.name.toLowerCase()));
    state.inventory = [...(state.inventory as unknown[]), ...add];
  }
  if (Array.isArray(state.savedMeals)) {
    const have = new Set((state.savedMeals as { id: string }[]).map((m) => m.id));
    state.savedMeals = [...(state.savedMeals as unknown[]), ...SEED_STARTER_MEALS.filter((m) => !have.has(m.id))];
  }

  // ---- navigation values that no longer exist ----
  if (typeof state.trainingTab === "string") state.trainingTab = OLD_TAB[state.trainingTab] ?? state.trainingTab;
  if (state.view === "training" && state.trainingTab === "runner") state.trainingTab = "session";
  // An open session from the old build keeps its snapshot and logs; it simply shows up in the new session screen.
  if (isObj(state.drafts)) state.drafts = { ...state.drafts };

  const OLD_VIEW: Record<string, string> = { review: "notes", history: "settings", goals: "settings" };
  if (typeof state.view === "string" && OLD_VIEW[state.view]) state.view = OLD_VIEW[state.view];
  // Old body-map settings no longer exist; drop them so they cannot confuse the new map.
  for (const key of ["bodyLayer", "bodyWindow", "selectedRegionId", "highlightedExerciseId"]) delete state[key];

}

export { SEED_INVENTORY, SEED_MEALS };
