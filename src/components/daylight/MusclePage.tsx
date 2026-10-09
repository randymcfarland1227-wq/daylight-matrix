import { useMemo, useState } from "react";
import { ChevronRight, Lightbulb, Pencil } from "lucide-react";
import { exercises, exerciseById } from "@/lib/daylight/exercises";
import { EQUIPMENT_CATS, equipCats, metaFor, type Difficulty, DIFFICULTY_RANK } from "@/lib/daylight/exmeta";
import { formFor } from "@/lib/daylight/form";
import { GROUP_HUE, mix, FIG_SKIN, ROLE_STRENGTH, roleOfWeight } from "@/lib/daylight/figureColors";
import {
  groupInfo, isGroup, isRegion, muscleName, regionInfo, regionOfSub, subInfo, subsOf, targetFor,
  type AnyMuscleId, type GroupId, type SubId,
} from "@/lib/daylight/muscles";
import { useDaylight } from "@/lib/daylight/store";
import { DAY_STYLE } from "@/lib/daylight/theme";
import { STATUS_LABEL, fmt, statusFor, weightFor, type VolumeMap } from "@/lib/daylight/volume";
import type { heatSnapshot } from "@/lib/daylight/volume";
import { MapFigure, type MapLevel } from "./MapFigure";
import { MoveArt } from "./MoveArt";
import { STATUS_TONE, groupOfAny, r1 } from "./Body";
import { Badge, Button, Card, Chip, Eyebrow, Segmented, cn } from "./ui";

export const DIFF_TONE: Record<Difficulty, "teal" | "sun" | "copper" | "danger"> = { Beginner: "teal", Novice: "sun", Intermediate: "copper", Advanced: "danger" };

type Heat = ReturnType<typeof heatSnapshot>;

type Row = { exerciseId: string; weight: number; role: "primary" | "secondary" | "tertiary"; days: number[]; sets: number; alt: boolean; inPlan: boolean };

