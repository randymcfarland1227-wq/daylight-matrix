import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, Flame, Lightbulb, Maximize2, Minimize2, Pencil, PlayCircle, Target, X } from "lucide-react";
import { localDate, WEEKDAY_NAMES } from "@/lib/daylight/dates";
import { exerciseById } from "@/lib/daylight/exercises";
import { GROUPS, SUBS, groupInfo, isGroup, isSub, muscleGroupOf, muscleName, subInfo, targetFor, type GroupId, type MuscleId, type SubId, type View } from "@/lib/daylight/muscles";
import { activePlan } from "@/lib/daylight/plan";
import { useDaylight } from "@/lib/daylight/store";
import { STATUS_LABEL, fmt, heatLevel, heatSnapshot, plannedVolume, planExerciseIdSet, statusFor, suggestionsFor, type CoverageStatus, type MuscleVolume } from "@/lib/daylight/volume";
import type { BodyMode } from "@/lib/daylight/types";
import { BodyFigure, GROUP_BOX, heatColor } from "./BodyFigure";
import { MoveThumb } from "./MoveArt";
import { Badge, Button, Card, Chip, Eyebrow, PageHead, Segmented, cn } from "./ui";

const STATUS_TONE: Record<CoverageStatus, "danger" | "copper" | "sun" | "forest" | "teal"> = {
  none: "danger",
  indirect: "copper",
  low: "sun",
  ok: "forest",
  high: "teal",
};

/** "Indirect only": a muted tan so it reads between idle and lightly trained. */
const INDIRECT = "#8b7a5c";
const r1 = (n: number) => Math.round(n * 10) / 10;

type Src = { map: ReturnType<typeof plannedVolume>; weeklyFactor: number };

function statusAt(src: Src, id: MuscleId, target: number): CoverageStatus {
  return statusFor(src.map[id], src.weeklyFactor, targetFor(id, target));
}

function colorFor(mode: BodyMode, src: Src, planned: Src["map"], id: MuscleId, target: number, selected: string | null, grow: Set<string>): string {
  const t = targetFor(id, target);
  if (mode === "heat") return heatColor(heatLevel(src.map[id], src.weeklyFactor, t));
  if (mode === "grow") {
    if (selected && id === selected) return "var(--forest)";
    return grow.has(id) ? "var(--teal)" : "var(--muscle-idle)";
  }
  const st = statusFor(planned[id], 1, t);
  return st === "none" ? "var(--muscle-idle)" : st === "indirect" ? INDIRECT : heatColor(Math.min(1, planned[id].effective / (t * 1.4)));
}

