// useKeyboardShortcuts.js
import { useEffect } from 'react';
import { fabric } from 'fabric';
import { useTextActions } from './useTextActions';
import { useImageActions } from './useImageActions';
import { useGroupActions } from './useGroupActions';
import { useLayerActions } from './useLayerActions';
import { useHistoryActions } from './useHistoryActions';
import { useSlideActions } from './useSlideActions';
import { useCommonActions } from './useCommonActions';
import { useCanvas } from '@products/pitch-craft/contexts/CanvasContext';

export function useKeyboardShortcuts() {
  const {
    isPresenting,
    slideshowIndex,
    setSlideshowIndex,
    slides,
    canvas,
    currentSlide,
  } = useCanvas();

  useEffect(() => {
    const handleKeyDown = event => {
      if (!isPresenting) return;

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        setSlideshowIndex(
          slideshowIndex === 0 ? slides.length - 1 : slideshowIndex - 1
        );
      }
      if (event.key === 'ArrowRight' || event.key === 'Enter') {
        event.preventDefault();
        setSlideshowIndex(
          slideshowIndex === slides.length - 1 ? 0 : slideshowIndex + 1
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPresenting, slideshowIndex, slides, setSlideshowIndex]);


  // hooks that expose actions
  const textActions = useTextActions() || {};
  const groupActions = useGroupActions() || {};
  const slideActions = useSlideActions() || {};
  const historyActions = useHistoryActions() || {};
  const layerActions = useLayerActions() || {};
  const commonActions = useCommonActions() || {};

  // Destructure functions (they may be undefined; we check before calling)
  const {
    addText,
    changeTextColor,
    changeTextFontSize,
    changeTextFontFamily,
    lineHeight,
    letterSpacing,
    setUnderline,
    setStrikeThrough,
    setBold,
    setItalic,
    setTextAlign,
  } = textActions;

  const {
    discardSelection,
    groupSelection,
    ungroupSelection,
    canGroup,
    canUngroup,
  } = groupActions;

  const { addSlide, switchSlide, deleteSlide, duplicateSlide } = slideActions;

  const { undo, redo, saveHistory, canUndo, canRedo } = historyActions;

  const {
    bringForward,
    bringToFront,
    sendBackward,
    sendToBack,
    hasActiveObject,
  } = layerActions;

  const { copySelection, pasteClipboard, deleteSelection } = commonActions;

  useEffect(() => {
    if (!canvas) return;

    const isTypingTarget = target =>
      !target
        ? false
        : target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable === true;

    const handleKeyDown = event => {
      // ignore when typing in inputs / editable regions
      if (isTypingTarget(event.target)) return;

      const { key, code, ctrlKey, metaKey, shiftKey } = event;
      const isCtrlOrCmd = ctrlKey || metaKey;
      const keyLower = typeof key === 'string' ? key.toLowerCase() : key;

      // debug (remove in production)
      // console.debug('ks:', { key, code, ctrlKey, metaKey, shiftKey });

      // HELPERS
      const hasSelection =
        typeof hasActiveObject === 'function' ? hasActiveObject() : false;

      // ===== GLOBAL SHORTCUTS =====
      // Save: Ctrl/Cmd+S
      if (isCtrlOrCmd && keyLower === 's') {
        event.preventDefault();
        if (typeof saveHistory === 'function') saveHistory();
        return;
      }

      // Cut: Ctrl/Cmd+X
      if (isCtrlOrCmd && keyLower === 'x') {
        event.preventDefault();
        if (hasSelection) {
          if (typeof copySelection === 'function') copySelection();
          if (typeof deleteSelection === 'function') deleteSelection();
          if (typeof saveHistory === 'function') saveHistory();
        }
        return;
      }

      // Copy: Ctrl/Cmd+C
      if (isCtrlOrCmd && keyLower === 'c') {
        event.preventDefault();
        if (typeof copySelection === 'function') copySelection();
        return;
      }

      // Paste: Ctrl/Cmd+V
      if (isCtrlOrCmd && keyLower === 'v') {
        event.preventDefault();
        if (typeof pasteClipboard === 'function') {
          pasteClipboard();
          if (typeof saveHistory === 'function') saveHistory();
        }
        return;
      }

      // Duplicate: Ctrl/Cmd+D
      if (isCtrlOrCmd && keyLower === 'd') {
        event.preventDefault();
        if (typeof duplicateSlide === 'function') {
          // duplicate selected object or slide depending on your app semantics
          duplicateSlide();
          if (typeof saveHistory === 'function') saveHistory();
        }
        return;
      }

      // Undo: Ctrl/Cmd+Z (without Shift)
      if (isCtrlOrCmd && keyLower === 'z' && !shiftKey) {
        event.preventDefault();
        if (typeof canUndo === 'function' ? canUndo() : true) {
          typeof undo === 'function' && undo();
        }
        return;
      }

      // Redo: Ctrl/Cmd+Y OR Ctrl/Cmd+Shift+Z
      if (isCtrlOrCmd && (keyLower === 'y' || (shiftKey && keyLower === 'z'))) {
        event.preventDefault();
        if (typeof canRedo === 'function' ? canRedo() : true) {
          typeof redo === 'function' && redo();
        }
        return;
      }

      // Bold/Italic/Underline for selected text box
      if (isCtrlOrCmd && keyLower === 'b') {
        event.preventDefault();
        if (hasSelection && typeof setBold === 'function') {
          setBold(); // toggle implementation should be handled inside hook
          if (typeof saveHistory === 'function') saveHistory();
        }
        return;
      }

      if (isCtrlOrCmd && keyLower === 'i') {
        event.preventDefault();
        if (hasSelection && typeof setItalic === 'function') {
          setItalic();
          if (typeof saveHistory === 'function') saveHistory();
        }
        return;
      }

      // Ctrl+U - Underline
      if (isCtrlOrCmd && keyLower === 'u') {
        event.preventDefault();
        if (hasSelection && canvas) {
          const activeObject = canvas.getActiveObject();
          if (
            activeObject &&
            (activeObject.type === 'textbox' || activeObject.type === 'text')
          ) {
            const currentUnderline = !!activeObject.underline;
            // Toggle underline
            if (typeof setUnderline === 'function') {
              setUnderline(!currentUnderline); // explicitly pass the new value
            } else {
              // fallback if hook doesn't expose setter
              activeObject.set('underline', !currentUnderline);
              canvas.renderAll();
            }
            if (typeof saveHistory === 'function') saveHistory();
          }
        }
        return;
      }

      // Insert new slide: Ctrl/Cmd+M
      if (isCtrlOrCmd && keyLower === 'm') {
        event.preventDefault();
        if (typeof addSlide === 'function') addSlide();
        return;
      }

      // Select all: Ctrl/Cmd+A
      if (isCtrlOrCmd && keyLower === 'a') {
        event.preventDefault();
        if (canvas) {
          const allObjects = canvas.getObjects();
          if (allObjects.length > 0) {
            if (allObjects.length === 1) {
              canvas.setActiveObject(allObjects[0]);
            } else {
              const sel = new fabric.ActiveSelection(allObjects, { canvas });
              canvas.setActiveObject(sel);
            }
            canvas.renderAll();
          }
        }
        return;
      }

      // Delete selected object(s)
      if (key === 'Delete' || key === 'Backspace') {
        // don't prevent default if inside contenteditable fields (we already filtered above)
        event.preventDefault();
        if (hasSelection && typeof deleteSelection === 'function') {
          deleteSelection();
          if (typeof saveHistory === 'function') saveHistory();
        }
        return;
      }

      // ===== SLIDE NAVIGATION =====
      if (key === 'PageUp') {
        event.preventDefault();
        if (typeof switchSlide === 'function' && currentSlide > 0)
          switchSlide(currentSlide - 1);
        return;
      }
      if (key === 'PageDown') {
        event.preventDefault();
        if (
          typeof switchSlide === 'function' &&
          currentSlide < slides?.length - 1
        )
          switchSlide(currentSlide + 1);
        return;
      }
      if (key === 'Home') {
        event.preventDefault();
        if (typeof switchSlide === 'function') switchSlide(0);
        return;
      }
      if (key === 'End') {
        event.preventDefault();
        if (typeof switchSlide === 'function') switchSlide(slides.length - 1);
        return;
      }

      // ===== LAYER ORDER (use event.code for bracket keys so shift doesn't change detection) =====
      // Bring Forward: Ctrl/Cmd + ]
      if (isCtrlOrCmd && code === 'BracketRight' && !shiftKey) {
        event.preventDefault();
        if (typeof bringForward === 'function') bringForward();
        return;
      }
      // Bring To Front: Ctrl/Cmd + Shift + ]
      if (isCtrlOrCmd && code === 'BracketRight' && shiftKey) {
        event.preventDefault();
        if (typeof bringToFront === 'function') bringToFront();
        return;
      }
      // Send Backward: Ctrl/Cmd + [
      if (isCtrlOrCmd && code === 'BracketLeft' && !shiftKey) {
        event.preventDefault();
        if (typeof sendBackward === 'function') sendBackward();
        return;
      }
      // Send To Back: Ctrl/Cmd + Shift + [
      if (isCtrlOrCmd && code === 'BracketLeft' && shiftKey) {
        event.preventDefault();
        if (typeof sendToBack === 'function') sendToBack();
        return;
      }

      // Fallback: do nothing
    };

    // Prefer window to document for global shortcuts
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    // include everything that handler uses so closure sees latest functions
    canvas,
    slides,
    currentSlide,
    // text actions
    setBold,
    setItalic,
    setUnderline,
    // group actions
    groupSelection,
    ungroupSelection,
    canGroup,
    canUngroup,
    // slide actions
    addSlide,
    switchSlide,
    deleteSlide,
    duplicateSlide,
    // history
    undo,
    redo,
    saveHistory,
    canUndo,
    canRedo,
    // layer actions
    bringForward,
    bringToFront,
    sendBackward,
    sendToBack,
    hasActiveObject,
    // common actions
    copySelection,
    pasteClipboard,
    deleteSelection,
  ]);

  return null;
}
