// Public #348: real app/window lifecycle and actual-model obstacles, then production graph offline.
const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('playwright');
const base=process.argv[2]||'http://127.0.0.1:8452',out='docs/verification/348';
(async()=>{
 fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const report={checks:[],errors:[],external:[]},check=(ok,name)=>{report.checks.push({ok:!!ok,name});assert(ok,name);};
 try{
  const ctx=await browser.newContext({viewport:{width:480,height:320}});
  await ctx.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():(report.external.push(r.request().url()),r.abort()));
  await ctx.addInitScript(()=>{
   const keys=['lunden.name','lunden.stats','lunden.avatar','lunden.changelogSeen','lunden.paddockGrass'];keys.forEach(k=>localStorage.setItem(k,'public348-sentinel'));
   window.__audit={contexts:[],nodes:{source:0,filter:0,gain:0,panner:0},panners:[],storage:[]};
   const AC=AudioContext;window.AudioContext=class extends AC{constructor(...args){super(...args);__audit.contexts.push(this);for(const[method,key]of Object.entries({createBufferSource:'source',createBiquadFilter:'filter',createGain:'gain',createPanner:'panner'})){const fn=this[method].bind(this);this[method]=(...a)=>{__audit.nodes[key]++;const n=fn(...a);if(key==='panner')__audit.panners.push(n);return n;};}}};
   const get=Storage.prototype.getItem,set=Storage.prototype.setItem,del=Storage.prototype.removeItem;
   Storage.prototype.getItem=function(k){__audit.storage.push(['get',k]);return get.call(this,k);};Storage.prototype.setItem=function(k,v){__audit.storage.push(['set',k]);return set.call(this,k,v);};Storage.prototype.removeItem=function(k){__audit.storage.push(['remove',k]);return del.call(this,k);};
   window.__sentinels=()=>keys.map(k=>get.call(localStorage,k));
  });
  const page=await ctx.newPage();page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
  await page.goto(base+'/?wind=.7,12&month=7');await page.waitForFunction(()=>window.lundenViewer?.renderer.info.render.frame>0,null,{timeout:300000,polling:500});
  check(await page.evaluate(()=>__audit.contexts.length===0),'default off creates no AudioContext');
  await page.evaluate(()=>{const a=lundenViewer;document.querySelector('#intro').hidden=true;window.__firstWindow=a.world.lids.find(w=>w.name==='fönstret');__firstWindow.toggle();});
  check(await page.evaluate(async()=>{const A=await import('/src/audio.js');return __firstWindow.isOpen&&!!__firstWindow.wind&&A.audioParts()===null&&A.sfx.duck()===undefined;}),'actual open window is pending before opt-in; other sounds silent');
  await page.locator('#help').click();await page.locator('#wind-sound').click();await page.waitForFunction(()=>__audit.contexts[0]?.state==='running');
  check(await page.evaluate(()=>__audit.nodes.source===3&&__audit.nodes.filter===5),'gesture creates one shared source and the existing three filters');
  report.model=await page.evaluate(async()=>{
   const A=await import('/src/audio.js'),O=await import('/src/soundocclusion.js'),{LEVELS}=await import('/src/config.js'),a=lundenViewer,w=a.world;
   a.renderer.setAnimationLoop(null);const emitters=[];
   const sets=[{id:'L1007',lids:w.lids,maps:w.roomMaps,levels:LEVELS,ox:0,oz:0},...w.units.map(u=>({id:u.id,lids:u.lids,maps:u.roomMaps,levels:u.levels,ox:u.ox,oz:u.oz}))];
   for(const set of sets)for(const win of set.lids.filter(d=>d.name==='fönstret')){
    if(!win.isOpen)win.toggle();const p=__audit.panners.at(-1),src={x:p.positionX.value,y:p.positionY.value,z:p.positionZ.value},normal={x:win.normal.x,z:win.normal.z},portal=O.windowRoomPoint(w,src,normal);
    emitters.push({id:set.id,src,normal,portal,cell:portal?{...O.cellOf(w,portal),unit:undefined}:null});win.toggle();
   }
   const cases=[];
   for(const e of emitters){const set=sets.find(s=>s.id===e.id);for(let l=0;l<set.maps.length;l++)for(const room of set.maps[l].rooms){const listener={x:room.x+set.ox,y:set.levels[l].floor+1.62,z:room.z+set.oz},oc=O.windowOcclusion(w,listener,e.src,e.normal);cases.push({id:e.id,source:e.src,normal:e.normal,listener,room:room.name,oc});}}
   const wall=cases.find(c=>c.oc?.parts.includes('wall')),floor=cases.find(c=>c.oc?.parts.includes('floor')),clear=cases.find(c=>!c.oc&&c.id==='L1007');
   let doorCase=null;
   for(const e of emitters){if(doorCase)break;const set=sets.find(s=>s.id===e.id),doors=e.id==='L1007'?w.doors:w.units.find(u=>u.id===e.id).doors;for(const d of doors){if(!d.opening||!d.segmentAt)continue;const p=d.opening(),saved=d.t;for(const sign of[-1,1]){const listener={x:p.center[0]+p.normal[0]*sign*.6,y:d.object.position.y+1.62,z:p.center[1]+p.normal[1]*sign*.6};d.t=0;const closed=O.windowOcclusion(w,listener,e.src,e.normal);if(closed?.parts.includes('door')){d.t=1;const open=O.windowOcclusion(w,listener,e.src,e.normal);doorCase={id:e.id,source:e.src,normal:e.normal,listener,closed,open};break;}}d.t=saved;if(doorCase)break;}}
   // Actual runtime handle follows a listener through a wall and back; main's quarter-second updater uses this same API.
   const runtimeWindow=__firstWindow;runtimeWindow.toggle();const p=__audit.panners.at(-1),source={x:p.positionX.value,y:p.positionY.value,z:p.positionZ.value},normal=runtimeWindow.normal;
   const ownCases=cases.filter(c=>c.id==='L1007'&&Math.hypot(c.source.x-source.x,c.source.z-source.z)<.001),blocked=ownCases.find(c=>c.oc),unblocked=ownCases.find(c=>!c.oc);
   A.updateWindowOcclusion(w,blocked.listener);const runtimeBlocked=runtimeWindow.wind.occlusion;const built={...__audit.nodes};A.updateWindowOcclusion(w,unblocked.listener);const runtimeClear=runtimeWindow.wind.occlusion;
   for(let i=0;i<4;i++)A.updateWindowOcclusion(w,unblocked.listener);const afterUpdates={...__audit.nodes};runtimeWindow.toggle();
   const cores=w.coreHouses.map(c=>({house:c.house,roomMaps:!!c.roomMaps,openWindSources:c.lids?.filter(d=>d.name==='fönstret').length??0}));
   return {emitters,cases,wall,floor,clear,doorCase,runtimeBlocked,runtimeClear,built,afterUpdates,cores};
  });
  check(report.model.emitters.every(e=>e.portal&&e.cell.flat===e.id),'all real L1007/L1004/L1201 wind portals resolve their existing room cells');
  check(!!report.model.wall&&!!report.model.floor&&!!report.model.clear,'actual public windows yield wall/slab/clear paths');
  check(report.model.doorCase?.closed.gain<report.model.doorCase?.open.gain,'actual public doorway recovers when its existing door opens');
  check(report.model.runtimeBlocked?.gain<1&&report.model.runtimeClear===null,'actual window handle attenuates then clears with listener movement');
  check(JSON.stringify(report.model.built)===JSON.stringify(report.model.afterUpdates),'occlusion updates allocate no audio nodes');
  report.offline=await page.evaluate(async({wall,floor,doorCase})=>{
   const {createWindGraph}=await import('/src/audio.js'),{windSoundParams}=await import('/src/windsound.js');const rows=[];
   const render=async(name,oc,bed=false,restore=false)=>{const c=new OfflineAudioContext(1,48000,48000),counts={source:0,filter:0,gain:0,panner:0};let seed=7;
    for(const[method,key]of Object.entries({createBufferSource:'source',createBiquadFilter:'filter',createGain:'gain',createPanner:'panner'})){const f=c[method].bind(c);c[method]=()=>{counts[key]++;return f();};}
    const g=createWindGraph(c,()=>((seed=seed*16807%2147483647)/2147483647)),v=g.window({x:0,y:0,z:0},.7),p=windSoundParams({power:.7,gust:.5,near:1,leaves:1});if(!bed)p.gain=p.bandGain=0;
    v.setOcclusion(oc);if(restore)v.setOcclusion(null);const built={...counts};g.set(p,.7,.001);g.set(p,.7,.001);if(bed)v.stop();const b=await c.startRendering(),d=b.getChannelData(0).slice(24000);let e=0,de=0;for(let i=0;i<d.length;i++){e+=d[i]**2;if(i)de+=(d[i]-d[i-1])**2;}rows.push({name,rms:Math.sqrt(e/d.length),brightness:e?Math.sqrt(de/e)*48000/(2*Math.PI):0,built,afterUpdates:counts});};
   await render('clear',null);await render('wall',wall.oc);await render('floor',floor.oc);await render('door-closed',doorCase.closed);await render('door-open',doorCase.open);await render('restored',wall.oc,false,true);await render('bed-clear',null,true);await render('bed-with-obstacle',wall.oc,true);return rows;
  },report.model);
  const row=n=>report.offline.find(r=>r.name===n);
  check(row('wall').rms<row('clear').rms&&row('wall').brightness<row('clear').brightness,'actual wall estimate makes production graph quieter and duller');
  check(row('floor').rms<row('clear').rms&&row('door-closed').rms<row('door-open').rms,'actual slab/door parameters attenuate offline output');
  check(Math.abs(row('restored').rms-row('clear').rms)<1e-8,'clear path restores unchanged window output');
  check(row('bed-clear').rms===row('bed-with-obstacle').rms&&row('bed-clear').brightness===row('bed-with-obstacle').brightness,'ambient bed is byte-numerically unchanged by window occlusion');
  check(report.offline.every(r=>r.built.source===3&&r.built.filter===5&&JSON.stringify(r.built)===JSON.stringify(r.afterUpdates)),'existing window filter/gain reused; no per-update nodes');
  await page.locator('#wind-sound').click();await page.waitForFunction(()=>__audit.contexts[0].state==='suspended');await page.locator('#wind-sound').click();await page.waitForFunction(()=>__audit.contexts[0].state==='running');
  check(await page.evaluate(()=>__audit.contexts.length===1&&__audit.nodes.source===3),'off/suspend and re-enable preserve original graph');
  report.isolation=await page.evaluate(()=>({sentinels:__sentinels(),originalAccess:__audit.storage.filter(([,k])=>String(k).startsWith('lunden.'))}));
  check(report.isolation.sentinels.every(v=>v==='public348-sentinel')&&report.isolation.originalAccess.length===0,'original storage is unread and unchanged');
  check(report.errors.length===0&&report.external.length===0,'no app/audio errors or external requests');console.log('PASS '+report.checks.length+' checks; '+report.model.emitters.length+' actual windows; '+report.offline.length+' production offline renders');
 }finally{fs.writeFileSync(out+'/result.json',JSON.stringify(report,null,2)+'\n');await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
