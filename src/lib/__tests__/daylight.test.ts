import assert from "node:assert/strict";
import { test } from "node:test";
import { buildDigest } from "../daylight/digest.ts";
import { migratePersisted } from "../daylight/migrate.ts";
import { activePlan, buildPdfDays } from "../daylight/plan.ts";
import { loggedVolume, plannedVolume, suggestionsFor, planExerciseIdSet } from "../daylight/volume.ts";
import { seedPlan } from "../daylight/plan.ts";
import { exercises } from "../daylight/exercises.ts";
import { MUSCLE_IDS } from "../daylight/muscles.ts";

test("every plan slot references a catalog exercise with muscle weights", () => {
  const ids = new Set(exercises.map((e) => e.id));
  for (const day of buildPdfDays()) {
    for (const slot of day.slots) {
      assert.ok(ids.has(slot.exerciseId), `${slot.exerciseId} missing`);
      for (const a of slot.alternatives) assert.ok(ids.has(a.exerciseId), `${a.exerciseId} missing`);
    }
  }
  for (const e of exercises) for (const m of Object.keys(e.muscles ?? {})) assert.ok(MUSCLE_IDS.includes(m as never), `${e.id}:${m}`);
});

test("PDF plan: day order, focus names, counts", () => {
  const days = buildPdfDays();
  assert.deepEqual(days.map((d) => d.name), [
    "Open day", "Pull + Abs", "Lower 1 / Quad Bias + Cardio", "Push + Shoulders", "Active Recovery + PT", "Lower 2 / Glute-Ham Bias + Abs", "Delts + Arms + Traps + Cardio",
  ]);
  const count = (d: number, sec: string[]) => days[d]!.slots.filter((s) => sec.includes(s.section)).length;
  assert.equal(count(1, ["activation"]), 3);
  assert.equal(count(1, ["main"]), 6);
  assert.equal(count(1, ["finisher"]), 2);
  assert.equal(count(3, ["main"]), 7);
  assert.equal(count(5, ["main"]), 7);
  assert.equal(count(6, ["main"]), 8);
  assert.equal(count(6, ["finisher"]), 2);
  for (const d of days) if (d.scheduled) assert.ok(d.psa && d.slots.every((s) => s.sourceCue), d.name);
  assert.equal(days[1]!.slots.find((s) => s.id === "mon-w1")!.alternatives.length, 1);
});

test("planned volume: muscles, ranges and ordering", () => {
  const v = plannedVolume(seedPlan());
  assert.ok(v.lats.direct >= 9);
  assert.equal(v.adductors.direct, 0);
  assert.ok(v.adductors.indirect > 0);
  assert.ok(v.quads.effective > v.tibialis.effective);
});

test("logged volume reads set logs and per-side halves", () => {
  const plan = seedPlan();
  const monday = plan.days[1]!;
  const slot = monday.slots.find((s) => s.exerciseId === "assisted-pullup")!;
  const mk = (n: number) => ({ id: `l${n}`, prescriptionId: slot.id, setIndex: n, side: "na" as const, status: "done" as const, reps: 8, load: null, loadUnit: "lb" as const, assistance: 40, assistanceUnit: "lb" as const, seconds: null, distance: null, at: "x" });
  const session = { id: "s", planVersionId: plan.id, weekday: 1, localDate: "2026-09-28", name: "Pull", why: "", chosen: false, startedAt: "", finishedAt: null, status: "finished" as const, snapshot: monday.slots, chosenExercise: {}, logs: [mk(0), mk(1), mk(2)], focusSlot: 0, note: "" };
  const out = loggedVolume([session], { from: "2026-09-22", to: "2026-09-30", days: 9 });
  assert.equal(out.totalSets, 3);
  assert.equal(out.map.lats.direct, 3);
  assert.equal(out.map.biceps.indirect, 3);
  assert.equal(out.map.quads.effective, 0);
});

test("suggestions are back-friendly first and not already in the plan", () => {
  const s = suggestionsFor("adductors", planExerciseIdSet(seedPlan()));
  assert.ok(s.length > 0);
  assert.equal(s[0]!.back, "friendly");
  assert.ok(s.every((x) => !planExerciseIdSet(seedPlan()).has(x.exerciseId)));
});

