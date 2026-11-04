import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {FOOTBALL_SITE as C} from './config.js';
import {footballLocal,footballWorld} from './footballgeo.js';
import {cutAtTerrain} from './roads.js';
const vector=(u,y,v)=>{const[x,z]=footballWorld(C,u,v);return new THREE.Vector3(x,y,z);};
const rectangle=(u,v,w,d)=>[[u-w/2,v-d/2],[u+w/2,v-d/2],[u+w/2,v+d/2],[u-w/2,v+d/2]].map(p=>footballWorld(C,...p));
/** Public #250: selective static fittings from original c10d16ad; no targets or updates. */
export function buildFootballSite(ground){
 const object=new THREE.Group();object.name='football-site';const parts=[],net=[],segments=[],footprints=[],supports=[],contacts=[];
 const y=(u,v)=>ground(...footballWorld(C,u,v));
 const tint=(g,color)=>{g=g.index?g.toNonIndexed():g;g.deleteAttribute('uv');const c=new THREE.Color(color),a=new Float32Array(g.attributes.position.count*3);for(let i=0;i<a.length;i+=3){a[i]=c.r;a[i+1]=c.g;a[i+2]=c.b;}g.setAttribute('color',new THREE.BufferAttribute(a,3));parts.push(g);};
 const box=(u,v,low,w,h,d,color)=>tint(new THREE.BoxGeometry(w,h,d).rotateY(C.yaw).translate(...vector(u,low+h/2,v).toArray()),color);
 const beam=(a,b,r,color)=>{const p=vector(...a),q=vector(...b),dir=q.clone().sub(p),g=new THREE.CylinderGeometry(r,r,dir.length(),6,1,false);g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),dir.normalize())).translate(...p.add(q).multiplyScalar(.5).toArray());tint(g,color);};
 const obstacle=(u,v,w,d,top)=>{const poly=rectangle(u,v,w,d);if(Number.isFinite(top))poly.top=top;footprints.push(poly);segments.push(...poly.map((a,i)=>[...a,...poly[(i+1)%poly.length]]));};
 function paint(a,b){const dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz);if(len<1e-5)return;const nx=-dz/len*C.lineWidth/2,nz=dx/len*C.lineWidth/2,p=[[a[0]-nx,a[1]-nz],[a[0]+nx,a[1]+nz],[b[0]+nx,b[1]+nz],[b[0]-nx,b[1]-nz]].map(q=>footballWorld(C,...q)),pos=[];
  for(const tri of[[p[0],p[1],p[2]],[p[0],p[2],p[3]]])for(const cut of cutAtTerrain(tri,ground.grid())){const v=cut.map(([x,z])=>[x,ground(x,z)+C.lineLift,z]);const u=v[1].map((n,i)=>n-v[0][i]),w=v[2].map((n,i)=>n-v[0][i]);if(u[2]*w[0]-u[0]*w[2]<0)[v[1],v[2]]=[v[2],v[1]];pos.push(...v.flat());}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.computeVertexNormals();tint(g,C.colors.line);
 }
 const W=C.width/2,L=C.length/2,corners=[[-W,-L],[W,-L],[W,L],[-W,L]];corners.forEach((a,i)=>paint(a,corners[(i+1)%4]));paint([-W,0],[W,0]);
 for(let i=0;i<C.circleSteps;i++){const a=i*Math.PI*2/C.circleSteps,b=(i+1)*Math.PI*2/C.circleSteps;paint([Math.cos(a)*C.centerRadius,Math.sin(a)*C.centerRadius],[Math.cos(b)*C.centerRadius,Math.sin(b)*C.centerRadius]);}
 for(const sign of[-1,1]){
  const z=sign*L,back=z+sign*C.goalDepth,left=-C.goalWidth/2,right=C.goalWidth/2;
  const top=(u,v)=>y(u,v)+C.goalHeight;
  for(const u of[left,right]){beam([u,y(u,z),z],[u,top(u,z),z],C.postR,C.colors.frame);beam([u,y(u,back),back],[u,top(u,back),back],C.postR,C.colors.frame);beam([u,top(u,z),z],[u,top(u,back),back],C.postR,C.colors.frame);obstacle(u,z,C.postR*2,C.postR*2);obstacle(u,back,C.postR*2,C.postR*2);for(const v of[z,back])contacts.push({kind:'goal-post',point:vector(u,y(u,v),v).toArray()});}
  beam([left,top(left,z),z],[right,top(right,z),z],C.postR,C.colors.frame);beam([left,y(left,back),back],[right,y(right,back),back],C.postR,C.colors.frame);
  const line=(a,b)=>net.push(...vector(...a).toArray(),...vector(...b).toArray());
  for(let u=left;u<=right+.0001;u+=C.netStep)line([u,y(u,back),back],[u,top(u,back),back]);
  for(let h=0;h<=C.goalHeight+.0001;h+=C.netStep){line([left,y(left,back)+h,back],[right,y(right,back)+h,back]);for(const u of[left,right])line([u,y(u,z)+h,z],[u,y(u,back)+h,back]);}
  for(const u of[left,right])for(let v=0;v<=C.goalDepth+.0001;v+=C.netStep)line([u,y(u,z+sign*v),z+sign*v],[u,top(u,z+sign*v),z+sign*v]);
  paint([-C.boxWidth/2,z],[-C.boxWidth/2,z-sign*C.boxDepth]);paint([-C.boxWidth/2,z-sign*C.boxDepth],[C.boxWidth/2,z-sign*C.boxDepth]);paint([C.boxWidth/2,z-sign*C.boxDepth],[C.boxWidth/2,z]);
 }
 const B=C.bench;
 for(const v of B.offsets){
  const u=B.side,legs=[[-B.depth*.35,-B.length*.38],[B.depth*.35,-B.length*.38],[-B.depth*.35,B.length*.38],[B.depth*.35,B.length*.38]],base=Math.max(...legs.map(([a,b])=>y(u+a,v+b))),seat=base+B.seat;
  for(const[a,b]of legs){const h=seat-B.slat-y(u+a,v+b);box(u+a,v+b,y(u+a,v+b),B.leg,h,B.leg,C.colors.metal);contacts.push({kind:'bench-foot',point:vector(u+a,y(u+a,v+b),v+b).toArray()});}
  for(let i=0;i<5;i++)box(u-B.depth/2+B.depth*(i+.5)/5,v,seat-B.slat,B.depth/5*.88,B.slat,B.length,C.colors.wood);
  for(let i=0;i<3;i++)box(u+B.depth/2,v,seat+B.back*(i+.5)/3,B.slat,B.back/3*.75,B.length,C.colors.wood);
  const[x,z]=footballWorld(C,u,v);obstacle(u,v,B.depth+.06,B.length,seat);supports.push({kind:'bench',y:seat,center:[x,z]});
 }
 const F=C.fountain,[u,v]=F.at,base=y(u,v);box(u,v,base,F.base,F.height*.75,F.base,C.colors.metal);
 const bowl=new THREE.CylinderGeometry(F.bowlR,F.bowlR*.7,F.height*.18,12,1,true);bowl.translate(...vector(u,base+F.height*.84,v).toArray());tint(bowl,C.colors.metal);
 box(u,v,base+F.height*.9,F.bowlR*1.3,F.height*.05,F.bowlR*1.3,C.colors.frame);
 obstacle(u,v,F.base,F.base);contacts.push({kind:'fountain-foot',point:vector(u,base,v).toArray()});
 const mesh=new THREE.Mesh(mergeGeometries(parts),new THREE.MeshStandardMaterial({color:0xffffff,vertexColors:true,roughness:.82}));mesh.name='football-static';mesh.receiveShadow=true;object.add(mesh);for(const g of parts)g.dispose();
 const ng=new THREE.BufferGeometry();ng.setAttribute('position',new THREE.Float32BufferAttribute(net,3));const nets=new THREE.LineSegments(ng,new THREE.LineBasicMaterial({color:C.colors.net,transparent:true,opacity:.7}));nets.name='football-nets';object.add(nets);
 return{object,segments,footprints,contacts,supports,ground,
  groundAt(x,z){const[u,v]=footballLocal(C,x,z);const field=Math.abs(u)<=W+C.runoff&&Math.abs(v)<=L+C.runoff,apron=u>=W&&u<=W+C.apron&&v>=C.apronSpan[0]&&v<=C.apronSpan[1];return field||apron?ground(x,z):null;}};
}