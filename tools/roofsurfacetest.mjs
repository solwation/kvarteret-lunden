// Public #308 (original #2088 0c5f4a5 + #2093 9da798a): shared roof map + fall-line UVs (src/roofsurface.js) on the public
// roof batches, and Hus L's capping as an edge band. node --test tools/roofsurfacetest.mjs (needs node_modules/three).
// Function-level comparisons against the public base this port started from; no whole-file baselines.
import test from 'node:test'; import assert from 'node:assert/strict'; import { readFileSync } from 'node:fs'; import { execFileSync } from 'node:child_process';
import * as THREE from 'three';
import { roofMapPixels, roofMapMean, roofColor, roofUV } from '../src/roofsurface.js';
import { ROOF_SURFACE as R, SEASON, VERTICAL, HUS_L } from '../src/config.js';
import { registerSnow, registerSeasonal, applySeason } from '../src/seasons.js';
const BASE = process.env.BASELINE || '345bce1';
const src = (f) => readFileSync(new URL('../' + f, import.meta.url), 'utf8'), at = (f) => execFileSync('git', ['show', `${BASE}:${f}`], { encoding: 'utf8' });
const fn = (s, name) => { const i = s.indexOf(`function ${name}(`); assert(i >= 0, name); return s.slice(i, s.indexOf('\n}\n', i)); };

test('map: deterministic, small, neutral seams and calm weathering that tiles; average colour kept', () => {
  const p = roofMapPixels(), n = R.size, pw = n / R.panels;
  assert.equal(p.length, n * n); assert(n <= 128, 'one small map');
  assert.equal(p, roofMapPixels(), 'cached'); assert(!/Math\.random|performance|Date/.test(src('src/roofsurface.js')));
  const col = (x) => { let s = 0; for (let y = 0; y < n; y++) s += p[y * n + x]; return s / n; };
  for (let k = 0; k < R.panels; k++) { assert(col(k * pw) < col(k * pw + pw / 2) - 25, 'dark seam shadow'); assert(col(k * pw + 1) > col(k * pw + pw / 2) + 10, 'light seam lip'); }
  const field = []; for (let y = 0; y < n; y++) for (let x = 3; x < pw - 2; x++) field.push(p[y * n + x]);
  const lo = Math.min(...field), hi = Math.max(...field); assert(hi - lo > 20 && hi - lo < 100, `weathering visible but discreet (${lo}…${hi})`);
  let edge = 0; for (let y = 0; y < n; y++) edge = Math.max(edge, Math.abs(p[y * n + 3] - p[y * n + 3 + pw]) - 2 * R.strip);
  for (let x = 3; x < n; x++) if (x % pw > 2 && x % pw < pw - 1) edge = Math.max(edge, Math.abs(p[x] - p[(n - 1) * n + x]));
  assert(edge < 20, `tiles without a visible edge (${edge})`);
  const m = roofMapMean(); assert(m > .5 && m < .8);
  for (const hex of [0x4b5157, 0x6d7175, 0x5c6369, 0x2c3034, 0x33383c]) { const c = roofColor(hex), ref = new THREE.Color(hex); for (const k of ['r', 'g', 'b']) assert(Math.abs(c[k] * m - ref[k]) < 1e-9, 'average colour unchanged'); }
});

