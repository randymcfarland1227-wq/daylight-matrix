/**
 * Photos attached to notes. Stored in IndexedDB (not localStorage: photos are far too big for it).
 * Notes keep only the image ids (`Observation.imageIds`); the bytes live here, keyed by id.
 */
const DB = "daylight-note-images";
const STORE = "images";
export const MAX_EDGE = 1280;
export const JPEG_QUALITY = 0.82;

export type StoredImage = { id: string; blob: Blob; thumb: Blob; w: number; h: number; createdAt: string };

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: "id" });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T> | void): Promise<T | undefined> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const r = fn(t.objectStore(STORE));
    t.oncomplete = () => resolve(r ? (r.result as T) : undefined);
    t.onerror = () => reject(t.error);
  });
}

export const putImage = (img: StoredImage) => tx("readwrite", (s) => s.put(img));
export const getImage = (id: string) => tx<StoredImage>("readonly", (s) => s.get(id));
export const deleteImage = (id: string) => tx("readwrite", (s) => s.delete(id));
export const allImages = async () => (await tx<StoredImage[]>("readonly", (s) => s.getAll())) ?? [];

/** Scale so the longest edge is at most `max`. Pure, for tests. */
export function fitSize(w: number, h: number, max: number): { w: number; h: number } {
  const k = Math.min(1, max / Math.max(w, h));
  return { w: Math.max(1, Math.round(w * k)), h: Math.max(1, Math.round(h * k)) };
}

async function encode(src: ImageBitmap | HTMLImageElement, w: number, h: number, max: number, q: number): Promise<{ blob: Blob; w: number; h: number }> {
  const size = fitSize(w, h, max);
  const c = document.createElement("canvas");
  c.width = size.w;
  c.height = size.h;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, size.w, size.h);
  ctx.drawImage(src, 0, 0, size.w, size.h);
  const blob = await new Promise<Blob>((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error("encode failed"))), "image/jpeg", q));
  return { blob, ...size };
}

async function decode(file: Blob): Promise<{ src: ImageBitmap | HTMLImageElement; w: number; h: number }> {
  if (typeof createImageBitmap === "function") {
    try {
      // respects EXIF orientation from phone cameras
      const b = await createImageBitmap(file, { imageOrientation: "from-image" } as ImageBitmapOptions);
      return { src: b, w: b.width, h: b.height };
    } catch {
      /* fall back (e.g. HEIC on some browsers) */
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return { src: img, w: img.naturalWidth, h: img.naturalHeight };
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

const newImageId = () => `img-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

/** Resize to max 1280px JPEG (+ a 320px thumbnail) and store it. Returns the new id. */
export async function addImageFromFile(file: Blob): Promise<string> {
  const { src, w, h } = await decode(file);
  const full = await encode(src, w, h, MAX_EDGE, JPEG_QUALITY);
  const thumb = await encode(src, w, h, 320, 0.75);
  const id = newImageId();
  await putImage({ id, blob: full.blob, thumb: thumb.blob, w: full.w, h: full.h, createdAt: new Date().toISOString() });
  return id;
}

const blobToDataUrl = (b: Blob) =>
  new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result));
    r.onerror = () => rej(r.error);
    r.readAsDataURL(b);
  });
const dataUrlToBlob = async (d: string) => (await fetch(d)).blob();

/** Add the photos referenced by `ids` into an exported JSON string as `noteImages: { id: dataURL }`. */
export async function withImages(json: string, ids: string[]): Promise<string> {
  if (!ids.length) return json;
  const parsed = JSON.parse(json) as Record<string, unknown>;
  const out: Record<string, string> = {};
  for (const id of new Set(ids)) {
    const img = await getImage(id).catch(() => undefined);
    if (img) out[id] = await blobToDataUrl(img.blob);
  }
  parsed.noteImages = out;
  return JSON.stringify(parsed, null, 2);
}

/** Restore photos from a backup (skips ids already on this device). Returns how many were added. */
export async function restoreImages(raw: string): Promise<number> {
  let map: Record<string, string> | undefined;
  try {
    map = (JSON.parse(raw) as { noteImages?: Record<string, string> }).noteImages;
  } catch {
    return 0;
  }
  if (!map) return 0;
  let n = 0;
  for (const [id, data] of Object.entries(map)) {
    if (typeof data !== "string" || !data.startsWith("data:image/")) continue;
    if (await getImage(id).catch(() => undefined)) continue;
    const blob = await dataUrlToBlob(data);
    const { src, w, h } = await decode(blob);
    const thumb = await encode(src, w, h, 320, 0.75);
    await putImage({ id, blob, thumb: thumb.blob, w, h, createdAt: new Date().toISOString() });
    n++;
  }
  return n;
}

export const noteImageIds = (obs: { imageIds?: string[] }[]) => obs.flatMap((o) => o.imageIds ?? []);
