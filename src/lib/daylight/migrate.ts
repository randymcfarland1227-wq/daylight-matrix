import { localDate } from "./dates";
import { SEED_INVENTORY, SEED_MEALS, SEED_STARTER_INVENTORY, SEED_STARTER_MEALS } from "./food-seed";
import { OLD_REGION_TO_MUSCLE } from "./muscles";
import { buildPdfPlan } from "./plan";
import type { Observation, PlanVersion } from "./types";

/**
 * Persisted-state schema.
 *  1 (zustand version 0): the first public build. No `schemaVersion` field.
 *  2: overhaul. Adds the full PDF plan version, notes flags, muscle ids, water/meal-plan/waste data, theme.
 *
 * Rules: never remove or retype an existing field. Only add. Old plan versions, sessions, logs, notes,
 * trials, food and inventory stay exactly as stored. Idempotent: running it twice changes nothing.
 */
export const SCHEMA_VERSION = 2;
export const STORAGE_KEY = "daylight-matrix-v1";
export const BACKUP_KEY = "daylight-matrix-v1.pre-v2-backup";
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

  state.schemaVersion = SCHEMA_VERSION;
  return state;
}

export { SEED_INVENTORY, SEED_MEALS };
