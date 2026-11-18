import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {SOUTH_BRIDGE_APPROACH as A} from '../src/config.js';
import {southBankGround,southBankCentre} from '../src/southbank.js';
import {groundY} from '../src/surroundings.js';
const baseline='2636f11d4374e332df3c6f81d545b13d41e122e9';
const original=execFileSync('git',['show',baseline+':src/southbank.js'],{encoding:'utf8'});
const old=await import('data:text/javascript;base64,'+Buffer.from(original.replace("'./config.js'",JSON.stringify(new URL('../src/config.js',import.meta.url).href))).toString('base64'));
const near=(a,b,e=1e-6)=>assert(Math.abs(a-b)<e,`${a} / ${b}`);
test('local guessed grade joins value and tangent on road/GC/walking margins',()=>{
 let max=0;for(const dx of [-6,0,6])for(let z=147;z<204;z+=.02){const x=southBankCentre(z)+dx,h=groundY(x,z),next=groundY(southBankCentre(z+.02)+dx,z+.02);max=Math.max(max,Math.abs(next-h)/.02);assert(Number.isFinite(h));}assert(max<.12,`maximum road/GC grade ${max}`);
 for(const z of [A.start,A.end])for(const dx of [-8,-6,0,6,8]){const at=z=>groundY(southBankCentre(z)+dx,z),h=.001;near(at(z-h),at(z+h),.001);assert(Math.abs((at(z+h)-at(z))/h-(at(z)-at(z-h))/h)<.015,`tangent at ${z}/${dx}`);}
 assert(groundY(southBankCentre(152),152)<-2.9);
});
test('raw bank, bridge, support, water and all config outside the named addition remain exact',()=>{
 const base=(x,z)=>-.001*x*z-3;
 for(let z=120;z<300;z+=.5)for(const dx of [-45,-30,-20,-18,18,20,30,45]){const x=southBankCentre(z)+dx;assert.equal(southBankGround(x,z,base),old.southBankGround(x,z,base));}
 for(const z of [100,146,147,203.9,210,262,300])for(let dx=-40;dx<=40;dx++)assert.equal(southBankGround(southBankCentre(z)+dx,z,base),old.southBankGround(southBankCentre(z)+dx,z,base));
 for(const file of ['src/surroundings.js','src/riverbridge.js','src/roads.js','src/walksupport.js','src/navigation.js'])assert.equal(readFileSync(file,'utf8'),execFileSync('git',['show',baseline+':'+file],{encoding:'utf8'}),file);
 const config=readFileSync('src/config.js','utf8'),start=config.indexOf('// #301: local southern bridge approach.'),end=config.indexOf('export const TERRAIN_FAR',start);assert(start>0&&end>start);
 assert.equal((config.slice(0,start)+config.slice(end)).replace('147..152 is the historical bank blend (approach corrected in #301).','147..152 is an assumed tie-in.'),execFileSync('git',['show',baseline+':src/config.js'],{encoding:'utf8'}));
});
