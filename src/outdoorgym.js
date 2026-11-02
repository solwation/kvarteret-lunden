import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {OUTDOOR_GYM as C} from './config.js';

// Public #234: fixed park fittings selected from original 52be76d1, with no interaction state.
const yaw=C.yaw*Math.PI/180,cos=Math.cos(yaw),sin=Math.sin(yaw),up=new THREE.Vector3(0,1,0);
export const gymPoint=(x,z)=>[C.at[0]+cos*x+sin*z,C.at[1]-sin*x+cos*z];
/** The same support/board footprints that are drawn below. The overhead bar stays passable. */
export function gymSolids(){
 const out=[],P=C.geometry.pull,B=C.geometry.press,T=C.geometry.step;
 for(const s of C.stations){
  const rect=(x0,z0,x1,z1)=>out.push([[x0,z0],[x1,z0],[x1,z1],[x0,z1]].map(([x,z])=>gymPoint(s.x+x,s.z+z)));
  if(s.id==='pullup')for(const x of [-P.postX,P.postX])rect(x-C.post,-P.braceBack-C.post,x+C.post,C.post);
  else if(s.id==='press'){
   rect(-B.halfW,-B.halfD,B.halfW,B.halfD);
   for(const x of [-B.postX,B.postX])rect(x-C.post,B.logZ-C.post,x+C.post,B.logZ+C.post);
  }else rect(-T.halfW,-T.halfD,T.halfW,T.halfD);
 }
 return out;
}
export const gymSegments=()=>gymSolids().flatMap(p=>p.map((a,i)=>[...a,...p[(i+1)%p.length]]));

/** Three static batches: wood (including the fixed stock), steel and ground-following chips. */
export function buildOutdoorGym(ground){
 const group=new THREE.Group();group.name='outdoor-gym';
 const parts={wood:[],steel:[],chips:[]},supports=[];
 const pad=[],nx=Math.ceil(C.pad[0]/C.padStep),nz=Math.ceil(C.pad[1]/C.padStep);
 const point=(i,j)=>{const[x,z]=gymPoint(-C.pad[0]/2+C.pad[0]*i/nx,-C.pad[1]/2+C.pad[1]*j/nz);return[x,ground(x,z)+C.padLift,z];};
 for(let i=0;i<nx;i++)for(let j=0;j<nz;j++){const a=point(i,j),b=point(i+1,j),d=point(i,j+1),e=point(i+1,j+1);pad.push(...a,...d,...b,...b,...d,...e);}
 const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.Float32BufferAttribute(pad,3));pg.computeVertexNormals();parts.chips.push(pg);
 for(const spec of C.stations){
  const at=(x,z)=>gymPoint(spec.x+x,spec.z+z);
  const base=Math.max(...[[-1,-1],[-1,1],[1,-1],[1,1]].map(p=>ground(...at(...p))));
  const world=(x,y,z)=>{const[a,b]=at(x,z);return new THREE.Vector3(a,base+y,b);};
  const box=(w,h,d,x,y,z)=>parts.wood.push(new THREE.BoxGeometry(w,h,d).rotateY(yaw).translate(...world(x,y,z).toArray()));
  const beam=(a,b,r,kind='wood')=>{const u=world(...a),v=world(...b),delta=v.clone().sub(u),g=new THREE.CylinderGeometry(r,r,delta.length(),C.geometry.postSides);g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(up,delta.clone().normalize())).translate(...u.add(v).multiplyScalar(.5).toArray());parts[kind].push(g);};
  const post=(x,z,h)=>{const[a,b]=at(x,z),bottom=ground(a,b)-C.board;beam([x,bottom-base,z],[x,h,z],C.post);supports.push({station:spec.id,x:a,z:b,bottom,top:base+h});};
  const P=C.geometry.pull,B=C.geometry.press,T=C.geometry.step;
  if(spec.id==='pullup'){
   for(const x of [-P.postX,P.postX]){post(x,0,C.pullHeight+P.topExtra);beam([x,C.pullHeight-P.braceDrop,0],[x,0,-P.braceBack],C.post*.65);}
   beam([-P.postX,C.pullHeight,0],[P.postX,C.pullHeight,0],C.bar,'steel');
  }else if(spec.id==='press'){
   for(const x of [-B.postX,B.postX])post(x,B.logZ,B.logY);
   for(const z of [-B.footZ,B.footZ]){box(B.benchW,C.board,B.crossD,0,C.bench/2,z);for(const x of [-B.footX,B.footX])post(x,z,C.bench);}
   for(const x of [-B.slatX,0,B.slatX])box(B.slatW,C.board,B.benchD,x,C.bench,0);
   const stock=new THREE.CylinderGeometry(C.logRadius,C.logRadius,B.logLength,C.geometry.logSides).rotateZ(Math.PI/2).rotateY(yaw).translate(...world(0,B.logY,B.logZ).toArray());parts.wood.push(stock);
  }else{
   for(const x of [-T.footX,T.footX])for(const z of [-T.footZ,T.footZ])post(x,z,C.stepHeight);
   for(const z of [-T.footZ,0,T.footZ])box(T.boardW,C.board,T.boardD,0,C.stepHeight,z);
  }
 }
 const materials={wood:new THREE.MeshStandardMaterial({color:C.wood,roughness:.85}),steel:new THREE.MeshStandardMaterial({color:C.steel,roughness:.65,metalness:.35}),chips:new THREE.MeshStandardMaterial({color:C.chips,roughness:1})};
 for(const[k,list]of Object.entries(parts)){const geo=mergeGeometries(list.map(g=>g.index?g.toNonIndexed():g));const mesh=new THREE.Mesh(geo,materials[k]);mesh.name=`gym-${k}`;mesh.castShadow=k!=='chips';mesh.receiveShadow=true;group.add(mesh);list.forEach(g=>g.dispose());}
 group.userData.supports=supports;
 return group;
}
