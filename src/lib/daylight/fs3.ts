import type { DayTemplate, PlanVersion, Prescription, SlotSection } from "./types";

/**
 * "Fine Shyte 3" (Oct 27, 2026). Source: Randy's Fine Shyte 3 plan page, with the Planet Fitness swaps.
 * Names, doses and cues are copied from it. Every lifting move is new compared with Fine Shyte 2; the KB foot flex is the one carryover.
 * One plan for about 6 months, no phases. Warm-ups are a pick-by-feel menu, not fixed slots.
 */

export const FS3_ID_PREFIX = "fine-shyte-3";
export const FS3_EFFECTIVE = "2026-10-27";
const SRC = "Fine Shyte 3 plan (Oct 27, 2026).";

type In = {
  ex: string;
  sets?: number | null;
  reps?: string;
  side?: boolean;
  dur?: string;
  cue: string;
  why: string;
  optional?: boolean;
  section?: SlotSection;
};

function slots(key: string, list: In[]): Prescription[] {
  return list.map((s, i) => ({
    id: `fs3-${key}-${i + 1}`,
    exerciseId: s.ex,
    alternatives: [],
    sets: s.sets ?? null,
    repLabel: s.reps ?? "",
    perSide: Boolean(s.side),
    optional: Boolean(s.optional),
    section: s.section ?? "main",
    durationLabel: s.dur,
    sourceCue: s.cue,
    why: s.why,
    whySource: SRC,
  }));
}

function day(weekday: number, key: string, name: string, psa: string, warmUp: string, list: In[]): DayTemplate {
  return {
    weekday,
    name,
    scheduled: true,
    why: psa,
    whySource: SRC,
    reminders: [`Warm-up, 5–8 min: ${warmUp}. Pick 2–3 from the warm-up menu (Train → PT).`],
    slots: slots(key, list),
    psa,
  };
}

const CHAIN = "Chain move: trains the left lat, right glute and right knee as one line.";
const FIN: SlotSection = "finisher";

