// Architectural source: solwation/lunden-3d-apartment, c079371f6782225e29e9dac51518c509ed8c37e6.
// Adapted for the independent, impersonal Kvarteret Lunden walkthrough.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

/** The empty, fixed wheel stand: two galvanized arcs, without a bicycle. */
export function standGeometry() {
  const arc = (z) => new THREE.TorusGeometry(0.32, 0.011, 5, 12, Math.PI * 0.64)
    .rotateZ(-Math.PI * 0.82).translate(0.42, 0.34, z);
  return mergeGeometries([arc(0.045), arc(-0.045)]);
}
