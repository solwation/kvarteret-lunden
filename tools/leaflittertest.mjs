// Public #317 (original #2105, 9113aa3 + #2118, dd9088d0): fallen autumn leaves: how much lies per month (none in summer, spring
// or the snow months, growing through the autumn), where (denser under crowns and along kerbs), deterministic, and a chained
// fragment patch that leaves the vertices alone. The public has no wet ground (#2099 is original-only), so the litter is chained
// directly onto the public's own ground materials. Phones compile only the mean tint (#2118, `-lite` keys).
// node --test tools/leaflittertest.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { litterAmount, litterColors, bakeLitterDensity, LeafLitter, leafLitter, litterUniforms, litterGLSL } from '../src/leaflitter.js';
import { asphaltMaterial } from '../src/asphaltsurface.js';
import { gravelMaterial } from '../src/gravelsurface.js';
import { pavingMaterial } from '../src/pavingsurface.js';
import { streetWear } from '../src/streetwear.js';
import { readFileSync } from 'node:fs';
import { lowMemory } from '../src/lowmemory.js';
import { LEAF_LITTER as L, SEASON } from '../src/config.js';
import { hasNativeVertexCompile } from '../src/vertexcompile.js';

const run = (m, frag = THREE.ShaderLib.standard.fragmentShader) => { const sh = { uniforms: {}, vertexShader: THREE.ShaderLib.standard.vertexShader, fragmentShader: frag }; m.onBeforeCompile(sh, null); return sh; };

test('amount per month: none in summer, winter/snow and spring; growing September → October → November', () => {
  for (const m of [3, 4, 5, 6, 7, 8]) assert.equal(litterAmount(m), 0, `month ${m}`);
  for (const m of SEASON.snowMonths) assert.equal(litterAmount(m), 0, `snow month ${m}`);
  assert.equal(litterAmount(12, { ...L, months: { ...L.months, 12: 1 } }), 0, 'snow wins over any autumn share');
  assert.ok(litterAmount(9) > 0 && litterAmount(9) < litterAmount(10) && litterAmount(10) < litterAmount(11) && litterAmount(11) <= 1);
  for (const m of [9, 10, 11]) assert.equal(litterColors(m).length, 2);
  assert.equal(litterColors(7), null); assert.equal(litterColors(1), null);
});

const box = { x0: -20, x1: 20, z0: -20, z1: 20 };
const at = (d, x, z) => d.data[Math.floor((z - box.z0) / L.cell) * d.nx + Math.floor((x - box.x0) / L.cell)] / 255;
const mean = (d, x0, x1, z0, z1) => { let s = 0, n = 0; for (let z = z0; z < z1; z += L.cell) for (let x = x0; x < x1; x += L.cell) { s += at(d, x + 0.01, z + 0.01); n++; } return s / n; };

test('density: sparse open ground, denser under a crown and along a kerb; deterministic', () => {
  const trees = [{ x: -10, z: -10, r: 4 }], road = [{ x: 0, z: 5, w: 6 }, { x: 19, z: 5, w: 6 }]; // edges at z 2 and 8
  const d = bakeLitterDensity({ trees, roads: [road], box });
  const open = mean(d, 5, 15, -15, -5);
  assert.ok(open > 0 && open < 0.25, `sparse open ground (${open})`);
  assert.ok(at(d, -10, -10) > 0.8 && at(d, -10, -10) > 4 * open, 'densest at the trunk');
  assert.ok(at(d, -10 + 2, -10) > open && at(d, -10 + 2, -10) < at(d, -10, -10), 'thinning towards the crown edge');
  assert.ok(at(d, 10, 2) > 3 * open && at(d, 10, 8) > 3 * open, 'a band along both kerbs');
  assert.ok(at(d, 10, 5) < 0.3, 'not across the middle of the road');
  assert.deepEqual(bakeLitterDensity({ trees, roads: [road], box }).data, d.data, 'same input, same map');
  assert.equal(d.nx, 40); assert.equal(d.nz, 40);
});

test('LeafLitter follows the months: amount and tones in the uniforms, map baked once on the first autumn month', () => {
  let reads = 0;
  const s = new LeafLitter({ trees: () => { reads++; return [{ x: 0, z: 0, r: 3 }]; } });
  s.apply(7); assert.equal(litterUniforms.uLitter.value.x, 0); assert.equal(s.texture, null, 'no bake out of season');
  assert.deepEqual([9, 10, 11].map((m) => s.apply(m)), [9, 10, 11].map((m) => litterAmount(m)));
  assert.equal(reads, 1, 'baked once');
  assert.equal(litterUniforms.uLitterFresh.value.getHex(), new THREE.Color(L.colors[11][0]).getHex());
  s.apply(1); assert.equal(litterUniforms.uLitter.value.x, 0, 'gone under snow');
  s.apply(4); assert.equal(litterUniforms.uLitter.value.x, 0, 'gone in spring');
  s.detail = false; assert.equal(litterUniforms.uLitter.value.y, 0); s.detail = true;
});

