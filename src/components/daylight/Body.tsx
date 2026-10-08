import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { ArrowRight, MapPin, Pencil, RotateCcw, RotateCw, Target } from "lucide-react";
import { localDate } from "@/lib/daylight/dates";
import {
  GROUPS, REGIONS, SUBS, groupInfo, groupOfSub, isGroup, isRegion, isSub, regionInfo, resolveMuscle, subInfo, targetFor,
  type AnyMuscleId, type GroupId, type SubId,
} from "@/lib/daylight/muscles";
import { activePlan } from "@/lib/daylight/plan";
import { useDaylight } from "@/lib/daylight/store";
import { STATUS_LABEL, fmt, heatLevel, heatSnapshot, plannedVolume, statusFor, type CoverageStatus, type VolumeMap } from "@/lib/daylight/volume";
import type { BodyMode } from "@/lib/daylight/types";
import { FIG_SKIN, GROUP_HUE, INDIRECT_COLOR, RAMP_CSS, mix, rampColor, ROLE_STRENGTH } from "@/lib/daylight/figureColors";
import { bodyNotes } from "@/lib/daylight/bodyNotes";
import { MapFigure, type MapLevel } from "./MapFigure";
import type { TurnView } from "./TurnFigure";
import { MusclePage } from "./MusclePage";
import { Badge, Button, Card, Chip, Eyebrow, PageHead, Segmented, cn } from "./ui";

// three.js and the mesh are only fetched when the Turn view is opened
const TurnFigure = lazy(() => import("./TurnFigure").then((m) => ({ default: m.TurnFigure })));

export const STATUS_TONE: Record<CoverageStatus, "danger" | "copper" | "sun" | "forest" | "teal"> = {
  none: "danger",
  indirect: "copper",
  low: "sun",
  ok: "forest",
  high: "teal",
};
function statusAt(src: Src, id: AnyMuscleId, target: number): CoverageStatus {
  return statusFor(src.map[id], src.weeklyFactor, targetFor(id, target));
}
export const r1 = (n: number) => Math.round(n * 10) / 10;

export type Src = { map: VolumeMap; weeklyFactor: number };

export function groupOfAny(id: string): GroupId {
  return resolveMuscle(id)?.group ?? "chest";
}

/** Colour for one region of the figure in a given mode. Each group has its own hue; strength shows coverage. */
export function figureFill(mode: BodyMode, id: AnyMuscleId, planned: VolumeMap, heat: Src, target: number, selectedGroup?: string | null): string {
  const t = targetFor(id, target);
  const hue = GROUP_HUE[groupOfAny(id)];
  if (mode === "heat") {
    const cell = heat.map[id];
    const st = statusFor(cell, heat.weeklyFactor, t);
    if (st === "none") return FIG_SKIN;
    if (st === "indirect") return INDIRECT_COLOR;
    return rampColor(heatLevel(cell, heat.weeklyFactor, t));
  }
  const st = statusFor(planned[id], 1, t);
  if (mode === "grow") {
    if (selectedGroup && groupOfAny(id) === selectedGroup) return hue;
    return st === "none" || st === "indirect" || st === "low" ? hue : mix(FIG_SKIN, hue, 0.12);
  }
  if (st === "none") return FIG_SKIN;
  return mix(FIG_SKIN, hue, st === "indirect" ? ROLE_STRENGTH.tertiary : st === "low" ? ROLE_STRENGTH.secondary : 1);
}

export function isUnder(mode: BodyMode, id: AnyMuscleId, planned: VolumeMap, heat: Src, target: number): boolean {
  const t = targetFor(id, target);
  if (mode === "heat") return ["none", "indirect", "low"].includes(statusFor(heat.map[id], heat.weeklyFactor, t));
  const st = statusFor(planned[id], 1, t);
  return mode === "grow" ? ["none", "indirect", "low"].includes(st) : st === "none" || st === "indirect";
}

