import { exercises, exerciseById } from "./exercises";
import type { DayTemplate, PlanVersion, Prescription, PtReference, SlotSection } from "./types";

export { exercises, exerciseById };

/**
 * "Fine Shyte Plan" (PDF, page 1). The PDF is the source of truth: exercise names, set × rep strings and the
 * "Form:" cue on every move are copied from it. Ranges are written with an en dash here (PDF: `3x12-15`).
 */

type SlotInput = {
  ex: string;
  alt?: string[];
  sets?: number | null;
  setsMax?: number;
  reps?: string;
  side?: boolean;
  dur?: string;
  cue?: string;
  optional?: boolean;
};

function mk(day: string, section: SlotSection, index: number, input: SlotInput): Prescription {
  const note =
    section === "activation"
      ? "PT activation comes first in the PDF."
      : section === "finisher"
        ? "Listed under Abs / Cardio / Finisher in the PDF."
        : "Listed under Workout in the PDF.";
  return {
    id: `${day}-${section === "activation" ? "pt" : section === "finisher" ? "fin" : "w"}${index}`,
    exerciseId: input.ex,
    alternatives: (input.alt ?? []).map((exerciseId, i) => ({ id: `alt-${day}-${index}-${i}`, exerciseId })),
    sets: input.sets ?? null,
    setsMax: input.setsMax,
    repLabel: input.reps ?? "",
    perSide: Boolean(input.side),
    optional: Boolean(input.optional),
    section,
    durationLabel: input.dur,
    sourceCue: input.cue ?? null,
    why: note,
    whySource: "Fine Shyte Plan PDF, page 1.",
  };
}

function build(
  weekday: number,
  key: string,
  name: string,
  psa: string,
  pt: SlotInput[],
  work: { section?: SlotSection; input: SlotInput }[],
  fin: { section?: SlotSection; input: SlotInput }[],
  extra: Partial<DayTemplate> = {},
): DayTemplate {
  const slots: Prescription[] = [];
  pt.forEach((input, i) => slots.push(mk(key, "activation", i + 1, input)));
  work.forEach((w, i) => slots.push(mk(key, w.section ?? "main", i + 1, w.input)));
  fin.forEach((f, i) => slots.push(mk(key, f.section ?? "finisher", i + 1, f.input)));
  return {
    weekday,
    name,
    scheduled: true,
    why: `${name} is on the PDF schedule for this weekday.`,
    whySource: "Fine Shyte Plan PDF, page 1.",
    reminders: [],
    slots,
    psa,
    ...extra,
  };
}

const W = (input: SlotInput, section?: SlotSection) => ({ input, section });

