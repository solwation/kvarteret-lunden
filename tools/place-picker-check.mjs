import assert from 'node:assert/strict';
import {mkdir, writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';

// Run against the built, served app; no mocked world, navigation or picker handlers.
// CHROME_PATH=/path/to/chrome node tools/place-picker-check.mjs http://localhost:8170 /tmp/kvarteret-picker-8
const base = (process.argv[2] ?? 'http://localhost:8170').replace(/\/$/, '') + '/';
const out = process.argv[3] ?? '/tmp/kvarteret-picker-8';
const ids = ['area', 'home', 'l1004', 'l1202', 'courtyard', 'core', 'garage'];
// A fresh isolated browser context seeds only this app's own one-use resume key.
const resumeKey = 'kvarteret-lunden.update-resume';
const report = {base, checks: [], errors: [], external: []};
await mkdir(out, {recursive: true});
const browser = await chromium.launch({executablePath: process.env.CHROME_PATH, headless: true,
  args: ['--no-sandbox', '--enable-unsafe-swiftshader']});

async function openApp(options, resume) {
  const context = await browser.newContext(options);
  // Stop immediately after the first real frame, without skipping startup RAFs.
  await context.addInitScript(({resume, resumeKey}) => {
    if (resume) sessionStorage.setItem(resumeKey, JSON.stringify({...resume, at: Date.now()}));
    const raf = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = callback => raf(time => {
      callback(time);
      const viewer = window.lundenViewer;
      if (viewer?.renderer.info.render.frame > 0) {
        viewer.renderer.setAnimationLoop(null);
        window.pickerCheckStopped = true;
      }
    });
  }, {resume, resumeKey});
  const page = await context.newPage();
  page.on('pageerror', error => report.errors.push(error.message));
  page.on('request', request => {
    if (/^https?:/.test(request.url()) && new URL(request.url()).origin !== new URL(base).origin)
      report.external.push(request.url());
  });
  await page.goto(base);
  await page.waitForFunction(() => window.pickerCheckStopped === true, null, {timeout: 120000});
  assert.deepEqual(await page.locator('[data-place]').evaluateAll(bs => bs.map(b => b.dataset.place)), ids);
  const select = page.locator('select#place-select');
  assert.equal(await select.getAttribute('aria-label'), 'Välj område');
  assert.equal(await select.isEnabled(), true);
  assert.deepEqual(await select.locator('option').evaluateAll(os => os.map(o => o.value)), ids);
  const labels = await select.locator('option').allTextContents();
  assert(labels.every(label => label.trim() && !/^\s*[1-7]\s*[·.]/.test(label)), 'clean option names');
  assert.deepEqual(await page.locator('[data-place]').evaluateAll(bs => bs.map(b => b.textContent.trim()[0])),
    ['1', '2', '3', '4', '5', '6', '7']);
  return {context, page, select};
}

async function state(page) {
  return page.evaluate(() => {
    const v = window.lundenViewer;
    return {position: v.navigation.pos.toArray(), value: document.getElementById('place-select').value,
      selected: [...document.querySelectorAll('[data-place].selected')].map(b => b.dataset.place),
      text: document.getElementById('place').textContent};
  });
}

async function destination(page, id, label) {
  const actual = await state(page);
  const expected = await page.evaluate(id => {
    const p = window.lundenViewer.locations[id];
    return {position: [p.x, p.y, p.z], name: p.name};
  }, id);
  assert.deepEqual(actual.position, expected.position, `${label}: actual navigation.pos for ${id}`);
  assert.equal(actual.value, id, `${label}: select sync`);
  assert.deepEqual(actual.selected, [id], `${label}: exactly one selected button`);
  assert.equal(actual.text, expected.name, `${label}: existing current-place text`);
  report.checks.push({label, id, ...actual});
}

async function layout(page, width, height, label) {
  await page.setViewportSize({width, height});
  const narrow = width <= 960;
  assert.equal(await page.locator('#place-select').isVisible(), narrow, `${label}: select visibility`);
  for (const button of await page.locator('[data-place]').all())
    assert.equal(await button.isVisible(), !narrow, `${label}: button visibility`);
  const bounds = await page.locator('.locations').evaluate(nav => {
    const r = nav.getBoundingClientRect(), select = nav.querySelector('select');
    const s = select.getBoundingClientRect();
    return {left: r.left, right: r.right, width: r.width, client: nav.clientWidth, scroll: nav.scrollWidth,
      selectLeft: s.left, selectRight: s.right, selectHeight: s.height,
      documentWidth: document.documentElement.scrollWidth, viewport: innerWidth};
  });
  assert(bounds.left >= 0 && bounds.right <= width + 1, `${label}: container inside viewport`);
  assert(bounds.scroll <= bounds.client + 1, `${label}: no horizontal navigation scroll`);
  assert(bounds.documentWidth <= width, `${label}: no document overflow`);
  if (narrow) {
    assert(bounds.selectHeight >= 44, `${label}: 44px touch target`);
    assert(bounds.selectLeft >= 0 && bounds.selectRight <= width, `${label}: select inside viewport`);
  }
  report.checks.push({label, bounds});
}

async function screenshot(page, name) {
  await page.evaluate(() => {
    const v = window.lundenViewer;
    // Match the normal frame visibility updates after teleporting with the loop paused.
    v.world.core.update(0, v.navigation, v.camera);
    v.world.garage.update(0, v.navigation, v.camera);
    v.scene.updateMatrixWorld();
    v.renderer.render(v.scene, v.camera);
  });
  await page.screenshot({path: `${out}/${name}.png`});
}

try {
  const mobile = await openApp({viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true});
  const m = mobile.page;
  assert(await m.evaluate(() => navigator.maxTouchPoints > 0 && matchMedia('(pointer: coarse)').matches));
  await destination(m, 'area', 'initial touch');
  await m.locator('#start').tap();
  await layout(m, 390, 844, '390x844 touch');
  await screenshot(m, 'touch-390-before');
  for (const [width, height] of [[390, 844], [320, 700]]) {
    await layout(m, width, height, `${width} touch`);
    for (const id of ids) {
      await mobile.select.selectOption(id);
      await destination(m, id, `${width} native select`);
    }
    await screenshot(m, `touch-${width}-after`);
  }
  const saved = await m.evaluate(() => {
    const v = window.lundenViewer;
    return {position: v.navigation.pos.toArray(), yaw: v.camera.rotation.y, pitch: v.camera.rotation.x,
      place: document.getElementById('place-select').value, active: true};
  });
  const versionResponse = await mobile.context.request.get(new URL('version.json', base).href);
  assert(versionResponse.ok(), 'served build version available');
  const {version} = await versionResponse.json();
  assert.match(version, /^[a-f0-9]{24}$/);
  report.version = version;
  await mobile.context.close();

  // Second and final world startup also proves the real update-resume init path.
  const desktop = await openApp({viewport: {width: 1280, height: 800}, isMobile: false, hasTouch: false},
    {...saved, version});
  const d = desktop.page;
  await destination(d, 'garage', 'takeResume startup');
  assert.deepEqual(await d.evaluate(key => ({key: sessionStorage.getItem(key), intro: document.getElementById('intro').hidden,
    yaw: window.lundenViewer.camera.rotation.y, pitch: window.lundenViewer.camera.rotation.x}), resumeKey),
  {key: null, intro: true, yaw: saved.yaw, pitch: saved.pitch}, 'resume consumed once, pose and active state restored');
  await layout(d, 1280, 800, '1280 desktop');
  await screenshot(d, 'desktop-1280-before');
  for (const id of ids) {
    await d.locator(`[data-place="${id}"]`).click();
    await destination(d, id, 'desktop menu');
  }
  await screenshot(d, 'desktop-1280-after');
  for (const width of [961, 960, 650]) {
    const before = await state(d);
    await layout(d, width, 800, `${width} desktop`);
    assert.deepEqual(await state(d), before, `${width}: resize preserves value, selection and position`);
    await screenshot(d, `desktop-${width}`);
  }

  // Reach the native control by Tab, then use real browser selection keys.
  await d.locator('#help').focus();
  for (let i = 0; i < 12 && !(await desktop.select.evaluate(s => s === document.activeElement)); i++)
    await d.keyboard.press('Tab');
  assert(await desktop.select.evaluate(s => s === document.activeElement), 'native select reachable by Tab');
  const focused = await state(d);
  const ignored = await desktop.select.evaluate(s => s.dispatchEvent(new KeyboardEvent('keydown',
    {key: '1', code: 'Digit1', bubbles: true, cancelable: true})));
  assert(ignored, 'editable select does not consume global shortcut');
  assert.deepEqual(await state(d), focused, 'focused select ignores global place shortcut');
  await d.keyboard.press('Home');
  await d.keyboard.press('Enter');
  await destination(d, 'area', 'native keyboard Home');
  await d.keyboard.press('ArrowDown');
  await d.keyboard.press('Enter');
  await destination(d, 'home', 'native keyboard ArrowDown');
  await screenshot(d, 'desktop-650-keyboard-after');

  await desktop.select.blur();
  for (const prefix of ['Digit', 'Numpad']) {
    for (const [index, id] of ids.entries()) {
      await d.keyboard.press(`${prefix}${index + 1}`);
      await destination(d, id, `${prefix} after blur`);
    }
  }
  await layout(d, 1280, 800, 'resize back to desktop');
  await destination(d, 'garage', 'resize back preserves selection');
  await screenshot(d, 'desktop-resized-after');
  await desktop.context.close();
  assert.deepEqual(report.errors, [], 'no app exceptions');
  assert.deepEqual(report.external, [], 'no external requests');
  report.pass = true;
  console.log(`PASS: native picker, seven actual destinations, touch 390/320, 650/960/961/1280, keyboard, resize and takeResume; ${out}`);
} catch (error) {
  report.pass = false;
  report.failure = error.stack;
  throw error;
} finally {
  await writeFile(`${out}/results.json`, JSON.stringify(report, null, 2) + '\n');
  await browser.close();
}
