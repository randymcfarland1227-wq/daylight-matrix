import { MAPPINGS, regionById } from "./body";
import { shiftDate } from "./dates";
import { exerciseById } from "./plan";
import type {
  FoodLog,
  InventoryItem,
  PreparedPortion,
  Prescription,
  SavedMeal,
  SetLog,
  Side,
  WorkoutSession,
} from "./types";

export function newId(): string {
  return crypto.randomUUID();
}

export type ProteinEstimate = { total: number; items: { label: string; grams: number }[] };

/** Same rough matcher the existing Daylight Matrix used. Results are estimates. */
export function estimateProtein(text: string): ProteinEstimate {
  let remaining = text.toLowerCase();
  const items: { label: string; grams: number }[] = [];
  const take = (pattern: RegExp, label: string, grams: number) => {
    if (pattern.test(remaining)) {
      items.push({ label, grams });
      remaining = remaining.replace(pattern, " ");
    }
  };
  const egg = remaining.match(/\b(\d+)?\s*(?:large\s*)?eggs?\b/);
  if (egg) {
    const n = Number(egg[1] || 1);
    items.push({ label: `${n} ${n === 1 ? "egg" : "eggs"}`, grams: n * 6 });
    remaining = remaining.replace(egg[0], " ");
  }
  const weighed: { pattern: RegExp; label: string; per: number }[] = [
    { pattern: /(\d+(?:\.\d+)?)\s*(?:oz|ounces?)\s+(?:of\s+)?(?:grilled\s+)?chicken\b/, label: "Chicken", per: 8.8 },
    { pattern: /(\d+(?:\.\d+)?)\s*(?:oz|ounces?)\s+(?:of\s+)?salmon\b/, label: "Salmon", per: 6.5 },
    { pattern: /(\d+(?:\.\d+)?)\s*(?:oz|ounces?)\s+(?:of\s+)?(?:lean\s+)?(?:beef|steak)\b/, label: "Beef", per: 7 },
  ];
  for (const rule of weighed) {
    const match = remaining.match(rule.pattern);
    if (match?.[1]) {
      items.push({ label: `${match[1]} oz ${rule.label}`, grams: Math.round(Number(match[1]) * rule.per) });
      remaining = remaining.replace(match[0], " ");
    }
  }
  take(/\b(?:plain\s+)?bagels?\b/, "Bagel", 10);
  take(/\b(?:cream|creme)\s*cheese\b/, "Cream cheese", 2);
  take(/\bgreek\s+yogurt(?:\s+cup)?\b/, "Greek yogurt", 15);
  take(/\byogurt(?:\s+cup)?\b/, "Yogurt", 12);
  take(/\bprotein\s+(?:powder|shake)\b/, "Protein powder", 20);
  take(/\bcottage\s+cheese\b/, "Cottage cheese", 14);
  take(/\bchicken\b/, "Chicken", 26);
  take(/\bsalmon\b/, "Salmon", 23);
  take(/\b(?:tuna|turkey)\b/, "Tuna or turkey", 25);
  take(/\b(?:beef|steak)\b/, "Beef", 25);
  take(/\btofu\b/, "Tofu", 10);
  take(/\b(?:beans|lentils)\b/, "Beans or lentils", 14);
  take(/\bchickpeas?\b/, "Chickpeas", 7);
  take(/\bmilk\b/, "Milk", 8);
  take(/\bkefir\b/, "Kefir", 9);
  take(/\bcheddar\b/, "Cheddar", 7);
  take(/\bpeanut\s+butter\b/, "Peanut butter", 7);
  take(/\b(?:almonds|walnuts|mixed\s+nuts)\b/, "Nuts", 6);
  take(/\boats?\b/, "Oats", 5);
  take(/\bhummus\b/, "Hummus", 2);
  take(/\bspinach\b/, "Spinach", 1);
  take(/\bcucumbers?\b/, "Cucumber", 1);
  take(/\bban+anas?\b|\bbann?anas?\b/, "Banana", 1);
  take(/\bstrawberries\b/, "Strawberries", 1);
  return { total: Math.round(items.reduce((sum, item) => sum + item.grams, 0)), items };
}

export type Stock = "available" | "uncertain" | "missing";

