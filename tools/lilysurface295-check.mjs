// #295: neutral surface recipes and public waterline-only instance contracts.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import { LILY_SURFACE as L, RIVER_FLORA as F } from '../src/config.js';
import { lilyPetalGeometry, lilyGeometry, flowerGeometry, RiverLilies } from '../src/riverfloraview.js';

const valid = g => {
  for(const a of Object.values(g.attributes))assert.ok([...a.array].every(Number.isFinite));
  const p=g.attributes.position,n=g.attributes.normal,ix=g.index;
  for(let i=0;i<n.count;i++)assert.ok(Math.abs(Math.hypot(n.getX(i),n.getY(i),n.getZ(i))-1)<1e-5,'unit finite normals');
  for(let i=0;i<(ix?.count??p.count);i+=3){const at=k=>new T.Vector3().fromBufferAttribute(p,ix?ix.getX(i+k):i+k);assert.ok(at(1).sub(at(0)).cross(at(2).sub(at(0))).length()>1e-10,'nondegenerate triangles');}
};
test('pads stay at the waterline with a shallow rim, notch and narrow radial veins',()=>{
 const pad=lilyGeometry();valid(pad);const p=pad.attributes.position,n=pad.attributes.normal;let lo=Infinity,hi=-Infinity,centre=false;const shades=new Set();
 for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),r=Math.hypot(x,z);assert.ok(r<=1+1e-6);assert.ok(n.getY(i)>.97);lo=Math.min(lo,y);hi=Math.max(hi,y);centre ||= r<1e-6&&Math.abs(y)<1e-8;if(r>.99)shades.add(pad.attributes.color.getY(i).toFixed(4));if(r>.01)assert.ok(!(x>0&&Math.abs(z/x)<Math.tan(L.notch)-1e-6),'notch stays open');}
 assert.ok(centre&&lo===0&&hi>0&&hi<.026);assert.ok(shades.size>=2,'fine vein shade is present on the same surface');
 const combined=lilyGeometry();valid(combined);combined.computeBoundingBox();assert.equal(combined.boundingBox.min.y,0,'public leaves retain no stem');
 assert.ok(combined.attributes.position.count/3<=150,'modest leaf triangle budget');pad.dispose();combined.dispose();
});
test('petals round and cup across their width, overlap in the original two rings, and retain the radius/height envelope',()=>{
 for(const [count,len,lift,turn,width] of L.rings){const g=lilyPetalGeometry(len,lift,width);valid(g);g.computeBoundingBox();assert.ok(g.boundingBox.max.x<=len+1e-6);assert.ok(g.boundingBox.max.y<=lift*len+1e-6);assert.ok(width>len*.5*Math.tan(Math.PI/count),'mid-petal width allows neighbouring petals to overlap');assert.ok(g.attributes.position.count>3);g.dispose();}
 const g=flowerGeometry();valid(g);const p=g.attributes.position;for(let i=0;i<p.count;i++)assert.ok(Math.hypot(p.getX(i),p.getZ(i))<=1+1e-6);assert.ok(p.count/3<=220,'modest flower triangle budget');g.dispose();
});
test('public consumer retains waterline contact, two shared-material batches, seasons and stationary buffers',()=>{
 const scene=new T.Scene(),f=new RiverLilies({scene}),e=f.items.flowers[Math.floor(f.items.flowers.length/2)],eye=new T.Vector3(e.x,e.y+1,e.z);
 const p=new T.Vector3(),q=new T.Quaternion(),s=new T.Vector3();
 for(const e of f.items.lilies){e.m.decompose(p,q,s);assert.ok(Math.abs(p.y-f.river.waterY(e.s)-F.lilies.lift)<1e-6);assert.ok(Math.abs(s.y-e.r)<1e-6&&Math.abs(s.x-e.r)<1e-6);assert.ok(s.y*L.cup<=.00500001);}
 assert.equal(scene.children.length,2);assert.equal(f.meshes.lilies.material,f.meshes.flowers.material);assert.equal(f.meshes.lilies.material.map,null);
 f.update(eye,false,7);assert.ok(f.meshes.lilies.visible&&f.meshes.flowers.visible);const version=f.meshes.lilies.instanceMatrix.version;f.update(eye,false,7);assert.equal(f.meshes.lilies.instanceMatrix.version,version);
 f.update(eye,false,1);assert.ok(!f.meshes.lilies.visible&&!f.meshes.flowers.visible);f.update(eye,false,5);assert.ok(f.meshes.lilies.visible&&!f.meshes.flowers.visible);f.update(eye,true,7);assert.ok(!f.meshes.lilies.visible&&!f.meshes.flowers.visible);
 for(const m of Object.values(f.meshes)){assert.equal(m.castShadow,false);assert.equal(m.receiveShadow,false);m.geometry.dispose();}f.meshes.lilies.material.dispose();
});
