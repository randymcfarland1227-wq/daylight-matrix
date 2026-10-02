/**
 * Muscle model, two levels:
 *   GROUP  (Chest, Shoulders, Back, Arms, Core, Glutes, Quads, Inner thigh, Hamstrings, Calves & shins)
 *   SUB    (e.g. Upper chest, Rear delt, Biceps long head, Vastus lateralis...)
 * Volume is tracked for both. A group's value for a move is the largest sub-part weight in that group.
 * Legacy v2 ids (22 flat groups) are still resolved so old notes keep working.
 */
export type GroupId = "chest" | "shoulders" | "back" | "arms" | "core" | "glutes" | "quads" | "adductors" | "hamstrings" | "calves";

export type SubId =
  | "chest-clav" | "chest-sternal" | "chest-lower" | "serratus"
  | "delt-front" | "delt-side" | "delt-rear" | "rotator-cuff"
  | "traps-upper" | "rhomboids" | "traps-lower" | "lats" | "erectors"
  | "biceps-long" | "biceps-short" | "brachialis" | "triceps-long" | "triceps-lateral" | "triceps-medial" | "forearm-flexors" | "forearm-extensors"
  | "abs-upper" | "abs-lower" | "obliques" | "transverse"
  | "glute-max" | "glute-med" | "glute-min"
  | "quad-rf" | "quad-vl" | "quad-vm" | "quad-vi"
  | "adductors-sub"
  | "ham-medial" | "ham-lateral"
  | "gastroc" | "soleus" | "tibialis";

/** Everything the volume engine, body map and notes can refer to. */
export type MuscleId = GroupId | SubId;

/**
 * Middle level, used by the "Standard" body map (like the big named areas on a muscle chart):
 * Chest, Front delts, Traps, Biceps, Forearms, Abs, Obliques, Quads, Inner thigh, Calves, Lats, Mid-back,
 * Lower back, Rear delts, Triceps, Glutes, Hamstrings. Each region is a fixed set of sub-parts of ONE group.
 */
export type RegionId =
  | "rg-chest" | "rg-delt-front" | "rg-traps" | "rg-biceps" | "rg-forearms" | "rg-abs" | "rg-obliques"
  | "rg-delt-side" | "rg-quads" | "rg-adductors" | "rg-calves"
  | "rg-lats" | "rg-midback" | "rg-lowback" | "rg-delt-rear" | "rg-triceps" | "rg-glutes" | "rg-hamstrings";

/** Anything the map, volume engine and muscle pages can point at. */
export type AnyMuscleId = MuscleId | RegionId;

export type View = "front" | "back";
export type GroupInfo = { id: GroupId; name: string; blurb: string; subs: SubId[]; views: View[] };
export type SubInfo = { id: SubId; group: GroupId; name: string; blurb: string; views: View[]; deep?: boolean };

export const GROUPS: GroupInfo[] = [
  { id: "chest", name: "Chest", blurb: "Pectoralis major (three regions) and the serratus along the ribs.", subs: ["chest-clav", "chest-sternal", "chest-lower", "serratus"], views: ["front"] },
  { id: "shoulders", name: "Shoulders", blurb: "The three heads of the deltoid, plus the rotator cuff that steadies the joint.", subs: ["delt-front", "delt-side", "delt-rear", "rotator-cuff"], views: ["front", "back"] },
  { id: "back", name: "Back", blurb: "Lats, the muscles between and under the shoulder blades, the upper traps and the spinal erectors.", subs: ["lats", "rhomboids", "traps-lower", "traps-upper", "erectors"], views: ["back"] },
  { id: "arms", name: "Arms", blurb: "Biceps, brachialis, triceps and forearms.", subs: ["biceps-long", "biceps-short", "brachialis", "triceps-long", "triceps-lateral", "triceps-medial", "forearm-flexors", "forearm-extensors"], views: ["front", "back"] },
  { id: "core", name: "Core", blurb: "Rectus abdominis, obliques and the deep transverse abdominis.", subs: ["abs-upper", "abs-lower", "obliques", "transverse"], views: ["front"] },
  { id: "glutes", name: "Glutes", blurb: "Gluteus maximus, medius and minimus.", subs: ["glute-max", "glute-med", "glute-min"], views: ["back"] },
  { id: "quads", name: "Quads", blurb: "The four heads of the quadriceps.", subs: ["quad-rf", "quad-vl", "quad-vm", "quad-vi"], views: ["front"] },
  { id: "adductors", name: "Inner thigh", blurb: "The adductor group.", subs: ["adductors-sub"], views: ["front"] },
  { id: "hamstrings", name: "Hamstrings", blurb: "Inner (semitendinosus / semimembranosus) and outer (biceps femoris) hamstrings.", subs: ["ham-medial", "ham-lateral"], views: ["back"] },
  { id: "calves", name: "Calves & shins", blurb: "Gastrocnemius, soleus and the tibialis anterior on the shin.", subs: ["gastroc", "soleus", "tibialis"], views: ["front", "back"] },
];

