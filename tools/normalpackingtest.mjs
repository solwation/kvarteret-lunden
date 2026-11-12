// #256: generic contracts selectively adapted from original 0f6ecb6a2acbb6c28d912471d3ff3e42d356820b.
import test from 'node:test';
import assert from 'node:assert/strict';
globalThis.location = {search:'?lowmem'};
const T=await import('three'),{freeSceneGeometryCopies}=await import('../src/lowmemory.js');
const pack=g=>{freeSceneGeometryCopies(new T.Mesh(g));return g.attributes.normal;};
const angle=(a,b)=>a.clone().normalize().angleTo(b.clone().normalize())*180/Math.PI;
test('scaled and zero normals, sharing and untouched geometry payloads',()=>{
 const g=new T.BufferGeometry(),v=[0,0,0, 1e-30,2e-30,-3e-30, 1e30,2e30,-3e30, 0,-12,0, .3,.4,0];
 const n=new T.Float32BufferAttribute(v,3),p=new T.Float32BufferAttribute(v,3),uv=new T.Float32BufferAttribute([0,1,2,3],2);
 g.setAttribute('normal',n);g.setAttribute('position',p);g.setAttribute('uv',uv);g.setIndex([0,1,2]);const index=g.index;
 const shared=new T.BufferGeometry().setAttribute('normal',n),out=pack(g);
 assert.equal(pack(shared),out);assert.equal(out.itemSize,4);assert.equal(out.normalized,true);assert.equal(out.array.byteLength,n.count*4);
 assert.deepEqual(Array.from(out.array.slice(0,4)),[0,0,0,0]);assert.deepEqual(Array.from(out.array.slice(12,16)),[0,-127,0,0]);
 for(let i=1;i<n.count;i++)assert.ok(angle(new T.Vector3().fromBufferAttribute(n,i),new T.Vector3(out.getX(i),out.getY(i),out.getZ(i)))<.4);
 assert.equal(g.attributes.position,p);assert.equal(g.attributes.uv,uv);assert.equal(g.index,index);assert.deepEqual(Array.from(n.array),Array.from(new Float32Array(v)));
});
test('dynamic, keepCpu, skinned, morph and already-uploaded geometry retain floats',()=>{
 for(const kind of ['dynamic','keepCpu','skinned','morph','uploaded']){
  const g=new T.BoxGeometry(),n=g.attributes.normal;let m=new T.Mesh(g),renderer;
  if(kind==='dynamic')g.attributes.position.setUsage(T.DynamicDrawUsage);
  if(kind==='keepCpu')g.userData.keepCpu=true;
  if(kind==='skinned')m=new T.SkinnedMesh(g);
  if(kind==='morph')g.morphAttributes.position=[g.attributes.position.clone()];
  if(kind==='uploaded')renderer={info:{memory:{geometries:1}}};
  freeSceneGeometryCopies(m,renderer);assert.equal(g.attributes.normal,n,kind);
 }
});

test('public anonymous cat producer retains direction when the helper is explicitly invoked', async()=>{
 const {createCatPuppet}=await import('../src/catpuppet.js');const p=createCatPuppet();let source;
 p.object.traverse(o=>{if(!source&&o.geometry?.type==='LatheGeometry')source=o.geometry;});assert.ok(source);
 const g=source.clone(),n=g.attributes.normal.clone(),out=pack(g);let shortest=Infinity,worst=0;
 for(let i=0;i<n.count;i++){const v=new T.Vector3().fromBufferAttribute(n,i);if(v.length())shortest=Math.min(shortest,v.length());worst=Math.max(worst,angle(v,new T.Vector3(out.getX(i),out.getY(i),out.getZ(i))));}
 // #268 normalizes the cached source surface; scaled/tiny input coverage remains in the first test.
 assert.ok(Number.isFinite(shortest)&&shortest>0);assert.ok(worst<.4,`worst angular error ${worst}`);
 console.log(JSON.stringify({publicProducer:'anonymous cat limb before mergedRig normalization',shortest,worst,vertices:n.count,bytes:out.array.byteLength}));
});
