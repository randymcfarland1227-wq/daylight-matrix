import type { BackFlag, ExerciseDef, ExerciseKind, MuscleWeights } from "./types";

const REVIEWED = "2026-09-30";
const P = 1;
const S = 0.5;
const M = 0.25;

type Opts = {
  m: MuscleWeights;
  back?: BackFlag;
  backNote?: string;
  eq?: string;
  uni?: boolean;
  assist?: boolean;
  factor?: number;
  extra?: boolean;
  pdfNote?: string;
  page2Dose?: string;
  eduCue?: string;
  eduSource?: string;
};

function ex(id: string, name: string, kind: ExerciseKind, o: Opts): ExerciseDef {
  return {
    id,
    name,
    kind,
    unilateral: Boolean(o.uni),
    usesAssistance: o.assist,
    muscles: o.m,
    back: o.back ?? "neutral",
    backNote: o.backNote,
    equipment: o.eq,
    volumeFactor: o.factor,
    extra: o.extra,
    pdfNote: o.pdfNote,
    page2Dose: o.page2Dose,
    eduCue: o.eduCue,
    eduSource: o.eduCue ? (o.eduSource ?? "General education summary. Not a cue from the PDF.") : undefined,
    eduReviewed: o.eduCue ? REVIEWED : undefined,
  };
}

const SUP = "Back is supported or the spine is not loaded.";
const HINGE = "Hip hinge under load. Keep the range you can control; go lighter or swap on tender days.";
const OVERHEAD = "Overhead or arched positions can pull the low back into extension. Brace and keep ribs down.";

/**
 * Exercise catalog. Muscle weights are an editorial mapping (1 = primary, 0.5 = secondary, 0.25 = minor).
 * They are not EMG data and not a prediction of growth. `back` is a general characteristic of the movement
 * (supported / neutral / spine-loaded), not medical advice.
 */
