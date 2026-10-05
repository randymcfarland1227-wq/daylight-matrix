import assert from "node:assert/strict";
import { test } from "node:test";
import { buildDigest } from "../daylight/digest.ts";
import { exercises } from "../daylight/exercises.ts";
import { FORM_GUIDES, demoUrl, findExerciseByName, formFor } from "../daylight/form.ts";
import { prescribedDefaults, slotFinished } from "../daylight/logic.ts";
import { ART_MAP, artFor } from "../daylight/moveArt.ts";
import { migratePersisted, SCHEMA_VERSION } from "../daylight/migrate.ts";
import { GROUPS, SUBS, OLD_REGION_TO_MUSCLE, LEGACY_MUSCLE, MUSCLE_IDS, groupOfSub, isGroup, resolveMuscle, targetFor } from "../daylight/muscles.ts";
import { FRONT, BACK } from "../daylight/bodyPaths.ts";
import { activePlan, buildPdfDays, seedPlan } from "../daylight/plan.ts";
import { loggedVolume, plannedVolume, suggestionsFor, planExerciseIdSet, statusFor, dayMuscles } from "../daylight/volume.ts";
import type { ExtraLog, WorkoutSession } from "../daylight/types.ts";

const subIds = new Set(SUBS.map((s) => s.id));

test("every exercise weight points at a real sub-part", () => {
  for (const e of exercises) {
    for (const [m, w] of Object.entries(e.muscles ?? {})) {
      assert.ok(subIds.has(m as never), `${e.id}:${m} is not a sub-part id`);
      assert.ok([1, 0.5, 0.25].includes(w), `${e.id}:${m} weight ${w}`);
    }
  }
});

test("group volume equals the strongest sub-part, and sums stay consistent", () => {
  const v = plannedVolume(seedPlan());
  for (const g of GROUPS) {
    assert.ok(v[g.id].effective >= Math.max(...g.subs.map((s) => v[s].effective)) - 1e-9, `${g.id} group >= each sub`);
    assert.ok(v[g.id].effective <= g.subs.reduce((n, s) => n + v[s].effective, 0) + 1e-9, `${g.id} group <= sum of subs`);
  }
  // Chest (group) is trained directly on Wednesday; the lower part is mostly indirect
  assert.ok(v.chest.direct > 0);
  assert.ok(v["chest-clav"].direct > 0, "incline press / low-to-high fly aim at the upper chest");
  assert.ok(v["delt-side"].direct > 0 && v["delt-rear"].direct > 0);
  assert.ok(v["triceps-long"].direct > 0, "overhead rope extension aims at the long head");
  assert.equal(v["adductors-sub"].direct, 0);
});

test("every body-map shape belongs to a real sub-part, and each side covers its groups", () => {
  for (const p of [...FRONT, ...BACK]) assert.ok(subIds.has(p.muscle), p.muscle);
  const front = new Set(FRONT.map((p) => groupOfSub(p.muscle)));
  const back = new Set(BACK.map((p) => groupOfSub(p.muscle)));
  for (const g of GROUPS) assert.ok(front.has(g.id) || back.has(g.id), `${g.id} has no shape`);
  // every sub-part can be seen on at least one side
  for (const s of SUBS) assert.ok(FRONT.some((p) => p.muscle === s.id) || BACK.some((p) => p.muscle === s.id), `${s.id} has no shape`);
});

test("old and v2 muscle ids still resolve", () => {
  for (const [old, now] of Object.entries(OLD_REGION_TO_MUSCLE)) assert.ok(resolveMuscle(now), `old region ${old} -> ${now}`);
  for (const id of Object.keys(LEGACY_MUSCLE)) {
    const r = resolveMuscle(id);
    assert.ok(r, id);
    assert.ok(GROUPS.some((g) => g.id === r!.group));
  }
  assert.equal(resolveMuscle("biceps")!.group, "arms");
  assert.equal(resolveMuscle("mid-back")!.group, "back");
  assert.equal(resolveMuscle("chest-upper")!.sub, "chest-clav");
  assert.equal(resolveMuscle("nope"), null);
  assert.equal(targetFor("chest", 10), 10);
  assert.equal(targetFor("chest-clav", 10), 6);
  assert.ok(MUSCLE_IDS.length === GROUPS.length + SUBS.length);
  assert.ok(isGroup("quads") && !isGroup("quad-vl"));
});

