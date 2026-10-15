import { referenceFor, CONTENT_DATE, SOURCES, GROWTH_PRINCIPLES } from "@/lib/daylight/atlas";
import { NERVE_ATLAS } from "@/lib/daylight/nerveAtlas";
import { ImageFigure } from "./ImageFigure";
import { IMG_H, IMG_W, warp, warpPath } from "@/lib/daylight/imageMap";
import { PROFILES, FEEL, GROUP_PROFILES, JOINT_PROFILES, NERVE_PROFILES } from "@/lib/daylight/learnProfiles";
import { subInfo as subInfoR12, type RegionId as RegionIdR12, type SubId as SubIdR12 } from "@/lib/daylight/muscles";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ExternalLink, Pencil, Play, Trash2 } from "lucide-react";
import { localDate, recordDate } from "@/lib/daylight/dates";
import { NERVES, entitiesOf, entity, entityName, type Entity, type Kind, type Ref } from "@/lib/daylight/anatomy";
import { observationsForArea, noteArea } from "@/lib/daylight/bodyNotes";
import { exercises } from "@/lib/daylight/exercises";
import { FIG_SKIN, GROUP_HUE, mix } from "@/lib/daylight/figureColors";
import { JOINTS, heatTone, jointHeat, jointMoves } from "@/lib/daylight/joints";
import { lyftaFor, lyftaUrl } from "@/lib/daylight/lyfta";
import { LYFTA_REF_MEDIA } from "@/lib/daylight/lyftaRefs";
import { resolveMuscle, subsOf, type AnyMuscleId } from "@/lib/daylight/muscles";
import { activePlan } from "@/lib/daylight/plan";
import { useDaylight } from "@/lib/daylight/store";
import { heatSnapshot, plannedVolume } from "@/lib/daylight/volume";
import type { JointLog, Observation } from "@/lib/daylight/types";
import { SideFigure } from "./Joints";
import { MapFigure, type MapLevel } from "./MapFigure";
import { MoveThumb } from "./MoveArt";
import { MusclePage } from "./MusclePage";
import { NoteThumbs } from "./NoteImages";
import { Button, Chip, Eyebrow, cn } from "./ui";
import { ZoomPane } from "./ZoomPane";

export type HubTab = "journal" | "learn" | "training";
const LEVELS: { id: Kind; label: string; plural: string }[] = [
  { id: "group", label: "Groups", plural: "groups" },
  { id: "muscle", label: "Muscles", plural: "muscles" },
  { id: "detail", label: "Details", plural: "detailed parts" },
  { id: "joint", label: "Joints", plural: "joints" },
  { id: "nerve", label: "Nerves", plural: "nerves" },
];
const MAP_LEVEL: Record<Kind, MapLevel> = { group: "group", muscle: "region", detail: "sub", joint: "region", nerve: "region" };
const TONE_FILL = { none: "var(--surface)", ok: "var(--accent)", mild: "var(--warn)", high: "var(--danger)" } as const;
const NERVE_COLOR = "#c2993a";
const MIRROR = "translate(300 0) scale(-1 1)";
const KIND_LABEL: Record<Kind, string> = { group: "Muscle group", muscle: "Muscle", detail: "Detail", joint: "Joint", nerve: "Nerve" };
const groupOf = (id: string) => resolveMuscle(id)?.group ?? "chest";

export function BodyHub({ tab }: { tab: HubTab }) {
  const s = useDaylight();
  const sel = entity(s.selectedMuscleId);
  const [level, setLevel] = useState<Kind>(sel?.kind ?? (s.bodyWorkspace === "joints" ? "joint" : "group"));
  const top = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  useEffect(() => { if (sel) setLevel(sel.kind); }, [sel?.id]);
  useEffect(() => { if (first.current) return void (first.current = false); top.current?.scrollIntoView({ block: "start", behavior: "instant" }); }, [sel?.id]);
  const open = (id: string) => s.setBody({ selectedMuscleId: id });
  if (sel) return <div ref={top} className="scroll-mt-20"><EntityPage e={sel} tab={tab} onBack={() => s.setBody({ selectedMuscleId: null })} open={open} /></div>;
  const lv = LEVELS.find((l) => l.id === level)!;
  return (
    <div ref={top} className="scroll-mt-20 space-y-4" data-testid={`hub-${tab}`} data-level={level}>
      <div role="tablist" aria-label="Body level" className="kit-tabs-sub grid grid-cols-5 gap-1">
        {LEVELS.map((l) => (
          <button key={l.id} type="button" role="tab" aria-selected={level === l.id} onClick={() => setLevel(l.id)} className="tap min-h-10 px-0.5">{l.label}</button>
        ))}
      </div>
      <p className="text-sm text-ink-soft">
        {tab === "journal" ? `Tap any of the ${lv.plural} to log how it feels and keep notes with photos.` : tab === "learn" ? `Tap any of the ${lv.plural} to learn what it does and how it connects.` : `Tap any of the ${lv.plural} for growth and recovery options, with demos from Lyfta.`}
      </p>
      <section className="body-atlas"><HubMap level={level} onPick={open} /></section>
      <EntityList key={level} level={level} open={open} />
      {tab === "journal" ? <RecentBodyNotes open={open} /> : null}
    </div>
  );
}

