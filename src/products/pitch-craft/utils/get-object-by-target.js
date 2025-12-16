import { fabric } from 'fabric';

export function getObjectsByTarget(target) {
  const canvas = target.canvas;
  if (!canvas) return new Set();

  const selList =
    target instanceof fabric.ActiveSelection ? target.getObjects() : [target];
  const out = new Set();

  canvas.forEachObject(o => {
    if (!o.visible || !o.isOnScreen()) return;
    if (o.constructor === fabric.Group) collectGroup(o, out);
    else out.add(o);
  });

  selList.forEach(o => {
    if (o.constructor === fabric.Group) collectGroup(o, out, true);
    else out.delete(o);
  });

  return out;
}

function collectGroup(group, set, exclude = false) {
  group.getObjects().forEach(c => {
    if (!c.visible) return;
    if (c.constructor === fabric.Group) collectGroup(c, set, exclude);
    else exclude ? set.delete(c) : set.add(c);
  });
}
