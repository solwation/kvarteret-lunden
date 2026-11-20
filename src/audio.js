// Public #336: only neutral wind is audible. No assets, persistence, animal or interaction sounds.
import { WIND_SOUND as S } from './config.js';
import { windSoundParams, windStrength, windowWindParams, gustAt } from './windsound.js';

/** One shared procedural source, two outdoor filters, and a positional branch per open window.
 * Kept independent of the DOM so the actual graph can also be rendered with OfflineAudioContext. */
export function createWindGraph(ctx, random = Math.random) {
  const master = ctx.createGain(); master.gain.value = S.master; master.connect(ctx.destination);
  const noiseBuf = ctx.createBuffer(1, ctx.sampleRate * S.noiseSeconds, ctx.sampleRate);
  const data = noiseBuf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = random() * 2 - 1;
  const noise = ctx.createBufferSource(); noise.buffer = noiseBuf; noise.loop = true;
  const lp = ctx.createBiquadFilter(), bp = ctx.createBiquadFilter(); lp.type = 'lowpass'; bp.type = 'bandpass';
  const body = ctx.createGain(), band = ctx.createGain(); body.gain.value = band.gain.value = 0;
  noise.connect(lp).connect(body).connect(master); noise.connect(bp).connect(band).connect(master);
  noise.start();
  const windows = new Set();
  const ease = (param, value, tc) => param.setTargetAtTime(value, ctx.currentTime, tc);
  return { master, noiseBuf,
    set(p, power, tc = S.ease) {
      ease(body.gain,p.gain,tc); ease(lp.frequency,p.lpHz,tc); ease(lp.Q,p.lpQ,tc);
      ease(band.gain,p.bandGain,tc); ease(bp.frequency,p.bandHz,tc); ease(bp.Q,p.bandQ,tc);
      const w = windowWindParams(power);
      for (const v of windows) { ease(v.g.gain,w.gain*S.window.level,tc); ease(v.f.frequency,w.lpHz,tc); }
    },
    window(pos, power) {
      const f = ctx.createBiquadFilter(), g = ctx.createGain(), p = ctx.createPanner(), w = windowWindParams(power);
      f.type = 'lowpass'; f.frequency.value = w.lpHz; f.Q.value = 0.8; g.gain.value = w.gain*S.window.level;
      p.panningModel = 'equalpower'; p.distanceModel = 'inverse'; p.refDistance = S.window.ref; p.rolloffFactor = S.window.rolloff;
      p.positionX.value = pos.x; p.positionY.value = pos.y; p.positionZ.value = pos.z;
      noise.connect(f).connect(g).connect(p).connect(master);
      const v = { f, g }; windows.add(v);
      return { stop() { if (!windows.delete(v)) return; noise.disconnect(f); f.disconnect(); g.disconnect(); p.disconnect(); } };
    },
  };
}

let ctx = null, graph = null, muted = true, power = 0;
let params = windSoundParams();
const windows = new Set();
/** Called only by the explicit wind-sound control, inside its user gesture. */
export function initAudio() {
  if (ctx) return ctx;
  const AC = globalThis.AudioContext || globalThis.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC(); graph = createWindGraph(ctx); graph.master.gain.value = 0;
  graph.set(params,power);
  for (const v of windows) v.voice = graph.window(v.pos,power);
  return ctx;
}
export async function toggleMuted() {
  if (muted) {
    if (!initAudio()) return true;
    await ctx.resume(); graph.master.gain.value = S.master; muted = false;
  } else {
    graph.master.gain.value = 0; muted = true; await ctx.suspend();
  }
  return muted;
}
export const isMuted = () => muted;
export const audioParts = () => ctx ? { ctx, master: graph.master, noiseBuf: graph.noiseBuf } : null;

/** Public scene input, shared with vegetation, and the same strength for every open window. */
export function updateWindSound(state, { x = 0, z = 0, ...environment } = {}) {
  const gust = gustAt(state,x,z);
  power = windStrength(state.power,gust);
  params = windSoundParams({ power: state.power, gust, ...environment });
  graph?.set(params,power);
}
export function updateListener(camera) {
  if (!ctx) return;
  const l = ctx.listener, p = camera.position, yaw = camera.rotation.y;
  if (l.positionX) {
    l.positionX.value=p.x; l.positionY.value=p.y; l.positionZ.value=p.z;
    l.forwardX.value=-Math.sin(yaw); l.forwardY.value=0; l.forwardZ.value=-Math.cos(yaw);
    l.upX.value=0; l.upY.value=1; l.upZ.value=0;
  } else { l.setPosition(p.x,p.y,p.z); l.setOrientation(-Math.sin(yaw),0,-Math.cos(yaw),0,1,0); }
}
const silent = () => {};
const wind = pos => {
  const v = { pos: { x:pos.x,y:pos.y,z:pos.z }, voice:graph?.window(pos,power) };
  windows.add(v);
  return { stop() { if (!windows.delete(v)) return; v.voice?.stop(); } };
};
// All pre-existing non-wind consumers, including scenery animals, stay silent.
export const sfx = new Proxy(Object.freeze({ wind }), { get: (target,key) => Object.hasOwn(target,key) ? target[key] : silent });
