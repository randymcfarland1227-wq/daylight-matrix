import { PROFILES, ROLE, FEEL, GROUP_PROFILES, JOINT_PROFILES, NERVE_PROFILES } from "@/lib/daylight/learnProfiles";
import { subInfo as subInfoR12, type RegionId as RegionIdR12, type SubId as SubIdR12 } from "@/lib/daylight/muscles";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ExternalLink, Pencil, Play, Trash2 } from "lucide-react";
import { localDate, recordDate } from "@/lib/daylight/dates";
import { NERVES, entitiesOf, entity, entityName, linkedFrom, type Entity, type Kind, type Ref } from "@/lib/daylight/anatomy";
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
const NERVE_COLOR = "#d4a017";
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
      <div role="tablist" aria-label="Body level" className="grid grid-cols-5 gap-1 rounded-lg border border-line bg-surface-2 p-1">
        {LEVELS.map((l) => (
          <button key={l.id} type="button" role="tab" aria-selected={level === l.id} onClick={() => setLevel(l.id)} className={cn("tap min-h-10 rounded-md px-0.5 text-[13px] font-bold", level === l.id ? "bg-surface text-ink shadow-sm" : "text-ink-soft hover:text-ink")}>{l.label}</button>
        ))}
      </div>
      <p className="text-sm text-ink-soft">
        {tab === "journal" ? `Tap any of the ${lv.plural} to log how it feels and keep notes with photos.` : tab === "learn" ? `Tap any of the ${lv.plural} to learn what it does and how it connects.` : `Tap any of the ${lv.plural} for growth and recovery options, with demos from Lyfta.`}
      </p>
      <section className="body-atlas"><HubMap level={level} onPick={open} /></section>
      <EntityList level={level} open={open} />
      {tab === "journal" ? <RecentBodyNotes open={open} /> : null}
    </div>
  );
}

function HubMap({ level, onPick }: { level: Kind; onPick: (id: string) => void }) {
  const s = useDaylight();
  const [side, setSide] = useState(false);
  const today = localDate();
  const muscleLevel = level === "group" || level === "muscle" || level === "detail";
  const fill = (_id: AnyMuscleId) => (muscleLevel ? "#d9b6a0" : "#e3d3c4");
  const [sel, setSel] = useState<string | null>(null);
  const views = side && level === "joint" ? (["side"] as const) : (["front", "back"] as const);
  return (
    <div data-testid="hub-map">
      {level === "joint" ? (
        <div className="mb-3 flex gap-2"><Chip active={!side} onClick={() => setSide(false)}>Front &amp; back</Chip><Chip active={side} onClick={() => setSide(true)}>Side</Chip></div>
      ) : null}
      <ZoomPane>
        <div className={cn("journal-figures !mt-0", views.length === 1 && "journal-figures--side")}>
          {views.map((view) => (
            <div key={view} className="relative">
              {view === "side" ? <SideFigure /> : (
                <MapFigure realistic view={view} level={MAP_LEVEL[level]} interactive={muscleLevel} showLabel className="mapfig-real h-auto w-full" fill={fill} selected={sel} onSelect={(id) => { setSel(id); onPick(id); }} label={`${view} ${level} map`} />
              )}
              {level === "joint" ? <JointLayer view={view} logs={s.jointLogs ?? []} today={today} onPick={onPick} /> : null}
              {level === "nerve" && view !== "side" ? <NerveLayer view={view} onPick={onPick} /> : null}
            </div>
          ))}
        </div>
      </ZoomPane>
      {level === "nerve" ? <p className="mt-2 text-xs text-ink-soft">Nerve lines are a simplified guide to where each major nerve runs, drawn on one side and mirrored. Smaller nerves are in the list below.</p> : null}
    </div>
  );
}

