import { exerciseById, exercises } from "./exercises";

/**
 * Form guide per exercise. GENERAL EDUCATION, written for this app. It is not from the PDF and not medical advice.
 * The PDF's own cue is shown separately as "Your plan cue".
 * Fields: s = ordered setup + execution steps, base = stance / body position, brace = how to anchor and brace,
 * grip = hands, rom = range of motion, tempo, feel = what you should feel, err = common mistakes, back = back-friendly note.
 */
export type FormGuide = {
  s: string[];
  base: string;
  brace: string;
  grip: string;
  rom: string;
  tempo: string;
  feel: string;
  err: string[];
  back: string;
  /** Plain-English note where the PDF entry is unclear and how this guide resolved it. */
  clarify?: string;
};

export const NO_GRIP = "Nothing to hold. Hands rest where described.";
const BRACE = "Breathe in, then exhale gently as you tighten your abs like you are bracing for a light poke. Keep ribs down and the low back still.";
export const SEC = "Smooth and unhurried. No bouncing.";

const G: Record<string, FormGuide> = {};
const add = (id: string, g: FormGuide) => {
  G[id] = g;
};

/* ------------------------------------------------------------- PT / floor core */
add("ppt", {
  s: ["Lie on your back with knees bent and feet flat, hip-width apart. Arms rest by your sides, palms down.", "Let your low back sit in its natural small curve. Slide one hand under it to feel the gap.", "Exhale fully and tilt your pelvis so the belt line rolls toward your ribs. The gap under your low back closes and your tailbone lifts a hair.", "Hold 2–3 seconds at the end of the exhale, breathing small. Then relax back to neutral.", "Repeat. The movement is small: a few centimetres of pelvis, not a bridge."],
  base: "Back flat on the floor, knees bent, feet flat. Head resting; chin level.",
  brace: "The exhale does the work. Squeeze the glutes only lightly; if your hips lift off the floor you are doing a bridge.",
  grip: NO_GRIP,
  rom: "Neutral low-back curve to flat. Only the pelvis rotates; your ribs and shoulders stay down.",
  tempo: "Exhale 4 sec into the tilt, hold 2 sec, inhale 3 sec to release.",
  feel: "Lower abs engaging and the low back softly pressing toward the floor. No pinching in the back, no neck tension.",
  err: ["Pushing the feet into the floor so hips lift", "Holding the breath", "Clenching glutes hard and over-tucking", "Making it a big rock rather than a small tilt"],
  back: "Done lying down with the spine fully supported. If it bothers your back, shrink the range.",
});
add("pt-shoulder-flexion", {
  s: ["Lie on your back, knees bent, feet flat. Hold a light dowel, band or just your hands together over your chest.", "Do a posterior pelvic tilt first (exhale, belt line toward ribs) so the low back is flat.", "Keeping that flat back, slowly raise your straight arms up and back toward the floor behind your head.", "Stop at the point where your ribs would flare or your low back would lift off the floor. Pause 1 second.", "Bring the arms back to your chest, keeping the tilt, then release."],
  base: "Back flat on the floor. Knees bent as in the plain pelvic tilt.",
  brace: "Exhale as the arms go overhead. Imagine the lower ribs sinking toward your hips.",
  grip: "Loose hold on a light dowel/band, shoulder width. Or hands clasped. Never grip hard.",
  rom: "As far overhead as you can without the low back arching or ribs flaring. For many people that is not all the way to the floor.",
  tempo: "3 sec up, 1 sec pause, 3 sec back, exhaling on the way up.",
  feel: "Lower abs holding the back flat while the lats and shoulders lengthen. No pull in the neck.",
  err: ["Letting the back arch as the arms rise", "Ribs popping up", "Bending the elbows to cheat range", "Rushing the descent"],
  back: "Supported on the floor; the whole point is to stop the low back from arching overhead.",
  clarify: "Your page 2 note says “Bend the kneees”: that is the setup. Knees stay bent and feet flat the whole time.",
});
add("bracing-marches", {
  s: ["Lie on your back, knees bent, feet flat. Do a gentle pelvic tilt so the low back is lightly flat.", "Exhale and brace your abs. Hold that brace.", "Without letting the low back arch or the pelvis tip, lift one foot a few centimetres so the knee comes toward tabletop (hip and knee about 90°).", "Set it down softly and repeat with the other foot. That is one rep per side.", "Keep breathing normally while braced."],
  base: "On your back, knees bent, feet flat, arms at your sides.",
  brace: "Brace before every single lift. If you feel your back arch or hips rock, lift the foot less.",
  grip: NO_GRIP,
  rom: "Foot just clear of the floor up to knee over hip. Small and controlled beats high and wobbly.",
  tempo: "2 sec to lift, 1 sec hold, 2 sec to lower. Alternate sides.",
  feel: "Deep abs working to keep the pelvis still. Possibly a little hip-flexor work. Back stays quiet.",
  err: ["Low back arching as the leg lifts", "Rocking side to side", "Holding breath", "Swinging the leg up fast"],
  back: "Supported on the floor. If your back arches, go back to a smaller lift.",
  clarify: "Your page 2 note describes it as a gentle warm-up for legs and hips. Keep it slow and small.",
});
add("dead-bug", {
  s: ["Lie on your back. Raise both arms straight up over your shoulders and bring knees to tabletop (hips and knees at 90°, shins parallel to floor).", "Exhale fully and press your low back gently into the floor. Keep it there.", "Slowly lower the opposite arm and leg (e.g. right arm and left leg) toward the floor, only as far as the back stays flat.", "Come back to the start while inhaling, keeping the low back down.", "Alternate sides. One rep on each side counts as one."],
  base: "On your back, arms to the ceiling, knees at tabletop.",
  brace: "A full exhale first. The brace stays on for the whole rep; if the back arches, the reach is too far.",
  grip: NO_GRIP,
  rom: "Reach out until just before the low back lifts. Often arm and leg hover a hand’s width above the floor.",
  tempo: "3 sec out, 1 sec pause, 3 sec back.",
  feel: "Deep abs and the front of the torso. Low back stays pressed down.",
  err: ["Low back arching off the floor", "Moving fast", "Letting ribs flare", "Reaching further than the back allows"],
  back: "A classic spine-friendly core move because the back is supported. Make the range smaller if it lifts.",
});
add("bird-dog", {
  s: ["Start on hands and knees. Wrists under shoulders, knees under hips. Spine long and flat; eyes on the floor a little ahead.", "Brace lightly: exhale and tighten your abs as if bracing for a nudge.", "Slowly slide one leg straight back along the floor, then lift it until it is in line with your back (not higher).", "Optionally reach the opposite arm forward, in line with your ear. Hold 1–2 seconds with hips and shoulders level.", "Return with control, and switch sides."],
  base: "Hands under shoulders, knees under hips, hip-width apart. Neutral spine.",
  brace: "Imagine a glass of water on your low back. Reach long rather than high. Hips stay square.",
  grip: "Palms flat, fingers spread, pressing the floor away so the shoulder blades stay wide.",
  rom: "Arm and leg reach until they are level with the torso. Higher than that arches the low back.",
  tempo: "3 sec to reach, 2 sec hold, 3 sec back.",
  feel: "Opposite glute and back muscles holding you level, abs bracing. Not pinching in the low back.",
  err: ["Kicking the leg high and arching the back", "Twisting the hips open", "Shifting weight onto one hand", "Rushing"],
  back: "Widely used for low-back stability. Keep the leg at torso height and the hips level.",
  clarify: "Your page 2 note says “Kick straight back”: that means the leg goes straight back, not out to the side.",
});
add("bird-dog-hold", {
  s: ["Same setup as the bird dog: hands under shoulders, knees under hips.", "Brace and reach one arm and the opposite leg until they are level with your torso.", "Hold the reach for the full time while breathing evenly.", "Lower with control, switch sides."],
  base: "Hands and knees, neutral spine.",
  brace: BRACE,
  grip: "Palms flat, floor pressed away.",
  rom: "Torso-height reach. No higher.",
  tempo: "Hold 5–10 sec per rep, slow in and out.",
  feel: "Opposite glute and trunk working to stay level.",
  err: ["Arching the back", "Dropping one hip", "Holding the breath"],
  back: "Neutral spine stays the rule.",
});
add("clamshell", {
  s: ["Lie on your side with a small band just above the knees. Head on your arm. Hips stacked one above the other and knees bent about 45°, feet together.", "Brace gently so the pelvis does not roll backward. Place a hand on your top hip to feel it.", "Keeping your feet touching, lift the top knee up like a clamshell opening. The pelvis stays still.", "Pause 1 second at the top, then lower slowly. Do all reps then switch sides."],
  base: "Side-lying, hips stacked, knees bent about 45°, feet together.",
  brace: "Light core brace; the top hip must not roll back.",
  grip: NO_GRIP,
  rom: "Open the knee only as far as the pelvis stays still. Often a hand’s width or two.",
  tempo: "2 sec up, 1 sec pause, 3 sec down. Go slow at first (your page 2 note).",
  feel: "The outer-side of your top hip (side glute). Not the front of the thigh, not the low back.",
  err: ["Rolling the pelvis backward so it becomes a hip lift", "Feet coming apart", "Using momentum", "Pushing past the pelvic control point"],
  back: "Low load and lying position. Keep the back long and the pelvis still.",
});
add("side-lying-abduction", {
  s: ["Lie on your side with the bottom knee bent for balance and the top leg straight in line with your torso.", "Brace lightly. Point the top toes forward, or slightly down, so the heel leads.", "Lift the top leg up and slightly back, only to about hip height, without the hips rolling.", "Pause 1 second, lower slowly."],
  base: "Side-lying, hips stacked, top leg straight in line with the body.",
  brace: "Light brace, ribs down, hips stacked.",
  grip: NO_GRIP,
  rom: "Up to about 30–45° or hip height. Higher uses the low back.",
  tempo: "2 sec up, 1 sec hold, 3 sec down.",
  feel: "Outer hip (glute med) working. Not the front of the thigh or the back.",
  err: ["Rolling the top hip back", "Lifting too high", "Toes pointing up (shifts work to hip flexors)", "Swinging"],
  back: "Lying and supported; avoid arching.",
});
add("band-walks", {
  s: ["Place a loop band just above the knees (or around the ankles for more challenge). Feet hip-width, toes forward.", "Sit into a quarter-squat: hips back, knees soft, chest tall, hands on hips or in front.", "Step one foot out to the side about shoulder width, keeping the toes forward and the band tight.", "Bring the other foot in, but only to hip width: never let the feet touch or the band go slack.", "Take your steps one way, then come back the other way. One lap = out and back."],
  base: "Quarter-squat, feet hip-width, toes forward, knees tracking over the toes.",
  brace: "Light brace. Keep the torso upright; no leaning or swaying hips side to side.",
  grip: "Hands on hips or clasped at the chest.",
  rom: "Steps about shoulder width. Stay low the entire time.",
  tempo: "Smooth, 1 step per second. Constant band tension.",
  feel: "Outer hips and glutes burning, plus thigh effort (your page 2 note: “uses so much leg, in a good way”).",
  err: ["Standing too tall", "Letting the knees cave in", "Feet touching between steps", "Rocking the torso"],
  back: "Standing and upright. Keep the ribs over the pelvis, no leaning.",
  clarify: "Your page 2 dose is “3 laps”. A lap here is one set of 12 steps out and 12 back. The weekly schedule (page 1) is what the app uses.",
});
add("single-leg-stand", {
  s: ["Stand tall next to a wall or chair for light support if needed. Feet hip-width.", "Find your foot tripod: big toe, little toe and heel all pressing into the floor.", "Brace gently, level your pelvis (belt buckle facing forward), and lift one foot a few centimetres, then to knee-up if comfortable.", "Hold the time, keeping ribs down and the hips level. Don’t hike the lifted hip.", "Switch sides."],
  base: "One foot on the floor with a tripod foot, other knee bent and lifted; tall posture.",
  brace: "Gentle abdominal brace. Imagine lengthening up through the crown.",
  grip: "Fingertips on a wall or chair only if you need it. Aim to let go.",
  rom: "Lift the foot just off the floor or up to a knee-high position. Keep the pelvis level.",
  tempo: "Hold 20 sec per side (page 1). Quiet breathing.",
  feel: "Outer hip of the standing leg and deep abs working to keep you level; the foot and ankle making small corrections.",
  err: ["Hiking one hip", "Leaning the torso to the side", "Locking the standing knee", "Holding the breath"],
  back: "Upright, low load. Keep ribs stacked over the pelvis.",
  clarify: "Page 2 shows “2 sets × 10 reps” for this move; the weekly schedule uses a 20-second hold per side, and that is what you are doing here. Treat each hold like a rep.",
});
add("seated-pigeon", {
  s: ["Sit tall on the edge of a chair or bench with both feet flat.", "Cross your right ankle over your left knee, with the right knee open to the side. Flex the right foot to protect the knee.", "Sit tall with a long spine. Use your hands lightly on the shin or the chair; keep it easy.", "Hinge forward from the hips with a flat back until you feel a stretch in the right outer hip. Stop there. Don’t force the knee down.", "Hold and breathe slowly. Switch sides."],
  base: "Seated, one ankle over the opposite knee, spine long.",
  brace: "No bracing needed. Lead with the chest, not the head.",
  grip: "Hands rest on the shin or the chair. No pushing on the knee.",
  rom: "Only until a comfortable stretch in the outer hip or glute. Never a sharp or pinching feeling in the knee.",
  tempo: "Hold 30–45 sec per side, with slow breaths.",
  feel: "Stretch deep in the outer hip and glute. Not in the knee.",
  err: ["Rounding the back to go deeper", "Pushing the knee down hard", "Forcing the hip", "Holding the breath"],
  back: "A seated option instead of the floor pigeon, easier on the back. Keep the spine long as you hinge.",
  clarify: "Page 2 says “Use body weight”: let your own leg’s weight provide the stretch; don’t press on it.",
});
add("suitcase-carry", {
  s: ["Stand with a kettlebell or dumbbell beside one foot. Feet hip-width.", "Hinge your hips back and bend your knees to pick it up with a firm grip. Stand up tall, shoulders level.", "Hold it at your side with the arm straight. Brace your abs and stand like the weight isn’t there: no lean.", "Walk with short, steady steps for the distance. Keep ribs stacked over the pelvis.", "Set it down by hinging at the hips. Switch hands and repeat."],
  base: "Tall, feet hip-width, weight in one hand at your side, shoulders level.",
  brace: "Brace like you are about to be nudged from the side. Resist the lean toward the weight.",
  grip: "Firm grip on the handle. Don’t let it knock your leg.",
  rom: "Walk 20–30 m per side at an easy pace.",
  tempo: "Steady walking pace, no rushing.",
  feel: "The side of your trunk opposite the weight (obliques) working hard, plus grip and forearm. Shoulders stay level.",
  err: ["Leaning toward the weight", "Hiking the shoulder", "Walking too fast and swinging the weight", "Using too heavy a load"],
  back: "Good for core stability. Pick up and put down by hinging at the hips, and keep the load moderate.",
  clarify: "Page 2 calls this “Suitcase Carry (Kettlebell)”, dose “3 laps”: one lap is one trip per hand. The schedule (3 × 20–30 m per side) is what the app uses. “I like to do this to activate abs” is your own note.",
});
add("farmer-carry", {
  s: ["Stand between two dumbbells or kettlebells. Feet hip-width.", "Hinge back with a flat back, grip both handles, and stand up tall.", "Pull your shoulders down and back; ribs over the pelvis.", "Walk with steady steps for the distance, keeping the weights from swinging.", "Set down by hinging at the hips."],
  base: "Tall stance, weight in both hands at your sides.",
  brace: BRACE,
  grip: "Firm, full grip. A strap is fine on heavy sets but plain grip trains your forearms.",
  rom: "20–30 m at a steady walk.",
  tempo: "Steady, short, quick steps.",
  feel: "Forearms and grip, upper traps and core all working to hold you tall.",
  err: ["Shrugging up to the ears", "Leaning back", "Short, shuffling steps with a swinging load", "Rushing the pick-up"],
  back: "Hinge to pick up and put down. Keep the weight where you can keep a tall back.",
});
add("plank", {
  s: ["Place your forearms on the floor with elbows under your shoulders. Legs straight behind you, toes on the floor.", "Make a straight line from head to heels. Squeeze your glutes and thighs.", "Pull your ribs toward your hips (“buttt down” in your own words: hips don’t pike up) and tuck the tailbone slightly.", "Breathe evenly. Hold the time, then lower the knees."],
  base: "Forearms down, elbows under shoulders, body straight from head to heels, neck neutral.",
  brace: "Glutes tight, abs braced, ribs down. Press the floor away to keep the shoulder blades wide.",
  grip: "Forearms flat, hands relaxed or in light fists.",
  rom: "Static hold. Quality over time: end the set when your hips sag or pike.",
  tempo: "Hold 20–40 sec, breathing steadily.",
  feel: "Abs and glutes working, shoulders stable. Not low back strain.",
  err: ["Hips sagging", "Hips piking up", "Holding the breath", "Looking forward and straining the neck"],
  back: "Squeeze the glutes and tuck slightly. End the hold as soon as the low back sags or aches. Do it from the knees if needed.",
  clarify: "Page 2 note “Buttt down” means keep the hips down in line with the body, not piked up.",
});
add("side-plank", {
  s: ["Lie on your side with your forearm under your shoulder, elbow directly beneath it. Legs straight, feet stacked (or one foot in front of the other).", "Brace and lift your hips so your body is a straight line from head to feet.", "Keep the top hip stacked over the bottom one. Hold, breathing evenly.", "Lower with control and switch sides. Bend the knees for an easier version."],
  base: "Side-lying on one forearm, elbow under shoulder, body in one line.",
  brace: "Brace the abs, squeeze the glutes and press the forearm into the floor.",
  grip: "Forearm flat. Free hand on the hip or reaching up.",
  rom: "Static hold. Hips up and level.",
  tempo: "Hold 15–30 sec per side.",
  feel: "Side of the trunk (obliques) and outer hip of the bottom side.",
  err: ["Hips sagging", "Rolling forward or back", "Shoulder shrugged into the ear", "Holding the breath"],
  back: "A well-known back-friendly option. Use bent knees to make it easier.",
});
add("pallof", {
  s: ["Set a cable at chest height. Stand sideways to the stack, feet hip-width, soft knees.", "Hold the handle at your chest with both hands. Step away until there is tension on the line.", "Brace and press the handle straight out in front of your chest. The cable tries to twist you: don’t let it.", "Hold the press for the time, breathing steadily, then bring the hands back in. Do all reps/time and switch sides."],
  base: "Athletic stance, side-on to the cable, feet hip-width, knees soft, tall chest.",
  brace: "Brace and square the hips and shoulders to the front. Think of your torso as a wall.",
  grip: "Both hands cupped around the handle at the sternum, then pressed out.",
  rom: "Press out until arms are straight, then back to the chest.",
  tempo: "Press for 2 sec, hold 20 sec (page 1) or hold smoothly, return 2 sec.",
  feel: "Obliques and deep abs resisting the pull. Not in the low back.",
  err: ["Letting the torso rotate toward the anchor", "Leaning away from the cable", "Locking the knees", "Using a load that makes the form shake"],
  back: "A strong back-friendly core choice: the spine stays still. Keep the load modest.",
});
add("band-pallof", {
  s: ["Anchor a band at chest height (rack post or door anchor). Stand sideways to the anchor, feet hip-width, soft knees.", "Hold the band at your chest with both hands. Step away until the band is taut.", "Brace and press your hands straight out in front of your chest. The band tries to twist you toward the anchor: don’t let it.", "Hold the press for the time, breathing steadily, then bring the hands back in. Switch sides."],
  base: "Athletic stance, side-on to the anchor, feet hip-width, knees soft, tall chest.",
  brace: "Square hips and shoulders to the front. Think of your torso as a wall.",
  grip: "Both hands wrapped around the band at the sternum, then pressed out.",
  rom: "Press out until arms are straight, then back to the chest.",
  tempo: "Press for 2 sec, hold 20 sec, return 2 sec.",
  feel: "Obliques and deep abs resisting the pull. Not in the low back.",
  err: ["Rotating toward the anchor", "Leaning away from the band", "Standing so close the band goes slack", "Locking the knees"],
  back: "Back-friendly: the spine stays still. Step closer to the anchor to make it easier.",
  clarify: "Your plan says cable or band. This is the band version; the cable version is “Cable Pallof Press Hold”.",
});
add("mobility-flow", {
  s: ["Move through a short, gentle sequence on a mat: cat–cow in a small range, hip circles on hands and knees, a half-kneeling hip flexor stretch, and a supine knee-to-chest.", "Spend 30–45 seconds on each, breathing slowly.", "Add a hamstring stretch lying on your back with a strap or towel, and a figure-4 glute stretch.", "Keep each position easy. Stop at mild stretch."],
  base: "Floor or mat, comfortable clothes. Positions vary.",
  brace: "None. Relaxed breathing.",
  grip: NO_GRIP,
  rom: "Only to a mild, comfortable stretch. Never forced.",
  tempo: "Slow. 5–8 minutes total, about 30–45 sec per position.",
  feel: "Gentle lengthening in hips, hamstrings and glutes. Should feel better after.",
  err: ["Forcing the range", "Bouncing in a stretch", "Holding the breath", "Aggressive spine twisting or flexing"],
  back: "Keep it gentle; skip any position that irritates your back. No aggressive spinal stretching (as your plan says).",
  clarify: "The plan lists the flow but not the specific moves; the sequence above is a suggestion, not from the PDF.",
});
add("zone2", {
  s: ["Pick a machine or route you like: brisk walk, bike, elliptical or easy jog.", "Warm up 3–5 minutes at a very easy pace.", "Raise the effort to a pace where you can hold a full conversation.", "Stay there for the whole time. Heart rate often lands around 60–70% of max (about 180 minus age is a rough guide).", "Finish with 2–3 minutes easy."],
  base: "Tall posture; relaxed shoulders. If on a treadmill, don’t hold the rails.",
  brace: "None.",
  grip: "Light touch on the handles if needed, or none.",
  rom: "Natural stride or pedal stroke.",
  tempo: "Steady pace for 25–35 min. You should be able to talk in full sentences.",
  feel: "Warm and slightly breathy, but not exhausted. You should feel fine afterwards, as your plan says.",
  err: ["Going too hard", "Gripping the rails", "Skipping the warm-up", "Chasing numbers instead of effort"],
  back: "Low impact choices (bike, elliptical, incline walk) are gentle on the back.",
});
add("tuesday-cardio", {
  s: ["Choose incline walk, bike or elliptical.", "Warm up 2–3 minutes easy.", "Build to a moderate effort: breathing is faster, but you can still say short sentences.", "Hold that for 15–20 minutes. Finish with 2 minutes easy."],
  base: "Tall, relaxed upper body.",
  brace: "None.",
  grip: "Light on the handles.",
  rom: "Natural.",
  tempo: "Steady. “Moderate, not death” (your plan cue).",
  feel: "Moderately warm and breathing a bit harder, with legs a little tired. Never wrecked, since this is leg day.",
  err: ["Going all out and cooking your legs", "Leaning on the handles", "Skipping the cooldown"],
  back: "Choose the bike or elliptical if incline walking bothers your back.",
});
add("wednesday-cardio", {
  s: ["Only if recovery feels good, pick an easy walk, bike or elliptical.", "Keep a relaxed pace for 10–15 minutes.", "Stop earlier if you feel flat."],
  base: "Tall and relaxed.",
  brace: "None.",
  grip: "Light on the handles.",
  rom: "Natural.",
  tempo: "Easy. You can talk without effort.",
  feel: "Loose and warm. Not tired.",
  err: ["Turning optional cardio into a hard session", "Doing it on a day you are depleted"],
  back: "Low-impact options are best.",
});
add("saturday-cardio", {
  s: ["Choose bike, incline walk or elliptical.", "Warm up 2–3 minutes.", "Hold an easy-moderate effort for 15–20 minutes: you can talk in short sentences.", "Cool down 2 minutes."],
  base: "Tall and relaxed.",
  brace: "None.",
  grip: "Light touch.",
  rom: "Natural.",
  tempo: "Easy-moderate. “Don’t fry recovery” (your plan cue).",
  feel: "Warm, breathing a little harder. Stay fresh for the next day.",
  err: ["Pushing too hard after arms and shoulders day", "Skipping the cooldown"],
  back: "Bike or elliptical are gentle on the back.",
});
add("battle-rope-squat", {
  s: ["Anchor the rope in the middle around a sturdy post. Hold one end in each hand.", "Stand with feet shoulder-width, toes slightly out. Hold the rope ends in front of your hips.", "Sit your hips back and down into a squat with a tall chest, then make alternating waves with the arms.", "Keep waving as you stand up. Keep your knees tracking over the toes."],
  base: "Squat stance, feet shoulder-width, weight mid-foot, chest tall.",
  brace: "Brace the abs before the descent. Keep the waves coming from the shoulders, not by rounding the back.",
  grip: "Firm grip on both rope ends.",
  rom: "Squat to parallel or whatever depth you can control with a flat back.",
  tempo: "Waves at a steady pace, squat 2 sec down, 1 sec up.",
  feel: "Quads and glutes plus a conditioning burn in shoulders and trunk.",
  err: ["Rounding the back to wave harder", "Knees caving", "Heels lifting", "Going so fast the squat gets sloppy"],
  back: "Moderate: keep the waves small and the chest tall; skip it on tender days.",
  clarify: "Your page 2 picture labelled “Battle Rope Squats” actually shows a person squatting while holding suspension-trainer-style handles anchored overhead. The notes (“Meta!”, “Oscilate Anchor when needed”, “S Tier”) are yours. This guide covers the rope version, and you can also do it with a suspension trainer: hold the handles in front for balance and “oscillate” (change the anchor height) as needed. It has no dose and isn’t on the weekly schedule.",
});

