import type { GroupId } from "./muscles";

/**
 * Colour system for the body figure (the app chrome stays calm and dark-leaning; the figure may be colourful).
 * - Every muscle GROUP has its own hue (none is a bright saturated green).
 * - How strongly a muscle works in a move (primary / secondary / tertiary) is shown by the strength of that hue.
 * - The heat map is a separate ramp, cold blue -> hot red.
 */
export const GROUP_HUE: Record<GroupId, string> = {
  chest: "#e5566a",
  shoulders: "#f2a03a",
  back: "#4b8fe2",
  arms: "#a96be0",
  core: "#2db3b0",
  glutes: "#ec6aae",
  quads: "#e8c23a",
  adductors: "#d9845a",
  hamstrings: "#7d86e8",
  calves: "#55b9ea",
};

export const FIG_SKIN = "#dfe3ea";
export const FIG_LINE = "#3a4660";

type RGB = [number, number, number];
const hex = (h: string): RGB => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const css = (c: RGB) => `rgb(${c.map((v) => Math.round(v)).join(",")})`;
export function mix(a: string, b: string, t: number): string {
  const x = hex(a);
  const y = hex(b);
  return css([x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t]);
}

export type Role = "primary" | "secondary" | "tertiary";
export const ROLE_STRENGTH: Record<Role, number> = { primary: 1, secondary: 0.62, tertiary: 0.34 };
export const ROLE_LABEL: Record<Role, string> = { primary: "Primary", secondary: "Secondary", tertiary: "Tertiary" };

/** A group's hue at the strength of a role. */
export function roleColor(group: GroupId, role: Role): string {
  return mix(FIG_SKIN, GROUP_HUE[group], ROLE_STRENGTH[role]);
}
export function roleOfWeight(w: number): Role {
  return w >= 1 ? "primary" : w >= 0.5 ? "secondary" : "tertiary";
}

/** Heat ramp, cold blue -> teal -> yellow -> orange -> hot red. level is 0..1; 0 = not trained (the plain figure). */
const RAMP: [number, string][] = [
  [0, "#4f6fc9"],
  [0.25, "#4bb3d8"],
  [0.5, "#efd24c"],
  [0.75, "#f08a3a"],
  [1, "#d9363b"],
];
export function rampColor(level: number): string {
  if (level <= 0.001) return FIG_SKIN;
  const l = Math.min(1, Math.max(0.04, level));
  for (let i = 1; i < RAMP.length; i += 1) {
    const [t1, c1] = RAMP[i]!;
    const [t0, c0] = RAMP[i - 1]!;
    if (l <= t1) return mix(c0, c1, (l - t0) / (t1 - t0));
  }
  return RAMP[RAMP.length - 1]![1];
}
/** "Indirect only": a washed, grey-blue so it reads between untouched and trained. */
export const INDIRECT_COLOR = "#9fb0cf";
export const RAMP_CSS = `linear-gradient(90deg, ${RAMP.map(([t, c]) => `${c} ${t * 100}%`).join(", ")})`;
