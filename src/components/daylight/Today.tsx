import { useState } from "react";
import { localDate, prettyDate, todayLabel } from "@/lib/daylight/dates";
import { progressLabel } from "@/lib/daylight/logic";
import { exerciseLabel } from "@/lib/daylight/names";
import { activePlan, dayTemplate } from "@/lib/daylight/plan";
import { chosenExerciseId } from "@/lib/daylight/logic";
import { useDaylight } from "@/lib/daylight/store";
import { Button, Panel } from "./ui";
import { BodyFigure } from "./BodyFigure";
import { regionById } from "@/lib/daylight/body";

export function Today() {
  const state = useDaylight();
  const today = localDate();
  const plan = activePlan(state.planVersions, today);
  const day = dayTemplate(plan, new Date().getDay());
  const active = state.sessions.find((session) => session.id === state.activeSessionId) ?? null;
  const lastMealLog = [...state.foodLogs].reverse().find((log) => log.mealId);
  const lastMeal = state.savedMeals.find((meal) => meal.id === lastMealLog?.mealId);
  const openNotes = state.observations.filter((item) => item.status === "open").length;

  return (
    <main>
      <header className="mb-5 flex items-end justify-between gap-3">
        <div>
          <p className="text-base text-ink-soft">Today · {prettyDate(today)}</p>
          <h1 className="text-3xl leading-none text-ink">Daylight</h1>
        </div>
        <Button tone="quiet" onClick={() => state.setView("history")}>
          History
        </Button>
      </header>

      <PurposeLine />

      <div className="mt-5 grid gap-4">
        <Panel
          kicker="Training"
          title={active && active.localDate !== today ? active.name : day.scheduled ? day.name : "No session scheduled"}
          action={
            <button
              type="button"
              onClick={() => state.setView("body")}
              className="tap min-h-11 rounded-xl border border-line bg-surface px-3 text-sm font-semibold"
            >
              Open body
            </button>
          }
        >
          {active && active.localDate !== today ? (
            <>
              <p className="text-base text-ink-soft">
                Started {todayLabel(active.localDate)}. It stays on that day.
              </p>
              <p className="mt-2 text-base">{progressLabel(active)}</p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Button onClick={() => state.setTrainingTab("runner")}>Resume</Button>
                <Button tone="outline" onClick={() => state.setOverlay({ type: "finish" })}>
                  Finish session
                </Button>
              </div>
              <p className="mt-3 text-base text-ink-soft">Today on the plan: {day.scheduled ? day.name : "No session scheduled"}.</p>
            </>
          ) : active ? (
            <>
              <p className="text-base">
                <span className="text-ink-soft">Why this session is in my plan: </span>
                {active.why}
              </p>
              <p className="mt-2 text-base">{progressLabel(active)}</p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Button onClick={() => state.setTrainingTab("runner")}>Resume session</Button>
                <Button tone="quiet" onClick={() => state.setTrainingTab("pt")}>
                  Physical therapy
                </Button>
              </div>
            </>
          ) : day.scheduled ? (
            <>
              <p className="text-base">
                <span className="text-ink-soft">Why this session is in my plan: </span>
                {day.why}
              </p>
              {day.slots.length === 0 ? (
                <p className="mt-2 text-base text-ink-soft">
                  The day name is imported. Its exercise list was not in the written handoff, so nothing was invented to fill it.
                </p>
              ) : null}
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Button onClick={() => state.startSession(day.weekday, false)}>Start session</Button>
                <Button tone="quiet" onClick={() => state.setTrainingTab("pt")}>
                  Physical therapy
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-base">No session scheduled.</p>
              <div className="mt-4">
                <Button onClick={() => state.setOverlay({ type: "choose-session" })}>Choose a session</Button>
              </div>
            </>
          )}
        </Panel>

        <Panel kicker="Food" title={lastMeal ? lastMeal.name : "Nothing ready to repeat"}>
          {lastMeal ? (
            <div className="flex flex-wrap items-center gap-3">
              <Button
                tone="outline"
                onClick={() => state.setOverlay({ type: "repeat-meal", mealId: lastMeal.id })}
              >
                Repeat this meal
              </Button>
            </div>
          ) : (
            <p className="text-base text-ink-soft">A repeated meal shows up here after you log one.</p>
          )}
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
            <Button tone={lastMeal ? "quiet" : "primary"} onClick={() => state.setView("food")}>
              Choose something to eat
            </Button>
            <Button tone="quiet" onClick={() => state.setOverlay({ type: "log-food" })}>
              Log food
            </Button>
            <Button tone="quiet" onClick={() => state.setOverlay({ type: "log-drink" })}>
              Log a drink
            </Button>
          </div>
        </Panel>

        <NotesCard />
      </div>

      <footer className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-base">
        <Button tone="quiet" onClick={() => state.setView("goals")}>
          My goals
        </Button>
        <Button tone="quiet" onClick={() => state.setView("review")}>
          Review observations{openNotes ? ` · ${openNotes} open` : ""}
        </Button>
        <p className="text-ink-soft">{state.saveStatus}. Export a backup from History. Clearing this browser can erase logs.</p>
      </footer>
      {active ? (
        <p className="sr-only">
          Current exercise {exerciseLabel(chosenExerciseId(active.snapshot[active.focusSlot]!, active.chosenExercise))}
        </p>
      ) : null}
    </main>
  );
}

