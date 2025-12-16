import { useEffect, useReducer, useMemo, useCallback, useState } from 'react';
import React from 'react';
import { MAX_SELECTIONS } from './constants';
import PaginationControls from '@shared/components/PaginationControls';
import Spinner from '@shared/ui/spinner';
import {
  deepDiff,
  filterObjectFields,
  getNestedValue,
  isObject,
  sortHistoryData,
} from './utils';

import { fetchData, sendData } from '@api/apiMethods';
import Button from '@shared/ui/button';
import { CrossIcon } from '@shared/layout/icons';
import { sceneTypeOptionList } from '../../products/cine-scribe/constants/ScriptConstant';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Action types
const ACTIONS = {
  SET_HISTORY_DATA: 'SET_HISTORY_DATA',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_SELECTED_ENTRIES: 'SET_SELECTED_ENTRIES',
  SET_COMPARISON_MODE: 'SET_COMPARISON_MODE',
  SET_PAGINATION: 'SET_PAGINATION',
  RESET_STATE: 'RESET_STATE',
  SET_SORT_CONFIG: 'SET_SORT_CONFIG',
};

// Initial state
const initialState = {
  historyData: [],
  loading: false,
  error: null,
  selectedEntries: [],
  comparisonMode: false,
  sortConfig: {
    key: 'operation_executed_at',
    direction: 'desc',
  },
  pagination: {
    page: 1,
    pageSize: 5,
    totalPages: 1,
    totalRecords: 0,
    hasMore: true,
  },
};

// Reducer function
const historyReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_HISTORY_DATA:
      return { ...state, historyData: action.payload };
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload };
    case ACTIONS.SET_SELECTED_ENTRIES:
      return { ...state, selectedEntries: action.payload };
    case ACTIONS.CLEAR_SELECTED_ENTRIES: // New case
      return { ...state, selectedEntries: [] };
    case ACTIONS.SET_COMPARISON_MODE:
      return { ...state, comparisonMode: action.payload };
    case ACTIONS.SET_PAGINATION:
      return {
        ...state,
        pagination: { ...state.pagination, ...action.payload },
      };
    case ACTIONS.RESET_STATE:
      return initialState;
    case ACTIONS.SET_SORT_CONFIG:
      return { ...state, sortConfig: action.payload };
    default:
      return state;
  }
};

