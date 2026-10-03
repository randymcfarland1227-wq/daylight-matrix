/* Embedded demo videos, keyed by exercise id.
   Every entry was checked on VERIFIED_AT: the YouTube oEmbed endpoint answered 200 for the id
   (https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=ID&format=json, which refuses
   non-embeddable videos), the oEmbed title/author were recorded below, and the title was read against the move.
   Nothing here was invented. Moves with no good clip are listed in NO_VIDEO and keep the YouTube-search fallback (demoUrl). */

export type VideoEntry = { id: string; title: string; channel: string; verifiedAt: string };

export const VERIFIED_AT = "2026-10-03";

export const VIDEOS: Record<string, VideoEntry> = {
  "ppt": { id: "4j0vN1WEIyg", title: "Hip & Joint Patient Exercises: Posterior Pelvic Tilt", channel: "HCA HealthONE", verifiedAt: VERIFIED_AT },
  "pt-shoulder-flexion": { id: "glwqk4VEvcM", title: "Posterior Pelvic Tilt with Shoulder Flexion Iso", channel: "Flight Performance & Fitness", verifiedAt: VERIFIED_AT },
  "bird-dog": { id: "S1QbyYZaXIg", title: "McGill “Big 3” - The Birddog", channel: "Northern Nevada Chiropractic", verifiedAt: VERIFIED_AT },
  "bracing-marches": { id: "qLsjOt9yDTM", title: "Marching with Abdominal Brace (level 1)", channel: "IPA Physio", verifiedAt: VERIFIED_AT },
  "dead-bug": { id: "GbSC02oU3To", title: "How to Do a Dead Bug: A Guide from Physical Therapists", channel: "Hinge Health", verifiedAt: VERIFIED_AT },
  "clamshell": { id: "gFyIjunfbbg", title: "How to Do the Clamshell Exercise", channel: "Hinge Health", verifiedAt: VERIFIED_AT },
  "band-walks": { id: "M5uxEQH5BUM", title: "How to do Lateral Band Walking", channel: "National Academy of Sports Medicine (NASM)", verifiedAt: VERIFIED_AT },
  "single-leg-stand": { id: "Wb68ze1oH5c", title: "How to Do a Single Leg Stance Exercise | 30 Seconds | MedBridge", channel: "Medbridge", verifiedAt: VERIFIED_AT },
  "seated-pigeon": { id: "9duW9HncInY", title: "Seated Pigeon Pose", channel: "Kaplan Center for Integrative Medicine", verifiedAt: VERIFIED_AT },
  "suitcase-carry": { id: "y-hn_Ha1-RE", title: "How To Perform The Suitcase Carry", channel: "Dr. Carl Baird", verifiedAt: VERIFIED_AT },
  "plank": { id: "kL_NJAkCQBg", title: "Mastering the Plank - In Just 2 Minutes", channel: "Calisthenicmovement", verifiedAt: VERIFIED_AT },
  "pallof": { id: "otxypVv_0Es", title: "How To Perform The Pallof Press Exercise For Less Lower Back Pain", channel: "Dr. Carl Baird", verifiedAt: VERIFIED_AT },
  "assisted-pullup": { id: "gx0RWT7WbmA", title: "How To PROPERLY Use The Assisted Pull Up Machine (DO MORE PULL UPS)", channel: "Colossus Fitness", verifiedAt: VERIFIED_AT },
  "neutral-pullup": { id: "tSRo8ksP27I", title: "How to perform a Neutral Grip Pull Up", channel: "Dimitri Giankoulas", verifiedAt: VERIFIED_AT },
  "chest-supported-row": { id: "vmX58YYK3-8", title: "Perfect Dumbbell Chest Supported Rows (KING of Back Exercises)", channel: "Seriously Strong Training", verifiedAt: VERIFIED_AT },
  "half-kneeling-pulldown": { id: "OWvqEaT6Ohc", title: "Half-Kneeling Single-Arm Lat Pull Down Technique Video", channel: "Jordan Syatt", verifiedAt: VERIFIED_AT },
  "face-pull": { id: "qCTlaGin9dQ", title: "Rope Face Pull (External Rotation)", channel: "E3 Rehab Exercise Library", verifiedAt: VERIFIED_AT },
  "incline-shrug": { id: "VXwCPj1U1a4", title: "Chest Supported Incline Shrug", channel: "Testosterone Nation", verifiedAt: VERIFIED_AT },
  "straight-arm-pulldown": { id: "G9uNaXGTJ4w", title: "Straight Arm Pulldown", channel: "Renaissance Periodization", verifiedAt: VERIFIED_AT },
  "reverse-crunch": { id: "XY8KzdDcMFg", title: "How To Do A Reverse Crunch", channel: "PureGym", verifiedAt: VERIFIED_AT },
  "cable-crunch": { id: "3qjoXDTuyOE", title: "Cable Crunch - Abs / Core Exercise - Bodybuilding.com", channel: "Bodybuilding.com", verifiedAt: VERIFIED_AT },
  "hack-squat": { id: "rYgNArpwE7E", title: "Hack Squat", channel: "Renaissance Periodization", verifiedAt: VERIFIED_AT },
  "heel-elevated-goblet": { id: "lmWPn5Q-TSE", title: "How To: Dumbbell Goblet Squat (Heels Elevated)", channel: "Fitness Lab", verifiedAt: VERIFIED_AT },
  "bulgarian-split-squat": { id: "fSyiHxm1Igw", title: "Avoid These 3 Bulgarian Split Squat Mistakes!", channel: "Squat University", verifiedAt: VERIFIED_AT },
  "leg-press": { id: "D9tF7fBoDYM", title: "How To Leg Press | Better! | Dorian Yates", channel: "Bodybuildergreats", verifiedAt: VERIFIED_AT },
  "leg-extension": { id: "4ZDm5EbiFI8", title: "How To Do A Leg Extension", channel: "PureGym", verifiedAt: VERIFIED_AT },
  "standing-calf-raise": { id: "SVtg-1loH4c", title: "How to PROPERLY Standing Calf Raise | Tips & Common Mistakes", channel: "Colossus Fitness", verifiedAt: VERIFIED_AT },
  "tibialis-raise": { id: "VzIcGAgBiaM", title: "Tibialis Wall Raises (Exercise Demo)", channel: "The Barefoot Sprinter", verifiedAt: VERIFIED_AT },
  "incline-db-press": { id: "8iPEnn-ltC8", title: "How To: Dumbbell Incline Chest Press", channel: "ScottHermanFitness", verifiedAt: VERIFIED_AT },
  "landmine-press": { id: "Sjb5meztfSE", title: "Single-Arm Landmine Press [technique breakdown]", channel: "Coach Joe Drake", verifiedAt: VERIFIED_AT },
  "machine-chest-press": { id: "xUm0BiZCWlQ", title: "How To: Chest Press (Cybex)", channel: "ScottHermanFitness", verifiedAt: VERIFIED_AT },
  "weighted-pushup": { id: "eM89z8sojy4", title: "Weighted Push Up", channel: "OPEX Fitness", verifiedAt: VERIFIED_AT },
  "low-high-fly": { id: "eQ_NBB6OBH4", title: "HOW TO: Chest \"Low-To-High\" Cable Fly (BIGGER UPPER CHEST) || PERFECT FORM", channel: "ScottHermanFitness", verifiedAt: VERIFIED_AT },
  "cable-lateral-raise": { id: "Z5FA9aq3L6A", title: "How To Do Cable Lateral Raises", channel: "PureGym", verifiedAt: VERIFIED_AT },
  "overhead-rope-triceps": { id: "kqidUIf1eJE", title: "Rope Overhead Triceps Extension", channel: "Renaissance Periodization", verifiedAt: VERIFIED_AT },
  "assisted-dip": { id: "yZ83t4mrPrI", title: "Assisted Dip", channel: "Renaissance Periodization", verifiedAt: VERIFIED_AT },
  "hip-thrust": { id: "LM8XHLYJoYs", title: "Proper Hip Thrust Form", channel: "Bret Contreras Glute Guy", verifiedAt: VERIFIED_AT },
  "machine-hip-thrust": { id: "ZSPmIyX9RZs", title: "Machine Hip Thrust", channel: "Renaissance Periodization", verifiedAt: VERIFIED_AT },
  "bstance-rdl": { id: "Q_z2eDx9cE4", title: "B Stance Romanian Deadlift", channel: "The Barbell Physio", verifiedAt: VERIFIED_AT },
  "leg-curl": { id: "Orxowest56U", title: "Seated Leg Curl", channel: "Renaissance Periodization", verifiedAt: VERIFIED_AT },
  "lying-leg-curl": { id: "jxctD6fL_FQ", title: "Lying Leg Curls - Leg Exercise - Bodybuilding.com", channel: "Bodybuilding.com", verifiedAt: VERIFIED_AT },
  "reverse-lunge": { id: "xrPteyQLGAo", title: "How To Reverse Lunge", channel: "PureGym", verifiedAt: VERIFIED_AT },
  "box-step-up": { id: "elhu-WC1qk4", title: "Proper Step Ups/Downs", channel: "[P]rehab", verifiedAt: VERIFIED_AT },
  "back-extension-45": { id: "OMb1VFQK9Tk", title: "45 Degree Hip Extension [Glutes & Hamstrings Bias]", channel: "Physique Development", verifiedAt: VERIFIED_AT },
  "cable-hip-abduction": { id: "1rbpTTzEnV4", title: "How To: Hip Abduction (LF Cable)", channel: "ScottHermanFitness", verifiedAt: VERIFIED_AT },
  "seated-calf-raise": { id: "BxfKOyI8sUg", title: "How to Do a Seated Calf Raise: A Guide from Physical Therapists", channel: "Hinge Health", verifiedAt: VERIFIED_AT },
  "shoulder-press": { id: "vlFGTI5JzjI", title: "How To PROPERLY Dumbbell Shoulder Press (LEARN FAST)", channel: "Colossus Fitness", verifiedAt: VERIFIED_AT },
  "machine-shoulder-press": { id: "WvLMauqrnK8", title: "Machine Shoulder Press", channel: "Renaissance Periodization", verifiedAt: VERIFIED_AT },
  "btb-lateral-raise": { id: "fWvTfgTIgMk", title: "Behind the back cable lateral raise", channel: "Ron Harris Muscle", verifiedAt: VERIFIED_AT },
  "reverse-pec-deck": { id: "5YK4bgzXDp0", title: "Machine Reverse Flye", channel: "Renaissance Periodization", verifiedAt: VERIFIED_AT },
  "y-raise": { id: "UB9uN3RDA5M", title: "Cable Y Raise and Cable Lateral Raise", channel: "Testosterone Nation", verifiedAt: VERIFIED_AT },
  "ez-curl": { id: "zG2xJ0Q5QtI", title: "How To: Inside-Grip Bicep Curl With E-Z Bar Curl", channel: "ScottHermanFitness", verifiedAt: VERIFIED_AT },
  "incline-db-curl": { id: "aTYlqC_JacQ", title: "Incline Dumbbell Curl", channel: "Renaissance Periodization", verifiedAt: VERIFIED_AT },
  "rope-pressdown": { id: "-xa-6cQaZKY", title: "Rope Pushdown", channel: "Renaissance Periodization", verifiedAt: VERIFIED_AT },
  "cross-body-cable-ext": { id: "xzs9RTtt5y8", title: "Cable Cross-Body Tricep Extension (Technique)", channel: "Ryan Jewers", verifiedAt: VERIFIED_AT },
  "farmer-carry": { id: "lLAw6fUccKA", title: "Farmer's Carry Tutorial - Proper Form and Technique", channel: "Runna", verifiedAt: VERIFIED_AT },
  "adductor-machine": { id: "CjAVezAggkI", title: "How To Use The Seated Thigh Adduction (Hip Adduction) Machine", channel: "PureGym", verifiedAt: VERIFIED_AT },
  "sumo-goblet": { id: "R0I3kN0wo9w", title: "Sumo Goblet Squat (Wide Stance)", channel: "TrainFTW", verifiedAt: VERIFIED_AT },
  "pec-deck": { id: "FDay9wFe5uE", title: "Machine Flye", channel: "Renaissance Periodization", verifiedAt: VERIFIED_AT },
  "incline-machine-press": { id: "TrTSvn5-MTk", title: "Incline Machine Chest Press", channel: "Renaissance Periodization", verifiedAt: VERIFIED_AT },
  "high-low-fly": { id: "cITkrjS-Lgw", title: "High to Low Cable Fly", channel: "Melita ReGen Lab + Performance Center", verifiedAt: VERIFIED_AT },
  "wrist-curl": { id: "3VLTzIrnb5g", title: "How To Do Wrist Curls", channel: "PureGym", verifiedAt: VERIFIED_AT },
  "hammer-curl": { id: "Hy5L3-QJETc", title: "How to PROPERLY Dumbbell Hammer Curl (FIX THIS NOW!)", channel: "Colossus Fitness", verifiedAt: VERIFIED_AT },
  "dead-hang": { id: "no_ZdiJsLu4", title: "Build Hanging From Zero! Great for beginners!", channel: "Tom Morrison", verifiedAt: VERIFIED_AT },
  "band-pull-apart": { id: "smSSXITNpCI", title: "How To Do Band Pull Aparts", channel: "Rogue Fitness", verifiedAt: VERIFIED_AT },
  "cable-external-rotation": { id: "GxDF2AYsI1Q", title: "Cable Shoulder External Rotation", channel: "Physio Plus Fitness", verifiedAt: VERIFIED_AT },
  "lat-pulldown": { id: "AOpi-p0cJkc", title: "Beginner's Guide: Lat Pulldown", channel: "SilverSneakers", verifiedAt: VERIFIED_AT },
  "seated-cable-row": { id: "xQNrFHEMhI4", title: "Seated Cable Row | Exercise Guide", channel: "Bodybuilding.com", verifiedAt: VERIFIED_AT },
  "tbar-chest-supported": { id: "CRpez9nWVH0", title: "Chest Supported T Bar Row Tutorial", channel: "Prep Coach UK", verifiedAt: VERIFIED_AT },
  "side-plank": { id: "N_s9em1xTqU", title: "Core Exercise: Side Plank", channel: "Children's Hospital Colorado", verifiedAt: VERIFIED_AT },
  "hanging-knee-raise": { id: "7KDDZtaUaxw", title: "How To Do A CAPTAIN'S CHAIR KNEE RAISE | Exercise Demonstration Video and Guide", channel: "Live Lean TV Daily Exercises", verifiedAt: VERIFIED_AT },
  "cable-woodchop": { id: "ZDt4MCvjMAA", title: "HOW TO: Cable Wood Chop", channel: "Goodlife Health Clubs", verifiedAt: VERIFIED_AT },
  "glute-bridge": { id: "L9KZfxT654Y", title: "Glute Bridge Tutorial - Proper Form and Technique", channel: "Runna", verifiedAt: VERIFIED_AT },
  "cable-pull-through": { id: "pv8e6OSyETE", title: "Cable Pull Through", channel: "Renaissance Periodization", verifiedAt: VERIFIED_AT },
  "sl-glute-bridge": { id: "_K_di6h2-Wg", title: "How to do a Single-Leg Glute Bridge | The Right Way | Well+Good", channel: "Well+Good", verifiedAt: VERIFIED_AT },
  "ball-leg-curl": { id: "XkESHgkTdFw", title: "Swiss Ball Hamstring Curl | Nuffield Health", channel: "Nuffield Health", verifiedAt: VERIFIED_AT },
  "nordic-curl": { id: "3-4pKUhkzoQ", title: "Nordic Hamstring Curls for Beginners (In 1 Minute!)", channel: "Movement Project PT", verifiedAt: VERIFIED_AT },
  "leg-press-narrow": { id: "QPlMYBDSRE0", title: "Machine Leg Press (Narrow Stance) Exercise Breakdown", channel: "MattLeeFit", verifiedAt: VERIFIED_AT },
  "wall-sit": { id: "RG7z0P9qrLk", title: "Wall Sit", channel: "E3 Rehab Exercise Library", verifiedAt: VERIFIED_AT },
  "sl-calf-raise-press": { id: "Wr6Bik6Lrp4", title: "Leg Press Machine Single Leg Calf Raises", channel: "OPEX Fitness", verifiedAt: VERIFIED_AT },
  "skull-crusher": { id: "GaK2da6B2zM", title: "EZ Bar Skull Crushers: How To", channel: "Hammer Fitness", verifiedAt: VERIFIED_AT },
  "close-grip-pushup": { id: "2cdIRe5tcqI", title: "Close Grip Pushup", channel: "Atomic Athlete", verifiedAt: VERIFIED_AT },
  "preacher-curl": { id: "Ja6ZlIDONac", title: "Machine Preacher Curl", channel: "Renaissance Periodization", verifiedAt: VERIFIED_AT },
  "cable-shrug": { id: "YykmcX2b-LY", title: "Cable Shrug", channel: "Renaissance Periodization", verifiedAt: VERIFIED_AT },
  "machine-lateral-raise": { id: "0o07iGKUarI", title: "Machine Lateral Raise", channel: "Renaissance Periodization", verifiedAt: VERIFIED_AT },
  "cable-front-raise": { id: "vtH93qBItdk", title: "How To Do A Cable Front Raise", channel: "PureGym", verifiedAt: VERIFIED_AT },
  "chest-supported-rear-fly": { id: "iCbVhDNpG-Y", title: "DB Chest Supported Rear Delt Fly", channel: "Functional AF", verifiedAt: VERIFIED_AT },
  "side-lying-abduction": { id: "s6lDpy4AO6w", title: "Sidelying Hip Abduction", channel: "E3 Rehab Exercise Library", verifiedAt: VERIFIED_AT },
  "pushup": { id: "WDIpL0pjun0", title: "How to do a Push-Up | Proper Form & Technique | NASM", channel: "National Academy of Sports Medicine (NASM)", verifiedAt: VERIFIED_AT },
  "bird-dog-hold": { id: "haljYutC2Vw", title: "How To Properly Do A Bird Dog with Hold - Strength and Posture Exercises - Wellen", channel: "Wellen", verifiedAt: VERIFIED_AT },
  "reverse-hyper-light": { id: "80vSt6iDywo", title: "How To Do Reverse Hyperextensions to Fix Low Back Pain (Posterior Pelvic Tilt)", channel: "Dr. Josh Jagoda", verifiedAt: VERIFIED_AT },
};

