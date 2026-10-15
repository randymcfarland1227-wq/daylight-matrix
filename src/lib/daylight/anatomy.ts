/**
 * Body learning hub content: groups, muscles (regions), details (sub-parts), joints and nerves, and how they connect.
 * Education only. Signs of overwork are common patterns, not a diagnosis.
 * Lyfta refs are links + hotlinked demos; the "how" text is our own short summary.
 */
import { GROUPS, REGIONS, SUBS, regionOfSub, subInfo, regionInfo, groupInfo, type GroupId, type RegionId, type SubId } from "./muscles";
import { JOINTS, type JointId } from "./joints";
import { DETAIL, referenceFor } from "./atlas";
import { NERVE_ATLAS } from "./nerveAtlas";

export type Kind = "group" | "muscle" | "detail" | "joint" | "nerve";
export type Ref = { slug: string; name: string; how: string };
export type Learn = {
  does: string;
  worksWith?: string[];
  opposes?: string[];
  joints?: string[];
  nerves?: string[];
  overwork?: string[];
  parts?: string[];
};
export type Guide = { growthTips?: string[]; growth?: Ref[]; recoveryTips?: string[]; recovery?: Ref[] };

// ---------- reusable Lyfta refs (slugs verified against lyfta.app sitemap, Oct 2026) ----------
const R = {
  chestStretch: { slug: "dynamic-chest-stretch-6lp", name: "Dynamic chest stretch", how: "Swing the arms open to shoulder height and back, easy range first, then a little wider." },
  reverseShoulder: { slug: "reverse-shoulder-stretch-7n8", name: "Reverse shoulder stretch", how: "Hands clasped behind you, lift them gently until the front of the shoulders and chest stretch. Keep the chest tall." },
  bentArmShoulder: { slug: "bent-arm-shoulder-stretch-7ni", name: "Cross-body shoulder stretch", how: "Bring one arm across the chest and hold it with the other forearm. Feel the back of the shoulder; keep the shoulder down." },
  rotationShoulder: { slug: "rotation-shoulder-stretch-7nj", name: "Shoulder rotation stretch", how: "Slow rotations through a comfortable range to warm the cuff before pressing or pulling." },
  pvcER: { slug: "pvc-external-rotation-9ls", name: "Stick external rotation", how: "Elbow tucked at the side, use a stick to ease the forearm outward. Gentle end range, no pinch." },
  bicepsStretch: { slug: "biceps-stretch-behind-the-back-71j", name: "Biceps stretch behind the back", how: "Hands behind you, palms down, slowly lift and turn the thumbs down until the front of the arm stretches." },
  tricepsStretch: { slug: "triceps-stretch-6w5", name: "Triceps stretch", how: "Reach one hand down the upper back and ease the elbow back with the other hand." },
  overheadTriceps: { slug: "overhead-triceps-stretch-6r1", name: "Overhead triceps stretch", how: "Arm overhead, elbow bent, gently pull the elbow behind the head. Ribs stay down." },
  wristFlexor: { slug: "wrist-flexor-stretch-7k0", name: "Wrist flexor stretch", how: "Arm straight, palm up, gently pull the fingers back toward you. Inner forearm stretch, no tingling." },
  wristExtensor: { slug: "wrist-extensor-stretch-7k9", name: "Wrist extensor stretch", how: "Arm straight, palm down, gently bend the wrist down. Outer forearm stretch." },
  sideNeck: { slug: "side-neck-stretch-6t9", name: "Side neck stretch", how: "Tilt the ear toward the shoulder, the opposite shoulder relaxed down. Breathe for 20–30 s." },
  trapNeck: { slug: "trap-and-neck-stretch-7in", name: "Trap and neck stretch", how: "Tilt and slightly turn the head down toward the armpit; a light hand assist only." },
  neckRotate: { slug: "rotating-neck-stretch-7jr", name: "Neck rotations", how: "Turn the head slowly side to side within a pain-free range." },
  chinTuck: { slug: "chin-tuck-8ia", name: "Chin tuck", how: "Glide the chin straight back (a double chin), hold 3–5 s, release. Trains the deep neck flexors." },
  trapRelease: { slug: "roll-ball-upper-trapezius-release-8uh", name: "Ball upper-trap release", how: "Lean a ball into the top of the shoulder against a wall and breathe; gentle pressure only." },
  childPose: { slug: "child-pose-6zp", name: "Child's pose", how: "Kneel, sit back to the heels and reach the arms forward. Breathe into the back and sides." },
  openBook: { slug: "open-book-stretch-9lr", name: "Open book", how: "Side-lying, knees bent, rotate the top arm open toward the floor behind you, following it with the eyes." },
  catCow: { slug: "cat-cow-stretch-9l6", name: "Cat–cow", how: "On hands and knees, slowly round then arch the spine, one segment at a time." },
  thoracicBridge: { slug: "thoracic-bridge-9kf", name: "Thoracic bridge", how: "From a crab position, lift the hips and reach one arm overhead to rotate through the upper back." },
  sideLat: { slug: "side-lat-stretch-7iy", name: "Standing side lat stretch", how: "Reach one arm overhead and lean away, feeling the side of the back and the armpit." },
  kneelingLat: { slug: "kneeling-lat-stretch-78s", name: "Kneeling lat stretch", how: "Hands on a bench, sit the hips back and let the chest sink until the lats stretch." },
  kneeChest: { slug: "knee-to-chest-stretch-6oz", name: "Knee to chest", how: "Lying on the back, hug one or both knees toward the chest. Low back and glutes relax." },
  cobra: { slug: "cobra-yoga-pose-71l", name: "Cobra", how: "Face-down, press up through the hands with hips down for a gentle front-body and ab stretch. Stop if the low back pinches." },
  obliqueStretch: { slug: "assisted-obliques-stretch-7r4", name: "Oblique stretch", how: "Side-bend away with the arm overhead, hips steady." },
  pigeon: { slug: "pigeon-hip-stretch-7mg", name: "Pigeon hip stretch", how: "Front shin across, back leg long; sink the hips until the outer hip and glute stretch. Knee should feel nothing." },
  piriformis: { slug: "piriformis-7ob", name: "Piriformis stretch", how: "Lying, cross one ankle over the other knee and pull the thighs toward you. Deep buttock stretch." },
  hip9090: { slug: "dynamic-90-90-hip-twist-9kh", name: "90/90 hip switch", how: "Sit with both knees bent at 90°, rotate the knees side to side, tall spine. Hip rotation mobility." },
  hipFlexorKneel: { slug: "kneeling-hip-flexor-stretch-6c6", name: "Kneeling hip flexor stretch", how: "Half-kneel, tuck the pelvis under (posterior tilt) and shift forward slightly. Front of the back hip stretches." },
  couch: { slug: "couch-stretch-9kj", name: "Couch stretch", how: "Back knee against a wall or bench, shin up; tuck the pelvis. Strong quad and hip flexor stretch; ease in." },
  worldGreatest: { slug: "world-greatest-stretch-74l", name: "World's greatest stretch", how: "Lunge, elbow to instep, then rotate the arm to the ceiling. Hips, upper back and hamstrings together." },
  quadStretch: { slug: "quadriceps-stretch-6zk", name: "Standing quad stretch", how: "Hold the ankle behind you, knees together, tuck the pelvis slightly." },
  hamStretch: { slug: "hamstring-stretch-724", name: "Hamstring stretch", how: "Heel forward, hinge at the hips with a flat back until the back of the thigh stretches." },
  butterfly: { slug: "butterfly-yoga-pose-71x", name: "Butterfly", how: "Seated, soles together, let the knees fall out; sit tall. Inner-thigh stretch." },
  calfStretch: { slug: "seated-calf-stretch--79p", name: "Calf stretch", how: "Straight-knee stretch for the gastrocnemius; bend the knee slightly to shift it into the soleus." },
  soleus: { slug: "soleus-7pi", name: "Soleus (bent-knee) stretch", how: "Bent-knee calf stretch to target the deeper soleus." },
  ankleCircles: { slug: "ankle-circles-797", name: "Ankle circles", how: "Slow full circles both ways to warm the ankle." },
  // growth extras (plan exercises are added automatically)
  wristCurl: { slug: "wrist-curl-6n", name: "Wrist curl", how: "Forearms on thighs, palms up, curl the weight up with the wrists only." },
  reverseWristCurl: { slug: "reverse-wrist-curl-7p", name: "Reverse wrist curl", how: "Palms down, lift the back of the hand; light weight, slow." },
  hipAdduction: { slug: "lever-seated-hip-adduction-10", name: "Seated hip adduction", how: "Squeeze the pads together under control, pause, return slowly." },
  nordic: { slug: "resistance-band-assisted-nordic-hamstring-curl-91i", name: "Band-assisted Nordic curl", how: "Kneeling, ankles anchored, lower the body forward slowly using the hamstrings; the band helps." },
  sidePlank: { slug: "side-plank-6t1", name: "Side plank", how: "Elbow under shoulder, body in a line, hips high. Obliques and glute med." },
  pullApart: { slug: "band-pull-apart-726", name: "Band pull-apart", how: "Arms straight in front, pull the band apart to the chest, squeezing the shoulder blades." },
  stepUp: { slug: "step-up-6h", name: "Step-up", how: "Step up through the whole front foot, finish tall; control the way down." },
  lateralRaise: { slug: "lateral-raise-77", name: "Lateral raise", how: "Raise the arms out to the sides to shoulder height, slight bend in the elbows." },
  hangingLegRaise: { slug: "hanging-leg-raise-6mk", name: "Hanging leg raise", how: "Hang, curl the pelvis up as the legs rise; no swinging." },
  serratus: { slug: "serratus-anterior-7pg", name: "Serratus anatomy (Lyfta)", how: "Lyfta's page on the serratus anterior and how to load it." },
} satisfies Record<string, Ref>;
export const LYFTA_REFS = R;

