// Public #314 (original #2100, c54c3b6): aerial perspective before/after in the real public app: over the park from a height and
// along the street at eye height. node tools/haze314browser.cjs [base] [out] [mode]; mode "probe" shoots the after phase only.
// "before" serves BASELINE's main.js (no aerialhaze.js import, so three's stock fog). Asserts: zero page/shader errors and external
// requests, the same draws/programs/textures/triangles per view (±1 draw for live scene motion) and the same fog near/far/colour.
// VIEWS = {"name":[x, z, yawRad (0 = north), pitchRad, eyeY (m, world)]} *guess* views.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright'), fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict'), { execFileSync } = require('node:child_process');
const [base = 'http://localhost:8314', out = 'docs/verification/314', mode = 'shots'] = process.argv.slice(2);
const baseline = process.env.BASELINE || '6ebab12', touched = ['main.js'];
const VIEWS = JSON.parse(process.env.VIEWS || '{"park-high":[-78,330,0,-0.12,32],"park-high-west":[-78,330,1.2,-0.1,32],"street-west":[0,-26,1.5708,0,1.6],"street-east":[0,-26,-1.5708,0,1.6]}');
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH, args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const report = { baseline: execFileSync('git', ['rev-parse', baseline], { encoding: 'utf8' }).trim(), viewport: [1200, 800], views: VIEWS, phases: {}, errors: [], external: [] };
  try {
    for (const phase of mode === 'probe' ? ['after'] : ['before', 'after']) {
      const ctx = await browser.newContext({ viewport: { width: 1200, height: 800 }, deviceScaleFactor: 1 });
      await ctx.route('**/*', (r) => {
        const u = r.request().url();
        if (!u.startsWith(base + '/')) { report.external.push(u); return r.abort(); }
        const f = new URL(u).pathname.match(/^\/src\/([a-z0-9]+\.js)$/);
        if (phase === 'before' && f && touched.includes(f[1])) return r.fulfill({ contentType: 'text/javascript', body: execFileSync('git', ['show', `${baseline}:src/${f[1]}`]) });
        return r.continue();
      });
      const page = await ctx.newPage();
      page.on('pageerror', (e) => report.errors.push(phase + ': ' + e.message));
      page.on('console', (m) => { if (m.type() === 'error' || /THREE\.WebGLProgram|Shader Error|ERROR: 0:/.test(m.text())) report.errors.push(phase + ': ' + m.text().slice(0, 400)); });
      await page.clock.setFixedTime(new Date('2026-06-15T10:00:00Z'));
      const t0 = Date.now();
      await page.goto(base + '/?keepgeo');
      await page.waitForFunction(() => window.lundenViewer?.renderer.info.render.frame > 0, null, { timeout: 300000, polling: 1000 });
      const loadMs = Date.now() - t0;
      await page.evaluate(() => { document.getElementById('start')?.click(); document.exitPointerLock?.(); const r = document.getElementById('resume'); if (r) r.hidden = true; });
      const info = { loadMs, haze: await page.evaluate(() => { const v = lundenViewer.scene.fog; return { near: v.near, far: v.far, color: v.color.getHexString() }; }), views: {} };
      report.phases[phase] = info;
      for (const [name, [x, z, yaw, pitch, eyeY]] of Object.entries(VIEWS)) {
        const set = ([x, z, yaw, pitch, eyeY]) => { const a = lundenViewer; a.navigation.teleport(x, eyeY - 1.6, z); a.camera.position.set(x, eyeY, z); a.camera.rotation.set(pitch, yaw, 0, 'YXZ'); a.camera.updateMatrixWorld(true); };
        await page.evaluate(set, [x, z, yaw, pitch, eyeY]);
        await page.waitForTimeout(2500);
        const data = await page.evaluate(([x, z, yaw, pitch, eyeY]) => new Promise((ok) => requestAnimationFrame(() => { const a = lundenViewer; a.camera.position.x = x; a.camera.position.z = z; a.camera.position.y = eyeY; a.camera.rotation.set(pitch, yaw, 0, 'YXZ'); a.camera.updateMatrixWorld(true);
          const r = a.renderer; r.info.autoReset = false; r.info.reset(); r.render(a.scene, a.camera);
          const v = { calls: r.info.render.calls, triangles: r.info.render.triangles, textures: r.info.memory.textures, programs: r.info.programs.length, camera: a.camera.position.toArray().map((q) => +q.toFixed(2)) };
          r.info.autoReset = true; ok({ image: r.domElement.toDataURL('image/png'), ...v }); })), [x, z, yaw, pitch, eyeY]);
        fs.writeFileSync(path.join(out, `${name}-${phase}.png`), Buffer.from(data.image.split(',')[1], 'base64')); delete data.image;
        info.views[name] = data;
      }
      await ctx.close();
    }
    if (mode !== 'probe') {
      fs.writeFileSync(path.join(out, 'browser.json'), JSON.stringify(report, null, 1));
      const a = report.phases.before, b = report.phases.after;
      assert.deepEqual(a.haze, b.haze, 'fog near/far/colour');
      for (const v of Object.keys(a.views)) { assert(Math.abs(a.views[v].calls - b.views[v].calls) <= 1, v + ' draws'); assert(Math.abs(a.views[v].triangles - b.views[v].triangles) <= a.views[v].triangles * 1e-4, v + ' triangles'); assert.equal(a.views[v].textures, b.views[v].textures, v + ' textures'); assert.equal(a.views[v].programs, b.views[v].programs, v + ' programs'); assert.deepEqual(a.views[v].camera, b.views[v].camera, v + ' camera'); }
      assert.deepEqual(report.errors, []); assert.deepEqual(report.external, []);
    }
    console.log(JSON.stringify({ errors: report.errors, external: report.external.slice(0, 5), phases: report.phases }, null, 1));
  } finally { await browser.close(); }
})().catch((e) => { console.error(e); process.exitCode = 1; });
