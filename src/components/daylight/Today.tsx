import { ArrowRight, BookOpen, Check, Dumbbell, Footprints, PenLine, Play, Utensils } from "lucide-react";
import { localDate, prettyDate } from "@/lib/daylight/dates";
import { mealReady, progressLabel, sessionProgress } from "@/lib/daylight/logic";
import { activePlan, dayTemplate } from "@/lib/daylight/plan";
import { useDaylight } from "@/lib/daylight/store";
import { plannedVolume } from "@/lib/daylight/volume";
import { figureFill } from "./Body";
import { MapFigure } from "./MapFigure";
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
  const planned = plannedVolume(plan, { weekday });
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
        <Eyebrow>{prettyDate(today)}</Eyebrow>
        <h1 className="daily-title">Your day.<br /><span className="text-ink-soft">One step at a time.</span></h1>
        <p className="mt-3 max-w-lg text-ink-soft">Eat with less effort. Move with purpose. Notice what works.</p>
      </header>
      <button type="button" className="purpose-strip" onClick={() => s.setOverlay({ type: "purpose" })}>
        <span className="purpose-mark"><Footprints className="size-5" /></span>
        <span className="min-w-0 flex-1"><span className="eyebrow block">What I’m working toward</span><span className="mt-1 block text-sm">{s.purposeIsProposal ? "Set a reason that matters to you." : s.purpose}</span></span>
        <PenLine className="size-4 shrink-0 text-ink-faint" aria-hidden="true" />
      </button>
      <div className="daily-grid">
        <Card className="training-feature" aria-label="Today's session">
          <div className="flex items-center gap-2"><Dumbbell className="size-4 text-accent" /><Eyebrow>01 / Your movement</Eyebrow><Badge className="ml-auto">{finished ? "Saved" : hasWork ? "In progress" : "Today’s plan"}</Badge></div>
          <div className="training-feature-inner">
            <div className="training-feature-copy">
              <h2 className="session-title">{day.scheduled ? day.name : "No session scheduled"}</h2>
              <p className="mt-2 text-sm text-ink-soft">{day.scheduled ? `${slots.filter((x) => !x.optional).length} exercises · activation first` : "Choose a session, log another activity, or leave today open."}</p>
              <div className="reason-block"><p className="eyebrow">Why this session is here</p><p className="mt-2 text-sm leading-relaxed">{day.psa || day.why || "Your plan leaves this day open."}</p></div>
              {day.scheduled ? <>
                {hasWork ? <p className="mt-4 text-sm text-ink-soft">{progress.completed} of {progress.total} exercises completed{progress.skipped ? ` · ${progress.skipped} skipped` : ""}{progress.changed ? ` · ${progress.changed} replaced` : ""}</p> : null}
                {session && !finished && hasWork ? <p className="mt-1 text-sm font-medium">Continue: {progressLabel(session)}</p> : null}
                <Button size="lg" className="mt-5 w-full sm:w-auto" data-testid="start-gym" onClick={finished ? overview : () => s.setGymMode(weekday)}>{finished ? <Check className="size-4" /> : <Play className="size-4" fill="currentColor" />}{finished ? "Review session" : hasWork ? "Resume session" : "Start session"}<ArrowRight className="size-4" /></Button>
                <button type="button" className="tap mt-2 block min-h-11 text-sm text-ink-soft underline-offset-4 hover:underline" onClick={overview}>View exercises and form cues</button>
              </> : <Button tone="outline" className="mt-5" onClick={() => s.setTrainingTab("week")}>Choose a session<ArrowRight className="size-4" /></Button>}
            </div>
            <button type="button" className="training-anatomy" aria-label="Explore today's muscles" onClick={() => { s.setBody({ bodyMode: "plan", selectedMuscleId: null }); s.setView("body"); }}>
              <div className="flex items-center justify-center gap-2">
                {(["front", "back"] as const).map((view) => <MapFigure key={view} view={view} level="region" className="w-1/2" fill={(id) => figureFill("plan", id, planned, { map: planned, weeklyFactor: 1 }, s.weeklyTarget)} interactive={false} />)}
              </div>
              <span className="mt-2 flex items-center justify-center gap-2 text-xs text-ink-soft">Muscles in your plan<ArrowRight className="size-3" /></span>
            </button>
          </div>
          <div className="feature-footer">
            <button type="button" onClick={() => { s.setTrainDay(weekday); s.setTrainingTab("pt"); }}><span className="link-icon"><Footprints className="size-4" /></span><span><b>Physical therapy</b><small>Your reference board and cues</small></span><ArrowRight className="ml-auto size-4" /></button>
          </div>
        </Card>
        <Card className="food-feature" aria-label="Food today">
          <div className="flex items-center gap-2"><Utensils className="size-4 text-accent" /><Eyebrow>02 / Make eating easier</Eyebrow></div>
          <h2 className="section-display mt-4">Familiar food.<br />Fewer decisions.</h2>
          <p className="mt-2 text-sm text-ink-soft">Start with something you know. Planning can come later.</p>
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
