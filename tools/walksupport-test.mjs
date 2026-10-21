import assert from 'node:assert/strict';
import * as T from 'three';
import {WalkSupport} from '../src/walksupport.js';
const mesh=(x0,x1,z0,z1,height)=>new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute([[x0,height(x0,z0),z0],[x0,height(x0,z1),z1],[x1,height(x1,z0),z0],[x1,height(x1,z0),z0],[x0,height(x0,z1),z1],[x1,height(x1,z1),z1]].flat(),3));
const support=new WalkSupport({x0:0,x1:4,z0:0,z1:4},{X:[-4,0,4,8],Z:[-4,0,4,8]});
support.add(mesh(-4,8,-4,8,(x,z)=>.1*x+.2*z));
// Higher overlapping upward faces win, but downward box undersides cannot become support.
support.add(mesh(1,3,1,3,()=>2));const down=mesh(1,3,1,3,()=>99);const array=down.attributes.position.array;for(let i=0;i<array.length;i+=9)for(let k=0;k<3;k++)[array[i+3+k],array[i+6+k]]=[array[i+6+k],array[i+3+k]];support.add(down);
assert.equal(support.top(2,2),2);assert(Math.abs(support.top(.5,.5)-.15)<1e-7);
assert.equal(support.top(20,20),null);assert.equal(support.height(20,20,7),7);
assert.deepEqual(support.outer,{x0:-4,x1:8,z0:-4,z1:8});
// Every outer edge/corner meets the unchanged original contract continuously.
for(const [x,z,dx,dz]of[[-4,2,1,0],[8,2,-1,0],[2,-4,0,1],[2,8,0,-1],[-4,-4,1,1],[-4,8,1,-1],[8,-4,-1,1],[8,8,-1,-1]]){
 assert.equal(support.height(x,z,3),3);assert(Math.abs(support.height(x+dx*1e-5,z+dz*1e-5,3)-3)<1e-9);
}
// Core boundary has weight1, and adjacent bucket/triangle edges share the same plane.
for(const[x,z]of[[0,2],[4,2],[2,0],[2,4]])assert.equal(support.weight(x,z),1);
for(let x=-3;x<=7;x+=.25)assert(Math.abs(support.top(x,-1)-(.1*x-.2))<2e-7);
console.log('PASS: actual Float32 planes, stacked support, orientation, buckets, four-edge/corner handoff and unchanged exterior');
