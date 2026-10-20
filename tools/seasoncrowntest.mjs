// Public #104: node --test tools/seasoncrowntest.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import * as THREE from 'three';
import { SEASON } from '../src/config.js';
import { registerTrees, applySeason } from '../src/seasons.js';

// Freeze the real public module before this import, with its own independent registry.
const beforeSource = execFileSync('git', ['show', 'c4bae878:src/seasons.js'], { encoding: 'utf8' })
  .replace(/^import .*;\n/gm, '').replace(/^export /gm, '');
const before = new Function('THREE', 'SEASON', beforeSource + '\nreturn { registerTrees, applySeason };')(THREE, SEASON);
const make = () => {
  const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(), new THREE.MeshStandardMaterial(), 2);
  const seeds = [0, 1].map(i => ({
    pos: new THREE.Vector3(i * 3, 4, 2), rot: new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), i * .7),
    scale: new THREE.Vector3(2 + i, 3, 2), r1: .2 + i * .6, r2: .1 + i * .7, r3: .3, r4: i * .5,
  }));
  seeds.forEach((s, i) => { mesh.setMatrixAt(i, new THREE.Matrix4().compose(s.pos, s.rot, s.scale)); mesh.setColorAt(i, new THREE.Color(0x497643)); });
  mesh.computeBoundingSphere(); mesh.computeBoundingBox();
  return { mesh, seeds };
};

test('all months keep exact public crown matrices and colours while bare batches stop drawing', () => {
  const old = make(), now = make();
  before.registerTrees(old.mesh, old.seeds); registerTrees(now.mesh, now.seeds);
  const { geometry, material, instanceMatrix, instanceColor, boundingSphere, boundingBox, raycast } = now.mesh;
  for (const month of [1, 3, 7, 12, 2, 4, 5, 6, 8, 9, 10, 11, 1, 7]) {
    before.applySeason(month); applySeason(month);
    assert.deepEqual(now.mesh.instanceMatrix.array, old.mesh.instanceMatrix.array, `month ${month} matrices`);
    assert.deepEqual(now.mesh.instanceColor.array, old.mesh.instanceColor.array, `month ${month} colours`);
    assert.equal(now.mesh.visible, SEASON.trees[month][3] > 0, `month ${month} visibility`);
    assert.equal(now.mesh.geometry, geometry); assert.equal(now.mesh.material, material);
    assert.equal(now.mesh.instanceMatrix, instanceMatrix); assert.equal(now.mesh.instanceColor, instanceColor);
    assert.equal(now.mesh.boundingSphere, boundingSphere); assert.equal(now.mesh.boundingBox, boundingBox);
    assert.deepEqual(now.mesh.boundingSphere, old.mesh.boundingSphere); assert.deepEqual(now.mesh.boundingBox, old.mesh.boundingBox);
    assert.equal(now.mesh.raycast, raycast); assert.equal(now.mesh.layers.mask, old.mesh.layers.mask);
  }
});

test('first leaves and summer restore batches without overriding a hidden parent or physical trunk', () => {
  const { mesh, seeds } = make();
  const parent = new THREE.Group(), trunk = new THREE.Mesh(new THREE.BoxGeometry(1, 4, 1), new THREE.MeshBasicMaterial());
  parent.add(mesh, trunk); parent.visible = false;
  registerTrees(mesh, seeds);
  const physical = trunk.raycast, geometry = trunk.geometry;
  applySeason(12); assert.equal(mesh.visible, false);
  applySeason(3); assert.equal(mesh.visible, true); assert.equal(parent.visible, false);
  applySeason(1); applySeason(7);
  assert.equal(mesh.visible, true); assert.equal(trunk.visible, true);
  assert.equal(trunk.raycast, physical); assert.equal(trunk.geometry, geometry);
  assert(new THREE.Raycaster(new THREE.Vector3(3, 0, 0), new THREE.Vector3(-1, 0, 0)).intersectObject(trunk).length > 0);
});
