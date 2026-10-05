/* Round 6: real exercise motion clips, played INLINE through Vimeo's official embed player (player.vimeo.com).
   One host and one library account for a uniform look: Erin Stern's public exercise-demo library on Vimeo (https://vimeo.com/erinstern).
   No video file is downloaded, re-hosted or hot-linked: the app only loads Vimeo's own player iframe, as Vimeo allows for public, embeddable videos.
   No YouTube anywhere (Randy's explicit wish).

   How each entry was verified on VERIFIED_AT (nothing invented):
   - https://vimeo.com/api/oembed.json?url=https://vimeo.com/<id> answered 200 (public and embeddable; private / embed-restricted videos answer 403/404),
   - the oEmbed title, author and duration were recorded below, and the title (and thumbnail when the title was vague) was read against the move,
   - playerChecked: the player.vimeo.com page itself also loaded headless from the build box. false = Vimeo's bot check blocked the
     datacenter box for that one id (not an embed restriction: oEmbed is 200), so playback there is expected to work for real visitors but was not seen.
   match "close" = the nearest variant in the library (labelled in the UI). Moves with no good clip are in NO_VIDEO and keep the photos/diagram. */

export type VideoHost = "vimeo";

export type VideoEntry = {
  host: VideoHost;
  id: string;
  title: string;
  author: string;
  authorUrl: string;
  /** seconds, from oEmbed */
  duration: number;
  /** native size from oEmbed, used for the frame's aspect ratio */
  width: number;
  height: number;
  match: "exact" | "close";
  verifiedAt: string;
  /** the player page itself was seen loading from the build box (see note above) */
  playerChecked: boolean;
  /** optional start offset in seconds */
  start?: number;
};

export const VERIFIED_AT = "2026-10-05";

export const VIDEO_LIBRARY = { host: "vimeo" as const, author: "Erin Stern", url: "https://vimeo.com/erinstern" };

const v = (id: string, title: string, duration: number, width: number, height: number, match: "exact" | "close", playerChecked: boolean): VideoEntry => ({
  host: "vimeo",
  id,
  title,
  author: VIDEO_LIBRARY.author,
  authorUrl: VIDEO_LIBRARY.url,
  duration,
  width,
  height,
  match,
  verifiedAt: VERIFIED_AT,
  playerChecked,
});

