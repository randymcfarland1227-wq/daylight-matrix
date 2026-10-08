# Daylight Matrix — overhaul plan (branch `overhaul`)

Status: **built, verified locally, NOT published.** Branch `overhaul`. Nothing has been pushed to `main` of either repo.

## 1. Findings on the current build (main @ 7827c49)

* Stack as described: Vite + TanStack Start (static SPA prerender for Pages), React 19, Tailwind v4, zustand `persist` under the key `daylight-matrix-v1` (no `version`, i.e. version 0). A second key `daylight-custom-exercises` holds custom exercise names.
* The weekly plan (`plan.ts`) is **mostly empty**: Wednesday, Friday and Saturday have zero exercises, Monday has 4 of ~14 items, Tuesday 2, Thursday 3. No form cues, no day PSAs at all. This is the root of "weak": the app could not actually run Randy's plan.
* Body map: 24 hand-placed SVG blobs per left/right side; the front/back JPGs are not used by the map (they are only referenced in the build output). Heat is a 4-band count of logged *primary* sets only; no weights, no planned fallback, no underserved view, no "grow this area".
* Notes: an `Observation` model exists with 4 fixed tags, a status workflow ("trial" -> "applied change"), but no one-tap capture, no for-next-plan flag, no digest, notes only reachable from Today's note card / session drawer.
* Food: inventory/recipes/shopping/prep exist but are static lists; no weekly meal plan, no link to training days, no water progress, no use-soon workflow, protein goal only.
* PWA: `<link rel=manifest>` points at `__grok/manifest.webmanifest` which only exists on the dev server, so the Pages build had **no manifest** (404). Fonts load from Google at runtime (no offline).
* Persisted data that must survive: everything in `Data` (sessions with embedded plan snapshots, set logs, observations, trials, food/fluid logs, inventory, shopping, prep, goals, plan versions, custom exercise names).

## 2. PDF vs existing `plan.ts` (PDF is the source of truth)

Verified by `pdftotext -layout`, per-cell `pdftotext -x/-y/-W/-H` extraction (columns are scrambled in plain layout mode) and rendered page images.

