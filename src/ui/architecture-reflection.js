import * as THREE from "three";

// Select room architecture before furniture is added. Assets stay unchanged.
export function isVerticalArchitecture(bounds) {
  const size = bounds.getSize(new THREE.Vector3());
  const center = bounds.getCenter(new THREE.Vector3());
  const atWall = Math.abs(center.x) > 4.25 || Math.abs(center.z) > 4.25;
  return (
    atWall &&
    bounds.max.y > 0.2 &&
    size.y > 0.24 &&
    Math.min(size.x, size.z) < 0.85 &&
    size.y > Math.min(size.x, size.z) * 1.2
  );
}
export function createArchitectureReflection(scene, roomMeshes) {
  scene.updateMatrixWorld(true);
  const included = new Set();
  for (const mesh of roomMeshes) {
    if (
      mesh.isMesh &&
      !mesh.isInstancedMesh &&
      isVerticalArchitecture(new THREE.Box3().setFromObject(mesh))
    )
      included.add(mesh);
  }
  const hidden = [];
  const originalMatrix = new THREE.Matrix4();
  const mirrorMatrix = new THREE.Matrix4().makeScale(1, -1, 1);
  mirrorMatrix.setPosition(0, -0.7, 0);
  return {
    get count() {
      return included.size;
    },
    render(renderer, camera, consume) {
      hidden.length = 0;
      const matrixAutoUpdate = scene.matrixAutoUpdate;
      scene.updateMatrix();
      originalMatrix.copy(scene.matrix);
      const shadowsEnabled = renderer.shadowMap.enabled;
      const shadows = renderer.shadowMap.autoUpdate;
      const needsUpdate = renderer.shadowMap.needsUpdate;
      try {
        // Keep all light state, but omit floors, rugs, furniture and their top surfaces.
        scene.traverse((object) => {
          if (
            (object.isMesh ||
              object.isLine ||
              object.isPoints ||
              object.isSprite) &&
            object.visible &&
            !included.has(object)
          ) {
            hidden.push(object);
            object.visible = false;
          }
        });
        renderer.shadowMap.enabled = false;
        renderer.shadowMap.autoUpdate = false;
        renderer.shadowMap.needsUpdate = false;
        scene.matrixAutoUpdate = false;
        scene.matrix.copy(mirrorMatrix).multiply(originalMatrix);
        scene.updateMatrixWorld(true);
        renderer.render(scene, camera);
        consume(renderer.domElement);
      } finally {
        scene.matrix.copy(originalMatrix);
        scene.matrixAutoUpdate = matrixAutoUpdate;
        scene.updateMatrixWorld(true);
        for (const object of hidden) object.visible = true;
        renderer.shadowMap.enabled = shadowsEnabled;
        renderer.shadowMap.autoUpdate = shadows;
        renderer.shadowMap.needsUpdate = needsUpdate;
      }
    },
  };
}