// ---- migration from a faithfully-shaped OLD (v0) persisted state ----
const OLD_STATE = {
  purpose: "My own line",
  purposeIsProposal: false,
  units: "kg",
  drinkSizes: [{ id: "d1", name: "Bottle", ounces: 24 }],
  planVersions: [
    {
      id: "fine-shyte-v1", name: "Fine Shyte Plan — original", version: 1, effectiveDate: "2026-09-30", reason: "r", sourceLabel: "s", createdAt: "2026-09-30T00:00:00.000Z",
      days: [{ weekday: 1, name: "Pull + Abs", scheduled: true, why: "w", whySource: "s", reminders: [], slots: [{ id: "mon-pull", exerciseId: "assisted-pullup", alternatives: [{ id: "alt-neutral", exerciseId: "neutral-pullup" }], sets: 4, repLabel: "6–8", perSide: false, optional: false, section: "main", sourceCue: null, why: "", whySource: "" }] }],
    },
    {
      id: "v2-user", name: "Mine — version 2", version: 2, effectiveDate: "2026-10-01", reason: "mine", sourceLabel: "s", createdAt: "2026-10-01T00:00:00.000Z",
      days: [{ weekday: 1, name: "Pull + Abs", scheduled: true, why: "w", whySource: "s", reminders: [], slots: [{ id: "custom-slot", exerciseId: "custom-123", alternatives: [], sets: 3, repLabel: "10", perSide: false, optional: false, section: "main", sourceCue: null, why: "", whySource: "" }] }],
    },
  ],
  sessions: [{ id: "sess1", planVersionId: "fine-shyte-v1", weekday: 1, localDate: "2026-09-29", name: "Pull + Abs", why: "", chosen: false, startedAt: "2026-09-29T10:00:00Z", finishedAt: null, status: "active", snapshot: [{ id: "mon-pull", exerciseId: "assisted-pullup", alternatives: [], sets: 4, repLabel: "6–8", perSide: false, optional: false, section: "main", sourceCue: null, why: "", whySource: "" }], chosenExercise: {}, logs: [{ id: "L1", prescriptionId: "mon-pull", setIndex: 0, side: "na", status: "done", reps: 7, load: null, loadUnit: "kg", assistance: 30, assistanceUnit: "kg", seconds: null, distance: null, at: "2026-09-29T10:05:00Z" }], focusSlot: 0, note: "felt strong" }],
  activeSessionId: "sess1",
  observations: [{ id: "o1", text: "Left shoulder pinched", createdAt: "2026-09-29T10:06:00Z", updatedAt: "2026-09-29T10:06:00Z", context: { date: "2026-09-29", time: "10:06", regionId: "rear-delt-left", exerciseId: "assisted-pullup", sessionId: "sess1" }, tags: ["Felt difficult"], status: "open" }],
  trials: [{ id: "t1", observationId: "o1", change: "c", helpful: "h", reviewDate: null, status: "active", kind: "reminder", createdAt: "x", historyNote: "", parentTrialId: null }],
  foodLogs: [{ id: "f1", localDate: "2026-09-29", time: "08:00", food: "2 eggs", mealId: null, proteinGrams: 12, proteinIsEstimate: true, energyBefore: null, energyAfter: null }],
  fluidLogs: [{ id: "w1", localDate: "2026-09-29", time: "09:00", beverage: "Water", amountOz: 24, sizeId: "d1" }],
  inventory: [{ id: "inv-dough", name: "Pizza dough", quantity: "2", category: "Frozen", cadence: "weekly", storageLocation: "Freezer", status: "fine", notes: "mine" }],
  savedMeals: [{ id: "meal-x", name: "My meal", recipeId: null, minutes: 5, noCook: true, ingredientNames: ["Eggs"], pinned: true }],
  shopping: [{ id: "s1", name: "Milk", quantity: "1", checked: false, source: "Added by you" }],
  prep: [{ id: "p1", title: "Chicken prep", detail: "d", status: "done" }],
  goals: [{ id: "g1", name: "Pull-up", improvement: "i", check: "c" }],
  ptNotes: { "pt-clam": "go slow" },
  proteinGoal: 150,
  trainingTab: "runner",
  view: "training",
};