| Day | Existing build | PDF | Fixed |
|---|---|---|---|
| Mon Pull + Abs | PT x3 (doses OK) + Assisted/Neutral Pull-Up only | + Chest-Supported Row 4x8-10, Half-Kneeling 1-Arm Lat Pulldown 3x10/side, Face Pull w/ ER 3x12-15, Incline DB Shrug 3x10-12, Straight-Arm Rope Pulldown 2-3x12-15, Reverse Crunch 3x10-12, Cable Crunch 2x12, PSA | yes |
| Tue Lower 1 / Quad + Cardio | Clamshells filed as a main lift; open "Cardio" slot with no dose | PT: Clamshells w/ Band 2x15/side, Band Walks 2x12 steps each way, Core Activation Single-Leg Stand 2x20s/side. Workout: Hack Squat or Heel-Elevated Goblet Squat 4x6-8, Bulgarian Split Squat 3x8/side, Leg Press Mid Stance 3x10-12, Leg Extension 2-3x12-15, Standing Calf Raise 4x10-12, Tibialis Raise 3x15-20. Finisher: Cardio 15-20 min (incline walk, bike or elliptical). PSAs | yes |
| Wed Push + Shoulders | **empty** | PT: PPT w/ Shoulder Flexion 2x8, Seated Pigeon Pose 2x30-45s/side, Dead Bug w/ Full Exhale 2x8/side. Workout: Incline DB Press 4x8, 1-Arm Landmine Press 3x8-10/side, Machine Chest Press or Weighted Push-Up 3x10, Low-to-High Cable Fly 3x12, Cable Lateral Raise 4x12-15, Overhead Rope Triceps Ext 3x10-12, Assisted Dip Machine 2-3x8-10. Optional Easy Cardio 10-15 min. PSAs | yes |
| Thu Active Recovery + PT | Zone 2, Pallof, "Mobility flow" only; PT block missing | PT: Suitcase Carry 3x20-30 m/side, Front Plank 2-3x20-40s, Seated Pigeon 2x30-45s/side. Workout: Zone 2 25-35 min, Cable or Band Pallof Press Hold 3x20s/side, Back-Friendly Mobility Flow 5-8 min. "No hard finisher". PSAs | yes |
| Fri Lower 2 / Glute-Ham + Abs | **empty** | PT: PPT 2x8, Bird Dog 2x6/side, Clamshells 1-2x15/side. Workout: Barbell or Machine Hip Thrust 4x8, B-Stance RDL 3x8/side, Seated or Lying Leg Curl 3x10-12, Reverse Lunge or Low Box Step-Up 3x8/side, 45° Back Extension (glute bias) 2-3x12, Cable Hip Abduction 2-3x15/side, Seated Calf Raise 4x12-15. Finisher: Cable Crunch 3x12, Reverse Crunch 2x10. PSAs | yes |
| Sat Delts + Arms + Traps + Cardio | **empty** | PT: Band Walks 1-2x12 steps each way, Core Activation Single-Leg Stand 2x20s/side, Light PPT 1-2x8. Workout: Seated DB or Machine Shoulder Press 3x8-10, Behind-the-Back Cable Lateral Raise 3x12-15, Reverse Pec Deck 3x12-15, Cable Y-Raise / Scaption Raise 2-3x12, EZ-Bar Curl 3x10, Incline DB Curl 2-3x10-12, Rope Pressdown 3x10-12, Cross-Body Cable Extension 2-3x10-12. Finisher: Farmer Carry 3x20-30 m, Cardio 15-20 min. PSAs | yes |
| All days | `sourceCue` = null on every slot (form cues from the PDF never imported) | every item has a "Form:" cue; several cells have inline PSAs (Tue/Wed/Thu finishers, Thu workout) | cues + PSAs imported verbatim |
| Page 2 | only clamshell dose discrepancy recorded; most reference rows said "quantity not included" | page 2 gives a dose + a handwritten note for each of 10 PT moves plus Battle Rope Squats ("Meta!", "Oscillate anchor when needed", "S Tier") | imported as `pdfNote` and `page2Dose` per move; Battle Rope Squats kept as an *optional add-on* (unscheduled in the PDF) |
| Names | "Mobility flow", "Seated Pigeon", "Plank", "Single-Leg Stand" | "Back-Friendly Mobility Flow", "Seated Pigeon Pose", "Front Plank", "Core Activation Single-Leg Stand" | renamed (ids kept so old logs still resolve) |
| Day order | Mon-Sat + unscheduled Sunday | Mon-Sat (no Sunday) | unchanged |

Dose notes: the PDF writes ranges with hyphens (`3x12-15`); the app shows them with an en dash. Two PDF page-1 vs page-2 dose conflicts (Clamshell 2x15 vs 2x10, Single-Leg Stand 2x20s vs 2x10, Pigeon 2x30-45s vs 3 sets, Plank 2-3x20-40s vs 2 sets, Band Walks, Carry) are all shown: **page 1 is the prescription**, page 2 dose shown as "board says".

## 3. Architecture

* Keep: Vite/TanStack static SPA, zustand + `persist`, `daylight-matrix-v1` key, `daylight-custom-exercises` key, localStorage only. Auth/DB stay off.
* `persist` gets `version: 2` + `migrate()` (`src/lib/daylight/migrate.ts`). Old version-0 blobs are copied to `daylight-matrix-v1.pre-v2-backup` before migrating (once). The same migration runs on imported JSON backups (both old `daylight:1` and new `daylight:2` format).
* No existing persisted field is removed or retyped. New fields are additive with defaults. Old plan versions are kept in history; a complete PDF plan is appended as a new version (custom slots a user had added are carried over).
* New modules in `src/lib/daylight/`: `exercises.ts` (catalog + muscle weights + back-friendliness + suggestions), `muscles.ts` (muscle groups), `plan.ts` (PDF plan), `volume.ts` (planned/logged sets per muscle), `digest.ts` (plan-builder text), `migrate.ts`.
* New UI in `src/components/daylight/`: shell with bottom tabs (Today · Train · Body · Food · Notes) + global one-tap note FAB, SVG body (`BodyFigure.tsx`), muscle explorer / heat / grow views, session screen with day switcher, food hub, notes hub with digest, PWA manifest + service worker + icons, light/dark theme.

## 4. Task list (all done)

