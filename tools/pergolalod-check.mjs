// #287 (original #1968): the pergolas' string-light bulbs fade, a pergola at a time, into octahedra by the distance to the
// pergola's box (src/lod.js BatchLod). Real-browser check of the actual app (desktop): the same frames with the far level off
// (BatchLod.enabled = false) and on, at 8, 21 and 40 m from the first pergola — draw calls, triangles, screenshots, no page errors,
// no external requests.  usage: CHROME_PATH=… node tools/pergolalod-check.mjs <baseUrl> <outDir>
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const [base='http://localhost:8406',out='docs/verification/287']=process.argv.slice(2);
await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
const report={views:{},errors:[],external:[]};
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
 report.pergolas=await page.evaluate(async()=>{const {batchLods}=await import('/src/lod.js');const t=m=>(m.geometry.index?m.geometry.index.count:m.geometry.attributes.position.count)/3;
  return batchLods().filter(l=>l.near.name==='courtyard-pergola-bulbs').map(l=>({bulbs:l.near.userData.bulbs,near:t(l.near),far:t(l.far),box:[l.box.min.toArray(),l.box.max.toArray()].map(v=>v.map(x=>Math.round(x*10)/10))}));});
 for(const d of [8,21,40]){
  for(const on of [false,true]){
   const info=await page.evaluate(async([d,on])=>{
    const {navigation:n,camera,renderer,scene}=window.lundenViewer,{batchLods,updateInstanceLods}=await import('/src/lod.js');
    const lods=batchLods().filter(l=>l.near.name==='courtyard-pergola-bulbs'),b=lods[0].box,c=b.getCenter(b.min.clone());
    const x=c.x,z=b.max.z+d;n.teleport(x,0,z);for(let i=0;i<10;i++)n.update(1/120);
    const dx=c.x-camera.position.x,dz=c.z-camera.position.z;camera.rotation.set(Math.atan2(c.y-camera.position.y,Math.hypot(dx,dz)),Math.atan2(-dx,-dz),0,'YXZ');camera.updateMatrixWorld(true);
    for(const l of lods)l.enabled=on;updateInstanceLods(camera);renderer.info.reset();renderer.render(scene,camera);
    const r=renderer.info.render;return {calls:r.calls,triangles:r.triangles,levels:lods.map(l=>`${Math.round(l.d)}m:${l.near.visible?'N':''}${l.far.visible?'F':''}`)};
   },[d,on]);
   (report.views[d+'m']??={})[on?'lod':'full']=info;
   await page.screenshot({path:`${out}/${d}m-${on?'lod':'full'}.png`});
  }
 }
 console.log(JSON.stringify(report.pergolas));for(const [k,v] of Object.entries(report.views))console.log(k,JSON.stringify(v));
 assert(report.pergolas.length>0&&report.pergolas.every(p=>p.near===p.bulbs*80&&p.far===p.bulbs*8),'each pergola: one merged mesh per level, 8 instead of 80 triangles per bulb');
 const n=report.views['8m'],f=report.views['40m'];
 assert(n.lod.calls===n.full.calls&&n.lod.triangles===n.full.triangles,'near: nothing changes');
 assert(f.lod.calls<=f.full.calls&&f.lod.triangles<f.full.triangles,'far: fewer triangles, never more calls');
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.external,[]);
 console.log('PASS pergola bulbs lighter far away, no runtime errors or external requests');
}catch(e){report.failure=e.stack;process.exitCode=1;console.error(e.stack);}
finally{await writeFile(out+'/pergolalod.json',JSON.stringify(report,null,1)+'\n');await browser.close();}
