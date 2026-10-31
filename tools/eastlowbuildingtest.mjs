// #200 (port of #1732): OSM 88457600 is replaced by guessed volumes plus an annex with rooftop units.
import test from 'node:test';
import assert from 'node:assert/strict';
import {SITE} from '../src/config.js';
test('building behind Realgymnasiet', () => {
  const B = SITE.east.buildings, src = B.map(b => b.source);
  assert.equal(new Set(src).size, src.length, 'unique sources');
  assert.ok(!src.includes('88457600'));
  assert.equal(B.filter(b => b.osm === '88457600' && b.source.startsWith('guess-1732-')).length, 3);
  const annex = B.find(b => b.source === 'guess-1732-annex');
  assert.equal(annex.roof, 'flat');
  assert.equal(annex.units.length, 1);
});
