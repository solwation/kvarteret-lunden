// Public #321 (original #2123 0b2eb36b + cd6fd955): a thin snow cap on narrow upward faces in the snow months — the actual
// public batches (Hus L sills/cappings/copings/rails, the Å-husen A/B/C loggia slabs, parapets, rails and sheet metal, the box
// rails, the courtyard and bus-stop benches) before/after in January, after in July (no change outside the snow months), then
// a phone (`&lowmem`) January probe: only materials with their own compile step (rails, benches) carry the cap.
// Before = BASELINE's versions of the touched modules (git show) served in place of the working files (snowcap.js unused).
// node tools/snowcap321browser.cjs http://localhost:8341 docs/verification/321
const{chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const[base='http://localhost:8341',out='docs/verification/321']=process.argv.slice(2),baseline=process.env.BASELINE||'d310915',hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const touched=['config.js','exterior.js','surroundings.js','courtyard.js','busstop.js'];
const W=1280,H=800,VIEWS=[ // x, z, yaw°, pitch°, eye height over the ground (m): raised eyes look down onto the tops (the original's views, *guess*)
 {name:'husL-gata',x:-6,z:-12,yaw:180,pitch:-30,lift:8.6}, // Hus L's street façade from above the street: sill flashings, loftgång rail
 {name:'husL-tak',x:-6,z:-6,yaw:180,pitch:-35,lift:16.6},  // Hus L's roof edge: the capping ring and copings
 {name:'husA',x:2,z:23,yaw:200,pitch:-30,lift:9.6},        // Hus A from the courtyard: loggia slabs, parapets, rails
 {name:'gard-bankar',x:-30,z:24,yaw:90,pitch:-40,lift:4.6}, // the courtyard benches
];
const PHASES=[['before',1],['after',1],['after-july',7],['phone',1]];
const probe=()=>{const s=lundenViewer.scene,found=[];let meshes=0;s.traverse(o=>{if(o.isMesh||o.isInstancedMesh)meshes++;if(!o.isMesh)return;const m=[].concat(o.material)[0];if(!m?.userData?.snowCap)return;
 o.geometry.computeBoundingBox();const b=o.geometry.boundingBox;found.push({name:o.name||o.parent?.name||null,vertices:o.geometry.attributes.position.count,box:[b.min.toArray().map(Math.round),b.max.toArray().map(Math.round)],key:m.customProgramCacheKey().slice(-50)});});return{meshes,found};};
(async()=>{fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const report={baseline:execFileSync('git',['rev-parse',baseline],{encoding:'utf8'}).trim(),viewport:[W,H],errors:[],external:[],phases:{},source:{}},images={};
try{for(const[phase,month]of PHASES){
 const ctx=await browser.newContext({viewport:{width:W,height:H},deviceScaleFactor:1});
 await ctx.route('**/*',r=>{const u=r.request().url();if(new URL(u).origin!==new URL(base).origin){report.external.push(u);return r.abort();}
  const f=new URL(u).pathname.match(/^\/src\/([a-z0-9]+\.js)$/);if(phase==='before'&&f&&touched.includes(f[1]))return r.fulfill({contentType:'text/javascript',body:execFileSync('git',['show',`${baseline}:src/${f[1]}`],{maxBuffer:1<<26})});return r.continue();});
 await ctx.addInitScript(()=>{try{localStorage.setItem('kvarteret-lunden.sentinel','kept');}catch{}});
 const page=await ctx.newPage();page.on('pageerror',e=>report.errors.push(phase+': '+e.message));page.on('console',m=>{if(m.type()==='error'||/THREE\.WebGLProgram|GL_INVALID/.test(m.text()))report.errors.push(phase+': '+m.text().slice(0,400));});
 await page.clock.setFixedTime(new Date(`2026-${String(month).padStart(2,'0')}-15T12:00:00Z`));
 const t0=Date.now();await page.goto(base+`/?nocats&keepgeo&month=${month}`+(phase==='phone'?'&lowmem':''));await page.waitForFunction(()=>window.lundenViewer?.renderer.info.render.frame>2&&lundenViewer.scene.getObjectByName('south-roof'),null,{timeout:600000,polling:500});
 const p={loadMs:Date.now()-t0,views:[]};images[phase]={};
 await page.evaluate(()=>{document.getElementById('start')?.click();document.exitPointerLock?.();const r=document.getElementById('resume');if(r)r.hidden=true;});
 p.cap=await page.evaluate(probe);
 p.uSnowCap=phase==='before'?null:await page.evaluate(async()=>(await import('/src/snowcap.js')).snowCapUniform.value);
 if(phase!=='phone')for(const v of VIEWS){
  const info=await page.evaluate(async v=>{const A=lundenViewer,S=await import('/src/surroundings.js');
   const feet=Math.max(S.groundY(v.x,v.z),S.renderedTerrainY(v.x,v.z));A.navigation.teleport(v.x,feet,v.z);
   for(let i=0;i<4;i++)await new Promise(r=>requestAnimationFrame(r));A.camera.position.set(v.x,feet+v.lift,v.z);A.camera.rotation.set(v.pitch*Math.PI/180,v.yaw*Math.PI/180,0,'YXZ');
   A.scene.updateMatrixWorld();const r=A.renderer.info;r.autoReset=false;r.reset();A.renderer.render(A.scene,A.camera);
   const res={image:A.renderer.domElement.toDataURL('image/png'),camera:A.camera.position.toArray().map(x=>+x.toFixed(2)),calls:r.render.calls,triangles:r.render.triangles,textures:r.memory.textures,geometries:r.memory.geometries,programs:(r.programs||[]).length};r.autoReset=true;return res;},v);
  const png=Buffer.from(info.image.split(',')[1],'base64');delete info.image;images[phase][v.name]=png;p.views.push({...v,...info,imageSHA256:hash(png)});
 }
 p.storage=await page.evaluate(()=>({sentinel:localStorage.getItem('kvarteret-lunden.sentinel'),keys:Object.keys(localStorage).sort()}));
 report.phases[phase]=p;await ctx.close();
}
const a=report.phases.before,b=report.phases.after,j=report.phases['after-july'],ph=report.phases.phone;
assert.equal(a.cap.found.length,0,'before: no cap');assert.equal(a.cap.meshes,b.cap.meshes,'mesh count');
assert(b.cap.found.length>=14,'capped batches: '+b.cap.found.length);assert.equal(b.uSnowCap,1,'January: on');assert.equal(j.uSnowCap,0,'July: off');assert.equal(ph.uSnowCap,1,'phone January: on');
assert(ph.cap.found.length>0&&ph.cap.found.length<b.cap.found.length&&ph.cap.found.every(f=>/rail-metal|bench-wood/.test(f.key)),'phone: only rails/benches');
for(let i=0;i<VIEWS.length;i++){const x=a.views[i],y=b.views[i];assert.deepEqual(x.camera,y.camera,VIEWS[i].name+' camera');assert(Math.abs(x.calls-y.calls)<=1,VIEWS[i].name+' calls');assert(Math.abs(x.triangles-y.triangles)<=x.triangles*1e-4,VIEWS[i].name+' triangles');assert.equal(x.textures,y.textures,VIEWS[i].name+' textures');}
for(const p of[a,b,j,ph]){assert.equal(p.storage.sentinel,'kept');assert(p.storage.keys.every(k=>k.startsWith('kvarteret-lunden.')),'only public storage names');}
assert.deepEqual(report.errors,[]);assert.deepEqual(report.external,[]);
const page=await browser.newPage();await page.setContent('<canvas></canvas>');report.tone={};
for(const v of VIEWS){const r=await page.evaluate(async({srcs,name,W,H})=>{const c=document.querySelector('canvas');c.width=3*W;c.height=H+38;const g=c.getContext('2d');g.fillStyle='#f7f7f3';g.fillRect(0,0,c.width,c.height);g.fillStyle='#222';g.font='24px sans-serif';const tone=[];
 for(const[i,[label,src]]of srcs.entries()){const im=new Image();im.src='data:image/png;base64,'+src;await im.decode();if(im.naturalWidth!==W||im.naturalHeight!==H)throw Error('native size');g.drawImage(im,i*W,38);
  const d=g.getImageData(i*W,38,W,H).data,s=[0,0,0];for(let k=0;k<d.length;k+=4){s[0]+=d[k];s[1]+=d[k+1];s[2]+=d[k+2];}tone.push(s.map(x=>+(x/(W*H)).toFixed(2)));
  g.fillText(label+' — '+name,i*W+12,28);}return{data:c.toDataURL('image/jpeg',.88),tone};},{srcs:[['Före, januari',images.before[v.name].toString('base64')],['Efter, januari',images.after[v.name].toString('base64')],['Efter, juli',images['after-july'][v.name].toString('base64')]],name:v.name,W,H});
 report.tone[v.name]=r.tone;fs.writeFileSync(path.join(out,v.name+'.jpg'),Buffer.from(r.data.split(',')[1],'base64'));}
await page.close();
for(const f of['src/snowcap.js','src/config.js','src/exterior.js','src/surroundings.js','src/courtyard.js','src/busstop.js','tools/snowcaptest.mjs','tools/snowcap321browser.cjs'])report.source[f]=hash(fs.readFileSync(f));
fs.writeFileSync(path.join(out,'browser.json'),JSON.stringify(report,null,1));
console.log(JSON.stringify({pass:true,load:PHASES.map(([k])=>report.phases[k].loadMs),capped:b.cap.found.map(f=>f.name+':'+f.vertices),phone:ph.cap.found.map(f=>f.name),tone:report.tone,views:VIEWS.map((v,i)=>[v.name,a.views[i].calls,b.views[i].calls,a.views[i].triangles,b.views[i].triangles,a.views[i].textures,b.views[i].textures,a.views[i].programs,b.views[i].programs])}));
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
