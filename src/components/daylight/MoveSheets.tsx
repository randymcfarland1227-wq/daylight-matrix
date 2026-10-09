import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { exercises, exerciseById } from "@/lib/daylight/exercises";
import { findExerciseByName } from "@/lib/daylight/form";
import { exerciseLabel } from "@/lib/daylight/names";
import { activePlan, dayTemplate } from "@/lib/daylight/plan";
import { useDaylight } from "@/lib/daylight/store";
import { localDate } from "@/lib/daylight/dates";
import { Button, Chip, Eyebrow, Sheet, Stepper, haptic } from "./ui";
import { MusclePicker } from "./MusclePicker";
import { MoveThumb } from "./MoveArt";

function num(v: string): number | null {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : null;
}

function useSlot(weekday: number, slotId: string | null) {
  const state = useDaylight();
  const today = localDate();
  const session = state.sessions.find((s) => s.localDate === today && s.weekday === weekday) ?? null;
  const plan = activePlan(state.planVersions, today);
  const slot = slotId ? (session?.snapshot ?? dayTemplate(plan, weekday).slots).find((s) => s.id === slotId) ?? null : null;
  return { slot, state };
}

/** Swap a planned move for a catalog move, or for anything you type. */
export function SwapMoveSheet({ weekday, slotId, onClose }: { weekday: number; slotId: string; onClose: () => void }) {
  const { slot, state } = useSlot(weekday, slotId);
  const [q, setQ] = useState("");
  const [custom, setCustom] = useState("");
  const [muscles, setMuscles] = useState<string[]>([]);
  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return exercises.filter((e) => !t || e.name.toLowerCase().includes(t) || (e.equipment ?? "").toLowerCase().includes(t)).slice(0, 40);
  }, [q]);
  const allowed = slot ? [slot.exerciseId, ...slot.alternatives.map((a) => a.exerciseId)] : [];
  const pick = (id: string) => {
    if (!slot) return;
    // A catalog pick replaces the move for this session with the same dose and logging, so sets log as usual.
    state.chooseVariant(weekday, slot.id, id);
    haptic(16);
    state.showToast(`Swapped to ${exerciseLabel(id)}`);
    state.setOverlay(null);
  };
  const saveCustom = () => {
    if (!slot || !custom.trim()) return;
    const id = state.addExtra(weekday, { slotId: slot.id, kind: "swap", name: custom, exerciseId: findExerciseByName(custom) ?? undefined, sets: slot.sets, reps: slot.repLabel, muscles });
    if (id) {
      state.showToast("Logged your swap");
      haptic(16);
    }
  };
  return (
    <Sheet title="Swap move" onClose={onClose} tall>
      {slot ? <p className="text-sm text-ink-soft">Replacing <b className="text-ink">{exerciseLabel(slot.exerciseId)}</b>. Pick a move from the library to log it in this slot, or type your own below.</p> : null}
      {allowed.length > 1 ? (
        <div className="mt-3">
          <Eyebrow>The plan’s own options</Eyebrow>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {allowed.map((id) => (
              <Chip key={id} tone="sun" onClick={() => pick(id)}>
                {exerciseLabel(id)}
              </Chip>
            ))}
          </div>
        </div>
      ) : null}
      <div className="relative mt-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint" />
        <input className="field pl-9" placeholder="Search the move library" aria-label="Search moves" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <ul className="mt-2 max-h-[34dvh] space-y-1.5 overflow-y-auto" data-testid="swap-list">
        {list.map((e) => (
          <li key={e.id}>
            <button type="button" onClick={() => pick(e.id)} className="tap flex w-full items-center gap-3 rounded-xl border border-line px-3 py-2 text-left hover:bg-surface-2">
              <MoveThumb exerciseId={e.id} size={44} />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">{e.name}</span>
                <span className="block truncate text-xs text-ink-soft">{e.equipment ?? "Bodyweight"}{e.extra ? " · not in your PDF" : ""}</span>
              </span>
            </button>
          </li>
        ))}
        {list.length === 0 ? <li className="px-1 text-sm text-ink-soft">No match. Type it below instead.</li> : null}
      </ul>
      <div className="mt-5 rounded-lg border border-line p-3">
        <Eyebrow>Or type your own move</Eyebrow>
        <input className="field mt-1.5" placeholder="e.g. Smith machine incline press" aria-label="Custom move name" value={custom} onChange={(e) => setCustom(e.target.value)} />
        <p className="mt-2 text-xs font-bold uppercase tracking-wider text-ink-soft">Muscles it hit (optional, counts on the heat map)</p>
        <div className="mt-1.5">
          <MusclePicker value={muscles} onChange={setMuscles} />
        </div>
        {custom.trim() && !muscles.length && findExerciseByName(custom) ? <p className="mt-2 text-xs text-ink-soft">Looks like <b>{exerciseById(findExerciseByName(custom)!)?.name}</b>, so its muscle mapping is used unless you choose muscles.</p> : null}
        <Button className="mt-3 w-full" tone="sun" disabled={!custom.trim()} onClick={saveCustom}>
          Log my own move in this slot
        </Button>
      </div>
    </Sheet>
  );
}

