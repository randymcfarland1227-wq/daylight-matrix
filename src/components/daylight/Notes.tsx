import { useMemo, useRef, useState } from "react";
import { Copy, Download, Flag, Pencil, Trash2, Upload, Check, FileText } from "lucide-react";
import { WEEKDAY_NAMES, localDate, prettyDate, shortDate } from "@/lib/daylight/dates";
import { buildDigest, groupNotes } from "@/lib/daylight/digest";
import { exerciseLabel } from "@/lib/daylight/names";
import { muscleName } from "@/lib/daylight/muscles";
import { activePlan } from "@/lib/daylight/plan";
import { useDaylight } from "@/lib/daylight/store";
import { GYM_TAGS, type Observation } from "@/lib/daylight/types";
import { Badge, Button, Card, Chip, Empty, PageHead, Segmented, cn, copyText, downloadText } from "./ui";

type Tab = "all" | "next" | "digest";

export function Notes() {
  const state = useDaylight();
  const [tab, setTab] = useState<Tab>("all");
  const [tag, setTag] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [msg, setMsg] = useState("");
  const file = useRef<HTMLInputElement>(null);
  const flagged = state.observations.filter((n) => n.forNextPlan);
  const list = useMemo(() => {
    let l = tab === "next" ? flagged : state.observations;
    if (tag) l = l.filter((n) => n.tags.includes(tag));
    if (q.trim()) l = l.filter((n) => `${n.text} ${n.tags.join(" ")} ${n.context.exerciseId ? exerciseLabel(n.context.exerciseId) : ""}`.toLowerCase().includes(q.toLowerCase()));
    return l;
  }, [state.observations, flagged, tab, tag, q]);
  const usedTags = [...new Set(state.observations.flatMap((n) => n.tags))];
  const activeTrials = state.trials.filter((t) => t.status === "active");

  return (
    <div>
      <PageHead
        eyebrow="Gym & food observations"
        title="Notes"
        right={
          <Button tone="sun" onClick={() => state.setOverlay({ type: "note" })}>
            <Pencil className="size-4" /> New
          </Button>
        }
      />
      <Segmented<Tab>
        label="Notes views"
        value={tab}
        onChange={setTab}
        options={[
          { id: "all", label: `All · ${state.observations.length}` },
          { id: "next", label: `★ Next plan · ${flagged.length}` },
          { id: "digest", label: "Plan-builder digest" },
        ]}
      />

      {tab === "digest" ? (
        <Digest />
      ) : (
        <>
          <div className="mt-3">
            <input className="field" placeholder="Search notes" aria-label="Search notes" value={q} onChange={(e) => setQ(e.target.value)} />
            {usedTags.length ? (
              <div className="no-scrollbar -mx-4 mt-2 flex gap-2 overflow-x-auto px-4">
                {usedTags.map((t) => (
                  <Chip key={t} active={tag === t} tone="sun" onClick={() => setTag(tag === t ? null : t)}>
                    {t}
                  </Chip>
                ))}
              </div>
            ) : null}
          </div>

          {activeTrials.length && tab === "all" ? (
            <Card className="mt-4 border-teal/40">
              <h2 className="font-display text-xl">Active {activeTrials.length === 1 ? "trial" : "trials"}</h2>
              {activeTrials.map((trial) => {
                const origin = state.observations.find((o) => o.id === trial.observationId);
                return (
                  <article key={trial.id} className="mt-2 border-t border-line pt-2 text-sm">
                    <p>
                      <b>Change:</b> {trial.change}
                    </p>
                    <p className="text-ink-soft">
                      <b>Because:</b> {origin?.text}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Button size="sm" onClick={() => state.resolveTrial(trial.id, "keep", "")}>Keep</Button>
                      <Button size="sm" tone="outline" onClick={() => state.resolveTrial(trial.id, "revise", "")}>Revise</Button>
                      <Button size="sm" tone="ghost" onClick={() => state.resolveTrial(trial.id, "end", "")}>End</Button>
                    </div>
                  </article>
                );
              })}
            </Card>
          ) : null}

          <ul className="stagger mt-4 grid gap-2.5">
            {list.map((n) => (
              <NoteCard key={n.id} note={n} />
            ))}
          </ul>
          {list.length === 0 ? (
            <div className="mt-6">
              <Empty title={tab === "next" ? "Nothing flagged for the next plan yet" : "No notes yet"}>
                Tap the yellow pencil anywhere in the app — mid-set works — to capture a thought in two taps. Flag a note “for the next plan” and it lands in the digest.
              </Empty>
            </div>
          ) : null}
        </>
      )}

      <Card className="mt-8">
        <h2 className="font-display text-xl">Back up your notes</h2>
        <p className="mt-1 text-sm text-ink-soft">Notes live only on this device. Export them as JSON; import merges by note id, so nothing is duplicated.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button tone="outline" onClick={() => downloadText(`daylight-notes-${localDate()}.json`, state.exportNotesJson())}>
            <Download className="size-4" /> Export notes
          </Button>
          <Button tone="outline" onClick={() => file.current?.click()}>
            <Upload className="size-4" /> Import notes
          </Button>
          <input
            ref={file}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            aria-label="Import notes file"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              setMsg(state.importNotesJson(await f.text()));
              e.target.value = "";
            }}
          />
        </div>
        {msg ? <p className="mt-2 text-sm font-semibold text-forest" role="status">{msg}</p> : null}
      </Card>
    </div>
  );
}

