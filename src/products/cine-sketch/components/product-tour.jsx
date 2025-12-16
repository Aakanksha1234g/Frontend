import { useEffect, useRef, useState } from 'react';

const ProductTour = ({ steps, isActive, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const tooltipRef = useRef(null);

  const step = steps[currentStep];

  useEffect(() => {
    if (!isActive || !step?.target) return;

    const el = document.querySelector(`[data-tour="${step.target}"]`);
    const tooltip = tooltipRef.current;

    if (el && tooltip) {
      const rect = el.getBoundingClientRect();
      tooltip.style.top = `${rect.bottom + window.scrollY + 8}px`;
      tooltip.style.left = `${rect.left + window.scrollX}px`;
    }
  }, [currentStep, step, isActive]);

  if (!isActive || !step) return null;

  return (
    <div className="z-50 absolute" ref={tooltipRef}>
      <div className="bg-white border border-gray-300 shadow-xl rounded-lg p-4 w-64">
        <p className="text-sm font-medium mb-2">{step.content}</p>
        <div className="flex justify-between mt-2">
          {currentStep > 0 && (
            <button
              onClick={() => setCurrentStep(prev => prev - 1)}
              className="text-blue-600 text-sm"
            >
              Back
            </button>
          )}
          {currentStep < steps.length - 1 ? (
            <button
              onClick={() => setCurrentStep(prev => prev + 1)}
              className="text-blue-600 text-sm"
            >
              Next
            </button>
          ) : (
            <button onClick={onClose} className="text-green-600 text-sm">
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductTour;
