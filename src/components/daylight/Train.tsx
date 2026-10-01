import { useMemo, useState } from "react";
import { CalendarDays, ChevronDown, Dumbbell, Flag, Info, ListChecks, Pencil, Plus, Repeat2, SkipForward, Timer, Trash2, Undo2, Check } from "lucide-react";
import { WEEKDAY_NAMES, localDate } from "@/lib/daylight/dates";
import { DAY_STYLE } from "@/lib/daylight/theme";
import { exerciseById } from "@/lib/daylight/exercises";
import { exerciseLabel } from "@/lib/daylight/names";
import { activePlan, dayBlocks, dayTemplate } from "@/lib/daylight/plan";
import { chosenExerciseId, doneSetCount, formatSeconds, lastSet, setSummary, slotFinished, slotLogs } from "@/lib/daylight/logic";
import { lessonsForExercise } from "@/lib/daylight/learn";
import { useDaylight } from "@/lib/daylight/store";
import type { DayTemplate, Prescription, TrainingTab, WorkoutSession } from "@/lib/daylight/types";
import { dayMuscles, dayTotalSets, plannedSets } from "@/lib/daylight/volume";
import { muscleName } from "@/lib/daylight/muscles";
import { Badge, Button, Card, Chip, Eyebrow, PageHead, Ring, Segmented, Stepper, cn, haptic, useNow } from "./ui";
import { MuscleChips, useGoToMuscle } from "./MuscleChips";
import { Moves, PlanEditor, PtBoard } from "./TrainExtras";