/* ------------------------------------------------------------- Pulling / back */
add("assisted-pullup", {
  s: ["Set the assistance (the more weight on the pad, the easier it is). Kneel or stand on the pad.", "Grab the bar slightly wider than your shoulders, palms facing away. Hang with arms long and shoulders pulled down away from the ears.", "Start the pull by pulling your shoulder blades down, then drive your elbows down toward your ribs.", "Pull until your chin clears the bar or your upper chest nears it. Keep your chest up and ribs down.", "Lower slowly until the arms are almost straight but the shoulders stay engaged."],
  base: "Hanging from the bar, legs on the pad or crossed behind, body in a slight hollow, ribs down.",
  brace: "Squeeze glutes lightly and keep ribs down so you don’t arch the back as you pull.",
  grip: "Overhand grip a little wider than shoulders. Thumbs wrap the bar. Think “hands as hooks”.",
  rom: "Long hang at the bottom (shoulders gently engaged), chin above the bar at the top.",
  tempo: "1–2 sec up, 1 sec pause, 3 sec down.",
  feel: "The big muscles on the sides of your back (lats) and mid-back, with biceps helping. Not the neck or the front of the shoulders.",
  err: ["Pulling with just the arms and biceps", "Swinging or kipping", "Shrugging the shoulders to the ears", "Half-range reps", "Arching the low back and flaring ribs"],
  back: "Hanging can feel good for many backs. If it doesn’t, use a lat pulldown instead. Keep ribs down.",
});
add("neutral-pullup", {
  s: ["Use parallel handles (palms facing each other) and the assistance you need.", "Hang with arms long, shoulders pulled down.", "Drive your elbows down and in toward your ribs until your chin passes the handles.", "Lower slowly to a long hang."],
  base: "Hang from parallel handles, body in a slight hollow.",
  brace: "Ribs down, glutes lightly squeezed.",
  grip: "Palms facing each other (neutral). Thumbs wrapped.",
  rom: "Full hang to chin over the handles.",
  tempo: "1–2 sec up, 1 sec pause, 3 sec down.",
  feel: "Lats and mid-back, with a good bicep contribution. Shoulders often feel more comfortable than with a wide grip.",
  err: ["Shrugging", "Swinging", "Half range", "Pulling with arms only"],
  back: "Neutral grip is often kinder to the shoulders; keep ribs down so the low back doesn’t arch.",
});
add("dead-hang", {
  s: ["Grab a bar with an overhand grip, about shoulder width, and step off a box or stand to take your weight.", "Hang with arms straight. Pull your shoulders gently down away from your ears, so you aren’t just dangling.", "Keep ribs down and legs slightly in front.", "Hold for the time, breathing slowly. Step down to finish."],
  base: "Hanging from a bar with active shoulders.",
  brace: "Light abs and glutes, ribs down.",
  grip: "Full overhand grip. Use straps only if your grip ends the set before the target.",
  rom: "Static hold.",
  tempo: "Hold 20–45 sec.",
  feel: "Forearms and grip, stretch along the lats and sides.",
  err: ["Dangling passively with shoulders by the ears", "Swinging", "Holding the breath"],
  back: "Many people find a hang decompressing, but stop if it pinches the shoulders or back.",
});
add("chest-supported-row", {
  s: ["Set the pad so it supports your chest just below the collarbone. Sit or lie with feet planted.", "Take the handles or dumbbells with arms long, letting your shoulder blades stretch forward.", "Start by drawing the shoulder blades back, then pull your elbows back past your torso at about 45° from your body.", "Squeeze at the end, chest staying on the pad.", "Lower with control until the arms are long again."],
  base: "Chest firmly on the pad, feet planted, neck neutral (look down at the pad edge).",
  brace: "Light abs brace; your chest stays on the pad: the pad does the stabilizing.",
  grip: "Handle or dumbbell, neutral or overhand. Wrists straight.",
  rom: "Arms long with the blades protracted, to elbows just past the torso.",
  tempo: "1–2 sec pull, 1 sec squeeze, 3 sec lower.",
  feel: "Mid-back, lats and rear shoulders. Not low back; not biceps only.",
  err: ["Lifting the chest off the pad", "Shrugging", "Using momentum", "Cutting the stretch short"],
  back: "A spine-supported row, which is why it’s used instead of bent-over rows.",
});
add("tbar-chest-supported", {
  s: ["Lie chest-down on the pad. Feet braced. Take the handle with both hands, arms long.", "Pull your shoulder blades back, then drive the elbows toward your hips.", "Squeeze, then lower slowly until the arms are long."],
  base: "Chest on the pad, feet planted, neck neutral.",
  brace: "Chest stays on the pad. Light abs.",
  grip: "Wide or close handle, wrists straight.",
  rom: "Full stretch to elbows past torso.",
  tempo: "1–2 sec up, 1 sec squeeze, 3 sec down.",
  feel: "Mid-back and lats.",
  err: ["Chest lifting", "Shrugging", "Jerking"],
  back: "Supported chest means no loading of the low back.",
});
add("half-kneeling-pulldown", {
  s: ["Set a cable high with a single handle. Kneel on the leg farthest from the cable, the other foot in front (half-kneeling). Tall spine, ribs down, glutes squeezed on the kneeling side.", "Reach up and slightly forward and take the handle with the near hand. Let the shoulder lengthen.", "Pull the shoulder down first, then drive the elbow down toward your hip pocket.", "Squeeze, then let the arm rise slowly under control.", "Finish the reps, then switch sides."],
  base: "Half-kneeling (pad under the down knee), tall torso, hips square.",
  brace: "Squeeze the glute on the kneeling side and keep the ribs down. Don’t twist the torso.",
  grip: "One hand on the handle, thumb wrapped, palm facing inward.",
  rom: "Full overhead reach to elbow at the side of the ribs.",
  tempo: "2 sec down, 1 sec squeeze, 3 sec up.",
  feel: "The lat on the working side. Not the biceps alone, not the neck.",
  err: ["Twisting the torso", "Leaning back to cheat", "Arching the low back", "Shrugging at the top"],
  back: "Kneeling with glute squeezed keeps the low back stable; keep ribs down and avoid leaning back.",
});
add("lat-pulldown", {
  s: ["Sit with thighs snug under the pad. Take the bar a little wider than your shoulders.", "Lean back only slightly, chest tall.", "Pull your shoulder blades down, then drive your elbows down toward your ribs. Bring the bar to your upper chest.", "Squeeze, then slowly let the bar rise until the arms are long and the lats are stretched."],
  base: "Seated, thighs locked under the pad, feet flat, slight lean back.",
  brace: "Ribs down, glutes lightly squeezed so the torso doesn’t rock.",
  grip: "Overhand slightly wider than the shoulders, or a neutral handle. Thumbs wrapped.",
  rom: "Arms long at the top to bar at upper chest.",
  tempo: "2 sec down, 1 sec squeeze, 3 sec up.",
  feel: "Lats and mid-back. Not the biceps or the neck.",
  err: ["Leaning way back and rowing it", "Pulling behind the neck", "Shrugging", "Using momentum"],
  back: "A good non-hanging option. Keep the lean small and the ribs down.",
});
add("seated-cable-row", {
  s: ["Sit with feet on the platform and knees slightly bent. Grab the handle with arms long and chest tall.", "Brace and sit tall; let the shoulder blades stretch forward a little.", "Pull your shoulder blades back, then your elbows past your body toward your hips.", "Squeeze, then return with control, keeping your torso still."],
  base: "Seated tall, feet planted, knees soft, chest up.",
  brace: "Abs braced, torso steady (a very small lean is okay).",
  grip: "Neutral grip handle, wrists straight.",
  rom: "Arms long to the handle touching the lower ribs.",
  tempo: "1–2 sec pull, 1 sec squeeze, 3 sec return.",
  feel: "Mid-back and lats, rear shoulders.",
  err: ["Rocking the torso back and forth", "Shrugging", "Rounding the lower back at the stretch", "Pulling with arms only"],
  back: "Keep a tall, neutral spine; reduce the stretch range if the lower back rounds.",
});
add("face-pull", {
  s: ["Set a rope on a cable at about face height. Take it with palms facing in, thumbs toward you. Step back until there is tension.", "Stand tall with ribs down and a small bend in the knees.", "Pull the rope toward your upper face, splitting the rope so your hands finish beside your ears.", "As you pull, rotate your forearms back so the knuckles point up (external rotation). Elbows stay high.", "Squeeze for a second and return slowly."],
  base: "Standing tall, feet hip-width, knees soft; or half-kneeling.",
  brace: "Ribs down, glutes lightly squeezed. Don’t lean back.",
  grip: "Overhand/neutral on the rope ends, thumbs toward you.",
  rom: "Arms long to hands by the ears, elbows high.",
  tempo: "2 sec pull, 1–2 sec hold, 3 sec return.",
  feel: "Rear shoulders and mid-back, plus the small rotator cuff muscles. Not the upper traps.",
  err: ["Shrugging", "Using too much weight and leaning back", "Elbows dropping low", "Pulling to the chest"],
  back: "Keep the ribs down and avoid leaning back; use light weights.",
});
add("incline-shrug", {
  s: ["Set an incline bench at about 30–45°. Lie chest-down against it, feet on the floor, a dumbbell in each hand with arms hanging straight.", "Relax your shoulders down (stretch).", "Shrug straight up and slightly back, as if bringing your shoulder blades toward your spine.", "Hold the top for a second, then lower slowly.", "Keep the neck long and don’t roll the shoulders."],
  base: "Chest-down on the incline bench, head neutral, arms hanging.",
  brace: "The bench supports you. Keep your head still.",
  grip: "Neutral dumbbell grip, strong wrists.",
  rom: "Full stretch to full shrug. Not a circle: straight up and back.",
  tempo: "2 sec up, 1–2 sec pause, 3 sec down.",
  feel: "Upper traps and between the shoulder blades.",
  err: ["Rolling the shoulders", "Bending the elbows to lift", "Jerking the weight", "Too heavy so range is tiny"],
  back: "Supported chest means no load on the low back.",
});
add("cable-shrug", {
  s: ["Set a straight bar or two handles on a low cable. Stand tall holding it at your thighs.", "Shrug the shoulders straight up toward your ears.", "Hold 1 second, then lower slowly."],
  base: "Standing tall, feet hip-width, arms straight.",
  brace: "Ribs down, glutes lightly squeezed.",
  grip: "Overhand or neutral, arms straight.",
  rom: "Full shrug up, full relaxation down.",
  tempo: "2 up, 1–2 pause, 3 down.",
  feel: "Upper traps.",
  err: ["Rolling shoulders", "Bending elbows", "Leaning back"],
  back: "Standing and upright. Keep the load moderate.",
});
add("straight-arm-pulldown", {
  s: ["Set a rope on a high cable. Stand a step back, hinge slightly at the hips, ribs down.", "Hold the rope with arms straight (a very slight soft bend in the elbows).", "Keeping arms long, sweep the rope down toward your thighs by pulling your shoulders down and back, not by bending your elbows.", "Squeeze your lats at the bottom, then let the arms rise under control until you feel a stretch."],
  base: "Standing, feet staggered or hip-width, slight hip hinge, knees soft, chest tall.",
  brace: "Ribs down, abs braced; the torso doesn’t rock.",
  grip: "Rope ends held with palms down/neutral, thumbs wrapped.",
  rom: "From overhead reach to hands at the thighs.",
  tempo: "2 sec down, 1 sec squeeze, 3 sec up.",
  feel: "Lats and under the arm. Not triceps.",
  err: ["Bending the elbows into a pressdown", "Rocking the torso", "Using too much weight", "Arching the low back"],
  back: "Keep ribs down; use a lighter weight if the lower back arches.",
});
add("cable-crunch", {
  s: ["Set a rope on a high cable and kneel facing it. Hold the rope beside your head or at your forehead.", "Sit your hips back slightly onto your heels. Keep your hips still for the entire set.", "Exhale hard and round your upper back: bring your ribs toward your pelvis, bringing your elbows toward your knees.", "Squeeze your abs for a second, then slowly return to the tall start."],
  base: "Kneeling, hips fixed over the knees, rope held at the head.",
  brace: "Hips stay still; only the spine curls. Think “ribs to pelvis”.",
  grip: "Hold the rope at the sides of the head; don’t pull with the arms.",
  rom: "From a tall spine to a fully rounded spine. Not a hip hinge.",
  tempo: "Exhale 2 sec down, 1 sec hold, 3 sec back up.",
  feel: "Abs. Not the hip flexors or the arms.",
  err: ["Sitting back with the hips instead of curling", "Pulling with the arms", "Using too much weight", "Rushing the way up"],
  back: "Controlled curling can be gentler than loaded hinging; reduce range or weight if the back complains.",
});
add("cable-woodchop", {
  s: ["Set a cable at the high position. Stand sideways, feet wider than hip-width, knees soft.", "Hold the handle with both hands, arms straight above your outside shoulder.", "Rotate your torso and hips together, pull the handle diagonally down across your body to the opposite hip.", "Pause, and return slowly under control. Do all reps and switch sides."],
  base: "Wide athletic stance, side-on to the cable.",
  brace: "Brace the abs; the movement comes from the hips and trunk, not just the arms.",
  grip: "Both hands on the handle, arms mostly straight.",
  rom: "High diagonal to low opposite hip.",
  tempo: "2 sec chop, 1 sec pause, 3 sec return.",
  feel: "Obliques and abs, hips and glutes helping.",
  err: ["Pulling with the arms alone", "Twisting with locked hips", "Using too much weight", "Rounding the back"],
  back: "Rotation under load is more demanding; use a light weight and move the hips with the torso.",
});
add("reverse-crunch", {
  s: ["Lie on your back with your hips and knees bent to 90° and shins parallel to the floor. Hands by your sides or holding something behind your head.", "Exhale and do a pelvic tilt so the low back presses down.", "Curl your pelvis toward your ribs, lifting the hips a few centimetres off the floor. The knees go up slightly: don’t swing the legs.", "Hold 1 second, then lower slowly until the tailbone touches down."],
  base: "On your back, knees over hips, low back flat.",
  brace: "Tilt first, then lift. Control the way down.",
  grip: "Hands flat on the floor, or hold a bench or post above your head.",
  rom: "A small curl: hips only a few centimetres up. Not a swing over your head.",
  tempo: "Exhale and lift 2 sec, hold 1 sec, lower 3 sec.",
  feel: "Lower abs. Not the neck or the back.",
  err: ["Swinging the legs", "Using momentum", "Lifting the hips too high", "Letting the legs drop fast"],
  back: "Back is supported. Keep the curl small and controlled.",
});
add("hanging-knee-raise", {
  s: ["Support yourself on the captain’s chair with forearms on the pads and back on the pad. Legs hanging.", "Squeeze your glutes and tuck your pelvis.", "Exhale and bring your knees up until your thighs are above 90°, curling the pelvis up.", "Hold 1 second, then lower slowly without swinging."],
  base: "Forearms on pads, back flat on the support, legs hanging.",
  brace: "Pelvic tilt at the top: it’s a curl, not just a hip flexion.",
  grip: "Hands on the handles, relaxed.",
  rom: "Knees to at least hip height, curling pelvis toward ribs.",
  tempo: "2 sec up, 1 sec hold, 3 sec down.",
  feel: "Lower abs, hip flexors.",
  err: ["Swinging the legs", "Using momentum", "Only lifting with hip flexors, no curl", "Letting the pelvis tip forward at the bottom"],
  back: "Back is supported by the pad; stop if the low back arches.",
});

