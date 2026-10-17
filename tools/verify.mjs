import assert from 'node:assert/strict';
import {readdir,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {build} from 'esbuild';
// Personal-reference guard. The forbidden words are stored only as SHA-256 hashes of their
// NFC-normalised, lowercased form, so the public source never spells them out. Like the former
// case-insensitive regex, a word matches anywhere in a file, also inside identifiers and strings.
// Optional extra letter-only words (one per line, '#' comments) can be kept in the git-ignored
// tools/private-denylist.txt.
const normalise=text=>text.normalize('NFC').toLowerCase();
const sha256=text=>createHash('sha256').update(text).digest('hex');
const deniedHashes=new Set([
  'd233633d9524e84c71d6fe45eb3836f8919148e4a5fc2234cc9e6494ec0f11c2',
  'b162324935087c6b966f4c28aeadd3fa01b3e9b02645d5b80fbab3dc0e2ede41',
  '4748d4c802a775e8db9a23ec58f0986cacdc5d2d3356d22c490a7d22331ff133',
  '8b2cd4d1d0b36dbbb821266ea3e82f5c14c608d3766f823334d90118730cf329',
  '0cb6d47421bcf3f9b601e0c4da13cd242e0277b9936e20ca51cdc18e19cbcb34',
  '240910c0adbd4c324372c73437c29c8f3a38b4555259a19080af6cc5c63f033d',
]);
const deniedLengths=new Set([4,5,6,7]); // character lengths of the hashed words
try {
  for(const line of (await readFile('tools/private-denylist.txt','utf8')).split(/\r?\n/)){
    const word=normalise(line.replace(/#.*/,'').trim());
    if(word){deniedHashes.add(sha256(word));deniedLengths.add([...word].length);}
  }
} catch(error) { if(error.code!=='ENOENT')throw error; }
const hasDeniedWord=source=>{
  const windows=new Set();
  // Only letter runs can contain a word; slide every hashed length over each run.
  for(const [run] of normalise(source).matchAll(/\p{L}+/gu)){
    const chars=[...run];
    for(const length of deniedLengths)for(let i=0;i+length<=chars.length;i++)windows.add(chars.slice(i,i+length).join(''));
  }
  for(const window of windows)if(deniedHashes.has(sha256(window)))return true;
  return false;
};
const files=await readdir('src');
for(const file of files.filter(f=>f.endsWith('.js'))){
  const source=await readFile(`src/${file}`,'utf8');
  if (/sessionStorage/.test(source)) {
    assert.equal(file,'updates.js','Only the independent update resume may use session storage');
    assert(source.includes("const RESUME_KEY = 'kvarteret-lunden.update-resume'"));
    assert(source.includes("const GL_RELOAD_KEY = 'kvarteret-lunden.gl-reload-at'"));
    for(const call of source.matchAll(/sessionStorage\.(?:getItem|setItem|removeItem)\(([^,)]+)/g))assert(['RESUME_KEY','GL_RELOAD_KEY'].includes(call[1]));
  }
  if (/localStorage/.test(source)) {
    // #30: only the own touch layout keeps a per-device preference, under this project's own key.
    assert.equal(file,'touchlayout.js','Only the own touch layout may use local storage');
    assert(source.includes("const KEY = 'kvarteret-lunden.touch-layout'"));
    for(const call of source.matchAll(/localStorage\.(?:getItem|setItem|removeItem)\(([^,)]+)/g))assert.equal(call[1],'KEY');
  }
  assert(!/workers\.dev|cloudflare|new\s+WebSocket|indexedDB/i.test(source),`Disallowed service reference in ${file}`);
  assert(!hasDeniedWord(source),`Disallowed personal reference in ${file}`);
  assert(!/\bplate:\s*['"`]/.test(source),`Personal name plate text in ${file}`);
}
const result=await build({entryPoints:['src/main.js'],bundle:true,write:false,format:'esm',target:'es2022',metafile:true,logLevel:'silent'});
for(const file of Object.keys(result.metafile.inputs))assert(!/\/(cloud|ghosts|furniture|stuff|contents|basket|combat|avatar|posters|drawing|leaderboard|streetlife|cheats)\.js$/.test(file),`Disallowed import ${file}`);
const plan=JSON.parse(await readFile('data/plan.json','utf8'));
assert.equal(plan.floors.length,2);
for(const floor of plan.floors)assert(floor.walls.length && floor.doors.length && floor.size.x>0);
const html=await readFile('index.html','utf8');
assert(html.includes('connect-src \'self\''));
// Every inline script (import map, startup guard #37) must be allowed by its exact hash in the CSP.
const csp=html.match(/Content-Security-Policy" content="([^"]+)"/)[1];
for(const [,code] of html.matchAll(/<script(?: type="importmap")?>([\s\S]*?)<\/script>/g))assert(csp.includes(`'sha256-${createHash('sha256').update(code).digest('base64')}'`),'Inline script hash missing from the CSP');
assert(/import\('\.\/src\/main\.js'\)/.test(html),'The startup guard must import main.js');
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
