import { shiftDate } from "./dates";
import { stockFor } from "./logic";
import type { FoodLog, FluidLog, InventoryItem, SavedMeal } from "./types";

type Fluid = Pick<FluidLog, "localDate" | "amountOz" | "beverage">;

export type DayKind = "heavy" | "train" | "recovery" | "open";

/** Training-day type from the PDF schedule: Tue/Fri lower days, Thu active recovery, Sun open. */
export function dayKind(weekday: number): DayKind {
  if (weekday === 2 || weekday === 5) return "heavy";
  if (weekday === 4) return "recovery";
  if (weekday === 0) return "open";
  return "train";
}

export const DAY_KIND_LABEL: Record<DayKind, string> = {
  heavy: "Big lower-body day",
  train: "Training day",
  recovery: "Recovery day",
  open: "Open day",
};

/** General, non-clinical prompts. No numbers beyond the ones Randy sets himself. */
export function fuelingNote(kind: DayKind, restGoalSet: boolean): { title: string; lines: string[] } {
  switch (kind) {
    case "heavy":
      return {
        title: "Fuel the big lifts",
        lines: [
          "Something with carbs and protein you like before you train, and a real meal afterwards.",
          "Lower-body days are the longest sessions. Have water and a snack in your bag.",
        ],
      };
    case "train":
      return {
        title: "Training day",
        lines: ["Aim for a protein-forward meal after the session.", "Prep ahead so the post-workout meal is zero-decision."],
      };
    case "recovery":
      return {
        title: "Recovery day",
        lines: [
          restGoalSet ? "Using your recovery-day protein number." : "Keep protein steady — the day is for recovering. You can set a separate recovery-day number in Settings.",
          "Good day to prep food for Friday and the weekend.",
        ],
      };
    default:
      return { title: "Open day", lines: ["Prep day: restock, cook the base proteins, portion for Monday."] };
  }
}

export function sumProtein(logs: FoodLog[], date: string) {
  const day = logs.filter((l) => l.localDate === date);
  const known = day.filter((l) => l.proteinGrams != null);
  return { total: known.reduce((s, l) => s + (l.proteinGrams ?? 0), 0), counted: known.length, unknown: day.length - known.length, meals: day.length };
}

export function waterToday(fluid: Fluid[], date: string): number {
  return fluid.filter((f) => f.localDate === date).reduce((s, f) => s + f.amountOz, 0);
}

export function weekDates(today: string): string[] {
  return Array.from({ length: 7 }, (_, i) => shiftDate(today, -6 + i));
}

export type PrepNeed = { name: string; for: string[]; status: "available" | "uncertain" | "missing" };

/** Ingredients required by the meals planned across the week, with stock status. */
export function prepNeeds(mealPlan: Record<string, string[]>, meals: SavedMeal[], inventory: InventoryItem[], dayNames: string[]): PrepNeed[] {
  const map = new Map<string, PrepNeed>();
  for (const [dayKey, ids] of Object.entries(mealPlan)) {
    for (const id of ids) {
      const meal = meals.find((m) => m.id === id);
      if (!meal) continue;
      for (const name of meal.ingredientNames) {
        const key = name.toLowerCase();
        const cur = map.get(key) ?? { name, for: [], status: stockFor(name, inventory) };
        const label = `${dayNames[Number(dayKey)]?.slice(0, 3)}: ${meal.name}`;
        if (!cur.for.includes(label)) cur.for.push(label);
        map.set(key, cur);
      }
    }
  }
  return [...map.values()].sort((a, b) => rank(a.status) - rank(b.status) || a.name.localeCompare(b.name));
}
const rank = (s: PrepNeed["status"]) => (s === "missing" ? 0 : s === "uncertain" ? 1 : 2);

export function plannedProtein(mealPlan: Record<string, string[]>, meals: SavedMeal[], weekday: number): { grams: number; unknown: number } {
  let grams = 0;
  let unknown = 0;
  for (const id of mealPlan[String(weekday)] ?? []) {
    const m = meals.find((x) => x.id === id);
    if (!m) continue;
    if (m.proteinGrams != null) grams += m.proteinGrams;
    else unknown += 1;
  }
  return { grams, unknown };
}

export function isUseSoon(item: InventoryItem, today: string): boolean {
  if (item.status === "use_soon" || item.status === "use_first") return true;
  if (item.useBy && item.useBy <= shiftDate(today, 3)) return true;
  return false;
}

export function mealsUsing(item: InventoryItem, meals: SavedMeal[]): SavedMeal[] {
  const key = item.name.toLowerCase();
  return meals.filter((m) => m.ingredientNames.some((n) => n.toLowerCase().includes(key) || key.includes(n.toLowerCase())));
}

/** Suggest a meal for each empty day, favouring meals that use use-soon items and those with a protein number. */
export function suggestWeek(meals: SavedMeal[], inventory: InventoryItem[], current: Record<string, string[]>, today: string): Record<string, string[]> {
  const soon = inventory.filter((i) => isUseSoon(i, today));
  const score = (m: SavedMeal) =>
    soon.filter((i) => mealsUsing(i, [m]).length).length * 3 + (m.proteinGrams != null ? 2 : 0) + (m.pinned ? 2 : 0) + (m.ingredientNames.every((n) => stockFor(n, inventory) !== "missing") ? 2 : 0);
  const sorted = meals.slice().sort((a, b) => score(b) - score(a));
  const out: Record<string, string[]> = { ...current };
  let cursor = 0;
  for (let d = 0; d < 7; d += 1) {
    const key = String(d);
    if ((out[key] ?? []).length >= 2 || sorted.length === 0) continue;
    const have = new Set(out[key] ?? []);
    const picks: string[] = [...(out[key] ?? [])];
    let guard = 0;
    while (picks.length < 2 && guard < sorted.length + 2) {
      const m = sorted[cursor % sorted.length]!;
      cursor += 1;
      guard += 1;
      if (!have.has(m.id)) {
        picks.push(m.id);
        have.add(m.id);
      }
    }
    out[key] = picks;
  }
  return out;
}
