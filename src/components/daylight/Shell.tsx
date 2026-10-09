import type { ReactNode } from "react";
import { Dumbbell, PenLine, PersonStanding, Settings as Gear, SunMedium, Utensils, StickyNote, BookOpen } from "lucide-react";
import { cn } from "@/lib/cn";
import type { AppView } from "@/lib/daylight/types";
import { useDaylight } from "@/lib/daylight/store";
import { RestBar } from "./RestBar";
import { Toast } from "./Toast";

const ITEMS: { id: AppView; label: string; icon: typeof SunMedium }[] = [
  { id: "today", label: "Today", icon: SunMedium },
  { id: "training", label: "Train", icon: Dumbbell },
  { id: "body", label: "Body", icon: PersonStanding },
  { id: "food", label: "Food", icon: Utensils },
  { id: "notes", label: "Notes", icon: StickyNote },
];

export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#151d23" />
      <circle cx="16" cy="19" r="7.2" fill="#5fb6cf" />
      <path d="M3 22 Q16 12 29 22 V29 H3Z" fill="#2c4352" />
      <path d="M16 3.5v4M7 7l2.7 2.7M25 7l-2.7 2.7" stroke="#5fb6cf" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const view = useDaylight((s) => s.view);
  const setView = useDaylight((s) => s.setView);
  const setOverlay = useDaylight((s) => s.setOverlay);
  const trainDay = useDaylight((s) => s.trainDay);
  const openExerciseId = useDaylight((s) => s.openExerciseId);
  const quickNote = () => {
    if (view === "training") setOverlay({ type: "note", weekday: trainDay, exerciseId: openExerciseId ?? undefined });
    else setOverlay({ type: "note" });
  };
  const current = view === "history" || view === "goals" || view === "review" ? "settings" : view;
  return (
    <div className="min-h-dvh bg-canvas text-ink md:grid app-shell md:grid-cols-[13rem_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-line app-sidebar px-4 py-8 md:flex">
        <div className="flex items-center gap-2.5 px-2">
          <Logo size={34} />
          <div>
            <p className="t-title leading-none">Daylight</p>
            <p className="t-meta text-ink-soft">Matrix</p>
          </div>
        </div>
        <nav aria-label="Primary" className="mt-8 flex flex-col gap-1">
          {ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setView(item.id)}
              aria-current={current === item.id ? "page" : undefined}
              className={cn(
                "tap flex min-h-12 items-center gap-3 rounded-2xl px-3 text-left text-base font-bold",
                current === item.id ? "bg-accent/10 text-accent" : "text-ink-soft hover:bg-surface-2",
              )}
            >
              <item.icon aria-hidden="true" className="size-5" strokeWidth={2} />
              {item.label}
            </button>
          ))}
        </nav>
        <button type="button" onClick={quickNote} className="tap mt-6 flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-line bg-surface-2 px-3 font-bold text-ink">
          <PenLine className="size-5" /> Quick note
        </button>
        <button type="button" onClick={() => setView("learn")} aria-current={current === "learn" ? "page" : undefined} className="tap mt-4 flex min-h-12 items-center gap-3 rounded-2xl px-3 text-left font-semibold text-ink-soft"><BookOpen className="size-5" /> Learn</button>
        <p className="mt-8 px-3 text-xs leading-relaxed text-ink-faint">Move with purpose.<br />Make eating easier.<br />Learn what works for you.</p>
        <button
          type="button"
          onClick={() => setView("settings")}
          aria-current={current === "settings" ? "page" : undefined}
          className={cn("tap mt-auto flex min-h-12 items-center gap-3 rounded-2xl px-3 text-left font-semibold", current === "settings" ? "bg-surface-2" : "text-ink-soft hover:bg-surface-2")}
        >
          <Gear className="size-5" /> Settings &amp; backup
        </button>
      </aside>

      <div className="min-w-0">
        <div className="sticky top-0 z-20 flex items-center justify-between bg-canvas/90 px-4 py-2.5 backdrop-blur md:hidden" style={{ paddingTop: "max(0.625rem, env(safe-area-inset-top))" }}>
          <button type="button" onClick={() => setView("today")} className="flex items-center gap-2" aria-label="Daylight Matrix home">
            <Logo size={26} />
            <span className="t-title text-[1.125rem]! leading-none">Daylight Matrix</span>
          </button>
          <button type="button" onClick={() => setView("settings")} aria-label="Settings and backup" className="tap grid size-10 place-items-center rounded-full bg-surface-2">
            <Gear className="size-5" />
          </button>
        </div>
        <main className="mx-auto w-full max-w-2xl px-4 pb-28 pt-5 md:max-w-[82rem] md:px-8 md:pb-16 md:pt-10 xl:px-12">{children}</main>
      </div>

      <RestBar />
      <Toast />
      <nav aria-label="Primary" className="safe-bottom fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-line bg-canvas/95 backdrop-blur md:hidden">
        {ITEMS.map((item) => {
          const active = current === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setView(item.id)}
              aria-current={active ? "page" : undefined}
              className={cn("tap relative flex min-h-16 flex-col items-center justify-center gap-0.5 text-xs font-bold", active ? "text-accent" : "text-ink-soft")}
            >
              <span className={cn("grid h-8 w-14 place-items-center rounded-full transition-colors", active && "bg-accent/15")}>
                <item.icon aria-hidden="true" className="size-[1.35rem]" strokeWidth={active ? 2.4 : 1.9} />
              </span>
              {item.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export function Opening() {
  return (
    <div className="grid min-h-dvh place-items-center bg-canvas px-6 text-ink">
      <div className="text-center">
        <div className="sun-bob mx-auto w-fit">
          <Logo size={64} />
        </div>
        <p className="t-display mt-4">Daylight Matrix</p>
        <p className="t-caption mt-1 text-ink-soft">Opening your day.</p>
      </div>
    </div>
  );
}
