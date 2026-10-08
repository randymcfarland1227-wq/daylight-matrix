import { useId } from "react";
import { artFor } from "@/lib/daylight/moveArt";
import { solve, type ArtSpec, type Joints, type Prop, type V2 } from "@/lib/daylight/moveArtEngine";
import { exerciseById } from "@/lib/daylight/exercises";
import { cn } from "./ui";

const FLOOR = 92;

function pt(ref: V2 | string, j: Joints): V2 {
  if (typeof ref !== "string") return ref;
  return j[ref] ?? j.hand ?? [60, 50];
}

function PropEl({ p, j }: { p: Prop; j: Joints }) {
  switch (p.t) {
    case "seg": {
      const a = pt(p.a, j);
      const b = pt(p.b, j);
      const k = p.k ?? "frame";
      const cls = k === "cable" ? "stroke-ink-faint" : k === "band" ? "stroke-sun" : k === "bench" || k === "pad" ? "stroke-surface-2" : "stroke-ink-faint";
      const w = p.w ?? 2;
      return <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} strokeWidth={w} strokeLinecap="round" className={cls} strokeDasharray={k === "thin" ? "2 2" : undefined} />;
    }
    case "rect":
      return <rect x={p.x} y={p.y} width={p.w} height={p.h} rx={2} className={p.k === "block" ? "fill-surface-2 stroke-line" : "fill-surface-2 stroke-line"} strokeWidth={0.8} />;
    case "circle": {
      const c = pt(p.at, j);
      return <circle cx={c[0]} cy={c[1]} r={p.r} className={p.k === "pulley" ? "fill-surface stroke-ink-faint" : "fill-none stroke-ink-faint"} strokeWidth={p.k === "wheel" ? 2 : 1} />;
    }
    case "weight": {
      const c = pt(p.at, j);
      if (p.k === "bar" || p.k === "plate") return <g><line x1={c[0] - 10} y1={c[1]} x2={c[0] + 10} y2={c[1]} strokeWidth={2} className="stroke-ink-soft" strokeLinecap="round" /><circle cx={c[0] - 8} cy={c[1]} r={4} className="fill-sun" /><circle cx={c[0] + 8} cy={c[1]} r={4} className="fill-sun" /></g>;
      return <g><line x1={c[0] - 4} y1={c[1]} x2={c[0] + 4} y2={c[1]} strokeWidth={1.6} className="stroke-ink-soft" /><rect x={c[0] - 7} y={c[1] - 3} width={4} height={6} rx={1} className="fill-sun" /><rect x={c[0] + 3} y={c[1] - 3} width={4} height={6} rx={1} className="fill-sun" /></g>;
    }
    case "wave": {
      const a = pt(p.a, j);
      const b = pt(p.b, j);
      const mid = (b[0] + a[0]) / 2;
      return <path d={`M${a[0]} ${a[1]} Q${a[0] + (mid - a[0]) / 2} ${a[1] - 12} ${mid} ${a[1]} T${b[0]} ${b[1]}`} fill="none" strokeWidth={2} className="stroke-sun" strokeLinecap="round" />;
    }
    case "arrow": {
      const a = pt(p.a, j);
      const b = pt(p.b, j);
      return <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} strokeWidth={1.2} className="stroke-sun" markerEnd="url(#arr)" />;
    }
    case "text":
      return <text x={p.at[0]} y={p.at[1]} fontSize={5} className="fill-ink-soft">{p.s}</text>;
    default:
      return null;
  }
}

function Limb({ pts, w, far }: { pts: V2[]; w: number; far?: boolean }) {
  return <polyline points={pts.map((p) => p.join(",")).join(" ")} fill="none" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" className={far ? "stroke-ink-faint" : "stroke-ink"} opacity={far ? 0.75 : 1} />;
}

