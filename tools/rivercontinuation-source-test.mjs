// Public #231: selected OSM source, preserved public configuration/station levels and fog endpoints.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {SITE,EDGE_BACKDROP as E,WALK} from '../src/config.js';
import {riverAt,waterYAt,riverPath} from '../src/riverbridge.js';
const base='995ea013c450e567c87b68dfe6f6c14e614105df';
const before=p=>execFileSync('git',['show',`${base}:${p}`],{encoding:'utf8'});
const prior=await import('data:text/javascript;base64,'+Buffer.from(before('src/config.js')).toString('base64'));
const oldText=before('src/riverbridge.js').replace(/from\s+(['"])([^'"]+)\1/g,(_,q,p)=>`from ${q}${p.startsWith('.')?new URL(p,new URL('../src/riverbridge.js',import.meta.url)).href:import.meta.resolve(p)}${q}`);
const old=await import('data:text/javascript;base64,'+Buffer.from(oldText).toString('base64'));
const {upstream,downstream,...retained}=SITE.river;
const {upstream:oldUp,...oldRetained}=prior.SITE.river;
assert.deepEqual(retained,oldRetained);assert.deepEqual({...upstream,boundary:undefined},{...oldUp,boundary:undefined});
for(const key of ['bridges','backgroundGround','south'])assert.deepEqual(SITE[key],prior.SITE[key],key);
// Use the current public navigation rectangle for fog coverage, including independently reviewed expansions.
for(const p of SITE.river.path){for(const key of ['along','bank','distance','width','valley','x','z'])assert.equal(riverAt(...p)[key],old.riverAt(...p)[key],key);assert.equal(waterYAt(...p),old.waterYAt(...p));}
assert.deepEqual(riverPath.slice(0,25),SITE.river.path);
const source=JSON.parse(readFileSync('docs/references/surrounding-views/river-137217705-2026-10-08.json')).feature;
const a=SITE.geo.anchor,r=58*Math.PI/180;
const points=source.points.map(([lon,lat])=>{const e=(lon-a.lon)*111319.49*Math.cos(a.lat*Math.PI/180),n=(lat-a.lat)*111319.49;return[a.x+e*Math.cos(r)-n*Math.sin(r),a.z-e*Math.sin(r)-n*Math.cos(r)];});
for(const p of [...downstream.path.slice(0,-1),...E.rivers[0].path.slice(1),...E.rivers[1].path.slice(1,-1)])assert(points.some(q=>Math.hypot(p[0]-q[0],p[1]-q[1])<.008),`OSM vertex ${p}`);
for(const r of E.rivers){const[x,z]=r.path.at(-1),distance=Math.hypot(x-Math.max(WALK.x0,Math.min(WALK.x1,x)),z-Math.max(WALK.z0,Math.min(WALK.z1,z)));assert(distance>SITE.south.view.fogFar,`${r.name} hidden end ${distance}`);}
console.log('PASS OSM plan; 25 historical station positions/along/width/bank/water levels; existing public river/bridges/ground/south config ; both endpoints beyond current WALK fog');
