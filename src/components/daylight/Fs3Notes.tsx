import { exerciseById } from "@/lib/daylight/exercises";
import { FS3_ABS, FS3_CHAIN, FS3_IMPORT_NOTES, FS3_LATS, FS3_LOG, FS3_RESEARCH, FS3_RUNNING, FS3_STRIP, FS3_WARMUP, FS3_WARMUP_INTRO } from "@/lib/daylight/fs3";
import { useDaylight } from "@/lib/daylight/store";
import { Badge, Button, Card, PageHead } from "./ui";
import { MoveThumb } from "./MoveArt";

const TONE: Record<string, string> = { flag: "text-warn", pull: "text-accent", legs: "text-teal", push: "text-copper" };

/** Fine Shyte 3 warm-up menu: pick 2–3 from whatever area is loudest today. */
export function WarmUpMenu() {
  const setOverlay = useDaylight((s) => s.setOverlay);
  return (
    <div data-testid="fs3-warmup">
      <PageHead eyebrow="Fine Shyte 3" title="Warm-up menu, by feel" />
      <p className="text-sm text-ink-soft">{FS3_WARMUP_INTRO}</p>
      <ul className="stagger mt-4 grid gap-3 md:grid-cols-2">
        {FS3_WARMUP.map((g) => (
          <li key={g.id}>
            <Card className="h-full">
              <h3 className={`t-title ${TONE[g.tone]}`}>{g.title}</h3>
              <ul className="mt-2 grid gap-2.5">
                {g.items.map((it) => (
                  <li key={it.text} className="flex items-start gap-3">
                    {it.exerciseId ? <MoveThumb exerciseId={it.exerciseId} size={44} /> : null}
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">
                        {it.text}, <span className="tabular-nums">{it.dose}</span>
                        {it.note ? <span className="font-normal text-ink-soft"> · {it.note}</span> : null}
                      </p>
                      {it.how ? <p className="text-sm text-ink-soft">{it.how}</p> : null}
                      {it.exerciseId && exerciseById(it.exerciseId) ? (
                        <Button className="mt-1" size="sm" tone="soft" onClick={() => setOverlay({ type: "form", exerciseId: it.exerciseId! })}>
                          Form guide &amp; demo
                        </Button>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** The notes sections from the Fine Shyte 3 plan page. */
export function Fs3PlanNotes() {
  return (
    <div className="mt-8 grid gap-3" data-testid="fs3-notes">
      <h2 className="t-title">About Fine Shyte 3</h2>
      <ul className="grid gap-2 sm:grid-cols-2">
        {FS3_STRIP.map((s) => (
          <li key={s.title} className="card px-3 py-2 text-sm">
            <b className="block">{s.title}</b>
            <span className="text-ink-soft">{s.body}</span>
          </li>
        ))}
      </ul>
      <Card className="border-warn/40">
        <Badge tone="copper">chain</Badge>
        <h3 className="mt-1 t-title">Your notes are one chain</h3>
        {FS3_CHAIN.map((p) => (
          <p key={p} className="mt-1 text-sm">{p}</p>
        ))}
      </Card>
      <Card>
        <h3 className="t-title">Finding the lats</h3>
        <ul className="mt-1 grid list-disc gap-1 pl-5 text-sm">{FS3_LATS.map((t) => <li key={t}>{t}</li>)}</ul>
      </Card>
      <Card>
        <h3 className="t-title">Abs, straight</h3>
        <p className="mt-1 text-sm">{FS3_ABS}</p>
      </Card>
      <Card>
        <h3 className="t-title">Running it 6 months</h3>
        <ul className="mt-1 grid list-disc gap-1 pl-5 text-sm">{FS3_RUNNING.map((t) => <li key={t}>{t}</li>)}</ul>
      </Card>
      <Card>
        <h3 className="t-title">Logged from you</h3>
        <ul className="mt-1 grid gap-1.5 text-sm">
          {FS3_LOG.map((l) => (
            <li key={l.text}>
              <span className="mr-2 font-mono text-xs text-warn">{l.date}</span>
              {l.text}
            </li>
          ))}
        </ul>
      </Card>
      <Card>
        <h3 className="t-title">Research behind it</h3>
        <ul className="mt-1 grid list-disc gap-1 pl-5 text-sm">
          {FS3_RESEARCH.map((r) => (
            <li key={r.url}>
              <a className="font-semibold text-accent underline" href={r.url} target="_blank" rel="noreferrer noopener">{r.label}</a>: {r.finding}
            </li>
          ))}
        </ul>
      </Card>
      <h2 className="mt-4 t-title">What was imported</h2>
      <ul className="grid list-disc gap-1.5 pl-5 text-sm text-ink-soft">{FS3_IMPORT_NOTES.map((n) => <li key={n}>{n}</li>)}</ul>
    </div>
  );
}