- [x] Read PDF, audit plan.ts, write this document
- [x] Phase 1 data: exercise catalog + muscle weights, full PDF plan, volume engine, migration, digest, unit tests (`npm run test:daylight`, 8 tests)
- [x] Phase 2 store: new actions (logSet, notes, water, food plan), versioned persist (v2), backup/restore
- [x] Phase 3 UI: design system, shell, Today, Train/session, Body (explore/heat/grow), Notes + digest, Food, Settings
- [x] Phase 4 PWA: relative manifest, icons (192/512/maskable/apple-touch), service worker (network-first HTML), self-hosted fonts
- [x] Phase 5 verification: typecheck, `build:pages`, Playwright/Chrome (390x844 + 1280x800), migration from a real old-build state
- [x] Phase 6 deploy prep: `/workspace/daylight-overhaul-dist` (contains `.nojekyll`), publish steps below

## 5. Verification results

* `npm run typecheck` clean. `npx eslint src` has no errors in the new code (the one existing error is in `src/lib/app-data/client.server.ts`, untouched, template code). `npm run test:daylight` 8/8.
* `npm run build:pages` produces `dist/client` with relative paths (`./assets/...`, `./manifest.webmanifest`). Served from the *root* of a static server (python `http.server`) it loads with zero console errors. (TanStack emits `modulepreload` hrefs like `/./assets/x.js`; from a site root that resolves to `/assets/x.js`, which is the case for `randymcfarland1227-wq.github.io`.)
* Playwright (system Chrome) walkthrough on 390x844 touch viewport + 1280x800: Today dashboard; Train opens on today's weekday; expand a move, log a set (steppers), rest timer starts after a main-lift set; finish summary; quick note (tags, text, for-next-plan flag) from the floating pencil; Today reacts to logged sets (progress ring, heat snapshot, flagged-notes banner); heat map reacts to logged sets (7/14/30 day window, planned fallback when empty); Grow an area (Adductors -> plan moves + labeled suggestions with back-friendly flag); digest copied to clipboard contains the plan, the note and underserved areas; food log + water; suggest week -> prep list -> add to shopping list; pantry; reload persistence (sessions/sets/notes/food/water/meal plan/shopping all survive); dark mode; desktop sidebar layouts.
* **Migration test (real):** the *old* build (`main`, built in a git worktree) was loaded in Chrome with a seeded old-format `{state, version: 0}` blob (sessions with logs, a note with a legacy `regionId`, trial, food/fluid logs, inventory, meals, shopping, prep, goals, PT notes, custom plan v2 with a custom slot, kg units, protein goal 150). The blob the old build persisted was then loaded in the new build: sessions, food/fluid logs, trials, goals, PT notes, shopping, prep, purpose, units and protein goal are byte-identical; both old plan versions are kept untouched and the PDF plan is appended as a new version (custom slot carried over); the note gains `forNextPlan:false` and `muscleId:"delt-rear"`; starter pantry/meals are appended after existing rows; `daylight-matrix-v1.pre-v2-backup` equals the old raw string; a second reload does not re-migrate or duplicate; restoring an old `{daylight:1}` backup JSON through Settings works (and migrates). Also covered by unit tests (idempotence, no mutation of input).

## 6. Publishing (NOT executed; needs Randy's OK)

The live site is a separate repo containing only the built output. To publish:

```bash
cd /workspace/dm-daylight-matrix
git checkout overhaul && git pull
npm install
npm run build:pages            # -> dist/client  (a ready copy is also in /workspace/daylight-overhaul-dist)

cd /workspace/dm-randymcfarland1227-wq.github.io
git pull
rsync -a --delete --exclude .git /workspace/dm-daylight-matrix/dist/client/ ./
touch .nojekyll                # keep it; rsync --delete would remove it otherwise
git add -A
git commit -m "Daylight Matrix overhaul (source: daylight-matrix@overhaul)"
git push origin main
```

GitHub Pages redeploys in about a minute. Randy's data is in his browser's localStorage under the same key (`daylight-matrix-v1`) and the same origin, so the first load of the new version migrates it in place (a raw copy is kept under `daylight-matrix-v1.pre-v2-backup`). Suggest he taps Settings -> Download backup *before* the first open of the new version if he is on his phone with the old one.