export type RegionInfo = { id: RegionId; name: string; group: GroupId; subs: SubId[]; views: View[]; blurb: string };

export const REGIONS: RegionInfo[] = [
  { id: "rg-chest", name: "Chest", group: "chest", subs: ["chest-clav", "chest-sternal", "chest-lower", "serratus"], views: ["front"], blurb: "Pectoralis major and the serratus on the ribs." },
  { id: "rg-delt-front", name: "Front delts", group: "shoulders", subs: ["delt-front"], views: ["front"], blurb: "The front head of the shoulder. Every press helps it." },
  { id: "rg-delt-side", name: "Side delts", group: "shoulders", subs: ["delt-side"], views: ["front", "back"], blurb: "The outer head of the shoulder. Lateral raises are the direct move." },
  { id: "rg-traps", name: "Traps", group: "back", subs: ["traps-upper"], views: ["front", "back"], blurb: "The slope from neck to shoulder." },
  { id: "rg-biceps", name: "Biceps & brachialis", group: "arms", subs: ["biceps-long", "biceps-short", "brachialis"], views: ["front"], blurb: "Front of the upper arm." },
  { id: "rg-forearms", name: "Forearms", group: "arms", subs: ["forearm-flexors", "forearm-extensors"], views: ["front", "back"], blurb: "Grip and wrist muscles." },
  { id: "rg-abs", name: "Abs", group: "core", subs: ["abs-upper", "abs-lower", "transverse"], views: ["front"], blurb: "Rectus abdominis and the deep transverse abdominis." },
  { id: "rg-obliques", name: "Obliques", group: "core", subs: ["obliques"], views: ["front"], blurb: "The sides of the trunk." },
  { id: "rg-quads", name: "Quads", group: "quads", subs: ["quad-rf", "quad-vl", "quad-vm", "quad-vi"], views: ["front"], blurb: "The four heads of the front thigh." },
  { id: "rg-adductors", name: "Inner thigh", group: "adductors", subs: ["adductors-sub"], views: ["front"], blurb: "The adductors." },
  { id: "rg-calves", name: "Calves & shins", group: "calves", subs: ["gastroc", "soleus", "tibialis"], views: ["front", "back"], blurb: "Gastrocnemius, soleus and tibialis anterior." },
  { id: "rg-lats", name: "Lats", group: "back", subs: ["lats"], views: ["back"], blurb: "The wide muscle down the side of the back." },
  { id: "rg-midback", name: "Mid-back", group: "back", subs: ["rhomboids", "traps-lower"], views: ["back"], blurb: "Rhomboids and the middle and lower traps between the shoulder blades." },
  { id: "rg-lowback", name: "Lower back", group: "back", subs: ["erectors"], views: ["back"], blurb: "The spinal erectors." },
  { id: "rg-delt-rear", name: "Rear delts & cuff", group: "shoulders", subs: ["delt-rear", "rotator-cuff"], views: ["back"], blurb: "The back of the shoulder and the rotator cuff." },
  { id: "rg-triceps", name: "Triceps", group: "arms", subs: ["triceps-long", "triceps-lateral", "triceps-medial"], views: ["back"], blurb: "Back of the upper arm." },
  { id: "rg-glutes", name: "Glutes", group: "glutes", subs: ["glute-max", "glute-med", "glute-min"], views: ["back"], blurb: "Gluteus maximus, medius and minimus." },
  { id: "rg-hamstrings", name: "Hamstrings", group: "hamstrings", subs: ["ham-medial", "ham-lateral"], views: ["back"], blurb: "Back of the thigh." },
];
export const REGION_IDS = REGIONS.map((r) => r.id) as RegionId[];
const REGION_BY_ID = new Map<string, RegionInfo>(REGIONS.map((r) => [r.id, r]));
const REGION_OF_SUB = new Map<string, RegionInfo>(REGIONS.flatMap((r) => r.subs.map((s) => [s, r] as const)));
export function isRegion(id: string): id is RegionId {
  return REGION_BY_ID.has(id);
}
export function regionInfo(id: string): RegionInfo | undefined {
  return REGION_BY_ID.get(id);
}
export function regionOfSub(id: SubId): RegionInfo {
  return REGION_OF_SUB.get(id)!;
}