// ---------- nerves ----------
export type NerveId =
  | "nerve-cervical" | "nerve-brachial-plexus" | "nerve-axillary" | "nerve-musculocutaneous" | "nerve-radial" | "nerve-median" | "nerve-ulnar"
  | "nerve-suprascapular" | "nerve-long-thoracic" | "nerve-thoracodorsal" | "nerve-pectoral" | "nerve-accessory" | "nerve-dorsal-scapular"
  | "nerve-intercostal" | "nerve-dorsal-rami" | "nerve-lumbar-plexus" | "nerve-femoral" | "nerve-obturator" | "nerve-sacral-plexus"
  | "nerve-subscapular" | "nerve-iliohypogastric" | "nerve-ilioinguinal" | "nerve-lateral-femoral-cutaneous" | "nerve-saphenous" | "nerve-deep-fibular" | "nerve-superficial-fibular" | "nerve-sural"
  | "nerve-superior-gluteal" | "nerve-inferior-gluteal" | "nerve-sciatic" | "nerve-tibial" | "nerve-peroneal";
export type NervePath = { view: "front" | "back"; d: string };
export type NerveInfo = { id: NerveId; name: string; roots: string; major: boolean; learn: Learn; paths: NervePath[]; guide?: Guide };

export const NERVES: NerveInfo[] = [
  { id: "nerve-cervical", name: "Cervical nerve roots", roots: "C1–C8", major: true, paths: [{ view: "back", d: "M148 78 L146 92 L142 108" }, { view: "front", d: "M146 84 L140 100" }],
    learn: { does: "Eight pairs of nerves leave the neck. C1–C4 serve the neck and diaphragm (phrenic nerve, C3–C5); C5–T1 join to form the brachial plexus that runs the whole arm.", joints: ["neck"], nerves: ["nerve-brachial-plexus", "nerve-accessory"], worksWith: ["rg-traps"],
      overwork: ["Neck pain that spreads into the shoulder blade or arm", "Tingling or numbness in particular fingers (thumb side ≈ C6, middle finger ≈ C7, little finger ≈ C8)", "Arm weakness. Progressive weakness or symptoms in both arms or legs need prompt medical review."] },
    guide: { recoveryTips: ["Gentle neck mobility and posture breaks.", "Avoid holding the head jutted forward under load (e.g. shrugs, carries)."], recovery: [R.chinTuck, R.neckRotate] } },
  { id: "nerve-brachial-plexus", name: "Brachial plexus", roots: "C5–T1", major: true, paths: [{ view: "front", d: "M140 98 C130 108 116 118 104 128" }],
    learn: { does: "A network in the neck and armpit that splits into every nerve of the arm: axillary, musculocutaneous, radial, median and ulnar, plus nerves to the chest, lats, serratus and shoulder blade muscles.", joints: ["neck", "shoulder"],
      nerves: ["nerve-cervical", "nerve-axillary", "nerve-musculocutaneous", "nerve-radial", "nerve-median", "nerve-ulnar", "nerve-pectoral", "nerve-thoracodorsal", "nerve-long-thoracic", "nerve-suprascapular", "nerve-dorsal-scapular"],
      overwork: ["A brief burning or electric 'stinger' down one arm after a hit or a sudden neck stretch", "Heaviness, tingling or a dead-arm feeling with the arms overhead or carrying heavy loads (can be thoracic-outlet type irritation)"] },
    guide: { recoveryTips: ["Ease off heavy carries and overhead holds while symptoms are active.", "Open the chest and keep the shoulder blades moving."], recovery: [R.chestStretch, R.chinTuck] } },
  { id: "nerve-axillary", name: "Axillary nerve", roots: "C5–C6", major: true, paths: [{ view: "back", d: "M106 130 C98 134 93 141 94 150" }],
    learn: { does: "Wraps behind the top of the upper arm to power the deltoid and teres minor, and gives feeling to a patch of skin on the outer shoulder.", joints: ["shoulder"], worksWith: ["rg-delt-front", "rg-delt-side", "rg-delt-rear", "rotator-cuff"], nerves: ["nerve-brachial-plexus"],
      overwork: ["Weakness lifting the arm out to the side", "A numb patch over the outer shoulder (classically after a dislocation)"] } },
  { id: "nerve-musculocutaneous", name: "Musculocutaneous nerve", roots: "C5–C7", major: true, paths: [{ view: "front", d: "M102 130 C94 160 86 185 78 206 L68 248" }],
    learn: { does: "Powers the biceps, brachialis and coracobrachialis (elbow bending), then gives feeling to the outer forearm.", joints: ["elbow", "shoulder"], worksWith: ["rg-biceps"], nerves: ["nerve-brachial-plexus"],
      overwork: ["Rare in training. Numbness on the outer forearm after heavy elbow work can come from its skin branch at the elbow."] } },
  { id: "nerve-radial", name: "Radial nerve", roots: "C5–T1", major: true, paths: [{ view: "back", d: "M106 132 C96 155 86 176 82 200 C76 230 66 260 58 286" }],
    learn: { does: "Spirals behind the upper arm to power the triceps, brachioradialis and all the wrist and finger extensors. Gives feeling to the back of the hand on the thumb side.", joints: ["elbow", "wrist"], worksWith: ["rg-triceps", "forearm-extensors"], nerves: ["nerve-brachial-plexus"],
      overwork: ["Trouble lifting the wrist (wrist drop) after pressure on the upper arm", "Numbness on the back of the thumb and hand", "Outer-elbow / forearm ache with heavy gripping can involve a deep branch"] } },
  { id: "nerve-median", name: "Median nerve", roots: "C5–T1", major: true, paths: [{ view: "front", d: "M106 132 C100 165 90 195 80 212 C72 240 66 265 62 288" }],
    learn: { does: "Runs down the middle of the arm and through the carpal tunnel. Powers most forearm flexors and the thumb muscles; feeling to the thumb, index, middle and half the ring finger.", joints: ["elbow", "wrist"], worksWith: ["forearm-flexors"], nerves: ["nerve-brachial-plexus"],
      overwork: ["Tingling or numbness from thumb to ring finger, often at night or while gripping (carpal-tunnel pattern)", "Clumsy pinch or a weaker thumb"] },
    guide: { recoveryTips: ["Neutral wrists on presses and push-ups.", "Vary grips; take breaks from long hard gripping."], recovery: [R.wristFlexor] } },
  { id: "nerve-ulnar", name: "Ulnar nerve", roots: "C8–T1", major: true, paths: [{ view: "front", d: "M110 134 C108 170 100 200 92 214 C84 242 76 268 70 290" }],
    learn: { does: "Passes behind the inner elbow (the 'funny bone'). Powers one wrist flexor, part of the deep finger flexors and most small hand muscles; feeling to the little and half the ring finger.", joints: ["elbow", "wrist"], worksWith: ["forearm-flexors"], nerves: ["nerve-brachial-plexus"],
      overwork: ["Tingling in the ring and little fingers after long periods with the elbow bent (cubital-tunnel pattern)", "Weak pinch or grip, hand clumsiness"] },
    guide: { recoveryTips: ["Avoid leaning on the inner elbow.", "Don't sleep or sit for long with the elbows fully bent."], recovery: [R.wristFlexor] } },
  { id: "nerve-suprascapular", name: "Suprascapular nerve", roots: "C5–C6", major: false, paths: [],
    learn: { does: "Crosses the top of the shoulder blade to power the supraspinatus and infraspinatus of the rotator cuff.", worksWith: ["rotator-cuff"], joints: ["shoulder"], nerves: ["nerve-brachial-plexus"], overwork: ["Deep ache behind the shoulder with weak outward rotation (uncommon; seen in overhead athletes)"] } },
  { id: "nerve-long-thoracic", name: "Long thoracic nerve", roots: "C5–C7", major: false, paths: [],
    learn: { does: "Runs down the side of the ribs to the serratus anterior, which holds the shoulder blade flat against the ribs.", worksWith: ["serratus"], joints: ["shoulder"], nerves: ["nerve-brachial-plexus"], overwork: ["Shoulder blade lifting off the ribs (winging) when pushing against a wall"] } },
  { id: "nerve-thoracodorsal", name: "Thoracodorsal nerve", roots: "C6–C8", major: false, paths: [], learn: { does: "Supplies the latissimus dorsi.", worksWith: ["lats"], joints: ["shoulder"], nerves: ["nerve-brachial-plexus"] } },
  { id: "nerve-pectoral", name: "Pectoral nerves (lateral & medial)", roots: "C5–T1", major: false, paths: [], learn: { does: "Supply the pectoralis major and minor.", worksWith: ["rg-chest"], joints: ["shoulder"], nerves: ["nerve-brachial-plexus"] } },
  { id: "nerve-accessory", name: "Accessory nerve (cranial nerve XI)", roots: "Brainstem / upper cervical", major: false, paths: [],
    learn: { does: "A cranial nerve that powers the trapezius and sternocleidomastoid (shrugging, turning the head).", worksWith: ["traps-upper", "traps-lower", "rhomboids"], joints: ["neck", "shoulder"], nerves: ["nerve-cervical"], overwork: ["Weak shrug or a drooping shoulder (rare, usually after surgery or injury to the neck)"] } },
  { id: "nerve-dorsal-scapular", name: "Dorsal scapular nerve", roots: "C5", major: false, paths: [], learn: { does: "Supplies the rhomboids and levator scapulae.", worksWith: ["rhomboids"], joints: ["shoulder"], nerves: ["nerve-brachial-plexus"], overwork: ["Ache along the inner edge of the shoulder blade"] } },
  { id: "nerve-intercostal", name: "Intercostal & thoracoabdominal nerves", roots: "T1–T12", major: false, paths: [],
    learn: { does: "Run between the ribs. The lower ones (T7–T12) wrap around to supply the abs, obliques and transverse abdominis, and the skin of the trunk.", worksWith: ["rg-abs", "rg-obliques"], joints: ["tspine"], overwork: ["A band of pain or tingling around the ribs on one side (seek review if it comes with a rash)"] } },
  { id: "nerve-dorsal-rami", name: "Dorsal rami of spinal nerves", roots: "C1–S5", major: false, paths: [],
    learn: { does: "Small back branches of every spinal nerve. They supply the spinal erectors and multifidus and the skin of the back.", worksWith: ["erectors"], joints: ["neck", "tspine", "lumbar"], overwork: ["Local back muscle ache and stiffness (most back pain is not a nerve problem)"] } },
  { id: "nerve-lumbar-plexus", name: "Lumbar plexus", roots: "L1–L4", major: true, paths: [{ view: "front", d: "M146 250 C140 266 134 280 130 292" }],
    learn: { does: "A network inside the psoas that gives the femoral, obturator and several skin nerves of the groin and thigh, and supplies the hip flexors.", joints: ["lumbar", "hip"], worksWith: ["hip-flexors"], nerves: ["nerve-femoral", "nerve-obturator"],
      overwork: ["Burning or numb outer thigh, often from tight belts or long sitting (lateral femoral cutaneous nerve)", "Front-of-thigh or groin pain that changes with back position"] } },
  { id: "nerve-femoral", name: "Femoral nerve", roots: "L2–L4", major: true, paths: [{ view: "front", d: "M130 292 C126 320 122 360 122 410 C124 450 128 500 128 540" }],
    learn: { does: "Powers the quadriceps, iliacus and sartorius (straightening the knee, lifting the thigh). Its saphenous branch gives feeling down the inner shin.", joints: ["hip", "knee"], worksWith: ["rg-quads", "hip-flexors"], nerves: ["nerve-lumbar-plexus"],
      overwork: ["Knee giving way from quad weakness", "Numbness on the front thigh or inner shin"] },
    guide: { recoveryTips: ["Hip flexor and quad mobility, but stop a stretch that causes tingling."], recovery: [R.hipFlexorKneel, R.quadStretch] } },
  { id: "nerve-obturator", name: "Obturator nerve", roots: "L2–L4", major: true, paths: [{ view: "front", d: "M136 292 C136 310 134 340 132 370" }],
    learn: { does: "Supplies the adductors (inner thigh) and the gracilis; feeling to a patch of the inner thigh.", joints: ["hip"], worksWith: ["rg-adductors"], nerves: ["nerve-lumbar-plexus"], overwork: ["Deep inner-thigh or groin ache with weakness pulling the leg in"] } },
  { id: "nerve-sacral-plexus", name: "Sacral plexus", roots: "L4–S4", major: true, paths: [{ view: "back", d: "M146 270 C140 284 132 296 126 306" }],
    learn: { does: "A network on the back wall of the pelvis that forms the sciatic, superior and inferior gluteal, pudendal and posterior thigh skin nerves.", joints: ["lumbar", "si", "hip"], nerves: ["nerve-sciatic", "nerve-superior-gluteal", "nerve-inferior-gluteal"],
      overwork: ["Buttock pain spreading down the back of the leg", "Saddle-area numbness or bladder/bowel change is an emergency: get urgent care"] } },
  { id: "nerve-superior-gluteal", name: "Superior gluteal nerve", roots: "L4–S1", major: false, paths: [],
    learn: { does: "Supplies the glute med, glute min and TFL, which keep the pelvis level on one leg.", worksWith: ["glute-med", "glute-min", "tfl"], joints: ["hip"], nerves: ["nerve-sacral-plexus"], overwork: ["Hip dropping on the free-leg side when standing on one leg (Trendelenburg sign)"] } },
  { id: "nerve-inferior-gluteal", name: "Inferior gluteal nerve", roots: "L5–S2", major: false, paths: [], learn: { does: "Supplies the glute max.", worksWith: ["glute-max"], joints: ["hip"], nerves: ["nerve-sacral-plexus"], overwork: ["Weak hip extension (climbing stairs, standing from a chair)"] } },
  { id: "nerve-sciatic", name: "Sciatic nerve", roots: "L4–S3", major: true, paths: [{ view: "back", d: "M126 306 C124 340 120 380 118 410" }],
    learn: { does: "The body's largest nerve. Runs under the glutes and down the back of the thigh, supplies the hamstrings and part of the adductor magnus, then splits at the knee into the tibial and common peroneal nerves.", joints: ["hip", "knee", "si"], worksWith: ["rg-hamstrings", "glute-max"], nerves: ["nerve-sacral-plexus", "nerve-tibial", "nerve-peroneal"],
      overwork: ["Pain from the buttock down the back of the leg, especially below the knee ('sciatica')", "Tingling or numbness in the foot; worse with sitting, coughing or deep hamstring stretches", "Foot weakness, saddle numbness or bladder/bowel change need urgent review"] },
    guide: { recoveryTips: ["Keep moving gently; long sitting often aggravates it.", "Back off hard hamstring and piriformis stretches if they bring on tingling; nerve-friendly mobility should feel easy."], recovery: [R.kneeChest, R.catCow] } },
  { id: "nerve-tibial", name: "Tibial nerve", roots: "L4–S3", major: true, paths: [{ view: "back", d: "M118 410 C118 450 120 500 122 546" }],
    learn: { does: "Continues down the back of the calf to power the gastrocnemius, soleus and deep toe flexors, then passes behind the inner ankle to the sole of the foot.", joints: ["knee", "ankle"], worksWith: ["gastroc", "soleus"], nerves: ["nerve-sciatic"], overwork: ["Burning or tingling in the sole of the foot (tarsal-tunnel pattern)", "Weak push-off"] } },
  { id: "nerve-peroneal", name: "Common peroneal (fibular) nerve", roots: "L4–S2", major: true, paths: [{ view: "back", d: "M118 410 C110 416 106 424 106 432" }, { view: "front", d: "M106 428 C106 460 110 500 116 540" }],
    learn: { does: "Wraps around the head of the fibula just below the outer knee. Its deep branch lifts the foot and toes (tibialis anterior); its superficial branch turns the foot out and gives feeling to the top of the foot.", joints: ["knee", "ankle"], worksWith: ["tibialis"], nerves: ["nerve-sciatic"],
      overwork: ["Foot slapping or catching the toes (foot drop)", "Numb top of the foot, e.g. after sitting cross-legged; it sits close to the skin at the outer knee"] } },
];
// Complete the selected nerve library, including smaller branches with no drawn route.
for (const [id, n] of Object.entries(NERVE_ATLAS)) {
  let entry = NERVES.find(x => x.id === id);
  if (!entry) {
    entry = { id: id as NerveId, name: n.name, roots: n.roots, major: false, paths: [], learn: { does: n.motor } };
    NERVES.push(entry);
  }
  entry.name = n.name;
  entry.roots = n.roots;
  entry.learn = { does: `${n.route} ${n.motor}`, worksWith: n.powers, nerves: n.connected, joints: n.joints, parts: n.branches, overwork: [n.signs] };
  // Stretch demos are muscle mobility, not a treatment for a nerve lesion.
  entry.guide = { recoveryTips: [n.habit, "Stop movement that brings on electrical pain, numbness or tingling; nerve glides require individual guidance."] };
}
export const NERVE_BY_ID = new Map(NERVES.map((n) => [n.id, n]));

