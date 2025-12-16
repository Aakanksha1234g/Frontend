import React from 'react';
import { Outlet } from 'react-router';

const Layout = () => {
  return (
    <div className="flex flex-col max-h-screen w-full overflow-auto bg-primary-base">
      <Outlet />
    </div>
  );
};

export default Layout;
