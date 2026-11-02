// Public #231: bounded real public scene comparison, isolation and emitted seam checks.
import {chromium} from 'playwright';
import {execFileSync} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const base=process.argv[2]??'http://127.0.0.1:8942',out=process.argv[3]??'artifacts/231',baseline=process.argv[4]??'995ea013c450e567c87b68dfe6f6c14e614105df';
await mkdir(out,{recursive:true});
const b=await chromium.launch({executablePath:process.env.CHROME_PATH,args:['--no-sandbox','--enable-unsafe-swiftshader']});
const reports=[];
try{for(const phase of ['before','after']){
 const c=await b.newContext({viewport:{width:1000,height:620},deviceScaleFactor:1});
 await c.addInitScript(()=>{localStorage.setItem('lunden.drawing','original-drawing-sentinel');localStorage.setItem('lunden.cloud.queue','original-queue-sentinel');sessionStorage.setItem('lunden.session','original-session-sentinel');});
 const p=await c.newPage(),errors=[],external=[];p.on('pageerror',e=>errors.push(e.message));p.on('request',r=>{if(new URL(r.url()).origin!==new URL(base).origin)external.push(r.url());});
 await p.clock.setFixedTime(new Date('2026-06-15T10:00:00Z'));
 if(phase==='before')await p.route('**/src/**',r=>{const file=new URL(r.request().url()).pathname.slice(1);r.fulfill({contentType:'text/javascript',body:execFileSync('git',['show',`${baseline}:${file}`])});});
 await p.goto(base+'/?cloud=https://ignored.invalid&sync=debug');
 await p.waitForFunction(()=>window.lundenViewer?.renderer.info.render.frame>0,null,{timeout:180000,polling:100});
 await p.evaluate(()=>{lundenViewer.renderer.setAnimationLoop(null);document.getElementById('start').click();document.exitPointerLock?.();// Hide only presentation chrome for evidence using the existing public [hidden] rule.
 document.querySelectorAll('.topbar,.locations,.bottom-bar,#resume,#crosshair').forEach(e=>e.hidden=true);});
 const views=[['west-air',[-216,31.6,215],142,-18],['west-ground',[-230,null,258],135,-2],['east-air',[320,31.6,45],-60,-18],['east-ground',[330,null,21],-75,-2]];
 const captures=[];
 for(const[name,pos,yaw,pitch]of views){const state=await p.evaluate(async({pos,yaw,pitch})=>{const a=lundenViewer,S=await import('/src/surroundings.js');document.querySelectorAll('.topbar,.locations,.bottom-bar,#resume,#crosshair').forEach(e=>e.hidden=true);const q=[...pos];if(q[1]===null)q[1]=S.groundY(q[0],q[2])+1.6;a.camera.position.set(...q);a.camera.rotation.set(pitch*Math.PI/180,yaw*Math.PI/180,0,'YXZ');a.camera.updateMatrixWorld(true);a.renderer.render(a.scene,a.camera);return{camera:q,ground:S.groundY(q[0],q[2])};},{pos,yaw,pitch});await p.screenshot({path:`${out}/${phase}-${name}.png`});captures.push({name,...state});}
 let component,actual=[];
 if(phase==='after'){
  component=await p.evaluate(async()=>{await import('/tools/rivercontinuationtest.mjs');return globalThis.riverContinuationResult;});assert(component.ok,JSON.stringify(component));
  actual=await p.evaluate(async()=>{const a=lundenViewer,T=await import('three'),{EDGE_BACKDROP:E}=await import('/src/config.js'),{waterYAt}=await import('/src/riverbridge.js');a.scene.updateMatrixWorld(true);const checks=[];for(const r of E.rivers){const[u,v]=r.path,len=Math.hypot(v[0]-u[0],v[1]-u[1]);for(const d of [.1,1,3,10,25]){let remaining=d,i=1;for(;i<r.path.length-1;i++){const a=r.path[i-1],b=r.path[i],length=Math.hypot(b[0]-a[0],b[1]-a[1]);if(remaining<=length)break;remaining-=length;}const aa=r.path[i-1],bb=r.path[i],length=Math.hypot(bb[0]-aa[0],bb[1]-aa[1]),x=aa[0]+(bb[0]-aa[0])*remaining/length,z=aa[1]+(bb[1]-aa[1])*remaining/length,ray=new T.Raycaster(new T.Vector3(x,30,z),new T.Vector3(0,-1,0));const h=ray.intersectObjects(a.scene.children,true)[0];checks.push({river:r.name,d,mesh:h?.object.name,y:h?.point.y,water:waterYAt(...u),ok:!!h&&Math.abs(h.point.y-waterYAt(...u))<.003});}}return checks;});assert(actual.every(x=>x.ok),JSON.stringify(actual));
 }
 const storage=await p.evaluate(()=>({local:Object.fromEntries(Object.entries(localStorage).filter(([k])=>k.startsWith('lunden.'))),session:sessionStorage.getItem('lunden.session')}));
 assert.deepEqual(storage,{local:{'lunden.drawing':'original-drawing-sentinel','lunden.cloud.queue':'original-queue-sentinel'},session:'original-session-sentinel'});assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
 reports.push({phase,captures,component,actual,storage,errors,external});await c.close();console.log(phase,'PASS');
}}finally{await b.close();await writeFile(`${out}/result.json`,JSON.stringify({baseline,reports},null,2)+'\n');}
