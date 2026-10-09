import { Check, ChevronDown, Plus, ShoppingBasket } from "lucide-react";
import { useState } from "react";
import { INGREDIENT_PREP_IDEAS } from "@/lib/daylight/food-seed";
import { ingredientKey, kitchenStock, prepIngredients } from "@/lib/daylight/kitchen";
import { useDaylight } from "@/lib/daylight/store";
import { recordDate } from "@/lib/daylight/dates";
import type { PrepTask } from "@/lib/daylight/types";
import { Badge, Button, Eyebrow } from "./ui";

export function IngredientPrep({ shop }: { shop: () => void }) {
  const s = useDaylight();
  const selected = s.prep.filter((t) => t.selected);
  const [title, setTitle] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [detail, setDetail] = useState("");
  const ready = s.prepared.filter((p) => p.available);
  const missingIdeas = INGREDIENT_PREP_IDEAS.filter(
    (idea) =>
      !s.prep.some((t) =>
        prepIngredients(t).some((name) =>
          idea.ingredientNames?.some((n) => ingredientKey(n) === ingredientKey(name)),
        ),
      ),
  );
  return (
    <div className="kitchen-prep-layout">
      <div className="space-y-5">
        <div className="kitchen-section-heading">
          <div>
            <Eyebrow>Ingredient prep</Eyebrow>
            <h2>Prepare building blocks, keep your options.</h2>
            <p>Choose ingredients to get ready. Combine them differently when you’re hungry.</p>
          </div>
        </div>
        <div className="prep-pick-grid">
          {s.prep.map((task) => (
            <PrepCard key={task.id} task={task} />
          ))}
        </div>
        {missingIdeas.length ? (
          <div className="kitchen-panel">
            <h3>Add another ingredient batch</h3>
            <div className="flex flex-wrap gap-2 mt-3">
              {missingIdeas.map((idea) => (
                <Button
                  key={idea.id}
                  size="sm"
                  tone="outline"
                  onClick={() => s.addPrepTask(idea.title, idea.detail, idea.ingredientNames)}
                >
                  <Plus className="size-4" />
                  {idea.title}
                </Button>
              ))}
            </div>
          </div>
        ) : null}
        <details className="kitchen-panel">
          <summary className="kitchen-summary">
            <span>Add your own prep</span>
            <Plus className="size-4" />
          </summary>
          <form
            className="grid gap-3 mt-4"
            onSubmit={(e) => {
              e.preventDefault();
              s.addPrepTask(
                title,
                detail,
                ingredients
                  .split(",")
                  .map((n) => n.trim())
                  .filter(Boolean),
              );
              setTitle("");
              setIngredients("");
              setDetail("");
            }}
          >
            <label className="kitchen-label">
              Prep task
              <input
                className="field mt-1"
                aria-label="Prep task name"
                placeholder="Cook a batch of rice"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </label>
            <label className="kitchen-label">
              Ingredients
              <input
                className="field mt-1"
                aria-label="Prep ingredients"
                placeholder="Rice, olive oil, salt"
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
              />
              <span className="kitchen-help">
                Separate names with commas. These feed the shopping review.
              </span>
            </label>
            <label className="kitchen-label">
              Notes, optional
              <input
                className="field mt-1"
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
              />
            </label>
            <Button type="submit" disabled={!title.trim() || !ingredients.trim()}>
              Add to my prep
            </Button>
          </form>
        </details>
      </div>
      <aside className="prep-summary kitchen-panel">
        <Eyebrow>My next prep</Eyebrow>
        <h2>
          {selected.length
            ? `${selected.length} ingredient ${selected.length === 1 ? "batch" : "batches"}`
            : "Nothing selected yet"}
        </h2>
        <p className="kitchen-help mt-2">
          Select the batches you want. Choosing prep does not add groceries yet.
        </p>
        {selected.length ? (
          <ul className="prep-summary-list">
            {selected.map((t) => (
              <li key={t.id}>
                <span>{t.title}</span>
                {t.status === "done" ? (
                  <Check className="size-4 text-accent" />
                ) : (
                  <button
                    type="button"
                    className="text-xs text-ink-soft underline"
                    onClick={() => s.updatePrep(t.id, { selected: false })}
                  >
                    Remove
                  </button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="prep-empty">
            Choose a few ingredients from the cards. You’re preparing flexibility, not committing to
            a menu.
          </div>
        )}
        <Button className="w-full mt-4" onClick={shop}>
          <ShoppingBasket className="size-4" />
          Review ingredients &amp; staples
        </Button>
        <p className="kitchen-help mt-3">
          Check what’s already at home before building the shopping list.
        </p>
        <div className="prep-ready-summary">
          <h3>
            Prepared ingredients <Badge>{ready.length}</Badge>
          </h3>
          {ready.length ? (
            ready.map((p) => (
              <div key={p.id} className="ready-batch">
                <b>{p.name}</b>
                <span>
                  {[p.quantity, p.storageLocation, p.preparedAt ? recordDate(p.preparedAt) : ""]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
                <button type="button" onClick={() => s.setPreparedAvailable(p.id, false)}>
                  Mark used up
                </button>
              </div>
            ))
          ) : (
            <p className="kitchen-help mt-2">
              Finish a batch and mark it prepared. It will appear here and in your food options.
            </p>
          )}
        </div>
        {s.prepared.some((p) => !p.available) ? (
          <details className="mt-4">
            <summary className="text-xs text-ink-soft cursor-pointer">Used-up batches</summary>
            {s.prepared
              .filter((p) => !p.available)
              .map((p) => (
                <div key={p.id} className="flex items-center gap-2 mt-2 text-sm">
                  <span className="flex-1">{p.name}</span>
                  <Button size="sm" tone="ghost" onClick={() => s.setPreparedAvailable(p.id, true)}>
                    Restore
                  </Button>
                </div>
              ))}
          </details>
        ) : null}
      </aside>
    </div>
  );
}
function PrepCard({ task }: { task: PrepTask }) {
  const s = useDaylight();
  const ingredients = prepIngredients(task);
  const [editing, setEditing] = useState(false);
  const [names, setNames] = useState(ingredients.join(", "));
  const [title, setTitle] = useState(task.title);
  const selected = Boolean(task.selected);
  return (
    <article className="prep-ingredient-card" data-selected={selected}>
      <label className="prep-select">
        <input
          type="checkbox"
          checked={selected}
          aria-label={`Prepare ${task.title}`}
          onChange={(e) => s.updatePrep(task.id, { selected: e.target.checked })}
        />
        <span>
          <b>{task.title}</b>
          <small>
            {ingredients.length
              ? ingredients.join(" · ")
              : "Set ingredients before building shopping"}
          </small>
        </span>
        {selected ? (
          <Check className="size-4 text-accent shrink-0" />
        ) : (
          <Plus className="size-4 shrink-0 text-ink-soft" />
        )}
      </label>
      {selected ? (
        <div className="prep-card-body">
          <div className="flex flex-wrap gap-1.5">
            {ingredients.map((name) => (
              <span
                key={name}
                className="ingredient-stock"
                data-stock={kitchenStock(name, s.inventory)}
              >
                {name} ·{" "}
                {kitchenStock(name, s.inventory) === "available"
                  ? "on hand"
                  : kitchenStock(name, s.inventory) === "uncertain"
                    ? "check amount"
                    : "need"}
              </span>
            ))}
          </div>
          <label className="kitchen-label block mt-3">
            Batch amount, optional
            <input
              className="field mt-1"
              aria-label={`${task.title} batch amount`}
              placeholder="4 portions, 2 cups, a tray…"
              value={task.quantity ?? ""}
              onChange={(e) => s.updatePrep(task.id, { quantity: e.target.value })}
            />
          </label>
          <label className="kitchen-label block mt-3">
            Store prepared batch in
            <select
              className="field mt-1"
              aria-label={`${task.title} prepared storage`}
              value={task.storageLocation ?? "Fridge"}
              onChange={(e) => s.updatePrep(task.id, { storageLocation: e.target.value })}
            >
              <option>Fridge</option>
              <option>Freezer</option>
              <option>Pantry</option>
            </select>
          </label>
          {task.status === "done" ? (
            <div className="flex items-center justify-between gap-2 mt-3">
              <Badge>Prepared</Badge>
              <Button
                size="sm"
                tone="ghost"
                onClick={() => s.updatePrep(task.id, { status: "planned" })}
              >
                Prep another batch
              </Button>
            </div>
          ) : (
            <Button
              tone="outline"
              className="mt-3 w-full"
              disabled={!ingredients.length}
              onClick={() => s.addPreparedFromPrep(task.id)}
            >
              <Check className="size-4" />
              Mark prepared
            </Button>
          )}
        </div>
      ) : null}
      <button
        type="button"
        className="prep-edit-toggle"
        aria-expanded={editing}
        onClick={() => setEditing(!editing)}
      >
        Edit ingredients &amp; notes
        <ChevronDown className="size-3.5" />
      </button>
      {editing ? (
        <form
          className="grid gap-3 p-4 border-t border-line"
          onSubmit={(e) => {
            e.preventDefault();
            s.updatePrep(task.id, {
              title: title.trim(),
              ingredientNames: names
                .split(",")
                .map((n) => n.trim())
                .filter(Boolean),
            });
            setEditing(false);
          }}
        >
          <label className="kitchen-label">
            Task name
            <input
              className="field mt-1"
              aria-label={`${task.title} task name`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          <label className="kitchen-label">
            Ingredients
            <input
              className="field mt-1"
              aria-label={`${task.title} ingredients`}
              value={names}
              onChange={(e) => setNames(e.target.value)}
            />
          </label>
          <label className="kitchen-label">
            Notes
            <textarea
              className="field mt-1 py-2"
              value={task.detail}
              onChange={(e) => s.updatePrep(task.id, { detail: e.target.value })}
            />
          </label>
          <Button size="sm" type="submit" disabled={!title.trim()}>
            Save prep details
          </Button>
        </form>
      ) : null}
    </article>
  );
}
