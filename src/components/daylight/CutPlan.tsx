import { useState } from "react";
import { CalendarCheck, Info } from "lucide-react";
import { CHECK_INS, CUT_GOAL, CUT_TARGETS, EXAMPLE_DAYS, FOOD_RULES } from "@/lib/daylight/cut-plan";
import { Badge, Eyebrow, Segmented } from "./ui";

const MACROS = [
  { key: "kcal", label: "Calories", unit: "kcal", tone: "var(--color-gold, #e0b04a)" },
  { key: "protein", label: "Protein", unit: "g", tone: "var(--color-teal, #2f9e8f)" },
  { key: "carbs", label: "Carbs", unit: "g", tone: "var(--color-copper, #c8743a)" },
  { key: "fat", label: "Fat", unit: "g", tone: "var(--color-forest, #3f7a4a)" },
] as const;

const SLOT_TONE: Record<string, "sun" | "teal" | "copper" | "forest" | "plain"> = {
  Breakfast: "sun",
  Lunch: "teal",
  Snack: "forest",
  Dinner: "copper",
  Treat: "plain",
};

export function CutPlan() {
  const [day, setDay] = useState(EXAMPLE_DAYS[0]!.id);
  const ex = EXAMPLE_DAYS.find((d) => d.id === day) ?? EXAMPLE_DAYS[0]!;
  return (
    <div className="space-y-5" data-testid="cut-plan">
      <section className="kitchen-panel">
        <Eyebrow>Daily targets · cut</Eyebrow>
        <p className="mt-1 text-sm text-ink-soft">{CUT_GOAL}</p>
        <div className="cut-macros mt-4">
          {MACROS.map((m) => (
            <div key={m.key} className="cut-macro" style={{ ["--tone" as string]: m.tone }}>
              <span className="text-xs text-ink-soft">{m.label}</span>
              <span className="t-title tabular-nums">
                {CUT_TARGETS[m.key].toLocaleString()}
                <small className="ml-1 text-xs font-normal text-ink-soft">{m.unit}</small>
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="kitchen-panel">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Eyebrow>Example days</Eyebrow>
            <h2 className="mt-1">How 2,450 kcal could look</h2>
          </div>
          <Segmented<string>
            label="Example day"
            value={day}
            onChange={setDay}
            options={EXAMPLE_DAYS.map((d) => ({ id: d.id, label: `${d.label} · ${d.vibe}` }))}
          />
        </div>
        <div className="kit-note mt-4" role="note">
          <Info className="size-4 shrink-0 mt-0.5" />
          <p className="text-sm">
            <b>These are examples, not a fixed menu.</b> Each one shows a single way to hit the targets. Swap meals, mix days, or eat
            something else entirely, as long as the day lands near {CUT_TARGETS.kcal.toLocaleString()} kcal and {CUT_TARGETS.protein} g protein.
          </p>
        </div>
        <ol className="cut-meals mt-4">
          {ex.meals.map((m) => (
            <li key={m.slot + m.name} className="cut-meal">
              <Badge tone={SLOT_TONE[m.slot]}>{m.slot}</Badge>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold">{m.name}</h3>
                <p className="text-xs text-ink-soft">{m.detail}</p>
              </div>
              <span className="tabular-nums text-sm font-semibold">{m.protein} g P</span>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-xs text-ink-soft tabular-nums">
          {ex.label} total ≈ {ex.totals.kcal.toLocaleString()} kcal · P {ex.totals.protein} · C {ex.totals.carbs} · F {ex.totals.fat}
        </p>
      </section>

      <div className="cut-two">
        <section className="kitchen-panel">
          <Eyebrow>Food rules</Eyebrow>
          <ul className="mt-3 space-y-2 text-sm">
            {FOOD_RULES.map((r) => (
              <li key={r}>• {r}</li>
            ))}
          </ul>
        </section>
        <section className="kitchen-panel">
          <Eyebrow>Check-ins (TickTick habits)</Eyebrow>
          <ul className="mt-3 space-y-2 text-sm">
            {CHECK_INS.map((c) => (
              <li key={c.what} className="flex items-start gap-2">
                <CalendarCheck className="size-4 shrink-0 mt-0.5" />
                <span className="min-w-0 flex-1">{c.what}</span>
                <span className="text-xs text-ink-soft whitespace-nowrap">{c.when}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