function HubMap({ level, onPick }: { level: Kind; onPick: (id: string) => void }) {
  const s = useDaylight();
  const [side, setSide] = useState(false);
  const [view, setView] = useState<"front" | "back">("front");
  const [sel, setSel] = useState<string | null>(null);
  const today = localDate();
  const muscleLevel = level === "group" || level === "muscle" || level === "detail";
  useEffect(() => setSel(null), [level]);
  const selE = sel ? entity(sel) : undefined;
  const sideOnly = side && level === "joint";
  return (
    <div data-testid="hub-map">
      <div className="mb-3 flex flex-wrap gap-2">
        {!sideOnly ? (["front", "back"] as const).map((v) => <Chip key={v} active={view === v} onClick={() => setView(v)}>{v === "front" ? "Front" : "Back"}</Chip>) : null}
        {level === "joint" ? <Chip active={side} onClick={() => setSide(!side)}>Side</Chip> : null}
      </div>
      <ZoomPane>
        <div className="mx-auto max-w-[400px]">
          {sideOnly ? (
            <div className="relative"><SideFigure /><JointLayer view="side" logs={s.jointLogs ?? []} today={today} onPick={onPick} /></div>
          ) : (
            <ImageFigure view={view} level={MAP_LEVEL[level]} interactive={muscleLevel} selected={sel} onSelect={(id) => setSel(id)}>
              {level === "joint" ? <JointLayer view={view} img logs={s.jointLogs ?? []} today={today} onPick={onPick} /> : null}
              {level === "nerve" ? <NerveLayer view={view} img onPick={onPick} /> : null}
            </ImageFigure>
          )}
        </div>
      </ZoomPane>
      {muscleLevel ? (
        selE ? (
          <div className="mt-3 flex items-center gap-3 rounded-[12px] border border-line bg-surface p-3" data-testid="map-select-card">
            <span className="size-3 shrink-0 rounded-full bg-brass" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{selE.name}</p>
              <p className="line-clamp-2 text-xs text-ink-soft">{selE.kind === "detail" ? (selE.learn.does) : selE.learn.does}</p>
            </div>
            <button type="button" className="btn btn-forest !min-h-10 !px-3 !text-[15px]" onClick={() => onPick(selE.id)} data-testid="map-open">Open<ArrowRight className="size-4" /></button>
          </div>
        ) : <p className="mt-2 text-center text-xs text-ink-soft">Tap a muscle to highlight it{typeof window !== "undefined" && window.matchMedia?.("(hover: hover)").matches ? ", or point at it" : ""}.</p>
      ) : null}
      {level === "nerve" ? <p className="mt-2 text-xs text-ink-soft">Nerve lines are a simplified guide to where each major nerve runs, drawn on one side and mirrored. Smaller nerves are in the list below.</p> : null}
      <p className="mt-1 text-[10px] text-ink-faint">Body renders: Gymkee muscle map.</p>
    </div>
  );
}

function JointLayer({ view, logs, today, onPick, img }: { view: "front" | "back" | "side"; logs: JointLog[]; today: string; onPick: (id: string) => void; img?: boolean }) {
  return (
    <svg viewBox={img ? `0 0 ${IMG_W} ${IMG_H}` : "0 0 300 600"} className="absolute inset-0 size-full" role="group" aria-label={`${view} joints`}>
      {JOINTS.filter((j) => j[view]).map((j) => {
        const p = j[view]!;
        const raw = p.pair ? [p, { x: 300 - p.x, y: p.y }] : [p];
        const pts = img ? raw.map((q) => { const [x, y] = warp(q.x, q.y); return { x, y }; }) : raw;
        const k = img ? 2.4 : 1;
        const t = heatTone(jointHeat(logs, j.id, today));
        return (
          <g key={j.id} role="button" tabIndex={0} aria-label={j.name} data-joint={j.id} className="cursor-pointer" onClick={() => onPick(j.id)} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onPick(j.id))}>
            {pts.map((q, i) => <g key={i}><circle cx={q.x} cy={q.y} r={18 * k} fill="transparent" /><circle cx={q.x} cy={q.y} r={9 * k} fill={TONE_FILL[t]} fillOpacity={t === "none" ? 1 : 0.85} stroke="var(--ink)" strokeWidth={2 * k} /></g>)}
          </g>
        );
      })}
    </svg>
  );
}