export function buildPdfDays(): DayTemplate[] {
  const sunday: DayTemplate = {
    weekday: 0,
    name: "Open day",
    scheduled: false,
    why: "The PDF has no Sunday. Use it to rest, walk, or prep food.",
    whySource: "Fine Shyte Plan PDF has Monday to Saturday only.",
    reminders: [],
    slots: [],
  };

  const monday = build(
    1,
    "mon",
    "Pull + Abs",
    "Pull from your back, not your arms. This day gives lats, mid-back, rear delts, and traps without stacking four similar rows.",
    [
      { ex: "ppt", sets: 2, reps: "8", cue: "press low back down, tuck pelvis, exhale fully." },
      { ex: "bird-dog", sets: 2, reps: "6", side: true, cue: "reach long, keep hips square, no twisting." },
      { ex: "bracing-marches", sets: 2, reps: "8", side: true, cue: "brace before each march; don’t let low back arch." },
    ],
    [
      W({ ex: "assisted-pullup", alt: ["neutral-pullup"], sets: 4, reps: "6–8", cue: "drive elbows down toward ribs; don’t pull with just biceps." }),
      W({ ex: "chest-supported-row", sets: 4, reps: "8–10", cue: "let shoulder blades stretch forward, then row hard without lifting chest." }),
      W({ ex: "half-kneeling-pulldown", sets: 3, reps: "10", side: true, cue: "ribs down, elbow to pocket, no torso twist." }),
      W({ ex: "face-pull", sets: 3, reps: "12–15", cue: "pull to upper face, rotate back, don’t shrug." }),
      W({ ex: "incline-shrug", sets: 3, reps: "10–12", cue: "chest supported, shrug up/back, pause; no shoulder rolling." }),
      W({ ex: "straight-arm-pulldown", sets: 2, setsMax: 3, reps: "12–15", cue: "long arms, lats do the work, ribs controlled." }),
    ],
    [
      W({ ex: "reverse-crunch", sets: 3, reps: "10–12", cue: "curl pelvis toward ribs; don’t just swing legs." }),
      W({ ex: "cable-crunch", sets: 2, reps: "12", cue: "ribs to pelvis, round through abs, don’t sit back." }),
    ],
  );

  const tuesday = build(
    2,
    "tue",
    "Lower 1 / Quad Bias + Cardio",
    "Quad day stays quad day. Don’t turn every lower day into glute/ham/back work.",
    [
      { ex: "clamshell", sets: 2, reps: "15", side: true, cue: "hips stacked, don’t roll backward, squeeze side glute." },
      { ex: "band-walks", sets: 2, reps: "12 steps each way", cue: "stay low, toes forward, constant band tension." },
      { ex: "single-leg-stand", sets: 2, reps: "20 sec", side: true, dur: "20 sec", cue: "tall posture, ribs down, pelvis level." },
    ],
    [
      W({ ex: "hack-squat", alt: ["heel-elevated-goblet"], sets: 4, reps: "6–8", cue: "brace hard, knees track forward, torso stacked." }),
      W({ ex: "bulgarian-split-squat", sets: 3, reps: "8", side: true, cue: "slight forward lean, pelvis stable, full foot planted." }),
      W({ ex: "leg-press", sets: 3, reps: "10–12", cue: "controlled depth, don’t bounce, don’t let hips tuck hard." }),
      W({ ex: "leg-extension", sets: 2, setsMax: 3, reps: "12–15", cue: "squeeze top, slow lower, don’t swing reps." }),
      W({ ex: "standing-calf-raise", sets: 4, reps: "10–12", cue: "full stretch, full lift, pause at peak." }),
      W({ ex: "tibialis-raise", sets: 3, reps: "15–20", cue: "lift toes hard, control down, don’t rush." }),
    ],
    [W({ ex: "tuesday-cardio", dur: "15–20 min", cue: "incline walk, bike, or elliptical; moderate, not death." })],
    { sectionPsa: { finisher: "save your legs for growth, not punishment." } },
  );

  const wednesday = build(
    3,
    "wed",
    "Push + Shoulders",
    "Push day builds chest, shoulders, and triceps while using landmine pressing to reduce shoulder/low-back stress.",
    [
      { ex: "pt-shoulder-flexion", sets: 2, reps: "8", cue: "keep ribs down as arms go overhead; don’t arch." },
      { ex: "seated-pigeon", sets: 2, reps: "30–45 sec", side: true, dur: "30–45 sec", cue: "hinge forward gently, don’t force the hip." },
      { ex: "dead-bug", sets: 2, reps: "8", side: true, cue: "low back pressed down, slow reach, full exhale." },
    ],
    [
      W({ ex: "incline-db-press", sets: 4, reps: "8", cue: "upper chest bias, controlled lower, don’t over-flare elbows." }),
      W({ ex: "landmine-press", sets: 3, reps: "8–10", side: true, cue: "press up and forward, ribs down, don’t arch low back." }),
      W({ ex: "machine-chest-press", alt: ["weighted-pushup"], sets: 3, reps: "10", cue: "shoulders pinned, full range, chest leads." }),
      W({ ex: "low-high-fly", sets: 3, reps: "12", cue: "sweep upward, soft elbows, squeeze without slamming handles." }),
      W({ ex: "cable-lateral-raise", sets: 4, reps: "12–15", cue: "lead with elbow, stop around shoulder/eye level, traps stay quiet." }),
      W({ ex: "overhead-rope-triceps", sets: 3, reps: "10–12", cue: "stretch triceps fully, elbows fixed, hard lockout." }),
      W({ ex: "assisted-dip", sets: 2, setsMax: 3, reps: "8–10", cue: "controlled bottom, slight forward lean, don’t dump shoulders." }),
    ],
    [W({ ex: "wednesday-cardio", dur: "10–15 min", optional: true, cue: "only if recovery feels good." })],
    { reminders: ["Cardio stays optional."], sectionPsa: { finisher: "shoulders already got work; don’t add random burnout sets." } },
  );

  const thursday = build(
    4,
    "thu",
    "Active Recovery + PT",
    "Active recovery should make you feel better after, not accomplished because you destroyed yourself.",
    [
      { ex: "suitcase-carry", sets: 3, reps: "20–30 m", side: true, dur: "20–30 m", cue: "walk tall, don’t lean, ribs stacked over pelvis." },
      { ex: "plank", sets: 2, setsMax: 3, reps: "20–40 sec", dur: "20–40 sec", cue: "glutes tight, ribs down, no sagging." },
      { ex: "seated-pigeon", sets: 2, reps: "30–45 sec", side: true, dur: "30–45 sec", cue: "breathe into the stretch; keep it controlled." },
    ],
    [
      W({ ex: "zone2", dur: "25–35 min", cue: "conversational pace; you should not feel cooked after." }, "cardio"),
      W({ ex: "pallof", sets: 3, reps: "20 sec", side: true, dur: "20 sec", cue: "stay tall, resist rotation, ribs down." }),
      W({ ex: "mobility-flow", dur: "5–8 min", cue: "gentle hips, hamstrings, glutes; no aggressive spinal stretching." }, "mobility"),
    ],
    [],
    {
      reminders: ["No hard finisher."],
      sectionPsa: { main: "keep this day easy enough that Friday improves, not suffers.", finisher: "the recovery is the point." },
      sectionNote: { finisher: "No hard finisher" },
    },
  );

  const friday = build(
    5,
    "fri",
    "Lower 2 / Glute-Ham Bias + Abs",
    "Posterior day is strong but not stupid: hip thrust + B-stance RDL + leg curl gives glute/ham growth without overloading your spine with too many hinge clones.",
    [
      { ex: "ppt", sets: 2, reps: "8", cue: "reset pelvis before hinge work; exhale and flatten low back." },
      { ex: "bird-dog", sets: 2, reps: "6", side: true, cue: "move slow; own the balance before adding load later." },
      { ex: "clamshell", sets: 1, setsMax: 2, reps: "15", side: true, cue: "wake up glute med, don’t fatigue it." },
    ],
    [
      W({ ex: "hip-thrust", alt: ["machine-hip-thrust"], sets: 4, reps: "8", cue: "ribs down, slight pelvic tuck, hard glute squeeze; don’t hyperextend." }),
      W({ ex: "bstance-rdl", sets: 3, reps: "8", side: true, cue: "hinge from hips, soft knee, lats tight, back leg assists only." }),
      W({ ex: "leg-curl", alt: ["lying-leg-curl"], sets: 3, reps: "10–12", cue: "curl hard, slow lower, hips stay planted." }),
      W({ ex: "reverse-lunge", alt: ["box-step-up"], sets: 3, reps: "8", side: true, cue: "stable pelvis, push through whole foot, no rushing balance." }),
      W({ ex: "back-extension-45", sets: 2, setsMax: 3, reps: "12", cue: "move through hips, squeeze glutes, stop before low-back takeover." }),
      W({ ex: "cable-hip-abduction", sets: 2, setsMax: 3, reps: "15", side: true, cue: "slight forward lean, controlled sweep, no swinging." }),
      W({ ex: "seated-calf-raise", sets: 4, reps: "12–15", cue: "long stretch at bottom, pause at top." }),
    ],
    [
      W({ ex: "cable-crunch", sets: 3, reps: "12", cue: "exhale hard, curl ribs down, slow return." }),
      W({ ex: "reverse-crunch", sets: 2, reps: "10", cue: "posterior tilt first, then lift; no momentum." }),
    ],
  );

  const saturday = build(
    6,
    "sat",
    "Delts + Arms + Traps + Cardio",
    "This fills the gap: side delts, rear delts, traps, arms, carries, and shoulder-control work.",
    [
      { ex: "band-walks", sets: 1, setsMax: 2, reps: "12 steps each way", cue: "controlled steps, knees out, no torso sway." },
      { ex: "single-leg-stand", sets: 2, reps: "20 sec", side: true, dur: "20 sec", cue: "pelvis level, foot tripod strong." },
      { ex: "ppt", sets: 1, setsMax: 2, reps: "8", cue: "use this as a quick spine/core reset." },
    ],
    [
      W({ ex: "shoulder-press", alt: ["machine-shoulder-press"], sets: 3, reps: "8–10", cue: "don’t overarch; press from stacked ribs/pelvis." }),
      W({ ex: "btb-lateral-raise", sets: 3, reps: "12–15", cue: "let side delt stretch, raise with control, traps stay down." }),
      W({ ex: "reverse-pec-deck", sets: 3, reps: "12–15", cue: "lead with elbows, don’t shrug, pause behind body." }),
      W({ ex: "y-raise", sets: 2, setsMax: 3, reps: "12", cue: "raise in a V path, light weight, feel lower trap/shoulder control." }),
      W({ ex: "ez-curl", sets: 3, reps: "10", cue: "elbows fixed, no torso swing, full squeeze." }),
      W({ ex: "incline-db-curl", sets: 2, setsMax: 3, reps: "10–12", cue: "full biceps stretch, slow lower, don’t turn it into a shoulder raise." }),
      W({ ex: "rope-pressdown", sets: 3, reps: "10–12", cue: "elbows pinned, spread rope at bottom, full lockout." }),
      W({ ex: "cross-body-cable-ext", sets: 2, setsMax: 3, reps: "10–12", side: true, cue: "keep shoulder still, load triceps through full range." }),
    ],
    [
      W({ ex: "farmer-carry", sets: 3, reps: "20–30 m", dur: "20–30 m", cue: "heavy but clean, shoulders down/back, walk tall." }),
      W({ ex: "saturday-cardio", dur: "15–20 min", cue: "easy-moderate, don’t fry recovery." }),
    ],
  );

  return [sunday, monday, tuesday, wednesday, thursday, friday, saturday];
}

