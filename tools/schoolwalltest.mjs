// Public #157, upstream #1534: shared wall/shelter plan and actual far-walk collision, preserving #146.
import test from 'node:test';
import assert from 'node:assert/strict';
import {SITE} from '../src/config.js';
import {schoolWallPlan,schoolWallSolids,boxSegments} from '../src/schoolwall.js';
import {farSegments} from '../src/farwalk.js';
const near=(a,b)=>assert(Math.abs(a-b)<1e-8,`${a} versus ${b}`);
const hits=(a,b,segments)=>segments.filter(([x0,z0,x1,z1])=>{
 const dx=b[0]-a[0],dz=b[1]-a[1],ex=x1-x0,ez=z1-z0,den=dx*ez-dz*ex;
 if(Math.abs(den)<1e-10)return false;
 const t=((x0-a[0])*ez-(z0-a[1])*ex)/den,u=((x0-a[0])*dz-(z0-a[1])*dx)/den;
 return t>=0&&t<=1&&u>=0&&u<=1;
});
test('the reviewed wall ends at the recessed eastern shelter with a clear front and roof overhead',()=>{
 const p=schoolWallPlan(),s=p.shelter;assert.equal(p.rects.length,3);near(p.h,2);near(p.rects[0].x0,-26);near(p.rects[0].x1,13.6);near(s.x1,19.6);near(s.backZ,-33.3);near(s.frontZ,-32);near(s.roof.y0,2.5);near(s.roof.y1,2.72);near(s.wallEnd,25.1);near(s.post.x,17.2);near(s.post.z,-30.9);near(s.cabinet.x0,25.425);near(s.cabinet.x1,25.775);
 assert(hits([22.5,-29],[22.5,-38],schoolWallSolids().flatMap(boxSegments)).length>0);assert(hits([25.6,-29],[25.6,-38],schoolWallSolids().flatMap(boxSegments)).length>0);assert(hits([17.2,-28.5],[17.2,-32],schoolWallSolids().flatMap(boxSegments)).length>0);
 assert.equal(hits([16.5,-29],[16.5,-32.6],schoolWallSolids().flatMap(boxSegments)).length,0);
 assert(hits([16.5,-32.6],[16.5,-38],schoolWallSolids().flatMap(boxSegments)).length>0);
 assert(hits([16.5,-32.6],[10,-32.6],schoolWallSolids().flatMap(boxSegments)).length>0);
});
test('actual ground collision contains the wall, both shelter walls, its post and the moved greenhouse',()=>{
 const all=farSegments();for(const b of[...schoolWallSolids(),SITE.school.greenhouse])for(const s of boxSegments(b))assert(all.some(a=>a.every((v,i)=>v===s[i])));
 assert(hits([0,-28],[0,-38],all).length>0);assert(hits([12.5,-28],[12.5,-38],all).length>0);
 assert.equal(hits([16.5,-29],[16.5,-32.6],all).length,0);
 assert.deepEqual([SITE.school.greenhouse.x0,SITE.school.greenhouse.x1],[0,8]);
});
test('without a shelter the existing wall-only plan and collision stay available',()=>{
 const W={...SITE.school.wall,shelter:null},p=schoolWallPlan(W);assert.equal(p.shelter,null);assert.equal(p.rects.length,1);assert.deepEqual(schoolWallSolids(p),p.rects);assert.equal(schoolWallPlan(null),null);assert.deepEqual(schoolWallSolids(null),[]);
});
