import React, { useState, useEffect } from 'react';
import ClipBoardWhiteIcon from '@assets/icons/ClipBoardWhite.svg';
import Close from '@assets/icons/close.svg';
import { editLimits } from '../../../constants/StoryGenerationConstants';
import { Divider } from '@heroui/react';
import Button from '@shared/ui/button';
import {
  PlayArrowIcon,
  PreviewIcon,
  SubtractIcon,
  CrossIcon,
} from '@shared/layout/icons';
import IconButtonWithTooltip from '@shared/ui/IconButtonWithTooltip';


const Modal = ({ title, onClose }) => (
  <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-md">
    <div className="bg-[#1B1B1B] text-sm px-6 py-5 rounded-xl shadow-pop-up min-w-[250px] max-w-[400px] max-h-screen overflow-y-auto scrollbar-gray flex flex-col items-center justify-start gap-4">
      <p className="text-center text-sm text-primary-gray-900">
        Your edits have exceeded the allowed limit. Only{' '}
        {editLimits[title?.toLowerCase()] ?? 0} edits are allowed.
      </p>

      <Button
        size="md"
        onClick={onClose}
        className="bg-[#262626] hover:bg-default-400 text-[#FCFCFC] cursor-pointer px-2 py-3 rounded-xl text-sm"
      >
        Cancel
      </Button>
    </div>
  </div>
);

