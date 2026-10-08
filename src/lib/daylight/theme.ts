/** Muted weekday chips only — never full-bleed heroes that fight the accent.
 *  Each is dark enough for white text on the tiny streak dots (≥ 4.5:1). */
export const DAY_STYLE: Record<number, { color: string; deep: string; glyph: string; short: string }> = {
  0: { color: "#4a5560", deep: "#363f48", glyph: "o", short: "Sun" },
  1: { color: "#45506a", deep: "#323a50", glyph: "v", short: "Mon" },
  2: { color: "#3a5a68", deep: "#2a424c", glyph: "^", short: "Tue" },
  3: { color: "#44586e", deep: "#324050", glyph: "+", short: "Wed" },
  4: { color: "#584e66", deep: "#403848", glyph: "~", short: "Thu" },
  5: { color: "#604a58", deep: "#463640", glyph: "x", short: "Fri" },
  6: { color: "#4e4c72", deep: "#3a3854", glyph: "*", short: "Sat" },
};
