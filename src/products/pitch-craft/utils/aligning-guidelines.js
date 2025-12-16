import { util, ActiveSelection, Group } from 'fabric';
import { collectHorizontalPoint, collectVerticalPoint } from './collect-points';
import { drawVerticalLines, drawHorizontalLines } from './draw';
import { collectLine } from './alignment-lines';
import { getObjectsByTarget } from './get-object-by-target';
import { getContraryMap, getPointMap } from './alignment-utils';

export class AligningGuidelines {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    Object.assign(
      this,
      {
        margin: 5,
        color: 'rgba(0,174,239,0.8)',
        width: 1,
        lineDash: [4, 4],
        xSize: 5,
        closeVLine: false,
        closeHLine: false,
      },
      opts
    );
    this.verticalLines = new Set();
    this.horizontalLines = new Set();
    this.cache = new Map();
    this.canvas.on('object:moving', e => this.onMoving(e));
    this.canvas.on('object:modified', e => this.onModified(e));
    this.canvas.on('before:render', () =>
      this.canvas.clearContext(this.canvas.contextTop)
    );
    this.canvas.on('after:render', () => {
      drawVerticalLines.call(this);
      drawHorizontalLines.call(this);
    });
  }

  onMoving({ target }) {
    this.verticalLines.clear();
    this.horizontalLines.clear();
    target.setCoords();

    const nearby = Array.from(getObjectsByTarget(target)).flatMap(o =>
      this.getPointMapValues(o)
    );
    const { v, h } = collectLine.call(this, target, nearby);

    v.forEach(o => this.verticalLines.add(JSON.stringify(o)));
    h.forEach(o => this.horizontalLines.add(JSON.stringify(o)));
    this.canvas.requestRenderAll();
  }

  onModified({ target }) {
    // snap-to-guide once after drop
    // e.g., apply nearest delta from current lines …
  }

  getPointMapValues(o) {
    const c =
      o.calcTransformMatrix().toString() + '|' + o.width + '|' + o.height;
    if (!this.cache.has(c)) {
      this.cache.set(c, Object.values(getPointMap(o)));
    }
    return this.cache.get(c);
  }

  dispose() {
    this.canvas.off('object:moving');
    this.canvas.off('object:modified');
    this.canvas.off('before:render');
    this.canvas.off('after:render');
  }
}