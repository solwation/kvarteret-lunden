// Public #237: local ambient animals only, selected original 578ecc09 model/poses and adapted brain.
// Public #325 (original #2128 e5784ceb): the tail's S-wave and hop/leap balance, the jerky scan, sitting up to nibble and the nose-down
// bury/dig scrabble, all as morph influences/group pitch on the same one-draw mesh (squirrelmodel.js LIFE_MORPHS); the month from
// registerSeasonal tilts the brain's ground pauses. Passive scenery: no sound, names, objects or interaction.
import * as THREE from 'three';
import {SQUIRRELS as C,SQUIRREL_LIFE as SL,SQUIRREL_CLIMB as SCL} from './config.js';
import {registerSeasonal} from './seasons.js';
import {SquirrelBrain,winterMonth} from './squirrelbrain.js';
import {squirrelGeometry,LIFE_MORPHS as LM,tailInfluences} from './squirrelmodel.js';
import {tailWave,scanHead,eatPaws} from './squirrellife.js';
import {siteWind,siteWindOffset} from './sitewind.js';
import {squirrelTrees,squirrelLand} from './squirrelhabitat.js';
// Public #328 (original #2132 8a89f610): the brains climb the trees' drawn trunks and limbs (squirrelclimb.js); upright on a stem it does
// not hop, the haunch offset follows the pitch so the body stays pressed to the bark, and out on a limb it rides the crown's wind sway.
/** Upright on a trunk (climbing up, head first down, or a limb run's stretch round the stem). */
const isClimbing=b=>(b.state==='up'||b.state==='down'||b.state==='limb')&&Math.abs(b.pitch)>.9;
export class Squirrels {
 constructor({scene,camera,feet,crowns,southFeet,ground,forms=[],rnd=Math.random}){
  Object.assign(this,{camera,rnd,time:0,month:new Date().getMonth()+1});this.winter=winterMonth(this.month);
  this.trees=squirrelTrees(feet,crowns,southFeet,ground,forms);const taken=new Set(),material=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.92});
  const env={trees:this.trees,ground,walkable:(x,z)=>squirrelLand(ground,x,z),rnd,player:camera.position,month:()=>this.month};
  this.animals=C.animals.flatMap((spec,i)=>{
   const [x,z]=C.starts[i],g=i===C.animals.length-1?'south':'river',pool=this.trees.map((t,j)=>({j,d:Math.hypot(t.x-x,t.z-z)})).filter(q=>this.trees[q.j].g===g).sort((a,b)=>a.d-b.d),start=pool.find(q=>!taken.has(q.j))?.j??pool[0]?.j;
   if(start===undefined)return[];taken.add(start);const brain=new SquirrelBrain(spec,env,start),geos=[squirrelGeometry(spec),squirrelGeometry(spec,true)],body=new THREE.Mesh(geos[1],material),group=new THREE.Group();
   body.name=`ambient-squirrel-${i}`;body.scale.setScalar(spec.scale);body.position.z=.065*spec.scale;body.raycast=()=>{};group.add(body);group.rotation.order='YXZ';group.visible=false;scene.add(group);return[{brain,body,group,geos,spec,seed:i*7919+13,tail:[],stateT:0,scanN:0,lastState:''}];
  });
  registerSeasonal(month=>{this.month=month;this.winter=winterMonth(month);if(this.winter)this.hide();}); // (#325: the month also tilts the ground pauses)
 }
 hide(){this.animals.forEach(a=>a.group.visible=false);}
 update(dt,hidden=false){
  if(this.winter||hidden){this.hide();return;}this.time+=Number.isFinite(dt)?Math.max(0,dt):0;
  for(const a of this.animals){const b=a.brain,d=Math.hypot(this.camera.position.x-b.x,this.camera.position.z-b.z);a.group.visible=d<C.drawDist;
   if(d<C.simDist)b.update(dt);if(!a.group.visible)continue;
   a.body.geometry=a.geos[d<C.look.near?0:1];const run=b.run,hopPhase=this.time*14+a.spec.scale*9,hop=run&&!isClimbing(b)&&b.state!=='leap'?Math.abs(Math.sin(hopPhase))*.035:0;
   const yaw=b.yaw+(b.state==='perch'?Math.sin(this.time*.9+a.spec.scale*7)*.5:0),back=.065*a.spec.scale;
   const cp=Math.cos(b.pitch),sp=Math.sin(b.pitch); // (#328: the haunch sits `back` behind the brain's point along the body, upright too)
   a.group.position.set(b.x-Math.sin(yaw)*cp*back,b.y-sp*back+hop*a.spec.scale,b.z-Math.cos(yaw)*cp*back);
   if(b.swayK>0&&b.swayAt){const w=siteWindOffset(siteWind,b.swayAt,SCL.sway*b.swayK);a.group.position.x+=w.x;a.group.position.z+=w.z;} // (#328: out on a limb)
   a.group.rotation.set(-(b.pitch+b.rise*1.05),yaw,0,'YXZ');
   const inf=a.body.morphTargetInfluences;inf[0]=b.run?0:Math.max(0,Math.sin(this.time*2.5))**8;inf[1]=Math.max(0,Math.sin(this.time*2))*.5;inf[2]=Math.max(0,-Math.sin(this.time*2))*.5;
   this.poseLife(a,b,dt,hopPhase,inf);
  }
 }
 /** #325 (original #2128): tail wave, scan head, eating paws onto the morph influences (all derived from the brain's state/run/rise/pitch). */
 poseLife(a,b,dt,hopPhase,inf){
  if(b.state!==a.lastState){a.lastState=b.state;a.stateT=0;a.scanN++;}else a.stateT+=Number.isFinite(dt)?Math.max(0,dt):0;
  const R=SL.morph.ref;let pitch=0,paws=SL.morph.tuck*b.rise,morsel=0; // (sitting up, the forepaws are held to the chest)
  if(b.state==='scan'||b.state==='search'){const h=scanHead(a.stateT,a.seed+a.scanN),k=h.yaw/.65;inf[1]=Math.max(0,Math.min(1,k));inf[2]=Math.max(0,Math.min(1,-k));pitch=h.pitch;}
  if(b.state==='eat'){const e=eatPaws(this.time,a.seed);paws=e.fore/SL.eat.fore;morsel=1;pitch+=e.head;inf[1]=inf[2]=0;}
  inf[LM.headPitch]=pitch/R;inf[LM.paws]=paws;inf[LM.morsel]=morsel;
  const leap=b.state==='leap'?Math.max(0,Math.min(1,.5-b.pitch/.9)):null,across=-Math.sin(b.yaw)*siteWind.dir.y+Math.cos(b.yaw)*siteWind.dir.x;
  tailWave(a.tail,{t:this.time,phase:a.seed%6.283,run:isClimbing(b)||b.state==='leap'?0:b.run,hop:hopPhase*2,leap,rise:b.rise,wind:across*siteWind.power});
  tailInfluences(inf,a.tail);
 }
}
