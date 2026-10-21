import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {SOUTH_BANK as S,SITE,SOUTH_PLATEAU} from '../src/config.js';
import {southBankGround,southBankCentre} from '../src/southbank.js';
import {groundY,groundBelowDeckY} from '../src/surroundings.js';
import {buildRiverBridges,bridgeRecords,deckAt,deckUnderAt} from '../src/riverbridge.js';
const source=JSON.parse(readFileSync(new URL('../docs/references/elevation-hoje-a/point-api-south-road-2026-10-19.json',import.meta.url)));
const near=(a,b,e=1e-8)=>assert(Math.abs(a-b)<e,`${a} versus ${b}`);

test('road and cross-section controls retain the sourced ground values and approximate registration',()=>{
 assert.equal(S.road.length,11);assert.equal(S.cross.length,5);
 for(const[x,z,y]of S.road){const q=source.points.find(p=>p.group==='road'&&p.x===x&&p.z===z);assert(q);near(y,q.response.hojd_m-14.36);}
 for(const[z,c,points]of S.cross)for(const[dx,y]of points){const q=source.points.find(p=>p.group==='cross'&&Math.abs(p.x-c-dx)<1e-7&&p.z===z);assert(q);near(y,q.response.hojd_m-14.36);}
 assert(source.registration.horizontalAccuracyM.includes('3–5'));assert.equal(SITE.bridges.deckY,-3);
});
test('the sampled crest is continuous and rises to the plateau without the former false descent',()=>{
 for(const[x,z,y]of S.road.filter(p=>p[1]>=S.full))near(groundY(x,z),y);
 let last=groundY(southBankCentre(S.start),S.start),step=0;
 for(let z=S.start+.02;z<=S.fade[0];z+=.02){const y=groundY(southBankCentre(z),z);assert(y>=last-1e-6,`descent at ${z}: ${last} to ${y}`);step=Math.max(step,Math.abs(y-last));last=y;}
 assert(step<.014,`walkable continuous road step ${step} per2cm`);
});
test('both actual bank sides are lower than the road, with separately sourced profiles',()=>{
 for(const z of [155,165,180]){const x=southBankCentre(z),top=groundY(x,z),west=groundY(x-20,z),east=groundY(x+20,z);assert(top-west>3);assert(top-east>2);assert(Math.abs(west-east)>.1);}
});
test('bounded fades and the flat-crest edge have no discrete jumps; unsupported ground stays exact',()=>{
 const base=(x,z)=>Math.sin(x/30)-z/80;
 for(const z of [-100,100,S.start,S.fade[1],400])for(let x=-300;x<300;x+=3)assert.equal(southBankGround(x,z,base),base(x,z));
 for(const z of [150,165,210,248,262,280])for(const dx of [-45,-30,-5,-4,0,4,5,30,45]){const x=southBankCentre(z)+dx;assert(Math.abs(southBankGround(x-1e-6,z,base)-southBankGround(x+1e-6,z,base))<1e-4);}
 for(const[x,z,y]of SOUTH_PLATEAU.points)near(groundY(x,z),y);
});
test('both bridge decks, undersides and concrete/steel geometry retain their explicitly assumed datum',()=>{
 const a=buildRiverBridges(),b=buildRiverBridges(groundY);
 for(const kind of ['concrete','steel','water'])assert.deepEqual(b.getObjectByName('bridges-'+kind).geometry.attributes.position.array,a.getObjectByName('bridges-'+kind).geometry.attributes.position.array);
 for(const r of bridgeRecords){near(deckAt(r.x,r.z),-3);near(deckUnderAt(r.x,r.z),-3-r.slab);assert(groundBelowDeckY(r.x,r.z)<-4);const[x,z]=r.ends[1];near(groundY(x,z),groundY(x,z+.001),.01);}
 const v=b.getObjectByName('bridges-asphalt').geometry.attributes.position;let n=0;
 for(let i=0;i<v.count;i++){const x=v.getX(i),z=v.getZ(i);if(z>147&&z<165&&x<22){n++;near(v.getY(i),groundY(x,z)+.025,1e-5);}}
 assert(n>0,'the actual emitted GC approach follows the terrain');
 for(const g of [a,b])g.traverse(o=>o.geometry?.dispose());
});

// The public import uses the reviewed #1432 exact-triangle option only for existing GC approaches.
// A folded reference surface exposes missed interior kinks even when all strip corners match.
test('opt-in GC strips preserve their footprint and every triangle follows a folded reference terrain',async()=>{
 const {pathStrip}=await import('../src/roads.js');
 const height=(x,z)=>Math.abs(x-2)*.3+Math.abs(z)*.2;
 height.grid=()=>({X:[0,1,2,3,4],Z:[-1,0,1]});
 const g=pathStrip({path:[[0,0],[4,0]],w:2,terrain:'triangles'},w=>-w/2,w=>w/2,.025,height),p=g.attributes.position;let area=0;
 for(let i=0;i<p.count;i+=3){const x=(p.getX(i)+p.getX(i+1)+p.getX(i+2))/3,z=(p.getZ(i)+p.getZ(i+1)+p.getZ(i+2))/3,y=(p.getY(i)+p.getY(i+1)+p.getY(i+2))/3;near(y,height(x,z)+.025,1e-7);area+=Math.abs((p.getX(i+1)-p.getX(i))*(p.getZ(i+2)-p.getZ(i))-(p.getX(i+2)-p.getX(i))*(p.getZ(i+1)-p.getZ(i)))/2;}
 near(area,8,1e-7);g.computeBoundingBox();near(g.boundingBox.min.x,0);near(g.boundingBox.max.x,4);near(g.boundingBox.min.z,-1);near(g.boundingBox.max.z,1);g.dispose();
});
