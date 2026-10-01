import { useState } from "react";
import { WEEKDAY_NAMES, clock, localTime } from "@/lib/daylight/dates";
import { estimateProtein } from "@/lib/daylight/logic";
import { exerciseLabel } from "@/lib/daylight/names";
import { activePlan, dayTemplate, exerciseById } from "@/lib/daylight/plan";
import { chosenExerciseId } from "@/lib/daylight/logic";
import { lessonsForExercise } from "@/lib/daylight/learn";
import { regionById } from "@/lib/daylight/body";
import { useDaylight } from "@/lib/daylight/store";
import { STARTER_PURPOSE } from "@/lib/daylight/types";
import { Button, Drawer, inputClass } from "./ui";
import { BodyFigure } from "./BodyFigure";
import { localDate } from "@/lib/daylight/dates";

export function Overlays() {
  const overlay = useDaylight((s) => s.overlay);
  const setOverlay = useDaylight((s) => s.setOverlay);
  if (!overlay) return null;
  const close = () => setOverlay(null);
  if (overlay.type === "log-food") return <LogFood onClose={close} />;
  if (overlay.type === "log-drink") return <LogDrink onClose={close} />;
  if (overlay.type === "repeat-meal") return <RepeatMeal mealId={overlay.mealId} onClose={close} />;
  if (overlay.type === "choose-meal") return <ChooseMeal onClose={close} />;
  if (overlay.type === "choose-session") return <ChooseSession onClose={close} />;
  if (overlay.type === "purpose") return <Purpose onClose={close} />;
  if (overlay.type === "finish") return <Finish onClose={close} />;
  if (overlay.type === "how" || overlay.type === "why" || overlay.type === "change-exercise" || overlay.type === "exercise-list" || overlay.type === "session-note") {
    return <SessionDetail type={overlay.type} onClose={close} />;
  }
  if (overlay.type === "trial") return <TrialForm observationId={overlay.observationId} onClose={close} />;
  if (overlay.type === "apply") return <ApplyForm trialId={overlay.trialId} onClose={close} />;
  if (overlay.type === "activity") return <ActivityForm onClose={close} />;
  if (overlay.type === "goal") return <GoalForm onClose={close} />;
  if (overlay.type === "add-slot") return <AddSlot weekday={overlay.weekday} onClose={close} />;
  return null;
}

function LogFood({ onClose }: { onClose: () => void }) {
  const drafts = useDaylight((s) => s.drafts);
  const patch = useDaylight((s) => s.patchDraft);
  const logFood = useDaylight((s) => s.logFood);
  const estimate = estimateProtein(drafts.food);
  return (
    <Drawer title="Log food" onClose={onClose}>
      <label className="block">
        <span className="text-base text-ink-soft">What did you eat?</span>
        <textarea className={`${inputClass} mt-1 min-h-24 py-2`} value={drafts.food} onChange={(event) => patch({ food: event.target.value })} />
      </label>
      <p className="mt-2 text-base text-ink-soft">Time defaults to {clock(localTime())}. Protein is optional.</p>
      {estimate.items.length ? (
        <p className="mt-2 text-base">
          Estimate, you can edit: {estimate.total} g ({estimate.items.map((item) => item.label).join(", ")}).
        </p>
      ) : null}
      <label className="mt-3 block">
        <span className="text-base text-ink-soft">Protein grams, optional</span>
        <input
          inputMode="numeric"
          className={`${inputClass} tabular-nums`}
          value={drafts.foodProtein}
          onChange={(event) => patch({ foodProtein: event.target.value, foodEstimate: false })}
        />
      </label>
      <Button
        className="mt-4 w-full"
        onClick={() => {
          const typed = drafts.foodProtein.trim();
          const protein = typed ? Number(typed) : estimate.items.length ? estimate.total : null;
          logFood({
            food: drafts.food,
            mealId: null,
            protein: protein != null && Number.isFinite(protein) ? protein : null,
            estimate: !typed && estimate.items.length > 0,
          });
        }}
      >
        Log as eaten
      </Button>
    </Drawer>
  );
}

