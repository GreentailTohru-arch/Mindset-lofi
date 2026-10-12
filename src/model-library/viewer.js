import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { catalog, loadArchivedModels } from "./catalog.js";

export function mountModelLibrary() {
  const trigger = document.createElement("button");
  trigger.className = "library-trigger glass";
  trigger.textContent = "模型库 · 12";
  document.querySelector("#controls .panel-body").append(trigger);
  const dialog = document.createElement("dialog");
  dialog.className = "library-dialog";
  dialog.innerHTML = `<header><div><small>MODEL COLLECTION / 01</small><h2>模型库</h2><p>从房间撤下的家具都在这里，随时留待再用。</p></div><button class="library-close" aria-label="关闭模型库">×</button></header><div class="library-content"><nav aria-label="已收藏模型">${catalog.map((item, i) => `<button data-model="${i}">${item.name}</button>`).join("")}</nav><div class="library-preview"><div class="library-canvas"></div><div class="library-caption"><strong></strong><span>拖动旋转 · 滚轮缩放</span></div></div></div>`;
  document.body.append(dialog);
  const canvasHost = dialog.querySelector(".library-canvas");
  let renderer, scene, camera, controls, models, initializing;
  async function initialize() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color("#252633");
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    canvasHost.append(renderer.domElement);
    camera = new THREE.PerspectiveCamera(40, 1, 0.01, 100);
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    scene.add(new THREE.HemisphereLight("#edf0ff", "#a09080", 2));
    const light = new THREE.DirectionalLight("#ffe9ca", 3);
    light.position.set(3, 6, 4);
    scene.add(light);
    ({ models } = await loadArchivedModels(scene));
    for (const model of models) scene.attach(model.object);
    const resize = () => {
      if (!dialog.open) return;
      const w = canvasHost.clientWidth,
        h = canvasHost.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    new ResizeObserver(resize).observe(canvasHost);
    renderer.setAnimationLoop(() => {
      if (!dialog.open) return;
      controls.update();
      renderer.render(scene, camera);
    });
    resize();
    select(0);
  }
  function select(i) {
    if (!models) return;
    for (const item of models) item.object.visible = false;
    const item = models[i];
    item.object.visible = true;
    item.object.updateWorldMatrix(true, true);
    const bounds = new THREE.Box3().setFromObject(item.object),
      center = bounds.getCenter(new THREE.Vector3());
    const radius = bounds.getSize(new THREE.Vector3()).length() / 2;
    controls.target.copy(center);
    camera.position
      .copy(center)
      .add(
        new THREE.Vector3(1, 0.65, 1.2)
          .normalize()
          .multiplyScalar(radius * 3.7),
      );
    controls.minDistance = radius * 1.4;
    controls.maxDistance = radius * 7;
    controls.update();
    dialog.querySelector(".library-caption strong").textContent = item.name;
    dialog
      .querySelectorAll("[data-model]")
      .forEach((b, j) => b.setAttribute("aria-pressed", String(i === j)));
  }
  trigger.onclick = async () => {
    dialog.showModal();
    try {
      initializing ??= initialize();
      await initializing;
    } catch (error) {
      console.error(error);
      dialog.querySelector(".library-caption strong").textContent =
        "模型暂时未能加载，请刷新后重试";
    }
  };
  dialog.querySelector(".library-close").onclick = () => dialog.close();
  dialog
    .querySelectorAll("[data-model]")
    .forEach((b) => (b.onclick = () => select(Number(b.dataset.model))));
  return dialog;
}
