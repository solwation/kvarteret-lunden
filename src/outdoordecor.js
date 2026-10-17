import * as THREE from 'three';
import { PATIO_DECOR as P } from './config.js';

// Generic outdoor decor models (#35; from the original's src/terracedecor.js at 2190e17, #605/#1120, and the cheap palm /
// banana / agave shapes of its src/patio.js `planter`). Vertex-coloured parts that callers bake into a few merged meshes:
// pot plants, loungers, tables, chairs, side tables, parasols, a kettle grill, rugs, a lounge sofa, raised beds and a
// watering can — generic neighbour furniture, none of the original flat's own pieces. Adapted for this static viewer:
// no plant wind (no weather or open windows to drive it), no string lights, lanterns or railing boxes.

const KEEP = ['position', 'normal', 'color'];
const col = new THREE.Color();
const M4 = () => new THREE.Matrix4();

/** Non-indexed, only the attributes the batches share; a `color` attribute of `hex` (×`shade`) unless it has one. */
function paint(geo, hex, shade = 1) {
  const g = geo.index ? geo.toNonIndexed() : geo.clone();
  for (const k of Object.keys(g.attributes)) if (!KEEP.includes(k)) g.deleteAttribute(k);
  if (!g.attributes.normal) g.computeVertexNormals();
  const n = g.attributes.position.count, c = col.setHex(hex).multiplyScalar(shade);
  if (!g.attributes.color) {
    const a = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { a[i * 3] = c.r; a[i * 3 + 1] = c.g; a[i * 3 + 2] = c.b; }
    g.setAttribute('color', new THREE.BufferAttribute(a, 3));
  } else {
    const a = g.attributes.color;
    for (let i = 0; i < n; i++) a.setXYZ(i, a.getX(i) * c.r, a.getY(i) * c.g, a.getZ(i) * c.b);
  }
  return g;
}
const box = (w, h, d, x, y, z) => new THREE.BoxGeometry(w, h, d).translate(x, y + h / 2, z);
const cyl = (r0, r1, h, x, y, z, seg = 8) => new THREE.CylinderGeometry(r0, r1, h, seg).translate(x, y + h / 2, z);
const ball = (r, x, y, z, detail = 0, sc = [1, 1, 1]) => new THREE.IcosahedronGeometry(r, detail).scale(...sc).translate(x, y, z);

/** A deterministic random stream. */
export function rng(seed) { let s = (Math.abs(Math.round(seed)) % 2147483646) + 1; return () => ((s = (s * 16807) % 2147483647) / 2147483647); }

/** One item's parts in its own frame (foot on the ground at the origin): `solid` (furniture, pots) and `soft`
 * (foliage, flowers, parasol cloth; double-sided). */
export class Parts {
  constructor(rand) { this.solid = []; this.soft = []; this.rand = rand; }
  s(geo, hex) { this.solid.push(paint(geo, hex)); return this; }
  f(geo, hex) { this.soft.push(paint(geo, hex, 0.9 + this.rand() * 0.2)); return this; }
}