export function buildFs3Days(): DayTemplate[] {
  const monday = day(1, "mon", "Lats + Chest", "Pullover first, so the lats are working before any pulldown. Shoulder down first, then the elbow. Drop lat weights about 20% for the first two weeks.", "Lats asleep + Traps / left shoulder", [
    { ex: "lying-cable-pullover", sets: 3, reps: "12–15", cue: "Goes first. Bench lengthwise in front of a low cable, rope or bar overhead, arms nearly straight. Pull to your hips. Lats work in the stretch with no biceps involved.", why: "Lats load in the stretch with no biceps help, so you can feel them before the heavier pulls (stretch-position training)." },
    { ex: "kneeling-cable-pullaround", sets: 3, reps: "10–12", side: true, cue: "One arm, cable up and across. Pull the elbow down and around to the hip. One extra set on the left.", why: `Isolates the weak left lat. ${CHAIN}` },
    { ex: "underhand-pulldown", sets: 4, reps: "8–10", cue: "Shoulder-width grip. 3-second lower. Shoulders down before the elbows bend.", why: "The main vertical pull. Underhand is an easier position for the left shoulder and lets the biceps help you feel the lats." },
    { ex: "landmine-meadows-row", sets: 3, reps: "8–10", side: true, cue: "Stand side-on to the bar, overhand grip on the sleeve. Big stretch at the bottom.", why: "Big stretch at the bottom for the lats and upper back, with the free forearm on your thigh to spare the L4." },
    { ex: "neutral-flat-db-press", sets: 3, reps: "8–10", cue: "Palms facing in. Easier on the left shoulder than a flared press.", why: "Main chest press, chosen for the left shoulder." },
    { ex: "cable-press-around", sets: 3, reps: "12", side: true, cue: "Press across your body past the midline. Hits the inner chest.", why: "Finishes the chest through the inner range a dumbbell can't load." },
    { ex: "stir-the-pot", sets: 3, reps: "6 each way", cue: "Forearms on the ball, plank position, small circles. Spine stays still.", why: "Abs work hard while the spine stays still: right for the L4.", section: FIN },
  ]);

  const tuesday = day(2, "tue", "Arms + Side Delts", "Arms get their own day, while they're fresh, not tacked onto the end of another day. Overhead triceps, Bayesian curls and stretch partials are where the research shows the most growth.", "Traps / left shoulder + one more by feel", [
    { ex: "side-lying-incline-lateral", sets: 3, reps: "12–15", side: true, cue: "Lie on your side on a 30–45° bench. Side delt loaded in the stretch, traps can't help.", why: "Loads the side delt in the stretch while the upper traps stay out." },
    { ex: "lean-away-lateral", sets: 3, reps: "12–15", side: true, cue: "Hold a post or rack and lean away. Loads the side delt in the stretch. On the last set, add half reps in the bottom half until you can't.", why: "Planet Fitness swap for the machine lateral raise; keeps the stretch-biased loading." },
    { ex: "bayesian-curl", sets: 3, reps: "10–12", side: true, cue: "Face away from the cable, arm trailing behind you. Biceps fully stretched.", why: "Biceps worked from full stretch, which grows them more than short-range curls." },
    { ex: "spider-curl", sets: 3, reps: "10–12", cue: "Chest down on an incline bench, arms hanging. No swinging possible.", why: "The opposite end of the range from the Bayesian curl, with no way to cheat." },
    { ex: "seated-db-overhead-tri", sets: 3, reps: "10–12", cue: "One dumbbell, both hands, back supported. Overhead builds about 1.4× more triceps than pressdowns.", why: "Maeo 2023: overhead triceps work grew the triceps about 1.4× more than pressdowns." },
    { ex: "smith-jm-press", sets: 3, reps: "8–10", cue: "Close grip. Lower the bar toward your chin by bending at the elbows. Heavy triceps work.", why: "Heavy triceps work with a fixed bar path and safeties." },
    { ex: "reverse-cable-curl", sets: 2, reps: "12", cue: "Straight bar on a low cable, palms down. Brachialis and forearms make the arm look thicker.", why: "Brachialis and forearms add arm thickness. Planet Fitness swap for the reverse EZ curl." },
    { ex: "fs3-easy-cardio", dur: "20–30 min", cue: "Easy pace. You can talk.", why: "Optional easy cardio.", optional: true, section: FIN },
  ]);

  const wednesday = day(3, "wed", "Legs A · quads + side glute + knee", "Legs land right before Thursday off. Right leg first on single-leg work. Nothing loads your spine: the weight hangs at your hips.", "Right knee / foot + Side glutes asleep", [
    { ex: "kb-foot-flex", sets: 2, reps: "15", side: true, cue: "The one carryover. Kettlebell on the foot, pull toes up, tense the whole leg.", why: "Your own move; you've said it helps the right knee." },
    { ex: "db-suitcase-squat", sets: 4, reps: "8–10", cue: "Plates under the heels, a DB hanging at each side. The load hangs at your hips, not on your back, so the L4 stays unloaded. Torso upright, knees forward.", why: "The main quad lift with no bar on the spine. Planet Fitness swap for the belt squat." },
    { ex: "sl-leg-press", sets: 3, reps: "10", side: true, cue: "Right leg first. Knee tracks over the 2nd toe the whole way.", why: "Quad volume one leg at a time, training right-knee tracking." },
    { ex: "sl-box-squat", sets: 3, reps: "6", side: true, cue: "Sit back to a box on one leg, light DB in the opposite hand. One of the top side-glute exercises in EMG studies.", why: `Ranks among the highest side-glute activation in EMG reviews. ${CHAIN}` },
    { ex: "poliquin-step-up", sets: 2, reps: "12", side: true, cue: "Heel elevated on a small plate, knee drives forward over the toes. Right-knee control.", why: "Builds the inner quad that steadies the right knee." },
    { ex: "side-lying-abduction", sets: 3, reps: "15", side: true, cue: "Bring your own ankle strap for the low cable, or ankle weights. Leg slightly behind you, toes forward. The highest side-glute activation tested (81% MVIC).", why: "Highest side-glute activation tested in the glute EMG review (81% MVIC)." },
    { ex: "leg-press-calf-partials", sets: 4, reps: "12", cue: "Half reps in the bottom stretch only. Produced about 2× the calf growth of full reps in a 2023 study.", why: "Stretch partials roughly doubled calf growth versus full reps in a 2023 study." },
    { ex: "copenhagen-side-plank", sets: 2, reps: "20 sec", side: true, dur: "20 sec", cue: "Top leg on a bench. Obliques and inner thigh together. Knee on the bench to make it easier.", why: "Obliques and inner thighs with the spine still.", section: FIN },
  ]);

  const thursday: DayTemplate = {
    weekday: 4,
    name: "Recess · NOTHING",
    scheduled: false,
    why: "NOTHING. No PT. No mobility homework. A walk only if you feel like it.",
    whySource: SRC,
    reminders: [],
    slots: [],
  };

  const friday = day(5, "fri", "Upper Back + Shoulders + posture + arms", "Shoulder and posture work happens lying face-down or on your side, where studies show the upper traps stay least active. No shrugs anywhere.", "Lats asleep + Abs won't fire", [
    { ex: "prone-y-t-raise", sets: 2, reps: "10 each", cue: "Chest down on an incline bench, light plates. Lower traps work, upper traps stay quiet.", why: "Trap EMG ratios: face-down raises work the lower traps with the upper traps quiet." },
    { ex: "side-lying-er", sets: 2, reps: "12", side: true, cue: "Towel under the elbow. Lowest upper-trap to lower-trap ratio of the exercises tested. Left side first.", why: "Rotator cuff for the left shoulder, with the lowest upper-trap ratio tested." },
    { ex: "cable-1arm-shoulder-press", sets: 3, reps: "8–10", side: true, cue: "Staggered stance with the opposite foot forward. Ribs down.", why: `One arm at a time with a neutral grip suits the left shoulder. ${CHAIN}` },
    { ex: "kneeling-cable-high-row", sets: 3, reps: "10", side: true, cue: "Kneel facing a high cable. Row the handle to your upper chest with the elbow out about 45° (not down to the hip like a pulldown). One extra set on the left.", why: "Mid-back for posture. Planet Fitness swap for the machine high row." },
    { ex: "cable-rear-delt-fly", sets: 3, reps: "15", cue: "Cross the cables at shoulder height, sweep out wide. Rear delts pull the shoulders back.", why: "Rear delts pull the shoulders back for posture." },
    { ex: "db-lateral-drop", sets: 2, reps: "12 → 10 → to failure", cue: "12 reps, drop 30%, 10 reps, drop again, go until you can't.", why: "Second weekly hit for the side delts." },
    { ex: "serratus-punch", sets: 2, reps: "12", side: true, cue: "Reach the fist past lockout. Serratus holds the shoulder blade flat on the ribs.", why: "Serratus keeps the blade on the ribs, taking load off the left shoulder and traps." },
    { ex: "concentration-curl", sets: 2, reps: "12", side: true, cue: "Back to back with the reverse-grip pressdown, one arm at a time. Second weekly hit for arms.", why: "Second weekly biceps hit." },
    { ex: "reverse-grip-pressdown", sets: 2, reps: "12", side: true, cue: "Straight after the concentration curl, same arm. Second weekly hit for arms.", why: "Second weekly triceps hit." },
    { ex: "half-kneeling-cable-lift", sets: 2, reps: "10", side: true, cue: "Low to high across the body. Hips and ribs stay square.", why: `Anti-rotation core. ${CHAIN}`, section: FIN },
  ]);

  const saturday = day(6, "sat", "Legs B · glutes + hamstrings", "Legs land right before Sunday off. Every hinge pulls you backward instead of loading down on the spine.", "Low back / L4 + Side glutes asleep", [
    { ex: "sl-rdl-kb", sets: 3, reps: "8", side: true, cue: "Right leg working = KB in the left hand. Hand on a rack for balance is fine.", why: `One-sided hinge with a light load. ${CHAIN}` },
    { ex: "cable-pull-through", sets: 3, reps: "12", cue: "Hinge with the load pulling you backward, not down on the spine. Squeeze hard at lockout.", why: "Glute hinge without compressing the L4." },
    { ex: "sl-ball-curl", sets: 3, reps: "8", side: true, cue: "On your back, one heel on the ball, hips up. Curl the ball in and roll it out slowly. Hips stay high the whole set.", why: "Hamstrings with no spinal load. Planet Fitness swap for the band-assisted Nordic curl." },
    { ex: "prone-hip-ext", sets: 3, reps: "12", side: true, cue: "Lie face-down on a bench, knee at 90° and slightly out. This version made the opposite lat work harder in an EMG study.", why: `EMG study: this version made the opposite lat work harder. ${CHAIN}` },
    { ex: "cable-kickback-30", sets: 3, reps: "12", side: true, cue: "Bring your own ankle strap. Kick back and slightly out to the side. Upper glute shelf.", why: "Upper glute shelf." },
    { ex: "backward-treadmill", sets: 6, reps: "1 min", dur: "1 min", cue: "Walk backward at a slow speed on an incline, hands light on the rails. Builds the quads with almost no knee or back stress.", why: "Quads with almost no knee or back stress. Planet Fitness swap for the reverse sled drag." },
    { ex: "side-bridge-abduction", sets: 2, reps: "8", side: true, cue: "Side plank, lift the top leg. Among the highest side-glute activation in the reviews.", why: "Among the highest side-glute activation in the reviews." },
    { ex: "cable-hip-adduction", sets: 2, reps: "15", side: true, cue: "Inner thighs keep the pelvis level under the side glutes.", why: "Keeps the pelvis level under the side glutes." },
    { ex: "sl-calf-step", sets: 3, reps: "12", side: true, cue: "2-second pause in the bottom stretch.", why: "Second weekly calf hit, in the stretch." },
    { ex: "bottoms-up-kb-carry", sets: 3, reps: "20 m", side: true, dur: "20 m", cue: "Kettlebell upside down at shoulder height. The left shoulder has to stabilize or it tips.", why: "Loaded carry: the core holds the spine still and the upside-down bell trains the left shoulder to stabilize.", section: FIN },
  ]);

  const sunday: DayTemplate = {
    weekday: 0,
    name: "Off",
    scheduled: false,
    why: "Sunday is off too.",
    whySource: SRC,
    reminders: [],
    slots: [],
  };

  return [sunday, monday, tuesday, wednesday, thursday, friday, saturday];
}