/* ------------------------------------------------------------- Legs */
add("hack-squat", {
  s: ["Set the shoulder pads and stand with your back flat against the pad. Feet shoulder-width, about mid-platform, toes turned out slightly.", "Unrack and straighten your legs without locking the knees.", "Take a breath, brace, and sit down and slightly forward, bending the knees so they track over your toes.", "Lower until thighs are around parallel or as deep as you can go with your hips staying on the pad.", "Drive through the whole foot to stand up."],
  base: "Back and hips on the pad, feet shoulder-width, toes out about 15°.",
  brace: "Big breath into the belly and brace before each rep; shoulders stay pressed into the pads.",
  grip: "Hold the handles lightly for stability.",
  rom: "Parallel or deeper, as long as your hips do not tuck under (butt wink) and your heels stay down.",
  tempo: "3 sec down, 1 sec pause, 1–2 sec up.",
  feel: "Quads, plus glutes at the bottom. Knees should feel solid.",
  err: ["Heels lifting", "Knees caving", "Hips tucking under at the bottom", "Bouncing out of the hole", "Locking the knees hard at the top"],
  back: "The pad supports your back, making it a friendly squat. Stop the depth before the hips tuck under.",
});
add("heel-elevated-goblet", {
  s: ["Place your heels on a low plate or wedge (2–4 cm). Hold a dumbbell vertically against your chest with both hands.", "Feet shoulder-width, toes out slightly. Stand tall, brace the abs.", "Sit down between your knees, keeping your chest up and elbows inside your knees.", "Go as deep as you can with a tall chest, then drive up through your whole foot."],
  base: "Heels raised on a small plate, feet shoulder-width, toes slightly out.",
  brace: "Breathe in, brace, keep the weight snug against your chest.",
  grip: "Cup the top end of the dumbbell with both hands against the sternum.",
  rom: "Thighs to parallel or deeper while keeping the chest tall.",
  tempo: "3 sec down, 1 sec pause, 1–2 sec up.",
  feel: "Quads working hard, the knees travelling forward over the toes.",
  err: ["Chest folding forward", "Knees caving in", "Heels coming off the plate", "Rushing"],
  back: "The weight in front keeps you upright. Keep the chest tall and stop where the back stays flat.",
});
add("sumo-goblet", {
  s: ["Stand with feet wide (about 1.5× shoulder width) with toes pointed out 30–45°. Hold a dumbbell vertically in front of the chest.", "Brace and sit straight down between your legs, with knees tracking over toes.", "Keep your torso tall and descend to parallel or lower.", "Drive through the feet and squeeze the inner thighs and glutes to stand."],
  base: "Wide stance, toes out, weight mid-foot.",
  brace: "Brace abs; the chest stays up.",
  grip: "Dumbbell held vertically against the chest, cupped.",
  rom: "Parallel or deeper if the back stays flat.",
  tempo: "3 sec down, 1 sec pause, 2 sec up.",
  feel: "Inner thighs, glutes and quads.",
  err: ["Knees collapsing inward", "Chest dropping", "Feet too narrow so knees pinch", "Heels rising"],
  back: "Upright torso keeps the spine neutral.",
});
add("bulgarian-split-squat", {
  s: ["Stand about 2 feet in front of a bench, facing away. Place the top of one foot (or the toes) on the bench behind you.", "Take a stride so the front foot is far enough forward that the front shin stays roughly vertical at the bottom.", "Hold dumbbells at your sides or none. Brace and lean the torso very slightly forward.", "Lower your back knee straight down toward the floor, keeping the front foot flat, pelvis square.", "Press through the whole front foot to rise. Finish the reps and switch legs."],
  base: "Staggered stance, back foot on the bench, front foot flat about 60–90 cm ahead.",
  brace: "Abs braced; hips square; slight forward lean from the hips.",
  grip: "Dumbbells at the sides, or hands on hips for balance.",
  rom: "Back knee a hand above the floor, front thigh about parallel.",
  tempo: "3 sec down, 1 sec pause, 1–2 sec up.",
  feel: "Front quad and glute. Back leg stretches at the hip flexor.",
  err: ["Front foot too close so the knee crashes forward and the heel lifts", "Torso collapsing", "Knee caving in", "Pushing off the back foot"],
  back: "Keep a slight forward lean and stable pelvis. Hold light weights on tender days.",
});
add("leg-press", {
  s: ["Sit in the 45° sled: back and hips flat on the reclined pad, which sits low behind you with the platform angled up in front. Place your feet mid-platform, shoulder-width, toes slightly out.", "Press the sled up off the stops and turn the safety handles out. Lower the sled toward you until your knees bend to about 90°, hips staying flat on the pad.", "Press through your whole foot until the legs are almost straight (soft knees). Turn the safeties back in before getting out."],
  base: "Back and hips flat on the reclined pad; feet mid-platform, shoulder-width.",
  brace: "Brace the abs; head back on the pad. Don’t let the hips lift or tuck.",
  grip: "Hold the side handles lightly.",
  rom: "Stop the descent when your hips are about to tuck up off the pad. Often about 90° at the knee; the sled angle makes the tuck come sooner than on a seated press.",
  tempo: "3 sec down, 1 sec pause, 2 sec up.",
  feel: "Quads and glutes. Knees and back feel comfortable.",
  err: ["Hips curling up off the pad at the bottom", "Locking the knees at the top", "Bouncing at the bottom", "Knees caving", "Feet too low so heels lift", "Getting out without turning the safeties back in"],
  back: "“Don’t let hips tuck hard” in your plan cue is the most important point: stop shallower so your pelvis and lower back stay flat on the pad.",
  clarify: "This is the 45° sled (you sit low and press the platform up at an angle). If your gym has the upright seated machine that pushes straight out, use “Seated Leg Press (horizontal)”.",
});
add("leg-press-seated", {
  s: ["Sit upright in the seated (horizontal) leg press with your back and hips flat on the pad. Move the seat so your knees start at about 90°. Place your feet mid-platform, shoulder-width, toes slightly out.", "Press the platform straight out (or push yourself back on a moving-seat machine) until the legs are almost straight (soft knees).", "Return under control to the start bend without letting the weight stack touch down or your hips tuck."],
  base: "Seated upright; back and hips flat; feet mid-platform, shoulder-width.",
  brace: "Brace the abs; head back on the pad if there is one.",
  grip: "Hold the side handles lightly.",
  rom: "Set the seat so the deepest point is where your hips still stay flat, often about 90° at the knee.",
  tempo: "3 sec back, 1 sec pause, 2 sec press.",
  feel: "Quads and glutes. Knees and back feel comfortable.",
  err: ["Seat too close so the hips tuck at the start", "Locking the knees at the end", "Letting the stack slam between reps", "Knees caving", "Feet too low so heels lift"],
  back: "“Don’t let hips tuck hard”: if your pelvis curls up at the start, move the seat back.",
  clarify: "This is the seated, horizontal machine (you sit upright and push straight out). For the angled sled, use “Leg Press (45° sled)”.",
});
add("leg-press-narrow", {
  s: ["Set up in the 45° sled leg press, but with feet about hip-width, mid-to-low on the platform.", "Lower until the knees reach ~90° with the hips flat.", "Press up through the whole foot."],
  base: "Back and hips flat, feet hip-width.",
  brace: "Abs braced; hips stay down.",
  grip: "Handles, lightly.",
  rom: "Stop before the hips tuck.",
  tempo: "3 sec down, 1 sec pause, 2 sec up.",
  feel: "More on the quads.",
  err: ["Hips tucking", "Heels lifting", "Locking out hard"],
  back: "Same as leg press: stop the range before the pelvis curls up.",
});
add("sl-calf-raise-press", {
  s: ["Sit in the leg press with your hips and back flat and place one foot on the lower part of the platform, so only the ball of the foot touches. Straighten the leg.", "Let the toes come up so your calf stretches fully.", "Press through the ball of the foot as far as you can, pause, and lower slowly."],
  base: "Seated on the press, one foot, ball of foot on the platform, knee soft.",
  brace: "Hips flat on the pad.",
  grip: "Hold the handles.",
  rom: "Full stretch to full tiptoe.",
  tempo: "2 sec up, 1–2 sec pause, 3 sec down.",
  feel: "Calf.",
  err: ["Bending the knee to cheat", "Bouncing", "Using too much weight"],
  back: "Back is supported.",
});
add("leg-extension", {
  s: ["Adjust the seat so your knees line up with the machine’s pivot and the pad rests on the lower shin, just above the ankles.", "Hold the handles and sit back against the pad.", "Extend your legs until almost straight, squeezing the quads at the top.", "Lower slowly until the knees are bent about 90°."],
  base: "Seated, back against the pad, knees aligned with the machine axis.",
  brace: "Hips stay down; hold the handles.",
  grip: "Handles on the sides of the seat.",
  rom: "From ~90° to almost fully straight. Don’t slam the lockout.",
  tempo: "1–2 sec up, 1 sec squeeze, 3 sec down.",
  feel: "The front of your thigh burning, especially at the top.",
  err: ["Swinging the weight", "Lifting the hips off the seat", "Slamming at the top", "Going too heavy for control"],
  back: "Seated and supported, with minimal load on the back.",
});
add("leg-curl", {
  s: ["Adjust the seat so your knees line up with the machine’s axis. The pad should rest on your lower calves, above the ankles. Lock the thigh pad down.", "Sit back with your back against the pad, legs straight.", "Curl your heels down and back toward your glutes in a smooth arc.", "Squeeze at the end, then return slowly until your legs are almost straight."],
  base: "Seated, back flat against the pad, thighs locked down, knees at the axis.",
  brace: "Hips and thighs stay pinned: “hips stay planted” in your plan.",
  grip: "Hold the handles.",
  rom: "Almost straight to at least 90°, further if comfortable.",
  tempo: "1–2 sec curl, 1 sec squeeze, 3 sec return.",
  feel: "Hamstrings on the back of the thigh.",
  err: ["Lifting the hips or thighs", "Bouncing at the stretch", "Using momentum", "Too heavy so the range shortens"],
  back: "Fully seated and supported, so it’s a friendly option.",
});
add("lying-leg-curl", {
  s: ["Lie face-down on the machine with the pad on your lower calves, just above the heels. Knees just off the edge of the bench, aligned with the axis.", "Hold the handles, and keep your hips pressed into the bench.", "Curl your heels toward your glutes.", "Squeeze at the top, then lower slowly until the legs are almost straight."],
  base: "Face-down, hips pressed into the pad, knees at the axis.",
  brace: "Squeeze the glutes lightly and brace to stop the hips lifting.",
  grip: "Handles.",
  rom: "Near-straight to the pad nearly touching your glutes.",
  tempo: "1–2 sec up, 1 sec squeeze, 3 sec down.",
  feel: "Hamstrings.",
  err: ["Hips rising off the pad", "Arching the lower back", "Swinging", "Cutting the stretch"],
  back: "Keep hips down and avoid arching; if the back arches, choose the seated version.",
});
add("ball-leg-curl", {
  s: ["Lie on your back with your heels on a stability ball and legs straight. Arms at your sides.", "Lift your hips so your body is a straight line from shoulders to heels.", "Keeping the hips up, roll the ball toward you by bending your knees.", "Roll out again slowly."],
  base: "On your back, hips lifted, heels on the ball.",
  brace: "Glutes squeezed so hips don’t drop.",
  grip: "Palms down on the floor.",
  rom: "Straight legs to knees bent about 90°.",
  tempo: "2 sec in, 1 sec hold, 3 sec out.",
  feel: "Hamstrings and glutes.",
  err: ["Hips dropping", "Rushing", "Arching the lower back"],
  back: "Keep the hips and glutes up and avoid arching.",
});
add("nordic-curl", {
  s: ["Kneel on a pad with your ankles held down (partner, bench or anchored strap), body straight from knees to head.", "Hold onto a band or a support so you can assist yourself.", "Slowly lower your body forward, as slowly as you can, using the hamstrings to resist. Keep hips extended.", "Catch yourself with your hands and push back up to start."],
  base: "Kneeling, body straight from knees to head, ankles secured.",
  brace: "Glutes and abs tight; hips stay forward.",
  grip: "Band or hands ready to catch.",
  rom: "As far forward as you can control.",
  tempo: "4–5 sec lowering.",
  feel: "Hamstrings working hard to resist.",
  err: ["Bending at the hips", "Falling fast", "Using too much range at first", "Arching the back"],
  back: "Keep the body straight and stop early if the lower back arches. Use band assistance.",
});
add("standing-calf-raise", {
  s: ["Stand with the balls of your feet on the edge of a step or machine platform, shoulders under the pads if using a machine. Feet hip-width, toes forward.", "Lower your heels until you feel a deep stretch in the calf.", "Press up through the big toe side to the highest point you can, pause 1 second.", "Lower slowly to the stretch."],
  base: "Balls of feet on the edge, heels hanging, knees nearly straight.",
  brace: "Keep the knees soft but straight, with a tall torso.",
  grip: "Hold the machine handles, or a rail for balance.",
  rom: "Full stretch at the bottom, full lift to tiptoes at the top.",
  tempo: "2 sec up, 1–2 sec pause at the top, 3 sec down.",
  feel: "Calf (gastrocnemius) burning. Achilles stays comfortable.",
  err: ["Bouncing", "Short range", "Rolling the ankles outward", "Bending the knees to cheat"],
  back: "Machine with shoulder pads loads the spine slightly; use a dumbbell or smith version if it bothers you.",
});
add("seated-calf-raise", {
  s: ["Sit on the machine with the balls of your feet on the platform and the knee pad on your lower thighs. Release the lever.", "Lower your heels as far as is comfortable.", "Press up through the balls of the feet to the highest point, pause, and lower slowly."],
  base: "Seated, knees bent about 90°, balls of feet on the platform.",
  brace: "Torso tall; hands on the pad or handles.",
  grip: "Handles or knee pad.",
  rom: "Full stretch to full tiptoe.",
  tempo: "2 sec up, 2 sec pause, 3 sec down (long stretch, pause at top, as your plan says).",
  feel: "Calf (soleus), a bit lower and deeper than a standing raise.",
  err: ["Bouncing", "Short range", "Using the lower back"],
  back: "Fully seated; no spinal load.",
});
add("tibialis-raise", {
  s: ["Stand with your back against a wall and feet about 30–45 cm out in front, hip-width. Or sit with a tibialis bar or band.", "Keeping your heels on the floor, pull your toes up toward your shins as high as you can.", "Pause 1 second, then lower slowly."],
  base: "Back to the wall, feet forward, legs straight (or seated).",
  brace: "Glutes and back against the wall, abs light.",
  grip: "Hands free, or on the machine.",
  rom: "Toes up as high as possible to nearly flat.",
  tempo: "1 sec up, 1–2 sec hold, 3 sec down.",
  feel: "The muscle at the front of your shin burning.",
  err: ["Rushing", "Bending the knees to shift load", "Lifting with the hips"],
  back: "Standing against a wall: very low stress.",
});
add("wall-sit", {
  s: ["Stand with your back against a wall and walk the feet forward about 60 cm.", "Slide down until your thighs are roughly parallel to the floor, knees over ankles.", "Press the whole back into the wall and hold. Hands on thighs or crossed."],
  base: "Back flat against the wall, thighs parallel to the floor, feet shoulder-width.",
  brace: "Press the low back lightly into the wall.",
  grip: "Hands hang or rest on thighs (not pushing).",
  rom: "Static hold at about 90° at the knees.",
  tempo: "Hold 20–45 sec, breathing steadily.",
  feel: "Quads burning.",
  err: ["Knees travelling past the toes", "Hands pushing on thighs", "Holding the breath"],
  back: "The wall supports you; don’t force the back flat if it aches.",
});
add("bstance-rdl", {
  s: ["Stand with one foot flat (the working leg) and the other foot a half step behind, toes lightly on the floor for balance (B-stance). Dumbbells or a barbell in front of the thighs.", "Soften the front knee, brace, and tighten your lats (squeeze your armpits, ‘protect the shoulders’).", "Push your hips straight back like closing a car door with your butt, keeping the weight close to the front leg. Back flat and neck neutral.", "Lower until you feel a stretch in the front hamstring, usually around mid-shin. The back foot only helps balance.", "Drive the hips forward to stand tall and squeeze the glutes."],
  base: "Staggered stance: 80–90% of weight on the front foot, back foot just a kickstand.",
  brace: "Brace abs, squeeze lats, and keep the weight close to your legs.",
  grip: "Overhand on the dumbbells or bar, arms long.",
  rom: "Until a hamstring stretch, back stays flat, hips back. Usually mid-shin.",
  tempo: "3 sec down, 1 sec pause, 1–2 sec up.",
  feel: "Hamstring and glute of the front leg stretching and then driving. Not the low back.",
  err: ["Rounding the back", "Squatting instead of hinging", "Back leg doing the work", "Letting the weight swing away from the legs", "Going deeper than the back allows"],
  back: "A hip hinge under load, so keep a flat back and use the range you can control, going lighter on tender days. (“Back leg assists only” is your plan cue.)",
});
add("cable-pull-through", {
  s: ["Set a rope on a low cable. Face away from the machine and step forward until there is tension. Reach back between your legs and hold the rope.", "Feet wider than hip-width, soft knees.", "Hinge your hips back, letting the rope travel between your legs, back flat.", "Drive the hips forward by squeezing the glutes until you stand tall."],
  base: "Feet slightly wider than hips, facing away from the cable.",
  brace: "Abs braced, flat back, neutral neck.",
  grip: "Rope held with both hands in front of the hips, arms straight.",
  rom: "Hips back until a hamstring stretch, then fully forward.",
  tempo: "3 sec back, 1 sec pause, 1–2 sec forward.",
  feel: "Glutes and hamstrings.",
  err: ["Squatting rather than hinging", "Pulling with the arms", "Rounding the back", "Over-extending at the top"],
  back: "Lighter spinal load than a barbell hinge; keep a flat back.",
});
add("reverse-lunge", {
  s: ["Stand tall with dumbbells at your sides or none. Feet hip-width.", "Step one foot straight back about 60–80 cm, landing on the ball of the foot.", "Lower your back knee toward the floor until the front thigh is around parallel. Front foot stays flat; chest tall; torso slightly forward.", "Push through the whole front foot to return to standing.", "Complete the reps on one side and switch (or alternate)."],
  base: "Start tall, feet hip-width; end in a split stance.",
  brace: "Brace the abs; pelvis level and stable.",
  grip: "Dumbbells at sides, or hands on hips.",
  rom: "Back knee just above the floor, front shin near vertical.",
  tempo: "2 sec down, 1 sec pause, 1–2 sec up.",
  feel: "Front quad and glute. Balanced.",
  err: ["Stepping too short so the front knee shoots forward", "Front heel lifting", "Pushing off the back foot", "Torso collapsing", "Knee caving"],
  back: "Reverse lunges are easier on the knees and back than forward lunges. Keep the torso stable.",
});
add("box-step-up", {
  s: ["Stand facing a low box (knee height or lower). Place the whole foot of one leg on the box.", "Brace, lean the torso very slightly forward, and push through the heel of the lead foot to step up. The back foot only taps the box at the top.", "Stand tall, then lower the back foot slowly to the floor.", "Complete the reps and switch."],
  base: "Whole lead foot on the box, torso tall.",
  brace: "Abs braced; pelvis level.",
  grip: "Dumbbells at the sides or hands on hips.",
  rom: "Up to full hip extension on the box; down in control.",
  tempo: "1–2 sec up, 1 sec pause, 3 sec down.",
  feel: "Lead leg’s quad and glute.",
  err: ["Pushing off the back foot", "Box too high so the pelvis tilts", "Knee caving", "Rushing the way down"],
  back: "Low box and controlled lowering. Keep the torso stable.",
});
add("hip-thrust", {
  s: ["Sit on the floor with your upper back (just below the shoulder blades) against the long side of a bench. Roll the barbell (with a pad) over your hips.", "Feet flat, hip-width, about hip-to-heel distance, shins vertical at the top. Chin tucked slightly.", "Brace, tuck your ribs down and drive through your heels to lift your hips until your torso is parallel to the floor.", "Squeeze the glutes hard for a second; the hips are neutral, not arched.", "Lower under control and repeat."],
  base: "Upper back on the bench, feet flat, hips-to-heels about a shin length, knees at 90° at the top.",
  brace: "Ribs down, slight pelvic tuck, chin tucked: your plan’s “ribs down, slight pelvic tuck”.",
  grip: "Hands on the bar to steady it, not to lift.",
  rom: "From hips just off the floor to a flat torso, with a hard squeeze. Don’t hyperextend the lower back.",
  tempo: "1–2 sec up, 1–2 sec squeeze, 3 sec down.",
  feel: "Glutes working hard. Not the low back, not the hamstrings cramping.",
  err: ["Arching the lower back at the top", "Feet too far forward so hamstrings take over", "Ribs flaring", "Looking up at the ceiling", "Bouncing the bar"],
  back: "The bench supports your upper back, and the pelvic tuck protects the low back from over-arching. Stop at a flat torso.",
});
add("machine-hip-thrust", {
  s: ["Sit with your upper back against the pad and adjust the belt or pad across your hips.", "Feet flat, hip-width, knees about 90° at the top.", "Brace, tuck your ribs, and drive your hips up by pushing through your heels.", "Squeeze at the top for a second, then lower slowly."],
  base: "Upper back on the pad, belt across the hips.",
  brace: "Ribs down, slight tuck, chin tucked.",
  grip: "Hold the handles.",
  rom: "Hips to a flat torso.",
  tempo: "1–2 sec up, 1–2 sec squeeze, 3 sec down.",
  feel: "Glutes.",
  err: ["Arching the lower back", "Feet too far forward", "Lowering too fast"],
  back: "Supported upper back and a pelvic tuck keep the lower back quiet.",
});
add("glute-bridge", {
  s: ["Lie on your back, knees bent, feet flat and hip-width, about a hand-length from your glutes.", "Do a posterior pelvic tilt to start, and brace.", "Push through your heels and lift your hips until your body makes a line from knees to shoulders.", "Squeeze your glutes for 1–2 seconds. Lower slowly."],
  base: "On your back, feet flat, knees bent.",
  brace: "Tilt first: ribs down, no arch at the top.",
  grip: NO_GRIP,
  rom: "Hips to a straight line, no higher.",
  tempo: "2 sec up, 2 sec squeeze, 3 sec down.",
  feel: "Glutes, not the lower back.",
  err: ["Arching the lower back at the top", "Pushing through the toes", "Hamstrings cramping from feet too far out"],
  back: "Supported on the floor; use the tilt to protect the low back.",
});
add("sl-glute-bridge", {
  s: ["Lie on your back, one knee bent with the foot flat, the other leg pulled to the chest or held straight up.", "Brace and tilt the pelvis, then drive through the heel of the planted foot to lift the hips.", "Keep the hips level (no rotating or dropping to one side).", "Lower slowly and finish all reps before switching."],
  base: "On your back, one foot planted, other leg lifted.",
  brace: "Tilt, brace, keep hips level.",
  grip: NO_GRIP,
  rom: "To a straight line from knee to shoulder.",
  tempo: "2 up, 2 squeeze, 3 down.",
  feel: "Glute of the working leg.",
  err: ["Hips rotating", "Arching the back", "Pushing through the toes"],
  back: "Supported; keep the pelvis level and ribs down.",
});
add("back-extension-45", {
  s: ["Set the pad so it sits just below your hip bones, with your feet secured. Cross your arms over the chest (or hold a light plate).", "Start with a straight body, from heels to head.", "Round slightly in the upper back and hinge down at the hips until you feel a hamstring stretch, spine staying neutral.", "Drive your hips into the pad and squeeze your glutes to come up to a straight line. Stop there: don’t lean back past it."],
  base: "Pad below the hips, feet secured, body straight at the top.",
  brace: "Squeeze glutes and abs; the movement happens at the hips, not the low back.",
  grip: "Arms crossed over chest, or a light plate held to the chest.",
  rom: "From a hip hinge to a straight line only.",
  tempo: "2 sec up, 1–2 sec squeeze, 3 sec down.",
  feel: "Glutes and hamstrings. Back muscles help, but shouldn’t be the main feel.",
  err: ["Hyperextending the lower back at the top", "Swinging up fast", "Using the lower back instead of the glutes", "Pad too high"],
  back: "“Stop before low-back takeover” in your plan means finish at a straight line, never an arch. Skip or go bodyweight on tender days.",
});
add("reverse-hyper-light", {
  s: ["Lie face-down over the pad with your hips at the edge and your hands holding the handles. Legs hang.", "Brace and tuck the pelvis slightly, then swing your legs up to hip height with straight legs.", "Squeeze your glutes at the top. Lower slowly with control. Keep the weight very light."],
  base: "Face-down over the pad, hips at the edge, legs hanging.",
  brace: "Squeeze glutes, brace abs.",
  grip: "Handles.",
  rom: "Legs to about hip level only.",
  tempo: "2 sec up, 1 sec squeeze, 3 sec down.",
  feel: "Glutes and hamstrings, with a mild low-back decompression feeling for some.",
  err: ["Swinging the legs", "Lifting higher than the hips", "Too much weight"],
  back: "Keep it light and don’t go above hip height. Skip if tender.",
});
add("cable-hip-abduction", {
  s: ["Attach an ankle cuff to a low cable and strap it to the ankle farther from the machine. Stand side-on with a hand on the support.", "Stand tall on the inside leg. Lean very slightly forward from the hips (as your plan says).", "Sweep the working leg out to the side, leading with the heel, up to about 30–45°.", "Pause and return slowly without letting the cable pull the leg across."],
  base: "Standing on one leg, hand lightly on the support, pelvis level.",
  brace: "Brace abs; do not lean or hike the hip.",
  grip: "Hand on the support for balance.",
  rom: "Leg out about 30–45°, no further.",
  tempo: "2 sec out, 1 sec pause, 3 sec back.",
  feel: "Outer hip (glute med) of the working leg.",
  err: ["Swinging the leg", "Leaning away", "Torso twisting", "Too heavy so the pelvis tilts"],
  back: "Standing and low load. Keep the torso still.",
});
add("adductor-machine", {
  s: ["Sit with your back on the pad. Set the starting width so you feel a comfortable stretch, not a strain. Rest your legs on the pads.", "Squeeze your legs together smoothly.", "Pause for a second, then open slowly under control."],
  base: "Seated, back on the pad, legs on the pads at a comfortable width.",
  brace: "Torso stays tall, hands on handles.",
  grip: "Handles.",
  rom: "From a mild stretch to knees together.",
  tempo: "2 sec squeeze, 1 sec pause, 3 sec open.",
  feel: "Inner thighs.",
  err: ["Too wide a start so it strains the groin", "Bouncing", "Letting the weight stack crash"],
  back: "Fully supported.",
});

