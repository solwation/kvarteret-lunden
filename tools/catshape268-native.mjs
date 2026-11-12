// #268: paired public source and retained-resource contract; no original assets/history.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import * as T from 'three';
import {OutdoorCats} from '../src/outdoorcats.js';
import {OUTDOOR_CATS as C} from '../src/config.js';
const rev='11d67b945daccf36f90e27cd4420b19b2ec1903f',old=f=>execFileSync('git',['show',rev+':'+f],{encoding:'utf8'});
const moduleURL=(text,dir,overrides={})=>'data:text/javascript;base64,'+Buffer.from(text.replace(/(from\s*['"])([^'"]+)(['"])/g,(m,a,p,b)=>a+(overrides[p]??(p==='three'?pathToFileURL(process.cwd()+'/node_modules/three/build/three.module.js').href:p.startsWith('.')?new URL(p,pathToFileURL(process.cwd()+'/'+dir)).href:p))+b)).toString('base64');
const puppet=moduleURL(old('src/catpuppet.js'),'src/catpuppet.js');
const {OutdoorCats:Before}=await import(moduleURL(old('src/outdoorcats.js'),'src/outdoorcats.js',{'./catpuppet.js':puppet}));
const baselineConfig=await import(moduleURL(old('src/config.js'),'src/config.js'));assert.deepEqual(C,baselineConfig.OUTDOOR_CATS);
const unchanged=['outdoorcats.js','outdoorcatbrain.js','outdoorcatroute.js','catexploration.js','catcontact.js','catnuzzle.js','main.js'];
for(const f of unchanged)assert.equal(readFileSync('src/'+f,'utf8'),old('src/'+f),f);
const resources=o=>{const gs=new Set(),bs=new Set(),ms=new Set();let bytes=0,finite=true;for(const c of o.cats){for(const g of[c.sit,c.walk,c.rig.geometry])gs.add(g);ms.add(c.mesh.material);c.p.object.traverse(x=>{if(x.geometry)gs.add(x.geometry);if(x.material)ms.add(x.material);});}for(const g of gs)for(const a of[...Object.values(g.attributes),g.index].filter(Boolean)){for(const n of a.array)finite&&=Number.isFinite(n);if(!bs.has(a.array.buffer)){bs.add(a.array.buffer);bytes+=a.array.buffer.byteLength;}}assert.ok(finite);return{geometries:gs.size,buffers:bs.size,sourceAndRenderMaterials:ms.size,moduleMaterialTemplates:11,totalRetainedMaterials:ms.size+11,bytes,finite,textures:0};};
function measure(Class){let now=C.epoch+.8;const camera=new T.PerspectiveCamera(65,1,.05,100),o=new Class({scene:new T.Scene(),camera,ground:()=>0,now:()=>now});o.nuzzle.next=Infinity;
 const warm=(step)=>{for(let i=0;i<30;i++){now+=.01;step();}const a=[];for(let i=0;i<100;i++){now+=.01;const t=performance.now();step();a.push(performance.now()-t);}a.sort((a,b)=>a-b);return{samples:100,median:a[50],p95:a[95]};};
 camera.position.set(-20,1.62,35);const normalCPU=warm(()=>o.update(false));
 for(const c of o.cats)c.scheduled=()=>({x:c.id?100+c.id:0,z:0,yaw:0,y:0,walking:true,activity:'walk',elevated:false,climbing:false,restLeft:900});
 camera.position.set(0,1.62,2);camera.lookAt(0,.2,0);o.update(false);const nearCPU=warm(()=>o.update(false)),before=resources(o),ids=o.cats.map(c=>c.rig.geometry.attributes.position.array.buffer);for(let i=0;i<10;i++)o.update(false);assert.deepEqual(before,resources(o));o.cats.forEach((c,i)=>assert.equal(c.rig.geometry.attributes.position.array.buffer,ids[i]));
 const c=o.cats[0],gates=[];for(const d of[6.9,7.1,31.9,32.1]){camera.position.set(0,0,d);o.update(false);assert.equal(c.state.near,d<7);assert.equal(c.mesh.visible,d<32);assert.equal(c.mesh.geometry,d<7?c.rig.geometry:c.walk);gates.push({distance:d,visible:c.mesh.visible,near:c.state.near});}
 const phone=new Class({scene:new T.Scene(),camera,ground:()=>0,lowMemory:true,now:()=>now});phone.nuzzle.next=Infinity;phone.cats[0].scheduled=c.scheduled;camera.position.set(0,0,18.1);phone.update(false);assert.equal(phone.cats[0].mesh.visible,false);camera.position.z=17.9;phone.update(false);assert.equal(phone.cats[0].mesh.visible,true);
 o.update(true);assert.ok(o.cats.every(c=>!c.mesh.visible));o.winter=true;o.update(false);assert.ok(o.cats.every(c=>!c.mesh.visible));
 const lod=Object.fromEntries([['sit',c.sit],['walk',c.walk],['near',c.rig.geometry]].map(([k,g])=>[k,{triangles:g.attributes.position.count/3,bytes:Object.values(g.attributes).reduce((n,a)=>n+a.array.byteLength,0)}]));
 return{cats:o.cats.length,lod,resources:before,gates,phone:[17.9,18.1],colors:o.cats.map(c=>c.spec.color),normalCPU,oneWalkingNearCPU:nearCPU};}
const before=measure(Before),after=measure(OutdoorCats);assert.equal(after.cats,12);assert.deepEqual(after.colors,before.colors);for(const k of Object.keys(after.lod)){assert.equal(after.lod[k].triangles,2728);assert.ok(after.lod[k].triangles<=before.lod[k].triangles*1.5);assert.ok(after.lod[k].bytes<=before.lod[k].bytes*1.5);}assert.ok(after.resources.bytes<=before.resources.bytes*1.5);
console.log(JSON.stringify({baseline:rev,unchanged,configEqual:true,before,after,limits:{triangles:3060,bytesPerLOD:330480,totalBytes:13019040},notes:'100 warm CPU update samples after 30 warmup; same process/inputs; no GPU or FPS claim. Retained source+sit+walk+near union counts backing buffers once.'},null,2));
