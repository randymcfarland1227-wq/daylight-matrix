import type { RegionId } from "./muscles";

/**
 * Turnable reference male, scaled to 6'4" (1.93 m). The mesh is a neutral mannequin; each muscle region is an ellipsoid
 * "zone" in metres (front is +Z) and the mesh vertices inside a zone take that region's colour. Left and right share a region id.
 * Zones are editorial placements, not a segmentation of the mesh.
 */
export type Zone = { id: RegionId; p: [number, number, number]; s: [number, number, number]; mirror?: boolean };
export const ZONES: Zone[] = [
  { id: "rg-chest", p: [0.09, 1.4, 0.1], s: [0.115, 0.085, 0.09], mirror: true },
  { id: "rg-delt-front", p: [0.245, 1.5, 0.06], s: [0.065, 0.075, 0.07], mirror: true },
  { id: "rg-delt-side", p: [0.27, 1.47, 0], s: [0.06, 0.075, 0.08], mirror: true },
  { id: "rg-delt-rear", p: [0.25, 1.5, -0.07], s: [0.07, 0.07, 0.06], mirror: true },
  { id: "rg-traps", p: [0, 1.56, -0.07], s: [0.15, 0.09, 0.08] },
  { id: "rg-biceps", p: [0.285, 1.3, 0.045], s: [0.065, 0.12, 0.055], mirror: true },
  { id: "rg-triceps", p: [0.285, 1.3, -0.05], s: [0.065, 0.12, 0.05], mirror: true },
  { id: "rg-forearms", p: [0.365, 0.99, 0], s: [0.06, 0.15, 0.075], mirror: true },
  { id: "rg-abs", p: [0, 1.17, 0.11], s: [0.09, 0.15, 0.08] },
  { id: "rg-obliques", p: [0.17, 1.13, 0.02], s: [0.055, 0.1, 0.13], mirror: true },
  { id: "rg-lats", p: [0.17, 1.27, -0.09], s: [0.09, 0.14, 0.07], mirror: true },
  { id: "rg-midback", p: [0, 1.3, -0.1], s: [0.1, 0.1, 0.06] },
  { id: "rg-lowback", p: [0, 1.06, -0.1], s: [0.12, 0.08, 0.06] },
  { id: "rg-glutes", p: [0.09, 0.93, -0.09], s: [0.11, 0.09, 0.08], mirror: true },
  { id: "rg-quads", p: [0.12, 0.72, 0.07], s: [0.085, 0.16, 0.08], mirror: true },
  { id: "rg-adductors", p: [0.065, 0.68, 0.0], s: [0.045, 0.12, 0.07], mirror: true },
  { id: "rg-hamstrings", p: [0.115, 0.72, -0.07], s: [0.085, 0.16, 0.07], mirror: true },
  { id: "rg-calves", p: [0.115, 0.3, -0.05], s: [0.07, 0.13, 0.065], mirror: true },
  { id: "rg-calves", p: [0.1, 0.3, 0.05], s: [0.06, 0.13, 0.05], mirror: true },
];
export const ALL_ZONES: Zone[] = ZONES.flatMap((z) => (z.mirror ? [z, { ...z, p: [-z.p[0], z.p[1], z.p[2]] as [number, number, number] }] : [z]));

export function nd(z: Zone, x: number, y: number, zz: number) {
  const dx = (x - z.p[0]) / z.s[0];
  const dy = (y - z.p[1]) / z.s[1];
  const dz = (zz - z.p[2]) / z.s[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}
