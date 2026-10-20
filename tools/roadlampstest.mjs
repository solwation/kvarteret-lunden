import test from 'node:test';
import assert from 'node:assert/strict';
import { SITE, ROAD_LIGHTS as L } from '../src/config.js';
import { roadLampSpots, lampRoads, roadLampGround } from '../src/roadlamps.js';
import { samples, onRoad, onWalk } from '../src/roads.js';
import { riverAt, deckUnderAt } from '../src/riverbridge.js';
import { inPoly, ringDist, outline } from '../src/paddockgeo.js';
import { parkFillFootprint } from '../src/riverpark.js';
import { onBusStop } from '../src/busstopgeo.js';
const spots=roadLampSpots();
test('deterministic finite roadside coverage across all five mapped regions',()=>{
 assert.deepEqual(spots,roadLampSpots());assert(spots.length>100&&spots.length<190);
 for(const region of ['local','west','north','east','south'])assert(spots.filter(p=>p.region===region).length>=3,region);
 assert(spots.every(p=>[p.x,p.z,p.yaw].every(Number.isFinite)));
});
test('posts keep the actual road strips, walking strips, river, bridge and field free',()=>{
 const ways=['west','north','east','south'].flatMap(k=>[...SITE[k].paths,...SITE[k].access]).concat(SITE.riverPark.paths).filter(p=>p.path);
 for(const p of spots){
  assert(!onRoad(p.x,p.z,L.clear)&&!onWalk(p.x,p.z,L.clear));assert.equal(deckUnderAt(p.x,p.z),null);assert(!inPoly(outline,p.x,p.z));
  assert(!onBusStop(p.x,p.z,L.clear));
  for(const k of ['west','north','east','south'])for(const lot of [...SITE[k].access,...(SITE[k].parking??[])].filter(q=>q.polygon)){assert(!inPoly(lot.polygon,p.x,p.z));assert(ringDist(lot.polygon,p.x,p.z)>=L.clear);}
  const r=riverAt(p.x,p.z);assert(r.distance>=r.width/2+L.waterClear);
  for(const way of ways){const a=samples(way);for(let i=1;i<a.length;i++){
   const v=[a[i].x-a[i-1].x,a[i].z-a[i-1].z],len=Math.hypot(...v),q=[p.x-a[i-1].x,p.z-a[i-1].z],s=(q[0]*v[0]+q[1]*v[1])/len;
   const d=s<=0?Math.hypot(...q):s>=len?Math.hypot(p.x-a[i].x,p.z-a[i].z):Math.abs(q[0]*v[1]-q[1]*v[0])/len;
   assert(d>=way.w/2+L.clear-1e-7,p.source+' / '+way.source);
  }}
 }
});
test('existing fixtures and tree trunks remove colliding candidates without modifying inputs',()=>{
 const existing=spots.slice(0,5).map(p=>({...p})),before=structuredClone(existing),tree=spots[8];
 const p=roadLampSpots([tree],existing);assert.deepEqual(existing,before);
 for(const q of p){assert(Math.hypot(q.x-tree.x,q.z-tree.z)>=L.treeClear);assert(existing.every(e=>Math.hypot(q.x-e.x,q.z-e.z)>=L.duplicateClear));}
 assert(p.length>90);assert(lampRoads().every(r=>r.path&&r.source));
});

test('public buildings, bridge earth ramp and fixture-to-fixture passage stay clear',()=>{
 const buildings=['west','north','east','south'].flatMap(k=>SITE[k].buildings);
 for(const [i,p]of spots.entries()){assert(!parkFillFootprint(p.x,p.z,L.clear));
  for(const b of buildings){assert(!inPoly(b.polygon,p.x,p.z));assert(ringDist(b.polygon,p.x,p.z)>=L.buildingClear);}
  for(const b of SITE.blocks)assert(!(p.x>b.x0-L.buildingClear&&p.x<b.x1+L.buildingClear&&p.z>b.z0-L.buildingClear&&p.z<b.z1+L.buildingClear));
  for(const q of spots.slice(i+1))assert(Math.hypot(p.x-q.x,p.z-q.z)>=L.duplicateClear);
 }
});

test('only new far-south fittings use the existing backdrop plane; the inner callback stays exact',()=>{
 const ground=(x,z)=>10+x*.01+z*.02,actual=roadLampGround(ground),edge=SITE.backgroundGround.z1;
 for(const x of [-330,-20,68,151.23584208326878,164.23884355043856]){assert.equal(actual(x,edge),ground(x,edge));assert.equal(actual(x,edge+1),-3.01);assert.equal(actual(x,100),ground(x,100));}
});
