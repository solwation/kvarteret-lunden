// Public #237: selected model only, original 578ecc09b02c7355e299fc58d0e0127b622ee85a.
import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

/** A unit sphere squashed to radii (rx, ry, rz) at (x, y, z), in one colour; `belly`: lighter underneath (vertex colours blended by the normal).
 * #1716: `seg` [width, height] segments, `fur`: ± that much brightness noise per vertex (a mottled coat), from `rnd`. */
const blob = (rx, ry, rz, x, y, z, hex, belly = null, seg = [9, 7], fur = 0, rnd = Math.random) => {
  const g = new THREE.SphereGeometry(1, seg[0], seg[1]); g.deleteAttribute('uv');
  const nrm = g.attributes.normal, a = new THREE.Color(hex), b = belly === null ? a : new THREE.Color(belly), col = new Float32Array(nrm.count * 3), m = new THREE.Color();
  for (let i = 0; i < nrm.count; i++) { m.copy(b).lerp(a, THREE.MathUtils.smoothstep(nrm.getY(i), -0.45, 0.25)); if (fur) m.multiplyScalar(1 + (rnd() - 0.5) * 2 * fur); m.toArray(col, i * 3); }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.scale(rx, ry, rz); g.translate(x, y, z); return g;
};
const seeded = (seed) => () => ((seed = seed * 16807 % 2147483647) / 2147483647);
const shade = (hex, k) => new THREE.Color(hex).multiplyScalar(k).getHex();
const mixHex = (a, b, k) => new THREE.Color(a).lerp(new THREE.Color(b), k).getHex();
const UP = new THREE.Vector3(0, 1, 0), QT = new THREE.Quaternion(); // m behind the body centre: where it sits (#1716)
/** #1716: a hair tuft: an open cone `len` long from `at` along `dir`, `root` colour at the base fading to `tip` at the point. */
function tuft(at, dir, len, r, root, tip, segs) {
  const g = new THREE.ConeGeometry(r, len, segs, 1, true); g.deleteAttribute('uv');
  const pos = g.attributes.position, col = new Float32Array(pos.count * 3), c0 = new THREE.Color(root), c1 = new THREE.Color(tip), m = new THREE.Color();
  for (let i = 0; i < pos.count; i++) m.copy(c0).lerp(c1, pos.getY(i) / len + 0.5).toArray(col, i * 3);
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.translate(0, len / 2, 0); g.applyQuaternion(QT.setFromUnitVectors(UP, dir.clone().normalize())); g.translate(at.x, at.y, at.z); return g;
}
/** #1716: a soft hair lock: a small ellipsoid `len` long from `at` along `dir` (rounded, not a spike), `root` colour fading to `tip`. */
function lock(at, dir, len, r, root, tip, seg) {
  const g = new THREE.SphereGeometry(1, seg[0], seg[1]); g.deleteAttribute('uv');
  const pos = g.attributes.position, col = new Float32Array(pos.count * 3), c0 = new THREE.Color(root), c1 = new THREE.Color(tip), m = new THREE.Color();
  for (let i = 0; i < pos.count; i++) m.copy(c0).lerp(c1, pos.getY(i) * 0.5 + 0.5).toArray(col, i * 3);
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.scale(r, len / 2, r * 0.75); g.translate(0, len * 0.35, 0); g.applyQuaternion(QT.setFromUnitVectors(UP, dir.clone().normalize())); g.translate(at.x, at.y, at.z); return g;
}
/** #1716: the tail's centre line (y, z) at rest (curled up over the back, as before) and flicked (raised, the tip snapped forward). */
const TAIL = {
  rest: [[0.075, -0.1], [0.14, -0.15], [0.2, -0.18], [0.26, -0.175], [0.31, -0.135], [0.34, -0.075], [0.35, -0.015]],
  flick: [[0.075, -0.1], [0.15, -0.13], [0.22, -0.13], [0.28, -0.1], [0.32, -0.05], [0.33, 0.01], [0.31, 0.055]],
};

