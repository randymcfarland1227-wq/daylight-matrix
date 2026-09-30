import type { DayTemplate, ExerciseDef, PlanVersion, Prescription, PtReference } from "./types";

const REVIEWED = "2026-09-30";

export const exercises: ExerciseDef[] = [
  {
    id: "ppt",
    name: "Posterior Pelvic Tilt",
    kind: "activation",
    unilateral: false,
    eduCue: "Gently tuck the pelvis so the lower back softens. Stop before it feels forced.",
    eduSource: "General education summary of a posterior pelvic tilt. Not a cue from the PDF.",
    eduReviewed: REVIEWED,
  },
  {
    id: "bird-dog",
    name: "Bird Dog",
    kind: "activation",
    unilateral: true,
    eduCue: "Hips stay level. Reach only as far as you can without rotating or arching.",
    eduSource: "Coaching summary in the tradition of Stuart McGill’s bird-dog stability drill. Not a PDF cue.",
    eduReviewed: REVIEWED,
  },
  {
    id: "bracing-marches",
    name: "Abdominal Bracing Marches",
    kind: "activation",
    unilateral: true,
    eduCue: "Brace the abdomen as if preparing for a light poke, then march without losing that brace.",
    eduSource: "General education. Not a cue from the PDF and not a clinical instruction.",
    eduReviewed: REVIEWED,
  },
  {
    id: "assisted-pullup",
    name: "Assisted Pull-Up",
    kind: "strength",
    unilateral: false,
    usesAssistance: true,
    eduCue: "Start from a full hang if you can. Pull until the chin is near the bar, then lower under control.",
    eduSource: "General education after ExRx’s pull-up listing. Not a cue from the PDF.",
    eduReviewed: REVIEWED,
  },
  {
    id: "neutral-pullup",
    name: "Neutral-Grip Pull-Up",
    kind: "strength",
    unilateral: false,
    eduCue: "Palms face each other. Same full hang and controlled lower as a pull-up, if that range is available.",
    eduSource: "General education. Not a cue from the PDF.",
    eduReviewed: REVIEWED,
  },
  {
    id: "clamshell",
    name: "Clamshells",
    kind: "strength",
    unilateral: true,
    eduCue: "Lie on your side with knees bent. Rotate the top knee up without rolling the pelvis backward.",
    eduSource: "General education. Not a cue from the PDF.",
    eduReviewed: REVIEWED,
  },
  {
    id: "zone2",
    name: "Zone 2 Cardio",
    kind: "cardio",
    unilateral: false,
    eduCue: "Easy enough that you could speak in sentences. The PDF names the zone and the time range, not a machine.",
    eduSource: "The time range is from page 1. The talk-test line is general education, not a clinical target.",
    eduReviewed: REVIEWED,
  },
  {
    id: "pallof",
    name: "Pallof Press Hold",
    kind: "timed",
    unilateral: true,
    eduCue: "Hold the band or cable at your chest and resist the twist. It is a hold, not a punch.",
    eduSource: "General education named for the Pallof press. Not a cue from the PDF.",
    eduReviewed: REVIEWED,
  },
  {
    id: "mobility-flow",
    name: "Mobility flow",
    kind: "mobility",
    unilateral: false,
    eduCue: "Move through the ranges you already use. The PDF gives a time window, not a sequence.",
    eduSource: "Duration is from page 1. No sequence was invented.",
    eduReviewed: REVIEWED,
  },
  {
    id: "tuesday-cardio",
    name: "Cardio",
    kind: "cardio",
    unilateral: false,
    eduSource: "Tuesday’s day title includes cardio. Modality and duration were not in the written handoff.",
    eduReviewed: REVIEWED,
  },
  {
    id: "seated-pigeon",
    name: "Seated Pigeon",
    kind: "mobility",
    unilateral: true,
  },
  {
    id: "single-leg-stand",
    name: "Single-Leg Stand",
    kind: "timed",
    unilateral: true,
  },
  {
    id: "band-walks",
    name: "Band Walks",
    kind: "strength",
    unilateral: false,
  },
  {
    id: "suitcase-carry",
    name: "Suitcase Carry",
    kind: "distance",
    unilateral: true,
  },
  {
    id: "pt-shoulder-flexion",
    name: "Pelvic Tilt with Shoulder Flexion",
    kind: "activation",
    unilateral: false,
  },
  {
    id: "plank",
    name: "Plank",
    kind: "timed",
    unilateral: false,
  },
  {
    id: "battle-rope-squat",
    name: "Battle Rope Squats",
    kind: "strength",
    unilateral: false,
  },
];

