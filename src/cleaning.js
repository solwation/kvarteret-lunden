import * as THREE from 'three';
import { CLEANING as C } from './config.js';

// Empty fixed shelves and tool rail in the under-stair closet.
const white = new THREE.MeshStandardMaterial({ color: 0xf2f2ef, roughness: 0.55 });
const alu = new THREE.MeshStandardMaterial({ color: 0xc4c6c8, roughness: 0.35, metalness: 0.7 });
const grey = new THREE.MeshStandardMaterial({ color: 0x55585b, roughness: 0.6 });

function box(x0, x1, y0, y1, z0, z1, mat) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), mat);
  m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
  m.castShadow = m.receiveShadow = true;
  return m;
}

const NICHE = { x0: 3.981, x1: 4.531, z: 5.584 }; // the north wall steps back 12 cm here (plan.json)
const wallZ = (x) => (x > NICHE.x0 && x < NICHE.x1 ? NICHE.z : C.shelf.z);

/** The fittings, added to `group` at floor height `y0` (static meshes, world.js merges them). Returns the collision
 * rectangles (the shelf). */
export function cleaningFittings(group, y0) {
  const S = C.shelf, z1 = S.z + S.d;
  for (const y of S.ys) group.add(box(S.x0, S.x1, y0 + y, y0 + y + S.t, S.z, z1, white));
  for (const x of S.standards) {
    const wz = wallZ(x);
    group.add(box(x - 0.013, x + 0.013, y0 + S.ys[0] - 0.12, y0 + S.ys.at(-1) + 0.08, wz, wz + 0.014, white)); // standard
    for (const y of S.ys) group.add(box(x - 0.005, x + 0.005, y0 + y - 0.06, y0 + y, wz, z1 - 0.03, white));  // brackets
  }
  // the tool rail: an aluminium bar on two posts, dark clips and hooks
  const R = C.rail, rx = R.x - 0.03;
  group.add(box(rx - 0.006, rx + 0.006, y0 + R.y - 0.013, y0 + R.y + 0.013, R.z0, R.z1, alu));
  for (const z of [R.z0 + 0.03, R.z1 - 0.03]) group.add(box(rx, R.x, y0 + R.y - 0.01, y0 + R.y + 0.01, z - 0.01, z + 0.01, alu));
  for (const z of [5.88, 6.08]) group.add(box(rx - 0.04, rx - 0.004, y0 + R.y - 0.02, y0 + R.y + 0.02, z - 0.02, z + 0.02, grey)); // clips
  group.add(box(rx - 0.05, rx - 0.004, y0 + R.y - 0.008, y0 + R.y + 0.008, 6.235, 6.245, grey)); // a hook (dustpan)
  group.add(box(rx - 0.05, rx - 0.004, y0 + R.y - 0.008, y0 + R.y + 0.008, 6.285, 6.295, grey)); // a hook (brush)
  return [{ x0: S.solid[0], x1: S.x1, z0: S.z, z1: S.z + S.solid[1] }];
}