/** Free-form "I did something else" for any slot, cardio and abs included, or for the whole day. */
export function DidElseSheet({ weekday, slotId, onClose }: { weekday: number; slotId: string | null; onClose: () => void }) {
  const { slot, state } = useSlot(weekday, slotId);
  const kind = slot ? exerciseById(slot.exerciseId)?.kind : null;
  const cardioLike = kind === "cardio" || kind === "mobility";
  const [name, setName] = useState("");
  const [minutes, setMinutes] = useState("");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [load, setLoad] = useState("");
  const [note, setNote] = useState("");
  const [muscles, setMuscles] = useState<string[]>([]);
  const guess = name.trim() ? findExerciseByName(name) : null;
  const effectiveMuscles = muscles.length ? "chosen" : guess ? "inferred" : "none";
  const save = () => {
    const id = state.addExtra(weekday, {
      slotId,
      kind: "other",
      name,
      exerciseId: guess ?? undefined,
      sets: num(sets),
      reps: reps || null,
      load: num(load),
      minutes: num(minutes),
      note,
      muscles,
    });
    if (id) {
      haptic(16);
      state.showToast("Logged what you did");
    }
  };
  return (
    <Sheet title="I did something else" onClose={onClose} tall>
      <p className="text-sm text-ink-soft">
        {slot ? <>In place of <b className="text-ink">{exerciseLabel(slot.exerciseId)}</b>. </> : "Not tied to a slot. "}
        Describe it in your own words. If you choose the muscles, it counts on the heat map and goes in your notes digest.
      </p>
      <label className="mt-3 block">
        <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-soft">What did you do?</span>
        <input className="field" aria-label="What did you do" autoFocus placeholder={cardioLike ? "e.g. 20 min stair climber" : "e.g. Machine row, different flow, abs circuit"} value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Stepper label="Minutes" value={minutes} onChange={setMinutes} step={5} />
        <Stepper label="Sets" value={sets} onChange={setSets} />
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-soft">Reps / hold</span>
          <input className="field" aria-label="Reps" placeholder="e.g. 12 or 30 sec" value={reps} onChange={(e) => setReps(e.target.value)} />
        </label>
        <Stepper label="Load" unit={state.units} value={load} onChange={setLoad} step={state.units === "kg" ? 2.5 : 5} inputMode="decimal" />
      </div>
      <p className="mt-4 text-xs font-bold uppercase tracking-wider text-ink-soft">Muscles it hit (optional)</p>
      <div className="mt-1.5">
        <MusclePicker value={muscles} onChange={setMuscles} />
      </div>
      <p className="mt-2 text-xs text-ink-soft" data-testid="extra-count-note">
        {effectiveMuscles === "chosen" ? "Will count toward the muscles you picked." : effectiveMuscles === "inferred" ? `No muscles picked, so it will count like ${exerciseById(guess!)?.name} (matched from your text).` : "No muscles picked and no match in the library, so it is logged but not counted on the heat map."}
      </p>
      <label className="mt-3 block">
        <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-soft">Notes</span>
        <textarea className="field min-h-20" aria-label="Notes" placeholder="Why, how it felt, anything for the next plan" value={note} onChange={(e) => setNote(e.target.value)} />
      </label>
      <div className="sticky bottom-0 -mx-5 mt-4 bg-canvas px-5 pb-1 pt-2">
        <Button size="lg" className="w-full" disabled={!name.trim()} onClick={save}>
          Save
        </Button>
      </div>
    </Sheet>
  );
}