export function Train() {
  const tab = useDaylight((s) => s.trainingTab);
  const setTab = useDaylight((s) => s.setTrainingTab);
  const norm: TrainingTab = (["session", "week", "moves", "pt", "plan"] as string[]).includes(tab) ? tab : "session";
  return (
    <div>
      <Segmented
        label="Training sections"
        value={norm}
        onChange={(v) => setTab(v as TrainingTab)}
        options={[
          { id: "session", label: "Session" },
          { id: "week", label: "Week" },
          { id: "moves", label: "Moves" },
          { id: "pt", label: "PT board" },
          { id: "plan", label: "Plan" },
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
              "tap relative flex min-h-[3.75rem] min-w-[3.6rem] shrink-0 flex-col items-center justify-center rounded-2xl border px-2 text-sm font-bold",
              active ? "border-transparent text-white shadow-md" : "border-line bg-surface text-ink hover:bg-surface-2",
            )}
            style={active ? { background: st.color } : undefined}
          >
            <span className="text-[0.7rem] uppercase tracking-wider opacity-80">{st.short}</span>
            <span className="text-base">{day?.scheduled ? day.slots.length : "–"}</span>
            {d === todayIdx ? <span className={cn("absolute -top-1 right-1 rounded-full px-1.5 text-[0.6rem] font-extrabold uppercase", active ? "bg-sun text-[#2a1c05]" : "bg-sun/80 text-[#2a1c05]")}>today</span> : null}
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

  const totals = useMemo(() => {
    let target = 0;
    let done = 0;
    for (const slot of slots) {
      if (slot.optional) continue;
      const t = slot.sets ? plannedSets(slot) : 1;
      target += t;
      if (session) {
        const d = slot.sets ? Math.min(doneSetCount(session, slot), t) : slotLogs(session, slot.id).some((l) => l.status === "done") ? 1 : 0;
        done += d;
      }
    }
    return { target, done };
  }, [slots, session]);

  const muscles = dayMuscles({ ...day, slots }).filter((m) => m.weight >= 0.5).slice(0, 7);
  const goMuscle = useGoToMuscle();
  const pct = totals.target ? totals.done / totals.target : 0;
  const finished = session?.status === "finished";

  if (!day.scheduled) {
    return (
      <div>
        <DaySwitcher value={weekday} onChange={state.setTrainDay} plan={plan} />
        <Card className="mt-4 text-center">
          <p className="font-display text-3xl">Open day</p>
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

      <section className="animate-rise relative mt-4 overflow-hidden rounded-[1.5rem] p-5 text-white" style={{ background: `linear-gradient(135deg, ${st.color}, ${st.deep})` }}>
        <svg className="pointer-events-none absolute -right-8 -top-10 size-52 opacity-[0.13]" viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r="22" fill="#fff" />
          {Array.from({ length: 12 }).map((_, i) => (
            <rect key={i} x="48.5" y="6" width="3" height="14" rx="1.5" fill="#fff" transform={`rotate(${i * 30} 50 50)`} />
          ))}
        </svg>
        <div className="relative flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/75">
              {WEEKDAY_NAMES[weekday]} {isToday ? "· today" : "· not today"}
            </p>
            <h1 className="mt-1 text-[1.9rem] font-semibold leading-[1.05]">{day.name}</h1>
            <p className="mt-2 text-sm text-white/80">
              {slots.filter((s) => !s.optional).length} moves · ~{Math.round(dayTotalSets({ ...day, slots }))} planned sets
            </p>
          </div>
          <Ring value={pct} size={76} stroke={8} color="#f6b24f" track="rgba(255,255,255,.25)" label={`${totals.done} of ${totals.target} sets done`}>
            <span className="font-display text-xl text-white">{Math.round(pct * 100)}%</span>
          </Ring>
        </div>
        <div className="relative mt-3 flex flex-wrap gap-1.5" aria-label="Muscles worked today">
          {muscles.map((m) => (
            <button key={m.id} type="button" onClick={() => goMuscle(m.id)} className={cn("tap rounded-full px-2.5 py-1 text-xs font-bold", m.weight >= 1 ? "bg-white/90 text-[#1b2824]" : "border border-white/50 text-white")}>
              {muscleName(m.id)}
            </button>
          ))}
        </div>
        {!isToday ? (
          <p className="relative mt-3 rounded-xl bg-black/20 px-3 py-2 text-sm">You’re looking at {WEEKDAY_NAMES[weekday]}. Anything you log counts for today’s date.</p>
        ) : null}
        {finished ? <p className="relative mt-3 rounded-xl bg-black/20 px-3 py-2 text-sm font-bold">Finished. Logging another set re-opens it.</p> : null}
      </section>

      <div className="mt-5 space-y-6">
        {blocks.map((block, bi) => (
          <section key={block.id} aria-label={block.label}>
            <div className="mb-2 flex items-center gap-2 px-1">
              <span className="grid size-6 place-items-center rounded-full bg-sun text-xs font-extrabold text-[#2a1c05]">{bi + 1}</span>
              <h2 className="font-display text-xl">{block.label}</h2>
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
        {day.reminders.length ? (
          <ul className="space-y-1 px-1 text-sm text-ink-soft">
            {day.reminders.map((r) => (
              <li key={r}>• {r}</li>
            ))}
          </ul>
        ) : null}
        {day.psa ? (
          <section className="rounded-[1.25rem] border border-copper/30 bg-copper/10 p-4">
            <Eyebrow className="text-copper-deep">Day PSA · from your PDF</Eyebrow>
            <p className="mt-1 font-display text-lg leading-snug">{day.psa}</p>
          </section>
        ) : null}
      </div>

      <div className="safe-bottom sticky bottom-[4.9rem] z-10 mt-6 md:bottom-4">
        <div className="flex gap-2 rounded-2xl border border-line bg-canvas/95 p-2 shadow-lg backdrop-blur">
          <Button tone="soft" className="flex-1" onClick={() => state.setOverlay({ type: "note", weekday, kind: "gym" })}>
            <Pencil className="size-4" /> Note
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
  const target = slot.sets ? plannedSets(slot) : 1;
  const doneN = session ? (slot.sets ? doneSetCount(session, slot) : logs.length ? 1 : 0) : 0;
  const complete = session ? slotFinished(session, slot) && !skipped && doneN > 0 : false;
  const noteCount = state.observations.filter((o) => o.context.exerciseId === exerciseId).length;
  const dose = slot.sets
    ? `${slot.sets}${slot.setsMax ? `–${slot.setsMax}` : ""} × ${slot.repLabel}${slot.perSide ? " / side" : ""}`
    : slot.durationLabel ?? slot.repLabel;
  const notes = state.observations.filter((o) => o.context.exerciseId === exerciseId);

  return (
    <article className={cn("card overflow-hidden transition-colors", complete && "border-forest/50 bg-forest/5", skipped && "opacity-60")}>
      <button
        type="button"
        className="tap flex w-full items-center gap-3 p-3.5 text-left"
        aria-expanded={open}
        onClick={() => state.setOpenSlot(open ? null : slot.id, open ? null : exerciseId)}
      >
        <span className={cn("grid size-11 shrink-0 place-items-center rounded-2xl text-lg font-extrabold transition-colors", complete ? "check-pop bg-forest text-on-forest" : "bg-surface-2 text-ink-soft")}>
          {complete ? <Check className="size-6" strokeWidth={3} /> : skipped ? <SkipForward className="size-5" /> : <Dumbbell className="size-5" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-[1.12rem] leading-tight">{name}</span>
          <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-ink-soft">
            <span className="font-bold text-ink">{dose || "Open"}</span>
            {slot.optional ? <Badge>optional</Badge> : null}
            {slot.alternatives.length ? <Badge tone="sun">or {slot.alternatives.length} swap</Badge> : null}
            {ex?.back === "caution" ? <Badge tone="copper">back: go easy</Badge> : null}
            {noteCount ? <Badge tone="teal">{noteCount} note{noteCount > 1 ? "s" : ""}</Badge> : null}
          </span>
          {slot.sets ? (
            <span className="mt-1.5 flex gap-1" aria-label={`${doneN} of ${target} sets done`}>
              {Array.from({ length: Math.ceil(slot.setsMax ?? slot.sets) }).map((_, i) => (
                <span key={i} className={cn("h-1.5 flex-1 max-w-8 rounded-full transition-colors", i < doneN ? "bg-forest" : i < slot.sets! ? "bg-line" : "border border-dashed border-line")} />
              ))}
            </span>
          ) : null}
        </span>
        <ChevronDown className={cn("size-5 shrink-0 text-ink-faint transition-transform", open && "rotate-180")} />
      </button>

      {open ? (
        <div className="animate-rise border-t border-line px-3.5 pb-4 pt-3">
          {slot.sourceCue ? (
            <div className="rounded-xl bg-sun/20 p-3">
              <Eyebrow className="text-copper-deep">Form · from your PDF</Eyebrow>
              <p className="mt-0.5 text-base font-semibold leading-snug">{slot.sourceCue[0]!.toUpperCase() + slot.sourceCue.slice(1)}</p>
            </div>
          ) : null}
          {ex?.pdfNote ? (
            <p className="mt-2 text-sm">
              <span className="font-bold text-copper-deep">Your note on page 2:</span> “{ex.pdfNote}”
            </p>
          ) : null}
          {ex?.eduCue ? (
            <p className="mt-2 text-sm text-ink-soft">
              <span className="font-bold">General education (not from the PDF):</span> {ex.eduCue}
            </p>
          ) : null}
          {ex?.backNote ? (
            <p className="mt-2 flex items-start gap-1.5 text-sm text-ink-soft">
              <Info className="mt-0.5 size-4 shrink-0 text-teal" />
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
                  <span className="grid size-6 place-items-center rounded-full bg-forest text-xs font-extrabold text-on-forest">{i + 1}</span>
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
                <li key={n.id} className="rounded-xl border border-teal/30 bg-teal/10 px-3 py-1.5 text-sm">
                  <span className="text-ink-faint">{n.context.date.slice(5)} · </span>
                  {n.text}
                  {n.forNextPlan ? <span className="ml-1 text-copper-deep">★</span> : null}
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
    <div className="mt-4 rounded-2xl bg-surface-2 p-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold">
          {allDone ? "All sets logged" : slot.sets ? `Set ${nextNo} of ${slot.sets}${slot.setsMax ? `–${slot.setsMax}` : ""}` : "Log it"}
        </p>
        {last ? <p className="text-xs text-ink-soft">Last ({prev!.date.slice(5)}): {setSummary(last)}</p> : <p className="text-xs text-ink-faint">No previous result yet</p>}
      </div>

      {perSide ? (
        <div className="mt-2 grid grid-cols-3 gap-1.5" role="group" aria-label="Side">
          {(["left", "right", "both"] as const).map((s) => (
            <button key={s} type="button" aria-pressed={side === s} onClick={() => setSide(s)} className={cn("tap min-h-11 rounded-xl border text-sm font-bold capitalize", side === s ? "border-forest bg-forest text-on-forest" : "border-line bg-surface")}>
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
      <PageHead eyebrow={`${plan.name} · v${plan.version}`} title="The week" />
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
                <div className="flex items-center gap-3 px-4 py-3 text-white" style={{ background: `linear-gradient(120deg, ${st.color}, ${st.deep})` }}>
                  <CalendarDays className="size-5" />
                  <span className="font-display text-lg">{WEEKDAY_NAMES[d]}</span>
                  {d === todayIdx ? <Badge tone="sun" className="ml-auto">today</Badge> : null}
                  {session?.status === "finished" ? <Badge tone="forest" className="ml-auto bg-white/90">finished</Badge> : null}
                </div>
                <div className="px-4 py-3">
                  <p className="font-display text-xl leading-tight">{day.scheduled ? day.name : "Open day"}</p>
                  {day.scheduled ? (
                    <>
                      <p className="mt-1 text-sm text-ink-soft">
                        {day.slots.filter((s) => s.section === "activation").length} PT · {day.slots.filter((s) => !["activation", "finisher"].includes(s.section)).length} workout · {day.slots.filter((s) => s.section === "finisher").length} finisher
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {muscles.map((m) => (
                          <span key={m.id} className="rounded-full bg-copper/15 px-2 py-0.5 text-[0.7rem] font-bold text-copper-deep">
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
