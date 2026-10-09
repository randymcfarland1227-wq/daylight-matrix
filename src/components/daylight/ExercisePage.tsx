import { useEffect, useRef } from "react";
import { ArrowLeft, ChevronRight, ExternalLink, Info, PencilLine, PlayCircle } from "lucide-react";
import { localDate } from "@/lib/daylight/dates";
import { exerciseById } from "@/lib/daylight/exercises";
import { metaFor, muscleWikiUrl, tagsFor } from "@/lib/daylight/exmeta";
import { demoUrl, formFor } from "@/lib/daylight/form";
import { FIG_SKIN, GROUP_HUE, roleColor, roleOfWeight, ROLE_LABEL, type Role } from "@/lib/daylight/figureColors";
import { targetLine } from "@/lib/daylight/logic";
import { exerciseLabel } from "@/lib/daylight/names";
import { groupInfo, groupOfSub, muscleName, subInfo, type AnyMuscleId, type SubId } from "@/lib/daylight/muscles";
import { activePlan } from "@/lib/daylight/plan";
import { useDaylight } from "@/lib/daylight/store";
import { DAY_STYLE } from "@/lib/daylight/theme";
import { MapFigure } from "./MapFigure";
import { MoveMedia } from "./MoveMedia";
import { videoFor, vimeoPageUrl } from "@/lib/daylight/videos";
import { DIFF_TONE } from "./MusclePage";
import { Badge, Button, Eyebrow, cn } from "./ui";

type PlanUse = { weekday: number; dayName: string; psa?: string; dose: string; cue: string | null; alt: boolean };

function planUses(exerciseId: string, plan: ReturnType<typeof activePlan>): PlanUse[] {
  const out: PlanUse[] = [];
  for (const d of plan.days) {
    for (const s of d.slots) {
      const main = s.exerciseId === exerciseId;
      const alt = s.alternatives.some((a) => a.exerciseId === exerciseId);
      if (main || alt) out.push({ weekday: d.weekday, dayName: d.name, psa: d.psa, dose: targetLine(s), cue: s.sourceCue, alt: !main });
    }
  }
  return out;
}

