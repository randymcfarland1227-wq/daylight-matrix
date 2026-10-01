import { shiftDate } from "./dates";
import { exerciseById, volumeFactorFor } from "./exercises";
import { MUSCLE_IDS, type MuscleId } from "./muscles";
import { dayBlocks } from "./plan";
import type { DayTemplate, PlanVersion, Prescription, WorkoutSession } from "./types";

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
  id: MuscleId;
  /** Weighted sets (primary 1, secondary 0.5, minor 0.25 and the exercise’s own volume factor). */
  effective: number;
  /** Sets where the muscle is a primary mover. */
  direct: number;
  /** Sets where the muscle only helps. */
  indirect: number;
  hits: MuscleHit[];
};

export type VolumeMap = Record<MuscleId, MuscleVolume>;

export function roleOf(weight: number): "primary" | "secondary" | "minor" {
  return weight >= 1 ? "primary" : weight >= 0.5 ? "secondary" : "minor";
}

function emptyMap(): VolumeMap {
  const map = {} as VolumeMap;
  for (const id of MUSCLE_IDS) map[id] = { id, effective: 0, direct: 0, indirect: 0, hits: [] };
  return map;
}

function addHit(map: VolumeMap, exerciseId: string, sets: number, day: number | null, alt = false) {
  const ex = exerciseById(exerciseId);
  if (!ex?.muscles || sets <= 0) return;
  const factor = volumeFactorFor(ex);
  for (const [mid, weight] of Object.entries(ex.muscles) as [MuscleId, number][]) {
    const cell = map[mid];
    if (!cell) continue;
    if (!alt) {
      cell.effective += sets * weight * factor;
      if (weight >= 1) cell.direct += sets * factor;
      else cell.indirect += sets * factor;
    }
    let hit = cell.hits.find((h) => h.exerciseId === exerciseId);
    if (!hit) {
      hit = { exerciseId, name: ex.name, weight, role: roleOf(weight), sets: 0, days: [], alt };
      cell.hits.push(hit);
    }
    if (!alt) hit.alt = false;
    if (!alt) hit.sets += sets;
    if (day != null && !hit.days.includes(day)) hit.days.push(day);
  }
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
  }
  sortHits(map);
  return { map, totalSets };
}

export type CoverageStatus = "none" | "indirect" | "low" | "ok" | "high";

export const STATUS_LABEL: Record<CoverageStatus, string> = {
  none: "Not trained",
  indirect: "Only indirect work",
  low: "Light",
  ok: "Solid",
  high: "High",
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

/** Heat source: logged volume in the window; falls back to the plan when nothing is logged in it. */
export function heatSnapshot(sessions: WorkoutSession[], plan: PlanVersion, days: 7 | 14 | 30, today: string): HeatSnapshot {
  const logged = loggedVolume(sessions, windowFor(days, today));
  if (logged.totalSets > 0) {
    return { map: logged.map, source: "logged", windowDays: days, weeklyFactor: days / 7, totalSets: logged.totalSets };
  }
  return { map: plannedVolume(plan), source: "planned", windowDays: 7, weeklyFactor: 1, totalSets: 0 };
}

export function dayMuscles(day: DayTemplate): { id: MuscleId; weight: number }[] {
  const totals: Partial<Record<MuscleId, number>> = {};
  for (const slot of day.slots) {
    if (slot.optional) continue;
    const ex = exerciseById(slot.exerciseId);
    if (!ex?.muscles || volumeFactorFor(ex) === 0) continue;
    for (const [id, w] of Object.entries(ex.muscles) as [MuscleId, number][]) totals[id] = Math.max(totals[id] ?? 0, w);
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
export function suggestionsFor(muscle: MuscleId, planExerciseIds: Set<string>, limit = 8): Suggestion[] {
  const list: Suggestion[] = [];
  const ids = new Set<string>();
  for (const id of EXERCISE_IDS()) ids.add(id);
  for (const id of ids) {
    const ex = exerciseById(id);
    const w = ex?.muscles?.[muscle];
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
