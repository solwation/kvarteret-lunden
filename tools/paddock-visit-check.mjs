import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';
// #88: at least one pony stands in front of the visitor, in frame and >= 40 px tall (both viewports), still there after a few seconds.
// #83: the "Hästhagen" destination: outside the fence, clear of trees, on the ground, facing the paddock, walkable on; screenshots (desktop + 390x844).
// CHROME_PATH=... node tools/paddock-visit-check.mjs [base-url] [screenshot-dir]
const base=process.argv[2]??'http://localhost:8165',out=process.argv[3]??'/tmp/kvarteret-paddock-visit';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
const errors=[];
try{
 for(const [name,vp] of [['desktop',{width:1280,height:720}],['mobile',{width:390,height:844}]]){
  const page=await browser.newPage({viewport:vp});page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base);await page.waitForFunction(()=>window.lundenViewer?.renderer.info.render.frame>0,null,{timeout:300000});
  await page.locator('#start').click({timeout:120000});await page.evaluate(()=>document.exitPointerLock?.());
  if(name==='mobile'){await page.locator('#place-toggle').click();await page.locator('#place-menu [data-place="paddock"]').click();}else await page.keyboard.press('Digit8');
  await page.waitForTimeout(800);await page.screenshot({path:`${out}/${name}.png`});
  const r=await page.evaluate(async()=>{
   const geo=await import(new URL('/src/paddockgeo.js',location.origin)),{treeFeet,groundY}=await import(new URL('/src/surroundings.js',location.origin)),fw=await import(new URL('/src/farwalk.js',location.origin));
   const v=window.lundenViewer,n=v.navigation,c=v.camera,p=v.locations.paddock,before=n.pos.toArray();
   const dir=[-Math.sin(c.rotation.y),-Math.cos(c.rotation.y)];
   const nearTree=Math.min(...treeFeet.map(t=>Math.hypot(t.x-p.x,t.z-p.z)));
   const ahead=[p.x+dir[0]*20,p.z+dir[1]*20];
   const ground=v.paddock?v.paddock.ground(p.x,p.z):groundY(p.x,p.z);
   for(let i=0;i<120;i++)n.update(1/60);const settled=n.pos.toArray();
   // walk on: forward 0.5 s towards the fence, then sideways along it
   n.keys.add('KeyW');for(let i=0;i<60;i++)n.update(1/60);n.keys.clear();const fwd=n.pos.toArray();
   const seen=()=>{const T=c.position.constructor,out=[];for(const q of v.paddock.ponies){const a=new T(q.x,q.y+0.7,q.z).project(c),t=new T(q.x,q.y+1.5,q.z).project(c),b=new T(q.x,q.y,q.z).project(c);if(a.z<1&&Math.abs(a.x)<1&&Math.abs(a.y)<1)out.push((t.y-b.y)/2*innerHeight);}return out;};
   const ponies=seen();
   return {ponies,place:document.getElementById('place').textContent,current:document.getElementById('place-current').textContent,selected:document.querySelector('[data-place].selected').dataset.place,before,settled,fwd,p:[p.x,p.y,p.z],nearTree,inside:geo.insideFence(p.x,p.z),aheadInside:geo.insideFence(...ahead),ground,paddockDist:Math.hypot(geo.centre.x-p.x,geo.centre.z-p.z)};
  });
  console.log(name,JSON.stringify(r));
  assert(r.ponies.some(h=>h>=40),'a pony is in frame and at least 40 px tall: '+r.ponies);
  assert.equal(r.place,'Hästhagen');assert.equal(r.selected,'paddock');assert(!r.inside,'outside the fence');assert(r.nearTree>3,'clear of trees');assert(r.aheadInside,'looks at the paddock');
  assert(Math.abs(r.settled[1]-r.p[1])<.2,'on the ground');assert(Math.hypot(r.settled[0]-r.p[0],r.settled[2]-r.p[2])<.1,'not pushed away');
  assert(Math.hypot(r.fwd[0]-r.settled[0],r.fwd[2]-r.settled[2])>.3,'can walk on');
  await page.close();
 }
 assert.deepEqual(errors,[]);console.log('PASS: Hästhagen destination (desktop + mobile)');
}finally{await browser.close();}
