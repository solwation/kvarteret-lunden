// Public #313 (original #2098, c96d77e): the actual public bench consumers (a courtyard park bench close and a few metres
// off, the pergola benches, the bus stop's bench) before/after, summer day, in the real public app.
// node tools/benchwood313browser.cjs [base] [out]. "before" serves BASELINE's config.js/courtyard.js/busstop.js
// (benchwood.js is then simply unused). Views are derived from the scene itself, so both phases use the same cameras.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright'), fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict'), { execFileSync } = require('node:child_process');
const [base = 'http://localhost:8313', out = 'docs/verification/313'] = process.argv.slice(2);
const baseline = process.env.BASELINE || 'HEAD', touched = ['config.js', 'courtyard.js', 'busstop.js'];
const inspect = () => {
  const s = lundenViewer.scene, out = []; let meshes = 0;
  s.traverse((o) => {
    if (o.isMesh || o.isInstancedMesh) meshes++;
    if (!o.isMesh || Array.isArray(o.material)) return; const m = o.material;
    if (o.name === 'bus-stop-furniture' || (m.map && m.vertexColors && m.roughness === 0.8 && m.color?.getHex() === 0x8a6544)) {
      o.geometry.computeBoundingBox(); const b = o.geometry.boundingBox;
      out.push({ name: o.name || 'courtyard-wood', vertices: o.geometry.attributes.position.count, bytes: Object.values(o.geometry.attributes).reduce((t, a) => t + a.array.byteLength, 0), benchWood: !!m.userData.benchWood, railMetal: !!m.userData.railMetal, castShadow: o.castShadow, receiveShadow: o.receiveShadow, min: b.min.toArray().map((v) => +v.toFixed(3)), max: b.max.toArray().map((v) => +v.toFixed(3)) });
    }
  });
  return { meshes, batches: out };
};
// [x, z, yaw (rad, 0 = north), pitch (rad), feetY]
const views = () => {
  const bus = lundenViewer.scene.getObjectByName('bus-stop-furniture'), p = bus.geometry.attributes.position, c = bus.geometry.attributes.color;
  const wood = []; for (let i = 0; i < p.count; i++) if (c.getX(i) - c.getZ(i) > 0.2) wood.push([p.getX(i), p.getY(i), p.getZ(i)]); // the wood: red ≫ blue
  const ys = wood.map((v) => v[1]), ymin = Math.min(...ys), ymax = Math.max(...ys), mid = (ymin + ymax) / 2;
  const mean = (a) => [0, 1, 2].map((k) => a.reduce((t, v) => t + v[k], 0) / a.length), seat = mean(wood.filter((v) => v[1] < ymin + 0.06)), back = mean(wood.filter((v) => v[1] > mid));
  let fx = seat[0] - back[0], fz = seat[2] - back[2]; const l = Math.hypot(fx, fz); fx /= l; fz /= l; // the bench faces from its back to its seat
  bus.geometry.computeBoundingBox(); const feet = bus.geometry.boundingBox.min.y;
  const look = (cx, cz, tx, tz, pitch, y = 0) => [cx, cz, Math.atan2(-(tx - cx), -(tz - cz)), pitch, y];
  const b = { x: -37.3, z: 22.2, rot: -90 }, yaw = (b.rot + 180) * Math.PI / 180, bx = Math.sin(yaw), bz = Math.cos(yaw); // COURTYARD.benches[0]
  return { 'gard-bank-nara': look(b.x + bx * 1.5 + 0.5, b.z + bz * 1.5 + 0.6, b.x, b.z, -0.56), 'gard-bank': look(b.x + bx * 4 + 1.5, b.z + bz * 4 + 2, b.x, b.z, -0.24),
    'pergola-bank': look(-16.25 + 2.2, 21.2, -16.25, 22.6, -0.42), 'busskur-bank': look(seat[0] + fx * 1.6 + 0.4 * fz, seat[2] + fz * 1.6 - 0.4 * fx, seat[0], seat[2], -0.42, feet) };
};
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH, args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const report = { baseline: execFileSync('git', ['rev-parse', baseline], { encoding: 'utf8' }).trim(), viewport: [1200, 800], phases: {}, errors: [], external: [] };
  try {
    for (const phase of ['before', 'after']) {
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
      await page.waitForFunction(() => window.lundenViewer?.renderer.info.render.frame > 0 && lundenViewer.scene.getObjectByName('bus-stop-furniture'), null, { timeout: 300000, polling: 1000 });
      const loadMs = Date.now() - t0;
      await page.evaluate(() => { document.getElementById('start')?.click(); document.exitPointerLock?.(); const r = document.getElementById('resume'); if (r) r.hidden = true; });
      const info = await page.evaluate(inspect), V = await page.evaluate(views);
      info.loadMs = loadMs; info.storage = await page.evaluate(() => localStorage.getItem('lunden.sentinel')); info.views = {}; report.phases[phase] = info;
      for (const [name, v] of Object.entries(V)) {
        await page.evaluate(([x, z, yaw, pitch, feet]) => { const a = lundenViewer; a.navigation.teleport(x, feet, z); a.camera.rotation.set(pitch, yaw, 0, 'YXZ'); }, v);
        await page.waitForTimeout(1500);
        const data = await page.evaluate(([x, z, yaw, pitch, feet]) => new Promise((ok) => requestAnimationFrame(() => { const a = lundenViewer; a.navigation.teleport(x, feet, z); a.camera.position.set(x, a.navigation.eyeY, z); a.camera.rotation.set(pitch, yaw, 0, 'YXZ'); a.camera.updateMatrixWorld(true); a.renderer.render(a.scene, a.camera); ok({ image: a.renderer.domElement.toDataURL('image/png'), camera: a.camera.position.toArray().map((v) => +v.toFixed(3)) }); })), v);
        fs.writeFileSync(path.join(out, `${name}-${phase}.png`), Buffer.from(data.image.split(',')[1], 'base64'));
        info.views[name] = { at: v.map((t) => +t.toFixed(3)), camera: data.camera, ...await page.evaluate(() => { const r = lundenViewer.renderer; r.info.autoReset = false; r.info.reset(); r.render(lundenViewer.scene, lundenViewer.camera); const v = { calls: r.info.render.calls, triangles: r.info.render.triangles, textures: r.info.memory.textures, programs: r.info.programs.length }; r.info.autoReset = true; return v; }) };
      }
      await ctx.close();
    }
    fs.writeFileSync(path.join(out, 'browser.json'), JSON.stringify(report, null, 1));
    const a = report.phases.before, b = report.phases.after, key = (r) => JSON.stringify([r.name, r.vertices, r.castShadow, r.receiveShadow, r.min, r.max]);
    assert.equal(a.meshes, b.meshes, 'mesh count'); assert.deepEqual(a.batches.map(key).sort(), b.batches.map(key).sort(), 'bench batches: vertices, shadows, bounds');
    assert(a.batches.every((x) => !x.benchWood) && b.batches.length === 2 && b.batches.every((x) => x.benchWood), 'both batches patched after');
    // Live scene motion: draws ±1 and ~0.01 % triangles also differ between two frames of one phase (#309/#312).
    for (const v of Object.keys(a.views)) { assert.deepEqual(a.views[v].camera, b.views[v].camera, v + ' camera'); assert(Math.abs(a.views[v].calls - b.views[v].calls) <= 1, v + ' draws'); assert(Math.abs(a.views[v].triangles - b.views[v].triangles) <= a.views[v].triangles * 1e-4, v + ' triangles'); assert.equal(a.views[v].textures, b.views[v].textures, v + ' textures'); assert(b.views[v].programs - a.views[v].programs <= 2, v + ' programs'); }
    assert.equal(b.storage, 'kept'); assert.deepEqual(report.errors, []); assert.deepEqual(report.external, []);
    console.log(JSON.stringify({ errors: report.errors, external: report.external.slice(0, 5), load: Object.fromEntries(Object.entries(report.phases).map(([k, p]) => [k, p.loadMs])), batches: b.batches, views: Object.fromEntries(Object.keys(b.views).map((k) => [k, [a.views[k], b.views[k]]])) }));
  } finally { await browser.close(); }
})().catch((e) => { console.error(e); process.exitCode = 1; });
