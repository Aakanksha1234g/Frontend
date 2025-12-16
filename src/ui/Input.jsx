import { useState } from "react";
import { cva } from "class-variance-authority";
import { cn } from "@shared/utils/utils";
import HelpIcon from "@assets/icons/InfoCircle.svg?react";

const inputVariants = cva(
  "w-full rounded-md text-light-text dark:text-dark-text placeholder-gray-400 bg-light-accent-soft_hover/80 dark:bg-dark-default-main border border-[#2E2E2E] focus:outline-none focus:ring-2 focus:ring-white/40 font-[Outfit] font-medium transition-colors",
  {
    variants: {
      size: {
        sm: "h-8 text-xs px-3",
        md: "h-10 text-xs px-4",
        lg: "h-12 text-md px-4",
      },
      variant: {
        default: "border-t border-[#FFFFFF1A]",
        error: "border-red-500 focus:ring-red-400 placeholder-red-300",
        disabled: "dark:bg-[#2e2e2e] text-gray-500 cursor-not-allowed",
      },
    },
    defaultVariants: { size: "md", variant: "default" },
  }
);

export default function Input({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  onBlur,
  required,
  error,
  helperText,
  as = "input",
  rows = 4,
  size,
  variant,
  className,
  validate,   // new prop (validation function)
  setError,   // new prop (to update error in parent)
}) {
  const [isHovered, setHovered] = useState(false);
  const [touched, setTouched] = useState(false);
  const InputTag = as === "textarea" ? "textarea" : "input";

  // --- Handle Change with Live Validation ---
  const handleChange = (e) => {
    const val = e.target.value;
    onChange?.(e);

    // Run validation in real-time after blur once
    if (touched && validate && setError) {
      const msg = validate(val);
      setError((prev) => ({ ...prev, [name]: msg }));
    }
  };

  // Handle Blur
  const handleBlur = (e) => {
    setTouched(true);
    onBlur?.(e);

    if (validate && setError) {
      const msg = validate(e.target.value);
      setError((prev) => ({ ...prev, [name]: msg }));
    }
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      {/* Label + Tooltip */}
      {label && (
        <div className="flex items-center gap-1">
          <label
            htmlFor={name}
            className="block text-sm font-medium dark:text-light-accent-foreground text-dark-accent-foreground"
          >
            {label} {required && <span className="text-red-400">*</span>}
          </label>

          {helperText && (
            <div
              className="relative flex items-center max-w-3xl"
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
            >
              <HelpIcon className="w-4 h-4 text-black dark:text-white fill-black dark:fill-white" />
              {isHovered && (
                <div className="absolute left-5 top-0 z-20 dark:bg-dark-default-main bg-light-accent-soft_hover dark:text-light-accent-foreground text-dark-accent-foreground text-xs px-3 py-2 rounded-md border dark:border-gray-700 border-black/10 min-w-[220px] max-w-5xl flex-wrap">
                  <p className="w-full">{helperText}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Input / Textarea */}
      <InputTag
        id={name}
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={handleChange}
        onBlur={handleBlur}
        rows={as === "textarea" ? rows : undefined}
        className={cn(
          inputVariants({ size, variant: error ? "error" : variant }),
          className
        )}
      />

      {/* Error */}
      {error && (
        <p className="text-xs text-red-400 mt-0.5 font-[Outfit]">{error}</p>
      )}
    </div>
  );
}
