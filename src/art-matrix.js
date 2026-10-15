import * as THREE from 'three';
import './art-matrix.css';
import { emotionArtPoint, emotionArtNames, emotionParticleColors } from './ui/emotion-art.js';
import { emotionScenes } from './ui/emotion-scenes.js';

const matrix = document.querySelector('#matrix');
const views = emotionScenes.map((entry, index) => {
  const cell = document.createElement('section');
  cell.className = 'cell';
  cell.style.setProperty('--accent', emotionParticleColors[index]);
  cell.innerHTML = `<div class="art-view"></div><div class="caption"><h2><span class="index">${String(index + 1).padStart(2, '0')}</span>${emotionArtNames[index]}</h2><p>${entry.emotion} · ${entry.name}</p></div>`;
  matrix.append(cell);
  return cell.querySelector('.art-view');
});

const canvas = document.querySelector('#art');
let renderer;
try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' }); }
catch { const error = document.querySelector('#error'); error.hidden = false; error.textContent = '无法启动图形显示，请开启浏览器硬件加速后刷新。'; }
if (renderer) start(renderer);

function start(renderer) {
  renderer.setClearColor(0x050607);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const camera = new THREE.OrthographicCamera(-1.2, 1.2, 1.2, -1.2, .1, 20);
  camera.position.z = 6;
  const sprite = document.createElement('canvas'); sprite.width = sprite.height = 32;
  const ctx = sprite.getContext('2d');
  const gradient = ctx.createRadialGradient(16,16,0,16,16,16);
  gradient.addColorStop(0,'#ffffff'); gradient.addColorStop(.18,'#ffffff'); gradient.addColorStop(.42,'#ffffff66'); gradient.addColorStop(1,'#ffffff00');
  ctx.fillStyle = gradient; ctx.fillRect(0,0,32,32);
  const map = new THREE.CanvasTexture(sprite);
  const rows = 30, cols = 80, count = 240;
  const indices = [];
  for (let y=0;y<rows;y++) for(let x=0;x<cols;x++) {
    const at=y*(cols+1)+x; indices.push(at,at+1);
    if(y && x%6===0) indices.push(at,at-cols-1);
  }
  const artworks = views.map((view, mode) => {
    const scene = new THREE.Scene(), group = new THREE.Group(); scene.add(group);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(rows*(cols+1)*3),3).setUsage(THREE.DynamicDrawUsage));
    geometry.setIndex(indices);
    const wire = new THREE.LineSegments(geometry,new THREE.LineBasicMaterial({color:0xdbe3ed,transparent:true,opacity:.22,depthWrite:false}));
    wire.frustumCulled=false;group.add(wire);
    const particles = new THREE.BufferGeometry();
    particles.setAttribute('position',new THREE.BufferAttribute(new Float32Array(count*3),3).setUsage(THREE.DynamicDrawUsage));
    const points = new THREE.Points(particles,new THREE.PointsMaterial({color:emotionParticleColors[mode],map,size:4,sizeAttenuation:false,transparent:true,opacity:.88,blending:THREE.AdditiveBlending,depthWrite:false}));
    points.frustumCulled=false;group.add(points);
    return {scene,group,geometry,particles,points,view,rect:null};
  });
  let width=0,height=0,paused=false,time=0,last=performance.now(),frame=0;
  function resize(){
    width=innerWidth;height=innerHeight;renderer.setSize(width,height,false);
    artworks.forEach(a=>{a.rect=a.view.getBoundingClientRect();a.points.material.size=Math.max(3,a.rect.height/48);});
  }
  new ResizeObserver(resize).observe(matrix); resize();
  function update(a,mode,t){
    const position=a.geometry.attributes.position;
    for(let y=0;y<rows;y++)for(let x=0;x<=cols;x++) {
      const p=emotionArtPoint(mode,x/cols,y/(rows-1),t);
      position.setXYZ(y*(cols+1)+x,p[0],-p[1],p[2]);
    }
    position.needsUpdate=true;
    const particles=a.particles.attributes.position;
    for(let i=0;i<count;i++){
      const u=(i*.6180339+t*(.008+(i%5)*.002))%1;
      const p=emotionArtPoint(mode,u,(i*.381966)%1,t);
      const expansion=1.02+(i%3)*.085+.035*Math.sin(t*.7+i);
      particles.setXYZ(i,p[0]*expansion+.014*Math.sin(t*.6+i),-p[1]*expansion+.014*Math.sin(t*.6+i+2),p[2]*expansion);
    }
    particles.needsUpdate=true;
    a.group.rotation.set(.16+Math.sin(t*.09)*.12,.2+Math.sin(t*.12)*.3,0);
  }
  function draw(now){
    frame=0;if(document.hidden)return;
    if(!paused)time+=Math.max(0,Math.min((now-last)/1000,.1));last=now;
    renderer.setScissorTest(false);renderer.setViewport(0,0,width,height);renderer.clear();renderer.setScissorTest(true);
    artworks.forEach((a,i)=>{
      update(a,i,time);
      const r=a.rect, aspect=r.width/r.height;
      camera.left=-1.22*Math.max(1,aspect);camera.right=-camera.left;
      camera.top=1.22*Math.max(1,1/aspect);camera.bottom=-camera.top;camera.updateProjectionMatrix();
      renderer.setViewport(r.left,height-r.bottom,r.width,r.height);
      renderer.setScissor(r.left,height-r.bottom,r.width,r.height);
      renderer.render(a.scene,camera);
    });
    frame=requestAnimationFrame(draw);
  }
  const play=document.querySelector('#play');
  function togglePlay(){paused=!paused;play.textContent=paused?'继续播放':'暂停';}
  function restart(){time=0;last=performance.now();}
  function clean(){document.body.classList.toggle('clean');}
  async function fullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{document.querySelector('#fullscreen').textContent='请按 F11 全屏';}}
  play.onclick=togglePlay;document.querySelector('#restart').onclick=restart;
  document.querySelector('#clean').onclick=clean;document.querySelector('#fullscreen').onclick=fullscreen;
  document.querySelector('#labels').onclick=e=>{const hidden=document.body.classList.toggle('no-labels');e.currentTarget.textContent=hidden?'文字：关':'文字：开';e.currentTarget.setAttribute('aria-pressed',String(!hidden));};
  document.addEventListener('keydown',e=>{
    if(e.repeat||e.ctrlKey||e.metaKey||e.altKey)return;
    if(e.code==='Space' && e.target.tagName!=='BUTTON'){e.preventDefault();togglePlay();}
    if(e.key.toLowerCase()==='h')clean();
    if(e.key.toLowerCase()==='r')restart();
    if(e.key.toLowerCase()==='f')fullscreen();
  });
  document.addEventListener('visibilitychange',()=>{cancelAnimationFrame(frame);last=performance.now();if(!document.hidden)frame=requestAnimationFrame(draw);});
  if(new URLSearchParams(location.search).has('clean'))document.body.classList.add('clean');
  frame=requestAnimationFrame(draw);
}