export const SUBS: SubInfo[] = [
  { id: "chest-clav", group: "chest", name: "Upper chest (clavicular)", blurb: "Collarbone side of the pec. Works hardest on incline presses and low-to-high flys.", views: ["front"] },
  { id: "chest-sternal", group: "chest", name: "Mid chest (sternal)", blurb: "The main body of the pec. Flat presses, push-ups, flys.", views: ["front"] },
  { id: "chest-lower", group: "chest", name: "Lower chest", blurb: "Lower fibres of the pec. Dips and high-to-low presses and flys.", views: ["front"] },
  { id: "serratus", group: "chest", name: "Serratus (side ribs)", blurb: "Finger-like muscle on the ribs that holds the shoulder blade against the ribcage. Push-ups with a full reach, landmine presses.", views: ["front"] },
  { id: "delt-front", group: "shoulders", name: "Front delt", blurb: "Front of the shoulder. Gets help from every press.", views: ["front"] },
  { id: "delt-side", group: "shoulders", name: "Side delt", blurb: "Outer shoulder. Lateral raises are the direct move.", views: ["front", "back"] },
  { id: "delt-rear", group: "shoulders", name: "Rear delt", blurb: "Back of the shoulder. Reverse flys, face pulls, rows.", views: ["back"] },
  { id: "rotator-cuff", group: "shoulders", name: "Rotator cuff", blurb: "Small muscles that steady the shoulder joint. External-rotation work.", views: ["back"] },
  { id: "traps-upper", group: "back", name: "Upper traps", blurb: "The slope from neck to shoulder. Shrugs and carries.", views: ["back", "front"] },
  { id: "rhomboids", group: "back", name: "Mid-back (rhomboids / mid traps)", blurb: "Between the shoulder blades. Rows and reverse flys pull the blades together here.", views: ["back"] },
  { id: "traps-lower", group: "back", name: "Lower traps", blurb: "Lower fibres of the trapezius. Y-raises and good scapular control.", views: ["back"] },
  { id: "lats", group: "back", name: "Lats", blurb: "The wide muscle down the side of the back. Pull-ups and pulldowns.", views: ["back"] },
  { id: "erectors", group: "back", name: "Spinal erectors", blurb: "Muscles either side of the spine. Hinges, back extensions, bird-dog.", views: ["back"] },
  { id: "biceps-long", group: "arms", name: "Biceps, long head", blurb: "Outer biceps. Favours curls with the arm behind the body (incline curl).", views: ["front"] },
  { id: "biceps-short", group: "arms", name: "Biceps, short head", blurb: "Inner biceps. Favours curls with the arm in front (preacher).", views: ["front"] },
  { id: "brachialis", group: "arms", name: "Brachialis", blurb: "Sits under the biceps. Works in every curl, most in hammer grips.", views: ["front"] },
  { id: "triceps-long", group: "arms", name: "Triceps, long head", blurb: "Inner-back of the arm; crosses the shoulder. Overhead extensions stretch it most.", views: ["back"] },
  { id: "triceps-lateral", group: "arms", name: "Triceps, lateral head", blurb: "Outer horseshoe. Pressdowns and pressing.", views: ["back"] },
  { id: "triceps-medial", group: "arms", name: "Triceps, medial head", blurb: "Lower, deeper triceps. Works in all elbow extension.", views: ["back"] },
  { id: "forearm-flexors", group: "arms", name: "Forearm flexors (grip)", blurb: "Palm side of the forearm. Grip, carries, rows.", views: ["front"] },
  { id: "forearm-extensors", group: "arms", name: "Forearm extensors", blurb: "Top of the forearm including brachioradialis. Hammer curls, reverse grips.", views: ["front", "back"] },
  { id: "abs-upper", group: "core", name: "Upper abs", blurb: "Upper rectus abdominis. Cable crunches, sit-up style curls.", views: ["front"] },
  { id: "abs-lower", group: "core", name: "Lower abs", blurb: "Lower rectus. Reverse crunches and posterior-tilt work.", views: ["front"] },
  { id: "obliques", group: "core", name: "Obliques", blurb: "Sides of the trunk. They resist twisting in carries and Pallof holds.", views: ["front"] },
  { id: "transverse", group: "core", name: "Transverse abdominis", blurb: "The deep corset muscle. Bracing and exhale-based work like dead bugs.", views: ["front"], deep: true },
  { id: "glute-max", group: "glutes", name: "Glute max", blurb: "The big hip extensor. Thrusts, hinges, lunges, step-ups.", views: ["back"] },
  { id: "glute-med", group: "glutes", name: "Glute med", blurb: "Outer hip. Clamshells, band walks, hip abduction, single-leg work.", views: ["back"] },
  { id: "glute-min", group: "glutes", name: "Glute min", blurb: "Small, deep partner of the glute med.", views: ["back"], deep: true },
  { id: "quad-rf", group: "quads", name: "Rectus femoris", blurb: "Centre of the thigh; also crosses the hip. Leg extensions hit it directly.", views: ["front"] },
  { id: "quad-vl", group: "quads", name: "Vastus lateralis", blurb: "Outer quad. Squats, presses, lunges.", views: ["front"] },
  { id: "quad-vm", group: "quads", name: "Vastus medialis", blurb: "The teardrop above the inner knee. Deep knee bend and full-range extensions.", views: ["front"] },
  { id: "quad-vi", group: "quads", name: "Vastus intermedius", blurb: "Deep quad under the rectus femoris. Works in every knee extension.", views: ["front"], deep: true },
  { id: "adductors-sub", group: "adductors", name: "Adductors", blurb: "Inner thigh. Wide-stance squats and lunges help; the adductor machine hits them directly.", views: ["front"] },
  { id: "ham-medial", group: "hamstrings", name: "Inner hamstrings", blurb: "Semitendinosus and semimembranosus. Curls and hinges.", views: ["back"] },
  { id: "ham-lateral", group: "hamstrings", name: "Outer hamstrings", blurb: "Biceps femoris. Curls and hinges.", views: ["back"] },
  { id: "gastroc", group: "calves", name: "Gastrocnemius", blurb: "The visible calf bulge. Standing (straight-knee) raises.", views: ["back", "front"] },
  { id: "soleus", group: "calves", name: "Soleus", blurb: "Under the gastroc. Seated (bent-knee) raises.", views: ["back"] },
  { id: "tibialis", group: "calves", name: "Shin (tibialis anterior)", blurb: "Front of the lower leg. Toe raises.", views: ["front"] },
];

