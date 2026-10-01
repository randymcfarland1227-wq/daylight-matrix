import { useMemo } from "react";
import { AlertTriangle, ArrowRight, Flame, Lightbulb, Pencil, Target } from "lucide-react";
import { localDate } from "@/lib/daylight/dates";
import { exerciseById } from "@/lib/daylight/exercises";
import { MUSCLES, muscleInfo, type MuscleId } from "@/lib/daylight/muscles";
import { WEEKDAY_NAMES } from "@/lib/daylight/dates";
import { activePlan } from "@/lib/daylight/plan";
import { useDaylight } from "@/lib/daylight/store";
import { STATUS_LABEL, fmt, heatLevel, heatSnapshot, plannedVolume, planExerciseIdSet, statusFor, suggestionsFor, type CoverageStatus, type MuscleVolume } from "@/lib/daylight/volume";
import type { BodyMode } from "@/lib/daylight/types";
import { BodyFigure, heatColor } from "./BodyFigure";
import { Badge, Button, Card, Chip, Eyebrow, PageHead, Segmented, cn } from "./ui";

const STATUS_TONE: Record<CoverageStatus, "danger" | "copper" | "sun" | "forest" | "teal"> = {
  none: "danger",
  indirect: "copper",
  low: "sun",
  ok: "forest",
  high: "teal",
};

