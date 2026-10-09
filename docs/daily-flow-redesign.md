# Daily flow redesign

Canonical source: `randymcfarland1227-wq/daylight-matrix`, based on `videos` at `eb37439`. Publication: root of `randymcfarland1227-wq/randymcfarland1227-wq.github.io`.

## Experience

Today presents three ordered decisions: begin or resume movement, make eating easier, and capture an observation. The user's editable reason stays visible. Session intention comes from the existing PDF reminder; no new program or clinical recommendations are introduced.

Train opens an overview. Starting a full-screen session is explicit. Activation starts one exercise at a time with source form cues; the grouped block remains available under All moves. Food unifies meals, recipes, inventory, shopping, and preparation. Its overview starts with up to three ingredient-matched meals; intake targets are expandable. Notes use contextual tags and show each active trial's original observation, proposed change, success criterion, and review date. Learn remains accessible from Today and the desktop rail.

The Body map separates Planned work from Recorded work. Recorded work never falls back to a plan when logs are empty. Comparison labels describe estimates and the user's selected range. They do not represent recovery, readiness, or a measured muscle-growth response. The main mode selector occupies its own row on mobile.

## Correctness and continuity

- Progress uses whole prescribed minimum set counts, not midpoint muscle-volume estimates. Optional work is excluded from required progress.
- Completion requires both sides for unilateral entries. Legacy `na` and explicit `both` records remain compatible.
- Completed, skipped, and replaced exercises are separate outcomes; skipping does not increase completion.
- Existing storage key, schema, workout history, observations, food records, and backups are retained. No user data is sent to a new service.
- Service-worker updates remove only old Daylight version caches, leaving other apps' caches alone.
- Dialogs contain keyboard focus and restore it on close; tab selectors support arrow, Home, and End keys.

## Validation

TypeScript check, 47 domain tests including four new behavioral regressions, static production build, and desktop/phone browser checks. Changed-file lint has no errors; existing mixed-export and unused-code warnings remain. Browser checks cover explicit workout start, logging/advancing, resume progress, food logging, observation persistence, body mode selection, and responsive layout. Test entries were made only on local preview origins.

## Release

Review the source PR against `videos`. The publication PR contains the matching static build and can publish the redesigned site when merged. Preserve the original GitHub Pages origin so existing device-local records remain available. A localhost preview has its own empty storage and does not show the user's production records.
