import { useState } from 'react';
import { useNavigate, useBlocker } from 'react-router';
import { SparkleIcon, InfoCircleIcon } from '@shared/layout/icons';
import Spinner from '@shared/ui/spinner';
import { Tooltip } from '@heroui/react';
import { sendData } from '@api/apiMethods';
import { useMutation } from '@tanstack/react-query';
import UnsavedChangesModal from '@shared/unSavedChangesModal';
import {
  toolTipText,
  placeholderText,
  normalizeText,
  validateField,
  validateForm,
  genres,
  themes,
  wordLimits,
  minWordLimits
} from '@products/cine-scribe/constants/StoryGenerationConstants';
import Input from '@shared/ui/input';
import Textarea from '@shared/ui/textarea';
import Dropdown from '@shared/ui/DropDown';

// Define initial form data
const initialFormData = {
  story_title: '',
  backdrop: '',
  key_plot_points: '',
  logline: '',
  user_genres: [],
  themes: [],
  advancedFeatures: {
    PhilosophicalJourney: '',
    ThematicJourney: '',
    EmotionalJourney: '',
    OpeningSceneIdea: '',
    ClimaxIdea: '',
    EndingType: [],
    Inspiration: '',
    TargetAudience: [],
    NarrationStyle: [],
    SpecialElements: '',
    characters: {
      protagonist: [],
      antagonist: [],
      supporting: [],
    },
  },
};

// Reusable Tooltip Component
const InfoTooltip = ({ text, position }) => (
  <Tooltip text={text} position={position}>
    <img
      src={infoCircle}
      alt="info"
      className="w-[12px] h-[12px] cursor-pointer"
    />
  </Tooltip>
);

// Utility function to handle form updates
const handleFormUpdate = (setFormData, key, value) => {
  setFormData(prev => ({
    ...prev,
    [key]: value,
  }));
};

// Utility function to handle validation
const handleValidation = (setErrors, key, value, validateField) => {
  const errorMessage = validateField(key, value);
  if (errorMessage != null) {
    setErrors(prevErrors => ({
      ...prevErrors,
      [key]: errorMessage,
    }));
    return;
  }

  // Remove the key from errors if there's no error message
  setErrors(prevErrors => {
    const { [key]: _, ...rest } = prevErrors;
    return rest;
  });
};

// Reusable Modal Component
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-md">
      <div className="bg-primary-gray-50 text-sm px-6 py-5 rounded-xl shadow-pop-up shadow-shadow-pop-up w-[425px] max-h-screen overflow-y-auto flex flex-col items-center justify-start gap-4">
        {children}
      </div>
    </div>
  );
};

