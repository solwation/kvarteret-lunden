// Public #235: actual public river, bounded motion/geometry/isolation checks and owned evidence.
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const base=process.argv[2]??'http://127.0.0.1:8910',out=process.argv[3]??'docs/verification/235';
await mkdir(out,{recursive:true});const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,args:['--no-sandbox','--enable-unsafe-swiftshader','--use-angle=swiftshader']});
try{
 const c=await browser.newContext({viewport:{width:1100,height:720},deviceScaleFactor:1});
 await c.addInitScript(()=>{localStorage.setItem('lunden.drawing','original-sentinel');sessionStorage.setItem('lunden.session','original-session-sentinel');});
 const p=await c.newPage(),errors=[],external=[];p.on('pageerror',e=>errors.push(e.message));p.on('request',r=>{if(new URL(r.url()).origin!==new URL(base).origin)external.push(r.url());});
 await p.clock.setFixedTime(new Date('2026-06-15T10:00:00Z'));
 await p.goto(base+'/?cloud=https://ignored.invalid&sync=debug');await p.waitForFunction(()=>window.lundenViewer?.renderer.info.render.frame>0,null,{timeout:180000,polling:100});console.log('PASS actual public World ready');
 await p.evaluate(()=>{const a=lundenViewer;a.renderer.setAnimationLoop(null);document.getElementById('start').click();document.exitPointerLock?.();document.querySelectorAll('.topbar,.locations,.bottom-bar,#resume,#crosshair').forEach(e=>e.hidden=true);});
 await p.waitForTimeout(100); // let the pointer-lock release handler update presentation first
 await p.evaluate(()=>document.getElementById('resume').hidden=true);
 const initial=await p.evaluate(async()=>{const a=lundenViewer,{riverAt,waterYAt}=await import('/src/riverbridge.js'),{renderedTerrainY}=await import('/src/surroundings.js'),{DUCKS}=await import('/src/config.js'),r=riverAt(...DUCKS.habitat.at);window.duckView=(x,z)=>{a.navigation.teleport(x,renderedTerrainY(x,z),z);a.camera.lookAt(r.x,waterYAt(r.x,r.z)+.4,r.z);a.camera.updateMatrixWorld(true);a.ducks.update(0,false);a.scene.updateMatrixWorld(true);a.renderer.render(a.scene,a.camera);};duckView(r.x,r.z-13);
  const animals=a.ducks.animals;let lights=0;a.scene.traverse(o=>{if(o.isLight)lights++;});
  return{r,camera:a.camera.position.toArray(),count:animals.length,geometries:new Set(animals.map(v=>v.mesh.geometry)).size,materials:new Set(animals.map(v=>v.mesh.material)).size,triangles:animals.reduce((n,v)=>n+v.mesh.geometry.index.count/3,0),shadows:animals.some(v=>v.mesh.castShadow||v.mesh.receiveShadow),interactive:animals.some(v=>v.mesh.userData.door)||typeof a.ducks.targets!=='undefined',lights,positions:animals.map(v=>[v.brain.x,v.brain.y,v.brain.z])};});
 assert.equal(initial.count,4);assert.equal(initial.geometries,1);assert.equal(initial.materials,1);assert.equal(initial.shadows,false);assert.equal(initial.interactive,false);
 await p.screenshot({path:`${out}/river-flock.png`});
 const motion=await p.evaluate(()=>{const a=lundenViewer,d=a.ducks,seen=new Set();let bad=0,maxStep=0;const initial=d.animals.map(v=>[v.brain.x,v.brain.y,v.brain.z]);
  for(let j=0;j<3000;j++)for(const {brain:b} of d.animals){const x=b.x,y=b.y,z=b.z;b.update(.1);const h=d.habitat.surface(b.x,b.z);if(!d.habitat.contains(b.x,b.z)||Math.abs(b.y-h.y)>1e-8||![b.x,b.y,b.z].every(Number.isFinite))bad++;maxStep=Math.max(maxStep,Math.hypot(b.x-x,b.y-y,b.z-z));seen.add(b.swimming?'water':'bank');}
  d.update(0,false);return{seconds:300,bad,maxStep,surfaces:[...seen].sort(),initial,final:d.animals.map(v=>[v.brain.x,v.brain.y,v.brain.z])};});assert.equal(motion.bad,0);assert(motion.maxStep<=.085001);assert.deepEqual(motion.surfaces,['bank','water']);assert.notDeepEqual(motion.final,motion.initial);
 const budget=await p.evaluate(()=>{const a=lundenViewer;window.duckView(-160,196.7);a.renderer.info.reset();a.renderer.render(a.scene,a.camera);const shown={...a.renderer.info.render};a.ducks.animals.forEach(v=>v.mesh.visible=false);a.renderer.info.reset();a.renderer.render(a.scene,a.camera);const hidden={...a.renderer.info.render};a.ducks.update(0,false);a.renderer.render(a.scene,a.camera);return{shown,hidden,deltaCalls:shown.calls-hidden.calls,deltaTriangles:shown.triangles-hidden.triangles};});assert.equal(budget.deltaCalls,4);assert.equal(budget.deltaTriangles,initial.triangles);
 const closeCamera=await p.evaluate(async()=>{
  const a=lundenViewer,T=await import('three'),S=await import('/src/surroundings.js'),{waterYAt}=await import('/src/riverbridge.js');
  const swimmers=a.ducks.animals.filter(v=>v.brain.swimming),target=new T.Vector3();for(const v of swimmers)target.add(v.mesh.position);target.multiplyScalar(1/swimmers.length);target.y+=.4;
  let best=null;const candidates=[];
  for(const x of [-166,-165,-164,-162,-161,-160])for(const z of [200,201,201.5]){
   const g=S.renderedTerrainY(x,z);if(g<waterYAt(x,z)+.1)continue;
   a.camera.position.set(x,g+1.6,z);a.camera.lookAt(target);a.camera.updateMatrixWorld(true);let visible=0;
   for(const v of swimmers){const p=v.mesh.position.clone();p.y+=.4;const clip=p.clone().project(a.camera);if(Math.abs(clip.x)>.85||Math.abs(clip.y)>.85)continue;
    const dir=p.clone().sub(a.camera.position),distance=dir.length(),ray=new T.Raycaster(a.camera.position,dir.normalize(),0,distance+.5),hit=ray.intersectObjects(a.scene.children,true).find(h=>h.object.isMesh&&h.object.visible);
    if(hit?.object===v.mesh)visible++;
   }
   const c={position:a.camera.position.toArray(),target:target.toArray(),visible};candidates.push(c);if(!best||visible>best.visible)best=c;
  }
  if(!best||best.visible<Math.min(2,swimmers.length))throw new Error('No clear bank camera for swimming ducks: '+JSON.stringify(candidates));
  a.camera.position.fromArray(best.position);a.camera.lookAt(target);a.camera.updateMatrixWorld(true);a.renderer.render(a.scene,a.camera);return {...best,candidates};
 });
 await p.evaluate(()=>document.getElementById('resume').hidden=true);
 await p.screenshot({path:`${out}/river-after-motion.png`});
 const culling=await p.evaluate(()=>{const a=lundenViewer,d=a.ducks;a.camera.position.set(0,2,0);const before=d.animals.map(v=>[v.brain.x,v.brain.z]);d.update(1,false);const far=d.animals.every(v=>!v.mesh.visible),frozen=JSON.stringify(before)===JSON.stringify(d.animals.map(v=>[v.brain.x,v.brain.z]));window.duckView(-160,196.7);d.update(.1,true);return{far,frozen,hidden:d.animals.every(v=>!v.mesh.visible)};});assert.deepEqual(culling,{far:true,frozen:true,hidden:true});
 const storage=await p.evaluate(()=>({local:Object.fromEntries(Object.entries(localStorage).filter(([k])=>k.startsWith('lunden.'))),session:sessionStorage.getItem('lunden.session')}));assert.deepEqual(storage,{local:{'lunden.drawing':'original-sentinel'},session:'original-session-sentinel'});assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
 const result={initial,motion,budget,closeCamera,culling,storage,errors,external,scope:'Actual public source app, desktop Chromium SwiftShader. Controlled river-view spawns and 300s brain steps; no full walk, physical phone or performance/FPS claim.'};await writeFile(`${out}/browser.json`,JSON.stringify(result,null,2)+'\n');console.log('PASS actual habitat/contact/motion; four shared meshes; exact budget delta',budget.deltaCalls,budget.deltaTriangles,'no targets/services/storage changes');
}finally{await browser.close();}
