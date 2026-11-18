// Public #325 (original #2128 e5784ceb): node --test tools/squirrellifetest.mjs
// The original's pure tests for src/squirrellife.js (seasons, tail, scan head, eating paws) plus the public consumers: the ambient brain's
// seasonal ground pauses, the merged mesh's life morph targets and the real Squirrels host. No browser.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as THREE from 'three';
import { SQUIRRELS as C, SQUIRREL_LIFE as L, SEASON } from '../src/config.js';
import { SquirrelBrain } from '../src/squirrelbrain.js';
import { squirrelSeason, seasonLife, tailWave, scanHead, eatPaws, TAIL_JOINTS } from '../src/squirrellife.js';
import { squirrelGeometry, LIFE_MORPHS as LM, tailInfluences, tailPoints } from '../src/squirrelmodel.js';
import { Squirrels } from '../src/squirrels.js';

const rng = (seed) => () => ((seed = seed * 16807 % 2147483647) / 2147483647);
const trees = Array.from({ length: 4 }, (_, i) => ({ x: i * 6, z: 0, y: 0, cy: 5, r: 2, g: 'river', near: [(i + 1) % 4] }));
const env = (seed, month) => ({ trees, ground: () => 0, walkable: () => true, rnd: rng(seed), player: { x: 500, z: 500 }, month: month == null ? undefined : () => month });
const GROUND = ['forage', 'search', 'scan', 'eat', 'bury', 'dig'];
/** One squirrel kept on the ground for `seconds`: what it did (state counts, entries). */
const life = (seed, month, seconds = 1800) => {
  const e = env(seed, month), b = new SquirrelBrain(C.animals[0], e, 0), seen = {}, log = [];
  let last = '', yOff = 0, riseScan = 0;
  for (let t = 0; t < seconds; t += 0.1) {
    if (!GROUND.includes(b.state)) { Object.assign(b, { x: b.tr.x, z: b.tr.z, y: 0, pitch: 0 }); b.left = 1e9; b.pickGoal(); }
    b.update(0.1);
    if (b.state === 'scan') { yOff = Math.max(yOff, Math.abs(b.y)); riseScan = Math.max(riseScan, b.rise); }
    if (b.state !== last) { seen[b.state] = (seen[b.state] ?? 0) + 1; last = b.state; log.push(b.state); }
  }
  return { seen, log, yOff, riseScan, b };
};

test('#2128: seasons: autumn buries, winter digs up, summer keeps the old cache chance', () => {
  assert.equal(squirrelSeason(10), 'autumn'); assert.equal(squirrelSeason(3), 'winter'); assert.equal(squirrelSeason(7), 'summer'); assert.equal(squirrelSeason(4), 'spring');
  assert.equal(seasonLife(7).bury, 0.4, 'summer = the original\'s old all-year chance');
  assert.equal(seasonLife(0).bury, 0.4, 'no month: summer');
  assert.ok(seasonLife(10).bury > seasonLife(7).bury && seasonLife(7).bury > seasonLife(3).bury, 'autumn buries most, winter least');
  assert.ok(seasonLife(3).dig > seasonLife(4).dig && seasonLife(10).dig === 0 && seasonLife(7).dig === 0, 'digging up is a winter / early-spring thing');
  for (const m of SEASON.snowMonths) assert.equal(squirrelSeason(m), 'winter', 'the snow months count as winter (hidden there anyway)');
});

