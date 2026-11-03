// Adapted from solwation/lunden-3d-apartment cat.js at 578ecc09b02c7355e299fc58d0e0127b622ee85a.
// Generic procedural geometry and sit/walk pose only. No character or interaction state.
import * as THREE from 'three';
const CAT_WALK={rise:.3,stride:.3,swing:.4,knee:.6,bob:.006};
const ROLE=Object.fromEntries(['coat','bib','paw','face','blaze','ear','tail','tip'].map(k=>[k,new THREE.MeshStandardMaterial({roughness:.8})]));
const pink=new THREE.MeshStandardMaterial({color:0xd99a9a}),eyeMat=new THREE.MeshStandardMaterial({color:0x9bbf3a}),pupilMat=new THREE.MeshStandardMaterial({color:0x050505});
const smooth=(a,b,t)=>{const x=THREE.MathUtils.clamp((t-a)/(b-a),0,1);return x*x*(3-2*x);};
function blob(material, sx, sy, sz, x, y, z) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 6), material);
  m.scale.set(sx, sy, sz);
  m.position.set(x, y, z);
  m.castShadow = true;
  return m;
}

/** A leg hanging `len` down from its pivot (#241): turned, with a rounded top that sinks into the body, a fuller upper
 * part, a slimmer wrist and a rounded end in the paw; radius r at the middle. */
function limb(material, r, len, x, y, z) {
  const pts = [[0, -len], [0.7 * r, -len + 0.3 * r], [0.85 * r, -len + 0.9 * r], [0.8 * r, -0.62 * len], [0.95 * r, -0.42 * len],
    [1.22 * r, -0.16 * len], [1.2 * r, 0], [0.75 * r, 0.75 * r], [0, r]];
  const m = new THREE.Mesh(new THREE.LatheGeometry(pts.map(([a, b]) => new THREE.Vector2(a, b)), 6), material);
  m.position.set(x, y, z);
  m.castShadow = true;
  return m;
}

