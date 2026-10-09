import { ChevronDown, Package, Plus, Refrigerator, Search, Snowflake } from "lucide-react";
import { useMemo, useState } from "react";
import { FOOD_CATEGORIES, STORAGE_AREAS, foodCategory, storageArea } from "@/lib/daylight/kitchen";
import { isUseSoon } from "@/lib/daylight/foodplan";
import { localDate } from "@/lib/daylight/dates";
import { statusLabel, useDaylight } from "@/lib/daylight/store";
import type { InventoryItem, InventoryStatus } from "@/lib/daylight/types";
import { Badge, Button } from "./ui";

export function KitchenInventory() {
  const s = useDaylight();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [areas, setAreas] = useState<Record<string, boolean>>({ Fridge: true });
  const [categories, setCategories] = useState<Record<string, boolean>>({});
  const [name, setName] = useState("");
  const [location, setLocation] = useState("Fridge");
  const [category, setCategory] = useState("Protein");
  const [quantity, setQuantity] = useState("");
  const rows = useMemo(
    () =>
      s.inventory.filter(
        (i) =>
          `${i.name} ${foodCategory(i)} ${storageArea(i)}`
            .toLowerCase()
            .includes(q.toLowerCase()) &&
          (filter === "all" ||
            (filter === "soon" && isUseSoon(i, localDate())) ||
            (filter === "check" && ["check_amount", "low", "out"].includes(i.status))),
      ),
    [s.inventory, q, filter],
  );
  const allAreas = [...new Set([...STORAGE_AREAS, ...s.inventory.map(storageArea)])];
  return (
    <div className="space-y-5">
      <div className="kitchen-section-heading">
        <div>
          <h2>Know what’s at home.</h2>
          <p>
            Open a storage area, then a category. Update amounts as you use or restock ingredients.
          </p>
        </div>
        <span className="kitchen-count">{s.inventory.length} items</span>
      </div>
      <div className="inventory-toolbar">
        <label className="inventory-search">
          <Search className="size-4" />
          <input
            aria-label="Search inventory"
            placeholder="Find an ingredient or category"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </label>
        <select
          className="field"
          aria-label="Inventory filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All items</option>
          <option value="soon">Use soon</option>
          <option value="check">Low, out or unchecked</option>
        </select>
      </div>
      <div className="inventory-areas">
        {allAreas.map((area) => {
          const items = rows.filter((i) => storageArea(i) === area);
          const cats = [...new Set(items.map(foodCategory))].sort();
          const open = areas[area] ?? Boolean(q || filter !== "all");
          const Icon = area === "Fridge" ? Refrigerator : area === "Freezer" ? Snowflake : Package;
          return (
            <section className="inventory-area" key={area}>
              <button
                type="button"
                className="storage-heading"
                aria-expanded={open}
                onClick={() => setAreas({ ...areas, [area]: !open })}
              >
                <span className="storage-icon">
                  <Icon className="size-5" />
                </span>
                <span>
                  <b>{area}</b>
                  <small>
                    {items.length} {items.length === 1 ? "item" : "items"} · {cats.length}{" "}
                    categories
                  </small>
                </span>
                <ChevronDown
                  className="size-5 ml-auto"
                  style={{ transform: open ? "rotate(180deg)" : undefined }}
                />
              </button>
              {open ? (
                <div className="storage-categories">
                  {cats.length ? (
                    cats.map((cat) => {
                      const key = `${area}/${cat}`;
                      const expanded = categories[key] ?? Boolean(q || filter !== "all");
                      const catItems = items
                        .filter((i) => foodCategory(i) === cat)
                        .sort((a, b) => a.name.localeCompare(b.name));
                      return (
                        <div className="inventory-category" key={cat}>
                          <button
                            type="button"
                            className="category-heading"
                            aria-expanded={expanded}
                            aria-label={`${area} ${cat}`}
                            onClick={() => setCategories({ ...categories, [key]: !expanded })}
                          >
                            <ChevronDown
                              className="size-4"
                              style={{ transform: expanded ? "rotate(180deg)" : undefined }}
                            />
                            <b>{cat}</b>
                            <span>{catItems.length}</span>
                          </button>
                          {expanded ? (
                            <div className="inventory-items">
                              {catItems.map((item) => (
                                <InventoryRow item={item} key={item.id} />
                              ))}
                            </div>
                          ) : null}
                        </div>
                      );
                    })
                  ) : (
                    <p className="kitchen-help p-5">
                      {q || filter !== "all"
                        ? "No matching items here."
                        : "No items in this storage area yet."}
                    </p>
                  )}
                </div>
              ) : null}
            </section>
          );
        })}
      </div>
      <details className="kitchen-panel">
        <summary className="kitchen-summary">
          <span>Add an inventory item</span>
          <Plus className="size-4" />
        </summary>
        <form
          className="grid gap-3 mt-4"
          onSubmit={(e) => {
            e.preventDefault();
            s.addInventory(name, { quantity, storageLocation: location, category });
            setName("");
            setQuantity("");
            s.showToast(`Added to ${location}`);
          }}
        >
          <label className="kitchen-label">
            Ingredient
            <input
              className="field mt-1"
              aria-label="New inventory ingredient"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <div className="kitchen-fields">
            <label className="kitchen-label">
              Storage
              <select
                className="field mt-1"
                aria-label="New inventory storage"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              >
                {STORAGE_AREAS.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </label>
            <label className="kitchen-label">
              Category
              <input
                className="field mt-1"
                aria-label="New inventory category"
                list="food-categories"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </label>
            <label className="kitchen-label">
              Amount, optional
              <input
                className="field mt-1"
                aria-label="New inventory amount"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </label>
          </div>
          <Button type="submit" disabled={!name.trim()}>
            Add ingredient
          </Button>
        </form>
      </details>
      <datalist id="food-categories">
        {FOOD_CATEGORIES.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
      <p className="kitchen-help">
        Low or empty inventory is a reminder to check. It does not automatically add anything to
        shopping.
      </p>
    </div>
  );
}
function InventoryRow({ item }: { item: InventoryItem }) {
  const s = useDaylight();
  return (
    <details className="inventory-row">
      <summary>
        <span>
          <b>{item.name}</b>
          <small>
            {item.quantity || "Amount not checked"}
            {item.cadence === "staple" ? " · staple" : ""}
          </small>
        </span>
        <Badge
          tone={
            item.status === "out"
              ? "danger"
              : ["low", "use_soon", "use_first"].includes(item.status)
                ? "copper"
                : "plain"
          }
        >
          {statusLabel(item.status)}
        </Badge>
        <ChevronDown className="size-4 shrink-0" />
      </summary>
      <div className="inventory-row-editor">
        <div className="kitchen-fields">
          <label className="kitchen-label">
            Amount
            <input
              className="field mt-1"
              aria-label={`${item.name} quantity`}
              value={item.quantity}
              onChange={(e) =>
                s.updateInventory(item.id, {
                  quantity: e.target.value,
                  status: e.target.value.trim()
                    ? item.status === "check_amount"
                      ? "fine"
                      : item.status
                    : "check_amount",
                })
              }
            />
          </label>
          <label className="kitchen-label">
            Status
            <select
              className="field mt-1"
              aria-label={`${item.name} status`}
              value={item.status}
              onChange={(e) =>
                s.updateInventory(item.id, { status: e.target.value as InventoryStatus })
              }
            >
              {(["fine", "use_soon", "use_first", "low", "out", "check_amount"] as const).map(
                (st) => (
                  <option key={st} value={st}>
                    {statusLabel(st)}
                  </option>
                ),
              )}
            </select>
          </label>
          <label className="kitchen-label">
            Storage
            <select
              className="field mt-1"
              aria-label={`${item.name} storage`}
              value={storageArea(item)}
              onChange={(e) => s.updateInventory(item.id, { storageLocation: e.target.value })}
            >
              {[...new Set([...STORAGE_AREAS, storageArea(item)])].map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </label>
          <label className="kitchen-label">
            Category
            <input
              key={item.category}
              className="field mt-1"
              aria-label={`${item.name} category`}
              list="food-categories"
              defaultValue={foodCategory(item)}
              onBlur={(e) => {
                if (e.target.value.trim())
                  s.updateInventory(item.id, { category: e.target.value.trim() });
              }}
            />
          </label>
          <label className="kitchen-label">
            Use by, optional
            <input
              className="field mt-1"
              aria-label={`${item.name} use by`}
              type="date"
              value={item.useBy ?? ""}
              onChange={(e) => s.updateInventory(item.id, { useBy: e.target.value || undefined })}
            />
          </label>
        </div>
        <label className="flex items-center gap-2 min-h-11 text-sm mt-3">
          <input
            type="checkbox"
            checked={item.cadence === "staple"}
            onChange={(e) =>
              s.updateInventory(item.id, { cadence: e.target.checked ? "staple" : "weekly" })
            }
          />
          Include in my staple check
        </label>
        <label className="kitchen-label block mt-2">
          Notes
          <input
            className="field mt-1"
            aria-label={`${item.name} inventory notes`}
            value={item.notes}
            onChange={(e) => s.updateInventory(item.id, { notes: e.target.value })}
          />
        </label>
      </div>
    </details>
  );
}
