// Public #243: passive geometry, source budget, fixed footprints and public boundary.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {buildOutdoorGym,gymSolids,gymSegments,gymPoint} from '../src/outdoorgym.js';
import {gymLandscapeSolids} from '../src/outdoorgymdecor.js';
import {OUTDOOR_GYM as C} from '../src/config.js';
import {groundBelowDeckY} from '../src/surroundings.js';
import {farSegments} from '../src/farwalk.js';
const group=buildOutdoorGym(groundBelowDeckY),count=g=>g.children.reduce((n,m)=>n+m.geometry.attributes.position.count/3,0);
assert.equal(group.children.length,4);assert.equal(count(group),4404);assert.equal(new Set(group.children.map(m=>m.material)).size,4);
assert.equal(group.children.filter(m=>m.material.map).length,1);const texture=group.getObjectByName('gym-gravel').material.map;assert.equal(texture.image.width,64);assert.equal(texture.image.height,64);
assert.equal(group.userData.supports.length,12);for(const p of group.userData.supports){assert(p.bottom<groundBelowDeckY(p.x,p.z));assert(p.top>groundBelowDeckY(p.x,p.z));}
assert.deepEqual(group.userData.landscape.polys,gymLandscapeSolids(gymPoint));assert.equal(gymSolids().length,58);assert.equal(gymSegments().length,232);
const all=farSegments();for(const s of gymSegments())assert(all.some(t=>JSON.stringify(s)===JSON.stringify(t)),'fixed drawn fitting registered in public collision');
const pad=group.getObjectByName('gym-gravel').geometry.attributes.position;let minGap=Infinity;for(let i=0;i<pad.count;i+=3){const x=(pad.getX(i)+pad.getX(i+1)+pad.getX(i+2))/3,z=(pad.getZ(i)+pad.getZ(i+1)+pad.getZ(i+2))/3,y=(pad.getY(i)+pad.getY(i+1)+pad.getY(i+2))/3;minGap=Math.min(minGap,y-groundBelowDeckY(x,z));}assert(minGap>.01);
assert.equal(C.geometry.press.logY,.95);assert.deepEqual(C.stations.map(s=>Object.keys(s)),Array(3).fill(['id','x','z']));
for(const file of['src/outdoorgym.js','src/outdoorgymdecor.js'])assert(!/\b(?:Rest|REST|targets|pickable|repetitions|GymEffort|onRep|localStorage|sessionStorage|WebSocket|fetch|requestAnimationFrame|bestiary)\b/.test(readFileSync(file,'utf8')),file);
// Same public terrain input, previous public builder/config; no original private file enters this fixture.
const baseline='47140cbdfc32fbd2fb75978092fa0787bfc25a7c',oldConfig=execFileSync('git',['show',baseline+':src/config.js'],{encoding:'utf8'}),literal=oldConfig.split('export const OUTDOOR_GYM = ')[1].split('\n\n// #1815:')[0].replace(/;\s*$/,''),data=s=>'data:text/javascript;base64,'+Buffer.from(s).toString('base64');
const configURL=data('export const OUTDOOR_GYM = '+literal+';');let source=execFileSync('git',['show',baseline+':src/outdoorgym.js'],{encoding:'utf8'});source=source.replace("'three'",JSON.stringify(import.meta.resolve('three'))).replace("'three/addons/utils/BufferGeometryUtils.js'",JSON.stringify(import.meta.resolve('three/addons/utils/BufferGeometryUtils.js'))).replace("'./config.js'",JSON.stringify(configURL));const old=await import(data(source)),before=old.buildOutdoorGym(groundBelowDeckY);assert.equal(count(before),840);
console.log(JSON.stringify({ok:true,baseline,before:{batches:before.children.length,triangles:count(before)},after:{batches:group.children.length,triangles:count(group)},delta:{batches:1,triangles:3564},materials:4,textureBytes:texture.image.data.byteLength,lights:0,polygons:58,segments:232,minGravelGap:minGap,passiveOnly:true}));
