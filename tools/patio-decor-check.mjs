import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
// #35 (from the original's tools/patiodecortest.html at 2190e17): the neighbours' furnished patios on Hus L's back.
// node tools/patio-decor-check.mjs [base-url] [screenshot-dir]
const base=process.argv[2]??'http://localhost:8157';
const out=process.argv[3]??'artifacts/patio-decor';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
const errors=[];
try{
 const page=await browser.newPage({viewport:{width:1000,height:700},deviceScaleFactor:1});
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/');
 await page.waitForFunction(()=>window.lundenViewer?.renderer.info.render.frame>0,null,{timeout:120000});
 await page.evaluate(()=>window.lundenViewer.renderer.setAnimationLoop(null));
 const r=await page.evaluate(async()=>{
  const {scene,camera,renderer,world}=window.lundenViewer;
  const {PATIO_DECOR:P}=await import(new URL('src/config.js',location.href).href);
  const {patioLayout}=await import(new URL('src/patiodecor.js',location.href).href);
  const gate=scene.getObjectByName('patio-decor');
  const D=world.size.z,recs=gate.userData.records,fails=[];
  let tris=0,bad=0;
  for(const m of gate.meshes){const p=m.geometry.attributes.position;tris+=p.count/3;for(let i=0;i<p.count;i++)if(![p.getX(i),p.getY(i),p.getZ(i)].every(Number.isFinite))bad++;}
  const mid=it=>[(it.x0+it.x1)/2,(it.z0+it.z1)/2];
  for(const rec of recs){
   const it=rec.items,o=rec.ox;
   if(it.length<3)fails.push(`${rec.id}: ${it.length} items`);
   for(const i of it){
    if(i.x1>o+P.door.x0-0.05&&i.x0<o+P.door.x1+0.05&&i.z0<D+P.door.depth)fails.push(`${rec.id}: ${i.k} in the door swing`);
    if(i.z0<D-0.05||i.z1>D+4.0)fails.push(`${rec.id}: ${i.k} outside the patio depth`);
    if(i.x0<o+0.04||i.x1>o+5.71||i.crown.x0<o+0.04||i.crown.x1>o+5.71)fails.push(`${rec.id}: ${i.k} outside the screen walls`);
    if(i.k!=='parasol'&&i.x0<o+P.passage.x1)fails.push(`${rec.id}: ${i.k} in the passage`);
    if(i.face){ // seats face their table, or the courtyard (never the façade)
     const [x,z]=mid(i);
     const t=it.filter(t=>t.k==='table').map(t=>{const [tx,tz]=mid(t);return {dx:tx-x,dz:tz-z,d:Math.hypot(tx-x,tz-z)};}).filter(t=>t.d<1.3).sort((a,b)=>a.d-b.d);
     const ok=t.length?(i.face[0]*t[0].dx+i.face[1]*t[0].dz)/t[0].d>0.7:i.face[1]>0.7;
     if(!ok)fails.push(`${rec.id}: ${i.k} at u ${i.u} v ${i.v} faces away`);
    }
   }
  }
  const cam=camera.clone();
  const seen=(x,y,z)=>{cam.position.set(x,y,z);cam.lookAt(-10,1,D+2);cam.updateMatrixWorld(true);gate.update(cam);return gate.meshes.every(m=>m.layers.test(camera.layers));};
  const gateOk={street:!seen(-5,1.7,-15),court:seen(-5,1.7,30),above:seen(-5,30,20),far:!seen(-5,1.7,300)};
  gate.update(camera);
  return {ids:recs.map(r=>r.id),styles:recs.map(r=>r.style),meshes:gate.meshes.map(m=>m.name),tris:Math.round(tris),bad,fails,gate:gateOk,D,
   deterministic:JSON.stringify(patioLayout('L1003','grill'))===JSON.stringify(patioLayout('L1003','grill')),
   ox:Object.fromEntries(recs.map(r=>[r.id,r.ox]))};
 });
 console.log(JSON.stringify(r));
 assert.deepEqual(r.ids,['L1001','L1002','L1003','L1004','L1005','L1006','L1008'],'every neighbour patio but L1007 is furnished');
 assert.equal(new Set(r.styles).size,r.ids.length,'distinct styles');
 assert.equal(r.meshes.length,2,'two merged meshes');
 assert(r.tris>2000&&r.tris<35000,`triangle budget: ${r.tris}`);
 assert.equal(r.bad,0,'finite positions');
 assert(r.deterministic,'seeded layouts');
 assert.deepEqual(r.fails,[],'clearances and seat directions');
 assert.deepEqual(r.gate,{street:true,court:true,above:true,far:true},'gate');
 // screenshots: from above over the patios, and from the courtyard
 const shot=async(name,pos,look)=>{
  const calls=await page.evaluate(([pos,look])=>{
   const {scene,camera,renderer}=window.lundenViewer;
   camera.position.set(...pos);camera.lookAt(...look);camera.updateMatrixWorld(true);
   renderer.info.autoReset=false;renderer.info.reset();renderer.render(scene,camera);const c=renderer.info.render.calls;renderer.info.autoReset=true;return c;
  },[pos,look]);
  await page.screenshot({path:`${out}/${name}.png`});
  console.log(`${name}: ${calls} draw calls`);
 };
 const D=r.D;
 await page.locator('#start').click();
 await page.evaluate(()=>document.exitPointerLock?.());
 await shot('above-west',[r.ox.L1002+3,14,D+11],[r.ox.L1002+3,0,D+2]);
 await shot('above-east',[r.ox.L1006+3,14,D+11],[r.ox.L1006+3,0,D+2]);
 for(const id of r.ids)await shot(`court-${id}`,[r.ox[id]+3.2,2.2,D+6.8],[r.ox[id]+3.4,0.6,D+1.2]);
 await shot('street',[-5,1.7,-15],[-5,1.5,0]);
 assert.deepEqual(errors,[],'no page errors');
 console.log('PASS: patio decor');
}finally{await browser.close();}
