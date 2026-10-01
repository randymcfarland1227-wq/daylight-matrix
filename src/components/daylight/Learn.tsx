import { useState } from "react";
import { localDate } from "@/lib/daylight/dates";
import { LESSONS, lessonsForPlan } from "@/lib/daylight/learn";
import { activePlan } from "@/lib/daylight/plan";
import { useDaylight } from "@/lib/daylight/store";
import { Button } from "./ui";

export function Learn() {
  const planVersions = useDaylight((s) => s.planVersions);
  const openId = useDaylight((s) => s.openLessonId);
  const setOpen = useDaylight((s) => s.setOpenLesson);
  const [all, setAll] = useState(false);
  const plan = activePlan(planVersions, localDate());
  const ids = plan.days.flatMap((day) => day.slots.flatMap((slot) => [slot.exerciseId, ...slot.alternatives.map((alt) => alt.exerciseId)]));
  const list = all ? LESSONS : lessonsForPlan(ids);
  const open = LESSONS.find((lesson) => lesson.id === openId) ?? LESSONS.find((lesson) => lesson.exerciseIds.includes(openId ?? ""));

  return (
    <main className="max-w-2xl">
      <h1 className="text-4xl">Learn</h1>
      <p className="mt-2 text-base text-ink-soft">Short notes for this plan. General education stays separate from the PDF and from any clinician note.</p>
      <Button tone="ghost" className="mt-2" onClick={() => setAll((value) => !value)}>
        {all ? "Show plan lessons" : "Browse all"}
      </Button>
      {open ? (
        <article className="mt-5 rounded-2xl border border-line bg-surface px-4 py-4">
          <h2 className="text-3xl">{open.title}</h2>
          <Section label="What moves?" text={open.moves} />
          <Section label="Which muscles participate?" text={open.muscles} />
          <Section label="How do I set up?" text={open.setup} />
          <Section label="What should I pay attention to?" text={open.attention} />
          <Section label="Why does this matter for this movement?" text={open.why} />
          <p className="mt-4 text-base text-ink-soft">
            Source: {open.source} Reviewed {open.reviewed}.
            {open.href ? (
              <>
                {" "}
                <a className="text-forest underline" href={open.href} target="_blank" rel="noreferrer">
                  Open source
                </a>
              </>
            ) : null}
          </p>
          <Button tone="outline" className="mt-3" onClick={() => setOpen(null)}>
            Back to the list
          </Button>
        </article>
      ) : (
        <ul className="mt-4 grid gap-2">
          {list.map((lesson) => (
            <li key={lesson.id}>
              <button type="button" className="min-h-14 w-full rounded-xl border border-line bg-surface px-3 text-left" onClick={() => setOpen(lesson.id)}>
                <span className="block text-xl font-display">{lesson.title}</span>
                <span className="text-ink-soft">{lesson.why.slice(0, 110)}…</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

function Section({ label, text }: { label: string; text: string }) {
  return (
    <section className="mt-4">
      <h3 className="text-xl">{label}</h3>
      <p className="text-base">{text}</p>
    </section>
  );
}
