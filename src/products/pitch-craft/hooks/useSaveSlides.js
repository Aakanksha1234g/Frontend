import { useRef, useCallback, useState } from 'react';
import { useCanvas } from '@products/pitch-craft/contexts/CanvasContext';
import { apiRequest } from '@shared/utils/api-client';
import { useParams } from 'react-router';

export function useSaveSlides() {
  const { canvas, slides, title, currentSlide } = useCanvas();
  const { pitch_id } = useParams();
  const isGeneratingRef = useRef(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const currentState = useCallback(() => {
    if (!canvas) return null;

    const canvasState = canvas.toJSON(['backgroundImage', 'backgroundColor']);
    const additionalBackgroundInfo = {
      backgroundImage: canvas.backgroundImage,
      backgroundColor: canvas.backgroundColor,
    };

    return JSON.stringify({
      ...canvasState,
      _additionalBackgroundInfo: additionalBackgroundInfo,
    });
  }, [canvas]);

  const saveSlides = useCallback(async () => {
    if (!canvas || isGeneratingRef.current) return;
    isGeneratingRef.current = true;
    setIsGenerating(true);

    try {
      const slidesToSave = slides.map((slide, idx) => {
        const baseSlide = {
          slide_id: slide.slide_id,
          title: title,
          slide_type: slide.slide_type,
          visual_prompt: slide.visual_prompt,
          json:
            idx === currentSlide && canvas
              ? currentState()
              : slide.state,
          hasContent: slide.hasContent,
        };

        if (slide.slide_type === 'cast' && slide.castData?.length > 0) {
          baseSlide.castData = slide.castData.map(cast => ({
            ...cast,
            slide_id: slide.slide_id,
          }));
        }

        return baseSlide;
      });
      console.log({
          pitch_id: pitch_id,
          pitch_edit_meta_data: slidesToSave,
        })
        // alert('Pitch Updated Successfully')
      const response = await apiRequest({
        baseURL: import.meta.env.VITE_API_BASE_URL,
        endpoint: '/update_pitch_meta_data',
        method: 'PUT',
        body: {
          pitch_id: pitch_id,
          pitch_edit_meta_data: slidesToSave,
        },
        successMessage: 'Slides saved successfully!',
      });

      console.log('Save response:', response);
    } catch (error) {
      console.error('Error saving slides:', error);
    } finally {
      isGeneratingRef.current = false;
      setIsGenerating(false);
    }
  }, [canvas, slides, title, currentSlide, currentState, pitch_id]);

  return { saveSlides, isGenerating };
}
