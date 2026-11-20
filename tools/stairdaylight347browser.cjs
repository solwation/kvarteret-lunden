// Public #347 (original #2183, 1da6a3c9): stairwell daylight + surface detail, before/after in the real public app, one view
// per stair core (A/B/C: inside the lobby facing the entrance glass; L: on the flight facing the stair window).
// node tools/stairdaylight347browser.cjs [base] [out]; "before" serves BASELINE's versions of the touched modules (no stairdaylight.js).
// Prints / writes per view: mean luminance (0–255), blown share (all channels ≥ 250), mean saturation, draw calls / triangles /
// textures / programs, and the `dayK` spread. A second pair of loads with `&lowmem` (the phone profile) checks the plain material.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright'), fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict'), { execFileSync } = require('node:child_process');
const [base = 'http://localhost:8680', out = 'docs/verification/347'] = process.argv.slice(2);
const baseline = process.env.BASELINE || '23483c52f061f4bcd01dc99f337827c59a77eee8', touched = ['config.js', 'core.js', 'corehouse.js', 'main.js'];
// [x, z, yaw (deg, 0 = north), pitch (deg), feet y]: the original's #2183 views (same plan metres here).
const VIEWS = JSON.parse(process.env.VIEWS || '{"L":[-17.5,5.2,0,4,0],"A":[1.3,36.6,0,2,0],"B":[-33.9,42.6,0,2,0],"C":[-60.9,24.0,-90,2,0]}');
const W = 960, H = 600;
(async () => {
  fs.mkdirSync(path.join(out, 'before'), { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH, args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const report = { baseline, viewport: [W, H], views: VIEWS, phases: {}, errors: [], external: [] };
  try {
    for (const [phase, query] of [['before', ''], ['after', ''], ['before-lowmem', '&lowmem'], ['after-lowmem', '&lowmem']]) {
      const before = phase.startsWith('before'), low = phase.endsWith('lowmem');
      const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
      await ctx.route('**/*', (r) => {
        const u = r.request().url();
        if (!u.startsWith(base + '/')) { report.external.push(u); return r.abort(); }
        const f = new URL(u).pathname.match(/^\/src\/([a-z0-9]+\.js)$/);
        if (before && f && touched.includes(f[1])) return r.fulfill({ contentType: 'text/javascript', body: execFileSync('git', ['show', `${baseline}:src/${f[1]}`]) });
        return r.continue();
      });
      const page = await ctx.newPage();
      page.on('pageerror', (e) => report.errors.push(phase + ': ' + e.message));
      page.on('console', (m) => { if (m.type() === 'error' || /THREE\.WebGLProgram/.test(m.text())) report.errors.push(phase + ': ' + m.text()); });
      await page.clock.setFixedTime(new Date('2026-06-15T10:00:00Z')); // same wall clock in every load (time-driven scenery)
      const t0 = Date.now();
      await page.goto(base + '/?keepgeo' + query);
      await page.waitForFunction(() => window.lundenViewer?.renderer.info.render.frame > 0, null, { timeout: 300000, polling: 1000 });
      await page.evaluate(() => { document.getElementById('start')?.click(); document.exitPointerLock?.(); const r = document.getElementById('resume'); if (r) r.hidden = true; });
      const info = { loadMs: Date.now() - t0, views: {} };
      info.dayK = await page.evaluate(() => { const o = []; lundenViewer.scene.traverse((m) => { const d = m.isMesh && m.geometry.attributes.dayK; if (!d) return;
        let mn = Infinity, mx = -Infinity, s = 0, nan = 0; for (const x of d.array) { if (Number.isNaN(x)) { nan++; continue; } mn = Math.min(mn, x); mx = Math.max(mx, x); s += x; }
        o.push([+mn.toFixed(2), +(s / d.count).toFixed(2), +mx.toFixed(2), nan, d.count]); }); return o; });
      for (const [name, [x, z, yaw, pitch, feet]] of Object.entries(VIEWS)) {
        await page.evaluate(([x, z, yaw, pitch, feet]) => { const a = lundenViewer; a.navigation.teleport(x, feet, z); a.camera.rotation.set(pitch * Math.PI / 180, yaw * Math.PI / 180, 0, 'YXZ'); }, [x, z, yaw, pitch, feet]);
        await page.waitForTimeout(2500);
        const shot = await page.evaluate(() => new Promise((ok) => requestAnimationFrame(() => {
          const a = lundenViewer, r = a.renderer; r.info.autoReset = false; r.info.reset(); r.render(a.scene, a.camera);
          const cost = { calls: r.info.render.calls, triangles: r.info.render.triangles, textures: r.info.memory.textures, geometries: r.info.memory.geometries, programs: r.info.programs.length };
          r.info.autoReset = true;
          const c = r.domElement, g = document.createElement('canvas'); g.width = c.width; g.height = c.height; const x2 = g.getContext('2d'); x2.drawImage(c, 0, 0);
          const d = x2.getImageData(0, 0, g.width, g.height).data; let sum = 0, blown = 0, sat = 0; const n = d.length / 4;
          for (let i = 0; i < d.length; i += 4) { const R = d[i], G = d[i + 1], B = d[i + 2], mx = Math.max(R, G, B), mn = Math.min(R, G, B); sum += 0.2126 * R + 0.7152 * G + 0.0722 * B; if (mn >= 250) blown++; sat += mx ? (mx - mn) / mx : 0; }
          ok({ cost, stats: { mean: +(sum / n).toFixed(1), blown: +(blown / n).toFixed(4), sat: +(sat / n).toFixed(3) }, jpg: c.toDataURL('image/jpeg', 0.86), pos: a.navigation.pos.toArray().map((v) => +v.toFixed(2)) });
        })));
        if (!low) fs.writeFileSync(path.join(out, before ? 'before' : '', `${name}-${phase === 'before' ? 'before' : 'after'}.jpg`), Buffer.from(shot.jpg.split(',')[1], 'base64'));
        delete shot.jpg; info.views[name] = shot;
        console.log(phase, name, JSON.stringify(shot));
      }
      info.patched = await page.evaluate(() => { let n = 0; lundenViewer.scene.traverse((m) => { for (const x of [].concat(m.material ?? [])) if (x.customProgramCacheKey?.() === 'stairdaylight2') n++; }); return n; });
      report.phases[phase] = info;
      await ctx.close();
    }
    const P = report.phases;
    fs.writeFileSync(path.join(out, 'browser.json'), JSON.stringify(report, null, 1));
    assert.equal(P['after-lowmem'].patched, 0, 'phones: plain material'); assert(P.after.patched >= 4, 'L + A/B/C walls patched');
    assert.equal(P.before.dayK.length, 0); assert(P.after.dayK.length >= 4, 'L + A/B/C cores carry dayK'); assert(P.after.dayK.every((d) => d[3] === 0), 'no NaN');
    assert.equal(P['after-lowmem'].dayK.length, 0, 'phones: no attribute');
    for (const v of Object.keys(VIEWS)) {
      const a = P.before.views[v].cost, b = P.after.views[v].cost;
      assert.equal(b.calls, a.calls, v + ' calls'); assert.equal(b.triangles, a.triangles, v + ' triangles'); assert(b.textures - a.textures <= 1, v + ' textures'); assert(b.programs - a.programs <= 1, v + ' programs');
      for (const k of ['calls', 'triangles', 'textures']) assert.equal(P['after-lowmem'].views[v].cost[k], P['before-lowmem'].views[v].cost[k], v + ' lowmem ' + k);
    }
    assert.deepEqual(report.errors, []); assert.deepEqual(report.external, []);
    console.log('PASS', JSON.stringify({ load: Object.fromEntries(Object.entries(P).map(([k, p]) => [k, p.loadMs])) }));
  } finally { await browser.close(); }
})().catch((e) => { console.error(e); process.exitCode = 1; });
