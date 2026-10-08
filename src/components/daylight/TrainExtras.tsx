import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { WEEKDAY_NAMES, localDate, prettyDate } from "@/lib/daylight/dates";
import { exercises } from "@/lib/daylight/exercises";
import { exerciseLabel } from "@/lib/daylight/names";
import { IMPORT_NOTES, PT_REFERENCES, UNSCHEDULED, activePlan, dayTemplate } from "@/lib/daylight/plan";
import { chosenExerciseId } from "@/lib/daylight/logic";
import { useDaylight } from "@/lib/daylight/store";
import { Badge, Button, Card, Chip, Empty, Eyebrow, PageHead } from "./ui";
import { MuscleChips } from "./MuscleChips";
import { exerciseById } from "@/lib/daylight/exercises";
import { DAY_STYLE } from "@/lib/daylight/theme";
import { cn } from "./ui";
import { MoveThumb } from "./MoveArt";

export function Moves() {
  const state = useDaylight();
  const plan = activePlan(state.planVersions, localDate());
  const [q, setQ] = useState("");
  const [only, setOnly] = useState<"plan" | "extras" | "all">("plan");
  const inPlan = useMemo(() => {
    const m = new Map<string, number[]>();
    for (const day of plan.days)
      for (const slot of day.slots)
        for (const id of [slot.exerciseId, ...slot.alternatives.map((a) => a.exerciseId)]) m.set(id, [...(m.get(id) ?? []).filter((d) => d !== day.weekday), day.weekday]);
    return m;
  }, [plan]);
  const list = exercises
    .filter((e) => (only === "plan" ? inPlan.has(e.id) : only === "extras" ? e.extra : true))
    .filter((e) => e.name.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));
  return (
    <div>
      <PageHead eyebrow="Library" title="Moves" />
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-3.5 size-5 text-ink-faint" />
        <input className="field pl-10" placeholder="Search moves" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search moves" />
      </div>
      <div className="mt-3 flex gap-2">
        <Chip active={only === "plan"} onClick={() => setOnly("plan")}>In my plan</Chip>
        <Chip active={only === "extras"} onClick={() => setOnly("extras")} tone="sun">Not in plan (ideas)</Chip>
        <Chip active={only === "all"} onClick={() => setOnly("all")}>All</Chip>
      </div>
      <p className="mt-3 text-sm text-ink-soft">{UNSCHEDULED.note}</p>
      <ul className="stagger mt-4 grid gap-3 md:grid-cols-2">
        {list.map((e) => (
          <li key={e.id}>
            <Card className="h-full">
              <div className="flex items-start gap-3">
                <MoveThumb exerciseId={e.id} size={56} />
                <div className="flex min-w-0 flex-1 items-start justify-between gap-2">
                  <h3 className="t-title">{e.name}</h3>
                  {e.extra ? <Badge tone="sun">idea · not in PDF</Badge> : null}
                </div>
              </div>
              <p className="mt-0.5 text-xs text-ink-faint">
                {e.equipment}
                {inPlan.has(e.id) ? ` · ${inPlan.get(e.id)!.map((d) => DAY_STYLE[d]!.short).join(", ")}` : ""}
              </p>
              <div className="mt-2">
                <MuscleChips exerciseId={e.id} />
              </div>
              {e.backNote ? (
                <p className="mt-2 text-xs text-ink-soft">
                  <Badge tone={e.back === "friendly" ? "teal" : e.back === "caution" ? "copper" : "plain"}>{e.back === "friendly" ? "back-friendly" : e.back === "caution" ? "go easy on back" : "neutral"}</Badge> {e.backNote}
                </p>
              ) : null}
              {e.pdfNote ? <p className="mt-2 text-sm italic text-warn">“{e.pdfNote}” — your note</p> : null}
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" tone="soft" data-testid="moves-form" onClick={() => state.setOverlay({ type: "form", exerciseId: e.id })}>
                  Form guide &amp; demo
                </Button>
                <Button size="sm" tone="soft" onClick={() => state.setOverlay({ type: "note", exerciseId: e.id, kind: "gym" })}>
                  Note
                </Button>
                <Button size="sm" tone="ghost" onClick={() => state.setOverlay({ type: "move", exerciseId: e.id })}>
                  <Plus className="size-4" /> Add to a day
                </Button>
              </div>
            </Card>
          </li>
        ))}
      </ul>
      {list.length === 0 ? <Empty title="Nothing matches" /> : null}
    </div>
  );
}

