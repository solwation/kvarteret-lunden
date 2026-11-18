// Public #237: ambient subset of original 578ecc09; no objects to find, carry or interact with.
import {SQUIRRELS as C,SEASON,SQUIRREL_LIFE as LIFE} from './config.js';
import {seasonLife} from './squirrellife.js';
import {SQUIRREL_CLIMB as K} from './config.js';
import {limbAt,limbFor,perchF,climbRoute,crownRoute,pathOf,pathAt,climbPose,bestHop,reachOf,swayWeight} from './squirrelclimb.js';
// Public #328 (original #2132, 8a89f610): a tree with a climbing frame (`t.cf`, squirrelclimb.js from treeform.js's skeleton, built in
// squirrelhabitat.js) is climbed on its drawn bark: up the leaning trunk in a loose spiral, belly to it, out along a main limb to perch
// there (`limb` / `lf`), down the same way head first; `limb` runs along limbs / round the trunk within a crown, and a leap goes only
// between branch points at most SQUIRREL_CLIMB.hop m apart (`t.hops[j]`, from linkTrees). Trees without a frame (a test's own) keep the
// old crown-surface perches and climb. Still passive scenery: nothing to feed, catch or score.
const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
const R=C.roam;
export const winterMonth=month=>SEASON.snowMonths.includes(month);
export const clearPath = (x0, z0, x1, z1, walkable, step = 1) => {
  if (!walkable) return true;
  const n = Math.ceil(Math.hypot(x1 - x0, z1 - z0) / step);
  for (let i = 1; i < n; i++) { const k = i / n; if (!walkable(x0 + (x1 - x0) * k, z0 + (z1 - z0) * k)) return false; }
  return true;
};

export const perchPoint = (t, ang, o = {}) => { if (t.cf) return limbAt(t.cf, limbFor(t.cf, ang), perchF(ang), o); o.x = t.x + Math.cos(ang) * t.r * 0.9; o.z = t.z + Math.sin(ang) * t.r * 0.9; o.y = t.cy - t.r * 0.12; return o; };
export const footPoint = (t, ang, ground, o = {}) => { const r = t.cf ? t.cf.r0 + K.cling : 0.3; o.x = t.x + Math.cos(ang) * r; o.z = t.z + Math.sin(ang) * r; o.y = ground(o.x, o.z); return o; };
/** Up the trunk to the crown's height (#1716: spiralling `roam.spiral` turns round it), then out along a limb to the perch (k 0 … 1).
 * `o.a`: the angle round the trunk where it is. */
export function climbPoint(t, ang, k, ground, o = {}) {
  const up = Math.min(1, k / 0.78), out = Math.max(0, (k - 0.78) / 0.22), a = ang - (1 - up) * R.spiral * Math.PI * 2;
  const f = footPoint(t, ang, ground, {}), p = perchPoint(t, ang, {});
  if (out > 0) { o.x = f.x + (p.x - f.x) * out; o.z = f.z + (p.z - f.z) * out; } else { o.x = t.x + Math.cos(a) * 0.3; o.z = t.z + Math.sin(a) * 0.3; }
  // #1728: the foot of the spiral is on the ground where the squirrel is, not where `ang` would put it (on a bank those differ by up to ~0.1 m); the top still meets the perch exactly
  const gy = out > 0 ? f.y : ground(o.x, o.z); o.y = gy + (p.y - gy) * up; o.a = out > 0 ? ang : a; return o;
}

/** Public #328: the leap links within a group (`g`): trunks within leapRange and, between two framed trees, two branch points at most
 * SQUIRREL_CLIMB.hop m apart (original #2132 linkTrees / canHop; stored as a.hops[j] / b.hops[i]: { li, f, lj, fj, d }). */