test('#325: the public brain\'s ground pauses per season: autumn buries, winter digs then eats, everybody scans sitting up', () => {
  const autumn = life(5, 10), winter = life(5, 3), summer = life(5, 7);
  const finds = (r) => r.log.filter((s, i) => (s === 'bury' || s === 'eat') && r.log[i - 1] === 'forage');
  const buryRate = (r) => { const f = finds(r); return f.filter((s) => s === 'bury').length / Math.max(1, f.length); };
  assert.ok(finds(autumn).length >= 20 && finds(winter).length >= 20, 'it finds something now and then');
  assert.ok(buryRate(autumn) > 0.6, `autumn: most finds buried (${buryRate(autumn).toFixed(2)})`);
  assert.ok(buryRate(winter) < 0.25, `winter: finds eaten (${buryRate(winter).toFixed(2)})`);
  assert.ok(buryRate(autumn) > buryRate(summer) && buryRate(summer) > buryRate(winter), 'summer in between');
  const digs = (r) => r.log.filter((s, i) => s === 'dig' && r.log[i - 1] === 'forage').length;
  assert.ok(digs(winter) >= 3 && digs(autumn) === 0 && digs(summer) === 0, `winter stops to dig (${digs(winter)}), autumn/summer do not`);
  assert.ok(winter.log.some((s, i) => s === 'eat' && winter.log[i - 1] === 'dig'), 'and eats what it dug up');
  for (const r of [autumn, winter, summer]) assert.ok((r.seen.scan ?? 0) >= 5, `stops to scan (${r.seen.scan})`);
  assert.equal(winter.yOff, 0, 'scans on the ground'); assert.ok(winter.riseScan > 0.99, 'sat right up');
  assert.deepEqual(life(5, 10, 600).log, life(5, 10, 600).log, 'deterministic');
  // pauses keep the old passive escape: a visitor close by sends it up a tree from any of them
  for (const st of ['scan', 'eat', 'bury', 'dig']) {
    const e = env(2, 10), b = new SquirrelBrain(C.animals[0], e, 0); Object.assign(b, { x: 1, z: 1, y: 0, left: 99 }); b.goal = { x: 2, z: 2 }; b.set(st, 2); b.rise = 1; b.pitch = -0.4;
    e.player.x = 1.5; e.player.z = 1.2; b.update(0.05); assert.ok(['flee', 'search'].includes(b.state), st); assert.equal(b.pitch, 0); assert.equal(b.rise, 0);
  }
});

test('#2128: scan sits right up and goes back to the same forage goal; bury/dig nose down, eat sits up', () => {
  const e = env(9, 7), b = new SquirrelBrain(C.animals[0], e, 0);
  Object.assign(b, { x: 0, z: 0, y: 0 }); b.left = 30; b.pickGoal(); const goal = { ...b.goal }, left = b.left; b.set('scan', 2);
  for (let i = 0; i < 6; i++) b.update(0.1);
  assert.equal(b.state, 'scan'); assert.ok(b.rise > 0.9 && b.run === 0, 'sat up, still');
  for (let i = 0; i < 50 && b.state === 'scan'; i++) b.update(0.1);
  assert.equal(b.state, 'forage'); assert.deepEqual(b.goal, goal); assert.ok(b.left <= left);
  b.set('dig', 2); let minP = 0; for (let i = 0; i < 15; i++) { b.update(0.1); minP = Math.min(minP, b.pitch); }
  assert.ok(minP < -0.4 && b.rise === 0, 'nose down, scrabbling');
  for (let i = 0; i < 20 && b.state === 'dig'; i++) b.update(0.1);
  assert.equal(b.state, 'eat'); assert.equal(b.rise, 1); assert.equal(b.pitch, 0);
});

test('#2128: the tail moves in a bounded S, swings against the hops, opens in a leap and is deterministic', () => {
  const out = [], M = L.tail.max; let n = 0;
  for (let t = 0; t < 20; t += 0.037) for (const run of [0, 0.5, 1]) for (const leap of [null, 0, 0.5, 1]) for (const wind of [-1, 0, 1]) {
    tailWave(out, { t, phase: 1.3, run, hop: t * 28, leap, rise: (t % 3) / 3, wind });
    assert.equal(out.length, TAIL_JOINTS);
    for (const o of out) { assert.ok(Math.abs(o.x) <= M + 1e-12 && Math.abs(o.y) <= M + 1e-12, 'bounded'); assert.ok(Number.isFinite(o.x) && Number.isFinite(o.y)); n++; }
  }
  assert.ok(n > 10000);
  let s = 0, k = 0; for (let t = 0; t < 10; t += 0.1, k++) { tailWave(out, { t }); for (let j = 1; j < TAIL_JOINTS; j++) if (Math.sign(out[j].x) !== Math.sign(out[j - 1].x)) { s++; break; } }
  assert.ok(s / k > 0.6, `S-shaped (${(s / k).toFixed(2)})`);
  let c = 0; for (let h = 0; h < 2 * Math.PI; h += 0.1) { tailWave(out, { t: 0, run: 1, hop: h }); const r = tailWave([], { t: 0, run: 0, hop: h }); c += (out[0].x - r[0].x) * Math.sin(h); }
  assert.ok(c < -0.5, `counter-swing ${c.toFixed(2)}`);
  const mean = (a) => a.reduce((v, o) => v + o.x, 0) / a.length;
  assert.ok(mean(tailWave([], { t: 0, leap: 0.5 })) < mean(tailWave([], { t: 0 })) - 0.1, 'opens in a leap');
  assert.ok(mean(tailWave([], { t: 0, rise: 1 })) > mean(tailWave([], { t: 0 })), 'curls tighter sitting up');
  assert.deepEqual(tailWave([], { t: 3.3, phase: 2, run: 0.7, hop: 5, leap: 0.2, rise: 0.4, wind: 0.6 }), tailWave([], { t: 3.3, phase: 2, run: 0.7, hop: 5, leap: 0.2, rise: 0.4, wind: 0.6 }));
});

