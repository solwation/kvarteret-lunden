// Public #316 (original #2103, d9be131c): street wear in the real public app: Sankt Lars väg by day, the corner with the zebra,
// a look down at the zebra and a near road view; before/after, summer. "before" serves BASELINE's asphaltsurface.js,
// surroundings.js and street.js (streetwear.js is then simply unused). node tools/streetwear316browser.cjs [base] [out] [mode]
// mode "probe" prints the worn meshes only. VIEWS = {"name":[x, z, yawRad (0 = north), pitchRad, feetY, month]} *guess* views.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright'), fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict'), { execFileSync } = require('node:child_process');
const [base = 'http://localhost:8316', out = 'docs/verification/316', mode = 'shots'] = process.argv.slice(2);
const baseline = process.env.BASELINE || '7911f30', touched = ['asphaltsurface.js', 'surroundings.js', 'street.js'];
const D = Math.PI / 180, VIEWS = JSON.parse(process.env.VIEWS || 'null') || {
  street: [-6, -28.6, 90 * D, -11 * D, 0], intersection: [4, -26.2, -75 * D, -13 * D, 0], zebra: [11, -22.3, 0, -40 * D, 0], near: [-17, -27.2, 95 * D, -38 * D, 0] };
const inspect = () => {
  const s = lundenViewer.scene, worn = []; let meshes = 0, road = null, patches = null, zebra = null;
  const box = (o) => { o.geometry.computeBoundingBox(); const b = o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld); return [...b.min.toArray(), ...b.max.toArray()].map((v) => +v.toFixed(2)); };
  const desc = (o) => ({ name: o.name || o.material.name, vertices: o.geometry.attributes.position.count, attributes: Object.keys(o.geometry.attributes).sort(), receiveShadow: o.receiveShadow, castShadow: o.castShadow, box: box(o) });
  s.traverse((o) => {
    if (o.isMesh || o.isInstancedMesh) meshes++;
    if (!o.isMesh || Array.isArray(o.material)) return; const m = o.material;
    if (m.userData?.streetWear) worn.push(o.name || m.name);
    if (m.userData?.asphaltSurface) road = desc(o);
    if (o.parent?.name === 'street-details' && m.isMeshStandardMaterial && !m.map && m.color.getHex() === 0x45484b || o.name === 'street-asphalt-patches') patches = desc(o);
    if (o.parent?.name === 'street-details' && m.isMeshStandardMaterial && m.color.getHex() === 0xeeeeea) zebra = desc(o);
  });
  return { meshes, worn, road, patches, zebra };
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
      const a = report.phases.before, b = report.phases.after, strip = (r) => ({ ...r, attributes: r.attributes.filter((k) => k !== 'roadFrame' && k !== 'uv'), name: undefined });
      assert.equal(a.meshes, b.meshes, 'mesh count'); assert.deepEqual(a.worn, []); assert.deepEqual(b.worn.sort(), ['local-asphalt', 'street-zebra'].sort(), 'asphalt + zebra worn');
      assert.deepEqual(strip(a.road), strip(b.road), 'road geometry, shadows and bounds unchanged'); assert(b.road.attributes.includes('roadFrame'));
      assert.deepEqual(strip(a.zebra), strip(b.zebra), 'zebra unchanged'); assert(b.zebra.attributes.includes('roadFrame'));
      assert.equal(b.patches.vertices - a.patches.vertices, 3 * 6, 'three extra repair patches (6 non-indexed vertices each)'); assert(b.patches.attributes.includes('uv'));
      // Live scene motion: draws ±1 and ~0.01 % triangles differ between frames of one phase. Textures: the patches reuse the
      // asphalt's two shared maps (+0 where the road is drawn). Programs: the worn asphalt, worn zebra and patches change keys.
      for (const v of Object.keys(a.views)) { assert(Math.abs(a.views[v].calls - b.views[v].calls) <= 1, v + ' draws'); assert(Math.abs(a.views[v].triangles - b.views[v].triangles) <= a.views[v].triangles * 1e-3 + 64, v + ' triangles'); assert(b.views[v].textures - a.views[v].textures <= 2, v + ' textures'); assert.deepEqual(a.views[v].camera, b.views[v].camera, v + ' camera'); assert(b.views[v].programs - a.views[v].programs <= 3, v + ' programs'); }
      assert.equal(b.storage, 'kept'); assert.deepEqual(report.errors, []); assert.deepEqual(report.external, []);
    }
    console.log(JSON.stringify({ errors: report.errors, external: report.external.slice(0, 5), load: Object.fromEntries(Object.entries(report.phases).map(([k, p]) => [k, p.loadMs])), views: report.phases.after?.views }));
  } finally { await browser.close(); }
})().catch((e) => { console.error(e); process.exitCode = 1; });
