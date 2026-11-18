// Public #320 (original #2122 bc054abc + c6093091, #2134 8ca2cde5): moss low on the shaded north faces — the actual public wall
// batches (Hus L brick, the Å-husen A/B/C brick façades, plinths and white render, the brick retaining walls, the park
// stairs) before/after in the real app by day, near and at distance; then a phone (`&lowmem`) pass: no attribute, no variant.
// Before = BASELINE's versions of the touched modules (git show) served in place of the working files (shademoss.js unused).
// node tools/shademoss320browser.cjs http://localhost:8340 docs/verification/320
const{chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const[base='http://localhost:8340',out='docs/verification/320']=process.argv.slice(2),baseline=process.env.BASELINE||'d190248',hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const touched=['config.js','exterior.js','surroundings.js'];
const W=1280,H=800,VIEWS=[ // x, z, yaw° (180 looks south, +z, at a north face), pitch°; the original #2122's views (*guess*)
 {name:'husL-nara',x:-8,z:-2.6,yaw:160,pitch:-22}, // Hus L's north brick, near: the foot of the street façade
 {name:'husL-gata',x:-6,z:-16,yaw:180,pitch:-2},   // the same façade at street distance
 {name:'husA-nord',x:2,z:23,yaw:200,pitch:-6},     // Hus A's north face from the courtyard
 {name:'husB-nord',x:-32,z:27,yaw:180,pitch:-4},   // Hus B's north face
 {name:'husC-nord',x:-61,z:4,yaw:180,pitch:-4},    // Hus C's north face
];
const probe=()=>{const s=lundenViewer.scene,found=[];let meshes=0;s.traverse(o=>{if(o.isMesh||o.isInstancedMesh)meshes++;if(!o.isMesh)return;const m=[].concat(o.material)[0];
 const a=o.geometry.attributes.mossHeight;if(!a&&!m?.userData?.shadeMoss)return;let lo=Infinity,hi=-Infinity,low=0;if(a)for(const v of a.array){lo=Math.min(lo,v);hi=Math.max(hi,v);if(v-100<1.3)low++;}
 o.geometry.computeBoundingBox();const b=o.geometry.boundingBox;
 found.push({name:o.name||null,kind:m.userData.shadeMoss??null,vertices:o.geometry.attributes.position.count,bytes:a?a.array.byteLength:0,lowVertices:low,height:[+(lo-100).toFixed(2),+(hi-100).toFixed(2)],box:[b.min.toArray().map(Math.round),b.max.toArray().map(Math.round)],key:m.customProgramCacheKey().slice(-30)});});
 return{meshes,found};};
(async()=>{fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const report={baseline:execFileSync('git',['rev-parse',baseline],{encoding:'utf8'}).trim(),viewport:[W,H],errors:[],external:[],phases:{},source:{}},images={};
try{for(const phase of['before','after','phone']){
 const ctx=await browser.newContext({viewport:{width:W,height:H},deviceScaleFactor:1});
 await ctx.route('**/*',r=>{const u=r.request().url();if(new URL(u).origin!==new URL(base).origin){report.external.push(u);return r.abort();}
  const f=new URL(u).pathname.match(/^\/src\/([a-z0-9]+\.js)$/);if(phase==='before'&&f&&touched.includes(f[1]))return r.fulfill({contentType:'text/javascript',body:execFileSync('git',['show',`${baseline}:src/${f[1]}`],{maxBuffer:1<<26})});return r.continue();});
 await ctx.addInitScript(()=>{try{localStorage.setItem('kvarteret-lunden.sentinel','kept');}catch{}});
 const page=await ctx.newPage();page.on('pageerror',e=>report.errors.push(phase+': '+e.message));page.on('console',m=>{if(m.type()==='error'||/THREE\.WebGLProgram|GL_INVALID/.test(m.text()))report.errors.push(phase+': '+m.text().slice(0,400));});
 await page.clock.setFixedTime(new Date('2026-07-15T11:00:00Z'));
 const t0=Date.now();await page.goto(base+'/?nocats&keepgeo'+(phase==='phone'?'&lowmem':''));await page.waitForFunction(()=>window.lundenViewer?.renderer.info.render.frame>2&&lundenViewer.scene.getObjectByName('south-roof'),null,{timeout:600000,polling:500});
 const p={loadMs:Date.now()-t0,views:[]};images[phase]={};
 await page.evaluate(()=>{document.getElementById('start')?.click();document.exitPointerLock?.();const r=document.getElementById('resume');if(r)r.hidden=true;});
 p.moss=await page.evaluate(probe);
 if(phase!=='phone')for(const v of VIEWS){
  const info=await page.evaluate(async v=>{const A=lundenViewer,S=await import('/src/surroundings.js');
   const feet=Math.max(S.groundY(v.x,v.z),S.renderedTerrainY(v.x,v.z));A.navigation.teleport(v.x,feet,v.z);A.camera.rotation.set(v.pitch*Math.PI/180,v.yaw*Math.PI/180,0,'YXZ');
   for(let i=0;i<4;i++)await new Promise(r=>requestAnimationFrame(r));A.scene.updateMatrixWorld();const r=A.renderer.info;r.autoReset=false;r.reset();A.renderer.render(A.scene,A.camera);
   const res={image:A.renderer.domElement.toDataURL('image/png'),camera:A.camera.position.toArray().map(x=>+x.toFixed(2)),calls:r.render.calls,triangles:r.render.triangles,textures:r.memory.textures,geometries:r.memory.geometries,programs:(r.programs||[]).length};r.autoReset=true;return res;},v);
  const png=Buffer.from(info.image.split(',')[1],'base64');delete info.image;images[phase][v.name]=png;p.views.push({...v,...info,imageSHA256:hash(png)});
 }
 p.storage=await page.evaluate(()=>({sentinel:localStorage.getItem('kvarteret-lunden.sentinel'),keys:Object.keys(localStorage).sort()}));
 report.phases[phase]=p;await ctx.close();
}
const a=report.phases.before,b=report.phases.after,ph=report.phases.phone;
assert.equal(a.moss.found.length,0,'before: no moss');assert.equal(a.moss.meshes,b.moss.meshes,'mesh count');
const kinds=b.moss.found.map(f=>f.kind).sort();assert.deepEqual(kinds,['bump','bump','map','map','plain','plain'],'6 mossy batches: Hus L brick, A/B/C white render, A/B/C brick (the old grid batch is empty, as in the original), retaining walls, plinths, stairs');
assert(b.moss.found.every(f=>f.lowVertices>0&&f.bytes===f.vertices*4),'each batch has low vertices and one float per vertex');
assert.equal(ph.moss.found.length,0,'phone: no attribute, no variant');
for(let i=0;i<VIEWS.length;i++){const x=a.views[i],y=b.views[i];assert.deepEqual(x.camera,y.camera,VIEWS[i].name+' camera');assert(Math.abs(x.calls-y.calls)<=1,VIEWS[i].name+' calls');assert(Math.abs(x.triangles-y.triangles)<=x.triangles*1e-4,VIEWS[i].name+' triangles');assert.equal(x.textures,y.textures,VIEWS[i].name+' textures');assert(y.programs<=x.programs+5,VIEWS[i].name+' programs');}
for(const p of[a,b,ph]){assert.equal(p.storage.sentinel,'kept');assert(p.storage.keys.every(k=>k.startsWith('kvarteret-lunden.')),'only public storage names');}
assert.deepEqual(report.errors,[]);assert.deepEqual(report.external,[]);
const page=await browser.newPage();await page.setContent('<canvas></canvas>');report.tone={};
for(const v of VIEWS){const r=await page.evaluate(async({a,b,name,W,H})=>{const c=document.querySelector('canvas');c.width=2*W;c.height=H+38;const g=c.getContext('2d');g.fillStyle='#f7f7f3';g.fillRect(0,0,c.width,c.height);g.fillStyle='#222';g.font='24px sans-serif';const tone=[];
 for(const[i,src]of[a,b].entries()){const im=new Image();im.src='data:image/png;base64,'+src;await im.decode();if(im.naturalWidth!==W||im.naturalHeight!==H)throw Error('native size');g.drawImage(im,i*W,38);
  const d=g.getImageData(i*W,38,W,H).data,s=[0,0,0];for(let k=0;k<d.length;k+=4){s[0]+=d[k];s[1]+=d[k+1];s[2]+=d[k+2];}tone.push(s.map(x=>+(x/(W*H)).toFixed(2)));
  g.fillText((i?'Efter':'Före')+' — '+name,i*W+12,28);}return{data:c.toDataURL('image/jpeg',.88),tone};},{a:images.before[v.name].toString('base64'),b:images.after[v.name].toString('base64'),name:v.name,W,H});
 report.tone[v.name]=r.tone;fs.writeFileSync(path.join(out,v.name+'.jpg'),Buffer.from(r.data.split(',')[1],'base64'));
 for(let k=0;k<3;k++)assert(Math.abs(r.tone[1][k]-r.tone[0][k])<=r.tone[0][k]*0.02,v.name+' mean frame tone within 2 %');}
await page.close();
for(const f of['src/shademoss.js','src/config.js','src/exterior.js','src/surroundings.js','tools/shademosstest.mjs','tools/shademoss320browser.cjs'])report.source[f]=hash(fs.readFileSync(f));
fs.writeFileSync(path.join(out,'browser.json'),JSON.stringify(report,null,1));
console.log(JSON.stringify({pass:true,load:[a.loadMs,b.loadMs,ph.loadMs],moss:b.moss.found,tone:report.tone,views:VIEWS.map((v,i)=>[v.name,a.views[i].calls,b.views[i].calls,a.views[i].triangles,b.views[i].triangles,a.views[i].textures,b.views[i].textures,a.views[i].programs,b.views[i].programs])}));
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
