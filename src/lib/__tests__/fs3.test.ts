import assert from "node:assert/strict";
import { test } from "node:test";
import { existsSync } from "node:fs";
import { exerciseById } from "../daylight/exercises.ts";
import { formFor } from "../daylight/form.ts";
import { metaFor } from "../daylight/exmeta.ts";
import { lyftaFor } from "../daylight/lyfta.ts";
import { NO_VIDEO, VIDEOS } from "../daylight/videos.ts";
import { NO_PHOTO, EX_IMAGES } from "../daylight/exImages.ts";
import { ART_MAP } from "../daylight/moveArt.ts";
import { addFs3Plan, migratePersisted } from "../daylight/migrate.ts";
import type { PlanVersion } from "../daylight/types.ts";
import { activePlan, buildPdfDays, buildPdfPlan } from "../daylight/plan.ts";
import { FS3_WARMUP, buildFs3Days, buildFs3Plan, isFs3Plan } from "../daylight/fs3.ts";

const fs3Ids = [...new Set(buildFs3Days().flatMap((d) => d.slots.map((s) => s.exerciseId)))];
const backupIds = [...new Set(buildFs3Days().flatMap((d) => d.slots.flatMap((s) => s.alternatives.map((a) => a.exerciseId))))];

test("fs3: six training days, Thursday and Sunday off", () => {
  const days = buildFs3Days();
  assert.deepEqual(days.filter((d) => d.scheduled).map((d) => d.weekday), [1, 2, 3, 5, 6]);
  assert.equal(days.find((d) => d.weekday === 4)!.slots.length, 0);
  assert.equal(days.find((d) => d.weekday === 0)!.slots.length, 0);
});

test("fs3: no move carries over from Fine Shyte 2", () => {
  const fs2 = new Set(buildPdfDays().flatMap((d) => d.slots.flatMap((s) => [s.exerciseId, ...s.alternatives.map((a) => a.exerciseId)])));
  assert.deepEqual(fs3Ids.filter((id) => fs2.has(id)), []);
  assert.deepEqual(backupIds.filter((id) => fs2.has(id)), [], "backups are brand-new, not Fine Shyte 2 moves");
});

test("fs3: every slot has 4 ranked backups with a match %, none repeating the plan move", () => {
  for (const d of buildFs3Days())
    for (const s of d.slots) {
      assert.equal(s.alternatives.length, 4, `${s.exerciseId} has 4 backups`);
      const m = s.alternatives.map((a) => a.match);
      for (const x of m) assert.ok(typeof x === "number" && x > 0 && x <= 100, `${s.exerciseId} match ${x}`);
      assert.deepEqual(m, [...m].sort((a, b) => b! - a!), `${s.exerciseId} ranked high to low`);
      const ids = s.alternatives.map((a) => a.exerciseId);
      assert.equal(new Set(ids).size, 4, `${s.exerciseId} backups unique`);
      assert.ok(!ids.includes(s.exerciseId) && !ids.some((id) => fs3Ids.includes(id)), `${s.exerciseId} backups are new moves`);
      assert.equal(new Set(s.alternatives.map((a) => a.id)).size, 4);
    }
});

test("fs3: backups stay off Planet Fitness gear it doesn't have and the banned loads", () => {
  const banned = /pullover machine|machine pullover|machine lateral|belt squat|sled|machine high row|nordic|ez[- ]bar|shrug|barbell|crunch|sit-up/i;
  for (const id of backupIds) {
    const ex = exerciseById(id)!;
    assert.ok(!banned.test(`${ex.name} ${ex.equipment}`), `${id}: ${ex.name} / ${ex.equipment}`);
  }
});

test("fs3: every move and backup has full data (def, muscles, form, meta, art, demo or reason, photos or reason)", () => {
  for (const id of [...fs3Ids, ...backupIds]) {
    const ex = exerciseById(id);
    assert.ok(ex, `${id} def`);
    assert.ok(ex!.muscles && Object.keys(ex!.muscles).length, `${id} muscles`);
    assert.ok(ex!.equipment, `${id} equipment`);
    assert.ok(ex!.back && ex!.backNote, `${id} back note`);
    const f = formFor(id);
    assert.ok(f && f.s.length >= 3 && f.err.length && f.back && f.feel && f.rom && f.tempo, `${id} form`);
    assert.ok(metaFor(id).force !== "Mixed", `${id} meta`);
    assert.ok(ART_MAP[id], `${id} art`);
    assert.ok(VIDEOS[id] || NO_VIDEO[id], `${id} video or reason`);
    assert.ok(lyftaFor(id) || NO_VIDEO[id], `${id} demo`);
    if (EX_IMAGES[id]) {
      for (const i of [0, 1]) assert.ok(existsSync(`public/media/exercises/${id}-${i}.jpg`), `${id} photo ${i}`);
    } else assert.ok(NO_PHOTO[id], `${id} photo or reason`);
  }
});

