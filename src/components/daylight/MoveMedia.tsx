import { useEffect, useState } from "react";
import { Pause, Play } from "lucide-react";
import { PHOTO_SOURCE, photosFor } from "@/lib/daylight/exImages";
import { MoveArt } from "./MoveArt";
import { cn } from "./ui";

const FRAME_MS = 1500;

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mq) return;
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

/** Warm the photo cache (and, through the service worker, the offline cache) for a list of moves. Skipped on Data Saver. */
export function prefetchPhotos(exerciseIds: string[]): void {
  if (typeof window === "undefined") return;
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (conn?.saveData || navigator.onLine === false) return;
  const urls = new Set<string>();
  for (const id of exerciseIds) for (const u of photosFor(id)?.images ?? []) urls.add(u);
  const list = [...urls];
  const run = async () => {
    // One at a time: gentle on data, and the service worker keeps each response for offline.
    for (const u of list) {
      try {
        const r = await fetch(u, { mode: "cors", credentials: "omit", referrerPolicy: "no-referrer" });
        await r.arrayBuffer();
      } catch {
        return; // offline or blocked: stop quietly, the diagram fallback covers it
      }
    }
  };
  const w = window as Window & { requestIdleCallback?: (cb: () => void) => number };
  if (w.requestIdleCallback) w.requestIdleCallback(() => void run());
  else window.setTimeout(() => void run(), 800);
}

/** Real start/end photos of the move, played as a muted looping motion strip, inline. Moves without a photo keep the old diagram. */
export function MoveMedia({ exerciseId, compact, className }: { exerciseId: string; compact?: boolean; className?: string }) {
  const photos = photosFor(exerciseId);
  const reduced = usePrefersReducedMotion();
  const [failed, setFailed] = useState(false);
  const [paused, setPaused] = useState(false);
  const [frame, setFrame] = useState<0 | 1>(0);
  const playing = !!photos && !failed && !paused && !reduced;

  useEffect(() => {
    if (!playing) return;
    const t = window.setInterval(() => setFrame((f) => (f === 0 ? 1 : 0)), FRAME_MS);
    return () => window.clearInterval(t);
  }, [playing]);

  if (!photos || failed || photos.images.length < 2) return <MoveArt exerciseId={exerciseId} compact={compact} className={className} />;
  const [start, end] = photos.images as [string, string];
  const img = (src: string, on: boolean, id: string) => (
    <img
      src={src}
      alt=""
      loading="lazy"
      decoding="async"
      crossOrigin="anonymous"
      referrerPolicy="no-referrer"
      data-testid={id}
      onError={() => setFailed(true)}
      className={cn("absolute inset-0 size-full object-contain transition-opacity duration-500", on ? "opacity-100" : "opacity-0")}
    />
  );
  return (
    <figure className={cn("space-y-1.5", className)} data-testid="move-media" data-photo-source={PHOTO_SOURCE.id}>
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-surface-2" data-testid="move-loop" data-playing={playing ? "true" : "false"} data-frame={frame}>
        {img(start, frame === 0, "move-photo-start")}
        {img(end, frame === 1, "move-photo-end")}
        <span className="pointer-events-none absolute left-2 top-2 rounded-full bg-black/60 px-2.5 py-0.5 text-[0.7rem] font-bold tracking-widest text-white" data-testid="move-loop-label">{frame === 0 ? "START" : "END"}</span>
        <button
          type="button"
          onClick={() => (reduced ? setFrame((f) => (f === 0 ? 1 : 0)) : setPaused((p) => !p))}
          aria-label={reduced ? "Show the other position" : paused ? "Play the loop" : "Pause the loop"}
          data-testid="move-loop-toggle"
          className="tap absolute bottom-2 right-2 grid size-10 place-items-center rounded-full bg-black/60 text-white"
        >
          {reduced ? <span className="text-[0.65rem] font-bold">flip</span> : playing ? <Pause className="size-5" /> : <Play className="size-5" />}
        </button>
      </div>
      {compact ? null : (
        <div className="grid grid-cols-2 gap-2" data-testid="move-stills">
          {[
            ["START", start],
            ["END", end],
          ].map(([tag, src]) => (
            <div key={tag} className="relative aspect-[4/3] overflow-hidden rounded-xl bg-surface-2">
              <img src={src} alt={`${tag} position`} loading="lazy" decoding="async" crossOrigin="anonymous" referrerPolicy="no-referrer" className="size-full object-contain" />
              <span className="absolute left-1.5 top-1.5 rounded-full bg-black/60 px-2 py-0.5 text-[0.65rem] font-bold tracking-widest text-white">{tag}</span>
            </div>
          ))}
        </div>
      )}
      <figcaption className="px-1 text-[0.7rem] leading-snug text-ink-faint" data-testid="photo-credit">
        {photos.match === "close" ? (
          <span className="mr-1 font-bold text-ink-soft" data-testid="photo-close-match">Closest photo match: {photos.name} ({photos.equipment}).</span>
        ) : null}
        <a href={PHOTO_SOURCE.url} target="_blank" rel="noreferrer noopener" className="underline">{PHOTO_SOURCE.attribution}</a>
      </figcaption>
    </figure>
  );
}
