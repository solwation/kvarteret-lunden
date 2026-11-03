// Public #244: neutral seeded pair/flock motion selected from original 131b5d9d.
import { DUCKS } from './config.js';
export { DUCKS };
export class DuckBrain {
  constructor({ home, habitat, seed = 1 }) {
    Object.assign(this, { home, habitat, seed, x: home.x, z: home.z, yaw: 0, phase: 0, mode: 'swim', goal: null });
    this.y = habitat.surface(this.x, this.z).y;
  }
  random() { this.seed = this.seed * 16807 % 2147483647; return this.seed / 2147483647; }
  update(dt, social = null) {
    dt = Number.isFinite(dt) ? Math.min(Math.max(dt, 0), DUCKS.maxStep) : 0;
    let goal = this.goal;
    if (social?.goal && this.habitat.contains(social.goal.x,social.goal.z)) goal = social.goal;
    else if (!goal || Math.hypot(goal.x-this.x, goal.z-this.z) < DUCKS.goalReach) {
      this.mode = this.mode === 'swim' ? 'walk' : 'swim';
      this.goal = goal = this.habitat.goal(this.mode, this.random(), this.random(), this.pair ?? 0);
    }
    if (this.habitat.next) goal = this.habitat.next(this,goal);
    const dx=goal.x-this.x, dz=goal.z-this.z, d=Math.hypot(dx,dz), surface=this.habitat.surface(this.x,this.z);
    this.swimming=surface.water; this.moving=d>DUCKS.stopReach;
    if(this.moving){
      const stride=dt*(surface.water?DUCKS.swimSpeed:DUCKS.speed)*(social?.speed ?? 1); let step=Math.min(d,stride);
      // Slow on the actual bank slope; keep the feet on its surface rather than interpolating through it.
      for(let i=0;i<5;i++){const y=this.habitat.surface(this.x+dx/d*step,this.z+dz/d*step).y,travel=Math.hypot(step,y-this.y);if(travel<=stride+1e-6)break;step*=stride/travel*.98;}
      if(Math.hypot(step,this.habitat.surface(this.x+dx/d*step,this.z+dz/d*step).y-this.y)>stride+1e-6)step=0;
      if (!this.habitat.contains(this.x+dx/d*step,this.z+dz/d*step)) step=0;
      this.moving=step>0; this.x+=dx/d*step;this.z+=dz/d*step;this.yaw=Math.atan2(dx,dz);this.phase+=step*(surface.water?DUCKS.phaseSwim:DUCKS.phaseWalk);
    }
    this.y=this.habitat.surface(this.x,this.z).y;
  }
}

/** Stable seeded mixed pairs; female leads, male follows. Groups are temporary, never a new habitat. */
export class DuckFlock {
  constructor(habitat, seed = DUCKS.social.seed) {
    this.habitat=habitat; this.time=0; this.grouping=false;
    const pairs=Math.round(DUCKS.count*DUCKS.social.femaleFraction);
    if(pairs*2!==DUCKS.count)throw new Error('Duck pairs require equal sexes');
    const maleIds=Array.from({length:pairs},(_,i)=>i*2+1);let choice=seed;
    for(let i=maleIds.length-1;i>0;i--){choice=choice*16807%2147483647;const j=Math.floor(choice/2147483647*(i+1));[maleIds[i],maleIds[j]]=[maleIds[j],maleIds[i]];}
    const homes=Array.from({length:pairs},(_,i)=>habitat.home(i));
    this.brains=Array.from({length:DUCKS.count},(_,i)=>{
      const pair=Math.floor(i/2), female=i%2===0, home={...homes[pair]};
      if(!female){home.z-=DUCKS.social.follow;if(!habitat.contains(home.x,home.z))Object.assign(home,homes[pair]);}
      const b=new DuckBrain({home,habitat,seed:seed+(female?pair*2:maleIds[pair])*97});b.id=female?pair*2:maleIds[pair];b.mate=female?maleIds[pair]:pair*2;b.female=female;b.pair=pair;return b;
    });
  }
  behind(b, lag, side=0) {
    const p={x:b.x-Math.sin(b.yaw)*lag+Math.cos(b.yaw)*side,z:b.z-Math.cos(b.yaw)*lag-Math.sin(b.yaw)*side};
    return this.habitat.contains(p.x,p.z)?p:{x:b.x,z:b.z};
  }
  update(dt,active=()=>true) {
    dt=Number.isFinite(dt)?Math.min(Math.max(dt,0),DUCKS.maxStep):0;
    const C=DUCKS.social,near=active;
    // Freeze both partners at the distance boundary, never run a far bird's AI to catch up.
    active=b=>near(b)&&near(this.brains[b.pair*2+(b.female?1:0)]);
    if(!this.brains.some(active))return;
    this.time+=Math.min(Math.max(dt,0),DUCKS.maxStep);
    this.grouping=this.time%C.groupPeriod<C.groupSeconds && this.brains.filter(b=>b.female).every(active);
    const lead=this.brains[0];
    for(let i=0;i<this.brains.length;i+=2){
      const female=this.brains[i],male=this.brains[i+1];
      if(active(female)){
        const regroup=this.grouping&&i>0;
        const goal=regroup?this.behind(lead,C.follow,C.groupSide):null;
        const wait=active(male)&&Math.hypot(female.x-male.x,female.z-male.z)>C.pairWait;
        const social=goal?{goal,speed:wait?0:C.catchup}:wait?{goal:female,speed:0}:null;
        female.update(dt,social);
      }
      if(active(male))male.update(dt,{goal:this.behind(female,C.follow),speed:C.catchup});
    }
    return;
  }
  get grouped(){return this.grouping&&this.brains.every(b=>Math.hypot(b.x-this.brains[0].x,b.z-this.brains[0].z)<DUCKS.social.groupReach);}
}
