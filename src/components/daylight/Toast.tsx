import { Check } from "lucide-react";
import { useDaylight } from "@/lib/daylight/store";

export function Toast() {
  const toast = useDaylight((s) => s.toast);
  const undo = useDaylight((s) => s.undo);
  const undoLast = useDaylight((s) => s.undoLast);
  if (!toast) return null;
  return (
    <div key={toast.id} role="status" aria-live="polite" className="animate-pop fixed inset-x-0 bottom-[calc(10.25rem+env(safe-area-inset-bottom))] z-50 mx-auto flex w-fit max-w-[90vw] items-center gap-3 rounded-full bg-ink px-4 py-2.5 text-sm font-bold text-canvas shadow-xl md:bottom-8">
      <Check className="size-4 text-sun" strokeWidth={3} />
      {toast.text}
      {undo ? (
        <button type="button" onClick={() => undoLast()} className="rounded-full bg-canvas/15 px-2.5 py-0.5 text-xs underline-offset-2 hover:underline">
          Undo
        </button>
      ) : null}
    </div>
  );
}
