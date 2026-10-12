import test from 'node:test';
import assert from 'node:assert/strict';
import {sceneThemes} from '../src/ui/scene-backdrop.js';
import {moodOrder} from '../src/ui/mood-config.js';
test('24 scene themes have distinct day/night palettes with every navigable scene covered',()=>{
 assert.deepEqual(Object.keys(sceneThemes),moodOrder);
 for(const mode of ['day','night']){
  assert.equal(new Set(Object.values(sceneThemes).map(t=>t[mode].core)).size,24);
  for(const t of Object.values(sceneThemes))for(const key of ['core','mid','edge','glow'])assert.match(t[mode][key],/^hsl\(/);
 }
 for(const t of Object.values(sceneThemes))assert.notEqual(t.day.core,t.night.core);
});
import {bottomEdgeAtX} from '../src/ui/scene-backdrop.js';
test('reflection follows both sloping bottom edges, with no reflection outside the floor',()=>{
 const diamond=[{x:0,y:.5},{x:.5,y:.2},{x:1,y:.5},{x:.5,y:.8}];
 assert.equal(bottomEdgeAtX(diamond,-.1),null);
 assert.equal(bottomEdgeAtX(diamond,1.1),null);
 assert.equal(bottomEdgeAtX(diamond,.5),.8);
 assert.equal(bottomEdgeAtX(diamond,.25),.65);
 assert.equal(bottomEdgeAtX(diamond,.75),.65);
});
