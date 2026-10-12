import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { createStore } from "./state.js";
import { supportsRgb } from "./lighting-capabilities.js";
import { createWhiteLightControl } from "./white-light.js";
import { bindFixtureInteractions } from "./fixture-interactions.js";
import { mountUI } from "./ui.js";
import { bindFloorStyle } from "./scene/floor-styles.js";
import { scenePresets, resolveScene } from "./scene/presets.js";
import { sceneCopy } from "./ui/scene-copy.js";
import { createVR } from "./xr.js";
import { createInteractions } from "./interaction.js";
import "./style.css";
import "./xr.css";
import "./ui/ambient.css";
import { createArchitectureReflection } from "./ui/architecture-reflection.js";
import { mountSceneBackdrop } from "./ui/scene-backdrop.js";
import { mountWeather } from "./ui/weather.js";

const sceneId = resolveScene(window.location.search);
// A shareable presentation view keeps the render free of controls and labels.
document.documentElement.dataset.clean =
  new URLSearchParams(location.search).get("clean") === "1" ? "true" : "false";
const {
  createMaterials,
  createRoom,
  createFurniture,
  createLighting,
  settings,
} = scenePresets[sceneId];
const rgbEnabled = supportsRgb(sceneId);
const store = createStore(settings, { rgbEnabled, dayNightLighting: true }),
  ui = mountUI(store, {
    rgbEnabled,
    ...(sceneId === "athens" || sceneId === "mediterranean"
      ? {
          dayLabel: "夕照",
          nightLabel: "月夜",
          daySceneLabel: "爱琴海的金色夕照",
        }
      : {}),
  }),
  container = document.querySelector("#viewport");
