import { useState } from 'react';

export default function Tooltip({ text, children, position = 'top' }) {
  const [visible, setVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };



  return (
    <div className="relative flex items-center ">
      <div
        className="relative "
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
      >
        {children}
        {visible && (
          <div
            className={`w-[200px] absolute z-50 px-4 py-2 text-xs text-primary-gray-600 bg-primary-indigo-50 rounded-sm shadow-lg shadow-shadow-chat-button transition-opacity duration-200 ${positionClasses[position]}`}
          >
            {text}
            {/* Tooltip Arrow */}
            <div
              className={`absolute w-2 h-2 rotate-45 bg-primary-indigo-50 ${
                position === 'top'
                  ? 'left-1/2 -translate-x-1/2 top-full '
                  : position === 'bottom'
                    ? 'left-1/2 -translate-x-1/2 bottom-full'
                    : position === 'left'
                      ? 'top-1/2 -translate-y-1/2 left-full'
                      : 'top-1/2 -translate-y-1/2 right-full'
              }`}
            />
          </div>
        )}
      </div>
    </div>
  );
}
