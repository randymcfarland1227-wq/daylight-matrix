import { exerciseById } from "./exercises";
import { groupInfo, groupOfSub, subInfo, type SubId } from "./muscles";

/**
 * Reference metadata per exercise, shown on the exercise page like a muscle-chart reference
 * (Difficulty, Force, Mechanic, Equipment, Grip). General education written for this app - an editorial
 * classification, not a standard and not from the PDF.
 */
export type Difficulty = "Beginner" | "Novice" | "Intermediate" | "Advanced";
export type Meta = { difficulty: Difficulty; force: string; mechanic: string; grip: string };

const B: Difficulty = "Beginner";
const N: Difficulty = "Novice";
const I: Difficulty = "Intermediate";
const A: Difficulty = "Advanced";
const m = (difficulty: Difficulty, force: string, mechanic: string, grip: string): Meta => ({ difficulty, force, mechanic, grip });
const NONE = "None (no grip)";

const META: Record<string, Meta> = {
  ppt: m(B, "Hold", "Isolation", NONE),
  "pt-shoulder-flexion": m(B, "Hold", "Isolation", NONE),
  "bird-dog": m(B, "Hold", "Isolation", "Palms flat"),
  "bird-dog-hold": m(B, "Hold", "Isolation", "Palms flat"),
  "bracing-marches": m(B, "Hold", "Isolation", NONE),
  "dead-bug": m(B, "Hold", "Isolation", NONE),
  clamshell: m(B, "Pull", "Isolation", NONE),
  "band-walks": m(B, "Push", "Isolation", NONE),
  "single-leg-stand": m(B, "Hold", "Isometric", NONE),
  "seated-pigeon": m(B, "Stretch", "Mobility", NONE),
  "suitcase-carry": m(N, "Carry", "Compound", "Neutral (one hand)"),
  plank: m(B, "Hold", "Isometric", "Forearms down"),
  "side-plank": m(N, "Hold", "Isometric", "Forearm down"),
  pallof: m(B, "Hold", "Isometric", "Both hands, handle"),
  "mobility-flow": m(B, "Stretch", "Mobility", NONE),
  zone2: m(B, "Cardio", "Cardio", NONE),
  "tuesday-cardio": m(B, "Cardio", "Cardio", NONE),
  "wednesday-cardio": m(B, "Cardio", "Cardio", NONE),
  "saturday-cardio": m(B, "Cardio", "Cardio", NONE),
  "battle-rope-squat": m(I, "Squat", "Compound", "Handles / rope ends"),
  "assisted-pullup": m(N, "Pull", "Compound", "Overhand"),
  "neutral-pullup": m(I, "Pull", "Compound", "Neutral"),
  "chest-supported-row": m(B, "Pull", "Compound", "Neutral / overhand"),
  "half-kneeling-pulldown": m(N, "Pull", "Compound", "Single handle"),
  "face-pull": m(N, "Pull", "Isolation", "Rope, neutral"),
  "incline-shrug": m(B, "Pull", "Isolation", "Neutral (dumbbells)"),
  "straight-arm-pulldown": m(N, "Pull", "Isolation", "Rope, neutral"),
  "reverse-crunch": m(N, "Pull", "Isolation", NONE),
  "cable-crunch": m(N, "Pull", "Isolation", "Rope behind head"),
  "hack-squat": m(N, "Squat", "Compound", "Machine handles"),
  "heel-elevated-goblet": m(N, "Squat", "Compound", "Both hands at chest"),
  "bulgarian-split-squat": m(I, "Squat", "Compound", "Neutral (dumbbells)"),
  "leg-press": m(B, "Push", "Compound", "Machine handles"),
  "leg-press-seated": m(B, "Push", "Compound", "Machine handles"),
  "leg-extension": m(B, "Push", "Isolation", "Machine handles"),
  "standing-calf-raise": m(B, "Push", "Isolation", "Machine handles"),
  "tibialis-raise": m(B, "Pull", "Isolation", NONE),
  "incline-db-press": m(N, "Push", "Compound", "Overhand / neutral"),
  "landmine-press": m(N, "Push", "Compound", "Single hand on bar end"),
  "machine-chest-press": m(B, "Push", "Compound", "Overhand"),
  "weighted-pushup": m(I, "Push", "Compound", "Hands flat"),
  "low-high-fly": m(N, "Push", "Isolation", "Neutral (handles)"),
  "cable-lateral-raise": m(N, "Pull", "Isolation", "Single handle"),
  "overhead-rope-triceps": m(N, "Push", "Isolation", "Rope, neutral"),
  "assisted-dip": m(N, "Push", "Compound", "Parallel handles"),
  "hip-thrust": m(N, "Hinge", "Compound", "Barbell, overhand"),
  "machine-hip-thrust": m(B, "Hinge", "Compound", "Machine handles"),
  "bstance-rdl": m(N, "Hinge", "Compound", "Overhand"),
  "leg-curl": m(B, "Pull", "Isolation", "Machine handles"),
  "lying-leg-curl": m(B, "Pull", "Isolation", "Machine handles"),
  "reverse-lunge": m(N, "Squat", "Compound", "Neutral (dumbbells)"),
  "box-step-up": m(B, "Squat", "Compound", "Neutral (dumbbells)"),
  "back-extension-45": m(N, "Hinge", "Compound", "Arms crossed or plate"),
  "cable-hip-abduction": m(N, "Push", "Isolation", "Hold the frame"),
  "seated-calf-raise": m(B, "Push", "Isolation", NONE),
  "shoulder-press": m(N, "Push", "Compound", "Overhand / neutral"),
  "machine-shoulder-press": m(B, "Push", "Compound", "Machine handles"),
  "btb-lateral-raise": m(I, "Pull", "Isolation", "Single handle"),
  "reverse-pec-deck": m(B, "Pull", "Isolation", "Neutral"),
  "y-raise": m(N, "Pull", "Isolation", "Thumbs up"),
  "scaption-raise": m(N, "Push", "Isolation", "Thumbs up"),
  "ez-curl": m(B, "Pull", "Isolation", "Underhand (angled)"),
  "incline-db-curl": m(N, "Pull", "Isolation", "Underhand"),
  "rope-pressdown": m(B, "Push", "Isolation", "Rope, neutral"),
  "cross-body-cable-ext": m(N, "Push", "Isolation", "Single handle"),
  "farmer-carry": m(B, "Carry", "Compound", "Neutral"),
  "adductor-machine": m(B, "Pull", "Isolation", "Machine handles"),
  "sumo-goblet": m(B, "Squat", "Compound", "Both hands at chest"),
  "pec-deck": m(B, "Push", "Isolation", "Neutral / handles"),
  "incline-machine-press": m(B, "Push", "Compound", "Overhand"),
  "high-low-fly": m(N, "Push", "Isolation", "Neutral (handles)"),
  "wrist-curl": m(B, "Pull", "Isolation", "Underhand"),
  "hammer-curl": m(B, "Pull", "Isolation", "Neutral"),
  "dead-hang": m(B, "Hold", "Isometric", "Overhand"),
  "band-pull-apart": m(B, "Pull", "Isolation", "Overhand"),
  "cable-external-rotation": m(N, "Pull", "Isolation", "Single handle"),
  "lat-pulldown": m(B, "Pull", "Compound", "Overhand / neutral"),
  "seated-cable-row": m(B, "Pull", "Compound", "Neutral"),
  "tbar-chest-supported": m(N, "Pull", "Compound", "Neutral"),
  "hanging-knee-raise": m(N, "Pull", "Isolation", "Forearm pads"),
  "cable-woodchop": m(I, "Rotate", "Compound", "Both hands"),
  "glute-bridge": m(B, "Hinge", "Compound", NONE),
  "cable-pull-through": m(N, "Hinge", "Compound", "Rope between legs"),
  "sl-glute-bridge": m(N, "Hinge", "Compound", NONE),
  "ball-leg-curl": m(I, "Pull", "Isolation", NONE),
  "nordic-curl": m(A, "Pull", "Isolation", NONE),
  "leg-press-narrow": m(B, "Push", "Compound", "Machine handles"),
  "wall-sit": m(B, "Hold", "Isometric", NONE),
  "sl-calf-raise-press": m(N, "Push", "Isolation", "Machine handles"),
  "skull-crusher": m(I, "Push", "Isolation", "Overhand (narrow)"),
  "close-grip-pushup": m(N, "Push", "Compound", "Hands narrow"),
  "preacher-curl": m(B, "Pull", "Isolation", "Underhand"),
  "cable-shrug": m(B, "Pull", "Isolation", "Neutral"),
  "machine-lateral-raise": m(B, "Pull", "Isolation", "Machine pads"),
  "cable-front-raise": m(N, "Pull", "Isolation", "Overhand / rope"),
  "chest-supported-rear-fly": m(N, "Pull", "Isolation", "Neutral"),
  "side-lying-abduction": m(B, "Pull", "Isolation", NONE),
  pushup: m(B, "Push", "Compound", "Hands flat"),
  "reverse-hyper-light": m(I, "Hinge", "Compound", "Machine handles"),
  "lying-cable-pullover": m(N, "Pull", "Isolation", "Rope or straight bar, overhand"),
  "kneeling-cable-pullaround": m(N, "Pull", "Isolation", "Neutral, one hand"),
  "underhand-pulldown": m(N, "Pull", "Compound", "Underhand (palms toward you), shoulder-width"),
  "bench-db-row": m(N, "Pull", "Compound", "Neutral (palm in)"),
  "neutral-flat-db-press": m(N, "Push", "Compound", "Neutral (palms facing in)"),
  "cable-press-around": m(I, "Push", "Isolation", "Single handle, neutral"),
  "stir-the-pot": m(I, "Hold", "Isometric", "Forearms on the ball"),
  "side-lying-incline-lateral": m(N, "Push", "Isolation", "Neutral, light"),
  "lean-away-lateral": m(N, "Push", "Isolation", "Neutral, one hand"),
  "bayesian-curl": m(N, "Pull", "Isolation", "Underhand, one hand"),
  "spider-curl": m(N, "Pull", "Isolation", "Underhand"),
  "seated-db-overhead-tri": m(N, "Push", "Isolation", "Both hands cupping one dumbbell"),
  "smith-jm-press": m(I, "Push", "Compound", "Close overhand, about shoulder-width"),
  "reverse-cable-curl": m(N, "Pull", "Isolation", "Overhand (palms down)"),
  "fs3-easy-cardio": m(B, "Cardio", "Cardio", "None (no grip)"),
  "kb-foot-flex": m(B, "Hold", "Isolation", "Kettlebell resting on top of the foot"),
  "db-suitcase-squat": m(N, "Squat", "Compound", "Neutral, a dumbbell at each side"),
  "sl-leg-press": m(N, "Squat", "Compound", "Side handles"),
  "sl-box-squat": m(I, "Squat", "Compound", "Light dumbbell in the opposite hand"),
  "poliquin-step-up": m(N, "Squat", "Isolation", "Hands free or lightly on a rack"),
  "leg-press-calf-partials": m(N, "Push", "Isolation", "Side handles"),
  "copenhagen-side-plank": m(I, "Hold", "Isometric", "Forearm down"),
  "prone-y-t-raise": m(N, "Pull", "Isolation", "Light plates, thumbs up"),
  "side-lying-er": m(B, "Pull", "Isolation", "Neutral, light"),
  "cable-1arm-shoulder-press": m(I, "Push", "Compound", "Single handle, neutral"),
  "kneeling-cable-high-row": m(N, "Pull", "Compound", "Single handle, neutral"),
  "cable-rear-delt-fly": m(N, "Pull", "Isolation", "Crossed cables, cable ends or handles"),
  "db-lateral-drop": m(N, "Push", "Isolation", "Neutral"),
  "serratus-punch": m(B, "Push", "Isolation", "Single handle"),
  "concentration-curl": m(B, "Pull", "Isolation", "Underhand"),
  "reverse-grip-pressdown": m(N, "Push", "Isolation", "Underhand (palm up)"),
  "half-kneeling-cable-lift": m(N, "Anti-rotation", "Compound", "Both hands on the rope"),
  "sl-rdl-db": m(I, "Hinge", "Compound", "Dumbbell in the opposite hand"),
  "sl-ball-curl": m(I, "Pull", "Isolation", "None (palms on the floor)"),
  "prone-hip-ext": m(B, "Push", "Isolation", "Hands holding the bench"),
  "cable-kickback-30": m(N, "Push", "Isolation", "Hands on the machine frame"),
  "backward-treadmill": m(N, "Cardio", "Compound", "Hands light on the side rails"),
  "side-bridge-abduction": m(I, "Hold", "Compound", "Forearm down"),
  "cable-hip-adduction": m(B, "Pull", "Isolation", "Hand on the frame"),
  "sl-calf-step": m(N, "Push", "Isolation", "Hand on a rail; dumbbell optional"),
  "offset-front-rack-carry": m(N, "Carry", "Compound", "Dumbbell held at the shoulder"),
};

