import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { TOILET as T } from './config.js';

// Floor-standing toilet with an opening lid.
// Local frame: back against the wall at z = 0, bowl towards +z, y up from the floor.

const porcelain = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.12 });
const chrome = new THREE.MeshStandardMaterial({ color: 0xd7dadc, roughness: 0.15, metalness: 0.6 });

const ellipse = (rx, rz) => {
  const s = new THREE.Shape();
  s.absellipse(0, 0, rx, rz, 0, Math.PI * 2, false);
  return s;
};

const at = (o, x, y, z) => { o.position.set(x, y, z); return o; };

function mesh(geo, material) {
  const m = new THREE.Mesh(geo, material);
  m.castShadow = m.receiveShadow = true;
  return m;
}

/** Elliptic disc/ring geometry (`hole` = inner ellipse scale) of thickness h, lying flat at y. */
function flatGeo(rx, rz, h, y, hole = 0) {
  const s = ellipse(rx, rz);
  if (hole) s.holes.push(ellipse(rx * hole, rz * hole * 0.95));
  const geo = new THREE.ExtrudeGeometry(s, { depth: h, bevelEnabled: true, bevelThickness: h * 0.3, bevelSize: h * 0.3, bevelSegments: 2, curveSegments: 32 });
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, y, 0);
  return geo;
}
const flat = (rx, rz, h, y, material, hole = 0) => mesh(flatGeo(rx, rz, h, y, hole), material);

/** Sample the bowl profile (rings [dy, scale, dz], top down) at height dy below the rim: { s, dz }. */
function profileAt(dy) {
  const P = T.bowl.profile;
  for (let i = 1; i < P.length; i++) {
    if (dy >= P[i][0]) {
      const [y0, s0, z0] = P[i - 1], [y1, s1, z1] = P[i];
      const k = (dy - y0) / (y1 - y0);
      return { s: s0 + (s1 - s0) * k, dz: z0 + (z1 - z0) * k };
    }
  }
  const l = P[P.length - 1];
  return { s: l[1], dz: l[2] };
}

/** The inside of the bowl (#321): elliptic rings (a, b = the rim hole's half axes) down the profile, faces pointing in.
 *  `inset` pulls every ring that much towards the axis (the flush's sheet of water); rings below `toDy` are left out. */
function bowlGeo(a, b, inset = 0, toDy = -Infinity) {
  const P = T.bowl.profile.filter((r) => r[0] >= toDy - 1e-6), seg = 48;
  const pos = [], uv = [], idx = [];
  P.forEach(([dy, s, dz], i) => {
    for (let j = 0; j <= seg; j++) {
      const th = (j / seg) * Math.PI * 2;
      const rx = Math.max(0, a * s - inset), rz = Math.max(0, b * s - inset);
      pos.push(Math.cos(th) * rx, dy, dz + Math.sin(th) * rz);
      uv.push(j / seg, 1 - i / (P.length - 1));
    }
  });
  for (let i = 0; i < P.length - 1; i++) {
    for (let j = 0; j < seg; j++) {
      const p = i * (seg + 1) + j, q = p + seg + 1;
      idx.push(p, q, p + 1, p + 1, q, q + 1); // wound so the faces look inwards (towards the axis)
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

export class Toilet {
  /** side = the wall the tank stands against; (x, z) = middle of the back on that wall. */
  constructor(side, x, z, y0) {
    this.name = 'toalettlocket';
    this.kind = 'lid';
    this.isOpen = false;
    this.t = 0; // 0 = lid down, 1 = up
    const g = new THREE.Group();
    const bowlZ = T.tankDepth + (T.depth - T.tankDepth) / 2 - 0.02; // centre of the bowl
    const rx = T.width / 2, rz = (T.depth - T.tankDepth) / 2 + 0.01;
    const seat = T.seatHeight;
    // All the white porcelain is one mesh (#321): tank, pedestal (open at the top), neck, rim, seat and the bowl inside.
    const parts = [];
    const put = (geo, x, y, z, sx = 1, sy = 1, sz = 1) => {
      geo.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion(), new THREE.Vector3(sx, sy, sz)));
      parts.push(geo.index ? geo.toNonIndexed() : geo);
    };
    put(new RoundedBoxGeometry(T.width, T.tankHeight - 0.4, T.tankDepth, 3, 0.03), 0, (T.tankHeight + 0.4) / 2, T.tankDepth / 2);
    // pedestal (tapering towards the floor), open at the top so the bowl shows; a short neck to the tank behind the bowl
    put(new THREE.CylinderGeometry(1, 0.62, seat - 0.05, 32, 1, true), 0, (seat - 0.05) / 2, bowlZ - 0.03, rx * 0.95, 1, rz * 0.95);
    put(new RoundedBoxGeometry(T.width * 0.75, seat - 0.02, 0.08, 2, 0.03), 0, (seat - 0.02) / 2, T.tankDepth + 0.02);
    // rim and seat
    const rimY = seat - 0.06;
    put(flatGeo(rx, rz, 0.03, rimY, 0.72), 0, 0, bowlZ);
    put(flatGeo(rx * 0.98, rz * 0.98, 0.016, seat - 0.025, 0.66), 0, 0, bowlZ);
    // the bowl: from inside the rim's hole down past the water to the outlet towards the back
    const ha = rx * 0.72, hb = rz * 0.72 * 0.95; // the rim hole's half axes
    put(bowlGeo(ha, hb), 0, rimY, bowlZ);
    g.add(mesh(mergeGeometries(parts), porcelain));
    const button = at(mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.01, 20), chrome), 0, T.tankHeight + 0.004, T.tankDepth / 2);
    g.add(button);
    // Still water follows the original bowl profile without a flushing simulation.
    const { s: waterScale, dz: waterZ } = profileAt(T.bowl.waterDy);
    const pool = mesh(new THREE.CircleGeometry(1, 48).rotateX(-Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: T.bowl.water, roughness: 0.04,
        metalness: 0.1, transparent: true, opacity: 0.88 }));
    pool.position.set(0, rimY + T.bowl.waterDy, bowlZ + waterZ);
    pool.scale.set(ha * waterScale * 1.02, 1, hb * waterScale * 1.02);
    g.add(pool);
    // lid: hinged at the back of the seat
    this.hinge = new THREE.Group();
    this.hinge.position.set(0, seat + 0.002, T.tankDepth + 0.03);
    const lid = flat(rx * 0.98, rz * 0.98, 0.014, 0, porcelain);
    lid.position.z = bowlZ - T.tankDepth - 0.03;
    this.hinge.add(lid);
    g.add(this.hinge);
    g.rotation.y = { west: Math.PI / 2, east: -Math.PI / 2, north: 0, south: Math.PI }[side];
    g.position.set(x, y0, z);
    this.object = g;
    // the whole toilet is the pick target (looking at the bowl is enough)
    this.pickable = g;
    g.traverse((o) => { o.userData.door = this; });
    // Compatibility with world.lids: this inert target has no pickable mesh or flush action.
    this.flush = { name: 'toaletten', kind: 'fixture', object: new THREE.Group(),
      pickable: new THREE.Group(), isOpen: false, toggle() {}, update() {} };
  }

  toggle() { this.isOpen = !this.isOpen; }

  update(dt) {
    const target = this.isOpen ? 1 : 0;
    this.t += Math.sign(target - this.t) * Math.min(Math.abs(target - this.t), dt * 2.5);
    const e = this.t * this.t * (3 - 2 * this.t);
    this.hinge.rotation.x = -e * THREE.MathUtils.degToRad(93);
  }
}
