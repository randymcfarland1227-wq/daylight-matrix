import assert from "node:assert/strict";
import { test } from "node:test";
import { exerciseById } from "../daylight/exercises.ts";
import { formFor } from "../daylight/form.ts";
import { effectiveExerciseId, lastSet, logExerciseId, slotOptions, variantKey } from "../daylight/logic.ts";
import { addPdfAlternatives, migratePersisted } from "../daylight/migrate.ts";
import { buildPdfPlan, buildPdfDays } from "../daylight/plan.ts";
import { lyftaFor } from "../daylight/lyfta.ts";
import { NO_VIDEO, VIDEOS } from "../daylight/videos.ts";
import { NO_PHOTO, EX_IMAGES } from "../daylight/exImages.ts";
import type { Prescription, WorkoutSession } from "../daylight/types.ts";

/** Every "this or that" in the Fine Shyte Plan PDF (plus the leg press machine choice added in R18). */
const EITHER_OR: [weekday: number, main: string, alt: string][] = [
  [1, "assisted-pullup", "neutral-pullup"],
  [2, "hack-squat", "heel-elevated-goblet"],
  [2, "leg-press", "leg-press-seated"],
  [3, "machine-chest-press", "weighted-pushup"],
  [4, "pallof", "band-pallof"],
  [5, "hip-thrust", "machine-hip-thrust"],
  [5, "leg-curl", "lying-leg-curl"],
  [5, "reverse-lunge", "box-step-up"],
  [6, "shoulder-press", "machine-shoulder-press"],
  [6, "y-raise", "scaption-raise"],
];

const slotFor = (weekday: number, main: string) => buildPdfDays().find((d) => d.weekday === weekday)!.slots.find((s) => s.exerciseId === main)!;

test("r19: every either/or slot in the PDF carries both options", () => {
  for (const [wd, main, alt] of EITHER_OR) {
    const slot = slotFor(wd, main);
    assert.ok(slot, `${main} missing on weekday ${wd}`);
    assert.deepEqual(slotOptions(slot), [main, alt], `${main}: options`);
  }
});

test("r19: both options have full exercise data (name, steps, a demo or explicit fallback, photos or fallback)", () => {
  for (const [, main, alt] of EITHER_OR) for (const id of [main, alt]) {
    assert.ok(exerciseById(id), `${id}: exercise`);
    assert.ok((formFor(id)?.s.length ?? 0) >= 3, `${id}: steps`);
    assert.ok(VIDEOS[id] || NO_VIDEO[id], `${id}: video or fallback`);
    assert.ok(VIDEOS[id] || lyftaFor(id), `${id}: at least one demo (Vimeo or Lyfta)`);
    assert.ok(EX_IMAGES[id] || NO_PHOTO[id], `${id}: photos or fallback`);
  }
  // Combined "X or Y" moves were split so each option is one real movement.
  assert.ok(!/ or |\//.test(exerciseById("pallof")!.name));
  assert.ok(!/ or |\//.test(exerciseById("y-raise")!.name));
});

const slot = (): Prescription => slotFor(2, "leg-press");

test("r19: swap pick resolves per session, else the remembered pick, else the listed move", () => {
  const s = slot();
  assert.equal(effectiveExerciseId(s, 2, {}), "leg-press");
  const prefs = { [variantKey(2, s)]: "leg-press-seated" };
  assert.equal(effectiveExerciseId(s, 2, prefs), "leg-press-seated");
  assert.equal(effectiveExerciseId(s, 2, prefs, { [s.id]: "leg-press" }), "leg-press", "this session's pick wins");
  assert.equal(effectiveExerciseId(s, 2, { [variantKey(2, s)]: "bench-press" }), "leg-press", "a pick that is not a plan option is ignored");
  assert.equal(effectiveExerciseId(s, 3, prefs), "leg-press", "remembered per weekday slot");
});

test("r19: logged sets keep the move actually done, even after a mid-session swap", () => {
  const s = slot();
  const base = { setIndex: 0, side: "na" as const, status: "done" as const, reps: 10, load: 200, loadUnit: "lb" as const, assistance: null, assistanceUnit: "lb" as const, seconds: null, distance: null, at: "2026-10-20T10:00:00Z" };
  const session = {
    id: "s1", planVersionId: "p", weekday: 2, localDate: "2026-10-20", name: "Lower 1", why: "", chosen: false, startedAt: "", finishedAt: null, status: "active",
    snapshot: [s], chosenExercise: { [s.id]: "leg-press" }, focusSlot: 0, note: "", extras: [],
    logs: [{ ...base, id: "a", prescriptionId: s.id, exerciseId: "leg-press-seated" }, { ...base, id: "b", setIndex: 1, prescriptionId: s.id }],
  } as unknown as WorkoutSession;
  assert.equal(logExerciseId(session.logs[0]!, session), "leg-press-seated", "stamped move wins");
  assert.equal(logExerciseId(session.logs[1]!, session), "leg-press", "older logs fall back to the session pick");
  assert.equal(lastSet([session], "leg-press-seated", "other")?.set.id, "a");
  assert.equal(lastSet([session], "leg-press", "other")?.set.id, "b");
});

test("r19: migration v4 adds the PDF alternatives to a saved plan without touching anything else", () => {
  const saved = buildPdfPlan(2, "2026-01-01");
  for (const d of saved.days) for (const s of d.slots) s.alternatives = [];
  saved.days[0]!.slots.push({ ...saved.days[0]!.slots[0]!, id: "custom-1", exerciseId: "custom-x" });
  const out = migratePersisted({ schemaVersion: 3, planVersions: [saved], sessions: [] });
  const plans = out.planVersions as typeof saved[];
  const legPress = plans[0]!.days.find((d) => d.weekday === 2)!.slots.find((s) => s.exerciseId === "leg-press")!;
  assert.deepEqual(legPress.alternatives.map((a) => a.exerciseId), ["leg-press-seated"]);
  assert.ok(plans[0]!.days[0]!.slots.some((s) => s.id === "custom-1"), "custom slots kept");
  assert.deepEqual(out.variantPrefs, {});
  assert.deepEqual(addPdfAlternatives(plans), plans, "idempotent");
});
