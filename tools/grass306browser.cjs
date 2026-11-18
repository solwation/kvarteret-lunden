// #306 (original #2086 3ad5cc7 + #2091 1c3c899): actual public grass consumers before/after in the real app.
// Before = src/grass.js from BASELINE (git show) served in place of the working file; everything else is this checkout.
// node tools/grass306browser.cjs http://localhost:8306 docs/verification/306
const{chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const[base='http://localhost:8306',out='docs/verification/306']=process.argv.slice(2),baseline=process.env.BASELINE||'e262834',hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const W=1280,H=800,VIEWS=[ // x, z, yaw°, pitch°, feet (default: ground), month
 {name:'walk-summer',x:-4,z:22.6,yaw:95,pitch:-18,month:6},
 {name:'court-mid',x:-4,z:22.6,yaw:95,pitch:-7,month:6},
 {name:'park-mid',x:-8,z:52,yaw:200,pitch:-6,month:6},
 {name:'far-summer',x:-8,z:52,yaw:200,pitch:-16,feet:22,month:6},
 {name:'park-winter',x:-8,z:52,yaw:200,pitch:-6,month:1},
];
(async()=>{fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const report={baseline,viewport:[W,H],errors:[],external:[],phases:{},source:{}},images={};
try{for(const phase of['before','after']){
 const ctx=await browser.newContext({viewport:{width:W,height:H},deviceScaleFactor:1});
 if(phase==='before'){const body=execFileSync('git',['show',baseline+':src/grass.js'],{encoding:'utf8'});await ctx.route(/\/src\/grass\.js(\?.*)?$/,r=>r.fulfill({body,contentType:'text/javascript'}));}
 await ctx.route('**/*',r=>{if(new URL(r.request().url()).origin!==new URL(base).origin){report.external.push(r.request().url());return r.abort();}return r.fallback();});
 await ctx.addInitScript(()=>{localStorage.setItem('lunden.drawing','original-drawing-sentinel');localStorage.setItem('lunden.cloud.queue','original-queue-sentinel');sessionStorage.setItem('lunden.session','original-session-sentinel');});
 const page=await ctx.newPage();page.on('pageerror',e=>report.errors.push(phase+': '+e.message));page.on('console',m=>{if(m.type()==='error'||/THREE\.WebGLProgram|GL_INVALID/.test(m.text()))report.errors.push(phase+': '+m.text().slice(0,400));});
 await page.clock.setFixedTime(new Date('2026-06-15T11:00:00Z'));
 await page.goto(base+'/?nocats&cloud=https://ignored.invalid');await page.waitForFunction(()=>window.lundenViewer?.renderer.info.render.frame>2,null,{timeout:300000,polling:250});
 const p={views:[]};images[phase]={};
 for(const v of VIEWS){
  const info=await page.evaluate(async v=>{const A=lundenViewer,S=await import('/src/surroundings.js'),{applySeason}=await import('/src/seasons.js');applySeason(v.month);
   const feet=v.feet??Math.max(S.groundY(v.x,v.z),S.renderedTerrainY(v.x,v.z));A.navigation.teleport(v.x,feet,v.z);A.camera.rotation.set(v.pitch*Math.PI/180,v.yaw*Math.PI/180,0,'YXZ');
   for(let i=0;i<4;i++)await new Promise(r=>requestAnimationFrame(r));A.scene.updateMatrixWorld();A.renderer.render(A.scene,A.camera);const image=A.renderer.domElement.toDataURL('image/png'),r=A.renderer.info;
   return{image,canvas:[A.renderer.domElement.width,A.renderer.domElement.height],calls:r.render.calls,triangles:r.render.triangles,textures:r.memory.textures,geometries:r.memory.geometries,programs:(r.programs||[]).length,camera:A.camera.position.toArray().map(x=>+x.toFixed(2))};},v);
  const png=Buffer.from(info.image.split(',')[1],'base64');delete info.image;images[phase][v.name]=png;if(process.env.RAW)fs.writeFileSync(path.join(process.env.RAW,`${phase}-${v.name}.png`),png);p.views.push({...v,...info,imageSHA256:hash(png)});
 }
 p.texture=await page.evaluate(async()=>{const G=await import('/src/grass.js'),C=await import('/src/config.js'),n=C.GRASS.textureSize,tex=G.grassTexture(),px=tex.image.getContext('2d').getImageData(0,0,n,n).data;
  const lum=(x,y)=>{x=(x+n)%n;y=(y+n)%n;const i=(y*n+x)*4;return px[i]+px[i+1]+px[i+2];};let seam=0,inner=0;for(let i=0;i<n;i++){seam+=Math.abs(lum(n-1,i)-lum(0,i));for(const c of[63,127,191])inner+=Math.abs(lum(c,i)-lum(c+1,i))/3;}
  const blocks=[];for(let by=0;by<8;by++)for(let bx=0;bx<8;bx++){let s=0;for(let y=0;y<n/8;y++)for(let x=0;x<n/8;x++)s+=lum(bx*n/8+x,by*n/8+y);blocks.push(s/(n*n/64)/3);}
  const bm=blocks.reduce((a,b)=>a+b)/64,bsd=Math.sqrt(blocks.reduce((a,b)=>a+(b-bm)**2,0)/64),mc=G.grassMeanColor(),gens=[];
  for(const k of[1,2,3]){const M=await import('/src/grass.js?gen'+k),t=performance.now();M.grassTexture();gens.push(+(performance.now()-t).toFixed(1));}
  return{size:[tex.image.width,tex.image.height],seam:+(seam/n).toFixed(2),interior:+(inner/n).toFixed(2),blockLumSD:+bsd.toFixed(2),mean:[mc.r,mc.g,mc.b].map(x=>+x.toFixed(5)),genMs:gens,wrap:tex.wrapS,repeat:tex.repeat.x};});
 p.storage=await page.evaluate(()=>({sentinels:[localStorage.getItem('lunden.drawing'),localStorage.getItem('lunden.cloud.queue'),sessionStorage.getItem('lunden.session')],keys:Object.keys(localStorage).sort()}));
 report.phases[phase]=p;await ctx.close();
}
const a=report.phases.before,b=report.phases.after;
for(let i=0;i<VIEWS.length;i++)for(const k of['calls','triangles','textures','geometries'])assert.equal(a.views[i][k],b.views[i][k],VIEWS[i].name+' '+k);
for(let i=0;i<VIEWS.length;i++)assert(b.views[i].programs<=a.views[i].programs,VIEWS[i].name+' programs');
for(let k=0;k<3;k++)assert(Math.abs(b.texture.mean[k]/a.texture.mean[k]-1)<1e-3,'grassMeanColor channel '+k);
assert.deepEqual(a.texture.size,b.texture.size);assert(b.texture.blockLumSD>a.texture.blockLumSD*3,'patchier map');assert(b.texture.seam<b.texture.interior*1.25,'seamless');
for(const p of[a,b]){assert.deepEqual(p.storage.sentinels,['original-drawing-sentinel','original-queue-sentinel','original-session-sentinel']);assert(p.storage.keys.every(k=>['lunden.cloud.queue','lunden.drawing'].includes(k)||k.startsWith('kvarteret-lunden.')),'only public storage names');}assert.deepEqual(a.storage.keys,b.storage.keys,'same storage keys');
assert.notEqual(a.views[0].imageSHA256,b.views[0].imageSHA256,'walk view lawn changes');
assert.deepEqual(report.errors,[]);assert.deepEqual(report.external,[]);
const page=await browser.newPage();await page.setContent('<canvas></canvas>');
for(const v of VIEWS){const data=await page.evaluate(async({a,b,name,W,H})=>{const c=document.querySelector('canvas');c.width=2*W;c.height=H+38;const g=c.getContext('2d');g.fillStyle='#f7f7f3';g.fillRect(0,0,c.width,c.height);g.fillStyle='#222';g.font='24px sans-serif';
 for(const[i,src]of[a,b].entries()){const im=new Image();im.src='data:image/png;base64,'+src;await im.decode();if(im.naturalWidth!==W||im.naturalHeight!==H)throw Error('native size');g.drawImage(im,i*W,38);g.fillText((i?'Efter':'Före')+' — '+name,i*W+12,28);}return c.toDataURL('image/jpeg',.9);},{a:images.before[v.name].toString('base64'),b:images.after[v.name].toString('base64'),name:v.name,W,H});
 fs.writeFileSync(path.join(out,v.name+'.jpg'),Buffer.from(data.split(',')[1],'base64'));}
await page.close();
for(const f of['src/grass.js','src/grassdetail.js','src/config.js','tools/grassdetailtest.mjs','tools/grass306browser.cjs'])report.source[f]=hash(fs.readFileSync(f));
fs.writeFileSync(path.join(out,'browser.json'),JSON.stringify(report,null,1));
console.log(JSON.stringify({pass:true,before:{texture:a.texture,views:a.views.map(v=>[v.name,v.calls,v.triangles,v.textures,v.programs,v.imageSHA256.slice(0,12)])},after:{texture:b.texture,views:b.views.map(v=>[v.name,v.calls,v.triangles,v.textures,v.programs,v.imageSHA256.slice(0,12)])}}));
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
