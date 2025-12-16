import { useCallback } from 'react';
import { useCanvas } from '@products/pitch-craft/contexts/CanvasContext';

export function useGroupActions() {
  const { canvas } = useCanvas();

  const discardSelection = useCallback(() => {
    if (!canvas) return;
    canvas.discardActiveObject();
    canvas.requestRenderAll();
  }, [canvas]);

  const groupSelection = useCallback(() => {
    if (!canvas) return;

    const activeObj = canvas.getActiveObject();
    if (!activeObj || activeObj.type !== 'activeSelection') return;

    const group = activeObj.toGroup();
    group.subTargetCheck = false;
    group.interactive = false;
    group.selectable = true;
    group.hasControls = true;
    group.hasBorders = true;
    
    // Move the group to the top of the stack
    canvas.bringToFront(group);
    canvas.setActiveObject(group);
    canvas.requestRenderAll();
  }, [canvas]);

  const ungroupSelection = useCallback(() => {
    if (!canvas) return;

    const group = canvas.getActiveObject();
    if (!group || group.type !== 'group') return;

    const activeSelection = group.toActiveSelection();
    activeSelection.getObjects().forEach(obj => {
      obj.interactive = true;
      obj.selectable = true;
    });
    canvas.requestRenderAll();
  }, [canvas]);

  const canGroup = useCallback(() => {
    if (!canvas) return false;
    const activeObj = canvas.getActiveObject();
    return activeObj && activeObj.type === 'activeSelection';
  }, [canvas]);

  const canUngroup = useCallback(() => {
    if (!canvas) return false;
    const activeObj = canvas.getActiveObject();
    return activeObj && activeObj.type === 'group';
  }, [canvas]);

  return {
    discardSelection,
    groupSelection,
    ungroupSelection,
    canGroup,
    canUngroup,
  };
}