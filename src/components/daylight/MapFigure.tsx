import { useEffect, useId, useRef, useState } from "react";
import { BACK, DETAIL_BACK, DETAIL_FRONT, FRONT, SILHOUETTE, VIEWBOX, type MusclePath } from "@/lib/daylight/bodyPaths";
import { groupOfSub, muscleName, regionOfSub, subsOf, type AnyMuscleId, type SubId, type View } from "@/lib/daylight/muscles";
import { FIG_LINE, FIG_SKIN } from "@/lib/daylight/figureColors";

const MIRROR = "translate(300 0) scale(-1 1)";

export type MapLevel = "group" | "region" | "sub";

export type MapFigureProps = {
  view: View;
  /** group: 10 big areas. region: ~17 named muscles (Standard). sub: every part (Advanced). */
  level: MapLevel;
  fill: (id: AnyMuscleId) => string;
  selected?: string | null;
  onSelect?: (id: AnyMuscleId) => void;
  /** outlined as underserved */
  under?: (id: AnyMuscleId) => boolean;
  /** drawn faint */
  dim?: (id: AnyMuscleId) => boolean;
  interactive?: boolean;
  className?: string;
  label?: string;
  showLabel?: boolean;
  /** region (or group / sub) id -> number of notes pinned there; drawn as small markers */
  pins?: Record<string, number>;
};

/**
 * Flat anatomical chart: pale body, clean dark-blue contour lines, muscles as clickable regions.
 * Every shape is authored for the left half and mirrored, so the head, ears and symmetry are the same front and back.
 */
