import { emotionScenes } from "./emotion-scenes.js";
const TAU = Math.PI * 2;
export const emotionArtNames = [
  "墨绪流瀑",
  "双生平衡",
  "星芒王冠",
  "静心曼陀罗",
  "远行沙丘",
  "独处之门",
  "呼吸之石",
  "舒展叶脉",
  "向往之翼",
  "繁花穹顶",
  "浪漫心弦",
  "潮汐涟漪",
  "归巢光茧",
  "仪式折扇",
  "秩序网格",
  "沉静晶城",
  "蓄能齿轮",
  "记忆星轨",
  "欢跃星屑",
  "自由丝结",
  "澄明雪晶",
  "珍爱钻光",
  "晚安月湾",
  "能量虫洞",
];
// Stable scene-order palette: one accent per feeling, shared by result and hover art.
export const emotionParticleColors = [
  "#7c9dff",
  "#54d6ce",
  "#ffc45c",
  "#ba93ff",
  "#ff9759",
  "#b7cbff",
  "#b3d693",
  "#42dcb0",
  "#70cbff",
  "#dc70ef",
  "#ff83b5",
  "#48bcec",
  "#e7ad76",
  "#edcf88",
  "#70a6ec",
  "#a2b1ca",
  "#ff755d",
  "#c39b74",
  "#fff16a",
  "#bb77ff",
  "#a1ebee",
  "#ec9cd8",
  "#9496ed",
  "#58f0da",
];
// Each emotion has a separate parametric sculpture, in normalized 3D space.
export function emotionArtPoint(mode, u, v, t) {
  const a = u * TAU,
    b = v * TAU,
    s = Math.sin,
    c = Math.cos;
  switch (mode) {
    case 0:
      return [
        (v - 0.5) * 1.5 + 0.14 * s(a * 2 + t + v * 8),
        (u - 0.5) * 1.8,
        0.28 * s(a + t + v * 10),
      ];
    case 1: {
      const r = 0.53 + 0.13 * c(b);
      return [r * c(a), r * s(a), 0.3 * s(b + a * 2 + t)];
    }
    case 2: {
      const r = 0.35 + v * 0.45;
      return [r * c(a), -0.55 + v * 0.8 + 0.25 * c(a * 8) * v, r * s(a)];
    }
    case 3: {
      const r = 0.26 + v * 0.48 + 0.07 * c(a * 12 + t);
      return [r * c(a), r * s(a), 0.12 * s(a * 6 + b + t)];
    }
    case 4:
      return [
        (u - 0.5) * 1.9,
        (v - 0.5) * 1.2 + 0.19 * s(a * 1.5 + v * 5 + t),
        0.32 * c(a + v * 6),
      ];
    case 5: {
      const r = 0.18 + v * 0.62;
      return [
        r * Math.sign(c(a)) * Math.pow(Math.abs(c(a)), 0.3),
        r * Math.sign(s(a)) * Math.pow(Math.abs(s(a)), 0.3),
        0.35 * s(v * 4 + t * 0.3),
      ];
    }
    case 6: {
      const r = 0.65 + 0.06 * s(a * 5 + b + t);
      return [r * c(a) * s(b / 2), r * s(a) * s(b / 2), r * c(b / 2) * 0.7];
    }
    case 7: {
      const leaf = Math.floor(v * 6),
        q = (v * 6) % 1,
        r = s(a / 2);
      return [
        (u - 0.5) * 1.7,
        0.36 * s(a / 2) * s(q * Math.PI) + leaf * 0.13 - 0.4,
        0.35 * r * c(q * Math.PI + leaf) + 0.1 * s(t + a),
      ];
    }
    case 8: {
      const wing = s(a) * (0.4 + 0.4 * s(a) ** 2);
      return [
        wing * (0.6 + v * 0.6),
        c(a) * 0.6,
        0.32 * s(a * 2 + b + t * 0.5),
      ];
    }
    case 9: {
      const r = 0.42 + 0.25 * c(a * 5 + b + t * 0.15);
      return [r * c(a), r * s(a), 0.3 * s(b) + 0.12 * c(a * 5)];
    }
    case 10:
      return [
        s(a) ** 3 * 0.72 * (0.5 + v * 0.5),
        -(13 * c(a) - 5 * c(2 * a) - 2 * c(3 * a) - c(4 * a)) *
          0.045 *
          (0.5 + v * 0.5),
        0.24 * s(b + t * 0.3),
      ];
    case 11: {
      const r = 0.12 + v * 0.7;
      return [r * c(a), r * s(a) * 0.63, 0.18 * s(r * 15 - t * 2 + a * 2)];
    }
    case 12: {
      const r = 0.58 + 0.12 * s(b);
      return [r * c(a), r * s(a) * 0.75, 0.4 * c(b) + 0.08 * s(a * 7 + t)];
    }
    case 13: {
      const angle = (u - 0.5) * Math.PI * 1.4,
        r = 0.18 + v * 0.75;
      return [r * s(angle), 0.4 - r * c(angle), 0.12 * c(angle * 18 + t)];
    }
    case 14:
      return [
        (u - 0.5) * 1.5,
        (v - 0.5) * 1.5,
        0.2 * s(a + t) * s(b + t * 0.4),
      ];
    case 15: {
      const k = a / (Math.PI / 2),
        f = k % 1,
        side = Math.floor(k) % 4,
        r = 0.22 + v * 0.5;
      return [
        [r, r - 2 * r * f],
        [r - 2 * r * f, -r],
        [-r, -r + 2 * r * f],
        [-r + 2 * r * f, r],
      ][side].concat((v - 0.5) * 1.05);
    }
    case 16: {
      const r = 0.4 + v * 0.24 + 0.065 * Math.sign(c(a * 14));
      return [r * c(a + t * 0.12), r * s(a + t * 0.12), 0.32 * s(b)];
    }
    case 17: {
      const r = 0.3 + v * 0.45;
      return [r * c(a), r * s(a) * c(b * 0.45), r * s(a) * s(b * 0.45)];
    }
    case 18: {
      const r = 0.2 + v * 0.6,
        angle = a + v * 9;
      return [
        r * c(angle) + 0.09 * s(t * 2 + v * 20),
        r * s(angle) + 0.09 * c(t * 1.6 + v * 15),
        0.3 * s(a * 3 + b + t),
      ];
    }
    case 19: {
      const r = 0.45 + 0.18 * c(a * 3 + b);
      return [r * c(a * 2), r * s(a * 2), 0.35 * s(a * 3 + b + t * 0.2)];
    }
    case 20: {
      const r = (0.25 + v * 0.5) * (1 + 0.2 * c(a * 6));
      return [r * c(a), r * s(a), 0.08 * s(b + a * 6 + t * 0.3)];
    }
    case 21: {
      const r = (0.25 + v * 0.6) * (1 - 0.28 * Math.abs(s(a * 2)));
      return [r * c(a), r * s(a), 0.4 * c(b / 2)];
    }
    case 22: {
      const angle = (u - 0.5) * Math.PI * 1.65,
        r = 0.56 + 0.12 * c(b);
      return [r * c(angle) - 0.16, r * s(angle), 0.16 * s(b) + 0.04 * s(t + a)];
    }
    case 23: {
      const angle = a + v * 8 + t * 0.25,
        r = 0.13 + v * 0.67;
      return [r * c(angle), r * s(angle), (0.5 - v) * 1.2];
    }
    default:
      throw new RangeError("Unknown emotion artwork");
  }
}

