import { apiRequest } from '@shared/utils/api-client';
import readBase64Image from '../../../shared/utils/image-formater';
import { template } from './templates/templates';

export const getTemplates = async (pitch_id) => {
  console.log('pitch_id', pitch_id);
  let templateId;
  try {
    // Try fetching pitch_edit_meta_data first
    const metaResponse = await apiRequest({
      baseURL: import.meta.env.VITE_API_BASE_URL,
      endpoint: '/get_pitch_edit_mata_data',
      method: 'GET',
      params: { pitch_id },
    });

    const pitchEditMetaData = metaResponse?.response?.pitch_edit_meta_data;
    let temp_title = "";
    if (!pitchEditMetaData?.template_id) {
      if (pitchEditMetaData && pitchEditMetaData.length > 0 && pitchEditMetaData[0].slide_id !== undefined) {
        const slidesWithTemplate = pitchEditMetaData.map((slideObj, i) => {
          try {
            delete slideObj._additionalBackgroundInfo;
            console.log(slideObj);
            // console.log(
            //   {
            //     slide_id: slideObj.slide_id || `slide_${i + 1}`,
            //     title: slideObj.title,
            //     slide_type: slideObj.slide_type,
            //     visual_prompt: slideObj.visual_prompt,
            //     state: slideObj.json,
            //   }
            // );
            temp_title = slideObj.title
            return {
              slide_id: slideObj.slide_id,
              slide_type: slideObj.slide_type,
              visual_prompt: slideObj.visual_prompt,
              json: slideObj.json,
              hasContent: slideObj.hasContent !== undefined ? slideObj.hasContent : true,
              ...(slideObj.slide_type === 'cast' && { castData: slideObj.castData }),
            };
          } catch (e) {
            console.error('Error parsing pitch_edit_meta_data slide:', e);
            return createSlide(`slide_${i + 1}`, 'default', '', '', '');
          }
        });

        console.log({
          templateId: templateId,
          slides: slidesWithTemplate,
          title: temp_title
        })

        return {
          templateId: templateId,
          slides: slidesWithTemplate,
          title: temp_title
        };
      }
    } else {
      templateId = pitchEditMetaData?.template_id
    }

    console.log(templateId)
    // templateId = 1;

    // Fallback: get_pitch route
    const response = await apiRequest({
      baseURL: import.meta.env.VITE_API_BASE_URL,
      endpoint: '/get_pitch',
      method: 'GET',
      params: { pitch_id },
      suppressToast: true,
    });

    const slides = response?.response?.pitch_slides || [];
    console.log(templateId);
    const slidesWithTemplate = slides.map((slide, index) =>
      createSlide(
        slide?.slide_id,
        slide?.slide_type,
        readBase64Image(slide?.slide_image || ''),
        slide?.slide_description || '',
        slide?.slide_visual_prompt || '',
        templateId = templateId
      )
    );

    return {
      templateId: templateId,
      slides: slidesWithTemplate,
      title: response?.response?.pitch_title,
    };
  } catch (error) {
    console.error('Failed to fetch pitch slides from get_pitch:', error);
    return { templateId: pitch_id, slides: [] };
  }
};

export const createSlide = (idx, slide_type, image, text, visual_prompt, templateId = 1, title = '') => {
  try {
    // Pick template (here default template_id = 1)
    // console.log(templateId);
    console.log({ idx, slide_type, image, text, visual_prompt, title, templateId });
    const baseTemplate = template.find(t => t.template_id === templateId);
    // console.log('baseTemplate', baseTemplate)

    if (!baseTemplate || typeof baseTemplate.createSlideFunction !== 'function') {
      console.warn('Template or createSlideFunction not found, returning fallback slide');
      return {
        slide_id: idx,
        slide_type,
        visual_prompt,
        json: '{}',
        hasContent: true,
      };
    }

    // Delegate all logic to template's function
    return baseTemplate.createSlideFunction({
      idx,
      slide_type,
      image,
      text,
      visual_prompt,
      title,
    });

  } catch (err) {
    console.error('Error in createSlide delegation:', err);
    return {
      slide_id: idx,
      slide_type,
      visual_prompt,
      json: '{}',
      hasContent: true,
      title,
    };
  }
};
