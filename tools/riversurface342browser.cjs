// #342 (original #2186): before/after capture of the actual river bridge water (sky reflection, bank tint, drifting ripples) in the #303 fixture.
// PLAYWRIGHT_MODULE=... BEFORE_REV=<sha> node tools/riversurface342browser.cjs http://localhost:8650 docs/verification/342
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright'),fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
const[base='http://localhost:8650',out='docs/verification/342']=process.argv.slice(2),rev=process.env.BEFORE_REV||'HEAD',FILES=['src/config.js','src/riversurface.js','src/riverbridge.js'];
const VIEWS=['near','walking','grazing'];
(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const report={rev,errors:[],shots:[]};
try{for(const phase of ['before','after']){const page=await browser.newPage({viewport:{width:1120,height:800},deviceScaleFactor:1});
 page.on('pageerror',e=>report.errors.push(phase+': '+e.message));page.on('console',m=>{if(m.type()==='error'||/THREE.WebGLProgram|shader/i.test(m.text()))report.errors.push(phase+': '+m.text())});
 if(phase==='before')for(const f of FILES)await page.route('**/'+f,r=>r.fulfill({contentType:'text/javascript',body:execFileSync('git',['show',rev+':'+f],{maxBuffer:16e6})}));
 await page.goto(base+'/tools/riversurface303.html');await page.waitForFunction(()=>window.__ready,null,{timeout:180000});
 for(const v of VIEWS)for(const later of phase==='before'?[0]:[0,1]){
  const info=await page.evaluate(async({v,later})=>{if(later&&window.__step)window.__step(2.5);return window.__frame2?window.__frame2(v):window.__frame(v)},{v,later});
  const file=path.join(out,(phase==='before'?'before/':'')+`${phase}-${v}${later?'-later':''}.jpg`);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,Buffer.from(info.image.split(',')[1],'base64'));
  report.shots.push({file,calls:info.calls,triangles:info.triangles,textures:info.textures,programs:info.programs});}
 await page.close()}
}finally{await browser.close()}
fs.writeFileSync(path.join(out,'browser.json'),JSON.stringify(report,null,1));console.log(JSON.stringify(report));if(report.errors.length)process.exitCode=1;})().catch(e=>{console.error(e);process.exitCode=1});
