// Public #325 (original #2128 e5784ceb): the ambient squirrels before/after their life details in the real public app. One squirrel is
// held on the river-park ground beside the camera (its brain frozen, the same pose fields set in both phases) and drawn in matched poses:
// a tail sequence standing still, a hop, eating, scanning, digging and mid-leap; plus a wide frame with draws/programs/textures, storage
// and external requests. October (`?month=10`), wind pinned to 0.75.
// Before = the pre-change src/{squirrels,squirrelbrain,squirrelmodel,config}.js from BEFORE_DIR served in place of this checkout's.
//   python3 -m http.server 8345 &   then   BEFORE_DIR=/path/with/src node tools/squirrel325browser.mjs before|after [out] [base]
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
const phase = process.argv[2] ?? 'after', out = process.argv[3] ?? 'docs/verification/325', base = process.argv[4] ?? 'http://127.0.0.1:8345';
await mkdir(out, { recursive: true });
const report = { phase, errors: [], external: [], sockets: [] };
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
try {
  const ctx = await browser.newContext({ viewport: { width: 800, height: 500 }, deviceScaleFactor: 1 });
  if (phase === 'before') await ctx.route(/\/src\/(squirrels|squirrelbrain|squirrelmodel|config)\.js(\?.*)?$/, (r) => r.fulfill({ path: `${process.env.BEFORE_DIR}/src/${new URL(r.request().url()).pathname.split('/').pop()}`, contentType: 'text/javascript' }));
  await ctx.addInitScript(() => { if (!localStorage.getItem('probe.unrelated')) localStorage.setItem('probe.unrelated', 'unchanged'); });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => { if (!/Pointer Lock/.test(e.message)) report.errors.push(e.message); });
  page.on('console', (m) => { if (m.type() === 'error' || /THREE\.WebGLProgram|Shader Error|ERROR: 0:/.test(m.text())) report.errors.push(m.text().slice(0, 400)); });
  page.on('request', (r) => { if (new URL(r.url()).origin !== new URL(base).origin) report.external.push(r.url()); });
  page.on('websocket', (s) => report.sockets.push(s.url()));
  await page.goto(`${base}/?month=10&wind=0.75,0&nocats`);
  await page.waitForFunction(() => window.lundenViewer?.squirrels && lundenViewer.renderer.info.render.frame > 0, null, { timeout: 300000, polling: 1000 });
  const res = await page.evaluate(async () => {
    const v = lundenViewer, S = v.squirrels, sw = await import('/src/sitewind.js');
    v.renderer.setAnimationLoop(null); document.getElementById('start')?.click(); document.exitPointerLock?.();
    document.querySelectorAll('.topbar,.locations,.bottom-bar,#resume,#crosshair').forEach((e) => { e.hidden = true; e.style.setProperty('display', 'none', 'important'); });
    sw.siteWind.dir.set(1, 0); sw.siteWind.time = 0;
    const a = S.animals[0], b = a.brain; for (const o of S.animals) o.brain.update = () => {};
    S.winter = false; for (const o of S.animals) if (o !== a) o.group.position.y = -1e4;
    const tr = b.tr, ground = S.trees.length ? (x, z) => b.env.ground(x, z) : () => 0;
    const px = tr.x + 1.4, pz = tr.z + 1.4, gy = ground(px, pz), yaw = Math.PI / 2; // facing +x: the camera looks at its left side
    const shot = (st, fields, steps = 20, cam = 1.0, high = 0.2) => {
      Object.assign(b, { state: st, x: px, z: pz, y: gy, yaw, pitch: 0, run: 0, rise: 0, t: 0 }, fields);
      for (let i = 0; i < steps; i++) { S.time += 0; sw.siteWind.time += 1 / 30; v.camera.position.set(px, gy + high + 0.1, pz + cam); S.update(1 / 30); }
      // keep the squirrel's ground point fixed after S.update moved the group (hop / pose)
      v.camera.position.set(px - 0.02, gy + high + 0.1, pz + cam); v.camera.lookAt(px - 0.08, gy + high, pz); v.camera.updateMatrixWorld(true);
      v.scene.updateMatrixWorld(true); v.renderer.render(v.scene, v.camera); return v.renderer.domElement.toDataURL('image/png');
    };
    const fov = v.camera.fov; v.camera.fov = 40; v.camera.updateProjectionMatrix();
    const frames = {}, inf = {};
    const grab = (name) => { inf[name] = { influences: [...a.body.morphTargetInfluences].map((x) => +x.toFixed(3)), rotX: +a.group.rotation.x.toFixed(3) }; };
    for (let k = 0; k < 6; k++) { frames[`tail-${k}`] = shot('search', {}, 9); grab(`tail-${k}`); } // 0.3 s apart (search: the old pause)
    frames.hop = shot('forage', { run: 1 }, 7); grab('hop');
    frames.eat = shot('eat', { rise: 1 }, 20); grab('eat');
    frames.scan = shot('scan', { rise: 1 }, 25); grab('scan');
    frames.dig = shot('dig', { pitch: -0.45 }, 20); grab('dig');
    frames.leap = shot('leap', { run: 1, pitch: 0.2 }, 10); grab('leap');
    v.camera.fov = fov; v.camera.updateProjectionMatrix();
    // a wide frame for the draw/texture/program budget
    v.camera.position.set(px - 6, gy + 1.6, pz + 6); v.camera.lookAt(px, gy + 0.5, pz); v.camera.updateMatrixWorld(true); S.update(1 / 30); v.renderer.render(v.scene, v.camera);
    const info = v.renderer.info, geo = a.body.geometry;
    return { frames, inf, calls: info.render.calls, triangles: info.render.triangles, programs: info.programs?.length, textures: info.memory.textures, geometries: info.memory.geometries,
      morphs: geo.morphAttributes.position.length, vertices: geo.attributes.position.count, visible: a.group.visible,
      storage: Object.fromEntries(Object.keys(localStorage).sort().map((k) => [k, k === 'probe.unrelated' ? localStorage.getItem(k) : localStorage.getItem(k).length])) };
  });
  for (const [k, d] of Object.entries(res.frames)) await writeFile(`${out}/${phase}-${k}.png`, Buffer.from(d.split(',')[1], 'base64'));
  delete res.frames; Object.assign(report, res);
} finally { await browser.close(); }
await writeFile(`${out}/browser-${phase}.json`, JSON.stringify(report, null, 1));
console.log(JSON.stringify({ ...report, inf: Object.keys(report.inf ?? {}) }, null, 1));
if (report.errors.length || report.external.length || report.sockets.length) process.exitCode = 1;
