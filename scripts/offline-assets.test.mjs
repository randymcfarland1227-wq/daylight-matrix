import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { test } from 'node:test';

const script = new URL('./offline-assets.mjs', import.meta.url).pathname;
test('offline release changes when a lazy chunk or bundled photo changes, and is stable otherwise', async () => {
  const root = await mkdtemp(join(tmpdir(), 'daylight-offline-test-'));
  try {
    await mkdir(join(root, 'dist/client/assets'), {recursive:true});
    await mkdir(join(root, 'dist/client/media/exercises'), {recursive:true});
    await writeFile(join(root, 'dist/client/assets/body.js'), 'export const body = 1;');
    await writeFile(join(root, 'dist/client/media/exercises/demo.jpg'), 'photo-one');
    await writeFile(join(root, 'dist/client/human-man.obj'), 'model-one');
    await writeFile(join(root, 'dist/client/sw.js'), 'const VERSION = "dm-v10-body-journal";');
    const run = async () => {
      execFileSync(process.execPath, [script], {cwd:root, stdio:'pipe'});
      return readFile(join(root, 'dist/client/sw.js'), 'utf8');
    };
    const initial = await run();
    assert.match(initial, /dm-v10-body-journal-[a-f0-9]{12}/);
    assert.equal(await run(), initial);
    assert.deepEqual(JSON.parse(await readFile(join(root, 'dist/client/offline-assets.json'), 'utf8')), ['./assets/body.js']);
    await writeFile(join(root, 'dist/client/assets/body.js'), 'export const body = 2;');
    const changedChunk = await run();
    assert.notEqual(changedChunk, initial);
    await writeFile(join(root, 'dist/client/media/exercises/demo.jpg'), 'photo-two');
    const changedPhoto = await run();
    assert.notEqual(changedPhoto, changedChunk);
    await writeFile(join(root, 'dist/client/human-man.obj'), 'model-two');
    assert.equal(await run(), changedPhoto, 'unused legacy model does not trigger or burden offline installs');
  } finally { await rm(root, {recursive:true, force:true}); }
});
