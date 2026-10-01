import type { SubId } from "./muscles";

/**
 * Muscle-chart style figure, 300 x 600 viewBox, centre line x = 150, about 7.5 heads tall.
 * Every shape is authored for the LEFT half of the picture (x <= 150) and mirrored by the renderer, so the
 * head, ears and symmetry are identical front and back. Points marked with a trailing 1 are sharp corners
 * (used where a shape meets the centre line); everything else is smoothed with a Catmull-Rom spline.
 * The shapes are editorial illustrations of where each muscle sits, not measurements.
 */
export const VIEWBOX = "0 0 300 600";

type P = [number, number] | [number, number, 1];

function smooth(pts: P[], closed = true): string {
  const n = pts.length;
  const at = (i: number) => pts[(i + n) % n]!;
  const corner = (i: number) => (closed || (i > 0 && i < n - 1) ? at(i)[2] === 1 : true);
  let d = `M${at(0)[0]} ${at(0)[1]}`;
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i += 1) {
    const p0 = closed ? at(i - 1) : pts[Math.max(i - 1, 0)]!;
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = closed ? at(i + 2) : pts[Math.min(i + 2, n - 1)]!;
    const t = 0.5 / 3;
    const c1: [number, number] = corner(i) ? [p1[0], p1[1]] : [p1[0] + (p2[0] - p0[0]) * t, p1[1] + (p2[1] - p0[1]) * t];
    const c2: [number, number] = corner(i + 1) ? [p2[0], p2[1]] : [p2[0] - (p3[0] - p1[0]) * t, p2[1] - (p3[1] - p1[1]) * t];
    d += `C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0]} ${p2[1]}`;
  }
  return closed ? `${d}Z` : d;
}

export type Part = { id: string; d: string };
export type MusclePath = { muscle: SubId; d: string; deep?: boolean };
export type Line = { d: string; w?: number };

/* ----------------------------------------------------------------- silhouette (shared front/back) */

const HEAD = smooth([[150, 10, 1], [139, 12], [129, 21], [125, 38], [127, 56], [133, 72], [142, 83], [150, 88, 1]]);
const EAR = smooth([[127, 38], [121, 39], [119, 48], [122, 58], [128, 57]]);
const NECK = smooth([[150, 76, 1], [141, 78], [139, 90], [134, 104], [150, 112, 1]]);
const TORSO = smooth([[150, 106, 1], [122, 110], [102, 117], [98, 140], [100, 168], [97, 198], [95, 228], [97, 258], [93, 288], [90, 306], [150, 314, 1]]);
const UPPER_ARM = smooth([[100, 117], [84, 110], [70, 116], [63, 132], [61, 160], [60, 190], [58, 216], [57, 232], [77, 234], [79, 212], [87, 184], [95, 160], [100, 138]]);
const FOREARM = smooth([[57, 226], [78, 228], [80, 244], [74, 272], [69, 300], [67, 322], [71, 336], [73, 358], [71, 378], [66, 392], [58, 394], [52, 382], [48, 358], [46, 336], [47, 322], [51, 298], [55, 268], [55, 244]]);
const LEG = smooth([[92, 300], [88, 330], [88, 372], [92, 406], [95, 434], [93, 450], [91, 480], [94, 512], [99, 544], [95, 554], [91, 572], [94, 585], [106, 591], [126, 589], [131, 579], [127, 557], [123, 545], [125, 512], [129, 482], [131, 452], [132, 436], [135, 406], [141, 372], [146, 332], [150, 312, 1], [150, 296, 1]]);

export const SILHOUETTE: Part[] = [
  { id: "leg", d: LEG },
  { id: "torso", d: TORSO },
  { id: "neck", d: NECK },
  { id: "upper-arm", d: UPPER_ARM },
  { id: "forearm", d: FOREARM },
  { id: "head", d: HEAD },
  { id: "ear", d: EAR },
];

/* ----------------------------------------------------------------- front muscles */

