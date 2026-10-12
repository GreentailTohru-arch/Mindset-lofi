import * as THREE from "three";

// Clip individual herringbone planks before combining them in one draw call.
export function createParquetGeometry() {
  const positions = [],
    uvs = [],
    colors = [];
  function clip(poly, axis, edge, sign) {
    const out = [];
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i],
        b = poly[(i + 1) % poly.length],
        insideA = sign * (a[axis] - edge) <= 0,
        insideB = sign * (b[axis] - edge) <= 0;
      if (insideA) out.push(a);
      if (insideA !== insideB) {
        const t = (edge - a[axis]) / (b[axis] - a[axis]);
        out.push(a.map((v, k) => v + (b[k] - v) * t));
      }
    }
    return out;
  }
  for (let i = -10; i <= 10; i++)
    for (let j = -35; j <= 35; j++)
      for (let v = 0; v < 2; v++) {
        const x = (i * 4 + j + (v ? 4 : 0)) * 0.25,
          z = (i * 4 - j) * 0.25,
          w = v ? 0.25 : 1,
          h = v ? 1 : 0.25,
          g = 0.005;
        let poly = [
          [x + g, z + g, 0, 0],
          [x + w - g, z + g, v ? 0 : 1, v ? 1 : 0],
          [x + w - g, z + h - g, 1, 1],
          [x + g, z + h - g, v ? 1 : 0, v ? 0 : 1],
        ].map(([a, b, u, t]) => [
          (a - b) * Math.SQRT1_2,
          (a + b) * Math.SQRT1_2,
          u,
          t,
        ]);
        for (const [axis, edge, sign] of [
          [0, 5, 1],
          [0, -5, -1],
          [1, 5, 1],
          [1, -5, -1],
        ])
          poly = clip(poly, axis, edge, sign);
        const shade =
          0.69 + ((((i * 17 + j * 7 + v * 3) % 17) + 17) % 17) * 0.017;
        for (let p = 1; p < poly.length - 1; p++)
          for (const point of [poly[0], poly[p + 1], poly[p]]) {
            positions.push(point[0], 0.021, point[1]);
            uvs.push(point[2], point[3]);
            colors.push(shade, shade, shade);
          }
      }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  return geo;
}
