# 本地模型库

`lofi-v1/` 完整保留 2026-09-12 改版前的家具、房间、材质和灯光模块。
文件没有经过降模或材质替换。`state.js` 保留旧交互状态依赖。

房间左下角的“模型库”可浏览 12 组归档家具、旋转和缩放预览。
模型只在首次打开时加载，不会占用新房间的实时绘制预算。

目录索引见 `catalog.js`。`loadArchivedModels(scene)` 返回具名模型及 Three.js Object3D，
可将选中的 `object` 重新挂载到目标场景、设置 position/rotation 后继续使用。
查看器保留几何和材质，但不运行旧房间的交互动画；若需恢复交互，可使用归档模块的
`createFurniture(scene, materials, store, register)`，其接口与旧版一致。

新场景装配文件：`../scene/reference-furniture.js`。
