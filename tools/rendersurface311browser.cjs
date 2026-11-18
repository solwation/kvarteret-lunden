// Public #311 (original #2095 8fed7ec): the actual public rendered façades (Hus L's white render behind the loftgång, on the
// set-back courtyard storey; the Å-husen A/B/C's white loggia/recess walls) before/after in the real app by day, near and at
// street distance. Before = BASELINE's versions of the touched modules (git show) served in place of the working files.
// node tools/rendersurface311browser.cjs http://localhost:8311 docs/verification/311
const{chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const[base='http://localhost:8311',out='docs/verification/311']=process.argv.slice(2),baseline=process.env.BASELINE||'d3981b4',hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const touched=['config.js','exterior.js','surroundings.js'];
const W=1280,H=800,VIEWS=[ // x, z, yaw° (180 looks south, +z), pitch°, feet (default: ground); the original's views (*guess*)
 {name:'husL-gata',x:3,z:-14,yaw:180,pitch:14},
 {name:'husL-loftgang',x:-30,z:0.2,yaw:200,pitch:-15,feet:6.4},
 {name:'husL-terrass',x:2,z:12.3,yaw:300,pitch:-5,feet:9.46},
 {name:'husA-loggia',x:-13.4,z:24.6,yaw:-140,pitch:12},
 {name:'husC-gata',x:-36,z:23,yaw:90,pitch:12}, // Hus C's east face: the entrance recess with loggias above, the NE corner loggia
];
(async()=>{fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const report={baseline,viewport:[W,H],errors:[],external:[],phases:{},source:{}},images={};
try{for(const phase of['before','after']){
 const ctx=await browser.newContext({viewport:{width:W,height:H},deviceScaleFactor:1});
 await ctx.route('**/*',r=>{const u=r.request().url();if(new URL(u).origin!==new URL(base).origin){report.external.push(u);return r.abort();}
  const f=new URL(u).pathname.match(/^\/src\/([a-z0-9]+\.js)$/);if(phase==='before'&&f&&touched.includes(f[1]))return r.fulfill({contentType:'text/javascript',body:execFileSync('git',['show',`${baseline}:src/${f[1]}`])});return r.continue();});
 await ctx.addInitScript(()=>{try{localStorage.setItem('kvarteret-lunden.sentinel','kept');}catch{}});
 const page=await ctx.newPage();page.on('pageerror',e=>report.errors.push(phase+': '+e.message));page.on('console',m=>{if(m.type()==='error'||/THREE\.WebGLProgram|GL_INVALID/.test(m.text()))report.errors.push(phase+': '+m.text().slice(0,400));});
 await page.clock.setFixedTime(new Date('2026-07-15T11:00:00Z'));
 const t0=Date.now();await page.goto(base+'/?nocats&keepgeo');await page.waitForFunction(()=>window.lundenViewer?.renderer.info.render.frame>2&&lundenViewer.scene.getObjectByName('south-roof'),null,{timeout:300000,polling:500});
 const p={loadMs:Date.now()-t0,views:[]};images[phase]={};
 await page.evaluate(()=>{document.getElementById('start')?.click();document.exitPointerLock?.();const r=document.getElementById('resume');if(r)r.hidden=true;});
 // the render meshes: Hus L's (H.render f2efe7, FrontSide) and the Å-husen's white loggia mesh (DoubleSide); colour × albedo mean
 p.renders=await page.evaluate(()=>{const s=lundenViewer.scene,found={};let meshes=0;s.traverse(o=>{if(o.isMesh||o.isInstancedMesh)meshes++;if(!o.isMesh)return;const m=[].concat(o.material)[0];if(!m?.color)return;
  const grain=m.bumpMap?.name==='render-surface',hex=m.color.getHexString(),key=grain?(m.side===2?'aHouses':'husL'):(hex==='f2efe7'&&!m.map&&m.side===0?'husL':m.side===2&&!m.map&&m.roughness===0.85&&o.geometry.attributes.position.count>20000?'aHouses':null);
  if(!key)return;const g=o.geometry,P=g.attributes.position.array,c=g.attributes.color?.array;let tri=0,plain=0,area=0,dark=0;
  for(let t=0;t<g.attributes.position.count;t+=3){const ax=P[t*3],ay=P[t*3+1],az=P[t*3+2],ux=P[t*3+3]-ax,uy=P[t*3+4]-ay,uz=P[t*3+5]-az,vx=P[t*3+6]-ax,vy=P[t*3+7]-ay,vz=P[t*3+8]-az;
   const a=Math.hypot(uy*vz-uz*vy,uz*vx-ux*vz,ux*vy-uy*vx)/2;tri++;const k=c?(c[t*3]+c[t*3+3]+c[t*3+6])/3:1;if(k===1)plain++;area+=a;dark+=a*k;}
  (found[key]??=[]).push({name:o.name||null,vertices:g.attributes.position.count,triangles:tri,dirtTriangles:tri-plain,meanVertexColour:+(dark/area).toFixed(5),uv:!!g.attributes.uv,bump:grain,roughness:+m.roughness.toFixed(4),matColor:hex,map:m.map?.name||null});});
  return{meshes,found};});
 for(const v of VIEWS){
  const info=await page.evaluate(async v=>{const A=lundenViewer,S=await import('/src/surroundings.js');
   const feet=v.feet??Math.max(S.groundY(v.x,v.z),S.renderedTerrainY(v.x,v.z));A.navigation.teleport(v.x,feet,v.z);A.camera.rotation.set(v.pitch*Math.PI/180,v.yaw*Math.PI/180,0,'YXZ');
   for(let i=0;i<4;i++)await new Promise(r=>requestAnimationFrame(r));A.scene.updateMatrixWorld();const r=A.renderer.info;r.autoReset=false;r.reset();A.renderer.render(A.scene,A.camera);
   const res={image:A.renderer.domElement.toDataURL('image/png'),canvas:[A.renderer.domElement.width,A.renderer.domElement.height],calls:r.render.calls,triangles:r.render.triangles,textures:r.memory.textures,geometries:r.memory.geometries,programs:(r.programs||[]).length,camera:A.camera.position.toArray().map(x=>+x.toFixed(2))};r.autoReset=true;return res;},v);
  const png=Buffer.from(info.image.split(',')[1],'base64');delete info.image;images[phase][v.name]=png;p.views.push({...v,...info,imageSHA256:hash(png)});
 }
 p.storage=await page.evaluate(()=>({sentinel:localStorage.getItem('kvarteret-lunden.sentinel'),keys:Object.keys(localStorage).sort()}));
 if(phase==='after')p.mapMs=await page.evaluate(async()=>{const M=await import('/src/rendersurface.js?gen'),t=performance.now();M.renderSurfacePixels();return +(performance.now()-t).toFixed(1);});
 report.phases[phase]=p;await ctx.close();
}
const a=report.phases.before,b=report.phases.after;
assert.equal(a.renders.meshes,b.renders.meshes,'mesh count');
for(const k of['husL','aHouses']){assert.equal(a.renders.found[k]?.length,1,'before '+k);assert.equal(b.renders.found[k]?.length,1,'after '+k);const x=a.renders.found[k][0],y=b.renders.found[k][0];
 assert.equal(y.triangles-y.dirtTriangles>=x.triangles,true,k+' original triangles kept');assert(y.bump&&y.uv,k+' grain');assert(y.meanVertexColour>0.98,k+' dirt is faint');}
for(let i=0;i<VIEWS.length;i++){assert.equal(a.views[i].calls,b.views[i].calls,VIEWS[i].name+' calls');assert(b.views[i].textures<=a.views[i].textures+2,VIEWS[i].name+' textures');assert(b.views[i].programs<=a.views[i].programs+2,VIEWS[i].name+' programs');}
for(const p of[a,b]){assert.equal(p.storage.sentinel,'kept');assert(p.storage.keys.every(k=>k.startsWith('kvarteret-lunden.')),'only public storage names');}
assert.deepEqual(report.errors,[]);assert.deepEqual(report.external,[]);
const page=await browser.newPage();await page.setContent('<canvas></canvas>');
report.tone={};
for(const v of VIEWS){const r=await page.evaluate(async({a,b,name,W,H})=>{const c=document.querySelector('canvas');c.width=2*W;c.height=H+38;const g=c.getContext('2d');g.fillStyle='#f7f7f3';g.fillRect(0,0,c.width,c.height);g.fillStyle='#222';g.font='24px sans-serif';const tone=[];
 for(const[i,src]of[a,b].entries()){const im=new Image();im.src='data:image/png;base64,'+src;await im.decode();if(im.naturalWidth!==W||im.naturalHeight!==H)throw Error('native size');g.drawImage(im,i*W,38);
  const d=g.getImageData(i*W,38,W,H).data,s=[0,0,0];for(let k=0;k<d.length;k+=4){s[0]+=d[k];s[1]+=d[k+1];s[2]+=d[k+2];}tone.push(s.map(x=>+(x/(W*H)).toFixed(2)));
  g.fillText((i?'Efter':'Före')+' — '+name,i*W+12,28);}return{data:c.toDataURL('image/jpeg',.88),tone};},{a:images.before[v.name].toString('base64'),b:images.after[v.name].toString('base64'),name:v.name,W,H});
 report.tone[v.name]=r.tone;fs.writeFileSync(path.join(out,v.name+'.jpg'),Buffer.from(r.data.split(',')[1],'base64'));
 for(let k=0;k<3;k++)assert(Math.abs(r.tone[1][k]-r.tone[0][k])<=r.tone[0][k]*0.02,v.name+' mean tone within 2 %');}
await page.close();
for(const f of['src/rendersurface.js','src/config.js','src/exterior.js','src/surroundings.js','tools/rendersurfacetest.mjs','tools/rendersurface311browser.cjs'])report.source[f]=hash(fs.readFileSync(f));
fs.writeFileSync(path.join(out,'browser.json'),JSON.stringify(report,null,1));
console.log(JSON.stringify({pass:true,load:[a.loadMs,b.loadMs],mapMs:b.mapMs,renders:[a.renders.found,b.renders.found],tone:report.tone,views:VIEWS.map((v,i)=>[v.name,a.views[i].calls,b.views[i].calls,a.views[i].triangles,b.views[i].triangles,a.views[i].textures,b.views[i].textures,a.views[i].programs,b.views[i].programs])}));
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
