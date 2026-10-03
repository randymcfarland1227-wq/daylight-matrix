import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { exercises as EXERCISES } from "../daylight/exercises.ts";
import { demoUrl } from "../daylight/form.ts";
import { buildPdfDays, seedPlan } from "../daylight/plan.ts";
import { EX_IMAGES, NO_PHOTO, photosFor, PHOTO_SOURCE, VERIFIED_AT as PHOTO_VERIFIED_AT } from "../daylight/exImages.ts";
import { isVideoId, NO_VIDEO, VERIFIED_AT, videoFor, VIDEOS, watchUrl } from "../daylight/videos.ts";

const planIds = (): Set<string> => {
  const ids = new Set<string>();
  for (const d of buildPdfDays()) for (const s of d.slots) {
    ids.add(s.exerciseId);
    for (const a of s.alternatives ?? []) ids.add(a.exerciseId);
  }
  for (const d of seedPlan().days) for (const s of d.slots) {
    ids.add(s.exerciseId);
    for (const a of s.alternatives ?? []) ids.add(a.exerciseId);
  }
  return ids;
};

test("videos: every entry has an 11-char YouTube id, title, channel and a verification date", () => {
  const entries = Object.entries(VIDEOS);
  assert.ok(entries.length >= 80, `expected broad coverage, got ${entries.length}`);
  for (const [key, v] of entries) {
    assert.ok(isVideoId(v.id), `${key}: bad video id ${v.id}`);
    assert.ok(v.title.trim().length > 3, `${key}: missing title`);
    assert.ok(v.channel.trim().length > 1, `${key}: missing channel`);
    assert.equal(v.verifiedAt, VERIFIED_AT, `${key}: verifiedAt`);
    assert.match(v.verifiedAt, /^\d{4}-\d{2}-\d{2}$/);
  }
});

test("videos: every key is a real exercise, and no exercise is both a video and an explicit fallback", () => {
  const ids = new Set(EXERCISES.map((e) => e.id));
  for (const k of Object.keys(VIDEOS)) assert.ok(ids.has(k), `${k} is not in the catalog`);
  for (const k of Object.keys(NO_VIDEO)) {
    assert.ok(ids.has(k), `${k} (fallback) is not in the catalog`);
    assert.equal(VIDEOS[k], undefined, `${k} is listed as both video and fallback`);
    assert.ok(NO_VIDEO[k]!.length > 10, `${k}: fallback needs a reason`);
  }
});

test("videos: every plan exercise (slots and alternatives) has a video or an explicit fallback", () => {
  const ids = planIds();
  assert.ok(ids.size >= 55);
  for (const id of ids) assert.ok(VIDEOS[id] || NO_VIDEO[id], `plan move ${id} has neither a video nor an explicit fallback`);
});

test("videos: the whole catalog is accounted for (video or explicit fallback)", () => {
  for (const e of EXERCISES) assert.ok(VIDEOS[e.id] || NO_VIDEO[e.id], `${e.id} unaccounted for`);
});

test("videos.ts is a reference-link list only: plain watch URLs, and the fallback search link still exists", () => {
  const v = videoFor("hack-squat")!;
  assert.equal(watchUrl(v.id), `https://www.youtube.com/watch?v=${v.id}`);
  assert.equal(videoFor("battle-rope-squat"), undefined);
  assert.match(demoUrl("battle-rope-squat"), /youtube\.com\/results\?search_query=/);
});

const walk = (dir: string): string[] => readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? walk(join(dir, f)) : [join(dir, f)]));

test("round 5: the app embeds no YouTube (no iframe, no youtube-nocookie, no ytimg thumbnails) in its source", () => {
  const root = new URL("../../", import.meta.url).pathname;
  for (const f of [...walk(join(root, "components")), ...walk(join(root, "lib/daylight"))].filter((x) => /\.(tsx?|css)$/.test(x))) {
    const src = readFileSync(f, "utf8");
    assert.ok(!/<iframe/i.test(src), `${f} renders an iframe`);
    assert.ok(!/youtube-nocookie|ytimg\.com/.test(src), `${f} references a YouTube embed/thumbnail host`);
  }
});

test("photos: every entry names its source and license, and has start+end https image URLs from the licensed dataset", () => {
  const entries = Object.entries(EX_IMAGES);
  assert.ok(entries.length >= 60, `expected broad photo coverage, got ${entries.length}`);
  assert.equal(PHOTO_SOURCE.license, "The Unlicense (public domain)");
  assert.ok(PHOTO_SOURCE.attribution.length > 20);
  for (const [key, p] of entries) {
    assert.equal(p.source, "free-exercise-db", `${key}: source`);
    assert.equal(p.license, "Unlicense", `${key}: license`);
    assert.equal(p.verifiedAt, PHOTO_VERIFIED_AT);
    assert.ok(p.name && p.equipment && p.dbId, `${key}: dataset name/equipment/id`);
    assert.ok(p.match === "exact" || p.match === "close", `${key}: match kind`);
    assert.equal(p.images.length, 2, `${key}: start and end photo`);
    for (const u of p.images) assert.match(u, /^https:\/\/raw\.githubusercontent\.com\/yuhonas\/free-exercise-db\/main\/exercises\/[\w.%-]+\/[01]\.jpg$/, `${key}: ${u}`);
  }
});

test("photos: every key is a real exercise, and each exercise has photos or an explicit no-photo fallback (plan moves included)", () => {
  const ids = new Set(EXERCISES.map((e) => e.id));
  for (const k of Object.keys(EX_IMAGES)) assert.ok(ids.has(k), `${k} not in catalog`);
  for (const k of Object.keys(NO_PHOTO)) {
    assert.ok(ids.has(k), `${k} (no-photo) not in catalog`);
    assert.equal(EX_IMAGES[k], undefined, `${k} is both photo and no-photo`);
    assert.ok(NO_PHOTO[k]!.length > 10, `${k}: needs a reason`);
  }
  for (const e of EXERCISES) assert.ok(photosFor(e.id) || NO_PHOTO[e.id], `${e.id} unaccounted for`);
  for (const id of planIds()) assert.ok(photosFor(id) || NO_PHOTO[id], `plan move ${id} has neither photos nor an explicit fallback`);
});

test("service worker: never touches YouTube; caches only the licensed photo set cross-origin", () => {
  const sw = readFileSync(new URL("../../../public/sw.js", import.meta.url), "utf8").replaceAll("\\.", ".");
  for (const host of ["youtube.com", "youtube-nocookie.com", "ytimg.com"]) assert.ok(sw.includes(host), `${host} missing from sw deny list`);
  assert.ok(/THIRD_PARTY_MEDIA\.test\(url\.hostname\)/.test(sw));
  assert.ok(/origin !== self\.location\.origin/.test(sw), "other cross-origin requests must stay un-cached");
  assert.ok(sw.includes('PHOTO_PATH = "/yuhonas/free-exercise-db/"') && sw.includes('PHOTO_HOST = "raw.githubusercontent.com"'));
});
