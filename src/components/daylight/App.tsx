import { useEffect, useState } from "react";
import { useDaylight } from "@/lib/daylight/store";
import { Body } from "./Body";
import { Food } from "./Food";
import { Learn } from "./Learn";
import { Overlays } from "./Overlays";
import { Goals, History, Review } from "./Review";
import { Opening, Shell } from "./Shell";
import { Today } from "./Today";
import { Training } from "./Training";

export function DaylightApp() {
  const [ready, setReady] = useState(false);
  const view = useDaylight((state) => state.view);
  useEffect(() => {
    void Promise.resolve(useDaylight.persist.rehydrate()).finally(() => setReady(true));
  }, []);
  if (!ready) return <Opening />;
  return (
    <Shell>
      {view === "today" ? <Today /> : null}
      {view === "training" ? <Training /> : null}
      {view === "food" ? <Food /> : null}
      {view === "body" ? <Body /> : null}
      {view === "learn" ? <Learn /> : null}
      {view === "review" ? <Review /> : null}
      {view === "history" ? <History /> : null}
      {view === "goals" ? <Goals /> : null}
      <Overlays />
    </Shell>
  );
}
