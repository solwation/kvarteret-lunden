// #115: actual public World, both complete pergolas; immutable source baseline via BASELINE_REF.
import {chromium} from 'playwright';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
const base=process.argv[2]??'http://localhost:8257',out=process.argv[3]??'/tmp/pergola-check',before=process.argv[4];
await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,args:['--no-sandbox','--enable-unsafe-swiftshader']});
try {
 for(const [profile,width,height,touch] of [['desktop',1280,800,false],['portrait',390,844,true],['landscape',844,390,true]]) {
  if(process.env.PROFILE&&profile!==process.env.PROFILE)continue;
  const page=await browser.newPage({viewport:{width,height},hasTouch:touch,isMobile:touch}),errors=[],external=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(new URL(r.url()).origin!==new URL(base).origin)external.push(r.url())});
  await page.route('**/src/**',async r=>{const path=new URL(r.request().url()).pathname.slice(1);if(!process.env.BASELINE_REF&&path!=='src/main.js'&&path!=='src/paddock.js')return r.continue();let body=process.env.BASELINE_REF?execFileSync('git',['show',process.env.BASELINE_REF+':'+path]).toString():await readFile(path,'utf8');if(path==='src/main.js')body=body.replace('window.lundenViewer = {','window.lundenViewer = { frame, clock,');if(path==='src/paddock.js')body=body.replace('mulberry((Math.random() * 1e9) | 0)','mulberry(11521021)');return r.fulfill({contentType:'text/javascript',body})});
  await page.clock.setFixedTime(new Date('2026-10-21T09:50:00Z'));
  await page.goto(base);await page.waitForFunction(()=>window.lundenViewer?.paddock&&lundenViewer.renderer.info.render.frame>0,null,{timeout:240000});
  const r=await page.evaluate(async baseline=>{
   const a=lundenViewer,T=await import('three'),{GARAGE,COURTYARD}=await import('/src/config.js'),{garageCeilings,wholeBoxOccluded}=await import('/src/ceilingbatchgate.js');
   a.renderer.setAnimationLoop(null);a.clock.getDelta=()=>1/60;document.getElementById('start').click();document.exitPointerLock?.();
   const bulbs=[];a.scene.traverse(o=>{if(o.name==='courtyard-pergola-bulbs')bulbs.push(o)});const gates=bulbs.map(b=>b.parent),R=[],add=(name,ok,data={})=>R.push({name,ok,data});
   const hash=async arr=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new Uint8Array(arr.buffer,arr.byteOffset,arr.byteLength))),n=>n.toString(16).padStart(2,'0')).join('');
   const matrix=new Float32Array(bulbs.reduce((n,b)=>n+b.count*16,0));let offset=0;for(const b of bulbs){matrix.set(b.instanceMatrix.array,offset);offset+=b.count*16;}
   const identity={matrix:await hash(matrix),count:matrix.length/16,geometry:[],bounds:[],counts:bulbs.map(b=>b.count)};
   for(const b of bulbs){const attrs={};for(const[k,v]of Object.entries(b.geometry.attributes))attrs[k]=await hash(v.array);attrs.index=await hash(b.geometry.index.array);identity.geometry.push(attrs);b.computeBoundingBox();identity.bounds.push([b.boundingBox.min.toArray(),b.boundingBox.max.toArray()]);}
   add('272 matrices, shared original geometry/material, complete pergola bounds',identity.count===272&&(baseline?bulbs.length===1:bulbs.length===2&&bulbs[0].geometry===bulbs[1].geometry&&bulbs[0].material===bulbs[1].material&&bulbs.every((b,i)=>{const p=COURTYARD.pergolas[i],box=b.boundingBox;return Math.abs(box.min.x-(p.x0-.03))<1e-5&&Math.abs(box.max.x-(p.x1+.03))<1e-5&&Math.abs(box.min.z-(p.z0-.03))<1e-5&&Math.abs(box.max.z-(p.z1+.15))<1e-5})),{counts:identity.counts,bounds:identity.bounds});
   const ceilings=garageCeilings(),solid=GARAGE.rects.filter(r=>r.id!=='core'&&!r.core&&!r.outside);
   add('actual public A/B/C/L roof rectangles retain all core/outside holes',JSON.stringify(ceilings)===JSON.stringify(solid.map(r=>({x0:r.x0,x1:r.x1,z0:r.z0,z1:r.z1,y0:GARAGE.ceiling,y1:GARAGE.ceiling}))),{solid:solid.map(r=>r.id),holes:GARAGE.rects.filter(r=>r.id==='core'||r.core||r.outside).map(r=>r.id)});
   const poses=[['cellar',[-16,-1.38,24],[-16,-1.38,29]],['hall',[-45,-1.38,23],[-35,-1.38,23]],['pergola-a',[-16,1.62,20],[-16,2.65,25]],['pergola-b',[-60,1.62,42.5],[-60,2.65,46]],['roofedge',[-51.4,1.62,33.16],[-60,2.65,45]],['opening',[-61.39,-1.38,25],[-61.39,-1.38,30]]],views=[],images=[];
   const cam=(p,target)=>{a.navigation.teleport(p[0],p[1]-1.62,p[2]);a.camera.position.fromArray(p);a.camera.lookAt(...target);a.camera.updateMatrixWorld(true);a.frame();a.scene.updateMatrixWorld(true)};
   const render=()=>{const r=a.renderer,draw=r.renderBufferDirect,shadowRender=r.shadowMap.render;let shadow=false,calls=0,triangles=0;const bulbDraws=[],draws=[];r.shadowMap.render=function(...args){shadow=true;try{return shadowRender.apply(this,args)}finally{shadow=false}};r.renderBufferDirect=function(...args){const before=r.info.render.triangles,result=draw.apply(this,args);if(!shadow&&!r.getRenderTarget()){const tris=r.info.render.triangles-before;calls++;triangles+=tris;let path=[];for(let o=args[4];o;o=o.parent)path.unshift(o.name||o.type);draws.push({path:path.join('/'),triangles:tris,count:args[4].count});if(bulbs.includes(args[4]))bulbDraws.push({i:bulbs.indexOf(args[4]),triangles:tris,count:args[4].count})}return result};try{r.render(a.scene,a.camera)}finally{r.renderBufferDirect=draw;r.shadowMap.render=shadowRender}return{calls,triangles,bulbDraws,draws,shadowEnabled:r.shadowMap.enabled}};
   for(const[name,p,target]of poses){cam(p,target);for(const g of gates)g.update(a.camera);const expected=gates.map(g=>wholeBoxOccluded(g.eye,g.box,ceilings,.005)?128:1),masks=bulbs.map(b=>b.layers.mask);const main=render();views.push({name,main,eye:a.camera.position.toArray(),feet:a.navigation.pos.toArray(),below:a.navigation.below,calls:a.renderer.info.render.calls,triangles:a.renderer.info.render.triangles,masks,expected});images.push({name,data:a.renderer.domElement.toDataURL('image/png')});}
   add('all batches obey conservative single-roof whole-box test in six actual views',views.every(v=>JSON.stringify(v.masks)===JSON.stringify(v.expected)),{views});
   const measurements=[];
   // Actual main.js Q handler; compare its newly emitted marker with a physical0|7 ray.
   for(const [name,p,target] of [poses[0],poses[2],poses[3],poses[5]]){
    cam(p,target);for(const g of gates)g.update(a.camera);
    const ray=new T.Raycaster();ray.layers.enable(7);ray.setFromCamera(new T.Vector2(),a.camera);ray.far=100;
    const visible=o=>{for(let q=o;q;q=q.parent)if(!q.visible)return false;return true};
    const hit=ray.intersectObjects([a.world.object,a.world.core.object,a.world.garage.object],true).find(h=>h.object.isMesh&&visible(h.object)&&h.object.material?.opacity!==0);
    document.getElementById('measure').click();document.body.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyQ',bubbles:true}));
    let marker;a.scene.traverse(o=>{if(o.isMesh&&o.material?.color?.getHex()===0xd6783b)marker=o});
    measurements.push({name,eye:a.camera.position.toArray(),feet:a.navigation.pos.toArray(),below:a.navigation.below,hit:hit?.object.name,expected:hit?.point.toArray(),actual:marker?.position.toArray(),error:hit&&marker?marker.position.distanceTo(hit.point):!hit&&!marker?0:null});
    document.getElementById('measure').click();
   }
   add('actual public Q measurement matches first physical0|7 surface below roof and outdoors',measurements.every(m=>m.error!==null&&m.error<1e-6),{measurements});
   const powers=[];for(const[hour,night,power]of[[12,0,true],[23,1,true],[23,1,false],[12,0,true]]){a.world.windowLights.update(hour,night,power);powers.push(bulbs.map(b=>b.material.color.getHex()));}
   add('actual public day/night/power callback affects both shared batches',powers[0].every(c=>c===0x2a2620)&&powers[1].every(c=>c===0xffd08a)&&powers[2].every(c=>c===0x2a2620)&&powers[3].every(c=>c===0x2a2620),{powers});
   const physical=[];
   for(const b of bulbs){const m=new T.Matrix4();b.getMatrixAt(0,m);const p=new T.Vector3().setFromMatrixPosition(m).applyMatrix4(b.matrixWorld),ray=new T.Raycaster(p.clone().add(new T.Vector3(0,-.2,0)),new T.Vector3(0,1,0),0,.4);b.layers.set(7);ray.layers.enable(7);physical.push({hits:ray.intersectObject(b).length,visible:b.visible,castShadow:b.castShadow,geometry:b.geometry.uuid,material:b.material.uuid});}
   add('physical layer0+7 rays still hit every original bulb batch',physical.every(p=>p.hits>0&&p.visible),{physical});
   const masks=[];for(const g of gates){const b=g.meshes[0];cam([-16,-1.38,24],[-16,2.7,25]);g.update(a.camera);const under=b.layers.mask;cam([-16,2,24],[-16,2.7,25]);g.update(a.camera);const above=b.layers.mask;const shadow=new T.OrthographicCamera(-100,100,100,-100,.1,200);shadow.position.set(-16,20,24);shadow.updateMatrixWorld(true);g.update(shadow);const shadowMask=b.layers.mask;b.layers.mask=0x80000000;shadow.layers.enableAll();g.update(shadow);const warm=b.layers.mask;g.update(a.camera);masks.push({under,above,shadowMask,warm,reset:b.layers.mask});}
   add('per-camera restoration, shadow and all-layer warm-up preserve masks',masks.every(m=>m.above===1&&m.shadowMask===1&&m.warm===0x80000000&&m.reset===1),{masks});
   return{R,identity,views,images};
  },Boolean(process.env.BASELINE_REF));
  if(before){const old=JSON.parse(await readFile(`${before}/${profile}.json`));r.R.push({name:'exact concatenated source matrices/order and shared sphere buffers unchanged',ok:r.identity.matrix===old.identity.matrix&&r.identity.count===old.identity.count&&r.identity.geometry.every(g=>JSON.stringify(g)===JSON.stringify(old.identity.geometry[0])),data:{before:old.identity.counts,after:r.identity.counts,matrix:r.identity.matrix}});r.cost=r.views.map((v,i)=>({name:v.name,callsDelta:v.calls-old.views[i].calls,trianglesDelta:v.triangles-old.views[i].triangles,mainCallsDelta:v.main.calls-old.views[i].main.calls,mainTrianglesDelta:v.main.triangles-old.views[i].main.triangles,before:old.views[i],after:v}));}
  for(const i of r.images)await writeFile(`${out}/${profile}-${i.name}.png`,Buffer.from(i.data.split(',')[1],'base64'));delete r.images;await writeFile(`${out}/${profile}.json`,JSON.stringify({...r,errors,external},null,2));for(const q of r.R)console.log(profile,q.ok?'PASS':'FAIL',q.name,JSON.stringify(q.data));assert.deepEqual(errors,[]);assert.deepEqual(external,[]);assert(r.R.every(q=>q.ok));await page.close();
 }
 console.log('ALL PASS');
}finally{await browser.close()}
