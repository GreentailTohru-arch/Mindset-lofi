import { createAnimationAtlases } from "./gif-atlas.js";
import { drawReferencePoster } from "./poster-art.js";
import { loadBrandImages, brandWordmark, posterText, brand } from "./brand.js";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { createVR } from "../xr.js";
import { createStore } from "../state.js";
import { scenePresets } from "../scene/presets.js";
import { sceneCopy } from "./scene-copy.js";
import { emotionScenes } from "./emotion-scenes.js";
import { homeXRPage } from "./home-xr-pages.js";

export function mountHomeVR({ read, actions }) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x101522);
  const camera = new THREE.PerspectiveCamera(
    65,
    innerWidth / innerHeight,
    0.03,
    150,
  );
  camera.position.y = 1.6;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setSize(innerWidth, innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.domElement.className = "home-xr-canvas";
  renderer.domElement.hidden = true;
  document.body.append(renderer.domElement);
  const root = new THREE.Group();
  root.name = "XR home flow";
  root.position.set(0, 1.6, -2.8);
  scene.add(root);
  const registry = [],
    resources = [];
  function card(w, h, tint = 0x293d4c, opacity = 0.72) {
    const geo = new RoundedBoxGeometry(w, h, 0.075, 3, 0.035);
    const mat = new THREE.MeshBasicMaterial({
      color: tint,
      transparent: true,
      opacity,
    });
    resources.push(geo, mat);
    return new THREE.Mesh(geo, mat);
  }
  const backdrop = card(4.4, 2.8, 0x151923, 0.86);
  root.add(backdrop);
  const fill = new THREE.HemisphereLight(0xe0ecff, 0x18202a, 2.3);
  const keyLight = new THREE.DirectionalLight(0xc4eee6, 3.2);
  keyLight.position.set(-2,3,4);
  root.add(fill, keyLight);
  const guidePlate = card(3.3,2.65,0x28313e,0.20);
  guidePlate.position.set(0,-0.01,-0.20);
  guidePlate.visible = false;
  root.add(guidePlate);
  const halo = new THREE.Mesh(new THREE.TorusGeometry(0.47,0.003,8,96),new THREE.MeshBasicMaterial({color:0x87bfb8,transparent:true,opacity:0.45}));
  halo.position.set(0,0.49,-0.02);
  root.add(halo); resources.push(halo.geometry,halo.material);
  const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.58,0.025,64),new THREE.MeshStandardMaterial({color:0x263b43,metalness:0.55,roughness:0.35}));
  pedestal.position.set(0,-0.07,0.13);
  root.add(pedestal); resources.push(pedestal.geometry,pedestal.material);
  const rim = card(4.44, 2.84, 0xaca7c3, 0.18);
  rim.position.z = -0.055;
  root.add(rim);
  function text(w, h, font = 42, isButton = false) {
    const canvas = document.createElement("canvas");
    canvas.width = 1400;
    canvas.height = Math.round((1400 * h) / w);
    const ctx = canvas.getContext("2d");
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      toneMapped: false,
      transparent: true,
      depthWrite: false,
    });
    const geometry = new THREE.PlaneGeometry(w, h);
    const mesh = new THREE.Mesh(geometry, material);
    resources.push(texture, material, geometry);
    let last;
    mesh.userData.draw = (value) => {
      if (last === value) return;
      last = value;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#edf6f4";
      ctx.font = `500 ${font * (w < 1 ? 2.1 : 1.35)}px ${isButton ? '"Microsoft YaHei", sans-serif' : '"Mindset Times", "Mindset Qingke", serif'}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const lines = String(value).split("\n");
      lines.forEach((line, i) =>
        ctx.fillText(
          line,
          700,
          (canvas.height * (i + 0.5)) / lines.length,
          1330,
        ),
      );
      texture.needsUpdate = true;
    };
    if (!isButton && document.fonts?.load) {
      Promise.all([document.fonts.load('16px "Mindset Times"'), document.fonts.load('16px "Mindset Qingke"')]).then(() => {
        const value = last; last = undefined; mesh.userData.draw(value || "");
      });
    }
    return mesh;
  }
  const title = text(2.5, 0.2, 69);
  title.position.set(0, 0.76, 0.08);
  const copy = text(2.5, 0.32, 33);
  copy.position.set(0, 0.44, 0.08);
  root.add(title, copy);
  const mediaCanvas = document.createElement("canvas");
  mediaCanvas.width = 1024;
  mediaCanvas.height = 512;
  const mediaContext = mediaCanvas.getContext("2d");
  const mediaTexture = new THREE.CanvasTexture(mediaCanvas);
  mediaTexture.colorSpace = THREE.SRGBColorSpace;
  const mediaMaterial = new THREE.MeshBasicMaterial({
    map: mediaTexture,
    toneMapped: false,
    transparent: true,
    depthWrite: false,
  });
  const mediaGeometry = new THREE.PlaneGeometry(1.8, 0.9);
  const media = new THREE.Mesh(mediaGeometry, mediaMaterial);
  media.position.set(0, 0.49, 0.40);
  const animations = createAnimationAtlases();
  ["person-enter-v2", "sensor-wear", "vr-put-on-white-transparent", "hands-breathing"].forEach(name => animations.preload(`./images/${name}.gif`));
  resources.push(mediaTexture, mediaMaterial, mediaGeometry);
  root.add(media);
  const buttons = [];
  function button(w, h, label, action) {
    const group = new THREE.Group();
    const body = card(w, h, 0x273b43, 0.86);
    const buttonMaterial = new THREE.MeshPhysicalMaterial({color:0x31464f,metalness:0.28,roughness:0.3,clearcoat:1,clearcoatRoughness:0.3,transparent:true,opacity:0.86});
    body.material = buttonMaterial; resources.push(buttonMaterial);
    body.scale.z = 2.2;
    const edge = card(w+0.018,h+0.018,0x95bdb7,0.36);
    edge.position.z = -0.08;
    group.add(edge);
    const face = text(w - 0.04, h - 0.02, 72, true);
    face.position.z = 0.095;
    face.userData.draw(label);
    group.add(body, face);
    root.add(group);
    const entry = { name: label, action: () => { group.userData.pressedUntil = performance.now() + 180; return action(); }, object: group };
    group.userData.interaction = entry;
    registry.push(entry);
    const result = { group, face, body, edge, entry, restZ: null, pressedUntil: 0 };
    buttons.push(result);
    return result;
  }
  const back = button(0.62, 0.17, "返回首页", () => {
    page = 0;
    actions.home();
  });
  back.group.position.set(-1.68, 1.15, 0.22);
  back.group.rotation.y = 0.08; back.restZ = 0.22;
  const exit = button(0.56, 0.17, "退出 VR", () => vr.exit());
  exit.group.position.set(-1.75, -1.40, -0.10);
  exit.restZ = -0.10;
  const slots = Array.from({ length: 6 }, () =>
    button(1.24, 0.3, "", () => {}),
  );
  const nodeOrbits = slots.map((slot) => {
    const geometry = new THREE.RingGeometry(0.023, 0.026, 40);
    const material = new THREE.MeshBasicMaterial({
      color: 0xbcb0e0,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
      toneMapped: false,
    });
    const ring = new THREE.Mesh(geometry, material);
    ring.position.set(0, 0.21, 0.08);
    slot.group.add(ring);
    const dotGeometry = new THREE.SphereGeometry(0.012, 12, 8);
    const dotMaterial = new THREE.MeshBasicMaterial({
      color: 0xe8ddff,
      toneMapped: false,
    });
    const dot = new THREE.Mesh(dotGeometry, dotMaterial);
    ring.add(dot);
    resources.push(geometry, material, dotGeometry, dotMaterial);
    return ring;
  });
  const previous = button(0.55, 0.16, "上一页", () => {
    page--;
  });
  previous.group.position.set(1.05, -1.2, 0.09);
  const next = button(0.55, 0.16, "下一页", () => {
    page++;
  });
  next.group.position.set(1.72, -1.2, 0.09);
  const designCanvas = document.createElement("canvas");
  designCanvas.width = 2200;
  designCanvas.height = 1400;
  const dc = designCanvas.getContext("2d");
  const designTexture = new THREE.CanvasTexture(designCanvas);
  designTexture.colorSpace = THREE.SRGBColorSpace;
  const designMaterial = new THREE.MeshBasicMaterial({
    map: designTexture,
    transparent: true,
    depthWrite: false,
    toneMapped: false,
  });
  const designGeometry = new THREE.PlaneGeometry(4.4, 2.8);
  const design = new THREE.Mesh(designGeometry, designMaterial);
  design.position.z = 0.045;
  root.add(design);
  resources.push(designTexture, designMaterial, designGeometry);
  const detail = text(1.2, 0.65, 55);
  detail.position.set(1.38, -0.03, 0.12);
  root.add(detail);
  const enter = button(
    1.2,
    0.27,
    "进入这处意境 ↗",
    () => selectedScene && openRoom(selectedScene.id),
  );
  enter.group.position.set(1.38, -0.65, 0.13);
  let selectedScene = null;
  const stars = new THREE.BufferGeometry();
  const starPositions = [];
  for (let i = 0; i < 160; i++)
    starPositions.push(
      Math.sin(i * 12.3) * 8,
      Math.cos(i * 7.7) * 5,
      -5 - (i % 9),
    );
  stars.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(starPositions, 3),
  );
  const starMat = new THREE.PointsMaterial({
    color: 0xa49dc6,
    size: 0.018,
    transparent: true,
    opacity: 0.45,
  });
  const starField = new THREE.Points(stars, starMat);
  scene.add(starField);
  resources.push(stars, starMat);
  const brandImages = loadBrandImages(() => {
    signature = "";
  });
  function paintPage(d) {
    dc.clearRect(0, 0, 2200, 1400);
    const glow = dc.createRadialGradient(1050, 600, 0, 1050, 600, 1150);
    glow.addColorStop(0, "#65608028");
    glow.addColorStop(1, "#17172200");
    dc.fillStyle = glow;
    dc.fillRect(0, 0, 2200, 1400);
    const label = (value, x, y, size = 24, color = "#b9b5c8") => {
      dc.font = `${size}px "Mindset Times", "Mindset Qingke", serif`;
      dc.fillStyle = color;
      dc.textAlign = "left";
      dc.fillText(value, x, y);
    };

    label("A SPACE FOR YOUR MIND", 1650, 90, 21);
    dc.strokeStyle = "#c8bfd52b";
    dc.beginPath();
    dc.moveTo(100, 120);
    dc.lineTo(2100, 120);
    dc.stroke();
    if (d.kind === "home") {
      dc.fillStyle = "#08090b";
      dc.fillRect(0, 0, 2200, 1400);
      drawReferencePoster(dc, brandImages, 145, 30, 940, 1329);
    } else if (d.kind === "free") {
      label("FOLLOW YOUR OWN RHYTHM", 730, 190, 22);
      label("EMOTIONAL FORM / 意境预览", 1500, 470, 22);
      dc.strokeStyle = "#b7abd340";
      const pts = [
        [-1.48, 0.3],
        [-0.6, 0.45],
        [-1.1, -0.12],
        [-0.1, 0.0],
        [-1.48, -0.62],
        [-0.45, -0.55],
      ];
      const xy = ([x, y]) => [1100 + x * 500, 700 - y * 500];
      for (let i = 0; i < pts.length; i++) {
        const a = xy(pts[i]),
          b = xy(pts[(i + 1) % pts.length]);
        dc.beginPath();
        dc.moveTo(...a);
        dc.lineTo(...b);
        dc.stroke();
      }
      for (let i = 0; i < 85; i++) {
        dc.fillStyle = "#ccc2eb55";
        dc.beginPath();
        dc.arc(
          170 + ((i * 139) % 1240),
          420 + ((i * 79) % 650),
          (i % 3) + 1,
          0,
          Math.PI * 2,
        );
        dc.fill();
      }
      label("指向星点并选择，预览心境后进入空间", 550, 1195, 26);
    }
    designTexture.needsUpdate = true;
  }
  let page = 0,
    signature = "",
    mediaTime = 0,
    animationTime = 0,
    animationSource = "",
    disposed = false;
  function openRoom(id) {
    if (vr.openScene(id)) {
      actions.pause();
      return true;
    }
    return false;
  }
  function update(dt) {
    const state = read();
    const description = homeXRPage(state, page);
    const key = JSON.stringify(description) + (selectedScene?.id || "");
    if (key !== signature) {
      signature = key;
      paintPage(description);
      const free = description.kind === "free",
        home = description.kind === "home";
      detail.visible = enter.group.visible = free;
      if (
        free &&
        !description.choices.some((c) => c.scene === selectedScene?.id)
      )
        selectedScene = emotionScenes.find(
          (s) => s.id === description.choices[0].scene,
        );
      if (free)
        detail.userData.draw(
          `${selectedScene.name}\n${selectedScene.emotion}\n\n${selectedScene.description.match(/.{1,14}/gu)?.join("\n")}`,
        );
      const illustrated = Boolean(description.image);
      title.visible = copy.visible = !home;
      backdrop.visible = rim.visible = home || free;
      guidePlate.visible = illustrated;
      halo.visible = pedestal.visible = illustrated;
      design.visible = home || free;
      title.userData.draw(description.title);
      copy.userData.draw(description.copy);
      media.visible = illustrated;
      title.position.y = illustrated ? -0.32 : home ? 0.68 : 0.87;
      title.position.z = illustrated ? 0.24 : 0.08;
      copy.position.y = illustrated ? -0.57 : home ? 0.23 : 0.6;
      copy.position.z = illustrated ? 0.13 : 0.08;
      back.group.visible = description.kind !== "home";
      exit.restZ = home ? 0.28 : -0.10;
      exit.group.position.set(home ? 1.55 : -1.75, home ? -1.07 : -1.4, exit.restZ);
      previous.group.visible = next.group.visible = description.kind === "free";
      slots.forEach((slot, i) => {
        const choice = description.choices[i];
        slot.group.visible = Boolean(choice);
        if (!choice) return;
        slot.face.userData.draw(
          choice.label,
        );
        slot.face.visible = true;
        slot.group.scale.set(home ? 1.16 : free ? 0.66 : 1, home ? 1.9 : 1, 1);
        slot.body.material.opacity = free
          ? choice.scene === selectedScene?.id
            ? 0.23
            : 0.025
          : home
            ? 0.86
            : 0.9;
        nodeOrbits[i].visible = free;
        nodeOrbits[i].scale.setScalar(
          choice.scene === selectedScene?.id ? 1.5 : 1,
        );
        slot.entry.name = choice.label;
        slot.entry.action = () => {
          slot.group.userData.pressedUntil = performance.now() + 180;
          return choice.scene
            ? free
              ? (selectedScene = emotionScenes.find(
                  (s) => s.id === choice.scene,
                ))
              : openRoom(choice.scene)
            : actions[choice.action]();
        };
        slot.group.position.set(
          illustrated
            ? 0
            : free
              ? [-1.48, -0.6, -1.1, -0.1, -1.48, -0.45][i]
              : 1.2,
          illustrated
            ? -0.99
            : description.kind === "free"
              ? [0.3, 0.45, -0.12, 0, -0.62, -0.55][i]
              : i === 0
                ? 0.315
                : -0.365,
          free ? 0.16 + (i % 3) * 0.035 : illustrated ? 0.42 : 0.20,
        );
        slot.restZ = slot.group.position.z;
        slot.group.rotation.y = illustrated ? -0.04 : home ? -0.07 : 0;
        if (illustrated) slot.group.scale.set(1.4,1.2,1);
      });
    }
    mediaTime += dt;
    const source = description.image && state[description.image];
    const sourceURL = source?.currentSrc || source?.src || "";
    if (animationSource !== sourceURL) { animationSource = sourceURL; animationTime = 0; }
    animationTime += dt * 1000;
    if (source && mediaTime > 1 / 30) {
      mediaTime = 0;
      mediaContext.clearRect(0,0,1024,512);
      if (source.tagName === "CANVAS") {
        const ratio = Math.min(1024/source.width,512/source.height);
        mediaContext.drawImage(source,(1024-source.width*ratio)/2,(512-source.height*ratio)/2,source.width*ratio,source.height*ratio);
      } else {
        animations.draw(mediaContext,sourceURL,animationTime,1024,512);
      }
      mediaTexture.needsUpdate = true;
    }
    const now = performance.now();
    for (const b of buttons) {
      const hover = vr.focusedObject === b.group;
      const pressed = now < (b.group.userData.pressedUntil || 0);
      const target = (b.restZ ??= b.group.position.z) + (pressed ? -0.035 : hover ? 0.055 : 0);
      b.group.position.z = THREE.MathUtils.damp(b.group.position.z,target,14,dt);
      b.body.material.color.lerp(new THREE.Color(hover ? 0x526d76 : 0x31464f),1-Math.exp(-dt*12));
      b.edge.material.opacity = hover ? 0.75 : 0.30;
    }
    halo.rotation.z += dt * 0.08;
    halo.material.opacity = 0.28 + Math.sin(now/1700)*0.10;
    media.position.y = 0.49 + Math.sin(now/2300)*0.012;
    media.scale.setScalar(
      description.kind === "sensing"
        ? 1 + Math.sin(performance.now() / 1300) * 0.025
        : 1,
    );
  }
  const vr = createVR({
    scene,
    camera,
    renderer,
    sceneId: "home",
    presets: { home: { label: "心境首页" }, ...scenePresets },
    descriptions: sceneCopy,
    store: createStore(),
    controls: { enabled: false, target: new THREE.Vector3() },
    interaction: { registry, clear() {}, setEnabled() {} },
    notify() {},
    home: {
      place({ camera, preview }) {
        if (preview) camera.rotation.x = 0;
        root.position.y = camera.position.y || 1.6;
        root.scale.setScalar(preview ? Math.min(1, camera.aspect / 1.35) : 1);
      },
      onHome() {
        actions.home();
        page = 0;
      },
      onActive(value) {
        renderer.domElement.hidden = !value;
        if (value) document.documentElement.dataset.homeXr = "true";
        else {
          delete document.documentElement.dataset.homeXr;
          actions.pause();
        }
      },
    },
    onExit() {
      actions.home();
      resize();
    },
  });
  function resize() {
    if (renderer.xr.isPresenting) return;
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
    root.scale.setScalar(Math.min(1, camera.aspect / 1.35));
  }
  const events = new AbortController();
  window.addEventListener("resize", resize, { signal: events.signal });
  let previousTime;
  renderer.setAnimationLoop((now) => {
    const dt =
      previousTime == null
        ? 0.016
        : Math.min((now - previousTime) / 1000, 0.05);
    previousTime = now;
    if (!vr.active) return;
    if (vr.diagnostics.scene === "home") update(dt);
    vr.update(dt);
    renderer.render(vr.renderScene, camera);
  });
  return {
    get active() {
      return vr.active;
    },
    openRoom,
    dispose() {
      if (disposed) return;
      disposed = true;
      renderer.xr
        .getSession()
        ?.end()
        .catch(() => {});
      vr.dispose();
      events.abort();
      renderer.setAnimationLoop(null);
      animations.dispose();
      resources.forEach((resource) => resource.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
