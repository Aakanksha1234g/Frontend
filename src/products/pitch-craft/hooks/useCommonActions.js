import { useRef, useCallback } from 'react';
import { fabric } from 'fabric';
import { useCanvas } from '@products/pitch-craft/contexts/CanvasContext';

export function useCommonActions() {
  const { canvas } = useCanvas();
  const clipboardRef = useRef(null);

  /** Helper: get current active object */
  const getActive = useCallback(() => {
    return canvas ? canvas.getActiveObject() : null;
  }, [canvas]);

  /** Change opacity of selected object */
  const changeOpacity = useCallback(
    opacity => {
      if (!canvas) return;
      const active = getActive();
      if (!active) return;

      active.set('opacity', opacity);
      canvas.requestRenderAll();
    },
    [canvas, getActive]
  );

  /** Change fill color of selected object */
  const changeColor = useCallback(
    color => {
      if (!canvas) return;
      const active = getActive();
      if (!active) return;

      if (
        active.type === 'activeSelection' ||
        active instanceof fabric.ActiveSelection
      ) {
        active.forEachObject(obj => {
          if ('fill' in obj) obj.set('fill', color);
        });
      } else if ('fill' in active) {
        active.set('fill', color);
      }

      canvas.requestRenderAll();
    },
    [canvas, getActive]
  );

  /** Copy selection to clipboard */
  const copySelection = useCallback(() => {
    if (!canvas) return;
    const active = getActive();
    if (!active) return;

    const clonePromise = new Promise(resolve => {
      active.clone(cloned => resolve(cloned), ['_id']);
    });

    clonePromise
      .then(cloned => {
        clipboardRef.current = cloned;
      })
      .catch(err => console.error('Copy failed:', err));
  }, [canvas, getActive]);

  /** Paste from clipboard */
  const pasteClipboard = useCallback(async () => {
    if (!canvas || !clipboardRef.current) return;

    const clip = clipboardRef.current;

    const clonedObj = await new Promise(resolve => {
      clip.clone(cloned => resolve(cloned), ['_id']);
    });

    canvas.discardActiveObject();
    clonedObj.set({
      left: (clonedObj.left ?? 0) + 10,
      top: (clonedObj.top ?? 0) + 10,
      evented: true,
    });

    if (
      clonedObj.type === 'activeSelection' ||
      clonedObj instanceof fabric.ActiveSelection
    ) {
      clonedObj.canvas = canvas;
      clonedObj.forEachObject(obj => canvas.add(obj));
      clonedObj.setCoords();
    } else {
      canvas.add(clonedObj);
    }

    if (clip.left != null) clip.left += 10;
    if (clip.top != null) clip.top += 10;

    canvas.setActiveObject(clonedObj);
    canvas.requestRenderAll();
  }, [canvas]);

  const deleteSelection = useCallback(() => {
    if (!canvas) return;
    const activeObj = canvas.getActiveObject();
    canvas.remove(activeObj);
    canvas.renderAll();
  }, [canvas]);

  return {
    changeOpacity,
    changeColor,
    copySelection,
    pasteClipboard,
    deleteSelection,
  };
}