/* ------------------------------------------------------------- Push / shoulders / arms */
add("incline-db-press", {
  s: ["Set a bench at about 30° (low incline). Sit with the dumbbells on your thighs, then lie back, kicking them up to shoulder level.", "Plant your feet. Pull your shoulder blades back and down and keep them there, with a small natural arch only in the upper back.", "Press the dumbbells up and slightly together until your arms are nearly straight over your upper chest.", "Lower slowly until the elbows are about at or just below bench height, with elbows about 45–60° from the torso, not flared at 90°.", "Press back up along the same path."],
  base: "Bench at ~30°, feet flat, shoulder blades pinned back and down, glutes on the bench.",
  brace: "Brace the abs and hold the shoulder blade position the whole time.",
  grip: "Dumbbells over the wrists, palms facing forward or slightly turned in. Grip firmly; wrists straight.",
  rom: "Deep stretch at the chest, elbows below or at the bench line, to nearly straight arms. Don’t slam dumbbells together at the top.",
  tempo: "3 sec down, 1 sec pause, 1–2 sec up.",
  feel: "Upper chest and the front of the shoulders, with triceps helping. Shoulders shouldn’t pinch.",
  err: ["Elbows flared straight out", "Bench too steep so it becomes a shoulder press", "Bouncing at the bottom", "Lifting the hips or arching hard", "Shoulders rolling forward"],
  back: "Feet planted and the bench supports your back. Keep the arch small and the ribs down.",
});
add("landmine-press", {
  s: ["Wedge the end of a barbell in a corner or landmine anchor and load the other end lightly. Stand holding the end of the bar at your shoulder, with one hand.", "Stagger the feet (the leg opposite the pressing arm forward) or stand split. Brace your abs and ribs down.", "Press the bar up and forward along its natural arc until your arm is nearly straight. Reach slightly at the top so the shoulder blade moves with it.", "Lower slowly to the shoulder."],
  base: "Split or staggered stance, tall torso, bar end at the shoulder, ribs down.",
  brace: "Abs and glutes braced; no leaning back.",
  grip: "One hand around the bar end (sleeve), wrist straight.",
  rom: "Shoulder-level to nearly straight arm in the direction the bar travels.",
  tempo: "2 sec up, 1 sec hold, 3 sec down.",
  feel: "Front and side of the shoulder, upper chest and triceps; the core resisting leaning.",
  err: ["Leaning back to push", "Arching the lower back", "Letting the elbow flare", "Using too much weight"],
  back: "Plan note: the landmine path reduces shoulder and low-back stress. Keep ribs down and stand tall.",
});
add("machine-chest-press", {
  s: ["Adjust the seat so the handles line up with the middle of your chest. Sit with your back flat on the pad and feet planted.", "Pull your shoulder blades back and down and keep them pinned.", "Press the handles forward until your arms are almost straight.", "Lower slowly until you feel the chest stretch, with elbows about 45–60° from the torso."],
  base: "Seated, back flat on the pad, shoulder blades pinned, feet planted.",
  brace: "Abs light; shoulders stay pinned back. Head against the pad.",
  grip: "Handles, wrists straight.",
  rom: "Full range: chest stretch at the bottom, near-straight arms at the top.",
  tempo: "3 sec back, 1 sec pause, 1–2 sec press.",
  feel: "Chest, with the shoulders and triceps helping.",
  err: ["Shrugging the shoulders forward", "Elbows too high", "Using half range", "Bouncing the stack"],
  back: "Supported seated press. Keep the back on the pad.",
});
add("incline-machine-press", {
  s: ["Adjust the seat so the handles line up with your upper chest. Sit with your back on the pad.", "Pin your shoulder blades back and down.", "Press up and forward until the arms are almost straight.", "Lower slowly to a chest stretch."],
  base: "Seated, back on the pad, shoulder blades pinned.",
  brace: "Abs light, shoulders pinned.",
  grip: "Handles, wrists straight.",
  rom: "Full.",
  tempo: "3 down, 1 pause, 1–2 up.",
  feel: "Upper chest and front shoulders.",
  err: ["Shrugging", "Half reps", "Flaring the elbows"],
  back: "Supported seated press.",
});
add("weighted-pushup", {
  s: ["Start in a high plank: hands under shoulders (slightly wider), feet hip-width. Have a plate or vest in place (or use a light-weight backpack).", "Brace the abs, squeeze the glutes, and make a straight line from head to heels.", "Lower your chest toward the floor with elbows about 45° from the body.", "Stop when the chest is a fist from the floor, then press the floor away until your arms are straight and the shoulder blades spread."],
  base: "High plank, hands under shoulders, body straight.",
  brace: "Glutes and abs tight so hips don’t sag.",
  grip: "Palms flat, fingers spread, hands turned out slightly.",
  rom: "Chest to a fist from the floor, to full arm extension.",
  tempo: "3 sec down, 1 sec pause, 1–2 sec up.",
  feel: "Chest, shoulders and triceps; core holding the line.",
  err: ["Hips sagging", "Elbows flared at 90°", "Half reps", "Head dropping first"],
  back: "Squeeze glutes and keep the ribs down so the back doesn’t sag. Use an incline (hands on a bench) if needed.",
});
add("pushup", {
  s: ["Hands under shoulders, a bit wider, feet hip-width, body in one line from head to heels.", "Lower your chest toward the floor, elbows about 45° from the torso.", "Press away until arms are straight, spreading the shoulder blades at the top."],
  base: "High plank, body straight.",
  brace: "Glutes and abs tight.",
  grip: "Palms flat, fingers spread.",
  rom: "Chest a fist from the floor to arms straight.",
  tempo: "3 down, 1 pause, 1–2 up.",
  feel: "Chest, shoulders, triceps.",
  err: ["Sagging hips", "Elbows flared out", "Half range"],
  back: "Do an incline version if the low back sags.",
});
add("close-grip-pushup", {
  s: ["Hands directly under the chest, a little closer than shoulder width (not touching). Feet hip-width.", "Brace, lower with elbows tracking back and close to the ribs.", "Press back up to straight arms."],
  base: "High plank, hands narrow.",
  brace: "Glutes and abs tight.",
  grip: "Palms flat.",
  rom: "Chest a fist from the floor.",
  tempo: "3 down, 1 pause, 1–2 up.",
  feel: "Triceps and inner chest.",
  err: ["Hands too narrow so wrists hurt", "Elbows flaring", "Sagging hips"],
  back: "Same as a push-up; use an incline if the low back sags.",
});
add("low-high-fly", {
  s: ["Set both pulleys low. Stand in the middle holding a handle in each hand, a step forward of the weights, one foot slightly ahead.", "Slight forward lean from the hips, soft elbows (bent about 15°) and fixed.", "Sweep your hands up and in toward the middle of your face/upper chest height, as if hugging a large barrel upward.", "Squeeze, then return under control until you feel a chest stretch."],
  base: "Split stance, slight forward lean, soft elbows fixed.",
  brace: "Ribs down, abs braced. Torso still.",
  grip: "Handles, palms facing up or in; wrists straight.",
  rom: "From arms out low and wide to hands together at upper-chest height.",
  tempo: "2 sec up, 1 sec squeeze, 3 sec down.",
  feel: "Upper chest. Not the biceps or the front of the shoulder.",
  err: ["Bending and straightening the elbows (a press)", "Using momentum", "Slamming the handles together", "Leaning back"],
  back: "Standing; brace and keep ribs down.",
});
add("high-low-fly", {
  s: ["Set the pulleys high. Stand in the middle with a handle in each hand and one foot forward.", "Slight forward lean, soft elbows.", "Sweep your hands down and in toward your hips/lower belly in an arc.", "Squeeze, then return slowly until you feel a stretch across the chest."],
  base: "Split stance, forward lean, soft elbows.",
  brace: "Ribs down, abs braced.",
  grip: "Handles, wrists straight.",
  rom: "From hands out and above shoulder height to together in front of the hips.",
  tempo: "2 sec down, 1 sec squeeze, 3 sec up.",
  feel: "Lower chest.",
  err: ["Pressing instead of fly", "Using momentum", "Leaning back"],
  back: "Standing; keep the ribs down.",
});
add("pec-deck", {
  s: ["Adjust the seat so your elbows are level with the middle of your chest. Sit with your back flat on the pad.", "Place your forearms on the pads (or hold the handles) with elbows at about shoulder height.", "Squeeze your arms together in front of your chest.", "Return slowly until you feel a comfortable chest stretch; don’t go past where the shoulders feel strained."],
  base: "Seated, back on the pad, shoulders down.",
  brace: "Shoulder blades pinned back and down.",
  grip: "Forearm pads or handles.",
  rom: "Chest stretch to arms together.",
  tempo: "2 sec squeeze, 1 sec hold, 3 sec open.",
  feel: "Mid chest.",
  err: ["Shrugging", "Over-stretching at the back", "Slamming the stack"],
  back: "Fully supported.",
});
add("cable-lateral-raise", {
  s: ["Set a low cable. Stand side-on with the cable on the far side, take the handle in the hand nearest the machine, across your body.", "Stand tall, a slight lean away from the cable, holding something with the other hand for balance.", "With a soft elbow, raise your arm out to the side, leading with your elbow, to around shoulder height (stop around eye level at most).", "Pause briefly, then lower slowly."],
  base: "Standing tall, feet hip-width, slight lean away from the cable.",
  brace: "Ribs down; the torso stays still.",
  grip: "Handle in a loose grip, thumb side relaxed, wrist neutral.",
  rom: "Arm by the side to about shoulder height. Higher turns it into a shrug.",
  tempo: "2 sec up, 1 sec pause, 3 sec down.",
  feel: "Side of the shoulder (side delt) burning. Traps stay quiet.",
  err: ["Shrugging the traps", "Swinging the body", "Lifting the hand higher than the elbow", "Using too much weight"],
  back: "Standing; stay tall and don’t lean.",
});
add("btb-lateral-raise", {
  s: ["Set a low cable. Stand with your back toward the machine, the cable behind you. Take the handle with the hand farthest from the machine.", "The cable passes behind your back. Hand starts beside or slightly behind your hip.", "With a soft elbow, raise the arm out to the side to about shoulder height, with the elbow leading.", "Let the arm sink slowly back, feeling a stretch in the side delt."],
  base: "Standing tall, back to the cable, side-on, free hand holding a support.",
  brace: "Ribs down, torso still.",
  grip: "Loose grip on the handle, wrist neutral.",
  rom: "Stretched at the side of the hip to about shoulder height.",
  tempo: "2 sec up, 1 sec pause, 3 sec down.",
  feel: "Side delt stretched at the bottom and burning at the top.",
  err: ["Shrugging", "Swinging", "Leaning away", "Lifting above shoulder height"],
  back: "Standing; ribs down.",
});
add("machine-lateral-raise", {
  s: ["Adjust the seat so your shoulders line up with the machine’s pivot. Sit tall with your back on the pad, arms against the pads.", "Raise your arms out to the side until about shoulder height, elbows leading.", "Lower slowly."],
  base: "Seated, chest tall, back on the pad.",
  brace: "Torso still, shoulders down.",
  grip: "Pads at the forearms or handles.",
  rom: "To about shoulder height.",
  tempo: "2 up, 1 pause, 3 down.",
  feel: "Side delts.",
  err: ["Shrugging", "Leaning", "Jerking"],
  back: "Supported.",
});
add("cable-front-raise", {
  s: ["Set a low cable. Face away from it with the handle between your legs, or hold a rope. Stand tall.", "With a soft elbow raise your arm forward to eye level.", "Pause and lower slowly."],
  base: "Standing tall, feet hip-width, ribs down.",
  brace: "Abs braced; no leaning back.",
  grip: "Handle, or rope with both hands.",
  rom: "Down by the thighs to about eye level.",
  tempo: "2 up, 1 pause, 3 down.",
  feel: "Front shoulder.",
  err: ["Swinging", "Arching back", "Going above eye level"],
  back: "Ribs down and no leaning.",
});
add("overhead-rope-triceps", {
  s: ["Set a cable at the low position with a rope. Face away, take the rope in both hands and bring it overhead with elbows bent and pointing up/forward. Step forward into a staggered stance.", "Brace, ribs down, elbows close to the head and still.", "Straighten your elbows to press the rope forward and up until your arms lock out.", "Pause, and return slowly until you feel a deep triceps stretch."],
  base: "Staggered stance, slight forward lean, ribs down, elbows by the ears.",
  brace: "Abs braced; avoid arching the low back as you reach overhead.",
  grip: "Rope with both hands, thumbs toward your head.",
  rom: "Full stretch (elbows bent about 90° or more) to hard lockout.",
  tempo: "2 sec up, 1 sec lockout, 3 sec down.",
  feel: "Back of the upper arm (long head of the triceps) stretching and then squeezing.",
  err: ["Elbows flaring wide", "Moving the elbows forward and back", "Arching the low back", "Using the body to swing"],
  back: "Overhead position can arch the low back, so brace and keep the ribs down. Use a half-kneeling or bench-supported version if needed.",
});
add("assisted-dip", {
  s: ["Set the assistance weight (more weight = easier). Kneel or stand on the pad and take the handles.", "Lock the elbows to rise, with shoulders pulled down away from the ears.", "Lower under control with elbows tracking back, a slight forward lean of the torso.", "Stop around when the upper arms are parallel to the floor (or a bit shallower if the shoulders complain).", "Press back up until the arms are straight."],
  base: "Supported on the handles, shoulders down, torso leaning slightly forward.",
  brace: "Abs light, shoulders away from the ears.",
  grip: "Handles gripped firmly, wrists straight.",
  rom: "Upper arms to about parallel at the bottom. No deeper.",
  tempo: "3 sec down, 1 sec pause, 1–2 sec up.",
  feel: "Chest, triceps and front shoulders. No pinching in the front of the shoulder.",
  err: ["Dumping the shoulders (going too deep)", "Shrugging at the bottom", "Flaring the elbows", "Bouncing"],
  back: "Supported with no spinal load. Keep the depth shallow if shoulders are cranky (“don’t dump shoulders” is your plan cue).",
});
add("shoulder-press", {
  s: ["Set a bench to 80–90° (upright). Sit with feet flat and back against the pad, dumbbells at shoulder height.", "Brace, with ribs down and glutes on the seat. Elbows slightly in front of the torso.", "Press the dumbbells up until your arms are nearly straight, in a slight arc so they finish above your shoulders.", "Lower slowly to about ear or shoulder height."],
  base: "Seated upright, back against the pad, feet planted.",
  brace: "Ribs stacked over pelvis; abs braced. Don’t arch.",
  grip: "Dumbbells over the wrists, palms forward or slightly turned in.",
  rom: "Dumbbells at shoulder height to almost-straight arms.",
  tempo: "2 sec up, 1 sec pause, 3 sec down.",
  feel: "Shoulders (front and side) and triceps.",
  err: ["Arching the lower back", "Flaring the elbows wide", "Using leg drive", "Bouncing at the bottom"],
  back: "“Press from stacked ribs and pelvis” is your cue: back against the pad and ribs down protects the low back.",
});
add("machine-shoulder-press", {
  s: ["Set the seat so the handles are at shoulder height. Sit with your back flat on the pad.", "Brace, ribs down, press the handles overhead until the arms are almost straight.", "Lower slowly to the start."],
  base: "Seated, back on the pad, feet planted.",
  brace: "Ribs down; don’t arch.",
  grip: "Handles gripped firmly.",
  rom: "Shoulder height to almost-straight arms.",
  tempo: "2 up, 1 pause, 3 down.",
  feel: "Shoulders and triceps.",
  err: ["Arching the back", "Shrugging", "Using half range"],
  back: "Supported; keep ribs down.",
});
add("reverse-pec-deck", {
  s: ["Adjust the seat so the handles are at shoulder height. Sit facing the pad, chest against it.", "Take the handles with palms facing each other and arms nearly straight.", "Pull the handles out and back in a wide arc, leading with the elbows, until your hands are in line with your shoulders or slightly behind.", "Pause, and return slowly."],
  base: "Seated facing the pad, chest against it, shoulders down.",
  brace: "Chest stays on the pad; torso still.",
  grip: "Handles, neutral palms facing in, loose wrists.",
  rom: "Arms in front to in line with the body or slightly behind.",
  tempo: "2 sec back, 1–2 sec pause, 3 sec forward.",
  feel: "Rear shoulders and between the shoulder blades. Not upper traps.",
  err: ["Shrugging", "Using the arms to pull rather than the elbows", "Leaning back", "Going too heavy"],
  back: "Chest supported on the pad.",
});
add("chest-supported-rear-fly", {
  s: ["Set an incline bench at about 30–45°. Lie chest-down on it with a light dumbbell in each hand, arms hanging.", "With a soft elbow, raise the arms out to the sides until they are in line with your body.", "Pause for a second and lower slowly."],
  base: "Chest-down on the bench, head neutral.",
  brace: "The chest stays on the bench.",
  grip: "Neutral grip dumbbells, loose wrists.",
  rom: "Arms hanging to in line with your shoulders.",
  tempo: "2 up, 1 pause, 3 down.",
  feel: "Rear shoulders and upper back.",
  err: ["Shrugging", "Swinging", "Using too much weight", "Bending the elbows deeply"],
  back: "Supported chest.",
});
add("y-raise", {
  s: ["Set both cable pulleys low and stand between them (or use one side at a time). Hold the handles with thumbs up.", "Start with arms low and slightly in front of the thighs.", "Raise your arms diagonally up and out so your body makes a Y, thumbs pointing up.", "Stop around ear height. Pause and lower slowly. Use a very light weight."],
  base: "Standing tall between the pulleys, ribs down.",
  brace: "Ribs down, abs braced; don’t arch to lift.",
  grip: "Handles with thumbs up, light grip.",
  rom: "Arms low to about ear height in a V (the “raise in a V path” in your plan).",
  tempo: "2 sec up, 1–2 sec pause, 3 sec down.",
  feel: "Lower traps and the muscles around the shoulder blades, plus the deltoid. Not the upper traps.",
  err: ["Shrugging", "Using too heavy a weight", "Arching the back", "Swinging"],
  back: "Do chest-supported if standing makes you arch.",
});
add("band-pull-apart", {
  s: ["Hold a light band at shoulder height with both hands, arms straight in front of you, palms down.", "Pull the band apart by moving your hands out to the sides, squeezing your shoulder blades together.", "Pause with the band touching the chest, then return slowly."],
  base: "Standing tall, arms in front, ribs down.",
  brace: "Abs braced; don’t lean back.",
  grip: "Overhand on the band, hands about shoulder width apart.",
  rom: "Arms in front to arms out wide.",
  tempo: "2 sec out, 1 sec pause, 3 sec back.",
  feel: "Rear shoulders and mid-back.",
  err: ["Shrugging", "Leaning back", "Bending the elbows"],
  back: "Standing; ribs down.",
});
add("cable-external-rotation", {
  s: ["Set a cable at elbow height. Stand side-on with the working arm farther from the machine. Tuck a small towel between your elbow and ribs.", "Hold the handle with the elbow bent to 90°, forearm across your belly.", "Rotate the forearm outward like opening a door, keeping the elbow pinned to the towel.", "Pause and return slowly. Use a very light weight."],
  base: "Standing, elbow at 90° pinned to the side with a towel.",
  brace: "Torso still.",
  grip: "Handle in a loose grip.",
  rom: "Belly to about 45° outward.",
  tempo: "2 sec out, 1 sec pause, 3 sec back.",
  feel: "Back of the shoulder, deep rotator cuff muscles.",
  err: ["Letting the elbow leave the side", "Too heavy", "Twisting the torso"],
  back: "Standing; low load.",
});
add("scaption-raise", {
  s: ["Stand tall with a light dumbbell in each hand, arms by your sides, thumbs pointing up.", "Raise both arms straight (soft elbows) at about 30° in front of your sides, halfway between a front and a side raise.", "Lift to about shoulder or eye height without shrugging. Pause.", "Lower slowly to your sides."],
  base: "Standing tall, feet hip-width, ribs down.",
  brace: "Abs braced; don’t lean back to lift.",
  grip: "Light grip, thumbs up.",
  rom: "Sides to about shoulder/eye height in the scapular plane (your plan’s “V path”).",
  tempo: "2 sec up, 1 sec pause, 3 sec down.",
  feel: "Side and front of the shoulder plus the muscles around the shoulder blade. Not the upper traps.",
  err: ["Shrugging", "Too heavy a weight", "Arching the back", "Raising straight out to the side"],
  back: "Stand tall or sit on a bench with back support if standing makes you arch.",
  clarify: "Your plan says Cable Y-Raise / Scaption Raise. This is the dumbbell scaption; the cable version is “Cable Y-Raise”.",
});
add("ez-curl", {
  s: ["Stand tall, feet hip-width. Hold an EZ-bar with an underhand grip on the angled sections, arms by your sides.", "Pin your elbows to your sides. Brace the abs.", "Curl the bar up toward the shoulders without moving your elbows forward.", "Squeeze at the top, then lower slowly until the arms are almost straight."],
  base: "Standing tall, knees soft, elbows at your sides.",
  brace: "Abs and glutes lightly braced to stop swinging.",
  grip: "Underhand grip on the angled part of the bar, shoulder width.",
  rom: "Arms almost straight to the bar near the shoulders.",
  tempo: "2 sec up, 1 sec squeeze, 3 sec down.",
  feel: "Biceps, with forearms helping.",
  err: ["Swinging the torso", "Elbows drifting forward", "Not lowering fully", "Wrists bending"],
  back: "Don’t lean back. Stand tall and brace to protect the low back.",
});
add("hammer-curl", {
  s: ["Stand tall with a dumbbell in each hand, palms facing each other, elbows at your sides.", "Curl the weights up without rotating the wrists.", "Squeeze at the top, lower slowly."],
  base: "Standing tall, elbows at sides.",
  brace: "Abs braced.",
  grip: "Neutral grip (thumbs up).",
  rom: "Almost straight to near the shoulders.",
  tempo: "2 up, 1 squeeze, 3 down.",
  feel: "Brachialis and forearm, with biceps.",
  err: ["Swinging", "Elbows forward", "Not lowering fully"],
  back: "Stand tall and brace.",
});
add("incline-db-curl", {
  s: ["Set an incline bench at 45–60°. Sit back with a dumbbell in each hand, arms hanging straight down beside the bench, palms forward.", "Keep your upper arms still, slightly behind the torso, shoulder blades on the bench.", "Curl the weights up, supinating (palms up).", "Squeeze, then lower slowly to a full stretch."],
  base: "Seated reclined on the incline bench, arms hanging behind the torso line.",
  brace: "Head and back on the bench.",
  grip: "Underhand dumbbells, wrists straight.",
  rom: "Full stretch at the bottom to nearly shoulder height.",
  tempo: "2 sec up, 1 sec squeeze, 3–4 sec down.",
  feel: "Long head of the biceps stretched and squeezed.",
  err: ["Lifting the elbows forward (shoulder raise)", "Swinging", "Rolling the shoulders forward", "Too heavy"],
  back: "Reclined and supported by the bench.",
});
add("preacher-curl", {
  s: ["Adjust the seat so the pad hits just below your armpits. Rest your upper arms on the pad.", "Take the handle with an underhand grip, arms nearly straight.", "Curl up until the forearms are nearly vertical. Squeeze.", "Lower slowly until the arms are almost straight (don’t drop into full lockout)."],
  base: "Seated, upper arms flat on the pad, chest tall.",
  brace: "Chest on the pad edge; don’t lean back.",
  grip: "Underhand on the handles.",
  rom: "Almost straight to near the shoulders.",
  tempo: "2 sec up, 1 sec squeeze, 3 sec down.",
  feel: "Biceps (short head) and brachialis.",
  err: ["Dropping the weight into lockout", "Lifting the elbows off the pad", "Swinging"],
  back: "Supported.",
});
add("wrist-curl", {
  s: ["Sit with forearms on your thighs or on a bench, palms up, wrists hanging over the edge, dumbbells or an EZ-bar in your hands.", "Let the weight roll down into your fingers, then curl it up by bending your wrists.", "Pause and lower slowly."],
  base: "Seated, forearms supported, wrists hanging over the edge.",
  brace: "Only the wrists move.",
  grip: "Underhand, open grip so the weight can roll to the fingertips.",
  rom: "Full wrist extension to full flexion.",
  tempo: "2 up, 1 pause, 3 down.",
  feel: "Underside of the forearm.",
  err: ["Using the arms and shoulders", "Too heavy", "Short range"],
  back: "Seated, no spinal load.",
});
add("rope-pressdown", {
  s: ["Set a rope on a high cable. Stand facing it, feet hip-width, slight hip hinge, elbows pinned to your sides.", "Hold the rope with palms facing each other.", "Press down, straightening your elbows, and spread the rope apart at the bottom.", "Hard lockout for a second, then let the hands rise slowly until the elbows are at about 90°."],
  base: "Standing tall, slight forward lean, elbows pinned.",
  brace: "Abs braced; shoulders down.",
  grip: "Rope with a neutral grip, thumbs on top.",
  rom: "From elbows bent 90° to full lockout.",
  tempo: "1–2 sec down, 1 sec lockout, 3 sec up.",
  feel: "Back of the upper arm (triceps), especially at lockout.",
  err: ["Elbows drifting forward or flaring", "Leaning over the rope", "Using body weight", "Skipping the lockout"],
  back: "Stand tall with a mild hinge and a braced torso.",
});
add("cross-body-cable-ext", {
  s: ["Set a cable high with a single handle. Stand side-on to the machine and take the handle with the far hand, elbow bent across your body at chest height.", "Hold the working elbow in place with your other hand if you like.", "Straighten the elbow, pushing the handle across and down away from you.", "Lock out, then return slowly until the triceps stretch. Finish all reps then switch."],
  base: "Standing, side-on, working elbow bent across the body.",
  brace: "Keep the shoulder still; only the elbow moves.",
  grip: "Single handle, neutral or palm down.",
  rom: "Elbow bent to full lockout.",
  tempo: "1–2 sec out, 1 sec lockout, 3 sec back.",
  feel: "Triceps, especially the long head.",
  err: ["Moving the shoulder", "Using the torso to swing", "Elbow drifting"],
  back: "Standing; ribs down.",
});
add("skull-crusher", {
  s: ["Lie on a bench with an EZ-bar held over your chest with arms straight, hands about shoulder-width apart, on the angled parts.", "Keep your upper arms pointed slightly back past vertical. Bend only at the elbows to lower the bar toward your forehead (or just behind your head).", "Stop when the elbows are fully bent, then extend until the arms are straight."],
  base: "Lying on a bench, feet planted.",
  brace: "Abs braced, ribs down; upper arms still.",
  grip: "Overhand on the angled parts of the EZ-bar.",
  rom: "Arms straight to bar near the forehead.",
  tempo: "3 sec down, 1 sec pause, 1–2 sec up.",
  feel: "Triceps.",
  err: ["Elbows flaring", "Moving the upper arms", "Too heavy", "Arching the back"],
  back: "Bench supported; keep ribs down.",
});