/** Deliberate fallbacks: no verified clip of that exact movement. These keep the "Watch demo (YouTube search)" link. */
export const NO_VIDEO: Record<string, string> = {
  "battle-rope-squat": "Unusual page-2 note. Only low-reputation clips of battle-rope squat waves were found, so it keeps the search link.",
  "mobility-flow": "The PDF gives a time window, not a sequence, so no single video is right.",
  zone2: "Cardio pace guidance, not a movement to demo.",
  "tuesday-cardio": "Cardio choice (incline walk, bike or elliptical), not a single movement.",
  "wednesday-cardio": "Optional easy cardio, not a single movement.",
  "saturday-cardio": "Cardio choice, not a single movement.",
};

export function videoFor(exerciseId: string): VideoEntry | undefined {
  return VIDEOS[exerciseId];
}

const ID_RE = /^[A-Za-z0-9_-]{11}$/;
export const isVideoId = (id: string): boolean => ID_RE.test(id);

/** Plain YouTube page, used for the "Open on YouTube" link. */
export const watchUrl = (id: string): string => `https://www.youtube.com/watch?v=${id}`;
/** Privacy-enhanced embed. Only mounted after the user taps play. */
export const embedUrl = (id: string): string => `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
/** Thumbnail shown before play (no iframe, no YouTube scripts until tapped). */
export const thumbUrl = (id: string): string => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
