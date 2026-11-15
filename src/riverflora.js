import { RIVER_FLORA } from './config.js';
import { driftHash } from './riverdrift.js';

// #282 (original #1956): where the river's water lilies are, the pure part (no three.js: `node --test src/riverflora.test.mjs`).
// Everything is a fixed function of RIVER_FLORA.seed and the river's own frame (`s` m along the smoothed centre line of
// src/riverdrift.js `driftPath`, `u` m off it), so it is the same on every visit; nothing is saved or sent.
// (The original also places stones and weed on the bed for its divers; this app has no diving, so only the surface part is here.)

const lerp = (a, b, k) => a + (b - a) * k;

/** `length`: the line's length (m); `hw(s)`: half the open channel's width there; `blocked(s, u, r)`: no room (a pier).
 * Returns the leaves [{ s, u, r, yaw, flower }], sorted by `s`. */
export function lilyLayout({ length, hw, blocked = () => false, cfg = RIVER_FLORA }) {
  const { seed, ends } = cfg, span = length - 2 * ends, out = [], L = cfg.lilies;
  if (!(span > 0)) return out;
  for (let c = 0, n = Math.floor(span / L.every); c < n; c++) {
    if (driftHash(c, 21, seed) >= L.chance) continue;
    const s0 = ends + (c + 0.2 + 0.6 * driftHash(c, 22, seed)) * L.every, side = driftHash(c, 23, seed) < 0.5 ? -1 : 1, h0 = hw(s0);
    const u0 = side * h0 * lerp(L.bank[0], L.bank[1], driftHash(c, 24, seed)), pads = Math.round(lerp(L.pads[0], L.pads[1], driftHash(c, 25, seed)));
    for (let j = 0; j < pads; j++) {
      const a = driftHash(c, 30 + j, seed) * Math.PI * 2, d = L.spread * Math.sqrt(driftHash(c, 50 + j, seed)), r = lerp(L.r[0], L.r[1], driftHash(c, 70 + j, seed));
      const s = s0 + Math.cos(a) * d, u = u0 + Math.sin(a) * d * 0.5, lim = hw(s) - r - 0.1;
      if (s < ends || s > length - ends || Math.abs(u) > lim || Math.sign(u) !== side || blocked(s, u, r)) continue;
      if (out.some((p) => Math.hypot(p.s - s, p.u - u) < p.r + r)) continue; // (leaves do not overlap)
      out.push({ s, u, r, yaw: driftHash(c, 90 + j, seed) * Math.PI * 2, flower: driftHash(c, 110 + j, seed) < L.flower });
    }
  }
  return out.sort((a, b) => a.s - b.s);
}

/** The indices [from, to) of the entries of a list sorted by `s` that lie within `range` m of `s0`. */
export function floraWindow(list, s0, range) {
  let lo = 0, hi = list.length;
  while (lo < hi) { const m = (lo + hi) >> 1; if (list[m].s < s0 - range) lo = m + 1; else hi = m; }
  let to = lo; while (to < list.length && list[to].s <= s0 + range) to++;
  return [lo, to];
}

/** Are the river's leaves out / its flowers open in `month` (1 … 12)? */
export const floraSeason = (month, cfg = RIVER_FLORA.lilies) => ({ leaves: month >= cfg.months[0] && month <= cfg.months[1], bloom: month >= cfg.bloom[0] && month <= cfg.bloom[1] });
