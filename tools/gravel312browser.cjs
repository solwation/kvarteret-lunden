// Public #312 (original #2096, b0581f3): the actual public gravel consumers (the courtyard gravel on the garage box and the
// river park's gravel paths) before/after, summer and winter (snow), in the real public app.
// node tools/gravel312browser.cjs [base] [out] [mode]; mode "probe" prints the gravel meshes and bounds only.
// "before" serves BASELINE's courtyard.js/riverpark.js (gravelsurface.js is then simply unused).
// VIEWS = {"name":[x, z, yawRad (0 = north), pitchRad, feetY, month]} *guess* views chosen from the probe's bounds.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright'), fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict'), { execFileSync } = require('node:child_process');
const [base = 'http://localhost:8312', out = 'docs/verification/312', mode = 'shots'] = process.argv.slice(2);
const baseline = process.env.BASELINE || '59c0ace', touched = ['courtyard.js', 'riverpark.js'];
const VIEWS = JSON.parse(process.env.VIEWS || '{}');
const inspect = () => {
  const s = lundenViewer.scene, gravel = []; let meshes = 0, patched = 0;
  s.traverse((o) => {
    if (o.isMesh || o.isInstancedMesh) meshes++;
    if (!o.isMesh || Array.isArray(o.material)) return; const m = o.material;
    if (m.userData?.gravelSurface) patched++;
    if (m.userData?.gravelSurface || o.name === 'park-paths' || (m.isMeshStandardMaterial && !m.map && m.color.getHex() === 0xcfc6b2)) {
      o.geometry.computeBoundingBox(); const b = o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld);
      gravel.push({ name: o.name || m.name || '?', vertices: o.geometry.attributes.position.count, index: o.geometry.index?.count ?? null, map: !!m.map, receiveShadow: o.receiveShadow, castShadow: o.castShadow, min: b.min.toArray().map((v) => +v.toFixed(2)), max: b.max.toArray().map((v) => +v.toFixed(2)) });
    }
  });
  return { meshes, patched, gravel };
};
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH, args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const report = { baseline: execFileSync('git', ['rev-parse', baseline], { encoding: 'utf8' }).trim(), viewport: [1200, 800], views: VIEWS, phases: {}, errors: [], external: [] };
  try {
    for (const phase of mode === 'probe' ? ['after'] : ['before', 'after']) {
      const ctx = await browser.newContext({ viewport: { width: 1200, height: 800 }, deviceScaleFactor: 1 });
      await ctx.addInitScript(() => { try { localStorage.setItem('lunden.sentinel', 'kept'); } catch {} });
      await ctx.route('**/*', (r) => {
        const u = r.request().url();
        if (!u.startsWith(base + '/')) { report.external.push(u); return r.abort(); }
        const f = new URL(u).pathname.match(/^\/src\/([a-z0-9]+\.js)$/);
        if (phase === 'before' && f && touched.includes(f[1])) return r.fulfill({ contentType: 'text/javascript', body: execFileSync('git', ['show', `${baseline}:src/${f[1]}`]) });
        return r.continue();
      });
      const page = await ctx.newPage();
      page.on('pageerror', (e) => report.errors.push(phase + ': ' + e.message));
      page.on('console', (m) => { if (m.type() === 'error' || /THREE\.WebGLProgram/.test(m.text())) report.errors.push(phase + ': ' + m.text()); });
      await page.clock.setFixedTime(new Date('2026-06-15T10:00:00Z'));
      const t0 = Date.now();
      await page.goto(base + '/?keepgeo');
      await page.waitForFunction(() => window.lundenViewer?.renderer.info.render.frame > 0 && lundenViewer.scene.getObjectByName('park-paths'), null, { timeout: 300000, polling: 1000 });
      const loadMs = Date.now() - t0;
      await page.evaluate(() => { document.getElementById('start')?.click(); document.exitPointerLock?.(); const r = document.getElementById('resume'); if (r) r.hidden = true; });
      const info = await page.evaluate(inspect);
      info.loadMs = loadMs; info.storage = await page.evaluate(() => localStorage.getItem('lunden.sentinel')); report.phases[phase] = info;
      if (mode === 'probe') { console.log(JSON.stringify(info, null, 1)); await ctx.close(); break; }
      info.views = {};
      for (const [name, [x, z, yaw, pitch, feet, month = 6]] of Object.entries(VIEWS)) {
        await page.evaluate(async (m) => { (await import('/src/seasons.js')).applySeason(m); }, month);
        await page.evaluate(([x, z, yaw, pitch, feet]) => { const a = lundenViewer; a.navigation.teleport(x, feet, z); a.camera.rotation.set(pitch, yaw, 0, 'YXZ'); }, [x, z, yaw, pitch, feet]);
        await page.waitForTimeout(1500);
        const data = await page.evaluate(([x, z, yaw, pitch, feet]) => new Promise((ok) => requestAnimationFrame(() => { const a = lundenViewer; a.navigation.teleport(x, feet, z); a.camera.position.set(x, a.navigation.eyeY, z); a.camera.rotation.set(pitch, yaw, 0, 'YXZ'); a.camera.updateMatrixWorld(true); a.renderer.render(a.scene, a.camera); ok({ image: a.renderer.domElement.toDataURL('image/png'), camera: a.camera.position.toArray().map((v) => +v.toFixed(3)) }); })), [x, z, yaw, pitch, feet]);
        fs.writeFileSync(path.join(out, `${name}-${phase}.png`), Buffer.from(data.image.split(',')[1], 'base64'));
        info.views[name] = { camera: data.camera, ...await page.evaluate(() => { const r = lundenViewer.renderer; r.info.autoReset = false; r.info.reset(); r.render(lundenViewer.scene, lundenViewer.camera); const v = { calls: r.info.render.calls, triangles: r.info.render.triangles, textures: r.info.memory.textures, geometries: r.info.memory.geometries, programs: r.info.programs.length }; r.info.autoReset = true; return v; }) };
      }
      await ctx.close();
    }
    if (mode !== 'probe') {
      fs.writeFileSync(path.join(out, 'browser.json'), JSON.stringify(report, null, 1));
      const a = report.phases.before, b = report.phases.after, key = (r) => JSON.stringify([r.vertices, r.index, r.receiveShadow, r.castShadow, r.min, r.max]);
      assert.equal(a.meshes, b.meshes, 'mesh count'); assert.equal(a.patched, 0); assert.equal(b.patched, 2, 'courtyard gravel + park gravel paths');
      assert.deepEqual(a.gravel.map(key).sort(), b.gravel.map(key).sort(), 'gravel geometry, shadows and bounds unchanged');
      // Live scene motion: draws ±1 and ~0.01 % triangles also differ between two frames of one phase. Textures: +2 shared maps
      // (the gravel colour and relief/roughness DataTextures) where a gravel batch is drawn, 0 in snow (the maps are dropped).
      for (const v of Object.keys(a.views)) { assert(Math.abs(a.views[v].calls - b.views[v].calls) <= 1, v + ' draws'); assert(Math.abs(a.views[v].triangles - b.views[v].triangles) <= a.views[v].triangles * 1e-4, v + ' triangles'); assert(b.views[v].textures - a.views[v].textures <= 2, v + ' textures'); assert.deepEqual(a.views[v].camera, b.views[v].camera, v + ' camera'); assert(b.views[v].programs - a.views[v].programs <= 3, v + ' programs'); }
      assert.equal(b.storage, 'kept'); assert.deepEqual(report.errors, []); assert.deepEqual(report.external, []);
    }
    console.log(JSON.stringify({ errors: report.errors, external: report.external.slice(0, 5), load: Object.fromEntries(Object.entries(report.phases).map(([k, p]) => [k, p.loadMs])), views: report.phases.after?.views }));
  } finally { await browser.close(); }
})().catch((e) => { console.error(e); process.exitCode = 1; });
