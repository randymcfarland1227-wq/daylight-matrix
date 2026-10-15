import { useEffect, useRef, useState } from "react";
import { useDaylight } from "@/lib/daylight/store";
import { VIEW_SLUG, BODY_TABS, TRAINING_TABS, buildHash, parseHash, pushHash, setTitle } from "@/lib/daylight/hashRoute";
import type { TrainingTab } from "@/lib/daylight/types";
import { Body } from "./Body";
import { Food } from "./Food";
import { GymMode } from "./GymMode";
import { Learn } from "./Learn";
import { Notes } from "./Notes";
import { Overlays } from "./Overlays";
import { Settings } from "./Settings";
import { Opening, Shell } from "./Shell";
import { Today } from "./Today";
import { Train } from "./Train";

export function DaylightApp() {
  const [ready, setReady] = useState(false);
  const view = useDaylight((state) => state.view);
  const theme = useDaylight((state) => state.theme);
  const gymMode = useDaylight((state) => state.gymMode);

  useEffect(() => {
    void Promise.resolve(useDaylight.persist.rehydrate()).finally(() => setReady(true));
  }, []);

  useEffect(() => {
    const apply = () => {
      const dark = theme === "dark" || (theme === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches);
      document.documentElement.classList.toggle("dark", dark);
      document.querySelector('meta[name="theme-color"]')?.setAttribute("content", "#2f4f46");
    };
    apply();
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme]);

  useEffect(() => {
    if (!ready) return;
    // Home-screen shortcuts: ./?go=training | note | food
    const go = new URLSearchParams(location.search).get("go");
    const st = useDaylight.getState();
    if (go === "training") {
      st.setTrainDay(new Date().getDay());
      st.setView("training");
    } else if (go === "food") st.setView("food");
    else if (go === "note") st.setOverlay({ type: "note" });
    if (go) history.replaceState(null, "", location.pathname);
  }, [ready]);

  useEffect(() => {
    if (!ready) return;
    if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1")) {
      navigator.serviceWorker.register("./sw.js").catch(() => undefined);
    }
  }, [ready]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [view]);

  // Per-section URLs: restore from the hash on load and on Back/Forward; mirror the store into the hash.
  const trainingTab = useDaylight((state) => state.trainingTab);
  const bodyWorkspace = useDaylight((state) => state.bodyWorkspace);
  useEffect(() => {
    if (!ready) return;
    const apply = () => {
      const { view: v, sub } = parseHash();
      if (!v) return;
      const st = useDaylight.getState();
      if (v === "training") {
        const tab = (TRAINING_TABS as string[]).includes(sub) ? (sub as TrainingTab) : "session";
        if (st.trainingTab !== tab) st.setTrainingTab(tab);
      }
      if (v === "body") {
        const ws = (BODY_TABS as readonly string[]).includes(sub) ? (sub as (typeof BODY_TABS)[number]) : "journal";
        if (st.bodyWorkspace !== ws) st.setBody({ bodyWorkspace: ws });
      }
      if (st.view !== v && !(v === "settings" && ["history", "goals", "review"].includes(st.view))) st.setView(v);
    };
    if (!new URLSearchParams(location.search).get("go")) apply();
    window.addEventListener("popstate", apply);
    window.addEventListener("hashchange", apply);
    return () => {
      window.removeEventListener("popstate", apply);
      window.removeEventListener("hashchange", apply);
    };
  }, [ready]);
  const synced = useRef(false);
  useEffect(() => {
    if (!ready) return;
    setTitle(view);
    const cur = parseHash();
    // First run after load: the hash is the source of truth; wait until the store has caught up with it.
    if (!synced.current) {
      if (cur.view && cur.view !== view && !new URLSearchParams(location.search).get("go")) return;
      synced.current = true;
      if (cur.view) return;
    }
    const sub =
      view === "training" ? (trainingTab === "session" ? "" : trainingTab)
      : view === "body" ? (bodyWorkspace === "journal" ? "" : bodyWorkspace)
      : VIEW_SLUG[view] === cur.slug ? cur.sub : "";
    pushHash(buildHash(view, sub || undefined), !location.hash);
  }, [ready, view, trainingTab, bodyWorkspace]);

  if (!ready) return <Opening />;
  if (gymMode) return <GymMode key={gymMode.weekday} weekday={gymMode.weekday} />;
  return (
    <Shell>
      <div key={view} className="animate-rise">
        {view === "today" ? <Today /> : null}
        {view === "training" ? <Train /> : null}
        {view === "body" ? <Body /> : null}
        {view === "food" ? <Food /> : null}
        {view === "notes" ? <Notes /> : null}
        {view === "learn" ? <Learn /> : null}
        {view === "settings" || view === "history" || view === "goals" || view === "review" ? <Settings /> : null}
      </div>
      <Overlays />
    </Shell>
  );
}
