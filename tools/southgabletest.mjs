// Public #158: differential rays against this repository's pre-fix south builder.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import * as T from 'three';
import {SITE} from '../src/config.js';
const baseline='674a299',url=new URL('../src/southbackdrop.js',import.meta.url);
const load=async text=>{assert(text.includes(' yield .9;'));text=text.replace(' yield .9;',' return group;'); // stop after the four real mesh batches, before canvas leaf-atlas/trees
 text=text.replace(/from\s+(['"])([^'"]+)\1/g,(_,q,dep)=>`from ${q}${dep.startsWith('.')?new URL(dep,url).href:import.meta.resolve(dep)}${q}`);return import('data:text/javascript;base64,'+Buffer.from(text).toString('base64'));};
// #160: isolate the gable change against today's land code; later approved grass/ramp changes are shared inputs.
const today=readFileSync(url,'utf8'),historical=execFileSync('git',['show',`${baseline}:src/southbackdrop.js`],{encoding:'utf8'});
const oldWall=historical.slice(historical.indexOf('  for(const [ring,hole]'),historical.indexOf('    if(b.levels<4)',historical.indexOf('  for(const [ring,hole]')));
const start=today.indexOf('  for(const [ring,hole]'),end=today.indexOf('    if(b.levels<4)',start);
assert(start>=0&&end>start&&oldWall.includes('roofHeight(a)'));
const neutral=text=>text.replace("import { grassMeanColor } from './grass.js';", "const grassMeanColor=()=>0x779955; // deterministic geometry-only fixture, no canvas");
const old=await load(neutral(today.slice(0,start)+oldWall+today.slice(end))),current=await load(neutral(today));
const build=m=>m.buildSouthBackdrop(()=>0),before=build(old),after=build(current),hash=g=>{const h=createHash('sha256');for(const k of Object.keys(g.attributes).sort())h.update(k).update(Buffer.from(g.attributes[k].array.buffer));return h.digest('hex');};
const summary={baseline,sourceCommit:'5ba0493e58576eba70349c63593990373a607eaf',edges:[],unchanged:{}};

test('every former gable opening hits the actual facade and costs exactly two triangles per split edge',()=>{
 const S=SITE.south;let bodies=0;
 for(const b of S.buildings.filter(b=>!b.template&&b.roof!=='hipped')){bodies++;const p=b.polygon.slice(0,-1);let edge=0,len=0;for(let i=0;i<p.length;i++){const q=p[(i+1)%p.length],d=Math.hypot(q[0]-p[i][0],q[1]-p[i][1]);if(d>len){len=d;edge=i;}}
  const a=p[edge],c=p[(edge+1)%p.length],ux=(c[0]-a[0])/len,uz=(c[1]-a[1])/len,v=q=>-uz*q[0]+ux*q[1],vs=p.map(v),mid=(Math.min(...vs)+Math.max(...vs))/2,half=(Math.max(...vs)-Math.min(...vs))/2,eave=Math.max(...p.map(([,z])=>z<=SITE.backgroundGround.z1?0:-3.01))+b.levels*S.storey,top=q=>eave+b.rise*Math.max(0,1-Math.abs(v(q)-mid)/half);
  for(const ring of[p,...(b.holes??[]).map(h=>h.slice(0,-1))])for(let i=0;i<ring.length;i++){const a=ring[i],c=ring[(i+1)%ring.length],va=v(a)-mid,vc=v(c)-mid;if(va*vc>=0)continue;const t=va/(va-vc),x=a[0]+(c[0]-a[0])*t,z=a[1]+(c[1]-a[1])*t,oldTop=top(a)+(top(c)-top(a))*t,d=Math.hypot(c[0]-a[0],c[1]-a[1]),n=new T.Vector3((c[1]-a[1])/d,0,-(c[0]-a[0])/d),rays=[];
   for(const f of[.2,.5,.8]){const target=new T.Vector3(x,oldTop+(top([x,z])-oldTop)*f,z),ray=new T.Raycaster(target.clone().addScaledVector(n,.05),n.clone().negate(),0,.1),hits=root=>ray.intersectObject(root.getObjectByName('south-facade')).length;rays.push({fraction:f,before:hits(before),after:hits(after)});assert.equal(rays.at(-1).before,0);assert(rays.at(-1).after>0,`source ${b.source}, ridge ${x},${z}, fraction ${f}`);}
   summary.edges.push({source:b.source,name:b.name,x,z,eave,ridge:top([x,z]),gap:top([x,z])-oldTop,n:n.toArray(),rays});
  }
 }
 summary.bodies=bodies;summary.trianglesBefore=before.getObjectByName('south-facade').geometry.attributes.position.count/3;summary.trianglesAfter=after.getObjectByName('south-facade').geometry.attributes.position.count/3;assert.equal(bodies,46);assert.equal(summary.edges.length,92);assert.equal(summary.trianglesAfter-summary.trianglesBefore,2*summary.edges.length);assert.deepEqual(before.children.map(m=>m.name),after.children.map(m=>m.name));
});

test('roof, glass/window placement, land, hipped facades and St Lars 41 remain byte-identical',()=>{
 for(const kind of['roof','glass','land']){const a=hash(before.getObjectByName('south-'+kind).geometry),b=hash(after.getObjectByName('south-'+kind).geometry);assert.equal(a,b,kind);summary.unchanged[kind]=a;}
 const saved=SITE.south.buildings;try{SITE.south.buildings=saved.filter(b=>b.template||b.roof==='hipped');const a=build(old),b=build(current);for(const m of a.children){const h=hash(m.geometry);assert.equal(h,hash(b.getObjectByName(m.name).geometry));summary.unchanged['hipped-special-'+m.name]=h;}}finally{SITE.south.buildings=saved;}
 if(process.env.EVIDENCE)writeFileSync(process.env.EVIDENCE,JSON.stringify(summary,null,2)+'\n');
});
