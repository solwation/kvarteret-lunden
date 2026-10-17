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
 await page.clock.setFixedTime(new Date('2026-10-16T08:15:00Z'));
 let planRequests=0;
 // The app fetches ./data/plan.json?v=<VERSION>; match the path regardless of query string.
 await page.route(url=>url.pathname.endsWith('/data/plan.json'),route=>++planRequests===1?route.fulfill({status:503,body:'temporary failure'}):route.continue());
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{if(new URL(r.url()).origin!==new URL(base).origin)external.push(r.url());});
 await page.goto(base+'/?cloud=https://ignored.invalid&sync=debug');
 await page.waitForFunction(()=>window.lundenViewer?.renderer.info.render.frame>0,null,{timeout:120000});
 const initialHour=await page.evaluate(()=>window.lundenViewer.world.clocks[0].hour);
 await page.clock.setFixedTime(new Date('2026-10-16T08:30:00Z'));
 await page.waitForFunction(previous=>window.lundenViewer.world.clocks[0].hour!==previous,initialHour);
 await page.evaluate(()=>window.lundenViewer.renderer.setAnimationLoop(null));
 await page.screenshot({path:out+'/intro.png'});
 await page.locator('#start').click();
 await page.evaluate(()=>document.exitPointerLock?.());
 const check=await page.evaluate(async()=>{
  const {world,navigation:n,camera,renderer,scene,moveTo}=window.lundenViewer;
  const report={doors:world.doors.length,levels:world.levels.length,units:world.units.length,locations:{}};
  const now=new Date(),localHour=now.getHours()+now.getMinutes()/60+now.getSeconds()/3600;
  report.clock={count:world.clocks.length,hour:world.clocks[0]?.hour,localHour};
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
 assert.equal(check.clock.count,1);assert(Math.abs(check.clock.hour-check.clock.localHour)<2/3600,'Tower clock follows local time');
 assert.equal(check.levels,2);assert(check.doors>5);assert(check.walked>.2);assert(check.doorAnimated);
 assert.deepEqual(check.sentinel,['original-drawing-sentinel','original-queue-sentinel','original-session-sentinel']);
 assert.equal(check.keys.length,2);
 for(const [name,p]of Object.entries(check.locations))assert(Number.isFinite(p.ground)&&p.pos.every(Number.isFinite),`invalid support at ${name}`);
 assert(check.locations.garage.below,'Garage destination must be below courtyard');
 assert.equal(planRequests,2,'The actual scene must recover from one temporary plan failure');
 results.push({desktop:check,planRequests});
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
 const m=await mobile.newPage();m.on('pageerror',e=>{errors.push(e.message);console.error('Mobile page error:',e.message)});m.on('console',event=>{if(event.type()==='error')console.error('Mobile console:',event.text())});m.on('request',r=>{if(new URL(r.url()).origin!==new URL(base).origin)external.push(r.url());});
 await m.goto(base);
 await m.waitForFunction(()=>window.lundenViewer?.renderer.info.render.frame>0,null,{timeout:120000});
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
 // Dead zone and response curve (upstream 211e0e9): a resting thumb's few px do not walk; half travel walks gently.
 const cx=stick.x+stick.width/2,cy=stick.y+stick.height/2,travel=stick.width*.32,frame=()=>m.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:cx+2,y:cy-2,id:2}]});await frame();
 const rest=await m.evaluate(()=>Math.hypot(window.lundenViewer.navigation.analog.x,window.lundenViewer.navigation.analog.y));
 await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:cx,y:cy-travel*.5,id:2}]});await frame();
 const half=await m.evaluate(()=>window.lundenViewer.navigation.analog.y);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:cx,y:cy-travel*1.5,id:2}]});await frame();
 const rim=await m.evaluate(()=>window.lundenViewer.navigation.analog.y);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
 assert(rest===0&&half>.2&&half<.45&&rim>.999,`stick feel rest=${rest} half=${half} rim=${rim}`);
 results.push({stickFeel:{rest,half,rim}});
 results.push({mobile:layout});
 // #29 (upstream 38d2196): the action pill sits under the right thumb with Mät avstånd on the arc above its right
 // end, inside the corner band, at least 8 px from every neighbour, in portrait and landscape; help stays at the top.
 const thumb=[];
 for(const [w,h] of [[390,844],[844,390]]){
  await m.setViewportSize({width:w,height:h});
  const r=await m.evaluate(()=>{const a=document.getElementById('action');a.hidden=false;a.textContent='Öppna';
   const box=id=>{const b=document.getElementById(id).getBoundingClientRect();return{id,l:b.left,t:b.top,r:b.right,b:b.bottom};};
   return['action','measure','joystick','help','place-toggle'].map(box);});
  await m.evaluate(()=>{dispatchEvent(new Event('resize'));const v=window.lundenViewer;v.renderer.render(v.scene,v.camera);});
  await m.screenshot({path:`${out}/mobile-thumb-${w}x${h}.png`});
  const by=Object.fromEntries(r.map(b=>[b.id,b])),sep=(a,b)=>Math.max(b.l-a.r,a.l-b.r,b.t-a.b,a.t-b.b);
  assert(w-by.action.r<=16.5&&h-by.action.b<=16.5,`action pill not in the corner at ${w}x${h}`);
  assert(by.action.r-by.action.l>=148,'action pill too narrow');
  assert(Math.abs(by.measure.r-(by.action.r-4))<1.5&&by.action.t-by.measure.b>=7.5,`measure not on the arc at ${w}x${h}`);
  for(let i=0;i<r.length;i++)for(let j=i+1;j<r.length;j++)if(r[i].r>r[i].l&&r[j].r>r[j].l)assert(sep(r[i],r[j])>=7.5,`touch controls too close ${r[i].id}/${r[j].id} at ${w}x${h}`);
  assert(by.help.b<h/3,'help left the top');
  await m.locator('#measure').tap();
  const status=await m.evaluate(()=>{const b=document.getElementById('measurement').getBoundingClientRect();return{id:'measurement',l:b.left,t:b.top,r:b.right,b:b.bottom};});
  assert(status.l>=0&&status.r<=w&&sep(status,by.measure)>=7.5&&sep(status,by.help)>=7.5,`measurement status collides at ${w}x${h}`);
  await m.screenshot({path:`${out}/mobile-thumb-measuring-${w}x${h}.png`});
  await m.locator('#measure').tap();
  await m.evaluate(()=>{const a=document.getElementById('action');a.hidden=false;});
  thumb.push({w,h,rects:[...r,status]});
 }
 await m.evaluate(()=>{document.getElementById('action').hidden=true;});
 results.push({thumbArc:thumb});
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
 await writeFile(out+'/browser-results.json',JSON.stringify({results,errors,external},null,2));
 console.log(JSON.stringify({passed:true,results,errors,external},null,2));
}finally{await browser.close();}
