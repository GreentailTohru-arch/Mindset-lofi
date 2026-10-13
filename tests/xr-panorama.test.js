import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createVRPanorama, panoramaIds } from '../src/xr-panorama.js';
import { emotionScenes } from '../src/ui/emotion-scenes.js';

function harness() {
 const requests=[];
 const panorama=createVRPanorama({loader:{load(url,done,progress,error){requests.push({url,done,error});}}});
 return {panorama,requests};
}
test('every selectable room has a dedicated panorama',()=>{
 assert.deepEqual([...panoramaIds].sort(),emotionScenes.map(s=>s.id).sort());
});
test('late loads cannot replace the active room; leaving restores desktop background',()=>{
 const {panorama,requests}=harness();
 const first=new THREE.Scene(),second=new THREE.Scene();
 const background=new THREE.Color('red'); first.background=background;
 panorama.setEnabled(true);
 panorama.bind(first,'uyghur');
 panorama.bind(second,'tibetan');
 const stale=new THREE.Texture();let disposed=false;stale.addEventListener('dispose',()=>disposed=true);
 requests[0].done(stale);assert.equal(disposed,true);assert.equal(first.background,background);
 const live=new THREE.Texture();requests[1].done(live);
 assert.equal(second.background,live);assert.equal(live.mapping,THREE.EquirectangularReflectionMapping);
 panorama.update(1,{day:false,weather:'rain'});assert.ok(second.backgroundIntensity<.3);
 panorama.clear();assert.equal(second.background,null);assert.equal(second.backgroundIntensity,1);
});
test('home uses its own background and does not request a room panorama',()=>{
 const {panorama,requests}=harness();panorama.bind(new THREE.Scene(),'home');assert.equal(requests.length,0);
});
import { existsSync, readFileSync } from 'node:fs';
test('all panorama assets and prompt records are packaged locally',()=>{
 const prompts=JSON.parse(readFileSync(new URL('../public/images/panoramas/prompts.json',import.meta.url),'utf8'));
 assert.deepEqual(prompts.map(p=>p.id).sort(),[...panoramaIds].sort());
 for(const id of panoramaIds) assert.ok(existsSync(new URL(`../public/images/panoramas/${id}.webp`,import.meta.url)),id);
});

test('panorama defaults off, toggles restore the background and cancel pending loads',()=>{
 const {panorama,requests}=harness();
 const scene=new THREE.Scene();const background=new THREE.Color('blue');scene.background=background;
 panorama.bind(scene,'uyghur');
 assert.equal(panorama.enabled,false);assert.equal(requests.length,0);
 panorama.update(1,{day:false});assert.equal(scene.backgroundIntensity,1);
 panorama.setEnabled(true);assert.equal(requests.length,1);
 panorama.setEnabled(false);
 const stale=new THREE.Texture();let disposed=false;stale.addEventListener('dispose',()=>disposed=true);
 requests[0].done(stale);assert.equal(disposed,true);assert.equal(scene.background,background);
 panorama.setEnabled(true);const live=new THREE.Texture();requests[1].done(live);
 assert.equal(scene.background,live);
 panorama.setEnabled(false);assert.equal(scene.background,background);assert.equal(panorama.ready,false);
 panorama.bind(new THREE.Scene(),'nordic');assert.equal(requests.length,2);
 panorama.setEnabled(true);assert.match(requests[2].url,/nordic/);
});
