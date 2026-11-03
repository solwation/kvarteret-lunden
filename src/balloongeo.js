import { BALLOON as B } from './config.js';

// Schedule and visual position from original 578ecc09b02c7355e299fc58d0e0127b622ee85a.
// Pure local-clock functions only; no physical surface or collision helpers.

const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/** 0 … 1: how far the balloon has grown at `tSec` (0 = not scheduled). */
export function balloonScale(tSec, cfg = B) {
  const c = ((tSec % cfg.period) + cfg.period) % cfg.period;
  return Math.min(smooth(0, cfg.fadeIn, c), 1 - smooth(cfg.window - cfg.fadeIn, cfg.window, c));
}

/** The basket's floor centre {x, y, z} at `tSec`: a circle round `cfg.center` (the angle follows the clock, so it is continuous across windows). */
export function balloonPos(tSec, out = { x: 0, y: 0, z: 0 }, cfg = B) {
  const a = (tSec * cfg.speed) / cfg.radius;
  out.x = cfg.center.x + Math.cos(a) * cfg.radius; out.z = cfg.center.z + Math.sin(a) * cfg.radius; out.y = cfg.floor;
  return out;
}

