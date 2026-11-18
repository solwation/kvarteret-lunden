// Public #314 (original #2100, c54c3b6): node --test tools/aerialhazetest.mjs
// Aerial perspective for the public's fixed daylight: fog chunk patch, the clear-day haze curve, the haze colour for the flat
// background and the high fixed sun. Function-level checks only (no whole-file baselines).
import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import { HAZE, LIGHTING } from '../src/config.js';
import { installHaze, hazeUniforms, hazeCurve, hazeState, applyHaze, clearHaze } from '../src/aerialhaze.js';

const NEAR = 200, FAR = 650; // src/main.js scene.fog
const BG = new T.Color(0xcbd9dd); // src/main.js scene.background = scene.fog.color
const SUN = new T.Vector3(...LIGHTING.sky.sun.pos).normalize();
const pub = () => hazeState({ sunDir: SUN, horizon: BG.clone(), glow: new T.Color(0, 0, 0), glowAmt: 0, day: 1, oc: 0 }); // as src/main.js

test('the fog chunks are patched once and every fogged ShaderLib entry shares the haze uniforms', () => {
  assert.equal(installHaze(), false, 'already installed at import');
  for (const k of ['fog_pars_vertex', 'fog_vertex', 'fog_pars_fragment']) assert.match(T.ShaderChunk[k], /vFogDir/);
  assert.match(T.ShaderChunk.fog_fragment, /hazeCurve\( vFogDepth, fogNear, fogFar \)/);
  assert.match(T.ShaderChunk.fog_fragment, /float fogFactor/, 'groundglow.js reads fogFactor after the chunk');
  assert.equal((T.ShaderChunk.fog_fragment.match(/gl_FragColor\.rgb = mix/g) || []).length, 1);
  for (const k of ['standard', 'physical', 'lambert', 'phong', 'basic', 'points', 'sprite', 'toon', 'matcap'])
    assert.equal(T.ShaderLib[k].uniforms.fogHazeSun, hazeUniforms.fogHazeSun, k);
  // per-material clones (built-ins) and merged custom ShaderMaterials (groundao.js) keep the same objects
  const clone = T.UniformsUtils.clone(T.ShaderLib.standard.uniforms), merged = T.UniformsUtils.merge([T.UniformsLib.fog, { a: { value: 1 } }]);
  for (const u of [clone, merged, new T.ShaderMaterial({ uniforms: merged }).clone().uniforms]) for (const k in hazeUniforms) assert.equal(u[k].value, hazeUniforms[k].value);
});

test('public curve: untouched before fog near, full at far, monotonic, slightly denser mid-range than stock', () => {
  const s = pub();
  assert.equal(s.w, HAZE.clear.w);
  for (let d = 0; d <= NEAR; d += 10) assert.equal(hazeCurve(d, NEAR, FAR, s.w, s.k), 0);
  assert.ok(Math.abs(hazeCurve(FAR, NEAR, FAR, s.w, s.k) - 1) < 1e-9); assert.equal(hazeCurve(900, NEAR, FAR, s.w, s.k), 1);
  let last = 0; for (let d = NEAR; d <= FAR; d += 5) { const f = hazeCurve(d, NEAR, FAR, s.w, s.k); assert.ok(f >= last - 1e-12); last = f; }
  const mid = hazeCurve(350, NEAR, FAR, s.w, s.k) - T.MathUtils.smoothstep(350, NEAR, FAR);
  assert.ok(mid > 0 && mid < 0.15, 'close to the old curve, a little more haze at 350 m');
});

test('public colour: bluer mid haze, no warm term (flat background, fixed high sun), full fog = background', () => {
  const s = pub();
  assert.ok(s.blue.b > 0 && s.blue.r < 0 && s.blue.r < s.blue.g, 'mid haze shifts towards blue');
  assert.ok(Math.abs(s.warm.r) + Math.abs(s.warm.g) + Math.abs(s.warm.b) < 1e-9, 'no warm side');
  assert.ok(s.scatter.r + s.scatter.g + s.scatter.b < 1e-9, 'no scatter halo');
  assert.ok(SUN.y > 0.8, 'the fixed sun is high');
  // the shader's haze colour at fogFactor f: fog + blue * 4f(1-f) (+ warm * sun * f = 0): equal to the fog colour at f = 1
  const at = (f, k) => BG.clone().convertLinearToSRGB()[k] + s.blue[k] * 4 * f * (1 - f);
  for (const k of ['r', 'g', 'b']) { assert.equal(at(1, k), BG.clone().convertLinearToSRGB()[k]); assert.ok(at(0.5, k) >= 0 && at(0.5, k) <= 1, k); }
});

test('apply/clear write the shared uniforms', () => {
  const s = pub(); applyHaze(s);
  assert.equal(hazeUniforms.fogHazeWarm.value.w, s.w); assert.equal(hazeUniforms.fogHazeBlue.value.z, s.blue.b); assert.equal(hazeUniforms.fogHazeSun.value.y, SUN.y);
  clearHaze(); assert.equal(hazeUniforms.fogHazeWarm.value.w, 0); assert.equal(hazeUniforms.fogHazeBlue.value.x, 0);
});
