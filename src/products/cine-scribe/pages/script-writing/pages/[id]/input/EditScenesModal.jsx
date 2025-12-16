import React, { useEffect, useState, useReducer } from 'react';
import {
  sceneIntExtOptionList,
  sceneShotTimeOptionList,
  sceneTypeOptionList,
} from '../../../../../constants/ScriptConstant';
import Input from '@shared/ui/input';
import Textarea from '@shared/ui/textarea';
import { CrossIcon } from '@shared/layout/icons';
import Button from '@shared/ui/button';
import {
  minWordLimits,
  toolTipText,
  wordLimits,
  wordDisplay
} from '@products/cine-scribe/constants/ScriptConstant';
import Dropdown from '@shared/ui/DropDown';

const initialState = {
  errors: {},
  isChanged: false,
};

function buildSceneTitle({
  scene_interior_exterior,
  scene_location,
  scene_shot_time,
}) {
  const interior = scene_interior_exterior?.toUpperCase() || 'INT';
  const location = scene_location?.toUpperCase() || 'UNKNOWN';
  const shotTime = (scene_shot_time || 'DAY').toUpperCase();
  return `${interior}. ${location} – ${shotTime}`;
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_ERRORS':
      return { ...state, errors: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, errors: { ...state.errors, [action.field]: '' } };
    case 'RESET_ERRORS':
      return { ...state, errors: {} };
    case 'SET_CHANGED':
      return { ...state, isChanged: action.payload };
    default:
      return state;
  }
}


