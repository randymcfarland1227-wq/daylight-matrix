import { withSplits } from "./muscles";
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
    muscles: withSplits(o.m),
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
    m: { "abs-lower": P, "abs-upper": S, transverse: S, "glute-max": S },
    back: "friendly",
    backNote: SUP,
    eq: "Floor",
    page2Dose: "2 minutes",
    pdfNote: "Nice Hip Opener",
    eduCue: "Gently tuck the pelvis so the lower back softens. Stop before it feels forced.",
    eduSource: "General education summary of a posterior pelvic tilt. Not a cue from the PDF.",
  }),
  ex("pt-shoulder-flexion", "Posterior Pelvic Tilt w/ Shoulder Flexion", "activation", {
    m: { "abs-lower": P, "abs-upper": S, transverse: S, "delt-front": S, lats: M , "glute-max": S, "hip-flexors": S},
    back: "friendly",
    backNote: SUP,
    eq: "Floor",
    page2Dose: "2 minutes",
    pdfNote: "Bend the kneees",
  }),
  ex("bird-dog", "Bird Dog", "activation", {
    m: { erectors: P, "glute-max": S, transverse: S, "abs-upper": M, "delt-front": M, "ham-medial": M, "ham-lateral": M },
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
    m: { transverse: P, "abs-upper": S, "abs-lower": S, obliques: S , "glute-max": S, "hip-flexors": S},
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
    m: { "abs-lower": P, transverse: P, "abs-upper": S, obliques: S },
    back: "friendly",
    backNote: SUP,
    uni: true,
    eq: "Floor",
  }),
  ex("clamshell", "Clamshells", "activation", {
    m: { "glute-med": P, "glute-min": S, "glute-max": S },
    back: "friendly",
    backNote: SUP,
    uni: true,
    eq: "Band",
    page2Dose: "2 sets × 10 reps",
    pdfNote: "Go Slow at First",
    eduCue: "Lie on your side with knees bent. Rotate the top knee up without rolling the pelvis backward.",
  }),
  ex("band-walks", "Band Walks", "activation", {
    m: { "glute-med": P, "glute-min": S, "glute-max": S, "quad-vl": M },
    back: "friendly",
    eq: "Band",
    page2Dose: "3 laps",
    pdfNote: "Uses so much leggg, in a good way",
  }),
  ex("single-leg-stand", "Core Activation Single-Leg Stand", "timed", {
    m: { "glute-med": P, "glute-min": S, obliques: S, transverse: S, tibialis: M },
    back: "friendly",
    uni: true,
    eq: "Bodyweight",
    page2Dose: "2 sets × 10 reps",
    pdfNote: "nice ab opener",
    factor: 0.5,
  }),
  ex("seated-pigeon", "Seated Pigeon Pose", "mobility", {
    m: { "glute-max": P, "glute-med": S },
    back: "friendly",
    uni: true,
    eq: "Chair",
    page2Dose: "3 sets",
    pdfNote: "Use body weight",
  }),
  ex("suitcase-carry", "Suitcase Carry", "distance", {
    m: { obliques: P, "forearm-flexors": S, "traps-upper": S, transverse: S, "glute-med": M, erectors: M },
    back: "friendly",
    backNote: "Anti-lean carry; spine stays stacked.",
    uni: true,
    eq: "Kettlebell / dumbbell",
    page2Dose: "3 laps",
    pdfNote: "I like to do this to activate abs",
    factor: 0.75,
  }),
  ex("plank", "Front Plank", "timed", {
    m: { "abs-upper": P, "abs-lower": P, transverse: S, obliques: S, "delt-front": M, "glute-max": M, erectors: M },
    back: "friendly",
    eq: "Floor",
    page2Dose: "2 sets",
    pdfNote: "Buttt down",
    factor: 0.5,
  }),
  ex("pallof", "Cable Pallof Press Hold", "timed", {
    m: { obliques: P, transverse: S, "abs-upper": S, "glute-med": M },
    back: "friendly",
    uni: true,
    eq: "Cable",
    factor: 0.5,
    eduCue: "Hold the cable at your chest and resist the twist. It is a hold, not a punch.",
    eduSource: "General education named for the Pallof press. Not a cue from the PDF.",
  }),
  ex("band-pallof", "Band Pallof Press Hold", "timed", {
    m: { obliques: P, transverse: S, "abs-upper": S, "glute-med": M },
    back: "friendly",
    uni: true,
    eq: "Resistance band + anchor",
    factor: 0.5,
    eduCue: "Hold the band at your chest and resist the twist. It is a hold, not a punch.",
    eduSource: "General education named for the Pallof press. Not a cue from the PDF.",
  }),
  ex("mobility-flow", "Back-Friendly Mobility Flow", "mobility", {
    m: { "glute-max": P, "ham-medial": S, "ham-lateral": S },
    back: "friendly",
    eq: "Mat",
    eduCue: "Move through the ranges you already use. The PDF gives a time window, not a sequence.",
    eduSource: "Duration is from page 1. No sequence was invented.",
  }),
  ex("zone2", "Zone 2 Cardio", "cardio", {
    m: { "quad-vl": S, "quad-rf": S, gastroc: S, soleus: S },
    back: "friendly",
    eq: "Any steady cardio",
    eduCue: "Easy enough that you could speak in sentences.",
    eduSource: "Time range and the “conversational pace” line are on page 1. The talk-test wording is general education.",
  }),
  ex("tuesday-cardio", "Cardio (incline walk, bike or elliptical)", "cardio", {
    m: { "quad-vl": S, "quad-rf": S, gastroc: S, soleus: S },
    back: "friendly",
    eq: "Incline walk / bike / elliptical",
  }),
  ex("wednesday-cardio", "Optional Easy Cardio", "cardio", { m: { "quad-rf": M }, back: "friendly", eq: "Any easy cardio" }),
  ex("saturday-cardio", "Cardio (easy-moderate)", "cardio", { m: { "quad-rf": M }, back: "friendly", eq: "Any" }),
  ex("battle-rope-squat", "Battle Rope Squats", "strength", {
    m: { "quad-vl": P, "quad-rf": P, "quad-vm": P, "glute-max": S, "delt-front": S, "abs-upper": M, gastroc: M },
    back: "neutral",
    eq: "Battle rope",
    pdfNote: "Meta! · Oscilate Anchor when needed · S Tier",
  }),

  // ---- Monday: pull ----
  ex("assisted-pullup", "Assisted Pull-Up", "strength", {
    m: { lats: P, "biceps-short": S, "biceps-long": S, brachialis: S, rhomboids: S, "traps-lower": S, "delt-rear": S, "forearm-flexors": M },
    back: "friendly",
    backNote: "No load through the spine.",
    assist: true,
    eq: "Assisted pull-up machine",
    eduCue: "Start from a full hang if you can. Pull until the chin is near the bar, then lower under control.",
  }),
  ex("neutral-pullup", "Neutral-Grip Pull-Up", "strength", {
    m: { lats: P, "biceps-short": S, "biceps-long": S, brachialis: S, rhomboids: S, "traps-lower": S, "delt-rear": S, "forearm-flexors": M },
    back: "friendly",
    backNote: "No load through the spine.",
    eq: "Pull-up bar",
    eduCue: "Palms face each other. Same full hang and controlled lower as a pull-up, if that range is available.",
  }),
  ex("chest-supported-row", "Chest-Supported Row", "strength", {
    m: { rhomboids: P, lats: P, "delt-rear": S, "biceps-long": S, "traps-upper": S, "traps-lower": S, brachialis: M , "rotator-cuff": S},
    back: "friendly",
    backNote: "Chest is supported, so the low back is not holding you up.",
    eq: "Row machine / incline bench",
  }),
  ex("half-kneeling-pulldown", "Half-Kneeling 1-Arm Lat Pulldown", "strength", {
    m: { lats: P, "biceps-short": S, brachialis: M, rhomboids: M, obliques: M, transverse: M },
    back: "friendly",
    uni: true,
    eq: "Cable",
  }),
  ex("face-pull", "Face Pull w/ External Rotation", "strength", {
    m: { "delt-rear": P, "rotator-cuff": P, rhomboids: S, "traps-lower": S, "traps-upper": M },
    back: "friendly",
    eq: "Cable + rope",
  }),
  ex("incline-shrug", "Incline DB Shrug", "strength", {
    m: { "traps-upper": P, "forearm-flexors": M },
    back: "friendly",
    backNote: "Chest supported on the bench.",
    eq: "Incline bench + dumbbells",
  }),
  ex("straight-arm-pulldown", "Straight-Arm Rope Pulldown", "strength", {
    m: { lats: P, "triceps-long": M, "abs-upper": M },
    back: "friendly",
    eq: "Cable + rope",
  }),
  ex("reverse-crunch", "Reverse Crunch", "strength", {
    m: { "abs-lower": P, "abs-upper": S, obliques: M },
    back: "neutral",
    backNote: "Tilt first, then lift. Do not swing the legs.",
    eq: "Floor / bench",
  }),
  ex("cable-crunch", "Cable Crunch", "strength", {
    m: { "abs-upper": P, "abs-lower": S, obliques: M },
    back: "neutral",
    eq: "Cable + rope",
  }),

  // ---- Tuesday: quads ----
  ex("hack-squat", "Hack Squat", "strength", {
    m: { "quad-vl": P, "quad-vm": P, "quad-rf": S, "quad-vi": S, "glute-max": S, "adductors-sub": M, gastroc: M },
    back: "friendly",
    backNote: "Back is supported against the pad.",
    eq: "Hack squat machine",
  }),
  ex("heel-elevated-goblet", "Heel-Elevated Goblet Squat", "strength", {
    m: { "quad-vm": P, "quad-vl": P, "quad-rf": S, "quad-vi": S, "glute-max": S, "adductors-sub": M, "abs-upper": M, erectors: M },
    back: "neutral",
    eq: "Dumbbell + plates",
  }),
  ex("bulgarian-split-squat", "Bulgarian Split Squat", "strength", {
    m: { "quad-vl": P, "quad-vm": S, "quad-rf": S, "glute-max": S, "adductors-sub": S, "glute-med": M, "abs-upper": M },
    back: "neutral",
    uni: true,
    eq: "Bench + dumbbells",
  }),
  ex("leg-press", "Leg Press (45° sled), Mid Stance", "strength", {
    m: { "quad-vl": P, "quad-vm": P, "quad-rf": S, "glute-max": S, "adductors-sub": S },
    back: "friendly",
    backNote: "Back is supported. Stop the range before the hips tuck hard (PDF cue).",
    eq: "45° sled leg press",
  }),
  ex("leg-press-seated", "Seated Leg Press (horizontal), Mid Stance", "strength", {
    m: { "quad-vl": P, "quad-vm": P, "quad-rf": S, "glute-max": S, "adductors-sub": S },
    back: "friendly",
    backNote: "Back is supported and upright. Stop the range before the hips tuck (PDF cue).",
    eq: "Seated (horizontal) leg press",
  }),
  ex("leg-extension", "Leg Extension", "strength", {
    m: { "quad-rf": P, "quad-vl": P, "quad-vm": P, "quad-vi": P },
    back: "friendly",
    backNote: SUP,
    eq: "Leg extension machine",
  }),
  ex("standing-calf-raise", "Standing Calf Raise", "strength", {
    m: { gastroc: P, soleus: S },
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
    m: { "chest-clav": P, "chest-sternal": S, "delt-front": S, "triceps-lateral": S, "triceps-medial": S, "triceps-long": M, serratus: M },
    back: "friendly",
    backNote: "Bench-supported.",
    eq: "Incline bench + dumbbells",
  }),
  ex("landmine-press", "1-Arm Landmine Press", "strength", {
    m: { "delt-front": P, "chest-clav": S, serratus: S, "triceps-lateral": S, "triceps-medial": S, "abs-upper": M, obliques: M, transverse: M },
    back: "neutral",
    backNote: "Landmine angle is easier on the shoulder and back than a straight overhead press (PDF PSA).",
    uni: true,
    eq: "Landmine / barbell",
  }),
  ex("machine-chest-press", "Machine Chest Press", "strength", {
    m: { "chest-sternal": P, "chest-lower": S, "delt-front": S, "triceps-lateral": S, "triceps-medial": S, "chest-clav": M },
    back: "friendly",
    backNote: SUP,
    eq: "Chest press machine",
  }),
  ex("weighted-pushup", "Weighted Push-Up", "strength", {
    m: { "chest-sternal": P, "chest-lower": S, "delt-front": S, "triceps-lateral": S, "triceps-medial": S, serratus: S, "abs-upper": S, transverse: S },
    back: "neutral",
    eq: "Bodyweight + plate / vest",
  }),
  ex("low-high-fly", "Low-to-High Cable Fly", "strength", {
    m: { "chest-clav": P, "chest-sternal": S, "delt-front": S },
    back: "neutral",
    eq: "Cable",
  }),
  ex("cable-lateral-raise", "Cable Lateral Raise", "strength", {
    m: { "delt-side": P, "traps-upper": M },
    back: "neutral",
    eq: "Cable",
  }),
  ex("overhead-rope-triceps", "Overhead Rope Triceps Extension", "strength", {
    m: { "triceps-long": P, "triceps-lateral": S, "triceps-medial": S },
    back: "neutral",
    backNote: OVERHEAD,
    eq: "Cable + rope",
  }),
  ex("assisted-dip", "Assisted Dip Machine", "strength", {
    m: { "chest-lower": P, "triceps-lateral": P, "triceps-medial": S, "triceps-long": S, "chest-sternal": S, "delt-front": S },
    back: "friendly",
    eq: "Assisted dip machine",
    assist: true,
  }),

  // ---- Friday: glute / ham ----
  ex("hip-thrust", "Barbell Hip Thrust", "strength", {
    m: { "glute-max": P, "ham-medial": S, "ham-lateral": S, "quad-vl": M, "glute-med": M, "abs-lower": M },
    back: "neutral",
    backNote: "Upper back is supported on the bench. Ribs down, don’t hyperextend (PDF cue).",
    eq: "Barbell + bench",
  }),
  ex("machine-hip-thrust", "Machine Hip Thrust", "strength", {
    m: { "glute-max": P, "ham-medial": S, "ham-lateral": S, "quad-vl": M, "glute-med": M, "abs-lower": M },
    back: "friendly",
    backNote: "Supported, fixed path.",
    eq: "Hip thrust machine",
  }),
  ex("bstance-rdl", "B-Stance RDL", "strength", {
    m: { "ham-medial": P, "ham-lateral": P, "glute-max": P, erectors: S, "forearm-flexors": M },
    back: "caution",
    backNote: HINGE,
    uni: true,
    eq: "Dumbbells / barbell",
  }),
  ex("leg-curl", "Seated Leg Curl", "strength", {
    m: { "ham-medial": P, "ham-lateral": P, gastroc: M },
    back: "friendly",
    backNote: SUP,
    eq: "Leg curl machine",
  }),
  ex("lying-leg-curl", "Lying Leg Curl", "strength", {
    m: { "ham-medial": P, "ham-lateral": P, gastroc: M },
    back: "friendly",
    backNote: "Supported. Keep the hips planted (PDF cue).",
    eq: "Leg curl machine",
  }),
  ex("reverse-lunge", "Reverse Lunge", "strength", {
    m: { "quad-vl": P, "quad-vm": P, "glute-max": P, "quad-rf": S, "ham-medial": M, "ham-lateral": M, "glute-med": M, "adductors-sub": M },
    back: "neutral",
    uni: true,
    eq: "Dumbbells",
  }),
  ex("box-step-up", "Low Box Step-Up", "strength", {
    m: { "quad-vl": P, "quad-vm": P, "glute-max": P, "quad-rf": S, "glute-med": M, gastroc: M },
    back: "neutral",
    uni: true,
    eq: "Box + dumbbells",
  }),
  ex("back-extension-45", "45° Back Extension, Glute Bias", "strength", {
    m: { "glute-max": P, "ham-medial": S, "ham-lateral": S, erectors: S },
    back: "caution",
    backNote: "Stop before low-back takeover (PDF cue). Shorten the range or swap on tender days.",
    eq: "45° back extension bench",
  }),
  ex("cable-hip-abduction", "Cable Hip Abduction", "strength", {
    m: { "glute-med": P, "glute-min": S, "glute-max": M , tfl: P},
    back: "friendly",
    uni: true,
    eq: "Cable + ankle strap",
  }),
  ex("seated-calf-raise", "Seated Calf Raise", "strength", {
    m: { soleus: P, gastroc: M },
    back: "friendly",
    backNote: SUP,
    eq: "Seated calf machine",
  }),

  // ---- Saturday: delts / arms / traps ----
  ex("shoulder-press", "Seated DB Shoulder Press", "strength", {
    m: { "delt-front": P, "delt-side": S, "triceps-lateral": S, "triceps-medial": S, "traps-upper": M, "chest-clav": M },
    back: "neutral",
    backNote: OVERHEAD,
    eq: "Dumbbells + bench",
  }),
  ex("machine-shoulder-press", "Machine Shoulder Press", "strength", {
    m: { "delt-front": P, "delt-side": S, "triceps-lateral": S, "triceps-medial": S, "traps-upper": M, "chest-clav": M },
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
    m: { "delt-rear": P, rhomboids: S, "rotator-cuff": M, "traps-upper": M },
    back: "friendly",
    backNote: "Chest-supported.",
    eq: "Pec deck machine",
  }),
  ex("y-raise", "Cable Y-Raise", "strength", {
    m: { "traps-lower": P, "delt-side": S, "rotator-cuff": S, "delt-rear": M, rhomboids: M },
    back: "neutral",
    eq: "Cable (low pulleys)",
  }),
  ex("scaption-raise", "Dumbbell Scaption Raise", "strength", {
    m: { "delt-side": P, "delt-front": S, "traps-lower": S, "rotator-cuff": S, serratus: M },
    back: "neutral",
    eq: "Light dumbbells",
  }),
  ex("ez-curl", "EZ-Bar Curl", "strength", {
    m: { "biceps-short": P, "biceps-long": P, brachialis: S, "forearm-flexors": S },
    back: "neutral",
    backNote: "Standing curl; no torso swing.",
    eq: "EZ bar",
  }),
  ex("incline-db-curl", "Incline DB Curl", "strength", {
    m: { "biceps-long": P, "biceps-short": S, brachialis: S, "forearm-flexors": M },
    back: "friendly",
    backNote: "Bench-supported.",
    eq: "Incline bench + dumbbells",
  }),
  ex("rope-pressdown", "Rope Pressdown", "strength", {
    m: { "triceps-lateral": P, "triceps-medial": P, "triceps-long": S },
    back: "neutral",
    eq: "Cable + rope",
  }),
  ex("cross-body-cable-ext", "Cross-Body Cable Extension", "strength", {
    m: { "triceps-lateral": P, "triceps-long": P, "triceps-medial": S },
    back: "neutral",
    uni: true,
    eq: "Cable",
  }),
  ex("farmer-carry", "Farmer Carry", "distance", {
    m: { "forearm-flexors": P, "traps-upper": P, obliques: S, erectors: S, transverse: S, "forearm-extensors": S, "glute-med": M },
    back: "neutral",
    backNote: "Walk tall, shoulders down/back. Go lighter if the low back protests.",
    eq: "Dumbbells / trap bar",
    factor: 0.75,
  }),

  // ---- Suggestions that are NOT in the PDF plan. Candidates for the "grow this area" view. ----
  ex("adductor-machine", "Hip Adductor Machine", "strength", { m: { "adductors-sub": P }, back: "friendly", backNote: SUP, eq: "Adductor machine", extra: true }),
  ex("sumo-goblet", "Sumo Goblet Squat", "strength", { m: { "adductors-sub": S, "quad-vl": P, "quad-vm": P, "glute-max": S }, back: "neutral", eq: "Dumbbell", extra: true }),
  ex("pec-deck", "Pec Deck Fly", "strength", { m: { "chest-sternal": P, "chest-clav": S, "chest-lower": S, "delt-front": M }, back: "friendly", backNote: SUP, eq: "Pec deck machine", extra: true }),
  ex("incline-machine-press", "Incline Machine Press", "strength", { m: { "chest-clav": P, "chest-sternal": S, "delt-front": S, "triceps-lateral": S }, back: "friendly", backNote: SUP, eq: "Incline press machine", extra: true }),
  ex("high-low-fly", "High-to-Low Cable Fly", "strength", { m: { "chest-lower": P, "chest-sternal": S, "delt-front": M }, back: "neutral", eq: "Cable", extra: true }),
  ex("wrist-curl", "Wrist Curl", "strength", { m: { "forearm-flexors": P }, back: "friendly", backNote: "Seated, forearms on thighs.", eq: "Dumbbell / EZ bar", extra: true }),
  ex("hammer-curl", "Hammer Curl", "strength", { m: { brachialis: P, "forearm-extensors": P, "biceps-long": S, "biceps-short": S }, back: "neutral", eq: "Dumbbells", extra: true }),
  ex("dead-hang", "Dead Hang", "timed", { m: { "forearm-flexors": P, lats: S, "rotator-cuff": M }, back: "friendly", backNote: "Hanging; no spinal load.", eq: "Pull-up bar", extra: true, factor: 0.5 }),
  ex("band-pull-apart", "Band Pull-Apart", "strength", { m: { "delt-rear": P, rhomboids: S, "rotator-cuff": S }, back: "friendly", eq: "Band", extra: true }),
  ex("cable-external-rotation", "Cable External Rotation", "strength", { m: { "rotator-cuff": P, "delt-rear": M }, back: "friendly", backNote: "Light load, elbow at side.", eq: "Cable / band", extra: true, uni: true }),
  ex("lat-pulldown", "Lat Pulldown (wide or neutral)", "strength", { m: { lats: P, "biceps-short": S, "biceps-long": S, rhomboids: S, brachialis: S }, back: "friendly", backNote: SUP, eq: "Lat pulldown machine", extra: true }),
  ex("seated-cable-row", "Seated Cable Row", "strength", { m: { rhomboids: P, lats: S, "delt-rear": S, "biceps-long": S, "biceps-short": S }, back: "neutral", eq: "Cable", extra: true }),
  ex("tbar-chest-supported", "Chest-Supported T-Bar Row", "strength", { m: { rhomboids: P, lats: S, "delt-rear": S, "biceps-long": S, "traps-upper": S, "traps-lower": S }, back: "friendly", backNote: "Chest is supported.", eq: "T-bar row machine", extra: true }),
  ex("side-plank", "Side Plank", "timed", { m: { obliques: P, "glute-med": S, "glute-min": S, transverse: S, "abs-upper": M }, back: "friendly", eq: "Floor", extra: true, uni: true, factor: 0.5 }),
  ex("hanging-knee-raise", "Captain’s Chair Knee Raise", "strength", { m: { "abs-lower": P, "abs-upper": S, obliques: M, "forearm-flexors": M }, back: "neutral", backNote: "Back-supported version of a hanging raise.", eq: "Captain’s chair", extra: true }),
  ex("cable-woodchop", "Cable Woodchop", "strength", { m: { obliques: P, "abs-upper": S, transverse: S, "delt-front": M }, back: "neutral", eq: "Cable", extra: true, uni: true }),
  ex("glute-bridge", "Glute Bridge", "strength", { m: { "glute-max": P, "ham-medial": S, "ham-lateral": S, "abs-lower": M }, back: "friendly", backNote: SUP, eq: "Floor + dumbbell", extra: true }),
  ex("cable-pull-through", "Cable Pull-Through", "strength", { m: { "glute-max": P, "ham-medial": S, "ham-lateral": S, erectors: M }, back: "neutral", backNote: "The cable pulls you backward instead of loading down on the spine; hinge with a flat back and stop before it rounds.", eq: "Cable + rope" }),
  ex("sl-glute-bridge", "Single-Leg Glute Bridge", "strength", { m: { "glute-max": P, "ham-medial": S, "ham-lateral": S, "glute-med": S }, back: "friendly", backNote: SUP, eq: "Floor", extra: true, uni: true }),
  ex("ball-leg-curl", "Stability-Ball Leg Curl", "strength", { m: { "ham-medial": P, "ham-lateral": P, "glute-max": S, "abs-lower": M }, back: "friendly", backNote: SUP, eq: "Stability ball", extra: true }),
  ex("nordic-curl", "Assisted Nordic Curl", "strength", { m: { "ham-medial": P, "ham-lateral": P, gastroc: M }, back: "neutral", eq: "Pad / partner / band", extra: true }),
  ex("leg-press-narrow", "Leg Press (45° sled), Narrow Stance", "strength", { m: { "quad-vl": P, "quad-rf": P, "quad-vm": P, "glute-max": M }, back: "friendly", backNote: SUP, eq: "45° sled leg press", extra: true }),
  ex("wall-sit", "Wall Sit", "timed", { m: { "quad-vl": P, "quad-vm": P, "quad-rf": P, "glute-max": S }, back: "friendly", backNote: "Back against the wall.", eq: "Wall", extra: true, factor: 0.5 }),
  ex("sl-calf-raise-press", "Single-Leg Calf Raise on Leg Press (45° sled)", "strength", { m: { gastroc: P, soleus: S }, back: "friendly", backNote: SUP, eq: "Leg press", extra: true, uni: true }),
  ex("skull-crusher", "EZ-Bar Skull Crusher", "strength", { m: { "triceps-long": P, "triceps-lateral": S, "triceps-medial": S }, back: "friendly", backNote: "Lying on a bench.", eq: "EZ bar + bench", extra: true }),
  ex("close-grip-pushup", "Close-Grip Push-Up", "strength", { m: { "triceps-lateral": P, "triceps-medial": P, "chest-sternal": S, "delt-front": S, "abs-upper": M }, back: "neutral", eq: "Bodyweight", extra: true }),
  ex("preacher-curl", "Machine / Preacher Curl", "strength", { m: { "biceps-short": P, brachialis: S, "forearm-flexors": M }, back: "friendly", backNote: "Arm-supported.", eq: "Preacher bench / machine", extra: true }),
  ex("cable-shrug", "Cable Shrug", "strength", { m: { "traps-upper": P, "forearm-flexors": M }, back: "neutral", eq: "Cable", extra: true }),
  ex("machine-lateral-raise", "Machine Lateral Raise", "strength", { m: { "delt-side": P }, back: "friendly", backNote: SUP, eq: "Lateral raise machine", extra: true }),
  ex("cable-front-raise", "Cable Front Raise", "strength", { m: { "delt-front": P, "chest-clav": M }, back: "neutral", eq: "Cable", extra: true }),
  ex("chest-supported-rear-fly", "Chest-Supported Rear Delt Fly", "strength", { m: { "delt-rear": P, rhomboids: S, "rotator-cuff": M }, back: "friendly", backNote: "Chest is supported.", eq: "Incline bench + dumbbells", extra: true }),
  ex("side-lying-abduction", "Side-Lying Hip Abduction", "activation", { m: { "glute-med": P, "glute-min": S, "glute-max": M }, back: "friendly", backNote: SUP, eq: "Floor, ankle weight, or low cable + your own ankle strap", uni: true }),
  ex("pushup", "Push-Up", "strength", { m: { "chest-sternal": P, "chest-lower": S, "delt-front": S, "triceps-lateral": S, serratus: S, "abs-upper": S, transverse: S }, back: "neutral", eq: "Bodyweight", extra: true }),
  ex("bird-dog-hold", "Bird Dog with Hold", "timed", { m: { erectors: P, "glute-max": S, transverse: S, "abs-upper": M }, back: "friendly", eq: "Floor", extra: true, uni: true, factor: 0.5 }),
  ex("reverse-hyper-light", "Light Reverse Hyper", "strength", { m: { "glute-max": P, "ham-medial": S, "ham-lateral": S, erectors: S }, back: "caution", backNote: "Spine-loaded range. Light, controlled, or skip on tender days.", eq: "Reverse hyper", extra: true }),
  /* ---- Fine Shyte 3 (Oct 27, 2026) ---- */
  ex("lying-cable-pullover", "Lying Cable Pullover", "strength", {
    m: { lats: P, "teres-major": P, "triceps-long": S, serratus: S, "chest-sternal": M, transverse: M },
    back: "friendly",
    backNote: "Lying on the bench, the spine is supported. Ribs stay down so the low back doesn't arch as the arms go overhead.",
    eq: "Low cable + flat bench (rope or straight bar)",
  }),
  ex("kneeling-cable-pullaround", "Kneeling Cable Lat Pullaround", "strength", {
    m: { lats: P, "teres-major": S, obliques: S, "biceps-long": M, transverse: M, "glute-max": M },
    back: "friendly",
    backNote: "Kneeling with the glutes squeezed keeps the low back still.",
    eq: "High cable, single handle",
    uni: true,
  }),
  ex("underhand-pulldown", "Underhand Lat Pulldown", "strength", {
    m: { lats: P, "biceps-short": S, "biceps-long": S, brachialis: S, "teres-major": S, rhomboids: M, "traps-lower": M },
    back: "friendly",
    backNote: "Seated with the thighs locked under the pads; no load on the spine.",
    eq: "Lat pulldown machine, straight bar",
  }),
  ex("landmine-meadows-row", "Landmine Meadows Row", "strength", {
    m: { lats: P, rhomboids: S, "traps-mid": S, "delt-rear": S, "teres-major": S, "biceps-long": M, "forearm-flexors": M, erectors: M },
    back: "neutral",
    backNote: "A staggered-stance hinge; the free forearm rests on the front thigh so the low back isn't holding you up alone.",
    eq: "Landmine + barbell (plates on the far end)",
    uni: true,
  }),
  ex("neutral-flat-db-press", "Neutral-Grip Flat DB Press", "strength", {
    m: { "chest-sternal": P, "chest-clav": S, "triceps-lateral": S, "triceps-medial": S, "delt-front": S, serratus: M },
    back: "friendly",
    backNote: "Lying on the bench with the feet flat and only a small arch.",
    eq: "Dumbbells + flat bench",
  }),
  ex("cable-press-around", "Single-Arm Cable Press-Around", "strength", {
    m: { "chest-sternal": P, "chest-lower": S, "delt-front": S, serratus: S, "triceps-medial": M, obliques: M },
    back: "friendly",
    backNote: "Standing in a split stance; the core resists the cable turning you.",
    eq: "Cable at chest height, single handle",
    uni: true,
  }),
  ex("stir-the-pot", "Stability Ball Stir-the-Pot", "strength", {
    m: { "abs-upper": P, "abs-lower": P, transverse: P, obliques: S, serratus: S, "delt-front": M, "glute-max": M },
    back: "friendly",
    backNote: "The spine stays still while the abs work; no bending.",
    eq: "Stability ball",
  }),
  ex("side-lying-incline-lateral", "Side-Lying Incline DB Lateral", "strength", {
    m: { "delt-side": P, "delt-front": M, "delt-rear": M, "rotator-cuff": M, "traps-upper": M },
    back: "friendly",
    backNote: "Lying on the bench, no load on the spine.",
    eq: "Dumbbell + incline bench (30–45°)",
    uni: true,
  }),
  ex("lean-away-lateral", "Lean-Away DB Lateral Raise", "strength", {
    m: { "delt-side": P, "delt-front": M, "rotator-cuff": M, "traps-upper": M, obliques: M },
    back: "friendly",
    backNote: "Standing with a light weight; no spinal load.",
    eq: "Dumbbell + an upright post or rack to hold",
    uni: true,
  }),
  ex("bayesian-curl", "Bayesian Cable Curl", "strength", {
    m: { "biceps-long": P, "biceps-short": P, brachialis: S, "forearm-flexors": M, "delt-front": M },
    back: "friendly",
    backNote: "Standing in a split stance; no spinal load.",
    eq: "Low cable, single handle",
    uni: true,
  }),
  ex("spider-curl", "Spider Curl", "strength", {
    m: { "biceps-short": P, "biceps-long": S, brachialis: S, "forearm-flexors": M },
    back: "friendly",
    backNote: "Chest on the bench, no spinal load.",
    eq: "Dumbbells + incline bench",
  }),
  ex("seated-db-overhead-tri", "Seated DB Overhead Triceps Extension", "strength", {
    m: { "triceps-long": P, "triceps-lateral": S, "triceps-medial": S },
    back: "friendly",
    backNote: "Back supported on an upright bench.",
    eq: "One dumbbell + upright bench",
  }),
  ex("smith-jm-press", "Smith Machine JM Press", "strength", {
    m: { "triceps-lateral": P, "triceps-medial": P, "triceps-long": S, "chest-sternal": M, "delt-front": M },
    back: "friendly",
    backNote: "Lying on the bench; no spinal load.",
    eq: "Smith machine + flat bench",
  }),
  ex("reverse-cable-curl", "Reverse-Grip Cable Bar Curl", "strength", {
    m: { brachioradialis: P, brachialis: P, "forearm-extensors": S, "biceps-short": M, "biceps-long": M },
    back: "friendly",
    backNote: "Standing with a light weight; no spinal load.",
    eq: "Low cable, straight bar",
  }),
  ex("fs3-easy-cardio", "Incline Walk or Bike", "cardio", {
    m: { "glute-max": M, "quad-rf": M, gastroc: M },
    back: "friendly",
    backNote: "Walking and easy cycling are gentle on a disc.",
    eq: "Treadmill or bike",
  }),
  ex("kb-foot-flex", "KB Foot Flex (yours)", "activation", {
    m: { tibialis: P, "quad-vm": S, "quad-rf": S, "ham-medial": M, gastroc: M },
    back: "friendly",
    backNote: "Seated; nothing on the back.",
    eq: "Kettlebell",
    uni: true,
  }),
  ex("db-suitcase-squat", "Heel-Elevated DB Suitcase Squat", "strength", {
    m: { "quad-vm": P, "quad-vl": P, "quad-vi": P, "quad-rf": S, "glute-max": S, "adductors-sub": S, "forearm-flexors": M, transverse: M },
    back: "friendly",
    backNote: "The weight hangs at your sides, not on your spine.",
    eq: "Two dumbbells + small plates under the heels",
  }),
  ex("sl-leg-press", "Single-Leg Leg Press", "strength", {
    m: { "quad-vl": P, "quad-vm": P, "quad-vi": S, "glute-max": S, "glute-med": M, "adductors-sub": M },
    back: "neutral",
    backNote: "Keep the low back flat on the pad; don't let the hips curl up at the bottom.",
    eq: "Leg press machine",
    uni: true,
  }),
  ex("sl-box-squat", "Single-Leg Box Squat", "strength", {
    m: { "glute-med": P, "glute-max": P, "quad-vm": S, "quad-vl": S, "glute-min": S, obliques: M, "adductors-sub": M },
    back: "friendly",
    backNote: "Light load and an upright torso.",
    eq: "Box or bench + light dumbbell",
    uni: true,
  }),
  ex("poliquin-step-up", "Poliquin Step-Up", "strength", {
    m: { "quad-vm": P, "quad-vl": S, "quad-rf": S, "glute-med": M, tibialis: M },
    back: "friendly",
    backNote: "Bodyweight and upright; nothing on the spine.",
    eq: "Low step + small plate under the heel",
    uni: true,
  }),
  ex("leg-press-calf-partials", "Leg Press Calf Raise, stretch partials", "strength", {
    m: { gastroc: P, soleus: S },
    back: "neutral",
    backNote: "Keep the low back flat on the pad.",
    eq: "Leg press machine",
  }),
  ex("copenhagen-side-plank", "Copenhagen Side Plank", "timed", {
    m: { "adductor-longus": P, "adductors-sub": P, gracilis: S, obliques: P, "glute-med": S, transverse: S },
    back: "friendly",
    backNote: "Holds the spine still sideways.",
    eq: "Flat bench",
    uni: true,
  }),
  ex("prone-y-t-raise", "Prone Incline Y + T Raise", "strength", {
    m: { "traps-lower": P, "traps-mid": P, rhomboids: S, "delt-rear": S, "rotator-cuff": S, "traps-upper": M },
    back: "friendly",
    backNote: "Chest-supported; no spinal load.",
    eq: "Incline bench + light plates or dumbbells",
  }),
  ex("side-lying-er", "Side-Lying DB External Rotation", "strength", {
    m: { "rotator-cuff": P, "delt-rear": S, "traps-mid": M },
    back: "friendly",
    backNote: "Lying on your side; no spinal load.",
    eq: "Light dumbbell + rolled towel",
    uni: true,
  }),
  ex("cable-1arm-shoulder-press", "Standing 1-Arm Cable Shoulder Press", "strength", {
    m: { "delt-front": P, "delt-side": S, "triceps-lateral": S, serratus: S, obliques: S, "glute-max": M },
    back: "neutral",
    backNote: "Standing overhead work; keep the ribs down. The staggered stance helps.",
    eq: "Low cable, single handle",
    uni: true,
  }),
  ex("kneeling-cable-high-row", "Kneeling 1-Arm Cable High Row", "strength", {
    m: { rhomboids: P, "traps-mid": P, "delt-rear": S, lats: S, "traps-lower": S, "biceps-long": M },
    back: "friendly",
    backNote: "Kneeling and upright; no spinal load.",
    eq: "High cable, single handle",
    uni: true,
  }),
  ex("cable-rear-delt-fly", "Cable Rear-Delt Fly", "strength", {
    m: { "delt-rear": P, "traps-mid": S, rhomboids: S, "rotator-cuff": S },
    back: "friendly",
    backNote: "Standing with a light weight; no spinal load.",
    eq: "Two cables at shoulder height",
  }),
  ex("db-lateral-drop", "DB Lateral Raise, drop set", "strength", {
    m: { "delt-side": P, "delt-front": M, "traps-upper": M },
    back: "friendly",
    backNote: "Standing with a light weight; no spinal load.",
    eq: "Dumbbells (three weights)",
  }),
  ex("serratus-punch", "Incline Cable Serratus Punch", "strength", {
    m: { serratus: P, "chest-sternal": M, "delt-front": M },
    back: "friendly",
    backNote: "Bench-supported; no spinal load.",
    eq: "Low cable + incline bench",
    uni: true,
  }),
  ex("concentration-curl", "Concentration Curl", "strength", {
    m: { "biceps-short": P, "biceps-long": P, brachialis: S },
    back: "neutral",
    backNote: "Seated and leaning forward: hinge from the hips with a flat back, don't slump.",
    eq: "Dumbbell + bench",
    uni: true,
  }),
  ex("reverse-grip-pressdown", "Reverse-Grip Pressdown", "strength", {
    m: { "triceps-medial": P, "triceps-lateral": S, "triceps-long": M },
    back: "friendly",
    backNote: "Standing with a light weight; no spinal load.",
    eq: "High cable, single handle",
    uni: true,
  }),
  ex("half-kneeling-cable-lift", "Half-Kneeling Cable Lift", "strength", {
    m: { obliques: P, transverse: P, "abs-upper": S, "glute-max": S, "delt-front": M, serratus: M },
    back: "friendly",
    backNote: "The arms move, the spine stays square.",
    eq: "Low cable, rope",
    uni: true,
  }),
  ex("sl-rdl-kb", "Single-Leg RDL, KB opposite hand", "strength", {
    m: { "glute-max": P, "ham-lateral": P, "ham-medial": S, "ham-semimem": S, "glute-med": S, erectors: M, lats: M },
    back: "neutral",
    backNote: "A hinge: keep the back flat. The load is light and one-sided.",
    eq: "Kettlebell (+ a rack for balance)",
    uni: true,
  }),
  ex("sl-ball-curl", "Single-Leg Stability Ball Hamstring Curl", "strength", {
    m: { "ham-medial": P, "ham-lateral": P, "ham-semimem": P, "glute-max": S, gastroc: M },
    back: "friendly",
    backNote: "On your back with the hips up; no spinal load.",
    eq: "Stability ball",
    uni: true,
  }),
  ex("prone-hip-ext", "Prone Hip Extension, knee bent + out", "strength", {
    m: { "glute-max": P, "glute-med": S, "ham-lateral": M, lats: M, erectors: M },
    back: "neutral",
    backNote: "Lift only to where the low back stays still; don't arch.",
    eq: "Flat bench (ankle weight optional)",
    uni: true,
  }),
  ex("cable-kickback-30", "Cable Glute Kickback, 30° out", "strength", {
    m: { "glute-max": P, "glute-med": S, "glute-min": M, "ham-lateral": M },
    back: "neutral",
    backNote: "Brace so the kick comes from the hip, not an arched back.",
    eq: "Low cable + ankle strap (bring your own)",
    uni: true,
  }),
  ex("backward-treadmill", "Backward Incline Treadmill Walk", "timed", {
    m: { "quad-vm": P, "quad-vl": S, "quad-rf": S, gastroc: S, "glute-max": M },
    back: "friendly",
    backNote: "Upright walking; no spinal load.",
    eq: "Treadmill",
  }),
  ex("side-bridge-abduction", "Side Bridge with Hip Abduction", "strength", {
    m: { "glute-med": P, obliques: P, "glute-min": S, tfl: S, transverse: S },
    back: "friendly",
    backNote: "A side bridge keeps the spine still.",
    eq: "Floor or mat",
    uni: true,
  }),
  ex("cable-hip-adduction", "Cable Hip Adduction", "strength", {
    m: { "adductors-sub": P, "adductor-longus": P, gracilis: S, "glute-med": M },
    back: "friendly",
    backNote: "Standing with a light weight; no spinal load.",
    eq: "Low cable + ankle strap (bring your own)",
    uni: true,
  }),
  ex("sl-calf-step", "Single-Leg Calf Raise off a Step", "strength", {
    m: { gastroc: P, soleus: S },
    back: "friendly",
    backNote: "Standing, bodyweight; no spinal load.",
    eq: "Step (+ dumbbell optional)",
    uni: true,
  }),
  ex("bottoms-up-kb-carry", "Bottoms-Up KB Carry", "distance", {
    m: { "rotator-cuff": P, "forearm-flexors": P, obliques: S, transverse: S, "delt-front": S, serratus: S, "traps-upper": M },
    back: "friendly",
    backNote: "The core resists the lean; the spine stays tall.",
    eq: "Kettlebell",
    uni: true,
  }),
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