export default function EditListPanel({
  title,
  editList,
  setEditList,
  handleRegenerate,
  isCollapsed,
  setIsCollapsed,
  setEditInputDisplay,
  setMessage,
  changeIndex,
  setChangeIndex,
  updatedList,
  setUpdatedList,
  selectedIndex,
  setSelectedIndex,
  handleSaveEdits,
}) {
  const [changedWithPrompt, setChangedWithPrompt] = useState(() => {
    const stored = sessionStorage.getItem('changed_with_prompt');
    return stored ? JSON.parse(stored) : {};
  });

  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingDeleteKey, setPendingDeleteKey] = useState(null);
  const [selectedUpdateData, setSelectedUpdateData] = useState(null);
  const [showGeneratedData, setShowGeneratedData] = useState(false);


  useEffect(() => {
    const loadSessionData = () => {
      const stored = sessionStorage.getItem('changed_with_prompt');
      setChangedWithPrompt(stored ? JSON.parse(stored) : {});
    };

    const interval = setInterval(loadSessionData, 300);

    const handleStorage = e => {
      if (e.key === 'changed_with_prompt') loadSessionData();
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const [showModal, setShowModal] = useState(false);
  const [panelWidth, setPanelWidth] = useState(getPanelWidth());

  function getPanelWidth() {
    const w = window.innerWidth;
    if (w >= 1280) return 300;
    return 327;
  }

  useEffect(() => {
    const handleResize = () => setPanelWidth(getPanelWidth());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isEditChangesExceeded =
    editLimits?.[title?.toLowerCase()] < Object.keys(editList).length;

  const handleRemoveEdit = key => {
    // 1. Remove from editList
    const updatedList = { ...editList };
    delete updatedList[key];
    setEditList(updatedList);

    // 2. Remove from changeIndex
    setChangeIndex(prev => prev.filter(index => index !== Number(key)));

    // 3. Collapse if no more items
    if (Object.keys(updatedList).length === 0) {
      setIsCollapsed(true);
    }

    // 4. Also remove the key from sessionStorage.changed_with_prompt
    const stored = sessionStorage.getItem('changed_with_prompt');
    if (stored) {
      const parsed = JSON.parse(stored);

      // If key exists → remove it
      if (parsed[key]) {
        delete parsed[key];

        // Save updated storage (or clear if empty)
        if (Object.keys(parsed).length > 0) {
          sessionStorage.setItem('changed_with_prompt', JSON.stringify(parsed));
        } else {
          sessionStorage.removeItem('changed_with_prompt');
        }
      }
    }
  };

  const isMobile = window.innerWidth < 1280;

  return (
    <div
      className={`relative transition-[width] duration-300 ease-in-out responsive-feature-side shadow-md ${
        isCollapsed ? 'w-[15px]' : ''
      }`}
      style={{
        width: !isCollapsed ? `${panelWidth}px` : '15px',
      }}
    >
      {/* Toggle Button */}
      {Object.keys(editList).length > 0 && (
        <div
          onClick={() => setIsCollapsed(!isCollapsed)}
          role="button"
          className={`absolute flex items-center justify-center top-[5px] ${
            isCollapsed ? 'left-0 w-[70px]' : 'w-[24px] -right-6'
          } cursor-pointer z-30`}
        >
          {isCollapsed && (
            <img
              src={ClipBoardWhiteIcon}
              alt="Edits"
              className="w-9 h-9 lg:w-11 lg:h-11 bg-[#171717] rounded-xl p-2"
            />
          )}
          <div className="bg-white/10 rounded-r-2xl p-2">
            <PlayArrowIcon
              direction={isCollapsed ? 'left' : 'right'}
              fill="#E5E5E5"
              width={12}
              height={12}
              className="group-hover:fill-black transition-colors duration-200"
            />
          </div>
        </div>
      )}

      {isMobile && !isCollapsed && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(6px)',
            zIndex: 50,
          }}
        >
          <div
            style={{
              backgroundColor: '#0A0A0A',
              borderRadius: '1rem',
              padding: '1rem',
              width: '80%',
              height: '85vh',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              boxShadow: '0 0 20px rgba(0,0,0,0.3)',
            }}
          >
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setIsCollapsed(true)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#333] transition-colors"
              >
                <img src={Close} alt="Close" className="w-5 h-5" />
              </button>
            </div>

            {/* Header */}
            <div className="w-full bg-[#262626] text-[#fcfcfc] px-3 py-2 rounded-lg flex items-center justify-center gap-2 mb-3">
              <PreviewIcon size={24} />
              <h2 className="font-bold text-sm">Preview Changes</h2>
            </div>

            {/* Edit List */}
            {Object.keys(editList).length > 0 ? (
              <>
                <div className="flex-1 overflow-y-auto scrollbar-gray pr-1">
                  <ul className="w-full space-y-2">
                    {Object.entries(editList).map(([key, value]) => (
                      <li
                        key={key}
                        onClick={() => {
                          setEditInputDisplay(key);
                          setMessage(value);
                        }}
                        className="p-2 rounded-xl bg-[#1b1b1b] text-sm relative text-[#FCFCFC] cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`${
                              changeIndex.includes(Number(key))
                                ? 'text-[#EB5545]'
                                : 'text-[#fcfcfc]'
                            } font-bold mb-2`}
                          >
                            {title} {key < 10 ? `0${key}` : key}
                          </span>

                          <div
                            onClick={e => {
                              e.stopPropagation();
                              setPendingDeleteKey(key);
                              setShowConfirm(true);
                            }}
                            className="p-1 rounded-full cursor-pointer hover:bg-[#333]"
                          >
                            <CrossIcon size={16} color="white" />
                          </div>
                        </div>

                        {/* ALL prompt + updated items */}
                        {(changedWithPrompt[key] || []).map((item, i) => {
                          const hasUpdatedText =
                            typeof item.updated === 'string'
                              ? item.updated.trim() !== ''
                              : typeof item.updated === 'object' &&
                                item.updated !== null &&
                                Object.keys(item.updated).length > 0;

                          const isSelected =
                            selectedIndex[key]?.selectedIndex === i;

                          const handleSelect = () => {
                            if (!hasUpdatedText) return;

                            setSelectedIndex(prev => {
                              const already = prev[key]?.selectedIndex === i;
                              if (already) {
                                const updated = { ...prev };
                                delete updated[key];
                                return updated;
                              }
                              return { ...prev, [key]: { selectedIndex: i } };
                            });

                            setUpdatedList(prev => {
                              const already =
                                selectedIndex[key]?.selectedIndex === i;
                              if (already) {
                                const newList = { ...prev };
                                delete newList[key];
                                return newList;
                              }
                              return { ...prev, [key]: item.updated };
                            });
                          };

                          const handleClose = indexToRemove => {
                            // Remove item from sessionStorage for this beat/key
                            const stored = sessionStorage.getItem(
                              'changed_with_prompt'
                            );
                            if (stored) {
                              const parsed = JSON.parse(stored);

                              if (parsed[key] && Array.isArray(parsed[key])) {
                                // Remove only the specific item at index
                                parsed[key] = parsed[key].filter(
                                  (_, idx) => idx !== indexToRemove
                                );

                                if (parsed[key].length === 0) {
                                  delete parsed[key]; // remove key if array is empty
                                }

                                if (Object.keys(parsed).length > 0) {
                                  sessionStorage.setItem(
                                    'changed_with_prompt',
                                    JSON.stringify(parsed)
                                  );
                                } else {
                                  sessionStorage.removeItem(
                                    'changed_with_prompt'
                                  );
                                }
                              }
                            }

                            // Remove from selectedIndex if the removed item was selected
                            setSelectedIndex(prev => {
                              if (prev[key]?.selectedIndex === indexToRemove) {
                                const updated = { ...prev };
                                delete updated[key];
                                return updated;
                              }
                              return prev;
                            });

                            // Remove from updatedList only if it was selected
                            setUpdatedList(prev => {
                              const updated = { ...prev };
                              if (
                                updated[key] &&
                                selectedIndex[key]?.selectedIndex ===
                                  indexToRemove
                              ) {
                                delete updated[key];
                              }
                              return updated;
                            });
                          };

                          return (
                            <div
                              key={i}
                              className="mb-3 p-2 rounded-lg bg-[#222] flex flex-col gap-1"
                            >
                              {hasUpdatedText && (
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={handleSelect}
                                    className="w-4 h-4 accent-[#E2C044] cursor-pointer"
                                  />
                                  <span className="text-xs text-white/70">
                                    Use this update
                                  </span>
                                </label>
                              )}

                              <div className="flex items-center justify-between">
                                <p className="text-xs text-white/70 flex-1">
                                  <span className="text-white/40">
                                    Prompt {i + 1}:{' '}
                                  </span>
                                  {item.prompt}
                                </p>

                                {/* Show close icon only if updated text is empty */}

                                <IconButtonWithTooltip
                                  iconComponent={SubtractIcon}
                                  iconProps={{
                                    color: 'white',
                                    fill: 'white',
                                    size: 16,
                                  }}
                                  tooltipText={'Remove'}
                                  position="bottom"
                                  iconButton={false}
                                  onClick={() => handleClose(i)}
                                />
                              </div>
                              {item.prompt != "" && (
                                <p
                                  className={`text-xs text-justify text-white/70 ${hasUpdatedText
                                      ? 'cursor-pointer hover:text-white'
                                      : 'cursor-default'
                                    }`}
                                  onClick={() => {
                                    const updatedValue = item.updated;

                                    const hasValidUpdate =
                                      (typeof updatedValue === 'string' &&
                                        updatedValue.trim() !== '') ||
                                      (updatedValue &&
                                        typeof updatedValue === 'object' &&
                                        Object.keys(updatedValue).length > 0);

                                    if (!hasValidUpdate) return;

                                    setSelectedUpdateData(updatedValue);
                                    setShowGeneratedData(true);
                                  }}
                                >
                                  <span className="text-white/40">
                                    Updated {i + 1}:{' '}
                                  </span>

                                  <span
                                    className={` ${hasUpdatedText ? 'underline cursor-pointer text-white/80' : 'text-white/40'}`}
                                  >
                                    {hasUpdatedText ? 'View Content' : '—'}
                                  </span>
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </li>
                    ))}
                  </ul>
                </div>

                {isEditChangesExceeded && (
                  <p className="text-sm text-red-500 mt-3">
                    Your edits have exceeded the allowed limit. Only{' '}
                    {editLimits[title?.toLowerCase()] ?? 0} edits are allowed.
                  </p>
                )}

                <div className="sticky bottom-0 bg-[#0A0A0A] pt-2">
                  <Divider />
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="md"
                      onClick={() => {
                        setEditList({});
                        setIsCollapsed(true);
                      }}
                      className="w-full text-center text-[13px] font-semibold bg-[#262626] text-[#fcfcfc]"
                    >
                      Cancel
                    </Button>

                    {Object.keys(selectedIndex).length > 0 && (
                      <Button
                        size="md"
                        onClick={handleSaveEdits}
                        className="w-full text-[13px] font-semibold bg-[#fcfcfc] text-[#1b1b1b] cursor-pointer"
                      >
                        Save
                      </Button>
                    )}

                    <Button
                      size="md"
                      onClick={() => {
                        if (isEditChangesExceeded) {
                          setShowModal(true);
                        } else {
                          handleRegenerate();
                        }
                      }}
                      disabled={Object.keys(selectedIndex).length > 0}
                      className={`w-full text-[13px] font-semibold bg-[#fcfcfc] text-[#1b1b1b]  ${Object.keys(selectedIndex).length > 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      Regenerate
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm mt-4 px-2">No edits available</p>
            )}
          </div>
        </div>
      )}

      {!isMobile && !isCollapsed && (
        <div
          style={{
            gap: '1rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            borderRight: '1px solid #262626',
            height: '100%',
          }}
        >
          <div
            style={{
              backgroundColor: '#0A0A0A',
              borderRadius: '1rem',
              padding: '0.2rem',
              width: `${panelWidth}px`,
              borderRight: '2px solid #262626',
              padding: window.innerWidth < 1280 ? '1rem' : '0.2rem',
              width: window.innerWidth < 1280 ? '80%' : `${panelWidth}px`,
              height: '85vh',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
            }}
          >
            <div className="w-full bg-[#262626] text-[#fcfcfc] 2xl:px-3 py-2 rounded-lg flex items-center justify-center gap-2">
              <PreviewIcon size={24} />
              <h2 className="font-bold text-sm">Preview Changes</h2>
            </div>

            {Object.keys(editList).length > 0 ? (
              <>
                <div className="flex-1 overflow-y-auto scrollbar-gray mt-2 pr-1">
                  <ul className="w-full space-y-2">
                    {Object.entries(editList).map(([key, value]) => {
                      return (
                        <li
                          key={key}
                          onClick={() => {
                            setEditInputDisplay(key);
                            setMessage(value);
                          }}
                          className="p-2 rounded-xl bg-[#1b1b1b] text-sm relative text-[#FCFCFC] cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={`${
                                changeIndex.includes(Number(key))
                                  ? 'text-[#EB5545]'
                                  : 'text-[#fcfcfc]'
                              } font-bold mb-2`}
                            >
                              {title} {key < 10 ? `${key}` : key}
                            </span>

                            <div
                              onClick={e => {
                                e.stopPropagation();
                                setPendingDeleteKey(key); // store key we want to delete
                                setShowConfirm(true); // open popup
                              }}
                              className="p-1 rounded-full cursor-pointer hover:bg-[#333]"
                            >
                              <CrossIcon size={16} color="white" />
                            </div>
                          </div>

                          {/* ALL prompt + updated items */}
                          {(changedWithPrompt[key] || []).map((item, i) => {
                            const hasUpdatedText =
                              typeof item.updated === 'string'
                                ? item.updated.trim() !== ''
                                : typeof item.updated === 'object' &&
                                  item.updated !== null &&
                                  Object.keys(item.updated).length > 0;

                            const isSelected =
                              selectedIndex[key]?.selectedIndex === i;

                            const handleSelect = () => {
                              if (!hasUpdatedText) return;

                              setSelectedIndex(prev => {
                                const already = prev[key]?.selectedIndex === i;
                                if (already) {
                                  const updated = { ...prev };
                                  delete updated[key];
                                  return updated;
                                }
                                return { ...prev, [key]: { selectedIndex: i } };
                              });

                              setUpdatedList(prev => {
                                const already =
                                  selectedIndex[key]?.selectedIndex === i;
                                if (already) {
                                  const newList = { ...prev };
                                  delete newList[key];
                                  return newList;
                                }
                                return { ...prev, [key]: item.updated };
                              });
                            };

                            const handleClose = indexToRemove => {
                              // Remove item from sessionStorage for this beat/key
                              const stored = sessionStorage.getItem(
                                'changed_with_prompt'
                              );
                              if (stored) {
                                const parsed = JSON.parse(stored);

                                if (parsed[key] && Array.isArray(parsed[key])) {
                                  // Remove only the specific item at index
                                  parsed[key] = parsed[key].filter(
                                    (_, idx) => idx !== indexToRemove
                                  );

                                  if (parsed[key].length === 0) {
                                    delete parsed[key]; // remove key if array is empty
                                  }

                                  if (Object.keys(parsed).length > 0) {
                                    sessionStorage.setItem(
                                      'changed_with_prompt',
                                      JSON.stringify(parsed)
                                    );
                                  } else {
                                    sessionStorage.removeItem(
                                      'changed_with_prompt'
                                    );
                                  }
                                }
                              }

                              // Remove from selectedIndex if the removed item was selected
                              setSelectedIndex(prev => {
                                if (
                                  prev[key]?.selectedIndex === indexToRemove
                                ) {
                                  const updated = { ...prev };
                                  delete updated[key];
                                  return updated;
                                }
                                return prev;
                              });

                              // Remove from updatedList only if it was selected
                              setUpdatedList(prev => {
                                const updated = { ...prev };
                                if (
                                  updated[key] &&
                                  selectedIndex[key]?.selectedIndex ===
                                    indexToRemove
                                ) {
                                  delete updated[key];
                                }
                                return updated;
                              });
                            };

                            return (
                              <div
                                key={i}
                                className="mb-3 p-2 rounded-lg bg-[#222] flex flex-col gap-1"
                              >
                                {hasUpdatedText && (
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={handleSelect}
                                      className="w-4 h-4 accent-[#E2C044] cursor-pointer"
                                    />
                                    <span className="text-xs text-white/70">
                                      Use this update
                                    </span>
                                  </label>
                                )}

                                <div className="flex items-center justify-between">
                                  <p className="text-xs text-white/70 flex-1">
                                    <span className="text-white/40">
                                      Prompt {i + 1}:{' '}
                                    </span>
                                    {item.prompt}
                                  </p>

                                  {/* Show close icon only if updated text is empty */}
                                 
                                    <IconButtonWithTooltip
                                      iconComponent={SubtractIcon}
                                      iconProps={{
                                        color: 'white',
                                        fill: 'white',
                                        size: 16,
                                      }}
                                      tooltipText={'Remove'}
                                      position="bottom"
                                      iconButton={false}
                                      onClick={() => handleClose(i)}
                                    />
                                
                                </div>

                                <p
                                  className={`text-xs text-justify text-white/70 ${
                                    hasUpdatedText
                                      ? 'cursor-pointer hover:text-white'
                                      : 'cursor-default'
                                  }`}
                                  onClick={() => {
                                    const updatedValue = item.updated;

                                    const hasValidUpdate =
                                      (typeof updatedValue === 'string' &&
                                        updatedValue.trim() !== '') ||
                                      (updatedValue &&
                                        typeof updatedValue === 'object' &&
                                        Object.keys(updatedValue).length > 0);

                                    if (!hasValidUpdate) return; 

                                    setSelectedUpdateData(updatedValue);
                                    setShowGeneratedData(true);
                                  }}
                                >
                                  <span className="text-white/40">
                                    Updated {i + 1}:{' '}
                                  </span>

                                  <span
                                    className={` ${hasUpdatedText ? 'underline cursor-pointer text-white/80' : 'text-white/40'}`}
                                  >
                                    {hasUpdatedText ? 'View Content' : '—'}
                                  </span>
                                </p>
                              </div>
                            );
                          })}
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {isEditChangesExceeded && (
                  <p className="text-sm text-red-500 mt-3">
                    Your edits have exceeded the allowed limit. Only{' '}
                    {editLimits[title?.toLowerCase()] ?? 0} edits are allowed.
                  </p>
                )}

                <div className="sticky bottom-0 bg-[#0A0A0A] pt-10">
                  <Divider />
                  <div className="flex gap-2 mt-[16px] mb-[12px]">
                    <Button
                      size="md"
                      onClick={() => {
                        setEditList({});
                        setIsCollapsed(true);
                      }}
                      className="w-full text-[13px] font-semibold bg-[#262626] text-[#fcfcfc] cursor-pointer "
                    >
                      Cancel
                    </Button>

                    {Object.keys(selectedIndex).length > 0 && (
                      <Button
                        size="md"
                        onClick={handleSaveEdits}
                        className="w-full text-[13px] font-semibold bg-[#fcfcfc] text-[#1b1b1b] cursor-pointer"
                      >
                        Save
                      </Button>
                    )}

                    <Button
                      size="md"
                      onClick={() => {
                        if (isEditChangesExceeded) {
                          setShowModal(true);
                        } else {
                          handleRegenerate();
                        }
                      }}
                      disabled={Object.keys(selectedIndex).length > 0}
                      className={`w-full text-[13px] font-semibold bg-[#fcfcfc] text-[#1b1b1b]  ${Object.keys(selectedIndex).length > 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      Regenerate
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm mt-4 px-2">No edits available</p>
            )}
          </div>
        </div>
      )}

      {showModal && <Modal title={title} onClose={() => setShowModal(false)} />}

      {showGeneratedData && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-md">
          <div className="bg-[#1B1B1B] text-sm px-6 py-5 rounded-xl shadow-pop-up shadow-shadow-pop-up min-w-[250px] max-w-[600px] max-h-[80vh] overflow-y-auto flex flex-col items-center gap-4">
            <div className="w-full flex items-center justify-between">
              <p className="text-center uppercase text-sm text-primary-gray-900 font-bold">
                Updated Data
              </p>

              <Button
                size="sm"
                onClick={() => setShowGeneratedData(false)}
                className="bg-[#262626] hover:bg-default-400 text-[#FCFCFC]  cursor-pointer px-3 py-4 rounded-full text-sm"
              >
                <img src={Close} alt="Close" className="w-5 h-5" />
              </Button>
            </div>

            {/* If string */}
            {typeof selectedUpdateData === 'string' ? (
              <p className="text-white/80 text-sm text-justify">
                {selectedUpdateData}
              </p>
            ) : (
              /* If object */
              <div className="text-white/80 text-sm w-full">
                {Object.entries(selectedUpdateData || {}) && (
                  <p  className="text-justify mb-3">
                    <span className="font-bold text-[#fcfcfc] mb-1">
                      {selectedUpdateData?.scene_int_ext}.{' '}
                      {selectedUpdateData?.location_of_the_scene} -{' '}
                        {selectedUpdateData?.time_of_the_scene}
                        <br />
                    </span>
                      <span className="font-bold text-[#fcfcfc] mb-1">
                      {selectedUpdateData?.scene_title}
                      </span>
                    <br />
                    {selectedUpdateData?.scene_synopsis}
                  
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-md">
          <div className="bg-[#1B1B1B] text-sm px-6 py-5 rounded-xl shadow-pop-up shadow-shadow-pop-up min-w-[250px] max-w-[400px] max-h-screen overflow-y-auto flex flex-col items-center justify-start gap-4">
            <p className="text-center text-sm text-primary-gray-900">
              Are you sure you want to remove this version?
            </p>

            <div className="mt-2 flex justify-center gap-4 w-full">
              <Button
                size="md"
                onClick={() => {
                  setShowConfirm(false);
                  setPendingDeleteKey(null);
                }}
                className="bg-[#262626] hover:bg-default-400 text-[#FCFCFC] cursor-pointer px-2 py-3 rounded-xl text-sm"
              >
                Cancel
              </Button>

              <Button
                size="md"
                className="px-2 py-3 rounded-xl  cursor-pointer text-sm bg-[#EB5545] text-white hover:bg-[#FF6B5C]"
                onClick={() => {
                  if (pendingDeleteKey !== null) {
                    handleRemoveEdit(pendingDeleteKey);
                  }
                  setShowConfirm(false);
                  setPendingDeleteKey(null);
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
