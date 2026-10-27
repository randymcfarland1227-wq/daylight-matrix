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

test("fs3: six training days, Thursday and Sunday off", () => {
  const days = buildFs3Days();
  assert.deepEqual(days.filter((d) => d.scheduled).map((d) => d.weekday), [1, 2, 3, 5, 6]);
  assert.equal(days.find((d) => d.weekday === 4)!.slots.length, 0);
  assert.equal(days.find((d) => d.weekday === 0)!.slots.length, 0);
});

test("fs3: no move carries over from Fine Shyte 2", () => {
  const fs2 = new Set(buildPdfDays().flatMap((d) => d.slots.flatMap((s) => [s.exerciseId, ...s.alternatives.map((a) => a.exerciseId)])));
  assert.deepEqual(fs3Ids.filter((id) => fs2.has(id)), []);
});

test("fs3: every move has full data (def, muscles, form, meta, art, demo or reason, photos or reason)", () => {
  for (const id of fs3Ids) {
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
