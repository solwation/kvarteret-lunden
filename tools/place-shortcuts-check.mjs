import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {chromium} from 'playwright';

// Self-contained fixture: no application server or WebGL required.
const source = await readFile(new URL('../src/place-shortcuts.js', import.meta.url), 'utf8');
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH,
  headless: true,
  args: ['--no-sandbox'],
});
const errors = [];
const results = [];
try {
  const page = await browser.newPage();
  page.on('pageerror', error => errors.push(error.message));
  await page.route('http://shortcuts.test/**', route => {
    if (new URL(route.request().url()).pathname === '/place-shortcuts.js') {
      return route.fulfill({contentType: 'text/javascript', body: source});
    }
    return route.fulfill({contentType: 'text/html', body: `<!doctype html>
      <html lang="sv"><meta charset="utf-8"><body tabindex="-1">
      <nav id="menu"></nav><input><textarea></textarea><select><option>Val</option></select>
      <div contenteditable="true"><span id="editable-child" tabindex="0">Text</span></div>
      <dialog><button>Stäng</button></dialog>
      <script type="module">
        import {installPlaceShortcuts} from './place-shortcuts.js';
        window.setup = (count = 7) => {
          window.dispose?.();
          document.querySelector('dialog').close();
          window.ready = window.active = true;
          window.calls = [];
          const names = ['area', 'home', 'courtyard', 'core', 'garage', 'l1004', 'upper', 'extra8', 'extra9', 'extra10'];
          document.getElementById('menu').replaceChildren(...names.slice(0, count).map(name => {
            const button = document.createElement('button');
            button.dataset.place = name;
            button.innerHTML = '<span>' + name + '</span>';
            return button;
          }));
          window.dispose = installPlaceShortcuts({
            buttons: document.querySelectorAll('[data-place]'),
            canNavigate: () => window.ready && window.active,
            moveTo: place => window.calls.push(place),
          });
          document.body.focus();
        };
        window.send = (options = {}, selector = 'body') => {
          const event = new KeyboardEvent('keydown', {
            key: '1', code: 'Digit1', bubbles: true, composed: true, cancelable: true, ...options,
          });
          document.querySelector(selector).dispatchEvent(event);
          return {prevented: event.defaultPrevented, calls: [...window.calls]};
        };
        window.setup();
      </script></body></html>`});
  });
  await page.goto('http://shortcuts.test/fixture.html');
  await page.waitForFunction(() => typeof window.setup === 'function');

  const names = ['area', 'home', 'courtyard', 'core', 'garage', 'l1004', 'upper', 'extra8', 'extra9'];
  for (const count of [5, 6, 7, 9]) {
    await page.evaluate(count => window.setup(count), count);
    assert.deepEqual(await page.locator('[data-place]').evaluateAll(buttons => buttons.map(b => ({
      place: b.dataset.place, text: b.textContent, shortcut: b.getAttribute('aria-keyshortcuts'), title: b.title,
      childPreserved: b.querySelector('span') !== null,
    }))), names.slice(0, count).map((name, i) => ({
      place: name, text: `${i + 1} · ${name}`, shortcut: String(i + 1),
      title: `${name} – tangent ${i + 1} (sifferraden eller numeriska tangentbordet)`, childPreserved: true,
    })));
    for (let i = 1; i <= count; i++) await page.keyboard.press(`Digit${i}`);
    for (let i = 1; i <= count; i++) await page.keyboard.press(`Numpad${i}`);
    assert.deepEqual(await page.evaluate(() => window.calls), [...names.slice(0, count), ...names.slice(0, count)]);
    results.push(`${count} places: menu order, visible numbers, aria-keyshortcuts, titles, Digit and Numpad callbacks`);
  }

  async function ignored(options = {}, selector = 'body') {
    const before = await page.evaluate(() => [...window.calls]);
    assert.deepEqual(await page.evaluate(({options, selector}) => window.send(options, selector), {options, selector}),
      {prevented: false, calls: before}, JSON.stringify({options, selector}));
  }
  await page.evaluate(() => window.setup());
  for (const code of ['Digit0', 'Digit8', 'Digit9', 'Numpad0', 'Numpad8', 'Numpad9', 'KeyA', 'F1']) await ignored({code});
  for (const flag of ['repeat', 'ctrlKey', 'altKey', 'metaKey', 'shiftKey', 'isComposing']) await ignored({[flag]: true});
  await page.keyboard.down('Digit1');
  await page.keyboard.down('Digit1'); // Chromium marks the second keydown as a repeat.
  await page.keyboard.up('Digit1');
  assert.deepEqual(await page.evaluate(() => window.calls), ['area']);
  for (const modifier of ['Control', 'Alt', 'Meta', 'Shift']) await page.keyboard.press(`${modifier}+Digit2`);
  assert.deepEqual(await page.evaluate(() => window.calls), ['area']);
  results.push('unknown keys, modifiers, composition and repeat ignored without preventing defaults');

  for (const selector of ['input', 'textarea', 'select', '[contenteditable]', '#editable-child']) {
    await page.locator(selector).focus();
    await ignored({}, selector);
    await ignored(); // Also guard the focused editable when the event targets the body.
    const before = await page.evaluate(() => [...window.calls]);
    await page.keyboard.press('Digit2');
    assert.deepEqual(await page.evaluate(() => window.calls), before);
  }
  await page.locator('body').focus();
  for (const method of ['show', 'showModal']) {
    await page.evaluate(method => document.querySelector('dialog')[method](), method);
    await ignored();
    const before = await page.evaluate(() => [...window.calls]);
    await page.keyboard.press('Numpad2');
    assert.deepEqual(await page.evaluate(() => window.calls), before);
    await page.evaluate(() => document.querySelector('dialog').close());
  }
  await page.locator('body').focus();
  for (const [ready, active] of [[false, false], [false, true], [true, false]]) {
    await page.evaluate(({ready, active}) => Object.assign(window, {ready, active}), {ready, active});
    await ignored();
  }
  results.push('inputs, textarea, select, inherited contenteditable, modal/nonmodal dialogs and ready/active gates');

  await page.evaluate(() => window.setup());
  assert.deepEqual(await page.evaluate(() => window.send({code: 'Numpad7', key: '7'})), {prevented: true, calls: ['upper']});
  await page.evaluate(() => document.querySelector('[data-place]').disabled = true);
  await ignored();
  await page.evaluate(() => document.querySelector('[data-place]').remove());
  await ignored();
  await page.evaluate(() => window.setup());
  await page.evaluate(() => document.querySelector('[data-place]').addEventListener('keydown', e => e.preventDefault()));
  assert.deepEqual(await page.evaluate(() => window.send({}, '[data-place]')), {prevented: true, calls: []});
  await page.evaluate(() => window.dispose());
  await ignored({code: 'Digit7', key: '7'});
  await page.evaluate(() => window.setup(10));
  assert.equal(await page.locator('[data-place]').nth(9).textContent(), 'extra10');
  assert.equal(await page.locator('[data-place]').nth(9).getAttribute('aria-keyshortcuts'), null);
  await page.evaluate(() => {
    window.dispose();
    document.getElementById('menu').replaceChildren();
    window.setup(0);
  });
  await ignored();
  results.push('valid navigation prevents default; disabled/detached buttons, prehandled events, cleanup, empty menu and nine-key limit');
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({browser: await browser.version(), results, errors}, null, 2));
} finally {
  await browser.close();
}
