import NavbarComponent from './Navbar';
import { Sidebar } from './Sidebar';
import { useState, cloneElement } from 'react';
import { ThemeProvider } from '../contexts/ThemeContext';

export const Layout = ({ children, showSort = true }) => {
  const [sortConfig, setSortConfig] = useState({
    sortBy: "Date Created",
    sortOrder: "Newest First"
  });

  const handleSortChange = (newSortConfig) => {
    setSortConfig(newSortConfig);
  };

  const screenWidth = window.innerWidth;

  // Block mobile devices (< 540px width)
  if (screenWidth < 540) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-black text-white px-6 text-center">
        <h1 className="text-2xl font-semibold mb-4">PitchCraft is not available on mobile yet</h1>
        <p className="text-gray-400 max-w-sm">
          Please use a tablet or desktop device with a larger screen to access the editor.
        </p>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <div className="dark:bg-light-accent-main bg-light-accent-hover flex flex-col h-screen">
        <NavbarComponent onSortChange={handleSortChange} showSort={showSort} />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-4">
            {children && cloneElement(children, { sortConfig })}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
};

