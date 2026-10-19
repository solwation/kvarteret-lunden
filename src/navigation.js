import { Vector3 } from 'three';
import * as config from './config.js';
import { stairHeight, stairUnderside } from './stairs.js';
import { groundY, groundBelowDeckY } from './surroundings.js';
import { deckAt } from './riverbridge.js';
import { stileSurface, farWalls, waterBlocked, tooSteep, waterRescue, buildingRescue } from './farwalk.js'; // upstream #1236: walking beyond the block

// Walking geometry adapted from src/player.js in solwation/lunden-3d-apartment,
// reviewed source c079371f6782225e29e9dac51518c509ed8c37e6.
// Positions are feet in world metres; camera rotation is owned by the caller.
const BODY = {
  eye: 1.62, radius: 0.22, walk: 1.6, run: 3.2, stepUp: 0.45,
  headroom: 1.85, hurdle: 0.22, crouchEye: 0.95, crouchSpeed: 0.5,
  ...config.PLAYER,
};
const inRect = (r, x, z) => !!r && x > r.x0 && x < r.x1 && z > r.z0 && z < r.z1;

function pushOut(p, s) {
  if (!s || (s.length > 4 && p.y >= s[4] - BODY.hurdle)) return false;
  // #94 (upstream #1358): most mapped wall segments are far away. Keep the original exact push for nearby ones.
  const [ax, az, bx, bz] = s, r = BODY.radius;
  if (ax < bx ? (p.x < ax-r || p.x > bx+r) : (p.x < bx-r || p.x > ax+r)) return false;
  if (az < bz ? (p.z < az-r || p.z > bz+r) : (p.z < bz-r || p.z > az+r)) return false;
  const dx = s[2] - s[0], dz = s[3] - s[1];
  const t = Math.max(0, Math.min(1, ((p.x - s[0]) * dx + (p.z - s[1]) * dz) / (dx * dx + dz * dz || 1)));
  const x = s[0] + t * dx, z = s[1] + t * dz;
  let nx = p.x - x, nz = p.z - z;
  if (Math.hypot(nx, nz) >= BODY.radius) return false;
  if (Math.hypot(nx, nz) < 1e-9) { nx = -dz || 1; nz = dx; }
  const scale = BODY.radius / Math.hypot(nx, nz);
  p.x = x + nx * scale;
  p.z = z + nz * scale;
  return true;
}

/** First-person walking. Main owns input, look, interaction and core/garage updates.
 * update advances ordinary doors/openables once, including visited units. Do not
 * also update those leaves in main. Core/garage own their doors and lift motion.
 * Level barriers describe room boundaries, including open gaps: only segments
 * are physical walls. No renderer, DOM listeners, storage or services are used.
 */
export class Navigation {
  constructor(world, camera) {
    this.world = world;
    this.camera = camera;
    this.pos = new Vector3();
    this.keys = new Set();
    this.analog = { x: 0, y: 0 }; // right and forward, each -1..1
    this.vy = 0;
    this.eyeY = BODY.eye;
    this.crouch = false;
    this.crouched = false;
    this.sprinting = false;
  }

  /** Set feet explicitly; preserves look and settles onto reachable ground next update. */
  teleport(x, y, z) {
    if (![x, y, z].every(Number.isFinite)) throw new TypeError('teleport requires finite x, y, z');
    this.pos.set(x, y, z);
    this.vy = 0;
    this.eyeY = y + (this.crouched ? BODY.crouchEye : BODY.eye);
    this.camera.position.set(x, this.eyeY, z);
  }

  inFootprint(x = this.pos.x, z = this.pos.z) {
    const s = this.world.size;
    return !!s && x > 0 && x < s.x && z > 0 && z < s.z;
  }

  unitAt(x, z, y) {
    return this.world.unitAt?.(x, z, y)
      ?? (this.world.units ?? []).find(u => u.contains(x, z, y)) ?? null;
  }
  get unit() { return this.unitAt(this.pos.x, this.pos.z, this.pos.y); }
  get unitLevel() { return this.unit?.levelAt(this.pos.y) ?? -1; }

