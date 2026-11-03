// Public #236: emitted geometry, deterministic scene state and local terrain routes.
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {readFileSync} from 'node:fs';
import {OutdoorCats} from '../src/outdoorcats.js';
import {OUTDOOR_CATS as C} from '../src/config.js';
import {routeSamples} from '../src/outdoorcatroute.js';
import {groundY,renderedTerrainY} from '../src/surroundings.js';
import {onRoad} from '../src/roads.js';
import {waterYAt} from '../src/riverbridge.js';
import {applySeason} from '../src/seasons.js';
const ground=(x,z)=>Math.max(groundY(x,z),renderedTerrainY(x,z));
let now=C.epoch+123;
const camera=new THREE.PerspectiveCamera(),scene=new THREE.Scene(),o=new OutdoorCats({scene,camera,ground,now:()=>now});
assert.equal(o.cats.length,4);let samples=0;
for(const spec of C.cats)for(const [x,z] of routeSamples(spec.route,.25)){samples++;assert(!onRoad(x,z,.1),`road ${x},${z}`);assert(ground(x,z)>waterYAt(x,z)+.3,`water ${x},${z}`);}
for(const c of o.cats){const s=c.brain.scheduled(now);camera.position.set(s.x+1,ground(s.x,s.z)+1,s.z+1);o.update();assert(c.state.near&&c.mesh.visible);const count=c.mesh.geometry.attributes.position.count;assert.equal(count/3,2040);assert(c.mesh.geometry.attributes.position.array.every(Number.isFinite));assert.equal(c.mesh.material.map,null);assert(!c.mesh.userData.door);assert.deepEqual(new THREE.Raycaster().intersectObject(c.mesh),[]);
 const same=new OutdoorCats({scene:new THREE.Scene(),camera,ground,now:()=>now});same.update();assert.deepEqual(same.cats[c.brain.id].state,c.state);assert.deepEqual([...same.cats[c.brain.id].mesh.geometry.attributes.position.array],[...c.mesh.geometry.attributes.position.array]);
 camera.position.set(s.x+C.drawDist+1,ground(s.x,s.z),s.z);o.update();assert(!c.mesh.visible);
}
const first=o.cats[0],s=first.brain.scheduled(now),p=first.brain.plan,leg=p.legs[0];now=C.epoch-first.brain.spec.phase+leg.walk+1;while(first.brain.scheduled(now).activity!=='wash')now+=p.period;camera.position.set(leg.bx+1,ground(leg.bx,leg.bz)+1,leg.bz+1);o.update();const a=first.mesh.geometry.attributes.position.array.slice();now+=.7;o.update();assert(a.some((v,i)=>v!==first.mesh.geometry.attributes.position.array[i]),'near rest pose animates');
const phone=new OutdoorCats({scene:new THREE.Scene(),camera,ground,lowMemory:true,now:()=>now});assert.equal(phone.drawDist,18);const ps=phone.cats[0].brain.scheduled(now);camera.position.set(ps.x+19,ground(ps.x,ps.z),ps.z);phone.update();assert(!phone.cats[0].mesh.visible);o.update();assert(o.cats[0].mesh.visible&&!o.cats[0].state.near);assert.equal(first.mesh.geometry,first.sit);
applySeason(1);o.update();assert(o.cats.every(c=>!c.mesh.visible));applySeason(6);o.update();assert(o.cats[0].mesh.visible);o.update(true);assert(o.cats.every(c=>!c.mesh.visible));
for(const file of ['catpuppet.js','outdoorcats.js','outdoorcatbrain.js','outdoorcatroute.js']){const code=readFileSync('src/'+file,'utf8');assert(!/localStorage|sessionStorage|fetch\(|WebSocket|onPet|onFed|CatSpawner|catLabel|catCards|footprint|sfx\./.test(code),file);}
console.log(JSON.stringify({ok:true,routeSamples:samples,cats:4,trianglesPerCat:2040,drawsPerVisibleCat:1,phoneDraw:18,desktopDraw:32,near:7,checks:'terrain/roads/water; same-time scene+pose; animated rest; one mesh; no raycast/texture; desktop/phone cutoff; winter/hidden; isolated sources'}));