export const VIDEOS: Record<string, VideoEntry> = {
  "dead-bug": v("472985316", "Dead bugs", 15, 426, 240, "exact", true),
  "clamshell": v("382073937", "Side lying clam", 12, 426, 240, "exact", true),
  "band-walks": v("382082557", "Banded side steps", 15, 426, 240, "exact", true),
  "plank": v("1042343867", "Plank", 36, 240, 300, "exact", false),
  "pallof": v("382892058", "Palloff press", 22, 240, 240, "exact", true),
  "neutral-pullup": v("344219307", "Pull Ups - Neutral Grip", 27, 426, 240, "exact", true),
  "chest-supported-row": v("363548502", "Supine Rows - Dumbbell", 29, 426, 240, "close", true),
  "half-kneeling-pulldown": v("397466103", "Single-Arm Pulldown", 14, 426, 240, "close", true),
  "face-pull": v("388229309", "Face Pulls", 22, 426, 240, "exact", true),
  "straight-arm-pulldown": v("1042343360", "Rope straight arm pushdowns", 37, 240, 300, "exact", false),
  "reverse-crunch": v("388228068", "Reverse Crunches", 6, 426, 240, "exact", true),
  "cable-crunch": v("393285873", "Cable crunches", 12, 426, 240, "exact", true),
  "hack-squat": v("982699537", "Hack squat machine", 65, 240, 300, "exact", false),
  "heel-elevated-goblet": v("683470013", "Heel-elevated goblet squat", 12, 240, 320, "exact", true),
  "bulgarian-split-squat": v("341669853", "Bulgarian Split Squats", 40, 426, 240, "exact", true),
  "leg-press": v("393286049", "Machine leg press", 11, 426, 240, "exact", true),
  "leg-extension": v("941687235", "Leg extensions", 52, 240, 300, "exact", false),
  "standing-calf-raise": v("683469263", "Standing dumbbell calf raise", 12, 240, 320, "exact", true),
  "incline-db-press": v("347319864", "Dumbbell incline bench press", 30, 426, 240, "exact", true),
  "landmine-press": v("1142414776", "Kneeling landmine shoulder press", 21, 240, 300, "close", false),
  "weighted-pushup": v("382073397", "Push ups", 15, 426, 240, "close", true),
  "low-high-fly": v("381715532", "Cable incline flyes", 40, 240, 240, "close", true),
  "cable-lateral-raise": v("381693241", "Lateral raise - cable", 45, 426, 240, "exact", true),
  "overhead-rope-triceps": v("537000406", "Cable overhead triceps extension", 13, 426, 240, "exact", true),
  "hip-thrust": v("937917670", "Barbell hip thrust", 54, 240, 300, "exact", false),
  "machine-hip-thrust": v("1164665323", "Hip thrust machine", 29, 240, 300, "exact", false),
  "bstance-rdl": v("341669771", "B-Stance RDLs", 51, 426, 240, "exact", true),
  "leg-curl": v("1042344101", "Seated leg curl", 42, 240, 300, "exact", false),
  "lying-leg-curl": v("342013944", "Lying leg curl", 31, 240, 240, "exact", true),
  "reverse-lunge": v("382075041", "Reverse lunges", 12, 426, 240, "exact", true),
  "box-step-up": v("400928242", "Weighted Step Ups", 11, 426, 240, "exact", true),
  "back-extension-45": v("522365419", "45 degree back hyper (toes out)", 11, 426, 240, "exact", true),
  "cable-hip-abduction": v("939620596", "Glute medius leg lifts - cable", 61, 240, 300, "exact", false),
  "seated-calf-raise": v("394065041", "Seated calf raise machine", 15, 426, 240, "exact", true),
  "shoulder-press": v("342271556", "Seated dumbbell shoulder press", 27, 240, 240, "exact", true),
  "reverse-pec-deck": v("374270600", "Reverse flyes on pec deck", 25, 426, 240, "exact", true),
  "y-raise": v("342015132", "Y-Raise", 21, 426, 240, "exact", true),
  "incline-db-curl": v("943676055", "Incline curls", 29, 240, 300, "exact", false),
  "rope-pressdown": v("943677306", "Triceps push downs", 30, 240, 300, "exact", false),
  "farmer-carry": v("441077323", "Farmer’s carries", 5, 426, 240, "exact", true),
  "adductor-machine": v("394065217", "Adductor Machine", 14, 426, 240, "exact", true),
  "sumo-goblet": v("666343493", "Dumbbell sumo squat", 13, 320, 240, "close", true),
  "high-low-fly": v("342626247", "Decline Flyes - Cable", 28, 240, 240, "close", true),
  "hammer-curl": v("388229474", "Hammer Curls", 16, 426, 240, "exact", true),
  "band-pull-apart": v("386067508", "Band pull aparts", 10, 426, 240, "exact", true),
  "lat-pulldown": v("949268043", "Wide grip lat pulldown", 33, 240, 300, "exact", false),
  "seated-cable-row": v("472608975", "Cable low row", 9, 426, 240, "exact", true),
  "side-plank": v("497051978", "Side plank", 5, 426, 240, "exact", true),
  "hanging-knee-raise": v("391501964", "Hanging Knee Raises", 23, 426, 240, "close", true),
  "cable-woodchop": v("513051858", "Wood chopper low to high", 8, 426, 240, "exact", true),
  "glute-bridge": v("513047635", "Body weight glute bridge", 7, 426, 240, "exact", true),
  "cable-pull-through": v("344218224", "Pull Throughs", 34, 426, 240, "exact", true),
  "sl-glute-bridge": v("388227392", "Glute Bridge - Single-leg", 14, 426, 240, "exact", true),
  "ball-leg-curl": v("441078130", "Swiss ball leg curls", 10, 426, 240, "exact", true),
  "nordic-curl": v("512608356", "Nordic curl - toes under machine", 21, 426, 240, "exact", true),
  "leg-press-narrow": v("683465388", "Narrow stance leg press", 8, 240, 320, "exact", true),
  "assisted-dip": v("1141626909", "Dips", 19, 240, 300, "close", false),
  "wall-sit": v("497052707", "Wall sit", 5, 426, 240, "exact", true),
  "sl-calf-raise-press": v("393286127", "Calf raise on leg press", 8, 426, 240, "close", true),
  "skull-crusher": v("397863107", "Skullcrushers - EZ Bar", 9, 240, 426, "exact", true),
  "close-grip-pushup": v("493483617", "Kettlebell close grip push-ups", 9, 426, 240, "close", true),
  "preacher-curl": v("683467884", "Preacher curls on cable row machine", 11, 240, 320, "close", true),
  "cable-front-raise": v("382086323", "Front raise - cable", 21, 240, 240, "exact", true),
  "chest-supported-rear-fly": v("499280692", "Incline rear delt raise", 18, 426, 240, "exact", true),
  "side-lying-abduction": v("393284377", "Lying abductor leg lift", 8, 426, 240, "exact", true),
  "pushup": v("382073397", "Push ups", 15, 426, 240, "exact", true),
  "reverse-hyper-light": v("453350047", "Reverse hypers", 23, 426, 240, "exact", true),
};

