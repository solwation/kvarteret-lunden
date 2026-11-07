import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {chromium} from 'playwright';

// Self-contained fixture for #261: no application server or WebGL required.
const source = await readFile(new URL('../src/place-cycle.js', import.meta.url), 'utf8');
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
  await page.route('http://cycle.test/**', route => {
    if (new URL(route.request().url()).pathname === '/place-cycle.js') {
      return route.fulfill({contentType: 'text/javascript', body: source});
    }
    return route.fulfill({contentType: 'text/html', body: `<!doctype html>
      <html lang="sv"><meta charset="utf-8"><body tabindex="-1">
      <nav id="menu"></nav><input><textarea></textarea><select><option>Val</option></select>
      <div contenteditable="true"><span id="editable-child" tabindex="0">Text</span></div>
      <dialog><button>Stäng</button></dialog>
      <script type="module">
        import {installPlaceCycle} from './place-cycle.js';
        window.setup = (count = 12, selected = 'area') => {
          window.dispose?.();
          document.querySelector('dialog').close();
          window.ready = window.active = window.looking = true;
          window.calls = [];
          const names = ['area', 'home', 'l1004', 'l1201', 'courtyard', 'core', 'garage', 'paddock', 'park42', 'clocktower', 'nordic', 'carbridge'];
          document.getElementById('menu').replaceChildren(...names.slice(0, count).map(name => {
            const button = document.createElement('button');
            button.dataset.place = name;
            button.innerHTML = '<span>' + name + '</span>';
            button.classList.toggle('selected', name === selected);
            return button;
          }));
          window.dispose = installPlaceCycle({
            buttons: document.querySelectorAll('[data-place]'),
            canNavigate: () => window.ready && window.active,
            isLooking: () => window.looking,
            // Like the app's moveTo: record the call and move the selection.
            moveTo: place => {
              window.calls.push(place);
              document.querySelectorAll('[data-place]').forEach(b => b.classList.toggle('selected', b.dataset.place === place));
            },
          });
          document.body.focus();
        };
        window.send = (options = {}, selector = 'body') => {
          const event = new KeyboardEvent('keydown', {
            key: 'Tab', code: 'Tab', bubbles: true, composed: true, cancelable: true, ...options,
          });
          document.querySelector(selector).dispatchEvent(event);
          return {prevented: event.defaultPrevented, calls: [...window.calls]};
        };
        window.setup();
      </script></body></html>`});
  });
  await page.goto('http://cycle.test/fixture.html');
  await page.waitForFunction(() => typeof window.setup === 'function');

  const names = ['area', 'home', 'l1004', 'l1201', 'courtyard', 'core', 'garage', 'paddock', 'park42', 'clocktower', 'nordic', 'carbridge'];
  const selected = () => page.evaluate(() => document.querySelector('[data-place].selected')?.dataset.place ?? null);

  // No digit prefixes, no digit shortcuts; labels and child markup stay intact.
  assert.deepEqual(await page.locator('[data-place]').evaluateAll(buttons => buttons.map(b => ({
    text: b.textContent, shortcut: b.getAttribute('aria-keyshortcuts'), tab: /Tab/.test(b.title),
    childPreserved: b.querySelector('span') !== null,
  }))), names.map(name => ({text: name, shortcut: null, tab: true, childPreserved: true})));
  results.push('12 places: no "N · " prefix, no aria-keyshortcuts, title mentions Tab');

  // Tab: N -> N+1 through all twelve, then last -> first.
  for (let i = 1; i < names.length; i++) {
    await page.keyboard.press('Tab');
    assert.equal(await selected(), names[i]);
  }
  await page.keyboard.press('Tab');
  assert.equal(await selected(), 'area', 'after the last place Tab wraps to the first');
  assert.deepEqual(await page.evaluate(() => window.calls), [...names.slice(1), 'area']);
  assert.deepEqual(await page.evaluate(() => window.send()).then(r => r.prevented), true, 'Tab is prevented while cycling');
  results.push('Tab in active view: N -> N+1 for all twelve, last -> first, default prevented');

  // Shift+Tab goes back, also around the start; no selection starts at the ends.
  await page.evaluate(() => window.setup(12, 'area'));
  await page.keyboard.press('Shift+Tab');
  assert.equal(await selected(), 'carbridge');
  await page.keyboard.press('Shift+Tab');
  assert.equal(await selected(), 'nordic');
  await page.evaluate(() => window.setup(12, null));
  await page.keyboard.press('Tab');
  assert.equal(await selected(), 'area', 'without a selection Tab starts at the first place');
  await page.evaluate(() => window.setup(12, 'park42'));
  await page.keyboard.press('Tab');
  assert.equal(await selected(), 'clocktower', 'counts from the current selection');
  results.push('Shift+Tab previous with wrap; no selection -> first; counts from [data-place].selected');

  async function ignored(options = {}, selector = 'body') {
    const before = await page.evaluate(() => [...window.calls]);
    const sel = await selected();
    assert.deepEqual(await page.evaluate(({options, selector}) => window.send(options, selector), {options, selector}),
      {prevented: false, calls: before}, JSON.stringify({options, selector}));
    assert.equal(await selected(), sel);
  }

  // Digits do nothing.
  await page.evaluate(() => window.setup());
  for (const code of ['Digit1', 'Digit2', 'Digit0', 'Digit9', 'Numpad1', 'Numpad0', 'Numpad9', 'KeyA', 'F1']) {
    await ignored({code, key: code.slice(-1)});
    await page.keyboard.press(code);
  }
  assert.deepEqual(await page.evaluate(() => window.calls), []);
  assert.equal(await selected(), 'area');
  for (const flag of ['ctrlKey', 'altKey', 'metaKey', 'isComposing']) await ignored({[flag]: true});
  results.push('digit row, numpad and other keys do nothing; Ctrl/Alt/Meta/composition ignored');

  // Text fields keep ordinary Tab.
  for (const selector of ['input', 'textarea', 'select', '[contenteditable]', '#editable-child']) {
    await page.locator(selector).focus();
    await ignored({}, selector);
    await ignored(); // Also guard the focused editable when the event targets the body.
    await page.keyboard.press('Tab');
    assert.deepEqual(await page.evaluate(() => window.calls), []);
  }
  // Open dialogs keep ordinary Tab.
  await page.evaluate(() => window.setup());
  for (const method of ['show', 'showModal']) {
    await page.evaluate(method => document.querySelector('dialog')[method](), method);
    await ignored();
    await page.keyboard.press('Tab');
    assert.deepEqual(await page.evaluate(() => window.calls), []);
    await page.evaluate(() => document.querySelector('dialog').close());
  }
  await page.locator('body').focus();
  // Free mouse (not looking), not ready or not active: ordinary focus navigation.
  for (const [ready, active, looking] of [[true, true, false], [false, true, true], [true, false, true], [false, false, false]]) {
    await page.evaluate(state => Object.assign(window, state), {ready, active, looking});
    await ignored();
  }
  results.push('inputs, textarea, select, contenteditable, modal/nonmodal dialogs, free mouse and ready/active gates keep normal Tab');

  // Disabled/detached places are skipped, a prehandled event is left alone, cleanup and empty menu are safe.
  await page.evaluate(() => window.setup(12, 'area'));
  await page.evaluate(() => { document.querySelector('[data-place="home"]').disabled = true; document.querySelector('[data-place="l1004"]').remove(); });
  await page.keyboard.press('Tab');
  assert.equal(await selected(), 'l1201', 'disabled and removed places are skipped');
  await page.evaluate(() => window.setup());
  await page.evaluate(() => document.body.addEventListener('keydown', e => e.preventDefault(), {once: true}));
  assert.deepEqual(await page.evaluate(() => window.send()), {prevented: true, calls: []});
  await page.evaluate(() => window.dispose());
  await ignored();
  await page.evaluate(() => { document.getElementById('menu').replaceChildren(); window.setup(0); });
  await ignored();
  results.push('disabled/detached places skipped, prehandled events, cleanup and empty menu');
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({browser: await browser.version(), results, errors}, null, 2));
} finally {
  await browser.close();
}
