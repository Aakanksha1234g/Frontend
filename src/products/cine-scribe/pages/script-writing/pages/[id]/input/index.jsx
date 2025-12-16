import React, { useReducer, useState, useEffect, useCallback, use } from 'react';
import { useParams, useBlocker } from 'react-router';
import DisplayScriptLayout from '../../../components/Layout';
import { EditIcon, DeleteIcon } from '@shared/layout/icons';
import EditSceneModal from './EditScenesModal';
import ResequenceScenesDialog from './ResequenceScenesDialog';
import HistoryModal from '@shared/History/historyView';
import { useUser } from '@shared/context/user-context';
import ScreenplayAnalysisPage from '../script-details/GenerationCarousel';
import InputScriptGenerationLoading from './loading';

import {
  sceneIntExtOptionList,
  sceneShotTimeOptionList,
} from '../../../../../constants/ScriptConstant';
import Button from '@shared/ui/button';
import { Fountain } from 'fountain-js';
import { SaveChangesIcon, ReorderIcon } from '@shared/layout/icons';
import { HistoryIcon, AddSquareIcon } from '@shared/layout/icons';
import StatusList from '../../../components/StatusList';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchData, sendData } from '@api/apiMethods';
import UnsavedChangesModal from '@shared/unSavedChangesModal';
import IconButtonWithTooltip from '@shared/ui/IconButtonWithTooltip';
import { useProductHeader } from '@products/cine-scribe/contexts/ProductHeaderContext';
import SceneActionDropdown from './sceneActionDropDown';
import { has } from 'lodash';
const initialState = {
  formData: {
    scene_summaries: [],
  },
  uiState: {
    isModalOpen: false,
    isResequenceOpen: false,
    selectedSceneIndex: 0,
    isNewScene: false,
    lastUpdatedIndex: -1,
    processId: null,
    processStatus: null,
  },
};

