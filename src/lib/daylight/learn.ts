export type Lesson = {
  id: string;
  title: string;
  exerciseIds: string[];
  moves: string;
  muscles: string;
  setup: string;
  attention: string;
  why: string;
  source: string;
  reviewed: string;
  href?: string;
};

const REVIEWED = "2026-09-30";

export const LESSONS: Lesson[] = [
  {
    id: "lesson-pullup",
    title: "Vertical pulling",
    exerciseIds: ["assisted-pullup", "neutral-pullup"],
    moves: "The shoulder extends and the elbow flexes as the body rises toward the bar. The return is the same path, slower.",
    muscles: "Latissimus dorsi does most of the shoulder extension. The biceps help bend the elbow. A neutral grip changes the forearm position, not the job of the pull.",
    setup: "Hang from a bar you can reach without a jump you cannot control. If you use assistance, set that help before the first rep and keep it separate from any added load.",
    attention: "Ribs stay stacked over the pelvis. A swing that starts the rep is not the same as a pull.",
    why: "Monday’s first main slot is this pattern, with assisted and neutral-grip options in one slot. Doing it does not guarantee a strength result. It is the movement the plan asked for.",
    source: "Exercise listing: ExRx.net, pull-up (latissimus dorsi). Reviewed as general education, not as your PDF cue.",
    reviewed: REVIEWED,
    href: "https://exrx.net/WeightExercises/LatissimusDorsi/BWPullup",
  },
  {
    id: "lesson-birddog",
    title: "Bird dog",
    exerciseIds: ["bird-dog"],
    moves: "From hands and knees, one arm and the opposite leg reach. The spine is meant to stay quiet while the limbs move.",
    muscles: "The drill asks the trunk and hip to resist rotation and extension. Glutes help the reaching leg. It is mapped here as a stability drill, not as a lat workout.",
    setup: "Hands under shoulders, knees under hips. Start with a short reach.",
    attention: "If the pelvis rocks or the lower back sags, the reach was too far. Shorter is still the exercise.",
    why: "It is in Monday’s activation. The point in this plan is a controlled setup before pulling, not a test of how far the leg can go.",
    source: "Coaching summary associated with Stuart McGill’s bird-dog description in back-fitness teaching. General education, not a clinical instruction and not a PDF cue.",
    reviewed: REVIEWED,
  },
  {
    id: "lesson-ppt",
    title: "Posterior pelvic tilt",
    exerciseIds: ["ppt", "pt-shoulder-flexion"],
    moves: "The pelvis rotates backward so the belt line tips up in front and the lower back gets closer to the floor or stays less arched.",
    muscles: "Abdominals and glutes can produce the tilt. People do not all rest in the same pelvic position, so this is a movement to practice, not proof of one correct posture.",
    setup: "Usually on your back with knees bent, unless your own note says otherwise.",
    attention: "A small tilt you can breathe through is different from jamming the back flat. Pain is a reason to stop, not a cue to push.",
    why: "Page 1 puts it in Monday’s activation. Page 2 also lists it as a reference. Those are separate records.",
    source: "General education. No clinical source was attached in the written handoff.",
    reviewed: REVIEWED,
  },
  {
    id: "lesson-clam",
    title: "Clamshell",
    exerciseIds: ["clamshell"],
    moves: "Side-lying, the top knee lifts while the feet stay together. The pelvis is meant to stay stacked.",
    muscles: "Gluteus medius and nearby hip rotators do the lift. It is a small range. More height often means the pelvis rolled.",
    setup: "Side-lying, hips slightly bent, heels in line with the spine.",
    attention: "Page 1 and page 2 disagree on the count. The active plan uses 2 × 15 per side. The reference card keeps 2 × 10.",
    why: "Tuesday’s quoted lower-body work includes this drill. It is not a full lower-body day by itself. The rest of Tuesday was not in the written handoff.",
    source: "Dose comparison is from the user’s PDF as described in the handoff. The movement description is general education.",
    reviewed: REVIEWED,
  },
  {
    id: "lesson-pallof",
    title: "Pallof press hold",
    exerciseIds: ["pallof"],
    moves: "You face sideways to a band or cable and hold it at the chest so the weight tries to rotate you. You stay facing forward.",
    muscles: "Obliques and the rest of the trunk resist rotation. It is a hold, so it is logged in time, not mixed into the strength-set colors.",
    setup: "Feet about hip-width. The band’s pull should be horizontal. Choose a side, then the other.",
    attention: "If the shoulders twist toward the anchor, the hold ended even if the clock is still running. The timer never marks the set done by itself.",
    why: "Thursday’s page 1 session includes 3 × 20 seconds per side. That is the source dose. It is not a progression rule.",
    source: "The hold is widely taught as the Pallof press, named for physical therapist John Pallof. This note is general education, not your PDF’s wording and not a treatment plan.",
    reviewed: REVIEWED,
  },
  {
    id: "lesson-zone2",
    title: "Easy cardio on a recovery day",
    exerciseIds: ["zone2", "tuesday-cardio"],
    moves: "Continuous easy work: walk, bike, or whatever you already use. Thursday names a time range. Tuesday only names that cardio is part of the day.",
    muscles: "Legs and the breathing muscles do the work. This is not drawn as a strength-set count.",
    setup: "Pick a mode you can keep steady. Thursday’s written range is 25–35 minutes.",
    attention: "The plan’s recovery day says no hard finisher. Finishing early is allowed. A timer running out does not complete the session.",
    why: "Thursday is scheduled recovery, not an incomplete lifting day. Wednesday’s cardio, separately, is optional and has no imported dose.",
    source: "Time range and “no hard finisher” are from page 1 of the user’s PDF. Effort language here is general education.",
    reviewed: REVIEWED,
  },
];

export function lessonsForExercise(exerciseId: string): Lesson[] {
  return LESSONS.filter((lesson) => lesson.exerciseIds.includes(exerciseId));
}

export function lessonsForPlan(exerciseIds: string[]): Lesson[] {
  const set = new Set(exerciseIds);
  const related = LESSONS.filter((lesson) => lesson.exerciseIds.some((id) => set.has(id)));
  return related.length ? related : LESSONS;
}