  get cores() {
    const extra = this.world.coreHouses;
    const houses = Array.isArray(extra) ? extra : extra instanceof Map ? [...extra.values()] : extra ? Object.values(extra) : [];
    return [...new Set([this.world.core, ...houses].filter(Boolean))];
  }
  get activeCore() { return this.cores.find(c => c.contains?.(this.pos.x, this.pos.z, this.pos.y)); }
  get inCore() { return !!this.activeCore; }
  get below() {
    return !this.inCore && !!this.world.garage?.inside(this.pos.x, this.pos.z)
      && this.pos.y < (config.GARAGE?.floor ?? this.world.garage.floor ?? -3) + 1.5;
  }
  get aloft() {
    if (this.inCore || this.unit) return false;
    return this.inFootprint()
      ? this.pos.y > (config.UNIT_TOP ?? config.LEVELS.at(-1).top) - 0.3
      : this.pos.y > groundY(this.pos.x, this.pos.z) + (config.ROOFS?.aloft ?? 2);
  }
  get outdoors() { return (!this.inFootprint() && !this.unit) || this.aloft; }
  get level() {
    if (!this.inFootprint() || this.aloft) return 0;
    return this.pos.y > config.LEVELS[0].floor + 1.6 && config.LEVELS.length > 1 ? 1 : 0;
  }

  stairAt(x, z, y = this.pos.y) {
    const u = this.unitAt(x, z, y);
    return u ? u.stairHeight(x, z) : stairHeight(x, z);
  }
  stairUnder(x, z, y = this.pos.y) {
    const u = this.unitAt(x, z, y);
    return u ? u.stairUnderside(x, z) : stairUnderside(x, z);
  }

  /** Highest reachable support: terrain, floors, stair treads, lift or roof. */
  groundAt(x, z, feet = this.pos.y) {
    const inside = this.inFootprint(x, z);
    const cores = inside ? [] : this.cores.filter(c => c.covers?.(x, z));
    const unit = !inside && !cores.length ? this.unitAt(x, z, feet) : null;
    const heights = unit ? [...unit.floors(x, z)]
      : [inside ? config.LEVELS[0].floor : cores.length ? -Infinity : groundY(x, z)];
    if (!inside && !cores.length && !unit && deckAt(x, z) !== null) {
      heights.push(groundBelowDeckY(x, z));
    }
    for (const c of cores) heights.push(...c.heights(x, z));
    if (inside && !inRect(config.STAIR?.hole, x, z) && config.LEVELS[1]) heights.push(config.LEVELS[1].floor);
    const stair = unit ? null : stairHeight(x, z);
    if (stair != null) heights.push(stair);
    if (!inside && !cores.length && !unit && z > 200) { const st = stileSurface(x, z); if (st !== null) heights.push(st); } // the pony paddock's stile (original #1295)
    const garage = this.world.garage;
    if (garage?.inside(x, z)) heights.push(config.GARAGE?.floor ?? garage.floor ?? -3);
    const roof = this.world.roofs?.under(x, z, feet, BODY.stepUp);
    if (roof) heights.push(roof.y);
    let best = -Infinity;
    for (const h of heights) if (Number.isFinite(h) && h <= feet + BODY.stepUp + 1e-6 && h > best) best = h;
    return best;
  }

  roomToStand() {
    const u = this.stairUnder(this.pos.x, this.pos.z);
    return !(u != null && u > this.pos.y + BODY.crouchEye && u < this.pos.y + BODY.headroom);
  }
  blockedByStair(x, z, feet) {
    const top = this.stairAt(x, z, feet), under = this.stairUnder(x, z, feet);
    return top != null && top > feet + BODY.stepUp && under != null
      && under < feet + (this.crouched ? BODY.crouchEye + 0.2 : BODY.headroom);
  }

