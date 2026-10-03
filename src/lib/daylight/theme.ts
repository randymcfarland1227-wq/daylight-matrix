/** Muted, varied weekday accents. Each is dark enough to carry white text (checked >= 4.5:1). */
export const DAY_STYLE: Record<number, { color: string; deep: string; glyph: string; short: string }> = {
  0: { color: "#52606c", deep: "#3a4650", glyph: "o", short: "Sun" },
  1: { color: "#4a5173", deep: "#343a56", glyph: "v", short: "Mon" },
  2: { color: "#2f6577", deep: "#204a58", glyph: "^", short: "Tue" },
  3: { color: "#46607f", deep: "#304560", glyph: "+", short: "Wed" },
  4: { color: "#6a4e78", deep: "#4b3558", glyph: "~", short: "Thu" },
  5: { color: "#7a4a63", deep: "#58334a", glyph: "x", short: "Fri" },
  6: { color: "#5b52a0", deep: "#403a78", glyph: "*", short: "Sat" },
};
