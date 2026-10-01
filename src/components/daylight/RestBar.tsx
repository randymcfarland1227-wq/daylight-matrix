import { useEffect, useRef } from "react";
import { Timer, X } from "lucide-react";
import { useDaylight } from "@/lib/daylight/store";
import { formatSeconds } from "@/lib/daylight/logic";
import { haptic, useNow } from "./ui";

export function RestBar() {
  const rest = useDaylight((s) => s.rest);
  const startRest = useDaylight((s) => s.startRest);
  const clear = useDaylight((s) => s.clearRest);
  const view = useDaylight((s) => s.view);
  const now = useNow(250, Boolean(rest));
  const buzzed = useRef<number | null>(null);
  const left = rest ? Math.ceil((rest.endsAt - now) / 1000) : 0;
  useEffect(() => {
    if (rest && left <= 0 && buzzed.current !== rest.endsAt) {
      buzzed.current = rest.endsAt;
      haptic(220);
    }
  }, [rest, left]);
  if (!rest || view === "settings") return null;
  const done = left <= 0;
  const pct = Math.max(0, Math.min(1, 1 - left / rest.total));
  return (
    <div className="animate-pop fixed inset-x-3 bottom-[calc(5.4rem+env(safe-area-inset-bottom))] z-30 mx-auto max-w-sm overflow-hidden rounded-2xl bg-ink text-canvas shadow-xl md:inset-x-auto md:bottom-6 md:right-6 md:mx-0 md:w-80" role="timer" aria-label="Rest timer">
      <div className="h-1 bg-canvas/20">
        <div className="h-full bg-sun transition-[width] duration-300" style={{ width: `${pct * 100}%` }} />
      </div>
      <div className="flex items-center gap-3 px-3 py-2">
        <Timer className="size-5 shrink-0 text-sun" />
        <div className="min-w-0 flex-1">
          <p className="text-[0.65rem] font-bold uppercase tracking-widest text-canvas/60">{done ? "Rest done" : "Rest"}</p>
          <p className="font-display text-2xl leading-none tabular-nums">{done ? "Go lift" : formatSeconds(left)}</p>
        </div>
        <button type="button" className="tap rounded-full bg-canvas/15 px-3 py-1.5 text-sm font-bold" onClick={() => startRest(Math.max(15, left + 15))}>
          +15s
        </button>
        <button type="button" aria-label="Dismiss rest timer" className="tap grid size-9 place-items-center rounded-full bg-canvas/15" onClick={() => clear()}>
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
