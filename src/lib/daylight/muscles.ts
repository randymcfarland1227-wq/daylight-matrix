/** Muscle groups used by the body map, the volume engine and the notes digest. */
export type MuscleId =
  | "chest-upper"
  | "chest"
  | "delt-front"
  | "delt-side"
  | "delt-rear"
  | "biceps"
  | "triceps"
  | "forearms"
  | "traps"
  | "mid-back"
  | "lats"
  | "lower-back"
  | "rotator-cuff"
  | "abs"
  | "obliques"
  | "glutes"
  | "glute-med"
  | "adductors"
  | "quads"
  | "hamstrings"
  | "calves"
  | "tibialis";

export type MuscleInfo = {
  id: MuscleId;
  name: string;
  /** Plain-language description, general education only. */
  blurb: string;
  region: "Upper body" | "Core" | "Lower body";
  views: ("front" | "back")[];
};

export const MUSCLES: MuscleInfo[] = [
  { id: "chest-upper", name: "Upper chest", blurb: "Collarbone side of the pecs. Works hardest on incline presses and low-to-high flys.", region: "Upper body", views: ["front"] },
  { id: "chest", name: "Chest (mid / lower)", blurb: "The main body of the pecs. Pressing and dip patterns.", region: "Upper body", views: ["front"] },
  { id: "delt-front", name: "Front delts", blurb: "Front of the shoulder. Gets a lot of help from every press.", region: "Upper body", views: ["front"] },
  { id: "delt-side", name: "Side delts", blurb: "Outer shoulder. Lateral raises are the direct move.", region: "Upper body", views: ["front", "back"] },
  { id: "delt-rear", name: "Rear delts", blurb: "Back of the shoulder. Reverse flys, face pulls, rows.", region: "Upper body", views: ["back"] },
  { id: "biceps", name: "Biceps", blurb: "Front of the upper arm. Curls, and any pulling move.", region: "Upper body", views: ["front"] },
  { id: "triceps", name: "Triceps", blurb: "Back of the upper arm. Pressdowns, extensions, presses.", region: "Upper body", views: ["back"] },
  { id: "forearms", name: "Forearms / grip", blurb: "Grip and wrist muscles. Carries and heavy pulls load them.", region: "Upper body", views: ["front", "back"] },
  { id: "traps", name: "Upper traps", blurb: "The slope from neck to shoulder. Shrugs and carries.", region: "Upper body", views: ["back"] },
  { id: "mid-back", name: "Mid-back / lower traps", blurb: "Between and under the shoulder blades. Rows and Y-raises.", region: "Upper body", views: ["back"] },
  { id: "lats", name: "Lats", blurb: "The wide muscle down the side of the back. Pull-ups, pulldowns.", region: "Upper body", views: ["back"] },
  { id: "rotator-cuff", name: "Rotator cuff", blurb: "Small muscles that steady the shoulder joint. External rotation work.", region: "Upper body", views: ["back"] },
  { id: "lower-back", name: "Lower back (erectors)", blurb: "Muscles either side of the spine. Hinge and bird-dog patterns.", region: "Core", views: ["back"] },
  { id: "abs", name: "Abs", blurb: "Front of the trunk. Crunches, tilts, bracing, planks.", region: "Core", views: ["front"] },
  { id: "obliques", name: "Obliques", blurb: "Sides of the trunk. They resist twisting in carries and Pallof holds.", region: "Core", views: ["front"] },
  { id: "glutes", name: "Glutes", blurb: "The big muscles of the hips. Thrusts, hinges, lunges.", region: "Lower body", views: ["back"] },
  { id: "glute-med", name: "Glute med / hip abductors", blurb: "Outer hip. Clamshells, band walks, hip abduction.", region: "Lower body", views: ["back"] },
  { id: "adductors", name: "Adductors (inner thigh)", blurb: "Inner thigh. Squat and lunge variations help; machines hit them directly.", region: "Lower body", views: ["front"] },
  { id: "quads", name: "Quads", blurb: "Front of the thigh. Squats, presses, extensions.", region: "Lower body", views: ["front"] },
  { id: "hamstrings", name: "Hamstrings", blurb: "Back of the thigh. Curls and hinges.", region: "Lower body", views: ["back"] },
  { id: "calves", name: "Calves", blurb: "Back of the lower leg. Standing and seated raises.", region: "Lower body", views: ["back", "front"] },
  { id: "tibialis", name: "Shins (tibialis)", blurb: "Front of the lower leg. Toe raises.", region: "Lower body", views: ["front"] },
];

export const MUSCLE_IDS = MUSCLES.map((m) => m.id);

export function muscleInfo(id: string): MuscleInfo | undefined {
  return MUSCLES.find((m) => m.id === id);
}

export function muscleName(id: string): string {
  return muscleInfo(id)?.name ?? id;
}

/** Old 24-region map ids -> new muscle groups, used by the data migration. */
export const OLD_REGION_TO_MUSCLE: Record<string, MuscleId> = {
  chest: "chest",
  "shoulder-front-left": "delt-front",
  "shoulder-front-right": "delt-front",
  "biceps-left": "biceps",
  "biceps-right": "biceps",
  abs: "abs",
  "oblique-left": "obliques",
  "oblique-right": "obliques",
  "quad-left": "quads",
  "quad-right": "quads",
  "calf-front-left": "tibialis",
  "calf-front-right": "tibialis",
  traps: "traps",
  "rear-delt-left": "delt-rear",
  "rear-delt-right": "delt-rear",
  "lat-left": "lats",
  "lat-right": "lats",
  "lower-back": "lower-back",
  "glute-left": "glutes",
  "glute-right": "glutes",
  "ham-left": "hamstrings",
  "ham-right": "hamstrings",
  "calf-left": "calves",
  "calf-right": "calves",
};