export const exercises: ExerciseDef[] = [
  // ---- PT activation / core (ids kept from the first build so old logs still resolve) ----
  ex("ppt", "Posterior Pelvic Tilt", "activation", {
    m: { abs: P, glutes: S },
    back: "friendly",
    backNote: SUP,
    eq: "Floor",
    page2Dose: "2 minutes",
    pdfNote: "Nice Hip Opener",
    eduCue: "Gently tuck the pelvis so the lower back softens. Stop before it feels forced.",
    eduSource: "General education summary of a posterior pelvic tilt. Not a cue from the PDF.",
  }),
  ex("pt-shoulder-flexion", "Posterior Pelvic Tilt w/ Shoulder Flexion", "activation", {
    m: { abs: P, "delt-front": S, lats: M },
    back: "friendly",
    backNote: SUP,
    eq: "Floor",
    page2Dose: "2 minutes",
    pdfNote: "Bend the kneees",
  }),
  ex("bird-dog", "Bird Dog", "activation", {
    m: { "lower-back": P, glutes: S, abs: S, "delt-front": M, hamstrings: M },
    back: "friendly",
    backNote: "Quiet-spine stability drill.",
    uni: true,
    eq: "Floor",
    page2Dose: "2 minutes",
    pdfNote: "Kick straight back",
    eduCue: "Hips stay level. Reach only as far as you can without rotating or arching.",
    eduSource: "Coaching summary in the tradition of Stuart McGill’s bird-dog stability drill. Not a PDF cue.",
  }),
  ex("bracing-marches", "Abdominal Bracing Marches", "activation", {
    m: { abs: P, obliques: S },
    back: "friendly",
    backNote: SUP,
    uni: true,
    eq: "Floor",
    page2Dose: "2 minutes",
    pdfNote: "Like to do this when needing a gentle warm up for legs and hips",
    eduCue: "Brace the abdomen as if preparing for a light poke, then march without losing that brace.",
    eduSource: "General education. Not a cue from the PDF and not a clinical instruction.",
  }),
  ex("dead-bug", "Dead Bug w/ Full Exhale", "activation", {
    m: { abs: P, obliques: S },
    back: "friendly",
    backNote: SUP,
    uni: true,
    eq: "Floor",
  }),
  ex("clamshell", "Clamshells", "activation", {
    m: { "glute-med": P, glutes: S },
    back: "friendly",
    backNote: SUP,
    uni: true,
    eq: "Band",
    page2Dose: "2 sets × 10 reps",
    pdfNote: "Go Slow at First",
    eduCue: "Lie on your side with knees bent. Rotate the top knee up without rolling the pelvis backward.",
  }),
  ex("band-walks", "Band Walks", "activation", {
    m: { "glute-med": P, glutes: S, quads: M },
    back: "friendly",
    eq: "Band",
    page2Dose: "3 laps",
    pdfNote: "Uses so much leggg, in a good way",
  }),
  ex("single-leg-stand", "Core Activation Single-Leg Stand", "timed", {
    m: { "glute-med": P, obliques: S, abs: S, tibialis: M },
    back: "friendly",
    uni: true,
    eq: "Bodyweight",
    page2Dose: "2 sets × 10 reps",
    pdfNote: "nice ab opener",
    factor: 0.5,
  }),
  ex("seated-pigeon", "Seated Pigeon Pose", "mobility", {
    m: { glutes: P, "glute-med": S },
    back: "friendly",
    uni: true,
    eq: "Chair",
    page2Dose: "3 sets",
    pdfNote: "Use body weight",
  }),
  ex("suitcase-carry", "Suitcase Carry", "distance", {
    m: { obliques: P, forearms: S, traps: S, "glute-med": M, "lower-back": M },
    back: "friendly",
    backNote: "Anti-lean carry; spine stays stacked.",
    uni: true,
    eq: "Kettlebell / dumbbell",
    page2Dose: "3 laps",
    pdfNote: "I like to do this to activate abs",
    factor: 0.75,
  }),
  ex("plank", "Front Plank", "timed", {
    m: { abs: P, obliques: S, "delt-front": M, glutes: M, "lower-back": M },
    back: "friendly",
    eq: "Floor",
    page2Dose: "2 sets",
    pdfNote: "Buttt down",
    factor: 0.5,
  }),
  ex("pallof", "Cable or Band Pallof Press Hold", "timed", {
    m: { obliques: P, abs: S, "glute-med": M },
    back: "friendly",
    uni: true,
    eq: "Cable / band",
    factor: 0.5,
    eduCue: "Hold the band or cable at your chest and resist the twist. It is a hold, not a punch.",
    eduSource: "General education named for the Pallof press. Not a cue from the PDF.",
  }),
  ex("mobility-flow", "Back-Friendly Mobility Flow", "mobility", {
    m: { glutes: P, hamstrings: S },
    back: "friendly",
    eq: "Mat",
    eduCue: "Move through the ranges you already use. The PDF gives a time window, not a sequence.",
    eduSource: "Duration is from page 1. No sequence was invented.",
  }),
  ex("zone2", "Zone 2 Cardio", "cardio", {
    m: { quads: S, calves: S },
    back: "friendly",
    eq: "Any steady cardio",
    eduCue: "Easy enough that you could speak in sentences.",
    eduSource: "Time range and the “conversational pace” line are on page 1. The talk-test wording is general education.",
  }),
  ex("tuesday-cardio", "Cardio (incline walk, bike or elliptical)", "cardio", {
    m: { quads: S, calves: S },
    back: "friendly",
    eq: "Incline walk / bike / elliptical",
  }),
  ex("wednesday-cardio", "Optional Easy Cardio", "cardio", { m: { quads: M }, back: "friendly", eq: "Any easy cardio" }),
  ex("saturday-cardio", "Cardio (easy-moderate)", "cardio", { m: { quads: M }, back: "friendly", eq: "Any" }),
  ex("battle-rope-squat", "Battle Rope Squats", "strength", {
    m: { quads: P, glutes: S, "delt-front": S, abs: M, calves: M },
    back: "neutral",
    eq: "Battle rope",
    pdfNote: "Meta! · Oscilate Anchor when needed · S Tier",
  }),

  // ---- Monday: pull ----
  ex("assisted-pullup", "Assisted Pull-Up", "strength", {
    m: { lats: P, biceps: S, "mid-back": S, "delt-rear": S, forearms: M },
    back: "friendly",
    backNote: "No load through the spine.",
    assist: true,
    eq: "Assisted pull-up machine",
    eduCue: "Start from a full hang if you can. Pull until the chin is near the bar, then lower under control.",
  }),
  ex("neutral-pullup", "Neutral-Grip Pull-Up", "strength", {
    m: { lats: P, biceps: S, "mid-back": S, "delt-rear": S, forearms: M },
    back: "friendly",
    backNote: "No load through the spine.",
    eq: "Pull-up bar",
    eduCue: "Palms face each other. Same full hang and controlled lower as a pull-up, if that range is available.",
  }),
  ex("chest-supported-row", "Chest-Supported Row", "strength", {
    m: { "mid-back": P, lats: S, "delt-rear": S, biceps: S, traps: S },
    back: "friendly",
    backNote: "Chest is supported, so the low back is not holding you up.",
    eq: "Row machine / incline bench",
  }),
  ex("half-kneeling-pulldown", "Half-Kneeling 1-Arm Lat Pulldown", "strength", {
    m: { lats: P, biceps: S, "mid-back": M, abs: M, obliques: M },
    back: "friendly",
    uni: true,
    eq: "Cable",
  }),
  ex("face-pull", "Face Pull w/ External Rotation", "strength", {
    m: { "delt-rear": P, "rotator-cuff": P, "mid-back": S, traps: S },
    back: "friendly",
    eq: "Cable + rope",
  }),
  ex("incline-shrug", "Incline DB Shrug", "strength", {
    m: { traps: P, forearms: M },
    back: "friendly",
    backNote: "Chest supported on the bench.",
    eq: "Incline bench + dumbbells",
  }),
  ex("straight-arm-pulldown", "Straight-Arm Rope Pulldown", "strength", {
    m: { lats: P, triceps: M, abs: M },
    back: "friendly",
    eq: "Cable + rope",
  }),
  ex("reverse-crunch", "Reverse Crunch", "strength", {
    m: { abs: P, obliques: M },
    back: "neutral",
    backNote: "Tilt first, then lift. Do not swing the legs.",
    eq: "Floor / bench",
  }),
  ex("cable-crunch", "Cable Crunch", "strength", {
    m: { abs: P, obliques: M },
    back: "neutral",
    eq: "Cable + rope",
  }),

  // ---- Tuesday: quads ----
  ex("hack-squat", "Hack Squat", "strength", {
    m: { quads: P, glutes: S, adductors: M, calves: M },
    back: "friendly",
    backNote: "Back is supported against the pad.",
    eq: "Hack squat machine",
  }),
  ex("heel-elevated-goblet", "Heel-Elevated Goblet Squat", "strength", {
    m: { quads: P, glutes: S, adductors: M, abs: M, "lower-back": M },
    back: "neutral",
    eq: "Dumbbell + plates",
  }),
  ex("bulgarian-split-squat", "Bulgarian Split Squat", "strength", {
    m: { quads: P, glutes: S, adductors: S, "glute-med": M, abs: M },
    back: "neutral",
    uni: true,
    eq: "Bench + dumbbells",
  }),
  ex("leg-press", "Leg Press, Mid Stance", "strength", {
    m: { quads: P, glutes: S, adductors: S },
    back: "friendly",
    backNote: "Back is supported. Stop the range before the hips tuck hard (PDF cue).",
    eq: "Leg press",
  }),
  ex("leg-extension", "Leg Extension", "strength", {
    m: { quads: P },
    back: "friendly",
    backNote: SUP,
    eq: "Leg extension machine",
  }),
  ex("standing-calf-raise", "Standing Calf Raise", "strength", {
    m: { calves: P },
    back: "neutral",
    eq: "Calf raise machine",
  }),
  ex("tibialis-raise", "Tibialis Raise", "strength", {
    m: { tibialis: P },
    back: "friendly",
    eq: "Tib bar / wall",
  }),

  // ---- Wednesday: push ----
  ex("incline-db-press", "Incline DB Press", "strength", {
    m: { "chest-upper": P, chest: S, "delt-front": S, triceps: S },
    back: "friendly",
    backNote: "Bench-supported.",
    eq: "Incline bench + dumbbells",
  }),
  ex("landmine-press", "1-Arm Landmine Press", "strength", {
    m: { "delt-front": P, "chest-upper": S, triceps: S, abs: M, obliques: M },
    back: "neutral",
    backNote: "Landmine angle is easier on the shoulder and back than a straight overhead press (PDF PSA).",
    uni: true,
    eq: "Landmine / barbell",
  }),
  ex("machine-chest-press", "Machine Chest Press", "strength", {
    m: { chest: P, "delt-front": S, triceps: S, "chest-upper": M },
    back: "friendly",
    backNote: SUP,
    eq: "Chest press machine",
  }),
  ex("weighted-pushup", "Weighted Push-Up", "strength", {
    m: { chest: P, "delt-front": S, triceps: S, abs: S },
    back: "neutral",
    eq: "Bodyweight + plate / vest",
  }),
  ex("low-high-fly", "Low-to-High Cable Fly", "strength", {
    m: { "chest-upper": P, chest: S, "delt-front": S },
    back: "neutral",
    eq: "Cable",
  }),
  ex("cable-lateral-raise", "Cable Lateral Raise", "strength", {
    m: { "delt-side": P, traps: M },
    back: "neutral",
    eq: "Cable",
  }),
  ex("overhead-rope-triceps", "Overhead Rope Triceps Extension", "strength", {
    m: { triceps: P },
    back: "neutral",
    backNote: OVERHEAD,
    eq: "Cable + rope",
  }),
  ex("assisted-dip", "Assisted Dip Machine", "strength", {
    m: { triceps: P, chest: S, "delt-front": S },
    back: "friendly",
    eq: "Assisted dip machine",
    assist: true,
  }),

  // ---- Friday: glute / ham ----
  ex("hip-thrust", "Barbell Hip Thrust", "strength", {
    m: { glutes: P, hamstrings: S, quads: M, "glute-med": M, abs: M },
    back: "neutral",
    backNote: "Upper back is supported on the bench. Ribs down, don’t hyperextend (PDF cue).",
    eq: "Barbell + bench",
  }),
  ex("machine-hip-thrust", "Machine Hip Thrust", "strength", {
    m: { glutes: P, hamstrings: S, quads: M, "glute-med": M, abs: M },
    back: "friendly",
    backNote: "Supported, fixed path.",
    eq: "Hip thrust machine",
  }),
  ex("bstance-rdl", "B-Stance RDL", "strength", {
    m: { hamstrings: P, glutes: P, "lower-back": S, forearms: M },
    back: "caution",
    backNote: HINGE,
    uni: true,
    eq: "Dumbbells / barbell",
  }),
  ex("leg-curl", "Seated Leg Curl", "strength", {
    m: { hamstrings: P, calves: M },
    back: "friendly",
    backNote: SUP,
    eq: "Leg curl machine",
  }),
  ex("lying-leg-curl", "Lying Leg Curl", "strength", {
    m: { hamstrings: P, calves: M },
    back: "friendly",
    backNote: "Supported. Keep the hips planted (PDF cue).",
    eq: "Leg curl machine",
  }),
  ex("reverse-lunge", "Reverse Lunge", "strength", {
    m: { quads: P, glutes: P, hamstrings: M, "glute-med": M, adductors: M },
    back: "neutral",
    uni: true,
    eq: "Dumbbells",
  }),
  ex("box-step-up", "Low Box Step-Up", "strength", {
    m: { quads: P, glutes: P, "glute-med": M, calves: M },
    back: "neutral",
    uni: true,
    eq: "Box + dumbbells",
  }),
  ex("back-extension-45", "45° Back Extension, Glute Bias", "strength", {
    m: { glutes: P, hamstrings: S, "lower-back": S },
    back: "caution",
    backNote: "Stop before low-back takeover (PDF cue). Shorten the range or swap on tender days.",
    eq: "45° back extension bench",
  }),
  ex("cable-hip-abduction", "Cable Hip Abduction", "strength", {
    m: { "glute-med": P, glutes: M },
    back: "friendly",
    uni: true,
    eq: "Cable + ankle strap",
  }),
  ex("seated-calf-raise", "Seated Calf Raise", "strength", {
    m: { calves: P },
    back: "friendly",
    backNote: SUP,
    eq: "Seated calf machine",
  }),

  // ---- Saturday: delts / arms / traps ----
  ex("shoulder-press", "Seated DB Shoulder Press", "strength", {
    m: { "delt-front": P, "delt-side": S, triceps: S, traps: M, "chest-upper": M },
    back: "neutral",
    backNote: OVERHEAD,
    eq: "Dumbbells + bench",
  }),
  ex("machine-shoulder-press", "Machine Shoulder Press", "strength", {
    m: { "delt-front": P, "delt-side": S, triceps: S, traps: M, "chest-upper": M },
    back: "friendly",
    backNote: "Back is supported by the pad.",
    eq: "Shoulder press machine",
  }),
  ex("btb-lateral-raise", "Behind-the-Back Cable Lateral Raise", "strength", {
    m: { "delt-side": P, "delt-rear": M },
    back: "neutral",
    eq: "Cable",
  }),
  ex("reverse-pec-deck", "Reverse Pec Deck", "strength", {
    m: { "delt-rear": P, "mid-back": S, "rotator-cuff": M, traps: M },
    back: "friendly",
    backNote: "Chest-supported.",
    eq: "Pec deck machine",
  }),
  ex("y-raise", "Cable Y-Raise / Scaption Raise", "strength", {
    m: { "mid-back": P, "delt-side": S, "rotator-cuff": S, "delt-rear": M },
    back: "neutral",
    eq: "Cable / light dumbbells",
  }),
  ex("ez-curl", "EZ-Bar Curl", "strength", {
    m: { biceps: P, forearms: S },
    back: "neutral",
    backNote: "Standing curl; no torso swing.",
    eq: "EZ bar",
  }),
  ex("incline-db-curl", "Incline DB Curl", "strength", {
    m: { biceps: P, forearms: S },
    back: "friendly",
    backNote: "Bench-supported.",
    eq: "Incline bench + dumbbells",
  }),
  ex("rope-pressdown", "Rope Pressdown", "strength", {
    m: { triceps: P },
    back: "neutral",
    eq: "Cable + rope",
  }),
  ex("cross-body-cable-ext", "Cross-Body Cable Extension", "strength", {
    m: { triceps: P },
    back: "neutral",
    uni: true,
    eq: "Cable",
  }),
  ex("farmer-carry", "Farmer Carry", "distance", {
    m: { forearms: P, traps: P, obliques: S, "lower-back": S, "glute-med": M, abs: M },
    back: "neutral",
    backNote: "Walk tall, shoulders down/back. Go lighter if the low back protests.",
    eq: "Dumbbells / trap bar",
    factor: 0.75,
  }),

  // ---- Suggestions that are NOT in the PDF plan. Candidates for the "grow this area" view. ----
  ex("adductor-machine", "Hip Adductor Machine", "strength", { m: { adductors: P }, back: "friendly", backNote: SUP, eq: "Adductor machine", extra: true }),
  ex("sumo-goblet", "Sumo Goblet Squat", "strength", { m: { adductors: S, quads: P, glutes: S }, back: "neutral", eq: "Dumbbell", extra: true }),
  ex("pec-deck", "Pec Deck Fly", "strength", { m: { chest: P, "chest-upper": S, "delt-front": M }, back: "friendly", backNote: SUP, eq: "Pec deck machine", extra: true }),
  ex("incline-machine-press", "Incline Machine Press", "strength", { m: { "chest-upper": P, chest: S, "delt-front": S, triceps: S }, back: "friendly", backNote: SUP, eq: "Incline press machine", extra: true }),
  ex("high-low-fly", "High-to-Low Cable Fly", "strength", { m: { chest: P, "delt-front": M }, back: "neutral", eq: "Cable", extra: true }),
  ex("wrist-curl", "Wrist Curl", "strength", { m: { forearms: P }, back: "friendly", backNote: "Seated, forearms on thighs.", eq: "Dumbbell / EZ bar", extra: true }),
  ex("hammer-curl", "Hammer Curl", "strength", { m: { biceps: P, forearms: S }, back: "neutral", eq: "Dumbbells", extra: true }),
  ex("dead-hang", "Dead Hang", "timed", { m: { forearms: P, lats: S, "rotator-cuff": M }, back: "friendly", backNote: "Hanging; no spinal load.", eq: "Pull-up bar", extra: true, factor: 0.5 }),
  ex("band-pull-apart", "Band Pull-Apart", "strength", { m: { "delt-rear": P, "mid-back": S, "rotator-cuff": S }, back: "friendly", eq: "Band", extra: true }),
  ex("cable-external-rotation", "Cable External Rotation", "strength", { m: { "rotator-cuff": P, "delt-rear": M }, back: "friendly", backNote: "Light load, elbow at side.", eq: "Cable / band", extra: true, uni: true }),
  ex("lat-pulldown", "Lat Pulldown (wide or neutral)", "strength", { m: { lats: P, biceps: S, "mid-back": S }, back: "friendly", backNote: SUP, eq: "Lat pulldown machine", extra: true }),
  ex("seated-cable-row", "Seated Cable Row", "strength", { m: { "mid-back": P, lats: S, "delt-rear": S, biceps: S }, back: "neutral", eq: "Cable", extra: true }),
  ex("tbar-chest-supported", "Chest-Supported T-Bar Row", "strength", { m: { "mid-back": P, lats: S, "delt-rear": S, biceps: S, traps: S }, back: "friendly", backNote: "Chest is supported.", eq: "T-bar row machine", extra: true }),
  ex("side-plank", "Side Plank", "timed", { m: { obliques: P, "glute-med": S, abs: M }, back: "friendly", eq: "Floor", extra: true, uni: true, factor: 0.5 }),
  ex("hanging-knee-raise", "Captain’s Chair Knee Raise", "strength", { m: { abs: P, obliques: M, forearms: M }, back: "neutral", backNote: "Back-supported version of a hanging raise.", eq: "Captain’s chair", extra: true }),
  ex("cable-woodchop", "Cable Woodchop", "strength", { m: { obliques: P, abs: S, "delt-front": M }, back: "neutral", eq: "Cable", extra: true, uni: true }),
  ex("glute-bridge", "Glute Bridge", "strength", { m: { glutes: P, hamstrings: S, abs: M }, back: "friendly", backNote: SUP, eq: "Floor + dumbbell", extra: true }),
  ex("cable-pull-through", "Cable Pull-Through", "strength", { m: { glutes: P, hamstrings: S, "lower-back": M }, back: "neutral", eq: "Cable + rope", extra: true }),
  ex("sl-glute-bridge", "Single-Leg Glute Bridge", "strength", { m: { glutes: P, hamstrings: S, "glute-med": S }, back: "friendly", backNote: SUP, eq: "Floor", extra: true, uni: true }),
  ex("ball-leg-curl", "Stability-Ball Leg Curl", "strength", { m: { hamstrings: P, glutes: S, abs: M }, back: "friendly", backNote: SUP, eq: "Stability ball", extra: true }),
  ex("nordic-curl", "Assisted Nordic Curl", "strength", { m: { hamstrings: P, calves: M }, back: "neutral", eq: "Pad / partner / band", extra: true }),
  ex("leg-press-narrow", "Leg Press, Narrow Stance", "strength", { m: { quads: P, glutes: M }, back: "friendly", backNote: SUP, eq: "Leg press", extra: true }),
  ex("wall-sit", "Wall Sit", "timed", { m: { quads: P, glutes: S }, back: "friendly", backNote: "Back against the wall.", eq: "Wall", extra: true, factor: 0.5 }),
  ex("sl-calf-raise-press", "Single-Leg Calf Raise on Leg Press", "strength", { m: { calves: P }, back: "friendly", backNote: SUP, eq: "Leg press", extra: true, uni: true }),
  ex("skull-crusher", "EZ-Bar Skull Crusher", "strength", { m: { triceps: P }, back: "friendly", backNote: "Lying on a bench.", eq: "EZ bar + bench", extra: true }),
  ex("close-grip-pushup", "Close-Grip Push-Up", "strength", { m: { triceps: P, chest: S, "delt-front": S, abs: M }, back: "neutral", eq: "Bodyweight", extra: true }),
  ex("preacher-curl", "Machine / Preacher Curl", "strength", { m: { biceps: P, forearms: M }, back: "friendly", backNote: "Arm-supported.", eq: "Preacher bench / machine", extra: true }),
  ex("cable-shrug", "Cable Shrug", "strength", { m: { traps: P, forearms: M }, back: "neutral", eq: "Cable", extra: true }),
  ex("machine-lateral-raise", "Machine Lateral Raise", "strength", { m: { "delt-side": P }, back: "friendly", backNote: SUP, eq: "Lateral raise machine", extra: true }),
  ex("cable-front-raise", "Cable Front Raise", "strength", { m: { "delt-front": P, "chest-upper": M }, back: "neutral", eq: "Cable", extra: true }),
  ex("chest-supported-rear-fly", "Chest-Supported Rear Delt Fly", "strength", { m: { "delt-rear": P, "mid-back": S, "rotator-cuff": M }, back: "friendly", backNote: "Chest is supported.", eq: "Incline bench + dumbbells", extra: true }),
  ex("side-lying-abduction", "Side-Lying Hip Abduction", "activation", { m: { "glute-med": P, glutes: M }, back: "friendly", backNote: SUP, eq: "Floor", extra: true, uni: true }),
  ex("pushup", "Push-Up", "strength", { m: { chest: P, "delt-front": S, triceps: S, abs: S }, back: "neutral", eq: "Bodyweight", extra: true }),
  ex("bird-dog-hold", "Bird Dog with Hold", "timed", { m: { "lower-back": P, glutes: S, abs: S }, back: "friendly", eq: "Floor", extra: true, uni: true, factor: 0.5 }),
  ex("reverse-hyper-light", "Light Reverse Hyper", "strength", { m: { glutes: P, hamstrings: S, "lower-back": S }, back: "caution", backNote: "Spine-loaded range. Light, controlled, or skip on tender days.", eq: "Reverse hyper", extra: true }),
];

export function exerciseById(id: string): ExerciseDef | undefined {
  return exercises.find((item) => item.id === id);
}

export function exerciseLabelOf(id: string): string | undefined {
  return exerciseById(id)?.name;
}

/** Default share of a logged/planned set that counts toward muscle volume. */
export function volumeFactorFor(ex: ExerciseDef): number {
  if (ex.volumeFactor != null) return ex.volumeFactor;
  switch (ex.kind) {
    case "strength":
      return 1;
    case "activation":
      return 0.5;
    case "timed":
      return 0.5;
    case "distance":
      return 0.75;
    default:
      return 0;
  }
}