function NerveLayer({ view, onPick, img }: { view: "front" | "back"; onPick: (id: string) => void; img?: boolean }) {
  const k = img ? 2.4 : 1;
  return (
    <svg viewBox={img ? `0 0 ${IMG_W} ${IMG_H}` : "0 0 300 600"} className="absolute inset-0 size-full" role="group" aria-label={`${view} nerves`}>
      {NERVES.filter((n) => n.paths.some((p) => p.view === view)).map((n) => (
        <g key={n.id} role="button" tabIndex={0} aria-label={n.name} data-nerve={n.id} className="cursor-pointer" onClick={() => onPick(n.id)} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onPick(n.id))}>
          {[false, true].map((mir, i) => (
            <g key={i} transform={!img && mir ? MIRROR : undefined}>
              {n.paths.filter((p) => p.view === view).map((p, j) => {
                const d = img ? warpPath(p.d, mir) : p.d;
                return (
                  <g key={j}>
                    <path d={d} fill="none" stroke="transparent" strokeWidth={14 * k} strokeLinecap="round" />
                    <path d={d} fill="none" stroke={NERVE_COLOR} strokeWidth={2.6 * k} strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                );
              })}
            </g>
          ))}
        </g>
      ))}
    </svg>
  );
}

function EntityList({ level, open }: { level: Kind; open: (id: string) => void }) {
  const [query, setQuery] = useState("");
  const list = entitiesOf(level).filter(e => `${e.name} ${e.learn.does}`.toLowerCase().includes(query.trim().toLowerCase()));
  const groups: [string, Entity[]][] = level === "detail"
    ? [...new Set(list.map((e) => e.parent!))].map((p) => [entityName(p), list.filter((e) => e.parent === p)])
    : level === "muscle"
      ? [...new Set(list.map((e) => e.parent!))].map((p) => [entityName(p), list.filter((e) => e.parent === p)])
      : level === "nerve"
        ? [["Major nerves", list.filter((e) => NERVES.find((n) => n.id === e.id)?.major)], ["Smaller nerves", list.filter((e) => !NERVES.find((n) => n.id === e.id)?.major)]]
        : [["", list]];
  return (
    <section className="journal-panel" aria-label="List" data-testid="entity-list">
      <label className="mb-4 block text-sm font-semibold">Find an area
        <input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search names or functions" className="mt-2 min-h-11 w-full rounded-lg border border-line bg-surface px-3 text-sm font-normal text-ink" />
      </label>
      {!list.length ? <p className="mb-3 text-sm text-ink-soft">No matches in this category. Try another name or category.</p> : null}
      {groups.map(([title, items]) => (
        <div key={title} className="mb-3 last:mb-0">
          {title ? <Eyebrow>{title}</Eyebrow> : null}
          <div className="mt-1.5 flex flex-wrap gap-2">
            {items.map((e) => <Chip key={e.id} onClick={() => open(e.id)}>{e.name}</Chip>)}
          </div>
        </div>
      ))}
    </section>
  );
}

function notesFor(obs: Observation[], e: Entity): Observation[] {
  if (e.kind === "joint" || e.kind === "nerve") return obs.filter((o) => o.context.jointId === e.id).sort((a, b) => `${b.context.date}${b.context.time}`.localeCompare(`${a.context.date}${a.context.time}`));
  return observationsForArea(obs, e.id);
}

function RecentBodyNotes({ open }: { open: (id: string) => void }) {
  const s = useDaylight();
  const rows = useMemo(() => s.observations
    .map((o) => ({ o, id: o.context.jointId ?? noteArea(o) }))
    .filter((r): r is { o: Observation; id: string } => Boolean(r.id && entity(r.id)))
    .sort((a, b) => `${b.o.context.date}${b.o.context.time}`.localeCompare(`${a.o.context.date}${a.o.context.time}`))
    .slice(0, 8), [s.observations]);
  return (
    <section className="journal-panel" data-testid="recent-body-notes">
      <Eyebrow>Recent body notes</Eyebrow>
      {rows.length ? (
        <div className="mt-2 grid grid-cols-[minmax(0,1fr)] gap-2">
          {rows.map(({ o, id }) => (
            <button key={o.id} type="button" className="journal-entry tap text-left" onClick={() => open(id)}>
              <span className="text-xs font-semibold text-ink-soft">{entityName(id)} · {recordDate(o.context.date)}</span>
              <p className="mt-1 line-clamp-2 text-sm">{o.text}</p>
            </button>
          ))}
        </div>
      ) : <p className="journal-empty">No body notes yet.</p>}
    </section>
  );
}

