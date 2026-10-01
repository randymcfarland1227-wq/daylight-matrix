import { useState } from "react";
import { HEAT_BANDS, MAPPINGS, muscleLabel, regionById } from "@/lib/daylight/body";
import { WEEKDAY_NAMES, localDate } from "@/lib/daylight/dates";
import { coverageWindow, otherActivitySummary, strengthCoverage } from "@/lib/daylight/logic";
import { exerciseLabel } from "@/lib/daylight/names";
import { PT_REFERENCES, UNSCHEDULED, activePlan, dayTemplate, exerciseById } from "@/lib/daylight/plan";
import { useDaylight } from "@/lib/daylight/store";
import type { PlanVersion } from "@/lib/daylight/types";
import { BodyFigure } from "./BodyFigure";
import { LayerSwitch } from "./BodyMap";
import { Button } from "./ui";

type Scope = "all" | number;

type RosterItem = {
  id: string;
  name: string;
  where: string;
  muscles: string;
};

function buildRoster(plan: PlanVersion, scope: Scope): RosterItem[] {
  const items: RosterItem[] = [];
  const days = scope === "all" ? plan.days : [dayTemplate(plan, scope)];
  const add = (id: string, where: string) => {
    const existing = items.find((item) => item.id === id);
    if (existing) {
      if (!existing.where.includes(where)) existing.where = `${existing.where} · ${where}`;
      return;
    }
    items.push({ id, name: exerciseLabel(id), where, muscles: muscleLabel(id) });
  };
  for (const template of days) {
    for (const slot of template.slots) {
      add(slot.exerciseId, WEEKDAY_NAMES[template.weekday]);
      for (const alt of slot.alternatives) add(alt.exerciseId, `${WEEKDAY_NAMES[template.weekday]} option`);
    }
  }
  if (scope === "all") {
    for (const reference of PT_REFERENCES) add(reference.exerciseId, "PT board");
    add(UNSCHEDULED.exerciseId, "Off the schedule");
  }
  return items;
}

