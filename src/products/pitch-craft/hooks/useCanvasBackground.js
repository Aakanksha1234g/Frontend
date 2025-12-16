// useCanvasBackground.js - Enhanced with proper background handling

import { useCallback } from 'react';
import { fabric } from 'fabric';
import { useCanvas } from '@products/pitch-craft/contexts/CanvasContext';

// Enhanced function to get canvas state with proper background handling
const getCanvasStateWithBackground = canvas => {
  if (!canvas) return null;

  // Get the full canvas state including background properties
  const canvasState = canvas.toJSON(['backgroundImage', 'backgroundColor']);

  // Store additional background info that might be lost during serialization
  const additionalBackgroundInfo = {
    backgroundImage: canvas.backgroundImage,
    backgroundColor: canvas.backgroundColor,
  };

  return JSON.stringify({
    ...canvasState,
    _additionalBackgroundInfo: additionalBackgroundInfo,
  });
};

// Hook for managing canvas background color
export function useCanvasBackgroundColor() {
  const { canvas, slides, setSlides, currentSlide, setIsLoadingSlide } =
    useCanvas();

  // Get current canvas state with background
  const getCurrentState = useCallback(() => {
    return getCanvasStateWithBackground(canvas);
  }, [canvas]);

  // Set background color with proper state management
  const setBackgroundColor = useCallback(
    color => {
      if (!canvas) return;

      // If a background image exists, remove it before setting color
      if (canvas.backgroundImage) {
        canvas.setBackgroundImage(null, () => {
          // Now set the background color
          canvas.setBackgroundColor(color, () => {
            canvas.renderAll();

            // Save the new state to current slide
            const newState = getCurrentState();
            if (newState) {
              setSlides(prevSlides => {
                const updatedSlides = [...prevSlides];
                if (updatedSlides[currentSlide]) {
                  updatedSlides[currentSlide].state = newState;

                  // Save to history
                  if (updatedSlides[currentSlide].history) {
                    updatedSlides[currentSlide].history.save(newState);
                  }
                }
                return updatedSlides;
              });
            }
          });
        });
        return;
      }

      // Set the background color (no image present)
      canvas.setBackgroundColor(color, () => {
        canvas.renderAll();

        // Save the new state to current slide
        const newState = getCurrentState();
        if (newState) {
          setSlides(prevSlides => {
            const updatedSlides = [...prevSlides];
            if (updatedSlides[currentSlide]) {
              updatedSlides[currentSlide].state = newState;

              // Save to history
              if (updatedSlides[currentSlide].history) {
                updatedSlides[currentSlide].history.save(newState);
              }
            }
            return updatedSlides;
          });
        }
      });
    },
    [canvas, getCurrentState, setSlides, currentSlide]
  );

  // Get current background color
  const getBackgroundColor = useCallback(() => {
    if (!canvas) return null;
    return canvas.backgroundColor;
  }, [canvas]);

  // Remove background color (set to transparent)
  const removeBackgroundColor = useCallback(() => {
    canvas.set('backgroundColor', 'transparent').requestRenderAll();
  }, [setBackgroundColor]);

  return {
    setBackgroundColor,
    getBackgroundColor,
    removeBackgroundColor,
  };
}

