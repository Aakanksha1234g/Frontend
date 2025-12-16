import EditIcon from '@assets/icons/PenNewSquare.svg';
import React, { useState, useReducer } from 'react';
import { useMutation } from '@tanstack/react-query';
import { sendData } from '@api/apiMethods';

const EditSceneDataButton = ({ scene, scriptId, queryClient }) => {
 
  const [isModalOpen, setIsModalOpen] = useState(false);

  const timeStringToSeconds = timeString => {
    if (!timeString) return 0;
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  };

  const secondsToTimeString = totalSeconds => {
    const safeSeconds = Number.isFinite(totalSeconds) ? totalSeconds : 0;
    const hours = Math.floor(safeSeconds / 3600);
    const minutes = Math.floor((safeSeconds % 3600) / 60);
    const seconds = safeSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
      2,
      '0'
    )}:${String(seconds).padStart(2, '0')}`;
  };

  const initialState = {
    scene_key_elements: scene.scene_key_elements,
    scene_duration: scene.scene_duration
      ? timeStringToSeconds(scene.scene_duration)
      : 0,
  };

  const reducer = (state, action) => {
    switch (action.type) {
      case 'UPDATE_DURATION':
        return { ...state, scene_duration: action.payload };

      case 'REMOVE_ENTRY':
        const newState = { ...state };
        delete newState.scene_key_elements[action.category][action.key];
        return newState;
      case 'RESET':
        return initialState;
      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(reducer, initialState);
  const [isChanged, setIsChanged] = useState(false);

  const { mutate, isLoading, isError, error } = useMutation({
    mutationKey: ['updateSceneEvaluationData', scene?.scene_data_id],
    mutationFn: data =>
      sendData({
        endpoint: `/scene_evaluation_processing/update_scene/${scene?.scene_data_id}`,
        method: 'PUT',
        body: JSON.stringify(data),
        responseMessage: 'Changes saved successfully!',
      }),
    onSuccess: () => {
      setIsModalOpen(false);
      setIsChanged(false);
      queryClient.invalidateQueries(['sceneEvaluations', scriptId]);
    },
  });

  const resetState = () => {
    dispatch({ type: 'RESET' });
    setIsChanged(false);
  };

  const handleSave = async e => {
    e.preventDefault();
    mutate({
      ...state,
      scene_duration: secondsToTimeString(state.scene_duration),
    });
  };

  const handleClose = () => {
    if (isChanged) {
      const shouldClose = confirm(
        'You have unsaved changes. Are you sure you want to close?'
      );
      if (shouldClose) {
        resetState();
        setIsModalOpen(false);
      }
    } else {
      setIsModalOpen(false);
    }
  };

  return (
    <>
      <button onClick={() => setIsModalOpen(true)} className="iconButton">
        <img src={EditIcon} alt="EditIcon" />
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 pointer-events-auto">
          <form
            onSubmit={handleSave}
            className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl shadow-shadow-chat-button"
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Scene Details
              </h2>
              <button
                type="button"
                onClick={handleClose}
                className="button-secondary hover:bg-red-100 px-2 py-1  rounded-full"
              >
                ✕
              </button>
            </div>

            {/* Duration Field - Reduced spacing */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (HH:MM:SS)
              </label>
              <div className="flex gap-2">
                {['hours', 'minutes', 'seconds'].map((unit, index) => {
                  const value =
                    Math.floor(
                      state.scene_duration /
                        (index === 0 ? 3600 : index === 1 ? 60 : 1)
                    ) % (index === 0 ? 100 : 60);

                  return (
                    <div key={unit} className="flex-1">
                      <input
                        type="number"
                        min="0"
                        max={index === 0 ? 99 : 59}
                        placeholder={unit.toUpperCase()}
                        value={value}
                        onChange={e => {
                          const newValue = Math.min(
                            Math.max(parseInt(e.target.value) || 0, 0),
                            index === 0 ? 99 : 59
                          );

                          const multipliers = [3600, 60, 1];
                          const newTotal =
                            state.scene_duration +
                            (newValue - value) * multipliers[index];

                          dispatch({
                            type: 'UPDATE_DURATION',
                            payload: Math.min(newTotal, 359999),
                          });
                          setIsChanged(true);
                        }}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg
                          focus:ring-1 focus:ring-blue-500 focus:border-blue-500
                          [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                  );
                })}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Current: {secondsToTimeString(state.scene_duration)}
              </p>
            </div>

            {/* Status message and actions */}
            <div className="pt-4 border-t border-gray-100">
              {isError && (
                <p className="text-red-600">
                  {error instanceof Error ? error.message : 'An error occurred'}
                </p>
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="button-error"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="button-primary"
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default EditSceneDataButton;
