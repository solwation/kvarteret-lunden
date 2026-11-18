// #310 (original #2094): actual public patio hedges (world.js patioHedgeMaterial, eight Hus L patios) before/after the
// leaf clumps, summer/winter near and walk views, plus the public-unused entrance boxwood builder as a component view.
// node tools/hedgeclump310browser.cjs [base] [out]; "before" serves BASELINE's hedgeform/boxwood/patiohedge modules.
const{chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const[base='http://localhost:8310',out='docs/verification/310']=process.argv.slice(2),baseline=process.env.BASELINE||'59c0acef3a775e1d608d66dc61ee9e5bce7b9c68',sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const touched=['hedgeform.js','boxwood.js','patiohedge.js'];
// [name, camera position, look-at, month]
const views=[['patio-near-sommar',[3.4,1.7,20.2],[3.4,.65,17.15],7],['patio-walk-sommar',[-1.5,1.62,22.5],[6,.7,17.2],7],
 ['patio-near-vinter',[3.4,1.7,20.2],[3.4,.65,17.15],1],['patio-walk-vinter',[-1.5,1.62,22.5],[6,.7,17.2],1]];
(async()=>{fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const proof={baseline,viewport:[1280,800],phases:{}};
try{for(const phase of['before','after']){
 const page=await browser.newPage({viewport:{width:1280,height:800},deviceScaleFactor:1}),errors=[],external=[];
 page.on('request',r=>{if(new URL(r.url()).origin!==new URL(base).origin)external.push(r.url())});page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'||/THREE.WebGLProgram/.test(m.text()))errors.push(m.text())});
 await page.addInitScript(()=>{for(const key of['lunden.drawing','lunden.layout','lunden.resume','lunden.session'])for(const store of[localStorage,sessionStorage])store.setItem(key,'unchanged-sentinel');window.__storeBefore=JSON.stringify([Object.entries(localStorage),Object.entries(sessionStorage)]);
  let viewer;Object.defineProperty(window,'lundenViewer',{get:()=>viewer,set:v=>{viewer=v;v.renderer.setAnimationLoop=()=>{};}});});
 if(phase==='before')for(const f of touched){const body=execFileSync('git',['show',`${baseline}:src/${f}`]);await page.route('**/src/'+f,r=>r.fulfill({contentType:'text/javascript',body}));}
 await page.goto(base);await page.waitForFunction(()=>window.lundenViewer&&document.getElementById('start').disabled===false,null,{timeout:240000,polling:200});await page.locator('#start').click();
 const res={views:{}};
 for(const[name,pos,look,month]of views){
  res.views[name]=await page.evaluate(async({pos,look,month})=>{const v=lundenViewer,season=await import('./src/seasons.js');document.getElementById('resume').hidden=true;season.applySeason(month);
   v.camera.position.set(...pos);v.camera.lookAt(...look);v.camera.updateMatrixWorld(true);v.scene.updateMatrixWorld(true);v.renderer.info.reset();v.renderer.render(v.scene,v.camera);
   const hedges=[];v.scene.traverse(o=>{if(o.isMesh&&o.material?.name==='patio-hedge'){const p=o.geometry.attributes.position.array;let h=0;for(let i=0;i<p.length;i+=7)h=(h*31+Math.round(p[i]*1000))|0;hedges.push({vertices:o.geometry.attributes.position.count,hash:h,map:!!o.material.map,key:o.material.customProgramCacheKey()});}});
   const i=v.renderer.info;return{hedges,calls:i.render.calls,triangles:i.render.triangles,textures:i.memory.textures,programs:i.programs.length,lights:v.scene.children.filter(o=>o.isLight).length,programErrors:i.programs.filter(p=>p.diagnostics?.runnable===false).length};},{pos,look,month});
  await page.screenshot({path:path.join(out,`${name}-${phase}.jpg`),type:'jpeg',quality:90});
 }
 // Entrance boxwood: public has the builder (boxwood.js) but no production consumer; render it as a component.
 res.boxwood=await page.evaluate(async()=>{const v=lundenViewer,T=await import('three'),C=await import('./src/config.js'),{boxwood}=await import('./src/boxwood.js'),season=await import('./src/seasons.js');season.applySeason(7);
  const spec={...C.SITE.life.strip.hedge,parts:[[0,3.2],[4.5,7.7]],z:0,gaps:[[1.2,2]]},group=boxwood(spec),sc=new T.Scene();sc.background=new T.Color(0xd2dce1);sc.add(new T.HemisphereLight(0xffffff,0x606b51,2));const sun=new T.DirectionalLight(0xffffff,2);sun.position.set(2,4,3);sc.add(sun,group);
  v.camera.position.set(6.1,1.05,1.3);v.camera.lookAt(6.1,.3,0);v.camera.updateMatrixWorld(true);v.renderer.info.reset();v.renderer.render(sc,v.camera);const body=group.children[0];return{calls:v.renderer.info.render.calls,vertices:body.geometry.attributes.position.count,key:body.material.customProgramCacheKey()};});
 await page.screenshot({path:path.join(out,`boxwood-komponent-sommar-${phase}.jpg`),type:'jpeg',quality:90});
 res.storageSame=await page.evaluate(()=>window.__storeBefore===JSON.stringify([Object.entries(localStorage),Object.entries(sessionStorage)]));
 res.errors=errors;res.external=external;proof.phases[phase]=res;await page.close();
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);assert.equal(res.storageSame,true);
}
const a=proof.phases.before,b=proof.phases.after;
for(const[name]of views){const x=a.views[name],y=b.views[name];for(const k of['calls','triangles','textures','lights'])assert.equal(y[k],x[k],name+':'+k);assert.equal(y.programErrors,0);
 assert.deepEqual(y.hedges.map(h=>[h.vertices,h.hash,h.map]),x.hedges.map(h=>[h.vertices,h.hash,h.map]),name+': hedge geometry');assert.ok(y.hedges.every(h=>h.key==='hedge-form-2094')&&x.hedges.every(h=>h.key==='hedge-form-1143'));}
assert.equal(b.boxwood.calls,a.boxwood.calls);assert.equal(b.boxwood.vertices,a.boxwood.vertices);assert.equal(b.boxwood.key,'hedge-form-2094');
proof.sourceSha256=Object.fromEntries(['src/hedgeclump.js','src/hedgeform.js','src/boxwood.js','src/patiohedge.js','src/config.js','tools/hedgeclumptest.mjs','tools/hedgeclump310browser.cjs'].map(f=>[f,sha(fs.readFileSync(f))]));
fs.writeFileSync(path.join(out,'browser.json'),JSON.stringify(proof,null,1)+'\n');console.log(JSON.stringify({pass:true,views:Object.fromEntries(Object.entries(b.views).map(([n,v])=>[n,{calls:v.calls,triangles:v.triangles,textures:v.textures,programs:[a.views[n].programs,v.programs],hedges:v.hedges.length}])),boxwood:[a.boxwood,b.boxwood]}));
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
