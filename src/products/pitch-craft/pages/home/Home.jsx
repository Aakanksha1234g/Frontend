import FetchProjects from '../FetchProjects';
import Templates from './Templates';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import Button from '@ui/Button';
import Heading from '@ui/Heading';
import { useApplyTemplates } from '@products/pitch-craft/contexts/TemplatesContext';

export default function PitchCraftHomePage({ sortConfig }) {
  const [showProjects, setShowProjects] = useState(true);
  const navigate = useNavigate();
  const { showTemplates } = useApplyTemplates();

  useEffect(() => {
    setShowProjects(!showTemplates);
  }, [showTemplates]);

  return (
    <div className={`h-full w-full max-h-full overflow-y-auto ${localStorage.getItem("theme") === "dark" ? "scrollbar-black": "scrollbar-custom"} p-4`}>
      <Heading className="leading-7">
        {' '}
        WELCOME TO{' '}
        <Heading as="span" fontWeight={'bold'} className="text-xl">
          PITCH CRAFT
        </Heading>
      </Heading>
      <Heading size="sm" fontWeight="normal" margin="mb4">
        Pitch your Story through Creativity
      </Heading>
      <hr className="dark:border-dark-accent-hover border-light-accent-soft_hover border-1 mb-4" />
      <div className="flex w-full items-center justify-center bg-gradient-to-tl dark:from-[#fff/80] from-[#B6B6B6] dark:to-[#999] to-[#E6E6E6] rounded-2xl p-[1px]">
        <div className="flex flex-col w-full items-center justify-center bg-gradient-to-b dark:bg-gradient-to-t dark:from-[#0a0a0a] dark:from-10% from-20% from-white dark:to-[#1a1f27] dark:to-50% to-75% to-light-accent-soft_hover rounded-2xl">
          <Templates
            showProjects={showProjects}
            setShowProjects={setShowProjects}
          />
        </div>
      </div>
      {showProjects && (
        <div>
          <div>
            <div className="mt-12">
              <div className="flex justify-between items-center">
                <div>
                  <Heading as="h2" fontWeight={'bold'}>
                    RECENT PROJECTS
                  </Heading>
                  <Heading as="p" size="sm" fontWeight={'normal'} margin="mb4">
                    Unleash your Creativity. Pitch your Ideas.
                  </Heading>
                </div>
                <Button
                  onClick={() => navigate('/pitch-craft/projects')}
                  className="mx-2 text-xs"
                  size="sm"
                  variant="primary"
                >
                  View More →
                </Button>
              </div>
            </div>
            <hr className="dark:border-dark-accent-hover border-light-accent-soft_hover border-1 mb-4" />
          </div>
          <FetchProjects
            sortConfig={
              sortConfig || {
                sortBy: 'Date Created',
                sortOrder: 'Newest First',
              }
            }
            isHomePage={true}
          />
        </div>
      )}
    </div>
  );
}
