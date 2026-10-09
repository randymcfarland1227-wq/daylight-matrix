import { useState } from "react";
import { CalendarDays, ChevronDown, Flag, Info, ListChecks, Pencil, Play, PlayCircle, Plus, Repeat2, Shuffle, SkipForward, Timer, Trash2, Undo2, Check } from "lucide-react";
import { WEEKDAY_NAMES, localDate } from "@/lib/daylight/dates";
import { DAY_STYLE } from "@/lib/daylight/theme";
import { exerciseById } from "@/lib/daylight/exercises";
import { exerciseLabel } from "@/lib/daylight/names";
import { activePlan, dayBlocks, dayTemplate } from "@/lib/daylight/plan";
import { chosenExerciseId, doneSetCount, formatSeconds, lastSet, setSummary, slotFinished, slotLogs, sessionProgress } from "@/lib/daylight/logic";
import { lessonsForExercise } from "@/lib/daylight/learn";
import { useDaylight } from "@/lib/daylight/store";
import type { DayTemplate, Prescription, TrainingTab, WorkoutSession } from "@/lib/daylight/types";
import { dayMuscles } from "@/lib/daylight/volume";
import { muscleName } from "@/lib/daylight/muscles";
import { Badge, Button, Card, Chip, Eyebrow, PageHead, Ring, Segmented, Stepper, cn, haptic, useNow } from "./ui";
import { MuscleChips, useGoToMuscle } from "./MuscleChips";
import { Moves, PlanEditor, PtBoard } from "./TrainExtras";
import { MoveThumb } from "./MoveArt";

export function Train() {
  const tab = useDaylight((s) => s.trainingTab);
  const setTab = useDaylight((s) => s.setTrainingTab);
  const norm: TrainingTab = (["session", "week", "moves", "pt", "plan"] as string[]).includes(tab) ? tab : "session";
  return (
    <div className="training-page">
      <PageHead eyebrow="Movement with purpose" title="Training" helper="Browse your plan, read a cue, or start a session when you’re ready." />
      <Segmented
        label="Training sections"
        value={norm}
        onChange={(v) => setTab(v as TrainingTab)}
        options={[
          { id: "session", label: "Exercises" },
          { id: "week", label: "Weekly plan" },
          { id: "moves", label: "Library" },
          { id: "pt", label: "Physical therapy" },
          { id: "plan", label: "Edit plan" },
        ]}
        className="mb-4"
      />
      {norm === "session" ? <SessionScreen /> : null}
      {norm === "week" ? <WeekScreen /> : null}
      {norm === "moves" ? <Moves /> : null}
      {norm === "pt" ? <PtBoard /> : null}
      {norm === "plan" ? <PlanEditor /> : null}
    </div>
  );
}

/* ---------------------------------------------------------------- Day switcher */

export function DaySwitcher({ value, onChange, plan }: { value: number; onChange: (d: number) => void; plan: { days: DayTemplate[] } }) {
  const todayIdx = new Date().getDay();
  const order = [1, 2, 3, 4, 5, 6, 0];
  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1" role="tablist" aria-label="Choose a day">
      {order.map((d) => {
        const st = DAY_STYLE[d]!;
        const day = plan.days.find((x) => x.weekday === d);
        const active = value === d;
        return (
          <button
            key={d}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(d)}
            className={cn(
              "tap relative flex min-h-[3.75rem] min-w-[3.6rem] shrink-0 flex-col items-center justify-center rounded-lg border px-2 text-sm font-bold",
              active ? "border-accent bg-accent text-on-accent shadow-sm" : "border-line bg-surface text-ink hover:bg-surface-2",
            )}
          >
            <span className="t-meta opacity-80">{st.short}</span>
            <span className="text-base">{day?.scheduled ? day.slots.length : "–"}</span>
            {d === todayIdx ? <span className={cn("absolute -top-1 right-1 rounded-full px-1.5 text-[0.6rem] font-extrabold uppercase", active ? "bg-accent text-on-accent" : "bg-accent/80 text-on-accent")}>today</span> : null}
          </button>
        );
      })}
    </div>
  );
}

/* ---------------------------------------------------------------- Session */

function useSessionFor(weekday: number): WorkoutSession | null {
  const today = localDate();
  return useDaylight((s) => s.sessions.find((x) => x.localDate === today && x.weekday === weekday) ?? null);
}

