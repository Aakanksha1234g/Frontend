import React, { useState, useRef, useEffect } from 'react';
import Button from '@shared/ui/button';
import { ThreeDotsIcon, EditIcon, DeleteIcon } from '@shared/layout/icons';
import IconButtonWithTooltip from '@shared/ui/IconButtonWithTooltip';



export default function ProjectFileDropDown({ onEditRequest, onDelete, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleEdit = () => {
    if (typeof onEditRequest === 'function') onEditRequest();
    setIsOpen(false);
  };

  const handleDeleteClick = () => {
    setShowConfirm(true); // open the custom modal
    setIsOpen(false);
  };

  return (
    <div className={`${className}`} ref={dropdownRef}>
      <IconButtonWithTooltip
        iconComponent={ThreeDotsIcon}
        iconProps={{ color: '#FAFAFA', size: 22 }}
        tooltipText={'Actions'}
        position="bottom"
        iconButton={false}
        onClick={() => setIsOpen(x => !x)}
      />

      {/* <Button
        size="sm"
        onClick={() => setIsOpen(x => !x)}
        className="p-2 rounded-md focus:outline-none bg-transparent hover:bg-[#202020/20]"
      >
        <ThreeDotsIcon />
      </Button> */}

      {isOpen && (
        <div className="absolute right-0 mt-2 min-w-[300px] bg-[#1B1B1B] rounded-[16px] shadow-xl z-50 py-6 px-7 text-left border border-[#222] select-none">
          <div>
            <div className="py-2 px-4 font-medium text-xs text-[#A3A3A3] mb-1">
              Actions
            </div>
            <button
              className="flex items-center gap-4 py-2 mb-1 w-full hover:bg-[#222] rounded-xl cursor-pointer"
              onClick={handleEdit}
            >
              <EditIcon className="w-6 h-6 text-[#A3A3A3]" />
              <div className="flex flex-col items-start justify-center">
                <div className="font-medium text-[14px] text-[#FCFCFC]">
                  Edit file name
                </div>
                <div className="text-xs text-left text-[#a6a6a6]">
                  Allows you to edit the file name
                </div>
              </div>
            </button>
          </div>

          <div className="border-t border-[#292929] mt-1 mb-1"></div>

          <div>
            <div className="py-2 px-4 font-medium text-xs text-[#A3A3A3] mb-1">
              Danger zone
            </div>
            <button
              className="flex items-center gap-4 py-2 mb-2 w-full hover:bg-[#240d0d] rounded-xl cursor-pointer"
              onClick={handleDeleteClick}
            >
              <DeleteIcon className="w-6 h-6 text-[#EB5545]" />
              <div className="flex flex-col items-start justify-center">
                <div className="font-medium text-[14px] text-[#EB5545]">
                  Delete file
                </div>
                <div className="text-xs text-left text-[#EE9898] mt-0.5">
                  Permanently delete the file
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={onDelete}
        title="Delete File"
        message="Are you sure you want to delete this file? This action cannot be undone."
      />
    </div>
  );
}






function ConfirmModal({ isOpen, onClose, onConfirm, title, message }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-md">
      <div className="bg-[#1B1B1B] text-sm px-6 py-5 rounded-xl shadow-pop-up shadow-shadow-pop-up min-w-[250px] max-w-[400px] max-h-screen overflow-y-auto flex flex-col items-center justify-start gap-4">
        <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
        <p className="text-[#A3A3A3] text-sm mb-4">{message}</p>
        <div className="flex justify-end gap-3">
          <Button
            size="md"
            className="bg-[#262626] hover:bg-default-400 text-[#FCFCFC] cursor-pointer px-2 py-3 rounded-xl  text-sm"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            size="md"
            className="px-2 py-3 rounded-xl  cursor-pointer text-sm bg-[#EB5545] text-white hover:bg-[#FF6B5C]"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
