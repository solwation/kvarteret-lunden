import * as THREE from 'three';
import { KLK } from './config.js';

// Fixed walk-in closet shelves, wall standards and clothes rail; stored contents are omitted.
const sideX = () => (KLK.side > 0 ? KLK.x1 : KLK.x0); // the side wall's inner face
const inward = () => -KLK.side;                       // from the side wall into the closet

const white = new THREE.MeshStandardMaterial({ color: 0xf4f4f1, roughness: 0.5 });
const chrome = new THREE.MeshStandardMaterial({ color: 0xd9dadc, roughness: 0.25, metalness: 0.85 });

function box(x0, x1, y0, y1, z0, z1, mat) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), mat);
  m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
  m.castShadow = m.receiveShadow = true;
  return m;
}

/** Peab's fittings on wall rails (bärlister): added to `group` at floor height `y0` (plain static meshes, world.js
 * merges them). */
export function klkFittings(group, y0) {
  const { shelf: S, rail: R, standards: T } = KLK, wx = sideX(), dir = inward();
  const sx0 = Math.min(wx, wx + dir * S.d), sx1 = Math.max(wx, wx + dir * S.d); // the side shelf's x span
  const bx0 = KLK.side > 0 ? KLK.x0 : sx1, bx1 = KLK.side > 0 ? sx0 : KLK.x1;    // the back shelf runs up to it
  const sy = y0 + S.y;
  group.add(box(sx0, sx1, sy, sy + S.t, KLK.z0, KLK.z1, white));                  // the side shelf
  group.add(box(bx0, bx1, sy, sy + S.t, KLK.z1 - S.d, KLK.z1, white));            // the far-wall shelf
  for (const z of T.side) { // standards on the side wall + a shelf bracket on each
    group.add(box(Math.min(wx, wx + dir * T.d), Math.max(wx, wx + dir * T.d), y0 + T.y0, y0 + T.y1, z - T.w / 2, z + T.w / 2, white));
    group.add(box(Math.min(wx, wx + dir * (S.d - 0.03)), Math.max(wx, wx + dir * (S.d - 0.03)), sy - 0.05, sy, z - 0.006, z + 0.006, white));
    // the rail's bracket: an arm out from the standard, down to the rail
    const rx = wx + dir * R.out;
    group.add(box(Math.min(wx, rx), Math.max(wx, rx), y0 + R.y + 0.03, y0 + R.y + 0.045, z - 0.008, z + 0.008, chrome));
    group.add(box(rx - 0.008, rx + 0.008, y0 + R.y, y0 + R.y + 0.045, z - 0.008, z + 0.008, chrome));
  }
  for (const x of T.back) { // standards on the far wall + brackets
    group.add(box(x - T.w / 2, x + T.w / 2, y0 + T.y0, y0 + T.y1, KLK.z1 - T.d, KLK.z1, white));
    group.add(box(x - 0.006, x + 0.006, sy - 0.05, sy, KLK.z1 - S.d + 0.03, KLK.z1, white));
  }
  const rail = new THREE.Mesh(new THREE.CylinderGeometry(R.r, R.r, R.z1 - R.z0, 16).rotateX(Math.PI / 2), chrome);
  rail.position.set(wx + dir * R.out, y0 + R.y, (R.z0 + R.z1) / 2);
  rail.castShadow = rail.receiveShadow = true;
  group.add(rail);
}

