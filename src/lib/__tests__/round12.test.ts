import { test } from "node:test";
import assert from "node:assert/strict";
import { REGIONS, SUBS, GROUPS } from "../daylight/muscles.ts";
import { PROFILES, ROLE } from "../daylight/learnProfiles.ts";
import { exercises } from "../daylight/exercises.ts";
import { FRONT, BACK } from "../daylight/bodyPaths.ts";

test("every region has a full profile and every sub a role line", () => {
  for (const r of REGIONS) { const p = PROFILES[r.id]; assert.ok(p && p.everyday.length && p.patterns.length && p.mistakes.length, r.id); }
  for (const s of SUBS) assert.ok(ROLE[s.id], s.id);
});
test("every sub-muscle has at least one exercise that clearly works it", () => {
  for (const s of SUBS) assert.ok(exercises.some((e) => ((e.muscles as Record<string, number>)[s.id] ?? 0) >= 0.5), s.id);
});
test("glutes, hamstrings and adductors break into their real muscles on the map", () => {
  const subs = (g: string) => GROUPS.find((x) => x.id === g)!.subs;
  assert.deepEqual(subs("hamstrings"), ["ham-medial", "ham-semimem", "ham-lateral"]);
  assert.ok(["glute-max", "glute-med", "glute-min"].every((x) => subs("glutes").includes(x as never)));
  assert.equal(subs("adductors").length, 3);
  for (const id of ["traps-mid", "teres-major", "brachioradialis", "gracilis", "adductor-longus", "ham-semimem"]) assert.ok([...FRONT, ...BACK].some((p) => p.muscle === id), id);
});
