// Public #106: archived LM observations and bounded local interpolation, independent of the renderer.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {southPointGround} from '../src/elevation.js';
import {SOUTH_PLATEAU as S,SITE,ELEVATION as E} from '../src/config.js';
import {groundY,buildingPadList} from '../src/surroundings.js';
const path='docs/references/elevation-hoje-a/point-api-south-road-2026-10-19.json',bytes=readFileSync(path),data=JSON.parse(bytes);
test('all77 archived ground responses are preserved with provider attribution and model-origin limitation',()=>{
 assert.equal(data.complete,true);assert.equal(data.expectedCount,77);assert.equal(data.points.length,77);
 assert.equal(createHash('sha256').update(bytes).digest('hex'),'43aab9560d899f5403954acc0855c6318c7afbd1c2a20bd0fb3dd3c891306a11');
 assert.equal(data.verticalDatum,'RH 2000 (as reported by provider)');
 for(const p of data.points){assert.equal(p.response.nodata,false);assert(p.response.attribution.some(t=>t.includes('Lantmäteriet')&&t.includes('CC BY 4.0')));}
 const origin=data.points.find(p=>p.id==='model-origin-ground');assert.equal(origin.response.hojd_m,14.36);
 for(const [x,z,y]of S.points){const p=data.points.find(p=>p.x===x&&p.z===z);assert(p);assert(Math.abs(y-(p.response.hojd_m-origin.response.hojd_m))<1e-12);}
});
test('all ten local samples anchor both interpolation and shared walking ground exactly',()=>{
 const base=(x,z)=>.01*x+.02*z;
 for(const [x,z,y]of S.points){assert(Math.abs(southPointGround(x,z,base)-y)<1e-12);assert(Math.abs(groundY(x,z)-y)<1e-12);}
});
test('north and uncovered points retain the caller ground; fade and radius have continuous first derivatives',()=>{
 const base=(x,z)=>x*.02-z*.01;
 for(let x=-350;x<=340;x+=7)for(let z=-340;z<=225;z+=11)assert.equal(southPointGround(x,z,base),base(x,z));
 for(const [x,z]of [[300,300],[-300,400],[0,400]])assert.equal(southPointGround(x,z,base),base(x,z));
 const delta=(x,z)=>southPointGround(x,z,base)-base(x,z),h=1e-4;
 assert(Math.abs(delta(-130,225+h))<1e-8);
 const left=(delta(-130,240)-delta(-130,240-h))/h,right=(delta(-130,240+h)-delta(-130,240))/h;assert(Math.abs(left-right)<1e-4);
 const outsideX=-170-S.radius;assert.equal(delta(outsideX,272),0);assert(Math.abs(delta(outsideX+h,272))<1e-8);
 for(let x=-210;x<=75;x+=3)for(let z=225;z<=320;z+=3)assert(Number.isFinite(southPointGround(x,z,base)));
});
test('reference deltas remain independent for different ground samplers',()=>{
 const a=()=>0,b=()=>20;for(const[x,z,y]of S.points){assert(Math.abs(southPointGround(x,z,a)-y)<1e-12);assert(Math.abs(southPointGround(x,z,b)-y)<1e-12);}
});
test('two source-near buildings have anchored flat aprons and preserve the original northern sampler',()=>{
 const pads=buildingPadList(),anchored=pads.filter(p=>['Sankt Lars väg 41','Sankt Lars väg 45'].includes(p.name));assert.equal(anchored.length,2);
 for(const p of anchored){assert(S.points.some(q=>q[2]===p.level));const b=SITE.south.buildings.find(b=>b.name===p.name),ring=b.polygon.slice(0,-1);
  for(let i=0;i<ring.length;i++){const a=ring[i],c=ring[(i+1)%ring.length];for(let k=0;k<=10;k++){const t=k/10,x=a[0]+t*(c[0]-a[0]),z=a[1]+t*(c[1]-a[1]);assert(Math.abs(groundY(x,z)-p.level)<1e-10);}}
  for(const [x,z]of ring)for(const [dx,dz]of [[2,0],[-2,0],[0,2],[0,-2]])assert(Math.abs(groundY(x+dx,z+dz)-p.level)<1e-10);
 }
 assert.equal(E.southApron,4);assert.equal(E.southAnchor,3);assert.equal(E.legacyGridRows,46);
});
