import { useState, useRef, useEffect } from 'react';
import close from '@assets/icons/close.svg';

export default function TagInput({
  suggestions,
  placeholder,
  value = [],
  onChange,
  disabled = false,
}) {
  const [inputValue, setInputValue] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const tagContainerRef = useRef(null);
  const dropdownRef = useRef(null);
  // const [selectedSuggestions, setSelectedSuggestions] = useState([]);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  // Scroll to latest tag when updated
  useEffect(() => {
    if (tagContainerRef.current) {
      tagContainerRef.current.scrollTo({
        right: tagContainerRef.current.scrollWidth,
        behavior: 'smooth',
      });
    }
  }, [value]);

  // Handle clicks outside to close suggestions
  useEffect(() => {
    if (disabled) return;

    const handleClickOutside = event => {
      const clickedOutsideDropdown =
        dropdownRef.current && !dropdownRef.current.contains(event.target);
      const clickedOutsideInput =
        tagContainerRef.current &&
        !tagContainerRef.current.contains(event.target);

      if (clickedOutsideDropdown && clickedOutsideInput) {
        setShowSuggestions(false);
        setInputValue(''); // Clear the input value when clicking outside
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [disabled]);

  // --- Handlers ---
  const addTag = tag => {
    if (disabled) return;
    if (tag && !value.includes(tag)) {
      onChange([...value, tag]);
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  const removeTag = tagToRemove => {
    if (disabled) return;
    onChange(value.filter(tag => tag !== tagToRemove));
    setFilteredSuggestions(
      suggestions.filter(s =>
        s.toLowerCase().includes(inputValue.toLowerCase())
      )
    );
    setShowSuggestions(true);
  };

  const handleInputChange = e => {
    if (disabled) return;
    const searchText = e.target.value;
    setInputValue(searchText);
    setFocusedIndex(-1);
    setFilteredSuggestions(
      suggestions.filter(
        s =>
          s.toLowerCase().includes(searchText.toLowerCase()) &&
          !value.includes(s)
      )
    );
    setShowSuggestions(true);
  };

  const handleInputClick = () => {
    if (disabled) return;
    setFilteredSuggestions(suggestions.filter(s => !value.includes(s)));
    setShowSuggestions(true);
  };

  const toggleSuggestion = tag => {
    if (disabled) return;

    if (value.includes(tag)) {
      onChange(value.filter(v => v !== tag));
    } else {
      onChange([...value, tag]);
    }

    setInputValue('');
    setShowSuggestions(true); // Keep it open for multi-selection
  };

  const handleKeyDown = e => {
    if (disabled) return;
    if (!showSuggestions || filteredSuggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(prev => (prev + 1) % filteredSuggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(prev =>
        prev === -1
          ? filteredSuggestions.length - 1
          : (prev - 1 + filteredSuggestions.length) % filteredSuggestions.length
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (focusedIndex >= 0 && focusedIndex < filteredSuggestions.length) {
        toggleSuggestion(filteredSuggestions[focusedIndex]);
      }
    }
  };

  // --- Render ---
  return (
    <div
      className={`w-full relative max-w-md px-2 py-[4px]  rounded-lg ${
        disabled ? 'opacity-60 pointer-events-none select-none' : ''
      }`}
    >
      {/* Tags Container */}
      <div ref={tagContainerRef} className="flex flex-col gap-0">
        {/* Input Field below the tag list */}
        <input
          disabled={disabled}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onClick={handleInputClick}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full p-2 text-sm border-none focus:ring-0 focus:outline-none ${disabled ? 'hidden' : 'block'}`}
        />

        <div
          className="flex gap-2 overflow-x-auto scroll-smooth whitespace-nowrap max-h-20"
          style={{ maxHeight: 80, overflowY: 'auto' }}
        >
          {value.map((tag, index) => (
            <div
              key={index}
              className="flex items-center px-2 py-1 text-xs font-bold text-primary-gray-500 bg-primary-gray-200 rounded-lg pr-6 relative flex-shrink-0"
            >
              {tag}
              {!disabled && (
                <div
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 text-primary-gray-500 hover:text-red-400 flex-shrink-0 cursor-pointer"
                  onClick={() => removeTag(tag)}
                >
                  <img
                    src={close}
                    alt="Remove"
                    className="w-4 h-4 object-contain"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {showSuggestions && filteredSuggestions.length > 0 && !disabled && (
        <div
          ref={dropdownRef}
          className="absolute left-0 right-0 mt-1 p-2 bg-white border border-gray-200 rounded-md shadow-chat-button shadow-shadow-chat-button z-50 min-h-[80px] max-h-[150px] overflow-y-auto"
        >
          {filteredSuggestions.map((suggestion, index) => {
            const isSelected = value.includes(suggestion);

            return (
              <div
                key={index}
                onClick={() => toggleSuggestion(suggestion)}
                className={`p-2 cursor-pointer rounded-lg text-xs flex justify-between items-center ${
                  isSelected
                    ? 'bg-green-100 text-green-700 font-semibold'
                    : 'hover:bg-primary-indigo-50'
                }`}
              >
                {suggestion}
                {isSelected && <span className="ml-2">✅</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
