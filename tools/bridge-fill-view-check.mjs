// One actual public world, old/new Navigation on identical rendered terrain.
import {chromium} from 'playwright';
import {execFileSync} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const base=process.argv[2]??'http://localhost:8932',out='docs/verification/248',baseline='a939dd593546690343a7e84b7722d4bcec95238f';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,args:['--no-sandbox','--enable-unsafe-swiftshader']});
try{
 const context=await browser.newContext({viewport:{width:1280,height:800}});
 await context.addInitScript(()=>{localStorage.setItem('lunden.drawing','untouched-original');localStorage.setItem('lunden.cloud.queue','untouched-original');sessionStorage.setItem('lunden.session','untouched-original');});
 const page=await context.newPage(),errors=[],external=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(new URL(r.url()).origin!==new URL(base).origin)external.push(r.url());});
 await page.clock.setFixedTime(new Date('2026-06-15T10:00:00Z'));
 const old=execFileSync('git',['show',baseline+':src/navigation.js'],{encoding:'utf8'}).replaceAll("from './","from '/src/");
 await page.route('**/baseline-nav.js',r=>r.fulfill({contentType:'text/javascript',body:old}));
 await page.goto(base+'/?cloud=https://ignored.invalid&sync=debug',{waitUntil:'domcontentloaded',timeout:120000});
 await page.waitForFunction(()=>window.lundenViewer?.renderer.info.render.frame>0,null,{timeout:240000});
 await page.evaluate(()=>{lundenViewer.renderer.setAnimationLoop(null);document.getElementById('start').click();document.exitPointerLock?.();document.querySelectorAll('.topbar,.locations,.bottom-bar,#crosshair').forEach(e=>e.hidden=true);document.getElementById('resume').style.setProperty('display','none','important');});
 const result=await page.evaluate(async()=>{
  const a=lundenViewer,T=await import('three'),S=await import('/src/surroundings.js'),{Navigation:Old}=await import('/baseline-nav.js');
  const before=new Old(a.world,new T.PerspectiveCamera());before.teleport(-137,S.walkingGroundY(-137,195.4),195.4);before.camera.rotation.y=1.5*Math.PI;before.keys=new Set(['KeyW','ShiftLeft']);
  const trace=[];for(let i=0;i<45;i++){before.update(.05);trace.push({i,p:before.pos.toArray(),support:before.groundAt(before.pos.x,before.pos.z,before.pos.y)});}
  a.navigation.teleport(-137,S.walkingGroundY(-137,195.4),195.4);a.camera.rotation.set(0,1.5*Math.PI,0);window.bridge248={a,S};
  return{baseline:'a939dd593546690343a7e84b7722d4bcec95238f',before:{last:trace.at(-1),lostSupport:trace.some(r=>!Number.isFinite(r.support)),trace}};
 });
 assert(result.before.lostSupport&&result.before.last.p[1]<-15,'old real Navigation falls below ground');
 await page.keyboard.down('KeyW');await page.keyboard.down('ShiftLeft');
 result.after=await page.evaluate(()=>{const{a}=bridge248,n=a.navigation,trace=[];for(let i=0;i<60;i++){n.update(.05);trace.push({i,p:n.pos.toArray(),support:n.groundAt(n.pos.x,n.pos.z,n.pos.y)});}return{keys:[...n.keys],trace,last:trace.at(-1)};});
 await page.keyboard.up('KeyW');await page.keyboard.up('ShiftLeft');
 assert(result.after.keys.includes('KeyW')&&result.after.keys.includes('ShiftLeft'));assert(result.after.trace.every(r=>Number.isFinite(r.support)));assert(result.after.last.p[0]<-135.5);
 await page.evaluate(()=>{const{a}=bridge248;a.camera.position.set(-141,-1,201);a.camera.lookAt(-131,-3.7,194);a.camera.updateMatrixWorld(true);a.renderer.render(a.scene,a.camera);});
 await page.screenshot({path:out+'/bridge-location.png'});
 await page.evaluate(()=>{const{a}=bridge248,n=a.navigation;a.camera.position.set(n.pos.x,n.pos.y+1.62,n.pos.z);a.camera.rotation.set(0,1.5*Math.PI,0);a.camera.updateMatrixWorld(true);a.renderer.render(a.scene,a.camera);});
 await page.screenshot({path:out+'/after-edge-stop.png'});
 await page.keyboard.down('KeyS');result.reverse=await page.evaluate(()=>{const{a}=bridge248,n=a.navigation,before=n.pos.toArray();for(let i=0;i<10;i++)n.update(.05);return{before,after:n.pos.toArray(),support:n.groundAt(n.pos.x,n.pos.z,n.pos.y)};});await page.keyboard.up('KeyS');assert(result.reverse.after[0]<result.reverse.before[0]-.6);assert(Number.isFinite(result.reverse.support));
 result.storage=await page.evaluate(()=>({local:Object.fromEntries(Object.entries(localStorage).filter(([k])=>k.startsWith('lunden.'))),session:sessionStorage.getItem('lunden.session')}));
 assert.deepEqual(result.storage,{local:{'lunden.drawing':'untouched-original','lunden.cloud.queue':'untouched-original'},session:'untouched-original'});assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
 await writeFile(out+'/browser.json',JSON.stringify({ok:true,...result,errors,external},null,2));console.log(JSON.stringify({ok:true,before:result.before.last,after:result.after.last,reverse:result.reverse,errors,external}));
}finally{await browser.close();}
