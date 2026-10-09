import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createHash } from "node:crypto";

// Build output only: include code, styles and fonts on the first offline install.
const root = 'dist/client';
async function files(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => entry.isDirectory() ? files(join(directory, entry.name)) : join(directory, entry.name)));
  return nested.flat();
}
const assets = (await files(join(root, 'assets'))).filter((path) => !path.endsWith('.map')).map((path) => './' + path.slice(root.length + 1));
assets.push('./human-man.obj');
await writeFile(join(root, 'offline-assets.json'), JSON.stringify(assets));
// Make the worker change whenever its installable files change. Otherwise an
// unchanged sw.js never reinstalls after a new build introduces new chunk URLs.
const hash = createHash('sha256');
for (const path of [...await files(join(root, 'assets')), ...await files(join(root, 'media/exercises')), join(root, 'human-man.obj')].sort()) {
  hash.update(path); hash.update(await readFile(path));
}
const revision = hash.digest('hex').slice(0, 12);
const workerPath = join(root, 'sw.js');
const worker = (await readFile(workerPath, 'utf8')).replace(/const VERSION = "[^"]+";/, `const VERSION = "dm-v9-editorial-media-${revision}";`);
await writeFile(workerPath, worker);
console.log(`Offline bundle: ${assets.length} application assets plus licensed exercise photographs.`);
