// Public #322 (original #2125): before/after frame sequences of one loop outdoor cat in the real public app.
// node tools/catlife322browser.mjs <before|after> [out=docs/verification/322] [base=http://127.0.0.1:8342]
// Serve a directory holding `before/` (the pre-change tree) and `after/` (this checkout), each with node_modules.
// The clock is frozen and stepped in 0.1 s frames; the same times are chosen for both phases from the pure catlife.js rules.
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
const phase=process.argv[2]??'after',out=process.argv[3]??'docs/verification/322',base=process.argv[4]??'http://127.0.0.1:8342';
await mkdir(out,{recursive:true});
const report={phase,errors:[],external:[],sockets:[],frames:[]};
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||undefined,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const ctx=await browser.newContext({viewport:{width:1280,height:850},deviceScaleFactor:1});
 await ctx.addInitScript(()=>{localStorage.setItem('lunden.drawing','unchanged');sessionStorage.setItem('lunden.session','unchanged');});
 const page=await ctx.newPage();
 page.on('pageerror',e=>{if(!/Pointer Lock/.test(e.message))report.errors.push(e.message);});
 page.on('request',r=>{if(new URL(r.url()).origin!==base)report.external.push(r.url());});
 page.on('websocket',s=>report.sockets.push(s.url()));
 await page.goto(`${base}/${phase}/?month=6`);
 await page.waitForFunction(()=>window.lundenViewer?.ambientCats&&lundenViewer.renderer.info.render.frame>0,null,{timeout:120000});
 report.plan=await page.evaluate(async()=>{
  const A=lundenViewer,o=A.ambientCats,c=o.cats[4],E=1793491200,L=await import('/after/src/catlife.js'),{CAT_LIFE}=await import('/after/src/config.js'),{lapPlan}=await import('/after/src/outdoorcatroute.js');
  A.renderer.setAnimationLoop(null);document.getElementById('start')?.click();document.exitPointerLock?.();
  document.querySelectorAll('.topbar,.locations,.bottom-bar,#resume,#crosshair').forEach(e=>{e.hidden=true;e.style.setProperty('display','none','important');});
  window.__clock=E;o.now=()=>__clock;o.nuzzle.next=Infinity;
  const seed=L.seedOf('public-cat-4'),at=T=>{__clock=E+T-c.spec.phase;return c.scheduled();};
  let stretch=null,wrap=null;
  for(let T=0;T<c.loop.period*3&&!(stretch&&wrap);T+=0.1){const s=at(T);if(s.walking)continue;
   const rest=lapPlan(c.loop,s.lap,c.id).legs[s.leg].rest;
   if(!stretch&&rest>=40&&s.restLeft<=3.05&&s.restLeft>2.95)stretch=T;
   const b=CAT_LIFE.sit.block;if(!wrap&&s.activity==='look'&&T%b<0.1&&T>b&&L.sitChoice(seed,T+1)==='wrap'&&s.restLeft>b+2)wrap=T;}
  window.__proof={E,c,o,A,at};return{stretch,wrap};
 });
 // Each frame: step the shared clock in 0.1 s up to `T`, from `from`, render from the cat's side.
 const shoot=async(name,from,T,view)=>{
  const row=await page.evaluate(({from,T,view})=>{const {c,o,A,at}=window.__proof;
   const s0=at(from);A.camera.position.set(s0.x+.8,o.ground(s0.x,s0.z)+.5,s0.z+.8);A.camera.updateMatrixWorld(true);
   for(let t=from;t<=T+1e-6;t+=0.1){at(t);o.update(false);}
   const s=c.state,y=s.y,f=[Math.sin(s.yaw),Math.cos(s.yaw)],sd=[Math.cos(s.yaw),-Math.sin(s.yaw)],d=view.d;
   const dir=[sd[0]*view.side+f[0]*view.front,sd[1]*view.side+f[1]*view.front],n=Math.hypot(...dir);
   A.camera.position.set(s.x+dir[0]/n*d,y+view.h,s.z+dir[1]/n*d);A.camera.lookAt(s.x,y+.17,s.z);A.camera.updateMatrixWorld(true);
   o.update(false);A.scene.updateMatrixWorld(true);A.renderer.info.reset?.();A.renderer.render(A.scene,A.camera);
   const p=c.p;return{T,restLeft:s.restLeft,activity:s.activity,near:s.near,bow:p.bow?.k??null,tailWrap:p.tailWrap??null,tailBend:p.tailBend??null,calls:A.renderer.info.render.calls,triangles:A.renderer.info.render.triangles,programs:A.renderer.info.programs.length,textures:A.renderer.info.memory.textures};
  },{from,T,view});
  await page.screenshot({path:`${out}/${phase}-${name}.png`});report.frames.push({name,...row});
 };
 const {stretch,wrap}=report.plan,side={side:1,front:.25,d:1.15,h:.42};
 // the end of a long rest: sitting, then (after) up into the stretch before walking on
 for(const [i,dt] of [0,1.2,1.8,2.5].entries())await shoot(`stretch-${i}`,i?stretch+[0,1.2,1.8,2.5][i-1]+0.1:stretch-2,stretch+dt,side);
 // an idle sit in a wrap block (after): the tail eases round the front paws, the head looks about
 for(const [i,dt] of [0.2,1.5,4,7].entries())await shoot(`wrap-${i}`,i?wrap+[0.2,1.5,4,7][i-1]+0.1:wrap-2,wrap+dt,{side:.6,front:1,d:1.05,h:.38});
 // close: the coat in sun
 await shoot('fur',wrap+7.1,wrap+7.2,{side:1,front:.6,d:.62,h:.3});
 // CPU of the cats' update with this cat near (posed and re-merged every frame), over 400 frames of its wrap block
 report.cpu=await page.evaluate(T=>{const {c,o,at}=window.__proof;let near=0;for(let i=0;i<40;i++){at(T+i*.1);o.update(false);}const t0=performance.now();for(let i=0;i<400;i++){at(T+4+i*.02);o.update(false);near+=c.state.near;}return{updates:400,msPerUpdate:(performance.now()-t0)/400,nearFrames:near,cats:o.cats.length};},wrap+1);
 report.storage=await page.evaluate(()=>({drawing:localStorage.getItem('lunden.drawing'),session:sessionStorage.getItem('lunden.session'),keys:Object.keys(localStorage).sort()}));
}finally{await writeFile(`${out}/browser-${phase}.json`,JSON.stringify(report,null,1)+'\n');await browser.close();}
console.log(JSON.stringify({phase,errors:report.errors,external:report.external.length,plan:report.plan,frames:report.frames.map(f=>[f.name,f.activity,f.near,f.bow,f.tailWrap,f.calls,f.programs]),cpu:report.cpu},null,0));
