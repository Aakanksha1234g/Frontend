import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router';
import PitchCraftLogo from '@assets/pitch-craft/PitchCraftLogo.svg?react';
import PitchCraftLogoDark from '@assets/pitch-craft/PitchCraftLogoDark.svg?react';
import Menu from '@assets/pitch-craft/Menu.svg?react';
import ThemeToggle from '../ThemeToggle';
import { useTheme } from '@products/pitch-craft/contexts/ThemeContext';
import { useCanvas } from '@products/pitch-craft/contexts/CanvasContext';
import { useParams } from 'react-router';
import { apiRequest } from '@shared/utils/api-client';
import { useUser } from '@shared/context/user-context';

export default function Controls() {
  const { title, setTitle } = useCanvas();
  const { pitch_id } = useParams();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const { state } = useUser();
  const { profileImage, username } = state;
  const { theme } = useTheme();

  const [localTitle, setLocalTitle] = useState(title || '');
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeout = useRef(null);
  const imageUrl = profileImage
    ? `data:image/jpeg;base64,${profileImage}`
    : `https://i.pravatar.cc/150?u=a042581f4e29026704d=${username}`;  

  // Sync from context only if external change happens
  useEffect(() => {
    if (title !== localTitle) setLocalTitle(title || '');
  }, [title]);

  const handleChange = e => {
    const newTitle = e.target.value.slice(0, 60);
    setLocalTitle(newTitle);

    // Debounce saving to avoid constant rerenders
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      saveTitle(newTitle);
    }, 5000);
  };

  const saveTitle = async newTitle => {
    try {
      setIsSaving(true);
      setTitle(newTitle); // update context after save starts

      await apiRequest({
        baseURL: import.meta.env.VITE_API_BASE_URL,
        endpoint: '/edit_pitch_title',
        method: 'PUT',
        body: { pitch_id, pitch_title: newTitle },
        successMessage: 'Pitch title updated successfully',
      });

      console.log('Pitch title updated:', newTitle);
    } catch (err) {
      console.error('Failed to update pitch title:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Optional blur handler (instant save when leaving input)
  const handleBlur = () => {
    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
    }
    saveTitle(localTitle);
  };

  return (
    <div className="bg-light-default-main dark:bg-dark-default-main rounded-2xl mx-2 my-2 max-w-screen">
      <div className="flex items-center justify-between h-12 px-2 rounded-t-2xl relative">
        {/* Left section */}
        <div className="flex items-center flex-1">
          <Link to="/pitch-craft">
            {theme === "dark" ? <PitchCraftLogo alt="PitchCraft-logo" className="h-8 w-24 object-fit" /> : <PitchCraftLogoDark alt="PitchCraft-logo" className="h-8 w-24" />}
          </Link>
        </div>

        {/* Center section - positioned absolutely with offset to the right */}
        <div className="absolute left-1/2 transform -translate-x-1/2 ml-8 flex items-center gap-2 text-light-text dark:text-dark-text">
          <h1 className="text-sm font-extralight whitespace-nowrap">
            Project Title <span className="text-sm font-thin">|</span>
          </h1>
          <input
            id='pitchCraftProjectTitle'
            value={localTitle}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isSaving}
            style={{ width: `${Math.max(150, localTitle.length * 8 + 20)}px` }}
            className="text-sm outline-none font-bold rounded px-2 py-1 disabled:opacity-50 dark:text-white text-black placeholder-gray-500 bg-light-default-main dark:bg-dark-default-main"
            placeholder="Enter title..."
            maxLength={60}
          />
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2 flex-1 justify-end">
          <button className="dark:bg-dark-accent-hover bg-light-accent-hover p-1.5 rounded-md">
            <Menu alt="menu" className="h-5 w-6" />
          </button>
          <ThemeToggle />
          <div
            className="flex items-center relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <button
              className="h-8 w-8 rounded-full overflow-hidden flex items-center justify-center"
              onClick={() => navigate('/edit-profile')}
            >
              <img
                src={imageUrl}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            </button>

            {isHovered && (
              <div className="absolute z-50 px-2 py-1 bg-white text-sm rounded-md shadow-md shadow-shadow-chat-button whitespace-nowrap opacity-0 transition-opacity duration-200 ease-in-out top-full left-1/2 mt-1 transform -translate-x-1/2 text-xs text-black opacity-100">
                Profile
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