export function stockFor(name: string, inventory: InventoryItem[]): Stock {
  const key = name.toLowerCase();
  const item = inventory.find((row) => row.name.toLowerCase() === key || key.includes(row.name.toLowerCase()) || row.name.toLowerCase().includes(key));
  if (!item || item.status === "out") return "missing";
  if (item.status === "check_amount" || item.status === "low" || !item.quantity.trim()) return "uncertain";
  return "available";
}

export function mealReady(meal: SavedMeal, inventory: InventoryItem[]): boolean {
  if (!meal.ingredientNames.length) return false;
  return meal.ingredientNames.every((name) => stockFor(name, inventory) === "available");
}

export type FoodOption = {
  id: string;
  name: string;
  minutes: number | null;
  reason: "You pinned this" | "Prepared portion available" | "Uses ingredients you marked use soon";
  kind: "meal" | "prepared";
};

export function foodOptions(input: {
  meals: SavedMeal[];
  inventory: InventoryItem[];
  prepared: PreparedPortion[];
  logs: FoodLog[];
}): FoodOption[] {
  const options: FoodOption[] = [];
  const pinned = input.meals.filter((meal) => meal.pinned).slice(0, 3);
  for (const meal of pinned) {
    if (options.length >= 3) break;
    options.push({
      id: meal.id,
      name: meal.name,
      minutes: meal.minutes,
      reason: "You pinned this",
      kind: "meal",
    });
  }
  for (const portion of input.prepared.filter((row) => row.available)) {
    if (options.length >= 3) break;
    options.push({
      id: portion.id,
      name: portion.name,
      minutes: 0,
      reason: "Prepared portion available",
      kind: "prepared",
    });
  }
  const recentIds = input.logs
    .filter((log) => log.mealId)
    .slice()
    .reverse()
    .map((log) => log.mealId as string);
  const seen = new Set<string>();
  for (const id of recentIds) {
    if (options.length >= 3) break;
    if (seen.has(id)) continue;
    seen.add(id);
    const meal = input.meals.find((row) => row.id === id);
    if (!meal || options.some((option) => option.id === meal.id)) continue;
    if (!mealReady(meal, input.inventory)) continue;
    const useSoon = meal.ingredientNames.some((name) => {
      const item = input.inventory.find((row) => row.name.toLowerCase() === name.toLowerCase());
      return item?.status === "use_soon" || item?.status === "use_first";
    });
    if (!useSoon) continue;
    options.push({
      id: meal.id,
      name: meal.name,
      minutes: meal.minutes,
      reason: "Uses ingredients you marked use soon",
      kind: "meal",
    });
  }
  return options.slice(0, 3);
}

export function chosenExerciseId(slot: Prescription, chosen: Record<string, string>): string {
  return chosen[slot.id] ?? slot.exerciseId;
}

export function targetLine(slot: Prescription): string {
  if (slot.durationLabel && slot.sets) {
    return `${slot.sets} × ${slot.repLabel}${slot.perSide ? " / side" : ""}`;
  }
  if (slot.durationLabel && !slot.sets) return slot.durationLabel;
  if (slot.sets && slot.repLabel) {
    return `${slot.sets} × ${slot.repLabel}${slot.perSide ? " / side" : ""}`;
  }
  if (slot.openNote) return "Open slot";
  return "No dose imported";
}

export function slotLogs(session: WorkoutSession, prescriptionId: string): SetLog[] {
  return session.logs.filter((log) => log.prescriptionId === prescriptionId);
}

export function doneSetCount(session: WorkoutSession, slot: Prescription): number {
  const logs = slotLogs(session, slot.id).filter((log) => log.status === "done");
  const indexes = new Set(logs.map((log) => log.setIndex));
  return indexes.size;
}

export function slotFinished(session: WorkoutSession, slot: Prescription): boolean {
  const logs = slotLogs(session, slot.id);
  if (logs.some((log) => log.status === "skipped" && log.setIndex === -1)) return true;
  const planned = slot.sets ?? 1;
  return doneSetCount(session, slot) >= planned;
}

export function currentSetNumber(session: WorkoutSession, slot: Prescription): number {
  const planned = slot.sets ?? 1;
  const done = doneSetCount(session, slot);
  return Math.min(done + 1, planned);
}

export function progressLabel(session: WorkoutSession): string {
  const slot = session.snapshot[session.focusSlot];
  if (!slot) return "No exercises in this session";
  const exercise = exerciseById(chosenExerciseId(slot, session.chosenExercise));
  const name = exercise?.name ?? "Exercise";
  if (!slot.sets) return name;
  if (slotFinished(session, slot)) return `${name}, finished`;
  return `${name}, set ${currentSetNumber(session, slot)} of ${slot.sets}`;
}

