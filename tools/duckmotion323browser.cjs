// Public #323 (original #2126 tools/duckmotion2126browser.cjs, adapted): the actual public river ducks before/after —
// a frame sequence of one seeded swimming duck (strokes, V wake) plus, after, dabbling / preening / shaking / take-off
// forced on the same bird. Before = BASELINE's ducks.js/duckbrain.js/config.js served in place of the working files.
// Records draws/programs/triangles with and without the wake, Ducks.update CPU, a signature of every non-duck scene mesh
// (river water and banks must be identical), zero external requests and untouched storage.
// node tools/duckmotion323browser.cjs [base] [out]
const{chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const[base='http://localhost:8343',out='docs/verification/323']=process.argv.slice(2),baseline=process.env.BASELINE||'d310915',W=1120,H=800;
const touched=['ducks','duckbrain','config'];
(async()=>{fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const report={baseline:execFileSync('git',['rev-parse',baseline],{encoding:'utf8'}).trim(),viewport:[W,H],errors:[],external:[],phases:{}},images={};
try{for(const phase of['before','after']){
 const ctx=await browser.newContext({viewport:{width:W,height:H},deviceScaleFactor:1});
 await ctx.route('**/*',r=>{const u=r.request().url();if(new URL(u).origin!==new URL(base).origin){report.external.push(u);return r.abort();}
  const f=new URL(u).pathname.match(/^\/src\/([a-z0-9]+)\.js$/);
  if(phase==='before'&&f&&touched.includes(f[1]))return r.fulfill({contentType:'text/javascript',body:execFileSync('git',['show',`${baseline}:src/${f[1]}.js`])});
  return r.continue();});
 await ctx.addInitScript(()=>{try{localStorage.setItem('lunden.sentinel','kept');sessionStorage.setItem('lunden.session','kept');}catch{}window.__store=()=>JSON.stringify([Object.entries(localStorage).sort(),Object.entries(sessionStorage).sort()]);});
 const page=await ctx.newPage();page.on('pageerror',e=>{if(!/Pointer Lock/.test(e.message))report.errors.push(phase+': '+e.message);});page.on('console',m=>{if(/Pointer Lock/.test(m.text()))return;if(m.type()==='error'||/THREE\.WebGLProgram|GL_INVALID/.test(m.text()))report.errors.push(phase+': '+m.text().slice(0,400));});
 await page.clock.setFixedTime(new Date('2026-06-15T10:00:00Z'));
 const t0=Date.now();await page.goto(base+'/?month=6&nocats');
 await page.waitForFunction(()=>window.lundenViewer?.renderer.info.render.frame>0,null,{timeout:300000,polling:250});
 const p={loadMs:Date.now()-t0};
 p.setup=await page.evaluate(async()=>{const a=lundenViewer,D=a.ducks,{DuckFlock}=await import('/src/duckbrain.js'),{renderedTerrainY:G}=await import('/src/surroundings.js'),{riverAt}=await import('/src/riverbridge.js');
  a.renderer.setAnimationLoop(null);document.getElementById('start')?.click();document.exitPointerLock?.();document.querySelectorAll('.topbar,.locations,.bottom-bar,#crosshair').forEach(e=>e.hidden=true);const r=document.getElementById('resume');if(r)r.style.setProperty('display','none','important');
  // Restart only the ambient flock from its seeded homes (identical in both phases); no greeting during the sequence.
  const f=new DuckFlock(D.habitat);D.flock=f;D.animals.forEach((v,i)=>v.brain=f.brains[i]);f.grouping=false;D.kiss.next=1e9;D.kiss.pair=null;
  // Matched frames: no random resting behaviour during the swim sequence (behaviours are forced one by one afterwards).
  for(const v of D.animals)if(v.activity)v.activity.next=1e9;
  // Observer 2.1 m to the duck's lower (water) side, .5 m back, .95 m above it; moves with the bird, not with its pose.
  window.__duckCam=(i=0,dist=2.1)=>{const b=D.flock.brains[i],at=s=>[b.x+Math.cos(b.yaw)*s*dist-Math.sin(b.yaw)*.5,b.z-Math.sin(b.yaw)*s*dist-Math.cos(b.yaw)*.5];
   const[l,rr]=[at(-1),at(1)],side=window.__camSide=G(...l)<G(...rr)?-1:1,[ex,ez]=side<0?l:rr;
   a.camera.position.set(ex,Math.max(G(ex,ez)+.4,b.y+.95),ez);a.camera.lookAt(b.x-Math.sin(b.yaw)*.5,b.y+.15,b.z-Math.cos(b.yaw)*.5);a.camera.updateMatrixWorld(true);};
  // The observer follows the bird, so it never counts as rushing at it (lastPlayer is reset each step).
  window.__duckStep=(n,i=0)=>{for(let k=0;k<n;k++){__duckCam(i);D.lastPlayer?.copy(a.camera.position);D.update(.05,false);}__duckCam(i);};
  __duckCam();D.update(0,false);
  let n=0;for(;n<8000;n++){__duckStep(1);const b=D.flock.brains[0];if(b.swimming&&b.moving&&n>60&&riverAt(b.x,b.z).distance<1.2)break;}
  // Signature of every non-duck mesh (river water, banks, terrain): must be identical before/after.
  const sig=[];a.scene.traverse(o=>{if(o.isMesh&&!/^river-duck/.test(o.name)){const g=o.geometry,pos=g.attributes.position;let s=0;for(let k=0;k<pos.array.length;k+=97)s+=pos.array[k];sig.push([o.name,pos.count,g.index?.count??0,[].concat(o.material).map(m=>m.type+(m.transparent?'T':'')).join(','),+s.toFixed(3)]);}});
  return{steps:n,brain:(({x,y,z,yaw,swimming,moving})=>({x,y,z,yaw,swimming,moving}))(D.flock.brains[0]),sceneMeshes:sig.length,sig:JSON.stringify(sig)};});
 const info=()=>page.evaluate(()=>{const A=lundenViewer;A.renderer.render(A.scene,A.camera);const r=A.renderer.info,w=A.ducks.wake?.mesh,a=A.ducks.animals[0],b=a.brain;
  return{calls:r.render.calls,triangles:r.render.triangles,programs:r.programs?.length,textures:r.memory.textures,geometries:r.memory.geometries,wakeVisible:!!w?.visible,state:{swimming:b.swimming,moving:b.moving,kind:a.activity?.kind??null,wake:+(a.activity?.wake??0).toFixed(3),y:+a.mesh.position.y.toFixed(3),pitch:+a.mesh.rotation.x.toFixed(3),roll:+a.mesh.rotation.z.toFixed(3)}};});
 const frame=async name=>{const i=await info(),buf=await page.screenshot({type:'png'});images[phase]??={};images[phase][name]=buf.toString('base64');p.frames??=[];p.frames.push({name,...i});};
 for(let i=0;i<3;i++){await page.evaluate(i=>__duckStep(i?5:30),i);await frame('swim-'+i);}
 if(phase==='before')p.cpu=await page.evaluate(()=>{const D=lundenViewer.ducks,runs=[];for(let r=0;r<3;r++){const t=performance.now();for(let k=0;k<400;k++){D.lastPlayer?.copy(lundenViewer.camera.position);D.update(.05,false);}runs.push((performance.now()-t)/400);}__duckStep(0);return +runs.sort((a,b)=>a-b)[1].toFixed(3);});
 if(phase==='after'){
  // Wake cost: same view with the wake batch forced off.
  p.wakeCost=await page.evaluate(()=>{const A=lundenViewer,w=A.ducks.wake.mesh,draw=()=>{A.renderer.render(A.scene,A.camera);return{calls:A.renderer.info.render.calls,triangles:A.renderer.info.render.triangles};};const on=draw();w.visible=false;const off=draw();w.visible=true;const g=w.geometry;return{on,off,vertices:g.attributes.position.count,indexTriangles:g.index.count/3,bytes:Object.values(g.attributes).reduce((s,x)=>s+x.array.byteLength,0)+g.index.array.byteLength};});
  // Every behaviour starts from the same swim-2 flock state (mid-river, same observer), so frames stay comparable.
  await page.evaluate(()=>{const D=lundenViewer.ducks;window.__snap=D.animals.map(v=>({...v.brain,goal:v.brain.goal&&{...v.brain.goal}}));window.__restore=()=>D.animals.forEach((v,i)=>{Object.assign(v.brain,__snap[i],{goal:__snap[i].goal&&{...__snap[i].goal}});v.activity.stop();v.activity.next=1e9;});});
  for(const[kind,at]of[['dabble',1.6],['preen',1.8],['shake',.35],['takeoff',.55]]){
   await page.evaluate(([kind,at])=>{__restore();const a=lundenViewer.ducks.animals[0];a.activity.start(kind);a.activity.side=window.__camSide;if(kind==='dabble'||kind==='takeoff')a.activity.dur=Math.max(a.activity.dur,3);__duckStep(Math.round(at/.05));},[kind,at]);
   await frame(kind);
   await page.evaluate(()=>{const a=lundenViewer.ducks.animals[0];a.activity.stop();__duckStep(60);});
  }
  // Ducks.update CPU measured after the behaviour frames here, so the sequence stays on the water (median of 3 × 400 steps).
  p.cpu=await page.evaluate(()=>{const D=lundenViewer.ducks,runs=[];for(let r=0;r<3;r++){const t=performance.now();for(let k=0;k<400;k++){D.lastPlayer?.copy(lundenViewer.camera.position);D.update(.05,false);}runs.push((performance.now()-t)/400);}__duckStep(0);return +runs.sort((a,b)=>a-b)[1].toFixed(3);});
  // A real rush: the observer runs 3 m/s straight at the bird → take-off, then cooldown.
  p.rush=await page.evaluate(()=>{const A=lundenViewer,D=A.ducks,a=D.animals[0],b=a.brain;a.activity.stop();a.activity.cool=0;__duckCam();D.lastPlayer.copy(A.camera.position);
   const dx=b.x-A.camera.position.x,dz=b.z-A.camera.position.z,d=Math.hypot(dx,dz);A.camera.position.x+=dx/d*.15;A.camera.position.z+=dz/d*.15;D.update(.05,false);return{kind:a.activity.kind,cool:a.activity.cool};});
  p.still=await page.evaluate(()=>{const D=lundenViewer.ducks;for(const a of D.animals){a.activity.next=1e9;a.activity.start('preen');a.activity.dur=99;}__duckStep(80);return{wakeVisible:D.wake.mesh.visible,wake:D.animals.map(a=>a.activity.wake)};});
  p.hidden=await page.evaluate(()=>{const D=lundenViewer.ducks;for(const a of D.animals)a.activity.stop();__duckStep(40);D.update(.05,true);return{wakeVisible:D.wake.mesh.visible,ducksVisible:D.animals.some(a=>a.mesh.visible)};});
 }
 p.storage=await page.evaluate(()=>__store());
 report.phases[phase]=p;await ctx.close();}
 const a=report.phases.before,b=report.phases.after;
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.external,[]);
 assert.equal(a.setup.sig,b.setup.sig,'every non-duck mesh (river water, banks, terrain) unchanged');
 assert.deepEqual(a.setup.brain,b.setup.brain,'same seeded flock position in both phases');for(let i=0;i<3;i++)assert.equal(JSON.stringify(a.frames[i].state.swimming),JSON.stringify(b.frames[i].state.swimming));
 assert.equal(a.storage,b.storage,'storage unchanged');assert(b.storage.includes('lunden.sentinel'));
 assert(b.frames.filter(f=>f.name.startsWith('swim')).every(f=>f.wakeVisible&&f.state.wake>.5),'wake while swimming');
 assert.equal(b.wakeCost.on.calls-b.wakeCost.off.calls,1,'one extra draw for the wake');
 const by=n=>b.frames.find(f=>f.name===n).state;
 assert(by('dabble').pitch>1,'dabble tips the bird');assert(by('takeoff').y>a.frames[0].state.y+.3,'take-off lifts');assert(Math.abs(by('shake').roll)>.05||by('shake').y>by('preen').y,'shake visible');
 assert.equal(b.rush.kind,'takeoff');assert.equal(b.still.wakeVisible,false);assert(b.still.wake.every(w=>w===0));assert.deepEqual(b.hidden,{wakeVisible:false,ducksVisible:false});
 for(const p of[a,b]){delete p.setup.sig;delete p.storage;}
 // Native-aspect composites: swim sequence before/after (rows), behaviours after (2×2).
 const page=await browser.newPage();await page.setContent('<canvas></canvas>');
 const sheet=async(file,cells,cols)=>{const data=await page.evaluate(async({cells,cols,W,H})=>{const rows=Math.ceil(cells.length/cols),c=document.querySelector('canvas');c.width=cols*W;c.height=rows*(H+36);const g=c.getContext('2d');g.fillStyle='#f8f7f3';g.fillRect(0,0,c.width,c.height);g.fillStyle='#222';g.font='24px sans-serif';
  for(const[i,[label,src]]of cells.entries()){const im=new Image();im.src='data:image/png;base64,'+src;await im.decode();if(im.naturalWidth!==W||im.naturalHeight!==H)throw Error('Native capture aspect changed');const x=(i%cols)*W,y=Math.floor(i/cols)*(H+36);g.drawImage(im,x,y+36);g.fillText(label,x+12,y+27);}
  return c.toDataURL('image/jpeg',.9);},{cells,cols,W,H});fs.writeFileSync(path.join(out,file),Buffer.from(data.split(',')[1],'base64'));};
 for(let i=0;i<3;i++)await sheet(`swim-${i}.jpg`,[['Före — simbild '+(i+1),images.before['swim-'+i]],['Efter — simbild '+(i+1)+' (simtag, V-kölvatten)',images.after['swim-'+i]]],2);
 await sheet('behaviours.jpg',[['Efter — tippar (huvudet under)',images.after.dabble],['Efter — putsar (vila på stället)',images.after.preen],['Efter — skakar fjädrarna',images.after.shake],['Efter — flyger upp en bit',images.after.takeoff]],2);
 await page.close();
 fs.writeFileSync(path.join(out,'browser.json'),JSON.stringify(report,null,1));console.log(JSON.stringify({pass:true,before:{loadMs:a.loadMs,cpu:a.cpu,frames:a.frames},after:{loadMs:b.loadMs,cpu:b.cpu,frames:b.frames,wakeCost:b.wakeCost,rush:b.rush,still:b.still,hidden:b.hidden},meshes:b.setup.sceneMeshes},null,1));
}catch(e){fs.writeFileSync(path.join(out,'diagnostic.json'),JSON.stringify({...report,error:e.stack},null,1));throw e;}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
