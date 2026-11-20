// Public #344 (original #2202): the actual public river ducks by day vs at night; before = HEAD's pre-change modules served in place.
// Records pair positions/state, draws/triangles, Ducks.update CPU, zero external requests and untouched storage.
// node tools/ducklife344browser.cjs [base] [out]
const{chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const[base='http://localhost:8660',out='docs/verification/344']=process.argv.slice(2),baseline=process.env.BASELINE||'a08a6f3',W=1120,H=800;
const touched=['ducks','duckbrain','duckhabitat','duckkiss','duckmotion','config','main'];
(async()=>{fs.mkdirSync(out+'/before',{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const report={baseline:execFileSync('git',['rev-parse',baseline],{encoding:'utf8'}).trim(),viewport:[W,H],errors:[],external:[],runs:{}};
try{for(const[run,phase,time]of[['before-night','before','23:00:00'],['day','after','12:00:00'],['night','after','23:00:00'],['morning','after','08:00:00']]){
 const ctx=await browser.newContext({viewport:{width:W,height:H},deviceScaleFactor:1});
 await ctx.route('**/*',r=>{const u=r.request().url();if(new URL(u).origin!==new URL(base).origin){report.external.push(u);return r.abort();}
  const f=new URL(u).pathname.match(/^\/src\/([a-z0-9]+)\.js$/);
  if(phase==='before'&&f&&touched.includes(f[1]))return r.fulfill({contentType:'text/javascript',body:execFileSync('git',['show',`${baseline}:src/${f[1]}.js`])});
  return r.continue();});
 await ctx.addInitScript(()=>{try{localStorage.setItem('lunden.sentinel','kept');}catch{}window.__store=()=>JSON.stringify(Object.entries(localStorage).sort());});
 const page=await ctx.newPage();page.on('pageerror',e=>{if(!/Pointer Lock/.test(e.message))report.errors.push(run+': '+e.message);});page.on('console',m=>{if(/Pointer Lock/.test(m.text()))return;if(m.type()==='error'||/THREE\.WebGLProgram|GL_INVALID/.test(m.text()))report.errors.push(run+': '+m.text().slice(0,300));});
 await page.clock.setFixedTime(new Date('2026-06-15T'+time));
 await page.goto(base+'/?month=6&nocats');
 await page.waitForFunction(()=>window.lundenViewer?.renderer.info.render.frame>0,null,{timeout:300000,polling:250});
 const p=await page.evaluate(async({morning})=>{const a=lundenViewer,D=a.ducks,{renderedTerrainY:G}=await import('/src/surroundings.js');
  a.renderer.setAnimationLoop(null);document.getElementById('start')?.click();document.exitPointerLock?.();document.querySelectorAll('.topbar,.locations,.bottom-bar,#crosshair').forEach(e=>e.hidden=true);const r=document.getElementById('resume');if(r)r.style.setProperty('display','none','important');
  const b0=D.flock.brains[0],home={x:b0.x,z:b0.z};
  const cam=(i=0)=>{const b=D.flock.brains[i],yaw=b.yaw+Math.PI/2,ex=b.x+Math.sin(yaw)*3.2,ez=b.z+Math.cos(yaw)*3.2;a.camera.position.set(ex,Math.max(G(ex,ez)+.5,b.y+1.1),ez);a.camera.lookAt(b.x,b.y+.1,b.z);a.camera.updateMatrixWorld(true);};
  for(const v of D.animals)v.activity.next=1e9;D.kiss.next=1e9;
  const state=()=>D.animals.map(v=>{const b=v.brain;return{id:b.id,pair:b.pair,x:+b.x.toFixed(2),z:+b.z.toFixed(2),swimming:!!b.swimming,moving:!!b.moving,sleeping:!!b.sleeping,roosting:!!b.roosting,meshY:+v.mesh.position.y.toFixed(3),pitch:+v.mesh.rotation.x.toFixed(3)};});
  a.camera.position.set(home.x,b0.y+1.2,home.z+3);D.lastPlayer?.copy(a.camera.position);
  // Settle: 600 s of simulated time (the observer stays by the first pair, so both stay within the active distance).
  const steps=12000;for(let k=0;k<steps;k++){D.lastPlayer.copy(a.camera.position);D.update(.05,false);}
  if(morning){for(let k=0;k<1200;k++){D.lastPlayer.copy(a.camera.position);D.update(.05,false);}}
  const out={state:state(),dist:Math.hypot(D.flock.brains[2].x-b0.x,D.flock.brains[2].z-b0.z)};
  cam(0);D.lastPlayer.copy(a.camera.position);D.update(.05,false);cam(0);a.renderer.render(a.scene,a.camera);
  const r2=a.renderer.info.render;out.calls=r2.calls;out.triangles=r2.triangles;out.state2=state();
  const t=performance.now();for(let k=0;k<400;k++){D.lastPlayer.copy(a.camera.position);D.update(.05,false);}out.cpu=+((performance.now()-t)/400).toFixed(3);cam(0);
  out.night=D.night??null;return out;},{morning:run==='morning'});
 p.storage=await page.evaluate(()=>__store());
 const buf=await page.screenshot({type:'jpeg',quality:82});fs.writeFileSync(path.join(out,run==='before-night'?'before/night-before.jpg':run+'.jpg'),buf);
 report.runs[run]=p;await ctx.close();}
 const R=report.runs;assert.deepEqual(report.errors,[]);assert.deepEqual(report.external,[]);
 assert(R['night'].state.every(s=>s.sleeping&&!s.swimming&&!s.moving),'all four rest ashore at night');
 assert(R['before-night'].state.some(s=>s.swimming||s.moving),'before: no night rest');
 assert(R['day'].state.every(s=>!s.sleeping)&&R['morning'].state.every(s=>!s.sleeping),'day/morning awake');
 assert.equal(R.night.calls,R.day.calls,'same draw calls');assert(Math.abs(R.night.triangles-R.day.triangles)<.01*R.day.triangles,'triangles within 1% (view-dependent culling only)');
 assert(R.night.state2.every(s=>s.pitch>0.05),'resting pose tucked');
 assert(R.night.storage.includes('lunden.sentinel'));
 fs.writeFileSync(path.join(out,'browser.json'),JSON.stringify(report,null,1));console.log(JSON.stringify(Object.fromEntries(Object.entries(R).map(([k,v])=>[k,{state:v.state,calls:v.calls,triangles:v.triangles,cpu:v.cpu,dist:v.dist}])),null,1));
}catch(e){fs.writeFileSync(path.join(out,'diagnostic.json'),JSON.stringify({...report,error:e.stack},null,1));throw e;}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
