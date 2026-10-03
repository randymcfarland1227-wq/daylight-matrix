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
        <h1 className="font-display text-[2.1rem] leading-[1.05]">{greeting(new Date().getHours())}, Randy.</h1>
        <button type="button" className="mt-1 text-left text-sm text-ink-soft" onClick={() => s.setOverlay({ type: "purpose" })}>
          {s.purposeIsProposal ? "Tap to set what this is for." : s.purpose}
        </button>
      </header>

      {/* Today's session hero */}
      <section className="animate-rise relative overflow-hidden rounded-[1.75rem] p-5 text-white shadow-lg" style={{ background: `linear-gradient(135deg, ${st.color}, ${st.deep})` }} aria-label="Today's session">
        <svg className="pointer-events-none absolute -right-10 -top-12 size-60 opacity-[0.14]" viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r="22" fill="#fff" />
          {Array.from({ length: 12 }).map((_, i) => (
            <rect key={i} x="48.5" y="6" width="3" height="14" rx="1.5" fill="#fff" transform={`rotate(${i * 30} 50 50)`} />
          ))}
        </svg>
        <p className="relative text-xs font-bold uppercase tracking-[0.16em] text-white/75">{WEEKDAY_NAMES[wd]} · today’s session</p>
        {day.scheduled ? (
          <>
            <div className="relative mt-1 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-[1.9rem] font-semibold leading-[1.05]">{day.name}</h2>
                <p className="mt-1.5 text-sm text-white/80">
                  {slots.filter((x) => !x.optional).length} moves · ~{Math.round(dayTotalSets({ ...day, slots }))} sets
                </p>
              </div>
              <Ring value={pct} size={72} stroke={8} color="#8cd0e6" track="rgba(255,255,255,.25)" label={`${totals.done} of ${totals.target} sets done`}>
                <span className="font-display text-lg text-white">{fmt(totals.done)}/{Math.ceil(totals.target)}</span>
              </Ring>
            </div>
            <div className="relative mt-3 flex flex-wrap gap-1.5">
              {muscles.map((m) => (
                <span key={m.id} className={cn("rounded-full px-2.5 py-1 text-xs font-bold", m.weight >= 1 ? "bg-white/90 text-[#1d1a15]" : "border border-white/50")}>
                  {muscleName(m.id)}
                </span>
              ))}
            </div>
            {day.psa ? <p className="relative mt-3 line-clamp-2 rounded-xl bg-black/20 px-3 py-2 text-sm">PSA: {day.psa}</p> : null}
            {doneToday ? (
              <Button size="lg" tone="sun" className="relative mt-4 w-full" onClick={open}>
                <Play className="size-5" fill="currentColor" /> Review session <ArrowRight className="size-5" />
              </Button>
            ) : (
              <div className="relative mt-4 grid gap-2">
                <Button size="lg" tone="sun" className="w-full" data-testid="start-gym" onClick={() => s.setGymMode(wd)}>
                  <Play className="size-5" fill="currentColor" />
                  {session && totals.done > 0 ? "Resume in gym mode" : "Start gym mode"}
                  <ArrowRight className="size-5" />
                </Button>
                <button type="button" className="tap rounded-xl py-1.5 text-sm font-bold text-white/85 underline-offset-2 hover:underline" onClick={open}>
                  Open the full session overview
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <h2 className="relative mt-1 text-[1.9rem] font-semibold leading-tight">Open day</h2>
            <p className="relative mt-1 text-sm text-white/85">No lift scheduled. Walk, stretch, prep food, restock. Or peek at tomorrow.</p>
            <div className="relative mt-4 flex gap-2">
              <Button tone="sun" onClick={() => (s.setTrainDay(1), s.setView("training"))}>Preview Monday</Button>
              <Button tone="ghost" className="text-white" onClick={() => s.setOverlay({ type: "activity" })}>Log activity</Button>
            </div>
          </>
        )}
      </section>

      {/* Quick log */}
      <section aria-label="Quick log" className="grid grid-cols-4 gap-2">
        {[
          { label: "Note", icon: PenLine, run: () => s.setOverlay({ type: "note" }) },
          { label: "Food", icon: Utensils, run: () => s.setOverlay({ type: "log-food" }) },
          { label: "+12 oz", icon: Droplets, run: () => (s.addWater(12), s.showToast("12 oz water")) },
          { label: "Activity", icon: Footprints, run: () => s.setOverlay({ type: "activity" }) },
        ].map((b) => (
          <button key={b.label} type="button" onClick={b.run} className="card tap flex flex-col items-center gap-1 py-3 text-sm font-bold transition active:scale-95">
            <b.icon className="size-6 text-forest" />
            {b.label}
          </button>
        ))}
      </section>

      {/* Week strip */}
      <Card>
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg">Last 7 days</h3>
          <span className="text-sm font-bold text-ink-soft">{weekDone.size} / 6 days trained</span>
        </div>
        <div className="mt-2 grid grid-cols-7 gap-1.5">
          {streakDays.map((d) => {
            const w = new Date(`${d}T12:00:00`).getDay();
            const did = weekDone.has(d);
            return (
              <div key={d} className="text-center">
                <div className={cn("mx-auto grid size-9 place-items-center rounded-full text-xs font-extrabold", did ? "text-white" : "bg-surface-2 text-ink-faint", d === today && !did && "ring-2 ring-sun")} style={did ? { background: DAY_STYLE[w]!.color } : undefined}>
                  {did ? "✓" : DAY_STYLE[w]!.short[0]}
                </div>
                <p className="mt-0.5 text-[0.65rem] text-ink-faint">{DAY_STYLE[w]!.short}</p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Heat snapshot + food side by side on desktop */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <div className="flex items-baseline justify-between">
            <h3 className="font-display text-lg">Where you are</h3>
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
                    <button type="button" className="tap rounded-full border border-dashed border-teal px-2 py-0.5 text-xs font-bold text-teal" onClick={() => (s.setBody({ bodyMode: "grow", selectedMuscleId: m.id }), s.setView("body"))}>
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
              <MapPin className="mt-0.5 size-4 shrink-0 text-teal" />
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
              <h3 className="mt-1 font-display text-lg leading-tight">{note.title}</h3>
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
            <p className="mt-2 text-sm text-copper">
              Use soon: <b>{soon.slice(0, 3).map((i) => i.name).join(", ")}</b>
            </p>
          ) : null}
        </Card>
      </div>

      {flagged ? (
        <button type="button" onClick={() => s.setView("notes")} className="card tap flex w-full items-center gap-3 p-4 text-left">
          <Flag className="size-5 text-copper" />
          <span className="flex-1 text-sm">
            <b>{flagged}</b> note{flagged > 1 ? "s" : ""} flagged for your next plan.
          </span>
          <ArrowRight className="size-4" />
        </button>
      ) : null}
      <p className="pb-2 text-center text-xs text-ink-faint">{fmt(heat.totalSets)} sets logged in 7 days · everything stays on this device</p>
    </div>
  );
}