// --- pot plants: the original's cheap planter silhouettes (palm, banana, agave) ---------------------------------------
const LEAF = { palm: 0x3f7a3a, banana: 0x67a63c, agave: 0x7c9c90 }, TRUNK = 0x5a4632, SOIL = 0x3b2c22;
const CROWN = {
  palm(leaf, wood, top) { // Trachycarpus: a trunk, a crown of fan leaves on stalks
    wood.push(new THREE.CylinderGeometry(0.065, 0.09, 1.3, 10).translate(0, top + 0.65, 0));
    const crown = top + 1.3;
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + (i % 2) * 0.2, lean = 0.5 + (i % 3) * 0.3;
      const m = M4().makeTranslation(0, crown, 0).multiply(M4().makeRotationY(a)).multiply(M4().makeRotationX(lean));
      leaf.push(new THREE.CircleGeometry(0.42, 14, Math.PI / 2 - 1.15, 2.3).translate(0, 0.4, 0).applyMatrix4(m),
        new THREE.CylinderGeometry(0.008, 0.012, 0.4, 5).translate(0, 0.2, 0).applyMatrix4(m));
    }
  },
  banana(leaf, wood, top) { // Musa: a green pseudo-stem, big arching leaves
    leaf.push(new THREE.CylinderGeometry(0.05, 0.07, 0.75, 10).translate(0, top + 0.375, 0));
    for (let i = 0; i < 7; i++) {
      const len = 1.0 + (i % 3) * 0.12, geo = new THREE.PlaneGeometry(0.34, len, 1, 10), pos = geo.attributes.position;
      for (let k = 0; k < pos.count; k++) {
        const t = pos.getY(k) / len + 0.5;
        pos.setX(k, pos.getX(k) * Math.max(0.15, Math.sin(Math.PI * Math.min(1, t * 0.9 + 0.08))));
        pos.setY(k, t * len);
        pos.setZ(k, 0.55 * t * t * len);
      }
      geo.computeVertexNormals();
      const a = (i / 7) * Math.PI * 2 * 1.3, lean = 0.25 + (i % 3) * 0.15;
      leaf.push(geo.applyMatrix4(M4().makeTranslation(0, top + 0.6 + (i % 3) * 0.06, 0).multiply(M4().makeRotationY(a)).multiply(M4().makeRotationX(lean))));
    }
  },
  agave(leaf, wood, top) { // a rosette of thick, pointed blue-grey leaves
    for (const [n, lean, len] of [[11, 1.2, 0.62], [8, 0.8, 0.58], [5, 0.35, 0.5]]) for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + lean;
      leaf.push(new THREE.ConeGeometry(0.06, len, 6).translate(0, len / 2, 0).scale(1, 1, 0.4)
        .applyMatrix4(M4().makeTranslation(0, top + 0.02, 0).multiply(M4().makeRotationY(a)).multiply(M4().makeRotationX(lean))));
    }
  },
};
function potPlant(p, it) {
  const [r, h] = it.pot, s = it.s ?? 1, soil = h - 0.03, hue = (p.rand() - 0.5) * 2 * P.hue;
  p.s(new THREE.CylinderGeometry(r, r * 0.8, h, 20).translate(0, h / 2, 0), it.pc);
  p.s(new THREE.CircleGeometry(r * 0.93, 20).rotateX(-Math.PI / 2).translate(0, soil, 0), SOIL);
  const leaf = [], wood = [];
  CROWN[it.k](leaf, wood, soil);
  const scale = (g) => g.translate(0, -soil, 0).scale(s, s, s).translate(0, soil, 0);
  const tint = new THREE.Color(LEAF[it.k]).offsetHSL(hue, 0, (p.rand() - 0.5) * 0.06).getHex();
  for (const g of leaf) p.soft.push(paint(scale(g), tint));
  for (const g of wood) p.soft.push(paint(scale(g), TRUNK));
}

/** A simple pot (tapered, a rim) with soil at the top; returns the soil height. */
function pot(p, r, h, color) {
  p.s(cyl(r, r * 0.78, h, 0, 0, 0, 14), color).s(cyl(r * 1.06, r * 1.06, 0.03, 0, h - 0.03, 0, 14), color);
  p.s(new THREE.CircleGeometry(r * 0.95, 12).rotateX(-Math.PI / 2).translate(0, h - 0.025, 0), SOIL);
  return h - 0.025;
}
/** Leafy clumps round (0, y, 0): `n` icosahedra within `spread`, of size `size`. */
function clumps(p, n, spread, y, size, hex, detail = 1) {
  for (let i = 0; i < n; i++) {
    const a = p.rand() * Math.PI * 2, d = Math.sqrt(p.rand()) * spread;
    p.f(ball(size * (0.75 + p.rand() * 0.5), Math.cos(a) * d, y + (p.rand() - 0.3) * size, Math.sin(a) * d * 0.8, detail, [1, 0.8, 1]), hex);
  }
}
/** `n` flowers (flat five-sided disks, tilted; `disk` false: round fruit) within sx × sz round (x0, y, 0). */
function blooms(p, n, sx, sz, y, colors, r = 0.035, x0 = 0, disk = true) {
  for (let i = 0; i < n; i++) {
    const x = x0 + (p.rand() - 0.5) * sx, yy = y + p.rand() * 0.06, z = (p.rand() - 0.5) * sz, rr = r * (0.8 + p.rand() * 0.5);
    const g = disk ? new THREE.CircleGeometry(rr * 1.3, 5).rotateX(-Math.PI / 2 + (p.rand() - 0.5) * 0.9).rotateY(p.rand() * 6.3).translate(x, yy, z)
      : ball(rr, x, yy, z);
    p.f(g, colors[i % colors.length]);
  }
}

