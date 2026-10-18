// Analytic depth-precision check (from the original's #1276, dd9927ef). SwiftShader has float-like depth, so the z-fight itself
// cannot be drawn without a GPU; this prints the 24-bit depth step before/after and checks the glass materials carry the offset.
// Run: node tools/depthprecision-check.mjs
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {VIEW_NEAR, DECAL_OFFSET} from '../src/config.js';
const FAR = 700, BITS = 24;
const step = (near, d) => d * d * (FAR - near) / (FAR * near * 2 ** BITS); // metres per depth step at distance d
const cm = (n, d) => (step(n, d) * 100).toFixed(2);
console.log(`depth step at 300 m: near ${VIEW_NEAR.min} -> ${cm(VIEW_NEAR.min, 300)} cm, near ${VIEW_NEAR.outdoor} -> ${cm(VIEW_NEAR.outdoor, 300)} cm`);
assert.ok(step(VIEW_NEAR.outdoor, 300) < step(VIEW_NEAR.min, 300) / 1.9);
assert.ok(DECAL_OFFSET.factor < 0 && DECAL_OFFSET.units < 0);
// near plane's far corner must stay inside the body radius for the widest supported aspect (phones in landscape, ~2.4)
const t = Math.tan(65 * Math.PI / 360), corner = (a) => Math.sqrt(1 + t * t * (1 + a * a));
console.log(`corner distance of near ${VIEW_NEAR.outdoor} at aspect 16:9 / 2.4: ${(VIEW_NEAR.outdoor * corner(16 / 9)).toFixed(3)} / ${(VIEW_NEAR.outdoor * corner(2.4)).toFixed(3)} m (body ${VIEW_NEAR.bodyRadius})`);
assert.ok(VIEW_NEAR.outdoor * corner(16 / 9) <= VIEW_NEAR.bodyRadius);
for (const f of ['neighborglass', 'sitebackdrop', 'southbackdrop']) {
  const s = await readFile(new URL(`../src/${f}.js`, import.meta.url), 'utf8');
  assert.ok(/polygonOffsetFactor:DECAL_OFFSET\.factor,polygonOffsetUnits:DECAL_OFFSET\.units/.test(s), `${f}.js glass lacks DECAL_OFFSET`);
}
console.log('ALL OK');
