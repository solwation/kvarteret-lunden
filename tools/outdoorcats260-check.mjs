// Public #260: the eight looping cats (OUTDOOR_CATS.loops) on the ACTUAL public scene: every leg passes the production cat
// clearance (createCatClear: buildings/footprints, vehicle ways, water clearance, drops, walls and trunks), the sampled ground is
// finite with bounded steps, plus one representative view with the cats' draw-call delta and a screenshot per requested loop.
// Usage: node tools/outdoorcats260-check.mjs BASE OUT [loopIndex ...]
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const base=process.argv[2]??'http://localhost:8260',out=process.argv[3]??'artifacts/260',shots=(process.argv.slice(4).length?process.argv.slice(4):['0','5']).map(Number);await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,args:['--no-sandbox','--enable-unsafe-swiftshader']});const report={errors:[],external:[]};
try{
 const page=await (await browser.newContext({viewport:{width:1280,height:850},deviceScaleFactor:1})).newPage();page.on('pageerror',e=>report.errors.push(e.message));page.on('request',r=>{if(new URL(r.url()).origin!==new URL(base).origin)report.external.push(r.url())});
 await page.goto(base+'/?month=6');await page.waitForFunction(()=>window.lundenViewer?.ambientCats&&lundenViewer.renderer.info.render.frame>0,null,{timeout:240000});
 await page.evaluate(()=>{const A=lundenViewer;A.renderer.setAnimationLoop(null);document.getElementById('start')?.click();document.exitPointerLock?.();document.querySelectorAll('.topbar,.locations,.bottom-bar,#resume,#crosshair').forEach(e=>{e.hidden=true;e.style.setProperty('display','none','important')});window.__clock=1793491200;A.ambientCats.now=()=>__clock;});
 report.loops=await page.evaluate(async()=>{const o=lundenViewer.ambientCats,{OUTDOOR_CATS:C}=await import('/src/config.js'),{routeSamples}=await import('/src/outdoorcatroute.js'),{waterYAt}=await import('/src/riverbridge.js');
  return C.loops.map((spec,k)=>{const legs=spec.route.map((a,i)=>{const b=spec.route[(i+1)%spec.route.length];return{i,from:a,to:b,clear:o.clear(a[0],a[1],b[0],b[1])};});let prev=null,maxStep=0,minDry=Infinity,finite=true;
   for(const[x,z]of routeSamples(spec.route,.25)){const y=o.ground(x,z);if(!Number.isFinite(y))finite=false;minDry=Math.min(minDry,y-waterYAt(x,z));if(prev!==null)maxStep=Math.max(maxStep,Math.abs(y-prev));prev=y;}
   return{loop:k,id:C.cats.length+k,blocked:legs.filter(l=>!l.clear).map(l=>l.i),finite,maxStep,minDry,samples:routeSamples(spec.route,.25).length};});});
 for(const l of report.loops){assert.deepEqual(l.blocked,[],`loop ${l.loop} blocked legs`);assert.ok(l.finite&&l.maxStep<.22&&l.minDry>.3,`loop ${l.loop} ground`);}
 for(const k of shots){report['view'+k]=await page.evaluate(k=>{const A=lundenViewer,o=A.ambientCats,c=o.cats[o.cats.length-8+k];o.nuzzle.next=Infinity;
   // The loop's longest rest stop: place the camera 3.5 m away at eye height and look at the cat.
   const leg=c.spec.rest.indexOf(Math.max(...c.spec.rest));let t=0;for(;t<8000;t+=5){window.__clock=1793491200+t;const q=c.scheduled();if(!q.walking&&q.leg===leg)break;}const s=c.scheduled(),y=o.ground(s.x,s.z);A.camera.position.set(s.x+2.5,y+1.4,s.z+2.5);A.camera.lookAt(s.x,y+.2,s.z);A.camera.updateMatrixWorld(true);o.update(false);A.scene.updateMatrixWorld(true);
   const render=()=>{A.renderer.render(A.scene,A.camera);return{calls:A.renderer.info.render.calls,triangles:A.renderer.info.render.triangles}};const vis=o.cats.map(c=>c.mesh.visible);o.cats.forEach(c=>c.mesh.visible=false);const before=render();o.cats.forEach((c,i)=>c.mesh.visible=vis[i]);const after=render();
   return{loop:k,id:c.id,clock:window.__clock,at:[s.x,y,s.z],activity:s.activity,visible:c.mesh.visible,near:c.state.near,visibleCats:vis.filter(Boolean).length,before,after,delta:{calls:after.calls-before.calls,triangles:after.triangles-before.triangles}};},k);
  assert.ok(report['view'+k].visible);await page.screenshot({path:`${out}/loop-${k}.png`});}
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.external,[]);
}finally{await browser.close();await writeFile(`${out}/browser.json`,JSON.stringify(report,null,1)+'\n');}
console.log(JSON.stringify({ok:true,loops:report.loops.map(l=>({loop:l.loop,samples:l.samples,maxStep:+l.maxStep.toFixed(3),minDry:+l.minDry.toFixed(2)})),views:shots.map(k=>report['view'+k].delta)}));
