import type { MuscleMapping } from "./types";

export type BodyClip = "torso" | "arm-left" | "arm-right" | "leg-left" | "leg-right" | "pelvis";

export type Region = {
  id: string;
  name: string;
  view: "front" | "back";
  side: "left" | "right" | "center";
  /** Muscle shape in the 200×480 figure. Clipped to the body part so it cannot float off the silhouette. */
  d: string;
  clip: BodyClip;
};

/** One standing figure, front and back. Coordinates are a 200×480 viewBox. */
export const SILHOUETTE = {
  neck: "M91 62h18l4 28H87z",
  torso: "M58 100C70 78 130 78 142 100C152 116 150 140 142 162C136 186 128 204 122 218C116 232 110 242 104 248H96C90 242 84 232 78 218C72 204 64 186 58 162C50 140 48 116 58 100Z",
  armL: "M62 94C46 100 34 124 30 156C26 188 28 222 34 252C38 272 46 286 54 284C62 282 68 268 66 250C62 220 60 190 62 162C64 134 72 114 78 104L68 96Z",
  armR: "M138 94C154 100 166 124 170 156C174 188 172 222 166 252C162 272 154 286 146 284C138 282 132 268 134 250C138 220 140 190 138 162C136 134 128 114 122 104L132 96Z",
  legL: "M78 230C66 242 60 274 60 312C60 350 62 388 66 422C68 444 74 458 82 464H96L96 430C98 392 96 352 94 316C92 280 96 252 94 236Z",
  legR: "M122 230C134 242 140 274 140 312C140 350 138 388 134 422C132 444 126 458 118 464H104L104 430C102 392 104 352 106 316C108 280 104 252 106 236Z",
  pelvis: "M70 208C82 196 118 196 130 208C142 224 138 252 122 266L100 276L78 266C62 252 58 224 70 208Z",
} as const;

const GROUP: Record<string, string> = {
  chest: "Chest",
  "shoulder-front-left": "Shoulders",
  "shoulder-front-right": "Shoulders",
  "biceps-left": "Biceps",
  "biceps-right": "Biceps",
  abs: "Abs",
  "oblique-left": "Obliques",
  "oblique-right": "Obliques",
  "quad-left": "Quads",
  "quad-right": "Quads",
  "calf-front-left": "Shins",
  "calf-front-right": "Shins",
  traps: "Traps",
  "rear-delt-left": "Rear delts",
  "rear-delt-right": "Rear delts",
  "lat-left": "Lats",
  "lat-right": "Lats",
  "lower-back": "Lower back",
  "glute-left": "Glutes",
  "glute-right": "Glutes",
  "ham-left": "Hamstrings",
  "ham-right": "Hamstrings",
  "calf-left": "Calves",
  "calf-right": "Calves",
};