export function buildFs3Plan(version: number, effectiveDate = FS3_EFFECTIVE): PlanVersion {
  return {
    id: `${FS3_ID_PREFIX}-v${version}`,
    name: "Fine Shyte 3",
    version,
    effectiveDate,
    reason: "New plan: all-new movements, Planet Fitness equipment, Thursday off, legs Wed + Sat. Fine Shyte 2 stays in history.",
    sourceLabel: SRC,
    days: buildFs3Days(),
    createdAt: new Date().toISOString(),
  };
}

export function isFs3Plan(plan: PlanVersion): boolean {
  return plan.id.startsWith(FS3_ID_PREFIX);
}

/* ---- Warm-up menu, by feel ---- */
export type WarmItem = { text: string; dose: string; note?: string; how?: string; exerciseId?: string };
export type WarmGroup = { id: string; title: string; tone: "flag" | "pull" | "legs" | "push"; items: WarmItem[] };

export const FS3_WARMUP_INTRO = "5–8 minutes. Pick 2–3 from whatever area is loudest today. Skip the rest.";
/** How-to lines are general education written for this app; the doses and notes are from the plan. */
export const FS3_WARMUP: WarmGroup[] = [
  { id: "l4", title: "Low back / L4", tone: "flag", items: [
    { text: "Dead hang", dose: "20–30s", note: "takes pressure off the spine", exerciseId: "dead-hang" },
    { text: "Prone press-up", dose: "8", note: "only if it eases things", how: "Lie face-down, hands under the shoulders. Press the chest up while the hips stay on the floor and the low back relaxes." },
    { text: "Half-kneeling hip flexor stretch + glute squeeze", dose: "30s/side", how: "Half-kneel, squeeze the back-leg glute and tuck the pelvis until the front of that hip stretches. Don't lean back." },
    { text: "Standing cat-camel against a bench", dose: "8 slow", how: "Hands on a bench, hinge forward. Slowly round, then gently arch the upper back through a small, pain-free range." },
  ] },
  { id: "traps", title: "Traps / left shoulder", tone: "pull", items: [
    { text: "Wall slide with lift-off", dose: "8", how: "Forearms on the wall, slide up into a Y, then lift the hands an inch off the wall without shrugging." },
    { text: "Side-lying external rotation, light", dose: "12/side", exerciseId: "side-lying-er" },
    { text: "Band pull-apart, palms up", dose: "15", exerciseId: "band-pull-apart" },
    { text: "Doorway pec stretch", dose: "30s/side", how: "Forearm on a door frame at shoulder height. Step through until the chest stretches, with no pinch in the front of the shoulder." },
  ] },
  { id: "lats", title: "Lats asleep", tone: "pull", items: [
    { text: "Band lat prayer", dose: "15 with a 1s squeeze", how: "Kneel facing a band anchored high, arms straight. Push the shoulders down to draw the band to your thighs; squeeze 1 second." },
    { text: "Scap pull-up (shoulders down, elbows straight)", dose: "8", how: "Hang from a bar with straight elbows. Pull the shoulders down away from the ears, then let them rise." },
    { text: "Band pullaround", dose: "10/side", how: "The same path as the cable pullaround with a light band: elbow down and around to the hip." },
  ] },
  { id: "knee", title: "Right knee / foot", tone: "legs", items: [
    { text: "KB foot flex", dose: "15/side", note: "yours", exerciseId: "kb-foot-flex" },
    { text: "Band terminal knee extension", dose: "15", how: "Band behind the knee, anchored in front. Straighten the knee fully against the band and squeeze the quad." },
    { text: "Spanish squat hold", dose: "30s", how: "Heavy band around both legs behind the knees, anchored in front. Sit back into a squat with the shins vertical and hold." },
    { text: "Balance on a foam pad with an opposite-arm reach", dose: "5/side", how: "Stand on one leg on a pad. Reach the opposite arm forward and down, knee tracking over the toes." },
  ] },
  { id: "glutes", title: "Side glutes asleep", tone: "legs", items: [
    { text: "Side-lying abduction, heel against a wall", dose: "12/side", exerciseId: "side-lying-abduction" },
    { text: "Hip hike off a step", dose: "10/side", how: "Stand on one leg on a step and let the free hip drop, then lift it level using the standing-side glute." },
    { text: "Standing band abduction", dose: "12/side", how: "Band around the ankles. Stand on one leg and push the other leg out to the side without leaning." },
  ] },
  { id: "abs", title: "Abs won't fire", tone: "push", items: [
    { text: "Bear plank hold, knees an inch up", dose: "20s", how: "On hands and toes with the knees hovering an inch off the floor, back flat. Breathe." },
    { text: "Dead hang with knees tucked", dose: "15s", how: "Hang from a bar and pull the knees to hip height with the pelvis slightly tucked. Hold." },
    { text: "Stir-the-pot", dose: "5 each way", exerciseId: "stir-the-pot" },
  ] },
];

