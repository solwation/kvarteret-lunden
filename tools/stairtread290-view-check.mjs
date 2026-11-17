// #290: real public world, walk up Hus A/B/C's stair with Navigation.update; feet = tread top, eye trace, screenshot. Usage: node tools/stairtread290-view-check.mjs BASE OUT
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const base=process.argv[2]??'http://localhost:8634',out=process.argv[3]??'docs/verification/290';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,args:['--no-sandbox','--enable-unsafe-swiftshader']});
try{
 const page=await (await browser.newContext({viewport:{width:1100,height:700}})).newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/',{waitUntil:'domcontentloaded',timeout:120000});
 await page.waitForFunction(()=>window.lundenViewer?.renderer.info.render.frame>0,null,{timeout:420000});
 await page.evaluate(()=>{lundenViewer.renderer.setAnimationLoop(null);document.getElementById('start').click();document.exitPointerLock?.();document.querySelectorAll('header,nav,[class*=topbar],[class*=locations],[class*=bottom],[class*=hint],[class*=toast],dialog,[id=start],button').forEach(e=>e.style.display='none');});
 const result={};
 for(const name of [0,1,2]){
  result['ABC'[name]]=await page.evaluate(async(name)=>{
   const a=lundenViewer,h=a.world.coreHouses[name],C={...h.C,stops:h.Y},n=a.navigation,ST=C.stair,B=C.band,[W0]=ST.well,RISE=(C.stops[1]-C.stops[0])/ST.risers;
   const k=C.lane?1:0,x=(B.x0+W0)/2,z0=ST.top+0.1;
   n.teleport(x,C.stops[k],z0);a.camera.rotation.set(0,Math.PI,0);n.keys=new Set(['KeyW']);
   const dt=1/60;let prevEye=n.eyeY,maxEye=0,maxFeetErr=0,samples=0,minZ=z0;
   for(let i=0;i<400&&n.pos.z<ST.run-0.3;i++){n.update(dt);maxEye=Math.max(maxEye,Math.abs(n.eyeY-prevEye));prevEye=n.eyeY;
    if(n.pos.z<ST.top+4*ST.tread-0.02&&n.pos.z>z0+0.02){const s=(n.pos.z-ST.top)/ST.tread,top=C.stops[k]+RISE*(Math.floor(s)+1);maxFeetErr=Math.max(maxFeetErr,Math.abs(n.pos.y-top));samples++;}}
   const end={z:n.pos.z,y:n.pos.y,climbed:n.pos.y-C.stops[k]};
   n.keys=new Set();
   // screenshot: eye view on the west flight, a few treads up
   n.teleport(x,C.stops[k],ST.top+0.05);n.update(0.016);
   a.camera.position.set(x,n.pos.y+1.62,ST.top+0.05);a.camera.rotation.set(-0.35,Math.PI,0);a.camera.updateMatrixWorld(true);for(let i=0;i<3;i++)a.world.core.update(0.016,n,a.camera);a.renderer.render(a.scene,a.camera);
   return{samples,maxFeetErrM:maxFeetErr,maxEyeFrameM:maxEye,end,riseM:RISE};
  },name);
  await page.screenshot({path:`${out}/stair-house-${'ABC'[name]}.png`});
 }
 assert.deepEqual(errors,[]);
 for(const r of Object.values(result)){assert(r.samples>20,'walked on the straight treads');assert(r.maxFeetErrM<0.01,'feet = tread top');assert(r.end.climbed>0.5,'climbed');}
 await writeFile(out+'/browser.json',JSON.stringify({ok:true,result,errors},null,2));console.log(JSON.stringify(result));
}finally{await browser.close();}
