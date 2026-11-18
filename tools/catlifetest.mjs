// Public #322: node --test tools/catlifetest.mjs  (living outdoor cats, original #2125 6bbfb282: the pure catlife.js tests unchanged, then
// the public's own consumers: the merged puppet rig, the shared fur material, the loop/exploration rest clock and passive-only use)
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as THREE from 'three';
import { CAT_LIFE as L, CAT_SURFACE, OUTDOOR_CATS as C } from '../src/config.js';
import { sitChoice, groomKind, TailMotion, earYaw, earTwitch, stretchPose, bumps, moodOf, seedOf, approach } from '../src/catlife.js';
import { createCatPuppet } from '../src/catpuppet.js';
import { furState, bendPoint, TAIL_SLACK } from '../src/catfur.js';
import { vertexCompileSlack } from '../src/vertexcompile.js';
import { OutdoorCats } from '../src/outdoorcats.js';

const rng = (s) => () => ((s = (s * 16807) % 2147483647) / 2147483647);

test('sitting: the first block grooms, later blocks follow the weights, the same seed and clock give the same choice', () => {
  assert.equal(L.sit.block % 6, 0, 'blocks start at the beginning of a washing cycle');
  for (const seed of [1, 77, seedOf('public-cat-0')]) for (const t of [0, 3, L.sit.block - 0.01]) assert.equal(sitChoice(seed, t), 'groom');
  const n = { groom: 0, wrap: 0, look: 0 }, N = 6000, w = L.sit.weights, sum = w.groom + w.wrap + w.look;
  for (let b = 1; b <= N; b++) { const c = sitChoice(1234, b * L.sit.block + 1); n[c]++; assert.equal(c, sitChoice(1234, b * L.sit.block + L.sit.block - 0.5)); }
  for (const k in n) assert.ok(Math.abs(n[k] / N - w[k] / sum) < 0.03, `${k} ${n[k] / N}`);
  assert.notDeepEqual([...Array(30)].map((_, b) => sitChoice(1, (b + 1) * L.sit.block)), [...Array(30)].map((_, b) => sitChoice(2, (b + 1) * L.sit.block)), 'cats differ');
  assert.equal(groomKind(5, 1), 'face', 'the first washing cycle is the face, as before');
  let flank = 0; for (let c = 1; c <= 4000; c++) flank += groomKind(5, c * 6 + 1) === 'flank';
  assert.ok(Math.abs(flank / 4000 - L.sit.flank) < 0.03);
});

test('tail: bounded for any input, deterministic, trails a turn and settles', () => {
  const r = rng(9), a = new TailMotion(42), b = new TailMotion(42);
  let t = 0;
  for (let i = 0; i < 20000; i++) {
    const dt = [r() * 0.05, 0, 1e6, NaN, -1, r() * 0.5][i % 6], turn = [(r() - 0.5) * 40, Infinity, NaN, 1e9][i % 4];
    const mood = Object.keys(L.tail.moods)[i % 7];
    t += Number.isFinite(dt) && dt > 0 ? Math.min(dt, 1) : 0;
    a.step(dt, { turn, mood, t }); b.step(dt, { turn, mood, t });
    for (const v of [a.bend, a.lift, a.x, a.v]) assert.ok(Number.isFinite(v));
    assert.ok(Math.abs(a.bend) <= L.tail.max + 1e-12 && Math.abs(a.lift) <= L.tail.maxLift + 1e-12);
    assert.equal(a.bend, b.bend); assert.equal(a.lift, b.lift);
  }
  // turning left (+yaw rate) swings the tail out the other way; it settles once the turn stops (asleep: hardly any flicks)
  const s = new TailMotion(3);
  for (let i = 0; i < 60; i++) s.step(1 / 60, { turn: 2, mood: 'sleep', t: 0 });
  assert.ok(s.x < -0.2, `trails ${s.x}`);
  for (let i = 0; i < 240; i++) s.step(1 / 60, { turn: 0, mood: 'sleep', t: 0 });
  assert.ok(Math.abs(s.x) < 0.02, `settles ${s.x}`);
  // mood flicks: a pure function of the clock, more often when cross than calm, none before the clock starts
  const count = (mood) => { let k = 0, was = 0; const M = L.tail.moods[mood]; for (let i = 1; i < 60000; i++) { const v = bumps(7, i / 100, M.rate, M.len) !== 0; if (v && !was) k++; was = v; } return k; };
  assert.ok(count('cross') > 4 * count('calm') && count('calm') > 0);
  assert.equal(bumps(7, 0, 1, 0.3), 0); assert.equal(bumps(7, 12.3, 1, 0.3), bumps(7, 12.3, 1, 0.3));
  assert.equal(moodOf('creep'), 'stalk'); assert.equal(moodOf('flee'), 'cross'); assert.equal(moodOf('look'), 'calm');
});