function NoteCard({ note: n }: { note: Observation }) {
  const state = useDaylight();
  const [edit, setEdit] = useState(false);
  const [text, setText] = useState(n.text);
  const where = [n.context.exerciseId ? exerciseLabel(n.context.exerciseId) : null, n.context.muscleId ? muscleName(n.context.muscleId) : null].filter(Boolean);
  return (
    <li>
      <article className={cn("card p-3.5", n.forNextPlan && "border-copper/50")}>
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-ink-faint">
              {n.context.weekday != null ? `${WEEKDAY_NAMES[n.context.weekday]!.slice(0, 3)} · ` : ""}
              {shortDate(n.context.date)} · {n.context.time}
              {n.kind && n.kind !== "gym" ? ` · ${n.kind}` : ""}
            </p>
            {edit ? (
              <textarea className="field mt-1 min-h-20 py-2" value={text} onChange={(e) => setText(e.target.value)} aria-label="Edit note" />
            ) : (
              <p className="mt-0.5 text-base leading-snug">{n.text}</p>
            )}
          </div>
          <button
            type="button"
            aria-pressed={Boolean(n.forNextPlan)}
            aria-label={n.forNextPlan ? "Remove flag for next plan" : "Flag for next plan"}
            onClick={() => state.updateNote(n.id, { forNextPlan: !n.forNextPlan })}
            className={cn("tap grid size-10 shrink-0 place-items-center rounded-full", n.forNextPlan ? "bg-copper text-white" : "bg-surface-2 text-ink-soft")}
          >
            <Flag className="size-4" fill={n.forNextPlan ? "currentColor" : "none"} />
          </button>
        </div>
        {(where.length || n.tags.length) && !edit ? (
          <div className="mt-2 flex flex-wrap gap-1">
            {where.map((w) => (
              <Badge key={w} tone="teal">{w}</Badge>
            ))}
            {n.tags.map((t) => (
              <Badge key={t} tone="sun">{t}</Badge>
            ))}
          </div>
        ) : null}
        {edit ? (
          <div className="mt-2 space-y-2">
            <div className="flex flex-wrap gap-1.5">
              {GYM_TAGS.map((t) => (
                <Chip key={t} tone="sun" active={n.tags.includes(t)} onClick={() => state.updateNote(n.id, { tags: n.tags.includes(t) ? n.tags.filter((x) => x !== t) : [...n.tags, t] })}>
                  {t}
                </Chip>
              ))}
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => (state.updateNote(n.id, { text: text.trim() || n.text }), setEdit(false))}>
                <Check className="size-4" /> Save
              </Button>
              <Button size="sm" tone="ghost" onClick={() => (setText(n.text), setEdit(false))}>Cancel</Button>
            </div>
          </div>
        ) : (
          <div className="mt-2 flex gap-1 text-sm">
            <Button size="sm" tone="ghost" onClick={() => setEdit(true)}>
              <Pencil className="size-3.5" /> Edit
            </Button>
            <Button size="sm" tone="ghost" onClick={() => state.setOverlay({ type: "trial", observationId: n.id })}>
              Try a change
            </Button>
            <Button size="sm" tone="ghost" className="ml-auto text-danger" aria-label="Delete note" onClick={() => window.confirm("Delete this note?") && state.deleteNote(n.id)}>
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        )}
      </article>
    </li>
  );
}

