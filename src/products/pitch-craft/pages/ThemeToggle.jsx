import Sun from '@assets/pitch-craft/Sun.svg?react';
import { MoonFilledIcon } from '@shared/layout/icons';
import { useTheme } from '../contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-md dark:bg-dark-accent-hover bg-light-accent-hover transition cursor-pointer"
    >
      {theme === "light" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <MoonFilledIcon className="h-4 w-4" />
      )}
    </button>
  );
}
