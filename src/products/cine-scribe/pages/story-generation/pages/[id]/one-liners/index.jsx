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
import Textarea from '@shared/ui/textarea';
import OnelinerStoryGenerationLoading from './loading';
import Button from '@shared/ui/button';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@heroui/react';
import { useProductHeader } from '@products/cine-scribe/contexts/ProductHeaderContext';
import IconButtonWithTooltip from '@shared/ui/IconButtonWithTooltip';

function updateSessionWithPrompt(key, promptText) {
  try {
    const stored = sessionStorage.getItem('changed_with_prompt');
    const parsed = stored ? JSON.parse(stored) : {};

    const existingArr = parsed[key] ?? [];

    // Trim input
    const trimmedPrompt = promptText?.trim() || '';

    // 1️ Check if there is an entry with updated === "" → replace prompt only
    const emptyUpdatedIndex = existingArr.findIndex(
      item => item.updated === ''
    );

    if (emptyUpdatedIndex !== -1) {
      // Update existing empty entry with new prompt
      existingArr[emptyUpdatedIndex].prompt = trimmedPrompt;
    } else {
      // 2️ Otherwise append new entry
      existingArr.push({
        prompt: trimmedPrompt,
        updated: '',
      });
    }

    // Save back
    parsed[key] = existingArr;
    sessionStorage.setItem('changed_with_prompt', JSON.stringify(parsed));
  } catch (err) {
    console.error('Failed to update changed_with_prompt:', err);
  }
}

