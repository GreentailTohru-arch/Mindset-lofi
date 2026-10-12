// Archived assemblies stay independent of the current room and retain their geometry.
export const catalog = [
  { id: "wardrobe", name: "深木衣柜", match: "衣柜门" },
  { id: "tea", name: "日式茶桌与茶具", match: "茶桌与茶具" },
  { id: "cushion", name: "日式坐垫", match: "坐垫" },
  { id: "floor-lamp", name: "纸罩落地灯", match: "落地灯" },
  { id: "old-bed", name: "原版布艺双人床", match: "柔软的床" },
  { id: "desk", name: "深木 L 形电脑桌", match: "显示器" },
  { id: "chair", name: "原版黑色电脑椅", match: "电脑椅" },
  { id: "shelf", name: "高层木质收纳架", match: "书架上的书" },
  { id: "cat", name: "小猫糯米与圆形猫垫", match: "猫垫" },
  { id: "nightstand", name: "原版床头柜与台灯", match: "床头柜抽屉" },
  { id: "ac", name: "原版壁挂空调", match: "空调" },
  { id: "wall-art", name: "原版彩色灯板", match: "光影装饰" },
];

export async function loadArchivedModels(scene) {
  const [{ createFurniture }, { createMaterials }, { createStore }] =
    await Promise.all([
      import("./lofi-v1/furniture.js"),
      import("./lofi-v1/materials.js"),
      import("./state.js"),
    ]);
  const items = [];
  createFurniture(scene, createMaterials(), createStore(), (object, name) =>
    items.push({ object, name }),
  );
  const root = scene.children[scene.children.length - 1];
  const models = catalog.map((entry) => {
    const found = items.find((item) => item.name.includes(entry.match));
    if (!found) throw new Error(`Missing archived model: ${entry.name}`);
    let object = found.object;
    while (object.parent && object.parent !== root) object = object.parent;
    object.visible = false;
    return { ...entry, object };
  });
  root.visible = false;
  return { root, models };
}
