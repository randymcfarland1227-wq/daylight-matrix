import { SEED_PREP, SEED_SHOPPING } from "./food-seed";
import type { InventoryItem, PrepTask, PreparedPortion, ShoppingItem } from "./types";

export const STORAGE_AREAS = ["Fridge", "Freezer", "Pantry"] as const;
export const FOOD_CATEGORIES = [
  "Protein",
  "Dairy",
  "Produce",
  "Grains & starches",
  "Sauces & condiments",
  "Seasonings",
  "Baking & breakfast",
  "Snacks & other",
];
const ALIASES: Record<string, string> = {
  chicken: "chicken breast",
  "breaded chicken": "chicken nuggets",
  pepper: "black pepper",
};
export const ingredientKey = (name: string) =>
  ALIASES[name.trim().toLowerCase().replace(/\s+/g, " ")] ??
  name.trim().toLowerCase().replace(/\s+/g, " ");
export function storageArea(item: Pick<InventoryItem, "storageLocation">): string {
  const raw = item.storageLocation.trim();
  if (!raw || /cabinet|cupboard|counter|pantry/i.test(raw)) return "Pantry";
  return STORAGE_AREAS.find((x) => x.toLowerCase() === raw.toLowerCase()) ?? raw;
}
export function foodCategory(item: Pick<InventoryItem, "name" | "category">): string {
  if (item.category && !["Frozen", "Pantry", "Other"].includes(item.category)) return item.category;
  const name = ingredientKey(item.name);
  if (/chicken|tuna|eggs|protein powder/.test(name)) return "Protein";
  if (/milk|yogurt|cheese/.test(name)) return "Dairy";
  if (/corn|beans|potato|cucumber|strawberr|banana/.test(name)) return "Produce";
  if (/rice|dough|tortilla|pierogi|ravioli/.test(name)) return "Grains & starches";
  if (/salt|pepper|curry|garlic powder/.test(name)) return "Seasonings";
  if (/oil|sauce|syrup|marinara|jarred garlic/.test(name)) return "Sauces & condiments";
  if (/pancake|oats|vanilla|pudding/.test(name)) return "Baking & breakfast";
  return "Snacks & other";
}
export function kitchenStock(
  name: string,
  inventory: InventoryItem[],
): "available" | "uncertain" | "missing" {
  const rows = inventory.filter((i) => ingredientKey(i.name) === ingredientKey(name));
  if (rows.some((i) => !["out", "low", "check_amount"].includes(i.status) && i.quantity.trim()))
    return "available";
  return !rows.length || rows.every((i) => i.status === "out") ? "missing" : "uncertain";
}
export function prepIngredients(task: PrepTask): string[] {
  return task.ingredientNames ?? SEED_PREP.find((x) => x.id === task.id)?.ingredientNames ?? [];
}
export function readyIngredients(prepared: PreparedPortion[], prep: PrepTask[]): string[] {
  return [
    ...new Map(
      prepared
        .filter((p) => p.available)
        .flatMap(
          (p) =>
            p.ingredientNames ??
            prepIngredients(
              prep.find((t) => t.id === p.fromPrepId) ?? {
                id: "",
                title: "",
                detail: "",
                status: "planned",
              },
            ),
        )
        .map((name) => [ingredientKey(name), name]),
    ).values(),
  ];
}
export type KitchenNeed = {
  name: string;
  key: string;
  prepTitles: string[];
  stock: ReturnType<typeof kitchenStock>;
  staple: boolean;
};
export function shoppingChoice(need: KitchenNeed, explicit?: boolean): boolean {
  return explicit ?? (!need.staple && need.stock === "missing");
}

export function ingredientNeeds(prep: PrepTask[], inventory: InventoryItem[]): KitchenNeed[] {
  const needs = new Map<string, KitchenNeed>();
  for (const task of prep.filter((x) => x.selected))
    for (const name of prepIngredients(task)) {
      const key = ingredientKey(name);
      const row = needs.get(key) ?? {
        key,
        name,
        prepTitles: [],
        stock: kitchenStock(name, inventory),
        staple: inventory.some((i) => ingredientKey(i.name) === key && i.cadence === "staple"),
      };
      if (!row.prepTitles.includes(task.title)) row.prepTitles.push(task.title);
      needs.set(key, row);
    }
  return [...needs.values()];
}
export const STAPLE_NAMES = [
  "Olive oil",
  "Salt",
  "Black pepper",
  "Garlic powder",
  "Marinara",
  "Jarred garlic",
  "Teriyaki sauce",
  "Vanilla extract",
];
export function shoppingReview(prep: PrepTask[], inventory: InventoryItem[]): KitchenNeed[] {
  const rows = ingredientNeeds(prep, inventory);
  const staples = [
    ...STAPLE_NAMES,
    ...inventory.filter((i) => i.cadence === "staple").map((i) => i.name),
  ];
  for (const name of staples) {
    const key = ingredientKey(name);
    const found = rows.find((r) => r.key === key);
    if (found) found.staple = true;
    else if (!rows.some((r) => r.key === key))
      rows.push({ name, key, prepTitles: [], stock: kitchenStock(name, inventory), staple: true });
  }
  return rows;
}

/** Archive only untouched generated starter groceries. Personal edits and bought rows stay active. */
export function upgradeFoodWorkspace(input: Record<string, unknown>): Record<string, unknown> {
  if (input.foodWorkspaceVersion === 1) return input;
  const rows = Array.isArray(input.shopping) ? (input.shopping as ShoppingItem[]) : [];
  const isStarter = (row: ShoppingItem) =>
    SEED_SHOPPING.some(
      (seed) =>
        seed.id === row.id &&
        seed.name === row.name &&
        seed.quantity === row.quantity &&
        seed.source === row.source &&
        row.checked === false,
    );
  return {
    ...input,
    foodWorkspaceVersion: 1,
    shopping: rows.filter((r) => !isStarter(r)),
    shoppingArchive: [
      ...(Array.isArray(input.shoppingArchive) ? input.shoppingArchive : []),
      ...rows.filter(isStarter),
    ],
  };
}
