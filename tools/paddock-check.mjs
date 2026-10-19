import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
// #76 (original #1280/#1295): the pony paddock: one fence mesh, one instanced pony mesh, ponies stay inside, nothing is a target,
// the fence and gate stop a real walk, the stile is walked over, screenshots. node tools/paddock-check.mjs [base-url] [screenshot-dir]
const base=process.argv[2]??'http://localhost:8238',out=process.argv[3]??'artifacts/paddock';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
const errors=[];
try{
 const page=await browser.newPage({viewport:{width:1100,height:700}});
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base);
 await page.waitForFunction(()=>window.lundenViewer?.renderer.info.render.frame>0,null,{timeout:300000});
 await page.evaluate(()=>window.lundenViewer.renderer.setAnimationLoop(null));
 await page.locator('#start').click({timeout:120000});await page.evaluate(()=>document.exitPointerLock?.());
 const res=await page.evaluate(async()=>{
  const T=await import('three'),geo=await import(new URL('/src/paddockgeo.js',location.origin)),{groundY,treeFeet}=await import(new URL('/src/surroundings.js',location.origin)),fw=await import(new URL('/src/farwalk.js',location.origin));
  const {paddock:p,navigation:n,camera,scene,renderer}=window.lundenViewer,dt=1/60,R=[];
  const tris=m=>(m.geometry.index?m.geometry.index.count:m.geometry.attributes.position.count)/3;
  R.push(['one fence mesh and one instanced pony mesh (two ponies)',!!p&&p.mesh.count===2&&p.fence.isMesh,`fence ${tris(p.fence)} tris, pony ${tris(p.mesh)/2}`]);
  R.push(['triangle budgets',tris(p.fence)<12000&&tris(p.mesh)/2<700,'']);
  R.push(['trough, shelter and waypoints',!!p.spots.trough&&!!p.spots.shelter&&p.waypoints.length>50,String(p.waypoints.length)]);
  n.teleport(-108,groundY(-108,238),238);for(let i=0;i<10;i++)n.update(dt);
  let outside=0,minTree=99;
  for(let i=0;i<6000;i++){p.update(0.1);for(const q of p.ponies){if(!geo.insideFence(q.x,q.z,1.0))outside++;for(const t of treeFeet)minTree=Math.min(minTree,Math.hypot(t.x-q.x,t.z-q.z));}}
  R.push(['ponies stay inside the fence for 10 simulated minutes and clear of trunks',outside===0&&minTree>0.9,`outside ${outside}, nearest trunk ${minTree.toFixed(2)}`]);
  // scenery only: no raycast, no interaction members
  const q=p.ponies[0],rc=new T.Raycaster(new T.Vector3(q.x+3,q.y+1,q.z),new T.Vector3(-1,0,0),0,10);
  R.push(['rays pass through ponies and fence; no pat/pick members',rc.intersectObject(p.mesh).length===0&&rc.intersectObject(p.fence).length===0&&!('picks' in p)&&!('pet' in p)&&!('targets' in p),'']);
  // far away: not drawn, not simulated
  n.teleport(-30,0,25);n.update(dt);const before=JSON.stringify(p.ponies.map(a=>[a.x,a.z,a.yaw]));for(let i=0;i<100;i++)p.update(0.1);
  R.push(['not drawn or simulated from the courtyard',!p.mesh.visible&&before===JSON.stringify(p.ponies.map(a=>[a.x,a.z,a.yaw])),'']);
  // walking west into the fence and the gate is stopped
  const walk=(sx,sz,yaw)=>{n.teleport(sx,groundY(sx,sz),sz);for(let i=0;i<20;i++)n.update(dt);n.keys=new Set(['KeyW']);for(let i=0;i<600;i++){camera.rotation.set(0,yaw,0,'YXZ');n.update(dt);}n.keys=new Set();return n.pos.toArray();};
  const A=geo.posts[geo.gateSpan],B=geo.posts[(geo.gateSpan+1)%geo.posts.length],mx=(A[0]+B[0])/2,mz=(A[1]+B[1])/2,l=Math.hypot(B[0]-A[0],B[1]-A[1]);
  let gx=(B[1]-A[1])/l,gz=-(B[0]-A[0])/l;if(!geo.insideFence(mx+gx,mz+gz)){gx=-gx;gz=-gz;} // the gate's inward normal
  const tests=[[mx-gx*3,mz-gz*3,gx,gz],[-110,236,-1,0],[-109,244,-1,0]]; // (the gate, then the east fence)
  const w=tests.map(([x,z,dx,dz])=>{const e=walk(x,z,Math.atan2(-dx,-dz));return [+e[0].toFixed(1),+e[2].toFixed(1),geo.insideFence(e[0],e[2])];});
  R.push(['walking into the gate and the fence is stopped',w.every(([,,inside])=>!inside),JSON.stringify(w)]);
  // the stile: walk in over it, feet reach the platform on the way
  const st=geo.stile;let top=-99,inside=false;
  if(st){const sx=st.x-st.nx*2.2,sz=st.z-st.nz*2.2;n.teleport(sx,groundY(sx,sz),sz);for(let i=0;i<20;i++)n.update(dt);
   n.keys=new Set(['KeyW']);for(let i=0;i<900;i++){camera.rotation.y=Math.atan2(-st.nx,-st.nz);n.update(dt);top=Math.max(top,n.pos.y-groundY(n.pos.x,n.pos.z));}
   n.keys=new Set();inside=geo.insideFence(n.pos.x,n.pos.z);}
  R.push(['stile: a held-W walk climbs over and ends inside the paddock',!!st&&top>0.9&&inside,`top ${top.toFixed(2)} inside ${inside}`]);
  return R;
 });
 for(const [name,ok,info] of res)console.log(ok?'PASS':'FAIL',name,info);
 const shots=[['gate',[-110.5,224,90,-4]],['above',[-100,235,90,-35,40]],['stile',null]];
 for(const [name,v] of shots){
  await page.evaluate(async([v])=>{const geo=await import(new URL('/src/paddockgeo.js',location.origin)),{groundY}=await import(new URL('/src/surroundings.js',location.origin));
   const {paddock:p,navigation:n,camera,renderer,scene}=window.lundenViewer,s=geo.stile;
   const [x,z,yaw,pitch,y]=v??[s.x-s.nx*4,s.z-s.nz*4,Math.atan2(s.nx,s.nz)*180/Math.PI+180,-8];
   n.teleport(x,groundY(x,z),z);for(let i=0;i<10;i++)n.update(1/60);for(let i=0;i<800;i++)p.update(0.1);
   camera.position.set(x,y??groundY(x,z)+1.62,z);camera.rotation.set(pitch*Math.PI/180,yaw*Math.PI/180,0,'YXZ');camera.updateMatrixWorld(true);
   scene.updateMatrixWorld();renderer.render(scene,camera);},[v]);
  await page.screenshot({path:`${out}/${name}.png`});
 }
 assert.deepEqual(errors,[],'no browser errors');
 assert(res.every(r=>r[1]),'all paddock checks pass');
 console.log('PASS: paddock');
}finally{await browser.close();}
