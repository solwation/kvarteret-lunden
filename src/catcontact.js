// Public low-poly model adaptation of the contact ideas in original catclimb/catnuzzlepose at 131b5d9d.
import * as THREE from 'three';
import {OUTDOOR_CATS as C} from './config.js';
const v=new THREE.Vector3();
export function noseShape(p){const nose=p.head.getObjectByName('cat-nose');p.stand=p.wantStand=1;p.gaitAmp=0;p.walked=false;p.headOff.set(0,0,0);p.head.rotation.set(0,0,0);p.pose(0);p.object.updateMatrixWorld(true);nose.getWorldPosition(v);return{nose,y:v.y,z:v.z,radius:.006};}
export const pawContact=p=>({paws:[p.shoulder.children.at(-1),p.leftShoulder.children.at(-1),...p.parts.hips.map(h=>h.foot)]});
export function rubNoses(c,pair){if(pair.contact<C.nuzzle.settle)return;const p=c.p,i=pair.cats.indexOf(c),sign=i?1:-1,t=pair.contact-C.nuzzle.settle;p.head.rotation.set(0,sign*C.nuzzle.rub*Math.sin(t*C.nuzzle.rubHz[0]),sign*C.nuzzle.rub*Math.sin(t*C.nuzzle.rubHz[1]));p.object.updateMatrixWorld(true);c.mesh.updateMatrixWorld(true);
 const world=new THREE.Vector3(pair.point.x+sign*pair.unit.x*c.nuzzleShape.radius,pair.point.y,pair.point.z+sign*pair.unit.z*c.nuzzleShape.radius),desired=c.mesh.worldToLocal(world),current=p.head.parent.worldToLocal(c.nuzzleShape.nose.getWorldPosition(new THREE.Vector3()));p.head.parent.worldToLocal(desired);p.head.position.add(desired.sub(current));p.object.updateMatrixWorld(true);
}
export function alignClimb(c){const s=c.at;if(c.st!=='route'||!s?.climbing||!Number.isFinite(s.wallZ)||s.contactBlend<=0)return;const K=C.exploration;c.mesh.updateMatrixWorld(true);let lead=-Infinity,body=-Infinity;const a=c.mesh.geometry.attributes.position;
 for(let i=0;i<a.count;i++){v.fromBufferAttribute(a,i).applyMatrix4(c.mesh.matrixWorld);body=Math.max(body,v.z);if(c.climbContact.ranges.some(([start,end])=>i>=start&&i<end))lead=Math.max(lead,v.z);}
 const offset=Math.max(-K.climbMaxOffset,Math.min(K.climbMaxOffset,s.wallZ-K.climbPawInset-lead));c.mesh.position.z+=Math.min(offset*s.contactBlend,s.wallZ-K.climbPawInset-body);c.mesh.updateMatrixWorld(true);
}
