import { useState } from "react";
import HelpIcon from '@assets/icons/InfoCircle.svg?react';

export default function HelpTooltip({ text }) {
  const [isHovered, setHovered] = useState(false);

  return (
    <div
      className="relative text-white flex items-center"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <HelpIcon className="w-4 h-4 text-black dark:text-white fill-black dark:fill-white" />
      {isHovered && (
        <div className="absolute left-5 top-0 z-20 dark:bg-dark-default-main bg-light-accent-soft_hover dark:text-light-accent-foreground text-dark-accent-foreground text-xs px-3 py-2 rounded-md border dark:border-gray-700 border-black/10 min-w-[220px] max-w-5xl flex-wrap">
          <p className="w-full">{text}</p>
        </div>
      )}
    </div>
  );
}
