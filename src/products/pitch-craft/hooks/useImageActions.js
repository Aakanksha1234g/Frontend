import { useCallback } from 'react';
import { fabric } from 'fabric';
import { useCanvas } from '@products/pitch-craft/contexts/CanvasContext';

export function useImageActions() {
  const { canvas } = useCanvas();

  const addImage = useCallback(
    file => {
      if (!canvas) return;

      const reader = new FileReader();
      reader.onload = event => {
        const imgElement = new window.Image();
        imgElement.onload = () => {
          const fabricImage = new fabric.Image(imgElement, {
            left: Math.random() * 500 + 20,
            top: Math.random() * 300 + 20,
            scaleX: 0.5,
            scaleY: 0.5,
          });
          canvas.add(fabricImage);
          canvas.setActiveObject(fabricImage);
          canvas.requestRenderAll(); 
        };
        imgElement.src = event.target.result;
      };
      reader.readAsDataURL(file);
    },
    [canvas]
  );

  const addImageFromURL = useCallback(
    url => {
      if (!canvas) return;

      fabric.Image.fromURL(url, img => {
        img.set({
          left: Math.random() * 500 + 20,
          top: Math.random() * 300 + 20,
          scaleX: 0.5,
          scaleY: 0.5,
        });
        canvas.add(img);
      });
    },
    [canvas]
  );

  return {
    addImage,
    addImageFromURL,
  };
}
