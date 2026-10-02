import assert from "node:assert/strict";
import { test } from "node:test";
import { exercises } from "../daylight/exercises.ts";
import { DIFFICULTY_RANK, EQUIPMENT_CATS, MUSCLEWIKI_SLUGS, equipCats, metaFor, muscleWikiUrl, tagsFor } from "../daylight/exmeta.ts";
import { GROUP_HUE, ROLE_STRENGTH, rampColor, roleColor } from "../daylight/figureColors.ts";
import { migratePersisted } from "../daylight/migrate.ts";
import { GROUP_IDS, REGIONS, SUB_IDS, isRegion, regionOfSub, resolveMuscle, subsOf, targetFor } from "../daylight/muscles.ts";
import { activePlan, seedPlan } from "../daylight/plan.ts";
import { plannedVolume, weightFor } from "../daylight/volume.ts";
import { ART_MAP, artFor } from "../daylight/moveArt.ts";

test("regions: every sub-muscle sits in exactly one region, within its own group", () => {
  const seen = new Map<string, string>();
  for (const r of REGIONS) {
    assert.ok(isRegion(r.id));
    for (const s of r.subs) {
      assert.ok(!seen.has(s), `${s} in two regions`);
      seen.set(s, r.id);
      assert.equal(regionOfSub(s).id, r.id);
    }
  }
  for (const s of SUB_IDS) assert.ok(seen.has(s), `${s} has no region`);
  assert.equal(REGIONS.length, 18);
});

test("subsOf resolves groups, regions and subs", () => {
  for (const g of GROUP_IDS) assert.ok(subsOf(g).length > 0, g);
  for (const r of REGIONS) assert.deepEqual(subsOf(r.id).sort(), [...r.subs].sort());
  assert.deepEqual(subsOf(SUB_IDS[0]!), [SUB_IDS[0]]);
});

test("targets scale: group > region >= sub", () => {
  const g = targetFor("chest", 10);
  const r = targetFor("rg-chest", 10);
  assert.ok(g > r && r > 0);
  assert.ok(targetFor(SUB_IDS[0]!, 10) <= r + 1e-9);
});

test("planned volume carries region keys that match their subs", () => {
  const plan = activePlan([seedPlan()], "2026-10-01")!;
  const vol = plannedVolume(plan);
  for (const r of REGIONS) assert.ok(vol[r.id] !== undefined, `${r.id} missing`);
  const chest = vol["rg-chest"].effective;
  assert.ok(chest > 0, "chest region has planned volume");
  assert.ok(vol["chest"].effective >= chest - 1e-9);
  const sub = REGIONS.find((r) => r.id === "rg-chest")!.subs[0]!;
  assert.equal(weightFor({ [sub]: 1 } as never, "rg-chest"), 1);
  assert.equal(weightFor({ [sub]: 1 } as never, sub), 1);
});

test("every exercise has metadata, equipment categories and tags", () => {
  for (const e of exercises) {
    const m = metaFor(e.id);
    assert.ok(m.difficulty in DIFFICULTY_RANK, `${e.id} difficulty`);
    const cats = equipCats(e.id);
    assert.ok(cats.length > 0, `${e.id} equipment`);
    for (const c of cats) assert.ok((EQUIPMENT_CATS as readonly string[]).includes(c));
    assert.ok(tagsFor(e.id).length > 0, `${e.id} tags`);
  }
});

test("MuscleWiki links only exist for real exercise ids, as link-outs on musclewiki.com", () => {
  const ids = new Set(exercises.map((e) => e.id));
  for (const k of Object.keys(MUSCLEWIKI_SLUGS)) {
    assert.ok(ids.has(k), `${k} is not an exercise`);
    assert.match(muscleWikiUrl(k)!, /^https:\/\/musclewiki\.com\//);
  }
});

test("figure colours: ramp is cold to hot, roles get weaker, groups are distinct and never bright green", () => {
  const rgb = (h: string) => (h.startsWith("#") ? [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)) : (h.match(/\d+/g) ?? []).map(Number));
  const lo = rgb(rampColor(0.05));
  const hi = rgb(rampColor(1));
  assert.ok(lo[2]! > lo[0]! && hi[0]! > hi[2]!, "blue at the cold end, red at the hot end");
  assert.notEqual(rampColor(0), rampColor(0.3));
  assert.ok(ROLE_STRENGTH.primary > ROLE_STRENGTH.secondary && ROLE_STRENGTH.secondary > ROLE_STRENGTH.tertiary);
  assert.notEqual(roleColor("chest", "primary"), roleColor("chest", "tertiary"));
  const hues = Object.values(GROUP_HUE);
  assert.equal(new Set(hues).size, hues.length);
  for (const h of hues) { const [r, g, b] = rgb(h) as [number, number, number]; assert.ok(!(g > 190 && g > r + 60 && g > b + 60), `${h} too green`); }
});

test("legacy muscle ids still resolve; stored data migrates without a schema change", () => {
  for (const id of ["mid-back", "chest", "rg-chest", SUB_IDS[0]!]) assert.ok(resolveMuscle(id), id);
  const out = migratePersisted({ schemaVersion: 3, theme: "dark", selectedMuscleId: "mid-back" }) as Record<string, unknown>;
  assert.equal(out.theme, "dark");
});

test("every mapped move diagram exists, and the reworked ones have their own pattern", () => {
  for (const id of Object.keys(ART_MAP)) assert.ok(artFor(id), id);
  assert.notEqual(ART_MAP["cable-woodchop"], ART_MAP["cable-crunch"]);
  assert.notEqual(ART_MAP["nordic-curl"], ART_MAP["lying-leg-curl"]);
  assert.notEqual(ART_MAP["wall-sit"], ART_MAP["hack-squat"]);
  assert.notEqual(ART_MAP["lat-pulldown"], ART_MAP["half-kneeling-pulldown"]);
});
