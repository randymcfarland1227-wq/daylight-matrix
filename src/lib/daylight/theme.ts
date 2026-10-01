/** Each weekday borrows the header colour of its column in the PDF. */
export const DAY_STYLE: Record<number, { color: string; deep: string; glyph: string; short: string }> = {
  0: { color: "#4d6b66", deep: "#34504b", glyph: "☀", short: "Sun" },
  1: { color: "#34568b", deep: "#233c66", glyph: "↧", short: "Mon" },
  2: { color: "#a35f0c", deep: "#7a4506", glyph: "◢", short: "Tue" },
  3: { color: "#3d7d4f", deep: "#2a5c37", glyph: "↥", short: "Wed" },
  4: { color: "#7e6638", deep: "#5d4a26", glyph: "≈", short: "Thu" },
  5: { color: "#6f4b92", deep: "#523570", glyph: "◣", short: "Fri" },
  6: { color: "#725749", deep: "#533e33", glyph: "✦", short: "Sat" },
};
