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
 const frame=()=>m.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
 const S=()=>m.evaluate(()=>{const s=document.getElementById('joystick'),b=s.getBoundingClientRect(),a=window.lundenViewer.navigation.analog;return{cx:(b.left+b.right)/2,cy:(b.top+b.bottom)/2,l:b.left,t:b.top,r:b.right,b:b.bottom,floating:s.classList.contains('floating'),x:a.x,y:a.y};});
 // A touch on the resting stick and a cancel: the base comes under the thumb, nothing walks, and it rests again.
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:stick.x+stick.width/2,y:stick.y+15,id:1}]});
 let st=await S();assert(st.floating&&Math.abs(st.cy-stick.y-15)<1&&st.y===0,`stick under the thumb ${JSON.stringify(st)}`);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
 st=await S();assert(!st.floating&&st.y===0&&Math.abs(st.l-stick.x)<.5&&Math.abs(st.t-stick.y)<.5,`stick back at rest ${JSON.stringify(st)}`);
 // #32 floating stick (original src/touch.js at 1af9b39/211e0e9), portrait and landscape: touches at different places on
 // the left side place the base under the thumb (kept inside the safe area), walk in the pushed direction, follow a thumb
 // pulled past the rim, and return to rest on release. A touch on the right side looks and leaves the stick at rest.
 const floating=[];
 for(const [w,h] of [[390,844],[844,390]]){
  await m.setViewportSize({width:w,height:h});await m.evaluate(()=>dispatchEvent(new Event('resize')));await frame();
  const restBox=await S(),travel=(restBox.r-restBox.l-12)/2,top=await m.evaluate(()=>{const b=document.getElementById('place-toggle').getBoundingClientRect(),c=document.getElementById('help').getBoundingClientRect();return Math.max(b.bottom,c.bottom);});
  for(const p of [{x:w*.25,y:h*.6},{x:w*.4,y:top+travel+20},{x:8,y:h-8}]){
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...p,id:20}]});await frame();
   const at=await S();
   const inside=at.l>=-.5&&at.r<=w+.5&&at.t>=top&&at.b<=h+.5;
   const under=Math.hypot(at.cx-p.x,at.cy-p.y)<1;
   assert(at.floating&&inside&&(under||p.x<20),`base under the thumb at ${w}x${h} ${JSON.stringify({p,at})}`);
   const c={x:at.cx,y:at.cy};
   await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:c.x,y:c.y-travel,id:20}]});await frame();const up=await S();
   await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:c.x+travel,y:c.y,id:20}]});await frame();const right=await S();
   await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:c.x,y:c.y+travel,id:20}]});await frame();const back=await S();
   assert(up.y>.99&&Math.abs(up.x)<1e-9&&right.x>.99&&Math.abs(right.y)<1e-9&&back.y<-.99,`walk direction at ${w}x${h} ${JSON.stringify({up,right,back})}`);
   await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[{x:c.x,y:c.y+travel,id:20}]});await frame();
   const rel=await S();assert(!rel.floating&&rel.x===0&&rel.y===0&&Math.abs(rel.l-restBox.l)<.5&&Math.abs(rel.t-restBox.t)<.5,`stick rests after release ${JSON.stringify(rel)}`);
   floating.push({w,h,p,base:{x:c.x,y:c.y},up:up.y,right:right.x,back:back.y});
  }
  // Follow: pulled 2 × travel past the rim the base trails one travel behind; easing back 1.5 travel walks backward at once.
  const p={x:w*.25,y:h*.85};
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...p,id:21}]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:p.x,y:p.y-3*travel,id:21}]});await frame();const pulled=await S();
  await m.screenshot({path:`${out}/mobile-stick-follow-${w}x${h}.png`});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:p.x,y:p.y-3*travel+travel*1.5,id:21}]});await frame();const eased=await S();
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[{x:p.x,y:p.y,id:21}]});
  assert(Math.abs(pulled.cy-(p.y-2*travel))<1&&pulled.y>.99&&eased.y<0,`follow at ${w}x${h} ${JSON.stringify({pulled,eased})}`);
  // The look side leaves the stick at rest.
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:w*.7,y:h*.6,id:22}]});await frame();const look=await S();
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[{x:w*.7,y:h*.6,id:22}]});
  assert(!look.floating&&look.y===0,`look side took the stick at ${w}x${h}`);
  floating.push({w,h,follow:{base:pulled.cy-p.y,back:eased.y}});
  await m.evaluate(()=>window.lundenViewer.easeLook(10));
 }
 await m.setViewportSize({width:390,height:844});await m.evaluate(()=>dispatchEvent(new Event('resize')));await frame();
 results.push({floatingStick:floating});
 // Dead zone and response curve (upstream 211e0e9): a resting thumb's few px do not walk; half travel walks gently.
 const cx=stick.x+stick.width/2,cy=stick.y+stick.height/2,travel=(stick.width-12)/2;
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:cx,y:cy,id:2}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:cx+2,y:cy-2,id:2}]});await frame();
 const rest=await m.evaluate(()=>Math.hypot(window.lundenViewer.navigation.analog.x,window.lundenViewer.navigation.analog.y));
 await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:cx,y:cy-travel*.5,id:2}]});await frame();
 const half=await m.evaluate(()=>window.lundenViewer.navigation.analog.y);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:cx,y:cy-travel*1.5,id:2}]});await frame();
 const rim=await m.evaluate(()=>window.lundenViewer.navigation.analog.y);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
 assert(rest===0&&half>.2&&half<.45&&rim>.999,`stick feel rest=${rest} half=${half} rim=${rim}`);
 results.push({stickFeel:{rest,half,rim}});
 // Eased drag-to-look (upstream 211e0e9): a drag is not applied in the event but eased in per frame; the total turn
 // equals the old direct 1.3 × .0026 rad per px (animation loop stopped, so easeLook is stepped by hand).
 const yaw0=await m.evaluate(()=>{const c=window.lundenViewer.camera;c.rotation.x=0;return c.rotation.y;});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:200,y:300,id:3}]});
 for(let i=1;i<=6;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:200+i*20,y:300+i*5,id:3}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 const eased=await m.evaluate(()=>{const v=window.lundenViewer,c=v.camera,r={immediate:c.rotation.y};v.easeLook(1/60);r.first=c.rotation.y;for(let i=0;i<120;i++)v.easeLook(1/60);r.yaw=c.rotation.y;r.pitch=c.rotation.x;return r;});
 const turn={yaw:eased.yaw-yaw0,pitch:eased.pitch,expectYaw:-120*1.3*.0026,expectPitch:-30*1.3*.0026};
 assert(eased.immediate===yaw0&&eased.first!==yaw0&&Math.abs(eased.first-yaw0)<Math.abs(turn.expectYaw)*.6,`look must ease in: ${JSON.stringify(eased)}`);
 assert(Math.abs(turn.yaw-turn.expectYaw)<1e-9&&Math.abs(turn.pitch-turn.expectPitch)<1e-9,`eased total turn ${JSON.stringify(turn)}`);
 results.push({easedLook:{...turn,firstFrame:eased.first-yaw0}});
 // #31 (the original's stickId/lookId, src/touch.js): the stick and a look finger work at once in either order, and
 // lifting one keeps the other. CDP touchEnd lists the points that lift.
 const settle=async()=>{await frame();return m.evaluate(()=>{const v=window.lundenViewer;for(let i=0;i<120;i++)v.easeLook(1/60);return{walk:v.navigation.analog.y,yaw:v.camera.rotation.y};});};
 const T=(type,touchPoints)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints});
 const s0={x:cx,y:cy,id:11},fwd={x:cx,y:cy-travel,id:11},lookAt=i=>({x:250+i*20,y:300,id:12});
 const multi={};
 let y=(await settle()).yaw;
 await T('touchStart',[s0]);await T('touchMove',[fwd]);await T('touchStart',[fwd,lookAt(0)]);
 for(let i=1;i<=5;i++)await T('touchMove',[fwd,lookAt(i)]);
 let q=await settle();multi.stickFirst={walk:q.walk,turn:q.yaw-y};
 await T('touchEnd',[lookAt(5)]);await T('touchMove',[{...fwd,x:cx+1}]);y=q.yaw;q=await settle();multi.lookLifted={walk:q.walk,turn:q.yaw-y};
 await T('touchEnd',[fwd]);
 y=(await settle()).yaw;
 await T('touchStart',[lookAt(0)]);await T('touchStart',[lookAt(0),s0]);
 for(let i=1;i<=5;i++)await T('touchMove',[lookAt(i),fwd]);
 q=await settle();multi.lookFirst={walk:q.walk,turn:q.yaw-y};
 await T('touchEnd',[fwd]);y=q.yaw;
 for(let i=6;i<=8;i++)await T('touchMove',[lookAt(i)]);
 q=await settle();multi.stickLifted={walk:q.walk,turn:q.yaw-y};
 await T('touchEnd',[lookAt(8)]);
 const perStep=-20*1.3*.0026,near=(a,b)=>Math.abs(a-b)<1e-9;
 assert(multi.stickFirst.walk>.99&&near(multi.stickFirst.turn,5*perStep),`stick then look ${JSON.stringify(multi)}`);
 assert(multi.lookLifted.walk>.99&&multi.lookLifted.turn===0,`look lifted ${JSON.stringify(multi)}`);
 assert(multi.lookFirst.walk>.99&&near(multi.lookFirst.turn,5*perStep),`look then stick ${JSON.stringify(multi)}`);
 assert(multi.stickLifted.walk===0&&near(multi.stickLifted.turn,3*perStep),`stick lifted ${JSON.stringify(multi)}`);
 assert.equal(await m.evaluate(()=>window.lundenViewer.navigation.analog.y),0);
 results.push({multiTouch:multi});
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
