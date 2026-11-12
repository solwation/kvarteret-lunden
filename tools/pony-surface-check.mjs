import assert from 'node:assert/strict';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';
const base=process.argv[2]??'http://127.0.0.1:8302',label=process.argv[3]??'after',out='docs/verification/269';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
const errors=[],external=[],sockets=[];
const frozen=process.argv[4];
try{
const page=await browser.newPage({viewport:{width:1280,height:800}});
if(frozen)for(const f of ['paddock.js','config.js'])await page.route('**/src/'+f,async route=>route.fulfill({contentType:'text/javascript',body:(await readFile(frozen+'/'+f,'utf8')).replace('export function ponyGeometry() {','export function ponyGeometry() { for(let i=0;i<16;i++)Math.random(); // Match four discarded lens-geometry UUIDs, not model geometry.\n')}));
page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(new URL(r.url()).origin!==new URL(base).origin)external.push(r.url())});page.on('websocket',s=>sockets.push(s.url()));
await page.addInitScript(()=>{let seed=4269;Math.random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};Date.now=()=>1794484800000;localStorage.setItem('lunden-save','269-original-sentinel');localStorage.setItem('lunden.paddockGrass','269-original-grass');});
await page.goto(base+'/?month=6');await page.waitForFunction(()=>window.lundenViewer?.renderer.info.render.frame>0,null,{timeout:300000});
await page.evaluate(()=>window.lundenViewer.renderer.setAnimationLoop(null));await page.locator('#start').click({timeout:120000});await page.evaluate(()=>document.exitPointerLock?.());await page.locator('[data-place="paddock"]').click();
const normal=await page.evaluate(()=>{
const v=window.lundenViewer,p=v.paddock;p.update(0,false,0);p.write();v.scene.updateMatrixWorld(true);v.camera.updateMatrixWorld(true);v.renderer.render(v.scene,v.camera);
window.__pony269={pos:v.camera.position.toArray(),quat:v.camera.quaternion.toArray(),ponies:p.ponies.map(q=>({...q}))};
return {camera:window.__pony269.pos,quaternion:window.__pony269.quat,ponies:p.ponies.map(q=>({x:q.x,y:q.y,z:q.z,yaw:q.yaw,scale:q.scale,state:q.state,neck:q.neck})),location:v.locations.paddock};});
await page.screenshot({path:`${out}/${label}-normal.png`});
await page.addStyleTag({url:new URL('/tools/pony-surface-check.css',base).href});
const result=await page.evaluate(()=>{
const v=window.lundenViewer,p=v.paddock,g=p.mesh.geometry,a=g.attributes,arrays=new Set(Object.values(a).map(a=>a.array));arrays.add(p.mesh.instanceMatrix.array);
return {normal:window.__pony269,cost:{triangles:a.position.count/3,geometryBytes:['position','normal','color','aPart','aPivot'].reduce((n,k)=>n+a[k].array.byteLength,0),retainedMeshBytes:[...arrays].reduce((n,a)=>n+a.byteLength,0),attrs:Object.keys(a),instances:p.mesh.count,materials:1,textures:0},sentinels:[localStorage.getItem('lunden-save'),localStorage.getItem('lunden.paddockGrass')]};});
assert.equal(result.cost.instances,2);assert(result.cost.triangles<=3000);assert(result.cost.geometryBytes<=505440);
// Diagnostic full views retain the real Paddock's geometry, shaders, ground and lights.
for(const [name,offset] of [['whole',[3.7,2.3,3.7]],['front',[0,1.5,4.6]],['side',[4.6,1.3,0]]]){
await page.evaluate(({offset})=>{const v=window.lundenViewer,p=v.paddock,q=p.ponies[0];q.x=-130;q.z=240;q.y=p.ground(q.x,q.z);q.neck=0;q.headYaw=0;q.ear=0;q.amp=0;q.tail=0;q.phase=0;q.yaw=0;p.write();const T=v.camera.position.constructor,at=new T(q.x,q.y+.95,q.z+.35);v.camera.position.copy(at).add(new T(...offset));v.camera.lookAt(at);v.camera.updateMatrixWorld(true);v.scene.updateMatrixWorld(true);v.renderer.render(v.scene,v.camera);}, {offset});
await page.screenshot({path:`${out}/${label}-${name}.png`});}
assert.deepEqual(errors,[]);assert.deepEqual(external,[]);assert.deepEqual(sockets,[]);assert.deepEqual(result.sentinels,['269-original-sentinel','269-original-grass']);
const sources={};for(const f of ['src/config.js','src/paddock.js','tools/pony-surface-check.mjs'])sources[f]=createHash('sha256').update(await readFile(frozen&&['src/config.js','src/paddock.js'].includes(f)?frozen+'/'+f.split('/').pop():f)).digest('hex');
await writeFile(`${out}/${label}.json`,JSON.stringify({label,sources,fixtureRandomParityCalls:frozen?16:0,normal,cost:result.cost,errors,external,sockets,sentinels:result.sentinels},null,2)+'\n');console.log(JSON.stringify({label,cost:result.cost,normal}));
await page.close();
}finally{await browser.close();}
