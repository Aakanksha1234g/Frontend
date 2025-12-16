// useSlideActions.js - Fixed undo/redo after slide navigation

import { useCallback, useRef, useEffect } from 'react';
import { useCanvas } from '@products/pitch-craft/contexts/CanvasContext';
import { HistoryManager } from '@products/pitch-craft/utils/fabric-history';
import { castSlideTemplate } from '@products/pitch-craft/utils/createCastSlideTemplate';

export function useSlideActions() {
  const {
    canvas,
    slides,
    setSlides,
    currentSlide,
    setCurrentSlide,
    isLoadingSlide,
    setIsLoadingSlide,
  } = useCanvas();

  const slidesRef = useRef(slides);
  const currentSlideRef = useRef(currentSlide);
  const isLoadingSlideRef = useRef(isLoadingSlide);
  // console.log(slides)

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

  // Helper function to get current canvas state with proper background handling
  const getCurrentState = useCallback(() => {
    if (!canvas) return null;

    // Get the full canvas state including background properties
    const canvasState = canvas.toJSON(['backgroundImage', 'backgroundColor']);

    // Store additional background info that might be lost
    const additionalBackgroundInfo = {
      backgroundImage: canvas.backgroundImage,
      backgroundColor: canvas.backgroundColor,
    };

    return JSON.stringify({
      ...canvasState,
      _additionalBackgroundInfo: additionalBackgroundInfo,
    });
  }, [canvas]);

  // Enhanced load state function with proper background handling
  const loadState = useCallback(
    (state, callback) => {
      if (!canvas || !state) return;

      setIsLoadingSlide(true);

      try {
        const parsedState = JSON.parse(state);
        const additionalInfo = parsedState._additionalBackgroundInfo;

        // Remove our additional info before passing to fabric
        delete parsedState._additionalBackgroundInfo;

        canvas.loadFromJSON(parsedState, () => {
          // Handle background restoration if needed
          if (additionalInfo) {
            // Restore background color if it exists and wasn't properly loaded
            if (additionalInfo.backgroundColor && !canvas.backgroundColor) {
              canvas.setBackgroundColor(additionalInfo.backgroundColor, () => {
                canvas.renderAll();
              });
            }

            // Restore background image if it exists and wasn't properly loaded
            if (additionalInfo.backgroundImage && !canvas.backgroundImage) {
              canvas.setBackgroundImage(additionalInfo.backgroundImage, () => {
                canvas.renderAll();
              });
            }
          }

          // Ensure everything is rendered
          canvas.renderAll();
          setIsLoadingSlide(false);
          if (callback) callback();
        });
      } catch (error) {
        console.error('Error loading canvas state:', error);
        setIsLoadingSlide(false);
        if (callback) callback();
      }
    },
    [canvas, setIsLoadingSlide]
  );

  // Helper function to create empty canvas state without manipulating current canvas
  const createEmptyCanvasState = useCallback(() => {
    if (!canvas) return null;

    // Create a minimal empty state with background preserved
    const emptyState = {
      version: canvas.version || '5.3.0',
      objects: [],
      backgroundImage: canvas.backgroundImage,
      backgroundColor: canvas.backgroundColor,
      _additionalBackgroundInfo: {
        backgroundImage: canvas.backgroundImage,
        backgroundColor: canvas.backgroundColor,
      },
    };

    return JSON.stringify(emptyState);
  }, [canvas]);

  const switchSlide = useCallback(
  (index, customSlides = null) => {

    if (!canvas) {
      console.warn('No canvas available for switching slide');
      console.groupEnd();
      return;
    }

    // Prevent switching if already loading
    if (isLoadingSlideRef.current) {
      console.warn('Cannot switch slide: already loading');
      return;
    }

    const allSlides = customSlides || slidesRef.current;
    const currentSlideIndex = currentSlideRef.current;

    // Don't switch if we're already on the target slide
    if (index === currentSlideIndex && !customSlides) {
      console.log('Already on target slide — skipping switch');
      console.groupEnd();
      return;
    }

    console.log(`Switching from slide ${currentSlideIndex} to ${index}`);

    // Save current slide state before switching
    if (!isLoadingSlideRef.current && allSlides[currentSlideIndex]) {
      console.log('Saving current slide state before switching...');
      const currentState = getCurrentState();
      console.log(currentState);
      if (currentState) {
        allSlides[currentSlideIndex].state = currentState;
        allSlides[currentSlideIndex].history.save(currentState);
      } else {
        console.warn('No state found for current slide — skipping save');
      }
    } else {
      console.warn('Current slide not found or currently loading — skipping save');
    }

    // Begin switching process
    setIsLoadingSlide(true);
    setCurrentSlide(index);

    const targetSlide = allSlides[index];

    // Load existing or create new state
    if (targetSlide && targetSlide.state) {
      console.log('Found existing slide state — loading...');
      loadState(targetSlide.state, () => {
        console.log('Slide loaded successfully');
      });
    } else {
      console.log('No existing state found — creating new empty slide...');
      const emptyState = createEmptyCanvasState();

      if (emptyState && targetSlide) {
        targetSlide.state = emptyState;
        targetSlide.history.save(emptyState);
        setSlides([...allSlides]);

        loadState(emptyState, () => {
          console.log('Empty slide loaded successfully');
        });
      } else {
        console.warn('Failed to create or assign empty slide');
        setIsLoadingSlide(false);
      }
    }
  },
  [
    canvas,
    getCurrentState,
    loadState,
    createEmptyCanvasState,
    setCurrentSlide,
    setIsLoadingSlide,
    setSlides,
  ]
);


  // Add to your useSlideActions.js
const addCastSlide = useCallback((insertId) => {
  if (!canvas || isLoadingSlideRef.current) {
    console.warn('[addCastSlide] Aborted — canvas unavailable or loading');
    return;
  }

  const castData = {
    characterName: '',
    actorName: '',
    role: '',
    gender: '',
    height: '',
    weight: '',
    age: '22',
    description: '',
    imageUrl: '',
  }

  const currentSlideIndex = currentSlideRef.current;
  const currentSlides = slidesRef.current;

  // Save current slide before adding new one
  if (currentSlides[currentSlideIndex]) {
    const currentState = getCurrentState();
    if (currentState) {
      currentSlides[currentSlideIndex].state = currentState;
      currentSlides[currentSlideIndex].history.save(currentState);
    }
  }

  try {
    const castArray = Array.isArray(castData) ? castData : [castData];

    // Ensure insertId is numeric
    const slide_id = Number.isFinite(insertId) ? insertId : 0;

    const slideData = castSlideTemplate.createSlideFunction({
      idx: slide_id,
      slide_type: 'cast',
      cast: castArray,
    });

    const castState = slideData.json;

    const newSlide = {
      slide_id, 
      slide_type: 'cast',
      castData: castArray,
      history: new HistoryManager(),
      state: castState,
      visual_prompt: "",
      hasContent: true,
    };

    newSlide.history.save(castState);

    const updatedSlides = [...currentSlides, newSlide];
    setSlides(updatedSlides);

    const newSlideIndex = updatedSlides.length - 1;
    switchSlide(newSlideIndex, updatedSlides);

  } catch (error) {
    console.error('[addCastSlide] Error creating or adding slide:', error);
  }
}, [canvas, getCurrentState, setSlides, switchSlide]);

  const deleteSlide = useCallback(
    index => {
      if (isLoadingSlideRef.current) {
        console.log('Cannot delete slide: loading in progress');
        return;
      }

      console.log(`Deleting slide at index ${index}`);

      const currentSlides = slidesRef.current;

      if (currentSlides.length <= 1) {
        console.log('Cannot delete the last slide');
        return;
      }

      const updatedSlides = currentSlides.filter((_, i) => i !== index);
      setSlides(updatedSlides);

      // Adjust current slide index if necessary
      const currentSlideIndex = currentSlideRef.current;
      if (index === currentSlideIndex) {
        // If we're deleting the current slide, switch to the previous one or the first one
        const newIndex = index > 0 ? index - 1 : 0;
        switchSlide(newIndex, updatedSlides);
      } else if (index < currentSlideIndex) {
        // If we're deleting a slide before the current one, adjust the index
        setCurrentSlide(currentSlideIndex - 1);
      }
    },
    [setSlides, switchSlide, setCurrentSlide]
  );

  const duplicateSlide = useCallback(
    index => {
      if (isLoadingSlideRef.current) {
        console.log('Cannot duplicate slide: loading in progress');
        return;
      }

      const currentSlides = slidesRef.current;
      const slideToDuplicate = currentSlides[index];

      if (!slideToDuplicate) {
        console.log('Slide to duplicate not found');
        return;
      }

      // Create a copy of the slide
      const duplicatedSlide = {
        history: new HistoryManager(),
        state: slideToDuplicate.state,
      };

      // Initialize history with the duplicated state
      if (slideToDuplicate.state) {
        duplicatedSlide.history.save(slideToDuplicate.state);
      }

      // Insert the duplicated slide after the original
      const updatedSlides = [
        ...currentSlides.slice(0, index + 1),
        duplicatedSlide,
        ...currentSlides.slice(index + 1),
      ];

      setSlides(updatedSlides);

      // Switch to the duplicated slide
      switchSlide(index + 1, updatedSlides);
    },
    [setSlides, switchSlide]
  );

  const updateSlide = useCallback((slideId, updatedData) => {
  setSlides(prevSlides => {
    const newSlides = prevSlides.map(slide => {
      if (slide.slide_id === slideId) {
        return { ...slide, ...updatedData };
      }
      return slide;
    });
    return newSlides;
  });
}, [setSlides]);


  return {
    addCastSlide,
    switchSlide,
    deleteSlide,
    duplicateSlide,
    updateSlide,
  };
}