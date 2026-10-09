import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Check, Flag, MapPin, Pencil, X } from "lucide-react";
import { localDate, recordDate } from "@/lib/daylight/dates";
import { GROUPS, REGIONS, SUBS, muscleName, subsOf } from "@/lib/daylight/muscles";
import { noteArea, observationsForArea } from "@/lib/daylight/bodyNotes";
import { useDaylight } from "@/lib/daylight/store";
import type { Observation } from "@/lib/daylight/types";
import { MapFigure, type MapLevel } from "./MapFigure";
import { Button, Eyebrow, Segmented } from "./ui";

type Side = NonNullable<Observation["context"]["bodySide"]> | "";
export function BodyJournal() {
  const s = useDaylight();
  const [area, setArea] = useState<string>(s.selectedMuscleId ?? "");
  const [level, setLevel] = useState<MapLevel>("region");
  const [date, setDate] = useState(localDate());
  const [side, setSide] = useState<Side>("");
  const [text, setText] = useState("");
  const [flag, setFlag] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [filterDate, setFilterDate] = useState("");
  const [saved, setSaved] = useState("");
  const panel = useRef<HTMLElement>(null);
  const atlas = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!area || window.innerWidth >= 768) return;
    const frame = requestAnimationFrame(() =>
      panel.current?.scrollIntoView({ block: "start", behavior: "instant" }),
    );
    return () => cancelAnimationFrame(frame);
  }, [area]);
  const notes = useMemo(
    () => observationsForArea(s.observations, area, filterDate),
    [s.observations, area, filterDate],
  );
  const choose = (id: string) => {
    setArea(id);
    setSaved("");
    if (window.innerWidth < 768)
      requestAnimationFrame(() =>
        panel.current?.scrollIntoView({ block: "start", behavior: "instant" }),
      );
  };
  const reset = () => {
    setText("");
    setFlag(false);
    setEditing(null);
    setDate(localDate());
    setSide("");
  };
  const save = () => {
    if (!area || !date || date > localDate() || !text.trim()) return;
    const context = {
      muscleId: area,
      date,
      bodySide: side || undefined,
      weekday: new Date(`${date}T12:00:00`).getDay(),
    };
    if (editing) s.updateNote(editing, { text: text.trim(), forNextPlan: flag, context });
    else s.addNote({ text, kind: "general", forNextPlan: flag, context });
    setSaved(`Saved to ${muscleName(area)} · ${recordDate(date)}`);
    setFilterDate("");
    reset();
  };
  const edit = (n: Observation) => {
    setArea(noteArea(n) ?? "");
    setDate(n.context.date);
    setSide(n.context.bodySide ?? "");
    setText(n.text);
    setFlag(Boolean(n.forNextPlan));
    setEditing(n.id);
    setSaved("");
    panel.current?.scrollIntoView({ block: "start", behavior: "instant" });
  };
  const selectedParts = new Set(area ? subsOf(area) : []);
  const selected = (id: string) => Boolean(area && subsOf(id).every((x) => selectedParts.has(x)));
  const hasNotes = (id: string) => observationsForArea(s.observations, id).length > 0;
  return (
    <div className="body-journal">
      <section ref={atlas} className="body-atlas" aria-label="Choose a body area">
        <div className="atlas-heading">
          <div>
            <Eyebrow>Select an area</Eyebrow>
            <h2>Your body, over time</h2>
          </div>
          <MapPin className="size-5 text-accent" />
        </div>
        <p className="text-sm text-ink-soft mt-2">
          Tap a muscle to write about it or read your past observations.
        </p>
        <div className="mt-4">
          <Segmented<MapLevel>
            label="Body area detail"
            value={level}
            onChange={setLevel}
            options={[
              { id: "group", label: "Groups" },
              { id: "region", label: "Muscles" },
              { id: "sub", label: "Detail" },
            ]}
          />
        </div>
        <div className="journal-figures" data-testid="journal-map">
          {(["front", "back"] as const).map((view) => (
            <MapFigure
              key={view}
              view={view}
              level={level}
              showLabel
              className="w-full h-auto"
              selected={area}
              fill={(id) =>
                selected(id)
                  ? "var(--accent)"
                  : hasNotes(id)
                    ? "var(--journal-noted)"
                    : "var(--journal-idle)"
              }
              onSelect={choose}
            />
          ))}
        </div>
        <p className="atlas-key">
          <span>
            <i style={{ background: "var(--accent)" }} />
            Selected area
          </span>
          <span>
            <i style={{ background: "var(--journal-noted)" }} />
            Has observations
          </span>
        </p>
        <label className="block mt-4 text-sm font-semibold" htmlFor="journal-area">
          Or choose an area by name
        </label>
        <select
          id="journal-area"
          className="field mt-2"
          value={area}
          onChange={(e) => choose(e.target.value)}
        >
          <option value="">All areas · review observations</option>
          <optgroup label="Muscle groups">
            {GROUPS.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name} · whole group
              </option>
            ))}
          </optgroup>
          <optgroup label="Muscles">
            {REGIONS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </optgroup>
          <optgroup label="Detailed anatomy">
            {SUBS.map((x) => (
              <option key={x.id} value={x.id}>
                {x.name}
              </option>
            ))}
          </optgroup>
        </select>
        <p className="mt-3 text-xs text-ink-soft">
          The map locates your notes. Colour here does not indicate training, pain, or recovery.
        </p>
      </section>
      <section ref={panel} className="journal-panel" aria-label="Area observations">
        <div className="journal-area-heading">
          <div>
            <Eyebrow>{area ? "Selected area" : "Body observations"}</Eyebrow>
            <h2 data-testid="journal-area-name">
              {area ? muscleName(area) : "What did you notice?"}
            </h2>
            {area ? (
              <button
                type="button"
                className="journal-change-area"
                onClick={() =>
                  atlas.current?.scrollIntoView({ block: "start", behavior: "instant" })
                }
              >
                Choose another area ↑
              </button>
            ) : null}
          </div>
          {area ? (
            <button
              type="button"
              className="tap icon-button"
              aria-label="Review all areas"
              onClick={() => {
                setArea("");
                reset();
              }}
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>
        {area ? (
          <div className="journal-composer">
            <h3 className="font-semibold text-base">
              {editing ? "Edit observation" : "Add an observation"}
            </h3>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <label className="text-sm font-medium">
                Date
                <input
                  aria-label="Observation date"
                  className="field mt-1"
                  type="date"
                  max={localDate()}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </label>
              <label className="text-sm font-medium">
                Side
                <select
                  aria-label="Body side"
                  className="field mt-1"
                  value={side}
                  onChange={(e) => setSide(e.target.value as Side)}
                >
                  <option value="">Not specified</option>
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                  <option value="both">Both sides</option>
                </select>
              </label>
            </div>
            <label className="block mt-3 text-sm font-medium" htmlFor="body-observation">
              What did you notice in this area?
            </label>
            <textarea
              id="body-observation"
              className="field mt-1 min-h-28 py-3"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="A sensation, a change in movement, or something to remember…"
            />
            <div className="flex flex-wrap justify-between items-center gap-3 mt-3">
              <label className="flex items-center gap-2 min-h-11 text-sm">
                <input
                  type="checkbox"
                  checked={flag}
                  onChange={(e) => setFlag(e.target.checked)}
                  className="size-4 accent-accent"
                />
                Consider for the next plan
              </label>
              <div className="flex gap-2">
                {editing ? (
                  <Button tone="ghost" size="sm" onClick={reset}>
                    Cancel edit
                  </Button>
                ) : null}
                <Button
                  onClick={save}
                  disabled={!text.trim() || !date || date > localDate()}
                  data-testid="save-body-note"
                >
                  {editing ? "Save changes" : "Save observation"}
                  <Check className="size-4" />
                </Button>
              </div>
            </div>
            <p className="mt-3 text-xs text-ink-soft">
              Save what happened first. Flag it if you want to consider a change later.
            </p>
          </div>
        ) : (
          <div className="journal-start">
            <MapPin className="size-7 text-accent" />
            <p>Select a muscle or group to add a note.</p>
            <span>Your notes stay attached to that area and the date you choose.</span>
          </div>
        )}
        {saved ? (
          <p role="status" className="journal-saved">
            <Check className="size-4" />
            {saved}
          </p>
        ) : null}
        <div className="journal-history-heading">
          <h3>
            Recorded observations <span>{notes.length}</span>
          </h3>
          <label className="text-xs text-ink-soft">
            Filter by date
            <input
              aria-label="Filter observations by date"
              className="field mt-1"
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </label>
          {filterDate ? (
            <Button tone="ghost" size="sm" onClick={() => setFilterDate("")}>
              Clear
            </Button>
          ) : null}
        </div>
        <div className="journal-timeline" data-testid="body-observations">
          {notes.length ? (
            notes.map((n) => (
              <article key={n.id} className="journal-entry">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <time dateTime={n.context.date}>{recordDate(n.context.date)}</time>
                    <p className="text-sm font-semibold mt-1">
                      {muscleName(noteArea(n)!)}
                      {n.context.bodySide
                        ? ` · ${n.context.bodySide === "both" ? "Both sides" : n.context.bodySide === "left" ? "Left" : "Right"}`
                        : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="tap icon-button"
                    onClick={() => edit(n)}
                    aria-label={`Edit observation from ${n.context.date}`}
                  >
                    <Pencil className="size-4" />
                  </button>
                </div>
                <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap break-words">
                  {n.text}
                </p>
                <button
                  type="button"
                  className="tap note-flag"
                  aria-pressed={Boolean(n.forNextPlan)}
                  onClick={() => s.updateNote(n.id, { forNextPlan: !n.forNextPlan })}
                >
                  <Flag className="size-3.5" />
                  {n.forNextPlan ? "Flagged for next plan" : "Consider for next plan"}
                </button>
              </article>
            ))
          ) : (
            <p className="journal-empty">
              {filterDate
                ? "No observations on this date."
                : area
                  ? `No observations for ${muscleName(area)} yet. Your first note will appear here.`
                  : "No body observations yet. Choose an area on the map to begin."}
            </p>
          )}
        </div>
        {area ? (
          <button
            type="button"
            className="tap journal-guide-link"
            onClick={() => s.setBody({ bodyWorkspace: "training", selectedMuscleId: area })}
          >
            Explore exercises for {muscleName(area)}
            <ArrowRight className="size-4" />
          </button>
        ) : null}
      </section>
    </div>
  );
}
