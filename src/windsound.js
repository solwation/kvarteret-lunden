// Public #336, reviewed original #2177 26fa2762aa43792163904aa8721db95091b2e329: neutral wind helpers.
import { WIND_SOUND as S, SITE_WIND as W } from './config.js';

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const lerp = (a, b, k) => a + (b - a) * k;
const smooth = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };

/** The same downwind gust front as sitewind.js / vegetation; no separate weather or clock. */
export function gustAt({ time, dir }, x = 0, z = 0) {
  return 1 - W.gust.depth + W.gust.depth * Math.sin(time * W.gust.freq - (x * dir.x + z * dir.y) * W.gust.wave);
}

/** Effective strength 0…1 of the wind now: its power, swelled and thinned by the gust sweep (gust 0…1, 0.5 = neutral). */
export function windStrength(power, gust = 0.5) { return clamp01(clamp01(power) * (0.7 + 0.6 * gust)); }

/**
 * { gain, lpHz, lpQ, bandGain, bandHz, bandQ } for one moment. `power` 0…1 (siteWind.power), `gust` 0…1 (gustAt), `leaves` 0…1 (SEASON.trees[month][3]),
 * `near` 0…1 (how close the nearest tree is: 1 = under it), `indoors` (heard through the walls).
 */
export function windSoundParams({ power = 0, gust = 0.5, leaves = 1, near = 0, indoors = false } = {}) {
  const s = windStrength(power, gust), B = S.body, R = S.band;
  let gain = lerp(B.gain[0], B.gain[1], s ** B.gamma) * (s > 0 ? 1 : 0.5);
  let lpHz = lerp(B.hz[0], B.hz[1], s);
  const lpQ = lerp(B.q[0], B.q[1], smooth(B.howl[0], B.howl[1], s));
  const rustle = leaves * near * smooth(0.05, 0.4, s), whistle = (1 - leaves) * smooth(R.from[0], R.from[1], s) * (0.5 + 0.5 * near);
  const tot = rustle + whistle, k = tot > 0 ? whistle / tot : 0;
  let bandGain = (R.rustle.gain * rustle + R.whistle.gain * whistle) * (0.5 + s);
  const bandHz = lerp(lerp(R.rustle.hz[0], R.rustle.hz[1], s), lerp(R.whistle.hz[0], R.whistle.hz[1], s), k);
  const bandQ = lerp(R.rustle.q, lerp(R.whistle.q[0], R.whistle.q[1], s), k);
  if (indoors) { gain *= S.indoor.gain; bandGain *= S.indoor.band; lpHz = Math.min(lpHz, S.indoor.hz); }
  return { gain, lpHz, lpQ, bandGain, bandHz, bandQ };
}

/** The open window's wind (`sfx.wind`, by strength 0…1): { gain, lpHz }. */
export function windowWindParams(power) {
  const W = S.window, p = clamp01(power);
  return { gain: lerp(W.gain[0], W.gain[1], p), lpHz: lerp(W.hz[0], W.hz[1], p) };
}

/** How near the closest tree is, 0…1 (1 = at it, 0 = `WIND_SOUND.near` m or more); `feet` = [{ x, z }]. */
export function treeNearness(feet, x, z) {
  let best = S.near;
  for (const f of feet) { const dx = f.x - x; if (dx > best || -dx > best) continue; const d = Math.hypot(dx, f.z - z); if (d < best) best = d; }
  return 1 - best / S.near;
}
