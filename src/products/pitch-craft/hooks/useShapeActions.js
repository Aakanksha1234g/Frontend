import { useCallback } from 'react';
import { fabric } from 'fabric';
import { useCanvas } from '@products/pitch-craft/contexts/CanvasContext';

export function useShapeActions() {
  const { canvas } = useCanvas();

  const markShape = obj => {
    obj.customShape = true;
    return obj;
  };

  const baseOptions = {
    left: 50,
    top: 50,
    fill: '#FFFFFF',
    stroke: '#CCCCCC',
    strokeWidth: 0,
    objectCaching: false,
    lockScalingFlip: true,
    strokeUniform: true,
  };

  const fixScaling = obj => {
    obj.setControlsVisibility({
      mt: true,
      mb: true,
      ml: true,
      mr: true,
      bl: true,
      br: true,
      tl: true,
      tr: true,
      mtr: true,
    });

    obj.on('scaling', function () {
      // Handle circle scaling differently (uses radius instead of width/height)
      if (this.type === 'circle') {
        this.set({
          radius: this.radius * this.scaleX,
          scaleX: 1,
          scaleY: 1,
        });
      } else {
        // For rectangles, triangles, and other shapes
        this.set({
          width: this.width * this.scaleX,
          height: this.height * this.scaleY,
          scaleX: 1,
          scaleY: 1,
        });
      }
    });

    obj.on('modified', () => {
      obj.setCoords();
      if (canvas) canvas.renderAll();
    });
  };

  const createShape = (ShapeClass, options = {}) => {
    if (!canvas) return;

    const obj = markShape(new ShapeClass({ ...baseOptions, ...options }));
    fixScaling(obj);
    canvas.add(obj);
    canvas.setActiveObject(obj);
    canvas.requestRenderAll();
    return obj;
  };

  // ------------------ BASIC SHAPES ------------------
  const addRectangle = useCallback(
    () => createShape(fabric.Rect, { width: 120, height: 80 }),
    [canvas]
  );
  const addRoundedRectangle = useCallback(
    () => createShape(fabric.Rect, { width: 120, height: 80, rx: 20, ry: 20 }),
    [canvas]
  );
  const addCircle = useCallback(
    () => createShape(fabric.Circle, { radius: 50 }),
    [canvas]
  );
  const addTriangle = useCallback(
    () => createShape(fabric.Triangle, { width: 100, height: 100 }),
    [canvas]
  );
  const addLine = useCallback(() => {
    if (!canvas) return;
    const line = new fabric.Line([50, 50, 150, 50], {
      stroke: '#CCCCCC',
      strokeWidth: 5,
    });
    markShape(line);
    canvas.add(line);
    canvas.setActiveObject(line);
    canvas.requestRenderAll();
    return line;
  }, [canvas]);

  // ------------------ STYLE ------------------
  const setFillColor = useCallback(
    color => {
      if (!canvas) return;
      const active = canvas.getActiveObject();
      if (!active) return;
      if (active.type === 'line' || active.type === 'path')
        active.set({ stroke: color });
      else active.set({ fill: color });
      canvas.renderAll();
    },
    [canvas]
  );

  const setBorderColor = useCallback(
    color => {
      if (!canvas) return;
      const active = canvas.getActiveObject();
      if (!active) return;
      active.set({ stroke: color });
      canvas.renderAll();
    },
    [canvas]
  );

  const setOpacity = useCallback(
    opacity => {
      if (!canvas) return;
      const active = canvas.getActiveObject();
      if (!active) return;
      active.set({ opacity });
      canvas.renderAll();
    },
    [canvas]
  );

  return {
    addRectangle,
    addRoundedRectangle,
    addCircle,
    addTriangle,
    addLine,
    setFillColor,
    setBorderColor,
    setOpacity,
  };
}
