import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Pencil, Trash2 } from "lucide-react";
import { localDate, recordDate } from "@/lib/daylight/dates";
import { JOINTS, JOINT_BY_ID, heatTone, jointHeat, jointMoves, jointNotes, type JointId, type JointInfo } from "@/lib/daylight/joints";
import { muscleName } from "@/lib/daylight/muscles";
import { activePlan } from "@/lib/daylight/plan";
import { useDaylight } from "@/lib/daylight/store";
import type { JointLog } from "@/lib/daylight/types";
import { MapFigure } from "./MapFigure";
import { MoveThumb } from "./MoveArt";
import { NoteThumbs } from "./NoteImages";
import { Button, Chip, Eyebrow, cn } from "./ui";

const TONE_FILL = { none: "var(--surface)", ok: "var(--accent)", mild: "var(--warn)", high: "var(--danger)" } as const;
const TONE_LABEL = { none: "No check yet", ok: "Feeling fine", mild: "Some discomfort", high: "Sore / painful" } as const;

function points(j: JointInfo, view: "front" | "back") {
  const p = j[view];
  if (!p) return [];
  return p.pair ? [{ x: p.x, y: p.y }, { x: 300 - p.x, y: p.y }] : [{ x: p.x, y: p.y }];
}

export function JointsView() {
  const s = useDaylight();
  const [open, setOpen] = useState<JointId | null>(null);
  const today = localDate();
  const logs = s.jointLogs ?? [];
  const top = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) return void (first.current = false);
    top.current?.scrollIntoView({ block: "start", behavior: "instant" });
  }, [open]);
  if (open) return <div ref={top} className="scroll-mt-20"><JointPage id={open} onBack={() => setOpen(null)} /></div>;
  const tone = (id: string) => heatTone(jointHeat(logs, id, today));
  return (
    <div ref={top} className="body-journal scroll-mt-20" data-testid="joints-view">
      <section className="body-atlas" aria-label="Choose a joint">
        <div className="atlas-heading">
          <div>
            <Eyebrow>Joints</Eyebrow>
            <h2>How your joints feel</h2>
          </div>
        </div>
        <p className="mt-2 text-sm text-ink-soft">Tap a joint to log how it feels, see related muscles and your PT moves, and keep notes with photos.</p>
        <div className="journal-figures" data-testid="joints-map">
          {(["front", "back"] as const).map((view) => (
            <div key={view} className="relative">
              <MapFigure view={view} level="region" interactive={false} showLabel className="h-auto w-full" fill={() => "var(--journal-idle)"} label={`${view} joints map`} />
              <svg viewBox="0 0 300 600" className="absolute inset-0 size-full" role="group" aria-label={`${view} joints`}>
                {JOINTS.filter((j) => j[view]).map((j) => {
                  const t = tone(j.id);
                  const notes = jointNotes(s.observations, j.id).length;
                  return (
                    <g key={j.id} role="button" tabIndex={0} aria-label={`${j.name}. ${TONE_LABEL[t]}`} data-joint={j.id} className="cursor-pointer" onClick={() => setOpen(j.id)} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setOpen(j.id))}>
                      {points(j, view).map((p, i) => (
                        <g key={i}>
                          <circle cx={p.x} cy={p.y} r="20" fill="transparent" />
                          <circle cx={p.x} cy={p.y} r="10" fill={TONE_FILL[t]} fillOpacity={t === "none" ? 1 : 0.85} stroke="var(--ink)" strokeWidth="2.2" />
                          {notes && i === 0 ? <circle cx={p.x + 9} cy={p.y - 9} r="4.5" fill="var(--info)" stroke="var(--surface)" strokeWidth="1.5" /> : null}
                        </g>
                      ))}
                    </g>
                  );
                })}
              </svg>
            </div>
          ))}
        </div>
        <p className="atlas-key">
          {(["ok", "mild", "high"] as const).map((t) => (
            <span key={t}>
              <i style={{ background: TONE_FILL[t] }} />
              {TONE_LABEL[t]}
            </span>
          ))}
          <span>
            <i style={{ background: "var(--info)" }} />
            Has notes
          </span>
        </p>
        <p className="mt-3 text-xs text-ink-soft">Colour is your own average check over the last 14 days. It is a personal log, not a diagnosis.</p>
      </section>
      <section className="journal-panel" aria-label="All joints">
        <Eyebrow>All joints</Eyebrow>
        <ul className="mt-2 grid grid-cols-[minmax(0,1fr)] gap-2">
          {JOINTS.map((j) => {
            const h = jointHeat(logs, j.id, today);
            const t = heatTone(h);
            return (
              <li key={j.id}>
                <button type="button" className="tap flex min-h-12 w-full items-center gap-3 rounded-lg border border-line bg-surface px-3 text-left" onClick={() => setOpen(j.id)}>
                  <span className="size-3.5 shrink-0 rounded-full border-2 border-ink" style={{ background: TONE_FILL[t] }} />
                  <span className="flex-1 font-semibold">{j.name}</span>
                  <span className="text-xs text-ink-soft">{h == null ? "—" : `${h.toFixed(1)} / 10`}</span>
                  <ArrowRight className="size-4 text-ink-faint" />
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

function JointPage({ id, onBack }: { id: JointId; onBack: () => void }) {
  const s = useDaylight();
  const j = JOINT_BY_ID.get(id)!;
  const today = localDate();
  const plan = activePlan(s.planVersions, today);
  const moves = useMemo(() => jointMoves(j, plan), [j, plan]);
  const notes = jointNotes(s.observations, id);
  const logs = (s.jointLogs ?? []).filter((l) => l.jointId === id);
  const avg = jointHeat(s.jointLogs ?? [], id, today);
  const [level, setLevel] = useState<number | null>(null);
  const [side, setSide] = useState<"" | NonNullable<JointLog["side"]>>("");
  const paired = Boolean(j.front?.pair || j.back?.pair);
  // last 14 days as a strip (max level per day)
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(`${today}T12:00:00`);
    d.setDate(d.getDate() - (13 - i));
    const key = d.toISOString().slice(0, 10);
    const hits = logs.filter((l) => l.date === key);
    return { key, v: hits.length ? Math.max(...hits.map((l) => l.level)) : null };
  });
  return (
    <div data-testid="joint-page">
      <Button tone="ghost" className="mb-3" onClick={onBack}>
        <ArrowLeft className="size-4" /> All joints
      </Button>
      <div className="journal-panel">
        <Eyebrow>Joint</Eyebrow>
        <h2 className="t-h2 mt-0.5 text-2xl font-bold" data-testid="joint-name">{j.name}</h2>
        <p className="mt-1 text-sm text-ink-soft">{j.blurb}</p>

        <div className="journal-composer mt-4">
          <h3 className="text-base font-semibold">How does it feel today?</h3>
          <p className="mt-0.5 text-xs text-ink-soft">0 = fine, 10 = worst. Optional.</p>
          <div className="mt-2 grid grid-cols-6 gap-1.5" role="radiogroup" aria-label="Joint discomfort level">
            {Array.from({ length: 11 }, (_, n) => (
              <button key={n} type="button" role="radio" aria-checked={level === n} onClick={() => setLevel(n)} className={cn("tap h-10 rounded-lg border text-sm font-semibold", level === n ? "border-accent bg-accent text-on-accent" : "border-line bg-surface")}>
                {n}
              </button>
            ))}
          </div>
          {paired ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {(["left", "right", "both"] as const).map((x) => (
                <Chip key={x} active={side === x} onClick={() => setSide(side === x ? "" : x)}>
                  {x === "both" ? "Both sides" : x === "left" ? "Left" : "Right"}
                </Chip>
              ))}
            </div>
          ) : null}
          <div className="mt-3 flex gap-2">
            <Button disabled={level == null} onClick={() => level != null && (s.addJointLog({ jointId: id, date: today, level, side: side || undefined }), setLevel(null), setSide(""), s.showToast(`${j.name} check saved`))}>
              Save check
            </Button>
            <Button tone="soft" onClick={() => s.setOverlay({ type: "note", jointId: id, kind: "general" })}>
              <Pencil className="size-4" /> Add note or photo
            </Button>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-ink-soft">Last 14 days{avg != null ? ` · average ${avg.toFixed(1)}` : ""}</p>
            <div className="mt-1.5 grid grid-cols-[repeat(14,minmax(0,1fr))] gap-1" aria-label="Last 14 days">
              {days.map((d) => (
                <span key={d.key} title={`${d.key}: ${d.v ?? "no check"}`} className="h-6 rounded" style={{ background: d.v == null ? "var(--surface-2)" : TONE_FILL[heatTone(d.v)], opacity: d.v == null ? 1 : 0.35 + d.v / 15 }} />
              ))}
            </div>
          </div>
          {logs.length ? (
            <ul className="mt-3 space-y-1 text-sm">
              {logs.slice(0, 5).map((l) => (
                <li key={l.id} className="flex items-center gap-2">
                  <span className="flex-1">
                    {recordDate(l.date)} · {l.time} · <b>{l.level}/10</b>
                    {l.side ? ` · ${l.side === "both" ? "both sides" : l.side}` : ""}
                  </span>
                  <button type="button" aria-label="Delete check" className="tap grid size-8 place-items-center rounded-full text-ink-faint" onClick={() => s.deleteJointLog(l.id)}>
                    <Trash2 className="size-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <h3 className="mt-6 text-base font-semibold">Related muscles</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {j.regions.map((r) => (
            <Chip key={r} tone="teal" onClick={() => s.setBody({ bodyWorkspace: "training", selectedMuscleId: r })}>
              {muscleName(r)}
            </Chip>
          ))}
        </div>

        <h3 className="mt-6 text-base font-semibold">PT &amp; mobility moves from your plan</h3>
        {moves.length ? (
          <ul className="mt-2 grid grid-cols-[minmax(0,1fr)] gap-2">
            {moves.map((m) => (
              <li key={m.exerciseId}>
                <button type="button" className="tap flex w-full items-center gap-3 rounded-lg border border-line bg-surface p-2 text-left" onClick={() => s.setOverlay({ type: "form", exerciseId: m.exerciseId })}>
                  <MoveThumb exerciseId={m.exerciseId} size={44} />
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{m.name}</span>
                    <span className="block truncate text-xs text-ink-soft">{m.source === "pt" ? "PT board · " : "Warm-up · "}{m.detail}</span>
                  </span>
                  <ArrowRight className="size-4 text-ink-faint" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-sm text-ink-soft">No PT or warm-up move in your current plan targets these muscles.</p>
        )}

        <h3 className="mt-6 text-base font-semibold">
          Notes <span className="text-ink-faint">{notes.length}</span>
        </h3>
        {notes.length ? (
          <div className="mt-2 grid grid-cols-[minmax(0,1fr)] gap-2">
            {notes.map((n) => (
              <article key={n.id} className="journal-entry">
                <time dateTime={n.context.date}>{recordDate(n.context.date)}</time>
                <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed">{n.text}</p>
                <NoteThumbs ids={n.imageIds} className="mt-2" onChange={(ids) => s.updateNote(n.id, { imageIds: ids })} />
              </article>
            ))}
          </div>
        ) : (
          <p className="journal-empty">No notes for {j.name.toLowerCase()} yet.</p>
        )}
      </div>
    </div>
  );
}
