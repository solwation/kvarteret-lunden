// Public #348: selected pure helpers from original #2181, 11995f35 (including 18414a74).
// Only open-window wind and intervening interior obstacles; never the opening's facade or ambient bed.
import { OCCLUSION as O, LEVELS, UNIT_TOP } from './config.js';

// Audio positions are ears/window centres, not Navigation/VisitUnit.levelAt's feet heights.
const levelOf = (levels, y) => { let l = 0; for (let i = 1; i < levels.length; i++) if (y >= levels[i].floor) l = i; return l; };
export function cellOf(world, p) {
  if (![p.x,p.y,p.z].every(Number.isFinite)) return {kind:'out',key:'out'};
  const core = [world.core,...(world.coreHouses ?? [])].find(c => c?.contains?.(p.x,p.z,p.y));
  if (core) return {kind:'core',key:core.house ?? 'L-core'};
  if (world.garage?.inside(p.x,p.z) && p.y < 0.5) return {kind:'garage',key:'garage'};
  const unit = world.unitAt?.(p.x,p.z,p.y);
  if (unit) {
    const level = levelOf(unit.levels,p.y), room = unit.roomAt(level,p.x,p.z);
    return {kind:'unit',flat:unit.id,key:`${unit.id}:${level}:${room ?? ''}`,level,room,unit};
  }
  if (p.x>0 && p.z>0 && p.x<world.size.x && p.z<world.size.z && p.y>=LEVELS[0].floor && p.y<UNIT_TOP-.3) {
    const level = levelOf(LEVELS,p.y), room = world.roomAt(level,p.x,p.z);
    return {kind:'home',flat:'L1007',key:`L1007:${level}:${room ?? ''}`,level,room};
  }
  return {kind:'out',key:'out'};
}

function crosses(ax, az, bx, bz, [cx, cz, dx, dz]) {
  const d = (bx-ax)*(dz-cz)-(bz-az)*(dx-cx);
  if (Math.abs(d)<1e-9) return false;
  const t = ((cx-ax)*(dz-cz)-(cz-az)*(dx-cx))/d, u = ((cx-ax)*(bz-az)-(cz-az)*(bx-ax))/d;
  return t>0 && t<1 && u>0 && u<1;
}

/** Doorway remains fixed when the leaf swings: test segmentAt(0), then its actual animation fraction. */
export function doorsOnLine(doors, a, b, floor) {
  let closed=0, open=0;
  for (const d of doors) {
    if (Math.abs((d.object?.position?.y ?? 0)-floor)>.5) continue;
    if (!crosses(a.x,a.z,b.x,b.z,d.segmentAt?.(0) ?? d.segment())) continue;
    if ((d.t ?? 0)<O.doorClosedT) closed++; else open++;
  }
  return {closed,open};
}

/** Resolve the open portal to its first existing room cell inward; leave the panner at the original frame. */
export function windowRoomPoint(world, src, normal) {
  if (!normal || ![normal.x,normal.z].every(Number.isFinite) || Math.hypot(normal.x,normal.z)<.5) return null;
  for (let d=0; d<=O.portalReach; d+=O.portalStep) {
    const p={x:src.x+normal.x*d,y:src.y,z:src.z+normal.z*d}, cell=cellOf(world,p);
    if ((cell.kind==='home'||cell.kind==='unit') && cell.room) return p;
  }
  return null; // no guessed room for unsupported geometry
}

export function occlusionFor(world, lis, src) {
  const a=cellOf(world,lis), b=cellOf(world,src);
  // The window is already open. No facade loss, no estimate between unmodelled buildings/cells.
  if (!a.flat || a.flat!==b.flat || a.key===b.key) return null;
  const parts=[];
  if (a.level!==b.level) {
    if (a.unit) { if (!a.unit.throughSlab(lis,src)) return null; }
    else if (world.openings?.slab) {
      const {y,hole}=world.openings.slab, t=(y-lis.y)/(src.y-lis.y), x=lis.x+(src.x-lis.x)*t, z=lis.z+(src.z-lis.z)*t;
      if (hole && x>hole.x0 && x<hole.x1 && z>hole.z0 && z<hole.z1) return null;
    }
    parts.push('floor');
  } else {
    const walls=a.unit?.walls[a.level] ?? world.levels[a.level].wallSegments;
    if (walls.some(s=>crosses(lis.x,lis.z,src.x,src.z,s))) parts.push('wall');
    else {
      const floor=a.unit?.levels[a.level].floor ?? LEVELS[a.level].floor;
      const d=doorsOnLine(a.unit?.doors ?? world.doors,lis,src,floor);
      if (d.closed) parts.push('door'); else if(d.open) parts.push('openDoor');
    }
  }
  if (!parts.length) return null;
  let db=0,hz=Infinity;
  for(const p of parts){db+=O[p].db;hz=Math.min(hz,O[p].hz);}
  return {gain:10**(-Math.min(db,O.maxDb)/20),hz:Math.max(O.minHz,hz),parts};
}
export function windowOcclusion(world, lis, src, normal) {
  const room=windowRoomPoint(world,src,normal);
  return room ? occlusionFor(world,lis,room) : null;
}

// Artistic bandwidth estimate for reusing ONE biquad, not physical equivalence to two serial filters.
// min(wind, obstacle) alone would do nothing: open-window wind is already below all obstacle cutoffs.
export const windowCutoff = (windHz, oc) => oc ? windHz / Math.hypot(1, windHz / oc.hz) : windHz;