// ---------- muscle-level (region) content ----------
const LR: Record<RegionId, Learn & { guide: Guide }> = {
  "rg-chest": { does: "Pulls the arm across the body and forward (pressing, hugging), and turns the arm inward. The serratus on the ribs moves the shoulder blade forward around the ribcage.", worksWith: ["rg-delt-front", "rg-triceps"], opposes: ["rg-midback", "rg-delt-rear"], joints: ["shoulder"], nerves: ["nerve-pectoral", "nerve-long-thoracic"],
    overwork: ["Front-of-shoulder ache during or after pressing", "Rounded, tight-feeling shoulders", "Sudden pain or a pop near the armpit with bruising needs assessment"],
    guide: { growthTips: ["Presses through a full, controlled range; incline angles bias the upper chest.", "10–20 hard sets a week is a common growth range."], recoveryTips: ["Open the chest after pressing days; balance with rows and rear-delt work."], recovery: [R.chestStretch, R.reverseShoulder] } },
  "rg-delt-front": { does: "Raises the arm forward and helps every press.", worksWith: ["rg-chest", "rg-triceps", "rg-delt-side"], opposes: ["rg-delt-rear", "rg-lats"], joints: ["shoulder"], nerves: ["nerve-axillary"],
    overwork: ["Ache at the front of the shoulder when pressing or raising the arm", "Painful clicking"], guide: { growthTips: ["Usually gets plenty of work from presses; direct raises are optional."], recoveryTips: ["Stretch the front of the shoulder and keep pulling volume at least equal to pressing."], recovery: [R.reverseShoulder, R.bicepsStretch] } },
  "rg-delt-side": { does: "Lifts the arm out to the side (with the supraspinatus starting the motion). Gives the shoulder its width.", worksWith: ["traps-upper", "rotator-cuff", "rg-delt-front"], opposes: ["rg-lats"], joints: ["shoulder"], nerves: ["nerve-axillary"],
    overwork: ["Pinching at the top of the shoulder when lifting the arm above shoulder height"], guide: { growthTips: ["Lateral raises in many forms; cables keep tension at the bottom.", "Light to moderate loads, high effort."], growth: [R.lateralRaise], recoveryTips: ["Keep raises in the scapular plane (slightly forward) if the top of the shoulder pinches."], recovery: [R.rotationShoulder, R.bentArmShoulder] } },
  "rg-delt-rear": { does: "Pulls the arm back and out (reverse fly) and turns it outward with the rotator cuff. Balances all the pressing.", worksWith: ["rg-midback", "rotator-cuff"], opposes: ["rg-chest", "rg-delt-front"], joints: ["shoulder"], nerves: ["nerve-axillary", "nerve-suprascapular"],
    overwork: ["Ache at the back of the shoulder", "Fatigue that shows up as shrugging during face pulls"], guide: { growthTips: ["Reverse flys and face pulls with a pause; rows with elbows flared."], growth: [R.pullApart], recoveryTips: ["Cross-body stretch and external-rotation mobility."], recovery: [R.bentArmShoulder, R.pvcER] } },
  "rg-traps": { does: "The upper traps lift and rotate the shoulder blade upward (shrugging, reaching overhead) and steady the neck.", worksWith: ["rg-delt-side", "serratus", "traps-lower"], opposes: ["rg-lats", "traps-lower"], joints: ["neck", "shoulder"], nerves: ["nerve-accessory", "nerve-cervical"],
    overwork: ["Tension at the top of the shoulders and neck", "Tension-type headaches", "Stiffness turning the head"], guide: { growthTips: ["Shrugs and heavy carries."], recoveryTips: ["Neck mobility and chin tucks; don't let the shoulders creep up during pulls and curls."], recovery: [R.sideNeck, R.trapNeck, R.trapRelease, R.chinTuck] } },
  "rg-midback": { does: "The rhomboids and middle traps pull the shoulder blades together; the lower traps draw them down and help rotate them upward for overhead reaching.", worksWith: ["rg-delt-rear", "rg-lats"], opposes: ["rg-chest", "serratus"], joints: ["shoulder", "tspine"], nerves: ["nerve-dorsal-scapular", "nerve-accessory"],
    overwork: ["Burning or a 'knot' between the shoulder blades (often fatigue or posture rather than weakness)"], guide: { growthTips: ["Rows with a pause and full shoulder-blade squeeze; Y-raises for the lower traps."], growth: [R.pullApart], recoveryTips: ["Move the upper back: rotations and gentle rounding."], recovery: [R.childPose, R.openBook, R.catCow] } },
  "rg-lats": { does: "Pull the arm down and back toward the body (pull-ups, rows) and turn it inward. Through the back's fascia they also help stiffen the low back.", worksWith: ["rg-biceps", "rg-delt-rear", "rg-midback"], opposes: ["rg-delt-front", "rg-delt-side"], joints: ["shoulder", "tspine", "lumbar"], nerves: ["nerve-thoracodorsal"],
    overwork: ["Tightness that limits reaching overhead (the low back arches instead)", "Ache in the armpit or side of the back"], guide: { growthTips: ["Vertical pulls and rows with a full stretch at the top."], recoveryTips: ["Lat stretches before overhead work."], recovery: [R.sideLat, R.kneelingLat, R.childPose] } },
  "rg-lowback": { does: "The spinal erectors and multifidus hold the spine upright, resist bending forward and extend the back.", worksWith: ["rg-glutes", "rg-hamstrings", "transverse"], opposes: ["rg-abs"], joints: ["lumbar", "tspine", "si"], nerves: ["nerve-dorsal-rami"],
    overwork: ["Stiff, achy or 'pumped' low back after hinging", "Pain spreading below the knee, leg numbness or weakness points to a nerve (see Sciatic)", "Saddle numbness or bladder/bowel change: urgent care"], guide: { growthTips: ["Back extensions, bird-dogs and hinges with a neutral spine; build gradually."], recoveryTips: ["Walks, gentle flexion and extension, and avoiding long static sitting."], recovery: [R.kneeChest, R.catCow, R.childPose] } },
  "rg-biceps": { does: "Bend the elbow and turn the palm up; the long head also helps raise the arm. The brachialis underneath is a pure elbow flexor.", worksWith: ["brachialis", "forearm-extensors", "rg-lats"], opposes: ["rg-triceps"], joints: ["elbow", "shoulder"], nerves: ["nerve-musculocutaneous", "nerve-radial"],
    overwork: ["Ache at the front of the elbow after heavy curls or pulls", "Pain at the front of the shoulder (long-head tendon)"], guide: { growthTips: ["Curls in stretched (incline) and shortened (preacher) positions."], recoveryTips: ["Biceps stretch; vary grips on pulling days."], recovery: [R.bicepsStretch] } },
  "rg-triceps": { does: "Straighten the elbow; the long head also pulls the arm down and back.", worksWith: ["rg-chest", "rg-delt-front", "rg-lats"], opposes: ["rg-biceps"], joints: ["elbow", "shoulder"], nerves: ["nerve-radial"],
    overwork: ["Pain at the point of the elbow on pressdowns, skull crushers or dips"], guide: { growthTips: ["Overhead extensions stretch the long head; pressdowns hit the lateral head."], recoveryTips: ["Swap to cables or neutral grips if the elbow complains."], recovery: [R.tricepsStretch, R.overheadTriceps] } },
  "rg-forearms": { does: "The flexors (palm side) bend the wrist and fingers for grip; the extensors (back side) lift the wrist and steady the grip. The brachioradialis helps bend the elbow.", worksWith: ["rg-biceps", "rg-lats", "rg-traps"], joints: ["wrist", "elbow"], nerves: ["nerve-median", "nerve-ulnar", "nerve-radial"],
    overwork: ["Inner-elbow pain with gripping (flexor tendon, golfer's-elbow pattern)", "Outer-elbow pain lifting with the palm down (extensor tendon, tennis-elbow pattern)", "Finger tingling points to a nerve rather than muscle"], guide: { growthTips: ["Carries, wrist curls, reverse curls and hammer curls."], growth: [R.wristCurl, R.reverseWristCurl], recoveryTips: ["Wrist stretches both ways; reduce gripping volume for a week if the elbow is sore."], recovery: [R.wristFlexor, R.wristExtensor] } },
  "rg-abs": { does: "Curl the ribcage toward the pelvis, tilt the pelvis back and resist arching. The deep transverse abdominis braces the trunk like a corset.", worksWith: ["rg-obliques", "hip-flexors", "rg-lowback"], opposes: ["rg-lowback"], joints: ["lumbar"], nerves: ["nerve-intercostal"],
    overwork: ["Sore abs that hurt to cough or laugh", "A bulge near the navel or groin when straining: get it checked"], guide: { growthTips: ["Weighted crunches, reverse crunches and leg raises; anti-extension holds like dead bugs."], growth: [R.hangingLegRaise], recoveryTips: ["Gentle extension and breathing work."], recovery: [R.cobra] } },
  "rg-obliques": { does: "Rotate and side-bend the trunk, and mostly resist twisting and leaning under load.", worksWith: ["rg-abs", "transverse", "glute-med"], joints: ["lumbar", "tspine"], nerves: ["nerve-intercostal"],
    overwork: ["Sharp pain in the side when twisting or breathing deeply (side strain)"], guide: { growthTips: ["Pallof presses, side planks, suitcase carries."], growth: [R.sidePlank], recoveryTips: ["Side-bend and rotation mobility."], recovery: [R.obliqueStretch, R.openBook] } },
  "rg-glutes": { does: "Glute max extends and turns the hip out (standing up, climbing, sprinting). Glute med and min and the TFL lift the leg out and keep the pelvis level on one leg.", worksWith: ["rg-hamstrings", "rg-adductors", "rg-lowback"], opposes: ["hip-flexors"], joints: ["hip", "si", "lumbar", "knee"], nerves: ["nerve-inferior-gluteal", "nerve-superior-gluteal"],
    overwork: ["Deep buttock ache after hinging or lunges", "Outer-hip pain lying on that side (glute tendon pattern)", "Buttock pain running down the leg can be the sciatic nerve"], guide: { growthTips: ["Hip thrusts, lunges, step-ups and hinges; band and cable abduction for glute med."], growth: [R.stepUp], recoveryTips: ["Hip rotation mobility and glute stretches."], recovery: [R.pigeon, R.piriformis, R.hip9090] } },
  "rg-quads": { does: "Straighten the knee. The rectus femoris also lifts the thigh; the inner vastus medialis helps the kneecap track.", worksWith: ["rg-glutes", "rg-adductors"], opposes: ["rg-hamstrings"], joints: ["knee", "hip"], nerves: ["nerve-femoral"],
    overwork: ["Pain at the front of the knee or just below the kneecap with squats, lunges or stairs", "Tight front thigh that pulls the pelvis forward"], guide: { growthTips: ["Squat patterns, leg press, split squats and leg extensions through full knee bend."], recoveryTips: ["Quad and hip flexor stretches; reduce deep knee loading for a while if the tendon is sore."], recovery: [R.quadStretch, R.couch, R.hipFlexorKneel] } },
  "rg-adductors": { does: "Pull the legs together and steady the pelvis; the big adductor magnus also helps extend the hip like a hamstring.", worksWith: ["rg-glutes", "rg-hamstrings", "rg-quads"], opposes: ["glute-med", "tfl"], joints: ["hip", "knee"], nerves: ["nerve-obturator", "nerve-sciatic"],
    overwork: ["Groin pain, especially in wide stances, side lunges or sprinting"], guide: { growthTips: ["Adduction machine, wide-stance squats and side lunges."], growth: [R.hipAdduction], recoveryTips: ["Gentle inner-thigh stretches."], recovery: [R.butterfly] } },
  "rg-hamstrings": { does: "Bend the knee and extend the hip; they slow the leg down when running.", worksWith: ["rg-glutes", "rg-adductors", "gastroc"], opposes: ["rg-quads", "hip-flexors"], joints: ["hip", "knee"], nerves: ["nerve-sciatic"],
    overwork: ["Tightness or a pull felt mid-thigh", "Pain at the sit bone when sitting or hinging (upper tendon)", "Tingling down the leg while stretching suggests the sciatic nerve"], guide: { growthTips: ["Romanian deadlifts and leg curls (seated curls train them lengthened)."], growth: [R.nordic], recoveryTips: ["Hamstring stretches with a flat back; ease off if it tingles."], recovery: [R.hamStretch, R.kneeChest] } },
  "rg-calves": { does: "Gastrocnemius and soleus point the foot and drive push-off; the gastroc also helps bend the knee. The tibialis on the shin lifts the foot.", worksWith: ["rg-quads", "rg-glutes"], joints: ["ankle", "knee"], nerves: ["nerve-tibial", "nerve-peroneal"],
    overwork: ["Stiff Achilles first thing in the morning", "Calf cramps", "Pain along the inner shin with running or jumping (shin-splints pattern)"], guide: { growthTips: ["Straight-knee raises for the gastroc, bent-knee raises for the soleus, full stretch and pause."], recoveryTips: ["Calf stretches and ankle circles."], recovery: [R.calfStretch, R.soleus, R.ankleCircles] } },
};

