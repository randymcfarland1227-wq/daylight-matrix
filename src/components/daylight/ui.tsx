import { useEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

export { cn };

export function haptic(ms = 12) {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(ms);
  } catch {
    /* not supported */
  }
}

type Tone = "primary" | "sun" | "soft" | "ghost" | "outline" | "danger";

export function Button({
  tone = "primary",
  size = "md",
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: Tone; size?: "sm" | "md" | "lg" }) {
  return (
    <button
      type={type}
      className={cn(
        "tap inline-flex select-none items-center justify-center gap-2 rounded-2xl font-bold disabled:opacity-45",
        size === "sm" && "min-h-10 px-3 text-sm",
        size === "md" && "min-h-12 px-4 text-base",
        size === "lg" && "min-h-14 px-6 text-lg",
        tone === "primary" && "bg-accent text-on-accent hover:bg-accent-deep",
        tone === "sun" && "bg-accent text-on-accent hover:bg-accent-deep", /* sun = primary; one accent only */
        tone === "soft" && "bg-surface-2 text-ink hover:bg-surface-2/80",
        tone === "ghost" && "px-2 text-accent hover:bg-surface-2",
        tone === "outline" && "border border-line bg-surface text-ink hover:bg-surface-2",
        tone === "danger" && "bg-danger text-white hover:brightness-95",
        className,
      )}
      {...props}
    />
  );
}

