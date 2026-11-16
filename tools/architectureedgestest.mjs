// Public #165, ported from lunden-3d-apartment 814603f (#1579): architectural edges carry the surface colour.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {architectureEdges as apartmentEdges} from '../src/architectureedges.js';
import {architectureEdges as coreEdges} from '../src/architectural-edges.js';
const tints=(batch)=>{const c=batch.geometry.attributes.color,s=new Set();for(let i=0;i<c.count;i++)s.add([0,1,2].map(k=>Math.round(c.getComponent(i,k)*1000)).join(','));return s;};
for(const [name,architectureEdges] of [['apartment/standard builder',apartmentEdges],['stair core/garage builder',coreEdges]]){
 test(`${name}: compact per-vertex colours in one batch, one material, unchanged geometry`,()=>{
  const root=new T.Group();root.add(new T.Mesh(new T.BoxGeometry(1,1,1),new T.MeshBasicMaterial()));
  const batch=architectureEdges(root);
  assert.equal(batch.length,1);assert.equal(batch[0].geometry.attributes.position.count,24,'12 sharp edges, no diagonals');
  const c=batch[0].geometry.attributes.color;
  assert(batch[0].material.vertexColors&&c.normalized&&c.array.BYTES_PER_ELEMENT===1&&c.count===24);
  assert.equal(batch[0].geometry.index,null,'no extra triangles or index');
 });
 test(`${name}: a single vertex-coloured material tints edges by the painted vertices (upstream #1615)`,()=>{
  const g=mergeGeometries([new T.BoxGeometry(1,1,1).translate(-1.2,0,0),new T.BoxGeometry(1,1,1).translate(1.2,0,0)]),pc=[];
  for(let i=0;i<g.attributes.position.count;i++)pc.push(...(g.attributes.position.getX(i)<0?[.1,.1,.12]:[.9,.8,.7]));
  g.setAttribute('color',new T.Float32BufferAttribute(pc,3));const root=new T.Group();root.add(new T.Mesh(g,new T.MeshBasicMaterial({vertexColors:true})));
  const batch=architectureEdges(root),c=batch[0].geometry.attributes.color;let darkest=1;for(let i=0;i<c.count;i++)darkest=Math.min(darkest,c.getComponent(i,0));
  assert.equal(tints(batch[0]).size,2,'one tint per painted box');assert(darkest<.1,`dark paint gives dark edges (${darkest})`);
 });
 test(`${name}: different surfaces get different, darkened tints in a single batch`,()=>{
  const root=new T.Group();for(const [x,color] of [[-1,0xffffff],[1,0x305070]]){const m=new T.Mesh(new T.BoxGeometry(1,1,1),new T.MeshBasicMaterial({color}));m.position.x=x*1.2;root.add(m);}
  const batch=architectureEdges(root);assert.equal(batch.length,1);
  const seen=tints(batch[0]);assert(seen.size>1);
  const white=[...seen].map(s=>s.split(',').map(Number)).sort((a,b)=>b[0]-a[0])[0];
  assert(white[0]<900&&white[0]>300,`white surface darkened carefully, got ${white}`);
 });
 test(`${name}: material groups tint their own edges`,()=>{
  const root=new T.Group(),geo=mergeGeometries([new T.BoxGeometry(1,1,1).translate(-1.2,0,0),new T.BoxGeometry(1,1,1).translate(1.2,0,0)],true);
  root.add(new T.Mesh(geo,[new T.MeshBasicMaterial({color:0xff0000}),new T.MeshBasicMaterial({color:0x0000ff})]));
  const batch=architectureEdges(root);assert.equal(batch.length,1);assert.equal(tints(batch[0]).size,2);
 });
 test(`${name}: surfaceDarken is clamped`,()=>{
  const root=new T.Group();root.add(new T.Mesh(new T.BoxGeometry(1,1,1),new T.MeshBasicMaterial({color:0xffffff})));
  const c=architectureEdges(root,{surfaceDarken:5})[0].geometry.attributes.color;
  assert(c.getComponent(0,0)<=1);
 });
}

// Public #283 (original #1957, 27c217ba): the lines multiply what is drawn and fade with distance, in both builders.
import { EDGE_LOOK } from '../src/config.js';
for (const [name, architectureEdges] of [['apartment/standard builder', apartmentEdges], ['stair core/garage builder', coreEdges]]) {
 test(`${name}: joints multiply the drawn surface (never lighter), no fog or tone mapping, fade with distance`, () => {
  const root = new T.Group(); root.add(new T.Mesh(new T.BoxGeometry(1, 1, 1), new T.MeshBasicMaterial()));
  const [batch] = architectureEdges(root), m = batch.material;
  assert.equal(m.blending, T.CustomBlending); assert.equal(m.blendSrc, T.ZeroFactor); assert.equal(m.blendDst, T.SrcColorFactor);
  assert.equal(m.blendSrcAlpha, T.ZeroFactor); assert.equal(m.blendDstAlpha, T.OneFactor);
  assert(!m.fog && !m.toneMapped && !m.depthWrite && m.depthTest);
  assert.equal(m.opacity, EDGE_LOOK.strength);
  const sh = { uniforms: {}, vertexShader: '#include <project_vertex>', fragmentShader: '#include <color_fragment>' };
  m.onBeforeCompile(sh);
  assert.match(sh.fragmentShader, /edgeHue/); assert.match(sh.fragmentShader, /smoothstep\(2\.5, 10\.0, vEdgeEye\)/);
  assert.match(sh.vertexShader, /vEdgeEye = length\(mvPosition\.xyz\)/);
  assert.deepEqual(sh.uniforms, {}, 'no per-material uniform or closure');
  const [other] = architectureEdges(root);
  assert.equal(other.material.onBeforeCompile, m.onBeforeCompile, 'one shared program per builder');
 });
}
test('EDGE_LOOK: a joint on white is a few per cent darker close up, less far away, never lighter', () => {
  const near = 1 - EDGE_LOOK.strength * (1 - EDGE_LOOK.shade), far = 1 - EDGE_LOOK.strength * EDGE_LOOK.fadeMin * (1 - EDGE_LOOK.shade);
  assert(near > 0.85 && near < 0.95 && far > near && far < 1, `${near} ${far}`);
});
