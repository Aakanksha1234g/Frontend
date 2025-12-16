import NavbarComponent from './Navbar';
import { Sidebar } from './Sidebar';
import { useEffect, useState, cloneElement } from 'react';

const Layout = ({ children, showSort = true }) => {
  const [sortConfig, setSortConfig] = useState({
    sortBy: "Date Created",
    sortOrder: "Newest First"
  });

  const handleSortChange = (newSortConfig) => {
    setSortConfig(newSortConfig);
  };

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <div className="dark:bg-[#0A0A0A] bg-[#0A0A0A] flex flex-col h-screen">
      <NavbarComponent onSortChange={handleSortChange} showSort={showSort} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4">
          {children && cloneElement(children, { sortConfig })}
        </main>
      </div>
    </div>
  );
};

export default Layout;
