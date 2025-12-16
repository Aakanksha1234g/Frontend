import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { useUser } from '@shared/context/user-context';
import LorvenLogo from '@assets/pitch-craft/LorvenLogo.svg?react';
import PitchCraftLogo from '@assets/pitch-craft/PitchCraftLogo.svg?react';
import LorvenLogoDark from '@assets/pitch-craft/LorvenLogoDark.svg?react';
import PitchCraftLogoDark from '@assets/pitch-craft/PitchCraftLogoDark.svg?react';
import ThemeToggle from './ThemeToggle';
import { useTheme } from "../contexts/ThemeContext";
import Menu from '@assets/pitch-craft/Menu.svg?react';
import Sort from '@assets/pitch-craft/Sort.svg?react';
import Add from '@assets/pitch-craft/Add.svg?react';
import CreateNewProject from './home/CreateNewProject';
import { useApplyTemplates } from '../contexts/TemplatesContext';
import Button from '@ui/Button';
import Templates from './home/Templates';

export default function NavbarComponent({ onSortChange, showSort = true }) {
  const navigate = useNavigate();
  const { state } = useUser();
  const { profileImage, username } = state;
  const [isHovered, setIsHovered] = useState(false);
  const { theme } = useTheme();

  const imageUrl = profileImage
    ? `data:image/jpeg;base64,${profileImage}`
    : `https://i.pravatar.cc/150?u=a042581f4e29026704d=${username}`;
  const [sortOpen, setSortOpen] = useState(false);
  const [sortBy, setSortBy] = useState('Date Created');
  const [sortOrder, setSortOrder] = useState('Newest First');
  const {
    templateId,
    setTemplateId,
    isNewProjectOpen,
    setIsNewProjectOpen,
    setShowTemplates,
  } = useApplyTemplates();

  // Handle modal open/close when templateId changes
  useEffect(() => {
    if (templateId !== null) {
      setIsNewProjectOpen(true);
    } else {
      setIsNewProjectOpen(false);
    }
  }, [templateId, setIsNewProjectOpen]);

  // Get order options based on sort type
  const getOrderOptions = () => {
    return sortBy === 'Alphabetical'
      ? ['A-Z', 'Z-A']
      : ['Oldest First', 'Newest First'];
  };

  // Reset sort order when changing sort type
  const handleSortByChange = option => {
    setSortBy(option);
    const newSortOrder = option === 'Alphabetical' ? 'A-Z' : 'Oldest First';
    setSortOrder(newSortOrder);
    if (onSortChange) onSortChange({ sortBy: option, sortOrder: newSortOrder });
  };

  const handleSortOrderChange = option => {
    setSortOrder(option);
    if (onSortChange) onSortChange({ sortBy, sortOrder: option });
  };

  return (
    <div className="flex flex-col bg-white dark:bg-dark-default-main rounded-2xl mx-2 my-2 max-w-screen">
      {/* New Project Modal */}
      {isNewProjectOpen &&
        (templateId !== null ? (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
            onClick={() => {
              setIsNewProjectOpen(false);
              setTemplateId(null);
              setShowTemplates(false);
            }}
          >
            <div
              className="relative max-w-7xl w-[95%] max-h-[95vh] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <CreateNewProject
                onClose={() => {
                  setIsNewProjectOpen(false);
                  setTemplateId(null);
                  setShowTemplates(false);
                }}
              />
            </div>
          </div>
        ) : (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
            onClick={() => {
              setIsNewProjectOpen(false);
              setTemplateId(null);
              setShowTemplates(false);
            }}
          >
            <div
              className="relative w-[95%] max-w-7xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-gradient-to-tl dark:from-[#fff/80] dark:to-[#999] from-[#B6B6B6] to-[#E6E6E6] p-[1px] rounded-2xl">
                <div className={`bg-gradient-to-tl max-h-[95vh] h-fit  overflow-y-auto w-full rounded-3xl relative overflow-y-auto ${localStorage.getItem("theme") === "dark" ? "scrollbar-black": "scrollbar-custom"} dark:bg-black bg-white px-6 pt-1 overflow-y-auto overflow-x-hidden dark:from-[#0a0a0a] dark:to-[#1a1f27] bg-light-default-main rounded-2xl`}>
                  <Templates showProjects={false} />
                </div>
              </div>
            </div>
          </div>
        ))}

      {/* Navbar */}
      <div className="flex items-center justify-between h-12 px-2 rounded-t-2xl">
        <Link to="/">
          {theme === "dark" ? <LorvenLogo alt="lorven-logo" className="h-6" /> : <LorvenLogoDark alt="lorven-logo" className="h-6" />}
        </Link>

        <div className="flex items-center gap-2">
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

      {/* Bottom Navbar */}
      <div className="flex items-center justify-between h-12 px-2 border-t dark:border-dark-accent-hover border-light-accent-hover rounded-b-2xl relative">
        <Button type='click' variant='transparent' onClick={() => navigate('/pitch-craft')}>
          {theme === "dark" ? <PitchCraftLogo alt="PitchCraft-logo" className="h-8 w-24 object-fit" /> : <PitchCraftLogoDark alt="PitchCraft-logo" className="h-8 w-24" />}
        </Button>
        <div className="flex items-center gap-2">
          {showSort && (
            <div className="relative">
              <Button
                onClick={() => setSortOpen(!sortOpen)}
                className="gap-2 px-2 py-2 font-medium"
                variant="transparent"
                size="md"
                title="Sort"
              >
                <span>Sort</span>
                <Sort alt="sort" className="h-4 fill-light-background-inverse dark:fill-dark-background-inverse" />
              </Button>
              {sortOpen && (
                <div
                  className="absolute right-0 top-full mt-1 w-48 dark:text-dark-text text-light-text dark:bg-dark-accent-hover bg-light-accent-hover rounded-lg overflow-hidden z-50"
                  onClick={e => e.stopPropagation()}
                >
                  {/* Sort options */}
                  <div className="py-2">
                    <div className="px-4 py-2 text-xs font-medium">
                      Sort by
                    </div>
                    {['Alphabetical', 'Date Created'].map(opt => (
                      <button
                        key={opt}
                        onClick={() => handleSortByChange(opt)}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-dark-foreground-muted stroke-light-text dark:stroke-dark-text transition-colors"
                      >
                        <svg
                          className={`h-4 w-4 ${sortBy === opt ? 'opacity-100' : 'opacity-0'}`}
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span>{opt}</span>
                      </button>
                    ))}
                  </div>
                  <div className="py-2 border-t dark:border-white/10 border-light-accent-soft_hover">
                    <div className="px-4 py-2 text-xs font-medium">
                      {sortBy === 'Alphabetical'
                        ? 'Alphabetical Order'
                        : 'Date Order'}
                    </div>
                    {getOrderOptions().map(opt => (
                      <button
                        key={opt}
                        onClick={() => handleSortOrderChange(opt)}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-dark-foreground-muted transition-colors"
                      >
                        <div
                          className={`h-4 w-4 rounded-full border-2 flex items-center justify-center dark:border-dark-text border-light-text`}
                        >
                          {sortOrder === opt && (
                            <div className="h-2 w-2 rounded-full dark:bg-dark-text bg-light-text" />
                          )}
                        </div>
                        <span>{opt}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <Button
            onClick={() => {
              setIsNewProjectOpen(true);
              setShowTemplates(true);
            }}
            className={'border-1 border-white/10 dark:bg-dark-default-main dark:hover:bg-white/10 bg-light-accent-soft_hover hover:bg-light-accent-soft_hover/50 gap-2 mx-2 px-2 py-1.5'}
            title="Create new project"
          >
            <Add alt="add" className="h-5 w-5 fill-light-background-inverse dark:fill-dark-background-inverse" />
            <span>New Project</span>
          </Button>
        </div>
      </div>

      {/* Click outside to close sort dropdown */}
      {sortOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setSortOpen(false)}
        ></div>
      )}
    </div>
  );
}