# Daylight Matrix — body, training and daily intake

Daylight is a personal workspace for doing a session, keeping food manageable and recording what changes in the body. It should make the next action obvious and keep the reason close. Use exact labels and show only the controls needed for the task at hand.

## Visual system

Use bundled Manrope throughout. Page headings are 32px, section headings 22–28px, reading text 14–16px and supporting labels 12–13px. Small uppercase metadata provides context; it must never carry the primary instruction. Use sentence case, clear hierarchy and consistent spacing. Avoid oversized editorial headings or decorative exercise posters.

The canvas is cool neutral (#f2f5f6), surfaces white, ink graphite (#172d38), and primary actions petrol (#126b67). A navy session panel distinguishes the daily training task. Dark mode respects saved preferences and uses the same hierarchy. Anatomy hues are reserved for the training map; journal colours mean only selected area or existing observations. Use fine borders and 8–14px corners. Desktop has compact horizontal navigation; phone navigation stays at the bottom with Learn and Settings in the header. Existing motion timings remain unchanged.

## Today and Train

Today offers the current session, a body check-in and a familiar meal. Show the actual date, session name, required exercise count, real plan blocks, the PDF reminder and Start/Resume/Review. Exercise completion percentages use the same denominator as the exercise count. A small real photograph opens form reference. Physical therapy and training coverage are explicit links. Keep the user's purpose visible above the workspace. Keep all food work inside Food.

Train keeps session browsing separate from the focused workout. Day buttons fit seven across on phones; Today stays inside its button. A plan reminder belongs inside the overview. Avoid repeating a generic explanation that a workout appears on that weekday. Browse-screen actions stay in the page instead of covering the session overview.

## Body journal and training guide

Body defaults to Area journal. Clicking a muscle or group selects it and opens an inline observation form, never a list of exercises. On phones, selection brings the observation panel into view. The date defaults to today and can be changed to an earlier date. Side is optional. Saving records the area, date, optional side and text in the existing observation store. History shows the year, area and side; it can be filtered to an exact date. Group history includes its smaller parts. A note attached to an entire group must not be presented as an observation specific to one smaller muscle. Old region-attached notes remain available. Editing and next-plan flags are available in the journal.

Training guide is separate: Planned work, Logged sets and Compare areas. Logged sets means actual recorded exercise sets, never body notes and never a substituted plan. Exercise links from Train explicitly open this guide. A secondary link from an area journal opens related exercises, with a direct return to that area's journal.

Use the front and back maps and the named-area selector for reliable selection. The previous clay turning viewer is removed from the interface. Do not restore it or imply that the current diagram is a 3D model. Detailed anatomy is an explicit option.

## Data, reflection and media

Preserve the existing daylight-matrix-v1 key, schema, workout logs, food data, observations and backups. Body observations also appear in Notes, where area, date and side are searchable. Next-plan briefs include the date and side. Flags support considered changes; saving a body observation never changes a training plan automatically.

Retain actual creator videos and the 138 locally bundled, licensed exercise photographs. Label related variations accurately. Load the official player only after Play and offer photographs, written cues, retry and creator links when needed. Do not simulate a video with stills. Third-party videos need a connection and are never cached. The body map is an interface, separate from instructional media. Offline installs include application assets and photographs; they no longer download the unused turning model.

## Acceptance

Verify selection → dated note → save → area history → exact-date filter → edit → reload, including optional side, group scope and legacy notes. Verify the guide remains separate. Check 390px and narrow phone widths, the seven day buttons, all main destinations and the production build. Keep source and publication changes on review branches; production changes only after the publication pull request is merged.
