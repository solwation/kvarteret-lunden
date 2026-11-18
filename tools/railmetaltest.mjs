// Public #309 (original #2089, da83c3a): matt railing metal (src/railmetal.js, byte-identical with the original).
// Patches three's real MeshStandardMaterial sources (node_modules three@0.170.0, the import map's version), checks the
// anchors, that positions stay native, that the patch is static (no uniforms/time, no dependency on other shader
// patches) and that every public railing consumer uses it on the same geometry calls as before.
import test from 'node:test'; import assert from 'node:assert/strict'; import { readFileSync } from 'node:fs';
import * as THREE from 'three';
import { railMetal, railMetalShader } from '../src/railmetal.js';
import { hasNativeVertexCompile } from '../src/vertexcompile.js';
import { RAIL_METAL as R } from '../src/config.js';
const src = (f) => readFileSync(`src/${f}`, 'utf8');

test('patch applies to three 0.170 standard/physical sources, after the chunks it needs', () => {
  const lib = THREE.ShaderLib.physical, sh = railMetalShader({ vertexShader: lib.vertexShader, fragmentShader: lib.fragmentShader, uniforms: {} });
  const fs = sh.fragmentShader, at = (s) => fs.indexOf(s);
  assert(at('vRailPos = ') < 0 && sh.vertexShader.includes('vRailPos = ( modelMatrix * railWorld ).xyz;'));
  assert(at('railMask') > at('#include <color_fragment>') && at('railMask') < at('#include <roughnessmap_fragment>'));
  assert(at('roughnessFactor = mix( roughnessFactor, railRough') > at('#include <roughnessmap_fragment>'));
  const rim = at('float railRim');
  assert(rim > at('#include <lights_fragment_end>') && rim < at('#include <aomap_fragment>'), 'edge light after lights, before AO');
  // positions: the vertex shader only gains a varying, every line of three's original is kept in order
  const orig = lib.vertexShader.split('\n'), added = []; let i = 0;
  for (const line of sh.vertexShader.split('\n')) if (line === orig[i]) i++; else added.push(line);
  assert.equal(i, orig.length, 'three\'s vertex shader kept in order');
  assert(added.every((l) => !/gl_Position|transformed\s*=/.test(l)), 'only a varying is added');
  assert.deepEqual(sh.uniforms, {}, 'no uniforms');
  const code = src('railmetal.js').replace(/\/\/.*$/gm, '');
  assert(!/time|Time|random/.test(code), 'static');
  assert.deepEqual([...code.matchAll(/from '([^']+)'/g)].map((m) => m[1]).sort(), ['./config.js', './vertexcompile.js'], 'no other shader patch (the original lampwash.js does not exist here)');
});

test('material: one program key, fragment-only audit, mixed batch keeps its roughness', () => {
  const a = railMetal(new THREE.MeshStandardMaterial({ roughness: .3 })), b = railMetal(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .6 }), null);
  assert.equal(a.roughness, R.roughness); assert.equal(b.roughness, .6);
  assert.equal(a.customProgramCacheKey(), b.customProgramCacheKey());
  assert(hasNativeVertexCompile(a) && hasNativeVertexCompile(b), 'detail.js culling still trusts the positions');
  assert(R.far <= 1 && R.roughness >= .5 && R.streak + R.mottle < .2 && R.rim < .3 && R.tint < .06, 'matt and calm');
});

test('consumers: every public outdoor railing material, colours kept, same geometry pushes as before', () => {
  const ex = src('exterior.js'), su = src('surroundings.js'), bs = src('busstop.js');
  assert.match(ex, /add\(rails, railMetal\(new THREE\.MeshStandardMaterial\(\{ color: COLORS\.balcony, metalness: 0\.3 \}\)\)\)/);
  assert.match(ex, /terraceRailMaterial = railMetal\(new THREE\.MeshStandardMaterial\(\{ color: Lf\.door, metalness: 0\.2 \}\)\)/);
  assert.match(su, /lightRail = railMetal\(new THREE\.MeshStandardMaterial\(\{ color: 0xb9bdbd, metalness: 0\.3 \}\)\)/);
  assert.equal((su.match(/railMetal\(new THREE\.MeshStandardMaterial\(\{ map: railTexture\(\), alphaTest: 0\.5, side: THREE\.DoubleSide \}\)\)/g) ?? []).length, 2);
  assert.match(bs, /railMetal\(new THREE\.MeshStandardMaterial\(\{ color: 0xffffff, vertexColors: true, roughness: 0\.6, metalness: 0\.2 \}\), null\)/);
  assert.equal((ex.match(/rails\.push\(/g) ?? []).length, 6); assert.equal((ex.match(/balc\.push\(/g) ?? []).length, 4);
  assert.equal((ex.match(/railMetal\(/g) ?? []).length, 2); assert.equal((su.match(/railMetal\(/g) ?? []).length, 3); assert.equal((bs.match(/railMetal\(/g) ?? []).length, 1);
});