const HistoryModal = ({
  isOpen,
  onClose,
  target_row_id,
  table_name,
  currentData,
  title = 'History',
  keysToCompare = [],
}) => {
  const [state, dispatch] = useReducer(historyReducer, initialState);
  const {
    historyData,
    loading,
    error,
    selectedEntries,
    comparisonMode,
    pagination,
    sortConfig,
  } = state;

  const [expandedRow, setExpandedRow] = useState(null);
  const queryClient = useQueryClient();
  let hist_id = 0;

  // Memoize keys to show
  const keysToShow = useMemo(() => {
    if (!keysToCompare || keysToCompare.length === 0) {
      return currentData ? Object.keys(currentData) : [];
    }
    return keysToCompare;
  }, [keysToCompare, currentData]);

  // Memoize sorted history data
  const sortedHistoryData = useMemo(() => {
    return sortHistoryData(historyData, sortConfig);
  }, [historyData, sortConfig]);

  // Memoize sorted selected entries
  const sortedSelectedEntries = useMemo(() => {
    return [...selectedEntries].sort(
      (a, b) =>
        new Date(b.operation_executed_at) - new Date(a.operation_executed_at)
    );
  }, [selectedEntries]);

  const [page, setPage] = useState(1);

  useEffect(() => {
    if (isOpen) setPage(1); // reset page when modal opens
  }, [isOpen, target_row_id]);

  const {
    data: historyResponse,
    isError,
    isPending: loadingData,
    refetch,
  } = useQuery({
    queryKey: [
      'historyData',
      target_row_id,
      table_name,
      page,
      sortConfig.key,
      sortConfig.direction,
    ],
    queryFn: async () => {
      if (!target_row_id) return { data: [], pagination: {} };
      const response = await fetchData({
        endpoint: `/history/${table_name}/${target_row_id}?page=${page}&page_size=${pagination.pageSize}&sort_by=${sortConfig.key}&sort_direction=${sortConfig.direction}`,
      });
      return response?.data?.response || { data: [], pagination: {} };
    },
    enabled: isOpen && !!target_row_id,
    keepPreviousData: true,
  });

  useEffect(() => {
    if (isError) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: 'Failed to load history' });
    }
  }, [isError]);

  useEffect(() => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: loadingData });
  }, [loadingData]);

  useEffect(() => {
    if (historyResponse) {
      dispatch({
        type: ACTIONS.SET_HISTORY_DATA,
        payload: historyResponse.data,
      });
      dispatch({
        type: ACTIONS.SET_PAGINATION,
        payload: {
          totalPages: historyResponse.pagination.total_pages,
          totalRecords: historyResponse.pagination.total_records,
          hasMore: historyResponse.pagination.has_next,
          page: page, // <- use local page
        },
      });
    }
  }, [historyResponse]);

  // Use separate state for query-related data
  const [queryEnabled, setQueryEnabled] = useState(false);

  useEffect(() => {
    // Only enable query when modal is open and target_row_id exists
    setQueryEnabled(isOpen && !!target_row_id);
  }, [isOpen, target_row_id]);

  // Handle page change
  const handlePageChange = useCallback(
    newPage => {
      if (newPage === page) return;
      setPage(newPage); // triggers useQuery refetch
    },
    [page]
  );
const [errorMessage, setErrorMessage] = useState('');
  // Toggle entry selection
