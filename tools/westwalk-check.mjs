// #232: source-bound public Navigation route; one continuous walk crosses the old western edge.
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const base=process.argv[2]??'http://localhost:8943',out=process.argv[3]??'artifacts/232',phase=process.argv[4]??'after';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,args:['--no-sandbox','--enable-unsafe-swiftshader']});
try{
 const ctx=await browser.newContext({viewport:{width:1280,height:800},deviceScaleFactor:1});
 await ctx.addInitScript(()=>{localStorage.setItem('lunden.drawing','original-drawing-sentinel');localStorage.setItem('lunden.cloud.queue','original-queue-sentinel');sessionStorage.setItem('lunden.session','original-session-sentinel');});
 const page=await ctx.newPage(),external=[],errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(new URL(r.url()).origin!==new URL(base).origin)external.push(r.url());});
 await page.clock.setFixedTime(new Date('2026-06-15T11:00:00Z'));
 await page.goto(base+'/?month=6&cloud=https://ignored.invalid&sync=debug');await page.waitForFunction(()=>window.lundenViewer?.renderer.info.render.frame>0,null,{timeout:180000});
 await page.evaluate(()=>{lundenViewer.renderer.setAnimationLoop(null);document.getElementById('start').click();document.getElementById('resume').hidden=true;});
 const first=await page.evaluate(async(phase)=>{
  const {WALK,SITE}=await import('/src/config.js'),{walkingGroundY:groundY,renderedTerrainY}=await import('/src/surroundings.js');
  const a=lundenViewer,n=a.navigation,dt=1/60;let ticks=0,rescues=0,aloft=0,maxStep=0;
  const realRescue=n.rescue.bind(n);n.rescue=()=>{const p=n.pos.clone();realRescue();if(p.distanceTo(n.pos)>.001)rescues++;};
  const step=()=>{const p=n.pos.clone();n.update(dt);ticks++;maxStep=Math.max(maxStep,p.distanceTo(n.pos));if(n.aloft)aloft++;};
  const leg=(x,z,limit=1800)=>{let i=0;while(Math.hypot(n.pos.x-x,n.pos.z-z)>.2&&i++<limit){a.camera.rotation.y=Math.atan2(-(x-n.pos.x),-(z-n.pos.z));n.keys=new Set(['KeyW']);step();}n.keys.clear();for(let k=0;k<10;k++)step();return{target:[x,z],reached:Math.hypot(n.pos.x-x,n.pos.z-z)<=.2,end:n.pos.toArray(),ticks:i};};
  n.teleport(-250,groundY(-250,30),30);for(let k=0;k<30;k++)step();
  const west=leg(-280,30),terrain=a.scene.getObjectByName('site-terrain');terrain.geometry.computeBoundingBox();const b=terrain.geometry.boundingBox,grid=renderedTerrainY.surfaceGrid();
  const coverage={walk:{...WALK},meshMin:b.min.toArray(),meshMax:b.max.toArray(),grid:[grid.X[0],grid.X.at(-1),grid.Z[0],grid.Z.at(-1)]};
  let samples=0,bad=0;for(const side of ['north','south','west','east']){const vertical=side==='west'||side==='east',lo=vertical?WALK.z0:WALK.x0,hi=vertical?WALK.z1:WALK.x1;for(let q=lo;q<=hi;q+=5){const x=vertical?(side==='west'?WALK.x0:WALK.x1):q,z=vertical?q:(side==='north'?WALK.z0:WALK.z1);samples++;if(!Number.isFinite(renderedTerrainY(x,z))||x<=b.min.x||x>=b.max.x||z<=b.min.z||z>=b.max.z)bad++;}}
  a.camera.rotation.set(-.04,-Math.PI/2,0,'YXZ');a.camera.updateMatrixWorld(true);a.scene.updateMatrixWorld(true);a.renderer.render(a.scene,a.camera);
  window.__westWalk={a,n,leg,step,groundY,getMetrics:()=>({ticks,rescues,aloft,maxStep})};
  return{phase,west,coverage,boundarySamples:samples,badBoundarySamples:bad,metrics:__westWalk.getMetrics(),camera:a.camera.position.toArray()};
 },phase);
 await page.screenshot({path:`${out}/${phase}-west-reached.png`});
 const rest=phase==='before'?null:await page.evaluate(async()=>{
  const {a,n,leg,groundY}=__westWalk,route=[leg(-280,20),leg(-280,40),leg(-250,40),leg(-250,30)],metrics=__westWalk.getMetrics();
  n.teleport(-280,groundY(-280,30),30);const edge=leg(-300,30,900);
  n.teleport(24,groundY(24,0),0);const building=leg(34,0,600);
  n.teleport(-41,groundY(-41,118),118);const water=leg(-41,150,1500);
  const {riverAt}=await import('/src/riverbridge.js'),r=riverAt(n.pos.x,n.pos.z);
  return{route,metrics,edge,building,water,river:{distance:r.distance,width:r.width},sentinels:[localStorage.getItem('lunden.drawing'),localStorage.getItem('lunden.cloud.queue'),sessionStorage.getItem('lunden.session')],keys:Object.keys(localStorage)};
 });
 assert.equal(first.badBoundarySamples,0);assert.ok(first.boundarySamples>400);
 if(phase==='before'){assert.equal(first.west.reached,false);assert.ok(first.west.end[0]>-261&&first.west.end[0]<-259);}
 else{assert.equal(first.west.reached,true);assert.ok(rest.route.every(l=>l.reached));assert.equal(rest.metrics.rescues,0);assert.equal(rest.metrics.aloft,0);assert.ok(rest.metrics.maxStep<.15);assert.ok(rest.edge.end[0]>-285&&rest.edge.end[0]<-284);assert.ok(!rest.building.reached&&rest.building.end[0]<28);assert.ok(!rest.water.reached&&rest.river.distance>=rest.river.width/2+1.5);assert.deepEqual(rest.sentinels,['original-drawing-sentinel','original-queue-sentinel','original-session-sentinel']);assert.deepEqual(rest.keys.sort(),['lunden.cloud.queue','lunden.drawing']);}
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);await writeFile(`${out}/${phase}.json`,JSON.stringify({first,rest,errors,external},null,2));console.log('PASS continuous public west walk, drawn boundary and retained guards',JSON.stringify({first,rest}));
}finally{await browser.close();}
