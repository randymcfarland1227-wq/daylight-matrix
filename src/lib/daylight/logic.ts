import { exerciseById } from "./exercises";
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
  if (!slot.perSide) return indexes.size;
  return [...indexes].filter((index) => {
    const sides = logs.filter((log) => log.setIndex === index).map((log) => log.side);
    return sides.includes("both") || sides.includes("na") || (sides.includes("left") && sides.includes("right"));
  }).length;
}

export function slotFinished(session: WorkoutSession, slot: Prescription): boolean {
  const logs = slotLogs(session, slot.id);
  if (logs.some((log) => log.status === "skipped" && log.setIndex === -1)) return true;
  if ((session.extras ?? []).some((e) => e.slotId === slot.id)) return true;
  const planned = slot.sets ?? 1;
  return doneSetCount(session, slot) >= planned;
}

/** Session progress is based on real prescriptions, never midpoint or weighted muscle volume. */
export function sessionProgress(slots: Prescription[], session: WorkoutSession | null) {
  const required = slots.filter((slot) => !slot.optional);
  let completed = 0;
  let skipped = 0;
  let changed = 0;
  let done = 0;
  let target = 0;
  for (const slot of required) {
    const minimum = slot.sets ?? 1;
    target += minimum;
    if (!session) continue;
    const logs = slotLogs(session, slot.id);
    const count = Math.min(minimum, doneSetCount(session, slot));
    done += count;
    if (count >= minimum) completed += 1;
    else if (logs.some((log) => log.status === "skipped" && log.setIndex === -1)) skipped += 1;
    else if ((session.extras ?? []).some((extra) => extra.slotId === slot.id)) changed += 1;
  }
  return { completed, skipped, changed, total: required.length, done, target, percent: target ? done / target : 0 };
}

export function currentSetNumber(session: WorkoutSession, slot: Prescription): number {
  const planned = slot.sets ?? 1;
  const done = doneSetCount(session, slot);
  return Math.min(done + 1, planned);
}

export function progressLabel(session: WorkoutSession): string {
  const slot = session.snapshot.find((item) => !item.optional && !slotFinished(session, item));
  if (!slot) return "No remaining prescribed exercises";
  const exercise = exerciseById(chosenExerciseId(slot, session.chosenExercise));
  const name = exercise?.name ?? "Exercise";
  if (!slot.sets) return name;
  if (slotFinished(session, slot)) return `${name}, finished`;
  return `${name}, set ${currentSetNumber(session, slot)} of ${slot.sets}`;
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

/** Most recent done set for an exercise outside the given session. */
export function lastSet(sessions: WorkoutSession[], exerciseId: string, excludeSessionId: string): { set: SetLog; date: string } | null {
  for (const session of sessions.slice().reverse()) {
    if (session.id === excludeSessionId) continue;
    for (const slot of session.snapshot) {
      if (chosenExerciseId(slot, session.chosenExercise) !== exerciseId) continue;
      const done = slotLogs(session, slot.id).filter((log) => log.status === "done");
      const last = done[done.length - 1];
      if (last) return { set: last, date: session.localDate };
    }
  }
  return null;
}

export function setSummary(log: SetLog): string {
  const bits: string[] = [];
  if (log.reps != null) bits.push(`${log.reps}`);
  if (log.load != null) bits.push(`${bits.length ? "× " : ""}${log.load} ${log.loadUnit}`);
  if (log.assistance != null) bits.push(`assist ${log.assistance}`);
  if (log.seconds != null) bits.push(log.seconds >= 120 ? `${Math.round(log.seconds / 60)} min` : `${log.seconds}s`);
  if (log.distance) bits.push(log.distance);
  if (log.side === "left") bits.push("L");
  if (log.side === "right") bits.push("R");
  return bits.join(" · ") || "done";
}

/** What "done as prescribed" logs for a slot: first number of the rep range, hold seconds, minutes or distance label. */
export function prescribedDefaults(slot: Prescription, kind: string): { reps: number | null; seconds: number | null; distance: string | null } {
  const label = `${slot.durationLabel ?? ""} ${slot.repLabel}`.toLowerCase();
  const first = (s: string) => {
    const m = s.match(/\d+(?:\.\d+)?/);
    return m ? parseFloat(m[0]) : null;
  };
  if (kind === "strength" || kind === "activation") return { reps: first(slot.repLabel), seconds: null, distance: null };
  if (kind === "timed") {
    const n = first(slot.durationLabel ?? slot.repLabel);
    return { reps: null, seconds: n != null ? Math.round(n) : null, distance: null };
  }
  if (kind === "mobility" || kind === "cardio") {
    const n = first(label);
    return { reps: null, seconds: n != null ? Math.round(n * 60) : null, distance: null };
  }
  if (kind === "distance") return { reps: null, seconds: null, distance: slot.durationLabel ?? slot.repLabel ?? null };
  return { reps: first(slot.repLabel), seconds: null, distance: null };
}