test("migration keeps every old record and adds the PDF plan", () => {
  const before = JSON.stringify(OLD_STATE);
  const out = migratePersisted(structuredClone(OLD_STATE)) as typeof OLD_STATE & { schemaVersion: number; planVersions: { id: string; version: number; days: { weekday: number; slots: { exerciseId: string }[] }[] }[]; observations: { forNextPlan: boolean; context: { muscleId?: string } }[] };
  assert.equal(out.schemaVersion, 2);
  // untouched
  assert.deepEqual(out.sessions, OLD_STATE.sessions);
  assert.deepEqual(out.foodLogs, OLD_STATE.foodLogs);
  assert.deepEqual(out.fluidLogs, OLD_STATE.fluidLogs);
  assert.deepEqual(out.trials, OLD_STATE.trials);
  assert.deepEqual(out.goals, OLD_STATE.goals);
  assert.deepEqual(out.ptNotes, OLD_STATE.ptNotes);
  assert.deepEqual(out.shopping, OLD_STATE.shopping);
  assert.deepEqual(out.prep, OLD_STATE.prep);
  assert.equal(out.proteinGoal, 150);
  assert.equal(out.units, "kg");
  assert.equal(out.purpose, "My own line");
  assert.equal(out.activeSessionId, "sess1");
  // inventory & meals: existing rows kept as-is, new starters appended
  assert.deepEqual(out.inventory[0], OLD_STATE.inventory[0]);
  assert.ok(out.inventory.length > 1);
  assert.deepEqual((out.savedMeals as unknown[])[0], OLD_STATE.savedMeals[0]);
  // observations: same text/id, new fields added
  assert.equal(out.observations[0]!.forNextPlan, false);
  assert.equal(out.observations[0]!.context.muscleId, "delt-rear");
  assert.equal((out.observations[0] as unknown as { text: string }).text, "Left shoulder pinched");
  // plans: old two kept in order, the PDF plan appended as version 3, custom slot carried
  assert.deepEqual(out.planVersions.slice(0, 2), OLD_STATE.planVersions);
  const pdf = out.planVersions[2]!;
  assert.equal(pdf.version, 3);
  assert.ok(pdf.id.startsWith("fine-shyte-pdf"));
  assert.ok(pdf.days.find((d) => d.weekday === 1)!.slots.some((s) => s.exerciseId === "custom-123"));
  assert.equal(activePlan(out.planVersions as never, "2026-10-02").id, pdf.id);
  assert.equal(out.trainingTab, "session");
  // the old open session still computes volume
  const v = loggedVolume(out.sessions as never, { from: "2026-09-29", to: "2026-09-30", days: 2 });
  assert.equal(v.map.lats.direct, 1);
  // input not mutated
  assert.equal(JSON.stringify(OLD_STATE), before);
});

test("migration is idempotent", () => {
  const once = migratePersisted(structuredClone(OLD_STATE));
  const twice = migratePersisted(structuredClone(once));
  assert.deepEqual(twice, once);
});

test("digest includes flagged notes, per-exercise and underserved areas", () => {
  const out = migratePersisted(structuredClone(OLD_STATE)) as never as { observations: never[]; planVersions: never[]; sessions: never[] };
  const notes = (out.observations as { forNextPlan: boolean }[]).map((o) => ({ ...o, forNextPlan: true })) as never[];
  const text = buildDigest({ notes, plan: activePlan(out.planVersions as never, "2026-10-02"), sessions: out.sessions as never, weeklyTarget: 10, planContext: "ctx", units: "kg", today: "2026-10-02" });
  assert.match(text, /Flagged for the next plan \(1\)/);
  assert.match(text, /Assisted Pull-Up/);
  assert.match(text, /Left shoulder pinched/);
  assert.match(text, /Underserved by the plan/);
  assert.match(text, /Last logged — 2026-09-29: 7 @?/);
});
