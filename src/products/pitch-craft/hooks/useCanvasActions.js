import { useEffect, useRef, useCallback } from 'react';
import { useCanvas } from '@products/pitch-craft/contexts/CanvasContext';
import { useTextActions } from './useTextActions';
import { useShapeActions } from './useShapeActions';
import { useImageActions } from './useImageActions';
import { useGroupActions } from './useGroupActions';
import { useLayerActions } from './useLayerActions';
import { useHistoryActions } from './useHistoryActions';
import { useSlideActions } from './useSlideActions';

export function useCanvasActions() {
  const { canvas, isLoadingSlide, currentSlide } = useCanvas();
  const setupDoneRef = useRef(false);
  const lastSlideRef = useRef(currentSlide);
  const eventListenersRef = useRef([]);

  // Get all action hooks
  const textActions = useTextActions();
  const shapeActions = useShapeActions();
  const imageActions = useImageActions();
  const groupActions = useGroupActions();
  const layerActions = useLayerActions();
  const historyActions = useHistoryActions();
  const slideActions = useSlideActions();

  // Stable reference to save history function
  const saveHistoryStable = useCallback(() => {
    if (!isLoadingSlide) {
      historyActions.saveHistory();
    }
  }, [historyActions.saveHistory, isLoadingSlide]);

  // Clean up existing event listeners
  const cleanupEventListeners = useCallback(() => {
    if (canvas && eventListenersRef.current.length > 0) {
      eventListenersRef.current.forEach(({ event, handler }) => {
        canvas.off(event, handler);
      });
      eventListenersRef.current = [];
    }
  }, [canvas]);

  // Add this effect instead of directly calling canvas.on()
  useEffect(() => {
    if (!canvas) return; // Wait until canvas is initialized

    const handleScaling = (e) => {
      const obj = e.target;
      if (obj && obj.type === "textbox") {
        obj.set({
          scaleY: 1, // cancel vertical scaling
          height: obj.height, // restore fixed height
          width: obj.width * obj.scaleX, // keep width scaling
          scaleX: 1,
        });
      }
    };

    canvas.on("object:scaling", handleScaling);
    console.log("Added textbox scaling control listener");

    return () => {
      canvas.off("object:scaling", handleScaling);
      console.log("Removed textbox scaling control listener");
    };
  }, [canvas]);


  // Track slide changes and reset setup
  useEffect(() => {
    if (lastSlideRef.current !== currentSlide) {
      console.log(
        'Slide changed from',
        lastSlideRef.current,
        'to',
        currentSlide
      );
      lastSlideRef.current = currentSlide;
      setupDoneRef.current = false;
      // Clean up previous listeners when slide changes
      cleanupEventListeners();
    }
  }, [currentSlide, cleanupEventListeners]);

  // Setup canvas event listeners for history tracking
  useEffect(() => {
    if (!canvas || setupDoneRef.current || isLoadingSlide) return;

    console.log('Setting up canvas event listeners for slide', currentSlide);

    // Create a debounced handler to prevent too many saves
    let saveTimeout;
    const debouncedSaveHistory = () => {
      if (saveTimeout) clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        if (!isLoadingSlide) {
          console.log('Canvas changed, saving history (debounced)');
          historyActions.saveHistory();
        }
      }, 100); // 100ms debounce
    };

    // Clean up any existing listeners first
    cleanupEventListeners();

    // Define events and handlers
    const events = [
      'object:added',
      'object:modified',
      'object:removed',
      'path:created', // For drawing paths
      'selection:created',
      'selection:updated',
      'selection:cleared',
    ];

    // Add new listeners and track them
    events.forEach(event => {
      canvas.on(event, debouncedSaveHistory);
      eventListenersRef.current.push({ event, handler: debouncedSaveHistory });
    });

    setupDoneRef.current = true;

    // Cleanup function
    return () => {
      console.log('Cleaning up canvas event listeners');
      if (saveTimeout) clearTimeout(saveTimeout);
      cleanupEventListeners();
      setupDoneRef.current = false;
    };
  }, [
    canvas,
    currentSlide,
    isLoadingSlide,
    historyActions.saveHistory,
    cleanupEventListeners,
  ]);

  // Initialize history for new slide - only once per slide change
  useEffect(() => {
    if (canvas && !isLoadingSlide && setupDoneRef.current) {
      // Add a delay to ensure canvas is fully loaded
      const timer = setTimeout(() => {
        console.log('Initializing history for slide', currentSlide);
        historyActions.initializeSlideHistory();
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [
    currentSlide,
    canvas,
    isLoadingSlide,
    historyActions.initializeSlideHistory,
  ]);

  return {
    // Text actions
    ...textActions,

    // Shape actions
    ...shapeActions,

    // Image actions
    ...imageActions,

    // Group actions
    ...groupActions,

    // Layer actions
    ...layerActions,

    // History actions
    ...historyActions,

    // Slide actions
    ...slideActions,
  };
}