export function Body() {
  const state = useDaylight();
  const today = localDate();
  const plan = activePlan(state.planVersions, today);
  const mode = state.bodyMode;
  const target = state.weeklyTarget;
  const detail = state.bodyDetail;
  const level: MapLevel = detail === "advanced" ? "sub" : "region";
  const planned = useMemo(() => plannedVolume(plan), [plan]);
  const heat = useMemo(() => heatSnapshot(state.sessions, plan, state.heatWindow, today), [state.sessions, plan, state.heatWindow, today]);
  const heatSrc: Src = heat;
  const style = state.bodyStyle ?? "map";
  const notes = useMemo(() => bodyNotes(state.observations), [state.observations]);
  const [turnView, setTurnView] = useState<TurnView>("front");
  const [turnSel, setTurnSel] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const raw = state.selectedMuscleId;
  const canon = raw ? resolveMuscle(raw) : null;
  if (canon) {
    // a stored id can be new (group / region / sub) or old (flat v2 ids): old ones open at their sub-part or group
    const id: AnyMuscleId = (isGroup(canon.id) || isRegion(canon.id) || isSub(canon.id) ? canon.id : canon.sub ?? canon.group) as AnyMuscleId;
    return <MusclePage key={id} id={id} planned={planned} heat={heat} />;
  }

  const underGroups = GROUPS.filter((g) => ["none", "indirect", "low"].includes(statusFor(planned[g.id], 1, targetFor(g.id, target))));
  const underSubs = SUBS.filter((s) => ["none", "indirect"].includes(statusFor(planned[s.id], 1, targetFor(s.id, target))));
  const open = (id: AnyMuscleId) => state.setBody({ selectedMuscleId: id });
  const fill = (id: AnyMuscleId) => figureFill(mode, id, planned, heatSrc, target);
  const under = (id: AnyMuscleId) => isUnder(mode, id, planned, heatSrc, target);

  return (
    <div>
      <PageHead eyebrow="Muscles" title="Body map" helper="Tap a region to see volume, notes, and moves." />
      <div className="flex flex-wrap items-center gap-2">
        <Segmented<BodyMode>
          label="Body map mode"
          value={mode}
          onChange={(v) => state.setBody({ bodyMode: v })}
          className="min-w-0 flex-1"
          options={[
            { id: "plan", label: "Explore" },
            { id: "heat", label: "Heat map" },
            { id: "grow", label: "Grow an area" },
          ]}
        />
        <Segmented<"map" | "turn">
          label="Figure style"
          value={style}
          onChange={(v) => state.setBody({ bodyStyle: v })}
          options={[
            { id: "map", label: "Front + back" },
            { id: "turn", label: "Turn" },
          ]}
        />
        <label className={cn("tap flex min-h-12 cursor-pointer items-center gap-2 rounded-2xl bg-surface-2 px-3 text-sm font-bold", style === "turn" && "pointer-events-none opacity-50")} data-testid="advanced-toggle">
          <span>Advanced</span>
          <input
            type="checkbox"
            role="switch"
            className="peer sr-only"
            checked={detail === "advanced"}
            onChange={(e) => state.setBody({ bodyDetail: e.target.checked ? "advanced" : "standard" })}
            aria-label="Advanced: show sub-muscles"
          />
          <span aria-hidden="true" className="relative h-6 w-11 rounded-full bg-line transition-colors peer-checked:bg-accent peer-focus-visible:ring-2 peer-focus-visible:ring-ink">
            <span className={cn("absolute top-0.5 size-5 rounded-full bg-canvas shadow transition-all", detail === "advanced" ? "left-[1.375rem]" : "left-0.5")} />
          </span>
        </label>
      </div>
      <p className="mt-2 text-sm text-ink-soft">
        {mode === "plan" ? "Tap any muscle to see the moves that work it: yours first, then others from the library." : null}
        {mode === "heat" ? (heat.source === "logged" ? `Built from sets you logged in the last ${state.heatWindow} days, including swaps and off-plan work.` : "Nothing logged in this window yet, so this shows your plan as written (per week).") : null}
        {mode === "grow" ? "Coloured areas are the ones your plan under-serves. Tap one for ideas. Suggestions are not in your PDF." : null}
        {detail === "advanced" ? " Advanced shows every sub-muscle." : null}
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

      <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,34rem)_minmax(0,1fr)] lg:items-start">
        <div>
          {style === "map" ? (
            <div className="figure-panel card overflow-hidden p-2 sm:p-4" data-testid="main-map" data-level={level}>
              <div className="grid grid-cols-2 gap-1 sm:gap-4">
                {(["front", "back"] as const).map((view) => (
                  <MapFigure key={view} view={view} level={level} className="mx-auto h-auto w-full max-w-[230px]" fill={fill} under={under} onSelect={open} showLabel pins={notes.pins} />
                ))}
              </div>
            </div>
          ) : (
            <div data-testid="turn-view">
              <div className="figure-panel card relative overflow-hidden">
                {mounted ? (
                  <Suspense fallback={<div className="grid h-[30rem] place-items-center text-sm text-ink-soft">Loading the figure…</div>}>
                    <TurnFigure
                      className="h-[30rem] w-full sm:h-[34rem]"
                      view={turnView}
                      fill={(id) => fill(id)}
                      under={(id) => under(id)}
                      selected={turnSel}
                      pins={notes.pins}
                      onSelect={(id) => setTurnSel(id)}
                    />
                  </Suspense>
                ) : (
                  <div className="h-[30rem]" />
                )}
                <div className="absolute inset-x-0 bottom-2 flex items-center justify-center gap-1.5">
                  <button type="button" className="tap grid size-9 place-items-center rounded-full bg-surface/90 text-ink shadow" aria-label="Turn left" data-testid="turn-ccw" onClick={() => setTurnView((v) => ({ front: "left", left: "back", back: "right", right: "front" } as const)[v])}>
                    <RotateCcw className="size-4" />
                  </button>
                  {(["front", "right", "back", "left"] as const).map((v) => (
                    <button key={v} type="button" data-testid={`turn-${v}`} aria-pressed={turnView === v} onClick={() => setTurnView(v)} className={cn("tap min-h-9 rounded-full px-3 text-xs font-bold shadow", turnView === v ? "bg-accent text-on-accent" : "bg-surface/90 text-ink")}>
                      {v[0]!.toUpperCase() + v.slice(1)}
                    </button>
                  ))}
                  <button type="button" className="tap grid size-9 place-items-center rounded-full bg-surface/90 text-ink shadow" aria-label="Turn right" data-testid="turn-cw" onClick={() => setTurnView((v) => ({ front: "right", right: "back", back: "left", left: "front" } as const)[v])}>
                    <RotateCw className="size-4" />
                  </button>
                </div>
              </div>
              <p className="mt-2 text-xs text-ink-soft">Drag to turn. Tap a muscle to pick it. Reference male scaled to 6&apos;4&quot;. Not a scan of you and not a medical model; zones are approximate.</p>
              {turnSel ? (
                <Card className="mt-2 flex flex-wrap items-center gap-2 p-3" >
                  <MapPin className="size-4 text-info" />
                  <span className="min-w-0 flex-1 font-bold" data-testid="turn-selected">{regionInfo(turnSel)?.name ?? turnSel}</span>
                  <Button size="sm" tone="sun" data-testid="turn-open" onClick={() => open(turnSel as AnyMuscleId)}>
                    See moves
                  </Button>
                  <Button size="sm" tone="soft" data-testid="turn-note" onClick={() => state.setOverlay({ type: "note", muscleId: turnSel, kind: "general" })}>
                    <Pencil className="size-4" /> Add a note
                  </Button>
                </Card>
              ) : null}
            </div>
          )}
          <Legend mode={mode} />
        </div>

        <div className="space-y-4">
          <BodyNotes notes={notes.list} />
          {mode === "grow" ? <GrowPicker under={underGroups.map((g) => g.id)} underSubs={underSubs.map((s) => s.id)} /> : <Overview planned={planned} heat={heat} mode={mode} underSubs={underSubs.map((s) => s.id)} />}
        </div>
      </div>
    </div>
  );
}