export function linkTrees(trees){
 trees.forEach(t=>{t.near=[];t.hops={};});
 for(let i=0;i<trees.length;i++)for(let j=i+1;j<trees.length;j++){const a=trees[i],b=trees[j],d=Math.hypot(a.x-b.x,a.z-b.z);if(a.g===b.g&&d<=C.leapRange&&canHop(a,b,i,j,d)){a.near.push(j);b.near.push(i);}}
 return trees;
}
function canHop(a, b, i, j, d) {
  if (!a.cf || !b.cf) return true;
  if (d > reachOf(a.cf) + reachOf(b.cf) + K.hop) return false;
  const h = bestHop(a.cf, b.cf); if (!h || h.d > K.hop) return false;
  a.hops[j] = h; b.hops[i] = { li: h.lj, f: h.fj, lj: h.li, fj: h.f, d: h.d };
  return true;
}

// The public state machine retains the source's perch → leap / trunk → ground → trunk cycle.
// Searching is just an animation pause; there are no simulated or visible collectable objects.
// Public #325 (original #2128): the month (env.month()) tilts the ground pauses: in autumn most finds are buried (`bury`: nose down,
// scrabbling), in winter/early spring it now and then stops to dig (`dig`, then it eats); otherwise a find is eaten sitting up (`eat`), and
// a forager sometimes stops to sit right up and `scan`. These are pure animation pauses: nothing is stored, dropped or left behind.
const PAUSE=['scan','eat','bury','dig'],GROUND=['forage','search',...PAUSE],G=LIFE.ground;
export class SquirrelBrain {
 constructor(spec,env,start){Object.assign(this,{spec,env,tree:start,ang:0,x:0,y:0,z:0,yaw:0,pitch:0,run:0,rise:0,t:0,clock:0,left:0,
  // #328: on a climbing frame: the limb it sits on and how far out (`lf`), the path it follows (`path`, then `after`), a jump's landing
  // (`hopTo`, `hopArc`) and the crown's wind sway on it (`swayK` 0 … 1 at `swayAt`, applied by squirrels.js, not part of the brain's pose)
  limb:-1,lf:0,path:null,after:null,hopTo:null,hopArc:0,swayK:0,swayAt:null,pose_:{},at_:{},from:{x:0,y:0,z:0},to:{x:0,y:0,z:0}});this.enterPerch(start,env.rnd()*Math.PI*2);}
 get tr(){return this.env.trees[this.tree];}
 set(state,dur=1){this.state=state;this.t=0;this.dur=dur;this.run=0;this.rise=0;this.swayK=0;}
 /** #325: what the month means on the ground ({ bury, dig, scan }: SQUIRREL_LIFE.life); no env.month: summer. */
 life(){return seasonLife(this.env.month?this.env.month():0);}
 place(p){this.x=p.x;this.y=p.y;this.z=p.z;}
 between(range){return range[0]+this.env.rnd()*(range[1]-range[0]);}
 enterPerch(tree, ang, li = null, f = null) {
  this.tree = tree; this.ang = ang; this.pitch = 0; this.path = null; this.after = null; this.hopTo = null; this.limb = -1;
  const cf = this.tr.cf;
  if (cf) { // #328: on a limb, along it (facing out, or in when far out), a little of its slope
   this.limb = li ?? limbFor(cf, ang); this.lf = f ?? perchF(ang); this.ang = cf.limbs[this.limb].ang;
   const o = limbAt(cf, this.limb, this.lf, this.at_); this.place(o);
   const back = this.lf > 0.75; this.yaw = o.yaw + (back ? Math.PI : 0); this.pitch = (back ? -o.pitch : o.pitch) * 0.5;
  } else { this.place(perchPoint(this.tr, ang)); this.yaw = ang + Math.PI / 2; }
  this.set('perch', this.between(C.perch) * this.spec.perch);
  if (cf) { this.swayK = swayWeight(this.lf); this.swayAt = cf.limbs[this.limb].tip; }
 }
 climb(up){if(up)this.startUp();else this.startDown();}
 /** #328: a leap to tree j between branch points (both trees with frames): first along the limbs to the take-off point when it is not
  * there, then the jump. False: the old crown-to-crown leap. */
 hopVia(j) {
  const h = this.tr.hops?.[j]; if (!h || this.limb < 0) return false;
  if (this.limb === h.li && Math.abs(this.lf - h.f) < 0.02) { this.startHop(j, h.lj, h.fj); return true; }
  this.startLimb(crownRoute(this.tr.cf, this.limb, this.lf, h.li, h.f), { k: 'leap', j, lj: h.lj, fj: h.fj });
  return true;
 }
 /** #328: a perch that ends without a leap now and then (`stay`) moves within the crown: a jump to another limb within reach, else a run
  * along the limbs (further out or in on the same one, or round the trunk to another). False: it climbs down as before. */
 moveInCrown() {
  const rnd = this.env.rnd, cf = this.tr.cf;
  if (this.limb < 0 || rnd() >= K.stay) return false;
  const lj = Math.floor(rnd() * cf.limbs.length), f = K.perch[0] + (K.perch[1] - K.perch[0]) * rnd();
  const to = limbAt(cf, lj, f), d = Math.hypot(to.x - this.x, to.y - this.y, to.z - this.z);
  if (lj !== this.limb && d <= K.hop && d > 0.4) { this.startHop(this.tree, lj, f); return true; }
  this.startLimb(crownRoute(cf, this.limb, this.lf, lj, f), { k: 'perch', li: lj, f });
  return true;
 }
 /** #328: follow `pts` (bark points) along the limbs / round the trunk, then `after` ({ k: 'perch', li, f } | { k: 'leap', j, lj, fj }). */
 startLimb(pts, after) {
  this.path = pathOf(pts); this.after = after;
  this.set('limb', Math.max(0.3, this.path.total / (C.climb * K.limb * this.spec.speed))); this.run = 1;
 }
 /** #328: a jump from where it is to limb `lj` at `fj` of tree `j` (this tree or a neighbour): a low arc, at most SQUIRREL_CLIMB.hop m. */
 startHop(j, lj, fj) {
  const t = this.env.trees[j]; Object.assign(this.from, { x: this.x, y: this.y, z: this.z });
  const o = limbAt(t.cf, lj, fj); Object.assign(this.to, { x: o.x, y: o.y, z: o.z });
  this.tree2 = j; this.ang2 = t.cf.limbs[lj].ang; this.hopTo = { li: lj, f: fj };
  const d = Math.hypot(o.x - this.x, o.y - this.y, o.z - this.z); this.hopArc = K.hopArc[0] + K.hopArc[1] * d;
  this.set('leap', Math.max(0.35, d / (C.leap * this.spec.speed)));
  this.yaw = Math.atan2(this.to.x - this.x, this.to.z - this.z); this.run = 1;
 }
 startDown() {
  const cf = this.tr.cf;
  if (cf && this.limb >= 0) { // #328: in along the limb and down round the trunk head first, the climb's own way reversed, to a foot spot
   const a0 = this.ang + 2.2 + (this.lf - 0.5) * 2, foot = footPoint(this.tr, a0, this.env.ground);
   this.path = pathOf(climbRoute(cf, foot, this.limb, this.lf).reverse());
   this.set('down', Math.max(1, this.path.total / (C.climb * this.spec.speed))); return;
  }
  this.path = null; this.set('down', Math.max(1, (this.tr.cy - this.tr.y) / (C.climb * this.spec.speed)));
 }
 startUp() {
  const cf = this.tr.cf;
  if (cf) { // #328: from where it stands, round the trunk up to the limb nearest its side and out along it
   const li = limbFor(cf, this.ang), f = perchF(this.ang + this.clock);
   this.path = pathOf(climbRoute(cf, { x: this.x, y: this.y, z: this.z }, li, f)); this.after = { k: 'perch', li, f };
   this.set('up', Math.max(1, this.path.total / (C.climb * this.spec.speed))); return;
  }
  this.path = null; this.set('up', Math.max(1, (this.tr.cy - this.tr.y) / (C.climb * this.spec.speed)));
 }
 /** #328: one step along `path` (k 0 … 1 of it): placed on the bark, posed by climbPose (eased, so the turn from the stem onto a limb is
  * not a snap), the sway weight on a limb. */
 followPath(k, dt) {
  const o = pathAt(this.path, k * this.path.total, this.at_), q = climbPose(o, this.pose_), e = Math.min(1, dt * 14);
  this.place(o); this.run = 1;
  this.yaw += wrap(q.yaw - this.yaw) * e; this.pitch += (q.pitch - this.pitch) * e;
  if (!o.trunk && o.li >= 0) { this.swayK = swayWeight(o.f); this.swayAt = this.tr.cf.limbs[o.li].tip; } else this.swayK = 0;
 }
 startLeap(j){const t=this.env.trees[j];this.hopTo=null;this.hopArc=0;this.tree2=j;this.ang2=Math.atan2(this.z-t.z,this.x-t.x);this.from={x:this.x,y:this.y,z:this.z};this.to=perchPoint(t,this.ang2);const d=Math.hypot(this.to.x-this.x,this.to.z-this.z);this.set('leap',Math.max(.5,d/(C.leap*this.spec.speed)));this.yaw=Math.atan2(this.to.x-this.x,this.to.z-this.z);this.run=1;}
 clear(x,z){return this.env.walkable(x,z)&&clearPath(this.x,this.z,x,z,this.env.walkable,.5);}
 pickGoal(){
  for(let i=0;i<12;i++){const a=this.env.rnd()*Math.PI*2,r=.5+this.env.rnd()*C.forageRadius,x=this.tr.x+Math.cos(a)*r,z=this.tr.z+Math.sin(a)*r;if(this.clear(x,z)){this.goal={x,z};this.pitch=0;this.set('forage');return;}}
  this.returnToTree(false);
 }
 returnToTree(flee){
  this.pitch=0;
  const choices=this.env.trees.map((t,j)=>({j,d:Math.hypot(t.x-this.x,t.z-this.z)})).filter(q=>this.env.trees[q.j].g===this.tr.g&&q.d<C.groundHop).sort((a,b)=>a.d-b.d);
  for(const {j} of choices){const t=this.env.trees[j],ang=Math.atan2(this.z-t.z,this.x-t.x),goal=t.cf?footPoint(t,ang,this.env.ground):climbPoint(t,ang,0,this.env.ground);if(this.clear(goal.x,goal.z)){this.tree2=j;this.ang2=ang;this.goal=goal;this.set(flee?'flee':'toTree');return;}}
  // A verified dry foot is always reachable along the just-climbed trunk; stay and search if a new path is blocked.
  this.set('search',this.between(C.search));
 }
 update(dt){
  dt=Number.isFinite(dt)?Math.max(0,Math.min(C.maxStep,dt)):0;if(!dt)return;this.t+=dt;this.clock+=dt;
  const rnd=this.env.rnd,ground=this.env.ground,pl=this.env.player;
  if(GROUND.includes(this.state)&&pl&&Math.hypot(pl.x-this.x,pl.z-this.z)<this.spec.shy){this.returnToTree(true);}
  if(this.state==='perch'){
   if(this.t<this.dur)return;const near=this.tr.near;
   if(near.length&&rnd()<C.leapChance){const j=near[Math.floor(rnd()*near.length)];if(!this.hopVia(j))this.startLeap(j);}
   else if(!this.tr.cf||!this.moveInCrown())this.climb(false);return; // (#328: a framed crown is sometimes explored first)
  }
  if(this.state==='leap'){
   const k=Math.min(1,this.t/this.dur),h=this.hopTo?this.hopArc:.5+.15*Math.hypot(this.to.x-this.from.x,this.to.z-this.from.z); // (#328: a branch jump's own low arc)
   this.x=this.from.x+(this.to.x-this.from.x)*k;this.z=this.from.z+(this.to.z-this.from.z)*k;this.y=this.from.y+(this.to.y-this.from.y)*k+4*h*k*(1-k);this.pitch=(.5-k)*.9;
   if(k>=1)this.enterPerch(this.tree2,this.ang2,this.hopTo?.li??null,this.hopTo?.f??null);return;
  }
  if(this.state==='limb'){ // #328: along the limbs / round the trunk within the crown
   const k=Math.min(1,this.t/this.dur);this.followPath(k,dt);if(k<1)return;
   const a=this.after;this.path=null;
   if(a?.k==='leap')this.startHop(a.j,a.lj,a.fj);else this.enterPerch(this.tree,this.ang,a?.li??null,a?.f??null);return;
  }
  if((this.state==='down'||this.state==='up')&&this.path){ // #328: on the tree's real bark (its climbing frame)
   const k=Math.min(1,this.t/this.dur);this.followPath(k,dt);if(k<1)return;
   const a=this.after;this.path=null;this.pitch=0;this.swayK=0;
   if(this.state==='up'){this.enterPerch(this.tree,this.ang,a?.li??null,a?.f??null);return;}
   this.limb=-1;this.y=ground(this.x,this.z);this.left=this.between(C.forage);this.pickGoal();return;
  }
  if(this.state==='down'||this.state==='up'){
   const up=this.state==='up',k=Math.min(1,this.t/this.dur),kk=up?k:1-k,p=climbPoint(this.tr,this.ang,kk,ground);this.place(p);
   this.pitch=kk<.78?(up?Math.PI/2:-Math.PI/2):0;this.yaw=kk<.78?(up?Math.atan2(-Math.cos(p.a),-Math.sin(p.a)):Math.atan2(Math.cos(p.a),Math.sin(p.a))):this.ang+Math.PI/2; // (#328: belly to the bark)
   if(k>=1){this.pitch=0;if(up)this.enterPerch(this.tree,this.ang);else{this.left=this.between(C.forage);this.pickGoal();}}return;
  }
  if(PAUSE.includes(this.state)){this.pause(dt);return;}
  if(this.state==='forage'){const L=this.life();if(rnd()<L.scan*dt){this.set('scan',this.between(LIFE.scan.time));return;}if(L.dig>0&&rnd()<L.dig*dt){this.set('dig',G.dig);return;}}
  this.left-=dt;
  if(this.state==='search'){if(this.t>=this.dur){if(this.left<=0)this.returnToTree(false);else this.pickGoal();}return;}
  const dx=this.goal.x-this.x,dz=this.goal.z-this.z,d=Math.hypot(dx,dz),speed=(this.state==='flee'?C.flee:C.run)*this.spec.speed,step=Math.min(d,dt*speed);
  const x=this.x+(d?dx/d*step:0),z=this.z+(d?dz/d*step:0);
  if(!this.clear(x,z)){this.returnToTree(false);return;}
  this.x=x;this.z=z;this.y=ground(x,z);this.yaw=Math.atan2(dx,dz);this.run=1;
  if(d<=step+.01){if(this.state==='forage'){if(rnd()<G.find){if(rnd()<this.life().bury)this.set('bury',G.bury);else this.startEat();}else this.set('search',this.between(C.search));}else{this.tree=this.tree2;this.ang=this.ang2;this.climb(true);}}
  else if(this.state==='forage'&&this.left<=0)this.returnToTree(false);
 }
 /** #325: sits up and nibbles for a while. */
 startEat(){this.set('eat',G.eat*(.8+this.env.rnd()*.4));this.rise=1;}
 /** #325: the ground pauses (original #2128 scan; #1716 eat / bury / dig poses). */
 pause(dt){
  this.run=0;
  if(this.state==='scan'){this.pitch=0;this.rise=Math.min(1,this.rise+dt*5);if(this.t>=this.dur)this.set('forage');return;} // on to the same goal
  if(this.state==='eat'){this.pitch=0;this.rise=1;if(this.t>=this.dur){if(this.left<=0)this.returnToTree(false);else this.pickGoal();}return;}
  this.rise=0;this.pitch=-.45+.12*Math.sin(this.t*18); // bury / dig: nose down, scrabbling
  if(this.t<this.dur)return;this.pitch=0;
  if(this.state==='dig')this.startEat();else if(this.left<=0)this.returnToTree(false);else this.pickGoal();
 }
}
