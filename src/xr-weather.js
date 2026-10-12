import * as THREE from "three";

// Match actual window scenery geometry, including arched cutouts, in both eyes.
// Avoid weather on interior niches, paintings or room floors.
export function createXRWeather() {
  const root = new THREE.Group();
  root.name = "XR window weather";
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: {
      time: { value: 0 },
      snow: { value: 0 },
      daylight: { value: 0 },
    },
    vertexShader: `varying vec2 vUv; void main() { vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `varying vec2 vUv; uniform float time, snow, daylight;
      float hash(vec2 p) { return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
      void main() {
        vec2 uv=vUv*vec2(55.,24.);
        uv.y += time*mix(16.,1.4,snow);
        uv.x += sin(time*.6+floor(uv.y))*.2*snow;
        vec2 cell=floor(uv), p=fract(uv)-.5;
        float seed=hash(cell);
        p.x += (seed-.5)*.6;
        float rain=(1.-smoothstep(.012,.055,abs(p.x)))*(1.-smoothstep(.18,.46,abs(p.y)));
        float flake=1.-smoothstep(.035,.12,length(p));
        float alpha=mix(rain*.5,flake*.85,snow)*step(.38,seed);
        gl_FragColor=vec4(mix(vec3(.64,.78,.9),vec3(.89,.95,1.),daylight),alpha);
      }`,
  });
  const sources = [];
  function bind(roots) {
    root.children.forEach((mesh) => mesh.geometry.dispose());
    root.clear();
    sources.length = 0;
    const bounds = new THREE.Box3(),
      size = new THREE.Vector3(),
      center = new THREE.Vector3();
    for (const parent of roots) {
      parent.updateWorldMatrix(true, true);
      parent.traverse((source) => {
        if (
          !source.isMesh ||
          !source.material?.isMeshBasicMaterial ||
          !source.material.map
        )
          return;
        bounds.setFromObject(source).getSize(size);
        bounds.getCenter(center);
        let window = false;
        for (let node = source; node; node = node.parent)
          window ||=
            /window|oasis-view/.test(node.name) && !/wall/.test(node.name);
        const largePane = size.y > 1 && Math.max(size.x, size.z) > 1;
        const thinPane = Math.min(size.x, size.z) < 0.08;
        if (!largePane || !thinPane || !(window || center.x < -4.7)) return;
        const geometry = source.geometry.clone();
        geometry.applyMatrix4(source.matrixWorld);
        const normal = new THREE.Vector3(0, 0, 1).transformDirection(
          source.matrixWorld,
        );
        geometry.translate(
          normal.x * 0.012,
          normal.y * 0.012,
          normal.z * 0.012,
        );
        const mesh = new THREE.Mesh(geometry, material);
        root.add(mesh);
        sources.push({ mesh, source });
      });
    }
  }
  root.visible = false;
  return {
    root,
    bind,
    update(dt, state, active) {
      root.visible = active && state.weather !== "clear";
      for (const { mesh, source } of sources) {
        mesh.visible = true;
        for (let node = source; node; node = node.parent)
          if (!node.visible) mesh.visible = false;
      }
      material.uniforms.time.value += Math.min(dt, 0.05);
      material.uniforms.snow.value = state.weather === "snow" ? 1 : 0;
      material.uniforms.daylight.value = state.day ? 1 : 0;
    },
  };
}
