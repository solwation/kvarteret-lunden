import { chromium } from '../node_modules/playwright/index.mjs';
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const source = await readFile('./src/updates.js', 'utf8');
const oldVer = '111111111111111111111111', nextVer = '222222222222222222222222';

let published = false;
const requests = [];
const moduleFor = v => source
  .replaceAll('__BUILD_VERSION__', JSON.stringify(v))
  .replaceAll('__BUILD_TIME__', v === oldVer ? '100' : '200');

const html = v => `<!doctype html><html><body><div id="version">${v}</div><div id="notice"></div><script type="module">import {watchUpdates} from '/module-${v}.js';watchUpdates({snapshot:()=>({position:[4,0,8],yaw:1,pitch:.3,active:true}),busy:()=>false,notice:t=>document.getElementById('notice').textContent=t});window.ready=true;</script><!-- ./assets/viewer-${v}.js --></body></html>`;

const server = http.createServer((req, res) => {
  requests.push({ url: req.url, cacheControl: req.headers['cache-control'] ?? null, fetchDest: req.headers['sec-fetch-dest'] ?? null, published });
  const u = new URL(req.url, 'http://localhost');
  if (u.pathname === '/publish') { published = true; res.setHeader('Cache-Control', 'no-store'); res.end('ok'); return; }
  if (u.pathname === '/version.json') { res.setHeader('Cache-Control', 'no-store'); res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ version: published ? nextVer : oldVer, builtAt: published ? 200 : 100 })); return; }
  if (u.pathname.startsWith('/module-')) { res.setHeader('Content-Type', 'text/javascript'); res.setHeader('Cache-Control', 'public, max-age=3600'); res.end(moduleFor(u.pathname.includes(nextVer) ? nextVer : oldVer)); return; }
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Cache-Control', u.pathname === '/fixture' ? 'public, max-age=3600' : 'no-store');
  res.end(html(u.pathname === '/fixture' && published ? nextVer : oldVer));
});

await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;

const browser = await chromium.launch({
  executablePath: '/home/devcontainers/.local/bin/google-chrome',
  headless: true,
  args: ['--no-sandbox']
});
const context = await browser.newContext();
const page = await context.newPage();

try {
  await page.clock.install();
  // 1. Prime target URL with old HTML in HTTP cache
  await page.goto(base + '/fixture?v=' + nextVer);
  await page.waitForFunction(() => window.ready);
  assert.equal(await page.locator('#version').textContent(), oldVer);

  // 2. Start running old version
  await page.goto(base + '/fixture?v=' + oldVer);
  await page.waitForFunction(() => window.ready);

  // 3. Publish new version
  await page.evaluate(async () => { await fetch('/publish'); dispatchEvent(new Event('online')); });
  await page.waitForTimeout(50);

  // 4. Advance time for update countdown to trigger navigation
  await page.clock.fastForward(11_000);
  await page.clock.fastForward(6_000);

  // 5. Verify page navigates to target version with _update
  await page.waitForURL(u => u.pathname === '/fixture' && u.searchParams.get('v') === nextVer && u.searchParams.has('_update'), { timeout: 10000 });
  await page.waitForFunction(() => window.ready);

  const actual = await page.locator('#version').textContent();
  assert.equal(actual, nextVer, 'Loaded new version directly bypassing HTTP cache');
  console.log('PASS: HTTP cache bypasses stale document and successfully loads new version!');
} finally {
  await context.close();
  await browser.close();
  await new Promise(r => server.close(r));
}