export function MapFigure({ view, level, fill, selected, onSelect, under, dim, interactive = true, className, label, showLabel, pins }: MapFigureProps) {
  const uid = useId().replace(/:/g, "");
  const svgRef = useRef<SVGSVGElement>(null);
  const [pinAt, setPinAt] = useState<{ id: string; n: number; x: number; y: number }[]>([]);
  const pinKey = JSON.stringify(pins ?? {});
  useEffect(() => {
    const svg = svgRef.current;
    const out: { id: string; n: number; x: number; y: number }[] = [];
    if (svg && pins) {
      for (const [pid, n] of Object.entries(pins)) {
        if (!n) continue;
        const cands = [pid, ...subsOf(pid)];
        const g = cands.map((c) => svg.querySelector<SVGGElement>(`g[data-muscle="${c}"]`)).find(Boolean);
        const half = g?.querySelector<SVGGElement>(":scope > g > g:first-child");
        if (!half) continue;
        const b = half.getBBox();
        const cx = b.x + b.width / 2;
        const cy = b.y + b.height / 2;
        if (b.x + b.width >= 147) out.push({ id: pid, n, x: 150, y: cy });
        else out.push({ id: pid, n, x: cx, y: cy }, { id: pid, n, x: 300 - cx, y: cy });
      }
    }
    setPinAt(out);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pinKey, view, level]);
  const shapes: MusclePath[] = view === "front" ? FRONT : BACK;
  const details = view === "front" ? DETAIL_FRONT : DETAIL_BACK;
  const idOf = (m: MusclePath): AnyMuscleId => (level === "group" ? groupOfSub(m.muscle) : level === "region" ? regionOfSub(m.muscle).id : m.muscle);
  const seamless = level !== "sub";

  // one entry per clickable id, in a stable order (deep parts drawn last in Advanced so they stay reachable)
  const order: AnyMuscleId[] = [];
  const byId = new Map<AnyMuscleId, MusclePath[]>();
  for (const m of shapes) {
    const id = idOf(m);
    if (!byId.has(id)) {
      byId.set(id, []);
      order.push(id);
    }
    byId.get(id)!.push(m);
  }
  const deepLast = (a: AnyMuscleId, b: AnyMuscleId) => Number(byId.get(a)!.every((m) => m.deep)) - Number(byId.get(b)!.every((m) => m.deep));
  if (level === "sub") order.sort(deepLast);

  const both = (children: React.ReactNode, key: string) => (
    <g key={key}>
      <g>{children}</g>
      <g transform={MIRROR}>{children}</g>
    </g>
  );

  return (
    <svg ref={svgRef} viewBox={VIEWBOX} className={className} role="group" aria-label={label ?? `${view} view body map`} style={{ touchAction: "manipulation" }} data-view={view}>
      <defs>
        <linearGradient id={`sh-${uid}`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#1b2438" stopOpacity="0.12" />
          <stop offset="0.3" stopColor="#1b2438" stopOpacity="0" />
          <stop offset="0.7" stopColor="#1b2438" stopOpacity="0" />
          <stop offset="1" stopColor="#1b2438" stopOpacity="0.12" />
        </linearGradient>
      </defs>
      {/* body */}
      {both(SILHOUETTE.map((p) => <path key={p.id} d={p.d} fill={FIG_SKIN} stroke={FIG_LINE} strokeWidth="1.3" strokeLinejoin="round" />), "sil")}
      {/* muscles */}
      {order.map((id) => {
        const parts = byId.get(id)!;
        const f = fill(id);
        const isSel = selected === id;
        const isUnder = under?.(id) ?? false;
        const deep = parts.every((m) => m.deep);
        const nm = muscleName(id);
        return (
          <g
            key={`${view}-${id}`}
            className="mapreg"
            tabIndex={interactive ? 0 : -1}
            role={interactive ? "button" : undefined}
            aria-label={interactive ? `${nm}${isSel ? ", selected" : ""}` : undefined}
            data-muscle={id}
            data-selected={isSel}
            data-under={isUnder}
            data-dim={dim?.(id) ? "true" : "false"}
            data-deep={deep}
            pointerEvents={interactive ? "auto" : "none"}
            onClick={interactive && onSelect ? () => onSelect(id) : undefined}
            onKeyDown={interactive && onSelect ? (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onSelect(id)) : undefined}
          >
            <title>{nm}</title>
            {seamless
              ? // outline pass under the fill pass: a clean outer contour with no seams between parts of one region
                both(parts.map((m, i) => <path key={i} d={m.d} className="mr-edge" fill={FIG_LINE} stroke={FIG_LINE} strokeWidth="2.2" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />), "e")
              : null}
            {both(
              parts.map((m, i) => (
                <path
                  key={i}
                  d={m.d}
                  className="mr-fill"
                  fill={f}
                  fillOpacity={deep ? 0.7 : 1}
                  stroke={seamless ? f : FIG_LINE}
                  strokeWidth={seamless ? 1 : 1}
                  strokeDasharray={deep ? "3 2" : undefined}
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              )),
              "f",
            )}
            {both(parts.map((m, i) => <path key={i} d={m.d} fill={`url(#sh-${uid})`} pointerEvents="none" />), "s")}
            {isUnder
              ? both(parts.map((m, i) => <path key={i} d={m.d} className="mr-under" fill="none" stroke="#14203a" strokeWidth="2" strokeDasharray="5 3" vectorEffect="non-scaling-stroke" pointerEvents="none" />), "u")
              : null}
          </g>
        );
      })}
      {/* anatomical detail lines (clavicle, linea alba, scapula spine ...) */}
      {both(details.map((d, i) => <path key={i} d={d.d} fill="none" stroke={FIG_LINE} strokeOpacity="0.55" strokeWidth={d.w ?? 1} strokeLinecap="round" pointerEvents="none" />), "det")}
      {pinAt.map((p, i) => (
        <g key={`${p.id}-${i}`} data-pin={p.id} pointerEvents="none">
          <circle cx={p.x} cy={p.y} r="8.5" fill="#fff" stroke="#14203a" strokeWidth="2" />
          <text x={p.x} y={p.y + 3.6} textAnchor="middle" fontSize="10" fontWeight="800" fill="#14203a">{p.n > 9 ? "9+" : p.n}</text>
        </g>
      ))}
      {showLabel ? (
        <text x="150" y="598" textAnchor="middle" fontSize="12" fontWeight="700" letterSpacing="2.5" fill="currentColor" opacity="0.7">
          {view === "front" ? "FRONT" : "BACK"}
        </text>
      ) : null}
    </svg>
  );
}

export type { SubId };
