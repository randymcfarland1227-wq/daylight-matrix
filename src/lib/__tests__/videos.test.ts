import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { exercises as EXERCISES } from "../daylight/exercises.ts";
import { demoUrl } from "../daylight/form.ts";
import { buildPdfDays, seedPlan } from "../daylight/plan.ts";
import { EX_IMAGES, NO_PHOTO, photosFor, PHOTO_SOURCE, VERIFIED_AT as PHOTO_VERIFIED_AT } from "../daylight/exImages.ts";
import { isVimeoId, NO_VIDEO, VERIFIED_AT, VIDEO_LIBRARY, videoCredit, videoFor, VIDEOS, vimeoEmbedUrl, vimeoPageUrl } from "../daylight/videos.ts";

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

test("videos: every entry is a Vimeo clip with a numeric id, title, author, duration, size and a verification date", () => {
  const entries = Object.entries(VIDEOS);
  assert.ok(entries.length >= 60, `expected broad coverage, got ${entries.length}`);
  for (const [key, v] of entries) {
    assert.equal(v.host, "vimeo", `${key}: host`);
    assert.ok(isVimeoId(v.id), `${key}: bad Vimeo id ${v.id}`);
    assert.ok(v.title.trim().length > 3, `${key}: missing title`);
    assert.ok(v.author.trim().length > 1, `${key}: missing author`);
    assert.match(v.authorUrl, /^https:\/\/vimeo\.com\//, `${key}: author url`);
    assert.ok(v.duration > 0 && v.duration < 180, `${key}: short demo expected, got ${v.duration}s`);
    assert.ok(v.width > 0 && v.height > 0, `${key}: size`);
    assert.ok(v.match === "exact" || v.match === "close", `${key}: match`);
    assert.equal(typeof v.playerChecked, "boolean");
    assert.equal(v.verifiedAt, VERIFIED_AT, `${key}: verifiedAt`);
    assert.match(v.verifiedAt, /^\d{4}-\d{2}-\d{2}$/);
  }
  assert.equal(VIDEO_LIBRARY.host, "vimeo");
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

test("videos: every plan exercise (slots and alternatives) has a clip or an explicit fallback that still has photos or the diagram", () => {
  const ids = planIds();
  assert.ok(ids.size >= 55);
  for (const id of ids) {
    assert.ok(VIDEOS[id] || NO_VIDEO[id], `plan move ${id} has neither a video nor an explicit fallback`);
    if (!VIDEOS[id]) assert.ok(photosFor(id) || NO_PHOTO[id], `${id}: no video, so it needs photos or the diagram fallback`);
  }
});

test("videos: the whole catalog is accounted for (video or explicit fallback)", () => {
  for (const e of EXERCISES) assert.ok(VIDEOS[e.id] || NO_VIDEO[e.id], `${e.id} unaccounted for`);
});

test("videos: the only embed URL is Vimeo's official player (muted autoplay loop, inline, dnt), credit names title + author + Vimeo", () => {
  const v = videoFor("hack-squat")!;
  assert.equal(vimeoEmbedUrl(v), `https://player.vimeo.com/video/${v.id}?autoplay=1&muted=1&loop=1&playsinline=1&title=0&byline=0&portrait=0&dnt=1`);
  assert.equal(vimeoEmbedUrl({ id: "123456", start: 7 }).endsWith("#t=7s"), true);
  assert.equal(vimeoPageUrl(v.id), `https://vimeo.com/${v.id}`);
  assert.equal(videoCredit(v), `Video: ${v.title} by ${v.author} on Vimeo`);
  assert.equal(videoFor("battle-rope-squat"), undefined);
  assert.match(demoUrl("battle-rope-squat"), /^https:\/\/vimeo\.com\/search\?q=/);
});

const walk = (dir: string): string[] => readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? walk(join(dir, f)) : [join(dir, f)]));

test("round 6: iframes only for player.vimeo.com; no YouTube host anywhere in the app source", () => {
  const root = new URL("../../", import.meta.url).pathname;
  let iframes = 0;
  for (const f of [...walk(join(root, "components")), ...walk(join(root, "lib/daylight")), ...walk(join(root, "routes"))].filter((x) => /\.(tsx?|css)$/.test(x))) {
    const src = readFileSync(f, "utf8");
    assert.ok(!/youtube\.com|youtu\.be|youtube-nocookie|ytimg\.com|googlevideo\.com/i.test(src), `${f} references a YouTube host`);
    const n = (src.match(/<iframe/gi) ?? []).length;
    if (!n) continue;
    iframes += n;
    assert.ok(f.endsWith("MoveMedia.tsx"), `${f} renders an iframe; only MoveMedia may (Vimeo player)`);
    const hosts = [...src.matchAll(/https?:\/\/([a-z0-9.-]+)/gi)].map((m) => m[1]!.toLowerCase());
    for (const h of hosts) assert.ok(["player.vimeo.com", "vimeo.com"].includes(h) || !/video|player|embed/.test(h), `${f}: unexpected media host ${h}`);
  }
  assert.equal(iframes, 1, "exactly one iframe (the Vimeo player)");
  const vsrc = readFileSync(join(root, "lib/daylight/videos.ts"), "utf8");
  const embedHosts = new Set([...vsrc.matchAll(/https:\/\/([a-z0-9.-]+)\/video\//gi)].map((m) => m[1]));
  assert.deepEqual([...embedHosts], ["player.vimeo.com"]);
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

test("service worker: never touches Vimeo or YouTube; caches only the licensed photo set cross-origin", () => {
  const sw = readFileSync(new URL("../../../public/sw.js", import.meta.url), "utf8").replaceAll("\\.", ".");
  for (const host of ["vimeo.com", "vimeocdn.com", "youtube.com", "youtube-nocookie.com", "ytimg.com"]) assert.ok(sw.includes(host), `${host} missing from sw deny list`);
  const re = /const THIRD_PARTY_MEDIA = (\/.+\/);/.exec(readFileSync(new URL("../../../public/sw.js", import.meta.url), "utf8"));
  const deny = new Function(`return ${re![1]}`)() as RegExp;
  for (const h of ["player.vimeo.com", "vimeo.com", "f.vimeocdn.com", "i.vimeocdn.com", "www.youtube.com"]) assert.ok(deny.test(h), `${h} must be on the never-cache list`);
  assert.ok(!deny.test("raw.githubusercontent.com"));
  assert.ok(/if \(THIRD_PARTY_MEDIA\.test\(url\.hostname\)\) return;/.test(sw), "media hosts bail out before any caching branch");
  assert.ok(/THIRD_PARTY_MEDIA\.test\(url\.hostname\)/.test(sw));
  assert.ok(/origin !== self\.location\.origin/.test(sw), "other cross-origin requests must stay un-cached");
  assert.ok(sw.includes('PHOTO_PATH = "/yuhonas/free-exercise-db/"') && sw.includes('PHOTO_HOST = "raw.githubusercontent.com"'));
});
