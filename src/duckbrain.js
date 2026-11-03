// Public #235, adapted from original 578ecc09: pure ambient motion on caller-supplied terrain.
import { DUCKS } from './config.js';
export { DUCKS };
export class DuckBrain {
  constructor({ home, habitat, seed = 1 }) {
    Object.assign(this, { home, habitat, seed, x: home.x, z: home.z, yaw: 0, phase: 0, mode: 'swim', goal: null });
    this.y = habitat.surface(this.x, this.z).y;
  }
  random() { this.seed = this.seed * 16807 % 2147483647; return this.seed / 2147483647; }
  update(dt) {
    dt = Number.isFinite(dt) ? Math.min(Math.max(dt, 0), DUCKS.maxStep) : 0;
    let goal = this.goal;
    if (!goal || Math.hypot(goal.x-this.x, goal.z-this.z) < DUCKS.goalReach) {
      this.mode = this.mode === 'swim' ? 'walk' : 'swim';
      this.goal = goal = this.habitat.goal(this.mode, this.random(), this.random());
    }
    const dx=goal.x-this.x, dz=goal.z-this.z, d=Math.hypot(dx,dz), surface=this.habitat.surface(this.x,this.z);
    this.swimming=surface.water; this.moving=d>DUCKS.stopReach;
    if(this.moving){
      const stride=dt*(surface.water?DUCKS.swimSpeed:DUCKS.speed); let step=Math.min(d,stride);
      // Slow on the actual bank slope; keep the feet on its surface rather than interpolating through it.
      for(let i=0;i<5;i++){const y=this.habitat.surface(this.x+dx/d*step,this.z+dz/d*step).y,travel=Math.hypot(step,y-this.y);if(travel<=stride+1e-6)break;step*=stride/travel*.98;}
      if(Math.hypot(step,this.habitat.surface(this.x+dx/d*step,this.z+dz/d*step).y-this.y)>stride+1e-6)step=0;
      this.x+=dx/d*step;this.z+=dz/d*step;this.yaw=Math.atan2(dx,dz);this.phase+=step*(surface.water?DUCKS.phaseSwim:DUCKS.phaseWalk);
    }
    this.y=this.habitat.surface(this.x,this.z).y;
  }
}


/** The local river tangent keeps the small flock clear of bridge/paddock geometry. */
export function duckHabitat(r,ground,waterY) {
 const C=DUCKS.habitat,tx=r.nz,tz=-r.nx,north=r.nz>0?-1:1;
 const point=(along,across)=>({x:r.x+tx*along+r.nx*across,z:r.z+tz*along+r.nz*across});
 return {
  surface:(x,z)=>{const w=waterY(x,z),g=ground(x,z);return{y:Math.max(w-C.sink,g),water:g<w-C.waterMargin};},
  home:i=>point((i-C.startAlong)*C.spacing,i%2?0:north*(r.width/2+r.bank*.4+C.startShore)),
  goal:(mode,a,b)=>point((a-.5)*C.span,mode==='swim'?(b-.5)*r.width*C.waterSpan:north*(r.width/2+r.bank*.4+C.shore[0]+b*C.shore[1])),
  contains:(x,z)=>{const dx=x-r.x,dz=z-r.z;return Math.abs(dx*tx+dz*tz)<C.along&&Math.abs(dx*r.nx+dz*r.nz)<r.width/2+r.bank*.4+C.extraBank;}
 };
}