function LogDrink({ onClose }: { onClose: () => void }) {
  const drafts = useDaylight((s) => s.drafts);
  const sizes = useDaylight((s) => s.drinkSizes);
  const patch = useDaylight((s) => s.patchDraft);
  const logDrink = useDaylight((s) => s.logDrink);
  return (
    <Drawer title="Log a drink" onClose={onClose}>
      {sizes.length ? (
        <div className="mb-3 flex flex-wrap gap-2">
          {sizes.map((size) => (
            <Button
              key={size.id}
              tone="outline"
              onClick={() => {
                patch({ drinkName: size.name, drinkOz: String(size.ounces), saveDrinkSize: false });
              }}
            >
              {size.name} · {size.ounces} oz
            </Button>
          ))}
        </div>
      ) : (
        <p className="mb-3 text-base text-ink-soft">No saved drink sizes yet. Enter one, and save it if you want it as a button next time.</p>
      )}
      <label className="block">
        <span className="text-ink-soft">Drink</span>
        <input className={inputClass} value={drafts.drinkName} onChange={(event) => patch({ drinkName: event.target.value })} />
      </label>
      <label className="mt-3 block">
        <span className="text-ink-soft">Ounces</span>
        <input inputMode="decimal" className={`${inputClass} tabular-nums`} value={drafts.drinkOz} onChange={(event) => patch({ drinkOz: event.target.value })} />
      </label>
      <label className="mt-3 flex min-h-11 items-center gap-2">
        <input type="checkbox" checked={drafts.saveDrinkSize} onChange={(event) => patch({ saveDrinkSize: event.target.checked })} />
        Save this size
      </label>
      <Button className="mt-3 w-full" onClick={() => logDrink()}>
        Log a drink
      </Button>
    </Drawer>
  );
}

function RepeatMeal({ mealId, onClose }: { mealId: string; onClose: () => void }) {
  const meal = useDaylight((s) => s.savedMeals.find((item) => item.id === mealId));
  const logFood = useDaylight((s) => s.logFood);
  if (!meal) return null;
  return (
    <Drawer title={meal.name} onClose={onClose}>
      <p className="text-base">
        {meal.minutes != null ? `${meal.minutes} min. ` : ""}
        This logs it as eaten now, {clock(localTime())}. It does not change the recipe.
      </p>
      <Button className="mt-4 w-full" onClick={() => logFood({ food: meal.name, mealId: meal.id, protein: null, estimate: false })}>
        Log as eaten
      </Button>
    </Drawer>
  );
}

function ChooseMeal({ onClose }: { onClose: () => void }) {
  const meals = useDaylight((s) => s.savedMeals);
  const setOverlay = useDaylight((s) => s.setOverlay);
  return (
    <Drawer title="Choose a saved meal" onClose={onClose}>
      <ul className="grid gap-2">
        {meals.map((meal) => (
          <li key={meal.id}>
            <button type="button" className="min-h-11 w-full rounded-xl border border-line px-3 text-left" onClick={() => setOverlay({ type: "repeat-meal", mealId: meal.id })}>
              {meal.name}
            </button>
          </li>
        ))}
      </ul>
    </Drawer>
  );
}

function ChooseSession({ onClose }: { onClose: () => void }) {
  const versions = useDaylight((s) => s.planVersions);
  const start = useDaylight((s) => s.startSession);
  const active = useDaylight((s) => s.activeSessionId);
  const plan = activePlan(versions, localDate());
  return (
    <Drawer title="Choose a session" onClose={onClose}>
      {active ? <p>Finish the open session first. A new one will not pile up behind it.</p> : null}
      <ul className="grid gap-2">
        {plan.days.filter((day) => day.scheduled).map((day) => (
          <li key={day.weekday}>
            <button
              type="button"
              disabled={Boolean(active)}
              className="min-h-14 w-full rounded-xl border border-line px-3 text-left disabled:opacity-50"
              onClick={() => start(day.weekday, true)}
            >
              <span className="block text-lg">{WEEKDAY_NAMES[day.weekday]}</span>
              <span className="text-ink-soft">{day.name}</span>
            </button>
          </li>
        ))}
      </ul>
    </Drawer>
  );
}

function Purpose({ onClose }: { onClose: () => void }) {
  const purpose = useDaylight((s) => s.purpose);
  const proposal = useDaylight((s) => s.purposeIsProposal);
  const adopt = useDaylight((s) => s.adoptPurpose);
  const [text, setText] = useState(proposal ? STARTER_PURPOSE : purpose);
  return (
    <Drawer title="What I’m working toward" onClose={onClose}>
      <p className="text-base text-ink-soft">Write your own line. The suggestion below is not a goal you already stated.</p>
      <textarea className={`${inputClass} mt-3 min-h-24 py-2`} value={text} onChange={(event) => setText(event.target.value)} />
      <Button className="mt-3" onClick={() => adopt(text)}>
        {proposal ? "Use this" : "Save"}
      </Button>
    </Drawer>
  );
}

