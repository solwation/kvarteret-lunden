// Public #308 (original #2088 0c5f4a5 + #2093 9da798a): the actual public roofs (Hus L, Å-husen A/B/C, school, backdrops)
// before/after in the real app, summer and winter, from above and from the street. Before = BASELINE's versions of the
// touched modules (git show) served in place of the working files; everything else is this checkout.
// node tools/roofsurface308browser.cjs http://localhost:8308 docs/verification/308
const{chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const[base='http://localhost:8308',out='docs/verification/308']=process.argv.slice(2),baseline=process.env.BASELINE||'345bce1',hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const touched=['config.js','exterior.js','sitebackdrop.js','southbackdrop.js','surroundings.js','schoolfacade.js'];
const W=1280,H=800,VIEWS=[ // x, z, yaw°, pitch°, feet (default: ground), month; *guess* views over the probed roofs
 {name:'tak-L-sommar',x:-6,z:-6,yaw:200,pitch:-38,feet:22,month:6},
 {name:'tak-L-vinter',x:-6,z:-6,yaw:200,pitch:-38,feet:22,month:1},
 {name:'tak-A-sommar',x:0,z:20,yaw:180,pitch:-34,feet:30,month:6},
 {name:'tak-A-vinter',x:0,z:20,yaw:180,pitch:-34,feet:30,month:1},
 {name:'gata-sommar',x:-12,z:-13,yaw:172,pitch:10,month:6},
];
(async()=>{fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const report={baseline,viewport:[W,H],errors:[],external:[],phases:{},source:{}},images={};
try{for(const phase of['before','after']){
 const ctx=await browser.newContext({viewport:{width:W,height:H},deviceScaleFactor:1});
 await ctx.route('**/*',r=>{const u=r.request().url();if(new URL(u).origin!==new URL(base).origin){report.external.push(u);return r.abort();}
  const f=new URL(u).pathname.match(/^\/src\/([a-z0-9]+\.js)$/);if(phase==='before'&&f&&touched.includes(f[1]))return r.fulfill({contentType:'text/javascript',body:execFileSync('git',['show',`${baseline}:src/${f[1]}`])});return r.continue();});
 await ctx.addInitScript(()=>{try{localStorage.setItem('kvarteret-lunden.sentinel','kept');}catch{}});
 const page=await ctx.newPage();page.on('pageerror',e=>report.errors.push(phase+': '+e.message));page.on('console',m=>{if(m.type()==='error'||/THREE\.WebGLProgram|GL_INVALID/.test(m.text()))report.errors.push(phase+': '+m.text().slice(0,400));});
 await page.clock.setFixedTime(new Date('2026-06-15T11:00:00Z'));
 const t0=Date.now();await page.goto(base+'/?nocats&keepgeo');await page.waitForFunction(()=>window.lundenViewer?.renderer.info.render.frame>2&&lundenViewer.scene.getObjectByName('south-roof'),null,{timeout:300000,polling:500});
 const p={loadMs:Date.now()-t0,views:[]};images[phase]={};
 await page.evaluate(()=>{document.getElementById('start')?.click();document.exitPointerLock?.();const r=document.getElementById('resume');if(r)r.hidden=true;});
 p.roofs=await page.evaluate(()=>{const s=lundenViewer.scene,out=[];let meshes=0;s.traverse(o=>{if(o.isMesh||o.isInstancedMesh)meshes++;if(!o.isMesh)return;const m=[].concat(o.material)[0];
  const hex=m?.color?.getHexString?.();if(!(m?.map?.name==='roof-surface'||/(^|-)(roof|schoolRoof|karpRoof)$|hepcat-roof/.test(o.name)||(!m.map&&['4b5157','6d7175','5c6369','2c3034','33383c'].includes(hex))))return;
  o.geometry.computeBoundingBox();const b=o.geometry.boundingBox;out.push({name:(o.parent?.name||'?')+'/'+(o.name||'?'),vertices:o.geometry.attributes.position.count,uv:!!o.geometry.attributes.uv,map:m.map?.name||null,vertexColors:m.vertexColors,box:[b.min.toArray().map(Math.round),b.max.toArray().map(Math.round)]});});
  return{meshes,list:out.sort((a,b)=>a.name.localeCompare(b.name)||a.vertices-b.vertices)};});
 for(const v of VIEWS){
  const info=await page.evaluate(async v=>{const A=lundenViewer,S=await import('/src/surroundings.js'),{applySeason}=await import('/src/seasons.js');applySeason(v.month);
   const feet=v.feet??Math.max(S.groundY(v.x,v.z),S.renderedTerrainY(v.x,v.z));A.navigation.teleport(v.x,feet,v.z);A.camera.rotation.set(v.pitch*Math.PI/180,v.yaw*Math.PI/180,0,'YXZ');
   for(let i=0;i<4;i++)await new Promise(r=>requestAnimationFrame(r));A.scene.updateMatrixWorld();const r=A.renderer.info;r.autoReset=false;r.reset();A.renderer.render(A.scene,A.camera);
   const res={image:A.renderer.domElement.toDataURL('image/png'),canvas:[A.renderer.domElement.width,A.renderer.domElement.height],calls:r.render.calls,triangles:r.render.triangles,textures:r.memory.textures,geometries:r.memory.geometries,programs:(r.programs||[]).length,camera:A.camera.position.toArray().map(x=>+x.toFixed(2))};r.autoReset=true;return res;},v);
  const png=Buffer.from(info.image.split(',')[1],'base64');delete info.image;images[phase][v.name]=png;p.views.push({...v,...info,imageSHA256:hash(png)});
 }
 p.storage=await page.evaluate(()=>({sentinel:localStorage.getItem('kvarteret-lunden.sentinel'),keys:Object.keys(localStorage).sort()}));
 if(phase==='after')p.mapMs=await page.evaluate(async()=>{const M=await import('/src/roofsurface.js?gen'),t=performance.now();M.roofMap();return +(performance.now()-t).toFixed(1);});
 report.phases[phase]=p;await ctx.close();
}
const a=report.phases.before,b=report.phases.after;
assert.equal(a.roofs.meshes,b.roofs.meshes,'mesh count');
for(let i=0;i<VIEWS.length;i++){for(const k of['calls'])assert.equal(a.views[i][k],b.views[i][k],VIEWS[i].name+' '+k);assert(b.views[i].textures<=a.views[i].textures+1,VIEWS[i].name+' textures');assert(b.views[i].programs<=a.views[i].programs+1,VIEWS[i].name+' programs');}
for(const p of[a,b]){assert.equal(p.storage.sentinel,'kept');assert(p.storage.keys.every(k=>k.startsWith('kvarteret-lunden.')),'only public storage names');}
assert.notEqual(a.views[0].imageSHA256,b.views[0].imageSHA256,'Hus L roof changes');
assert.deepEqual(report.errors,[]);assert.deepEqual(report.external,[]);
const page=await browser.newPage();await page.setContent('<canvas></canvas>');
for(const v of VIEWS){const data=await page.evaluate(async({a,b,name,W,H})=>{const c=document.querySelector('canvas');c.width=2*W;c.height=H+38;const g=c.getContext('2d');g.fillStyle='#f7f7f3';g.fillRect(0,0,c.width,c.height);g.fillStyle='#222';g.font='24px sans-serif';
 for(const[i,src]of[a,b].entries()){const im=new Image();im.src='data:image/png;base64,'+src;await im.decode();if(im.naturalWidth!==W||im.naturalHeight!==H)throw Error('native size');g.drawImage(im,i*W,38);g.fillText((i?'Efter':'Före')+' — '+name,i*W+12,28);}return c.toDataURL('image/jpeg',.88);},{a:images.before[v.name].toString('base64'),b:images.after[v.name].toString('base64'),name:v.name,W,H});
 fs.writeFileSync(path.join(out,v.name+'.jpg'),Buffer.from(data.split(',')[1],'base64'));}
await page.close();
for(const f of['src/roofsurface.js','src/config.js','src/exterior.js','tools/roofsurfacetest.mjs','tools/roofsurface308browser.cjs'])report.source[f]=hash(fs.readFileSync(f));
fs.writeFileSync(path.join(out,'browser.json'),JSON.stringify(report,null,1));
console.log(JSON.stringify({pass:true,load:[a.loadMs,b.loadMs],mapMs:b.mapMs,roofs:b.roofs.list.map(r=>[r.name,r.vertices,r.map,r.uv]),views:VIEWS.map((v,i)=>[v.name,a.views[i].calls,b.views[i].calls,a.views[i].triangles,b.views[i].triangles,a.views[i].textures,b.views[i].textures,a.views[i].programs,b.views[i].programs])}));
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
