// Public #240: exact reviewed model and narrowly selected integration boundaries.
// Function-level since #330: only the Nordic gym record, the Grenhuset/box helpers, the sign module and the sitebackdrop hook
// are compared, never whole SITE/config files (later public ports legitimately add SITE blocks, and #249 anchored the parking
// in buildNordicGym to the drawn north ground). The original checkout is optional: NORDIC_SOURCE_REPO, ../integration or
// ../lunden-3d-apartment; without it the source-bound checks are reported as skipped and the public-only checks still run.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {existsSync,readFileSync} from 'node:fs';
import {SITE} from '../src/config.js';
const base='9e767cda8ac2957344a9f147c5b8ec3d2d400fb3',source='46f7be89a6c8a4b601d9d2158a9097abc606bfaa';
const before=p=>execFileSync('git',['show',`${base}:${p}`],{encoding:'utf8'});
const repo=[process.env.NORDIC_SOURCE_REPO,'../integration','../lunden-3d-apartment'].find(r=>{if(!r||!existsSync(r))return false;try{execFileSync('git',['-C',r,'cat-file','-e',`${source}^{commit}`],{stdio:'ignore'});return true;}catch{return false;}});
const original=p=>execFileSync('git',['-C',repo,'show',`${source}:${p}`],{encoding:'utf8',maxBuffer:4000000});
const helpers=t=>{const s=t.split('const rgb =')[1];assert(s,'rgb helper found');const h=s.split('export function buildNordicGym(')[0];assert(h!==s,'buildNordicGym found');return h;};
const gyms=SITE.east.buildings.filter(b=>b.template==='nordicgym');assert.equal(gyms.length,1,'exactly one Nordic gym record');const gym=gyms[0];
const old=await import('data:text/javascript;base64,'+Buffer.from(before('src/config.js')).toString('base64'));
const oldGym=old.SITE.east.buildings.find(b=>b.template==='nordicgym');assert.deepEqual({...gym,model:null},{...oldGym,model:null},'gym outline/levels/placement unchanged apart from the reviewed model');
const src=readFileSync('src/sitebackdrop.js','utf8');assert(src.includes('buildNordicGym(b,p,base,bottom,parts,ground)'));assert.equal(src.match(/for\(const b of records.filter\(b=>b.template==='nordicgym'/g)?.length,1);
if(repo){
 const record=JSON.parse(original('src/config.js').split('\n').find(l=>l.includes('"template":"nordicgym"')).trim().replace(/,$/,''));assert.deepEqual(gym.model,record.model);
 assert.equal(helpers(readFileSync('src/nordicgym.js','utf8')),helpers(original('src/nordicgym.js')),'box/Grenhuset helpers equal the reviewed source');
 assert.equal(readFileSync('src/nordicgymsign.js','utf8').split('\n').slice(1).join('\n'),original('src/nordicgymsign.js'));
}else console.log(`SKIP source-bound model/helper/sign checks: original commit ${source} not available (set NORDIC_SOURCE_REPO)`);
const oldModel=await import('data:text/javascript;base64,'+Buffer.from(before('src/nordicgym.js').replace("from 'three'",`from '${import.meta.resolve('three')}'`)).toString('base64'));
const parts={facade:[],roof:[],glass:[]};oldModel.buildNordicGym(oldGym,oldGym.polygon.slice(0,-1),5,4.5,parts);const triangles=Object.values(parts).flat().reduce((n,g)=>n+g.attributes.position.count/3,0);
console.log(`PASS ${repo?'exact final model/sign and helpers, ':''}unchanged gym record and reviewed ground/sign hooks`);console.log('Baseline flat gym/Grenhuset contribution',triangles,'→2853 (+sign2), net',2855-triangles);
