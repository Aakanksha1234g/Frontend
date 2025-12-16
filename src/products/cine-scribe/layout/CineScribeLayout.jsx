import React, { useMemo } from 'react';
import Sidebar from '@shared/layout/sidebar';
import Navbar from '@shared/layout/navbar';
import ProductHeader from '@shared/layout/product-header';
import { Outlet } from 'react-router';
import {
  ProductHeaderProvider,
  useProductHeader,
} from '../contexts/ProductHeaderContext';

function HeaderWithProps() {
  const { headerProps } = useProductHeader();
  return <ProductHeader {...headerProps} />;
}

export default function CineScribeLayout() {
  const productHeaderHeight = useMemo(
    () => (window.innerWidth >= 1920 ? 70 : 68),
    []
  );

  const navbarHeight = useMemo(() => (window.innerWidth >= 1920 ? 64 : 54), []);
  const contentHeight = `calc(100vh - ${navbarHeight + productHeaderHeight}px)`;

  return (
    <div className="flex w-full bg-[#0A0A0A] overflow-hidden">
      {/* Fixed Navbar */}
      <div
        className="fixed top-0 left-0 right-0 z-50"
        style={{ height: `${navbarHeight}px` }}
      >
        <Navbar />
      </div>

      {/* Main Section below Navbar */}
      <div
        className="flex-1 flex flex-col w-full"
        style={{ marginTop: `${navbarHeight}px` }}
      >
        <ProductHeaderProvider>
          <div className="flex flex-col min-h-screen bg-[#0A0A0A]">
            {/* ProductHeader */}
            <div
              style={{ height: productHeaderHeight }}
              className="w-full shrink-0"
            >
              <HeaderWithProps />
            </div>

            {/* Sidebar + Main Content */}
            <div className="flex flex-1 overflow-hidden">
              {/* Sidebar */}
              <aside
                style={{ height: contentHeight }}
                className="flex-shrink-0"
              >
                <Sidebar
                  productHeaderHeight={productHeaderHeight + navbarHeight}
                />
              </aside>

              {/* Scrollable Outlet */}
              <main
                className="flex-1 overflow-y-auto scrollbar-gray bg-[#0A0A0A]"
                style={{ height: contentHeight }}
              >
                <Outlet />
              </main>
            </div>
          </div>
        </ProductHeaderProvider>
      </div>
    </div>
  );
}
