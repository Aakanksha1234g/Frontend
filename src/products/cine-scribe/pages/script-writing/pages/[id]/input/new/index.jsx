import React, { useEffect, useReducer, useRef, useState } from 'react';
import { useParams } from 'react-router';
import DisplayScriptLayout from '../../../../components/Layout';
import { apiRequest } from '@shared/utils/api-client';
import { Fountain } from 'fountain-js';
import { debounce } from 'lodash';
import {
  sceneIntExtOptionList,
  sceneShotTimeOptionList,
} from '../../../../../constants/ScriptConstant';
import ResequenceScenesDialog from '../resequence-scenes-dialog';
import TrashBin from '@assets/icons/TrashBin.svg';
const fountain = new Fountain();
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
    analysisInProgress: false,
    processId: null,
    processStatus: null,
  },
  errors: {},
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

      // Update sequence numbers and action types for subsequent scenes
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

      // Single map operation to handle both deletion and sequence updates
      return {
        ...state,
        formData: {
          ...state.formData,
          scene_summaries: state.formData.scene_summaries.map(scene => {
            if (scene.scene_sequence_no === deletedIndex) {
              // Mark the scene as deleted
              return {
                ...scene,
                scene_sequence_no: -1,
                action_type: 'delete',
              };
            } else if (scene.scene_sequence_no > deletedIndex) {
              // Update scenes that come after the deleted scene
              return {
                ...scene,
                scene_sequence_no: scene.scene_sequence_no - 1,
                action_type: 'update', // Always mark as update since sequence changed
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
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 opacity-96 bg-gray-100  flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-lg max-w-md w-full ">
        <h2 className="text-xl font-bold mb-4">Delete Scene</h2>
        <p className="mb-6">
          Are you sure you want to delete this scene? This action cannot be
          undone.
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="button-secondary">
            Cancel
          </button>
          <button onClick={onConfirm} className="button-error">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
const WriteAndViewScriptInput = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const [selectedScene, setSelectedScene] = useState(null);
  const [sceneIntExtOption, setSceneIntExtOption] = useState(null);
  const [sceneShotTimeOption, setSceneShotTimeOption] = useState(null);
  const [sceneLocationOption, setSceneLocationOption] = useState(null);

  const [sceneTitle, setSceneTitle] = useState('');
  const [scriptText, setScriptText] = useState('');
  const [parsedScript, setParsedScript] = useState([]);
  const [editingSceneId, setEditingSceneId] = useState(null);
  const [isScriptModified, setIsScriptModified] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [sceneToDelete, setSceneToDelete] = useState(null);

  const [state, dispatch] = useReducer(reducer, initialState);
  const { uiState, formData } = state;

  const statusList = [
    {
      name: 'Script Input',
      activeStatus: true,
      redirectedPath: `/cine-scribe/script-writing/${id}/input`,
    },
    {
      name: 'Act Analysis',
      activeStatus: data?.script_analysis_data,
      redirectedPath: `/cine-scribe/script-writing/${id}/analysis`,
    },
    {
      name: 'Beat Sheet',
      activeStatus: data?.script_analysis_data,
      redirectedPath: `/cine-scribe/script-writing/${id}/beat-sheet`,
    },
    {
      name: 'Character Arc',
      activeStatus: data?.script_analysis_data,
      redirectedPath: `/cine-scribe/script-writing/${id}/character-arc`,
    },
    {
      name: 'Script Report',
      activeStatus: data?.script_analysis_data,
      redirectedPath: `/cine-scribe/script-writing/${id}/report`,
    },
  ];

  useEffect(() => {
    let isSubscribed = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiRequest({
          endpoint: `/scene_data/display_scene_data/${id}`,
        });

        if (!response?.response) {
          throw new Error('Invalid API response format');
        }

        const apiData = response.response;
        setData(apiData);

        dispatch({
          type: 'UPDATE_FORM_DATA',
          payload: apiData,
        });
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => (isSubscribed = false);
  }, [id]);

  useEffect(() => {
    const sceneId = new URLSearchParams(window.location.search).get('sceneId');
    if (data?.scene_summaries) {
      let scene;
      if (sceneId) {
        scene = data.scene_summaries.find(
          s => s.scene_data_id === Number(sceneId)
        );
      } else {
        scene = data.scene_summaries[0]; // Default to the first scene
      }
      setSelectedScene(scene);
      if (scene) {
        setSceneTitle(scene.scene_title || '');
        const script = convertSceneObjectsToScript([scene]);
        setScriptText(script);
        const parsed = fountain.parse(script, true);
        setParsedScript(parsed.tokens || []);
      }
    }
  }, [data]);

  const convertSceneObjectsToScript = sceneObjects => {
    return sceneObjects
      .map(scene => {
        const interiorExterior =
          sceneIntExtOptionList
            .find(opt => opt.id === scene.scene_interior_exterior)
            ?.value.toUpperCase() || 'INT';

        const shotTime =
          sceneShotTimeOptionList
            .find(opt => opt.id === scene.scene_shot_time)
            ?.value.toUpperCase() || 'DAY';

        const location =
          scene.scene_location?.toUpperCase() || 'UNKNOWN LOCATION';

        const sceneHeading = `${interiorExterior}. ${location} - ${shotTime}`;
        setSceneTitle(sceneHeading);
        return `${scene.scene_summary?.trim() || ''}`;
      })
      .join('\n\n');
  };
  const renderFormattedScript = tokens => {

    return tokens.map((token, idx) => {
      switch (token.type) {
        case 'scene_heading':
          return (
            <h3 key={idx} className="uppercase font-bold mt-4">
              {token.text}
            </h3>
          );
        case 'action':
          return (
            <p key={idx} className="my-2  w-full">
              {token.text}
            </p>
          );
        case 'character':
          return (
            <p key={idx} className="uppercase text-center font-semibold mt-4">
              {token.text}
            </p>
          );

        case 'dialogue':
          return (
            <p key={idx} className="text-center italic text-gray-500">
              {token.text}
            </p>
          );
        default:
          return (
            <p key={idx} className="text-center">
              {token.text}
            </p>
          );
      }
    });
  };
  const textareaRef = useRef(null);

  const handleTextChange = debounce(text => {
    setScriptText(text);
    const parsed = fountain.parse(text, true);
    setParsedScript(parsed.tokens || []);
  }, 300);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      const listener = e => handleTextChange(e.target.value);
      textarea.addEventListener('input', listener);
      return () => textarea.removeEventListener('input', listener);
    }
  }, [handleTextChange]);

  const handleSceneChange = sceneId => {
    if (isScriptModified) {
      const shouldSave = window.confirm(
        'You have unsaved changes. Would you like to save before switching scenes?'
      );
      if (shouldSave) {
        handleSave().then(() => {
          // Only switch scenes after save is complete
          switchScene(sceneId);
        });
        return;
      }
    }
    switchScene(sceneId);
  };

  const switchScene = sceneId => {
    const scene = data.scene_summaries.find(
      s => s.scene_data_id === Number(sceneId)
    );
    if (scene) {
      const { scene_interior_exterior, scene_location, scene_shot_time } =
        parseSceneTitle(scene.scene_title || '');

      const intExtMatch = sceneIntExtOptionList.find(
        item => item.value.toUpperCase() === scene_interior_exterior
      );
      const shotTimeMatch = sceneShotTimeOptionList.find(
        item => item.value.toUpperCase() === scene_shot_time
      );
     

      setSceneIntExtOption(intExtMatch || null);
      setSceneShotTimeOption(shotTimeMatch || null);
      setSceneLocationOption(scene_location || null); // scene_location is a string
      setSelectedScene(scene);

      setSceneTitle(scene.scene_title || '');
      const script = convertSceneObjectsToScript([scene]);
      setScriptText(script);
      const parsed = fountain.parse(script, true);
      setParsedScript(parsed.tokens || []);
    }
    setIsScriptModified(false);
  };

  const handleSceneTitleChange = e => {
    setSceneTitle(e.target.value);
  };

  const handleScriptChange = e => {
    setScriptText(e.target.value);
    const parsed = fountain.parse(e.target.value, true);
    setParsedScript(parsed.tokens || []);
    setIsScriptModified(true);
  };

  const handleSave = async () => {
 
    const scenesToSend = formData.scene_summaries.filter(
      scene => scene.action_type
    );

    const bodyData = {
      scene_summaries: scenesToSend,
    };

    await apiRequest({
      endpoint: `/scene_data_processing/${id}/save_scene_data`,
      method: 'PUT',
      body: JSON.stringify(bodyData),
      refreshPage: true,
      successMessage: 'Scene data saved successfully',
    });
    setIsScriptModified(false);
  };

  const handleDeleteScene = sceneId => {
    setSceneToDelete(sceneId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
  
    const scenesToSend = formData.scene_summaries.filter(
      scene => scene.action_type
    );

    const bodyData = {
      scene_summaries: scenesToSend,
    };
    if (sceneToDelete) {
      // Call the API to delete the scene
      await apiRequest({
        endpoint: `/scene_data_processing/${id}/save_scene_data`,
        method: 'PUT',
        body: JSON.stringify(bodyData),
        refreshPage: true,
        successMessage: 'Scene deleted successfully',
      });

      // Update the local state
      dispatch({
        type: 'DELETE_SCENE',
        payload: sceneToDelete,
      });

      // Close the modal and reset the scene to delete
      setIsDeleteModalOpen(false);
      setSceneToDelete(null);
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    let parsedValue = value;

    if (name === 'scene_sequence_no') {
      parsedValue = parseInt(value, 10) || '';
    } else if (
      name === 'scene_interior_exterior' ||
      name === 'scene_shot_time'
    ) {
      parsedValue = value; // Store as string but validate as number
    }

    dispatch({
      type: 'FIELD_CHANGE',
      field: name,
      value: parsedValue,
    });
  };
  function reducer(state, action) {
    switch (action.type) {
      case 'FIELD_CHANGE':
        return {
          ...state,
          formData: {
            ...state.formData,
            [action.field]: action.value,
          },
          isChanged: true,
          errors: {
            ...state.errors,
            [action.field]: '',
          },
        };
      case 'SET_ERRORS':
        return {
          ...state,
          errors: action.payload,
        };
      case 'RESET_FORM':
        return {
          ...initialState,
          formData: action.payload || initialState.formData,
          errors: {},
        };
      default:
        return state;
    }
  }

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setSceneToDelete(null);
  };

  return (
    <DisplayScriptLayout statusList={statusList}>
      <ResequenceScenesDialog
        isOpen={uiState.isResequenceOpen}
        onClose={() =>
          dispatch({
            type: 'UPDATE_UI_STATE',
            payload: { isResequenceOpen: false },
          })
        }
        scenes={formData.scene_summaries}
        script_id={id}
      />
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
      />
      <div className="flex gap-4 w-full h-full">
        <div className="py-2  w-[300px] p-0 m-0 shadow-sm shadow-shadow-chat-button rounded-lg items-stretch flex flex-col gap-2 overflow-y-auto">
          {data?.scene_summaries?.map((summary, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-4 hover:bg-gray-100 transition-colors duration-200"
            >
              <div
                onClick={() => handleSceneChange(summary.scene_data_id)}
                className={`py-2 px-2 shadow-lg shadow-shadow-chat-button rounded-r-lg cursor-pointer flex items-center gap-4 ${
                  selectedScene &&
                  Number(selectedScene.scene_data_id) ===
                    Number(summary.scene_data_id)
                    ? 'bg-blue-100'
                    : 'bg-white'
                }`}
              >
                {index + 1}. {summary.scene_title}
                <button
                  onClick={e => {
                    e.stopPropagation();
                    handleDeleteScene(summary.scene_data_id);
                  }}
                  className="p-1 bg-red-100 hover:bg-red-200 rounded-full transition-colors duration-200"
                >
                  <img src={TrashBin} alt="Trash" className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex-1   flex flex-col items-end gap-4 pt-6 h-full">
          <div className="flex gap-4 ">
            <button
              disabled={formData.scene_summaries.length === 0}
              onClick={() =>
                dispatch({
                  type: 'UPDATE_UI_STATE',
                  payload: { isResequenceOpen: true },
                })
              }
              className="button-primary"
            >
              Reorder Scenes
            </button>
            {isScriptModified && (
              <button onClick={handleSave} className="button-primary">
                Save Changes
              </button>
            )}
          </div>
          <div className="flex gap-4 w-full h-full">
            <div className="flex flex-col gap-4 flex-1">
              <div className="flex items-center gap-4 justify-around w-full flex-wrap">
                <div className="flex flex-col gap-2 flex-1">
                  <label className="font-bold">Scene Type</label>
                  <select
                    required
                    name="scene_interior_exterior"
                    value={sceneIntExtOption}
                    defaultValue={''}
                    onChange={handleChange}
                    className=" border-b-2 border-gray-200  text-black bg-white"
                  >
                    <option
                      key={0}
                      value={''}
                      disabled
                      className="text-grey-500"
                    >
                      Select type of scene{' '}
                    </option>
                    {sceneIntExtOptionList.map(item => (
                      <option
                        key={item.id}
                        value={item.id}
                        className="text-black"
                      >
                        {' '}
                        {item.value}
                      </option>
                    ))}
                  </select>
                  {state.errors.scene_interior_exterior && (
                    <div className="text-red-500 text-sm">
                      {state.errors.scene_interior_exterior}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 flex-1">
                  <label className="font-bold">Shot Time</label>
                  <select
                    required
                    defaultValue={''}
                    name="scene_shot_time"
                    value={sceneShotTimeOption}
                    onChange={handleChange}
                    className=" border-b-2 border-gray-200  text-black bg-white"
                  >
                    <option
                      key={0}
                      value={''}
                      disabled
                      className="text-grey-500"
                    >
                      Select time of scene{' '}
                    </option>
                    {sceneShotTimeOptionList.map(item => (
                      <option
                        key={item.id}
                        value={item.id}
                        className="text-black"
                      >
                        {item.value}
                      </option>
                    ))}
                  </select>
                  {state.errors.scene_shot_time && (
                    <div className="text-red-500 text-sm">
                      {state.errors.scene_shot_time}
                    </div>
                  )}
                </div>
              </div>
              <input
                type="text"
                value={sceneLocationOption}
                onChange={handleSceneTitleChange}
                className="p-2 border rounded-lg"
                placeholder="Scene Title"
              />
              <textarea
                ref={textareaRef}
                value={scriptText}
                onChange={handleScriptChange}
                className="p-2 w-full h-full border rounded-lg"
                placeholder="Write your script in Fountain format here..."
              />
            </div>
            <div className="bg-white border rounded-lg p-4 overflow-auto flex-1">
              <h2 className="font-bold mb-2">📝 Preview</h2>
              <div className="prose prose-sm">
                {renderFormattedScript(parsedScript)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DisplayScriptLayout>
  );
};

export default WriteAndViewScriptInput;