Rollback: `git revert HEAD && git push` in the live repo restores the old static files. Data written by the new version stays in localStorage; the old build ignores the added fields, but any notes/sessions logged after the upgrade would only show in the old UI where it understands them, so prefer fixing forward and export a backup first.

Screenshots: `docs/screenshots/` (also in `/workspace/daylight-shots/`).

Note: the first load after publishing may be served by the browser cache; the new service worker is network-first for HTML so a refresh picks up the new build.

---

# Round 2 (branch `round2`, from `overhaul` @ 67219af)

## What changed
1. **Form guidance.** `src/lib/daylight/form.ts` holds a structured guide for all 97 catalog moves: numbered steps, base/stance, brace, grip, range of motion, tempo, what you should feel, common mistakes, a back-friendly note, and a `clarify` note where the PDF page 2 is ambiguous. The PDF's own cue stays visible as "Your plan cue · from your PDF". Everything else is badged "General education, not from the PDF".
2. **Body map.** One shared silhouette (identical head and ears front and back). The main map has 10 group regions. Tapping one opens a sheet (with Full screen) showing its sub-parts (38 in total), the plan moves hitting each, weekly sets (plan / direct / logged), heat status and "grow" ideas. Heat works at both levels. Weights in `exercises.ts` are at sub-part level; the sub-part target is 60% of the group target.
3. **Reference material.** `moveArt.ts` / `moveArtEngine.ts` draw START and END stick-figure frames for every move (about 70 distinct patterns). There is a "Watch demo" link (a YouTube search for the move name; no specific video URLs are invented). Reachable from the session card, gym mode, the Moves tab, the PT board and the body-map detail.
4. **Train and gym mode.** PSA is now at the top of the session. Gym mode is a full-screen one-move-at-a-time flow with a one-tap "Done N sets as prescribed", a whole-block PT/activation button, flow mode, a guided timer, a rest strip, adjust steppers, Swap move, and "I did something else" on any slot. The Train overview is unchanged apart from a Start button and an "Off-plan & swaps" list. Gym mode is the default entry for today (Settings toggle turns this off). Off-plan work is counted on the heat map (chosen muscles, a whole group, or inferred from a matched catalog move) and appears in the notes digest.
5. **Visual.** Warm charcoal/bone with a muted amber accent, dark by default plus a light variant. Weekday colours are muted and varied. No saturated green anywhere (logo, icons, manifest included).

## Migration
- `SCHEMA_VERSION = 3`. A copy of the stored blob is written to `daylight-matrix-v1.pre-v3-backup` before migrating (the v2 backup key is untouched).
- Theme `auto` or unset becomes `dark`; an explicit `light` is kept. Each session gets `extras: []`.
- Stored muscle ids (old 24 region ids and flat v2 ids) are never rewritten. `resolveMuscle` maps them to a group or sub-part at read time.
- Tested against the v1 fixture, a v2 build of `overhaul` @ 67219af and unit tests in `src/lib/__tests__/round2.test.ts`.

## Publish steps (NOT executed)
1. `npm run build:pages`
2. rsync `dist/client/` into a clone of `randymcfarland1227-wq.github.io`, keeping `.nojekyll`
3. commit and push `main`

A staged build is at `/workspace/daylight-overhaul-dist-r2`.

## Guidance I was unsure about
Battle Rope Squats (the page-2 picture looks like suspension handles), PPT "bend the kneees", bird dog "kick straight back", seated pigeon "use body weight", plank "Buttt down", single-leg stand (2x10 vs 20 s holds), "3 laps" for carries and band walks, Back-Friendly Mobility Flow (the PDF names no moves), Nordic curl, cable woodchop, reverse hyper, and all tempos and ranges. Side plank art is drawn from the side so it looks like a plank, and it says so.

---

# Round 3: MuscleWiki-style map (branch `round3`, built on `round2` @ 0d9a286)

Randy's reaction to round 2's body map: "awful, back-pedal; musclewiki.com does it well, my only addition would be color." Round 3 follows MuscleWiki's UX in his own colours. Nothing from MuscleWiki is copied (no images, video or text): the figure, the move diagrams and the steps are our own.

