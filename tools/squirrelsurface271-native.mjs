// #271 actual production factories: unique retained buffers, complete morphs and unchanged support height.
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {squirrelGeometry} from '../src/squirrelmodel.js';
import {SQUIRRELS as C} from '../src/config.js';
const out=process.argv[2]??'docs/verification/271';
const before=JSON.parse(await readFile(`${out}/before-native.json`,'utf8'));
const geometries=new Set(),buffers=new Set(),rows=[];
for(let i=0;i<C.animals.length;i++)for(const far of [false,true]) {
 const g=squirrelGeometry(C.animals[i],far),attributes=[...Object.values(g.attributes),g.index,...Object.values(g.morphAttributes).flat()];
 assert.equal(g,squirrelGeometry(C.animals[i],far),'cache identity');geometries.add(g);
 const own=new Set();for(const a of attributes){assert(a);assert([...a.array].every(Number.isFinite));own.add(a.array.buffer);buffers.add(a.array.buffer);}
 assert.equal(g.morphTargetsRelative,false);assert.equal(g.morphAttributes.position.length,3);assert.equal(g.morphAttributes.normal.length,3);
 for(const p of g.morphAttributes.position){assert.equal(p.count,g.attributes.position.count);let min=Infinity;for(let j=0;j<p.count;j++)min=Math.min(min,p.getY(j));assert(Math.abs(min)<1e-8,'morph keeps ground support');}
 const triangles=g.index.count/3,rawBytes=[...own].reduce((n,b)=>n+b.byteLength,0),old=before.rows.find(r=>r.i===i&&r.far===far);
 assert(triangles<=old.triangles);assert(rawBytes<=old.rawBytes);
 let minY=Infinity;for(let j=0;j<g.attributes.position.count;j++)minY=Math.min(minY,g.attributes.position.getY(j));assert.equal(minY,old.minY);
 rows.push({i,far,triangles,rawBytes,morphs:{position:g.morphAttributes.position.length,normal:g.morphAttributes.normal.length},minY});
}
assert.equal(geometries.size,6);assert.equal(squirrelGeometry(C.animals[0]),squirrelGeometry(C.animals[3]));
const rawBytes=[...buffers].reduce((n,b)=>n+b.byteLength,0);assert(rawBytes<=before.rawBytes);
const sources={};for(const f of ['src/squirrelmodel.js','src/config.js','src/squirrels.js','src/squirrelbrain.js','src/squirrelhabitat.js'])sources[f]=createHash('sha256').update(await readFile(f)).digest('hex');
await writeFile(`${out}/after-native.json`,JSON.stringify({rows,uniqueGeometries:geometries.size,uniqueBuffers:buffers.size,rawBytes,sources},null,2)+'\n');
console.log(`PASS actual 4 animals/3 looks/6 LOD geometries: ${before.rawBytes} -> ${rawBytes} unique backing-buffer bytes; complete finite morphs and same ground support`);
