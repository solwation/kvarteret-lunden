// Public #348: selected original #2181 cases and actual public model contracts, no Web Audio.
import test from 'node:test';
import assert from 'node:assert/strict';
import {cellOf,occlusionFor,doorsOnLine,windowRoomPoint,windowOcclusion,windowCutoff} from '../src/soundocclusion.js';
import {LEVELS,OCCLUSION as O} from '../src/config.js';
const at=(x,y=1.62,z=3)=>({x,y,z});
const door=(t=0,y=0)=>({t,object:{position:{y}},segmentAt:()=>[5,6.5,5,7.5],segment:()=>[5,6.5,6,6.5]});
const world=(over={})=>({size:{x:20,z:20},levels:[{wallSegments:[[5,0,5,6]]},{wallSegments:[]}],roomAt:(l,x)=>x<5?'Kök':'Hall',doors:[door()],...over});
test('same room clear; intervening wall dulls and attenuates',()=>{const w=world();assert.equal(occlusionFor(w,at(1),at(3)),null);assert.deepEqual(occlusionFor(w,at(2),at(8)),{gain:10**(-O.wall.db/20),hz:O.wall.hz,parts:['wall']});});
test('fixed doorway survives swinging leaf; closed is darker/quieter than open',()=>{const w=world(),a=at(2,1.62,7),b=at(8,1.62,7),closed=occlusionFor(w,a,b);w.doors[0].t=1;const open=occlusionFor(w,a,b);assert.deepEqual(closed.parts,['door']);assert.deepEqual(open.parts,['openDoor']);assert(open.gain>closed.gain&&open.hz>closed.hz);});
test('absolute floor filters doors; ears are not feet-level thresholds',()=>{assert.deepEqual(doorsOnLine([door(0,LEVELS[1].floor)],at(2,1.62,7),at(8,1.62,7),0),{closed:0,open:0});assert.equal(cellOf(world(),at(2,2)).level,0);assert.equal(cellOf(world(),at(2,LEVELS[1].floor+1.62)).level,1);});
test('actual slab and stair opening distinguish floors',()=>{const w=world({openings:{slab:{y:2.9,hole:{x0:9,x1:11,z0:2,z1:4}}}});assert.deepEqual(occlusionFor(w,at(2),at(2,4.87)).parts,['floor']);assert.equal(occlusionFor(w,at(10),at(10,4.87)),null);});
test('window facade stays clear, including outdoors and unsupported core',()=>{const w=world();assert.equal(occlusionFor(w,at(2),at(2,1.62,-1)),null);assert.equal(occlusionFor(w,at(30),at(2)),null);assert.equal(occlusionFor(world({coreHouses:[{house:'A',contains:x=>x>15}]}),at(17),at(2)),null);});
test('portal resolves existing inward cells without moving source/panner; missing data stays clear',()=>{const w=world({roomAt:(l,x,z)=>z>.4?(x<5?'Kök':'Hall'):null}),src=at(2,1.4,.1),copy={...src};const p=windowRoomPoint(w,src,{x:0,z:1});assert(p.z>.4&&p.z<.5);assert.deepEqual(src,copy);assert.equal(windowOcclusion(w,at(2),src,{x:0,z:1}),null);assert.equal(windowRoomPoint(w,src,{x:0,z:-1}),null);assert.equal(windowOcclusion(w,at(2),src,null),null);});
test('VisitUnit uses absolute floors, own world walls/doors and slab contract',()=>{const u={id:'L1201',ox:30,oz:1,levels:[{floor:6.4},{floor:9.4}],roomAt:(l,x)=>x<35?'Kök':'Hall',walls:[[[35,0,35,6]],[]],doors:[{...door(),object:{position:{y:6.4}},segmentAt:()=>[35,6.5,35,7.5]}],throughSlab:()=>true};const w=world({unitAt:x=>x>30?u:null});assert.equal(cellOf(w,at(32,8.1)).level,0);assert.deepEqual(occlusionFor(w,at(32,8.1),at(38,8.1)).parts,['wall']);assert.deepEqual(occlusionFor(w,at(32,8.1,7),at(38,8.1,7)).parts,['door']);assert.deepEqual(occlusionFor(w,at(32,8.1),at(32,11)).parts,['floor']);u.throughSlab=()=>false;assert.equal(occlusionFor(w,at(32,8.1),at(32,11)),null);});
test('unknown building, original-only cells and invalid positions do not introduce loss',()=>{const w=world({playroom:{contains:()=>true}});assert.equal(cellOf(w,at(2)).kind,'home');assert.equal(occlusionFor(w,at(2),at(NaN)),null);assert.equal(occlusionFor(w,at(2),at(30)),null);});

test('single window filter preserves clear cutoff and an obstacle darkens even already low-passed wind',()=>{
  for(const hz of[300,741,930]){
    assert.equal(windowCutoff(hz,null),hz);
    assert(windowCutoff(hz,O.wall)<hz);
    assert(windowCutoff(hz,O.floor)<windowCutoff(hz,O.wall));
    assert(windowCutoff(hz,O.wall)<windowCutoff(hz,O.door));
    assert(windowCutoff(hz,O.openDoor)>hz*.99,'open doorway barely changes the already soft wind');
  }
});
