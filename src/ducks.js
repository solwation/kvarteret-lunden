// Public #235, selected original 578ecc09b02c7355e299fc58d0e0127b622ee85a: ambient flock only.
import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {DuckBrain, duckHabitat, DUCKS} from './duckbrain.js';
import {riverAt,waterYAt} from './riverbridge.js';

// All sizes, flock placement and timing are visual guesses. Four shared low-poly meshes, no lights/shadows.
function model() {
 const parts=[],c=new THREE.Color();
 const blob=(p,s,color)=>{const g=new THREE.SphereGeometry(1,...DUCKS.model.segments);g.deleteAttribute('uv');g.scale(...s);g.translate(...p);const a=new Float32Array(g.attributes.position.count*3);c.setHex(color);for(let i=0;i<a.length;i+=3)c.toArray(a,i);g.setAttribute('color',new THREE.BufferAttribute(a,3));parts.push(g);};
 for(const [p,s,color] of DUCKS.model.blobs)blob(p,s,color);
 for(const side of [-1,1])for(const [p,s,color] of DUCKS.model.paired)blob([side*p[0],p[1],p[2]],s,color);
 const g=mergeGeometries(parts);parts.forEach(p=>p.dispose());return g;
}
export class Ducks {
 constructor({scene,camera,ground}) {
  this.camera=camera;
  const r=riverAt(...DUCKS.habitat.at);
  this.habitat=duckHabitat(r,ground,waterYAt);
  const geo=model(),mat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:1});
  this.animals=Array.from({length:DUCKS.count},(_,i)=>{
   const home=this.habitat.home(i),brain=new DuckBrain({home,habitat:this.habitat,seed:i+1});
   const mesh=new THREE.Mesh(geo,mat);mesh.name='river-duck';scene.add(mesh);
   return{brain,mesh};
  });
  this.update(0,false);
 }
 update(dt,hidden){
  const p=this.camera.position;
  for(const a of this.animals){const b=a.brain,d=Math.hypot(p.x-b.x,p.z-b.z);a.mesh.visible=!hidden&&d<DUCKS.draw;
   if(!hidden&&d<DUCKS.near)b.update(dt);
   a.mesh.position.set(b.x,b.y+(b.swimming ? DUCKS.bob*Math.sin(b.phase) : 0),b.z);
   a.mesh.rotation.set(0,b.yaw,!b.swimming&&b.moving?Math.sin(b.phase)*DUCKS.waddle:0,'YXZ');
   a.mesh.updateMatrixWorld();
  }
 }
}