/** Moves with no clip, and why. They keep the real photos (photo loop) and, failing that, the diagram. */
export const NO_VIDEO: Record<string, string> = {
  "ppt": "Lying posterior pelvic tilt: the library's only tilt clip is a hanging variation, so the photos/diagram are kept.",
  "pt-shoulder-flexion": "No clip of the pelvic-tilt + shoulder-flexion hold in the library; photos/diagram kept.",
  "bird-dog": "No bird-dog clip in the Vimeo library used; photos/diagram kept.",
  "bracing-marches": "No braced supine-march clip in the library; photos/diagram kept.",
  "single-leg-stand": "Balance hold with no clip in the library; photos/diagram kept.",
  "seated-pigeon": "Seated stretch with no clip in the library; photos/diagram kept.",
  "suitcase-carry": "No one-sided carry clip in the library; photos/diagram kept.",
  "mobility-flow": "A multi-move warm-up flow, not one movement; no single clip fits.",
  "zone2": "Steady cardio block (any machine), not a lift; no clip needed.",
  "tuesday-cardio": "Cardio block, not a lift; no clip needed.",
  "wednesday-cardio": "Cardio block, not a lift; no clip needed.",
  "saturday-cardio": "Cardio block, not a lift; no clip needed.",
  "assisted-pullup": "No assisted pull-up machine clip in the library; photos/diagram kept.",
  "incline-shrug": "No incline-bench shrug clip in the library; photos/diagram kept.",
  "tibialis-raise": "No tibialis raise clip in the library; photos/diagram kept.",
  "machine-chest-press": "No seated machine chest press clip found in the library; photos/diagram kept.",
  "machine-shoulder-press": "No machine shoulder press clip in the library; photos/diagram kept.",
  "btb-lateral-raise": "No behind-the-back cable lateral raise clip in the library; photos/diagram kept.",
  "ez-curl": "No EZ-bar curl clip found in the library; photos/diagram kept.",
  "cross-body-cable-ext": "No cross-body cable triceps extension clip in the library; photos/diagram kept.",
  "battle-rope-squat": "No battle-rope squat clip in the library; photos/diagram kept.",
  "pec-deck": "No forward pec-deck fly clip found in the library; photos/diagram kept.",
  "incline-machine-press": "Library clip found was a plate-press (holding a weight plate), not the machine; photos/diagram kept.",
  "wrist-curl": "No wrist curl clip in the library; photos/diagram kept.",
  "dead-hang": "No dead-hang clip in the library; photos/diagram kept.",
  "cable-external-rotation": "Library external-rotation clip was ambiguous about setup; photos/diagram kept.",
  "tbar-chest-supported": "Library T-bar clip is a landmine row, not chest-supported; photos/diagram kept.",
  "cable-shrug": "No cable shrug clip in the library; photos/diagram kept.",
  "machine-lateral-raise": "No lateral raise machine clip in the library; photos/diagram kept.",
  "bird-dog-hold": "No bird-dog clip in the library; photos/diagram kept.",
};

export function videoFor(exerciseId: string): VideoEntry | undefined {
  return VIDEOS[exerciseId];
}

export function isVimeoId(id: string): boolean {
  return /^\d{6,12}$/.test(id);
}

/** The only embed URL the app builds: Vimeo's official player, muted autoplay loop, inline, Do Not Track. */
export function vimeoEmbedUrl(v: Pick<VideoEntry, "id" | "start">): string {
  const base = `https://player.vimeo.com/video/${v.id}?autoplay=1&muted=1&loop=1&playsinline=1&title=0&byline=0&portrait=0&dnt=1`;
  return v.start ? `${base}#t=${Math.max(0, Math.round(v.start))}s` : base;
}

export function vimeoPageUrl(id: string): string {
  return `https://vimeo.com/${id}`;
}

export function videoCredit(v: Pick<VideoEntry, "title" | "author">): string {
  return `Video: ${v.title} by ${v.author} on Vimeo`;
}
