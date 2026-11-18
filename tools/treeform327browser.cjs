// Public #327 (original #2131 184b4fa7): species tree forms in the real public app, before/after.
// Before = BASELINE's foliage.js / surroundings.js / config.js served in place of the working files (treeform.js is then unused).
// Each phase loads once and switches the month in the page (applySeason): July and January, near and far views of the river
// park, the bridge and the courtyard (the camera is aimed at the nearest site tree to a target point; *guess* views).
// Per view: draw calls / triangles of the frame and the scene's tree batches (instances, triangles per instance, near/far LOD).
// node tools/treeform327browser.cjs [base] [out]     BASELINE=<sha> (default: the commit before the port)
const{chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const[base='http://localhost:8347',out='docs/verification/327']=process.argv.slice(2),baseline=process.env.BASELINE||'10c4e34',hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const touched=['foliage','surroundings','config'];
const W=960,H=600,MONTHS=[7,1],VIEWS=[
 // name, target (x, z) whose nearest tree foot is looked at, camera offset from that foot (dx, dz), lift (m)
 {name:'park-near',target:[-20,192],off:[-11,-13]},
 {name:'bridge',target:[-3,117.6],off:[-9,-11]},
 {name:'park-far',target:[-20,192],off:[-60,-80],lift:30},
 {name:'courtyard',target:[-18.5,53.4],off:[1.9,-12]},
];
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
  const info=await page.evaluate(async([v,month])=>{const A=lundenViewer,S=await import('/src/surroundings.js'),{applySeason}=await import('/src/seasons.js');
   applySeason(month);
   let best=null;for(const f of S.treeFeet){const d=Math.hypot(f.x-v.target[0],f.z-v.target[1]);if(!best||d<best.d)best={d,...f};}
   const fx=best.x+v.off[0],fz=best.z+v.off[1],feet=Math.max(S.groundY(fx,fz),S.renderedTerrainY(fx,fz)),dist=Math.hypot(v.off[0],v.off[1]);
   const aim=()=>{A.navigation.teleport(fx,feet,fz);const y=A.navigation.eyeY+(v.lift||0);A.camera.position.set(fx,y,fz);
    A.camera.rotation.set(Math.atan2(best.y+5-y,dist),Math.atan2(-(best.x-fx),-(best.z-fz)),0,'YXZ');A.camera.updateMatrixWorld(true);};
   aim();for(let i=0;i<4;i++)await new Promise(r=>requestAnimationFrame(r));aim();
   const r=A.renderer;r.info.autoReset=false;r.info.reset();r.render(A.scene,A.camera);const image=r.domElement.toDataURL('image/png');
   const o={image,tree:{x:+best.x.toFixed(2),z:+best.z.toFixed(2),kind:best.kind},calls:r.info.render.calls,triangles:r.info.render.triangles,textures:r.info.memory.textures,geometries:r.info.memory.geometries,programs:(r.info.programs||[]).length,camera:A.camera.position.toArray().map(x=>+x.toFixed(2))};r.info.autoReset=true;
   const trees={};A.scene.traverse(m=>{const k=/^tree-(crowns|trunks|birches)( far)?/.exec(m.name);if(!k||!m.isInstancedMesh)return;
    const key=k[1]+(k[2]?'-far':''),tris=(m.geometry.index?m.geometry.index.count:m.geometry.attributes.position.count)/3,e=trees[key]??={meshes:0,instances:0,trianglesPerInstance:tris};e.meshes++;e.instances+=m.count;});
   o.trees=trees;o.forms=S.treeForms?S.treeForms.length:null;
   if(S.treeForms){const c={};for(const f of S.treeForms)c[f.species]=(c[f.species]??0)+1;o.species=c;}
   return o;},[v,month]);
  const png=Buffer.from(info.image.split(',')[1],'base64');delete info.image;images[phase][v.name+month]=png;p.views.push({view:v.name,month,...info,imageSHA256:hash(png)});
 }
 p.storage=await page.evaluate(()=>({sentinel:localStorage.getItem('lunden.sentinel'),keys:Object.keys(localStorage).sort()}));
 report.phases[phase]=p;await ctx.close();
}
const a=report.phases.before,b=report.phases.after,cmp=await browser.newPage();await cmp.setContent('<canvas></canvas>');
const composite=(pa,pb,label)=>cmp.evaluate(async({a,b,label,W,H})=>{const c=document.querySelector('canvas');c.width=2*W;c.height=H+38;const g=c.getContext('2d');g.fillStyle='#f7f7f3';g.fillRect(0,0,c.width,c.height);g.fillStyle='#222';g.font='24px sans-serif';
 for(const[i,src]of[a,b].entries()){const im=new Image();im.src='data:image/png;base64,'+src;await im.decode();if(im.naturalWidth!==W||im.naturalHeight!==H)throw Error('native size');g.drawImage(im,i*W,38);g.fillText((i?'Efter':'Före')+' — '+label,i*W+12,28);}
 const A=g.getImageData(0,38,W,H).data,B=g.getImageData(W,38,W,H).data;let changed=0;for(let k=0;k<A.length;k+=4)if(Math.abs(A[k]-B[k])+Math.abs(A[k+1]-B[k+1])+Math.abs(A[k+2]-B[k+2])>6)changed++;
 return{changed:+(100*changed/(W*H)).toFixed(2),jpg:c.toDataURL('image/jpeg',.88)};},{a:pa.toString('base64'),b:pb.toString('base64'),label,W,H});
