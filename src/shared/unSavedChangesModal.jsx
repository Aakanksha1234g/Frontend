import React from 'react';
import Button from './ui/button';

// This modal is for handling unsaved changes when navigating away from a page.
// It will appear when the user tries to leave a page that has unsaved changes.
// React Router's useBlocker is used to block navigation and trigger this modal.

// Steps to integrate:
// Step 1: Send the blocker object to this modal.
// import useBlocker from "react-router"
// const blocker = useBlocker();

// Step 2: Handle "Don't Save", "Cancel", and "Save" actions inside the modal (Save is provided from the parent).
// Step 3: Also send setUnsavedChanges from the parent to manage modal state and navigation state cleanup (setUnsaveChanges must have hasChanges, nextLocation, and isModalOpen props).

const UnsavedChangesModal = ({
  isOpen,
  blocker,
  onSave, // parent-provided save function (custom per page)
}) => {
  if (!isOpen) return null; // Don't render modal if not open

  // Handle "Don't Save": proceed with navigation and reset modal state
  const handleProceedAnyway = () => {
    if (blocker?.state === 'blocked') {
      blocker.proceed(); // Allow the blocked navigation to continue
      // blocker.reset(); // Release the blocker to allow future navigation attempts
    }
  };

  // Handle "Cancel": user wants to stay on the current page
  // Just close the modal and reset the blocker
  const handleCancel = () => {
    if (blocker?.state === 'blocked') {
      blocker.reset(); // Release the blocker to allow future navigation attempts
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-md">
      <div className="bg-[#1B1B1B] text-sm px-6 py-5 rounded-xl shadow-pop-up shadow-shadow-pop-up min-w-[250px] max-w-[400px] max-h-screen overflow-y-auto flex flex-col items-center justify-start gap-4">
        <p className="text-center text-sm text-primary-gray-900">
          You have unsaved changes.
        </p>
        <div className="mt-2 flex justify-center gap-4 w-full">
          <Button
            size="md"
            onClick={handleCancel}
            className="bg-[#262626] hover:bg-default-400 text-[#FCFCFC] cursor-pointer px-2 py-3 rounded-xl  text-sm"
          >
            Cancel
          </Button>

          <Button
            size="md"
            onClick={handleProceedAnyway}
            className="bg-white hover:bg-white/50 text-[#1b1b1b] cursor-pointer px-2 py-3 rounded-xl  text-sm"
          >
            Proceed Anyway
          </Button>
          {onSave && (
            <Button
              size="md"
              onClick={
                () => {
                  onSave()
                    .then(() => blocker.proceed())
                    .catch(e => blocker.reset());
                } // Allow the blocked navigation to continue after saving
              }
              className="bg-[#175CD3] hover:bg-[#175CD3]/80 cursor-pointer px-2 py-3 rounded-xl text-[#FCFCFC] text-sm"
            >
              Save
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UnsavedChangesModal;
