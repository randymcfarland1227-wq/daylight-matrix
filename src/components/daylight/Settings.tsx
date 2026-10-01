import { useEffect, useRef, useState } from "react";
import { Download, Upload, Plus, Smartphone } from "lucide-react";
import { clock, localDate, prettyDate } from "@/lib/daylight/dates";
import { useDaylight } from "@/lib/daylight/store";
import type { ThemeChoice } from "@/lib/daylight/types";
import { Button, Card, Chip, PageHead, Segmented, Stepper, downloadText } from "./ui";

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

export function Settings() {
  const s = useDaylight();
  const file = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState("");
  const [install, setInstall] = useState<BIPEvent | null>(null);
  useEffect(() => {
    const h = (e: Event) => {
      e.preventDefault();
      setInstall(e as BIPEvent);
    };
    window.addEventListener("beforeinstallprompt", h);
    return () => window.removeEventListener("beforeinstallprompt", h);
  }, []);
  const standalone = typeof window !== "undefined" && window.matchMedia?.("(display-mode: standalone)").matches;
  const sessions = s.sessions.slice().sort((a, b) => b.startedAt.localeCompare(a.startedAt)).slice(0, 12);

  return (
    <div className="space-y-4">
      <PageHead eyebrow="This device" title="Settings & backup" />

      <Card>
        <h2 className="font-display text-xl">Targets — yours to set</h2>
        <p className="text-sm text-ink-soft">These are the numbers the app measures against. Change them any time; nothing here is advice.</p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <Num label="Protein goal, training days (g)" value={s.proteinGoal} onSave={(v) => s.setProteinGoal(v)} step={5} min={0} max={400} />
          <div>
            <Num label="Protein goal, recovery days (g)" value={s.proteinGoalRest ?? s.proteinGoal} onSave={(v) => s.setProteinGoalRest(v)} step={5} min={0} max={400} />
            {s.proteinGoalRest != null ? (
              <Button size="sm" tone="ghost" className="-ml-2 mt-1" onClick={() => s.setProteinGoalRest(null)}>Use the training-day number</Button>
            ) : <p className="mt-1 text-xs text-ink-faint">Currently same as training days. Change it to set a separate number.</p>}
          </div>
          <Num label="Water goal (oz / day)" value={s.waterGoal} onSave={(v) => s.setWaterGoal(v)} step={8} min={8} max={300} />
          <Num label="Weekly sets per muscle area" value={s.weeklyTarget} onSave={(v) => s.setWeeklyTarget(v)} step={1} min={2} max={30} />
          <Num label="Default rest timer (sec)" value={s.restDefault} onSave={(v) => s.setRestDefault(v)} step={15} min={15} max={600} />
          <div>
            <span className="eyebrow">Units</span>
            <div className="mt-1">
              <Segmented<"lb" | "kg"> label="Units" value={s.units} onChange={s.setUnits} options={[{ id: "lb", label: "lb" }, { id: "kg", label: "kg" }]} />
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="font-display text-xl">Look</h2>
        <div className="mt-2">
          <Segmented<ThemeChoice> label="Theme" value={s.theme} onChange={s.setTheme} options={[{ id: "dark", label: "Dusk (dark)" }, { id: "light", label: "Daylight (light)" }, { id: "auto", label: "Match device" }]} />
        </div>
        <label className="mt-4 flex min-h-12 cursor-pointer items-center justify-between gap-3 text-sm">
          <span>
            <span className="block font-medium">Open Train straight into gym mode</span>
            <span className="block text-xs text-ink-soft">On training days, the Train tab opens today's session as a focused full-screen flow. The full overview is one tap away.</span>
          </span>
          <input type="checkbox" className="size-5 accent-[var(--sun)]" checked={s.gymDefault} onChange={(e) => s.setGymDefault(e.target.checked)} data-testid="gym-default-toggle" />
        </label>
      </Card>

      <Card>
        <div className="flex items-center gap-2">
          <Smartphone className="size-5 text-forest" />
          <h2 className="font-display text-xl">Home screen</h2>
        </div>
        {standalone ? (
          <p className="mt-1 text-sm text-ink-soft">Running as an installed app.</p>
        ) : install ? (
          <Button className="mt-2" onClick={() => install.prompt()}>Install Daylight Matrix</Button>
        ) : (
          <p className="mt-1 text-sm text-ink-soft">iPhone: Share → Add to Home Screen. Android: browser menu → Install app / Add to Home screen.</p>
        )}
      </Card>

      <Card>
        <h2 className="font-display text-xl">Back up everything</h2>
        <p className="text-sm text-ink-soft">Plan versions, session logs, notes, food, pantry and settings. {s.saveStatus}.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button tone="sun" onClick={() => downloadText(`daylight-matrix-backup-${localDate()}.json`, s.exportJson())}>
            <Download className="size-4" /> Download backup
          </Button>
          <Button tone="outline" onClick={() => file.current?.click()}>
            <Upload className="size-4" /> Restore from file
          </Button>
          <input
            ref={file}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            aria-label="Restore backup file"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              if (window.confirm("Restore this backup? It replaces what’s on this device now (a download first is smart).")) setMsg(s.importJson(await f.text()));
              e.target.value = "";
            }}
          />
        </div>
        {msg ? <p className="mt-2 text-sm font-semibold text-forest" role="status">{msg}</p> : null}
        <p className="mt-2 text-xs text-ink-faint">Older backups (from the previous version) restore fine; they are upgraded automatically.</p>
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl">Goals</h2>
          <Button size="sm" tone="soft" onClick={() => s.setOverlay({ type: "goal" })}><Plus className="size-4" /> Add</Button>
        </div>
        {s.goals.length === 0 ? <p className="mt-1 text-sm text-ink-soft">None yet. Add what you want the plan to move toward.</p> : null}
        <ul className="mt-2 space-y-2">
          {s.goals.map((g) => (
            <li key={g.id} className="rounded-xl border border-line p-3 text-sm">
              <b>{g.name}</b>
              {g.improvement ? <p className="text-ink-soft">{g.improvement}</p> : null}
              {g.check ? <p className="text-ink-faint">Check: {g.check}</p> : null}
            </li>
          ))}
        </ul>
        <Button tone="ghost" size="sm" className="mt-2 -ml-2" onClick={() => s.setOverlay({ type: "purpose" })}>Edit your purpose line</Button>
      </Card>

      <Card>
        <h2 className="font-display text-xl">History</h2>
        <ul className="mt-2 divide-y divide-line text-sm">
          {sessions.map((x) => (
            <li key={x.id} className="flex items-baseline gap-2 py-2">
              <span className="w-28 shrink-0 text-ink-faint">{prettyDate(x.localDate).split(",")[0]}</span>
              <span className="flex-1 font-semibold">{x.name}</span>
              <span className="text-ink-soft">{x.logs.filter((l) => l.status === "done").length} sets</span>
            </li>
          ))}
          {sessions.length === 0 ? <li className="py-2 text-ink-soft">No sessions yet.</li> : null}
        </ul>
        {s.activities.length ? (
          <>
            <h3 className="mt-4 font-display text-lg">Other activity</h3>
            <ul className="mt-1 divide-y divide-line text-sm">
              {s.activities.slice().reverse().slice(0, 8).map((a) => (
                <li key={a.id} className="flex gap-2 py-1.5">
                  <span className="w-28 shrink-0 text-ink-faint">{prettyDate(a.localDate).split(",")[0]} {clock(a.time)}</span>
                  <span className="flex-1">{a.name}</span>
                  <span className="text-ink-soft">{a.minutes ? `${a.minutes} min` : ""}</span>
                </li>
              ))}
            </ul>
          </>
        ) : null}
        <p className="mt-3 text-xs text-ink-faint">Data format v{s.schemaVersion}. A raw copy of your pre-upgrade data is kept on this device under “daylight-matrix-v1.pre-v2-backup”.</p>
      </Card>
      <div className="flex justify-center gap-2 pb-2">
        <Chip onClick={() => s.setView("learn")}>Learn</Chip>
      </div>
    </div>
  );
}

function Num({ label, value, onSave, step, min, max }: { label: string; value: number | null; onSave: (v: number) => void; step: number; min: number; max: number }) {
  const [text, setText] = useState(String(value ?? ""));
  useEffect(() => setText(String(value ?? "")), [value]);
  return (
    <Stepper
      label={label}
      value={text}
      step={step}
      min={min}
      onChange={(v) => {
        setText(v);
        const n = Number(v);
        if (v.trim() !== "" && Number.isFinite(n) && n >= min && n <= max) onSave(n);
      }}
    />
  );
}
