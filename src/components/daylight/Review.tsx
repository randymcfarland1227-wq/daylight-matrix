import { useEffect, useState } from "react";
import { prettyDate, shortDate, localDate } from "@/lib/daylight/dates";
import { useDaylight } from "@/lib/daylight/store";
import { OBSERVATION_TAGS, type Observation } from "@/lib/daylight/types";
import { Button, inputClass } from "./ui";

export function Review() {
  const state = useDaylight();
  const [showAll, setShowAll] = useState(false);
  const [note, setNote] = useState("");
  const open = state.observations.filter((item) => item.status === "open" || item.status === "trial");
  const visible = showAll ? state.observations : open.slice(0, 3);
  const activeTrials = state.trials.filter((trial) => trial.status === "active");
  const today = localDate();

  return (
    <main className="max-w-2xl">
      <h1 className="text-4xl">Review observations</h1>
      <p className="mt-2 text-base text-ink-soft">Notes stay notes until you choose a change. Nothing here edits a workout or a meal by itself.</p>
      {activeTrials.length ? (
        <section className="mt-4 rounded-2xl border border-line bg-surface px-4 py-4">
          <h2 className="text-2xl">Active {activeTrials.length === 1 ? "trial" : "trials"}</h2>
          {activeTrials.map((trial) => {
            const ready = trial.reviewDate && trial.reviewDate <= today;
            const origin = state.observations.find((item) => item.id === trial.observationId);
            const applied = state.appliedChanges.filter((change) => change.trialId === trial.id);
            return (
              <article key={trial.id} className="mt-3 border-t border-line pt-3">
                {ready ? <p className="text-base text-copper-deep">Ready to review</p> : <p className="text-base text-ink-soft">Active</p>}
                <p className="text-base">Observation: {origin?.text}</p>
                <p className="text-base">What would make it helpful: {trial.helpful}</p>
                <p className="text-base">What will I change: {trial.change}</p>
                <p className="text-base text-ink-soft">
                  {trial.kind === "reminder" ? "Reminder only. The plan was not updated." : trial.kind === "prep" ? "Can apply to one prep task." : "Use the plan editor, then save a new version."}
                </p>
                {applied.map((change) => (
                  <p key={change.id} className="mt-1 text-base">
                    Applied {change.effectiveDate}: {change.beforeValue} → {change.afterValue}
                    {change.revertedAt ? " · reverted" : ""}
                  </p>
                ))}
                <div className="mt-2 flex flex-wrap gap-2">
                  {trial.kind === "prep" ? (
                    <Button tone="outline" onClick={() => state.setOverlay({ type: "apply", trialId: trial.id })}>
                      Apply change
                    </Button>
                  ) : null}
                  <Button onClick={() => state.resolveTrial(trial.id, "keep", note)}>Keep this change</Button>
                  <Button tone="outline" onClick={() => state.resolveTrial(trial.id, "revise", note)}>
                    Revise it
                  </Button>
                  <Button tone="outline" onClick={() => state.resolveTrial(trial.id, "end", note)}>
                    End trial
                  </Button>
                  <Button tone="quiet" onClick={() => state.resolveTrial(trial.id, "later", note)}>
                    Review later
                  </Button>
                </div>
                {applied.filter((change) => !change.revertedAt && change.summary === "Meal prep task").map((change) => (
                  <Button key={`revert-${change.id}`} tone="quiet" onClick={() => state.revertChange(change.id)}>
                    Revert “{change.afterValue}” to “{change.beforeValue}”
                  </Button>
                ))}
              </article>
            );
          })}
          <label className="mt-3 block">
            <span className="text-base text-ink-soft">Optional note on the decision</span>
            <input className={inputClass} value={note} onChange={(event) => setNote(event.target.value)} />
          </label>
        </section>
      ) : null}

      <div className="mt-4 flex items-center justify-between">
        <h2 className="text-2xl">{showAll ? "All notes" : "Recent open notes"}</h2>
        <Button tone="quiet" onClick={() => setShowAll((value) => !value)}>
          {showAll ? "Show less" : "Show all"}
        </Button>
      </div>
      {visible.length === 0 ? <p className="mt-2 text-base">No notes yet. Today can hold one whenever you want.</p> : null}
      <ul className="mt-3 grid gap-3">
        {visible.map((item) => (
          <ObservationCard key={item.id} item={item} />
        ))}
      </ul>
    </main>
  );
}

