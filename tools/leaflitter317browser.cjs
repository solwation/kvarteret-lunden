// Public #317 (original #2105 9113aa3 + #2118 dd9088d0): fallen autumn leaves in the real public app, before/after.
// Before = BASELINE's versions of every changed module served in place of the working files (leaflitter.js is then unused);
// each phase loads once and switches the month in the page (applySeason): July (control), September, October, November, January.
// node tools/leaflitter317browser.cjs [base] [out]      VIEWS: x, z, yaw°, pitch°, feet (default: ground) — *guess* views.
const{chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const[base='http://localhost:8337',out='docs/verification/317']=process.argv.slice(2),baseline=process.env.BASELINE||'ea3d1f2',hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const touched=['main','config','grass','asphaltsurface','gravelsurface','pavingsurface','courtyard','riverpark','sitebackdrop','street','surroundings'];
const W=1200,H=800,MONTHS=[7,9,10,11,1],VIEWS=[
 {name:'courtyard',x:-4,z:22.6,yaw:95,pitch:-18},
 {name:'park',x:-8,z:52,yaw:200,pitch:-12},
 {name:'street',x:-6,z:-28.6,yaw:90,pitch:-14,feet:0},
];
// side-by-side composites written (view → months); every view/month is still rendered and measured
const SHOTS={courtyard:[9,10,11,1],park:[10,11],street:[11]};
(async()=>{fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const report={baseline:execFileSync('git',['rev-parse',baseline],{encoding:'utf8'}).trim(),viewport:[W,H],errors:[],external:[],phases:{},diff:{},source:{}},images={};
try{for(const phase of['before','after']){
 const ctx=await browser.newContext({viewport:{width:W,height:H},deviceScaleFactor:1});
 await ctx.route('**/*',r=>{const u=r.request().url();if(new URL(u).origin!==new URL(base).origin){report.external.push(u);return r.abort();}
  const f=new URL(u).pathname.match(/^\/src\/([a-z0-9]+)\.js$/);
  if(phase==='before'&&f&&touched.includes(f[1]))return r.fulfill({contentType:'text/javascript',body:execFileSync('git',['show',`${baseline}:src/${f[1]}.js`])});
  return r.continue();});
 await ctx.addInitScript(()=>{try{localStorage.setItem('lunden.sentinel','kept');}catch{}});
 const page=await ctx.newPage();page.on('pageerror',e=>report.errors.push(phase+': '+e.message));page.on('console',m=>{if(m.type()==='error'||/THREE\.WebGLProgram|GL_INVALID/.test(m.text()))report.errors.push(phase+': '+m.text().slice(0,400));});
 await page.clock.setFixedTime(new Date('2026-06-15T11:00:00Z'));
 const t0=Date.now();await page.goto(base+'/?nocats');
 await page.waitForFunction(()=>window.lundenViewer?.renderer.info.render.frame>2&&lundenViewer.scene.getObjectByName('street-details'),null,{timeout:300000,polling:500});
 await page.evaluate(()=>{document.getElementById('start')?.click();document.exitPointerLock?.();const r=document.getElementById('resume');if(r)r.hidden=true;});
 const p={loadMs:Date.now()-t0,views:[]};images[phase]={};
 for(const v of VIEWS)for(const month of MONTHS){
  const info=await page.evaluate(async([v,month,after])=>{const A=lundenViewer,S=await import('/src/surroundings.js'),{applySeason}=await import('/src/seasons.js');
   const t=performance.now();applySeason(month);const seasonMs=performance.now()-t;
   const feet=v.feet??Math.max(S.groundY(v.x,v.z),S.renderedTerrainY(v.x,v.z));A.navigation.teleport(v.x,feet,v.z);A.camera.rotation.set(v.pitch*Math.PI/180,v.yaw*Math.PI/180,0,'YXZ');
   for(let i=0;i<4;i++)await new Promise(r=>requestAnimationFrame(r));
   A.navigation.teleport(v.x,feet,v.z);A.camera.position.set(v.x,A.navigation.eyeY,v.z);A.camera.rotation.set(v.pitch*Math.PI/180,v.yaw*Math.PI/180,0,'YXZ');A.camera.updateMatrixWorld(true);
   const r=A.renderer;r.info.autoReset=false;r.info.reset();r.render(A.scene,A.camera);const image=r.domElement.toDataURL('image/png');
   const o={image,calls:r.info.render.calls,triangles:r.info.render.triangles,textures:r.info.memory.textures,geometries:r.info.memory.geometries,programs:(r.info.programs||[]).length,camera:A.camera.position.toArray().map(x=>+x.toFixed(2)),seasonMs:+seasonMs.toFixed(1)};r.info.autoReset=true;
   let patched=0,lite=0;A.scene.traverse(m=>{if(m.isMesh&&!Array.isArray(m.material)&&m.material.userData?.leafLitter){patched++;if(/-lite$/.test(m.material.customProgramCacheKey()))lite++;}});o.patched=patched;o.lite=lite;
   if(after){const L=await import('/src/leaflitter.js'),U=L.litterUniforms,img=U.uLitterMap.value.image;o.litter=U.uLitter.value.toArray().map(x=>+x.toFixed(3));o.map=[img.width,img.height];}
   const leaf=A.scene.getObjectByName('street-details')?.children.find(c=>c.isInstancedMesh&&c.geometry.type==='CircleGeometry');o.streetLeaves=leaf?{visible:leaf.visible,count:leaf.count}:null;
   return o;},[v,month,phase==='after']);
  const png=Buffer.from(info.image.split(',')[1],'base64');delete info.image;images[phase][v.name+month]=png;p.views.push({view:v.name,month,...info,imageSHA256:hash(png)});
 }
 p.storage=await page.evaluate(()=>({sentinel:localStorage.getItem('lunden.sentinel'),keys:Object.keys(localStorage).sort()}));
 report.phases[phase]=p;await ctx.close();
}
const a=report.phases.before,b=report.phases.after,cmp=await browser.newPage();await cmp.setContent('<canvas></canvas>');
const composite=(pa,pb,label,write)=>cmp.evaluate(async({a,b,label,W,H,write})=>{const c=document.querySelector('canvas');c.width=2*W;c.height=H+38;const g=c.getContext('2d');g.fillStyle='#f7f7f3';g.fillRect(0,0,c.width,c.height);g.fillStyle='#222';g.font='24px sans-serif';
 for(const[i,src]of[a,b].entries()){const im=new Image();im.src='data:image/png;base64,'+src;await im.decode();if(im.naturalWidth!==W||im.naturalHeight!==H)throw Error('native size');g.drawImage(im,i*W,38);g.fillText((i?'Efter':'Före')+' — '+label,i*W+12,28);}
 const A=g.getImageData(0,38,W,H).data,B=g.getImageData(W,38,W,H).data;let changed=0;for(let k=0;k<A.length;k+=4)if(Math.abs(A[k]-B[k])+Math.abs(A[k+1]-B[k+1])+Math.abs(A[k+2]-B[k+2])>6)changed++;
 return{changed:+(100*changed/(W*H)).toFixed(2),jpg:write?c.toDataURL('image/jpeg',.88):null};},{a:pa.toString('base64'),b:pb.toString('base64'),label,W,H,write});
const MN={1:'januari',7:'juli',9:'september',10:'oktober',11:'november'};
for(const v of VIEWS)for(const m of MONTHS){const write=SHOTS[v.name]?.includes(m),d=await composite(images.before[v.name+m],images.after[v.name+m],`${v.name}, ${MN[m]}`,write);
 report.diff[`${v.name}-${m}`]=d.changed;if(write)fs.writeFileSync(path.join(out,`${v.name}-m${m}.jpg`),Buffer.from(d.jpg.split(',')[1],'base64'));}
await cmp.close();
fs.writeFileSync(path.join(out,'browser.json'),JSON.stringify(report,null,1)); // written before the assertions, rewritten with sources after
for(let i=0;i<a.views.length;i++){const x=a.views[i],y=b.views[i],n=`${x.view} m${x.month}`;
 assert(Math.abs(x.calls-y.calls)<=1,n+' draws');assert.deepEqual(x.camera,y.camera,n+' camera');const x0=a.views[i-(i%MONTHS.length)],y0=b.views[i-(i%MONTHS.length)];assert((y.textures-y0.textures)-(x.textures-x0.textures)<=1,n+' textures: +1 density map at most over the same month switch before');
 assert.equal(x.patched,0);assert(y.patched>0,n+' patched meshes');assert.equal(y.lite,0,'desktop: full shaders');}
for(const v of VIEWS){for(const m of[7,1])assert(report.diff[`${v.name}-${m}`]<0.5,`${v.name} m${m}: no litter out of season`);assert(report.diff[`${v.name}-11`]>report.diff[`${v.name}-9`],`${v.name}: more in November than September`);}
assert.equal(a.storage.sentinel,'kept');assert.equal(b.storage.sentinel,'kept');assert.deepEqual(a.storage.keys,b.storage.keys,'same storage keys');
assert.deepEqual(report.errors,[]);assert.deepEqual(report.external,[]);
for(const f of['src/leaflitter.js','src/config.js','tools/leaflittertest.mjs','tools/leaflitter317browser.cjs'])report.source[f]=hash(fs.readFileSync(f));
fs.writeFileSync(path.join(out,'browser.json'),JSON.stringify(report,null,1));
console.log(JSON.stringify({pass:true,load:[a.loadMs,b.loadMs],diff:report.diff,after:b.views.map(v=>[v.view,v.month,v.calls,v.triangles,v.textures,v.programs,v.patched,v.litter,v.map,v.streetLeaves?.count,v.seasonMs]),before:a.views.map(v=>[v.view,v.month,v.calls,v.triangles,v.textures,v.programs])}));
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
