import test from 'node:test';
import assert from 'node:assert/strict';
import { animationFrame } from '../src/ui/gif-atlas.js';
test('animation follows each frame duration instead of a fixed frame rate', () => {
 assert.equal(animationFrame([40,120,80],39),0);
 assert.equal(animationFrame([40,120,80],40),1);
 assert.equal(animationFrame([40,120,80],159),1);
 assert.equal(animationFrame([40,120,80],160),2);
});
test('animation loops after the complete source duration', () => {
 assert.equal(animationFrame([40,120,80],240),0);
 assert.equal(animationFrame([40,120,80],520),1);
});