/* ---- Notes from the plan page ---- */
export const FS3_STRIP: { title: string; body: string }[] = [
  { title: "All-new movements", body: "Every lift, carry and core drill differs from Fine Shyte 2. Your KB foot flex is the one thing kept." },
  { title: "Arms get their own day", body: "Tuesday is biceps, triceps and side delts while they're fresh, not tacked onto the end of another day." },
  { title: "Legs Wed + Sat, Thu = nothing", body: "Each leg day lands right before a day off. Thursday is fully off." },
  { title: "No load on the spine", body: "DB suitcase squats instead of a bar on your back, pull-throughs and single-leg hinges, no loaded crunching. Built around the L4." },
  { title: "Traps kept quiet", body: "Shoulder and posture work lying face-down or on your side, where studies show the upper traps stay least active." },
  { title: "Stretch-biased picks", body: "Overhead triceps, pullovers, Bayesian curls and stretch-position partials, where the research shows the most growth." },
  { title: "Planet Fitness gear", body: "Your gym has kettlebells and a landmine, so those moves stay. Swapped for missing machines: cable pullover, lean-away lateral, DB suitcase squat, kneeling cable high row, ball hamstring curl, backward treadmill walk, reverse cable curl. Bring your own ankle strap." },
];

export const FS3_CHAIN = [
  "The left lat and the right glute are linked through the fascia across your low back and fire as a pair when you walk. That's why your left-shoulder notes and your right-glute and right-knee notes keep showing up together.",
  "When the left lat doesn't hold, the right hip loses its anchor, the right knee drifts and the upper traps take over. The chain moves load opposite arm and leg at the same time. This idea rests on anatomy and EMG work. Training trials are still in progress, so judge it by how your knee and shoulder feel.",
];

