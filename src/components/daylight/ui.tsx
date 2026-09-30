import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Button({
  tone = "primary",
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: "primary" | "quiet" | "outline" | "stage" }) {
  return (
    <button
      type={type}
      className={cn(
        "tap inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-base font-semibold",
        tone === "primary" && "bg-forest text-canvas hover:bg-forest-deep",
        tone === "quiet" && "bg-transparent px-1 text-forest underline-offset-4 hover:underline",
        tone === "outline" && "border border-line bg-surface text-ink",
        tone === "stage" && "bg-stage-lift text-canvas",
        className,
      )}
      {...props}
    />
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-base text-ink-soft">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "min-h-11 w-full rounded-xl border border-line bg-surface px-3 text-base text-ink outline-none";

export function Panel({
  title,
  kicker,
  children,
  action,
}: {
  title: string;
  kicker?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-line bg-surface px-4 py-4 md:px-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          {kicker ? <p className="text-base text-copper-deep">{kicker}</p> : null}
          <h2 className="text-2xl leading-tight text-ink">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Drawer({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center md:items-center">
      <button type="button" className="absolute inset-0 bg-ink/40" aria-label="Close" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative z-10 max-h-[88dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-line bg-canvas px-4 py-4 shadow-none transition-transform duration-200 md:rounded-2xl"
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-2xl text-ink">{title}</h2>
          <Button tone="outline" onClick={onClose}>
            Close
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
