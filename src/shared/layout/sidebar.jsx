import { useState, useMemo , useEffect} from 'react';
import { useLocation, useNavigate } from 'react-router';
import {
  LogoutIcon,
  HomeIcon,
  AllProjectsIcon,
  SidebarCollapseIcon,
} from './icons';
import { logout } from '@shared/utils/cookie-store';
import Button from '../ui/button';
import IconButtonWithTooltip from '@shared/ui/IconButtonWithTooltip';

export default function Sidebar({
  productHeaderHeight = 64,
  isCollapsed: isCollapsedProp,
  setIsCollapsed: setIsCollapsedProp,
  widthCollapsed = 44, // px
  widthExpanded = 172, // px
}) {
  const [isCollapsed, setIsCollapsed] = useState(
    window.innerWidth < 1440 ? true : (isCollapsedProp ?? false)
  );

  const location = useLocation();
  const navigate = useNavigate();
  const pathname = window.location.pathname;
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const navbarHeight = useMemo(() => (window.innerWidth >= 1920 ? 64 : 54), []);

  const cineScribeNavigation = [
    { path: '/cine-scribe', icon: HomeIcon, label: 'Home' },
    {
      path: '/cine-scribe/story-generation',
      icon: AllProjectsIcon,
      label: 'All Projects',
    },
  ];

  const scriptWritingNavigation = [
    { path: '/cine-scribe', icon: HomeIcon, label: 'Home' },
    {
      path: '/cine-scribe/script-writing',
      icon: AllProjectsIcon,
      label: 'All Projects',
    },
  ];

  const pitchCraftNavigation = [
    { path: '/pitch-craft', icon: HomeIcon, label: 'Home' },
  ];

  const navigation = useMemo(() => {
    if (pathname.includes('/cine-scribe/story-generation'))
      return cineScribeNavigation;
    else if (pathname.includes('/cine-scribe/script-writing'))
      return scriptWritingNavigation;
    else if (pathname.includes('/pitch-craft')) return pitchCraftNavigation;
    return [];
  }, [pathname]);

  const bottomNavigation = [{ path: '/', icon: LogoutIcon, label: 'Logout' }];

  const handleBottomNavClick = item => {
    if (item.label === 'Logout') setShowLogoutConfirm(true);
    else navigate(item.path);
  };

  const handleConfirmLogout = () => {
    logout();
    navigate('/');
  };

  const handleCancelLogout = () => setShowLogoutConfirm(false);

  const collapsed =
    isCollapsedProp !== undefined ? isCollapsedProp : isCollapsed;
  const toggleCollapsed = () => {
    if (setIsCollapsedProp) setIsCollapsedProp(!collapsed);
    else setIsCollapsed(!collapsed);
  };

 const renderIcon = icon => {
   if (!icon) return null;
   const IconComponent = icon;
   return (
     <div className="cursor-pointer">
       <IconComponent size={24} color="#FAFAFA" />
     </div>
   );
 };


  const [isMobileSidebar, setIsMobileSidebar] = useState(
    window.innerWidth < 1440
  );

  useEffect(() => {
    const handleResize = () => setIsMobileSidebar(window.innerWidth < 1440);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderNavItem = item => {
    if (item.children) {
      return (
        <details
          className={`group relative  flex flex-col px-2 items-center ${collapsed ? 'justify-center' : 'justify-start'
            } w-full transition-all duration-300`}
        >
          <summary
            className={`flex items-center justify-center py-1 ${!collapsed ? 'pr-2 w-full' : 'px-1'
              } rounded-lg transition-all duration-300 ${location.pathname === item.path ||
                item.children.some(child => location.pathname === child.path)
                ? 'bg-default-100'
                : 'hover:bg-default-200'
              }`}
          >
            <div
              className="relative flex items-center  justify-center"
              onClick={() => setIsCollapsed(false)}
            >
              {renderIcon(item.icon)}
              {collapsed && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2 py-1 bg-white shadow-md text-sm rounded-md hidden group-hover:block z-50">
                  {item.label}
                </div>
              )}
            </div>
            {!collapsed && (
              <>
                <span className="ml-2 text-sm">{item.label}</span>
                <span className="ml-auto transform group-open:rotate-180 transition-transform duration-300">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </span>
              </>
            )}
          </summary>
          {!collapsed && item.children && (
            <div className="w-full relative pl-6 ml-1 before:absolute before:left-3 before:top-0 before:bottom-0 before:w-[2px] before:bg-gray-100">
              {item.children.map((child, index) => (
                <div
                  key={`${child.path}-${index}`}
                  onClick={() => navigate(child.path)}
                  className={`relative block pl-2 py-1 m-1 w-[80%] text-sm rounded-lg cursor-pointer ${location.pathname === child.path
                      ? 'bg-default-100'
                      : 'hover:bg-default-200'
                    }`}
                >
                  {child.label}
                  <div className="absolute left-[-14px] top-1/2 transform -translate-y-1/2 w-3 h-[2px] bg-gray-200"></div>
                </div>
              ))}
            </div>
          )}
        </details>
      );
    }

    return (
      <div
        key={item.path}
        onClick={() =>
          item.label === 'Logout'
            ? setShowLogoutConfirm(true)
            : navigate(item.path)
        }
        className={`relative m-1 py-1 text-sm rounded-lg flex ${
          collapsed ? 'justify-center' : 'justify-start'
        } items-center transition-all duration-300 ${
          location.pathname === item.path
            ? 'bg-default-100'
            : 'hover:bg-default-200'
        }`}
      >
        <div className="relative group">
          {renderIcon(item.icon)}
          {collapsed && (
            <div className="absolute left-full top-1/2 ml-3 px-2 py-1 shadow-md  bg-[#1B1B1B] border border-white/30 text-xs text-[#fcfcfc] rounded-md group-hover:block hidden text-nowrap z-50">
              {item.label}
            </div>
          )}
        </div>
        {!collapsed && (
          <span className="ml-2 transition-opacity duration-300">
            {item.label}
          </span>
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        width: `${collapsed ? widthCollapsed : widthExpanded}px`,
        padding: '10px',
        position: isMobileSidebar ? 'fixed' : 'relative',
        left: isMobileSidebar ? 0 : 'auto',
        top: isMobileSidebar ? `${productHeaderHeight}px` : 'auto',
        height: isMobileSidebar
          ? `calc(100vh - ${productHeaderHeight}px)`
          : '100%',
        bottom: 0,
        zIndex: 50,
      }}
      className={`bg-[#0A0A0A] text-white transition-all duration-300 flex flex-col border-r border-default-200`}
    >
      {/* Collapse / Expand Toggle */}
      <div
        onClick={toggleCollapsed}
        className={`flex items-center mb-1 ${
          collapsed ? 'justify-center' : 'justify-end pr-4'
        } cursor-pointer`}
      >
        <IconButtonWithTooltip
          iconComponent={SidebarCollapseIcon}
          iconProps={{ color: '#FAFAFA', size: 20 }}
          tooltipText={isCollapsed ?  'Open':'Close' }
          position="right"
          iconButton={false}
        />
        {/* <SidebarCollapseIcon size={20} color="#FAFAFA" /> */}
      </div>

      <hr className="w-[90%] self-center border  border-default-300 mb-3" />

      {/* Navigation */}
      {/* <nav className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden">
        {navigation.map((item, index) => (
          <div key={index}>{renderNavItem(item)}</div>
        ))}
      </nav> */}
      <div className="flex-1 flex flex-col">
        {navigation.map((item, index) => (
          <div key={index}>{renderNavItem(item)}</div>
        ))}
      </div>

      {/* Bottom Navigation */}

      <div className="mt-auto border-t border-default-200 p-2">
        {bottomNavigation.map((item, index) => renderNavItem(item))}
      </div>

      {/* Logout modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-70 bg-black/50 backdrop-blur-md">
          <div className="bg-[#1B1B1B] text-sm px-6 py-5 rounded-xl shadow-pop-up min-w-[250px] max-h-screen overflow-y-auto flex flex-col items-center justify-start gap-4">
            <p className="text-center text-sm text-primary-gray-900">
              Are you sure, you want to logout?
            </p>
            <div className="w-full flex items-center justify-center gap-2">
              <Button
                size="md"
                onClick={handleConfirmLogout}
                className="bg-[#EB5545] hover:bg-[#EB5545]/80 text-[#FCFCFC] cursor-pointer"
              >
                Logout
              </Button>
              <Button
                size="md"
                onClick={handleCancelLogout}
                className="bg-[#262626] hover:bg-default-400 text-[#FCFCFC] cursor-pointer"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}