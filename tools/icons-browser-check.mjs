import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';
const base=(process.argv[2]??'http://localhost:8167').replace(/\/$/,''),out=process.argv[3]??'/tmp/kvarteret-icons';await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,headless:true,args:['--no-sandbox']});
const results=[],errors=[];
try{
 const context=await browser.newContext();
 // Serve the actual build beneath a Pages-like prefix, isolating metadata from costly 3D startup.
 await context.route('**/kvarteret-lunden/**',async route=>{
  const path=new URL(route.request().url()).pathname.replace('/kvarteret-lunden/','');
  if(path.startsWith('assets/viewer-'))return route.fulfill({contentType:'text/javascript',body:''});
  const file='dist/'+(path||'index.html');
  return route.fulfill({path:file,contentType:path.endsWith('.webmanifest')?'application/manifest+json':path.endsWith('.png')?'image/png':path.endsWith('.css')?'text/css':path.endsWith('.svg')?'image/svg+xml':'text/html'});
 });
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/kvarteret-lunden/?v=old-release');
 const session=await context.newCDPSession(page),native=await session.send('Page.getAppManifest');assert.equal(native.errors.length,0);assert(native.url.endsWith('/kvarteret-lunden/manifest.webmanifest'));
 const manifest=JSON.parse(native.data),url=new URL(native.url);
 for(const key of ['id','start_url','scope'])assert.equal(new URL(manifest[key],url).pathname,'/kvarteret-lunden/');assert.equal(new URL(manifest.start_url,url).search,'');assert.equal(manifest.display,'standalone');assert.equal(manifest.name,'Kvarteret Lunden');
 const apple=await page.locator('link[rel="apple-touch-icon"]').getAttribute('href');assert.equal(new URL(apple,page.url()).pathname,'/kvarteret-lunden/icons/apple-touch-icon.png');
 const icons=[...manifest.icons,{src:apple,sizes:'180x180',purpose:'apple'}];
 for(const icon of icons){
  const image=await page.evaluate(async({src})=>{const img=new Image();img.src=src;await img.decode();const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const g=c.getContext('2d');g.drawImage(img,0,0);const pixels=g.getImageData(0,0,c.width,c.height).data;let opaque=true,light=0,outsideSafe=0;for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++){const i=(y*c.width+x)*4;if(pixels[i+3]!==255)opaque=false;if(pixels[i]>180&&pixels[i+1]>180&&pixels[i+2]>180){light++;if(Math.hypot(x/c.width-.5,y/c.height-.5)>.4)outsideSafe++;}}return {width:img.width,height:img.height,opaque,light,outsideSafe};},{src:new URL(icon.src,url).href});
  assert.equal(`${image.width}x${image.height}`,icon.sizes);assert(image.opaque&&image.light>100);if(icon.purpose==='maskable')assert.equal(image.outsideSafe,0);results.push({src:icon.src,purpose:icon.purpose,...image});
 }
 // Actual icon sheet: useful for visual review without claiming a physical install.
 await page.evaluate(async()=>{const m=await(await fetch('./manifest.webmanifest')).json();const main=document.createElement('section');main.style.cssText='position:fixed;inset:0;background:#ecebe5;display:flex;align-items:center;justify-content:center;gap:40px;z-index:9999';for(const name of ['apple-touch-icon.png','icon-192.png','icon-512.png','maskable-512.png']){const box=document.createElement('div');box.style.cssText='color:#283d33;text-align:center';const img=document.createElement('img');img.src='./icons/'+name;img.width=img.height=128;const text=document.createElement('p');text.textContent=name;box.append(img,text);main.append(box);}document.body.append(main);await Promise.all([...main.querySelectorAll('img')].map(i=>i.decode()));});
 await page.screenshot({path:out+'/icons.png'});assert.deepEqual(errors,[]);await writeFile(out+'/results.json',JSON.stringify({native:{url:native.url,errors:native.errors},manifest,icons:results,errors},null,2));console.log(`PASS: native manifest under Pages prefix, stable app/start/scope URLs, four decoded opaque PNGs, maskable safe zone; ${out}`);
}finally{await browser.close();}