function JointLayer({ view, logs, today, onPick }: { view: "front" | "back" | "side"; logs: JointLog[]; today: string; onPick: (id: string) => void }) {
  return (
    <svg viewBox="0 0 300 600" className="absolute inset-0 size-full" role="group" aria-label={`${view} joints`}>
      {JOINTS.filter((j) => j[view]).map((j) => {
        const p = j[view]!;
        const pts = p.pair ? [p, { x: 300 - p.x, y: p.y }] : [p];
        const t = heatTone(jointHeat(logs, j.id, today));
        return (
          <g key={j.id} role="button" tabIndex={0} aria-label={j.name} data-joint={j.id} className="cursor-pointer" onClick={() => onPick(j.id)} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onPick(j.id))}>
            {pts.map((q, i) => <g key={i}><circle cx={q.x} cy={q.y} r="18" fill="transparent" /><circle cx={q.x} cy={q.y} r="9" fill={TONE_FILL[t]} fillOpacity={t === "none" ? 1 : 0.85} stroke="var(--ink)" strokeWidth="2" /></g>)}
          </g>
        );
      })}
    </svg>
  );
}

function NerveLayer({ view, onPick }: { view: "front" | "back"; onPick: (id: string) => void }) {
  return (
    <svg viewBox="0 0 300 600" className="absolute inset-0 size-full" role="group" aria-label={`${view} nerves`}>
      {NERVES.filter((n) => n.paths.some((p) => p.view === view)).map((n) => (
        <g key={n.id} role="button" tabIndex={0} aria-label={n.name} data-nerve={n.id} className="cursor-pointer" onClick={() => onPick(n.id)} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onPick(n.id))}>
          {[undefined, MIRROR].map((tr, i) => (
            <g key={i} transform={tr}>
              {n.paths.filter((p) => p.view === view).map((p, k) => (
                <g key={k}>
                  <path d={p.d} fill="none" stroke="transparent" strokeWidth="14" strokeLinecap="round" />
                  <path d={p.d} fill="none" stroke={NERVE_COLOR} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                </g>
              ))}
            </g>
          ))}
        </g>
      ))}
    </svg>
  );
}