export function metaFor(id: string): Meta {
  const known = META[id];
  if (known) return known;
  const ex = exerciseById(id);
  return { difficulty: ex?.kind === "strength" ? "Novice" : "Beginner", force: "Mixed", mechanic: ex?.kind === "strength" ? "Compound" : "Isolation", grip: "As described" };
}

export const DIFFICULTY_RANK: Record<Difficulty, number> = { Beginner: 0, Novice: 1, Intermediate: 2, Advanced: 3 };

/* ------------------------------------------------------------------ equipment categories */

export const EQUIPMENT_CATS = ["Bodyweight", "Dumbbells", "Barbell", "Machine", "Cables", "Bands", "Kettlebell", "Bench / box", "Other"] as const;
export type EquipCat = (typeof EQUIPMENT_CATS)[number];

/** Which filter chips a move belongs to (a move can be in several: "Cable + rope" is Cables). */
export function equipCats(id: string): EquipCat[] {
  const eq = (exerciseById(id)?.equipment ?? "").toLowerCase();
  const out = new Set<EquipCat>();
  if (/cable/.test(eq)) out.add("Cables");
  if (/band/.test(eq)) out.add("Bands");
  if (/dumbbell|\bdb\b/.test(eq)) out.add("Dumbbells");
  if (/barbell|ez bar|trap bar|landmine/.test(eq)) out.add("Barbell");
  if (/kettlebell/.test(eq)) out.add("Kettlebell");
  if (/machine|leg press|pec deck|reverse hyper|back extension|captain|hack squat|assisted/.test(eq)) out.add("Machine");
  if (/bench|box|chair|pad/.test(eq)) out.add("Bench / box");
  if (/floor|mat|wall|bodyweight|^any|stability ball|pull-up bar|plate \/ vest/.test(eq) || !eq) out.add("Bodyweight");
  if (!out.size) out.add("Other");
  return [...out];
}

