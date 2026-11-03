// Neutral adaptation of outdoorcats.js/createCatPuppet at original 578ecc09b02c7355e299fc58d0e0127b622ee85a.
// Four local-clock scenery animals. No targets, storage, audio, feeding or near-cat promotion.
import * as THREE from 'three';
import { OUTDOOR_CATS as C, SEASON } from './config.js';
import { createCatPuppet } from './catpuppet.js';
import { OutdoorCatBrain } from './outdoorcatbrain.js';
import { registerSeasonal } from './seasons.js';

const material=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.8});
/** A fixed-topology merged rig: near poses update existing CPU buffers, far poses are cached.
 * This preserves the procedural source silhouette without a draw call for each limb/eye. */
function mergedRig(p){
 const parts=[];let count=0;p.object.traverse(o=>{if(!o.isMesh)return;const n=o.geometry.index?.count??o.geometry.attributes.position.count;parts.push({o,start:count,n});count+=n;});
 const g=new THREE.BufferGeometry();for(const key of ['position','normal','color'])g.setAttribute(key,new THREE.Float32BufferAttribute(new Float32Array(count*3),3));
 const v=new THREE.Vector3(),n=new THREE.Vector3(),normal=new THREE.Matrix3();
 const write=()=>{p.object.updateMatrixWorld(true);for(const {o,start,n:len} of parts){const src=o.geometry,idx=src.index,visible=o.visible&&o.parent.visible;normal.getNormalMatrix(o.matrixWorld);
  for(let i=0;i<len;i++){const j=idx?idx.getX(i):i;v.fromBufferAttribute(src.attributes.position,j).applyMatrix4(o.matrixWorld);n.fromBufferAttribute(src.attributes.normal,j).applyMatrix3(normal).normalize();if(!visible)v.set(0,0,0);g.attributes.position.setXYZ(start+i,v.x,v.y,v.z);g.attributes.normal.setXYZ(start+i,n.x,n.y,n.z);g.attributes.color.setXYZ(start+i,o.material.color.r,o.material.color.g,o.material.color.b);}}
  g.attributes.position.needsUpdate=true;g.attributes.normal.needsUpdate=true;};
 write();g.computeBoundingSphere();return {geometry:g,write};
}

/** Visual pose only: a deterministic absolute-clock walk, wash, look or sleep. */
function pose(p,s,t){
 p.walked=s.walking;p.stand=p.wantStand=s.walking?1:0;p.gaitAmp=s.walking?1:0;p.gaitPhase=t*C.speed/.3*2*Math.PI;p.headOff.set(0,0,0);
 p.shoulder.rotation.set(0,0,0);p.leftShoulder.rotation.set(0,0,0);p.head.rotation.set(0,0,0);
 for(const e of p.eyes){e.eye.visible=s.activity!=='sleep';e.shut.visible=s.activity==='sleep';}
 if(s.walking){p.head.rotation.x=.12;p.tailGroup.rotation.y=.3*Math.sin(t*4.5);}
 else if(s.activity==='wash'){
  // Source's ordinary washing cycle; no pet/food behavior.
  const cy=t%6,sm=(a,b,x)=>THREE.MathUtils.smoothstep(x,a,b),u=sm(0,.5,cy)*(1-sm(3.2,3.7,cy)),wipe=sm(2,2.4,cy)*(1-sm(2.9,3.2,cy)),lick=Math.sin(t*13)*.5+.5;
  p.shoulder.rotation.set(-2.85*u-.25*wipe,0,.3*u+.15*wipe);p.head.rotation.set(.3*u+.08*lick*u*(1-wipe)-.2*wipe,.4*u*(1-wipe)+(1-u)*.35*Math.sin(t*.7),-.15*u+.3*wipe);p.tailGroup.rotation.y=.08*Math.sin(t*2.3)*(1-u);
 }else{p.head.rotation.set(s.activity==='sleep'?.5:0,s.activity==='sleep'?.15:.45*Math.sin(t*.6),s.activity==='sleep'?.1:0);p.tailGroup.rotation.y=s.activity==='sleep'?0:.08*Math.sin(t*2.3);}
 p.pose(0);
}
export class OutdoorCats{
 constructor({scene,camera,ground,lowMemory=false,now=()=>Date.now()/1000}){
  Object.assign(this,{camera,ground,now,drawDist:lowMemory?C.drawDistPhone:C.drawDist,winter:false});
  this.cats=C.cats.map((spec,id)=>{const brain=new OutdoorCatBrain(spec,id),p=createCatPuppet(spec.color);
   pose(p,{walking:false,activity:'look'},0);const sit=mergedRig(p).geometry;
   pose(p,{walking:true,activity:'walk'},0);const walk=mergedRig(p).geometry;
   const rig=mergedRig(p),mesh=new THREE.Mesh(rig.geometry,material);mesh.name=`ambient-cat-${id}`;mesh.visible=false;mesh.raycast=()=>{};mesh.userData.noDetail=true;scene.add(mesh);
   return {brain,p,rig,mesh,sit,walk,state:null};});
  registerSeasonal(month=>{this.winter=SEASON.snowMonths.includes(month);});
 }
 update(hidden=false){const now=this.now();for(const c of this.cats){const s=c.brain.scheduled(now),y=this.ground(s.x,s.z),d=Math.hypot(this.camera.position.x-s.x,this.camera.position.y-y,this.camera.position.z-s.z);
  const visible=!hidden&&!this.winter&&Number.isFinite(y)&&d<this.drawDist,near=visible&&d<C.near;c.state={...s,y,visible,near};c.mesh.visible=visible;if(!visible)continue;
  c.mesh.position.set(s.x,y,s.z);c.mesh.rotation.y=s.yaw;
  if(near){pose(c.p,s,now-C.epoch+c.brain.spec.phase);c.rig.write();c.mesh.geometry=c.rig.geometry;}else c.mesh.geometry=s.walking?c.walk:c.sit;
 }}
}