export type CoverageCell = {
  primary: number;
  secondary: number;
  exercises: string[];
};

export function coverageWindow(window: "today" | "7" | "30", today: string): { from: string; to: string } {
  if (window === "today") return { from: today, to: today };
  if (window === "30") return { from: shiftDate(today, -29), to: today };
  return { from: shiftDate(today, -6), to: today };
}

function regionTargets(regionId: string, lateral: boolean, side: Side): string[] {
  const region = regionById(regionId);
  if (!region) return [];
  if (!lateral || region.side === "center") return [regionId];
  if (side === "left") return region.side === "left" ? [regionId] : [];
  if (side === "right") return region.side === "right" ? [regionId] : [];
  if (side === "both") return [regionId];
  return [regionId];
}

export function strengthCoverage(
  sessions: WorkoutSession[],
  from: string,
  to: string,
): Record<string, CoverageCell> {
  const cells: Record<string, CoverageCell> = {};
  const ensure = (id: string) => {
    cells[id] ??= { primary: 0, secondary: 0, exercises: [] };
    return cells[id];
  };
  for (const session of sessions) {
    if (session.localDate < from || session.localDate > to) continue;
    for (const log of session.logs) {
      if (log.status !== "done") continue;
      const slot = session.snapshot.find((item) => item.id === log.prescriptionId);
      if (!slot) continue;
      const exerciseId = chosenExerciseId(slot, session.chosenExercise);
      const exercise = exerciseById(exerciseId);
      if (!exercise || exercise.kind !== "strength") continue;
      const name = exercise.name;
      for (const mapping of MAPPINGS.filter((item) => item.exerciseId === exerciseId && item.status === "reviewed")) {
        for (const regionId of regionTargets(mapping.regionId, mapping.lateral, log.side)) {
          const cell = ensure(regionId);
          if (mapping.role === "primary") cell.primary += 1;
          else cell.secondary += 1;
          if (!cell.exercises.includes(name)) cell.exercises.push(name);
        }
      }
    }
  }
  return cells;
}

export function otherActivitySummary(sessions: WorkoutSession[], from: string, to: string) {
  const buckets: Record<"activation" | "timed" | "cardio" | "mobility" | "distance", string[]> = {
    activation: [],
    timed: [],
    cardio: [],
    mobility: [],
    distance: [],
  };
  for (const session of sessions) {
    if (session.localDate < from || session.localDate > to) continue;
    for (const slot of session.snapshot) {
      const exerciseId = chosenExerciseId(slot, session.chosenExercise);
      const exercise = exerciseById(exerciseId);
      if (!exercise || exercise.kind === "strength") continue;
      const done = slotLogs(session, slot.id).some((log) => log.status === "done");
      if (!done) continue;
      const line = `${exercise.name} · ${session.localDate}`;
      if (!buckets[exercise.kind].includes(line)) buckets[exercise.kind].push(line);
    }
  }
  return buckets;
}

export function lastPerformance(
  sessions: WorkoutSession[],
  exerciseId: string,
  beforeSessionId: string,
): string | null {
  const previous = sessions
    .filter((session) => session.id !== beforeSessionId)
    .slice()
    .reverse();
  for (const session of previous) {
    for (const slot of session.snapshot) {
      if (chosenExerciseId(slot, session.chosenExercise) !== exerciseId) continue;
      const done = slotLogs(session, slot.id).filter((log) => log.status === "done");
      const last = done[done.length - 1];
      if (!last) continue;
      const bits = [`${session.localDate}`];
      if (last.reps != null) bits.push(`${last.reps} reps`);
      if (last.load != null) bits.push(`${last.load} ${last.loadUnit}`);
      if (last.assistance != null) bits.push(`assist ${last.assistance} ${last.assistanceUnit}`);
      if (last.seconds != null) bits.push(`${last.seconds}s`);
      if (last.distance) bits.push(last.distance);
      if (last.side === "left" || last.side === "right" || last.side === "both") bits.push(last.side);
      if (bits.length === 1) bits.push("completed, no numbers entered");
      return bits.join(" · ");
    }
  }
  return null;
}

export function formatSeconds(total: number): string {
  const safe = Math.max(0, Math.floor(total));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
