import { useState } from "react";
import { Check, Dumbbell } from "lucide-react";
import { photosFor } from "@/lib/daylight/exImages";
import { videoFor } from "@/lib/daylight/videos";
import { exerciseById } from "@/lib/daylight/exercises";
import { MoveMedia } from "./MoveMedia";

/** Compatibility wrapper: every instruction surface now uses real media. */
export const MoveArt = MoveMedia;

export function MoveThumb({ exerciseId, size = 44, done }: { exerciseId: string; size?: number; done?: boolean }) {
  const [failed, setFailed] = useState(false);
  const src = photosFor(exerciseId)?.images[0] ?? videoFor(exerciseId)?.thumbnail;
  return (
    <span className="relative grid shrink-0 place-items-center overflow-hidden rounded-md border border-line bg-surface-2" style={{ width: size, height: size }}>
      {src && !failed ? <img src={src} alt={`${exerciseById(exerciseId)?.name ?? "Exercise"} preview`} loading="lazy" onError={() => setFailed(true)} className="size-full object-cover" /> : <Dumbbell className="size-5 text-ink-faint" aria-label="Exercise media unavailable" />}
      {done ? <span className="absolute bottom-0 right-0 rounded-tl bg-accent p-0.5 text-on-accent"><Check className="size-3" /></span> : null}
    </span>
  );
}