test('#2128: the scanning head holds still and snaps (jerky), within bounds; eating paws are bounded', () => {
  let moving = 0, steps = 0, jumps = 0; const dt = 1 / 120;
  for (let seed = 0; seed < 20; seed++) {
    let prev = scanHead(0, seed);
    assert.deepEqual(prev, { yaw: 0, pitch: 0 }, 'starts looking ahead');
    for (let t = dt; t < 4; t += dt) {
      const h = scanHead(t, seed); assert.ok(Math.abs(h.yaw) <= L.scan.yaw && Math.abs(h.pitch) <= L.scan.pitch);
      const d = Math.hypot(h.yaw - prev.yaw, h.pitch - prev.pitch); if (d > 1e-9) moving++; if (d / dt > 4) jumps++; steps++; prev = h;
    }
    assert.deepEqual(scanHead(1.234, seed), scanHead(1.234, seed), 'deterministic');
  }
  assert.ok(moving / steps < 0.3, `mostly still holds (${(moving / steps).toFixed(2)} of the time moving)`);
  assert.ok(jumps > 50, 'the moves are quick snaps');
  for (let t = 0; t < 5; t += 0.01) { const e = eatPaws(t, 3); for (const v of Object.values(e)) assert.ok(Number.isFinite(v) && Math.abs(v) < 2.5); }
});

test('#325: one merged mesh keeps its draw, gains relative life morphs; the tail morphs move only the tail and follow the bent centre line', () => {
  for (const far of [false, true]) {
    const g = squirrelGeometry(C.animals[1], far), n = g.attributes.position.count, P = g.morphAttributes.position;
    assert.equal(P.length, LM.count); assert.equal(g.morphAttributes.normal.length, LM.count); assert.equal(g.morphTargetsRelative, true);
    for (const a of P) { assert.equal(a.count, n); assert.ok(a.array.every(Number.isFinite)); }
    const moved = (a) => { let first = n, last = -1; for (let i = 0; i < n; i++) if (Math.abs(a.getX(i)) + Math.abs(a.getY(i)) + Math.abs(a.getZ(i)) > 1e-7) { first = Math.min(first, i); last = i; } return [first, last]; };
    const tail = moved(P[LM.tail]); assert.ok(tail[0] > n / 3 && tail[1] === n - 1, 'joint 0 moves only the tail (the last part)');
    for (let j = 0; j < TAIL_JOINTS - 1; j++) assert.ok(moved(P[LM.tail + j])[0] >= tail[0]);
    // +pitch curls the tail forward over the back: the tip goes forward (+z) for every joint
    const tip = tailPoints(false), m = moved(P[LM.headPitch]), p = moved(P[LM.paws]), q = moved(P[LM.morsel]);
    for (let j = 0; j < TAIL_JOINTS - 1; j++) { const b = tailPoints(false, Array.from({ length: TAIL_JOINTS }, (_, i) => (i === j ? { x: L.morph.ref } : null))); assert.ok(b[6].z > tip[6].z, `joint ${j} curls forward`); }
    assert.ok(m[1] < tail[0] && m[0] >= 0, 'head pitch leaves the tail');
    // #271's ground support: every full morph still stands on the same lowest point as the rest pose
    const pos = g.attributes.position, base = Math.min(...Array.from({ length: n }, (_, i) => pos.getY(i)));
    for (const d of P) assert.ok(Math.abs(Math.min(...Array.from({ length: n }, (_, i) => pos.getY(i) + d.getY(i))) - base) < 1e-8, 'feet stay on the ground'); assert.ok(p[1] < tail[0] && q[1] < tail[0] && q[1] - q[0] < 80, 'paws/morsel leave the tail; the morsel is one small blob');
  }
  // the morsel: zero size at rest, a small blob between the raised paws in the eating pose
  const g = squirrelGeometry(C.animals[0]), pos = g.attributes.position, d = g.morphAttributes.position[LM.paws];
  let grown = 0; for (let i = 0; i < pos.count; i++) if (Math.abs(d.getY(i)) > 0.05) grown++;
  assert.ok(grown > 20, 'the forearms swing up');
});

