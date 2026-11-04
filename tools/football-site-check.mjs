// Fixed geometry and collision only; no original gameplay dependency.
import assert from 'node:assert/strict';
import {FOOTBALL_SITE as C} from '../src/config.js';
import {buildFootballSite} from '../src/footballmodel.js';
import {footballWorld,footballLocal,onFootballSite,footballFootprints,footballSegments} from '../src/footballgeo.js';
const ground=(x,z)=>3+.012*(x-C.at[0])+.008*(z-C.at[1])+Math.max(0,x-C.at[0])*.01;
ground.grid=()=>({X:[-280,-262,-240],Z:[-40,-21,0]});
const site=buildFootballSite(ground),geometries=site.object.children.map(o=>o.geometry),triangles=geometries.filter(g=>g.attributes.normal).reduce((n,g)=>n+g.attributes.position.count/3,0);
assert.equal(site.object.children.length,2);assert(site.object.children.every(o=>!o.userData.door&&!o.isLight));assert(!('targets'in site)&&!('fountain'in site));assert.equal(site.contacts.length,17);assert.equal(site.supports.length,2);
let error=0;for(const c of site.contacts)error=Math.max(error,Math.abs(c.point[1]-ground(c.point[0],c.point[2])));assert(error<1e-10);
assert.equal(footballFootprints().length,11);assert.equal(footballSegments().length,44);assert.deepEqual(site.segments,footballSegments());
for(const[u,v]of[[-8,-12],[8,12],[0,0],[12,9]]){const[x,z]=footballWorld(C,u,v);const q=footballLocal(C,x,z);assert(Math.hypot(q[0]-u,q[1]-v)<1e-10);assert(onFootballSite(x,z));assert.equal(site.groundAt(x,z),ground(x,z));}
assert(!onFootballSite(...footballWorld(C,13.01,0)));assert.equal(site.groundAt(...footballWorld(C,0,15)),null);
assert(triangles<2500);console.log(JSON.stringify({ok:true,scope:'two fixed batches, no targets/lights/balls; curved contact, exact visible footprints and bounded site support',contacts:site.contacts.length,footprints:11,segments:44,triangles,maxContactError:error},null,2));
