// Public #234: actual passive fittings, collision, ground support and independent public boundaries.
import {chromium} from 'playwright';
import {execFileSync} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const base=process.argv[2]??'http://127.0.0.1:8945',out=process.argv[3]??'artifacts/234',baseline='9e27bbb30ca5422ffe293dcc41b6a22bc5b55bf9';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,args:['--no-sandbox','--enable-unsafe-swiftshader']});
const reports=[];
try{for(const phase of ['before','after']){
 const context=await browser.newContext({viewport:{width:1100,height:700},deviceScaleFactor:1});
 await context.addInitScript(()=>{localStorage.setItem('lunden.drawing','original-drawing-sentinel');localStorage.setItem('lunden.cloud.queue','original-queue-sentinel');sessionStorage.setItem('lunden.session','original-session-sentinel');});
 const page=await context.newPage(),errors=[],external=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(new URL(r.url()).origin!==new URL(base).origin)external.push(r.url());});await page.clock.setFixedTime(new Date('2026-06-15T10:00:00Z'));
 if(phase==='before')await page.route('**/src/**',r=>{const f=new URL(r.request().url()).pathname.slice(1);r.fulfill({contentType:'text/javascript',body:execFileSync('git',['show',`${baseline}:${f}`])});});
 await page.goto(base+'/?cloud=https://ignored.invalid&sync=debug');await page.waitForFunction(()=>window.lundenViewer?.renderer.info.render.frame>0,null,{timeout:180000,polling:100});
 await page.evaluate(()=>{lundenViewer.renderer.setAnimationLoop(null);document.getElementById('start').click();document.exitPointerLock?.();});
 const captures=[];
 for(const[name,pos,look]of [['overview',[-126,12,54],[-143,.8,33]],['ground',[-133,null,23],[-143,1.5,33]]]){
  const r=await page.evaluate(async({pos,look})=>{const a=lundenViewer,S=await import('/src/surroundings.js');document.querySelectorAll('.topbar,.locations,.bottom-bar,#resume,#crosshair').forEach(e=>e.hidden=true);const q=[...pos];if(q[1]===null)q[1]=S.groundY(q[0],q[2])+1.6;a.camera.position.set(...q);a.camera.lookAt(...look);a.camera.updateMatrixWorld(true);a.renderer.render(a.scene,a.camera);return{camera:q,look,calls:a.renderer.info.render.calls,triangles:a.renderer.info.render.triangles};},{pos,look});await page.screenshot({path:`${out}/${phase}-${name}.png`});captures.push({name,...r});
 }
 let component;
 if(phase==='after'){
  component=await page.evaluate(async()=>{
   const a=lundenViewer,T=await import('three'),{OUTDOOR_GYM:C}=await import('/src/config.js'),{gymPoint,gymSegments}=await import('/src/outdoorgym.js'),{renderedTerrainY,walkingGroundY}=await import('/src/surroundings.js'),group=a.scene.getObjectByName('outdoor-gym');
   const checks=[],add=(name,ok,data={})=>checks.push({name,ok,...data});
   add('three fixed visible batches',group.children.length===3&&group.children.every(m=>m.visible));
   const triangles=group.children.reduce((n,m)=>n+m.geometry.attributes.position.count/3,0);add('bounded material/triangle cost',triangles<=2200&&new Set(group.children.map(m=>m.material)).size===3,{triangles});
   add('no picking or interaction targets',group.children.every(m=>!m.userData.door)&&!Object.keys(group.userData).some(k=>/active|target|exercise|repetition/.test(k)));
   const p=group.getObjectByName('gym-wood').geometry.attributes.position;
   for(const f of group.userData.supports){let bottom=Infinity;for(let i=0;i<p.count;i++)if(Math.hypot(p.getX(i)-f.x,p.getZ(i)-f.z)<C.post+.001)bottom=Math.min(bottom,p.getY(i));const ground=renderedTerrainY(f.x,f.z);add(`embedded support ${f.station}`,bottom<ground&&ground-bottom<.2,{bottom,ground});}
   const chip=group.getObjectByName('gym-chips').geometry.attributes.position;let minGap=Infinity;
   for(let i=0;i<chip.count;i+=3){const x=(chip.getX(i)+chip.getX(i+1)+chip.getX(i+2))/3,z=(chip.getZ(i)+chip.getZ(i+1)+chip.getZ(i+2))/3,y=(chip.getY(i)+chip.getY(i+1)+chip.getY(i+2))/3;minGap=Math.min(minGap,y-renderedTerrainY(x,z));}add('chips above actual terrain triangles',minGap>.01,{minGap});
   const n=a.navigation,yaw=C.yaw*Math.PI/180,cos=Math.cos(yaw),sin=Math.sin(yaw);
   for(const[id,x,blocks]of [['press',0,true],['step',4.3,true],['pull-support',-4.3+.85,true],['pull-open',-4.3,false]]){
    const[x0,z0]=gymPoint(x,2.3);n.teleport(x0,walkingGroundY(x0,z0),z0);n.keys.clear();for(let i=0;i<30;i++)n.update(1/60);a.camera.rotation.set(0,yaw,0,'YXZ');n.keys.add('KeyW');for(let i=0;i<120;i++)n.update(1/60);n.keys.clear();const localZ=sin*(n.pos.x-C.at[0])+cos*(n.pos.z-C.at[1]);add(`actual navigation ${id}`,blocks?localZ>.15&&localZ<2:localZ<-.8,{localZ,pos:n.pos.toArray()});
   }
   add('collision registered',gymSegments().length===24);
   return{checks,ok:checks.every(c=>c.ok)};
  });assert(component.ok,JSON.stringify(component));
 }
 const storage=await page.evaluate(()=>({local:Object.fromEntries(Object.entries(localStorage).filter(([k])=>k.startsWith('lunden.'))),session:sessionStorage.getItem('lunden.session')}));assert.deepEqual(storage,{local:{'lunden.drawing':'original-drawing-sentinel','lunden.cloud.queue':'original-queue-sentinel'},session:'original-session-sentinel'});assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
 reports.push({phase,captures,component,storage,errors,external});await context.close();console.log(phase,'PASS');
}}finally{await browser.close();await writeFile(`${out}/result.json`,JSON.stringify({baseline,reports},null,2)+'\n');}
