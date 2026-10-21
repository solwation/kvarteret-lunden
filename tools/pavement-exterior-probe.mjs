// #124: actual emitted sidewalk ownership, fold geometry, navigation and paired views.
import {chromium} from 'playwright';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
const base=process.argv[2]??'http://localhost:8257',out=process.argv[3]??'/tmp/pavement-diagnostic',before=process.argv[4];
await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,args:['--no-sandbox','--enable-unsafe-swiftshader']});
try {
 for(const [profile,width,height,touch] of [['desktop',1280,800,false],['portrait',390,844,true],['landscape',844,390,true]]) {
  if(process.env.PROFILE&&profile!==process.env.PROFILE)continue;
  const page=await browser.newPage({viewport:{width,height},hasTouch:touch,isMobile:touch,...(touch?{userAgent:'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36'}:{})}),errors=[],external=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(new URL(r.url()).origin!==new URL(base).origin)external.push(r.url())});
  await page.route('**/src/**',async r=>{const path=new URL(r.request().url()).pathname.slice(1);if(!process.env.BASELINE_REF&&path!=='src/main.js'&&path!=='src/paddock.js'&&path!=='src/surroundings.js')return r.continue();let body=process.env.BASELINE_REF?execFileSync('git',['show',process.env.BASELINE_REF+':'+path]).toString():await readFile(path,'utf8');if(path==='src/main.js')body=body.replace('window.lundenViewer = {','window.lundenViewer = { frame, clock,');if(path==='src/paddock.js')body=body.replace('mulberry((Math.random() * 1e9) | 0)','mulberry(11521021)');if(path==='src/surroundings.js')body=body.replace('const p = g.attributes.position, pos = [], polygons = [];','const __joinStart=performance.now();const p = g.attributes.position, pos = [], polygons = [];').replace('return surfaceGeometry(pos);','const __joined=surfaceGeometry(pos);(window.__pavementStats??=[]).push({polygons:polygons.length,nodes:nodes.length,width,ms:performance.now()-__joinStart});return __joined;');return r.fulfill({contentType:'text/javascript',body})});
  await page.clock.setFixedTime(new Date('2026-10-21T09:50:00Z'));
  const started=Date.now();await page.goto(base);await page.waitForFunction(()=>window.lundenViewer?.paddock&&lundenViewer.renderer.info.render.frame>0,null,{timeout:240000});
  const r=await page.evaluate(async()=>{const T=await import('three'),g=lundenViewer.scene.getObjectByName('south-land').geometry,p=g.attributes.position,c=g.attributes.color,color=new T.Color(0x5f6164),asphalt=[],other=[];for(let i=0;i<p.count;i+=3){const out=Math.abs(c.getX(i)-color.r)<1e-6&&Math.abs(c.getY(i)-color.g)<1e-6&&Math.abs(c.getZ(i)-color.b)<1e-6?asphalt:other;for(let k=0;k<3;k++)out.push(p.getX(i+k),p.getY(i+k),p.getZ(i+k),...(out===other?[c.getX(i+k),c.getY(i+k),c.getZ(i+k)]:[]));}return{asphalt,other};});
 const{createHash}=await import('node:crypto');r.otherHash=createHash('sha256').update(Buffer.from(new Float32Array(r.other).buffer)).digest('hex');delete r.other;await writeFile(`${out}/${profile}.json`,JSON.stringify(r));await page.close();
 }
}finally{await browser.close()}
