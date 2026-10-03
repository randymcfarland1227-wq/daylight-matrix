import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Flag, ListChecks, Pause, Pencil, Play, PlayCircle, Repeat, Shuffle, SkipForward, Timer, X } from "lucide-react";
import { WEEKDAY_NAMES, localDate } from "@/lib/daylight/dates";
import { exerciseById } from "@/lib/daylight/exercises";
import { exerciseLabel } from "@/lib/daylight/names";
import { activePlan, dayTemplate } from "@/lib/daylight/plan";
import { chosenExerciseId, doneSetCount, formatSeconds, lastSet, prescribedDefaults, slotFinished, slotLogs, targetLine } from "@/lib/daylight/logic";
import { useDaylight } from "@/lib/daylight/store";
import { DAY_STYLE } from "@/lib/daylight/theme";
import type { Prescription, WorkoutSession } from "@/lib/daylight/types";
import { plannedSets } from "@/lib/daylight/volume";
import { MoveThumb } from "./MoveArt";
import { MoveMedia, prefetchPhotos } from "./MoveMedia";
import { Overlays } from "./Overlays";
import { Toast } from "./Toast";
import { Badge, Button, Eyebrow, Stepper, cn, haptic, useNow } from "./ui";

type Step = { key: string; type: "pt" | "move" | "end"; slot?: Prescription; slots?: Prescription[] };

const num = (v: string): number | null => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : null;
};

function firstNum(s: string | undefined): number | null {
  const m = (s ?? "").match(/\d+(?:\.\d+)?/);
  return m ? parseFloat(m[0]) : null;
}

/* ---------------------------------------------------------------- top level */