export function buildPdfPlan(version: number, effectiveDate: string, extra?: { id?: string; reason?: string }): PlanVersion {
  return {
    id: extra?.id ?? `fine-shyte-pdf-v${version}`,
    name: "Fine Shyte Plan",
    version,
    effectiveDate,
    reason: extra?.reason ?? "Full import of the Fine Shyte Plan PDF: every move, dose, form cue and day PSA.",
    sourceLabel: "Fine Shyte Plan PDF, page 1 (schedule) and page 2 (PT board).",
    days: buildPdfDays(),
    createdAt: new Date().toISOString(),
  };
}

/** Plan a brand-new install starts with. */
export function seedPlan(): PlanVersion {
  return buildPdfPlan(1, "2000-01-01");
}

export function isPdfPlan(plan: PlanVersion): boolean {
  return plan.id.startsWith("fine-shyte-pdf");
}

const REF = "Page 2 reference";

function ref(id: string, exerciseId: string, boardDose: string, prescription: string, discrepancy?: string): PtReference {
  const ex = exerciseById(exerciseId);
  return {
    id,
    exerciseId,
    page: REF,
    parameters: `Board says: ${boardDose}. Schedule (page 1): ${prescription}.`,
    discrepancy,
    provider: "Not recorded. Page 2 is a personal reference board, not proof of a clinician prescription.",
    userNote: "",
    pdfNote: ex?.pdfNote,
  };
}

