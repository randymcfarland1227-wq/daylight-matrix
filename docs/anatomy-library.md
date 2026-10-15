# Body reference library

The live GitHub Pages build corresponds to the `videos` source branch of `randymcfarland1227-wq/daylight-matrix`. The default branch contains an older interface. Built assets are published separately in `randymcfarland1227-wq/randymcfarland1227-wq.github.io`.

## Content and scope

The library provides 116 entries: 10 groups, 18 muscle regions, 46 details, 10 joints and 32 nerve entries (eight added). `atlas.ts` holds original educational summaries and a source registry. `nerveAtlas.ts` separates typical roots, route, motor supply, skin sensation, branches and pressure-related habits. Sources are linked on each Learn and Training page, with a content date of 2026-10-14. These summaries have not had clinical peer review.

Muscle entries distinguish movement from stabilization and distinguish antagonistic actions from co-contraction. Detail records override inherited parent relationships. This corrects, among other relationships, teres major's principal lower-subscapular supply, gluteus maximus's inferior-gluteal supply, rhomboids' dorsal-scapular supply, and tibialis anterior's deep-fibular supply. Lower internal oblique/transversus have L1 branches as well as thoracoabdominal supply. The map's existing groupings are preserved but their limitations are explained (for example, iliopsoas is not a quadriceps head).

New nerve entries: upper/lower subscapular, iliohypogastric, ilioinguinal, lateral femoral cutaneous, saphenous, deep fibular, superficial fibular and sural. They are searchable/listed; the simplified body drawing does not pretend to show their precise routes. Sensory-only nerves have no motor targets or hypertrophy prescription. Glides are not supplied as a generic self-treatment.

## Information design

Learn has jump links for everyday use, anatomy, connections and what to notice. Connection cards show the linked structure's role. Motor and sensory territories are separate on nerve pages. Fatigue and possible irritation appear separately. Search filters names/functions within the selected category; changing category clears the query.

Training has specific starting drills, purpose and cues, an explicitly introductory dose, progression guidance, recovery suggestions and access to existing exercise demos. General growth principles cite ACSM's 2026 guidance for healthy adults. Existing personal logs, store schema, workout plan and Journal behavior are unchanged.

This is a selected atlas, not a complete inventory of human muscles, nerves or joint articular branches. Deep structures can be discussed without an individual map entry. App joint labels combine anatomical regions, so relationship text distinguishes nearby pathways from direct capsule innervation.

## Validation

`npm run typecheck`, `npm run build`, `npm run build:pages`, and `npm run test:daylight` (76 tests). Atlas checks cover field completeness, source IDs, cross-links, sensory-only targets, and selected anatomical corrections. Browser checks cover Core Learn/Training, nerve search, a sensory-only page, source disclosures, link traversal and responsive layout. Review source and generated-site changes together before publishing.