test('#325: tailWave maps onto the morph influences: pitch exactly per joint, yaw by a least-squares sway/ramp fit', () => {
  const inf = new Array(LM.count).fill(0), out = [];
  for (let t = 0; t < 10; t += 0.13) {
    tailWave(out, { t, phase: 0.7, run: (t % 2) / 2, hop: t * 28, leap: t % 3 < 1 ? (t % 1) : null, rise: 0, wind: 0.5 });
    tailInfluences(inf, out);
    for (let j = 0; j < TAIL_JOINTS - 1; j++) assert.ok(Math.abs(inf[LM.tail + j] * L.morph.ref - out[j].x) < 1e-12);
    const a = inf[LM.yaw] * L.morph.ref, b = inf[LM.yawRamp] * L.morph.ref; let err = 0, mag = 0;
    for (let j = 0; j < TAIL_JOINTS - 1; j++) { err += (a + b * j / (TAIL_JOINTS - 1) - out[j].y) ** 2; mag += out[j].y ** 2; }
    assert.ok(err <= mag + 1e-12 && inf.every(Number.isFinite), 'the fit is never worse than no yaw');
    for (const v of inf) assert.ok(Math.abs(v) <= L.tail.max / L.morph.ref * 2 + 1e-9, 'bounded influences');
  }
  const ramp = Array.from({ length: TAIL_JOINTS }, (_, j) => ({ x: 0, y: 0.04 + 0.05 * j / (TAIL_JOINTS - 1) }));
  tailInfluences(inf, ramp); assert.ok(Math.abs(inf[LM.yaw] * L.morph.ref - 0.04) < 1e-12 && Math.abs(inf[LM.yawRamp] * L.morph.ref - 0.05) < 1e-12, 'an even sway plus ramp is exact');
});

test('#325: the real Squirrels host: influences per state, sitting up, the month tilts the brain, still passive', () => {
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(), feet = [{ x: -150, z: 215, y: 0 }], crowns = [{ x: -150, z: 215, y: 5, r: 2 }];
  const s = new Squirrels({ scene, camera, feet, crowns, southFeet: [], ground: () => 0, rnd: rng(4) }); s.winter = false; s.month = 10;
  const a = s.animals[0], b = a.brain; assert.equal(b.life(), seasonLife(10));
  camera.position.set(-150, 1.6, 226); // (within drawDist, beyond its shy distance)
  const drawsBefore = scene.children.length;
  Object.assign(b, { x: -150, z: 216, y: 0 }); b.goal = { x: -149, z: 217 }; b.left = 99;
  const run = (st, n = 30) => { b.set(st, 99); if (st === 'eat') b.rise = 1; for (let i = 0; i < n; i++) s.update(1 / 30); return [...a.body.morphTargetInfluences]; };
  const eat = run('eat'); assert.ok(eat[LM.paws] > 0.9 && eat[LM.paws] < 1.1, 'forearms at the mouth'); assert.ok(eat[LM.headPitch] > 0, 'head nods');
  assert.ok(Math.abs(a.group.rotation.x + 1.05) < 1e-9, 'sat right up on the haunches');
  assert.equal(eat[LM.morsel], 1, 'a morsel in the paws');
  const scan = run('scan', 60); assert.ok(b.rise > 0.99); assert.ok(Math.abs(scan[LM.paws] - L.morph.tuck) < 1e-9 && scan[LM.morsel] === 0, 'paws held to the chest, nothing in them');
  let looked = false; for (let i = 0; i < 90; i++) { s.update(1 / 30); const f = a.body.morphTargetInfluences; if (f[1] > 0.05 || f[2] > 0.05) looked = true; assert.ok(f[1] <= 1 && f[2] <= 1); }
  assert.ok(looked, 'the head snaps round');
  const dig = run('dig', 5); assert.ok(a.group.rotation.x > 0.3, 'nose down'); assert.equal(dig[LM.paws], 0); assert.equal(dig[LM.morsel], 0);
  for (const f of [eat, scan, dig]) assert.ok(f.every(Number.isFinite) && f.length === LM.count);
  assert.equal(scene.children.length, drawsBefore, 'no new objects');
  for (const n of ['squirrels', 'squirrelbrain', 'squirrelhabitat', 'squirrelmodel', 'squirrellife'])
    assert.ok(!/NutField|holdable|pingping|audio|sfx|squirrelsync|localStorage|sessionStorage|WebSocket|fetch\(|targets\(|pickable|onFeed|hasNut/.test(readFileSync(`src/${n}.js`, 'utf8')), n);
});