export function exerciseById(id: string): ExerciseDef | undefined {
  return exercises.find((item) => item.id === id);
}

function slot(partial: Prescription): Prescription {
  return partial;
}

const monday: DayTemplate = {
  weekday: 1,
  name: "Pull + Abs",
  scheduled: true,
  why: "Page 1 schedules pulling work and abdominal training on Monday.",
  whySource: "Fine Shyte 2, page 1, as quoted in the handoff.",
  reminders: [],
  slots: [
    slot({
      id: "mon-ppt",
      exerciseId: "ppt",
      alternatives: [],
      sets: 2,
      repLabel: "8",
      perSide: false,
      optional: false,
      section: "activation",
      sourceCue: null,
      why: "Listed in Monday’s activation, before the pulling work.",
      whySource: "Fine Shyte 2, page 1.",
    }),
    slot({
      id: "mon-bird",
      exerciseId: "bird-dog",
      alternatives: [],
      sets: 2,
      repLabel: "6",
      perSide: true,
      optional: false,
      section: "activation",
      sourceCue: null,
      why: "Listed in Monday’s activation.",
      whySource: "Fine Shyte 2, page 1.",
    }),
    slot({
      id: "mon-march",
      exerciseId: "bracing-marches",
      alternatives: [],
      sets: 2,
      repLabel: "8",
      perSide: true,
      optional: false,
      section: "activation",
      sourceCue: null,
      why: "Listed in Monday’s activation.",
      whySource: "Fine Shyte 2, page 1.",
    }),
    slot({
      id: "mon-pull",
      exerciseId: "assisted-pullup",
      alternatives: [{ id: "alt-neutral", exerciseId: "neutral-pullup" }],
      sets: 4,
      repLabel: "6–8",
      perSide: false,
      optional: false,
      section: "main",
      sourceCue: null,
      why: "Page 1’s first main Monday slot is one vertical pull with two options, not two separate exercises.",
      whySource: "Fine Shyte 2, page 1.",
    }),
  ],
};

const tuesday: DayTemplate = {
  weekday: 2,
  name: "Lower 1 / Quad Bias + Cardio",
  scheduled: true,
  why: "Page 1 names Tuesday as lower-body work with a quad bias, plus cardio.",
  whySource: "Fine Shyte 2, page 1, as quoted in the handoff.",
  reminders: [],
  slots: [
    slot({
      id: "tue-clam",
      exerciseId: "clamshell",
      alternatives: [],
      sets: 2,
      repLabel: "15",
      perSide: true,
      optional: false,
      section: "main",
      sourceCue: null,
      why: "Page 1 specifies clamshells at 2 × 15 per side. The page 2 image shows 2 × 10 and is kept as a separate reference.",
      whySource: "Fine Shyte 2, page 1. Discrepancy flagged, not merged.",
    }),
    slot({
      id: "tue-cardio",
      exerciseId: "tuesday-cardio",
      alternatives: [],
      sets: null,
      repLabel: "",
      perSide: false,
      optional: false,
      section: "cardio",
      sourceCue: null,
      why: "The day title includes cardio. Modality and duration were not in the written handoff, so this slot stays open.",
      whySource: "Fine Shyte 2, page 1 day title only.",
      openNote: "Dose not in the written handoff. Log what you actually do, or leave it.",
    }),
  ],
};

