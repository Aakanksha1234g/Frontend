import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

import CloseIcon from '@assets/icons/close.svg';
import WarningIcon from '@assets/icons/success.svg';
import InfoIcon from '@assets/icons/warning.svg';
import { SuccessIcon, ErrorIcon } from '@shared/layout/icons';

const toastTypes = {
  success: {
    bgColor: 'bg-[#171717]',
    textColor: 'text-primary-gray-900',
    borderColor: 'border-[#3B82F6]',
    icon: SuccessIcon,
  },
  error: {
    bgColor: 'bg-[#171717]',
    textColor: 'text-primary-gray-900',
    borderColor: 'border-[#eb5545]',
    icon: ErrorIcon,
  },
  warning: {
    bgColor: 'bg-warning-100',
    textColor: 'text-primary-gray-900',
    borderColor: 'border-warning-400',
    icon: WarningIcon,
  },
  info: {
    bgColor: 'bg-primary-indigo-100',
    textColor: 'text-primary-gray-900',
    borderColor: 'border-primary-indigo-500',
    icon: InfoIcon,
  },
};




const Toast = ({ message, type = 'info', duration = 3000, onClose }) => {
  const { bgColor, textColor, borderColor, icon } = toastTypes[type];

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

   const renderIcon = icon => {
     if (!icon) return null;
     const IconComponent = icon;
     return (
       <div >
         <IconComponent size={24}  />
       </div>
     );
   };

  return createPortal(
    <div className={`fixed bottom-4 right-4 z-50 animate-slide-in`}>
      <div
        className={`${bgColor} ${textColor} border-2 ${borderColor} px-4 py-3 rounded-lg shadow-md flex items-start space-x-3`}
      >
        {renderIcon(icon)}
        {/* <img
          src={icon}
          color={borderColor}
          alt={`${type} Icon`}
          className="w-5 h-5 hover:color-primary-gray-700 cursor-pointer"
        /> */}
        <div className="flex flex-col items-start gap-2">
          <h1 className='text-sm'>{type.slice(0, 1).toUpperCase() + type.slice(1)}</h1>
          <p className="text-xs font-medium">{message}</p>
        </div>
        <div
          onClick={onClose}
          className="ml-auto  -mx-1.5 -my-1.5 rounded-lg border-0 focus:ring-2 p-1.5 inline-flex h-8 w-8"
        >
          <img
            src={CloseIcon}
            color="color-primary-gray-900"
            alt="Close Icon"
            className="w-5 h-5 hover:color-primary-gray-700 cursor-pointer"
          />
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Toast;