export const REGIONS: Region[] = [
  { id: "chest", name: "Chest", view: "front", side: "center", clip: "torso", d: "M74 108C84 96 96 98 100 112C104 98 116 96 126 108C132 124 122 146 108 148L100 140L92 148C78 146 68 124 74 108Z" },
  { id: "shoulder-front-left", name: "Left shoulder", view: "front", side: "left", clip: "arm-left", d: "M40 104C54 94 70 104 66 122C62 136 46 140 36 128C28 116 30 108 40 104Z" },
  { id: "shoulder-front-right", name: "Right shoulder", view: "front", side: "right", clip: "arm-right", d: "M160 104C146 94 130 104 134 122C138 136 154 140 164 128C172 116 170 108 160 104Z" },
  { id: "biceps-left", name: "Left biceps", view: "front", side: "left", clip: "arm-left", d: "M38 146C52 140 62 154 58 176C54 198 44 208 34 198C26 186 28 154 38 146Z" },
  { id: "biceps-right", name: "Right biceps", view: "front", side: "right", clip: "arm-right", d: "M162 146C148 140 138 154 142 176C146 198 156 208 166 198C174 186 172 154 162 146Z" },
  { id: "abs", name: "Abdominals", view: "front", side: "center", clip: "torso", d: "M90 154H110C112 176 112 200 108 220H92C88 200 88 176 90 154Z" },
  { id: "oblique-left", name: "Left obliques", view: "front", side: "left", clip: "torso", d: "M64 160C76 154 84 168 82 190C80 208 72 216 64 210C56 202 54 172 64 160Z" },
  { id: "oblique-right", name: "Right obliques", view: "front", side: "right", clip: "torso", d: "M136 160C124 154 116 168 118 190C120 208 128 216 136 210C144 202 146 172 136 160Z" },
  { id: "quad-left", name: "Left quadriceps", view: "front", side: "left", clip: "leg-left", d: "M70 242C84 234 98 248 94 280C90 316 84 340 74 342C62 340 58 300 62 266C64 250 66 244 70 242Z" },
  { id: "quad-right", name: "Right quadriceps", view: "front", side: "right", clip: "leg-right", d: "M130 242C116 234 102 248 106 280C110 316 116 340 126 342C138 340 142 300 138 266C136 250 134 244 130 242Z" },
  { id: "calf-front-left", name: "Left shin", view: "front", side: "left", clip: "leg-left", d: "M70 366C84 358 98 372 94 400C90 430 84 452 74 450C64 446 62 410 66 384Z" },
  { id: "calf-front-right", name: "Right shin", view: "front", side: "right", clip: "leg-right", d: "M130 366C116 358 102 372 106 400C110 430 116 452 126 450C136 446 138 410 134 384Z" },
  { id: "traps", name: "Trapezius", view: "back", side: "center", clip: "torso", d: "M92 96H108L138 128L100 150L62 128Z" },
  { id: "rear-delt-left", name: "Left rear delt", view: "back", side: "left", clip: "arm-left", d: "M40 104C54 94 70 104 66 122C62 136 46 140 36 128C28 116 30 108 40 104Z" },
  { id: "rear-delt-right", name: "Right rear delt", view: "back", side: "right", clip: "arm-right", d: "M160 104C146 94 130 104 134 122C138 136 154 140 164 128C172 116 170 108 160 104Z" },
  { id: "lat-left", name: "Left lat", view: "back", side: "left", clip: "torso", d: "M62 140C78 134 90 150 86 180C82 204 70 214 60 200C52 184 52 152 62 140Z" },
  { id: "lat-right", name: "Right lat", view: "back", side: "right", clip: "torso", d: "M138 140C122 134 110 150 114 180C118 204 130 214 140 200C148 184 148 152 138 140Z" },
  { id: "lower-back", name: "Lower back", view: "back", side: "center", clip: "torso", d: "M88 156H112C116 176 114 198 108 210H92C86 198 84 176 88 156Z" },
  { id: "glute-left", name: "Left glute", view: "back", side: "left", clip: "pelvis", d: "M78 220C92 210 104 220 100 242C96 260 84 268 74 256C66 244 68 226 78 220Z" },
  { id: "glute-right", name: "Right glute", view: "back", side: "right", clip: "pelvis", d: "M122 220C108 210 96 220 100 242C104 260 116 268 126 256C134 244 132 226 122 220Z" },
  { id: "ham-left", name: "Left hamstrings", view: "back", side: "left", clip: "leg-left", d: "M72 280C88 274 98 292 94 324C90 356 80 368 70 358C60 344 60 300 72 280Z" },
  { id: "ham-right", name: "Right hamstrings", view: "back", side: "right", clip: "leg-right", d: "M128 280C112 274 102 292 106 324C110 356 120 368 130 358C140 344 140 300 128 280Z" },
  { id: "calf-left", name: "Left calf", view: "back", side: "left", clip: "leg-left", d: "M70 378C86 372 98 388 92 418C86 442 76 452 68 442C60 428 62 392 70 378Z" },
  { id: "calf-right", name: "Right calf", view: "back", side: "right", clip: "leg-right", d: "M130 378C114 372 102 388 108 418C114 442 124 452 132 442C140 428 138 392 130 378Z" },
];

const SRC = "Editorial mapping for imported exercises. Not an EMG study and not a percentage.";

function map(exerciseId: string, regionId: string, role: "primary" | "secondary", lateral = false): MuscleMapping {
  return { exerciseId, regionId, role, lateral, source: SRC, status: "reviewed" };
}

