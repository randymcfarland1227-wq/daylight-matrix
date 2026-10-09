# Daylight Matrix — editorial movement studio

The app should make eating, training and reflecting feel approachable. Every visual choice supports one clear next action and a visible reason for doing it.

## Appearance

Warm ivory canvas (#f6f3ec), near-black ink (#252620), sand surfaces and restrained rust (#9c4028). Dark mode uses warm charcoal and pale terracotta. Respect an existing saved theme; new installations start in light mode. Avoid gradients, decorative metric grids, stacked pills and oversized nested containers.

Manrope is the reading and control font. Fraunces is reserved for page and editorial headings. Use clear sentence case, a small uppercase eyebrow for context, and generous space around the primary action. Section labels use Manrope. Numerals and timers use Manrope for legibility. Both fonts are bundled, with no external font request.

Cards use a 12px radius, controls 8px, badges 6px, fine borders, and no floating shadows. Circles belong to actual circular controls and map legends. Shared tokens and components govern every page, sheet, exercise reference and workout screen. Navigation uses a quiet left rule and a restrained active surface. Motion behavior is unchanged in this visual pass.

## Daily flow

The daily page presents movement first, then food and observations. Show the actual day, session title, PDF reminder, current progress, and Start/Resume/Review. A real photograph from a movement in that session opens its demonstration and form cues. The purpose line stays visible above the session. Physical therapy and the muscle map remain one action away.

Food repeats a familiar meal with explicit ingredient availability; inventory, recipes, shopping and prep remain inside Food. Notes save an observation immediately and support reviewing a specific change later. No fabricated progress, automatic plan changes, new intake targets or motivational pressure.

## Real instruction media

Use real exercise photographs and official creator video players. Generated movement drawings are no longer rendered as instruction or list thumbnails. The body diagram remains an explicitly anatomical interface, separate from demonstration media.

82 catalog movements have a video; 69 have a locally bundled pair of photographs. All five remaining entries are composite mobility or cardio blocks. A related clip or photo must say what differs, especially the PDF’s pelvic tilt plus shoulder-flexion combination. A video of pelvic tilt alone must never imply it demonstrates that combination.

Videos load only after a user chooses Play. Label the creator and source. Handle unavailable players with written cues, available photographs, retry and the creator link. Photos show two labeled positions; do not animate stills to imply a filmed demonstration. Keep source URLs, public-domain license, endpoint audit and playback checks in the repository. Third-party videos remain online, embedded through official players, and are never downloaded or cached.

## Verification

Check desktop and 390px mobile layouts, every primary destination, the focused workout flow, actual player controls, related-variation labels, and a cold reload with the local server stopped. Keep all logs and backups under the existing storage key. Build output includes a manifest of code, styles, fonts and the body model for first-install offline caching, alongside the photographs.
