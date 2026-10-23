// Public #154: reference-derived river vegetation, dry passage and bridge clearance; no gameplay.
import test from 'node:test';
import assert from 'node:assert/strict';
import {PerspectiveCamera} from 'three';
import {SITE,PLAYER} from '../src/config.js';
import {Navigation} from '../src/navigation.js';
import {groundBelowDeckY} from '../src/surroundings.js';
import {riverAt,deckAt,deckUnderAt,waterYAt,bridgeRecords} from '../src/riverbridge.js';
import {buildRiverPark,parkReedFeet,parkTreeSpots,parkShrubSpots,onParkPath} from '../src/riverpark.js';

test('the under-bridge path remains dry, with standing clearance and walkable in both directions',()=>{
 for(let x=10;x<=32;x+=.5){const z=111,y=groundBelowDeckY(x,z),under=deckUnderAt(x,z);assert(y>waterYAt(x,z));if(under!==null)assert(under-y>PLAYER.headroom);}
 for(const [start,target]of[[10,32],[32,10]]){const camera=new PerspectiveCamera(),n=new Navigation({},camera);n.teleport(start,groundBelowDeckY(start,111),111);camera.rotation.y=start<target?-Math.PI/2:Math.PI/2;n.keys=new Set(['KeyW']);for(let i=0;i<900&&Math.abs(n.pos.x-target)>.15;i++)n.update(1/60);assert(Math.abs(n.pos.x-target)<.15,`walk ${start} to ${target}: ${n.pos.x}`);assert(Math.abs(n.pos.z-111)<1e-6);assert(n.pos.y>waterYAt(n.pos.x,n.pos.z));}
 for(const r of bridgeRecords){const x=r.x-1,z=r.z-4,y=groundBelowDeckY(x,z);assert(y>waterYAt(x,z),'source 4 m check on dry bank');assert(deckUnderAt(x,z)-y>PLAYER.headroom,'standing room below the slab');assert.equal(deckAt(r.x,r.z),-3);}
});

test('the bridge view has grounded water-margin reeds, hanging trees and understory clear of paths',()=>{
 const group=buildRiverPark(groundBelowDeckY),reeds=parkReedFeet,wet=reeds.filter(t=>t.y<waterYAt(t.x,t.z)).length;
 assert.equal(group.children.length,4,'reuse four existing park material batches');assert.equal(reeds.length,SITE.riverPark.bridgeView.reeds.count);assert(wet>reeds.length/3);
 for(const t of reeds){assert.equal(t.y,groundBelowDeckY(t.x,t.z));assert(t.y+t.h>waterYAt(t.x,t.z)+.4);assert(!onParkPath(t.x,t.z,.5));assert.equal(deckAt(t.x,t.z),null);}
 const trees=parkTreeSpots(groundBelowDeckY),shrubs=parkShrubSpots(groundBelowDeckY);assert(trees.some(t=>t.kind==='willow'));assert(trees.some(t=>t.kind==='weepingBirch'));assert(trees.every(t=>!onParkPath(t.x,t.z,SITE.riverPark.pathClearance)));assert(shrubs.length>=SITE.riverPark.bridgeView.shrubs.count);assert(shrubs.every(t=>t.y>waterYAt(t.x,t.z)));
 for(const[x,z]of SITE.river.path){const r=riverAt(x,z);assert(r.valley>=r.width,'narrowing retains the former valley footprint');}
 group.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});
});