/* ------------------------------------------------------------- Fine Shyte 3 */
add("lying-cable-pullover", {
  s: ["Set a flat bench lengthwise in front of a low cable, head end nearest the stack. Attach a rope or short straight bar.", "Lie back with your head near the cable, feet flat. Reach back overhead and take the handle.", "Arms nearly straight with a soft bend in the elbows. Let the cable draw your arms back until you feel a big lat stretch, ribs staying down.", "Pull the shoulders down away from your ears, then sweep the handle in an arc up and over to your hips, keeping the elbow bend fixed.", "Pause with the hands at your hips, then let the arms travel back slowly to the stretch."],
  base: "Lying face-up on a flat bench, feet flat on the floor, head near the cable stack.",
  brace: "Exhale and pull the ribs down before every rep so the low back stays on the bench as the arms go overhead.",
  grip: "Both hands on the rope or bar, overhand, wrists straight.",
  rom: "From arms overhead in a lat stretch (only as far as the left shoulder is pain-free) to hands at the hips.",
  tempo: "2 sec pull, 1 sec squeeze, 3 sec back to the stretch.",
  feel: "Lats down the sides of your back and under the armpits. Not the triceps, not the neck.",
  err: ["Bending the elbows more as you pull (turns it into a triceps move)", "Arching the low back at the stretch", "Shrugging at the top", "Forcing the left shoulder past its pain-free range"],
  back: "Supported on the bench, so no load on the L4. Keep the ribs down so the back doesn't arch at the stretch. Stop the stretch short of any pinch in the left shoulder.",
});
add("kneeling-cable-pullaround", {
  s: ["Set a cable at the top with a single handle. Kneel a step to the side of the stack so the cable comes from above and across your body.", "Take the handle with the arm farthest from the stack, reaching up and across so the lat stretches.", "Pull the shoulder down first. Then drive the elbow down and around in an arc to your hip, like tucking it into your back pocket.", "Squeeze for a second with the elbow by your hip, then let it travel back up and across slowly.", "Do the right side, then the left. The left gets one extra set."],
  base: "Tall kneeling, pad under the knees, hips stacked over the knees.",
  brace: "Squeeze both glutes and keep the ribs down; the torso shouldn't twist or lean back.",
  grip: "Single handle, neutral grip, wrist straight.",
  rom: "Arm up and across in a full stretch to elbow tucked at the hip.",
  tempo: "2 sec pull, 1 sec squeeze, 3 sec return.",
  feel: "The lat on the working side, low and wide, and the opposite glute holding you still.",
  err: ["Twisting the torso to finish the rep", "Leaning back", "Shrugging the shoulder up", "Pulling with the biceps instead of the elbow"],
  back: "Kneeling with glutes squeezed keeps the L4 still; don't rotate through the low back. Left shoulder: work in the range that doesn't pinch.",
});
add("underhand-pulldown", {
  s: ["Set the thigh pad so your legs are locked in. Grab the bar palms facing you, hands about shoulder-width.", "Sit tall with a slight lean back from the hips, chest up.", "Pull the shoulders down first, then drive the elbows down to your sides until the bar reaches your upper chest.", "Squeeze, then take 3 seconds to let the bar back up until the arms are straight and the lats stretch."],
  base: "Seated, thighs under the pad, feet flat, slight lean back from the hips.",
  brace: "Ribs down and a light abs brace so you don't rock back to move the weight.",
  grip: "Underhand, shoulder-width, thumbs around the bar.",
  rom: "Arms straight with the lats stretched to bar at the upper chest.",
  tempo: "1–2 sec pull, 1 sec squeeze, 3 sec lower.",
  feel: "Lats, with more biceps than an overhand pulldown. Not the neck.",
  err: ["Leaning far back and rowing it", "Shoulders shrugging up at the top", "Cutting the stretch short", "Yanking with momentum"],
  back: "Seated and braced, so no load on the L4. Shoulders down before the elbows bend keeps the traps out. Underhand is an easier position for the left shoulder than a wide grip.",
});
add("bench-db-row", {
  s: ["Put the same-side knee and hand on a flat bench; the other foot is on the floor out to the side.", "Pick up the dumbbell and let it hang straight down so the shoulder blade stretches forward.", "Flat back, neck long, chest square to the floor.", "Drive the elbow back toward your hip (not up toward your ear), then squeeze.", "Lower slowly back to the full hang. Finish the side, then switch. One extra set on the left."],
  base: "One knee and one hand on the bench, back flat like a table, other foot planted.",
  brace: "Push the bench hand down and brace the abs so the torso doesn't twist as you row.",
  grip: "Neutral grip (palm facing in), wrist straight.",
  rom: "Full hang with the blade stretched to elbow at the hip.",
  tempo: "1–2 sec up, 1 sec squeeze, 3 sec down.",
  feel: "The lat and middle back on the working side.",
  err: ["Twisting the torso to lift it", "Rowing to the chest instead of the hip", "Shrugging", "Rounding the low back"],
  back: "Bench support unloads the L4; keep the back flat and don't twist. Elbow-to-hip keeps the upper traps out of it. Swapped in for the landmine Meadows row (no landmine at Planet Fitness).",
});
add("neutral-flat-db-press", {
  s: ["Sit on the end of a flat bench with the dumbbells on your thighs. Lie back and bring them to your chest, palms facing each other.", "Feet flat, shoulder blades pulled slightly back and down into the bench.", "Press up until the arms are straight over your chest.", "Lower slowly until the dumbbells are beside your chest and you feel a stretch, elbows tucked about 30° from your body."],
  base: "Lying flat, feet planted; head, upper back and hips on the bench.",
  brace: "Small natural arch only; ribs stay down. Push the feet into the floor.",
  grip: "Neutral (palms in), wrists stacked over the elbows.",
  rom: "Dumbbells beside the chest to arms straight.",
  tempo: "1–2 sec press, 3 sec lower.",
  feel: "Chest and triceps; the front of the shoulder only a little.",
  err: ["Elbows flaring out to 90°", "Bouncing off the bottom", "Big low-back arch", "Dropping too deep on the left side"],
  back: "Bench-supported; keep a small arch, not a big one, for the L4. Neutral grip and tucked elbows are easier on the left shoulder; stop lowering where it still feels good.",
});
add("cable-press-around", {
  s: ["Set a cable at chest height with a single handle. Stand side-on, a step away, in a split stance.", "Hold the handle at the side of your chest with the elbow bent.", "Press forward and across your body so the hand finishes past your midline, in front of the opposite shoulder.", "Squeeze the chest for a second, then let the arm come back slowly.", "Finish the side, then turn around."],
  base: "Split stance, front foot opposite the working arm, hips and shoulders square to the front.",
  brace: "Abs braced against the cable pulling you around; the hips don't turn.",
  grip: "Single handle, neutral, wrist straight.",
  rom: "Hand beside the chest to past the midline.",
  tempo: "2 sec press, 1 sec squeeze, 3 sec back.",
  feel: "Inner and middle chest on the working side.",
  err: ["Twisting the hips to finish", "Shoulder rolling forward", "Pressing straight ahead instead of across", "Too heavy to control"],
  back: "No spinal load; the core resists rotation, which suits the L4. Keep the left shoulder down and back as it presses.",
});
add("stir-the-pot", {
  s: ["Kneel behind a stability ball and put your forearms on top of it, elbows under the shoulders.", "Step the feet back into a plank, feet a bit wider than hips (knees down to make it easier).", "Brace so your body is one straight line from head to heels.", "Make small circles with your forearms, 6 one way, then 6 the other. The circles come from the shoulders, not the hips.", "Stop the set when the hips start to sag or pike."],
  base: "Plank with forearms on the ball, feet wider than hips.",
  brace: "Squeeze the glutes, tuck the ribs down and brace like you're about to be poked in the stomach.",
  grip: "Forearms and fists on the ball.",
  rom: "Small circles, about the size of a dinner plate.",
  tempo: "Slow: about 2 seconds per circle.",
  feel: "Abs working hard to keep the body still. Not the low back.",
  err: ["Hips sagging (low back arches)", "Hips piking up", "Circles too big", "Holding your breath"],
  back: "Anti-movement core work: the spine stays still, the approach McGill recommends with a disc issue. End the set when the low back starts to sag. Push the shoulders away from the ball so the traps don't shrug.",
});
add("side-lying-incline-lateral", {
  s: ["Set an incline bench to 30–45°. Lie on your side against the backrest, top arm holding a light dumbbell.", "Let the dumbbell hang down across the front of your body; this is the stretched position.", "Raise it out and up in a wide arc, elbow soft, until the arm is in line with your shoulder.", "Lower slowly all the way back to the stretch.", "Do one side, then turn over."],
  base: "Side-lying on the incline bench, bottom arm braced, legs staggered for balance.",
  brace: "Keep the torso still on the pad; no rocking.",
  grip: "Light dumbbell, neutral grip.",
  rom: "From hanging across the body (stretch) to the arm in line with the shoulder.",
  tempo: "2 sec up, 3 sec down.",
  feel: "The side delt on the cap of the shoulder. Not the trap at the base of the neck.",
  err: ["Going too heavy", "Shrugging toward the ear", "Swinging", "Cutting the bottom stretch"],
  back: "Fully supported, no load on the L4. The bench angle stops the upper traps helping. Left shoulder: if the top of the range pinches, stop a little lower.",
});
add("lean-away-lateral", {
  s: ["Stand side-on to a post or rack and hold it with the near hand, feet close to its base.", "Lean away until your holding arm is straight and your body is one straight line. Hold a dumbbell in the outside hand, hanging slightly across your body.", "Raise the dumbbell out to the side, elbow soft, to shoulder height.", "Lower slowly back past your hip to the stretched start.", "On the last set, finish with half reps in the bottom half until you can't."],
  base: "Feet together near the post, body leaning away in one straight line.",
  brace: "Glutes and abs tight so you don't bend at the waist.",
  grip: "Neutral grip, light dumbbell.",
  rom: "Dumbbell slightly across the body (stretch) to shoulder height.",
  tempo: "2 sec up, 3 sec down.",
  feel: "The side delt, especially low in the range.",
  err: ["Shrugging", "Swinging the body", "Raising above shoulder height", "Leaning so far you lose balance"],
  back: "Standing and light, so the L4 is fine; keep the ribs down. Stopping at shoulder height keeps the upper traps quiet. Swapped in for the machine lateral raise (none at Planet Fitness).",
});
add("bayesian-curl", {
  s: ["Set a cable at the bottom with a single handle. Take it in one hand and step forward, facing away from the stack, in a split stance.", "Let the arm trail behind your body so the biceps is fully stretched, elbow pointing down.", "Curl the handle up and forward, keeping the elbow back by your side; don't let it swing forward.", "Squeeze at the top, then lower slowly until the arm is straight behind you again.", "Finish one arm, then switch."],
  base: "Split stance facing away from the cable, chest up.",
  brace: "Light abs brace; don't lean forward to make it easier.",
  grip: "Underhand, wrist straight.",
  rom: "Arm straight behind the body to full curl.",
  tempo: "2 sec up, 1 sec squeeze, 3 sec down.",
  feel: "A big biceps stretch at the bottom, then the whole biceps working.",
  err: ["Elbow drifting forward", "Leaning to cheat", "Cutting the stretch short", "Shrugging"],
  back: "No spinal load. Left shoulder: the arm-behind stretch loads the front of the shoulder, so ease into it and stop short of any pinch.",
});
add("spider-curl", {
  s: ["Set an incline bench to about 45°. Lie chest-down on it with your chin just over the top.", "Let the dumbbells hang straight down, arms vertical, palms forward.", "Curl the dumbbells up without letting the elbows drift forward or back.", "Squeeze hard at the top for a second, then lower slowly to straight arms."],
  base: "Chest on the incline pad, feet on the floor.",
  brace: "Chest stays on the pad; no swinging possible.",
  grip: "Underhand, wrists straight.",
  rom: "Arms straight down to full curl.",
  tempo: "2 sec up, 1 sec squeeze, 3 sec down.",
  feel: "The biceps working hard at the top.",
  err: ["Elbows swinging back", "Lifting the chest off the pad", "Dropping the weights fast", "Going too heavy"],
  back: "Chest-supported, so no load on the L4. Arms hanging under you is an easy position for the left shoulder.",
});
add("seated-db-overhead-tri", {
  s: ["Sit on a bench with an upright back pad. Hold one dumbbell with both hands cupped under the top plate.", "Press it overhead until your arms are straight, elbows pointing forward.", "Keeping the upper arms still, lower the dumbbell behind your head by bending only at the elbows until you feel a deep triceps stretch.", "Extend back up to straight arms without locking hard."],
  base: "Seated, back flat on the pad, feet planted.",
  brace: "Ribs down and back on the pad; don't arch as the weight goes overhead.",
  grip: "Both hands under the top plate, thumbs around the handle.",
  rom: "Deep stretch behind the head to arms straight.",
  tempo: "3 sec down, 1–2 sec up.",
  feel: "Back of the upper arm, mostly the long head near the armpit.",
  err: ["Elbows flaring wide", "Arching the low back", "Not going deep enough", "Upper arms moving"],
  back: "Back-supported so the L4 stays put; keep the ribs down. Overhead is a hard spot for the left shoulder: start light, keep the elbows forward and only go as deep as stays pain-free. If it pinches, do it lying on a bench instead.",
});
add("smith-jm-press", {
  s: ["Set a flat bench under a Smith machine so the bar lines up over your upper chest. Grip it about shoulder-width, overhand.", "Unrack with straight arms over the upper chest. Set the safeties just above face height.", "Lower the bar by bending the elbows forward, letting it travel down and slightly back toward your chin. Elbows point toward your feet.", "Stop a few inches above the chin when the forearms meet the upper arms, then press back up by straightening the elbows."],
  base: "Lying flat, feet planted, shoulder blades lightly back.",
  brace: "Ribs down, glutes on the bench.",
  grip: "Close, overhand, about shoulder-width, wrists straight.",
  rom: "Arms straight to bar a few inches above the chin.",
  tempo: "3 sec down, 1–2 sec up.",
  feel: "Triceps, heavy, with some chest. No elbow pain.",
  err: ["Flaring the elbows out", "Bringing it to the chest like a bench press", "Letting it drop", "Going heavy too soon"],
  back: "Bench-supported, no L4 load. Tucked elbows keep the left shoulder comfortable. Always use the Smith safeties.",
});
add("reverse-cable-curl", {
  s: ["Attach a straight bar to a low cable. Stand facing it holding the bar palms down, hands shoulder-width.", "Elbows at your sides, arms straight.", "Curl the bar up by bending the elbows, palms staying down and wrists straight.", "Squeeze at the top, then lower slowly."],
  base: "Standing tall, feet hip-width, a small step back from the stack.",
  brace: "Light abs; no leaning back.",
  grip: "Overhand, shoulder-width, wrists straight.",
  rom: "Arms straight to full curl.",
  tempo: "2 sec up, 3 sec down.",
  feel: "Top of the forearm and the outer upper arm.",
  err: ["Wrists bending back", "Swinging", "Elbows drifting forward"],
  back: "Standing and light; nothing on the L4. Keep the shoulders down. Swapped in for the reverse EZ curl (cable bar is easy to find at Planet Fitness).",
});
add("fs3-easy-cardio", {
  s: ["Pick a treadmill or a bike.", "Treadmill: set an incline you can walk without holding the rails. Bike: a resistance you can pedal smoothly.", "Go at an easy pace for 20–30 minutes. You should be able to talk in full sentences.", "It's optional: skip it if your legs or back feel beat up."],
  base: "Tall posture on the treadmill, or seated upright on the bike.",
  brace: "Relaxed; just stand tall.",
  grip: "Hands free, or lightly on the bars.",
  rom: "Normal walking or pedalling.",
  tempo: "Easy and steady.",
  feel: "Warm and a bit out of breath, still able to talk.",
  err: ["Holding the rails and leaning back", "Going so hard it eats into recovery"],
  back: "Walking is one of the best things for a disc. Stay tall; don't hang on the rails.",
});
add("kb-foot-flex", {
  s: ["Sit on a bench with the working leg long and the heel resting on the floor or the bench edge.", "Hang a kettlebell (or wedge a dumbbell) over the top of the foot.", "Pull the toes up toward your shin against the weight.", "At the top, tense the whole leg (quad, back of the knee, calf) for 2 seconds.", "Lower slowly and repeat. Do 15, then switch legs."],
  base: "Seated, working heel resting, leg long.",
  brace: "Sit tall; nothing else moves.",
  grip: "The handle rests over the top of the foot; a hand can steady it.",
  rom: "Toes pointed down to pulled up as far as they go.",
  tempo: "2 sec up, 2 sec hold with the leg tensed, 2 sec down.",
  feel: "Front of the shin and the whole leg locking in, including around the right knee.",
  err: ["Going so heavy the ankle cramps", "Rushing", "Letting the weight slide off"],
  back: "Seated, no back load. This is your own move and you've said it helps, so it's the one thing kept from Fine Shyte 2's warm-ups.",
});
add("db-suitcase-squat", {
  s: ["Put two small plates (5–10 lb) on the floor for your heels. Stand with the heels on them, feet hip-width, toes slightly out.", "Hold a dumbbell in each hand at your sides, arms long.", "Brace, then sit straight down, knees travelling forward over the toes, torso upright.", "Go as deep as you can with a neutral low back, usually thighs about parallel.", "Drive up through the whole foot to standing."],
  base: "Heels raised on plates, feet hip-width, dumbbells hanging at your sides.",
  brace: "Big breath, brace the abs, ribs down before each rep.",
  grip: "Neutral, a dumbbell in each hand. Straps are fine if grip gives out first.",
  rom: "Standing to thighs about parallel, without the low back rounding.",
  tempo: "3 sec down, 1 sec pause, 1–2 sec up.",
  feel: "Quads, the front of the thighs. Not the low back.",
  err: ["Low back rounding at the bottom", "Leaning forward", "Knees caving in", "Dumbbells swinging"],
  back: "The load hangs at your hips, so there's no bar pressing on the L4 like a back squat. Stop before the low back tucks under. Grip may limit the weight; that's fine. Swapped in for the belt squat (none at Planet Fitness).",
});
add("sl-leg-press", {
  s: ["Sit in the leg press with your back and hips flat on the pad. Put one foot in the middle of the platform; rest the other on the frame.", "Release the safeties and lower the platform under control.", "Keep the knee tracking over your 2nd toe all the way down.", "Stop before your hips start to roll off the pad, then press back up without locking the knee.", "Right leg first, then the left."],
  base: "Back and hips flat on the pad, working foot mid-platform.",
  brace: "Hold the handles and press the low back into the pad.",
  grip: "Side handles.",
  rom: "As deep as the hips stay flat on the pad.",
  tempo: "3 sec down, 1–2 sec up.",
  feel: "Quad and glute on the working side.",
  err: ["Knee caving in", "Hips rolling up at the bottom", "Locking the knee hard", "Going too deep"],
  back: "Hips curling off the pad at the bottom bends the L4 under load, so stop short of that. One leg needs less total weight, which is easier on the back.",
});
add("sl-box-squat", {
  s: ["Stand in front of a box or bench about knee height. Hold a light dumbbell in the hand opposite the working leg.", "Stand on the working leg, the other foot just off the floor in front.", "Sit back and down slowly to touch the box, knee over the 2nd toe, hips level.", "Touch lightly (don't plop), then drive up through the whole foot to standing.", "Use a higher box to make it easier."],
  base: "One leg, foot flat, about a foot in front of the box.",
  brace: "Ribs down, hips level; don't let the free-side hip drop.",
  grip: "Light dumbbell, opposite hand, arm long.",
  rom: "Standing to a light touch on the box.",
  tempo: "3 sec down, light touch, 1–2 sec up.",
  feel: "Side glute and quad on the standing leg.",
  err: ["Knee diving in", "Plopping onto the box", "Hips tilting", "Rounding forward"],
  back: "Light and upright, no load on the L4. The opposite-hand weight trains the left lat, right glute and right knee as one line.",
});
add("poliquin-step-up", {
  s: ["Put a small plate on top of a low step (4–8 inches). Stand on the step with the working heel on the plate.", "Let the other foot hang off the side of the step.", "Bend the working knee, letting it drive forward over the toes, and lower the free heel toward the floor.", "Lightly tap the floor (or stop just above it), then straighten the working knee to stand back up.", "Do the right side first."],
  base: "One foot on the step with the heel raised, the other hanging off the edge.",
  brace: "Stand tall, hips level, a hand on a rack if you need balance.",
  grip: "Hands free or holding a rack lightly.",
  rom: "Standing to the free heel just touching the floor.",
  tempo: "3 sec down, 1–2 sec up.",
  feel: "The inner quad just above the knee.",
  err: ["Pushing off the bottom foot", "Hip dropping to one side", "Knee caving in", "Using too high a step"],
  back: "Bodyweight and upright; nothing on the L4. Builds the muscle that controls the right knee.",
});
add("leg-press-calf-partials", {
  s: ["Sit in the leg press and put the balls of your feet on the bottom edge of the platform, heels hanging off.", "Press the platform up with straight (not locked) knees. Keep the safeties close.", "Let the platform push your toes back toward your shins as far as it goes: the deep stretch.", "Push up only halfway, then return to the stretch. Stay in that bottom half for every rep.", "Pause a second in the stretch each rep."],
  base: "Back flat on the pad, balls of the feet on the platform edge.",
  brace: "Low back pressed into the pad.",
  grip: "Side handles.",
  rom: "Bottom half only: full stretch to about halfway up.",
  tempo: "1 sec up, 2 sec down, 1 sec pause in the stretch.",
  feel: "A deep calf stretch and burn.",
  err: ["Bending the knees", "Bouncing", "Feet slipping off the edge", "Going to the top"],
  back: "Seated and supported, no spinal load.",
});
add("copenhagen-side-plank", {
  s: ["Lie on your side next to a flat bench. Put your top leg's inner foot (or knee, for easier) on the bench.", "Prop up on your bottom forearm, elbow under the shoulder.", "Lift your hips so your body makes a straight line.", "Hold 20 seconds, breathing. Lower, then switch sides."],
  base: "Side plank, top leg on the bench, forearm on the floor.",
  brace: "Squeeze the top inner thigh into the bench and keep the hips stacked.",
  grip: "Forearm flat, fist relaxed.",
  rom: "Static hold.",
  tempo: "20-second hold.",
  feel: "Inner thigh of the top leg and the obliques.",
  err: ["Hips sagging", "Rolling forward", "Shoulder sinking", "Holding your breath"],
  back: "Spine-still side work, from McGill's side bridge family. Knee on the bench takes stress off the groin. Push the floor away so the shoulder doesn't sink.",
});
add("prone-y-t-raise", {
  s: ["Set an incline bench to about 30–45°. Lie chest-down, head just off the top, holding light plates or dumbbells.", "Let the arms hang straight down.", "Y: thumbs up, raise the arms up and forward into a Y in line with your ears. Pause, lower. Do 10.", "T: raise the arms straight out to the sides into a T, thumbs up, squeezing the shoulder blades together. Pause, lower. Do 10.", "Keep the neck long and the shoulders away from your ears the whole time."],
  base: "Chest on the incline pad, feet on the floor.",
  brace: "Chest stays on the pad; no arching up.",
  grip: "Very light plates or dumbbells, thumbs up.",
  rom: "Arms hanging to level with the body.",
  tempo: "2 sec up, 2 sec hold, 2 sec down.",
  feel: "Low and middle traps between and below the shoulder blades. Not the neck.",
  err: ["Shrugging toward the ears", "Going too heavy", "Lifting the chest off the pad", "Swinging"],
  back: "Chest-supported, no L4 load. Face-down is where the upper traps stay quietest in EMG studies. Left shoulder: if the Y pinches, widen the angle or stop lower.",
});
add("side-lying-er", {
  s: ["Lie on your side with the working arm on top. Put a rolled towel between that elbow and your ribs.", "Bend the top elbow to 90°, forearm across your stomach, holding a light dumbbell.", "Keeping the elbow pinned on the towel, rotate the forearm up toward the ceiling as far as is comfortable.", "Pause, then lower slowly back across your stomach.", "Left side first."],
  base: "Side-lying, head on your bottom arm or a pad, knees bent.",
  brace: "Don't roll back to lift the weight.",
  grip: "Light dumbbell, neutral grip.",
  rom: "Forearm across the stomach to as high as the shoulder rotates comfortably.",
  tempo: "2 sec up, 1 sec pause, 3 sec down.",
  feel: "Back of the shoulder, the small rotator cuff muscles.",
  err: ["Elbow lifting off the towel", "Rolling the body back", "Going heavy"],
  back: "No spinal load. Directly strengthens the left shoulder after the old hook injury, with the lowest upper-trap activity of the shoulder exercises tested.",
});
add("cable-1arm-shoulder-press", {
  s: ["Set a cable low with a single handle. Stand facing away from it with the handle at your shoulder.", "Step into a staggered stance with the foot opposite the working arm forward.", "Brace, then press the handle up and slightly forward until the arm is straight.", "Lower under control back to the shoulder.", "Finish one side, then switch arm and front foot."],
  base: "Staggered stance, opposite foot forward, hips square.",
  brace: "Ribs down, glutes tight. Don't lean back or arch to finish the rep.",
  grip: "Single handle, neutral (palm in), wrist straight.",
  rom: "Handle at the shoulder to arm straight overhead, in a pain-free range.",
  tempo: "1–2 sec press, 3 sec lower.",
  feel: "Front and side shoulder, and the core resisting the lean.",
  err: ["Arching the low back", "Shrugging", "Leaning to the side", "Pressing behind the head"],
  back: "Standing overhead can push the low back into an arch; keep the ribs down and the glutes squeezed. Left shoulder: neutral grip and a slightly forward path are friendlier; stop where it's still pain-free.",
});
add("kneeling-cable-high-row", {
  s: ["Set a cable high with a single handle. Kneel facing the stack about an arm's length away.", "Reach up and forward to take the handle, letting the shoulder blade stretch forward.", "Row the handle to your upper chest with the elbow out about 45° from your body, pulling the shoulder blade back.", "Squeeze 1 second, then let the arm reach forward and up again.", "One extra set on the left."],
  base: "Tall kneeling, hips over the knees.",
  brace: "Glutes tight, ribs down, torso square; no leaning back.",
  grip: "Single handle, neutral, wrist straight.",
  rom: "Arm reaching up and forward to hand at the upper chest.",
  tempo: "1–2 sec pull, 1 sec squeeze, 3 sec return.",
  feel: "Mid-back between the shoulder blades and the rear delt. Not the neck.",
  err: ["Shrugging", "Twisting", "Pulling down to the hip like a pulldown", "Leaning back"],
  back: "Kneeling and upright, no L4 load. Elbow at 45° with the blade going back (not up) keeps the upper traps from taking over. Swapped in for the machine high row (none at Planet Fitness).",
});
add("cable-rear-delt-fly", {
  s: ["Set both cables at shoulder height. Take the left cable in your right hand and the right cable in your left, so they cross in front of you.", "Step back to the middle with arms straight out in front at shoulder height.", "Sweep the arms out wide and back, elbows soft, until they're in line with your body.", "Pause, then let them come back across slowly."],
  base: "Standing between the cables, feet hip-width.",
  brace: "Ribs down; no leaning back.",
  grip: "Cable ends or handles, palms down or facing in.",
  rom: "Hands crossed in front to arms out wide in line with the body.",
  tempo: "2 sec out, 1 sec hold, 3 sec back.",
  feel: "Rear delts on the back of the shoulder.",
  err: ["Shrugging", "Bending the elbows into a row", "Leaning back", "Going too heavy"],
  back: "Standing and light, no L4 load. Pulls the shoulders back for posture; keep them down so the traps stay out.",
});
add("db-lateral-drop", {
  s: ["Set out three pairs of dumbbells: your 12-rep weight, about 30% lighter, and lighter again.", "Stand tall with the heaviest pair at your sides, elbows soft.", "Raise out to the sides to shoulder height, leading with the elbows. Do 12.", "Without resting, grab the lighter pair and do 10, then the lightest pair until you can't.", "Rest, then do the second round."],
  base: "Standing, feet hip-width, slight forward lean.",
  brace: "Ribs down; no swinging.",
  grip: "Neutral, relaxed grip.",
  rom: "Arms at your sides to shoulder height.",
  tempo: "2 sec up, 2 sec down.",
  feel: "Side delts burning.",
  err: ["Shrugging", "Swinging", "Raising above shoulder height", "Resting between drops"],
  back: "Standing and light; no L4 load. Stopping at shoulder height keeps the traps quiet and the left shoulder happy.",
});
add("serratus-punch", {
  s: ["Set an incline bench (30–45°) in front of a low cable, head end away from the stack. Lie back holding a single handle in one hand.", "Press the arm straight up toward the ceiling.", "Keeping the elbow straight, reach the fist further by sliding the shoulder blade forward around the ribs.", "Let the shoulder blade sink back to the bench slowly. The movement is only a few inches.", "Finish the side, then switch."],
  base: "Lying on the incline bench, feet flat.",
  brace: "Ribs down, back on the bench.",
  grip: "Single handle, neutral.",
  rom: "Arm straight throughout; shoulder blade back on the bench to fully reached forward.",
  tempo: "2 sec reach, 1 sec hold, 2 sec back.",
  feel: "Serratus on the side of the ribs, under the armpit.",
  err: ["Bending the elbow", "Shrugging toward the ear", "Rolling off the bench", "Going too heavy"],
  back: "Bench-supported, no L4 load. The serratus holds the shoulder blade flat on the ribs, which takes strain off the left shoulder and the upper traps.",
});
add("concentration-curl", {
  s: ["Sit on the end of a bench, feet wide. Hold a dumbbell in one hand.", "Lean forward from the hips and brace the back of that upper arm against your inner thigh.", "Let the arm hang straight, then curl the dumbbell up toward your shoulder.", "Squeeze hard at the top, then lower slowly to straight.", "Go straight into the reverse-grip pressdown on the same arm, then switch arms."],
  base: "Seated, feet wide, leaning forward from the hips.",
  brace: "Flat back; the free hand rests on the other knee for support.",
  grip: "Underhand.",
  rom: "Arm straight to full curl.",
  tempo: "2 sec up, 1 sec squeeze, 3 sec down.",
  feel: "The biceps, peaking at the top.",
  err: ["Swinging the torso", "Rounding the low back", "Lifting the elbow off the thigh"],
  back: "Hinge from the hips with a flat back and the free hand on the knee, so the L4 isn't slumped under load.",
});
add("reverse-grip-pressdown", {
  s: ["Set a cable high with a single handle. Hold it palm up, elbow bent and pinned at your side.", "Stand tall, a small step back.", "Straighten the elbow, pushing the handle down to your thigh with the palm facing up.", "Squeeze, then let it come back up slowly to about 90°.", "Do it right after the concentration curl on the same arm."],
  base: "Standing tall, feet hip-width.",
  brace: "Ribs down; don't lean over the handle.",
  grip: "Underhand (palm up), wrist straight.",
  rom: "Elbow at about 90° to straight.",
  tempo: "1–2 sec down, 1 sec squeeze, 2–3 sec up.",
  feel: "Triceps near the elbow.",
  err: ["Elbow drifting forward", "Leaning over it", "Wrist bending"],
  back: "Standing and light; nothing on the L4.",
});
add("half-kneeling-cable-lift", {
  s: ["Set a cable at the bottom with a rope. Half-kneel side-on to it, inside knee down, outside foot forward.", "Hold the rope with both hands down by the hip nearest the stack.", "Pull the rope up to your chest, then press it up and across in a diagonal past your far shoulder.", "Keep your hips and ribs facing forward; only the arms travel.", "Return slowly along the same line. Finish, then switch sides."],
  base: "Half-kneeling, pad under the knee, tall torso.",
  brace: "Glute on the kneeling side squeezed, ribs down.",
  grip: "Both hands on the rope.",
  rom: "From low by one hip to above the far shoulder.",
  tempo: "2 sec up, 2 sec down.",
  feel: "Obliques and deep core, plus the glute holding you still.",
  err: ["Twisting the torso", "Arching back at the top", "Going too heavy"],
  back: "Anti-rotation work that keeps the L4 still; don't twist through the low back to finish.",
});
add("sl-rdl-db", {
  s: ["Stand on the working leg with a soft knee. Hold a dumbbell in the opposite hand; rest the other hand on a rack if you want.", "Push the hips back and tip forward, letting the free leg float back in line with your body.", "Keep the back flat and the hips square to the floor; the dumbbell travels down close to the standing leg.", "Stop when you feel a big hamstring stretch or the back starts to round.", "Drive the hip forward to stand tall and squeeze the glute."],
  base: "Standing on one leg, soft knee, other leg floating back.",
  brace: "Brace the abs and keep the spine long from head to free heel.",
  grip: "Dumbbell in the hand opposite the standing leg.",
  rom: "Standing to torso about parallel, or until the hamstring stretch.",
  tempo: "3 sec down, 1–2 sec up.",
  feel: "Hamstring and glute on the standing leg.",
  err: ["Rounding the back", "Hips opening toward the ceiling", "Bending the standing knee a lot", "Going too heavy"],
  back: "Stop at the point the back would round; that's what loads the L4. Right leg working = left hand loaded, training the left lat–right glute line. Kettlebell swapped for a dumbbell.",
});
add("sl-ball-curl", {
  s: ["Lie on your back with one heel on top of a stability ball and the other leg up. Arms out on the floor.", "Lift your hips so your body is straight from shoulders to heel.", "Keeping the hips up, curl the ball in toward your butt with the heel.", "Pause, then roll it back out slowly until the leg is straight. The hips stay high.", "Use both feet on the ball if one leg is too hard at first."],
  base: "On your back, arms out wide, one heel on the ball.",
  brace: "Glutes squeezed so the hips don't drop.",
  grip: "Palms flat on the floor.",
  rom: "Leg straight to ball curled in under the knee.",
  tempo: "2 sec in, 1 sec squeeze, 3 sec out.",
  feel: "Hamstrings burning, plus the glute.",
  err: ["Hips dropping", "Arching the low back", "Rushing the roll out"],
  back: "Hips stay up with the glutes; the low back shouldn't arch. No spinal load. Swapped in for the Nordic curl (no anchor at Planet Fitness).",
});
add("prone-hip-ext", {
  s: ["Lie face-down on a flat bench with your hips at the end and both feet on the floor, holding the bench.", "Bend one knee to 90° and turn it slightly out (about 30°).", "Squeeze the glute and lift that thigh up until it's level with your body.", "Pause 1 second, then lower slowly.", "Finish the side, then switch."],
  base: "Face-down on the bench, hips at the edge, hands holding the bench.",
  brace: "Press the hips into the bench and keep the abs tight so the lift comes from the hip, not the back.",
  grip: "Hands holding the bench legs.",
  rom: "Foot down to thigh level with the body. No higher.",
  tempo: "1–2 sec up, 1 sec hold, 3 sec down.",
  feel: "The glute on the working side, top and outer part. You may feel the opposite lat switch on.",
  err: ["Arching the low back to lift higher", "Kicking with momentum", "Twisting the hips"],
  back: "Lifting past level arches the L4, so stop at level. In the EMG study this version made the opposite lat work harder (left lat with the right leg).",
});
add("cable-kickback-30", {
  s: ["Strap an ankle cuff to a low cable (bring your own; Planet Fitness may not have one). Face the stack and hold the frame.", "Hinge forward slightly from the hips, back flat, standing knee soft.", "Kick the strapped leg back and slightly out to the side (about 30°), squeezing the glute.", "Stop when the hip is straight; don't swing past it. Return slowly."],
  base: "Facing the stack, slight forward lean, holding the frame.",
  brace: "Abs tight so the low back doesn't arch as the leg goes back.",
  grip: "Hands on the machine frame.",
  rom: "Foot under the hip to hip fully straight.",
  tempo: "1–2 sec back, 1 sec squeeze, 2–3 sec return.",
  feel: "Upper and outer glute (the shelf).",
  err: ["Arching the low back", "Swinging", "Kicking too high", "Turning the hips"],
  back: "The low back arching at the top is the main risk for the L4; stop at a straight hip.",
});
add("backward-treadmill", {
  s: ["Stand on the treadmill facing away from the console, hands lightly on the side rails, safety clip on. Start the belt very slow.", "Add a small incline once you're comfortable.", "Walk backward with short steps, landing on the ball of the foot and pushing through the front of the thigh.", "Go 1 minute, then slow down or step off to rest. Repeat 6 times."],
  base: "Facing away from the console, upright.",
  brace: "Stand tall; don't lean back on the rails.",
  grip: "Hands light on the side rails.",
  rom: "Short backward steps.",
  tempo: "Slow belt; 6 × 1 minute.",
  feel: "Quads burning, especially just above the knee.",
  err: ["Going too fast", "Long steps", "Leaning on the rails", "No safety clip"],
  back: "Upright and unloaded: easy on the L4 and the right knee. Swapped in for the reverse sled drag (no sled at Planet Fitness).",
});
add("side-bridge-abduction", {
  s: ["Lie on your side, forearm down with the elbow under your shoulder, legs straight and stacked.", "Lift your hips into a side plank.", "Holding the plank, raise the top leg about 30–45°, toes pointing forward.", "Lower it slowly while keeping the hips up. Do 8, then switch sides.", "Bend the bottom knee to make it easier."],
  base: "Side plank on the forearm, legs stacked.",
  brace: "Hips high and stacked; don't roll back.",
  grip: "Forearm flat.",
  rom: "Top leg from resting to about 30–45° up.",
  tempo: "2 sec up, 2 sec down.",
  feel: "Side glute on both legs, plus the obliques.",
  err: ["Hips dropping", "Rolling backward", "Leg drifting forward", "Shoulder sinking"],
  back: "Side bridges are a McGill spine-still core move. Push the floor away so the shoulder doesn't sink.",
});
add("cable-hip-adduction", {
  s: ["Strap an ankle cuff to a low cable. Stand side-on with the strapped leg nearest the stack.", "Step away so the leg is pulled out to the side under tension. Hold the frame.", "Pull the leg across in front of the standing leg.", "Pause, then let it return slowly out to the side."],
  base: "Standing side-on, holding the frame, standing knee soft.",
  brace: "Stand tall; don't lean.",
  grip: "Hand on the frame.",
  rom: "Leg out to the side to across the midline.",
  tempo: "2 sec in, 1 sec squeeze, 3 sec out.",
  feel: "Inner thigh.",
  err: ["Leaning the torso", "Swinging", "Bending the moving knee a lot"],
  back: "Standing and light; no L4 load. Strong inner thighs keep the pelvis level under the side glutes and help the right knee.",
});
add("sl-calf-step", {
  s: ["Stand on one foot with the ball of the foot on the edge of a step, heel hanging off. Hold a rail.", "Lower the heel slowly as far as it goes and pause 2 seconds in the stretch.", "Rise up onto the ball of the foot as high as you can.", "Lower again. Do 12, then switch."],
  base: "One foot on the step edge, the other hooked behind.",
  brace: "Stand tall, hips level.",
  grip: "Rail for balance; a dumbbell in the other hand adds load.",
  rom: "Full stretch to full rise.",
  tempo: "1 sec up, 2 sec down, 2 sec pause at the bottom.",
  feel: "Calf.",
  err: ["Bouncing", "Bending the knee", "Rushing the stretch"],
  back: "Standing bodyweight; nothing on the L4.",
});
add("offset-front-rack-carry", {
  s: ["Lift one dumbbell to the front of your shoulder, elbow pointing forward and down, one end resting on the shoulder.", "Stand tall, ribs down, the other arm relaxed at your side.", "Walk 20 m with short, controlled steps without leaning away from the weight.", "Set it down, switch sides, and walk back."],
  base: "Standing tall, dumbbell at one shoulder.",
  brace: "Brace the abs on both sides so you stay perfectly upright.",
  grip: "Firm grip, wrist straight, elbow in front.",
  rom: "Static hold while walking.",
  tempo: "Slow, controlled steps.",
  feel: "Obliques on the opposite side, and the shoulder holding the weight steady.",
  err: ["Leaning away from the weight", "Shrugging the loaded shoulder", "Elbow flaring out", "Rushing"],
  back: "Loaded carries are a McGill favourite: the spine stays still while the core works. Keep the loaded shoulder down so the trap doesn't hike. Left shoulder: start light. Swapped in for the bottoms-up kettlebell carry.",
});
export const FORM_GUIDES = G;
export function formFor(id: string): FormGuide | undefined {
  return G[id];
}

