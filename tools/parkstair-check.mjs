import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
// #46: the C/B park stair is 3.0 m wide (x −47.4…−44.4); walk both halves down and up in the production World.
const base=process.argv[2]??'http://localhost:8765',out=process.argv[3]??'artifacts/parkstair',before=process.argv.includes('--before'); // --before: serve caa2b93's 1.5 m config, east half must fail
await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
const errors=[];
try{
 const page=await browser.newPage({viewport:{width:1100,height:760}});
 page.on('pageerror',e=>errors.push(e.message));
 if(before){const {execFileSync}=await import('node:child_process');const old=execFileSync('git',['show','caa2b93:src/config.js'],{encoding:'utf8'});await page.route(u=>u.pathname.endsWith('/src/config.js'),r=>r.fulfill({body:old,contentType:'text/javascript'}));}
 await page.goto(base);
 await page.waitForFunction(()=>window.lundenViewer?.renderer.info.render.frame>0,null,{timeout:180000});
 await page.evaluate(()=>window.lundenViewer.renderer.setAnimationLoop(null));
 await page.locator('#start').click({timeout:120000});await page.evaluate(()=>document.exitPointerLock?.());
 const result=await page.evaluate(async()=>{
  const {SITE}=await import(new URL('/src/config.js',location.origin)).catch(()=>({SITE:null}));
  const {navigation:n,camera}=window.lundenViewer;
  const walk=(x,z0,zEnd,yaw)=>{
   n.teleport(x,z0<55?0:-3,z0);camera.rotation.set(0,yaw,0);for(let i=0;i<30;i++)n.update(1/60);
   n.keys.clear();n.keys.add('KeyW');let maxDrop=0,maxDx=0,prevY=n.pos.y,t=0;const south=yaw!==0;
   while(t<20&&(south?n.pos.z<zEnd:n.pos.z>zEnd)){n.update(1/60);t+=1/60;maxDrop=Math.max(maxDrop,prevY-n.pos.y);maxDx=Math.max(maxDx,Math.abs(n.pos.x-x));prevY=n.pos.y;}
   n.keys.clear();return {x,reached:south?n.pos.z>=zEnd:n.pos.z<=zEnd,end:n.pos.toArray(),time:+t.toFixed(2),maxDrop:+maxDrop.toFixed(3),maxDx:+maxDx.toFixed(3)};
  };
  const runs=[];
  for(const x of [-46.9,-44.7]){runs.push({dir:'down',...walk(x,51,59.4,Math.PI)});runs.push({dir:'up',...walk(x,59.4,51,0)});}
  const ground=[-47.3,-46.9,-45.9,-44.7,-44.5].map(x=>({x,mid:n.groundAt(x,55.5,0)}));
  return {stair:SITE?.terrain.stairs[1],paving:SITE?.basementPaving[0],runs,ground};
 });
 if(before){console.log(JSON.stringify(result.runs));assert(!result.runs.find(r=>r.x===-44.7&&r.dir==='down').reached||result.runs.find(r=>r.x===-44.7).maxDrop>0.5,'baseline: the east half is no stair');console.log('PASS before: east half blocked/falls');process.exit(0);}
 for(const r of result.runs){assert(r.reached,`${r.dir} at x ${r.x} reaches the end`);assert(r.maxDx<0.05,`no sideways push at x ${r.x}`);}
 for(const r of result.runs.filter(r=>r.dir==='down'))assert(Math.abs(r.end[1]+3)<0.05,`down at x ${r.x} ends on the park level`);
 for(const r of result.runs.filter(r=>r.dir==='up'))assert(Math.abs(r.end[1])<0.05,`up at x ${r.x} ends on the courtyard`);
 for(const [name,pos,look] of [['park-south',[-45.9,-1.3,66],[-45.9,-1.0,52]],['courtyard-south',[-45.9,1.6,48],[-45.9,-2.0,58]]]){
  await page.evaluate(([pos,look])=>{const {renderer,scene,camera,world}=window.lundenViewer;camera.position.set(...pos);camera.lookAt(...look);camera.updateMatrixWorld(true);world.garage?.update(0,{pos:camera.position.clone().setY(-3),below:false},camera);renderer.render(scene,camera);},[pos,look]);
  await page.screenshot({path:`${out}/${name}.png`});
 }
 assert.deepEqual(errors,[],'no browser errors');
 await writeFile(`${out}/result.json`,JSON.stringify(result,null,2));console.log(JSON.stringify(result));console.log('PASS: C/B park stair walkable on both halves');
}finally{await browser.close();}
