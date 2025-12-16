import { useState, useEffect, useRef } from 'react';
import { useShapeActions } from '@products/pitch-craft/hooks/useShapeActions';
import { useCanvas } from '@products/pitch-craft/contexts/CanvasContext';
import ShapesIcon from "@assets/pitch-craft/ShapesIcon.svg?react";
import PaletteIcon from "@assets/pitch-craft/PaletteIcon.svg?react";
import AdvancedColorPicker from '@products/pitch-craft/utils/color-picker';
import Button from '@ui/Button';

export default function ShapeControls() {
  const {
    addRectangle,
    addRoundedRectangle,
    addCircle,
    addTriangle,
    addLine,

    // Style
    setFillColor,
    setOpacity,
    setBorderColor,
  } = useShapeActions();

  const { canvas } = useCanvas();
  const [hasSelection, setHasSelection] = useState(false);
  const [isTextSelected, setIsTextSelected] = useState(false);
  const [fillColor, setFillColorState] = useState('#FFFFFF');
  const [borderColorState, setBorderColorState] = useState('#CCCCCC');
  const [isShapesOpen, setIsShapesOpen] = useState(false);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isBorderPickerOpen, setIsBorderPickerOpen] = useState(false);

  const dropdownRef = useRef(null);
  const colorPickerRef = useRef(null);
  const borderPickerRef = useRef(null);
  const shapesButtonRef = useRef(null);
  const fillButtonRef = useRef(null);
  const borderButtonRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [fillPickerPosition, setFillPickerPosition] = useState({ top: 0, left: 0 });
  const [borderPickerPosition, setBorderPickerPosition] = useState({ top: 0, left: 0 });

  // Sync selection state
  useEffect(() => {
    if (!canvas) return;

    const updateUI = () => {
      const active = canvas.getActiveObject();
      if (active) {
        setHasSelection(true);
        setIsTextSelected(active.type === 'textbox');
        setFillColorState(active.fill || '#FFFFFF');
        setBorderColorState(active.stroke || '#CCCCCC');
      } else {
        setHasSelection(false);
        setIsTextSelected(false);
      }
    };

    canvas.on('selection:created', updateUI);
    canvas.on('selection:updated', updateUI);
    canvas.on('selection:cleared', updateUI);
    canvas.on('object:modified', updateUI);

    return () => {
      canvas.off('selection:created', updateUI);
      canvas.off('selection:updated', updateUI);
      canvas.off('selection:cleared', updateUI);
      canvas.off('object:modified', updateUI);
    };
  }, [canvas]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!dropdownRef.current?.contains(event.target)) setIsShapesOpen(false);
      if (!colorPickerRef.current?.contains(event.target)) setIsColorPickerOpen(false);
      if (!borderPickerRef.current?.contains(event.target)) setIsBorderPickerOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Track initial colors when pickers open
  const [initialFillColor, setInitialFillColor] = useState('#FFFFFF');
  const [initialBorderColor, setInitialBorderColor] = useState('#CCCCCC');

  // Open color pickers and initialize with current selection colors
  const handleFillPickerOpen = () => {
    const active = canvas.getActiveObject();
    if (active) {
      const currentFill = active.fill || '#FFFFFF';
      setFillColorState(currentFill);
      setInitialFillColor(currentFill);
    }
    if (fillButtonRef.current) {
      const rect = fillButtonRef.current.getBoundingClientRect();
      setFillPickerPosition({
        top: rect.bottom + 4,
        left: rect.left
      });
    }
    setIsColorPickerOpen(true);
  };

  const handleBorderPickerOpen = () => {
    const active = canvas.getActiveObject();
    if (active) {
      const currentStroke = active.stroke || '#CCCCCC';
      setBorderColorState(currentStroke);
      setInitialBorderColor(currentStroke);
    }
    if (borderButtonRef.current) {
      const rect = borderButtonRef.current.getBoundingClientRect();
      setBorderPickerPosition({
        top: rect.bottom + 4,
        left: rect.left
      });
    }
    setIsBorderPickerOpen(true);
  };

  // Define categories and shapes
  const shapeCategories = [
    {
      title: "Basic Shapes",
      shapes: [
        { label: "Rectangle", action: addRectangle, icon: <rect x="3" y="3" width="14" height="14" fill="currentColor" /> },
        { label: "Rounded Rectangle", action: addRoundedRectangle, icon: <rect x="3" y="3" width="14" height="14" rx="3" ry="3" fill="currentColor" /> },
        { label: "Circle", action: addCircle, icon: <circle cx="10" cy="10" r="7" fill="currentColor" /> },
        { label: "Triangle", action: addTriangle, icon: <polygon points="10,4 16,16 4,16" fill="currentColor" /> },
        { label: "Line", action: addLine, icon: <line x1="4" y1="16" x2="16" y2="4" stroke="currentColor" strokeWidth="2" /> },
      ],
    },
  ];

  return (
    <div className="flex items-center gap-2 dark:bg-dark-accent-hover bg-light-accent-hover rounded-full">
      {/* Shapes Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <Button
          ref={shapesButtonRef}
          variant={"secondary"}
          className={"rounded-l-full"}
          onClick={() => {
            if (!isShapesOpen && shapesButtonRef.current) {
              const rect = shapesButtonRef.current.getBoundingClientRect();
              setDropdownPosition({
                top: rect.bottom + 4,
                left: rect.left
              });
            }
            setIsShapesOpen(prev => !prev);
          }}
          title="Shapes"
        >
          <ShapesIcon className="w-4 h-4 text-white" />
        </Button>

        {isShapesOpen && (
          <div
            className="fixed bg-light-default-main dark:bg-[#2a2a2a] rounded px-1 py-1 shadow z-50 max-h-96 overflow-y-auto w-60"
            style={{ top: `${dropdownPosition.top}px`, left: `${dropdownPosition.left}px` }}
          >
            {shapeCategories.map(category => (
              <div key={category.title} className="last:mb-0">
                <div className="grid grid-cols-5 gap-2">
                  {category.shapes.map(({ label, action, icon }) => (
                    <button
                      key={label}
                      onClick={() => { action(); setIsShapesOpen(false); }}
                      className="w-6 h-6 flex items-center justify-center rounded text-[#999999]"
                      title={label}
                    >
                      <svg width="18" height="18" viewBox="0 0 20 20" className="text-current">{icon}</svg>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fill Color Picker */}
      <div className="relative" ref={colorPickerRef}>
        <Button
          ref={fillButtonRef}
          variant={"secondary"}
          onClick={handleFillPickerOpen}
          className="disabled:opacity-50 disabled:cursor-not-allowed"
          title="Fill Color"
          disabled={!hasSelection || isTextSelected}
        >
          <PaletteIcon className="w-4 h-4 text-white" />
        </Button>

        {isColorPickerOpen && hasSelection && !isTextSelected && (
          <div
            className="fixed z-50 bg-[#2a2a2a] p-2 rounded shadow"
            style={{ top: `${fillPickerPosition.top}px`, left: `${fillPickerPosition.left}px` }}
          >
            <AdvancedColorPicker
              key={initialFillColor}
              value={initialFillColor}
              onChange={color => {
                setFillColorState(color);
                setFillColor(color);
              }}
            />
          </div>
        )}
      </div>

      {/* Border Color Picker */}
      {/* <div className="relative" ref={borderPickerRef}>
        <Button
          ref={borderButtonRef}
          variant={"secondary"}
          onClick={handleBorderPickerOpen}
          className="gap-0.5 rounded-r-full disabled:opacity-50 disabled:cursor-not-allowed"
          title="Border Color"
          disabled={!hasSelection || isTextSelected}
        >
          <span className="text-xs font-semibold text-light-foreground-muted dark:text-dark-foreground-muted">B</span>
          <PaletteIcon className="w-4 h-4 text-light-foreground-muted dark:text-dark-foreground-muted" />
        </Button>

        {isBorderPickerOpen && hasSelection && !isTextSelected && (
          <div
            className="fixed z-50 p-2 rounded shadow"
            style={{ top: `${borderPickerPosition.top}px`, left: `${borderPickerPosition.left}px` }}
          >
            <AdvancedColorPicker
              key={initialBorderColor}
              value={initialBorderColor}
              onChange={color => {
                setBorderColorState(color);
                setBorderColor(color);
              }}
            />
          </div>
        )}
      </div> */}
    </div>
  );
}