/** One squirrel's parts, metres, feet at y 0, nose +z, body about 22 cm and a 20 cm bushy tail curled over the back. #1716: a head with cheeks,
 * muzzle, nose, shining eyes and tufted ears, fore legs with paws, hind legs with long feet, a mottled coat and a fluffy tail (a core of soft
 * blobs and many hair tufts frosted at the tips; the tail tip coloured per animal). `far`: the cheaper distant version. `pose`: { flick } the tail
 * flicked, { head: ±1 } the head turned left / right (the morph targets; every pose has the same vertices). */
function squirrelParts(s, far, pose = {}) {
  const rnd = seeded(1716 + (far ? 7 : 0)), w = s.width, big = far ? [7, 5] : [12, 9], small = far ? [6, 4] : [7, 5], fur = far ? 0 : 0.07, head = [], body = [];
  const B = (rx, ry, rz, x, y, z, hex, belly = null, seg = small, list = body) => list.push(blob(rx, ry, rz, x, y, z, hex, belly, seg, fur, rnd));
  const paw = shade(s.color, 0.72), dark = shade(s.color, 0.55);
  // body: chest, torso, haunch
  B(0.044 * w, 0.05, 0.1, 0, 0.085, -0.005, s.color, s.belly, big);
  B(0.038 * w, 0.045, 0.048, 0, 0.097, 0.055, s.color, s.belly, small);
  B(0.05 * w, 0.055, 0.058, 0, 0.075, -0.065, s.color, s.belly, big);
  // head: skull, cheeks, muzzle, nose, eyes (+ a glint), ears with tufts
  B(0.035 * w, 0.034, 0.042, 0, 0.128, 0.093, s.color, s.belly, big, head);
  for (const k of [1, -1]) B(0.018 * w, 0.017, 0.02, k * 0.018 * w, 0.117, 0.11, s.color, s.belly, small, head);
  B(0.016 * w, 0.014, 0.021, 0, 0.118, 0.13, s.color, s.belly, small, head);
  B(0.006, 0.005, 0.005, 0, 0.122, 0.149, 0x2a1d18, null, small, head);
  for (const k of [1, -1]) {
    B(0.0075, 0.0078, 0.0068, k * 0.026 * w, 0.137, 0.117, 0x120e0c, null, small, head);
    if (!far) B(0.0022, 0.0022, 0.0018, k * 0.0285 * w, 0.141, 0.1225, 0xffffff, null, [5, 3], head);
    const ear = new THREE.Vector3(k * 0.021 * w, 0.155, 0.084), up = new THREE.Vector3(k * 0.28, 1, -0.22).normalize();
    head.push(tuft(ear, up, 0.03, 0.011, s.color, s.color, far ? 5 : 7));
    const top = ear.clone().addScaledVector(up, 0.026);
    for (let i = 0; i < (far ? 1 : 4); i++) head.push(tuft(top, up.clone().add(new THREE.Vector3((rnd() - 0.5) * 0.7, 0.2, (rnd() - 0.5) * 0.7)), 0.02 + rnd() * 0.008, far ? 0.004 : 0.0024, dark, shade(s.color, 0.42), 3));
  }
  // legs: fore (upper arm, forearm, paw) and hind (thigh, long foot)
  for (const k of [1, -1]) {
    B(0.011, 0.024, 0.012, k * 0.026 * w, 0.062, 0.07, s.color, s.belly);
    B(0.008, 0.022, 0.009, k * 0.024 * w, 0.032, 0.083, s.color);
    B(0.009, 0.006, 0.013, k * 0.023 * w, 0.008, 0.092, paw);
    B(0.022 * w, 0.04, 0.04, k * 0.04 * w, 0.06, -0.06, s.color, s.belly);
    B(0.013, 0.009, 0.046, k * 0.036 * w, 0.009, -0.045, paw);
  }
  if (pose.head) { const m = new THREE.Matrix4().makeTranslation(0, 0.115, 0.065).multiply(new THREE.Matrix4().makeRotationY(pose.head * 0.65)).multiply(new THREE.Matrix4().makeTranslation(0, -0.115, -0.065)); for (const g of head) g.applyMatrix4(m); }
  // tail: soft core blobs along the centre line, then the hair tufts round it (mostly to the sides: a red squirrel's tail is flat and bushy)
  const curve = new THREE.CatmullRomCurve3((pose.flick ? TAIL.flick : TAIL.rest).map(([y, z]) => new THREE.Vector3(0, y, z))), side = new THREE.Vector3(1, 0, 0);
  const rad = (u) => 0.013 + 0.027 * Math.sin(Math.PI * (0.15 + 0.8 * u)), tipCol = (u) => (s.tip && u > 0.8 ? s.tip : s.tail), tail = [];
  const cores = far ? 6 : 9;
  for (let i = 0; i < cores; i++) { const u = 0.06 + 0.9 * i / (cores - 1), c = curve.getPointAt(u); tail.push(blob(rad(u) * 1.45 * w, rad(u) * 0.95, rad(u) * 1.15, c.x, c.y, c.z, shade(tipCol(u), 0.92), null, far ? [6, 4] : [8, 6], fur, rnd)); } // (wider than deep: flat and bushy)
  const n = far ? 24 : 66;
  for (let i = 0; i < n; i++) {
    const u = 0.05 + 0.93 * (i + rnd() * 0.8) / n, c = curve.getPointAt(Math.min(1, u)), tan = curve.getTangentAt(Math.min(1, u)), nrm = new THREE.Vector3().crossVectors(tan, side).normalize();
    const phi = rnd() * Math.PI * 2, lateral = Math.abs(Math.cos(phi)), radial = side.clone().multiplyScalar(Math.cos(phi)).addScaledVector(nrm, Math.sin(phi));
    const len = (0.03 + 0.024 * Math.sin(Math.PI * (0.12 + 0.82 * u))) * (0.8 + 0.4 * rnd()) * (0.7 + 0.45 * lateral);
    const at = c.clone().addScaledVector(radial, rad(u) * (0.45 + 0.55 * lateral)), dir = radial.multiplyScalar(0.32).addScaledVector(tan, 0.95); // (the hair lies flat towards the tip)
    const col = tipCol(u); tail.push(lock(at, dir, len, (0.011 + 0.008 * lateral) * (far ? 1.3 : 1) * (0.85 + 0.3 * rnd()), shade(col, 0.9), s.tip && u > 0.8 ? s.tip : mixHex(col, 0xf2e6cf, 0.15), [4, 3]));
  }
  return [...body, ...head, ...tail];
}
/** #1716: the merged squirrel (one draw call) with three morph targets: 0 the tail flicked, 1 / 2 the head turned left / right.
 * #1780: shared by animals with the same look (colours, width, tail tip; the size is the mesh's scale). */
const geoCache = new Map();
export function squirrelGeometry(s, far = false) {
  const key = [s.color, s.belly, s.tail, s.tip, s.width, far].join();
  if (!geoCache.has(key)) geoCache.set(key, buildSquirrelGeometry(s, far));
  return geoCache.get(key);
}
function buildSquirrelGeometry(s, far) {
  const build = (pose) => { const parts = squirrelParts(s, far, pose), g = mergeGeometries(parts, false); for (const p of parts) p.dispose(); return g; };
  const g = build({}), poses = [{ flick: 1 }, { head: 1 }, { head: -1 }].map(build);
  g.morphAttributes.position = poses.map((q) => q.attributes.position); g.morphAttributes.normal = poses.map((q) => q.attributes.normal);
  for (const q of poses) { q.deleteAttribute('position'); q.deleteAttribute('normal'); q.dispose(); }
  return g;
}

