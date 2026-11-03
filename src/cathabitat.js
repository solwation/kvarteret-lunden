import { onVehicle } from './roads.js';
import { waterYAt } from './riverbridge.js';
// Selective generic ground/footprint source 131b5d9d9c11a5853320d7b36b4bf61409367f39; retains current PUBLIC raised Nordic parking.
// Public #245: fixed-footprint body clearance outside the navigation boundary; no player navigation changes.
import {SITE,WALK,OUTDOOR_CATS} from './config.js';
const inside=(p,x,z)=>{let yes=false;for(let i=0,j=p.length-1;i<p.length;j=i++)if((p[i][1]>z)!==(p[j][1]>z)&&x<(p[j][0]-p[i][0])*(z-p[i][1])/(p[j][1]-p[i][1])+p[i][0])yes=!yes;return yes;};
const buildings=[...SITE.blocks.map(b=>({polygon:[[b.x0,b.z0],[b.x1,b.z0],[b.x1,b.z1],[b.x0,b.z1]]})),...[SITE.west,SITE.east,SITE.north,SITE.south].flatMap(g=>g.buildings)];
const records=buildings.map(b=>({...b,x0:Math.min(...b.polygon.map(p=>p[0])),x1:Math.max(...b.polygon.map(p=>p[0])),z0:Math.min(...b.polygon.map(p=>p[1])),z1:Math.max(...b.polygon.map(p=>p[1]))}));
const nearEdge=(ring,x,z,r)=>ring.some((a,i)=>{const b=ring[(i+1)%ring.length],dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz||1)));return Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz)<r;});
export function catHabitatFree(x,z,r=OUTDOOR_CATS.exploration.footRadius){
 return !records.some(b=>{
  if(x<b.x0-r||x>b.x1+r||z<b.z0-r||z>b.z1+r)return false;
  return (inside(b.polygon,x,z)&&!(b.holes??[]).some(h=>inside(h,x,z)))||[b.polygon,...b.holes??[]].some(p=>nearEdge(p,x,z,r));
 });
}

// Cat-only contact follows the existing northern feathered ground and the Nordic parking quad too.
// These are samplers of existing surfaces (edgebackdrop.skirtTop and nordicgym.surface/parkingHeight), not new geometry.
export function createAmbientCatGround(courtyardGround,renderedGround,skirtTop,outdoor,farLevel){
  const B=SITE.backgroundGround,b=SITE.east.buildings.find(b=>b.template==='nordicgym'),p=b.polygon.slice(0,-1),H=b.model.hall;
  const dx=p[1][0]-p[0][0],dz=p[1][1]-p[0][1],len=Math.hypot(dx,dz),ux=dx/len,uz=dz/len,ox=p.reduce((a,q)=>a+q[0],0)/p.length,oz=p.reduce((a,q)=>a+q[1],0)/p.length;
  const local=(x,z)=>[(x-ox)*ux+(z-oz)*uz,-(x-ox)*uz+(z-oz)*ux],world=(x,z)=>[ox+x*ux-z*uz,oz+x*uz+z*ux],L=p.map(q=>local(...q));
  const x0=Math.max(...L.map(q=>q[0]))+H.parkingInset,x1=x0+H.parkingDepth,z0=Math.min(...L.map(q=>q[1]))+H.parkingInset,z1=Math.max(...L.map(q=>q[1]))-H.parkingInset;
  const heights=[[x0,z0],[x1,z0],[x1,z1],[x0,z1]].map(q=>renderedGround(...world(...q)));
  return(x,z)=>{
    let y=x>outdoor.x0&&x<outdoor.x1&&z>outdoor.z0&&z<outdoor.z1?courtyardGround(x,z):renderedGround(x,z);
    if(x<B.x0||x>B.x1||z<B.z0||z>B.z1){const edge=skirtTop(x,z,renderedGround);y=Number.isFinite(edge)?edge:farLevel;}
    const [a,b]=local(x,z);
    if(a>=x0&&a<=x1&&b>=z0&&b<=z1){const u=(a-x0)/(x1-x0),v=(b-z0)/(z1-z0),deck=(v<=u?heights[0]*(1-u)+heights[1]*(u-v)+heights[2]*v:heights[0]*(1-v)+heights[3]*(v-u)+heights[2]*u)+H.parkingLift;y=Math.max(y,deck);}
    return y;
  };
}

// Static local line clearance only; no route search or navigation mutation.
export const catSegmentDistance=(x,z,s)=>{const dx=s[2]-s[0],dz=s[3]-s[1],u=Math.max(0,Math.min(1,((x-s[0])*dx+(z-s[1])*dz)/(dx*dx+dz*dz||1)));return Math.hypot(x-s[0]-u*dx,z-s[1]-u*dz);};
export function createCatClear(ground,segments,trunks=[]){
 const K=OUTDOOR_CATS.exploration,map=new Map(),trees=new Map();
 for(const t of trunks){const radius=(WALK.trunk[t.kind]??WALK.trunk.tree)+K.footRadius;for(let x=Math.floor((t.x-radius)/K.barrierCell);x<=Math.floor((t.x+radius)/K.barrierCell);x++)for(let z=Math.floor((t.z-radius)/K.barrierCell);z<=Math.floor((t.z+radius)/K.barrierCell);z++){const key=x+','+z;if(!trees.has(key))trees.set(key,[]);trees.get(key).push({...t,radius});}}
 for(const s of segments){for(let x=Math.floor((Math.min(s[0],s[2])-K.footRadius)/K.barrierCell);x<=Math.floor((Math.max(s[0],s[2])+K.footRadius)/K.barrierCell);x++)for(let z=Math.floor((Math.min(s[1],s[3])-K.footRadius)/K.barrierCell);z<=Math.floor((Math.max(s[1],s[3])+K.footRadius)/K.barrierCell);z++){const key=x+','+z;if(!map.has(key))map.set(key,[]);map.get(key).push(s);}}
 return(ax,az,bx,bz)=>{const n=Math.max(1,Math.ceil(Math.hypot(bx-ax,bz-az)/K.sampleStep));let previous=ground(ax,az);
  for(let i=0;i<=n;i++){const x=ax+(bx-ax)*i/n,z=az+(bz-az)*i/n,y=ground(x,z),walls=map.get(Math.floor(x/K.barrierCell)+','+Math.floor(z/K.barrierCell))??[];
   if((trees.get(Math.floor(x/K.barrierCell)+','+Math.floor(z/K.barrierCell))??[]).some(t=>Math.hypot(x-t.x,z-t.z)<t.radius)||!catHabitatFree(x,z)||onVehicle(x,z,K.roadMargin)||y<=waterYAt(x,z)+K.waterClear||Math.abs(y-previous)>K.maxDrop||walls.some(s=>catSegmentDistance(x,z,s)<K.footRadius))return false;previous=y;
  }return true;
 };
}

export const catPhysicalSegments=segments=>segments.filter(s=>!((s[0]===WALK.x0&&s[2]===WALK.x1&&(s[1]===WALK.z0&&s[3]===WALK.z0||s[1]===WALK.z1&&s[3]===WALK.z1))||(s[1]===WALK.z0&&s[3]===WALK.z1&&(s[0]===WALK.x0&&s[2]===WALK.x0||s[0]===WALK.x1&&s[2]===WALK.x1))));
