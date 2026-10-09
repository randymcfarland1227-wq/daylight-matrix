import { Check, ChevronDown, Plus, ShoppingBasket, X } from "lucide-react";
import { useMemo, useState } from "react";
import {
  ingredientKey,
  prepIngredients,
  shoppingReview,
  shoppingChoice,
  type KitchenNeed,
} from "@/lib/daylight/kitchen";
import { useDaylight } from "@/lib/daylight/store";
import type { ShoppingItem } from "@/lib/daylight/types";
import { Badge, Button, Eyebrow } from "./ui";

export function KitchenShopping({
  review,
  setReview,
  prep,
}: {
  review: boolean;
  setReview: (v: boolean) => void;
  prep: () => void;
}) {
  const s = useDaylight();
  const needs = useMemo(() => shoppingReview(s.prep, s.inventory), [s.prep, s.inventory]);
  const [choices, setChoices] = useState<Record<string, boolean>>({});
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const active = s.shopping.filter((i) => !i.checked);
  const bought = s.shopping.filter((i) => i.checked);
  const chosen = (r: KitchenNeed) => shoppingChoice(r, choices[r.key]);
  const additions = needs.filter(
    (r) => chosen(r) && !active.some((i) => ingredientKey(i.name) === r.key),
  );
  const selected = s.prep.filter((t) => t.selected);
  const unlinked = selected.filter((t) => !prepIngredients(t).length);
  const build = () => {
    for (const row of additions)
      s.addShopping(
        row.name,
        amounts[row.key] ?? "",
        [
          row.prepTitles.length ? `Prep: ${row.prepTitles.join(" · ")}` : "",
          row.staple ? "Staple you selected" : "",
        ]
          .filter(Boolean)
          .join(" · "),
      );
    s.showToast(
      `${additions.length} ${additions.length === 1 ? "item" : "items"} added to shopping`,
    );
    setReview(false);
    setChoices({});
    setAmounts({});
  };
  return (
    <div className="space-y-5">
      <div className="kitchen-section-heading">
        <div>
          <h2>
            {active.length
              ? `${active.length} ${active.length === 1 ? "thing" : "things"} to buy`
              : "Your shopping list is empty."}
          </h2>
          <p>Built from the ingredients you plan to prep and the staples you decide you need.</p>
        </div>
        <Button tone={review ? "outline" : "primary"} onClick={() => setReview(!review)}>
          <ShoppingBasket className="size-4" />
          {review ? "Close review" : "Build from prep"}
        </Button>
      </div>
      {review ? (
        <section className="shopping-builder" aria-label="Shopping review">
          <div className="shopping-builder-heading">
            <Eyebrow>Review before adding</Eyebrow>
            <h3>What do you actually need to buy?</h3>
            <p>
              Missing prep ingredients are ticked. Uncertain amounts need your check. Staples stay
              unticked until you choose them.
            </p>
          </div>
          <div className="shopping-review-section">
            <div className="flex justify-between gap-3 items-center">
              <h4>Ingredients for my prep</h4>
              <Button size="sm" tone="ghost" onClick={prep}>
                Change prep
              </Button>
            </div>
            {selected.length ? (
              <p className="kitchen-help mb-3">For {selected.map((t) => t.title).join(" · ")}</p>
            ) : (
              <p className="kitchen-help my-3">
                No prep selected. Choose ingredient batches first, or check staples below.
              </p>
            )}
            {unlinked.length ? (
              <p className="kitchen-alert">
                Set ingredients for {unlinked.map((t) => t.title).join(", ")} in Ingredient prep. No
                groceries can be inferred for those tasks.
              </p>
            ) : null}
            {needs
              .filter((r) => !r.staple)
              .map((row) => (
                <ReviewRow
                  key={row.key}
                  row={row}
                  checked={chosen(row)}
                  amount={amounts[row.key] ?? ""}
                  already={active.some((i) => ingredientKey(i.name) === row.key)}
                  toggle={(v) => setChoices({ ...choices, [row.key]: v })}
                  setAmount={(v) => setAmounts({ ...amounts, [row.key]: v })}
                />
              ))}
          </div>
          <div className="shopping-review-section">
            <h4>Check my staples</h4>
            <p className="kitchen-help mb-3 mt-1">
              Tick only what you need this time. You can mark additional inventory items as staples.
            </p>
            {needs
              .filter((r) => r.staple)
              .map((row) => (
                <ReviewRow
                  key={row.key}
                  row={row}
                  checked={chosen(row)}
                  amount={amounts[row.key] ?? ""}
                  already={active.some((i) => ingredientKey(i.name) === row.key)}
                  toggle={(v) => setChoices({ ...choices, [row.key]: v })}
                  setAmount={(v) => setAmounts({ ...amounts, [row.key]: v })}
                />
              ))}
          </div>
          <div className="shopping-build-action">
            <p>
              {additions.length} new {additions.length === 1 ? "item" : "items"} selected. Nothing
              is added until you press the button.
            </p>
            <Button disabled={!additions.length} onClick={build} data-testid="build-shopping">
              Add {additions.length} to shopping list
            </Button>
          </div>
        </section>
      ) : null}
      <section className="kitchen-panel" aria-label="Current shopping list">
        <div className="flex items-center gap-3">
          <h3 className="flex-1">
            To buy <Badge>{active.length}</Badge>
          </h3>
          {active.length ? (
            <Button
              size="sm"
              tone="ghost"
              onClick={() => s.archiveShopping(s.shopping.map((i) => i.id))}
            >
              Archive list
            </Button>
          ) : null}
        </div>
        {!active.length ? (
          <div className="shopping-empty">
            <ShoppingBasket className="size-9 text-accent" />
            <h4>Only what you choose belongs here.</h4>
            <p>Select ingredient prep, check what’s at home, then tick the staples you need.</p>
            {!review ? (
              <Button tone="outline" onClick={() => setReview(true)}>
                Review ingredients &amp; staples
              </Button>
            ) : null}
          </div>
        ) : (
          <ul className="shopping-list">
            {active.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className="shopping-check"
                  aria-label={`Mark ${item.name} bought`}
                  onClick={() => s.toggleShopping(item.id)}
                />
                <div className="flex-1 min-w-0">
                  <b>{item.name}</b>
                  <span>{item.quantity || "Amount not set"}</span>
                  <small>{item.source}</small>
                </div>
                <button
                  type="button"
                  className="icon-button"
                  aria-label={`Archive ${item.name}`}
                  onClick={() => s.archiveShopping([item.id])}
                >
                  <X className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <details className="shopping-extra">
          <summary>
            <Plus className="size-4" />
            Add something else
          </summary>
          <form
            className="shopping-extra-form"
            onSubmit={(e) => {
              e.preventDefault();
              s.addShopping(name, quantity, "Added by you");
              setName("");
              setQuantity("");
            }}
          >
            <input
              className="field"
              aria-label="Extra shopping item"
              placeholder="Ingredient or extra item"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="field"
              aria-label="Extra shopping quantity"
              placeholder="Amount, optional"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
            <Button type="submit" disabled={!name.trim()}>
              Add item
            </Button>
          </form>
        </details>
      </section>
      {bought.length ? (
        <section className="kitchen-panel">
          <h3>
            Bought <Badge>{bought.length}</Badge>
          </h3>
          <p className="kitchen-help mt-2">
            Put purchases into inventory, then choose their storage and category there.
          </p>
          <ul className="shopping-list">
            {bought.map((item) => (
              <BoughtRow item={item} key={item.id} />
            ))}
          </ul>
        </section>
      ) : null}
      {s.shoppingArchive.length ? (
        <details className="kitchen-panel">
          <summary className="kitchen-summary">
            <span>
              Archived entries <Badge>{s.shoppingArchive.length}</Badge>
            </span>
            <ChevronDown className="size-4" />
          </summary>
          <p className="kitchen-help mt-3">
            Old starter suggestions and entries you archive stay here. They are not on your current
            list.
          </p>
          <ul className="shopping-archive">
            {s.shoppingArchive.map((item) => (
              <li key={item.id}>
                <span>
                  {item.name}
                  {item.quantity ? ` · ${item.quantity}` : ""}
                </span>
                <Button size="sm" tone="ghost" onClick={() => s.restoreShopping(item.id)}>
                  Add to current list
                </Button>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  );
}
function ReviewRow({
  row,
  checked,
  toggle,
  amount,
  setAmount,
  already,
}: {
  row: KitchenNeed;
  checked: boolean;
  toggle: (v: boolean) => void;
  amount: string;
  setAmount: (v: string) => void;
  already: boolean;
}) {
  return (
    <div className="shopping-review-row" data-buy={checked && !already}>
      <label>
        <input
          type="checkbox"
          aria-label={`Need ${row.name}`}
          checked={already || checked}
          disabled={already}
          onChange={(e) => toggle(e.target.checked)}
        />
        <span>
          <b>{row.name}</b>
          <small>
            {already
              ? "Already on your shopping list"
              : row.stock === "available"
                ? "Inventory: on hand"
                : row.stock === "uncertain"
                  ? "Inventory: check amount"
                  : "Inventory: not on hand"}
          </small>
          {row.staple && row.prepTitles.length ? (
            <small>Also used in {row.prepTitles.join(" · ")}</small>
          ) : null}
        </span>
      </label>
      {checked && !already ? (
        <input
          className="field"
          aria-label={`Buy amount for ${row.name}`}
          placeholder="Buy amount, optional"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      ) : (
        <span className="shopping-review-status">{already ? "On list" : "Leave off list"}</span>
      )}
    </div>
  );
}
function BoughtRow({ item }: { item: ShoppingItem }) {
  const s = useDaylight();
  return (
    <li>
      <button
        type="button"
        className="shopping-check"
        aria-label={`Move ${item.name} back to buy`}
        onClick={() => s.toggleShopping(item.id)}
      >
        <Check className="size-4" />
      </button>
      <div className="flex-1 min-w-0">
        <b>{item.name}</b>
        <span>{item.quantity || "Amount not set"}</span>
      </div>
      <Button
        size="sm"
        tone="outline"
        onClick={() => {
          s.addShoppingToInventory(item.id);
          s.archiveShopping([item.id]);
          s.showToast(`${item.name} added to inventory`);
        }}
      >
        Put in inventory
      </Button>
    </li>
  );
}
