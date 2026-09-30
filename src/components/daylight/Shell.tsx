import type { ReactNode } from "react";
import { BookOpen, Dumbbell, PersonStanding, SunMedium, Utensils } from "lucide-react";
import { cn } from "@/lib/cn";
import type { AppView } from "@/lib/daylight/types";
import { useDaylight } from "@/lib/daylight/store";

const ITEMS: { id: AppView; label: string; icon: typeof SunMedium }[] = [
  { id: "today", label: "Today", icon: SunMedium },
  { id: "training", label: "Training", icon: Dumbbell },
  { id: "food", label: "Food", icon: Utensils },
  { id: "body", label: "Body", icon: PersonStanding },
  { id: "learn", label: "Learn", icon: BookOpen },
];

export function Shell({ children }: { children: ReactNode }) {
  const view = useDaylight((state) => state.view);
  const setView = useDaylight((state) => state.setView);
  return (
    <div className="min-h-dvh bg-canvas text-ink md:grid md:grid-cols-[13.5rem_minmax(0,1fr)]">
      <aside className="hidden border-r border-line md:flex md:flex-col md:px-4 md:py-6">
        <p className="px-2 font-display text-2xl leading-none">Daylight</p>
        <p className="px-2 pb-6 text-base text-ink-soft">Matrix</p>
        <nav aria-label="Primary" className="flex flex-col gap-1">
          {ITEMS.map((item) => (
            <NavButton key={item.id} item={item} active={view === item.id} onClick={() => setView(item.id)} />
          ))}
        </nav>
      </aside>
      <div className="mx-auto w-full max-w-3xl px-4 py-5 pb-28 md:max-w-5xl md:px-8 md:py-8 md:pb-10">{children}</div>
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-line bg-canvas md:hidden"
      >
        {ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={cn(
              "flex min-h-16 flex-col items-center justify-center gap-0.5 text-base",
              view === item.id ? "text-forest" : "text-ink-soft",
            )}
            aria-current={view === item.id ? "page" : undefined}
            onClick={() => setView(item.id)}
          >
            <item.icon aria-hidden="true" className="size-5" strokeWidth={1.75} />
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

function NavButton({
  item,
  active,
  onClick,
}: {
  item: (typeof ITEMS)[number];
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex min-h-11 items-center gap-2 rounded-xl px-2 text-left text-base",
        active ? "bg-forest text-canvas" : "text-ink hover:bg-surface",
      )}
    >
      <item.icon aria-hidden="true" className="size-5" strokeWidth={1.75} />
      {item.label}
    </button>
  );
}

export function Opening() {
  return (
    <main className="grid min-h-dvh place-items-center bg-canvas px-6 text-ink">
      <div>
        <p className="font-display text-4xl">Daylight Matrix</p>
        <p className="mt-2 text-base text-ink-soft">Opening your day.</p>
      </div>
    </main>
  );
}
