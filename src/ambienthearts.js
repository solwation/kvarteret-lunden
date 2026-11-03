// Public #244: isolated procedural renderer from original 131b5d9d; Three.js only.
import * as THREE from 'three';
export function heartTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  const glow = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  glow.addColorStop(0, 'rgba(255,190,210,0.7)'); glow.addColorStop(0.5, 'rgba(255,140,170,0.15)'); glow.addColorStop(1, 'rgba(255,140,170,0)');
  g.fillStyle = glow; g.fillRect(0, 0, 64, 64);
  g.fillStyle = '#ffd6e2';
  g.beginPath();
  g.moveTo(32, 50);
  g.bezierCurveTo(10, 36, 12, 14, 24, 14); g.bezierCurveTo(29, 14, 32, 19, 32, 22);
  g.bezierCurveTo(32, 19, 35, 14, 40, 14); g.bezierCurveTo(52, 14, 54, 36, 32, 50);
  g.fill();
  return new THREE.CanvasTexture(c);
}

/** Small reusable ambient particles rising from a world point. */
export class Hearts {
  /** Each instance owns one bounded reusable Points pool and its procedural texture. */
  constructor(scene, n = 5, scale = 2.5) {
    this.k = scale;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    this.points = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.045 * scale, map: heartTexture(), vertexColors: true, transparent: true,
      depthWrite: false, blending: scale > 1 ? THREE.NormalBlending : THREE.AdditiveBlending, toneMapped: false }));
    Object.assign(this.points, { frustumCulled: false, visible: false, renderOrder: 2 });
    this.points.raycast = () => {}; // not a picking surface
    scene.add(this.points);
    this.p = [...Array(n)].map(() => ({ t: 1, o: new THREE.Vector3(), v: new THREE.Vector3() }));
    this.life = 1.6;
  }

  burst(at) {
    this.p.forEach((h, i) => {
      const a = i * 2.39996, r = (0.05 + Math.random() * 0.1) * this.k;
      h.o.set(at.x + Math.sin(a) * r, at.y + Math.random() * 0.06, at.z + Math.cos(a) * r);
      h.v.set(Math.sin(a) * 0.08 * this.k, (0.28 + Math.random() * 0.2) * this.k, Math.cos(a) * 0.08 * this.k);
      h.t = -i * 0.03; // one after another
    });
    this.points.visible = true;
  }

  update(dt) {
    if (!this.points.visible) return;
    const pos = this.points.geometry.attributes.position, col = this.points.geometry.attributes.color;
    let alive = false, fade = 0;
    this.p.forEach((h, i) => {
      h.t += dt;
      const k = h.t / this.life;
      if (k < 0 || k >= 1) { col.setXYZ(i, 0, 0, 0); pos.setY(i, -1000); if (k < 0) alive = true; return; } // (dead ones are parked far below: normal blending would show black)
      alive = true;
      const s = h.t;
      pos.setXYZ(i, h.o.x + h.v.x * s + Math.sin(s * 5 + i) * 0.02, h.o.y + h.v.y * s, h.o.z + h.v.z * s);
      const b = Math.sin(Math.PI * Math.min(1, k * 1.4)) * (1 - k * 0.4);
      if (this.k > 1) { col.setXYZ(i, 1, 0.42, 0.62); fade = Math.max(fade, b); } // opaque pink over the sky, faded together
      else col.setXYZ(i, b * 0.75, b * 0.16, b * 0.34); // pink: added onto what is behind
    });
    if (this.k > 1) this.points.material.opacity = Math.min(1, fade * 1.5);
    pos.needsUpdate = col.needsUpdate = true;
    this.points.visible = alive;
  }
  dispose() { this.points.removeFromParent(); this.points.geometry.dispose(); this.points.material.map.dispose(); this.points.material.dispose(); }

}

