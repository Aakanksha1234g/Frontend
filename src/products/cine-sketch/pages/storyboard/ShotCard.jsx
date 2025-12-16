import { useState } from 'react';
import SparkleIcon from '@assets/pitch-craft/SparkleIcon.svg?react';
import RegenerateModal from './RegenerateModal';

/**
 * ShotCard
 *
 * Renders a single storyboard shot in either "card" or "grid" layout.
 * Allows users to preview the shot image and regenerate it via a modal.
 *
 * @param {Object} props
 * @param {Object} props.shot - The shot data object containing image and description.
 * @param {number} props.shotNumber - The position of the shot in the sequence.
 * @param {function} props.onUpdate - Callback triggered after regenerating the shot.
 * @param {string} [props.viewMode=VIEW_MODES.CARD] - Display layout mode ('card' or 'grid').
 */
export default function ShotCard({ shot, shotNumber, onUpdate }) {
  /** Stores the image source, derived from base64-encoded data */
  const [imgSrc, setImgSrc] = useState(
    `data:image/png;base64,${shot.shot_image}`
  );

  /** Controls the visibility of the regenerate modal */
  const [showModal, setShowModal] = useState(false);

  /** Disables the button while regeneration is in progress */
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Card view mode
  return (
    <div className="bg-[#171717] rounded-lg overflow-hidden transition-all duration-300">
      <div className="p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Image Preview */}
          <div className="flex-shrink-0 w-full lg:w-2/5">
            <div className="aspect-video bg-gradient-to-br rounded-lg overflow-hidden group relative">
              <img
                src={imgSrc}
                alt="Shot preview"
                className="w-full h-full shadow-[-6.09px_9.74px_7.3px_0px_#00000040] object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute right-3 bottom-3 flex gap-3 mt-6 pt-4">
                <button
                  onClick={() => setShowModal(true)}
                  disabled={isRegenerating}
                  className="flex items-center gap-1.5 cursor-pointer bg-[#000000] hover:bg-[#000000A0] disabled:bg-[#00000060] text-white px-3 py-1.5 rounded-lg font-medium text-sm transition-colors duration-200"
                >
                  <SparkleIcon className="w-4 h-4" />
                  {isRegenerating ? 'Regenerating...' : 'Regenerate'}
                </button>
              </div>
            </div>
          </div>

          {/* Details & Actions */}
          <div className="flex flex-col justify-between w-full lg:w-3/5">
            <div className="space-y-4">
              <div>
                <p className="text-[#999999] text-sm leading-relaxed">
                  {shot.shot_description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Regenerate Modal */}
      {showModal && (
        <RegenerateModal
          shot={shot}
          setImgSrc={setImgSrc}
          onClose={() => setShowModal(false)}
          onUpdate={onUpdate}
        />
      )}
    </div>
  );
}
