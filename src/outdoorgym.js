import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {OUTDOOR_GYM as C} from './config.js';
import {buildGymLandscape,gymColour,gymGroundMaterial,gymLandscapeSolids} from './outdoorgymdecor.js';

// Public #243: passive geometry selected from original e21ca752; fixed stock height from 35738970.
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
 out.push(...gymLandscapeSolids(gymPoint));
 return out;
}
export const gymSegments=()=>gymSolids().flatMap(p=>p.map((a,i)=>[...a,...p[(i+1)%p.length]]));

/** Static material batches only; no update loop or picking surfaces. */
export function buildOutdoorGym(ground){
 const group=new THREE.Group();group.name='outdoor-gym';const supports=[],woods=[],padded=[],metal=[];
 const materials={wood:new THREE.MeshStandardMaterial({vertexColors:true,roughness:.85}),steel:new THREE.MeshStandardMaterial({vertexColors:true,roughness:.75,metalness:.25}),gravel:gymGroundMaterial(),padded:new THREE.MeshStandardMaterial({color:C.landscape.padded,roughness:1})};
 const mesh=(parts,material,name)=>{if(name==='gym-passive-timber'){woods.push(...parts);return;}if(name==='gym-padded'){padded.push(...parts);return;}if(material.vertexColors)for(const g of parts)if(!g.attributes.color)gymColour(g,material===materials.wood?C.wood:C.steel);const merged=mergeGeometries(parts.map(g=>g.index?g.toNonIndexed():g));const m=new THREE.Mesh(merged,material);m.name=name;m.castShadow=name!=='gym-gravel';m.receiveShadow=true;group.add(m);parts.forEach(g=>g.dispose());return m;};
 group.userData.landscape=buildGymLandscape({point:gymPoint,ground,mesh,materials,metal});
    for(const spec of C.stations){
      const wood=[],at=(x,z)=>gymPoint(spec.x+x,spec.z+z),centre=at(0,0);
      const base=Math.max(...[[-1,-1],[-1,1],[1,-1],[1,1]].map(([x,z])=>ground(...at(x,z))));
      const world=(x,y,z)=>{const[p,q]=at(x,z);return new THREE.Vector3(p,base+y,q);};
      const box=(w,h,d,x,y,z,parts=wood)=>parts.push(new THREE.BoxGeometry(w,h,d).rotateY(yaw).translate(...world(x,y,z).toArray()));
      const beam=(a,b,r,parts=wood)=>{const u=world(...a),v=world(...b),delta=v.clone().sub(u),g=parts===metal?new THREE.CylinderGeometry(r,r,delta.length(),C.geometry.postSides):new THREE.BoxGeometry(r*2,delta.length(),r*2);g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(up,delta.clone().normalize())).translate(...u.add(v).multiplyScalar(.5).toArray());parts.push(g);};
      const post=(x,z,h)=>{const [px,pz]=at(x,z),bottom=ground(px,pz)-C.board;beam([x,bottom-base,z],[x,h,z],C.post);supports.push({station:spec.id,x:px,z:pz,bottom,top:base+h});box(...C.geometry.footPlate,x,C.geometry.footPlate[1],z+C.post+C.geometry.plateOffset,metal);box(...C.geometry.footPlate,x,h-C.geometry.footPlate[1],z+C.post+C.geometry.plateOffset,metal);};
      const P=C.geometry.pull,B=C.geometry.press,T=C.geometry.step;
      if(spec.id==='pullup'){
        for(const x of [-P.postX,P.postX])post(x,0,C.pullHeight+P.topExtra);
        beam([-P.postX,C.pullHeight,0],[P.postX,C.pullHeight,0],C.bar,metal);
        for(const x of [-P.postX,P.postX])beam([x,C.pullHeight-P.braceDrop,0],[x,0,-P.braceBack],C.post*.65);
      } else if(spec.id==='press'){
        for(const x of [-B.postX,B.postX])post(x,B.logZ,B.logY);
        for(const z of [-B.footZ,B.footZ]){box(B.benchW,C.board,B.crossD,0,C.bench/2,z);for(const x of [-B.footX,B.footX])post(x,z,C.bench);}
        for(const x of [-B.slatX,0,B.slatX])box(B.slatW,C.board,B.benchD,x,C.bench,0);
      } else {
        for(const x of [-T.footX,T.footX])for(const z of [-T.footZ,T.footZ])post(x,z,C.stepHeight);
        for(let k=0;k<T.slats;k++)box(T.boardW,C.board,T.depth/T.slats-C.geometry.slatGap,0,C.stepHeight,-T.depth/2+(k+.5)*T.depth/T.slats);
      }
      woods.push(...wood);
      if(spec.id==='press'){
        const g=new THREE.CylinderGeometry(C.logRadius,C.logRadius,B.logLength,C.geometry.logSides).rotateZ(Math.PI/2).rotateY(yaw).translate(...world(0,B.logY,B.logZ).toArray());
        padded.push(g);
      }
    }
    mesh(woods,materials.wood,'gym-wood');
    mesh(padded,materials.padded,'gym-padding');
    mesh(metal,materials.steel,'gym-steel');
    group.userData.supports=supports;
    group.updateMatrixWorld(true);
    return group;
}
