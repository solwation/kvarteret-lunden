// Public #239: actual neutral schedule/geometry and instrumented off-window short circuit.
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {readFileSync} from 'node:fs';
import {BALLOON as B} from '../src/config.js';
import {balloonScale,balloonPos} from '../src/balloongeo.js';
import {Balloon,balloonGeometry,stripeAt} from '../src/balloon.js';
for(const t of [-B.period,0,B.window,B.period,B.period+B.window])assert.equal(balloonScale(t),0);
for(const t of [B.fadeIn,100,B.window-B.fadeIn])assert.equal(balloonScale(t),1);
for(const t of [1,12,B.window-12,B.window-1])assert(balloonScale(t)>0&&balloonScale(t)<1);
for(const t of [-1e7,0,123,1e7]){const p=balloonPos(t);assert.deepEqual(p,balloonPos(t));assert(Math.abs(Math.hypot(p.x-B.center.x,p.z-B.center.z)-B.radius)<1e-10);assert.equal(p.y,B.floor);}
const scene=new THREE.Scene();let now=60;const o=new Balloon({scene,clock:()=>now}),camera=new THREE.PerspectiveCamera();o.update(camera);assert(o.mesh.visible);const initial=o.mesh.position.clone(),matrix=o.mesh.matrix.elements.slice();now+=2;o.update(camera);assert(o.mesh.position.distanceTo(initial)>6.9);assert.notDeepEqual(o.mesh.matrix.elements,matrix);
const other=new Balloon({scene:new THREE.Scene(),clock:()=>now});other.update(camera);assert.deepEqual(o.mesh.matrix.elements,other.mesh.matrix.elements);
// Off-window must not even touch camera, position, scale or matrix work.
now=B.window+1;const original=o.mesh.position,scale=o.mesh.scale,update=o.mesh.updateMatrix;
o.mesh.updateMatrix=()=>assert.fail('off-window matrix work');Object.defineProperty(o.mesh,'position',{get(){assert.fail('off-window position access');},configurable:true});Object.defineProperty(o.mesh,'scale',{get(){assert.fail('off-window scale access');},configurable:true});o.update(new Proxy({},{get(){assert.fail('off-window camera access');}}));assert(!o.mesh.visible);
Object.defineProperty(o.mesh,'position',{value:original,configurable:true});Object.defineProperty(o.mesh,'scale',{value:scale,configurable:true});o.mesh.updateMatrix=update;
now=60;camera.position.set(B.center.x+B.radius+B.far+1,0,B.center.z);o.update(camera);assert(!o.mesh.visible);camera.position.set(0,0,0);o.update(camera,true);assert(!o.mesh.visible);
const g=balloonGeometry();assert.equal(g.attributes.position.count/3,996);assert(g.attributes.position.array.every(Number.isFinite));assert.equal(scene.children.length,1);assert.equal(o.mesh.children.length,0);assert(!o.mesh.castShadow&&!o.mesh.receiveShadow&&!o.mesh.material.map&&!o.mesh.userData.door&&!o.mesh.material.transparent);assert.deepEqual(new THREE.Raycaster().intersectObject(o.mesh),[]);assert(!o.mesh.matrixAutoUpdate);
for(let i=0;i<B.stripes;i++)assert.equal(stripeAt(-Math.PI+(i+.5)*Math.PI*2/B.stripes),i%B.rainbow.length);
const geo=await import('../src/balloongeo.js');assert.deepEqual(Object.keys(geo).sort(),['balloonPos','balloonScale']);for(const f of ['balloon.js','balloongeo.js'])assert(!/basketFloor|basketCollide|basketCarries|player|aboard|beers|beerGroup|stock|appearance\(|localStorage|sessionStorage|fetch\(|WebSocket|sync\./.test(readFileSync('src/'+f,'utf8')),f);
console.log(JSON.stringify({ok:true,triangles:996,draws:1,children:0,schedule:{period:B.period,window:B.window,fade:B.fadeIn},configGuess:{floor:B.floor,far:B.far},checks:'window edges/fades/negative time; deterministic circle+render matrix; active motion; off-window zero camera/position/scale/matrix access; distance/hidden; neutral one mesh/material; no raycast/shadow/texture/physics/services/storage'}));
