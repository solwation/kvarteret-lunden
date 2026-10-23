import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import { SITE, WALK } from '../src/config.js';
import { pathStrip, isVehicleWay } from '../src/roads.js';
import { subtractConvex } from '../src/polygoncut.js';
import {lampRoads,roadLampSpots} from '../src/roadlamps.js';

const ring=SITE.south.access.find(r=>r.source==='95036048'),foot=SITE.south.access.find(r=>r.source==='199056947');
// Reviewed primary excerpt: ed5a7b251d649f45cc9a182868b57f450e9a2e4e, OSM snapshot2026-10-08.
// © OpenStreetMap contributors, ODbL: https://www.openstreetmap.org/copyright
const source={"features":[{"id":"95036048","tags":{"highway":"service"},"points":[[13.1776269,55.6823434],[13.1774712,55.6823657],[13.1763497,55.6826326],[13.175838,55.6827536],[13.1752909,55.682883],[13.1743707,55.6831003],[13.1742567,55.683127],[13.1741746,55.6831479],[13.1741482,55.6831598],[13.1741312,55.6831742],[13.1741171,55.6831948],[13.1741182,55.6832204],[13.1745144,55.6837437],[13.1755548,55.6834955],[13.1763995,55.6832985],[13.1764582,55.6832856],[13.1775533,55.6830209]]},{"id":"199056947","tags":{"highway":"footway"},"points":[[13.1767079,55.6836198],[13.1764582,55.6832856]]}]};
const project=([lon,lat])=>{const a=SITE.geo.anchor,c=Math.cos(58*Math.PI/180),s=Math.sin(58*Math.PI/180),e=(lon-a.lon)*111319.49*Math.cos(a.lat*Math.PI/180),n=(lat-a.lat)*111319.49;return[Math.round((a.x+e*c-n*s)*100)/100,Math.round((a.z-e*s-n*c)*100)/100]};
const plan=f=>f.points.map(project);
const length=r=>r.path.slice(1).reduce((s,p,i)=>s+Math.hypot(p[0]-r.path[i][0],p[1]-r.path[i][1]),0);
const area=p=>Math.abs(p.reduce((s,a,i)=>{const b=p[(i+1)%p.length];return s+a[0]*b[2]-b[0]*a[2]},0))/2;
const triangles=g=>{const p=g.attributes.position;return Array.from({length:p.count/3},(_,i)=>[0,1,2].map(j=>[p.getX(i*3+j),p.getY(i*3+j),p.getZ(i*3+j)]))};
const outline=(polygon,holes=[])=>{const r=q=>q.slice(0,-1).map(([x,z])=>new T.Vector2(x,z)),outer=r(polygon),inner=holes.map(r),all=[...outer,...inner.flat()];return T.ShapeUtils.triangulateShape(outer,inner).map(t=>t.map(i=>[all[i].x,all[i].y]))};
const overlap=(tri,cutters)=>{let result=[tri];for(const c of cutters)result=result.flatMap(p=>subtractConvex(p,c));return area(tri)-result.reduce((a,p)=>a+area(p),0)};
const has=(path,q)=>path.some(([x,z])=>x===q[0]&&z===q[1]);
const way=id=>[...SITE.south.paths,...SITE.south.access].find(r=>r.source===id);

test('outer service ring and footway follow the whole saved OSM ways with guessed dimensions and their own types',()=>{
 for(const [road,highway,w,len] of [[ring,'service',4.5,514.2255],[foot,'footway',2,40.3685]]){
  const raw=source.features.find(f=>f.id===road.source);
  assert.deepEqual(raw.tags,{highway});assert.equal(road.highway,highway);assert.equal(road.w,w);
  assert.equal(road.surface,'asphalt');assert.equal(road.widthSource,'guess');assert.equal(road.surfaceSource,'guess');assert.equal(road.terrain,'triangles');
  assert.deepEqual(road.path,plan(raw));assert(Math.abs(length(road)-len)<.01,road.source+' '+length(road));
  assert(road.path.every(([,z])=>z>WALK.z1));
 }
 assert(isVehicleWay(ring));assert(!isVehicleWay(foot),'the footway keeps footway semantics');assert.equal(WALK.z1,250);
});

test('ring and footway join existing ways only at mapped nodes',()=>{
 const main=way('36918924');
 assert.deepEqual(ring.path[0],[167.1,334.61]);assert.deepEqual(ring.path.at(-1),[100.69,298.56]);
 assert(has(main.path,ring.path[0])&&has(main.path,ring.path.at(-1)),'both source ends on 36918924');
 for(const[id,node]of[['145221614',[-10.57,376.93]],['145221614',[68.88,405.62]],['145221592',[38.47,427.1]],['145221599',[36.11,343.59]],['145221612',[-68.6,417.65]]])
  assert(has(way(id).path,node)&&has(ring.path,node),id+' '+node);
 assert.deepEqual(foot.path,[[16.04,308.22],[39.28,341.23]]);assert(has(way('145221576').path,foot.path[0]));assert(has(ring.path,foot.path[1]));
});

test('complete emitted strips clear southern buildings and woodland plus tree margin',()=>{
 const buildings=SITE.south.buildings.map(b=>({b,tris:outline(b.polygon,b.holes??[])})),forests=SITE.south.forests.map(f=>({f,tris:outline(f.polygon)}));
 for(const road of [ring,foot]){
  const g=pathStrip(road,w=>-w/2,w=>w/2,.025,()=>0),wide=pathStrip({...road,w:road.w+1},w=>-w/2,w=>w/2,.025,()=>0);
  for(const tri of triangles(g))for(const{b,tris}of buildings)assert(overlap(tri,tris)<1e-7,road.source+' overlaps building '+b.name);
  for(const tri of triangles(wide))for(const{f,tris}of forests)assert(overlap(tri,tris)<1e-7,road.source+' plus tree margin overlaps forest '+f.source);
  g.dispose();wide.dispose();
 }
});

test('the delivered four-node prefix is preserved and the 2m footway receives no road lamps',()=>{
 assert.deepEqual(ring.path.slice(0,4),[[167.1,334.61],[159.81,341.58],[97.32,385.52],[68.88,405.62]]);
 assert.equal(SITE.south.access.filter(r=>r.source==='95036048').length,1);assert.equal(SITE.south.access.filter(r=>r.source==='199056947').length,1);
 assert(lampRoads().some(r=>r.source===ring.source));assert(!lampRoads().some(r=>r.source===foot.source));assert(!roadLampSpots([],[]).some(p=>p.source===foot.source));
});
