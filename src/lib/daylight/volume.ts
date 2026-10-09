import { shiftDate } from "./dates";
import { exerciseById, volumeFactorFor } from "./exercises";
import { GROUPS, MUSCLE_IDS, REGIONS, REGION_IDS, groupOfSub, isGroup, isRegion, regionOfSub, resolveMuscle, subsOf, type AnyMuscleId, type GroupId, type MuscleId, type SubId } from "./muscles";
import { dayBlocks } from "./plan";
import type { DayTemplate, ExtraLog, PlanVersion, Prescription, WorkoutSession } from "./types";

export type MuscleHit = {
  exerciseId: string;
  name: string;
  weight: number;
  role: "primary" | "secondary" | "minor";
  /** Weekly sets this exercise contributes to the muscle (before weighting). */
  sets: number;
  days: number[];
  alt?: boolean;
};

export type MuscleVolume = {
  id: AnyMuscleId;
  /** Weighted sets (primary 1, secondary 0.5, minor 0.25 and the exercise’s own volume factor). */
  effective: number;
  /** Sets where the muscle is a primary mover. */
  direct: number;
  /** Sets where the muscle only helps. */
  indirect: number;
  hits: MuscleHit[];
};

export type VolumeMap = Record<AnyMuscleId, MuscleVolume>;

export function roleOf(weight: number): "primary" | "secondary" | "minor" {
  return weight >= 1 ? "primary" : weight >= 0.5 ? "secondary" : "minor";
}

function emptyMap(): VolumeMap {
  const map = {} as VolumeMap;
  for (const id of [...MUSCLE_IDS, ...REGION_IDS] as AnyMuscleId[]) map[id] = { id, effective: 0, direct: 0, indirect: 0, hits: [] };
  return map;
}

/** Weight of an exercise for any id: sub-part weight, or for a group the largest weight among its sub-parts. */
export function weightFor(muscles: Partial<Record<string, number>> | undefined, id: string): number {
  if (!muscles) return 0;
  if (!isGroup(id) && !isRegion(id)) return muscles[id] ?? 0;
  let best = 0;
  for (const sub of subsOf(id)) best = Math.max(best, muscles[sub] ?? 0);
  return best;
}

function bump(map: VolumeMap, mid: AnyMuscleId, ex: { id: string; name: string }, weight: number, sets: number, factor: number, day: number | null, alt: boolean) {
  const cell = map[mid];
  if (!cell) return;
  if (!alt) {
    cell.effective += sets * weight * factor;
    if (weight >= 1) cell.direct += sets * factor;
    else cell.indirect += sets * factor;
  }
  let hit = cell.hits.find((h) => h.exerciseId === ex.id);
  if (!hit) {
    hit = { exerciseId: ex.id, name: ex.name, weight, role: roleOf(weight), sets: 0, days: [], alt };
    cell.hits.push(hit);
  }
  if (!alt) hit.alt = false;
  if (!alt) hit.sets += sets;
  if (day != null && !hit.days.includes(day)) hit.days.push(day);
}

function addHit(map: VolumeMap, exerciseId: string, sets: number, day: number | null, alt = false) {
  const ex = exerciseById(exerciseId);
  if (!ex?.muscles || sets <= 0) return;
  addWeights(map, { id: ex.id, name: ex.name }, ex.muscles, sets, volumeFactorFor(ex), day, alt);
}

/** Adds one exercise-worth of sets to every sub-part it touches and to the groups those belong to. */
export function addWeights(map: VolumeMap, ex: { id: string; name: string }, muscles: Partial<Record<string, number>>, sets: number, factor: number, day: number | null, alt = false) {
  const groupMax = new Map<GroupId, number>();
  for (const [mid, weight] of Object.entries(muscles) as [SubId, number][]) {
    if (!map[mid] || !weight) continue;
    bump(map, mid, ex, weight, sets, factor, day, alt);
    const g = groupOfSub(mid);
    groupMax.set(g, Math.max(groupMax.get(g) ?? 0, weight));
  }
  for (const [g, weight] of groupMax) bump(map, g, ex, weight, sets, factor, day, alt);
  const regionMax = new Map<string, number>();
  for (const [mid, weight] of Object.entries(muscles) as [SubId, number][]) {
    if (!map[mid] || !weight) continue;
    const r = regionOfSub(mid).id;
    regionMax.set(r, Math.max(regionMax.get(r) ?? 0, weight));
  }
  for (const [r, weight] of regionMax) bump(map, r as AnyMuscleId, ex, weight, sets, factor, day, alt);
}