export const FRONT: MusclePath[] = [
  // chest
  { muscle: "chest-clav", d: smooth([[150, 120, 1], [132, 118], [114, 123], [102, 132], [106, 145], [126, 147], [150, 148, 1]]) },
  { muscle: "chest-sternal", d: smooth([[150, 149, 1], [126, 148], [106, 147], [101, 158], [108, 168], [128, 172], [150, 172, 1]]) },
  { muscle: "chest-lower", d: smooth([[150, 173, 1], [128, 173], [108, 169], [106, 178], [116, 187], [134, 191], [150, 190, 1]]) },
  { muscle: "serratus", d: smooth([[100, 186], [107, 184], [116, 192], [118, 204], [112, 216], [104, 212], [98, 200]]) },
  // shoulders
  { muscle: "delt-front", d: smooth([[102, 126], [92, 117], [80, 117], [80, 130], [76, 146], [78, 162], [88, 158], [95, 148], [100, 138]]) },
  { muscle: "delt-side", d: smooth([[79, 117], [69, 124], [64, 140], [66, 156], [72, 164], [77, 160], [76, 146], [80, 130]]) },
  { muscle: "traps-upper", d: smooth([[139, 92], [132, 101], [120, 110], [104, 116], [101, 124], [118, 121], [134, 115], [143, 106]]) },
  // arms (front)
  { muscle: "biceps-long", d: smooth([[78, 164], [71, 172], [66, 190], [63, 210], [70, 214], [74, 196], [80, 180]]) },
  { muscle: "biceps-short", d: smooth([[82, 164], [93, 158], [93, 180], [87, 204], [78, 214], [74, 196], [80, 180]]) },
  { muscle: "brachialis", d: smooth([[66, 196], [61, 208], [62, 224], [70, 226], [72, 212]]) },
  { muscle: "forearm-flexors", d: smooth([[74, 228], [84, 232], [77, 270], [67, 318], [60, 318], [64, 280], [68, 252]]) },
  { muscle: "forearm-extensors", d: smooth([[64, 226], [74, 228], [68, 252], [64, 280], [60, 318], [50, 316], [53, 280], [58, 246]]) },
  // core
  { muscle: "abs-upper", d: smooth([[150, 192, 1], [132, 192], [129, 208], [130, 234], [150, 236, 1]]) },
  { muscle: "abs-lower", d: smooth([[150, 237, 1], [131, 236], [132, 260], [138, 284], [150, 298, 1]]) },
  { muscle: "obliques", d: smooth([[127, 193], [114, 196], [104, 216], [99, 240], [99, 264], [108, 282], [124, 292], [132, 284], [131, 260], [130, 235], [128, 210]]) },
  { muscle: "transverse", deep: true, d: smooth([[132, 250], [150, 248, 1], [150, 300, 1], [138, 292], [128, 280]]) },
  // legs
  { muscle: "quad-vl", d: smooth([[93, 320], [89, 352], [92, 400], [102, 430], [112, 434], [106, 402], [104, 352], [101, 322]]) },
  { muscle: "quad-rf", d: smooth([[113, 314], [104, 332], [104, 362], [108, 404], [117, 426], [123, 404], [125, 362], [123, 326]]) },
  { muscle: "quad-vi", deep: true, d: smooth([[107, 340], [105, 372], [109, 404], [116, 418], [120, 382], [117, 342]]) },
  { muscle: "quad-vm", d: smooth([[125, 374], [123, 406], [121, 430], [132, 431], [135, 408], [131, 382]]) },
  { muscle: "adductors-sub", d: smooth([[149, 312, 1], [139, 322], [129, 352], [126, 378], [133, 384], [141, 352], [148, 330, 1]]) },
  { muscle: "gastroc", d: smooth([[93, 452], [100, 447], [103, 470], [101, 500], [95, 500], [91, 474]]) },
  { muscle: "gastroc", d: smooth([[122, 454], [129, 451], [131, 478], [125, 502], [119, 498], [119, 472]]) },
  { muscle: "tibialis", d: smooth([[105, 448], [116, 448], [119, 482], [115, 540], [107, 542], [104, 500], [103, 470]]) },
];

export const DETAIL_FRONT: Line[] = [
  // clavicle, sternum, linea alba, abdominal intersections, navel
  { d: "M149 114 C138 111 122 112 104 118", w: 1.3 },
  { d: "M150 120 L150 190", w: 0.9 },
  { d: "M150 192 L150 300", w: 1 },
  { d: "M131 214 C138 216 144 216 150 215", w: 0.8 },
  { d: "M130 236 C138 238 144 238 150 237", w: 0.8 },
  { d: "M132 262 C139 264 145 264 150 263", w: 0.8 },
  { d: "M143 246 a2.4 3.2 0 1 0 0.1 0", w: 0.8 },
  // sternocleidomastoid
  { d: "M141 80 C139 92 142 100 148 112", w: 0.9 },
  // inguinal line & patella
  { d: "M101 302 C114 310 130 308 148 316", w: 1 },
  { d: "M105 436 a8 6 0 1 0 0.1 0", w: 0.9 },
  { d: "M96 392 C98 410 104 424 112 432", w: 0.7 },
  // fingers
  { d: "M52 382 L51 392 M58 384 L58 394 M64 382 L65 391", w: 0.7 },
];

