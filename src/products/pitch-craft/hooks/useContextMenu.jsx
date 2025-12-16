import { useState, useEffect } from 'react';
import { useCanvas } from '@products/pitch-craft/contexts/CanvasContext';
import { useGroupActions } from './useGroupActions';
import { useLayerActions } from './useLayerActions';
import { useCommonActions } from './useCommonActions';

export function useContextMenu() {
  const [contextMenu, setContextMenu] = useState(null);
  const { canvas } = useCanvas() || {};

  const commonActions = useCommonActions() || {};
  const groupActions = useGroupActions() || {};
  const layerActions = useLayerActions() || {};

  useEffect(() => {
    if (!canvas) return;

    const handleRightClick = e => {
      e.preventDefault();
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        hasSelection: layerActions.hasActiveObject?.(),
        canGroupItems: groupActions.canGroup?.(),
        canUngroupItems: groupActions.canUngroup?.(),
        actions: {
          ...commonActions,
          ...groupActions,
          ...layerActions,
        },
      });
    };

    const hideMenu = () => setContextMenu(null);

    canvas.wrapperEl?.addEventListener('contextmenu', handleRightClick);
    document.addEventListener('click', hideMenu);

    return () => {
      canvas.wrapperEl?.removeEventListener('contextmenu', handleRightClick);
      document.removeEventListener('click', hideMenu);
    };
  }, [canvas, commonActions, groupActions, layerActions]);

  return { contextMenu, setContextMenu };
};
