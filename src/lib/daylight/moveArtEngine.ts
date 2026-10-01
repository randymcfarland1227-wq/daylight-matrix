/**
 * Tiny stick-figure engine for movement diagrams.
 * A pose gives the hip position, the torso angle and where the hands / feet are; elbows and knees are solved with
 * two-bone IK. Angles: 0 = down, 90 = right, 180 = up, -90 = left (vector (sin a, cos a) in screen space).
 * Everything is a side view facing right unless the spec says it is a front view.
 */
export type V2 = [number, number];
export type Bend = "fwd" | "back" | "up" | "down";

export type Pose = {
  hip: V2;
  /** torso direction hip -> shoulder */
  t: number;
  /** head direction from shoulder (defaults to torso direction) */
  hd?: number;
  hand?: V2;
  hand2?: V2;
  foot?: V2;
  foot2?: V2;
  /** toe position override for the near / far foot */
  toe?: V2;
  eb?: Bend;
  kb?: Bend;
  eb2?: Bend;
  kb2?: Bend;
  /** shoulder shift, used for shrugs */
  so?: V2;
  /** leave these limbs out */
  noArm2?: boolean;
  noLeg2?: boolean;
};

export type Prop =
  | { t: "seg"; a: V2 | string; b: V2 | string; w?: number; k?: "bench" | "pad" | "bar" | "cable" | "frame" | "band" | "thin"; off?: V2 }
  | { t: "rect"; x: number; y: number; w: number; h: number; k?: "bench" | "block" | "machine" }
  | { t: "circle"; at: V2 | string; r: number; k?: "plate" | "wheel" | "pulley" | "ball" }
  | { t: "weight"; at: string; k: "db" | "bar" | "kb" | "plate" | "rope" | "handle" }
  | { t: "arc"; at: V2 | string; r: number; a0: number; a1: number }
  | { t: "arrow"; a: V2 | string; b: V2 | string }
  | { t: "text"; at: V2; s: string }
  | { t: "wave"; a: V2 | string; b: V2 | string };

export type ArtSpec = {
  /** short caption for the two panels */
  labels?: [string, string];
  /** isometric / hold: draw one panel only */
  hold?: boolean;
  /** joint the movement arrow follows from A to B */
  track?: string;
  front?: boolean;
  props?: Prop[];
  propsA?: Prop[];
  propsB?: Prop[];
  a: Pose;
  b: Pose;
  /** one-line what to look at */
  look?: string;
};

export type Joints = Record<string, V2>;

export const L = { torso: 26, neck: 7, ua: 15, fa: 14, th: 24, sh: 23, foot: 8 };

const vec = (a: number, len: number): V2 => [Math.sin((a * Math.PI) / 180) * len, Math.cos((a * Math.PI) / 180) * len];
const add = (p: V2, q: V2): V2 => [p[0] + q[0], p[1] + q[1]];
const BEND: Record<Bend, V2> = { fwd: [1, 0], back: [-1, 0], up: [0, -1], down: [0, 1] };

function ik(root: V2, target: V2, l1: number, l2: number, bend: Bend): { mid: V2; end: V2 } {
  let dx = target[0] - root[0];
  let dy = target[1] - root[1];
  let d = Math.hypot(dx, dy) || 0.001;
  const max = l1 + l2 - 0.2;
  if (d > max) {
    dx *= max / d;
    dy *= max / d;
    d = max;
  }
  const min = Math.abs(l1 - l2) + 0.5;
  if (d < min) d = min;
  const a = (l1 * l1 - l2 * l2 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(l1 * l1 - a * a, 0));
  const ux = dx / d;
  const uy = dy / d;
  const px = root[0] + ux * a;
  const py = root[1] + uy * a;
  const c1: V2 = [px - uy * h, py + ux * h];
  const c2: V2 = [px + uy * h, py - ux * h];
  const dir = BEND[bend];
  const s1 = (c1[0] - px) * dir[0] + (c1[1] - py) * dir[1];
  const s2 = (c2[0] - px) * dir[0] + (c2[1] - py) * dir[1];
  return { mid: s1 >= s2 ? c1 : c2, end: [root[0] + dx, root[1] + dy] };
}

export function solve(p: Pose): Joints {
  const hip = p.hip;
  const shoulder0 = add(hip, vec(p.t, L.torso));
  const shoulder = p.so ? add(shoulder0, p.so) : shoulder0;
  const head = add(shoulder0, vec(p.hd ?? p.t, L.neck + 3));
  const j: Joints = { hip, shoulder, shoulder0, head, neck: add(shoulder0, vec(p.hd ?? p.t, 4)) };
  const arm = (hand: V2 | undefined, bend: Bend, suffix: string) => {
    const target = hand ?? add(shoulder, [0, L.ua + L.fa - 1]);
    const r = ik(shoulder, target, L.ua, L.fa, bend);
    j["elbow" + suffix] = r.mid;
    j["hand" + suffix] = r.end;
  };
  const leg = (foot: V2 | undefined, bend: Bend, suffix: string, toe?: V2) => {
    const target = foot ?? add(hip, [0, L.th + L.sh - 0.5]);
    const r = ik(hip, target, L.th, L.sh, bend);
    j["knee" + suffix] = r.mid;
    j["ankle" + suffix] = r.end;
    j["toe" + suffix] = toe ?? add(r.end, [L.foot, 1.5]);
  };
  arm(p.hand, p.eb ?? "down", "");
  leg(p.foot, p.kb ?? "fwd", "", p.toe);
  if (p.hand2 && !p.noArm2) arm(p.hand2, p.eb2 ?? p.eb ?? "down", "2");
  if (p.foot2 && !p.noLeg2) leg(p.foot2, p.kb2 ?? p.kb ?? "fwd", "2");
  j.chest = [(hip[0] + shoulder0[0]) / 2 + (shoulder0[0] - hip[0]) * 0.2, (hip[1] + shoulder0[1]) / 2 + (shoulder0[1] - hip[1]) * 0.2];
  return j;
}