/** A Vimeo search for the exact move name (round 6: no YouTube anywhere). A search URL is always valid; no specific video is assumed. */
export function demoUrl(exerciseId: string, customName?: string): string {
  const name = customName ?? exerciseById(exerciseId)?.name ?? exerciseId;
  const q = `${name} exercise`.replace(/[()]/g, "");
  return `https://vimeo.com/search?q=${encodeURIComponent(q)}`;
}

/** Best catalog match for free text ("lat pull down" -> Lat Pulldown). Used to suggest muscle credit for off-plan work. */
export function findExerciseByName(text: string): string | null {
  const norm = (v: string) => v.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
  const q = norm(text);
  if (q.length < 4) return null;
  const compact = q.replace(/ /g, "");
  let best: { id: string; score: number } | null = null;
  for (const e of exercises) {
    const n = norm(e.name);
    const nc = n.replace(/ /g, "");
    let score = 0;
    if (nc === compact) score = 100;
    else if (nc.includes(compact)) score = 60 + compact.length;
    else if (compact.includes(nc)) score = 50 + nc.length;
    else {
      const words = q.split(" ").filter((w) => w.length > 2);
      const hit = words.filter((w) => n.includes(w)).length;
      if (words.length && hit === words.length) score = 30 + hit * 5;
    }
    if (score > (best?.score ?? 0)) best = { id: e.id, score };
  }
  return best && best.score >= 35 ? best.id : null;
}
