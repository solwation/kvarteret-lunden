// Public #244: neutral ambient selection from original 131b5d9d. No interaction/runtime services.
import * as THREE from 'three';
import {DuckFlock,DUCKS} from './duckbrain.js';
import {duckHabitat} from './duckhabitat.js';
import {duckModel} from './duckmodel.js';
import {DuckKiss,duckBill} from './duckkiss.js';
import {Hearts} from './ambienthearts.js';
export class Ducks {
 constructor({scene,camera,ground}) {
  this.camera=camera;this.habitat=duckHabitat(ground);this.flock=new DuckFlock(this.habitat);
  const geometries=[duckModel(false),duckModel(true)],mat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:1});
  let seed=DUCKS.social.seed+1846;const random=()=>{seed=seed*16807%2147483647;return seed/2147483647;};
  this.kiss=new DuckKiss({config:DUCKS.kiss,bill:duckBill(geometries[0].attributes.position),habitat:this.habitat,seen:b=>this.kissVisible(b),random,burst:p=>{
   this.kissHearts??=new Hearts(scene,DUCKS.kiss.hearts,DUCKS.kiss.heartScale);this.kissHearts.burst({...p.point,y:p.point.y+DUCKS.kiss.heartLift});}});
  this.animals=this.flock.brains.map(brain=>{const mesh=new THREE.Mesh(geometries[brain.female?1:0],mat);mesh.name=brain.female?'river-duck-female':'river-duck-male';scene.add(mesh);return{brain,mesh};});
  this.update(0,false);
 }
 kissVisible(b){const p=this.camera.position;if(Math.hypot(p.x-b.x,p.y-b.y,p.z-b.z)>Math.min(DUCKS.near,DUCKS.kiss.near))return false;
  this.camera.updateMatrixWorld();const v=(this.kissV??=new THREE.Vector3()).set(b.x,b.y+this.kiss.bill.y,b.z).project(this.camera);return Math.abs(v.x)<1&&Math.abs(v.y)<1&&v.z>-1&&v.z<1;}
 update(dt,hidden){
  dt=Number.isFinite(dt)?Math.min(Math.max(dt,0),DUCKS.maxStep):0;const p=this.camera.position;
  this.kiss.update(dt,this.flock,hidden);
  if(!hidden)this.flock.update(dt,b=>!this.kiss.owns(b)&&Math.hypot(p.x-b.x,p.z-b.z)<DUCKS.near);
  if(this.kissHearts){if(hidden||!this.kiss.pair)this.kissHearts.points.visible=false;else this.kissHearts.update(dt);}
  for(const a of this.animals){const b=a.brain,d=Math.hypot(p.x-b.x,p.z-b.z);a.mesh.visible=!hidden&&d<DUCKS.draw;
   a.mesh.position.set(b.x,b.y+(b.swimming&&!b.kissing?DUCKS.bob*Math.sin(b.phase):0),b.z);
   a.mesh.rotation.set(0,b.yaw,!b.kissing&&!b.swimming&&b.moving?Math.sin(b.phase)*DUCKS.waddle:0,'YXZ');a.mesh.updateMatrixWorld();
  }
 }
}
