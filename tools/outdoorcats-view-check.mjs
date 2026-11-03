// Public #236: actual local-clock courtyard/park, fixed-time reload, LOD cost and isolated storage/network.
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const base=process.argv[2]??'http://localhost:8911',out=process.argv[3]??'artifacts/236';await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,args:['--no-sandbox','--enable-unsafe-swiftshader']});const reports=[];
try{for(const phone of [false,true]){
 const context=await browser.newContext({viewport:{width:phone?430:1280,height:phone?850:800},deviceScaleFactor:1,isMobile:phone,hasTouch:phone});
 await context.addInitScript(()=>{localStorage.setItem('lunden.drawing','untouched-original');localStorage.setItem('lunden.cloud.queue','untouched-original');sessionStorage.setItem('lunden.session','untouched-original');});
 const page=await context.newPage(),errors=[],external=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(new URL(r.url()).origin!==new URL(base).origin)external.push(r.url());});await page.clock.setFixedTime(new Date('2026-06-15T10:00:00Z'));
 const open=async()=>{await page.goto(base+'/?month=6&cloud=https://ignored.invalid&sync=debug'+(phone?'&lowmem':''));await page.waitForFunction(()=>window.lundenViewer?.ambientCats&&lundenViewer.renderer.info.render.frame>0,null,{timeout:240000,polling:100});await page.evaluate(()=>{const a=lundenViewer;a.renderer.setAnimationLoop(null);document.getElementById('start').click();document.exitPointerLock?.();document.querySelectorAll('.topbar,.locations,.bottom-bar,#resume,#crosshair').forEach(e=>e.hidden=true);});};
 await open();
 const clockState=()=>page.evaluate(()=>{const o=lundenViewer.ambientCats;o.update(false);return o.cats.map(c=>c.brain.scheduled());});const original=await clockState();
 const views=[];for(const [name,id]of [['courtyard',0],['park',2]]){
  const result=await page.evaluate(({id,phone})=>{const a=lundenViewer,o=a.ambientCats,c=o.cats[id],s=c.brain.scheduled(),y=o.ground(s.x,s.z);a.camera.position.set(s.x+1.2,y+.7,s.z+1.5);a.camera.lookAt(s.x,y+.2,s.z);a.camera.updateMatrixWorld(true);o.update(false);a.scene.updateMatrixWorld(true);const render=()=>{a.renderer.render(a.scene,a.camera);return{calls:a.renderer.info.render.calls,triangles:a.renderer.info.render.triangles};};
   o.cats.forEach(c=>c.mesh.visible=false);const before=render();o.update(false);const after=render(),near=c.state.near;
   return {before,after,delta:{calls:after.calls-before.calls,triangles:after.triangles-before.triangles},near,draw:o.drawDist,states:o.cats.map(c=>c.state),targets:o.cats.some(c=>c.mesh.userData.door),clock:Date.now(),camera:a.camera.position.toArray()};},{id,phone});
  assert(result.near&&!result.targets);assert(result.delta.calls>=1&&result.delta.calls<=2);assert.equal(result.delta.triangles,result.delta.calls*2040);assert.equal(result.draw,phone?18:32);
  await page.evaluate(()=>document.getElementById('resume').style.setProperty('display','none','important'));await page.screenshot({path:`${out}/${phone?'phone':'desktop'}-${name}.png`});views.push({name,...result});
 }
 let reloadSame=null;if(!phone&&!process.env.CAPTURE_ONLY){await open();reloadSame=JSON.stringify(original)===JSON.stringify(await clockState());assert(reloadSame);}
 const storage=await page.evaluate(()=>({local:Object.fromEntries(Object.entries(localStorage).filter(([k])=>k.startsWith('lunden.'))),session:sessionStorage.getItem('lunden.session')}));assert.deepEqual(storage,{local:{'lunden.drawing':'untouched-original','lunden.cloud.queue':'untouched-original'},session:'untouched-original'});assert.deepEqual(external,[]);assert.deepEqual(errors,[]);
 reports.push({phone,views,reloadSame,storage,errors,external});console.log(phone?'phone PASS':'desktop PASS');await context.close();
}}finally{await browser.close();await writeFile(`${out}/${process.env.CAPTURE_ONLY?"capture-result":"result"}.json`,JSON.stringify({reports},null,2)+'\n');}
