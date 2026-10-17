// #30 (adapted from the original's tools/touchcustomtest.cjs, upstream 1af9b39): the own touch layout in the real
// built app. Mobile Chromium with CDP touch: open the editor from the help dialog, drag the stick, resize with the
// slider and a pinch, set opacity, mirror, save, cancel, reset, persistence after reload, rotation clamping, a scaled
// stick that still walks, blocked storage, the desktop without the entry and the original app's keys untouched.
// Usage: CHROME_PATH=... node tools/touchcustom-check.mjs BASE OUT
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const base=process.argv[2]??'http://localhost:8157';
const out=process.argv[3]??'artifacts/touchcustom';
await mkdir(out,{recursive:true});
const KEY='kvarteret-lunden.touch-layout';
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
const errors=[],external=[],results={};
const IDS=['joystick','action','measure'];
const frame=p=>p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
async function openApp(context){
 const p=await context.newPage();p.setDefaultTimeout(30000);
 p.on('pageerror',e=>errors.push(e.message));
 p.on('request',r=>{if(new URL(r.url()).origin!==new URL(base).origin)external.push(r.url());});
 await p.goto(base);
 await p.waitForFunction(()=>window.lundenViewer?.renderer.info.render.frame>0,null,{timeout:120000});
 await p.evaluate(()=>window.lundenViewer.renderer.setAnimationLoop(null));
 return p;
}
const render=p=>p.evaluate(()=>{const v=window.lundenViewer;v.renderer.render(v.scene,v.camera);});
const rects=p=>p.evaluate(ids=>Object.fromEntries(ids.map(id=>{const el=document.getElementById(id),b=el.getBoundingClientRect();
 return[id,{l:b.left,t:b.top,r:b.right,b:b.bottom,w:b.width,h:b.height,cx:(b.left+b.right)/2,cy:(b.top+b.bottom)/2,style:el.getAttribute('style')||'',opacity:+getComputedStyle(el).opacity}];})),[...IDS,'help','place-toggle']);
const showAction=p=>p.evaluate(()=>{const a=document.getElementById('action');a.hidden=false;a.textContent='Öppna dörren';});
async function openEditor(p,shot){
 await p.locator('#help').tap();
 assert(await p.locator('#help-dialog').evaluate(d=>d.open));
 assert(await p.locator('#touch-layout-open').isVisible(),'touch: the help dialog offers the editor');
 if(shot)await p.screenshot({path:shot});
 await p.locator('#touch-layout-open').tap();
 assert.equal(await p.locator('#help-dialog').evaluate(d=>d.open),false,'help closes when the editor opens');
 assert(await p.evaluate(()=>window.lundenViewer.touchLayout.editing),'editor open');
 await frame(p);
}
async function touchDrag(cdp,p,from,to,steps=8){
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:from.x,y:from.y,id:1}]});
 for(let i=1;i<=steps;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:from.x+(to.x-from.x)*i/steps,y:from.y+(to.y-from.y)*i/steps,id:1}]});
 // a finger rests before lifting: without this pause the emulated instant drag leaves a fling that eats the next tap
 await p.waitForTimeout(200);await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:to.x,y:to.y,id:1}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 await frame(p);
}
const slider=(p,cls,v)=>p.evaluate(([cls,v])=>{const i=document.querySelector(`#touch-edit .${cls}`);i.value=String(v);i.dispatchEvent(new Event('input',{bubbles:true}));},[cls,v]);
const stored=p=>p.evaluate(k=>localStorage.getItem(k),KEY);
const sep=(a,b)=>Math.max(b.l-a.r,a.l-b.r,b.t-a.b,a.t-b.b);
function inside(r,w,h,label){for(const id of IDS)assert(r[id].l>=-0.5&&r[id].t>=-0.5&&r[id].r<=w+0.5&&r[id].b<=h+0.5,`${id} off-screen ${label}`);
 for(const id of IDS)assert(r[id].t>=Math.max(r.help.b,r['place-toggle'].b)+3,`${id} above the top controls ${label}`);}
