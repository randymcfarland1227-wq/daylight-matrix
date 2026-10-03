import { useEffect, useState } from "react";
import { ExternalLink, Play, WifiOff } from "lucide-react";
import { demoUrl } from "@/lib/daylight/form";
import { embedUrl, thumbUrl, videoFor, watchUrl } from "@/lib/daylight/videos";

function useOnline(): boolean {
  const [online, setOnline] = useState(() => (typeof navigator === "undefined" ? true : navigator.onLine !== false));
  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    return () => {
      window.removeEventListener("online", up);
      window.removeEventListener("offline", down);
    };
  }, []);
  return online;
}

/** Click-to-play demo. Shows a thumbnail only; the youtube-nocookie iframe is mounted after the first tap.
 *  No verified clip, offline, or a failed embed all fall back to the YouTube search link (demoUrl). */
export function VideoEmbed({ exerciseId, name }: { exerciseId: string; name: string }) {
  const video = videoFor(exerciseId);
  const online = useOnline();
  const [playing, setPlaying] = useState(false);
  const [thumbFailed, setThumbFailed] = useState(false);
  const [slow, setSlow] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // If the player never reports load (blocked, captive network), offer the search link instead of a blank box.
  useEffect(() => {
    if (!playing || loaded) return;
    const t = window.setTimeout(() => setSlow(true), 12000);
    return () => window.clearTimeout(t);
  }, [playing, loaded]);

  if (!video) {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-surface-2 p-4 text-sm text-ink-soft" data-testid="video-fallback">
        No verified video for this move yet.{" "}
        <a href={demoUrl(exerciseId)} target="_blank" rel="noreferrer noopener" className="font-bold text-forest underline" data-testid="video-fallback-link">
          Search YouTube for {name}
        </a>
        .
      </div>
    );
  }

  const showFrame = playing && online;
  const trouble = !online || slow;

  return (
    <section className="overflow-hidden rounded-3xl border border-line bg-surface" data-testid="video-embed" aria-label={`Demo video: ${name}`}>
      <div className="relative aspect-video w-full bg-ink/90">
        {showFrame ? (
          <iframe
            data-testid="video-frame"
            className="absolute inset-0 size-full"
            src={embedUrl(video.id)}
            title={`${video.title} (${video.channel})`}
            loading="lazy"
            allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            onLoad={() => setLoaded(true)}
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            disabled={!online}
            aria-label={`Play demo video: ${name}`}
            data-testid="video-play"
            className="tap group absolute inset-0 flex size-full items-center justify-center disabled:cursor-not-allowed"
          >
            {!thumbFailed ? (
              <img
                src={thumbUrl(video.id)}
                alt=""
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                data-testid="video-thumb"
                onError={() => setThumbFailed(true)}
                className="absolute inset-0 size-full object-cover"
              />
            ) : null}
            <span className="absolute inset-0 bg-black/25 transition group-hover:bg-black/15" aria-hidden />
            <span className="relative flex size-16 items-center justify-center rounded-full bg-white/95 text-forest shadow-lg" aria-hidden>
              {online ? <Play className="size-7 translate-x-0.5 fill-current" /> : <WifiOff className="size-7" />}
            </span>
          </button>
        )}
      </div>
      <div className="space-y-1.5 p-3 text-sm">
        <p className="font-bold leading-snug" data-testid="video-title">{video.title}</p>
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <p className="text-ink-soft" data-testid="video-credit">Video by {video.channel}</p>
          <a href={watchUrl(video.id)} target="_blank" rel="noreferrer noopener" className="tap inline-flex min-h-9 items-center gap-1.5 font-bold text-forest underline" data-testid="video-open">
            Open on YouTube <ExternalLink className="size-4" />
          </a>
        </div>
        {trouble ? (
          <p className="rounded-xl bg-surface-2 p-2.5 text-ink-soft" role="status" data-testid="video-trouble">
            {!online ? "You're offline, so the video can't load." : "The video is slow or blocked here."}{" "}
            <a href={demoUrl(exerciseId)} target="_blank" rel="noreferrer noopener" className="font-bold text-forest underline" data-testid="video-fallback-link">
              Search YouTube instead
            </a>
            . The written steps below work offline.
          </p>
        ) : null}
      </div>
    </section>
  );
}
