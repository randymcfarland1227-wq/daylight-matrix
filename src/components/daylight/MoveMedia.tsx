import { useEffect, useRef, useState } from "react";
import { Film, Image as ImageIcon, Pause, Play } from "lucide-react";
import { PHOTO_SOURCE, photosFor } from "@/lib/daylight/exImages";
import { videoCredit, videoFor, vimeoEmbedUrl, vimeoPageUrl, type VideoEntry } from "@/lib/daylight/videos";
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

function useOnline(): boolean {
  const [online, setOnline] = useState(() => typeof navigator === "undefined" || navigator.onLine !== false);
  useEffect(() => {
    const on = () => setOnline(navigator.onLine !== false);
    window.addEventListener("online", on);
    window.addEventListener("offline", on);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", on);
    };
  }, []);
  return online;
}

/** How long Vimeo's player gets to say "ready" before we quietly switch to the photos. */
const VIDEO_READY_MS = 15000;
const VIMEO_ORIGIN = "https://player.vimeo.com";

/** Vimeo's official embed player, inline: muted autoplay loop, tap for sound and controls. Never navigates away. */
function MoveVideo({ video, compact, reduced, onFail }: { video: VideoEntry; compact?: boolean; reduced: boolean; onFail: () => void }) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(false);
    let ok = false;
    const onMsg = (e: MessageEvent) => {
      if (e.origin !== VIMEO_ORIGIN || e.source !== ref.current?.contentWindow) return;
      let data: unknown = e.data;
      if (typeof data === "string") {
        try {
          data = JSON.parse(data);
        } catch {
          return;
        }
      }
      if ((data as { event?: string } | null)?.event === "ready") {
        ok = true;
        setReady(true);
      }
    };
    window.addEventListener("message", onMsg);
    const t = window.setTimeout(() => {
      if (!ok) onFail();
    }, VIDEO_READY_MS);
    return () => {
      window.removeEventListener("message", onMsg);
      window.clearTimeout(t);
    };
  }, [video.id, onFail]);
  const src = reduced ? vimeoEmbedUrl(video).replace("autoplay=1", "autoplay=0") : vimeoEmbedUrl(video);
  const ratio = `${video.width} / ${video.height}`;
  const maxH = compact ? "46vh" : "62vh";
  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-black" data-testid="move-video" data-video-id={video.id} data-video-ready={ready ? "true" : "false"}>
      <div className="mx-auto" style={{ aspectRatio: ratio, width: `min(100%, calc(${maxH} * ${video.width} / ${video.height}))` }}>
        <iframe
          ref={ref}
          src={src}
          title={`${video.title} (exercise demo video)`}
          className="block size-full border-0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          loading="eager"
          data-testid="video-frame"
        />
      </div>
    </div>
  );
}

/** The move's media, inline: a real Vimeo clip when there is one and you are online; otherwise the real start/end photos
    played as a looping motion strip; the old diagram only when there is no photo either. */