/** Groups: a short description; the rest is gathered from their muscles. */
const LG: Record<GroupId, string> = {
  chest: "The pecs and serratus: pushing and bringing the arms together.",
  shoulders: "The three deltoid heads and the rotator cuff: moving the arm in every direction while keeping the ball in its socket.",
  back: "Lats, mid back, traps and spinal erectors: pulling, posture and protecting the spine.",
  arms: "Biceps, triceps and forearms: bending and straightening the elbow and gripping.",
  core: "Abs, obliques and the deep transverse abdominis: bracing and controlling the trunk.",
  glutes: "Glute max, med, min and the TFL: powering and stabilising the hip.",
  quads: "The four quadriceps heads and the deep hip flexors: straightening the knee and lifting the thigh.",
  adductors: "The inner-thigh muscles: pulling the legs in and steadying the pelvis.",
  hamstrings: "The three hamstrings: bending the knee and extending the hip.",
  calves: "Gastrocnemius, soleus and the shin's tibialis: pointing and lifting the foot.",
};

/** Finer anatomy inside each detail (sub) and nerve overrides. */
const SUB_EXTRA: Partial<Record<SubId, { parts?: string[]; nerves?: string[]; does?: string }>> = {
  "rotator-cuff": { parts: ["Supraspinatus: starts lifting the arm (suprascapular n.)", "Infraspinatus: turns the arm out (suprascapular n.)", "Teres minor: turns the arm out (axillary n.)", "Subscapularis: turns the arm in (subscapular nn.)"], nerves: ["nerve-suprascapular", "nerve-axillary"] },
  rhomboids: { parts: ["Rhomboid major and minor (dorsal scapular n.)", "Levator scapulae, above them"], nerves: ["nerve-dorsal-scapular"] },
  "traps-mid": { nerves: ["nerve-accessory"] },
  "teres-major": { nerves: ["nerve-thoracodorsal"] },
  brachioradialis: { nerves: ["nerve-radial"] },
  "adductor-longus": { parts: ["Adductor longus", "Adductor brevis (under it)", "Pectineus (next to it)"], nerves: ["nerve-obturator"] },
  gracilis: { nerves: ["nerve-obturator"] },
  "ham-semimem": { nerves: ["nerve-sciatic"] },
  "traps-upper": { nerves: ["nerve-accessory", "nerve-cervical"] },
  "traps-lower": { nerves: ["nerve-accessory"] },
  lats: { nerves: ["nerve-thoracodorsal"] },
  erectors: { parts: ["Iliocostalis (outer)", "Longissimus (middle)", "Spinalis (inner)", "Multifidus (deep, segment by segment)"], nerves: ["nerve-dorsal-rami"] },
  serratus: { nerves: ["nerve-long-thoracic"] },
  "chest-clav": { nerves: ["nerve-pectoral"] }, "chest-sternal": { nerves: ["nerve-pectoral"] }, "chest-lower": { nerves: ["nerve-pectoral"] },
  "biceps-long": { nerves: ["nerve-musculocutaneous"] }, "biceps-short": { nerves: ["nerve-musculocutaneous"] }, brachialis: { nerves: ["nerve-musculocutaneous"] },
  "forearm-flexors": { parts: ["Flexor carpi radialis & palmaris longus (median n.)", "Flexor digitorum superficialis (median n.)", "Flexor digitorum profundus (median + ulnar nn.)", "Flexor carpi ulnaris (ulnar n.)"], nerves: ["nerve-median", "nerve-ulnar"] },
  "forearm-extensors": { parts: ["Extensor carpi radialis longus & brevis", "Extensor digitorum", "Extensor carpi ulnaris"], nerves: ["nerve-radial"] },
  obliques: { parts: ["External oblique (outer layer)", "Internal oblique (under it)"], nerves: ["nerve-intercostal"] },
  "abs-upper": { nerves: ["nerve-intercostal"] }, "abs-lower": { nerves: ["nerve-intercostal"] }, transverse: { nerves: ["nerve-intercostal"] },
  "glute-max": { nerves: ["nerve-inferior-gluteal"] }, "glute-med": { nerves: ["nerve-superior-gluteal"] }, "glute-min": { nerves: ["nerve-superior-gluteal"] }, tfl: { nerves: ["nerve-superior-gluteal"], parts: ["Tensor fasciae latae, blending into the IT band down the outer thigh"] },
  "hip-flexors": { parts: ["Psoas major (lumbar plexus, L1–L3)", "Iliacus (femoral n.)", "Helped by rectus femoris, sartorius and TFL"], nerves: ["nerve-lumbar-plexus", "nerve-femoral"] },
  "adductors-sub": { parts: ["Adductor magnus: adductor part (obturator n.)", "Adductor magnus: hamstring part (sciatic n.)"], nerves: ["nerve-obturator", "nerve-sciatic"] },
  "ham-medial": { nerves: ["nerve-sciatic"] },
  "ham-lateral": { parts: ["Biceps femoris long head (tibial part of sciatic)", "Biceps femoris short head (common peroneal part)"], nerves: ["nerve-sciatic"] },
  gastroc: { parts: ["Medial head", "Lateral head"], nerves: ["nerve-tibial"] }, soleus: { nerves: ["nerve-tibial"] }, tibialis: { nerves: ["nerve-peroneal"] },
};

