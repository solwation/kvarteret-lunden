// Public #94: differential checks against this repository's pre-import production source.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {performance} from 'node:perf_hooks';
import {riverAt} from '../src/riverbridge.js';
import {SITE, PLAYER} from '../src/config.js';

const baseline='0afb8bd05853e4bda079717d3d527a238bf82a3d';
const prior=path=>execFileSync('git',['show',`${baseline}:${path}`],{encoding:'utf8'});
const oldRiver=prior('src/riverbridge.js').replace(/from\s+(['"])([^'"]+)\1/g,(_,q,dep)=>`from ${q}${dep.startsWith('.')?new URL(dep,new URL('../src/riverbridge.js',import.meta.url)).href:import.meta.resolve(dep)}${q}`);
const before=await import('data:text/javascript;base64,'+Buffer.from(oldRiver).toString('base64'));
let seed=94;const rand=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
const points=SITE.river.path.map(p=>[...p]);
for(let i=1;i<SITE.river.path.length;i++)points.push(SITE.river.path[i].map((v,k)=>(v+SITE.river.path[i-1][k])/2));
while(points.length<20000)points.push([-320+rand()*1000,-230+rand()*700]);
for(const [x,z]of points){const ref=before.riverAt(x,z);assert.deepEqual(riverAt(x,z),ref);assert.deepEqual(riverAt(x,z),ref);}
console.log('PASS 20000 river records match exactly, including anchors, segment midpoints and repeated queries');

const BODY={radius:.22,hurdle:.22,...PLAYER};
const compile=source=>{const text=source.match(/function pushOut\([\s\S]*?\n}/)?.[0];assert(text,'production pushOut function found');return new Function('BODY',`return (${text})`)(BODY)};
const oldPush=compile(prior('src/navigation.js')),push=compile(readFileSync(new URL('../src/navigation.js',import.meta.url),'utf8'));
const segments=[[0,0,4,0],[0,0,0,4],[0,0,0,0],[0,0,4,4],[0,0,4,0,1],null],cases=[];
for(const x of[-BODY.radius-Number.EPSILON,-BODY.radius,-BODY.radius+Number.EPSILON,0,BODY.radius])for(const s of segments)cases.push({p:{x,y:0,z:0},s});
while(cases.length<20000)cases.push({p:{x:-5+rand()*14,y:-1+rand()*3,z:-5+rand()*14},s:segments[Math.floor(rand()*segments.length)]});
let contacts=0;for(const c of cases){const a={...c.p},b={...c.p};const ref=oldPush(a,c.s),hit=push(b,c.s);assert.equal(hit,ref);assert.deepEqual(b,a);contacts+=hit;}
console.log(`PASS 20000 collision verdicts and resulting positions match exactly (${contacts} contacts, endpoints, zero-length and height gates)`);

const riverRun=(fn,repeats)=>{let checksum=0;for(const [x,z]of points)for(let i=0;i<repeats;i++)checksum+=fn(x,z).distance;return checksum};
const pushRun=fn=>{let checksum=0;for(const c of cases){const p={...c.p};checksum+=Number(fn(p,c.s))+p.x+p.z;}return checksum};
const median=a=>[...a].sort((a,b)=>a-b)[Math.floor(a.length/2)],measure=fn=>{const start=performance.now();const checksum=fn();return{ms:performance.now()-start,checksum}};
const bench=(old,newer)=>{old();newer();const a=[],b=[];for(let i=0;i<7;i++){const x=measure(old),y=measure(newer);assert.equal(x.checksum,y.checksum);a.push(x.ms);b.push(y.ms)}return{beforeMs:median(a),afterMs:median(b)}};
const counts=fn=>{const original=Math.hypot;let n=0;Math.hypot=(...a)=>{n++;return original(...a)};try{pushRun(fn)}finally{Math.hypot=original}return n};
const results={baseline,riverDistinct:bench(()=>riverRun(before.riverAt,1),()=>riverRun(riverAt,1)),riverRepeated3:bench(()=>riverRun(before.riverAt,3),()=>riverRun(riverAt,3)),collision:bench(()=>pushRun(oldPush),()=>pushRun(push)),collisionHypot:{before:counts(oldPush),after:counts(push)}};
console.log(JSON.stringify(results,null,2));
console.log('PASS timing checksums match; timings are diagnostic host measurements, not a phone-FPS acceptance threshold');
