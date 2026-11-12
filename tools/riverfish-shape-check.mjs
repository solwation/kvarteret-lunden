import assert from 'node:assert/strict';
import * as THREE from 'three';
import {fishGeometry,RiverFish} from '../src/riverfish.js';
import {RIVER_FISH as C} from '../src/config.js';
import {riverFishNeutralGeometry} from '../src/riverfishmodel.js';
import {decodedFish} from './riverfish274decode.mjs';
import {fishSpec,fishAt} from '../src/riverfishswim.js';
const geometry=fishGeometry(),size=geometry.boundingBox.getSize(new THREE.Vector3()),center=geometry.boundingBox.getCenter(new THREE.Vector3());
for(const axis of ['x','y','z']){assert(Math.abs(size[axis]-1)<1e-7);assert(Math.abs(center[axis])<1e-7);}
assert.equal(geometry.index.count/3,411);
for(const attribute of Object.values(geometry.attributes))assert(attribute.array.every(Number.isFinite));
assert.equal(geometry.attributes.normal,undefined); // no retained Float32 normal copies; normals are decoded from oct targets
let deformedVertices=0;
const col=geometry.attributes.color;let dark=false,light=false;
for(let i=0;i<col.count;i++){assert.equal(col.getX(i),col.getY(i));assert.equal(col.getX(i),col.getZ(i));dark ||= col.getX(i)<.1;light ||= col.getX(i)>.8;}assert(dark&&light);
for(const [kind,spec] of C.species.entries()){
 const neutral=riverFishNeutralGeometry(spec.name);for(let i=0;i<neutral.attributes.normal.count;i++){const n=new THREE.Vector3().fromBufferAttribute(neutral.attributes.normal,i);assert(n.length()<1e-6||Math.abs(n.length()-1)<1e-6)}
 for(const phase of[0,.9,3,6.27])for(const up of[0,1]){const decoded=decodedFish(geometry,kind,phase,.3);assert(decoded.positions.every(Number.isFinite));assert(decoded.normals.every(Number.isFinite));const matrix=new THREE.Matrix4().makeScale(spec.w*(C.look.wide+(1-C.look.wide)*up),spec.h*(C.look.flat+(1-C.look.flat)*up),spec.len),normalMatrix=new THREE.Matrix3().getNormalMatrix(matrix),camera=new THREE.PerspectiveCamera(65,1,.01,100);camera.position.set(1,1,2);camera.lookAt(0,0,0);camera.updateMatrixWorld(true);for(let i=0;i<decoded.positions.length;i+=3){const point=new THREE.Vector3(...decoded.positions.slice(i,i+3)).applyMatrix4(matrix).project(camera),normal=new THREE.Vector3(...decoded.normals.slice(i,i+3)).applyNormalMatrix(normalMatrix);assert([...point,...normal].every(Number.isFinite));assert(Math.abs(normal.length()-1)<1e-6);deformedVertices++}}
 const scaled=neutral.scale(spec.w,spec.h,spec.len);scaled.computeBoundingBox();const s=scaled.boundingBox.getSize(new THREE.Vector3());
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
console.log(JSON.stringify({ok:true,unitSize:size.toArray(),center:center.toArray(),triangles:411,vertices:geometry.attributes.position.count,decodedDeformedVertices:deformedVertices,species:C.species.length,actualMatrices:checked,maxFishTriangles:411*C.count,maxFishDraws:1,maxRingDraws:1}));
