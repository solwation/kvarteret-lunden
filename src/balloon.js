import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { BALLOON as B } from './config.js';
import { balloonScale, balloonPos } from './balloongeo.js';

// Passive geometry adapted from original 578ecc09b02c7355e299fc58d0e0127b622ee85a.
// One merged mesh; no interaction, physical surface, sound, services or state persistence.

const col = (g, hex) => { const c = new THREE.Color(hex), n = g.attributes.position.count, a = new Float32Array(n * 3); for (let i = 0; i < n; i++) a.set([c.r, c.g, c.b], i * 3); g.setAttribute('color', new THREE.BufferAttribute(a, 3)); return g; };
/** #1770: the rainbow colour index (into B.rainbow) of the gore at plan angle `a` (atan2(z, x), radians) round the envelope. */
export const stripeAt = (a, cfg = B) => (Math.floor((((a + Math.PI) / (Math.PI * 2)) % 1) * cfg.stripes) % cfg.stripes) % cfg.rainbow.length;
const plain = (g) => { g.deleteAttribute('uv'); return g.index ? g.toNonIndexed() : g; };

export function balloonGeometry() {
  const parts = [], R = B.envR, cy = B.envLow + R * 0.92, segs = B.stripes * 2;
  // envelope: a squashed sphere (a "teardrop" lower half), coloured gores in rainbow order (#1770). Each triangle takes its stripe from its
  // centroid's angle, so a gore is one flat colour (a vertex on a gore boundary would otherwise blend two).
  const env = plain(new THREE.SphereGeometry(R, segs, 14, 0, Math.PI * 2, 0, Math.PI * 0.86));
  const pos = env.attributes.position, c = new Float32Array(pos.count * 3), cols = B.rainbow.map((h) => new THREE.Color(h));
  for (let i = 0; i < pos.count; i += 3) {
    const k = stripeAt(Math.atan2(pos.getZ(i) + pos.getZ(i + 1) + pos.getZ(i + 2), pos.getX(i) + pos.getX(i + 1) + pos.getX(i + 2)));
    for (let j = i; j < i + 3; j++) {
      const y = pos.getY(j), x = pos.getX(j), z = pos.getZ(j);
      const t = (R - y) / (2 * R); const tint = 0.85 + 0.15 * (1 - t); // slightly darker towards the mouth
      c.set([cols[k].r * tint, cols[k].g * tint, cols[k].b * tint], j * 3);
      pos.setY(j, y * 1.12 + cy); // taller than wide
      if (y < -R * 0.5) { pos.setX(j, x * (0.55 + 0.9 * (y + R) / R)); pos.setZ(j, z * (0.55 + 0.9 * (y + R) / R)); } // narrows to the mouth
    }
  }
  env.setAttribute('color', new THREE.BufferAttribute(c, 3));
  parts.push(env);
  // basket: floor, open wall (double-sided), rim ring
  const r = B.basketR, wall = col(plain(new THREE.CylinderGeometry(r, r * 0.92, B.rim, 16, 1, true)), 0x9a7040); wall.translate(0, B.rim / 2, 0);
  const floor = col(plain(new THREE.CircleGeometry(r * 0.92, 16)), 0x7a5630); floor.rotateX(-Math.PI / 2); floor.translate(0, 0.02, 0);
  const rim = col(plain(new THREE.TorusGeometry(r, 0.05, 5, 16)), 0x5c4020); rim.rotateX(Math.PI / 2); rim.translate(0, B.rim, 0);
  parts.push(wall, floor, rim);
  // four ropes from the rim to the envelope mouth
  const mouth = 0.55 * R * 0.9, topY = B.envLow + 0.5;
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4, p0 = new THREE.Vector3(Math.cos(a) * r, B.rim, Math.sin(a) * r), p1 = new THREE.Vector3(Math.cos(a) * mouth * 0.7, topY, Math.sin(a) * mouth * 0.7);
    const len = p0.distanceTo(p1), g = col(plain(new THREE.CylinderGeometry(0.025, 0.025, len, 4, 1, true)), 0x4a3a28);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), p1.clone().sub(p0).normalize()));
    g.translate((p0.x + p1.x) / 2, (p0.y + p1.y) / 2, (p0.z + p1.z) / 2);
    parts.push(g);
  }
  for (const g of parts) { for (const n of Object.keys(g.attributes)) if (!['position', 'normal', 'color'].includes(n)) g.deleteAttribute(n); }
  return mergeGeometries(parts);
}

export class Balloon {
  constructor({scene,clock=()=>Date.now()/1000}){
    this.clock=clock;
    this.mesh=new THREE.Mesh(balloonGeometry(),new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide}));
    Object.assign(this.mesh,{name:'ambient-balloon',visible:false,castShadow:false,receiveShadow:false,matrixAutoUpdate:false});
    this.mesh.raycast=()=>{};this.mesh.userData.noDetail=true;scene.add(this.mesh);
  }
  update(camera,hidden=false){
    const t=this.clock(),scale=balloonScale(t);
    // Off-window: no camera access, position evaluation or geometry/matrix work.
    if(scale<=0||hidden){this.mesh.visible=false;return;}
    if(Math.hypot(camera.position.x-B.center.x,camera.position.z-B.center.z)>=B.radius+B.far){this.mesh.visible=false;return;}
    balloonPos(t,this.mesh.position);this.mesh.scale.setScalar(Math.max(.01,scale));this.mesh.updateMatrix();this.mesh.visible=true;
  }
}
