import { useCanvas } from '@products/pitch-craft/contexts/CanvasContext';
import { useState, useRef, useCallback, useEffect } from 'react';
import { fabric } from 'fabric';
import { HistoryManager } from '@products/pitch-craft/utils/fabric-history';

export function useDownloads() {
  const {
    canvas,
    slides,
    currentSlide,
    setSlides,
    setCurrentSlide,
    setIsPresenting,
    slideshowIndex,
    setSlideshowIndex,
    title
  } = useCanvas();

  const [showSlideshow, setShowSlideshow] = useState(false);
  const [slideImages, setSlideImages] = useState([]);
  const [loadingSlides, setLoadingSlides] = useState(new Set());
  const [isOpen, setIsOpen] = useState(false);

  const isGenerating = useRef(false);
  const offscreenCanvasRef = useRef(null);
  const renderQueue = useRef(new Set());
  const dropdownRef = useRef(null);
  const slideshowRef = useRef(null);

  
  // Utility: Offscreen canvas
  
  const getOffscreenCanvas = () => {
    const CANVAS_WIDTH = 1344;
    const CANVAS_HEIGHT = 768;

    if (!offscreenCanvasRef.current) {
      const el = document.createElement("canvas");
      el.width = CANVAS_WIDTH;
      el.height = CANVAS_HEIGHT;
      el.style.position = "absolute";
      el.style.left = "-9999px";
      el.style.top = "-9999px";
      document.body.appendChild(el);
      offscreenCanvasRef.current = new fabric.Canvas(el, { width: CANVAS_WIDTH, height: CANVAS_HEIGHT, preserveObjectStacking: true });
    }
    return offscreenCanvasRef.current;
  };

  const cleanupOffscreenCanvas = () => {
    if (!offscreenCanvasRef.current) return;
    const el = offscreenCanvasRef.current.getElement();
    offscreenCanvasRef.current.dispose();
    if (el.parentNode) el.parentNode.removeChild(el);
    offscreenCanvasRef.current = null;
  };

  
  // Load slide state into offscreen
  
  const loadStateToOffscreenCanvas = async (state) => {
    if (!state) throw new Error('No state');
    const offscreenCanvas = getOffscreenCanvas();
    const parsed = JSON.parse(state);
    const extra = parsed._additionalBackgroundInfo;
    delete parsed._additionalBackgroundInfo;

    return new Promise((resolve) => {
      offscreenCanvas.loadFromJSON(parsed, () => {
        if (extra) {
          let toRestore = 0, restored = 0;
          const checkDone = () => { restored++; if (restored === toRestore) { offscreenCanvas.renderAll(); resolve(offscreenCanvas); } };
          if (extra.backgroundColor) { toRestore++; offscreenCanvas.setBackgroundColor(extra.backgroundColor, checkDone); }
          if (extra.backgroundImage) { toRestore++; offscreenCanvas.setBackgroundImage(extra.backgroundImage, checkDone); }
          if (toRestore === 0) { offscreenCanvas.renderAll(); resolve(offscreenCanvas); }
        } else { offscreenCanvas.renderAll(); resolve(offscreenCanvas); }
      });
    });
  };

  
  // Render single slide
  
  const renderSlide = useCallback(async (slideIndex, slideData) => {
    if (renderQueue.current.has(slideIndex)) return;
    renderQueue.current.add(slideIndex);
    setLoadingSlides(prev => new Set([...prev, slideIndex]));

    try {
      const offscreenCanvas = await loadStateToOffscreenCanvas(slideData.state);
      const dataUrl = offscreenCanvas.toDataURL({ format: 'png', quality: 1 });
      setSlideImages(prev => { const copy = [...prev]; copy[slideIndex] = dataUrl; return copy; });
    } catch (err) {
      console.error(`Slide ${slideIndex + 1} render failed:`, err);
      setSlideImages(prev => { const copy = [...prev]; copy[slideIndex] = "error"; return copy; });
    } finally {
      setLoadingSlides(prev => { const copy = new Set(prev); copy.delete(slideIndex); return copy; });
      renderQueue.current.delete(slideIndex);
    }
  }, []);

  const preloadSlides = async (centerIndex, slidesArray) => {
    for (let i = 0; i < 4; i++) {
      const idx = (centerIndex + i) % slidesArray.length;
      if (slidesArray[idx]?.state) renderSlide(idx, slidesArray[idx]);
    }
  };

  
  // Slideshow controls
  
  const startSlideshow = async () => {
    console.log('Starting slideshow...', { isGenerating: isGenerating.current, canvas: !!canvas, slidesCount: slides.length });
    
    if (isGenerating.current || !canvas) {
      console.log('Cannot start - generating or no canvas');
      return;
    }
    
    isGenerating.current = true;
    
    try {
      // Save current slide state
      const currentStateStr = JSON.stringify(canvas.toJSON());
      const updatedSlides = slides.map((s, idx) => ({ 
        ...s, 
        state: idx === currentSlide ? currentStateStr : (s.state || currentStateStr)
      }));
      
      console.log('Updated slides:', updatedSlides.length);
      
      // Initialize slideshow
      setSlideImages(Array(updatedSlides.length).fill(null));
      setSlideshowIndex(currentSlide);
      setShowSlideshow(true);
      setIsPresenting(true);

      console.log('Slideshow state set, requesting fullscreen...');

      // Enter fullscreen after a short delay
      setTimeout(() => {
        if (slideshowRef.current) {
          console.log('Requesting fullscreen');
          slideshowRef.current.requestFullscreen?.().catch(err => {
            console.error('Fullscreen error:', err);
          });
        }
      }, 100);

      // Render current slide first
      if (updatedSlides[currentSlide]?.state) {
        console.log('Rendering current slide:', currentSlide);
        await renderSlide(currentSlide, updatedSlides[currentSlide]);
      }

      // Then render other slides in background (don't await)
      updatedSlides.forEach((slide, idx) => {
        if (idx !== currentSlide && slide.state) {
          renderSlide(idx, slide);
        }
      });
      
      console.log('Slideshow started successfully');
    } catch (error) {
      console.error('Error starting slideshow:', error);
    } finally { 
      isGenerating.current = false; 
    }
  };

  const navigateToSlide = useCallback((newIndex) => {
    setSlideshowIndex(newIndex);
    preloadSlides(newIndex, slides);
  }, [slides, setSlideshowIndex]);

  const currentState = () => canvas ? JSON.stringify(canvas.toJSON()) : null;

  const downloadJSON = () => {
    const updatedSlides = [...slides];
    updatedSlides[currentSlide].state = currentState();
    const slideData = updatedSlides.map((slide, index) => ({
      slide: index + 1,
      json: slide.state || currentState(),
      hasContent:
        slide.state &&
        (() => {
          try {
            const parsed = JSON.parse(slide.state);
            return parsed.objects && parsed.objects.length > 0;
          } catch { return false; }
        })(),
    }));
    const blob = new Blob([JSON.stringify(slideData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPDF = async () => {
    if (isGenerating.current) return;
    isGenerating.current = true;
    try {
      const { jsPDF } = await import('jspdf');
      const updatedSlides = [...slides];
      updatedSlides[currentSlide].state = currentState();
      
      const CANVAS_WIDTH = 1344;
      const CANVAS_HEIGHT = 768;
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: [CANVAS_WIDTH, CANVAS_HEIGHT] });
      let isFirstPage = true;

      for (let i = 0; i < updatedSlides.length; i++) {
        const slide = updatedSlides[i];
        const hasContent = slide.state && (() => { try { return JSON.parse(slide.state).objects?.length > 0 } catch { return false } })();
        if (hasContent || slide.state) {
          try {
            const offscreenCanvas = await loadStateToOffscreenCanvas(slide.state);
            if (!isFirstPage) pdf.addPage();
            isFirstPage = false;
            const dataUrl = offscreenCanvas.toDataURL({ format: 'png', multiplier: 2 });
            pdf.addImage(dataUrl, 'PNG', 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
          } catch (error) { console.error(`Error processing slide ${i + 1}:`, error); }
        }
      }
      pdf.save(`${title}.pdf`);
    } catch (error) { console.error('Error generating PDF:', error); alert('Error generating PDF.'); }
    finally { cleanupOffscreenCanvas(); isGenerating.current = false; }
  };

  const downloadPPTX = async () => {
    if (isGenerating.current) return;
    isGenerating.current = true;
    try {
      const PptxGenJS = await import('pptxgenjs');
      const pptx = new PptxGenJS.default();
      pptx.layout = 'LAYOUT_16x9';
      
      const updatedSlides = [...slides];
      updatedSlides[currentSlide].state = currentState();

      for (let i = 0; i < updatedSlides.length; i++) {
        const slide = updatedSlides[i];
        const hasContent = slide.state && (() => {
          try {
            const parsed = JSON.parse(slide.state);
            return (parsed.objects?.length > 0 || parsed.backgroundColor || parsed.backgroundImage || parsed._additionalBackgroundInfo?.backgroundColor || parsed._additionalBackgroundInfo?.backgroundImage);
          } catch { return false; }
        })();

        if (hasContent) {
          const offscreenCanvas = await loadStateToOffscreenCanvas(slide.state);
          const dataUrl = offscreenCanvas.toDataURL({ format: 'png', multiplier: 2 });
          const pptxSlide = pptx.addSlide();
          pptxSlide.addImage({ data: dataUrl, x: 0, y: 0, w: '100%', h: '100%' });
        } else pptx.addSlide();
      }
      await pptx.writeFile({ fileName: `${title}.pptx` });
    } catch (error) { console.error('Error generating PPTX:', error); alert('Error generating PPTX.'); }
    finally { cleanupOffscreenCanvas(); isGenerating.current = false; }
  };

  const downloadDOCX = async () => {
    if (isGenerating.current) return;
    isGenerating.current = true;
    try {
      const { Document, Packer, Paragraph, ImageRun } = await import('docx');
      const updatedSlides = [...slides];
      updatedSlides[currentSlide].state = currentState();
      const docElements = [];
      
      const CANVAS_WIDTH = 1344;
      const CANVAS_HEIGHT = 768;

      for (let i = 0; i < updatedSlides.length; i++) {
        const slide = updatedSlides[i];
        const hasContent = slide.state && (() => {
          try {
            const parsed = JSON.parse(slide.state);
            return (parsed.objects?.length > 0 || parsed.backgroundColor || parsed.backgroundImage || parsed._additionalBackgroundInfo?.backgroundColor || parsed._additionalBackgroundInfo?.backgroundImage);
          } catch { return false; }
        })();
        if (hasContent) {
          const offscreenCanvas = await loadStateToOffscreenCanvas(slide.state);
          const dataUrl = offscreenCanvas.toDataURL({ format: 'png', multiplier: 2 });
          const base64Data = dataUrl.split(',')[1];
          const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
          docElements.push(new Paragraph({ text: `Slide ${i + 1}`, heading: 'Heading1' }));
          docElements.push(new Paragraph({ children: [ new ImageRun({ data: buffer, transformation: { width: CANVAS_WIDTH*0.75, height: CANVAS_HEIGHT*0.75 } }) ] }));
          if (i < updatedSlides.length - 1) docElements.push(new Paragraph({ pageBreakBefore: true }));
        }
      }

      const doc = new Document({ sections: [{ properties: {}, children: docElements }] });
      const buffer = await Packer.toBuffer(doc);
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) { console.error('Error generating DOCX:', error); alert('Error generating DOCX.'); }
    finally { cleanupOffscreenCanvas(); isGenerating.current = false; }
  };

  const loadTemplate = async (file) => {
    if (!file) return;

    try {
      const text = await file.text();
      const templateData = JSON.parse(text);

      const newSlides = templateData.map(slide => ({
        history: new HistoryManager(),
        state: typeof slide.json === 'string' ? slide.json : JSON.stringify(slide.json),
        visual_prompt: slide.visual_prompt,
        title: slide.title,
        slide_type: slide.slide_type || 'custom',
      }));

      setSlides(newSlides);

      if (canvas && newSlides.length) {
        canvas.loadFromJSON(JSON.parse(newSlides[0].state), () => setCurrentSlide(0));
      }

      setIsOpen(false);
    } catch (err) {
      console.error('Failed to load template:', err);
      alert('Failed to load template file.');
    }
  };

  const closeSlideshow = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    }
    setShowSlideshow(false);
    setIsPresenting(false);
    setSlideshowIndex(0);
    setSlideImages([]);
    cleanupOffscreenCanvas();
  }, [setIsPresenting, setSlideshowIndex]);

  // --- Fullscreen exit cleanup ---
  useEffect(() => {
    const handleFullscreen = () => {
      if (!document.fullscreenElement) {
        setShowSlideshow(false);
        setIsPresenting(false);
        setSlideshowIndex(0);
        setSlideImages([]);
        cleanupOffscreenCanvas();
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreen);
    return () => document.removeEventListener('fullscreenchange', handleFullscreen);
  }, [setIsPresenting, setSlideshowIndex]);

  const downloadImages = async () => {
    if (isGenerating.current) return;
    isGenerating.current = true;

    try {
      // Import JSZip dynamically
      const JSZip = await import('jszip');
      const zip = new JSZip.default();

      // Save current slide state
      const updatedSlides = [...slides];
      updatedSlides[currentSlide].state = currentState();

      // Store original state for restoration
      const originalState = currentState();

      for (let i = 0; i < updatedSlides.length; i++) {
        const slide = updatedSlides[i];

        // Check if slide has content
        const hasContent =
          slide.state &&
          (() => {
            try {
              const parsed = JSON.parse(slide.state);
              return parsed.objects && parsed.objects.length > 0;
            } catch (e) {
              return false;
            }
          })();

        if (hasContent) {
          await new Promise(resolve => {
            canvas.loadFromJSON(slide.state, () => {
              canvas.renderAll();

              const dataUrl = canvas.toDataURL({
                format: 'png',
                multiplier: 2,
              });

              // Convert data URL to base64
              const base64Data = dataUrl.split(',')[1];
              zip.file(`slide_${i + 1}.png`, base64Data, { base64: true });

              resolve();
            });
          });
        }
      }

      // Generate ZIP file
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'slides.zip';
      a.click();
      URL.revokeObjectURL(url);

      // Restore original canvas state
      canvas.loadFromJSON(originalState, () => {
        canvas.renderAll();
      });
    } catch (error) {
      console.error('Error generating images:', error);
      alert('Error generating images. Please install jszip: npm install jszip');
    } finally {
      isGenerating.current = false;
    }
  };


  return {
    isOpen,
    setIsOpen,
    showSlideshow,
    slideImages,
    slideshowRef,
    slideshowIndex,
    startSlideshow,
    navigateToSlide,
    closeSlideshow,
    downloadJSON,
    downloadPDF,
    downloadPPTX,
    downloadDOCX,
    downloadImages,
    loadTemplate,
    isGenerating,
    canvas,
  };
}