import test from 'node:test';
import assert from 'node:assert/strict';
import { lilyLayout, floraWindow, floraSeason } from './riverflora.js';
import { RIVER_FLORA as F } from './config.js';

const hw = (s) => 2.5 + Math.sin(s / 40), L = 640;
const lay = lilyLayout({ length: L, hw });

test('the same leaves every time, sorted along the river, inside the channel and clear of its ends', () => {
  assert.deepEqual(lilyLayout({ length: L, hw }), lay);
  assert.ok(lay.length > 30, String(lay.length));
  for (let i = 1; i < lay.length; i++) assert.ok(lay[i].s >= lay[i - 1].s);
  for (const p of lay) assert.ok(p.s >= F.ends && p.s <= L - F.ends && Math.abs(p.u) >= 0.2 * hw(p.s) && Math.abs(p.u) + p.r < hw(p.s), `${p.s} ${p.u}`);
});

test('leaves do not overlap; some flower', () => {
  for (let i = 0; i < lay.length; i++) for (let j = i + 1; j < lay.length; j++) assert.ok(Math.hypot(lay[i].s - lay[j].s, lay[i].u - lay[j].u) >= lay[i].r + lay[j].r - 1e-9);
  const fl = lay.filter((p) => p.flower).length;
  assert.ok(fl > 0 && fl < lay.length * 0.6, `${fl} of ${lay.length} flower`);
});

test('nothing where a pier stands', () => {
  const at = lay[Math.floor(lay.length / 2)], blocked = (s, u, r) => Math.hypot(s - at.s, u - at.u) < 1 + r, b = lilyLayout({ length: L, hw, blocked });
  for (const p of b) assert.ok(Math.hypot(p.s - at.s, p.u - at.u) >= 1);
  assert.ok(b.length < lay.length);
});

test('the window and the seasons', () => {
  const [a, b] = floraWindow(lay, 200, 60);
  lay.forEach((p, i) => assert.equal(i >= a && i < b, Math.abs(p.s - 200) <= 60));
  assert.deepEqual(floraWindow(lay, -500, 30), [0, 0]);
  assert.deepEqual(floraSeason(1), { leaves: false, bloom: false });
  assert.deepEqual(floraSeason(5), { leaves: true, bloom: false });
  assert.deepEqual(floraSeason(7), { leaves: true, bloom: true });
});