const wednesday: DayTemplate = {
  weekday: 3,
  name: "Push + Shoulders",
  scheduled: true,
  why: "Page 1 names Wednesday as push and shoulder work.",
  whySource: "Fine Shyte 2, page 1, as quoted in the handoff.",
  reminders: ["Cardio stays optional."],
  slots: [],
};

const thursday: DayTemplate = {
  weekday: 4,
  name: "Active Recovery + PT",
  scheduled: true,
  why: "Page 1 makes Thursday a recovery and physical-therapy day, not a missed strength day.",
  whySource: "Fine Shyte 2, page 1, as quoted in the handoff.",
  reminders: ["No hard finisher."],
  slots: [
    slot({
      id: "thu-zone2",
      exerciseId: "zone2",
      alternatives: [],
      sets: null,
      repLabel: "",
      perSide: false,
      optional: false,
      section: "cardio",
      durationLabel: "25–35 minutes",
      sourceCue: null,
      why: "Page 1 schedules easy aerobic work on the recovery day.",
      whySource: "Fine Shyte 2, page 1.",
    }),
    slot({
      id: "thu-pallof",
      exerciseId: "pallof",
      alternatives: [],
      sets: 3,
      repLabel: "20 seconds",
      perSide: true,
      optional: false,
      section: "pt",
      durationLabel: "20 seconds",
      sourceCue: null,
      why: "Page 1 includes this hold in Thursday’s session.",
      whySource: "Fine Shyte 2, page 1.",
    }),
    slot({
      id: "thu-flow",
      exerciseId: "mobility-flow",
      alternatives: [],
      sets: null,
      repLabel: "",
      perSide: false,
      optional: false,
      section: "mobility",
      durationLabel: "5–8 minutes",
      sourceCue: null,
      why: "Page 1 closes Thursday with a short mobility flow.",
      whySource: "Fine Shyte 2, page 1.",
    }),
  ],
};

const friday: DayTemplate = {
  weekday: 5,
  name: "Lower 2 / Glute-Ham Bias + Abs",
  scheduled: true,
  why: "Page 1 names Friday as lower-body work with a glute and hamstring bias, plus abs.",
  whySource: "Fine Shyte 2, page 1, as quoted in the handoff.",
  reminders: [],
  slots: [],
};

const saturday: DayTemplate = {
  weekday: 6,
  name: "Delts + Arms + Traps + Cardio",
  scheduled: true,
  why: "Page 1 names Saturday as delts, arms, traps, and cardio.",
  whySource: "Fine Shyte 2, page 1, as quoted in the handoff.",
  reminders: [],
  slots: [],
};

const sunday: DayTemplate = {
  weekday: 0,
  name: "No session scheduled",
  scheduled: false,
  why: "Sunday is unspecified in the source. Nothing was added.",
  whySource: "Fine Shyte 2, page 1.",
  reminders: [],
  slots: [],
};

export const PLAN_V1: PlanVersion = {
  id: "fine-shyte-v1",
  name: "Fine Shyte Plan — original",
  version: 1,
  effectiveDate: "2026-09-30",
  reason: "Draft baseline from the written handoff. Page 1 schedule kept. Unquoted slots were not invented.",
  sourceLabel: "Fine Shyte 2 PDF, page 1, via the September 30, 2026 handoff.",
  days: [sunday, monday, tuesday, wednesday, thursday, friday, saturday],
  createdAt: "2026-09-30T00:00:00.000Z",
};

