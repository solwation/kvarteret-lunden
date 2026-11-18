// Public #315 (original #2101, 314c2d93): the site wind sway on its actual public consumers (park trees, river reeds, courtyard
// shrubs) in the real public app, one page. Per view: a still frame (power 0 = the old geometry exactly, the shader's own early
// exit), the public fixed breeze (SITE_WIND.calm) and a windy frame (power 1, the &wind= override's top), each at two wind times.
// Pixel motion between the two times per power, still vs windy, draws/triangles/programs, shader errors and external requests.
// node tools/sitewind315browser.cjs [base] [out]   (serve the checkout first: python3 -m http.server 8315)
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright'), fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const [base = 'http://localhost:8315', out = 'docs/verification/315'] = process.argv.slice(2);
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH, args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const report = { viewport: [1200, 800], views: [], errors: [], external: [] };
  try {
    const ctx = await browser.newContext({ viewport: { width: 1200, height: 800 }, deviceScaleFactor: 1 });
    await ctx.route('**/*', (r) => { const u = r.request().url(); if (!u.startsWith(base + '/')) { report.external.push(u); return r.abort(); } return r.continue(); });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => report.errors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error' || /THREE\.WebGLProgram|Shader Error|ERROR: 0:/.test(m.text())) report.errors.push(m.text().slice(0, 400)); });
    await page.clock.setFixedTime(new Date('2026-06-15T10:00:00Z'));
    const t0 = Date.now();
    await page.goto(base + '/?keepgeo&nocats');
    await page.waitForFunction(() => window.lundenViewer?.renderer.info.render.frame > 0, null, { timeout: 300000, polling: 1000 });
    report.loadMs = Date.now() - t0;
    await page.evaluate(() => { document.getElementById('start')?.click(); document.exitPointerLock?.(); const r = document.getElementById('resume'); if (r) r.hidden = true; });
    // the views, from the actual geometry: a river-park crown near the reeds, a reed tuft, a courtyard shrub; each camera spot is
    // the first of eight around the target (at `r` m) with a clear sight line (a raycast meets nothing before the target)
    const views = await page.evaluate(async () => {
      const R = await import('/src/riverpark.js'), S = await import('/src/surroundings.js'), THREE = await import('three'), a = lundenViewer, v = [];
      const ray = new THREE.Raycaster(), eye = new THREE.Vector3(), to = new THREE.Vector3();
      const spot = (name, target, r, h = 1.6, open = 0) => {
        for (let k = 0; k < 8; k++) {
          const ang = 3.93 + k * Math.PI / 4, x = target[0] + Math.sin(ang) * r, z = target[2] + Math.cos(ang) * r, y = S.groundY(x, z) + h;
          eye.set(x, y, z); to.set(...target).sub(eye); const d = to.length(); ray.set(eye, to.normalize()); ray.far = d - 1.2;
          const blocked = () => ray.intersectObjects(a.scene.children, true).some((i) => i.object.visible && !/^(tree-crowns|courtyard-shrubs|park-shore-growth)/.test(i.object.name));
          if (blocked()) continue;
          ray.set(new THREE.Vector3(...target).addScaledVector(to, 1.2), to.clone().negate()); ray.far = d - 1.2; // and back (single-sided walls)
          if (blocked()) continue;
          // `open` m: nothing (a wall) within that reach either side of the sight line, so the view is not half façade
          const yaw = Math.atan2(target[0] - x, target[2] - z); let side = false;
          for (const s of [-0.7, 0.7]) { ray.set(eye, new THREE.Vector3(Math.sin(yaw + s), 0, Math.cos(yaw + s))); ray.far = open; if (open && blocked()) side = true; }
          if (!side) return v.push({ name, target, from: [x, z], eyeY: y });
        }
      };
      const crowns = []; a.scene.traverse((o) => { if (/^tree-crowns /.test(o.name) && o.count) crowns.push(o); });
      const m = a.camera.matrix.clone(), p = a.camera.position.clone();
      const reed = R.parkReedFeet[Math.floor(R.parkReedFeet.length / 3)];
      const near = reed ?? { x: 0, z: 110 }, found = [];
      for (const c of crowns) for (let i = 0; i < c.count; i++) { c.getMatrixAt(i, m); p.setFromMatrixPosition(m.premultiply(c.matrixWorld)); found.push({ d: Math.hypot(p.x - near.x, p.z - near.z), x: p.x, y: p.y, z: p.z }); }
      found.sort((l, r) => l.d - r.d).splice(0, found.findIndex((f) => f.d > 10));
      for (const f of found.slice(0, 12)) { if (spot('park-trees', [f.x, f.y - 1, f.z], 13)) break; }
      if (reed) spot('river-reeds', [reed.x, reed.y + 0.6, reed.z], 4.5);
      const sh = a.scene.getObjectByName('courtyard-shrubs');
      if (sh?.count) for (let i = 0; i < sh.count && !v.some((x) => x.name === 'courtyard-shrubs'); i += 3) { sh.getMatrixAt(i, m); p.setFromMatrixPosition(m.premultiply(sh.matrixWorld)); spot('courtyard-shrubs', [p.x, p.y, p.z], 3, 1.6, 6); }
      return v;
    });
    report.picked = views; console.log(JSON.stringify(views));
    for (const v of views) {
      const shots = {};
      // warm-up: the LOD/culling settle after the jump (else the first frame differs from the rest regardless of the wind)
      await page.evaluate(({ v }) => { const a = lundenViewer; a.navigation.teleport(v.from[0], v.eyeY - 1.6, v.from[1]); a.camera.position.set(v.from[0], v.eyeY, v.from[1]); }, { v });
      await page.waitForTimeout(4000);
      for (const [label, power, t] of process.env.PROBE ? [['still', 0, 0.8]] : [['warm', 0, 0.8], ['still', 0, 0.8], ['still-b', 0, 2.3], ['calm-a', 'calm', 0.8], ['calm-b', 'calm', 2.3], ['windy-a', 1, 0.8], ['windy-b', 1, 2.3]]) {
        await page.evaluate(async ({ power, t }) => { const S = await import('/src/sitewind.js'), C = await import('/src/config.js'); S.siteWind.force = power === 'calm' ? C.SITE_WIND.calm : power; S.siteWind.hold = true; S.siteWind.time = t; }, { power, t });
        await page.evaluate(({ v }) => { const a = lundenViewer; a.navigation.teleport(v.from[0], v.eyeY - 1.6, v.from[1]); }, { v });
        await page.waitForTimeout(1200); // the app's own SiteWind.update applies force/time each frame
        const data = await page.evaluate(({ v }) => new Promise((ok) => requestAnimationFrame(async () => {
          const a = lundenViewer, S = await import('/src/sitewind.js');
          const [tx, ty, tz] = v.target, dx = tx - v.from[0], dz = tz - v.from[1], dist = Math.hypot(dx, dz);
          a.camera.position.set(v.from[0], v.eyeY, v.from[1]); a.camera.rotation.set(Math.atan2(ty - v.eyeY, dist), Math.atan2(-dx, -dz), 0, 'YXZ'); a.camera.updateMatrixWorld(true);
          S.siteWindUniforms.uSiteWindPower.value = S.siteWind.force; S.siteWindUniforms.uSiteWindTime.value = S.siteWind.time;
          const r = a.renderer; r.info.autoReset = false; r.info.reset(); r.render(a.scene, a.camera);
          const res = { power: S.siteWindUniforms.uSiteWindPower.value, t: S.siteWindUniforms.uSiteWindTime.value, calls: r.info.render.calls, triangles: r.info.render.triangles, textures: r.info.memory.textures, programs: r.info.programs.length };
          r.info.autoReset = true; ok({ image: r.domElement.toDataURL('image/png'), ...res });
        })), { v });
        const file = path.join(out, `${v.name}-${label}.png`);
        fs.writeFileSync(file, Buffer.from(data.image.split(',')[1], 'base64')); delete data.image;
        shots[label] = { file, ...data };
      }
      fs.rmSync(shots.warm.file); delete shots.warm; // the first frame after the jump only settles the LOD
      report.views.push({ ...v, shots });
    }
    if (process.env.PROBE) return;
    // pixel motion (mean |RGB difference|, share of pixels changing by more than 24) measured in the page; a motion map still vs windy
    for (const v of report.views) {
      const load = (f) => 'data:image/png;base64,' + fs.readFileSync(f).toString('base64');
      const pairs = { noise: ['still', 'still-b'], calm: ['calm-a', 'calm-b'], windy: ['windy-a', 'windy-b'], stillVsCalm: ['still', 'calm-a'], stillVsWindy: ['still', 'windy-a'] };
      v.motion = {};
      for (const [k, [a, b]] of Object.entries(pairs)) {
        const r = await page.evaluate(async ([a, b, map]) => {
          const img = async (src) => { const i = new Image(); i.src = src; await i.decode(); const c = new OffscreenCanvas(i.width, i.height), g = c.getContext('2d'); g.drawImage(i, 0, 0); return { d: g.getImageData(0, 0, i.width, i.height), w: i.width, h: i.height }; };
          const A = await img(a), B = await img(b), x = A.d.data, y = B.d.data; let s = 0, changed = 0;
          const o = new ImageData(A.w, A.h);
          for (let i = 0; i < x.length; i += 4) { const d = Math.abs(x[i] - y[i]) + Math.abs(x[i + 1] - y[i + 1]) + Math.abs(x[i + 2] - y[i + 2]); s += d; if (d > 24) changed++;
            const q = Math.min(255, d * 3), l = (x[i] + x[i + 1] + x[i + 2]) / 12; o.data[i] = Math.max(l, q); o.data[i + 1] = l; o.data[i + 2] = l; o.data[i + 3] = 255; }
          let url = null;
          if (map) { const c = new OffscreenCanvas(A.w, A.h); c.getContext('2d').putImageData(o, 0, 0); const blob = await c.convertToBlob({ type: 'image/png' }); url = await new Promise((ok) => { const fr = new FileReader(); fr.onload = () => ok(fr.result); fr.readAsDataURL(blob); }); }
          return { meanAbs: +(s / (x.length / 4) / 3).toFixed(3), changedPct: +(100 * changed / (x.length / 4)).toFixed(2), url };
        }, [load(v.shots[a].file), load(v.shots[b].file), k === 'stillVsWindy']);
        if (r.url) fs.writeFileSync(path.join(out, `${v.name}-motion-still-vs-windy.png`), Buffer.from(r.url.split(',')[1], 'base64'));
        delete r.url; v.motion[k] = r;
      }
      for (const s of Object.values(v.shots)) s.file = path.basename(s.file);
    }
    report.programs = await page.evaluate(() => lundenViewer.renderer.info.programs.map((p) => p.cacheKey).filter((k) => /site-wind/.test(k)).map((k) => k.slice(Math.max(0, k.indexOf('site-wind') - 30), k.indexOf('site-wind') + 30)));
    fs.writeFileSync(path.join(out, 'browser.json'), JSON.stringify(report, null, 1));
    console.log(JSON.stringify({ loadMs: report.loadMs, errors: report.errors, external: report.external.slice(0, 5), programs: report.programs, views: report.views.map((v) => ({ name: v.name, motion: v.motion, cost: Object.fromEntries(Object.entries(v.shots).map(([k, s]) => [k, [s.calls, s.triangles, s.textures, s.programs]])) })) }, null, 1));
    assert.deepEqual(report.errors, []); assert.deepEqual(report.external, []);
    assert.equal(report.views.length, 3, 'three views');
    for (const v of report.views) {
      assert(v.motion.windy.meanAbs > v.motion.noise.meanAbs, v.name + ' windy moves more than the still background');
      assert(Math.abs(v.shots.still.triangles - v.shots['windy-a'].triangles) <= v.shots.still.triangles * 1e-3, v.name + ' triangles still vs windy (±0.1 %: small animals move)');
      assert(Math.abs(v.shots.still.calls - v.shots['windy-a'].calls) <= 1, v.name + ' draws still vs windy');
    }
  } finally { await browser.close(); }
})().catch((e) => { console.error(e); process.exitCode = 1; });