/** Page 2 of the PDF: ten PT/activation moves with Randy’s own notes. */
export const PT_REFERENCES: PtReference[] = [
  ref("pt-ppt", "ppt", "2 minutes", "2 × 8 (Mon, Fri), 1–2 × 8 light (Sat)"),
  ref("pt-brace", "bracing-marches", "2 minutes", "2 × 8 / side (Mon)"),
  ref("pt-clam", "clamshell", "2 sets × 10 reps", "2 × 15 / side (Tue), 1–2 × 15 / side (Fri)", "The board shows 10 reps; the weekly schedule says 15. The schedule is what the plan uses."),
  ref("pt-bird", "bird-dog", "2 minutes", "2 × 6 / side (Mon, Fri)"),
  ref("pt-pigeon", "seated-pigeon", "3 sets", "2 × 30–45 sec / side (Wed, Thu)", "The board shows 3 sets; the schedule says 2."),
  ref("pt-stand", "single-leg-stand", "2 sets × 10 reps", "2 × 20 sec / side (Tue, Sat)", "The board counts reps; the schedule uses 20-second holds."),
  ref("pt-band", "band-walks", "3 laps", "2 × 12 steps each way (Tue), 1–2 × 12 (Sat)"),
  ref("pt-carry", "suitcase-carry", "3 laps", "3 × 20–30 m / side (Thu)"),
  ref("pt-flex", "pt-shoulder-flexion", "2 minutes", "2 × 8 (Wed)"),
  ref("pt-plank", "plank", "2 sets", "2–3 × 20–40 sec (Thu)"),
];

