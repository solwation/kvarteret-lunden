import assert from 'node:assert/strict';
import {readdir,readFile} from 'node:fs/promises';
import {build} from 'esbuild';
const files=await readdir('src');
for(const file of files.filter(f=>f.endsWith('.js'))){
  const source=await readFile(`src/${file}`,'utf8');
  if (/sessionStorage/.test(source)) {
    assert.equal(file,'updates.js','Only the independent update resume may use session storage');
    assert(source.includes("const RESUME_KEY = 'kvarteret-lunden.update-resume'"));
    for(const call of source.matchAll(/sessionStorage\.(?:getItem|setItem|removeItem)\(([^,)]+)/g))assert.equal(call[1],'RESUME_KEY');
  }
  assert(!/workers\.dev|cloudflare|new\s+WebSocket|localStorage|indexedDB|Sarah|Olof|Walter|Kian|Budil|Wingren/i.test(source),`Disallowed personal/service reference in ${file}`);
  assert(!/\bplate:\s*['"`]/.test(source),`Personal name plate text in ${file}`);
}
const result=await build({entryPoints:['src/main.js'],bundle:true,write:false,format:'esm',target:'es2022',metafile:true,logLevel:'silent'});
for(const file of Object.keys(result.metafile.inputs))assert(!/\/(cloud|ghosts|furniture|stuff|contents|basket|combat|avatar|posters|drawing|leaderboard|streetlife|cheats)\.js$/.test(file),`Disallowed import ${file}`);
const plan=JSON.parse(await readFile('data/plan.json','utf8'));
assert.equal(plan.floors.length,2);
for(const floor of plan.floors)assert(floor.walls.length && floor.doors.length && floor.size.x>0);
const html=await readFile('index.html','utf8');
assert(html.includes('connect-src \'self\''));
console.log(`PASS: ${files.length} modules audited, import graph bundles, two architectural floor plans, same-origin network policy.`);
const manifest=JSON.parse(await readFile('manifest.webmanifest','utf8'));
const manifestURL=new URL('https://example.invalid/kvarteret-lunden/manifest.webmanifest');
for(const member of ['id','start_url','scope'])assert.equal(new URL(manifest[member],manifestURL).href,'https://example.invalid/kvarteret-lunden/');
assert.equal(manifest.display,'standalone');
assert(html.includes('rel="manifest" href="./manifest.webmanifest"'));
assert(html.includes('rel="apple-touch-icon" sizes="180x180" href="./icons/apple-touch-icon.png"'));
const iconFiles=[...manifest.icons,{src:'./icons/apple-touch-icon.png',sizes:'180x180'}];
assert(manifest.icons.some(i=>i.sizes==='192x192'&&i.purpose==='any'));
assert(manifest.icons.some(i=>i.sizes==='512x512'&&i.purpose==='any'));
assert(manifest.icons.some(i=>i.sizes==='512x512'&&i.purpose==='maskable'));
for(const icon of iconFiles){
  const resolved=new URL(icon.src,manifestURL);assert(resolved.href.startsWith('https://example.invalid/kvarteret-lunden/icons/'));
  const png=await readFile(icon.src);assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
  assert.equal(`${png.readUInt32BE(16)}x${png.readUInt32BE(20)}`,icon.sizes);
}
console.log('PASS: app identity/start/scope, Apple icon, PNG dimensions and Android icon declarations.');
