import { posterAssets } from "./poster-art.js";
import { brand } from "./brand.js";
import { sceneStories } from "./scene-stories.js";
import { createAmbientAudio } from "./audio.js";
import { moodOrder } from "./mood-config.js";
import { mountMoodDrawer } from "./mood-drawer.js";

const glyph = (paths) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
const chevron = (direction) =>
  glyph(`<path d="${direction < 0 ? "m14 6-6 6 6 6" : "m10 6 6 6-6 6"}"/>`);
const eye = glyph(
  '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
);

export function mountAmbientUI({ notify, store }) {
  // History restores and interrupted navigation may skip a native transition.
  // Handle that transition's rejected readiness promise without blocking navigation.
  for (const name of ["pageswap", "pagereveal"]) {
    window.addEventListener(name, (event) => {
      event.viewTransition?.ready.catch((error) => {
        if (!["AbortError", "InvalidStateError"].includes(error.name))
          console.error(error);
      });
    });
  }
  const el = (id) => document.getElementById(id);
  const root = document.documentElement;
  const experience = el("experience");
  let mood;
  const layer = document.createElement("div");
  layer.id = "ui-layer";
  for (const child of [...experience.children]) {
    if (!["viewport", "loading"].includes(child.id)) layer.append(child);
  }
  experience.append(layer);
  layer.querySelector(".brand").remove();
  layer.querySelector(".interaction-guide").remove();
  el("clock-date").remove();
  layer.insertAdjacentHTML(
    "afterbegin",
    `
    <header class="greeting scene-identity">
      <a class="identity-lockup" href="./" aria-label="返回心境LOFI首页"><img src="${posterAssets.posterLockup}" alt="心境 · The Mindset of Low Fidelity"/></a>
    </header>
    <nav class="scene-navigation" aria-label="场景导览">
      <a id="previous-scene" class="scene-arrow scene-arrow-left" aria-label="上一个场景">${chevron(-1)}<span class="nav-caption">上一处</span></a>
      <a id="next-scene" class="scene-arrow scene-arrow-right" aria-label="下一个场景">${chevron(1)}<span class="nav-caption">下一处</span></a>
    </nav>
    <section class="scene-info" aria-label="当前场景">
      <div class="scene-heading"><span id="scene-position"></span><h1 id="scene-title"></h1><p>此刻，在这里。</p></div>
      <article class="scene-card glass" id="scene-card">
        <button id="scene-peek" class="scene-peek" aria-expanded="false" aria-controls="scene-details"><span class="handle-line"></span><span>场景简述</span><span class="peek-hint">向上探索</span></button>
        <div id="scene-details" class="scene-details" inert aria-hidden="true"><div id="scene-intro"></div><p id="scene-story"></p><h2>设计意境</h2><p id="scene-design"></p></div>
      </article>
    </section>
    <nav class="global-controls" aria-label="全局控制">
      <button id="audio-toggle" class="glass control-button" aria-label="播放背景音乐" title="播放背景音乐 · 轻柔和弦" aria-pressed="false"><span class="audio-wave" aria-hidden="true"><i></i><i></i><i></i><i></i></span></button>
      <button id="zen-toggle" class="glass control-button" aria-label="开启沉浸模式" aria-pressed="false" title="沉浸模式 · 再次点击恢复信息">${eye}</button>
    </nav>`,
  );

  const settings = el("open-panel");
  settings.className = "glass control-button";
  settings.title = "设置";
  settings.setAttribute("aria-label", "设置");
  settings.setAttribute("aria-controls", "controls");
  const dayNight = el("day-night");
  dayNight.className = "glass control-button";
  el("day-night-label").className = "sr-only";
  layer.querySelector(".global-controls").prepend(settings, dayNight);
  const weatherIcons = {
    clear: glyph(
      '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
    ),
    rain: glyph(
      '<path d="M6 14a4 4 0 0 1 0-8 6 6 0 0 1 11-1 4.5 4.5 0 0 1 1 9M8 17l-1 3m6-3-1 3m6-3-1 3"/>',
    ),
    snow: glyph(
      '<path d="M12 2v20M3.3 7l17.4 10M3.3 17 20.7 7M9 4l3 3 3-3M9 20l3-3 3 3M4 10l4-1-1-4M20 14l-4 1 1 4M4 14l4 1-1 4M20 10l-4-1 1-4"/>',
    ),
  };
  const weatherNames = { clear: "晴天", rain: "下雨", snow: "下雪" };
  const weatherButton = document.createElement("button");
  weatherButton.id = "weather-toggle";
  weatherButton.className = "glass control-button";
  dayNight.after(weatherButton);
  const updateWeather = () => {
    const mode = store.state.weather;
    const next = { clear: "rain", rain: "snow", snow: "clear" }[mode];
    weatherButton.innerHTML = weatherIcons[mode];
    weatherButton.title = `天气：${weatherNames[mode]} · 点击切换${weatherNames[next]}`;
    weatherButton.setAttribute("aria-label", weatherButton.title);
    weatherButton.dataset.weather = mode;
  };
  weatherButton.onclick = () => {
    store.set(
      "weather",
      { clear: "rain", rain: "snow", snow: "clear" }[store.state.weather],
    );
    notify(`天气 · ${weatherNames[store.state.weather]}`);
  };
  store.subscribe((_, key) => {
    if (key === "weather" || key === "reset") updateWeather();
  });
  updateWeather();
  layer.querySelector(".dock .presets").remove();
  const panelBody = el("controls").querySelector(".panel-body");
  panelBody.prepend(layer.querySelector(".dock"));
  el("controls").querySelector(".panel-heading h1").textContent = "设置与氛围";
  panelBody.append(layer.querySelector(".scene-tag"));
  el("scene-intro").append(layer.querySelector(".bottom-left"));

  // To-dos are plain text, persisted locally and never injected as HTML.
  const clock = layer.querySelector(".room-clock");
  clock.insertAdjacentHTML(
    "beforeend",
    `
    <button id="todo-toggle" class="todo-handle" aria-label="展开待办清单" aria-expanded="false" aria-controls="todo-panel" title="待办清单"><span class="handle-line"></span></button>
    <section id="todo-panel" class="todo-panel glass" aria-label="待办清单" inert aria-hidden="true">
      <header><div><span class="micro-label">ONE THING AT A TIME</span><h2>慢慢来，一件一件。</h2></div><span id="todo-count" aria-live="polite">0 / 0</span></header>
      <form id="todo-form"><label class="sr-only" for="todo-input">添加待办</label><input id="todo-input" maxlength="120" placeholder="留一件想做的小事…" autocomplete="off" required/><button type="submit" aria-label="添加待办" title="添加待办">+</button></form>
      <ul id="todo-list"></ul><p id="todo-empty">清空思绪，让此刻轻一点。</p><footer>只保存在此设备 · 不必急于完成</footer>
    </section>`,
  );
  let todoOpen = false;
  const setTodo = (open) => {
    todoOpen = open;
    el("todo-toggle").setAttribute("aria-expanded", String(open));
    el("todo-toggle").setAttribute(
      "aria-label",
      open ? "收起待办清单" : "展开待办清单",
    );
    el("todo-panel").classList.toggle("is-open", open);
    el("todo-panel").inert = !open;
    el("todo-panel").setAttribute("aria-hidden", String(!open));
  };
  el("todo-toggle").onclick = () => setTodo(!todoOpen);
  document.addEventListener("pointerdown", (event) => {
    if (todoOpen && !clock.contains(event.target)) setTodo(false);
  });
  let todos = [];
  try {
    const saved = JSON.parse(
      localStorage.getItem("stillroom.todos.v1") || "[]",
    );
    if (Array.isArray(saved))
      todos = saved
        .filter(
          (item) =>
            item &&
            typeof item.text === "string" &&
            typeof item.done === "boolean",
        )
        .slice(0, 100)
        .map((item) => ({ text: item.text.slice(0, 120), done: item.done }));
  } catch {
    /* Private browsing and unavailable storage still allow session use. */
  }
  function saveTodos() {
    try {
      localStorage.setItem("stillroom.todos.v1", JSON.stringify(todos));
    } catch {
      notify("此浏览器无法保存待办，清单会在本次浏览中保留。");
    }
  }
  function updateTodoCount() {
    el("todo-count").textContent =
      `${todos.filter((item) => item.done).length} / ${todos.length}`;
    el("todo-empty").hidden = todos.length > 0;
  }
  function renderTodos() {
    el("todo-list").replaceChildren();
    todos.forEach((item, index) => {
      const row = document.createElement("li");
      row.classList.toggle("completed", item.done);
      const label = document.createElement("label");
      const check = document.createElement("input");
      check.type = "checkbox";
      check.checked = item.done;
      const text = document.createElement("span");
      text.textContent = item.text;
      check.onchange = () => {
        item.done = check.checked;
        row.classList.toggle("completed", item.done);
        saveTodos();
        updateTodoCount();
      };
      const remove = document.createElement("button");
      remove.textContent = "×";
      remove.setAttribute("aria-label", `删除待办：${item.text}`);
      remove.onclick = () => {
        todos.splice(index, 1);
        saveTodos();
        renderTodos();
        (
          el("todo-list").children[index]?.querySelector("button") ||
          el("todo-input")
        ).focus();
      };
      label.append(check, text);
      row.append(label, remove);
      el("todo-list").append(row);
    });
    updateTodoCount();
  }
  renderTodos();
  el("todo-form").onsubmit = (event) => {
    event.preventDefault();
    const text = el("todo-input").value.trim();
    if (!text) return;
    if (todos.length >= 100) {
      notify("先完成一些小事，再添加新的待办吧。");
      return;
    }
    todos.push({ text, done: false });
    el("todo-input").value = "";
    saveTodos();
    renderTodos();
  };

  const info = layer.querySelector(".scene-info");
  const card = el("scene-card");
  let expanded = false;
  const expand = (open) => {
    expanded = open;
    info.classList.toggle("is-expanded", open);
    el("scene-peek").setAttribute("aria-expanded", String(open));
    el("scene-details").inert = !open;
    el("scene-details").setAttribute("aria-hidden", String(!open));
  };
  card.addEventListener("pointerenter", (e) => {
    if (e.pointerType === "mouse") expand(true);
  });
  info.addEventListener("pointerleave", (e) => {
    if (e.pointerType === "mouse") expand(false);
  });
  el("scene-peek").onclick = () => expand(!expanded);
  card.addEventListener("focusout", (e) => {
    if (!card.contains(e.relatedTarget)) expand(false);
  });
  card.addEventListener(
    "wheel",
    (e) => {
      if (e.deltaY < 0 && !expanded) {
        e.preventDefault();
        expand(true);
      }
    },
    { passive: false },
  );
  let touchStart = null;
  card.addEventListener(
    "touchstart",
    (e) => {
      touchStart = e.touches[0].clientY;
    },
    { passive: true },
  );
  card.addEventListener(
    "touchend",
    (e) => {
      if (touchStart !== null && touchStart - e.changedTouches[0].clientY > 24)
        expand(true);
      touchStart = null;
    },
    { passive: true },
  );
  document.addEventListener("pointerdown", (e) => {
    if (expanded && !info.contains(e.target)) expand(false);
  });

  let audioBusy = false;
  const audio = createAmbientAudio((playing) => {
    el("audio-toggle").setAttribute("aria-pressed", String(playing));
    el("audio-toggle").setAttribute(
      "aria-label",
      playing ? "静音背景音乐" : "播放背景音乐",
    );
    el("audio-toggle").title = playing
      ? "静音背景音乐"
      : "播放背景音乐 · 轻柔和弦";
  });
  el("audio-toggle").onclick = async () => {
    if (audioBusy) return;
    audioBusy = true;
    try {
      await audio.toggle();
    } catch {
      notify("音乐暂时无法播放，请再次点击重试。");
    } finally {
      audioBusy = false;
    }
  };
  window.addEventListener("pagehide", (event) => {
    if (!event.persisted) audio.dispose();
  });

  let zen = root.dataset.clean === "true";
  layer.inert = false;
  const updateZenButton = () => {
    el("zen-toggle").setAttribute("aria-pressed", String(zen));
    el("zen-toggle").setAttribute("aria-label", zen ? "关闭沉浸模式" : "开启沉浸模式");
  };
  updateZenButton();
  const restoreUI = () => {
    if (!zen) return;
    zen = false;
    root.dataset.clean = "false";
    layer.inert = false;
    layer.removeAttribute("aria-hidden");
    updateZenButton();
    const url = new URL(location.href);
    url.searchParams.delete("clean");
    history.replaceState(null, "", url);
    for (const link of layer.querySelectorAll("a[href]")) {
      const destination = new URL(link.href);
      destination.searchParams.delete("clean");
      link.href = destination.href;
    }
  };
  el("zen-toggle").onclick = () => {
    if (zen) { restoreUI(); return; }
    mood?.close();
    setTodo(false);
    expand(false);
    zen = true;
    root.dataset.clean = "true";
    updateZenButton();
  };
  document.addEventListener(
    "keydown",
    (event) => {
      if (zen) {
        if (event.key === "Escape") {
          event.preventDefault();
          event.stopImmediatePropagation();
          restoreUI();
          el("zen-toggle").focus();
        }
        return;
      }
      if (event.key === "Escape") {
        if (mood?.open) {
          mood.close({ focus: true });
          event.preventDefault();
          event.stopImmediatePropagation();
          return;
        }
        if (todoOpen) {
          setTodo(false);
          el("todo-toggle").focus();
        }
        if (expanded) {
          expand(false);
          el("scene-peek").focus();
        }
      }
    },
    true,
  );

  return {
    bindScenes(active, presets) {
      const ids = moodOrder;
      const index = ids.indexOf(active);
      el("scene-title").textContent = presets[active].label;
      el("scene-position").textContent =
        `MINDSET / ${String(index + 1).padStart(2, "0")} — ${String(ids.length).padStart(2, "0")}`;
      const [story, design] = sceneStories[active];
      el("scene-story").textContent = story;
      el("scene-design").textContent = design;
      document.title = `${presets[active].label} · 心境 LOFI`;
      for (const [id, direction] of [
        ["previous-scene", -1],
        ["next-scene", 1],
      ]) {
        const target = ids[(index + direction + ids.length) % ids.length];
        const link = el(id);
        const url = new URL(location.href);
        url.searchParams.set("scene", target);
        link.href = url.href;
        link.title = `${direction < 0 ? "上一处" : "下一处"} · ${presets[target].label}`;
        link.setAttribute(
          "aria-label",
          `${direction < 0 ? "上一个" : "下一个"}场景：${presets[target].label}`,
        );
      }
      let navigating = false;
      function navigate(href) {
        if (navigating) return;
        navigating = true;
        mood?.beforeNavigate(href);
        // Native cross-document transitions preserve the old scene until ready.
        if ("onpagereveal" in window) {
          location.assign(href);
        } else {
          experience.classList.add("scene-leaving");
          window.setTimeout(
            () => location.assign(href),
            matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 280,
          );
        }
      }
      mood = mountMoodDrawer({
        layer,
        active,
        presets,
        navigate,
        onOpen() {
          setTodo(false);
          expand(false);
        },
      });
      layer.querySelectorAll(".scene-arrow").forEach((link) =>
        link.addEventListener("click", (event) => {
          if (
            event.button ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey
          )
            return;
          event.preventDefault();
          navigate(link.href);
        }),
      );
      window.addEventListener("pageshow", () => {
        navigating = false;
        experience.classList.remove("scene-leaving");
        mood.restore();
      });
    },
  };
}
