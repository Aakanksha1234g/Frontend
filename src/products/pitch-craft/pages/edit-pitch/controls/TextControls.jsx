import { useState, useEffect, useRef } from "react";
import FontFaceObserver from "fontfaceobserver";
import { useTextActions } from "@products/pitch-craft/hooks/useTextActions";
import { useCanvas } from "@products/pitch-craft/contexts/CanvasContext";
import { cn } from "@shared/utils/utils";
import Dropdown from "@ui/Dropdown";
import DropdownItem from "@ui/DropdownItem";
import Button from "@ui/Button";

import AddTextIcon from "@assets/pitch-craft/AddTextIcon.svg?react";
import BoldIcon from "@assets/pitch-craft/BoldIcon.svg?react";
import ItalicIcon from "@assets/pitch-craft/ItalicIcon.svg?react";
import UnderlineIcon from "@assets/pitch-craft/UnderlineIcon.svg?react";
import TextAlignLeftIcon from "@assets/pitch-craft/TextAlignLeftIcon.svg?react";
import TextAlignRightIcon from "@assets/pitch-craft/TextAlignRightIcon.svg?react";
import TextAlignCenterIcon from "@assets/pitch-craft/TextAlignCenterIcon.svg?react";
import TextAlignJustifyIcon from "@assets/pitch-craft/TextAlignJustifyIcon.svg?react";
import DownIcon from "@assets/pitch-craft/DownIcon.svg?react";
import AdvancedColorPicker from "@products/pitch-craft/utils/color-picker";