export function Chip({
  active,
  children,
  onClick,
  className,
  tone = "forest",
  title,
}: {
  active?: boolean;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  tone?: "forest" | "sun" | "teal";
  title?: string;
}) {
  const on = tone === "sun" || tone === "forest"
    ? "bg-accent text-on-accent border-accent"
    : tone === "teal"
      ? "bg-info/20 text-info border-info/40"
      : "bg-accent text-on-accent border-accent";
  return (
    <button
      type="button"
      title={title}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "tap inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm font-semibold",
        active ? on : "border-line bg-surface text-ink hover:bg-surface-2",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Badge({ children, tone = "plain", className }: { children: ReactNode; tone?: "plain" | "sun" | "teal" | "danger" | "forest" | "copper"; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold",
        tone === "plain" && "bg-surface-2 text-ink-soft",
        tone === "sun" && "bg-accent/15 text-accent",
        tone === "teal" && "bg-info/15 text-info",
        tone === "danger" && "bg-danger/15 text-danger",
        tone === "forest" && "bg-accent/15 text-accent",
        tone === "copper" && "bg-warn/15 text-warn",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Segmented<T extends string | number>({
  value,
  onChange,
  options,
  label,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { id: T; label: ReactNode }[];
  label: string;
  className?: string;
}) {
  return (
    <div role="tablist" aria-label={label} className={cn("no-scrollbar flex gap-1 overflow-x-auto rounded-2xl bg-surface-2 p-1", className)}>
      {options.map((o) => (
        <button
          key={String(o.id)}
          type="button"
          role="tab"
          aria-selected={value === o.id}
          tabIndex={value === o.id ? 0 : -1}
          onKeyDown={(event) => {
            const index = options.findIndex((option) => option.id === o.id);
            const next = event.key === "ArrowRight" ? (index + 1) % options.length : event.key === "ArrowLeft" ? (index - 1 + options.length) % options.length : event.key === "Home" ? 0 : event.key === "End" ? options.length - 1 : -1;
            if (next < 0) return;
            event.preventDefault();
            onChange(options[next]!.id);
            const buttons = event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
            buttons?.[next]?.focus();
          }}
          onClick={() => onChange(o.id)}
          className={cn(
            "tap min-h-10 flex-1 shrink-0 whitespace-nowrap rounded-xl px-3 text-sm font-bold",
            value === o.id ? "bg-surface text-ink shadow-sm" : "text-ink-soft hover:text-ink",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Sheet({ title, onClose, children, tall }: { title: string; onClose: () => void; children: ReactNode; tall?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); onClose(); }
      if (e.key !== "Tab" || !ref.current) return;
      const elements = [...ref.current.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled), textarea:not(:disabled), select:not(:disabled), [tabindex="0"]')].filter((el) => el.getClientRects().length > 0);
      const first = elements[0];
      const last = elements.at(-1);
      if (!first || !last) { e.preventDefault(); ref.current.focus(); return; }
      if (e.shiftKey && (document.activeElement === first || document.activeElement === ref.current)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && (document.activeElement === last || document.activeElement === ref.current)) { e.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      previousFocus?.focus();
    };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
      <button type="button" aria-label="Close" className="fade-in absolute inset-0 bg-[#0c0a08]/60 backdrop-blur-[2px]" onClick={onClose} />
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "sheet-in safe-bottom relative z-10 flex w-full max-w-xl flex-col rounded-t-[1.75rem] border border-line bg-canvas outline-none md:rounded-[1.75rem]",
          tall ? "h-[92dvh] md:h-[85dvh]" : "max-h-[90dvh]",
        )}
      >
        <div className="mx-auto mt-2 h-1.5 w-10 shrink-0 rounded-full bg-line md:hidden" />
        <div className="flex shrink-0 items-center justify-between gap-3 px-5 pb-2 pt-3">
          <h2 className="t-display text-[1.5rem]!">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="tap grid size-10 place-items-center rounded-full bg-surface-2 text-ink">
            <X className="size-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 pt-1">{children}</div>
      </div>
    </div>
  );
}

export function Ring({
  value,
  size = 72,
  stroke = 8,
  color = "var(--accent)",
  track = "var(--surface-2)",
  children,
  label,
}: {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  children?: ReactNode;
  label?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  return (
    <div className="relative grid shrink-0 place-items-center" style={{ width: size, height: size }} role="img" aria-label={label}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - v)}
          style={{ transition: "stroke-dashoffset 700ms cubic-bezier(.2,.8,.2,1)" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center leading-none">{children}</div>
    </div>
  );
}

export function Card({ children, className, as: Tag = "section", ...rest }: { children: ReactNode; className?: string; as?: "section" | "div" | "article" | "li" } & Record<string, unknown>) {
  return <Tag className={cn("card p-4 md:p-5", className)} {...rest}>{children}</Tag>;
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("eyebrow", className)}>{children}</p>;
}

export function PageHead({ eyebrow, title, helper, right, children }: { eyebrow?: string; title: string; helper?: ReactNode; right?: ReactNode; children?: ReactNode }) {
  return (
    <header className="mb-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
          <h1 className="t-display mt-0.5">{title}</h1>
          {helper ? <p className="t-caption mt-1 text-ink-soft">{helper}</p> : null}
        </div>
        {right}
      </div>
      {children}
    </header>
  );
}

/** Shared section title inside a card or screen stack. */
export function SectionTitle({ children, right, className }: { children: ReactNode; right?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-baseline justify-between gap-3", className)}>
      <h2 className="t-title">{children}</h2>
      {right}
    </div>
  );
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-[1.25rem] border border-dashed border-line px-4 py-8 text-center">
      <p className="t-title">{title}</p>
      {children ? <div className="t-caption mt-2 text-ink-soft">{children}</div> : null}
    </div>
  );
}

export function Stepper({
  value,
  onChange,
  step = 1,
  min = 0,
  label,
  unit,
  placeholder,
  inputMode = "numeric",
}: {
  value: string;
  onChange: (v: string) => void;
  step?: number;
  min?: number;
  label: string;
  unit?: string;
  placeholder?: string;
  inputMode?: "numeric" | "decimal";
}) {
  const bump = (d: number) => {
    const cur = parseFloat(value);
    const next = Math.max(min, (Number.isFinite(cur) ? cur : 0) + d);
    onChange(String(Math.round(next * 100) / 100));
    haptic(8);
  };
  return (
    <div>
      <span className="t-meta mb-1 block text-ink-soft">
        {label}
        {unit ? <span className="ml-1 normal-case tracking-normal text-ink-faint">{unit}</span> : null}
      </span>
      <div className="flex items-stretch overflow-hidden rounded-2xl border border-line bg-canvas">
        <button type="button" aria-label={`${label} down`} onClick={() => bump(-step)} className="tap w-11 shrink-0 text-xl font-bold text-ink-soft hover:bg-surface-2">
          −
        </button>
        <input
          aria-label={label}
          inputMode={inputMode}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="t-title min-h-12 w-full min-w-0 bg-transparent text-center tabular-nums text-ink outline-none placeholder:text-ink-faint/60"
        />
        <button type="button" aria-label={`${label} up`} onClick={() => bump(step)} className="tap w-11 shrink-0 text-xl font-bold text-ink-soft hover:bg-surface-2">
          +
        </button>
      </div>
    </div>
  );
}

export function useNow(ms = 1000, active = true) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setNow(Date.now()), ms);
    return () => window.clearInterval(id);
  }, [ms, active]);
  return now;
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

export function downloadText(name: string, text: string, type = "application/json") {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
