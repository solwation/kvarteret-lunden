// #293: one public browser run, matched real buildExterior source/inputs, images and opening/budget contracts.
const { chromium }=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const [base='http://localhost:8189',out='docs/verification/293']=process.argv.slice(2),baseline='49af0d2';
const sha=x=>crypto.createHash('sha256').update(Buffer.isBuffer(x)||typeof x==='string'?x:JSON.stringify(x)).digest('hex');
(async()=>{fs.mkdirSync(out,{recursive:true});const b=await chromium.launch({executablePath:process.env.CHROME_PATH,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const proof={baseline,renderer:'Chromium / SwiftShader',viewport:[1200,800],errors:[],external:[],phases:{},source:{}};const images={};
try{
 for(const phase of ['before','after']){
  const p=await b.newPage({viewport:{width:1200,height:800}});p.on('pageerror',e=>proof.errors.push(phase+': '+e.message));p.on('console',m=>{if(m.type()==='error'||/THREE.WebGLProgram/.test(m.text()))proof.errors.push(phase+': '+m.text())});
  p.on('request',r=>{if(new URL(r.url()).origin!==new URL(base).origin)proof.external.push(r.url())});
  await p.addInitScript(()=>{localStorage.setItem('lunden.drawing','original-drawing-sentinel');localStorage.setItem('lunden.cloud.queue','original-queue-sentinel');sessionStorage.setItem('lunden.session','original-session-sentinel')});
  if(phase==='before')await p.route('**/src/exterior.js',r=>r.fulfill({contentType:'text/javascript',body:execFileSync('git',['show',baseline+':src/exterior.js'])}));
  await p.goto(base+'/tools/bricksurface293.html');await p.waitForFunction(()=>window.__ready,null,{timeout:120000});
  const inv=await p.evaluate(()=>window.__invariants()),geometry=sha(inv.geometry),openings=sha(inv.openings);delete inv.geometry;delete inv.openings;
  assert(inv.panes>100&&inv.exposed&&inv.bounds&&inv.storeys.every(Boolean),'all original neighbour pane centres and both faces/four storeys must remain');
  if(phase==='after')assert(inv.material.hasBump&&inv.material.hasRoughness&&inv.material.packed,'one packed scalar texture must supply both maps');
  proof.phases[phase]={invariants:inv,geometry,openings,views:[]};images[phase]={};
  for(const view of ['facade','entrance','grazing','distant']){const frame=await p.evaluate(view=>window.__frame(view),view);images[phase][view]=frame.image;delete frame.image;proof.phases[phase].views.push(frame)}
  const storage=await p.evaluate(()=>({local:{...localStorage},session:{...sessionStorage}}));
  assert.deepEqual(storage,{local:{'lunden.drawing':'original-drawing-sentinel','lunden.cloud.queue':'original-queue-sentinel'},session:{'lunden.session':'original-session-sentinel'}});
  proof.phases[phase].storage=storage;
  await p.close();
 }
 assert.equal(proof.phases.before.geometry,proof.phases.after.geometry,'every emitted mesh position/uv/index is unchanged');assert.equal(proof.phases.before.openings,proof.phases.after.openings,'opening metadata unchanged');
 for(let i=0;i<4;i++){const a=proof.phases.before.views[i],c=proof.phases.after.views[i];assert.equal(a.calls,c.calls,'draw calls unchanged');assert.equal(a.triangles,c.triangles,'submitted triangles unchanged');assert.equal(c.textures,a.textures+1,'one extra packed texture only');}
 const p=await b.newPage({viewport:{width:1200,height:1676}});await p.setContent('<canvas></canvas>');
 for(const view of ['facade','entrance','grazing','distant']){
  const result=await p.evaluate(async({view,images})=>{
   const c=document.querySelector('canvas'),width=1200,height=800,label=38,pitch=height+label;
   c.width=width;c.height=pitch*2;
   const g=c.getContext('2d');g.fillStyle='#f6f6f3';g.fillRect(0,0,c.width,c.height);g.fillStyle='#222';g.font='24px sans-serif';
   for(const [i,phase]of ['before','after'].entries()){
    const im=new Image();im.src=images[phase][view];await im.decode();
    if(im.naturalWidth!==width||im.naturalHeight!==height)throw new Error('Unexpected capture dimensions: '+im.naturalWidth+'×'+im.naturalHeight);
    // Preserve the capture's native3:2 pixels; the old1600×533 draw flattened the facade.
    g.drawImage(im,0,label+i*pitch);g.fillText((phase==='before'?'Före':'Efter')+' — '+view,16,29+i*pitch);
   }
   return{image:c.toDataURL('image/jpeg',.93),composition:{source:[width,height],sheet:[c.width,c.height],labelHeight:label,rowPitch:pitch,scale:[1,1]}};
  }, {view,images});proof.composition=result.composition;fs.writeFileSync(path.join(out,view+'.jpg'),Buffer.from(result.image.split(',')[1],'base64'));
 }
 await p.close();assert.deepEqual(proof.errors,[]);assert.deepEqual(proof.external,[]);
 proof.import={productSource:'7b5f0f1740c02d7f7731e34a067563b4b88239e9',scope:'neutral module, own block and public brick material only; public production geometry and colour atlas retained'};
 for(const f of ['src/exterior.js','src/bricksurface.js','src/config.js','tools/bricksurface293.html','tools/bricksurface293browser.cjs'])proof.source[f]=sha(fs.readFileSync(f));
 fs.writeFileSync(path.join(out,'browser.json'),JSON.stringify(proof,null,2));console.log(JSON.stringify(proof));
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
