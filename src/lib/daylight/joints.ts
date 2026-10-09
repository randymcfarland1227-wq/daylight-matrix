import { exerciseById } from "./exercises";
import { PT_REFERENCES } from "./plan";
import { regionInfo, resolveMuscle, subsOf, type RegionId } from "./muscles";
import type { JointLog, Observation, PlanVersion } from "./types";

export type JointId = "neck" | "shoulder" | "elbow" | "wrist" | "tspine" | "lumbar" | "si" | "hip" | "knee" | "ankle";
/** A point on the 300 x 600 map. `pair` draws it on both sides (mirrored about x = 150). */
export type JointPoint = { x: number; y: number; pair?: boolean };
export type JointInfo = {
  id: JointId;
  name: string;
  blurb: string;
  regions: RegionId[];
  front?: JointPoint;
  back?: JointPoint;
};

/** Major joints and the muscles that move or protect them. Positions match the MapFigure silhouette. */
export const JOINTS: JointInfo[] = [
  { id: "neck", name: "Neck", blurb: "Cervical spine. Upper traps and the deep neck muscles hold the head.", regions: ["rg-traps"], front: { x: 150, y: 92 }, back: { x: 150, y: 92 } },
  { id: "shoulder", name: "Shoulders", blurb: "Ball-and-socket joint held by the rotator cuff and delts.", regions: ["rg-delt-front", "rg-delt-side", "rg-delt-rear", "rg-chest", "rg-traps"], front: { x: 98, y: 128, pair: true }, back: { x: 98, y: 128, pair: true } },
  { id: "elbow", name: "Elbows", blurb: "Hinge joint between upper arm and forearm.", regions: ["rg-biceps", "rg-triceps", "rg-forearms"], front: { x: 78, y: 212, pair: true }, back: { x: 78, y: 212, pair: true } },
  { id: "wrist", name: "Wrists", blurb: "Grip and pressing load passes through here.", regions: ["rg-forearms"], front: { x: 60, y: 286, pair: true }, back: { x: 60, y: 286, pair: true } },
  { id: "tspine", name: "Upper back (thoracic)", blurb: "Mid-spine rotation and extension; shoulder-blade control.", regions: ["rg-midback", "rg-lats", "rg-traps"], back: { x: 150, y: 175 } },
  { id: "lumbar", name: "Lower back (lumbar)", blurb: "Low spine. Bracing and hip hinge control protect it.", regions: ["rg-lowback", "rg-abs", "rg-obliques", "rg-glutes"], back: { x: 150, y: 248 } },
  { id: "si", name: "SI joints", blurb: "Where the spine meets the pelvis. Glutes and core stabilise it.", regions: ["rg-glutes", "rg-lowback"], back: { x: 138, y: 290, pair: true } },
  { id: "hip", name: "Hips", blurb: "Ball-and-socket joint moved by glutes, hip flexors and adductors.", regions: ["rg-glutes", "rg-adductors", "rg-quads", "rg-hamstrings"], front: { x: 118, y: 306, pair: true }, back: { x: 116, y: 318, pair: true } },
  { id: "knee", name: "Knees", blurb: "Hinge joint driven by quads and hamstrings.", regions: ["rg-quads", "rg-hamstrings", "rg-calves"], front: { x: 118, y: 418, pair: true }, back: { x: 118, y: 418, pair: true } },
  { id: "ankle", name: "Ankles", blurb: "Calves and shins control balance and push-off.", regions: ["rg-calves"], front: { x: 122, y: 548, pair: true }, back: { x: 122, y: 548, pair: true } },
];
export const JOINT_BY_ID = new Map(JOINTS.map((j) => [j.id, j]));
export const jointName = (id: string) => JOINT_BY_ID.get(id as JointId)?.name ?? id;

/** Does a muscle id (any level, legacy too) belong to one of these regions? */
function touches(muscle: string, regions: RegionId[]): boolean {
  const c = resolveMuscle(muscle);
  if (!c) return false;
  return regions.some((r) => {
    if (c.id === r) return true;
    const parts = subsOf(r);
    if (c.sub) return parts.includes(c.sub);
    return c.id === c.group && regionInfo(r)?.group === c.group;
  });
}

export type JointMove = { exerciseId: string; name: string; source: "pt" | "plan"; detail: string };

/** PT board moves and warm-up / mobility / PT slots in the current plan that work the joint's muscles. */
export function jointMoves(joint: JointInfo, plan: PlanVersion): JointMove[] {
  const out = new Map<string, JointMove>();
  const hits = (id: string) => {
    const ex = exerciseById(id);
    return ex ? Object.keys(ex.muscles ?? {}).some((m) => touches(m, joint.regions)) : false;
  };
  for (const ref of PT_REFERENCES) {
    if (hits(ref.exerciseId)) out.set(ref.exerciseId, { exerciseId: ref.exerciseId, name: exerciseById(ref.exerciseId)?.name ?? ref.exerciseId, source: "pt", detail: ref.parameters.replace(/^Board says: [^.]*\. /, "") });
  }
  for (const day of plan.days) {
    for (const slot of day.slots) {
      if (!["activation", "mobility", "pt"].includes(slot.section) || out.has(slot.exerciseId) || !hits(slot.exerciseId)) continue;
      out.set(slot.exerciseId, { exerciseId: slot.exerciseId, name: exerciseById(slot.exerciseId)?.name ?? slot.exerciseId, source: "plan", detail: `${slot.sets ?? ""}${slot.sets ? " × " : ""}${slot.repLabel}`.trim() });
    }
  }
  return [...out.values()];
}

export function jointNotes(observations: Observation[], id: string): Observation[] {
  return observations.filter((o) => o.context.jointId === id).sort((a, b) => `${b.context.date}${b.context.time}`.localeCompare(`${a.context.date}${a.context.time}`));
}

/** Average logged level over the last `days` days (null when nothing logged). Drives the light heat display. */
export function jointHeat(logs: JointLog[], id: string, today: string, days = 14): number | null {
  const from = new Date(`${today}T12:00:00`);
  from.setDate(from.getDate() - (days - 1));
  const start = from.toISOString().slice(0, 10);
  const hits = logs.filter((l) => l.jointId === id && l.date >= start && l.date <= today);
  if (!hits.length) return null;
  return hits.reduce((s, l) => s + l.level, 0) / hits.length;
}

export function heatTone(level: number | null): "none" | "ok" | "mild" | "high" {
  if (level == null) return "none";
  if (level < 2) return "ok";
  if (level < 5) return "mild";
  return "high";
}
