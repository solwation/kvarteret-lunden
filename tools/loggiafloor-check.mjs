// #112 (upstream #1428, b58d0d7e): A/B north loggias have a floor at y 0 and ground support; screenshots desktop + mobile.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
const [base = 'http://localhost:8774', out = '/tmp/kvarteret-112'] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH, args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const errors = [];
try {
  for (const [name, w, h] of [['desktop', 1024, 768], ['mobile', 844, 390]]) {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    page.on('pageerror', e => errors.push(e.message));
    await page.route('**/src/main.js', r => r.fulfill({ body: '// mock', contentType: 'text/javascript' }));
    await page.goto(base);
    const res = await page.evaluate(async ([w, h]) => {
      const THREE = await import('three');
      const surr = await import('/src/surroundings.js');
      const spots = { 'A-NE': [7.7, 29.8], 'A-NW': [-8.06, 29.8], 'B-NE': [-24.3, 34.3], 'B-NW': [-40.04, 34.3] };
      const ys = Object.fromEntries(Object.entries(spots).map(([k, [x, z]]) => [k, surr.groundY(x, z)]));
      const scene = new THREE.Scene(); scene.background = new THREE.Color('#87ceeb');
      scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 2));
      scene.add(surr.buildSurroundings({ grass: true }));
      const cam = new THREE.PerspectiveCamera(55, w / h, 0.1, 500);
      const r = new THREE.WebGLRenderer({ antialias: true }); r.setSize(w, h); document.body.replaceChildren(r.domElement);
      cam.position.set(7.7, 5, 36); cam.lookAt(7.7, 0, 29.8); r.render(scene, cam);
      return { ys };
    }, [w, h]);
    console.log(name, JSON.stringify(res));
    for (const [k, y] of Object.entries(res.ys)) assert.ok(Math.abs(y) < 0.01, `${k} groundY ${y} should be 0`);
    await page.screenshot({ path: `${out}/${name}.png` });
  }
  assert.equal(errors.length, 0, errors.join(', '));
  console.log('PASS');
} finally { await browser.close(); }
