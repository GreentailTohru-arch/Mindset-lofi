import { posterMarkup } from "./poster-art.js";
import { brand } from "./brand.js";
import { emotionScenes, randomEmotion } from "./emotion-scenes.js";
import { startEmotionArt } from "./emotion-art.js";
import { enterSceneSmoothly } from "./scene-arrival.js";
import { mountSceneCloud } from "./scene-cloud.js";
import "./home.css";
import "../xr.css";
import { mountHomeVR } from "./home-xr.js";
import { createIcons, PersonStanding, Headphones } from "lucide";

const english = [
  "REFLECTIVE",
  "BALANCE",
  "HOPEFUL",
  "RESTLESS",
  "WANDERLUST",
  "SOLITUDE",
  "TENSE",
  "TIRED",
  "DREAMY",
  "PASSIONATE",
  "ROMANTIC",
  "OVERWHELMED",
  "HOMESICK",
  "EXPECTANT",
  "FOCUSED",
  "GROUNDED",
  "MOTIVATED",
  "NOSTALGIC",
  "HAPPY",
  "FREE",
  "REFRESHED",
  "SELF LOVE",
  "SLEEPY",
  "ENERGETIC",
];
export function mountHome() {
  document.title = "心境LOFI · 专注空间疗愈";
  document.querySelector("#app").innerHTML = `
    <main class="home-shell" data-view="home">
      <section id="home-intro" class="home-intro reference-home" aria-label="心境 LOFI 首页">
        <div class="reference-art">${posterMarkup()}</div>
        <div class="reference-entry">
          <button id="sense-mode" class="reference-choice"><span>脑电传感模式</span><small>EEG SENSING MODE</small><b aria-hidden="true">↗</b><em>模拟体验</em></button>
          <button id="home-vr-trigger" class="reference-choice"><span>虚拟现实模式</span><small>VIRTUAL REALITY MODE</small><b aria-hidden="true">↗</b></button>
          <button id="free-mode" class="reference-choice"><span>自由选择模式</span><small>FREE SELECTION MODE</small><b aria-hidden="true">↗</b></button>
        </div>
      </section>
      <section id="free-view" class="subview" hidden><div class="view-heading"><div><p class="overline">FOLLOW YOUR OWN RHYTHM</p><h2>此刻，想去哪里？</h2><p>选择一处意境，开启自己的专注时光。</p></div><button class="quiet-button" data-back>返回首页</button></div><div class="scene-grid">${emotionScenes.map((s, i) => `<a class="scene-choice" href="?scene=${s.id}"><span>${String(i + 1).padStart(2, "0")}</span><h3>${s.name}</h3><p>${s.emotion}</p><span class="scene-enter">进入空间 ↗</span></a>`).join("")}</div></section>
      <section id="wear-view" class="wear-view" hidden>
        <div class="sense-top"><span class="overline">01 / PREPARATION</span><button class="quiet-button" data-back>返回首页</button></div>
        <div class="wear-content"><span class="overline">在开始之前，先与自己连接</span><div class="wear-symbol" aria-hidden="true">◯</div><h2>请佩戴 ECG 脑波传感器</h2><p>调整至舒适的位置，放松肩膀，保持自然呼吸。<br>接下来的十秒，只需安静停留。</p><div class="wear-steps"><span><b>01</b> 佩戴设备</span><span><b>02</b> 调整坐姿</span><span><b>03</b> 静待回应</span></div><button id="wear-confirm" class="primary-button">我已准备好 · 开始模拟感应</button><p class="wear-disclaimer">当前为模拟体验，无需真实设备，未采集生理信号。</p></div>
      </section>
      <section id="sense-view" class="subview sense-view" hidden>
        <div class="sense-top"><span class="overline">EMOTIONAL RESONANCE / 情绪共振</span><button class="quiet-button" data-back>返回首页</button></div>
        <div class="sense-layout">
          <div class="emotion-caption"><p class="overline" id="sense-status">准备感应</p><h2 id="emotion-cn">此刻</h2><p id="emotion-en">YOUR INNER WORLD</p><div class="emotion-divider"></div><p id="emotion-copy">轻轻停留十秒，<br>让心情化作一幅流动的画。</p><span class="simulation-tag">随机心情 · 模拟体验</span></div>
          <div class="art-stage"><canvas id="emotion-art" aria-label="随心情变化的动态艺术图形"></canvas><div class="art-caption"><span id="art-name">情绪的形状</span><span>GENERATIVE ART</span></div></div>
          <aside class="sensor-data"><p class="overline">PARTICIPANT / 体验者</p><h3 id="participant">0001<span>#</span></h3><div class="data-label"><span>体验者变化</span><span>SIMULATED</span></div><canvas id="signal-art" aria-label="模拟情绪变化曲线"></canvas><div class="code-heading"><span>情绪数据流</span><span>DEMO ONLY</span></div><pre id="sense-code">session.ready = true;
source = "simulation";
emotion = "awaiting";
duration = 10s;</pre><p class="data-note">未连接传感器<br>心情与曲线均为随机模拟数据</p></aside>
        </div>
        <div class="sense-bottom"><div class="sense-progress"><div class="progress-label"><span id="progress-label" role="status" aria-live="polite">准备好，给自己十秒钟。</span><span id="sense-time">10 秒</span></div><progress id="sense-progress" value="0" max="10" aria-label="感应进度"></progress></div><button id="sense-start" class="primary-button">开始感应 · 10 秒</button></div>
        <div id="sense-result" class="sense-result" hidden aria-live="polite"><div><span class="overline">为这份心情，留一处风景 · 模拟推荐</span><h3 id="result-title"></h3><p id="result-copy"></p></div><a id="enter-result" class="primary-button">进入这处意境 ↗</a></div>
      </section>
    </main>`;
  const el = (id) => document.getElementById(id);
  const freeGrid = el("free-view").querySelector(".scene-grid");
  freeGrid.className = "scene-cloud-host";
  const sceneCloud = mountSceneCloud(freeGrid);
  el("wear-view").innerHTML =
    `<button class="installation-back quiet-button" data-back>返回 / BACK</button><div class="installation-guide"><div id="guide-icon"><img src="./images/person-enter-v2.gif" alt="走近心境房间示意动画"/></div><h2 id="guide-title">请走近，开启你的心境房间。</h2><p id="guide-english">Step closer. Enter your mood room.</p><button id="wear-confirm" class="installation-next">进入体验 / ENTER</button></div>`;
  el("sense-view").insertAdjacentHTML(
    "afterbegin",
    `<div id="detection-screen" class="detection-screen"><div id="detection-hands"><img src="./images/hands-breathing.gif" width="600" height="300" alt="双手缓缓呼吸的等待动画" /></div><h2>正在感受你的心境，请稍等…</h2><p>Sensing your mood. Please wait.</p></div><button id="installation-fullscreen" class="installation-fullscreen quiet-button">全屏 / FULLSCREEN</button><div id="arousal" hidden></div>`,
  );
  createIcons({ icons: { PersonStanding, Headphones } });
  document.querySelector(".emotion-caption").append(el("arousal"));
  let guideStage = 0,
    view = "home",
    homeVR = null;
  el("installation-fullscreen").onclick = async () => {
    try {
      if (!document.fullscreenElement)
        await document.documentElement.requestFullscreen();
      else await document.exitFullscreen();
    } catch {
      el("installation-fullscreen").textContent = "请使用浏览器全屏 / F11";
    }
  };
  let phase = "idle",
    selected = emotionScenes[0],
    started = 0,
    timer,
    arrivalTimer,
    tick = -1,
    participant = 0;
  const art = startEmotionArt(el("emotion-art"), el("signal-art"));
  function stop() {
    clearInterval(timer);
    clearTimeout(arrivalTimer);
    phase = "idle";
    art.active(false);
  }
  function show(nextView) {
    view = nextView;
    stop();
    document.querySelector(".home-shell").dataset.view = view;
    el("home-intro").hidden = view !== "home";
    el("free-view").hidden = view !== "free";
    if (view === "free") sceneCloud.refresh();
    else sceneCloud.hidePreview();
    el("sense-view").hidden = view !== "sense";
    el("wear-view").hidden = view !== "wear";
    if (view === "sense") {
      reset();
      art.active(true);
    }
    window.scrollTo(0, 0);
  }
  function reset() {
    el("arousal").hidden = true;
    el("sense-start").disabled = false;
    el("sense-start").textContent = "开始感应 · 10 秒";
    el("sense-result").hidden = true;
    el("sense-progress").value = 0;
    el("sense-time").textContent = "10 秒";
    el("sense-status").textContent = "准备感应";
    el("progress-label").textContent = "准备好，给自己十秒钟。";
    el("emotion-cn").textContent = "此刻";
    el("emotion-en").textContent = "YOUR INNER WORLD";
    el("emotion-copy").textContent = "轻轻停留十秒，让心情化作一幅流动的画。";
    el("sense-code").textContent =
      'session.ready = true;\nsource = "simulation";\nemotion = "awaiting";\nduration = 10s;';
    el("art-name").textContent = "情绪的形状";
  }
  function setEmotion(scene, elapsed) {
    selected = scene;
    const index = emotionScenes.indexOf(scene);
    el("emotion-cn").textContent = scene.emotion;
    el("emotion-en").textContent = english[index];
    el("emotion-copy").textContent = scene.description;
    el("art-name").textContent =
      `${String(index + 1).padStart(2, "0")} / ${scene.name}`;
    art.setEmotion(index);
    el("sense-code").textContent =
      `participant = "${String(participant).padStart(4, "0")}";\nsource = "simulation";\n\n// happy · calm · dreamy\nemotion = "${english[index].toLowerCase().replaceAll(" ", "_")}";\nfeeling = "${scene.emotion}";\nscene = "${scene.id}";\n\nelapsed = ${elapsed.toFixed(1)}s;\nstatus = "${phase === "done" ? "complete" : "sensing"}";`;
  }
  el("free-mode").onclick = () => {
    show("free");
    el("free-view").querySelector("a").focus({ preventScroll: true });
  };
  el("sense-mode").onclick = () => {
    guideStage = 0;
    el("guide-icon").innerHTML =
      '<img src="./images/person-enter-v2.gif" alt="走近心境房间示意动画"/>';
    createIcons({ icons: { PersonStanding } });
    el("guide-title").textContent = "请走近，开启你的心境房间。";
    el("guide-english").textContent = "Step closer. Enter your mood room.";
    el("wear-confirm").textContent = "进入体验 / ENTER";
    show("wear");
    el("wear-confirm").focus({ preventScroll: true });
  };
  el("wear-confirm").onclick = () => {
    if (guideStage === 0) {
      guideStage = 1;
      el("guide-icon").innerHTML =
        '<img src="./images/sensor-wear.gif" alt="佩戴传感器示意动画"/>';
      createIcons({ icons: { Headphones } });
      el("guide-title").textContent = "请佩戴 ECG 脑波传感器";
      el("guide-english").textContent =
        "Settle in. Breathe naturally. Stay still for ten seconds.";
      el("wear-confirm").textContent = "准备好了 / BEGIN SIMULATION";
      return;
    }
    if (guideStage === 1 && homeVR?.active) {
      guideStage = 2;
      el("guide-icon").innerHTML =
        '<img src="./images/vr-put-on-white-transparent.gif" alt="佩戴 VR 设备示意动画"/>';
      el("guide-title").textContent = "请佩戴 VR 设备";
      el("guide-english").textContent =
        "Put on your VR headset. Settle in comfortably.";
      el("wear-confirm").textContent = "已佩戴，开始感应 / BEGIN SIMULATION";
      return;
    }
    show("sense");
    el("sense-start").click();
  };
  document.querySelectorAll("[data-back]").forEach(
    (button) =>
      (button.onclick = () => {
        show("home");
        el("sense-mode").focus({ preventScroll: true });
      }),
  );
  el("sense-start").onclick = () => {
    reset();
    phase = "sensing";
    el("sense-view").dataset.phase = "detecting";
    el("detection-screen").hidden = false;
    el("detection-hands").style.opacity = "1";
    tick = -1;
    participant++;
    el("participant").innerHTML =
      `${String(participant).padStart(4, "0")}<span>#</span>`;
    el("sense-start").disabled = true;
    el("sense-start").textContent = "正在感应…";
    el("sense-status").textContent = "感应中 · 模拟";
    el("progress-label").textContent = "不必做什么，让这一刻慢慢流动。";
    started = performance.now();
    selected = randomEmotion(selected.id);
    const update = () => {
      const elapsed = Math.min(10, (performance.now() - started) / 1000);
      el("sense-progress").value = elapsed;

      el("sense-time").textContent = `${(10 - elapsed).toFixed(1)} 秒`;
      if (Math.floor(elapsed / 2) !== tick && elapsed < 10) {
        tick = Math.floor(elapsed / 2);
        setEmotion(selected, elapsed);
      }
      if (elapsed >= 10) {
        clearInterval(timer);
        phase = "done";
        el("detection-screen").hidden = true;
        el("sense-view").dataset.phase = "result";
        el("arousal").hidden = false;
        el("arousal").innerHTML =
          `<span>情绪唤醒值 · 模拟<br>EMOTIONAL AROUSAL</span><strong>${Math.floor(25 + Math.random() * 51)}</strong>`;
        setEmotion(selected, 10);
        el("sense-code").textContent =
          `emotion = "${english[emotionScenes.indexOf(selected)].toLowerCase().replaceAll(" ", "_")}";\nsource = "simulation";`;
        el("sense-status").textContent = "感应完成 · 模拟结果";
        el("progress-label").textContent = "此刻的心境，已有回应。";
        el("sense-start").disabled = true;
        el("sense-start").textContent = "正在为你打开意境";
        el("result-title").textContent =
          `${selected.emotion} · ${selected.name}`;
        el("result-copy").textContent = selected.description;
        el("enter-result").href = `?scene=${selected.id}`;
        el("sense-result").hidden = false;
        el("enter-result").textContent = "即将自动进入…";
        el("enter-result").removeAttribute("href");
        arrivalTimer = setTimeout(() => {
          if (homeVR?.active) {
            homeVR.openRoom(selected.id);
            return;
          }
          homeVR?.dispose();
          art.dispose();
          phase = "entering";
          document
            .querySelectorAll("[data-back]")
            .forEach((button) => (button.disabled = true));
          enterSceneSmoothly(selected.id);
        }, 10000);
      }
    };
    update();
    timer = setInterval(update, 80);
  };
  document.addEventListener("keydown", (e) => {
    if (
      e.key === "Escape" &&
      !homeVR?.active &&
      phase !== "entering" &&
      el("home-intro")
    )
      show("home");
  });
  window.addEventListener("pagehide", () => {
    stop();
    art.dispose();
    homeVR?.dispose();
  });
  homeVR = mountHomeVR({
    read: () => ({
      view,
      guideStage,
      phase,
      selected,
      guideImage: el("guide-icon").querySelector("img"),
      handsImage: el("detection-hands").querySelector("img"),
      artCanvas: el("emotion-art"),
    }),
    actions: {
      home: () => show("home"),
      free: () => el("free-mode").click(),
      sense: () => el("sense-mode").click(),
      next: () => el("wear-confirm").click(),
      pause: stop,
    },
  });
  el("home-vr-trigger").onclick = () => el("vr-entry").click();
  window.addEventListener("pageshow", (event) => {
    if (event.persisted && el("sense-view") && !el("sense-view").hidden) {
      reset();
      art.active(true);
    }
  });
}
