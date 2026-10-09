import { useEffect, useRef, useState } from "react";
import { Check, Copy, Flag, Mic } from "lucide-react";
import { WEEKDAY_NAMES, clock, localDate, localTime } from "@/lib/daylight/dates";
import { estimateProtein, chosenExerciseId, setSummary } from "@/lib/daylight/logic";
import { exerciseLabel } from "@/lib/daylight/names";
import { activePlan, dayTemplate } from "@/lib/daylight/plan";
import { useDaylight } from "@/lib/daylight/store";
import { GYM_TAGS, STARTER_PURPOSE } from "@/lib/daylight/types";
import { muscleName } from "@/lib/daylight/muscles";
import { exercises } from "@/lib/daylight/exercises";
import { DAY_STYLE } from "@/lib/daylight/theme";
import { Button, Chip, Sheet, cn, haptic } from "./ui";
import { ExercisePage } from "./ExercisePage";
import { DidElseSheet, SwapMoveSheet } from "./MoveSheets";
import { MapFigure } from "./MapFigure";
import { FIG_SKIN } from "@/lib/daylight/figureColors";
import { MusclePicker } from "./MusclePicker";

export function Overlays() {
  const overlay = useDaylight((s) => s.overlay);
  const setOverlay = useDaylight((s) => s.setOverlay);
  if (!overlay) return null;
  const close = () => setOverlay(null);
  switch (overlay.type) {
    case "note":
      return <NoteSheet key={JSON.stringify(overlay)} init={overlay} onClose={close} />;
    case "log-food":
      return <LogFood slot={overlay.slot} onClose={close} />;
    case "log-drink":
      return <LogDrink onClose={close} />;
    case "repeat-meal":
      return <RepeatMeal mealId={overlay.mealId} onClose={close} />;
    case "finish":
      return <Finish weekday={overlay.weekday} onClose={close} />;
    case "form":
      return <ExercisePage key={overlay.exerciseId} exerciseId={overlay.exerciseId} muscle={overlay.muscle} onClose={close} />;
    case "swap-move":
      return <SwapMoveSheet weekday={overlay.weekday} slotId={overlay.slotId} onClose={close} />;
    case "did-else":
      return <DidElseSheet weekday={overlay.weekday} slotId={overlay.slotId} onClose={close} />;
    case "move":
      return <AddMove exerciseId={overlay.exerciseId} onClose={close} />;
    case "trial":
      return <TrialForm observationId={overlay.observationId} onClose={close} />;
    case "apply":
      return <ApplyForm trialId={overlay.trialId} onClose={close} />;
    case "activity":
      return <ActivityForm onClose={close} />;
    case "goal":
      return <GoalForm onClose={close} />;
    case "purpose":
      return <Purpose onClose={close} />;
    default:
      return null;
  }
}

/* ------------------------------------------------------------ Quick note (the one-handed gym log) */

type NoteInit = Extract<NonNullable<ReturnType<typeof useDaylight.getState>["overlay"]>, { type: "note" }>;

