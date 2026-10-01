import { ExternalLink, Info, PlayCircle } from "lucide-react";
import { exerciseById } from "@/lib/daylight/exercises";
import { demoUrl, formFor } from "@/lib/daylight/form";
import { useDaylight } from "@/lib/daylight/store";
import { exerciseLabel } from "@/lib/daylight/names";
import { activePlan } from "@/lib/daylight/plan";
import { localDate } from "@/lib/daylight/dates";
import { Badge, Button, Eyebrow, Sheet } from "./ui";
import { MuscleChips } from "./MuscleChips";
import { MoveArt } from "./MoveArt";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-surface-2 px-3 py-2">
      <p className="text-[0.68rem] font-extrabold uppercase tracking-wider text-ink-soft">{label}</p>
      <p className="mt-0.5 text-[0.95rem] leading-snug">{children}</p>
    </div>
  );
}

/** The cue the PDF gives for this move (first slot that uses it). */
function planCueFor(exerciseId: string, planDays: ReturnType<typeof activePlan>["days"]): string | null {
  for (const d of planDays) for (const s of d.slots) if ((s.exerciseId === exerciseId || s.alternatives.some((a) => a.exerciseId === exerciseId)) && s.sourceCue) return s.sourceCue;
  return null;
}

export function FormBody({ exerciseId, cue }: { exerciseId: string; cue?: string | null }) {
  const state = useDaylight();
  const ex = exerciseById(exerciseId);
  const g = formFor(exerciseId);
  const plan = activePlan(state.planVersions, localDate());
  const planCue = cue ?? planCueFor(exerciseId, plan.days);
  const name = exerciseLabel(exerciseId);
  return (
    <div className="space-y-4" data-testid="form-guide">
      <MoveArt exerciseId={exerciseId} />

      {planCue ? (
        <div className="rounded-xl bg-sun/20 p-3">
          <Eyebrow className="text-copper-deep">Your plan cue · from your PDF</Eyebrow>
          <p className="mt-0.5 text-base font-semibold leading-snug">{planCue[0]!.toUpperCase() + planCue.slice(1)}</p>
        </div>
      ) : null}
      {ex?.pdfNote || ex?.page2Dose ? (
        <p className="text-sm">
          <span className="font-bold text-copper-deep">Your page 2 board:</span> {ex.page2Dose ? `${ex.page2Dose}` : ""}
          {ex.page2Dose && ex.pdfNote ? " · " : ""}
          {ex.pdfNote ? `“${ex.pdfNote}”` : ""}
        </p>
      ) : null}

      {g ? (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="teal">General education, not from the PDF</Badge>
            {ex?.back === "friendly" ? <Badge tone="teal">back-friendly</Badge> : ex?.back === "caution" ? <Badge tone="copper">go easy on the back</Badge> : null}
          </div>
          {g.clarify ? (
            <p className="rounded-xl border border-copper/40 bg-copper/10 p-3 text-sm">
              <span className="font-bold text-copper-deep">About the PDF entry:</span> {g.clarify}
            </p>
          ) : null}
          <section>
            <h3 className="font-display text-xl">Step by step</h3>
            <ol className="mt-2 space-y-2">
              {g.s.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-sun text-sm font-extrabold text-on-sun">{i + 1}</span>
                  <span className="pt-0.5 text-[0.98rem] leading-snug">{step}</span>
                </li>
              ))}
            </ol>
          </section>
          <section className="grid gap-2 sm:grid-cols-2">
            <Row label="Stance / body position">{g.base}</Row>
            <Row label="Brace / anchor">{g.brace}</Row>
            <Row label="Grip / hands">{g.grip}</Row>
            <Row label="Range of motion">{g.rom}</Row>
            <Row label="Tempo">{g.tempo}</Row>
            <Row label="What you should feel">{g.feel}</Row>
          </section>
          <section>
            <h3 className="font-display text-xl">Common mistakes</h3>
            <ul className="mt-1.5 space-y-1">
              {g.err.map((e) => (
                <li key={e} className="flex gap-2 text-[0.95rem]">
                  <span aria-hidden="true" className="text-danger">✕</span>
                  {e}
                </li>
              ))}
            </ul>
          </section>
          <p className="flex items-start gap-1.5 rounded-xl bg-surface-2 p-3 text-sm">
            <Info className="mt-0.5 size-4 shrink-0 text-teal" />
            <span>
              <span className="font-bold">Back-friendly note:</span> {g.back} <span className="text-ink-faint">General movement information, not medical advice.</span>
            </span>
          </p>
        </>
      ) : (
        <p className="rounded-xl bg-surface-2 p-3 text-sm text-ink-soft">No written guide for this move yet. Use the demo link below.</p>
      )}

      <div>
        <Eyebrow>Muscles</Eyebrow>
        <div className="mt-1">
          <MuscleChips exerciseId={exerciseId} />
        </div>
      </div>

      <a href={demoUrl(exerciseId)} target="_blank" rel="noreferrer noopener" className="tap flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-forest px-4 font-bold text-on-forest" data-testid="demo-link">
        <PlayCircle className="size-5" /> Watch demo: “{name}” <ExternalLink className="size-4" />
      </a>
      <p className="text-xs text-ink-faint">Opens a YouTube search for this exact move name in a new tab. Pick a coach you trust. Nothing is saved or sent from here.</p>
    </div>
  );
}

export function FormSheet({ exerciseId, onClose }: { exerciseId: string; onClose: () => void }) {
  return (
    <Sheet title={exerciseLabel(exerciseId)} onClose={onClose} tall>
      <FormBody exerciseId={exerciseId} />
      <div className="mt-4">
        <Button tone="soft" className="w-full" onClick={onClose}>
          Close
        </Button>
      </div>
    </Sheet>
  );
}
