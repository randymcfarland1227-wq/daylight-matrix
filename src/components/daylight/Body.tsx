import { useMemo } from "react";
import { ArrowRight, Target } from "lucide-react";
import { localDate } from "@/lib/daylight/dates";
import {
  GROUPS,
  SUBS,
  groupInfo,
  isGroup,
  isRegion,
  isSub,
  resolveMuscle,
  subInfo,
  targetFor,
  type AnyMuscleId,
  type GroupId,
  type SubId,
} from "@/lib/daylight/muscles";
import { activePlan } from "@/lib/daylight/plan";
import { useDaylight } from "@/lib/daylight/store";
import {
  STATUS_LABEL,
  fmt,
  heatLevel,
  heatSnapshot,
  plannedVolume,
  statusFor,
  type CoverageStatus,
  type VolumeMap,
} from "@/lib/daylight/volume";
import type { BodyMode } from "@/lib/daylight/types";
import {
  FIG_SKIN,
  GROUP_HUE,
  INDIRECT_COLOR,
  RAMP_CSS,
  mix,
  rampColor,
  ROLE_STRENGTH,
} from "@/lib/daylight/figureColors";

import { MapFigure, type MapLevel } from "./MapFigure";
import { BodyJournal } from "./BodyJournal";
import { MusclePage } from "./MusclePage";
import { Badge, Button, Card, Chip, Eyebrow, PageHead, Segmented } from "./ui";

