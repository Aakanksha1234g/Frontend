import { useState } from 'react';
import { apiRequest } from '@shared/utils/api-client';
import SparkleIcon from '@assets/pitch-craft/SparkleIcon.svg?react';
import CloseIcon from '@assets/pitch-craft/CloseIcon.svg?react';

/**
 * RegenerateModal
 *
 * A modal for editing and regenerating a storyboard shot based on a visual prompt.
 * Sends an API request to regenerate the shot and updates the parent state on success.
 *
 * @param {Object} props
 * @param {Object} props.shot - The shot object to regenerate.
 * @param {function} props.setImgSrc - Setter to update the shot's image preview.
 * @param {function} props.onClose - Callback to close the modal.
 * @param {function} props.onUpdate - Callback to update the shot in the parent component.
 */
const RegenerateModal = ({ shot, setImgSrc, onClose, onUpdate }) => {
  const [editedPrompt, setEditedPrompt] = useState(
    shot.shot_visual_prompt
      .replace(/\s*\n\s*/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  );

  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handles the regenerate action.
   * Calls the API and updates the image and parent state on success.
   */
  const handleRegenerate = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest({
        endpoint: '/regenerate_shot',
        method: 'POST',
        body: {
          shot_id: shot.shot_id,
          shot_visual_prompt: editedPrompt,
          shot_parameters: { camera_angle: 'establishing' },
        },
        successMessage: 'Shot regenerated successfully',
      });

      setImgSrc(`data:image/png;base64,${response.response.shot_image}`);
      onUpdate(shot.shot_id, {
        shot_visual_prompt: response.response.shot_visual_prompt,
        shot_type: 'establishing',
      });
      onClose();
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.7)] flex items-center justify-center">
      <div className="bg-[#0A0A0A] m-4 p-6 rounded-lg w-full max-w-md relative flex flex-col gap-2">
        <button
          onClick={onClose}
          className="bg-transparent self-end px-3 py-1 rounded-md text-sm hover:bg-white/10 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          disabled={isLoading}
        >
          <CloseIcon className="w-5 h-5" />
        </button>
        <div className="aspect-video bg-gradient-to-br h-56 rounded-lg overflow-hidden group relative">
          <img
            src={`data:image/png;base64,${shot.shot_image}`}
            alt="Shot preview"
            className="w-full h-full shadow-[-6.09px_9.74px_7.3px_0px_#00000040] rounded-lg object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Textarea */}
        <div >
          <textarea
          value={editedPrompt}
          onChange={e => setEditedPrompt(e.target.value)}
          rows={8}
          wrap="soft"
          className="w-full border border-[#323232] rounded-md p-3 text-sm resize-none outline-none bg-[#262626] text-[#999999] placeholder-gray-400 whitespace-pre-wrap break-words"
        />
        </div>

        {/* Buttons */}
        <button
          onClick={handleRegenerate}
          className="flex justify-center items-center gap-2 bg-[#171717] text-white border border-white/30 px-4 py-2 rounded-md text-sm font-medium hover:bg-[#222] transition disabled:opacity-50 disabled:cursor-not-allowed text-center"
          disabled={isLoading}
        >
          <SparkleIcon className="w-4 h-4 text-white-300" />
          {isLoading ? 'Regenerating...' : 'Regenerate'}
        </button>
      </div>
    </div>
  );
};

export default RegenerateModal;
