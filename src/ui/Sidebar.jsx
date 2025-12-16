import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import SidebarIcon from '@assets/pitch-craft/Sidebar.svg?react';
import Button from '@ui/Button';
import LogoutIcon from '@assets/icons/Logout 2.svg?react';
import { logout } from '@shared/utils/cookie-store';

export default function SidebarComponent({ navItems, bottomItems }) {
  const [isClosed, setIsClosed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleSidebar = () => setIsClosed(!isClosed);

  const renderLink = ({ id, label, href, Icon }) => {
    const isActive = location.pathname === href;
    const handleClick = e => {
      e.preventDefault();
      if (href !== '#') {
        navigate(href);
      }
    };
  

    return (
      <Button
        onClick={handleClick}
        as="span"
        size="md"
        variant={"primary_sidebar"}
        className={`${isActive ? 'dark:bg-dark-default-main bg-light-accent-soft_hover' : "bg-transparent "} mx-2`}
        title={label}
      >
        <div className="flex items-center justify-center min-w-[3rem] h-10">
          <Icon className={`w-4 h-4 stroke-light-background-inverse dark:stroke-dark-background-inverse ${id==="logout" && "rotate-180"}`} />
        </div>
        <span
          className={`whitespace-nowrap transition-all duration-300 ease-in-out overflow-hidden text-dark-accent-soft_hover dark:text-light-accent-soft_hover 
            ${isClosed ? 'opacity-0 max-w-0' : 'opacity-100 max-w-48'}`}
        >
          {label}
        </span>
      </Button>
    );
  };

  return (
    <nav
      className={`${isClosed ? 'w-16' : 'w-50'} bg-dark-accent-main dark:bg-light-accent-main border-r dark:border-dark-accent-hover border-light-accent-soft_hover min-h-full sticky top-0 flex flex-col transition-all duration-300 ease-in-out overflow-hidden`}
    >
      {/* Top Section */}
      <ul className="space-y-2 flex-1">
        <li className="flex justify-end mb-4 px-4 pt-4">
          <Button
            onClick={toggleSidebar}
            className="p-2"
            variant="transparent"
            title={isClosed ? 'Open' : 'Close'}
          >
            <SidebarIcon className="w-4 h-4 text-light-background-inverse dark:text-dark-background-inverse fill-light-background-inverse dark:fill-dark-background-inverse" />
          </Button>
        </li>
        <hr className="my-2 dark:border-dark-accent-hover border-light-accent-soft_hover" />
        {navItems.map(item => (
          <li key={item.id}>{renderLink(item)}</li>
        ))}
      </ul>

      {/* Bottom Section */}
      {/* <ul className="space-y-2 pb-4">
        {bottomItems.map((item) => (
          <li key={item.id}>{renderLink(item)}</li>
        ))}
      </ul> */}
      <button
        className="mb-3"
        onClick={() => {
          logout();
          navigate(0);
        }}
      >
        {renderLink({
          id: 'logout',
          label: 'Logout',
          href: '/',
          Icon: LogoutIcon,
        })}
      </button>
    </nav>
  );
}