export const FS3_LATS = [
  "Shoulder down first, then the elbow. If the shoulder rises, the rep doesn't count.",
  "Pullover first on Monday, so the lats are working before any pulldown.",
  "Drop the weight about 20% on lat moves for the first two weeks.",
  "Think “elbow to back pocket,” then hold the squeeze for 1 second.",
  "No shrugs anywhere. Your traps are already doing too much.",
];

export const FS3_ABS = "Ab training builds only modest size, and visible abs mostly come from body fat. The core work here keeps the spine still while the abs work hard: stir-the-pot, Copenhagen, cable lifts, side bridges and carries. Sit-ups and loaded crunches are out because bending the spine under load is the worst match for an L4 bulge.";

export const FS3_RUNNING = [
  "When every set hits the top of the rep range with clean form, add weight next time.",
  "Stop most sets with 1–2 reps left in the tank.",
  "About every 8 weeks, or when you feel beat up, take one week at half the sets. Same exercises.",
  "Keep the exercises fixed. Changing them too often blunts growth, and you're already rotating by switching plans every few months.",
  "If a move hurts (sharp pain, numbness down the leg, a pinch in the left shoulder), swap only that move and keep the rest. Run anything persistent past your PT.",
];

export const FS3_LOG: { date: string; text: string }[] = [
  { date: "Oct 14", text: "Space between pits and arms lets the chest open up." },
  { date: "Oct 21", text: "Left lat weakness keeps the left shoulder from retracting; limits upper chest and front-delt range." },
  { date: "Oct 23", text: "Back of right knee extending the shin down stabilizes the upper right glute shelf. It only fires with hip space." },
  { date: "Oct 27", text: "Keep Thursday off. Legs not on scattered days. PT by feel, floor work not helping. L4 bulge, old left-shoulder hook injury, tight traps. Hard to feel lats, biceps, triceps, abs. Want side delts, side glutes, defined abs, better posture. KB foot flex has helped. New movements, not a reshuffle. One plan for about 6 months." },
  { date: "Oct 27", text: "Training at Planet Fitness, no machine lateral raise. There are kettlebells and a landmine, so the Meadows row and KB moves stay. Swapped: cable pullover, lean-away lateral, DB suitcase squat, kneeling cable high row, ball hamstring curl, backward treadmill walk, reverse cable curl. Bring an ankle strap." },
];

