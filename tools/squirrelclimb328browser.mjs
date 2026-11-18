// Public #328 (original #2132 8a89f610): the ambient squirrels climbing before/after in the real public app. One squirrel (the others
// frozen and moved away) on its own river-park start tree is driven through the brain's own climb: from the trunk's foot up (`climb`
// frames at 25 / 50 / 75 % of the climb), sitting in the crown (`crown`), then down again (`down` at 25 / 50 / 75 %). The camera stands
// 3.2 m from the trunk on the squirrel's side, level with it (in the crown: 2.5 m to the squirrel's side). Plus a wide frame with draws/programs/textures, storage and external
// requests. July (`?month=7`), wind pinned to 0.75, no cats.
// Before = the pre-change src/{squirrels,squirrelbrain,squirrelhabitat,config,main}.js from BEFORE_DIR served in place of this checkout's.
//   python3 -m http.server 8348 &   then   BEFORE_DIR=/path/with/src node tools/squirrelclimb328browser.mjs before|after [out] [base]
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
const phase = process.argv[2] ?? 'after', out = process.argv[3] ?? 'docs/verification/328', base = process.argv[4] ?? 'http://127.0.0.1:8348';
await mkdir(out, { recursive: true });
const report = { phase, errors: [], external: [], sockets: [] };
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
try {
  const ctx = await browser.newContext({ viewport: { width: 800, height: 500 }, deviceScaleFactor: 1 });
  if (phase === 'before') await ctx.route(/\/src\/(squirrels|squirrelbrain|squirrelhabitat|config|main)\.js(\?.*)?$/, (r) => r.fulfill({ path: `${process.env.BEFORE_DIR}/src/${new URL(r.request().url()).pathname.split('/').pop()}`, contentType: 'text/javascript' }));
  await ctx.addInitScript(() => { if (!localStorage.getItem('probe.unrelated')) localStorage.setItem('probe.unrelated', 'unchanged'); });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => { if (!/Pointer Lock/.test(e.message)) report.errors.push(e.message); });
  page.on('console', (m) => { if (m.type() === 'error' || /THREE\.WebGLProgram|Shader Error|ERROR: 0:/.test(m.text())) report.errors.push(m.text().slice(0, 400)); });
  page.on('request', (r) => { if (new URL(r.url()).origin !== new URL(base).origin) report.external.push(r.url()); });
  page.on('websocket', (s) => report.sockets.push(s.url()));
  await page.goto(`${base}/?month=7&wind=0.75,0&nocats`);
  await page.waitForFunction(() => window.lundenViewer?.squirrels && lundenViewer.renderer.info.render.frame > 0, null, { timeout: 300000, polling: 1000 });
  const res = await page.evaluate(async () => {
    const v = lundenViewer, S = v.squirrels, B = await import('/src/squirrelbrain.js');
    v.renderer.setAnimationLoop(null); document.getElementById('start')?.click(); document.exitPointerLock?.();
    document.querySelectorAll('.topbar,.locations,.bottom-bar,#resume,#crosshair').forEach((e) => { e.hidden = true; e.style.setProperty('display', 'none', 'important'); });
    S.winter = false;
    const a = S.animals[0], b = a.brain;
    for (const o of S.animals) if (o !== a) { o.brain.update = () => {}; o.brain.x = o.brain.z = 1e5; }
    const tr = b.tr, ground = (x, z) => b.env.ground(x, z), side = Math.atan2(v.camera.position.z - tr.z, v.camera.position.x - tr.x);
    const fov = v.camera.fov; v.camera.fov = 45; v.camera.updateProjectionMatrix();
    const look = () => { // 3.2 m from the trunk on the squirrel's side, level with it; in the crown 2.5 m to its side, a little below
      if (b.state === 'perch') { const px = b.x + Math.cos(b.yaw) * 2.5, pz = b.z - Math.sin(b.yaw) * 2.5; v.camera.position.set(px, b.y - 0.4, pz); v.camera.lookAt(b.x, b.y, b.z); v.camera.updateMatrixWorld(true); return; }
      const ang = Math.atan2(b.z - tr.z, b.x - tr.x), cx = tr.x + Math.cos(ang) * 3.2, cz = tr.z + Math.sin(ang) * 3.2;
      v.camera.position.set(cx, Math.max(ground(cx, cz) + 1, b.y + 0.3), cz); v.camera.lookAt(b.x, b.y, b.z); v.camera.updateMatrixWorld(true);
    };
    const frames = {}, poses = {};
    const snap = (name) => { look(); v.scene.updateMatrixWorld(true); v.renderer.render(v.scene, v.camera); frames[name] = v.renderer.domElement.toDataURL('image/png');
      poses[name] = { state: b.state, y: +(b.y - tr.y).toFixed(2), pitch: +b.pitch.toFixed(2), yaw: +b.yaw.toFixed(2), limb: b.limb ?? null }; };
    const step = (n) => { for (let i = 0; i < n; i++) { look(); S.update(1 / 30); } };
    const run = (st, name) => { // to 25 / 50 / 75 % of the state's duration, a frame at each
      const dur = b.dur; let k = 0;
      for (const f of [0.25, 0.5, 0.75]) { while (b.state === st && b.t < f * dur) step(1); snap(`${name}-${k++}`); }
      while (b.state === st) step(1);
    };
    // to the foot on the camera's side, then up the trunk (the brain's own climb in both phases)
    Object.assign(b, { tree: b.tree, ang: side, pitch: 0, rise: 0, run: 0, limb: -1, path: null });
    b.place(B.footPoint(tr, side, ground, {})); b.climb(true); const upDur = +b.dur.toFixed(2);
    run('up', 'climb');
    step(15); b.dur = 99; snap('crown'); // sitting in the crown (held there for the frame)
    b.climb(false); const downDur = +b.dur.toFixed(2);
    run('down', 'down');
    v.camera.fov = fov; v.camera.updateProjectionMatrix();
    // a wide frame for the draw/texture/program budget
    v.camera.position.set(tr.x + 9, tr.y + 2, tr.z + 9); v.camera.lookAt(tr.x, tr.y + 3, tr.z); v.camera.updateMatrixWorld(true); S.update(1 / 30); v.renderer.render(v.scene, v.camera);
    const info = v.renderer.info;
    return { frames, poses, upDur, downDur, framed: S.trees.filter((t) => t.cf).length, trees: S.trees.length, links: S.trees.reduce((n, t) => n + t.near.length, 0) / 2,
      calls: info.render.calls, triangles: info.render.triangles, programs: info.programs?.length, textures: info.memory.textures, geometries: info.memory.geometries,
      storage: Object.fromEntries(Object.keys(localStorage).sort().map((k) => [k, k === 'probe.unrelated' ? localStorage.getItem(k) : localStorage.getItem(k).length])) };
  });
  for (const [k, d] of Object.entries(res.frames)) await writeFile(`${out}/${phase}-${k}.png`, Buffer.from(d.split(',')[1], 'base64'));
  delete res.frames; Object.assign(report, res);
} finally { await browser.close(); }
await writeFile(`${out}/browser-${phase}.json`, JSON.stringify(report, null, 1));
console.log(JSON.stringify(report, null, 1));
if (report.errors.length || report.external.length || report.sockets.length) process.exitCode = 1;
