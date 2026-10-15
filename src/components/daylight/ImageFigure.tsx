import { useMemo, useState } from "react";
import { IMAGE_MAP, IMAGE_PINS, IMG_H, IMG_W, imgBase, imgOverlay } from "@/lib/daylight/imageMap";
import { groupOfSub, muscleName, regionOfSub, type AnyMuscleId, type SubId, type View } from "@/lib/daylight/muscles";
import type { MapLevel } from "./MapFigure";

/**
 * Gymkee-style figure: a rendered body image, our own tappable regions on top, and Gymkee's per-muscle highlight layer
 * shown through the selected region (so a sub-muscle glows only where it is). Regions without a Gymkee layer get a
 * translucent orange fill instead.
 */
export function ImageFigure({ view, level, selected, onSelect, interactive = true, children }: {
  view: View; level: MapLevel; selected?: string | null; onSelect?: (id: AnyMuscleId) => void; interactive?: boolean; children?: React.ReactNode;
}) {
  const [hov, setHov] = useState<{ id: AnyMuscleId; x: number; y: number } | null>(null);
  const [broken, setBroken] = useState(false);
  const idOf = (s: SubId): AnyMuscleId => (level === "group" ? groupOfSub(s) : level === "region" ? regionOfSub(s).id : s);
  const regions = IMAGE_MAP[view];
  const byId = useMemo(() => {
    const m = new Map<AnyMuscleId, typeof regions>();
    for (const r of regions) { const id = idOf(r.sub); m.set(id, [...(m.get(id) ?? []), r]); }
    return m;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, level]);
  const pins = level === "sub" ? IMAGE_PINS[view] : [];
  const active = [...new Set([selected, hov?.id].filter(Boolean) as AnyMuscleId[])];
  const glow = (id: AnyMuscleId, strong: boolean) => {
    const parts = byId.get(id) ?? [];
    return parts.map((r, i) => (
      <g key={`${id}-${i}`} pointerEvents="none">
        {r.key ? (
          <>
            <clipPath id={`clip-${view}-${id}-${i}`}><path d={r.d} /></clipPath>
            <image href={imgOverlay(r.key, view)} width={IMG_W} height={IMG_H} clipPath={`url(#clip-${view}-${id}-${i})`} opacity={strong ? 1 : 0.75} />
            <image href={imgOverlay(r.key, view)} width={IMG_W} height={IMG_H} clipPath={`url(#clip-${view}-${id}-${i})`} opacity={strong ? 0.8 : 0.4} />
          </>
        ) : null}
        <path d={r.d} fill="#c2993a" fillOpacity={r.key ? (strong ? 0.22 : 0.12) : strong ? 0.5 : 0.3} stroke="#c2993a" strokeOpacity={strong ? 0.9 : 0.5} strokeWidth="2" strokeLinejoin="round" />
      </g>
    ));
  };
  const name = (id: AnyMuscleId) => muscleName(id);
  return (
    <div className="relative w-full select-none" style={{ aspectRatio: `${IMG_W} / ${IMG_H}` }} data-view={view} data-testid={`img-figure-${view}`}>
      <img src={imgBase(view)} alt={`${view} body`} className="absolute inset-0 size-full object-contain" draggable={false} onError={() => setBroken(true)} />
      {broken ? <p className="absolute inset-x-0 top-1/3 text-center text-sm text-ink-soft">Body image couldn't load (offline?). The list below still works.</p> : null}
      <svg viewBox={`0 0 ${IMG_W} ${IMG_H}`} className="absolute inset-0 size-full" role="group" aria-label={`${view} body map`} style={{ touchAction: "manipulation" }}>
        {active.map((id) => glow(id, id === selected))}
        {interactive
          ? [...byId.entries()].map(([id, parts]) => (
              <g key={id} className="imgreg cursor-pointer" role="button" tabIndex={0} aria-label={name(id)} data-muscle={id} data-selected={selected === id}
                onClick={() => onSelect?.(id)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onSelect?.(id))}
                onPointerMove={(e) => {
                  if (e.pointerType !== "mouse") return;
                  const b = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
                  setHov({ id, x: ((e.clientX - b.left) / b.width) * 100, y: ((e.clientY - b.top) / b.height) * 100 });
                }}
                onPointerLeave={() => setHov(null)}>
                <title>{name(id)}</title>
                {parts.map((r, i) => <path key={i} d={r.d} fill="#fff" fillOpacity="0.001" />)}
              </g>
            ))
          : null}
        {interactive
          ? pins.map((p) => [p.x, IMG_W - p.x].map((x, i) => (
              <g key={`${p.sub}-${i}`} className="cursor-pointer" role="button" tabIndex={i ? -1 : 0} aria-label={`${name(p.sub)} (deep)`} data-muscle={p.sub} data-selected={selected === p.sub}
                onClick={() => onSelect?.(p.sub)} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onSelect?.(p.sub))}>
                <title>{`${name(p.sub)} (deep)`}</title>
                <circle cx={x} cy={p.y} r="20" fill="transparent" />
                <circle cx={x} cy={p.y} r="10" fill={selected === p.sub ? "#c2993a" : "#fff"} fillOpacity="0.85" stroke="#c4501a" strokeWidth="2.5" strokeDasharray="4 3" />
              </g>
            )))
          : null}
      </svg>
      {children}
      {hov ? (
        <span className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[140%] whitespace-nowrap rounded-full bg-[#1d1a17]/90 px-2.5 py-1 text-xs font-semibold text-white" style={{ left: `${hov.x}%`, top: `${hov.y}%` }} data-testid="map-hover-label">{name(hov.id)}</span>
      ) : null}
      <span className="pointer-events-none absolute bottom-1 left-1/2 -translate-x-1/2 text-[11px] font-bold tracking-[0.2em] text-ink-soft">{view === "front" ? "FRONT" : "BACK"}</span>
    </div>
  );
}
