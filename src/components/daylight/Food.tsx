import { useMemo, useState } from "react";
import { AlertTriangle, CalendarPlus, Check, Droplets, Flame, Leaf, Plus, ShoppingBasket, Sparkles, Trash2, Utensils, Wand2 } from "lucide-react";
import { GROCERY_SHEET } from "@/lib/daylight/food-seed";
import { WEEKDAY_NAMES, clock, localDate, shiftDate } from "@/lib/daylight/dates";
import { DAY_KIND_LABEL, dayKind, fuelingNote, isUseSoon, mealsUsing, plannedProtein, prepNeeds, sumProtein, suggestWeek, waterToday } from "@/lib/daylight/foodplan";
import { mealReady, stockFor } from "@/lib/daylight/logic";
import { statusLabel, useDaylight } from "@/lib/daylight/store";
import type { InventoryStatus } from "@/lib/daylight/types";
import { Badge, Button, Card, Chip, Empty, Eyebrow, PageHead, Ring, Segmented, cn } from "./ui";
import { mealSlotNow } from "./Overlays";

type Tab = "today" | "week" | "pantry" | "shop" | "recipes";

export function Food() {
  const [tab, setTab] = useState<Tab>("today");
  const state = useDaylight();
  const needShop = state.shopping.filter((s) => !s.checked).length;
  return (
    <div>
      <PageHead eyebrow="Fuel for the plan" title="Food" />
      <Segmented<Tab>
        label="Food sections"
        value={tab}
        onChange={setTab}
        options={[
          { id: "today", label: "Today" },
          { id: "week", label: "Plan & prep" },
          { id: "pantry", label: "Pantry" },
          { id: "shop", label: `Shop${needShop ? ` · ${needShop}` : ""}` },
          { id: "recipes", label: "Recipes" },
        ]}
      />
      <div className="mt-4">
        {tab === "today" ? <TodayFood go={setTab} /> : null}
        {tab === "week" ? <WeekPlan go={setTab} /> : null}
        {tab === "pantry" ? <Pantry /> : null}
        {tab === "shop" ? <Shop /> : null}
        {tab === "recipes" ? <Recipes /> : null}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ Today */

export function useFoodNumbers() {
  const s = useDaylight();
  const today = localDate();
  const wd = new Date().getDay();
  const kind = dayKind(wd);
  const goal = kind === "recovery" && s.proteinGoalRest ? s.proteinGoalRest : s.proteinGoal;
  const protein = sumProtein(s.foodLogs, today);
  const water = waterToday(s.fluidLogs, today);
  return { today, wd, kind, goal, protein, water, waterGoal: s.waterGoal };
}

export function ProteinWaterRings({ size = 84 }: { size?: number }) {
  const n = useFoodNumbers();
  return (
    <div className="flex items-center gap-4">
      <Ring value={n.goal ? n.protein.total / n.goal : 0} size={size} color="var(--copper)" label={`Protein ${n.protein.total} of ${n.goal} grams`}>
        <span className="font-display text-xl tabular-nums">{n.protein.total}</span>
        <span className="text-[0.6rem] font-bold uppercase text-ink-soft">/{n.goal} g</span>
      </Ring>
      <Ring value={n.waterGoal ? n.water / n.waterGoal : 0} size={size} color="var(--teal)" label={`Water ${n.water} of ${n.waterGoal} ounces`}>
        <span className="font-display text-xl tabular-nums">{Math.round(n.water)}</span>
        <span className="text-[0.6rem] font-bold uppercase text-ink-soft">/{n.waterGoal} oz</span>
      </Ring>
    </div>
  );
}

function TodayFood({ go }: { go: (t: Tab) => void }) {
  const s = useDaylight();
  const n = useFoodNumbers();
  const note = fuelingNote(n.kind, Boolean(s.proteinGoalRest));
  const todayFood = s.foodLogs.filter((l) => l.localDate === n.today);
  const todayWater = s.fluidLogs.filter((l) => l.localDate === n.today);
  const planned = (s.mealPlan[String(n.wd)] ?? []).map((id) => s.savedMeals.find((m) => m.id === id)).filter(Boolean);
  const eatenIds = new Set(todayFood.map((l) => l.mealId));
  const soon = s.inventory.filter((i) => isUseSoon(i, n.today));
  const ready = s.savedMeals.filter((m) => mealReady(m, s.inventory)).slice(0, 3);
  return (
    <div className="space-y-4">
      <Card className="animate-rise">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Badge tone={n.kind === "heavy" ? "copper" : n.kind === "recovery" ? "teal" : "forest"}>{DAY_KIND_LABEL[n.kind]}</Badge>
            <h2 className="mt-1 font-display text-2xl leading-tight">{note.title}</h2>
          </div>
          <ProteinWaterRings size={78} />
        </div>
        <ul className="mt-2 space-y-1 text-sm text-ink-soft">
          {note.lines.map((l) => (
            <li key={l}>• {l}</li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-ink-faint">General prompts, not nutrition advice. Targets are the numbers you set in Settings.</p>
        {n.protein.unknown > 0 ? <p className="mt-1 text-xs text-ink-soft">{n.protein.unknown} meal{n.protein.unknown > 1 ? "s" : ""} today without a protein number aren’t counted.</p> : null}
      </Card>

      <div className="grid grid-cols-2 gap-2">
        <Button size="lg" onClick={() => s.setOverlay({ type: "log-food" })}>
          <Utensils className="size-5" /> Log food
        </Button>
        <Button size="lg" tone="soft" onClick={() => s.setOverlay({ type: "log-drink" })}>
          <Droplets className="size-5" /> Log drink
        </Button>
      </div>
      <div className="grid grid-cols-4 gap-2" aria-label="Quick water">
        {[8, 12, 16, 24].map((oz) => (
          <Button key={oz} tone="outline" size="sm" onClick={() => (s.addWater(oz), s.showToast(`${oz} oz water`))}>
            +{oz} oz
          </Button>
        ))}
      </div>

      {planned.length ? (
        <Card>
          <h3 className="font-display text-lg">Planned for today</h3>
          <ul className="mt-2 space-y-1.5">
            {planned.map((m) =>
              m ? (
                <li key={m.id} className="flex items-center gap-2 rounded-xl border border-line px-3 py-2">
                  {eatenIds.has(m.id) ? <Check className="size-5 text-forest" strokeWidth={3} /> : <span className="size-5 rounded-full border border-line" />}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{m.name}</p>
                    <p className="text-xs text-ink-soft">{m.proteinGrams != null ? `${m.proteinGrams} g protein` : "no protein number"}{m.minutes != null ? ` · ${m.minutes} min` : ""}</p>
                  </div>
                  {!eatenIds.has(m.id) ? (
                    <Button size="sm" tone="soft" onClick={() => s.logFood({ food: m.name, mealId: m.id, protein: m.proteinGrams ?? null, estimate: false, slot: mealSlotNow() })}>
                      Ate it
                    </Button>
                  ) : null}
                </li>
              ) : null,
            )}
          </ul>
        </Card>
      ) : (
        <Card className="text-center">
          <p className="font-display text-lg">Nothing planned for today</p>
          <Button tone="outline" className="mt-2" onClick={() => go("week")}>
            <CalendarPlus className="size-4" /> Plan the week
          </Button>
        </Card>
      )}

      {soon.length ? (
        <Card className="border-copper/40">
          <div className="flex items-center gap-2">
            <Leaf className="size-5 text-copper" />
            <h3 className="font-display text-lg">Use soon — don’t waste it</h3>
          </div>
          <ul className="mt-2 space-y-1.5">
            {soon.slice(0, 4).map((i) => {
              const ms = mealsUsing(i, s.savedMeals).slice(0, 2);
              return (
                <li key={i.id} className="text-sm">
                  <b>{i.name}</b>
                  {ms.length ? <span className="text-ink-soft"> → {ms.map((m) => m.name).join(" · ")}</span> : null}
                </li>
              );
            })}
          </ul>
          <Button tone="ghost" size="sm" className="mt-1" onClick={() => go("pantry")}>
            Open pantry
          </Button>
        </Card>
      ) : null}

      {ready.length ? (
        <Card>
          <h3 className="font-display text-lg">Ready now (ingredients marked on hand)</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {ready.map((m) => (
              <Chip key={m.id} onClick={() => s.setOverlay({ type: "repeat-meal", mealId: m.id })}>
                + {m.name}
              </Chip>
            ))}
          </div>
        </Card>
      ) : null}

      <Card>
        <h3 className="font-display text-lg">Today’s log</h3>
        {todayFood.length === 0 && todayWater.length === 0 ? <p className="mt-1 text-sm text-ink-soft">Nothing logged yet.</p> : null}
        <ul className="mt-1 divide-y divide-line">
          {todayFood.map((l) => (
            <li key={l.id} className="flex items-baseline gap-2 py-1.5 text-sm">
              <span className="w-16 shrink-0 tabular-nums text-ink-faint">{clock(l.time)}</span>
              <span className="flex-1">
                {l.food}
                {l.slot ? <span className="ml-1 text-xs capitalize text-ink-faint">{l.slot}</span> : null}
              </span>
              <span className="tabular-nums text-ink-soft">{l.proteinGrams != null ? `${l.proteinGrams} g${l.proteinIsEstimate ? " ~" : ""}` : ""}</span>
            </li>
          ))}
          {todayWater.map((l) => (
            <li key={l.id} className="flex items-baseline gap-2 py-1.5 text-sm text-ink-soft">
              <span className="w-16 shrink-0 tabular-nums text-ink-faint">{clock(l.time)}</span>
              <span className="flex-1">{l.beverage}</span>
              <span className="tabular-nums">{l.amountOz} oz</span>
            </li>
          ))}
        </ul>
        {s.undo?.kind === "food" || s.undo?.kind === "fluid" ? (
          <Button tone="ghost" size="sm" onClick={() => s.undoLast()}>
            Undo last
          </Button>
        ) : null}
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ Week plan & prep */

function WeekPlan({ go }: { go: (t: Tab) => void }) {
  const s = useDaylight();
  const today = localDate();
  const [pick, setPick] = useState<number | null>(null);
  const needs = useMemo(() => prepNeeds(s.mealPlan, s.savedMeals, s.inventory, [...WEEKDAY_NAMES]), [s.mealPlan, s.savedMeals, s.inventory]);
  const missing = needs.filter((x) => x.status !== "available");
  const order = [1, 2, 3, 4, 5, 6, 0];
  const todayIdx = new Date().getDay();
  return (
    <div className="space-y-4">
      <Card>
        <p className="text-sm text-ink-soft">Plan meals against your training days. Big lower-body days (Tue, Fri) and recovery (Thu) get their own prompts. Set protein numbers per meal to see each day’s total against your goal.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button tone="sun" onClick={() => (s.setMealPlanAll(suggestWeek(s.savedMeals, s.inventory, s.mealPlan, today)), s.showToast("Filled the empty days"))}>
            <Wand2 className="size-4" /> Suggest my week
          </Button>
          <Button tone="ghost" onClick={() => s.setMealPlanAll({})}>
            Clear
          </Button>
        </div>
      </Card>

      <ul className="stagger grid gap-3 md:grid-cols-2">
        {order.map((d) => {
          const kind = dayKind(d);
          const ids = s.mealPlan[String(d)] ?? [];
          const pp = plannedProtein(s.mealPlan, s.savedMeals, d);
          const goal = kind === "recovery" && s.proteinGoalRest ? s.proteinGoalRest : s.proteinGoal;
          return (
            <li key={d}>
              <Card className={cn("h-full", d === todayIdx && "border-forest/60")}>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-lg">{WEEKDAY_NAMES[d]}</h3>
                  <Badge tone={kind === "heavy" ? "copper" : kind === "recovery" ? "teal" : "plain"}>{DAY_KIND_LABEL[kind]}</Badge>
                  <span className="ml-auto text-xs tabular-nums text-ink-soft">
                    {pp.grams}/{goal} g{pp.unknown ? ` +${pp.unknown}?` : ""}
                  </span>
                </div>
                <ul className="mt-2 space-y-1">
                  {ids.map((id) => {
                    const m = s.savedMeals.find((x) => x.id === id);
                    if (!m) return null;
                    return (
                      <li key={id} className="flex items-center gap-2 rounded-lg bg-surface-2 px-2.5 py-1.5 text-sm">
                        <span className="flex-1 truncate">{m.name}</span>
                        <span className="text-xs text-ink-soft">{m.proteinGrams != null ? `${m.proteinGrams} g` : ""}</span>
                        <button type="button" aria-label={`Remove ${m.name}`} className="tap text-ink-faint" onClick={() => s.unplanMeal(d, id)}>
                          <Trash2 className="size-4" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
                <Button tone="ghost" size="sm" className="mt-1 -ml-2" onClick={() => setPick(pick === d ? null : d)}>
                  <Plus className="size-4" /> Add a meal
                </Button>
                {pick === d ? (
                  <div className="animate-rise mt-1 flex flex-wrap gap-1.5">
                    {s.savedMeals.map((m) => (
                      <Chip key={m.id} onClick={() => (s.planMeal(d, m.id), setPick(null))}>
                        {m.name}
                      </Chip>
                    ))}
                  </div>
                ) : null}
              </Card>
            </li>
          );
        })}
      </ul>

      <Card>
        <div className="flex items-center gap-2">
          <ShoppingBasket className="size-5 text-forest" />
          <h3 className="font-display text-xl">Prep list for the week</h3>
        </div>
        {needs.length === 0 ? (
          <p className="mt-2 text-sm text-ink-soft">Plan some meals above and the ingredients you need show up here.</p>
        ) : (
          <>
            <ul className="mt-2 space-y-1">
              {needs.map((n) => (
                <li key={n.name} className="flex items-start gap-2 text-sm">
                  <Badge tone={n.status === "missing" ? "danger" : n.status === "uncertain" ? "sun" : "forest"}>{n.status === "available" ? "on hand" : n.status === "uncertain" ? "check" : "need"}</Badge>
                  <span className="flex-1">
                    <b>{n.name}</b> <span className="text-ink-faint">· {n.for.join(" · ")}</span>
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                onClick={() => {
                  const added = s.addMissingToShopping(missing.map((m) => m.name));
                  s.showToast(added ? `${added} added to shopping` : "Already on the list");
                  go("shop");
                }}
                disabled={!missing.length}
              >
                <ShoppingBasket className="size-4" /> Add {missing.length} to shopping list
              </Button>
            </div>
          </>
        )}
      </Card>
      <PrepTasks />
    </div>
  );
}

function PrepTasks() {
  const prep = useDaylight((s) => s.prep);
  const setStatus = useDaylight((s) => s.setPrepStatus);
  const makePortion = useDaylight((s) => s.addPreparedFromPrep);
  const add = useDaylight((s) => s.addPrepTask);
  const [t, setT] = useState("");
  return (
    <Card>
      <h3 className="font-display text-xl">Prep tasks</h3>
      <p className="text-sm text-ink-soft">Tick them off on prep day (Thu or Sun works with the plan). Prepared portions show up as ready-to-eat on the Today tab.</p>
      <ul className="mt-2 space-y-2">
        {prep.map((task) => (
          <li key={task.id} className={cn("rounded-xl border border-line p-3", task.status === "done" && "bg-forest/5")}>
            <div className="flex items-start gap-2">
              <button type="button" aria-pressed={task.status === "done"} aria-label={`Mark ${task.title} ${task.status === "done" ? "not done" : "done"}`} onClick={() => setStatus(task.id, task.status === "done" ? "planned" : "done")} className={cn("tap mt-0.5 grid size-7 shrink-0 place-items-center rounded-full border-2", task.status === "done" ? "border-forest bg-forest text-on-forest" : "border-line")}>
                {task.status === "done" ? <Check className="size-4" strokeWidth={3} /> : null}
              </button>
              <div className="min-w-0 flex-1">
                <p className={cn("font-semibold", task.status === "done" && "line-through opacity-70")}>{task.title}</p>
                <p className="text-xs text-ink-soft">{task.detail}</p>
              </div>
              <Button tone="ghost" size="sm" onClick={() => makePortion(task.id)}>
                Portions ready
              </Button>
            </div>
          </li>
        ))}
      </ul>
      <form
        className="mt-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          add(t, "Added by you");
          setT("");
        }}
      >
        <input className="field" placeholder="Add a prep task" value={t} onChange={(e) => setT(e.target.value)} aria-label="New prep task" />
        <Button type="submit">Add</Button>
      </form>
    </Card>
  );
}

/* ------------------------------------------------------------------ Pantry */

function Pantry() {
  const s = useDaylight();
  const today = localDate();
  const [q, setQ] = useState("");
  const [name, setName] = useState("");
  const soon = s.inventory.filter((i) => isUseSoon(i, today));
  const rows = s.inventory.filter((i) => i.name.toLowerCase().includes(q.toLowerCase()));
  const wasted = s.waste.filter((w) => w.date >= shiftDate(today, -29));
  return (
    <div className="space-y-4">
      {soon.length ? (
        <Card className="border-copper/40">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-copper" />
            <h3 className="font-display text-xl">Use soon ({soon.length})</h3>
          </div>
          <ul className="mt-2 space-y-2">
            {soon.map((i) => (
              <li key={i.id} className="rounded-xl border border-line p-3">
                <p className="font-semibold">
                  {i.name} {i.useBy ? <span className="text-xs text-ink-faint">· by {i.useBy}</span> : null}
                </p>
                <p className="text-xs text-ink-soft">{mealsUsing(i, s.savedMeals).slice(0, 3).map((m) => m.name).join(" · ") || "No saved meal uses this yet"}</p>
                <div className="mt-1.5 flex gap-2">
                  <Button size="sm" tone="soft" onClick={() => s.resolveUseSoon(i.id, "used")}>Used it</Button>
                  <Button size="sm" tone="ghost" onClick={() => s.resolveUseSoon(i.id, "tossed")}>Tossed</Button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
      <Card>
        <p className="text-sm text-ink-soft">
          Last 30 days: <b>{wasted.filter((w) => w.outcome === "used").length}</b> used in time · <b>{wasted.filter((w) => w.outcome === "tossed").length}</b> tossed.
        </p>
      </Card>
      <input className="field" placeholder="Search pantry" aria-label="Search pantry" value={q} onChange={(e) => setQ(e.target.value)} />
      <ul className="grid gap-2 md:grid-cols-2">
        {rows.map((item) => (
          <li key={item.id} className="card p-3">
            <div className="flex items-center gap-2">
              <p className="min-w-0 flex-1 truncate font-semibold">{item.name}</p>
              <Badge tone={item.status === "out" ? "danger" : item.status === "low" ? "sun" : item.status === "fine" ? "forest" : "plain"}>{statusLabel(item.status)}</Badge>
            </div>
            <p className="text-xs text-ink-faint">
              {item.storageLocation} · {item.category}
            </p>
            <div className="mt-2 grid grid-cols-[1fr_auto] gap-2">
              <input className="field min-h-10 text-sm" aria-label={`${item.name} quantity`} placeholder="Quantity" value={item.quantity} onChange={(e) => s.updateInventory(item.id, { quantity: e.target.value, status: e.target.value.trim() ? (item.status === "check_amount" ? "fine" : item.status) : "check_amount" })} />
              <select className="field min-h-10 w-auto text-sm" aria-label={`${item.name} status`} value={item.status} onChange={(e) => s.updateInventory(item.id, { status: e.target.value as InventoryStatus })}>
                {(["fine", "use_soon", "use_first", "low", "out", "check_amount"] as InventoryStatus[]).map((st) => (
                  <option key={st} value={st}>
                    {statusLabel(st)}
                  </option>
                ))}
              </select>
            </div>
            <label className="mt-2 flex items-center gap-2 text-xs text-ink-soft">
              Use by
              <input type="date" className="field min-h-9 w-auto text-sm" value={item.useBy ?? ""} onChange={(e) => s.updateInventory(item.id, { useBy: e.target.value || undefined })} />
            </label>
            {item.status === "low" || item.status === "out" ? (
              <Button size="sm" tone="ghost" className="mt-1 -ml-2" onClick={() => (s.addShopping(item.name, "", `${item.name} is ${item.status}`), s.showToast("Added to shopping"))}>
                <ShoppingBasket className="size-4" /> Add to shopping
              </Button>
            ) : null}
          </li>
        ))}
      </ul>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          s.addInventory(name);
          setName("");
        }}
      >
        <input className="field" aria-label="New pantry item" placeholder="Add an item" value={name} onChange={(e) => setName(e.target.value)} />
        <Button type="submit">Add</Button>
      </form>
    </div>
  );
}

/* ------------------------------------------------------------------ Shopping */

function Shop() {
  const s = useDaylight();
  const [name, setName] = useState("");
  const [qty, setQty] = useState("");
  const need = s.shopping.filter((i) => !i.checked);
  const got = s.shopping.filter((i) => i.checked);
  const lowItems = s.inventory.filter((i) => (i.status === "low" || i.status === "out") && !s.shopping.some((x) => !x.checked && x.name.toLowerCase() === i.name.toLowerCase()));
  return (
    <div className="space-y-4">
      {lowItems.length ? (
        <Card className="border-sun/60">
          <p className="text-sm font-bold">{lowItems.length} pantry item{lowItems.length > 1 ? "s are" : " is"} low or out</p>
          <Button className="mt-2" size="sm" tone="sun" onClick={() => lowItems.forEach((i) => s.addShopping(i.name, "", `${i.name} is ${i.status}`))}>
            Add them to the list
          </Button>
        </Card>
      ) : null}
      <Card>
        <h3 className="font-display text-xl">Need ({need.length})</h3>
        {need.length === 0 ? <Empty title="Nothing to buy">Plan meals and tap “Add to shopping list”, or add an item below.</Empty> : null}
        <ul className="mt-2 space-y-1.5">
          {need.map((item) => (
            <li key={item.id} className="flex items-center gap-2">
              <button type="button" aria-label={`Mark ${item.name} bought`} className="tap grid size-8 shrink-0 place-items-center rounded-full border-2 border-line" onClick={() => s.toggleShopping(item.id)} />
              <span className="flex-1 text-base">
                {item.name}
                {item.quantity ? <span className="text-ink-soft"> · {item.quantity}</span> : null}
                <span className="block text-xs text-ink-faint">{item.source}</span>
              </span>
              <button type="button" aria-label={`Remove ${item.name}`} className="tap text-ink-faint" onClick={() => s.removeShopping(item.id)}>
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
        <form
          className="mt-3 grid grid-cols-[1fr_6rem_auto] gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            s.addShopping(name, qty, "Added by you");
            setName("");
            setQty("");
          }}
        >
          <input className="field" aria-label="Shopping item" placeholder="Item" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="field" aria-label="Quantity" placeholder="Qty" value={qty} onChange={(e) => setQty(e.target.value)} />
          <Button type="submit">Add</Button>
        </form>
        <a className="mt-3 inline-block text-sm font-bold text-forest underline" href={GROCERY_SHEET} target="_blank" rel="noreferrer">
          Open your grocery planning sheet
        </a>
      </Card>
      {got.length ? (
        <Card>
          <h3 className="font-display text-lg">Bought ({got.length})</h3>
          <ul className="mt-2 space-y-1">
            {got.map((item) => (
              <li key={item.id} className="flex items-center gap-2 text-sm">
                <button type="button" aria-label={`Move ${item.name} back to need`} className="tap grid size-7 shrink-0 place-items-center rounded-full bg-forest text-on-forest" onClick={() => s.toggleShopping(item.id)}>
                  <Check className="size-4" strokeWidth={3} />
                </button>
                <span className="flex-1 line-through opacity-70">{item.name}</span>
                <Button size="sm" tone="ghost" onClick={() => (s.addShoppingToInventory(item.id), s.removeShopping(item.id))}>
                  Put in pantry
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ Recipes */

function Recipes() {
  const s = useDaylight();
  const [open, setOpen] = useState<string | null>(null);
  const [nm, setNm] = useState("");
  const [ing, setIng] = useState("");
  const [pr, setPr] = useState("");
  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center gap-2">
          <Sparkles className="size-5 text-sun" />
          <h3 className="font-display text-xl">Your meals</h3>
        </div>
        <p className="text-sm text-ink-soft">Add your own protein number per meal — it’s used for the daily total. Pin up to 3 favourites.</p>
        <ul className="mt-3 space-y-2">
          {s.savedMeals.map((m) => {
            const ready = mealReady(m, s.inventory);
            const recipe = s.recipes.find((r) => r.id === m.recipeId);
            const missing = m.ingredientNames.filter((n) => stockFor(n, s.inventory) === "missing");
            return (
              <li key={m.id} className="rounded-xl border border-line p-3">
                <div className="flex items-start gap-2">
                  <button type="button" className="min-w-0 flex-1 text-left" onClick={() => setOpen(open === m.id ? null : m.id)} aria-expanded={open === m.id}>
                    <p className="font-semibold">{m.name}</p>
                    <p className="text-xs text-ink-soft">
                      {m.minutes != null ? `${m.minutes} min` : "time not set"} · {ready ? "ingredients on hand" : missing.length ? `missing ${missing.length}` : "check amounts"}
                      {m.noCook ? " · no cook" : ""}
                    </p>
                  </button>
                  <label className="flex items-center gap-1 text-xs text-ink-soft">
                    <input aria-label={`${m.name} protein grams`} inputMode="numeric" className="field min-h-9 w-16 px-2 text-center text-sm tabular-nums" placeholder="g" value={m.proteinGrams ?? ""} onChange={(e) => s.setMealProtein(m.id, e.target.value.trim() === "" ? null : Number(e.target.value) || 0)} />
                    g
                  </label>
                </div>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  <Button size="sm" tone="soft" onClick={() => s.setOverlay({ type: "repeat-meal", mealId: m.id })}>
                    Log as eaten
                  </Button>
                  <Button size="sm" tone="ghost" onClick={() => s.togglePin(m.id)}>
                    {m.pinned ? "Unpin" : "Pin"}
                  </Button>
                </div>
                {open === m.id ? (
                  <div className="animate-rise mt-2 text-sm">
                    <p>
                      <b>Uses:</b> {m.ingredientNames.join(", ")}
                    </p>
                    {recipe ? (
                      <ol className="mt-1 list-decimal pl-5 text-ink-soft">
                        {recipe.steps.map((st) => (
                          <li key={st}>{st}</li>
                        ))}
                      </ol>
                    ) : null}
                    {missing.length ? (
                      <Button size="sm" tone="outline" className="mt-2" onClick={() => (s.addMissingToShopping(missing), s.showToast("Added to shopping"))}>
                        Add {missing.length} missing to shopping
                      </Button>
                    ) : null}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      </Card>
      <Card>
        <h3 className="font-display text-lg">Add a meal</h3>
        <form
          className="mt-2 grid gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            s.addSavedMeal({ name: nm, ingredientNames: ing.split(",").map((x) => x.trim()).filter(Boolean), proteinGrams: pr.trim() ? Number(pr) || 0 : null, minutes: null, noCook: false });
            setNm("");
            setIng("");
            setPr("");
          }}
        >
          <input className="field" placeholder="Meal name" aria-label="Meal name" value={nm} onChange={(e) => setNm(e.target.value)} />
          <input className="field" placeholder="Ingredients, comma separated" aria-label="Ingredients" value={ing} onChange={(e) => setIng(e.target.value)} />
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <input className="field" placeholder="Protein grams (optional)" aria-label="Protein grams" inputMode="numeric" value={pr} onChange={(e) => setPr(e.target.value)} />
            <Button type="submit" disabled={!nm.trim()}>
              Add
            </Button>
          </div>
        </form>
      </Card>
      <Eyebrow>
        <Flame className="mr-1 inline size-3" />
        Recipes from your original library are kept with their steps.
      </Eyebrow>
    </div>
  );
}
