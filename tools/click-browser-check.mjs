import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';
const base=process.argv[2]??'http://localhost:8166',out=process.argv[3]??'/tmp/kvarteret-click';await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
const errors=[],results=[];
try{
 const page=await browser.newPage({viewport:{width:1000,height:700}});page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base);await page.waitForFunction(()=>window.lundenViewer?.renderer.info.render.frame>0,null,{timeout:120000});
 await page.locator('#start').click();await page.waitForFunction(()=>document.pointerLockElement===window.lundenViewer.renderer.domElement);
 await page.evaluate(()=>{
  const {world,navigation:n,camera,renderer}=window.lundenViewer;renderer.setAnimationLoop(null);
  const d=world.doors.find(d=>d.kind==='swing'&&d.object.position.y<1);
  const p=d.object.position.clone();p.x=d.hinge[0]+Math.sin(d.angle)*d.len/2;p.z=d.hinge[1]+Math.cos(d.angle)*d.len/2;p.y=1.1;
  n.teleport(p.x+Math.cos(d.angle),0,p.z-Math.sin(d.angle));camera.lookAt(p);camera.updateMatrixWorld(true);window.lundenViewer.scene.updateMatrixWorld(true);window.qaDoor=d;
  renderer.render(window.lundenViewer.scene,camera);
 });
 const target=()=>page.evaluate(()=>window.qaDoor.target);
 const closed=await target();await page.mouse.click(500,350);assert.notEqual(await target(),closed,'native locked mouse click opens aimed door');
 await page.mouse.click(500,350);assert.equal(await target(),closed,'next click closes door');results.push('primary click opens and closes real aimed door');
 for(const button of ['right','middle']){await page.mouse.click(500,350,{button});assert.equal(await target(),closed);}
 await page.keyboard.press('KeyE');assert.notEqual(await target(),closed);await page.keyboard.press('KeyE');assert.equal(await target(),closed);results.push('E preserved; right and middle mouse ignored');
 await page.evaluate(()=>document.exitPointerLock());await page.waitForFunction(()=>!document.pointerLockElement);
 await page.mouse.click(800,300);await page.waitForFunction(()=>!!document.pointerLockElement);assert.equal(await target(),closed,'capture click must not use door');results.push('free pointer capture does not interact');
 await page.evaluate(()=>document.exitPointerLock());await page.waitForFunction(()=>!document.pointerLockElement);
 await page.locator('#help').click();assert.equal(await target(),closed);assert.match(await page.locator('#help-dialog').textContent(),/klicka för att öppna/);await page.locator('#close-help').click();
 await page.locator('#measure').click();assert.equal(await target(),closed);await page.mouse.click(500,350);await page.mouse.click(550,350);assert.equal(await target(),closed,'measurement clicks must not open objects');assert.match(await page.locator('#measurement').textContent(),/m ·/);await page.screenshot({path:out+'/measurement.png'});
 await page.locator('#measure').click();await page.locator('[data-place="home"]').click();assert.equal(await target(),closed);results.push('menu/help clicks isolated; measurement selects two points without interaction');
 // Mobile keeps its explicit action button and uses scene touches for looking.
 const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const m=await mobile.newPage();m.on('pageerror',e=>errors.push(e.message));
 await m.goto(base);await m.waitForFunction(()=>window.lundenViewer?.renderer.info.render.frame>0,null,{timeout:120000});await m.locator('#start').tap();
 await m.evaluate(()=>{
  const v=window.lundenViewer,d=v.world.doors.find(d=>d.kind==='swing'&&d.object.position.y<1),p=d.object.position.clone();p.x=d.hinge[0]+Math.sin(d.angle)*d.len/2;p.z=d.hinge[1]+Math.cos(d.angle)*d.len/2;p.y=1.1;
  v.navigation.teleport(p.x+Math.cos(d.angle),0,p.z-Math.sin(d.angle));v.camera.lookAt(p);v.camera.updateMatrixWorld(true);window.qaDoor=d;
 });
 await m.waitForFunction(()=>!document.getElementById('action').hidden);await m.evaluate(()=>window.lundenViewer.renderer.setAnimationLoop(null));const before=await m.evaluate(()=>qaDoor.target);
 await m.touchscreen.tap(200,350);assert.equal(await m.evaluate(()=>qaDoor.target),before,'scene touch only looks');await m.locator('#action').tap();assert.notEqual(await m.evaluate(()=>qaDoor.target),before);await m.screenshot({path:out+'/mobile.png'});results.push('mobile scene touch and explicit action button preserved');
 await mobile.close();assert.deepEqual(errors,[]);await writeFile(out+'/results.json',JSON.stringify({results,errors},null,2));console.log(JSON.stringify({results,errors,out},null,2));
}finally{await browser.close();}
