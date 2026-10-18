import {createRequire} from 'node:module';const {chromium}=process.env.PLAYWRIGHT_MODULE?createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE):await import('playwright');
import {mkdir} from 'node:fs/promises';
// #68 (original #1294, tools/roofaudittest.html adapted): every mapped building roof (`bld-*` surfaces, src/buildingroofs.js) can be stood on,
// and its ring walls are served by Roofs.walls(). node tools/roofaudit-check.mjs [base-url]
const base=process.argv[2]??'http://localhost:8777';
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
const errors=[];let failed=0;
try{
 const page=await browser.newPage({viewport:{width:900,height:600}});
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base);
 await page.waitForFunction(()=>window.lundenViewer?.renderer.info.render.frame>0,null,{timeout:180000});
 await page.evaluate(()=>window.lundenViewer.renderer.setAnimationLoop(null));
 await page.locator('#start').click({timeout:120000});await page.evaluate(()=>document.exitPointerLock?.());
 const res=await page.evaluate(async()=>{
  const {groundY}=await import(new URL('/src/surroundings.js',location.origin));
  const {navigation:n,camera,world}=window.lundenViewer,dt=1/60,rows=[];
  const inRing=(p,x,z)=>{let y=false;for(let i=0,j=p.length-1;i<p.length;j=i++)if((p[i][1]>z)!==(p[j][1]>z)&&x<(p[j][0]-p[i][0])*(z-p[i][1])/(p[j][1]-p[i][1])+p[i][0])y=!y;return y;};
  const ringDist=(rs,x,z)=>{let m=Infinity;for(const p of rs)for(let i=0;i+1<p.length;i++){const[ax,az]=p[i],[bx,bz]=p[i+1],dx=bx-ax,dz=bz-az,l=dx*dx+dz*dz||1,t=Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/l));m=Math.min(m,Math.hypot(x-ax-t*dx,z-az-t*dz));}return m;};
  const surf=world.roofs.surfaces.filter(s=>String(s.id).startsWith('bld-'));
  for(const s of surf){
   let best=null;
   for(let i=0;i<=16;i++)for(let j=0;j<=16;j++){const x=s.x0+(s.x1-s.x0)*(i+.5)/17,z=s.z0+(s.z1-s.z0)*(j+.5)/17;
    if(!inRing(s.poly,x,z)||(s.holes??[]).some(h=>inRing(h,x,z)))continue;const d=ringDist([s.poly,...(s.holes??[])],x,z);if(!best||d>best.d)best={x,z,d};}
   if(!best){rows.push({id:s.id,ok:false,why:'no interior point'});continue;}
   const top=s.y(best.x,best.z);
   n.teleport(best.x,top+3,best.z);for(let i=0;i<240;i++)n.update(dt);
   const landed=Math.abs(n.pos.y-top)<0.15&&Math.abs(n.pos.x-best.x)<0.5;
   // walls: the ring segments are served at the roof's height beside the building (they stop a body overlapping the roof's side; a walker standing on the roof
   // is stepped past a 5 cm top, as in the original, where the walls are for the jetpack)
   const e=s.poly[0],hit=world.roofs.walls(s.y(e[0],e[1])-1.5,s.y(e[0],e[1])-0.5,e[0],e[1]).some(w=>Math.hypot((w[0]+w[2])/2-e[0],(w[1]+w[3])/2-e[1])<s.x1-s.x0+s.z1-s.z0);
   const outside=!hit;
   rows.push({id:s.id,ok:landed&&!outside,hit,landed,end:[n.pos.x,n.pos.y,n.pos.z].map(v=>+v.toFixed(1)),top:+top.toFixed(2),ground:+groundY(best.x,best.z).toFixed(2)});
  }
  return rows;
 });
 console.log(res.length,'roofs');
 for(const r of res){if(!r.ok){failed++;console.log('FAIL',JSON.stringify(r));}}
 console.log(failed?`${failed} FAILED`:'PASS all roofs landed and walls hold');
}finally{await browser.close();}
if(errors.length){console.log('page errors',errors);failed++;}
process.exit(failed?1:0);
