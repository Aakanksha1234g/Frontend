import React, { useState, useEffect } from 'react';
import { PreviewIcon, PlayArrowIcon , CrossIcon} from '@shared/layout/icons';
import Button from '@shared/ui/button';
import { useNavigate, useParams } from 'react-router';

export default function StoryDetailsPanel({
  storyList,
  isCollapsed,
  setIsCollapsed,
}) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  // Update on resize
  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Responsive styles for modal or side panel
  const isMobile = screenWidth < 1280;

  return (
    <div
      className={`relative transition-[width] duration-300 ease-in-out responsive-feature-side shadow-md ${
        isCollapsed ? 'w-[15px]' : 'lg:[200px] xl:w-[327px]'
      }`}
    >
      {/* Collapse Toggle Button */}
      <div
        onClick={() => setIsCollapsed(!isCollapsed)}
        role="button"
        className={`absolute  flex items-center justify-center top-[5px] ${
          isCollapsed ? 'left-0 w-[70px]' : 'w-[24px] -right-6'
        } cursor-pointer z-30`}
      >
        {/* {isCollapsed && (
          <div className="bg-[#171717] rounded-xl p-2">
            <PreviewIcon size={24} />
          </div>
        )} */}
        <div className="bg-white/10 rounded-r-2xl p-2">
          <PlayArrowIcon
            direction={isCollapsed ? 'left' : 'right'}
            fill="#E5E5E5"
            width={12}
            height={12}
            className="transition-colors duration-200"
          />
        </div>
      </div>

      {/* Main Panel or Modal */}
      {!isCollapsed && (
        <div
          style={{
            ...(isMobile
              ? {
                  position: 'fixed',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  backdropFilter: 'blur(6px)',
                  zIndex: 50,
                }
              : {
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  borderRight: '1px solid #262626',
                  backgroundColor: '#0A0A0A',
                  height: '933px',
                }),
          }}
        >
          <div
            style={{
              backgroundColor: '#0A0A0A',
              borderRadius: '1rem',
              padding: '0.4rem',
              width: isMobile ? '360px' : '100%',
              height: '80vh',
              maxHeight: window.innerWidth < 1440 ? '80vh' : '100%',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: isMobile ? '0 0 20px rgba(0,0,0,0.3)' : 'none',
              border: isMobile
                ? '1px solid rgba(255,255,255,0.1)'
                : '1px solid #262626',
            }}
          >
            {isMobile && (
              <div className="self-end">
                <Button
                  size="sm"
                  onClick={() => {
                    if (isMobile) setIsCollapsed(true);
                  }}
                  className=" w-auto hover:bg-default-400 text-[#FCFCFC] px-2 rounded-xl text-sm"
                >
                  <CrossIcon size={20} />
                </Button>
              </div>
            )}
            {/* Header */}
            <div className="w-full bg-[#262626] text-[#fcfcfc] px-3 py-2 rounded-lg flex items-center justify-center gap-2">
              <PreviewIcon size={24} />
              <h2 className="font-bold text-sm">Story Details</h2>
            </div>

            {/* Story Content */}
            <div className="flex-1 overflow-y-auto scrollbar-gray mt-3 pr-1 text-white space-y-3">
              <div>
                <h3 className="font-bold text-sm">Title</h3>
                <div className="bg-[#171717] border border-[#27272A] py-2 px-4 rounded-md">
                  <p className="text-[16px] font-bold">
                    {storyList?.story_title?.toUpperCase() || 'Untitled'}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-sm text-[#a3a3a3]">
                  Logline / Story Summary
                </h3>
                <div className="bg-[#171717] border border-[#27272A] py-2 px-4 rounded-md">
                  <p className="text-sm text-[#a3a3a3]">
                    {storyList?.logline || 'No logline'}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-sm text-[#a3a3a3]">Genres</h3>
                <div className="bg-[#171717] border border-[#27272A] py-2 px-4 rounded-md">
                  <p className="text-sm text-[#a3a3a3]">
                    {/* {storyList?.genres?.join(', ') || 'No genres'} */}

                    {storyList?.genres
                      ? storyList.genres
                          .map(theme =>
                            theme
                              .toLowerCase()
                              .split(' ')
                              .map(
                                word =>
                                  word.charAt(0).toUpperCase() + word.slice(1)
                              )
                              .join(' ')
                          )
                          .join(', ')
                      : 'No Genres'}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-sm text-[#a3a3a3]">Themes</h3>
                <div className="bg-[#171717] border border-[#27272A] py-2 px-4 rounded-md">
                  <p className="text-sm text-[#a3a3a3]">
                    {storyList?.themes
                      ? storyList.themes
                          .map(theme =>
                            theme
                              .toLowerCase()
                              .split(' ')
                              .map(
                                word =>
                                  word.charAt(0).toUpperCase() + word.slice(1)
                              )
                              .join(' ')
                          )
                          .join(', ')
                      : 'No Themes'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