function Section({ title, children, id }: { title: string; children: React.ReactNode; id?: string }) {
  return (
    <section aria-label={title} id={id}>
      <h2 className="t-title">{title}</h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}

function Para({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <p className="text-sm leading-relaxed">
      <b className="text-ink">{label}.</b> <span className="text-ink-soft">{children}</span>
    </p>
  );
}

/** Full-screen exercise reference page: real media, steps, how to perform, muscle diagram, metadata, tags, demo links. */
export function ExercisePage({ exerciseId, muscle, onClose }: { exerciseId: string; muscle?: string; onClose: () => void }) {
  const state = useDaylight();
  const dialogRef = useRef<HTMLDivElement>(null);
  const ex = exerciseById(exerciseId);
  const g = formFor(exerciseId);
  const meta = metaFor(exerciseId);
  const plan = activePlan(state.planVersions, localDate());
  const uses = planUses(exerciseId, plan);
  const mainUse = uses.find((u) => !u.alt) ?? uses[0];
  const name = exerciseLabel(exerciseId);
  const inGym = Boolean(state.gymMode);
  const weights = Object.entries(ex?.muscles ?? {}).filter(([, w]) => w) as [SubId, number][];
  weights.sort((a, b) => b[1] - a[1]);
  const topSub = weights[0]?.[0];
  const topGroup = topSub ? groupOfSub(topSub) : null;
  const hue = topGroup ? GROUP_HUE[topGroup] : "#7d86e8";
  const mw = muscleWikiUrl(exerciseId);
  const clip = videoFor(exerciseId);
  const tags = tagsFor(exerciseId);

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const controls = [...dialogRef.current.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled), textarea:not(:disabled), select:not(:disabled), iframe, [tabindex="0"]')].filter((element) => element.getClientRects().length > 0);
      const first = controls[0]; const last = controls[controls.length - 1];
      if (!first || !last) { e.preventDefault(); dialogRef.current.focus(); return; }
      if (e.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && (document.activeElement === last || document.activeElement === dialogRef.current)) { e.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      previousFocus?.focus();
    };
  }, [onClose]);

  const roleOf = (sid: string): Role | null => {
    const w = (ex?.muscles as Partial<Record<string, number>> | undefined)?.[sid];
    return w ? roleOfWeight(w) : null;
  };
  // the muscle diagram colours each sub-part in its own group hue, by how hard this move works it
  const fill = (id: AnyMuscleId) => {
    const r = roleOf(id);
    return r ? roleColor(groupOfSub(id as SubId), r) : FIG_SKIN;
  };
  const goMuscle = (id: string) => {
    if (inGym) return;
    state.setOverlay(null);
    state.setBody({ selectedMuscleId: id });
    state.setView("body");
  };

  const crumbMuscle = muscle ?? topGroup ?? null;
  const crumbs: { label: string; go?: () => void }[] = [{ label: "Exercises", go: onClose }];
  if (crumbMuscle) crumbs.push({ label: muscleName(crumbMuscle), go: inGym ? undefined : () => goMuscle(crumbMuscle) });
  crumbs.push({ label: name });

  return (
    <div ref={dialogRef} tabIndex={-1} className="fixed inset-0 z-50 flex flex-col bg-canvas outline-none" role="dialog" aria-modal="true" aria-label={`${name}: exercise guide`} data-testid="form-guide">
      <div className="mx-auto flex w-full max-w-5xl shrink-0 items-center gap-2 px-4 py-3" style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}>
        <button type="button" onClick={onClose} aria-label="Back" data-testid="exercise-close" className="tap flex min-h-11 items-center gap-1.5 rounded-lg bg-surface-2 px-3 text-sm font-bold">
          <ArrowLeft className="size-5" /> Back
        </button>
        <nav aria-label="Breadcrumb" className="no-scrollbar flex min-w-0 flex-1 items-center gap-1 overflow-x-auto whitespace-nowrap text-sm text-ink-soft">
          {crumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 ? <ChevronRight className="size-3.5 shrink-0" aria-hidden="true" /> : null}
              {c.go && i < crumbs.length - 1 ? (
                <button type="button" onClick={c.go} className="tap rounded px-1 font-semibold text-ink hover:underline">{c.label}</button>
              ) : (
                <span className={cn("px-1", i === crumbs.length - 1 && "font-bold text-ink")} aria-current={i === crumbs.length - 1 ? "page" : undefined}>{c.label}</span>
              )}
            </span>
          ))}
        </nav>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto w-full max-w-5xl px-4 pb-24 pt-1">
          <header className="flex flex-wrap items-center gap-3 rounded-xl bg-surface-2 px-5 py-4">
            <Badge tone={DIFF_TONE[meta.difficulty]}>{meta.difficulty}</Badge>
            <h1 className="t-display min-w-0 flex-1" data-testid="exercise-title">{name}</h1>
            {ex?.equipment ? <span className="rounded-full border border-line px-3 py-1 text-xs font-bold text-ink-soft">{ex.equipment}</span> : null}
          </header>

          <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
            <div className="min-w-0 space-y-6">
              <MoveMedia key={exerciseId} exerciseId={exerciseId} />

              {uses.length ? (
                <div className="space-y-2 rounded-lg border border-accent/40 bg-accent/10 p-4" data-testid="plan-context">
                  <Eyebrow className="text-warn">In your plan</Eyebrow>
                  {mainUse?.psa ? (
                    <p className="text-sm" data-testid="exercise-psa">
                      <b className="text-warn">{mainUse.dayName} PSA · from your PDF:</b> {mainUse.psa}
                    </p>
                  ) : null}
                  <ul className="space-y-1 text-sm">
                    {uses.map((u, i) => (
                      <li key={i}>
                        <b style={{ color: DAY_STYLE[u.weekday] ? undefined : undefined }}>{DAY_STYLE[u.weekday]!.short}</b> · {u.dose}
                        {u.alt ? <span className="text-ink-soft"> (swap option)</span> : null}
                      </li>
                    ))}
                  </ul>
                  {mainUse?.cue ? (
                    <div className="pt-1">
                      <Eyebrow className="text-warn">Your plan cue · from your PDF</Eyebrow>
                      <p className="mt-0.5 text-base font-semibold leading-snug">{mainUse.cue[0]!.toUpperCase() + mainUse.cue.slice(1)}</p>
                    </div>
                  ) : null}
                  {ex?.pdfNote || ex?.page2Dose ? (
                    <p className="text-sm">
                      <b className="text-warn">Your page 2 board:</b> {ex?.page2Dose ?? ""}
                      {ex?.page2Dose && ex?.pdfNote ? " · " : ""}
                      {ex?.pdfNote ? `“${ex.pdfNote}”` : ""}
                    </p>
                  ) : null}
                </div>
              ) : ex?.pdfNote || ex?.page2Dose ? (
                <p className="rounded-lg bg-accent/10 p-4 text-sm">
                  <b className="text-warn">Your page 2 board:</b> {ex?.page2Dose ?? ""} {ex?.pdfNote ? `“${ex.pdfNote}”` : ""}
                </p>
              ) : (
                <p className="rounded-lg bg-surface-2 p-3 text-sm text-ink-soft">This move is not in your PDF plan. It comes from the library.</p>
              )}

              {g ? (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="teal">General education, not from the PDF</Badge>
                    {ex?.back === "friendly" ? <Badge tone="teal">back-friendly</Badge> : ex?.back === "caution" ? <Badge tone="copper">go easy on the back</Badge> : null}
                  </div>
                  {g.clarify ? (
                    <p className="rounded-xl border border-warn/40 bg-warn/10 p-3 text-sm">
                      <b className="text-warn">About the PDF entry:</b> {g.clarify}
                    </p>
                  ) : null}

                  <Section title="Quick steps">
                    <ol className="space-y-2.5" data-testid="quick-steps">
                      {g.s.map((step, i) => (
                        <li key={i} className="flex gap-3">
                          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent text-sm font-extrabold text-on-accent">{i + 1}</span>
                          <span className="pt-1 t-body leading-snug">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </Section>

                  <Section title={`How to perform: ${name}`}>
                    <div className="space-y-4 rounded-lg border border-line bg-surface p-4" data-testid="how-to">
                      <div>
                        <h3 className="text-sm font-extrabold uppercase tracking-wider text-ink-soft">Setup</h3>
                        <div className="mt-1.5 space-y-2">
                          <Para label="Body position">{g.base}</Para>
                          <Para label="Brace and anchor">{g.brace}</Para>
                          <Para label="Grip and hands">{g.grip}</Para>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold uppercase tracking-wider text-ink-soft">Performing</h3>
                        <div className="mt-1.5 space-y-2">
                          <Para label="Range of motion">{g.rom}</Para>
                          <Para label="Tempo">{g.tempo}</Para>
                          <Para label="What you should feel">{g.feel}</Para>
                        </div>
                      </div>
                    </div>
                  </Section>

                  <Section title="Common mistakes">
                    <ul className="space-y-1.5">
                      {g.err.map((e) => (
                        <li key={e} className="flex gap-2 text-sm">
                          <span aria-hidden="true" className="text-danger">✕</span>
                          {e}
                        </li>
                      ))}
                    </ul>
                  </Section>
                  <p className="flex items-start gap-1.5 rounded-xl bg-surface-2 p-3 text-sm">
                    <Info className="mt-0.5 size-4 shrink-0 text-info" />
                    <span>
                      <b>Back-friendly note:</b> {g.back} <span className="text-ink-faint">General movement information, not medical advice.</span>
                    </span>
                  </p>
                </>
              ) : (
                <p className="rounded-xl bg-surface-2 p-3 text-sm text-ink-soft">No written guide for this move yet. Use the demo link.</p>
              )}
            </div>

            {/* ------------------------------------------------------------ right rail */}
            <aside className="space-y-4 lg:sticky lg:top-2" aria-label="Muscles and details">
              <div className="figure-panel card p-3" data-testid="exercise-muscle-map">
                <h2 className="t-title">Muscles worked</h2>
                <div className="mt-1 grid grid-cols-2 gap-1">
                  {(["front", "back"] as const).map((v) => (
                    <MapFigure key={v} view={v} level="sub" className="mx-auto h-auto w-full max-w-[150px]" fill={fill} interactive={false} label={`${v} view, muscles this move works`} />
                  ))}
                </div>
                <ul className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs" data-testid="role-legend">
                  {(["primary", "secondary", "tertiary"] as const).map((r) => (
                    <li key={r} className="flex items-center gap-1.5">
                      <i className="size-3 rounded-full border border-black/10" style={{ background: roleColor(topGroup ?? "chest", r) }} /> {ROLE_LABEL[r]}
                    </li>
                  ))}
                </ul>
                <p className="mt-1 text-center text-xs opacity-70">Each area keeps its own colour; stronger colour means harder work.</p>
              </div>

              <div className="rounded-lg border border-line bg-surface p-4">
                <ul className="space-y-2">
                  {(["primary", "secondary", "tertiary"] as const).map((r) => {
                    const list = weights.filter(([s]) => roleOf(s) === r);
                    if (!list.length) return null;
                    return (
                      <li key={r}>
                        <p className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-ink-soft">
                          <i className="size-2.5 rounded-full" style={{ background: roleColor(groupOfSub(list[0]![0]), r) }} /> {ROLE_LABEL[r]}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {list.map(([s]) => (
                            <button key={s} type="button" disabled={inGym} onClick={() => goMuscle(s)} className="tap rounded-full border border-line px-2.5 py-1 text-xs font-bold hover:bg-surface-2 disabled:opacity-80">
                              {subInfo(s)?.name ?? s}
                            </button>
                          ))}
                        </div>
                      </li>
                    );
                  })}
                  {weights.length === 0 ? <li className="text-sm text-ink-soft">No muscle mapping (cardio or mobility).</li> : null}
                </ul>
              </div>

              <dl className="divide-y divide-line rounded-lg border border-line bg-surface px-4 text-sm" data-testid="exercise-meta">
                {[
                  ["Difficulty", meta.difficulty],
                  ["Force", meta.force],
                  ["Mechanic", meta.mechanic],
                  ["Equipment", ex?.equipment ?? "None"],
                  ["Grip", g ? meta.grip : meta.grip],
                  ["Sides", ex?.unilateral ? "One side at a time" : "Both sides together"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3 py-2">
                    <dt className="font-bold text-ink-soft">{k}</dt>
                    <dd className="text-right font-semibold">{v}</dd>
                  </div>
                ))}
              </dl>
              <p className="text-xs text-ink-faint">Difficulty, force and mechanic are a simple editorial classification for this app, not a standard.</p>
            </aside>
          </div>

          <div className="mt-6 flex flex-wrap gap-2" data-testid="exercise-tags" aria-label="Tags">
            {tags.map((t) => (
              <span key={t} className="rounded-full bg-surface-2 px-3 py-1 text-xs font-bold text-ink-soft">{t}</span>
            ))}
          </div>

          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            <a href={clip ? vimeoPageUrl(clip.id) : demoUrl(exerciseId)} target="_blank" rel="noreferrer noopener" className="tap flex min-h-12 items-center justify-center gap-2 rounded-lg bg-accent px-4 font-bold text-on-accent" data-testid="demo-link">
              <PlayCircle className="size-5" /> {clip ? "Open this clip on Vimeo" : "Search Vimeo for a demo"} <ExternalLink className="size-4" />
            </a>
            {mw ? (
              <a href={mw} target="_blank" rel="noreferrer noopener" className="tap flex min-h-12 items-center justify-center gap-2 rounded-lg border border-line bg-surface px-4 font-bold" data-testid="mw-link">
                See this move on MuscleWiki <ExternalLink className="size-4" />
              </a>
            ) : null}
          </div>
          <p className="mt-2 text-xs text-ink-faint">Links open in a new tab. {mw ? "The MuscleWiki page was checked to exist. " : "No MuscleWiki page is linked for this move because none was verified. "}</p>

          <div className="mt-4">
            <Button tone="soft" className="w-full sm:w-auto" data-testid="exercise-note" onClick={() => state.setOverlay({ type: "note", exerciseId, kind: "gym", weekday: mainUse?.weekday })}>
              <PencilLine className="size-5" /> Log a note about this move
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