export const UNSCHEDULED = {
  exerciseId: "battle-rope-squat",
  note: "Page 2 features Battle Rope Squats (“Meta!”, “Oscilate Anchor when needed”, “S Tier”). It has no dose and is not on the weekly schedule, so it sits in the library as an optional add-on you can drop into any day.",
};

export const IMPORT_NOTES = [
  "All six days (Monday to Saturday) are imported from page 1: PT activation first, workout, abs / cardio / finisher, and the day PSA.",
  "Every move carries the “Form:” line from the PDF word for word. These are labeled as PDF cues; general education is labeled separately.",
  "“Or” moves (pull-up options, hack squat or goblet squat, machine press or weighted push-up, hip thrust options, leg curl options, lunge or step-up, shoulder press options) are one slot with swap options.",
  "Page 2 notes are kept as your own words: Nice Hip Opener, Go Slow at First, Kick straight back, Use body weight, nice ab opener, Uses so much leggg in a good way, I like to do this to activate abs, Bend the kneees, Buttt down.",
  "Where page 1 and page 2 disagree on a dose, page 1 is the plan and page 2 is shown as “board says”.",
  "Sunday is not in the PDF, so it is an open day.",
  "The PDF’s watermarked artwork is not reproduced.",
];

export function dayTemplate(plan: PlanVersion, weekday: number): DayTemplate {
  return (
    plan.days.find((day) => day.weekday === weekday) ?? {
      weekday,
      name: "Open day",
      scheduled: false,
      why: "Nothing scheduled.",
      whySource: "",
      reminders: [],
      slots: [],
    }
  );
}

export function activePlan(plans: PlanVersion[], onDate: string): PlanVersion {
  const eligible = plans
    .filter((plan) => plan.effectiveDate <= onDate)
    .sort((a, b) => b.version - a.version || b.effectiveDate.localeCompare(a.effectiveDate));
  return eligible[0] ?? plans[plans.length - 1]!;
}

export const SECTION_LABEL: Record<string, string> = {
  activation: "PT activation first",
  pt: "PT activation first",
  main: "Workout",
  mobility: "Workout",
  cardio: "Workout",
  finisher: "Abs / cardio / finisher",
};

/** Group a day’s slots into the PDF’s three blocks, in order. */
export function dayBlocks(day: DayTemplate, slots: Prescription[] = day.slots): { id: "activation" | "workout" | "finisher"; label: string; slots: Prescription[] }[] {
  const act = slots.filter((s) => s.section === "activation" || s.section === "pt");
  const fin = slots.filter((s) => s.section === "finisher");
  const work = slots.filter((s) => !act.includes(s) && !fin.includes(s));
  // Cardio that sits in the Workout column (Thursday Zone 2) belongs with Workout; the finisher cell keeps its own cardio.
  return [
    { id: "activation" as const, label: "PT activation first", slots: act },
    { id: "workout" as const, label: "Workout", slots: work },
    { id: "finisher" as const, label: "Abs / cardio / finisher", slots: fin },
  ].filter((block) => block.slots.length > 0 || (block.id === "finisher" && Boolean(day.sectionNote?.finisher)));
}
