// Selective public adaptation of upstream f9ef2cc0, original #1554. No car model or fill.
import test from 'node:test';
import assert from 'node:assert/strict';
import {SITE, PLAYER} from '../src/config.js';
import {parkingLots,insidePoly,onEastRoad,onEastBuildingAt} from '../src/parkinglayout.js';
import {bridgeheadIsland,bridgeheadGroundRect} from '../src/street.js';
const E=SITE.east,B=SITE.street.bridgehead,I=B.island;
test('assumed lot is one row of seven whole bays square to the street (#1703) with a low house behind',()=>{
 const lot=E.access.find(p=>p.source==='guess-1554'),house=E.buildings.find(b=>b.source==='guess-1703'),mine=parkingLots().lots.find(p=>p.source===lot.source);
 assert.equal(lot.capacitySource,'guess');assert.equal(lot.surfaceSource,'guess');assert(!('fill' in lot));assert(!E.access.some(p=>p.source==='guess-1554-aisle'));assert.equal(mine.bays.length,7);assert.equal(mine.runs.length,1);assert(mine.bays.every(b=>Math.abs(b.n[0])>.999));assert(house&&house.roof==='flat'&&house.windows===false);
 for(const b of mine.bays)for(const du of[-1,0,1])for(const dn of[-1,0,1]){const x=b.cx+b.u[0]*du*b.hw+b.n[0]*dn*b.hd,z=b.cz+b.u[1]*du*b.hw+b.n[1]*dn*b.hd;assert(insidePoly(x,z,lot.polygon));assert(!onEastBuildingAt(x,z));assert(!onEastRoad(x,z,-.1));}
 assert.deepEqual(parkingLots().lots.filter(p=>p!==mine).map(p=>[p.source,p.bays.length]),[['145221623',36],['44447969',10]]);
 for(const b of mine.bays)for(const du of[-1,1])for(const dn of[-1,1]){const x=b.cx+b.u[0]*du*b.hw+b.n[0]*dn*b.hd,z=b.cz+b.u[1]*du*b.hw+b.n[1]*dn*b.hd;assert(!insidePoly(x,z,house.polygon.slice(0,-1)),'stall clear of the low house');}
 console.log('whole bays',mine.bays.length,'nominal capacity',lot.capacity);
});
test('refuge has outward sides, mark-supported corners and two bollards; lanes remain open',()=>{
 const ground=(x,z)=>.015*x-.08*z,{kerb,bollards}=bridgeheadIsland(ground),p=kerb.attributes.position,n=kerb.attributes.normal;
 assert.equal(p.count/3,10);assert.equal(bollards.length,2);assert(I.h+I.lift<PLAYER.stepUp);assert(I.x0-B.crossings[0].x0>1);assert(B.crossings[0].x1-I.x1>1);
 for(let i=0;i<p.count;i++){const d=p.getY(i)-ground(p.getX(i),p.getZ(i));assert(Math.min(Math.abs(d-.145),Math.abs(d+.02))<1e-6);}
 for(let i=0;i<p.count;i+=3){if(n.getY(i)>.5)continue;const x=(p.getX(i)+p.getX(i+1)+p.getX(i+2))/3-(I.x0+I.x1)/2,z=(p.getZ(i)+p.getZ(i+1)+p.getZ(i+2))/3-(I.z0+I.z1)/2;assert(n.getX(i)*x+n.getZ(i)*z>0);}
 const foot=[...E.paths,...(SITE.paths??[])].filter(p=>p.path);
 const onFoot=(x,z)=>foot.some(p=>p.path.slice(1).some((q,i)=>{const a=p.path[i],dx=q[0]-a[0],dz=q[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz||1)));return Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz)<(p.w??2)/2+.1;}));
 for(const at of [...B.signs,B.flag.at,...I.bollards])assert(!onFoot(at[0],at[1]),'mapped footway remains clear');
 for(const at of [...B.signs,B.flag.at]){assert(!onEastBuildingAt(...at));assert(!onEastRoad(at[0],at[1],.1));}
});
test('crossing cells follow sloping ground without covering refuge',()=>{
 const ground=(x,z)=>.02*x-.08*z;let bars=0,vertices=0;
 for(const c of B.crossings)for(let x=c.x0+.25;x+.5<=c.x1+1e-9;x+=1)if(x+.5<=I.x0||x>=I.x1){bars++;const p=bridgeheadGroundRect(x,x+.5,c.z0,c.z1,.045,ground).attributes.position;vertices+=p.count;for(let i=0;i<p.count;i++)assert(Math.abs(p.getY(i)-ground(p.getX(i),p.getZ(i))-.045)<1e-6);}
 assert.equal(bars,4);assert.equal(vertices,144);
});
