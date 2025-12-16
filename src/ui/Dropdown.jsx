import { useEffect, useRef } from "react";
import { cn } from "@shared/utils/utils";

export default function Dropdown({
  trigger,             // JSX trigger element
  isOpen,              // controlled state
  onClose,             // close handler
  children,            // DropdownItems inside
  position = "right",  // "left" or "right"
  className,
  maxHeight = "16rem", 
}) {
  const dropdownRef = useRef(null);

  // Handle outside clicks
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose?.();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {trigger}
      {isOpen && (
        <div
          className={cn(
            "absolute mt-2 min-w-[7rem] dark:bg-dark-accent-hover bg-light-accent-hover text-white border border-[#383838] text-xs rounded z-50 overflow-y-auto",
            position === "right" ? "right-0" : "left-0",
            className 
          )}
          style={{
            maxHeight, 
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
