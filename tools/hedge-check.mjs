import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
// #41: actual public World patio views; existing seasons API and unused entrance builder are explicit diagnostics.
const base=process.argv[2]??'http://localhost:8793',out=process.argv[3]??'artifacts/hedges';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const checks=[],errors=[],external=[],records=[];
const check=(ok,label)=>{checks.push({ok,label});console.log(`${ok?'PASS':'FAIL'} ${label}`);assert(ok,label);};
try{
 const page=await browser.newPage({viewport:{width:900,height:600},deviceScaleFactor:1});
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 page.on('request',r=>{if(new URL(r.url()).origin!==new URL(base).origin)external.push(r.url());});
 await page.addInitScript(()=>{
  localStorage.setItem('lunden.drawing','hedge-original-sentinel');sessionStorage.setItem('lunden.session','hedge-original-session');
  // Pause only the animation loop before its first wide-area draw; every captured frame is a real renderer.render.
  let viewer;Object.defineProperty(window,'lundenViewer',{get:()=>viewer,set:v=>{viewer=v;v.renderer.setAnimationLoop=()=>{};}});
 });
 await page.goto(base);await page.waitForFunction(()=>window.lundenViewer&&document.getElementById('start').disabled===false,null,{timeout:120000,polling:100});
 await page.locator('#start').click();
 const geometry=await page.evaluate(async()=>{
  const {world,scene}=lundenViewer,T=await import('three'),C=await import('./src/config.js'),{husLLayout}=await import('./src/exterior.js');
  window.qaHedge={T,C,season:await import('./src/seasons.js')};const patios=[];
  scene.traverse(o=>{if(o.isMesh&&o.material?.name==='patio-hedge')patios.push(o);});
  const shapes=patios.map(m=>({triangles:(m.geometry.index?.count??m.geometry.attributes.position.count)/3,colors:!!m.geometry.attributes.color,low:!!m.geometry.attributes.hedgeLow,vertexColors:m.material.vertexColors}));
  const nodes=husLLayout(world.size.x).units;
  return {shapes,ids:nodes.map(u=>u.lower),entryPresent:!!scene.getObjectByName('front-boxwood'),lights:scene.children.filter(o=>o.isLight).length,site:world.size};
 });records.push({actualPublicGeometry:geometry});
 check(geometry.shapes.length===1,'all eight Hus L patio hedges remain one production mesh/draw');
 check(geometry.shapes.every(s=>s.triangles===12448&&s.colors&&s.low&&s.vertexColors),'production hedge relief and stem attributes, 12448 triangles');
 check(geometry.ids.join()==='L1001,L1002,L1003,L1004,L1005,L1006,L1007,L1008','all shared ground-floor patio variants covered');
 check(!geometry.entryPresent,'entrance remains outside public production scope (no StreetLife import)');
 const shot=async(label,month,far=false)=>{
  const r=await page.evaluate(({month,far})=>{
   const v=lundenViewer;document.getElementById('resume').hidden=true;qaHedge.season.applySeason(month);
   v.camera.position.set(far?-17:3.4,far?8:1.7,far?31:20.2);v.camera.lookAt(far?-17:3.4,far?.8:.65,17.15);v.camera.updateMatrixWorld(true);v.scene.updateMatrixWorld(true);v.renderer.render(v.scene,v.camera);
   let hedge,hedgeMeshes=0;v.scene.traverse(o=>{if(o.isMesh&&o.material?.name==='patio-hedge'){hedge=o;hedgeMeshes++;}});
   return {month,far,hedgeMeshes,hedgeTriangles:(hedge.geometry.index?.count??hedge.geometry.attributes.position.count)/3,calls:v.renderer.info.render.calls,triangles:v.renderer.info.render.triangles,map:!!hedge.material.map,snowColor:hedge.material.color.getHex(),programErrors:v.renderer.info.programs.filter(p=>p.diagnostics?.runnable===false).length};
  },{month,far});records.push({label,...r});console.log(JSON.stringify({label,...r}));check(!r.programErrors,label+' shader compiles');
  check(r.map===(month===7),label+' existing snow API safely removes/restores leaf map');await page.screenshot({path:`${out}/${label}.png`});return r;
 };
 const summer=await shot('patio-summer-near',7);await shot('patio-summer-far',7,true);await shot('patio-winter-near',1);await shot('patio-winter-far',1,true);
 const restored=await shot('patio-summer-restored',7);check(restored.hedgeMeshes===summer.hedgeMeshes&&restored.hedgeTriangles===summer.hedgeTriangles,'same hedge batches/geometry after snow roundtrip');
 const component=await page.evaluate(async()=>{
  const v=lundenViewer,{T,C}=qaHedge,{boxwood}=await import('./src/boxwood.js');
  const spec={...C.SITE.life.strip.hedge,parts:[[0,3.2],[4.5,7.7]],z:0,gaps:[[1.2,2]]},group=boxwood(spec);
  const component=new T.Scene();component.background=new T.Color(0xd2dce1);component.add(new T.HemisphereLight(0xffffff,0x606b51,2));const sun=new T.DirectionalLight(0xffffff,2);sun.position.set(2,4,3);component.add(sun,group);
  const body=group.children[0],p=body.geometry.attributes.position;let finite=true;for(let i=0;i<p.count;i++)finite&&=[p.getX(i),p.getY(i),p.getZ(i)].every(Number.isFinite);
  const gapClear=!group.userData.runs.some(([a,b])=>a<2&&b>1.2);
  const bounds=body.geometry.boundingBox??(body.geometry.computeBoundingBox(),body.geometry.boundingBox);
  Object.assign(qaHedge,{component,entry:group});
  return {finite,gapClear,runs:group.userData.runs,meshes:group.children.length,triangles:(body.geometry.index?.count??p.count)/3,bounds:{min:bounds.min.toArray(),max:bounds.max.toArray()}};
 });records.push({entranceBuilderDiagnostic:component});
 check(component.finite&&component.gapClear&&component.runs.length===3,'actual entrance builder preserves finite geometry and configured opening');
 check(component.meshes===2&&component.bounds.min[2]>=-.232&&component.bounds.max[2]<=.232,'actual entrance builder keeps two batches and original footprint ±1.2 cm');
 for(const month of [7,1]){
  const r=await page.evaluate(month=>{const v=lundenViewer;document.getElementById('resume').hidden=true;qaHedge.season.applySeason(month);v.camera.position.set(3.85,1.4,4.5);v.camera.lookAt(3.85,.2,0);v.renderer.render(qaHedge.component,v.camera);return {snow:qaHedge.entry.children[1].visible,calls:v.renderer.info.render.calls,triangles:v.renderer.info.render.triangles};},month);
  records.push({entranceBuilderMonth:month,...r});check(r.snow===(month===1)&&r.calls===(month===1?2:1),'entrance builder '+month+' snow cap and batch budget');await page.screenshot({path:`${out}/entrance-component-${month}-far.png`});
 }
 await page.evaluate(()=>{const v=lundenViewer;qaHedge.season.applySeason(7);v.camera.position.set(.6,.65,1.25);v.camera.lookAt(.6,.2,0);v.renderer.render(qaHedge.component,v.camera);});await page.screenshot({path:`${out}/entrance-component-summer-near.png`});
 check(await page.evaluate(()=>localStorage.getItem('lunden.drawing')==='hedge-original-sentinel'&&sessionStorage.getItem('lunden.session')==='hedge-original-session'),'original storage remains untouched');
 // Load the actual publication bundle too; no source-module imports or substituted application code here.
 await page.goto(new URL('dist/',base.endsWith('/')?base:base+'/').href);await page.waitForFunction(()=>window.lundenViewer&&document.getElementById('start').disabled===false,null,{timeout:120000,polling:100});await page.locator('#start').click();
 for(const far of [false,true]){
  const r=await page.evaluate(far=>{const v=lundenViewer;document.getElementById('resume').hidden=true;v.camera.position.set(far?-17:3.4,far?8:1.7,far?31:20.2);v.camera.lookAt(far?-17:3.4,far?.8:.65,17.15);v.scene.updateMatrixWorld(true);v.renderer.render(v.scene,v.camera);const hedges=[];v.scene.traverse(o=>{if(o.isMesh&&o.material?.name==='patio-hedge')hedges.push(o);});return {meshes:hedges.length,triangles:hedges.reduce((n,m)=>n+(m.geometry.index?.count??m.geometry.attributes.position.count)/3,0),calls:v.renderer.info.render.calls};},far);
  records.push({built:true,far,...r});check(r.meshes===1&&r.triangles===12448,'actual built public World '+(far?'far':'near')+' hedge batch/triangle budget');await page.screenshot({path:`${out}/built-patio-${far?'far':'near'}.png`});
 }
 check(errors.length===0,'no browser/shader errors');check(external.length===0,'no external network requests');
 const files=['src/hedgeform.js','src/patiohedge.js','src/boxwood.js','src/config.js'];
 const hashes={};for(const file of files)hashes[file]=createHash('sha256').update(await readFile(file)).digest('hex');
 await writeFile(`${out}/result.json`,JSON.stringify({checks,records,errors,external,sourceHashes:hashes,limits:'Public viewer has no automatic season/weather or entrance hedge; source World snow and actual boxwood builder are diagnostic API checks. A/B/C ornamental shrubs unchanged.'},null,2));
}finally{await browser.close();}
