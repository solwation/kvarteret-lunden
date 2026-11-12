// #271: one real public app; matched old/new geometry, actual target pixels and local gates.
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
const base=process.argv[2]??'http://127.0.0.1:8304',out=process.argv[3]??'docs/verification/271';
await mkdir(out,{recursive:true});
const baseline='11d67b945daccf36f90e27cd4420b19b2ec1903f';
const old=execFileSync('git',['show',`${baseline}:src/squirrelmodel.js`],{encoding:'utf8'});
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,args:['--no-sandbox','--enable-unsafe-swiftshader','--use-angle=swiftshader']});
try {
 const c=await browser.newContext({viewport:{width:1100,height:720},deviceScaleFactor:1});
 await c.addInitScript(()=>{
  localStorage.setItem('lunden.drawing','original-sentinel');sessionStorage.setItem('lunden.session','original-session-sentinel');
  let seed=271;Math.random=()=>((seed=seed*16807%2147483647)/2147483647);
  window.originalStorageAccess=[];
  for(const name of ['getItem','setItem','removeItem']){const fn=Storage.prototype[name];Storage.prototype[name]=function(key,...args){if(String(key).startsWith('lunden.'))window.originalStorageAccess.push([name,key]);return fn.call(this,key,...args);};}
 });
 await c.route('**/src/squirrelmodel-before271.js',r=>r.fulfill({contentType:'text/javascript',body:old}));
 const p=await c.newPage(),errors=[],external=[],websockets=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('request',r=>{if(new URL(r.url()).origin!==new URL(base).origin)external.push(r.url());});p.on('websocket',s=>websockets.push(s.url()));
 await p.clock.setFixedTime(new Date('2026-06-15T10:00:00Z'));
 await p.goto(base+'/?month=6&cloud=https://ignored.invalid&sync=debug');
 await p.waitForFunction(()=>window.lundenViewer?.renderer.info.render.frame>0,null,{timeout:180000,polling:100});
 await p.evaluate(async()=>{
  const a=lundenViewer;a.renderer.setAnimationLoop(null);document.getElementById('start').click();document.exitPointerLock?.();
  document.querySelectorAll('.topbar,.locations,.bottom-bar,#resume,#crosshair').forEach(e=>e.hidden=true);
  const old=await import('/src/squirrelmodel-before271.js');window.before271=a.squirrels.animals.map(v=>[old.squirrelGeometry(v.spec),old.squirrelGeometry(v.spec,true)]);
 });
 await p.waitForTimeout(100);await p.evaluate(()=>document.querySelectorAll('.topbar,.locations,.bottom-bar,#resume,#crosshair').forEach(e=>e.style.setProperty('display','none','important')));
 console.log('PASS actual public app and frozen old geometry loaded');
 const views=[];
 for(const [name,index,wanted] of [['river',0,'search'],['paddock',2,'search'],['trunk',0,'up']]) {
  const natural=await p.evaluate(async({index,wanted})=>{
   const a=lundenViewer,s=a.squirrels,T=await import('three'),S=await import('/src/surroundings.js'),{squirrelLand}=await import('/src/squirrelhabitat.js'),v=s.animals[index],b=v.brain,states=new Set();
   let n=0;for(;n<12000;n++){b.update(.05);states.add(b.state);if(b.state===wanted&&b.t>.15&&(wanted==='search'||b.t/b.dur>.3&&b.t/b.dur<.7))break;}if(n===12000)throw Error('No natural ground pause');
   a.camera.position.set(b.x,b.y+1.6,b.z+2);s.update(0);a.scene.updateMatrixWorld(true);const target=v.body.localToWorld(new T.Vector3(0,.14,0));
   let chosen=null;for(const dist of [2.4,3.2]){for(let i=0;i<12;i++){const angle=i*Math.PI/6,x=b.x+Math.cos(angle)*dist,z=b.z+Math.sin(angle)*dist;if(!squirrelLand(S.renderedTerrainY,x,z))continue;
    const from=new T.Vector3(x,S.renderedTerrainY(x,z)+1.6,z),dir=target.clone().sub(from),ray=new T.Raycaster(from,dir.clone().normalize(),0,dir.length()+.2);
    if(!ray.intersectObjects(a.scene.children,true).some(h=>h.object.isMesh&&h.object.visible&&h.distance<dir.length()-.12)){chosen=from;break;}
   }if(chosen)break;}if(!chosen)throw Error('No clear nearby camera');
   a.navigation.teleport(chosen.x,chosen.y-1.6,chosen.z);a.camera.lookAt(target);s.update(0);
   return{index,seconds:n*.05,states:[...states],state:b.state,brain:[b.x,b.y,b.z],position:chosen.toArray(),target:target.toArray()};
  },{index,wanted});
  for(const phase of ['before','after']) {
   const evidence=await p.evaluate(async({index,phase})=>{
    const a=lundenViewer,s=a.squirrels,v=s.animals[index],T=await import('three'),r=a.renderer;
    for(let i=0;i<s.animals.length;i++)s.animals[i].body.geometry=phase==='before'?before271[i][0]:s.animals[i].geos[0];
    a.scene.updateMatrixWorld(true);a.camera.updateMatrixWorld(true);
    const finite=x=>x.every(Number.isFinite),projection=[];const q=new T.Vector3();let inside=0;
    for(const m of [v.body.matrixWorld,a.camera.matrixWorld,a.camera.matrixWorldInverse,a.camera.projectionMatrix])if(!finite(m.elements))throw Error('Nonfinite model/camera');
    for(let i=0;i<v.body.geometry.attributes.position.count;i++){v.body.getVertexPosition(i,q);q.applyMatrix4(v.body.matrixWorld).project(a.camera);if(!finite(q.toArray()))throw Error('Nonfinite projection');projection.push(q.toArray());if(Math.abs(q.x)<=1&&Math.abs(q.y)<=1&&Math.abs(q.z)<=1)inside++;}
    if(inside!==projection.length)throw Error('Incomplete intended body projection');
    let effective=true;for(let o=v.body;o;o=o.parent)effective&&=o.visible;if(!effective)throw Error('Hidden target ancestor');
    const target=new T.WebGLRenderTarget(1100,720),was=r.getRenderTarget(),pixels=new Uint8Array(1100*720*4),hidden=new Uint8Array(pixels.length);
    let shown,absent;try{r.setRenderTarget(target);r.info.reset();r.render(a.scene,a.camera);shown={...r.info.render};r.readRenderTargetPixels(target,0,0,1100,720,pixels);v.body.visible=false;r.info.reset();r.render(a.scene,a.camera);absent={...r.info.render};r.readRenderTargetPixels(target,0,0,1100,720,hidden);}finally{v.body.visible=true;r.setRenderTarget(was);target.dispose();}
    let intendedPixels=0;for(let i=0;i<pixels.length;i+=4)if(Math.abs(pixels[i]-hidden[i])+Math.abs(pixels[i+1]-hidden[i+1])+Math.abs(pixels[i+2]-hidden[i+2])>3)intendedPixels++;
    if(intendedPixels<20||shown.calls-absent.calls!==1)throw Error(`Unproved target: ${intendedPixels} pixels, ${shown.calls-absent.calls} draws`);
    r.render(a.scene,a.camera);
    return{phase,index,intendedPixels,deltaCalls:shown.calls-absent.calls,deltaTriangles:shown.triangles-absent.triangles,vertexCount:projection.length,allProjected:true,model:v.body.matrixWorld.toArray(),camera:a.camera.matrixWorld.toArray(),projection:a.camera.projectionMatrix.toArray(),morphs:[...v.body.morphTargetInfluences]};
   },{index,phase});
   await p.screenshot({path:`${out}/${phase}-${name}-normal.png`});views.push({name,natural,...evidence});console.log('PASS',phase,name,evidence.intendedPixels,evidence.deltaTriangles);
  }
 }
 // Complete front/side/quarter diagnostics use the actual app's body/material, in a
 // separate neutral scene. These are explicitly not a replacement for the real app views.
 const diagnostics=[];
 for(const view of ['quarter','front','side'])for(const phase of ['before','after']) {
  const record=await p.evaluate(async({view,phase})=>{
   const a=lundenViewer,T=await import('three'),v=a.squirrels.animals[0],r=a.renderer,scene=new T.Scene();scene.background=new T.Color(0xdbe4e8);
   scene.add(new T.HemisphereLight(0xffffff,0x888888,2.5));const light=new T.DirectionalLight(0xffffff,2.5);light.position.set(2,3,4);scene.add(light);
   const body=new T.Mesh(phase==='before'?before271[0][0]:v.geos[0],v.body.material);scene.add(body);body.morphTargetInfluences.fill(0);
   const camera=new T.PerspectiveCamera(35,1100/720,.01,10),target=new T.Vector3(0,.18,0),offset={quarter:[.7,.35,1],front:[0,.15,1],side:[1,.15,0]}[view];camera.position.copy(target).add(new T.Vector3(...offset).normalize().multiplyScalar(1.05));camera.lookAt(target);camera.updateMatrixWorld();scene.updateMatrixWorld(true);
   const q=new T.Vector3();for(let i=0;i<body.geometry.attributes.position.count;i++){body.getVertexPosition(i,q);q.project(camera);if(!q.toArray().every(Number.isFinite)||Math.abs(q.x)>=1||Math.abs(q.y)>=1||Math.abs(q.z)>=1)throw Error('Clipped diagnostic');}
   r.render(scene,camera);return{view,phase,triangles:body.geometry.index.count/3,camera:camera.matrixWorld.toArray(),projection:camera.projectionMatrix.toArray(),model:body.matrixWorld.toArray()};
  },{view,phase});diagnostics.push(record);await p.screenshot({path:`${out}/${phase}-whole-${view}.png`});
 }
 const gates=await p.evaluate(async()=>{
  const a=lundenViewer,s=a.squirrels,{applySeason}=await import('/src/seasons.js'),clock=()=>s.animals.map(v=>v.brain.clock),same=b=>JSON.stringify(b)===JSON.stringify(clock());
  const b=clock();s.update(1,true);const hidden=s.animals.every(v=>!v.group.visible)&&same(b);a.camera.position.set(1500,2,1500);s.update(1);const far=s.animals.every(v=>!v.group.visible)&&same(b);
  applySeason(12);s.update(1);const winter=s.animals.every(v=>!v.group.visible)&&same(b);applySeason(6);
  const v=s.animals[0];a.camera.position.set(v.brain.x+16,v.brain.y+1.6,v.brain.z);s.update(0);const farLod=v.body.geometry===v.geos[1];a.camera.position.set(v.brain.x+2,v.brain.y+1.6,v.brain.z);s.update(0);const nearLod=v.body.geometry===v.geos[0];
  const keys=()=>Object.fromEntries(Object.entries(localStorage).filter(([k])=>k.startsWith('lunden.')));
  return{hidden,far,winter,resumed:!s.winter,nearLod,farLod,animals:s.animals.length,oneBody:s.animals.every(v=>v.group.children.length===1),targets:typeof s.targets,lights:(()=>{let n=0;a.scene.traverse(o=>{if(o.isLight)n++;});return n;})(),access:originalStorageAccess,originalLocal:keys(),originalSession:sessionStorage['lunden.session']};
 });
 for(const k of ['hidden','far','winter','resumed','nearLod','farLod','oneBody'])assert.equal(gates[k],true,k);assert.equal(gates.animals,4);assert.equal(gates.targets,'undefined');assert.deepEqual(gates.access,[]);assert.deepEqual(gates.originalLocal,{'lunden.drawing':'original-sentinel'});assert.equal(gates.originalSession,'original-session-sentinel');
 for(const name of ['river','paddock','trunk']){const pair=views.filter(v=>v.name===name);for(const key of ['model','camera','projection','morphs'])assert.deepEqual(pair[0][key],pair[1][key],`${name} matched ${key}`);}
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);assert.deepEqual(websockets,[]);
 await writeFile(`${out}/browser.json`,JSON.stringify({baseline,views,diagnostics,gates,errors,external,websockets,limits:'One actual public source app, Chromium SwiftShader desktop; naturally reached ground pauses, controlled visitor cameras. Separate neutral whole-form diagnostics. No FPS/mobile/continuous walk claim; old comparison copies are not production retained resources.'},null,2)+'\n');
 console.log('PASS full projection, actual pixels, matched poses, LOD/winter/hidden/far and isolation');
 await p.evaluate(()=>{for(const g of new Set(before271.flat()))g.dispose();});await c.close();
}finally{await browser.close();}
