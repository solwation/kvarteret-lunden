// Public #326 (original #2130 tools/riverfishschool2130browser.cjs, adapted): the actual public river fish before/after —
// a school seen from the bank (three frames), a surface take seen from the road bridge (three frames) and a hold in the lee
// of a lily patch. The moments are found in node with src/riverfishschool.js and the public's own lily cover; both phases
// set the same fish clock. Before = BASELINE's riverfish.js/riverfloraview.js/main.js/config.js served in place of the working files.
// Records draws/programs/triangles, RiverFish.update CPU, a signature of every non-fish scene mesh (river water, lilies, banks
// must be identical), zero external requests and untouched storage.
// node tools/riverfishschool326browser.cjs [base] [out]
const{chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const[base='http://localhost:8346',out='docs/verification/326']=process.argv.slice(2),baseline=process.env.BASELINE||'10c4e34',W=1120,H=800;
const touched=['riverfish','riverfloraview','main','config'];
(async()=>{fs.mkdirSync(out,{recursive:true});
// ---- the plan, in node, from the working modules (identical seeded paths in both phases)
const root=path.resolve(__dirname,'..'),imp=f=>import(path.join(root,'src',f));
const{RIVER_FISH:C,SITE}=await imp('config.js'),{fishSpec,fishAt,riverPoint,riverProject}=await imp('riverfishswim.js');
const{schoolContext,presentAt,placeAt,takeRings,holdAt,coverFrame}=await imp('riverfishschool.js'),{RiverLilies}=await imp('riverfloraview.js');
const specs=Array.from({length:C.count},(_,id)=>fishSpec(id,0)),lilies=new RiverLilies({}),ctx=schoolContext(specs,C.seed,coverFrame(lilies.cover.lilies));
const T0=1700000,[[ax,az],[bx,bz]]=SITE.bridges.road.ends,road=[(ax+bx)/2,(az+bz)/2],plan={T0,seed:C.seed,road,cover:ctx.cover.length};
const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
for(let t=T0;t<T0+3600&&!plan.school;t+=0.5)for(const[id,g]of ctx.groups){if(g.rank||g.size<3)continue;
 const l=presentAt(id,t,ctx,{}),l3=presentAt(id,t+3,ctx,{});if(l.speed<0.15||l.hold>0.01||Math.abs(wrap(l3.yaw-l.yaw))<0.8)continue;
 if(g.members.every(m=>[0,1.5,3].every(d=>placeAt(m,t+d,ctx,{}).w>0.95))){plan.school={t,lead:id,members:g.members,s:l.s,d:l.d};break;}}
for(let t=T0;t<T0+7200&&!plan.take;t+=0.25)for(const r of takeRings(t,ctx))if(Math.hypot(r.x-road[0],r.z-road[1])<40){plan.take={t:r.te,id:r.id,x:r.x,z:r.z,y:r.y};break;}
for(let t=T0;t<T0+7200&&!plan.hold;t+=1)for(const f of specs){if(ctx.groups.get(f.id).rank)continue;const h=holdAt(f,t,C.seed,ctx.cover);
 if(h.h===1&&h.plan.cover==='lily'&&holdAt(f,t-3,C.seed,ctx.cover).h===1){const g=ctx.groups.get(f.id);plan.hold={t,id:f.id,size:g.size,s:h.plan.s,d:h.plan.d};break;}}
assert(plan.school&&plan.take&&plan.hold,'plan found '+JSON.stringify(plan));
// eyes: 1.2 m beyond the bank edge on the side the fish are on (the take is the first within 40 m of the road bridge; its railing hides the water, so it is seen from the bank)
const bank=(s,d,up)=>{const p=riverPoint(s),side=d>=0?1:-1,o=p.hw+1.2;return{eye:[p.x+p.nx*side*o,null,p.z+p.nz*side*o],at:[p.x+p.nx*d,null,p.z+p.nz*d],up};};
plan.views={school:bank(plan.school.s,plan.school.d,3.4),hold:bank(plan.hold.s,plan.hold.d,3.2),take:(q=>bank(q.s,q.d,3.4))(riverProject(plan.take.x,plan.take.z))};
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const report={baseline:execFileSync('git',['rev-parse',baseline],{encoding:'utf8'}).trim(),viewport:[W,H],plan,errors:[],external:[],phases:{}},images={};
try{for(const phase of['before','after']){
 const bctx=await browser.newContext({viewport:{width:W,height:H},deviceScaleFactor:1});
 await bctx.route('**/*',r=>{const u=r.request().url();if(new URL(u).origin!==new URL(base).origin){report.external.push(u);return r.abort();}
  const f=new URL(u).pathname.match(/^\/src\/([a-z0-9]+)\.js$/);
  if(phase==='before'&&f&&touched.includes(f[1]))return r.fulfill({contentType:'text/javascript',body:execFileSync('git',['show',`${baseline}:src/${f[1]}.js`])});
  return r.continue();});
 await bctx.addInitScript(()=>{try{localStorage.setItem('lunden.sentinel','kept');sessionStorage.setItem('lunden.session','kept');}catch{}window.__store=()=>JSON.stringify([Object.entries(localStorage).sort(),Object.entries(sessionStorage).sort()]);});
 const page=await bctx.newPage();page.on('pageerror',e=>{if(!/Pointer Lock/.test(e.message))report.errors.push(phase+': '+e.message);});page.on('console',m=>{if(/Pointer Lock/.test(m.text()))return;if(m.type()==='error'||/THREE\.WebGLProgram|GL_INVALID/.test(m.text()))report.errors.push(phase+': '+m.text().slice(0,400));});
 await page.clock.setFixedTime(new Date('2026-07-10T12:00:00Z'));
 const t0=Date.now();await page.goto(base+'/?month=7&nocats');
 await page.waitForFunction(()=>window.lundenViewer?.renderer.info.render.frame>0,null,{timeout:300000,polling:250});
 const p={loadMs:Date.now()-t0};
 p.setup=await page.evaluate(async({C})=>{const a=lundenViewer,F=a.ambientFish,{waterYAt}=await import('/src/riverbridge.js');
  a.renderer.setAnimationLoop(null);document.getElementById('start')?.click();document.exitPointerLock?.();document.querySelectorAll('.topbar,.locations,.bottom-bar,#crosshair').forEach(e=>e.hidden=true);const r=document.getElementById('resume');if(r)r.style.setProperty('display','none','important');
  window.__ms=0;F.now=()=>window.__ms;
  // set the fish clock to room time t (s), run the last `lead` s at 10 Hz so drawn offsets have settled, aim the camera
  window.__go=(v,t,lead=4)=>{const w=y=>waterYAt(y[0],y[2]),eye=[v.eye[0],0,v.eye[2]],at=[v.at[0],0,v.at[2]];eye[1]=w(eye)+v.up;at[1]=w(at);
   a.camera.position.set(...eye);a.camera.lookAt(...at);a.camera.fov=v.fov;a.camera.updateProjectionMatrix();a.camera.updateMatrixWorld(true);
   a.riverLilies?.update(a.camera.position,false,7);
   for(let k=Math.round(lead*10);k>=0;k--){window.__ms=(t-k/10+C.epoch)*1000;F.update(0.1,false);}};
  const sig=[];a.scene.traverse(o=>{if(o.isMesh&&!/^river-fish/.test(o.name)){const g=o.geometry,pos=g.attributes.position;let s=0;for(let k=0;k<pos.array.length;k+=97)s+=pos.array[k];sig.push([o.name,pos.count,g.index?.count??0,+s.toFixed(3)]);}});
  return{sceneMeshes:sig.length,sig:JSON.stringify(sig)};},{C:{epoch:C.epoch}});
 const info=()=>page.evaluate(()=>{const A=lundenViewer;A.renderer.render(A.scene,A.camera);const r=A.renderer.info,s=A.ambientFish.state();
  return{calls:r.render.calls,triangles:r.render.triangles,programs:r.programs?.length,textures:r.memory.textures,drawn:s.drawn,rings:s.ringsDrawn,school:s.school??null,
   fish:s.fish.map(f=>({id:f.id,sp:f.species,shared:[+f.x.toFixed(2),+f.z.toFixed(2)],drawn:[+(f.x+(f.school?.[0]??0)).toFixed(2),+(f.z+(f.school?.[2]??0)).toFixed(2)],hold:f.hold?+f.hold.toFixed(2):0,take:f.take?+f.take.toFixed(2):0}))};});
 const frame=async(name,v,t,fov)=>{await page.evaluate(([v,t])=>__go(v,t),[{...v,fov},t]);const i=await info(),buf=await page.screenshot({type:'png'});images[phase]??={};images[phase][name]=buf.toString('base64');p.frames??=[];p.frames.push({name,t,...i});};
 for(const[i,d]of[0,1.5,3].entries())await frame('school-'+i,plan.views.school,plan.school.t+d,40);
 for(const[i,d]of[-0.15,0.6,1.6].entries())await frame('take-'+i,plan.views.take,plan.take.t+d,40);
 await frame('hold',plan.views.hold,plan.hold.t,28);
 // RiverFish.update CPU by the school (median of 3 x 300 updates)
 p.cpu=await page.evaluate(t=>{const F=lundenViewer.ambientFish,runs=[];for(let r=0;r<3;r++){const s=performance.now();for(let k=0;k<300;k++){window.__ms+=50;F.update(.05,false);}runs.push((performance.now()-s)/300);}return +runs.sort((a,b)=>a-b)[1].toFixed(3);},plan.school.t);
 p.storage=await page.evaluate(()=>__store());
 report.phases[phase]=p;await bctx.close();}
 const a=report.phases.before,b=report.phases.after;
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.external,[]);
 assert.equal(a.setup.sig,b.setup.sig,'every non-fish mesh (river water, lilies, banks, terrain) unchanged');
 assert.equal(a.storage,b.storage,'storage unchanged');assert(b.storage.includes('lunden.sentinel'));
 const by=(ph,n)=>ph.frames.find(f=>f.name===n);
 assert(by(b,'school-0').school.groups.some(g=>g.join()===plan.school.members.join()),'the planned school is a school in the app');
 assert(plan.school.members.every(m=>by(b,'school-1').fish.some(f=>f.id===m)),'all members drawn');
 assert(by(b,'take-1').school.takeRings>0&&by(b,'take-1').rings>by(a,'take-1').rings,'take rings drawn after only');
 assert(by(b,'hold').fish.find(f=>f.id===plan.hold.id).hold>0.99,'the trout holds');
 for(const f of b.frames){const g=by(a,f.name);assert(Math.abs(f.calls-g.calls)<=1&&f.programs===g.programs&&f.textures===g.textures,`budget ${f.name}`);}
 for(const ph of[a,b]){delete ph.setup.sig;delete ph.storage;}
 const page=await browser.newPage();await page.setContent('<canvas></canvas>');
 const sheet=async(file,cells,cols)=>{const data=await page.evaluate(async({cells,cols,W,H})=>{const rows=Math.ceil(cells.length/cols),c=document.querySelector('canvas');c.width=cols*W;c.height=rows*(H+36);const g=c.getContext('2d');g.fillStyle='#f8f7f3';g.fillRect(0,0,c.width,c.height);g.fillStyle='#222';g.font='24px sans-serif';
  for(const[i,[label,src]]of cells.entries()){const im=new Image();im.src='data:image/png;base64,'+src;await im.decode();if(im.naturalWidth!==W||im.naturalHeight!==H)throw Error('Native capture aspect changed');const x=(i%cols)*W,y=Math.floor(i/cols)*(H+36);g.drawImage(im,x,y+36);g.fillText(label,x+12,y+27);}
  return c.toDataURL('image/jpeg',.88);},{cells,cols,W,H});fs.writeFileSync(path.join(out,file),Buffer.from(data.split(',')[1],'base64'));};
 const lbl={school:['0 s','+1,5 s','+3 s'],take:['−0,15 s','+0,6 s','+1,6 s']};
 for(const k of['school','take'])for(let i=0;i<3;i++)await sheet(`${k}-${i}.jpg`,[[`Före — ${k==='school'?'stim från stranden':'ytvak nära vägbron'} ${lbl[k][i]}`,images.before[`${k}-${i}`]],[`Efter — ${k==='school'?'stim från stranden':'ytvak nära vägbron'} ${lbl[k][i]}`,images.after[`${k}-${i}`]]],2);
 await sheet('hold.jpg',[['Före — vid näckrosbladen',images.before.hold],['Efter — står stilla i lä av näckrosbladen',images.after.hold]],2);
 await page.close();
 fs.writeFileSync(path.join(out,'browser.json'),JSON.stringify(report,null,1));
 console.log(JSON.stringify({pass:true,plan,before:{loadMs:a.loadMs,cpu:a.cpu,frames:a.frames.map(({fish,...f})=>f)},after:{loadMs:b.loadMs,cpu:b.cpu,frames:b.frames.map(({fish,...f})=>f)},meshes:b.setup.sceneMeshes},null,1));
}catch(e){fs.writeFileSync(path.join(out,'diagnostic.json'),JSON.stringify({...report,error:e.stack},null,1));throw e;}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
