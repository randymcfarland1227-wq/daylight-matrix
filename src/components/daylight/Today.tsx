import { useMemo } from "react";
import { ArrowRight, Droplets, Flag, Footprints, MapPin, PenLine, Play, Utensils } from "lucide-react";
import { WEEKDAY_NAMES, localDate, prettyDate, shiftDate } from "@/lib/daylight/dates";
import { DAY_STYLE } from "@/lib/daylight/theme";
import { bodyNotes } from "@/lib/daylight/bodyNotes";
import { GROUPS, muscleName, regionInfo, targetFor, type AnyMuscleId, type MuscleId } from "@/lib/daylight/muscles";
import { activePlan, dayTemplate } from "@/lib/daylight/plan";
import { useDaylight } from "@/lib/daylight/store";
import { dayMuscles, dayTotalSets, fmt, heatLevel, heatSnapshot, plannedSets, statusFor } from "@/lib/daylight/volume";
import { doneSetCount, slotLogs } from "@/lib/daylight/logic";
import { DAY_KIND_LABEL, fuelingNote, isUseSoon } from "@/lib/daylight/foodplan";
import { MapFigure } from "./MapFigure";
import { figureFill, isUnder } from "./Body";
import { plannedVolume } from "@/lib/daylight/volume";
import { ProteinWaterRings, useFoodNumbers } from "./Food";
import { Badge, Button, Card, Eyebrow, Ring, cn } from "./ui";

