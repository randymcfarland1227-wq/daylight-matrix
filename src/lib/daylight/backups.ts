import type { Alternative, Prescription } from "./types";

/** Ranked backups carry a match %; plain either/or plan options don't. */
export const isBackup = (a: Alternative): boolean => typeof a.match === "number";

/** The plan's own "this or that" options (no match %). */
export function eitherOrOf(slot: Prescription): Alternative[] {
  return slot.alternatives.filter((a) => !isBackup(a));
}

/** Ranked backups for a slot, highest match first. */
export function backupsOf(slot: Prescription): Alternative[] {
  return slot.alternatives.filter(isBackup).sort((a, b) => (b.match ?? 0) - (a.match ?? 0));
}

/** Match % for a move in this slot, or undefined for the plan move / either-or options. */
export function matchOf(slot: Prescription, exerciseId: string): number | undefined {
  return slot.alternatives.find((a) => a.exerciseId === exerciseId)?.match;
}

/** Plan move plus its either/or options; backups left out (for volume, digests, lessons and "in plan" lists). */
export function plannedIds(slot: Prescription): string[] {
  return [slot.exerciseId, ...eitherOrOf(slot).map((a) => a.exerciseId)];
}