export default function TextControls() {
  const {
    addText,
    changeTextColor,
    setUnderline,
    setStrikeThrough,
    setBold,
    setItalic,
    setTextAlign,
    changeTextFontFamily,
    changeTextFontSize,
  } = useTextActions();

  const { canvas } = useCanvas();

  const [hasSelection, setHasSelection] = useState(false);
  const [formatState, setFormatState] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
  });

  const [textAlign, setTextAlignState] = useState("left");
  const [currentColor, setCurrentColor] = useState("#ffffff");
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isFontOpen, setIsFontOpen] = useState(false);
  const [isSizeOpen, setIsSizeOpen] = useState(false);
  const [isAlignOpen, setIsAlignOpen] = useState(false);

  const [currentFont, setCurrentFont] = useState("Arial");
  const [currentSize, setCurrentSize] = useState(16);

  const colorPickerRef = useRef(null);
  const [initialPickerColor, setInitialPickerColor] = useState("#ffffff");

  const sizeOptions = [
    8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 36, 40, 44, 48,
    52, 56, 60, 64, 72, 80, 96,
  ];

  const fontOptions = [
    "Calibri",
    "Arial",
    "Verdana",
    "Tahoma",
    "Georgia",
    "Garamond",
    "Lato",
    "Roboto",
    "Montserrat",
    "Helvetica",
    "Times New Roman",
    "Dancing Script",
    "Pacifico",
    "Great Vibes",
    "Sacramento",
    "Allura",
    "Dawning of a New Day",
    "Delius Unicase",
    "Comic Relief",
    "Bebas Neue",
    "Anton",
    "Oswald",
    "Fjalla One",
    "Playfair Display",
    "Cinzel",
    "Abril Fatface",
  ];

  const systemFonts = [
    "Arial",
    "Helvetica",
    "Times New Roman",
    "Verdana",
    "Tahoma",
    "Calibri",
    "Georgia",
    "Garamond",
    "Courier New",
  ];

  useEffect(() => {
    if (!canvas) return;

    const updateUI = () => {
      const active = canvas.getActiveObject();
      if (active && active.type === "textbox") {
        setHasSelection(true);
        setCurrentColor(active.fill || "#ffffff");
        setCurrentFont(active.fontFamily || "Montserrat");
        setCurrentSize(active.fontSize || 24);
        setFormatState({
          bold: active.fontWeight === "bold",
          italic: active.fontStyle === "italic",
          underline: !!active.underline,
          strikethrough: !!active.linethrough,
        });
        setTextAlignState(active.textAlign || "left");
      } else {
        setHasSelection(false);
      }
    };

    canvas.on("selection:created", updateUI);
    canvas.on("selection:updated", updateUI);
    canvas.on("selection:cleared", updateUI);
    canvas.on("object:modified", updateUI);

    return () => {
      canvas.off("selection:created", updateUI);
      canvas.off("selection:updated", updateUI);
      canvas.off("selection:cleared", updateUI);
      canvas.off("object:modified", updateUI);
    };
  }, [canvas]);

  // Close color picker when clicking outside
  useEffect(() => {
    if (!isColorPickerOpen) return;

    const handleClickOutside = (event) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target)) {
        setIsColorPickerOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isColorPickerOpen]);

  const handleFontChange = async (font) => {
    setCurrentFont(font);
    if (systemFonts.includes(font)) {
      changeTextFontFamily?.(font);
      return;
    }
    try {
      const fontObserver = new FontFaceObserver(font);
      await fontObserver.load(null, 8000);
      changeTextFontFamily?.(font);
    } catch (err) {
      console.warn(`Font "${font}" failed to load.`, err);
      changeTextFontFamily?.(font);
    }
  };

  const handleFormatToggle = (type) => {
    const newValue = !formatState[type];
    setFormatState((prev) => ({ ...prev, [type]: newValue }));

    switch (type) {
      case "bold":
        setBold?.(newValue);
        break;
      case "italic":
        setItalic?.(newValue);
        break;
      case "underline":
        setUnderline?.(newValue);
        break;
      case "strikethrough":
        setStrikeThrough?.(newValue);
        break;
    }
  };

  const handleTextAlignChange = (align) => {
    setTextAlignState(align);
    setTextAlign?.(align);
  };

  const alignOptions = [
    { value: "left", icon: TextAlignLeftIcon },
    { value: "center", icon: TextAlignCenterIcon },
    { value: "right", icon: TextAlignRightIcon },
    { value: "justify", icon: TextAlignJustifyIcon },
  ];
  const SelectedIcon =
    alignOptions.find((o) => o.value === textAlign)?.icon || TextAlignLeftIcon;

  const handleColorPickerOpen = () => {
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active && active.type === "textbox") {
      const currentFill = active.fill || "#ffffff";
      setCurrentColor(currentFill);
      setInitialPickerColor(currentFill);
    }
    setIsColorPickerOpen((prev) => !prev);
  };

  return (
    <div className="flex items-center gap-1 rounded-l-full rounded-r-full dark:bg-dark-accent-hover bg-light-accent-hover">
      {/* Add Text */}
      <Button
        onClick={addText}
        variant={"secondary"}
        size={"sm"}
        className="rounded-l-full"
        title="Add text"
      >
        <AddTextIcon className="w-4 h-4 text-white" />
      </Button>

      {/* Bold / Italic / Underline */}
      {["bold", "italic", "underline"].map((type) => {
        const Icon =
          type === "bold"
            ? BoldIcon
            : type === "italic"
              ? ItalicIcon
              : UnderlineIcon;
        return (
          <Button
            key={type}
            variant={"secondary"}
            disabled={!hasSelection}
            onClick={() => handleFormatToggle(type)}
            className={"px-2 py-2"}
            clicked={formatState[type]}
            title={type.charAt(0).toUpperCase() + type.slice(1)}
          >
            <Icon
              className={cn(
                "w-4 h-4",
                formatState[type] ? "fill-white" : "fill-[#999999]"
              )}
            />
          </Button>
        );
      })}

      {/* Color Picker */}
      <div className="relative" ref={colorPickerRef}>
        <Button
          disabled={!hasSelection}
          variant="secondary"
          onClick={handleColorPickerOpen}
          className="flex-col justify-center px-2 py-1.5"
          size="full"
          title="Text Color"
        >
          <span className="text-sm font-bold text-light-foreground-muted dark:text-dark-foreground-muted cursor-pointer">
            A
          </span>
          <hr className={`bg-${currentColor} h-0.5 w-4 m-0 border-none`} />
        </Button>

        {isColorPickerOpen && hasSelection && (
          <div className="absolute left-0 top-full mt-1 z-50 dark:bg-[#2a2a2a] bg-white rounded-2xl rounded shadow">
            <AdvancedColorPicker
              key={initialPickerColor}
              value={initialPickerColor}
              onChange={(color) => {
                setCurrentColor(color);
                changeTextColor?.(color);
              }}
            />
          </div>
        )}
      </div>

      {/* Font Family Dropdown */}
      <Dropdown
        isOpen={isFontOpen}
        onClose={() => setIsFontOpen(false)}
        maxHeight="20rem"
        className={`left-1 ${localStorage.getItem("theme") === "dark" ? "scrollbar-black": "scrollbar-custom"} `}
        trigger={
          <Button
            disabled={!hasSelection}
            variant={"secondary"}
            onClick={(e) => {
              e.stopPropagation();
              setIsFontOpen((prev) => !prev);
            }}
            className={`justify-center gap-1 text-xs text-light-foreground-muted dark:text-dark-foreground-muted font-[${currentFont}] ${localStorage.getItem("theme") === "dark" ? "scrollbar-black": "scrollbar-custom"} `}
             style={{ fontFamily: currentFont }}
            title="Font Family"
          >
            {currentFont}
            <DownIcon className="w-3 h-3 text-white" />
          </Button>
        }
      >
        {fontOptions.map((font) => (
          <DropdownItem
            key={font}
            onClick={() => {
              handleFontChange(font);
              setIsFontOpen(false);
            }}
            className={`font-[${font}] hover:text-gray-400 hover:dark:text-gray-400`}
            style={{ fontFamily: font }}
          >
            {font}
          </DropdownItem>
        ))}
      </Dropdown>

      {/* Font Size Dropdown */}
      <Dropdown
        isOpen={isSizeOpen}
        onClose={() => setIsSizeOpen(false)}
        className={`${localStorage.getItem("theme") === "dark" ? "scrollbar-black": "scrollbar-custom"} `}
        trigger={
          <Button
            disabled={!hasSelection}
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              setIsSizeOpen((prev) => !prev);
            }}
            className="justify-center gap-1 text-xs text-light-foreground-muted dark:text-dark-foreground-muted"
            title="Font size"
          >
            {currentSize}
            <DownIcon className="w-3 h-3 text-white" />
          </Button>
        }
      >
        {sizeOptions.map((size) => (
          <DropdownItem
            key={size}
            onClick={() => {
              setCurrentSize(size);
              changeTextFontSize?.(size);
              setIsSizeOpen(false);
            }}
            className={cn(
              currentSize === size && "hover:text-gray-400 hover:dark:text-gray-400"
            )}
          >
            {size}
          </DropdownItem>
        ))}
      </Dropdown>

      {/* Text Align Dropdown */}
      <Dropdown
        isOpen={isAlignOpen}
        onClose={() => setIsAlignOpen(false)}
        trigger={
          <Button
            disabled={!hasSelection}
            variant={"secondary"}
            onClick={(e) => {
              e.stopPropagation();
              setIsAlignOpen((prev) => !prev);
            }}
            title="Text Align"
            className="justify-center gap-1 text-light-foreground-muted dark:text-dark-foreground-muted rounded-full"
          >
            <SelectedIcon className="w-4 h-4 fill-white" />
            <DownIcon className="w-3 h-3 text-light-foreground-muted dark:text-dark-foreground-muted" />
          </Button>
        }
      >
        <div className="flex space-x-1 p-1">
          {alignOptions.map((opt) => {
            const OptIcon = opt.icon;
            return (
              <Button
                key={opt.value}
                onClick={() => {
                  handleTextAlignChange(opt.value);
                  setIsAlignOpen(false);
                }}
                disabled={!hasSelection}
                className={"w-8 h-8 justify-center"}
                clicked={ textAlign === opt.value}
              >
                <OptIcon
                  className={cn(
                    "w-4 h-4",
                    textAlign === opt.value ? "fill-white" : "fill-[#999999]"
                  )}
                />
              </Button>
            );
          })}
        </div>
      </Dropdown>
    </div>
  );
}