  /** Current physical leaves, including closed doors; never use isOpen to skip a leaf. */
  segments() {
    const y = this.pos.y, core = this.activeCore, u = this.unit;
    if (core) return core.segments(y);
    if (this.below) return [this.world.garage.segments ?? [], this.world.garage.dynamic?.() ?? []];
    if (u && (!u.ground || u.levelAt(y) > 0)) {
      const lv = u.levelAt(y);
      return [u.fixed[lv] ?? [], u.doorSegments(lv)];
    }
    const dynamic = this.cores.flatMap(c => c.dynamic?.(y) ?? []);
    dynamic.push(...(this.world.garage?.parkDoorSegments?.(y) ?? []));
    if (this.aloft) {
      dynamic.push(...(this.world.units ?? []).flatMap(unit => unit.doorSegmentsAt?.(y) ?? []));
      return [this.world.roofs?.walls(y + BODY.stepUp, y + BODY.headroom, this.pos.x, this.pos.z) ?? [], dynamic];
    }
    const lv = this.level, level = this.world.levels?.[lv];
    const leaves = new Set([...(this.world.doors ?? []), ...(this.world.openables ?? []), ...(level?.doors ?? []), ...(level?.openables ?? [])]);
    for (const d of leaves) {
      if (typeof d.segment !== 'function') continue;
      const base = d.object?.position.y ?? config.LEVELS[lv].floor;
      if (y + BODY.headroom > base && y + BODY.stepUp < base + (config.DOOR_HEIGHT ?? 2.1)) {
        const s = d.segment();
        if (s) dynamic.push(s);
      }
    }
    // Ground-level visited units share fixed walls with level zero, but their
    // moving leaves must also collide from the street side.
    if (lv === 0) dynamic.push(...(this.world.units ?? []).filter(unit => unit.ground).flatMap(unit => unit.doorSegments(0)));
    if (lv === 0 && y > (config.GARAGE?.floor ?? -3) + 1.5) dynamic.push(...(this.world.upperSegments ?? []));
    dynamic.push(...(this.world.movingSegments?.(lv) ?? []));
    if (!this.inFootprint()) dynamic.push(...farWalls(this.pos.x, this.pos.z, this.pos.y)); // the mapped buildings, bridge rails
    return [level?.segments ?? [], dynamic];
  }

  /** Ended up in the river or inside a far building/closed courtyard (a fall): back on the dry bank / out on the street. */
  rescue() {
    if (this.aloft || this.inFootprint() || this.unit || this.inCore || this.below) return;
    const g = groundY(this.pos.x, this.pos.z);
    if (this.pos.y > g + 0.05) return;
    const back = (this.pos.z > 60 && waterRescue(this.pos.x, this.pos.z, this.pos.y)) || buildingRescue(this.pos.x, this.pos.z);
    if (back) {
      const gy = deckAt(back.x, back.z) !== null && this.pos.y < -3.5 ? groundBelowDeckY(back.x, back.z) : groundY(back.x, back.z);
      this.pos.set(back.x, gy, back.z);
      this.vy = 0;
    }
  }

  advanceOpenables(dt) {
    const leaves = new Set([...(this.world.doors ?? []), ...(this.world.lids ?? []), ...(this.world.openables ?? [])]);
    for (const l of this.world.levels ?? []) {
      for (const d of [...(l.doors ?? []), ...(l.openables ?? [])]) leaves.add(d);
    }
    for (const u of this.world.units ?? []) {
      for (const d of [...(u.doors ?? []), ...(u.lids ?? []), ...(u.openables ?? [])]) leaves.add(d);
    }
    for (const d of leaves) d.update?.(dt);
  }

