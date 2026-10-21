import * as THREE from 'three';
import { GARAGE } from './config.js';

// Neutral port of the original's CeilingBatchGate (upstream f3fb127, original #1387). The original's
// shared occlusion.js and PERF budget are not in this project, so only the whole-box test and its
// 5 mm margin (original #1361) are included here; no budget, geometry or distance limit is changed.
const OCCLUSION_MARGIN = 0.005;
const overlap = (b, w) => b.max.x >= w.x0 && b.min.x <= w.x1 && b.max.y >= w.y0 && b.min.y <= w.y1 && b.max.z >= w.z0 && b.min.z <= w.z1;

function blocked(eye, x, y, z, wall, margin) {
  let near = 0, far = 1;
  for (let i = 0; i < 3; i++) {
    const a = i === 0 ? wall.x0 : i === 1 ? wall.y0 : wall.z0;
    const b = i === 0 ? wall.x1 : i === 1 ? wall.y1 : wall.z1;
    const lo = a + (a === b ? 0 : margin), hi = b - (a === b ? 0 : margin);
    if (lo > hi) return false;
    const start = i === 0 ? eye.x : i === 1 ? eye.y : eye.z;
    const d = (i === 0 ? x : i === 1 ? y : z) - start;
    if (Math.abs(d) < 1e-12) { if (start < lo || start > hi) return false; continue; }
    const t0 = (lo - start) / d, t1 = (hi - start) / d;
    near = Math.max(near, Math.min(t0, t1)); far = Math.min(far, Math.max(t0, t1));
    if (near > far) return false;
  }
  return near > 1e-6 && far < 1 - 1e-6;
}

/** `box` is a conservative world AABB. Never hide an overlapping object or a partially exposed silhouette. */
export function wholeBoxOccluded(eye, box, occluders, margin) {
  for (const wall of occluders) {
    if (overlap(box, wall)) continue;
    let all = true;
    for (let i = 0; i < 8; i++) {
      if (!blocked(eye, i & 1 ? box.max.x : box.min.x, i & 2 ? box.max.y : box.min.y, i & 4 ? box.max.z : box.min.z, wall, margin)) { all = false; break; }
    }
    if (all) return true;
  }
  return false;
}

// Exactly the ceiling rectangles emitted by Garage: no stair cores or open exterior recesses.
export const garageCeilings = () => GARAGE.rects.filter(r => r.id !== 'core' && !r.core && !r.outside)
  .map(r => ({ x0:r.x0, x1:r.x1, z0:r.z0, z1:r.z1, y0:GARAGE.ceiling, y1:GARAGE.ceiling }));
const HIDDEN = 7; // existing render-only layer; physical traces include it

/** Opt-in complete static batches. No geometry, instance buffers, visible flags or raycasts change. */
export class CeilingBatchGate extends THREE.Object3D {
  constructor(meshes, baseShown = () => true) {
    super(); this.name = 'ceiling-batch-gate'; this.isLOD = true; this.autoUpdate = true;
    this.meshes = meshes; this.baseShown = baseShown; this.occluders = garageCeilings();
    this.box = new THREE.Box3(); this.part = new THREE.Box3(); this.eye = new THREE.Vector3();
    this.bounds = meshes.map(mesh => {
      if (mesh.isInstancedMesh) { if (!mesh.boundingBox) mesh.computeBoundingBox(); }
      else if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
      return (mesh.isInstancedMesh ? mesh.boundingBox : mesh.geometry.boundingBox).clone();
    });
    this.add(...meshes);
  }
  update(camera) {
    // All-layer warm-up/compile passes retain their masks, including sliced warm-up's hidden items.
    if (camera.layers.isEnabled(HIDDEN)) return;
    this.eye.setFromMatrixPosition(camera.matrixWorld); this.box.makeEmpty();
    this.meshes.forEach((mesh,i) => this.box.union(this.part.copy(this.bounds[i]).applyMatrix4(mesh.matrixWorld)));
    const shown = this.baseShown() && !wholeBoxOccluded(this.eye, this.box, this.occluders, OCCLUSION_MARGIN);
    for (const mesh of this.meshes) mesh.layers.set(shown ? 0 : HIDDEN);
  }
}
