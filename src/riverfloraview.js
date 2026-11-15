// #282 (original #1956): the water lilies of Höje å, drawn (config.js RIVER_FLORA; where they are: src/riverflora.js).
// Leaves lying on the surface near the banks and their flowers in summer: two instanced meshes = at most two draw calls, no texture,
// no shadow, no light of their own. Only the leaves within RIVER_FLORA.range m up / downstream of the eye are filled in (rewritten when
// the eye has moved a few metres along the river) and nothing is drawn further than `drawDist` m from the river. Scenery only: nothing
// can be picked, fed or collided with.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { RIVER_FLORA } from './config.js';
import { driftRiver } from './riverdriftview.js';
import { lilyLayout, floraWindow, floraSeason } from './riverflora.js';

const F = RIVER_FLORA, L = F.lilies;
const Q = new THREE.Quaternion(), P = new THREE.Vector3(), S = new THREE.Vector3(), UP = new THREE.Vector3(0, 1, 0);

const paint = (g, hex, shade = null) => {
  g = g.index ? g.toNonIndexed() : g;
  g.deleteAttribute('uv');
  const c = new THREE.Color(hex), p = g.attributes.position, a = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) { const k = shade ? shade(p.getX(i), p.getY(i), p.getZ(i)) : 1; a[i * 3] = c.r * k; a[i * 3 + 1] = c.g * k; a[i * 3 + 2] = c.b * k; }
  g.setAttribute('color', new THREE.BufferAttribute(a, 3));
  return g;
};
/** A water-lily leaf of radius 1 lying at y 0: a round leaf with its notch. */
export function lilyGeometry() {
  return paint(new THREE.CircleGeometry(1, 14, 0.22, Math.PI * 2 - 0.44).rotateX(-Math.PI / 2), L.pad, (x, y, z) => 0.8 + 0.2 * Math.hypot(x, z));
}
/** A water-lily flower of radius 1 sitting at y 0: two rings of pointed petals round a yellow heart. */
export function flowerGeometry() {
  const parts = [];
  for (const [n, len, lift, turn] of [[8, 1, 0.35, 0], [6, 0.7, 0.75, 0.4]]) for (let i = 0; i < n; i++) {
    const g = new THREE.BufferGeometry(), w = 0.3;
    g.setAttribute('position', new THREE.Float32BufferAttribute([0, 0.05, -w * 0.5, 0, 0.05, w * 0.5, len, lift * len, 0], 3)); g.computeVertexNormals();
    parts.push(paint(g.rotateY((i / n) * Math.PI * 2 + turn), L.petal, (x, y) => 0.82 + 0.25 * y));
  }
  parts.push(paint(new THREE.SphereGeometry(0.22, 6, 4).translate(0, 0.2, 0), L.heart));
  return mergeGeometries(parts);
}

export class RiverLilies {
  constructor({ scene } = {}) {
    const r = this.river = driftRiver(), { path, waterY } = r, o = {};
    const blocked = (s, u, rad) => r.obstacles.some((b) => Math.hypot(b.s - s, b.u - u) < b.r + rad);
    const items = this.items = { lilies: [], flowers: [] };
    for (const e of lilyLayout({ length: path.length, hw: (s) => path.at(s, o).hw, blocked })) {
      path.at(e.s, o);
      const x = o.x - o.tz * e.u, z = o.z + o.tx * e.u, y = waterY(e.s) + L.lift;
      Q.setFromAxisAngle(UP, e.yaw); S.setScalar(e.r); P.set(x, y, z);
      items.lilies.push({ s: e.s, x, y, z, r: e.r, m: new THREE.Matrix4().compose(P, Q, S) });
      if (e.flower) { S.setScalar(e.r * 0.55); P.set(x + Math.cos(e.yaw) * e.r * 0.9, y, z + Math.sin(e.yaw) * e.r * 0.9); items.flowers.push({ s: e.s, x: P.x, y, z: P.z, m: new THREE.Matrix4().compose(P, Q, S) }); }
    }
    this.near = {}; this.at = -1e9;
    const leaf = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide });
    const mesh = (name, geo, list) => {
      const m = new THREE.InstancedMesh(geo, leaf, Math.max(1, this.capacity(list)));
      m.name = name; m.count = 0; m.visible = false; m.frustumCulled = false; m.raycast = () => {}; m.castShadow = m.receiveShadow = false;
      m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.renderOrder = 2; // (after the opaque water they lie on)
      scene?.add(m);
      return m;
    };
    this.meshes = { lilies: mesh('river-lilies', lilyGeometry(), items.lilies), flowers: mesh('river-lily-flowers', flowerGeometry(), items.flowers) };
  }
  /** The most entries of `list` any window of 2 x range m holds. */
  capacity(list) { let best = 0, a = 0; for (let b = 0; b < list.length; b++) { while (list[b].s - list[a].s > 2 * F.range) a++; best = Math.max(best, b - a + 1); } return best; }
  /** The leaves round chainage `sc` into the meshes. */
  fill(sc) {
    for (const [k, list] of Object.entries(this.items)) {
      const m = this.meshes[k], [a, b] = floraWindow(list, sc, F.range), n = Math.min(b - a, m.instanceMatrix.count);
      for (let i = 0; i < n; i++) m.setMatrixAt(i, list[a + i].m);
      m.count = n; m.instanceMatrix.needsUpdate = true;
    }
    this.at = sc;
  }
  /** Each frame. `eye`: the camera's world position; `hidden`: nothing is drawn (below ground); `month` 1 … 12. True while drawn. */
  update(eye, hidden = false, month = 7) {
    const m = this.meshes, near = this.near, season = floraSeason(month);
    const on = !hidden && season.leaves && this.river.path.nearest(eye.x, eye.z, near).d < F.drawDist;
    if (!on) { m.lilies.visible = m.flowers.visible = false; return false; }
    if (Math.abs(near.s - this.at) > 8) this.fill(near.s);
    m.lilies.visible = m.lilies.count > 0; m.flowers.visible = season.bloom && m.flowers.count > 0;
    return m.lilies.visible;
  }
}
