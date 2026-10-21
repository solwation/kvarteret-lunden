// #118: actual public architectural rails; whole source terraces/gables, exact phone merge.
import {chromium} from 'playwright';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
const base=process.argv[2]??'http://localhost:8257',out=process.argv[3]??'/tmp/terrace-rails',before=process.argv[4];
await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,args:['--no-sandbox','--enable-unsafe-swiftshader']});
try {
 for(const [profile,width,height,touch] of [['desktop',1280,800,false],['portrait',390,844,true],['landscape',844,390,true]]) {
  if(process.env.PROFILE&&profile!==process.env.PROFILE)continue;
  const page=await browser.newPage({viewport:{width,height},hasTouch:touch,isMobile:touch,...(touch?{userAgent:'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36'}:{})}),errors=[],external=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(new URL(r.url()).origin!==new URL(base).origin)external.push(r.url())});
  await page.route('**/src/**',async r=>{const path=new URL(r.request().url()).pathname.slice(1);if(!process.env.BASELINE_REF&&path!=='src/main.js'&&path!=='src/paddock.js')return r.continue();let body=process.env.BASELINE_REF?execFileSync('git',['show',process.env.BASELINE_REF+':'+path]).toString():await readFile(path,'utf8');if(path==='src/main.js')body=body.replace('window.lundenViewer = {','window.lundenViewer = { frame, clock,');if(path==='src/paddock.js')body=body.replace('mulberry((Math.random() * 1e9) | 0)','mulberry(11521021)');return r.fulfill({contentType:'text/javascript',body})});
  await page.clock.setFixedTime(new Date('2026-10-21T09:50:00Z'));
  await page.goto(base);await page.waitForFunction(()=>window.lundenViewer?.paddock&&lundenViewer.renderer.info.render.frame>0,null,{timeout:240000});
  const r=await page.evaluate(async baseline=>{
   const a=lundenViewer,T=await import('three'),{lowMemory}=await import('/src/lowmemory.js'),{HUS_L:H}=await import('/src/config.js');
   a.renderer.setAnimationLoop(null);a.clock.getDelta=()=>1/60;document.getElementById('start').click();document.exitPointerLock?.();
   const rails=[];a.scene.traverse(o=>{if(o.name==='terraceRails')rails.push(o)});if(!rails.length)throw Error('Missing architectural rails');
   const root=rails[0].parent,terraces=root.userData.terraces,R=[],add=(name,ok,data={})=>R.push({name,ok,data});
   const hash=async arr=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new Uint8Array(arr.buffer,arr.byteOffset,arr.byteLength))),n=>n.toString(16).padStart(2,'0')).join('');
   const attrs={},sizes={},union=new T.Box3(),bounds=[],flags=[];
   for(const b of rails){b.geometry.computeBoundingBox();b.geometry.computeBoundingSphere();union.union(b.geometry.boundingBox);bounds.push([b.geometry.boundingBox.min.toArray(),b.geometry.boundingBox.max.toArray()]);flags.push({frustumCulled:b.frustumCulled,castShadow:b.castShadow,receiveShadow:b.receiveShadow,layers:b.layers.mask,index:b.geometry.index?Array.from(b.geometry.index.array):null});}
   for(const k of Object.keys(rails[0].geometry.attributes)){
    const first=rails[0].geometry.attributes[k],length=rails.reduce((s,b)=>s+b.geometry.attributes[k].array.length,0),arr=new first.array.constructor(length);let off=0;
    for(const b of rails){const v=b.geometry.attributes[k];if(!v.array.length)throw Error('Freed CPU attribute '+k);arr.set(v.array,off);off+=v.array.length;}
    attrs[k]=await hash(arr);sizes[k]={length,bytes:arr.byteLength,itemSize:first.itemSize,type:arr.constructor.name};
   }
   const m=rails[0].material,material={type:m.type,color:m.color.getHex(),roughness:m.roughness,metalness:m.metalness,side:m.side,opacity:m.opacity,transparent:m.transparent,depthWrite:m.depthWrite,map:!!m.map};
   const identity={lowMemory,attrs,sizes,bounds,union:[union.min.toArray(),union.max.toArray()],material,flags,terraces:terraces.list};
   add('complete desktop source terraces+two gables or exact original phone batch',rails.length===(baseline||lowMemory?1:terraces.list.length+2)&&rails.every(b=>b.material===m&&b.frustumCulled&&b.castShadow&&b.receiveShadow&&b.layers.mask===1&&b.geometry.index===null),{lowMemory,count:rails.length,terraces:terraces.list.length,bounds});
   const deck=terraces.deck,railTop=deck+H.court.rail,D=union.max.z+.07,minX=union.min.x,maxX=union.max.x,first=terraces.list[0],last=terraces.list.at(-1);
   const rays=[];
   // Independent positive traces at regular source handrail intervals, plus both entire gables.
   for(const t of terraces.list)for(const u of[.2,.5,.8]){
    const x=t.x0+(t.x1-t.x0)*u,y=railTop-.02,z=D-.03,ray=new T.Raycaster(new T.Vector3(x,y,z+.5),new T.Vector3(0,0,-1),0,1),hits=ray.intersectObjects(rails);rays.push({kind:t.id,origin:ray.ray.origin.toArray(),hits:hits.length,point:hits[0]?.point.toArray()});
   }
   for(const x of[minX+.03,maxX-.03])for(const u of[.2,.5,.8]){const z=union.min.z+(D-.07-union.min.z)*u,ray=new T.Raycaster(new T.Vector3(x+(x<0?-1:1)*.5,railTop-.02,z),new T.Vector3(x<0?1:-1,0,0),0,1),hits=ray.intersectObjects(rails);rays.push({kind:'gable',origin:ray.ray.origin.toArray(),hits:hits.length,point:hits[0]?.point.toArray()});}
   add('positive physical rails and both gables retain actual source ray hits',rays.every(r=>r.hits>0),{rays});
   // Real independent cameras use ordinary Three frustums; no custom primary-camera gate.
   const cull=[];for(const shadow of[false,true])for(const x of[minX,maxX]){
    const c=shadow?new T.OrthographicCamera(-4,4,4,-4,.1,80):new T.PerspectiveCamera(55,1,.1,80);c.position.set(x,deck+3,D+3);c.lookAt(x,railTop,D-.1);c.updateMatrixWorld(true);c.updateProjectionMatrix();const f=new T.Frustum().setFromProjectionMatrix(new T.Matrix4().multiplyMatrices(c.projectionMatrix,c.matrixWorldInverse));
    cull.push({shadow,x,visible:rails.map(b=>f.intersectsObject(b)),layers:rails.map(b=>b.layers.mask)});
   }
   add('ordinary camera and shadow-camera frustums retain exposed rails with no mask mutation',cull.every(c=>c.visible.some(Boolean)&&c.layers.every(n=>n===1)),{cull,actualPublicShadows:a.renderer.shadowMap.enabled});
   const poses=[['terrace-west',[(first.x0+first.x1)/2,deck+1.62,D-1.1],[(first.x0+first.x1)/2,railTop-.1,D]],['terrace-east',[(last.x0+last.x1)/2,deck+1.62,D-1.1],[(last.x0+last.x1)/2,railTop-.1,D]],['gable-west',[minX+.7,deck+1.62,D-.9],[minX,railTop-.05,D-.9]],['exposed',[2.8,1.62,20],[0,railTop,D-.1]],['cellar',[-16,-1.38,24],[-16,-1.38,29]],['hall',[-45,-1.38,23],[-35,-1.38,23]]],views=[],images=[];
   const render=()=>{const r=a.renderer,draw=r.renderBufferDirect;let calls=0,triangles=0;const owned=[];r.renderBufferDirect=function(...args){const old=r.info.render.triangles,result=draw.apply(this,args);if(!r.getRenderTarget()){const tris=r.info.render.triangles-old;calls++;triangles+=tris;if(rails.includes(args[4]))owned.push({i:rails.indexOf(args[4]),triangles:tris})}return result};try{r.render(a.scene,a.camera)}finally{r.renderBufferDirect=draw}return{calls,triangles,owned}};
   for(const[name,p,target]of poses){a.navigation.teleport(p[0],p[1]-1.62,p[2]);a.camera.position.fromArray(p);a.camera.lookAt(...target);a.camera.updateMatrixWorld(true);a.frame();a.scene.updateMatrixWorld(true);const main=render();views.push({name,eye:a.camera.position.toArray(),feet:a.navigation.pos.toArray(),main});images.push({name,data:a.renderer.domElement.toDataURL('image/png')});}
   add('all actual runtime rails keep original visibility, layers and native frustum behavior',rails.every(b=>b.visible&&b.layers.mask===1&&b.frustumCulled)&&(!lowMemory||rails.length===1),{views});
   return{R,identity,rays,cull,views,images};
  },Boolean(process.env.BASELINE_REF));
  if(before){const old=JSON.parse(await readFile(`${before}/${profile}.json`));r.R.push({name:'exact concatenated ordered attributes,index,bounds,material and original rays preserved',ok:JSON.stringify(r.identity.attrs)===JSON.stringify(old.identity.attrs)&&JSON.stringify(r.identity.sizes)===JSON.stringify(old.identity.sizes)&&JSON.stringify(r.identity.union)===JSON.stringify(old.identity.union)&&JSON.stringify(r.identity.material)===JSON.stringify(old.identity.material)&&JSON.stringify(r.rays)===JSON.stringify(old.rays)&&JSON.stringify(r.identity.terraces)===JSON.stringify(old.identity.terraces),data:{attrs:r.identity.attrs,sizes:r.identity.sizes,union:r.identity.union}});r.R.push({name:'phone retains exact original ordered batch/bounds/flags',ok:!r.identity.lowMemory||JSON.stringify(r.identity)===JSON.stringify(old.identity),data:{lowMemory:r.identity.lowMemory}});r.cost=r.views.map((v,i)=>({name:v.name,callsDelta:v.main.calls-old.views[i].main.calls,trianglesDelta:v.main.triangles-old.views[i].main.triangles,before:old.views[i],after:v}));}
  assert.equal(r.identity.lowMemory,touch,'actual UA must exercise public phone lowMemory');
  for(const img of r.images)await writeFile(`${out}/${profile}-${img.name}.png`,Buffer.from(img.data.split(',')[1],'base64'));delete r.images;await writeFile(`${out}/${profile}.json`,JSON.stringify({...r,errors,external},null,2));for(const q of r.R)console.log(profile,q.ok?'PASS':'FAIL',q.name,JSON.stringify(q.data));assert.deepEqual(errors,[]);assert.deepEqual(external,[]);assert(r.R.every(q=>q.ok));await page.close();
 }
 console.log('ALL PASS');
}finally{await browser.close()}