export const STATUS_TONE: Record<CoverageStatus, "danger" | "copper" | "sun" | "forest" | "teal"> =
  {
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
export function figureFill(
  mode: BodyMode,
  id: AnyMuscleId,
  planned: VolumeMap,
  heat: Src,
  target: number,
  selectedGroup?: string | null,
): string {
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
  return mix(
    FIG_SKIN,
    hue,
    st === "indirect" ? ROLE_STRENGTH.tertiary : st === "low" ? ROLE_STRENGTH.secondary : 1,
  );
}

export function isUnder(
  mode: BodyMode,
  id: AnyMuscleId,
  planned: VolumeMap,
  heat: Src,
  target: number,
): boolean {
  const t = targetFor(id, target);
  if (mode === "heat") return false;
  const st = statusFor(planned[id], 1, t);
  return mode === "grow"
    ? ["none", "indirect", "low"].includes(st)
    : st === "none" || st === "indirect";
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
  const heat = useMemo(
    () => heatSnapshot(state.sessions, plan, state.heatWindow, today),
    [state.sessions, plan, state.heatWindow, today],
  );
  const heatSrc: Src = heat;

  const raw = state.selectedMuscleId;
  const canon = raw ? resolveMuscle(raw) : null;
  const journal = state.bodyWorkspace !== "training";
  if (!journal && canon) {
    // a stored id can be new (group / region / sub) or old (flat v2 ids): old ones open at their sub-part or group
    const id: AnyMuscleId = (
      isGroup(canon.id) || isRegion(canon.id) || isSub(canon.id)
        ? canon.id
        : (canon.sub ?? canon.group)
    ) as AnyMuscleId;
    return (
      <div>
        <Button
          tone="ghost"
          className="mb-4"
          onClick={() => state.setBody({ bodyWorkspace: "journal" })}
        >
          ← Return to area journal
        </Button>
        <p className="eyebrow mb-3">Training guide · exercises and coverage</p>
        <MusclePage key={id} id={id} planned={planned} heat={heat} />
      </div>
    );
  }

  const fill = (id: AnyMuscleId) => figureFill(mode, id, planned, heatSrc, target);
  const under = (id: AnyMuscleId) => isUnder(mode, id, planned, heatSrc, target);
  const underSubs = SUBS.filter((s) =>
    ["none", "indirect"].includes(statusFor(planned[s.id], 1, targetFor(s.id, target))),
  );
  return (
    <div>
      <PageHead
        title="Body"
        helper="Notice what changes. Keep a record by area. Use it when you review your plan."
      />
      <Segmented
        label="Body workspace"
        value={journal ? "journal" : "training"}
        onChange={(v) => state.setBody({ bodyWorkspace: v, selectedMuscleId: null })}
        options={[
          { id: "journal", label: "Area journal" },
          { id: "training", label: "Training guide" },
        ]}
        className="mb-5"
      />
      {journal ? (
        <BodyJournal />
      ) : (
        <>
          <div className="flex flex-wrap gap-3 items-center">
            <Segmented<BodyMode>
              label="Training coverage"
              value={mode}
              onChange={(v) => state.setBody({ bodyMode: v })}
              options={[
                { id: "plan", label: "Planned work" },
                { id: "heat", label: "Logged sets" },
                { id: "grow", label: "Compare areas" },
              ]}
            />
            <label className="text-sm flex items-center gap-2">
              <input
                type="checkbox"
                checked={detail === "advanced"}
                onChange={(e) =>
                  state.setBody({ bodyDetail: e.target.checked ? "advanced" : "standard" })
                }
              />
              Detailed muscles
            </label>
          </div>
          <p className="mt-3 text-sm text-ink-soft">
            {mode === "heat"
              ? `Estimated coverage from sets you logged in the last ${state.heatWindow} days. An empty log leaves the map uncoloured.`
              : "Select an area to explore exercises and estimated training coverage."}
          </p>
          {mode === "heat" ? (
            <div className="flex gap-2 mt-3">
              {([7, 14, 30] as const).map((d) => (
                <Chip
                  key={d}
                  active={state.heatWindow === d}
                  onClick={() => state.setBody({ heatWindow: d })}
                >
                  {d} days
                </Chip>
              ))}
              <Badge className="ml-auto">{fmt(heat.totalSets)} logged sets</Badge>
            </div>
          ) : null}
          <div className="mt-5 grid gap-5 lg:grid-cols-2 items-start">
            <div>
              <div
                className="figure-panel card p-4 grid grid-cols-2"
                data-testid="main-map"
                data-level={level}
              >
                {(["front", "back"] as const).map((view) => (
                  <MapFigure
                    key={view}
                    view={view}
                    level={level}
                    className="mx-auto w-full max-w-[230px]"
                    fill={fill}
                    under={under}
                    onSelect={(id) => state.setBody({ selectedMuscleId: id })}
                    showLabel
                  />
                ))}
              </div>
              <Legend mode={mode} />
            </div>
            <Overview
              planned={planned}
              heat={heat}
              mode={mode}
              underSubs={underSubs.map((s) => s.id)}
            />
          </div>
        </>
      )}
    </div>
  );
}

export function Legend({ mode }: { mode: BodyMode }) {
  return (
    <div
      className="mt-3 rounded-lg bg-surface-2 p-3 text-xs text-ink-soft"
      data-testid="map-legend"
    >
      {mode === "heat" ? (
        <div>
          <div className="h-3 w-full rounded-full" style={{ background: RAMP_CSS }} />
          <div className="mt-1 flex justify-between">
            <span>Lower recorded coverage</span>
            <span>At or above comparison range</span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="flex items-center gap-1.5">
              <i
                className="size-3 rounded-sm border border-line"
                style={{ background: FIG_SKIN }}
              />{" "}
              no recorded work
            </span>
            <span className="flex items-center gap-1.5">
              <i className="size-3 rounded-sm" style={{ background: INDIRECT_COLOR }} /> indirect
              only
            </span>
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
            {mode === "plan"
              ? "Stronger colour = more planned work. Faded = indirect work only. Pale = no mapped work. Dashed outline = below your comparison range."
              : "Colour = an area your plan under-serves. Faded = covered."}
          </p>
        </div>
      )}
    </div>
  );
}

export function Overview({
  planned,
  heat,
  mode,
  underSubs,
}: {
  planned: VolumeMap;
  heat: ReturnType<typeof heatSnapshot>;
  mode: BodyMode;
  underSubs: SubId[];
}) {
  const state = useDaylight();
  const target = state.weeklyTarget;
  const src: Src = mode === "heat" ? heat : { map: planned, weeklyFactor: 1 };
  const rows = GROUPS.map((g) => ({
    g,
    cell: src.map[g.id],
    st: statusAt(src, g.id, target),
  })).sort((a, b) => a.cell.effective - b.cell.effective);
  const under = rows.filter((r) => ["none", "indirect", "low"].includes(r.st));
  return (
    <>
      <Card className="animate-rise">
        <div className="flex items-center gap-2">
          <Target className="size-5 text-info" />
          <h2 className="t-title">
            {mode === "heat" ? "Logged training coverage" : "Areas below your comparison range"}
          </h2>
        </div>
        {mode === "heat" && heat.totalSets === 0 ? (
          <p className="mt-3 text-sm text-ink-soft">
            No sets recorded in this window. The map stays uncoloured until you log work. Use
            Planned to explore your program.
          </p>
        ) : under.length ? (
          <ul className="mt-3 space-y-1.5">
            {under.map(({ g, cell, st }) => (
              <li key={g.id}>
                <button
                  type="button"
                  onClick={() => state.setBody({ selectedMuscleId: g.id })}
                  className="tap flex w-full items-center gap-2 rounded-xl border border-line px-3 py-2 text-left hover:bg-surface-2"
                >
                  <span className="flex-1 font-semibold">{g.name}</span>
                  <span className="text-sm tabular-nums text-ink-soft">
                    {fmt(r1(cell.effective / src.weeklyFactor))}/wk
                  </span>
                  <Badge tone={STATUS_TONE[st]}>{STATUS_LABEL[st]}</Badge>
                  <ArrowRight className="size-4 text-ink-faint" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-ink-soft">
            Every group reaches your target of {target} weighted sets/week.
          </p>
        )}
        {mode !== "heat" && underSubs.length ? (
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
          <span className="flex-1 text-ink-soft">
            Comparison range in weighted sets per week. This estimate describes coverage; it does
            not measure strength, recovery, or readiness.
          </span>
          <input
            aria-label="Weekly target"
            inputMode="numeric"
            className="field w-20 text-center tabular-nums"
            value={target}
            onChange={(e) => state.setWeeklyTarget(Math.max(1, Number(e.target.value) || 1))}
          />
        </label>
      </Card>
      <Card>
        <h2 className="t-title">All groups</h2>
        <ul className="mt-2 space-y-1">
          {rows
            .slice()
            .reverse()
            .map(({ g, cell, st }) => (
              <li key={g.id}>
                <button
                  type="button"
                  onClick={() => state.setBody({ selectedMuscleId: g.id })}
                  className="tap grid w-full grid-cols-[7.5rem_1fr_3rem] items-center gap-2 rounded-lg px-1 py-1 text-left text-sm hover:bg-surface-2"
                >
                  <span className="truncate font-semibold">{g.name}</span>
                  <span className="h-2.5 overflow-hidden rounded-full bg-surface-2">
                    <span
                      className="block h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.min(100, (cell.effective / src.weeklyFactor / (target * 1.5)) * 100)}%`,
                        background:
                          st === "none"
                            ? "transparent"
                            : mode === "heat"
                              ? rampColor(heatLevel(cell, src.weeklyFactor, target))
                              : GROUP_HUE[g.id],
                      }}
                    />
                  </span>
                  <span className="text-right tabular-nums text-ink-soft">
                    {fmt(r1(cell.effective / src.weeklyFactor))}
                  </span>
                </button>
              </li>
            ))}
        </ul>
        <p className="mt-2 text-xs text-ink-faint">
          Weighted sets per week: primary 1, secondary 0.5, minor 0.25. A group counts a set once at
          its strongest part. An editorial mapping, not a measure of growth.
        </p>
      </Card>
    </>
  );
}

export function GrowPicker({ under, underSubs }: { under: GroupId[]; underSubs: SubId[] }) {
  const state = useDaylight();
  return (
    <Card className="animate-rise">
      <h2 className="t-title">Which area do you want to grow?</h2>
      <p className="mt-1 text-sm text-ink-soft">
        Tap the body, or choose below. You will see each part of the group and ideas for it.
      </p>
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
