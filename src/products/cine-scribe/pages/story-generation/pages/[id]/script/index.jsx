import { useState, useEffect, useRef, useMemo } from 'react';
import EditListPanel from '../../../components/EditList';
import { useParams, useNavigate, useBlocker } from 'react-router';
import Spinner from '@shared/ui/spinner';
import {
  highLightedNumbers,
  wordLimits,
} from '@products/cine-scribe/constants/StoryGenerationConstants';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchData, sendData } from '@api/apiMethods';
import { useDebounce } from '@shared/debounceSearchQuery';
import UnsavedChangesModal from '@shared/unSavedChangesModal';
import { CloseXIcon, EditIcon } from '@shared/layout/icons';
import Button from '@shared/ui/button';
import ScriptStoryGenerationLoading from './loading';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@heroui/react';
import Textarea from '@shared/ui/textarea';
import IconButtonWithTooltip from '@shared/ui/IconButtonWithTooltip';
import { useProductHeader } from '@products/cine-scribe/contexts/ProductHeaderContext';
import { set } from 'lodash';

function updateSessionWithPrompt(key, promptText) {
  try {
    const stored = sessionStorage.getItem('changed_with_prompt');
    const parsed = stored ? JSON.parse(stored) : {};

    const existingArr = parsed[key] ?? [];

    const trimmedPrompt = promptText?.trim() || '';

    // FIND entry where updated === {} (empty object)
    const emptyUpdatedIndex = existingArr.findIndex(item => {
      return (
        typeof item.updated === 'object' &&
        item.updated !== null &&
        Object.keys(item.updated).length === 0
      );
    });

    if (emptyUpdatedIndex !== -1) {
      // Replace prompt in the same entry
      existingArr[emptyUpdatedIndex].prompt = trimmedPrompt;
    } else {
      // ADD NEW ENTRY with updated default = {}
      existingArr.push({
        prompt: trimmedPrompt,
        updated: {}, // <-- default
      });
    }

    parsed[key] = existingArr;
    sessionStorage.setItem('changed_with_prompt', JSON.stringify(parsed));
  } catch (err) {
    console.error('Failed to update changed_with_prompt:', err);
  }
}