export function plannedSets(slot: Prescription): number {
  if (!slot.sets) return 0;
  return slot.setsMax && slot.setsMax > slot.sets ? (slot.sets + slot.setsMax) / 2 : slot.sets;
}

/** Sets per week the plan prescribes for each muscle. Ranges use their midpoint. Optional slots are skipped. */
export function plannedVolume(plan: PlanVersion, opts: { weekday?: number } = {}): VolumeMap {
  const map = emptyMap();
  for (const day of plan.days) {
    if (opts.weekday != null && day.weekday !== opts.weekday) continue;
    for (const slot of day.slots) {
      if (slot.optional) continue;
      const sets = plannedSets(slot);
      addHit(map, slot.exerciseId, sets, day.weekday);
      for (const alt of slot.alternatives) addHit(map, alt.exerciseId, sets, day.weekday, true);
    }
  }
  sortHits(map);
  return map;
}

function sortHits(map: VolumeMap) {
  for (const cell of Object.values(map)) cell.hits.sort((a, b) => b.weight - a.weight || b.sets - a.sets);
}

export type LoggedWindow = { from: string; to: string; days: number };

export function windowFor(days: number, today: string): LoggedWindow {
  return { from: shiftDate(today, -(days - 1)), to: today, days };
}

/** Sets an off-plan log counts for: its sets, else 1 when it has minutes or a name. */
export function extraSets(extra: ExtraLog): number {
  return extra.sets && extra.sets > 0 ? extra.sets : 1;
}

/** Off-plan work counts only when Randy chose muscles, or picked a catalog move (its mapping is used). */
export function addExtra(map: VolumeMap, extra: ExtraLog, sets: number, weekday: number | null) {
  const label = { id: `extra:${extra.id}`, name: extra.name || "Something else" };
  const chosen = (extra.muscles ?? []).map((id) => resolveMuscle(id)).filter(Boolean) as NonNullable<ReturnType<typeof resolveMuscle>>[];
  if (chosen.length) {
    const w: Record<string, number> = {};
    for (const c of chosen) {
      if (c.id === c.group && !c.sub && isGroup(c.id)) {
        // a whole group was picked: spread over its sub-parts
        for (const g of GROUPS) if (g.id === c.group) for (const sub of g.subs) w[sub] = 1;
      } else {
        w[c.sub ?? c.id] = 1;
      }
    }
    addWeights(map, label, w, sets, 1, weekday);
    return;
  }
  const ex = extra.exerciseId ? exerciseById(extra.exerciseId) : undefined;
  if (ex?.muscles) addWeights(map, { id: ex.id, name: extra.name || ex.name }, ex.muscles, sets, volumeFactorFor(ex), weekday);
}

/** A logged set is one done SetLog. Left/right halves of a per-side exercise count half each. */
export function loggedVolume(sessions: WorkoutSession[], win: LoggedWindow): { map: VolumeMap; totalSets: number } {
  const map = emptyMap();
  let totalSets = 0;
  for (const session of sessions) {
    if (session.localDate < win.from || session.localDate > win.to) continue;
    const weekday = new Date(`${session.localDate}T12:00:00`).getDay();
    for (const log of session.logs) {
      if (log.status !== "done") continue;
      const slot = session.snapshot.find((item) => item.id === log.prescriptionId);
      if (!slot) continue;
      const exerciseId = session.chosenExercise[slot.id] ?? slot.exerciseId;
      const sets = slot.perSide && (log.side === "left" || log.side === "right") ? 0.5 : 1;
      totalSets += sets;
      addHit(map, exerciseId, sets, weekday);
    }
    for (const extra of session.extras ?? []) {
      const n = extraSets(extra);
      totalSets += n;
      addExtra(map, extra, n, weekday);
    }
  }
  sortHits(map);
  return { map, totalSets };
}

export type CoverageStatus = "none" | "indirect" | "low" | "ok" | "high";

export const STATUS_LABEL: Record<CoverageStatus, string> = {
  none: "No mapped sets",
  indirect: "Only indirect work",
  low: "Below comparison range",
  ok: "Within comparison range",
  high: "Above comparison range",
};

