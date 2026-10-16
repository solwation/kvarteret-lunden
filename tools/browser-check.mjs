import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const base=process.argv[2]??'http://localhost:8157';
const out=process.argv[3]??'artifacts';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
const results=[],errors=[],external=[];
try{
 const context=await browser.newContext({viewport:{width:1000,height:700},deviceScaleFactor:1});
 await context.addInitScript(()=>{localStorage.setItem('lunden.drawing','original-drawing-sentinel');localStorage.setItem('lunden.cloud.queue','original-queue-sentinel');sessionStorage.setItem('lunden.session','original-session-sentinel');});
 const page=await context.newPage();page.setDefaultTimeout(30000);
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{if(new URL(r.url()).origin!==new URL(base).origin)external.push(r.url());});
 await page.goto(base+'/?cloud=https://ignored.invalid&sync=debug');
 await page.waitForFunction(()=>window.lundenViewer?.renderer.info.render.frame>0,{timeout:120000});
 await page.evaluate(()=>window.lundenViewer.renderer.setAnimationLoop(null));
 await page.screenshot({path:out+'/intro.png'});
 await page.locator('#start').click();
 await page.evaluate(()=>document.exitPointerLock?.());
 const check=await page.evaluate(async()=>{
  const {world,navigation:n,camera,renderer,scene,moveTo}=window.lundenViewer;
  const report={doors:world.doors.length,levels:world.levels.length,units:world.units.length,locations:{}};
  for(const name of ['area','home','courtyard','core','garage']){
   moveTo(name);for(let i=0;i<20;i++)n.update(1/120);
   report.locations[name]={pos:n.pos.toArray(),ground:n.groundAt(n.pos.x,n.pos.z),core:n.inCore,below:n.below};
  }
  moveTo('home');
  const before=n.pos.clone();n.keys.add('KeyW');for(let i=0;i<60;i++)n.update(1/120);n.keys.clear();report.walked=before.distanceTo(n.pos);
  const d=world.doors.find(d=>d.kind==='swing');const original=d.t;d.toggle();for(let i=0;i<120;i++)n.update(1/120);report.doorAnimated=d.t!==original;d.toggle();for(let i=0;i<120;i++)n.update(1/120);
  report.sentinel=[localStorage.getItem('lunden.drawing'),localStorage.getItem('lunden.cloud.queue'),sessionStorage.getItem('lunden.session')];
  report.keys=Object.keys(localStorage);
  moveTo('home');renderer.render(scene,camera);
  return report;
 });
 assert.equal(check.levels,2);assert(check.doors>5);assert(check.walked>.2);assert(check.doorAnimated);
 assert.deepEqual(check.sentinel,['original-drawing-sentinel','original-queue-sentinel','original-session-sentinel']);
 assert.equal(check.keys.length,2);
 for(const [name,p]of Object.entries(check.locations))assert(Number.isFinite(p.ground)&&p.pos.every(Number.isFinite),`invalid support at ${name}`);
 assert(check.locations.garage.below,'Garage destination must be below courtyard');
 results.push({desktop:check});
 await page.screenshot({path:out+'/home.png'});
 // The real E listener must open an aimed physical door.
 const interaction=await page.evaluate(()=>{
  const {world,navigation:n,camera,renderer,scene}=window.lundenViewer;
  const d=world.doors.find(d=>d.kind==='swing'&&d.object.position.y<1);
  const p=d.object.position.clone();p.x=d.hinge[0]+Math.sin(d.angle)*d.len/2;p.z=d.hinge[1]+Math.cos(d.angle)*d.len/2;p.y=1.1;
  n.teleport(p.x+Math.cos(d.angle),0,p.z-Math.sin(d.angle));camera.lookAt(p);scene.updateMatrixWorld();
  window.qaDoor=d;return {before:d.target};
 });
 await page.keyboard.press('KeyE');
 assert.notEqual(await page.evaluate(()=>window.qaDoor.target),interaction.before,'E must toggle the aimed physical door');
 // UI/help and measurement controls remain usable with a released pointer.
 await page.locator('#help').click();assert(await page.locator('#help-dialog').evaluate(d=>d.open));await page.locator('#close-help').click();
 await page.locator('#measure').click();assert.equal(await page.locator('#measure').getAttribute('aria-pressed'),'true');
 await page.locator('#measure').click();
 const mobile=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:1});
 const m=await mobile.newPage();m.on('pageerror',e=>errors.push(e.message));m.on('request',r=>{if(new URL(r.url()).origin!==new URL(base).origin)external.push(r.url());});
 await m.goto(base);
 await m.waitForFunction(()=>window.lundenViewer?.renderer.info.render.frame>0,{timeout:120000});
 await m.evaluate(()=>window.lundenViewer.renderer.setAnimationLoop(null));
 await m.locator('#start').tap();
 await m.evaluate(()=>{const v=window.lundenViewer;v.moveTo('home');v.renderer.render(v.scene,v.camera);});
 await m.screenshot({path:out+'/mobile.png'});
 const layout=await m.evaluate(()=>{const ids=['joystick','measure','help'];return ids.map(id=>{const r=document.getElementById(id).getBoundingClientRect();return{id,x:r.x,y:r.y,w:r.width,h:r.height,visible:getComputedStyle(document.getElementById(id)).display!=='none'};});});
 for(const r of layout)assert(r.visible&&r.x>=0&&r.y>=0&&r.x+r.w<=391&&r.y+r.h<=845,`off-screen mobile control ${r.id}`);
 const stick=await m.locator('#joystick').boundingBox();
 const cdp=await mobile.newCDPSession(m);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:stick.x+stick.width/2,y:stick.y+15,id:1}]});
 assert(await m.evaluate(()=>window.lundenViewer.navigation.analog.y>0));
 await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
 assert.equal(await m.evaluate(()=>window.lundenViewer.navigation.analog.y),0);
 results.push({mobile:layout});
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
 await writeFile(out+'/browser-results.json',JSON.stringify({results,errors,external},null,2));
 console.log(JSON.stringify({passed:true,results,errors,external},null,2));
}finally{await browser.close();}
