import { useEffect, useState } from "react";
import { useDaylight } from "@/lib/daylight/store";
import { Body } from "./Body";
import { Food } from "./Food";
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

  useEffect(() => {
    void Promise.resolve(useDaylight.persist.rehydrate()).finally(() => setReady(true));
  }, []);

  useEffect(() => {
    const apply = () => {
      const dark = theme === "dark" || (theme === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches);
      document.documentElement.classList.toggle("dark", dark);
      document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? "#0d1714" : "#f7f0e3");
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

  if (!ready) return <Opening />;
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
