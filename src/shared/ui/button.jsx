import React from 'react';

const Button = ({
  children,
  onClick,
  size = 'lg',
  className = '',
  disabled = false,
  ...props
}) => {
  // Define padding and border-radius based on size
  const sizeClasses = {
    xs: 'px-[6px] py-[2px] rounded-[4px] text-[11px] ',
    sm: 'px-[10px] py-[4px] rounded-[8px] text-xs',
    md: 'px-[14px] py-[8px] rounded-[12px] text-sm',
    lg: 'px-[16px] py-[10px] rounded-[12px] text-lg',
  };


  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`
        ${sizeClasses[size]}
        transition-all duration-200 flex gap-2 items-center justify-center
        ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
