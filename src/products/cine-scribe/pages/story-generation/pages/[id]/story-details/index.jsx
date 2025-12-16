import {
  wordLimits,
  toolTipText,
  placeholderText,
  genres,
  themes,
  validateField,
  validateForm,
} from '@products/cine-scribe/constants/StoryGenerationConstants';
import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router';
import { useNavigate, useBlocker } from 'react-router';
import Input from '@shared/ui/input';
import Textarea from '@shared/ui/textarea';
import Spinner from '@shared/ui/spinner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchData, sendData } from '@api/apiMethods';
import UnsavedChangesModal from '@shared/unSavedChangesModal';
import CharacterManager from '../../../components/CharacterManager';
import { Divider, Tab, Tabs } from '@heroui/react';
import Dropdown from '@shared/ui/DropDown';
import Button from '@shared/ui/button';
import DetailsStoryGenerationLoading from './loading';
import { useProductHeader } from '@products/cine-scribe/contexts/ProductHeaderContext';
import { minWordLimits } from '@products/cine-scribe/constants/ScriptConstant';

export default function StoryDetails() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    story_title: '',
    backdrop: '',
    key_plot_points: '',
    logline: '',
    user_genres: [],
    themes: [],
    advancedFeatures: {
      ProtagonistName: '',
      ProtagonistTraits: '',
      ProtagonistMotivation: '',
      ProtagonistFlaws: '',
      SupportingCharacters: '',
      AntagonistName: '',
      AntagonistTraits: '',
      PhilosophicalJourney: '',
      ThematicJourney: '',
      EmotionalJourney: '',
      OpeningSceneIdea: '',
      ClimaxIdea: '',
      EndingType: [], // Multi-select (limit to 3)
      Inspiration: '',
      TargetAudience: [], // Multi-select (limit to 4)
      NarrationStyle: [], // Single-select (limit to 1)
      SpecialElements: '',
      characters: {
        protagonist: [],
        antagonist: [],
        supporting: [],
      },
    },
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [check, setCheck] = useState(false);
  const { setHeaderProps } = useProductHeader();

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [loadingText, setLoadingText] = useState('');
  const [originalFormData, setOriginalFormData] = useState(formData);
  const [saveClicked, setSaveClicked] = useState(true);
  const navigate = useNavigate();
  const id = useParams().id;
  const [tabKey, setTabKey] = useState('Basic_Input');

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

  const isFormChanged = () => {
    if (!originalFormData) return false;

    // Clean advancedFeatures on both objects
    const cleanedFormData = {
      ...formData,
      advancedFeatures: getCleanedAdvancedFeatures(
        formData?.advancedFeatures || {}
      ),
    };

    const cleanedOriginalData = {
      ...originalFormData,
      advancedFeatures: getCleanedAdvancedFeatures(
        originalFormData?.advancedFeatures || {}
      ),
    };

    // Compare final cleaned objects
    return (
      JSON.stringify(cleanedFormData) !== JSON.stringify(cleanedOriginalData)
    );
  };

  const hasChanges = useMemo(isFormChanged, [formData, originalFormData]);

  const blocker = useBlocker(hasChanges && saveClicked);

  // Helper to update advanced features
  const updateAdvancedFeatures = (key, value) => {
    setFormData(prev => ({
      ...prev,
      advancedFeatures: {
        ...prev.advancedFeatures,
        [key]: value,
      },
    }));
  };

  const {
    data: storyDetailsData = {},
    error,
    isPending,
  } = useQuery({
    queryKey: ['storyDetails', id],
    queryFn: async () => {
      const response = await fetchData({
        endpoint: `/story/display_story_inputs?story_id=${id}`,
        method: 'GET',

        responseMessage: 'Story Details Fetched Successfully',
      });

      return response.data.response; // return whole response object
    },
    enabled: !!id, // prevent premature call
    keepPreviousData: true,
    staleTime: 0,
    refetchOnMount: true, // Refetch when remounting
    refetchOnWindowFocus: false, // Optional: disable focus refetch
  });

  useEffect(() => {
    if (storyDetailsData && Object.keys(storyDetailsData).length > 0) {
      const initialForm = {
        story_title: storyDetailsData.story_title || '',
        backdrop: storyDetailsData.backdrop || '',
        key_plot_points: storyDetailsData.key_plot_points || '',
        logline: storyDetailsData.logline || '',
        user_genres: storyDetailsData.user_genres || [],
        themes: storyDetailsData.themes || [],
        advancedFeatures: storyDetailsData.additional_params || {},
      };

      //  new way (deep clone to break reference)
      const deepClone = JSON.parse(JSON.stringify(initialForm));
      setFormData(deepClone);
      setOriginalFormData(JSON.parse(JSON.stringify(initialForm)));
    }
  }, [storyDetailsData]);

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
            story_id: id,
          },
          responseMessage: 'Story Inputs checked successfully',
        });
      },
      onSuccess: response => {
        const result = response?.data?.response;
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
        console.error('Error checking the story:', error);
      },
      onSettled: () => {
        setLoading(false);
      },
    });

  async function handleCheckUserStory(event) {
    event.preventDefault();
    const errors = validateForm(formData);
    setErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setLoading(true);
    setLoadingText('We’re reviewing all the details you’ve entered.');

    try {
      await checkStoryMutation();
    } catch (err) {
      console.error('Check failed', err);
    }
  }

  const { mutateAsync: saveStoryMutation, isPending: isSaving } = useMutation({
    mutationKey: ['saveStory'],
    mutationFn: async () => {
      return await sendData({
        endpoint: `/story_idea_generation/save_user_inputs`,
        method: 'POST',
        body: {
          story_id: id,
          story_title: formData.story_title,
          user_genres: formData.user_genres,
          logline: formData.logline,
          themes: formData.themes,
          backdrop: formData.backdrop,
          key_plot_points: formData.key_plot_points,
          additional_params: getCleanedAdvancedFeatures(
            formData.advancedFeatures
          ),
        },
        responseMessage: 'Story saved successfully',
      });
    },
    onSuccess: response => {
      if (response?.data?.response?.story_id == id) {
        queryClient.invalidateQueries(['storyDetails', id]);
      }
    },
    onError: error => {
      console.error('Error saving the story:', error);
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  const handleSaveStory = async () => {
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
  };

  const { mutateAsync: editedStoryDetailsMutation, isPending: isEditing } =
    useMutation({
      mutationKey: ['editedStoryDetails'],
      mutationFn: async id => {
        return await sendData({
          endpoint: `/story_idea_generation/edit_chat`,
          method: 'PUT',
          body: {
            story_id: Number(id, 10),
            user_inputs: getCleanedAdvancedFeatures(formData.advancedFeatures),
          },
          responseMessage: 'Story edited successfully',
        });
      },
      onSuccess: response => {
        setLoading(false);

        if (response?.data?.response?.story == 'Fail') {
          const result = response?.data?.response;
          const falseKeys = Object.keys(result).filter(
            key => result[key] === false
          );
          // Format keys to be more readable (replace underscores with spaces)
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
          queryClient.invalidateQueries(['storyStatusBarDetails', id]);
        } else {
          navigate(
            `/cine-scribe/story-generation/${response?.data?.response?.story_id}/story-arena/`
          );
        }
      },
      onError: error => {
        console.error('Error editing the story', error);
        // if (error?.response?.status === 500) {
        //   alert('Internal Server Error. Please try again later.');
        // } else {
        //   alert('Something went wrong while editing the story.');
        // }
      },
      onSettled: () => {
        setLoading(false);
      },
    });

  async function handleSendMessage() {
    const errors = validateForm(formData);
    setErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setLoading(true);
    setLoadingText('Rewriting your story');
    try {
      await editedStoryDetailsMutation(id);
    } catch (err) {
      console.error('Edit failed', err);
    }
  }

  // Stub for popup cancel
  const handleCancel = () => {
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
            story_id: parseInt(id),
          }),
          responseMessage: 'Web articles fetching',
        });
      },
      onSuccess: response => {
        if (response?.data?.response.story_id == id) {
          navigate(
            `/cine-scribe/story-generation/${response?.data?.response.story_id}/web-articles/`
          );
        }
      },
      onError: error => {
        console.error('Error creating the story:', error);
      },
      onSettled: () => {
        setLoading(false);
      },
    });

  async function handleGenerateWebArticles(event) {
    setLoading(true);
    setLoadingText('Agents searching — this might take a minute or two.');
    try {
      await generateWebArticlesMutation();
    } catch (err) {
      console.error('Generate failed', err);
    }
  }
  const { data: storyDetails = {} } = useQuery({
    queryKey: ['storyStatusBarDetails', id],
    queryFn: async () => {
      const response = await fetchData({
        endpoint: `/story/display_story_status?story_id=${id}`,
        method: 'GET',
      });
      return response.data.response; // return whole response object
    },
    enabled: !!id, // prevent premature call
    keepPreviousData: true,
    staleTime: 0,
    refetchOnMount: true, // Refetch when remounting
    refetchOnWindowFocus: false, // Optional: disable focus refetch
  });

  // set header props
 useEffect(() => {
   let newHeaderProps;

   // CASE 1: story_chat_status === true → Show "Save & Re-Generate Story"
   if (storyDetails?.story_chat_status === true) {
     newHeaderProps = {
       showButton: tabKey === 'advanced_inputs',
       buttonText: 'Re-Generate Story',
       onButtonClick: () => {
         setSaveClicked(false);
         handleSendMessage();
       },
       disableButton: !hasChanges, // Disable if no changes
       showSGStatus: true,
       storyStatusBarDetails: storyDetails,
     };
   }
   // CASE 2: Default existing logic for Generate Web Articles
   else {
     newHeaderProps = {
       showButton:
         tabKey === 'advanced_inputs' &&
         storyDetails?.web_articles_status === false,
       buttonText: 'Generate Web Articles',
       onButtonClick: handleCheckUserStory,
       showSGStatus: true,
       storyStatusBarDetails: storyDetails,
       disableButton: hasChanges,
     };
   }

   // To avoid re-render loop, compare and update only if different
   setHeaderProps(prev => {
     const prevStr = JSON.stringify(prev);
     const newStr = JSON.stringify(newHeaderProps);
     if (prevStr !== newStr) {
       return newHeaderProps;
     }
     return prev;
   });
 }, [
   tabKey,
   storyDetails?.web_articles_status,
   storyDetails?.story_chat_status,
   hasChanges,
 ]);


  return (
    <div className="flex flex-col  w-full h-full bg-[#0A0A0A]">
      {loading && <Spinner text={loadingText} />}

      <div className="mt-[10px] flex flex-1 flex-col w-full responsive-container mx-auto pt-4">
        {isPending ? (
          <div className="mt-[10px] flex flex-1 flex-col w-full responsive-container mx-auto py-4">
            <DetailsStoryGenerationLoading />
          </div>
        ) : error ? (
          <div className="w-full flex-1 mx-auto flex flex-col gap-10 items-center justify-center bg-primary-gray-100">
            <p className="text-red-500">Failed to story Details.</p>
          </div>
        ) : storyDetailsData && Object.keys(storyDetailsData).length > 0 ? (
          <div className="relative  pb-1 px-6 w-full max-w-5xl   flex flex-col">
            <form className="w-full flex flex-col items-center ">
              <div className="flex flex-col items-center  ">
                <Tabs
                  aria-label="Options"
                  selectedKey={tabKey}
                  onSelectionChange={setTabKey}
                >
                  <Tab key="Basic_Input" title="Basic Inputs*">
                    <div className="text-center">
                      <span className="text-xl font-bold">
                        A Story in Just a Few Clicks
                      </span>

                      <p className="text-[#A3A3A3]  mt-2 text-center text-[14px]">
                        Start with the essentials—genre, theme, and a brief
                        idea. Our AI instantly shapes these basics into a
                        complete movie story outline. Perfect for quick
                        brainstorming, classroom projects, or when you need
                        inspiration fast.
                      </p>
                    </div>
                    <Divider />
                    <section className="w-full space-y-4 p-2">
                      <h4 className="mb-4 text-lg font-semibold">
                        1. Basic Story Details
                      </h4>
                      <div className="grid grid-cols-4 grid-rows-2  w-full">
                        <div className="col-span-2">
                          <Input
                            label={'Title'}
                            tooltipText={toolTipText.Title}
                            errorMessage={errors.title}
                            required={true}
                            readOnly={storyDetails?.web_articles_status}
                            value={formData.story_title}
                            onChange={e => {
                              const { value } = e.target;
                              const updatedFormData = {
                                ...formData,
                                story_title: value,
                              };
                              setFormData(updatedFormData);
                            }}
                            onBlur={e => {
                              const { value } = e.target;
                              setErrors(prevErrors => ({
                                ...prevErrors,
                                title: validateField('title', value),
                              }));
                            }}
                            placeholder={placeholderText.Title}
                            wordLimit={wordLimits.title}
                            minLimit={minWordLimits.title}
                          />
                        </div>
                        <div className="row-span-2 col-start-3 col-span-2 ml-2 ">
                          <div>
                            <Textarea
                              label="Backdrop"
                              tooltipText={toolTipText.Backdrop}
                              errorMessage={errors.backdrop}
                              required={true}
                              readOnly={storyDetails?.web_articles_status}
                              value={formData.backdrop}
                              onChange={e => {
                                const { value } = e.target;
                                const updatedFormData = {
                                  ...formData,
                                  backdrop: e.target.value,
                                };
                                setFormData(updatedFormData);
                              }}
                              onBlur={e => {
                                const { value } = e.target;
                                setErrors(prevErrors => ({
                                  ...prevErrors,
                                  backdrop: validateField('backdrop', value),
                                }));
                              }}
                              placeholder={placeholderText.Backdrop}
                              rows={6}
                              wordLimit={wordLimits.backdrop}
                              minLimit={minWordLimits.backdrop}
                            />
                          </div>
                        </div>

                        <div className="row-start-2  mr-2">
                          <Dropdown
                            label="Genres"
                            disabled={storyDetails?.web_articles_status}
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
                            maxSelection={wordLimits.genres}
                            errorMessage={errors.genres}
                            error={!!errors.genres}
                          />
                        </div>
                        <div className="row-start-2">
                          <Dropdown
                            label="Themes"
                            disabled={storyDetails?.web_articles_status}
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
                            maxSelection={wordLimits.themes}
                            errorMessage={errors.themes}
                            error={!!errors.themes}
                          />
                        </div>
                      </div>
                      <Divider />
                    </section>
                    <section className="w-full space-y-4 mt-2">
                      <h4 className="mb-4 text-lg font-semibold">
                        2. Story Structure & Plot
                      </h4>

                      <div>
                        <Textarea
                          label={'Logline / Story Summary'}
                          tooltipText={toolTipText.Logline}
                          readOnly={storyDetails?.web_articles_status}
                          errorMessage={errors.logline}
                          required={true}
                          value={formData.logline}
                          onChange={e => {
                            const { value } = e.target;
                            const updatedFormData = {
                              ...formData,
                              logline: e.target.value,
                            };
                            setFormData(updatedFormData);
                          }}
                          onBlur={e => {
                            const { value } = e.target;
                            setErrors(prevErrors => ({
                              ...prevErrors,
                              logline: validateField('logline', value),
                            }));
                          }}
                          placeholder={placeholderText.Logline}
                          rows={20}
                          wordLimit={wordLimits.logline}
                          minLimit={minWordLimits.logline}
                        />
                      </div>

                      <Textarea
                        errorMessage={errors.keyplotpoints}
                        readOnly={storyDetails?.web_articles_status}
                        label={'Key Plot Points'}
                        tooltipText={toolTipText.KeyPlotPoints}
                        required={true}
                        value={formData.key_plot_points}
                        onChange={e => {
                          const { value } = e.target;
                          const updatedFormData = {
                            ...formData,
                            key_plot_points: e.target.value,
                          };
                          setFormData(updatedFormData);
                        }}
                        onBlur={e => {
                          const { value } = e.target;
                          setErrors(prevErrors => ({
                            ...prevErrors,
                            keyplotpoints: validateField(
                              'keyplotpoints',
                              value
                            ),
                          }));
                        }}
                        placeholder={placeholderText.KeyPlotPoints}
                        rows={8}
                        wordLimit={wordLimits.keyplotpoints}
                        minLimit={minWordLimits.keyplotpoints}
                      />
                      <Divider />
                    </section>
                    <div className="w-full flex justify-center py-4 bg-[#0A0A0A] border-t border-[#1E1E1E] sticky bottom-0">
                      <div className="w-full flex items-center justify-center ">
                        <button
                          type="button"
                          onClick={() => {
                            setTabKey('advanced_inputs');
                          }}
                          className="cursor-pointer px-4 py-2  text-sm font-medium transition-colors bg-default-400 hover:bg-[#52525b] text-[#FCFCFC] rounded-[12px]"
                        >
                          Next &gt;
                        </button>
                      </div>
                    </div>
                  </Tab>
                  <Tab key="advanced_inputs" title="Advanced Inputs">
                    <div className="text-center mt-2 ">
                      <span className="text-xl font-bold">
                        Refine Every Detail, Perfect Every Beat
                      </span>

                      <p className="text-[#A3A3A3]  mt-2 text-center text-[14px]">
                        Take your story further by adding advanced inputs like
                        character arcs, settings, conflicts, and emotional
                        tones. With deeper guidance, our AI crafts nuanced,
                        layered narratives that feel ready for the big screen.
                        Ideal for filmmakers and writers aiming for
                        professional-quality storytelling.
                      </p>
                    </div>

                    <div className=" flex flex-col items-center  px-4">
                      <section className="w-full">
                        <Divider className="mb-2" />

                        <h4 className="mb-4 text-lg font-semibold">
                          3. Characters
                        </h4>
                        <Divider className="mb-2" />

                        <CharacterManager
                          setValidationErrors={setErrors}
                          formData={formData.advancedFeatures}
                          setFormData={callback =>
                            setFormData(prev => ({
                              ...prev,
                              advancedFeatures: callback(prev.advancedFeatures),
                            }))
                          }
                          errors={errors}
                          readOnly={
                            storyDetails?.web_articles_status === true &&
                            storyDetails?.story_chat_status === false
                          }
                        />
                      </section>
                      <section className="w-full">
                        <h4 className="mb-4 text-lg font-semibold">
                          4. Character & Journey Development
                        </h4>
                        <Divider className="mb-2" />
                        <div className="flex gap-2 p-1 w-full">
                          <Textarea
                            label={'Philosophical Journey'}
                            tooltipText={toolTipText.PhilosophicalJourney}
                            value={
                              formData.advancedFeatures?.PhilosophicalJourney ||
                              ''
                            }
                            disabled={
                              storyDetails?.web_articles_status === true &&
                              storyDetails?.story_chat_status === false
                            }
                            onChange={e =>
                              updateAdvancedFeatures(
                                'PhilosophicalJourney',
                                e.target.value
                              )
                            }
                            onBlur={e => {
                              const { value } = e.target;
                              setErrors(prevErrors => ({
                                ...prevErrors,
                                philosophicaljourney: validateField(
                                  'philosophicaljourney',
                                  value
                                ),
                              }));
                            }}
                            placeholder={placeholderText.PhilosophicalJourney}
                            rows={8}
                            errorMessage={errors.philosophicaljourney}
                            wordLimit={wordLimits.philosophicaljourney}
                          />
                          <Textarea
                            label={'Thematic Journey'}
                            tooltipText={toolTipText.ThematicJourney}
                            errorMessage={errors.thematicjourney}
                            value={
                              formData.advancedFeatures?.ThematicJourney || ''
                            }
                            disabled={
                              storyDetails?.web_articles_status === true &&
                              storyDetails?.story_chat_status === false
                            }
                            onChange={e =>
                              updateAdvancedFeatures(
                                'ThematicJourney',
                                e.target.value
                              )
                            }
                            onBlur={e => {
                              const { value } = e.target;
                              setErrors(prevErrors => ({
                                ...prevErrors,
                                thematicjourney: validateField(
                                  'thematicjourney',
                                  value
                                ),
                              }));
                            }}
                            placeholder={placeholderText.ThematicJourney}
                            rows={8}
                            wordLimit={wordLimits.thematicjourney}
                          />

                          <Textarea
                            label={'Emotional Journey'}
                            tooltipText={toolTipText.EmotionalJourney}
                            errorMessage={errors.emotionaljourney}
                            value={
                              formData.advancedFeatures?.EmotionalJourney || ''
                            }
                            disabled={
                              storyDetails?.web_articles_status === true &&
                              storyDetails?.story_chat_status === false
                            }
                            onChange={e =>
                              updateAdvancedFeatures(
                                'EmotionalJourney',
                                e.target.value
                              )
                            }
                            onBlur={e => {
                              const { value } = e.target;
                              setErrors(prevErrors => ({
                                ...prevErrors,
                                emotionaljourney: validateField(
                                  'emotionaljourney',
                                  value
                                ),
                              }));
                            }}
                            placeholder={placeholderText.EmotionalJourney}
                            rows={8}
                            wordLimit={wordLimits.emotionaljourney}
                          />
                        </div>
                        <Divider />
                      </section>
                      <div className="flex w-full gap-4 mt-2">
                        <section className="flex justify-evenly flex-col flex-1">
                          <h4 className="mb-4 text-lg font-semibold">
                            5. Script-Specific Elements
                          </h4>
                          <Divider className="mb-2" />
                          <div className="flex justify-evenly flex-col gap-1">
                            <Textarea
                              label={'Opening Scene Idea'}
                              tooltipText={toolTipText.OpeningSceneIdea}
                              errorMessage={errors.openingsceneidea}
                              value={
                                formData.advancedFeatures?.OpeningSceneIdea ||
                                ''
                              }
                              disabled={
                                storyDetails?.web_articles_status === true &&
                                storyDetails?.story_chat_status === false
                              }
                              onChange={e =>
                                updateAdvancedFeatures(
                                  'OpeningSceneIdea',
                                  e.target.value
                                )
                              }
                              onBlur={e => {
                                const { value } = e.target;
                                setErrors(prevErrors => ({
                                  ...prevErrors,
                                  openingsceneidea: validateField(
                                    'openingsceneidea',
                                    value
                                  ),
                                }));
                              }}
                              placeholder={placeholderText.OpeningSceneIdea}
                              rows={5}
                              wordLimit={wordLimits.openingsceneidea}
                            />
                            <Textarea
                              label={'Climax Idea'}
                              errorMessage={errors.climaxidea}
                              tooltipText={toolTipText.ClimaxIdea}
                              value={
                                formData.advancedFeatures?.ClimaxIdea || ''
                              }
                              onChange={e =>
                                updateAdvancedFeatures(
                                  'ClimaxIdea',
                                  e.target.value
                                )
                              }
                              disabled={
                                storyDetails?.web_articles_status === true &&
                                storyDetails?.story_chat_status === false
                              }
                              onBlur={e => {
                                const { value } = e.target;
                                setErrors(prevErrors => ({
                                  ...prevErrors,
                                  climaxidea: validateField(
                                    'climaxidea',
                                    value
                                  ),
                                }));
                              }}
                              placeholder={placeholderText.ClimaxIdea}
                              rows={4}
                              wordLimit={wordLimits.climaxidea}
                            />
                            <Dropdown
                              label="Ending Type"
                              tooltipText={toolTipText.EndingType}
                              options={[
                                'Happy',
                                'Tragic',
                                'Bittersweet',
                                'Cliffhanger',
                                'Philosophical or Moral lesson',
                                'Surprise twist',
                              ].map(type => ({
                                label: type,
                                value: type,
                              }))}
                              disabled={
                                storyDetails?.web_articles_status === true &&
                                storyDetails?.story_chat_status === false
                              }
                              placeholder={placeholderText.EndingType}
                              value={
                                formData.advancedFeatures?.EndingType || []
                              }
                              onChange={type => {
                                updateAdvancedFeatures('EndingType', type);

                                setErrors({
                                  ...errors,
                                  endingtype: validateField('endingtype', type),
                                });
                              }}
                              errorMessage={errors.endingtype}
                              maxSelection={wordLimits.endingtype}
                              isMultiple
                              minSelection={0}
                            />
                          </div>
                        </section>
                        <Divider orientation="vertical" className="w-2" />
                        <section className="  flex-1 ">
                          <h4 className="mb-4 text-lg font-semibold">
                            6. Additional Details
                          </h4>
                          <Divider className="mb-2" />
                          <div className="flex justify-evenly flex-col gap-1">
                            <Dropdown
                              label="Target Audience"
                              tooltipText={toolTipText.TargetAudience}
                              options={[
                                'All Ages',
                                'Kids (0-12)',
                                'Teens (13-17)',
                                'Young Adults (18-24)',
                                'Adults (25-34)',
                                'Middle Aged (35-54)',
                                'Seniors (55+)',
                              ].map(type => ({
                                label: type,
                                value: type,
                              }))}
                              disabled={
                                storyDetails?.web_articles_status === true &&
                                storyDetails?.story_chat_status === false
                              }
                              placeholder={placeholderText.TargetAudience}
                              value={
                                formData.advancedFeatures?.TargetAudience || []
                              }
                              onChange={audience => {
                                updateAdvancedFeatures(
                                  'TargetAudience',
                                  audience
                                );
                                setErrors({
                                  ...errors,
                                  targetaudience: validateField(
                                    'targetaudience',
                                    audience
                                  ),
                                });
                              }}
                              errorMessage={errors.targetaudience}
                              maxSelection={wordLimits.targetaudience}
                              isMultiple
                              minSelection={0}
                            />
                            <Textarea
                              errorMessage={errors.inspiration}
                              label={'Inspiration/References'}
                              tooltipText={toolTipText.Inspiration}
                              value={
                                formData.advancedFeatures?.Inspiration || ''
                              }
                              onChange={e =>
                                updateAdvancedFeatures(
                                  'Inspiration',
                                  e.target.value
                                )
                              }
                              disabled={
                                storyDetails?.web_articles_status === true &&
                                storyDetails?.story_chat_status === false
                              }
                              onBlur={e => {
                                const { value } = e.target;
                                setErrors(prevErrors => ({
                                  ...prevErrors,
                                  inspiration: validateField(
                                    'inspiration',
                                    value
                                  ),
                                }));
                              }}
                              placeholder={placeholderText.Inspiration}
                              rows={4}
                              wordLimit={wordLimits.inspiration}
                            />
                            <Input
                              label={'Special Elements'}
                              errorMessage={errors.specialelements}
                              tooltipText={toolTipText.SpecialElements}
                              value={
                                formData.advancedFeatures?.SpecialElements || ''
                              }
                              disabled={
                                storyDetails?.web_articles_status === true &&
                                storyDetails?.story_chat_status === false
                              }
                              onChange={e =>
                                updateAdvancedFeatures(
                                  'SpecialElements',
                                  e.target.value
                                )
                              }
                              onBlur={e => {
                                const { value } = e.target;
                                setErrors(prevErrors => ({
                                  ...prevErrors,
                                  specialelements: validateField(
                                    'specialelements',
                                    value
                                  ),
                                }));
                              }}
                              // minLimit={minWordLimits.specialelements}
                              placeholder={placeholderText.SpecialElements}
                              wordLimit={wordLimits.specialelements}
                            />
                            <Dropdown
                              label="Naration Style"
                              tooltipText={toolTipText.NarrationStyle}
                              options={[
                                'First Person Narration',
                                'Second Person Narration',
                                'Third Person Narration',
                                'Omniscient Narration',
                                'Limited Omniscient Narration',
                              ].map(type => ({
                                label: type,
                                value: type,
                              }))}
                              disabled={
                                storyDetails?.web_articles_status === true &&
                                storyDetails?.story_chat_status === false
                              }
                              placeholder={placeholderText.NarrationStyle}
                              value={
                                formData.advancedFeatures?.NarrationStyle || []
                              }
                              onChange={newTraits => {
                                updateAdvancedFeatures(
                                  'NarrationStyle',
                                  newTraits
                                );
                                setErrors({
                                  ...errors,
                                  narrationstyle: validateField(
                                    'narrationstyle',
                                    newTraits
                                  ),
                                });
                              }}
                              errorMessage={errors.narrationstyle}
                              maxSelection={wordLimits.narrationstyle}
                              isMultiple
                            />
                          </div>
                        </section>
                      </div>
                      <Divider className="mt-2" />
                    </div>
                    <div className="w-full flex justify-center py-4 bg-[#0A0A0A] border-t border-[#1E1E1E] sticky bottom-0">
                      <div className="flex items-center justify-center gap-2 ">
                        {storyDetails?.web_articles_status === false && (
                          <button
                            type="button"
                            disabled={
                              !storyDetails?.story_chat_status === false
                                ? false
                                : !hasChanges
                                  ? true
                                  : false
                            }
                            onClick={handleSaveStory}
                            className={`px-4 py-2  text-sm font-medium  transition-colors bg-default-400 hover:bg-[#52525b] text-[#FCFCFC] rounded-[12px] ${hasChanges ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                          >
                            Save
                          </button>
                        )}
                      </div>
                    </div>
                  </Tab>
                </Tabs>
              </div>
            </form>
          </div>
        ) : null}
        {check && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-md">
            <div className="bg-[#1B1B1B] text-sm p-[24px] rounded-xl shadow-pop-up shadow-shadow-pop-up  max-h-screen overflow-y-auto flex flex-col items-center justify-start gap-4 min-w-[250px] max-w-[400px]">
              <p className="text-center text-sm text-[#A3A3A3]">
                Your inputs are spot on! Click on{' '}
                <b>
                  {storyDetails?.story_chat_status
                    ? 'Re-Generate Story'
                    : 'Next'}
                </b>{' '}
                to see your well-crafted ideas come to life.
              </p>
              <div className="mt-2 flex justify-end gap-4">
                <Button
                  size="md"
                  onClick={() => setCheck(false)}
                  className="bg-[#262626] hover:bg-default-400 cursor-pointer text-[#FCFCFC]"
                >
                  Cancel
                </Button>
                <Button
                  size="md"
                  onClick={e => handleGenerateWebArticles(e)}
                  className="bg-[#175CD3] hover:bg-[#175CD3]/80 cursor-pointer px-2 py-3 rounded-xl text-[#FCFCFC] text-sm"
                >
                  {storyDetails?.story_chat_status
                    ? 'Re-Generate Story'
                    : 'Next'}
                </Button>
              </div>
            </div>
          </div>
        )}
        {isPopupOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-md">
            <div className="bg-[#1B1B1B] text-sm  rounded-xl shadow-pop-up shadow-shadow-pop-up p-[24px] max-h-screen overflow-y-auto flex flex-col items-center justify-start gap-4 min-w-[250px] max-w-[400px]">
              {responseMessage && (
                <div className="p-4 mt-4  ">
                  <p className="text-white/80 mb-2 font-semibold">
                    The following fields are irrelevant:
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {responseMessage
                      .replace('The following fields are irrelevant:', '')
                      .split(',')
                      .map((field, idx) => {
                        const cleanField = field.replace(/\*\*/g, '').trim();
                        if (!cleanField) return null;

                        return (
                          <span
                            key={idx}
                            className="px-3 py-1 text-xs bg-[#222] border border-[#333] text-white/80 rounded-lg"
                          >
                            {cleanField}
                          </span>
                        );
                      })}
                  </div>
                </div>
              )}
              <Button
                size="md"
                onClick={handleCancel}
                className="bg-[#262626] hover:bg-default-400 cursor-pointer text-[#FCFCFC]"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
        {storyDetails?.story_chat_status ? (
          <UnsavedChangesModal
            isOpen={blocker.state === 'blocked'}
            blocker={blocker}
          />
        ) : (
          <UnsavedChangesModal
            isOpen={blocker.state === 'blocked'}
            blocker={blocker}
            onSave={handleSaveStory}
          />
        )}
      </div>
    </div>
  );
}
