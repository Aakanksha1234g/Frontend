import React, { useState, useEffect } from 'react';
import { CloseIcon, MinimizeIcon, SparkIcon, MagicToolIcon } from '@shared/layout/icons';

const ANIMATION_SPEED = 500;

export default function ScreenplayAnalysisPage({
  AnalysisTypeText = 'Act Analysis',
  EstimatedTime = '20–25 minutes',
}) {
  const [grid, setGrid] = useState([
    ['colored', 'empty'],
    ['empty', 'empty'],
  ]);
  const [step, setStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  const moveSequence = [
    [0, 0],
    [0, 1],
    [1, 1],
    [1, 0],
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStep(prev => {
        const next = (prev + 1) % 8;
        const nextPos = moveSequence[next % 4];
        setGrid(prevGrid => {
          const newGrid = prevGrid.map(row => [...row]);
          const [r, c] = nextPos;
          if (next < 4) newGrid[r][c] = 'colored';
          else newGrid[r][c] = 'empty';
          return newGrid;
        });
        return next;
      });
    }, ANIMATION_SPEED);
    return () => clearInterval(interval);
  }, []);

  const getCellColor = state =>
    state === 'colored' ? 'bg-white' : 'bg-transparent';

  if (!isVisible && !isMinimized) return null;

  return (
    <>
      {/* Full Popup at Bottom-Right */}
      {isVisible && !isMinimized && (
        <div className="fixed bottom-6 right-6 z-[9999]">
          <div className="relative max-w-[380px] w-full gap-6 p-4 text-white border border-white/10 bg-[#0A0A0A] rounded-2xl shadow-2xl">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div
                className="p-2 cursor-pointer"
                onClick={() => setIsVisible(false)}
              >
                <CloseIcon className="w-6 h-6" />
              </div>
              <div
                className="p-2 cursor-pointer"
                onClick={() => {
                  setIsMinimized(true);
                  setIsVisible(false);
                }}
              >
                <MinimizeIcon className="w-6 h-6" />
              </div>
            </div>

            {/* Title */}
            <div className="bg-[#171717] flex items-center gap-2 border border-[#2a2a2a] p-3 px-9 rounded-xl">
               <MagicToolIcon color="#FCFCFC" />
              <h1 className="text-[16px] font-light text-[#fcfcfc] tracking-tight">
                Generating {AnalysisTypeText}...
              </h1>
            </div>

            {/* Description */}
            <p className="text-[#b0b0b0] text-sm leading-relaxed mt-3 text-center">
              We’re analyzing your script. This may take around {EstimatedTime} — feel free to explore
              other modules in the meantime.
            </p>

            {/* Loader */}
            <div className="flex justify-center items-center mt-5">
              <div className="relative w-10 h-10">
                <div className="grid grid-cols-2 grid-rows-2 w-full h-full">
                  {grid.map((row, r) =>
                    row.map((cell, c) => (
                      <div
                        key={`${r}-${c}`}
                        className={`transition-all duration-500 ${getCellColor(cell)}`}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Blue Loader */}
            <div className="flex justify-center mt-6">
              <div className="loader-bar"></div>
            </div>

            {/* Footer */}
            <div className="text-center text-[#b0b0b0] mt-2 text-xs">
              Refresh the page after Estimated Time: {EstimatedTime}
            </div>
          </div>
        </div>
      )}

      {/* Minimized Small Square (Restore Button) */}
      {isMinimized && (
        <div
          onClick={() => {
            setIsMinimized(false);
            setIsVisible(true);
          }}
          className="fixed bottom-6 right-6 w-14 h-14 bg-[#0A0A0A] border border-white/20 rounded-md cursor-pointer p-2 z-[9999]"
        >
          <div className="grid grid-cols-2 grid-rows-2 w-full h-full">
            {grid.map((row, r) =>
              row.map((cell, c) => (
                <div
                  key={`${r}-${c}`}
                  className={`transition-all duration-500 ${
                    cell === 'colored' ? 'bg-white' : 'bg-transparent'
                  }`}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* Loader CSS */}
      <style jsx>{`
        .loader-bar {
          height: 8px;
          width: 280px;
          background: linear-gradient(
            90deg,
            rgba(30, 49, 202, 0) 0%,
            #1e31ca 30%,
            rgba(30, 49, 202, 0.68) 60%,
            rgba(30, 49, 202, 0) 100%
          );
          background-size: 200% 100%;
          animation: shimmer 2s infinite linear reverse;
          border-radius: 2px;
        }
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </>
  );
}
