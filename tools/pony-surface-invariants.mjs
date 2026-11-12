import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import * as T from 'three';
import {ponyGeometry,Paddock} from '../src/paddock.js';
import {PADDOCK as P} from '../src/config.js';
import {applySeason} from '../src/seasons.js';
import {insideFence} from '../src/paddockgeo.js';
import {groundY,renderedTerrainY} from '../src/surroundings.js';
const hash=s=>createHash('sha256').update(s).digest('hex'),old=execFileSync('git',['show','11d67b945daccf36f90e27cd4420b19b2ec1903f:src/paddock.js'],{encoding:'utf8'}),now=await readFile('src/paddock.js','utf8');
const tail=s=>s.slice(s.indexOf('/** The ponies\' material:'));
assert.equal(tail(now),tail(old),'public material, instances, grass, storage and every behaviour remain byte-identical');
const baseline=await import('data:text/javascript,'+encodeURIComponent(old.replace(/from '([^']+)'/g,(_,p)=>"from '"+(p==='three'?import.meta.resolve('three'):new URL('../src/'+p,import.meta.url).href)+"'")));
const g=ponyGeometry(),a=g.attributes,ba=baseline.ponyGeometry().attributes;
assert.deepEqual(Object.keys(a),['position','normal','color','aPart','aPivot']);
assert.equal(a.position.count/3,2652);assert.equal(Object.values(a).reduce((n,a)=>n+a.array.byteLength,0),413712);
const pivots={};for(let i=0;i<a.position.count;i++){for(const x of Object.values(a))for(let k=0;k<x.itemSize;k++)assert(Number.isFinite(x.array[i*x.itemSize+k]));const part=a.aPart.getX(i),pivot=[a.aPivot.getX(i),a.aPivot.getY(i),a.aPivot.getZ(i)];(pivots[part]??=new Set()).add(JSON.stringify(pivot));assert(Math.abs(new T.Vector3().fromBufferAttribute(a.normal,i).length()-1)<1e-5);}
const oldPivots={};for(let i=0;i<ba.position.count;i++)(oldPivots[ba.aPart.getX(i)]??=new Set()).add(JSON.stringify([ba.aPivot.getX(i),ba.aPivot.getY(i),ba.aPivot.getZ(i)]));assert.deepEqual(pivots,oldPivots,'all retained part/pivot values');
assert.deepEqual(Object.keys(pivots),['0','1','2','3','4','5','6','7','8']);
assert.deepEqual([...pivots[3]],['[-0.15000000596046448,0.6800000071525574,0.5]']);
assert.deepEqual([...pivots[7]],['[0,1.2000000476837158,-0.7200000286102295]']);
for(const id of [3,4,5,6]){let min=Infinity;for(let i=0;i<a.position.count;i++)if(a.aPart.getX(i)===id)min=Math.min(min,a.position.getY(i));let before=Infinity;for(let i=0;i<ba.position.count;i++)if(ba.aPart.getX(i)===id)before=Math.min(before,ba.position.getY(i));assert(Math.abs(min-before)<1e-6,'existing hoof ground envelope');}
const scene=new T.Scene(),camera=new T.PerspectiveCamera(60,1.6,.1,2000),ground=(x,z)=>z>260?-3.01:Math.max(groundY(x,z),renderedTerrainY(x,z));camera.position.set(-114,-3,220);
globalThis.addEventListener=()=>{};
const cost=p=>{const arrays=new Set(),geos=new Set(),materials=new Set(),textures=new Set();const add=a=>{if(a?.buffer)arrays.add(a.buffer)};for(const root of [p.mesh,p.fence,p.grass,p.winterDecor])root.traverse(o=>{if(o.geometry&&!geos.has(o.geometry)){geos.add(o.geometry);for(const a of Object.values(o.geometry.attributes))add(a.array);add(o.geometry.index?.array)}add(o.instanceMatrix?.array);for(const m of o.material?(Array.isArray(o.material)?o.material:[o.material]):[])materials.add(m)});add(p.gm.v);textures.add(p.maskTex);add(p.maskTex.image.data);return{retainedTypedArrayBytes:[...arrays].reduce((n,a)=>n+a.byteLength,0),geometries:geos.size,materials:materials.size,textures:textures.size,textureBytes:p.maskTex.image.data.byteLength,externalAssets:0}};
const random=Math.random;Math.random=()=>.269;const p=new Paddock({scene,camera,ground});Math.random=()=>.269;const bp=new baseline.Paddock({scene:new T.Scene(),camera,ground});Math.random=random;const costs={before:cost(bp),after:cost(p)};assert.equal(costs.after.retainedTypedArrayBytes-costs.before.retainedTypedArrayBytes,413712-168480);const matrices=[];
for(const [name,month,rain] of [['dry',6,0],['rain',6,.8],['winter',1,0],['summer',6,0]]){
applySeason(month);for(let i=0;i<1500;i++)p.update(.1,false,rain);scene.updateMatrixWorld(true);
assert(p.mesh.visible);assert.equal(p.mesh.count,2);const row=[];
for(let i=0;i<2;i++){const m=new T.Matrix4();p.mesh.getMatrixAt(i,m);assert(m.elements.every(Number.isFinite));assert(Math.abs(m.determinant()-1)<1e-5);assert(insideFence(p.ponies[i].x,p.ponies[i].z,1));assert.equal(p.ponies[i].y,ground(p.ponies[i].x,p.ponies[i].z));row.push(m.toArray());}
if(name==='rain')assert(p.ponies.some(q=>q.spot));if(name==='winter'){assert(p.ponies.every(q=>q.spot?.kind==='shed'&&!q.gone));assert(!p.grass.visible);assert(p.blankets.visible);}matrices.push({name,matrices:row});}
// Mirror the unchanged vertex shader for full-surface finite projection guards.
const axes=[new T.Vector3(1,0,0),new T.Vector3(0,1,0),new T.Vector3(0,0,1)],neck=new T.Vector3(...P.pony.neck),tip=neck.clone().addScaledVector(new T.Vector3(0,Math.cos(.66),Math.sin(.66)),.72),about=(v,o,axis,angle)=>v.sub(o).applyAxisAngle(axes[axis],angle).add(o),projections=[];
camera.lookAt(-130,-2,240);camera.updateMatrixWorld(true);
for(const pose of [{name:'stand',neck:0,ear:0,yaw:0,amp:0,phase:0,tail:0},{name:'graze',neck:1.54,ear:.2,yaw:.25,amp:0,phase:0,tail:.2},{name:'walk',neck:.2,ear:.15,yaw:-.25,amp:.22,phase:1.2,tail:-.2}]){
const bounds=new T.Box3();let vertices=0;
for(let instance=0;instance<2;instance++){const matrix=new T.Matrix4();p.mesh.getMatrixAt(instance,matrix);for(let i=0;i<a.position.count;i++){const part=a.aPart.getX(i),v=new T.Vector3().fromBufferAttribute(a.position,i),pivot=new T.Vector3().fromBufferAttribute(a.aPivot,i);if(part===1){about(v,neck,0,pose.neck);about(v,neck,1,pose.yaw*.4)}else if(part===2||part===8){if(part===8)about(v,pivot,0,-pose.ear);about(v,tip,0,-pose.neck*.55);about(v,tip,1,pose.yaw*.6);about(v,neck,0,pose.neck);about(v,neck,1,pose.yaw*.4)}else if(part>=3&&part<=6){const phase=part>3.5&&part<5.5?3.14159:0;about(v,pivot,0,Math.sin(pose.phase+phase)*pose.amp)}else if(part===7)about(v,pivot,2,pose.tail);v.applyMatrix4(matrix);bounds.expandByPoint(v);v.project(camera);assert(v.toArray().every(Number.isFinite),'full deformed vertex projection');vertices++;}}
projections.push({name:pose.name,vertices,bounds:{min:bounds.min.toArray(),max:bounds.max.toArray()}});}
const phase=p.ponies.map(q=>q.phase);camera.position.x+=2000;p.update(.1);assert(!p.mesh.visible&&!p.grass.visible);assert.deepEqual(p.ponies.map(q=>q.phase),phase);camera.position.x-=2000;p.update(.1,true);assert(!p.mesh.visible);p.update(.1);assert(p.mesh.visible);
assert.equal(p.mesh.raycast({},[]),undefined);assert.equal(p.fence.raycast({},[]),undefined);
const capture=JSON.parse(await readFile('docs/verification/269/after.json','utf8'));assert.equal(hash(now.replace('2652 triangles per shared geometry','~200 triangles each')),capture.sources['src/paddock.js'],'art captures differ only in corrected triangle-count comment');
const imageReuse={capturePaddockHash:capture.sources['src/paddock.js'],finalPaddockHash:hash(now),change:'triangle-count header comment only'};
const result={imageReuse,costs,projections,triangles:a.position.count/3,geometryBytes:413712,shaderAndBehaviourHash:hash(tail(now)),pivots:Object.fromEntries(Object.entries(pivots).map(([id,set])=>[id,[...set].map(JSON.parse)])),matrices};await writeFile('docs/verification/269/invariants.json',JSON.stringify(result,null,2)+'\n');console.log('PASS: pony surface budget, finite attributes/unit normals, original pivots/hoof ground, byte-identical public shader/behaviour, actual dry/rain/winter/summer matrices, shelter/blankets/grass and far/hidden gates.');
