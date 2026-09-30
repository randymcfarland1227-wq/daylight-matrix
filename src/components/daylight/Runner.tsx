import { useEffect, useState } from "react";
import { exerciseById } from "@/lib/daylight/plan";
import { exerciseLabel } from "@/lib/daylight/names";
import {
  chosenExerciseId,
  currentSetNumber,
  formatSeconds,
  lastPerformance,
  slotFinished,
  targetLine,
} from "@/lib/daylight/logic";
import { useDaylight } from "@/lib/daylight/store";
import type { Side } from "@/lib/daylight/types";
import { Button, inputClass } from "./ui";

export function Runner() {
  const state = useDaylight();
  const session = state.sessions.find((item) => item.id === state.activeSessionId);
  const [, tick] = useState(0);
  useEffect(() => {
    if (!state.timerStartedAt) return;
    const id = window.setInterval(() => tick((n) => n + 1), 1000);
    return () => window.clearInterval(id);
  }, [state.timerStartedAt]);

  if (!session || session.status !== "active") {
    return (
      <main>
        <h1 className="text-4xl">No session open</h1>
        <p className="mt-2 text-base text-ink-soft">Start from Today, or choose a day in the week.</p>
        <Button className="mt-4" onClick={() => state.setTrainingTab("week")}>
          Weekly plan
        </Button>
      </main>
    );
  }

  const slot = session.snapshot[session.focusSlot];
  if (!slot) {
    return (
      <main>
        <p className="text-base text-ink-soft">{session.localDate}</p>
        <h1 className="text-4xl">{session.name}</h1>
        <p className="mt-3 text-base">
          <span className="text-ink-soft">Why this session is in my plan: </span>
          {session.why}
        </p>
        <p className="mt-3 text-base">This session has no imported exercises. You can still leave a note or finish.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button tone="outline" onClick={() => state.setOverlay({ type: "session-note" })}>
            Add a note
          </Button>
          <Button onClick={() => state.setOverlay({ type: "finish" })}>Finish session</Button>
        </div>
      </main>
    );
  }

  const exerciseId = chosenExerciseId(slot, session.chosenExercise);
  const exercise = exerciseById(exerciseId);
  const name = exerciseLabel(exerciseId);
  const finished = slotFinished(session, slot);
  const setNo = currentSetNumber(session, slot);
  const planned = slot.sets;
  const elapsed = timerSeconds(state.timerStartedAt, state.timerAccumulated, state.timerSlotId === slot.id);
  const last = lastPerformance(state.sessions, exerciseId, session.id);
  const cue = exercise?.eduCue;

  return (
    <main>
      <p className="text-base text-ink-soft">
        {session.name} · {session.localDate}
        {session.chosen ? " · chosen today" : ""}
      </p>
      <h1 className="mt-1 text-4xl leading-tight">{name}</h1>
      <p className="mt-3 text-base tabular-nums">
        {planned ? `Set ${setNo} of ${planned}` : "One block"}
        {slot.repLabel ? ` · ${slot.repLabel}${slot.perSide ? " / side" : ""}` : ""}
        {slot.durationLabel ? ` · ${slot.durationLabel}` : ""}
      </p>
      <p className="text-base text-ink-soft">Source target: {targetLine(slot)}</p>
      {slot.optional ? <p className="text-base">Optional in the source.</p> : null}
      {slot.openNote ? <p className="mt-2 text-base">{slot.openNote}</p> : null}

      <p className="mt-4 text-base">
        {cue ?? "No technique line was copied from the PDF for this exercise."}
      </p>

      {last ? (
        <p className="mt-3 text-base">
          <span className="text-ink-soft">Last time: </span>
          {last}
        </p>
      ) : (
        <p className="mt-3 text-base text-ink-soft">Last time: no saved result for this exercise.</p>
      )}

      {slot.perSide ? (
        <div className="mt-4 grid grid-cols-3 gap-2" role="group" aria-label="Side">
          {(
            [
              ["left", "Left"],
              ["right", "Right"],
              ["both", "Both sides"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={state.drafts.side === id}
              className={`min-h-11 rounded-xl border text-base ${state.drafts.side === id ? "border-forest bg-forest text-canvas" : "border-line bg-surface"}`}
              onClick={() => state.patchDraft({ side: id as Side })}
            >
              {label}
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {exercise?.kind !== "cardio" && exercise?.kind !== "mobility" ? (
          <label className="block">
            <span className="text-base text-ink-soft">Repetitions, optional</span>
            <input
              inputMode="numeric"
              className={`${inputClass} tabular-nums text-2xl`}
              value={state.drafts.reps}
              onChange={(event) => state.patchDraft({ reps: event.target.value })}
            />
          </label>
        ) : null}
        <label className="block">
          <span className="text-base text-ink-soft">External load ({state.units}), optional</span>
          <input
            inputMode="decimal"
            className={`${inputClass} tabular-nums text-2xl`}
            value={state.drafts.load}
            onChange={(event) => state.patchDraft({ load: event.target.value })}
          />
        </label>
        {exercise?.usesAssistance || exerciseId === "assisted-pullup" ? (
          <label className="block">
            <span className="text-base text-ink-soft">Assistance ({state.units}), optional</span>
            <input
              inputMode="decimal"
              className={`${inputClass} tabular-nums text-2xl`}
              value={state.drafts.assist}
              onChange={(event) => state.patchDraft({ assist: event.target.value })}
            />
          </label>
        ) : null}
        {exercise?.kind === "distance" || exercise?.kind === "cardio" ? (
          <label className="block">
            <span className="text-base text-ink-soft">Distance, optional</span>
            <input
              className={inputClass}
              value={state.drafts.distance}
              onChange={(event) => state.patchDraft({ distance: event.target.value })}
            />
          </label>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <p className="min-w-24 font-display text-4xl tabular-nums">{formatSeconds(elapsed)}</p>
        {state.timerStartedAt && state.timerSlotId === slot.id ? (
          <Button tone="outline" onClick={() => state.stopTimer()}>
            Stop timer
          </Button>
        ) : (
          <Button tone="outline" onClick={() => state.startTimer()}>
            Start timer
          </Button>
        )}
        <p className="text-base text-ink-soft">Stopping does not mark the set done.</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
        <Button tone="quiet" onClick={() => state.setOverlay({ type: "how" })}>
          How to do it
        </Button>
        <Button tone="quiet" onClick={() => state.setOverlay({ type: "why" })}>
          Why this exercise is here
        </Button>
        <Button tone="quiet" onClick={() => state.setOverlay({ type: "session-note" })}>
          Add a note
        </Button>
        <Button tone="quiet" onClick={() => state.setOverlay({ type: "change-exercise" })}>
          Change exercise
        </Button>
        <Button tone="quiet" onClick={() => state.setOverlay({ type: "exercise-list" })}>
          Show session
        </Button>
        <Button tone="quiet" onClick={() => state.skipExercise()}>
          Skip exercise
        </Button>
      </div>

      {state.undo ? (
        <div className="mt-4 flex items-center gap-3">
          <p className="text-base">{state.undo.label}.</p>
          <Button tone="outline" onClick={() => state.undoLast()}>
            Undo
          </Button>
        </div>
      ) : null}

      <div className="sticky bottom-20 z-10 mt-6 flex flex-col gap-2 border-t border-line bg-canvas/95 py-3 md:bottom-0">
        {finished ? (
          <Button onClick={() => state.nextExercise()} disabled={session.focusSlot >= session.snapshot.length - 1}>
            Next exercise
          </Button>
        ) : (
          <Button className="min-h-14 text-lg" onClick={() => state.markSetDone()}>
            Mark set done
          </Button>
        )}
        <Button tone="quiet" onClick={() => state.setOverlay({ type: "finish" })}>
          Finish session
        </Button>
        <p className="text-base text-ink-soft">{state.saveStatus}</p>
      </div>
    </main>
  );
}

function timerSeconds(startedAt: string | null, accumulated: number, live: boolean): number {
  if (!live || !startedAt) return Math.round(accumulated / 1000);
  return Math.round((accumulated + (Date.now() - new Date(startedAt).getTime())) / 1000);
}