const EditSceneModal = ({
  open = true,
  sceneData,
  onSave,
  isNewScene,
  onClose,
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { errors } = state;

  // Add this useEffect below your existing useEffect that sets formData



 const emptyForm = {
   scene_data_id: 0,
   scene_sequence_no: 0,
   scene_title: '',
   scene_interior_exterior: '',
   scene_location: '',
   scene_shot_time: '', // changed from []
   scene_type: null,
   scene_summary: '',
 };


  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    if (open && sceneData) {
      setFormData({
        scene_data_id: parseInt(sceneData.scene_data_id, 10) || 0,
        scene_sequence_no: parseInt(sceneData.scene_sequence_no, 10) || 0,
        scene_title: sceneData.scene_title
          ? sceneData.scene_title
          : buildSceneTitle(sceneData),
        scene_interior_exterior: sceneData.scene_interior_exterior || '',
        scene_location: sceneData.scene_location || '',
        scene_shot_time:
          typeof sceneData.scene_shot_time === 'string'
            ? sceneData.scene_shot_time
            : Array.isArray(sceneData.scene_shot_time)
              ? sceneData.scene_shot_time[0] || ''
              : '',
        scene_type: sceneData.scene_type || null,
        scene_summary: sceneData.scene_summary || '',
      });
    } else if (!sceneData) {
      setFormData(emptyForm);
    }
  }, [sceneData, open]);


  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    dispatch({ type: 'CLEAR_ERROR', field: name });
  };

  const validateWordLimits = (fieldName, text) => {
    const field = fieldName.replace(/[-_]/g, '');
    const words = text.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    if (wordCount > wordLimits[field]) {
      return `${wordDisplay[field]} should be at most ${wordLimits[field]} words`;
    }
    if (wordCount < (minWordLimits[field] || 1)) {
      return `${wordDisplay[field]} must have at least ${minWordLimits[field]} words`;
    }
    return '';
  };

  

  const validateForm = () => {
    const errors = {};

    if (!formData.scene_sequence_no)
      errors.scene_sequence_no = 'Sequence ID is required';

    if (!formData.scene_location)
      errors.scene_location = 'Scene Location is required';
    else {
      const err = validateWordLimits('scenelocation', formData.scene_location);
      if (err) errors.scene_location = err;
    }

    if (!formData.scene_summary)
      errors.scene_summary = 'Scene Summary is required';
    else {
      const err = validateWordLimits('scenesummary', formData.scene_summary);
      if (err) errors.scene_summary = err;
    }

    if (!formData.scene_interior_exterior)
      errors.scene_interior_exterior = 'Scene Interior/Exterior is required';
   if (!formData.scene_shot_time)
     errors.scene_shot_time = 'Scene Shot Time is required';


    return errors;
  };

  const handleBlur = e => {
    const { name, value } = e.target;
    const err = validateWordLimits(name.toLowerCase(), value);

    if (err) {
      dispatch({
        type: 'SET_ERRORS',
        payload: { ...errors, [name]: err },
      });
    }
  };

  const handleSave = () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      dispatch({ type: 'SET_ERRORS', payload: validationErrors });
      return;
    }

    const scene_title = buildSceneTitle(formData);
    onSave({ ...formData, scene_title });
  };

  const handleClose = () => {
    setFormData(emptyForm);
    dispatch({ type: 'RESET_ERRORS' });
    onClose();
  };

  useEffect(() => {
    if (!sceneData) return;

    const isDifferent = Object.keys(formData).some(key => {
      const formValue = Array.isArray(formData[key])
        ? JSON.stringify(formData[key])
        : formData[key]?.toString().trim();
      const sceneValue = Array.isArray(sceneData[key])
        ? JSON.stringify(sceneData[key])
        : sceneData[key]?.toString().trim();
      
    

      return formValue !== sceneValue;
    });

    // Update only if changed
    if (state.isChanged !== isDifferent) {
      dispatch({ type: 'SET_CHANGED', payload: isDifferent });
    }
  }, [formData, sceneData]);


  return (
    <div
      className={`${
        open ? 'flex' : 'hidden'
      } fixed inset-0 bg-black/50 backdrop-blur-sm items-center justify-center p-4 z-50 pointer-events-auto`}
    >
      <div className="bg-black flex flex-col gap-3 rounded-2xl p-4 w-full max-w-[580px] max-h-[80%] overflow-y-auto border border-white/10">
        {/* Close Button */}
        <div className="relative right-0">
          <Button
            size="sm"
            className="absolute top-1 right-1 cursor-pointer"
            onClick={handleClose}
          >
            <CrossIcon size={20} color="#A3A3A3" />
          </Button>
        </div>

        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="text-[20px] font-semibold text-white flex items-center gap-2">
            {isNewScene
              ? 'Add New Scene'
              : `Edit Scene ${formData.scene_sequence_no}`}
          </div>
        </div>

        {/* Form */}
        <form className="w-full flex flex-col gap-3 pt-2 border-t-1 border-rounded border-white/10 h-full">
          {/* Dropdowns Row */}
          <div className="flex items-center gap-4 justify-around w-full flex-wrap">
            {/* Scene Interior/Exterior */}
            <div className="flex flex-col gap-1 flex-1">
              <Dropdown
                label="Scene Interior/Exterior"
                tooltipText={toolTipText.SceneExtInt}
                required
                options={sceneIntExtOptionList.map(item => ({
                  label: item.value,
                  value: item.value,
                }))}
                value={
                  formData.scene_interior_exterior
                    ? [formData.scene_interior_exterior]
                    : []
                }
                onChange={val => {
                  const selected = Array.isArray(val) ? val[0] : val;
                  setFormData(prev => ({
                    ...prev,
                    scene_interior_exterior: selected,
                  }));
                  dispatch({
                    type: 'CLEAR_ERROR',
                    field: 'scene_interior_exterior',
                  });
                }}
                minSelection={1}
                maxSelection={1}
                errorMessage={errors.scene_interior_exterior}
                error={!!errors.scene_interior_exterior}
              />
            </div>

            {/* Scene Shot Time */}
            {/* Scene Shot Time */}
            <div className="flex flex-col gap-1 flex-1">
              <Dropdown
                label="Scene Shot Time"
                tooltipText={toolTipText.SceneShotTime}
                required
                options={sceneShotTimeOptionList.map(item => ({
                  label: item.value.toUpperCase(),
                  value: item.value.toUpperCase(),
                }))}
                value={
                  formData.scene_shot_time ? [formData.scene_shot_time] : []
                } // show selected as array for dropdown
                onChange={val => {
                  const selected = Array.isArray(val) ? val[0] : val;
                  setFormData(prev => ({
                    ...prev,
                    scene_shot_time: selected, // store as string
                  }));
                  dispatch({ type: 'CLEAR_ERROR', field: 'scene_shot_time' });
                }}
                minSelection={1}
                maxSelection={1}
                errorMessage={errors.scene_shot_time}
                error={!!errors.scene_shot_time}
              />
            </div>
          </div>

          {/* Scene Location */}
          <Input
            label="Scene Location"
            required
            name="scene_location"
            value={formData.scene_location}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Scene Location"
            tooltipText={toolTipText.SceneLocation}
            wordLimit={wordLimits.scenelocation}
            minLimit={minWordLimits.scenelocation}
            errorMessage={errors.scene_location}
          />

          {/* Scene Type */}
          <div className="flex flex-col gap-1">
            <Dropdown
              label="Scene Indicator"
              tooltipText={toolTipText.SceneIndicator}
              options={sceneTypeOptionList.map(item => ({
                label: item.value.toUpperCase(),
                value: item.value.toUpperCase(),
              }))}
              value={formData.scene_type ? [formData.scene_type] : []}
              onChange={val => {
                const selected = Array.isArray(val) ? val[0] : val;
                setFormData(prev => ({
                  ...prev,
                  scene_type: selected,
                }));
                dispatch({ type: 'CLEAR_ERROR', field: 'scene_type' });
              }}
              minSelection={1}
              maxSelection={1}
              errorMessage={errors.scene_type}
              error={!!errors.scene_type}
            />
          </div>

          {/* Scene Summary */}
          <Textarea
            label="Scene Summary"
            required
            name="scene_summary"
            value={formData.scene_summary}
            onChange={handleChange}
            onBlur={handleBlur}
            rows={20}
            className="bg-[#171717] p-2 rounded-lg self-stretch h-full"
            placeholder="Scene Summary"
            tooltipText={toolTipText.SceneSummary}
            wordLimit={wordLimits.scenesummary}
            minLimit={minWordLimits.scenesummary}
            errorMessage={errors.scene_summary}
          />


          {/* Save Button */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleSave}
              disabled={!state.isChanged}
              className={`border border-white/30 sm:px-[10px] sm:py-[4px] sm:rounded-[8px] sm:text-xs lg:px-[14px] lg:py-[8px] lg:rounded-[12px] lg:text-sm
    ${state.isChanged ? 'hover:bg-white/30 cursor-pointer' : 'opacity-40 cursor-not-allowed'}
  `}
            >
              {isNewScene ? 'Add Scene' : 'Update Scene'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSceneModal;
