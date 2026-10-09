import { ArrowRight, BookOpen, Check, Dumbbell, Footprints, PenLine, Play, Utensils } from "lucide-react";
import { localDate, prettyDate } from "@/lib/daylight/dates";
import { mealReady, progressLabel, sessionProgress } from "@/lib/daylight/logic";
import { activePlan, dayTemplate } from "@/lib/daylight/plan";
import { useDaylight } from "@/lib/daylight/store";
import { exerciseById } from "@/lib/daylight/exercises";
import { photosFor } from "@/lib/daylight/exImages";
import { videoFor } from "@/lib/daylight/videos";
import { useFoodNumbers } from "./Food";
import { Badge, Button, Card, Eyebrow } from "./ui";

export function Today() {
  const s = useDaylight();
  const today = localDate();
  const weekday = new Date().getDay();
  const plan = activePlan(s.planVersions, today);
  const day = dayTemplate(plan, weekday);
  const session = s.sessions.find((x) => x.localDate === today && x.weekday === weekday) ?? null;
  const slots = session?.snapshot ?? day.slots;
  const progress = sessionProgress(slots, session);
  const featured = slots.find((slot) => slot.section === "main" && photosFor(slot.exerciseId)?.match === "exact") ?? slots.find((slot) => photosFor(slot.exerciseId)?.match === "exact") ?? slots.find((slot) => videoFor(slot.exerciseId));
  const featuredExercise = featured ? exerciseById(featured.exerciseId) : null;
  const featuredPhoto = featured ? photosFor(featured.exerciseId) : undefined;
  const featuredVideo = featured ? videoFor(featured.exerciseId) : undefined;
  const featuredImage = featuredPhoto?.images[0] ?? featuredVideo?.thumbnail;
  const food = useFoodNumbers();
  const lastLog = [...s.foodLogs].reverse().find((x) => x.mealId);
  const lastMeal = s.savedMeals.find((m) => m.id === lastLog?.mealId);
  const ready = s.savedMeals.find((m) => mealReady(m, s.inventory));
  const repeat = lastMeal ?? ready ?? s.savedMeals.find((m) => m.pinned);
  const latest = s.observations[0];
  const flagged = s.observations.filter((x) => x.forNextPlan).length;
  const hasWork = Boolean(session?.logs.length);
  const finished = session?.status === "finished";
  const overview = () => { s.setTrainDay(weekday); s.setTrainingTab("session"); };
  return (
    <div className="daily-page">
      <header className="page-intro">
        <div><Eyebrow>{prettyDate(today)}</Eyebrow><h1 className="daily-title">Your daily practice.</h1></div>
        <p className="intro-note">A place to move well, make eating easier, and use what you notice.</p>
      </header>
      <button type="button" className="purpose-strip" onClick={() => s.setOverlay({ type: "purpose" })}>
        <span className="purpose-mark"><Footprints className="size-5" /></span>
        <span className="min-w-0 flex-1"><span className="eyebrow block">What I’m working toward</span><span className="mt-1 block text-sm">{s.purposeIsProposal ? "Set a reason that matters to you." : s.purpose}</span></span>
        <PenLine className="size-4 shrink-0 text-ink-faint" aria-hidden="true" />
      </button>
      <div className="daily-grid">
        <Card className="training-feature" aria-label="Today's session">
          <div className="training-feature-inner">
            <div className="training-feature-copy">
              <div className="flex flex-wrap items-center gap-2"><Eyebrow>01 / Today’s movement</Eyebrow><Badge className="ml-auto">{finished ? "Saved" : hasWork ? "In progress" : "From your plan"}</Badge></div>
              <h2 className="session-title">{day.scheduled ? day.name : "A day left open."}</h2>
              <p className="mt-3 text-sm text-ink-soft">{day.scheduled ? `${slots.filter((x) => !x.optional).length} exercises · activation first` : "Choose a session, log another activity, or leave today open."}</p>
              <div className="reason-block"><p className="eyebrow">Why this session is here</p><p className="mt-2 text-sm leading-relaxed">{day.psa || day.why || "Your plan leaves this day open."}</p></div>
              {day.scheduled ? <>
                {hasWork ? <p className="mt-4 text-sm text-ink-soft">{progress.completed} of {progress.total} exercises completed{progress.skipped ? ` · ${progress.skipped} skipped` : ""}{progress.changed ? ` · ${progress.changed} replaced` : ""}</p> : null}
                {session && !finished && hasWork ? <p className="mt-1 text-sm font-medium">Continue: {progressLabel(session)}</p> : null}
                <Button size="lg" className="mt-5 w-full sm:w-auto" data-testid="start-gym" onClick={finished ? overview : () => s.setGymMode(weekday)}>{finished ? <Check className="size-4" /> : <Play className="size-4" fill="currentColor" />}{finished ? "Review session" : hasWork ? "Resume session" : "Start session"}<ArrowRight className="size-4" /></Button>
                <button type="button" className="tap mt-2 block min-h-11 text-sm text-ink-soft underline-offset-4 hover:underline" onClick={overview}>View exercises and form cues</button>
              </> : <Button tone="outline" className="mt-5" onClick={() => s.setTrainingTab("week")}>Choose a session<ArrowRight className="size-4" /></Button>}
            </div>
            {featuredImage && featured ? <div className="training-image">
              <img src={featuredImage} alt={`${featuredExercise?.name ?? "Exercise"}: ${featuredPhoto ? "starting position" : "video preview"}`} />
              <span className="training-image-credit">{featuredPhoto ? "Free Exercise DB · Public domain" : `Video by ${featuredVideo?.author}`}</span>
              <button type="button" className="tap training-image-caption" onClick={() => s.setOverlay({ type: "form", exerciseId: featured.exerciseId })}><Play className="size-5 text-accent" /><span><b className="text-sm">{featuredExercise?.name}</b><small>See the demonstration and form cues</small></span><ArrowRight className="ml-auto size-4" /></button>
            </div> : <div className="training-image"><Dumbbell className="size-16 text-ink-faint" /></div>}
          </div>
          <div className="feature-footer">
            <button type="button" onClick={() => { s.setTrainDay(weekday); s.setTrainingTab("pt"); }}><span className="link-icon"><Footprints className="size-4" /></span><span><b>Physical therapy</b><small>Your reference board and cues</small></span><ArrowRight className="ml-auto size-4" /></button>
            <button type="button" onClick={() => { s.setBody({ bodyMode: "plan", selectedMuscleId: null }); s.setView("body"); }}><span className="link-icon"><Dumbbell className="size-4" /></span><span><b>Muscles in this session</b><small>Explore the body map</small></span><ArrowRight className="ml-auto size-4" /></button>
          </div>
        </Card>
        <Card className="food-feature" aria-label="Food today">
          <div className="flex items-center gap-2"><Utensils className="size-4 text-accent" /><Eyebrow>02 / Make eating easier</Eyebrow></div>
          <h2 className="section-display mt-4">What can I eat?</h2>
          <p className="mt-2 text-sm text-ink-soft">Repeat a familiar meal or choose from what you have.</p>
          {repeat ? <div className="meal-shortcut"><p className="eyebrow">{lastMeal ? "A meal you’ve logged before" : ready ? "Ingredients marked available" : "A meal you pinned"}</p><p className="mt-2 text-lg font-medium">{repeat.name}</p><Button tone="outline" size="sm" className="mt-3" onClick={() => s.setOverlay({ type: "repeat-meal", mealId: repeat.id })}>Repeat this meal<ArrowRight className="size-4" /></Button></div> : <div className="meal-shortcut"><p className="text-sm text-ink-soft">Your meals and ingredients are together in Food.</p><Button tone="outline" className="mt-3" onClick={() => s.setView("food")}>Choose something to eat<ArrowRight className="size-4" /></Button></div>}
          <div className="mt-4 flex flex-wrap gap-2"><Button tone="soft" size="sm" onClick={() => s.setOverlay({ type: "log-food" })}>Log food</Button><Button tone="soft" size="sm" onClick={() => s.setOverlay({ type: "log-drink" })}>Log a drink</Button><Button tone="ghost" size="sm" onClick={() => s.setView("food")}>Open Food<ArrowRight className="size-3" /></Button></div>
          <div className="food-summary"><span><b>{food.protein.total} g</b> protein logged{food.protein.unknown ? " · some unknown" : ""}</span><span><b>{Math.round(food.water)} oz</b> fluid logged</span></div>
        </Card>
        <Card className="notes-feature" aria-label="Your observations">
          <div className="notes-feature-copy"><div className="flex items-center gap-2"><PenLine className="size-4 text-accent" /><Eyebrow>03 / Learn from your day</Eyebrow></div><h2 className="section-display mt-3">What did you notice?</h2><p className="mt-2 max-w-lg text-sm text-ink-soft">A movement felt different. Lunch took too much effort. Save it now; decide what to change when you’re ready.</p><div className="mt-4 flex flex-wrap gap-2"><Button tone="outline" onClick={() => s.setOverlay({ type: "note", kind: "general" })}>Add an observation</Button><Button tone="ghost" onClick={() => s.setView("notes")}>{flagged ? `Review ${flagged} flagged observation${flagged === 1 ? "" : "s"}` : "Review observations"}<ArrowRight className="size-4" /></Button></div></div>
          <div className="observation-preview"><p className="eyebrow">{latest ? "Your latest observation" : "A small note can guide the next plan"}</p><p className="mt-3 text-sm leading-relaxed text-ink-soft">{latest ? latest.text : "You don’t need to measure everything. Start with what stood out."}</p><p className="mt-4 text-xs text-ink-faint">Notice → try a change → review what helped</p></div>
        </Card>
      </div>
      <div className="daily-utilities"><button type="button" onClick={() => s.setOverlay({ type: "activity" })}><Footprints className="size-4" />Log another activity</button><button type="button" onClick={() => s.setView("learn")}><BookOpen className="size-4" />Learn about movement</button><span>Saved on this device</span></div>
    </div>
  );
}
