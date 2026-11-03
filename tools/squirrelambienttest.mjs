import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {SquirrelBrain,climbPoint,perchPoint,winterMonth} from '../src/squirrelbrain.js';
import {SQUIRRELS as C,SEASON} from '../src/config.js';
import {Squirrels} from '../src/squirrels.js';
import * as T from 'three';
const random=()=>{let s=17;return()=>((s=s*16807%2147483647)/2147483647);};
const trees=Array.from({length:4},(_,i)=>({x:i*6,z:0,y:0,cy:5,r:2,g:'river',near:[(i+1)%4]}));
const env=()=>({trees,ground:()=>0,walkable:(x,z)=>z<5&&z>-5,rnd:random(),player:{x:100,z:100}});
test('deterministic ambient cycle hops crowns, climbs, runs/searches on land and flees to a trunk',()=>{
 const e=env(),f=env(),a=new SquirrelBrain(C.animals[0],e,0),b=new SquirrelBrain(C.animals[0],f,0),seen=new Set();
 for(let i=0;i<12000;i++){a.update(.05);b.update(.05);assert.deepEqual([a.x,a.y,a.z,a.state],[b.x,b.y,b.z,b.state]);assert([a.x,a.y,a.z].every(Number.isFinite));seen.add(a.state);if(['forage','search','flee','toTree'].includes(a.state)){assert.equal(a.y,0);assert(e.walkable(a.x,a.z));}}
 for(const k of ['perch','leap','down','forage','search','toTree','up'])assert(seen.has(k),k);
 a.place(climbPoint(a.tr,a.ang,0,e.ground));a.set('search',1);e.player.x=a.x;e.player.z=a.z;a.update(.05);assert(['flee','up'].includes(a.state));
 const p=perchPoint(trees[0],0),top=climbPoint(trees[0],0,1,e.ground);assert(Math.hypot(top.x-p.x,top.y-p.y,top.z-p.z)<1e-9);
});
test('actual renderer host freezes/hides far and winter animals, follows seasons, keeps no interaction/dependency paths',()=>{
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(),feet=[{x:-150,z:215,y:0}],crowns=[{x:-150,z:215,y:5,r:2}];
 const s=new Squirrels({scene,camera,feet,crowns,southFeet:[],ground:()=>0,rnd:random()});assert(s.animals.length>0);s.winter=false;
 camera.position.set(-150,1.6,215);s.update(.05);assert(s.animals.some(a=>a.group.visible));const before=s.animals.map(a=>a.brain.clock);camera.position.set(1000,1,1000);s.update(1);assert.deepEqual(s.animals.map(a=>a.brain.clock),before);assert(s.animals.every(a=>!a.group.visible));
 s.winter=true;camera.position.set(-150,1.6,215);s.update(1);assert.deepEqual(s.animals.map(a=>a.brain.clock),before);assert(s.animals.every(a=>!a.group.visible));
 for(let i=1;i<=12;i++)assert.equal(winterMonth(i),SEASON.snowMonths.includes(i));
 for(const n of ['squirrels','squirrelbrain','squirrelhabitat','squirrelmodel'])assert(!/NutField|holdable|pingping|audio|sfx|squirrelsync|localStorage|sessionStorage|WebSocket|fetch\(|targets\(|pickable|onFeed|hasNut/.test(readFileSync(`src/${n}.js`,'utf8')));
});
