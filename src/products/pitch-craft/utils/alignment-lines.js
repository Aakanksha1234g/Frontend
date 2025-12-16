import { getDistanceList } from './alignment-utils';

// Pure guideline collection => no moves while dragging
export function collectLine(target, points) {
  const list = target.getCoords().map(p => new fabric.Point(p.x, p.y));
  const center = target.getCenterPoint();
  list.push(center);

  const margin = this.margin / this.canvas.getZoom();
  const v = collectPoints({ target, list, points, margin, axis: 'x' });
  const h = collectPoints({ target, list, points, margin, axis: 'y' });

  return { v, h };
}

function collectPoints({ list, points, margin, axis }) {
  const res = [];
  const arrs = list.map(pt => getDistanceList(pt, points, axis));
  const min = Math.min(...arrs.map(a => a.dis));
  if (min > margin) return res;

  arrs.forEach((o, i) => {
    if (o.dis === min)
      o.arr.forEach(pt2 => res.push({ origin: list[i], target: pt2 }));
  });
  return res;
}
