// Public #237: local ambient animals only, selected original 578ecc09 model/poses and adapted brain.
import * as THREE from 'three';
import {SQUIRRELS as C} from './config.js';
import {registerSeasonal} from './seasons.js';
import {SquirrelBrain,winterMonth} from './squirrelbrain.js';
import {squirrelGeometry} from './squirrelmodel.js';
import {squirrelTrees,squirrelLand} from './squirrelhabitat.js';
export class Squirrels {
 constructor({scene,camera,feet,crowns,southFeet,ground,rnd=Math.random}){
  Object.assign(this,{camera,rnd,time:0,winter:winterMonth(new Date().getMonth()+1)});
  this.trees=squirrelTrees(feet,crowns,southFeet,ground);const taken=new Set(),material=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.92});
  const env={trees:this.trees,ground,walkable:(x,z)=>squirrelLand(ground,x,z),rnd,player:camera.position};
  this.animals=C.animals.flatMap((spec,i)=>{
   const [x,z]=C.starts[i],g=i===C.animals.length-1?'south':'river',pool=this.trees.map((t,j)=>({j,d:Math.hypot(t.x-x,t.z-z)})).filter(q=>this.trees[q.j].g===g).sort((a,b)=>a.d-b.d),start=pool.find(q=>!taken.has(q.j))?.j??pool[0]?.j;
   if(start===undefined)return[];taken.add(start);const brain=new SquirrelBrain(spec,env,start),geos=[squirrelGeometry(spec),squirrelGeometry(spec,true)],body=new THREE.Mesh(geos[1],material),group=new THREE.Group();
   body.name=`ambient-squirrel-${i}`;body.scale.setScalar(spec.scale);body.position.z=.065*spec.scale;body.raycast=()=>{};group.add(body);group.rotation.order='YXZ';group.visible=false;scene.add(group);return[{brain,body,group,geos,spec}];
  });
  registerSeasonal(month=>{this.winter=winterMonth(month);if(this.winter)this.hide();});
 }
 hide(){this.animals.forEach(a=>a.group.visible=false);}
 update(dt,hidden=false){
  if(this.winter||hidden){this.hide();return;}this.time+=Number.isFinite(dt)?Math.max(0,dt):0;
  for(const a of this.animals){const b=a.brain,d=Math.hypot(this.camera.position.x-b.x,this.camera.position.z-b.z);a.group.visible=d<C.drawDist;
   if(d<C.simDist)b.update(dt);if(!a.group.visible)continue;
   a.body.geometry=a.geos[d<C.look.near?0:1];const run=b.run,hop=run&&!['down','up','leap'].includes(b.state)?Math.abs(Math.sin(this.time*14+a.spec.scale*9))*.035:0;
   const yaw=b.yaw+(b.state==='perch'?Math.sin(this.time*.9+a.spec.scale*7)*.5:0),back=.065*a.spec.scale;
   a.group.position.set(b.x-Math.sin(yaw)*back,b.y+hop*a.spec.scale,b.z-Math.cos(yaw)*back);a.group.rotation.set(-b.pitch,yaw,0,'YXZ');
   const inf=a.body.morphTargetInfluences;inf[0]=b.run?0:Math.max(0,Math.sin(this.time*2.5))**8;inf[1]=Math.max(0,Math.sin(this.time*2))*.5;inf[2]=Math.max(0,-Math.sin(this.time*2))*.5;
  }
 }
}
