// Public #271: neutral geometry/morph recipe selected from original c6ac53418862497c131efba43097d806b3af95e1.
// Only shapes and existing morphs; no loader, bones, personal registry or gameplay.
// Public #325 (original #2128 e5784ceb): the fluffier tail's fringe (tailSurface, original line) and, because the public squirrel has no
// bones, the original's joint offsets become relative morph targets on the same merged mesh (still one draw per squirrel):
// 3 … 8 the tail joints 0 … 5 pitched by `morph.ref` rad (each rotates the rest of the tail's centre line about its own point; the tip joint
// has no further point), 9 / 10 the tail yawed evenly / along a ramp, 11 the head pitched (nose down), 12 the forearms swung to the mouth,
// 13 a small morsel between the raised paws (a zero-size blob otherwise). squirrelLife() maps tailWave/scanHead/eatPaws onto these influences.
import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {SQUIRREL_SURFACE as SS,SQUIRREL_LIFE as SL} from './config.js';
import {TAIL_JOINTS} from './squirrellife.js';

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

/** #325: the tail centre line (rest or flick) with joint rotations: `bend` [{ x: pitch, y: yaw }] per joint (rad); joint j turns every later
 * point about point j (+x curls the tail forward over the back, as tailWave's pitch). */
const TAIL_PIVOT=new THREE.Vector3(),TAIL_Q=new THREE.Quaternion(),TAIL_E=new THREE.Euler();
export function tailPoints(flick=false,bend=null){
  const pts=(flick?TAIL.flick:TAIL.rest).map(([y,z])=>new THREE.Vector3(0,y,z));
  if(bend)for(let j=0;j<Math.min(bend.length,pts.length-1);j++){const o=bend[j];if(!o||(!o.x&&!o.y))continue;TAIL_PIVOT.copy(pts[j]);TAIL_Q.setFromEuler(TAIL_E.set(o.x||0,o.y||0,0,'YXZ'));for(let k=j+1;k<pts.length;k++)pts[k].sub(TAIL_PIVOT).applyQuaternion(TAIL_Q).add(TAIL_PIVOT);}
  return pts;
}
/** #325: the morph targets after the original three (0 flick, 1 / 2 head left / right). */
export const LIFE_MORPHS={tail:3,yaw:3+TAIL_JOINTS-1,yawRamp:3+TAIL_JOINTS,headPitch:4+TAIL_JOINTS,paws:5+TAIL_JOINTS,morsel:6+TAIL_JOINTS,count:7+TAIL_JOINTS};
/** #325: tailWave's joint offsets onto the tail influences: pitch per joint (0 … 5), the yaw least-squares fitted to an even sway plus a
 * ramp along the tail (the yaw is small: SQUIRREL_LIFE.tail yawAmp/wind). Returns `inf`. */