export function Body() {
  const state = useDaylight();
  const today = localDate();
  const plan = activePlan(state.planVersions, today);
  const [scope, setScope] = useState<Scope>("all");
  const day = dayTemplate(plan, typeof scope === "number" ? scope : new Date().getDay());
  const window = coverageWindow(state.bodyWindow, today);
  const coverage = strengthCoverage(state.sessions, window.from, window.to);
  const counts = Object.fromEntries(Object.entries(coverage).map(([id, cell]) => [id, cell.primary]));
  const roster = state.bodyLayer === "planned" ? buildRoster(plan, scope) : buildRoster(plan, "all");
  const painting = state.highlightedExerciseId ? roster.filter((item) => item.id === state.highlightedExerciseId) : roster;
  const planned: Record<string, "primary" | "secondary"> = {};
  for (const item of painting) {
    for (const mapping of MAPPINGS.filter((entry) => entry.exerciseId === item.id)) {
      const current = planned[mapping.regionId];
      if (mapping.role === "primary" || !current) planned[mapping.regionId] = mapping.role;
    }
  }
  const feltRegions = state.observations.map((item) => item.context.regionId).filter((id): id is string => Boolean(id));
  const selected = state.selectedRegionId ? regionById(state.selectedRegionId) : undefined;
  const cell = selected ? coverage[selected.id] : undefined;
  const onThisView = Object.keys(planned).filter((id) => regionById(id)?.view === state.bodyView);
  const onOtherView = Object.keys(planned).some((id) => regionById(id)?.view && regionById(id)?.view !== state.bodyView);
  const others = otherActivitySummary(state.sessions, window.from, window.to);
  const loggedAnything = state.sessions.some(
    (session) => session.localDate >= window.from && session.localDate <= window.to && session.logs.some((log) => log.status === "done"),
  );
  const placed = roster.filter((item) => item.muscles);
  const unplaced = roster.filter((item) => !item.muscles);

  return (
    <main>
      <h1 className="text-4xl text-ink">Body</h1>
      <p className="mt-2 max-w-xl text-base">
        Imported exercises, drawn on the muscles they use. Not muscle growth, stress, or a score.
      </p>
      <div className="mt-4">
        <LayerSwitch value={state.bodyLayer} onChange={(bodyLayer) => state.setBody({ bodyLayer })} />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button tone={state.bodyView === "front" ? "primary" : "outline"} onClick={() => state.setBody({ bodyView: "front" })}>
          Front
        </Button>
        <Button tone={state.bodyView === "back" ? "primary" : "outline"} onClick={() => state.setBody({ bodyView: "back" })}>
          Back
        </Button>
        {state.bodyLayer === "completed"
          ? (["today", "7", "30"] as const).map((id) => (
              <Button key={id} tone={state.bodyWindow === id ? "primary" : "outline"} onClick={() => state.setBody({ bodyWindow: id })}>
                {id === "today" ? "Today" : id === "7" ? "7 days" : "30 days"}
              </Button>
            ))
          : null}
      </div>
      {state.bodyLayer === "planned" ? (
        <div className="mt-3 flex gap-2 overflow-x-auto" aria-label="Which exercises to draw">
          <ScopeChip active={scope === "all"} onClick={() => setScope("all")}>
            All imported
          </ScopeChip>
          {WEEKDAY_NAMES.map((name, index) => (
            <ScopeChip key={name} active={scope === index} onClick={() => setScope(index)}>
              {name.slice(0, 3)}
            </ScopeChip>
          ))}
        </div>
      ) : null}

      <div className="mt-4 md:grid md:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] md:items-start md:gap-6">
        <div>
          <BodyFigure
            view={state.bodyView}
            selectedId={state.selectedRegionId}
            highlighted={[...Object.keys(planned), ...feltRegions]}
            onSelect={(selectedRegionId) => state.setBody({ selectedRegionId, highlightedExerciseId: null })}
          />
          {state.bodyLayer === "planned" && onThisView.length === 0 && onOtherView ? (
            <p className="mt-3 text-base text-ink-soft">
              Nothing in this set sits on the {state.bodyView}. Switch to {state.bodyView === "front" ? "Back" : "Front"}.
            </p>
          ) : null}
          {state.bodyLayer === "planned" && scope !== "all" && roster.length === 0 ? (
            <div className="mt-3">
              <p className="text-base">
                {WEEKDAY_NAMES[scope]} is {day.name}. Those lifts were not in the written handoff, so none are drawn.
              </p>
              <Button className="mt-3" tone="outline" onClick={() => setScope("all")}>
                Show imported exercises
              </Button>
            </div>
          ) : null}
          {state.bodyLayer === "completed" ? (
            <dl className="mt-3 grid grid-cols-2 gap-2 text-base">
              {HEAT_BANDS.map((band) => (
                <div key={band.id} className="rounded-xl border border-line px-2 py-2">
                  <dt className="font-semibold">{band.label}</dt>
                  <dd className="text-ink-soft">{band.detail}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          {state.bodyLayer === "felt" ? <p className="mt-3 text-base text-ink-soft">A marked region is one you attached to a note.</p> : null}
        </div>

        <section className="mt-5 md:mt-0" aria-label="Exercises">
          <h2 className="text-2xl">{selected ? selected.name : "Exercises"}</h2>
          {selected && state.bodyLayer === "completed" ? (
            <div className="mt-2 text-base">
              {!loggedAnything ? <p>No records in this window.</p> : null}
              <p className="tabular-nums">Primary sets: {cell?.primary ?? 0}</p>
              <p className="tabular-nums">Secondary, not added to that count: {cell?.secondary ?? 0}</p>
              <p>{cell?.exercises.length ? cell.exercises.join(", ") : "No contributing strength sets."}</p>
            </div>
          ) : null}
          {selected && state.bodyLayer !== "completed" ? (
            <p className="mt-1 text-base text-ink-soft">
              {selected.side === "center" ? "One region for both sides." : `The ${selected.side} side only. The other side is separate.`}
            </p>
          ) : null}
          <ul className="mt-3 grid gap-2">
            {placed.map((item) => {
              const active = state.highlightedExerciseId === item.id;
              const hitsSelection = selected ? MAPPINGS.some((mapping) => mapping.exerciseId === item.id && mapping.regionId === selected.id) : false;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    aria-pressed={active}
                    className={`min-h-11 w-full rounded-xl border px-3 py-2 text-left ${
                      active || hitsSelection ? "border-forest bg-forest text-canvas" : "border-line bg-surface text-ink"
                    }`}
                    onClick={() => {
                      const mappings = MAPPINGS.filter((mapping) => mapping.exerciseId === item.id);
                      const primary = mappings.find((mapping) => mapping.role === "primary") ?? mappings[0];
                      const regionId = primary?.regionId ?? null;
                      const nextView = regionId ? regionById(regionId)?.view : undefined;
                      state.setBody({
                        ...(nextView ? { bodyView: nextView } : {}),
                        highlightedExerciseId: active ? null : item.id,
                        selectedRegionId: active ? null : regionId,
                      });
                    }}
                  >
                    <span className="block text-base font-semibold">{item.name}</span>
                    <span className={`block text-base ${active || hitsSelection ? "text-canvas" : "text-ink-soft"}`}>
                      {item.muscles}
                      {exerciseById(item.id)?.kind === "strength" ? "" : ` · ${exerciseById(item.id)?.kind}`}
                    </span>
                    <span className={`block text-base ${active || hitsSelection ? "text-canvas" : "text-ink-soft"}`}>{item.where}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          {unplaced.length ? (
            <div className="mt-4">
              <h3 className="text-xl">Not drawn on the body</h3>
              <p className="mt-1 text-base text-ink-soft">Cardio and the open mobility flow have no muscle mapping. They stay in the session, not on the figure.</p>
              <ul className="mt-2 grid gap-2">
                {unplaced.map((item) => (
                  <li key={item.id} className="rounded-xl border border-line px-3 py-2">
                    <span className="block text-base font-semibold">{item.name}</span>
                    <span className="block text-base text-ink-soft">{item.where}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {state.bodyLayer === "completed" ? (
            <div className="mt-4">
              <h3 className="text-xl">Not counted as strength sets</h3>
              {(["activation", "timed", "cardio", "mobility", "distance"] as const).map((kind) => (
                <p key={kind} className="text-base">
                  <span className="capitalize">{kind}: </span>
                  {others[kind].length ? others[kind].join("; ") : "none in this window"}
                </p>
              ))}
            </div>
          ) : null}
          <Button tone="quiet" className="mt-3" onClick={() => state.setView("learn")}>
            Learn
          </Button>
        </section>
      </div>
    </main>
  );
}

function ScopeChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      className={`min-h-11 shrink-0 rounded-xl px-3 text-base ${active ? "bg-ink text-canvas" : "bg-surface text-ink"}`}
      aria-pressed={active}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
