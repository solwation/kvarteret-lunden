// Public #234: fixed station geometry, support, collision and bounded material cost.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildOutdoorGym,gymSolids,gymSegments,gymPoint} from '../src/outdoorgym.js';
import {OUTDOOR_GYM as C} from '../src/config.js';
import {groundBelowDeckY} from '../src/surroundings.js';
import {farSegments} from '../src/farwalk.js';
const group=buildOutdoorGym(groundBelowDeckY);
assert.deepEqual(group.children.map(c=>c.name),['gym-wood','gym-steel','gym-chips']);
const triangles=group.children.reduce((n,m)=>n+m.geometry.attributes.position.count/3,0);
assert(triangles<2200,`${triangles} triangles`);
assert.equal(new Set(group.children.map(m=>m.material)).size,3);
assert(group.children.every(m=>!m.material.map),'no new texture dependency');
assert.equal(group.userData.supports.length,12);
for(const p of group.userData.supports){assert(p.bottom<groundBelowDeckY(p.x,p.z));assert(p.top>groundBelowDeckY(p.x,p.z));}
const pad=group.getObjectByName('gym-chips').geometry.attributes.position;
let minGap=Infinity;
for(let i=0;i<pad.count;i+=3){const x=(pad.getX(i)+pad.getX(i+1)+pad.getX(i+2))/3,z=(pad.getZ(i)+pad.getZ(i+1)+pad.getZ(i+2))/3,y=(pad.getY(i)+pad.getY(i+1)+pad.getY(i+2))/3;minGap=Math.min(minGap,y-groundBelowDeckY(x,z));}
assert(minGap>.01,`chips above terrain ${minGap}`);
assert.equal(gymSolids().length,6);assert.equal(gymSegments().length,24);
const all=farSegments();for(const s of gymSegments())assert(all.some(t=>JSON.stringify(s)===JSON.stringify(t)),'fixed segment registered in public collision');
for(const s of C.stations){const[x,z]=gymPoint(s.x,s.z);assert(Math.hypot(x-C.at[0],z-C.at[1])<7);}
const source=readFileSync('src/outdoorgym.js','utf8');
assert(!/\b(?:Rest|REST|targets|pickable|repetitions|localStorage|sessionStorage|WebSocket|fetch|requestAnimationFrame)\b/.test(source));
console.log(JSON.stringify({ok:true,stations:3,batches:3,triangles,supports:12,solidPolygons:6,collisionSegments:24,minChipGap:minGap,noTargetsOrRuntimeState:true}));