const tri = (pts) => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pts.flat(), 3)); return g; };
const uvOf = (g, i) => [g.attributes.uv.getX(i), g.attributes.uv.getY(i)];
test('UVs: seams follow the fall line, flat faces fall back to x, geometry untouched', () => {
  const slope = [[0, 5, 0], [0, 4, 4], [6, 4, 4], [0, 5, 0], [6, 4, 4], [6, 5, 0]];
  for (const pts of [slope, slope.map((q, i) => slope[i - i % 3 + [0, 2, 1][i % 3]])]) {
    const g = tri(pts), before = g.attributes.position.array.slice(); roofUV(g, 'metal');
    assert.deepEqual(g.attributes.position.array, before); assert.equal(g.attributes.uv.count, 6);
    const i0 = pts.findIndex((q) => q[0] === 0 && q[2] === 0), i1 = pts.findIndex((q) => q[0] === 0 && q[2] === 4), i2 = pts.findIndex((q) => q[0] === 6 && q[2] === 4);
    assert(Math.abs(uvOf(g, i0)[0] - uvOf(g, i1)[0]) < 1e-6, 'u constant down the fall line');
    assert(Math.abs(Math.abs(uvOf(g, i2)[0] - uvOf(g, i1)[0]) - 6 / (R.kinds.metal.seam * R.panels)) < 1e-5, 'one seam per kind.seam metres');
    assert(Math.abs(Math.abs(uvOf(g, i1)[1] - uvOf(g, i0)[1]) - Math.hypot(4, 1) / R.kinds.metal.length) < 1e-5, 'v = metres down the slope');
  }
  const flat = tri([[0, 9, 0], [0, 9, 2], [3, 9, 0]]); roofUV(flat, 'felt');
  assert(Math.abs(uvOf(flat, 0)[0] - uvOf(flat, 2)[0]) < 1e-6 && Math.abs(uvOf(flat, 1)[0] - uvOf(flat, 0)[0]) > .1, 'flat: strips along x (*guess*)');
  const box = new THREE.BoxGeometry(4, .3, 2), idx = box.index.array.slice(), pos = box.attributes.position.array.slice(); roofUV(box, 'felt');
  assert.deepEqual(box.index.array, idx); assert.deepEqual(box.attributes.position.array, pos); assert(box.attributes.uv.array.every(Number.isFinite));
});

test('snow still replaces the map and restores it in summer', () => {
  const tex = new THREE.Texture(), mat = new THREE.MeshStandardMaterial({ map: tex, color: roofColor(0x4b5157) }), base = mat.color.clone();
  registerSnow(mat, SEASON.snow.roof); let hook = 0; registerSeasonal(() => hook++);
  applySeason(SEASON.snowMonths[0]); assert.equal(mat.map, null); assert.equal(mat.color.getHex(), new THREE.Color(SEASON.snow.roof).getHex());
  applySeason(7); assert.equal(mat.map, tex); assert(mat.color.equals(base)); assert.equal(hook, 2);
  for (const [f, s] of [['src/sitebackdrop.js', 'roofMat.vertexColors=colored'], ['src/southbackdrop.js', 'mats.roof.vertexColors=colored']]) assert(src(f).includes(s), f);
});

test('public roof consumers: map + UVs before merging, public colours kept, roof geometry/walk builders unchanged', () => {
  const sb = src('src/sitebackdrop.js'), so = src('src/southbackdrop.js'), ex = src('src/exterior.js'), su = src('src/surroundings.js'), sf = src('src/schoolfacade.js');
  assert(sb.indexOf("roofUV(g,k==='karpRoof'?'felt':'metal')") > 0 && sb.indexOf("roofUV(g,k==='karpRoof'?'felt':'metal')") < sb.indexOf('mergeGeometries(list.slice('));
  for (const m of ['roof:new THREE.MeshStandardMaterial({map:roofMap(),color:roofColor(W.roof)', 'mats.karpRoof=new THREE.MeshStandardMaterial({map:roofMap(),color:roofColor(W.karp.colors.roof)', 'mats.schoolRoof=new THREE.MeshStandardMaterial({map:roofMap(),color:roofColor(0xffffff,SCHOOL_ROOF_LEVEL)']) assert(sb.includes(m), m);
  assert(so.indexOf("for(const g of parts.roof)roofUV(g,'metal')") > 0 && so.indexOf("for(const g of parts.roof)roofUV(g,'metal')") < so.indexOf("m.name='south-'+k"));
  assert(so.includes('roof:new THREE.MeshStandardMaterial({map:roofMap(),color:roofColor(),vertexColors:true'));
  assert(ex.includes("add(roofs.map((g) => roofUV(g, 'felt')), roofMat)") && ex.indexOf('map: roofMap(), color: roofColor(0x4b5157)') < ex.indexOf('registerSnow(roofMat'));
  for (const s of ["roofUV(g, 'felt')); // #2088", 'school.map((b) => roofUV(roof(b)))', 'oldB.map((b) => roofUV(roof(b)))', "dormers(side('longhouse'))].map((g) => roofUV(g))"]) assert(su.includes(s), s);
  for (const hex of ['0x6d7175', '0x5c6369', '0x2c3034', '0x33383c']) assert(su.includes(`map: roofMap(), color: roofColor(${hex})`), hex);
  assert(!/schoolTextures\(\)\.roof|maps\.roof/.test(sb), 'the old school seam map is not used');
  assert(sf.includes('export const SCHOOL_ROOF_LEVEL') && fn(sf, 'schoolRoofTint') === fn(at('src/schoolfacade.js'), 'schoolRoofTint'));
  for (const f of ['src/buildingroofs.js', 'src/roofs.js', 'src/seasons.js', 'src/pavilionroof.js', 'src/karpfacade.js', 'src/hepcat.js', 'src/lod.js']) assert.equal(src(f), at(f), f + ' unchanged');
  // #356: #345 (790965a) only collects chimney steam outlets in campusfacades.js; everything else stays byte-identical.
  const steam345 = [[', steamOutlets = [];', ';'], [/\n *steamOutlets\.push\(\[x, y \+ S\.chimney\[1\] - \.28, z\]\);[^\n]*/, ''], ['{ roofY, windows, steamOutlets, ', '{ roofY, windows, ']];
  let cf = src('src/campusfacades.js');
  for (const [from, to] of steam345) { const next = cf.replace(from, to); assert.notEqual(next, cf, 'campusfacades.js #345 line ' + from); cf = next; }
  assert.equal(cf, at('src/campusfacades.js'), 'src/campusfacades.js unchanged apart from #345 steam outlets');
  for (const name of ['hipRoof', 'roof', 'roofSpec', 'addSurroundingRoofWalk']) if (su.includes(`function ${name}(`)) assert.equal(fn(su, name), fn(at('src/surroundings.js'), name), name);
  for (const name of ['boxGeo', 'tiltedPanelGeo', 'husLLayout']) assert.equal(fn(ex, name), fn(at('src/exterior.js'), name), name);
});

