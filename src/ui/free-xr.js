import * as THREE from 'three';
import { emotionScenes } from './emotion-scenes.js';
import { emotionArtPoint, emotionArtNames, emotionParticleColors } from './emotion-art.js';

// Actual world-space geometry: stereo eyes and head movement see different depths.
export function createFreeXR({ root, registry, resources, text, select }) {
  const group = new THREE.Group();
  root.add(group);
  const add = (geometry, material, parent = group) => {
    resources.push(geometry, material);
    const mesh = new THREE.Mesh(geometry, material); parent.add(mesh); return mesh;
  };
  for (const x of [-1.62,1.58]) {
    const plate=add(new THREE.PlaneGeometry(1.1,1.64),new THREE.MeshBasicMaterial({color:0x101717,transparent:true,opacity:.35,depthWrite:false}));
    plate.position.set(x,-.04,.22); plate.raycast=()=>{};
    const borderGeometry=new THREE.EdgesGeometry(plate.geometry);
    const borderMaterial=new THREE.LineBasicMaterial({color:0x627773,transparent:true,opacity:.18});
    const border=new THREE.LineSegments(borderGeometry,borderMaterial); border.position.copy(plate.position); group.add(border); resources.push(borderGeometry,borderMaterial);
  }
  const caption = text(1.02, .14, 70);
  caption.position.set(-1.62, -.73, .26); group.add(caption);
  const eyebrow = text(1.02, .13, 53);
  eyebrow.userData.draw('EMOTIONAL FORM'); eyebrow.position.set(-1.62,.67,.13); group.add(eyebrow);
  const sculpture = new THREE.Group();
  sculpture.position.set(-1.62,-.02,.34); sculpture.scale.setScalar(.51); group.add(sculpture);
  const positions = new Float32Array(32 * 24 * 3);
  const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
  const pointMaterial = new THREE.PointsMaterial({color:0x78cfc0,size:.012,transparent:true,opacity:.85,depthWrite:false});
  const particles = new THREE.Points(geometry,pointMaterial); sculpture.add(particles);
  const indices=[];
  for(let y=0;y<24;y++) for(let x=0;x<31;x++) indices.push(y*32+x,y*32+x+1);
  const linesGeometry=new THREE.BufferGeometry(); linesGeometry.setAttribute('position',geometry.attributes.position); linesGeometry.setIndex(indices);
  const lineMaterial=new THREE.LineBasicMaterial({color:0xbecdc9,transparent:true,opacity:.17,depthWrite:false});
  sculpture.add(new THREE.LineSegments(linesGeometry,lineMaterial));
  resources.push(geometry,pointMaterial,linesGeometry,lineMaterial);
  const nodes=emotionScenes.map((s,i)=>{
    const node=new THREE.Group();
    const row=Math.floor(i/4), col=i%4;
    node.position.set(-.77+col*.49+Math.sin(row*1.9)*.08,.70-row*.29+Math.sin(i*1.7)*.065,-.06+Math.sin(i*2.4)*.21);
    group.add(node);
    const dot=add(new THREE.SphereGeometry(.014,12,8),new THREE.MeshBasicMaterial({color:0xe3eee9}),node);
    const ring=add(new THREE.RingGeometry(.028,.030,32),new THREE.MeshBasicMaterial({color:0xb4dcd3,transparent:true,opacity:.3,side:THREE.DoubleSide,depthWrite:false}),node);
    const label=text(.43,.095,135); label.userData.draw(s.name); label.position.set(0,-.070,.018); node.add(label);
    const hit=add(new THREE.PlaneGeometry(.44,.21),new THREE.MeshBasicMaterial({colorWrite:false,depthWrite:false}),node);
    hit.position.y=-.04;
    const entry={name:s.name,object:node,action:()=>select(s)};
    node.userData.interaction=entry; registry.push(entry);
    return {node,dot,ring,label};
  });
  const links=[];
  nodes.forEach(({node},i)=>{ for(const j of [i+1,i+4]) if(j<nodes.length && (j!==i+1 || i%4!==3)) links.push(...node.position,...nodes[j].node.position); });
  const linkGeometry=new THREE.BufferGeometry(); linkGeometry.setAttribute('position',new THREE.Float32BufferAttribute(links,3));
  const linkMaterial=new THREE.LineBasicMaterial({color:0xc7d9d4,transparent:true,opacity:.12,depthWrite:false});
  group.add(new THREE.LineSegments(linkGeometry,linkMaterial)); resources.push(linkGeometry,linkMaterial);
  group.traverse(object => {
    if (object.isLine || object.isPoints) object.raycast=()=>{};
  });
  let current=-1,time=0;
  return {group,update(dt,selected,focused){
    time+=dt;
    const mode=Math.max(0,emotionScenes.findIndex(s=>s.id===selected?.id));
    if(mode!==current){current=mode;caption.userData.draw(emotionArtNames[mode]);pointMaterial.color.set(emotionParticleColors[mode]);}
    for(let y=0;y<24;y++) for(let x=0;x<32;x++) {
      const p=emotionArtPoint(mode,x/31,y/23,time*.22);
      positions.set(p,(y*32+x)*3);
    }
    geometry.attributes.position.needsUpdate=true;
    // All shapes stay within a small fixed preview volume; avoid stale dynamic bounds.
    particles.frustumCulled=false;
    sculpture.rotation.y=Math.sin(time*.18)*.32;
    nodes.forEach((n,i)=>{
      const active=i===mode || focused===n.node;
      n.dot.scale.setScalar(active?1.6:1);
      n.ring.material.opacity=active?.85:.22;
      n.ring.scale.setScalar(active?1.4+Math.sin(time*2)*.1:1);
      n.label.material.opacity=active?1:.62;
    });
  }};
}
