import { Repeat2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { slotOptions } from "@/lib/daylight/logic";
import { exerciseLabel } from "@/lib/daylight/names";
import { useDaylight } from "@/lib/daylight/store";
import type { Prescription } from "@/lib/daylight/types";
import { haptic } from "./ui";

/**
 * The plan's "this or that" switch: one "Swap to …" button per other option. The pick applies to today's session
 * (sets log under the move actually done) and is remembered for this slot next time. Neutral styling: no gold, so
 * it is safe inside session mode.
 */
export function VariantSwitch({ weekday, slot, current, className, label = true, tone = "light" }: { weekday: number; slot: Prescription; current: string; className?: string; label?: boolean; tone?: "light" | "session" }) {
  const pickOption = useDaylight((s) => s.pickOption);
  const showToast = useDaylight((s) => s.showToast);
  const options = slotOptions(slot);
  if (options.length < 2) return null;
  const others = options.filter((id) => id !== current);
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)} data-testid="variant-switch" data-current={current}>
      {label ? <span className={cn("text-xs font-semibold", tone === "session" ? "text-fog" : "text-ink-soft")}>Plan option{others.length > 1 ? "s" : ""}:</span> : null}
      {others.map((id) => (
        <button
          key={id}
          type="button"
          className={cn("tap inline-flex min-h-10 items-center gap-1.5 rounded-[6px] border px-3 text-sm font-semibold", tone === "session" ? "border-white/25 bg-raised text-white hover:bg-white/10" : "border-line bg-surface text-ink hover:bg-surface-2")}
          onClick={(e) => { e.stopPropagation(); pickOption(weekday, slot, id); haptic(12); showToast(`Swapped to ${exerciseLabel(id)}`); }}
          data-testid="variant-swap"
          data-option={id}
        >
          <Repeat2 className="size-4 shrink-0" aria-hidden />
          Swap to {exerciseLabel(id)}
        </button>
      ))}
    </div>
  );
}