export function Legend({ mode }: { mode: BodyMode }) {
  return (
    <div className="mt-3 rounded-2xl bg-surface-2 p-3 text-xs text-ink-soft" data-testid="map-legend">
      {mode === "heat" ? (
        <div>
          <div className="h-3 w-full rounded-full" style={{ background: RAMP_CSS }} />
          <div className="mt-1 flex justify-between"><span>cold: a little</span><span>hot: at or over your weekly target</span></div>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="flex items-center gap-1.5"><i className="size-3 rounded-sm border border-line" style={{ background: FIG_SKIN }} /> not trained</span>
            <span className="flex items-center gap-1.5"><i className="size-3 rounded-sm" style={{ background: INDIRECT_COLOR }} /> indirect only</span>
            <span className="flex items-center gap-1.5"><i className="size-3 rounded-sm border-2 border-dashed border-ink-soft" /> underserved</span>
          </div>
        </div>
      ) : (
        <div>
          <ul className="flex flex-wrap gap-x-3 gap-y-1">
            {GROUPS.map((g) => (
              <li key={g.id} className="flex items-center gap-1.5">
                <i className="size-3 rounded-sm" style={{ background: GROUP_HUE[g.id] }} /> {g.name}
              </li>
            ))}
          </ul>
          <p className="mt-2">
            {mode === "plan" ? "Strong colour = well covered by your plan, faded = indirect only, pale = not trained. Dashed outline = underserved." : "Colour = an area your plan under-serves. Faded = covered."}
          </p>
        </div>
      )}
    </div>
  );
}

