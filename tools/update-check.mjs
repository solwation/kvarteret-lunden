import assert from 'node:assert/strict';
import {readFile, mkdir, writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';
const base=(process.argv[2]??'http://localhost:8164').replace(/\/$/,'');
const out=process.argv[3]??'/tmp/kvarteret-update-check';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
const errors=[],results=[];
const old='111111111111111111111111',next='222222222222222222222222';
const source=await readFile('src/updates.js','utf8');
async function fixture({mobile=false,remote={version:next,builtAt:200},offline=false,blocked=false,staleHTML=false,delayHTML=false}={}){
  const context=await browser.newContext(mobile?{viewport:{width:390,height:844},isMobile:true,hasTouch:true}:{});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.clock.install();
  await page.route('**/*',async route=>{
    const path=new URL(route.request().url()).pathname;
    if(path.endsWith('/version.json'))return offline?route.abort():route.fulfill({json:remote});
    if(path.endsWith('/fixture-updates.js'))return route.fulfill({contentType:'text/javascript',body:source.replaceAll('__BUILD_VERSION__',JSON.stringify(old)).replaceAll('__BUILD_TIME__','100')});
    if(path.endsWith('/fixture.html') && new URL(route.request().url()).searchParams.has('v') && delayHTML){await page.evaluate(()=>window.busy=true);}
    return route.fulfill({contentType:'text/html',body:`<!doctype html><html lang="sv"><meta name="viewport" content="width=device-width"><body><div id="notice" role="status"></div><script type="module">import {watchUpdates,takeResume} from './fixture-updates.js'; window.takeResume=takeResume;window.busy=false;window.calls=[];watchUpdates({snapshot:()=>({position:[4,0,8],yaw:1,pitch:.3,active:true}),busy:()=>window.busy,notice:t=>document.getElementById('notice').textContent=t,reload:url=>window.calls.push(url)});window.fixtureReady=true;</script><!-- ./assets/viewer-${staleHTML?old:next}.js --></body></html>`});
  });
  await page.addInitScript(({blocked})=>{
    localStorage.setItem('lunden.drawing','untouched');sessionStorage.setItem('lunden.session','untouched');
    if(blocked)Storage.prototype.setItem=function(){throw new DOMException('blocked','SecurityError');};
  },{blocked});
  await page.goto(base+'/fixture.html');await page.waitForFunction(()=>window.fixtureReady);
  await page.waitForTimeout(50); // Let the first network check finish before advancing the clock.
  return {context,page};
}
try{
  for(const mobile of [false,true]){
    const {context,page}=await fixture({mobile});
    await page.evaluate(()=>window.busy=true);await page.clock.fastForward(20_000);
    assert.equal(await page.evaluate(()=>calls.length),0,'held input must defer update');
    await page.evaluate(()=>window.busy=false);await page.clock.fastForward(500);
    assert.match(await page.locator('#notice').textContent(),/Uppdaterar om/);
    await page.keyboard.press('a');await page.clock.fastForward(5500);
    assert.equal(await page.evaluate(()=>calls.length),0,'input cancels countdown');
    await page.clock.fastForward(5500);await page.clock.fastForward(5000);
    await page.waitForFunction(()=>calls.length===1);
    const state=await page.evaluate(()=>({url:calls[0],resume:JSON.parse(sessionStorage.getItem('kvarteret-lunden.update-resume')),local:localStorage.getItem('lunden.drawing'),original:sessionStorage.getItem('lunden.session')}));
    assert.equal(new URL(state.url).searchParams.get('v'),next);assert.deepEqual(state.resume.position,[4,0,8]);assert.equal(state.resume.active,true);assert.equal(state.local,'untouched');assert.equal(state.original,'untouched');
    // Consume the same record with the target version, as the newly loaded module does.
    await page.route('**/target.js',r=>r.fulfill({contentType:'text/javascript',body:source.replaceAll('__BUILD_VERSION__',JSON.stringify(next)).replaceAll('__BUILD_TIME__','200')}));
    const consumed=await page.evaluate(async()=>{const m=await import('./target.js');return [m.takeResume(),m.takeResume()];});
    assert.deepEqual(consumed[0].position,[4,0,8]);assert.equal(consumed[1],null);
    await context.close();results.push(`${mobile?'mobile':'desktop'}: idle update, input cancellation, pose, isolated one-use resume`);
  }
  for(const setup of [{remote:{version:old,builtAt:200}},{remote:{version:next,builtAt:50}},{offline:true}]){
    const {context,page}=await fixture(setup);await page.clock.fastForward(120_000);await page.waitForTimeout(30);assert.equal(await page.evaluate(()=>calls.length),0);await context.close();
  }
  results.push('same content, older publication and offline: no reload');
  for(const setup of [{staleHTML:true},{delayHTML:true}]){
    const {context,page}=await fixture(setup);await page.clock.fastForward(11_000);await page.clock.fastForward(6000);await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>calls.length),0);await context.close();
  }
  results.push('stale entry HTML and input during final fetch: no reload');
  const blocked=await fixture({blocked:true});await blocked.page.clock.fastForward(11_000);await blocked.page.clock.fastForward(6000);await blocked.page.waitForFunction(()=>calls.length===1);await blocked.context.close();results.push('blocked storage: fresh update still works');
  // The actual bundled application, with a simulated second Pages publication.
  const current=JSON.parse(await readFile('dist/version.json','utf8'));
  const published={version:next,builtAt:current.builtAt+10_000};
  const html=await readFile('dist/index.html','utf8');
  const bundle=await readFile(`dist/assets/viewer-${current.version}.js`,'utf8');
  const context=await browser.newContext({viewport:{width:1000,height:700}}),page=await context.newPage();
  page.on('pageerror',e=>errors.push(e.message));
  let available=false,navigations=0;
  page.on('framenavigated',f=>{if(f===page.mainFrame())navigations++;});
  await page.addInitScript(()=>{localStorage.setItem('lunden.drawing','untouched');sessionStorage.setItem('lunden.session','untouched');});
  await page.route('**/version.json?*',r=>r.fulfill({json:available?published:current}));
  await page.route(`**/assets/viewer-${next}.js`,r=>r.fulfill({contentType:'text/javascript',body:bundle.replaceAll(current.version,next)}));
  await page.route('**/?v=*',r=>r.fulfill({contentType:'text/html',body:html.replaceAll(current.version,next)}));
  await page.route(`**/assets/style-${next}.css`,r=>r.fulfill({contentType:'text/css',path:'style.css'}));
  await page.goto(base+'/');await page.waitForFunction(()=>window.lundenViewer?.renderer.info.render.frame>0,null,{timeout:120000});
  await page.locator('#start').click();await page.evaluate(()=>document.exitPointerLock?.());
  const pose=await page.evaluate(()=>{const v=window.lundenViewer;v.moveTo('home');v.renderer.setAnimationLoop(null);v.camera.rotation.set(.05,3,0,'YXZ');v.renderer.render(v.scene,v.camera);return {position:v.navigation.pos.toArray(),yaw:v.camera.rotation.y,pitch:v.camera.rotation.x};});
  await page.screenshot({path:out+'/before.png'});
  available=true;
  await page.evaluate(()=>dispatchEvent(new Event('online')));
  await page.waitForFunction(()=>document.getElementById('update-status').textContent.includes('ny version'));
  // Native idle/countdown timers: this checks that the real app does reload itself.
  await page.waitForURL('**/?v='+next,{timeout:30000});
  await page.waitForFunction(()=>window.lundenViewer?.renderer.info.render.frame>0,null,{timeout:120000});
  const resumed=await page.evaluate(()=>{const v=window.lundenViewer;v.renderer.setAnimationLoop(null);return {position:v.navigation.pos.toArray(),yaw:v.camera.rotation.y,pitch:v.camera.rotation.x,intro:document.getElementById('intro').hidden,resume:!document.getElementById('resume').hidden,key:sessionStorage.getItem('kvarteret-lunden.update-resume'),local:localStorage.getItem('lunden.drawing'),original:sessionStorage.getItem('lunden.session')};});
  assert.deepEqual(resumed.position,pose.position);assert.equal(resumed.yaw,pose.yaw);assert.equal(resumed.pitch,pose.pitch);assert(resumed.intro&&resumed.resume);assert.equal(resumed.key,null);assert.equal(resumed.local,'untouched');assert.equal(resumed.original,'untouched');assert.equal(navigations,2);
  await page.screenshot({path:out+'/after.png'});await context.close();results.push('real WebGL app: automatic navigation, same L1007 position/view, active visit resumed, original storage unchanged');
  assert.deepEqual(errors,[]);
  await writeFile(out+'/results.json',JSON.stringify({results,pose,resumed,errors},null,2));
  console.log(JSON.stringify({results,errors,out},null,2));
}finally{await browser.close();}
