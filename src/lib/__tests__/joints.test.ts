import { test } from "node:test";
import assert from "node:assert/strict";
import { JOINTS, heatTone, jointHeat, jointMoves, jointNotes } from "../daylight/joints";
import { fitSize } from "../daylight/noteImages";
import { seedPlan } from "../daylight/plan";

test("fitSize caps the long edge at 1280 and keeps aspect", () => {
  assert.deepEqual(fitSize(4032, 3024, 1280), { w: 1280, h: 960 });
  assert.deepEqual(fitSize(3024, 4032, 1280), { w: 960, h: 1280 });
  assert.deepEqual(fitSize(800, 600, 1280), { w: 800, h: 600 });
});

test("all required joints exist with at least one map point", () => {
  for (const id of ["neck", "shoulder", "elbow", "wrist", "tspine", "lumbar", "si", "hip", "knee", "ankle"]) {
    const j = JOINTS.find((x) => x.id === id);
    assert.ok(j && (j.front || j.back), id);
  }
});

test("hip and lumbar pick up PT board moves", () => {
  const plan = seedPlan();
  const hip = jointMoves(JOINTS.find((j) => j.id === "hip")!, plan).map((m) => m.exerciseId);
  assert.ok(hip.includes("clamshell"), hip.join());
  assert.ok(jointMoves(JOINTS.find((j) => j.id === "lumbar")!, plan).length > 0);
});

test("joint heat averages the last 14 days only", () => {
  const logs = [
    { id: "a", jointId: "knee", date: "2026-10-09", time: "08:00", level: 6 },
    { id: "b", jointId: "knee", date: "2026-10-01", time: "08:00", level: 2 },
    { id: "c", jointId: "knee", date: "2026-09-01", time: "08:00", level: 10 },
  ];
  assert.equal(jointHeat(logs, "knee", "2026-10-09"), 4);
  assert.equal(jointHeat(logs, "hip", "2026-10-09"), null);
  assert.equal(heatTone(4), "mild");
  assert.equal(heatTone(null), "none");
});

test("joint notes filter by jointId", () => {
  const o = (id: string, jointId?: string) => ({ id, text: id, createdAt: "", updatedAt: "", tags: [], status: "open" as const, context: { date: "2026-10-09", time: "08:00", jointId } });
  assert.deepEqual(jointNotes([o("1", "knee"), o("2"), o("3", "hip")], "knee").map((n) => n.id), ["1"]);
});