function reducer(state, action) {
  switch (action.type) {
    case 'UPDATE_UI_STATE':
      return {
        ...state,
        uiState: { ...state.uiState, ...action.payload },
      };
    case 'ADD_SCENE':
      const newScene = {
        ...action.payload,
        action_type: 'add',
        scene_sequence_no: action.index,
        scene_summaries: state.formData.scene_summaries.map(scene =>
          scene.scene_sequence_no === action.payload.scene_sequence_no
            ? {
              ...action.payload,
              action_type: scene.scene_data_id === 0 ? 'add' : 'update',
              scene_title: `${sceneIntExtOptionList
                .find(
                  opt => opt.id === action.payload.scene_interior_exterior
                )
                ?.value.toUpperCase() || 'INT'
                }. ${action.payload.scene_location || ' '} - ${sceneShotTimeOptionList
                  .find(opt => opt.id === scene.scene_shot_time)
                  ?.value.toUpperCase() || 'DAY'
                }`,
            }
            : scene
        ),
      };

      // Handle case when there are no existing scenes
      if (state.formData.scene_summaries.length === 0) {
        return {
          ...state,
          formData: {
            ...state.formData,
            scene_summaries: [newScene],
          },
        };
      }

      const updatedScenesAfterAdd = state.formData.scene_summaries.map(
        scene => {
          if (scene.scene_sequence_no >= action.index) {
            return {
              ...scene,
              scene_sequence_no: scene.scene_sequence_no + 1,
              action_type: scene.action_type === 'delete' ? 'delete' : 'update',
            };
          }
          return scene;
        }
      );

      return {
        ...state,
        formData: {
          ...state.formData,
          scene_summaries: [
            ...updatedScenesAfterAdd.slice(0, action.index),
            newScene,
            ...updatedScenesAfterAdd.slice(action.index),
          ],
        },
      };
    case 'DELETE_SCENE':
      const deletedIndex = action.payload;

      return {
        ...state,
        formData: {
          ...state.formData,
          scene_summaries: state.formData.scene_summaries.map(scene => {
            if (scene.scene_sequence_no === deletedIndex) {
              return {
                ...scene,
                scene_sequence_no: -1,
                action_type: 'delete',
              };
            } else if (scene.scene_sequence_no > deletedIndex) {
              return {
                ...scene,
                scene_sequence_no: scene.scene_sequence_no - 1,
                action_type: 'update',
              };
            }
            return scene;
          }),
        },
      };
    case 'UPDATE_SCENE':
      return {
        ...state,
        formData: {
          ...state.formData,
          scene_summaries: state.formData.scene_summaries.map(scene =>
            scene.scene_sequence_no === action.payload.scene_sequence_no
              ? {
                ...action.payload,
                action_type: scene.scene_data_id === 0 ? 'add' : 'update',
              }
              : scene
          ),
        },
      };
    case 'UPDATE_FORM_DATA':
      return {
        ...state,
        formData: {
          ...state.formData,
          ...action.payload,
          scene_summaries:
            action.payload.scene_summaries || state.formData.scene_summaries,
        },
      };
    case 'UPDATE_PROCESS_STATUS':
      return {
        ...state,
        uiState: {
          ...state.uiState,
          processStatus: action.payload,
        },
      };
    default:
      return state;
  }
}

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div
      className={`flex
      fixed inset-0  items-center justify-center z-50 bg-black/50 backdrop-blur-md overflow-y-auto scrollbar-gray`}
    >
      <div className="bg-[#1B1B1B] text-sm px-6 py-5 rounded-xl shadow-pop-up shadow-shadow-pop-up min-w-[250px] max-w-[400px] max-h-screen overflow-y-auto flex flex-col items-center justify-start gap-4">
        <div>
          <h2 className="text-white font-semibold text-lg mb-2">
            Delete Scene
          </h2>
          <p className="text-[#A3A3A3] text-sm mb-4">
            Are you sure you want to delete this scene? This action cannot be
            undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              size="md"
              onClick={onClose}
              disabled={isLoading}
              className="bg-[#262626] hover:bg-default-400 text-[#FCFCFC] cursor-pointer px-2 py-3 rounded-xl  text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isLoading}
              className="px-2 py-3 rounded-xl cursor-pointer text-sm bg-[#EB5545] text-white hover:bg-[#FF6B5C]"
            >
              {isLoading ? (
                'Deleting...'
              ) : (
                'Delete'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
const fountain = new Fountain();
const DisplayScriptInputAndEdit = () => {
  // const [data, setData] = useState(null);
  const { id } = useParams();
  const { state: profileState } = useUser();
  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    sceneToDelete: null,
  });

  const [historyModalState, setHistoryModalState] = useState({
    isOpen: false,
    sceneId: null,
  });

  const queryClient = useQueryClient();
  const { setHeaderProps } = useProductHeader();
  const [buttonSize, setButtonSize] = useState('sm');

  useEffect(() => {
    const width = window.innerWidth;

    if (width < 1440) {
      setButtonSize('sm');
    } else if (width > 1920) {
      setButtonSize('lg');
    } else {
      setButtonSize('md');
    }
  }, []);
  // Check if there are unsaved changes

  const handleGenerateStoryDetails = async () => {
    try {
      generateScriptDetails();
    } catch (error) {
      console.error('Error generating story details:', error);
    }
  };

const {
  data,
  isPending: loading,
  error,
  refetch,
} = useQuery({
  queryKey: ['getScriptInputData', id],
  queryFn: async () => {
    const response = await fetchData({
      endpoint: `/scene_data/display_scene_data/${id}`,
    });

    if (!response.data.response) {
      throw new Error('Invalid API response format');
    }

    dispatch({
      type: 'UPDATE_FORM_DATA',
      payload: response.data.response,
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
   if (!data?.background_process) return;

   const interval = setInterval(() => {
     refetch(); // now guaranteed to exist
   }, 60_000);

   return () => clearInterval(interval);
 }, [data?.background_process, refetch]);



  const [reader, setReader] = useState(false);

  useEffect(() => {
    setReader(!!data?.scene_summaries?.length);
  }, [data?.scene_summaries]);

  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    formData: data
      ? {
          ...initialState.formData,
          scene_summaries: data?.scene_summaries || [],
        }
      : initialState.formData,
  });
  const { formData, uiState } = state;

  const hasUnsavedChanges = formData.scene_summaries.some(
    scene => scene.action_type
  );

  // Block navigation if there are unsaved changes
  const blocker = useBlocker(hasUnsavedChanges);


  useEffect(() => {
    const isButtonDisabled =
      formData.scene_summaries.filter(scene => scene.scene_sequence_no !== -1)
        .length < 60 ||
      data?.script_info ||
      data?.background_process;

    setHeaderProps({
      showSWStatus: true,
      scriptStatusBarDetails: {
        script_id: true,
        script_info: data?.script_info,
        script_analysis_data: data?.script_analysis_data,
      },
      showButton: !data?.script_info,
      buttonText: data?.background_process
        ? 'Generating Script Details...'
        : 'Generate Script Details',
      onButtonClick: handleGenerateStoryDetails,
      disableButton: hasUnsavedChanges || isButtonDisabled,
    });
  }, [data, formData.scene_summaries]);

  const { mutate: mutateFinalSave, isPending: isSaving } = useMutation({
    mutationKey: ['saveSceneData', id],
    mutationFn: async bodyData => {
      await sendData({
        endpoint: `/scene_data_processing/${id}/save_scene_data`,
        method: 'PUT',
        body: JSON.stringify(bodyData),
      });
    },
    onSuccess: response => {
      queryClient.invalidateQueries(['getScriptInputData', id]);
    },
  });
  const {
    mutate: generateScriptDetails,
    isLoading: isGeneratingScriptDetails,
  } = useMutation({
    mutationKey: ['generateScriptDetails', id],
    mutationFn: async () => {
      const response = await sendData({
        endpoint: `/script_processing/generate_script_details/${id}`,
        method: 'POST',
      });
      return response.data.response;
    },
    onSuccess: response => {
      queryClient.invalidateQueries(['getScriptInputData', id]);
    },
  });

  const normalizeInteriorExterior = value => {
    if (!value) return '';
    const val = value?.toUpperCase().replace(/\s+/g, '');
    if (['EXT/INT', 'INT/EXT'].includes(val)) {
      return val.replace('/', './') + '.';
    }
    return val.endsWith('.') ? val : val + '.';
  };

  //  Add this ABOVE your other two functions
  const highlightCharacters = text => {
    if (!text) return '';

    return text.replace(/\/b(.*?)\/b/g, (_, name) => {
      return `<span class="font-bold text-[#E2C044] block">${name}</span>`;
    });
  };


  const convertSceneObjectsToScript = sceneObjects => {
    return sceneObjects
      .map(scene => {
        const interiorExterior = normalizeInteriorExterior(
          scene.scene_interior_exterior
        );
        const location =
          scene.scene_location?.toUpperCase() || 'UNKNOWN LOCATION';
        const shotTime = scene.scene_shot_time?.toUpperCase() || 'DAY';
        const sceneType = scene.scene_type ? ` (${scene.scene_type})` : '';

        const sceneHeading = `${interiorExterior} ${location} - ${shotTime}${sceneType}`;

        return `${sceneHeading}\n\n${scene.scene_summary?.trim() || ''}`;
      })
      .join('\n\n');
  };

const renderFormattedScript = (tokens, sceneSequenceNo) => {
  return tokens.map((token, idx) => {
    switch (token.type) {
      case 'scene_heading':
        return (
          <h3 key={idx} className="uppercase font-bold text-[16px] mt-4">
            <b>Scene {sceneSequenceNo}.</b> {token.text}
          </h3>
        );

      case 'action':
        return (
          <p
            key={idx}
            className="my-2 w-[70%] mx-auto text-center text-[#B0B0B0] text-[14px]"
            dangerouslySetInnerHTML={{
              __html: highlightCharacters(token.text),
            }}
          />
        );

      case 'character':
        return (
          <p
            key={idx}
            className="uppercase text-center text-[14px] text-[#fcfcfc] mt-4"
          >
            {token.text}
          </p>
        );

      case 'dialogue':
        return (
          <p
            key={idx}
            className="italic text-[14px] text-[#B0B0B0] w-[70%] mx-auto text-center"
            dangerouslySetInnerHTML={{
              __html: highlightCharacters(token.text),
            }}
          />
        );

      default:
        return (
          <p key={idx} className="text-center w-[70%] mx-auto text-[#B0B0B0]">
            {token.text}
          </p>
        );
    }
  });
};


  if (loading) {
    return (
      <div className="mt-[10px] flex flex-1 flex-col w-full responsive-container mx-auto pt-4">
        <InputScriptGenerationLoading />
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-center text-red-600">Error: {error}</div>;
  }

  if (!data || !formData.scene_summaries) {
    return (
      <div className="p-4 text-center text-gray-600">
        No Scene data available for this script
      </div>
    );
  }

  const handleFinalSave = async () => {
    // Filter scenes that have action_type

    const scenesToSend = formData.scene_summaries
      .filter(scene => scene.action_type)
      .map(
        ({
          scene_title,
          scene_summary,
          action_type,
          scene_data_id,
          scene_interior_exterior,
          scene_location,
          scene_shot_time,
          scene_type,
          scene_sequence_no,
        }) => ({
          scene_title,
          scene_summary,
          action_type,
          scene_data_id: parseInt(scene_data_id, 0),
          scene_sequence_no: parseInt(scene_sequence_no, 0),
          scene_interior_exterior, // keep as string
          scene_location,
          scene_shot_time,
          scene_type,
        })
      );

    const bodyData = {
      scene_summaries: scenesToSend,
    };

    mutateFinalSave(bodyData);
  };

  const formatSummary = text => {
    if (!text) return '';

    return text.replace(/\/b(.*?)\/b/g, (_, inside) => {
      return `<span class="font-bold text-[#E2C044]">${inside}</span>`;
    });
  };

  return (
    <div className="flex flex-col w-full h-full bg-[#0A0A0A] relative scrollbar-gray overflow-y-auto">
      {loading && <Spinner text={loadingText} />}

      {((data?.background_process && data?.script_info === false) ||
        isGeneratingScriptDetails) && (
        <ScreenplayAnalysisPage
          AnalysisTypeText="Script Details"
          EstimatedTime="6-8 minutes"
        />
      )}
      <div className="w-full responsive-container mx-auto  rounded-xl shadow-lg p-1 space-y-1 text-white">
        {/* Header Section */}
        <div className="rounded-[16px] w-full flex flex-col gap-1 justify-center items-center  py-3 px-6">
          <h4 className="text-[#FCFCFC] text-[16px] font-medium">
            Edit, Organize, and Evolve Your Script
          </h4>
          <p className="text-[#A3A3A3] text-center text-[14px]">
            Explore a clean breakdown of every scene. Add or remove moments,
            shift sequences, manage multiple versions, and perfect the rhythm of
            your script.
          </p>
        </div>
      </div>

      <div className="mt-[6px] flex flex-1 flex-col w-full   responsive-container mx-auto ">
        <UnsavedChangesModal
          isOpen={blocker.state === 'blocked'}
          blocker={blocker}
          onSave={handleFinalSave}
        />

        <EditSceneModal
          open={uiState.isModalOpen}
          sceneData={
            uiState.isNewScene
              ? {
                  scene_data_id: 0,
                  scene_sequence_no: uiState.selectedSceneIndex,
                  scene_summary: '',
                  scene_title: '',
                  scene_interior_exterior: '',
                  scene_location: '',
                  scene_shot_time: '',
                  scene_type: '',
                }
              : formData?.scene_summaries.find(
                  a => a.scene_sequence_no === uiState.selectedSceneIndex
                )
          }
          onClose={() =>
            dispatch({
              type: 'UPDATE_UI_STATE',
              payload: { isModalOpen: false },
            })
          }
          onSave={updatedScene => {
            if (uiState.isNewScene) {
              dispatch({
                type: 'ADD_SCENE',
                payload: updatedScene,
                index: uiState.selectedSceneIndex,
              });
            } else {
              dispatch({
                type: 'UPDATE_SCENE',
                payload: updatedScene,
              });
            }

            dispatch({
              type: 'UPDATE_UI_STATE',
              payload: {
                isModalOpen: false,
                isNewScene: false,
                lastUpdatedIndex: uiState.selectedSceneIndex,
              },
            });
          }}
          isNewScene={uiState.isNewScene}
        />
        <ResequenceScenesDialog
          isOpen={uiState.isResequenceOpen}
          onClose={() => {
            dispatch({
              type: 'UPDATE_UI_STATE',
              payload: { isResequenceOpen: false },
            });
          }}
          scenes={formData.scene_summaries}
          script_id={id}
        />
        <div className="h-full w-full flex flex-col gap-2.5  justify-between items-center overflow-x-visible ">
          {reader ? (
            <div className="prose prose-sm bg-[#1B1B1B] p-4 shadow-shadow-chat-button shadow-2xl w-full   responsive-container mx-auto   overflow-y-auto h-full rounded-md whitespace-pre-wrap flex ">
              <div className="w-full">
                {formData.scene_summaries
                  .filter(scene => scene.scene_sequence_no !== -1)
                  .map((scene, index) => (
                    <div key={scene.scene_sequence_no}>
                      {renderFormattedScript(
                        fountain.parse(
                          convertSceneObjectsToScript([scene]),
                          true
                        ).tokens,
                        scene.scene_sequence_no
                      )}
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <div className="flex w-full p-4 flex-col gap-6   overflow-x-visible h-full ">
              {formData.scene_summaries.filter(
                scene => scene.scene_sequence_no !== -1
              ).length == 0 ? (
                <div className=" text-[16px] flex text=[#fcfcfc]  flex-col items-center   gap-2.5  p-2 rounded-lg justify-center ">
                  Ready to bring your story to life? Add your opening scene to
                  begin
                  <Button
                    size="md"
                    className="button-primary"
                    onClick={() => {
                      dispatch({
                        type: 'UPDATE_UI_STATE',
                        payload: { isNewScene: true, selectedSceneIndex: 1 },
                      });
                      dispatch({
                        type: 'UPDATE_UI_STATE',
                        payload: { isModalOpen: true },
                      });
                    }}
                  >
                    Start your journey
                  </Button>
                </div>
              ) : (
                formData.scene_summaries
                  .filter(scene => scene.scene_sequence_no !== -1)
                  .sort((a, b) => a.scene_sequence_no - b.scene_sequence_no)
                  .map((scene, index) => (
                    <div
                      // ref={(el) => (scenesRefs.current[index] = el)}
                      key={`${scene.scene_data_id}-${scene.scene_sequence_no}`}
                      className={`flex flex-col items-start gap-2.5  shadow-shadow-chat-button shadow-sm p-5 rounded-2xl bg-[#1B1B1B] relative`}
                    >
                      <div
                        className={`${
                          data?.script_info
                            ? 'hidden'
                            : data.background_process
                              ? 'hidden'
                              : 'absolute'
                        } top-1 right-1`}
                      >
                        <SceneActionDropdown
                          onHistory={() =>
                            setHistoryModalState({
                              isOpen: true,
                              sceneId: scene.scene_data_id,
                            })
                          }
                          onEdit={() => {
                            dispatch({
                              type: 'UPDATE_UI_STATE',
                              payload: {
                                isNewScene: false,
                                selectedSceneIndex: scene.scene_sequence_no,
                                isModalOpen: true,
                              },
                            });
                          }}
                          onNewScene={() => {
                            dispatch({
                              type: 'UPDATE_UI_STATE',
                              payload: {
                                isNewScene: true,
                                selectedSceneIndex: scene.scene_sequence_no + 1,
                                isModalOpen: true,
                              },
                            });
                          }}
                          onDelete={() => {
                            setDeleteModalState({
                              isOpen: true,
                              sceneToDelete: scene.scene_sequence_no,
                            });
                          }}
                        />
                      </div>

                      {/* Scene Content */}
                      {/* <div className={`  text-2xl font-semibold  `}>
                        {scene.scene_sequence_no}-{" "}
                        {scene.scene_title || "New Scene"}
                      </div> */}
                      <div
                        className={`  text-[16px] text-[#FCFCFC] font-semibold  `}
                      >
                        {scene.scene_sequence_no} -
                        {scene.scene_sequence_no === scene.scene_subscene &&
                          scene?.scene_subscene}{' '}
                        {scene.scene_interior_exterior || 'New Scene'}.{' '}
                        {scene.scene_location || 'No location specified'} -{' '}
                        {scene.scene_shot_time || 'DAY'}
                        {scene.scene_type ? ` (${scene.scene_type})` : ''}
                      </div>
                      {/* <div className={`  text-base  `}>
                        {scene.scene_location || "No location specified"}
                      </div> */}
                      <div
                        className="self-stretch text-sm text-[#B0B0B0] text-justify"
                        dangerouslySetInnerHTML={{
                          __html: formatSummary(scene.scene_summary),
                        }}
                      />
                    </div>
                  ))
              )}
            </div>
          )}
          <div className="w-full flex items-center justify-center py-2 bg-[#0A0A0A] border-t border-white/10 sticky bottom-0">
            <div className=" flex w-full responsive-container  gap-4 items-center justify-between px-4 py-2 rounded-xl z-40 shadow-lg ">
              <div className=" flex  gap-4 items-center ">
                <div className="text-[16px] text-[#FCFCFC]">
                  Total Scenes :{' '}
                  {
                    formData.scene_summaries.filter(
                      scene => scene.scene_sequence_no !== -1
                    ).length
                  }
                </div>

                {!data.script_info && (
                  <Button
                    size={buttonSize}
                    disabled={
                      formData.scene_summaries.filter(
                        s => s.action_type == 'add'
                      ).length !== 0 ||
                      formData.scene_summaries.length <= 1 ||
                      data?.script_info ||
                      data.background_process ||
                      isSaving ||
                      isGeneratingScriptDetails ||
                      hasUnsavedChanges
                    }
                    onClick={() =>
                      dispatch({
                        type: 'UPDATE_UI_STATE',
                        payload: { isResequenceOpen: true },
                      })
                    }
                    className={` border-[1px] border-white/10 ${
                      formData.scene_summaries.filter(
                        s => s.action_type == 'add'
                      ).length !== 0 ||
                      formData.scene_summaries.length <= 1 ||
                      data?.script_info ||
                      data.background_process ||
                      isSaving ||
                      isGeneratingScriptDetails ||
                      hasUnsavedChanges
                        ? 'cursor-not-allowed bg-gray-800/50'
                        : ' bg-[#1B1B1B] hover:bg-default-400 text-[#FCFCFC] cursor-pointer px-2 py-3 rounded-xl text-sm'
                    }`}
                  >
                    <ReorderIcon size={20} />
                    Reorder Scenes
                  </Button>
                )}

                {!data.script_info && (
                  <Button
                    size={buttonSize}
                    onClick={() => setReader(!reader)}
                    className={` border-[1.2px] border-white/50 ${
                      formData.scene_summaries.filter(
                        scene => scene.scene_sequence_no !== -1
                      ).length === 0 || hasUnsavedChanges
                        ? 'cursor-not-allowed bg-gray-800/50'
                        : ' bg-[#1B1B1B] hover:bg-default-400 text-[#FCFCFC] cursor-pointer px-2 py-3 rounded-xl text-sm'
                    }`}
                    disabled={
                      formData.scene_summaries.filter(
                        scene => scene.scene_sequence_no !== -1
                      ).length == 0 || hasUnsavedChanges
                    }
                  >
                    {reader ? 'Edit' : 'Read'} Mode
                  </Button>
                )}
              </div>
              <div className="text-[16px] text-[#FCFCFC]">
                {!data.script_info && (
                  <Button
                    size={buttonSize}
                    disabled={!hasUnsavedChanges || isSaving}
                    onClick={handleFinalSave}
                    className={`  ${
                      !hasUnsavedChanges || isSaving
                        ? 'cursor-not-allowed bg-gray-800/50'
                        : ' bg-default-400 hover:bg-[#52525b] text-[#FCFCFC] cursor-pointer px-2 py-3 rounded-xl text-sm'
                    }`}
                  >
                    <SaveChangesIcon />
                    {isSaving ? 'Saving ...' : 'Save Changes'}
                  </Button>
                )}
              </div>
            </div>
          </div>

          <DeleteConfirmationModal
            isOpen={deleteModalState.isOpen}
            onClose={() =>
              setDeleteModalState({ isOpen: false, sceneToDelete: null })
            }
            onConfirm={() => {
              dispatch({
                type: 'DELETE_SCENE',
                payload: deleteModalState.sceneToDelete,
              });
              setDeleteModalState({ isOpen: false, sceneToDelete: null });
            }}
            isLoading={false}
          />

          <HistoryModal
            isOpen={historyModalState.isOpen}
            onClose={() =>
              setHistoryModalState({ isOpen: false, sceneId: null })
            }
            target_row_id={historyModalState.sceneId}
            table_name="scene_data_hist"
            currentData={data['scene_summaries'].find(
              scene => scene.scene_data_id === historyModalState.sceneId
            )}
            keysToCompare={['scene_summary', 'scene_title', 'scene_type']}
            title="History Comparison"
          />
        </div>
      </div>
    </div>
  );
};

export default DisplayScriptInputAndEdit;
