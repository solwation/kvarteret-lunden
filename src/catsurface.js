// Neutral procedural profiles selectively adapted from solwation/lunden-3d-apartment
// src/catmodel.js at 8e226fa183ade3ccc1bfb638427bc75e2120d7b6 (#1918).
// Geometry only: public pivots, solid colours, passive poses and merged rendering remain local.
import * as THREE from 'three';
import {CAT_SURFACE as S} from './config.js';
const cache=new Map();
export function catSurface(kind='sphere',...args){
 const key=kind+':'+args.join(',');if(cache.has(key))return cache.get(key);let g;
 if(kind==='ear'){
  const positions=[],uv=[],indices=[],[cols,rows]=S.segments.ear;
  for(let f=0;f<2;f++)for(let j=0;j<=rows;j++)for(let i=0;i<=cols;i++){const v=j/rows,u=i/cols*2-1,width=S.ear.width*(1-v)**S.ear.taper;positions.push(u*width,S.ear.base+v*S.ear.height,f?S.ear.back*(1-v):S.ear.rim*u*u*(1-v)-S.ear.recess*Math.sin(Math.PI*v)*(1-u*u));uv.push(i/cols,v);}
  const layer=(rows+1)*(cols+1);
  for(let f=0;f<2;f++)for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const a=f*layer+j*(cols+1)+i,b=a+1,c=a+cols+1,d=c+1;indices.push(...(f?[a,c,b,b,c,d]:[a,b,c,b,d,c]));}
  for(let j=0;j<rows;j++)for(const i of[0,cols]){const a=j*(cols+1)+i,c=a+cols+1;indices.push(a,c,a+layer,c,c+layer,a+layer);}
  for(let i=0;i<cols;i++)indices.push(i,i+layer,i+1,i+1,i+layer,i+1+layer);
  g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();
 }else if(kind==='limb'){
  const[r,len]=args,pts=[[0,-len],[.7*r,-len+.3*r],[.85*r,-len+.9*r],[.8*r,-.62*len],[.95*r,-.42*len],[S.limbBulge[0]*r,-.16*len],[S.limbBulge[1]*r,0],[.75*r,.75*r],[0,r]];
  g=new THREE.LatheGeometry(pts.map(([x,y])=>new THREE.Vector2(x,y)),S.segments.limb);
 }else{
  g=new THREE.SphereGeometry(1,...(['head','body','muzzle'].includes(kind)?kind==='muzzle'?S.segments.muzzle:S.segments.main:kind==='eye'?S.segments.eye:S.segments.small));
  const p=g.attributes.position;
  for(let i=0;i<p.count;i++){let x=p.getX(i),y=p.getY(i),z=p.getZ(i);
   if(kind==='head'){x*=S.headWidth[0]+S.headWidth[1]*Math.exp(-Math.pow((y+S.headWidth[2])/S.headWidth[3],2));z*=z>0?S.headFrontDepth:1;}
   if(kind==='body'){x*=S.bodyWidth*(1-S.bodyTaper*y);z=z*S.bodyDepth+S.neckForward*Math.max(0,y)*Math.max(0,z);}
   if(kind==='eye'){y*=Math.max(0,1-x*x)**S.eyeProfile[0];z*=S.eyeProfile[1];}
   if(kind==='muzzle'){y*=S.muzzleHeight[0]+S.muzzleHeight[1]*Math.abs(x);z*=S.muzzleDepth[0]+S.muzzleDepth[1]*Math.abs(x);}
   p.setXYZ(i,x,y,z);
  }g.computeVertexNormals();
 }
 const n=g.attributes.normal;for(let i=0;i<n.count;i++)if(n.getX(i)**2+n.getY(i)**2+n.getZ(i)**2<1e-12)n.setXYZ(i,0,1,0);g.normalizeNormals();
 cache.set(key,g);return g;
}