// The two poses the cat blends between (#224), in its local frame at size 1 (metres, facing +z): `sit` is the old sitting
// cat (~35 cm tall, washing itself), `stand` the walking one (back level, hips at shoulder height ~17 cm). Positions [x, y, z]
// (x mirrored per side for the legs), blob scales, the body's tilt; the tail as points from its root.
const HIND_SHIN = 0.09;
const POSE = {
  sit: {
    body: [0, 0.17, -0.01], bodyScale: [0.11, 0.17, 0.13], bodyTilt: -0.25,
    bib: [0, 0.19, 0.085], bibScale: [0.07, 0.12, 0.05],
    shoulder: [0.04, 0.17, 0.085], head: [0, 0.325, 0.05],
    hip: [0.07, 0.075, -0.03], thigh: [0, 0, 0], thighScale: [0.075, 0.075, 0.11],
    hock: [0, -0.052, 0], hockAngle: -Math.PI / 2, footScale: [0.035, 0.02, 0.055],
    tailRoot: [0, 0.04, -0.13],
    tail: [[0, 0, 0], [0.09, -0.015, 0.01], [0.14, -0.02, 0.11], [0.12, -0.02, 0.21], [0.06, -0.02, 0.26]],
  },
  stand: {
    body: [0, 0.2, -0.03], bodyScale: [0.095, 0.072, 0.19], bodyTilt: 0,
    bib: [0, 0.18, 0.13], bibScale: [0.062, 0.08, 0.06],
    shoulder: [0.04, 0.17, 0.1], head: [0, 0.27, 0.19],
    hip: [0.045, 0.175, -0.16], thigh: [0, -0.03, 0.005], thighScale: [0.048, 0.07, 0.062],
    hock: [0, -0.0668, 0], hockAngle: 0.15, footScale: [0.028, 0.017, 0.04],
    tailRoot: [0, 0.215, -0.21],
    tail: [[0, 0, 0], [0, 0.03, -0.07], [0, 0.11, -0.12], [0, 0.2, -0.12], [0, 0.26, -0.08]],
  },
};
const mix = (a,b,k) => a+(b-a)*k;
const mix3 = (v,a,b,k,sx=1) => v.set(mix(a[0],b[0],k)*sx,mix(a[1],b[1],k),mix(a[2],b[2],k));
function buildCat() {
  const cat = new THREE.Group();
  cat.userData.moving = true; // it walks while the visitor stands still: the detail culler judges it every update (#267)

  // body + bib (in a torso group the breed can widen); their shape comes from `pose` (sitting ↔ standing, #224)
  const torso = new THREE.Group();
  const body = blob(ROLE.coat, 1, 1, 1, 0, 0, 0);
  const bib = blob(ROLE.bib, 1, 1, 1, 0, 0, 0);
  torso.add(body, bib);
  cat.add(torso);
  // hind legs, each on a hip pivot: the haunch (thigh) and a hock pivot with the shin and the paw. Sitting, the shin
  // lies forward on the floor under the haunch; standing, the hips are up at shoulder height (#224)
  const hips = [];
  for (const s of [-1, 1]) {
    const hip = new THREE.Group();
    const thigh = blob(ROLE.coat, 1, 1, 1, 0, 0, 0);
    const hock = new THREE.Group();
    const foot = blob(ROLE.paw, 1, 1, 1, 0, -HIND_SHIN, 0.015);
    hock.add(limb(ROLE.paw, 0.019, HIND_SHIN, 0, 0, 0), foot);
    hip.add(thigh, hock);
    cat.add(hip);
    hips.push({ hip, thigh, hock, foot, side: s });
  }

  // front legs, each on a shoulder pivot: the right one lifts to the face, all four swing when it walks (#163, #224)
  const leftShoulder = new THREE.Group();
  leftShoulder.add(limb(ROLE.paw, 0.021, 0.17, 0, 0, 0), blob(ROLE.paw, 0.026, 0.017, 0.035, 0, -0.153, 0.015));
  cat.add(leftShoulder);
  const shoulder = new THREE.Group();
  shoulder.add(limb(ROLE.paw, 0.021, 0.17, 0, 0, 0));
  const paw = blob(ROLE.paw, 0.026, 0.017, 0.035, 0, -0.153, 0.015);
  shoulder.add(paw);
  cat.add(shoulder);

  // head
  const head = new THREE.Group();
  head.add(blob(ROLE.coat, 0.072, 0.064, 0.068, 0, 0, 0));
  const muzzle = blob(ROLE.face, 0.042, 0.032, 0.035, 0, -0.022, 0.05);
  head.add(muzzle);
  const nose=blob(pink,0.009,0.007,0.006,0,-0.008,0.083);nose.name='cat-nose';head.add(nose);           // nose
  const blaze = blob(ROLE.blaze, 0.016, 0.03, 0.01, 0, 0.03, 0.058);         // blaze
  head.add(blaze);
  const eyes = [], ears = [];
  for (const s of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.055, 4), ROLE.ear);
    ear.position.set(s * 0.042, 0.063, -0.005);
    ear.rotation.set(-0.15, Math.PI / 4, s * -0.3);
    ear.castShadow = true;
    head.add(ear);
    ears.push(ear);
    // eyes on a lid pivot so they can close (scale y → 0) while asleep
    const eye = new THREE.Group();
    eye.position.set(s * 0.028, 0.012, 0.06);
    eye.add(blob(eyeMat, 0.014, 0.012, 0.008, 0, 0, 0), blob(pupilMat, 0.004, 0.01, 0.004, 0, 0, 0.007));
    head.add(eye);
    // closed eye: a thin dark line, shown instead
    const shut = blob(pupilMat, 0.013, 0.0018, 0.004, s * 0.028, 0.01, 0.066);
    shut.visible = false;
    head.add(shut);
    eyes.push({ eye, shut });
  }
  cat.add(head);

  // tail on a pivot at its root: curled round onto the floor while sitting, raised up behind while standing (`pose`)
  const tailGroup = new THREE.Group();
  const tail = new THREE.Mesh(new THREE.BufferGeometry(), ROLE.tail);
  tail.castShadow = true;
  const tip = blob(ROLE.tip, 0.02, 0.018, 0.03, 0, 0, 0);
  tailGroup.add(tail, tip);
  cat.add(tailGroup);
  return { cat, head, shoulder, leftShoulder, hips, tailGroup, tip, eyes, torso, body, bib, muzzle, ears, tail, blaze };
}


