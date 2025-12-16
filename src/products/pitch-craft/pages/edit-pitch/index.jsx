import CanvasProvider, {
  useCanvas,
} from '@products/pitch-craft/contexts/CanvasContext';
import { ThemeProvider } from '@products/pitch-craft/contexts/ThemeContext';
import CanvasArea from './CanvasArea';
import Regenerate from './Regenerate';
import SlideControls from './controls/SlideControls';
import Toolsbar from './Toolsbar';
import Controls from './Controls';
import { useContextMenu } from '@products/pitch-craft/hooks/useContextMenu';
import ContextMenu from './controls/ContextMenu';
import { useKeyboardShortcuts } from '@products/pitch-craft/hooks/useKeyboardShortcuts';
import { apiRequest } from '@shared/utils/api-client';
import readBase64Image from '@shared/utils/image-formater';
import { useEffect, useState } from 'react';
import { useSaveSlides } from '@products/pitch-craft/hooks/useSaveSlides';
import { useBlocker } from 'react-router';
import { useApplyTemplates } from '@products/pitch-craft/contexts/TemplatesContext';
import Button from '@ui/Button';

export default function PitchEditor() {
  const screenWidth = window.innerWidth;

  // Block mobile devices (< 540px width)
  if (screenWidth < 540) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-black text-white px-6 text-center">
        <h1 className="text-2xl font-semibold mb-4">PitchCraft is not available on mobile yet</h1>
        <p className="text-gray-400 max-w-sm">
          Please use a tablet or desktop device with a larger screen to access the editor.
        </p>
      </div>
    );
  }

  function SaveModal({ isOpen, onSave, onDiscard, onCancel }) {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <div className="dark:bg-[#1a1a1a] bg-white border border-[#2a2a2a] rounded-lg shadow-2xl w-full max-w-md mx-4 p-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-semibold dark:text-white text-black">Save Changes?</h2>
              <p className="text-gray-800 dark:text-gray-400 text-sm">
                You have unsaved changes. Would you like to save them before
                leaving?
              </p>
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <button
                onClick={onSave}
                className="w-full cursor-pointer px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
              >
                Save Changes
              </button>
              <button
                onClick={onDiscard}
                className="w-full cursor-pointer px-4 py-2.5 bg-red-600/10 hover:bg-red-600/20 text-red-500 rounded-md font-medium transition-colors"
              >
                Discard Changes
              </button>
              <Button
                onClick={onCancel}
                className="w-full cursor-pointer px-4 py-2.5 dark:text-gray-300 text-black text-center justify-center rounded-md font-medium transition-colors"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function KeyboardShortcutsWrapper() {
    const { contextMenu, setContextMenu } = useContextMenu();
    const { slides, currentSlide, setSlides, canvasDimensions, showRegenerate } =
      useCanvas();
    const { saveSlides } = useSaveSlides();
    const [showModal, setShowModal] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    console.log(useApplyTemplates().templateId);

    // Enable global shortcuts
    useKeyboardShortcuts();

    // Block navigation when there are unsaved changes
    const blocker = useBlocker(
      ({ currentLocation, nextLocation }) =>
        hasUnsavedChanges && currentLocation.pathname !== nextLocation.pathname
    );

    // Track changes to slides
    useEffect(() => {
      setHasUnsavedChanges(true);
    }, [slides]);

    // Handle blocker state changes
    useEffect(() => {
      if (blocker.state === 'blocked') {
        setShowModal(true);
      }
    }, [blocker.state]);

    const handleSave = async () => {
      try {
        await saveSlides?.();
        setHasUnsavedChanges(false);
        setShowModal(false);
        blocker.proceed?.();
      } catch (err) {
        console.error('Save failed:', err);
      }
    };

    const handleDiscard = () => {
      setHasUnsavedChanges(false);
      setShowModal(false);
      blocker.proceed?.();
    };

    const handleCancel = () => {
      setShowModal(false);
      blocker.reset?.();
    };

    const regenerateSlide = async prompt => {
      try {
        const current = slides[currentSlide];
        if (!current) return;
        console.log('Regenerating current:', current);

        const res = await apiRequest({
          baseURL: import.meta.env.VITE_API_BASE_URL,
          endpoint: '/regenerate_pitch_slide',
          method: 'POST',
          body: {
            slide_id: current.slide_id,
            slide_visual_prompt: prompt,
          },
          successMessage: 'Slide regenerated successfully!',
        });

        const updatedSlide = await res.response;
        console.log('Regenerated slide (API response):', updatedSlide);
        let currentStateJson;
        try {
          currentStateJson = JSON.parse(current.state);
        } catch (parseErr) {
          console.error('Problematic JSON string:', current.state);
          return;
        }

        if (Array.isArray(currentStateJson.objects)) {
          currentStateJson.objects = currentStateJson.objects.map(obj => {
            if (obj.type === 'image') {
              console.log('Updating image src...');
              return { ...obj, src: readBase64Image(updatedSlide.slide_image) };
            }
            return obj;
          });
        } else {
          console.warn('No objects array found in current.state');
        }

        // Rebuild updated JSON string
        const updatedStateStr = JSON.stringify(currentStateJson);

        setSlides(prev =>
          prev.map((s, i) =>
            i === currentSlide
              ? {
                ...s,
                visual_prompt: updatedSlide.slide_visual_prompt,
                state: updatedStateStr,
              }
              : s
          )
        );

        console.log('Regenerated slide updated successfully:', updatedSlide);
      } catch (err) {
        console.error('Regeneration failed:', err);
      }
    };

    // Handle browser refresh/close
    useEffect(() => {
      const handleBeforeUnload = e => {
        if (hasUnsavedChanges) {
          const message = 'You have unsaved changes. Save before leaving?';
          e.preventDefault();
          e.returnValue = message;
          return message;
        }
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }, [hasUnsavedChanges]);

    return (
      <>
        <SaveModal
          isOpen={showModal}
          onSave={handleSave}
          onDiscard={handleDiscard}
          onCancel={handleCancel}
        />

        <div className="h-screen flex flex-col bg-light-accent-soft_hover dark:bg-black overflow-hidden">
          {/* Top Controls - Fixed height */}
          <div className="shrink-0">
            <Controls />
          </div>

          {/* Main Content Area */}
          <div className="flex flex-1 gap-4 p-4 min-h-0 overflow-hidden">
            {/* Left Sidebar - Responsive width */}
            <div className="max-w-[200px] flex-shrink-0">
              <div className="h-full overflow-y-auto scrollbar-dark">
                <SlideControls />
              </div>
            </div>

            {/* Center Content Area */}
            <div className={`flex-1 flex flex-col gap-2 min-w-0 max-h-full items-center justify-center dotted-grid`}
            >
              {/* Canvas Area - Takes most of the space with proper padding */}
              {contextMenu && (
                <ContextMenu
                  {...contextMenu}
                  onClose={() => setContextMenu(null)}
                />
              )}
              <Toolsbar />
              <div className="flex-1 flex items-center justify-center min-h-0 overflow-hidden py-2 w-full max-w-6xl">
                <CanvasArea className="w-[90%] h-full" />
              </div>

              {/* Regenerate Controls - Fixed height at bottom */}
              {slides[currentSlide]?.slide_type !== 'cast' && showRegenerate && (
                <div className="flex-shrink-0 h-24 w-full max-w-6xl flex justify-center mb-2">
                  <Regenerate
                    onClick={regenerateSlide}
                    className="w-[90%] h-full"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <ThemeProvider>
      <CanvasProvider>
        <KeyboardShortcutsWrapper />
      </CanvasProvider>
    </ThemeProvider>
  );
}
