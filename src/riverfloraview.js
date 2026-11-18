// #282 (original #1956): the water lilies of Höje å, drawn (config.js RIVER_FLORA; where they are: src/riverflora.js).
// Leaves lying on the surface near the banks and their flowers in summer: two instanced meshes = at most two draw calls, no texture,
// no shadow, no light of their own. Only the leaves within RIVER_FLORA.range m up / downstream of the eye are filled in (rewritten when
// the eye has moved a few metres along the river) and nothing is drawn further than `drawDist` m from the river. Scenery only: nothing
// can be picked, fed or collided with.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { RIVER_FLORA, LILY_SURFACE as LS } from './config.js';
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
/** A low cupped leaf of radius 1: its centre touches y 0, its notched rim rises only a few normalized mm. */
export function lilyGeometry() {
  const span = Math.PI * 2 - 2 * LS.notch, veins = Array.from({ length: LS.veins }, (_, i) => LS.notch + span * (i + 0.5) / LS.veins);
  // Narrow extra angular columns let a faint vein remain narrow instead of shading a whole fan sector.
  const angles = [...new Set([...Array.from({ length: LS.padSegments + 1 }, (_, i) => LS.notch + span * i / LS.padSegments),
    ...veins.flatMap(a => [a - LS.veinWidth, a, a + LS.veinWidth])])].sort((a, b) => a - b);
  const pos = [0, 0, 0], color = [], index = [], c = new THREE.Color(F.lilies.pad), cols = angles.length;
  color.push(c.r * 0.8, c.g * 0.8, c.b * 0.8);
  for (let row = 1; row <= LS.padRings; row++) for (const a of angles) {
    const r = row / LS.padRings, vein = Math.max(0, 1 - Math.min(...veins.map(v => Math.abs(a - v))) / LS.veinWidth);
    pos.push(r * Math.cos(a), LS.cup * r * r + LS.veinHeight * Math.sin(Math.PI * r) * vein, -r * Math.sin(a));
    const k = (0.8 + 0.2 * r) * (1 - LS.veinShade * vein * r);
    color.push(c.r * k, c.g * k, c.b * k);
  }
  for (let j = 0; j < cols - 1; j++) index.push(0, 1 + j, 2 + j);
  for (let row = 1; row < LS.padRings; row++) for (let j = 0; j < cols - 1; j++) {
    const a = 1 + (row - 1) * cols + j, b = a + cols;
    index.push(a, b, b + 1, a, b + 1, a + 1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(color, 3));
  g.setIndex(index); g.computeVertexNormals();
  return g.toNonIndexed();
}
/** A rounded petal with a curved long axis and softly raised edges; one point closes each end without degenerate faces. */
export function lilyPetalGeometry(len, lift, width) {
  const pos = [0, 0.05, 0], index = [], cols = LS.petalAcross + 1;
  for (let row = 1; row < LS.petalRows; row++) {
    const t = row / LS.petalRows, hw = width * Math.sin(Math.PI * t) ** 0.65;
    for (let j = 0; j < cols; j++) {
      const s = j / LS.petalAcross * 2 - 1;
      pos.push(len * t, 0.05 + (lift * len - 0.05) * t * t + LS.petalCup * len * s * s * Math.sin(Math.PI * t), hw * s);
    }
  }
  const tip = pos.length / 3; pos.push(len, lift * len, 0);
  for (let j = 0; j < cols - 1; j++) index.push(0, 2 + j, 1 + j);
  for (let row = 0; row < LS.petalRows - 2; row++) for (let j = 0; j < cols - 1; j++) {
    const a = 1 + row * cols + j, b = a + cols;
    index.push(a, b + 1, b, a, a + 1, b + 1);
  }
  const last = 1 + (LS.petalRows - 2) * cols;
  for (let j = 0; j < cols - 1; j++) index.push(last + j, last + j + 1, tip);
  const g = new THREE.BufferGeometry();g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));g.setIndex(index);g.computeVertexNormals();
  return g;
}
/** The original two 8 + 6 petal rings and yellow heart, with low rounded overlapping petals. */
export function flowerGeometry() {
  const parts = [];
  for (const [n, len, lift, turn, width] of LS.rings) for (let i = 0; i < n; i++) {
    const g = lilyPetalGeometry(len, lift, width);
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
