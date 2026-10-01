import { WEEKDAY_NAMES, localDate } from "./dates";
import { exerciseById } from "./exercises";
import { GROUPS, SUBS, subInfo, muscleName, targetFor, type MuscleId } from "./muscles";
import { dayBlocks } from "./plan";
import type { Observation, PlanVersion, WorkoutSession } from "./types";
import { fmt, loggedVolume, plannedVolume, statusFor, STATUS_LABEL, windowFor } from "./volume";

export type DigestInput = {
  notes: Observation[];
  plan: PlanVersion;
  sessions: WorkoutSession[];
  weeklyTarget: number;
  planContext: string;
  units: string;
  today?: string;
};

export type NoteGroup = { key: string; label: string; notes: Observation[] };

function nameOf(id: string): string {
  return exerciseById(id)?.name ?? "Custom exercise";
}

export function groupNotes(notes: Observation[]) {
  const byExercise = new Map<string, Observation[]>();
  const byMuscle = new Map<string, Observation[]>();
  const general: Observation[] = [];
  for (const n of notes) {
    let placed = false;
    if (n.context.exerciseId) {
      byExercise.set(n.context.exerciseId, [...(byExercise.get(n.context.exerciseId) ?? []), n]);
      placed = true;
    }
    if (n.context.muscleId) {
      byMuscle.set(n.context.muscleId, [...(byMuscle.get(n.context.muscleId) ?? []), n]);
      placed = true;
    }
    if (!placed) general.push(n);
  }
  return {
    exercise: [...byExercise.entries()].map(([key, list]) => ({ key, label: nameOf(key), notes: list })).sort((a, b) => b.notes.length - a.notes.length),
    muscle: [...byMuscle.entries()].map(([key, list]) => ({ key, label: muscleName(key), notes: list })).sort((a, b) => b.notes.length - a.notes.length),
    general,
  };
}

function noteLine(n: Observation): string {
  const bits: string[] = [n.context.date];
  if (n.context.weekday != null) bits[0] = `${n.context.date} ${WEEKDAY_NAMES[n.context.weekday]?.slice(0, 3)}`;
  const tags = n.tags.length ? ` [${n.tags.join("; ")}]` : "";
  const flag = n.forNextPlan ? " ★ for next plan" : "";
  return `- (${bits[0]}) ${n.text.replace(/\s+/g, " ").trim()}${tags}${flag}`;
}

export function lastLogged(sessions: WorkoutSession[], exerciseId: string, units: string): string | null {
  for (const session of sessions.slice().reverse()) {
    for (const slot of session.snapshot) {
      const id = session.chosenExercise[slot.id] ?? slot.exerciseId;
      if (id !== exerciseId) continue;
      const done = session.logs.filter((l) => l.prescriptionId === slot.id && l.status === "done");
      if (!done.length) continue;
      const sets = done.map((l) => {
        const parts: string[] = [];
        if (l.reps != null) parts.push(`${l.reps}`);
        if (l.load != null) parts.push(`@${l.load}${units}`);
        if (l.assistance != null) parts.push(`assist ${l.assistance}${units}`);
        if (l.seconds != null) parts.push(`${l.seconds}s`);
        if (l.distance) parts.push(l.distance);
        return parts.join(" ") || "done";
      });
      return `${session.localDate}: ${sets.join(", ")}`;
    }
  }
  return null;
}