export const FS3_RESEARCH: { label: string; url: string; finding: string }[] = [
  { label: "Kassiano 2022", url: "https://lida.sport-iat.de/ta/Record/4077216", finding: "planned exercise changes help; changing too often hurts." },
  { label: "Maeo 2023", url: "https://pubmed.ncbi.nlm.nih.gov/35819335/", finding: "overhead triceps work grew the triceps about 1.4× more." },
  { label: "Stretch-position training", url: "https://www.strongerbyscience.com/stretch-mediated-hypertrophy/", finding: "the calf partials study and Maeo's leg-curl study." },
  { label: "Glute EMG review", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3201064", finding: "side-lying abduction and single-leg work rank highest for the side glutes." },
  { label: "Distefano summary", url: "https://mikereinold.com/best-exercises-for-gluteus-maximus-and/", finding: "the same glute rankings, summarised." },
  { label: "Trap EMG ratios", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4886800", finding: "face-down and side-lying positions keep the upper traps quiet." },
  { label: "Prone hip extension EMG", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6382482", finding: "the knee-bent, hip-out version made the opposite lat work harder." },
  { label: "McGill (Waterloo)", url: "https://uwaterloo.ca/kinesiology-health-sciences/hes-got-our-backs", finding: "loaded spine bending and the disc." },
];

export const FS3_IMPORT_NOTES = [
  "All six training days, every move, dose and cue come from the Fine Shyte 3 plan, including the Planet Fitness swaps.",
  "Every move has a form guide (steps, stance, brace, grip, range, tempo, what to feel, mistakes to avoid and a back / shoulder note), muscle map, demo animation or still, and photos where the open dataset has them.",
  "Warm-ups are a pick-by-feel menu (Train → PT), not fixed slots.",
  "Thursday and Sunday are off.",
  "Fine Shyte 2 and its PT board stay in Versions as history.",
];
