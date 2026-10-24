// Public #165: real-browser view + render cost of the surface-tinted architectural edges.
// usage: node tools/architectureedges-check.mjs <baseUrl> <outDir> <label>
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
const [base='http://localhost:8405',out='artifacts/165',label='after']=process.argv.slice(2);
await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
const errors=[],results={label,views:{}};
try{
 const page=await (await browser.newContext({viewport:{width:960,height:540},deviceScaleFactor:1})).newPage();page.setDefaultTimeout(60000);
 await page.clock.setFixedTime(new Date('2026-10-16T10:00:00Z'));
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/');
 await page.waitForFunction(()=>window.lundenViewer?.renderer.info.render.frame>0,null,{timeout:120000});
 await page.evaluate(()=>window.lundenViewer.renderer.setAnimationLoop(null));
 await page.locator('#start').click();await page.evaluate(()=>document.exitPointerLock?.());
 await page.evaluate(()=>document.querySelectorAll('#start,.overlay,#intro,#loading').forEach(e=>{e.style.display='none';}));
 const views={core:{loc:'core',look:[0,1.4,0]},home:{loc:'home',look:null},courtyard:{loc:'courtyard',look:null}};
 for(const [name,v] of Object.entries(views)){
  const info=await page.evaluate(({loc})=>{
   const {world,navigation:n,camera,renderer,scene,moveTo}=window.lundenViewer;
   moveTo(loc);for(let i=0;i<20;i++)n.update(1/120);
   const lines=[];scene.traverse(o=>{if(o.userData.architectureEdges)lines.push(o);});
   const render=()=>{renderer.info.reset();renderer.render(scene,camera);return {calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,lines:renderer.info.render.lines};};
   const r=render();
   return {...r,batches:lines.length,edgeVerts:lines.reduce((s,l)=>s+l.geometry.attributes.position.count,0),colored:lines.filter(l=>l.geometry.getAttribute('color')).length,allocated:renderer.info.memory.geometries};
  },{loc:v.loc});
  results.views[name]=info;
  await page.screenshot({path:`${out}/${label}-${name}.png`});
 }
}finally{await browser.close();}
results.errors=errors;
await writeFile(`${out}/${label}.json`,JSON.stringify(results,null,1));console.log(JSON.stringify(results,null,1));
