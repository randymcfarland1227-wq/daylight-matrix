import { useEffect, useId, useRef, useState } from "react";
import { BACK, DETAIL_BACK, DETAIL_FRONT, FRONT, SILHOUETTE, VIEWBOX, type MusclePath } from "@/lib/daylight/bodyPaths";
import { groupOfSub, muscleName, regionOfSub, subsOf, type AnyMuscleId, type SubId, type View } from "@/lib/daylight/muscles";
import { FIG_LINE, FIG_SKIN } from "@/lib/daylight/figureColors";

const MIRROR = "translate(300 0) scale(-1 1)";

const FIBRES = [...new Set([...FRONT, ...BACK].map((m) => m.fibre).filter((a): a is number => a != null))];

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
  /** Sculpted look: shaded skin, lit muscle relief, orange highlight on select, hover labels with a mouse. */
  realistic?: boolean;
};

/**
 * Flat anatomical chart: pale body, clean dark-blue contour lines, muscles as clickable regions.
 * Every shape is authored for the left half and mirrored, so the head, ears and symmetry are the same front and back.
 */
export function MapFigure({ view, level, fill, selected, onSelect, under, dim, interactive = true, className, label, showLabel, pins, realistic }: MapFigureProps) {
  const [hov, setHov] = useState<{ name: string; x: number; y: number } | null>(null);
  const hoverAt = (name: string, e: React.PointerEvent) => {
    if (!realistic || e.pointerType !== "mouse") return;
    const svg = svgRef.current; const m = svg?.getScreenCTM();
    if (!svg || !m) return;
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    setHov({ name, x: pt.x, y: pt.y });
  };
  const line = realistic ? "#93705c" : FIG_LINE;
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
        {FIBRES.map((a) => (
          <pattern key={a} id={`fb-${uid}-${a < 0 ? "m" + -a : a}`} width="3.2" height="3.2" patternUnits="userSpaceOnUse" patternTransform={`rotate(${a})`}>
            <line x1="0" y1="1.6" x2="3.2" y2="1.6" stroke="#1b2438" strokeOpacity={realistic ? 0.09 : 0.16} strokeWidth="0.55" />
          </pattern>
        ))}
        <linearGradient id={`skin-${uid}`} gradientUnits="userSpaceOnUse" x1="55" x2="150" y1="0" y2="0">
          <stop offset="0" stopColor="#b08a72" />
          <stop offset="0.35" stopColor="#d3ae96" />
          <stop offset="1" stopColor="#e0bfa8" />
        </linearGradient>
        <filter id={`rl-${uid}`} x="-15%" y="-15%" width="130%" height="130%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="b" />
          <feDiffuseLighting in="b" surfaceScale="2" diffuseConstant="1.08" lightingColor="#ffffff" result="df"><feDistantLight azimuth="270" elevation="48" /></feDiffuseLighting>
          <feComposite in="df" in2="SourceAlpha" operator="in" result="dfi" />
          <feBlend in="SourceGraphic" in2="dfi" mode="multiply" result="sh" />
          <feSpecularLighting in="b" surfaceScale="2" specularConstant="0.4" specularExponent="16" lightingColor="#fff4ea" result="sp"><feDistantLight azimuth="270" elevation="55" /></feSpecularLighting>
          <feComposite in="sp" in2="SourceAlpha" operator="in" result="spi" />
          <feComposite in="sh" in2="spi" operator="arithmetic" k2="1" k3="0.6" />
        </filter>
      </defs>
      {/* body */}
      {both(SILHOUETTE.map((p) => <path key={p.id} d={p.d} fill={realistic ? `url(#skin-${uid})` : FIG_SKIN} stroke={line} strokeWidth={realistic ? 1 : 1.3} strokeLinejoin="round" />), "sil")}
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
            onPointerMove={(e) => hoverAt(nm, e)}
            onPointerLeave={() => setHov(null)}
            onKeyDown={interactive && onSelect ? (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onSelect(id)) : undefined}
          >
            <title>{nm}</title>
            {seamless
              ? // outline pass under the fill pass: a clean outer contour with no seams between parts of one region
                both(parts.map((m, i) => <path key={i} d={m.d} className="mr-edge" fill={line} stroke={line} strokeWidth={realistic ? 1 : 2.2} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />), "e")
              : null}
            <g filter={realistic ? `url(#rl-${uid})` : undefined}>{both(
              parts.map((m, i) => (
                <path
                  key={i}
                  d={m.d}
                  className="mr-fill"
                  fill={f}
                  fillOpacity={deep ? 0.7 : 1}
                  stroke={seamless ? f : line}
                  strokeWidth={realistic ? 0.6 : 1}
                  strokeOpacity={realistic ? 0.7 : 1}
                  strokeDasharray={deep ? "3 2" : undefined}
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              )),
              "f",
            )}</g>
            {both(parts.filter((m) => m.fibre != null).map((m, i) => <path key={i} d={m.d} fill={`url(#fb-${uid}-${m.fibre! < 0 ? "m" + -m.fibre! : m.fibre})`} pointerEvents="none" />), "fb")}
            {realistic ? null : both(parts.map((m, i) => <path key={i} d={m.d} fill={`url(#sh-${uid})`} pointerEvents="none" />), "s")}
            {isUnder
              ? both(parts.map((m, i) => <path key={i} d={m.d} className="mr-under" fill="none" stroke="#14203a" strokeWidth="2" strokeDasharray="5 3" vectorEffect="non-scaling-stroke" pointerEvents="none" />), "u")
              : null}
          </g>
        );
      })}
      {/* anatomical detail lines (clavicle, linea alba, scapula spine ...) */}
      {both(details.map((d, i) => <path key={i} d={d.d} fill="none" stroke={line} strokeOpacity={realistic ? 0.4 : 0.55} strokeWidth={d.w ?? 1} strokeLinecap="round" pointerEvents="none" />), "det")}
      {pinAt.map((p, i) => (
        <g key={`${p.id}-${i}`} data-pin={p.id} pointerEvents="none">
          <circle cx={p.x} cy={p.y} r="8.5" fill="#fff" stroke="#14203a" strokeWidth="2" />
          <text x={p.x} y={p.y + 3.6} textAnchor="middle" fontSize="10" fontWeight="800" fill="#14203a">{p.n > 9 ? "9+" : p.n}</text>
        </g>
      ))}
      {hov ? (
        <g pointerEvents="none" data-testid="map-hover-label">
          <rect x={Math.min(Math.max(hov.x - hov.name.length * 3.1 - 6, 2), 298 - hov.name.length * 6.2 - 12)} y={hov.y - 30} width={hov.name.length * 6.2 + 12} height="18" rx="5" fill="#1d1a17" fillOpacity="0.88" />
          <text x={Math.min(Math.max(hov.x, hov.name.length * 3.1 + 8), 292 - hov.name.length * 3.1)} y={hov.y - 17.5} textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#fff">{hov.name}</text>
        </g>
      ) : null}
      {showLabel ? (
        <text x="150" y="598" textAnchor="middle" fontSize="12" fontWeight="700" letterSpacing="2.5" fill="currentColor" opacity="0.7">
          {view === "front" ? "FRONT" : "BACK"}
        </text>
      ) : null}
    </svg>
  );
}

export type { SubId };