function Finish({ onClose }: { onClose: () => void }) {
  const session = useDaylight((s) => s.sessions.find((item) => item.id === s.activeSessionId));
  const finish = useDaylight((s) => s.finishSession);
  const [note, setNote] = useState(session?.note ?? "");
  if (!session) return null;
  const done = session.logs.filter((log) => log.status === "done");
  return (
    <Drawer title="Finish session" onClose={onClose}>
      <p className="text-base">Completed work stays. Everything else stays not done. No rating.</p>
      <ul className="mt-2 grid gap-1">
        {session.snapshot.map((slot) => {
          const count = done.filter((log) => log.prescriptionId === slot.id).length;
          return (
            <li key={slot.id} className="text-base">
              {exerciseLabel(chosenExerciseId(slot, session.chosenExercise))} · {count} done
            </li>
          );
        })}
      </ul>
      <label className="mt-3 block">
        <span className="text-ink-soft">Note, optional</span>
        <textarea className={`${inputClass} mt-1 min-h-20 py-2`} value={note} onChange={(event) => setNote(event.target.value)} />
      </label>
      <Button className="mt-3 w-full" onClick={() => finish(note)}>
        Done
      </Button>
    </Drawer>
  );
}

function SessionNote({
  sessionDate,
  exerciseId,
  sessionId,
  onClose,
}: {
  sessionDate: string;
  exerciseId: string;
  sessionId: string;
  onClose: () => void;
}) {
  const addObservation = useDaylight((s) => s.addObservation);
  const [note, setNote] = useState("");
  const [regionId, setRegionId] = useState<string | null>(null);
  const region = regionId ? regionById(regionId) : undefined;
  return (
    <div>
      <BodyFigure compact selectedId={regionId} highlighted={regionId ? [regionId] : []} onSelect={setRegionId} />
      <p className="mt-2 text-base text-ink-soft">{region ? `Attached to ${region.name}.` : "Tap a muscle if this note belongs to one."}</p>
      <textarea className={`${inputClass} mt-2 min-h-24 py-2`} value={note} onChange={(event) => setNote(event.target.value)} aria-label="What did you notice?" />
      <Button
        className="mt-3"
        onClick={() => {
          const id = addObservation(note, {
            date: sessionDate,
            time: localTime(),
            exerciseId,
            sessionId,
            ...(regionId ? { regionId } : {}),
          });
          if (id) onClose();
        }}
      >
        Save note
      </Button>
    </div>
  );
}

