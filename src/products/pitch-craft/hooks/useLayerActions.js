import { useCallback } from 'react';
import { useCanvas } from '@products/pitch-craft/contexts/CanvasContext';

export function useLayerActions() {
  const { canvas } = useCanvas();

  const bringForward = useCallback(() => {
    if (!canvas) return;

    const activeObj = canvas.getActiveObject();
    if (activeObj) {
      canvas.bringForward(activeObj);
      canvas.requestRenderAll();
    }
  }, [canvas]);

  const bringToFront = useCallback(() => {
    if (!canvas) return;

    const activeObj = canvas.getActiveObject();
    if (activeObj) {
      canvas.bringToFront(activeObj);
      canvas.requestRenderAll();
    }
  }, [canvas]);

  const sendBackward = useCallback(() => {
    if (!canvas) return;

    const activeObj = canvas.getActiveObject();
    if (activeObj) {
      canvas.sendBackwards(activeObj);
      canvas.requestRenderAll();
    }
  }, [canvas]);

  const sendToBack = useCallback(() => {
    if (!canvas) return;

    const activeObj = canvas.getActiveObject();
    if (activeObj) {
      canvas.sendToBack(activeObj);
      canvas.requestRenderAll();
    }
  }, [canvas]);

  const hasActiveObject = useCallback(() => {
    if (!canvas) return false;
    return !!canvas.getActiveObject();
  }, [canvas]);

  return {
    bringForward,
    bringToFront,
    sendBackward,
    sendToBack,
    hasActiveObject,
  };
}
