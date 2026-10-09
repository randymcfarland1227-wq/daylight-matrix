import assert from "node:assert/strict";
import { test } from "node:test";
import { bodyNotes, noteRegion, noteArea, observationsForArea } from "../daylight/bodyNotes.ts";
import { buildDigest } from "../daylight/digest.ts";
import { seedPlan } from "../daylight/plan.ts";
import { migratePersisted } from "../daylight/migrate.ts";
import { OLD_REGION_TO_MUSCLE, REGIONS } from "../daylight/muscles.ts";
import { ALL_ZONES, ZONES } from "../daylight/turnZones.ts";
import type { Observation } from "../daylight/types.ts";

const obs = (id: string, ctx: Partial<Observation["context"]>): Observation => ({ id, text: id, createdAt: "2026-10-03T10:00:00Z", updatedAt: "2026-10-03T10:00:00Z", context: { date: "2026-10-03", time: "10:00", ...ctx }, tags: [], status: "open" });

test("turn figure: every region has at least one zone, and left/right are mirrored", () => {
  for (const r of REGIONS) assert.ok(ZONES.some((z) => z.id === r.id), `${r.id} has no zone on the turn figure`);
  for (const z of ZONES.filter((x) => x.mirror)) assert.ok(ALL_ZONES.some((a) => a.id === z.id && a.p[0] === -z.p[0]));
  for (const z of ALL_ZONES) assert.ok(z.p[1] > 0.1 && z.p[1] < 1.93, "zones sit inside a 6'4\" figure");
});

test("body notes: sub, region, group and old main-site region ids all land on a region", () => {
  assert.equal(noteRegion(obs("a", { muscleId: "rg-lats" })), "rg-lats");
  assert.equal(noteRegion(obs("b", { muscleId: "chest" })), REGIONS.find((r) => r.group === "chest")!.id);
  assert.equal(noteRegion(obs("c", { regionId: "quad-left" })), "rg-quads", "main's original 24-region ids");
  assert.equal(noteRegion(obs("d", { regionId: "lower-back" })), "rg-lowback");
  assert.equal(noteRegion(obs("e", {})), null);
  assert.equal(noteRegion(obs("f", { muscleId: "not-a-muscle" })), null);
});

test("body notes: one list, newest first, pins count per region", () => {
  const { list, pins } = bodyNotes([obs("old", { muscleId: "rg-chest", date: "2026-09-01" }), obs("n1", { regionId: "abs" }), obs("n2", { muscleId: "rg-abs" }), obs("plain", {})]);
  assert.equal(list.length, 3);
  assert.equal(list[list.length - 1]!.id, "old");
  assert.equal(pins["rg-abs"], 2);
  assert.equal(pins["rg-chest"], 1);
});

test("a blob saved by the live main build (original v1 store + region-attached notes) migrates and keeps its notes", () => {
  const main = {
    sessions: [{ id: "s1", planVersionId: "p1", weekday: 6, localDate: "2026-10-03", name: "Delts", why: "", chosen: false, startedAt: "x", finishedAt: null, status: "active", snapshot: [], chosenExercise: {}, logs: [], focusSlot: 0, note: "" }],
    observations: [obs("m1", { regionId: "abs" }), obs("m2", { regionId: "calf-front-left" })],
    planVersions: [],
    view: "training",
    selectedRegionId: "abs",
  };
  const out = migratePersisted(structuredClone(main)) as { observations: Observation[]; sessions: { extras: unknown[] }[]; schemaVersion: number };
  assert.equal(out.schemaVersion, 3);
  assert.equal(out.sessions.length, 1);
  assert.deepEqual(out.sessions[0]!.extras, []);
  assert.equal(out.observations[0]!.context.muscleId, OLD_REGION_TO_MUSCLE["abs"]);
  assert.equal(out.observations[1]!.context.muscleId, OLD_REGION_TO_MUSCLE["calf-front-left"]);
  assert.deepEqual(bodyNotes(out.observations).pins, { "rg-abs": 1, "rg-calves": 1 });
});


test("area journal keeps dates and sides, includes child areas and excludes adjacent areas", () => {
  const notes = [obs("old", { regionId: "lower-back", date: "2026-09-01", bodySide: "left" }), obs("sub", { muscleId: "erectors", date: "2026-10-02" }), obs("adjacent", { muscleId: "rg-lats" }), obs("group", { muscleId: "back" }), obs("plain", {})];
  assert.equal(noteArea(notes[0]!), "erectors");
  assert.deepEqual(observationsForArea(notes, "rg-lowback").map((n) => n.id), ["sub", "old"]);
  assert.deepEqual(observationsForArea(notes, "back").map((n) => n.id), ["adjacent", "group", "sub", "old"]);
  assert.equal(observationsForArea(notes, "rg-lowback", "2026-09-01")[0]!.context.bodySide, "left");
  assert.equal(observationsForArea(notes, "rg-lowback", "2026-10-08").length, 0);
  assert.equal(observationsForArea(notes).length, 4);
});

test("body observation dates and sides survive migration without being replaced by today", () => {
  const n = obs("dated", { muscleId: "rg-lowback", date: "2026-09-07", bodySide: "right" });
  const out = migratePersisted({ schemaVersion: 3, observations: [n] }) as { observations: Observation[] };
  assert.deepEqual(out.observations[0]!.context, n.context);
});


test("next-plan brief includes body area, observation date and side", () => {
  const n = { ...obs("Keep this observation", { muscleId: "rg-lowback", date: "2026-09-07", bodySide: "left" }), forNextPlan: true };
  const brief = buildDigest({ notes: [n], plan: seedPlan(), sessions: [], weeklyTarget: 10, planContext: "", units: "lb", today: "2026-10-08" });
  assert.match(brief, /Lower back/);
  assert.match(brief, /2026-09-07[^\n]*left/);
  assert.match(brief, /Keep this observation/);
});