function EntityPage({ e, tab, onBack, open }: { e: Entity; tab: HubTab; onBack: () => void; open: (id: string) => void }) {
  const s = useDaylight();
  const lv = LEVELS.find((l) => l.id === e.kind)!;
  return (
    <div data-testid="entity-page" data-entity={e.id} data-tab={tab}>
      <Button tone="ghost" className="mb-3" onClick={onBack}><ArrowLeft className="size-4" /> All {lv.plural}</Button>
      <div className="journal-panel">
        <Eyebrow>{KIND_LABEL[e.kind]}{e.parent ? <> · <button type="button" className="underline" onClick={() => open(e.parent!)}>{entityName(e.parent)}</button></> : null}</Eyebrow>
        <h2 className="t-h2 mt-0.5 text-2xl font-bold" data-testid="entity-name">{e.name}</h2>
        <div className="mt-3 flex flex-wrap gap-2" aria-label="Same item in another tab">
          {(["journal", "learn", "training"] as const).map((t) => (
            <Chip key={t} active={tab === t} onClick={() => s.setBody({ bodyWorkspace: t })}>{t === "journal" ? "Journal" : t === "learn" ? "Learn" : "Training guide"}</Chip>
          ))}
        </div>
        {tab === "journal" ? <JournalPanel e={e} /> : tab === "learn" ? <LearnPanel e={e} open={open} /> : <GuidePanel e={e} open={open} />}
      </div>
    </div>
  );
}

