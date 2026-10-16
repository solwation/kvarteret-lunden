// Architectural source: solwation/lunden-3d-apartment, c079371f6782225e29e9dac51518c509ed8c37e6.
// Adapted for the independent, impersonal Kvarteret Lunden walkthrough.
import * as THREE from 'three';
import { PATIO as P } from './config.js';

/** Slab paving texture (PATIO.paving), one repeat = 6 × 6 slabs; use with UVs in metres. */
export function pavingTexture() {
  const { slab, joint, color: [r0, g0, b0], jointColor } = P.paving;
  const n = 6, ppm = 160, px = Math.round(slab * ppm), jw = Math.max(1, Math.round(joint * ppm));
  const c = document.createElement('canvas');
  c.width = c.height = px * n;
  const g = c.getContext('2d');
  g.fillStyle = jointColor;
  g.fillRect(0, 0, c.width, c.height);
  let seed = 5;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let row = 0; row < n; row++) {
    const off = row % 2 ? px / 2 : 0; // half bond
    for (let col = -1; col < n; col++) {
      const k = 0.93 + rand() * 0.1;
      const x = col * px + off;
      g.fillStyle = `rgb(${r0 * k},${g0 * k},${b0 * k})`;
      g.fillRect(x + jw / 2, row * px + jw / 2, px - jw, px - jw);
      for (let i = 0; i < 40; i++) { // concrete speckle
        g.fillStyle = `rgba(${rand() < 0.5 ? '255,255,255' : '60,55,50'},${0.05 + rand() * 0.06})`;
        g.fillRect(x + jw + rand() * (px - 2 * jw), row * px + jw + rand() * (px - 2 * jw), 2, 2);
      }
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.repeat.set(1 / (slab * n), 1 / (slab * n));
  return tex;
}

