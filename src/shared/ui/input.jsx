import { Tooltip } from '@heroui/react';
import { useMemo } from 'react';


const normalizeText = text => text.replace(/\s+/g, ' ').trim();

export default function Input({
  type = 'text',
  value = '',
  onChange,
  placeholder,
  required = false,
  checked,
  name,
  label,
  tooltipText,
  className,
  errorMessage,
  border = true,
  disabled = false,
  wordLimit,
  minLimit,
  showWordCount = true,
  ...props
}) {



  const wordCount = useMemo(() => {
    if (type !== 'text' && type !== 'textarea') return 0;
    return normalizeText(value || '').split(' ').filter(Boolean).length;
  }, [value, type]);

 
  const isOverLimit = wordLimit && wordCount > wordLimit;
  const isMinLimit = minLimit && wordCount < minLimit;
  return (
    <div className="relative w-full">
      {/* Label with Tooltip */}
      {label && (
        <Tooltip
          className="max-w-[153px] text-xs"
          content={tooltipText}
          placement="right"
          showArrow={true}
        >
          <label className="text-sm font-medium flex items-center mb-1 gap-1 w-fit">
            {label}
            {required && <span className="text-[#EB5545]">*</span>}
          </label>
        </Tooltip>
      )}

      {/* Input Box */}
      <input
        type={type}
        name={name}
        value={type === 'checkbox' ? undefined : value}
        checked={type === 'checkbox' ? checked : undefined}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        style={{
          border: border ? '1px solid' : 'none',
          borderColor: errorMessage ? '#EB5545' : 'rgba(255, 255, 255, 0.1)',
          color: '#ffffff',
          backgroundColor: '#171717',
        }}
        className={`w-full flex-grow px-3 py-2  rounded-xl placeholder-[#666666] text-sm focus:ring-0 focus:outline-none
          ${disabled ? 'opacity-60 pointer-events-none select-none' : ''}
          ${type === 'checkbox' ? 'w-auto cursor-pointer' : ''}
          ${className || ''}`}
        {...props}
      />

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
  );
}
