import * as THREE from 'three';

export const panoramaIds = new Set([
  'uyghur','tibetan','brutalist','memphis','tropical','studio','classic','ruya',
  'renaissance','athens','palace','bauhaus','baroque','wabisabi','machiya','nordic',
  'dongfang','mediterranean','italian','bohemian','midcentury','french','industrial','artdeco',
]);

// Backgrounds fill the sky and both open sides without adding collision walls.
// Retain only the current texture on the GPU, and discard late async results.
export function createVRPanorama({ loader = new THREE.TextureLoader(), onError = () => {} } = {}) {
  let enabled = false;
  let generation = 0, target = null, texture = null, previous = null, currentId = null;
  function clear() {
    generation++;
    if (target && previous) {
      target.background = previous.background;
      target.backgroundIntensity = previous.intensity;
      target.backgroundBlurriness = previous.blur;
    }
    texture?.dispose();
    texture = null; target = null; previous = null; currentId = null;
  }
  function bind(scene, id) {
    clear();
    if (!panoramaIds.has(id)) return;
    target = scene; currentId = id;
    previous = { background: scene.background, intensity: scene.backgroundIntensity, blur: scene.backgroundBlurriness };
    if (enabled) load();
  }
  function load() {
    const scene = target, id = currentId;
    const request = generation;
    loader.load(`./images/panoramas/${id}.webp`, image => {
      if (request !== generation) { image.dispose(); return; }
      image.colorSpace = THREE.SRGBColorSpace;
      image.mapping = THREE.EquirectangularReflectionMapping;
      texture = image;
      scene.background = image;
      scene.backgroundBlurriness = 0;
    }, undefined, () => {
      if (request === generation) onError('全景背景暂未加载，请检查网络后关闭全景后重试');
    });
  }
  function setEnabled(value) {
    if (enabled === Boolean(value)) return;
    enabled = Boolean(value);
    const scene = target, id = currentId;
    if (scene) bind(scene, id);
  }
  return { bind, clear, setEnabled, dispose: clear,
    get enabled() { return enabled; },
    get currentId() { return currentId; },
    get ready() { return Boolean(texture); },
    update(dt, state) {
      if (!target || !texture) return;
      const weather = state.weather === 'rain' ? .72 : state.weather === 'snow' ? .88 : 1;
      const intensity = (state.day ? .85 : .24) * weather;
      target.backgroundIntensity = THREE.MathUtils.damp(target.backgroundIntensity, intensity, 2.5, dt);
    },
  };
}
