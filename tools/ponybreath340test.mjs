import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import { breathCold, stepPonyBreath, ponyMuzzle, PonyBreath } from '../src/ponybreath.js';
import { PONY_BREATH as B, PONY_SURFACE as S } from '../src/config.js';

test('cold curve retains warm cutoff/full cold and seasonal snow minimum without a weather source',()=>{
  assert.equal(breathCold(9),0);assert.equal(breathCold(20),0);assert.equal(breathCold(-1),1);
  assert(breathCold(4)>0&&breathCold(4)<1);assert.equal(breathCold(undefined,true),.7);assert.equal(breathCold(),0);
});
test('breath has state cadence, no catch-up burst and no paused/warm emission',()=>{
  const s={};assert.equal(stepPonyBreath(s,0,'idle',1),0);assert.equal(stepPonyBreath(s,.1,'idle',0),0);
  assert.equal(stepPonyBreath(s,.1,'idle',.7),.7);let count=0;
  for(let i=0;i<100;i++)count+=stepPonyBreath(s,.1,'idle',.7)>0;
  assert(count>=2&&count<=4);const before=s.t;assert.equal(stepPonyBreath(s,0,'idle',.7),0);assert.equal(s.t,before);
  assert.equal(stepPonyBreath(s,1000,'walk',.7),0,'long frame is bounded, no accumulated burst');
});
test('muzzle follows own procedural head and instance scale/yaw, with two distinct nostrils',()=>{
  const p={neck:0,headYaw:0},at=new T.Vector3(),dir=new T.Vector3(),m=new T.Matrix4();
  ponyMuzzle(p,m,-1,at,dir);const left=at.clone(),standing=at.y;
  ponyMuzzle(p,m,1,at,dir);assert(Math.abs(at.distanceTo(left)-2*S.nostrils.at[2])<1e-8);
  assert(Math.abs(dir.length()-1)<1e-8);p.neck=1.5;ponyMuzzle(p,m,1,at,dir);assert(at.y<standing-.5&&dir.y<-.9);
  p.neck=0;const plain=at.clone();ponyMuzzle(p,m,1,plain,dir);
  m.makeRotationY(Math.PI/2).scale(new T.Vector3(2,2,2)).setPosition(10,3,20);
  ponyMuzzle(p,m,1,at,dir);assert(at.distanceTo(plain.applyMatrix4(m))<1e-8);assert(dir.x>0&&Math.abs(dir.length()-1)<1e-8);
});
test('one capped pool: no texture, correct depth, live upload, wind drift, expiry and zero draw range',()=>{
  const scene=new T.Scene(),pool=new PonyBreath(scene),at=new T.Vector3(),dir=new T.Vector3(0,0,1);
  assert.equal(scene.children.length,1);assert(!pool.points.visible);assert.equal(pool.points.geometry.drawRange.count,0);
  assert(pool.points.material.depthTest&&!pool.points.material.depthWrite);assert.equal(pool.points.material.map,undefined);
  for(let i=0;i<B.max+10;i++)pool.emit(at,dir,.7,2);assert.equal(pool.list.length,B.max);
  pool.update(.1,{dir:new T.Vector2(1,0),power:1});assert.equal(pool.n,B.max);assert(pool.list[0].x>0);
  assert.equal(pool.points.geometry.drawRange.count,B.max);assert([...pool.pos.array,...pool.data.array].every(Number.isFinite));
  for(let i=0;i<20;i++)pool.update(.1);assert.equal(pool.n,0);assert(!pool.points.visible);assert.equal(pool.points.geometry.drawRange.count,0);
  pool.emit(at,dir,0);assert.equal(pool.list.length,0);pool.dispose();assert.equal(scene.children.length,0);
});
test('real public paddock uses only snow proxy; hidden/far/warm have zero puffs and no extra pony meshes',async()=>{
  globalThis.addEventListener??=()=>{};globalThis.localStorage??={getItem:()=>null,setItem(){}};
  const {Paddock}=await import('../src/paddock.js'),scene=new T.Scene(),camera=new T.PerspectiveCamera();
  const p=new Paddock({scene,camera,ground:()=>0});const q=p.ponies[0];camera.position.set(q.x,2,q.z+3);
  p.update(.1);assert.equal(p.breathPuffs.n,0);p.snowy=true;p.update(0);assert.equal(p.breathPuffs.n,0);
  p.update(.1);assert(p.breathPuffs.n>0);assert.equal(scene.children.filter(o=>o.name==='pony-breath').length,1);assert.equal(p.mesh.count,2);
  p.update(.1,true);assert.equal(p.breathPuffs.n,0);p.snowy=false;p.update(.1);assert.equal(p.breathPuffs.n,0);
  p.snowy=true;camera.position.set(10000,2,10000);p.update(.1);assert.equal(p.breathPuffs.n,0);
});