test('ears: towards the stimulus, bounded, twitches bounded and pure', () => {
  for (let a = -10; a <= 10; a += 0.01) for (const s of [-1, 1]) {
    const y = earYaw(a, s); assert.ok(Math.abs(y) <= L.ears.max + 1e-12);
    const rel = Math.atan2(Math.sin(a), Math.cos(a)); if (Math.abs(rel) > 0.05 && Math.abs(rel) < 3) assert.equal(Math.sign(y), Math.sign(rel), 'turns towards it');
    const tw = earTwitch(11, s, a + 10); assert.ok(Math.abs(tw) <= L.ears.twitchAmp + 1e-12); assert.equal(tw, earTwitch(11, s, a + 10));
  }
  for (const v of [null, NaN, Infinity]) assert.equal(earYaw(v, 1), 0);
  assert.equal(earTwitch(11, 1, 0), 0);
  assert.equal(approach(0, 5, 0.1), 0.1); assert.equal(approach(0, NaN, 0.1), 0);
  const ends = [stretchPose(0), stretchPose(1), stretchPose(-3), stretchPose(NaN)];
  for (const e of ends) assert.equal(e.k, 0);
  const mid = stretchPose(0.5); assert.equal(mid.k, 1); assert.ok(mid.bow === L.stretch.bow && mid.chest === L.stretch.chest);
});

const cats = (now) => new OutdoorCats({ scene: new THREE.Scene(), camera: new THREE.PerspectiveCamera(), ground: () => 0, now: () => now });
const tailRange = (c) => c.rig.parts.find((q) => q.o === c.p.parts.tail);
const positions = (c, [a, b]) => Array.from(c.rig.geometry.attributes.position.array.slice(a * 3, b * 3));

test('the public puppet: tail round its paws in a wrap block, ears twitch within bounds, the stretch bows it', () => {
  const p = createCatPuppet(0x7b8188); p.initLife(seedOf('public-cat-3'));
  let t0 = L.sit.block; while (sitChoice(p.lifeSeed, t0 + 1) !== 'wrap') t0 += L.sit.block;
  for (let i = 0; i < 90; i++) { p.lifeT = t0 + i / 30; p.sitLook(p.lifeT, true); p.pose(1 / 30); }
  p.object.updateMatrixWorld(true);
  assert.ok(p.tailWrap > 0.99, 'wrapped');
  const tip = p.parts.tip.getWorldPosition(new THREE.Vector3()), paw = p.shoulder.children[1].getWorldPosition(new THREE.Vector3());
  assert.ok(tip.z > paw.z - 0.06, `the tip is round in front by the paws (${tip.z.toFixed(3)} vs paw ${paw.z.toFixed(3)})`);
  const R = CAT_SURFACE.ear.rotation;
  let twitched = 0;
  for (let i = 0; i < 3000; i++) { p.lifeT = 100 + i / 30; p.pose(1 / 30); for (const e of p.parts.ears) { const y = e.rotation.y - R[1]; assert.ok(Math.abs(y) <= L.ears.twitchAmp + 1e-9); twitched = Math.max(twitched, Math.abs(y)); } }
  assert.ok(twitched > 0.05, `ears twitch ${twitched}`);
  Object.assign(p, { stand: 1, wantStand: 1, wantWrap: 0, bow: null }); p.pose(0); const high = p.head.position.y;
  p.bow = stretchPose(0.5); p.pose(0);
  assert.ok(high - p.head.position.y > 0.06 && p.parts.body.rotation.x >= L.stretch.bow - 1e-9, `bowed ${(high - p.head.position.y).toFixed(3)} m`);
});