export function Body() {
  const state = useDaylight();
  const today = localDate();
  const plan = activePlan(state.planVersions, today);
  const mode = state.bodyMode;
  const target = state.weeklyTarget;
  const selected = (state.selectedMuscleId as MuscleId | null) ?? null;
  const planned = useMemo(() => plannedVolume(plan), [plan]);
  const heat = useMemo(() => heatSnapshot(state.sessions, plan, state.heatWindow, today), [state.sessions, plan, state.heatWindow, today]);
  const src = mode === "heat" ? heat : { map: planned, source: "planned" as const, windowDays: 7, weeklyFactor: 1, totalSets: 0 };

  const statusOf = (id: MuscleId) => statusFor(src.map[id], src.weeklyFactor, target);
  const underserved = MUSCLES.filter((m) => {
    const st = statusFor(planned[m.id], 1, target);
    return st === "none" || st === "indirect" || st === "low";
  });
  const underIds = new Set(underserved.map((m) => m.id));

  const fill = (id: MuscleId): string => {
    if (mode === "heat") {
      const cell = src.map[id];
      return heatColor(heatLevel(cell, src.weeklyFactor, target));
    }
    if (mode === "grow") {
      if (selected) {
        const w = exerciseWeightFor(selected, id);
        if (id === selected) return "var(--forest)";
        return w >= 0.5 ? "var(--teal)" : "var(--muscle-idle)";
      }
      return underIds.has(id) ? "var(--teal)" : "var(--muscle-idle)";
    }
    // plan mode
    if (selected) {
      const hit = planned[selected].hits.find((h) => h.exerciseId && exerciseById(h.exerciseId)?.muscles?.[id]);
      void hit;
    }
    const st = statusFor(planned[id], 1, target);
    return st === "none" ? "var(--muscle-idle)" : st === "indirect" ? "#e9c3a0" : heatColor(Math.min(1, planned[id].effective / (target * 1.4)));
  };

  const select = (id: MuscleId) => state.setBody({ selectedMuscleId: selected === id ? null : id });
  const info = selected ? muscleInfo(selected) : null;

  return (
    <div>
      <PageHead eyebrow="Muscles" title="Body map" />
      <Segmented<BodyMode>
        label="Body map mode"
        value={mode}
        onChange={(v) => state.setBody({ bodyMode: v })}
        options={[
          { id: "plan", label: "Explore" },
          { id: "heat", label: "Heat map" },
          { id: "grow", label: "Grow an area" },
        ]}
      />
      <p className="mt-2 text-sm text-ink-soft">
        {mode === "plan" ? "Tap a muscle to see which moves in your plan hit it, and how much." : null}
        {mode === "heat" ? (heat.source === "logged" ? `Built from sets you logged in the last ${state.heatWindow} days.` : "Nothing logged in this window yet, so this shows your plan as written (per week).") : null}
        {mode === "grow" ? "Pick an area to grow. Teal outlines are areas your plan under-serves. Suggestions are labeled and are not in your PDF." : null}
      </p>

      {mode === "heat" ? (
        <div className="mt-3 flex items-center gap-2">
          {([7, 14, 30] as const).map((d) => (
            <Chip key={d} active={state.heatWindow === d} onClick={() => state.setBody({ heatWindow: d })}>
              {d} days
            </Chip>
          ))}
          <Badge tone={heat.source === "logged" ? "forest" : "sun"} className="ml-auto">
            {heat.source === "logged" ? `${fmt(heat.totalSets)} sets logged` : "planned volume"}
          </Badge>
        </div>
      ) : null}

      <div className="mt-4 grid gap-5 md:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] md:items-start">
        <div>
          <div className="card relative overflow-hidden p-2">
            <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(120% 70% at 50% 100%, color-mix(in srgb, var(--sun) 22%, transparent), transparent 70%)" }} />
            <div className="relative grid grid-cols-2 gap-1">
              {(["front", "back"] as const).map((view) => (
                <div key={view} className="text-center">
                  <BodyFigure
                    view={view}
                    className="mx-auto h-auto w-full max-w-[210px]"
                    fill={fill}
                    selected={selected}
                    onSelect={select}
                    dim={mode === "plan" && selected ? (id) => !(exerciseTouches(planned, selected, id)) && id !== selected : mode === "grow" && selected ? (id) => id !== selected && exerciseWeightFor(selected, id) < 0.5 : undefined}
                    under={mode === "grow" ? (id) => underIds.has(id) : mode === "plan" ? (id) => underIds.has(id) && !selected : undefined}
                  />
                  <p className="-mt-2 pb-1 text-[0.7rem] font-bold uppercase tracking-widest text-ink-soft">{view}</p>
                </div>
              ))}
            </div>
          </div>
          <Legend mode={mode} />
        </div>

        <div className="space-y-4">
          {info ? (
            <MuscleDetail id={info.id} mode={mode} planned={planned} heat={heat} />
          ) : mode === "grow" ? (
            <GrowPicker underserved={underserved.map((m) => m.id)} />
          ) : (
            <Overview planned={planned} heat={heat} mode={mode} />
          )}
        </div>
      </div>
    </div>
  );
}

function exerciseTouches(planned: ReturnType<typeof plannedVolume>, selected: MuscleId, id: MuscleId): boolean {
  // muscles that share at least one plan exercise with the selected muscle
  const ids = planned[selected].hits.map((h) => h.exerciseId);
  return ids.some((ex) => (exerciseById(ex)?.muscles?.[id] ?? 0) >= 0.5);
}

function exerciseWeightFor(selected: MuscleId, id: MuscleId): number {
  // muscles that commonly co-work with the selected one in suggested moves (for the grow view highlight)
  if (id === selected) return 1;
  const list = suggestionsFor(selected, new Set(), 6);
  let w = 0;
  for (const s of list) w = Math.max(w, exerciseById(s.exerciseId)?.muscles?.[id] ?? 0);
  return w >= 0.5 ? 0.5 : 0;
}

