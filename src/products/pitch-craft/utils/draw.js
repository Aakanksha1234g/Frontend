import { fabric } from 'fabric';

export function drawLine(ctxObj, origin, target) {
  const ctx = ctxObj.canvas.getTopContext();
  const zoom = ctxObj.canvas.getZoom();
  ctx.save();
  ctx.transform(...ctxObj.canvas.viewportTransform);
  ctx.lineWidth = ctxObj.width / zoom;
  if (ctxObj.lineDash) ctx.setLineDash(ctxObj.lineDash);
  ctx.strokeStyle = ctxObj.color;

  ctx.beginPath();
  ctx.moveTo(origin.x, origin.y);
  ctx.lineTo(target.x, target.y);
  ctx.stroke();

  if (ctxObj.lineDash) ctx.setLineDash([]);
  drawX(ctxObj, origin);
  drawX(ctxObj, target);
  ctx.restore();
}

export function drawX(ctxObj, pt) {
  const ctx = ctxObj.canvas.getTopContext();
  const zoom = ctxObj.canvas.getZoom();
  const size = ctxObj.xSize / zoom;
  ctx.save();
  ctx.translate(pt.x, pt.y);
  ctx.beginPath();
  ctx.moveTo(-size, -size);
  ctx.lineTo(size, size);
  ctx.moveTo(size, -size);
  ctx.lineTo(-size, size);
  ctx.stroke();
  ctx.restore();
}


// In draw.js
export function drawVerticalLines() {
  if (this.closeVLine) return;
  for (const v of this.verticalLines) {
    const { origin, target } = JSON.parse(v);
    const o = new fabric.Point(target.x, origin.y);
    drawLine(this, o, target); 
  }
}

export function drawHorizontalLines() {
  if (this.closeHLine) return;
  for (const v of this.horizontalLines) {
    const { origin, target } = JSON.parse(v);
    const o = new fabric.Point(origin.x, target.y);
    drawLine(this, o, target); 
  }
}

