import * as THREE from 'three';
import { riverFishGeometry, fishSpeciesMaterial, fishVisualPhase } from './riverfishmodel.js';
import { RIVER_FISH as C, RIVER_FISH_SCHOOL as SCHOOL, COLORS } from './config.js';
import { fishSpec, fishAt, ringsAt, riverProject, fishTime } from './riverfishswim.js';
import { schoolContext, presentAt, takeRings, moveRing, coverFrame } from './riverfishschool.js';


// Neutral renderer adapted from original 578ecc09b02c7355e299fc58d0e0127b622ee85a.
// Opaque water uses flattened silhouettes above its surface; rising fish regain their shape.
// Two instanced batches, no picking, textures, lights, shadows, services or saved state.
// #326 (original #2130): a local drawing layer (src/riverfishschool.js): loose schools, still moments in the lee of lily pads (`this.flora`,
// set by main.js: RiverLilies' `cover`) and quick surface takes with rings. Each fish is drawn at its `presentAt` place; `shown[i].x/y/z` keep
// the seeded place and `shown[i].school` the drawn offset. A rise's rings are drawn where the fish was drawn when it rose.

const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), P = new THREE.Vector3(), S = new THREE.Vector3(), UP = new THREE.Vector3(0, 1, 0);
const tint = new THREE.Color(), white = new THREE.Color(1, 1, 1), deepTone = new THREE.Color(COLORS.water).multiplyScalar(C.look.deepTone);

/** One packed six-form batch; the existing instance matrix scales each selected unit form once. */
export const fishGeometry = riverFishGeometry;