try{
 const mobile=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:1});
 await mobile.addInitScript(()=>{if(!sessionStorage.getItem('qa-seeded')){sessionStorage.setItem('qa-seeded','1');localStorage.setItem('lunden.touchLayout','original-layout-sentinel');}});
 const m=await openApp(mobile);
 await m.locator('#start').tap();
 await m.evaluate(()=>window.lundenViewer.moveTo('home'));await render(m);await showAction(m);
 const def=await rects(m);
 for(const id of IDS)assert.equal(def[id].style,'',`default layout writes no inline style on ${id}`);
 const cdp=await mobile.newCDPSession(m);

 // Open from the help dialog; every control is shown, outlined and the action selected.
 await openEditor(m,`${out}/0-help.png`);
 await m.screenshot({path:`${out}/1-editor-default.png`});
 assert.equal(await m.locator('#touch-edit .te-name').textContent(),'Öppna/Stäng');

 // Move: drag the stick up and right.
 await touchDrag(cdp,m,{x:def.joystick.cx,y:def.joystick.cy},{x:def.joystick.cx+60,y:def.joystick.cy-150});
 let r=await rects(m);
 assert(Math.abs(r.joystick.cx-def.joystick.cx-60)<2&&Math.abs(r.joystick.cy-def.joystick.cy+150)<2,`stick moved ${r.joystick.cx-def.joystick.cx},${r.joystick.cy-def.joystick.cy}`);
 assert.equal(await m.locator('#touch-edit .te-name').textContent(),'Spaken');
 // Size with the slider (stick to 1.5×) and opacity (stick to 0.3).
 await slider(m,'te-size',100);await slider(m,'te-opacity',0);await frame(m);
 r=await rects(m);
 assert(Math.abs(r.joystick.w/def.joystick.w-1.5)<.02,`stick scale ${r.joystick.w/def.joystick.w}`);
 assert(Math.abs(r.joystick.opacity-.3)<.01,`stick opacity ${r.joystick.opacity}`);
 // Pinch the measure button larger.
 const mc={x:r.measure.cx,y:r.measure.cy};
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:mc.x,y:mc.y,id:1}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:mc.x,y:mc.y,id:1},{x:mc.x-40,y:mc.y,id:2}]});
 for(let i=1;i<=6;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:mc.x,y:mc.y,id:1},{x:mc.x-40-i*1.5,y:mc.y,id:2}]});
 await m.waitForTimeout(200);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await frame(m);
 r=await rects(m);
 const pinch=r.measure.h/def.measure.h;
 assert(pinch>1.15&&pinch<1.3,`pinch scale ${pinch}`);
 // Drag the action pill far off the left edge: it is clamped inside the safe area.
 await touchDrag(cdp,m,{x:r.action.cx,y:r.action.cy},{x:2,y:r.action.cy-40});
 r=await rects(m);inside(r,390,844,'after an overshooting drag');
 assert(r.action.l<8,'action clamped to the left edge');
 await m.screenshot({path:`${out}/2-editor-moved.png`});
 // Cancel throws everything away.
 await m.locator('#touch-edit .te-cancel').tap();await frame(m);
 r=await rects(m);
 for(const id of IDS)assert(Math.abs(r[id].cx-def[id].cx)<.5&&Math.abs(r[id].cy-def[id].cy)<.5&&r[id].style==='',`cancel restores ${id}`);
 assert.equal(await stored(m),null,'cancel stores nothing');

 // Edit again, mirror, save.
 await openEditor(m);
 await touchDrag(cdp,m,{x:def.joystick.cx,y:def.joystick.cy},{x:def.joystick.cx+40,y:def.joystick.cy-100});
 await slider(m,'te-size',100);await slider(m,'te-opacity',50);
 await m.locator('#touch-edit .te-mirror-box').tap();await frame(m);
 r=await rects(m);
 assert(r.joystick.cx>195&&r.action.cx<195&&r.measure.cx<195,'mirrored: stick right, buttons left');
 inside(r,390,844,'mirrored');
 await m.screenshot({path:`${out}/3-editor-mirrored.png`});
 await m.locator('#touch-edit .te-save').tap();await frame(m);
 assert.equal(await m.evaluate(()=>window.lundenViewer.touchLayout.editing),false);
 const saved=JSON.parse(await stored(m));
 assert(saved.mirror===true&&saved.c.joystick.s===1.5&&Math.abs(saved.c.joystick.o-.65)<1e-9,`saved ${JSON.stringify(saved)}`);
 await showAction(m);await frame(m);
 const after=await rects(m);inside(after,390,844,'saved');
 await render(m);await m.screenshot({path:`${out}/4-saved-play.png`});
 // The scaled, moved stick still walks with its own touch, and its knob reaches the rim as by default (travel = (size − 12 px) / 2 in the stick's own units, #31).
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:after.joystick.cx,y:after.joystick.cy-after.joystick.w*.48,id:5}]});
 const walk=await m.evaluate(()=>{const s=document.getElementById('joystick'),k=s.querySelector('span').getBoundingClientRect(),b=s.getBoundingClientRect();return{y:window.lundenViewer.navigation.analog.y,knob:((b.top+b.bottom)/2-(k.top+k.bottom)/2)/b.height,expect:(1-12*(b.width/s.offsetWidth)/b.height)/2};});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
 assert(walk.y>.9&&Math.abs(walk.knob-walk.expect)<.01,`scaled stick walk ${JSON.stringify(walk)}`);

 // Persistence after reload.
 await m.reload();
 await m.waitForFunction(()=>window.lundenViewer?.renderer.info.render.frame>0,null,{timeout:120000});
 await m.evaluate(()=>window.lundenViewer.renderer.setAnimationLoop(null));
 await m.locator('#start').tap();await showAction(m);await frame(m);
 const reloaded=await rects(m);
 for(const id of IDS)assert(Math.abs(reloaded[id].cx-after[id].cx)<1&&Math.abs(reloaded[id].cy-after[id].cy)<1&&Math.abs(reloaded[id].w-after[id].w)<1&&Math.abs(reloaded[id].opacity-after[id].opacity)<.01,`reload keeps ${id} ${JSON.stringify([reloaded[id],after[id]])}`);
 await render(m);await m.screenshot({path:`${out}/5-reloaded.png`});
 // Rotation: re-measured and clamped in landscape, back again in portrait.
 await m.setViewportSize({width:844,height:390});await m.evaluate(()=>dispatchEvent(new Event('resize')));
 await m.waitForTimeout(600);
 const land=await rects(m);inside(land,844,390,'landscape');
 assert(land.joystick.cx>422&&land.action.cx<422,'mirroring kept in landscape');
 await render(m);await m.screenshot({path:`${out}/6-landscape.png`});
 await openEditor(m);await m.screenshot({path:`${out}/6b-landscape-editor.png`});
 const bar=await m.locator('#touch-edit .te-bar').boundingBox();
 assert(bar.y>=0&&bar.x>=0&&bar.x+bar.width<=844&&bar.y+bar.height<=390/2,'landscape editor bar fits');
 await m.locator('#touch-edit .te-cancel').tap();await frame(m);
 await m.setViewportSize({width:390,height:844});await m.evaluate(()=>dispatchEvent(new Event('resize')));
 await m.waitForTimeout(600);
 const back=await rects(m);
 for(const id of IDS)assert(Math.abs(back[id].cx-reloaded[id].cx)<1.5&&Math.abs(back[id].cy-reloaded[id].cy)<1.5,`rotation round trip ${id}`);
 // Escape cancels too; the walking keys do not reach the view while editing.
 await openEditor(m);
 await m.keyboard.down('KeyW');const keys=await m.evaluate(()=>window.lundenViewer.navigation.keys.size);await m.keyboard.up('KeyW');
 assert.equal(keys,0,'no walking keys while editing');
 await m.keyboard.press('Escape');assert.equal(await m.evaluate(()=>window.lundenViewer.touchLayout.editing),false,'Esc cancels');
 // Reset to the default thumb arc, save: storage cleared, no inline styles, the #29 positions back.
 await openEditor(m);
 await m.locator('#touch-edit .te-reset').tap();await frame(m);
 assert.equal(await m.locator('#touch-edit .te-mirror-box').isChecked(),false);
 await m.locator('#touch-edit .te-save').tap();await showAction(m);await frame(m);
 const reset=await rects(m);
 for(const id of IDS)assert(Math.abs(reset[id].cx-def[id].cx)<.5&&Math.abs(reset[id].cy-def[id].cy)<.5&&reset[id].style==='',`reset restores ${id}`);
 assert.equal(await stored(m),null,'reset clears storage');
 for(let i=0;i<IDS.length;i++)for(let j=i+1;j<IDS.length;j++)assert(sep(reset[IDS[i]],reset[IDS[j]])>=7.5,'default arc gaps');
 assert.equal(await m.evaluate(()=>localStorage.getItem('lunden.touchLayout')),'original-layout-sentinel','original app key untouched');
 results.mobile={def,after,reloaded,landscape:land,reset,pinch,saved};

 // Blocked storage: saving works for the visit without errors.
 const blocked=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:1});
 await blocked.addInitScript(()=>{const no=()=>{throw new DOMException('blocked','SecurityError');};Object.defineProperty(window,'localStorage',{get:no,configurable:true});});
 const b=await openApp(blocked);await b.locator('#start').tap();await showAction(b);
 const bdef=await rects(b),bcdp=await blocked.newCDPSession(b);
 await openEditor(b);
 await touchDrag(bcdp,b,{x:bdef.joystick.cx,y:bdef.joystick.cy},{x:bdef.joystick.cx+50,y:bdef.joystick.cy-80});
 await b.locator('#touch-edit .te-save').tap();await frame(b);
 const bafter=await rects(b);
 assert(Math.abs(bafter.joystick.cx-bdef.joystick.cx-50)<2,'blocked storage: layout holds for the visit');
 results.blocked={moved:bafter.joystick.cx-bdef.joystick.cx};

 // Desktop: no entry, no inline styles.
 const desk=await browser.newContext({viewport:{width:1000,height:700},deviceScaleFactor:1});
 await desk.addInitScript(k=>localStorage.setItem(k,JSON.stringify({mirror:true,c:{measure:{x:-1,y:-.2,s:1.5,o:.5}}})),KEY);
 const d=await openApp(desk);
 assert.equal(await d.locator('#touch-layout-open').isVisible(),false,'desktop: no editor entry');
 assert.equal(await d.evaluate(()=>document.getElementById('measure').getAttribute('style')),null,'desktop ignores a stored touch layout');
 results.desktop=true;
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
 await writeFile(`${out}/touchcustom-results.json`,JSON.stringify({results,errors,external},null,2));
 console.log(JSON.stringify({passed:true,pinch,saved,blocked:results.blocked},null,1));
}finally{await browser.close();}
