// Public #245: anonymous absolute-clock exploration with a bounded temporary social pause/return.
import {hash01} from './outdoorcatroute.js';
import {CatExploration} from './catexploration.js';
import {CAT_AFFORDANCES} from './cataffordances.js';
import {OUTDOOR_CATS as C} from './config.js';
const planner=new CatExploration(CAT_AFFORDANCES,C.exploration);
// Neutral id-derived variation; no source character profile/name/breed is imported.
const variation=id=>Object.fromEntries(Object.entries(C.variation).map(([key,[base,range]],i)=>[key,base+range*hash01(id,245,i+1)]));
export class OutdoorCatBrain{
 constructor(spec,id,now=()=>Date.now()/1000){Object.assign(this,{spec,id,now,traits:variation(id),planner,st:'route',delay:0,anchor:null,at:null,x:0,z:0,yaw:0,h:0});}
 scheduled(now=this.now()){return planner.at(this.id,now-C.epoch+this.spec.phase-this.delay,this.traits);}
 set(state){if(state==='social'){if(this.st!=='route')return;this.anchor={...this.at};this.pauseAt=this.now();this.st='social';}else if(state==='home'&&this.st==='social')this.st='home';}
 update(dt){
  if(this.st==='route'){this.at=this.scheduled();Object.assign(this,{x:this.at.x,z:this.at.z,yaw:this.at.yaw});return this.at;}
  if(this.st==='home'){const a=this.anchor,d=Math.hypot(a.x-this.x,a.z-this.z),step=Math.min(d,dt*C.returnSpeed);if(d>.001){this.yaw=Math.atan2(a.x-this.x,a.z-this.z);this.x+=(a.x-this.x)*step/d;this.z+=(a.z-this.z)*step/d;}if(d<=.01){this.delay+=this.now()-this.pauseAt;this.st='route';this.at=this.scheduled();Object.assign(this,{x:this.at.x,z:this.at.z,yaw:this.at.yaw});return this.at;}}
  return {...this.anchor,x:this.x,z:this.z,yaw:this.yaw,walking:this.st==='home',activity:this.st==='social'?'nuzzle':'walk',elevated:false,climbing:false};
 }
}
