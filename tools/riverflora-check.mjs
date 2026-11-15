// Public #282 (original #1956): the water lilies on Höje å in the actual app (source server, repo root).
//   node tools/riverflora-check.mjs http://localhost:8160 docs/verification/282
// Checks: away from the river nothing is drawn (+0 draw calls); at a cluster the leaves and the flowers are exactly two draw calls;
// every leaf lies just over the water line, inside the open channel and off the bridge piers, along the whole river; `?month=1`
// shows none, `?month=5` leaves without flowers, `?noflora` builds nothing; no external request and no storage write.
// The render loop is stopped (SwiftShader draws the scene far below 1 frame/s); the production `update(eye, hidden, month)` is called.
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const base=process.argv[2]??'http://localhost:8160',out=process.argv[3]??'docs/verification/282';
await mkdir(out,{recursive:true});
const browser=await chromium.launch(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:undefined);
const result={};
try{
 const ctx=await browser.newContext({viewport:{width:1280,height:800},deviceScaleFactor:1});
 const open=async query=>{
  const page=await ctx.newPage(),errors=[],external=[];page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>{if(new URL(r.url()).origin!==new URL(base).origin)external.push(r.url());});
  await page.clock.setFixedTime(new Date('2026-06-15T10:00:00Z'));
  await page.goto(`${base}/?${query}`);
  await page.waitForFunction(()=>window.lundenViewer?.renderer.info.render.frame>0,null,{timeout:600000,polling:200});
  await page.evaluate(()=>{const a=lundenViewer;a.renderer.setAnimationLoop(null);document.getElementById('start').click();document.exitPointerLock?.();
   document.querySelectorAll('.topbar,.locations,.bottom-bar,#crosshair').forEach(e=>e.hidden=true);document.getElementById('resume')?.style.setProperty('display','none','important');});
  return{page,errors,external};
 };
 const {page,errors,external}=await open('month=7');
 await page.evaluate(async()=>{
  const a=lundenViewer,S=a.riverLilies,rb=await import('/src/riverbridge.js'),sur=await import('/src/surroundings.js'),C=await import('/src/config.js'),path=S.river.path;
  window.T={a,S,rb,sur,C,path,
   draw(){a.camera.updateMatrixWorld(true);a.scene.updateMatrixWorld(true);a.renderer.info.reset();a.renderer.render(a.scene,a.camera);return a.renderer.info.render.calls;},
   calls(){const m=Object.values(S.meshes),was=m.map(x=>x.visible),on=T.draw();m.forEach(x=>x.visible=false);const off=T.draw();m.forEach((x,i)=>x.visible=was[i]);T.draw();return{on,off,delta:on-off};},
   inPier:(x,z)=>rb.pierBoxes().some(b=>Math.max(Math.abs((x-b.x)*b.dx+(z-b.z)*b.dz),Math.abs(-(x-b.x)*b.dz+(z-b.z)*b.dx))<rb.bridgeRecords[0].pier/2+.05)};
 });
 // 1. every leaf along the whole river: on the water line, inside the channel, off the piers, below the drawn banks
 result.leaves=await page.evaluate(()=>{const{S,rb,sur,path,C}=T,o={},bad=[];let flowers=S.items.flowers.length;
  for(const e of S.items.lilies){path.nearest(e.x,e.z,o);const hw=path.at(o.s,{}).hw,water=rb.waterYAt(e.x,e.z);
   if(Math.abs(o.u)+e.r>hw||Math.abs(e.y-water-C.RIVER_FLORA.lilies.lift)>.03||T.inPier(e.x,e.z)||sur.renderedTerrainY(e.x,e.z)>e.y)bad.push([e.s,o.u,hw,e.y-water,sur.renderedTerrainY(e.x,e.z)-e.y]);}
  return{count:S.items.lilies.length,flowers,bad};});
 assert(result.leaves.count>30&&result.leaves.flowers>5&&result.leaves.bad.length===0,`every leaf lies on open water (${JSON.stringify(result.leaves.bad.slice(0,3))})`);
 // 2. away from the river (the courtyard): invisible, +0 draw calls
 result.far=await page.evaluate(()=>{const{a,S,rb}=T;a.camera.position.set(-20,1.6,10);a.camera.lookAt(-20,1.6,60);const shown=S.update(a.camera.position,false,7);
  return{riverDistance:rb.riverDistance(-20,10),shown,calls:T.calls()};});
 assert(result.far.riverDistance>80&&!result.far.shown&&result.far.calls.delta===0,'away from the river nothing is drawn');
 // 3. from the bank beside the cluster with the most leaves: two draw calls in July, one in May, none in January or hidden
 result.bank=await page.evaluate(()=>{const{a,S,rb,sur,path}=T,L=S.items.lilies;let best=L[0],n=0;
  for(const e of L){const k=L.filter(q=>Math.abs(q.s-e.s)<3).length;if(k>n){n=k;best=e;}}
  const o=path.nearest(best.x,best.z,{}),c=path.at(o.s,{}),side=Math.sign(o.u)||1,ex=c.x-c.tz*side*(c.hw+2.2),ez=c.z+c.tx*side*(c.hw+2.2);
  a.camera.position.set(ex,sur.renderedTerrainY(ex,ez)+1.6,ez);a.camera.lookAt(best.x,best.y,best.z);
  const july=S.update(a.camera.position,false,7),cj=T.calls(),drawn={lilies:S.meshes.lilies.count,flowers:S.meshes.flowers.count};
  const may=S.update(a.camera.position,false,5),cm=T.calls();
  const jan=S.update(a.camera.position,false,1),cw=T.calls();
  const hid=S.update(a.camera.position,true,7),ch=T.calls();
  S.update(a.camera.position,false,7);T.draw();
  return{station:o.s,cluster:n,eye:a.camera.position.toArray(),july,drawn,calls:{july:cj.delta,may:cm.delta,january:cw.delta,hidden:ch.delta},may,jan,hid};});
 assert(result.bank.july&&result.bank.calls.july===2&&result.bank.drawn.lilies>3,'leaves and flowers are exactly two draw calls in July');
 assert(result.bank.may&&result.bank.calls.may===1&&!result.bank.jan&&result.bank.calls.january===0&&!result.bank.hid&&result.bank.calls.hidden===0,'May: leaves only; January and below ground: nothing');
 await page.screenshot({path:`${out}/nackrosor-fran-stranden.png`});
 result.storage=await page.evaluate(()=>({local:Object.keys(localStorage).filter(k=>/flora|lil/i.test(k)),session:Object.keys(sessionStorage).filter(k=>/flora|lil/i.test(k))}));
 assert(result.storage.local.length===0&&result.storage.session.length===0&&external.length===0&&errors.length===0,`no storage, no external request, no page error (${external.concat(errors).slice(0,3)})`);
 await page.close();
 // 4. ?noflora builds nothing
 const off=await open('month=7&noflora');
 result.noflora=await off.page.evaluate(()=>({built:!!lundenViewer.riverLilies,meshes:['river-lilies','river-lily-flowers'].map(n=>!!lundenViewer.scene.getObjectByName(n))}));
 assert(!result.noflora.built&&!result.noflora.meshes.some(Boolean)&&off.errors.length===0,'?noflora leaves the lilies out');
 result.ok=true;
}finally{await writeFile(`${out}/result.json`,JSON.stringify(result,null,1));await browser.close();}
console.log(JSON.stringify(result,null,1));
