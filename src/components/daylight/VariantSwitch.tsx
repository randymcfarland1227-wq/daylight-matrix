import { useState } from "react";
import { ChevronDown, Repeat2 } from "lucide-react";
import { backupsOf, eitherOrOf, matchOf } from "@/lib/daylight/backups";
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
  const [open, setOpen] = useState(false);
  const options = slotOptions(slot);
  if (options.length < 2) return null;
  const ranked = backupsOf(slot);
  const plain = eitherOrOf(slot).map((a) => a.exerciseId);
  const btn = cn("tap inline-flex min-h-10 items-center gap-1.5 rounded-[6px] border px-3 text-sm font-semibold", tone === "session" ? "border-white/25 bg-raised text-white hover:bg-white/10" : "border-line bg-surface text-ink hover:bg-surface-2");
  const soft = tone === "session" ? "text-fog" : "text-ink-soft";
  const pick = (id: string) => { pickOption(weekday, slot, id); haptic(12); showToast(`Swapped to ${exerciseLabel(id)}`); setOpen(false); };

  // Plain either/or plans (Fine Shyte 2): one "Swap to ..." button per other option.
  if (!ranked.length) {
    const others = options.filter((id) => id !== current);
    return (
      <div className={cn("flex flex-wrap items-center gap-2", className)} data-testid="variant-switch" data-current={current}>
        {label ? <span className={cn("text-xs font-semibold", soft)}>Plan option{others.length > 1 ? "s" : ""}:</span> : null}
        {others.map((id) => (
          <button key={id} type="button" className={btn} onClick={(e) => { e.stopPropagation(); pick(id); }} data-testid="variant-swap" data-option={id}>
            <Repeat2 className="size-4 shrink-0" aria-hidden />
            Swap to {exerciseLabel(id)}
          </button>
        ))}
      </div>
    );
  }

  // Ranked backups (Fine Shyte 3): one toggle, then the plan move + backups, highest match first.
  const rows: { id: string; match?: number }[] = [{ id: slot.exerciseId }, ...plain.map((id) => ({ id })), ...ranked.map((a) => ({ id: a.exerciseId, match: a.match }))];
  return (
    <div className={cn("space-y-2", className)} data-testid="variant-switch" data-current={current}>
      <button type="button" className={btn} aria-expanded={open} onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }} data-testid="backups-toggle">
        <Repeat2 className="size-4 shrink-0" aria-hidden />
        {current === slot.exerciseId ? `Backups (${ranked.length})` : `Doing a backup · ${matchOf(slot, current) ?? ""}% match`}
        <ChevronDown className={cn("size-4 shrink-0 transition-transform", open && "rotate-180")} aria-hidden />
      </button>
      {open ? (
        <ol className="space-y-1.5" data-testid="backups-list">
          {rows.map((r) => {
            const on = r.id === current;
            return (
              <li key={r.id}>
                <button type="button" disabled={on} className={cn(btn, "w-full justify-between text-left", on && "opacity-60")} onClick={(e) => { e.stopPropagation(); pick(r.id); }} data-testid="variant-swap" data-option={r.id}>
                  <span className="min-w-0 flex-1 truncate">{exerciseLabel(r.id)}</span>
                  {r.match != null ? (
                    <span className="flex shrink-0 items-center gap-1.5" aria-label={`${r.match}% match`}>
                      <span className={cn("h-1.5 w-12 overflow-hidden rounded-full", tone === "session" ? "bg-white/15" : "bg-surface-2")}>
                        <span className="block h-full rounded-full bg-accent" style={{ width: `${r.match}%` }} />
                      </span>
                      <span className="w-9 text-right tabular-nums">{r.match}%</span>
                    </span>
                  ) : (
                    <span className={cn("shrink-0 text-xs", soft)}>{label ? "plan move" : "plan"}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ol>
      ) : null}
    </div>
  );
}
