// Diagnostic only: actual public ceiling in a grazing light, absent from the fixed-daylight product.
// The normal public daylight A/B and all budget/isolation checks are in paintsurface346browser.cjs.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const[base='http://localhost:8450',out='docs/verification/346']=process.argv.slice(2);
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const report={diagnostic:true,description:'Actual public ceiling; fixture-only grazing directional light, not production daylight',viewport:[960,640],light:{color:0xfff1de,intensity:2.2,position:[-.8,2.44,10.35],target:[3.2,2.6,10.35]},views:{},errors:[],external:[]};
 try{
 const page=await browser.newPage({viewport:{width:480,height:320},deviceScaleFactor:1});
 page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text().slice(0,400));});
 await page.route('**/*',r=>{if(!r.request().url().startsWith(base+'/')){report.external.push(r.request().url());return r.abort();}return r.continue();});
 await page.goto(base+'/?keepgeo&nocats&wind=0,0&month=7');
 await page.waitForFunction(()=>window.lundenViewer?.renderer.info.render.frame>0,null,{timeout:300000,polling:500});
 await page.evaluate(async light=>{
  const a=lundenViewer,T=await import('three');a.moveTo('home');a.navigation.teleport(3.05,0,8.6);
  await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));a.renderer.setAnimationLoop(null);
  const l=new T.DirectionalLight(light.color,light.intensity);l.position.set(...light.position);l.target.position.set(...light.target);a.scene.add(l,l.target);
  a.camera.position.set(3.05,2.05,8.6);a.camera.lookAt(3.2,2.65,10.35);a.camera.updateMatrixWorld(true);
 },report.light);
 await page.setViewportSize({width:960,height:640});
 for(const enabled of[false,true]){
  const r=await page.evaluate(async enabled=>{
   const a=lundenViewer,p=await import('/src/paintsurface.js');
   a.renderer.setSize(960,640);a.camera.aspect=960/640;a.camera.updateProjectionMatrix();
   p.paintDetail.value=enabled?1:0;
   for(let i=0;i<3;i++)a.renderer.render(a.scene,a.camera);
   a.renderer.info.reset();a.renderer.render(a.scene,a.camera);
   return{image:a.renderer.domElement.toDataURL(),calls:a.renderer.info.render.calls,triangles:a.renderer.info.render.triangles,textures:a.renderer.info.memory.textures,programs:a.renderer.info.programs.length};
  },enabled);
  fs.writeFileSync(path.join(out,enabled?'':'before','ceiling-grazing.png'),Buffer.from(r.image.split(',')[1],'base64'));delete r.image;report.views[enabled?'after':'before']=r;
 }
 assert.deepEqual(report.views.before,report.views.after);assert.deepEqual(report.errors,[]);assert.deepEqual(report.external,[]);
 console.log('PASS fixture-only ceiling grazing A/B, same geometry/draw/program budget',JSON.stringify(report.views));
 }finally{fs.writeFileSync(path.join(out,'grazing.json'),JSON.stringify(report,null,2)+'\n');await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
