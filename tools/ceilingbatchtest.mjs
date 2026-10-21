// Public #108 (original #1387, source f3fb127): node --test tools/ceilingbatchtest.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import { CeilingBatchGate, garageCeilings } from '../src/ceilingbatchgate.js';
import { GARAGE, COURTYARD } from '../src/config.js';
const roof=garageCeilings().find(r=>r.x0===-51.4&&r.z0===12.62),eye=new T.Vector3(-46,-1.38,21);
const camera=p=>{const c=new T.PerspectiveCamera();c.position.copy(p);c.updateMatrixWorld(true);return c;};
function fixture(base=()=>true){const mesh=new T.Mesh(new T.BoxGeometry(1,1,1).translate(-45,3,21),new T.MeshBasicMaterial());mesh.castShadow=true;const gate=new CeilingBatchGate([mesh],base);gate.occluders=[roof];gate.updateMatrixWorld(true);return{mesh,gate};}
test('occluders match actual ceiling rectangles for shared A/B/C/L basement structure, retaining core and outdoor holes',()=>{
 const c=garageCeilings();assert(c.length>10);assert(c.every(r=>r.y0===GARAGE.ceiling&&r.y1===GARAGE.ceiling));
 for(const id of ['hallW','hallE','entrance','bikeNW','bandW','bandE','passageAWest','coreAWest','coreAEast','coreBPark','passageBEast','roomCN','passageCN','passageCS']){const r=GARAGE.rects.find(r=>r.id===id);assert(c.some(q=>q.x0===r.x0&&q.x1===r.x1&&q.z0===r.z0&&q.z1===r.z1),id);}
 for(const r of GARAGE.rects.filter(r=>r.core||r.id==='core'||r.outside))assert(!c.some(q=>q.x0===r.x0&&q.x1===r.x1&&q.z0===r.z0&&q.z1===r.z1),r.id);
});
test('complete occluded batch changes only render layers; original geometry, buffers, shadows and physical rays survive',()=>{
 const{mesh,gate}=fixture(),geometry=mesh.geometry,position=geometry.attributes.position,matrix=mesh.matrix.clone(),raycast=mesh.raycast;
 gate.update(camera(eye));assert.equal(mesh.layers.mask,1<<7);assert(mesh.visible&&mesh.castShadow);assert.equal(mesh.geometry,geometry);assert.equal(geometry.attributes.position,position);assert.deepEqual(mesh.matrix.elements,matrix.elements);assert.equal(mesh.raycast,raycast);
 const ray=new T.Raycaster(new T.Vector3(-45,3,24),new T.Vector3(0,0,-1));ray.layers.enable(7);assert(ray.intersectObject(mesh).length>0);
});
test('roof edge, camera at/above ceiling, crossing batch and open core keep exposed geometry',()=>{
 const{mesh,gate}=fixture();for(const p of [new T.Vector3(-60,-1.38,21),new T.Vector3(-46,GARAGE.ceiling,21),new T.Vector3(-46,1,21)]){gate.update(camera(p));assert.equal(mesh.layers.mask,1,p.toArray().join(','));}
 mesh.position.y=-3.5;gate.updateMatrixWorld(true);gate.update(camera(eye));assert.equal(mesh.layers.mask,1,'batch straddles the ceiling');
 gate.occluders=[];mesh.position.y=0;gate.updateMatrixWorld(true);gate.update(camera(eye));assert.equal(mesh.layers.mask,1,'no invented slab across a core hole');
});
test('per-pass camera restore combines original terrace policy and preserves warm-up masks',()=>{
 let shown=true;const{mesh,gate}=fixture(()=>shown);gate.update(camera(eye));assert.equal(mesh.layers.mask,128);const outside=camera(new T.Vector3(-46,2,21));gate.update(outside);assert.equal(mesh.layers.mask,1);shown=false;gate.update(outside);assert.equal(mesh.layers.mask,128);shown=true;gate.update(outside);assert.equal(mesh.layers.mask,1);
 const shadow=new T.OrthographicCamera(-10,10,10,-10,.1,100);shadow.position.set(-46,20,21);shadow.updateMatrixWorld(true);gate.update(shadow);assert.equal(mesh.layers.mask,1);gate.update(camera(eye));assert.equal(mesh.layers.mask,128);gate.update(outside);assert.equal(mesh.layers.mask,1,'a reflection/outside camera restores the same batch');
 mesh.layers.mask=0x80000000;outside.layers.enableAll();gate.update(outside);assert.equal(mesh.layers.mask,0x80000000);
});
test('whole instanced envelopes and maximum shader sway protect exposed silhouettes without rewriting matrices',()=>{
 const m=new T.InstancedMesh(new T.BoxGeometry(.1,.1,.1),new T.MeshBasicMaterial(),2),x=new T.Matrix4();m.setMatrixAt(0,x.makeTranslation(-45,3,21));m.setMatrixAt(1,x.makeTranslation(-44,3,22));const buffer=m.instanceMatrix,bytes=buffer.array.slice(),g=new CeilingBatchGate([m]);g.occluders=[roof];g.updateMatrixWorld(true);g.update(camera(eye));assert.equal(m.layers.mask,128);assert.equal(m.instanceMatrix,buffer);assert.deepEqual(buffer.array,bytes);
});

test('coverage by separate roof rectangles cannot replace one complete opaque rectangle',()=>{
 const {mesh,gate}=fixture();gate.occluders=[{x0:-50,x1:-45,y0:-.35,y1:-.35,z0:10,z1:30},{x0:-45,x1:-40,y0:-.35,y1:-.35,z0:10,z1:30}];
 // Each side of the silhouette is covered, but no single solid rectangle covers it all.
 gate.update(camera(new T.Vector3(-45,-1.38,21)));assert.equal(mesh.layers.mask,1);
});
test('each actual pergola envelope stays conservative at deck and roof edges',()=>{
 for(const p of COURTYARD.pergolas){
  const mesh=new T.Mesh(new T.BoxGeometry(p.x1-p.x0+.06,.41,p.z1-p.z0+.18).translate((p.x0+p.x1)/2,2.625,(p.z0+p.z1)/2+.06),new T.MeshBasicMaterial()),gate=new CeilingBatchGate([mesh]);gate.updateMatrixWorld(true);
  for(const y of [GARAGE.ceiling,0,1.62,20]){gate.update(camera(new T.Vector3((p.x0+p.x1)/2,y,(p.z0+p.z1)/2)));assert.equal(mesh.layers.mask,1);}
  gate.update(camera(new T.Vector3(-500,-1.38,-500)));assert.equal(mesh.layers.mask,1);
 }
});
