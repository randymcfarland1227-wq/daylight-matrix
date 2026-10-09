import assert from "node:assert/strict";
import { test } from "node:test";
import { SEED_PREP, SEED_SHOPPING } from "../daylight/food-seed";
import {
  ingredientNeeds,
  kitchenStock,
  readyIngredients,
  shoppingChoice,
  shoppingReview,
  storageArea,
  foodCategory,
  upgradeFoodWorkspace,
} from "../daylight/kitchen";
import type { InventoryItem, PrepTask } from "../daylight/types";
const item = (name: string, status: InventoryItem["status"], quantity = ""): InventoryItem => ({
  id: name,
  name,
  status,
  quantity,
  category: "Pantry",
  storageLocation: "Cabinet",
  cadence: "weekly",
  notes: "",
});
const prep = (title: string, names: string[], selected = true): PrepTask => ({
  id: title,
  title,
  detail: "",
  status: "planned",
  ingredientNames: names,
  selected,
});

test("starter groceries leave the active list without losing bought, edited or personal entries", () => {
  const edited = { ...SEED_SHOPPING[1], quantity: "My amount" };
  const bought = { ...SEED_SHOPPING[2], checked: true };
  const personal = { ...SEED_SHOPPING[0], id: "mine", name: "Coffee" };
  const input = {
    shopping: [SEED_SHOPPING[0], edited, bought, personal],
    shoppingArchive: [],
    observations: [{ text: "Keep me" }],
  };
  const next = upgradeFoodWorkspace(input);
  assert.deepEqual(next.shopping, [edited, bought, personal]);
  assert.deepEqual(next.shoppingArchive, [SEED_SHOPPING[0]]);
  assert.equal(next.observations, input.observations);
  assert.equal(upgradeFoodWorkspace(next), next, "migration does not archive twice");
});
test("selected ingredient batches share a shopping ingredient without pulling in the whole library", () => {
  const needs = ingredientNeeds(
    [
      prep("Cook rice", ["Rice"]),
      prep("Rice base", [" rice "]),
      prep("Unselected", ["Milk"], false),
    ],
    [],
  );
  assert.equal(needs.length, 1);
  assert.deepEqual(needs[0].prepTitles, ["Cook rice", "Rice base"]);
  assert.equal(needs[0].name, "Rice");
  assert.equal(ingredientNeeds([prep("Unknown snack", [])], []).length, 0);
});
test("staples always require a choice, uncertain quantities require a check, and explicit choices win", () => {
  const rows = shoppingReview(
    [prep("Rice", ["Rice", "Olive oil"])],
    [item("Rice", "check_amount")],
  );
  const rice = rows.find((r) => r.name === "Rice")!;
  const oil = rows.find((r) => r.name === "Olive oil")!;
  assert.equal(shoppingChoice(rice), false);
  assert.equal(shoppingChoice(oil), false);
  assert.equal(oil.prepTitles.length, 1);
  assert.equal(shoppingChoice(oil, true), true);
  const missing = ingredientNeeds([prep("Chicken", ["Chicken breast"])], [])[0];
  assert.equal(shoppingChoice(missing), true);
  assert.equal(shoppingChoice(missing, false), false);
});
test("stock considers every lot and never treats a similarly named food as the same ingredient", () => {
  assert.equal(
    kitchenStock("Chicken", [
      item("Chicken breast", "out"),
      item("Chicken breast", "fine", "2 portions"),
    ]),
    "available",
  );
  assert.equal(
    kitchenStock("Chicken breast", [item("Chicken nuggets", "fine", "1 bag")]),
    "missing",
  );
  assert.equal(kitchenStock("Rice", [item("Rice", "fine")]), "uncertain");
});
test("prepared ingredient snapshots survive later prep edits; legacy batches still resolve", () => {
  const source = { ...SEED_PREP[0], ingredientNames: ["Changed later"] };
  const prepared = [
    {
      id: "snapshot",
      name: "Batch",
      detail: "",
      available: true,
      fromPrepId: source.id,
      ingredientNames: ["Chicken breast"],
    },
    { id: "legacy", name: "Legacy", detail: "", available: true, fromPrepId: SEED_PREP[2].id },
    {
      id: "used",
      name: "Used up",
      detail: "",
      available: false,
      fromPrepId: null,
      ingredientNames: ["Rice"],
    },
  ];
  assert.deepEqual(readyIngredients(prepared, [source, SEED_PREP[2]]), [
    "Chicken breast",
    "Yogurt",
  ]);
});
test("legacy cupboard locations and broad categories become usable storage hierarchies", () => {
  assert.equal(storageArea(item("Rice", "out")), "Pantry");
  assert.equal(foodCategory(item("Rice", "out")), "Grains & starches");
  assert.equal(foodCategory({ name: "Chicken nuggets", category: "Frozen" }), "Protein");
  assert.equal(foodCategory({ name: "Milk", category: "My dairy" }), "My dairy");
});