export default function Script() {
  const queryClient = useQueryClient();
  const [editList, setEditList] = useState({});
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState(['text']);
  const id = useParams().id;
  const navigate = useNavigate();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [changeIndex, setChangeIndex] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [scriptWriting, setScriptWriting] = useState(false);
  const [storyDetails, setStoryDetails] = useState({});
  const [isCollapsedStoryDetails, setIsCollapsedStoryDetails] = useState(true);
  const [isCollapsedScenes, setIsCollapsedScenes] = useState(true);
  const [storySummary, setStorySummary] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const [editInputDisplay, setEditInputDisplay] = useState(null);
  const [message, setMessage] = useState('');
  const prevStoryDetailsRef = useRef(isCollapsedStoryDetails);
  const prevScenesRef = useRef(isCollapsedScenes);
  const highlightedIndices = highLightedNumbers.Script;
  const debouncedQuery = useDebounce(query, 300);
  const { setHeaderProps } = useProductHeader();
  const [hoveredBeat, setHoveredBeat] = useState(null);
  const [updatedList, setUpdatedList] = useState({});
  const [selectedIndex, setSelectedIndex] = useState({});
  const [recentEdits, setRecentEdits] = useState([]);
  
  

  const hasUnsavedChanges = Object.keys(editList).length > 0;
  const blocker = useBlocker(hasUnsavedChanges);

  useEffect(() => {
    if (Object.keys(editList || {}).length === 0) {
      sessionStorage.removeItem('changed_with_prompt');
    }
  }, [editList]);

  useEffect(() => {
    if (
      prevScenesRef.current === true &&
      isCollapsedScenes === false
    ) {
      setIsCollapsedStoryDetails(true);
    }
    if (
      prevStoryDetailsRef.current === true &&
      isCollapsedStoryDetails === false
    ) {
      setIsCollapsedScenes(true);
    }
    prevStoryDetailsRef.current = isCollapsedStoryDetails;
    prevScenesRef.current = isCollapsedScenes;
  }, [isCollapsedStoryDetails, isCollapsedScenes]);

  // === MUTATIONS ===
  const generateSceneSynopsisMutation = useMutation({
    mutationKey: ['generateSceneSynopsis', id],
    mutationFn: async () => {
      return await sendData({
        endpoint: '/scene_synopsis_generation/create_scene_synopsis',
        method: 'POST',
        body: { story_id: Number(id) },
        responseMessage: 'Scene synopsis generated successfully',
      });
    },
    onSuccess: response => {
      if (response?.data?.response === 'Scene synopsis generated successfully') {
        queryClient.invalidateQueries(['sceneSynopsis', id]);
      }
    },
    onSettled: () => setLoading(false),
  });

  const regenerateCheckSceneSynopsis = useMutation({
    mutationKey: ['regenerateCheckSceneSynopsis', id],
    mutationFn: async () => {
      // 1. Read from sessionStorage
     const stored = sessionStorage.getItem('changed_with_prompt');
     const parsed = stored ? JSON.parse(stored) : {};

     const filteredForCheck = {};

     Object.entries(parsed).forEach(([beatNumber, list]) => {
       const emptyItem = list.find(item => {
         const u = item.updated;

         // Case: empty string
         if (typeof u === 'string') return u.trim() === '';

         // Case: object
         if (typeof u === 'object' && u !== null)
           return Object.keys(u).length === 0;

         // Null or undefined
         return !u;
       });

       if (emptyItem) {
         filteredForCheck[beatNumber] = emptyItem.prompt;
       }
     });

     if (Object.keys(filteredForCheck).length === 0) {
       return { skipped: true };
     }


      // 4. Make API call
      return await sendData({
        endpoint: `/scene_synopsis_generation/check_scene_synopsis`,
        method: 'POST',
        body: { story_id: Number(id), user_inputs: filteredForCheck },
        responseMessage: 'Scene synopsis Checked successfully',
      });
    },

    onSuccess: response => {
      const result = response?.data?.response;
      setLoading(false);

      if (result?.user_input) {
        setResponseMessage(
          result?.story_affected ? 'Story affected' : 'Story not affected'
        );
      } else {
        setResponseMessage('Validation failed due to');
      }

      setChangeIndex(result?.index || []);
      setIsPopupOpen(true);
    },

    onSettled: () => setLoading(false),
  });


  const proceedSceneSynopsisMutation = useMutation({
    mutationKey: ['proceedSceneSynopsisMutation', id],
    mutationFn: async () => {

         const stored = sessionStorage.getItem('changed_with_prompt');
         const parsed = stored ? JSON.parse(stored) : {};

         const filteredForEdit = {};

         Object.entries(parsed).forEach(([beatNumber, list]) => {
           const emptyItem = list.find(item => {
             const u = item.updated;

             // Case: empty string
             if (typeof u === 'string') return u.trim() === '';

             // Case: object
             if (typeof u === 'object' && u !== null)
               return Object.keys(u).length === 0;

             // Null or undefined
             return !u;
           });

           if (emptyItem) {
             filteredForEdit[beatNumber] = emptyItem.prompt;
           }
         });
      
      
      return await sendData({
        endpoint: '/scene_synopsis_generation/edit_scene_synopsis',
        method: 'PUT',
        body: { story_id: Number(id), user_inputs: filteredForEdit },
        responseMessage: 'Scene synopsis Edited successfully',
      });
    },
    onSuccess: response => {
      setIsPopupOpen(false);
      setLoading(false);

      const newData = response?.data?.response?.changed_with_prompt || {};
      const stored = sessionStorage.getItem('changed_with_prompt');

      let finalData = {};

      if (stored) {
        finalData = JSON.parse(stored);

        Object.entries(newData).forEach(([key, newList]) => {
          if (!finalData[key]) {
            finalData[key] = [];
          }

          newList.forEach(newItem => {
            const newPrompt = (newItem.prompt || '').trim();
            const newUpdated = newItem.updated;

            // Convert stored updated into comparable form
            const isEmptyString = val =>
              typeof val === 'string' && val.trim() === '';

            const isEmptyObject = val =>
              typeof val === 'object' &&
              val !== null &&
              Object.keys(val).length === 0;

            // Find an entry where:
            // same prompt && updated is "" OR {}
            const emptyIndex = finalData[key].findIndex(item => {
              const itemPrompt = (item.prompt || '').trim();
              const itemUpdated = item.updated;

              const updatedIsEmpty =
                isEmptyString(itemUpdated) || isEmptyObject(itemUpdated);

              return itemPrompt === newPrompt && updatedIsEmpty;
            });

            const newUpdatedIsNonEmpty =
              (typeof newUpdated === 'string' && newUpdated.trim() !== '') ||
              (typeof newUpdated === 'object' &&
                newUpdated !== null &&
                Object.keys(newUpdated).length > 0);

            if (emptyIndex !== -1 && newUpdatedIsNonEmpty) {
              // Replace the empty updated value
              finalData[key][emptyIndex].updated = newUpdated;
            } else {
              // Append new item normally
              finalData[key].push(newItem);
            }
          });
        });
      } else {
        // No existing storage → store the new one directly
        finalData = newData;
      }

      sessionStorage.setItem('changed_with_prompt', JSON.stringify(finalData));
      
    },
    onSettled: () => setLoading(false),
  });

  // === HANDLERS ===
  async function handleGenerateSceneSynopsis() {
    setLoading(true);
    setLoadingText('Generating Scenes');
    generateSceneSynopsisMutation.mutate();
  }

  async function handleRegenerate() {
    setLoading(true);
    setLoadingText('Inspecting scenes... making sure your story keeps its rhythm');
    regenerateCheckSceneSynopsis.mutate();
  }

  async function handleProceed() {
    setLoading(true);
    setLoadingText('Rewriting scenes to enhance emotion and flow will take a few minutes...');
    proceedSceneSynopsisMutation.mutate();
  }

  const handleCancel = () => setIsPopupOpen(false);

  // === SAVE LOGIC (FIXED) ===
  const handleSaveMessage = () => {
    const trimmed = message.trim();
    if (trimmed === '') return; // Never save empty

    setEditList(prev => ({
      ...prev,
      [editInputDisplay]: trimmed,
    }));

    updateSessionWithPrompt(editInputDisplay, trimmed);

    if (Object.keys(editList).length === 0) {
      setIsCollapsedScenes(false);
    }

    setMessage('');
    setEditInputDisplay(null);
    setErrorMessage(null);
  };

  // === FETCH DATA ===
  const { data: storyStatusBarDetails = {} } = useQuery({
    queryKey: ['storyStatusBarDetails', id],
    queryFn: async () => {
      const response = await fetchData({
        endpoint: `/story/display_story_status?story_id=${id}`,
        method: 'GET',
      });
      return response.data.response;
    },
    enabled: !!id,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const {
    data: scenes = [],
    error,
    isPending,
  } = useQuery({
    queryKey: ['sceneSynopsis', id],
    queryFn: async () => {
      const response = await fetchData({
        endpoint: `/scene_synopsis/display_scene_synopsis?story_id=${id}`,
        method: 'GET',
      });
      const sceneData = response.data.response.scenes;
      setStorySummary(response.data.response.story);

      return Object.entries(sceneData).map(([key, scene]) => ({
        id: parseInt(key, 10),
        int_ext: scene.scene_int_ext,
        location: scene.location_of_the_scene,
        shot_time: scene.time_of_the_scene,
        text: scene.scene_synopsis,
        title: scene.scene_title,
      }));
    },
    enabled: !!id,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

    const saveEditedBeatsMutation = useMutation({
      mutationKey: ['saveEditedBeats', id],
      mutationFn: async () => {
        return await sendData({
          endpoint: '/scene_synopsis_generation/save_edited_scene_synopsis',
          method: 'PUT',
          body: { story_id: Number(id), edits: updatedList },
          responseMessage: 'Scene synopsis Saved successfully',
        });
      },
      onSuccess: response => {
        const updatedScenes = response?.data?.response?.scenes || {};
        setRecentEdits(response?.data?.response?.changes || []);

        queryClient.setQueryData(['sceneSynopsis', id], () => {
          return Object.entries(updatedScenes).map(([key, scene]) => ({
            id: parseInt(key, 10),
            int_ext: scene.scene_int_ext,
            location: scene.location_of_the_scene,
            shot_time: scene.time_of_the_scene,
            text: scene.scene_synopsis,
            title: scene.scene_title,
          }));
        });

        setLoading(false);
        sessionStorage.removeItem('changed_with_prompt');
        setEditList({});
        setSelectedIndex({});
        setUpdatedList({});
      },
      onSettled: () => setLoading(false),
    });

    async function handleSaveEdits() {
      setLoading(true);
      setLoadingText('Saving your changes...');
      saveEditedBeatsMutation.mutate();
    }

  const filteredScenes = useMemo(() => {
    if (!debouncedQuery) return scenes;
    const lowerQuery = debouncedQuery.toLowerCase();
    return scenes.filter(
      (scene, index) =>
        filterType.some(type => scene[type]?.toLowerCase().includes(lowerQuery)) ||
        index.toString().includes(lowerQuery)
    );
  }, [debouncedQuery, scenes, filterType]);

  useEffect(() => {
    setHeaderProps({
      showSGStatus: true,
      storyStatusBarDetails,
      showButton: false,
      showDownload: true,
      pdfData: scenes,
    });
  }, [storyStatusBarDetails, scenes, setHeaderProps]);

  return (
    <div className="w-full h-full flex flex-col bg-primary-gray-50 scrollbar-gray">
      {loading && <Spinner text={loadingText} />}

      {isPending ? (
        <div className="mt-[10px] flex flex-1 flex-col w-full responsive-container mx-auto py-4">
          <ScriptStoryGenerationLoading />
        </div>
      ) : error ? (
        <div className="w-full flex-1 mx-auto flex flex-col gap-10 items-center justify-center bg-primary-gray-100">
          <p className="text-red-500">Failed to load Scenes.</p>
        </div>
      ) : scenes.length > 0 ? (
        <div className="flex-grow w-full flex gap-1 overflow-hidden">
          <EditListPanel
            title="scene"
            editList={editList}
            setEditList={setEditList}
            handleRegenerate={handleRegenerate}
            isCollapsed={isCollapsedScenes}
            setIsCollapsed={setIsCollapsedScenes}
            setEditInputDisplay={setEditInputDisplay}
            setMessage={setMessage}
            changeIndex={changeIndex}
            setChangeIndex={setChangeIndex}
            updatedList={updatedList}
            setUpdatedList={setUpdatedList}
            selectedIndex={selectedIndex}
            setSelectedIndex={setSelectedIndex}
            handleSaveEdits={handleSaveEdits}
          />

          <div className="flex-grow transition-[width] duration-300 ease-in-out relative overflow-y-auto ml-[10px]">
            <div
              className={`mt-[10px] flex flex-1 flex-col ${!isCollapsedScenes ? 'w-auto pl-4 pr-2 ' : 'responsive-container'}  mx-auto py-4`}
            >
              <div className="w-full py-[10px] container mx-auto grid gap-2 md:gap-4 grid-cols-1 justify-items-start">
                {filteredScenes.length > 0 ? (
                  filteredScenes.map(item => (
                    <div key={item.id} className="space-y-2 w-full text-sm">
                      <span className="font-bold mb-2">
                        Scene {item.id < 10 ? `0${item.id}` : item.id}{' '}
                        {highlightedIndices.includes(item.id) && (
                          <span className="text-[#3B82F6]">*</span>
                        )}
                      </span>

                      {/* Scene Card */}
                      <div
                        onMouseEnter={() => setHoveredBeat(item.id)}
                        onMouseLeave={() => setHoveredBeat(null)}
                        className="group py-2 px-4 min-h-[100px] rounded-xl text-md bg-[#171717] text-justify mt-1 relative"
                        style={{
                          border: '1px solid',
                          borderColor: recentEdits.includes(item.id)
                            ? '#3B82F6'
                            : 'rgba(255, 255, 255, 0.1)',
                          color: '#A3A3A3',
                        }}
                      >
                        <span className="font-bold text-[#fcfcfc]">
                          {item.int_ext}. {item.location} - {item.shot_time}
                        </span>
                        <br />
                        <span className="font-bold text-[#fcfcfc]">
                          {item.title}
                        </span>
                        <br />
                        {item.text}

                        {/* Tooltip */}
                        {recentEdits.includes(item.id) &&
                          hoveredBeat === item.id && (
                            <span
                              style={{
                                position: 'absolute',
                                top: -30,
                                left: 100,
                                background: '#222',
                                color: '#fff',
                                padding: '5px 10px',
                                borderRadius: '6px',
                                whiteSpace: 'nowrap',
                                zIndex: 10,
                                fontSize: '0.85em',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                              }}
                            >
                              Recently Edited Scene.
                            </span>
                          )}

                        {/* Highlight Tooltip */}
                        {highlightedIndices.includes(item.id) &&
                          hoveredBeat === item.id && (
                            <span
                              style={{
                                position: 'absolute',
                                top: -30,
                                left: 100,
                                background: '#222',
                                color: '#fff',
                                padding: '5px 10px',
                                borderRadius: '6px',
                                whiteSpace: 'nowrap',
                                zIndex: 10,
                                fontSize: '0.85em',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                              }}
                            >
                              This Scene can be expected as Interval.
                            </span>
                          )}

                        {/* Edit Button */}
                        <div
                          onClick={() => {
                            const existing = editList[item.id] || '';
                            setEditInputDisplay(item.id);
                            setMessage(existing);
                            setErrorMessage(null);
                          }}
                          className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded-md bg-[#272727] hover:bg-[#333] p-1"
                          style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                        >
                          <IconButtonWithTooltip
                            iconComponent={EditIcon}
                            iconProps={{
                              color: 'white',
                              fill: 'white',
                              size: 20,
                            }}
                            tooltipText={'Edit'}
                            position="bottom"
                            iconButton={false}
                          />
                        </div>

                        {/* Unsaved Edit Indicator */}
                        {/* {editList[item.id] && (
                          <span className="absolute -top-2 -right-2 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></span>
                        )} */}
                      </div>

                      {/* Edit Input */}
                      {editInputDisplay === item.id && (
                        <div className="flex relative items-center gap-2 bg-[#1B1B1B] px-1 py-3 rounded-xl">
                          <button
                            onClick={() => {
                              setEditInputDisplay(null);
                              setMessage('');
                              setErrorMessage(null);
                            }}
                            className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center rounded-full hover:bg-[#3a3a3a] transition-colors"
                          >
                            <CloseXIcon
                              size={14}
                              color="currentColor"
                              className="w-3.5 h-3.5"
                            />
                          </button>

                          {(() => {
                            const stored = sessionStorage.getItem(
                              'changed_with_prompt'
                            );
                            const parsed = stored ? JSON.parse(stored) : {};

                            const currentKeyPrompts = parsed[item.id] || [];
                            var disableInput = currentKeyPrompts.length >= 3;

                            return (
                              <>
                                <Textarea
                                  wordLimit={wordLimits.editBox}
                                  placeholder={
                                    disableInput
                                      ? 'You already added 3 prompts.'
                                      : 'Refine your scene further...'
                                  }
                                  disabled={disableInput}
                                  onChange={e => setMessage(e.target.value)}
                                  onKeyDown={e => {
                                    if (
                                      !disableInput &&
                                      e.key === 'Enter' &&
                                      !e.shiftKey
                                    ) {
                                      e.preventDefault();
                                      handleSaveMessage();
                                    }
                                  }}
                                  value={message}
                                  errorMessage={
                                    disableInput
                                      ? 'Looks like this beat already has all 3 edits added! Please remove the existing Version.'
                                      : message
                                            .trim()
                                            .split(/\s+/)
                                            .filter(Boolean).length >
                                          wordLimits.editBox
                                        ? `You can add atmost ${wordLimits.editBox} words.`
                                        : ''
                                  }
                                  wantBorder={true}
                                />

                                <Button
                                  size="md"
                                  className="bg-[#0a0a0a] text-[#fcfcfc] px-4 py-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                  disabled={
                                    message.trim() === '' ||
                                    message.trim().split(/\s+/).filter(Boolean)
                                      .length > wordLimits.editBox
                                  }
                                  onClick={handleSaveMessage}
                                >
                                  Save
                                </Button>
                              </>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p>No data available</p>
                )}
              </div>
            </div>

            {/* Script Writing Modal */}
            {scriptWriting && (
              <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-md">
                <div className="bg-primary-gray-50 text-sm px-6 py-5 rounded-xl shadow-pop-up shadow-shadow-pop-up w-[425px] max-h-screen overflow-y-auto flex flex-col items-center justify-start gap-4">
                  <p>Would you like to proceed for script writing?</p>
                  <div className="mt-6 flex justify-end gap-4">
                    <button
                      className="button-primary"
                      onClick={() => setScriptWriting(false)}
                    >
                      Proceed
                    </button>
                    <button
                      className="button-secondary"
                      onClick={() => setScriptWriting(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Regenerate Modal */}
            <Modal
              isOpen={isPopupOpen}
              onClose={() => {
                setIsPopupOpen(false);
                handleCancel();
              }}
              isCentered
              backdrop="opaque"
              classNames={{
                body: 'py-6',
                backdrop: 'bg-black/50 backdrop-opacity-40',
                base: 'border-white/10 bg-[#1B1B1B] text-[#a8b0d3]',
                closeButton: 'hover:bg-white/5 active:bg-white/10',
              }}
            >
              <ModalContent>
                <ModalHeader className="flex flex-col gap-1 text-[#fcfcfc]">
                  {responseMessage === 'Story affected' &&
                    "Heads Up - your changes will shift the story's direction"}
                  {responseMessage === 'Story not affected' && responseMessage}
                  {responseMessage === 'Validation failed due to' &&
                    'Hmm, We could not apply some of your changes.'}
                </ModalHeader>
                <ModalBody className="text-[#A3A3A3] text-sm">
                  {responseMessage === 'Story affected' && (
                    <div>
                      <span>This action cannot be done.</span>
                      <span>
                        <b>Changes mentioned</b> in the following Scenes may
                        significantly impact how the story unfolds:
                      </span>
                      <div className="w-full font-semibold text-left">
                        Scenes:&nbsp;
                        {changeIndex.map((item, index) => (
                          <span key={`change-${index}`}>
                            {item}
                            {index !== changeIndex.length - 1 && ', '}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {responseMessage === 'Story not affected' &&
                    "Nice work! Your changes fit smoothly into the story. Nothing in the narrative flow is disrupted — you're good to go!"}
                  {responseMessage === 'Validation failed due to' && (
                    <div>
                      <span>
                        They might not align with your story or script context.
                        You might want to rephrase or update the changes.
                      </span>
                      <span>
                        <b>Changes mentioned</b> in the following Scenes
                        couldn't be used:
                          </span>
                          {changeIndex.length > 0 && (
                            <div className="font-semibold w-full text-left">
                              Scenes:&nbsp;
                              {changeIndex.map((item, index) => (
                                <span key={`fail-${index}`}>
                                  {item}
                                  {index !== changeIndex.length - 1 && ', '}
                                </span>
                              ))}
                            </div>
                          )}
                      <p className="mt-4">
                        We're here to help you shape your story. Try refining
                        these, and let's keep building!
                      </p>
                    </div>
                  )}
                </ModalBody>
                <ModalFooter>
                  {responseMessage === 'Story not affected' && (
                    <Button
                      size="md"
                      className="bg-[#175CD3] hover:bg-[#175CD3]/80 cursor-pointer px-2 py-3 rounded-xl text-[#FCFCFC] text-sm"
                      onClick={handleProceed}
                    >
                      Proceed
                    </Button>
                  )}
                </ModalFooter>
              </ModalContent>
            </Modal>
          </div>
        </div>
      ) : (
        <div className="flex-grow flex items-center justify-center flex-col">
          <p>No Script Generated</p>
        </div>
      )}

      <UnsavedChangesModal
        isOpen={blocker.state === 'blocked'}
        blocker={blocker}
      />
    </div>
  );
}