// Public #280 (original #1952): the drifting flecks on Höje å in the actual app (source server, repo root).
//   node tools/riverdrift-check.mjs http://localhost:8160 docs/verification/280
// Checks: away from the river nothing is drawn (+0 draw calls); at the river the flecks are exactly one draw call, lie on open water
// below the drawn banks (never over land, never in a bridge pier) at stations along the whole river and move downstream at
// RIVER_DRIFT.speed; `?nodrift` leaves them out; no external request and no storage. The render loop is stopped (SwiftShader draws the
// scene far below 1 frame/s): time advances through the production `update(dt, eye, hidden)` in 1/60 s steps, not by wall clock.
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const base=process.argv[2]??'http://localhost:8160',out=process.argv[3]??'docs/verification/280';
await mkdir(out,{recursive:true});
const browser=await chromium.launch(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:undefined);
const result={};
try{
 const ctx=await browser.newContext({viewport:{width:1280,height:800},deviceScaleFactor:1});
 const open=async query=>{
  const page=await ctx.newPage(),errors=[],external=[];page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>{if(new URL(r.url()).origin!==new URL(base).origin)external.push(r.url());});
  await page.clock.setFixedTime(new Date('2026-06-15T10:00:00Z'));
  await page.goto(`${base}/?month=6${query}`);
  await page.waitForFunction(()=>window.lundenViewer?.renderer.info.render.frame>0,null,{timeout:600000,polling:200});
  await page.evaluate(()=>{const a=lundenViewer;a.renderer.setAnimationLoop(null);document.getElementById('start').click();document.exitPointerLock?.();
   document.querySelectorAll('.topbar,.locations,.bottom-bar,#crosshair').forEach(e=>e.hidden=true);document.getElementById('resume')?.style.setProperty('display','none','important');});
  return{page,errors,external};
 };
 const {page,errors,external}=await open('');
 await page.evaluate(async()=>{
  const a=lundenViewer,S=a.riverDrift,rb=await import('/src/riverbridge.js'),sur=await import('/src/surroundings.js'),C=await import('/src/config.js'),path=S.river.path;
  window.T={a,S,rb,sur,C,path,
   // the drawn things, read back from the buffers the GPU gets (world coordinates)
   flecks(){const p=S.pos.array,c=S.col.array,m=S.mesh.position,o=[];if(!S.mesh.visible)return o;
    for(let i=0;i<S.C.count;i++){const k=i*12;o.push({i,x:m.x+(p[k]+p[k+6])/2,y:m.y+p[k+1],z:m.z+(p[k+2]+p[k+8])/2,a:c[i*16+3]});}return o;},
   ids:()=>Array.from({length:S.C.count},(_,i)=>S.field.particle(i,S.t,S.near.s,{}).id),
   draw(){a.camera.updateMatrixWorld(true);a.scene.updateMatrixWorld(true);a.renderer.info.reset();a.renderer.render(a.scene,a.camera);return a.renderer.info.render.calls;},
   calls(){const was=S.mesh.visible;S.mesh.visible=true;const on=T.draw();S.mesh.visible=false;const off=T.draw();S.mesh.visible=was;T.draw();return{on,off,delta:on-off};},
   // an eye on the bank at chainage s: `off` m outside the channel's edge, 1.6 m over the drawn ground, looking at the water `ahead` m downstream
   bank(s,off=2.5,ahead=5,side=1){const c=path.at(s,{}),d=path.at(s+ahead,{}),ex=c.x-c.tz*side*(c.hw+off),ez=c.z+c.tx*side*(c.hw+off);
    a.camera.position.set(ex,sur.renderedTerrainY(ex,ez)+1.6,ez);a.camera.lookAt(d.x,rb.waterYAt(d.x,d.z),d.z);return{eye:a.camera.position.toArray(),flow:[c.tx,c.tz]};},
   inPier:(x,z)=>rb.pierBoxes().some(b=>Math.max(Math.abs((x-b.x)*b.dx+(z-b.z)*b.dz),Math.abs(-(x-b.x)*b.dz+(z-b.z)*b.dx))<rb.bridgeRecords[0].pier/2+.05)};
 });

 // 1. away from the river (the courtyard): invisible, +0 draw calls
 result.far=await page.evaluate(()=>{const{a,S,rb}=T;a.camera.position.set(-20,1.6,10);a.camera.lookAt(-20,1.6,60);const shown=S.update(1/60,a.camera.position,false);
  const withMesh=T.draw();a.scene.remove(S.mesh);const without=T.draw();a.scene.add(S.mesh);
  return{eye:a.camera.position.toArray(),riverDistance:rb.riverDistance(-20,10),shown,visible:S.mesh.visible,calls:{withMesh,without,delta:withMesh-without}};});
 assert(result.far.riverDistance>75&&!result.far.shown&&!result.far.visible&&result.far.calls.delta===0,'away from the river nothing is drawn');
 result.hidden=await page.evaluate(()=>{const{a,S,path}=T,c=path.at(430,{});return{shown:S.update(0,{x:c.x,y:0,z:c.z},true),visible:S.mesh.visible};});
 assert(!result.hidden.shown&&!result.hidden.visible,'hidden (below ground) draws nothing even at the river');

 // 2. from the bank: one draw call; two frames 4 s apart move downstream at the configured speed
 const station=Number(process.env.STATION??430);
 const A=await page.evaluate(station=>{const{a,S}=T,view=T.bank(station);S.update(0,a.camera.position,false);const calls=T.calls();return{view,t:S.t,sc:S.near.s,f:T.flecks(),ids:T.ids(),calls};},station);
 await page.screenshot({path:`${out}/strand-bild-1.png`});
 const B=await page.evaluate(()=>{const{a,S,C}=T;for(let i=0;i<240;i++)S.update(1/60,a.camera.position,false);T.draw();return{t:S.t,f:T.flecks(),ids:T.ids(),speed:C.RIVER_DRIFT.speed};});
 await page.screenshot({path:`${out}/strand-bild-2.png`});
 {const dt=B.t-A.t,[fx,fz]=A.view.flow;let n=0,along=0,across=0,lo=Infinity,hi=-Infinity;
  for(let i=0;i<A.f.length;i++){if(A.ids[i]!==B.ids[i]||A.f[i].a<.2)continue;const dx=B.f[i].x-A.f[i].x,dz=B.f[i].z-A.f[i].z,v=(dx*fx+dz*fz)/dt;n++;along+=v;across+=Math.abs(-dx*fz+dz*fx)/dt;lo=Math.min(lo,v);hi=Math.max(hi,v);}
  result.bank={station,eye:A.view.eye,calls:A.calls,visibleFlecks:A.f.filter(f=>f.a>.05).length,tracked:n,seconds:dt,meanDownstream:along/n,min:lo,max:hi,meanAcross:across/n,speed:B.speed};
  assert.equal(A.calls.delta,1,'the flecks are exactly one draw call');
  assert(n>100&&Math.abs(dt-4)<1e-6&&Math.abs(along/n-B.speed)<.03&&lo>0,'the flecks move downstream at the configured speed');}

 // 3. along the whole river (production update, eye moved from station to station): on open water under the drawn banks, clear of the piers
 result.whole=await page.evaluate(()=>{const{a,S,rb,sur,path}=T,o={stations:0,drawn:0,offChannel:[],overGround:[],pier:[],underDeck:0,bends:0,lift:[Infinity,-Infinity],edge:Infinity};
  for(let s=0;s<=path.length;s+=12){const c=path.at(s,{});S.update(0,{x:c.x,y:0,z:c.z},false);o.stations++;
   for(const f of T.flecks()){if(f.a<.02)continue;o.drawn++;const r=rb.riverAt(f.x,f.z),water=rb.waterYAt(f.x,f.z),lift=f.y-water,inside=r.width/2-r.distance;
    o.lift[0]=Math.min(o.lift[0],lift);o.lift[1]=Math.max(o.lift[1],lift);o.edge=Math.min(o.edge,inside);
    if(inside<.05)o.offChannel.push([+f.x.toFixed(1),+f.z.toFixed(1),+inside.toFixed(2)]);
    // the drawn terrain there must lie under the water line (inside the walkable/drawn terrain; the far backdrop strips carry no sampled surface)
    const g=sur.renderedTerrainY(f.x,f.z);if(Number.isFinite(g)&&g>water-.02)o.overGround.push([+f.x.toFixed(1),+f.z.toFixed(1),+(g-water).toFixed(2)]);
    if(T.inPier(f.x,f.z))o.pier.push([f.x,f.z]);if(rb.deckAt(f.x,f.z)!==null)o.underDeck++;
    if(Math.hypot(f.x-131.4,f.z-74.6)<12||Math.hypot(f.x+67.5,f.z-166.1)<12)o.bends++;}}
  return{...o,offChannelN:o.offChannel.length,overGroundN:o.overGround.length,offChannel:o.offChannel.slice(0,12),overGround:o.overGround.slice(0,12),pathLength:path.length};});
 assert(result.whole.drawn>5000&&result.whole.offChannelN===0&&result.whole.overGroundN===0&&result.whole.pier.length===0&&result.whole.underDeck>20&&result.whole.bends>50
  &&result.whole.lift[0]>.004&&result.whole.lift[1]<.03,'every fleck lies on open water, clear of land and piers');

 // 4. at the road bridge's upstream edge, deck height, looking down at the water upstream: one draw call there too
 result.bridge=await page.evaluate(()=>{const{a,S,rb,C,path}=T,r=rb.bridgeRecords[0],n=path.nearest(r.x,r.z,{}),c=path.at(n.s,{}),u=path.at(n.s-9,{});
  const e=r.width/2+1;a.camera.position.set(c.x-c.tx*e,C.SITE.bridges.deckY+1.6,c.z-c.tz*e); // (just outside the upstream rail, so the rail does not fill the picture)
  a.camera.lookAt(u.x,rb.waterYAt(u.x,u.z),u.z);
  const shown=S.update(0,a.camera.position,false);return{eye:a.camera.position.toArray(),overWater:a.camera.position.y-rb.waterYAt(c.x,c.z),shown,calls:T.calls()};});
 assert(result.bridge.shown&&result.bridge.calls.delta===1,'at the road bridge: drawn, one draw call');

 result.isolation={errors,external,storage:await page.evaluate(()=>({local:Object.keys(localStorage),session:Object.keys(sessionStorage)}))};
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
 await page.close();

 // 5. ?nodrift leaves the flecks out
 const off=await open('&nodrift');
 result.nodrift=await off.page.evaluate(()=>({riverDrift:lundenViewer.riverDrift,inScene:!!lundenViewer.scene.getObjectByName('river-drift')}));
 assert(result.nodrift.riverDrift===null&&!result.nodrift.inScene&&!off.errors.length,'?nodrift leaves the flecks out');
 result.ok=true;console.log('PASS',JSON.stringify(result,null,1));
}catch(e){result.ok=false;result.error=e.stack;console.error('FAILED',e.stack,JSON.stringify(result,null,1));process.exitCode=1;}
finally{await browser.close();await writeFile(`${out}/result.json`,JSON.stringify(result,null,2)+'\n');}
