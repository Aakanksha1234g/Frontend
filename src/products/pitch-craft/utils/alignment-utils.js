import { fabric } from 'fabric';

// Distance utility
export function getDistance(a, b) {
  return Math.abs(a - b);
}

// Find closest points on axis
export function getDistanceList(point, list, axis) {
  let min = Infinity,
    arr = [];
  for (let it of list) {
    const d = getDistance(point[axis], it[axis]);
    if (d < min) {
      min = d;
      arr = [it];
    } else if (d === min) arr.push(it);
  }
  return { dis: min, arr };
}

// Get corners + center midpoints
export function getPointMap(target) {
  const raw = target.getCoords();
  const pts = raw.map(p => new fabric.Point(p.x, p.y));

  const mid = (a, b) => new fabric.Point((a.x + b.x) / 2, (a.y + b.y) / 2);

  return {
    tl: pts[0],
    tr: pts[1],
    br: pts[2],
    bl: pts[3],
    mt: mid(pts[0], pts[1]),
    mr: mid(pts[1], pts[2]),
    mb: mid(pts[2], pts[3]),
    ml: mid(pts[3], pts[0]),
  };
}

export function getContraryMap(target) {
  const ac = target.aCoords || target.calcACoords();
  const tl = new fabric.Point(ac.tl.x, ac.tl.y);
  const tr = new fabric.Point(ac.tr.x, ac.tr.y);
  const br = new fabric.Point(ac.br.x, ac.br.y);
  const bl = new fabric.Point(ac.bl.x, ac.bl.y);

  const mid = (a, b) => new fabric.Point((a.x + b.x) / 2, (a.y + b.y) / 2);

  return {
    tl: br,
    tr: bl,
    br: tl,
    bl: tr,
    mt: mid(br, bl),
    mr: mid(bl, tl),
    mb: mid(tl, tr),
    ml: mid(tr, br),
  };
}
