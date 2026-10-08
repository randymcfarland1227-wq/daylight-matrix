import { exerciseById } from "@/lib/daylight/exercises";
import { muscleName, type MuscleId } from "@/lib/daylight/muscles";
import { useDaylight } from "@/lib/daylight/store";
import { cn } from "./ui";

export function useGoToMuscle() {
  const setBody = useDaylight((s) => s.setBody);
  const setView = useDaylight((s) => s.setView);
  const setOverlay = useDaylight((s) => s.setOverlay);
  return (id: string, mode: "plan" | "heat" | "grow" = "plan") => {
    if (useDaylight.getState().gymMode) return; // gym mode stays focused: no jumping to other screens
    setOverlay(null);
    setBody({ selectedMuscleId: id, bodyMode: mode });
    setView("body");
  };
}

/** Primary muscles solid, secondary outlined. Tap one to open it on the body map. */
export function MuscleChips({ exerciseId, max = 8, small }: { exerciseId: string; max?: number; small?: boolean }) {
  const go = useGoToMuscle();
  const ex = exerciseById(exerciseId);
  const entries = (Object.entries(ex?.muscles ?? {}) as [MuscleId, number][]).sort((a, b) => b[1] - a[1]).slice(0, max);
  if (!entries.length || (ex && ex.kind === "mobility" && !entries.length)) return null;
  return (
    <ul className="flex flex-wrap gap-1" aria-label="Muscles worked">
      {entries.map(([id, w]) => (
        <li key={id}>
          <button
            type="button"
            onClick={() => go(id)}
            title={w >= 1 ? "Primary" : w >= 0.5 ? "Secondary" : "Minor"}
            className={cn(
              "tap rounded-full px-2 py-0.5 font-bold",
              small ? "text-[0.7rem]" : "text-xs",
              w >= 1 ? "bg-accent/15 text-accent" : w >= 0.5 ? "border border-accent/40 text-accent" : "border border-line text-ink-faint",
            )}
          >
            {muscleName(id)}
          </button>
        </li>
      ))}
    </ul>
  );
}
