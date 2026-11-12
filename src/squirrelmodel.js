// Public #271: neutral geometry/morph recipe selected from original c6ac53418862497c131efba43097d806b3af95e1.
// Only shapes and existing morphs; no loader, bones, personal registry or gameplay.
import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {SQUIRREL_SURFACE as SS} from './config.js';

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
const UP = new THREE.Vector3(0, 1, 0), QT = new THREE.Quaternion();
/** #1716: a hair tuft: an open cone `len` long from `at` along `dir`, `root` colour at the base fading to `tip` at the point. */
function tuft(at, dir, len, r, root, tip, segs) {
  const g = new THREE.ConeGeometry(r, len, segs, 1, true); g.deleteAttribute('uv');
  const pos = g.attributes.position, col = new Float32Array(pos.count * 3), c0 = new THREE.Color(root), c1 = new THREE.Color(tip), m = new THREE.Color();
  for (let i = 0; i < pos.count; i++) m.copy(c0).lerp(c1, pos.getY(i) / len + 0.5).toArray(col, i * 3);
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.translate(0, len / 2, 0); g.applyQuaternion(QT.setFromUnitVectors(UP, dir.clone().normalize())); g.translate(at.x, at.y, at.z); return g;
}
/** #1716: the tail's centre line (y, z) at rest (curled up over the back, as before) and flicked (raised, the tip snapped forward). */
const TAIL = {
  rest: [[0.075, -0.1], [0.14, -0.15], [0.2, -0.18], [0.26, -0.175], [0.31, -0.135], [0.34, -0.075], [0.35, -0.015]],
  flick: [[0.075, -0.1], [0.15, -0.13], [0.22, -0.13], [0.28, -0.1], [0.32, -0.05], [0.33, 0.01], [0.31, 0.055]],
};

// One closed elliptical loft for the existing public morphs.
function surfaceLoft(rows, radial, spec, rnd, fur) {
  const positions=[],colors=[],indices=[],coat=new THREE.Color(spec.color),belly=new THREE.Color(spec.belly),color=new THREE.Color();
  for(const [z,y,w,h] of rows)for(let j=0;j<radial;j++) {
    const a=j*Math.PI*2/radial,ny=Math.cos(a);positions.push(Math.sin(a)*w*spec.width,y+ny*h,z);
    color.copy(belly).lerp(coat,THREE.MathUtils.smoothstep(ny,...SS.bellyBlend));if(fur)color.multiplyScalar(1+(rnd()-.5)*2*fur);color.toArray(colors,colors.length);
  }
  for(let i=0;i<rows.length-1;i++)for(let j=0;j<radial;j++) {
    const a=i*radial+j,b=i*radial+(j+1)%radial,c=a+radial,d=b+radial;indices.push(a,c,b,b,c,d);
  }
  for(const [i,end]of[[0,false],[rows.length-1,true]]) {
    const [z,y]=rows[i],centre=positions.length/3;positions.push(0,y,z);coat.toArray(colors,colors.length);
    for(let j=0;j<radial;j++){const a=i*radial+j,b=i*radial+(j+1)%radial;indices.push(...(end?[centre,b,a]:[centre,a,b]));}
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.setIndex(indices);g.computeVertexNormals();return g;
}
function tailSurface(curve,s,far) {
  const S=SS.tail,rows=far?S.rows.far:S.rows.near,radial=far?S.radial.far:S.radial.near,positions=[],colors=[],indices=[],side=new THREE.Vector3(1,0,0),color=new THREE.Color(),coat=new THREE.Color(s.tail),tip=s.tip?new THREE.Color(s.tip):null;
  const radius=(u,column)=>{let i=1;while(i<S.profile.length-1&&S.profile[i][0]<u)i++;const a=S.profile[i-1],b=S.profile[i];return THREE.MathUtils.lerp(a[column],b[column],THREE.MathUtils.smoothstep(u,a[0],b[0]));};
  for(let i=0;i<=rows;i++) {
    const u=i/rows,c=curve.getPointAt(u),t=curve.getTangentAt(u),normal=new THREE.Vector3().crossVectors(t,side).normalize();
    for(let j=0;j<radial;j++) {
      const a=j*Math.PI*2/radial,flow=S.flow.reduce((v,[around,along,gain])=>v+gain*Math.sin(a*around+u*along),0),ridge=1+S.ridge*flow,p=c.clone().addScaledVector(side,Math.cos(a)*radius(u,1)*s.width*ridge).addScaledVector(normal,Math.sin(a)*radius(u,2)*ridge);
      positions.push(...p.toArray());color.copy(coat);if(tip)color.lerp(tip,THREE.MathUtils.smoothstep(u,S.tipStart,S.tipEnd));color.multiplyScalar(1+S.frost*flow);color.toArray(colors,colors.length);
    }
  }
  for(let i=0;i<rows;i++)for(let j=0;j<radial;j++){const a=i*radial+j,b=i*radial+(j+1)%radial,c=a+radial,d=b+radial;indices.push(a,b,c,b,d,c)}
  for(const[i,end]of[[0,false],[rows,true]]){const c=curve.getPointAt(i/rows),centre=positions.length/3;positions.push(...c.toArray());color.toArray(colors,colors.length);for(let j=0;j<radial;j++){const a=i*radial+j,b=i*radial+(j+1)%radial;indices.push(...(end?[centre,a,b]:[centre,b,a]))}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.setIndex(indices);g.computeVertexNormals();return g;
}

/** One squirrel's parts, metres, feet at y 0, nose +z, body about 22 cm and a 20 cm bushy tail curled over the back. #1716: a head with cheeks,
 * tapered face, nose, inset eyes and tufted ears, fore legs with paws, hind legs with long feet, a mottled coat and a closed curved plume
 * with shallow fur flow and an individually coloured tail tip. `far`: the cheaper distant version. `pose`: { flick } the tail
 * flicked, { head: ±1 } the head turned left / right (the morph targets; every pose has the same vertices). */
function squirrelParts(s, far, pose = {}) {
  const rnd = seeded(1716 + (far ? 7 : 0)), w = s.width, small = far ? [6, 4] : [7, 5], fur = far ? 0 : 0.07, head = [], body = [];
  const B = (rx, ry, rz, x, y, z, hex, belly = null, seg = small, list = body) => list.push(blob(rx, ry, rz, x, y, z, hex, belly, seg, fur, rnd));
  const paw = shade(s.color, 0.72), dark = shade(s.color, 0.55);
  body.push(surfaceLoft(SS.body,far?SS.radial.far:SS.radial.near,s,rnd,fur));
  head.push(surfaceLoft(SS.head,far?SS.radial.far:SS.radial.near,s,rnd,fur));
  B(0.006, 0.005, 0.005, 0, 0.122, 0.149, 0x2a1d18, null, small, head);
  for (const k of [1, -1]) {
    B(...SS.eyes.scale, k * SS.eyes.at[0] * w, SS.eyes.at[1], SS.eyes.at[2], 0x120e0c, null, small, head);
    if (!far) B(...SS.eyes.glint, k * SS.eyes.glintAt[0] * w, SS.eyes.glintAt[1], SS.eyes.glintAt[2], 0xffffff, null, [5, 3], head);
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
  // One continuous plume follows the retained rest/flick centreline.
  const curve=new THREE.CatmullRomCurve3((pose.flick?TAIL.flick:TAIL.rest).map(([y,z])=>new THREE.Vector3(0,y,z))),tail=[tailSurface(curve,s,far)];
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

