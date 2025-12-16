import { createContext, useContext, useRef, useState, useEffect } from 'react';
import { fabric } from 'fabric';
import { HistoryManager } from '@products/pitch-craft/utils/fabric-history';
// import { AligningGuidelines } from '@products/pitch-craft/utils/aligning-guidelines';

const CanvasContext = createContext();

export function useCanvas() {
  return useContext(CanvasContext);
}

export default function CanvasProvider({ children }) {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoadingSlide, setIsLoadingSlide] = useState(false);
  const [canvasDimensions, setCanvasDimensions] = useState({
    width: 1344,
    height: 768,
  });
  const [title, setTitle] = useState();
  const [isPresenting, setIsPresenting] = useState(false);
  const [slideshowIndex, setSlideshowIndex] = useState(0);
  const [showRegenerate, setShowRegenerate] = useState(true);

  useEffect(() => {
    if (!canvas || !slides.length) return;

    const current = slides[currentSlide];
    if (!current?.state) return;

    try {
      const json = JSON.parse(current.state);
      const currentImage = canvas.getObjects().find(o => o.type === 'image');
      const newImageSrc = json.objects?.find(o => o.type === 'image')?.src;

      if (currentImage && newImageSrc && currentImage.getSrc() !== newImageSrc) {
        console.log('🖼️ Detected new image src — reloading canvas');
        canvas.clear();
        canvas.loadFromJSON(json, () => canvas.renderAll());
      }
    } catch (err) {
      console.error('Error parsing or updating canvas:', err);
    }
  }, [slides, currentSlide, canvas]);

  useEffect(() => {
    const wrapper = document.getElementById('canvas-wrapper');
    if (!wrapper) return;

    // 16:9 aspect ratio canvas
    const aspectRatio = 16 / 9;

    const calculateCanvasSize = () => {
      const wrapper = document.getElementById('canvas-wrapper');
      const wrapperRect = wrapper.getBoundingClientRect();

      let width = wrapperRect.width;
      let height = width / aspectRatio;

      if (height > wrapperRect.height - 50) { // padding
        height = wrapperRect.height - 50;
        width = height * aspectRatio;
      }

      return { width, height };
    };

    const { width, height } = calculateCanvasSize();
    setCanvasDimensions({ width, height });

    const c = new fabric.Canvas('fabric-canvas', {
      width,
      height,
      selection: true,
      preserveObjectStacking: true,
    });

    // Aligning guidelines
    // const aligning = new AligningGuidelines(c);

    // Default object styles
    fabric.Object.prototype.transparentCorners = false;
    fabric.Object.prototype.cornerStyle = 'circle';
    fabric.Object.prototype.cornerColor = '#00BFFF';
    fabric.Object.prototype.cornerStrokeColor = '#00BFFF';
    fabric.Object.prototype.cornerSize = 10;
    fabric.Object.prototype.borderColor = '#00BFFF';
    fabric.Object.prototype.borderScaleFactor = 1.5;
    fabric.Object.prototype.hasBorders = true;
    fabric.Object.prototype.padding = 5;

    // Rotation control
    fabric.Object.prototype.hasRotatingPoint = true;
    fabric.Object.prototype.rotatingPointOffset = 30;

    // Set rotation cursor to a circular rotation icon
    c.rotationCursor = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\'%3E%3Cpath d=\'M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z\' fill=\'%23000\'/%3E%3C/svg%3E") 12 12, auto';

    c.selectionColor = 'rgba(0, 174, 239, 0.1)';
    c.selectionBorderColor = '#00AEEF';
    c.selectionLineWidth = 1;
    c.skipTargetFind = false;

    // Group selection behavior
    const originalFindTarget = c.findTarget;
    c.findTarget = function (e, skipGroup) {
      const target = originalFindTarget.call(this, e, skipGroup);
      if (target && target.group && target.group.type === 'group') {
        return target.group;
      }
      return target;
    };

    c.on('mouse:down', options => {
      const target = options.target;
      if (target && target.group && target.group.type === 'group') {
        c.setActiveObject(target.group);
        c.requestRenderAll();
      }
    });

    // Responsive resizing
    const resizeCanvas = () => {
      const { width: newWidth, height: newHeight } = calculateCanvasSize();

      const scale = newWidth / 1344; // based on original width

      c.setWidth(newWidth);
      c.setHeight(newHeight);

      c.setZoom(scale); // scales all objects proportionally
      c.renderAll();
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas(); // initial resize

    // Initialize first slide with history
    const initialState = JSON.stringify(c.toJSON());
    const firstSlide = {
      history: new HistoryManager(),
      state: initialState,
    };
    firstSlide.history.clear(initialState);

    setSlides([firstSlide]);
    setCanvas(c);
    canvasRef.current = c;

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (c) {
        // aligning.dispose();
        c.dispose();
      }
    };
  }, []);

  return (
    <CanvasContext.Provider
      value={{
        canvas,
        canvasRef,
        slides,
        setSlides,
        currentSlide,
        setCurrentSlide,
        isLoadingSlide,
        setIsLoadingSlide,
        canvasDimensions,
        title,
        setTitle,
        isPresenting,
        setIsPresenting,
        slideshowIndex,
        setSlideshowIndex,
        showRegenerate,
        setShowRegenerate
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
}
