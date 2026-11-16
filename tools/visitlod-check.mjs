// Public #288: one bounded actual-app run, same-camera pre-cull control and native cull hook.
import {chromium} from 'playwright';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const [base='http://127.0.0.1:8828',out='docs/verification/288']=process.argv.slice(2);
const farOnly=process.argv.includes('--far-only');
await mkdir(out,{recursive:true});
const report={source:{},profiles:{},checks:[],errors:[],external:[]};
for(const f of ['src/visitunit.js','src/main.js','src/world.js','src/config.js','src/lod.js'])report.source[f]=createHash('sha256').update(await readFile(f)).digest('hex');
const check=(ok,text)=>{report.checks.push({ok:!!ok,text});assert(ok,text);console.log('PASS',text);};
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
try{
 for(const phone of (farOnly?[false]:[false,true])){
  const name=phone?'phone':'desktop',context=await browser.newContext({viewport:{width:960,height:600},deviceScaleFactor:1});
  const page=await context.newPage();page.setDefaultTimeout(120000);await page.clock.setFixedTime(new Date('2026-07-16T10:00:00Z'));
  page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(m.type()==='error'||/no mid level/.test(m.text()))report.errors.push(m.text());});
  page.on('request',r=>{if(new URL(r.url()).origin!==new URL(base).origin)report.external.push(r.url());});
  // Expose the existing frame for deterministic pumping, plus an explicit pre-hook control. No product file is changed.
  await page.route('**/src/main.js',async route=>{
   let s=await readFile('src/main.js','utf8');
   s=s.replace('  ready = true;',`  window.__visitInitial = world.units.map(u=>({u, visible:u.detail.map(o=>o.visible)}));\n  ready = true;`);
   s=s.replace('  renderer.setAnimationLoop(frame);','  window.__visitFrame = () => { clock.getDelta = () => 1/60; frame(); };\n  renderer.setAnimationLoop(frame);');
   s=s.replace('  for (const u of world.units) u.cull(camera.position, away);',`  if (window.__visitBefore) for (const {u,visible} of window.__visitInitial) { u.object.visible=true; u.detail.forEach((o,i)=>o.visible=visible[i]); u.standIn.visible=false; if(u.mid)u.mid.group.visible=false; u.shown='before-hook'; }\n  else for (const u of world.units) u.cull(camera.position, away);`);
   await route.fulfill({body:s,contentType:'text/javascript'});
  });
  await page.goto(base+'/?month=7'+(phone?'&lowmem':''),{waitUntil:'commit'});
  await page.waitForFunction(()=>window.lundenViewer?.renderer.info.render.frame>0,null,{timeout:180000});
  await page.evaluate(()=>window.lundenViewer.renderer.setAnimationLoop(null));
  await page.evaluate(()=>document.querySelectorAll('#intro,#loading,.overlay,#resume,.controls,.locations,.hud,#prompt,#place,#status').forEach(e=>e.style.display='none'));
  const p=report.profiles[name]={views:{},setup:await page.evaluate(()=>{const A=window.lundenViewer,u=A.world.units.find(u=>u.id==='L1004');window.__unit=u;
   const members=new Set();u.object.traverse(o=>members.add(o));let flatCalls=0;const old=A.renderer.renderBufferDirect;
   A.renderer.renderBufferDirect=function(...args){if(members.has(args[4]))flatCalls++;return old.apply(this,args);};
   window.__unitAt=(d,before=false,full=false)=>{const {camera,navigation:n,renderer,scene}=A;n.teleport((u.box.x0+u.box.x1)/2,u.bottom,u.box.z0-d);camera.rotation.set(0,Math.PI,0,'YXZ');camera.updateMatrixWorld(true);window.__visitBefore=before;
    for(const q of A.world.units)q.shown='reset';window.__visitFrame();
    if(full){u.object.visible=true;u.detail.forEach(o=>o.visible=true);u.mid.group.visible=false;u.standIn.visible=false;}
    flatCalls=0;renderer.info.reset();renderer.render(scene,camera);return{calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,flatCalls,level:u.shown,centreDistance:u.mid.centre.value.distanceTo(camera.position),fade:Math.max(0,Math.min(1,(d-u.mid.start)/(u.mid.end-u.mid.start)))};};
   return{hookLevels:A.world.units.map(q=>q.shown),units:A.world.units.map(q=>({id:q.id,mid:!!q.mid,merged:q.mid?.group.children.length,pass:q.mid?.pass.size,start:q.mid?.start,end:q.mid?.end})),rest:u.atRest(),box:u.box};
  })};
  check(p.setup.units.every(q=>q.mid),'both actual public units build a merged level: '+name);
  check(p.setup.units.every(q=>q.start===(phone?9:24)&&q.end===(phone?12:28)),'native phone/desktop fade range: '+name);
  const ds=farOnly?[28.1]:phone?[4,7,10.5,15]:[4,7,11.5,18,26,35];
  for(const d of ds){
   const before=await page.evaluate(d=>__unitAt(d,true),d),after=await page.evaluate(d=>__unitAt(d),d);p.views[d]={before,after};
   const want=d<=5?'all':d<(phone?12:28)?'mid':'shell';check(after.level===want&&after.calls<=before.calls,`${name} ${d}m: ${want}, calls ${before.calls} -> ${after.calls}`);
   if(want==='mid')check(Math.abs(after.centreDistance-d)<1e-6,`${name} ${d}m: fade follows footprint distance`);
   await page.screenshot({path:`${out}/${name}-${d}m-after.png`});
   if(farOnly||d===7||d===18){await page.evaluate(d=>__unitAt(d,true),d);await page.screenshot({path:`${out}/${name}-${d}m-before.png`});}
  }
  if(!farOnly){
  // At the shut near/mid switch compare native L1004 parts with merged parts in exactly the same scene/camera.
  p.pixels=await page.evaluate(()=>{const A=window.lundenViewer,gl=A.renderer.getContext(),w=A.renderer.domElement.width,h=A.renderer.domElement.height;
   const read=()=>{const x=new Uint8Array(w*h*4);gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,x);return x;};
   __unitAt(5.5,false,true);const a=read();__unitAt(5.5);const b=read();let different=0;for(let i=0;i<a.length;i+=4)if(Math.abs(a[i]-b[i])>8||Math.abs(a[i+1]-b[i+1])>8||Math.abs(a[i+2]-b[i+2])>8)different++;return{different,pixels:w*h,fraction:different/(w*h)};
  });check(p.pixels.fraction<=.005,`${name}: near/mid pixel difference <=0.5% (${p.pixels.fraction})`);
  p.moving=await page.evaluate(()=>{const A=window.lundenViewer,u=__unit,records=[];
   for(const target of [u.doors.find(d=>!d.exterior),u.lids.find(t=>t.name==='fönstret')]){
    __unitAt(8);const before=u.shown;target.toggle();A.navigation.advanceOpenables(1/30);window.__visitFrame();const moving={level:u.shown,t:target.t};
    for(let i=0;i<400&&target.t!==1;i++)A.navigation.advanceOpenables(1/30);window.__visitFrame();const opened={level:u.shown,t:target.t};
    __unitAt(14);const beyond=u.shown;__unitAt(8);target.toggle();for(let i=0;i<400&&target.t!==0;i++)A.navigation.advanceOpenables(1/30);window.__visitFrame();records.push({name:target.name,before,moving,opened,beyond,closed:{level:u.shown,t:target.t}});
   }return records;
  });check(p.moving.every(r=>r.before==='mid'&&r.moving.level==='all'&&r.moving.t>0&&r.moving.t<1&&r.opened.t===1&&r.opened.level==='all'&&r.closed.t===0&&r.closed.level==='mid'),name+': actual door/window animation retains full parts through 12m then restores mid');
  p.navigation=await page.evaluate(()=>{const A=window.lundenViewer,states={};for(const place of ['l1004','l1201','lower','garage']){if(!A.locations[place])continue;A.moveTo(place);for(const u of A.world.units)u.shown='reset';window.__visitFrame();states[place]={unit:A.navigation.unit?.id,below:A.navigation.below,levels:A.world.units.map(u=>u.shown)};}return states;});
  check(p.navigation.l1004?.unit==='L1004'&&p.navigation.l1004.levels[0]==='all'&&p.navigation.l1201?.unit==='L1201'&&p.navigation.garage.levels.every(l=>l==='none'),name+': public apartment navigation and garage hiding preserved');
  }
  await context.close();
 }
 check(report.errors.length===0,'no page/GLSL errors');check(report.external.length===0,'no external requests');report.passed=true;
}catch(e){report.failure=e.stack;report.passed=false;process.exitCode=1;console.error(e.stack);}
finally{await browser.close();await writeFile(out+(farOnly?'/far-correction.json':'/result.json'),JSON.stringify(report,null,2)+'\n');}
