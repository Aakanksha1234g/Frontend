// @ui/Chip.jsx
import { cva } from "class-variance-authority";
import { cn } from "@shared/utils/utils";

const chipVariants = cva(
  "inline-flex items-center justify-center px-3 py-1 rounded-full border text-xs font-[Outfit] transition-all select-none cursor-pointer",
  {
    variants: {
      selected: {
        true: "bg-light-accent-soft_hover dark:bg-gray-800 text-light-text dark:text-dark-text border-gray-600",
        false: "bg-light-default-main dark:bg-dark-default-main text-light-text dark:text-dark-text dark:border-[#2E2E2E] hover:border-gray-500"
      },
      size: { sm: "text-xs", md: "text-sm", lg: "text-sm" },
    },
    defaultVariants: { selected: false, size: "md" },
  }
);

export default function Chip({ children, selected, onClick, className }) {
  return (
    <div
      className={cn(chipVariants({ selected }), "min-h-[28px]", className)}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
