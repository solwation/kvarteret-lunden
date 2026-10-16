import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';
const base=process.argv[2]??'http://localhost:8165';
const out=process.argv[3]??'/tmp/kvarteret-places';await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
const errors=[],external=[],results=[];
try{
 const page=await browser.newPage({viewport:{width:1200,height:800}});
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(new URL(r.url()).origin!==new URL(base).origin)external.push(r.url());});
 await page.goto(base);await page.waitForFunction(()=>window.lundenViewer?.renderer.info.render.frame>0,null,{timeout:120000});
 await page.evaluate(()=>window.lundenViewer.renderer.setAnimationLoop(null));
 const position=()=>page.evaluate(()=>window.lundenViewer.navigation.pos.toArray());
 const initial=await position();await page.keyboard.press('Digit3');assert.deepEqual(await position(),initial,'welcome must ignore shortcuts');
 const ids=await page.locator('[data-place]').evaluateAll(bs=>bs.map(b=>b.dataset.place));assert.deepEqual(ids,['area','home','l1004','l1201','courtyard','core','garage']);
 assert.deepEqual(await page.locator('[data-place]').evaluateAll(bs=>bs.map(b=>b.textContent.trim()[0])),['1','2','3','4','5','6','7']);
 await page.locator('#start').click();await page.evaluate(()=>document.exitPointerLock?.());
 for(let i=0;i<ids.length;i++){
  await page.keyboard.press(`Digit${i+1}`);
  const state=await page.evaluate(id=>{const v=window.lundenViewer,n=v.navigation,expected=v.locations[id],before=n.pos.clone();for(let j=0;j<120;j++)n.update(1/60);return {selected:document.querySelector('[data-place].selected').dataset.place,expected:[expected.x,expected.y,expected.z],before:before.toArray(),settled:n.pos.toArray(),unit:v.world.unitAt(n.pos.x,n.pos.z,n.pos.y)?.id??null,room:(u=>u?u.roomAt(u.levelAt(n.pos.y),n.pos.x,n.pos.z):null)(v.world.unitAt(n.pos.x,n.pos.z,n.pos.y)),status:document.getElementById('place').textContent,ground:n.groundAt(n.pos.x,n.pos.z,n.pos.y)};},ids[i]);
  assert.equal(state.selected,ids[i]);assert.deepEqual(state.before,state.expected);assert(Number.isFinite(state.ground));assert(Math.abs(state.settled[1]-state.expected[1])<.15,`${ids[i]} must stay on the intended floor`);assert(Math.hypot(state.settled[0]-state.expected[0],state.settled[2]-state.expected[2])<.1,`${ids[i]} must not start inside a wall`);
  if(ids[i]==='l1004')assert.equal(state.unit,'L1004');if(ids[i]==='l1201'){assert.equal(state.unit,'L1201','L1201 starts inside its own modeled flat');assert.equal(state.room,'Hall','L1201 starts in its entrance hall');assert(state.settled[1]>5,'L1201 is on våning 3, not at street level');}
  results.push({place:ids[i],...state});
  if(['l1004','l1201'].includes(ids[i])){await page.evaluate(()=>{const v=window.lundenViewer;v.world.core.update(0,v.navigation,v.camera);v.world.garage.update(0,v.navigation,v.camera);v.scene.updateMatrixWorld();v.renderer.render(v.scene,v.camera);});await page.screenshot({path:`${out}/${ids[i]}.png`});}
 }
 await page.keyboard.press('Numpad3');assert.equal(await page.locator('[data-place].selected').getAttribute('data-place'),'l1004');
 await page.locator('#help').click();const helpPosition=await position();await page.keyboard.press('Digit1');assert.deepEqual(await position(),helpPosition);assert.match(await page.locator('#help-dialog').textContent(),/1–7/);await page.locator('#close-help').click();
 await page.setViewportSize({width:390,height:844});
 for(const id of ids){await page.locator('#place-toggle').click();await page.locator(`#place-menu [data-place="${id}"]`).click();assert.equal(await page.locator('[data-place].selected').getAttribute('data-place'),id);assert.equal(await page.locator('#place-toggle').getAttribute('aria-expanded'),'false');}
 await page.locator('#place-toggle').click();await page.locator('#place-menu [data-place="l1201"]').click();await page.evaluate(()=>{const v=window.lundenViewer;v.world.core.update(0,v.navigation,v.camera);v.world.garage.update(0,v.navigation,v.camera);v.scene.updateMatrixWorld();v.renderer.render(v.scene,v.camera);});
 const bounds=await page.locator('#place-toggle').boundingBox();assert(bounds.x>=0&&bounds.x+bounds.width<=390);await page.screenshot({path:out+'/narrow.png'});
 assert.equal(await page.locator('#place-current').textContent(),'Lägenhet L1201');assert.equal(await page.locator('#place').textContent(),'L1201 · Entréplan');
 // A view resumed from an older version that still had the L1202 entrance destination lands in L1201's hall without errors.
 const version=await page.evaluate(async()=>(await (await fetch('./version.json',{cache:'no-store'})).json()).version);
 await page.evaluate(v=>sessionStorage.setItem('kvarteret-lunden.update-resume',JSON.stringify({position:[1,7,0.8],yaw:0,pitch:0,active:true,place:'l1202',version:v,at:Date.now()})),version);
 await page.reload();await page.waitForFunction(()=>window.lundenViewer?.renderer.info.render.frame>0,null,{timeout:120000});
 const legacy=await page.evaluate(()=>{const v=window.lundenViewer,n=v.navigation,e=v.locations.l1201;return {selected:document.querySelector('[data-place].selected').dataset.place,pos:n.pos.toArray(),expected:[e.x,e.y,e.z],intro:document.getElementById('intro').hidden};});
 assert.equal(legacy.selected,'l1201');assert.deepEqual(legacy.pos,legacy.expected);assert.equal(legacy.intro,true,'the resumed view stays active');results.push({legacyResume:legacy});
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);await writeFile(out+'/results.json',JSON.stringify({results,errors,external,narrowBounds:bounds},null,2));console.log(`PASS: seven real-world destinations, stable floors/collision, L1004/L1201 identity, legacy l1202 resume, Digit/Numpad, welcome/help guards, narrow menu; ${out}`);
}finally{await browser.close();}