/** Plain-text brief Randy can paste into an AI chat to generate the next plan. */
export function buildDigest(input: DigestInput): string {
  const today = input.today ?? localDate();
  const L: string[] = [];
  const flagged = input.notes.filter((n) => n.forNextPlan);
  const grouped = groupNotes(input.notes);

  L.push("# Brief for building my next training plan");
  L.push(`Generated ${today} from my Daylight Matrix app. Everything below is my own log and notes. I am not asking for medical advice.`);
  L.push("");
  L.push("## Context");
  L.push(input.planContext.trim() || "(no extra context saved)");
  L.push("");
  L.push(`## Current plan: ${input.plan.name} v${input.plan.version} (6-day split)`);
  for (const day of input.plan.days) {
    if (!day.scheduled) continue;
    L.push(`### ${WEEKDAY_NAMES[day.weekday]} · ${day.name}`);
    for (const block of dayBlocks(day)) {
      const rows = block.slots.map((s) => {
        const alt = s.alternatives.map((a) => nameOf(a.exerciseId));
        const dose = s.sets ? `${s.sets}${s.setsMax ? `–${s.setsMax}` : ""}×${s.repLabel}${s.perSide ? "/side" : ""}` : s.durationLabel ?? "";
        return `${nameOf(s.exerciseId)}${alt.length ? ` (or ${alt.join(" / ")})` : ""} ${dose}`.trim();
      });
      if (rows.length) L.push(`- ${block.label}: ${rows.join("; ")}`);
    }
  }
  L.push("");

  const planned = plannedVolume(input.plan);
  const win = windowFor(30, today);
  const logged = loggedVolume(input.sessions, win);
  L.push(`## Weekly sets per muscle area (weighted: primary 1, secondary 0.5, minor 0.25; my target ${input.weeklyTarget}/week)`);
  L.push("Planned = the plan as written. Logged = actual, last 30 days averaged to a week" + (logged.totalSets ? "." : " (nothing logged yet)."));
  const rows = [...GROUPS.flatMap((g) => [g as { id: MuscleId; name: string }, ...g.subs.map((sid) => subInfo(sid)!)])].map((m) => {
    const p = planned[m.id];
    const l = logged.map[m.id];
    const st = statusFor(p, 1, targetFor(m.id, input.weeklyTarget));
    const lw = logged.totalSets ? `${fmt(Math.round((l.effective / (30 / 7)) * 10) / 10)}` : "–";
    return { m, line: `- ${m.name}: planned ${fmt(Math.round(p.effective * 10) / 10)} (direct ${fmt(Math.round(p.direct * 10) / 10)}), logged ${lw} · ${STATUS_LABEL[st]}` };
  });
  rows.forEach((r) => L.push(r.line));
  const under = GROUPS.filter((m) => ["none", "indirect", "low"].includes(statusFor(planned[m.id], 1, targetFor(m.id, input.weeklyTarget)))).map((m) => m.name);
  const underSubs = SUBS.filter((m) => ["none", "indirect"].includes(statusFor(planned[m.id], 1, targetFor(m.id, input.weeklyTarget)))).map((m) => m.name);
  L.push("");
  L.push(`Underserved by the plan as written (muscle groups): ${under.length ? under.join(", ") : "none"}.`);
  L.push(`Sub-parts with little or no direct work in the plan: ${underSubs.length ? underSubs.join(", ") : "none"}.`);
  L.push("");

  const extraLines: string[] = [];
  for (const session of input.sessions) {
    if (session.localDate < win.from || session.localDate > win.to) continue;
    for (const e of session.extras ?? []) {
      const slot = e.slotId ? session.snapshot.find((x) => x.id === e.slotId) : null;
      const replaced = slot ? nameOf(slot.exerciseId) : null;
      const dose = [e.sets ? `${e.sets} sets` : null, e.reps ? `${e.reps} reps` : null, e.load != null ? `@${e.load}${input.units}` : null, e.minutes ? `${e.minutes} min` : null].filter(Boolean).join(", ");
      const muscles = (e.muscles ?? []).map((m) => muscleName(m)).join(", ");
      extraLines.push(`- (${session.localDate}) ${e.kind === "swap" ? "Swapped" : "Did something else"}: ${e.name || "unnamed"}${replaced ? ` instead of ${replaced}` : ""}${dose ? ` · ${dose}` : ""}${muscles ? ` · muscles: ${muscles}` : ""}${e.note ? ` · ${e.note.replace(/\s+/g, " ").trim()}` : ""}`);
    }
  }
  L.push(`## Off-plan work and swaps (last 30 days, ${extraLines.length})`);
  if (!extraLines.length) L.push("(none)");
  extraLines.forEach((l) => L.push(l));
  L.push("");

  L.push(`## Flagged for the next plan (${flagged.length})`);
  if (!flagged.length) L.push("(none flagged)");
  flagged.forEach((n) => {
    const where = [n.context.exerciseId ? nameOf(n.context.exerciseId) : null, n.context.muscleId ? muscleName(n.context.muscleId) : null].filter(Boolean).join(" / ");
    L.push(`${noteLine(n)}${where ? ` · re: ${where}` : ""}`);
  });
  L.push("");

  L.push("## Notes by exercise");
  if (!grouped.exercise.length) L.push("(none)");
  for (const g of grouped.exercise) {
    L.push(`### ${g.label}`);
    const last = lastLogged(input.sessions, g.key, input.units);
    if (last) L.push(`Last logged — ${last}`);
    g.notes.forEach((n) => L.push(noteLine(n)));
  }
  L.push("");
  L.push("## Notes by muscle area");
  if (!grouped.muscle.length) L.push("(none)");
  for (const g of grouped.muscle) {
    L.push(`### ${g.label}`);
    g.notes.forEach((n) => L.push(noteLine(n)));
  }
  L.push("");
  L.push("## Other notes");
  if (!grouped.general.length) L.push("(none)");
  grouped.general.forEach((n) => L.push(noteLine(n)));
  L.push("");

  const done = input.sessions.filter((s) => s.localDate >= win.from && s.localDate <= win.to && s.logs.some((l) => l.status === "done"));
  L.push(`## Training consistency (last 30 days): ${done.length} session${done.length === 1 ? "" : "s"} with logged sets`);
  L.push("");
  L.push("## What I want from you");
  L.push("Build my next plan from the above. Keep what is working, address the flagged notes and the underserved areas, keep low-back-friendly choices, keep PT activation first each day, and give me sets × reps and a one-line form cue per move. Ask me anything you need to know first.");
  return L.join("\n");
}
