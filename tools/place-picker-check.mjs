import assert from 'node:assert/strict';
import {mkdir, writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';

// Run against the built, served app; no mocked world, navigation or picker handlers.
// CHROME_PATH=/path/to/chrome node tools/place-picker-check.mjs http://localhost:8170 /tmp/kvarteret-picker-8-button
const base = (process.argv[2] ?? 'http://localhost:8170').replace(/\/$/, '') + '/';
const out = process.argv[3] ?? '/tmp/kvarteret-picker-8-button';
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
  assert.equal(await page.locator('select').count(), 0, 'no native select');
  const toggle = page.locator('nav.locations button#place-toggle');
  assert.equal(await toggle.getAttribute('aria-controls'), 'place-menu');
  assert.equal(await toggle.isEnabled(), true);
  assert.equal(await page.locator('nav.locations div#place-menu.place-buttons').count(), 1);
  assert.equal(await page.locator('#place-menu [data-place]').count(), 7);
  assert.equal(await page.locator('[role="menu"], [role="menuitem"]').count(), 0, 'ordinary disclosure buttons');
  assert.deepEqual(await page.locator('[data-place]').evaluateAll(bs => bs.map(b => b.textContent.trim()[0])),
    ['1', '2', '3', '4', '5', '6', '7']);
  await disclosure(page, false, 'startup');
  return {context, page, toggle};
}

async function state(page) {
  return page.evaluate(() => {
    const v = window.lundenViewer;
    return {position: v.navigation.pos.toArray(), current: document.getElementById('place-current').textContent.trim(),
      selected: [...document.querySelectorAll('[data-place].selected')].map(b => b.dataset.place),
      text: document.getElementById('place').textContent};
  });
}

async function destination(page, id, label) {
  const actual = await state(page);
  const expected = await page.evaluate(id => {
    const p = window.lundenViewer.locations[id];
    const label = document.querySelector(`[data-place="${id}"]`).textContent.trim().replace(/^[1-7]\s*·\s*/, '');
    return {position: [p.x, p.y, p.z], name: p.name, label};
  }, id);
  assert.deepEqual(actual.position, expected.position, `${label}: actual navigation.pos for ${id}`);
  assert.equal(actual.current, expected.label, `${label}: clean current-place name`);
  await disclosure(page, false, label);
  assert.deepEqual(actual.selected, [id], `${label}: exactly one selected button`);
  assert.equal(actual.text, expected.name, `${label}: existing current-place text`);
  report.checks.push({label, id, ...actual});
}

async function disclosure(page, open, label) {
  assert.equal(await page.locator('#place-toggle').getAttribute('aria-expanded'), String(open), `${label}: expanded`);
  assert.equal(await page.locator('nav.locations').evaluate(nav => nav.classList.contains('open')), open, `${label}: open class`);
  if (await page.locator('#place-toggle').isVisible())
    assert.equal(await page.locator('#place-menu').isVisible(), open, `${label}: menu visibility`);
}

async function openMenu(page, touch = false) {
  await page.locator('#place-toggle')[touch ? 'tap' : 'click']();
  await disclosure(page, true, 'open disclosure');
}

