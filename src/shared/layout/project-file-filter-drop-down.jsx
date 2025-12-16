import React, { useState, useRef, useEffect } from 'react';
import Button from '@shared/ui/button';
import { StatusCircle, SortIcon } from '@shared/layout/icons';

export default function FilterDropDown({
  buttonSize = 'md',
  statusFilter = 'All',
  onStatusFilterChange = () => {},
  showSGFilter = false,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const progressStatusFilter = {
    'Progress Status': showSGFilter
      ? ['All', 'Saved', 'Generated'] // if showSGFilter is true
      : ['All', 'Saved', 'Analyzed'], // if false
    colors: ['#ffffff', '#175CD3', '#4ADE80'],
  };

  // Outside click handler to close dropdown
  useEffect(() => {
    const handler = e => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleSelect = val => {
    onStatusFilterChange(val);
    setOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <Button
        onClick={() => setOpen(o => !o)}
        size={buttonSize}
        className="bg-[#262626] text-[#FAFAFA] flex items-center gap-2 cursor-pointer"
      >
        Filter
        <SortIcon color="#fafafa" />
      </Button>

      {open && (
        <div className="origin-top-right absolute left-0 mt-2 w-56 shadow-lg pl-4 py-4 bg-[#1B1B1B] rounded-[16px] z-50">
          <div className="py-2 px-4 font-medium text-xs text-[#A3A3A3]">
            Progress Status
          </div>
          <div>
            {progressStatusFilter['Progress Status'].map((opt, idx) => (
              <button
                key={opt}
                onClick={() => handleSelect(opt)}
                className="flex items-center w-full text-left px-4 py-2 gap-2 text-sm text-[#FCFCFC] hover:bg-[#262626] cursor-pointer"
              >
                <StatusCircle color={progressStatusFilter.colors[idx]} />
                <span>{opt}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
