// Public #237: ambient subset of original 578ecc09; no objects to find, carry or interact with.
import {SQUIRRELS as C,SEASON} from './config.js';
const R=C.roam;
export const winterMonth=month=>SEASON.snowMonths.includes(month);
export const clearPath = (x0, z0, x1, z1, walkable, step = 1) => {
  if (!walkable) return true;
  const n = Math.ceil(Math.hypot(x1 - x0, z1 - z0) / step);
  for (let i = 1; i < n; i++) { const k = i / n; if (!walkable(x0 + (x1 - x0) * k, z0 + (z1 - z0) * k)) return false; }
  return true;
};

export const perchPoint = (t, ang, o = {}) => { o.x = t.x + Math.cos(ang) * t.r * 0.9; o.z = t.z + Math.sin(ang) * t.r * 0.9; o.y = t.cy - t.r * 0.12; return o; };
export const footPoint = (t, ang, ground, o = {}) => { o.x = t.x + Math.cos(ang) * 0.3; o.z = t.z + Math.sin(ang) * 0.3; o.y = ground(o.x, o.z); return o; };
/** Up the trunk to the crown's height (#1716: spiralling `roam.spiral` turns round it), then out along a limb to the perch (k 0 … 1).
 * `o.a`: the angle round the trunk where it is. */
export function climbPoint(t, ang, k, ground, o = {}) {
  const up = Math.min(1, k / 0.78), out = Math.max(0, (k - 0.78) / 0.22), a = ang - (1 - up) * R.spiral * Math.PI * 2;
  const f = footPoint(t, ang, ground, {}), p = perchPoint(t, ang, {});
  if (out > 0) { o.x = f.x + (p.x - f.x) * out; o.z = f.z + (p.z - f.z) * out; } else { o.x = t.x + Math.cos(a) * 0.3; o.z = t.z + Math.sin(a) * 0.3; }
  // #1728: the foot of the spiral is on the ground where the squirrel is, not where `ang` would put it (on a bank those differ by up to ~0.1 m); the top still meets the perch exactly
  const gy = out > 0 ? f.y : ground(o.x, o.z); o.y = gy + (p.y - gy) * up; o.a = out > 0 ? ang : a; return o;
}

