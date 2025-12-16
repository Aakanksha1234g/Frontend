import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import searchIcon from '@assets/icons/SearchIcon.svg';
import FilterIcon from '@assets/icons/Filter.svg';

const SceneFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // This ref will now wrap BOTH the button and the dropdown menu
  const dropdownRef = useRef(null);

  // Get selected relevances
  const selectedRelevances = searchParams.getAll('relevance_to_story_synopsis') || [];
  const activeFilterCount = selectedRelevances.length;

  // Handle search
  const handleSearch = () => {
    const params = new URLSearchParams(searchParams);
    if (searchQuery.trim()) {
      params.set('search', searchQuery.trim());
    } else {
      params.delete('search');
    }
    setSearchParams(params);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Handle relevance toggle
  const handleRelevanceToggle = (value) => {
    const params = new URLSearchParams(searchParams);
    const current = params.getAll('relevance_to_story_synopsis');

    if (current.includes(value)) {
      const updated = current.filter((v) => v !== value);
      params.delete('relevance_to_story_synopsis');
      updated.forEach((v) => params.append('relevance_to_story_synopsis', v));
    } else {
      params.append('relevance_to_story_synopsis', value);
    }

    setSearchParams(params);
  };

  const relevanceOptions = [
    { value: 'strong', label: 'High', color: 'text-green-500' },
    { value: 'moderate', label: 'Moderate', color: 'text-orange-500' },
    { value: 'low', label: 'Low', color: 'text-red-500' },
  ];

  return (
    <div className="mb-2 space-y-2 text-[#FCFCFC]">
      {/* Search Bar */}
      <div className="gap-2 bg-[#171717] border border-[#222222] flex items-center rounded-2xl px-2 py-1">
        <img src={searchIcon} alt="Search" className="w-4 h-4 flex-shrink-0" />

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyUp={handleKeyPress}
          placeholder="Search Scenes..."
          title="Search for scenes by name or content"
          className="flex-1 min-w-0 px-3 py-2 text-sm text-[#A3A3A3] bg-transparent border-none outline-none focus:outline-none"
          style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}
        />

        {/* === WRAP BOTH BUTTON AND DROPDOWN IN THE REF === */}
        <div className="relative" ref={dropdownRef}>
          {/* Filter Button */}
          <button
            type="button"
            onClick={toggleDropdown}
            className={`relative flex items-center justify-center p-1 rounded-lg transition-all group ${
              isDropdownOpen ? 'bg-white/10' : 'hover:bg-white/10'
            }`}
            title="Filter by relevance"
          >
            <img src={FilterIcon} alt="Filter" className="w-5 h-5" />
            {activeFilterCount > 0 && (
              <span
                className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 text-xs font-bold text-[#FCFCFC] bg-[#EB5545] rounded-full"
                style={{ fontSize: '0.65rem' }}
              >
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Dropdown Menu */}
          <div
            className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-[#1b1b1b] border border-[#333333] rounded-lg shadow-xl z-50 transition-all duration-200 origin-top ${
              isDropdownOpen
                ? 'opacity-100 scale-y-100 pointer-events-auto'
                : 'opacity-0 scale-y-95 pointer-events-none'
            }`}
          >
            <div className="py-1">
              <div className="px-3 py-2 text-xs font-medium text-[#A3A3A3] border-b border-[#333333]">
                Select Relevance Level
              </div>

              {relevanceOptions.map((option) => {
                const isChecked = selectedRelevances.includes(option.value);
                const id = `relevance-${option.value}`;

                return (
                  <label
                    key={option.value}
                    htmlFor={id}
                    className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-[#222222] transition-colors select-none"
                  >
                    <span className={`font-medium ${option.color}`}>{option.label}</span>
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        isChecked ? 'bg-white border-white' : 'border-[#A3A3A3] bg-transparent'
                      }`}
                    >
                      {isChecked && (
                        <svg
                          className="w-3 h-3 text-[#1b1b1b]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                    <input
                      id={id}
                      type="checkbox"
                      value={option.value}
                      checked={isChecked}
                      onChange={() => handleRelevanceToggle(option.value)}
                      className="sr-only"
                    />
                  </label>
                );
              })}
            </div>
          </div>

          {/* Optional: Hover preview of selected filters */}
          {activeFilterCount > 0 && !isDropdownOpen && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-xs font-medium text-[#FCFCFC] truncate px-2">
                {selectedRelevances
                  .map((v) => relevanceOptions.find((o) => o.value === v)?.label || v)
                  .join(', ')}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SceneFilters;