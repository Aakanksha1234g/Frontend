import * as React from 'react';
import { cn } from '@shared/utils/utils';

const TabsContext = React.createContext();

const Tabs = ({ className, value, onValueChange, children }) => {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={cn('flex flex-col w-full', className)}>{children}</div>
    </TabsContext.Provider>
  );
};

const TabsList = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex overflow-x-auto no-scrollbar py-3 rounded-sm border-gray-200 scroll-smooth whitespace-nowrap',
      className
    )}
    {...props}
  >
    {children}
  </div>
));
TabsList.displayName = 'TabsList';

const TabsTrigger = ({ className, value, children, ...props }) => {
  const { value: activeValue, onValueChange } = React.useContext(TabsContext);
  const isActive = activeValue === value;

  return (
    <button
      onClick={() => onValueChange && onValueChange(value)}
      className={cn(
        `px-4 py-1 cursor-pointer text-xs font-medium transition-all duration-200
          ${
            isActive
              ? 'bg-white text-blue-600'
              : 'text-gray-600 hover:text-gray-500 hover:bg-white/80'
          }
          focus:outline-none`,
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

TabsTrigger.displayName = 'TabsTrigger';

const TabsContent = ({ className, value, children, ...props }) => {
  const { value: activeValue } = React.useContext(TabsContext);
  const isActive = activeValue === value;

  return (
    <div
      className={cn(
        `mt-2 rounded-xl bg-white ${isActive ? 'block' : 'hidden'}`,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

TabsContent.displayName = 'TabsContent';

export { Tabs, TabsList, TabsTrigger, TabsContent };
