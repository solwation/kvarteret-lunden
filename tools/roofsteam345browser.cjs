// Public #345 (original #2204, 0638c8b1): cold roof condensation in the real public app. Matched effect-off/effect-on views at the
// existing outlets (house vent hoods; campus/school chimney caps), draw/triangle deltas, and the warm / far / level-0 / phone gates.
// node tools/roofsteam345browser.cjs [base] [out]   (serve the checkout first: python3 -m http.server 8670)
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright'), fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const [base = 'http://localhost:8670', out = 'docs/verification/345'] = process.argv.slice(2);
(async () => {
  fs.mkdirSync(path.join(out, 'before'), { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH, args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const report = { viewport: [1280, 720], views: [], errors: [], external: [] };
  try {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
    await ctx.route('**/*', (r) => { const u = r.request().url(); if (!u.startsWith(base + '/')) { report.external.push(u); return r.abort(); } return r.continue(); });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => report.errors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error' || /THREE\.WebGLProgram|Shader Error|ERROR: 0:/.test(m.text())) report.errors.push(m.text().slice(0, 400)); });
    await page.goto(base + '/?month=1&temp=-8&wind=0.3,3&nocats&noriverfish', { waitUntil: 'load' });
    await page.waitForFunction(() => window.lundenViewer?.renderer.info.render.frame > 0, null, { timeout: 600000, polling: 1000 });
    await page.evaluate(() => { document.getElementById('start')?.click(); document.exitPointerLock?.(); const r = document.getElementById('resume'); if (r) r.hidden = true; });
    report.sources = await page.evaluate(() => { const a = lundenViewer, n = {}; a.scene.traverse((o) => { if (o.userData.roofSteam?.length) n[o.name || 'surroundings'] = o.userData.roofSteam.length; }); return { total: a.roofSteam.sources.length, groups: n }; });
    console.log(JSON.stringify(report.sources));
    for (const view of ['houses', 'campus']) {
      const cap = await page.evaluate(async (view) => {
        const a = lundenViewer, r = a.roofSteam, THREE = await import('three'); let src;
        const own = []; a.scene.traverse((o) => { for (const q of o.userData.roofSteam ?? []) own.push({ name: o.name || 'surroundings', v: new THREE.Vector3(...q).applyMatrix4(o.matrixWorld) }); });
        const pick = own.filter((o) => (view === 'campus' ? o.name === 'east-backdrop' : o.name === 'surroundings'));
        src = (pick[0] ?? own[0]).v; src.y += 0.04;
        // the first of 3 radii x 3 heights x 8 azimuths (across the wind first; eye level with the cap so the plume reads against the sky) with a clear line to the outlet cap: the plume must start in frame
        const ray = new THREE.Raycaster(), tgt = new THREE.Vector3(src.x, src.y + 0.3, src.z), eye = new THREE.Vector3(); let found = null;
        for (const r2 of [12, 16, 20]) for (const h of [-1, 0.5, 2]) for (const k of [0, 4, 1, 5, 2, 6, 3, 7]) {
          if (found) break; const ang = Math.PI / 4 + k * Math.PI / 4; eye.set(src.x + Math.sin(ang) * r2, src.y + h, src.z + Math.cos(ang) * r2);
          const d = tgt.clone().sub(eye), len = d.length(); ray.set(eye, d.normalize()); ray.far = len - 0.4;
          if (!ray.intersectObjects(a.scene.children, true).some((i) => i.object.visible && i.object.isMesh)) found = eye.clone();
        }
        eye.copy(found ?? new THREE.Vector3(src.x + 12, src.y + 5, src.z + 12));
        a.navigation.teleport(eye.x, eye.y - 4, eye.z); a.camera.position.copy(eye);
        { const dx = src.x - eye.x, dz = src.z - eye.z, dy = src.y + 3 - eye.y; a.camera.rotation.set(Math.atan2(dy, Math.hypot(dx, dz)), Math.atan2(-dx, -dz), 0, 'YXZ'); a.camera.updateMatrixWorld(true); }
        const ndc = src.clone().project(a.camera);
        const cam = a.camera.position.clone(); r.time = 3.5; r.age = 1; r.update(.1); r.time = 3.5;
        const render = () => { a.renderer.info.autoReset = false; a.renderer.info.reset(); a.renderer.render(a.scene, a.camera); const i = a.renderer.info.render; a.renderer.info.autoReset = true; return { url: a.renderer.domElement.toDataURL('image/png'), calls: i.calls, triangles: i.triangles, points: i.points, programs: a.renderer.info.programs.length }; };
        for (let i = 0; i < 3; i++) a.renderer.render(a.scene, a.camera);
        const on = r.object.visible; r.object.visible = false; const before = render(); r.object.visible = on; const after = render();
        return { view, eye: { x: eye.x, y: eye.y, z: eye.z }, clear: !!found, ndc: [ndc.x, ndc.y], outlet: { x: src.x, y: src.y, z: src.z }, group: (pick[0] ?? own[0]).name, selected: r.selected.length, count: r.count, visible: r.object.visible, before, after };
      }, view);
      console.log(view, JSON.stringify({ g: cap.group, count: cap.count, b: { ...cap.before, url: undefined }, a: { ...cap.after, url: undefined } }));
      assert(cap.visible && cap.count > 0 && cap.count <= 480); assert(Math.abs(cap.ndc[0]) < 0.2 && cap.ndc[1] < 0.1 && cap.ndc[1] > -0.9, 'outlet in frame ' + cap.ndc); assert.equal(cap.after.calls - cap.before.calls, 1); assert.equal(cap.after.triangles, cap.before.triangles);
      for (const [key, dest] of [['before', `before/${view}.png`], ['after', `${view}.png`]]) { fs.writeFileSync(path.join(out, dest), Buffer.from(cap[key].url.split(',')[1], 'base64')); delete cap[key].url; }
      report.views.push(cap);
    }
    report.gates = await page.evaluate(async () => {
      const a = lundenViewer, r = a.roofSteam, w = r.weather, p = a.camera.position.clone(), t0 = w.temp, vis = () => r.object.visible;
      w.temp = 8; r.update(.1); const warm = !vis();
      w.temp = t0; a.camera.position.set(2000, 2000, 2000); r.age = 1; r.update(.1); const far = !vis();
      a.camera.position.copy(p); r.setLevel(0); r.update(.1); const q0 = !vis(); r.setLevel(3); r.update(.1); const restored = vis();
      const { RoofSteam } = await import('/src/roofsteam.js'), ph = new RoofSteam({ scene: a.scene, camera: a.camera, weather: w, phone: true }); ph.update(.1);
      const phone = { count: ph.count, max: ph.maxSources * ph.perSource }; ph.dispose();
      return { warm, far, q0, restored, phone, shadow: r.object.castShadow, depthWrite: r.object.material.depthWrite, desktopMax: r.maxSources * r.perSource };
    });
    for (const k of ['warm', 'far', 'q0', 'restored']) assert(report.gates[k], k);
    assert(report.gates.phone.count > 0 && report.gates.phone.count <= 72); assert(report.gates.desktopMax <= 480);
    // default scene (no &month): July, no condensation
    report.errorsCount = report.errors.length; assert.equal(report.errors.length, 0, report.errors.join('\n')); assert.equal(report.external.length, 0);
    fs.writeFileSync(path.join(out, 'browser.json'), JSON.stringify(report, null, 2)); console.log(JSON.stringify(report.gates));
    const page2 = await ctx.newPage(); await page2.goto(base + '/?nocats&noriverfish');
    await page2.waitForFunction(() => window.lundenViewer?.renderer.info.render.frame > 0, null, { timeout: 600000, polling: 1000 });
    await page2.waitForTimeout(1500);
    const july = await page2.evaluate(() => ({ temp: lundenViewer.roofSteam.weather.temp, visible: lundenViewer.roofSteam.object.visible }));
    console.log('default', JSON.stringify(july)); assert.equal(july.visible, false);
    report.default = july; fs.writeFileSync(path.join(out, 'browser.json'), JSON.stringify(report, null, 2));
  } finally { await browser.close(); }
})().catch((e) => { console.error(e); process.exitCode = 1; });
