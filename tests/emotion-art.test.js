import test from 'node:test';
import assert from 'node:assert/strict';
import {emotionArtPoint,emotionArtNames} from '../src/ui/emotion-art.js';
test('all 24 sculptures are distinct and remain finite over their full domains',()=>{
 const shapes=[];
 for(let mode=0;mode<24;mode++){
  const samples=[];
  for(const t of [0,2,10])for(let v=0;v<=12;v++)for(let u=0;u<=32;u++){
   const p=emotionArtPoint(mode,u/32,v/12,t);
   assert.equal(p.length,3);assert.ok(p.every(n=>Number.isFinite(n)&&Math.abs(n)<2),`mode ${mode}`);
   samples.push(p.map(n=>n.toFixed(4)).join(','));
  }
  shapes.push(samples.join(';'));
 }
 assert.equal(new Set(shapes).size,24);assert.equal(new Set(emotionArtNames).size,24);
});
import { emotionParticleColors } from '../src/ui/emotion-art.js';
test('all 24 emotions own a unique valid particle colour', () => {
  assert.equal(emotionParticleColors.length, 24);
  assert.equal(new Set(emotionParticleColors).size, 24);
  assert.ok(emotionParticleColors.every(c => /^#[0-9a-f]{6}$/i.test(c)));
});