function SessionDetail({
  type,
  onClose,
}: {
  type: "how" | "why" | "change-exercise" | "exercise-list" | "session-note";
  onClose: () => void;
}) {
  const state = useDaylight();
  const session = state.sessions.find((item) => item.id === state.activeSessionId);
  if (!session) return null;
  const slot = session.snapshot[session.focusSlot];
  const exerciseId = slot ? chosenExerciseId(slot, session.chosenExercise) : "";
  const exercise = exerciseById(exerciseId);
  const title =
    type === "how" ? "How to do it" : type === "why" ? "Why this exercise is here" : type === "change-exercise" ? "Change exercise" : type === "exercise-list" ? "This session" : "Add a note";
  return (
    <Drawer title={title} onClose={onClose}>
      {type === "how" && slot ? (
        <div className="grid gap-3 text-base">
          <p>
            <span className="text-ink-soft">From the PDF: </span>
            {slot.sourceCue ?? "No technique line was copied from the PDF."}
          </p>
          <p>
            <span className="text-ink-soft">General education: </span>
            {exercise?.eduCue ?? "None written for this exercise."}
          </p>
          {exercise?.eduSource ? <p className="text-ink-soft">{exercise.eduSource}</p> : null}
          {lessonsForExercise(exerciseId).length ? (
            <Button tone="outline" onClick={() => state.setOpenLesson(lessonsForExercise(exerciseId)[0]!.id)}>
              Open the lesson
            </Button>
          ) : null}
        </div>
      ) : null}
      {type === "why" && slot ? (
        <div className="text-base">
          <p>{slot.why}</p>
          <p className="mt-2 text-ink-soft">{slot.whySource}</p>
        </div>
      ) : null}
      {type === "change-exercise" && slot ? (
        <div className="grid gap-2">
          <p className="text-base">This choice is for the open session only, unless you also save a new plan version.</p>
          {[slot.exerciseId, ...slot.alternatives.map((alt) => alt.exerciseId)].map((id) => (
            <Button key={id} tone="outline" onClick={() => state.chooseVariant(slot.id, id, false)}>
              {exerciseLabel(id)}
            </Button>
          ))}
          <Button
            tone="quiet"
            onClick={() => {
              state.chooseVariant(slot.id, chosenExerciseId(slot, session.chosenExercise), true);
              state.setTrainingTab("editor");
            }}
          >
            Put this choice in a plan draft
          </Button>
        </div>
      ) : null}
      {type === "exercise-list" ? (
        <ol className="grid gap-2">
          {session.snapshot.map((item, index) => (
            <li key={item.id}>
              <button type="button" className="min-h-11 w-full rounded-xl border border-line px-3 text-left" onClick={() => state.setFocusSlot(index)}>
                {index + 1}. {exerciseLabel(chosenExerciseId(item, session.chosenExercise))}
              </button>
            </li>
          ))}
          {session.snapshot.length === 0 ? <li>No exercises in the snapshot.</li> : null}
        </ol>
      ) : null}
      {type === "session-note" ? (
        <SessionNote sessionDate={session.localDate} exerciseId={exerciseId} sessionId={session.id} onClose={onClose} />
      ) : null}
    </Drawer>
  );
}

function TrialForm({ observationId, onClose }: { observationId: string; onClose: () => void }) {
  const state = useDaylight();
  const observation = state.observations.find((item) => item.id === observationId);
  const active = state.trials.filter((trial) => trial.status === "active");
  const blocked = active.length >= 1 && !state.allowExtraTrial && !active.some((trial) => trial.observationId === observationId && trial.parentTrialId);
  return (
    <Drawer title="Try a change" onClose={onClose}>
      <p className="text-base">
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
            <span className="text-ink-soft">What will I change?</span>
            <textarea className={`${inputClass} mt-1 min-h-20 py-2`} value={state.drafts.trialChange} onChange={(event) => state.patchDraft({ trialChange: event.target.value })} />
          </label>
          <label>
            <span className="text-ink-soft">What would make it helpful?</span>
            <textarea className={`${inputClass} mt-1 min-h-20 py-2`} value={state.drafts.trialHelpful} onChange={(event) => state.patchDraft({ trialHelpful: event.target.value })} />
          </label>
          <label>
            <span className="text-ink-soft">Review date, optional</span>
            <input type="date" className={inputClass} value={state.drafts.trialDate} onChange={(event) => state.patchDraft({ trialDate: event.target.value })} />
          </label>
          <label>
            <span className="text-ink-soft">Kind</span>
            <select className={inputClass} value={state.drafts.trialKind} onChange={(event) => state.patchDraft({ trialKind: event.target.value as "reminder" | "prep" | "plan" })}>
              <option value="reminder">Reminder only</option>
              <option value="prep">Meal prep task</option>
              <option value="plan">Plan version, saved separately</option>
            </select>
          </label>
          <Button onClick={() => state.createTrial(observationId)}>Save trial</Button>
        </div>
      )}
    </Drawer>
  );
}

function ApplyForm({ trialId, onClose }: { trialId: string; onClose: () => void }) {
  const state = useDaylight();
  const trial = state.trials.find((item) => item.id === trialId);
  const task = state.prep.find((item) => item.id === state.drafts.applyPrepId);
  return (
    <Drawer title="Apply change" onClose={onClose}>
      <p className="text-base">This shows the exact prep-task title before and after. Other records stay put.</p>
      <label className="mt-3 block">
        <span className="text-ink-soft">Prep task</span>
        <select className={inputClass} value={state.drafts.applyPrepId} onChange={(event) => state.patchDraft({ applyPrepId: event.target.value, applyTitle: state.prep.find((item) => item.id === event.target.value)?.title ?? "" })}>
          <option value="">Choose</option>
          {state.prep.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title}
            </option>
          ))}
        </select>
      </label>
      <label className="mt-3 block">
        <span className="text-ink-soft">New title</span>
        <input className={inputClass} value={state.drafts.applyTitle} onChange={(event) => state.patchDraft({ applyTitle: event.target.value })} />
      </label>
      {task ? (
        <p className="mt-3 text-base">
          {task.title} → {state.drafts.applyTitle || "…"}
        </p>
      ) : null}
      <p className="mt-2 text-base text-ink-soft">Effective {localDate()}. Trial: {trial?.change}</p>
      <Button className="mt-3" onClick={() => state.applyPrepChange()}>
        Apply change
      </Button>
    </Drawer>
  );
}

