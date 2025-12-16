import React, { useReducer, useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useBlocker } from 'react-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchData, sendData } from '@api/apiMethods';
import { useProductHeader } from '@products/cine-scribe/contexts/ProductHeaderContext';
import Textarea from '@shared/ui/textarea';
import Input from '@shared/ui/input';
import DetailsScriptGenerationLoading from './loading';
import UnsavedChangesModal from '@shared/unSavedChangesModal';
import {
  toolTipText,
  wordLimits,
  validateField,
  minWordLimits
} from '@products/cine-scribe/constants/ScriptConstant';
import { EditIcon, DeleteIcon } from '@shared/layout/icons';
import { Tooltip } from '@heroui/react';
import Button from '@shared/ui/button';
import Spinner from '@shared/ui/spinner';
import ScreenplayAnalysisPage from './GenerationCarousel';
import { min, minBy } from 'lodash';

// Tooltip-enabled Chip
const Chip = ({ value, subtitle, tooltip, onRemove }) => (
  <div className="relative inline-flex items-center bg-[#171717] rounded-full px-3 py-1 text-sm mr-2 mb-2 text-white group">
    <span className="font-medium">{value}</span>
    {subtitle && (
      <span className="ml-2 text-gray-400 text-xs">({subtitle})</span>
    )}
    <button
      type="button"
      onClick={onRemove}
      className="ml-2 cursor-pointer hover:text-[#FCFCFC]/50 text-[#FCFCFC]"
    >
      ×
    </button>
  </div>
);