async function layout(page, width, height, label) {
  await page.setViewportSize({width, height});
  const narrow = width <= 960;
  await page.waitForFunction(narrow => {
    const toggle = document.getElementById('place-toggle');
    return (getComputedStyle(toggle).display !== 'none') === narrow &&
      toggle.getAttribute('aria-expanded') === 'false';
  }, narrow);
  await disclosure(page, false, label);
  assert.equal(await page.locator('#place-toggle').isVisible(), narrow, `${label}: toggle visibility`);
  for (const button of await page.locator('[data-place]').all())
    assert.equal(await button.isVisible(), !narrow, `${label}: button visibility`);
  const bounds = await page.locator('nav.locations').evaluate(nav => {
    const r = nav.getBoundingClientRect(), s = nav.querySelector('#place-toggle').getBoundingClientRect();
    return {left: r.left, right: r.right, width: r.width, client: nav.clientWidth, scroll: nav.scrollWidth,
      toggleWidth: s.width, toggleHeight: s.height,
      documentWidth: document.documentElement.scrollWidth, viewport: innerWidth};
  });
  assert(bounds.left >= 0 && bounds.right <= width + 1, `${label}: container inside viewport`);
  assert(bounds.scroll <= bounds.client + 1, `${label}: no horizontal navigation scroll`);
  assert(bounds.documentWidth <= width, `${label}: no document overflow`);
  if (narrow) {
    assert(bounds.toggleHeight >= 44, `${label}: 44px touch target`);
    assert(bounds.toggleWidth > 0 && bounds.toggleWidth <= 240, `${label}: compact toggle max 240px`);
    assert(bounds.width <= 240 && bounds.width < width - 32, `${label}: navigation is not full width`);
    const current = await page.locator('#place-current').textContent();
    if (current.trim() === 'Området')
      assert(bounds.toggleWidth >= 90 && bounds.toggleWidth <= 140, `${label}: Området about 110px`);
  } else {
    const rows = await page.locator('[data-place]').evaluateAll(bs => bs.map(b => b.getBoundingClientRect().top));
    assert(Math.max(...rows) - Math.min(...rows) <= 1, `${label}: desktop buttons in one row`);
  }
  report.checks.push({label, bounds});
}

