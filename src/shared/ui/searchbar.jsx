import React, { useState, useEffect, useRef, memo } from 'react';
import { cn } from '@shared/utils/utils';
import { DebounceTimeout } from '../constants/constants';

const SearchIcon = props => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height="1em"
    role="presentation"
    viewBox="0 0 24 24"
    width="1em"
    {...props}
  >
    <path
      d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
    <path
      d="M22 22L20 20"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </svg>
);

const SearchBar = memo(function SearchBar({
  className,
  query,
  setQuery,
  placeholder = 'Search...',
}) {
  const [inputValue, setInputValue] = useState(query || '');
  const inputRef = useRef(null);
  const wasFocusedRef = useRef(false);

  // Sync prop → state
  useEffect(() => {
    if (query !== inputValue) {
      setInputValue(query || '');
    }
  }, [query]);

  // Track focus
  const handleFocus = () => {
    wasFocusedRef.current = true;
  };
  const handleBlur = () => {
    wasFocusedRef.current = false;
  };

  // Restore focus when inputValue changes
  useEffect(() => {
    if (wasFocusedRef.current && inputRef.current) {
      requestAnimationFrame(() => {
        inputRef.current.focus();
        const val = inputRef.current.value;
        inputRef.current.setSelectionRange(val.length, val.length);
      });
    }
  }, [query]);

  // Debounce sending up query
  useEffect(() => {
    const handler = setTimeout(() => {
      setQuery 
    }, DebounceTimeout);

    return () => clearTimeout(handler);
  }, [query, setQuery]);

  return (
    <div
      className={cn(
        'flex items-center rounded-[12px] overflow-hidden border-2 border-[#FFFFFF1A]/50',
        className
      )}
    >
      <SearchIcon className="w-[16px] h-[16px] ml-2 text-[#737373]" />
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={setQuery}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className="w-full px-3 py-2 text-sm text-primary-gray-500 border-none outline-none focus:outline-none focus:ring-0"
      />
    </div>
  );
});

export default SearchBar;