function NoteSheet({ init, onClose }: { init: NoteInit; onClose: () => void }) {
  const state = useDaylight();
  const [text, setText] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [flag, setFlag] = useState(Boolean(init.forNextPlan));
  const kind = init.kind ?? (init.exerciseId || init.weekday != null ? "gym" : "general");
  const quickTags = kind === "gym" ? GYM_TAGS : kind === "food" ? ["Easy to make", "Too much prep", "Enjoyed this", "Remember next time"] : ["Felt good", "Felt difficult", "Remember next time"];
  const [exerciseId, setExerciseId] = useState<string | undefined>(init.exerciseId);
  const [muscleId, setMuscleId] = useState<string | undefined>(init.muscleId);
  const [showLink, setShowLink] = useState(Boolean(init.exerciseId));
  const ref = useRef<HTMLTextAreaElement>(null);
  const weekday = init.weekday ?? new Date().getDay();
  const plan = activePlan(state.planVersions, localDate());
  const todays = dayTemplate(plan, weekday)
    .slots.map((s) => chosenExerciseId(s, {}))
    .filter((id, i, a) => a.indexOf(id) === i);
  const todaysIds = [...new Set([...(exerciseId ? [exerciseId] : []), ...todays])];

  useEffect(() => {
    const t = setTimeout(() => ref.current?.focus(), 250);
    return () => clearTimeout(t);
  }, []);

  const toggle = (t: string) => setTags((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));
  const canSave = text.trim().length > 0 || tags.length > 0;
  const save = () => {
    const id = state.addNote({
      text,
      tags,
      forNextPlan: flag || tags.includes("Swap this") || tags.includes("Add volume") || tags.includes("Go up next time"),
      kind,
      context: { exerciseId, muscleId, weekday, mealId: init.mealId },
    });
    if (id) {
      haptic(16);
      state.showToast("Note saved");
      onClose();
    }
  };
  const speech = typeof window !== "undefined" && ((window as unknown as Record<string, unknown>).SpeechRecognition || (window as unknown as Record<string, unknown>).webkitSpeechRecognition);
  const dictate = () => {
    const Ctor = ((window as unknown as Record<string, unknown>).SpeechRecognition || (window as unknown as Record<string, unknown>).webkitSpeechRecognition) as (new () => { lang: string; onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void; start: () => void }) | undefined;
    if (!Ctor) return;
    const r = new Ctor();
    r.lang = "en-US";
    r.onresult = (e) => setText((t) => `${t ? `${t} ` : ""}${e.results[0]?.[0]?.transcript ?? ""}`.trim());
    r.start();
  };

  return (
    <Sheet title="Add observation" onClose={onClose}>
      <div className="flex flex-wrap items-center gap-2 text-sm text-ink-soft">
        <span>
          {WEEKDAY_NAMES[weekday]} · {clock(localTime())}
        </span>
        {exerciseId ? <Chip active onClick={() => setExerciseId(undefined)}>{exerciseLabel(exerciseId)} ✕</Chip> : null}
        {muscleId ? <Chip active tone="teal" onClick={() => setMuscleId(undefined)}>{muscleName(muscleId)} ✕</Chip> : null}
      </div>
      <div className="no-scrollbar -mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-1" aria-label="Quick tags">
        {quickTags.map((t) => (
          <Chip key={t} active={tags.includes(t)} onClick={() => toggle(t)} tone="sun">
            {t}
          </Chip>
        ))}
      </div>
      <div className="relative mt-3">
        <textarea
          ref={ref}
          value={text}
          onChange={(e) => setText(e.target.value)}
          aria-label="What did you notice?"
          placeholder={kind === "gym" ? "What felt different? Any setup or form detail to remember?" : "What happened? What made today easier or harder?"}
          className="field min-h-28 py-3 pr-12"
        />
        {speech ? (
          <button type="button" aria-label="Dictate" onClick={dictate} className="tap absolute right-2 top-2 grid size-9 place-items-center rounded-full bg-surface-2">
            <Mic className="size-4" />
          </button>
        ) : null}
      </div>

      <button
        type="button"
        aria-pressed={flag}
        onClick={() => setFlag((v) => !v)}
        className={cn("tap mt-3 flex min-h-12 w-full items-center gap-3 rounded-lg border px-3 text-left font-bold", flag ? "border-warn bg-warn/15 text-warn" : "border-line bg-surface")}
      >
        <Flag className="size-5" fill={flag ? "currentColor" : "none"} />
        <span className="flex-1">For the next plan</span>
        <span className={cn("grid size-6 place-items-center rounded-full border", flag ? "border-warn bg-warn text-white" : "border-line")}>{flag ? <Check className="size-4" strokeWidth={3} /> : null}</span>
      </button>

      <button type="button" className="tap mt-3 text-sm font-bold text-accent underline underline-offset-4" onClick={() => setShowLink((v) => !v)}>
        {showLink ? "Hide links" : "Link to a move or muscle"}
      </button>
      {showLink ? (
        <div className="animate-rise mt-2 space-y-3">
          <div>
            <p className="eyebrow mb-1">Move</p>
            <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
              {todaysIds.map((id) => (
                <Chip key={id} active={exerciseId === id} onClick={() => setExerciseId(exerciseId === id ? undefined : id)}>
                  {exerciseLabel(id)}
                </Chip>
              ))}
            </div>
            <select className="field mt-2" value={exerciseId ?? ""} onChange={(e) => setExerciseId(e.target.value || undefined)} aria-label="Any move">
              <option value="">Any move…</option>
              {exercises
                .slice()
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <p className="eyebrow mb-1">Muscle</p>
            <div className="figure-panel mb-2 grid grid-cols-2 gap-1 rounded-lg p-2" data-testid="note-figure">
              {(["front", "back"] as const).map((v) => (
                <MapFigure key={v} view={v} level="region" className="mx-auto h-auto w-full max-w-[150px]" fill={(id) => (muscleId === id ? "#4aa3d8" : FIG_SKIN)} selected={muscleId} onSelect={(id) => setMuscleId(id)} />
              ))}
              <p className="col-span-2 text-center text-xs" style={{ color: "var(--fig-ink)" }}>{muscleId ? `Attached to ${muscleName(muscleId)}` : "Tap the figure to attach this note to a muscle"}</p>
            </div>
            <MusclePicker multi={false} value={muscleId ? [muscleId] : []} onChange={(v) => setMuscleId(v[v.length - 1])} />
          </div>
        </div>
      ) : null}

      <div className="sticky bottom-0 -mx-5 mt-4 bg-canvas px-5 pb-1 pt-2">
        <Button size="lg" className="w-full" onClick={save} disabled={!canSave}>
          Save note
        </Button>
      </div>
    </Sheet>
  );
}

/* ------------------------------------------------------------ Finish session summary */

function Finish({ weekday, onClose }: { weekday: number; onClose: () => void }) {
  const state = useDaylight();
  const today = localDate();
  const session = state.sessions.find((s) => s.localDate === today && s.weekday === weekday);
  const [note, setNote] = useState(session?.note ?? "");
  if (!session) {
    return (
      <Sheet title="Nothing logged yet" onClose={onClose}>
        <p className="text-ink-soft">Log a set first, then finish. Nothing is saved for a day you haven’t trained.</p>
        <Button className="mt-4 w-full" onClick={onClose}>Back to the session</Button>
      </Sheet>
    );
  }
  const done = session.logs.filter((l) => l.status === "done");
  const start = new Date(session.startedAt).getTime();
  const last = done.length ? new Date(done[done.length - 1]!.at).getTime() : Date.now();
  const mins = Math.max(1, Math.round((last - start) / 60000));
  let volume = 0;
  for (const l of done) if (l.load != null && l.reps != null) volume += l.load * l.reps;
  const moves = session.snapshot.map((slot) => {
    const id = chosenExerciseId(slot, session.chosenExercise);
    const logs = done.filter((l) => l.prescriptionId === slot.id);
    return { slot, id, logs };
  });
  const finishedAlready = session.status === "finished";
  const notes = state.observations.filter((o) => o.context.sessionId === session.id || (o.context.date === session.localDate && o.context.weekday === weekday));
  return (
    <Sheet title={finishedAlready ? "Session summary" : "Finish session"} onClose={onClose} tall>
      <div className="grid grid-cols-3 gap-2 text-center">
        <Stat label="Sets" value={String(done.length)} />
        <Stat label="Minutes" value={String(mins)} />
        <Stat label="Volume" value={volume ? `${Math.round(volume).toLocaleString()}` : "–"} sub={volume ? state.units : undefined} />
      </div>
      <ul className="mt-4 space-y-1.5">
        {moves.map(({ slot, id, logs }) => (
          <li key={slot.id} className={cn("rounded-xl border px-3 py-2", logs.length ? "border-accent/40 bg-accent/5" : "border-line")}>
            <div className="flex items-center gap-2">
              {logs.length ? <Check className="size-4 text-accent" strokeWidth={3} /> : <span className="size-4 rounded-full border border-line" />}
              <p className="flex-1 font-semibold">{exerciseLabel(id)}</p>
              <p className="text-xs text-ink-soft">
                {logs.length}
                {slot.sets ? ` / ${slot.sets}` : ""}
              </p>
            </div>
            {logs.length ? <p className="mt-0.5 pl-6 text-xs tabular-nums text-ink-soft">{logs.map(setSummary).join("  ·  ")}</p> : null}
          </li>
        ))}
      </ul>
      {notes.length ? (
        <div className="mt-4">
          <p className="eyebrow">Notes from today ({notes.length})</p>
          <ul className="mt-1 space-y-1 text-sm">
            {notes.map((n) => (
              <li key={n.id} className="rounded-xl bg-info/10 px-3 py-1.5">
                {n.text}
                {n.forNextPlan ? <span className="ml-1 text-warn">★</span> : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <label className="mt-4 block">
        <span className="eyebrow">How did it feel? (optional)</span>
        <textarea className="field mt-1 min-h-20 py-2" value={note} onChange={(e) => setNote(e.target.value)} />
      </label>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button tone="soft" onClick={() => state.setOverlay({ type: "note", weekday, kind: "gym" })}>
          Add a note
        </Button>
        <Button
          tone="sun"
          onClick={() => {
            state.finishSession(note, weekday);
            state.showToast("Session saved");
            state.setView("today");
          }}
        >
          {finishedAlready ? "Save" : "Finish"}
        </Button>
      </div>
      <p className="mt-3 text-center text-xs text-ink-faint">No score, no grade. Logged work stays; anything not done stays not done.</p>
    </Sheet>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg bg-surface-2 p-3">
      <p className="t-display tabular-nums leading-none">{value}</p>
      <p className="mt-1 text-xs font-bold uppercase tracking-wider text-ink-soft">
        {label}
        {sub ? ` (${sub})` : ""}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------ Add a move to a day */

function AddMove({ exerciseId, onClose }: { exerciseId: string; onClose: () => void }) {
  const state = useDaylight();
  const [day, setDay] = useState(state.editorWeekday || 1);
  const [sets, setSets] = useState("3");
  const [reps, setReps] = useState("10–12");
  return (
    <Sheet title={`Add ${exerciseLabel(exerciseId)}`} onClose={onClose}>
      <p className="text-sm text-ink-soft">This goes into a plan draft. Nothing changes until you save a new plan version.</p>
      <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
        {[1, 2, 3, 4, 5, 6, 0].map((d) => (
          <Chip key={d} active={day === d} onClick={() => setDay(d)}>
            {DAY_STYLE[d]!.short}
          </Chip>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <label>
          <span className="eyebrow">Sets</span>
          <input className="field mt-1" inputMode="numeric" value={sets} onChange={(e) => setSets(e.target.value)} />
        </label>
        <label>
          <span className="eyebrow">Reps</span>
          <input className="field mt-1" value={reps} onChange={(e) => setReps(e.target.value)} />
        </label>
      </div>
      <Button
        className="mt-4 w-full"
        onClick={() => {
          state.addExerciseToDraft(day, exerciseId, Number(sets) || 3, reps);
          state.setEditorWeekday(day);
          state.showToast("Added to your plan draft");
          onClose();
          state.setTrainingTab("plan");
        }}
      >
        Add to draft
      </Button>
    </Sheet>
  );
}

/* ------------------------------------------------------------ Food sheets */

function LogFood({ slot, onClose }: { slot?: "breakfast" | "lunch" | "dinner" | "snack"; onClose: () => void }) {
  const drafts = useDaylight((s) => s.drafts);
  const patch = useDaylight((s) => s.patchDraft);
  const logFood = useDaylight((s) => s.logFood);
  const meals = useDaylight((s) => s.savedMeals);
  const estimate = estimateProtein(drafts.food);
  const [which, setWhich] = useState<typeof slot>(slot ?? mealSlotNow());
  const recent = useDaylight((s) => s.foodLogs);
  const quick = [...new Set(recent.slice().reverse().map((l) => l.food))].slice(0, 6);
  return (
    <Sheet title="Log food" onClose={onClose}>
      <div className="flex gap-2">
        {(["breakfast", "lunch", "dinner", "snack"] as const).map((s) => (
          <Chip key={s} active={which === s} onClick={() => setWhich(s)} className="capitalize">
            {s}
          </Chip>
        ))}
      </div>
      <div className="no-scrollbar -mx-5 mt-3 flex gap-2 overflow-x-auto px-5">
        {meals.slice(0, 8).map((m) => (
          <Chip key={m.id} onClick={() => logFood({ food: m.name, mealId: m.id, protein: m.proteinGrams ?? null, estimate: false, slot: which })}>
            + {m.name}
          </Chip>
        ))}
      </div>
      <label className="mt-3 block">
        <span className="eyebrow">What did you eat?</span>
        <textarea className="field mt-1 min-h-24 py-2" value={drafts.food} onChange={(e) => patch({ food: e.target.value })} placeholder="2 eggs, greek yogurt cup, bagel…" />
      </label>
      {quick.length ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {quick.map((q) => (
            <Chip key={q} onClick={() => patch({ food: q })}>
              ↺ {q.length > 28 ? `${q.slice(0, 26)}…` : q}
            </Chip>
          ))}
        </div>
      ) : null}
      {estimate.items.length ? (
        <p className="mt-2 text-sm text-ink-soft">
          Rough estimate you can edit: <b>{estimate.total} g</b> ({estimate.items.map((i) => i.label).join(", ")}). General figures, not a measurement.
        </p>
      ) : null}
      <label className="mt-3 block">
        <span className="eyebrow">Protein grams (optional)</span>
        <input inputMode="numeric" className="field mt-1 tabular-nums" value={drafts.foodProtein} onChange={(e) => patch({ foodProtein: e.target.value, foodEstimate: false })} />
      </label>
      <Button
        size="lg"
        className="mt-4 w-full"
        onClick={() => {
          const typed = drafts.foodProtein.trim();
          const protein = typed ? Number(typed) : estimate.items.length ? estimate.total : null;
          logFood({ food: drafts.food, mealId: null, protein: protein != null && Number.isFinite(protein) ? protein : null, estimate: !typed && estimate.items.length > 0, slot: which });
          haptic(14);
        }}
        disabled={!drafts.food.trim()}
      >
        Log as eaten · {clock(localTime())}
      </Button>
    </Sheet>
  );
}

export function mealSlotNow(): "breakfast" | "lunch" | "dinner" | "snack" {
  const h = new Date().getHours();
  return h < 10 ? "breakfast" : h < 14 ? "lunch" : h < 17 ? "snack" : "dinner";
}

function LogDrink({ onClose }: { onClose: () => void }) {
  const drafts = useDaylight((s) => s.drafts);
  const sizes = useDaylight((s) => s.drinkSizes);
  const patch = useDaylight((s) => s.patchDraft);
  const logDrink = useDaylight((s) => s.logDrink);
  const addWater = useDaylight((s) => s.addWater);
  return (
    <Sheet title="Log a drink" onClose={onClose}>
      <div className="grid grid-cols-4 gap-2">
        {[8, 12, 16, 24].map((oz) => (
          <Button key={oz} tone="soft" onClick={() => (addWater(oz), onClose())}>
            {oz} oz
          </Button>
        ))}
      </div>
      <p className="mt-1 text-xs text-ink-soft">One tap logs water.</p>
      {sizes.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {sizes.map((size) => (
            <Chip key={size.id} onClick={() => patch({ drinkName: size.name, drinkOz: String(size.ounces), saveDrinkSize: false })}>
              {size.name} · {size.ounces} oz
            </Chip>
          ))}
        </div>
      ) : null}
      <div className="mt-4 grid grid-cols-[1fr_6rem] gap-3">
        <label>
          <span className="eyebrow">Other drink</span>
          <input className="field mt-1" value={drafts.drinkName} onChange={(e) => patch({ drinkName: e.target.value })} />
        </label>
        <label>
          <span className="eyebrow">Ounces</span>
          <input inputMode="decimal" className="field mt-1 tabular-nums" value={drafts.drinkOz} onChange={(e) => patch({ drinkOz: e.target.value })} />
        </label>
      </div>
      <label className="mt-2 flex min-h-11 items-center gap-2 text-sm">
        <input type="checkbox" checked={drafts.saveDrinkSize} onChange={(e) => patch({ saveDrinkSize: e.target.checked })} className="size-5 accent-[var(--accent)]" />
        Save this size as a button
      </label>
      <Button className="mt-2 w-full" onClick={() => logDrink()}>
        Log drink
      </Button>
    </Sheet>
  );
}

function RepeatMeal({ mealId, onClose }: { mealId: string; onClose: () => void }) {
  const meal = useDaylight((s) => s.savedMeals.find((item) => item.id === mealId));
  const logFood = useDaylight((s) => s.logFood);
  const [which, setWhich] = useState(mealSlotNow());
  if (!meal) return null;
  return (
    <Sheet title={meal.name} onClose={onClose}>
      <p className="text-ink-soft">
        {meal.minutes != null ? `${meal.minutes} min. ` : ""}
        {meal.proteinGrams != null ? `${meal.proteinGrams} g protein (your number). ` : "No protein number saved for this meal. "}
        Logs it as eaten at {clock(localTime())}.
      </p>
      <div className="mt-3 flex gap-2">
        {(["breakfast", "lunch", "dinner", "snack"] as const).map((s) => (
          <Chip key={s} active={which === s} onClick={() => setWhich(s)} className="capitalize">
            {s}
          </Chip>
        ))}
      </div>
      <Button size="lg" className="mt-4 w-full" onClick={() => logFood({ food: meal.name, mealId: meal.id, protein: meal.proteinGrams ?? null, estimate: false, slot: which })}>
        Log as eaten
      </Button>
    </Sheet>
  );
}

/* ------------------------------------------------------------ Existing forms (kept) */

function TrialForm({ observationId, onClose }: { observationId: string; onClose: () => void }) {
  const state = useDaylight();
  const observation = state.observations.find((item) => item.id === observationId);
  const active = state.trials.filter((trial) => trial.status === "active");
  const blocked = active.length >= 1 && !state.allowExtraTrial && !active.some((trial) => trial.observationId === observationId && trial.parentTrialId);
  return (
    <Sheet title="Try a change" onClose={onClose}>
      <p className="text-sm">
        <span className="text-ink-soft">From your note: </span>
        {observation?.text}
      </p>
      {blocked ? (
        <div className="mt-3">
          <p>One trial is already active, so this one stays a note unless you mean to add another.</p>
          <Button className="mt-2" tone="outline" onClick={() => state.setAllowExtraTrial(true)}>
            Start another trial
          </Button>
        </div>
      ) : (
        <div className="mt-3 grid gap-3">
          <label>
            <span className="eyebrow">What will I change?</span>
            <textarea className="field mt-1 min-h-20 py-2" value={state.drafts.trialChange} onChange={(e) => state.patchDraft({ trialChange: e.target.value })} />
          </label>
          <label>
            <span className="eyebrow">What would make it helpful?</span>
            <textarea className="field mt-1 min-h-20 py-2" value={state.drafts.trialHelpful} onChange={(e) => state.patchDraft({ trialHelpful: e.target.value })} />
          </label>
          <label>
            <span className="eyebrow">Review date, optional</span>
            <input type="date" className="field mt-1" value={state.drafts.trialDate} onChange={(e) => state.patchDraft({ trialDate: e.target.value })} />
          </label>
          <label>
            <span className="eyebrow">Kind</span>
            <select className="field mt-1" value={state.drafts.trialKind} onChange={(e) => state.patchDraft({ trialKind: e.target.value as "reminder" | "prep" | "plan" })}>
              <option value="reminder">Reminder only</option>
              <option value="prep">Meal prep task</option>
              <option value="plan">Plan version, saved separately</option>
            </select>
          </label>
          <Button onClick={() => state.createTrial(observationId)}>Save trial</Button>
        </div>
      )}
    </Sheet>
  );
}

function ApplyForm({ trialId, onClose }: { trialId: string; onClose: () => void }) {
  const state = useDaylight();
  const trial = state.trials.find((item) => item.id === trialId);
  const task = state.prep.find((item) => item.id === state.drafts.applyPrepId);
  return (
    <Sheet title="Apply change" onClose={onClose}>
      <p className="text-sm text-ink-soft">This shows the exact prep-task title before and after. Other records stay put.</p>
      <label className="mt-3 block">
        <span className="eyebrow">Prep task</span>
        <select className="field mt-1" value={state.drafts.applyPrepId} onChange={(e) => state.patchDraft({ applyPrepId: e.target.value, applyTitle: state.prep.find((i) => i.id === e.target.value)?.title ?? "" })}>
          <option value="">Choose</option>
          {state.prep.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title}
            </option>
          ))}
        </select>
      </label>
      <label className="mt-3 block">
        <span className="eyebrow">New title</span>
        <input className="field mt-1" value={state.drafts.applyTitle} onChange={(e) => state.patchDraft({ applyTitle: e.target.value })} />
      </label>
      {task ? (
        <p className="mt-3 text-sm">
          {task.title} → {state.drafts.applyTitle || "…"}
        </p>
      ) : null}
      <p className="mt-2 text-xs text-ink-soft">Effective {localDate()}. Trial: {trial?.change}</p>
      <Button className="mt-3 w-full" onClick={() => state.applyPrepChange()}>
        Apply change
      </Button>
    </Sheet>
  );
}

function ActivityForm({ onClose }: { onClose: () => void }) {
  const state = useDaylight();
  const f = (k: "activityName" | "activityMinutes" | "activityDistance" | "activityEffort" | "activityNote", label: string, mode?: "numeric") => (
    <label>
      <span className="eyebrow">{label}</span>
      <input inputMode={mode} className="field mt-1" value={state.drafts[k]} onChange={(e) => state.patchDraft({ [k]: e.target.value })} />
    </label>
  );
  return (
    <Sheet title="Log other activity" onClose={onClose}>
      <div className="grid gap-3">
        {f("activityName", "What was it?")}
        {f("activityMinutes", "Minutes", "numeric")}
        {f("activityDistance", "Distance")}
        {f("activityEffort", "Effort")}
        {f("activityNote", "Note")}
        <Button onClick={() => state.logActivity()}>Save activity</Button>
      </div>
    </Sheet>
  );
}

function GoalForm({ onClose }: { onClose: () => void }) {
  const state = useDaylight();
  return (
    <Sheet title="Add a goal" onClose={onClose}>
      <div className="grid gap-3">
        <label>
          <span className="eyebrow">Capability</span>
          <input className="field mt-1" value={state.drafts.goalName} onChange={(e) => state.patchDraft({ goalName: e.target.value })} />
        </label>
        <label>
          <span className="eyebrow">What improvement would look like</span>
          <textarea className="field mt-1 min-h-20 py-2" value={state.drafts.goalImprovement} onChange={(e) => state.patchDraft({ goalImprovement: e.target.value })} />
        </label>
        <label>
          <span className="eyebrow">How you will notice it</span>
          <input className="field mt-1" value={state.drafts.goalCheck} onChange={(e) => state.patchDraft({ goalCheck: e.target.value })} />
        </label>
        <Button onClick={() => state.addGoal()}>Save goal</Button>
      </div>
    </Sheet>
  );
}

function Purpose({ onClose }: { onClose: () => void }) {
  const purpose = useDaylight((s) => s.purpose);
  const proposal = useDaylight((s) => s.purposeIsProposal);
  const adopt = useDaylight((s) => s.adoptPurpose);
  const [text, setText] = useState(proposal ? STARTER_PURPOSE : purpose);
  return (
    <Sheet title="What I’m working toward" onClose={onClose}>
      <p className="text-sm text-ink-soft">Write your own line. It shows on Today.</p>
      <textarea className="field mt-3 min-h-24 py-2" value={text} onChange={(e) => setText(e.target.value)} />
      <Button className="mt-3 w-full" onClick={() => adopt(text)}>
        {proposal ? "Use this" : "Save"}
      </Button>
    </Sheet>
  );
}

export { Copy };
