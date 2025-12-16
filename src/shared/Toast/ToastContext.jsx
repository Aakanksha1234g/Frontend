import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import Toast from './Toast';
import { setToastFunction } from '@shared/utils/toast-service';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [currentToast, setCurrentToast] = useState(null);


  // Function to show a new toast (replacing the previous one)
  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const newToast = {
      id: Math.random().toString(36).substr(2, 9),
      message,
      type,
      duration,
    };

    // Replace the current toast immediately
    setCurrentToast(newToast);

    // Auto-remove the toast after `duration`
    setTimeout(() => {
      setCurrentToast(null);
    }, duration);
  }, []);

  // Register addToast globally
  useEffect(() => {
    setToastFunction(addToast);
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {currentToast && (
        <Toast
          key={currentToast.id}
          message={currentToast.message}
          type={currentToast.type}
          duration={currentToast.duration}
          onClose={() => setCurrentToast(null)} // Close toast manually
        />
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// How to use Guide
//
// First, import and destructure the addToast function in your component:
// const { addToast } = useToast();
//
// Then use it with these examples:
//
// Success toast (green)
// addToast("Operation successful!", "success");
//
// Error toast (red)
// addToast("Something went wrong!", "error");
//
// Warning toast (yellow)
// addToast("Please check your input", "warning");
//
// Info toast (blue)
// addToast("Processing your request...", "info");
//
// Custom duration (in milliseconds)
// addToast("This will stay longer", "info", 5000);