const RAMP=Array.from({length:TAIL_JOINTS-1},(_,j)=>j/(TAIL_JOINTS-1)),RS=RAMP.reduce((a,u)=>a+u,0),RS2=RAMP.reduce((a,u)=>a+u*u,0),RN=RAMP.length;
export function tailInfluences(inf,tail){
  const R=SL.morph.ref;let sy=0,suy=0;
  for(let j=0;j<RN;j++){inf[LIFE_MORPHS.tail+j]=tail[j].x/R;sy+=tail[j].y;suy+=RAMP[j]*tail[j].y;}
  const b=(RN*suy-RS*sy)/(RN*RS2-RS*RS),a=(sy-b*RS)/RN;inf[LIFE_MORPHS.yaw]=a/R;inf[LIFE_MORPHS.yawRamp]=b/R;return inf;
}
const SHOULDER=new THREE.Vector3(0,.08,.07),PAW_REST=new THREE.Vector3(0,.008,.092);
const pawMatrix=(k,w)=>new THREE.Matrix4().makeTranslation(-k*.008*w,0,0).multiply(new THREE.Matrix4().makeTranslation(SHOULDER.x,SHOULDER.y,SHOULDER.z)).multiply(new THREE.Matrix4().makeRotationX(-SL.morph.swing)).multiply(new THREE.Matrix4().makeTranslation(-SHOULDER.x,-SHOULDER.y,-SHOULDER.z));

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
/** #2128: a fixed 0 … 1 value per tail vertex (row, column), for the fringe's irregular locks. */
const fringeHash=(i,j)=>{let h=Math.imul(i*73856093^j*19349663,0x85ebca6b);h^=h>>>13;h=Math.imul(h,0xc2b2ae35);return ((h^h>>>16)>>>0)/4294967296;};
function tailSurface(curve,s,far) {
  const S=SS.tail,rows=far?S.rows.far:S.rows.near,radial=far?S.radial.far:S.radial.near,positions=[],colors=[],indices=[],side=new THREE.Vector3(1,0,0),color=new THREE.Color(),coat=new THREE.Color(s.tail),tip=s.tip?new THREE.Color(s.tip):null;
  const radius=(u,column)=>{let i=1;while(i<S.profile.length-1&&S.profile[i][0]<u)i++;const a=S.profile[i-1],b=S.profile[i];return THREE.MathUtils.lerp(a[column],b[column],THREE.MathUtils.smoothstep(u,a[0],b[0]));};
  for(let i=0;i<=rows;i++) {
    const u=i/rows,c=curve.getPointAt(u),t=curve.getTangentAt(u),normal=new THREE.Vector3().crossVectors(t,side).normalize();
    for(let j=0;j<radial;j++) {
      // #2128: a fluffy outline: irregular hair locks stand out of the plume's edge (fringe, a fixed per-vertex hash: the same every build), less at the root
      const a=j*Math.PI*2/radial,flow=S.flow.reduce((v,[around,along,gain])=>v+gain*Math.sin(a*around+u*along),0),lock=S.fringe?S.fringe*Math.sin(Math.PI*Math.min(1,u*1.25))*(fringeHash(i,j)**2*0.75+0.25*(0.5+0.5*Math.sin(u*S.locks+a*3))):0,ridge=(1+S.ridge*flow)*(1+lock),p=c.clone().addScaledVector(side,Math.cos(a)*radius(u,1)*s.width*ridge).addScaledVector(normal,Math.sin(a)*radius(u,2)*ridge);
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
    const fore = []; // (#325: swung up to the mouth in the `paws` pose)
    B(0.011, 0.024, 0.012, k * 0.026 * w, 0.062, 0.07, s.color, s.belly, small, fore);
    B(0.008, 0.022, 0.009, k * 0.024 * w, 0.032, 0.083, s.color, null, small, fore);
    B(0.009, 0.006, 0.013, k * 0.023 * w, 0.008, 0.092, paw, null, small, fore);
    if (pose.paws) { const m = pawMatrix(k, w); for (const g of fore) g.applyMatrix4(m); }
    body.push(...fore);
    B(0.022 * w, 0.04, 0.04, k * 0.04 * w, 0.06, -0.06, s.color, s.belly);
    B(0.013, 0.009, 0.046, k * 0.036 * w, 0.009, -0.045, paw);
  }
  // #325: the morsel between the paws while it eats (a zero-size blob at rest, so every pose keeps the same vertices)
  { const at = PAW_REST.clone().applyMatrix4(pawMatrix(0, w)), r = pose.morsel ? SL.morph.morsel : 1e-5;
    B(r, r * 0.85, r * 1.1, at.x, at.y + 0.012, at.z, SL.morph.morselColor, null, far ? [5, 3] : [7, 5]); }
  if (pose.headPitch) { const m = new THREE.Matrix4().makeTranslation(0, 0.115, 0.065).multiply(new THREE.Matrix4().makeRotationX(pose.headPitch)).multiply(new THREE.Matrix4().makeTranslation(0, -0.115, -0.065)); for (const g of head) g.applyMatrix4(m); }
  if (pose.head) { const m = new THREE.Matrix4().makeTranslation(0, 0.115, 0.065).multiply(new THREE.Matrix4().makeRotationY(pose.head * 0.65)).multiply(new THREE.Matrix4().makeTranslation(0, -0.115, -0.065)); for (const g of head) g.applyMatrix4(m); }
  // One continuous plume follows the retained rest/flick centreline.
  const curve=new THREE.CatmullRomCurve3(tailPoints(pose.flick,pose.bend)),tail=[tailSurface(curve,s,far)];
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
  // #325: relative morphs (deltas), so the tail-only targets need no full rebuild: the tail is the last part of the merged mesh
  const delta = (name, q) => { const b = g.attributes[name].array, a = q.attributes[name].array, d = new Float32Array(b.length); for (let i = 0; i < b.length; i++) d[i] = a[i] - b[i]; return new THREE.Float32BufferAttribute(d, 3); };
  const R = SL.morph.ref, rest = tailSurface(new THREE.CatmullRomCurve3(tailPoints(false)), s, far), n = g.attributes.position.count, off = n - rest.attributes.position.count;
  const tail = (bend) => { const t = tailSurface(new THREE.CatmullRomCurve3(tailPoints(false, bend)), s, far), out = {};
    for (const name of ['position', 'normal']) { const d = new Float32Array(n * 3), a = t.attributes[name].array, b = rest.attributes[name].array; for (let i = 0; i < a.length; i++) d[off * 3 + i] = a[i] - b[i]; out[name] = new THREE.Float32BufferAttribute(d, 3); }
    t.dispose(); return out; };
  const joint = (j, axis) => Array.from({ length: TAIL_JOINTS }, (_, i) => (i === j ? { [axis]: R } : null));
  const tails = [...Array.from({ length: TAIL_JOINTS - 1 }, (_, j) => tail(joint(j, 'x'))), tail(Array.from({ length: TAIL_JOINTS }, () => ({ y: R }))), tail(Array.from({ length: TAIL_JOINTS }, (_, j) => ({ y: R * j / (TAIL_JOINTS - 1) })))];
  const full = [{ headPitch: R }, { paws: 1 }, { morsel: 1 }].map(build); rest.dispose();
  const target = [...poses, ...tails, ...full];
  g.morphTargetsRelative = true;
  g.morphAttributes.position = target.map((q) => (q.isBufferGeometry ? delta('position', q) : q.position));
  g.morphAttributes.normal = target.map((q) => (q.isBufferGeometry ? delta('normal', q) : q.normal));
  for (const q of [...poses, ...full]) q.dispose();
  return g;
}

