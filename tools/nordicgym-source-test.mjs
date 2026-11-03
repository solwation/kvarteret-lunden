// Public #240: exact reviewed model and narrowly selected integration boundaries.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {SITE} from '../src/config.js';
const base='9e767cda8ac2957344a9f147c5b8ec3d2d400fb3',repo=process.env.NORDIC_SOURCE_REPO??'../integration',source='46f7be89a6c8a4b601d9d2158a9097abc606bfaa';
const original=p=>execFileSync('git',['-C',repo,'show',`${source}:${p}`],{encoding:'utf8',maxBuffer:4000000}),before=p=>execFileSync('git',['show',`${base}:${p}`],{encoding:'utf8'});
const sourceConfig=original('src/config.js'),record=JSON.parse(sourceConfig.split('\n').find(l=>l.includes('"template":"nordicgym"')).trim().replace(/,$/,'')),gym=SITE.east.buildings.find(b=>b.template==='nordicgym');assert.deepEqual(gym.model,record.model);
const old=await import('data:text/javascript;base64,'+Buffer.from(before('src/config.js')).toString('base64'));
const clean=s=>({...s,east:{...s.east,buildings:s.east.buildings.map(b=>b.template==='nordicgym'?{...b,model:null}:b)}});assert.deepEqual(clean(SITE),clean(old.SITE));
assert.equal(readFileSync('src/nordicgym.js','utf8').split('const rgb =')[1],original('src/nordicgym.js').split('const rgb =')[1]);
assert.equal(readFileSync('src/nordicgymsign.js','utf8').split('\n').slice(1).join('\n'),original('src/nordicgymsign.js'));
const src=readFileSync('src/sitebackdrop.js','utf8');assert(src.includes('buildNordicGym(b,p,base,bottom,parts,ground)'));assert.equal(src.match(/for\(const b of records.filter\(b=>b.template==='nordicgym'/g)?.length,1);
const oldModel=await import('data:text/javascript;base64,'+Buffer.from(before('src/nordicgym.js').replace("from 'three'",`from '${import.meta.resolve('three')}'`)).toString('base64'));
const parts={facade:[],roof:[],glass:[]};const g=old.SITE.east.buildings.find(b=>b.template==='nordicgym');oldModel.buildNordicGym(g,g.polygon.slice(0,-1),5,4.5,parts);const triangles=Object.values(parts).flat().reduce((n,g)=>n+g.attributes.position.count/3,0);
console.log('PASS exact final model/config/sign, unchanged other SITE records and reviewed ground/sign hooks');console.log('Baseline flat gym/Grenhuset contribution',triangles,'→2853 (+sign2), net',2855-triangles);