function JournalPanel({ e }: { e: Entity }) {
  const s = useDaylight();
  const today = localDate();
  const logs = (s.jointLogs ?? []).filter((l) => l.jointId === e.id);
  const avg = jointHeat(s.jointLogs ?? [], e.id, today);
  const [level, setLevel] = useState<number | null>(null);
  const [side, setSide] = useState<"" | NonNullable<JointLog["side"]>>("");
  const notes = notesFor(s.observations, e);
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(`${today}T12:00:00`); d.setDate(d.getDate() - (13 - i));
    const key = d.toISOString().slice(0, 10);
    const hits = logs.filter((l) => l.date === key);
    return { key, v: hits.length ? Math.max(...hits.map((l) => l.level)) : null };
  });
  const addNote = () => s.setOverlay(e.kind === "joint" || e.kind === "nerve" ? { type: "note", jointId: e.id, kind: "general" } : { type: "note", muscleId: e.id, kind: "general" });
  return (
    <div data-testid="journal-panel">
      <div className="journal-composer mt-4">
        <h3 className="text-base font-semibold">How does it feel today?</h3>
        <p className="mt-0.5 text-xs text-ink-soft">0 = fine, 10 = worst. Optional.</p>
        <div className="mt-2 grid grid-cols-6 gap-1.5" role="radiogroup" aria-label="Feel level">
          {Array.from({ length: 11 }, (_, n) => (
            <button key={n} type="button" role="radio" aria-checked={level === n} onClick={() => setLevel(n)} className={cn("tap h-10 rounded-lg border text-sm font-semibold", level === n ? "border-accent bg-accent text-on-accent" : "border-line bg-surface")}>{n}</button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {(["left", "right", "both"] as const).map((x) => <Chip key={x} active={side === x} onClick={() => setSide(side === x ? "" : x)}>{x === "both" ? "Both sides" : x === "left" ? "Left" : "Right"}</Chip>)}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button disabled={level == null} onClick={() => level != null && (s.addJointLog({ jointId: e.id, date: today, level, side: side || undefined }), setLevel(null), setSide(""), s.showToast(`${e.name} check saved`))}>Save check</Button>
          <Button tone="soft" onClick={addNote}><Pencil className="size-4" /> Add note or photo</Button>
        </div>
        <p className="mt-4 text-xs font-semibold text-ink-soft">Last 14 days{avg != null ? ` · average ${avg.toFixed(1)}` : ""}</p>
        <div className="mt-1.5 grid grid-cols-[repeat(14,minmax(0,1fr))] gap-1" aria-label="Last 14 days">
          {days.map((d) => <span key={d.key} title={`${d.key}: ${d.v ?? "no check"}`} className="h-6 rounded" style={{ background: d.v == null ? "var(--surface-2)" : TONE_FILL[heatTone(d.v)], opacity: d.v == null ? 1 : 0.35 + d.v / 15 }} />)}
        </div>
        {logs.length ? (
          <ul className="mt-3 space-y-1 text-sm">
            {logs.slice(0, 5).map((l) => (
              <li key={l.id} className="flex items-center gap-2">
                <span className="flex-1">{recordDate(l.date)} · {l.time} · <b>{l.level}/10</b>{l.side ? ` · ${l.side === "both" ? "both sides" : l.side}` : ""}</span>
                <button type="button" aria-label="Delete check" className="tap grid size-8 place-items-center rounded-full text-ink-faint" onClick={() => s.deleteJointLog(l.id)}><Trash2 className="size-3.5" /></button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <h3 className="mt-6 text-base font-semibold">Notes <span className="text-ink-faint">{notes.length}</span></h3>
      {notes.length ? (
        <div className="mt-2 grid grid-cols-[minmax(0,1fr)] gap-2">
          {notes.map((n) => (
            <article key={n.id} className="journal-entry">
              <time dateTime={n.context.date}>{recordDate(n.context.date)}{n.context.bodySide ? ` · ${n.context.bodySide}` : ""}</time>
              <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed">{n.text}</p>
              <NoteThumbs ids={n.imageIds} className="mt-2" onChange={(ids) => s.updateNote(n.id, { imageIds: ids })} />
            </article>
          ))}
        </div>
      ) : <p className="journal-empty">No notes for {e.name.toLowerCase()} yet.</p>}
    </div>
  );
}

function Links({ title, ids, open, testid }: { title: string; ids?: string[]; open: (id: string) => void; testid?: string }) {
  const valid = (ids ?? []).filter((id) => entity(id));
  if (!valid.length) return null;
  return (
    <div className="mt-5" data-testid={testid}>
      <h3 className="text-base font-semibold">{title}</h3>
      <div className="mt-2 flex flex-wrap gap-2">{valid.map((id) => <Chip key={id} tone="teal" onClick={() => open(id)}>{entityName(id)}</Chip>)}</div>
    </div>
  );
}

export function useMoves(e: Entity, planIds: Set<string>) {
  return useMemo(() => {
    const subs = new Set((e.muscles ?? []).flatMap((m) => subsOf(m)));
    if (!subs.size) return [];
    return exercises
      .map((ex) => ({ ex, w: Math.max(0, ...Object.entries(ex.muscles ?? {}).filter(([m]) => subsOf(m).some((x) => subs.has(x))).map(([, w]) => w)) }))
      .filter((x) => x.w >= 0.5)
      .sort((a, b) => Number(planIds.has(b.ex.id)) - Number(planIds.has(a.ex.id)) || b.w - a.w || Number(Boolean(lyftaFor(b.ex.id))) - Number(Boolean(lyftaFor(a.ex.id))))
  }, [e, planIds]);
}

function MoveRow({ ex, inPlan }: { ex: (typeof exercises)[number]; inPlan: boolean }) {
  const s = useDaylight();
  const l = lyftaFor(ex.id);
              return (
                <li className="flex items-center gap-3 rounded-lg border border-line bg-surface p-2">
                  {l ? <img src={l.png} alt="" className="size-12 shrink-0 rounded bg-white object-contain" loading="lazy" /> : <MoveThumb exerciseId={ex.id} size={48} />}
                  <button type="button" className="tap min-w-0 flex-1 text-left" onClick={() => s.setOverlay({ type: "form", exerciseId: ex.id })}>
                    <span className="block font-semibold">{ex.name}</span>
                    <span className="block text-xs text-ink-soft">{inPlan ? "In your plan · " : ""}Form, demo and cues</span>
                  </button>
                  {l ? <a href={lyftaUrl(l)} target="_blank" rel="noreferrer noopener" aria-label={`${ex.name} on Lyfta`} className="tap grid size-9 place-items-center text-accent"><ExternalLink className="size-4" /></a> : <ArrowRight className="size-4 text-ink-faint" />}
                </li>
);
}

function ExerciseSplit({ e }: { e: Entity }) {
  const s = useDaylight();
  const plan = activePlan(s.planVersions, localDate());
  const planIds = useMemo(() => new Set(plan.days.flatMap((d) => d.slots.map((x) => x.exerciseId))), [plan]);
  const moves = useMoves(e, planIds);
  const prim = moves.filter((m) => m.w >= 1).slice(0, 8);
  const sec = moves.filter((m) => m.w < 1).slice(0, 6);
  if (!moves.length) return null;
  return (
    <section className="mt-5" data-testid="learn-exercises">
      <h3 className="text-base font-semibold">Exercises for {e.name}</h3>
      {profileFor(e) ? <p className="mt-1 text-sm text-ink-soft" data-testid="guide-feel">Feel it: {referenceFor(e).feel}</p> : null}
      {prim.length ? <><Eyebrow className="mt-2">Main target</Eyebrow><ul className="mt-1 grid grid-cols-[minmax(0,1fr)] gap-2">{prim.map(({ ex }) => <MoveRow key={ex.id} ex={ex} inPlan={planIds.has(ex.id)} />)}</ul></> : null}
      {sec.length ? <><Eyebrow className="mt-3">Also works it</Eyebrow><ul className="mt-1 grid grid-cols-[minmax(0,1fr)] gap-2">{sec.map(({ ex }) => <MoveRow key={ex.id} ex={ex} inPlan={planIds.has(ex.id)} />)}</ul></> : null}
    </section>
  );
}

function profileFor(e: Entity) {
  if (e.kind === "group") return GROUP_PROFILES[e.id as keyof typeof GROUP_PROFILES];
  if (e.kind === "joint") return JOINT_PROFILES[e.id as keyof typeof JOINT_PROFILES];
  if (e.kind === "nerve") return NERVE_PROFILES[e.id];
  const p = PROFILES[(e.kind === "detail" ? e.parent : e.id) as RegionIdR12];
  if (p && e.kind === "detail" && FEEL[e.id as SubIdR12]) return { ...p, feel: FEEL[e.id as SubIdR12] };
  return p;
}

function SourceNotes({ e }: { e: Entity }) {
  const r = referenceFor(e);
  return <details className="atlas-sources mt-6 rounded-xl border border-line p-4" data-testid="atlas-sources">
    <summary className="cursor-pointer text-sm font-semibold">Sources &amp; content notes · {r.sources.length} references</summary>
    <p className="mt-3 text-xs text-ink-soft">Content checked against the references below on {CONTENT_DATE}. Original educational summaries; no clinician has reviewed this library. Anatomy references support structure and function. Practice cues and starting doses are editorial coaching suggestions, not a personalized treatment plan.</p>
    <ul className="mt-3 space-y-3">{r.sources.map(id => <li key={id}><a className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-accent underline" href={SOURCES[id].url} target="_blank" rel="noreferrer noopener">{SOURCES[id].title}<ExternalLink className="size-3 shrink-0" /></a><p className="text-xs text-ink-soft">{SOURCES[id].scope}</p></li>)}</ul>
    <p className="mt-3 text-xs text-ink-soft">This is a selected atlas. Some entries combine several muscles; deeper structures and neighbouring muscles may be described without their own map marker. Typical roots and sensory territories vary between people.</p>
  </details>;
}

function AtlasText({ title, children, id }: { title: string; children: React.ReactNode; id?: string }) {
  return <section id={id} className="atlas-section scroll-mt-24"><h3 className="text-lg font-bold">{title}</h3><div className="mt-2 text-sm leading-relaxed">{children}</div></section>;
}

function LearnPanel({ e, open }: { e: Entity; open: (id: string) => void }) {
  const r = referenceFor(e);
  const prefix = `atlas-${e.id}`;
  const isNerve = e.kind === 'nerve';
  const jump = [['overview', 'Everyday use'], ['anatomy', isNerve ? 'Route & territories' : 'Anatomy'], ['connections', 'Connections'], ['notice', 'What to notice']];
  return <div className="atlas-learn mt-5" data-testid="learn-panel">
    <nav aria-label={`Explore ${e.name}`} className="atlas-jump flex flex-wrap gap-2 border-b border-line pb-4">{jump.map(([id, label]) => <a key={id} href={`#${prefix}-${id}`} className="inline-flex min-h-10 items-center rounded-full border border-line px-3 text-xs font-semibold">{label}</a>)}</nav>
    <div className="atlas-intro mt-5 rounded-xl bg-surface-2 p-4 sm:p-5">
      <Eyebrow>{isNerve ? r.nerve!.type : 'Function in context'}</Eyebrow>
      <h3 className="mt-2 text-lg font-bold">What it does</h3><p className="mt-2 text-sm leading-relaxed">{r.function}</p>
    </div>
    <div id={`${prefix}-overview`} className="mt-5 grid scroll-mt-24 gap-5 lg:grid-cols-2">
      <AtlasText title="What it lets you do"><ul className="list-disc space-y-2 pl-5">{r.everyday.map(x => <li key={x}>{x}</li>)}</ul></AtlasText>
      <AtlasText title={isNerve ? 'Where sensation goes' : 'Where you feel it'}><p>{r.feel}</p></AtlasText>
    </div>
    <div className="mt-5"><AtlasText title={isNerve ? 'Does it need its own workout?' : 'If you skip it'}><p>{r.skip}</p></AtlasText></div>
    <div id={`${prefix}-anatomy`} className="mt-7 scroll-mt-24 border-t border-line pt-5">
      <h3 className="text-lg font-bold">{isNerve ? 'Route, branches & territories' : e.kind === 'joint' ? 'Structures & movement' : 'Parts & anatomy'}</h3>
      {r.nerve ? <dl className="mt-3 grid gap-3 sm:grid-cols-2" data-testid="nerve-territories">{[['Typical roots', r.nerve.roots], ['Course / route', r.nerve.route], ['Motor supply', r.nerve.motor], ['Sensory supply', r.nerve.sensory]].map(([label, text]) => <div key={label} className="rounded-xl border border-line p-3"><dt className="text-xs font-bold uppercase tracking-wide text-ink-soft">{label}</dt><dd className="mt-2 text-sm leading-relaxed">{text}</dd></div>)}</dl> : null}
      {e.children.length ? <div className="mt-3 grid gap-2 sm:grid-cols-2">{e.children.map(id => { const child = entity(id)!; return <button type="button" key={id} onClick={() => open(id)} className="atlas-link flex min-h-16 items-start gap-3 rounded-xl border border-line p-3 text-left"><span className="min-w-0 flex-1"><span className="block text-sm font-bold">{child.name}</span><span className="mt-1 block text-xs leading-relaxed text-ink-soft">{child.learn.does}</span></span><ArrowRight className="mt-1 size-4 shrink-0" /></button>; })}</div> : null}
      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed">{(e.children.length ? r.structure.filter(x => !e.children.some(id => x.startsWith(`${entityName(id)}:`))) : r.structure).map(x => <li key={x}>{x}</li>)}</ul>
    </div>
    <div id={`${prefix}-connections`} className="mt-7 scroll-mt-24 border-t border-line pt-5" data-testid="atlas-connections">
      <h3 className="text-lg font-bold">How it connects</h3>
      <div className="mt-3 grid gap-5 lg:grid-cols-2">{r.connections.map(c => <section key={c.label} data-testid={c.label === 'Works with' ? 'learn-works-with' : undefined}>
        <h4 className="text-sm font-bold">{c.label}</h4><p className="mt-1 text-xs leading-relaxed text-ink-soft">{c.text}</p>
        <div className="mt-2 grid gap-2">{c.ids.filter(id => entity(id)).map(id => { const t = entity(id)!; return <button type="button" key={id} className="atlas-link flex items-start gap-2 rounded-lg border border-line px-3 py-2 text-left" onClick={() => open(id)}><span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{t.name}</span><span className="mt-1 block text-xs leading-relaxed text-ink-soft">{t.kind === 'nerve' ? NERVE_ATLAS[id]?.motor : t.learn.does}</span></span><ArrowRight className="mt-1 size-3.5 shrink-0" /></button>; })}</div>
      </section>)}</div>
    </div>
    <div id={`${prefix}-notice`} className="mt-7 scroll-mt-24 border-t border-line pt-5" data-testid="learn-overwork">
      <h3 className="text-lg font-bold">What to notice</h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-2"><section className="rounded-xl border border-line p-4"><h4 className="text-sm font-bold">{isNerve ? 'Muscle effort vs nerve symptoms' : 'Effort & ordinary fatigue'}</h4><ul className="mt-2 list-disc space-y-2 pl-4 text-sm leading-relaxed">{r.fatigue.map(x => <li key={x}>{x}</li>)}</ul></section><section className="rounded-xl border border-warn/30 bg-warn/10 p-4"><h4 className="text-sm font-bold">{isNerve ? 'Possible irritation' : 'Overload or irritation'}</h4><ul className="mt-2 list-disc space-y-2 pl-4 text-sm leading-relaxed">{r.irritation.map(x => <li key={x}>{x}</li>)}</ul></section></div>
      <p className="mt-3 text-xs leading-relaxed text-ink-soft">{r.watch}</p>
    </div>
    <div className="mt-6 flex flex-wrap items-center gap-3 rounded-xl bg-surface-2 p-4"><div className="flex-1"><h3 className="text-sm font-bold">Put this into practice</h3><p className="mt-1 text-xs text-ink-soft">Starting movements, cues and recovery for this exact area.</p></div><Button onClick={() => useDaylight.getState().setBody({ bodyWorkspace: 'training' })}>Training guide<ArrowRight className="size-4" /></Button></div>
    <SourceNotes e={e} />
  </div>;
}

function RefCard({ r }: { r: Ref }) {
  const m = LYFTA_REF_MEDIA[r.slug];
  const [play, setPlay] = useState(false);
  const [bad, setBad] = useState(false);
  return (
    <li className="rounded-lg border border-line bg-surface p-2" data-testid="ref-card">
      <div className="flex gap-3">
        {m?.png && !bad ? <img src={m.png} alt="" className="size-16 shrink-0 rounded bg-white object-contain" loading="lazy" onError={() => setBad(true)} /> : null}
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{r.name}</p>
          <p className="mt-0.5 text-sm text-ink-soft">{r.how}</p>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs">
            {m?.mp4 ? <button type="button" className="tap inline-flex min-h-9 items-center gap-1 font-semibold" onClick={() => setPlay(!play)}><Play className="size-3.5" />{play ? "Hide demo" : "Demo"}</button> : null}
            <a href={`https://www.lyfta.app/exercise/${r.slug}`} target="_blank" rel="noreferrer noopener" className="inline-flex min-h-9 items-center gap-1 font-semibold text-accent underline" data-testid="lyfta-link">View on Lyfta<ExternalLink className="size-3" /></a>
          </div>
        </div>
      </div>
      {play && m?.mp4 ? <video className="mt-2 block w-full rounded bg-white" src={m.mp4} poster={m.png} muted loop playsInline autoPlay /> : null}
    </li>
  );
}

function GuidePanel({ e, open }: { e: Entity; open: (id: string) => void }) {
  const s = useDaylight();
  const today = localDate();
  const plan = activePlan(s.planVersions, today);
  const planIds = useMemo(() => new Set(plan.days.flatMap((d) => d.slots.map((x) => x.exerciseId))), [plan]);
  const moves = useMoves(e, planIds).slice(0, e.kind === "joint" ? 6 : 8);
  const joint = e.kind === "joint" ? JOINTS.find((j) => j.id === e.id) : undefined;
  const pt = joint ? jointMoves(joint, plan) : [];
  const planned = useMemo(() => plannedVolume(plan), [plan]);
  const heat = useMemo(() => heatSnapshot(s.sessions, plan, s.heatWindow, today), [s.sessions, plan, s.heatWindow, today]);
  const G = e.guide;
  const reference = referenceFor(e);
  return (
    <div data-testid="guide-panel">
      <section className="mt-5" data-testid="guide-growth">
        <h3 className="text-lg font-bold">{e.kind === "nerve" ? "Movement & muscle control" : "Growth & movement practice"}</h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">{e.kind === "nerve" ? "Nerves carry signals; training suggestions apply to their supplied muscles, while sensory-only branches have no muscle-growth target." : "Choose a starting drill below, then use the exercise library for variations that fit your plan."}</p>
        {e.kind !== "nerve" && e.kind !== "joint" ? <p className="mt-3 text-sm leading-relaxed">{GROWTH_PRINCIPLES}</p> : null}
        <ol className="mt-4 grid gap-3" data-testid="atlas-practice">{reference.practice.map((p, i) => <li key={`${p.name}-${i}`} className="rounded-xl border border-line p-4"><div className="flex items-start gap-3"><span className="grid size-7 shrink-0 place-items-center rounded-full bg-surface-2 text-xs font-bold">{i + 1}</span><div><h4 className="text-base font-bold">{p.name}</h4><p className="mt-1 text-xs text-ink-soft">{p.purpose}</p><p className="mt-2 text-sm leading-relaxed">{p.cue}</p></div></div></li>)}</ol>
        <div className="mt-4 rounded-xl bg-surface-2 p-4"><h4 className="text-sm font-bold">A starting dose</h4><p className="mt-2 text-sm leading-relaxed">{reference.dosage}</p><h4 className="mt-4 text-sm font-bold">When to progress</h4><p className="mt-2 text-sm leading-relaxed">{reference.progress}</p></div>
        {e.kind === "nerve" ? <Links title="Explore supplied muscles" ids={e.learn.worksWith} open={open} /> : null}
        {e.kind === "joint" && moves.length ? (
          <ul className="mt-3 grid grid-cols-[minmax(0,1fr)] gap-2">
            {moves.map(({ ex }) => <MoveRow key={ex.id} ex={ex} inPlan={planIds.has(ex.id)} />)}
          </ul>
        ) : null}
        {e.kind !== "joint" && e.kind !== "nerve" ? <ExerciseSplit e={e} /> : null}

        {e.kind === "detail" ? null : G.growth?.length ? <ul className="mt-2 grid grid-cols-[minmax(0,1fr)] gap-2">{G.growth.map((r) => <RefCard key={r.slug} r={r} />)}</ul> : null}
      </section>
      <section className="mt-6" data-testid="guide-recovery">
        <h3 className="text-lg font-bold">Recovery</h3>
        <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-relaxed">{reference.recovery.map(t => <li key={t}>{t}</li>)}</ul>
        {pt.length ? (
          <>
            <Eyebrow className="mt-3">Your PT &amp; mobility moves</Eyebrow>
            <ul className="mt-1.5 grid grid-cols-[minmax(0,1fr)] gap-2">
              {pt.map((m) => <li key={m.exerciseId}><button type="button" className="tap flex w-full items-center gap-3 rounded-lg border border-line bg-surface p-2 text-left" onClick={() => s.setOverlay({ type: "form", exerciseId: m.exerciseId })}><MoveThumb exerciseId={m.exerciseId} size={44} /><span className="min-w-0 flex-1"><span className="block font-semibold">{m.name}</span><span className="block truncate text-xs text-ink-soft">{m.detail}</span></span><ArrowRight className="size-4 text-ink-faint" /></button></li>)}
            </ul>
          </>
        ) : null}
        {e.kind === "detail" || e.kind === "nerve" ? null : G.recovery?.length ? <ul className="mt-3 grid grid-cols-[minmax(0,1fr)] gap-2">{G.recovery.map((r) => <RefCard key={r.slug} r={r} />)}</ul> : null}
        <p className="mt-2 text-xs text-ink-faint">Demos and exercise pages: Lyfta exercise library. Short instructions are our own summary.</p>
      </section>
      <SourceNotes e={e} />
      {e.kind === "group" || e.kind === "muscle" || e.kind === "detail" ? (
        <details className="mt-6 rounded-lg border border-line p-3" data-testid="guide-coverage">
          <summary className="cursor-pointer font-semibold">Coverage and every exercise for {e.name}</summary>
          <div className="mt-3"><MusclePage id={e.id as AnyMuscleId} planned={planned} heat={heat} /></div>
        </details>
      ) : null}
    </div>
  );
}
