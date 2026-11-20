// Public #352: the production createWindGraph (river babble + city hum loops) rendered in an OfflineAudioContext; RMS by distance / hour / indoors.
// Loads no app: a plain document from the local server, then the audio modules by import(). node tools/ambientbed352browser.cjs http://localhost:8551 out-dir
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const [base='http://localhost:8551',out='docs/verification/352']=process.argv.slice(2);
(async()=>{
 fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,args:['--no-sandbox']});
 try{
  const page=await browser.newPage();await page.goto(base+'/package.json');
  const rows=await page.evaluate(async()=>{
   const A=await import('/src/audio.js'),B=await import('/src/ambientbed.js'),C=await import('/src/config.js');
   const path=C.SITE.river.path.concat(C.SITE.river.downstream?.path??[]),[rx,rz]=path[Math.floor(path.length/2)];
   const rows=[];
   const render=async(name,sc)=>{
    const c=new OfflineAudioContext(1,48000,48000),counts={source:0,filter:0};let seed=7;
    for(const [m,k]of Object.entries({createBufferSource:'source',createBiquadFilter:'filter'})){const fn=c[m].bind(c);c[m]=()=>{counts[k]++;return fn();};}
    const g=A.createWindGraph(c,()=>((seed=seed*16807%2147483647)/2147483647));
    const w={...(await import('/src/windsound.js')).windSoundParams({power:0}),gain:0,bandGain:0};g.set(w,0,.001);
    const built={...counts},p={river:B.riverBabbleParams({dist:sc.dist,indoors:sc.indoors}),city:B.cityHumParams({hour:sc.hour,indoors:sc.indoors})};
    g.setAmbient(p,.001);g.setAmbient(p,.001);
    const d=(await c.startRendering()).getChannelData(0).slice(24000);let e=0,de=0;
    for(let i=0;i<d.length;i++){e+=d[i]*d[i];if(i)de+=(d[i]-d[i-1])**2;}
    rows.push({name,...sc,rms:Math.sqrt(e/d.length),centroidHz:e?Math.sqrt(de/e)*48000/(2*Math.PI):0,built,after:counts});
   };
   const far=1e9;
   for(const d of [0,10,25,50,70,150])await render('river '+d+' m',{dist:d,hour:3,indoors:false,only:'river'});
   await render('river 0 m indoors',{dist:0,hour:3,indoors:true});
   for(const h of [3,8,12,17,22])await render('city '+String(h).padStart(2,'0')+':00',{dist:far,hour:h,indoors:false});
   await render('city 08:00 indoors',{dist:far,hour:8,indoors:true});
   rows.riverAt={x:rx,z:rz};return rows;
  });
  fs.writeFileSync(path.join(out,'metrics.json'),JSON.stringify(rows,null,1));
  const get=n=>rows.find(r=>r.name===n).rms;
  // the river rows above also carry the night city floor; compare river rows against each other and against the far-away row
  assert.ok(get('river 0 m')>get('river 25 m')&&get('river 25 m')>get('river 50 m')&&get('river 50 m')>get('river 150 m'),'babble falls with distance');
  assert.ok(get('river 0 m indoors')<get('river 0 m')*.5,'indoor damping');
  assert.ok(get('city 08:00')>get('city 12:00')&&get('city 12:00')>get('city 03:00'),'rush > midday > night');
  assert.ok(get('city 08:00 indoors')<get('city 08:00')*.7,'indoor city damping');
  assert.ok(rows.every(r=>r.built.source===3&&r.built.filter===4&&JSON.stringify(r.built)===JSON.stringify(r.after)),'two ambient loops built once; set() builds nothing');
  for(const r of rows)console.log(r.name.padEnd(22),r.rms.toFixed(5),Math.round(r.centroidHz));
  console.log('PASS');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