// The public state machine retains the source's perch → leap / trunk → ground → trunk cycle.
// Searching is just an animation pause; there are no simulated or visible collectable objects.
export class SquirrelBrain {
 constructor(spec,env,start){Object.assign(this,{spec,env,tree:start,ang:0,x:0,y:0,z:0,yaw:0,pitch:0,run:0,t:0,clock:0,left:0});this.enterPerch(start,env.rnd()*Math.PI*2);}
 get tr(){return this.env.trees[this.tree];}
 set(state,dur=1){this.state=state;this.t=0;this.dur=dur;this.run=0;}
 place(p){this.x=p.x;this.y=p.y;this.z=p.z;}
 between(range){return range[0]+this.env.rnd()*(range[1]-range[0]);}
 enterPerch(tree,ang){this.tree=tree;this.ang=ang;this.pitch=0;this.place(perchPoint(this.tr,ang));this.yaw=ang+Math.PI/2;this.set('perch',this.between(C.perch)*this.spec.perch);}
 climb(up){this.set(up?'up':'down',Math.max(1,(this.tr.cy-this.tr.y)/(C.climb*this.spec.speed)));}
 startLeap(j){const t=this.env.trees[j];this.tree2=j;this.ang2=Math.atan2(this.z-t.z,this.x-t.x);this.from={x:this.x,y:this.y,z:this.z};this.to=perchPoint(t,this.ang2);const d=Math.hypot(this.to.x-this.x,this.to.z-this.z);this.set('leap',Math.max(.5,d/(C.leap*this.spec.speed)));this.yaw=Math.atan2(this.to.x-this.x,this.to.z-this.z);this.run=1;}
 clear(x,z){return this.env.walkable(x,z)&&clearPath(this.x,this.z,x,z,this.env.walkable,.5);}
 pickGoal(){
  for(let i=0;i<12;i++){const a=this.env.rnd()*Math.PI*2,r=.5+this.env.rnd()*C.forageRadius,x=this.tr.x+Math.cos(a)*r,z=this.tr.z+Math.sin(a)*r;if(this.clear(x,z)){this.goal={x,z};this.set('forage');return;}}
  this.returnToTree(false);
 }
 returnToTree(flee){
  const choices=this.env.trees.map((t,j)=>({j,d:Math.hypot(t.x-this.x,t.z-this.z)})).filter(q=>this.env.trees[q.j].g===this.tr.g&&q.d<C.groundHop).sort((a,b)=>a.d-b.d);
  for(const {j} of choices){const t=this.env.trees[j],ang=Math.atan2(this.z-t.z,this.x-t.x),goal=climbPoint(t,ang,0,this.env.ground);if(this.clear(goal.x,goal.z)){this.tree2=j;this.ang2=ang;this.goal=goal;this.set(flee?'flee':'toTree');return;}}
  // A verified dry foot is always reachable along the just-climbed trunk; stay and search if a new path is blocked.
  this.set('search',this.between(C.search));
 }
 update(dt){
  dt=Number.isFinite(dt)?Math.max(0,Math.min(C.maxStep,dt)):0;if(!dt)return;this.t+=dt;this.clock+=dt;
  const rnd=this.env.rnd,ground=this.env.ground,pl=this.env.player;
  if(['forage','search'].includes(this.state)&&pl&&Math.hypot(pl.x-this.x,pl.z-this.z)<this.spec.shy){this.returnToTree(true);}
  if(this.state==='perch'){
   if(this.t<this.dur)return;const near=this.tr.near;
   if(near.length&&rnd()<C.leapChance)this.startLeap(near[Math.floor(rnd()*near.length)]);else this.climb(false);return;
  }
  if(this.state==='leap'){
   const k=Math.min(1,this.t/this.dur),h=.5+.15*Math.hypot(this.to.x-this.from.x,this.to.z-this.from.z);
   this.x=this.from.x+(this.to.x-this.from.x)*k;this.z=this.from.z+(this.to.z-this.from.z)*k;this.y=this.from.y+(this.to.y-this.from.y)*k+4*h*k*(1-k);this.pitch=(.5-k)*.9;
   if(k>=1)this.enterPerch(this.tree2,this.ang2);return;
  }
  if(this.state==='down'||this.state==='up'){
   const up=this.state==='up',k=Math.min(1,this.t/this.dur),kk=up?k:1-k,p=climbPoint(this.tr,this.ang,kk,ground);this.place(p);
   this.pitch=kk<.78?(up?Math.PI/2:-Math.PI/2):0;this.yaw=kk<.78?(up?p.a+Math.PI:p.a):this.ang+Math.PI/2;
   if(k>=1){this.pitch=0;if(up)this.enterPerch(this.tree,this.ang);else{this.left=this.between(C.forage);this.pickGoal();}}return;
  }
  this.left-=dt;
  if(this.state==='search'){if(this.t>=this.dur){if(this.left<=0)this.returnToTree(false);else this.pickGoal();}return;}
  const dx=this.goal.x-this.x,dz=this.goal.z-this.z,d=Math.hypot(dx,dz),speed=(this.state==='flee'?C.flee:C.run)*this.spec.speed,step=Math.min(d,dt*speed);
  const x=this.x+(d?dx/d*step:0),z=this.z+(d?dz/d*step:0);
  if(!this.clear(x,z)){this.returnToTree(false);return;}
  this.x=x;this.z=z;this.y=ground(x,z);this.yaw=Math.atan2(dx,dz);this.run=1;
  if(d<=step+.01){if(this.state==='forage')this.set('search',this.between(C.search));else{this.tree=this.tree2;this.ang=this.ang2;this.climb(true);}}
  else if(this.state==='forage'&&this.left<=0)this.returnToTree(false);
 }
}
