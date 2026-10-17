// Loading steps (#39), adapted from lunden-3d-apartment d9d9abb (#1130) and 673b78d (#1133): names the current startup
// step on the welcome card through index.html's dependency-free `window.kvarteretStartup`.
import { STARTUP } from './config.js';

/** Resolves after the next frame (or STARTUP.stepYield ms when frames are throttled), so the page can paint. */
function nextPaint() {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, STARTUP.stepYield);
    globalThis.requestAnimationFrame?.(() => { clearTimeout(timer); setTimeout(resolve, 0); });
  });
}

/** Show `name` as the current step with an approximate share `fraction` (0–1) of the whole startup.
 *  `await loadingStep(…)` before a long synchronous block lets the page paint the new step first. */
export function loadingStep(name, fraction) {
  try { globalThis.kvarteretStartup?.setStep(name, fraction); } catch { /* the card is cosmetic */ }
  return nextPaint();
}

/** Progress inside the current step: raises the bar to `fraction` without a new step, then lets the page paint, so a
 *  long synchronous build can be cut into parts with the heartbeat drawn in between. */
export function loadingYield(fraction) {
  try { globalThis.kvarteretStartup?.progress(fraction); } catch { /* the card is cosmetic */ }
  return nextPaint();
}
