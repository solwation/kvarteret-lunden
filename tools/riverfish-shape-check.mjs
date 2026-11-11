import assert from 'node:assert/strict';
import * as THREE from 'three';
import {fishGeometry,RiverFish} from '../src/riverfish.js';
import {RIVER_FISH as C} from '../src/config.js';
import {fishSpec,fishAt} from '../src/riverfishswim.js';
const geometry=fishGeometry(),size=geometry.boundingBox.getSize(new THREE.Vector3()),center=geometry.boundingBox.getCenter(new THREE.Vector3());
for(const axis of ['x','y','z']){assert(Math.abs(size[axis]-1)<1e-7);assert(Math.abs(center[axis])<1e-7);}
assert.equal(geometry.index.count/3,433);
for(const name of ['position','normal','color'])for(const v of geometry.attributes[name].array)assert(Number.isFinite(v));
for(let i=0;i<geometry.attributes.normal.count;i++){const n=new THREE.Vector3().fromBufferAttribute(geometry.attributes.normal,i);assert(Math.abs(n.length()-1)<1e-6);}
const col=geometry.attributes.color;let dark=false,light=false;
for(let i=0;i<col.count;i++){assert.equal(col.getX(i),col.getY(i));assert.equal(col.getX(i),col.getZ(i));dark ||= col.getX(i)<.1;light ||= col.getX(i)>.8;}assert(dark&&light);
for(const spec of C.species){
 const scaled=geometry.clone().scale(spec.w,spec.h,spec.len);scaled.computeBoundingBox();const s=scaled.boundingBox.getSize(new THREE.Vector3());
 for(const [axis,dim] of [['x','w'],['y','h'],['z','len']])assert(Math.abs(s[axis]-spec[dim])<1e-7);scaled.dispose();
}
// Actual renderer matrices retain their existing rise/underwater factors, applied once.
let checked=0;const time=-360,camera=new THREE.PerspectiveCamera(),scene=new THREE.Scene(),fish=new RiverFish({scene,camera,now:()=>1000*(C.epoch+time)});
for(let id=0;id<C.count;id++){
 const f=fishSpec(id),o=fishAt(f,time);camera.position.set(o.x,o.water+2,o.z);fish.update(0);
 const at=fish.shown.findIndex(v=>v.id===id);assert(at>=0);const matrix=new THREE.Matrix4();fish.fish.getMatrixAt(at,matrix);
 const scale=new THREE.Vector3(),p=new THREE.Vector3(),q=new THREE.Quaternion();matrix.decompose(p,q,scale);
 const expected=[f.spec.w*(C.look.wide+(1-C.look.wide)*o.rise),f.spec.h*(C.look.flat+(1-C.look.flat)*o.rise),f.spec.len];
 for(const [i,axis] of ['x','y','z'].entries())assert(Math.abs(scale[axis]-expected[i])<1e-6);checked++;
}
console.log(JSON.stringify({ok:true,unitSize:size.toArray(),center:center.toArray(),triangles:433,vertices:geometry.attributes.position.count,normalCount:geometry.attributes.normal.count,species:C.species.length,actualMatrices:checked,maxFishTriangles:433*C.count,maxFishDraws:1,maxRingDraws:1}));
