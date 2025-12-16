import { useCallback, useRef, useEffect } from 'react';
import { useCanvas } from '@products/pitch-craft/contexts/CanvasContext';

export function useHistoryActions() {
  const {
    canvas,
    slides,
    setSlides,
    currentSlide,
    isLoadingSlide,
    setIsLoadingSlide,
  } = useCanvas();

  const slidesRef = useRef(slides);
  const currentSlideRef = useRef(currentSlide);
  const isLoadingSlideRef = useRef(isLoadingSlide);
  const canvasRef = useRef(canvas);
  const initializationTimeoutRef = useRef(null);

  // Update refs when state changes
  useEffect(() => {
    slidesRef.current = slides;
  }, [slides]);

  useEffect(() => {
    currentSlideRef.current = currentSlide;
  }, [currentSlide]);

  useEffect(() => {
    isLoadingSlideRef.current = isLoadingSlide;
  }, [isLoadingSlide]);

  useEffect(() => {
    canvasRef.current = canvas;
  }, [canvas]);

  // Helper function to get current canvas state with proper background handling
  const getCurrentState = useCallback(() => {
    const currentCanvas = canvasRef.current;
    if (!currentCanvas) return null;

    const canvasState = currentCanvas.toJSON([
      'backgroundImage',
      'backgroundColor',
    ]);

    const additionalBackgroundInfo = {
      backgroundImage: currentCanvas.backgroundImage,
      backgroundColor: currentCanvas.backgroundColor,
    };

    return JSON.stringify({
      ...canvasState,
      _additionalBackgroundInfo: additionalBackgroundInfo,
    });
  }, []);

  // Enhanced load state function with proper background handling
  const loadState = useCallback((state, callback) => {
    const currentCanvas = canvasRef.current;
    if (!currentCanvas || !state) return;

    try {
      const parsedState = JSON.parse(state);
      const additionalInfo = parsedState._additionalBackgroundInfo;

      delete parsedState._additionalBackgroundInfo;

      currentCanvas.loadFromJSON(parsedState, () => {
        if (additionalInfo) {
          if (
            additionalInfo.backgroundColor &&
            !currentCanvas.backgroundColor
          ) {
            currentCanvas.setBackgroundColor(
              additionalInfo.backgroundColor,
              () => {
                currentCanvas.renderAll();
              }
            );
          }

          if (
            additionalInfo.backgroundImage &&
            !currentCanvas.backgroundImage
          ) {
            currentCanvas.setBackgroundImage(
              additionalInfo.backgroundImage,
              () => {
                currentCanvas.renderAll();
              }
            );
          }
        }

        currentCanvas.renderAll();
        if (callback) callback();
      });
    } catch (error) {
      console.error('Error loading state:', error);
      if (callback) callback();
    }
  }, []);

  // Initialize history for current slide - MORE CAREFUL APPROACH
  const initializeSlideHistory = useCallback(() => {
    const currentCanvas = canvasRef.current;
    if (!currentCanvas || isLoadingSlideRef.current) return;

    const currentSlideIndex = currentSlideRef.current;
    const currentSlides = slidesRef.current;

    if (
      !currentSlides[currentSlideIndex] ||
      !currentSlides[currentSlideIndex].history
    ) {
      return;
    }

    const history = currentSlides[currentSlideIndex].history;

    // CRITICAL: Only initialize if history is completely uninitialized
    if (!history.isInitialized()) {
      const currentState = getCurrentState();
      if (currentState) {
        console.log('Initializing history for slide', currentSlideIndex);
        history.initialize(currentState);

        // Update the stored state to match
        const updatedSlides = [...currentSlides];
        updatedSlides[currentSlideIndex].state = currentState;
        setSlides(updatedSlides);
      }
    }
  }, [getCurrentState, setSlides]);

  // Save history when canvas changes - IMPROVED VERSION
  const saveHistory = useCallback(() => {
    const currentCanvas = canvasRef.current;
    if (!currentCanvas || isLoadingSlideRef.current) return;

    const state = getCurrentState();
    if (!state) return;

    const currentSlideIndex = currentSlideRef.current;
    const currentSlides = slidesRef.current;

    if (
      currentSlides[currentSlideIndex] &&
      currentSlides[currentSlideIndex].history
    ) {
      const history = currentSlides[currentSlideIndex].history;
      const lastState = currentSlides[currentSlideIndex].state;

      // Only save if state has actually changed
      if (lastState !== state) {
        console.log('State changed, saving to history');
        history.save(state);

        // Update stored state
        const updatedSlides = [...currentSlides];
        updatedSlides[currentSlideIndex].state = state;
        setSlides(updatedSlides);
      }
    }
  }, [getCurrentState, setSlides]);

  const undo = useCallback(() => {
    console.log('Undo triggered');
    const currentCanvas = canvasRef.current;
    if (!currentCanvas) {
      console.log('No canvas for undo');
      return;
    }

    const currentSlideIndex = currentSlideRef.current;
    const currentSlides = slidesRef.current;

    if (
      currentSlides[currentSlideIndex] &&
      currentSlides[currentSlideIndex].history
    ) {
      const history = currentSlides[currentSlideIndex].history;
      console.log('Before undo:', history.getStateInfo());

      const prev = history.undo();
      console.log('After undo:', history.getStateInfo());

      if (prev) {
        setIsLoadingSlide(true);
        loadState(prev, () => {
          // Update the stored state to match the history
          const updatedSlides = [...slidesRef.current];
          updatedSlides[currentSlideRef.current].state = prev;
          setSlides(updatedSlides);
          setIsLoadingSlide(false);
        });
      } else {
        console.log('No previous state available for undo');
      }
    }
  }, [loadState, setSlides, setIsLoadingSlide]);

  const redo = useCallback(() => {
    console.log('Redo triggered');
    const currentCanvas = canvasRef.current;
    if (!currentCanvas) {
      console.log('No canvas for redo');
      return;
    }

    const currentSlideIndex = currentSlideRef.current;
    const currentSlides = slidesRef.current;

    if (
      currentSlides[currentSlideIndex] &&
      currentSlides[currentSlideIndex].history
    ) {
      const history = currentSlides[currentSlideIndex].history;
      console.log('Before redo:', history.getStateInfo());

      const next = history.redo();
      console.log('After redo:', history.getStateInfo());

      if (next) {
        setIsLoadingSlide(true);
        loadState(next, () => {
          // Update the stored state to match the history
          const updatedSlides = [...slidesRef.current];
          updatedSlides[currentSlideRef.current].state = next;
          setSlides(updatedSlides);
          setIsLoadingSlide(false);
        });
      } else {
        console.log('No next state available for redo');
      }
    }
  }, [loadState, setSlides, setIsLoadingSlide]);

  const canUndo = useCallback(() => {
    const currentSlideIndex = currentSlideRef.current;
    const currentSlides = slidesRef.current;
    return currentSlides[currentSlideIndex]?.history?.canUndo() || false;
  }, []);

  const canRedo = useCallback(() => {
    const currentSlideIndex = currentSlideRef.current;
    const currentSlides = slidesRef.current;
    return currentSlides[currentSlideIndex]?.history?.canRedo() || false;
  }, []);

  // Auto-initialize history when slide changes - DEBOUNCED AND SAFER
  useEffect(() => {
    if (canvas && !isLoadingSlide) {
      // Clear any existing timeout
      if (initializationTimeoutRef.current) {
        clearTimeout(initializationTimeoutRef.current);
      }

      // Debounce initialization to prevent race conditions
      initializationTimeoutRef.current = setTimeout(() => {
        initializeSlideHistory();
      }, 150); // Slightly longer delay to ensure canvas is fully ready

      return () => {
        if (initializationTimeoutRef.current) {
          clearTimeout(initializationTimeoutRef.current);
        }
      };
    }
  }, [currentSlide, canvas, isLoadingSlide, initializeSlideHistory]);

  return {
    undo,
    redo,
    saveHistory,
    canUndo,
    canRedo,
    initializeSlideHistory,
  };
}
