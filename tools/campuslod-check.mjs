// Public #285 (original #1969): the east campus' three detailed `east-modern*` batches fade into their light level (CAMPUS_LOD)
// by the distance to their bounding box (src/lod.js BatchLod). Real-browser check of the actual app (desktop): the same views
// with the far level and with it switched off (BatchLod.enabled = false: full detail everywhere) — draw calls, triangles, which
// level each batch draws, screenshots, no page errors, no external requests.
// usage: CHROME_PATH=… node tools/campuslod-check.mjs <baseUrl> <outDir>
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const [base='http://localhost:8406',out='docs/verification/285']=process.argv.slice(2);
await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
const report={views:{},errors:[],external:[]};
// [camera x, eye height above ground, z, look-at x, y, z]: the courtyard towards the campus, between, and among its buildings
const views={yard:[14,14,22,60,8,-75],between:[36,6,-8,80,6,-80],campus:[40,3,-47,90,6,-95]};
try{
 const page=await (await browser.newContext({viewport:{width:960,height:540},deviceScaleFactor:1})).newPage();page.setDefaultTimeout(120000);
 await page.clock.setFixedTime(new Date('2026-07-16T10:00:00Z'));
 page.on('pageerror',e=>report.errors.push(e.message));
 page.on('request',r=>{if(new URL(r.url()).origin!==new URL(base).origin)report.external.push(r.url());});
 await page.goto(base+'/');
 await page.waitForFunction(()=>window.lundenViewer?.renderer.info.render.frame>0,null,{timeout:180000});
 await page.evaluate(()=>window.lundenViewer.renderer.setAnimationLoop(null));
 await page.locator('#start').click();await page.evaluate(()=>document.exitPointerLock?.());
 await page.evaluate(()=>document.querySelectorAll('#start,.overlay,#intro,#loading').forEach(e=>{e.style.display='none';}));
 report.sizes=await page.evaluate(async()=>{const {batchLods}=await import('/src/lod.js');const t=m=>Math.round((m.geometry.index?m.geometry.index.count:m.geometry.attributes.position.count)/3);
  return batchLods().map(l=>({name:l.near.name,near:t(l.near),far:t(l.far),shadow:!!l.near.customDepthMaterial&&!!l.far.customDepthMaterial}));});
 for(const [name,v] of Object.entries(views)){
  for(const on of [false,true]){
   const info=await page.evaluate(async([v,on])=>{
    const {navigation:n,camera,renderer,scene}=window.lundenViewer,{batchLods,updateInstanceLods}=await import('/src/lod.js');
    n.teleport(v[0],0,v[2]);for(let i=0;i<10;i++)n.update(1/120);
    camera.position.y+=v[1]-1.6;const dx=v[3]-camera.position.x,dz=v[5]-camera.position.z;camera.rotation.set(Math.atan2(v[4]-camera.position.y,Math.hypot(dx,dz)),Math.atan2(-dx,-dz),0,'YXZ');camera.updateMatrixWorld(true);
    for(const l of batchLods())l.enabled=on;updateInstanceLods(camera);renderer.info.reset();renderer.render(scene,camera);
    const r=renderer.info.render;return {calls:r.calls,triangles:r.triangles,levels:batchLods().map(l=>`${l.near.name}:${Math.round(l.d)}m:${l.near.visible?'N':''}${l.far.visible?'F':''}`)};
   },[v,on]);
   (report.views[name]??={})[on?'lod':'full']=info;
   await page.screenshot({path:`${out}/${name}-${on?'lod':'full'}.png`});
  }
 }
 console.log(JSON.stringify(report.sizes));for(const [k,v] of Object.entries(report.views))console.log(k,JSON.stringify(v));
 assert.equal(report.sizes.length,3,'three campus batches with a light level');
 assert(report.sizes.every(s=>s.far<s.near&&s.shadow),'each far level is lighter; shadows follow');
 const y=report.views.yard;assert(y.lod.calls===y.full.calls&&y.lod.triangles<y.full.triangles&&y.lod.levels.every(l=>l.endsWith(':F')),'from the courtyard every batch is light, the same draw calls');
 assert(!report.views.campus.lod.levels.some(l=>l.endsWith(':F')),'among the campus buildings no batch is light only');
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.external,[]);
 console.log('PASS campus far level lighter, no runtime errors or external requests');
}catch(e){report.failure=e.stack;process.exitCode=1;console.error(e.stack);}
finally{await writeFile(out+'/campuslod.json',JSON.stringify(report,null,1)+'\n');await browser.close();}
