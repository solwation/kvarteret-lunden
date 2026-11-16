// Public #284 (original #1958): the site's trees fade into a far level by distance (src/lod.js). Real-browser check of the
// actual app: the same views with the LOD (default) and with one level everywhere (?nolod) — draw calls, triangles, the far
// meshes' instance counts, screenshots, no page errors, no external requests.
// usage: CHROME_PATH=… node tools/treelod-check.mjs <baseUrl> <outDir>
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const [base='http://localhost:8406',out='docs/verification/284']=process.argv.slice(2);
await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
const report={views:{},errors:[],external:[]};
const views={area:'area',courtyard:'courtyard',core:'core'};
try{
 for(const mode of ['nolod','lod']){
  const page=await (await browser.newContext({viewport:{width:960,height:540},deviceScaleFactor:1})).newPage();page.setDefaultTimeout(120000);
  await page.clock.setFixedTime(new Date('2026-07-16T10:00:00Z'));
  page.on('pageerror',e=>report.errors.push(`${mode}: ${e.message}`));
  page.on('request',r=>{if(new URL(r.url()).origin!==new URL(base).origin)report.external.push(r.url());});
  await page.goto(base+'/'+(mode==='nolod'?'?nolod':''));
  await page.waitForFunction(()=>window.lundenViewer?.renderer.info.render.frame>0,null,{timeout:180000});
  await page.evaluate(()=>window.lundenViewer.renderer.setAnimationLoop(null));
  await page.locator('#start').click();await page.evaluate(()=>document.exitPointerLock?.());
  await page.evaluate(()=>document.querySelectorAll('#start,.overlay,#intro,#loading').forEach(e=>{e.style.display='none';}));
  for(const [name,loc] of Object.entries(views)){
   const info=await page.evaluate(async(loc)=>{
    const {navigation:n,camera,renderer,scene,moveTo}=window.lundenViewer;
    moveTo(loc);for(let i=0;i<20;i++)n.update(1/120);
    const {updateInstanceLods}=await import('/src/lod.js');updateInstanceLods(camera);
    renderer.info.reset();renderer.render(scene,camera);
    const r=renderer.info.render;let far=0,trees=0;scene.traverse(o=>{if(o.isInstancedMesh&&/^tree-/.test(o.name)){trees++;if(/ far$/.test(o.name))far+=o.count;}});
    return {calls:r.calls,triangles:r.triangles,farInstances:far,treeMeshes:trees};
   },loc);
   (report.views[name]??={})[mode]=info;
   await page.screenshot({path:`${out}/${mode}-${name}.png`});
  }
  await page.context().close();
 }
 for(const [name,v] of Object.entries(report.views))console.log(name,JSON.stringify(v));
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.external,[]);
 assert(Object.values(report.views).some(v=>v.lod.farInstances>0),'some trees use the far level');
 assert(Object.values(report.views).every(v=>v.nolod.farInstances===0),'?nolod draws one level everywhere');
 assert(Object.values(report.views).every(v=>v.lod.triangles<=v.nolod.triangles),'never more triangles with the LOD');
 console.log('PASS far trees lighter, no runtime errors or external requests');
}catch(e){report.failure=e.stack;process.exitCode=1;console.error(e.stack);}
finally{await writeFile(out+'/treelod.json',JSON.stringify(report,null,1)+'\n');await browser.close();}