export function Body() {
  const state = useDaylight();
  const today = localDate();
  const plan = activePlan(state.planVersions, today);
  const mode = state.bodyMode;
  const target = state.weeklyTarget;
  const planned = useMemo(() => plannedVolume(plan), [plan]);
  const heat = useMemo(() => heatSnapshot(state.sessions, plan, state.heatWindow, today), [state.sessions, plan, state.heatWindow, today]);
  const src: Src = mode === "heat" ? heat : { map: planned, weeklyFactor: 1 };

  // any stored id (group, sub, or an old flat id) maps to a group sheet, with the sub pre-selected when there is one
  const raw = state.selectedMuscleId;
  const sheetGroup = raw ? muscleGroupOf(raw) : null;
  const sheetSub = raw && isSub(raw) ? (raw as SubId) : null;

  const underGroups = GROUPS.filter((g) => ["none", "indirect", "low"].includes(statusFor(planned[g.id], 1, targetFor(g.id, target))));
  const underSubs = SUBS.filter((s) => ["none", "indirect"].includes(statusFor(planned[s.id], 1, targetFor(s.id, target))));
  const growSet = useMemo(() => new Set<string>([...underGroups.map((g) => g.id)]), [underGroups.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const fill = (id: MuscleId) => colorFor(mode, src, planned, id, target, sheetGroup, growSet);
  const open = (id: MuscleId) => state.setBody({ selectedMuscleId: id });

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
        {mode === "plan" ? "Tap a muscle group to open it and see its parts, which moves hit each one, and how many sets." : null}
        {mode === "heat" ? (heat.source === "logged" ? `Built from sets you logged in the last ${state.heatWindow} days, including swaps and off-plan work.` : "Nothing logged in this window yet, so this shows your plan as written (per week).") : null}
        {mode === "grow" ? "Tap a group to see its under-served parts. Outlined groups are areas your plan under-serves. Suggestions are not in your PDF." : null}
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
            <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(120% 70% at 50% 100%, color-mix(in srgb, var(--sun) 14%, transparent), transparent 70%)" }} />
            <div className="relative grid grid-cols-2 gap-1" data-testid="main-map">
              {(["front", "back"] as const).map((view) => (
                <div key={view} className="text-center">
                  <BodyFigure
                    view={view}
                    level="group"
                    className="mx-auto h-auto w-full max-w-[210px]"
                    fill={fill}
                    selected={sheetGroup}
                    onSelect={(id) => open(id)}
                    under={mode === "grow" || mode === "plan" ? (id) => growSet.has(id) : undefined}
                  />
                  <p className="-mt-2 pb-1 text-[0.7rem] font-bold uppercase tracking-widest text-ink-soft">{view}</p>
                </div>
              ))}
            </div>
          </div>
          <Legend mode={mode} />
        </div>

        <div className="space-y-4">
          {mode === "grow" ? <GrowPicker under={underGroups.map((g) => g.id)} underSubs={underSubs.map((s) => s.id)} /> : <Overview planned={planned} heat={heat} mode={mode} underSubs={underSubs.map((s) => s.id)} />}
        </div>
      </div>

      {sheetGroup ? <GroupSheet key={sheetGroup} groupId={sheetGroup} initialSub={sheetSub} planned={planned} heat={heat} onClose={() => state.setBody({ selectedMuscleId: null })} /> : null}
    </div>
  );
}

function Legend({ mode }: { mode: BodyMode }) {
  return (
    <div className="mt-3 rounded-2xl bg-surface-2 p-3 text-xs text-ink-soft">
      {mode === "plan" ? (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="flex items-center gap-1.5"><i className="size-3 rounded-sm" style={{ background: heatColor(0.9) }} /> well covered</span>
          <span className="flex items-center gap-1.5"><i className="size-3 rounded-sm" style={{ background: INDIRECT }} /> indirect only</span>
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
          <span className="flex items-center gap-1.5"><i className="size-3 rounded-sm bg-teal" /> underserved group</span>
          <span className="flex items-center gap-1.5"><i className="size-3 rounded-sm bg-[var(--muscle-idle)]" /> covered</span>
        </div>
      )}
    </div>
  );
}

function Overview({ planned, heat, mode, underSubs }: { planned: Src["map"]; heat: ReturnType<typeof heatSnapshot>; mode: BodyMode; underSubs: SubId[] }) {
  const state = useDaylight();
  const target = state.weeklyTarget;
  const src: Src = mode === "heat" ? heat : { map: planned, weeklyFactor: 1 };
  const rows = GROUPS.map((g) => ({ g, cell: src.map[g.id], st: statusAt(src, g.id, target) })).sort((a, b) => a.cell.effective - b.cell.effective);
  const under = rows.filter((r) => ["none", "indirect", "low"].includes(r.st));
  return (
    <>
      <Card className="animate-rise">
        <div className="flex items-center gap-2">
          <Target className="size-5 text-teal" />
          <h2 className="font-display text-xl">{mode === "heat" ? (heat.source === "logged" ? "Where you actually are" : "Where the plan puts you") : "Underserved by your plan"}</h2>
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
        <h2 className="font-display text-xl">All groups</h2>
        <ul className="mt-2 space-y-1">
          {rows.slice().reverse().map(({ g, cell, st }) => (
            <li key={g.id}>
              <button type="button" onClick={() => state.setBody({ selectedMuscleId: g.id })} className="tap grid w-full grid-cols-[7.5rem_1fr_3rem] items-center gap-2 rounded-lg px-1 py-1 text-left text-sm hover:bg-surface-2">
                <span className="truncate font-semibold">{g.name}</span>
                <span className="h-2.5 overflow-hidden rounded-full bg-surface-2">
                  <span className="block h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(100, (cell.effective / src.weeklyFactor / (target * 1.5)) * 100)}%`, background: st === "none" ? "transparent" : heatColor(heatLevel(cell, src.weeklyFactor, target)) }} />
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

function GrowPicker({ under, underSubs }: { under: GroupId[]; underSubs: SubId[] }) {
  const state = useDaylight();
  return (
    <Card className="animate-rise">
      <h2 className="font-display text-xl">Which area do you want to grow?</h2>
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

/* ------------------------------------------------------------------ group sheet */

function GroupSheet({ groupId, initialSub, planned, heat, onClose }: { groupId: GroupId; initialSub: SubId | null; planned: Src["map"]; heat: ReturnType<typeof heatSnapshot>; onClose: () => void }) {
  const state = useDaylight();
  const g = groupInfo(groupId)!;
  const target = state.weeklyTarget;
  const plan = activePlan(state.planVersions, localDate());
  const [full, setFull] = useState(false);
  const [sub, setSub] = useState<SubId | null>(initialSub);
  const [view, setView] = useState<View>(g.views.includes("back") && !g.views.includes("front") ? "back" : "front");
  const mode = state.bodyMode;
  const lens: "plan" | "heat" = mode === "heat" ? "heat" : "plan";
  const src: Src = lens === "heat" ? heat : { map: planned, weeklyFactor: 1 };
  const subs = g.subs.map((id) => subInfo(id)!);
  const underIds = new Set(subs.filter((s) => ["none", "indirect"].includes(statusFor(planned[s.id], 1, targetFor(s.id, target)))).map((s) => s.id));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const fillSub = (id: MuscleId) => {
    if (mode === "grow") return id === sub ? "var(--forest)" : underIds.has(id as SubId) ? "var(--teal)" : "var(--muscle-idle)";
    return colorFor(lens, src, planned, id, target, sub, new Set());
  };
  const viewsHere = g.views;
  const box = GROUP_BOX[groupId][view] ?? GROUP_BOX[groupId][viewsHere[0]!];
  const groupCell = src.map[groupId];
  const groupSt = statusAt(src, groupId, target);
  const selSub = sub ? subInfo(sub)! : null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center" data-testid="group-sheet">
      <button type="button" aria-label="Close" className="fade-in absolute inset-0 bg-[#0c0a08]/60 backdrop-blur-[2px]" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${g.name} detail`}
        data-full={full}
        className={cn(
          "sheet-in relative z-10 flex w-full flex-col border border-line bg-canvas outline-none",
          full ? "h-dvh max-w-none rounded-none" : "h-[92dvh] max-w-3xl rounded-t-[1.75rem] md:h-[86dvh] md:rounded-[1.75rem]",
        )}
      >
        <div className="flex shrink-0 items-start gap-3 px-5 pb-2 pt-4" style={{ paddingTop: full ? "max(1rem, env(safe-area-inset-top))" : undefined }}>
          <div className="min-w-0 flex-1">
            <Eyebrow>Muscle group</Eyebrow>
            <h2 className="font-display text-3xl leading-tight">{g.name}</h2>
            <p className="mt-0.5 text-sm text-ink-soft">{g.blurb}</p>
          </div>
          <button type="button" onClick={() => setFull((v) => !v)} aria-label={full ? "Exit full screen" : "Full screen"} aria-pressed={full} className="tap grid size-10 shrink-0 place-items-center rounded-full bg-surface-2 text-ink">
            {full ? <Minimize2 className="size-5" /> : <Maximize2 className="size-5" />}
          </button>
          <button type="button" onClick={onClose} aria-label="Close group" className="tap grid size-10 shrink-0 place-items-center rounded-full bg-surface-2 text-ink">
            <X className="size-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8">
          <div className="flex flex-wrap items-center gap-2">
            <Segmented<BodyMode>
              label="Sub-part view"
              value={mode === "heat" ? "heat" : mode === "grow" ? "grow" : "plan"}
              onChange={(v) => state.setBody({ bodyMode: v })}
              options={[
                { id: "plan", label: "Plan" },
                { id: "heat", label: "Heat" },
                { id: "grow", label: "Grow" },
              ]}
              className="max-w-xs flex-1"
            />
            <Badge tone={STATUS_TONE[groupSt]}>{STATUS_LABEL[groupSt]}</Badge>
            <span className="text-xs text-ink-soft tabular-nums">
              {fmt(r1(groupCell.effective / src.weeklyFactor))} sets/wk {lens === "heat" ? (heat.source === "logged" ? "logged" : "planned") : "planned"} · target {target}
            </span>
          </div>

          <div className={cn("mt-4 grid gap-5", full ? "md:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]" : "md:grid-cols-[minmax(0,16rem)_minmax(0,1fr)]")}>
            <div>
              {viewsHere.length > 1 ? (
                <Segmented<View> label="Front or back" value={view} onChange={setView} options={[{ id: "front", label: "Front" }, { id: "back", label: "Back" }]} className="mb-2" />
              ) : null}
              <div className="card relative overflow-hidden p-2" data-testid="sub-map">
                <BodyFigure
                  view={view}
                  level="sub"
                  onlyGroup={groupId}
                  viewBox={box}
                  className="mx-auto h-auto w-full max-h-[60dvh]"
                  fill={fillSub}
                  selected={sub}
                  onSelect={(id) => setSub((cur) => (cur === id ? null : (id as SubId)))}
                  under={(id) => underIds.has(id as SubId)}
                  label={`${g.name} parts, ${view}`}
                />
              </div>
              <p className="mt-1 px-1 text-[0.7rem] text-ink-faint">Dashed shapes are deep muscles you can’t see from the surface. Tap a part.</p>
            </div>

            <div>
              <ul className="space-y-1.5" aria-label={`${g.name} parts`}>
                {subs.map((s) => {
                  const pc = planned[s.id];
                  const sc = src.map[s.id];
                  const st = statusFor(sc, src.weeklyFactor, targetFor(s.id, target));
                  const active = sub === s.id;
                  const hasView = s.views.includes(view);
                  return (
                    <li key={s.id}>
                      <button
                        type="button"
                        data-sub={s.id}
                        aria-pressed={active}
                        onClick={() => {
                          setSub(active ? null : s.id);
                          if (!hasView) setView(s.views[0]!);
                        }}
                        className={cn("tap grid w-full grid-cols-[0.9rem_1fr_auto] items-center gap-2 rounded-xl border px-3 py-2 text-left", active ? "border-sun bg-sun/10" : "border-line hover:bg-surface-2")}
                      >
                        <i className="size-3 rounded-sm" style={{ background: fillSub(s.id) }} />
                        <span className="min-w-0">
                          <span className="block truncate font-semibold">{s.name}</span>
                          <span className="block text-xs text-ink-soft tabular-nums">
                            plan {fmt(r1(pc.effective))}/wk · direct {fmt(r1(pc.direct))}
                            {heat.source === "logged" ? ` · logged ${fmt(r1(heat.map[s.id].effective / heat.weeklyFactor))}/wk` : ""}
                          </span>
                        </span>
                        <Badge tone={STATUS_TONE[st]}>{STATUS_LABEL[st]}</Badge>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-2 text-xs text-ink-faint">Parts use a target of {targetFor(subs[0]!.id, target)} weighted sets/week (60% of your group target). “Only indirect work” means it helps in other moves but nothing aims at it.</p>
            </div>
          </div>

          {selSub ? (
            <SubDetail sub={selSub.id} planned={planned} heat={heat} planIds={planExerciseIdSet(plan)} showGrow={mode === "grow" || underIds.has(selSub.id)} />
          ) : (
            <GroupMoves groupId={groupId} planned={planned} planIds={planExerciseIdSet(plan)} />
          )}
        </div>
      </div>
    </div>
  );
}

function MoveRow({ h, id }: { h: MuscleVolume["hits"][number]; id: string }) {
  const state = useDaylight();
  const known = Boolean(exerciseById(h.exerciseId));
  return (
    <li className="flex items-center gap-2 rounded-xl border border-line px-3 py-2">
      {known ? <MoveThumb exerciseId={h.exerciseId} size={40} /> : null}
      <Badge tone={h.role === "primary" ? "copper" : "plain"}>{h.role}</Badge>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{h.name}</p>
        <p className="text-xs text-ink-soft">
          {h.days.map((d) => WEEKDAY_NAMES[d]!.slice(0, 3)).join(", ")}
          {h.days.length ? " · " : ""}
          {fmt(h.sets)} sets/wk
        </p>
      </div>
      {known ? (
        <Button size="sm" tone="soft" aria-label={`Form guide for ${h.name}`} onClick={() => state.setOverlay({ type: "form", exerciseId: h.exerciseId })}>
          <PlayCircle className="size-4" /> Form
        </Button>
      ) : (
        <Badge tone="sun">off-plan</Badge>
      )}
      {known ? (
        <button type="button" aria-label={`Add a note on ${h.name}`} className="tap text-xs font-bold text-forest underline" onClick={() => state.setOverlay({ type: "note", exerciseId: h.exerciseId, muscleId: id, kind: "gym" })}>
          note
        </button>
      ) : null}
    </li>
  );
}

function GroupMoves({ groupId, planned, planIds }: { groupId: GroupId; planned: Src["map"]; planIds: Set<string> }) {
  void planIds;
  const hits = planned[groupId].hits.filter((h) => !h.alt);
  return (
    <Card className="mt-5">
      <h3 className="font-display text-xl">Plan moves that hit this group</h3>
      <p className="text-xs text-ink-soft">Pick a part above to see only the moves that hit that part.</p>
      <ul className="mt-2 space-y-1.5">
        {hits.map((h) => (
          <MoveRow key={h.exerciseId} h={h} id={groupId} />
        ))}
        {hits.length === 0 ? <li className="text-sm text-ink-soft">Nothing in the plan trains this group.</li> : null}
      </ul>
    </Card>
  );
}

function SubDetail({ sub, planned, heat, planIds, showGrow }: { sub: SubId; planned: Src["map"]; heat: ReturnType<typeof heatSnapshot>; planIds: Set<string>; showGrow: boolean }) {
  const state = useDaylight();
  const info = subInfo(sub)!;
  const cell = planned[sub];
  const logged: MuscleVolume = heat.map[sub];
  const target = state.weeklyTarget;
  const st = statusFor(cell, 1, targetFor(sub, target));
  const hits = cell.hits.filter((h) => !h.alt);
  const alts = cell.hits.filter((h) => h.alt);
  const sugg = suggestionsFor(sub, planIds, 6);
  const notes = state.observations.filter((o) => o.context.muscleId === sub || (o.context.muscleId && o.context.muscleId !== info.group && muscleGroupOf(o.context.muscleId) === info.group && muscleName(o.context.muscleId) === info.name));
  const offPlan = heat.source === "logged" ? logged.hits.filter((h) => !exerciseById(h.exerciseId)) : [];
  return (
    <div className="mt-5 space-y-4" data-testid="sub-detail">
      <Card className="animate-pop">
        <Eyebrow>{groupInfo(info.group)?.name}</Eyebrow>
        <h3 className="font-display text-2xl leading-tight">{info.name}</h3>
        <p className="mt-1 text-sm text-ink-soft">{info.blurb}</p>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <Mini label="Plan / wk" value={fmt(r1(cell.effective))} />
          <Mini label="Direct sets" value={fmt(r1(cell.direct))} />
          <Mini label={heat.source === "logged" ? `Logged ${state.heatWindow}d` : "Logged"} value={heat.source === "logged" ? fmt(r1(logged.effective)) : "–"} />
        </div>
        <div className="mt-3 flex items-center gap-2">
          <Badge tone={STATUS_TONE[st]}>{STATUS_LABEL[st]}</Badge>
          <span className="text-xs text-ink-soft">vs {targetFor(sub, target)} weighted sets/week for a part</span>
        </div>
      </Card>

      <Card>
        <h3 className="font-display text-xl">Plan moves that hit it</h3>
        {hits.length === 0 ? <p className="mt-2 text-sm text-ink-soft">Nothing in the plan trains this part, directly or indirectly.</p> : null}
        <ul className="mt-2 space-y-1.5">
          {hits.map((h) => (
            <MoveRow key={h.exerciseId} h={h} id={sub} />
          ))}
        </ul>
        {alts.length ? <p className="mt-2 text-xs text-ink-soft">Swap options that also hit it: {alts.map((a) => a.name).join(", ")}.</p> : null}
        {offPlan.length ? (
          <div className="mt-3">
            <Eyebrow>Logged off-plan work that counted</Eyebrow>
            <ul className="mt-1 space-y-1.5">
              {offPlan.map((h) => (
                <MoveRow key={h.exerciseId} h={h} id={sub} />
              ))}
            </ul>
          </div>
        ) : null}
      </Card>

      {showGrow || sugg.length ? (
        <Card className="border-teal/40">
          <div className="flex flex-wrap items-center gap-2">
            <Lightbulb className="size-5 text-teal" />
            <h3 className="font-display text-xl">Ideas to grow it</h3>
            <Badge tone="teal" className="ml-auto">suggestions, not in your PDF</Badge>
          </div>
          <p className="mt-1 text-xs text-ink-soft">Candidate moves from the library, back-friendly options first. General movement notes only, not medical advice.</p>
          <ul className="mt-2 space-y-1.5">
            {sugg.map((s) => (
              <li key={s.exerciseId} className="rounded-xl border border-line px-3 py-2">
                <div className="flex items-center gap-2">
                  <MoveThumb exerciseId={s.exerciseId} size={40} />
                  <p className="flex-1 font-semibold">{s.name}</p>
                  <Badge tone={s.role === "primary" ? "copper" : "plain"}>{s.role}</Badge>
                  {s.back === "friendly" ? <Badge tone="teal">back-friendly</Badge> : s.back === "caution" ? <Badge tone="copper"><AlertTriangle className="size-3" /> go easy</Badge> : null}
                </div>
                <p className="mt-1 text-xs text-ink-soft">
                  {s.equipment}
                  {s.backNote ? ` · ${s.backNote}` : ""}
                </p>
                <div className="mt-0.5 flex flex-wrap gap-1">
                  <Button tone="ghost" size="sm" className="-ml-2" onClick={() => state.setOverlay({ type: "form", exerciseId: s.exerciseId })}>
                    <PlayCircle className="size-4" /> Form guide
                  </Button>
                  <Button tone="ghost" size="sm" onClick={() => state.setOverlay({ type: "move", exerciseId: s.exerciseId })}>
                    Add to a plan draft
                  </Button>
                </div>
              </li>
            ))}
            {sugg.length === 0 ? <li className="text-sm text-ink-soft">No extra candidates in the library for this part.</li> : null}
          </ul>
        </Card>
      ) : (
        <Button tone="outline" onClick={() => state.setBody({ bodyMode: "grow" })}>
          <Flame className="size-4" /> See ideas to grow this part
        </Button>
      )}

      <Card>
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl">Your notes here</h3>
          <Button size="sm" tone="soft" onClick={() => state.setOverlay({ type: "note", muscleId: sub, kind: "gym" })}>
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
    </div>
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

export { isGroup };
