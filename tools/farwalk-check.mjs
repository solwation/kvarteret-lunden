import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
// #60 (upstream #1236): walk the real production world beyond the block: river, bridges, school area, clock tower, outer edge.
// node tools/farwalk-check.mjs [base-url] [screenshot-dir]
const base=process.argv[2]??'http://localhost:8777',out=process.argv[3]??'artifacts/farwalk';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
const errors=[];
try{
 const page=await browser.newPage({viewport:{width:1100,height:760}});
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base);
 await page.waitForFunction(()=>window.lundenViewer?.renderer.info.render.frame>0,null,{timeout:180000});
 await page.evaluate(()=>window.lundenViewer.renderer.setAnimationLoop(null));
 await page.locator('#start').click({timeout:120000});await page.evaluate(()=>document.exitPointerLock?.());
 const res=await page.evaluate(async()=>{
  const {WALK,SITE}=await import(new URL('/src/config.js',location.origin));
  const {groundY,groundBelowDeckY}=await import(new URL('/src/surroundings.js',location.origin)); // #69: the north and the far west/east now lie above y 0, so a start point is lifted onto the ground (never below 0: lower ground is fallen onto)
  const {parkRampEnds}=await import(new URL('/src/riverpark.js',location.origin));
  const {riverAt,waterYAt}=await import(new URL('/src/riverbridge.js',location.origin));
  const {navigation:n,camera}=window.lundenViewer, dt=1/60;
  let pk=-9;
  const walk=(start,pts)=>{pk=-9;
   n.teleport(start[0],Math.max(0,groundY(start[0],start[1])),start[1]);for(let i=0;i<30;i++)n.update(dt);
   for(let i=0;i<pts.length;i++){const[x,z]=pts[i];let t=0;const lim=8+Math.hypot(n.pos.x-x,n.pos.z-z)/1.6;
    while(Math.hypot(n.pos.x-x,n.pos.z-z)>0.2){camera.rotation.y=Math.atan2(-(x-n.pos.x),-(z-n.pos.z));n.keys=new Set(['KeyW','ShiftLeft']);n.update(dt);pk=Math.max(pk,n.pos.y);t+=dt;if(t>lim){n.keys=new Set();return i;}}}
   n.keys=new Set();for(let i=0;i<30;i++)n.update(dt);return -1;};
  const R=[
   ['down to the river',[-35,61],[[-30,66],[-28,70],[-30,80],[-39,95],[-40,110],[-41,118]],()=>n.pos.z>117&&n.pos.y<=-2.9],
   ['river blocks',[-41,118],[[-41,150]],()=>{const r=riverAt(n.pos.x,n.pos.z);return r.distance>=r.width/2+1.5&&n.pos.y<-4;}],
   ['road bridge crossing',[23.5,90],[[23.7,100],[23.5,125],[23.3,143],[23.3,155]],()=>n.pos.z>150],
   ['cycle bridge crossing',[18,92],[[18.1,101],[17.9,125],[17.8,146],[17.8,155]],()=>n.pos.z>150],
   ['bridge rail blocks',[23.5,125],[[30,125]],()=>n.pos.x<27.8],
   ['under the bridges east',[10,111],[[18,111],[24,111],[32,111]],()=>n.pos.x>30&&n.pos.y<=-5.0],
   ['under the bridges west',[32,111],[[24,111],[18,111],[10,111]],()=>n.pos.x<12&&n.pos.y<=-5.0],
   ['HepCat building blocks',[24,0],[[34,0]],()=>n.pos.x<28],
   ['to the school and clock tower',[20,-10],[[20,-40],[20,-80],[24,-108],[45,-109]],()=>n.pos.z<-108&&n.pos.x>40],
   ['clock tower facade blocks',[45,-109],[[45,-125]],()=>n.pos.z>-113.5],
   ['between school buildings east',[45,-109],[[70,-108],[100,-108],[130,-105],[130,-60]],()=>n.pos.z>-62&&n.pos.x>125],
   ['back to the block',[130,-60],[[130,-30],[75,-25],[40,-20],[25,-5]],()=>n.pos.x<30],
   ['edge west',[-240,30],[[-290,30]],()=>n.pos.x>=WALK.x0&&n.pos.x<WALK.x0+0.6],
   ['edge east',[300,20],[[340,20]],()=>n.pos.x<=WALK.x1&&n.pos.x>WALK.x1-0.6],
   ['edge north',[60,-180],[[60,-230]],()=>n.pos.z>=WALK.z0],
   ['edge south',[60,230],[[60,280]],()=>n.pos.z<=WALK.z1],
  ];
  { // #86 (upstream #1337/#1338): the little timber footbridge by the paddock stands on earth ramps - walk over it both ways, W held
   const E=parkRampEnds(),W0=SITE.riverPark.woodBridge,along=(e,d)=>[e.x+e.dx*d,e.z+e.dz*d];
   for(const [name,a,z] of [['timber footbridge NW to SE',0,1],['timber footbridge SE to NW',1,0]]){const g=along(E[z],8);
    R.push([name,along(E[a],9),[[E[a].x,E[a].z],[E[z].x,E[z].z],g],()=>Math.hypot(n.pos.x-g[0],n.pos.z-g[1])<1&&pk>W0.deckY-0.1]);}
   R.push(['timber footbridge ramps are smooth',along(E[0],9),[],()=>{let steep=0,step=0;for(const e of E){let prev=null;for(let d=0.2;d<=W0.ramp.length;d+=0.1){const [x,zz]=along(e,d),y=groundY(x,zz);if(prev!==null)step=Math.max(step,Math.abs(y-prev));prev=y;steep=Math.max(steep,Math.abs(groundY(...along(e,d+0.1))-y)/0.1);}}return step<0.1&&steep<WALK.maxSlope*0.8;}]);
  }
  const results=R.map(([name,s,p,ok])=>{const stuck=walk(s,p);return {name,ok:ok(),end:n.pos.toArray().map(v=>+v.toFixed(2)),stuck};});
  // dropped into the river: back on the bank
  const r0=riverAt(-41,143);n.teleport(r0.x+r0.nx*0.2,groundBelowDeckY(r0.x,r0.z),r0.z+r0.nz*0.2);n.update(dt);
  const r=riverAt(n.pos.x,n.pos.z);results.push({name:'river rescue',ok:r.distance>=r.width/2+1,end:n.pos.toArray()});
  // #90: the public navigation keeps its geographical water barrier and lands on the locally graded dry shore.
  for(const i of[1,8,16]){const[x,z]=SITE.river.path[i];n.teleport(x,groundBelowDeckY(x,z),z);n.rescue();const end=n.pos.toArray(),r=riverAt(end[0],end[2]);results.push({name:`local river recovery at station ${i}`,ok:r.distance>=r.width/2+1&&end[1]>waterYAt(end[0],end[2])+.3,end});}
  // #91: from every river anchor the recovery point is outside the barrier and a W-held walk away from the water is not stopped
  {const bad=[];SITE.river.path.forEach(([x,z],i)=>{if(!(x>WALK.x0+5&&z<WALK.z1-5))return;n.teleport(x,groundBelowDeckY(x,z),z);n.rescue();const a=n.pos.clone(),q=riverAt(a.x,a.z);
    const sx=Math.sign((a.x-q.x)*q.nx+(a.z-q.z)*q.nz)||1,tx=a.x+q.nx*sx*4,tz=a.z+q.nz*sx*4;let t=0;
    while(Math.hypot(n.pos.x-tx,n.pos.z-tz)>0.2&&t<8){camera.rotation.y=Math.atan2(-(tx-n.pos.x),-(tz-n.pos.z));n.keys=new Set(['KeyW']);n.update(dt);t+=dt;}
    n.keys=new Set();if(Math.hypot(n.pos.x-tx,n.pos.z-tz)>0.5)bad.push(i);});
   results.push({name:'recovery from every river anchor walks on',ok:bad.length===0,end:bad});}
  return results;
 });
 for(const r of res)console.log(r.ok?'PASS':'FAIL',r.name,JSON.stringify(r.end));
 const views=[['river',[-41,-1,112],[-41,-3,135]],['bridge-underpass',[14,-4,111],[25,-4.5,111]],['clocktower',[45,1.7,-100],[45,6,-113]],['school',[100,1.7,-100],[100,4,-120]]];
 for(const [name,pos,look] of views){
  await page.evaluate(([pos,look])=>{const {renderer,scene,camera,navigation:n}=window.lundenViewer;n.teleport(pos[0],0,pos[2]+ (pos[2]>0?-6:0));camera.position.set(...pos);camera.lookAt(...look);camera.updateMatrixWorld(true);renderer.render(scene,camera);},[pos,look]);
  await page.screenshot({path:`${out}/${name}.png`});
 }
 assert.deepEqual(errors,[],'no browser errors');
 assert(res.every(r=>r.ok),'all far walk checks pass');
 console.log('PASS: far walk');
}finally{await browser.close();}
