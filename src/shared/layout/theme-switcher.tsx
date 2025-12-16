import { FC, useEffect } from 'react';
import { VisuallyHidden } from '@react-aria/visually-hidden';
import { SwitchProps } from '@heroui/switch';
import clsx from 'clsx';
import { useTheme } from '@heroui/use-theme';
import IconButtonWithTooltip from '@shared/ui/IconButtonWithTooltip';
import { MoonFilledIcon } from './icons';
import React from 'react';

export interface ThemeSwitchProps {
  className?: string;
  classNames?: SwitchProps['classNames'];
}

export const ThemeSwitch: FC<ThemeSwitchProps> = ({
  className,
  classNames,
}) => {
  const { theme, setTheme } = useTheme();

  // Force dark mode on mount
  useEffect(() => {
    if (theme !== 'dark') {
      setTheme('dark');
    }
  }, [theme, setTheme]);

  return (
    <div
      className={clsx(
        'w-10 h-10 flex items-center justify-center opacity-80',
        className
      )}
    >
      <IconButtonWithTooltip
        iconComponent={MoonFilledIcon}
        iconProps={{ color: '#737373', size: 22 }}
        tooltipText={'Dark mode'}
        position="bottom"
        iconButton={true}
      />
    </div>
  );
};
