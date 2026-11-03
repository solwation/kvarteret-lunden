import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DuckBrain,duckHabitat,DUCKS} from '../src/duckbrain.js';
import {riverAt,waterYAt} from '../src/riverbridge.js';
import {renderedTerrainY} from '../src/surroundings.js';
test('four deterministic ambient ducks roam local river/shore with finite bounded speed and surface contact',()=>{
 const r=riverAt(...DUCKS.habitat.at),h=duckHabitat(r,renderedTerrainY,waterYAt),seen=new Set();
 for(let i=0;i<DUCKS.count;i++){
  const a=new DuckBrain({home:h.home(i),habitat:h,seed:i+1}),b=new DuckBrain({home:h.home(i),habitat:h,seed:i+1});let distance=0;
  for(let j=0;j<6000;j++){
   const x=a.x,y=a.y,z=a.z;a.update(.1);b.update(.1);assert.deepEqual(a,b);assert(h.contains(a.x,a.z));assert.equal(a.y,h.surface(a.x,a.z).y);
   const d=Math.hypot(a.x-x,a.y-y,a.z-z);distance+=d;assert(d<=Math.max(DUCKS.speed,DUCKS.swimSpeed)*.1+1e-6);seen.add(a.swimming?'water':'bank');
  }
  assert(distance>20);for(const dt of [NaN,Infinity,-1]){const before=[a.x,a.y,a.z];a.update(dt);assert.deepEqual([a.x,a.y,a.z],before);}
 }
 assert.deepEqual([...seen].sort(),['bank','water']);
});
test('ambient modules and selected config contain no interaction, audio, storage or service dependencies',()=>{
 for(const name of ['duckbrain','ducks']){
  const s=readFileSync(`src/${name}.js`,'utf8');assert(!/heldBread|feedBread|\blife\b|holdable|audio|sfx|say\(|badge|targets\(|pickable|userData|localStorage|sessionStorage|fetch\(|WebSocket|score/i.test(s));
 }
 assert.deepEqual(Object.keys(DUCKS).sort(),['count','near','draw','speed','swimSpeed','goalReach','stopReach','maxStep','phaseSwim','phaseWalk','bob','waddle','habitat','model'].sort());
});