/** `target` is the weekly weighted sets you’d like each muscle to reach. It is your number, not a rule. */
export function statusFor(cell: MuscleVolume, weeklyFactor: number, target: number): CoverageStatus {
  const eff = cell.effective / weeklyFactor;
  if (eff <= 0.01) return "none";
  if (cell.direct / weeklyFactor < 1) return "indirect";
  if (eff < target * 0.5) return "low";
  if (eff <= target * 1.5) return "ok";
  return "high";
}

/** 0..1 for colouring. 1 = at or above target. */
export function heatLevel(cell: MuscleVolume, weeklyFactor: number, target: number): number {
  const eff = cell.effective / weeklyFactor;
  return Math.max(0, Math.min(1, eff / target));
}

export type HeatSnapshot = {
  map: VolumeMap;
  source: "logged" | "planned";
  windowDays: number;
  /** Multiply window totals by this to get a per-week figure. */
  weeklyFactor: number;
  totalSets: number;
};

/** Recorded activity stays empty when there are no logs; planned work has its own explicit view. */
export function heatSnapshot(sessions: WorkoutSession[], _plan: PlanVersion, days: 7 | 14 | 30, today: string): HeatSnapshot {
  const logged = loggedVolume(sessions, windowFor(days, today));
  return { map: logged.map, source: "logged", windowDays: days, weeklyFactor: days / 7, totalSets: logged.totalSets };
}

/** Muscles a day works. `level` "group" (default) rolls sub-parts into their group using the largest weight. */
export function dayMuscles(day: DayTemplate, level: "group" | "sub" = "group"): { id: MuscleId; weight: number }[] {
  const totals: Partial<Record<MuscleId, number>> = {};
  for (const slot of day.slots) {
    if (slot.optional) continue;
    const ex = exerciseById(slot.exerciseId);
    if (!ex?.muscles || volumeFactorFor(ex) === 0) continue;
    for (const [sid, w] of Object.entries(ex.muscles) as [SubId, number][]) {
      const id = level === "group" ? groupOfSub(sid) : sid;
      totals[id] = Math.max(totals[id] ?? 0, w);
    }
  }
  return Object.entries(totals)
    .map(([id, weight]) => ({ id: id as MuscleId, weight: weight! }))
    .sort((a, b) => b.weight - a.weight);
}

export function dayTotalSets(day: DayTemplate): number {
  return day.slots.reduce((sum, s) => sum + (s.optional ? 0 : plannedSets(s)), 0);
}

export { dayBlocks };

export type Suggestion = {
  exerciseId: string;
  name: string;
  weight: number;
  role: "primary" | "secondary" | "minor";
  back: "friendly" | "neutral" | "caution";
  backNote?: string;
  equipment?: string;
  inPlan: boolean;
};

/** Candidate moves that would hit a muscle more. Back-friendly options come first. */
export function suggestionsFor(muscle: AnyMuscleId, planExerciseIds: Set<string>, limit = 8): Suggestion[] {
  const list: Suggestion[] = [];
  const ids = new Set<string>();
  for (const id of EXERCISE_IDS()) ids.add(id);
  for (const id of ids) {
    const ex = exerciseById(id);
    const w = weightFor(ex?.muscles, muscle);
    if (!ex || !w || w < 0.5) continue;
    if (!ex.extra) continue; // suggestions are moves that are not already scheduled in the PDF plan
    if (planExerciseIds.has(id)) continue;
    list.push({
      exerciseId: id,
      name: ex.name,
      weight: w,
      role: roleOf(w),
      back: ex.back ?? "neutral",
      backNote: ex.backNote,
      equipment: ex.equipment,
      inPlan: false,
    });
  }
  const rank = { friendly: 0, neutral: 1, caution: 2 } as const;
  list.sort((a, b) => rank[a.back] - rank[b.back] || b.weight - a.weight || a.name.localeCompare(b.name));
  return list.slice(0, limit);
}

import { exercises } from "./exercises";
function EXERCISE_IDS(): string[] {
  return exercises.map((e) => e.id);
}

export function planExerciseIdSet(plan: PlanVersion): Set<string> {
  const set = new Set<string>();
  for (const day of plan.days)
    for (const slot of day.slots) {
      set.add(slot.exerciseId);
      for (const alt of slot.alternatives) set.add(alt.exerciseId);
    }
  return set;
}

export function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1).replace(/\.0$/, "");
}