export class RiverFish {
  /** Local clock can be fixed by a diagnostic fixture. */
  constructor({ scene, camera, now = () => Date.now() }) {
    Object.assign(this, {scene,camera,now,shown:[],ringList:[],t:0});
    Object.assign(this, { flora: null, school: null, schoolKey: '', coverKey: '', cover: [], sOff: new Map(), pres: {} }); // #326
    const fishMat = new THREE.MeshLambertMaterial({ vertexColors: true, transparent: true, opacity: C.opacity, depthWrite: false, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
    fishMat.forceSinglePass = true; // thin surface silhouettes need one two-sided pass, not back/front passes
    this.fish = new THREE.InstancedMesh(fishGeometry(), fishSpeciesMaterial(fishMat), C.count);
    this.fish.geometry.setAttribute('fishKind',new THREE.InstancedBufferAttribute(new Float32Array(C.count*2),2).setUsage(THREE.DynamicDrawUsage));
    const ringGeo = new THREE.RingGeometry(0.88, 1, 32, 1).rotateX(-Math.PI / 2);
    ringGeo.deleteAttribute('uv');
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: true });
    this.rings = new THREE.InstancedMesh(ringGeo, ringMat, C.count * 5); // (#326: room for the takes' rings too)
    for (const [m, name] of [[this.fish, 'river-fish'], [this.rings, 'river-fish-rings']]) {
      m.name = name; m.count = 0; m.visible = false; m.frustumCulled = false; m.raycast = () => {}; m.castShadow = m.receiveShadow = false;
      m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.setColorAt(0, white); m.instanceColor.setUsage(THREE.DynamicDrawUsage);
      m.userData.noDetail = true; m.userData.warmDraw = true; m.renderOrder = 2; // (drawn once by the warm-up, after the opaque water)
      scene.add(m);
    }
  }
  hide() { this.fish.visible = this.rings.visible = false; this.fish.count = this.rings.count = 0; this.shown.length = 0; this.sOff.clear(); }
  /** Per frame. hidden: underground / indoors far below; daylight is fixed at 1 in this public scene. */
  update(dt, hidden = false, daylight = 1) {
    const cam = this.camera.position, q = riverProject(cam.x, cam.z, this.q ??= {});
    const close = !hidden && q.abs < C.drawDist;
    if (!close) { if (this.fish.visible || this.rings.visible) this.hide(); return; }
    const t = this.t = fishTime(this.now()), seed = C.seed, o = this.o ??= {}, rings = this.ringList;
    this.fish.material.userData.fishTime.value=fishVisualPhase(t);
    let n = 0; this.shown.length = 0; rings.length = 0;
    const list = [];
    for (let id = 0; id < C.count; id++) { const f = fishSpec(id, 0, seed), q = fishAt(f, t, {}, seed); q.f = f; q.id = id; list.push(q); }
    const ctx = this.schoolStep(list, seed);
    const reach = C.drawDist + SCHOOL.join + SCHOOL.hold.far, pres = this.pres, settle = SCHOOL.settle * Math.min(dt, 0.1) + 1e-3;
    for (const o of list) {
      const f = o.f, id = o.id;
      // #326: the school / hold / take layer: where this fish is drawn; a sudden change is followed at `settle` m/s
      const p = Math.hypot(o.x - cam.x, o.z - cam.z) < reach ? presentAt(id, t, ctx, pres) : null;
      let so = this.sOff.get(id); const fresh = !so; so ??= { x: 0, y: 0, z: 0 }; this.sOff.set(id, so);
      const gx = p ? p.x - o.x : 0, gy = p ? p.y - o.y : 0, gz = p ? p.z - o.z : 0, gd = Math.hypot(gx - so.x, gy - so.y, gz - so.z);
      if (fresh || gd <= settle) { so.x = gx; so.y = gy; so.z = gz; } else { const k = settle / gd; so.x += (gx - so.x) * k; so.y += (gy - so.y) * k; so.z += (gz - so.z) * k; }
      const vx = o.x + so.x, vy = o.y + so.y, vz = o.z + so.z, vRise = p ? p.rise : o.rise, water = p ? p.water : o.water, bed = p ? p.bed : o.bed;
      if (Math.hypot(vx - cam.x, vz - cam.z) > C.drawDist) continue;
      const sp = f.spec, up = vRise, deep = 1 - (vy - bed) / Math.max(0.05, water - bed); // 0 at the surface, 1 at the bed
      const ys = C.look.flat + (1 - C.look.flat) * up, wide = C.look.wide + (1 - C.look.wide) * up, cy = water + 0.012 + sp.h * ys / 2, y = up > 0 ? cy + (vy - cy) * up : cy;
      const wag = C.wag[0] * Math.sin(t * C.wag[1] * (0.6 + 0.6 * Math.min(1, p ? p.speed : o.speed)) + f.wag);
      Q.setFromAxisAngle(UP, (p ? p.yaw : o.yaw) + wag); P.set(vx, Math.max(y, water - sp.h * 0.4), vz); S.set(sp.w * wide, sp.h * ys, sp.len);
      this.fish.setMatrixAt(n, M.compose(P, Q, S));
      tint.setHex(sp.color).multiplyScalar(C.look.shade + (1 - C.look.shade) * up).lerp(deepTone, C.murk * Math.max(0, deep) * (1 - up));
      this.fish.setColorAt(n, tint);
      this.fish.geometry.attributes.fishKind.setXY(n,f.species,f.wag);
      this.shown.push({ id, born: f.born, species: sp.name, x: o.x, y: o.y, z: o.z, rise: o.rise, drawnY: P.y,
        ...((so.x || so.y || so.z) && { school: [so.x, so.y, so.z] }), ...(p?.hold > 0 && { hold: p.hold }), ...(p?.take > 0 && { take: p.take }) });
      n++;
      const r0 = rings.length; ringsAt(f, t, rings, seed);
      for (let i = r0; i < rings.length; i++) moveRing(rings[i], t, ctx); // #326: where the fish was drawn when it rose
    }
    takeRings(t, ctx, rings); // #326: the takes at the surface (filtered by distance below)
    this.fish.count = n; this.fish.visible = n > 0;
    this.fish.geometry.attributes.fishKind.needsUpdate = true;
    this.fish.instanceMatrix.needsUpdate = true; this.fish.instanceColor.needsUpdate = true;
    const glow = C.ring.glow * (C.ring.night + (1 - C.ring.night) * Math.max(0, Math.min(1, daylight)));
    let k = 0;
    for (const r of rings) {
      if (k >= this.rings.instanceMatrix.count || Math.hypot(r.x - cam.x, r.z - cam.z) > C.drawDist) continue;
      const u = r.age / (r.life ?? C.ring.life), rr = r.r ?? C.ring.r, rad = rr[0] + (rr[1] - rr[0]) * Math.sqrt(u);
      P.set(r.x, r.y + 0.02, r.z); S.set(rad, 1, rad); Q.identity();
      this.rings.setMatrixAt(k, M.compose(P, Q, S));
      this.rings.setColorAt(k, tint.setScalar(glow * (r.glow ?? C.ring.glow) / C.ring.glow * (1 - u) * (1 - u)));
      k++;
    }
    this.rings.count = k; this.rings.visible = k > 0;
    this.rings.instanceMatrix.needsUpdate = true; this.rings.instanceColor.needsUpdate = true;
  }
  /** #326: the schools of the fish (rebuilt when the set changes) and the cover in the river frame (rebuilt with the season). */
  schoolStep(list, seed) {
    const cv = this.flora?.cover, ck = cv ? `${cv.stones.length}:${cv.lilies.length}:${cv.leaves}` : '';
    if (ck !== this.coverKey) { this.coverKey = ck; this.cover = cv ? coverFrame(cv.leaves ? cv.stones.concat(cv.lilies) : cv.stones) : []; this.schoolKey = ''; }
    let key = `${seed}`; for (const o of list) key += `,${o.id}:${o.f.born}`;
    if (key !== this.schoolKey) { this.schoolKey = key; this.school = schoolContext(list.map((o) => o.f), seed, this.cover); for (const id of this.sOff.keys()) if (!this.school.specs.has(id)) this.sOff.delete(id); }
    return this.school;
  }
  state() { const sc = this.school; return { school: sc && { groups: [...sc.groups].filter(([, g]) => g.rank === 0 && g.size > 1).map(([, g]) => g.members), cover: this.cover.length,
      holding: this.shown.filter((f) => f.hold > 0.5).length, taking: this.shown.filter((f) => f.take > 0).length, takeRings: this.ringList.filter((r) => r.take).length },
    t:this.t,fish:this.shown.slice(),rings:this.ringList.slice(),drawn:this.fish.count,ringsDrawn:this.rings.count}; }
}
