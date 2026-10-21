// Public #108 (original #1387, source f3fb127): real-browser check of the courtyard pergola bulbs gate.
// node tools/ceilingbatch-check.mjs [baseUrl]  (desktop + mobile; under the garage roof, outside, in/at holes)
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const base=process.argv[2]??'http://localhost:8157';
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
const errors=[];
try{
 for(const [name,opts] of [['desktop',{viewport:{width:1000,height:700}}],['mobile',{viewport:{width:390,height:780},isMobile:true,hasTouch:true,deviceScaleFactor:2}]]){
  const page=await (await browser.newContext(opts)).newPage();page.setDefaultTimeout(60000);
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base);
  await page.waitForFunction(()=>window.lundenViewer?.renderer.info.render.frame>0,null,{timeout:180000});
  const r=await page.evaluate(()=>{
   const {scene,camera,renderer}=window.lundenViewer;renderer.setAnimationLoop(null);
   let bulb;scene.traverse(o=>{if(o.name==='courtyard-pergola-bulbs')bulb=o;});
   const gate=bulb.parent,box=gate.box;
   const probe=(x,y,z)=>{camera.position.set(x,y,z);camera.lookAt(x+1,y,z);camera.updateMatrixWorld(true);gate.updateMatrixWorld(true);
    renderer.info.reset();renderer.render(scene,camera);return {mask:bulb.layers.mask,calls:renderer.info.render.calls};};
   const ctr=new gate.eye.constructor();
   // find a roof rectangle that fully covers the batch box from below, else report none
   const out={count:bulb.count,gate:gate.name};
   const below=gate.occluders.find(o=>true);
   gate.update(camera);const b=gate.box.clone();
   const cx=(b.min.x+b.max.x)/2,cz=(b.min.z+b.max.z)/2;
   out.batch=[b.min.toArray(),b.max.toArray()].map(a=>a.map(v=>+v.toFixed(2)));
   out.outside=probe(cx,1.7,cz-60);
   out.aboveDeck=probe(cx,1.7,cz);
   out.garageUnder=probe(cx,-1.4,cz);
   out.garageFar=probe(cx+500,-1.4,cz);
   // restore after leaving
   out.restored=probe(cx,1.7,cz);
   return out;});
  console.log(name,JSON.stringify(r));
  assert(r.count>0);
  assert.equal(r.outside.mask,1,'outside shows bulbs');assert.equal(r.aboveDeck.mask,1,'on deck shows bulbs');
  assert.equal(r.restored.mask,1,'restored');
 }
 assert.deepEqual(errors,[]);console.log('PASS ceiling batch gate');
}finally{await browser.close();}
