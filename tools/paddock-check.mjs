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
  {const sh=await import(new URL('/src/paddockshelter.js',location.origin)),{PADDOCK:PD}=await import(new URL('/src/config.js',location.origin)),sp=p.spots.shelter,T=p.spots.trough;
   const f=sh.footprintGround(p.ground,sp.x,sp.z,sp.yaw),tg=[-1,0,1].flatMap(i=>[-1,0,1].map(j=>p.ground(T.x+i*0.9,T.z+j*0.3))),gd=Math.hypot(sp.x-p.gate.x,sp.z-p.gate.z);
   R.push(['#80 (original #1335/#1336): the shelter stands on flat ground well inside the fence and in view of the gate',f.relief<=PD.shelter.maxRelief&&geo.insideFence(sp.x,sp.z,PD.shelter.edge)&&gd>8&&gd<45,JSON.stringify({relief:f.relief,gd})]);
   R.push(['the trough stands on flat ground',Math.max(...tg)-Math.min(...tg)<0.3,(Math.max(...tg)-Math.min(...tg)).toFixed(2)]);}
  n.teleport(-108,groundY(-108,238),238);for(let i=0;i<10;i++)n.update(dt);
  let outside=0,minTree=99;
  for(let i=0;i<6000;i++){p.update(0.1);for(const q of p.ponies){if(!geo.insideFence(q.x,q.z,1.0))outside++;for(const t of treeFeet)minTree=Math.min(minTree,Math.hypot(t.x-q.x,t.z-q.z));}}
  R.push(['ponies stay inside the fence for 10 simulated minutes and clear of trunks',outside===0&&minTree>0.9,`outside ${outside}, nearest trunk ${minTree.toFixed(2)}`]);
 // grazing (#78, original #1315): one instanced grass mesh, one draw call, a patchy mask, a grazing pony crops the grass at its muzzle, regrowth, snow hides it
  {const g=p.grass,tr=g.count*g.geometry.attributes.position.count/3;
   R.push(['grass: one instanced mesh within budget',g.isInstancedMesh&&g.count>500&&tr<50000,`${g.count} tufts, ${tr} tris`]);
   const st=()=>{const m=p.gm;let n=0,lo=0,hi=0;for(let j=0;j<m.H;j++)for(let i=0;i<m.W;i++){if(!p.inside(m.x0+(i+0.5)*1.5,m.z0+(j+0.5)*1.5))continue;const v=m.v[j*m.W+i];n++;if(v<0.3)lo++;if(v>0.8)hi++;}return {lo:lo/n,hi:hi/n};};
   const s0=st();R.push(['grass mask starts patchy',s0.lo>0.02&&s0.hi>0.4,JSON.stringify(s0)]);
   n.teleport(-105,groundY(-105,232),232);for(let i=0;i<5;i++){n.update(dt);p.update(0.1);}
   let calls=0;const rb=renderer.renderBufferDirect;renderer.renderBufferDirect=function(c,s,gg,m,o){if(o===p.grass)calls++;return rb.apply(this,arguments);};scene.updateMatrixWorld();renderer.render(scene,camera);renderer.renderBufferDirect=rb;
   R.push(['grass: one draw call',calls===1&&p.grass.visible,String(calls)]);
   const z=p.ponies[0];let best=null;for(const w of p.waypoints)if(p.grassAt(w[0],w[1])>0.95&&(!best||Math.hypot(w[0]+105,w[1]-232)<Math.hypot(best[0]+105,best[1]-232)))best=w;
   z.x=best[0];z.z=best[1];z.yaw=1.57;z.state='graze';z.left=1e6;z.target=null;z.goal=null;
   const mz=()=>p.grassAt(z.x+Math.sin(z.yaw)*1.15,z.z+Math.cos(z.yaw)*1.15),b4=mz();for(let i=0;i<200;i++)p.update(0.1);
   R.push(['grazing pony crops the grass at its muzzle',b4>0.9&&mz()<0.4&&z.neck>1.1,`${b4.toFixed(2)} -> ${mz().toFixed(2)}`]);
   n.teleport(-40,groundY(-40,232),232);n.update(dt);for(const q of p.ponies){q.state='idle';q.left=0;}const states=new Set();for(let i=0;i<6000;i++){p.update(0.1);if(i%50===0)p.ponies.forEach(q=>states.add(q.state));}
   const s1=st();R.push(['after ten minutes still patchy; ponies graze and walk',s1.lo>0.003&&s1.hi>0.3&&states.has('graze')&&states.has('walk'),JSON.stringify({s1,states:[...states]})]);
   const m=()=>{let t=0;for(const v of p.gm.v)t+=v;return t/p.gm.v.length;},m0=m();for(const q of p.ponies){q.state='idle';q.left=1e9;}for(let i=0;i<3000;i++)p.update(0.1);
   R.push(['the grass regrows slowly',m()>m0,`${m0.toFixed(3)} -> ${m().toFixed(3)}`]);
   {// #84 (original #1342): 72 h of real time regrow a fully grazed meadow (simulated clock), the saved mask is caught up on load, storage failures are harmless
    const mean=()=>{let t=0;for(const v of p.gm.v)t+=v;return t/p.gm.v.length;},keep=p.gm.v.slice(),real=p.gm.real,now=Date.now,LS=Object.getOwnPropertyDescriptor(window,'localStorage');
    p.gm.v.fill(0.05);const b=mean();p.gm.real-=72*3600e3;for(let i=0;i<15;i++)p.update(0.1);const a72=mean();
    R.push(['a fully grazed meadow is long again after 72 h of real time',b<0.06&&a72>0.99,`${b.toFixed(3)} -> ${a72.toFixed(3)}`]);
    p.gm.v.fill(0.05);p.gm.real=Date.now();p.gm.saved=0;p.saveGrass();p.gm.v.fill(1);
    const t0=Date.now();Date.now=()=>t0+36*3600e3;const ok=p.loadGrass(),half=mean();Date.now=now;
    R.push(['the saved mask is caught up by the time away (36 h = half regrown)',ok&&half>0.5&&half<0.56,half.toFixed(3)]);
    Object.defineProperty(window,'localStorage',{configurable:true,get(){throw new Error('blocked');}});
    let thrown=false;try{p.saveGrass();thrown=p.loadGrass();}catch{thrown=true;}
    if(LS)Object.defineProperty(window,'localStorage',LS);else delete window.localStorage;
    R.push(['blocked localStorage neither throws nor loads a mask',thrown===false,String(thrown)]);
    localStorage.removeItem('kvarteret-lunden.paddockGrass');p.gm.v.set(keep);p.gm.real=real;}
   p.snowy=true;p.update(0.1);const hid=!p.grass.visible;p.snowy=false;p.update(0.1);
   R.push(['snow months hide the tufts',hid&&p.grass.visible,'']);
   for(const q of p.ponies){q.state='idle';q.left=0;}}
  // shade trees, shelter in rain and the snow months (#79, original #1316)
  {const {PADDOCK}=await import(new URL('/src/config.js',location.origin)),{riverAt}=await import(new URL('/src/riverbridge.js',location.origin)),{applySeason}=await import(new URL('/src/seasons.js',location.origin));
   const tr=PADDOCK.trees.map(([x,z])=>({n:treeFeet.filter(t=>Math.hypot(t.x-x,t.z-z)<0.01&&t.kind==='big').length,river:riverAt(x,z).distance-riverAt(x,z).width/2}));
   R.push(['shade trees are big trees in treeFeet, well away from the river',tr.length>=2&&tr.every(t=>t.n===1&&t.river>15),JSON.stringify(tr.map(t=>t.river.toFixed(0)))]);
   {const [tx,tz]=PADDOCK.trees[0],sz=tz+6;n.teleport(tx,groundY(tx,sz),sz);for(let i=0;i<20;i++)n.update(dt);n.keys=new Set(['KeyW']);for(let i=0;i<600;i++){camera.rotation.set(0,0,0,'YXZ');n.update(dt);}n.keys=new Set();
    const d=Math.hypot(n.pos.x-tx,n.pos.z-tz);R.push(['walking into a shade trunk is stopped by it',d>0.5&&d<4,d.toFixed(2)]);}
   n.teleport(-108,groundY(-108,238),238);for(let i=0;i<10;i++)n.update(dt);
   applySeason(7);p.update(0.1,false,0);
   const near=q=>p.shelterPlaces.some(s=>Math.hypot(s.x-q.x,s.z-q.z)<1.2);
   for(let i=0;i<200;i++)p.update(0.1,false,0);const dryUnder=p.ponies.filter(near).length;
   let outside=0;for(let i=0;i<1500;i++){p.update(0.1,false,0.8);for(const q of p.ponies)if(!geo.insideFence(q.x,q.z,1.0))outside++;}
   const under=p.ponies.filter(near).length,seekers=p.ponies.filter(q=>q.seek).length,kinds=p.ponies.map(q=>p.shelterPlaces.find(s=>Math.hypot(s.x-q.x,s.z-q.z)<1.2)?.kind??null);
   const apart=Math.hypot(p.ponies[0].x-p.ponies[1].x,p.ponies[0].z-p.ponies[1].z),pos=p.ponies.map(q=>[q.x,q.z]);
   for(let i=0;i<100;i++)p.update(0.1,false,0.8);
   const stay=p.ponies.every((q,i)=>Math.hypot(q.x-pos[i][0],q.z-pos[i][1])<1.5||!q.seek);
   R.push(['dry weather: nobody is under cover',dryUnder===0,'']);
   R.push(['rain: seeking ponies stand under the shed or a tree, apart, inside the fence, and stay',under>=1&&under>=seekers&&apart>1.5&&outside===0&&stay,JSON.stringify({under,seekers,kinds,apart:+apart.toFixed(1),outside})]);
   window.__rainPonies=p.ponies.map(q=>q.spot?{k:q.spot.kind,x:q.x,z:q.z}:null);
   for(let i=0;i<(PADDOCK.rain.dry-5)*10;i++)p.update(0.1,false,0);const early=p.ponies.filter(q=>q.spot).length;
   for(let i=0;i<1800;i++)p.update(0.1,false,0);
   R.push(['after the rain and the dry delay the ponies go back out',early>=1&&p.ponies.every(q=>!q.spot)&&p.ponies.every(q=>geo.insideFence(q.x,q.z,1)),`early ${early}`]);
   // #87: visible occupants, a walk in without vanishing, thaw and offscreen start.
   for(const q of p.ponies){q.state='idle';q.left=0;}for(let i=0;i<50;i++)p.update(0.1,false,0);
   const start=p.ponies.map(q=>[q.x,q.z]),winterUnder=()=>p.ponies.every((q,i)=>{const sp=p.stable(i);return sp&&Math.hypot(q.x-sp.x,q.z-sp.z)<0.1&&!q.gone;});
   applySeason(1);let gone=0,maxJump=0;
   for(let i=0;i<3000;i++){const before=p.ponies.map(q=>[q.x,q.z]);p.update(0.1,false,0);p.ponies.forEach((q,j)=>{gone+=q.gone?1:0;maxJump=Math.max(maxJump,Math.hypot(q.x-before[j][0],q.z-before[j][1]));if(!geo.insideFence(q.x,q.z,1.0))outside++;});}
   const matrix=new T.Matrix4(),scale=new T.Vector3(),pos3=new T.Vector3(),rot=new T.Quaternion();
   const scales=p.ponies.map((q,i)=>{p.mesh.getMatrixAt(i,matrix);matrix.decompose(pos3,rot,scale);return scale.x;});
   R.push(['snow months: two full-size ponies walk into the visible shed without disappearing',p.winter&&winterUnder()&&p.mesh.visible&&scales.every(s=>s>0.9)&&gone===0&&maxJump<0.6&&outside===0&&p.ponies.some((q,i)=>Math.hypot(q.x-start[i][0],q.z-start[i][1])>3),JSON.stringify({gone,maxJump,scales,under:winterUnder()})]);
   applySeason(7);for(let i=0;i<1800;i++)p.update(0.1,false,0);
   R.push(['summer releases both ponies back into the paddock',!p.winter&&p.ponies.every(q=>!q.gone&&!q.spot)&&p.mesh.visible&&p.ponies.every(q=>geo.insideFence(q.x,q.z,1))&&p.ponies.some((q,i)=>Math.hypot(q.x-p.stable(i).x,q.z-p.stable(i).z)>3),'']);
   // Hidden paddock: winter occupants move into their stalls immediately; draw stays culled.
   applySeason(2);p.update(0.1,true,0);const hiddenIn=winterUnder()&&!p.mesh.visible;
   p.update(0.1,false,0);const returned=winterUnder()&&p.mesh.visible;
   applySeason(7);p.update(0.1,true,0);
   R.push(['unseen winter occupants stay in the shed and draw again on return',hiddenIn&&returned&&p.ponies.every(q=>!q.gone),'']);
   for(const q of p.ponies){q.state='idle';q.left=0;}}
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
 const shots=[['gate',[-110.5,224,90,-4]],['grass',[-105,232,90,-5]],['above',[-100,235,90,-35,40]],['stile',null],['winter',null]];
 for(const [name,v] of shots){
  await page.evaluate(async([v,name])=>{const geo=await import(new URL('/src/paddockgeo.js',location.origin)),{groundY}=await import(new URL('/src/surroundings.js',location.origin));
   const {paddock:p,navigation:n,camera,renderer,scene}=window.lundenViewer,s=geo.stile;
   if(name==='winter'){const {applySeason}=await import(new URL('/src/seasons.js',location.origin));applySeason(1);p.update(0.1,true,0);const sh=p.spots.shelter;v=[sh.x+Math.sin(sh.yaw)*9,sh.z+Math.cos(sh.yaw)*9,sh.yaw*180/Math.PI,-4];}
   const [x,z,yaw,pitch,y]=v??[s.x-s.nx*4,s.z-s.nz*4,Math.atan2(s.nx,s.nz)*180/Math.PI+180,-8];
   n.teleport(x,groundY(x,z),z);for(let i=0;i<10;i++)n.update(1/60);for(let i=0;i<800;i++)p.update(0.1);
   camera.position.set(x,y??groundY(x,z)+1.62,z);camera.rotation.set(pitch*Math.PI/180,yaw*Math.PI/180,0,'YXZ');camera.updateMatrixWorld(true);
   scene.updateMatrixWorld();renderer.render(scene,camera);},[v,name]);
  await page.screenshot({path:`${out}/${name}.png`});
 }
 assert.deepEqual(errors,[],'no browser errors');
 assert(res.every(r=>r[1]),'all paddock checks pass');
 console.log('PASS: paddock');
}finally{await browser.close();}