export const SUB_IDS = SUBS.map((s) => s.id) as SubId[];
export const GROUP_IDS = GROUPS.map((g) => g.id) as GroupId[];
export const MUSCLE_IDS = [...GROUP_IDS, ...SUB_IDS] as MuscleId[];

const SUB_BY_ID = new Map<string, SubInfo>(SUBS.map((s) => [s.id, s]));
const GROUP_BY_ID = new Map<string, GroupInfo>(GROUPS.map((g) => [g.id, g]));

export function isGroup(id: string): id is GroupId {
  return GROUP_BY_ID.has(id);
}
export function isSub(id: string): id is SubId {
  return SUB_BY_ID.has(id);
}
export function subInfo(id: string): SubInfo | undefined {
  return SUB_BY_ID.get(id);
}
export function groupInfo(id: string): GroupInfo | undefined {
  return GROUP_BY_ID.get(id);
}
export function groupOfSub(id: SubId): GroupId {
  return SUB_BY_ID.get(id)!.group;
}

/** Legacy ids from the first overhaul (flat 22-muscle model). Kept so stored notes still resolve. */
export const LEGACY_MUSCLE: Record<string, { name: string; group: GroupId; sub?: SubId }> = {
  "chest-upper": { name: "Upper chest", group: "chest", sub: "chest-clav" },
  chest: { name: "Chest", group: "chest" },
  "delt-front": { name: "Front delts", group: "shoulders", sub: "delt-front" },
  "delt-side": { name: "Side delts", group: "shoulders", sub: "delt-side" },
  "delt-rear": { name: "Rear delts", group: "shoulders", sub: "delt-rear" },
  biceps: { name: "Biceps", group: "arms", sub: "biceps-long" },
  triceps: { name: "Triceps", group: "arms", sub: "triceps-lateral" },
  forearms: { name: "Forearms / grip", group: "arms", sub: "forearm-flexors" },
  traps: { name: "Upper traps", group: "back", sub: "traps-upper" },
  "mid-back": { name: "Mid-back / lower traps", group: "back", sub: "rhomboids" },
  lats: { name: "Lats", group: "back", sub: "lats" },
  "lower-back": { name: "Lower back (erectors)", group: "back", sub: "erectors" },
  "rotator-cuff": { name: "Rotator cuff", group: "shoulders", sub: "rotator-cuff" },
  abs: { name: "Abs", group: "core", sub: "abs-upper" },
  obliques: { name: "Obliques", group: "core", sub: "obliques" },
  glutes: { name: "Glutes", group: "glutes", sub: "glute-max" },
  "glute-med": { name: "Glute med / hip abductors", group: "glutes", sub: "glute-med" },
  adductors: { name: "Adductors (inner thigh)", group: "adductors", sub: "adductors-sub" },
  quads: { name: "Quads", group: "quads", sub: "quad-vl" },
  hamstrings: { name: "Hamstrings", group: "hamstrings", sub: "ham-medial" },
  calves: { name: "Calves", group: "calves", sub: "gastroc" },
  tibialis: { name: "Shins (tibialis)", group: "calves", sub: "tibialis" },
};

