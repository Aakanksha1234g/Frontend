// SceneActionDropdown.jsx
import React, { useState, useRef, useEffect } from 'react';
import {
  ThreeDotsIcon,
  EditIcon,
  DeleteIcon,
  HistoryIcon,
  PlusIcon,
} from '@shared/layout/icons';
import IconButtonWithTooltip from '@shared/ui/IconButtonWithTooltip';

export default function SceneActionDropdown({
  onEdit,
  onDelete,
  onHistory,
  onNewScene,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <IconButtonWithTooltip
        iconComponent={ThreeDotsIcon}
        iconProps={{ color: '#FAFAFA', size: 20 }}
        tooltipText={'Actions'}
        position="bottom"
        onClick={() => setIsOpen(x => !x)}
        iconButton={false}
      />

      {isOpen && (
        <div className="absolute right-0 mt-2 min-w-[280px] bg-[#1B1B1B] rounded-2xl shadow-lg z-50 py-4 px-4 border border-[#222]">
          <div className="py-2 px-4 font-medium text-xs text-[#A3A3A3] mb-1">
            Actions
          </div>

          <button
            onClick={() => {
              onHistory?.();
              setIsOpen(false);
            }}
            className="flex items-center gap-3 w-full py-2 hover:bg-[#222] rounded-lg cursor-pointer"
          >
            <HistoryIcon className="w-5 h-5 text-[#A3A3A3]" />
            <div className="flex flex-col items-start justify-center">
              <div className="font-medium text-[14px] text-[#FCFCFC]">
                Scene History
              </div>
              <div className="text-xs text-left text-[#a6a6a6]">
                Allows you to view scene history
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              onEdit?.();
              setIsOpen(false);
            }}
            className="flex items-center gap-3 w-full py-2 hover:bg-[#222] rounded-lg cursor-pointer"
          >
            <EditIcon className="w-5 h-5 " />
            <div className="flex flex-col items-start justify-center">
              <div className="font-medium text-[14px] text-[#FCFCFC]">
                Edit Scene
              </div>
              <div className="text-xs text-left text-[#a6a6a6]">
                Allows you to edit the current scene
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              onNewScene?.();
              setIsOpen(false);
            }}
            className="flex items-center gap-3 w-full py-2 hover:bg-[#222] rounded-lg cursor-pointer"
          >
            <PlusIcon className="w-5 h-5 text-[#A3A3A3]" />
            <div className="flex flex-col items-start justify-center">
              <div className="font-medium text-[14px] text-[#FCFCFC]">
                Add Scene
              </div>
              <div className="text-xs text-left text-[#a6a6a6]">
                Allows you to add a new scene below
              </div>
            </div>
          </button>

          <div className="border-t border-[#333] my-2" />
          <div className="py-2 px-4 font-medium text-xs text-[#A3A3A3] mb-1">
            Danger zone
          </div>

          <button
            onClick={() => {
              onDelete?.();
              setIsOpen(false);
            }}
            className="flex items-center gap-3 w-full py-2 hover:bg-[#240d0d] rounded-lg cursor-pointer"
          >
            <DeleteIcon className="w-5 h-5 text-[#EB5545]" />
            <div className="flex flex-col items-start justify-center">
              <div className="font-medium text-[14px] text-[#FCFCFC]">
                Delete Scene
              </div>
              <div className="text-xs text-left text-[#a6a6a6]">
                Allows you to delete the current scene
              </div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