// Hook for managing canvas background image
export function useCanvasBackgroundImage() {
  const { canvas, slides, setSlides, currentSlide, setIsLoadingSlide } =
    useCanvas();

  // Get current canvas state with background
  const getCurrentState = useCallback(() => {
    return getCanvasStateWithBackground(canvas);
  }, [canvas]);

  // Set background image from URL with proper state management
  const setBackgroundImage = useCallback(
    (imageUrl, options = {}) => {
      if (!canvas) return;

      const {
        scaleMode = 'fill', // 'fill', 'fit', 'stretch', 'center', 'tile'
        opacity = 1,
        originX = 'center',
        originY = 'center',
      } = options;

      setIsLoadingSlide(true);

      // Create fabric image object
      fabric.Image.fromURL(
        imageUrl,
        img => {
          if (!img) {
            console.error('Failed to load background image');
            setIsLoadingSlide(false);
            return;
          }

          // Calculate scaling based on canvas dimensions
          const canvasWidth = canvas.width;
          const canvasHeight = canvas.height;
          const imageWidth = img.width;
          const imageHeight = img.height;

          let scaleX = 1;
          let scaleY = 1;

          switch (scaleMode) {
            case 'fill':
              scaleX = scaleY = Math.max(
                canvasWidth / imageWidth,
                canvasHeight / imageHeight
              );
              break;
            case 'fit':
              scaleX = scaleY = Math.min(
                canvasWidth / imageWidth,
                canvasHeight / imageHeight
              );
              break;
            case 'stretch':
              scaleX = canvasWidth / imageWidth;
              scaleY = canvasHeight / imageHeight;
              break;
            case 'center':
              scaleX = scaleY = 1;
              break;
            case 'tile':
              scaleX = scaleY = 1;
              break;
          }

          // Set image properties
          img.set({
            scaleX,
            scaleY,
            opacity,
            originX,
            originY,
            left: canvasWidth / 2,
            top: canvasHeight / 2,
            selectable: false,
            evented: false,
          });

          // Set as background image
          canvas.setBackgroundImage(img, () => {
            canvas.renderAll();

            // Save the new state to current slide
            const newState = getCurrentState();
            if (newState) {
              setSlides(prevSlides => {
                const updatedSlides = [...prevSlides];
                if (updatedSlides[currentSlide]) {
                  updatedSlides[currentSlide].state = newState;

                  // Save to history
                  if (updatedSlides[currentSlide].history) {
                    updatedSlides[currentSlide].history.save(newState);
                  }
                }
                return updatedSlides;
              });
            }

            setIsLoadingSlide(false);
          });
        },
        {
          // Add crossOrigin to handle CORS issues
          crossOrigin: 'anonymous',
        }
      );
    },
    [canvas, getCurrentState, setSlides, currentSlide, setIsLoadingSlide]
  );

  // Set background image from file input
  const setBackgroundImageFromFile = useCallback(
    (file, options = {}) => {
      if (!file || !canvas) return;

      const reader = new FileReader();
      reader.onload = e => {
        setBackgroundImage(e.target.result, options);
      };
      reader.readAsDataURL(file);
    },
    [setBackgroundImage]
  );

  // Get current background image
  const getBackgroundImage = useCallback(() => {
    if (!canvas) return null;
    return canvas.backgroundImage;
  }, [canvas]);

  // Remove background image
  const removeBackgroundImage = useCallback(() => {
    if (!canvas) return;

    canvas.setBackgroundImage(null, () => {
      canvas.renderAll();

      // Save the new state to current slide
      const newState = getCurrentState();
      if (newState) {
        setSlides(prevSlides => {
          const updatedSlides = [...prevSlides];
          if (updatedSlides[currentSlide]) {
            updatedSlides[currentSlide].state = newState;

            // Save to history
            if (updatedSlides[currentSlide].history) {
              updatedSlides[currentSlide].history.save(newState);
            }
          }
          return updatedSlides;
        });
      }
    });
  }, [canvas, getCurrentState, setSlides, currentSlide]);

  // Set background image with tiling pattern
  const setBackgroundImageTiled = useCallback(
    (imageUrl, options = {}) => {
      if (!canvas) return;

      const { opacity = 1 } = options;

      fabric.Image.fromURL(
        imageUrl,
        img => {
          if (!img) {
            console.error('Failed to load background image for tiling');
            return;
          }

          // Create pattern
          const pattern = new fabric.Pattern({
            source: img.getElement(),
            repeat: 'repeat',
            opacity,
          });

          canvas.setBackgroundColor(pattern, () => {
            canvas.renderAll();

            // Save the new state to current slide
            const newState = getCurrentState();
            if (newState) {
              setSlides(prevSlides => {
                const updatedSlides = [...prevSlides];
                if (updatedSlides[currentSlide]) {
                  updatedSlides[currentSlide].state = newState;

                  // Save to history
                  if (updatedSlides[currentSlide].history) {
                    updatedSlides[currentSlide].history.save(newState);
                  }
                }
                return updatedSlides;
              });
            }
          });
        },
        {
          crossOrigin: 'anonymous',
        }
      );
    },
    [canvas, getCurrentState, setSlides, currentSlide]
  );

  return {
    setBackgroundImage,
    setBackgroundImageFromFile,
    setBackgroundImageTiled,
    getBackgroundImage,
    removeBackgroundImage,
  };
}

// Combined hook for both background color and image
export function useCanvasBackground() {
  const backgroundColorHook = useCanvasBackgroundColor();
  const backgroundImageHook = useCanvasBackgroundImage();

  return {
    ...backgroundColorHook,
    ...backgroundImageHook,
  };
}

// Additional utility hook for background restoration
export function useBackgroundRestoration() {
  const { canvas } = useCanvas();

  const restoreBackgroundFromState = useCallback(
    state => {
      if (!canvas || !state) return;

      try {
        const parsedState = JSON.parse(state);
        const additionalInfo = parsedState._additionalBackgroundInfo;

        if (additionalInfo) {
          // Restore background color
          if (additionalInfo.backgroundColor && !canvas.backgroundColor) {
            canvas.setBackgroundColor(additionalInfo.backgroundColor, () => {
              canvas.renderAll();
            });
          }

          // Restore background image
          if (additionalInfo.backgroundImage && !canvas.backgroundImage) {
            canvas.setBackgroundImage(additionalInfo.backgroundImage, () => {
              canvas.renderAll();
            });
          }
        }
      } catch (error) {
        console.error('Error restoring background:', error);
      }
    },
    [canvas]
  );

  return {
    restoreBackgroundFromState,
  };
}