function ActivityForm({ onClose }: { onClose: () => void }) {
  const state = useDaylight();
  return (
    <Drawer title="Log activity" onClose={onClose}>
      <div className="grid gap-3">
        <label>
          <span className="text-ink-soft">Name or type</span>
          <input className={inputClass} value={state.drafts.activityName} onChange={(event) => state.patchDraft({ activityName: event.target.value })} />
        </label>
        <label>
          <span className="text-ink-soft">Minutes, optional</span>
          <input inputMode="numeric" className={inputClass} value={state.drafts.activityMinutes} onChange={(event) => state.patchDraft({ activityMinutes: event.target.value })} />
        </label>
        <label>
          <span className="text-ink-soft">Distance, optional</span>
          <input className={inputClass} value={state.drafts.activityDistance} onChange={(event) => state.patchDraft({ activityDistance: event.target.value })} />
        </label>
        <label>
          <span className="text-ink-soft">Effort, optional</span>
          <input className={inputClass} value={state.drafts.activityEffort} onChange={(event) => state.patchDraft({ activityEffort: event.target.value })} />
        </label>
        <label>
          <span className="text-ink-soft">Note, optional</span>
          <input className={inputClass} value={state.drafts.activityNote} onChange={(event) => state.patchDraft({ activityNote: event.target.value })} />
        </label>
        <Button onClick={() => state.logActivity()}>Save activity</Button>
      </div>
    </Drawer>
  );
}

function GoalForm({ onClose }: { onClose: () => void }) {
  const state = useDaylight();
  return (
    <Drawer title="Add a goal" onClose={onClose}>
      <div className="grid gap-3">
        <label>
          <span className="text-ink-soft">Capability</span>
          <input className={inputClass} value={state.drafts.goalName} onChange={(event) => state.patchDraft({ goalName: event.target.value })} />
        </label>
        <label>
          <span className="text-ink-soft">What improvement would look like</span>
          <textarea className={`${inputClass} min-h-20 py-2`} value={state.drafts.goalImprovement} onChange={(event) => state.patchDraft({ goalImprovement: event.target.value })} />
        </label>
        <label>
          <span className="text-ink-soft">How you will notice it, optional</span>
          <input className={inputClass} value={state.drafts.goalCheck} onChange={(event) => state.patchDraft({ goalCheck: event.target.value })} />
        </label>
        <Button onClick={() => state.addGoal()}>Save goal</Button>
      </div>
    </Drawer>
  );
}

function AddSlot({ weekday, onClose }: { weekday: number; onClose: () => void }) {
  const state = useDaylight();
  const day = dayTemplate(state.planDraft ?? activePlan(state.planVersions, localDate()), weekday);
  return (
    <Drawer title={`Add to ${day.name}`} onClose={onClose}>
      <div className="grid gap-3">
        <label>
          <span className="text-ink-soft">Exercise name</span>
          <input className={inputClass} value={state.drafts.slotName} onChange={(event) => state.patchDraft({ slotName: event.target.value })} />
        </label>
        <label>
          <span className="text-ink-soft">Sets, optional</span>
          <input className={inputClass} value={state.drafts.slotSets} onChange={(event) => state.patchDraft({ slotSets: event.target.value })} />
        </label>
        <label>
          <span className="text-ink-soft">Repetitions or time</span>
          <input className={inputClass} value={state.drafts.slotReps} onChange={(event) => state.patchDraft({ slotReps: event.target.value })} />
        </label>
        <label className="flex min-h-11 items-center gap-2">
          <input type="checkbox" checked={state.drafts.slotPerSide} onChange={(event) => state.patchDraft({ slotPerSide: event.target.checked })} />
          Per side
        </label>
        <Button onClick={() => state.addSlot(weekday)}>Add to draft</Button>
      </div>
    </Drawer>
  );
}
