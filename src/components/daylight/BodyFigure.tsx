import { useId } from "react";
import { BACK, DETAIL_BACK, DETAIL_FRONT, FRONT, SILHOUETTE, VIEWBOX, type MusclePath } from "@/lib/daylight/bodyPaths";
import { groupInfo, groupOfSub, muscleName, type GroupId, type MuscleId, type SubId, type View } from "@/lib/daylight/muscles";

const MIRROR = "translate(300 0) scale(-1 1)";

/** Warm ramp tuned for a dark canvas: idle -> bone -> sand -> amber -> copper -> deep ember. level is 0..1. */
export function heatColor(level: number): string {
  if (level <= 0.001) return "var(--muscle-idle)";
  const stops: [number, [number, number, number]][] = [
    [0, [190, 168, 128]],
    [0.4, [214, 168, 98]],
    [0.75, [200, 118, 70]],
    [1, [166, 66, 52]],
  ];
  for (let i = 1; i < stops.length; i += 1) {
    const [t1, c1] = stops[i]!;
    const [t0, c0] = stops[i - 1]!;
    if (level <= t1) {
      const f = (level - t0) / (t1 - t0);
      return `rgb(${c0.map((v, k) => Math.round(v + (c1[k]! - v) * f)).join(",")})`;
    }
  }
  return "rgb(166,66,52)";
}

/** Crop windows (x y w h) used for the group detail map. */
export const GROUP_BOX: Record<GroupId, Partial<Record<View, string>>> = {
  chest: { front: "64 96 172 140" },
  shoulders: { front: "56 84 188 110", back: "56 84 188 110" },
  back: { back: "62 84 176 214" },
  arms: { front: "36 100 228 300", back: "36 100 228 300" },
  core: { front: "76 176 148 140" },
  glutes: { back: "70 250 160 120" },
  quads: { front: "66 296 168 160" },
  adductors: { front: "66 296 168 160" },
  hamstrings: { back: "66 330 168 140" },
  calves: { front: "70 430 160 170", back: "70 430 160 170" },
};

/** Muscle-fibre direction (degrees) used for the striation texture, by sub-part. */
function fibreAngle(id: SubId): 0 | 35 | 90 | 125 {
  const g = groupOfSub(id);
  if (g === "core") return id === "obliques" ? 125 : 0;
  if (g === "chest") return 35;
  if (id === "lats" || id === "traps-lower" || id === "traps-upper" || id === "rhomboids") return 125;
  if (g === "glutes") return 125;
  return 90;
}

export type FigureProps = {
  view: View;
  /** "group": each group is one region (main map). "sub": every sub-part separately (detail map). */
  level: "group" | "sub";
  fill: (id: MuscleId) => string;
  selected?: string | null;
  onSelect?: (id: MuscleId) => void;
  /** drawn faint */
  dim?: (id: MuscleId) => boolean;
  /** outlined as underserved */
  under?: (id: MuscleId) => boolean;
  /** only draw these groups' sub-parts (detail map); the rest of the body is shown as a quiet silhouette */
  onlyGroup?: GroupId;
  viewBox?: string;
  className?: string;
  interactive?: boolean;
  label?: string;
};