test("suggestions work for a sub-part and for a group, and only offer moves outside the plan", () => {
  const plan = planExerciseIdSet(seedPlan());
  const sub = suggestionsFor("adductors-sub", plan);
  assert.ok(sub.length > 0 && sub.every((s) => !plan.has(s.exerciseId)));
  const grp = suggestionsFor("shoulders", plan);
  assert.ok(grp.length > 0);
});

test("dayMuscles rolls up to groups by default and gives sub-parts on request", () => {
  const mon = seedPlan().days[1]!;
  const g = dayMuscles(mon);
  assert.ok(g.some((m) => m.id === "back") && g.every((m) => isGroup(m.id)));
  const s = dayMuscles(mon, "sub");
  assert.ok(s.some((m) => m.id === "lats") && s.every((m) => !isGroup(m.id)));
});

const session = (extras: ExtraLog[]): WorkoutSession => ({ id: "s", planVersionId: "p", weekday: 3, localDate: "2026-09-30", name: "Push", why: "", chosen: false, startedAt: "", finishedAt: null, status: "active", snapshot: seedPlan().days[3]!.slots, chosenExercise: {}, logs: [], extras, focusSlot: 0, note: "" });
const ex = (o: Partial<ExtraLog>): ExtraLog => ({ id: "e1", slotId: null, kind: "other", name: "Something", sets: 3, reps: "10", load: null, minutes: null, note: "", muscles: [], at: "x", ...o });

test("off-plan work counts on the heat map by chosen muscles, a whole group, or the matched move", () => {
  const win = { from: "2026-09-24", to: "2026-09-30", days: 7 };
  const none = loggedVolume([session([ex({})])], win);
  assert.equal(none.map["lats"].effective, 0, "no muscles chosen and no catalog match: logged but not counted");
  assert.equal(none.totalSets, 3);

  const chosen = loggedVolume([session([ex({ muscles: ["lats", "biceps-long"] })])], win);
  assert.equal(chosen.map["lats"].direct, 3);
  assert.equal(chosen.map["back"].direct, 3, "the group rolls up");
  assert.equal(chosen.map["biceps-long"].direct, 3);

  const whole = loggedVolume([session([ex({ muscles: ["calves"], sets: 2 })])], win);
  assert.equal(whole.map["gastroc"].direct, 2);
  assert.equal(whole.map["soleus"].direct, 2);

  const legacy = loggedVolume([session([ex({ muscles: ["mid-back"], sets: 1 })])], win);
  assert.equal(legacy.map["rhomboids"].direct, 1, "an old flat id still resolves");

  const viaMove = loggedVolume([session([ex({ name: "lat pull down", exerciseId: findExerciseByName("lat pull down") ?? undefined, sets: 4 })])], win);
  assert.ok(viaMove.map["lats"].direct >= 4);
});

test("an extra tied to a slot marks the slot finished, and shows in the digest", () => {
  const s = session([ex({ slotId: seedPlan().days[3]!.slots[3]!.id, name: "Smith incline press", muscles: ["chest-clav"], note: "bench was taken" })]);
  assert.ok(slotFinished(s, s.snapshot[3]!));
  assert.ok(!slotFinished(s, s.snapshot[4]!));
  const plan = activePlan([seedPlan()] as never, "2026-10-01");
  const text = buildDigest({ notes: [], plan, sessions: [s], weeklyTarget: 10, planContext: "", units: "lb", today: "2026-09-30" });
  assert.match(text, /Off-plan work and swaps/);
  assert.match(text, /Smith incline press/);
  assert.match(text, /bench was taken/);
  assert.match(text, /muscles: Upper chest/);
});

