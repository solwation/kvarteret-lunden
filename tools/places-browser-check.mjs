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
 const ids=await page.locator('[data-place]').evaluateAll(bs=>bs.map(b=>b.dataset.place));assert.deepEqual(ids,['area','home','l1004','l1202','courtyard','core','garage']);
 assert.deepEqual(await page.locator('[data-place]').evaluateAll(bs=>bs.map(b=>b.textContent.trim()[0])),['1','2','3','4','5','6','7']);
 await page.locator('#start').click();await page.evaluate(()=>document.exitPointerLock?.());
 for(let i=0;i<ids.length;i++){
  await page.keyboard.press(`Digit${i+1}`);
  const state=await page.evaluate(id=>{const v=window.lundenViewer,n=v.navigation,expected=v.locations[id],before=n.pos.clone();for(let j=0;j<120;j++)n.update(1/60);return {selected:document.querySelector('[data-place].selected').dataset.place,expected:[expected.x,expected.y,expected.z],before:before.toArray(),settled:n.pos.toArray(),unit:v.world.unitAt(n.pos.x,n.pos.z,n.pos.y)?.id??null,ground:n.groundAt(n.pos.x,n.pos.z,n.pos.y)};},ids[i]);
  assert.equal(state.selected,ids[i]);assert.deepEqual(state.before,state.expected);assert(Number.isFinite(state.ground));assert(Math.abs(state.settled[1]-state.expected[1])<.15,`${ids[i]} must stay on the intended floor`);assert(Math.hypot(state.settled[0]-state.expected[0],state.settled[2]-state.expected[2])<.1,`${ids[i]} must not start inside a wall`);
  if(ids[i]==='l1004')assert.equal(state.unit,'L1004');if(ids[i]==='l1202')assert.equal(state.unit,null,'L1202 is an entrance, never a mislabeled other apartment');
  results.push({place:ids[i],...state});
  if(['l1004','l1202'].includes(ids[i])){await page.evaluate(()=>{const v=window.lundenViewer;v.renderer.render(v.scene,v.camera);});await page.screenshot({path:`${out}/${ids[i]}.png`});}
 }
 await page.keyboard.press('Numpad3');assert.equal(await page.locator('[data-place].selected').getAttribute('data-place'),'l1004');
 await page.locator('#help').click();const helpPosition=await position();await page.keyboard.press('Digit1');assert.deepEqual(await position(),helpPosition);assert.match(await page.locator('#help-dialog').textContent(),/1–7/);await page.locator('#close-help').click();
 await page.setViewportSize({width:390,height:844});
 for(const id of ids){await page.locator('#place-select').selectOption(id);assert.equal(await page.locator('[data-place].selected').getAttribute('data-place'),id);}
 await page.locator('#place-select').selectOption('l1202');await page.evaluate(()=>{const v=window.lundenViewer;v.renderer.render(v.scene,v.camera);});
 const bounds=await page.locator('#place-select').boundingBox();assert(bounds.x>=0&&bounds.x+bounds.width<=390);await page.screenshot({path:out+'/narrow.png'});
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);await writeFile(out+'/results.json',JSON.stringify({results,errors,external,narrowBounds:bounds},null,2));console.log(`PASS: seven real-world destinations, stable floors/collision, L1004 identity, L1202 entrance, Digit/Numpad, welcome/help guards, narrow menu; ${out}`);
}finally{await browser.close();}