/**
 * Resolve any stored muscle id (new group, new sub, or legacy v2/v1) to a display name + group.
 * Group ids that were also legacy ids (chest, adductors) resolve as groups.
 */
export function resolveMuscle(id: string): { id: string; name: string; group: GroupId; sub?: SubId } | null {
  const group = GROUP_BY_ID.get(id);
  if (group) return { id, name: group.name, group: group.id };
  const reg = REGION_BY_ID.get(id);
  if (reg) return { id, name: reg.name, group: reg.group };
  const sub = SUB_BY_ID.get(id);
  if (sub) return { id, name: sub.name, group: sub.group, sub: sub.id };
  const legacy = LEGACY_MUSCLE[id];
  if (legacy) return { id, name: legacy.name, group: legacy.group, sub: legacy.sub };
  return null;
}

export function muscleName(id: string): string {
  return resolveMuscle(id)?.name ?? id;
}
export function muscleGroupOf(id: string): GroupId | null {
  return resolveMuscle(id)?.group ?? null;
}

export type MuscleInfo = { id: string; name: string; blurb: string; views: View[]; group?: GroupId };
export const MUSCLES: SubInfo[] = SUBS;
export function muscleInfo(id: string): MuscleInfo | undefined {
  const g = GROUP_BY_ID.get(id);
  if (g) return g;
  const r = REGION_BY_ID.get(id);
  if (r) return r;
  const s = SUB_BY_ID.get(id);
  if (s) return s;
  const l = LEGACY_MUSCLE[id];
  return l ? { id, name: l.name, blurb: "", views: ["front", "back"], group: l.group } : undefined;
}

/** Old 24-region map ids (the very first build) -> current ids. Used by the data migration. */
export const OLD_REGION_TO_MUSCLE: Record<string, string> = {
  chest: "chest",
  "shoulder-front-left": "delt-front",
  "shoulder-front-right": "delt-front",
  "biceps-left": "biceps-long",
  "biceps-right": "biceps-long",
  abs: "abs-upper",
  "oblique-left": "obliques",
  "oblique-right": "obliques",
  "quad-left": "quads",
  "quad-right": "quads",
  "calf-front-left": "tibialis",
  "calf-front-right": "tibialis",
  traps: "traps-upper",
  "rear-delt-left": "delt-rear",
  "rear-delt-right": "delt-rear",
  "lat-left": "lats",
  "lat-right": "lats",
  "lower-back": "erectors",
  "glute-left": "glute-max",
  "glute-right": "glute-max",
  "ham-left": "hamstrings",
  "ham-right": "hamstrings",
  "calf-left": "calves",
  "calf-right": "calves",
};

/** Weekly weighted-set target for a level. Sub-parts get a lighter bar than whole groups. */
export function targetFor(id: string, weeklyTarget: number): number {
  if (isGroup(id)) return weeklyTarget;
  if (isRegion(id)) return Math.max(2, Math.round(weeklyTarget * 0.8));
  return Math.max(2, Math.round(weeklyTarget * 0.6));
}

/** The sub-parts an id stands for: a group's parts, a region's parts, or the sub-part itself (legacy ids resolve first). */
export function subsOf(id: string): SubId[] {
  const g = GROUP_BY_ID.get(id);
  if (g) return g.subs;
  const r = REGION_BY_ID.get(id);
  if (r) return r.subs;
  if (SUB_BY_ID.has(id)) return [id as SubId];
  const l = LEGACY_MUSCLE[id];
  if (l?.sub) return [l.sub];
  if (l) return GROUP_BY_ID.get(l.group)?.subs ?? [];
  return [];
}
