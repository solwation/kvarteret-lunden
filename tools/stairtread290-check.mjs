// #290: A/B/C stair walking height = the drawn tread's top (+-1 cm), and the eased eye does not jerk. Usage: node tools/stairtread290-check.mjs [out.json]
import { writeFileSync } from 'node:fs';
// Node has no canvas: a recording stub is enough, only geometry/height functions are used.
const stub = () => new Proxy(function () {}, { get: (t, k) => (k === 'canvas' ? stub() : k === Symbol.toPrimitive ? () => 0 : stub()), set: () => true, apply: () => stub() });
globalThis.document = { createElement: () => ({ width: 0, height: 0, getContext: () => stub(), style: {} }) };
const { CoreHouse } = await import('../src/corehouse.js');
const { CORE_A, CORE_B, CORE_C } = await import('../src/config.js');
const BODY = { eye: 1.62, stepUp: 0.45 }, out = {};
let fail = 0;
for (const C of [CORE_A, CORE_B, CORE_C]) {
  const h = new CoreHouse(C), { Y, ST, B, RISE, LN } = h, [WL0, WL1] = ST.well, SN = ST.straight, TD = ST.tread, ZW = ST.top + SN * TD, NW = ST.risers - 1 - 2 * SN;
  // The drawn tread top, from the draw() calls' own rectangles (not from stairS/treadTop).
  const drawn = (k, x, z) => {
    if (LN && k === 0) return x > WL1 && x < B.x1 && z > LN.foot - (ST.risers - 1) * LN.tread && z <= LN.foot ? Y[0] + RISE * (Math.floor((LN.foot - z) / LN.tread - 1e-9) + 1) : null;
    if (z <= ST.top || z > ZW) return null;
    const i = Math.floor((z - ST.top) / TD - 1e-9) + 1;
    return x > B.x0 && x < WL0 ? Y[k] + RISE * i : x > WL1 && x < B.x1 ? Y[k] + RISE * (SN + NW + SN + 1 - i) : null;
  };
  let n = 0, worst = 0;
  for (let k = LN ? 0 : 0; k < Y.length - 1; k++)
    for (let x = B.x0 + 0.02; x < B.x1; x += 0.05) for (let z = ST.top + 0.013; z <= B.z1; z += 0.013) {
      const d = drawn(k, x, z); if (d === null) continue;
      if (z > ST.top && z <= ZW && Math.abs((z - ST.top) / TD - Math.round((z - ST.top) / TD)) < 1e-6) continue; // exactly on a nosing: either tread is right
      if (LN && k === 0 && Math.abs((LN.foot - z) / LN.tread - Math.round((LN.foot - z) / LN.tread)) < 1e-6) continue;
      const hs = h.heights(x, z).filter(v => Math.abs(v - d) < RISE / 2 + 1e-6);
      const err = hs.length ? Math.min(...hs.map(v => Math.abs(v - d))) : Infinity;
      n++; worst = Math.max(worst, err); if (err > 0.01) fail++;
    }
  // Winders / fan / mid-landing: heights must be a whole number of risers above a stop (a step function, no ramp).
  let off = 0, m = 0;
  for (let x = B.x0 + 0.02; x < B.x1; x += 0.05) for (let z = ST.top + 0.013; z <= B.z1; z += 0.013) for (const v of h.heights(x, z)) {
    const q = (v - Y[0]) / RISE; if (h.stairS(x, z) === null && h.laneS(x, z) === null) continue; m++; if (Math.abs(q - Math.round(q)) > 1e-6 && !Y.some(y => Math.abs(y - v) < 1e-6)) off++;
  }
  if (off) fail++;
  // Eye trace: climb the west flight (then winders and east flight) at run speed along the walking line, Navigation's rules (support <= feet + stepUp, eye eased at rate 14).
  const k = LN ? 1 : 0, path = [];
  for (let z = ST.top + 0.05; z < ZW; z += 0.01) path.push([(B.x0 + WL0) / 2, z]);
  for (let z = ZW; z < ST.run; z += 0.01) path.push([(B.x0 + WL0) / 2, z]);
  const trace = (fn) => {
    const dt = 1 / 60; let y = Y[k], eye = y + BODY.eye, maxJump = 0, maxFeet = 0, prev = eye, i = 0;
    for (let t = 0; i < path.length; t += dt) {
      i = Math.min(path.length - 1, Math.floor(t * 3.2 / 0.01)); const [x, z] = path[i];
      const g = Math.max(...fn(x, z).filter(v => v <= y + BODY.stepUp + 1e-6), -Infinity);
      if (Number.isFinite(g)) { if (g >= y) y = g; else y = Math.max(g, y - 9.8 * dt * dt * 60); }
      eye += (y + BODY.eye - eye) * (1 - Math.exp(-14 * dt)); maxJump = Math.max(maxJump, Math.abs(eye - prev)); prev = eye; maxFeet = Math.max(maxFeet, Math.abs(y - (fn(x, z).find(v => Math.abs(v - y) < 1e-9) ?? y)));
      if (i === path.length - 1) break;
    }
    return maxJump;
  };
  const ramp = (x, z) => [...h.heights(x, z).filter(v => Y.includes(v)), ...(h.stairS(x, z) === null ? [] : [Y[k] + RISE * (h.stairS(x, z) + 0.5)])];
  const eyeStep = trace((x, z) => h.heights(x, z)), eyeRamp = trace(ramp);
  const maxEyeFrame = Math.max(eyeStep, 0);
  out[C.house] = { samples: n, worstTreadErrM: +worst.toFixed(4), nonStepSamples: off, ofSamples: m, risers: ST.risers, RISE: +RISE.toFixed(4), maxEyeFrameStepM: +eyeStep.toFixed(4), maxEyeFrameRampM: +eyeRamp.toFixed(4) };
  console.log(C.house, JSON.stringify(out[C.house]));
}
console.log(fail ? `FAIL ${fail}` : 'PASS'); if (process.argv[2]) writeFileSync(process.argv[2], JSON.stringify(out, null, 1) + '\n'); process.exit(fail ? 1 : 0);