export const PT_REFERENCES: PtReference[] = [
  {
    id: "pt-ppt",
    exerciseId: "ppt",
    page: "Page 2 reference",
    parameters: "Quantity not included in the written handoff.",
    provider: "Not recorded. Page 2 is a personal reference board, not proof of a clinician prescription.",
    userNote: "",
  },
  {
    id: "pt-brace",
    exerciseId: "bracing-marches",
    page: "Page 2 reference",
    parameters: "Shown as bracing with marches. Quantity not included in the written handoff.",
    provider: "Not recorded.",
    userNote: "",
  },
  {
    id: "pt-clam",
    exerciseId: "clamshell",
    page: "Page 2 reference",
    parameters: "Reference image: 2 × 10.",
    discrepancy: "Page 1 Tuesday schedule says 2 × 15 per side. The schedule keeps 15. This card keeps 10.",
    provider: "Not recorded.",
    userNote: "",
  },
  {
    id: "pt-bird",
    exerciseId: "bird-dog",
    page: "Page 2 reference",
    parameters: "Quantity not included in the written handoff.",
    provider: "Not recorded.",
    userNote: "",
  },
  {
    id: "pt-pigeon",
    exerciseId: "seated-pigeon",
    page: "Page 2 reference",
    parameters: "Quantity not included in the written handoff.",
    provider: "Not recorded.",
    userNote: "",
  },
  {
    id: "pt-stand",
    exerciseId: "single-leg-stand",
    page: "Page 2 reference",
    parameters: "Quantity not included in the written handoff.",
    provider: "Not recorded.",
    userNote: "",
  },
  {
    id: "pt-band",
    exerciseId: "band-walks",
    page: "Page 2 reference",
    parameters: "Quantity not included in the written handoff.",
    provider: "Not recorded.",
    userNote: "",
  },
  {
    id: "pt-carry",
    exerciseId: "suitcase-carry",
    page: "Page 2 reference",
    parameters: "A carry. Distance and side were not included in the written handoff.",
    provider: "Not recorded.",
    userNote: "",
  },
  {
    id: "pt-flex",
    exerciseId: "pt-shoulder-flexion",
    page: "Page 2 reference",
    parameters: "Quantity not included in the written handoff.",
    provider: "Not recorded.",
    userNote: "",
  },
  {
    id: "pt-plank",
    exerciseId: "plank",
    page: "Page 2 reference",
    parameters: "A hold. Time was not included in the written handoff.",
    provider: "Not recorded.",
    userNote: "",
  },
];

export const UNSCHEDULED = {
  exerciseId: "battle-rope-squat",
  note: "Page 2 shows Battle Rope Squats with personal notes and no complete dose. It stays off the weekly schedule until you place it and set the dose.",
};

export const IMPORT_NOTES = [
  "Monday’s quoted activation and the first main pull-up slot are imported. Later Monday slots were not in the written handoff and were not invented.",
  "Tuesday clamshells use page 1: 2 × 15 per side. Page 2’s reference image says 2 × 10 and stays on the physical therapy card.",
  "Tuesday’s day title includes cardio. Modality and duration were not quoted, so that slot is open.",
  "Wednesday keeps the name Push + Shoulders and the note that cardio is optional. Individual exercises were not quoted.",
  "Thursday is a real recovery session: Zone 2 for 25–35 minutes, Pallof press hold 3 × 20 seconds per side, mobility flow 5–8 minutes, and no hard finisher.",
  "Friday and Saturday keep their page 1 names. Their exercise tables were not in the written handoff.",
  "Sunday stays unscheduled.",
  "The PDF’s watermarked artwork is not reproduced. This app keeps the schedule text and the separate page 2 names.",
];

export function dayTemplate(plan: PlanVersion, weekday: number): DayTemplate {
  return plan.days.find((day) => day.weekday === weekday) ?? sunday;
}

export function activePlan(plans: PlanVersion[], onDate: string): PlanVersion {
  const eligible = plans
    .filter((plan) => plan.effectiveDate <= onDate)
    .sort((a, b) => b.version - a.version || b.effectiveDate.localeCompare(a.effectiveDate));
  return eligible[0] ?? plans[plans.length - 1]!;
}
