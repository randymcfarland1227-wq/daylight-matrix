import { test } from "node:test";
import assert from "node:assert/strict";
import { NERVES, entities, entitiesOf, entity, LYFTA_REFS } from "../daylight/anatomy";
import { GROUPS, REGIONS, SUBS } from "../daylight/muscles";
import { JOINTS } from "../daylight/joints";
import { LYFTA_REF_MEDIA } from "../daylight/lyftaRefs";

test("hub: every group, muscle, detail, joint and nerve has an entry with a description", () => {
  for (const id of [...GROUPS.map((g) => g.id), ...REGIONS.map((r) => r.id), ...SUBS.map((s) => s.id), ...JOINTS.map((j) => j.id), ...NERVES.map((n) => n.id)]) {
    const e = entity(id);
    assert.ok(e, id);
    assert.ok(e!.learn.does.length > 20, `${id} does`);
  }
  assert.equal(entitiesOf("nerve").length, NERVES.length);
  assert.ok(NERVES.filter((n) => n.major).length >= 13);
});

test("hub: every cross-link points at a real entry", () => {
  for (const e of entities().values()) {
    for (const k of ["worksWith", "opposes", "joints", "nerves"] as const) for (const id of e.learn[k] ?? []) assert.ok(entity(id), `${e.id}.${k} -> ${id}`);
    for (const c of e.children) assert.ok(entity(c), `${e.id} child ${c}`);
    if (e.parent) assert.ok(entity(e.parent), `${e.id} parent`);
  }
});

test("hub: every muscle-level entry has growth or recovery options; Lyfta refs are http(s) media or link-only", () => {
  for (const e of [...entitiesOf("muscle"), ...entitiesOf("joint")]) assert.ok((e.guide.recovery?.length ?? 0) > 0, `${e.id} recovery`);
  for (const r of Object.values(LYFTA_REFS)) {
    const m = LYFTA_REF_MEDIA[r.slug];
    if (m?.png) assert.match(m.png, /^https:\/\//);
    assert.doesNotMatch(`${m?.png ?? ""}${m?.mp4 ?? ""}`, /youtube|youtu\.be/);
  }
});
