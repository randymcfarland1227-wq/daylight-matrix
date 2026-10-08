# Daylight Matrix — design system (Round 7)

One product, one voice. Cool slate dark by default, calm steel-blue accent, no green, muscle hues only on the body figure.

## Why this exists

Randy: the flow felt “HORENDOUS and confusing” — type and container sizing jumped around, and colors fought each other. Round 7 locks one system and forces every screen through it. Features stay; the chrome gets consistent.

## Type scale

| Role | Class | Size | Weight | Use |
|------|-------|------|--------|-----|
| Display | `.t-display` | 1.75rem / 2rem (md+) | 600 | Page titles only (one per screen) |
| Title | `.t-title` | 1.25rem | 600 | Card / section headings |
| Body | `.t-body` | 1rem | 400–500 | Default reading text |
| Caption | `.t-caption` | 0.875rem | 500 | Helpers, secondary lines, list meta |
| Meta | `.t-meta` | 0.75rem | 700 uppercase, tracking | Eyebrows, chip labels, tiny status |

No one-off `text-[2.1rem]`, `text-7xl`, `text-[0.6rem]`, etc. Gym’s big rest clock is the only exception (`.t-clock`).

## Spacing

Scale: **4 / 8 / 12 / 16 / 24 / 32** (0.25 / 0.5 / 0.75 / 1 / 1.5 / 2 rem).

- Screen stack gap: 16 (`space-y-4`)
- Card padding: 16 mobile, 20 desktop (`p-4 md:p-5`)
- Section gap inside a card: 12
- Page content max width: **40rem** (640px) for reading screens; Body map / Exercise can go to **64rem**
- Bottom nav clearance: keep `pb-44` on mobile

## Radii & controls

| Thing | Radius | Min height | Padding |
|-------|--------|------------|---------|
| Card | 1.25rem | — | 16 / 20 |
| Button lg | 1rem | 3.5rem | 24×16 |
| Button md | 1rem | 3rem | 16×12 |
| Button sm | 0.75rem | 2.5rem | 12×8 |
| Chip | full | 2.5rem | 14×0 |
| Field | 0.75rem | 3rem | 12 |

One primary button per view. Secondary = outline or soft. Ghost for tertiary.

## Color tokens

Cool slate surfaces. **One accent** (steel blue). Weekday tints are muted chips only — never full-bleed heroes that fight the accent. Muscle heat colors live on the figure only.

| Token | Role | Dark | Light |
|-------|------|------|-------|
| `canvas` | page bg | `#0e1418` | `#f1f5f8` |
| `surface` | card | `#151d23` | `#ffffff` |
| `surface-2` | inset / soft | `#1d2830` | `#e4ecf1` |
| `ink` / `ink-soft` / `ink-faint` | text | ice → slate | slate → grey |
| `line` | borders | `#2a3841` | `#d3dee6` |
| `accent` (aka `forest`) | primary action | `#9bd0e0` | `#14566b` |
| `accent-deep` | hover | `#bfe3ef` | `#0d4153` |
| `on-accent` | text on primary | `#0b1a21` | `#f2fafc` |
| `warn` (aka `copper`) | caution only | `#d08a74` | `#b0573f` |
| `info` (aka `teal`) | underserved / info | `#8bb4d8` | `#2f6f8f` |
| `danger` | destructive | `#e58a86` | `#b13e3e` |

Legacy class names `bg-forest`, `bg-sun`, `text-copper` still work (aliased) so we don’t break every file at once. Prefer `accent` going forward. **Do not introduce green.** `sun` is retired as a second competing accent — primary buttons use `accent`/`forest` only.

## Navigation

- **Mobile:** bottom 5 tabs (Today, Train, Body, Food, Notes) + gear in the top bar + quick-note FAB.
- **Desktop:** left sidebar, same items + Settings.
- **Gym mode:** full-screen takeover, one Exit. No bottom tabs, no FAB. Calm: move name → media → cue → one big Done → smaller secondary actions.

## Screen flows (what the user does first)

1. **Today** → see today’s session card → tap **Start gym** (or Open session). Protein/water and notes sit below, quieter.
2. **Train** → pick the day → **Start gym** or walk the list / form guides.
3. **Gym** → one move at a time → Done → next. Exit returns to Train.
4. **Body** → tap a region → muscle page → pick a move → exercise page.
5. **Food** → log against today’s plan; rings show protein/water.
6. **Notes** → capture; filter; digest for the plan builder.

## Motion

Subtle `rise` on page enter. Respect `prefers-reduced-motion` (already global). No decorative bouncing on chrome.

## Non-goals (this round)

No feature removal, no schema changes, no Vimeo/photo/diagram changes, no renaming of user-facing feature names (Today / Train / Body / Food / Notes / Gym stay).
