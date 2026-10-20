// #103: generic winter rugs in the actual public World; no original interaction or services.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const base=process.argv[2]??'http://localhost:8243',out=process.argv[3]??'/tmp/public-rugs';await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
const errors=[],external=[];
try {
 const page=await browser.newPage({viewport:{width:1100,height:700}});
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(new URL(r.url()).origin!==new URL(base).origin)external.push(r.url());});
 await page.addInitScript(()=>{localStorage.setItem('lunden.drawing','keep-drawing');localStorage.setItem('lunden.cloud.queue','keep-queue');sessionStorage.setItem('lunden.session','keep-session');});
 await page.goto(base+'/?month=1');await page.waitForFunction(()=>window.lundenViewer?.paddock?.blankets,null,{timeout:300000});
 await page.evaluate(()=>{lundenViewer.renderer.setAnimationLoop(null);document.getElementById('start').click();document.exitPointerLock?.();});
 const result=await page.evaluate(async()=>{
  const a=lundenViewer,p=a.paddock,b=p.blankets,s=p.spots.shelter,{applySeason}=await import('/src/seasons.js'),T=await import('three');
  const R=[],images=[],add=(name,ok,data={})=>R.push({name,ok,data});
  const aim=(x,z,y,target)=>{a.navigation.teleport(x,p.ground(x,z),z);for(let i=0;i<10;i++)a.navigation.update(1/60);a.camera.position.set(x,y,z);a.camera.lookAt(...target);a.camera.updateMatrixWorld(true);p.update(.01);a.scene.updateMatrixWorld(true);};
  const measure=()=>{const r=a.renderer,old=r.renderBufferDirect,auto=r.info.autoReset;let calls=0,triangles=0,rugs=0;r.info.autoReset=false;
   r.renderBufferDirect=function(c,s,g,m,o){const before=r.info.render.triangles,res=old.apply(this,arguments);if(!r.getRenderTarget()){calls++;triangles+=r.info.render.triangles-before;if(o===b)rugs++;}return res;};
   try{r.render(a.scene,a.camera);}finally{r.renderBufferDirect=old;r.info.autoReset=auto;}return{calls,triangles,rugs};};
  const shot=name=>{a.renderer.render(a.scene,a.camera);images.push({name,image:a.renderer.domElement.toDataURL('image/png')});};
  aim(s.x+Math.sin(s.yaw)*8,s.z+Math.cos(s.yaw)*8,p.ground(s.x,s.z)+1.7,[s.x,p.ground(s.x,s.z)+1,s.z]);
  applySeason(7);p.update(.1,true);applySeason(1);p.update(.1,true);p.update(.1);p.write();
  add('two full-size winter occupants wear distinct rugs on the exact body buffer',b.count===2&&b.visible&&b.parent===p.mesh&&b.instanceMatrix===p.mesh.instanceMatrix&&p.ponies.every((q,i)=>!q.gone&&q.scale>.9&&Math.hypot(q.x-p.stable(i).x,q.z-p.stable(i).z)<.1)&&b.instanceColor.array[0]!==b.instanceColor.array[3]);
  b.visible=false;const before=measure();b.visible=true;const after=measure();
  add('actual winter cost is one draw and 140 triangles; no lights/textures/raycast',after.calls-before.calls===1&&after.triangles-before.triangles===140&&after.rugs===1&&!b.material.map&&!b.castShadow&&new T.Raycaster().intersectObject(b).length===0,{before,after});shot('winter-front');
  const geometry=b.geometry,material=b.material;applySeason(7);p.update(.1);
  add('summer submits no rugs and retains the same buffers',!b.visible&&measure().rugs===0&&b.geometry===geometry&&b.material===material);shot('summer-front');
  // Valid field waypoints arrange the starting state; the real winter decision routes them home.
  const starts=p.waypoints.filter(w=>{const d=Math.hypot(w[0]-s.x,w[1]-s.z);return d>12&&d<20;});
  p.ponies.forEach((q,i)=>{const w=starts.find(w=>i===0||Math.hypot(w[0]-p.ponies[0].x,w[1]-p.ponies[0].z)>4);q.x=w[0];q.z=w[1];q.y=p.ground(q.x,q.z);q.state='idle';q.left=0;q.target=q.goal=q.spot=null;});
  applySeason(1);let moved=0,walking=false,amp=0;
  for(let i=0;i<100&&moved<.6;i++){const q=p.ponies[0],x=q.x,z=q.z;p.update(.1);moved+=Math.hypot(q.x-x,q.z-z);walking ||= q.state==='walk';amp=Math.max(amp,q.amp);}
  const q=p.ponies[0],sn=Math.sin(q.yaw),cs=Math.cos(q.yaw);aim(q.x+cs*3.2+sn*.8,q.z-sn*3.2+cs*.8,q.y+1.3,[q.x,q.y+1,q.z]);shot('winter-first-side');
  const q2=p.ponies[1],ss=Math.sin(q2.yaw),cc=Math.cos(q2.yaw);aim(q2.x+cc*1.4+ss*2.4,q2.z-ss*1.4+cc*2.4,q2.y+1.1,[q2.x,q2.y+1,q2.z]);shot('winter-second-side');
  add('real winter walking moves the body and animates the exposed legs',moved>.3&&walking&&amp>.05&&b.instanceMatrix===p.mesh.instanceMatrix,{moved,amp});
  p.update(.1,true);const hidden=measure().rugs;p.update(.1,false);const back=measure().rugs;
  const saved=a.camera.position.clone();a.camera.position.x+=3000;p.update(.1);const far=measure().rugs;a.camera.position.copy(saved);p.update(.1);const returned=measure().rugs;
  applySeason(7);p.update(.1);const summer=measure().rugs;applySeason(1);p.update(.1);
  add('parent/distance/summer culling submits zero; near/winter reuses the same mesh',hidden===0&&far===0&&summer===0&&back===1&&returned===1&&measure().rugs===1&&b.geometry===geometry&&b.material===material,{hidden,far,summer,back,returned});
  add('public scenery retains no interaction or feeding API; original storage untouched',!('pet'in p)&&!('picks'in p)&&!('targets'in p)&&!('feed'in p)&&localStorage.getItem('lunden.drawing')==='keep-drawing'&&localStorage.getItem('lunden.cloud.queue')==='keep-queue'&&sessionStorage.getItem('lunden.session')==='keep-session');
  return{R,images};
 });
 for(const r of result.R)console.log(r.ok?'PASS':'FAIL',r.name,JSON.stringify(r.data));
 for(const i of result.images)await writeFile(`${out}/${i.name}.png`,Buffer.from(i.image.split(',')[1],'base64'));
 assert.deepEqual(errors,[],'no JavaScript errors');assert.deepEqual(external,[],'no external requests');assert(result.R.every(r=>r.ok),'all rug checks pass');console.log('ALL PASS');
}finally{await browser.close();}
