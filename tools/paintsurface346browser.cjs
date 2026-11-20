// Public #346: actual public world materials, same frozen daylight/camera, detail off/on; no source images reused.
const{chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const[base='http://localhost:8450',out='docs/verification/346']=process.argv.slice(2);
(async()=>{
 fs.mkdirSync(path.join(out,'before'),{recursive:true});
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const result={views:{},errors:[],external:[],viewport:[960,640],renderer:'Chromium/SwiftShader',checks:{}};
 try{
  const ctx=await browser.newContext({viewport:{width:480,height:320},deviceScaleFactor:1});
  await ctx.route('**/*',r=>{if(!r.request().url().startsWith(base+'/')){result.external.push(r.request().url());return r.abort();}return r.continue();});
  await ctx.addInitScript(()=>{
   const keys=['lunden.avatar','lunden.quality','lunden.changelogSeen','lunden.touchLayout','lunden.paddockGrass'];
   const get=Storage.prototype.getItem,set=Storage.prototype.setItem;keys.forEach(k=>set.call(localStorage,k,'sentinel-346'));
   window.__storageTrace=[];for(const name of['getItem','setItem','removeItem','clear']){const original=Storage.prototype[name];Storage.prototype[name]=function(...args){__storageTrace.push([name,args[0]??null]);return original.apply(this,args);};}
   window.__storageProof=()=>({untouched:keys.every(k=>get.call(localStorage,k)==='sentinel-346'),originalAccess:__storageTrace.filter(([,k])=>String(k).startsWith('lunden.')),trace:__storageTrace});
  });
  const page=await ctx.newPage();page.on('pageerror',e=>result.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')result.errors.push(m.text().slice(0,400));});
  await page.goto(base+'/?keepgeo&nocats&wind=0,0&month=7');
  await page.waitForFunction(()=>window.lundenViewer?.renderer.info.render.frame>0,null,{timeout:300000,polling:500});
  await page.evaluate(async()=>{
   const a=lundenViewer;a.moveTo('home');a.navigation.teleport(.85,0,9.2);
   await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
   a.renderer.setAnimationLoop(null);
   document.querySelector('#intro').hidden=true;document.querySelector('#resume').hidden=true;
  });
  await page.setViewportSize({width:960,height:640});
  result.contract=await page.evaluate(async()=>{
   const a=lundenViewer,P=await import('/src/paintsurface.js'),V=await import('/src/vertexcompile.js'),C=await import('/src/config.js');
   const mats=new Set(),geometry=new Map();a.scene.traverse(o=>{for(const m of[o.material].flat())if(m?.userData.paintSurface)mats.add(m);if(o.geometry)geometry.set(o.geometry.uuid,o.geometry);});
   window.__paintMaterials=[...mats];
   const texture=P.paintTexture(),base=texture.image.data.byteLength;
   const geometrySignature=[...geometry.values()].map(g=>[g.uuid,g.attributes.position?.count,g.index?.count,Object.values(g.attributes).reduce((n,a)=>n+a.array.byteLength,0)]);
   const native=[...mats].every(m=>V.vertexCompileSlack(m)===0);
   const wall=[...mats].filter(m=>m.userData.paintSurface==='wall').length,ceiling=[...mats].filter(m=>m.userData.paintSurface==='ceiling').length;
   return{wall,ceiling,native,texture:{base,nominalMipBytes:87380,size:[texture.image.width,texture.image.height],colorSpace:texture.colorSpace},geometrySignature,fade:[P.paintDetailAt(0),P.paintDetailAt(3),P.paintDetailAt(5)],debug:[P.paintDetailEnabled('?quality=0'),P.paintDetailEnabled('?nopaint'),P.paintDetailEnabled('')],lighting:C.LIGHTING.sky};
  });
  const views={wall:{from:[.85,1.65,9.2],at:[.1,1.8,8.4]},ceiling:{from:[3.05,2.05,8.6],at:[3.2,2.65,10.35]}};
  for(const[name,v]of Object.entries(views)){
   result.views[name]={camera:v};
   await page.evaluate(v=>{const a=lundenViewer;a.camera.position.set(...v.from);a.camera.lookAt(...v.at);a.camera.updateMatrixWorld(true);for(let i=0;i<3;i++)a.renderer.render(a.scene,a.camera);},v);
   for(const enabled of[false,true]){
    const r=await page.evaluate(async enabled=>{
     const a=lundenViewer,p=await import('/src/paintsurface.js');p.paintDetail.value=enabled?1:0;
     for(let i=0;i<2;i++)a.renderer.render(a.scene,a.camera);
     a.renderer.info.reset();a.renderer.render(a.scene,a.camera);
     return{image:a.renderer.domElement.toDataURL(),calls:a.renderer.info.render.calls,triangles:a.renderer.info.render.triangles,textures:a.renderer.info.memory.textures,programs:a.renderer.info.programs.length,enabled:p.paintDetail.value};
    },enabled);
    fs.writeFileSync(path.join(out,enabled?'':'before',name+'.png'),Buffer.from(r.image.split(',')[1],'base64'));delete r.image;
    result.views[name][enabled?'after':'before']=r;
   }
   const a=result.views[name].before,b=result.views[name].after;assert.equal(a.calls,b.calls);assert.equal(a.triangles,b.triangles);assert.equal(a.programs,b.programs);assert.equal(a.textures,b.textures);
  }
  // An unpatched same-material baseline makes shader/texture cost explicit; no geometry or lighting is changed.
  result.unpatched=await page.evaluate(async()=>{
   const a=lundenViewer,P=await import('/src/paintsurface.js'),changes=[],originals=window.__paintMaterials,clones=new Map(originals.map(m=>[m,m.clone()]));
   a.scene.traverse(o=>{if(clones.has(o.material)){changes.push([o,o.material]);o.material=clones.get(o.material);}});
   for(let i=0;i<2;i++)a.renderer.render(a.scene,a.camera);
   const nativeProgramCount=a.renderer.info.programs.length;
   const draws={calls:a.renderer.info.render.calls,triangles:a.renderer.info.render.triangles};
   for(const m of originals)m.dispose();P.paintTexture().dispose();a.renderer.render(a.scene,a.camera);
   const texturesWithoutPaint=a.renderer.info.memory.textures, unpatchedPrograms=a.renderer.info.programs.length;
   for(const[o,m]of changes)o.material=m;P.paintTexture().needsUpdate=true;
   for(const m of clones.values())m.dispose();a.renderer.render(a.scene,a.camera);
   return{draws,nativeProgramCount,unpatchedPrograms,texturesWithoutPaint,restoredTextures:a.renderer.info.memory.textures,restoredPrograms:a.renderer.info.programs.length};
  });
  result.isolation=await page.evaluate(()=>__storageProof());
  result.checks={bothConsumers:result.contract.wall>0&&result.contract.ceiling>0,nativeVertex:result.contract.native,sharedMap:result.contract.texture.base===65536,nearFade:result.contract.fade[0]===1&&result.contract.fade[2]===0,qualityDebug:JSON.stringify(result.contract.debug)==='[false,false,true]',isolation:result.isolation.untouched&&result.isolation.originalAccess.length===0&&result.external.length===0,noErrors:result.errors.length===0};
  assert.ok(Object.values(result.checks).every(Boolean),JSON.stringify(result.checks));
  assert.equal(result.unpatched.draws.calls,result.views.ceiling.after.calls);assert.equal(result.unpatched.draws.triangles,result.views.ceiling.after.triangles);assert.equal(result.unpatched.restoredTextures,result.unpatched.texturesWithoutPaint+1);
  for(const f of['src/paintsurface.js','src/world.js','src/config.js','src/main.js','tools/paintsurfacetest.mjs','tools/paintsurface346browser.cjs'])result.source??={},result.source[f]=crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
  console.log('ALL PASS',JSON.stringify({checks:result.checks,views:result.views,unpatched:result.unpatched}));
 }finally{fs.writeFileSync(path.join(out,'browser.json'),JSON.stringify(result,null,2)+'\n');await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
