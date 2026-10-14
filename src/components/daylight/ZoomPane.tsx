import { useRef, useState, type ReactNode } from "react";
import { Minus, Plus, RotateCcw } from "lucide-react";

/** Pinch / wheel zoom and drag-to-pan for the body map. Taps still reach the shapes underneath. */
export function ZoomPane({ children, className }: { children: ReactNode; className?: string }) {
  const [t, setT] = useState({ s: 1, x: 0, y: 0 });
  const box = useRef<HTMLDivElement>(null);
  const ptrs = useRef(new Map<number, { x: number; y: number }>());
  const start = useRef<{ d: number; s: number; x: number; y: number; px: number; py: number; moved: boolean } | null>(null);
  const clamp = (n: { s: number; x: number; y: number }) => {
    const s = Math.min(5, Math.max(1, n.s));
    const w = box.current?.clientWidth ?? 300, h = box.current?.clientHeight ?? 400;
    const mx = (w * (s - 1)) / 2, my = (h * (s - 1)) / 2;
    return { s, x: Math.min(mx, Math.max(-mx, n.x)), y: Math.min(my, Math.max(-my, n.y)) };
  };
  const zoomBy = (f: number) => setT((p) => clamp({ s: p.s * f, x: p.x * f, y: p.y * f }));
  const dist = () => { const [a, b] = [...ptrs.current.values()]; return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0; };
  return (
    <div className={className}>
      <div
        ref={box}
        className="relative overflow-hidden rounded-lg"
        style={{ touchAction: t.s > 1 ? "none" : "pan-y" }}
        data-testid="zoom-pane"
        data-zoom={t.s.toFixed(2)}
        onWheel={(e) => { if (!e.ctrlKey && !e.metaKey && t.s === 1 && e.deltaY > 0) return; e.preventDefault(); zoomBy(e.deltaY < 0 ? 1.15 : 1 / 1.15); }}
        onPointerDown={(e) => {
          ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
          start.current = { d: dist(), s: t.s, x: t.x, y: t.y, px: e.clientX, py: e.clientY, moved: false };
        }}
        onPointerMove={(e) => {
          if (!ptrs.current.has(e.pointerId) || !start.current) return;
          ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
          const st = start.current;
          if (ptrs.current.size >= 2 && st.d) { st.moved = true; const f = dist() / st.d; setT(clamp({ s: st.s * f, x: st.x * f, y: st.y * f })); return; }
          const dx = e.clientX - st.px, dy = e.clientY - st.py;
          if (t.s > 1 && (st.moved || Math.hypot(dx, dy) > 6)) { st.moved = true; setT(clamp({ s: st.s, x: st.x + dx, y: st.y + dy })); }
        }}
        onPointerUp={(e) => { ptrs.current.delete(e.pointerId); if (ptrs.current.size === 0) setTimeout(() => (start.current = null), 0); }}
        onPointerCancel={(e) => ptrs.current.delete(e.pointerId)}
        onClickCapture={(e) => { if (start.current?.moved) { e.stopPropagation(); e.preventDefault(); } }}
      >
        <div style={{ transform: `translate(${t.x}px, ${t.y}px) scale(${t.s})`, transformOrigin: "center", transition: ptrs.current.size ? "none" : "transform 120ms ease-out" }}>{children}</div>
        <div className="absolute right-2 top-2 flex flex-col gap-1.5">
          <button type="button" aria-label="Zoom in" className="tap grid size-9 place-items-center rounded-full border border-line bg-surface shadow-sm" onClick={() => zoomBy(1.5)} data-testid="zoom-in"><Plus className="size-4" /></button>
          <button type="button" aria-label="Zoom out" className="tap grid size-9 place-items-center rounded-full border border-line bg-surface shadow-sm" onClick={() => zoomBy(1 / 1.5)}><Minus className="size-4" /></button>
          {t.s > 1 ? <button type="button" aria-label="Reset zoom" className="tap grid size-9 place-items-center rounded-full border border-line bg-surface shadow-sm" onClick={() => setT({ s: 1, x: 0, y: 0 })}><RotateCcw className="size-4" /></button> : null}
        </div>
      </div>
      <p className="mt-1.5 text-xs text-ink-faint">Pinch or use + to zoom; drag to move when zoomed.</p>
    </div>
  );
}
