import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
// Actual source app, including its production surroundings and Garage. Baseline uses the prior surroundings module.
const base=process.argv[2]??'http://localhost:8795',out=process.argv[3]??'/tmp/kvarteret-windows42',before=process.argv.includes('--before');
await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
const errors=[];
try{
 const page=await browser.newPage({viewport:{width:1100,height:760}});
 page.on('pageerror',e=>errors.push(e.message));
 if(before){const {execFileSync}=await import('node:child_process');const old=execFileSync('git',['show','6b3af42e800c2e32c24028e8b381409574adddf4:src/surroundings.js'],{encoding:'utf8'});await page.route('**/src/surroundings.js',r=>r.fulfill({body:old,contentType:'text/javascript'}));}
 await page.goto(base);
 await page.waitForFunction(()=>window.lundenViewer?.renderer.info.render.frame>0,null,{timeout:180000});
 await page.evaluate(()=>window.lundenViewer.renderer.setAnimationLoop(null));
 const result=await page.evaluate(async()=>{
  const THREE=await import(new URL('/node_modules/three/build/three.module.js',location.origin)),{SITE,NEIGHBOR_OPENINGS:O}=await import(new URL('/src/config.js',location.origin));
  const {scene,world,camera}=window.lundenViewer;scene.updateMatrixWorld(true);
  const glass=scene.getObjectByName('siteNeighborGlass');
  const windows=SITE.terrain.boxWindows.edges.flatMap(([z,spans])=>spans.map(([a,b])=>({x:(a+b)/2,z,y:-3+(SITE.terrain.boxWindows.sill+SITE.terrain.boxWindows.head)/2,width:b-a})));
  const ray=(w,inside)=>{world.garage.update(0,{pos:new THREE.Vector3(w.x,-3,w.z+(inside?-1:1)),below:inside},camera);const dir=inside?1:-1,origin=new THREE.Vector3(w.x,w.y,w.z-dir*.8);const r=new THREE.Raycaster(origin,new THREE.Vector3(0,0,dir),0,2);return r.intersectObjects(scene.children,true).filter(h=>{let o=h.object;while(o){if(!o.visible)return false;o=o.parent;}return h.object.isMesh&&h.object.material?.opacity!==0;}).map(h=>({name:h.object.name,distance:h.distance,glass:h.object===glass}));};
  const paneCounts=windows.map(w=>{const p=glass.geometry.attributes.position;let n=0;for(let i=0;i<p.count;i+=3){const x=(p.getX(i)+p.getX(i+1)+p.getX(i+2))/3,z=(p.getZ(i)+p.getZ(i+1)+p.getZ(i+2))/3,y=(p.getY(i)+p.getY(i+1)+p.getY(i+2))/3;if(Math.abs(z-(w.z+.04+O.site.paneOut))<.001&&Math.abs(x-w.x)<w.width/2&&y>-1.91&&y<-.79)n++;}return n;});
  const outside=windows.map(w=>ray(w,false)),inside=windows.map(w=>ray(w,true));
  let collision,houseOpenings;scene.traverse(o=>{if(o.userData.siteNeighborOpenings){collision=o.userData.segments;houseOpenings=o.userData.siteNeighborOpenings;}});
  return {paneCounts,outside,inside,collision,houseOpenings,glassTriangles:(glass.geometry.index?.count??glass.geometry.attributes.position.count)/3,opaque:!glass.material.transparent,windows};
 });
 assert.deepEqual(result.paneCounts,Array(8).fill(before?0:6),'three production panes per window');
 assert(result.outside.every(h=>h.length&&h[0].glass===!before),'park-facing panes precede retaining wall');
 assert(result.inside.every(h=>h.length&&!h[0].glass),'garage walls stay opaque from inside');
 assert(result.opaque,'reuse opaque reflective glazing');
 assert(result.collision?.length>0,'production collision present');
 const compare=process.argv.indexOf('--compare');if(compare>=0){const old=JSON.parse(await readFile(process.argv[compare+1],'utf8'));assert.deepEqual(result.collision,old.collision,'same actual collision segments');}
 await page.locator('#start').click();await page.evaluate(()=>document.exitPointerLock?.());
 for(const [name,pos,look] of [
  ['CB-west-park',[-58.5,-1.3,64],[-58.5,-1.4,52.5]],['CB-east-park',[-44.8,-1.3,58],[-44.8,-1.4,52.5]],
  ['BA-park',[-16.5,-1.3,40],[-16.5,-1.4,33.3]],
  ['CB-garage',[-59,-1.3,48.5],[-59,-1.4,52.5]],['BA-garage',[-16.5,-1.3,30],[-16.5,-1.4,33.3]]]){
  await page.evaluate(([pos,look])=>{const {renderer,scene,camera,world}=window.lundenViewer;camera.position.set(...pos);camera.lookAt(...look);camera.updateMatrixWorld(true);world.garage.update(0,{pos:camera.position.clone().setY(-3),below:pos[2]<look[2]},camera);renderer.render(scene,camera);},[pos,look]);
  await page.screenshot({path:`${out}/${name}.png`});
 }
 assert.deepEqual(errors,[],'no browser errors');
 await writeFile(`${out}/result.json`,JSON.stringify(result,null,2));console.log(`PASS ${before?'before':'after'}: eight windows, opaque interior, collision; ${result.collision.length} segments`);
}finally{await browser.close();}