/** Silent geometry rig, cloned materials; the renderer merges its visible pose into one draw. */
export function createCatPuppet(color=0x7b8188){
 const parts=buildCat(),p=new CatPuppet();Object.assign(p,{parts,object:parts.cat,head:parts.head,shoulder:parts.shoulder,leftShoulder:parts.leftShoulder,tailGroup:parts.tailGroup,eyes:parts.eyes,headOff:new THREE.Vector3(),stand:0,wantStand:0,gaitAmp:0,gaitPhase:0,tailK:-1,tailUK:-1,shape:{size:1,fluff:1,legs:1,tailLen:1,tail:1}});
 const mats=new Map();p.object.traverse(o=>{if(!o.isMesh)return;let m=mats.get(o.material);if(!m){m=o.material.clone();if(Object.values(ROLE).includes(o.material))m.color.setHex(color);mats.set(o.material,m);}o.material=m;o.castShadow=false;o.raycast=()=>{};});
 p.pose(0);return p;
}
class CatPuppet {
 stride(m){this.gaitPhase=(this.gaitPhase+m/.3*2*Math.PI)%(2*Math.PI);this.walked=true;}
  pose(dt) {
    const W = CAT_WALK, p = this.parts, sh = this.shape, fluff = sh.fluff;
    const d = this.wantStand - this.stand;
    this.stand += Math.sign(d) * Math.min(Math.abs(d), dt / W.rise);
    const da = (this.walked ? 1 : 0) - this.gaitAmp;
    this.gaitAmp += Math.sign(da) * Math.min(Math.abs(da), dt / 0.2);
    const S = POSE.sit, T = POSE.stand, k = smooth(0, 1, this.stand), a = this.gaitAmp, ph = this.gaitPhase;
    const bob = a * W.bob * Math.cos(2 * ph) + (this.hopY ?? 0); // (+ a kitten's hop, #363)
    // short legs (a kitten, #363): the front legs shortened by `dropF`, the hind ones by `dropH` (folded sitting, so less);
    // the body, head and shoulders come down with them, sitting the body gets squatter so it still sits on the floor
    const L = sh.legs, dropF = (1 - L) * 0.17, dropH = (1 - L) * mix(0.075, 0.158, k);
    this.legDrop = dropF;
    // standing, the fluff makes it taller rather than longer
    p.torso.scale.set(fluff, mix(1, fluff, k), mix(fluff, 1, k));
    p.torso.position.y = bob;
    mix3(p.body.position, S.body, T.body, k).y -= dropF;
    mix3(p.body.scale, S.bodyScale, T.bodyScale, k).y -= dropF * (1 - k);
    p.body.rotation.x = mix(S.bodyTilt, T.bodyTilt, k);
    mix3(p.bib.position, S.bib, T.bib, k).y -= dropF;
    mix3(p.bib.scale, S.bibScale, T.bibScale, k);
    mix3(this.shoulder.position, S.shoulder, T.shoulder, k).y += bob - dropF;
    mix3(this.leftShoulder.position, S.shoulder, T.shoulder, k, -1).y += bob - dropF;
    this.shoulder.scale.set(1, L, 1); this.leftShoulder.scale.set(1, L, 1);
    if (a > 1e-3) {
      this.shoulder.rotation.set(a * W.swing * Math.sin(ph), 0, 0);
      this.leftShoulder.rotation.set(a * W.swing * Math.sin(ph + Math.PI), 0, 0);
    }
    for (const h of p.hips) {
      const phi = h.side < 0 ? ph : ph + Math.PI; // diagonal to the front leg on the other side
      mix3(h.hip.position, S.hip, T.hip, k, h.side * fluff).y += bob - dropH;
      h.hip.scale.set(1, L, 1);
      h.hip.rotation.x = a * W.swing * Math.sin(phi);
      mix3(h.thigh.position, S.thigh, T.thigh, k);
      mix3(h.thigh.scale, S.thighScale, T.thighScale, k);
      h.thigh.scale.x *= fluff; h.thigh.scale.z *= mix(fluff, 1, k);
      mix3(h.hock.position, S.hock, T.hock, k);
      h.hock.rotation.x = mix(S.hockAngle, T.hockAngle, k) + a * W.knee * Math.max(0, -Math.cos(phi));
      mix3(h.foot.scale, S.footScale, T.footScale, k);
      h.foot.rotation.x = -(h.hip.rotation.x + h.hock.rotation.x); // the paw stays flat
    }
    mix3(this.head.position, S.head, T.head, k).add(this.headOff).y += bob - dropF;
    if (a > 1e-3) this.head.rotation.x += a * 0.06 * Math.sin(2 * ph + 0.6);
    mix3(this.tailGroup.position, S.tailRoot, T.tailRoot, k).y += bob - k * (1 - L) * 0.158;
    const u = 0;
    if (Math.abs(k - this.tailK) > 0.004 || Math.abs(u - this.tailUK) > 0.004) { // rebuilt only while the pose or the tail changes
      this.tailK = k; this.tailUK = u;
      const pts = S.tail.map((q, i) => mix3(new THREE.Vector3(), q, T.tail[i], k).multiplyScalar(sh.tailLen));
      // lying on the floor, a thick tail (and its tip) rests on it rather than in it (#414)
      const rootY = mix(S.tailRoot[1], T.tailRoot[1], k) - k * (1 - L) * 0.158, tube = 0.017 * sh.tail;
      pts.forEach((q, i) => { q.y = Math.max(q.y, (i === pts.length - 1 ? Math.max(tube, 0.018 * sh.tail) : tube) + 0.0005 - rootY); });
      p.tail.geometry.dispose();
      p.tail.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 12, 0.017 * sh.tail, 5);
      p.tip.position.copy(pts[pts.length - 1]);
      const r = sh.tail; // a thick tail gets a thick tip (it shows once the tail is up)
      p.tip.scale.set(0.02 * r, 0.018 * r, mix(mix(0.03, 0.02, k), 0.02, u) * r);
    }
  }
}