document.documentElement.dataset.scene = sceneId;
if (sceneId === "uyghur") {
  document.querySelector(".room-title").textContent = "绿洲暮色，一盏暖茶。";
  document.querySelector(".bottom-left p").textContent =
    "木雕、刺绣与铜器，收藏夕阳的温度。";
  document.querySelector(".eyebrow").textContent =
    "OASIS SUNSET & WOVEN STORIES";
  document.querySelector("#ac").closest(".setting-row").hidden = true;
  document.querySelector("#floorStyle option[value=original]").textContent =
    "木地板与蓝白花砖";
  document
    .querySelector("#curtains")
    .setAttribute("aria-label", "打开绿洲纱帘");
}
if (sceneId === "tibetan") {
  document.querySelector(".room-title").textContent = "雪山之下，灯火温柔。";
  document.querySelector(".bottom-left p").textContent =
    "织物与铜器，留住高原的暮色。";
  document.querySelector(".eyebrow").textContent =
    "MOUNTAIN DUSK & WOVEN WARMTH";
  document.querySelector("#ac").closest(".setting-row").hidden = true;
  document.querySelector("#floorStyle option[value=original]").textContent =
    "老木与石板";
  document
    .querySelector("#curtains")
    .setAttribute("aria-label", "打开高原厚布窗帘");
}
if (sceneId === "brutalist") {
  document.querySelector(".room-title").textContent = "在厚重之间，安静停留。";
  document.querySelector(".bottom-left p").textContent =
    "清水混凝土，留住一束温暖。";
  document.querySelector(".eyebrow").textContent =
    "CONCRETE, WOOD & QUIET LIGHT";
  document.querySelector("#ac").closest(".setting-row").hidden = true;
  document.querySelector("#floorStyle option[value=original]").textContent =
    "抛光混凝土";
  document
    .querySelector("#curtains")
    .setAttribute("aria-label", "打开深灰亚麻窗帘");
}
if (sceneId === "memphis") {
  document.querySelector(".room-title").textContent = "让色彩，轻轻打破日常。";
  document.querySelector(".bottom-left p").textContent =
    "曲线与方格，拼出快乐的午后。";
  document.querySelector(".eyebrow").textContent = "COLOR OUTSIDE THE LINES";
  document.querySelector("#ac").closest(".setting-row").hidden = true;
  document.querySelector("#floorStyle option[value=original]").textContent =
    "彩色磨石子";
  document
    .querySelector("#curtains")
    .setAttribute("aria-label", "收起珊瑚百叶窗");
}
if (sceneId === "tropical") {
  document.querySelector(".room-title").textContent = "把日子，交给热带晚风。";
  document.querySelector(".bottom-left p").textContent =
    "藤影摇曳，庭院水声悠悠。";
  document.querySelector(".eyebrow").textContent =
    "TEAK, RATTAN & A TROPICAL BREEZE";
  document.querySelector("#ac").closest(".setting-row").hidden = true;
  document.querySelector("#floorStyle option[value=original]").textContent =
    "柚木与陶土花砖";
  document
    .querySelector("#curtains")
    .setAttribute("aria-label", "打开热带亚麻纱帘");
}
if (sceneId === "artdeco") {
  document.querySelector(".room-title").textContent = "把黄昏，镶进金色时光。";
  document.querySelector(".bottom-left p").textContent =
    "翡翠丝绒，光影缓缓流淌。";
  document.querySelector(".eyebrow").textContent =
    "GOLDEN HOUR, EMERALD DREAMS";
  document.querySelector("#ac").closest(".setting-row").hidden = true;
  document.querySelector("#floorStyle option[value=original]").textContent =
    "深色高光鱼骨拼";
  document
    .querySelector("#curtains")
    .setAttribute("aria-label", "打开翡翠绿丝绒窗帘");
}
if (sceneId === "industrial") {
  document.querySelector(".room-title").textContent = "旧时光，也有温度。";
  document.querySelector(".bottom-left p").textContent =
    "黄昏入窗，灯火与旧物相伴。";
  document.querySelector(".eyebrow").textContent =
    "AMBER LIGHT, WEATHERED STORIES";
  document.querySelector("#ac").closest(".setting-row").hidden = true;
  document.querySelector("#floorStyle option[value=original]").textContent =
    "做旧混凝土地面";
  document
    .querySelector("#curtains")
    .setAttribute("aria-label", "打开工业窗布帘");
}
if (sceneId === "french") {
  document.querySelector(".room-title").textContent = "把浪漫，藏进日常。";
  document.querySelector(".bottom-left p").textContent =
    "奶油色的午后，温柔而悠长。";
  document.querySelector(".eyebrow").textContent = "A QUIET PARISIAN AFTERNOON";
  document.querySelector("#ac").closest(".setting-row").hidden = true;
  document.querySelector("#floorStyle option[value=original]").textContent =
    "蜂蜜木色鱼骨拼";
  document
    .querySelector("#curtains")
    .setAttribute("aria-label", "打开米白亚麻纱帘");
}
if (sceneId === "midcentury") {
  document.querySelector(".room-title").textContent = "把午后，留给慢时光。";
  document.querySelector(".bottom-left p").textContent = "木色温润，日光悠长。";
  document.querySelector(".eyebrow").textContent =
    "A WARM AFTERNOON, TIMELESS LINES";
  document.querySelector("#ac").closest(".setting-row").hidden = true;
  document.querySelector("#floorStyle option[value=original]").textContent =
    "中古胡桃木地板";
  document
    .querySelector("#curtains")
    .setAttribute("aria-label", "打开木质百叶窗");
}
if (sceneId === "bohemian") {
  document.querySelector(".room-title").textContent =
    "把日子，织成喜欢的颜色。";
  document.querySelector(".bottom-left p").textContent = "半窗夕阳，一屋自由。";
  document.querySelector(".eyebrow").textContent =
    "A LITTLE WILD, A LITTLE WARM";
  document.querySelector("#ac").closest(".setting-row").hidden = true;
  document.querySelector("#floorStyle option[value=original]").textContent =
    "复古手工花砖";
  document
    .querySelector("#curtains")
    .setAttribute("aria-label", "打开米白纱帘");
}
if (sceneId === "italian") {
  document.querySelector(".room-title").textContent = "把喧嚣，留在窗外。";
  document.querySelector(".bottom-left p").textContent = "一室暖光，静享此刻。";
  document.querySelector(".eyebrow").textContent = "THE QUIET SIDE OF LUXURY";
  document.querySelector("#ac").closest(".setting-row").hidden = true;
  document.querySelector("#floorStyle option[value=original]").textContent =
    "烟熏橡木宽板";
  document
    .querySelector("#curtains")
    .setAttribute("aria-label", "收拢落地米白纱帘");
}
if (sceneId === "mediterranean") {
  document.querySelector(".room-title").textContent = "把日子，交给海风。";
  document.querySelector(".bottom-left p").textContent = "一抹夕阳，一室闲光。";
  document.querySelector(".eyebrow").textContent =
    "A SLOW AFTERNOON BY THE SEA";
  document.querySelector("#ac").closest(".setting-row").hidden = true;
  document.querySelector("#floorStyle option[value=original]").textContent =
    "旧陶土方砖";
  document
    .querySelector("#curtains")
    .setAttribute("aria-label", "收拢白色亚麻纱帘");
}
if (sceneId === "dongfang") {
  document.querySelector(".room-title").textContent = "一室茶香，半窗山色。";
  document.querySelector(".bottom-left p").textContent = "远山入室，心自安然。";
  document.querySelector(".eyebrow").textContent = "EASTERN STILLNESS";
  document.querySelector("#ac").closest(".setting-row").hidden = true;
  document.querySelector("#floorStyle option[value=original]").textContent =
    "深胡桃木地板";
  document
    .querySelector("#curtains")
    .setAttribute("aria-label", "收拢米白纱帘");
}
if (sceneId === "studio") {
  document.querySelector("#floorStyle option[value=original]").textContent =
    "方格大理石";
}
if (sceneId === "nordic") {
  document.querySelector(".room-title").textContent = "窗外是冬，屋里是暖。";
  document.querySelector(".bottom-left p").textContent =
    "一本书，一杯茶，一点慢时光。";
  document.querySelector(".eyebrow").textContent =
    "WINTER LIGHT, EVERYDAY HYGGE";
  document.querySelector("#ac").closest(".setting-row").hidden = true;
  document.querySelector("#floorStyle option[value=original]").textContent =
    "浅橡木地板";
  document
    .querySelector("#curtains")
    .setAttribute("aria-label", "升起亚麻卷帘");
}
if (sceneId === "machiya") {
  document.querySelector(".room-title").textContent = "一席茶，一庭月。";
  document.querySelector(".bottom-left p").textContent = "纸门半掩，静听竹影。";
  document.querySelector(".eyebrow").textContent = "A MACHIYA AFTER DARK";
  document.querySelector("#ac").closest(".setting-row").hidden = true;
  document.querySelector("#floorStyle option[value=original]").textContent =
    "天然榻榻米";
  document
    .querySelector("#curtains")
    .setAttribute("aria-label", "打开障子纸门");
}
if (sceneId === "wabisabi") {
  document.querySelector(".room-title").textContent = "旧物无言，静待时光。";
  document.querySelector(".bottom-left p").textContent = "一室木香，半日清闲。";
  document.querySelector(".eyebrow").textContent =
    "WABI-SABI · AN IMPERFECT REFUGE";
  document.querySelector("#ac").closest(".setting-row").hidden = true;
  document.querySelector("#floorStyle option[value=original]").textContent =
    "深色老木地板";
  document
    .querySelector("#curtains")
    .setAttribute("aria-label", "收拢亚麻窗帘");
}
if (sceneId === "baroque") {
  document.querySelector(".room-title").textContent = "烛影摇曳，夜色如绒。";
  document.querySelector(".bottom-left p").textContent =
    "听一段琴声，看一室月光。";
  document.querySelector(".eyebrow").textContent = "A SALON BY CANDLELIGHT";
  document.querySelector("#ac").closest(".setting-row").hidden = true;
  document.querySelector("#floorStyle option[value=original]").textContent =
    "深胡桃木拼花";
  document
    .querySelector("#curtains")
    .setAttribute("aria-label", "收拢天鹅绒帷幔");
}
if (sceneId === "bauhaus") {
  document.querySelector(".room-title").textContent = "让日光，填满留白。";
  document.querySelector(".bottom-left p").textContent =
    "简单的形，安静的日常。";
  document.querySelector(".eyebrow").textContent =
    "FORM, LIGHT & EVERYDAY LIFE";
  document.querySelector("#ac").closest(".setting-row").hidden = true;
  document.querySelector("#floorStyle option[value=original]").textContent =
    "浅橡木原色";
  document
    .querySelector("#curtains")
    .setAttribute("aria-label", "卷起亚麻遮光帘");
}
if (sceneId === "palace") {
  document.querySelector(".room-title").textContent = "一室灯华，半庭月色。";
  document.querySelector(".bottom-left p").textContent =
    "宫灯温暖，旧唱片轻轻转动。";
  document.querySelector(".eyebrow").textContent = "A PALACE AFTER DARK";
  document.querySelector("#ac").closest(".setting-row").hidden = true;
  document.querySelector("#floorStyle option[value=original]").textContent =
    "宫殿红木地板";
  document
    .querySelector("#curtains")
    .setAttribute("aria-label", "收拢宫廷帷幔");
}
if (sceneId === "athens") {
  document.querySelector(".room-title").textContent = "把日落，留在爱琴海。";
  document.querySelector(".bottom-left p").textContent = "海风入室，琴弦轻颤。";
  document.querySelector(".eyebrow").textContent = "AN AEGEAN REVERIE";
  document.querySelector("#ac").closest(".setting-row").hidden = true;
  document.querySelector("#floorStyle option[value=original]").textContent =
    "蓝白希腊马赛克";
  document
    .querySelector("#curtains")
    .setAttribute("aria-label", "收拢亚麻海风帘");
}
if (sceneId === "renaissance") {
  document.querySelector(".room-title").textContent = "灯亮了，就到家了。";
  document.querySelector(".bottom-left p").textContent = "一窗田野，一室温暖。";
  document.querySelector(".eyebrow").textContent = "A COUNTRY EVENING AT HOME";
  document.querySelector("#ac").closest(".setting-row").hidden = true;
  document.querySelector("#floorStyle option[value=original]").textContent =
    "胡桃木人字拼";
  document
    .querySelector("#curtains")
    .setAttribute("aria-label", "打开薄纱窗帘");
}
if (sceneId === "ruya") {
  document.querySelector(".room-title").textContent = "一室清风，半卷闲书。";
  document.querySelector(".bottom-left p").textContent =
    "听琴，品茗，把心安放。";
  document.querySelector(".eyebrow").textContent = "THE SCHOLAR'S RETREAT";
  document.querySelector("#ac").closest(".setting-row").hidden = true;
  document.querySelector("#floorStyle option[value=original]").textContent =
    "书院胡桃木";
  document.querySelector("#curtains").setAttribute("aria-label", "卷起竹帘");
}
ui.bindScenes(sceneId, scenePresets);
try {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 65);
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = [
    "wabisabi",
    "nordic",
    "machiya",
    "dongfang",
    "mediterranean",
    "italian",
    "renaissance",
    "bohemian",
    "midcentury",
    "french",
    "industrial",
    "artdeco",
    "tropical",
    "memphis",
    "brutalist",
    "tibetan",
    "uyghur",
  ].includes(sceneId)
    ? THREE.VSMShadowMap
    : THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.13;
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);
  const backdrop = mountSceneBackdrop(container, sceneId, store);
  // Keep the mirrored pass's light uniforms and shadow state off the main GPU context.
  const reflectionRenderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  });
  reflectionRenderer.setPixelRatio(1);
  reflectionRenderer.outputColorSpace = renderer.outputColorSpace;
  reflectionRenderer.toneMapping = renderer.toneMapping;
  reflectionRenderer.toneMappingExposure = renderer.toneMappingExposure;
  reflectionRenderer.setClearColor(0x000000, 0);
  const weather = mountWeather(container, camera, store);
  const reflectionCorners = [
    [-5.175, -5.175],
    [5.175, -5.175],
    [5.175, 5.175],
    [-5.175, 5.175],
  ].map(([x, z]) => new THREE.Vector3(x, -0.35, z));
  const reflectionPoint = new THREE.Vector3();
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.065;
  controls.rotateSpeed = 0.48;
  controls.zoomSpeed = 0.6;
  controls.panSpeed = 0.35;
  controls.screenSpacePanning = false;
  // Keep the eye outside the 10 x 10 m room's bounding sphere. Bounded azimuth
  // stays on the open side of the cutaway; bounded target makes pan safe too.
  controls.minDistance = 11.2;
  controls.maxDistance = 38;
  controls.minPolarAngle = 0.5;
  controls.maxPolarAngle = 1.22;
  controls.minAzimuthAngle = 0.18;
  controls.maxAzimuthAngle = 1.12;
  controls.touches.ONE = THREE.TOUCH.ROTATE;
  controls.touches.TWO = THREE.TOUCH.DOLLY_PAN;
  const center = new THREE.Vector3(0, 1.25, 0);
  let homeAnimation = 0;
  const desired = new THREE.Vector3();
  function fitHome() {
    const direction = new THREE.Vector3(12, 15.65, 16).normalize();
    const right = new THREE.Vector3()
      .crossVectors(new THREE.Vector3(0, 1, 0), direction)
      .normalize();
    const up = new THREE.Vector3().crossVectors(direction, right);
    const tanY = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
    const tanX = tanY * camera.aspect;
    const cleanFrame = document.documentElement.dataset.clean === "true";
    let distance = 11.2;
    for (const x of [-5.2, 5.2])
      for (const y of [-0.4, 4.08])
        for (const z of [-5.2, 5.2]) {
          if (
            document.documentElement.dataset.clean === "true" &&
            y > 0 &&
            x > 0 &&
            z > 0
          )
            continue;
          const v = new THREE.Vector3(x, y, z).sub(center);
          distance = Math.max(
            distance,
            v.dot(direction) +
              Math.abs(v.dot(right)) / (tanX * (cleanFrame ? 0.96 : 0.91)),
            v.dot(direction) +
              Math.abs(v.dot(up)) / (tanY * (cleanFrame ? 0.96 : 0.82)),
          );
        }
    // Taller tropical pendant cords and the full wall ends need breathing room.
    if (sceneId === "tropical" && cleanFrame) distance *= 1.18;
    desired.copy(center).addScaledVector(direction, distance);
  }
  let vr;
  function home(immediate = false) {
    if (vr?.active) return;
    fitHome();
    if (immediate) {
      camera.position.copy(desired);
      controls.target.copy(center);
    } else homeAnimation = 1;
  }
  home(true);
  controls.update();
  const interaction = createInteractions(
    scene,
    camera,
    renderer.domElement,
    ui.notify,
  );
  const m = createMaterials();
  bindFloorStyle(m.floor, store);
  const room = createRoom(scene, m, store, interaction.register);
  const architectureMeshes = [];
  scene.traverse((object) => {
    if (object.isMesh) architectureMeshes.push(object);
  });
  const architectureReflection = createArchitectureReflection(
    scene,
    architectureMeshes,
  );
  const furniture = createFurniture(scene, m, store, interaction.register);
  const lighting = createLighting(
    scene,
    store,
    furniture,
    // Lighting-module interactables are RGB strips, available only in RGB rooms.
    rgbEnabled ? interaction.register : (object) => object,
  );
  const fixtureInteractions = bindFixtureInteractions(
    lighting,
    interaction.registry,
    store,
  );
  const whiteLightControl = createWhiteLightControl(lighting, store);
  ui.bindItems(interaction);
  ui.bindHome(() => home());
  store.subscribe((s, key) => {
    interaction.clear();
    if (key === "reset") {
      furniture.reset();
      home();
    }
  });
  vr = createVR({
    sceneId,
    presets: scenePresets,
    descriptions: sceneCopy,
    scene,
    camera,
    renderer,
    controls,
    interaction,
    store,
    notify: ui.notify,
    onExit: () => {
      homeAnimation = 0;
      resize();
    },
  });
  function resize() {
    if (vr?.active) return;
    const previousFit = desired.distanceTo(center);
    const w = container.clientWidth,
      h = container.clientHeight;
    renderer.setSize(w, h);
    reflectionRenderer.setSize(Math.round(w * 0.6), Math.round(h * 0.6));
    camera.aspect = w / h;
    camera.fov =
      w < 850
        ? THREE.MathUtils.radToDeg(
            2 *
              Math.atan(
                Math.tan(THREE.MathUtils.degToRad(38) / 2) / camera.aspect,
              ),
          )
        : 36;
    camera.updateProjectionMatrix();
    fitHome();
    if (previousFit > 0)
      camera.position
        .sub(controls.target)
        .multiplyScalar(desired.distanceTo(center) / previousFit)
        .add(controls.target);
  }
  new ResizeObserver(resize).observe(container);
  resize();
  const targetMin = new THREE.Vector3(-2, 0.95, -2),
    targetMax = new THREE.Vector3(2, 1.65, 2),
    previous = new THREE.Vector3();
  let time = 0,
    last = performance.now(),
    frame = 0,
    visible = true;
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.addEventListener("visibilitychange", () => {
    visible = !document.hidden;
    last = performance.now();
  });
  renderer.domElement.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    visible = false;
    ui.notify("画面暂时中断，请刷新页面重新进入房间。");
  });
  renderer.setAnimationLoop((now) => {
    if (!visible && !renderer.xr.isPresenting) return;
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    time += dt;
    if (!vr.active) {
      if (homeAnimation) {
        camera.position.lerp(desired, 1 - Math.exp(-dt * 5));
        controls.target.lerp(center, 1 - Math.exp(-dt * 5));
        if (camera.position.distanceTo(desired) < 0.015) homeAnimation = 0;
      }
      controls.update();
      previous.copy(controls.target);
      controls.target.clamp(targetMin, targetMax);
      camera.position.add(controls.target.clone().sub(previous));
    }
    room.update(dt, time);
    furniture.update(dt, reduceMotion ? 0 : time);
    lighting.update(dt, reduceMotion ? 0 : time);
    whiteLightControl.update(dt);
    if (!vr.active) {
      weather.update(dt, time, reduceMotion);
      const reflectionOutline = reflectionCorners.map((p) => {
        reflectionPoint.copy(p).project(camera);
        return {
          x: (reflectionPoint.x + 1) / 2,
          y: (1 - reflectionPoint.y) / 2,
        };
      });
      if (frame % 2 === 0)
        architectureReflection.render(reflectionRenderer, camera, (source) =>
          backdrop.render(source, reflectionOutline),
        );
    }
    vr.update(dt);
    renderer.render(vr.renderScene, camera);
    if (frame++ === 2) {
      ui.ready();
      window.dispatchEvent(new Event("stillroom:ready"));
    }
  });
  // Read-only diagnostics are useful for future scene extensions and local QA.
  window.__stillroom = {
    get state() {
      return { ...store.state };
    },
    get diagnostics() {
      return {
        vr: vr.diagnostics,
        reflectionArchitecture: architectureReflection.count,
        meshes: renderer.info.render.calls,
        triangles: renderer.info.render.triangles,
        geometries: renderer.info.memory.geometries,
        textures: renderer.info.memory.textures,
        lights: scene.children.filter((o) => o.isLight).length,
        interactions: interaction.registry.length,
        cameraDistance: camera.position.distanceTo(controls.target),
      };
    },
  };
} catch (error) {
  console.error(error);
  ui.fail();
}
