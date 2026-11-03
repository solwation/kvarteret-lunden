// Public #238: pure local river motion checked against the public water, bed and bridge piers.
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {readFileSync} from 'node:fs';
import {RIVER_FISH as C} from '../src/config.js';
import {fishSpec,fishAt,ringsAt,fishTime,riverLength,riverPoint,waterAt,bedAt} from '../src/riverfishswim.js';
import {riverAt,waterYAt,riverGround,pierBoxes,riverPath} from '../src/riverbridge.js';
import {RiverFish,fishGeometry} from '../src/riverfish.js';
let samples=0,rings=0,fixture=null;
for(let id=0;id<C.count;id++)for(let t=-360; t<=720; t+=3.1){const f=fishSpec(id,0,C.seed),o=fishAt(f,t);samples++;assert.deepEqual(o,fishAt(f,t));assert(Object.values(o).every(Number.isFinite));const q=riverAt(o.x,o.z);assert(q.distance+f.spec.w/2<q.width/2,`channel ${id}/${t}`);assert(Math.abs(o.water-waterYAt(o.x,o.z))<1e-8);assert.equal(o.bed,riverGround(o.x,o.z,0));assert(o.y>=o.bed&&o.y<o.water);for(const p of pierBoxes()){const dx=o.x-p.x,dz=o.z-p.z;assert(Math.hypot(dx,dz)>p.half+f.spec.len/2,'pier clearance');}
 const rr=ringsAt(f,t);assert.deepEqual(rr,ringsAt(f,t));for(const r of rr){rings++;assert.equal(r.y,waterYAt(r.x,r.z));assert(r.age>=0&&r.age<C.ring.life);if(!fixture&&r.x>-220&&r.x<100&&r.z>80&&r.z<300)fixture={t,id,x:r.x,z:r.z,water:r.y};}}
assert(rings>100&&fixture);
const last=riverPoint(riverLength-1);assert(riverPath.length>20);assert.equal(waterAt(riverLength-1),waterYAt(last.x,last.z));assert.equal(bedAt(riverLength-1),riverGround(last.x,last.z,0));
const camera=new THREE.PerspectiveCamera(),scene=new THREE.Scene(),now=()=>1000*(C.epoch+fixture.t);camera.position.set(fixture.x,fixture.water+3,fixture.z+3);const r=new RiverFish({scene,camera,now});r.update(0);assert(r.fish.visible&&r.rings.visible);assert(r.fish.count<=C.count&&r.rings.count<=C.count*4);assert.equal(scene.children.length,2);assert(r.fish.material.forceSinglePass);assert(scene.children.every(m=>m.isInstancedMesh&&!m.castShadow&&!m.receiveShadow&&!m.material.map&&!m.userData.door));assert.equal(r.catchFish,undefined);assert.equal(r.onCaught,undefined);assert.equal(r.net,undefined);assert.deepEqual(new THREE.Raycaster().intersectObjects(scene.children),[]);
const other=new RiverFish({scene:new THREE.Scene(),camera,now});other.update(0);assert.deepEqual(r.state(),other.state());assert.deepEqual([...r.fish.instanceMatrix.array],[...other.fish.instanceMatrix.array]);assert.deepEqual([...r.rings.instanceMatrix.array],[...other.rings.instanceMatrix.array]);r.update(0,true);assert(!r.fish.visible&&!r.rings.visible);camera.position.set(10000,0,10000);r.update(0);assert(!r.fish.visible&&!r.rings.visible);
for(const file of ['riverfish.js','riverfishswim.js']){const s=readFileSync('src/'+file,'utf8');assert(!/shark|onCaught|catchFish|catchCm|riverfishsync|net\?\.|localStorage|sessionStorage|fetch\(|WebSocket|cloudflare|fishing\.js/.test(s),file);}
const triangles=fishGeometry().attributes.position.count/3,ringTris=(r.rings.geometry.index?.count??r.rings.geometry.attributes.position.count)/3;
console.log(JSON.stringify({ok:true,samples,rings,riverLength,trianglesPerFish:triangles,trianglesPerRing:ringTris,maxDraws:2,drawDist:C.drawDist,fixture,isoTime:new Date(now()).toISOString(),checks:'channel/height/bed/piers; deterministic pure functions+matrices; extended river; fixed birth0; two non-pickable textureless meshes; hidden/distance gates; public boundary'}));
