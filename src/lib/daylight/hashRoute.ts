import { useEffect, useState } from "react";
import type { AppView, TrainingTab } from "./types";

/** Per-section URLs (#/food, #/train/week, #/body/learn …) that survive refresh, bookmarks and Back on GitHub Pages. */
export const VIEW_SLUG: Record<AppView, string> = {
  today: "today", training: "train", body: "body", food: "food", notes: "notes", learn: "learn",
  settings: "settings", history: "settings", goals: "settings", review: "settings",
};
const SLUG_VIEW: Record<string, AppView> = { today: "today", train: "training", body: "body", food: "food", notes: "notes", learn: "learn", settings: "settings" };
export const VIEW_TITLE: Record<string, string> = { today: "Today", train: "Train", body: "Body", food: "Food", notes: "Notes", learn: "Learn", settings: "Settings" };
export const TRAINING_TABS: TrainingTab[] = ["session", "week", "moves", "pt", "plan"];
export const BODY_TABS = ["journal", "learn", "training", "joints"] as const;

export function parseHash(hash = typeof location === "undefined" ? "" : location.hash): { view: AppView | null; slug: string; sub: string } {
  const [slug = "", sub = ""] = hash.replace(/^#\/?/, "").split("/").map((p) => decodeURIComponent(p));
  return { view: SLUG_VIEW[slug] ?? null, slug, sub };
}

export function buildHash(view: AppView, sub?: string): string {
  return `#/${VIEW_SLUG[view]}${sub ? `/${encodeURIComponent(sub)}` : ""}`;
}

/** Push a new history entry only when the URL really changes. */
export function pushHash(hash: string, replace = false) {
  if (location.hash === hash) return;
  const url = `${location.pathname}${location.search}${hash}`;
  if (replace) history.replaceState(history.state, "", url);
  else history.pushState(history.state, "", url);
}

export function setTitle(view: AppView) {
  document.title = `${VIEW_TITLE[VIEW_SLUG[view]] ?? "Today"} · Daylight Matrix`;
}

/** Local tab state mirrored in the second hash segment (Food and Notes tabs). */
export function useHashTab<T extends string>(view: AppView, tabs: readonly T[], fallback: T): [T, (t: T) => void] {
  const read = (): T => {
    const p = parseHash();
    return p.view === view && (tabs as readonly string[]).includes(p.sub) ? (p.sub as T) : fallback;
  };
  const [tab, setTab] = useState<T>(read);
  useEffect(() => {
    const on = () => { if (parseHash().view === view) setTab(read()); };
    window.addEventListener("popstate", on);
    window.addEventListener("hashchange", on);
    return () => { window.removeEventListener("popstate", on); window.removeEventListener("hashchange", on); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);
  return [tab, (t: T) => { setTab(t); pushHash(buildHash(view, t === fallback ? undefined : t)); }];
}
