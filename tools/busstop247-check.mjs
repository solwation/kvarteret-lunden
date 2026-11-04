// Frozen public baseline, same flat sampler: selective #247 regression and isolation.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {writeFile} from 'node:fs/promises';
import {SITE} from '../src/config.js';
import {buildStreet} from '../src/street.js';
import {farSegments} from '../src/farwalk.js';
import {busStopSegments} from '../src/busstopgeo.js';
const baseline='a939dd593546690343a7e84b7722d4bcec95238f',labels=[];
globalThis.document={createElement:()=>{const canvas={width:0,height:0};let ctx;ctx=new Proxy({canvas,measureText:s=>({width:s.length*(parseInt(ctx.font?.match(/\d+/)?.[0]??'32'))*.54}),fillText:s=>labels.push(s),createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),createRadialGradient:()=>({addColorStop(){}})},{get:(o,k)=>k in o?o[k]:()=>{}});canvas.getContext=()=>ctx;return canvas;}};
const data=s=>'data:text/javascript;base64,'+Buffer.from(s).toString('base64');
const oldConfig=data(execFileSync('git',['show',baseline+':src/config.js'],{encoding:'utf8'}));
const oldStreet=data(execFileSync('git',['show',baseline+':src/street.js'],{encoding:'utf8'}).replace(/from '([^']+)'/g,(_,path)=>`from '${path==='./config.js'?oldConfig:path.startsWith('./')?new URL('../src/'+path.slice(2),import.meta.url):import.meta.resolve(path)}'`));
const oldSITE=(await import(oldConfig)).SITE,oldBuild=(await import(oldStreet)).buildStreet;
const geoHash=g=>createHash('sha256').update(new Uint8Array(g.attributes.position.array.buffer)).digest('hex');
const ledger=group=>group.children.map(o=>({hash:geoHash(o.geometry),position:o.position.toArray(),rotation:o.rotation.toArray(),triangles:(o.geometry.index?.count??o.geometry.attributes.position.count)/3*(o.isInstancedMesh?o.count:1),color:o.material.color?.getHex()}));
const beforeObject=oldBuild(()=>0).object,before=ledger(beforeObject),collisionBefore=JSON.stringify({far:farSegments(),bus:busStopSegments()});labels.length=0;
const current=buildStreet(()=>0),after=ledger(current.object),signs=current.object.children.filter(o=>o.name==='street-bus-stop-sign');
assert.equal(SITE.street.trafficLight,null);assert.deepEqual(SITE.street.warnings,[]);assert(!('moved'in SITE.street));
const restored={...SITE.street};delete restored.restoredBusStop;delete restored.busStopName;delete restored.busStopFaceOffset;Object.assign(restored,{trafficLight:oldSITE.street.trafficLight,warnings:oldSITE.street.warnings,moved:oldSITE.street.moved});assert.deepEqual(restored,oldSITE.street);
assert.equal(signs.length,4);assert.equal(new Set(signs.map(s=>s.material.map)).size,1);assert(signs.every(s=>s.userData.label==='Lund S:t Lars Karpvägen'&&s.geometry.parameters.width===.42&&s.geometry.parameters.height===.62&&s.position.y===2.3));
assert(labels.includes('Lund S:t Lars')&&labels.includes('Karpvägen')&&!labels.includes('Flyttad'));
for(const at of[SITE.street.busStop,SITE.street.restoredBusStop]){const pair=signs.filter(s=>Math.abs(s.position.x-at[0])<.05&&Math.abs(s.position.z-at[1])<.05);assert.equal(pair.length,2);assert(pair.every(s=>Math.abs(Math.hypot(s.position.x-at[0],s.position.z-at[1])-.04)<1e-8));}
for(let i=0;i<7;i++)assert.deepEqual(after[i],before[i],'surface/crossing/lamp/pool '+i);
for(const entry of before.slice(17,27))assert(after.some(a=>JSON.stringify(a)===JSON.stringify(entry)),'retained other sign');
assert.equal(after.filter(a=>a.color===0xf2c014).length,1);assert.equal(after.find(a=>a.color===0xf2c014).triangles,64);
assert.equal(JSON.stringify({far:farSegments(),bus:busStopSegments()}),collisionBefore);assert.deepEqual(SITE.busStop,oldSITE.busStop);assert.deepEqual(SITE.roads.map(({_samples,...r})=>r),oldSITE.roads.map(({_samples,...r})=>r));
let lights=0;current.object.traverse(o=>lights+=!!o.isLight);assert.equal(lights,0);current.update(0);current.update(1);
// Exercise optional signal branch too, then restore config; no extra product feature.
SITE.street.trafficLight=oldSITE.street.trafficLight;SITE.street.warnings=oldSITE.street.warnings;const optional=buildStreet(()=>0);optional.update(0);optional.update(1);SITE.street.trafficLight=null;SITE.street.warnings=[];
const count=a=>({meshes:a.length,triangles:a.reduce((n,o)=>n+o.triangles,0)}),b=count(before),a=count(after),result={ok:true,baseline,before:b,after:a,delta:{meshes:a.meshes-b.meshes,triangles:a.triangles-b.triangles},labels,signs:signs.map(s=>({position:s.position.toArray(),label:s.userData.label})),sharedTexture:true,faceClearanceMetres:.01,retainedGeometryHashes:before.slice(0,7).map(o=>o.hash),collisionSHA256:createHash('sha256').update(collisionBefore).digest('hex'),optionalSignal:true,noLights:true};
assert.deepEqual(result.delta,{meshes:-4,triangles:-236});await writeFile('docs/verification/247/component.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
