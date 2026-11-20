// Public #336: only neutral wind is audible. No assets, persistence, animal or interaction sounds.
import {windowOcclusion, windowCutoff} from './soundocclusion.js';
import {OCCLUSION as O} from './config.js';
import { WIND_SOUND as S, AMBIENT_BED as AB } from './config.js';
import { riverBabbleParams, cityHumParams, distToPolyline } from './ambientbed.js';
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
  // Public #352: the ambient bed - two more loops on the same noise buffer (river band-pass, city low-pass); built once, silent until set().
  const loop = (type, hz, q, offset) => {
    const src = ctx.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
    const f = ctx.createBiquadFilter(), g = ctx.createGain(); f.type = type; f.frequency.value = hz; f.Q.value = q; g.gain.value = 0;
    src.connect(f).connect(g).connect(master); src.start(0, offset); return { f, g };
  };
  const river = loop('bandpass', 900, AB.river.q, S.noiseSeconds * 0.37), city = loop('lowpass', 200, 0.7, S.noiseSeconds * 0.71);
  return { master, noiseBuf,
    setAmbient(p, tc = AB.ease) {
      ease(river.g.gain, p.river.gain, tc); ease(river.f.frequency, p.river.hz, tc); ease(river.f.Q, p.river.q, tc);
      ease(city.g.gain, p.city.gain, tc); ease(city.f.frequency, p.city.hz, tc);
    },
    set(p, power, tc = S.ease) {
      ease(body.gain,p.gain,tc); ease(lp.frequency,p.lpHz,tc); ease(lp.Q,p.lpQ,tc);
      ease(band.gain,p.bandGain,tc); ease(bp.frequency,p.bandHz,tc); ease(bp.Q,p.bandQ,tc);
      const w = windowWindParams(power);
      for (const v of windows) { v.power=power; ease(v.g.gain,w.gain*S.window.level*(v.oc?.gain ?? 1),tc); ease(v.f.frequency,windowCutoff(w.lpHz,v.oc),tc); }
    },
    window(pos, power) {
      const f = ctx.createBiquadFilter(), g = ctx.createGain(), p = ctx.createPanner(), w = windowWindParams(power);
      f.type = 'lowpass'; f.frequency.value = w.lpHz; f.Q.value = 0.8; g.gain.value = w.gain*S.window.level;
      p.panningModel = 'equalpower'; p.distanceModel = 'inverse'; p.refDistance = S.window.ref; p.rolloffFactor = S.window.rolloff;
      p.positionX.value = pos.x; p.positionY.value = pos.y; p.positionZ.value = pos.z;
      noise.connect(f).connect(g).connect(p).connect(master);
      const v = { f, g, power, oc:null }; windows.add(v);
      return {
        setOcclusion(oc) { v.oc=oc; const w=windowWindParams(v.power); ease(g.gain,w.gain*S.window.level*(oc?.gain ?? 1),O.ramp); ease(f.frequency,windowCutoff(w.lpHz,oc),O.ramp); },
        stop() { if (!windows.delete(v)) return; noise.disconnect(f); f.disconnect(); g.disconnect(); p.disconnect(); }
      };
    },
  };
}

let ctx = null, graph = null, muted = true, power = 0;
let params = windSoundParams();
let ambient = ambientParams();
const windows = new Set();
/** Called only by the explicit wind-sound control, inside its user gesture. */
export function initAudio() {
  if (ctx) return ctx;
  const AC = globalThis.AudioContext || globalThis.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC(); graph = createWindGraph(ctx); graph.master.gain.value = 0;
  graph.set(params,power); graph.setAmbient(ambient);
  for (const v of windows) { v.voice=graph.window(v.pos,power); v.voice.setOcclusion(v.oc); }
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
/** Public #352: neutral babble by distance to `riverPath` and a faint city hum by `hour`; same indoors flag as the wind. */
function ambientParams({ riverPath = [], x = 0, z = 0, hour = 12, indoors = false } = {}) {
  return { river: riverBabbleParams({ dist: distToPolyline(riverPath, x, z), indoors }), city: cityHumParams({ hour, indoors }) };
}
export function updateAmbientBed(scene) { ambient = ambientParams(scene); graph?.setAmbient(ambient); }
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
// Reuses each existing window filter/gain. Called on main's existing quarter-second wind tick.
let acousticWorld=null, acousticListener=null;
export function updateWindowOcclusion(world,listener) {
  acousticWorld=world; acousticListener={x:listener.x,y:listener.y,z:listener.z};
  for(const v of windows){v.oc=windowOcclusion(world,acousticListener,v.pos,v.normal);v.voice?.setOcclusion(v.oc);}
}
const silent = () => {};
const wind = (pos,normal) => {
  const v = {pos:{x:pos.x,y:pos.y,z:pos.z},normal:normal?{x:normal.x,z:normal.z}:null,voice:graph?.window(pos,power),oc:null};
  if(acousticWorld && acousticListener)v.oc=windowOcclusion(acousticWorld,acousticListener,v.pos,v.normal);
  v.voice?.setOcclusion(v.oc);
  windows.add(v);
  return {get occlusion(){return v.oc;}, stop() { if (!windows.delete(v)) return; v.voice?.stop(); } };
};
// All pre-existing non-wind consumers, including scenery animals, stay silent.
export const sfx = new Proxy(Object.freeze({ wind }), { get: (target,key) => Object.hasOwn(target,key) ? target[key] : silent });
