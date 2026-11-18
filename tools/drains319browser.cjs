// Public #319 (original #2121, 36005ad1): manhole covers, gully grates and courtyard drains in the real public app: Sankt Lars väg
// by day, a look down at a manhole and a gully, Karpvägen and a courtyard walk's grate; before/after, summer. "before" serves
// BASELINE's config.js and street.js (drains.js is then simply unused). node tools/drains319browser.cjs [base] [out] [mode]
// mode "probe" prints the drain mesh only. VIEWS = {"name":[x, z, yawRad (0 = north), pitchRad, feetY, month]} *guess* views
// chosen from drainPlacements() on the public geometry.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright'), fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict'), { execFileSync } = require('node:child_process');
const [base = 'http://localhost:8339', out = 'docs/verification/319', mode = 'shots'] = process.argv.slice(2);
const baseline = process.env.BASELINE || 'd190248', touched = ['config.js', 'street.js'];
const D = Math.PI / 180, VIEWS = JSON.parse(process.env.VIEWS || 'null') || {
  street: [-6, -28.6, 90 * D, -11 * D, 0], manhole: [-21.6, -27, 90 * D, -45 * D, 0], gully: [-12.2, -29.1, 90 * D, -45 * D, 0],
  karpvagen: [-75.8, -14, 180 * D, -12 * D, 0], courtyard: [-27.5, 20, 0, -45 * D, 0] };
const inspect = () => {
  const s = lundenViewer.scene; let meshes = 0, drains = null;
  s.traverse((o) => {
    if (o.isMesh || o.isInstancedMesh) meshes++;
    if (o.name === 'street-drains') { o.geometry.computeBoundingBox(); drains = { parent: o.parent?.name, triangles: o.geometry.attributes.position.count / 3, attributes: Object.keys(o.geometry.attributes).sort(), visible: o.visible, castShadow: o.castShadow, map: !!o.material.map, key: o.material.customProgramCacheKey(), box: [...o.geometry.boundingBox.min.toArray(), ...o.geometry.boundingBox.max.toArray()].map((v) => +v.toFixed(2)) }; }
  });
  return { meshes, drains };
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
      await page.waitForFunction(() => window.lundenViewer?.renderer.info.render.frame > 0 && lundenViewer.scene.getObjectByName('street-details'), null, { timeout: 300000, polling: 1000 });
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
      const a = report.phases.before, b = report.phases.after;
      assert.equal(a.drains, null, 'no covers before'); assert.equal(b.meshes - a.meshes, 1, 'one new mesh');
      assert.equal(b.drains.parent, 'street-details'); assert(b.drains.visible && !b.drains.castShadow && !b.drains.map);
      assert.deepEqual(b.drains.attributes, ['color', 'normal', 'position']);
      // Live scene motion: draws ±1 and ~0.01 % triangles differ between frames. The covers add at most one draw (plus their
      // shadow-receiving depth-less pass none: castShadow off), ≤ 2564 triangles, no texture and at most one program.
      for (const v of Object.keys(a.views)) { assert(b.views[v].calls - a.views[v].calls <= 2, v + ' draws'); assert(b.views[v].textures === a.views[v].textures, v + ' textures'); assert.deepEqual(a.views[v].camera, b.views[v].camera, v + ' camera'); assert(b.views[v].programs - a.views[v].programs <= 1, v + ' programs'); }
      assert.equal(b.storage, 'kept'); assert.deepEqual(report.errors, []); assert.deepEqual(report.external, []);
    }
    console.log(JSON.stringify({ errors: report.errors, external: report.external.slice(0, 5), load: Object.fromEntries(Object.entries(report.phases).map(([k, p]) => [k, p.loadMs])), drains: report.phases.after?.drains, before: report.phases.before?.views, views: report.phases.after?.views }));
  } finally { await browser.close(); }
})().catch((e) => { console.error(e); process.exitCode = 1; });
