import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { SidebarCollapseIcon } from '@shared/layout/icons';

const IconButtonWithTooltip = ({
  imageUrl = '',
  altText = '',
  iconComponent: IconComponent,
  iconProps = {},
  tooltipText = '',
  onClick = undefined, // optional
  iconButton = true,
  position = 'bottom',
  disabled = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const buttonRef = useRef(null);

  const baseTooltipClasses = `
    absolute z-50 px-2 py-1 bg-[#1B1B1B] text-sm rounded-md
    shadow-md border border-white/30 whitespace-nowrap
    transition-opacity duration-200 ease-in-out
  `;

  const wrapperClasses = `
  flex items-center relative
`;

const buttonClasses = `
  ${iconButton ? 'bg-white/10 p-1' : 'p-0'}
  rounded-md transition-all duration-300
  ${
    disabled
      ? 'cursor-not-allowed opacity-40'
      : IconComponent === SidebarCollapseIcon
        ? 'cursor-ew-resize hover:bg-white/10 hover:scale-105'
        : 'cursor-pointer hover:bg-white/10 hover:scale-105'
  }
`;




  const iconClasses = `
    ${iconButton ? 'w-6 h-6' : imageUrl ? 'w-8 h-8' : 'w-6 h-6'}
    ${disabled ? 'opacity-40' : 'opacity-100'}
    transition-opacity duration-200
  `;

  // Position calculation for tooltip portal
  const getTooltipPosition = () => {
    if (!buttonRef.current) return { top: 0, left: 0, transform: '' };
    const rect = buttonRef.current.getBoundingClientRect();
    switch (position) {
      case 'top':
        return {
          top: rect.top - 8,
          left: rect.left + rect.width / 2,
          transform: 'translate(-50%, -100%)',
        };
      case 'bottom':
        return {
          top: rect.bottom + 8,
          left: rect.left + rect.width / 2,
          transform: 'translate(-50%, 0%)',
        };
      case 'left':
        return {
          top: rect.top + rect.height / 2,
          left: rect.left - 8,
          transform: 'translate(-100%, -50%)',
        };
      case 'right':
        return {
          top: rect.top + rect.height / 2,
          left: rect.right + 8,
          transform: 'translate(0%, -50%)',
        };
      default:
        return {
          top: rect.bottom + 8,
          left: rect.left + rect.width / 2,
          transform: 'translate(-50%, 0%)',
        };
    }
  };

  const tooltip =
    isHovered &&
    buttonRef.current &&
    tooltipText &&
    ReactDOM.createPortal(
      <div
        className={`${baseTooltipClasses} text-xs text-[#fcfcfc]  opacity-100`}
        style={{
          position: 'fixed',
          top: getTooltipPosition().top,
          left: getTooltipPosition().left,
          transform: getTooltipPosition().transform,
          pointerEvents: 'none',
          zIndex: 9999,
        }}
        role="tooltip"
        aria-live="polite"
        id="tooltip"
      >
        {tooltipText}
      </div>,
      document.body
    );

  return (
    <div
      className={wrapperClasses}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
     <button
  disabled={disabled}
  className={buttonClasses}
  onClick={!disabled && onClick ? onClick : undefined}
  ref={buttonRef}
  aria-describedby={isHovered && tooltipText ? 'tooltip' : undefined}
>
  {imageUrl ? (
    <img
      src={imageUrl}
      alt={altText}
      className={iconClasses}
      draggable={false}
    />
  ) : (
    IconComponent && <IconComponent className={iconClasses} {...iconProps} />
  )}
</button>

      {tooltip}
    </div>
  );
};

export default IconButtonWithTooltip;