// Reducer for controlled updates
function formReducer(state, action) {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'ADD_FLAW':
      return {
        ...state,
        protagonist_flaw: [...state.protagonist_flaw, action.value],
      };
    case 'REMOVE_FLAW':
      return {
        ...state,
        protagonist_flaw: state.protagonist_flaw.filter(
          (_, i) => i !== action.index
        ),
      };
    case 'ADD_CHARACTER':
      return {
        ...state,
        characters_present: {
          ...state.characters_present,
          [action.name]: action.role,
        },
      };
    case 'REMOVE_CHARACTER':
      const updated = { ...state.characters_present };
      delete updated[action.name];
      return { ...state, characters_present: updated };
    case 'SET_ALL':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

const DisplayScriptInfo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setHeaderProps } = useProductHeader();

  const initialFormData = {
    logline: '',
    protagonist_name: '',
    protagonist_flaw: [],
    subconscious_idea: '',
    philosophical_theme: '',
    characters_present: {},
  };
  const [initialData, setInitialData] = useState(null);


  const [formData, dispatch] = useReducer(formReducer, initialFormData);
  const [newFlaw, setNewFlaw] = useState('');
  const [actAnalysisProcessing, setActAnalysisProcessing] = useState(false);
  const [newCharacterName, setNewCharacterName] = useState('');
  const [newCharacterRole, setNewCharacterRole] = useState('');
  const [characterRole, setCharacterRole] = useState('');
  const [errors, setErrors] = useState({});
  const flawLimit = wordLimits.protagonistflaw;
  const isFlawLimitReached = formData.protagonist_flaw.length > flawLimit;
  const [editingRole, setEditingRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');

  const {
    data: scriptDetailsData,
    isPending,
    error,
    refetch
  } = useQuery({
    queryKey: ['scriptDetails', id],
    queryFn: async () => {
      const response = await fetchData({
        endpoint: `/script/display_script_details/${id}`,
        method: 'GET',
      });
      return response.data.response;
    },
    enabled: !!id,
    keepPreviousData: false,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!scriptDetailsData?.background_process) return;

    const interval = setInterval(() => {
      refetch(); // now guaranteed to exist
    }, 60_000);

    return () => clearInterval(interval);
  }, [scriptDetailsData, refetch]);


  useEffect(() => {
    if (scriptDetailsData) {

      const loadedData = {
        logline: scriptDetailsData.logline || '',
        protagonist_name: scriptDetailsData.protagonist_name || '',
        protagonist_flaw: scriptDetailsData.protagonist_flaw || [],
        subconscious_idea: scriptDetailsData.subconscious_idea || '',
        philosophical_theme: scriptDetailsData.philosophical_theme || '',
        characters_present: scriptDetailsData.characters_present || {},
      };

      dispatch({ type: 'SET_ALL', payload: loadedData });
      setInitialData(loadedData);
    }
  }, [scriptDetailsData]);

  const isFormChanged = () => {
    if (!initialData) return false;
    return JSON.stringify(formData) !== JSON.stringify(initialData);
  };
  const isChanged = useMemo(isFormChanged, [formData, initialData]);
  const blocker = useBlocker(isChanged);


  useEffect(() => {
    setHeaderProps({
      showButton: !scriptDetailsData?.script_analysis_data,
      buttonText: scriptDetailsData?.background_process
        ? 'Script Analysing...'
        : 'Generate Script Analysis',
      onButtonClick: handleGenerateActAnalysis,
      showSWStatus: true,
      scriptStatusBarDetails: {
        script_title: scriptDetailsData?.script_title,
        script_id: true,
        script_info: true,
        script_analysis_data: scriptDetailsData?.script_analysis_data,
      },
      disableButton: isChanged || scriptDetailsData?.background_process ||
        actAnalysisProcessing,
      showDownload: true,
      pdfData: formData,
    });
  }, [scriptDetailsData, actAnalysisProcessing, isChanged, formData]);



  const updateScriptDetailsMutation = useMutation({
    mutationKey: ['updateScriptDetails', id],
    mutationFn: changedData =>
      sendData({
        endpoint: `/script_processing/update_script_details/${id}`,
        method: 'PUT',
        body: changedData,
      }),

    onSuccess: () => {
      setInitialData(formData); // mark current data as the new baseline
      setLoading(false);
    },
  });


  const handleChange = field => e => {

    dispatch({ type: 'SET_FIELD', field, value: e.target.value });
  };

  const handleAddFlaw = () => {
    if (!newFlaw.trim()) return;
    dispatch({ type: 'ADD_FLAW', value: newFlaw.trim() });
    setNewFlaw('');
    setErrors(prev => ({ ...prev, protagonistflaw: '' }));
  };

  const handleInputBlur = key => e => {
    const value = e.target.value;

    const errorMessage = validateField(key, value);
    setErrors(prev => ({ ...prev, [key]: errorMessage || '' }));

  };

  const handleAddCharacter = () => {
    const name = newCharacterName.trim();
    const role = newCharacterRole.trim();
    const characterCount = Object.keys(formData.characters_present).length;
    const newErrors = {};
    let hasError = false;

    if (characterCount >= 30) {
      setErrors(prev => ({
        ...prev,
        characters_present: 'You can only add 30 characters',
      }));
      return;
    }

    if (!name) {
      newErrors.newCharacterName = 'Name is required.';
      hasError = true;
    }
    if (!role) {
      newErrors.newCharacterRole = 'Role is required.';
      hasError = true;
    }
    if (name.split(/\s+/).length > 10) {
      newErrors.newCharacterName = 'Name cannot exceed 10 words.';
      hasError = true;
    }
    if (role.split(/\s+/).length > 10) {
      newErrors.newCharacterRole = 'Role cannot exceed 10 words.';
      hasError = true;
    }

    if (hasError) {
      setErrors(prev => ({ ...newErrors }));
      return;
    }

    dispatch({ type: 'ADD_CHARACTER', name, role });
    setNewCharacterName('');
    setNewCharacterRole('');
    setErrors(prev => ({
      ...prev,
      newCharacterName: '',
      newCharacterRole: '',
      characters_present: '',
    }));
  };



  const handleSave = async () => {
    const newErrors = {};
    let hasError = false;

    // Validate logline
    if (!formData.logline || !formData.logline.trim()) {
      newErrors.logline = 'Logline is required.';
      hasError = true;
    }
    else {
      const loglineError = validateField('logline', formData.logline);
      if (loglineError) {
        newErrors.logline = loglineError;
        hasError = true;
      }
    }

    // Validate protagonist name
    if (!formData.protagonist_name || !formData.protagonist_name.trim()) {
      newErrors.protagonistname = 'Protagonist name is required.';
      hasError = true;
    } else {
      const protagonistError = validateField('protagonist_name', formData.protagonist_name);
      if (protagonistError) {
        newErrors.protagonistname = protagonistError;
        hasError = true;
      }
    }

    // Validate protagonist flaw
    if (!formData.protagonist_flaw || formData.protagonist_flaw.length === 0) {
      newErrors.protagonistflaw = 'At least one protagonist flaw is required.';
      hasError = true;
    }

    const protagonistFlawError = validateField('protagonist_flaw', formData.protagonist_flaw);
    if (protagonistFlawError) {
      newErrors.protagonistflaw = protagonistFlawError;
      hasError = true;
    }

    // Validate subconscious idea
    if (!formData.subconscious_idea || !formData.subconscious_idea.trim()) {
      newErrors.subconsciousidea = 'Subconscious idea is required.';
      hasError = true;
    } else {
      const subconsciousError = validateField('subconscious_idea', formData.subconscious_idea);
      if (subconsciousError) {
        newErrors.subconsciousidea = subconsciousError;
        hasError = true;
      }
    }

    // Validate philosophical theme
    if (!formData.philosophical_theme || !formData.philosophical_theme.trim()) {
      newErrors.philosophicaltheme = 'Philosophical theme is required.';
      hasError = true;
    } else {
      const philosophicalError = validateField('philosophical_theme', formData.philosophical_theme);
      if (philosophicalError) {
        newErrors.philosophicaltheme = philosophicalError;
        hasError = true;
      }
    }

    // Validate characters
    if (!formData.characters_present || Object.keys(formData.characters_present).length === 0) {
      newErrors.characterspresent = 'At least one character is required.';
      hasError = true;
    }

    // Stop execution if errors exist
    if (hasError) {

      setErrors(newErrors);
      console.warn('Validation failed:', newErrors);
      return;
    }

    // If valid, continue to save
    setLoading(true);
    setLoadingText('Saving script details...');
    updateScriptDetailsMutation.mutate(formData);
  };



  const generateActAnalysisMutation = useMutation({
    mutationKey: ['generateActAnalysis', id],
    mutationFn: async () => {
      return await sendData({
        endpoint: `/script_analysis/generate_script_analysis/${id}?report_level=${encodeURIComponent('low')}`,
        method: 'POST',
        responseMessage: 'Results will appear shortly—please refresh later.',
      });
    },
  });

  async function handleGenerateActAnalysis() {
    setActAnalysisProcessing(true);
    generateActAnalysisMutation.mutate({

      onError: error => {
        console.error('Error generating act analysis:', error);
      },
    });
  }



  if (isPending)
    return (
      <div className="mt-[10px] flex flex-1 flex-col w-full responsive-container mx-auto pt-4">
        <DetailsScriptGenerationLoading />
      </div>
    );

  if (error) return <p className="text-red-500">Failed to load details.</p>;

  return (
    <div className="flex flex-col w-full h-full bg-[#0A0A0A] overflow-y-auto scrollbar-gray">
      {loading && <Spinner text={loadingText} />}
      {(scriptDetailsData?.background_process || actAnalysisProcessing) && (
        <ScreenplayAnalysisPage />
      )}
      <div className="mt-[6px] flex flex-1 flex-col w-full responsive-container mx-auto">
        <section className="w-full flex flex-col  mb-10">
          {/* Script Info Header */}
          <div className="w-full responsive-container mx-auto  rounded-xl shadow-lg  space-y-6 text-white">
            {/* Header Section */}
            <div className="rounded-[16px] w-full flex flex-col gap-1 justify-center items-center  py-3 px-6">
              <h4 className="text-[#FCFCFC] text-[16px] font-medium">
                Discover Every Detail of Your Script
              </h4>
              <p className="text-[#A3A3A3] text-center text-[14px]">
                Get the full picture of your script — logline, theme,
                protagonist and characters, — all laid out in one place. It’s
                your script’s creative blueprint before you dive into deeper
                analysis.
              </p>
            </div>
          </div>

          {/* Logline */}
          <Textarea
            label="Logline"
            tooltipText={toolTipText.Logline}
            value={formData.logline}
            required
            onChange={handleChange('logline')}
            placeholder="Enter your story logline..."
            onBlur={handleInputBlur('logline')}
            errorMessage={errors.logline}
            readOnly={
              scriptDetailsData?.script_analysis_data ||
              scriptDetailsData?.background_process
            }
            minLimit={minWordLimits.logline}
            wordLimit={wordLimits.logline}
          />

          {/* Protagonist Name */}
          <Textarea
            label="Protagonist Name"
            tooltipText={toolTipText.ProtagonistName}
            value={formData.protagonist_name}
            required
            onChange={handleChange('protagonist_name')}
            placeholder="Enter protagonist name..."
            onBlur={handleInputBlur('protagonistname')}
            errorMessage={errors.protagonistname}
            readOnly={
              scriptDetailsData?.script_analysis_data ||
              scriptDetailsData?.background_process
            }
            minLimit={minWordLimits.protagonistname}
            wordLimit={wordLimits.protagonistname}
          />

          {/* Protagonist Flaw */}
          <div className="mt-2">
            <Tooltip
              className="max-w-[153px] text-xs"
              content={toolTipText.ProtagonistFlaw}
              placement="right"
              showArrow
            >
              <label className="text-sm font-medium flex items-center mb-1 gap-1 w-fit">
                Protagonist Flaw <span className="text-[#EB5545]">*</span>
              </label>
            </Tooltip>

            <div className="flex flex-wrap mb-2">
              {formData.protagonist_flaw.slice(0, 10).map((flaw, i) => (
                <Chip
                  key={i}
                  value={flaw}
                  onRemove={
                    !scriptDetailsData?.script_analysis_data
                      ? () => {
                          const updated = formData.protagonist_flaw.filter(
                            (_, idx) => idx !== i
                          );
                          dispatch({
                            type: 'SET_FIELD',
                            field: 'protagonist_flaw',
                            value: updated,
                          });
                          setErrors(prev => ({
                            ...prev,
                            protagonistflaw: updated.length
                              ? ''
                              : 'At least 1 flaw is required.',
                          }));
                        }
                      : undefined
                  }
                />
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                value={newFlaw}
                onChange={e => setNewFlaw(e.target.value)}
                onKeyDown={e =>
                  e.key === 'Enter' && !scriptDetailsData?.script_analysis_data
                    ? (e.preventDefault(), handleAddFlaw())
                    : null
                }
                placeholder={'Add flaw...'}
                disabled={
                  isFlawLimitReached ||
                  scriptDetailsData?.script_analysis_data ||
                  scriptDetailsData?.background_process
                }
                minLimit={minWordLimits.protagonistflaw}
                wordLimit={wordLimits.protagonistflaw}
              />
            </div>

            {!scriptDetailsData?.script_analysis_data &&
              (errors.protagonistflaw || isFlawLimitReached) && (
                <p className="text-[#EB5545] text-xs mt-1">
                  {errors.protagonistflaw ||
                    'Protagonist Flaw must be at most 10 flaws'}
                </p>
              )}
          </div>

          {/* Subconscious Idea & Philosophical Theme */}
          <div className="flex items-center justify-center gap-2 mt-2">
            <Textarea
              label="Subconscious Idea"
              tooltipText={toolTipText.SubconsciousIdea}
              value={formData.subconscious_idea}
              required
              onChange={handleChange('subconscious_idea')}
              placeholder="Describe the subconscious idea..."
              onBlur={handleInputBlur('subconsciousidea')}
              errorMessage={errors.subconsciousidea}
              readOnly={
                scriptDetailsData?.script_analysis_data ||
                scriptDetailsData?.background_process
              }
              minLimit={minWordLimits.subconsciousidea}
              wordLimit={wordLimits.subconsciousidea}
            />
            <Textarea
              label="Philosophical Theme"
              tooltipText={toolTipText.PhilosophicalTheme}
              value={formData.philosophical_theme}
              required
              onChange={handleChange('philosophical_theme')}
              placeholder="What philosophical theme drives the story?"
              onBlur={handleInputBlur('philosophicaltheme')}
              errorMessage={errors.philosophicaltheme}
              readOnly={
                scriptDetailsData?.script_analysis_data ||
                scriptDetailsData?.background_process
              }
              minLimit={minWordLimits.philosophicaltheme}
              wordLimit={wordLimits.philosophicaltheme}
            />
          </div>

          {/* Characters Present Table */}
          <div className="mt-6">
            <Tooltip
              className="max-w-[153px]"
              content={toolTipText.CharactersPresent}
              placement="right"
              showArrow
            >
              <label className="text-sm font-medium flex items-center mb-1 gap-1 w-fit">
                Characters Present
              </label>
            </Tooltip>

            <div className="w-full mt-2 overflow-x-auto">
              <table className="min-w-full text-left text-sm rounded-[16px] bg-[#1A1A1A]">
                <thead>
                  <tr className="bg-[#0A0A0A] font-semibold text-[#E5E5E5]">
                    <th className="px-4 py-2 w-[60px]">S.No</th>
                    <th className="px-4 py-2">Character Name</th>
                    <th className="px-4 py-2">Character Role</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(formData.characters_present).length === 0 ? (
                    <tr>
                      <td
                        colSpan="3"
                        className="px-4 py-3 text-center text-gray-500 italic"
                      >
                        No characters added yet
                      </td>
                    </tr>
                  ) : (
                    Object.entries(formData.characters_present).map(
                      ([name, role], i) => {
                        const isEditing = editingRole === name;
                        return (
                          <tr
                            key={name}
                            className="group hover:bg-[#1A1A1A] transition-colors rounded-[8px]"
                          >
                            <td className="px-4 py-2">{i + 1}</td>
                            <td className="px-4 py-2">
                              <p className="border border-white/10 py-1 px-4 rounded-[16px]">
                                {name}
                              </p>
                            </td>
                            <td className="px-4 py-2">
                              <div className="border border-white/10 py-1 px-4 rounded-[16px] flex items-center justify-between">
                                {isEditing ? (
                                  <div className="w-full">
                                    <Input
                                      value={characterRole}
                                      autoFocus
                                      onChange={e => {
                                        const value = e.target.value;

                                        // Count words
                                        const wordCount =
                                          value.trim() === ''
                                            ? 0
                                            : value.trim().split(/\s+/).length;

                                        if (wordCount > 10) {
                                          // Show error but DO NOT update characterRole
                                          setErrors(prev => ({
                                            ...prev,
                                            [`role_${name}`]:
                                              'Role cannot exceed 10 words.',
                                          }));
                                        } else {
                                          // Clear error and allow update
                                          setErrors(prev => ({
                                            ...prev,
                                            [`role_${name}`]: '',
                                          }));
                                          setCharacterRole(value);
                                        }
                                      }}
                                      onBlur={() => {
                                        if (
                                          !errors[`role_${name}`] &&
                                          characterRole.trim()
                                        ) {
                                          dispatch({
                                            type: 'ADD_CHARACTER',
                                            name,
                                            role: characterRole.trim(),
                                          });
                                          setEditingRole(null);
                                        }
                                      }}
                                      onKeyDown={e => {
                                        if (e.key === 'Enter') {
                                          e.preventDefault();
                                          if (
                                            !errors[`role_${name}`] &&
                                            characterRole.trim()
                                          ) {
                                            dispatch({
                                              type: 'ADD_CHARACTER',
                                              name,
                                              role: characterRole.trim(),
                                            });
                                            setEditingRole(null);
                                          }
                                        }
                                      }}
                                      placeholder="Edit role..."
                                      className="w-full"
                                      wordLimit={wordLimits.characterrole}
                                      minLimit={minWordLimits.characterrole}
                                      errorMessage={errors[`role_${name}`]}
                                    />
                                  </div>
                                ) : (
                                  role
                                )}

                                <div className="flex justify-center items-center gap-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                  {!(
                                    scriptDetailsData?.script_analysis_data ||
                                    scriptDetailsData?.background_process
                                  ) && (
                                    <>
                                      <Button
                                        size="sm"
                                        onClick={() => {
                                          setEditingRole(name);
                                          setCharacterRole(role);
                                        }}
                                        className="p-0 transition-colors cursor-pointer"
                                      >
                                        <EditIcon size={20} color="#FFFFFF" />
                                      </Button>

                                      <Button
                                        size="sm"
                                        onClick={() => {
                                          dispatch({
                                            type: 'REMOVE_CHARACTER',
                                            name,
                                          });

                                          setErrors(prev => ({
                                            ...prev,
                                            characters_present:
                                              Object.keys(
                                                formData.characters_present
                                              ).length -
                                                1 ===
                                              0
                                                ? 'At least 1 character is required.'
                                                : '',
                                          }));
                                        }}
                                        className="p-0 transition-colors cursor-pointer"
                                      >
                                        <DeleteIcon size={20} color="#FFFFFF" />
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      }
                    )
                  )}
                </tbody>
              </table>
              {errors.characterspresent && (
                <p className="text-[#EB5545] text-xs">
                  {errors.characterspresent}
                </p>
              )}
            </div>

            {/* Add Character */}
            {!(
              scriptDetailsData?.script_analysis_data ||
              scriptDetailsData?.background_process
            ) &&
              Object.keys(formData.characters_present).length <= 30 && (
                <div className="mt-4">
                  <h3 className="text-sm text-[#E5E5E5]">Add Character</h3>

                  <div className="flex gap-2 mt-1">
                    {/* Character Name */}
                    <div className="flex-1">
                      <Input
                        value={newCharacterName}
                        onChange={e => setNewCharacterName(e.target.value)}
                        // onBlur={e => { handleAddCharacter()}}

                        onKeyDown={e =>
                          e.key === 'Enter' &&
                          (e.preventDefault(), handleAddCharacter())
                        }
                        placeholder="Character name..."
                        wordLimit={wordLimits.charactername}
                        minLimit={minWordLimits.charactername}
                        errorMessage={errors.newCharacterName}
                      />
                    </div>

                    {/* Character Role */}
                    <div className="flex-1">
                      <Input
                        value={newCharacterRole}
                        onChange={e => setNewCharacterRole(e.target.value)}
                        // onBlur={e => { handleAddCharacter()}}
                        onKeyDown={e =>
                          e.key === 'Enter' &&
                          (e.preventDefault(), handleAddCharacter())
                        }
                        placeholder="Character role..."
                        wordLimit={wordLimits.characterrole}
                        minLimit={minWordLimits.characterrole}
                        errorMessage={errors.newCharacterRole}
                      />
                    </div>

                    {/* Add Character Button */}
                    <div className="flex items-center justify-center">
                      <Button
                        size="md"
                        className="bg-[#175CD3] mb-3 hover:bg-[#175CD3]/80 text-[#FCFCFC] place-items-center text-sm px-4 py-2 rounded-lg"
                        onClick={handleAddCharacter}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              )}

            {errors.characters_present && (
              <p className="text-[#EB5545] text-xs mt-1">
                {errors.characters_present}
              </p>
            )}
          </div>

          {!scriptDetailsData?.script_analysis_data && (
            <div className="w-full flex justify-center py-4 bg-[#0A0A0A] border-t border-[#1E1E1E] sticky bottom-0">
              <Button
                size="md"
                onClick={handleSave}
                disabled={!isChanged}
                className={`self-center   cursor-pointer bg-default-400 hover:bg-[#52525b] text-[#FCFCFC] rounded-[12px]  ${
                  isChanged
                    ? 'cursor-pointer '
                    : 'cursor-not-allowed opacity-50'
                  }`}
                
               
              >
                Save Changes
              </Button>
            </div>
          )}
        </section>
      </div>
      <UnsavedChangesModal
        isOpen={blocker.state === 'blocked'}
        blocker={blocker}
        onSave={handleSave}
      />
    </div>
  );
};

export default DisplayScriptInfo;