function Panel({ spec, pose, ghost, label, tag }: { spec: ArtSpec; pose: ArtSpec["a"]; ghost?: ArtSpec["a"]; label?: string; tag: string }) {
  const j = solve(pose);
  const g = ghost ? solve(ghost) : null;
  const head = j.head;
  const arm2 = j.hand2 && !pose.noArm2;
  const leg2 = j.ankle2 && !pose.noLeg2;
  const track = spec.track && g && g[spec.track] && j[spec.track] ? { a: g[spec.track]!, b: j[spec.track]! } : null;
  const moved = track ? Math.hypot(track.a[0] - track.b[0], track.a[1] - track.b[1]) > 5 : false;
  return (
    <figure className="min-w-0 flex-1">
      <svg viewBox="0 0 120 100" role="img" aria-label={`${tag}: ${label ?? ""}`} className="block w-full rounded-xl bg-surface-2/60">
        <defs>
          <marker id="arr" viewBox="0 0 6 6" refX="4" refY="3" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M0 0 L6 3 L0 6 z" className="fill-sun" />
          </marker>
        </defs>
        <line x1="4" y1={FLOOR} x2="116" y2={FLOOR} strokeWidth="1" className="stroke-line" />
        {(spec.props ?? []).map((p, i) => <PropEl key={i} p={p} j={j} />)}
        {g && moved ? <circle cx={g[spec.track!]![0]} cy={g[spec.track!]![1]} r="2.2" className="fill-none stroke-sun" strokeDasharray="1.5 1.5" strokeWidth="0.9" /> : null}
        {track && moved ? <line x1={track.a[0]} y1={track.a[1]} x2={track.b[0]} y2={track.b[1]} strokeWidth="1.1" strokeDasharray="2 2" className="stroke-sun" markerEnd="url(#arr)" opacity="0.9" /> : null}
        {/* far limbs first */}
        {leg2 ? <Limb pts={[j.hip, j.knee2!, j.ankle2!, j.toe2!]} w={4.6} far /> : null}
        {arm2 ? <Limb pts={[j.shoulder, j.elbow2!, j.hand2!]} w={3.6} far /> : null}
        <Limb pts={[j.hip, j.shoulder]} w={7} />
        <Limb pts={[j.hip, j.knee!, j.ankle!, j.toe!]} w={4.8} />
        <Limb pts={[j.shoulder, j.elbow!, j.hand!]} w={3.8} />
        <circle cx={head[0]} cy={head[1]} r="5.4" className="fill-ink" />
      </svg>
      <figcaption className="mt-1 text-center text-xs font-semibold leading-tight text-ink-soft">
        <span className="mr-1 rounded-full bg-accent px-1.5 py-px text-xs font-extrabold text-on-accent">{tag}</span>
        {label}
      </figcaption>
    </figure>
  );
}

/** Pictogram used when no diagram exists. Distinct by equipment, never a generic dumbbell. */
function equipmentKey(id: string): string {
  const eq = (exerciseById(id)?.equipment ?? "").toLowerCase();
  if (eq.includes("cable")) return "cable";
  if (eq.includes("machine")) return "machine";
  if (eq.includes("band")) return "band";
  if (eq.includes("barbell") || eq.includes("bar")) return "bar";
  if (eq.includes("dumbbell") || eq.includes("db")) return "db";
  return "body";
}

export function MoveArt({ exerciseId, className, compact }: { exerciseId: string; className?: string; compact?: boolean }) {
  const spec = artFor(exerciseId);
  if (!spec) {
    return (
      <div className={cn("grid place-items-center rounded-xl bg-surface-2/60 py-6 text-sm text-ink-soft", className)}>
        <Pictogram exerciseId={exerciseId} size={64} />
        <span className="mt-1">No diagram for {equipmentKey(exerciseId)} moves yet. Use the steps below.</span>
      </div>
    );
  }
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex gap-2">
        <Panel spec={spec} pose={spec.a} label={spec.labels?.[0]} tag="START" />
        {spec.hold && !spec.labels?.[1] ? null : <Panel spec={spec} pose={spec.b} ghost={spec.a} label={spec.labels?.[1]} tag={spec.hold ? "HOLD" : "END"} />}
      </div>
      {!compact && spec.look ? <p className="px-1 text-xs text-ink-soft"><span className="font-bold text-ink">Look for:</span> {spec.look}</p> : null}
      {compact ? null : <p className="px-1 text-xs text-ink-faint">Simplified side-view sketch (general education). Faint limb = the far side. Amber dashed arrow = how the movement travels.</p>}
    </div>
  );
}