export function MusclePage({ id, planned, heat }: { id: AnyMuscleId; planned: VolumeMap; heat: Heat }) {
  const state = useDaylight();
  const target = state.weeklyTarget;
  const group = groupOfAny(id);
  const gInfo = groupInfo(group)!;
  const hue = GROUP_HUE[group];
  const kind = isGroup(id) ? "group" : isRegion(id) ? "region" : "sub";
  const name = muscleName(id);
  const blurb = kind === "group" ? gInfo.blurb : kind === "region" ? regionInfo(id)!.blurb : subInfo(id)!.blurb;
  const mySubs = subsOf(id);
  const cell = planned[id];
  const logged = heat.map[id];
  const st = statusFor(cell, 1, targetFor(id, target));
  const lst = statusFor(logged, heat.weeklyFactor, targetFor(id, target));

  const [equip, setEquip] = useState<Set<string>>(new Set());
  const [diff, setDiff] = useState<"any" | Difficulty>("any");
  const [minor, setMinor] = useState(false);
  const detail = state.bodyDetail;
  const level: MapLevel = detail === "advanced" ? "sub" : "region";

  const { rows, others } = useMemo(() => {
    const planIds = new Set(cell.hits.map((h) => h.exerciseId));
    const inPlan: Row[] = cell.hits
      .filter((h) => exerciseById(h.exerciseId))
      .map((h) => ({ exerciseId: h.exerciseId, weight: h.weight, role: roleOfWeight(h.weight), days: h.days, sets: h.sets, alt: Boolean(h.alt), inPlan: true }));
    const rest: Row[] = [];
    for (const e of exercises) {
      if (planIds.has(e.id)) continue;
      const w = weightFor(e.muscles, id);
      if (!w) continue;
      rest.push({ exerciseId: e.id, weight: w, role: roleOfWeight(w), days: [], sets: 0, alt: false, inPlan: false });
    }
    const rank = { friendly: 0, neutral: 1, caution: 2 } as const;
    rest.sort((a, b) => b.weight - a.weight || rank[exerciseById(a.exerciseId)?.back ?? "neutral"] - rank[exerciseById(b.exerciseId)?.back ?? "neutral"] || exerciseById(a.exerciseId)!.name.localeCompare(exerciseById(b.exerciseId)!.name));
    inPlan.sort((a, b) => Number(a.alt) - Number(b.alt) || b.weight - a.weight || b.sets - a.sets);
    return { rows: inPlan, others: rest };
  }, [cell, id]);

  const pass = (r: Row) => {
    if (!minor && r.role === "tertiary") return false;
    const cats = equipCats(r.exerciseId);
    if (equip.size && !cats.some((c) => equip.has(c))) return false;
    if (diff !== "any" && DIFFICULTY_RANK[metaFor(r.exerciseId).difficulty] > DIFFICULTY_RANK[diff]) return false;
    return true;
  };
  const planRows = rows.filter(pass);
  const otherRows = others.filter(pass);
  const present = new Set<string>([...rows, ...others].flatMap((r) => equipCats(r.exerciseId)));
  const counts = (c: string) => [...rows, ...others].filter((r) => equipCats(r.exerciseId).includes(c as never) && (minor || r.role !== "tertiary")).length;

  const notes = state.observations.filter((o) => {
    if (!o.context.muscleId) return false;
    if (o.context.muscleId === id) return true;
    const subs = subsOf(o.context.muscleId);
    return subs.length > 0 && subs.every((s) => mySubs.includes(s));
  });
  const offPlan = heat.source === "logged" ? logged.hits.filter((h) => !exerciseById(h.exerciseId)) : [];
  const back = () => state.setBody({ selectedMuscleId: null });
  const goto = (to: string) => state.setBody({ selectedMuscleId: to });
  const underserved = st === "none" || st === "indirect" || st === "low";

  // rail figure: only this muscle in its group hue, everything else plain
  const figSubs = (fid: string): SubId[] => subsOf(fid);
  const figFill = (fid: AnyMuscleId) => (figSubs(fid).some((s) => mySubs.includes(s)) ? hue : FIG_SKIN);
  const figSel = (fid: string) => figSubs(fid).length > 0 && figSubs(fid).every((s) => mySubs.includes(s));
  const crumbs: { label: string; to?: string }[] = [{ label: "Body map", to: "" }];
  if (kind !== "group") crumbs.push({ label: gInfo.name, to: group });
  if (kind === "sub") {
    const reg = regionOfSub(id as SubId);
    if (reg.subs.length > 1) crumbs.push({ label: reg.name, to: reg.id });
  }
  if (crumbs[crumbs.length - 1].label !== name) crumbs.push({ label: name });
  else delete crumbs[crumbs.length - 1].to;

  return (
    <div data-testid="muscle-page" data-muscle={id}>
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm text-ink-soft">
        {crumbs.map((c, i) => (
          <span key={i} className="flex items-center gap-1">
            {i > 0 ? <ChevronRight className="size-3.5" aria-hidden="true" /> : null}
            {c.to !== undefined ? (
              <button type="button" className="tap rounded px-1 font-semibold text-ink hover:underline" onClick={() => (c.to === "" ? back() : goto(c.to!))}>
                {c.label}
              </button>
            ) : (
              <span aria-current="page" className="px-1 font-bold text-ink">{c.label}</span>
            )}
          </span>
        ))}
      </nav>

      <div className="mt-2 flex flex-wrap items-end gap-3">
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-ink-soft">
            <i className="inline-block size-3 rounded-sm" style={{ background: hue }} /> {kind === "group" ? "Muscle group" : kind === "region" ? "Muscle" : "Sub-muscle"}
          </p>
          <h1 className="t-display">{name}</h1>
          <p className="mt-1 max-w-xl text-sm text-ink-soft">{blurb}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Badge tone={STATUS_TONE[st]}>{STATUS_LABEL[st]}</Badge>
          <span className="text-ink-soft">
            plan {fmt(r1(cell.effective))}/wk · target {targetFor(id, target)}
            {heat.source === "logged" ? ` · logged ${fmt(r1(logged.effective / heat.weeklyFactor))}/wk (${STATUS_LABEL[lst].toLowerCase()})` : ""}
          </span>
        </div>
      </div>

      <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-start">
        {/* ------------------------------------------------------------ main column */}
        <div className="order-2 min-w-0 space-y-6 lg:order-1">
          {kind !== "sub" ? (
            <div>
              <Eyebrow>{kind === "group" ? "Parts of " + name.toLowerCase() : "Sub-muscles"}</Eyebrow>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {(kind === "group" ? gInfo.subs : (regionInfo(id)!.subs.length > 1 ? regionInfo(id)!.subs : [])).map((sid) => (
                  <Chip key={sid} tone="sun" onClick={() => goto(sid)}>
                    {subInfo(sid)!.name}
                  </Chip>
                ))}
              </div>
            </div>
          ) : null}

          {underserved ? (
            <p className="flex items-start gap-2 rounded-lg border border-info/40 bg-info/10 p-3 text-sm">
              <Lightbulb className="mt-0.5 size-4 shrink-0 text-info" />
              <span>
                <b>Your plan under-serves this one</b> ({STATUS_LABEL[st].toLowerCase()}). The moves under “Other moves that train this” are ideas to grow it. They are not in your PDF.
              </span>
            </p>
          ) : null}

          <section aria-label="In your plan">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="t-title">In your plan</h2>
              <span className="text-sm text-ink-soft">{planRows.length} move{planRows.length === 1 ? "" : "s"}</span>
            </div>
            {rows.length === 0 ? <p className="mt-2 text-sm text-ink-soft">Nothing in the plan trains this directly or indirectly.</p> : null}
            {rows.length > 0 && planRows.length === 0 ? <p className="mt-2 text-sm text-ink-soft">No plan moves match the filters.</p> : null}
            <ul className="mt-3 space-y-4" data-testid="plan-moves">
              {planRows.map((r) => (
                <li key={r.exerciseId}>
                  <MoveCard row={r} muscleId={id} loggedSets={logged.hits.find((h) => h.exerciseId === r.exerciseId)?.sets ?? 0} windowDays={state.heatWindow} showLogged={heat.source === "logged"} />
                </li>
              ))}
            </ul>
            {offPlan.length ? (
              <div className="mt-3">
                <Eyebrow>Logged off-plan work that counted</Eyebrow>
                <ul className="mt-1 space-y-1">
                  {offPlan.map((h) => (
                    <li key={h.exerciseId} className="rounded-xl border border-line px-3 py-2 text-sm">
                      <b>{h.name}</b> <span className="text-ink-soft">· {fmt(r1(h.sets))} sets · {h.role}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>

          <section aria-label="Other moves that train this">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="t-title">Other moves that train this</h2>
              <span className="text-sm text-ink-soft">{otherRows.length}</span>
            </div>
            <p className="mt-1 text-sm text-ink-soft">From the library, strongest and back-friendly first. General movement information, not medical advice.</p>
            {otherRows.length === 0 ? <p className="mt-2 text-sm text-ink-soft">No other library moves match the filters.</p> : null}
            <ul className="mt-3 space-y-4" data-testid="other-moves">
              {otherRows.map((r) => (
                <li key={r.exerciseId}>
                  <MoveCard row={r} muscleId={id} loggedSets={0} windowDays={state.heatWindow} showLogged={false} />
                </li>
              ))}
            </ul>
          </section>

          <Card>
            <div className="flex items-center justify-between">
              <h2 className="t-title">Your notes here</h2>
              <Button size="sm" tone="soft" onClick={() => state.setOverlay({ type: "note", muscleId: id, kind: "gym" })}>
                <Pencil className="size-4" /> Add
              </Button>
            </div>
            {notes.length === 0 ? <p className="mt-1 text-sm text-ink-soft">None yet.</p> : null}
            <ul className="mt-1 space-y-1">
              {notes.slice(0, 5).map((n) => (
                <li key={n.id} className="text-sm">
                  <span className="text-ink-faint">{n.context.date.slice(5)} · </span>
                  {n.text}
                  {n.forNextPlan ? <span className="ml-1 text-warn">★</span> : null}
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* ------------------------------------------------------------ right rail */}
        <aside className="order-1 space-y-4 lg:sticky lg:top-4 lg:order-2" aria-label="Filters and body map">
          <div className="figure-panel card p-3" data-testid="rail-map">
            <label className="flex items-center justify-between gap-2 text-sm font-bold">
              <span>Advanced (sub-muscles)</span>
              <input
                type="checkbox"
                className="size-5 accent-[var(--accent)]"
                checked={detail === "advanced"}
                onChange={(e) => state.setBody({ bodyDetail: e.target.checked ? "advanced" : "standard" })}
                aria-label="Advanced: show sub-muscles"
                data-testid="rail-advanced"
              />
            </label>
            <div className="mt-1 grid grid-cols-2 gap-1">
              {(["front", "back"] as const).map((v) => (
                <MapFigure key={v} view={v} level={level} className="mx-auto h-auto max-h-[230px] w-full max-w-[150px] lg:max-h-none lg:max-w-[150px]" fill={figFill} selected={undefined} dim={(fid) => !figSel(fid) && false} onSelect={(fid) => goto(fid)} label={`${v} view, ${name} highlighted`} />
              ))}
            </div>
            <p className="mt-1 text-center text-xs opacity-70">Tap another muscle to jump to it.</p>
          </div>

          <Card>
            <h2 className="t-title">Filter moves</h2>
            <fieldset className="mt-2">
              <legend className="text-xs font-extrabold uppercase tracking-wider text-ink-soft">Equipment</legend>
              <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-0.5">
                {EQUIPMENT_CATS.filter((c) => present.has(c)).map((c) => (
                  <label key={c} className="tap flex min-h-9 cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="size-4 accent-[var(--accent)]"
                      checked={equip.has(c)}
                      onChange={(e) => {
                        const n = new Set(equip);
                        if (e.target.checked) n.add(c);
                        else n.delete(c);
                        setEquip(n);
                      }}
                      data-testid={`equip-${c}`}
                    />
                    <span>{c}</span>
                    <span className="ml-auto text-xs text-ink-faint">{counts(c)}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="mt-3">
              <p className="text-xs font-extrabold uppercase tracking-wider text-ink-soft">Difficulty up to</p>
              <Segmented<"any" | Difficulty>
                label="Difficulty"
                className="mt-1"
                value={diff}
                onChange={setDiff}
                options={[{ id: "any", label: "Any" }, { id: "Beginner", label: "Beginner" }, { id: "Novice", label: "Novice" }, { id: "Intermediate", label: "Inter." }]}
              />
            </div>
            <label className="tap mt-2 flex min-h-9 cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" className="size-4 accent-[var(--accent)]" checked={minor} onChange={(e) => setMinor(e.target.checked)} data-testid="show-minor" />
              Include moves where it only helps a little (tertiary)
            </label>
            {equip.size || diff !== "any" || minor ? (
              <Button tone="ghost" size="sm" className="-ml-2 mt-1" onClick={() => (setEquip(new Set()), setDiff("any"), setMinor(false))}>
                Clear filters
              </Button>
            ) : null}
          </Card>
          <Legend3 hue={hue} />
        </aside>
      </div>
    </div>
  );
}

export function Legend3({ hue }: { hue: string }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-soft" aria-label="Colour legend" data-testid="role-legend">
      {(["primary", "secondary", "tertiary"] as const).map((r) => (
        <li key={r} className="flex items-center gap-1.5">
          <i className="size-3 rounded-full" style={{ background: mix(FIG_SKIN, hue, ROLE_STRENGTH[r]) }} />
          {r[0]!.toUpperCase() + r.slice(1)}
        </li>
      ))}
    </ul>
  );
}

function MoveCard({ row, muscleId, loggedSets, windowDays, showLogged }: { row: Row; muscleId: AnyMuscleId; loggedSets: number; windowDays: number; showLogged: boolean }) {
  const state = useDaylight();
  const ex = exerciseById(row.exerciseId)!;
  const meta = metaFor(ex.id);
  const guide = formFor(ex.id);
  const steps = guide?.s.slice(0, 3) ?? [];
  const hue = GROUP_HUE[groupOfAny(muscleId)];
  return (
    <article className="overflow-hidden rounded-xl border border-line bg-surface" data-testid="move-card" data-exercise={ex.id}>
      <header className="flex items-center gap-2 bg-surface-2 px-4 py-3">
        <Badge tone={DIFF_TONE[meta.difficulty]}>{meta.difficulty}</Badge>
        <h3 className="min-w-0 flex-1 truncate t-title">{ex.name}</h3>
        <span className="hidden shrink-0 text-xs text-ink-soft sm:block">{ex.equipment}</span>
      </header>
      <div className="p-4">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="flex items-center gap-1 rounded-full px-2 py-0.5 font-bold" style={{ background: mix(FIG_SKIN, hue, ROLE_STRENGTH[row.role]), color: "#10151f" }}>
            {row.role[0]!.toUpperCase() + row.role.slice(1)} for this muscle
          </span>
          {row.inPlan ? (
            <>
              <Badge tone={row.alt ? "plain" : "forest"}>{row.alt ? "swap option in your plan" : "in your plan"}</Badge>
              {row.days.length ? <span className="text-ink-soft">{row.days.sort((a, b) => (a || 7) - (b || 7)).map((d) => DAY_STYLE[d]!.short).join(", ")}</span> : null}
              {!row.alt && row.sets ? <span className="text-ink-soft">· {fmt(r1(row.sets))} sets/wk</span> : null}
              {showLogged ? <span className="text-ink-soft">· logged {fmt(r1(loggedSets))} ({windowDays}d)</span> : null}
            </>
          ) : (
            <Badge tone="teal">not in your PDF</Badge>
          )}
          {ex.back === "friendly" ? <Badge tone="teal">back-friendly</Badge> : ex.back === "caution" ? <Badge tone="copper">go easy on the back</Badge> : null}
        </div>
        <div className="mt-3">
          <MoveArt exerciseId={ex.id} compact />
        </div>
        {steps.length ? (
          <ol className="mt-3 space-y-1.5">
            {steps.map((s, i) => (
              <li key={i} className="flex gap-2.5 text-[0.95rem] leading-snug">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-accent text-xs font-extrabold text-on-accent">{i + 1}</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        ) : null}
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" tone="sun" data-testid="open-exercise" onClick={() => state.setOverlay({ type: "form", exerciseId: ex.id, muscle: muscleId })}>
            Full guide &amp; details
          </Button>
          <Button size="sm" tone="soft" onClick={() => state.setOverlay({ type: "note", exerciseId: ex.id, kind: "gym" })}>
            Note
          </Button>
        </div>
      </div>
    </article>
  );
}