export default function AddProject() {
  const [formData, setFormData] = useState(() =>
    structuredClone(initialFormData)
  );
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const [check, setCheck] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [loadingText, setLoadingText] = useState('');
  const [saveClicked, setSaveClicked] = useState(true);
  const hasChanges =
    JSON.stringify(formData) !== JSON.stringify(initialFormData);

  const blocker = useBlocker(hasChanges && saveClicked);

  const getCleanedAdvancedFeatures = advancedFeatures => {
    const cleaned = Object.fromEntries(
      Object.entries(advancedFeatures).filter(([key, value]) => {
        if (key === 'characters') return true; // Handle separately
        if (Array.isArray(value)) {
          return value.length > 0; // Keep non-empty arrays
        }
        return value !== ''; // Keep non-empty strings
      })
    );

    let nonEmptyCharacters = {};

    // Helper to clean each character object
    const cleanCharacterArray = arr =>
      arr
        .map(char =>
          Object.fromEntries(
            Object.entries(char).filter(
              ([k, v]) => v !== '' && v !== null && v !== undefined
            )
          )
        )
        .filter(obj => Object.keys(obj).length > 0); // remove completely empty objects

    // Handle nested `characters` object
    if (advancedFeatures.characters) {
      const { protagonist, antagonist, supporting } =
        advancedFeatures.characters;

      if (protagonist && protagonist.length > 0) {
        const cleanedProtagonist = cleanCharacterArray(protagonist);
        if (cleanedProtagonist.length > 0)
          nonEmptyCharacters.protagonist = cleanedProtagonist;
      }
      if (antagonist && antagonist.length > 0) {
        const cleanedAntagonist = cleanCharacterArray(antagonist);
        if (cleanedAntagonist.length > 0)
          nonEmptyCharacters.antagonist = cleanedAntagonist;
      }
      if (supporting && supporting.length > 0) {
        const cleanedSupporting = cleanCharacterArray(supporting);
        if (cleanedSupporting.length > 0)
          nonEmptyCharacters.supporting = cleanedSupporting;
      }
    }

    // Remove characters if empty
    if (Object.keys(nonEmptyCharacters).length > 0) {
      cleaned.characters = nonEmptyCharacters;
    } else {
      delete cleaned.characters;
    }

    return cleaned;
  };

  const updateAdvancedFeatures = (key, value) => {
    setFormData(prev => ({
      ...prev,
      advancedFeatures: {
        ...prev.advancedFeatures,
        [key]: value, // Dynamically add/update keys
      },
    }));
  };

  const { mutateAsync: saveStoryMutation, isPending: isSaving } = useMutation({
    mutationKey: ['saveStory'],
    mutationFn: async () => {
      return await sendData({
        endpoint: `/story_idea_generation/save_user_inputs`,
        method: 'POST',
        body: {
          story_title: normalizeText(formData.story_title),
          user_genres: formData.user_genres,
          logline: normalizeText(formData.logline),
          themes: formData.themes,
          backdrop: normalizeText(formData.backdrop),
          key_plot_points: normalizeText(formData.key_plot_points),
          additional_params: getCleanedAdvancedFeatures(
            formData.advancedFeatures
          ),
        },
        responseMessage: 'Story saved successfully',
      });
    },
    onSuccess: response => {
      if (response?.data?.response?.story_id != 0) {
        navigate(
          `/cine-scribe/story-generation/${response?.data?.response?.story_id}/story-details/`
        );
      }
    },
    onError: error => {
      console.error('Error saving the story:', error);
      // if (error?.response?.status === 500) {
      //   alert('Internal Server Error. Please try again later.');
      // } else {
      //   alert('Something went wrong while saving the story.');
      // }
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  async function handleSaveStory() {
    const errors = validateForm(formData);
    setErrors(errors);

    if (Object.keys(errors).length > 0) {
      throw new Error('Validation failed');
    }
    setLoading(true);
    setLoadingText('Saving story');

    try {
      await saveStoryMutation();
    } catch (err) {
      console.error('Save failed', err);
    }
  }

  const [storyId, setStoryId] = useState(0);


  const { mutateAsync: checkStoryMutation, isPending: isChecking } =
    useMutation({
      mutationKey: ['checkStory'],
      mutationFn: async () => {
        return await sendData({
          endpoint: `/story_idea_generation/check_user_inputs`,
          method: 'POST',
          body: {
            story_title: formData.story_title,
            user_genres: formData.user_genres,
            themes: formData.themes,
            logline: formData.logline,
            backdrop: formData.backdrop,
            key_plot_points: formData.key_plot_points,
            additional_params: getCleanedAdvancedFeatures(
              formData.advancedFeatures
            ),
          },
          responseMessage: 'Story Inputs checked successfully',
        });
      },
      onSuccess: response => {
        const result = response?.data?.response;
        if (result['story_id'] != 0) {
          setStoryId(result['story_id']);
        }
        const falseKeys = Object.keys(result).filter(
          key => result[key] === false
        );
        const formattedKeys = falseKeys.map(key => key.replace(/_/g, ' '));
        if (falseKeys.length === 0) {
          setCheck(true);
        } else {
          setResponseMessage(
            `The following fields are irrelevant: ${formattedKeys
              .map(key => `**${key.toUpperCase()}`)
              .join(', ')}`
          );
          setIsPopupOpen(true);
        }
      },
      onError: error => {
        console.error('Error checking the story.', error);
        // if (error?.response?.status === 500) {
        //   alert('Internal Server Error. Please try again later.');
        // } else {
        //   alert('Something went wrong while checking the story.');
        // }
      },
      onSettled: () => {
        setLoading(false);
      },
    });

  async function handleCheckUserStory() {
    const errors = validateForm(formData);
    setErrors(errors);
    if (Object.keys(errors).length > 0) {
      blocker.reset(); // Reset blocker if there are errors
    }
    setLoading(true);
    setLoadingText('Checking user inputs');
    try {
      await checkStoryMutation();
    } catch (err) {
      console.error('Check failed', err);
    }
  }

  const handleCancel = async () => {
    // close popup
    setIsPopupOpen(false);
  };

  const { mutateAsync: generateWebArticlesMutation, isPending: isGenerating } =
    useMutation({
      mutationKey: ['generateStory'],
      mutationFn: async () => {
        return await sendData({
          endpoint: 'story_idea_generation/generate_web_articles',
          method: 'POST',
          body: JSON.stringify({
            story_id: parseInt(storyId),
          }),
          responseMessage: 'Web articles fetching',
        });
      },
      onSuccess: response => {
        if (response?.data?.response.story_id == storyId) {
          navigate(
            `/cine-scribe/story-generation/${response?.data?.response.story_id}/web-articles/`
          );
        }
      },
      onError: error => {
        console.error('Error creating the story:', error);
        // if (error?.response?.status === 500) {
        //   alert('Internal Server Error. Please try again later.');
        // } else {
        //   alert('Something went wrong while creating the story.');
        // }
      },
      onSettled: () => {
        setLoading(false);
      },
    });

  async function handleGenerateWebArticles() {
    setLoading(true);
    setLoadingText('Generating web articles');
    try {
      await generateWebArticlesMutation();
    } catch (err) {
      console.error('Generate failed', err);
    }
  }

  // Simplified form update handler
  const handleInputChange = key => e => {
    const { value } = e.target;
    handleFormUpdate(setFormData, key, value);
  };

  // Simplified validation handler
  const handleInputBlur = (key, validateField) => e => {
    const { value } = e.target;
    handleValidation(setErrors, key, value, validateField);
  };

  // Simplified advanced features update
  const handleAdvancedFeatureChange = key => e => {
    const { value } = e.target;
    updateAdvancedFeatures(key, value);
  };
  const [selected, setSelected] = useState([]);

  const options = [
    { label: 'React', value: 'react' },
    { label: 'Vue', value: 'vue' },
    { label: 'Angular', value: 'angular' },
    { label: 'Svelte', value: 'svelte' },
  ];
  return (
    <div className="lg:min-h-full sm:h-[891px] bg-primary-indigo-50 px-4 lg:py-20 sm:py-10 gap-[10px]">
      {loading && <Spinner text={loadingText} />}
      <div
        className="relative overflow-y-auto p-6 w-full lg:max-w-5xl sm:w-[630px] mx-auto  responsive-container text-center flex flex-col"
        style={{
          border: '1px solid rgba(229, 229, 229, 0.5)',
          borderRadius: '16px',
          background: '#171717',
        }}
      >
        {/* Form Heading */}
        <h2 className="text-2xl font-bold mb-4">
          From Idea to Screenplay in Seconds
        </h2>

        <p className="text-[#A3A3A3] text-center text-[14px]">
          Unleash your creativity with AI-powered story generation. Whether
          you’re a filmmaker, writer, or student, our tool transforms raw ideas
          into structured movie plots with characters, twists, and emotions that
          resonate. Stop staring at a blank page—start building your next
          cinematic masterpiece today.
        </p>
        {/* Form */}
        <form className="space-y-4 p-4 h-full flex flex-col overflow-y-auto scroll-smooth scrollbar-hide">
          <div className="text-left  rounded-lg">
            <h4 className="text-md font-bold mb-4">1. Basic Story Details</h4>

            {/* Title Input */}
            <div className="relative w-full grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Input
                tooltipText={toolTipText.Title}
                label={'Title'}
                required={true}
                value={formData.story_title}
                onChange={handleInputChange('story_title')}
                onBlur={handleInputBlur('title', validateField)}
                placeholder={placeholderText.Title}
                errorMessage={errors.title}
                wordLimit={wordLimits.title}
                minLimit={minWordLimits.title}
              />

              <Input
                tooltipText={toolTipText.Backdrop}
                label={'Backdrop'}
                errorMessage={errors.backdrop}
                required={true}
                value={formData.backdrop}
                onChange={handleInputChange('backdrop')}
                onBlur={handleInputBlur('backdrop', validateField)}
                placeholder={placeholderText.Backdrop}
                wordLimit={wordLimits.backdrop}
                minLimit={minWordLimits.backdrop}
              />

              <Dropdown
                label="Genres"
                tooltipText={toolTipText.Genre}
                required
                options={genres.map(genre => ({
                  label: genre,
                  value: genre,
                }))}
                value={formData.user_genres}
                onChange={newGenres => {
                  const updatedFormData = {
                    ...formData,
                    user_genres: newGenres,
                  };

                  setFormData(updatedFormData);
                  setErrors({
                    ...errors,
                    genres: validateField('genres', newGenres),
                  });
                }}
                isMultiple
                minSelection={1}
                maxSelection={5}
                errorMessage={errors.genres}
                error={!!errors.genres}
              />
              <Dropdown
                label="Themes"
                tooltipText={toolTipText.Themes}
                required
                options={themes.map(genre => ({
                  label: genre,
                  value: genre,
                }))}
                value={formData.themes}
                onChange={newThemes => {
                  const updatedFormData = {
                    ...formData,
                    themes: newThemes,
                  };

                  setFormData(updatedFormData);
                  setErrors({
                    ...errors,
                    themes: validateField('themes', newThemes),
                  });
                }}
                isMultiple
                minSelection={1}
                maxSelection={5}
                errorMessage={errors.themes}
                error={!!errors.themes}
              />
            </div>
          </div>
          <div className="text-left rounded-lg">
            <h4 className="text-md font-bold mb-4">
              2.⁠ ⁠Story Structure & Plot
            </h4>

            <div className="   w-full">
              <Textarea
                label={'Logline / Story Summary'}
                tooltipText={toolTipText.Logline}
                errorMessage={errors.logline}
                required={true}
                value={formData.logline}
                onChange={handleInputChange('logline')}
                onBlur={handleInputBlur('logline', validateField)}
                placeholder={placeholderText.Logline}
                rows={20}
                wordLimit={wordLimits.logline}
                minLimit={minWordLimits.logline}
              />

              <Textarea
                errorMessage={errors.keyplotpoints}
                label={'Key Plot Points'}
                tooltipText={toolTipText.KeyPlotPoints}
                required={true}
                value={formData.key_plot_points}
                onChange={handleInputChange('key_plot_points')}
                onBlur={handleInputBlur('keyplotpoints', validateField)}
                placeholder={placeholderText.KeyPlotPoints}
                rows={8}
                wordLimit={wordLimits.keyplotpoints}
                minLimit={minWordLimits.keyplotpoints}
              />
            </div>
          </div>

          <div className="w-full flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSaveClicked(false);
                handleSaveStory();
              }}
              className="button-primary sm:w-[180px] sm:h-[40px]"
            >
              <SparkleIcon size={16} color="white" className="h-4 w-4" />
              Create Project
            </button>
          </div>
        </form>
      </div>

      {/* Reusable Modals */}
      {check && (
        <Modal isOpen={check} onClose={() => setCheck(false)}>
          <p className="text-center text-sm text-primary-gray-900">
            Your inputs are spot on! Click on <b>Generate Story</b> to see your
            well-crafted ideas come to life. If you click on <b>Cancel</b> you
            cannot store your inputs.
          </p>
          <div className="mt-2 flex justify-end gap-4">
            <button
              onClick={handleGenerateWebArticles}
              className="button-primary"
            >
              Next
            </button>
            <button
              onClick={() => setCheck(false)}
              className="button-secondary"
            >
              Cancel
            </button>
          </div>
        </Modal>
      )}

      {isPopupOpen && (
        <Modal isOpen={isPopupOpen} onClose={handleCancel}>
          <div>{responseMessage}</div>
          <button onClick={handleCancel} className="button-secondary">
            Cancel
          </button>
        </Modal>
      )}

      <UnsavedChangesModal
        isOpen={blocker.state === 'blocked'}
        blocker={blocker}
        onSave={handleSaveStory}
      />
    </div>
  );
}
