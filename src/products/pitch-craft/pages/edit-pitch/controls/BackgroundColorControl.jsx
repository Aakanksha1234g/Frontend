import React, { useState } from 'react';
import { useCanvasBackgroundColor } from '@products/pitch-craft/hooks/useCanvasBackground';
import BackgroundChange from '@products/pitch-craft/utils/Background-change';

// Background Color Control Component
export default function BackgroundColorControl() {
  const { setBackgroundColor, getBackgroundColor, removeBackgroundColor } =
    useCanvasBackgroundColor();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex items-center gap-4">
      <button className="cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        Background
      </button>
      <BackgroundChange
        setBackgroundColor={setBackgroundColor}
        getBackgroundColor={getBackgroundColor}
        removeBackgroundColor={removeBackgroundColor}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      ></BackgroundChange>
    </div>
  );
}
