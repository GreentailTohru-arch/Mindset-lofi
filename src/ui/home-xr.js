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
  root.add(card(4.4, 2.8, 0x151923, 0.94));
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
  });
  const mediaGeometry = new THREE.PlaneGeometry(1.8, 0.9);
  const media = new THREE.Mesh(mediaGeometry, mediaMaterial);
  media.position.set(0, 0.23, 0.12);
  resources.push(mediaTexture, mediaMaterial, mediaGeometry);
  root.add(media);
  const buttons = [];
  function button(w, h, label, action) {
    const group = new THREE.Group();
    const body = card(w, h, 0x355963, 0.78);
    const face = text(w - 0.04, h - 0.02, 72, true);
    face.position.z = 0.05;
    face.userData.draw(label);
    group.add(body, face);
    root.add(group);
    const entry = { name: label, action, object: group };
    group.userData.interaction = entry;
    registry.push(entry);
    const result = { group, face, entry };
    buttons.push(result);
    return result;
  }
  const back = button(0.62, 0.17, "返回首页", () => {
    page = 0;
    actions.home();
  });
  back.group.position.set(-1.72, 1.16, 0.09);
  const exit = button(0.56, 0.17, "退出 VR", () => vr.exit());
  exit.group.position.set(-1.75, -1.2, 0.09);
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
    if (d.kind === "home") label("心境 LOFI", 100, 90, 30, "#eee9df");
    label("A SPACE FOR YOUR MIND", 1650, 90, 21);
    dc.strokeStyle = "#c8bfd52b";
    dc.beginPath();
    dc.moveTo(100, 120);
    dc.lineTo(2100, 120);
    dc.stroke();
    if (d.kind === "home") {
      const homeText = (ctx, text, x, y, size, color = "#c3c7ce", serif = false) => posterText(ctx, text, x, y, size, color, serif);
      const gradient = dc.createLinearGradient(0, 0, 2000, 1400);
      gradient.addColorStop(0, "#08090b");
      gradient.addColorStop(0.65, "#0b0c0f");
      gradient.addColorStop(1, "#08090b");
      dc.fillStyle = gradient;
      dc.fillRect(0, 0, 2200, 1400);
      homeText(dc, "MINDSET OF LO-FI", 140, 100, 28);
      homeText(dc, "沉浸式空间体验 / VR EDITION", 1500, 100, 28);
      dc.strokeStyle = "#ffffff44";
      dc.beginPath();
      dc.moveTo(140, 145);
      dc.lineTo(2060, 145);
      dc.stroke();
      brandWordmark(dc, brandImages, 140, 240, 940, true);
      if (brandImages.symbol) {
        dc.save();
        dc.filter = "invert(1)";
        dc.drawImage(brandImages.symbol, 125, 640, 275, 129);
        dc.restore();
      }
      homeText(dc, "THE MINDSET", 440, 670, 83, "#f4f4f2", true);
      homeText(dc, "OF LOW FIDELITY", 440, 748, 57, "#f4f4f2", true);
      homeText(dc, brand.slogan, 140, 968, 83, "#f4f4f2", true);
      homeText(dc, "Reconnect", 590, 930, 32, "#f4f4f2", true);
      homeText(dc, "Your True Self", 590, 980, 32, "#f4f4f2", true);
      dc.beginPath();
      dc.moveTo(1230, 240);
      dc.lineTo(1230, 1050);
      dc.stroke();
      homeText(dc, "让此刻，有处安放。", 1340, 265, 52, "#f4f4f2", true);
      homeText(dc, "A ROOM FOR EVERY STATE OF MIND", 1340, 320, 23);
      [400, 740].forEach((y, i) => {
        dc.fillStyle = "#ffffff09";
        dc.beginPath();
        dc.roundRect(1340, y, 720, 285, 16);
        dc.fill();
        dc.strokeStyle = "#ffffff66";
        dc.stroke();
        homeText(
          dc,
          i ? "02 / RESONATE · 模拟体验" : "01 / EXPLORE",
          1385,
          y + 52,
          25,
        );
        homeText(
          dc,
          i ? "感应选择" : "自由选择",
          1385,
          y + 128,
          55,
          "#f4f4f2",
          true,
        );
        homeText(dc, "↗", 1960, y + 128, 46);
        homeText(
          dc,
          i ? "感受心境，遇见属于你的空间。" : "二十四种意境，随心而往。",
          1385,
          y + 195,
          29,
        );
        homeText(
          dc,
          i ? "FOLLOW YOUR FEELING" : "FIND YOUR SPACE",
          1385,
          y + 247,
          22,
        );
      });
      dc.strokeStyle = "#ffffff55";
      dc.beginPath();
      dc.moveTo(140, 1120);
      dc.lineTo(2060, 1120);
      dc.stroke();
      homeText(dc, brand.subtitle, 140, 1195, 47, "#f4f4f2", true);
      homeText(
        dc,
        "Immersive Mindful Focus and Healing Experience",
        140,
        1250,
        25,
        "#f4f4f2",
        true,
      );
      homeText(dc, "Powered by EGG × VR", 1480, 1195, 28);
      homeText(dc, "mindset of lo-fi & Tomatotodo", 1480, 1240, 24);
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
      title.visible = copy.visible = !home;
      title.userData.draw(description.title);
      copy.userData.draw(description.copy);
      const illustrated = Boolean(description.image);
      media.visible = illustrated;
      title.position.y = illustrated ? -0.39 : home ? 0.68 : 0.87;
      copy.position.y = illustrated ? -0.65 : home ? 0.23 : 0.6;
      back.group.visible = description.kind !== "home";
      previous.group.visible = next.group.visible = description.kind === "free";
      slots.forEach((slot, i) => {
        const choice = description.choices[i];
        slot.group.visible = Boolean(choice);
        if (!choice) return;
        slot.face.userData.draw(
          home ? choice.label.split("\n")[0] : choice.label,
        );
        slot.face.visible = !home;
        slot.group.scale.set(home ? 1.16 : free ? 0.66 : 1, home ? 1.9 : 1, 1);
        slot.group.children[0].material.opacity = free
          ? choice.scene === selectedScene?.id
            ? 0.23
            : 0.025
          : home
            ? 0.07
            : 0.6;
        nodeOrbits[i].visible = free;
        nodeOrbits[i].scale.setScalar(
          choice.scene === selectedScene?.id ? 1.5 : 1,
        );
        slot.entry.name = choice.label;
        slot.entry.action = () =>
          choice.scene
            ? free
              ? (selectedScene = emotionScenes.find(
                  (s) => s.id === choice.scene,
                ))
              : openRoom(choice.scene)
            : actions[choice.action]();
        slot.group.position.set(
          illustrated
            ? 0
            : free
              ? [-1.48, -0.6, -1.1, -0.1, -1.48, -0.45][i]
              : 1.2,
          illustrated
            ? -0.91
            : description.kind === "free"
              ? [0.3, 0.45, -0.12, 0, -0.62, -0.55][i]
              : i === 0
                ? 0.315
                : -0.365,
          free ? 0.16 + (i % 3) * 0.035 : 0.12,
        );
      });
    }
    mediaTime += dt;
    if (description.image && mediaTime > 1 / 15) {
      mediaTime = 0;
      const source = state[description.image];
      if (
        source &&
        (source.tagName === "CANVAS" ||
          (source.complete && source.naturalWidth))
      ) {
        mediaContext.clearRect(0, 0, 1024, 512);
        const width = source.naturalWidth || source.width,
          height = source.naturalHeight || source.height;
        const ratio = Math.min(1024 / width, 512 / height);
        mediaContext.drawImage(
          source,
          (1024 - width * ratio) / 2,
          (512 - height * ratio) / 2,
          width * ratio,
          height * ratio,
        );
        mediaTexture.needsUpdate = true;
      }
    }
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
      resources.forEach((resource) => resource.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
