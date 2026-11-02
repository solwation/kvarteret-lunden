// #233: public lawn geometry/material/season contract and one representative school overview.
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
const base=process.argv[2]??'http://localhost:8944',out=process.argv[3]??'artifacts/233',phase=process.argv[4]??'after';await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,args:['--no-sandbox','--enable-unsafe-swiftshader']});
try{
 const ctx=await browser.newContext({viewport:{width:480,height:300},deviceScaleFactor:1});
 // Before uses only these two reviewed public baseline files; the rest of this exact baseline stays unchanged.
 if(phase==='before')for(const file of['schoolyard.js','sitebackdrop.js']){
  const body=execFileSync('git',['show',`${process.env.SCHOOL_GRASS_BASE??'9e27bbb30ca5422ffe293dcc41b6a22bc5b55bf9'}:src/${file}`],{encoding:'utf8'});
  await ctx.route(`**/src/${file}`,r=>r.fulfill({body,contentType:'text/javascript'}));
 }
 await ctx.addInitScript(()=>{localStorage.setItem('lunden.drawing','original-drawing-sentinel');localStorage.setItem('lunden.cloud.queue','original-queue-sentinel');sessionStorage.setItem('lunden.session','original-session-sentinel');});
 const page=await ctx.newPage(),external=[],errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(new URL(r.url()).origin!==new URL(base).origin)external.push(r.url());});
 await page.clock.setFixedTime(new Date('2026-06-15T11:00:00Z'));
 await page.goto(base+'/?month=6&cloud=https://ignored.invalid&sync=debug');await page.waitForFunction(()=>window.lundenViewer?.renderer.info.render.frame>0,null,{timeout:180000});
 const data=await page.evaluate(async()=>{
  const A=lundenViewer,C=await import('/src/config.js'),Y=await import('/src/schoolyard.js'),S=await import('/src/seasons.js');A.renderer.setAnimationLoop(null);document.getElementById('start').click();document.getElementById('resume').hidden=true;
  A.camera.position.set(195,126.62,15);A.camera.rotation.set(-38*Math.PI/180,40*Math.PI/180,0,'YXZ');
  const hash=async rows=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(rows.sort().join('\n'))))).map(x=>x.toString(16).padStart(2,'0')).join('');
  const access=A.scene.getObjectByName('east-access'),lawn=A.scene.getObjectByName('east-lawn'),vertices=[];
  for(const m of[access,...(lawn?[lawn]:[])]){const p=m.geometry.attributes.position,n=m.geometry.attributes.normal;for(let i=0;i<p.count;i++)vertices.push([p.getX(i),p.getY(i),p.getZ(i),n.getX(i),n.getY(i),n.getZ(i)].join(','));}
  const source=[],nonlawns=[];let lawnCount=0,seatCount=0;
  for(const area of['west','north','east','south'])for(const p of[...C.SITE[area].access,...C.SITE[area].paths])if(p.yard){const captures=[],g=Y.schoolyardParts(p.yard,(x,z)=>x*.01+z*.02,(poly,lift)=>{captures.push({poly,lift});return null;});source.push({id:p.source,captures});for(const geo of g){nonlawns.push(p.source+':'+geo.userData.tint+':'+Array.from(geo.attributes.position.array).join(','));geo.dispose();}const yards=[p.yard,...(p.yard.detail?[p.yard.detail]:[])];for(const y of yards){lawnCount+=(y.lawns??[]).length;seatCount+=(y.play??[]).filter(s=>s.kind==='swing').length*2;}}
  const terrain=[];A.scene.traverse(o=>{if(o.isMesh&&o.material?.name==='seasonal-grass'&&o!==lawn)terrain.push(o.material);});const material=terrain.find(m=>m.color.getHex()===C.GRASS.summer);if(!material)throw Error('Standard terrain grass reference missing');
  const season=[];if(lawn)for(const month of[6,11,12,6]){S.applySeason(month);season.push({month,color:lawn.material.color.getHex(),sameColor:lawn.material.color.equals(material.color),sameMap:lawn.material.map===material.map,snowMap:lawn.material.map===null});}S.applySeason(6);
  const uv=lawn?.geometry.attributes.uv,p=lawn?.geometry.attributes.position;
  return{geometry:await hash(vertices),vertices:vertices.length,source,nonlawns:await hash(nonlawns),lawnCount,seatCount,lawn:!!lawn,lawnVertices:p?.count??0,
   uv:!!uv&&Array.from({length:p.count},(_,i)=>uv.getX(i)===p.getX(i)&&uv.getY(i)===p.getZ(i)).every(Boolean),material:lawn?.material.name,sharedProgram:!!lawn&&lawn.material.customProgramCacheKey()===material.customProgramCacheKey(),cast:lawn?.castShadow,receive:lawn?.receiveShadow,season};
 });
 if(phase==='after'){
  const before=JSON.parse(await readFile(`${out}/before.json`,'utf8')).data;
  assert.equal(data.geometry,before.geometry);assert.equal(data.vertices,before.vertices);assert.deepEqual(data.source,before.source);assert.equal(data.nonlawns,before.nonlawns);assert.equal(data.seatCount,before.seatCount);
  assert.equal(data.lawnCount,5);assert.ok(data.seatCount>0&&data.lawnVertices>100&&data.uv&&data.sharedProgram);assert.equal(data.material,'seasonal-grass');assert.equal(data.cast,false);assert.equal(data.receive,true);
  assert.ok(data.season.every(s=>s.sameColor&&s.sameMap)&&data.season[2].snowMap&&!data.season[3].snowMap);
  console.log('PASS unchanged polygons/positions/normals/triangles and static swing seats; shared grass UV/material, shadows and four seasons',JSON.stringify({vertices:data.vertices,lawnVertices:data.lawnVertices,lawnCount:data.lawnCount,seatCount:data.seatCount,season:data.season}));
 }
 const shots=[];
 await page.setViewportSize({width:1280,height:800});
 await page.evaluate(async()=>{for(let i=0;i<2;i++)await new Promise(r=>requestAnimationFrame(r));});
 for(const month of[6,11]){
  const result=await page.evaluate(async month=>{const A=lundenViewer,{applySeason}=await import('/src/seasons.js');applySeason(month);A.camera.updateMatrixWorld(true);A.scene.updateMatrixWorld(true);A.renderer.render(A.scene,A.camera);return{month,camera:A.camera.position.toArray(),rotation:A.camera.rotation.toArray(),calls:A.renderer.info.render.calls,triangles:A.renderer.info.render.triangles};},month);
  await page.screenshot({path:`${out}/${phase}-${month===6?'summer':'autumn'}.png`});shots.push(result);
 }
 const storage=await page.evaluate(()=>({sentinels:[localStorage.getItem('lunden.drawing'),localStorage.getItem('lunden.cloud.queue'),sessionStorage.getItem('lunden.session')],keys:Object.keys(localStorage)}));
 assert.deepEqual(storage.sentinels,['original-drawing-sentinel','original-queue-sentinel','original-session-sentinel']);assert.deepEqual(storage.keys.sort(),['lunden.cloud.queue','lunden.drawing']);assert.deepEqual(external,[]);assert.deepEqual(errors,[]);
 await writeFile(`${out}/${phase}.json`,JSON.stringify({phase,data,shots,storage,external,errors},null,2));console.log('PASS actual school summer/autumn views and public isolation',JSON.stringify(shots));
}finally{await browser.close();}
