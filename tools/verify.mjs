import assert from 'node:assert/strict';
import {readdir,readFile} from 'node:fs/promises';
import {build} from 'esbuild';
const files=await readdir('src');
for(const file of files.filter(f=>f.endsWith('.js'))){
  const source=await readFile(`src/${file}`,'utf8');
  assert(!/workers\.dev|cloudflare|new\s+WebSocket|localStorage|sessionStorage|indexedDB|Sarah|Olof|Walter|Kian|Budil|Wingren/i.test(source),`Disallowed personal/service reference in ${file}`);
}
const result=await build({entryPoints:['src/main.js'],bundle:true,write:false,format:'esm',target:'es2022',metafile:true,logLevel:'silent'});
for(const file of Object.keys(result.metafile.inputs))assert(!/\/(cloud|ghosts|furniture|stuff|contents|basket|combat|avatar|posters|drawing|leaderboard|streetlife|cheats)\.js$/.test(file),`Disallowed import ${file}`);
const plan=JSON.parse(await readFile('data/plan.json','utf8'));
assert.equal(plan.floors.length,2);
for(const floor of plan.floors)assert(floor.walls.length && floor.doors.length && floor.size.x>0);
const html=await readFile('index.html','utf8');
assert(html.includes('connect-src \'self\''));
console.log(`PASS: ${files.length} modules audited, import graph bundles, two architectural floor plans, same-origin network policy.`);
