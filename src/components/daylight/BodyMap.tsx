import { REGIONS, heatBand } from "@/lib/daylight/body";
import type { BodyLayer } from "@/lib/daylight/types";
import { cn } from "@/lib/cn";

const HEAT = ["transparent", "var(--color-heat-1)", "var(--color-heat-2)", "var(--color-heat-3)"] as const;

type Hotspot = { cx: number; cy: number; rx: number; ry: number };

/** Ellipses over the illustrated figure, in a 100×150 viewBox (2:3). */
const HOTSPOTS: Record<string, Hotspot> = {
  chest: { cx: 50, cy: 43, rx: 8, ry: 4.5 },
  "shoulder-front-left": { cx: 36, cy: 38, rx: 4.5, ry: 3.8 },
  "shoulder-front-right": { cx: 64, cy: 38, rx: 4.5, ry: 3.8 },
  "biceps-left": { cx: 33, cy: 57, rx: 3.2, ry: 6.5 },
  "biceps-right": { cx: 67, cy: 57, rx: 3.2, ry: 6.5 },
  abs: { cx: 50, cy: 64, rx: 4.5, ry: 7.5 },
  "oblique-left": { cx: 41, cy: 66, rx: 2.8, ry: 6 },
  "oblique-right": { cx: 59, cy: 66, rx: 2.8, ry: 6 },
  "quad-left": { cx: 42.5, cy: 95, rx: 4.2, ry: 7 },
  "quad-right": { cx: 57.5, cy: 95, rx: 4.2, ry: 7 },
  "calf-front-left": { cx: 41.5, cy: 120, rx: 2.8, ry: 7 },
  "calf-front-right": { cx: 58.5, cy: 120, rx: 2.8, ry: 7 },
  traps: { cx: 50, cy: 40, rx: 7, ry: 4.2 },
  "rear-delt-left": { cx: 35, cy: 39, rx: 4.5, ry: 3.8 },
  "rear-delt-right": { cx: 65, cy: 39, rx: 4.5, ry: 3.8 },
  "lat-left": { cx: 41, cy: 62, rx: 5, ry: 8.5 },
  "lat-right": { cx: 59, cy: 62, rx: 5, ry: 8.5 },
  "lower-back": { cx: 50, cy: 73, rx: 4.2, ry: 5 },
  "glute-left": { cx: 44, cy: 83, rx: 5, ry: 5.5 },
  "glute-right": { cx: 56, cy: 83, rx: 5, ry: 5.5 },
  "ham-left": { cx: 42.5, cy: 98, rx: 4, ry: 7 },
  "ham-right": { cx: 57.5, cy: 98, rx: 4, ry: 7 },
  "calf-left": { cx: 41.5, cy: 121, rx: 3, ry: 6.5 },
  "calf-right": { cx: 58.5, cy: 121, rx: 3, ry: 6.5 },
};

export type BodyCallout = { regionId: string; text: string };

export function BodyPreview({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="tap grid size-16 place-items-center overflow-hidden rounded-2xl bg-stage"
      aria-label="Open Body"
    >
      <img src="/body-front.jpg" alt="" className="h-14 w-10 object-cover object-[center_18%]" />
    </button>
  );
}

export function AnatomyStage({
  view,
  layer,
  selectedId,
  counts,
  planned,
  felt,
  callouts = [],
  onSelect,
}: {
  view: "front" | "back";
  layer: BodyLayer;
  selectedId: string | null;
  counts: Record<string, number>;
  planned: Record<string, "primary" | "secondary">;
  felt: string[];
  callouts?: BodyCallout[];
  onSelect: (id: string) => void;
}) {
  const regions = REGIONS.filter((region) => region.view === view && HOTSPOTS[region.id]);
  const src = view === "front" ? "/body-front.jpg" : "/body-back.jpg";
  return (
    <div className="overflow-hidden rounded-2xl bg-stage text-canvas">
      <div className="relative mx-auto aspect-[2/3] w-full max-w-xs">
        <img src={src} alt="" className="absolute inset-0 h-full w-full object-fill" />
        <svg viewBox="0 0 100 150" className="absolute inset-0 h-full w-full" role="group" aria-label={`${view} body map`}>
          {regions.map((region) => {
            const spot = HOTSPOTS[region.id]!;
            const active = isActive(region.id, layer, counts, planned, felt);
            const selected = selectedId === region.id;
            return (
              <ellipse
                key={region.id}
                cx={spot.cx}
                cy={spot.cy}
                rx={spot.rx}
                ry={spot.ry}
                fill={fillFor(region.id, layer, counts, planned, felt)}
                fillOpacity={isActive(region.id, layer, counts, planned, felt) ? 0.62 : 0}
                stroke={selected ? "var(--color-copper)" : active ? "rgba(245,242,235,0.85)" : "transparent"}
                strokeWidth={selected ? 0.7 : 0.35}
                className="cursor-pointer"
                onClick={() => onSelect(region.id)}
                tabIndex={0}
                role="button"
                aria-label={region.name}
                aria-pressed={selected}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelect(region.id);
                  }
                }}
              >
                <title>{region.name}</title>
              </ellipse>
            );
          })}
          {callouts.map((callout) => {
            const spot = HOTSPOTS[callout.regionId];
            if (!spot) return null;
            const side = spot.cx < 46 ? "left" : spot.cx > 54 ? "right" : "center";
            const x = side === "left" ? spot.cx - spot.rx - 1.2 : side === "right" ? spot.cx + spot.rx + 1.2 : spot.cx;
            const y = side === "center" ? spot.cy + spot.ry + 3.2 : spot.cy + 1;
            return (
              <text
                key={callout.regionId}
                x={x}
                y={y}
                textAnchor={side === "left" ? "end" : side === "right" ? "start" : "middle"}
                fill="var(--color-canvas)"
                fontSize="3.1"
                fontFamily="Source Sans 3, Segoe UI, sans-serif"
                style={{ paintOrder: "stroke" }}
                stroke="var(--color-stage)"
                strokeWidth="0.6"
              >
                {callout.text}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

function fillFor(
  id: string,
  layer: BodyLayer,
  counts: Record<string, number>,
  planned: Record<string, "primary" | "secondary">,
  felt: string[],
): string {
  if (layer === "completed") return HEAT[heatBand(counts[id] ?? 0)];
  if (layer === "felt") return felt.includes(id) ? "var(--color-copper)" : "transparent";
  if (planned[id] === "primary") return "var(--color-heat-3)";
  if (planned[id] === "secondary") return "var(--color-heat-1)";
  return "transparent";
}

function isActive(
  id: string,
  layer: BodyLayer,
  counts: Record<string, number>,
  planned: Record<string, "primary" | "secondary">,
  felt: string[],
): boolean {
  if (layer === "completed") return (counts[id] ?? 0) > 0;
  if (layer === "felt") return felt.includes(id);
  return Boolean(planned[id]);
}

export function LayerSwitch({
  value,
  onChange,
}: {
  value: BodyLayer;
  onChange: (layer: BodyLayer) => void;
}) {
  const options: { id: BodyLayer; label: string }[] = [
    { id: "planned", label: "Planned" },
    { id: "completed", label: "Completed" },
    { id: "felt", label: "How I felt" },
  ];
  return (
    <div className="grid grid-cols-3 gap-2" role="group" aria-label="Body layer">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          aria-pressed={value === option.id}
          onClick={() => onChange(option.id)}
          className={cn(
            "min-h-11 rounded-xl border px-2 text-base",
            value === option.id ? "border-forest bg-forest text-canvas" : "border-line bg-surface text-ink",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
