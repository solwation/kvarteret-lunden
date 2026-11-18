// Public #309 (original #2089, da83c3a): the actual public outdoor railings (Hus L loftgång and terraces, ABC loggias,
// the garage-box railings, the bus stop) before/after, day and a dimmed dusk, in the real public app.
// node tools/railmetal309browser.cjs [base] [out] [mode]; mode "probe" prints the railing meshes and bounds only.
// "before" serves BASELINE's versions of the touched modules (railmetal.js is then simply unused).
// VIEWS = {"name":[x, z, yawRad (0 = north), pitchRad, feetY]} *guess* views chosen from the probe's bounds.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright'), fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict'), { execFileSync } = require('node:child_process');
const [base = 'http://localhost:8309', out = 'docs/verification/309', mode = 'shots'] = process.argv.slice(2);
const baseline = process.env.BASELINE || '345bce1', touched = ['config.js', 'exterior.js', 'surroundings.js', 'busstop.js'];
const VIEWS = JSON.parse(process.env.VIEWS || '{}');
// Railing meshes by material (before: the unnamed meshes are found by their old material values) with geometry sizes.
const inspect = () => {
  const s = lundenViewer.scene, rails = [];
  let meshes = 0, railMetal = 0;
  s.traverse((o) => {
    if (o.isMesh || o.isInstancedMesh) meshes++;
    if (!o.isMesh) return; const m = o.material; if (Array.isArray(m)) return;
    if (m.userData?.railMetal) railMetal++;
    const old = m.isMeshStandardMaterial && ((m.metalness === 0.3 && m.roughness === 0.5 && [0x8fa396, 0xb9bdbd].includes(m.color.getHex())) || (m.metalness === 0.2 && m.roughness === 0.45) || (m.map && m.alphaTest === 0.5 && m.roughness === 0.6 && m.side === 2));
    if (m.userData?.railMetal || old || o.name === 'bus-stop-furniture') {
      o.geometry.computeBoundingBox(); const b = o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld);
      rails.push({ name: o.name || '?', parent: o.parent?.name, vertices: o.geometry.attributes.position.count, index: o.geometry.index?.count ?? null, attrs: Object.keys(o.geometry.attributes).sort().join(), color: m.color.getHex().toString(16), map: !!m.map, metal: m.metalness, rough: m.roughness, patched: !!m.userData?.railMetal, castShadow: o.castShadow, min: b.min.toArray().map((v) => +v.toFixed(1)), max: b.max.toArray().map((v) => +v.toFixed(1)) });
    }
  });
  return { meshes, railMetal, rails };
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
      await page.waitForFunction(() => window.lundenViewer?.renderer.info.render.frame > 0 && lundenViewer.scene.getObjectByName('terraceRails') && lundenViewer.scene.getObjectByName('bus-stop-furniture'), null, { timeout: 300000, polling: 1000 });
      const loadMs = Date.now() - t0;
      await page.evaluate(() => { document.getElementById('start')?.click(); document.exitPointerLock?.(); const r = document.getElementById('resume'); if (r) r.hidden = true; });
      const info = await page.evaluate(inspect);
      info.loadMs = loadMs; info.storage = await page.evaluate(() => localStorage.getItem('lunden.sentinel')); report.phases[phase] = info;
      if (mode === 'probe') { console.log(JSON.stringify(info, null, 1)); await ctx.close(); break; }
      info.views = {};
      for (const [name, [x, z, yaw, pitch, feet]] of Object.entries(VIEWS)) for (const [when, dim] of [['dag', 1], ['skymning', .22]]) {
        // The public app has no day cycle: "skymning" dims every scene light (sun, sky, ambient) to `dim` of its day value,
        // which is what the edge light follows (it is a share of the ambient/sky irradiance).
        await page.evaluate(([x, z, yaw, pitch, feet, dim]) => { const a = lundenViewer; a.navigation.teleport(x, feet, z); a.camera.rotation.set(pitch, yaw, 0, 'YXZ');
          a.scene.traverse((o) => { if (o.isLight) { o.userData.dayIntensity ??= o.intensity; o.intensity = o.userData.dayIntensity * dim; } }); }, [x, z, yaw, pitch, feet, dim]);
        await page.waitForTimeout(1500);
        // Re-pose right before the frame: walking physics may nudge the player during the settle wait, and both phases must
        // show exactly the same camera.
        const data = await page.evaluate(([x, z, yaw, pitch, feet]) => new Promise((ok) => requestAnimationFrame(() => { const a = lundenViewer; a.navigation.teleport(x, feet, z); a.camera.position.set(x, a.navigation.eyeY, z); a.camera.rotation.set(pitch, yaw, 0, 'YXZ'); a.camera.updateMatrixWorld(true); a.renderer.render(a.scene, a.camera); ok({ image: a.renderer.domElement.toDataURL('image/png'), camera: a.camera.position.toArray().map((v) => +v.toFixed(3)) }); })), [x, z, yaw, pitch, feet]);
        fs.writeFileSync(path.join(out, `${name}-${when}-${phase}.png`), Buffer.from(data.image.split(',')[1], 'base64'));
        info.views[`${name}-${when}`] = { camera: data.camera, ...await page.evaluate(() => { const r = lundenViewer.renderer; r.info.autoReset = false; r.info.reset(); r.render(lundenViewer.scene, lundenViewer.camera); const v = { calls: r.info.render.calls, triangles: r.info.render.triangles, textures: r.info.memory.textures, geometries: r.info.memory.geometries, programs: r.info.programs.length }; r.info.autoReset = true; return v; }) };
      }
      await ctx.close();
    }
    if (mode !== 'probe') {
      fs.writeFileSync(path.join(out, 'browser.json'), JSON.stringify(report, null, 1));
      const a = report.phases.before, b = report.phases.after, key = (r) => JSON.stringify([r.parent, r.vertices, r.index, r.attrs, r.color, r.map, r.metal, r.castShadow, r.min, r.max]);
      assert.equal(a.meshes, b.meshes, 'mesh count'); assert.equal(a.railMetal, 0); assert.equal(b.railMetal, b.rails.filter((r) => r.patched).length);
      assert.deepEqual(a.rails.map(key).sort(), b.rails.map(key).sort(), 'railing geometry, colours, metalness, shadows and bounds unchanged');
      // The live scene has a little independent motion (a draw ±1 and ~0.01 % triangles also differ between two frames of
      // the same phase), so draws/triangles get that tolerance; textures and the railing meshes above must match exactly.
      for (const v of Object.keys(a.views)) { assert(Math.abs(a.views[v].calls - b.views[v].calls) <= 1, v + ' draws'); assert(Math.abs(a.views[v].triangles - b.views[v].triangles) <= a.views[v].triangles * 1e-4, v + ' triangles'); assert.equal(a.views[v].textures, b.views[v].textures, v + ' textures'); assert.deepEqual(a.views[v].camera, b.views[v].camera, v + ' camera'); assert(b.views[v].programs - a.views[v].programs <= 3, v + ' programs'); }
      assert.equal(b.storage, 'kept'); assert.deepEqual(report.errors, []); assert.deepEqual(report.external, []);
      fs.writeFileSync(path.join(out, 'browser.json'), JSON.stringify(report, null, 1));
    }
    console.log(JSON.stringify({ errors: report.errors, external: report.external.slice(0, 5), load: Object.fromEntries(Object.entries(report.phases).map(([k, p]) => [k, p.loadMs])), views: report.phases.after?.views }));
  } finally { await browser.close(); }
})().catch((e) => { console.error(e); process.exitCode = 1; });
