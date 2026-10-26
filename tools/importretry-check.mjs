// Import retry (#170, from original #1627/#1630): node tools/importretry-check.mjs BASE
// A failed first fetch of the main program file is retried with a new URL and the real scene starts; a persistent failure
// reloads once, then shows the error view. A hung import is a load failure only while nothing finishes downloading.
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const base=process.argv[2]??'http://localhost:8157';
const isProgram=url=>/\/(src\/main|assets\/viewer-[0-9a-f]+)\.js$/.test(url.pathname);
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
try{
 for(const mode of ['normal','once-404','once-network','always-404']){
  const page=await browser.newPage();page.setDefaultTimeout(90000);const urls=[];const t0=Date.now();
  await page.route(url=>isProgram(new URL(url)),route=>{
   urls.push(route.request().url());
   if(mode==='always-404'||(mode!=='normal'&&urls.length===1))return mode==='once-network'?route.abort('failed'):route.fulfill({status:404,body:'nope'});
   return route.continue();
  });
  await page.goto(base+'/',{waitUntil:'domcontentloaded'});
  if(mode==='always-404'){
   await page.locator('#load-error').waitFor({timeout:60000});
   assert.equal(await page.locator('#load-error').getAttribute('data-cause'),'import');
   assert(urls.length>=3,`retry + guarded reload + retry, got ${urls.length}`);
   assert.equal(await page.locator('#start').textContent(),'Försök igen');
   console.log('PASS always-404',{requests:urls.length,ms:Date.now()-t0});
  }else{
   await page.waitForFunction(()=>window.kvarteretStartup.step!=='Hämtar programfilerna',null,{timeout:120000}); // main.js loaded and began its first real step
   if(mode==='normal')await page.waitForFunction(()=>window.lundenViewer?.renderer.info.render.frame>0,null,{timeout:240000});
   assert.equal(await page.locator('#load-error').count(),0);
   assert.equal(urls.length,mode==='normal'?1:2,`${mode} requests`);
   if(mode!=='normal')assert.match(urls[1],/[?&]r=1/);
   console.log('PASS',mode,{requests:urls.length,ms:Date.now()-t0});
  }
  await page.close();
 }
 // Stall detector (#1630), driven through the guard's own function with a fake importer.
 const page=await browser.newPage();await page.goto(base+'/',{waitUntil:'domcontentloaded'});
 const r=await page.evaluate(async()=>{
  const run=window.kvarteretImportWithRetry;
  const fake=()=>{const m={};return{getItem:k=>m[k]??null,setItem:(k,v)=>{m[k]=v;}};};
  const common={retries:1,delay:10,stallTimeout:300,storage:fake(),downloading:()=>true,watch:()=>()=>{}};
  const never=new Promise(()=>{}),out={};let calls=[];
  out.once={value:await run('http://x.test/main.js',{...common,reload:()=>{out.reloaded=1;},importer:u=>{calls.push(u);return calls.length===1?never:Promise.resolve('ok');}}),calls};
  calls=[];let reloads=0;
  out.always={value:await run('http://x.test/main.js',{...common,reload:()=>{reloads++;},importer:u=>{calls.push(u);return never;}}),calls,reloads};
  out.building=await run('http://x.test/main.js',{...common,downloading:()=>false,importer:()=>new Promise(res=>setTimeout(()=>res('late'),700))});
  let t;out.progressing=await run('http://x.test/main.js',{...common,watch:cb=>{t=setInterval(cb,100);return()=>clearInterval(t);},importer:()=>new Promise(res=>setTimeout(()=>res('slow-but-progressing'),800))});
  let again=0;const same=fake();same.setItem('kvarteret-lunden.import-reload',JSON.stringify({at:Date.now()}));
  try{await run('http://x.test/main.js',{...common,storage:same,reload:()=>{again++;},importer:()=>Promise.reject(Error('Failed to fetch dynamically imported module: http://x.test/main.js'))});}catch(e){out.rejected=e.message;}
  out.again=again;return out;
 });
 assert.equal(r.once.value,'ok');assert.equal(r.once.calls.length,2);assert.match(r.once.calls[1],/[?&]r=1/);assert.equal(r.reloaded,undefined);
 assert.equal(r.always.value,true);assert.equal(r.always.calls.length,2);assert.equal(r.always.reloads,1);
 assert.equal(r.building,'late');assert.equal(r.progressing,'slow-but-progressing');
 assert.match(r.rejected,/dynamically imported module/);assert.equal(r.again,0,'no second reload inside the window');
 console.log('PASS stall: hung import retried once then one guarded reload; no stall while building or while files finish; no reload loop');
 await page.close();
}finally{await browser.close();}
