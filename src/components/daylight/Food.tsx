import { useMemo, useState } from "react";
import { ArrowRight, Check, Droplets, Leaf, Plus, Search, Utensils } from "lucide-react";
import { clock, localDate } from "@/lib/daylight/dates";
import { dayKind, isUseSoon, sumProtein, waterToday } from "@/lib/daylight/foodplan";
import { ingredientKey, kitchenStock, readyIngredients } from "@/lib/daylight/kitchen";
import { useDaylight } from "@/lib/daylight/store";
import { IngredientPrep } from "./IngredientPrep";
import { KitchenInventory } from "./KitchenInventory";
import { KitchenShopping } from "./KitchenShopping";
import { Badge, Button, Eyebrow, PageHead, Ring, Segmented } from "./ui";

type Tab = "options" | "prep" | "inventory" | "shopping";
export function Food() {
  const s = useDaylight();
  const [tab, setTab] = useState<Tab>("options");
  const [review, setReview] = useState(false);
  const need = s.shopping.filter((i) => !i.checked).length;
  return (
    <div className="food-workspace">
      <PageHead title="Food" helper="Prep ingredients. Keep variety. Buy only what you need." />
      <Segmented<Tab>
        className="food-tabs"
        label="Food sections"
        value={tab}
        onChange={setTab}
        options={[
          { id: "options", label: "Food options" },
          { id: "prep", label: "Ingredient prep" },
          { id: "inventory", label: "Inventory" },
          { id: "shopping", label: `Shopping${need ? ` · ${need}` : ""}` },
        ]}
      />
      <div className="mt-6">
        {tab === "options" ? (
          <FoodOptions prep={() => setTab("prep")} />
        ) : tab === "prep" ? (
          <IngredientPrep
            shop={() => {
              setReview(true);
              setTab("shopping");
            }}
          />
        ) : tab === "inventory" ? (
          <KitchenInventory />
        ) : (
          <KitchenShopping review={review} setReview={setReview} prep={() => setTab("prep")} />
        )}
      </div>
    </div>
  );
}
export function useFoodNumbers() {
  const s = useDaylight();
  const today = localDate();
  const wd = new Date().getDay();
  const kind = dayKind(wd);
  const goal = kind === "recovery" && s.proteinGoalRest ? s.proteinGoalRest : s.proteinGoal;
  return {
    today,
    wd,
    kind,
    goal,
    protein: sumProtein(s.foodLogs, today),
    water: waterToday(s.fluidLogs, today),
    waterGoal: s.waterGoal,
  };
}
export function ProteinWaterRings({ size = 84 }: { size?: number }) {
  const n = useFoodNumbers();
  return (
    <div className="flex items-center gap-4">
      <Ring
        value={n.goal ? n.protein.total / n.goal : 0}
        size={size}
        color="var(--accent)"
        label={`Protein ${n.protein.total} of ${n.goal} grams`}
      >
        <span className="t-title tabular-nums">{n.protein.total}</span>
        <span className="t-meta text-ink-soft">/{n.goal} g</span>
      </Ring>
      <Ring
        value={n.waterGoal ? n.water / n.waterGoal : 0}
        size={size}
        color="var(--info)"
        label={`Water ${n.water} of ${n.waterGoal} ounces`}
      >
        <span className="t-title tabular-nums">{Math.round(n.water)}</span>
        <span className="t-meta text-ink-soft">/{n.waterGoal} oz</span>
      </Ring>
    </div>
  );
}
function FoodOptions({ prep }: { prep: () => void }) {
  const s = useDaylight();
  const n = useFoodNumbers();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [picked, setPicked] = useState<string[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [names, setNames] = useState("");
  const prepared = useMemo(() => readyIngredients(s.prepared, s.prep), [s.prepared, s.prep]);
  const preparedKeys = useMemo(() => new Set(prepared.map(ingredientKey)), [prepared]);
  const onHand = s.inventory
    .filter((i) => kitchenStock(i.name, s.inventory) === "available")
    .map((i) => i.name);
  const ingredients = [
    ...new Map([...prepared, ...onHand].map((x) => [ingredientKey(x), x])).values(),
  ];
  const soon = s.inventory.filter((i) => isUseSoon(i, n.today));
  const options = useMemo(
    () =>
      s.savedMeals
        .filter(
          (m) =>
            `${m.name} ${m.ingredientNames.join(" ")}`.toLowerCase().includes(q.toLowerCase()) &&
            (filter !== "no-cook" || m.noCook) &&
            (filter !== "on-hand" ||
              (m.ingredientNames.length > 0 &&
                m.ingredientNames.every(
                  (name) =>
                    kitchenStock(name, s.inventory) === "available" ||
                    preparedKeys.has(ingredientKey(name)),
                ))) &&
            (!picked.length ||
              picked.some((p) =>
                m.ingredientNames.some((name) => ingredientKey(name) === ingredientKey(p)),
              )),
        )
        .sort(
          (a, b) =>
            b.ingredientNames.filter((n) =>
              picked.some((p) => ingredientKey(p) === ingredientKey(n)),
            ).length -
            a.ingredientNames.filter((n) =>
              picked.some((p) => ingredientKey(p) === ingredientKey(n)),
            ).length,
        ),
    [s.savedMeals, s.inventory, preparedKeys, q, filter, picked],
  );
  const logPicked = () => {
    s.patchDraft({ food: picked.join(", "), foodProtein: "", foodEstimate: false });
    s.setOverlay({ type: "log-food" });
  };
  return (
    <div className="food-options-layout">
      <div className="space-y-5">
        <section className="ingredient-counter">
          <div className="kitchen-section-heading">
            <div>
              <Eyebrow>My ingredient counter</Eyebrow>
              <h2>Choose from what’s ready.</h2>
              <p>
                Pick ingredients you feel like eating. See ways to use them, or put together your
                own combination.
              </p>
            </div>
            <Leaf className="size-6 text-accent shrink-0" />
          </div>
          <div className="ingredient-palette">
            {ingredients.length ? (
              ingredients.map((name) => (
                <button
                  key={ingredientKey(name)}
                  type="button"
                  aria-pressed={picked.includes(name)}
                  className="ingredient-tile"
                  data-prepared={preparedKeys.has(ingredientKey(name))}
                  onClick={() =>
                    setPicked(
                      picked.includes(name) ? picked.filter((p) => p !== name) : [...picked, name],
                    )
                  }
                >
                  <span className="ingredient-dot">
                    {picked.includes(name) ? (
                      <Check className="size-4" />
                    ) : (
                      <Plus className="size-4" />
                    )}
                  </span>
                  <b>{name}</b>
                  <small>{preparedKeys.has(ingredientKey(name)) ? "Prepared" : "On hand"}</small>
                </button>
              ))
            ) : (
              <div className="ingredient-counter-empty">
                <p>No ingredients confirmed yet.</p>
                <span>
                  Mark amounts in Inventory or finish an ingredient batch. Nothing is assumed to be
                  in your kitchen.
                </span>
                <Button tone="outline" onClick={prep}>
                  Choose ingredient prep
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            )}
          </div>
          {picked.length ? (
            <div className="ingredient-selection">
              <span>{picked.length} selected · options below use at least one</span>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={logPicked}>
                  Log my combination
                </Button>
                <Button size="sm" tone="ghost" onClick={() => setPicked([])}>
                  Clear selection
                </Button>
              </div>
            </div>
          ) : null}
        </section>
        {soon.length ? (
          <section className="use-soon-strip">
            <Leaf className="size-4 shrink-0" />
            <div>
              <b>Use soon</b>
              <p>{soon.map((i) => i.name).join(" · ")}</p>
            </div>
          </section>
        ) : null}
        <section className="space-y-4">
          <div className="kitchen-section-heading">
            <div>
              <h2>Ways to use your ingredients</h2>
              <p>Options, not a fixed menu. Your original recipe library is here.</p>
            </div>
            <span className="kitchen-count">{options.length} options</span>
          </div>
          <div className="food-option-filters">
            <label className="inventory-search">
              <Search className="size-4" />
              <input
                aria-label="Search food options"
                placeholder="Find a food option"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </label>
            <select
              className="field"
              aria-label="Food option filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All options</option>
              <option value="on-hand">Ingredients on hand</option>
              <option value="no-cook">No-cook options</option>
            </select>
          </div>
          {!options.length ? (
            <p className="kitchen-panel text-sm text-ink-soft">
              No saved options match. Clear a filter or add your own combination below.
            </p>
          ) : (
            <div className="food-option-grid">
              {options.map((meal) => {
                const recipe = s.recipes.find((r) => r.id === meal.recipeId);
                const have = meal.ingredientNames.filter(
                  (name) =>
                    kitchenStock(name, s.inventory) === "available" ||
                    preparedKeys.has(ingredientKey(name)),
                );
                const ready = meal.ingredientNames.filter((name) =>
                  preparedKeys.has(ingredientKey(name)),
                );
                return (
                  <article key={meal.id} className="food-option-card">
                    <div className="flex gap-2 items-start">
                      <span className="food-option-icon">
                        <Utensils className="size-5" />
                      </span>
                      <Badge>{meal.noCook ? "No cook" : "Cook / assemble"}</Badge>
                    </div>
                    <h3>{meal.name}</h3>
                    <p className="option-availability">
                      {have.length} of {meal.ingredientNames.length} ingredients on hand
                      {ready.length ? ` · ${ready.length} prepared` : ""}
                    </p>
                    <div className="option-ingredients">
                      {meal.ingredientNames.map((name) => (
                        <span key={name} data-have={have.includes(name)}>
                          {name}
                        </span>
                      ))}
                    </div>
                    <div className="food-option-actions">
                      <Button
                        size="sm"
                        tone="outline"
                        onClick={() => s.setOverlay({ type: "repeat-meal", mealId: meal.id })}
                      >
                        Review &amp; log
                      </Button>
                      <button
                        type="button"
                        aria-expanded={open === meal.id}
                        onClick={() => setOpen(open === meal.id ? null : meal.id)}
                      >
                        Details {open === meal.id ? "−" : "+"}
                      </button>
                    </div>
                    {open === meal.id ? (
                      <div className="option-details">
                        {recipe ? (
                          <ol className="list-decimal pl-5 space-y-2 text-sm">
                            {recipe.steps.map((step) => (
                              <li key={step}>{step}</li>
                            ))}
                          </ol>
                        ) : (
                          <p className="text-sm text-ink-soft">
                            Combine these ingredients as you like. This is a saved option, not a
                            scheduled meal.
                          </p>
                        )}
                        <label className="kitchen-label block mt-4">
                          Protein per serving, optional
                          <input
                            className="field mt-1"
                            aria-label={`${meal.name} protein grams`}
                            inputMode="decimal"
                            value={meal.proteinGrams ?? ""}
                            onChange={(e) =>
                              s.setMealProtein(
                                meal.id,
                                e.target.value.trim() ? Number(e.target.value) || 0 : null,
                              )
                            }
                          />
                        </label>
                        <Button size="sm" tone="ghost" onClick={() => s.togglePin(meal.id)}>
                          {meal.pinned ? "Unpin option" : "Pin option"}
                        </Button>
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          )}
        </section>
        <details className="kitchen-panel">
          <summary className="kitchen-summary">
            <span>Save another food option</span>
            <Plus className="size-4" />
          </summary>
          <form
            className="grid gap-3 mt-4"
            onSubmit={(e) => {
              e.preventDefault();
              s.addSavedMeal({
                name,
                ingredientNames: names
                  .split(",")
                  .map((x) => x.trim())
                  .filter(Boolean),
                minutes: null,
                noCook: false,
                proteinGrams: null,
              });
              setName("");
              setNames("");
            }}
          >
            <label className="kitchen-label">
              Name
              <input
                className="field mt-1"
                aria-label="New food option name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label className="kitchen-label">
              Ingredients
              <input
                className="field mt-1"
                aria-label="New food option ingredients"
                value={names}
                onChange={(e) => setNames(e.target.value)}
                placeholder="Separate names with commas"
              />
            </label>
            <Button type="submit" disabled={!name.trim() || !names.trim()}>
              Save option
            </Button>
          </form>
        </details>
      </div>
      <aside className="food-log-sidebar kitchen-panel">
        <Eyebrow>Today’s intake</Eyebrow>
        <h2>Log what you ate.</h2>
        <p className="kitchen-help mt-2">
          Log what you actually ate. A complete recipe or plan is not required.
        </p>
        <Button className="w-full mt-4" onClick={() => s.setOverlay({ type: "log-food" })}>
          <Utensils className="size-4" />
          Log food
        </Button>
        <Button
          tone="outline"
          className="w-full mt-2"
          onClick={() => s.setOverlay({ type: "log-drink" })}
        >
          <Droplets className="size-4" />
          Log a drink
        </Button>
        <div className="quick-water-grid">
          {[8, 12, 16, 24].map((oz) => (
            <button
              type="button"
              key={oz}
              onClick={() => {
                s.addWater(oz);
                s.showToast(`${oz} oz water logged`);
              }}
            >
              +{oz} oz
            </button>
          ))}
        </div>
        <div className="food-intake-summary">
          <span>
            <b>{n.protein.total} g</b> protein logged{n.protein.unknown ? " · some unknown" : ""}
          </span>
          <span>
            <b>{Math.round(n.water)} oz</b> fluid logged
          </span>
        </div>
        <details className="mt-4">
          <summary className="kitchen-summary text-sm">Your intake targets</summary>
          <div className="mt-3">
            <ProteinWaterRings size={80} />
          </div>
          <p className="kitchen-help mt-3">Targets are the values you set in Settings.</p>
        </details>
        <div className="food-today-log">
          <h3>Today’s log</h3>
          {!s.foodLogs.some((l) => l.localDate === n.today) &&
          !s.fluidLogs.some((l) => l.localDate === n.today) ? (
            <p className="kitchen-help mt-2">Nothing logged yet.</p>
          ) : null}
          {s.foodLogs
            .filter((l) => l.localDate === n.today)
            .map((l) => (
              <div key={l.id}>
                <time>{clock(l.time)}</time>
                <span>{l.food}</span>
              </div>
            ))}
          {s.fluidLogs
            .filter((l) => l.localDate === n.today)
            .map((l) => (
              <div key={l.id}>
                <time>{clock(l.time)}</time>
                <span>
                  {l.beverage} · {l.amountOz} oz
                </span>
              </div>
            ))}
          {s.undo?.kind === "food" || s.undo?.kind === "fluid" ? (
            <Button size="sm" tone="ghost" onClick={() => s.undoLast()}>
              Undo last log
            </Button>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
