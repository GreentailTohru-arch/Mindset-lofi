import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {isVerticalArchitecture,createArchitectureReflection} from '../src/ui/architecture-reflection.js';
const bounds=(min,max)=>new THREE.Box3(new THREE.Vector3(...min),new THREE.Vector3(...max));
test('reflection includes boundary walls and columns, excludes floors and interior furnishings',()=>{
 assert.ok(isVerticalArchitecture(bounds([-5,0,-5],[5,4,-4.8])));
 assert.ok(isVerticalArchitecture(bounds([4.5,0,4.5],[4.9,4,4.9])));
 assert.equal(isVerticalArchitecture(bounds([-5.2,-.4,-5.2],[5.2,0,5.2])),false);
 assert.equal(isVerticalArchitecture(bounds([-4,0,-4],[4,.05,4])),false);
 assert.equal(isVerticalArchitecture(bounds([0,0,0],[1,2,1])),false);
});
test('reflection pass restores object visibility and shadow state even if capture fails',()=>{
 const scene=new THREE.Scene();
 const wall=new THREE.Mesh(new THREE.BoxGeometry(10,4,.2));wall.position.set(0,2,-5);scene.add(wall);
 const floor=new THREE.Mesh(new THREE.BoxGeometry(10,.2,10));scene.add(floor);
 const hidden=new THREE.Mesh(new THREE.BoxGeometry());hidden.visible=false;scene.add(hidden);
 const reflection=createArchitectureReflection(scene,[wall,floor]);
 assert.equal(reflection.count,1);
 const renderer={shadowMap:{autoUpdate:true,needsUpdate:true},render(){assert.ok(wall.visible);assert.equal(floor.visible,false);},domElement:{}};
 assert.throws(()=>reflection.render(renderer,{},()=>{throw Error('capture');}));
 assert.ok(floor.visible);assert.equal(hidden.visible,false);assert.ok(renderer.shadowMap.autoUpdate);assert.ok(renderer.shadowMap.needsUpdate);
});
test('reflection mirrors height about the bottom plane and restores the original world transform',()=>{
 const scene=new THREE.Scene();const wall=new THREE.Mesh(new THREE.BoxGeometry(10,4,.2));wall.position.set(0,2,-5);scene.add(wall);
 const reflection=createArchitectureReflection(scene,[wall]);
 const renderer={shadowMap:{autoUpdate:true,needsUpdate:false},render(){
  const position=wall.getWorldPosition(new THREE.Vector3());
  assert.ok(Math.abs(position.y+2.7)<1e-10);
  assert.equal(position.z,-5);
 },domElement:{}};
 reflection.render(renderer,{},()=>{});
 assert.equal(wall.getWorldPosition(new THREE.Vector3()).y,2);
 assert.equal(scene.matrixAutoUpdate,true);
});
