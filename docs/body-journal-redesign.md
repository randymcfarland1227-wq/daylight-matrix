# Body journal and daily workspace redesign — 8 October 2026

The rejected editorial layout has been replaced with a compact application layout: one sans-serif family, a controlled heading scale, neutral surfaces, petrol actions, horizontal desktop navigation and a navy daily session panel. The daily screen keeps the user's reason, training, body check-in and meal actions together. Actual exercise photographs remain in form reference instead of serving as a large decorative poster.

Body now defaults to an area journal. Selecting a muscle keeps the map present and opens its observation form. Notes record an area, date and optional side; history supports exact-date filtering, editing and next-plan flags. Whole-group histories include smaller parts without attributing broader notes to an individual muscle. Original region-attached observations still resolve. Dates show the year. Notes search and next-plan exports retain the new context.

Exercise discovery and training coverage live under Training guide. Its labels are Planned work, Logged sets and Compare areas. The confusing Recorded label no longer means exercise sets. Training links open the guide explicitly; journal links open observations. The clay turning model has been removed from the interface and offline installation list. Front and back anatomy maps support mouse, touch, keyboard and selection by name. This release does not claim to provide a replacement 3D model.

The Today day marker now stays inside its button. Seven days fit on a phone. The training reminder is integrated into the overview, and the browse-screen footer no longer overlays its controls. Completion percentages and exercise counts agree.

The storage key and schema are unchanged. Existing logs, plans, notes, food records and backups remain intact. The 82 real video mappings and 138 local licensed photographs are retained, including related-variation labels and player fallbacks. No generated exercise image has been reintroduced. The build no longer includes the lazy Three.js viewer chunk.

Validation: TypeScript check, 53 domain/media/offline tests and the production Pages build pass. Browser checks cover saving and editing a backdated left-side observation, exact-date filtering, persistence after reload, area selection, separate guide navigation and phone layout. The build-fingerprinted service worker includes the current app and photographs. Publish through the existing source and publication pull requests; do not push or merge main automatically.
