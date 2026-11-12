import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';
const base=process.argv[2]??'http://127.0.0.1:8302/dist/',out='docs/verification/269',errors=[],external=[],sockets=[],results=[];
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
try{
for(const month of [6,1]){
const page=await browser.newPage({viewport:{width:1280,height:800}});page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(new URL(r.url()).origin!==new URL(base).origin)external.push(r.url())});page.on('websocket',s=>sockets.push(s.url()));
await page.addInitScript(()=>{let seed=4269;Math.random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};Date.now=()=>1794484800000;localStorage.setItem('lunden-save','269-original-sentinel');localStorage.setItem('lunden.paddockGrass','269-original-grass');});
await page.goto(base+'?month='+month);await page.waitForFunction(()=>window.lundenViewer?.renderer.info.render.frame>0,null,{timeout:300000});await page.evaluate(()=>window.lundenViewer.renderer.setAnimationLoop(null));await page.locator('#start').click({timeout:120000});await page.evaluate(()=>document.exitPointerLock?.());await page.locator('[data-place="paddock"]').click();
for(const mode of month===6?['arrival','rain']:['winter']){
const r=await page.evaluate(({mode})=>{
const v=window.lundenViewer,p=v.paddock,scene=v.scene,c=v.camera,renderer=v.renderer,T=c.position.constructor;
if(mode==='rain'){for(let i=0;i<1500;i++)p.update(.1,false,.8);if(!p.ponies.some(q=>q.spot))throw Error('no rain shelter');}
if(mode!=='arrival'){const s=p.spots.shelter;c.position.set(s.x+Math.sin(s.yaw)*7+Math.cos(s.yaw)*2,p.ground(s.x,s.z)+2,s.z+Math.cos(s.yaw)*7-Math.sin(s.yaw)*2);c.lookAt(new T(s.x,p.ground(s.x,s.z)+1,s.z));for(let i=0;i<1500;i++)p.update(.1,false,mode==='rain'?.8:0);}
else p.update(0,false,0);
p.write();scene.updateMatrixWorld(true);c.updateMatrixWorld(true);
for(const m of [c.matrix,c.matrixWorld,c.matrixWorldInverse,c.projectionMatrix,c.projectionMatrixInverse,p.mesh.matrixWorld])if(!m.elements.every(Number.isFinite))throw Error('nonfinite matrix');
const projected=[];for(let i=0;i<2;i++){const M=p.matrix.clone();p.mesh.getMatrixAt(i,M);if(!M.elements.every(Number.isFinite))throw Error('nonfinite instance');const q=p.ponies[i];const center=new T(q.x,q.y+.8,q.z).project(c);projected.push(center.toArray());if(!center.toArray().every(Number.isFinite))throw Error('nonfinite intended projection');}
let calls=0,triangles=0;const direct=renderer.renderBufferDirect;renderer.renderBufferDirect=function(camera,scene,g,material,o,...args){if(o===p.mesh){calls++;triangles+=g.attributes.position.count/3*o.count;}return direct.call(this,camera,scene,g,material,o,...args)};
renderer.render(scene,c);renderer.renderBufferDirect=direct;
const gl=renderer.getContext(),w=gl.drawingBufferWidth,h=gl.drawingBufferHeight,a=new Uint8Array(w*h*4),b=new Uint8Array(a.length);gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,a);p.mesh.visible=false;renderer.render(scene,c);gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,b);p.mesh.visible=true;renderer.render(scene,c);
let pixels=0;for(let i=0;i<a.length;i+=4)if(Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2])>9)pixels++;
return {mode,calls,triangles,pixels,camera:c.position.toArray(),quaternion:c.quaternion.toArray(),projection:c.projectionMatrix.toArray(),projected,ponies:p.ponies.map(q=>({x:q.x,y:q.y,z:q.z,neck:q.neck,spot:q.spot?.kind})),winter:p.winter,blankets:p.blankets.visible,grass:p.grass.visible,sentinels:[localStorage.getItem('lunden-save'),localStorage.getItem('lunden.paddockGrass')],keys:Object.keys(localStorage)};
},{mode});
assert.equal(r.calls,1);assert.equal(r.triangles,5304);assert(r.pixels>=50,'real intended pony pixels '+r.pixels);assert.deepEqual(r.sentinels,['269-original-sentinel','269-original-grass']);assert(r.keys.every(k=>['lunden-save','lunden.paddockGrass','kvarteret-lunden.paddockGrass'].includes(k)));
if(mode==='winter'){assert(r.winter&&r.blankets&&!r.grass);assert(r.ponies.every(q=>q.spot==='shed'));}
await page.screenshot({path:`${out}/built-${mode}.png`});results.push(r);
}
await page.close();
}
assert.deepEqual(errors,[]);assert.deepEqual(external,[]);assert.deepEqual(sockets,[]);
const sources={};for(const f of ['src/config.js','src/paddock.js','src/ponyblanket.js','tools/pony-surface-consumers.mjs'])sources[f]=createHash('sha256').update(await readFile(f)).digest('hex');
await writeFile(`${out}/consumers.json`,JSON.stringify({build:JSON.parse(await readFile('dist/version.json','utf8')),sources,results,errors,external,sockets},null,2)+'\n');console.log(JSON.stringify(results));
}finally{await browser.close();}
