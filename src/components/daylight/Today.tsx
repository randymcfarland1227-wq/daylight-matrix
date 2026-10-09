import {
  ArrowRight,
  Check,
  Dumbbell,
  Footprints,
  MapPin,
  PenLine,
  Play,
  Utensils,
} from "lucide-react";
import { localDate, prettyDate, recordDate } from "@/lib/daylight/dates";
import { mealReady, progressLabel, sessionProgress } from "@/lib/daylight/logic";
import { activePlan, dayBlocks, dayTemplate } from "@/lib/daylight/plan";
import { useDaylight } from "@/lib/daylight/store";
import { exerciseById } from "@/lib/daylight/exercises";
import { photosFor } from "@/lib/daylight/exImages";
import { noteArea, observationsForArea } from "@/lib/daylight/bodyNotes";
import { muscleName } from "@/lib/daylight/muscles";
import { useFoodNumbers } from "./Food";
import { MapFigure } from "./MapFigure";
import { Badge, Button, Eyebrow } from "./ui";

export function Today() {
  const s = useDaylight();
  const today = localDate();
  const weekday = new Date().getDay();
  const day = dayTemplate(activePlan(s.planVersions, today), weekday);
  const session = s.sessions.find((x) => x.localDate === today && x.weekday === weekday) ?? null;
  const slots = session?.snapshot ?? day.slots;
  const progress = sessionProgress(slots, session);
  const blocks = dayBlocks(day, slots);
  const completedFraction = progress.total ? progress.completed / progress.total : 0;
  const featured =
    slots.find(
      (slot) => slot.section === "main" && photosFor(slot.exerciseId)?.match === "exact",
    ) ?? slots.find((slot) => photosFor(slot.exerciseId)?.match === "exact");
  const featuredExercise = featured ? exerciseById(featured.exerciseId) : null;
  const featuredPhoto = featured ? photosFor(featured.exerciseId) : undefined;
  const food = useFoodNumbers();
  const lastLog = [...s.foodLogs].reverse().find((x) => x.mealId);
  const lastMeal = s.savedMeals.find((m) => m.id === lastLog?.mealId);
  const ready = s.savedMeals.find((m) => mealReady(m, s.inventory));
  const repeat = lastMeal ?? ready ?? s.savedMeals.find((m) => m.pinned);
  const latest = observationsForArea(s.observations)[0];
  const flagged = s.observations.filter((x) => x.forNextPlan).length;
  const hasWork = Boolean(session?.logs.length);
  const finished = session?.status === "finished";
  const overview = () => {
    s.setTrainDay(weekday);
    s.setTrainingTab("session");
  };
  const body = (area?: string) => {
    s.setBody({ bodyWorkspace: "journal", selectedMuscleId: area ?? null });
    s.setView("body");
  };
  return (
    <div className="daily-page">
      <header className="daily-heading">
        <div>
          <Eyebrow>{prettyDate(today)}</Eyebrow>
          <h1>Today</h1>
          <p>Move well. Eat with less effort. Notice what helps.</p>
        </div>
        <Button tone="outline" size="sm" onClick={() => s.setOverlay({ type: "activity" })}>
          <Footprints className="size-4" />
          Log activity
        </Button>
      </header>
      <button
        type="button"
        className="daily-purpose"
        onClick={() => s.setOverlay({ type: "purpose" })}
      >
        <span className="purpose-icon">
          <Footprints className="size-4" />
        </span>
        <span>
          <b>My reason</b>
          <span>
            {s.purposeIsProposal
              ? "Set the reason behind your training and daily habits."
              : s.purpose}
          </span>
        </span>
        <PenLine className="size-4 shrink-0" />
      </button>
      <div className="today-workspace">
        <section className="session-dashboard" aria-label="Today's session">
          <div className="dashboard-label">
            <Dumbbell className="size-4" />
            <Eyebrow>Today’s training</Eyebrow>
            <Badge className="ml-auto">
              {finished ? "Finished" : hasWork ? "In progress" : "Your plan"}
            </Badge>
          </div>
          <h2>{day.scheduled ? day.name : "An open day"}</h2>
          <p className="text-sm text-ink-soft mt-2">
            {day.scheduled
              ? `${progress.total} required exercises${slots.some((x) => x.optional) ? " · optional work available" : ""}`
              : "Choose a session or record another activity."}
          </p>
          {day.scheduled ? (
            <>
              <div
                className="session-stages"
                style={{ gridTemplateColumns: `repeat(${blocks.length}, minmax(0,1fr))` }}
              >
                {blocks.map((block, i) => (
                  <div key={block.id}>
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    <b>
                      {block.id === "activation"
                        ? "Activate"
                        : block.id === "workout"
                          ? "Main work"
                          : "Finish"}
                    </b>
                    <small>
                      {block.slots.length
                        ? `${block.slots.length} ${block.slots.length === 1 ? "exercise" : "exercises"}`
                        : (day.sectionNote?.finisher ?? "None scheduled")}
                    </small>
                  </div>
                ))}
              </div>
              <div className="session-reason">
                <Eyebrow>Keep in mind</Eyebrow>
                <p>{day.psa || day.why}</p>
              </div>
              {hasWork ? (
                <div className="session-progress">
                  <div>
                    <span>
                      {progress.completed} of {progress.total} exercises completed
                    </span>
                    <span>{Math.round(completedFraction * 100)}%</span>
                  </div>
                  <progress max="1" value={completedFraction} aria-label="Session completion" />
                  {!finished ? <p>{progressLabel(session!)}</p> : null}
                </div>
              ) : null}
              <div className="session-actions">
                <Button
                  size="lg"
                  data-testid="start-gym"
                  onClick={finished ? overview : () => s.setGymMode(weekday)}
                >
                  {finished ? (
                    <Check className="size-4" />
                  ) : (
                    <Play className="size-4" fill="currentColor" />
                  )}
                  {finished ? "Review session" : hasWork ? "Resume session" : "Start session"}
                  <ArrowRight className="size-4" />
                </Button>
                <Button tone="ghost" onClick={overview}>
                  View exercises
                </Button>
              </div>
            </>
          ) : (
            <Button className="mt-5" onClick={() => s.setTrainingTab("week")}>
              Choose a session
              <ArrowRight className="size-4" />
            </Button>
          )}
          {featuredPhoto && featured ? (
            <button
              type="button"
              className="daily-form-reference"
              onClick={() => s.setOverlay({ type: "form", exerciseId: featured.exerciseId })}
            >
              <img
                src={featuredPhoto.images[0]}
                alt={`${featuredExercise?.name}: starting position`}
              />
              <span>
                <small>Form reference</small>
                <b>{featuredExercise?.name}</b>
                <span>Photos, video and cues</span>
              </span>
              <Play className="size-5 ml-auto shrink-0" />
            </button>
          ) : null}
          <div className="session-links">
            <button
              type="button"
              onClick={() => {
                s.setTrainDay(weekday);
                s.setTrainingTab("pt");
              }}
            >
              <Footprints className="size-4" />
              Physical therapy
              <ArrowRight className="size-3.5 ml-auto" />
            </button>
            <button
              type="button"
              onClick={() => {
                s.setBody({ bodyWorkspace: "training", bodyMode: "plan", selectedMuscleId: null });
                s.setView("body");
              }}
            >
              <Dumbbell className="size-4" />
              Training coverage
              <ArrowRight className="size-3.5 ml-auto" />
            </button>
          </div>
        </section>
        <section className="daily-body" aria-label="Body check-in">
          <div className="dashboard-label">
            <MapPin className="size-4" />
            <Eyebrow>Body check-in</Eyebrow>
          </div>
          <h2>How does your body feel?</h2>
          <p className="mt-2 text-sm text-ink-soft">Choose an area. Save what you notice.</p>
          <div className="daily-mini-map">
            {(["front", "back"] as const).map((view) => (
              <MapFigure
                key={view}
                view={view}
                level="region"
                fill={() => "var(--journal-idle)"}
                onSelect={(id) => body(id)}
                className="h-48 w-auto"
              />
            ))}
          </div>
          <Button tone="outline" className="w-full" onClick={() => body()}>
            Open body journal
            <ArrowRight className="size-4" />
          </Button>
          {latest ? (
            <button
              type="button"
              className="daily-latest-note"
              onClick={() => body(noteArea(latest)!)}
            >
              <small>
                {muscleName(noteArea(latest)!)} · {recordDate(latest.context.date)}
              </small>
              <span>{latest.text}</span>
            </button>
          ) : (
            <p className="mt-4 text-xs text-ink-soft">
              Your dated observations help you spot changes and decide what to review.
            </p>
          )}
        </section>
        <section className="daily-food" aria-label="Food today">
          <div className="dashboard-label">
            <Utensils className="size-4" />
            <Eyebrow>Food today</Eyebrow>
          </div>
          <div className="daily-food-content">
            <div>
              <h2>{repeat ? repeat.name : "Make your next meal easier"}</h2>
              <p className="mt-2 text-sm text-ink-soft">
                {repeat
                  ? lastMeal
                    ? "A familiar meal you’ve logged before."
                    : "One of your saved meals."
                  : "Meals, ingredients, shopping and prep—all together."}
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                {repeat ? (
                  <Button onClick={() => s.setOverlay({ type: "repeat-meal", mealId: repeat.id })}>
                    Repeat this meal
                    <ArrowRight className="size-4" />
                  </Button>
                ) : (
                  <Button onClick={() => s.setView("food")}>
                    Choose a meal
                    <ArrowRight className="size-4" />
                  </Button>
                )}
                <Button tone="outline" onClick={() => s.setOverlay({ type: "log-food" })}>
                  Log food
                </Button>
                <Button tone="ghost" onClick={() => s.setOverlay({ type: "log-drink" })}>
                  Log a drink
                </Button>
              </div>
            </div>
            <div className="intake-totals">
              <div>
                <b>
                  {food.protein.total}
                  <small> g</small>
                </b>
                <span>Protein logged{food.protein.unknown ? " · some unknown" : ""}</span>
              </div>
              <div>
                <b>
                  {Math.round(food.water)}
                  <small> oz</small>
                </b>
                <span>Fluid logged</span>
              </div>
            </div>
          </div>
        </section>
      </div>
      <section className="daily-reflection">
        <div>
          <h2>Turn observations into a better plan</h2>
          <p>Save a note now. Flag what matters. Review before making a change.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button tone="outline" onClick={() => s.setOverlay({ type: "note", kind: "general" })}>
            <PenLine className="size-4" />
            Add a note
          </Button>
          <Button tone="ghost" onClick={() => s.setView("notes")}>
            {flagged ? `Review ${flagged} flagged` : "Review notes"}
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </section>
    </div>
  );
}
