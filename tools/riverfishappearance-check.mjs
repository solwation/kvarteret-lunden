import {chromium} from 'playwright';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const base=process.argv[2]??'http://127.0.0.1:8191',out=process.argv[3]??'docs/verification/267',live=process.argv.includes('--live'),detailOnly=process.argv.includes('--detail-only');
await mkdir(out,{recursive:true});const fixture=JSON.parse(await readFile(new URL('../docs/verification/267/component.json',import.meta.url),'utf8'));
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1800,height:880}}),errors=[],external=[];page.on('pageerror',e=>errors.push(e.message));
 if(!live&&!detailOnly){await page.goto(base+'/tools/riverfishappearance.html');await page.waitForFunction(()=>window.fishAppearance?.ready);for(const mode of ['front','side','quarter']){await page.evaluate(m=>fishAppearance.show(m),mode);await page.screenshot({path:out+'/whole-'+mode+'.png',fullPage:true});}}
 await page.setViewportSize({width:1280,height:800});
 await page.addInitScript(()=>{localStorage.setItem('lunden.drawing','source-sentinel');sessionStorage.setItem('lunden.session','source-session');});
 page.on('request',r=>{if(new URL(r.url()).origin!==new URL(base).origin)external.push(r.url());});
 await page.clock.setFixedTime(new Date(fixture.isoTime));
 await page.goto(base+(live?'':'/dist')+'/?month=6&cloud=https://ignored.invalid&sync=debug');
 await page.waitForFunction(()=>window.lundenViewer?.ambientFish&&lundenViewer.renderer.info.render.frame>0,null,{timeout:180000});
 await page.evaluate(()=>{const a=lundenViewer;a.renderer.setAnimationLoop(null);document.getElementById('start').click();document.exitPointerLock?.();document.querySelectorAll('.topbar,.locations,.bottom-bar,#crosshair').forEach(e=>e.hidden=true);document.getElementById('resume').style.setProperty('display','none','important');});
 const views=[];
 for(const mode of (detailOnly?['detail']:['river','detail'])){
  const result=await page.evaluate(async({fixture,mode})=>{
   const a=lundenViewer,F=a.ambientFish,f=fixture.fixture;
   // The actual published view already contains its production camera, terrain and fish batch.
   // Select a bank-side position from the fixed source fixture's river normal, supplied below.
   const [nx,nz,hw]=fixture.bank,off=hw+(mode==='detail'?.25:2.5);
   const x=fixture.bankCentre[0]+nx*off,z=fixture.bankCentre[1]+nz*off;
   const y=fixture.bankY[mode]+(mode==='detail'?.6:1.4);
   a.camera.position.set(x,y,z);a.camera.lookAt(f.x,f.water,f.z);a.camera.updateMatrixWorld(true);F.update(0,false);
   let target=[f.x,f.water,f.z];
   if(mode==='detail'){
    // Camera-only correction: frame the actual current instance, not an older ring centre.
    const at=F.shown.findIndex(v=>v.id===f.id),m=F.fish.matrixWorld.clone();F.fish.getMatrixAt(at<0?0:at,m);
    target=[m.elements[12],m.elements[13],m.elements[14]];
    a.camera.position.set(target[0]+nx*1.6,target[1]+.9,target[2]+nz*1.6);
    a.camera.lookAt(...target);a.camera.updateMatrixWorld(true);F.update(0,false);
   }
   a.scene.updateMatrixWorld(true);
   const render=()=>{a.renderer.render(a.scene,a.camera);return{calls:a.renderer.info.render.calls,triangles:a.renderer.info.render.triangles};};
   F.hide();const before=render();F.update(0,false);const after=render();
   return{mode,camera:a.camera.position.toArray(),look:target,state:F.state(),geometryTriangles:F.fish.geometry.index.count/3,geometryBounds:{min:F.fish.geometry.boundingBox.min.toArray(),max:F.fish.geometry.boundingBox.max.toArray()},delta:{calls:after.calls-before.calls,triangles:after.triangles-before.triangles},storage:{original:localStorage.getItem('lunden.drawing'),session:sessionStorage.getItem('lunden.session')}};
  },{fixture,mode});
  assert(result.state.drawn>0&&result.state.ringsDrawn>0);assert.equal(result.geometryTriangles,433);assert.equal(result.delta.calls,2);assert.equal(result.delta.triangles,result.state.drawn*433+result.state.ringsDrawn*64);assert.deepEqual(result.storage,{original:'source-sentinel',session:'source-session'});
  if(!live)await page.screenshot({path:out+'/actual-'+mode+'.png'});views.push(result);
 }
 let rising=null;
 if(live){
  await page.clock.setFixedTime(new Date(new Date(fixture.isoTime).getTime()+15150));
  rising=await page.evaluate(()=>{
   const a=lundenViewer,F=a.ambientFish;F.update(0,false);const at=F.shown.findIndex(f=>f.rise>.98);if(at<0)throw Error('expected actual local-clock rise frame');
   const f=F.shown[at];a.camera.position.set(f.x+1.6,f.drawnY+.9,f.z+1.6);a.camera.lookAt(f.x,f.drawnY,f.z);a.camera.updateMatrixWorld(true);F.update(0,false);a.scene.updateMatrixWorld(true);a.renderer.render(a.scene,a.camera);
   const result=F.shown.find(v=>v.id===f.id);return{fish:result,camera:a.camera.position.toArray(),t:F.state().t,rendered:true};
  });assert(rising.fish.rise>.98);
 }
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
 if(detailOnly){const previous=JSON.parse(await readFile(out+'/browser.json','utf8'));views.unshift(previous.views.find(v=>v.mode==='river'));}
 await writeFile(out+(live?'/pages-live.json':'/browser.json'),JSON.stringify({views,rising,errors,external,cameraOnlyDetailRetake:detailOnly,scope:'Actual built public scene, fixed local clock, real fish/ring batches; no service/storage integration'},null,2)+'\n');
 console.log('PASS actual public river/detail: 433 triangles/fish, two batch draws, exact rendered budget, original storage untouched, zero external requests/page errors.');
}finally{await browser.close();}
