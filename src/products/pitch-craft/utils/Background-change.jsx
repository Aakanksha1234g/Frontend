import { useState } from 'react';
import ColorPicker from './color-picker';
import { useCanvasBackground } from '@products/pitch-craft/hooks/useCanvasBackground';

export default function BackgroundChange({
  setBackgroundColor,
  removeBackgroundColor,
  isOpen,
  setIsOpen,
}) {
  const [colorValue, setColorValue] = useState('#ffffff');
  const { 
      setBackgroundImageFromFile,
      removeBackgroundImage,
    } = useCanvasBackground();

  const handleColorChange = newColor => {
    setColorValue(newColor);
    setBackgroundColor(newColor);
  };

  const handleFileUpload = e => {
    const file = e.target.files[0];
    if (file) {
      setBackgroundImageFromFile(file);
    }
  };

  return (
    isOpen && (
      <div className="fixed z-50 bg-white rounded-md w-[500px] p-4 left-[459.5px] top-[184.5px] opacity-100">
        {/* Modal Title */}
        <div className="flex justify-between items-center pb-2">
          <h2 className="text-lg font-semibold">Background</h2>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Close"
            className="text-gray-500 cursor-pointer hover:text-red-600 focus:outline-none"
          >
            ✕
          </button>
        </div>

        {/* Modal Content */}
        <div className="space-y-4 py-4">
          {/* Color Picker */}
          <div className="flex items-center justify-between">
            <label htmlFor="bg-color" className="text-sm font-medium">
              Colour
            </label>
            <ColorPicker
              color={colorValue}
              setColor={handleColorChange}
              specialLetter={''}
              imageSrc={''}
              isTransparent={true}
              removeBackgroundColor={removeBackgroundColor}
            />
          </div>

          {/* File upload */}
          <div className="flex justify-between items-center w-full">
            <label className="block text-sm font-medium mb-1 w-1/2">
              Upload Image
            </label>
            <div className="relative inline-block">
              <span className="border border-gray-300 px-3 py-1 rounded bg-white cursor-pointer">
                Choose Image
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
            </div>
          </div>

          {/* Reset buttons */}
          <div className="flex justify-between gap-2">
            Reset
            <button
              onClick={removeBackgroundImage}
              className="border boerder-gray-300 px-3 py-1 rounded cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    )
  );
}
