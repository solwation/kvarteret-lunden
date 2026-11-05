import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const [base='http://localhost:8172',out='docs/verification/254']=process.argv.slice(2);
const instrumentation = `
import { EdgesGeometry as Backport } from './vendor/three/EdgesGeometry.js';
const edgeProbe = window.__edgeProbe ??= { calls: 0, components: 0, baselineMs: 0, backportMs: 0, mismatches: 0 };
function EdgesGeometry(geometry, angle) {
  let before, after;
  const baseline = () => { const t = performance.now(); before = new THREE.EdgesGeometry(geometry, angle); edgeProbe.baselineMs += performance.now() - t; };
  const backport = () => { const t = performance.now(); after = new Backport(geometry, angle); edgeProbe.backportMs += performance.now() - t; };
  if (edgeProbe.calls % 2) { backport(); baseline(); } else { baseline(); backport(); }
  const a = before.attributes.position.array, b = after.attributes.position.array;
  if (a.length !== b.length || a.some((v, i) => !Object.is(v, b[i]))) {
    edgeProbe.mismatches++; throw Error('Architectural edge backport differs from Three r170');
  }
  edgeProbe.calls++; edgeProbe.components += a.length;
  before.dispose();
  return after;
}
`;
await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const report={errors:[],external:[]};
try {
 const page=await browser.newPage({viewport:{width:800,height:500}});
 await page.addInitScript(()=>{localStorage.setItem('lunden.drawing','unchanged');sessionStorage.setItem('lunden.session','unchanged');});
 page.on('pageerror',e=>report.errors.push(e.stack));
 page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
 page.on('request',r=>{if(new URL(r.url()).origin!==new URL(base).origin)report.external.push(r.url());});
 await page.route(/\/src\/(architectureedges|architectural-edges)\.js$/,async route=>{
  const response=await route.fetch(),source=await response.text();
  const needle="import { EdgesGeometry } from './vendor/three/EdgesGeometry.js';";
  assert(source.includes(needle));
  await route.fulfill({response,body:source.replace(needle,instrumentation)});
 });
 await page.goto(base,{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.lundenViewer?.renderer.info.render.frame>0,null,{timeout:180000});
 await page.evaluate(()=>window.lundenViewer.renderer.setAnimationLoop(null));
 report.probe=await page.evaluate(()=>window.__edgeProbe);
 assert(report.probe.calls>0);assert.equal(report.probe.mismatches,0);
 console.log('PASS public source parity',JSON.stringify(report.probe));
 await page.locator('#start').click();await page.evaluate(()=>document.exitPointerLock?.());
 for(const place of ['area','home','core']) {
  await page.evaluate(place=>{const v=window.lundenViewer;v.moveTo(place);v.renderer.render(v.scene,v.camera);},place);
  await page.screenshot({path:out+'/'+place+'.png'});
 }
 report.storage=await page.evaluate(()=>[localStorage.getItem('lunden.drawing'),sessionStorage.getItem('lunden.session'),Object.keys(localStorage)]);
 assert.deepEqual(report.storage,['unchanged','unchanged',['lunden.drawing']]);
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.external,[]);
 console.log('PASS own views, no runtime errors, external requests or original-storage changes');
} catch(e){report.failure=e.stack;process.exitCode=1;console.error(e.stack);}
finally{await writeFile(out+'/browser.json',JSON.stringify(report,null,2)+'\n');await browser.close();}