export function Overview({ planned, heat, mode, underSubs }: { planned: VolumeMap; heat: ReturnType<typeof heatSnapshot>; mode: BodyMode; underSubs: SubId[] }) {
  const state = useDaylight();
  const target = state.weeklyTarget;
  const src: Src = mode === "heat" ? heat : { map: planned, weeklyFactor: 1 };
  const rows = GROUPS.map((g) => ({ g, cell: src.map[g.id], st: statusAt(src, g.id, target) })).sort((a, b) => a.cell.effective - b.cell.effective);
  const under = rows.filter((r) => ["none", "indirect", "low"].includes(r.st));
  return (
    <>
      <Card className="animate-rise">
        <div className="flex items-center gap-2">
          <Target className="size-5 text-info" />
          <h2 className="t-title">{mode === "heat" ? (heat.source === "logged" ? "Where you actually are" : "Where the plan puts you") : "Underserved by your plan"}</h2>
        </div>
        {under.length ? (
          <ul className="mt-3 space-y-1.5">
            {under.map(({ g, cell, st }) => (
              <li key={g.id}>
                <button type="button" onClick={() => state.setBody({ selectedMuscleId: g.id })} className="tap flex w-full items-center gap-2 rounded-xl border border-line px-3 py-2 text-left hover:bg-surface-2">
                  <span className="flex-1 font-semibold">{g.name}</span>
                  <span className="text-sm tabular-nums text-ink-soft">{fmt(r1(cell.effective / src.weeklyFactor))}/wk</span>
                  <Badge tone={STATUS_TONE[st]}>{STATUS_LABEL[st]}</Badge>
                  <ArrowRight className="size-4 text-ink-faint" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-ink-soft">Every group reaches your target of {target} weighted sets/week.</p>
        )}
        {underSubs.length ? (
          <div className="mt-3">
            <Eyebrow>Parts with little or no direct work</Eyebrow>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {underSubs.slice(0, 14).map((id) => (
                <Chip key={id} tone="teal" onClick={() => state.setBody({ selectedMuscleId: id })}>
                  {subInfo(id)?.name}
                </Chip>
              ))}
            </div>
          </div>
        ) : null}
        <label className="mt-4 flex items-center gap-3 text-sm">
          <span className="flex-1 text-ink-soft">Your weekly target per group (weighted sets). Parts use about 60% of it. Not a rule: set what feels right.</span>
          <input aria-label="Weekly target" inputMode="numeric" className="field w-20 text-center tabular-nums" value={target} onChange={(e) => state.setWeeklyTarget(Math.max(1, Number(e.target.value) || 1))} />
        </label>
      </Card>
      <Card>
        <h2 className="t-title">All groups</h2>
        <ul className="mt-2 space-y-1">
          {rows.slice().reverse().map(({ g, cell, st }) => (
            <li key={g.id}>
              <button type="button" onClick={() => state.setBody({ selectedMuscleId: g.id })} className="tap grid w-full grid-cols-[7.5rem_1fr_3rem] items-center gap-2 rounded-lg px-1 py-1 text-left text-sm hover:bg-surface-2">
                <span className="truncate font-semibold">{g.name}</span>
                <span className="h-2.5 overflow-hidden rounded-full bg-surface-2">
                  <span className="block h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(100, (cell.effective / src.weeklyFactor / (target * 1.5)) * 100)}%`, background: st === "none" ? "transparent" : mode === "heat" ? rampColor(heatLevel(cell, src.weeklyFactor, target)) : GROUP_HUE[g.id] }} />
                </span>
                <span className="text-right tabular-nums text-ink-soft">{fmt(r1(cell.effective / src.weeklyFactor))}</span>
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-ink-faint">Weighted sets per week: primary 1, secondary 0.5, minor 0.25. A group counts a set once at its strongest part. An editorial mapping, not a measure of growth.</p>
      </Card>
    </>
  );
}

export function GrowPicker({ under, underSubs }: { under: GroupId[]; underSubs: SubId[] }) {
  const state = useDaylight();
  return (
    <Card className="animate-rise">
      <h2 className="t-title">Which area do you want to grow?</h2>
      <p className="mt-1 text-sm text-ink-soft">Tap the body, or choose below. You will see each part of the group and ideas for it.</p>
      {under.length ? (
        <>
          <Eyebrow className="mt-3">Underserved groups</Eyebrow>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {under.map((id) => (
              <Chip key={id} tone="teal" onClick={() => state.setBody({ selectedMuscleId: id })}>
                {groupInfo(id)?.name}
              </Chip>
            ))}
          </div>
        </>
      ) : null}
      {underSubs.length ? (
        <>
          <Eyebrow className="mt-3">Parts with little direct work</Eyebrow>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {underSubs.map((id) => (
              <Chip key={id} onClick={() => state.setBody({ selectedMuscleId: id })}>
                {subInfo(id)?.name}
              </Chip>
            ))}
          </div>
        </>
      ) : null}
      <Eyebrow className="mt-3">All groups</Eyebrow>
      <div className="mt-1.5 flex flex-wrap gap-2">
        {GROUPS.map((g) => (
          <Chip key={g.id} onClick={() => state.setBody({ selectedMuscleId: g.id })}>
            {g.name}
          </Chip>
        ))}
      </div>
    </Card>
  );
}



/** Every note that is attached to a muscle, in one list. The pins on the figure are these notes. */
export function BodyNotes({ notes }: { notes: ReturnType<typeof bodyNotes>["list"] }) {
  const state = useDaylight();
  return (
    <Card className="animate-rise" >
      <div className="flex items-center gap-2" data-testid="body-notes">
        <MapPin className="size-5 text-info" />
        <h2 className="flex-1 t-title">Body notes</h2>
        <Badge tone="plain">{notes.length}</Badge>
      </div>
      {notes.length === 0 ? (
        <p className="mt-2 text-sm text-ink-soft">Nothing pinned yet. Tap a muscle and add a note, or attach one from any quick note. Pinned notes show as numbered dots on the figure.</p>
      ) : (
        <ul className="mt-3 divide-y divide-line" data-testid="body-notes-list" aria-label="Notes attached to muscles">
          {notes.map((n) => (
            <li key={n.id} className="py-2.5">
              <button type="button" className="tap -mx-1 block w-[calc(100%+0.5rem)] rounded-lg px-1 text-left hover:bg-surface-2" onClick={() => state.setBody({ selectedMuscleId: n.region })}>
                <p className="text-xs font-bold uppercase tracking-wide text-info">
                  {regionInfo(n.region)?.name ?? n.region} <span className="font-medium normal-case tracking-normal text-ink-faint">· {n.context.date}</span>
                </p>
                <p className="text-sm">{n.text}</p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