// ---------- joints ----------
const LJ: Record<JointId, { does: string; overwork: string[]; nerves: string[]; recovery: Ref[]; tips: string[] }> = {
  neck: { does: "Nods, turns and tilts the head through seven cervical vertebrae.", nerves: ["nerve-cervical", "nerve-accessory"], overwork: ["Stiffness and pain turning the head", "Pain or tingling travelling into the arm points to a nerve root"], recovery: [R.chinTuck, R.sideNeck, R.neckRotate], tips: ["Keep the neck neutral on rows, shrugs and carries."] },
  shoulder: { does: "A shallow ball-and-socket with the biggest range in the body; the rotator cuff keeps the ball centred.", nerves: ["nerve-axillary", "nerve-suprascapular", "nerve-brachial-plexus"], overwork: ["Pain lifting the arm overhead or out to the side", "Night pain lying on that shoulder", "Clicking with pain or a feeling of slipping"], recovery: [R.pvcER, R.rotationShoulder, R.bentArmShoulder], tips: ["Warm the cuff before pressing; balance push and pull."] },
  elbow: { does: "A hinge (bend/straighten) plus the forearm rotation that turns the palm up and down.", nerves: ["nerve-ulnar", "nerve-median", "nerve-radial"], overwork: ["Inner or outer elbow pain with gripping", "Pain at the back of the elbow on pressing", "Tingling in the little finger (ulnar nerve)"], recovery: [R.wristFlexor, R.wristExtensor, R.tricepsStretch], tips: ["Vary grips; reduce loads on curls and extensions for a week if sore."] },
  wrist: { does: "Bends, extends and tilts the hand; carries load in every press and grip.", nerves: ["nerve-median", "nerve-ulnar", "nerve-radial"], overwork: ["Pain under load in push-ups or presses", "Numbness in the thumb to ring finger (median nerve)"], recovery: [R.wristFlexor, R.wristExtensor], tips: ["Neutral wrists, stacked over the forearm when pressing."] },
  tspine: { does: "The upper back rotates and extends; it lets the arms go overhead without the low back arching.", nerves: ["nerve-intercostal", "nerve-dorsal-rami"], overwork: ["Stiffness, or pain between the shoulder blades", "Needing to arch the low back to reach overhead"], recovery: [R.openBook, R.thoracicBridge, R.catCow], tips: ["Daily rotation and extension work pays off."] },
  lumbar: { does: "The low back flexes, extends and side-bends; the core and hips protect it.", nerves: ["nerve-lumbar-plexus", "nerve-sacral-plexus", "nerve-dorsal-rami"], overwork: ["Stiffness after sitting or hinging", "Pain spreading below the knee or leg tingling (nerve root)", "Saddle numbness or bladder/bowel change: urgent care"], recovery: [R.kneeChest, R.catCow, R.childPose], tips: ["Hinge from the hips, brace, and break up long sitting."] },
  si: { does: "Where the spine meets the pelvis. Moves only a few millimetres; ligaments, glutes and core stabilise it.", nerves: ["nerve-sacral-plexus"], overwork: ["One-sided pain near the dimple at the back of the pelvis", "Worse on stairs, single-leg stance or rolling in bed"], recovery: [R.kneeChest, R.piriformis, R.hip9090], tips: ["Strengthen glutes and side core; avoid big asymmetric loads while it's irritated."] },
  hip: { does: "A deep ball-and-socket: flexion, extension, rotation and moving the leg in and out.", nerves: ["nerve-femoral", "nerve-obturator", "nerve-sciatic", "nerve-superior-gluteal", "nerve-inferior-gluteal"], overwork: ["Pinching at the front of the hip at the bottom of a squat", "Groin pain", "Outer-hip pain lying on that side"], recovery: [R.hip9090, R.hipFlexorKneel, R.worldGreatest], tips: ["Find your squat stance; don't force depth through a pinch."] },
  knee: { does: "A hinge with a little rotation; the kneecap glides in a groove on the thigh bone.", nerves: ["nerve-femoral", "nerve-tibial", "nerve-peroneal"], overwork: ["Pain at the front of the kneecap with stairs or squats", "Swelling, locking or giving way (get it assessed)"], recovery: [R.quadStretch, R.hamStretch], tips: ["Knees track over the toes; build load gradually."] },
  ankle: { does: "Points and lifts the foot and rolls it in and out; ankle bend sets squat and lunge depth.", nerves: ["nerve-tibial", "nerve-peroneal"], overwork: ["Stiffness that limits squat depth", "Achilles pain", "Repeated rolling of the ankle"], recovery: [R.ankleCircles, R.calfStretch], tips: ["Calf raises through full range build the Achilles."] },
};