function EntityList({ level, open }: { level: Kind; open: (id: string) => void }) {
  const list = entitiesOf(level);
  const groups: [string, Entity[]][] = level === "detail"
    ? [...new Set(list.map((e) => e.parent!))].map((p) => [entityName(p), list.filter((e) => e.parent === p)])
    : level === "muscle"
      ? [...new Set(list.map((e) => e.parent!))].map((p) => [entityName(p), list.filter((e) => e.parent === p)])
      : level === "nerve"
        ? [["Major nerves", list.filter((e) => NERVES.find((n) => n.id === e.id)?.major)], ["Smaller nerves", list.filter((e) => !NERVES.find((n) => n.id === e.id)?.major)]]
        : [["", list]];
  return (
    <section className="journal-panel" aria-label="List" data-testid="entity-list">
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
      {profileFor(e) ? <p className="mt-1 text-sm text-ink-soft" data-testid="guide-feel">Feel it: {profileFor(e)!.feel}</p> : null}
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

function ProfileBlock({ e, part }: { e: Entity; part: "learn" | "guide" }) {
  const p = profileFor(e);
  if (!p) return null;
  const L = ({ t, xs }: { t: string; xs: string[] }) => <div className="mt-4"><h3 className="text-base font-semibold">{t}</h3><ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm">{xs.map((x) => <li key={x}>{x}</li>)}</ul></div>;
  return (
    <div data-testid={`${part}-profile`}>
      {part === "learn" ? <>
      <L t="What it lets you do" xs={p.everyday} />
      <div className="mt-4"><h3 className="text-base font-semibold">{e.kind === "nerve" ? "Where irritation tends to show up" : e.kind === "joint" ? "Where you notice it" : "Where you feel it"}</h3><p className="mt-1 text-sm">{p.feel}</p></div>
      {p.skip ? <div className="mt-4"><h3 className="text-base font-semibold">{e.kind === "joint" ? "If you neglect it" : "If you skip it"}</h3><p className="mt-1 text-sm">{p.skip}</p></div> : null}
      </> : <>
      {p.reps ? <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-lg border border-line bg-surface p-2"><Eyebrow>Rep ranges</Eyebrow><p className="mt-0.5">{p.reps}</p></div>
        <div className="rounded-lg border border-line bg-surface p-2"><Eyebrow>Frequency</Eyebrow><p className="mt-0.5">{p.freq}</p></div>
      </div> : null}
      <L t={e.kind === "joint" ? "Keep it healthy" : e.kind === "nerve" ? "Nerve-friendly habits" : "Key movement patterns"} xs={p.patterns} />
      {p.mistakes.filter((x) => x !== "—").length ? <div className="mt-4"><h3 className="text-base font-semibold">{e.kind === "joint" || e.kind === "nerve" ? "Habits that annoy it" : "Common mistakes"}</h3><ol className="mt-1 list-decimal space-y-0.5 pl-5 text-sm">{p.mistakes.filter((x) => x !== "—").map((x) => <li key={x}>{x}</li>)}</ol></div> : null}
      {p.faq?.map((f) => <details key={f.q} className="mt-3 rounded-lg border border-line p-2 text-sm"><summary className="cursor-pointer font-semibold">{f.q}</summary><p className="mt-1">{f.a}</p></details>)}
      </>}
    </div>
  );
}

function LearnPanel({ e, open }: { e: Entity; open: (id: string) => void }) {
  const L = e.learn;
  const back = linkedFrom(e.id).map((x) => x.id).filter((id) => ![L.worksWith, L.opposes, L.joints, L.nerves].some((l) => l?.includes(id)) && id !== e.parent);
  const isJoint = e.kind === "joint", isNerve = e.kind === "nerve";
  return (
    <div data-testid="learn-panel">
      {e.kind !== "detail" && profileFor(e) ? <p className="mt-4 text-base font-semibold text-accent" data-testid="learn-tagline">{profileFor(e)!.tagline}</p> : null}
      {e.kind === "detail" ? <p className="mt-4 text-sm text-ink-soft" data-testid="learn-descriptor">{subInfoR12(e.id)?.blurb}</p> : null}
      <h3 className="mt-5 text-base font-semibold">{e.kind === "detail" ? "Function / role" : "What it does"}</h3>
      <p className="mt-1 text-sm leading-relaxed">{e.kind === "detail" && ROLE[e.id as SubIdR12] ? ROLE[e.id as SubIdR12] : L.does}</p>
      <ProfileBlock e={e} part="learn" />
      {L.parts?.length ? (
        <div className="mt-5"><h3 className="text-base font-semibold">{e.kind === "detail" ? "What's inside" : "Parts"}</h3>
          {e.children.length ? <div className="mt-2 flex flex-wrap gap-2">{e.children.map((id) => <Chip key={id} onClick={() => open(id)}>{entityName(id)}</Chip>)}</div> : <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm">{L.parts.map((p) => <li key={p}>{p}</li>)}</ul>}
        </div>
      ) : null}
      <Links title={isJoint ? "Muscles that move and protect it" : isNerve ? "Muscles it powers" : "Works with"} ids={L.worksWith} open={open} testid="learn-works-with" />
      <Links title="Works against (opposite side)" ids={L.opposes} open={open} />
      {!isJoint ? <Links title={isNerve ? "Joints it runs past" : "Joints it moves"} ids={L.joints} open={open} /> : null}
      <Links title={isNerve ? "Connected nerves" : "Nerve supply"} ids={L.nerves} open={open} />
      {L.overwork?.length ? (
        <div className="mt-5 rounded-lg border border-warn/30 bg-warn/10 p-3" data-testid="learn-overwork">
          <h3 className="text-base font-semibold">{isNerve ? "Signs it may be irritated" : "Signs of overwork or irritation"}</h3>
          <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm">{L.overwork.map((x) => <li key={x}>{x}</li>)}</ul>
          <p className="mt-2 text-xs text-ink-soft">Education, not a diagnosis. Pain that persists, numbness, weakness or anything sudden is worth checking with your PT or doctor.</p>
        </div>
      ) : null}
      <Links title="Also connected" ids={back.slice(0, 16)} open={open} />
    </div>
  );
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
  return (
    <div data-testid="guide-panel">
      <section className="mt-5" data-testid="guide-growth">
        <h3 className="text-lg font-bold">Growth</h3>
        {e.kind === "nerve" ? <p className="mt-1 text-sm text-ink-soft">Nerves aren't grown like muscles. Strong, well-conditioned muscles along the nerve's path and regular movement keep it healthy. Muscles it powers:</p> : null}
        {G.growthTips?.length ? <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm">{G.growthTips.map((t) => <li key={t}>{t}</li>)}</ul> : null}
        {e.kind === "nerve" ? <div className="mt-2 flex flex-wrap gap-2">{(e.learn.worksWith ?? []).filter((id) => entity(id)).map((id) => <Chip key={id} tone="teal" onClick={() => open(id)}>{entityName(id)}</Chip>)}</div> : null}
        {e.kind === "joint" && moves.length ? (
          <ul className="mt-3 grid grid-cols-[minmax(0,1fr)] gap-2">
            {moves.map(({ ex }) => <MoveRow key={ex.id} ex={ex} inPlan={planIds.has(ex.id)} />)}
          </ul>
        ) : null}
        {e.kind !== "joint" && e.kind !== "nerve" ? <ExerciseSplit e={e} /> : null}
        <ProfileBlock e={e} part="guide" />
        {G.growth?.length ? <ul className="mt-2 grid grid-cols-[minmax(0,1fr)] gap-2">{G.growth.map((r) => <RefCard key={r.slug} r={r} />)}</ul> : null}
      </section>
      <section className="mt-6" data-testid="guide-recovery">
        <h3 className="text-lg font-bold">Recovery</h3>
        {G.recoveryTips?.length ? <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm">{G.recoveryTips.map((t) => <li key={t}>{t}</li>)}</ul> : null}
        {pt.length ? (
          <>
            <Eyebrow className="mt-3">Your PT &amp; mobility moves</Eyebrow>
            <ul className="mt-1.5 grid grid-cols-[minmax(0,1fr)] gap-2">
              {pt.map((m) => <li key={m.exerciseId}><button type="button" className="tap flex w-full items-center gap-3 rounded-lg border border-line bg-surface p-2 text-left" onClick={() => s.setOverlay({ type: "form", exerciseId: m.exerciseId })}><MoveThumb exerciseId={m.exerciseId} size={44} /><span className="min-w-0 flex-1"><span className="block font-semibold">{m.name}</span><span className="block truncate text-xs text-ink-soft">{m.detail}</span></span><ArrowRight className="size-4 text-ink-faint" /></button></li>)}
            </ul>
          </>
        ) : null}
        {G.recovery?.length ? <ul className="mt-3 grid grid-cols-[minmax(0,1fr)] gap-2">{G.recovery.map((r) => <RefCard key={r.slug} r={r} />)}</ul> : null}
        <p className="mt-2 text-xs text-ink-faint">Demos and exercise pages: Lyfta exercise library. Short instructions are our own summary.</p>
      </section>
      {e.kind === "group" || e.kind === "muscle" || e.kind === "detail" ? (
        <details className="mt-6 rounded-lg border border-line p-3" data-testid="guide-coverage">
          <summary className="cursor-pointer font-semibold">Coverage and every exercise for {e.name}</summary>
          <div className="mt-3"><MusclePage id={e.id as AnyMuscleId} planned={planned} heat={heat} /></div>
        </details>
      ) : null}
    </div>
  );
}
