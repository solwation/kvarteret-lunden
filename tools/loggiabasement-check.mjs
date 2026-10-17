// #44 adapted from upstream #1153: Hus A/B basement storeys have solid corners where loggias are buried below ground.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const [base = 'http://localhost:8774', out = '/tmp/kvarteret-rack44/after'] = process.argv.slice(2);

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH,
    args: ['--no-sandbox', `--use-angle=${process.env.ANGLE ?? 'swiftshader'}`, '--enable-unsafe-swiftshader']
  });
  const errors = [];
  try {
    const page = await browser.newPage({ viewport: { width: 1024, height: 768 } });
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.route('**/src/main.js', r => r.fulfill({ body: '// mock', contentType: 'text/javascript' }));
    await page.goto(base);

    const result = await page.evaluate(async () => {
      const THREE = await import('three');
      const S = await import('/src/config.js');
      const surr = await import('/src/surroundings.js');

      const group = surr.buildSurroundings({ grass: true });

      // Check meshes in group: verify that at Hus A NE corner (x: 6.02..9.42, z: 28.8..30.8),
      // no rendered inner walls exist at y < 0
      let innerWallsBelowGround = 0;
      group.traverse((obj) => {
        if (obj.isMesh && obj.geometry) {
          const pos = obj.geometry.attributes.position;
          if (!pos) return;
          for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
            if (x > 6.0 && x < 9.5 && z > 28.5 && z < 31.0 && y < -0.1) {
              if (obj.material?.roughness === 0.9 && obj.material?.color?.getHex() === 0xffffff) {
                innerWallsBelowGround++;
              }
            }
          }
        }
      });

      return { innerWallsBelowGround, ok: true };
    });

    assert.equal(result.innerWallsBelowGround, 0, 'No inner white walls generated in Hus A NE corner below ground');
    console.log('PASS: No inner white walls below ground in Hus A NE corner');

    // Visual screenshot verification
    await page.evaluate(async () => {
      const THREE = await import('three');
      const surr = await import('/src/surroundings.js');
      const scene = new THREE.Scene();
      scene.background = new THREE.Color('#87ceeb');
      scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 2));
      const sun = new THREE.DirectionalLight(0xffffff, 2);
      sun.position.set(20, 40, 20);
      scene.add(sun);

      const group = surr.buildSurroundings({ grass: true });
      scene.add(group);

      const camera = new THREE.PerspectiveCamera(55, 1024 / 768, 0.1, 500);
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(1024, 768);
      document.body.replaceChildren(renderer.domElement);

      camera.position.set(10.5, -1.3, 32.0);
      camera.lookAt(9.0, -0.5, 28.0);
      renderer.render(scene, camera);
    });

    await page.screenshot({ path: `${out}/hus_a_ne_corner.png` });
    console.log(`Saved screenshot to ${out}/hus_a_ne_corner.png`);
    assert.equal(errors.length, 0, `Page errors: ${errors.join(', ')}`);
    console.log('ALL PASS');
  } finally {
    await browser.close();
  }
})();