export function BodyFigure({ view, level, fill, selected, onSelect, dim, under, onlyGroup, viewBox, className, interactive = true, label }: FigureProps) {
  const uid = useId().replace(/:/g, "");
  const muscles: MusclePath[] = (view === "front" ? FRONT : BACK).filter((m) => !onlyGroup || groupOfSub(m.muscle) === onlyGroup);
  const details = view === "front" ? DETAIL_FRONT : DETAIL_BACK;
  const both = (children: React.ReactNode, key: string) => (
    <g key={key}>
      <g>{children}</g>
      <g transform={MIRROR}>{children}</g>
    </g>
  );
  const idOf = (m: MusclePath): MuscleId => (level === "group" ? groupOfSub(m.muscle) : m.muscle);
  // draw order: deep parts first so surface muscles sit on top
  const ordered = muscles.slice().sort((a, b) => Number(Boolean(b.deep)) - Number(Boolean(a.deep)));
  const context: MusclePath[] = onlyGroup ? (view === "front" ? FRONT : BACK).filter((m) => groupOfSub(m.muscle) !== onlyGroup) : [];

  return (
    <svg viewBox={viewBox ?? VIEWBOX} className={className} role="group" aria-label={label ?? `${view} view body map`} style={{ touchAction: "manipulation" }}>
      <defs>
        <linearGradient id={`sh-${uid}`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity="0.22" />
          <stop offset="0.28" stopColor="#000" stopOpacity="0" />
          <stop offset="0.72" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.22" />
        </linearGradient>
        {[0, 35, 90, 125].map((a) => (
          <pattern key={a} id={`fb${a}-${uid}`} width="4" height="4" patternUnits="userSpaceOnUse" patternTransform={`rotate(${a})`}>
            <line x1="0" y1="0" x2="0" y2="4" stroke="#000" strokeOpacity="0.22" strokeWidth="0.7" />
          </pattern>
        ))}
        <radialGradient id={`gl-${uid}`} cx="50%" cy="38%" r="60%">
          <stop offset="0" stopColor="#fff" stopOpacity="0.14" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* silhouette */}
      {both(SILHOUETTE.map((p) => <path key={p.id} d={p.d} fill="var(--body-skin)" stroke="var(--body-edge)" strokeWidth="1" strokeLinejoin="round" />), "sil")}
      {/* context muscles (detail map): faint, not interactive */}
      {context.length
        ? both(context.map((m, i) => <path key={i} d={m.d} fill="var(--muscle-idle)" opacity="0.35" stroke="var(--body-edge)" strokeWidth="0.5" />), "ctx")
        : null}
      {ordered.map((m, i) => {
        const id = idOf(m);
        const sel = selected === id || (level === "sub" && selected === groupOfSub(m.muscle) && false);
        const f = fill(id);
        const strokeColor = level === "group" ? f : "var(--muscle-stroke)";
        return (
          <g
            key={`${view}-${m.muscle}-${i}`}
            className="muscle"
            tabIndex={interactive ? 0 : -1}
            role={interactive ? "button" : undefined}
            aria-label={interactive ? `${muscleName(id)}${selected === id ? ", selected" : ""}` : undefined}
            aria-pressed={interactive ? selected === id : undefined}
            data-muscle={id}
            data-selected={sel}
            data-dim={dim?.(id) ? "true" : "false"}
            data-under={under?.(id) ? "true" : "false"}
            data-deep={m.deep ? "true" : "false"}
            onClick={interactive && onSelect ? () => onSelect(id) : undefined}
            onKeyDown={interactive && onSelect ? (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onSelect(id)) : undefined}
          >
            <path d={m.d} fill={f} stroke={strokeColor} />
            <path d={m.d} transform={MIRROR} fill={f} stroke={strokeColor} />
            <path d={m.d} fill={`url(#sh-${uid})`} pointerEvents="none" style={{ stroke: "none" }} />
            <path d={m.d} transform={MIRROR} fill={`url(#sh-${uid})`} pointerEvents="none" style={{ stroke: "none" }} />
            <path d={m.d} fill={`url(#fb${fibreAngle(m.muscle)}-${uid})`} pointerEvents="none" style={{ stroke: "none" }} />
            <path d={m.d} transform={MIRROR} fill={`url(#fb${fibreAngle(m.muscle)}-${uid})`} pointerEvents="none" style={{ stroke: "none" }} />
          </g>
        );
      })}
      {both(details.map((d, i) => <path key={i} d={d.d} fill="none" stroke="var(--ink)" strokeOpacity="0.2" strokeWidth={d.w ?? 1} strokeLinecap="round" pointerEvents="none" />), "det")}
      <rect x="0" y="0" width="300" height="600" fill={`url(#gl-${uid})`} pointerEvents="none" />
    </svg>
  );
}

export { groupInfo };
export type { SubId };