  update(dt) {
    // Discard long background-tab gaps and subdivide time as well as distance:
    // floor and collision context can change partway through a stair flight.
    dt = Number.isFinite(dt) ? Math.max(0, Math.min(dt, 0.1)) : 0;
    this.advanceOpenables(dt);
    const k = this.keys;
    const forward = Number(k.has('KeyW') || k.has('ArrowUp')) - Number(k.has('KeyS') || k.has('ArrowDown'));
    const right = Number(k.has('KeyD') || k.has('ArrowRight')) - Number(k.has('KeyA') || k.has('ArrowLeft'));
    const finiteAxis = v => Number.isFinite(v) ? Math.max(-1, Math.min(1, v)) : 0;
    const f = forward || finiteAxis(this.analog.y), s = right || finiteAxis(this.analog.x);
    const amount = Math.min(1, Math.hypot(f, s));
    this.crouched = this.crouch || k.has('ControlLeft') || k.has('ControlRight') || (this.crouched && !this.roomToStand());
    this.sprinting = amount > 0 && !this.crouched && (k.has('ShiftLeft') || k.has('ShiftRight'));
    const speed = (this.sprinting ? BODY.run : BODY.walk) * (this.crouched ? BODY.crouchSpeed : 1);
    const yaw = this.camera.rotation.y, length = Math.hypot(f, s) || 1;
    const dx = (-Math.sin(yaw) * f + Math.cos(yaw) * s) / length * speed * amount;
    const dz = (-Math.cos(yaw) * f - Math.sin(yaw) * s) / length * speed * amount;
    const count = Math.max(1, Math.ceil(dt / (1 / 120)), Math.ceil(speed * amount * dt / 0.04));
    const h = dt / count;
    for (let i = 0; i < count; i++) {
      const previous = this.pos.clone();
      this.pos.x += dx * h;
      this.pos.z += dz * h;
      const [fixed, moving] = this.segments();
      for (let pass = 0; pass < 4; pass++) {
        let hit = false;
        for (const wall of fixed) hit = pushOut(this.pos, wall) || hit;
        for (const wall of moving) hit = pushOut(this.pos, wall) || hit;
        if (!hit) break;
      }
      if (this.blockedByStair(this.pos.x, this.pos.z, previous.y)) {
        if (!this.blockedByStair(this.pos.x, previous.z, previous.y)) this.pos.z = previous.z;
        else if (!this.blockedByStair(previous.x, this.pos.z, previous.y)) this.pos.x = previous.x;
        else this.pos.copy(previous);
        // Sliding along the stair must not put the body through an adjacent wall.
        for (const wall of fixed) pushOut(this.pos, wall);
        for (const wall of moving) pushOut(this.pos, wall);
        if (this.blockedByStair(this.pos.x, this.pos.z, previous.y)) this.pos.copy(previous);
      }
      if (this.pos.z > 60 && !this.aloft && (waterBlocked(this.pos.x, this.pos.z, undefined, previous.y) || tooSteep(this.pos.x, this.pos.z, undefined, previous.y))) {
        // the river and ground too steep to climb are obstacles: slide along one axis or stay put
        const bad = (x, z) => waterBlocked(x, z, undefined, previous.y) || tooSteep(x, z, undefined, previous.y);
        if (!bad(this.pos.x, previous.z)) this.pos.z = previous.z;
        else if (!bad(previous.x, this.pos.z)) this.pos.x = previous.x;
        else { this.pos.x = previous.x; this.pos.z = previous.z; }
      }
      const ground = this.groundAt(this.pos.x, this.pos.z, this.pos.y);
      if (ground >= this.pos.y) { this.pos.y = ground; this.vy = 0; }
      else {
        this.vy -= 9.8 * h;
        this.pos.y = Math.max(ground, this.pos.y + this.vy * h);
        if (this.pos.y <= ground) this.vy = 0;
      }
      for (const c of this.cores) if (c.snap?.(this)) break;
      this.rescue();
    }
    this.eyeY += (this.pos.y + (this.crouched ? BODY.crouchEye : BODY.eye) - this.eyeY) * (1 - Math.exp(-14 * dt));
    this.camera.position.set(this.pos.x, this.eyeY, this.pos.z);
  }
}