async function popup(page, label) {
  const bounds = await page.locator('#place-menu').evaluate(menu => {
    const r = menu.getBoundingClientRect(), buttons = [...menu.querySelectorAll('[data-place]')];
    return {left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width,
      height: r.height, scrollHeight: menu.scrollHeight, clientHeight: menu.clientHeight,
      overflowY: getComputedStyle(menu).overflowY, viewportWidth: innerWidth, viewportHeight: innerHeight,
      buttons: buttons.map(b => {const r = b.getBoundingClientRect(); return {left: r.left, top: r.top, height: r.height};})};
  });
  assert(bounds.width >= 220 && bounds.width <= bounds.viewportWidth - 32 + 1, `${label}: popup width`);
  assert(bounds.left >= 0 && bounds.right <= bounds.viewportWidth, `${label}: horizontal containment`);
  assert(bounds.top >= 0 && bounds.bottom <= bounds.viewportHeight + 1, `${label}: vertical containment`);
  assert(bounds.buttons.every(b => b.height >= 44), `${label}: 44px menu buttons`);
  assert(bounds.buttons.every((b, i, bs) => !i || b.top >= bs[i - 1].top + bs[i - 1].height - 1), `${label}: vertical buttons`);
  if (bounds.scrollHeight > bounds.clientHeight + 1)
    assert(['auto', 'scroll'].includes(bounds.overflowY), `${label}: overflowing landscape menu scrolls`);
  report.checks.push({label, popup: bounds});
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
  const build = await fetch(new URL('version.json', base));
  assert(build.ok, 'served build version available before startup');
  report.version = (await build.json()).version;
  assert.match(report.version, /^[a-f0-9]{24}$/);
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
      await openMenu(m, true);
      await popup(m, `${width} ${id}`);
      if (id === 'area') await screenshot(m, `touch-${width}-open`);
      await m.locator(`#place-menu [data-place="${id}"]`).tap();
      await destination(m, id, `${width} actual touch tap`);
    }
    await screenshot(m, `touch-${width}-after`);
  }
  await layout(m, 844, 390, 'landscape touch');
  await openMenu(m, true);
  await popup(m, 'landscape scroll');
  await screenshot(m, 'touch-landscape-open');
  await m.locator('#place-menu [data-place="garage"]').tap();
  await destination(m, 'garage', 'landscape last item');
  const saved = await m.evaluate(() => {
    const v = window.lundenViewer;
    return {position: v.navigation.pos.toArray(), yaw: v.camera.rotation.y, pitch: v.camera.rotation.x,
      place: document.querySelector('[data-place].selected').dataset.place, active: true};
  });
  const versionResponse = await mobile.context.request.get(new URL('version.json', base).href);
  assert(versionResponse.ok(), 'served build version available');
  const {version} = await versionResponse.json();
  assert.match(version, /^[a-f0-9]{24}$/);
  assert.equal(version, report.version, 'build unchanged between mobile and resume startup');
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

  // Tab follows ordinary button order; Enter and Space activate the disclosure.
  await d.locator('#help').focus();
  for (let i = 0; i < 16 && !(await desktop.toggle.evaluate(s => s === document.activeElement)); i++)
    await d.keyboard.press('Tab');
  assert(await desktop.toggle.evaluate(s => s === document.activeElement), 'toggle reachable by Tab');
  await d.keyboard.press('Enter');
  await disclosure(d, true, 'keyboard Enter opens');
  await d.keyboard.press('Tab');
  assert.equal(await d.evaluate(() => document.activeElement.dataset.place), 'area', 'Tab enters first button');
  await d.keyboard.press('Enter');
  await destination(d, 'area', 'keyboard Tab Enter chooses');
  await desktop.toggle.focus();
  await d.keyboard.press('Space');
  await disclosure(d, true, 'keyboard Space opens');
  await d.keyboard.press('Tab');
  await d.keyboard.press('Tab');
  assert.equal(await d.evaluate(() => document.activeElement.dataset.place), 'home', 'Tab reaches next button');
  await d.keyboard.press('Space');
  await destination(d, 'home', 'keyboard Space chooses');
  await desktop.toggle.focus();
  for (const [key, id] of [['ArrowUp', 'garage'], ['Home', 'area'], ['End', 'garage'], ['ArrowDown', 'area']]) {
    await d.keyboard.press(key);
    await disclosure(d, true, `${key} opens or keeps menu`);
    assert.equal(await d.evaluate(() => document.activeElement.dataset.place), id, `${key}: button focus`);
  }
  await d.locator('#help').focus();
  await disclosure(d, false, 'focus outside navigation closes');
  await openMenu(d);
  await d.locator('[data-place="core"]').focus();
  const beforeEscape = await state(d);
  await d.keyboard.press('Escape');
  await disclosure(d, false, 'Escape closes');
  assert(await desktop.toggle.evaluate(s => s === document.activeElement), 'Escape focuses toggle');
  assert.deepEqual(await state(d), beforeEscape, 'Escape preserves destination');
  await openMenu(d);
  const beforeOutside = await state(d);
  await d.mouse.move(640, 700);
  await d.mouse.down();
  await disclosure(d, false, 'outside pointerdown closes');
  await d.mouse.up();
  assert.deepEqual(await state(d), beforeOutside, 'outside preserves destination');
  await openMenu(d);
  await desktop.toggle.click();
  await disclosure(d, false, 'toggle closes');
  await openMenu(d);
  const beforeResize = await state(d);
  await layout(d, 960, 700, 'open popup resize to 960');
  assert.deepEqual(await state(d), beforeResize, 'resize preserves destination');
  await openMenu(d);
  await layout(d, 961, 700, 'open popup resize to desktop');
  assert.deepEqual(await state(d), beforeResize, 'desktop resize preserves destination');
  await layout(d, 650, 800, 'return to disclosure for shortcuts');
  await screenshot(d, 'desktop-650-keyboard-after');

  for (const prefix of ['Digit', 'Numpad']) {
    for (const [index, id] of ids.entries()) {
      await openMenu(d);
      await d.keyboard.press(`${prefix}${index + 1}`);
      await destination(d, id, `${prefix} closes open menu`);
    }
  }
  await layout(d, 1280, 800, 'resize back to desktop');
  await destination(d, 'garage', 'resize back preserves selection');
  await screenshot(d, 'desktop-resized-after');
  await desktop.context.close();
  assert.deepEqual(report.errors, [], 'no app exceptions');
  assert.deepEqual(report.external, [], 'no external requests');
  assert.equal((await (await fetch(new URL('version.json', base))).json()).version, report.version, 'build unchanged throughout check');
  report.pass = true;
  console.log(`PASS: button disclosure, seven actual destinations, touch 390/320/landscape, 650/960/961/1280, Tab/Enter/Space/Escape/outside, resize, Digit/Numpad and takeResume; ${out}`);
} catch (error) {
  report.pass = false;
  report.failure = error.stack;
  throw error;
} finally {
  await writeFile(`${out}/results.json`, JSON.stringify(report, null, 2) + '\n');
  await browser.close();
}