test("fs3: warm-up menu links point at real moves", () => {
  for (const g of FS3_WARMUP) for (const it of g.items) if (it.exerciseId) assert.ok(exerciseById(it.exerciseId), it.exerciseId);
});

test("fs3: migration adds Fine Shyte 3 as the newest version and keeps history", () => {
  const out = migratePersisted({ schemaVersion: 4, planVersions: [buildPdfPlan(1, "2000-01-01")] });
  const plans = out.planVersions as ReturnType<typeof buildFs3Plan>[];
  assert.equal(plans.length, 2);
  assert.ok(isFs3Plan(activePlan(plans, "2026-10-27")));
  assert.ok(!isFs3Plan(activePlan(plans, "2026-10-26")));
  assert.equal(addFs3Plan(plans).length, 2);
});

test("fs3: v5 saves with the first Fine Shyte 3 get the corrected days; user-saved versions untouched", () => {
  const stale = buildFs3Plan(2);
  stale.days = stale.days.map((d) => ({ ...d, slots: d.slots.map((s) => ({ ...s, exerciseId: s.exerciseId === "landmine-meadows-row" ? "bench-db-row" : s.exerciseId })) }));
  const mine = { ...buildFs3Plan(3), id: "user-123", days: [] };
  const out = migratePersisted({ schemaVersion: 5, planVersions: [buildPdfPlan(1, "2000-01-01"), stale, mine] });
  const plans = out.planVersions as PlanVersion[];
  const ids = plans[1]!.days.flatMap((d) => d.slots.map((s) => s.exerciseId));
  assert.ok(ids.includes("landmine-meadows-row") && !ids.includes("bench-db-row"));
  assert.equal(plans[2]!.days.length, 0);
});

test("fs3: v6 saves pick up the backups (schema bump refreshes the generated version only)", () => {
  const old = buildFs3Plan(2);
  old.days = old.days.map((d) => ({ ...d, slots: d.slots.map((s) => ({ ...s, alternatives: [] })) }));
  const mine = { ...buildFs3Plan(3), id: "user-9", days: old.days };
  const out = migratePersisted({ schemaVersion: 6, planVersions: [buildPdfPlan(1, "2000-01-01"), old, mine] });
  const plans = out.planVersions as PlanVersion[];
  assert.ok(plans[1]!.days.flatMap((d) => d.slots).every((s) => s.alternatives.length === 4));
  assert.ok(plans[2]!.days.flatMap((d) => d.slots).every((s) => s.alternatives.length === 0));
});

test("fs3: v7 saves pick up the Nov 17 cut adds; older slot ids stay put", () => {
  const before = new Map([["fs3-mon-5", "neutral-flat-db-press"], ["fs3-mon-7", "stir-the-pot"], ["fs3-fri-7", "serratus-punch"], ["fs3-sat-10", "bottoms-up-kb-carry"]]);
  const old = buildFs3Plan(2);
  const adds = ["neutral-incline-db-press", "sa-low-high-cable-fly", "reclined-leg-extension", "band-dead-bug", "incline-reverse-crunch"];
  old.days = old.days.map((d) => ({ ...d, slots: d.slots.filter((s) => !adds.includes(s.exerciseId)) }));
  const out = migratePersisted({ schemaVersion: 7, planVersions: [buildPdfPlan(1, "2000-01-01"), old] });
  const slots = (out.planVersions as PlanVersion[])[1]!.days.flatMap((d) => d.slots);
  for (const a of adds) assert.ok(slots.some((s) => s.exerciseId === a), a);
  for (const [id, ex] of before) assert.equal(slots.find((s) => s.id === id)?.exerciseId, ex, id);
  assert.equal(new Set(slots.map((s) => s.id)).size, slots.length, "slot ids unique");
  const mon = buildFs3Days().find((d) => d.weekday === 1)!.slots.map((s) => s.exerciseId);
  assert.ok(mon.indexOf("neutral-incline-db-press") < mon.indexOf("neutral-flat-db-press"), "incline is the first chest move");
});
