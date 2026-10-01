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
