// One actual public app; fixed winter/noon, its own camera/ponies/wind, no source replacement.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright'),fs=require('node:fs'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const [base='http://localhost:8448',out='docs/verification/340']=process.argv.slice(2),hash=x=>crypto.createHash('sha256').update(x).digest('hex');
(async()=>{fs.mkdirSync(out+'/before',{recursive:true});const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const report={errors:[],external:[],sockets:[],source:{},viewport:[1000,650]};
try{
 const ctx=await browser.newContext({viewport:{width:1000,height:650},deviceScaleFactor:1});
 await ctx.route('**/*',r=>{if(new URL(r.request().url()).origin!==new URL(base).origin){report.external.push(r.request().url());return r.abort();}return r.continue();});
 await ctx.addInitScript(()=>{
  const get=Storage.prototype.getItem,set=Storage.prototype.setItem,remove=Storage.prototype.removeItem,clear=Storage.prototype.clear,events=[];
  const keys=['lunden.session','lunden.name','unrelated.sentinel','kvarteret-lunden.sentinel'];
  for(const k of keys)set.call(localStorage,k,'synthetic-kept');
  Storage.prototype.getItem=function(k){events.push(['get',String(k)]);return get.call(this,k);};
  Storage.prototype.setItem=function(k,v){events.push(['set',String(k)]);return set.call(this,k,v);};
  Storage.prototype.removeItem=function(k){events.push(['remove',String(k)]);return remove.call(this,k);};
  Storage.prototype.clear=function(){events.push(['clear']);return clear.call(this);};
  window.__isolation={events,read:()=>Object.fromEntries(keys.map(k=>[k,get.call(localStorage,k)]))};
 });
 const page=await ctx.newPage();page.on('pageerror',e=>report.errors.push(e.message));page.on('websocket',s=>report.sockets.push(s.url()));
 page.on('console',m=>{if(m.type()==='error'||/THREE.WebGLProgram|Shader Error|ERROR: 0:/.test(m.text()))report.errors.push(m.text().slice(0,400));});
 const t0=Date.now();await page.goto(base+'/?keepgeo&nocats&month=1&wind=0.2,0');
 await page.waitForFunction(()=>window.lundenViewer?.paddock&&lundenViewer.renderer.info.render.frame>1,null,{timeout:600000});report.loadMs=Date.now()-t0;
 const f=await page.evaluate(()=>{
  const a=lundenViewer,p=a.paddock,q=p.ponies[0],yaw=q.yaw,fx=Math.sin(yaw),fz=Math.cos(yaw);
  const x=q.x+fx*3.8+fz*.8,z=q.z+fz*3.8-fx*.8,y=p.ground(x,z);
  a.navigation.teleport(x,y,z);a.camera.position.set(x,q.y+1.45,z);a.camera.lookAt(q.x,q.y+1.25,q.z);return a.renderer.info.render.frame;
 });
 await page.waitForFunction(f=>lundenViewer.renderer.info.render.frame>f+2,f,{timeout:180000});
 const data=await page.evaluate(async()=>{
  const a=lundenViewer,p=a.paddock,T=await import('three'),S=await import('/src/seasons.js'),W=await import('/src/sitewind.js');
  a.renderer.setAnimationLoop(null);document.querySelector('.intro')?.setAttribute('hidden','');
  p.update(.1);p.breathPuffs.clear();p.ponies.forEach(q=>q.breath={t:0});
  const render=()=>{a.scene.updateMatrixWorld(true);const r=a.renderer;r.info.reset();r.render(a.scene,a.camera);return{image:r.domElement.toDataURL('image/png'),calls:r.info.render.calls,points:r.info.render.points,textures:r.info.memory.textures,geometries:r.info.memory.geometries,programs:r.info.programs.length};};
  const before=render();p.breathe(.1);const cold=render(),n=p.breathPuffs.n;
  const muzzles=p.ponies.map((q,i)=>{const m=new T.Matrix4();p.mesh.getMatrixAt(i,m);return{state:q.state,pos:[q.x,q.y,q.z],neck:q.neck,scale:q.scale};});
  p.breathPuffs.clear();const empty=render();S.applySeason(7);p.breathe(.1);const warm={n:p.breathPuffs.n,visible:p.breathPuffs.points.visible};
  return{before,cold,empty,warm,n,muzzles,camera:a.camera.position.toArray(),wind:{power:W.siteWind.power,dir:W.siteWind.dir.toArray()},pool:{max:p.breathPuffs.pos.count,bytes:p.breathPuffs.pos.array.byteLength+p.breathPuffs.data.array.byteLength,depthTest:p.breathPuffs.points.material.depthTest,depthWrite:p.breathPuffs.points.material.depthWrite},isolation:{sentinels:__isolation.read(),events:__isolation.events}};
 });
 for(const [label,d]of[['before/cold-empty',data.before],['cold-breath',data.cold]]){fs.writeFileSync(out+'/'+label+'.png',Buffer.from(d.image.split(',')[1],'base64'));delete d.image;}
 delete data.empty.image;Object.assign(report,data);
 assert(data.n>0&&data.n<=24);assert.equal(data.cold.calls-data.before.calls,1);assert.equal(data.empty.calls,data.before.calls);assert.equal(data.empty.points,0);assert.equal(data.cold.points,data.n);assert.equal(data.warm.n,0);assert(!data.warm.visible);
 assert.equal(data.cold.textures,data.before.textures);assert(data.pool.depthTest&&!data.pool.depthWrite);assert.equal(data.pool.bytes,576);
 assert.deepEqual(Object.values(data.isolation.sentinels),Array(4).fill('synthetic-kept'));assert(data.isolation.events.every(e=>e[0]!=='clear'&&!e[1]?.startsWith('lunden.')&&!e[1]?.startsWith('unrelated.')));
 for(const file of ['src/ponybreath.js','src/paddock.js','src/config.js','tools/ponybreath340browser.cjs']){const served=await page.request.get(base+'/'+file);assert(served.ok());const local=hash(fs.readFileSync(file));assert.equal(hash(await served.body()),local);report.source[file]=local;}
 assert.deepEqual(report.external,[]);assert.deepEqual(report.errors,[]);assert.deepEqual(report.sockets,[]);report.pass=true;
}finally{await browser.close();fs.writeFileSync(out+'/browser.json',JSON.stringify(report,null,2));}
console.log(JSON.stringify({pass:report.pass,loadMs:report.loadMs,n:report.n,before:report.before,cold:report.cold,empty:report.empty,warm:report.warm}));
})().catch(e=>{console.error(e);process.exitCode=1;});
