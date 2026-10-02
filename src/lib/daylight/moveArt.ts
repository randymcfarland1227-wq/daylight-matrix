import type { ArtSpec, Pose, Prop, V2 } from "./moveArtEngine";

/**
 * Per-move start / end diagrams (stick figure, side view unless noted). Hand-built per movement pattern;
 * simplified on purpose - they show body position and where the load sits, not a coach's full demo.
 * Stage: 120 x 100, floor at y = 92. Standing hip y = 42.5, ankle y = 89.
 */
export const FLOOR = 92;
const HIP_Y = 42.5;
const ANK = 89;

/* ---- pose helpers ---- */
const stand = (x = 60, o: Partial<Pose> = {}): Pose => ({ hip: [x, HIP_Y], t: 180, foot: [x, ANK], foot2: [x - 5, ANK], hand: [x + 2, 62], eb: "back", kb: "fwd", ...o });
const lie = (hx = 60, o: Partial<Pose> = {}): Pose => ({ hip: [hx, 84], t: -90, hd: -90, foot: [hx + 24, 88], foot2: [hx + 27, 88], kb: "up", hand: [hx - 22, 90], eb: "down", ...o });
const bench = (x1: number, y1: number, x2: number, y2: number): Prop => ({ t: "seg", a: [x1, y1], b: [x2, y2], w: 5, k: "bench" });
const floorLine: Prop = { t: "seg", a: [4, FLOOR], b: [116, FLOOR], w: 1, k: "thin" };
const db = (at: string): Prop => ({ t: "weight", at, k: "db" });
const cableH = (a: V2, to = "hand"): Prop => ({ t: "seg", a, b: to, w: 0.9, k: "cable" });
const pulley = (at: V2): Prop => ({ t: "circle", at, r: 3.2, k: "pulley" });
const post = (x: number, y0 = 6): Prop => ({ t: "seg", a: [x, y0], b: [x, FLOOR], w: 3, k: "frame" });
const box = (x: number, y: number, w: number, h: number): Prop => ({ t: "rect", x, y, w, h, k: "block" });

type Mk = () => ArtSpec;

/* ---- patterns, each returns a fresh spec ---- */
const supine = (a: Partial<Pose>, b: Partial<Pose>, o: Partial<ArtSpec> = {}): ArtSpec => ({ props: [], a: lie(60, a), b: lie(60, b), ...o });

