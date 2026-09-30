import { useState, type ReactNode } from "react";
import { GROCERY_SHEET } from "@/lib/daylight/food-seed";
import { foodOptions, mealReady, stockFor } from "@/lib/daylight/logic";
import { statusLabel, useDaylight } from "@/lib/daylight/store";
import type { InventoryStatus } from "@/lib/daylight/types";
import { localDate } from "@/lib/daylight/dates";
import { Button, inputClass } from "./ui";

export function Food() {
  const state = useDaylight();
  const options = foodOptions({
    meals: state.savedMeals,
    inventory: state.inventory,
    prepared: state.prepared,
    logs: state.foodLogs,
  });
  const meals = state.savedMeals.filter((meal) => (state.foodNoCook ? meal.noCook : true));
  const visibleMeals = state.showAllMeals ? meals : meals.slice(0, 3);
  const today = localDate();
  const todayFood = state.foodLogs.filter((log) => log.localDate === today);
  const proteinKnown = todayFood.filter((log) => log.proteinGrams != null);
  const proteinSum = proteinKnown.reduce((sum, log) => sum + (log.proteinGrams ?? 0), 0);

  return (
    <main>
      <h1 className="text-4xl">What can I eat now?</h1>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button onClick={() => state.setOverlay({ type: "log-food" })}>Log food</Button>
        <Button tone="outline" onClick={() => state.setOverlay({ type: "log-drink" })}>
          Log a drink
        </Button>
        <Button tone="outline" aria-pressed={state.foodNoCook} onClick={() => state.setFoodNoCook(!state.foodNoCook)}>
          No cooking
        </Button>
      </div>

      <section className="mt-5">
        {options.length === 0 ? (
          <div className="rounded-2xl border border-line bg-surface px-4 py-4">
            <p className="text-base">No pinned meal, prepared portion, or ready saved meal.</p>
            <p className="mt-1 text-base text-ink-soft">Unknown amounts stay unknown. Nothing here is marked ready.</p>
            <div className="mt-3 flex flex-wrap gap-3">
              <Button tone="outline" onClick={() => state.setOverlay({ type: "choose-meal" })}>
                Choose a saved meal
              </Button>
              <Button tone="quiet" onClick={() => state.setOverlay({ type: "log-food" })}>
                Log food
              </Button>
            </div>
          </div>
        ) : (
          <ul className="grid gap-3">
            {options.map((option) => (
              <li key={option.id} className="rounded-2xl border border-line bg-surface px-4 py-4">
                <h2 className="text-2xl">{option.name}</h2>
                <p className="text-base text-ink-soft">
                  {option.minutes != null ? `${option.minutes} min` : "Time not recorded"} · {option.reason}
                </p>
                <Button
                  className="mt-3"
                  onClick={() =>
                    option.kind === "prepared"
                      ? state.logFood({ food: option.name, mealId: null, protein: null, estimate: false, preparedId: option.id })
                      : state.setOverlay({ type: "repeat-meal", mealId: option.id })
                  }
                >
                  {option.kind === "prepared" ? "Log as eaten" : "Repeat this meal"}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-2xl">Saved meals</h2>
          <Button tone="quiet" onClick={() => state.setShowAllMeals(!state.showAllMeals)}>
            {state.showAllMeals ? "Show less" : "Show all"}
          </Button>
        </div>
        <ul className="mt-3 grid gap-3">
          {visibleMeals.map((meal) => {
            const ready = mealReady(meal, state.inventory);
            const uncertain = meal.ingredientNames.some((name) => stockFor(name, state.inventory) === "uncertain");
            return (
              <li key={meal.id} className="rounded-2xl border border-line px-4 py-3">
                <h3 className="text-xl">{meal.name}</h3>
                <p className="text-base text-ink-soft">
                  {meal.minutes != null ? `${meal.minutes} min` : "Time not recorded"} · {ready ? "Ingredients marked available" : uncertain ? "Check amount" : "Missing something"}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button tone="outline" onClick={() => state.setOverlay({ type: "repeat-meal", mealId: meal.id })}>
                    Log as eaten
                  </Button>
                  <Button tone="quiet" onClick={() => state.togglePin(meal.id)} disabled={!meal.pinned && state.savedMeals.filter((item) => item.pinned).length >= 3}>
                    {meal.pinned ? "Unpin" : "Pin"}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-6 rounded-2xl border border-line bg-surface px-4 py-4">
        <h2 className="text-2xl">Today’s food log</h2>
        {todayFood.length === 0 ? <p className="mt-2 text-base">No meals logged today.</p> : null}
        <ul className="mt-2 grid gap-1">
          {todayFood.map((log) => (
            <li key={log.id} className="text-base">
              {log.time} · {log.food}
              {log.proteinGrams == null ? " · protein not entered" : ` · ${log.proteinGrams} g${log.proteinIsEstimate ? " estimate" : ""}`}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-base">
          {proteinKnown.length === 0
            ? "No protein number entered today."
            : `${proteinSum} g from meals that have a number.`}
          {todayFood.some((log) => log.proteinGrams == null) && proteinKnown.length ? " Some meals have no protein number." : ""}
        </p>
        <label className="mt-3 block max-w-xs">
          <span className="text-base text-ink-soft">Protein goal, optional</span>
          <input
            inputMode="numeric"
            className={`${inputClass} tabular-nums`}
            value={state.proteinGoal}
            onChange={(event) => state.setProteinGoal(Number(event.target.value) || 0)}
          />
        </label>
        <p className="mt-1 text-base text-ink-soft">The goal is yours to edit. It does not decide whether the day worked.</p>
        {state.undo?.kind === "food" ? (
          <Button className="mt-3" tone="outline" onClick={() => state.undoLast()}>
            Undo last meal
          </Button>
        ) : null}
      </section>

      <div className="mt-6 grid gap-3">
        <Section title="Inventory" open={state.foodSections.inventory} onToggle={() => state.toggleFoodSection("inventory")}>
          <Inventory />
        </Section>
        <Section title="Recipes" open={state.foodSections.recipes} onToggle={() => state.toggleFoodSection("recipes")}>
          <Recipes />
        </Section>
        <Section title="Shopping list" open={state.foodSections.shopping} onToggle={() => state.toggleFoodSection("shopping")}>
          <Shopping />
        </Section>
        <Section title="Meal prep" open={state.foodSections.prep} onToggle={() => state.toggleFoodSection("prep")}>
          <Prep />
        </Section>
      </div>
    </main>
  );
}

function Section({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-line">
      <button type="button" className="flex min-h-14 w-full items-center justify-between px-4 text-left text-xl" aria-expanded={open} onClick={onToggle}>
        <span className="font-display">{title}</span>
        <span className="text-base text-ink-soft">{open ? "Hide" : "Open"}</span>
      </button>
      {open ? <div className="border-t border-line px-4 py-4">{children}</div> : null}
    </section>
  );
}

function Inventory() {
  const inventory = useDaylight((s) => s.inventory);
  const update = useDaylight((s) => s.updateInventory);
  const add = useDaylight((s) => s.addInventory);
  const [name, setName] = useState("");
  const [query, setQuery] = useState("");
  const rows = inventory.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()));
  return (
    <div>
      <input className={inputClass} placeholder="Search" value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search inventory" />
      <ul className="mt-3 grid gap-3">
        {rows.map((item) => (
          <li key={item.id} className="rounded-xl bg-canvas px-3 py-3">
            <p className="font-semibold">{item.name}</p>
            <p className="text-base text-ink-soft">
              {item.storageLocation} · {item.category}
            </p>
            <label className="mt-2 block">
              <span className="text-ink-soft">Quantity</span>
              <input className={inputClass} value={item.quantity} onChange={(event) => update(item.id, { quantity: event.target.value, status: event.target.value.trim() ? item.status === "check_amount" ? "fine" : item.status : "check_amount" })} />
            </label>
            <label className="mt-2 block">
              <span className="text-ink-soft">Status</span>
              <select
                className={inputClass}
                value={item.status}
                onChange={(event) => update(item.id, { status: event.target.value as InventoryStatus })}
              >
                {(["fine", "use_soon", "use_first", "low", "out", "check_amount"] as InventoryStatus[]).map((status) => (
                  <option key={status} value={status}>
                    {statusLabel(status)}
                  </option>
                ))}
              </select>
            </label>
          </li>
        ))}
      </ul>
      <form
        className="mt-3 flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          add(name);
          setName("");
        }}
      >
        <input className={inputClass} value={name} onChange={(event) => setName(event.target.value)} aria-label="New inventory item" />
        <Button type="submit">Add</Button>
      </form>
    </div>
  );
}

function Recipes() {
  const recipes = useDaylight((s) => s.recipes);
  const inventory = useDaylight((s) => s.inventory);
  const addMissing = useDaylight((s) => s.addMissingToShopping);
  const [open, setOpen] = useState<string | null>(null);
  return (
    <ul className="grid gap-3">
      {recipes.map((recipe) => {
        const missing = recipe.uses.filter((name) => stockFor(name, inventory) === "missing");
        const uncertain = recipe.uses.filter((name) => stockFor(name, inventory) === "uncertain");
        return (
          <li key={recipe.id} className="rounded-xl bg-canvas px-3 py-3">
            <button type="button" className="min-h-11 text-left text-lg font-semibold" onClick={() => setOpen(open === recipe.id ? null : recipe.id)}>
              {recipe.name}
            </button>
            <p className="text-base text-ink-soft">{recipe.minutes} min · {recipe.note}</p>
            {open === recipe.id ? (
              <div className="mt-2">
                <p className="text-base">Available: {recipe.uses.filter((name) => stockFor(name, inventory) === "available").join(", ") || "none confirmed"}</p>
                <p className="text-base">Check amount: {uncertain.join(", ") || "none"}</p>
                <p className="text-base">Missing: {missing.join(", ") || "none"}</p>
                <ol className="mt-2 list-decimal pl-5">
                  {recipe.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button tone="outline" onClick={() => addMissing(missing)} disabled={!missing.length}>
                    Add missing items to shopping list
                  </Button>
                </div>
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

function Shopping() {
  const shopping = useDaylight((s) => s.shopping);
  const toggle = useDaylight((s) => s.toggleShopping);
  const add = useDaylight((s) => s.addShopping);
  const toInventory = useDaylight((s) => s.addShoppingToInventory);
  const [name, setName] = useState("");
  const [qty, setQty] = useState("");
  return (
    <div>
      <p className="text-base">
        Grocery planning sheet:{" "}
        <a className="text-forest underline" href={GROCERY_SHEET} target="_blank" rel="noreferrer">
          open the sheet
        </a>
      </p>
      <ul className="mt-3 grid gap-2">
        {shopping.map((item) => (
          <li key={item.id} className="flex flex-wrap items-center gap-2">
            <button type="button" className="min-h-11 min-w-11 rounded-xl border border-line px-3 text-left" aria-pressed={item.checked} onClick={() => toggle(item.id)}>
              {item.checked ? "Bought" : "Need"}
            </button>
            <span className="text-base">
              {item.name}
              {item.quantity ? ` · ${item.quantity}` : ""} <span className="text-ink-soft">· {item.source}</span>
            </span>
            {item.checked ? (
              <Button tone="quiet" onClick={() => toInventory(item.id)}>
                Add to inventory
              </Button>
            ) : null}
          </li>
        ))}
      </ul>
      <form
        className="mt-3 grid gap-2 sm:grid-cols-[1fr_8rem_auto]"
        onSubmit={(event) => {
          event.preventDefault();
          add(name, qty, "Added by you");
          setName("");
          setQty("");
        }}
      >
        <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} aria-label="Shopping item" />
        <input className={inputClass} value={qty} onChange={(e) => setQty(e.target.value)} aria-label="Quantity" />
        <Button type="submit">Add</Button>
      </form>
    </div>
  );
}

function Prep() {
  const prep = useDaylight((s) => s.prep);
  const setStatus = useDaylight((s) => s.setPrepStatus);
  const makePortion = useDaylight((s) => s.addPreparedFromPrep);
  return (
    <ul className="grid gap-3">
      {prep.map((task) => (
        <li key={task.id} className="rounded-xl bg-canvas px-3 py-3">
          <p className="text-lg font-semibold">{task.title}</p>
          <p className="text-base text-ink-soft">{task.detail}</p>
          <p className="mt-1 text-base">This makes a later meal easier to start. It does not log the meal as eaten.</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button tone="outline" onClick={() => setStatus(task.id, task.status === "done" ? "planned" : "done")}>
              {task.status === "done" ? "Mark not done" : "Mark prep done"}
            </Button>
            <Button tone="quiet" onClick={() => makePortion(task.id)}>
              Add as prepared portion
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