test('the merged outdoor rig: only the tail vertices bend on the CPU (the shader twin curve), one shared fur material', () => {
  const o = cats(C.epoch + 5000), c = o.cats[4], p = c.p, [a, b] = [tailRange(c).start, tailRange(c).start + tailRange(c).n];
  const before = positions(c, [0, c.rig.geometry.attributes.position.count]);
  p.tailBend[0] = 0.5; p.tailBend[1] = 0.2; c.rig.write();
  const after = positions(c, [0, c.rig.geometry.attributes.position.count]);
  let moved = 0; for (let i = 0; i < after.length; i++) if (Math.abs(after[i] - before[i]) > 1e-7) { moved++; assert.ok(i >= a * 3 && i < b * 3, `only tail vertices move (${i})`); }
  assert.ok(moved > 30, `tail vertices moved ${moved}`);
  // the largest bend stays inside the registered slack of the fur material
  const base = p.parts.tip.userData.base.clone();
  assert.ok(base.length() * 2 * Math.sin(L.tail.max / 2) <= TAIL_SLACK);
  assert.ok(bendPoint(new THREE.Vector3(0, 0, 1), 0, 0, 1).distanceTo(new THREE.Vector3(0, 0, 1)) < 1e-12);
  // one shared fur material (one program key, one draw per cat, no texture) on near and far meshes
  const m = c.mesh.material;
  assert.ok(o.cats.every((x) => x.mesh.material === m) && furState(m) && m.customProgramCacheKey().endsWith('|catfur1'));
  assert.equal(vertexCompileSlack(m), TAIL_SLACK);
  assert.deepEqual([...furState(m).uCatFur.value.toArray()], [1, 1]); assert.equal(furState(m).uCatTail.value.z, 0, 'no shader bend: the CPU rig bends');
});

test('the rest clock: a loop cat stretches in the last seconds of a long ground rest and walks on, never while walking', () => {
  const o = cats(C.epoch), c = o.cats[5];
  let stretched = 0, walkingStretch = 0, last = null;
  for (let T = 0; T < c.loop.period * 2; T += 0.25) {
    const s = c.scheduled(C.epoch + T - c.spec.phase);
    assert.ok(Number.isFinite(s.restDone) && s.restDone >= 0);
    if (s.walking) { assert.equal(s.restDone, 0); continue; }
    if (s.restLeft <= L.stretch.secs && s.restDone >= L.stretch.after) stretched++;
    last = s;
  }
  assert.ok(stretched > 10, `stretch samples ${stretched}`); assert.equal(walkingStretch, 0); assert.ok(last);
  const e = o.cats[0].scheduled(C.epoch + 3000);
  assert.ok(Number.isFinite(e.restDone) && (e.walking ? e.restDone === 0 : e.restDone === Math.max(0, e.elapsed)));
});

test('passive scenery only: the public consumers read no visitor, sound or prey stimulus', () => {
  for (const f of ['src/outdoorcats.js', 'src/catpuppet.js', 'src/outdoorcatbrain.js'])
    assert.ok(!/earAt|\.hear\(|wantCrouch|sfx|fish|toy|onPet|localStorage/.test(readFileSync(f, 'utf8')), f);
  assert.equal(moodOf('nuzzle'), 'happy'); assert.equal(moodOf('wash'), 'calm'); assert.equal(moodOf('sleep'), 'sleep');
});