function PurposeLine() {
  const purpose = useDaylight((s) => s.purpose);
  const proposal = useDaylight((s) => s.purposeIsProposal);
  const setOverlay = useDaylight((s) => s.setOverlay);
  return (
    <div className="border-t border-line pt-3">
      <p className="text-base">
        <span className="text-ink-soft">What I’m working toward: </span>
        {purpose}
      </p>
      {proposal ? (
        <p className="mt-1 text-base text-ink-soft">A starting line you can change. It is not a goal you already wrote.</p>
      ) : null}
      <Button tone="quiet" onClick={() => setOverlay({ type: "purpose" })}>
        Edit
      </Button>
    </div>
  );
}

function NotesCard() {
  const observations = useDaylight((s) => s.observations);
  const sessions = useDaylight((s) => s.sessions);
  const addObservation = useDaylight((s) => s.addObservation);
  const setView = useDaylight((s) => s.setView);
  const today = localDate();
  const [text, setText] = useState("");
  const [regionId, setRegionId] = useState<string | null>(null);
  const region = regionId ? regionById(regionId) : undefined;

  const notes = [
    ...observations.map((item) => ({
      id: item.id,
      text: item.text,
      when: item.context.date === today ? item.context.time : item.context.date,
      where: item.context.regionId ? regionById(item.context.regionId)?.name ?? "Muscle" : item.context.exerciseId ? "This lift" : "General",
    })),
    ...sessions
      .filter((session) => session.note.trim())
      .map((session) => ({
        id: `session-${session.id}`,
        text: session.note,
        when: session.localDate,
        where: session.name,
      })),
  ];

  return (
    <Panel kicker="Notes" title="What did you notice?">
      <div className="grid gap-4 md:grid-cols-[16rem_minmax(0,1fr)] md:items-start">
        <BodyFigure compact selectedId={regionId} highlighted={regionId ? [regionId] : []} onSelect={setRegionId} />
        <div>
          <p className="text-base text-ink-soft">
            {region ? `Note for ${region.name}.` : "Tap a muscle, or leave this as a general note."}
          </p>
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={3}
            className="mt-2 min-h-24 w-full rounded-xl border border-line bg-canvas px-3 py-3 text-base text-ink"
            aria-label="What did you notice?"
          />
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <Button
              onClick={() => {
                const id = addObservation(text, {
                  date: today,
                  time: new Date().toTimeString().slice(0, 5),
                  ...(regionId ? { regionId } : {}),
                });
                if (id) setText("");
              }}
            >
              Add note
            </Button>
            <Button tone="quiet" onClick={() => setView("review")}>
              Review observations
            </Button>
          </div>
          <ul className="mt-4 divide-y divide-line" aria-label="All notes">
            {notes.length === 0 ? <li className="py-3 text-base text-ink-soft">Nothing logged yet.</li> : null}
            {notes.map((note) => (
              <li key={note.id} className="py-3">
                <p className="text-sm font-semibold text-forest">
                  {note.where} · {note.when}
                </p>
                <p className="text-base">{note.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Panel>
  );
}
