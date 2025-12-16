import React, { useEffect, useReducer } from 'react';
import DisplayScriptLayout from './Layout';

// Initial state
const initialState = {
  uiState: {
    analysisInProgress: false,
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

const NoDataDisplayAndGenerate = ({ statusList, name, id, inside = false }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { uiState } = state;

  // Add interval ref to clean up
  const processCheckInterval = React.useRef(null);

  // Add cleanup
  useEffect(() => {
    return () => {
      if (processCheckInterval.current) {
        clearInterval(processCheckInterval.current);
      }
    };
  }, []);

  return (
    <>
      <DisplayScriptLayout statusList={statusList}>
        <div className="w-full flex flex-col items-center justify-center rounded-md border-dashed border border-red-400 bg-red-50 p-8">
          No {name} Found
          <p className="mt-2">
            It looks like no {name.toLowerCase()} has been generated for this
            script yet. Would you like to create one now?
          </p>
        </div>
      </DisplayScriptLayout>
    </>
  );
};

export default NoDataDisplayAndGenerate;