const MN={1:'januari',7:'juli'};
for(const v of VIEWS)for(const m of MONTHS){const d=await composite(images.before[v.name+m],images.after[v.name+m],`${v.name}, ${MN[m]}`);
 report.diff[`${v.name}-${m}`]=d.changed;fs.writeFileSync(path.join(out,`${v.name}-m${m}.jpg`),Buffer.from(d.jpg.split(',')[1],'base64'));}
await cmp.close();
fs.writeFileSync(path.join(out,'browser.json'),JSON.stringify(report,null,1)); // written before the assertions, rewritten with sources after
for(let i=0;i<a.views.length;i++){const x=a.views[i],y=b.views[i],n=`${x.view} m${x.month}`;
 assert.deepEqual(x.camera,y.camera,n+' camera');assert(Math.abs(x.calls-y.calls)<=2,n+' draws');assert.equal(y.textures,x.textures,n+' textures');
 for(const k of['crowns','trunks','birches','crowns-far','trunks-far'])assert.equal(y.trees[k]?.meshes,x.trees[k]?.meshes,n+' '+k+' batches');
 assert(y.forms>0&&x.forms===null,n+' treeForms');}
assert(b.views[0].trees.trunks.trianglesPerInstance<=190&&b.views[0].trees['trunks-far'].trianglesPerInstance===32,'trunk budgets');
for(const v of VIEWS)assert(report.diff[`${v.name}-1`]>0.5,`${v.name}: winter trees changed`);
assert.equal(a.storage.sentinel,'kept');assert.equal(b.storage.sentinel,'kept');assert.deepEqual(a.storage.keys,b.storage.keys,'same storage keys');
assert.deepEqual(report.errors,[]);assert.deepEqual(report.external,[]);
for(const f of['src/treeform.js','src/foliage.js','src/surroundings.js','src/config.js','tools/treeformtest.mjs','tools/treeform327browser.cjs'])report.source[f]=hash(fs.readFileSync(f));
fs.writeFileSync(path.join(out,'browser.json'),JSON.stringify(report,null,1));
console.log(JSON.stringify({pass:true,load:[a.loadMs,b.loadMs],diff:report.diff,species:b.views[0].species,forms:b.views[0].forms,
 after:b.views.map(v=>[v.view,v.month,v.tree.kind,v.calls,v.triangles,v.textures,v.programs,JSON.stringify(v.trees)]),before:a.views.map(v=>[v.view,v.month,v.calls,v.triangles,v.textures,v.programs,JSON.stringify(v.trees)])}));
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
