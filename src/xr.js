import { loadBrandImages, paintRoomIdentity } from "./ui/brand.js";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { createWalkMap, deadzone } from "./xr-navigation.js";
import { traceTeleport, teleportOffset } from "./xr-teleport.js";
import { createXRWeather } from "./xr-weather.js";
import { buildVRWorld } from "./xr-world.js";
import { pickInteractive, viewPlacement, pageItems } from "./xr-spatial.js";

export function createVR({
  scene,
  camera,
  renderer,
  controls,
  interaction,
  store,
  notify,
  onExit,
  sceneId = "studio",
  presets = {},
  descriptions = {},
  home = null,
}) {
  const events = new AbortController();
  let modelRoots = [...scene.children];
  const originalRoots = modelRoots,
    originalStore = store;
  let world = null,
    currentId = sceneId,
    scenePage = 0;
  let registry = interaction.registry,
    unsubscribe;
  let walking = false,
    walkMap,
    turnReady = true;
  let locomotion = "mixed",
    teleportController = null,
    teleportResult = null;
  const movementNames = {
    comfort: "舒适传送",
    stick: "手柄移动",
    mixed: "混合移动",
  };
  const weatherNames = { clear: "晴天", rain: "下雨", snow: "下雪" };
  const weather = createXRWeather();
  weather.bind(modelRoots);
  const wallUI = new THREE.Group();
  wallUI.name = "VR room information walls";
  wallUI.visible = false;
  const teleportVisual = new THREE.Group();
  teleportVisual.visible = false;
  const arcGeometry = new THREE.BufferGeometry();
  arcGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(64 * 3), 3),
  );
  const arc = new THREE.Line(
    arcGeometry,
    new THREE.LineBasicMaterial({ color: 0xa8ecdf }),
  );
  const landingRing = new THREE.Mesh(
    new THREE.RingGeometry(0.22, 0.28, 48),
    new THREE.MeshBasicMaterial({ color: 0xa8ecdf, side: THREE.DoubleSide }),
  );
  landingRing.rotation.x = -Math.PI / 2;
  teleportVisual.add(arc, landingRing);
  scene.add(wallUI, teleportVisual, weather.root);
  const keys = new Set();
  const sceneEntries = Object.entries(presets).filter(
    ([id]) => !home || id !== sceneId,
  );
  const boundary = new THREE.Group();
  boundary.name = "VR virtual walking boundary";
  const borderMaterial = new THREE.LineBasicMaterial({
    depthTest: false,
    color: 0x87e8d4,
    transparent: true,
    opacity: 0.4,
  });
  const corners = [
    [-4.45, -4.45],
    [4.45, -4.45],
    [4.45, 4.45],
    [-4.45, 4.45],
    [-4.45, -4.45],
  ];
  const outline = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(
      corners.map(([x, z]) => new THREE.Vector3(x, 0.055, z)),
    ),
    borderMaterial,
  );
  outline.renderOrder = 850;
  boundary.add(outline);
  const rails = new THREE.BufferGeometry().setFromPoints(
    corners
      .slice(0, 4)
      .flatMap(([x, z]) => [
        new THREE.Vector3(x, 0.06, z),
        new THREE.Vector3(x, 1.1, z),
      ]),
  );
  boundary.add(new THREE.LineSegments(rails, borderMaterial));
  boundary.visible = false;
  scene.add(boundary);
  const rig = new THREE.Group();
  rig.name = "XR observer rig";
  rig.visible = false;
  const space = new THREE.Group();
  rig.add(space);
  scene.add(rig);
  space.visible = false;
  renderer.xr.enabled = true;
  renderer.xr.setReferenceSpaceType("local-floor");
  renderer.xr.setFramebufferScaleFactor(0.85);
  renderer.xr.setFoveation(1);
  const ray = new THREE.Raycaster();
  const rotation = new THREE.Matrix4();
  let active = false,
    preview = false,
    saved,
    supported = false,
    busy = false;
  let needsPlacement = false,
    mode = 0,
    page = 0,
    tab = "scene",
    focus = null;
  let dwellKey = null,
    dwellTime = 0,
    dwellFired = false,
    statusUntil = 0;
  const scales = [3.2, 2.4, 1.65];
  const viewNames = ["微缩全景", "立体近景", "巨幕环绕"];
  const panel = new THREE.Group();
  space.add(panel);
  const buttons = [],
    resources = [];
  const color = {
    dark: 0x182033,
    card: 0x29344c,
    edge: 0x667d9a,
    mint: 0xa8ecdf,
  };
  function box(w, h, d, tint) {
    const geometry = new RoundedBoxGeometry(
      w,
      h,
      d,
      4,
      Math.min(0.025, h / 4, d / 2),
    );
    const material = new THREE.MeshBasicMaterial({
      color: tint,
      transparent: true,
      opacity: 0.72,
      depthWrite: false,
    });
    resources.push(geometry, material);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.renderOrder = 1000;
    material.depthTest = false;
    return mesh;
  }
  function label(w, h, text, fontSize = 34, isButton = false) {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = Math.round((1024 * h) / w);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
    });
    const geometry = new THREE.PlaneGeometry(w, h);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.renderOrder = 1100;
    material.depthTest = false;
    resources.push(texture, material, geometry);
    let previousText, previousTint;
    mesh.userData.draw = (value, tint = "#eaf3ff") => {
      if (previousText === value && previousTint === tint) return;
      previousText = value;
      previousTint = tint;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = tint;
      ctx.font = `500 ${Math.round(canvas.height * (fontSize >= 30 ? 0.52 : 0.48))}px ${isButton ? '"Microsoft YaHei", sans-serif' : '"Mindset Times", "Mindset Qingke", serif'}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const lines = String(value).split("\n");
      if (lines.length > 1)
        ctx.font = `500 ${Math.round((canvas.height / lines.length) * 0.4)}px ${isButton ? '"Microsoft YaHei", sans-serif' : '"Mindset Times", "Mindset Qingke", serif'}`;
      lines.forEach((line, i) =>
        ctx.fillText(
          line,
          canvas.width / 2,
          (canvas.height * (i + 0.5)) / lines.length,
          canvas.width - 35,
        ),
      );
      texture.needsUpdate = true;
    };
    mesh.userData.draw(text);
    if (!isButton && document.fonts?.load) {
      Promise.all([document.fonts.load('16px "Mindset Times"'), document.fonts.load('16px "Mindset Qingke"')]).then(() => {
        const value = previousText, tint = previousTint;
        previousText = undefined; mesh.userData.draw(value, tint);
      });
    }
    return mesh;
  }
  const back = box(1.2, 1.06, 0.09, 0x283443);
  // Rough transmission gives real optical diffusion; a translucent inner layer
  // maintains text contrast in scenes with very different lighting.
  back.material = new THREE.MeshPhysicalMaterial({
    color: 0x91a5b5,
    roughness: 0.55,
    metalness: 0.05,
    transmission: 0.55,
    thickness: 0.09,
    ior: 1.15,
    transparent: true,
    opacity: 0.88,
    depthWrite: false,
  });
  back.material.depthTest = false;
  back.renderOrder = 900;
  panel.add(back);
  const inner = box(1.17, 1.03, 0.055, 0x192735);
  inner.material.opacity = 0.68;
  inner.position.z = 0.015;
  panel.add(inner);
  const title = label(1.08, 0.075, "", 32);
  title.position.set(0, 0.43, 0.065);
  panel.add(title);
  const subtitle = label(1.08, 0.045, "STILLROOM / 沉浸空间", 24);
  subtitle.position.set(0, 0.365, 0.065);
  panel.add(subtitle);
  const info = label(1.04, 0.22, "", 29);
  info.position.set(0, 0.07, 0.075);
  panel.add(info);
  const status = label(1.08, 0.05, "", 24);
  status.position.set(0, -0.465, 0.065);
  panel.add(status);
  function message(text) {
    status.userData.draw(text || "已完成");
    statusUntil = performance.now() + 2800;
  }
  function button(x, y, w, text, action, parent = panel) {
    const group = new THREE.Group();
    group.position.set(x, y, 0.082);
    const body = box(w, 0.092, 0.026, color.card);
    const face = label(w - 0.01, 0.076, text, 29, true);
    face.position.z = 0.015;
    group.add(body, face);
    parent.add(group);
    const entry = { name: text, action, object: group };
    group.userData.interaction = entry;
    const item = { group, body, face, entry, rest: group.position.z };
    buttons.push(item);
    return item;
  }
  const slots = [];
  const tabs = [];
  [
    ["scene", "场景"],
    ["controls", "环境"],
    ["items", "互动"],
    ["walk", "漫游"],
  ].forEach(([key, text], i) => {
    const item = button((i - 1.5) * 0.28, 0.27, 0.26, text, () => {
      tab = key;
      refresh();
    });
    item.tab = key;
    tabs.push(item);
  });
  for (let i = 0; i < 6; i++)
    slots.push(
      button(
        i % 2 ? 0.285 : -0.285,
        0.13 - Math.floor(i / 2) * 0.145,
        0.54,
        "",
        () => {},
      ),
    );
  button(-0.38, -0.365, 0.35, home ? "返回首页" : "重新居中", () => {
    if (home) {
      walking = false;
      boundary.visible = false;
      home.onHome?.();
      changeScene(sceneId);
      return;
    }
    if (walking) positionMenu();
    else place();
    message("菜单已回到身边");
  });
  button(0, -0.365, 0.35, "收起菜单", () => {
    panel.visible = false;
  });
  button(0.38, -0.365, 0.35, "退出 VR", () => exit());
  const beacon = new THREE.Group();
  space.add(beacon);
  const beaconBody = box(0.23, 0.075, 0.022, color.card);
  const beaconText = label(0.22, 0.065, "空间菜单", 32);
  beaconText.position.z = 0.015;
  beacon.add(beaconBody, beaconText);
  beacon.userData.interaction = {
    name: "空间菜单",
    action: () => {
      panel.visible = !panel.visible;
      if (panel.visible) positionMenu();
    },
  };
  const wallFields = [];
  const wallPosters = [];
  const brandImages = loadBrandImages(() =>
    wallPosters.forEach((p) => p.redraw()),
  );
  function wallCard(position, yaw, kind) {
    const group = new THREE.Group();
    group.position.copy(position);
    group.rotation.y = yaw;
    group.scale.setScalar(2.1);
    wallUI.add(group);
    const backing = box(1.3, 1.57, 0.07, 0x172b2d);
    backing.material.opacity = 0.93;
    group.add(backing);
    const canvas = document.createElement("canvas");
    canvas.width = 1536;
    canvas.height = 1216;
    const ctx = canvas.getContext("2d");
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      toneMapped: false,
      transparent: true,
      depthWrite: false,
    });
    const geometry = new THREE.PlaneGeometry(1.22, 0.965);
    const artwork = new THREE.Mesh(geometry, material);
    // Match the existing wall UI compositing order: the dark backing must not tint the poster.
    artwork.renderOrder = 1050;
    material.depthTest = false;
    artwork.position.set(0, 0.25, 0.043);
    group.add(artwork);
    resources.push(texture, material, geometry);
    let lastName = "",
      lastIntro = "";
    const redraw = () => {
      paintRoomIdentity(ctx, brandImages, kind, lastName, lastIntro);
      texture.needsUpdate = true;
    };
    group.userData.draw = (name, intro) => {
      if (name === lastName && intro === lastIntro) return;
      lastName = name;
      lastIntro = intro;
      redraw();
    };
    wallPosters.push({ redraw });
    return group;
  }
  const storyWall = wallCard(
    new THREE.Vector3(0, 2.05, 4.72),
    Math.PI,
    "story",
  );
  button(
    -0.3,
    -0.39,
    0.55,
    "切换场景",
    () => {
      tab = "scenes";
      panel.visible = true;
      positionMenu();
      refresh();
    },
    storyWall,
  );
  button(
    0.3,
    -0.39,
    0.55,
    "移动方式",
    () => {
      tab = "movement";
      panel.visible = true;
      positionMenu();
      refresh();
    },
    storyWall,
  );
  button(0, -0.57, 1.12, "返回立体展台", () => setWalking(false), storyWall);
  const environmentWall = wallCard(
    new THREE.Vector3(4.72, 2.05, 0),
    -Math.PI / 2,
    "environment",
  );
  const wallHint = label(1.15, 0.05, "Quest 3 · 指向按钮，扣动扳机", 24);
  wallHint.position.set(0, -0.27, 0.065);
  environmentWall.add(wallHint);
  const wallActions = [
    [
      () => (store.state.day ? "日间 → 夜晚" : "夜晚 → 日间"),
      () => store.set("day", !store.state.day),
    ],
    [() => `天气 · ${weatherNames[store.state.weather]}`, cycleWeather],
    [
      () => (store.state.whiteOn ? "关闭暖光" : "打开暖光"),
      () => store.set("whiteOn", !store.state.whiteOn),
    ],
    [
      () => `亮度 ${Math.round(store.state.whiteBrightness * 100)}%`,
      () =>
        store.set(
          "whiteBrightness",
          store.state.whiteBrightness >= 0.95
            ? 0.25
            : store.state.whiteBrightness + 0.25,
        ),
    ],
    [
      () => (store.state.curtains ? "窗帘 · 开" : "窗帘 · 合"),
      () => store.set("curtains", !store.state.curtains),
    ],
    [
      () => "回到入口",
      () => {
        cancelTeleport();
        enterRoom();
      },
    ],
  ];
  wallActions.forEach(([name, action], i) => {
    const b = button(
      i % 2 ? 0.3 : -0.3,
      -0.38 - Math.floor(i / 2) * 0.13,
      0.55,
      name(),
      action,
      environmentWall,
    );
    wallFields.push({ b, name });
  });
  const walkHint = label(1.15, 0.07, "", 24);
  walkHint.position.set(0, -0.72, 0.065);
  environmentWall.add(walkHint);
  function cycleWeather() {
    store.set(
      "weather",
      { clear: "rain", rain: "snow", snow: "clear" }[store.state.weather],
    );
  }
  function cancelTeleport() {
    teleportController = null;
    teleportResult = null;
    teleportVisual.visible = false;
  }
  function aimTeleport(controller) {
    controller.updateWorldMatrix(true, false);
    const origin = controller.getWorldPosition(new THREE.Vector3());
    const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(
      controller.getWorldQuaternion(new THREE.Quaternion()),
    );
    teleportResult = traceTeleport(origin, direction, modelRoots, walkMap);
    teleportResult.points.forEach((point, i) =>
      arcGeometry.attributes.position.setXYZ(i, point.x, point.y, point.z),
    );
    arcGeometry.attributes.position.needsUpdate = true;
    arcGeometry.setDrawRange(0, teleportResult.points.length);
    arcGeometry.computeBoundingSphere();
    const tint = teleportResult.valid ? 0xa8ecdf : 0xff876c;
    arc.material.color.setHex(tint);
    landingRing.material.color.setHex(tint);
    landingRing.position
      .copy(teleportResult.target)
      .add(new THREE.Vector3(0, 0.025, 0));
    teleportVisual.visible = true;
  }
  function commitTeleport() {
    if (teleportResult?.valid && walking) {
      rig.position.add(teleportOffset(headPosition(), teleportResult.target));
      rig.updateMatrixWorld(true);
      positionMenu();
      message("已到达圆环落点");
    } else message("此处不可到达 · 请选择空地");
    cancelTeleport();
  }
  function setSlot(i, text, action) {
    slots[i].group.visible = Boolean(text);
    slots[i].entry.name = text;
    slots[i].entry.action = action;
    slots[i].face.userData.draw(text);
  }
  function refresh() {
    if (home && currentId === sceneId) {
      panel.visible = false;
      beacon.visible = false;
    } else beacon.visible = true;
    wallUI.visible = active && walking;
    storyWall.userData.draw(
      presets[currentId]?.label || "心境",
      descriptions[currentId]?.[0] ||
        "留一点时间给自己，感受小屋里的光影与材质。",
    );
    environmentWall.userData.draw(
      "光影与天气",
      "让光线慢下来，让天气陪伴此刻。\n选择一份适合你的明暗、温度与宁静。",
    );
    wallFields.forEach(({ b, name }) => {
      b.entry.name = name();
      b.face.userData.draw(b.entry.name);
    });
    walkHint.userData.draw(
      `${movementNames[locomotion]} · 右摇杆转向 · 握键菜单`,
    );
    title.userData.draw(
      `${presets[currentId]?.label || "小憩"} · ${walking ? "房间漫游" : "立体展台"}`,
    );
    subtitle.userData.draw(
      tab === "scenes"
        ? "场景导览 · 保持 VR 会话"
        : tab === "movement"
          ? "Quest 3 · 选择适合你的移动方式"
          : "MINDSET OF LO-FI / 回归本真",
    );
    info.visible = false;
    tabs.forEach(
      (item) =>
        (item.selected =
          item.tab === tab ||
          (item.tab === "scene" && tab === "scenes") ||
          (item.tab === "walk" && tab === "movement")),
    );
    if (tab === "scene") {
      info.visible = true;
      const text =
        descriptions[currentId]?.[0] ||
        "走进属于此刻的安静角落，感受光影与材质。";
      info.userData.draw(
        text
          .match(/.{1,24}/gu)
          ?.slice(0, 4)
          .join("\n") || text,
      );
      for (let i = 0; i < 4; i++) setSlot(i, "", () => {});
      setSlot(4, "切换场景", () => {
        tab = "scenes";
        refresh();
      });
      setSlot(5, walking ? "返回立体展台" : "走进房间", () =>
        setWalking(!walking),
      );
    } else if (tab === "scenes") {
      const result = pageItems(sceneEntries, scenePage, 4);
      scenePage = result.index;
      for (let i = 0; i < 4; i++) {
        const item = result.items[i];
        setSlot(
          i,
          item ? `${item[0] === currentId ? "● " : ""}${item[1].label}` : "",
          () => changeScene(item[0]),
        );
      }
      setSlot(4, "上一页", () => {
        scenePage--;
        refresh();
      });
      setSlot(5, `下一页 ${scenePage + 1}/${result.pages}`, () => {
        scenePage++;
        refresh();
      });
    } else if (tab === "movement") {
      ["comfort", "stick", "mixed"].forEach((value, i) => {
        setSlot(
          i,
          `${locomotion === value ? "● " : ""}${movementNames[value]}`,
          () => {
            locomotion = value;
            cancelTeleport();
            refresh();
            message(
              value === "stick"
                ? "左摇杆行走 · 右摇杆转向"
                : "空地按住扳机划圈瞄准 · 松开传送",
            );
          },
        );
      });
      setSlot(3, "回到入口", () => {
        if (walking) {
          cancelTeleport();
          enterRoom();
        }
      });
      setSlot(4, "左转 30°", () => turn(Math.PI / 6));
      setSlot(5, "右转 30°", () => turn(-Math.PI / 6));
    } else if (tab === "walk") {
      setSlot(0, walking ? "返回立体展台" : "走进房间 · 1:1", () =>
        setWalking(!walking),
      );
      setSlot(1, `方式 · ${movementNames[locomotion]}`, () => {
        tab = "movement";
        refresh();
      });
      setSlot(2, "前进一步", () => stepWalk(0, -0.45));
      setSlot(3, "后退一步", () => stepWalk(0, 0.45));
      setSlot(4, "左转 30°", () => turn(Math.PI / 6));
      setSlot(5, "右转 30°", () => turn(-Math.PI / 6));
    } else if (tab === "items") {
      const result = pageItems(registry, page, 4);
      page = result.index;
      for (let i = 0; i < 4; i++) {
        const item = result.items[i];
        setSlot(i, item?.name || "", () => message(item.action()));
      }
      setSlot(4, "上一页", () => {
        page--;
        refresh();
      });
      setSlot(5, `下一页 ${page + 1}/${result.pages}`, () => {
        page++;
        refresh();
      });
    } else {
      const s = store.state;
      setSlot(0, s.day ? "日间 → 夜晚" : "夜晚 → 日间", () =>
        store.set("day", !store.state.day),
      );
      setSlot(1, s.whiteOn ? "关闭暖光" : "打开暖光", () =>
        store.set("whiteOn", !store.state.whiteOn),
      );
      setSlot(2, s.curtains ? "切换窗帘 · 开" : "切换窗帘 · 合", () =>
        store.set("curtains", !store.state.curtains),
      );
      setSlot(3, walking ? "返回立体展台" : viewNames[mode], () => {
        if (walking) {
          setWalking(false);
          return;
        }
        mode = (mode + 1) % scales.length;
        place();
        refresh();
      });
      setSlot(4, `灯光 ${Math.round(s.whiteBrightness * 100)}%`, () =>
        store.set(
          "whiteBrightness",
          s.whiteBrightness >= 0.95
            ? 0.25
            : Math.min(1, s.whiteBrightness + 0.25),
        ),
      );
      setSlot(5, `天气 · ${weatherNames[store.state.weather]}`, cycleWeather);
    }
  }
  unsubscribe = store.subscribe(refresh);
  refresh();
  function restoreWorld() {
    if (!world) return;
    scene.add(rig, boundary, wallUI, teleportVisual, weather.root);
    world.dispose();
    world = null;
    modelRoots = originalRoots;
    registry = interaction.registry;
    unsubscribe?.();
    store = originalStore;
    unsubscribe = store.subscribe(refresh);
    currentId = sceneId;
    weather.bind(modelRoots);
    walkMap = null;
  }
  function changeScene(id) {
    cancelTeleport();
    if (id === currentId) {
      tab = "scene";
      refresh();
      return;
    }
    message("正在布置新的小屋…");
    try {
      const next = id === sceneId ? null : buildVRWorld(presets[id], id);
      restoreWorld();
      if (next) {
        world = next;
        modelRoots = [...next.scene.children];
        registry = next.registry;
        unsubscribe?.();
        store = next.store;
        unsubscribe = store.subscribe(refresh);
        next.scene.background = new THREE.Color(0x101522);
        next.scene.add(rig, boundary, wallUI, teleportVisual, weather.root);
      }
      currentId = id;
      panel.visible = !(home && id === sceneId);
      weather.bind(modelRoots);
      page = 0;
      tab = "scene";
      walkMap = null;
      if (walking) enterRoom();
      else place();
      refresh();
      message(`已进入${presets[id].label}`);
    } catch (error) {
      console.error(error);
      message("场景加载失败，请重试");
    }
  }
  function headPosition() {
    rig.updateMatrixWorld(true);
    return camera.getWorldPosition(new THREE.Vector3());
  }
  function enterRoom() {
    walkMap ||= createWalkMap(modelRoots);
    const spawn = walkMap.spawn();
    if (!spawn) {
      walking = false;
      boundary.visible = false;
      place();
      message("该房间暂时没有足够的可行走区域");
      return;
    }
    rig.scale.setScalar(1);
    rig.rotation.set(0, 0.35, 0);
    rig.position.copy(spawn);
    const offset = new THREE.Vector3(
      camera.position.x,
      0,
      camera.position.z,
    ).applyQuaternion(rig.quaternion);
    rig.position.sub(offset);
    if (preview) camera.rotation.set(0, 0, 0);
    rig.updateMatrixWorld(true);
    boundary.visible = true;
    positionMenu();
  }
  function setWalking(value) {
    cancelTeleport();
    walking = value;
    keys.clear();
    turnReady = true;
    if (walking) enterRoom();
    else {
      boundary.visible = false;
      place();
      if (preview) camera.rotation.x = -0.17;
    }
    refresh();
    message(
      walking ? `已进入房间 · ${movementNames[locomotion]}` : "已回到立体展台",
    );
  }
  function stepWalk(x, z) {
    if (!walking || !walkMap) return;
    const q = camera.getWorldQuaternion(new THREE.Quaternion());
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(q);
    forward.y = 0;
    forward.normalize();
    const right = new THREE.Vector3(-forward.z, 0, forward.x);
    const delta = right.multiplyScalar(x).addScaledVector(forward, -z);
    const head = headPosition();
    const next = walkMap.move(head, delta);
    rig.position.add(next.sub(head));
    rig.updateMatrixWorld(true);
  }
  function turn(angle) {
    if (!walking) return;
    cancelTeleport();
    const before = headPosition();
    rig.rotation.y += angle;
    rig.updateMatrixWorld(true);
    const after = headPosition();
    rig.position.x += before.x - after.x;
    rig.position.z += before.z - after.z;
    rig.updateMatrixWorld(true);
    positionMenu();
  }
  function updateWalk(dt) {
    if (!walking || !walkMap) return;
    let x = 0,
      z = 0,
      rot = 0;
    for (const c of controllers) {
      const axes = c.source?.gamepad?.axes;
      if (!axes?.length) continue;
      const ax = deadzone(axes[axes.length >= 4 ? 2 : 0] || 0),
        ay = deadzone(axes[axes.length >= 4 ? 3 : 1] || 0);
      if (c.source.handedness === "right") rot = ax;
      else {
        x = ax;
        z = ay;
      }
    }
    if (preview) {
      x = (keys.has("d") ? 1 : 0) - (keys.has("a") ? 1 : 0);
      z =
        (keys.has("s") || keys.has("ArrowDown") ? 1 : 0) -
        (keys.has("w") || keys.has("ArrowUp") ? 1 : 0);
      rot = (keys.has("ArrowRight") ? 1 : 0) - (keys.has("ArrowLeft") ? 1 : 0);
    }
    const length = Math.hypot(x, z);
    if (length > 1) {
      x /= length;
      z /= length;
    }
    if (locomotion !== "comfort" && !teleportController)
      stepWalk(x * Math.min(dt, 0.05) * 1.25, z * Math.min(dt, 0.05) * 1.25);
    if (Math.abs(rot) < 0.25) turnReady = true;
    else if (turnReady && Math.abs(rot) > 0.55) {
      turn((-Math.sign(rot) * Math.PI) / 6);
      turnReady = false;
    }
    const head = headPosition(),
      distance = walkMap.extent - Math.max(Math.abs(head.x), Math.abs(head.z));
    borderMaterial.color.setHex(distance < 0.55 ? 0xffb878 : 0x87e8d4);
    borderMaterial.opacity = distance < 0.55 ? 0.95 : 0.35;
    if (distance < 0.3) message("已到虚拟边缘 · 请退回房间内");
    // Bring the menu with the walking origin; it remains spatial, never a DOM overlay.
    if (preview && (x || z)) positionMenu();
  }
  const controllers = [0, 1].map((index) => {
    const controller = renderer.xr.getController(index);
    rig.add(controller);
    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(),
      new THREE.Vector3(0, 0, -1),
    ]);
    const line = new THREE.Line(
      geometry,
      new THREE.LineBasicMaterial({
        color: color.mint,
        transparent: true,
        opacity: 0.7,
      }),
    );
    line.scale.z = 5;
    controller.add(line);
    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(0.009, 12, 8),
      new THREE.MeshBasicMaterial({ color: color.mint }),
    );
    controller.add(dot);
    dot.visible = false;
    let source = null;
    controller.addEventListener("connected", (e) => {
      source = e.data;
    });
    controller.addEventListener("disconnected", () => {
      source = null;
      dot.visible = false;
      if (teleportController === controller) cancelTeleport();
    });
    let teleportPress = false;
    controller.addEventListener("selectstart", () => {
      teleportPress = false;
      if (
        active &&
        walking &&
        locomotion !== "stick" &&
        !teleportController &&
        !cast(controller)
      ) {
        teleportPress = true;
        teleportController = controller;
        aimTeleport(controller);
      }
    });
    controller.addEventListener("selectend", () => {
      if (teleportPress && teleportController === controller) {
        aimTeleport(controller);
        commitTeleport();
      }
      teleportPress = false;
    });
    controller.addEventListener("select", () => {
      if (active && !teleportPress && !teleportController)
        activate(cast(controller));
    });
    controller.addEventListener("squeezestart", () => {
      if (active && !(home && currentId === sceneId)) {
        cancelTeleport();
        panel.visible = !panel.visible;
        if (panel.visible) positionMenu();
      }
    });
    return {
      controller,
      line,
      dot,
      get source() {
        return source;
      },
    };
  });
  const gazeDot = new THREE.Mesh(
    new THREE.RingGeometry(0.006, 0.01, 24),
    new THREE.MeshBasicMaterial({ color: color.mint, side: THREE.DoubleSide }),
  );
  space.add(gazeDot);
  gazeDot.visible = false;
  function positionMenu() {
    const head = preview ? camera : renderer.xr.getCamera();
    const p = head.getWorldPosition(new THREE.Vector3());
    rig.worldToLocal(p);
    const q = head.getWorldQuaternion(new THREE.Quaternion());
    q.premultiply(rig.getWorldQuaternion(new THREE.Quaternion()).invert());
    const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(q);
    dir.y = 0;
    dir.normalize();
    const yaw = Math.atan2(-dir.x, -dir.z);
    const right = new THREE.Vector3(-dir.z, 0, dir.x);
    panel.scale.setScalar(preview ? Math.min(1, camera.aspect / 0.9) : 1);
    panel.position
      .copy(p)
      .addScaledVector(dir, 1.8)
      .addScaledVector(
        right,
        preview
          ? -Math.min(0.72, Math.max(0, (camera.aspect - 0.7) * 0.8))
          : -1.15,
      );
    panel.position.y -= walking ? 0.28 : 0.55;
    panel.quaternion.setFromRotationMatrix(
      new THREE.Matrix4().lookAt(p, panel.position, new THREE.Vector3(0, 1, 0)),
    );
    beacon.position.copy(p).addScaledVector(dir, 1.48);
    beacon.position.y -= 0.91;
    beacon.rotation.set(-0.3, yaw, 0, "YXZ");
  }

  function place() {
    if (home && currentId === sceneId) {
      rig.scale.setScalar(1);
      const facing = new THREE.Vector3(0, 0, -1).applyQuaternion(
        camera.quaternion,
      );
      rig.rotation.set(0, -Math.atan2(-facing.x, -facing.z), 0);
      const offset = new THREE.Vector3(
        camera.position.x,
        0,
        camera.position.z,
      ).applyQuaternion(rig.quaternion);
      rig.position.set(-offset.x, 0, -offset.z);
      home.place?.({ camera, rig, preview });
      rig.updateMatrixWorld(true);
      return;
    }
    const height = preview ? 1.6 : Math.max(0.8, camera.position.y || 1.6);
    const view = viewPlacement(scales[mode], height);
    rig.scale.setScalar(view.scale);
    rig.position.copy(view.position);
    const headDirection = new THREE.Vector3(0, 0, -1).applyQuaternion(
      camera.quaternion,
    );
    const headYaw = Math.atan2(-headDirection.x, -headDirection.z);
    rig.rotation.set(0, view.yaw - headYaw, 0);
    const offset = new THREE.Vector3(camera.position.x, 0, camera.position.z)
      .multiplyScalar(view.scale)
      .applyQuaternion(rig.quaternion);
    rig.position.sub(offset);
    rig.updateMatrixWorld(true);
    positionMenu();
  }
  function cast(object) {
    object.updateWorldMatrix(true, false);
    rotation.extractRotation(object.matrixWorld);
    ray.set(
      object.getWorldPosition(new THREE.Vector3()),
      new THREE.Vector3(0, 0, -1).applyMatrix4(rotation),
    );
    ray.near = 0.01;
    ray.far = 45;
    // Compare menu and room geometry in one ray: a hidden menu is never hittable.
    return (
      pickInteractive(ray, [panel, beacon, wallUI]) ||
      pickInteractive(ray, modelRoots)
    );
  }
  function activate(hit) {
    if (!hit) return;
    try {
      if (registry.includes(hit.entry)) message(hit.entry.action());
      else hit.entry.action();
      controllers.forEach((c) =>
        c.source?.gamepad?.hapticActuators?.[0]
          ?.pulse(0.22, 45)
          ?.catch?.(() => {}),
      );
    } catch (error) {
      console.error(error);
      message("操作未完成，请重试");
    }
  }
  function begin(isPreview = false) {
    if (active) return;
    preview = isPreview;
    active = true;
    home?.onActive?.(true);
    saved = {
      position: camera.position.clone(),
      quaternion: camera.quaternion.clone(),
      scale: camera.scale.clone(),
      near: camera.near,
      far: camera.far,
      fov: camera.fov,
      aspect: camera.aspect,
      target: controls.target.clone(),
      enabled: controls.enabled,
      background: scene.background,
    };
    interaction.clear();
    interaction.setEnabled(false);
    controls.enabled = false;
    rig.visible = true;
    rig.add(camera);
    camera.position.set(0, 1.6, 0);
    camera.quaternion.identity();
    camera.scale.setScalar(1);
    camera.near = 0.03;
    camera.far = 150;
    camera.fov = 65;
    camera.updateProjectionMatrix();
    scene.background = new THREE.Color(0x101522);
    space.visible = true;
    panel.visible = true;
    needsPlacement = !preview;
    refresh();
    document.documentElement.dataset.xr = "true";
    setEntryLabel("退出空间模式");
    place();
    if (preview) {
      camera.rotation.x = home && currentId === sceneId ? 0 : -0.17;
      positionMenu();
    }
  }
  function finish() {
    if (!active) return;
    active = false;
    cancelTeleport();
    weather.root.visible = false;
    preview = false;
    walking = false;
    boundary.visible = false;
    keys.clear();
    restoreWorld();
    refresh();
    space.visible = false;
    gazeDot.visible = false;
    rig.remove(camera);
    rig.visible = false;
    camera.position.copy(saved.position);
    camera.quaternion.copy(saved.quaternion);
    camera.scale.copy(saved.scale);
    camera.near = saved.near;
    camera.far = saved.far;
    camera.fov = saved.fov;
    camera.aspect = saved.aspect;
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld(true);
    controls.target.copy(saved.target);
    controls.enabled = saved.enabled;
    scene.background = saved.background;
    interaction.setEnabled(true);
    interaction.clear();
    delete document.documentElement.dataset.xr;
    setEntryLabel("VR 空间");
    focus = null;
    home?.onActive?.(false);
    onExit?.();
  }
  async function exit() {
    if (preview) finish();
    else if (renderer.xr.getSession()) await renderer.xr.getSession().end();
  }
  const sessionStart = () => begin(false);
  renderer.xr.addEventListener("sessionstart", sessionStart);
  renderer.xr.addEventListener("sessionend", finish);
  function setEntryLabel(value) {
    entry.ariaLabel = value;
    if (home) entry.textContent = value;
    else entry.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 6h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-3l-3-3h-2l-3 3H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z"/><circle cx="8" cy="11" r="2"/><circle cx="16" cy="11" r="2"/></svg>';
  }
  const entry = document.createElement("button");
  entry.id = "vr-entry";
  entry.type = "button";
  setEntryLabel("VR 空间");
  entry.title = "进入双眼立体空间，或预览空间菜单";
  entry.className = "glass control-button";
  const roomControls = !home && document.querySelector?.("#ui-layer .global-controls");
  if (roomControls?.prepend) roomControls.prepend(entry);
  else document.body.append(entry);
  const dialog = document.createElement("dialog");
  dialog.className = "xr-dialog";
  dialog.innerHTML = `<h2>走进立体小屋</h2><p>双眼立体场景、悬浮菜单与手柄互动。</p><p class="xr-support"></p><div class="xr-dialog-actions"><button data-enter>进入 VR</button><button data-preview>空间预览</button><button data-close>返回</button></div><small>手柄：指向后扣扳机，握键收起 / 呼出菜单。<br>无手柄时：注视按钮约 1.5 秒触发。Quest 3：左摇杆移动、右摇杆分段转向。<br>漫游可选舒适传送 / 手柄移动 / 混合；空地按住扳机圈选，松开传送。<br>空间预览：WASD 行走，方向键转向，Esc 退出。</small>`;
  document.body.append(dialog);
  const enterButton = dialog.querySelector("[data-enter]");
  function supportText() {
    enterButton.disabled = !supported || busy;
    dialog.querySelector(".xr-support").textContent = supported
      ? "已检测到 VR 支持。请戴上头显，在舒适、安全的位置进入。"
      : !window.isSecureContext
        ? "VR 需要 HTTPS。请用头显浏览器打开安全地址；局域网 HTTP 不支持 WebXR。"
        : "当前浏览器未检测到 VR 设备。请使用支持 WebXR 的头显浏览器；也可以先预览空间菜单。";
  }
  supportText();
  navigator.xr
    ?.isSessionSupported("immersive-vr")
    .then((value) => {
      supported = value;
      supportText();
    })
    .catch(() => supportText());
  entry.addEventListener("click", () => {
    if (active) exit();
    else {
      supportText();
      dialog.showModal();
    }
  });
  dialog.querySelector("[data-close]").onclick = () => dialog.close();
  dialog.querySelector("[data-preview]").onclick = () => {
    dialog.close();
    begin(true);
  };
  enterButton.onclick = async () => {
    if (busy || !supported) return;
    busy = true;
    supportText();
    let session;
    try {
      session = await navigator.xr.requestSession("immersive-vr", {
        requiredFeatures: ["local-floor"],
      });
      await renderer.xr.setSession(session);
      dialog.close();
    } catch (error) {
      await session?.end().catch(() => {});
      finish();
      const text =
        error.name === "NotAllowedError"
          ? "VR 请求已取消，请允许浏览器进入沉浸模式后重试。"
          : "VR 未能启动，请检查头显连接及浏览器的 WebXR 支持。";
      dialog.querySelector(".xr-support").textContent = text;
      notify(text);
    } finally {
      busy = false;
      enterButton.disabled = !supported;
    }
  };
  const pointer = new THREE.Vector2();
  function pointerHit(event) {
    const bounds = renderer.domElement.getBoundingClientRect();
    pointer.set(
      ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
      (-(event.clientY - bounds.top) / bounds.height) * 2 + 1,
    );
    ray.setFromCamera(pointer, camera);
    return (
      pickInteractive(ray, [panel, beacon, wallUI]) ||
      pickInteractive(ray, modelRoots)
    );
  }
  renderer.domElement.addEventListener(
    "pointermove",
    (e) => {
      if (preview) focus = pointerHit(e);
    },
    { signal: events.signal },
  );
  renderer.domElement.addEventListener(
    "click",
    (e) => {
      if (preview) activate(pointerHit(e));
    },
    { signal: events.signal },
  );
  window.addEventListener(
    "keydown",
    (e) => {
      if (e.key === "Escape" && preview) finish();
      if (
        preview &&
        active &&
        [
          "w",
          "a",
          "s",
          "d",
          "ArrowLeft",
          "ArrowRight",
          "ArrowUp",
          "ArrowDown",
        ].includes(e.key)
      ) {
        if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
          // A brief preview key press may begin and end between render frames.
          // Apply a single snap turn on keydown, just like a controller stick.
          if (walking && !e.repeat)
            turn(((e.key === "ArrowLeft" ? 1 : -1) * Math.PI) / 6);
        } else keys.add(e.key);
        e.preventDefault();
      }
    },
    { signal: events.signal },
  );
  window.addEventListener("keyup", (e) => keys.delete(e.key), {
    signal: events.signal,
  });
  window.addEventListener("blur", () => keys.clear(), {
    signal: events.signal,
  });
  return {
    openScene(id) {
      if (!active || !presets[id]) return false;
      changeScene(id);
      return currentId === id;
    },
    exit,
    dispose() {
      finish();
      events.abort();
      unsubscribe?.();
      renderer.xr.removeEventListener("sessionstart", sessionStart);
      renderer.xr.removeEventListener("sessionend", finish);
      entry.remove?.();
      dialog.remove?.();
      rig.removeFromParent();
      boundary.removeFromParent();
      wallUI.removeFromParent();
      teleportVisual.removeFromParent();
      weather.root.removeFromParent();
      resources.forEach((resource) => resource.dispose());
      back.material.dispose();
    },
    get renderScene() {
      return world?.scene || scene;
    },
    get active() {
      return active;
    },
    get diagnostics() {
      return {
        active,
        presenting: renderer.xr.isPresenting,
        preview,
        supported,
        scene: currentId,
        walking,
        locomotion,
        teleportValid: teleportResult?.valid || false,
        wallPanels: wallUI.visible,
        weather: store.state.weather,
        view: viewNames[mode],
        menu: panel.visible,
        controls: buttons.length,
      };
    },
    update(dt) {
      if (!active) return;
      world?.update(dt);
      weather.update(dt, store.state, active);
      if (!preview) {
        // WebXR updates poses before this callback; update matrices before rays.
        rig.updateMatrixWorld(true);
        renderer.xr.updateCamera(camera);
        if (needsPlacement && renderer.xr.getCamera().cameras.length) {
          place();
          renderer.xr.updateCamera(camera);
          positionMenu();
          needsPlacement = false;
        }
        let hit = null,
          tracked = false;
        for (const c of controllers) {
          c.line.visible = Boolean(c.source);
          c.dot.visible = false;
          if (!c.source) continue;
          tracked = true;
          if (teleportController === c.controller) {
            aimTeleport(c.controller);
            c.line.visible = false;
            continue;
          }
          const target = cast(c.controller);
          hit ||= target;
          c.line.scale.z = target ? target.distance / rig.scale.x : 5;
          if (target) {
            c.dot.visible = true;
            c.dot.position.set(0, 0, -target.distance / rig.scale.x);
          }
        }
        gazeDot.visible = !tracked;
        if (!tracked) {
          hit = cast(renderer.xr.getCamera());
          gazeDot.position
            .copy(ray.ray.origin)
            .addScaledVector(ray.ray.direction, rig.scale.x * 0.9);
          rig.worldToLocal(gazeDot.position);
          gazeDot.quaternion.copy(camera.quaternion);
          if (dwellKey !== hit?.entry) {
            dwellKey = hit?.entry;
            dwellTime = 0;
            dwellFired = false;
          }
          if (hit && !dwellFired) {
            dwellTime += dt;
            if (dwellTime >= 1.5) {
              dwellFired = true;
              activate(hit);
            }
          }
          gazeDot.scale.setScalar(1 + Math.min(dwellTime / 1.5, 1) * 0.65);
        }
        focus = hit;
      }
      updateWalk(dt);
      for (const b of buttons) {
        const hover = focus?.entry === b.entry;
        b.group.position.z = THREE.MathUtils.damp(
          b.group.position.z,
          b.rest + (hover ? 0.018 : 0),
          14,
          dt,
        );
        b.body.material.color.setHex(
          hover ? 0x638f99 : b.selected ? 0x436d7d : color.card,
        );
        b.body.material.opacity = hover || b.selected ? 0.88 : 0.48;
      }
      if (performance.now() > statusUntil)
        status.userData.draw(
          focus
            ? `${focus.entry.name} · ${preview ? "点击" : "扳机 / 注视"}`
            : walking
              ? locomotion === "stick"
                ? "左摇杆移动 · 右摇杆转向 · 握键菜单"
                : "按住扳机圈选空地 · 松开传送 · 握键菜单"
              : "指向后扣扳机 · 握键呼出菜单",
        );
    },
  };
}