export const MAPPINGS: MuscleMapping[] = [
  map("ppt", "abs", "primary"),
  map("ppt", "glute-left", "secondary"),
  map("ppt", "glute-right", "secondary"),
  map("bird-dog", "lower-back", "primary"),
  map("bird-dog", "glute-left", "secondary", true),
  map("bird-dog", "glute-right", "secondary", true),
  map("bracing-marches", "abs", "primary"),
  map("assisted-pullup", "lat-left", "primary"),
  map("assisted-pullup", "lat-right", "primary"),
  map("assisted-pullup", "biceps-left", "secondary"),
  map("assisted-pullup", "biceps-right", "secondary"),
  map("assisted-pullup", "traps", "secondary"),
  map("assisted-pullup", "rear-delt-left", "secondary"),
  map("assisted-pullup", "rear-delt-right", "secondary"),
  map("neutral-pullup", "lat-left", "primary"),
  map("neutral-pullup", "lat-right", "primary"),
  map("neutral-pullup", "biceps-left", "secondary"),
  map("neutral-pullup", "biceps-right", "secondary"),
  map("neutral-pullup", "traps", "secondary"),
  map("neutral-pullup", "rear-delt-left", "secondary"),
  map("neutral-pullup", "rear-delt-right", "secondary"),
  map("clamshell", "glute-left", "primary", true),
  map("clamshell", "glute-right", "primary", true),
  map("pallof", "oblique-left", "primary", true),
  map("pallof", "oblique-right", "primary", true),
  map("band-walks", "glute-left", "primary"),
  map("band-walks", "glute-right", "primary"),
  map("plank", "abs", "primary"),
  map("plank", "shoulder-front-left", "secondary"),
  map("plank", "shoulder-front-right", "secondary"),
  map("suitcase-carry", "oblique-left", "primary", true),
  map("suitcase-carry", "oblique-right", "primary", true),
  map("battle-rope-squat", "quad-left", "primary"),
  map("battle-rope-squat", "quad-right", "primary"),
  map("battle-rope-squat", "shoulder-front-left", "secondary"),
  map("battle-rope-squat", "shoulder-front-right", "secondary"),
  map("battle-rope-squat", "glute-left", "secondary"),
  map("battle-rope-squat", "glute-right", "secondary"),
  map("seated-pigeon", "glute-left", "primary", true),
  map("seated-pigeon", "glute-right", "primary", true),
  map("single-leg-stand", "quad-left", "primary", true),
  map("single-leg-stand", "quad-right", "primary", true),
  map("single-leg-stand", "glute-left", "secondary", true),
  map("single-leg-stand", "glute-right", "secondary", true),
  map("single-leg-stand", "calf-left", "secondary", true),
  map("single-leg-stand", "calf-right", "secondary", true),
  map("single-leg-stand", "calf-front-left", "secondary", true),
  map("single-leg-stand", "calf-front-right", "secondary", true),
  map("pt-shoulder-flexion", "abs", "primary"),
  map("pt-shoulder-flexion", "shoulder-front-left", "primary"),
  map("pt-shoulder-flexion", "shoulder-front-right", "primary"),
];

export function regionById(id: string): Region | undefined {
  return REGIONS.find((region) => region.id === id);
}

export function muscleLabel(exerciseId: string): string {
  const names: string[] = [];
  const ordered = MAPPINGS.filter((item) => item.exerciseId === exerciseId).slice().sort((a, b) => (a.role === b.role ? 0 : a.role === "primary" ? -1 : 1));
  for (const mapping of ordered) {
    const label = GROUP[mapping.regionId];
    if (label && !names.includes(label)) names.push(label);
  }
  return names.join(", ");
}

export const HEAT_BANDS = [
  { id: 0, label: "0", detail: "No recorded primary sets" },
  { id: 1, label: "1–3", detail: "1 to 3 recorded primary sets" },
  { id: 2, label: "4–7", detail: "4 to 7 recorded primary sets" },
  { id: 3, label: "8+", detail: "8 or more recorded primary sets" },
] as const;

export function heatBand(count: number): 0 | 1 | 2 | 3 {
  if (count <= 0) return 0;
  if (count <= 3) return 1;
  if (count <= 7) return 2;
  return 3;
}