test('Hus L: the capping is an edge band (rectRing); felt box, walk surface and solar panels unchanged', async () => {
  const { rectRing, husLLayout } = await import('../src/exterior.js');
  const area = ([a, b, c, d]) => (b - a) * (d - c), overlap = (p, q) => Math.max(0, Math.min(p[1], q[1]) - Math.max(p[0], q[0])) * Math.max(0, Math.min(p[3], q[3]) - Math.max(p[2], q[2]));
  const r = rectRing(0, 10, 0, 4, 0.3); assert.equal(r.length, 4);
  for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) assert.equal(overlap(r[i], r[j]), 0, 'no overlap');
  assert(Math.abs(r.reduce((s, q) => s + area(q), 0) - (40 - 9.4 * 3.4)) < 1e-9, 'outline minus the inner rect');
  assert.equal(rectRing(0, 1, 0, 1, 5).reduce((s, q) => s + area(q), 0), 1, 'a band wider than the rect covers it, no more');
  const V = VERTICAL.roof, { xw, xe } = husLLayout(), loftD = HUS_L.loftgangDepth, zs = 12.7 - HUS_L.court.setback;
  assert.equal(V.source, 'assumption'); assert(V.cappingWidth > 0.1 && V.cappingWidth < 0.6); assert(V.cappingDrop > 0 && V.cappingDrop < V.buildUp);
  const felt = [xw - 0.1, xe + 0.1, loftD - 0.1, zs + 0.1], covered = rectRing(xw - 0.13, xe + 0.13, loftD - 0.13, zs + 0.13, V.cappingWidth).reduce((s, q) => s + overlap(q, felt), 0);
  const share = 1 - covered / area(felt); assert(share > 0.85, `felt visible on ${(share * 100).toFixed(1)} %`);
  const ex = src('src/exterior.js');
  assert(!/boxGeo\(xw - 0\.13, xe \+ 0\.13, upperTop \+ rb, upperTop \+ rc/.test(ex), 'the old full-roof slab is gone');
  assert(/rectRing\(xw - 0\.13, xe \+ 0\.13, loftD - 0\.13, zs \+ 0\.13, VERTICAL\.roof\.cappingWidth\)/.test(ex));
  for (const s of ['roofs.push(boxGeo(xw - 0.1, xe + 0.1, upperTop, upperTop + rb, loftD - 0.1, zs + 0.1));', 'roofY = upperTop + rc', "surf('L-roof', 'Hus L:s tak', xw - 0.13, xe + 0.13, loftD - 0.13, zs + 0.13, roofY)", 'upperTop + rc + H.solar.lift']) {
    assert(ex.includes(s), s); assert(at('src/exterior.js').includes(s), 'base had ' + s);
  }
  console.log(`# Hus L roof ${(xe - xw).toFixed(2)} × ${(zs - loftD).toFixed(2)} m; felt visible ${(share * 100).toFixed(1)} %`);
});
