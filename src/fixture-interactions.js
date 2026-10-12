import * as THREE from "three";

// Bind existing fixture materials to their physical interaction object.
// Shared legacy bedLamp/floorLamp keys remain global controls only.
export function bindFixtureInteractions(lighting, registry, store) {
  const fixtures = lighting.fixtures ?? [];
  const isOn = (f) => f.manualOn ?? (store.state.whiteOn && store.state.whiteBrightness > 0 &&
    (f.enabled ? f.enabled(store.state) : !f.key || store.state[f.key]));
  const bindings = [];
  for (const entry of registry) {
    if (!/灯|烛|暖光|lantern|lamp/i.test(entry.name)) continue;
    const materials = new Set(), objects = new Set();
    entry.object.traverse((object) => {
      objects.add(object);
      for (const material of [object.material].flat()) if (material) materials.add(material);
    });
    const owned = fixtures.filter(f =>
      (f.shade && materials.has(f.shade)) ||
      (f.flames?.some(flame => objects.has(flame))) ||
      (f.light && objects.has(f.light)));
    if (!owned.length || !owned.some(f => ["bedLamp", "floorLamp", "whiteOn"].includes(f.key))) continue;
    entry.action = () => {
      const on = !owned.some(isOn);
      // Preserve every other lamp before waking the room's white-light master.
      for (const fixture of fixtures) fixture.manualOn = Boolean(isOn(fixture));
      if (on) store.wakeFixture();
      for (const fixture of owned) fixture.manualOn = on;
      return `${entry.name} · ${on ? "亮起" : "熄灭"}`;
    };
    bindings.push({ entry, fixtures: owned });
  }
  // Some legacy scenes expose candle shades and their point lights separately.
  // Associate those emitters spatially with the nearest physical candle fixture.
  for (const fixture of fixtures.filter(f => f.light && !f.shade && !f.flames)) {
    if (bindings.some(b => b.fixtures.includes(fixture))) continue;
    let closest = null, distance = 1.5;
    const position = fixture.light.getWorldPosition(new THREE.Vector3());
    for (const binding of bindings) {
      if (!binding.fixtures.some(f => f.key === fixture.key)) continue;
      const bounds = new THREE.Box3().setFromObject(binding.entry.object);
      const d = bounds.distanceToPoint(position);
      if (d < distance) { closest = binding; distance = d; }
    }
    if (closest) closest.fixtures.push(fixture);
  }
  let previousDay = store.state.day;
  const unsubscribe = store.subscribe((state, key) => {
    if ((key === "day" && state.day !== previousDay) ||
      ["whiteOn", "reset", "bedLamp", "floorLamp"].includes(key) ||
      (key === "whiteBrightness" && (state.whiteBrightness === 0 || !state.whiteOn))) {
      for (const fixture of fixtures) delete fixture.manualOn;
    }
    previousDay = state.day;
  });
  return { bindings, dispose: unsubscribe };
}