const toggleEntrySelection = useCallback(
  entry => {
    const isSelected = selectedEntries.some(e => e.hist_id === entry.hist_id);

    if (isSelected) {
      // Unselect normally
      const newSelectedEntries = selectedEntries.filter(
        e => e.hist_id !== entry.hist_id
      );
      setErrorMessage('');
      dispatch({
        type: ACTIONS.SET_SELECTED_ENTRIES,
        payload: newSelectedEntries,
      });
      return;
    }

    // Trying to select a new entry
    if (selectedEntries.length >= MAX_SELECTIONS) {
      setErrorMessage(`You can select upto ${MAX_SELECTIONS} versions only.`);
      return; // STOP — do NOT auto-remove anything
    }

    // Add normally
    const newSelectedEntries = [...selectedEntries, entry];
    setErrorMessage('');
    dispatch({
      type: ACTIONS.SET_SELECTED_ENTRIES,
      payload: newSelectedEntries,
    });
  },
  [selectedEntries]
);

  // Handle close
  const handleClose = useCallback(() => {
    dispatch({ type: ACTIONS.RESET_STATE });
    onClose();
  }, [onClose]);

  // Handle sort
  const handleSort = useCallback(
    key => {
      const direction =
        sortConfig.key === key && sortConfig.direction === 'asc'
          ? 'desc'
          : 'asc';
      dispatch({ type: ACTIONS.SET_SORT_CONFIG, payload: { key, direction } });
    },
    [sortConfig]
  );

  // Reset state when modal is closed
  useEffect(() => {
    if (!isOpen) {
      dispatch({ type: ACTIONS.RESET_STATE });
    }
  }, [isOpen]);
  const findDifferences = useCallback(
    (oldData, newData) => {
      const differences = {};

      for (const keyPath of keysToShow) {
        const oldVal = getNestedValue(oldData, keyPath);
        const newVal = getNestedValue(newData, keyPath);
        const pathArray = keyPath.split('?.');

        if (isObject(oldVal) && isObject(newVal)) {
          const nestedDiffs = deepDiff(oldVal, newVal, pathArray);
          Object.assign(differences, nestedDiffs);
        } else if (Array.isArray(oldVal) && Array.isArray(newVal)) {
          if (oldVal.length !== newVal.length) {
            differences[keyPath] = {
              old: oldVal,
              new: newVal,
              type: 'array',
            };
          } else {
            for (let i = 0; i < oldVal.length; i++) {
              const nestedDiffs = deepDiff(oldVal[i], newVal[i], [
                ...pathArray,
                i,
              ]);
              if (Object.keys(nestedDiffs).length > 0) {
                differences[`${keyPath}[${i}]`] = {
                  old: oldVal[i],
                  new: newVal[i],
                  type: 'object',
                };
              }
            }
          }
        } else if (oldVal !== newVal) {
          differences[keyPath] = {
            old: oldVal,
            new: newVal,
            type: typeof oldVal,
          };
        }
      }

      return differences;
    },
    [keysToShow]
  );

  // Render helpers
  const renderHistoryItem = useCallback(
    histData => {
      const filteredData = filterObjectFields(histData);

      return (
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(filteredData)
            .filter(([key]) => keysToShow.includes(key))
            .map(([key, value]) => (
              <div
                key={key}
                className={key === 'scene_summary' ? 'col-span-2' : ''}
              >
                <h4 className="font-bold mb-1 capitalize">
                  {key.split('_').join(' ')}
                </h4>
                <p className="text-sm">
                  {typeof value === 'object'
                    ? JSON.stringify(value, null, 2)
                    : String(value || 'N/A')}
                </p>
              </div>
            ))}
        </div>
      );
    },
    [keysToShow]
  );

  const renderTableCellContent = useCallback(content => {
    if (content === null || content === undefined) {
      return <span className="text-gray-400">None</span>;
    }

    if (typeof content === 'object') {
      return (
        <div className="max-h-[200px] overflow-y-auto">
          <pre className="text-sm whitespace-pre-wrap break-words">
            {JSON.stringify(content, null, 2)}
          </pre>
        </div>
      );
    }

    if (typeof content === 'boolean') {
      return (
        <span
          className={`text-sm ${content ? 'text-green-600' : 'text-red-600'}`}
        >
          {content.toString()}
        </span>
      );
    }

    if (typeof content === 'string' && content.length > 100) {
      return (
        <details className="text-sm">
          <summary className="cursor-pointer text-[#E5E5E5]">
            Show full text
          </summary>
          <div className="mt-2 whitespace-pre-wrap">{content}</div>
        </details>
      );
    }

    if (typeof content === 'number') {
      const scene = sceneTypeOptionList.find(item => item.id === content);
      return (
        <span className="text-sm">
          {scene ? scene.value : `Unknown (${content})`}
        </span>
      );
    }

    return <span className="text-sm">{String(content)}</span>;
  }, []);

  const [loadingText, setLoadingText] = useState('');
  const [loader, setLoader] = useState(false);

  const { mutate: updateVersionMutation } = useMutation({
    mutationKey: ['updateVersion', hist_id],
    mutationFn: async hist_id => {
      return await sendData({
        endpoint: `/history/reinstate_history_data?history_table_name=${table_name}`,
        method: 'PUT',
        body: {
          hist_id: hist_id,
        },
        responseMessage: 'Version updated successfully',
      });
    },
    onSuccess: response => {
  
      if (response?.data?.response == 'Reinstatement successful') {
        setLoader(false);
        setPage(1);
        dispatch({ type: ACTIONS.RESET_STATE });
        queryClient.invalidateQueries([
          'historyData',
          target_row_id,
          table_name,
          page,
          sortConfig.key,
          sortConfig.direction,
        ]);
      }
    },
    onError: error => {
      setLoader(false);
      console.error('Error updating the version:', error);
    },
  });

  const handleUpdateVersion = hist_id => {
    try {
      setLoader(true);
      setLoadingText('Reverting to requested version');
      updateVersionMutation(hist_id); // <-- actually call mutate
    } catch (err) {
      console.error('Update version failed', err);
    }
  };

  const renderComparison = useCallback(() => {
    if (selectedEntries.length < 2) {
      return (
        <div className="text-center py-8 bg-[#0A0A0A] rounded-lg border border-white/10 my-4">
          <div className="text-[#fcfcfc] font-medium">
            Select at least two versions to compare changes.
          </div>
        </div>
      );
    }

    // Prepare versions
    const allVersions = sortedSelectedEntries.map(entry => {
      // Find the index of this entry in the full sortedHistoryData

      const historyIndex = sortedHistoryData.findIndex(
        e => e.hist_id === entry.hist_id
      );

      // Calculate version number based on pagination and its index in sortedHistoryData
      const versionNumber =
        pagination.totalRecords -
        ((pagination.page - 1) * pagination.pageSize + historyIndex);

      return {
        ...entry,
        versionLabel:
          historyIndex === 0 && pagination.page === 1
            ? 'Current'
            : `Version ${versionNumber}`,
      };
    });

    // Collect differences
    const allDifferences = new Set();
    for (let i = 0; i < allVersions.length - 1; i++) {
      const differences = findDifferences(
        allVersions[i + 1].hist_data,
        allVersions[i].hist_data || allVersions[i],
        keysToShow
      );
      Object.keys(differences).forEach(key => allDifferences.add(key));
    }

    const formatKeyPath = key =>
      key
        .split('?.')
        .map(segment =>
          segment
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
        )
        .join(' ➜ ');

    return (
      <div className="comparison-view my-4 bg-[#0A0A0A] rounded-lg border border-white/10 p-2">
        <div className="overflow-x-auto">
          {allDifferences.size === 0 ? (
            <div className="text-center py-8 bg-[#0A0A0A] rounded-lg border border-white/10">
              <div className="text-gray-400 font-medium">
                No Differences Found
              </div>
              <div className="text-sm text-gray-500 mt-2">
                The selected versions are identical.
              </div>
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#262626] rounded-[20px] border border-white/10">
                  <th className="px-4 py-2 border border-white/10 text-left text-[#E5E5E5] rounded-tl-lg">
                    Field
                  </th>
                  {allVersions.map((version, index) => (
                    <th
                      key={index}
                      className={`px-4 py-2 border border-white/10 text-center text-[#E5E5E5] ${
                        version.versionLabel === 'Current' ? 'bg-blue-950' : ''
                      }`}
                    >
                      <div className="flex flex-row items-center justify-center gap-3 py-1 px-2 border border-white/10 rounded-lg">
                        <span className="text-sm text-[#E5E5E5]">
                          {version.versionLabel}
                        </span>

                        {/* Revert button beside label */}
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={version.versionLabel === 'Current'}
                          className={`text-xs px-3 py-1 border border-white/20 ${
                            version.versionLabel === 'Current'
                              ? 'text-gray-500 cursor-not-allowed opacity-50'
                              : 'text-[#b0b0b0] hover:text-white hover:border-white/40'
                          }`}
                          onClick={() => handleUpdateVersion(version.hist_id)}
                        >
                          Revert
                        </Button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from(allDifferences).map(key => {
                  // Collect all values for this key across versions
                  const valuesForKey = allVersions.map(v =>
                    getNestedValue(v.hist_data, key)
                  );

                  // Skip this row entirely if all values are null, undefined, 0, or empty string
                  const allInvalid = valuesForKey.every(
                    val =>
                      val === null ||
                      val === undefined ||
                      val === 0 ||
                      val === ''
                  );

                  if (allInvalid) return null;

                  return (
                    <tr
                      key={key}
                      className="border-b border-white/10 hover:bg-[#111]"
                    >
                      <td className="px-4 py-3 border border-white/10 text-gray-300 capitalize align-top">
                        {formatKeyPath(key)}
                      </td>

                      {allVersions.map((version, index) => {
                        const value = getNestedValue(version.hist_data, key);
                        const nextValue = getNestedValue(
                          allVersions[index + 1]?.hist_data,
                          key
                        );

                        const hasChanged =
                          value !== nextValue &&
                          value !== null &&
                          value !== undefined &&
                          value !== 0 &&
                          nextValue !== null &&
                          nextValue !== undefined &&
                          nextValue !== 0;

                        return (
                          <td
                            key={index}
                            className={`px-4 py-3 border border-white/10 align-top ${
                              hasChanged ? 'bg-[#1E3A8A]/30' : ''
                            } ${version.versionLabel === 'Current' ? 'bg-blue-950/50' : ''}`}
                          >
                            <div
                              className={`relative text-gray-200 text-center ${
                                hasChanged ? 'font-semibold text-blue-300' : ''
                              }`}
                            >
                              {value !== null &&
                              value !== undefined &&
                              value !== 0 &&
                              value !== '' ? (
                                renderTableCellContent(value)
                              ) : (
                                <span className="text-gray-500 italic">—</span>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  }, [
    selectedEntries,
    sortedSelectedEntries,
    findDifferences,
    keysToShow,
    renderTableCellContent,
    pagination,
  ]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-md pointer-events-auto">
      {loader && <Spinner text={loadingText} />}
      <div
        className={`bg-[#1B1B1B] text-sm px-6 py-5 rounded-xl shadow-pop-up shadow-shadow-pop-up  w-full  max-h-[80%] overflow-y-auto border border-white/10 ${comparisonMode ? 'max-w-[1240px]' : 'max-w-[720px]'}`}
      >
        <div className="w-full flex justify-end items-end gap-4">
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
            <div className="text-sm font-medium text-[#fcfcfc]">Sorted by:</div>
            <div className="flex gap-2">
              <button
                className={`px-3 py-1 rounded text-sm ${
                  sortConfig.key === 'operation_executed_at'
                    ? 'bg-[#0A0A0A] text-[#fcfcfc]'
                    : 'bg-[#0A0A0A] text-[#fcfcfc]'
                }`}
              >
                Date{' '}
                {sortConfig.key === 'operation_executed_at' &&
                  (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </button>
            </div>
          </div>

          <Button
            size="sm"
            onClick={handleClose}
            className="border border-white/10  cursor-pointer p-2"
          >
            <CrossIcon size={20} color="#A3A3A3" />
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <h2 className="text-[20px] text-[#fcfcfc] ">{title}</h2>
          </div>
        </div>

        <div className="w-full mt-4  flex-1">
          {loadingData ? (
            <div className="text-center py-6">Loading...</div>
          ) : sortedHistoryData.length === 0 ? (
            <div className="text-gray-500 text-center py-6 italic">
              No history available
            </div>
          ) : (
            // render table

            <div className="w-full max-h-[400px] overflow-y-auto overflow-x-auto rounded-lg border border-white/10">
              <table className="min-w-full text-left text-sm rounded-[16px] bg-[#1A1A1A] ">
                <thead>
                  <tr className="bg-[#0A0A0A] font-semibold text-[#E5E5E5]">
                    {comparisonMode && <th className="px-4 py-2 w-[40px]"></th>}{' '}
                    <th className="px-4 py-2 w-[80px]">Version</th>
                    <th className="px-4 py-2 w-[200px]">Executed Operation</th>
                    <th className="px-4 py-2 w-[220px]">Date & Time</th>
                  </tr>
                </thead>

                <tbody>
                  {sortedHistoryData.map((entry, index) => {
                    const isLatest = index === 0;
                    const versionNumber =
                      pagination.totalRecords -
                      ((pagination.page - 1) * pagination.pageSize + index);

                    const formattedDate = new Date(
                      entry.operation_executed_at
                    ).toLocaleString();
                    const isExpanded = expandedRow === entry.hist_id;
                    const isSelected = selectedEntries.some(
                      e => e.hist_id === entry.hist_id
                    );

                    return (
                      <React.Fragment key={entry.hist_id || index}>
                        <tr
                          className={`cursor-pointer transition-colors hover:bg-[#2A2A2A] ${
                            isExpanded ? 'bg-[#2A2A2A]' : ''
                          }`}
                          onClick={e => {
                            if (comparisonMode) {
                              e.stopPropagation();
                              toggleEntrySelection(entry);
                            } else {
                              setExpandedRow(prev =>
                                prev === entry.hist_id ? null : entry.hist_id
                              );
                            }
                          }}
                        >
                          {comparisonMode && (
                            <td className="px-4 py-2">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleEntrySelection(entry)}
                                onClick={e => e.stopPropagation()}
                                className="w-4 h-4 cursor-pointer accent-[#171717]"
                              />
                            </td>
                          )}

                          <td className="px-4 py-2 font-medium text-gray-200">
                            {isLatest && pagination.page === 1 ? (
                              <span className="text-blue-700">Current</span>
                            ) : (
                              `V${versionNumber}`
                            )}
                          </td>

                          <td className="px-4 py-2 text-[#E5E5E5]">
                            <p className="border border-white/10 py-1 px-4 rounded-[16px]">
                              {entry.executed_operation}
                            </p>
                          </td>

                          <td className="px-4 py-2 text-[#E5E5E5] text-sm">
                            <p className="border border-white/10 py-1 px-4 rounded-[16px]">
                              {formattedDate}
                            </p>
                          </td>
                        </tr>

                        {isExpanded && !comparisonMode && (
                          <tr className="bg-[#1E1E1E]">
                            <td
                              colSpan={comparisonMode ? 4 : 3}
                              className="p-4 border-t border-white/10"
                            >
                              {renderHistoryItem(entry.hist_data)}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
              {errorMessage && (
                <div className="text-xs text-[#EB5545] mb-2 pl-4">
                  ⚠️ {errorMessage}
                </div>
              )}
            </div>
          )}

          {comparisonMode && selectedEntries.length > 0 && renderComparison()}
        </div>

        <div className="flex flex-col sm:flex-row justify-between p-4 gap-4">
          <div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={comparisonMode}
                onChange={() => {
                  // Clear selected entries when toggling comparison mode
                  dispatch({ type: ACTIONS.CLEAR_SELECTED_ENTRIES });

                  // Toggle comparison mode
                  dispatch({
                    type: ACTIONS.SET_COMPARISON_MODE,
                    payload: !comparisonMode,
                  });
                }}
              />

              <div className="w-11 h-6 bg-[#fcfcfc] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-black after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#fcfcfc]"></div>

              {/* Dynamic label color */}
              <span
                className={`ml-3 text-sm font-medium transition-colors ${
                  comparisonMode ? 'text-[#b0b0b0]' : 'text-gray-400'
                }`}
              >
                Comparison Mode {comparisonMode ? 'Active' : ''}
              </span>
            </label>

            <div className="text-sm text-[#b0b0b0] text-justify">
              {comparisonMode && (
                <div className="mt-2">
                  {/* <div className="flex items-center gap-2 text-[#fcfcfc] font-medium mb-1">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Comparison Mode Active
                  </div> */}
                  <p className="text-sm text-[#b0b0b0]">
                    Select up to {MAX_SELECTIONS} versions to compare. Changes
                    will be shown in chronological order.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2">
          {!loading && !error && sortedHistoryData.length > 0 && (
            <PaginationControls
              pagination={{
                currentPage: pagination.page,
                totalPages: pagination.totalPages,
                totalCount: pagination.totalRecords,
              }}
              onPageChange={handlePageChange}
              text="Total Versions:"
            />
          )}

          {loading && (
            <div className="flex justify-center items-center py-4">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {error && (
            <div className="text-red-600 text-center py-4">{error}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;
