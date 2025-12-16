import { useState, useEffect } from 'react';
import { useCanvas } from '@products/pitch-craft/contexts/CanvasContext';
import SendIcon from "@assets/pitch-craft/SendIcon.svg?react";
import Button from '@ui/Button';

export default function Regenerate({ onClick, className = "" }) {
  const { slides, currentSlide } = useCanvas();
  const current = slides[currentSlide];
  const [prompt, setPrompt] = useState(current?.visual_prompt || '');

  // Extract image src
  let imageSrc = null;
  try {
    if (current?.state) {
      const parsed = JSON.parse(current.state);
      const imgObj = parsed.objects?.find(obj => obj.type === 'image');
      imageSrc =
        imgObj?.src || imgObj?.dataURL || imgObj?._element?.src || null;
    }
  } catch (err) {
    console.error('Error extracting image from slide JSON', err);
  }

  useEffect(() => {
    setPrompt(current?.visual_prompt || '');
  }, [currentSlide, slides]);

  // Animation
  const [isAnimating, setIsAnimating] = useState(false);

  const handleRegenerate = async () => {
    try {
      setIsAnimating(true);
      if (onClick) {
        await onClick(prompt);
      }
    } catch (err) {
      console.error('Regenerate failed:', err);
    } finally {
      setIsAnimating(false);
    }
  };

  return (
    <div
      className={`flex gap-2 relative bg-light-accent-soft_hover dark:bg-dark-default-main p-2 rounded-md items-stretch pb-3 ${className}`}
    >
      {/* Thumbnail Button */}
      <div
        className="relative flex items-center justify-center rounded cursor-pointer flex-shrink-0 w-auto"
      >
        <div
          className={`relative rounded-lg overflow-hidden w-full h-full ${isAnimating ? 'gradient-border p-1' : ''
            }`}
        >
          {imageSrc ? (
            <img
              src={imageSrc}
              alt="Regenerate Thumbnail"
              className={`w-full h-full object-cover rounded `}
            />
          ) : (
            <div
              className="w-full h-full rounded"
              style={{ animationDuration: '5s' }}
            />
          )}

        </div>
      </div>

      {/* Prompt Textarea */}
      <div className='flex justify-between w-full overflow-hidden'>
        <textarea
          className={`flex-1 px-2 py-1 text-xs dark:text-[#A8A8A8] text-black overflow-y-auto ${localStorage.getItem("theme") === "dark" ? "scrollbar-black": "scrollbar-custom"} rounded outline-none resize-none min-h-[80px]`}
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="Enter visual prompt..."
        />
      </div>

      <Button
        variant="secondary"
        className='absolute bottom-2 right-1 rounded-md dark:bg-dark-accent-hover bg-light-accent-hover p-2 justify-center'
        onClick={handleRegenerate}
        title="Regenerate"
      >
        <SendIcon className="w-4 h-4 dark:fill-[#737373] fill-light-accent-hover" />
      </Button>
    </div>
  );
}
