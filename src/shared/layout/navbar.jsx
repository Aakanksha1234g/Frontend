import React, { useState, useRef, useEffect } from 'react';
import lorvenLogo from '/logo_w.svg';
import { useNavigate } from 'react-router';
import { useUser } from '@shared/context/user-context';
import { ThemeSwitch } from './theme-switcher';
import { SidebarIcon } from './icons';
import IconButtonWithTooltip from '@shared/ui/IconButtonWithTooltip';

const features = [
  {
    title: 'Cine Scribe',
    imageSrc: '/product_logo/cine scribe.jpg',
    redirectUrl: '/cine-scribe',
  },
  {
    title: 'Cine Sketch',
    imageSrc: '/product_logo/cine sketch.jpg',
    redirectUrl: '/',
  },
  {
    title: 'Pitch Craft',
    imageSrc: '/product_logo/pitch craft.jpg',
    redirectUrl: '/pitch-craft',
  },
  {
    title: 'Cine Flow',
    imageSrc: '/product_logo/cine flow.jpg',
    redirectUrl: '/',
  },
];

export default function Navbar() {
  const navigate = useNavigate();
  const { state } = useUser();
  const { profileImage } = state;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  console.log('Profile Image:', profileImage);

  const imageUrl = profileImage
    ? `data:image/jpeg;base64,${profileImage}`
    : `https://avatar.iran.liara.run/public/girl?username=${state.username}`;

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative flex justify-between items-center px-4 mx-1 bg-default-300 rounded-t-xl h-full border-b border-default-200">
      {/* Logo */}
      <img
        onClick={() => navigate('/home')}
        src={lorvenLogo}
        alt="Lorven Logo"
        style={{
          width: '150px',
          height: 'auto',
          cursor: 'pointer',
        }}
      />

      <div
        className="flex gap-2 justify-between items-center relative"
        ref={dropdownRef}
      >
        {/* Sidebar Menu Icon */}
        <div className="relative ">
          <IconButtonWithTooltip
            iconComponent={SidebarIcon}
            iconProps={{ color: '#737373', size: 22 }}
            tooltipText={'Menu'}
            position="bottom"
            iconButton={true}
            onClick={() => setIsDropdownOpen(prev => !prev)}
          />

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#171717]  rounded-xl shadow-lg p-3 grid grid-cols-2 gap-1 z-50">
              {features.map(feature => (
                <div
                  key={feature.title}
                  className="cursor-pointer flex flex-col items-center text-center transition-all"
                  onClick={() => {
                    navigate(feature.redirectUrl);
                    setIsDropdownOpen(false);
                  }}
                >
                  <img
                    src={feature.imageSrc}
                    alt={feature.title}
                    className="object-cover rounded-lg mb-2"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Theme Switch */}
        <ThemeSwitch />

        {/* Profile Icon */}
        <IconButtonWithTooltip
          imageUrl={imageUrl}
          altText={'Profile'}
          tooltipText={'Profile'}
          position="bottom"
          onClick={() => navigate('/edit-profile')}
          iconButton={false}
        />
      </div>
    </div>
  );
}