function ObservationCard({ item }: { item: Observation }) {
  const state = useDaylight();
  const sameExercise = item.context.exerciseId
    ? state.observations.filter((other) => other.context.exerciseId === item.context.exerciseId)
    : [item];
  return (
    <li className="rounded-2xl border border-line px-4 py-3">
      <p className="text-base text-ink-soft">{prettyDate(item.context.date)}</p>
      <p className="mt-1 text-lg">{item.text}</p>
      {sameExercise.length > 1 ? (
        <p className="mt-1 text-base text-ink-soft">
          You noted this on {sameExercise.length} days ({sameExercise.map((other) => shortDate(other.context.date)).join(", ")}).
        </p>
      ) : null}
      <div className="mt-2 flex flex-wrap gap-2">
        {OBSERVATION_TAGS.map((tag) => {
          const on = item.tags.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              aria-pressed={on}
              className={`min-h-11 rounded-xl border px-3 text-base ${on ? "border-forest bg-forest text-canvas" : "border-line"}`}
              onClick={() =>
                state.updateObservation(
                  item.id,
                  item.text,
                  on ? item.tags.filter((value) => value !== tag) : [...item.tags, tag],
                )
              }
            >
              {tag}
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button tone="quiet" onClick={() => state.setObservationStatus(item.id, "kept")}>
          Keep as a note
        </Button>
        <Button tone="outline" onClick={() => state.setOverlay({ type: "trial", observationId: item.id })}>
          Try a change
        </Button>
        <Button tone="quiet" onClick={() => state.setObservationStatus(item.id, "reviewed")}>
          Mark reviewed
        </Button>
      </div>
    </li>
  );
}

export function History() {
  const state = useDaylight();
  const [message, setMessage] = useState("");
  const [install, setInstall] = useState<BeforeInstallPromptEvent | null>(null);
  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setInstall(event as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);
  return (
    <main className="max-w-2xl">
      <h1 className="text-4xl">History</h1>
      <p className="mt-2 text-base text-ink-soft">
        {state.saveStatus}. These records stay in this browser. They do not appear on another device unless you export them. Clearing browser storage can erase them.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          tone="outline"
          onClick={() => {
            const blob = new Blob([state.exportJson()], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "daylight-matrix-backup.json";
            link.click();
            URL.revokeObjectURL(url);
          }}
        >
          Export backup
        </Button>
        <label className="inline-flex min-h-11 cursor-pointer items-center rounded-xl border border-line bg-surface px-4">
          Restore backup
          <input
            type="file"
            accept="application/json"
            className="sr-only"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              const text = await file.text();
              if (!window.confirm("Replace the records on this device with this backup?")) return;
              setMessage(state.importJson(text));
            }}
          />
        </label>
        {install ? (
          <Button
            onClick={async () => {
              await install.prompt();
              setInstall(null);
            }}
          >
            Install
          </Button>
        ) : (
          <p className="text-base text-ink-soft">Install appears here when this browser offers it. Otherwise use the browser’s add-to-home-screen control.</p>
        )}
      </div>
      {message ? <p className="mt-2 text-base">{message}</p> : null}
      <h2 className="mt-6 text-2xl">Sessions</h2>
      {state.sessions.length === 0 ? <p className="text-base">No sessions yet.</p> : null}
      <ul className="mt-2 grid gap-3">
        {state.sessions.map((session) => {
          const done = session.logs.filter((log) => log.status === "done").length;
          const skipped = session.logs.filter((log) => log.status === "skipped").length;
          return (
            <li key={session.id} className="rounded-xl border border-line px-3 py-3">
              <p className="text-lg font-semibold">
                {session.name} · {session.localDate}
              </p>
              <p className="text-base text-ink-soft">
                {session.status === "active" ? "Still open" : "Finished"} · {done} sets done · {skipped} skipped marks · unfinished work was left not done
              </p>
              {session.note ? <p className="text-base">{session.note}</p> : null}
            </li>
          );
        })}
      </ul>
      <h2 className="mt-6 text-2xl">Other activity</h2>
      {state.activities.length === 0 ? <p>No other activity logged.</p> : null}
      <ul className="mt-2">
        {state.activities.map((activity) => (
          <li key={activity.id} className="text-base">
            {activity.localDate} · {activity.name}
            {activity.minutes != null ? ` · ${activity.minutes} min` : ""}
            {activity.distance ? ` · ${activity.distance}` : ""}
          </li>
        ))}
      </ul>
      <label className="mt-6 block max-w-xs">
        <span className="text-base text-ink-soft">Load units</span>
        <select className={inputClass} value={state.units} onChange={(event) => state.setUnits(event.target.value as "lb" | "kg")}>
          <option value="lb">Pounds</option>
          <option value="kg">Kilograms</option>
        </select>
      </label>
      <Button tone="quiet" className="mt-4" onClick={() => state.setView("today")}>
        Back to Today
      </Button>
    </main>
  );
}

type BeforeInstallPromptEvent = Event & { prompt: () => Promise<void> };

export function Goals() {
  const state = useDaylight();
  return (
    <main className="max-w-2xl">
      <h1 className="text-4xl">My goals</h1>
      <p className="mt-2 text-base text-ink-soft">Name a capability and what better would look like. This does not create an agility or recovery score.</p>
      {state.goals.length === 0 ? <p className="mt-3 text-base">No goals saved.</p> : null}
      <ul className="mt-3 grid gap-3">
        {state.goals.map((goal) => (
          <li key={goal.id} className="rounded-2xl border border-line px-4 py-3">
            <h2 className="text-2xl">{goal.name}</h2>
            {goal.improvement ? <p className="text-base">Better would look like: {goal.improvement}</p> : null}
            {goal.check ? <p className="text-base text-ink-soft">Check: {goal.check}</p> : null}
          </li>
        ))}
      </ul>
      <Button className="mt-4" onClick={() => state.setOverlay({ type: "goal" })}>
        Add a goal
      </Button>
      <Button tone="quiet" onClick={() => state.setView("today")}>
        Back to Today
      </Button>
    </main>
  );
}