function greeting(h: number) {
  return h < 5 ? "Late night" : h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

export function Today() {
  const s = useDaylight();
  const today = localDate();
  const wd = new Date().getDay();
  const plan = activePlan(s.planVersions, today);
  const day = dayTemplate(plan, wd);
  const st = DAY_STYLE[wd]!;
  const session = s.sessions.find((x) => x.localDate === today && x.weekday === wd) ?? null;
  const slots = session ? session.snapshot : day.slots;
  const food = useFoodNumbers();
  const note = fuelingNote(food.kind, Boolean(s.proteinGoalRest));

  const totals = useMemo(() => {
    let target = 0;
    let done = 0;
    for (const slot of slots) {
      if (slot.optional) continue;
      const t = slot.sets ? plannedSets(slot) : 1;
      target += t;
      if (session) done += slot.sets ? Math.min(doneSetCount(session, slot), t) : slotLogs(session, slot.id).some((l) => l.status === "done") ? 1 : 0;
    }
    return { target, done };
  }, [slots, session]);
  const pct = totals.target ? totals.done / totals.target : 0;
  const muscles = dayMuscles({ ...day, slots }).filter((m) => m.weight >= 0.5).slice(0, 6);

  const heat = useMemo(() => heatSnapshot(s.sessions, plan, 7, today), [s.sessions, plan, today]);
  const bodyNoteList = useMemo(() => bodyNotes(s.observations).list, [s.observations]);
  const target = s.weeklyTarget;
  const under = GROUPS.filter((m) => {
    const x = statusFor(heat.map[m.id], heat.weeklyFactor, targetFor(m.id, target));
    return x === "none" || x === "indirect" || x === "low";
  });
  const planned = useMemo(() => plannedVolume(plan), [plan]);
  const fill = (id: AnyMuscleId) => figureFill("heat", id, planned, heat, target);

  const weekSessions = s.sessions.filter((x) => x.localDate >= shiftDate(today, -6));
  const doneToday = session?.status === "finished";
  const flagged = s.observations.filter((n) => n.forNextPlan).length;
  const soon = s.inventory.filter((i) => isUseSoon(i, today));
  const lastFood = s.foodLogs.filter((l) => l.localDate === today).slice(-1)[0];
  const weekDone = new Set(weekSessions.filter((x) => x.logs.some((l) => l.status === "done")).map((x) => x.localDate));
  const streakDays = Array.from({ length: 7 }, (_, i) => shiftDate(today, -6 + i));

  const go = (view: "training" | "body" | "food" | "notes", extra?: () => void) => () => (extra?.(), s.setView(view));
  const open = () => {
    s.setTrainDay(wd);
    s.setTrainingTab("session");
    s.setView("training");
  };

  return (
    <div className="space-y-4">
      <header className="animate-rise pt-1">
        <Eyebrow>{prettyDate(today)}</Eyebrow>
        <h1 className="t-display mt-0.5">{greeting(new Date().getHours())}, Randy.</h1>
        <button type="button" className="t-caption mt-1 text-left text-ink-soft" onClick={() => s.setOverlay({ type: "purpose" })}>
          {s.purposeIsProposal ? "Tap to set what this is for." : s.purpose}
        </button>
      </header>

      {/* Today's session — calm card, accent CTA (no full-bleed weekday gradient) */}
      <Card className="animate-rise border-accent/25" aria-label="Today's session" as="section">
        <div className="flex items-center gap-2">
          <span className="inline-block size-2.5 rounded-full" style={{ background: st.color }} aria-hidden="true" />
          <Eyebrow>{WEEKDAY_NAMES[wd]} · today’s session</Eyebrow>
        </div>
        {day.scheduled ? (
          <>
            <div className="mt-2 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="t-display text-[1.5rem]! md:text-[1.75rem]!">{day.name}</h2>
                <p className="t-caption mt-1 text-ink-soft">
                  {slots.filter((x) => !x.optional).length} moves · ~{Math.round(dayTotalSets({ ...day, slots }))} sets
                </p>
              </div>
              <Ring value={pct} size={64} stroke={7} label={`${totals.done} of ${totals.target} sets done`}>
                <span className="t-caption font-bold tabular-nums">{fmt(totals.done)}/{Math.ceil(totals.target)}</span>
              </Ring>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {muscles.map((m) => (
                <span key={m.id} className={cn("rounded-full px-2.5 py-1 text-xs font-bold", m.weight >= 1 ? "bg-accent/15 text-accent" : "border border-line text-ink-soft")}>
                  {muscleName(m.id)}
                </span>
              ))}
            </div>
            {day.psa ? <p className="t-caption mt-3 line-clamp-2 rounded-xl bg-surface-2 px-3 py-2 text-ink-soft">PSA: {day.psa}</p> : null}
            {doneToday ? (
              <Button size="lg" tone="primary" className="mt-4 w-full" onClick={open}>
                <Play className="size-5" fill="currentColor" /> Review session <ArrowRight className="size-5" />
              </Button>
            ) : (
              <div className="mt-4 grid gap-2">
                <Button size="lg" tone="primary" className="w-full" data-testid="start-gym" onClick={() => s.setGymMode(wd)}>
                  <Play className="size-5" fill="currentColor" />
                  {session && totals.done > 0 ? "Resume in gym mode" : "Start gym mode"}
                  <ArrowRight className="size-5" />
                </Button>
                <button type="button" className="tap t-caption rounded-xl py-2 font-bold text-ink-soft underline-offset-2 hover:underline" onClick={open}>
                  Open the full session overview
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <h2 className="t-display mt-2 text-[1.5rem]!">Open day</h2>
            <p className="t-caption mt-1 text-ink-soft">No lift scheduled. Walk, stretch, prep food, restock. Or peek at tomorrow.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button tone="primary" onClick={() => (s.setTrainDay(1), s.setView("training"))}>Preview Monday</Button>
              <Button tone="outline" onClick={() => s.setOverlay({ type: "activity" })}>Log activity</Button>
            </div>
          </>
        )}
      </Card>

      {/* Quick log */}
      <section aria-label="Quick log" className="grid grid-cols-4 gap-2">
        {[
          { label: "Note", icon: PenLine, run: () => s.setOverlay({ type: "note" }) },
          { label: "Food", icon: Utensils, run: () => s.setOverlay({ type: "log-food" }) },
          { label: "+12 oz", icon: Droplets, run: () => (s.addWater(12), s.showToast("12 oz water")) },
          { label: "Activity", icon: Footprints, run: () => s.setOverlay({ type: "activity" }) },
        ].map((b) => (
          <button key={b.label} type="button" onClick={b.run} className="card tap flex flex-col items-center gap-1.5 py-3 text-xs font-bold transition active:scale-95">
            <b.icon className="size-5 text-accent" />
            {b.label}
          </button>
        ))}
      </section>

      {/* Week strip */}
      <Card>
        <div className="flex items-center justify-between">
          <h3 className="t-title">Last 7 days</h3>
          <span className="text-sm font-bold text-ink-soft">{weekDone.size} / 6 days trained</span>
        </div>
        <div className="mt-2 grid grid-cols-7 gap-1.5">
          {streakDays.map((d) => {
            const w = new Date(`${d}T12:00:00`).getDay();
            const did = weekDone.has(d);
            return (
              <div key={d} className="text-center">
                <div className={cn("mx-auto grid size-9 place-items-center rounded-full text-xs font-extrabold", did ? "text-white" : "bg-surface-2 text-ink-faint", d === today && !did && "ring-2 ring-accent")} style={did ? { background: DAY_STYLE[w]!.color } : undefined}>
                  {did ? "✓" : DAY_STYLE[w]!.short[0]}
                </div>
                <p className="t-meta mt-0.5 normal-case tracking-normal text-ink-faint">{DAY_STYLE[w]!.short}</p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Heat snapshot + food side by side on desktop */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <div className="flex items-baseline justify-between">
            <h3 className="t-title">Where you are</h3>
            <Badge tone={heat.source === "logged" ? "forest" : "sun"}>{heat.source === "logged" ? "last 7 days" : "plan, no logs yet"}</Badge>
          </div>
          <div className="mt-1 grid grid-cols-[auto_1fr] items-center gap-3">
            <button type="button" className="figure-panel flex w-[168px] gap-0.5 rounded-2xl p-1.5" onClick={go("body", () => s.setBody({ bodyMode: "heat" }))} aria-label="Open the heat map">
              {(["front", "back"] as const).map((v) => (
                <MapFigure key={v} view={v} level="region" className="h-auto w-1/2" fill={fill} interactive={false} />
              ))}
            </button>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-ink-soft">Needs attention</p>
              <ul className="mt-1 flex flex-wrap gap-1">
                {under.slice(0, 6).map((m) => (
                  <li key={m.id}>
                    <button type="button" className="tap rounded-full border border-dashed border-info px-2 py-0.5 text-xs font-bold text-info" onClick={() => (s.setBody({ bodyMode: "grow", selectedMuscleId: m.id }), s.setView("body"))}>
                      {m.name}
                    </button>
                  </li>
                ))}
                {under.length === 0 ? <li className="text-sm text-ink-soft">Every area is at or above your weekly number.</li> : null}
              </ul>
              {under.length > 6 ? <p className="mt-1 text-xs text-ink-faint">+{under.length - 6} more</p> : null}
              <Button size="sm" tone="ghost" className="-ml-2 mt-1" onClick={go("body", () => s.setBody({ bodyMode: "heat" }))}>
                Open body map <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
          {bodyNoteList.length ? (
            <button type="button" data-testid="today-body-notes" className="tap mt-3 flex w-full items-start gap-2 rounded-xl bg-surface-2 px-3 py-2 text-left" onClick={go("body")}>
              <MapPin className="mt-0.5 size-4 shrink-0 text-info" />
              <span className="min-w-0 text-sm">
                <b>{bodyNoteList.length} note{bodyNoteList.length === 1 ? "" : "s"} on the body</b>
                <span className="block truncate text-ink-soft">{regionInfo(bodyNoteList[0]!.region)?.name}: {bodyNoteList[0]!.text}</span>
              </span>
            </button>
          ) : null}
        </Card>

        <Card>
          <div className="flex items-start justify-between gap-3">
            <div>
              <Badge tone={food.kind === "heavy" ? "copper" : food.kind === "recovery" ? "teal" : "forest"}>{DAY_KIND_LABEL[food.kind]}</Badge>
              <h3 className="t-title mt-1">{note.title}</h3>
              <p className="mt-1 text-sm text-ink-soft">{lastFood ? `Last: ${lastFood.food}` : "Nothing eaten logged yet."}</p>
            </div>
            <ProteinWaterRings size={70} />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {[8, 16, 24].map((oz) => (
              <Button key={oz} size="sm" tone="outline" onClick={() => (s.addWater(oz), s.showToast(`${oz} oz water`))}>+{oz} oz</Button>
            ))}
            <Button size="sm" tone="soft" onClick={() => s.setView("food")}>Open food <ArrowRight className="size-4" /></Button>
          </div>
          {soon.length ? (
            <p className="t-caption mt-2 text-warn">
              Use soon: <b>{soon.slice(0, 3).map((i) => i.name).join(", ")}</b>
            </p>
          ) : null}
        </Card>
      </div>

      {flagged ? (
        <button type="button" onClick={() => s.setView("notes")} className="card tap flex w-full items-center gap-3 p-4 text-left">
          <Flag className="size-5 text-warn" />
          <span className="flex-1 text-sm">
            <b>{flagged}</b> note{flagged > 1 ? "s" : ""} flagged for your next plan.
          </span>
          <ArrowRight className="size-4" />
        </button>
      ) : null}
      <p className="t-caption pb-2 text-center text-ink-faint">{fmt(heat.totalSets)} sets logged in 7 days · everything stays on this device</p>
    </div>
  );
}
