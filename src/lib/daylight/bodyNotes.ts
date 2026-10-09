import {
  GROUPS,
  OLD_REGION_TO_MUSCLE,
  REGIONS,
  subsOf,
  isGroup,
  isRegion,
  isSub,
  regionOfSub,
  resolveMuscle,
  type RegionId,
} from "./muscles";
import type { Observation } from "./types";

/** Where a note sits on the figure: its region (the pin), or the first region of its group when it was attached to a whole group. */
export function noteRegion(n: Pick<Observation, "context">): RegionId | null {
  const raw =
    n.context.muscleId ??
    (n.context.regionId
      ? (OLD_REGION_TO_MUSCLE[n.context.regionId] ?? n.context.regionId)
      : undefined);
  if (!raw) return null;
  const c = resolveMuscle(raw);
  if (!c) return null;
  const id = c.id;
  if (isRegion(id)) return id;
  if (isSub(id)) return regionOfSub(id).id;
  if (c.sub) return regionOfSub(c.sub).id;
  if (isGroup(id) || c.group) {
    const g = isGroup(id) ? id : c.group;
    return REGIONS.find((r) => r.group === g)?.id ?? null;
  }
  return null;
}

/** All notes that are attached to a muscle, newest first, and the pin counts per region. */
export function bodyNotes(observations: Observation[]): {
  list: (Observation & { region: RegionId })[];
  pins: Record<string, number>;
} {
  const list: (Observation & { region: RegionId })[] = [];
  const pins: Record<string, number> = {};
  for (const o of observations) {
    const region = noteRegion(o);
    if (!region) continue;
    list.push({ ...o, region });
    pins[region] = (pins[region] ?? 0) + 1;
  }
  list.sort((a, b) =>
    `${b.context.date ?? ""}${b.context.time ?? ""}${b.createdAt ?? ""}`.localeCompare(
      `${a.context.date ?? ""}${a.context.time ?? ""}${a.createdAt ?? ""}`,
    ),
  );
  return { list, pins };
}

export const GROUP_NAMES = Object.fromEntries(GROUPS.map((g) => [g.id, g.name]));

/** Canonical area, including old backups. A group note stays a group note. */
export function noteArea(n: Pick<Observation, "context">): string | null {
  const raw =
    n.context.muscleId ??
    (n.context.regionId
      ? (OLD_REGION_TO_MUSCLE[n.context.regionId] ?? n.context.regionId)
      : undefined);
  if (!raw) return null;
  const c = resolveMuscle(raw);
  return c ? (isGroup(c.id) || isRegion(c.id) || isSub(c.id) ? c.id : (c.sub ?? c.group)) : null;
}

/** An area includes its smaller parts, never adjacent areas or a broader parent note. */
export function observationsForArea(
  observations: Observation[],
  area?: string | null,
  date?: string,
) {
  const parts = new Set(area ? subsOf(area) : []);
  return observations
    .filter((o) => {
      const id = noteArea(o);
      if (!id || (date && o.context.date !== date)) return false;
      if (!area || id === area) return true;
      const child = subsOf(id);
      return child.length > 0 && child.every((p) => parts.has(p));
    })
    .sort((a, b) =>
      `${b.context.date}${b.context.time}${b.createdAt}`.localeCompare(
        `${a.context.date}${a.context.time}${a.createdAt}`,
      ),
    );
}
