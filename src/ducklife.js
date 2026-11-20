// Public #344 (original #2202, a5983bfa; neutral parts only): pure local mallard day/night schedule and resting body pose.
// No world, audio, random or network state.
import { DUCK_LIFE as L } from './config.js';
export { L as DUCK_LIFE };
const smooth = x => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
/** 0 by day, 1 at night; smooth dusk ramp 18-20 and dawn ramp 05-07 on the local hour. */
export function duckNight(hour = 12) {
  if (!Number.isFinite(hour)) return 0;
  hour = ((hour % 24) + 24) % 24;
  return hour >= 12 ? smooth((hour - L.dusk[0]) / (L.dusk[1] - L.dusk[0])) : 1 - smooth((hour - L.dawn[0]) / (L.dawn[1] - L.dawn[0]));
}
/** Body-level rest pose (the public mesh has no neck): a slight crouch, forward tuck and slow breathing, scaled by `weight`. */
export function duckSleepPose(out, weight, time = 0) {
  out.ty += (-L.crouch + L.breath * Math.sin(time * 1.8)) * weight;
  out.pitch += L.tuck * weight;
  return out;
}
