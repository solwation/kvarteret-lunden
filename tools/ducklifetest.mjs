// Public #344 (original #2202 tools/ducklifetest.mjs, neutral parts adapted): local dusk/night shore rest of the ambient ducks.
// node --test tools/ducklifetest.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { duckNight, duckSleepPose, DUCK_LIFE as L } from '../src/ducklife.js';
import { DuckFlock } from '../src/duckbrain.js';
import { duckHabitat } from '../src/duckhabitat.js';
import { DuckActivity, duckPose } from '../src/duckmotion.js';
import { groundBelowDeckY } from '../src/surroundings.js';
const habitat = () => duckHabitat(groundBelowDeckY);
test('smooth dusk, night and dawn on the local hour', () => {
  assert.equal(duckNight(12), 0); assert.equal(duckNight(18), 0); assert.equal(duckNight(19), .5); assert.equal(duckNight(23), 1);
  assert.equal(duckNight(5), 1); assert.equal(duckNight(6), .5); assert.equal(duckNight(7), 0); assert.equal(duckNight(25), 1); assert.equal(duckNight(NaN), 0);
});
test('real habitat pairs walk to dry supported shore at night, rest without swimming, and wake in the morning', () => {
  const h = habitat(), f = new DuckFlock(h), ids = f.brains.map(b => [b.id, b.mate, b.female]);
  for (let i = 0; i < 2000; i++) f.update(.05);
  const day = f.brains.map(b => [b.x, b.z]);
  for (let i = 0; i < 10000; i++) f.update(.05, () => true, duckNight(23));
  assert(f.brains.every(b => b.sleeping && !b.moving && !b.swimming)); assert(!f.grouping);
  assert.deepEqual(f.brains.map(b => [b.id, b.mate, b.female]), ids);
  for (const b of f.brains) {
    assert(h.contains(b.x, b.z)); assert(!h.surface(b.x, b.z).water); assert(Math.abs(b.y - h.surface(b.x, b.z).y) < 1e-8);
    const a = new DuckActivity(1); for (let i = 0; i < 5000; i++) a.update(.1, b); assert.equal(a.kind, null); assert.equal(a.wake, 0);
  }
  for (let p = 0; p < 2; p++) { const a = f.brains[p * 2], b = f.brains[p * 2 + 1], d = Math.hypot(a.x - b.x, a.z - b.z); assert(d > .45 && d < 2); }
  for (let i = 0; i < 100; i++) f.update(.05, () => true, duckNight(8));
  assert(f.brains.every(b => !b.sleeping && !b.roosting)); assert.notDeepEqual(f.brains.map(b => [b.x, b.z]), day);
});
test('dusk keeps day movement until the settle threshold; hidden pairs freeze; far birds never run the rest AI', () => {
  const h = habitat(), f = new DuckFlock(h), g = new DuckFlock(h);
  for (let i = 0; i < 600; i++) { f.update(.05, () => true, 0); g.update(.05); }
  assert.deepEqual(f.brains.map(b => [b.x, b.z, b.seed]), g.brains.map(b => [b.x, b.z, b.seed]), 'day identical to the unchanged flock');
  const frozen = f.brains.map(b => [b.x, b.z, b.seed]); for (let i = 0; i < 10; i++) f.update(.1, () => false, 1);
  assert.deepEqual(f.brains.map(b => [b.x, b.z, b.seed]), frozen);
});
test('resting pose crouches and tucks without a new mesh; roosting blocks activities', () => {
  const p = duckSleepPose(duckPose({}, null), 1, 0); assert(p.ty < 0); assert.equal(p.pitch, L.tuck); assert.equal(p.flap, false);
  const a = new DuckActivity(3), b = { roosting: true, swimming: false }; a.next = 0; a.update(.1, b); assert.equal(a.kind, null);
});
