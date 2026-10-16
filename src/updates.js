// Standalone Pages updates; only the public walkthrough's own one-use resume is stored.
export const VERSION = typeof __BUILD_VERSION__ === 'undefined' ? '' : __BUILD_VERSION__;
const BUILT_AT = typeof __BUILD_TIME__ === 'undefined' ? 0 : __BUILD_TIME__;
const RESUME_KEY = 'kvarteret-lunden.update-resume';
const RESUME_AGE = 5 * 60_000;

export function takeResume() {
  try {
    const raw = sessionStorage.getItem(RESUME_KEY);
    sessionStorage.removeItem(RESUME_KEY);
    const saved = JSON.parse(raw);
    if (!saved || saved.version !== VERSION || Date.now() - saved.at > RESUME_AGE || saved.at > Date.now()) return null;
    if (!Array.isArray(saved.position) || saved.position.length !== 3 || !saved.position.every(n => Number.isFinite(n) && Math.abs(n) < 10000)) return null;
    if (![saved.yaw, saved.pitch].every(Number.isFinite) || Math.abs(saved.pitch) > 1.35) return null;
    return saved;
  } catch { return null; }
}

export function watchUpdates({snapshot, busy, notice, reload = url => location.replace(url)}) {
  if (!VERSION) return; // Unbuilt local development has no published version.
  let pending = null, checking = false, reloading = false, lastInput = performance.now();
  let countdown = 0, retryAt = 0;
  const interacted = () => { lastInput = performance.now(); countdown = 0; };
  for (const type of ['keydown','pointerdown','pointermove','wheel','touchstart']) document.addEventListener(type, interacted, {passive:true});
  async function check() {
    if (checking || document.hidden || reloading) return;
    checking = true;
    const controller = new AbortController(), timeout = setTimeout(() => controller.abort(), 5000);
    try {
      const url = new URL('./version.json', location.href); url.searchParams.set('_', Date.now());
      const response = await fetch(url, {cache:'no-store', signal:controller.signal});
      if (!response.ok) return;
      const remote = await response.json();
      if (/^[a-f0-9]{24}$/.test(remote.version) && remote.version !== VERSION && Number.isFinite(remote.builtAt) && remote.builtAt > BUILT_AT) pending = remote;
      else pending = null;
    } catch { /* Offline visits keep running; retry on the next poll or return. */ }
    finally { clearTimeout(timeout); checking = false; }
  }
  async function update() {
    if (!pending || reloading) return;
    reloading = true;
    const controller = new AbortController(), timeout = setTimeout(() => controller.abort(), 5000);
    try {
      // Ensure the new HTML is available too; never loop against an old cached entry page.
      const url = new URL(location.href); url.searchParams.set('v', pending.version);
      const response = await fetch(url, {cache:'no-store', signal:controller.signal});
      if (!response.ok || !(await response.text()).includes(`./assets/viewer-${pending.version}.js`)) throw new Error('Publication not ready');
      // Input may have resumed while the HTML request was in flight.
      if (document.hidden || busy() || performance.now() - lastInput < 10_000) {
        reloading = false; countdown = 0; return;
      }
      const saved = {...snapshot(), version:pending.version, at:Date.now()};
      try { sessionStorage.setItem(RESUME_KEY, JSON.stringify(saved)); } catch { /* Storage may be disabled; a normal fresh start still updates the app. */ }
      reload(url.href);
    } catch {
      reloading = false; countdown = 0; retryAt = performance.now() + 60_000;
      notice('En ny version finns. Försöker uppdatera igen om en stund.');
    } finally { clearTimeout(timeout); }
  }
  setInterval(check, 60_000);
  setInterval(() => {
    if (!pending || reloading) return;
    if (document.hidden || busy() || performance.now() - lastInput < 10_000 || performance.now() < retryAt) {
      countdown = 0; notice('En ny version finns. Uppdaterar när du tar en paus.'); return;
    }
    if (!countdown) countdown = performance.now() + 5000;
    const seconds = Math.ceil((countdown - performance.now()) / 1000);
    notice(`Uppdaterar om ${seconds} s. Din plats och vy behålls.`);
    if (seconds <= 0) void update();
  }, 500);
  document.addEventListener('visibilitychange', () => { interacted(); if (!document.hidden) void check(); });
  addEventListener('online', check);
  void check();
}
