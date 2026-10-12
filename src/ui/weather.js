import * as THREE from "three";

export const WEATHER_GROUND = -0.35;
export function outsideRoom(x, z) { return Math.abs(x) > 5.4 || Math.abs(z) > 5.4; }
export function makeWeatherParticle(random = Math.random) {
  let x, z;
  do { x = (random() - 0.5) * 38; z = (random() - 0.5) * 38; } while (!outsideRoom(x, z));
  return { x, z, y: WEATHER_GROUND + random() * 13, size: 0.7 + random() * 1.5, phase: random() * Math.PI * 2 };
}

// Project a separate outdoor volume through the room camera. No room assets change.
export function mountWeather(container, camera, store) {
  const canvas = document.createElement("canvas");
  canvas.className = "scene-weather";
  canvas.setAttribute("aria-hidden", "true");
  container.insertBefore(canvas, container.querySelector("canvas:not(.scene-reflection)"));
  const ctx = canvas.getContext("2d"), point = new THREE.Vector3();
  const particles = Array.from({ length: 380 }, () => makeWeatherParticle());
  const landings = [];
  let opacity = 0;
  const project = (x, y, z) => {
    point.set(x, y, z).project(camera);
    return { x: (point.x + 1) * canvas.width / 2, y: (1 - point.y) * canvas.height / 2, visible: point.z > -1 && point.z < 1 };
  };
  const planeRing = (x, z, radius, alpha, snow) => {
    ctx.beginPath();
    for (let i = 0; i <= 16; i++) {
      const angle = i / 16 * Math.PI * 2;
      const p = project(x + Math.cos(angle) * radius, WEATHER_GROUND, z + Math.sin(angle) * radius);
      if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
    }
    ctx.globalAlpha = alpha * opacity;
    if (snow) ctx.fill(); else ctx.stroke();
  };
  return {
    update(dt, time, reduceMotion) {
      const w = container.clientWidth, h = container.clientHeight;
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      ctx.clearRect(0, 0, w, h);
      const mode = store.state.weather, active = mode !== "clear";
      opacity += ((active ? 1 : 0) - opacity) * (1 - Math.exp(-dt * 5));
      if (opacity < 0.001) { landings.length = 0; return; }
      const snow = mode === "snow";
      ctx.strokeStyle = store.state.day ? "#d5e5f2" : "#a7c8e3";
      ctx.fillStyle = "#edf3fa";
      ctx.lineWidth = 0.8;
      const speed = reduceMotion ? 0.25 : 1;
      for (const p of particles) {
        p.y -= dt * (snow ? 0.8 + p.size * 0.3 : 12 + p.size * 2) * speed;
        if (p.y < WEATHER_GROUND) {
          landings.push({ x: p.x, z: p.z, age: 0, snow });
          Object.assign(p, makeWeatherParticle(), { y: WEATHER_GROUND + 13 });
        }
        // Snow sways without ever crossing into the room footprint.
        const sway = snow ? Math.sin(time * 0.7 + p.phase) * 0.3 : 0;
        const x = outsideRoom(p.x + sway, p.z) ? p.x + sway : p.x;
        const a = project(x, p.y, p.z);
        if (!a.visible) continue;
        ctx.globalAlpha = opacity * (snow ? 0.55 : 0.28);
        if (snow) { ctx.beginPath(); ctx.arc(a.x, a.y, p.size, 0, Math.PI * 2); ctx.fill(); }
        else {
          const b = project(x, Math.max(WEATHER_GROUND, p.y - 0.48), p.z);
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      for (let i = landings.length - 1; i >= 0; i--) {
        const p = landings[i]; p.age += dt;
        if (p.age > (p.snow ? 2 : 0.65)) { landings.splice(i, 1); continue; }
        planeRing(p.x, p.z, p.snow ? 0.035 : 0.035 + p.age * 0.22,
          (p.snow ? 0.4 : 0.2) * (1 - p.age / (p.snow ? 2 : 0.65)), p.snow);
      }
      ctx.globalAlpha = 1;
    },
  };
}
