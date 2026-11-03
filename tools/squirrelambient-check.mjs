// Public #237: one actual public scene, bounded river/paddock views and local ambient gates.
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import readline from 'node:readline';
const base=process.argv[2]??'http://127.0.0.1:8910',out=process.argv[3]??'docs/verification/237';await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,args:['--no-sandbox','--enable-unsafe-swiftshader','--use-angle=swiftshader']});
try{
 const c=await browser.newContext({viewport:{width:1100,height:720},deviceScaleFactor:1});await c.addInitScript(()=>{localStorage.setItem('lunden.drawing','original-sentinel');sessionStorage.setItem('lunden.session','original-session-sentinel');});
 const p=await c.newPage(),errors=[],external=[];p.on('pageerror',e=>errors.push(e.message));p.on('request',r=>{if(new URL(r.url()).origin!==new URL(base).origin)external.push(r.url());});await p.clock.setFixedTime(new Date('2026-06-15T10:00:00Z'));
 await p.goto(base+'/?month=6&cloud=https://ignored.invalid&sync=debug');await p.waitForFunction(()=>window.lundenViewer?.renderer.info.render.frame>0,null,{timeout:180000,polling:100});
 await p.evaluate(()=>{const a=lundenViewer;a.renderer.setAnimationLoop(null);document.getElementById('start').click();document.exitPointerLock?.();});await p.waitForTimeout(100);await p.evaluate(()=>document.querySelectorAll('.topbar,.locations,.bottom-bar,#resume,#crosshair').forEach(e=>e.hidden=true));console.log('PASS actual public World ready');
 const habitat=await p.evaluate(async()=>{const a=lundenViewer,s=a.squirrels,S=await import('/src/surroundings.js');return{trees:s.trees.length,river:s.trees.filter(t=>t.g==='river').length,south:s.trees.filter(t=>t.g==='south').length,feet:S.treeFeet.length,crowns:S.aoTrees.length,southFeet:S.southTreeFeet.length,animals:s.animals.map(v=>({tree:v.brain.tree,tr:v.brain.tr,near:v.geos[0].index.count/3,far:v.geos[1].index.count/3})),lights:(()=>{let n=0;a.scene.traverse(o=>{if(o.isLight)n++;});return n;})()};});assert.equal(habitat.animals.length,4);assert(habitat.river>0&&habitat.south>0);console.log('PASS actual local crowns and south grove',habitat.trees);
 const views=[];
 for(const [name,index]of [['river',0],['paddock',2]]){
  const view=await p.evaluate(async({index})=>{const a=lundenViewer,s=a.squirrels,T=await import('three'),S=await import('/src/surroundings.js'),{squirrelLand}=await import('/src/squirrelhabitat.js'),v=s.animals[index],b=v.brain,states=new Set();
   // Advance the real local brain to a naturally reached ground pause; no state/position is assigned.
   let n=0;for(;n<12000;n++){b.update(.05);states.add(b.state);if(b.state==='search'&&b.t>.15)break;}if(n===12000)throw Error('No natural ground pause');
   a.camera.position.set(b.x,b.y+1.6,b.z+2);s.update(0);a.scene.updateMatrixWorld(true);const target=v.body.localToWorld(new T.Vector3(0,.13,0));
   let chosen=null;for(const dist of [2.4,3.2]){for(let i=0;i<12;i++){const ang=i*Math.PI/6,x=b.x+Math.cos(ang)*dist,z=b.z+Math.sin(ang)*dist;if(!squirrelLand(S.renderedTerrainY,x,z))continue;
    const from=new T.Vector3(x,S.renderedTerrainY(x,z)+1.6,z),dir=target.clone().sub(from),ray=new T.Raycaster(from,dir.clone().normalize(),0,dir.length()+.2);
    // Squirrel bodies deliberately have no interaction raycast: test obstacles up to the visible body centre.
    const obstacle=ray.intersectObjects(a.scene.children,true).find(h=>h.object.isMesh&&h.object.visible&&h.distance<dir.length()-.12);if(!obstacle){chosen={position:from.toArray(),target:target.toArray(),angle:ang};break;}
   }if(chosen)break;}if(!chosen)throw Error('No clear nearby dry-ground camera');
   a.navigation.teleport(chosen.position[0],chosen.position[1]-1.6,chosen.position[2]);a.camera.lookAt(target);s.update(0);a.camera.updateMatrixWorld(true);a.scene.updateMatrixWorld(true);a.renderer.info.reset();a.renderer.render(a.scene,a.camera);const shown={...a.renderer.info.render};s.hide();a.renderer.info.reset();a.renderer.render(a.scene,a.camera);const hidden={...a.renderer.info.render};s.update(0);a.renderer.render(a.scene,a.camera);
   return{index,seconds:n*.05,states:[...states],brain:{x:b.x,y:b.y,z:b.z,state:b.state},camera:chosen,shown,hidden,deltaCalls:shown.calls-hidden.calls,deltaTriangles:shown.triangles-hidden.triangles};
  },{index});assert(view.deltaCalls>=1&&view.deltaCalls<=4);assert(view.deltaTriangles>0);await p.screenshot({path:`${out}/${name}-squirrel.png`});views.push({name,...view});console.log('PASS',name,view.deltaCalls,view.deltaTriangles);
 }
 const gates=await p.evaluate(async()=>{const a=lundenViewer,s=a.squirrels,{applySeason}=await import('/src/seasons.js'),before=s.animals.map(v=>v.brain.clock);a.camera.position.set(1500,2,1500);s.update(1);const farHidden=s.animals.every(v=>!v.group.visible),farFrozen=JSON.stringify(before)===JSON.stringify(s.animals.map(v=>v.brain.clock));applySeason(12);s.update(1);const winterHidden=s.animals.every(v=>!v.group.visible),winterFrozen=JSON.stringify(before)===JSON.stringify(s.animals.map(v=>v.brain.clock));applySeason(6);return{farHidden,farFrozen,winterHidden,winterFrozen,resumed:!s.winter,targets:typeof s.targets,extraMesh: s.animals.some(v=>v.group.children.length!==1),shadows:s.animals.some(v=>v.body.castShadow||v.body.receiveShadow)};});assert.deepEqual(gates,{farHidden:true,farFrozen:true,winterHidden:true,winterFrozen:true,resumed:true,targets:'undefined',extraMesh:false,shadows:false});
 const storage=await p.evaluate(()=>({local:Object.fromEntries(Object.entries(localStorage).filter(([k])=>k.startsWith('lunden.'))),session:sessionStorage.getItem('lunden.session')}));assert.deepEqual(storage,{local:{'lunden.drawing':'original-sentinel'},session:'original-session-sentinel'});assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
 const result={habitat,views,gates,storage,errors,external,limits:'Actual source app, desktop Chromium SwiftShader. Controlled visitor spawns and brain steps to natural states; no continuous walk or physical-phone/FPS claim.'};await writeFile(`${out}/browser.json`,JSON.stringify(result,null,2)+'\n');console.log('PASS winter/far gates and public isolation; REVIEW_READY');
 // Keep the one scene alive for optional camera-only correction during review.
 if(process.env.REVIEW_HOLD==='1'){const rl=readline.createInterface({input:process.stdin});for await(const line of rl){if(line.trim()==='done'){rl.close();break;}}}
}finally{await browser.close();}
