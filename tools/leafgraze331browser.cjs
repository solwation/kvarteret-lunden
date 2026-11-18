// Public #331 (original #2133 48c80e0e): leaf cards seen edge-on fade out up close, in the real public app, before/after.
// Before = BASELINE's foliage.js / config.js served in place of the working files. Each phase loads once (June, still air:
// &wind=0,0) and views the river-park tree nearest the bridge: the ordinary park view (as #327's 'bridge') and from under the
// crown at three azimuths, looking up into it from 3–4.5 m (*guess* views). Per view: draw calls / triangles / textures /
// programs and the changed-pixel share; page/shader errors, external requests and a localStorage sentinel are checked.
// node tools/leafgraze331browser.cjs [base] [out]     BASELINE=<sha> (default: origin/main)
const{chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const[base='http://localhost:8351',out='docs/verification/331']=process.argv.slice(2),baseline=process.env.BASELINE||'origin/main',hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const touched=['foliage','config'];
const W=960,H=600,TARGET=[-3,117.6],VIEWS=[
 // name, camera offset from the tree foot (dx, dz), aim height above the foot (m)
 {name:'park',off:[-9,-11],aim:5},
 ...[['under-south',0.3,3.2,8],['under-west',2.2,3.6,8],['under-north',4.1,4.5,6.5]].map(([name,a,d,aim])=>({name,off:[Math.sin(a)*d,Math.cos(a)*d],aim,lean:1.5})),
];
(async()=>{fs.mkdirSync(path.join(out,'before'),{recursive:true});const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const report={baseline:execFileSync('git',['rev-parse',baseline],{encoding:'utf8'}).trim(),viewport:[W,H],errors:[],external:[],phases:{},diff:{},source:{}},images={};
try{for(const phase of['before','after']){
 const ctx=await browser.newContext({viewport:{width:W,height:H},deviceScaleFactor:1});
 await ctx.route('**/*',r=>{const u=r.request().url();if(new URL(u).origin!==new URL(base).origin){report.external.push(u);return r.abort();}
  const f=new URL(u).pathname.match(/^\/src\/([a-z0-9]+)\.js$/);
  if(phase==='before'&&f&&touched.includes(f[1]))return r.fulfill({contentType:'text/javascript',body:execFileSync('git',['show',`${baseline}:src/${f[1]}.js`])});
  return r.continue();});
 await ctx.addInitScript(()=>{try{localStorage.setItem('lunden.sentinel','kept');}catch{}});
 const page=await ctx.newPage();page.on('pageerror',e=>report.errors.push(phase+': '+e.message));page.on('console',m=>{if(m.type()==='error'||/THREE\.WebGLProgram|GL_INVALID|Shader Error/.test(m.text()))report.errors.push(phase+': '+m.text().slice(0,400));});
 await page.clock.setFixedTime(new Date('2026-06-15T11:00:00Z'));
 const t0=Date.now();await page.goto(base+'/?nocats&wind=0,0');
 await page.waitForFunction(()=>window.lundenViewer?.renderer.info.render.frame>2&&lundenViewer.scene.getObjectByName('street-details'),null,{timeout:300000,polling:500});
 await page.evaluate(()=>{document.getElementById('start')?.click();document.exitPointerLock?.();const r=document.getElementById('resume');if(r)r.hidden=true;});
 const p={loadMs:Date.now()-t0,views:[]};images[phase]={};
 for(const v of VIEWS){
  const info=await page.evaluate(async([v,T])=>{const A=lundenViewer,S=await import('/src/surroundings.js');
   let best=null;for(const f of S.treeFeet){const d=Math.hypot(f.x-T[0],f.z-T[1]);if(!best||d<best.d)best={d,...f};}
   const fx=best.x+v.off[0],fz=best.z+v.off[1],feet=Math.max(S.groundY(fx,fz),S.renderedTerrainY(fx,fz));
   const lean=v.lean||0,dir=Math.hypot(v.off[0],v.off[1]),lx=best.x-v.off[0]/dir*lean,lz=best.z-v.off[1]/dir*lean,dist=Math.hypot(lx-fx,lz-fz);
   const aim=()=>{A.navigation.teleport(fx,feet,fz);const y=A.navigation.eyeY;A.camera.position.set(fx,y,fz);
    A.camera.rotation.set(Math.atan2(best.y+v.aim-y,dist),Math.atan2(-(lx-fx),-(lz-fz)),0,'YXZ');A.camera.updateMatrixWorld(true);};
   aim();for(let i=0;i<4;i++)await new Promise(r=>requestAnimationFrame(r));aim();
   const r=A.renderer;r.info.autoReset=false;r.info.reset();r.render(A.scene,A.camera);const image=r.domElement.toDataURL('image/png');
   const o={image,tree:{x:+best.x.toFixed(2),z:+best.z.toFixed(2),kind:best.kind},calls:r.info.render.calls,triangles:r.info.render.triangles,textures:r.info.memory.textures,geometries:r.info.memory.geometries,programs:(r.info.programs||[]).length,camera:A.camera.position.toArray().map(x=>+x.toFixed(2))};r.info.autoReset=true;
   return o;},[v,TARGET]);
  const png=Buffer.from(info.image.split(',')[1],'base64');delete info.image;images[phase][v.name]=png;p.views.push({view:v.name,...info,imageSHA256:hash(png)});
 }
 p.storage=await page.evaluate(()=>({sentinel:localStorage.getItem('lunden.sentinel'),keys:Object.keys(localStorage).sort()}));
 report.phases[phase]=p;await ctx.close();
}
const a=report.phases.before,b=report.phases.after,cmp=await browser.newPage();await cmp.setContent('<canvas></canvas>');
// native-aspect single frames (before/<view>.jpg, <view>.jpg) plus the changed-pixel share
const jpg=(src)=>cmp.evaluate(async({src,W,H})=>{const c=document.querySelector('canvas');c.width=W;c.height=H;const g=c.getContext('2d');const im=new Image();im.src='data:image/png;base64,'+src;await im.decode();if(im.naturalWidth!==W||im.naturalHeight!==H)throw Error('native size');g.drawImage(im,0,0);return{px:Array.from(g.getImageData(0,0,W,H).data.filter((_,k)=>k%4!==3)),jpg:c.toDataURL('image/jpeg',.88)};},{src:src.toString('base64'),W,H});
for(const v of VIEWS){const x=await jpg(images.before[v.name]),y=await jpg(images.after[v.name]);let changed=0;
 for(let k=0;k<x.px.length;k+=3)if(Math.abs(x.px[k]-y.px[k])+Math.abs(x.px[k+1]-y.px[k+1])+Math.abs(x.px[k+2]-y.px[k+2])>6)changed++;
 report.diff[v.name]=+(100*changed/(W*H)).toFixed(2);
 fs.writeFileSync(path.join(out,'before',`${v.name}.jpg`),Buffer.from(x.jpg.split(',')[1],'base64'));fs.writeFileSync(path.join(out,`${v.name}.jpg`),Buffer.from(y.jpg.split(',')[1],'base64'));}
await cmp.close();
fs.writeFileSync(path.join(out,'browser.json'),JSON.stringify(report,null,1)); // written before the assertions, rewritten with sources after
for(let i=0;i<a.views.length;i++){const x=a.views[i],y=b.views[i],n=x.view;
 assert.deepEqual(x.camera,y.camera,n+' camera');assert(Math.abs(x.calls-y.calls)<=1,n+' draws');assert.equal(y.textures,x.textures,n+' textures');
 assert.equal(y.geometries,x.geometries,n+' geometries');assert(report.diff[n]>0.1,n+': the crown changed');}
assert.equal(a.storage.sentinel,'kept');assert.equal(b.storage.sentinel,'kept');assert.deepEqual(a.storage.keys,b.storage.keys,'same storage keys');
assert.deepEqual(report.errors,[]);assert.deepEqual(report.external,[]);
for(const f of['src/foliage.js','src/config.js','tools/leafgrazetest.mjs','tools/leafgraze331browser.cjs'])report.source[f]=hash(fs.readFileSync(f));
fs.writeFileSync(path.join(out,'browser.json'),JSON.stringify(report,null,1));
console.log(JSON.stringify({pass:true,load:[a.loadMs,b.loadMs],diff:report.diff,tree:b.views[0].tree,
 rows:b.views.map((v,i)=>[v.view,a.views[i].calls+'→'+v.calls,a.views[i].triangles+'→'+v.triangles,a.views[i].textures+'→'+v.textures,a.views[i].programs+'→'+v.programs])}));
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
