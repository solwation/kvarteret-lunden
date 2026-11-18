// Public #244: neutral ambient selection from original 131b5d9d. No interaction/runtime services.
import * as THREE from 'three';
import {DuckFlock,DUCKS} from './duckbrain.js';
import {duckHabitat} from './duckhabitat.js';
import {duckModel} from './duckmodel.js';
import {DuckKiss,duckBill} from './duckkiss.js';
import {Hearts} from './ambienthearts.js';
import {DuckActivity,duckPose,wakeVertices,wakeVertexCount,DUCK_MOTION} from './duckmotion.js';
import {waterYAt} from './riverbridge.js';
export class Ducks {
 constructor({scene,camera,ground}) {
  this.camera=camera;this.ground=ground;this.habitat=duckHabitat(ground);this.flock=new DuckFlock(this.habitat);
  const geometries=[duckModel(false),duckModel(true)],mat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:1});
  let seed=DUCKS.social.seed+1846;const random=()=>{seed=seed*16807%2147483647;return seed/2147483647;};
  this.kiss=new DuckKiss({config:DUCKS.kiss,bill:duckBill(geometries[0].attributes.position),habitat:this.habitat,seen:b=>this.kissVisible(b),random,burst:p=>{
   this.kissHearts??=new Hearts(scene,DUCKS.kiss.hearts,DUCKS.kiss.heartScale);this.kissHearts.burst({...p.point,y:p.point.y+DUCKS.kiss.heartLift});}});
  this.animals=this.flock.brains.map(brain=>{const mesh=new THREE.Mesh(geometries[brain.female?1:0],mat);mesh.name=brain.female?'river-duck-female':'river-duck-male';scene.add(mesh);
   // Public #323: own seeded behaviour stream, separate from the brain's random sequence (goals stay identical).
   return{brain,mesh,activity:new DuckActivity(brain.seed*31+brain.id+2126),pose:null};});
  this.wake=this.buildWake(scene);
  this.update(0,false);
 }
 kissVisible(b){const p=this.camera.position;if(Math.hypot(p.x-b.x,p.y-b.y,p.z-b.z)>Math.min(DUCKS.near,DUCKS.kiss.near))return false;
  this.camera.updateMatrixWorld();const v=(this.kissV??=new THREE.Vector3()).set(b.x,b.y+this.kiss.bill.y,b.z).project(this.camera);return Math.abs(v.x)<1&&Math.abs(v.y)<1&&v.z>-1&&v.z<1;}
 /** Public #323: one shared transparent ribbon batch for all V wakes; hidden (no draw) whenever no bird leaves a wake. */
 buildWake(scene){
  const n=wakeVertexCount(),arm=DUCK_MOTION.wake.segments,count=this.animals.length,pos=new Float32Array(n*count*3),col=new Float32Array(n*count*4),index=[];
  for(let d=0;d<count;d++)for(let side=0;side<2;side++)for(let i=0;i<arm;i++){const v=d*n+side*(arm+1)*2+i*2;index.push(v,v+2,v+1,v+1,v+2,v+3);}
  const g=new THREE.BufferGeometry(),c=new THREE.Color(DUCK_MOTION.wake.color);
  for(let i=0;i<n*count;i++)col.set([c.r,c.g,c.b,0],i*4);
  g.setAttribute('position',new THREE.BufferAttribute(pos,3).setUsage(THREE.DynamicDrawUsage));
  g.setAttribute('color',new THREE.BufferAttribute(col,4).setUsage(THREE.DynamicDrawUsage));
  g.setAttribute('normal',new THREE.BufferAttribute(new Float32Array(n*count*3).map((_,i)=>i%3===1?1:0),3));
  g.setIndex(index);
  const mesh=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true,transparent:true,depthWrite:false,side:THREE.DoubleSide,forceSinglePass:true,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-2}));
  Object.assign(mesh,{name:'river-duck-wake',frustumCulled:false,visible:false,renderOrder:1});scene.add(mesh);
  return{mesh,alpha:new Float32Array(n),n};
 }
 updateWake(dt,hidden){
  const W=this.wake,g=W.mesh.geometry,pos=g.attributes.position.array,col=g.attributes.color.array,M=DUCK_MOTION.wake;let any=false;
  this.animals.forEach((a,d)=>{
   const s=!hidden&&a.mesh.visible?a.activity.wake:0;
   if(s<=0){if(a.wakeShown){for(let i=0;i<W.n;i++)col[(d*W.n+i)*4+3]=0;a.wakeShown=false;}return;}
   const b=a.brain,mask=a.wakeMask??=new Uint8Array(W.n/2);
   // Bank test (drawn ground above the water hides that part of an arm), refreshed a few times a second per bird.
   const fresh=(a.wakeAge=(a.wakeAge??0)-dt)<=0||!a.wakeShown;
   if(fresh){a.wakeAge=M.maskEvery;a.wakeLevel=waterYAt(b.x,b.z);}
   let k=0;const water=fresh?(x,z)=>(mask[k++]=this.ground(x,z)<a.wakeLevel-M.lift):()=>mask[k++]===1;
   wakeVertices(b,s,a.wakeLevel+M.lift,water,pos.subarray(d*W.n*3,(d+1)*W.n*3),W.alpha);
   for(let i=0;i<W.n;i++)col[(d*W.n+i)*4+3]=W.alpha[i];
   a.wakeShown=any=true;
  });
  if(any||W.mesh.visible)g.attributes.position.needsUpdate=g.attributes.color.needsUpdate=true;
  W.mesh.visible=any;
 }
 update(dt,hidden){
  dt=Number.isFinite(dt)?Math.min(Math.max(dt,0),DUCKS.maxStep):0;const p=this.camera.position;
  // Public #323: a player rushing at a duck startles it into a short take-off (passive scenery only).
  const last=this.lastPlayer??=p.clone(),vx=dt>0?(p.x-last.x)/dt:0,vz=dt>0?(p.z-last.z)/dt:0,T=DUCK_MOTION.takeoff;last.copy(p);
  if(!hidden)for(const a of this.animals){const b=a.brain,dx=b.x-p.x,dz=b.z-p.z,d=Math.hypot(dx,dz),toward=(vx*dx+vz*dz)/(d||1);
   a.activity.update(dt,b,{disturbed:d<T.disturb&&toward<T.maxSpeed&&Math.abs(p.y-b.y)<T.height&&toward>T.disturbSpeed,asleep:d>=DUCKS.near});}
  this.kiss.update(dt,this.flock,hidden);
  if(!hidden)this.flock.update(dt,b=>!this.kiss.owns(b)&&Math.hypot(p.x-b.x,p.z-b.z)<DUCKS.near);
  if(this.kissHearts){if(hidden||!this.kiss.pair)this.kissHearts.points.visible=false;else this.kissHearts.update(dt);}
  for(const a of this.animals){const b=a.brain,d=Math.hypot(p.x-b.x,p.z-b.z);a.mesh.visible=!hidden&&d<DUCKS.draw;
   // Public #323: body-level pose only (the procedural mesh has no neck/head/wing bones).
   const o=a.pose=duckPose(b,a.activity,a.pose??undefined),fwd=o.surge+o.tz;
   a.mesh.position.set(b.x+Math.sin(b.yaw)*fwd,b.y+(b.swimming&&!b.kissing?DUCKS.bob*Math.sin(b.phase):0)+o.lift+o.ty,b.z+Math.cos(b.yaw)*fwd);
   a.mesh.rotation.set(o.pitch,b.yaw,(!b.kissing&&!b.swimming&&b.moving?Math.sin(b.phase)*DUCKS.waddle:0)+o.roll,'YXZ');a.mesh.updateMatrixWorld();
  }
  this.updateWake(dt,hidden);
 }
}