test("prescribed defaults come from the plan dose", () => {
  const pt = seedPlan().days[1]!.slots[0]!;
  assert.deepEqual(prescribedDefaults(pt, "activation"), { reps: 8, seconds: null, distance: null });
  const stand = seedPlan().days[2]!.slots.find((x) => x.exerciseId === "single-leg-stand")!;
  assert.equal(prescribedDefaults(stand, "timed").seconds, 20);
  const cardio = seedPlan().days[2]!.slots.find((x) => x.exerciseId === "tuesday-cardio")!;
  assert.equal(prescribedDefaults(cardio, "cardio").seconds, 15 * 60);
});

test("migration v1 -> v3 and v2 -> v3 keep data, add extras, theme auto -> dark, explicit light kept", () => {
  assert.equal(SCHEMA_VERSION, 3);
  const base = { schemaVersion: 2, theme: "auto", sessions: [{ id: "a", logs: [], note: "keep" }], observations: [{ id: "n", text: "x", tags: [], status: "open", context: { date: "2026-09-01", muscleId: "biceps" }, forNextPlan: false, kind: "gym" }], planVersions: [seedPlan()], units: "kg" };
  const out = migratePersisted(structuredClone(base)) as typeof base & { sessions: { extras: unknown[] }[] };
  assert.equal(out.schemaVersion, 3);
  assert.equal(out.theme, "dark");
  assert.deepEqual(out.sessions[0]!.extras, []);
  assert.equal(out.observations[0]!.context.muscleId, "biceps", "stored muscle ids are kept as stored");
  assert.equal(out.units, "kg");
  const light = migratePersisted({ ...structuredClone(base), theme: "light" }) as { theme: string };
  assert.equal(light.theme, "light");
  const explicitDark = migratePersisted({ ...structuredClone(base), theme: "dark" }) as { theme: string };
  assert.equal(explicitDark.theme, "dark");
  const twice = migratePersisted(structuredClone(out));
  assert.deepEqual(twice, out);
  // extras already present are not replaced
  const withExtras = migratePersisted({ ...structuredClone(base), sessions: [{ id: "a", logs: [], extras: [{ id: "z" }] }] }) as { sessions: { extras: unknown[] }[] };
  assert.equal(withExtras.sessions[0]!.extras.length, 1);
});

test("every exercise has a form guide with real steps, and a safe demo link", () => {
  for (const e of exercises) {
    const g = formFor(e.id);
    assert.ok(g, `${e.id} has no form guide`);
    assert.ok(g!.s.length >= 3, `${e.id} steps`);
    for (const k of ["base", "brace", "grip", "rom", "tempo", "feel", "back"] as const) assert.ok(g![k].trim().length > 3, `${e.id}.${k}`);
    assert.ok(g!.err.length >= 2, `${e.id} mistakes`);
    const url = demoUrl(e.id);
    assert.ok(url.startsWith("https://vimeo.com/search?q="), url);
    assert.ok(!/[()\s]/.test(url), "url is encoded");
  }
  assert.equal(Object.keys(FORM_GUIDES).length, exercises.length);
});

test("every plan move has a start/end diagram, and diagrams are not all the same", () => {
  const used = new Set<string>();
  for (const d of buildPdfDays()) for (const s of d.slots) { used.add(s.exerciseId); s.alternatives.forEach((a) => used.add(a.exerciseId)); }
  for (const id of used) assert.ok(ART_MAP[id] && artFor(id), `${id} has no diagram`);
  const patterns = new Set(Object.values(ART_MAP));
  assert.ok(patterns.size >= 60, `only ${patterns.size} distinct patterns`);
});

test("statusFor uses a lighter bar for sub-parts", () => {
  const v = plannedVolume(seedPlan());
  assert.notEqual(statusFor(v["chest-clav"], 1, targetFor("chest-clav", 10)), "none");
});
