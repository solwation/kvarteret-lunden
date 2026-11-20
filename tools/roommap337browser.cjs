// Public #337 (original #2180, dd7e6697): fake rooms with curtains/blinds behind the neighbours' near window glass, before/after,
// day and the night window path, in the real public app. Adapted from tools/glasspanes307browser.cjs.
// node tools/roommap337browser.cjs [base] [out]; "before" serves BASELINE's versions of the touched modules (and no interiormap.js use).
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright'), fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict'), { execFileSync } = require('node:child_process');
const [base = 'http://localhost:8610', out = 'docs/verification/337', mode = 'shots'] = process.argv.slice(2);
const baseline = process.env.BASELINE || 'a08a6f3836b823f334f4ff73700f9b1781582d44', touched = ['config.js', 'exterior.js', 'glasspanes.js', 'surroundings.js'];
// [x, z, yaw (rad, 0 = north), pitch (rad)] *guess* views chosen from the probe's glass bounds.
const VIEWS = JSON.parse(process.env.VIEWS || '{"husL":[-12,-13,3.0,0.18],"abc":[9,21,0.8,0.12]}');
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH, args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const report = { baseline, viewport: [1200, 800], views: VIEWS, phases: {}, errors: [], external: [] };
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
      await page.waitForFunction(() => window.lundenViewer?.renderer.info.render.frame > 0 && lundenViewer.scene.getObjectByName('siteNeighborGlass') && lundenViewer.scene.getObjectByName('south-glass'), null, { timeout: 300000, polling: 1000 });
      const loadMs = Date.now() - t0;
      await page.evaluate(() => { document.getElementById('start')?.click(); document.exitPointerLock?.(); const r = document.getElementById('resume'); if (r) r.hidden = true; });
      const info = await page.evaluate(() => {
        const s = lundenViewer.scene, glass = {}, missing = [];
        s.traverse((o) => { if (!o.isMesh) return; for (const m of [].concat(o.material)) if (m.vertexColors && !o.geometry.attributes.color) missing.push(o.name || o.parent?.name);
          if (/glass/i.test(o.name) && /neighbor|Neighbor|backdrop/.test(`${o.name} ${o.parent?.name}`)) { o.geometry.computeBoundingBox(); const b = o.geometry.boundingBox;
            glass[o.parent.name + '/' + o.name] = { vertices: o.geometry.attributes.position.count, index: o.geometry.index?.count ?? null, color: !!o.geometry.attributes.color, vertexColors: [].concat(o.material).map((m) => m.vertexColors), type: [].concat(o.material)[0].type, envMap: !!o.material.envMap, transparent: o.material.transparent, opacity: o.material.opacity, bounds: [b.min.toArray().map(Math.round), b.max.toArray().map(Math.round)] }; } });
        let meshes = 0; s.traverse((o) => { if (o.isMesh || o.isInstancedMesh) meshes++; });
        const clear = []; s.traverse((o) => { if (o.isMesh && o.material?.transparent && /glass|window|pane/i.test(o.name)) clear.push(o.name); });
        return { glass, missing, meshes, clearGlass: clear.sort(), storage: localStorage.getItem('lunden.sentinel') };
      });
      info.loadMs = loadMs; report.phases[phase] = info;
      if (mode === 'probe') { console.log(JSON.stringify(info, null, 1)); await ctx.close(); break; }
      info.views = {};
      for (const [name, [x, z, yaw, pitch]] of Object.entries(VIEWS)) for (const [when, hour, night] of [['dag', 12, 0], ['natt', 22.5, 1]]) {
        // The public app has no day cycle (main.js sets windowLights 12/0 once); "natt" drives the same window/glass
        // night path (envMapIntensity → reflectionNight, lit panes) and dims the scene lights for a readable comparison.
        await page.evaluate(([x, z, yaw, pitch, hour, night]) => { const a = lundenViewer; a.navigation.teleport(x, a.navigation.pos.y, z); a.camera.rotation.set(pitch, yaw, 0, 'YXZ');
          a.world.windowLights.update(hour, night, true); a.scene.traverse((o) => { if (o.isLight) { o.userData.dayIntensity ??= o.intensity; o.intensity = o.userData.dayIntensity * (night ? .08 : 1); } }); }, [x, z, yaw, pitch, hour, night]);
        await page.waitForTimeout(1500);
        const file = path.join(out, `${name}-${when}-${phase}.png`);
        // SwiftShader frames are slow for page.screenshot: render once in a frame callback and read the canvas (native size).
        const data = await page.evaluate(() => new Promise((ok) => requestAnimationFrame(() => { const a = lundenViewer; a.renderer.render(a.scene, a.camera); ok(a.renderer.domElement.toDataURL('image/png')); })));
        fs.writeFileSync(file, Buffer.from(data.split(',')[1], 'base64'));
        info.views[`${name}-${when}`] = await page.evaluate(() => { const r = lundenViewer.renderer; r.info.autoReset = false; r.info.reset(); r.render(lundenViewer.scene, lundenViewer.camera); const v = { calls: r.info.render.calls, triangles: r.info.render.triangles, textures: r.info.memory.textures, geometries: r.info.memory.geometries, programs: r.info.programs.length }; r.info.autoReset = true; return v; });
      }
      await ctx.close();
    }
    if (mode !== 'probe') {
      const a = report.phases.before, b = report.phases.after;
      assert.deepEqual(b.missing, []); assert.deepEqual(a.clearGlass, b.clearGlass, 'see-through glass untouched'); assert.equal(a.meshes, b.meshes);
      for (const k of Object.keys(a.glass)) { assert(b.glass[k], k); assert.equal(b.glass[k].transparent, a.glass[k].transparent); assert.deepEqual(b.glass[k].bounds, a.glass[k].bounds, k + ' bounds'); assert(b.glass[k].color, k + ' colour'); }
      for (const v of Object.keys(a.views)) { assert.equal(a.views[v].textures, b.views[v].textures, v + ' textures'); assert(b.views[v].calls - a.views[v].calls <= 2, v + ' draws'); assert(b.views[v].programs - a.views[v].programs <= 3, v + ' programs'); }
      assert.equal(b.storage, 'kept'); assert.deepEqual(report.errors, []); assert.deepEqual(report.external, []);
      fs.writeFileSync(path.join(out, 'browser.json'), JSON.stringify(report, null, 1));
    }
    console.log(JSON.stringify({ errors: report.errors, external: report.external.slice(0, 5), load: Object.fromEntries(Object.entries(report.phases).map(([k, p]) => [k, p.loadMs])) }));
  } finally { await browser.close(); }
})().catch((e) => { console.error(e); process.exitCode = 1; });
