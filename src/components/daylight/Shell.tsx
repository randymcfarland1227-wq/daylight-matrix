import type { ReactNode } from "react";
import {
  Dumbbell,
  PenLine,
  PersonStanding,
  Settings as Gear,
  SunMedium,
  Utensils,
  StickyNote,
  BookOpen,
} from "lucide-react";
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
/** Brand kit badge: gold plate, forest Big Shoulders 900 caps. `compact` = the DM app-icon form. */
export function Logo({ size = 28, compact }: { size?: number; compact?: boolean }) {
  if (compact) return <span aria-hidden="true" className="inline-grid place-items-center rounded-[6px] bg-gold font-display font-black text-kforest" style={{ height: size, minWidth: size * 1.3, fontSize: size * 0.62, lineHeight: 1, paddingTop: 2 }}>B</span>;
  return (
    <span aria-hidden="true" className="kit-badge" style={{ fontSize: size * 0.72 }}>
      <b>BODY</b>
    </span>
  );
}
export function Shell({ children }: { children: ReactNode }) {
  const s = useDaylight();
  const current = ["history", "goals", "review"].includes(s.view) ? "settings" : s.view;
  const go = (id: AppView) => {
    if (id === "body") s.setBody({ bodyWorkspace: "journal", selectedMuscleId: null });
    s.setView(id);
  };
  const quickNote = () =>
    s.setOverlay(
      s.view === "training"
        ? { type: "note", weekday: s.trainDay, exerciseId: s.openExerciseId ?? undefined }
        : { type: "note" },
    );
  return (
    <div className="app-shell min-h-dvh bg-canvas text-ink">
      <header className="app-header">
        <div className="app-header-inner">
          <button
            type="button"
            onClick={() => go("today")}
            className="app-brand"
            aria-label="Body home"
          >
            <Logo size={30} />
          </button>
          <nav aria-label="Primary" className="desktop-nav">
            {[...ITEMS, { id: "learn" as AppView, label: "Learn", icon: BookOpen }].map((item) => (
              <button
                key={item.id}
                type="button"
                aria-current={current === item.id ? "page" : undefined}
                onClick={() => go(item.id)}
              >
                <item.icon className="size-4" />
                {item.label}
              </button>
            ))}
          </nav>
          <div className="header-tools">
            <button type="button" className="header-note" onClick={quickNote}>
              <PenLine className="size-4" />
              <span>Quick note</span>
            </button>
            <button
              type="button"
              className="mobile-learn icon-button"
              onClick={() => go("learn")}
              aria-label="Learn"
            >
              <BookOpen className="size-5" />
            </button>
            <button
              type="button"
              className="icon-button"
              onClick={() => go("settings")}
              aria-label="Settings and backup"
            >
              <Gear className="size-5" />
            </button>
          </div>
        </div>
      </header>
      <main className="app-main">{children}</main>
      <RestBar />
      <Toast />
      <nav aria-label="Primary" className="safe-bottom mobile-nav">
        {ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => go(item.id)}
            aria-current={current === item.id ? "page" : undefined}
            className={cn("tap", current === item.id ? "text-accent" : "text-ink-soft")}
          >
            <item.icon className="size-[1.3rem]" strokeWidth={current === item.id ? 2.3 : 1.8} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
export function Opening() {
  return (
    <div className="grid min-h-dvh place-items-center bg-canvas text-ink">
      <div className="text-center">
        <div className="sun-bob mx-auto w-fit">
          <Logo size={64} />
        </div>
        <p className="t-display mt-4">Body</p>
        <p className="t-caption mt-2 text-ink-soft">Opening your day.</p>
      </div>
    </div>
  );
}
