import assert from "node:assert/strict";
import { test } from "node:test";
import { seedPlan } from "../daylight/plan.ts";
import { doneSetCount, sessionProgress, slotFinished, progressLabel } from "../daylight/logic.ts";
import { heatSnapshot } from "../daylight/volume.ts";
import type { Prescription, SetLog, WorkoutSession } from "../daylight/types.ts";

const plan = seedPlan();
const slot: Prescription = { ...plan.days[1]!.slots[0]!, sets: 2, setsMax: 3, perSide: true, optional: false };
const log = (side: SetLog["side"], setIndex: number): SetLog => ({ id: `${side}-${setIndex}`, prescriptionId: slot.id, setIndex, side, status: "done", reps: 8, load: null, loadUnit: "lb", assistance: null, assistanceUnit: "lb", seconds: null, distance: null, at: "2026-10-08T12:00:00" });
const session = (logs: SetLog[]): WorkoutSession => ({ id: "test", planVersionId: plan.id, weekday: 1, localDate: "2026-10-08", name: "Test", why: "", chosen: false, startedAt: "", finishedAt: null, status: "active", snapshot: [slot], chosenExercise: {}, logs, extras: [], focusSlot: 0, note: "" });

test("unilateral completion requires both sides, or an explicit both-sides entry", () => {
  assert.equal(doneSetCount(session([log("left", 0), log("left", 1)]), slot), 0);
  const partial = session([log("left", 0), log("right", 0), log("left", 1)]);
  assert.equal(doneSetCount(partial, slot), 1);
  assert.equal(slotFinished(partial, slot), false);
  assert.equal(slotFinished(session([log("both", 0), log("both", 1)]), slot), true);
});

test("progress uses the minimum prescription, excludes optional work and distinguishes skipped work", () => {
  const skipped = { ...slot, id: "skip" };
  const s = session([log("both", 0), log("both", 1), { ...log("na", -1), prescriptionId: "skip", status: "skipped" }]);
  const p = sessionProgress([slot, skipped, { ...slot, id: "optional", optional: true }], s);
  assert.deepEqual(p, { completed: 1, skipped: 1, changed: 0, total: 2, done: 2, target: 4, percent: .5 });
});

test("recorded muscle coverage never substitutes planned activity when the window is empty", () => {
  const heat = heatSnapshot([], plan, 7, "2026-10-08");
  assert.equal(heat.source, "logged");
  assert.equal(heat.totalSets, 0);
  assert.ok(Object.values(heat.map).every((cell) => cell.effective === 0));
  assert.equal(heatSnapshot([session([log("both", 0)])], plan, 7, "2026-11-08").totalSets, 0);
});

test("resume label advances past a finished exercise instead of repeating stale focus", () => {
  const s = session([log("both", 0), log("both", 1)]);
  s.snapshot.push({ ...slot, id: "next", perSide: false });
  assert.match(progressLabel(s), /set 1 of 2$/);
});
