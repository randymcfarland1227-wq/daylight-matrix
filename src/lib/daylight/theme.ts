/** Muted, varied weekday accents. Each is dark enough to carry white text (checked >= 4.5:1). */
export const DAY_STYLE: Record<number, { color: string; deep: string; glyph: string; short: string }> = {
  0: { color: "#5a5750", deep: "#3f3d38", glyph: "o", short: "Sun" },
  1: { color: "#4a5173", deep: "#343a56", glyph: "v", short: "Mon" },
  2: { color: "#7a5f36", deep: "#58431f", glyph: "^", short: "Tue" },
  3: { color: "#3e5d68", deep: "#2a434c", glyph: "+", short: "Wed" },
  4: { color: "#7b4f47", deep: "#583530", glyph: "~", short: "Thu" },
  5: { color: "#5f4f76", deep: "#443758", glyph: "x", short: "Fri" },
  6: { color: "#77553a", deep: "#533a25", glyph: "*", short: "Sat" },
};
