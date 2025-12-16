import { useState, useEffect, useCallback, useRef } from 'react';
import { useCanvas } from '@products/pitch-craft/contexts/CanvasContext';
import { HistoryManager } from '@products/pitch-craft/utils/fabric-history';
import { getTemplates } from '@products/pitch-craft/constants/templates';
import { useParams, useLocation, useNavigate } from 'react-router';

export function useTemplates() {
  const [templates, setTemplates] = useState([]);
  const { pitch_id } = useParams();
  const location = useLocation();
  const [templateApplied, setTemplateApplied] = useState(false);

  const {
    canvas,
    setSlides,
    setTitle,
    setCurrentSlide,
    setIsLoadingSlide,
    isLoadingSlide,
    canvasDimensions,
  } = useCanvas();

  // Read flag from navigation state
  const templateId = location.state?.template_id;
  console.log(templateId);
  const hasSavedRef = useRef(false); // prevent multiple saves in Strict Mode

  // Fetch templates on mount
  useEffect(() => {
    let isMounted = true;

    const fetchTemplates = async () => {
      setIsLoadingSlide(true);
      try {
        const data = await getTemplates(pitch_id);
        if (!isMounted) return;

        const arr = Array.isArray(data) ? data : data ? [data] : [];
        setTemplates(arr);
      } catch (error) {
        console.error('Failed to fetch templates:', error);
        if (isMounted) setTemplates([]);
      } finally {
        if (isMounted) setIsLoadingSlide(false);
      }
    };

    fetchTemplates();
    return () => {
      isMounted = false;
    };
  }, [pitch_id, setIsLoadingSlide]);

  // Apply a multi-slide template
  const applyMultiSlideTemplate = useCallback(
    template => {
      if (!canvas || isLoadingSlide || !canvasDimensions?.width) return;

      try {
        const templateSlides = Array.isArray(template)
          ? template
          : template.slides || [template];

        if (!templateSlides.length) return;

        setIsLoadingSlide(true);

        const newSlides = templateSlides.map(slideTemplate => {
          let json;

          if (slideTemplate.json) {
            json =
              typeof slideTemplate.json === 'string'
                ? JSON.parse(slideTemplate.json)
                : slideTemplate.json;
          } else if (slideTemplate.state) {
            json =
              typeof slideTemplate.state === 'string'
                ? JSON.parse(slideTemplate.state)
                : slideTemplate.state;
          } else {
            json = {};
          }

          const state = JSON.stringify(json);
          const history = new HistoryManager();
          history.initialize(state);

          const slideData = {
            history,
            state,
            slide_id: slideTemplate.slide_id,
            visual_prompt: slideTemplate.visual_prompt || json?.visual_prompt,
            title: slideTemplate?.title,
            slide_type: slideTemplate.slide_type,
          };

          if (slideTemplate.slide_type === 'cast') {
            console.log(slideTemplate);
            slideData.castData = slideTemplate.castData || [];
          }

          return slideData;
        });

        setTitle(template.title);
        setSlides(newSlides);

        const firstSlideState = JSON.parse(newSlides[0].state);

        canvas.loadFromJSON(firstSlideState, async () => {
          setCurrentSlide(0);
          setIsLoadingSlide(false);
          setTemplateApplied(true);
        });
      } catch (e) {
        console.error('Failed to apply multi-slide template:', e);
        setIsLoadingSlide(false);
        alert('Failed to apply template');
      }
    },
    [
      canvas,
      setSlides,
      setCurrentSlide,
      setIsLoadingSlide,
      isLoadingSlide,
      setTitle,
      canvasDimensions,
    ]
  );

  const applyTemplate = useCallback(
    template => {
      applyMultiSlideTemplate(template);
    },
    [applyMultiSlideTemplate]
  );

  return {
    templates,
    applyTemplate,
    templateApplied 
  };
}