// ---------- public API ----------
export type Entity = { id: string; kind: Kind; name: string; parent?: string; children: string[]; learn: Learn; guide: Guide; muscles?: string[] };

const uniq = (xs: (string | undefined)[]) => [...new Set(xs.filter(Boolean) as string[])];

function regionEntity(r: RegionId): Entity {
  const info = regionInfo(r)!;
  const c = LR[r];
  return { id: r, kind: "muscle", name: info.name, parent: info.group, children: [...info.subs], learn: { ...c, parts: info.subs.map((s) => subInfo(s)?.name ?? s) }, guide: c.guide, muscles: [r] };
}
function subEntity(s: SubId): Entity {
  const info = subInfo(s)!;
  const r = regionOfSub(s).id;
  const base = LR[r];
  const x = SUB_EXTRA[s] ?? {};
  return { id: s, kind: "detail", name: info.name, parent: r, children: [], learn: { ...base, does: `${x.does ?? info.blurb} ${info.deep ? "Deep muscle: you won't see it, but you can train it." : ""}`.trim(), nerves: x.nerves ?? base.nerves, parts: x.parts }, guide: base.guide, muscles: [s] };
}
function groupEntity(g: GroupId): Entity {
  const info = groupInfo(g)!;
  const regs = REGIONS.filter((r) => r.group === g).map((r) => regionEntity(r.id));
  const own = new Set<string>([g, ...regs.map((r) => r.id), ...info.subs]);
  const pick = (k: "worksWith" | "opposes" | "joints" | "nerves") => uniq(regs.flatMap((r) => r.learn[k] ?? [])).filter((x) => !own.has(x));
  return {
    id: g, kind: "group", name: info.name, children: regs.map((r) => r.id),
    learn: { does: LG[g], worksWith: pick("worksWith"), opposes: pick("opposes"), joints: pick("joints"), nerves: pick("nerves"), overwork: uniq(regs.flatMap((r) => r.learn.overwork ?? [])).slice(0, 5), parts: regs.map((r) => r.name) },
    guide: { growthTips: uniq(regs.flatMap((r) => r.guide.growthTips ?? [])), growth: regs.flatMap((r) => r.guide.growth ?? []), recoveryTips: uniq(regs.flatMap((r) => r.guide.recoveryTips ?? [])), recovery: dedupeRefs(regs.flatMap((r) => r.guide.recovery ?? [])) },
    muscles: [g],
  };
}
function dedupeRefs(rs: Ref[]) { const m = new Map(rs.map((r) => [r.slug, r])); return [...m.values()]; }
function jointEntity(j: JointId): Entity {
  const info = JOINTS.find((x) => x.id === j)!;
  const c = LJ[j];
  return { id: j, kind: "joint", name: info.name, children: [], learn: { does: `${info.blurb} ${c.does}`, worksWith: info.regions, nerves: c.nerves, overwork: c.overwork }, guide: { recoveryTips: c.tips, recovery: c.recovery }, muscles: info.regions };
}
function nerveEntity(n: NerveInfo): Entity {
  return { id: n.id, kind: "nerve", name: n.name, children: [], learn: { ...n.learn, does: `${n.learn.does} Roots: ${n.roots}.` }, guide: n.guide ?? { recoveryTips: ["Nerves prefer gentle movement over hard stretching. If a stretch brings on tingling, back off."] }, muscles: (n.learn.worksWith ?? []) };
}