function Legend({ mode }: { mode: BodyMode }) {
  return (
    <div className="mt-3 rounded-2xl bg-surface-2 p-3 text-xs text-ink-soft">
      {mode === "plan" ? (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="flex items-center gap-1.5"><i className="size-3 rounded-sm" style={{ background: heatColor(0.9) }} /> well covered</span>
          <span className="flex items-center gap-1.5"><i className="size-3 rounded-sm" style={{ background: "#e9c3a0" }} /> indirect only</span>
          <span className="flex items-center gap-1.5"><i className="size-3 rounded-sm bg-[var(--muscle-idle)]" /> not trained</span>
          <span className="flex items-center gap-1.5"><i className="size-3 rounded-sm border-2 border-dashed border-teal" /> underserved</span>
        </div>
      ) : mode === "heat" ? (
        <div>
          <div className="h-2.5 w-full rounded-full" style={{ background: `linear-gradient(90deg, var(--muscle-idle), ${heatColor(0.05)}, ${heatColor(0.4)}, ${heatColor(0.75)}, ${heatColor(1)})` }} />
          <div className="mt-1 flex justify-between"><span>none</span><span>at your weekly target →</span></div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="flex items-center gap-1.5"><i className="size-3 rounded-sm bg-forest" /> area to grow</span>
          <span className="flex items-center gap-1.5"><i className="size-3 rounded-sm bg-teal" /> helpers / underserved</span>
        </div>
      )}
    </div>
  );
}

