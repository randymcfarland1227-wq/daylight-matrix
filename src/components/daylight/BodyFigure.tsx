import { BACK, DETAIL_BACK, DETAIL_FRONT, FRONT, SILHOUETTE_BACK, SILHOUETTE_FRONT, VIEWBOX } from "@/lib/daylight/bodyPaths";
import { muscleName, type MuscleId } from "@/lib/daylight/muscles";

const MIRROR = "translate(300 0) scale(-1 1)";

/** Warm ramp: idle -> light gold -> amber -> copper -> deep ember. level is 0..1. */
export function heatColor(level: number): string {
  if (level <= 0.001) return "var(--muscle-idle)";
  const stops: [number, [number, number, number]][] = [
    [0, [246, 222, 150]],
    [0.4, [240, 176, 70]],
    [0.75, [214, 106, 44]],
    [1, [150, 52, 36]],
  ];
  for (let i = 1; i < stops.length; i += 1) {
    const [t1, c1] = stops[i]!;
    const [t0, c0] = stops[i - 1]!;
    if (level <= t1) {
      const f = (level - t0) / (t1 - t0);
      return `rgb(${c0.map((v, k) => Math.round(v + (c1[k]! - v) * f)).join(",")})`;
    }
  }
  return "rgb(150,52,36)";
}

export type FigureProps = {
  view: "front" | "back";
  fill: (id: MuscleId) => string;
  selected: MuscleId | null;
  onSelect: (id: MuscleId) => void;
  /** muscles drawn faint (not part of the current filter) */
  dim?: (id: MuscleId) => boolean;
  /** muscles outlined as underserved */
  under?: (id: MuscleId) => boolean;
  className?: string;
  interactive?: boolean;
};

export function BodyFigure({ view, fill, selected, onSelect, dim, under, className, interactive = true }: FigureProps) {
  const silhouette = view === "front" ? SILHOUETTE_FRONT : SILHOUETTE_BACK;
  const muscles = view === "front" ? FRONT : BACK;
  const details = view === "front" ? DETAIL_FRONT : DETAIL_BACK;
  const both = (children: React.ReactNode) => (
    <>
      <g>{children}</g>
      <g transform={MIRROR}>{children}</g>
    </>
  );
  return (
    <svg viewBox={VIEWBOX} className={className} role="group" aria-label={`${view} view body map`} style={{ touchAction: "manipulation" }}>
      <defs>
        <radialGradient id="floorglow" cx="50%" cy="100%" r="60%">
          <stop offset="0%" stopColor="var(--sun)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--sun)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="150" cy="576" rx="105" ry="14" fill="url(#floorglow)" />
      {both(silhouette.map((p) => <path key={p.id} d={p.d} fill="var(--body-skin)" stroke="var(--line)" strokeWidth="1" />))}
      {muscles.map((m) => {
        const id = m.muscle;
        return (
          <g
            key={`${view}-${id}`}
            className="muscle"
            tabIndex={interactive ? 0 : -1}
            role={interactive ? "button" : undefined}
            aria-label={`${muscleName(id)}${selected === id ? ", selected" : ""}`}
            aria-pressed={interactive ? selected === id : undefined}
            data-selected={selected === id}
            data-dim={dim?.(id) ? "true" : "false"}
            data-under={under?.(id) ? "true" : "false"}
            onClick={interactive ? () => onSelect(id) : undefined}
            onKeyDown={interactive ? (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onSelect(id)) : undefined}
          >
            <path d={m.d} fill={fill(id)} />
            <path d={m.d} transform={MIRROR} fill={fill(id)} />
          </g>
        );
      })}
      {both(details.map((d, i) => <path key={i} d={d} fill="none" stroke="var(--ink)" strokeOpacity="0.14" strokeWidth="1" strokeLinecap="round" pointerEvents="none" />))}
      <circle cx="150" cy="40" r="0" />
    </svg>
  );
}
