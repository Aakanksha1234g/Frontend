import { Tooltip } from '@heroui/react';
import { useRef, useEffect } from 'react';

const normalizeText = text => text.replace(/\s+/g, ' ').trim();

export default function Textarea({
  value,
  onChange,
  placeholder,
  rows = 3,
  required = false,
  name,
  className,
  disabled = false,
  wordLimit,
  minLimit,
  showWordCount = true,
  label,
  tooltipText = '',
  errorMessage,
  wordCountPosition = 'bottom-right',
  wantBorder=false,
  ...props
}) {
  const textareaRef = useRef(null);

  const wordCount = normalizeText(value || '')
    .split(' ')
    .filter(Boolean).length;

  const isOverLimit = wordLimit && wordCount > wordLimit;
  const isMinLimit = minLimit && wordCount<minLimit;

  const handleChange = e => {
    onChange(e);
  };

  const handleBlur = e => {
    const cleanedText = normalizeText(e.target.value);
    if (cleanedText !== e.target.value) {
      onChange({ ...e, target: { ...e.target, value: cleanedText } });
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = rows ? `${rows * 20}px` : '77px';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        rows ? `${rows * 24}px` : '120px'
      )}px`;
    }
  }, [value]);

  return (
    <div className="w-full scrollbar-textarea">
      {/* Label with Tooltip */}
      {label && (
        <Tooltip
          className="max-w-[153px]  text-xs"
          content={tooltipText}
          placement="right"
          showArrow={true}
        >
          <label className="text-sm font-medium flex items-center mb-1 w-fit">
            {label}
            {required && <span className="text-[#EB5545]">*</span>}
          </label>
        </Tooltip>
      )}

      {/* Textarea Container */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          rows={rows}
          required={required}
          name={name}
          disabled={disabled}
          className={`w-full text-justify text-sm px-3 py-2 scrollbar-gray placeholder-[#666666] rounded-xl resize-none focus:ring-0 focus:outline-none ${
            disabled ? 'opacity-60 pointer-events-none select-none' : ''
          } ${className || ''}`}
          style={{
            border: '1px solid',
            borderColor: errorMessage
              ? '#EB5545' // error red
              : wantBorder
                ? '#3B82F6' // blue border if wantBorder
                : 'rgba(255, 255, 255, 0.1)', // default gray
            color: '#ffffff',
            overflowY: 'auto',
            backgroundColor: '#171717',
          }}
          {...props}
        />

        {/* Word Count BELOW text area */}
        {showWordCount && (
          <div className="flex justify-between items-center mt-[2px]">
            {/* Left side: Error message */}
            <p className="text-[#EB5545] text-xs">{errorMessage}</p>

            {/* Right side: Word count */}
            <p
              className={`text-xs ${
                errorMessage ? 'text-[#EB5545]' : 'text-gray-500'
              }`}
            >
              {wordLimit ? `${wordCount} / ${wordLimit}` : `${wordCount}`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
