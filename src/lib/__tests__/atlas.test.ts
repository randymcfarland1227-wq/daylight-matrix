import { test } from 'node:test';
import assert from 'node:assert/strict';
import { entities, entity, NERVES } from '../daylight/anatomy';
import { referenceFor, SOURCES, DETAIL } from '../daylight/atlas';
import { NERVE_ATLAS } from '../daylight/nerveAtlas';
import { SUBS } from '../daylight/muscles';

test('all atlas pages have complete education, practice and valid source references', () => {
  for (const e of entities().values()) {
    const r = referenceFor(e);
    for (const key of ['function', 'feel', 'skip', 'dosage', 'progress', 'watch'] as const) assert.ok(r[key]?.length > 20, `${e.id}.${key}`);
    for (const key of ['everyday', 'structure', 'fatigue', 'irritation', 'practice', 'recovery', 'sources'] as const) assert.ok(r[key].length, `${e.id}.${key}`);
    for (const source of r.sources) assert.ok(SOURCES[source]?.url.startsWith('https://'), `${e.id} source ${source}`);
    for (const connection of r.connections) for (const id of connection.ids) assert.ok(entity(id), `${e.id} -> ${id}`);
  }
  assert.equal(Object.keys(DETAIL).length, SUBS.length);
});

test('nerve pages separate motor and sensory supply; pure sensory nerves have no motor target', () => {
  assert.equal(NERVES.length, 32);
  for (const n of NERVES) {
    const a = referenceFor(entity(n.id)!);
    assert.ok(a.nerve?.route && a.nerve.motor && a.nerve.sensory && a.nerve.roots, n.id);
    if (NERVE_ATLAS[n.id].type === 'Sensory only') assert.deepEqual(entity(n.id)!.learn.worksWith, []);
  }
});

test('corrected motor supply and joint boundaries are retained', () => {
  assert.deepEqual(entity('teres-major')!.learn.nerves, ['nerve-subscapular']);
  assert.ok(!entity('nerve-sciatic')!.learn.worksWith!.includes('glute-max'));
  assert.ok(!entity('nerve-accessory')!.learn.worksWith!.includes('rhomboids'));
  assert.deepEqual(entity('tibialis')!.learn.nerves, ['nerve-deep-fibular']);
  assert.deepEqual(entity('soleus')!.learn.joints, ['ankle']);
  assert.deepEqual(entity('quad-vl')!.learn.joints, ['knee']);
  assert.ok(entity('transverse')!.learn.nerves!.includes('nerve-iliohypogastric'));
  assert.match(referenceFor(entity('core')!).function, /pressure/);
});