const P: Record<string, Mk> = {
  ppt: () => supine({ hip: [60, 83], hand: [40, 90] }, { hip: [60, 85.5], t: -90, hand: [40, 90] }, { labels: ["Neutral", "Tilt: low back flattens"], track: "hip", look: "Low back moves toward the floor; ribs stay down." }),
  pptShoulder: () => supine({ hand: [54, 52], eb: "up" }, { hip: [60, 85], hand: [22, 88], eb: "up" }, { labels: ["Arms up", "Arms overhead, ribs down"], track: "hand", look: "Arms reach overhead without the ribs flaring." }),
  march: () => supine({ foot: [72, 70], foot2: [92, 70], kb: "up", hand: [40, 90] }, { foot: [72, 70], foot2: [85, 86], kb: "up", hand: [40, 90] }, { labels: ["Tabletop", "One foot taps down"], track: "ankle2", look: "Brace first; lower back stays put as the foot taps." }),
  deadBug: () => supine({ foot: [72, 68], foot2: [90, 68], kb: "up", hand: [56, 44], hand2: [54, 44], eb: "up" }, { foot: [72, 68], foot2: [104, 80], kb: "up", hand: [56, 44], hand2: [22, 78], eb: "up" }, { labels: ["Arms and knees up", "Opposite arm + leg reach"], track: "hand2", look: "Low back stays pressed down as you reach." }),
  reverseCrunch: () => supine({ foot: [70, 62], foot2: [72, 62], kb: "up", hand: [40, 90] }, { hip: [60, 76], foot: [58, 52], foot2: [60, 52], kb: "up", hand: [40, 90] }, { labels: ["Knees over hips", "Curl pelvis toward ribs"], track: "hip", look: "Hips curl off the floor; legs do not swing." }),
  glutBridge: () => supine({ hip: [60, 84], foot: [86, 88], foot2: [89, 88], kb: "up", hand: [40, 90] }, { hip: [60, 70], t: -105, foot: [86, 88], foot2: [89, 88], kb: "up", hand: [40, 90] }, { labels: ["Hips down", "Squeeze up"], track: "hip" }),
  birdDog: () => ({
    props: [],
    a: { hip: [42, 66], t: 92, hd: 98, hand: [70, 89], hand2: [66, 89], foot: [40, 89], foot2: [36, 89], kb: "up", eb: "down", noLeg2: false },
    b: { hip: [42, 66], t: 92, hd: 98, hand: [70, 89], hand2: [102, 62], foot: [40, 89], foot2: [8, 68], kb: "up", eb: "down", kb2: "down" },
    labels: ["Hands and knees", "Opposite arm + leg reach"], track: "hand2", look: "Hips and shoulders stay level; reach long, don't arch.",
  }),
  sideLying: () => ({
    props: [],
    a: { hip: [48, 80], t: -90, hd: -90, foot: [58, 88], foot2: [58, 85], kb: "fwd", hand: [24, 86], eb: "down" },
    b: { hip: [48, 80], t: -90, hd: -90, foot: [58, 88], foot2: [58, 85], kb: "fwd", kb2: "fwd", hand: [24, 86], eb: "down" },
    labels: ["Knees together", "Top knee opens, hips stacked"], look: "Feet stay together. Don't roll the pelvis back.",
  }),
  bandWalk: () => ({
    front: true, props: [{ t: "seg", a: [46, 66], b: [74, 66], w: 1.6, k: "band" }],
    a: { hip: [60, 44], t: 180, foot: [54, 89], foot2: [66, 89], hand: [50, 62], hand2: [70, 62], eb: "down", kb: "down" },
    b: { hip: [60, 46], t: 180, foot: [46, 89], foot2: [68, 89], hand: [50, 62], hand2: [70, 62], eb: "down", kb: "down" },
    labels: ["Athletic stance", "Step wide, keep tension"], look: "Stay low, toes forward, band never goes slack.",
  }),
  singleLegStand: () => ({
    front: true, props: [],
    a: { hip: [60, 43], t: 180, foot: [60, 89], foot2: [60, 89], hand: [50, 66], hand2: [70, 66], eb: "down", kb: "down" },
    b: { hip: [60, 43], t: 180, foot: [60, 89], foot2: [72, 62], hand: [50, 66], hand2: [70, 66], eb: "down", kb: "down", kb2: "fwd" },
    labels: ["Two feet", "One leg up, pelvis level"], look: "Tall, ribs down, hips level while on one leg.",
  }),
  seatedPigeon: () => ({
    props: [{ t: "rect", x: 38, y: 58, w: 36, h: 4, k: "bench" }, { t: "seg", a: [42, 62], b: [42, FLOOR], w: 2, k: "frame" }, { t: "seg", a: [70, 62], b: [70, FLOOR], w: 2, k: "frame" }],
    a: { hip: [56, 58], t: 180, foot: [72, 88], foot2: [86, 60], kb: "fwd", kb2: "up", hand: [74, 64], eb: "down", hd: 180 },
    b: { hip: [56, 58], t: 150, foot: [72, 88], foot2: [86, 60], kb: "fwd", kb2: "up", hand: [86, 66], eb: "down", hd: 150 },
    labels: ["Ankle over opposite knee", "Hinge forward from the hips"], look: "Back long, no forcing the hip.",
  }),
  suitcase: () => ({
    front: true, props: [db("hand")],
    a: { hip: [60, 43], t: 180, foot: [55, 89], foot2: [65, 89], hand: [44, 78], hand2: [72, 64], eb: "down", kb: "down" },
    b: { hip: [60, 43], t: 180, foot: [55, 89], foot2: [65, 89], hand: [44, 78], hand2: [72, 64], eb: "down", kb: "down" },
    hold: true, labels: ["Walk tall, don't lean toward the weight", ""], look: "Ribs stacked over pelvis; no side-bend.",
  }),
  farmer: () => ({
    front: true, props: [db("hand"), db("hand2")],
    a: { hip: [60, 43], t: 180, foot: [55, 89], foot2: [65, 89], hand: [44, 78], hand2: [76, 78], eb: "down", kb: "down" },
    b: { hip: [60, 43], t: 180, foot: [55, 89], foot2: [65, 89], hand: [44, 78], hand2: [76, 78], eb: "down", kb: "down" },
    hold: true, labels: ["Shoulders down and back, walk tall", ""],
  }),
  plank: () => ({
    props: [],
    a: { hip: [62, 70], t: -95, hd: -95, foot: [94, 88], foot2: [96, 88], hand: [28, 88], kb: "up", eb: "down" },
    b: { hip: [62, 70], t: -95, hd: -95, foot: [94, 88], foot2: [96, 88], hand: [28, 88], kb: "up", eb: "down" },
    hold: true, labels: ["Long line, glutes tight, ribs down", ""],
  }),
  sidePlank: () => ({
    props: [],
    a: { hip: [48, 81], t: -100, hd: -100, foot: [92, 88], foot2: [94, 88], hand: [34, 89], hand2: [24, 52], kb: "up", eb: "down", eb2: "up" },
    b: { hip: [48, 81], t: -100, hd: -100, foot: [92, 88], foot2: [94, 88], hand: [34, 89], hand2: [24, 52], kb: "up", eb: "down", eb2: "up" },
    hold: true, labels: ["Side plank: elbow under shoulder, feet stacked", ""], look: "Seen from the front of the body it is a straight diagonal line: ears, shoulders, hips, ankles. Top arm can rest on the hip or reach up.",
  }),
  pallof: () => ({
    props: [post(8), pulley([8, 52]), cableH([8, 52])],
    a: stand(70, { hand: [78, 56], hand2: [78, 56], eb: "down", foot2: [64, ANK] }),
    b: stand(70, { hand: [102, 52], hand2: [102, 52], eb: "up", foot2: [64, ANK], hd: 180 }),
    labels: ["Hands at chest", "Press out and hold: don't twist"], look: "The cable tries to turn you; you don't let it.", track: "hand",
  }),
  walk: () => ({
    props: [],
    a: { hip: [60, HIP_Y + 1], t: 176, foot: [74, 88], foot2: [48, 86], kb: "fwd", kb2: "back", hand: [48, 62], hand2: [72, 60], eb: "down" },
    b: { hip: [60, HIP_Y + 1], t: 176, foot: [48, 86], foot2: [74, 88], kb: "back", kb2: "fwd", hand: [72, 60], hand2: [48, 62], eb: "down" },
    labels: ["Step", "Step"], look: "Easy pace: you could hold a conversation.",
  }),
  incline: () => ({
    props: [{ t: "seg", a: [14, 92], b: [104, 80], w: 4, k: "bench" }],
    a: { hip: [60, 74], t: 172, foot: [76, 80], foot2: [48, 76], kb: "fwd", kb2: "back", hand: [50, 66], hand2: [72, 62], eb: "down" },
    b: { hip: [60, 74], t: 172, foot: [48, 76], foot2: [76, 80], kb: "back", kb2: "fwd", hand: [72, 62], hand2: [50, 66], eb: "down" },
    labels: ["Incline walk", ""], hold: true,
  }),
  bike: () => ({
    props: [{ t: "circle", at: [40, 78], r: 12, k: "wheel" }, { t: "circle", at: [86, 78], r: 12, k: "wheel" }, { t: "seg", a: [40, 78], b: [62, 52], w: 2, k: "frame" }, { t: "seg", a: [62, 52], b: [86, 78], w: 2, k: "frame" }, { t: "seg", a: [62, 52], b: [78, 46], w: 2, k: "frame" }],
    a: { hip: [58, 40], t: 150, foot: [66, 80], foot2: [50, 70], kb: "fwd", kb2: "fwd", hand: [80, 48], hand2: [80, 48], eb: "down", hd: 140 },
    b: { hip: [58, 40], t: 150, foot: [50, 70], foot2: [66, 80], kb: "fwd", kb2: "fwd", hand: [80, 48], hand2: [80, 48], eb: "down", hd: 140 },
    hold: true, labels: ["Steady, easy-moderate", ""],
  }),
  mobility: () => ({
    props: [],
    a: { hip: [60, 60], t: 180, foot: [80, 88], foot2: [40, 88], kb: "fwd", kb2: "fwd", hand: [56, 78], hand2: [64, 78], eb: "down", hd: 180 },
    b: { hip: [60, 64], t: 150, foot: [82, 88], foot2: [38, 88], kb: "fwd", kb2: "fwd", hand: [76, 84], hand2: [86, 84], eb: "down", hd: 140 },
    labels: ["Gentle hips", "Gentle hamstrings / glutes"], look: "Move through easy ranges. No aggressive spine stretching.",
  }),

  /* ---- pulling ---- */
  pullup: () => ({
    props: [{ t: "seg", a: [34, 8], b: [86, 8], w: 3.5, k: "bar" }, post(34, 8), post(86, 8)],
    a: { hip: [58, 40], t: 180, hand: [60, 8], foot: [54, 70], foot2: [58, 72], kb: "back", eb: "down", noArm2: true },
    b: { hip: [58, 26], t: 180, hand: [60, 8], foot: [54, 56], foot2: [58, 58], kb: "back", eb: "down", noArm2: true },
    labels: ["Full hang", "Chin over bar"], track: "hip", look: "Pull elbows down toward ribs; control the way down.",
  }),
  neutralPullup: () => ({
    props: [{ t: "seg", a: [44, 8], b: [76, 8], w: 3.5, k: "bar" }, post(44, 8), post(76, 8), { t: "seg", a: [52, 8], b: [52, 16], w: 2.5, k: "bar" }, { t: "seg", a: [68, 8], b: [68, 16], w: 2.5, k: "bar" }],
    a: { hip: [58, 40], t: 180, hand: [60, 16], foot: [54, 70], foot2: [58, 72], kb: "back", eb: "down", noArm2: true },
    b: { hip: [58, 26], t: 180, hand: [60, 16], foot: [54, 56], foot2: [58, 58], kb: "back", eb: "down", noArm2: true },
    labels: ["Palms facing", "Chin to handles"], track: "hip",
  }),
  deadHang: () => ({
    props: [{ t: "seg", a: [34, 8], b: [86, 8], w: 3.5, k: "bar" }, post(34, 8), post(86, 8)],
    a: { hip: [58, 40], t: 180, hand: [60, 8], foot: [54, 70], foot2: [58, 72], kb: "back", eb: "down", noArm2: true },
    b: { hip: [58, 40], t: 180, hand: [60, 8], foot: [54, 70], foot2: [58, 72], kb: "back", eb: "down", noArm2: true },
    hold: true, labels: ["Hang, shoulders packed down", ""],
  }),
  supportedRow: () => ({
    props: [{ t: "seg", a: [36, 74], b: [92, 56], w: 5, k: "bench" }, { t: "seg", a: [40, 74], b: [40, FLOOR], w: 3, k: "frame" }, { t: "seg", a: [92, 56], b: [92, FLOOR], w: 3, k: "frame" }, db("hand")],
    a: { hip: [34, 62], t: 112, hd: 112, hand: [72, 76], foot: [30, 89], foot2: [28, 89], kb: "back", eb: "down", noArm2: true },
    b: { hip: [34, 62], t: 112, hd: 112, hand: [66, 56], foot: [30, 89], foot2: [28, 89], kb: "back", eb: "up", noArm2: true },
    labels: ["Arms long, blades forward", "Row: elbow back, chest stays down"], track: "hand", look: "Chest stays on the pad; pull elbows back.",
  }),
  seatedRow: () => ({
    props: [{ t: "seg", a: [112, 66], b: "hand", w: 0.9, k: "cable" }, { t: "rect", x: 30, y: 62, w: 26, h: 4, k: "bench" }, { t: "seg", a: [56, 80], b: [100, 80], w: 4, k: "bench" }],
    a: { hip: [48, 58], t: 176, hand: [88, 62], eb: "fwd", foot: [86, 80], foot2: [88, 80], kb: "up", hd: 176, noArm2: true },
    b: { hip: [48, 58], t: 176, hand: [56, 60], eb: "back", foot: [86, 80], foot2: [88, 80], kb: "up", hd: 176, noArm2: true },
    labels: ["Reach, tall chest", "Pull elbows back"], track: "hand",
  }),
  halfKneelPulldown: () => ({
    props: [post(88, 4), { t: "seg", a: [88, 6], b: "hand", w: 0.9, k: "cable" }, pulley([88, 6])],
    a: { hip: [52, 66], t: 178, hand: [84, 18], eb: "up", foot: [74, 88], foot2: [38, 89], kb: "fwd", kb2: "back", noArm2: true },
    b: { hip: [52, 66], t: 178, hand: [56, 52], eb: "back", foot: [74, 88], foot2: [38, 89], kb: "fwd", kb2: "back", noArm2: true },
    labels: ["Reach up", "Elbow to pocket"], track: "hand", look: "Ribs down, no torso twist.",
  }),
  facePull: () => ({
    props: [post(106, 6), pulley([106, 28]), { t: "seg", a: [106, 28], b: "hand", w: 0.9, k: "cable" }],
    a: stand(48, { hand: [78, 36], eb: "fwd", noArm2: true, foot2: [43, ANK] }),
    b: stand(48, { hand: [56, 20], eb: "down", noArm2: true, foot2: [43, ANK], hd: 180 }),
    labels: ["Arms long", "Pull to upper face, rotate back"], track: "hand", look: "Elbows high; don't shrug.",
  }),
  inclineShrug: () => ({
    props: [{ t: "seg", a: [34, 82], b: [90, 62], w: 5, k: "bench" }, { t: "seg", a: [38, 82], b: [38, FLOOR], w: 3, k: "frame" }, { t: "seg", a: [90, 62], b: [90, FLOOR], w: 3, k: "frame" }, db("hand")],
    a: { hip: [40, 70], t: 112, hd: 112, hand: [76, 80], foot: [36, 89], foot2: [34, 89], kb: "back", eb: "down", noArm2: true },
    b: { hip: [40, 70], t: 112, hd: 112, so: [-2, -4], hand: [76, 75], foot: [36, 89], foot2: [34, 89], kb: "back", eb: "down", noArm2: true },
    labels: ["Shoulders relaxed down", "Shrug up and back, pause"], track: "shoulder",
  }),
  straightArm: () => ({
    props: [post(96, 4), pulley([96, 8]), { t: "seg", a: [96, 8], b: "hand", w: 0.9, k: "cable" }],
    a: stand(52, { t: 160, hd: 160, hand: [82, 22], eb: "fwd", noArm2: true, foot2: [47, ANK] }),
    b: stand(52, { t: 160, hd: 160, hand: [56, 70], eb: "fwd", noArm2: true, foot2: [47, ANK] }),
    labels: ["Arms long, up", "Sweep down with the lats"], track: "hand",
  }),
  cableCrunch: () => ({
    props: [post(100, 4), pulley([100, 8]), { t: "seg", a: [100, 8], b: "head", w: 0.9, k: "cable" }],
    a: { hip: [58, 66], t: 176, hd: 176, hand: [60, 24], eb: "up", foot: [40, 89], foot2: [38, 89], kb: "back", noArm2: true },
    b: { hip: [58, 66], t: 128, hd: 120, hand: [72, 52], eb: "up", foot: [40, 89], foot2: [38, 89], kb: "back", noArm2: true },
    labels: ["Tall kneeling, rope at head", "Round down ribs to pelvis"], track: "head", look: "Round through the abs; hips stay still.",
  }),

  latPulldown: () => ({
    props: [post(98, 4), pulley([90, 6]), { t: "seg", a: [90, 6], b: "hand", w: 0.9, k: "cable" }, { t: "rect", x: 28, y: 62, w: 26, h: 4, k: "bench" }, { t: "seg", a: [66, 54], b: [80, 50], w: 6, k: "pad" }, { t: "weight", at: "hand", k: "handle" }],
    a: { hip: [46, 60], t: 178, hd: 178, hand: [72, 12], eb: "up", foot: [76, 88], foot2: [78, 88], kb: "fwd", noArm2: true },
    b: { hip: [46, 60], t: 166, hd: 166, hand: [58, 36], eb: "back", foot: [76, 88], foot2: [78, 88], kb: "fwd", noArm2: true },
    labels: ["Arms long, ribs down", "Bar to upper chest, elbows down"], track: "hand", look: "Lean back a touch; pull with the elbows, not the hands.",
  }),
  woodchop: () => ({
    props: [post(106, 4), pulley([106, 10]), { t: "seg", a: [106, 10], b: "hand", w: 0.9, k: "cable" }, { t: "weight", at: "hand", k: "handle" }],
    a: stand(54, { t: 172, hd: 172, hand: [84, 26], hand2: [84, 28], eb: "fwd", eb2: "fwd", foot2: [48, ANK] }),
    b: stand(54, { t: 168, hd: 170, hip: [54, 44], hand: [50, 64], hand2: [52, 66], eb: "down", eb2: "down", foot2: [48, ANK], kb: "fwd" }),
    labels: ["Rope high, feet wide", "Chop down across the body, hips quiet"], track: "hand", look: "Turn from the ribs and hips together, arms stay long; stop before the low back takes over.",
  }),
  nordic: () => ({
    props: [{ t: "rect", x: 10, y: 86, w: 40, h: 4, k: "block" }, { t: "seg", a: [14, 84], b: [34, 84], w: 1.4, k: "band" }],
    a: { hip: [44, 66], t: 178, hd: 178, foot: [18, 84], foot2: [20, 84], kb: "fwd", hand: [50, 66], eb: "down", noArm2: true },
    b: { hip: [44, 66], t: 96, hd: 96, foot: [18, 84], foot2: [20, 84], kb: "fwd", hand: [80, 86], eb: "down", noArm2: true },
    labels: ["Kneel tall, ankles anchored", "Lower forward in one straight line"], track: "hand", look: "Knees to head stay one straight line; hips don't fold. Catch yourself with your hands and push back up.",
  }),
  wallSit: () => ({
    props: [{ t: "seg", a: [40, 6], b: [40, FLOOR], w: 3, k: "frame" }],
    a: { hip: [47, 66], t: 180, hd: 180, foot: [73, 88], foot2: [75, 88], kb: "fwd", hand: [62, 66], eb: "down", noArm2: true },
    b: { hip: [47, 66], t: 180, hd: 180, foot: [73, 88], foot2: [75, 88], kb: "fwd", hand: [62, 66], eb: "down", noArm2: true },
    hold: true, labels: ["Back on the wall, thighs about level, knees over ankles", ""], look: "Knees at about a right angle and stacked over the ankles; hands off the thighs if you can.",
  }),

  /* ---- legs ---- */
  hackSquat: () => ({
    props: [{ t: "seg", a: [34, 18], b: [58, 74], w: 7, k: "pad" }, { t: "seg", a: [58, 86], b: [96, 86], w: 5, k: "bench" }],
    a: { hip: [48, 46], t: 160, hd: 160, foot: [72, 84], foot2: [74, 84], kb: "fwd", hand: [44, 52], eb: "back", noArm2: true },
    b: { hip: [56, 72], t: 160, hd: 160, foot: [72, 84], foot2: [74, 84], kb: "fwd", hand: [50, 70], eb: "back", noArm2: true },
    labels: ["Back on the pad, stand tall", "Sit down between the knees"], track: "hip",
  }),
  goblet: () => ({
    props: [{ t: "rect", x: 50, y: 88, w: 20, h: 3, k: "block" }, db("hand")],
    a: stand(54, { hand: [66, 56], eb: "down", hd: 180, noArm2: true, foot: [58, 86], foot2: [54, 86] }),
    b: { hip: [50, 66], t: 166, hd: 170, hand: [68, 58], eb: "down", foot: [66, 86], foot2: [62, 86], kb: "fwd", noArm2: true },
    labels: ["Heels on a plate, weight at chest", "Sit down between the knees"], track: "hip", look: "Torso stays tall; knees travel forward.",
  }),
  bulgarian: () => ({
    props: [{ t: "rect", x: 8, y: 66, w: 22, h: 4, k: "bench" }, { t: "seg", a: [12, 70], b: [12, FLOOR], w: 2.5, k: "frame" }, { t: "seg", a: [26, 70], b: [26, FLOOR], w: 2.5, k: "frame" }, db("hand")],
    a: { hip: [58, 44], t: 172, hd: 172, foot: [74, ANK], foot2: [24, 64], kb: "fwd", kb2: "back", hand: [60, 70], eb: "down", noArm2: true },
    b: { hip: [56, 62], t: 168, hd: 168, foot: [76, ANK], foot2: [24, 64], kb: "fwd", kb2: "back", hand: [58, 80], eb: "down", noArm2: true },
    labels: ["Rear foot on bench", "Drop straight down"], track: "hip",
  }),
  legPress: () => ({
    props: [{ t: "seg", a: [20, 80], b: [56, 52], w: 7, k: "pad" }, { t: "seg", a: [20, 90], b: [100, 90], w: 3, k: "frame" }, { t: "seg", a: [88, 50], b: [100, 78], w: 6, k: "pad" }],
    a: { hip: [40, 74], t: 140, hd: 140, foot: [90, 62], foot2: [92, 64], kb: "up", hand: [48, 78], eb: "down", noArm2: true },
    b: { hip: [40, 74], t: 140, hd: 140, foot: [68, 60], foot2: [70, 62], kb: "up", hand: [48, 78], eb: "down", noArm2: true },
    labels: ["Press out, knees soft", "Lower with control; hips stay down"], track: "ankle", look: "Stop the range before your hips tuck up off the pad.",
  }),
  legExtension: () => ({
    props: [{ t: "seg", a: [38, 28], b: [38, 74], w: 7, k: "pad" }, { t: "seg", a: [38, 76], b: [84, 76], w: 6, k: "pad" }, { t: "seg", a: [34, 90], b: [96, 90], w: 3, k: "frame" }],
    a: { hip: [44, 70], t: 176, hd: 176, foot: [66, 88], foot2: [68, 88], kb: "fwd", hand: [58, 74], eb: "down", noArm2: true },
    b: { hip: [44, 70], t: 176, hd: 176, foot: [92, 68], foot2: [94, 68], kb: "fwd", hand: [58, 74], eb: "down", noArm2: true },
    labels: ["Shin down", "Straighten and squeeze"], track: "ankle",
  }),
  legCurl: () => ({
    props: [{ t: "seg", a: [38, 28], b: [38, 74], w: 7, k: "pad" }, { t: "seg", a: [38, 76], b: [88, 76], w: 6, k: "pad" }, { t: "seg", a: [34, 90], b: [96, 90], w: 3, k: "frame" }],
    a: { hip: [44, 70], t: 176, hd: 176, foot: [92, 68], foot2: [94, 68], kb: "fwd", hand: [58, 74], eb: "down", noArm2: true },
    b: { hip: [44, 70], t: 176, hd: 176, foot: [66, 88], foot2: [68, 88], kb: "fwd", hand: [58, 74], eb: "down", noArm2: true },
    labels: ["Legs straight on the pad", "Curl heels under"], track: "ankle",
  }),
  lyingLegCurl: () => ({
    props: [{ t: "seg", a: [18, 78], b: [88, 78], w: 6, k: "bench" }, { t: "seg", a: [24, 82], b: [24, FLOOR], w: 2.5, k: "frame" }, { t: "seg", a: [84, 82], b: [84, FLOOR], w: 2.5, k: "frame" }],
    a: { hip: [58, 70], t: -86, hd: -86, foot: [90, 70], foot2: [92, 70], kb: "up", hand: [24, 70], eb: "down", noArm2: true },
    b: { hip: [58, 70], t: -86, hd: -86, foot: [84, 44], foot2: [86, 44], kb: "up", hand: [24, 70], eb: "down", noArm2: true },
    labels: ["Legs straight, hips down", "Curl heels toward glutes"], track: "ankle",
  }),
  calfStanding: () => ({
    props: [{ t: "rect", x: 44, y: 86, w: 26, h: 6, k: "block" }, { t: "seg", a: [52, 26], b: [58, 20], w: 7, k: "pad" }],
    a: stand(52, { foot: [52, 82], foot2: [50, 82], toe: [60, 85], hand: [50, 62], eb: "down", noArm2: true }),
    b: stand(52, { hip: [52, HIP_Y - 5], foot: [52, 77], foot2: [50, 77], toe: [60, 85], hand: [50, 57], eb: "down", noArm2: true }),
    labels: ["Deep stretch, heel low", "Rise to the toes, pause"], track: "hip",
  }),
  calfSeated: () => ({
    props: [{ t: "rect", x: 36, y: 62, w: 26, h: 4, k: "bench" }, { t: "seg", a: [66, 58], b: [76, 52], w: 7, k: "pad" }, { t: "rect", x: 66, y: 86, w: 22, h: 6, k: "block" }],
    a: { hip: [44, 58], t: 176, foot: [72, 80], foot2: [74, 80], toe: [82, 85], kb: "fwd", hand: [58, 62], eb: "down", noArm2: true },
    b: { hip: [44, 58], t: 176, foot: [72, 75], foot2: [74, 75], toe: [82, 85], kb: "fwd", hand: [58, 62], eb: "down", noArm2: true },
    labels: ["Heel low, knee pad on thigh", "Rise to the toes, pause"], track: "ankle",
  }),
  tibRaise: () => ({
    props: [{ t: "seg", a: [34, 20], b: [34, FLOOR], w: 5, k: "frame" }],
    a: { hip: [42, 42], t: 178, hd: 178, foot: [58, 89], foot2: [60, 89], toe: [66, 91], kb: "fwd", hand: [40, 64], eb: "down", noArm2: true },
    b: { hip: [42, 42], t: 178, hd: 178, foot: [58, 89], foot2: [60, 89], toe: [64, 82], kb: "fwd", hand: [40, 64], eb: "down", noArm2: true },
    labels: ["Heels forward, back on the wall", "Pull toes toward shins"], track: "toe",
  }),
  rdl: () => ({
    props: [db("hand")],
    a: stand(56, { hand: [60, 66], eb: "down", noArm2: true, foot2: [40, 87] }),
    b: { hip: [44, 48], t: 112, hd: 125, foot: [58, ANK], foot2: [34, 87], kb: "fwd", kb2: "fwd", hand: [66, 74], eb: "down", noArm2: true },
    labels: ["Tall, soft knee", "Hinge: hips back, flat back"], track: "hip", look: "Hips travel back; back leg only assists.",
  }),
  reverseLunge: () => ({
    props: [db("hand")],
    a: stand(58, { hand: [62, 64], eb: "down", noArm2: true, foot2: [53, ANK] }),
    b: { hip: [62, 60], t: 176, hd: 176, foot: [72, ANK], foot2: [34, 84], kb: "fwd", kb2: "fwd", hand: [66, 78], eb: "down", noArm2: true },
    labels: ["Stand tall", "Step back, drop straight down"], track: "hip",
  }),
  stepUp: () => ({
    props: [box(58, 70, 34, 22), db("hand")],
    a: { hip: [54, 54], t: 174, hd: 174, foot: [74, 70], foot2: [40, ANK], kb: "fwd", kb2: "fwd", hand: [58, 76], eb: "down", noArm2: true },
    b: { hip: [72, 28], t: 180, hd: 180, foot: [74, 70], foot2: [76, 68], kb: "fwd", kb2: "back", hand: [74, 52], eb: "down", noArm2: true },
    labels: ["Whole foot on the box", "Drive up through the lead leg"], track: "hip",
  }),
  hipThrust: () => ({
    props: [{ t: "rect", x: 8, y: 56, w: 26, h: 36, k: "bench" }, { t: "seg", a: "hip", b: "hip", w: 1 }, { t: "weight", at: "hip", k: "bar" }],
    a: { hip: [58, 84], t: -102, hd: -110, foot: [82, 89], foot2: [84, 89], kb: "up", hand: [48, 78], eb: "down", noArm2: true },
    b: { hip: [58, 64], t: -138, hd: -150, foot: [82, 89], foot2: [84, 89], kb: "up", hand: [48, 74], eb: "down", noArm2: true },
    labels: ["Upper back on bench, hips low", "Drive hips up: ribs down, don't over-arch"], track: "hip",
  }),
  backExt45: () => ({
    props: [{ t: "seg", a: [34, 90], b: [72, 52], w: 5, k: "bench" }, { t: "seg", a: [66, 56], b: [88, 74], w: 6, k: "pad" }],
    a: { hip: [62, 56], t: 112, hd: 120, foot: [92, 84], foot2: [94, 84], kb: "fwd", hand: [66, 50], eb: "down", noArm2: true },
    b: { hip: [62, 56], t: 142, hd: 150, foot: [92, 84], foot2: [94, 84], kb: "fwd", hand: [58, 40], eb: "down", noArm2: true },
    labels: ["Hinge down at the hips", "Squeeze glutes to come up; stop at a straight line"], track: "head", look: "Move from the hips. Stop before the low back takes over.",
  }),
  cableHipAbd: () => ({
    front: true, props: [post(104, 50), pulley([104, 80]), { t: "seg", a: [104, 80], b: "ankle2", w: 0.9, k: "cable" }, { t: "seg", a: [44, 24], b: [44, 54], w: 2.5, k: "frame" }],
    a: { hip: [58, 43], t: 180, foot: [56, 89], foot2: [62, 89], hand: [46, 40], hand2: [46, 44], eb: "down", kb: "down" },
    b: { hip: [58, 43], t: 180, foot: [56, 89], foot2: [84, 84], hand: [46, 40], hand2: [46, 44], eb: "down", kb: "down" },
    labels: ["Strap on the outside ankle", "Sweep out, no swinging"], track: "ankle2", look: "Pelvis stays still; the leg does the moving.",
  }),

  /* ---- pushing ---- */
  inclinePress: () => ({
    props: [{ t: "seg", a: [26, 88], b: [84, 56], w: 5, k: "bench" }, { t: "seg", a: [84, 56], b: [86, FLOOR], w: 3, k: "frame" }, { t: "seg", a: [30, 88], b: [30, FLOOR], w: 3, k: "frame" }, db("hand")],
    a: { hip: [36, 78], t: 150, hd: 150, hand: [58, 28], eb: "down", foot: [52, 89], foot2: [56, 89], kb: "fwd", noArm2: true },
    b: { hip: [36, 78], t: 150, hd: 150, hand: [60, 56], eb: "down", foot: [52, 89], foot2: [56, 89], kb: "fwd", noArm2: true },
    labels: ["Press up over the upper chest", "Lower to the chest line"], track: "hand", look: "Don't flare elbows wide; control the lower.",
  }),
  landmine: () => ({
    props: [{ t: "seg", a: [10, 86], b: "hand", w: 3, k: "bar" }, { t: "weight", at: "hand", k: "plate" }],
    a: stand(60, { hand: [76, 44], eb: "down", noArm2: true, foot: [70, ANK], foot2: [48, ANK], kb2: "fwd" }),
    b: stand(60, { hand: [90, 18], eb: "down", noArm2: true, foot: [70, ANK], foot2: [48, ANK], kb2: "fwd" }),
    labels: ["Bar end at the shoulder", "Press up and forward"], track: "hand", look: "Ribs down; don't lean back.",
  }),
  machinePress: () => ({
    props: [{ t: "seg", a: [34, 30], b: [34, 76], w: 7, k: "pad" }, { t: "rect", x: 34, y: 76, w: 24, h: 4, k: "bench" }, { t: "seg", a: [78, 54], b: "hand", w: 2.5, k: "bar" }],
    a: { hip: [46, 70], t: 178, hd: 178, hand: [66, 52], eb: "back", foot: [62, 89], foot2: [64, 89], kb: "fwd", noArm2: true },
    b: { hip: [46, 70], t: 178, hd: 178, hand: [90, 52], eb: "back", foot: [62, 89], foot2: [64, 89], kb: "fwd", noArm2: true },
    labels: ["Handles at the chest", "Press out, shoulders pinned back"], track: "hand",
  }),
  pushup: () => ({
    props: [],
    a: { hip: [60, 62], t: -108, hd: -108, foot: [98, 88], foot2: [100, 88], hand: [28, 88], kb: "up", eb: "back", noArm2: true },
    b: { hip: [60, 76], t: -96, hd: -92, foot: [98, 88], foot2: [100, 88], hand: [28, 88], kb: "up", eb: "back", noArm2: true },
    labels: ["Arms straight, body one line", "Chest toward the floor"], track: "shoulder",
  }),
  lowHighFly: () => ({
    props: [post(104, 50), pulley([104, 82]), { t: "seg", a: [104, 82], b: "hand", w: 0.9, k: "cable" }],
    a: stand(54, { hand: [76, 74], eb: "fwd", noArm2: true, foot2: [49, ANK], t: 176 }),
    b: stand(54, { hand: [84, 36], eb: "fwd", noArm2: true, foot2: [49, ANK], t: 176 }),
    labels: ["Hands low, soft elbows", "Sweep up and in, squeeze"], track: "hand",
  }),
  highLowFly: () => ({
    props: [post(104, 6), pulley([104, 10]), { t: "seg", a: [104, 10], b: "hand", w: 0.9, k: "cable" }],
    a: stand(54, { hand: [84, 34], eb: "fwd", noArm2: true, foot2: [49, ANK], t: 172 }),
    b: stand(54, { hand: [76, 70], eb: "fwd", noArm2: true, foot2: [49, ANK], t: 172 }),
    labels: ["Hands high", "Sweep down and in"], track: "hand",
  }),
  lateralRaise: () => ({
    front: true, props: [post(104, 56), pulley([104, 78]), { t: "seg", a: [104, 78], b: "hand2", w: 0.9, k: "cable" }],
    a: { hip: [58, 43], t: 180, foot: [54, 89], foot2: [64, 89], hand: [48, 64], hand2: [66, 66], eb: "down", kb: "down" },
    b: { hip: [58, 43], t: 180, foot: [54, 89], foot2: [64, 89], hand: [48, 64], hand2: [86, 26], eb: "down", kb: "down" },
    labels: ["Arm by your side", "Lead with the elbow to about shoulder height"], track: "hand2", look: "Shoulder stays down; traps stay quiet.",
  }),
  btbLateral: () => ({
    front: true, props: [post(104, 56), pulley([104, 78]), { t: "seg", a: [104, 78], b: "hand2", w: 0.9, k: "cable" }],
    a: { hip: [58, 43], t: 180, foot: [54, 89], foot2: [64, 89], hand: [48, 64], hand2: [60, 66], eb: "down", kb: "down" },
    b: { hip: [58, 43], t: 180, foot: [54, 89], foot2: [64, 89], hand: [48, 64], hand2: [84, 28], eb: "down", kb: "down" },
    labels: ["Cable behind your back", "Raise out to the side"], track: "hand2",
  }),
  overheadTri: () => ({
    props: [post(24, 50), pulley([24, 82]), { t: "seg", a: [24, 82], b: "hand", w: 0.9, k: "cable" }],
    a: stand(62, { t: 176, hand: [56, 14], eb: "back", noArm2: true, foot: [72, ANK], foot2: [50, ANK], kb2: "fwd", hd: 176 }),
    b: stand(62, { t: 176, hand: [66, -2], eb: "back", noArm2: true, foot: [72, ANK], foot2: [50, ANK], kb2: "fwd", hd: 176 }),
    labels: ["Elbows bent, deep stretch", "Straighten overhead, lock out"], track: "hand", look: "Elbows stay fixed and close to the head.",
  }),
  dipMachine: () => ({
    props: [{ t: "seg", a: [38, 60], b: [66, 60], w: 3, k: "bar" }, { t: "rect", x: 44, y: 84, w: 24, h: 8, k: "block" }],
    a: { hip: [56, 54], t: 176, hd: 176, hand: [66, 58], eb: "back", foot: [56, 78], foot2: [58, 78], kb: "fwd", noArm2: true },
    b: { hip: [56, 40], t: 176, hd: 176, hand: [66, 58], eb: "back", foot: [56, 64], foot2: [58, 64], kb: "fwd", noArm2: true },
    labels: ["Controlled bottom", "Press up, slight forward lean"], track: "hip",
  }),
  shoulderPress: () => ({
    props: [{ t: "seg", a: [36, 24], b: [38, 70], w: 6, k: "pad" }, { t: "rect", x: 34, y: 72, w: 26, h: 4, k: "bench" }, db("hand")],
    a: { hip: [46, 68], t: 178, hd: 178, hand: [60, 36], eb: "down", foot: [64, 89], foot2: [66, 89], kb: "fwd", noArm2: true },
    b: { hip: [46, 68], t: 178, hd: 178, hand: [52, 4], eb: "down", foot: [64, 89], foot2: [66, 89], kb: "fwd", noArm2: true },
    labels: ["Weights at shoulders", "Press overhead, ribs down"], track: "hand", look: "Don't over-arch; press from stacked ribs and pelvis.",
  }),
  machineShoulder: () => ({
    props: [{ t: "seg", a: [34, 24], b: [36, 70], w: 7, k: "pad" }, { t: "rect", x: 34, y: 72, w: 26, h: 4, k: "bench" }, { t: "seg", a: [68, 6], b: "hand", w: 2.5, k: "bar" }],
    a: { hip: [46, 68], t: 178, hd: 178, hand: [62, 36], eb: "down", foot: [64, 89], foot2: [66, 89], kb: "fwd", noArm2: true },
    b: { hip: [46, 68], t: 178, hd: 178, hand: [56, 4], eb: "down", foot: [64, 89], foot2: [66, 89], kb: "fwd", noArm2: true },
    labels: ["Handles at shoulders", "Press up"], track: "hand",
  }),
  reversePecDeck: () => ({
    props: [{ t: "seg", a: [78, 26], b: [76, 74], w: 7, k: "pad" }, { t: "rect", x: 52, y: 74, w: 26, h: 4, k: "bench" }, { t: "seg", a: [90, 58], b: "hand", w: 2.5, k: "bar" }],
    a: { hip: [64, 70], t: 2, hd: 4, hand: [90, 52], eb: "fwd", foot: [50, 89], foot2: [52, 89], kb: "back", noArm2: true },
    b: { hip: [64, 70], t: 2, hd: 4, hand: [58, 50], eb: "back", foot: [50, 89], foot2: [52, 89], kb: "back", noArm2: true },
    labels: ["Facing the pad, arms forward", "Open back, lead with elbows"], track: "hand",
  }),
  yRaise: () => ({
    front: true, props: [],
    a: { hip: [60, 43], t: 180, foot: [54, 89], foot2: [66, 89], hand: [50, 66], hand2: [70, 66], eb: "down", kb: "down" },
    b: { hip: [60, 43], t: 180, foot: [54, 89], foot2: [66, 89], hand: [40, 6], hand2: [80, 6], eb: "down", kb: "down" },
    labels: ["Arms low, thumbs up", "Raise in a Y: light, controlled"], track: "hand", look: "Light weight. Feel the lower traps and shoulder control.",
  }),
  curl: () => ({
    props: [{ t: "seg", a: "hand", b: "hand", w: 1 }, { t: "weight", at: "hand", k: "bar" }],
    a: stand(56, { hand: [62, 62], eb: "back", noArm2: true, foot2: [51, ANK] }),
    b: stand(56, { hand: [70, 34], eb: "back", noArm2: true, foot2: [51, ANK] }),
    labels: ["Arms long, elbows at your sides", "Curl up; elbows stay fixed"], track: "hand", look: "No torso swing.",
  }),
  inclineCurl: () => ({
    props: [{ t: "seg", a: [26, 88], b: [74, 40], w: 5, k: "bench" }, { t: "seg", a: [74, 40], b: [76, FLOOR], w: 3, k: "frame" }, { t: "seg", a: [30, 88], b: [30, FLOOR], w: 3, k: "frame" }, db("hand")],
    a: { hip: [38, 76], t: 128, hd: 128, hand: [52, 74], eb: "back", foot: [56, 89], foot2: [60, 89], kb: "fwd", noArm2: true },
    b: { hip: [38, 76], t: 128, hd: 128, hand: [62, 48], eb: "back", foot: [56, 89], foot2: [60, 89], kb: "fwd", noArm2: true },
    labels: ["Arm hangs behind, full stretch", "Curl without lifting the shoulder"], track: "hand",
  }),
  preacher: () => ({
    props: [{ t: "seg", a: [58, 46], b: [76, 62], w: 6, k: "pad" }, { t: "rect", x: 60, y: 64, w: 20, h: 28, k: "bench" }, db("hand")],
    a: { hip: [34, 62], t: 168, hd: 168, hand: [80, 70], eb: "down", foot: [38, 89], foot2: [40, 89], kb: "fwd", noArm2: true },
    b: { hip: [34, 62], t: 168, hd: 168, hand: [72, 42], eb: "down", foot: [38, 89], foot2: [40, 89], kb: "fwd", noArm2: true },
    labels: ["Arm on the pad", "Curl up"], track: "hand",
  }),
  pressdown: () => ({
    props: [post(40, 4), pulley([40, 8]), { t: "seg", a: [40, 8], b: "hand", w: 0.9, k: "cable" }],
    a: stand(70, { hand: [62, 40], eb: "back", noArm2: true, foot2: [65, ANK], t: 172 }),
    b: stand(70, { hand: [66, 62], eb: "back", noArm2: true, foot2: [65, ANK], t: 172 }),
    labels: ["Elbows pinned, hands up", "Press down and lock out"], track: "hand",
  }),
  crossBodyExt: () => ({
    props: [post(104, 4), pulley([104, 8]), { t: "seg", a: [104, 8], b: "hand", w: 0.9, k: "cable" }],
    a: stand(60, { hand: [76, 42], eb: "up", noArm2: true, foot2: [55, ANK], t: 174 }),
    b: stand(60, { hand: [66, 64], eb: "up", noArm2: true, foot2: [55, ANK], t: 174 }),
    labels: ["Elbow bent, across the body", "Straighten, shoulder still"], track: "hand",
  }),
  battleRope: () => ({
    props: [{ t: "wave", a: [10, 60], b: "hand" }],
    a: stand(66, { hand: [80, 52], eb: "down", hand2: [82, 54], foot: [72, ANK], foot2: [58, ANK] }),
    b: { hip: [60, 64], t: 164, hd: 170, hand: [80, 56], hand2: [82, 58], eb: "down", foot: [76, ANK], foot2: [58, ANK], kb: "fwd" },
    labels: ["Hold the rope low", "Squat as the rope waves"], look: "Optional add-on from your page 2 board.",
  }),
  /* ---- extras ---- */
  adductorMachine: () => ({
    front: true, props: [{ t: "seg", a: [40, 40], b: [40, 88], w: 3, k: "frame" }, { t: "seg", a: [80, 40], b: [80, 88], w: 3, k: "frame" }],
    a: { hip: [60, 58], t: 180, foot: [40, 88], foot2: [80, 88], hand: [50, 64], hand2: [70, 64], eb: "down", kb: "up" },
    b: { hip: [60, 58], t: 180, foot: [52, 88], foot2: [68, 88], hand: [50, 64], hand2: [70, 64], eb: "down", kb: "up" },
    labels: ["Legs apart on the pads", "Squeeze knees together"],
  }),
  lunge2: () => ({ props: [], a: stand(), b: stand() }),
  hang: () => ({
    props: [{ t: "seg", a: [34, 8], b: [86, 8], w: 3.5, k: "bar" }, post(34, 8), post(86, 8)],
    a: { hip: [58, 40], t: 180, hand: [60, 8], foot: [54, 70], foot2: [58, 72], kb: "back", eb: "down", noArm2: true },
    b: { hip: [58, 36], t: 180, hand: [60, 8], foot: [72, 52], foot2: [74, 54], kb: "up", eb: "down", noArm2: true },
    labels: ["Hang", "Knees up"],
  }),
  skull: () => ({
    props: [{ t: "seg", a: [18, 82], b: [84, 82], w: 6, k: "bench" }, { t: "seg", a: [22, 86], b: [22, FLOOR], w: 2.5, k: "frame" }, { t: "seg", a: [80, 86], b: [80, FLOOR], w: 2.5, k: "frame" }, db("hand")],
    a: { hip: [62, 74], t: -90, hd: -90, hand: [34, 44], eb: "up", foot: [86, 89], foot2: [88, 89], kb: "up", noArm2: true },
    b: { hip: [62, 74], t: -90, hd: -90, hand: [34, 62], eb: "back", foot: [86, 89], foot2: [88, 89], kb: "up", noArm2: true },
    labels: ["Arms over the shoulders", "Bend at the elbows only"],
  }),
};

