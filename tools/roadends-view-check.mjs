// Public #230: one affected view, with public network/storage boundaries.
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const base=process.argv[2]??'http://localhost:8941',out=process.argv[3]??'artifacts/230',phase=process.argv[4]??'after';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,args:['--no-sandbox','--enable-unsafe-swiftshader']});
try{
 const ctx=await browser.newContext({viewport:{width:1280,height:800},deviceScaleFactor:1});
 await ctx.addInitScript(()=>{localStorage.setItem('lunden.drawing','original-drawing-sentinel');localStorage.setItem('lunden.cloud.queue','original-queue-sentinel');sessionStorage.setItem('lunden.session','original-session-sentinel');});
 const page=await ctx.newPage(),external=[],errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(new URL(r.url()).origin!==new URL(base).origin)external.push(r.url());});
 await page.clock.setFixedTime(new Date('2026-06-15T11:00:00Z'));
 await page.goto(base+'/?month=6&cloud=https://ignored.invalid&sync=debug');
 await page.waitForFunction(()=>window.lundenViewer?.renderer.info.render.frame>0,null,{timeout:180000});
 const result=await page.evaluate(()=>{
  const a=lundenViewer;a.renderer.setAnimationLoop(null);document.getElementById('start').click();document.getElementById('resume').hidden=true;
  a.camera.position.set(-215,66.7,-230);a.camera.rotation.set(-25*Math.PI/180,47*Math.PI/180,0,'YXZ');a.camera.updateMatrixWorld(true);a.scene.updateMatrixWorld(true);a.renderer.render(a.scene,a.camera);
  return{camera:a.camera.position.toArray(),rotation:a.camera.rotation.toArray(),calls:a.renderer.info.render.calls,triangles:a.renderer.info.render.triangles,edgeLandVertices:a.scene.getObjectByName('edge-land').geometry.attributes.position.count,
   sentinels:[localStorage.getItem('lunden.drawing'),localStorage.getItem('lunden.cloud.queue'),sessionStorage.getItem('lunden.session')],localKeys:Object.keys(localStorage)};
 });
 await page.screenshot({path:`${out}/${phase}-school-road.png`});
 assert.deepEqual(result.sentinels,['original-drawing-sentinel','original-queue-sentinel','original-session-sentinel']);assert.deepEqual(result.localKeys.sort(),['lunden.cloud.queue','lunden.drawing']);assert.deepEqual(external,[]);assert.deepEqual(errors,[]);
 await writeFile(`${out}/${phase}.json`,JSON.stringify({phase,base,result,external,errors},null,2));console.log('PASS actual school road view; no external requests or original-storage changes',JSON.stringify(result));
}finally{await browser.close();}
