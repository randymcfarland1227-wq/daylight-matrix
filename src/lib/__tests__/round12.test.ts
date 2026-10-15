import { test } from "node:test";
import assert from "node:assert/strict";
import { REGIONS, SUBS, GROUPS } from "../daylight/muscles.ts";
import { PROFILES, ROLE, FEEL, GROUP_PROFILES, JOINT_PROFILES, NERVE_PROFILES } from "../daylight/learnProfiles.ts";
import { JOINTS } from "../daylight/joints.ts";
import { NERVES } from "../daylight/anatomy.ts";
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

test("round 13: every sub has its own feel text; every group, joint and nerve has a profile", () => {
  for (const s of SUBS) assert.ok(FEEL[s.id], s.id);
  for (const g of GROUPS) assert.ok(GROUP_PROFILES[g.id], g.id);
  for (const j of JOINTS) assert.ok(JOINT_PROFILES[j.id], j.id);
  for (const n of NERVES) assert.ok(NERVE_PROFILES[n.id], n.id);
});

test("round 14: every sub-muscle is tappable on the image figure (area or deep marker)", async () => {
  const { IMAGE_MAP, IMAGE_PINS, warpPath } = await import("../daylight/imageMap.ts");
  const have = new Set([...IMAGE_MAP.front, ...IMAGE_MAP.back].map((r) => r.sub).concat([...IMAGE_PINS.front, ...IMAGE_PINS.back].map((p) => p.sub)));
  for (const s of SUBS) assert.ok(have.has(s.id), s.id);
  assert.match(warpPath("M150 92 C140 100 120 110 100 120"), /^M448 \d+ C\d+ \d+ \d+ \d+ \d+ \d+$/);
});
