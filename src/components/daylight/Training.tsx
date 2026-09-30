import { WEEKDAY_NAMES, localDate, prettyDate } from "@/lib/daylight/dates";
import { exerciseLabel } from "@/lib/daylight/names";
import { IMPORT_NOTES, PT_REFERENCES, UNSCHEDULED, activePlan, dayTemplate, exerciseById } from "@/lib/daylight/plan";
import { chosenExerciseId, targetLine } from "@/lib/daylight/logic";
import { useDaylight } from "@/lib/daylight/store";
import type { TrainingTab } from "@/lib/daylight/types";
import { Button, inputClass } from "./ui";
import { Runner } from "./Runner";

export function Training() {
  const tab = useDaylight((s) => s.trainingTab);
  const setTab = useDaylight((s) => s.setTrainingTab);
  return (
    <main>
      <h1 className="text-4xl">Training</h1>
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Training sections">
        {(
          [
            ["week", "Week"],
            ["runner", "Session"],
            ["pt", "Physical therapy"],
            ["library", "Library"],
            ["editor", "Edit plan"],
            ["import", "Import notes"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className={`min-h-11 shrink-0 rounded-xl px-3 text-base ${tab === id ? "bg-forest text-canvas" : "bg-surface text-ink"}`}
            onClick={() => setTab(id as TrainingTab)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="mt-5">
        {tab === "week" ? <Week /> : null}
        {tab === "runner" ? <Runner /> : null}
        {tab === "pt" ? <PhysicalTherapy /> : null}
        {tab === "library" ? <Library /> : null}
        {tab === "editor" ? <Editor /> : null}
        {tab === "import" ? <ImportNotes /> : null}
      </div>
    </main>
  );
}

function Week() {
  const state = useDaylight();
  const today = localDate();
  const plan = activePlan(state.planVersions, today);
  const todayIndex = new Date().getDay();
  return (
    <div>
      <p className="text-base text-ink-soft">
        {plan.name} · version {plan.version}
      </p>
      <ul className="mt-4 grid gap-3">
        {plan.days.map((day) => {
          const isToday = day.weekday === todayIndex;
          return (
            <li key={day.weekday} className="rounded-2xl border border-line bg-surface px-4 py-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-2xl">
                  {WEEKDAY_NAMES[day.weekday]}
                  {isToday ? " · today" : ""}
                </h2>
                <p className="text-base text-ink-soft">{day.slots.length ? `${day.slots.length} imported slots` : "No exercises imported"}</p>
              </div>
              <p className="mt-1 text-base">{day.scheduled ? day.name : "No session scheduled"}</p>
              <p className="mt-1 text-base text-ink-soft">{day.why}</p>
              {day.reminders.map((reminder) => (
                <p key={reminder} className="mt-1 text-base">
                  {reminder}
                </p>
              ))}
              {day.scheduled ? (
                <Button className="mt-3" tone={isToday ? "primary" : "outline"} onClick={() => state.startSession(day.weekday, !isToday)} disabled={Boolean(state.activeSessionId)}>
                  {isToday ? "Start session" : "Choose this session"}
                </Button>
              ) : (
                <p className="mt-2 text-base">Nothing is assigned.</p>
              )}
            </li>
          );
        })}
      </ul>
      {state.activeSessionId ? (
        <p className="mt-3 text-base">A session is already open. Finish it before starting another.</p>
      ) : null}
      <Button tone="quiet" className="mt-3" onClick={() => state.setOverlay({ type: "activity" })}>
        Log activity
      </Button>
    </div>
  );
}

function PhysicalTherapy() {
  const notes = useDaylight((s) => s.ptNotes);
  const setPtNote = useDaylight((s) => s.setPtNote);
  const setOpenLesson = useDaylight((s) => s.setOpenLesson);
  return (
    <div>
      <p className="text-base">
        Page 2 of the PDF is a personal reference board. It is not the weekly schedule, and it is not treated as a clinician’s prescription unless you record a provider.
      </p>
      <ul className="mt-4 grid gap-3">
        {PT_REFERENCES.map((ref) => {
          const exercise = exerciseById(ref.exerciseId);
          return (
            <li key={ref.id} className="rounded-2xl border border-line bg-surface px-4 py-3">
              <h2 className="text-2xl">{exercise?.name}</h2>
              <p className="text-base text-ink-soft">{ref.page}</p>
              <p className="mt-2 text-base">{ref.parameters}</p>
              {ref.discrepancy ? <p className="mt-2 text-base text-copper-deep">{ref.discrepancy}</p> : null}
              <p className="mt-2 text-base text-ink-soft">{ref.provider}</p>
              <label className="mt-3 block">
                <span className="text-base text-ink-soft">Your note</span>
                <textarea
                  className={`${inputClass} mt-1 min-h-20 py-2`}
                  value={notes[ref.id] ?? ""}
                  onChange={(event) => setPtNote(ref.id, event.target.value)}
                />
              </label>
              <Button tone="quiet" onClick={() => setOpenLesson(exercise?.id ?? null)}>
                Learn
              </Button>
            </li>
          );
        })}
      </ul>
      <section className="mt-4 rounded-2xl border border-line px-4 py-3">
        <h2 className="text-2xl">Unscheduled</h2>
        <p className="mt-2 text-base">
          {exerciseById(UNSCHEDULED.exerciseId)?.name}. {UNSCHEDULED.note}
        </p>
      </section>
    </div>
  );
}

function Library() {
  const plan = activePlan(useDaylight((s) => s.planVersions), localDate());
  const ids = new Set<string>();
  for (const day of plan.days) {
    for (const slot of day.slots) {
      ids.add(slot.exerciseId);
      for (const alt of slot.alternatives) ids.add(alt.exerciseId);
    }
  }
  for (const ref of PT_REFERENCES) ids.add(ref.exerciseId);
  ids.add(UNSCHEDULED.exerciseId);
  const setOpenLesson = useDaylight((s) => s.setOpenLesson);
  return (
    <ul className="grid gap-2">
      {[...ids].map((id) => {
        const exercise = exerciseById(id);
        return (
          <li key={id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-surface px-3 py-2">
            <div>
              <p className="text-base font-semibold">{exerciseLabel(id)}</p>
              <p className="text-base text-ink-soft">{exercise?.kind ?? "custom"}{exercise?.unilateral ? " · per side" : ""}</p>
            </div>
            <Button tone="quiet" onClick={() => setOpenLesson(id)}>
              Learn
            </Button>
          </li>
        );
      })}
    </ul>
  );
}

function Editor() {
  const state = useDaylight();
  const draft = state.planDraft;
  const plan = draft ?? activePlan(state.planVersions, state.drafts.planDate || localDate());
  const day = dayTemplate(plan, state.editorWeekday);
  return (
    <div>
      <p className="text-base text-ink-soft">
        Edits sit in a draft until you save a new version. Version 1 and past sessions stay as they were.
      </p>
      {!draft ? (
        <Button className="mt-3" tone="outline" onClick={() => state.ensureDraft()}>
          Start a draft
        </Button>
      ) : (
        <p className="mt-2 text-base">Draft in progress. It is not the active plan yet.</p>
      )}
      <div className="mt-4 flex gap-2 overflow-x-auto">
        {WEEKDAY_NAMES.map((name, index) => (
          <button
            key={name}
            type="button"
            className={`min-h-11 shrink-0 rounded-xl px-3 ${state.editorWeekday === index ? "bg-ink text-canvas" : "bg-surface"}`}
            onClick={() => state.setEditorWeekday(index)}
          >
            {name.slice(0, 3)}
          </button>
        ))}
      </div>
      <h2 className="mt-4 text-2xl">{day.name}</h2>
      <ul className="mt-3 grid gap-2">
        {day.slots.map((slot, index) => (
          <li key={slot.id} className="rounded-xl border border-line bg-surface px-3 py-3">
            <p className="text-base font-semibold">{exerciseLabel(chosenExerciseId(slot, {}))}</p>
            <p className="text-base text-ink-soft">{targetLine(slot)}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button tone="outline" onClick={() => state.moveSlot(state.editorWeekday, index, -1)} aria-label="Move earlier">
                Move up
              </Button>
              <Button tone="outline" onClick={() => state.moveSlot(state.editorWeekday, index, 1)} aria-label="Move later">
                Move down
              </Button>
              <Button tone="quiet" onClick={() => state.removeSlot(state.editorWeekday, index)}>
                Remove from draft
              </Button>
            </div>
          </li>
        ))}
      </ul>
      <Button className="mt-3" tone="outline" onClick={() => state.setOverlay({ type: "add-slot", weekday: state.editorWeekday })}>
        Add an exercise
      </Button>
      <div className="mt-5 grid gap-3">
        <label>
          <span className="text-base text-ink-soft">Effective date</span>
          <input
            type="date"
            className={inputClass}
            value={state.drafts.planDate}
            onChange={(event) => state.patchDraft({ planDate: event.target.value })}
          />
        </label>
        <label>
          <span className="text-base text-ink-soft">Reason, optional</span>
          <input
            className={inputClass}
            value={state.drafts.planReason}
            onChange={(event) => state.patchDraft({ planReason: event.target.value })}
          />
        </label>
        <Button onClick={() => state.savePlanVersion(null)} disabled={!draft}>
          Save new plan version
        </Button>
        {draft ? (
          <Button tone="quiet" onClick={() => state.discardDraft()}>
            Discard draft
          </Button>
        ) : null}
      </div>
      <h2 className="mt-6 text-2xl">Versions</h2>
      <ul className="mt-2 grid gap-2">
        {state.planVersions.map((version) => (
          <li key={version.id} className="text-base">
            Version {version.version} · from {prettyDate(version.effectiveDate)}. {version.reason}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ImportNotes() {
  return (
    <div>
      <h2 className="text-2xl">What was imported</h2>
      <ul className="mt-3 grid list-disc gap-2 pl-5">
        {IMPORT_NOTES.map((note) => (
          <li key={note} className="text-base">
            {note}
          </li>
        ))}
      </ul>
      <p className="mt-4 text-base text-ink-soft">
        The original PDF is not embedded. Its artwork is watermarked third-party work, so this app keeps the quoted schedule instead of the pictures.
      </p>
    </div>
  );
}