export default function Oneliners() {
  const queryClient = useQueryClient();
  const [editList, setEditList] = useState({});
  const [query, setQuery] = useState('');
  const id = useParams().id;
  const navigate = useNavigate();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [changeIndex, setChangeIndex] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [isCollapsedOneliners, setIsCollapsedOneliners] = useState(true);
  const [storyDetails, setStoryDetails] = useState({});
  const [editInputDisplay, setEditInputDisplay] = useState(null);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const highlightedIndices = highLightedNumbers.Oneliners;
  const debouncedQuery = useDebounce(query, 300);
  const hasUnsavedChanges = Object.keys(editList).length > 0;
  const { setHeaderProps } = useProductHeader();
  const [hoveredBeat, setHoveredBeat] = useState(null);
  const blocker = useBlocker(hasUnsavedChanges);
  const [recentEdits, setRecentEdits] = useState([]);
  const [updatedList, setUpdatedList] = useState({});
  const [selectedIndex, setSelectedIndex] = useState({});

  useEffect(() => {
    if (Object.keys(editList || {}).length === 0) {
      sessionStorage.removeItem('changed_with_prompt');
    }
  }, [editList]);

  const {
    data: oneliners = [],
    error,
    isPending,
  } = useQuery({
    queryKey: ['oneliners', id],
    queryFn: async () => {
      const response = await fetchData({
        endpoint: `/oneliners/display_oneliners?story_id=${id}`,
        method: 'GET',
      });
      const onelinerData = response.data.response.oneliners;
      return onelinerData.map((oneliner, index) => ({
        id: index + 1,
        text: oneliner,
      }));
    },
    enabled: !!id,
    keepPreviousData: true,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const filteredOneliners = useMemo(() => {
    if (!debouncedQuery) return oneliners;
    const lowerQuery = debouncedQuery.toLowerCase();
    return oneliners.filter(
      ({ text, id }) =>
        text.toLowerCase().includes(lowerQuery) ||
        id.toString().includes(lowerQuery)
    );
  }, [debouncedQuery, oneliners]);

  const regenerateCheckOneliners = useMutation({
    mutationKey: ['regenerateCheckOneliners', id],
    mutationFn: async () => {
      // 1. Read sessionStorage
      const stored = sessionStorage.getItem('changed_with_prompt');
      const parsed = stored ? JSON.parse(stored) : {};

      // 2. Extract only items where updated === "" and send ONLY key: prompt
      const filteredForCheck = {};
      Object.entries(parsed).forEach(([beatNumber, list]) => {
        const emptyItem = list.find(item => item.updated === '');
        if (emptyItem) {
          filteredForCheck[beatNumber] = emptyItem.prompt;
        }
      });

      if (Object.keys(filteredForCheck).length === 0) {
        return { skipped: true };
      }
      return await sendData({
        endpoint: `/oneliners_generation/check_oneliners`,
        method: 'POST',
        body: {
          story_id: Number(id),
          user_inputs: filteredForCheck,
        },
        responseMessage: 'Oneliners Checked successfully',
      });
    },
    onSuccess: response => {
      if (response?.skipped) {
        return;
      }
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

  const proceedMutation = useMutation({
    mutationKey: ['proceedOnelinersMutation', id],
    mutationFn: async () => {
      // 1. Read sessionStorage
      const stored = sessionStorage.getItem('changed_with_prompt');
      const parsed = stored ? JSON.parse(stored) : {};

      // 2. Extract only items where updated === "" and send ONLY key: prompt
      const filteredForEdit = {};
      Object.entries(parsed).forEach(([beatNumber, list]) => {
        const emptyItem = list.find(item => item.updated === '');
        if (emptyItem) {
          filteredForEdit[beatNumber] = emptyItem.prompt;
        }
      });

      return await sendData({
        endpoint: '/oneliners_generation/edit_oneliners',
        method: 'PUT',
        body: {
          story_id: Number(id),
          user_inputs: filteredForEdit,
        },
        responseMessage: 'Oneliners Edited successfully',
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
            const { prompt: newPrompt, updated: newUpdated } = newItem;

            // STEP 1: look for empty updated entry with same prompt
            const emptyIndex = finalData[key].findIndex(
              item =>
                item.prompt.trim() === newPrompt.trim() &&
                item.updated.trim() === ''
            );

            if (emptyIndex !== -1 && newUpdated.trim() !== '') {
              // STEP 2: update the empty entry instead of creating new one
              finalData[key][emptyIndex].updated = newUpdated.trim();
            } else {
              // STEP 3: normal append
              finalData[key].push(newItem);
            }
          });
        });
      } else {
        finalData = newData;
      }

      sessionStorage.setItem('changed_with_prompt', JSON.stringify(finalData));
    },
    onSettled: () => setLoading(false),
  });

  const saveEditedOnelinersMutation = useMutation({
    mutationKey: ['saveEditedBeats', id],
    mutationFn: async () => {
      return await sendData({
        endpoint: '/oneliners_generation/save_edited_oneliners',
        method: 'PUT',
        body: { story_id: Number(id), edits: updatedList },
        responseMessage: 'Oneliners Saved successfully',
      });
    },
    onSuccess: response => {
      const updatedOneliners = response?.data?.response?.oneliners || [];
      setRecentEdits(response?.data?.response?.changes || []);

      //  Update beats stored in react-query
      queryClient.setQueryData(['oneliners', id], oldData => {
        return updatedOneliners.map((oneliner, index) => ({
          id: index + 1,
          text: oneliner,
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
    saveEditedOnelinersMutation.mutate();
  }

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
      if (
        response?.data?.response === 'Scene synopsis generated successfully'
      ) {
        navigate(`/cine-scribe/story-generation/${id}/scenes`);
      }
    },
    onSettled: () => setLoading(false),
  });

  // === HANDLERS ===
  async function handleRegenerate() {
    setLoading(true);
    setLoadingText(
      'Inspecting oneliners... making sure your story keeps its rhythm'
    );
    regenerateCheckOneliners.mutate();
  }

  const handleProceed = () => {
    setLoading(true);
    setLoadingText(
      'Rewriting oneliners to enhance emotion and flow will take a few minutes...'
    );
    proceedMutation.mutate();
  };

  const handleCancel = () => setIsPopupOpen(false);

  async function handleGenerateSceneSynopsis() {
    if (hasUnsavedChanges) {
      const confirm = window.confirm(
        'You have unsaved changes. Proceed anyway?'
      );
      if (!confirm) return;
      setEditList({});
    }
    setLoading(true);
    setLoadingText(
      'Writing your story — scene by scene will take 8-10 minutes.'
    );
    generateSceneSynopsisMutation.mutate();
  }

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
      setIsCollapsedOneliners(false);
    }

    // Reset
    setMessage('');
    setEditInputDisplay(null);
    setErrorMessage(null);
  };

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

  useEffect(() => {
    setHeaderProps({
      showButton: storyStatusBarDetails?.scene_synopsis_status === false,
      buttonText: 'Generate Scenes',
      onButtonClick: handleGenerateSceneSynopsis,
      showSGStatus: true,
      storyStatusBarDetails,
      disableButton: hasUnsavedChanges,
      showDownload: true,
      pdfData: oneliners,
    });
  }, [storyStatusBarDetails, oneliners, hasUnsavedChanges, setHeaderProps]);

  return (
    <div className="w-full h-full flex flex-col bg-primary-gray-50 scrollbar-gray">
      {loading && <Spinner text={loadingText} />}

      {isPending ? (
        <div className="mt-[10px] flex flex-1 flex-col w-full responsive-container mx-auto py-4">
          <OnelinerStoryGenerationLoading />
        </div>
      ) : error ? (
        <div className="w-full flex-1 mx-auto flex flex-col gap-10 items-center justify-center bg-primary-gray-100">
          <p className="text-red-500">Failed to load Oneliners.</p>
        </div>
      ) : oneliners.length > 0 ? (
        <div className="flex-grow w-full gap-1 flex overflow-hidden">
          <EditListPanel
            title="Oneliner"
            editList={editList}
            setEditList={setEditList}
            handleRegenerate={handleRegenerate}
            isCollapsed={isCollapsedOneliners}
            setIsCollapsed={setIsCollapsedOneliners}
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
              className={`mt-[10px] flex flex-1 flex-col ${!isCollapsedOneliners ? 'w-auto pl-4 pr-2 ' : 'responsive-container'}  mx-auto py-4`}
            >
              <div className="w-full py-[10px] container mx-auto grid gap-2 md:gap-4 grid-cols-1 justify-items-start">
                {filteredOneliners.length > 0 ? (
                  filteredOneliners.map(item => (
                    <div key={item.id} className="space-y-2 w-full text-sm">
                      <span className="font-bold mb-2">
                        Oneliner {item.id < 10 ? `0${item.id}` : item.id}{' '}
                        {highlightedIndices.includes(item.id) && (
                          <span className="text-[#3B82F6]">*</span>
                        )}
                      </span>

                      {/* Oneliner Card */}
                      <div
                        onMouseEnter={() => setHoveredBeat(item.id)}
                        onMouseLeave={() => setHoveredBeat(null)}
                        className="relative group py-3 px-3 min-h-[100px] rounded-xl text-md bg-[#171717] mt-1 flex justify-center items-center text-center transition-colors duration-200"
                        style={{
                          border: '1px solid',
                          borderColor: recentEdits.includes(item.id)
                            ? '#3B82F6'
                            : 'rgba(255, 255, 255, 0.1)',
                          color: '#A3A3A3',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                        }}
                      >
                        <span className="block w-full leading-relaxed text-justify px-2">
                          {item.text}
                        </span>

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
                              Recently Edited Oneliner.
                            </span>
                          )}

                        {/* Tooltip */}
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
                              This Oneliner can be expected as Interval.
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
                      </div>

                      {/* Edit Input */}
                      {editInputDisplay === item.id && (
                        <div className="flex relative items-center gap-2 bg-[#1B1B1B] px-3 rounded-xl py-3">
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
                                      : 'Refine your oneliner further...'
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
                                  className="bg-[#0a0a0a] text-[#fcfcfc] px-4 py-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                  disabled={
                                    disableInput ||
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
                  <p className="text-center text-gray-400 w-full">
                    No data available
                  </p>
                )}
              </div>

              {/* Modal */}
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
                    {responseMessage === 'Story not affected' &&
                      responseMessage}
                    {responseMessage === 'Validation failed due to' &&
                      'Hmm, We could not apply some of your changes.'}
                  </ModalHeader>
                  <ModalBody className="text-[#A3A3A3] text-sm">
                    {responseMessage === 'Story affected' && (
                      <div>
                        <span>This action cannot be done.</span>
                        <span>
                          <b>Changes mentioned</b> in the following Oneliners
                          may significantly impact how the story unfolds:
                        </span>
                        <div className="w-full font-semibold text-left">
                          Oneliners:&nbsp;
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
                          They might not align with your story or script
                          context. You might want to rephrase or update the
                          changes.
                        </span>
                        <span>
                          <b>Changes mentioned</b> in the following Oneliners
                          couldn't be used:
                            </span>
                            {changeIndex.length > 0 && (
                              <div className="font-semibold w-full text-left">
                                Oneliners:&nbsp;
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
        </div>
      ) : (
        <div className="flex-grow container mx-auto flex flex-col items-center justify-center">
          <p>No Oneliners Generated</p>
        </div>
      )}

      <UnsavedChangesModal
        isOpen={blocker.state === 'blocked'}
        blocker={blocker}
      />
    </div>
  );
}