/* ----------------------------------------------------------------- back muscles */

export const BACK: MusclePath[] = [
  { muscle: "traps-upper", d: smooth([[150, 90, 1], [139, 94], [126, 104], [108, 115], [102, 124], [124, 127], [142, 122], [150, 124, 1]]) },
  { muscle: "rhomboids", d: smooth([[150, 126, 1], [130, 129], [119, 136], [117, 152], [122, 166], [136, 172], [150, 174, 1]]) },
  { muscle: "rotator-cuff", d: smooth([[114, 134], [103, 135], [98, 148], [101, 164], [113, 168], [118, 152]]) },
  { muscle: "erectors", d: smooth([[150, 178, 1], [141, 180], [136, 196], [135, 226], [137, 254], [146, 272], [150, 274, 1]]) },
  { muscle: "traps-lower", d: smooth([[150, 168, 1], [137, 172], [126, 168], [131, 188], [141, 208], [150, 224, 1]]) },
  { muscle: "lats", d: smooth([[122, 170], [108, 164], [99, 172], [98, 198], [101, 224], [111, 240], [129, 244], [128, 218], [125, 192]]) },
  // shoulders / arms (back)
  { muscle: "delt-rear", d: smooth([[103, 126], [92, 117], [80, 118], [76, 130], [74, 146], [72, 158], [84, 160], [97, 150], [104, 138]]) },
  { muscle: "delt-side", d: smooth([[79, 118], [69, 125], [64, 140], [66, 156], [72, 160], [75, 146], [77, 130]]) },
  { muscle: "triceps-lateral", d: smooth([[70, 160], [64, 174], [60, 198], [59, 216], [67, 218], [72, 194], [80, 172], [80, 162]]) },
  { muscle: "triceps-long", d: smooth([[82, 160], [95, 152], [95, 176], [87, 202], [77, 218], [72, 210], [76, 190], [80, 172]]) },
  { muscle: "triceps-medial", d: smooth([[68, 204], [60, 216], [62, 228], [74, 228], [77, 216]]) },
  { muscle: "forearm-extensors", d: smooth([[66, 230], [80, 232], [74, 262], [63, 316], [52, 316], [56, 276], [61, 246]]) },
  { muscle: "forearm-flexors", d: smooth([[80, 232], [87, 238], [77, 278], [66, 318], [63, 316], [74, 262]]) },
  // hips & legs (back)
  { muscle: "glute-med", d: smooth([[132, 268], [114, 268], [99, 280], [94, 296], [104, 302], [120, 294], [133, 284]]) },
  { muscle: "glute-min", deep: true, d: smooth([[118, 276], [105, 281], [101, 291], [111, 294], [122, 286]]) },
  { muscle: "glute-max", d: smooth([[150, 276, 1], [133, 272], [121, 292], [105, 304], [98, 320], [104, 340], [124, 348], [146, 342], [150, 338, 1]]) },
  { muscle: "ham-lateral", d: smooth([[96, 348], [92, 372], [94, 406], [104, 430], [114, 428], [112, 392], [110, 354]]) },
  { muscle: "ham-medial", d: smooth([[115, 352], [113, 392], [115, 428], [125, 428], [133, 406], [138, 372], [141, 348], [127, 352]]) },
  { muscle: "gastroc", d: smooth([[96, 450], [106, 448], [113, 472], [111, 500], [102, 504], [94, 480]]) },
  { muscle: "gastroc", d: smooth([[120, 450], [131, 454], [133, 482], [125, 508], [116, 500], [116, 470]]) },
  { muscle: "soleus", d: smooth([[98, 500], [108, 506], [112, 522], [110, 546], [102, 548], [98, 524]]) },
  { muscle: "soleus", d: smooth([[116, 504], [124, 510], [126, 526], [122, 546], [114, 546], [114, 524]]) },
];

export const DETAIL_BACK: Line[] = [
  // spine, scapula spine, sacrum, gluteal cleft, popliteal creases, Achilles
  { d: "M150 92 L150 296", w: 1 },
  { d: "M118 134 C110 136 104 142 100 150", w: 0.9 },
  { d: "M150 232 C140 238 134 250 134 262", w: 0.7 },
  { d: "M150 296 L150 338", w: 1.1 },
  { d: "M99 432 C108 438 120 438 131 432", w: 0.9 },
  { d: "M106 548 C107 556 106 566 105 572 M120 548 C120 556 121 566 121 572", w: 0.8 },
  { d: "M52 382 L51 392 M58 384 L58 394 M64 382 L65 391", w: 0.7 },
];
