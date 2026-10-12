import { moodOrder, moodGroups } from "./mood-config.js";
import "./mood-drawer.css";

const navigationKey = "stillroom.mood.navigation";
const viewKey = "stillroom.mood.view";
const svg = (paths) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
const drop = svg(
  '<path d="M12 3c-1.8 3.1-6 6.9-6 11a6 6 0 0 0 12 0c0-4.1-4.2-7.9-6-11Z"/><path d="M9 14a3 3 0 0 0 3 3"/>',
);
const close = svg('<path d="m7 7 10 10M17 7 7 17"/>');
const arrow = svg('<path d="m9 5 7 7-7 7"/>');
const down = svg('<path d="m6 9 6 6 6-6"/>');

export function mountMoodDrawer({ layer, active, presets, navigate, onOpen }) {
  const el = (id) => document.getElementById(id);
  let open = false;
  let mode = "flow";
  let resume = null;
  try {
    mode = sessionStorage.getItem(viewKey) === "groups" ? "groups" : "flow";
    const pending = JSON.parse(sessionStorage.getItem(navigationKey) || "null");
    sessionStorage.removeItem(navigationKey);
    if (pending?.target === active) resume = pending;
  } catch {
    /* The guide also works with browser storage disabled. */
  }
  // History entries carry their own view state, including when BFCache is unavailable.
  if (!resume && history.state?.stillroomMood)
    resume = history.state.stillroomMood;
  function rememberView() {
    try {
      history.replaceState(
        { ...history.state, stillroomMood: { open, mode } },
        "",
      );
    } catch {
      /* View-state persistence is optional. */
    }
  }
  layer.insertAdjacentHTML(
    "beforeend",
    `
    <button id="mood-toggle" class="mood-toggle glass" aria-label="心境 · 全场景导览" aria-expanded="false" aria-controls="mood-drawer"><span class="mood-drop">${drop}</span><span>心境</span></button>
    <div id="mood-backdrop" class="mood-backdrop" aria-hidden="true"></div>
    <aside id="mood-drawer" class="mood-drawer glass" aria-labelledby="mood-title" aria-hidden="true" inert>
      <header class="mood-heading"><div><span class="mood-eyebrow">A WORLD WITHIN</span><h2 id="mood-title">心境<span>二十四处，随心而往。</span></h2></div><button id="mood-close" class="icon-button" aria-label="关闭心境导览">${close}</button></header>
      <div class="mood-tabs" role="tablist" aria-label="导览视图">
        <button id="mood-tab-flow" role="tab" aria-selected="true" aria-controls="mood-flow" data-mode="flow"><span>流转</span><small>循序而行</small></button>
        <button id="mood-tab-groups" role="tab" aria-selected="false" aria-controls="mood-groups" data-mode="groups" tabindex="-1"><span>万象</span><small>随心而寻</small></button>
      </div>
      <div class="mood-views">
        <section id="mood-flow" class="mood-view" role="tabpanel" aria-labelledby="mood-tab-flow"><p class="mood-view-caption">从东方意境，走向未来日常。<span>24 SCENES</span></p><ol class="mood-timeline"></ol></section>
        <section id="mood-groups" class="mood-view" role="tabpanel" aria-labelledby="mood-tab-groups" inert aria-hidden="true"><p class="mood-view-caption">不必按顺序，只需跟随此刻的心。</p><div class="mood-accordions"></div></section>
      </div>
      <footer class="mood-footer"><span class="mood-current-dot"></span><span>此刻停留</span><strong id="mood-current"></strong></footer>
    </aside>`,
  );
  const drawer = el("mood-drawer");
  const toggle = el("mood-toggle");
  const tabs = [...drawer.querySelectorAll('[role="tab"]')];
  const groupPanels = [];

  function linkFor(id, className) {
    const link = document.createElement("a");
    link.className = className;
    link.dataset.scene = id;
    const url = new URL(location.href);
    url.searchParams.set("scene", id);
    link.href = url.href;
    if (id === active) link.setAttribute("aria-current", "page");
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
      if (id === active) return;
      navigate(link.href);
    });
    return link;
  }

  const timeline = drawer.querySelector(".mood-timeline");
  moodOrder.forEach((id, index) => {
    const item = document.createElement("li");
    const link = linkFor(id, "mood-scene-link");
    const number = document.createElement("span");
    number.className = "mood-scene-number";
    number.textContent = String(index + 1).padStart(2, "0");
    const name = document.createElement("span");
    name.className = "mood-scene-name";
    name.textContent = presets[id].label;
    const state = document.createElement("span");
    state.className = "mood-scene-state";
    state.innerHTML = id === active ? "此刻" : arrow;
    state.setAttribute("aria-hidden", "true");
    link.append(number, name, state);
    item.append(link);
    timeline.append(item);
  });

  function setGroup(index, expanded) {
    const { section, button, region, content } = groupPanels[index];
    section.classList.toggle("is-expanded", expanded);
    button.setAttribute("aria-expanded", String(expanded));
    region.setAttribute("aria-hidden", String(!expanded));
    content.inert = !expanded;
  }
  moodGroups.forEach((group, index) => {
    const section = document.createElement("section");
    section.className = "mood-group";
    section.innerHTML = `<h3><button id="mood-group-${index}" aria-expanded="false" aria-controls="mood-group-content-${index}"><span class="mood-group-index">0${index + 1}</span><span class="mood-group-name">${group.name}<small>${group.caption}</small></span><span class="mood-group-count">${group.scenes.length}</span>${down}</button></h3><div id="mood-group-content-${index}" class="mood-group-region" role="region" aria-labelledby="mood-group-${index}" aria-hidden="true"><div class="mood-group-clip"><div class="mood-tags" inert></div></div></div>`;
    const button = section.querySelector("button");
    const region = section.querySelector(".mood-group-region");
    const content = section.querySelector(".mood-tags");
    group.scenes.forEach((id) => {
      const link = linkFor(id, "mood-tag");
      const dot = document.createElement("span");
      dot.className = "mood-tag-dot";
      dot.setAttribute("aria-hidden", "true");
      link.append(dot, document.createTextNode(presets[id].label));
      content.append(link);
    });
    drawer.querySelector(".mood-accordions").append(section);
    groupPanels.push({ section, button, region, content });
    button.onclick = () =>
      setGroup(index, button.getAttribute("aria-expanded") !== "true");
    setGroup(index, group.scenes.includes(active));
  });
  el("mood-current").textContent = presets[active].label;

  function locateActive() {
    const panel = el(`mood-${mode}`);
    const current = panel.querySelector('[aria-current="page"]');
    if (!current) return;
    if (mode === "groups")
      setGroup(
        moodGroups.findIndex((group) => group.scenes.includes(active)),
        true,
      );
    // Scroll only the view, without moving keyboard focus or the page itself.
    requestAnimationFrame(() => {
      panel.scrollTop = Math.max(
        0,
        current.getBoundingClientRect().top -
          panel.getBoundingClientRect().top +
          panel.scrollTop -
          panel.clientHeight / 2 +
          current.clientHeight / 2,
      );
    });
  }

  function setMode(next, focus = false) {
    mode = next;
    drawer.dataset.mode = mode;
    tabs.forEach((tab) => {
      const selected = tab.dataset.mode === mode;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
      const panel = el(`mood-${tab.dataset.mode}`);
      panel.classList.toggle("is-active", selected);
      panel.inert = !selected;
      panel.setAttribute("aria-hidden", String(!selected));
      if (focus && selected) tab.focus({ preventScroll: true });
    });
    try {
      sessionStorage.setItem(viewKey, mode);
    } catch {
      /* Optional preference. */
    }
    if (open) locateActive();
    rememberView();
  }
  tabs.forEach((tab) => {
    tab.onclick = () => setMode(tab.dataset.mode);
    tab.onkeydown = (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key))
        return;
      event.preventDefault();
      setMode(
        event.key === "Home"
          ? "flow"
          : event.key === "End"
            ? "groups"
            : mode === "flow"
              ? "groups"
              : "flow",
        true,
      );
    };
  });

  function setOpen(next, focus = false) {
    open = next;
    if (open) onOpen();
    if (!open && drawer.contains(document.activeElement))
      toggle.focus({ preventScroll: true });
    layer.classList.toggle("mood-open", open);
    drawer.inert = !open;
    drawer.setAttribute("aria-hidden", String(!open));
    toggle.setAttribute("aria-expanded", String(open));
    if (open) {
      locateActive();
      if (focus)
        tabs
          .find((tab) => tab.dataset.mode === mode)
          .focus({ preventScroll: true });
    } else if (focus) toggle.focus({ preventScroll: true });
    rememberView();
  }
  toggle.onclick = (event) => setOpen(!open, event.detail === 0);
  el("mood-close").onclick = () => setOpen(false, true);
  el("mood-backdrop").onpointerdown = () => setOpen(false);
  // Keep scene arrows and Zen accessible while the non-modal guide is open.
  document.addEventListener("pointerdown", (event) => {
    if (!open || drawer.contains(event.target) || toggle.contains(event.target))
      return;
    if (event.target.closest(".scene-arrow, #zen-toggle")) return;
    setOpen(false);
  });
  setMode(["flow", "groups"].includes(resume?.mode) ? resume.mode : mode);
  setOpen(
    Boolean(resume?.open) && document.documentElement.dataset.clean !== "true",
  );
  // Layout inside a restored accordion may still be animating. Locate once settled.
  drawer.addEventListener("transitionend", (event) => {
    if (open && event.target === drawer && event.propertyName === "transform")
      locateActive();
  });

  return {
    get open() {
      return open;
    },
    close({ focus = false } = {}) {
      setOpen(false, focus);
    },
    beforeNavigate(href) {
      try {
        sessionStorage.setItem(
          navigationKey,
          JSON.stringify({
            target: new URL(href).searchParams.get("scene"),
            open,
            mode,
          }),
        );
      } catch {
        /* Navigation still works without session storage. */
      }
    },
    restore() {
      if (open) locateActive();
    },
  };
}
