import {
  createIcons,
  Moon,
  Sun,
  SlidersHorizontal,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Wind,
  PanelLeftClose,
  Maximize,
  MousePointer2,
  Move,
  ZoomIn,
  Armchair,
  Heart,
  ArrowUpRight,
  Lamp,
  Box,
  Monitor,
  Cat,
  Palette,
  X,
} from "lucide";
import { rgbModes } from "./state.js";
import { floorStyles } from "./scene/floor-styles.js";
import { mountAmbientUI } from "./ui/ambient.js";
const icon = (name) => `<i data-lucide="${name}" aria-hidden="true"></i>`;
export function mountUI(
  store,
  {
    dayLabel = "日光",
    nightLabel = "夜晚",
    daySceneLabel = "温柔的日光",
    rgbEnabled = true,
  } = {},
) {
  const app = document.querySelector("#app");
  app.innerHTML = `<main id="experience">
 <div id="viewport" role="application" aria-label="可互动的 3D lofi 房间。拖动旋转，滚轮缩放；也可以通过物品菜单互动。"></div>
 <header class="brand"><div class="brand-mark">${icon("armchair")}</div><div><div class="wordmark">stillroom<span>小憩</span></div><p>慢下来，待一会儿。</p></div></header>
 <div class="scene-tag"><span class="status-dot"></span><span id="scene-label">宁静的夜晚</span><span class="tag-divider"></span><span>你的私人角落</span></div>
 <button class="panel-reopen glass icon-button" id="open-panel" aria-label="打开房间控制" title="打开房间控制">${icon("sliders-horizontal")}</button>
 <div class="room-clock" aria-label="本地时间和日期"><time id="clock-time"></time><time id="clock-date"></time></div>
 <aside class="panel glass" id="controls" aria-label="房间控制面板">
   <div class="panel-heading"><div><small>MAKE YOURSELF AT HOME</small><h1>房间的心情</h1></div><button id="close-panel" class="icon-button" aria-label="收起控制面板" title="收起">${icon("x")}</button></div>
   <div class="panel-body">
   <div class="panel-section"><div class="section-title"><span>${icon("armchair")}小屋全局</span></div><label class="floor-style-label" for="floorStyle">地板样式</label><select id="floorStyle">${Object.entries(
     floorStyles,
   )
     .map(([value, label]) => `<option value="${value}">${label}</option>`)
     .join("")}</select></div>
   <div id="rgb-section" class="panel-section" ${rgbEnabled ? "" : "hidden"}><div class="section-title"><span>${icon("palette")}氛围彩光</span><span class="tiny-label">RGB</span></div>
     <label class="select-label" for="rgbMode">灯光模式</label><select id="rgbMode">${Object.entries(
       rgbModes,
     )
       .map(([v, label]) => `<option value="${v}">${label}</option>`)
       .join("")}</select>
     <div class="color-row"><label class="color-picker" title="自选颜色"><input id="rgbColor" type="color" aria-label="RGB 颜色"/><span>自选颜色</span></label><div class="swatches">${["#a58bfa", "#7abac9", "#dfa56f", "#d28baf"].map((c) => `<button class="swatch" style="--swatch:${c}" data-color="${c}" aria-label="选择颜色 ${c}"></button>`).join("")}</div></div>
     <label class="range-label" for="rgbBrightness">亮度 <output id="rgbBrightness-value"></output></label><input id="rgbBrightness" type="range" min="0" max="1" step=".01"/>
     <label class="range-label" for="rgbSpeed">流动速度 <output id="rgbSpeed-value"></output></label><input id="rgbSpeed" type="range" min="0" max="1" step=".01"/>
   </div>
   <div class="panel-section"><div class="section-title"><span>${icon("lightbulb")}柔和白光</span><button id="whiteOn" class="switch" role="switch" aria-label="白色照明开关" aria-checked="true"><span></span></button></div>
     <div class="segmented" role="group" aria-label="白光色温">${[
       ["2700", "暖白"],
       ["4000", "自然"],
       ["6000", "冷白"],
     ]
       .map(
         ([k, n]) =>
           `<button data-temp="${k}">${n}<small>${k} K</small></button>`,
       )
       .join("")}</div>
     <label class="range-label" for="whiteBrightness">亮度 <output id="whiteBrightness-value"></output></label><input id="whiteBrightness" type="range" min="0" max="1" step=".01"/>
   </div>
   <div class="panel-section room-settings"><div class="section-title"><span>${icon("armchair")}房间细节</span></div>
     <div class="setting-row"><span>${icon("panel-left-close")}窗帘<small id="curtains-label"></small></span><button id="curtains" class="switch" role="switch" aria-label="打开窗帘"><span></span></button></div>
     <div class="setting-row"><span>${icon("wind")}空调<small id="ac-label"></small></span><button id="ac" class="switch" role="switch" aria-label="空调开关"><span></span></button></div>
   </div>
   <button id="reset" class="reset">${icon("rotate-ccw")}恢复默认状态</button>
   </div>
   <footer class="panel-footer"><span class="status-dot"></span>光线刚好，心情也刚好。</footer>
 </aside>
 <div class="bottom-left"><span class="eyebrow">A LITTLE SPACE TO BE.</span><div class="room-title">把夜晚，留给自己<span>。</span></div><p>灯光很轻，时间很慢。</p></div>
 <nav class="dock glass" aria-label="场景和视角"><div class="presets"><button id="day-night" data-preset="cycle" class="active"><span class="night-icon">${icon("moon")}</span><span class="day-icon">${icon("sun")}</span><span id="day-night-label">夜晚</span></button></div><span class="dock-divider"></span><button id="home-view" class="icon-button" title="恢复视角" aria-label="恢复视角">${icon("rotate-ccw")}</button><button id="fullscreen" class="icon-button" title="全屏" aria-label="全屏">${icon("maximize")}</button><button id="items-button" class="icon-button" title="可互动物品" aria-label="可互动物品" aria-expanded="false">${icon("mouse-pointer-2")}</button></nav>
 <div class="interaction-guide"><span>${icon("move")}拖动旋转</span><span>${icon("zoom-in")}滚轮缩放</span><span>${icon("mouse-pointer-2")}点击互动</span></div>
 <div id="items-panel" class="items-panel glass" hidden><div class="section-title">可互动物品 <button id="close-items" class="icon-button" aria-label="关闭物品菜单">${icon("x")}</button></div><p>轻点物品，发现一点小惊喜。</p><div id="items-list"></div></div>
 <div id="object-tooltip" role="tooltip"></div><div id="toast" class="glass" role="status" aria-live="polite"></div>
 <div id="loading"><span class="loading-orb"></span><p>为你点亮一个小世界…</p></div>
 </main>`;
  const clockTime = document.querySelector("#clock-time");
  const timeFormat = new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const updateClock = () => {
    const now = new Date();
    clockTime.textContent = timeFormat.format(now);
    clockTime.dateTime = now.toISOString();
  };
  updateClock();
  window.setInterval(updateClock, 1000);
  createIcons({
    icons: {
      Moon,
      Sun,
      SlidersHorizontal,
      RotateCcw,
      ChevronDown,
      ChevronUp,
      Lightbulb,
      Wind,
      PanelLeftClose,
      Maximize,
      MousePointer2,
      Move,
      ZoomIn,
      Armchair,
      Heart,
      ArrowUpRight,
      Lamp,
      Box,
      Monitor,
      Cat,
      Palette,
      X,
    },
  });
  const el = (id) => document.getElementById(id);
  let toastTimer;
  function notify(text) {
    el("toast").textContent = text;
    el("toast").classList.add("visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(
      () => el("toast").classList.remove("visible"),
      3500,
    );
  }
  const sliderKeys = ["rgbBrightness", "rgbSpeed", "whiteBrightness"];
  for (const key of ["floorStyle", "rgbMode", "rgbColor", ...sliderKeys])
    el(key).addEventListener("input", (event) => {
      store.set(
        key,
        sliderKeys.includes(key)
          ? Number(event.target.value)
          : event.target.value,
      );
      if (key === "rgbColor") store.set("rgbMode", "static");
    });
  for (const key of ["whiteOn", "curtains", "ac"])
    el(key).addEventListener("click", () => store.set(key, !store.state[key]));
  document.querySelectorAll("[data-color]").forEach((b) =>
    b.addEventListener("click", () => {
      store.set("rgbColor", b.dataset.color);
      store.set("rgbMode", "static");
    }),
  );
  document
    .querySelectorAll("[data-temp]")
    .forEach((b) =>
      b.addEventListener("click", () => store.set("whiteTemp", b.dataset.temp)),
    );
  el("reset").addEventListener("click", () => {
    store.reset();
    notify("一切回到最初，继续慢慢待着。");
  });
  function panel(open) {
    el("controls").inert = !open;
    el("controls").setAttribute("aria-hidden", String(!open));
    el("controls").classList.toggle("closed", !open);
    el("open-panel").setAttribute("aria-expanded", String(open));
  }
  el("close-panel").onclick = () => {
    panel(false);
    el("open-panel").focus();
  };
  el("open-panel").onclick = () =>
    panel(el("controls").classList.contains("closed"));
  panel(false);
  el("fullscreen").onclick = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await el("experience").requestFullscreen();
    } catch {
      notify("此浏览器暂不支持全屏，仍可正常探索房间。");
    }
  };
  el("day-night").onclick = () => {
    store.set("day", !store.state.day);
    notify(
      store.state.day ? "日光轻轻落进房间" : "宁静的夜晚 · 留一盏温柔的灯",
    );
  };
  function sync(s) {
    el("day-night-label").textContent = s.day ? dayLabel : nightLabel;
    el("day-night").classList.toggle("is-day", s.day);
    el("day-night").setAttribute("aria-pressed", String(s.day));
    el("day-night").setAttribute(
      "aria-label",
      `切换到${s.day ? nightLabel : dayLabel}`,
    );
    el("day-night").title = `切换到${s.day ? nightLabel : dayLabel}`;
    for (const k of ["floorStyle", "rgbMode", "rgbColor", ...sliderKeys])
      el(k).value = s[k];
    for (const k of sliderKeys)
      el(k + "-value").textContent = Math.round(s[k] * 100) + "%";
    for (const k of ["whiteOn", "curtains", "ac"])
      el(k).setAttribute("aria-checked", String(s[k]));
    document.querySelectorAll("[data-temp]").forEach((b) => {
      b.classList.toggle("active", b.dataset.temp === s.whiteTemp);
      b.setAttribute("aria-pressed", String(b.dataset.temp === s.whiteTemp));
    });
    el("curtains-label").textContent = s.curtains ? "敞开" : "合上";
    el("ac-label").textContent = s.ac ? "26°C · 静音" : "已关闭";
    el("scene-label").textContent = s.day ? daySceneLabel : "宁静的夜晚";
    document
      .querySelectorAll("[data-color]")
      .forEach((b) =>
        b.classList.toggle("active", b.dataset.color === s.rgbColor),
      );
  }
  store.subscribe(sync);
  sync(store.state);
  const items = el("items-panel");
  function showItems(show) {
    items.hidden = !show;
    el("items-button").setAttribute("aria-expanded", String(show));
  }
  el("items-button").onclick = () => showItems(items.hidden);
  el("close-items").onclick = () => showItems(false);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      showItems(false);
      if (!el("controls").classList.contains("closed")) {
        panel(false);
        el("open-panel").focus();
      }
    }
  });
  const ambient = mountAmbientUI({ notify, store });
  return {
    bindScenes: ambient.bindScenes,
    notify,
    ready() {
      el("loading").classList.add("done");
      setTimeout(() => el("loading").remove(), 500);
    },
    bindItems(interactions) {
      interactions.registry.forEach((entry) => {
        const b = document.createElement("button");
        b.textContent = entry.name;
        b.title = entry.hint;
        b.onclick = () => interactions.activate(entry);
        el("items-list").append(b);
      });
    },
    bindHome(fn) {
      el("home-view").onclick = fn;
    },
    fail() {
      el("loading").innerHTML =
        "<p>房间暂时无法显示。请启用浏览器硬件加速，并使用支持 WebGL 2 的浏览器重新打开。</p>";
    },
  };
}
