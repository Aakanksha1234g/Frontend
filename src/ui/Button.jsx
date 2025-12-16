import { cva } from "class-variance-authority";
import { cn } from "@shared/utils/utils";

const buttonVariants = cva(
  "cursor-pointer text-center flex items-center text-light-text dark:text-dark-text rounded-md transition-colors duration-200",
  {
    variants: {
      size: {
        sm: "text-sm px-3 py-3",
        md: "text-md h-10",
        lg: "w-lg px-3 py-3 h-10",
        xl: "w-xl px-3 py-3 h-10",
        full: "w-full",
      },
      variant: {
        primary: "dark:bg-dark-default-main hover:dark:bg-dark-default-main bg-light-accent-soft_hover/80 hover:bg-light-accent-soft_hover",
        secondary: "bg-secondary-base hover:bg-secondary-hover px-2 py-2",
        transparent: "bg-transparent hover:bg-transparent",
        primary_sidebar: "hover:dark:bg-dark-default-main bg-light-accent-soft_hover/80 hover:bg-light-accent-soft_hover",
      },
      clicked: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      {
        variant: "secondary",
        clicked: true,
        class: "bg-secondary-click",
      },
    ],
    defaultVariants: {
      variant: "primary",
      clicked: false,
    },
  }
);

export default function Button({
  as: Component = "button",
  className,
  size,
  variant,
  clicked = false,
  ...props
}) {
  return (
    <Component
      {...props}
      className={cn(buttonVariants({ size, variant, clicked }), className)}
    />
  );
}
