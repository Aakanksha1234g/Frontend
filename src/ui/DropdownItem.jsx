import { cn } from "@shared/utils/utils";
import Button from "./Button";

export default function DropdownItem({
  children,
  onClick,
  disabled = false,
  className,
  icon: Icon,
  ...props
}) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      size={"full"}
      {...props}
      className={cn("text-[10px] py-1.5 px-2 rounded-none text-left", className)}
    >
      {Icon && <Icon className="w-4 h-4" />}
      <span>{children}</span>
    </Button>
  );
}
