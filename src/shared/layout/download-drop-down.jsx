import React, { useState, useRef, useEffect } from 'react';
import { DownloadIcon } from './icons';

const DownloadDropdown = ({ DocButton, PdfButton }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = e => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      {/* Main Download Icon */}
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-md hover:bg-[#222] cursor-pointer transition-colors duration-200"
      >
        <DownloadIcon color="#fff" />
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div
          className="
            absolute right-0 mt-2 min-w-[100px]
            bg-[#161616] border border-[#2e2e2e] 
            rounded-xl shadow-[0_4px_18px_rgba(0,0,0,0.40)]
            backdrop-blur-sm z-50
            animate-fadeIn
          "
        >
          <div className="flex flex-col divide-y divide-white/10">
            {/* PDF Button Container */}
            <div className="w-full px-3 py-2 hover:bg-white/5 rounded-t-xl transition-colors duration-150">
              <div className="w-full flex justify-center">{PdfButton}</div>
            </div>

            {/* DOCX Button Container */}
            <div className="w-full px-3 py-2 hover:bg-white/5 rounded-b-xl transition-colors duration-150">
              <div className="w-full flex justify-center">{DocButton}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DownloadDropdown;