function SessionScreen() {
  const state = useDaylight();
  const today = localDate();
  const plan = activePlan(state.planVersions, today);
  const weekday = state.trainDay;
  const day = dayTemplate(plan, weekday);
  const session = useSessionFor(weekday);
  const slots = session ? session.snapshot : day.slots;
  const st = DAY_STYLE[weekday]!;
  const blocks = dayBlocks(day, slots);
  const isToday = weekday === new Date().getDay();

  const totals = sessionProgress(slots, session);

  const muscles = dayMuscles({ ...day, slots }).filter((m) => m.weight >= 0.5).slice(0, 7);
  const goMuscle = useGoToMuscle();
  const finished = session?.status === "finished";

  if (!day.scheduled) {
    return (
      <div>
        <DaySwitcher value={weekday} onChange={state.setTrainDay} plan={plan} />
        <Card className="mt-4 text-center">
          <p className="t-display">Open day</p>
          <p className="mx-auto mt-2 max-w-md text-ink-soft">{day.why} The plan runs Monday to Saturday.</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Button tone="soft" onClick={() => state.setTrainDay(1)}>See Monday</Button>
            <Button tone="outline" onClick={() => state.setOverlay({ type: "activity" })}>Log other activity</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <DaySwitcher value={weekday} onChange={state.setTrainDay} plan={plan} />

      {day.psa ? (
        <section className="mt-4 rounded-[1.25rem] border border-warn/40 bg-warn/10 p-4" data-testid="day-psa" aria-label="Session reminder">
          <Eyebrow className="text-warn">{WEEKDAY_NAMES[weekday]} reminder · from your PDF</Eyebrow>
          <p className="mt-1 t-title">{day.psa}</p>
        </section>
      ) : null}

      <Card className="animate-rise mt-4 border-accent/25" as="section" aria-label="Session overview">
        <div className="flex items-center gap-2">
          <span className="inline-block size-2.5 rounded-full" style={{ background: st.color }} aria-hidden="true" />
          <Eyebrow>
            {WEEKDAY_NAMES[weekday]} {isToday ? "· today" : "· not today"}
          </Eyebrow>
        </div>
        <div className="mt-2 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="t-display">{day.name}</h2>
            <p className="t-caption mt-1 text-ink-soft">
              {totals.total} exercises · {totals.completed} completed{totals.skipped ? ` · ${totals.skipped} skipped` : ""}
            </p>
          </div>
          <Ring value={totals.total ? totals.completed / totals.total : 0} size={64} stroke={7} label={`${totals.completed} of ${totals.total} exercises completed`}>
            <span className="t-caption font-bold tabular-nums">{totals.completed}/{totals.total}</span>
          </Ring>
        </div>
        <p className="reason-block mt-3 text-sm"><span className="eyebrow block mb-2">Why this session is here</span>{day.why}</p>
        <div className="mt-3 flex flex-wrap gap-1.5" aria-label="Muscles in this session">
          {muscles.map((m) => (
            <button key={m.id} type="button" onClick={() => goMuscle(m.id)} className={cn("tap rounded-full px-2.5 py-1 text-xs font-bold", m.weight >= 1 ? "bg-accent/15 text-accent" : "border border-line text-ink-soft")}>
              {muscleName(m.id)}
            </button>
          ))}
        </div>
        {!isToday ? (
          <p className="t-caption mt-3 rounded-xl bg-surface-2 px-3 py-2 text-ink-soft">You’re looking at {WEEKDAY_NAMES[weekday]}. Anything you log counts for today’s date.</p>
        ) : null}
        {finished ? <p className="t-caption mt-3 rounded-xl bg-surface-2 px-3 py-2 font-bold">Finished. Logging another set re-opens it.</p> : null}
        <Button size="lg" tone="primary" className="mt-4 w-full" data-testid="start-gym-overview" onClick={() => state.setGymMode(weekday)}>
          <Play className="size-5" fill="currentColor" /> {session && totals.done > 0 ? "Resume session" : "Start session"}
        </Button>
      </Card>

      <div className="mt-5 space-y-6">
        {blocks.map((block, bi) => (
          <section key={block.id} aria-label={block.label}>
            <div className="mb-2 flex items-center gap-2 px-1">
              <span className="grid size-6 place-items-center rounded-full bg-accent text-xs font-extrabold text-on-accent">{bi + 1}</span>
              <h2 className="t-title">{block.label}</h2>
              {block.id === "activation" ? <Badge tone="teal">back-friendly start</Badge> : null}
            </div>
            {block.id === "workout" && day.sectionPsa?.main ? <p className="mb-2 px-1 text-sm italic text-ink-soft">PSA: {day.sectionPsa.main}</p> : null}
            {block.slots.length === 0 && day.sectionNote?.[block.id === "finisher" ? "finisher" : "main"] ? (
              <Card className="py-3 text-ink-soft">{day.sectionNote.finisher}</Card>
            ) : null}
            <ul className="space-y-2.5">
              {block.slots.map((slot) => (
                <li key={slot.id}>
                  <ExerciseCard weekday={weekday} slot={slot} session={session} />
                </li>
              ))}
            </ul>
            {block.id === "finisher" && day.sectionPsa?.finisher ? <p className="mt-2 px-1 text-sm italic text-ink-soft">PSA: {day.sectionPsa.finisher}</p> : null}
          </section>
        ))}
        <ExtrasList weekday={weekday} session={session} />
        {day.reminders.length ? (
          <ul className="space-y-1 px-1 text-sm text-ink-soft">
            {day.reminders.map((r) => (
              <li key={r}>• {r}</li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="safe-bottom sticky bottom-[4.9rem] z-10 mt-6 md:bottom-4">
        <div className="flex gap-2 rounded-lg border border-line bg-canvas/95 p-2 shadow-lg backdrop-blur">
          <Button tone="soft" className="flex-1" onClick={() => state.setOverlay({ type: "note", weekday, kind: "gym" })}>
            <Pencil className="size-4" /> Note
          </Button>
          <Button tone="soft" className="flex-[2]" onClick={() => state.setOverlay({ type: "did-else", weekday, slotId: null })}>
            <Shuffle className="size-4" /> Log something else
          </Button>
          <Button className="flex-[2]" tone={totals.done > 0 ? "sun" : "outline"} onClick={() => state.setOverlay({ type: "finish", weekday })}>
            <Flag className="size-4" /> {finished ? "Summary" : "Finish session"}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Exercise card */

function ExerciseCard({ weekday, slot, session }: { weekday: number; slot: Prescription; session: WorkoutSession | null }) {
  const state = useDaylight();
  const open = state.openSlotId === slot.id;
  const exerciseId = session ? chosenExerciseId(slot, session.chosenExercise) : slot.exerciseId;
  const ex = exerciseById(exerciseId);
  const name = exerciseLabel(exerciseId);
  const logs = session ? slotLogs(session, slot.id).filter((l) => l.status === "done") : [];
  const skipped = session ? slotLogs(session, slot.id).some((l) => l.status === "skipped" && l.setIndex === -1) : false;
  const target = slot.sets ?? 1;
  const doneN = session ? (slot.sets ? doneSetCount(session, slot) : logs.length ? 1 : 0) : 0;
  const complete = session ? slotFinished(session, slot) && !skipped && doneN > 0 : false;
  const noteCount = state.observations.filter((o) => o.context.exerciseId === exerciseId).length;
  const dose = slot.sets
    ? `${slot.sets}${slot.setsMax ? `–${slot.setsMax}` : ""} × ${slot.repLabel}${slot.perSide ? " / side" : ""}`
    : slot.durationLabel ?? slot.repLabel;
  const notes = state.observations.filter((o) => o.context.exerciseId === exerciseId);
  const replaced = session ? (session.extras ?? []).filter((e) => e.slotId === slot.id) : [];

  return (
    <article className={cn("card overflow-hidden transition-colors", complete && "border-accent/50 bg-accent/5", skipped && "opacity-60")}>
      <button
        type="button"
        className="tap flex w-full items-center gap-3 p-3.5 text-left"
        aria-expanded={open}
        onClick={() => state.setOpenSlot(open ? null : slot.id, open ? null : exerciseId)}
      >
        <span className="relative shrink-0">
          <MoveThumb exerciseId={exerciseId} size={56} />
          {complete ? <span className="check-pop absolute -right-1 -top-1 grid size-6 place-items-center rounded-full bg-accent text-on-accent"><Check className="size-4" strokeWidth={3} /></span> : null}
          {skipped ? <span className="absolute -right-1 -top-1 grid size-6 place-items-center rounded-full bg-surface-2 text-ink-soft"><SkipForward className="size-3.5" /></span> : null}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block t-title">{name}</span>
          <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-ink-soft">
            <span className="font-bold text-ink">{dose || "Open"}</span>
            {slot.optional ? <Badge>optional</Badge> : null}
            {replaced.length ? <Badge tone="sun">swapped: {replaced[0]!.name}</Badge> : null}
            {slot.alternatives.length ? <Badge tone="sun">or {slot.alternatives.length} swap</Badge> : null}
            {ex?.back === "caution" ? <Badge tone="copper">back: go easy</Badge> : null}
            {noteCount ? <Badge tone="teal">{noteCount} note{noteCount > 1 ? "s" : ""}</Badge> : null}
          </span>
          {slot.sets ? (
            <span className="mt-1.5 flex gap-1" aria-label={`${doneN} of ${target} sets done`}>
              {Array.from({ length: Math.ceil(slot.setsMax ?? slot.sets) }).map((_, i) => (
                <span key={i} className={cn("h-1.5 flex-1 max-w-8 rounded-full transition-colors", i < doneN ? "bg-accent" : i < slot.sets! ? "bg-line" : "border border-dashed border-line")} />
              ))}
            </span>
          ) : null}
        </span>
        <ChevronDown className={cn("size-5 shrink-0 text-ink-faint transition-transform", open && "rotate-180")} />
      </button>

      {open ? (
        <div className="animate-rise border-t border-line px-3.5 pb-4 pt-3">
          <div className="mb-3 flex flex-wrap gap-2">
            <Button tone="sun" size="sm" data-testid="open-form" onClick={() => state.setOverlay({ type: "form", exerciseId })}>
              <PlayCircle className="size-4" /> Form guide &amp; demo
            </Button>
            <Button tone="soft" size="sm" onClick={() => state.setOverlay({ type: "swap-move", weekday, slotId: slot.id })}>
              <Shuffle className="size-4" /> Swap move
            </Button>
            <Button tone="soft" size="sm" onClick={() => state.setOverlay({ type: "did-else", weekday, slotId: slot.id })}>
              I did something else
            </Button>
          </div>
          {slot.sourceCue ? (
            <div className="rounded-xl bg-accent/20 p-3">
              <Eyebrow className="text-warn">Your plan cue · from your PDF</Eyebrow>
              <p className="mt-0.5 text-base font-semibold leading-snug">{slot.sourceCue[0]!.toUpperCase() + slot.sourceCue.slice(1)}</p>
            </div>
          ) : null}
          {ex?.pdfNote ? (
            <p className="mt-2 text-sm">
              <span className="font-bold text-warn">Your note on page 2:</span> “{ex.pdfNote}”
            </p>
          ) : null}
          {ex?.eduCue ? (
            <p className="mt-2 text-sm text-ink-soft">
              <span className="font-bold">General education (not from the PDF):</span> {ex.eduCue}
            </p>
          ) : null}
          {ex?.backNote ? (
            <p className="mt-2 flex items-start gap-1.5 text-sm text-ink-soft">
              <Info className="mt-0.5 size-4 shrink-0 text-info" />
              <span>
                <span className="font-bold">{ex.back === "friendly" ? "Back-friendly setup" : ex.back === "caution" ? "Go easy on the back" : "Setup"}:</span> {ex.backNote} <span className="text-ink-faint">General movement note, not medical advice.</span>
              </span>
            </p>
          ) : null}
          <div className="mt-3">
            <MuscleChips exerciseId={exerciseId} />
          </div>

          {slot.alternatives.length ? (
            <div className="mt-4">
              <Eyebrow>Swap — the plan allows either</Eyebrow>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {[slot.exerciseId, ...slot.alternatives.map((a) => a.exerciseId)].map((id) => (
                  <Chip key={id} active={id === exerciseId} tone="sun" onClick={() => state.chooseVariant(weekday, slot.id, id)}>
                    <Repeat2 className="size-3.5" /> {exerciseLabel(id)}
                  </Chip>
                ))}
              </div>
            </div>
          ) : null}

          <SetLogger weekday={weekday} slot={slot} exerciseId={exerciseId} session={session} />

          {logs.length ? (
            <ul className="mt-3 space-y-1.5" aria-label="Logged sets">
              {logs.map((l, i) => (
                <li key={l.id} className="flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-1.5 text-sm">
                  <span className="grid size-6 place-items-center rounded-full bg-accent text-xs font-extrabold text-on-accent">{i + 1}</span>
                  <span className="flex-1 font-semibold tabular-nums">{setSummary(l)}</span>
                  <button type="button" aria-label="Remove this set" className="tap grid size-8 place-items-center rounded-full text-ink-faint hover:bg-line" onClick={() => state.removeLog(l.id)}>
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          {notes.length ? (
            <ul className="mt-3 space-y-1">
              {notes.slice(0, 3).map((n) => (
                <li key={n.id} className="rounded-xl border border-info/30 bg-info/10 px-3 py-1.5 text-sm">
                  <span className="text-ink-faint">{n.context.date.slice(5)} · </span>
                  {n.text}
                  {n.forNextPlan ? <span className="ml-1 text-warn">★</span> : null}
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button tone="soft" size="sm" onClick={() => state.setOverlay({ type: "note", exerciseId, weekday, kind: "gym" })}>
              <Pencil className="size-4" /> Note on this move
            </Button>
            {lessonsForExercise(exerciseId).length ? (
              <Button tone="ghost" size="sm" onClick={() => state.setOpenLesson(lessonsForExercise(exerciseId)[0]!.id)}>
                <Info className="size-4" /> Lesson
              </Button>
            ) : null}
            <Button tone="ghost" size="sm" onClick={() => state.skipSlot(weekday, slot.id)}>
              <SkipForward className="size-4" /> Skip
            </Button>
            {state.undo?.kind === "set" ? (
              <Button tone="ghost" size="sm" onClick={() => state.undoLast()}>
                <Undo2 className="size-4" /> Undo
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
    </article>
  );
}

function SetLogger({ weekday, slot, exerciseId, session }: { weekday: number; slot: Prescription; exerciseId: string; session: WorkoutSession | null }) {
  const state = useDaylight();
  const ex = exerciseById(exerciseId);
  const kind = ex?.kind ?? "strength";
  const prev = lastSet(state.sessions, exerciseId, session?.id ?? "");
  const last = prev?.set;
  const firstRep = slot.repLabel.match(/\d+/)?.[0] ?? "";
  const timedLike = kind === "timed" || kind === "mobility" || kind === "cardio";
  const showReps = kind === "strength" || kind === "activation";
  const showLoad = kind === "strength" || kind === "distance";
  const showAssist = Boolean(ex?.usesAssistance);
  const showSeconds = timedLike;
  const showDistance = kind === "distance" || kind === "cardio";
  const asMinutes = kind === "cardio" || kind === "mobility";

  const [reps, setReps] = useState(last?.reps != null ? String(last.reps) : showReps ? firstRep : "");
  const [load, setLoad] = useState(last?.load != null ? String(last.load) : "");
  const [assist, setAssist] = useState(last?.assistance != null ? String(last.assistance) : "");
  const [secs, setSecs] = useState(last?.seconds != null ? String(asMinutes ? Math.round(last.seconds / 60) : last.seconds) : "");
  const [dist, setDist] = useState(last?.distance ?? "");
  const [side, setSide] = useState<"left" | "right" | "both">("left");
  const [holdStart, setHoldStart] = useState<number | null>(null);
  const now = useNow(250, holdStart != null);

  const done = session ? doneSetCount(session, slot) : 0;
  const total = slot.setsMax ?? slot.sets ?? 1;
  const nextNo = Math.min(done + 1, slot.sets ?? 1);
  const unit = state.units;
  const perSide = slot.perSide;
  const allDone = slot.sets ? done >= total : session ? slotLogs(session, slot.id).some((l) => l.status === "done") : false;

  const stepLoad = unit === "kg" ? 2.5 : 5;

  const submit = () => {
    const num = (v: string) => {
      const n = parseFloat(v);
      return Number.isFinite(n) ? n : null;
    };
    const secVal = num(secs);
    state.logSet(weekday, slot.id, {
      reps: showReps ? num(reps) : null,
      load: showLoad ? num(load) : null,
      assist: showAssist ? num(assist) : null,
      seconds: showSeconds && secVal != null ? (asMinutes ? Math.round(secVal * 60) : secVal) : null,
      distance: showDistance ? dist : null,
      side: perSide ? side : "na",
    });
    haptic(18);
    state.showToast(perSide && side !== "both" ? `${side === "left" ? "Left" : "Right"} side logged` : "Set logged");
    if (perSide && side === "left") setSide("right");
    else if (perSide && side === "right") setSide("left");
    const isLast = slot.sets ? (perSide && side === "left" ? false : done + 1 >= (slot.sets ?? 1)) : true;
    if (!isLast && slot.section === "main") state.startRest();
    else if (!isLast && slot.section === "finisher") state.startRest(45);
  };

  const holdElapsed = holdStart != null ? Math.round((now - holdStart) / 1000) : 0;

  return (
    <div className="mt-4 rounded-lg bg-surface-2 p-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold">
          {allDone ? "All sets logged" : slot.sets ? `Set ${nextNo} of ${slot.sets}${slot.setsMax ? `–${slot.setsMax}` : ""}` : "Log it"}
        </p>
        {last ? <p className="text-xs text-ink-soft">Last ({prev!.date.slice(5)}): {setSummary(last)}</p> : <p className="text-xs text-ink-faint">No previous result yet</p>}
      </div>

      {perSide ? (
        <div className="mt-2 grid grid-cols-3 gap-1.5" role="group" aria-label="Side">
          {(["left", "right", "both"] as const).map((s) => (
            <button key={s} type="button" aria-pressed={side === s} onClick={() => setSide(s)} className={cn("tap min-h-11 rounded-xl border text-sm font-bold capitalize", side === s ? "border-accent bg-accent text-on-accent" : "border-line bg-surface")}>
              {s === "both" ? "Both" : s}
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-2 grid grid-cols-2 gap-2">
        {showReps ? <Stepper label="Reps" value={reps} onChange={setReps} /> : null}
        {showLoad ? <Stepper label="Load" unit={unit} value={load} onChange={setLoad} step={stepLoad} inputMode="decimal" /> : null}
        {showAssist ? <Stepper label="Assist" unit={unit} value={assist} onChange={setAssist} step={stepLoad} inputMode="decimal" /> : null}
        {showSeconds ? <Stepper label={asMinutes ? "Minutes" : "Seconds"} value={secs} onChange={setSecs} step={asMinutes ? 5 : 5} /> : null}
        {showDistance ? (
          <label className="col-span-2 block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-soft">{kind === "cardio" ? "Distance / notes" : "Distance"}</span>
            <input className="field" value={dist} onChange={(e) => setDist(e.target.value)} placeholder={kind === "cardio" ? "e.g. 2.1 mi, incline 6" : "e.g. 25 m"} />
          </label>
        ) : null}
      </div>

      {kind === "timed" ? (
        <div className="mt-2 flex items-center gap-2">
          {holdStart == null ? (
            <Button tone="outline" size="sm" onClick={() => setHoldStart(Date.now())}>
              <Timer className="size-4" /> Start hold timer
            </Button>
          ) : (
            <Button
              tone="sun"
              size="sm"
              onClick={() => {
                setSecs(String(holdElapsed));
                setHoldStart(null);
              }}
            >
              Stop · {formatSeconds(holdElapsed)}
            </Button>
          )}
          <span className="text-xs text-ink-soft">Stopping fills in the seconds. It never logs the set for you.</span>
        </div>
      ) : null}

      <Button size="lg" className="mt-3 w-full" tone={allDone ? "outline" : "primary"} onClick={submit}>
        <Plus className="size-5" /> {slot.sets ? (allDone ? "Log an extra set" : perSide && side !== "both" ? `Log ${side} set` : "Log set") : "Log it"}
      </Button>
    </div>
  );
}

/* ---------------------------------------------------------------- Week */

function WeekScreen() {
  const state = useDaylight();
  const plan = activePlan(state.planVersions, localDate());
  const todayIdx = new Date().getDay();
  const week = [1, 2, 3, 4, 5, 6, 0];
  return (
    <div>
      <PageHead eyebrow={`${plan.name} · v${plan.version}`} title="The week" helper="Pick a day, then start gym or walk the list." />
      <ul className="stagger grid gap-3 md:grid-cols-2">
        {week.map((d) => {
          const day = dayTemplate(plan, d);
          const st = DAY_STYLE[d]!;
          const session = state.sessions.find((s) => s.localDate === localDate() && s.weekday === d);
          const recent = state.sessions.filter((s) => s.weekday === d && s.logs.some((l) => l.status === "done")).slice(-1)[0];
          const muscles = dayMuscles(day).filter((m) => m.weight >= 1).slice(0, 5);
          return (
            <li key={d}>
              <button
                type="button"
                onClick={() => {
                  state.setTrainDay(d);
                  state.setTrainingTab("session");
                }}
                className="card tap w-full overflow-hidden text-left"
              >
                <div className="flex items-center gap-3 border-b border-line bg-surface-2 px-4 py-3">
                  <CalendarDays className="size-5" />
                  <span className="t-title">{WEEKDAY_NAMES[d]}</span>
                  {d === todayIdx ? <Badge tone="sun" className="ml-auto">today</Badge> : null}
                  {session?.status === "finished" ? <Badge tone="forest" className="ml-auto">finished</Badge> : null}
                </div>
                <div className="px-4 py-3">
                  <p className="t-title">{day.scheduled ? day.name : "Open day"}</p>
                  {day.scheduled ? (
                    <>
                      <p className="mt-1 text-sm text-ink-soft">
                        {day.slots.filter((s) => s.section === "activation").length} PT · {day.slots.filter((s) => !["activation", "finisher"].includes(s.section)).length} workout · {day.slots.filter((s) => s.section === "finisher").length} finisher
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {muscles.map((m) => (
                          <span key={m.id} className="rounded-full bg-surface px-2 py-0.5 text-xs font-bold text-ink-soft">
                            {muscleName(m.id)}
                          </span>
                        ))}
                      </div>
                      {recent ? <p className="mt-2 text-xs text-ink-faint">Last logged {recent.localDate}</p> : null}
                    </>
                  ) : (
                    <p className="mt-1 text-sm text-ink-soft">Rest, walk, or prep food.</p>
                  )}
                </div>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button tone="outline" onClick={() => state.setOverlay({ type: "activity" })}>
          <ListChecks className="size-4" /> Log other activity
        </Button>
      </div>
      <ul className="mt-5 space-y-1 text-sm text-ink-soft">
        {state.activities.slice(0, 5).map((a) => (
          <li key={a.id}>
            {a.localDate} · {a.name}
            {a.minutes != null ? ` · ${a.minutes} min` : ""}
            {a.distance ? ` · ${a.distance}` : ""}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------------------------------------------------------- Off-plan / swapped work */

export function ExtrasList({ weekday, session }: { weekday: number; session: WorkoutSession | null }) {
  const state = useDaylight();
  const extras = session?.extras ?? [];
  return (
    <section aria-label="Off-plan and swapped work">
      <div className="mb-2 flex items-center gap-2 px-1">
        <Shuffle className="size-5 text-ink-soft" />
        <h2 className="t-title">Off-plan &amp; swaps</h2>
      </div>
      {extras.length ? (
        <ul className="space-y-2" data-testid="extras-list">
          {extras.map((e) => {
            const slot = e.slotId ? session!.snapshot.find((x) => x.id === e.slotId) : null;
            return (
              <li key={e.id} className="card flex items-start gap-3 p-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{e.name}</p>
                  <p className="text-sm text-ink-soft">
                    {e.kind === "swap" ? "Swapped" : "Did something else"}
                    {slot ? ` instead of ${exerciseLabel(slot.exerciseId)}` : ""}
                    {[e.sets ? `${e.sets} sets` : null, e.reps ? `${e.reps} reps` : null, e.load != null ? `@ ${e.load}` : null, e.minutes ? `${e.minutes} min` : null].filter(Boolean).map((x) => ` · ${x}`).join("")}
                  </p>
                  {e.muscles.length ? <p className="text-xs text-ink-faint">Counts toward: {e.muscles.map((m) => muscleName(m)).join(", ")}</p> : e.exerciseId ? <p className="text-xs text-ink-faint">Counts like {exerciseLabel(e.exerciseId)}</p> : <p className="text-xs text-ink-faint">No muscles chosen, so it is not counted on the heat map.</p>}
                  {e.note ? <p className="mt-0.5 text-sm">{e.note}</p> : null}
                </div>
                <button type="button" aria-label={`Remove ${e.name}`} className="tap grid size-9 place-items-center rounded-full text-ink-faint hover:bg-surface-2" onClick={() => state.removeExtra(e.id)}>
                  <Trash2 className="size-4" />
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="px-1 text-sm text-ink-soft">Skipped a move and did something else? Log it, and it will count on the body map if you pick the muscles.</p>
      )}
      <Button tone="outline" size="sm" className="mt-2" onClick={() => state.setOverlay({ type: "did-else", weekday, slotId: null })}>
        <Plus className="size-4" /> I did something else
      </Button>
    </section>
  );
}
