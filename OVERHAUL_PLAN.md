# Daylight Matrix — overhaul plan (branch `overhaul`)

Status: in progress. This file is updated at the end of the work with final results and the publish steps.

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

## 4. Task list

- [x] Read PDF, audit plan.ts, write this document
- [ ] Phase 1 data: exercise catalog + muscle weights, full PDF plan, volume engine, migration, digest, unit tests
- [ ] Phase 2 store: new actions (logSet, notes, water, food plan), versioned persist, backup
- [ ] Phase 3 UI: design system, shell, Today, Train/session, Body (explore/heat/grow), Notes, Food, More
- [ ] Phase 4 PWA: manifest, icons, service worker, self-hosted fonts
- [ ] Phase 5 verification: typecheck, lint, build:pages, Playwright (390x844 + desktop), migration from a real old-build state
- [ ] Phase 6 deploy prep: `/workspace/daylight-overhaul-dist`, publish steps below

## 5. Deploy (not done automatically)
See the "Publishing" section at the end of this file (filled in at the end of the work).