/* ---- exercise id -> pattern ---- */
export const ART_MAP: Record<string, keyof typeof P> = {
  ppt: "ppt", "pt-shoulder-flexion": "pptShoulder", "bracing-marches": "march", "dead-bug": "deadBug", "reverse-crunch": "reverseCrunch",
  "bird-dog": "birdDog", "bird-dog-hold": "birdDog", clamshell: "sideLying", "side-lying-abduction": "sideLying",
  "band-walks": "bandWalk", "single-leg-stand": "singleLegStand", "seated-pigeon": "seatedPigeon",
  "suitcase-carry": "suitcase", "farmer-carry": "farmer", plank: "plank", "side-plank": "sidePlank", pallof: "pallof",
  "mobility-flow": "mobility", zone2: "walk", "tuesday-cardio": "incline", "wednesday-cardio": "walk", "saturday-cardio": "bike",
  "assisted-pullup": "pullup", "neutral-pullup": "neutralPullup", "dead-hang": "deadHang", "chest-supported-row": "supportedRow",
  "tbar-chest-supported": "supportedRow", "chest-supported-rear-fly": "supportedRow", "seated-cable-row": "seatedRow", "lat-pulldown": "latPulldown",
  "half-kneeling-pulldown": "halfKneelPulldown", "face-pull": "facePull", "incline-shrug": "inclineShrug", "cable-shrug": "inclineShrug", "straight-arm-pulldown": "straightArm",
  "cable-crunch": "cableCrunch", "cable-woodchop": "woodchop",
  "hack-squat": "hackSquat", "heel-elevated-goblet": "goblet", "sumo-goblet": "goblet", "battle-rope-squat": "battleRope", "bulgarian-split-squat": "bulgarian",
  "leg-press": "legPress", "leg-press-narrow": "legPress", "leg-extension": "legExtension", "leg-curl": "legCurl", "lying-leg-curl": "lyingLegCurl", "ball-leg-curl": "lyingLegCurl", "nordic-curl": "nordic",
  "standing-calf-raise": "calfStanding", "sl-calf-raise-press": "legPress", "seated-calf-raise": "calfSeated", "tibialis-raise": "tibRaise", "wall-sit": "wallSit",
  "bstance-rdl": "rdl", "cable-pull-through": "rdl", "reverse-hyper-light": "backExt45", "reverse-lunge": "reverseLunge", "box-step-up": "stepUp",
  "hip-thrust": "hipThrust", "machine-hip-thrust": "hipThrust", "glute-bridge": "glutBridge", "sl-glute-bridge": "glutBridge", "back-extension-45": "backExt45", "cable-hip-abduction": "cableHipAbd",
  "incline-db-press": "inclinePress", "landmine-press": "landmine", "machine-chest-press": "machinePress", "incline-machine-press": "machinePress", "pec-deck": "machinePress",
  "weighted-pushup": "pushup", pushup: "pushup", "close-grip-pushup": "pushup", "low-high-fly": "lowHighFly", "high-low-fly": "highLowFly",
  "cable-lateral-raise": "lateralRaise", "machine-lateral-raise": "lateralRaise", "btb-lateral-raise": "btbLateral", "cable-front-raise": "lowHighFly",
  "overhead-rope-triceps": "overheadTri", "assisted-dip": "dipMachine", "shoulder-press": "shoulderPress", "machine-shoulder-press": "machineShoulder",
  "reverse-pec-deck": "reversePecDeck", "y-raise": "yRaise", "band-pull-apart": "yRaise", "cable-external-rotation": "yRaise",
  "ez-curl": "curl", "hammer-curl": "curl", "wrist-curl": "curl", "incline-db-curl": "inclineCurl", "preacher-curl": "preacher",
  "rope-pressdown": "pressdown", "cross-body-cable-ext": "crossBodyExt", "skull-crusher": "skull", "adductor-machine": "adductorMachine", "hanging-knee-raise": "hang",
};

export function artFor(exerciseId: string): ArtSpec | null {
  const key = ART_MAP[exerciseId];
  const mk = key ? P[key] : undefined;
  return mk ? mk() : null;
}
export const ART_PATTERNS = P;