/* ------------------------------------------------------------------ tags */

export function tagsFor(id: string): string[] {
  const ex = exerciseById(id);
  const tags = new Set<string>();
  const subs = Object.entries(ex?.muscles ?? {}).filter(([, w]) => w >= 0.5).map(([s]) => s as SubId);
  for (const s of subs) {
    const g = groupInfo(groupOfSub(s));
    if (g) tags.add(g.name);
    const si = subInfo(s);
    if (si) tags.add(si.name);
  }
  for (const c of equipCats(id)) tags.add(c);
  if (ex?.unilateral) tags.add("One side at a time");
  if (ex?.back === "friendly") tags.add("Back-friendly");
  if (ex?.extra) tags.add("Not in your plan");
  const meta = metaFor(id);
  tags.add(meta.mechanic);
  tags.add(meta.force);
  return [...tags];
}

/* ------------------------------------------------------------------ outbound links */

/**
 * MuscleWiki exercise pages that exist for the same move. Each slug was checked with curl (HTTP 200, page title
 * matches the move) on 2026-10-01. Anything not listed here gets a YouTube search link instead; no URL is guessed.
 * We link out only. No MuscleWiki images, videos or text are used in this app.
 */
export const MUSCLEWIKI_SLUGS: Record<string, string> = {
  "incline-db-press": "dumbbell-incline-bench-press",
  pushup: "push-up",
  "machine-chest-press": "machine-chest-press",
  "pec-deck": "machine-pec-fly",
  "reverse-pec-deck": "machine-reverse-fly",
  "band-pull-apart": "band-pull-apart",
  "assisted-pullup": "machine-assisted-pull-up",
  "ez-curl": "ez-bar-curl",
  "incline-db-curl": "dumbbell-incline-curl",
  "hammer-curl": "dumbbell-hammer-curl",
  "rope-pressdown": "cable-rope-pushdown",
  "dead-bug": "dead-bug",
  "bird-dog": "bird-dog",
  "bird-dog-hold": "bird-dog",
  pallof: "cable-pallof-press",
  "reverse-crunch": "reverse-crunch",
  "hip-thrust": "barbell-hip-thrust",
  "machine-hip-thrust": "machine-hip-thrust",
  "glute-bridge": "glute-bridge",
  "sl-glute-bridge": "single-leg-glute-bridge",
  "cable-pull-through": "cable-pull-through",
  "hack-squat": "machine-hack-squat",
  "bulgarian-split-squat": "dumbbell-bulgarian-split-squat",
  "leg-press": "machine-leg-press",
  "leg-press-seated": "machine-leg-press",
  "leg-curl": "machine-seated-leg-curl",
  "reverse-lunge": "dumbbell-reverse-lunge",
  "box-step-up": "dumbbell-step-up",
  "wall-sit": "wall-sit",
  plank: "plank",
  "adductor-machine": "machine-hip-adduction",
  "nordic-curl": "nordic-hamstring-curl",
  "dead-hang": "dead-hang",
  "cable-external-rotation": "cable-external-rotation",
  "lat-pulldown": "machine-pulldown",
  "shoulder-press": "dumbbell-seated-overhead-press",
  "cable-hip-abduction": "cable-standing-hip-abduction",
  "reverse-hyper-light": "machine-reverse-hyperextension",
  "standing-calf-raise": "machine-standing-calf-raises",
  "seated-calf-raise": "machine-seated-calf-raises",
  "ball-leg-curl": "stability-ball-hamstring-curl",
  "y-raise": "cable-y-raise",
  "scaption-raise": "dumbbell-scaption",
  "btb-lateral-raise": "cable-behind-the-back-lateral-raise",
  "sumo-goblet": "dumbbell-sumo-squat",
  "leg-extension": "machine-leg-extension",
  "wrist-curl": "dumbbell-wrist-curl",
};

export function muscleWikiUrl(id: string): string | null {
  const slug = MUSCLEWIKI_SLUGS[id];
  return slug ? `https://musclewiki.com/exercise/${slug}` : null;
}