function Overview({ planned, heat, mode }: { planned: ReturnType<typeof plannedVolume>; heat: ReturnType<typeof heatSnapshot>; mode: BodyMode }) {
  const state = useDaylight();
  const target = state.weeklyTarget;
  const src = mode === "heat" ? heat : { map: planned, weeklyFactor: 1, source: "planned" as const };
  const rows = MUSCLES.map((m) => ({ m, cell: src.map[m.id], st: statusFor(src.map[m.id], src.weeklyFactor, target) })).sort((a, b) => a.cell.effective - b.cell.effective);
  const under = rows.filter((r) => r.st === "none" || r.st === "indirect" || r.st === "low");
  return (
    <>
      <Card className="animate-rise">
        <div className="flex items-center gap-2">
          <Target className="size-5 text-teal" />
          <h2 className="font-display text-xl">{mode === "heat" ? (heat.source === "logged" ? "Where you actually are" : "Where the plan puts you") : "Underserved by your plan"}</h2>
        </div>
        {under.length ? (
          <ul className="mt-3 space-y-1.5">
            {under.map(({ m, cell, st }) => (
              <li key={m.id}>
                <button type="button" onClick={() => state.setBody({ selectedMuscleId: m.id })} className="tap flex w-full items-center gap-2 rounded-xl border border-line px-3 py-2 text-left hover:bg-surface-2">
                  <span className="flex-1 font-semibold">{m.name}</span>
                  <span className="text-sm tabular-nums text-ink-soft">{fmt(Math.round((cell.effective / src.weeklyFactor) * 10) / 10)}/wk</span>
                  <Badge tone={STATUS_TONE[st]}>{STATUS_LABEL[st]}</Badge>
                  <ArrowRight className="size-4 text-ink-faint" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-ink-soft">Everything reaches your target of {target} weighted sets/week.</p>
        )}
        <label className="mt-4 flex items-center gap-3 text-sm">
          <span className="flex-1 text-ink-soft">Your weekly target per area (weighted sets). Not a rule — set what feels right.</span>
          <input aria-label="Weekly target" inputMode="numeric" className="field w-20 text-center tabular-nums" value={target} onChange={(e) => state.setWeeklyTarget(Math.max(1, Number(e.target.value) || 1))} />
        </label>
      </Card>
      <Card>
        <h2 className="font-display text-xl">All areas</h2>
        <ul className="mt-2 space-y-1">
          {rows.slice().reverse().map(({ m, cell, st }) => (
            <li key={m.id}>
              <button type="button" onClick={() => state.setBody({ selectedMuscleId: m.id })} className="tap grid w-full grid-cols-[7.5rem_1fr_3rem] items-center gap-2 rounded-lg px-1 py-1 text-left text-sm hover:bg-surface-2">
                <span className="truncate font-semibold">{m.name}</span>
                <span className="h-2.5 overflow-hidden rounded-full bg-surface-2">
                  <span className="block h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(100, (cell.effective / src.weeklyFactor / (target * 1.5)) * 100)}%`, background: st === "none" ? "transparent" : heatColor(heatLevel(cell, src.weeklyFactor, target)) }} />
                </span>
                <span className="text-right tabular-nums text-ink-soft">{fmt(Math.round((cell.effective / src.weeklyFactor) * 10) / 10)}</span>
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-ink-faint">Weighted sets per week: primary 1, secondary 0.5, minor 0.25. An editorial mapping, not a measure of growth.</p>
      </Card>
    </>
  );
}

function MuscleDetail({ id, mode, planned, heat }: { id: MuscleId; mode: BodyMode; planned: ReturnType<typeof plannedVolume>; heat: ReturnType<typeof heatSnapshot> }) {
  const state = useDaylight();
  const info = muscleInfo(id)!;
  const plan = activePlan(state.planVersions, localDate());
  const cell: MuscleVolume = planned[id];
  const logged: MuscleVolume = heat.map[id];
  const st = statusFor(cell, 1, state.weeklyTarget);
  const sugg = suggestionsFor(id, planExerciseIdSet(plan), 8);
  const hits = cell.hits.filter((h) => !h.alt);
  const alts = cell.hits.filter((h) => h.alt);
  const notes = state.observations.filter((o) => o.context.muscleId === id);
  const showGrow = mode === "grow" || st === "none" || st === "indirect" || st === "low";
  return (
    <>
      <Card className="animate-pop">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Eyebrow>{info.region}</Eyebrow>
            <h2 className="font-display text-3xl leading-tight">{info.name}</h2>
          </div>
          <Button tone="ghost" size="sm" onClick={() => state.setBody({ selectedMuscleId: null })}>
            Close
          </Button>
        </div>
        <p className="mt-1 text-sm text-ink-soft">{info.blurb}</p>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <Mini label="Plan / wk" value={fmt(Math.round(cell.effective * 10) / 10)} />
          <Mini label="Direct sets" value={fmt(Math.round(cell.direct * 10) / 10)} />
          <Mini label={heat.source === "logged" ? `Logged ${state.heatWindow}d` : "Logged"} value={heat.source === "logged" ? fmt(Math.round(logged.effective * 10) / 10) : "–"} />
        </div>
        <div className="mt-3 flex items-center gap-2">
          <Badge tone={STATUS_TONE[st]}>{STATUS_LABEL[st]}</Badge>
          <span className="text-xs text-ink-soft">vs your target of {state.weeklyTarget} weighted sets/week</span>
        </div>
      </Card>

      <Card>
        <h3 className="font-display text-xl">Moves in your plan that hit it</h3>
        {hits.length === 0 ? <p className="mt-2 text-sm text-ink-soft">Nothing in the plan trains this directly or indirectly.</p> : null}
        <ul className="mt-2 space-y-1.5">
          {hits.map((h) => (
            <li key={h.exerciseId} className="flex items-center gap-2 rounded-xl border border-line px-3 py-2">
              <Badge tone={h.role === "primary" ? "copper" : "plain"}>{h.role}</Badge>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{h.name}</p>
                <p className="text-xs text-ink-soft">
                  {h.days.map((d) => WEEKDAY_NAMES[d]!.slice(0, 3)).join(", ")} · {fmt(h.sets)} sets/wk
                </p>
              </div>
              <button type="button" aria-label={`Open ${h.name} in the library`} className="tap text-xs font-bold text-forest underline" onClick={() => state.setOverlay({ type: "note", exerciseId: h.exerciseId, muscleId: id, kind: "gym" })}>
                note
              </button>
            </li>
          ))}
        </ul>
        {alts.length ? <p className="mt-2 text-xs text-ink-soft">Swap options that also hit it: {alts.map((a) => a.name).join(", ")}.</p> : null}
      </Card>

      {showGrow ? (
        <Card className="border-teal/40">
          <div className="flex items-center gap-2">
            <Lightbulb className="size-5 text-teal" />
            <h3 className="font-display text-xl">Ideas to grow it</h3>
            <Badge tone="teal" className="ml-auto">suggestions — not in your PDF</Badge>
          </div>
          <p className="mt-1 text-xs text-ink-soft">Candidate moves from the library, back-friendly options first. General movement notes only, not medical advice. Add one to a plan draft, or just try it and leave a note.</p>
          <ul className="mt-2 space-y-1.5">
            {sugg.map((s) => (
              <li key={s.exerciseId} className="rounded-xl border border-line px-3 py-2">
                <div className="flex items-center gap-2">
                  <p className="flex-1 font-semibold">{s.name}</p>
                  <Badge tone={s.role === "primary" ? "copper" : "plain"}>{s.role}</Badge>
                  {s.back === "friendly" ? <Badge tone="teal">back-friendly</Badge> : s.back === "caution" ? <Badge tone="copper"><AlertTriangle className="size-3" /> go easy</Badge> : null}
                </div>
                <p className="text-xs text-ink-soft">
                  {s.equipment}
                  {s.backNote ? ` · ${s.backNote}` : ""}
                </p>
                <Button tone="ghost" size="sm" className="-ml-2 mt-0.5" onClick={() => state.setOverlay({ type: "move", exerciseId: s.exerciseId })}>
                  Add to a plan draft
                </Button>
              </li>
            ))}
            {sugg.length === 0 ? <li className="text-sm text-ink-soft">No extra candidates in the library for this area.</li> : null}
          </ul>
        </Card>
      ) : (
        <Button tone="outline" onClick={() => state.setBody({ bodyMode: "grow" })}>
          <Flame className="size-4" /> See ideas to grow this area
        </Button>
      )}

      <Card>
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl">Your notes here</h3>
          <Button size="sm" tone="soft" onClick={() => state.setOverlay({ type: "note", muscleId: id, kind: "gym" })}>
            <Pencil className="size-4" /> Add
          </Button>
        </div>
        {notes.length === 0 ? <p className="mt-1 text-sm text-ink-soft">None yet.</p> : null}
        <ul className="mt-1 space-y-1">
          {notes.slice(0, 4).map((n) => (
            <li key={n.id} className="text-sm">
              <span className="text-ink-faint">{n.context.date.slice(5)} · </span>
              {n.text}
              {n.forNextPlan ? <span className="ml-1 text-copper-deep">★</span> : null}
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface-2 py-2">
      <p className="font-display text-2xl tabular-nums leading-none">{value}</p>
      <p className="mt-1 text-[0.65rem] font-bold uppercase tracking-wider text-ink-soft">{label}</p>
    </div>
  );
}

function GrowPicker({ underserved }: { underserved: MuscleId[] }) {
  const state = useDaylight();
  return (
    <Card className="animate-rise">
      <h2 className="font-display text-xl">Which area do you want to grow?</h2>
      <p className="mt-1 text-sm text-ink-soft">Tap the body, or choose below.</p>
      {underserved.length ? (
        <>
          <Eyebrow className="mt-3">Underserved by the plan</Eyebrow>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {underserved.map((id) => (
              <Chip key={id} tone="teal" onClick={() => state.setBody({ selectedMuscleId: id })}>
                {muscleInfo(id)?.name}
              </Chip>
            ))}
          </div>
        </>
      ) : null}
      <Eyebrow className="mt-3">All areas</Eyebrow>
      <div className="mt-1.5 flex flex-wrap gap-2">
        {MUSCLES.filter((m) => !underserved.includes(m.id)).map((m) => (
          <Chip key={m.id} onClick={() => state.setBody({ selectedMuscleId: m.id })}>
            {m.name}
          </Chip>
        ))}
      </div>
      <p className="hidden">{cn("x")}</p>
    </Card>
  );
}