function Digest() {
  const state = useDaylight();
  const [copied, setCopied] = useState(false);
  const [which, setWhich] = useState<"text" | "grouped">("text");
  const plan = activePlan(state.planVersions, localDate());
  const flaggedOnly = state.observations.filter((n) => n.forNextPlan);
  const [scope, setScope] = useState<"all" | "flagged">("all");
  const notes = scope === "flagged" ? flaggedOnly : state.observations;
  const text = useMemo(
    () => buildDigest({ notes, plan, sessions: state.sessions, weeklyTarget: state.weeklyTarget, planContext: state.planContext, units: state.units }),
    [notes, plan, state.sessions, state.weeklyTarget, state.planContext, state.units],
  );
  const grouped = useMemo(() => groupNotes(notes), [notes]);
  return (
    <div className="mt-4 space-y-4">
      <Card>
        <div className="flex items-center gap-2">
          <FileText className="size-5 text-forest" />
          <h2 className="font-display text-xl">Plan-builder digest</h2>
        </div>
        <p className="mt-1 text-sm text-ink-soft">Your plan, weekly sets per muscle (planned vs logged), underserved areas, and your notes — grouped and ready to paste into an AI chat to build the next plan.</p>
        <label className="mt-3 block">
          <span className="eyebrow">Context to include (editable, saved on this device)</span>
          <textarea className="field mt-1 min-h-20 py-2 text-sm" value={state.planContext} onChange={(e) => state.setPlanContext(e.target.value)} />
        </label>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Chip active={scope === "all"} onClick={() => setScope("all")}>All notes ({state.observations.length})</Chip>
          <Chip active={scope === "flagged"} tone="sun" onClick={() => setScope("flagged")}>Only ★ flagged ({flaggedOnly.length})</Chip>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            tone="sun"
            onClick={async () => {
              const ok = await copyText(text);
              setCopied(ok);
              state.showToast(ok ? "Digest copied" : "Copy failed — select the text instead");
              setTimeout(() => setCopied(false), 2500);
            }}
          >
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />} {copied ? "Copied" : "Copy as text"}
          </Button>
          <Button tone="outline" onClick={() => downloadText(`daylight-plan-brief-${localDate()}.txt`, text, "text/plain")}>
            <Download className="size-4" /> Download .txt
          </Button>
        </div>
      </Card>

      <Segmented<"text" | "grouped"> label="Digest view" value={which} onChange={setWhich} options={[{ id: "text", label: "Text to paste" }, { id: "grouped", label: "Grouped view" }]} />

      {which === "text" ? (
        <textarea readOnly aria-label="Digest text" className="field min-h-[24rem] py-3 font-mono text-xs leading-relaxed" value={text} onFocus={(e) => e.currentTarget.select()} />
      ) : (
        <div className="space-y-4">
          <GroupBlock title="By exercise" groups={grouped.exercise} />
          <GroupBlock title="By muscle" groups={grouped.muscle} />
          {grouped.general.length ? (
            <Card>
              <h3 className="font-display text-lg">Other</h3>
              <ul className="mt-1 space-y-1 text-sm">
                {grouped.general.map((n) => (
                  <li key={n.id}>{prettyDate(n.context.date).split(",")[0]} · {n.text}</li>
                ))}
              </ul>
            </Card>
          ) : null}
        </div>
      )}
    </div>
  );
}

function GroupBlock({ title, groups }: { title: string; groups: { key: string; label: string; notes: Observation[] }[] }) {
  if (!groups.length) return null;
  return (
    <Card>
      <h3 className="font-display text-lg">{title}</h3>
      <ul className="mt-2 space-y-3">
        {groups.map((g) => (
          <li key={g.key}>
            <p className="font-bold">
              {g.label} <span className="text-ink-faint">· {g.notes.length}</span>
            </p>
            <ul className="mt-0.5 space-y-0.5 text-sm text-ink-soft">
              {g.notes.map((n) => (
                <li key={n.id}>
                  {n.forNextPlan ? "★ " : "• "}
                  {n.text}
                  {n.tags.length ? <span className="text-ink-faint"> [{n.tags.join("; ")}]</span> : null}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </Card>
  );
}
