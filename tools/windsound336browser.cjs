// Public #336: actual viewer opt-in/window lifecycle + production graph rendered offline; no audio files/services.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const [base='http://localhost:8446',out='docs/verification/336']=process.argv.slice(2);
(async()=>{
 fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const report={checks:[],errors:[],external:[]};const check=(ok,name)=>{report.checks.push({ok:!!ok,name});assert.ok(ok,name);};
 try{
  const ctx=await browser.newContext({viewport:{width:480,height:320},deviceScaleFactor:1});
  await ctx.route('**/*',r=>{if(!r.request().url().startsWith(base+'/')){report.external.push(r.request().url());return r.abort();}return r.continue();});
  await ctx.addInitScript(()=>{
   const keys=['lunden.name','lunden.stats','lunden.changelogSeen','lunden.avatar','lunden.paddockGrass'];
   keys.forEach(k=>localStorage.setItem(k,'wind-isolation-sentinel'));
   const AC=globalThis.AudioContext||globalThis.webkitAudioContext;
   window.__windAudit={contexts:[],storage:[],nodes:{source:0,filter:0,panner:0,gain:0}};
   if(AC)globalThis.AudioContext=class extends AC{constructor(...args){super(...args);__windAudit.contexts.push(this);for(const [method,key]of Object.entries({createBufferSource:'source',createBiquadFilter:'filter',createPanner:'panner',createGain:'gain'})){const actual=this[method].bind(this);this[method]=(...a)=>{__windAudit.nodes[key]++;return actual(...a);};}}};
   const get=Storage.prototype.getItem,set=Storage.prototype.setItem,del=Storage.prototype.removeItem;
   Storage.prototype.getItem=function(k){__windAudit.storage.push(['get',k]);return get.call(this,k);};
   Storage.prototype.setItem=function(k,v){__windAudit.storage.push(['set',k]);return set.call(this,k,v);};
   Storage.prototype.removeItem=function(k){__windAudit.storage.push(['remove',k]);return del.call(this,k);};
   window.__sentinels=()=>keys.map(k=>get.call(localStorage,k));
  });
  const page=await ctx.newPage();page.on('pageerror',e=>report.errors.push(e.message));
  await page.goto(base+'/?wind=.7,12&month=7');
  await page.waitForFunction(()=>window.lundenViewer?.renderer.info.render.frame>0,null,{timeout:300000,polling:500});
  check(await page.evaluate(()=>__windAudit.contexts.length===0),'no audio context before explicit opt-in');
  await page.evaluate(()=>{document.querySelector('#start').click();document.exitPointerLock?.();document.querySelector('#resume').hidden=true;});
  report.pendingWindow=await page.evaluate(async()=>{
   const A=await import('/src/audio.js'),a=lundenViewer,w=a.world.lids.find(d=>d.name==='fönstret');
   if(!w)throw Error('No actual public window');w.toggle();window.__testWindWindow=w;
   return {open:w.isOpen,handle:!!w.wind,noAudio:A.audioParts()===null,otherSilent:A.sfx.cupboard()===undefined&&A.sfx.duck()===undefined};
  });
  check(Object.values(report.pendingWindow).every(Boolean),'actual world window can open before opt-in; other sfx stay silent');
  await page.locator('#help').click();
  check(await page.locator('#wind-sound').getAttribute('aria-pressed')==='false','wind control starts off');
  await page.locator('#wind-sound').click();
  await page.waitForFunction(()=>document.querySelector('#wind-sound').getAttribute('aria-pressed')==='true');
  report.enabled=await page.evaluate(()=>({contexts:__windAudit.contexts.length,state:__windAudit.contexts[0].state,nodes:{...__windAudit.nodes}}));
  check(report.enabled.contexts===1&&report.enabled.state==='running'&&report.enabled.nodes.source===1&&report.enabled.nodes.filter===3,'gesture creates one running noise source, bed plus actual open-window filter');
  await page.evaluate(()=>__testWindWindow.toggle());
  const once=await page.evaluate(()=>({...__windAudit.nodes}));
  await page.waitForTimeout(750);
  check(JSON.stringify(await page.evaluate(()=>__windAudit.nodes))===JSON.stringify(once),'repeated scene wind updates allocate no new audio nodes');
  await page.locator('#wind-sound').click();
  await page.waitForFunction(()=>document.querySelector('#wind-sound').getAttribute('aria-pressed')==='false'&&__windAudit.contexts[0].state==='suspended');
  check(true,'off control silences and suspends the context');
  await page.locator('#wind-sound').click();await page.waitForFunction(()=>__windAudit.contexts[0].state==='running');
  check(await page.evaluate(()=>__windAudit.contexts.length===1&&__windAudit.nodes.source===1),'re-enable reuses the same context and noise source');
  // Synthetic sound evidence uses the exact production graph, not a reimplemented audio formula.
  report.audio=await page.evaluate(async()=>{
   const A=await import('/src/audio.js'),W=await import('/src/windsound.js'),rows=[];
   const render=async(name,power,indoors=false,leaves=1,window=false,closed=false)=>{
    const c=new OfflineAudioContext(1,48000,48000),counts={source:0,filter:0,panner:0};let seed=7;
    for(const [method,key]of Object.entries({createBufferSource:'source',createBiquadFilter:'filter',createPanner:'panner'})){const fn=c[method].bind(c);c[method]=()=>{counts[key]++;return fn();};}
    const graph=A.createWindGraph(c,()=>((seed=seed*16807%2147483647)/2147483647));
    const p=W.windSoundParams({power,gust:.5,leaves,near:1,indoors});
    const voice=window?graph.window({x:0,y:0,z:0},power):null;
    if(window){p.gain=0;p.bandGain=0;}const built={...counts};graph.set(p,power,.001);graph.set(p,power,.001);if(closed)voice.stop();
    const b=await c.startRendering(),d=b.getChannelData(0).slice(24000);let e=0,de=0;
    for(let i=0;i<d.length;i++){e+=d[i]*d[i];if(i)de+=(d[i]-d[i-1])**2;}
    rows.push({name,power,indoors,leaves,rms:Math.sqrt(e/d.length),brightness:e?Math.sqrt(de/e)*48000/(2*Math.PI):0,built,afterSet:counts});
   };
   for(const p of [0,.12,1]){await render('out-'+p,p);await render('in-'+p,p,true);}
   await render('winter',.7,false,0);await render('summer',.7);
   await render('window-low',.12,false,1,true);await render('window-high',1,false,1,true);await render('window-closed',1,false,1,true,true);
   return rows;
  });
  const get=name=>report.audio.find(r=>r.name===name);
  check(get('out-1').rms>get('out-0.12').rms&&get('out-0.12').rms>get('out-0').rms,'rendered outdoor wind rises with shared power');
  check([0,.12,1].every(p=>get('in-'+p).rms<get('out-'+p).rms*.6),'rendered indoor wind is substantially damped');
  check(get('summer').brightness>get('winter').brightness,'summer leaves and bare winter branches have distinct spectra');
  check(get('window-high').rms>get('window-low').rms&&get('window-closed').rms===0,'window follows same strength and stopping disconnects its sound');
  check(report.audio.every(r=>r.built.source===1&&r.built.filter===(r.name.startsWith('window')?3:2)&&JSON.stringify(r.built)===JSON.stringify(r.afterSet)),'one shared source, two bed filters, no nodes created by parameter updates');
  report.isolation=await page.evaluate(()=>({unchanged:__sentinels().every(v=>v==='wind-isolation-sentinel'),originalAccess:__windAudit.storage.filter(([,k])=>String(k).startsWith('lunden.')),storage:__windAudit.storage}));
  check(report.isolation.unchanged&&report.isolation.originalAccess.length===0&&report.external.length===0,'original storage untouched/unread and no external requests');
  // Capture only the changed control; stop rendering before raising the viewport for readable native DOM pixels.
  await page.evaluate(()=>lundenViewer.renderer.setAnimationLoop(null));await page.setViewportSize({width:1100,height:900});
  await page.locator('#help-dialog').screenshot({path:path.join(out,'wind-control.png')});
  check(report.errors.length===0,'actual viewer and offline audio report no errors');
  fs.writeFileSync(path.join(out,'result.json'),JSON.stringify(report,null,2)+'\n');
  console.log('ALL PASS '+report.checks.length+'; '+report.audio.length+' offline renders; no external requests/original storage access');
  for(const r of report.audio)console.log(r.name,'RMS',r.rms.toFixed(6),'brightness',Math.round(r.brightness));
 }finally{fs.writeFileSync(path.join(out,'result.json'),JSON.stringify(report,null,2)+'\n');await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
