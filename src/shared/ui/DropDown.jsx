import { useState, useRef, useEffect, useCallback } from 'react';
import chevronDown from '@assets/icons/down.svg';
import { Tooltip } from '@heroui/react';
import FilterIcon from '@assets/icons/Filter.svg';

export default function Dropdown({
  label = 'Select options',
  options = [],
  value = [],
  onChange = () => {},
  disabled = false,
  readOnly = false,
  error = false,
  errorMessage = '',
  required = false,
  tooltipText = '',
  isMultiple = true,
  maxSelection = null, // Show inline alert when exceeded
  triggerContent = false,
  width = '100%', // 👈 New prop for dynamic width
  dropdownWidth = null, // 👈 Optional: control popup width separately
}) {
  const [open, setOpen] = useState(false);
  const [uiError, setUiError] = useState('');
  const dropdownRef = useRef(null);

  // --- Close dropdown when clicking outside ---
  useEffect(() => {
    const handler = e => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // --- Unified selection logic ---
  const handleToggle = useCallback(
    option => {
      if (disabled || readOnly) return;

      const exists = value.includes(option.value);
      let newValue;

      if (isMultiple) {
        newValue = exists
          ? value.filter(v => v !== option.value)
          : [...value, option.value];

        if (maxSelection !== null && newValue.length > maxSelection) {
          setUiError(`You can select up to ${maxSelection} options only.`);
          setTimeout(() => setUiError(''), 2500);
          return;
        }
      } else {
        newValue = exists ? [] : [option.value];
        setOpen(false);
      }

      onChange(newValue);
    },
    [disabled, readOnly, isMultiple, maxSelection, onChange, value]
  );

  const selectedLabels =
    options
      .filter(opt => value.includes(opt.value))
      .map(opt => opt.label)
      .join(', ') || label;

  const borderColor =
    error || errorMessage ? '#EB5545' : 'rgba(255, 255, 255, 0.1)';

  return (
    <div
      ref={dropdownRef}
      className="relative"
      style={{
        width: width, // 👈 parent container width control
      }}
    >
      {/* Label + Tooltip */}
      {label && (
        <Tooltip
          className="max-w-[153px] text-xs"
          content={tooltipText}
          placement="right"
      
          showArrow={true}
        >
          <label className="text-sm font-medium flex items-center mb-1 gap-1 w-fit text-white">
            {label}
            {required && <span className="text-[#EB5545]">*</span>}
          </label>
        </Tooltip>
      )}

      {/* Trigger Button */}
      {triggerContent ? (
        <div onClick={() => !disabled && !readOnly && setOpen(o => !o)}>
          {triggerContent}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => !disabled && !readOnly && setOpen(o => !o)}
          className={`flex justify-between text-sm items-center px-3 py-2 rounded-xl text-left transition-all
          ${disabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}
          ${readOnly ? 'bg-gray-50 text-gray-500 cursor-default' : ''}
        `}
          style={{
            width: '100%',
            border: `1px solid ${borderColor}`,
            color: '#ffffff',
            backgroundColor: '#171717',
          }}
        >
          <span
            className={`truncate text-md ${
              value.length ? 'text-white' : 'text-[#A3A3A3]'
            }`}
          >
            {selectedLabels}
          </span>
          <img
            src={chevronDown}
            alt="chevron-down"
            className={`ml-2 h-4 w-4 transition-transform duration-200 ${
              open ? 'rotate-180' : ''
            }`}
          />
        </button>
      )}

      {/* Dropdown List */}
      <div
        className={`absolute z-10 mt-2 bg-[#1B1B1B] rounded-2xl shadow-lg overflow-hidden transition-all duration-200 ease-in-out ${
          open
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 -translate-y-2 scale-95 pointer-events-none'
        } ${triggerContent ? '-right-20 top-12' : ''}`}
        style={{
          width: dropdownWidth || width, //  use dropdownWidth if passed
          border: `1px solid ${borderColor}`,
        }}
      >
        <ul className="max-h-48 overflow-auto">
          {options.map(option => {
            const isSelected = value.includes(option.value);
            return (
              <li
                key={option.value}
                onClick={() => !option?.disabled && handleToggle(option)}
                className={`flex items-center justify-between px-3 py-2 m-1 rounded-xl cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-[#0A0A0A] text-white'
                    : 'hover:bg-[#F5F5F5] hover:text-black text-[#FCFCFC]'
                } ${
                  disabled || readOnly ? 'cursor-not-allowed opacity-60' : ''
                }`}
              >
                <span>{option.label}</span>
                {!option.disabled && (
                  <input
                    type="checkbox"
                    checked={isSelected}
                    readOnly
                    className="h-4 w-4 accent-[#FCFCFC] cursor-pointer"
                  />
                )}
              </li>
            );
          })}
        </ul>

        {uiError && (
          <div className="bg-[#EB5545]/20 text-[#EB5545] text-xs px-3 py-2 animate-fade-in">
            ⚠️ {uiError}
          </div>
        )}
      </div>

      {(error || errorMessage) && (
        <p className="text-xs text-[#EB5545] mt-1">
          {errorMessage || 'Please select a valid option'}
        </p>
      )}
    </div>
  );
}