export function startEmotionArt(canvas, signal) {
  const ctx = canvas.getContext("2d"),
    graph = signal.getContext("2d");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let frame = 0,
    enabled = false,
    emotion = 0,
    origin = 0;
  function fit(target) {
    const r = target.getBoundingClientRect(),
      d = Math.min(devicePixelRatio, 1.75),
      w = Math.round(r.width * d),
      h = Math.round(r.height * d);
    if (target.width !== w || target.height !== h) {
      target.width = w;
      target.height = h;
    }
    return [w, h];
  }
  function draw(now) {
    frame = 0;
    if (!enabled || document.hidden) return;
    const [w, h] = fit(canvas),
      t = reduced.matches ? 0 : Math.max(0, (now - origin) / 1000),
      r = Math.min(w, h) * 0.46;
    ctx.clearRect(0, 0, w, h);
    if (w && h) {
      const turn = 0.2 + Math.sin(t * 0.12) * 0.3,
        tilt = 0.16 + Math.sin(t * 0.09) * 0.12;
      function project(p) {
        const [x, y, z] = p,
          xx = x * Math.cos(turn) + z * Math.sin(turn),
          zz = z * Math.cos(turn) - x * Math.sin(turn),
          yy = y * Math.cos(tilt) - zz * Math.sin(tilt),
          depth = y * Math.sin(tilt) + zz * Math.cos(tilt),
          scale = 1 / (1 - depth * 0.16);
        return [w / 2 + xx * r * scale, h / 2 + yy * r * scale, depth];
      }
      const halo = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, r);
      halo.addColorStop(0, "rgba(255,255,255,.025)");
      halo.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, w, h);
      const rows = 34,
        cols = 160;
      const field = Array.from({ length: rows }, (_, j) =>
        Array.from({ length: cols + 1 }, (_, i) =>
          project(emotionArtPoint(emotion, i / cols, j / (rows - 1), t)),
        ),
      );
      field.forEach((line, j) => {
        ctx.strokeStyle = `rgba(245,245,245,${0.16 + (j % 5) * 0.042})`;
        ctx.lineWidth = Math.max(0.65, w / 1550);
        ctx.beginPath();
        line.forEach((p, i) =>
          i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]),
        );
        ctx.stroke();
        if (j > 0) {
          ctx.strokeStyle = "rgba(255,255,255,.065)";
          ctx.beginPath();
          for (let i = 0; i <= cols; i += 6) {
            ctx.moveTo(line[i][0], line[i][1]);
            ctx.lineTo(field[j - 1][i][0], field[j - 1][i][1]);
          }
          ctx.stroke();
        }
        for (let n = 0; n < 3; n++) {
          const index = Math.floor(
              ((t * 0.045 + j * 0.071 + n / 3) % 1) * cols,
            ),
            p = line[index];
          ctx.shadowBlur = 10;
          ctx.shadowColor = "#fff";
          ctx.fillStyle = "rgba(255,255,255,.8)";
          ctx.beginPath();
          ctx.arc(p[0], p[1], Math.max(1, w / 750), 0, TAU);
          ctx.fill();
        }
        ctx.shadowBlur = 0;
      });
      // Three depth bands of coloured particles, with short orbital trails and luminous cores.
      const color = emotionParticleColors[emotion];
      const rgb = [1, 3, 5]
        .map((offset) => parseInt(color.slice(offset, offset + 2), 16))
        .join(",");
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      const count = w < 600 ? 260 : 440;
      for (let i = 0; i < count; i++) {
        const speed = 0.008 + (i % 5) * 0.002;
        const u = (i * 0.6180339 + t * speed) % 1;
        const v = (i * 0.381966) % 1;
        const band = i % 3;
        const expansion = 1.02 + band * 0.085 + 0.035 * Math.sin(t * 0.7 + i);
        const position = (at) => {
          const shape = emotionArtPoint(emotion, at, v, t);
          return project(
            shape.map(
              (q, axis) =>
                q * expansion + 0.014 * Math.sin(t * 0.6 + i + axis * 2),
            ),
          );
        };
        const p = position(u);
        const alpha = 0.3 + (Math.sin(t * 1.2 + i) + 1) * 0.23;
        const size =
          Math.max(0.85, w / 1050) *
          (band === 0 ? 0.8 : band === 1 ? 1.25 : 1.8);
        // Leave open curves open; avoid a long streak across their endpoints.
        if (u > 0.006 && i % 3 === 0) {
          const previous = position(u - 0.006);
          ctx.strokeStyle = `rgba(${rgb},${alpha * 0.42})`;
          ctx.lineWidth = size * 0.65;
          ctx.beginPath();
          ctx.moveTo(previous[0], previous[1]);
          ctx.lineTo(p[0], p[1]);
          ctx.stroke();
        }
        ctx.fillStyle = `rgba(${rgb},${alpha})`;
        if (i % 6 === 0) {
          ctx.shadowColor = color;
          ctx.shadowBlur = 10 + size * 3;
        }
        ctx.beginPath();
        ctx.arc(p[0], p[1], size, 0, TAU);
        ctx.fill();
        ctx.shadowBlur = 0;
        if (i % 17 === 0) {
          const halo = ctx.createRadialGradient(
            p[0],
            p[1],
            0,
            p[0],
            p[1],
            size * 6,
          );
          halo.addColorStop(0, `rgba(${rgb},.28)`);
          halo.addColorStop(1, `rgba(${rgb},0)`);
          ctx.fillStyle = halo;
          ctx.fillRect(p[0] - size * 6, p[1] - size * 6, size * 12, size * 12);
        }
      }
      ctx.restore();
    }
    const [sw, sh] = fit(signal);
    graph.clearRect(0, 0, sw, sh);
    if (sw && sh) {
      graph.strokeStyle = "#aaa";
      graph.beginPath();
      for (let x = 0; x < sw; x += 2) {
        const y =
          sh / 2 +
          Math.sin(x * 0.027 + t * 2) *
            Math.sin(x * 0.008 + emotion) *
            sh *
            0.22;
        x ? graph.lineTo(x, y) : graph.moveTo(x, y);
      }
      graph.stroke();
    }
    if (!reduced.matches) frame = requestAnimationFrame(draw);
  }
  function refresh() {
    cancelAnimationFrame(frame);
    if (enabled) frame = requestAnimationFrame(draw);
  }
  const observer = new ResizeObserver(refresh);
  observer.observe(canvas);
  document.addEventListener("visibilitychange", refresh);
  reduced.addEventListener("change", refresh);
  return {
    setEmotion(index) {
      if (index < 0 || index >= 24) throw new RangeError("Unknown emotion");
      if (emotion !== index) origin = performance.now();
      emotion = index;
      canvas.setAttribute(
        "aria-label",
        `${emotionScenes[index].emotion} · ${emotionArtNames[index]}动态艺术`,
      );
      refresh();
    },
    active(value) {
      enabled = value;
      if (value) origin = performance.now();
      refresh();
    },
    dispose() {
      enabled = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener("visibilitychange", refresh);
      reduced.removeEventListener("change", refresh);
    },
  };
}
