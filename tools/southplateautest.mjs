// Public #105: GLO coverage, legacy sampler and exact projected surface partition.
import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {ELEVATION_GRID as G} from '../src/elevationgrid.js';
import {gridGround} from '../src/elevation.js';
import {SITE,ELEVATION as E} from '../src/config.js';
import {cutAtTerrain} from '../src/roads.js';
const old=JSON.parse(execFileSync('git',['show','625765f:data/elevation.json'],{encoding:'utf8'}));
const data=JSON.parse(readFileSync(new URL('../data/elevation.json',import.meta.url)));
test('all existing GLO samples and their relative reference survive the southern extension',()=>{
 assert.deepEqual(data.h.slice(0,old.rowsN),old.h);assert.deepEqual(data.g.slice(0,old.rowsN),old.g);assert.equal(data.refAbsM,old.refAbsM);assert.equal(data.refAbsM,14.75);
 assert.equal(data.cols,59);assert.equal(data.rowsN,67);assert.match(data.source,/Copernicus/);assert.match(data.licence,/Contains modified Copernicus data/);
 assert.deepEqual(G.g,data.g);assert.equal(G.rows,data.rowsN);
});
test('drawn southern extent reaches the final complete grid row',()=>{assert.equal(SITE.backgroundGround.z1,G.z0+(G.rows-1)*G.step);assert.equal(SITE.backgroundGround.z1,460);assert.equal(E.legacyGridRows,old.rowsN);});
test('legacy sampler is exactly the old Catmull-Rom including its old edge clamp',()=>{
 const cr=(a,b,c,d,t)=>b+.5*t*(c-a+t*(2*a-5*b+4*c-d+t*(3*(b-c)+d-a)));
 const at=(i,j)=>old.g[Math.min(old.rowsN-1,Math.max(0,j))][Math.min(old.cols-1,Math.max(0,i))];
 const sample=(x,z)=>{const fx=Math.min(old.cols-1,Math.max(0,(x-old.x0)/old.step)),fz=Math.min(old.rowsN-1,Math.max(0,(z-old.z0)/old.step)),i=Math.floor(fx),j=Math.floor(fz),u=fx-i,v=fz-j,col=k=>cr(at(i-1,k),at(i,k),at(i+1,k),at(i+2,k),u);return cr(col(j-1),col(j),col(j+1),col(j+2),v)/10;};
 for(let x=-300;x<=350;x+=7)for(let z=-240;z<=470;z+=9)assert.equal(gridGround(x,z,E.legacyGridRows),sample(x,z));
});
test('new southern grid is finite and lifts the plateau independently of the local LM refinement',()=>{for(let x=-250;x<=200;x+=10)for(let z=250;z<=460;z+=10)assert(Number.isFinite(gridGround(x,z)));assert(gridGround(-40,286)>0);assert(gridGround(30,272)>0);});
test('projected paint preserves area while splitting along the exact terrain triangles',()=>{
 const t=cutAtTerrain([[.2,.1],[.3,.1],[1.7,1.9],[1.6,1.9]],{X:[0,1,2],Z:[0,1,2]});
 const area=p=>Math.abs(p.reduce((s,q,i)=>{const r=p[(i+1)%p.length];return s+q[0]*r[1]-r[0]*q[1]},0))/2;
 assert(Math.abs(t.reduce((s,q)=>s+area(q),0)-.18)<1e-10);
});
test('explicit detailed cells split overlays at every emitted river subdivision',()=>{
 const grid={X:[0,2],Z:[0,2],refined:()=>2},triangles=cutAtTerrain([[0,0],[2,0],[2,2],[0,2]],grid);
 const height=(x,z)=>{const i=Math.min(1,Math.floor(x)),j=Math.min(1,Math.floor(z)),u=x-i,v=z-j,h=(a,b)=>(i+a)**2+(j+b)**2;return u+v<=1?h(0,0)+(h(1,0)-h(0,0))*u+(h(0,1)-h(0,0))*v:h(1,1)+(h(0,1)-h(1,1))*(1-u)+(h(1,0)-h(1,1))*(1-v);};
 for(const t of triangles){const x=t.reduce((s,q)=>s+q[0],0)/3,z=t.reduce((s,q)=>s+q[1],0)/3;assert(Math.abs(height(x,z)-t.reduce((s,q)=>s+height(...q),0)/3)<1e-9);}
 assert.equal(triangles.length,8);
});