/** Small distinct thumbnail for the session list: the START frame of the move art, or a pictogram. */
export function MoveThumb({ exerciseId, size = 44, done }: { exerciseId: string; size?: number; done?: boolean }) {
  const spec = artFor(exerciseId);
  const uid = useId();
  if (!spec) return <Pictogram exerciseId={exerciseId} size={size} />;
  const j = solve(spec.b);
  const ja = solve(spec.a);
  const frame = (jj: Joints, pose: ArtSpec["a"], key: string) => (
    <g key={key}>
      {pose.noLeg2 || !jj.ankle2 ? null : <Limb pts={[jj.hip, jj.knee2!, jj.ankle2!, jj.toe2!]} w={5} far />}
      <Limb pts={[jj.hip, jj.shoulder]} w={7.5} />
      <Limb pts={[jj.hip, jj.knee!, jj.ankle!, jj.toe!]} w={5.2} />
      <Limb pts={[jj.shoulder, jj.elbow!, jj.hand!]} w={4.2} />
      <circle cx={jj.head[0]} cy={jj.head[1]} r="5.8" className="fill-ink" />
    </g>
  );
  void j;
  return (
    <svg viewBox="0 0 120 100" width={size} height={size * 0.83} aria-hidden="true" className={cn("shrink-0 rounded-xl p-0.5", done ? "bg-surface-2" : "bg-surface-2")} data-thumb={uid}>
      <line x1="4" y1={FLOOR} x2="116" y2={FLOOR} strokeWidth="1.5" className="stroke-line" />
      {(spec.props ?? []).map((p, i) => <PropEl key={i} p={p} j={ja} />)}
      {frame(ja, spec.a, "a")}
    </svg>
  );
}

export function Pictogram({ exerciseId, size = 44 }: { exerciseId: string; size?: number }) {
  const k = equipmentKey(exerciseId);
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true" className="shrink-0 rounded-xl bg-surface-2 p-1.5 text-ink-soft" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      {k === "cable" ? <><line x1="12" y1="6" x2="12" y2="42" /><circle cx="12" cy="10" r="3" /><path d="M12 13 L34 30" /><rect x="30" y="29" width="9" height="6" rx="2" /></> : null}
      {k === "machine" ? <><rect x="8" y="8" width="8" height="32" rx="2" /><path d="M16 22 H34 L38 30" /><rect x="22" y="32" width="14" height="6" rx="2" /></> : null}
      {k === "band" ? <><ellipse cx="24" cy="24" rx="16" ry="9" /><path d="M16 16 Q24 24 32 16" /></> : null}
      {k === "bar" ? <><line x1="6" y1="24" x2="42" y2="24" /><rect x="10" y="14" width="5" height="20" rx="1.5" /><rect x="33" y="14" width="5" height="20" rx="1.5" /></> : null}
      {k === "db" ? <><rect x="8" y="16" width="7" height="16" rx="2" /><rect x="33" y="16" width="7" height="16" rx="2" /><line x1="15" y1="24" x2="33" y2="24" /></> : null}
      {k === "body" ? <><circle cx="24" cy="10" r="4" /><path d="M24 15 V30 M24 20 L14 26 M24 20 L34 26 M24 30 L16 42 M24 30 L32 42" /></> : null}
    </svg>
  );
}