export function PtBoard() {
  const notes = useDaylight((s) => s.ptNotes);
  const setPtNote = useDaylight((s) => s.setPtNote);
  const setOpenLesson = useDaylight((s) => s.setOpenLesson);
  const setOverlay = useDaylight((s) => s.setOverlay);
  return (
    <div>
      <PageHead eyebrow="Page 2 of your PDF" title="PT board" />
      <p className="text-sm text-ink-soft">Your personal reference board with your own words. It is not a clinician’s prescription unless you record a provider. The weekly schedule (page 1) is what the plan uses.</p>
      <ul className="stagger mt-4 grid gap-3 md:grid-cols-2">
        {PT_REFERENCES.map((ref) => {
          const ex = exerciseById(ref.exerciseId);
          return (
            <li key={ref.id}>
              <Card className="h-full">
                <div className="flex items-center gap-3">
                  <MoveThumb exerciseId={ref.exerciseId} size={52} />
                  <h3 className="t-title">{ex?.name}</h3>
                </div>
                {ref.pdfNote ? <p className="mt-1 t-title italic text-warn">“{ref.pdfNote}”</p> : null}
                <p className="mt-1 text-sm">{ref.parameters}</p>
                {ref.discrepancy ? <p className="mt-1 rounded-lg bg-accent/20 px-2 py-1 text-sm">{ref.discrepancy}</p> : null}
                <label className="mt-2 block">
                  <span className="text-xs font-bold uppercase tracking-wider text-ink-soft">Your note</span>
                  <textarea className="field mt-1 min-h-16 py-2" value={notes[ref.id] ?? ""} onChange={(e) => setPtNote(ref.id, e.target.value)} />
                </label>
                <div className="flex flex-wrap gap-2">
                  <Button tone="soft" size="sm" onClick={() => setOverlay({ type: "form", exerciseId: ref.exerciseId })}>
                    Form guide &amp; demo
                  </Button>
                  <Button tone="ghost" size="sm" onClick={() => setOpenLesson(ex?.id ?? null)}>
                    Learn
                  </Button>
                </div>
              </Card>
            </li>
          );
        })}
        <li>
          <Card className="h-full border-accent/50">
            <Badge tone="sun">featured on page 2</Badge>
            <div className="mt-1 flex items-center gap-3">
              <MoveThumb exerciseId="battle-rope-squat" size={52} />
              <h3 className="t-title">Battle Rope Squats</h3>
            </div>
            <p className="mt-1 t-title italic text-warn">“Meta!” · “Oscilate Anchor when needed” · “S Tier”</p>
            <p className="mt-1 text-sm text-ink-soft">{UNSCHEDULED.note}</p>
            <div className="mt-2">
              <MuscleChips exerciseId="battle-rope-squat" />
            </div>
            <Button className="mt-2" tone="soft" size="sm" onClick={() => setOverlay({ type: "form", exerciseId: "battle-rope-squat" })}>
              Form guide &amp; demo
            </Button>
          </Card>
        </li>
      </ul>
    </div>
  );
}

export function PlanEditor() {
  const state = useDaylight();
  const draft = state.planDraft;
  const plan = draft ?? activePlan(state.planVersions, state.drafts.planDate || localDate());
  const day = dayTemplate(plan, state.editorWeekday);
  return (
    <div>
      <PageHead eyebrow={`Active: ${activePlan(state.planVersions, localDate()).name} v${activePlan(state.planVersions, localDate()).version}`} title="Edit plan" />
      <p className="text-sm text-ink-soft">Edits sit in a draft until you save a new version. Earlier versions and past sessions stay exactly as they were.</p>
      {!draft ? (
        <Button className="mt-3" tone="outline" onClick={() => state.ensureDraft()}>
          Start a draft
        </Button>
      ) : (
        <Badge tone="sun" className="mt-3">draft in progress</Badge>
      )}
      <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto">
        {[1, 2, 3, 4, 5, 6, 0].map((d) => (
          <Chip key={d} active={state.editorWeekday === d} onClick={() => state.setEditorWeekday(d)}>
            {DAY_STYLE[d]!.short}
          </Chip>
        ))}
      </div>
      <h2 className="mt-4 t-title">{day.name}</h2>
      <ul className="mt-2 grid gap-2">
        {day.slots.map((slot, index) => (
          <li key={slot.id} className="card flex items-center gap-2 px-3 py-2">
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{exerciseLabel(chosenExerciseId(slot, {}))}</p>
              <p className="text-xs text-ink-soft">
                {slot.sets ? `${slot.sets}${slot.setsMax ? `–${slot.setsMax}` : ""} × ${slot.repLabel}` : slot.durationLabel}
              </p>
            </div>
            <Button size="sm" tone="soft" aria-label="Move earlier" onClick={() => state.moveSlot(state.editorWeekday, index, -1)}>↑</Button>
            <Button size="sm" tone="soft" aria-label="Move later" onClick={() => state.moveSlot(state.editorWeekday, index, 1)}>↓</Button>
            <Button size="sm" tone="ghost" onClick={() => state.removeSlot(state.editorWeekday, index)}>Remove</Button>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button tone="outline" onClick={() => state.setTrainingTab("moves")}>
          <Plus className="size-4" /> Add from the library
        </Button>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <label>
          <span className="text-xs font-bold uppercase tracking-wider text-ink-soft">Effective date</span>
          <input type="date" className="field mt-1" value={state.drafts.planDate} onChange={(e) => state.patchDraft({ planDate: e.target.value })} />
        </label>
        <label>
          <span className="text-xs font-bold uppercase tracking-wider text-ink-soft">Reason</span>
          <input className="field mt-1" value={state.drafts.planReason} onChange={(e) => state.patchDraft({ planReason: e.target.value })} />
        </label>
      </div>
      <div className="mt-3 flex gap-2">
        <Button onClick={() => state.savePlanVersion(null)} disabled={!draft}>Save new plan version</Button>
        {draft ? <Button tone="ghost" onClick={() => state.discardDraft()}>Discard draft</Button> : null}
      </div>
      <h2 className="mt-8 t-title">Versions</h2>
      <ul className="mt-2 grid gap-2 text-sm">
        {state.planVersions
          .slice()
          .sort((a, b) => b.version - a.version)
          .map((v) => (
            <li key={v.id} className="card px-3 py-2">
              <span className="font-bold">v{v.version}</span> · from {prettyDate(v.effectiveDate)} · <span className="text-ink-soft">{v.reason}</span>
            </li>
          ))}
      </ul>
      <h2 className="mt-8 t-title">What was imported from the PDF</h2>
      <ul className="mt-2 grid list-disc gap-1.5 pl-5 text-sm text-ink-soft">
        {IMPORT_NOTES.map((n) => (
          <li key={n}>{n}</li>
        ))}
      </ul>
      <Eyebrow className="mt-4">{WEEKDAY_NAMES.length} weekdays · PDF artwork not reproduced</Eyebrow>
      <p className={cn("hidden")}>.</p>
    </div>
  );
}
