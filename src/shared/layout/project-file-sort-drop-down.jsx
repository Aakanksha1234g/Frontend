import React, { useState, useEffect, useRef } from 'react';
import Button from '@shared/ui/button';
import { SortIcon, StatusCircle, TickIcon } from '@shared/layout/icons';
import { on } from 'events';







const SortDropdown = ({
  buttonSize = 'md',
  selectedSortOrder = 'Alphabetical',
  onSortOrderChange = () => { },
  alphabeticalOrder = true,
  onAlphabeticalOrderChange = () => { },
  dateOrder = true,
  onDateOrderChange = () => { },
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [sortBy, setSortBy] = useState('Date Created');
  const [order, setOrder] = useState('Newest First');
  const dropdownRef = useRef(null);

  const orderOptions = {
    Alphabetical: ['A-Z', 'Z-A'],
    'Date Created': ['Oldest First', 'Newest First'],
  };

  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync local state with props when sortBy changes
  useEffect(() => {
    if (sortBy === 'Alphabetical') {
      setOrder(alphabeticalOrder ? 'A-Z' : 'Z-A');
    } else {
      setOrder(dateOrder ? 'Oldest First' : 'Newest First');
    }
  }, [sortBy, alphabeticalOrder, dateOrder]);

  const handleSelectSortBy = key => {
    setSortBy(key);
    const defaultOrder = orderOptions[key][0];
    setOrder(defaultOrder);
    if (key === 'Alphabetical') {
      onSortOrderChange("Alphabetical");
      onAlphabeticalOrderChange(true);
    } else {
      onSortOrderChange("Date");
      onDateOrderChange(true);
    }
  };

  const handleSelectOrder = opt => {
    setOrder(opt);
    if (sortBy === 'Alphabetical') {
      onAlphabeticalOrderChange(opt === 'A-Z');
    } else {
      onDateOrderChange(opt === 'Oldest First');
    }
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size={buttonSize}
        className={` bg-[#262626] text-[#FAFAFA]  flex items-center gap-2 cursor-pointer`}
      >
        Sort
        <SortIcon color="#fafafa" />
      </Button>
      {isOpen && (
        <div className="absolute mt-1 w-56 pl-4 py-4 bg-[#1B1B1B] rounded-[16px] shadow-lg z-10 ">
          <div className="mb-2 font-medium text-xs text-[#A3A3A3]">Sort by</div>
          {Object.keys(orderOptions).map(key => (
            <div
              key={key}
              onClick={() => handleSelectSortBy(key)}
              className="flex text-sm text-[#FCFCFC] items-center cursor-pointer px-3 py-1.5 rounded-md hover:bg-[#262626]"
            >
              <div className="w-4 flex justify-center">
                {sortBy === key && <TickIcon color="#A3A3A3"/>}
              </div>
              <span className="ml-2 text-white">{key}</span>
            </div>
          ))}

          <div className="mt-4 mb-2 font-medium text-xs text-[#A3A3A3]">
            Order
          </div>
          {orderOptions[sortBy].map(opt => (
            <div
              key={opt}
              onClick={() => handleSelectOrder(opt)}
              className={`flex text-sm text-[#FCFCFC] items-center cursor-pointer px-3 py-1.5 rounded-md hover:bg-[#262626] `}
            >
              <div className="w-4 flex justify-center">
              {order === opt && <StatusCircle color="#A3A3A3" />}
              </div>
              <span className="ml-2 text-white">{opt}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SortDropdown;