## What changed
1. **Map.** Body tab shows a front and a back figure side by side (flat pale chart, dark contour lines). An **Advanced** switch swaps the 18 regions for the sub-muscles (including dashed deep muscles). Modes: Explore, Heat map, Grow an area.
2. **Colour.** Each muscle group has its own hue (no bright green). Strength of the hue = coverage by the plan (strong = covered, faded = indirect only, pale = untrained, dashed outline = underserved). Heat map is a cold-blue -> cyan -> yellow -> orange -> red ramp relative to the weekly target. Exercise pages use that hue at three strengths for primary / secondary / tertiary.
3. **Muscle page.** Tap any part of the figure. Breadcrumb, status line (plan vs target, logged vs target), then **"In your plan"** first (days, sets/wk, logged sets, swap options), then **"Other moves that train this"**. Right rail: a figure with only that muscle lit, an Advanced checkbox, tap-to-jump, equipment checkboxes with counts, difficulty cap, "show tertiary" and the role legend. Cards are MuscleWiki-shaped: title bar, difficulty badge, role badge, START/END diagram and the first three steps.
4. **Exercise page** (full screen, replaces the round-2 form sheet): breadcrumb, title, difficulty + equipment, START/END diagram, "In your plan" box (day PSA, dose, plan cue), quick numbered steps, How to perform (Setup / Performing), common mistakes, a muscle diagram with Primary / Secondary / Tertiary legend and chips, metadata (difficulty, force, mechanic, equipment, grip, sides), tags, "Find a video" link, note button. A link to the matching musclewiki.com page appears only for the ~45 moves whose slug was checked (HTTP 200 and matching title); others get a YouTube search only.
5. **Move diagrams.** New patterns for side plank (now a side-lying line), cable woodchop, Nordic curl, wall sit and lat pulldown (they used to reuse other moves' art).
6. **Kept:** gym mode (opens to today's session, PSA first, bulk-complete, guided timer), swap / "did something else" with muscle picking, notes and digest, heat map and underserved list, food, all stored data. Today's mini-figure now uses the new figure.

## Model
- Three levels: group (10) -> region (`rg-*`, 18) -> sub-muscle. `subsOf(id)` expands any level; `regionOfSub`, `regionInfo`, `isRegion`. Volume and targets exist at all three (`targetFor`: group = target, region = 0.8x, sub = 0.6x).
- `src/lib/daylight/exmeta.ts` (difficulty, force, mechanic, grip, equipment categories, tags, verified MuscleWiki slugs), `figureColors.ts` (hues, role strengths, ramp), `MapFigure.tsx`, `MusclePage.tsx`, `ExercisePage.tsx`.
- Removed: `FormGuide.tsx`, `BodyFigure.tsx`.

## Migration
No schema bump (still 3). `bodyDetail` defaults to `standard` when absent. `selectedMuscleId` is now ephemeral (never saved); if an old blob carries one, `resolveMuscle` maps it to a group or sub-part. Stored muscle ids are unchanged. Verified with the v1 fixture (backups written, sessions and notes kept) and unit tests (`round3.test.ts`).

## Publish steps (NOT executed)
1. `npm run build:pages`
2. rsync `dist/client/` into a clone of `randymcfarland1227-wq.github.io`, keeping `.nojekyll`
3. commit and push `main`

A staged build is at `/workspace/daylight-overhaul-dist-r3`. The live repo has not been touched.

## Known weak spots
- The figure is a flat stylised chart, not a medical illustration; sub-part shapes are editorial.
- Move diagrams are simplified side-view sketches; some patterns are shared between similar moves.
- Difficulty, force and mechanic are editorial classifications, not sourced data.
- Exercise text is the round-2 general-education guide repackaged into quick steps and Setup / Performing.
- The heat map is relative to the weekly target (default 10 weighted sets per group); with the default target and a full plan most groups read red. Change the target on the Body tab to spread the ramp.

---

# Merge: round 3 + the live "refresh" (branch `merge`, from `round3` @ c7cc0b4 + `origin/main` @ 7ed6ea4)

Randy: "look at both and merge the best of both into one version." `main` (7ed6ea4, live at 95e17ef) is the original v1 store plus a cooler look, a turnable 6'4" mesh figure and notes that attach to a muscle. It added no new persisted fields (`regionId` on a note already existed). Git history is merged (`git merge origin/main`); every source conflict was resolved to round 3's code, with main's ideas re-built on top.

## Taken from main
- **The turnable 6'4" figure** (`public/human-man.obj`, `three`): kept as a **Turn** view next to the flat chart (Body tab: "Front + back | Turn"). Rewritten as `TurnFigure.tsx`: a pale neutral mannequin whose regions are coloured with the same hues / heat ramp as the flat map (vertex colours from ellipsoid zones in `turnZones.ts`), drag to turn, Front/Right/Back/Left buttons, tap a muscle -> "See moves" or "Add a note". three.js and the mesh load only when Turn is opened (separate chunk). The terracotta skin, shadows and glowing blobs were dropped: they looked heavy next to the chart.
- **Notes that attach to a muscle, visible in one list**: `Body notes` card on the Body tab (every note with a muscle or old region, newest first, tap to open the muscle), numbered pins on both figures (flat and Turn), a "N notes on the body" tile on Today, and a figure picker inside the quick-note sheet ("Link to a move or muscle" -> tap the figure). Notes use round 3's `context.muscleId`; main's `context.regionId` (24 old ids) is migrated to it, and `bodyNotes.ts` also reads `regionId` directly.
- **Cooler palette and cleaner type**: Outfit (self-hosted, no Google CDN), white/slate cards in light, slate navy in dark, a calm steel-blue accent, tighter headings. Main's teal (#0c7c74) read green next to Randy's "no bright green", so the accent is steel blue (#1f7a99 light, #5fb6cf dark). Weekday accents were retuned to cool hues. Contrast checked (>= 4.5:1).

## Kept from round 3
MuscleWiki-style map (standard/advanced, hue per group, muscle page with plan first and filters, exercise page with colour-coded diagram), gym mode, form guides, swaps, notes + digest, heat map, food, migration.

## Dropped from main
The old 24-region body screen, the Planned/Completed/How-I-felt layers, Fraunces/Source Sans, the copper/forest theme, the committed `site/` build (replaced by the new build).

## Migration results (Playwright, merged build)
- Blob saved by the live main build (v1 store, 2 notes attached to `abs`, an active session): loads, schema 3, both notes kept and migrated to `abs-upper`, shown in Body notes with a pin, sessions kept, PDF plan appended, backups written.
- Old v1 fixture, v2-style blob (light theme, `regionId` + `muscleId` notes), and round-3 v3 blobs: all load; no schema bump (still 3); `bodyStyle` defaults to `map`.
- Unit tests: `merge.test.ts` (zones cover every region, note -> region mapping incl. main's old ids, pin counts, main-blob migration). Also fixed a date-dependent assertion in `daylight.test.ts`.

## Publish steps (NOT executed)
1. `npm run build:pages`; 2. rsync `dist/client/` into a clone of `randymcfarland1227-wq.github.io` (keep `.nojekyll`), **after `git pull` there: origin/main is 95e17ef, the local clone is still at round 2 (c443b46)**; 3. commit and push. Staged build: `/workspace/daylight-overhaul-dist-merge`.

## Known weak spots
- Turn view zones are ellipsoids placed by hand on a mesh of unknown origin (the OBJ is main's asset; its licence/provenance is not documented). Regions are blobs, not real muscle shapes; no Advanced (sub-muscle) level in Turn, and underserved is shown only as a paler colour there (dashed outlines exist on the flat map).
- Turn needs WebGL; without it the flat map still works (Turn shows an empty panel). Mesh is ~1.7 MB, three.js ~0.5 MB, both lazy.
- Pins on the flat figure sit at the centre of each region's drawing.
- The weekly-target / heat-map caveats from round 3 still apply.

## Round 4: embedded demo videos (branch `videos`, from `merge` 1096170)

Randy asked for a real video of the move instead of only a YouTube search link.

- **Data**: `src/lib/daylight/videos.ts`. `VIDEOS[exerciseId] = { id, title, channel, verifiedAt }` for 91 of the 97 catalog moves, plus `NO_VIDEO` (explicit fallbacks with a reason) for the other 6. A unit test (`videos.test.ts`) fails if any entry lacks id/title/channel, any key is not a real exercise, or any plan move (slots and alternatives) has neither a video nor an explicit fallback.
- **Verification (2026-10-03)**: candidates came from `yt-dlp ytsearch` (ids, titles, channels, durations). Each chosen id was then checked with the YouTube oEmbed endpoint (HTTP 200, which also refuses non-embeddable videos) and `yt-dlp playable_in_embed`; the oEmbed title/author is what is stored. Titles were read against the move. One candidate that oEmbed accepted but yt-dlp reported unavailable was dropped and replaced. No id was invented.
- **UI**: `VideoEmbed.tsx`, shown at the top of `ExercisePage` (and therefore in gym mode's form view, which opens the same page). Thumbnail from `i.ytimg.com` with a play button; the `youtube-nocookie.com` iframe is mounted only after a tap. Shows the title, "Video by <channel>" and "Open on YouTube". No verified clip, offline, or a player that does not load within 12 s shows the existing YouTube-search link (`demo-link` stays on the page, as does the MuscleWiki link).
- **PWA**: `sw.js` (v3) never intercepts youtube.com / youtube-nocookie.com / ytimg.com / googlevideo.com (and already ignored every cross-origin request). Verified in a browser that the cache holds no YouTube URLs. Offline, the written guide and diagrams still work.
- **Caveats**: videos are third-party and can be removed or have embedding disabled later; the fallback link then still works. Re-run the oEmbed check periodically.
- **Not done**: nothing was published. Publishing to the live repo is a separate step: copy `dist/client` (staged at `/workspace/daylight-overhaul-dist-videos`) over the live repo's root and push `main` after Randy approves.

## Round 5: real photos, inline motion loop, no YouTube

Randy's asks: replace the cartoon diagrams in the one-by-one (gym) view with real photos, play the demo inline with no navigation, and stop embedding YouTube.

- **Photos**: `src/lib/daylight/exImages.ts`, 69 of 97 moves. Source is Free Exercise DB (yuhonas/free-exercise-db), The Unlicense (public domain). Matched by name and equipment against the dataset (`exact` = same movement, 55; `close` = nearest variant, 14, labelled "Closest photo match" in the UI). Every image URL was fetched (HTTP 200, image/jpeg). Hotlinked from raw.githubusercontent.com (CORS open), lazy; not bundled (about 9 MB for all 138 files).
- **Inline "video"**: `MoveMedia.tsx`. The start and end photos crossfade in a muted, looping strip inside the one-by-one view, the guided timer view and the exercise page. It starts on its own, has a pause button, and respects reduced-motion (then a manual "flip"). No click leads anywhere. Honest limit: this is two real photos looping, not motion video. No openly licensed video library covered these moves (see below).
- **Why no video library**: wger's 78 videos are 30-50 MB HEVC .MOV files for a few moves; Wikimedia Commons has about ten barbell demos; the large GIF libraries (ExerciseDB, Gym Visual, BodyIQDB) are copyrighted or educational-use only. None was used.
- **YouTube**: all embeds, thumbnails and the `VideoEmbed` component are gone. `videos.ts` stays as a reference-link list (not shown). The "Find a demo video" search link remains for every move.
- **Offline**: `sw.js` v4 caches the photo set cache-first (`dm-photos-v1`, kept across versions, capped at 400), never touches YouTube. Gym mode quietly prefetches today's photos once, skipped on Data Saver or offline. If a photo fails, the move falls back to the old diagram.
- **Diagrams stay only** for the 28 moves with no photo (PT floor drills, cardio entries, a few odd moves); see `NO_PHOTO`.

## Round 6: real motion clips via Vimeo's official player (site stays public, still no YouTube)

Randy's call: keep the site public and show real exercise motion clips, using only official embed players from hosts that allow embedding on other sites. Not YouTube. No re-hosting or raw-file hotlinking.

- **Host / library**: Vimeo only, one account: Erin Stern's public exercise-demo library (https://vimeo.com/erinstern, about 1,080 short clips, 5-65 s). One host and one author keeps the look uniform.
- **Data**: `src/lib/daylight/videos.ts` (rewritten; the round-4 YouTube list is gone, see git history). `VIDEOS[exerciseId] = { host: "vimeo", id, title, author, authorUrl, duration, width, height, match, verifiedAt, playerChecked, start? }` for 67 of 97 catalog moves. Coverage: 41 of 61 plan moves (slots + alternatives), 35 of 54 main slots. 30 moves are in `NO_VIDEO` with a reason (5 of them are cardio/flow blocks, not single movements).
- **Verification (2026-10-05)**: candidates came from the account's full public listing (yt-dlp flat playlist: ids and titles only, nothing downloaded). Each chosen id was checked with `https://vimeo.com/api/oembed.json?url=https://vimeo.com/<id>` (HTTP 200 = public and embeddable). The oEmbed title, author, duration and size are what is stored. Titles (and thumbnails when vague) were read against the move; four candidates were rejected after the thumbnail check. `match: "close"` (12) = nearest variant, labelled "Closest clip in the library". No id was invented.
- **playerChecked=false (13 clips)**: for these newer uploads, `player.vimeo.com` served a bot-check page to the datacenter build box (HTTP 401 spinner page), so playback could not be seen there. oEmbed is 200, so it is not an embed restriction. Real browsers are expected to pass. If the player never reports ready, the app switches to the photos after 15 s.
- **UI**: `MoveMedia.tsx`. If a move has a clip and the device is online, a Vimeo player iframe (`player.vimeo.com/video/<id>?autoplay=1&muted=1&loop=1&playsinline=1&title=0&byline=0&portrait=0&dnt=1`) appears inline in the one-by-one view, the guided timer view and the exercise page. It plays muted and loops; tapping it gives Vimeo's controls and sound. Nothing navigates away. The frame uses the clip's own aspect ratio, capped at 46 % of the viewport height in gym mode and 62 % on the exercise page. Credit line: "Video: <title> by <author> on Vimeo". A "Photos" button swaps to the photo loop and a "Video" button swaps back. The exercise page also shows the START/END stills under the video. Reduced motion means no autoplay.
- **Fallbacks**: no clip, offline, or no "ready" message from the player within 15 s → the round-5 photo loop, with a note and a "Try the video again" button. No photo → the diagram.
- **Links**: the exercise page button is "Open this clip on Vimeo" when a clip exists, otherwise "Search Vimeo for a demo". `demoUrl` is now a Vimeo search; YouTube is gone from the app source entirely (enforced by a test).
- **Service worker**: v5 (`dm-v5-vimeo`). vimeo.com, player.vimeo.com and *.vimeocdn.com (plus every YouTube host) bail out before any caching branch, so they are never intercepted or cached. Checked in a browser: the cache holds no Vimeo URLs.
- **Tests**: every entry has host/id/title/author/duration/size/date; every key is a real exercise; every plan move has a clip or an explicit fallback (with photos or the diagram behind it); the only iframe in the source is MoveMedia's Vimeo player; no YouTube host anywhere; the SW deny-list covers the Vimeo and YouTube hosts.
- **Risks**: third-party clips can be removed or made private by the owner at any time (the app then falls back to photos after 15 s). Erin Stern's library likely accompanies her paid programs; it is public and embeddable today but she could restrict it. Autoplay needs muted; iOS Low Power Mode may show a play button instead. Re-run the oEmbed check periodically.

## Round 7: UX / visual system (site still public)

Randy: flow felt horrendous and confusing — type, containers, and colors clashed across screens.

- **Design system**: `DESIGN.md` locks type (display / title / body / caption / meta), spacing (4–32), radii, one steel-blue accent, muted weekday chips, navigation rules, and screen flows.
- **Tokens**: `styles.css` adds `accent` / `warn` / `info` (legacy `forest` / `sun` / `copper` / `teal` alias to them). Type utilities `.t-display` `.t-title` `.t-body` `.t-caption` `.t-meta` `.t-clock`. Content column ~40rem on mobile.
- **Screens**: Today & Train session heroes are calm cards (no full-bleed weekday gradients). Gym mode: one accent CTA, quieter secondaries, muted PSA. Shared `PageHead` + helpers on Food / Body / Notes / Settings / Week. Day switcher uses accent when selected.
- **SW**: folds the live `#1` own-files scope fix; version `dm-v7-ux`.
- Features / Vimeo / photos / schema unchanged.