let cache: Map<string, Entity> | null = null;
export function entities(): Map<string, Entity> {
  if (cache) return cache;
  const all: Entity[] = [
    ...GROUPS.map((g) => groupEntity(g.id)),
    ...REGIONS.map((r) => regionEntity(r.id)),
    ...SUBS.map((s) => subEntity(s.id)),
    ...JOINTS.map((j) => jointEntity(j.id)),
    ...NERVES.map(nerveEntity),
  ];
  // Use the precise detail records at every level rather than inheriting a parent's supply.
  for (const e of all) {
    if (e.kind === "nerve") continue;
    if (e.kind === "joint") { e.learn.does = referenceFor(e).function; continue; }
    const ids = e.kind === "detail" ? [e.id] : e.kind === "muscle" ? regionInfo(e.id)!.subs : groupInfo(e.id)!.subs;
    const rows = ids.map(id => DETAIL[id]);
    const own = new Set([e.id, ...ids]);
    e.learn = { ...e.learn, does: referenceFor(e).function,
      ...(e.kind === "detail" ? { does: rows[0].action, parts: [rows[0].attachment, rows[0].note] } : {}),
      worksWith: uniq(rows.flatMap(d => d.with)).filter(id => !own.has(id)),
      opposes: uniq(rows.flatMap(d => d.against)).filter(id => !own.has(id)),
      joints: uniq(rows.flatMap(d => d.joints)), nerves: uniq(rows.flatMap(d => d.nerves)),
    };
  }
  cache = new Map(all.map((e) => [e.id, e]));
  return cache;
}
export const entity = (id: string | null | undefined) => (id ? entities().get(id) : undefined);
export const entityName = (id: string) => entity(id)?.name ?? id;
export function entitiesOf(kind: Kind): Entity[] { return [...entities().values()].filter((e) => e.kind === kind); }
/** Everything that names this entity as a connection (reverse links), so "how they connect" works both ways. */
export function linkedFrom(id: string): Entity[] {
  return [...entities().values()].filter((e) => e.id !== id && [e.learn.worksWith, e.learn.opposes, e.learn.joints, e.learn.nerves].some((l) => l?.includes(id)) && e.kind !== "detail");
}
