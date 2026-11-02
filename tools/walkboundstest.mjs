// #232: public-only geometry/navigation settings, no copied original gameplay defaults.
import assert from 'node:assert/strict';
import {WALK,SITE} from '../src/config.js';
const {x0,...rest}=WALK;
assert.equal(x0,-285);
assert.deepEqual(rest,{x1:320,z0:-200,z1:452,cell:40,wade:2,rescue:3,maxSlope:1.2,trunk:{big:.45,tree:.3,birch:.2,young:.15}});
console.log('PASS only western WALK edge widens; public wading/rescue/slope/body margins unchanged');
const B=SITE.backgroundGround,margins={west:WALK.x0-B.x0,east:B.x1-WALK.x1,north:WALK.z0-B.z0,south:B.z1-WALK.z1};
assert.ok(Object.values(margins).every(n=>n>=8));assert.equal(margins.west,65);
console.log('PASS entire walk rectangle remains inside drawn terrain bounds',margins);