/** The models, keyed by item kind `k`; each adds its parts to `p` (models face +z; a lounger lies along x). */
export const DECOR_BUILD = {
  palm: potPlant, banana: potPlant, agave: potPlant,
  olive(p, it) { // a small olive (or, with `fruit`, a lemon) tree: a crooked trunk, a cloud of grey-green leaves
    const s = it.s ?? 1, soil = pot(p, it.pot[0], it.pot[1], it.pc), top = soil + 0.85 * s;
    p.f(cyl(0.025 * s, 0.04 * s, top - soil + 0.05, 0, 0, 0, 6).rotateZ(0.08).translate(0, soil, 0), 0x6a5a48);
    clumps(p, 9, 0.28 * s, top + 0.12 * s, 0.17 * s, it.fruit ? 0x3d6a33 : 0x7d9472);
    if (it.fruit) blooms(p, 10, 0.5 * s, 0.4 * s, top + 0.02, [it.fruit], 0.03, 0, false);
  },
  bush(p, it) { // a clipped ball (box, hydrangea with `bloom`)
    const soil = pot(p, it.pot[0], it.pot[1], it.pc), r = it.pot[0] * 1.35;
    p.f(ball(r, 0, soil + r * 0.85, 0, 1, [1, 0.9, 1]), it.c);
    clumps(p, 4, r * 0.5, soil + r * 1.2, r * 0.55, it.c);
    if (it.bloom) for (let i = 0; i < 9; i++) {
      const a = i * 2.4, e = 0.3 + (i % 3) * 0.35;
      p.f(ball(0.075, Math.cos(a) * Math.cos(e) * r, soil + r * 0.85 + Math.sin(e) * r, Math.sin(a) * Math.cos(e) * r, 1), it.bloom[i % it.bloom.length]);
    }
  },
  potflowers(p, it) { // a pot of pelargoner / daisies
    const soil = pot(p, it.pot[0], it.pot[1], it.pc), r = it.pot[0];
    clumps(p, 4, r * 0.6, soil + r * 0.5, r * 0.6, 0x3f6f35);
    blooms(p, 9, r * 1.6, r * 1.6, soil + r * 0.85, it.c, 0.03);
  },
  lounger(p, it) { // 1.9 × 0.65 m along x; the back raised at −x; a towel on it with `t`
    const L = 1.9, Wd = 0.62, f = it.f;
    for (const x of [-0.85, 0.85]) for (const z of [-0.27, 0.27]) p.s(box(0.04, 0.22, 0.04, x, 0, z), f);
    p.s(box(L, 0.05, 0.05, 0, 0.2, -0.29), f).s(box(L, 0.05, 0.05, 0, 0.2, 0.29), f);
    p.s(box(1.25, 0.07, Wd - 0.04, 0.3, 0.25, 0), it.c);
    p.s(box(0.62, 0.07, Wd - 0.04, 0, 0, 0).translate(0.31, 0, 0).rotateZ(Math.PI - 0.62).translate(-0.33, 0.29, 0), it.c);
    if (it.t) p.s(box(0.9, 0.012, 0.5, 0.35, 0.32, 0.02), it.t);
  },
  table(p, it) {
    const c = it.c, f = it.f;
    if (it.type === 'bistro') { // round, Ø 60, a pedestal
      p.s(cyl(0.3, 0.3, 0.025, 0, 0.71, 0, 18), c).s(cyl(0.02, 0.02, 0.7, 0, 0.01, 0, 6), f).s(cyl(0.2, 0.22, 0.02, 0, 0, 0, 12), f);
      return;
    }
    const w = it.w, d = it.d, hgt = it.type === 'low' ? 0.38 : 0.72, slats = 5;
    for (let i = 0; i < slats; i++) p.s(box(w, 0.03, d / slats - 0.012, 0, hgt - 0.03, -d / 2 + (i + 0.5) * d / slats), c);
    for (const x of [-w / 2 + 0.05, w / 2 - 0.05]) for (const z of [-d / 2 + 0.05, d / 2 - 0.05]) p.s(box(0.045, hgt - 0.03, 0.045, x, 0, z), f);
  },
  chair(p, it) { // a folding bistro chair facing +z; `cc` a seat cushion
    const c = it.c;
    for (const x of [-0.19, 0.19]) for (const z of [-0.18, 0.18]) p.s(box(0.03, 0.45, 0.03, x, 0, z), c);
    p.s(box(0.42, 0.03, 0.4, 0, 0.44, 0), c);
    p.s(box(0.42, 0.32, 0.03, 0, 0, 0).rotateX(-0.12).translate(0, 0.5, -0.18), c);
    for (const x of [-0.19, 0.19]) p.s(box(0.03, 0.4, 0.03, x, 0.45, -0.19), c);
    if (it.cc) p.s(box(0.38, 0.045, 0.36, 0, 0.47, 0.01), it.cc);
  },
  side(p, it) { // a small round side table; a glass on it
    p.s(cyl(0.2, 0.2, 0.02, 0, 0.48, 0, 14), it.c).s(cyl(0.015, 0.015, 0.48, 0, 0, 0, 6), it.c).s(cyl(0.15, 0.15, 0.015, 0, 0, 0, 10), it.c);
    if (it.glass) p.s(cyl(0.03, 0.025, 0.12, 0.06, 0.5, 0.02, 8), 0xe0a63a);
  },
  parasol(p, it) { // pole, a striped cloth (8 panels alternating), a base
    const R = it.R, top = 2.25;
    p.s(cyl(0.02, 0.02, top + 0.05, 0, 0, 0, 6), 0xd9d6cf).s(cyl(0.22, 0.24, 0.06, 0, 0, 0, 10), 0x3a3c3e);
    const g = new THREE.ConeGeometry(R, 0.38, 8, 1, true).toNonIndexed().translate(0, top - 0.19 + 0.05, 0);
    const n = g.attributes.position.count, a = new Float32Array(n * 3), cs = it.c.map((h) => new THREE.Color(h));
    for (let i = 0; i < n; i += 3) {
      const cx = (g.attributes.position.getX(i) + g.attributes.position.getX(i + 1) + g.attributes.position.getX(i + 2)) / 3;
      const cz = (g.attributes.position.getZ(i) + g.attributes.position.getZ(i + 1) + g.attributes.position.getZ(i + 2)) / 3;
      const k = Math.floor(((Math.atan2(cz, cx) + Math.PI) / (2 * Math.PI)) * 8) % cs.length;
      for (let j = 0; j < 3; j++) a.set([cs[k].r, cs[k].g, cs[k].b], (i + j) * 3);
    }
    g.setAttribute('color', new THREE.BufferAttribute(a, 3));
    p.f(g, 0xffffff);
  },
  grill(p, it) { // a kettle grill: legs, a bowl, a lid, a handle
    const c = it.c, y = 0.62;
    for (let i = 0; i < 3; i++) { const a = i * 2.094; p.s(cyl(0.012, 0.012, y, Math.cos(a) * 0.17, 0, Math.sin(a) * 0.17, 5), 0x9a9c9e); }
    p.s(new THREE.SphereGeometry(0.27, 14, 5, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2).translate(0, y + 0.2, 0), c);
    p.s(new THREE.SphereGeometry(0.27, 14, 5, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.85, 1).translate(0, y + 0.21, 0), c);
    p.s(box(0.14, 0.025, 0.03, 0, y + 0.45, 0), 0x2a2018).s(cyl(0.012, 0.012, 0.035, 0, y + 0.43, 0, 5), 0x9a9c9e);
    p.s(box(0.5, 0.02, 0.1, 0, 0.18, 0), 0x9a9c9e);
  },
  rug(p, it) { // a flat outdoor rug; stripes of `s` across it
    p.s(box(it.w, 0.008, it.d, 0, 0.001, 0), it.c);
    if (it.s) for (const z of [-0.36, -0.28, 0.28, 0.36]) p.s(box(it.w - 0.06, 0.009, 0.04, 0, 0.0015, z * it.d), it.s);
  },
  sofa(p, it) { // an outdoor lounge sofa along x, the back at −z; cushions
    const L = it.len, d = 0.75;
    p.s(box(L, 0.28, d, 0, 0.04, 0), it.c).s(box(L, 0.04, d, 0, 0, 0), 0x2a2b2c);
    p.s(box(L - 0.06, 0.12, d - 0.2, 0, 0.32, 0.08), it.cc);
    p.s(box(L, 0.4, 0.14, 0, 0.32, -d / 2 + 0.07), it.c).s(box(L - 0.1, 0.36, 0.11, 0, 0.42, -d / 2 + 0.2), it.cc);
    for (const x of [-L / 2 + 0.07, L / 2 - 0.07]) p.s(box(0.14, 0.26, d, x, 0.32, 0), it.c);
    (it.pillows ?? []).forEach((c, i, all) => {
      const x = -L / 2 + 0.35 + i * (L - 0.7) / Math.max(1, all.length - 1);
      p.s(box(0.4, 0.38, 0.12, 0, 0, 0).applyMatrix4(M4().makeRotationX(-0.3)).translate(all.length === 1 ? 0 : x, 0.42, -d / 2 + 0.32), c);
    });
  },
  raised(p, it) { // a raised wooden bed with tomatoes on stakes or herbs
    const L = it.len, d = 0.42, h = 0.62, wood = 0x9a7650;
    p.s(box(L, h, 0.03, 0, 0, -d / 2), wood).s(box(L, h, 0.03, 0, 0, d / 2), wood).s(box(0.03, h, d, -L / 2, 0, 0), wood).s(box(0.03, h, d, L / 2, 0, 0), wood);
    p.s(box(L - 0.04, 0.02, d - 0.04, 0, h - 0.06, 0), SOIL);
    if (it.crop === 'tomato') for (const x of [-0.3, 0, 0.3]) {
      p.s(box(0.015, 0.75, 0.015, x, h - 0.06, 0), 0x8a6a48);
      for (let k = 0; k < 3; k++) p.f(ball(0.11, x + (p.rand() - 0.5) * 0.08, h + 0.12 + k * 0.2, (p.rand() - 0.5) * 0.08, 1, [1, 1.2, 0.9]), 0x3f6f35);
      blooms(p, 4, 0.18, 0.14, h + 0.2, [0xd8262f, 0xe8484f, 0xe08a2c], 0.03, x, false);
    } else {
      clumps(p, 8, L * 0.4, h + 0.05, 0.08, 0x5a8a4a);
      clumps(p, 5, L * 0.4, h + 0.04, 0.06, 0x7aa05a);
    }
  },
  can(p, it) { // a watering can
    p.s(cyl(0.09, 0.1, 0.24, 0, 0, 0, 10), it.c).s(cyl(0.012, 0.018, 0.3, 0, 0, 0, 5).rotateZ(-0.9).translate(0.17, 0.12, 0), it.c);
    p.s(box(0.025, 0.025, 0.2, -0.02, 0.28, 0), it.c);
  },
};

/** The plants whose crowns may be squeezed to stay inside the screen walls. */
export const CROWNS = ['palm', 'banana', 'agave', 'olive', 'bush'];
/** Squeeze a plant's foliage (in its own frame, the pot at the origin) towards its stem so it stays `west` / `east` m
 * clear either side and `north` m in front of the façade. */
export function fitCrown(geos, west, east, north) {
  const bb = new THREE.Box3();
  for (const g of geos) { g.computeBoundingBox(); bb.union(g.boundingBox); }
  if (bb.isEmpty()) return;
  const sx = Math.min(1, west / Math.max(1e-3, -bb.min.x), east / Math.max(1e-3, bb.max.x)), sz = Math.min(1, north / Math.max(1e-3, -bb.min.z));
  if (sx < 1 || sz < 1) for (const g of geos) g.scale(sx, 1, sz);
}
