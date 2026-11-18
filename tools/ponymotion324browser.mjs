// Public #324 (original #2127 09d773af): the paddock ponies before/after their secondary motion in the real public app: a frame
// sequence (July, the wind pinned to 0.75 with its clock held and stepped here, wind from the ponies' right) of a grazing pony and a
// standing one, plus the instanced channels (roll, tail, ear, mane), draws/programs/textures, storage and external requests.
// Before = the pre-change src/paddock.js (BEFORE_PADDOCK) served in place of /src/paddock.js; everything else is this checkout.
//   python3 -m http.server 8344 &   then   BEFORE_PADDOCK=/path/paddock.js node tools/ponymotion324browser.mjs before|after [out] [base]
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
const phase = process.argv[2] ?? 'after', out = process.argv[3] ?? 'docs/verification/324', base = process.argv[4] ?? 'http://127.0.0.1:8344';
await mkdir(out, { recursive: true });
const report = { phase, errors: [], external: [], sockets: [] };
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
try {
  const ctx = await browser.newContext({ viewport: { width: 800, height: 500 }, deviceScaleFactor: 1 });
  if (phase === 'before') await ctx.route(/\/src\/paddock\.js(\?.*)?$/, (r) => r.fulfill({ path: process.env.BEFORE_PADDOCK, contentType: 'text/javascript' }));
  await ctx.addInitScript(() => { if (!localStorage.getItem('probe.unrelated')) localStorage.setItem('probe.unrelated', 'unchanged'); });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => { if (!/Pointer Lock/.test(e.message)) report.errors.push(e.message); });
  page.on('console', (m) => { if (m.type() === 'error' || /THREE\.WebGLProgram|Shader Error|ERROR: 0:/.test(m.text())) report.errors.push(m.text().slice(0, 400)); });
  page.on('request', (r) => { if (new URL(r.url()).origin !== new URL(base).origin) report.external.push(r.url()); });
  page.on('websocket', (s) => report.sockets.push(s.url()));
  await page.goto(`${base}/?month=7&wind=0.75,0&nocats`);
  await page.waitForFunction(() => window.lundenViewer?.paddock && lundenViewer.renderer.info.render.frame > 0, null, { timeout: 300000, polling: 1000 });
  const res = await page.evaluate(async () => {
    const a = lundenViewer, p = a.paddock, sw = await import('/src/sitewind.js'), G = await import('/src/paddockgeo.js');
    a.renderer.setAnimationLoop(null); document.getElementById('start')?.click(); document.exitPointerLock?.();
    document.querySelectorAll('.topbar,.locations,.bottom-bar,#resume,#crosshair').forEach((e) => { e.hidden = true; e.style.setProperty('display', 'none', 'important'); });
    sw.siteWind.dir.set(0.71, -0.71).normalize(); sw.siteWind.time = 0;
    const [g, s] = p.ponies, yaw = Math.PI / 4; // the downwind direction (0.71, -0.71) is the pony's left (+x local): the wind comes from its right
    const fx = Math.sin(yaw), fz = Math.cos(yaw), lx = Math.cos(yaw), lz = -Math.sin(yaw);
    const ok = (x, z) => G.insideFence(x, z, 3.5);
    const cam = (w) => [w[0] - fx * 3.3 + lx * 2.4, w[1] - fz * 3.3 + lz * 2.4], other = (w) => [w[0] + fx * 1.0 - lx * 3.0, w[1] + fz * 1.0 - lz * 3.0];
    const mid = p.waypoints.find((w) => ok(...w) && ok(...cam(w)) && ok(...other(w)) && Math.abs(p.ground(...w) - p.ground(...cam(w))) < 0.4 && Math.abs(p.ground(...w) - p.ground(...other(w))) < 0.4) ?? p.waypoints[0];
    const place = (q, x, z, st) => { q.x = x; q.z = z; q.y = p.ground(x, z); q.yaw = yaw; q.state = st; q.left = 1e9; q.target = q.goal = null; q.spot = null; q.neck = st === 'graze' ? 1.5 : 0.1; if (q.motion) { q.motion.flyT = 0.3; q.motion.driftT = 1e9; } };
    place(g, mid[0], mid[1], 'graze'); place(s, ...other(mid), 'idle');
    const [cx, cz] = cam(mid), gy = p.ground(cx, cz);
    const camAt = () => { a.camera.position.set(cx, gy + 1.45, cz); a.camera.lookAt((g.x + s.x) / 2, p.ground(g.x, g.z) + 0.75, (g.z + s.z) / 2); a.camera.updateMatrixWorld(true); };
    const step = () => { sw.siteWind.time += 1 / 30; p.update(1 / 30); camAt(); };
    camAt(); for (let i = 0; i < 60; i++) step(); // settle into the poses
    const frames = [], track = [], m4 = new (await import('three')).Matrix4(), r3 = (v) => +v.toFixed(4);
    for (let f = 0; f < 8; f++) {
      for (let i = 0; i < 12; i++) step(); // 0.4 s a frame
      a.scene.updateMatrixWorld(true); a.renderer.render(a.scene, a.camera);
      frames.push(a.renderer.domElement.toDataURL('image/png'));
      const roll = [0, 1].map((i) => { p.mesh.getMatrixAt(i, m4); const e = m4.elements; return r3(Math.asin(Math.max(-1, Math.min(1, e[1] / Math.hypot(e[0], e[1], e[2]))))); });
      track.push({ t: +(f * 0.4).toFixed(1), tail: [r3(p.anim.array[3]), r3(p.anim.array[7])], ear: [r3(p.anim2.array[0]), r3(p.anim2.array[4])], mane: [[r3(p.anim2.array[2]), r3(p.anim2.array[3])], [r3(p.anim2.array[6]), r3(p.anim2.array[7])]], roll, neck: r3(g.neck), states: [g.state, s.state], rugShared: p.blankets.instanceMatrix === p.mesh.instanceMatrix });
    }
    let drift = null; // a short graze-step check: the grazing pony steps on, head down, inside the fence (after only)
    if (g.motion) { for (let k = 0; k < 40; k++) p.eatAt(g.x + Math.sin(g.yaw) * 1.3, g.z + Math.cos(g.yaw) * 1.3, 6, 1); g.motion.driftT = 0; const x0 = g.x, z0 = g.z; let stepped = 0; for (let i = 0; i < 150; i++) { p.update(1 / 30); if (g.drift) stepped++; } drift = { moved: +Math.hypot(g.x - x0, g.z - z0).toFixed(3), framesStepping: stepped, neck: +g.neck.toFixed(2), state: g.state, inside: G.insideFence(g.x, g.z, 1.5) }; }
    camAt(); a.renderer.render(a.scene, a.camera);
    const info = a.renderer.info;
    return { frames, track, drift, calls: info.render.calls, triangles: info.render.triangles, programs: info.programs?.length, textures: info.memory.textures, wind: { power: sw.siteWind.power, dir: sw.siteWind.dir.toArray() },
      storage: Object.fromEntries(Object.keys(localStorage).sort().map((k) => [k, k === 'probe.unrelated' ? localStorage.getItem(k) : localStorage.getItem(k).length])) };
  });
  res.frames.forEach((d, i) => report[`frame${i}`] = d);
  for (let i = 0; i < res.frames.length; i++) await writeFile(`${out}/${phase}-${i}.png`, Buffer.from(res.frames[i].split(',')[1], 'base64'));
  delete res.frames; for (const k of Object.keys(report)) if (k.startsWith('frame')) delete report[k];
  Object.assign(report, res);
} finally { await browser.close(); }
await writeFile(`${out}/browser-${phase}.json`, JSON.stringify(report, null, 1));
console.log(JSON.stringify({ ...report, track: report.track?.length }, null, 1));
if (report.errors.length || report.external.length || report.sockets.length) process.exitCode = 1;
