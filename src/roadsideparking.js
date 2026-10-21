// #125–129: bounded civil planes; #129 grades its usable row and pins the source court boundary.
// Geometry-derived grading/layout are guesses, not surveyed road/parking heights.
import * as THREE from 'three';
import { PARKING_LOT as P } from './config.js';
import { subtractConvex } from './polygoncut.js';
const area=p=>p.reduce((s,a,i)=>{const b=p[(i+1)%p.length];return s+a[0]*b[1]-b[0]*a[1]},0);
const box=p=>({x0:Math.min(...p.map(q=>q[0])),x1:Math.max(...p.map(q=>q[0])),z0:Math.min(...p.map(q=>q[1])),z1:Math.max(...p.map(q=>q[1]))});
const insideRing=(x,z,p)=>{let hit=false;for(let i=0,j=p.length-1;i<p.length;j=i++)if((p[i][1]>z)!==(p[j][1]>z)&&x<(p[j][0]-p[i][0])*(z-p[i][1])/(p[j][1]-p[i][1])+p[i][0])hit=!hit;return hit};
const overlaps=(a,b)=>a.x1>=b.x0&&a.x0<=b.x1&&a.z1>=b.z0&&a.z0<=b.z1;
export const parkingHull=points=>{const p=points.map(p=>p.slice()).sort((a,b)=>a[0]-b[0]||a[1]-b[1]),cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]),half=p=>{const h=[];for(const q of p){while(h.length>1&&cross(h.at(-2),h.at(-1),q)<=0)h.pop();h.push(q)}return h};return [...half(p).slice(0,-1),...half(p.slice().reverse()).slice(0,-1)]};
const clip=(poly,a,b,sign=1)=>{const out=[],d=p=>sign*((b[0]-a[0])*(p[2]-a[1])-(b[1]-a[1])*(p[0]-a[0]));for(let i=0;i<poly.length;i++){const p=poly[i],q=poly[(i+1)%poly.length],dp=d(p),dq=d(q);if(dp>=-1e-9)out.push(p);if((dp<0&&dq>0)||(dp>0&&dq<0)){const t=dp/(dp-dq);out.push(p.map((v,k)=>v+(q[k]-v)*t))}}return out};
const intersect=(poly,ring)=>ring.reduce((p,a,i)=>p.length?clip(p,a,ring[(i+1)%ring.length],Math.sign(area(ring))):p,poly);
const fan=p=>p.slice(1,-1).map((_,i)=>[p[0],p[i+1],p[i+2]]);
const nearest=(p,path)=>{let best;for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i],dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/(dx*dx+dz*dz))),q=[a[0]+t*dx,a[1]+t*dz],d=Math.hypot(p[0]-q[0],p[1]-q[1]);if(!best||d<best.d)best={q,d}}return best};
export function roadsidePockets(lots,road,ground,buildings=[],access=[]){return lots.map(lot=>{
 const polygon=lot.polygon.at(-1)[0]===lot.polygon[0][0]&&lot.polygon.at(-1)[1]===lot.polygon[0][1]?lot.polygon.slice(0,-1):lot.polygon.slice(),center=polygon.reduce((s,p)=>[s[0]+p[0]/polygon.length,s[1]+p[1]/polygon.length],[0,0]),edges=polygon.map((a,i)=>{const b=polygon[(i+1)%polygon.length];return{a,b,length:Math.hypot(b[0]-a[0],b[1]-a[1]),distance:nearest([(a[0]+b[0])/2,(a[1]+b[1])/2],road.path).d}}),long=edges.slice().sort((a,b)=>b.length-a.length).slice(0,2),front=lot.layoutEdge?{a:polygon[lot.layoutEdge[0]],b:polygon[lot.layoutEdge[1]],length:Math.hypot(...polygon[lot.layoutEdge[0]].map((v,i)=>polygon[lot.layoutEdge[1]][i]-v))}:long.sort((a,b)=>a.distance-b.distance)[0],u=[(front.b[0]-front.a[0])/front.length,(front.b[1]-front.a[1])/front.length],n=[-u[1],u[0]];
 if((center[0]-front.a[0])*n[0]+(center[1]-front.a[1])*n[1]<0){n[0]*=-1;n[1]*=-1}
 const contact=[nearest(front.a,road.path),nearest(front.b,road.path)],a=contact[0].q,b=contact[1].q,dx=b[0]-a[0],dz=b[1]-a[1],ll=dx*dx+dz*dz,y0=ground(...a),y1=ground(...b),plane=(x,z)=>y0+(y1-y0)*((x-a[0])*dx+(z-a[1])*dz)/ll,footprint=['concave-row','double-row'].includes(lot.layout)?polygon:parkingHull([...polygon,a,b]),depth=lot.transition??Math.min(...edges.map(e=>e.length)),bb=box(footprint),support={x0:Math.fround(bb.x0-depth),x1:Math.fround(bb.x1+depth),z0:Math.fround(bb.z0-depth),z1:Math.fround(bb.z1+depth)},supportRing=[[support.x0,support.z0],[support.x1,support.z0],[support.x1,support.z1],[support.x0,support.z1]];
 const inside=(x,z)=>insideRing(x,z,footprint)||edgeDistance(x,z)<1e-9; // Preserve the complete source ring, including concave notches.
 const edgeDistance=(x,z)=>nearest([x,z],[...footprint,footprint[0]]).d;
 const bayDepth=lot.bayDepth??P.bayD,paintRings=lot.layout==='concave-row'?THREE.ShapeUtils.triangulateShape(polygon.map(([x,z])=>new THREE.Vector2(x,z)),[]).map(t=>t.map(i=>polygon[i])):[polygon],clipPaint=poly=>paintRings.map(r=>intersect(poly.map(([x,z])=>[x,0,z]),r).map(p=>[p[0],p[2]])).filter(p=>p.length>=3);
 const bayCount=lot.bayCount??Math.floor((lot.layoutEdge?front.length:Math.min(...long.map(e=>e.length)))/P.bayW),halfRun=bayCount*P.bayW/2;
 const rowCenter=lot.layoutEdge?[front.a[0]+u[0]*(lot.rowAlong??front.length/2)+n[0]*(bayDepth/2+(lot.layoutInset??0)),front.a[1]+u[1]*(lot.rowAlong??front.length/2)+n[1]*(bayDepth/2+(lot.layoutInset??0))]:center,at=(along,across)=>[rowCenter[0]+u[0]*along+n[0]*across,rowCenter[1]+u[1]*along+n[1]*across],bays=Array.from({length:bayCount},(_,i)=>({width:P.bayW,depth:bayDepth,corners:[at(i*P.bayW-halfRun,-bayDepth/2),at((i+1)*P.bayW-halfRun,-bayDepth/2),at((i+1)*P.bayW-halfRun,bayDepth/2),at(i*P.bayW-halfRun,bayDepth/2)]})),paint=[];
 for(let i=0;i<=bayCount;i++){const t=i*P.bayW-halfRun,poly=[at(t-P.lineW/2,-bayDepth/2),at(t+P.lineW/2,-bayDepth/2),at(t+P.lineW/2,bayDepth/2),at(t-P.lineW/2,bayDepth/2)];paint.push(...clipPaint(poly))}
 // Rear boundary only: the road-facing front remains open, with no invented internal aisle.
 const rear=lot.layoutEdge?-bayDepth/2:bayDepth/2-P.lineW;
 paint.push(...clipPaint([at(-halfRun,rear),at(halfRun,rear),at(halfRun,rear+P.lineW),at(-halfRun,rear+P.lineW)]));
 let finalBays=bays,finalPaint=paint,reserved=null,reservedIntervals=null,aisle=null,entry=null;
 if(lot.layout==='double-row'){
  const origin=front.a,across=q=>(q[0]-origin[0])*n[0]+(q[1]-origin[1])*n[1],along=q=>(q[0]-origin[0])*u[0]+(q[1]-origin[1])*u[1],D=Math.max(...polygon.map(across)),W=lot.aisleW;
  reservedIntervals=[lot.reservedRoad,...(lot.otherReservedRoads??[])].filter(Boolean).map((id,pathIndex)=>{const path=access.find(p=>p.source===id).path,points=[];
  for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i],na=across(a),nb=across(b);if(pathIndex===0&&na<0&&nb>=0){const t=na/(na-nb);entry=a.map((v,k)=>v+(b[k]-v)*t)}let lo=0,hi=1;for(const [edge,sign]of[[-W/2,1],[D+W/2,-1]]){const da=sign*(na-edge),db=sign*(nb-edge);if(da<0&&db<0){hi=-1;break}if((da<0)!==(db<0)){const t=da/(da-db);if(da<0)lo=Math.max(lo,t);else hi=Math.min(hi,t)}}if(hi>=lo)for(const t of[lo,hi])points.push(along([a[0]+t*(b[0]-a[0]),a[1]+t*(b[1]-a[1])]))}
  return[Math.min(...points)-W/2,Math.max(...points)+W/2]});reserved=reservedIntervals[0];aisle=[(D-W)/2,(D+W)/2];finalBays=[];finalPaint=[];
  const xy=(s,t)=>[origin[0]+u[0]*s+n[0]*t,origin[1]+u[1]*s+n[1]*t],count=lot.bayCount??Math.floor(front.length/P.bayW),offset=(front.length-count*P.bayW)/2;
  for(const [t0,t1,rear]of[[aisle[0]-P.bayD,aisle[0],aisle[0]-P.bayD],[aisle[1],aisle[1]+P.bayD,aisle[1]+P.bayD-P.lineW]])for(let i=0;i<count;i++){const s0=offset+i*P.bayW,s1=s0+P.bayW;if(reservedIntervals.some(r=>s1>r[0]&&s0<r[1]))continue;const corners=[xy(s0,t0),xy(s1,t0),xy(s1,t1),xy(s0,t1)];finalBays.push({width:P.bayW,depth:P.bayD,corners});for(const s of[s0,s1])finalPaint.push(...clipPaint([xy(s-P.lineW/2,t0),xy(s+P.lineW/2,t0),xy(s+P.lineW/2,t1),xy(s-P.lineW/2,t1)]));finalPaint.push(...clipPaint([xy(s0,rear),xy(s1,rear),xy(s1,rear+P.lineW),xy(s0,rear+P.lineW)]));}
 }
 const gradeRing=lot.gradeRow?[bays[0].corners[0],bays.at(-1).corners[1],bays.at(-1).corners[2],bays[0].corners[3]]:footprint;
 const guards=lot.protectBuildings?buildings.filter(b=>overlaps(box(b.polygon),support)).map(b=>b.polygon.slice(0,-1)):[],weight=(x,z)=>{const d=lot.gradeRow?(insideRing(x,z,gradeRing)?0:nearest([x,z],[...gradeRing,gradeRing[0]]).d):(inside(x,z)?0:edgeDistance(x,z)),t=Math.max(0,1-d/depth);let w=t*t*(3-2*t);if(lot.gradeRow){const bd=edgeDistance(x,z);if(!inside(x,z)||bd<1e-8)return 0;w*=bd/(bd+d)}if(guards.length){const bd=Math.min(...guards.map(p=>insideRing(x,z,p)?0:nearest([x,z],[...p,p[0]]).d));if(bd===0)return 0;w*=bd/(bd+d)}return w};
 return{source:lot.source,gradeRow:lot.gradeRow,gradeRing,protectBank:lot.protectBank,protectApron:lot.protectApron,otherAprons:lot.otherAprons,civilAnchors:lot.civilAnchors,reserved,reservedIntervals,aisle,entry,civilStage:lot.civilStage??(lot.protectBuildings?1:0),rearSupport:lot.rearSupport,protectBuildings:Boolean(lot.protectBuildings),polygon,center,u,n,contact,plane,footprint,depth,support,supportRing,bays:finalBays,paint:finalPaint,guards,weight};
})}
export function setParkingPlane(plan,anchors){const[a,b,c]=anchors,dx=b[0]-a[0],dz=b[1]-a[1],ex=c[0]-a[0],ez=c[1]-a[1],det=dx*ez-ex*dz,gx=((b[2]-a[2])*ez-(c[2]-a[2])*dz)/det,gz=(dx*(c[2]-a[2])-ex*(b[2]-a[2]))/det;plan.plane=(x,z)=>a[2]+gx*(x-a[0])+gz*(z-a[1]);plan.constraints={anchors,gradient:[gx,gz]};return plan}
/** #126: guess a civil plane from the actual adjacent building edge and road mean, not a narrow edge trench. */
export function constrainPocketPlane(plan,building,ground){
 const ring=building.polygon.slice(0,-1),edges=ring.map((a,i)=>[a,ring[(i+1)%ring.length]]).sort((a,b)=>nearest(plan.center,a).d-nearest(plan.center,b).d),[a,b]=edges[0],c=plan.contact.reduce((s,p)=>[s[0]+p.q[0]/2,s[1]+p.q[1]/2],[0,0]),y0=ground(...a),y1=ground(...b),y2=ground(...c),dx=b[0]-a[0],dz=b[1]-a[1],ex=c[0]-a[0],ez=c[1]-a[1],det=dx*ez-ex*dz,gx=((y1-y0)*ez-(y2-y0)*dz)/det,gz=(dx*(y2-y0)-ex*(y1-y0))/det;
 plan.plane=(x,z)=>y0+gx*(x-a[0])+gz*(z-a[1]);plan.constraints={anchors:[a,b,c].map(q=>[...q,ground(...q)]),gradient:[gx,gz]};return plan;
}
/** Replace only bounded local patches; original grid axes and all exterior affine faces remain intact. */
export function gradeParkingTerrain(geometry,plans,ranges,grid=null){
 const original=geometry.index,position=geometry.attributes.position,pos=Array.from(position.array),index=[],offset=new Map(),faces=[];
 const grade=(x,z,old)=>{let numerator=old,denominator=1;for(const p of plans){if(x<p.support.x0||x>p.support.x1||z<p.support.z0||z>p.support.z1)continue;const w=p.weight(x,z);if(w>=1-1e-12)return p.plane(x,z);const k=w/(1-w);numerator+=k*p.plane(x,z);denominator+=k}return numerator/denominator};
 const emit=(triangle,graded=false)=>{const t=triangle.map(p=>[Math.fround(p[0]),Math.fround(graded?grade(p[0],p[2],p[1]+.01)-.01:p[1]),Math.fround(p[2])]);if(Math.abs((t[1][0]-t[0][0])*(t[2][2]-t[0][2])-(t[1][2]-t[0][2])*(t[2][0]-t[0][0]))<=1e-9)return;for(const p of t){index.push(pos.length/3);pos.push(...p)}if(graded)faces.push({t,box:box(t.map(p=>[p[0],p[2]]))})};
 for(let k=0;k<original.count;k+=3){offset.set(k,index.length);const ids=[0,1,2].map(i=>original.getX(k+i)),t=ids.map(i=>[position.getX(i),position.getY(i),position.getZ(i)]),bb=box(t.map(p=>[p[0],p[2]])),active=plans.filter(p=>overlaps(bb,p.support));if(!active.length){index.push(...ids);continue}
  let outside=[t],inside=[];
  for(const p of active){const next=[];for(const q of outside){const c=intersect(q,p.supportRing);if(c.length>=3)inside.push(c);next.push(...subtractConvex(q,p.supportRing))}outside=next}
  for(const p of outside)for(const q of fan(p))emit(q);
  let pieces=inside;for(const p of active)for(const ring of[p.supportRing,p.footprint,...(p.gradeRow?[p.gradeRing]:[]),...p.guards])for(let i=0;i<ring.length;i++){const a=ring[i],b=ring[(i+1)%ring.length];pieces=pieces.flatMap(q=>[clip(q,a,b),clip(q,a,b,-1)].filter(q=>q.length>=3&&Math.abs(area(q.map(v=>[v[0],v[2]])))>1e-9))}
  for(const p of pieces)for(const q of fan(p))emit(q,true);
 }
 offset.set(original.count,index.length);for(const range of ranges??[]){const start=offset.get(range[0]),end=offset.get(range[0]+range[1]);range[0]=start;range[1]=end-start}
 geometry.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(new Array(pos.length/3*2).fill(0),2));geometry.setIndex(index);
 // Existing emitted-terrain cell axes bound candidate work without changing any geometry.
 const bins=new Map(),loc=(list,v)=>{let lo=0,hi=list.length-1;while(hi-lo>1){const mid=(lo+hi)>>1;if(list[mid]<=v)lo=mid;else hi=mid}return lo},cells=bb=>{const ids=[];if(grid)for(let j=loc(grid.Z,bb.z0);j<=loc(grid.Z,bb.z1);j++)for(let i=loc(grid.X,bb.x0);i<=loc(grid.X,bb.x1);i++)ids.push(j*grid.X.length+i);return ids};
 if(grid)faces.forEach((face,id)=>{for(const cell of cells({x0:face.box.x0-1e-8,x1:face.box.x1+1e-8,z0:face.box.z0-1e-8,z1:face.box.z1+1e-8})){if(!bins.has(cell))bins.set(cell,[]);bins.get(cell).push(id)}});
 const candidates=bb=>grid?[...new Set(cells(bb).flatMap(cell=>bins.get(cell)??[]))].sort((a,b)=>a-b).map(id=>faces[id]):faces;
 const top=(x,z)=>{if(!plans.some(p=>x>=p.support.x0&&x<=p.support.x1&&z>=p.support.z0&&z<=p.support.z1))return null;let y=-Infinity;for(const {t:[a,b,c],box:bbox}of candidates({x0:x,x1:x,z0:z,z1:z})){if(x<bbox.x0-1e-8||x>bbox.x1+1e-8||z<bbox.z0-1e-8||z>bbox.z1+1e-8)continue;const dx=b[0]-a[0],dz=b[2]-a[2],ex=c[0]-a[0],ez=c[2]-a[2],det=dx*ez-ex*dz,u=((x-a[0])*ez-(z-a[2])*ex)/det,v=(dx*(z-a[2])-dz*(x-a[0]))/det;if(u>=-1e-8&&v>=-1e-8&&u+v<=1+1e-8)y=Math.max(y,a[1]+u*(b[1]-a[1])+v*(c[1]-a[1]));}return Number.isFinite(y)?y:null};
 const cut=(poly,baseCut)=>{const bb=box(poly),active=plans.filter(p=>overlaps(bb,p.support));if(!active.length)return baseCut(poly);let outside=baseCut(poly).map(t=>t.map(([x,z])=>[x,0,z]));for(const p of active)outside=outside.flatMap(t=>subtractConvex(t,p.supportRing).flatMap(fan));const out=outside.map(t=>t.map(p=>[p[0],p[2]]));for(const f of candidates(bb)){if(!overlaps(bb,f.box))continue;const c=intersect(poly.map(([x,z])=>[x,0,z]),f.t.map(p=>[p[0],p[2]]));out.push(...fan(c).map(t=>t.map(p=>[p[0],p[2]])))}return out};
 return{plans,top,cut,faces};
}