export function MoveMedia({ exerciseId, compact, className }: { exerciseId: string; compact?: boolean; className?: string }) {
  const video = videoFor(exerciseId);
  const online = useOnline();
  const reduced = usePrefersReducedMotion();
  const [videoFailed, setVideoFailed] = useState(false);
  const [preferPhotos, setPreferPhotos] = useState(false);
  const onFail = useRef(() => setVideoFailed(true)).current;
  const showVideo = !!video && online && !videoFailed && !preferPhotos;

  if (video && showVideo) {
    return (
      <figure className={cn("space-y-1.5", className)} data-testid="move-media" data-media="video">
        <MoveVideo video={video} compact={compact} reduced={reduced} onFail={onFail} />
        <figcaption className="flex flex-wrap items-center gap-x-2 gap-y-1 px-1 text-xs leading-snug text-ink-faint">
          <span data-testid="video-credit">
            {video.match === "close" ? <b className="mr-1 text-ink-soft" data-testid="video-close-match">Closest clip in the library.</b> : null}
            <a href={vimeoPageUrl(video.id)} target="_blank" rel="noreferrer noopener" className="underline">{videoCredit(video)}</a>
          </span>
          <span className="text-ink-faint">· Tap the video for sound and controls.</span>
          {photosFor(exerciseId) ? (
            <button type="button" onClick={() => setPreferPhotos(true)} className="tap inline-flex items-center gap-1 rounded-full border border-line px-2 py-0.5 font-bold text-ink-soft" data-testid="show-photos">
              <ImageIcon className="size-3.5" aria-hidden="true" /> Photos
            </button>
          ) : null}
        </figcaption>
        {compact ? null : <PhotoStills exerciseId={exerciseId} />}
      </figure>
    );
  }
  const note = video ? (!online ? "Offline: showing photos instead of the video." : videoFailed ? "The video didn't load, so here are the photos." : null) : null;
  const canPlayVideo = !!video && online;
  return (
    <div className={cn("space-y-1", className)}>
      <PhotoLoop exerciseId={exerciseId} compact={compact} />
      {note || canPlayVideo ? (
        <p className="flex flex-wrap items-center gap-2 px-1 text-xs text-ink-faint" data-testid="video-fallback-note">
          {note ? <span>{note}</span> : null}
          {canPlayVideo ? (
            <button
              type="button"
              onClick={() => {
                setVideoFailed(false);
                setPreferPhotos(false);
              }}
              className="tap inline-flex items-center gap-1 rounded-full border border-line px-2 py-0.5 font-bold text-ink-soft"
              data-testid="show-video"
            >
              <Film className="size-3.5" aria-hidden="true" /> {videoFailed ? "Try the video again" : "Video"}
            </button>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}

/** START / END stills under the video on the exercise page (nothing when there are no photos). */
function PhotoStills({ exerciseId }: { exerciseId: string }) {
  const photos = photosFor(exerciseId);
  const [failed, setFailed] = useState(false);
  if (!photos || failed || photos.images.length < 2) return null;
  return (
    <div className="space-y-1">
      <div className="grid grid-cols-2 gap-2" data-testid="move-stills">
        {(["START", "END"] as const).map((tag, i) => (
          <div key={tag} className="relative aspect-[4/3] overflow-hidden rounded-xl bg-surface-2">
            <img src={photos.images[i]} alt={`${tag} position`} loading="lazy" decoding="async" crossOrigin="anonymous" referrerPolicy="no-referrer" onError={() => setFailed(true)} className="size-full object-contain" />
            <span className="absolute left-1.5 top-1.5 rounded-full bg-black/60 px-2 py-0.5 text-xs font-bold tracking-widest text-white">{tag}</span>
          </div>
        ))}
      </div>
      <p className="px-1 text-xs leading-snug text-ink-faint" data-testid="photo-credit">
        {photos.match === "close" ? <span className="mr-1 font-bold text-ink-soft" data-testid="photo-close-match">Closest photo match: {photos.name} ({photos.equipment}).</span> : null}
        <a href={PHOTO_SOURCE.url} target="_blank" rel="noreferrer noopener" className="underline">{PHOTO_SOURCE.attribution}</a>
      </p>
    </div>
  );
}

/** Real start/end photos of the move, played as a muted looping motion strip, inline. Moves without a photo keep the old diagram. */
function PhotoLoop({ exerciseId, compact, className }: { exerciseId: string; compact?: boolean; className?: string }) {
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
    <figure className={cn("space-y-1.5", className)} data-testid="move-media" data-media="photos" data-photo-source={PHOTO_SOURCE.id}>
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-surface-2" data-testid="move-loop" data-playing={playing ? "true" : "false"} data-frame={frame}>
        {img(start, frame === 0, "move-photo-start")}
        {img(end, frame === 1, "move-photo-end")}
        <span className="pointer-events-none absolute left-2 top-2 rounded-full bg-black/60 px-2.5 py-0.5 text-xs font-bold tracking-widest text-white" data-testid="move-loop-label">{frame === 0 ? "START" : "END"}</span>
        <button
          type="button"
          onClick={() => (reduced ? setFrame((f) => (f === 0 ? 1 : 0)) : setPaused((p) => !p))}
          aria-label={reduced ? "Show the other position" : paused ? "Play the loop" : "Pause the loop"}
          data-testid="move-loop-toggle"
          className="tap absolute bottom-2 right-2 grid size-10 place-items-center rounded-full bg-black/60 text-white"
        >
          {reduced ? <span className="text-xs font-bold">flip</span> : playing ? <Pause className="size-5" /> : <Play className="size-5" />}
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
              <span className="absolute left-1.5 top-1.5 rounded-full bg-black/60 px-2 py-0.5 text-xs font-bold tracking-widest text-white">{tag}</span>
            </div>
          ))}
        </div>
      )}
      <figcaption className="px-1 text-xs leading-snug text-ink-faint" data-testid="photo-credit">
        {photos.match === "close" ? (
          <span className="mr-1 font-bold text-ink-soft" data-testid="photo-close-match">Closest photo match: {photos.name} ({photos.equipment}).</span>
        ) : null}
        <a href={PHOTO_SOURCE.url} target="_blank" rel="noreferrer noopener" className="underline">{PHOTO_SOURCE.attribution}</a>
      </figcaption>
    </figure>
  );
}
