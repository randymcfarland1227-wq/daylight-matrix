import { useEffect, useRef, useState } from "react";
import { ExternalLink, Image as ImageIcon, Play, RotateCcw } from "lucide-react";
import { exerciseById } from "@/lib/daylight/exercises";
import { PHOTO_SOURCE, photosFor } from "@/lib/daylight/exImages";
import { NO_VIDEO, videoCredit, videoFor, vimeoEmbedUrl, vimeoPageUrl, type VideoEntry } from "@/lib/daylight/videos";
import { Button, cn } from "./ui";

/** Warm locally bundled photos before a workout; never downloads a video. */
export function prefetchPhotos(exerciseIds: string[]): void {
  if (typeof window === "undefined" || navigator.onLine === false) return;
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (connection?.saveData) return;
  const urls = [...new Set(exerciseIds.flatMap((id) => photosFor(id)?.images ?? []))];
  void (async () => { for (const url of urls) { try { await fetch(url); } catch { return; } } })();
}

function useOnline() {
  const [online, setOnline] = useState(() => typeof navigator === "undefined" || navigator.onLine !== false);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine !== false);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => { window.removeEventListener("online", update); window.removeEventListener("offline", update); };
  }, []);
  return online;
}

function MoveVideo({ video, onFail }: { video: VideoEntry; onFail: () => void }) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let acknowledged = false;
    const receive = (event: MessageEvent) => {
      if (event.origin !== "https://player.vimeo.com" || event.source !== ref.current?.contentWindow) return;
      let data = event.data;
      if (typeof data === "string") { try { data = JSON.parse(data); } catch { return; } }
      if (data?.event === "ready" || data?.event === "loaded" || data?.event === "playing") { acknowledged = true; setReady(true); }
      if (data?.event === "error") onFail();
    };
    window.addEventListener("message", receive);
    const timeout = window.setTimeout(() => { if (!acknowledged) onFail(); }, 15000);
    return () => { window.removeEventListener("message", receive); window.clearTimeout(timeout); };
  }, [video.id, onFail]);
  return (
    <div className="overflow-hidden rounded-lg bg-black" data-testid="move-video" data-video-id={video.id} data-video-ready={String(ready)}>
      {!ready ? <p role="status" className="p-2 text-center text-xs text-white">Loading demonstration…</p> : null}
      <iframe ref={ref} src={vimeoEmbedUrl(video).replace("loop=1", "loop=0")} title={`${video.title} (exercise demo video)`} className="block w-full border-0" style={{ aspectRatio: `${video.width} / ${video.height}`, maxHeight: "62vh" }} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" data-testid="video-frame" onError={onFail} />
    </div>
  );
}

function PhotoStills({ exerciseId }: { exerciseId: string }) {
  const photos = photosFor(exerciseId);
  const [failed, setFailed] = useState(false);
  if (!photos) return null;
  if (failed) return <p role="status" className="rounded-lg border border-line p-4 text-sm text-ink-soft">The photographs could not load. Follow the written form cues below, or reconnect and retry.</p>;
  return (
    <figure className="space-y-2" data-testid="photo-stills">
      {photos.match === "close" ? <p className="text-xs text-ink-soft"><b>Related variation:</b> {photos.name}. Equipment or position may differ from your plan.</p> : null}
      <div className="media-stills">{photos.images.map((src, i) => <div key={src}><img src={src} alt={`${photos.name}: ${i === 0 ? "starting" : "finishing"} position`} onError={() => setFailed(true)} loading="lazy" /><p className="mt-1 text-xs text-ink-soft">{i === 0 ? "01 / Starting position" : "02 / Finishing position"}</p></div>)}</div>
      <figcaption className="text-xs text-ink-faint"><a href={PHOTO_SOURCE.url} target="_blank" rel="noreferrer noopener" className="underline">Photos: Free Exercise DB</a> · Public domain · Saved with the app</figcaption>
    </figure>
  );
}

export function MoveMedia(props: { exerciseId: string; compact?: boolean; className?: string }) {
  return <ExerciseMedia key={props.exerciseId} {...props} />;
}

function ExerciseMedia({ exerciseId, compact, className }: { exerciseId: string; compact?: boolean; className?: string }) {
  const video = videoFor(exerciseId);
  const photos = photosFor(exerciseId);
  const online = useOnline();
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const [showPhotos, setShowPhotos] = useState(!video);
  const onFail = useRef(() => { setFailed(true); setPlaying(false); setShowPhotos(true); }).current;
  const [posterFailed, setPosterFailed] = useState(false);
  const play = () => { setFailed(false); setPlaying(true); setShowPhotos(false); };
  return (
    <div className={cn("space-y-3", className)} data-testid="move-media" data-media={playing ? "video" : photos && showPhotos ? "photos" : "preview"}>
      {video?.match === "close" ? <p className="rounded-lg border border-warn/30 bg-warn/10 p-3 text-xs leading-relaxed" data-testid="video-close-match"><b>Related variation.</b> {video.matchNote ?? `This clip shows ${video.title}. Equipment or body position differs from your plan; follow your plan’s form cues.`}</p> : null}
      {playing && video && online ? <MoveVideo video={video} onFail={onFail} /> : video && online && !showPhotos ? (
        <button type="button" className="media-poster" onClick={play} aria-label={`Play demonstration: ${exerciseById(exerciseId)?.name ?? video.title}`} data-testid="play-demonstration">
          {video.thumbnail && !posterFailed ? <img src={video.thumbnail} alt="" onError={() => setPosterFailed(true)} /> : null}
          <span className="media-play"><Play className="size-4" fill="currentColor" />Play demonstration<span className="text-xs font-normal">{Math.ceil(video.duration / 60) > 1 ? `${Math.floor(video.duration / 60)}:${String(video.duration % 60).padStart(2, "0")}` : `${video.duration}s`}</span></span>
        </button>
      ) : null}
      {failed ? <p role="status" className="text-sm text-ink-soft" data-testid="video-fallback-note">The video could not load. {photos ? "Use the photographs below, retry, or open the creator’s video." : "Use the written form cues below, retry, or open the creator’s video."}</p> : null}
      {!online && video ? <p role="status" className="text-sm text-ink-soft">Video needs a connection. {photos ? "Your saved photographs are below." : "Your written form cues are available below."}</p> : null}
      {photos && (showPhotos || !online || !compact) ? <PhotoStills exerciseId={exerciseId} /> : null}
      {!video && !photos ? <div className="rounded-lg border border-line bg-canvas p-4 text-sm text-ink-soft"><b className="block text-ink">Written guidance</b><p className="mt-1">{NO_VIDEO[exerciseId] ?? "No verified demonstration is available for this movement yet."} See the instructions below.</p></div> : null}
      {video ? <div className="flex flex-wrap items-center gap-2 text-xs text-ink-soft">
        {online && (!playing || showPhotos) ? <Button tone="outline" size="sm" onClick={play} data-testid="show-video">{failed ? <RotateCcw className="size-3.5" /> : <Play className="size-3.5" />}{failed ? "Retry video" : "Video"}</Button> : null}
        {photos && !showPhotos && online ? <Button tone="outline" size="sm" onClick={() => { setPlaying(false); setShowPhotos(true); }} data-testid="show-photos"><ImageIcon className="size-3.5" />Photos</Button> : null}
        <a href={vimeoPageUrl(video.id)} target="_blank" rel="noreferrer noopener" className="inline-flex min-h-10 items-center gap-1 underline" data-testid="video-credit">{videoCredit(video)}<ExternalLink className="size-3 shrink-0" /></a>
      </div> : null}
    </div>
  );
}