export function GymMode({ weekday }: { weekday: number }) {
  const state = useDaylight();
  const today = localDate();
  const plan = activePlan(state.planVersions, today);
  const day = dayTemplate(plan, weekday);
  const session = state.sessions.find((s) => s.localDate === today && s.weekday === weekday) ?? null;
  const slots = session ? session.snapshot : day.slots;
  const st = DAY_STYLE[weekday]!;
  const act = slots.filter((s) => s.section === "activation" || s.section === "pt");
  const [ptMode, setPtMode] = useState<"block" | "each">(act.length >= 2 ? "block" : "each");
  const [cur, setCur] = useState(0);
  const [flow, setFlow] = useState<Prescription[] | null>(null);
  const [showList, setShowList] = useState(false);
  const [psaOpen, setPsaOpen] = useState(false);

  const steps: Step[] = useMemo(() => {
    const list: Step[] = [];
    if (act.length >= 2 && ptMode === "block") list.push({ key: "pt-block", type: "pt", slots: act });
    for (const s of slots) {
      const isAct = act.includes(s);
      if (isAct && act.length >= 2 && ptMode === "block") continue;
      list.push({ key: s.id, type: "move", slot: s });
    }
    list.push({ key: "end", type: "end" });
    return list;
  }, [slots, ptMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // Warm the photo cache for today's moves so the one-by-one view keeps its pictures offline.
  const photoKey = slots.map((s) => s.exerciseId).join("|");
  useEffect(() => {
    prefetchPhotos(photoKey.split("|"));
  }, [photoKey]);

  const idx = Math.min(cur, steps.length - 1);
  const step = steps[idx]!;
  const finishedOf = (s: Prescription) => (session ? slotFinished(session, s) : false);
  const real = slots.filter((s) => !s.optional);
  const movesDone = real.filter(finishedOf).length;
  const totals = useMemo(() => {
    let target = 0;
    let done = 0;
    for (const slot of slots) {
      if (slot.optional) continue;
      const t = slot.sets ? plannedSets(slot) : 1;
      target += t;
      if (session) done += slot.sets ? Math.min(doneSetCount(session, slot), t) : slotLogs(session, slot.id).some((l) => l.status === "done") || (session.extras ?? []).some((e) => e.slotId === slot.id) ? 1 : 0;
    }
    return { target, done };
  }, [slots, session]);
  const pct = totals.target ? Math.min(1, totals.done / totals.target) : 0;

  const goNext = (from = idx) => {
    // jump to the next step that is not finished yet, else just the next one
    for (let i = from + 1; i < steps.length; i += 1) {
      const s = steps[i]!;
      if (s.type === "end") return setCur(i);
      if (s.type === "move" && s.slot && !finishedOf(s.slot) && !s.slot.optional) return setCur(i);
      if (s.type === "pt") return setCur(i);
    }
    setCur(steps.length - 1);
  };

  // the first unfinished step when opening or resuming
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const i = steps.findIndex((s) => (s.type === "move" && s.slot && !finishedOf(s.slot) && !s.slot.optional) || (s.type === "pt" && s.slots!.some((x) => !finishedOf(x))));
    setCur(i < 0 ? steps.length - 1 : i);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const exit = () => state.setGymMode(null);
  const [swapKey, setSwapKey] = useState(0);
  void swapKey;

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-canvas text-ink" data-testid="gym-mode" role="region" aria-label={`Gym mode, ${WEEKDAY_NAMES[weekday]}`}>
      <header className="shrink-0 border-b border-line px-3 pb-2" style={{ paddingTop: "max(0.6rem, env(safe-area-inset-top))" }}>
        <div className="mx-auto flex max-w-xl items-center gap-2">
          <button type="button" onClick={exit} aria-label="Exit gym mode" data-testid="gym-exit" className="tap flex min-h-11 items-center gap-1.5 rounded-2xl bg-surface-2 px-3 text-sm font-bold">
            <X className="size-5" /> Exit
          </button>
          <div className="min-w-0 flex-1 text-center">
            <p className="truncate text-[0.68rem] font-bold uppercase tracking-[0.16em] text-ink-soft">{WEEKDAY_NAMES[weekday]}{weekday !== new Date().getDay() ? " · logs count for today" : ""}</p>
            <p className="truncate font-display text-lg leading-tight">{day.name}</p>
          </div>
          <button type="button" onClick={() => setShowList((v) => !v)} aria-label="All moves" aria-expanded={showList} className="tap grid size-11 place-items-center rounded-2xl bg-surface-2">
            <ListChecks className="size-5" />
          </button>
        </div>
        <div className="mx-auto mt-2 max-w-xl">
          <div className="h-2 overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct * 100)} aria-label="Session progress">
            <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${pct * 100}%`, background: st.color === "#5a5750" ? "var(--sun)" : "var(--sun)" }} />
          </div>
          <p className="mt-1 flex justify-between text-xs font-semibold text-ink-soft tabular-nums">
            <span>{movesDone} of {real.length} moves</span>
            <span>{Math.round(totals.done)}/{Math.ceil(totals.target)} sets · {Math.round(pct * 100)}%</span>
          </p>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-xl px-4 pb-10 pt-3">
          {day.psa ? (
            <button type="button" onClick={() => setPsaOpen((v) => !v)} className="mb-3 w-full rounded-2xl border border-copper/40 bg-copper/10 px-4 py-3 text-left" data-testid="gym-psa" aria-expanded={psaOpen}>
              <Eyebrow className="text-copper-deep">{WEEKDAY_NAMES[weekday]} PSA · from your PDF</Eyebrow>
              <p className={cn("mt-0.5 font-display text-[1.05rem] leading-snug", !psaOpen && "line-clamp-2")}>{day.psa}</p>
            </button>
          ) : null}
          <RestStrip />
          {showList ? (
            <ol className="mb-3 space-y-1 rounded-2xl border border-line bg-surface p-2" aria-label="Jump to a move">
              {steps.map((s, i) => {
                const label = s.type === "pt" ? "PT activation block" : s.type === "end" ? "Finish" : exerciseLabel(session ? chosenExerciseId(s.slot!, session.chosenExercise) : s.slot!.exerciseId);
                const done = s.type === "move" ? finishedOf(s.slot!) : s.type === "pt" ? s.slots!.every(finishedOf) : false;
                return (
                  <li key={s.key}>
                    <button type="button" onClick={() => (setCur(i), setShowList(false))} className={cn("tap flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold", i === idx ? "bg-sun/15" : "hover:bg-surface-2")}>
                      <span className={cn("grid size-6 place-items-center rounded-full text-xs font-extrabold", done ? "bg-forest text-on-forest" : "bg-surface-2 text-ink-soft")}>{done ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}</span>
                      <span className="min-w-0 flex-1 truncate">{label}</span>
                      {s.type === "move" && s.slot!.optional ? <Badge>optional</Badge> : null}
                    </button>
                  </li>
                );
              })}
            </ol>
          ) : null}

          {step.type === "pt" ? (
            <PtBlock slots={step.slots!} session={session} weekday={weekday} onDone={() => goNext()} onEach={() => (setPtMode("each"), setCur(0))} onFlow={() => setFlow(step.slots!)} />
          ) : step.type === "move" ? (
            <MoveStep key={step.key + (session ? chosenExerciseId(step.slot!, session.chosenExercise) : "")} slot={step.slot!} weekday={weekday} session={session} onDone={() => goNext()} onFlow={() => setFlow([step.slot!])} />
          ) : (
            <EndStep weekday={weekday} session={session} totals={totals} movesDone={movesDone} total={real.length} />
          )}
        </div>
      </div>

      <footer className="shrink-0 border-t border-line px-3 pt-2" style={{ paddingBottom: "max(0.6rem, env(safe-area-inset-bottom))" }}>
        <div className="mx-auto flex max-w-xl items-center gap-2">
          <Button tone="soft" size="lg" className="min-w-14 px-3" aria-label="Previous move" disabled={idx === 0} onClick={() => setCur(Math.max(0, idx - 1))}>
            <ChevronLeft className="size-6" />
          </Button>
          <p className="min-w-0 flex-1 text-center text-sm font-bold text-ink-soft tabular-nums">
            {step.type === "end" ? "Wrap up" : `Step ${idx + 1} of ${steps.length - 1}`}
          </p>
          <Button tone="soft" size="lg" className="min-w-14 px-3" aria-label="Next move" disabled={idx >= steps.length - 1} onClick={() => setCur(Math.min(steps.length - 1, idx + 1))}>
            <ChevronRight className="size-6" />
          </Button>
        </div>
      </footer>

      {flow ? (
        <GuidedRun
          slots={flow}
          session={session}
          weekday={weekday}
          onClose={() => setFlow(null)}
          onFinished={() => {
            setFlow(null);
            goNext();
          }}
        />
      ) : null}
      <Toast />
      <Overlays />
    </div>
  );
}

/* ---------------------------------------------------------------- rest strip */

function RestStrip() {
  const rest = useDaylight((s) => s.rest);
  const startRest = useDaylight((s) => s.startRest);
  const clear = useDaylight((s) => s.clearRest);
  const now = useNow(250, Boolean(rest));
  const buzzed = useRef<number | null>(null);
  const left = rest ? Math.ceil((rest.endsAt - now) / 1000) : 0;
  useEffect(() => {
    if (rest && left <= 0 && buzzed.current !== rest.endsAt) {
      buzzed.current = rest.endsAt;
      haptic(220);
    }
  }, [rest, left]);
  if (!rest) return null;
  const done = left <= 0;
  const pct = Math.max(0, Math.min(1, 1 - left / rest.total));
  return (
    <div className="mb-3 overflow-hidden rounded-2xl bg-ink text-canvas" role="timer" aria-label="Rest timer" data-testid="gym-rest">
      <div className="h-1.5 bg-canvas/20"><div className="h-full bg-sun transition-[width] duration-300" style={{ width: `${pct * 100}%` }} /></div>
      <div className="flex items-center gap-3 px-4 py-2.5">
        <Timer className="size-6 shrink-0 text-sun" />
        <div className="min-w-0 flex-1">
          <p className="text-[0.65rem] font-bold uppercase tracking-widest text-canvas/60">{done ? "Rest done" : "Rest"}</p>
          <p className="font-display text-3xl leading-none tabular-nums">{done ? "Go" : formatSeconds(left)}</p>
        </div>
        <button type="button" className="tap min-h-11 rounded-2xl bg-canvas/15 px-4 text-sm font-bold" onClick={() => startRest(Math.max(15, left + 15))}>+15s</button>
        <button type="button" className="tap min-h-11 rounded-2xl bg-canvas/15 px-4 text-sm font-bold" onClick={() => clear()}>{done ? "Hide" : "Skip"}</button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- PT block */

function PtBlock({ slots, session, weekday, onDone, onEach, onFlow }: { slots: Prescription[]; session: WorkoutSession | null; weekday: number; onDone: () => void; onEach: () => void; onFlow: () => void }) {
  const state = useDaylight();
  const allDone = slots.every((s) => (session ? slotFinished(session, s) : false));
  const doneAll = () => {
    const n = state.bulkComplete(weekday, slots.map((s) => s.id));
    haptic(24);
    state.showToast(n ? `PT block done (${n} sets)` : "PT block already logged");
    onDone();
  };
  return (
    <section className="animate-rise" data-testid="pt-block">
      <div className="flex items-center gap-2">
        <Badge tone="teal">back-friendly start</Badge>
        <Eyebrow>PT activation first</Eyebrow>
      </div>
      <h1 className="mt-1 font-display text-[2rem] leading-tight">Warm-up block</h1>
      <ul className="mt-3 space-y-2">
        {slots.map((s) => {
          const id = session ? chosenExerciseId(s, session.chosenExercise) : s.exerciseId;
          const done = session ? slotFinished(session, s) : false;
          return (
            <li key={s.id} className="card flex items-center gap-3 p-2.5">
              <MoveThumb exerciseId={id} size={54} />
              <span className="min-w-0 flex-1">
                <span className="block font-display text-lg leading-tight">{exerciseLabel(id)}</span>
                <span className="block text-sm font-bold text-ink-soft">{targetLine(s)}</span>
              </span>
              {done ? <span className="grid size-8 place-items-center rounded-full bg-forest text-on-forest"><Check className="size-5" strokeWidth={3} /></span> : null}
            </li>
          );
        })}
      </ul>
      <Button size="lg" className="mt-4 min-h-16 w-full text-xl" tone="sun" data-testid="pt-done-all" onClick={doneAll}>
        <Check className="size-6" strokeWidth={3} /> {allDone ? "Block logged · continue" : "Done: whole block as prescribed"}
      </Button>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <Button tone="outline" size="lg" data-testid="pt-flow" onClick={onFlow}>
          <Play className="size-5" /> Flow mode
        </Button>
        <Button tone="outline" size="lg" onClick={onEach} data-testid="pt-each">
          One by one
        </Button>
      </div>
      <p className="mt-3 text-sm text-ink-soft">Flow mode paces you through every set and hold with a timer and goes straight on to the next move. “One by one” lets you adjust sets, reps or load on each.</p>
    </section>
  );
}

/* ---------------------------------------------------------------- one move */

function MoveStep({ slot, weekday, session, onDone, onFlow }: { slot: Prescription; weekday: number; session: WorkoutSession | null; onDone: () => void; onFlow: () => void }) {
  const state = useDaylight();
  const exerciseId = session ? chosenExerciseId(slot, session.chosenExercise) : slot.exerciseId;
  const ex = exerciseById(exerciseId);
  const kind = ex?.kind ?? "strength";
  const prev = lastSet(state.sessions, exerciseId, session?.id ?? "")?.set;
  const def = prescribedDefaults(slot, kind);
  const unit = state.units;
  const replaced = session ? (session.extras ?? []).find((e) => e.slotId === slot.id) : undefined;
  const done = session ? doneSetCount(session, slot) : 0;
  const planned = slot.sets ?? 1;
  const timed = kind === "timed";
  const minutes = kind === "cardio" || kind === "mobility";
  const strengthLike = kind === "strength" || kind === "activation";
  const showLoad = kind === "strength" || kind === "distance";

  const [sets, setSets] = useState(String(planned));
  const [reps, setReps] = useState(def.reps != null ? String(def.reps) : "");
  const [load, setLoad] = useState(prev?.load != null ? String(prev.load) : "");
  const [assist, setAssist] = useState(prev?.assistance != null ? String(prev.assistance) : "");
  const [secs, setSecs] = useState(def.seconds != null ? String(minutes ? Math.round(def.seconds / 60) : def.seconds) : "");
  const [dist, setDist] = useState(def.distance ?? "");
  const [adjust, setAdjust] = useState(false);
  const [setByset, setSetByset] = useState(false);
  const finished = session ? slotFinished(session, slot) : false;
  const remaining = Math.max(0, num(sets)! - done);

  const dose = slot.sets ? `${slot.sets}${slot.setsMax ? `–${slot.setsMax}` : ""} × ${slot.repLabel}${slot.perSide ? " each side" : ""}` : slot.durationLabel ?? slot.repLabel;
  const summary = [
    num(sets) && slot.sets ? `${num(sets)} set${num(sets)! > 1 ? "s" : ""}` : null,
    strengthLike && reps ? `× ${reps}${slot.perSide ? " / side" : ""}` : null,
    timed && secs ? `${secs}s${slot.perSide ? " / side" : ""}` : null,
    minutes && secs ? `${secs} min` : null,
    showLoad && load ? `@ ${load} ${unit}` : null,
  ].filter(Boolean).join(" ");

  const complete = () => {
    const n = state.bulkComplete(weekday, [slot.id], {
      sets: num(sets) ?? planned,
      reps: strengthLike ? num(reps) : null,
      load: showLoad ? num(load) : null,
      assist: ex?.usesAssistance ? num(assist) : null,
      seconds: timed ? num(secs) : minutes ? (num(secs) != null ? Math.round(num(secs)! * 60) : null) : null,
      distance: kind === "distance" || kind === "cardio" ? dist || null : null,
    });
    haptic(24);
    state.showToast(n ? `Logged ${summary || "it"}` : "Already logged");
    if (slot.section === "main" && slot.sets && slot.sets > 1) state.startRest(Math.min(state.restDefault, 75));
    onDone();
  };

  const logOne = () => {
    const done0 = done;
    const side = slot.perSide ? "both" : "na";
    state.logSet(weekday, slot.id, {
      reps: strengthLike ? num(reps) : null,
      load: showLoad ? num(load) : null,
      assist: ex?.usesAssistance ? num(assist) : null,
      seconds: timed ? num(secs) : minutes ? (num(secs) != null ? Math.round(num(secs)! * 60) : null) : null,
      distance: kind === "distance" || kind === "cardio" ? dist || null : null,
      side,
    });
    haptic(18);
    if (done0 + 1 >= planned) onDone();
    else if (slot.section === "main") state.startRest();
  };

  return (
    <section className="animate-rise" data-testid="gym-move" data-slot={slot.id}>
      <div className="flex flex-wrap items-center gap-2">
        {slot.section === "activation" ? <Badge tone="teal">PT activation</Badge> : slot.section === "finisher" ? <Badge tone="copper">abs / cardio / finisher</Badge> : <Badge>workout</Badge>}
        {slot.optional ? <Badge>optional</Badge> : null}
        {ex?.back === "caution" ? <Badge tone="copper">back: go easy</Badge> : null}
        {finished ? <Badge tone="forest">done</Badge> : null}
      </div>
      <h1 className="mt-1 font-display text-[2.1rem] leading-[1.05]" data-testid="gym-move-name">{exerciseLabel(exerciseId)}</h1>
      <p className="mt-1 text-xl font-bold" data-testid="gym-dose">{dose || "Open slot"}</p>
      {replaced ? <p className="mt-1 rounded-xl bg-sun/15 px-3 py-2 text-sm">You logged <b>{replaced.name}</b> here instead.</p> : null}

      <div className="mt-3">
        <MoveMedia key={exerciseId} exerciseId={exerciseId} compact />
      </div>

      {slot.sourceCue ? (
        <div className="mt-3 rounded-xl bg-sun/20 p-3">
          <Eyebrow className="text-copper-deep">Your plan cue</Eyebrow>
          <p className="mt-0.5 text-lg font-semibold leading-snug">{slot.sourceCue[0]!.toUpperCase() + slot.sourceCue.slice(1)}</p>
        </div>
      ) : null}
      {prev ? <p className="mt-2 text-sm text-ink-soft">Last time: {[prev.reps, prev.load != null ? `${prev.load} ${prev.loadUnit}` : null, prev.seconds ? `${prev.seconds}s` : null].filter(Boolean).join(" · ") || "done"}</p> : null}

      {adjust ? (
        <div className="mt-3 grid grid-cols-2 gap-2 rounded-2xl bg-surface-2 p-3" data-testid="gym-adjust">
          {slot.sets ? <Stepper label="Sets" value={sets} onChange={setSets} min={1} /> : null}
          {strengthLike ? <Stepper label={slot.perSide ? "Reps / side" : "Reps"} value={reps} onChange={setReps} /> : null}
          {timed ? <Stepper label="Seconds" value={secs} onChange={setSecs} step={5} /> : null}
          {minutes ? <Stepper label="Minutes" value={secs} onChange={setSecs} step={5} /> : null}
          {showLoad ? <Stepper label="Load" unit={unit} value={load} onChange={setLoad} step={unit === "kg" ? 2.5 : 5} inputMode="decimal" /> : null}
          {ex?.usesAssistance ? <Stepper label="Assist" unit={unit} value={assist} onChange={setAssist} step={unit === "kg" ? 2.5 : 5} inputMode="decimal" /> : null}
          {kind === "distance" || kind === "cardio" ? (
            <label className="col-span-2 block">
              <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-soft">{kind === "cardio" ? "Distance / notes" : "Distance"}</span>
              <input className="field" value={dist} onChange={(e) => setDist(e.target.value)} />
            </label>
          ) : null}
        </div>
      ) : null}

      <Button size="lg" tone="sun" className="mt-4 min-h-[4.25rem] w-full text-xl leading-tight" data-testid="gym-done" onClick={complete}>
        <Check className="size-7 shrink-0" strokeWidth={3} />
        <span className="text-left">
          {finished ? "Already done · next" : done > 0 && done < planned ? `Finish remaining ${remaining} set${remaining > 1 ? "s" : ""}` : slot.sets ? `Done ${num(sets) ?? planned} set${(num(sets) ?? planned) > 1 ? "s" : ""} as prescribed` : "Done as prescribed"}
          {summary && !finished ? <span className="block text-sm font-semibold opacity-80">{summary}</span> : null}
        </span>
      </Button>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <Button tone="outline" size="lg" aria-pressed={adjust} data-testid="gym-adjust-toggle" onClick={() => setAdjust((v) => !v)}>
          {adjust ? "Hide adjust" : "Adjust sets / reps / load"}
        </Button>
        {kind !== "cardio" || slot.durationLabel ? (
          <Button tone="outline" size="lg" data-testid="gym-guide" onClick={onFlow}>
            <Play className="size-5" /> Guide me
          </Button>
        ) : null}
      </div>
      {slot.sets && slot.sets > 1 ? (
        <button type="button" className="tap mt-2 w-full rounded-xl py-2 text-sm font-bold text-ink-soft underline-offset-2 hover:underline" onClick={() => setSetByset((v) => !v)}>
          {setByset ? "Hide set-by-set" : `Log one set at a time (${done}/${planned} done)`}
        </button>
      ) : null}
      {setByset ? (
        <Button tone="soft" size="lg" className="mt-1 w-full" onClick={logOne}>
          Log set {Math.min(done + 1, planned)} of {planned}
        </Button>
      ) : null}

      <div className="mt-5 grid grid-cols-2 gap-2">
        <Button tone="soft" data-testid="gym-form" onClick={() => state.setOverlay({ type: "form", exerciseId })}>
          <PlayCircle className="size-4" /> Form &amp; demo
        </Button>
        <Button tone="soft" data-testid="gym-swap" onClick={() => state.setOverlay({ type: "swap-move", weekday, slotId: slot.id })}>
          <Repeat className="size-4" /> Swap move
        </Button>
        <Button tone="soft" data-testid="gym-else" onClick={() => state.setOverlay({ type: "did-else", weekday, slotId: slot.id })}>
          <Shuffle className="size-4" /> I did something else
        </Button>
        <Button tone="soft" onClick={() => state.setOverlay({ type: "note", exerciseId, weekday, kind: "gym" })}>
          <Pencil className="size-4" /> Note
        </Button>
      </div>
      <Button tone="ghost" className="mt-2 w-full" onClick={() => (state.skipSlot(weekday, slot.id), onDone())}>
        <SkipForward className="size-4" /> Skip this move
      </Button>
    </section>
  );
}

/* ---------------------------------------------------------------- end */

function EndStep({ weekday, session, totals, movesDone, total }: { weekday: number; session: WorkoutSession | null; totals: { target: number; done: number }; movesDone: number; total: number }) {
  const state = useDaylight();
  const extras = session?.extras ?? [];
  return (
    <section className="animate-rise text-center" data-testid="gym-end">
      <div className="mx-auto mt-4 grid size-20 place-items-center rounded-full bg-sun text-on-sun"><Check className="size-10" strokeWidth={3} /></div>
      <h1 className="mt-3 font-display text-4xl">{movesDone >= total && total > 0 ? "That’s the session." : "End of the list"}</h1>
      <p className="mt-1 text-lg text-ink-soft">
        {movesDone} of {total} moves · {Math.round(totals.done)} sets{extras.length ? ` · ${extras.length} off-plan` : ""}
      </p>
      <Button size="lg" tone="sun" className="mt-6 min-h-16 w-full text-xl" data-testid="gym-finish" onClick={() => state.setOverlay({ type: "finish", weekday })}>
        <Flag className="size-6" /> Finish session
      </Button>
      <Button tone="outline" size="lg" className="mt-2 w-full" onClick={() => state.setOverlay({ type: "did-else", weekday, slotId: null })}>
        <Shuffle className="size-5" /> Log something else I did
      </Button>
      <Button tone="ghost" size="lg" className="mt-2 w-full" onClick={() => state.setGymMode(null)}>
        Back to the overview
      </Button>
    </section>
  );
}

/* ---------------------------------------------------------------- guided timer / flow */

type Phase = { slotId: string; exerciseId: string; label: string; kind: "work" | "rest" | "ready"; seconds: number; reps?: number; tempo?: number; side?: string; set: number; sets: number };

function buildPhases(slots: Prescription[], session: WorkoutSession | null): Phase[] {
  const out: Phase[] = [];
  slots.forEach((slot, si) => {
    const exerciseId = session ? chosenExerciseId(slot, session.chosenExercise) : slot.exerciseId;
    const kind = exerciseById(exerciseId)?.kind ?? "strength";
    const def = prescribedDefaults(slot, kind);
    const sets = slot.sets ?? 1;
    const sides = slot.perSide ? ["left", "right"] : [undefined];
    const tempo = slot.section === "activation" ? 4 : 3;
    out.push({ slotId: slot.id, exerciseId, label: exerciseLabel(exerciseId), kind: "ready", seconds: si === 0 ? 5 : 8, set: 0, sets });
    for (let s = 0; s < sets; s += 1) {
      for (const side of sides) {
        let seconds: number;
        let reps: number | undefined;
        if (kind === "timed" || kind === "mobility" || kind === "cardio") seconds = def.seconds ?? 30;
        else {
          reps = def.reps ?? 8;
          seconds = reps * tempo;
        }
        out.push({ slotId: slot.id, exerciseId, label: exerciseLabel(exerciseId), kind: "work", seconds, reps, tempo: reps ? tempo : undefined, side, set: s + 1, sets });
        const last = s === sets - 1 && side === sides[sides.length - 1];
        if (!last) out.push({ slotId: slot.id, exerciseId, label: exerciseLabel(exerciseId), kind: "rest", seconds: slot.section === "activation" ? 12 : 30, set: s + 1, sets });
      }
    }
  });
  return out;
}

export function GuidedRun({ slots, session, weekday, onClose, onFinished }: { slots: Prescription[]; session: WorkoutSession | null; weekday: number; onClose: () => void; onFinished: () => void }) {
  const state = useDaylight();
  const phases = useMemo(() => buildPhases(slots, session), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [i, setI] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(true);
  const last = useRef(Date.now());
  const p = phases[Math.min(i, phases.length - 1)]!;

  useEffect(() => {
    last.current = Date.now();
    if (!running) return;
    const id = window.setInterval(() => {
      const n = Date.now();
      setElapsed((e) => e + (n - last.current));
      last.current = n;
    }, 200);
    return () => window.clearInterval(id);
  }, [running, i]);

  const total = p.seconds * 1000;
  const left = Math.max(0, Math.ceil((total - elapsed) / 1000));
  useEffect(() => {
    if (elapsed >= total && running) next();
  }, [elapsed]); // eslint-disable-line react-hooks/exhaustive-deps

  function finish() {
    const n = state.bulkComplete(weekday, slots.map((s) => s.id));
    haptic(30);
    state.showToast(n ? `Logged ${n} sets as prescribed` : "Already logged");
    onFinished();
  }
  function next() {
    haptic(p.kind === "work" ? 40 : 12);
    if (i >= phases.length - 1) return finish();
    setI(i + 1);
    setElapsed(0);
  }
  const nextPhase = phases[i + 1];
  const rep = p.kind === "work" && p.reps && p.tempo ? Math.min(p.reps, Math.floor(elapsed / 1000 / p.tempo) + 1) : null;
  const exId = p.exerciseId;
  const pct = Math.min(1, elapsed / total);

  return (
    <div className="fixed inset-0 z-[45] flex flex-col bg-canvas" role="dialog" aria-modal="true" aria-label="Guided timer" data-testid="guided-run">
      <div className="mx-auto flex w-full max-w-xl items-center gap-2 px-4" style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}>
        <button type="button" onClick={onClose} className="tap flex min-h-11 items-center gap-1.5 rounded-2xl bg-surface-2 px-3 text-sm font-bold" aria-label="Stop guided timer"><X className="size-5" /> Stop</button>
        <p className="min-w-0 flex-1 truncate text-center text-xs font-bold uppercase tracking-widest text-ink-soft">
          {slots.length > 1 ? `Flow · ${phases.slice(0, i + 1).filter((x) => x.kind === "ready").length} of ${slots.length} moves` : "Guided"}
        </p>
        <span className="w-16" />
      </div>
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-5 text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-ink-soft">{p.kind === "ready" ? "Get ready" : p.kind === "rest" ? "Rest" : p.side ? `${p.side === "left" ? "Left" : "Right"} side` : "Go"}</p>
        <h2 className="mt-1 font-display text-4xl leading-tight" data-testid="guided-name">{p.label}</h2>
        {p.kind !== "ready" ? <p className="mt-1 text-lg font-bold text-ink-soft">Set {p.set} of {p.sets}</p> : null}
        <div className="relative mt-4 grid size-56 place-items-center" aria-live="off">
          <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90" aria-hidden="true">
            <circle cx="50" cy="50" r="45" fill="none" stroke="var(--surface-2)" strokeWidth="6" />
            <circle cx="50" cy="50" r="45" fill="none" stroke={p.kind === "work" ? "var(--sun)" : "var(--teal)"} strokeWidth="6" strokeLinecap="round" strokeDasharray={`${pct * 283} 283`} />
          </svg>
          <div>
            <p className="font-display text-7xl leading-none tabular-nums" data-testid="guided-clock">{formatSeconds(left)}</p>
            {rep ? <p className="mt-1 text-xl font-bold text-ink-soft tabular-nums" data-testid="guided-rep">rep {rep} of {p.reps}</p> : null}
          </div>
        </div>
        {p.kind !== "rest" ? <div className="mt-4 w-full max-w-xs"><MoveMedia key={exId} exerciseId={exId} compact /></div> : null}
        {nextPhase ? <p className="mt-3 text-sm text-ink-soft">Next: {nextPhase.kind === "rest" ? "rest" : nextPhase.kind === "ready" ? `get ready for ${nextPhase.label}` : `${nextPhase.label}${nextPhase.side ? `, ${nextPhase.side}` : ""}`}</p> : <p className="mt-3 text-sm text-ink-soft">Last one. Everything is logged as prescribed when you finish.</p>}
      </div>
      <div className="mx-auto grid w-full max-w-xl grid-cols-3 gap-2 px-4" style={{ paddingBottom: "max(0.9rem, env(safe-area-inset-bottom))" }}>
        <Button tone="outline" size="lg" onClick={() => (setI(Math.max(0, i - 1)), setElapsed(0))} aria-label="Previous">Back</Button>
        <Button tone="sun" size="lg" onClick={() => setRunning((r) => !r)} data-testid="guided-pause" aria-label={running ? "Pause" : "Resume"}>
          {running ? <Pause className="size-6" /> : <Play className="size-6" />}
        </Button>
        <Button tone="outline" size="lg" onClick={next} data-testid="guided-skip" aria-label={i >= phases.length - 1 ? "Finish" : "Skip ahead"}>
          {i >= phases.length - 1 ? "Finish" : "Skip"}
        </Button>
      </div>
    </div>
  );
}
