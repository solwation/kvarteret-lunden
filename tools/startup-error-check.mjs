// Startup error view (#37) and loading steps (#39): node tools/startup-error-check.mjs BASE OUT
// Runs the real app with an aborted program file, an aborted plan, no WebGL and a malformed plan, on desktop and
// 390×844. Each must name the right step and cause above a working Försök igen; a normal start shows no error.
// A normal start must change the step text in order with a moving heartbeat and bar; a held plan plus a real
// main-thread block must show "Det här tar ovanligt lång tid" whose Försök igen reloads into a working start.
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const base=process.argv[2]??'http://localhost:8157';
const out=process.argv[3]??'artifacts';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
const isPlan=url=>url.pathname.endsWith('/data/plan.json');
const isProgram=url=>/\/(src\/main|assets\/viewer-[0-9a-f]+)\.js$/.test(url.pathname);
const noWebGL=()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...rest){return /webgl/i.test(type)?null:get.call(this,type,...rest);};};
const scenarios=[
 {name:'program',step:'Hämtar programfilerna',cause:'import',setup:page=>page.route(isProgram,route=>route.abort())},
 {name:'plan-aborted',step:'Hämtar planritningen',cause:'network',setup:page=>page.route(isPlan,route=>route.abort()),recover:true},
 {name:'no-webgl',step:'Startar 3D-grafiken',cause:'webgl',setup:page=>page.addInitScript(noWebGL)},
 {name:'plan-malformed',step:'Hämtar planritningen',cause:'scene',setup:page=>page.route(isPlan,route=>route.fulfill({status:200,contentType:'application/json',body:'{"floors":[{"walls":'}))},
];
const ready=page=>page.waitForFunction(()=>window.lundenViewer?.renderer.info.render.frame>0,null,{timeout:120000});
const results=[];
try{
 for(const [label,options] of [['desktop',{viewport:{width:1000,height:700}}],['mobile',{viewport:{width:390,height:844},hasTouch:true,isMobile:true}]]){
  for(const s of scenarios){
   const context=await browser.newContext({...options,deviceScaleFactor:1});
   const page=await context.newPage();page.setDefaultTimeout(60000);
   const csp=[];page.on('console',m=>{if(/Content Security Policy/i.test(m.text()))csp.push(m.text());});
   await s.setup(page);
   await page.goto(base+'/');
   const error=page.locator('#load-error');
   await error.waitFor({timeout:60000});
   const text=await error.textContent(),cause=await error.getAttribute('data-cause');
   assert.equal(text,`Fel i steget ”${s.step}”: ${{import:'en programfil kunde inte hämtas',network:'nätverket svarade inte',webgl:'webbläsaren kunde inte starta 3D-grafiken (WebGL)',scene:'ett oväntat fel uppstod'}[s.cause]}.`,`${label}/${s.name}`);
   assert.equal(cause,s.cause);
   const start=page.locator('#start');
   assert.equal(await start.textContent(),'Försök igen');assert(await start.isEnabled());
   assert.equal(await page.locator('.load-error').count(),1);
   assert(await page.locator('#load-step').isHidden()&&await page.locator('#load-slow').isHidden(),'error replaces the step row');
   const box=await error.boundingBox(),vw=options.viewport.width;assert(box.x>=0&&box.x+box.width<=vw,`${label}/${s.name} error fits the screen`);
   await page.screenshot({path:`${out}/${label}-${s.name}.png`});
   // Försök igen reloads the page; for the aborted plan the network is back and the real scene must start.
   if(s.recover)await page.unroute(isPlan);
   const reloaded=page.waitForEvent('framenavigated');
   await (options.hasTouch?start.tap():start.click());
   await reloaded;
   if(s.recover){await ready(page);assert.equal(await error.count(),0);assert.equal(await start.textContent(),'Börja utforska →');}
   else await error.waitFor();
   assert.deepEqual(csp,[],'No CSP violations');
   results.push({label,scenario:s.name,text,retry:s.recover?'recovered':'reloaded'});
   await context.close();
  }
  // A stalled step (#39): the plan is held and the main thread blocks for 3 s, longer than a lowered stallMs. The
  // heartbeat stops during the block; the notice appears once it releases, and its Försök igen reloads.
  {
   const context=await browser.newContext({...options,deviceScaleFactor:1});
   const page=await context.newPage();page.setDefaultTimeout(60000);
   let hold=true;const held=[];
   await page.route(isPlan,route=>hold?held.push(route):route.continue());
   await page.goto(base+'/');
   await page.waitForFunction(()=>window.kvarteretStartup?.step==='Hämtar planritningen');
   const beat0=await page.evaluate(()=>window.kvarteretStartup.beat);
   await page.waitForTimeout(400);
   const beat1=await page.evaluate(()=>window.kvarteretStartup.beat);
   assert(beat1>beat0,'heartbeat moves while the page works');
   const blocked=await page.evaluate(()=>{const S=window.kvarteretStartup;S.stallMs=1500;const b=S.beat,t=performance.now();while(performance.now()-t<3000);return {before:b,after:S.beat};});
   assert.equal(blocked.after,blocked.before,'heartbeat frozen during the block');
   const slow=page.locator('#load-slow');
   await slow.waitFor({state:'visible',timeout:5000});
   assert.equal(await slow.locator('p').textContent(),'Det här tar ovanligt lång tid.');
   assert.equal(await page.evaluate(()=>window.kvarteretStartup.stalled?.name),'Hämtar planritningen');
   assert.equal(await page.locator('#load-step-name').textContent(),'Hämtar planritningen');
   const box=await slow.boundingBox(),vw=options.viewport.width;assert(box.x>=0&&box.x+box.width<=vw,`${label} stall notice fits`);
   await page.screenshot({path:`${out}/${label}-stall.png`});
   hold=false;for(const r of held)await r.abort().catch(()=>{});
   const reloaded=page.waitForEvent('framenavigated');
   const retry=slow.getByRole('button',{name:'Försök igen'});
   await (options.hasTouch?retry.tap():retry.click());
   await reloaded;await ready(page);
   assert(await slow.isHidden());assert.equal(await page.locator('#load-error').count(),0);
   results.push({label,scenario:'stall',retry:'recovered'});
   await context.close();
  }
  // A normal start shows no error; the step text changes in order (#39).
  const context=await browser.newContext({...options,deviceScaleFactor:1});
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/');
  await page.waitForFunction(()=>window.kvarteretStartup?.step==='Bygger huset'&&window.kvarteretStartup.fraction>.3,null,{timeout:60000,polling:50});
  const mid=await page.evaluate(()=>({name:document.getElementById('load-step-name').textContent,bar:document.getElementById('load-bar').style.width,elapsed:document.getElementById('load-elapsed').textContent}));
  assert.equal(mid.name,'Bygger huset');assert(parseInt(mid.bar)>30,`bar moves inside the build: ${mid.bar}`);
  await page.screenshot({path:`${out}/${label}-loading.png`});
  await ready(page);
  const steps=await page.evaluate(()=>window.kvarteretStartup.steps.map(s=>s.name));
  assert.deepEqual(steps,['Hämtar programfilerna','Startar 3D-grafiken','Hämtar planritningen','Bygger huset','Bygger trapphus och garage']);
  assert(await page.locator('#load-step').isHidden()&&await page.locator('#load-progress').isHidden()&&await page.locator('#load-slow').isHidden(),'loading row gone when done');
  assert.equal(await page.locator('#load-error').count(),0);
  assert.equal(await page.locator('#start').textContent(),'Börja utforska →');
  assert.equal(await page.evaluate(()=>window.kvarteretStartup.done),true);
  assert.deepEqual(errors,[]);
  await page.screenshot({path:`${out}/${label}-normal.png`});
  results.push({label,scenario:'normal',text:null,mid,steps});
  await context.close();
 }
}finally{await browser.close();}
console.log(JSON.stringify(results,null,1));
console.log('PASS: startup error view names the step and cause, Försök igen reloads/recovers, normal start shows no error, steps change in order with a heartbeat, a stalled step shows the slow notice.');
