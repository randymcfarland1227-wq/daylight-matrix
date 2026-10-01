import type { MuscleId } from "./muscles";

/**
 * Hand-drawn stylised body, 300×600 viewBox, centre line x = 150.
 * Every path describes the LEFT half of the picture (x ≤ 150); the renderer mirrors it for the right half.
 * Muscle shapes are editorial illustrations of where a muscle sits, not anatomical measurements.
 */
export const VIEWBOX = "0 0 300 600";

export type Part = { id: string; d: string };
export type MusclePath = { muscle: MuscleId; d: string };

const HEAD: Part[] = [
  { id: "head", d: "M150 6 C132 6 122 22 122 40 C122 56 130 68 140 72 L150 74 Z" },
  { id: "neck", d: "M141 66 C140 76 139 84 136 92 L150 96 L150 66 Z" },
];
const BODY: Part[] = [
  { id: "torso", d: "M150 90 L136 90 C124 94 108 98 98 106 C92 112 91 124 92 138 C93 160 97 185 103 208 C108 228 112 248 112 262 C110 278 104 292 102 306 C108 318 130 324 150 324 Z" },
  { id: "arm", d: "M96 108 C80 106 66 114 62 134 C58 160 56 190 54 215 C51 245 46 270 44 292 C42 306 40 322 44 334 C50 342 60 338 62 328 C63 316 64 304 66 296 C70 270 76 240 80 214 C84 190 86 165 92 144 C94 130 96 118 96 108 Z" },
  { id: "leg", d: "M102 306 C94 330 90 370 94 410 C92 440 94 480 98 520 L100 540 L122 540 C124 500 128 460 130 424 C134 390 140 350 148 322 L150 322 L150 306 Z" },
  { id: "foot", d: "M98 536 L124 538 C128 552 128 566 122 574 C110 580 92 578 88 568 C90 556 94 544 98 536 Z" },
];

export const SILHOUETTE_FRONT: Part[] = [...HEAD, { id: "ear", d: "M122 38 C117 38 116 48 120 52 C122 53 124 51 124 48 Z" }, ...BODY];
export const SILHOUETTE_BACK: Part[] = [...HEAD, ...BODY];

export const FRONT: MusclePath[] = [
  { muscle: "traps", d: "M148 92 L136 92 C124 96 110 100 100 106 C108 113 120 113 130 109 C138 106 144 104 148 104 Z" },
  { muscle: "chest-upper", d: "M148 107 C138 107 124 109 110 115 C102 118 98 124 98 130 C112 128 132 128 148 132 Z" },
  { muscle: "chest", d: "M99 134 C102 148 112 160 126 164 C136 166 144 164 148 162 L148 134 C132 130 114 130 99 134 Z" },
  { muscle: "delt-front", d: "M98 108 C90 104 80 104 72 110 C70 120 72 134 76 148 C86 148 96 138 99 122 Z" },
  { muscle: "delt-side", d: "M72 110 C64 114 60 126 60 138 C60 148 64 154 70 156 C74 154 76 150 76 148 C72 134 70 120 72 110 Z" },
  { muscle: "biceps", d: "M78 154 C72 172 68 192 66 210 L82 214 C84 196 88 176 94 152 C88 156 82 156 78 154 Z" },
  { muscle: "forearms", d: "M64 218 C60 240 54 266 50 292 L66 296 C72 270 78 244 82 220 C76 222 70 222 64 218 Z" },
  { muscle: "obliques", d: "M102 168 C104 195 108 225 112 250 C118 256 126 262 130 264 L130 170 Z" },
  { muscle: "abs", d: "M132 170 h17 v21 h-17 z M132 195 h17 v21 h-17 z M132 220 h17 v21 h-17 z M132 245 h17 v18 c-6 2 -12 1 -17 -4 z" },
  { muscle: "quads", d: "M102 330 C96 355 94 385 98 412 C108 418 124 418 132 412 C134 388 138 360 144 336 C132 340 114 338 102 330 Z" },
  { muscle: "adductors", d: "M146 326 C142 345 136 370 132 410 L124 412 C126 385 132 358 140 336 Z" },
  { muscle: "calves", d: "M96 424 C92 450 94 480 100 506 L106 504 C104 480 104 450 106 426 Z" },
  { muscle: "tibialis", d: "M110 428 L124 428 C122 460 120 495 117 528 L109 528 C109 495 109 460 110 428 Z" },
];

export const BACK: MusclePath[] = [
  { muscle: "traps", d: "M148 92 C136 94 122 98 100 108 C108 118 124 128 134 140 L148 168 Z" },
  { muscle: "rotator-cuff", d: "M102 118 C108 116 116 120 120 128 C118 138 110 142 104 140 C100 132 100 124 102 118 Z" },
  { muscle: "lats", d: "M96 148 C95 176 100 206 110 236 C118 242 128 240 134 234 C134 218 130 198 122 182 C114 166 106 154 96 148 Z" },
  { muscle: "mid-back", d: "M148 132 C138 136 126 144 118 152 C114 164 118 178 126 188 C134 198 142 204 148 210 Z" },
  { muscle: "lower-back", d: "M148 214 L138 216 C134 234 134 254 138 272 L148 282 Z" },
  { muscle: "delt-rear", d: "M98 108 C90 104 80 104 72 110 C70 120 72 134 76 148 C86 148 96 138 99 122 Z" },
  { muscle: "delt-side", d: "M72 110 C64 114 60 126 60 138 C60 148 64 154 70 156 C74 154 76 150 76 148 C72 134 70 120 72 110 Z" },
  { muscle: "triceps", d: "M78 154 C72 172 68 192 66 210 L82 214 C84 196 88 176 94 152 C88 156 82 156 78 154 Z" },
  { muscle: "forearms", d: "M64 218 C60 240 54 266 50 292 L66 296 C72 270 78 244 82 220 C76 222 70 222 64 218 Z" },
  { muscle: "glutes", d: "M103 280 C98 300 100 322 114 332 C130 336 144 332 148 322 L148 286 C132 280 116 278 103 280 Z" },
  { muscle: "glute-med", d: "M102 272 C112 268 128 272 140 282 C130 292 114 298 102 294 C100 286 100 278 102 272 Z" },
  { muscle: "hamstrings", d: "M102 340 C96 362 94 388 98 412 C108 418 124 418 132 412 C134 390 140 364 144 344 C130 350 114 348 102 340 Z" },
  { muscle: "calves", d: "M98 424 C94 450 96 478 102 504 C108 512 118 510 124 502 C128 476 130 450 130 424 C118 430 106 430 98 424 Z" },
];

/** Decorative anatomy lines (not clickable). */
export const DETAIL_FRONT: string[] = [
  "M98 110 C110 105 130 103 148 106",
  "M150 106 L150 272",
  "M100 410 C110 418 124 418 132 410",
];
export const DETAIL_BACK: string[] = [
  "M150 96 L150 284",
  "M104 142 C112 134 126 130 142 134",
  "M100 410 C110 418 124 418 132 410",
];
