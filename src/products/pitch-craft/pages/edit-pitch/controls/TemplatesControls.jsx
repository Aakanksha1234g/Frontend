import { useEffect, useRef } from 'react';
import { useTemplates } from '@products/pitch-craft/hooks/useTemplates';
import { useSaveSlides } from '@products/pitch-craft/hooks/useSaveSlides';
import { useLocation, useNavigate } from 'react-router';

export default function TemplatesControls() {
  const { templates, applyTemplate, templateApplied } = useTemplates();
  const { saveSlides } = useSaveSlides();
  const appliedOnce = useRef(false);

  const location = useLocation();
  const navigate = useNavigate();

  const firstSave = location.state?.firstSave;

  // Apply the template once
  useEffect(() => {
    if (!appliedOnce.current && templates.length > 0) {
      applyTemplate(templates[0]);
      appliedOnce.current = true;
    }
  }, [templates, applyTemplate]);

  // Trigger first save AFTER applyTemplate finishes
  useEffect(() => {
  if (firstSave && templateApplied) {
    (async () => {
      console.log("First save AFTER full template apply");
      await saveSlides();

      navigate('.', {
        replace: true,
        state: { firstSave: false },
      });
    })();
  }
}, [firstSave, templateApplied]);

  return null;
}
