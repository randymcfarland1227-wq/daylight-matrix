import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { exercises as EXERCISES } from "../daylight/exercises.ts";
import { demoUrl } from "../daylight/form.ts";
import { buildPdfDays, seedPlan } from "../daylight/plan.ts";
import { embedUrl, isVideoId, NO_VIDEO, thumbUrl, VERIFIED_AT, videoFor, VIDEOS, watchUrl } from "../daylight/videos.ts";

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

test("videos: embeds use youtube-nocookie, thumbnails use ytimg, and the fallback search link still exists", () => {
  const v = videoFor("hack-squat")!;
  assert.ok(embedUrl(v.id).startsWith("https://www.youtube-nocookie.com/embed/"));
  assert.ok(thumbUrl(v.id).startsWith("https://i.ytimg.com/vi/") && thumbUrl(v.id).endsWith("/hqdefault.jpg"));
  assert.equal(watchUrl(v.id), `https://www.youtube.com/watch?v=${v.id}`);
  assert.equal(videoFor("battle-rope-squat"), undefined);
  assert.match(demoUrl("battle-rope-squat"), /youtube\.com\/results\?search_query=/);
});

test("service worker never intercepts or caches YouTube / ytimg", () => {
  const sw = readFileSync(new URL("../../../public/sw.js", import.meta.url), "utf8").replaceAll("\\.", ".");
  for (const host of ["youtube.com", "youtube-nocookie.com", "ytimg.com"]) assert.ok(sw.includes(host), `${host} missing from sw deny list`);
  assert.ok(/THIRD_PARTY_MEDIA\.test\(url\.hostname\)/.test(sw));
  assert.ok(/origin !== self\.location\.origin/.test(sw), "cross-origin requests must stay un-cached");
});
