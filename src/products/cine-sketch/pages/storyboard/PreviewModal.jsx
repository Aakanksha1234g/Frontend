import CloseIcon from '@assets/pitch-craft/CloseIcon.svg?react';

export default function PreviewModal({
  shots,
  currentIndex,
  setCurrentIndex,
  onClose,
}) {
  const currentShot = shots[currentIndex];

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm">
      <div className="flex items-center justify-center h-full p-4">
        <div className="relative w-full max-w-4xl">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-black/60 hover:bg-black/80 rounded-full text-white transition-all duration-200 hover:scale-105 cursor-pointer"
            aria-label="Close reel viewer"
          >
            <CloseIcon className="w-5 h-5" />
          </button>

          {/* Image Display */}
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            <img
              src={
                currentShot?.shot_image
                  ? `data:image/png;base64,${currentShot.shot_image}`
                  : '/placeholder.svg'
              }
              alt={`Shot ${currentIndex + 1}`}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Controls */}
          <div className="mt-6 text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              <button
                onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors duration-200"
              >
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
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              <span className="text-white font-medium">
                {currentIndex + 1} / {shots.length}
              </span>

              <button
                onClick={() =>
                  setCurrentIndex(Math.min(shots.length - 1, currentIndex + 1))
                }
                disabled={currentIndex === shots.length - 1}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors duration-200"
              >
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
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>

            {/* Progress Indicators */}
            <div className="flex justify-center gap-2">
              {shots.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                    index === currentIndex ? 'bg-white' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
