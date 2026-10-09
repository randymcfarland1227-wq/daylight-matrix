import { useState } from "react";
import { GROUPS, resolveMuscle, subInfo } from "@/lib/daylight/muscles";
import { Chip } from "./ui";

/** Two-level picker: tap a group to pick it whole, or open it to pick specific parts. */
export function MusclePicker({ value, onChange, multi = true }: { value: string[]; onChange: (v: string[]) => void; multi?: boolean }) {
  const [open, setOpen] = useState<string | null>(() => {
    const first = value[0] ? resolveMuscle(value[0]) : null;
    return first?.group ?? null;
  });
  const toggle = (id: string) => {
    if (value.includes(id)) onChange(value.filter((x) => x !== id));
    else onChange(multi ? [...value, id] : [id]);
  };
  const groupActive = (gid: string) => value.includes(gid) || value.some((v) => resolveMuscle(v)?.group === gid);
  return (
    <div data-testid="muscle-picker">
      <div className="flex flex-wrap gap-1.5">
        {GROUPS.map((g) => (
          <Chip
            key={g.id}
            active={groupActive(g.id)}
            tone="teal"
            onClick={() => {
              setOpen(open === g.id ? null : g.id);
            }}
          >
            {g.name}
            {value.filter((v) => resolveMuscle(v)?.group === g.id).length ? ` · ${value.filter((v) => resolveMuscle(v)?.group === g.id).length}` : ""}
          </Chip>
        ))}
      </div>
      {open ? (
        <div className="mt-2 rounded-lg bg-surface-2 p-2.5" data-testid="muscle-picker-parts">
          <div className="flex flex-wrap gap-1.5">
            <Chip active={value.includes(open)} tone="sun" onClick={() => toggle(open)}>
              Whole group
            </Chip>
            {GROUPS.find((g) => g.id === open)!.subs.map((sid) => (
              <Chip key={sid} active={value.includes(sid)} tone="sun" onClick={() => toggle(sid)}>
                {subInfo(sid)?.name}
              </Chip>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
