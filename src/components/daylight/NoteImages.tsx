import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Camera, ImagePlus, Trash2, X } from "lucide-react";
import { addImageFromFile, deleteImage, getImage } from "@/lib/daylight/noteImages";
import { cn } from "./ui";

function useImageUrl(id: string | null, kind: "thumb" | "blob") {
  const [url, setUrl] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);
  useEffect(() => {
    if (!id) return;
    let u: string | null = null;
    let live = true;
    getImage(id)
      .then((img) => {
        if (!live) return;
        if (!img) return setMissing(true);
        u = URL.createObjectURL(img[kind]);
        setUrl(u);
      })
      .catch(() => live && setMissing(true));
    return () => {
      live = false;
      if (u) URL.revokeObjectURL(u);
    };
  }, [id, kind]);
  return { url, missing };
}

function Thumb({ id, onOpen, onRemove, size = 72 }: { id: string; onOpen: () => void; onRemove?: () => void; size?: number }) {
  const { url, missing } = useImageUrl(id, "thumb");
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <button type="button" onClick={onOpen} aria-label="View photo" className="tap block size-full overflow-hidden rounded-lg border border-line bg-surface-2" data-testid="note-thumb">
        {url ? <img src={url} alt="" className="size-full object-cover" /> : <span className="grid size-full place-items-center text-[11px] text-ink-faint">{missing ? "Missing" : "…"}</span>}
      </button>
      {onRemove ? (
        <button type="button" aria-label="Remove photo" onClick={onRemove} className="tap absolute -right-1.5 -top-1.5 grid size-6 place-items-center rounded-full border border-line bg-surface text-ink shadow-sm">
          <X className="size-3.5" />
        </button>
      ) : null}
    </div>
  );
}

function Viewer({ id, onClose, onDelete }: { id: string; onClose: () => void; onDelete?: () => void }) {
  const { url } = useImageUrl(id, "blob");
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  return createPortal(
    <div role="dialog" aria-modal="true" aria-label="Photo" className="fixed inset-0 z-[80] flex flex-col bg-black/92" onClick={onClose} data-testid="photo-viewer">
      <div className="flex justify-end gap-2 p-3" style={{ paddingTop: "max(env(safe-area-inset-top), 12px)" }}>
        {onDelete ? (
          <button type="button" className="tap flex h-10 items-center gap-1.5 rounded-full bg-white/12 px-4 text-sm font-semibold text-white" onClick={(e) => (e.stopPropagation(), window.confirm("Delete this photo?") && (onDelete(), onClose()))}>
            <Trash2 className="size-4" /> Delete
          </button>
        ) : null}
        <button type="button" aria-label="Close photo" className="tap grid size-10 place-items-center rounded-full bg-white/12 text-white" onClick={onClose}>
          <X className="size-5" />
        </button>
      </div>
      <div className="flex min-h-0 flex-1 items-center justify-center p-3">{url ? <img src={url} alt="Note photo" className="max-h-full max-w-full rounded-lg object-contain" onClick={(e) => e.stopPropagation()} /> : null}</div>
    </div>,
    document.body,
  );
}

/** Read-only strip on a saved note. Tap to view full size; delete from the viewer when `onChange` is given. */
export function NoteThumbs({ ids, onChange, className }: { ids?: string[]; onChange?: (ids: string[]) => void; className?: string }) {
  const [open, setOpen] = useState<string | null>(null);
  if (!ids?.length) return null;
  return (
    <>
      <div className={cn("no-scrollbar flex gap-2 overflow-x-auto", className)} aria-label="Photos">
        {ids.map((id) => (
          <Thumb key={id} id={id} onOpen={() => setOpen(id)} />
        ))}
      </div>
      {open ? (
        <Viewer
          id={open}
          onClose={() => setOpen(null)}
          onDelete={
            onChange
              ? () => {
                  onChange(ids.filter((x) => x !== open));
                  void deleteImage(open).catch(() => undefined);
                }
              : undefined
          }
        />
      ) : null}
    </>
  );
}

/** Camera / gallery picker used wherever a note is written. Photos are resized to 1280px JPEG and stored on this device. */
export function PhotoPicker({ ids, onChange, compact }: { ids: string[]; onChange: (ids: string[]) => void; compact?: boolean }) {
  const cam = useRef<HTMLInputElement>(null);
  const gal = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const latest = useRef(ids);
  latest.current = ids;
  const add = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    setErr("");
    const added: string[] = [];
    for (const f of Array.from(files).slice(0, 6)) {
      try {
        added.push(await addImageFromFile(f));
      } catch {
        setErr("One photo couldn’t be read. Try a JPEG or PNG.");
      }
    }
    onChange([...latest.current, ...added]);
    setBusy(false);
  };
  const remove = (id: string) => {
    onChange(ids.filter((x) => x !== id));
    void deleteImage(id).catch(() => undefined);
  };
  return (
    <div className={compact ? "" : "mt-3"} data-testid="photo-picker">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className="tap flex h-10 items-center gap-1.5 rounded-lg border border-line bg-surface px-3 text-sm font-semibold" onClick={() => cam.current?.click()} disabled={busy}>
          <Camera className="size-4" /> Camera
        </button>
        <button type="button" className="tap flex h-10 items-center gap-1.5 rounded-lg border border-line bg-surface px-3 text-sm font-semibold" onClick={() => gal.current?.click()} disabled={busy}>
          <ImagePlus className="size-4" /> Photo library
        </button>
        {busy ? <span className="text-xs text-ink-soft">Saving photo…</span> : null}
        <input ref={cam} type="file" accept="image/*" capture="environment" className="sr-only" aria-label="Take a photo" onChange={(e) => (void add(e.target.files), (e.target.value = ""))} />
        <input ref={gal} type="file" accept="image/*" multiple className="sr-only" aria-label="Choose photos" data-testid="photo-input" onChange={(e) => (void add(e.target.files), (e.target.value = ""))} />
      </div>
      {ids.length ? (
        <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto pt-1.5 pr-1.5">
          {ids.map((id) => (
            <Thumb key={id} id={id} onOpen={() => setOpen(id)} onRemove={() => remove(id)} />
          ))}
        </div>
      ) : null}
      {err ? <p className="mt-1 text-xs text-danger">{err}</p> : null}
      {open ? <Viewer id={open} onClose={() => setOpen(null)} onDelete={() => remove(open)} /> : null}
    </div>
  );
}
