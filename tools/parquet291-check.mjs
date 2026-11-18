// Public #291: actual public World floor/level consumers, independent before/after images.
import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import path from 'node:path';
import assert from 'node:assert/strict';
const [base='http://localhost:8186',out='docs/verification/291']=process.argv.slice(2);
await fs.mkdir(out,{recursive:true});
const baselineSHA=execFileSync('git',['rev-parse','f4afd63'],{encoding:'utf8'}).trim();
const report={sourceOriginal:'3515bf9981c0f3df79d84d66305a24a7f16ffe9c',baselinePublic:baselineSHA,
 environment:'Chromium/SwiftShader,900×600,DPR1,MSAA,NeutralToneMapping;same public production builders,plan,camera,lights',source:{},errors:[],external:[]};
for(const f of ['src/parquet.js','src/world.js','src/config.js','tools/parquet291.html','tools/parquet291-check.mjs'])
 report.source[f]=createHash('sha256').update(await fs.readFile(f)).digest('hex');
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH,
 args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try {
 for(const phase of ['before','after']) {
  const page=await browser.newPage({viewport:{width:900,height:640},deviceScaleFactor:1});
  page.on('pageerror',e=>report.errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
  page.on('request',r=>{const u=new URL(r.url());if(/^https?:$/.test(u.protocol)&&u.origin!==new URL(base).origin)report.external.push(u.href);});
  await page.route('**/src/world.js',async r=>{
   const src=phase==='before'?execFileSync('git',['show',`${baselineSHA}:src/world.js`],{encoding:'utf8',maxBuffer:10e6}):await fs.readFile('src/world.js','utf8');
   await r.fulfill({contentType:'text/javascript',body:src+'\nexport { M, SM, buildLevel, plate };\n'});
  });
  await page.goto(`${base}/tools/parquet291.html?phase=${phase}`);
  await page.waitForFunction(()=>window.__ready,null,{timeout:180000});
  report[phase]={views:{},textures:await page.evaluate(()=>window.__textures())};
  for(const [type,id]of [[0,'chalk'],[1,'standard']])for(const view of ['near','room']) {
   report[phase].views[id+'-'+view]=await page.evaluate(({type,view})=>window.__render(type,view),{type,view});
   await page.screenshot({path:path.join(out,phase+'-'+id+'-'+view+'.jpg'),type:'jpeg',quality:92});
  }
  if(phase==='after')report.textureChecks=await page.evaluate(()=>window.__textureChecks());
  await page.close();
 }
 for(const k of Object.keys(report.before.views))assert.deepEqual(report.before.views[k],report.after.views[k],k+' bounds,draws,geometry');
 for(let i=0;i<2;i++) {
  assert.deepEqual(report.before.textures[i].maps[0],report.after.textures[i].maps[0]);
  assert.equal(report.after.textures[i].maps.length,2);
  assert(report.after.textures[i].sameRoughUV);
  assert.equal(report.before.textures[i].roughness,report.after.textures[i].roughness);
 }
 for(const c of report.textureChecks){assert(c.cached&&c.opaque);assert(c.roughMin>=220&&c.roughMax===255&&c.roughMin<c.roughMax);}
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.external,[]);
 const compose=await browser.newPage({viewport:{width:1800,height:1280},deviceScaleFactor:1});
 for(const id of ['chalk','standard']) {
  const images=[];
  for(const view of ['near','room'])for(const phase of ['before','after']) {
   const jpg=await fs.readFile(path.join(out,phase+'-'+id+'-'+view+'.jpg'));
   images.push(`<img src="data:image/jpeg;base64,${jpg.toString('base64')}">`);
  }
  await compose.setContent('<style>body{margin:0;display:grid;grid-template-columns:900px 900px}img{display:block;width:900px;height:640px}</style>'+images.join(''));
  await compose.evaluate(()=>Promise.all([...document.images].map(im=>im.decode())));
  await compose.screenshot({path:path.join(out,id+'-comparison.jpg'),type:'jpeg',quality:93});
 }
 await compose.close();
 for(const phase of ['before','after'])for(const id of ['chalk','standard'])for(const view of ['near','room'])
  await fs.unlink(path.join(out,phase+'-'+id+'-'+view+'.jpg'));
 report.passed=true;
 console.log('PASS: public original/standard production floor and level, matched bounds/draws/triangles, cached metre-scaled maps, matte limits, no page errors/external requests');
} catch(e) {
 report.passed=false;report.failure=e.stack;console.error(e.stack);process.exitCode=1;
} finally {
 await browser.close();await fs.writeFile(path.join(out,'result.json'),JSON.stringify(report,null,2)+'\n');
}
