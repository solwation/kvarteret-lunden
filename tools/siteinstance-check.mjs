import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const base=process.argv[2]??'http://localhost:8169',out=process.argv[3]??'/tmp/public-siteinstances';await mkdir(out,{recursive:true});
const b=await chromium.launch({executablePath:process.env.CHROME_PATH,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const p=await b.newPage({viewport:{width:1280,height:800}}),errors=[],external=[];
 p.on('pageerror',e=>{errors.push(e.message);console.error('PAGEERROR',e.message);});p.on('request',r=>{if(new URL(r.url()).origin!==new URL(base).origin)external.push(r.url());});
 await p.clock.setFixedTime(new Date('2026-10-22T10:00:00Z'));
 await p.goto(base+'/?month=7');await p.waitForFunction(()=>window.lundenViewer?.renderer,null,{timeout:180000});
 await p.evaluate(()=>{const a=lundenViewer;a.renderer.setAnimationLoop(null);document.getElementById('intro').hidden=true;});
 const result={views:[]};
 for(const pose of ['corner','area']){
   await p.evaluate(pose=>{const a=lundenViewer;if(pose==='corner'){a.navigation.teleport(6.5,0,19);a.navigation.update(1/60);a.camera.lookAt(3,.7,17.2);}else{a.moveTo('area');a.navigation.update(1/60);}},pose);
   const view={pose};
   for(const current of [false,true]){
     view[current?'after':'before']=await p.evaluate(current=>{
       const a=lundenViewer,r=a.renderer;a.siteInstances.enabled=current;a.colorFrustum.enabled=current;
       const rb=r.renderBufferDirect,auto=r.info.autoReset;let calls=0,tris=0;
       r.info.autoReset=false;r.renderBufferDirect=function(){const t=r.info.render.triangles,res=rb.apply(this,arguments);if(!r.getRenderTarget()){calls++;tris+=r.info.render.triangles-t;}return res;};
       try{r.render(a.scene,a.camera);}finally{r.renderBufferDirect=rb;r.info.autoReset=auto;}
       return {calls,tris,shadows:r.shadowMap.enabled,sources:a.siteInstances.sources.length};
     },current);
     await p.screenshot({path:`${out}/${pose}-${current?'after':'before'}.png`,timeout:120000});
   }
   assert(view.after.calls<=view.before.calls);assert(view.after.tris<view.before.tris);assert.equal(view.after.shadows,false);result.views.push(view);
 }
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);result.errors=errors;result.external=external;
 await writeFile(`${out}/result.json`,JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
}finally{await b.close();}