test('public consumers: chained last onto the own ground patches, unique program keys, fragment only, once', () => {
  assert.equal(lowMemory, false, 'node runs the desktop default');
  const asphalt = asphaltMaterial(), sh = run(asphalt, THREE.ShaderLib.physical.fragmentShader);
  assert.equal(asphalt.userData.leafLitter, 'asphalt');
  assert.match(asphalt.customProgramCacheKey(), /^asphalt-surface-2072\|wear2103-asphalt\|litter2105-asphalt$/);
  // as in the original (wear → wet → litter): the outer wrapper inserts its step first after <roughnessmap_fragment>, so the wear's polish scales the leaves too
  assert.ok(sh.fragmentShader.indexOf('uLitterMap, litUV') < sh.fragmentShader.indexOf('roughnessFactor *= wearRough'), 'litter step before the wear polish');
  assert.equal(sh.vertexShader.includes('uLitter'), false); assert.ok(hasNativeVertexCompile(asphalt));
  assert.equal(sh.uniforms.uLitterMap, litterUniforms.uLitterMap, 'shared uniform objects');
  assert.equal(run(asphalt).fragmentShader.split('uniform sampler2D uLitterMap').length, 2, 'declared once');
  const keys = [
    asphalt, gravelMaterial(0xcfc6b2), pavingMaterial(null, { snow: true }),
    leafLitter(streetWear(new THREE.MeshStandardMaterial(), 'paint'), 'paint'), leafLitter(new THREE.MeshStandardMaterial(), 'paving'),
  ].map((m) => m.customProgramCacheKey());
  assert.match(keys[1], /^gravel-surface-2096\|litter2105-gravel$/);
  assert.match(keys[2], /\|litter2105-paving$/);
  assert.match(keys[3], /\|wear2103-paint\|litter2105-paint$/);
  assert.equal(new Set(keys.slice(0, 4)).size, 4, 'unique keys per patched shader');
  assert.equal(keys[4], keys[2], 'plain paving and the patio paving: the same patched code (no own compile hook), so one key is right');
  // the lawn (grass.js needs a canvas): chained after its own key; the other consumers wrap their material in place
  const src = (f) => readFileSync(new URL(`../src/${f}`, import.meta.url), 'utf8');
  assert.match(src('grass.js'), /customProgramCacheKey = \(\) => 'grass-patches-688';\n  leafLitter\(material, 'grass'\);/);
  for (const [f, n] of [['street.js', 4], ['courtyard.js', 2], ['riverpark.js', 1], ['sitebackdrop.js', 1], ['surroundings.js', 1]])
    assert.equal(src(f).match(/leafLitter\([^;]*'(?:paving|asphalt|paint)'\)/g)?.length, n, f);
  assert.equal(pavingMaterial(null).userData.leafLitter, undefined, 'the sheltered portik paving stays clean');
  assert.equal(leafLitter(asphalt, 'grass').userData.leafLitter, 'asphalt', 'patched once');
  for (const k of Object.keys(L.kinds)) assert.match(litterGLSL(k).surface, /if \(uLitter\.x > 0\.0\)/, 'out of season skips the branch');
  assert.throws(() => leafLitter(new THREE.MeshStandardMaterial(), 'lava'));
});

const DETAIL = /litterLeaf|litterHash|fwidth/;
test('phones (#2118): the mean tint only, every uniform bound, own -lite keys; desktop keeps the leaf shapes', () => {
  const keys = new Set();
  for (const kind of Object.keys(L.kinds)) {
    const m = leafLitter(new THREE.MeshStandardMaterial(), kind, '', true), sh = run(m);
    assert.doesNotMatch(sh.fragmentShader, DETAIL, `${kind}: no leaf grids on phones`);
    for (const u of ['uLitter', 'uLitterMap', 'uLitterBox', 'uLitterFresh', 'uLitterOld']) assert.ok(sh.uniforms[u], `${kind}: ${u}`);
    assert.match(sh.fragmentShader, /diffuseColor\.rgb = mix\(diffuseColor\.rgb, litMean, litAlpha\)/, 'the autumn tint stays');
    assert.match(m.customProgramCacheKey(), new RegExp(`\\|litter2105-${kind}-lite$`));
    keys.add(m.customProgramCacheKey());
    const desk = leafLitter(new THREE.MeshStandardMaterial(), kind);
    assert.notEqual(desk.customProgramCacheKey(), m.customProgramCacheKey());
    assert.match(run(desk).fragmentShader, /litterLeaf\(litW\.xz, /);
    assert.ok(run(desk).fragmentShader.length > sh.fragmentShader.length, 'smaller to compile');
  }
  assert.equal(keys.size, Object.keys(L.kinds).length);
  const full = litterGLSL('asphalt').surface, lite = litterGLSL('asphalt', L, '', true).surface;
  for (const line of ['float litFar = ', 'float litMulch = ', 'roughnessFactor = mix(roughnessFactor, ', 'litC = texture2D(uLitterMap, litUV).r']) {
    const pick = (s) => s.split('\n').find((l) => l.includes(line))?.trim();
    assert.ok(pick(lite) && pick(lite) === pick(full), line);
  }
});
